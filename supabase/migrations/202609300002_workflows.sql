BEGIN;
ALTER TABLE public.referrals ADD COLUMN source_referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL;
ALTER TABLE public.newsletter_subscribers ADD COLUMN source text NOT NULL DEFAULT 'account';
CREATE FUNCTION public.attach_referral(uid uuid,code text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE origin public.referrals%ROWTYPE; prior public.referrals%ROWTYPE;
BEGIN
 PERFORM 1 FROM public.profiles WHERE user_id=uid AND disabled_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'account_disabled'; END IF;
 SELECT r.* INTO origin FROM public.referrals r JOIN public.profiles p ON p.user_id=r.referrer_user_id WHERE r.referral_code=code AND r.referred_user_id IS NULL AND p.disabled_at IS NULL;
 IF NOT FOUND OR origin.referrer_user_id=uid THEN RAISE EXCEPTION 'invalid_referral'; END IF;
 SELECT * INTO prior FROM public.referrals WHERE referred_user_id=uid;
 IF FOUND THEN IF prior.source_referral_id=origin.id THEN RETURN; ELSE RAISE EXCEPTION 'referral_already_set'; END IF; END IF;
 IF EXISTS(SELECT 1 FROM public.payments WHERE user_id=uid AND status IN ('PAID','PARTIALLY_REFUNDED','REFUNDED')) THEN RAISE EXCEPTION 'referral_after_purchase'; END IF;
 INSERT INTO public.referrals(referral_code,referrer_user_id,referred_user_id,source_referral_id) VALUES(replace(gen_random_uuid()::text,'-',''),origin.referrer_user_id,uid,origin.id);
 INSERT INTO public.audit_logs(actor_id,action,target_id) VALUES(uid,'REFERRAL_ATTACHED',uid);
END; $$;
CREATE FUNCTION public.convert_referral(uid uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE changed uuid;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.payments WHERE user_id=uid AND status='PAID' AND amount>0) THEN RETURN; END IF;
 UPDATE public.referrals SET status='CONVERTED',converted_at=now() WHERE referred_user_id=uid AND status='PENDING' RETURNING id INTO changed;
 IF changed IS NOT NULL THEN
  INSERT INTO public.audit_logs(actor_id,action,target_id) VALUES(uid,'REFERRAL_CONVERTED',uid);
  IF (SELECT granted FROM public.consents WHERE user_id=uid AND category='analytics' ORDER BY revision DESC LIMIT 1) THEN
   INSERT INTO public.outbox(dedupe_key,user_id,kind) VALUES('referral:'||changed,uid,'analytics:referral_converted') ON CONFLICT(dedupe_key) DO NOTHING;
  END IF;
 END IF;
END; $$;
CREATE FUNCTION public.on_paid_referral() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 IF NEW.user_id IS NOT NULL AND NEW.status='PAID' THEN PERFORM public.convert_referral(NEW.user_id); END IF;RETURN NEW;
END; $$;
CREATE TRIGGER paid_referral AFTER INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.on_paid_referral();
CREATE FUNCTION public.register_lead(uid uuid,email_address text,source_name text,attribution_data jsonb,version text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE allowed boolean;
BEGIN
 PERFORM 1 FROM public.profiles WHERE user_id=uid AND disabled_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'account_disabled'; END IF;
 SELECT granted AND policy_version=version INTO allowed FROM public.consents WHERE user_id=uid AND category='analytics' ORDER BY revision DESC LIMIT 1;
 INSERT INTO public.leads(user_id,email,source,attribution) VALUES(uid,email_address,source_name,CASE WHEN allowed THEN attribution_data ELSE '{}'::jsonb END)
 ON CONFLICT(user_id) DO UPDATE SET source=excluded.source,attribution=excluded.attribution,email=excluded.email;
END; $$;
CREATE FUNCTION public.prepare_jobs() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE queued integer;
BEGIN
 INSERT INTO public.outbox(dedupe_key,user_id,kind,payload)
 SELECT 'expiring:'||s.id||':'||extract(epoch FROM s.current_period_end)::text,s.user_id,'subscription_expiring',jsonb_build_object('subscription_id',s.id,'period_end',s.current_period_end)
 FROM public.subscriptions s JOIN public.profiles p ON p.user_id=s.user_id WHERE p.disabled_at IS NULL AND s.status IN ('ACTIVE','TRIALING') AND s.cancel_at_period_end AND s.current_period_end>now() AND s.current_period_end<=now()+interval '3 days'
 ON CONFLICT(dedupe_key) DO NOTHING;
 GET DIAGNOSTICS queued=ROW_COUNT;
 -- Only expired transient quotas/leases. Financial, consent and audit retention is owner-configured, not guessed.
 DELETE FROM public.rate_limits WHERE reset_at<now()-interval '1 day';
 DELETE FROM public.billing_locks WHERE expires_at<now()-interval '1 day';
 RETURN queued;
END; $$;
CREATE FUNCTION public.admin_change(actor uuid,target uuid,operation text,new_role text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE super boolean;
BEGIN
 PERFORM 1 FROM public.profiles WHERE user_id=actor AND disabled_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'forbidden'; END IF;
 SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=actor AND role='SUPER_ADMIN') INTO super;
 IF NOT super AND (operation<>'disable' OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=actor AND role='ADMIN')) THEN RAISE EXCEPTION 'forbidden'; END IF;
 PERFORM 1 FROM public.profiles WHERE user_id=target FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'target_missing'; END IF;
 IF operation='disable' THEN
  IF actor=target THEN RAISE EXCEPTION 'cannot_disable_self'; END IF;
  IF NOT super AND EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=target AND role IN ('ADMIN','SUPER_ADMIN')) THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.profiles SET disabled_at=now() WHERE user_id=target;
  INSERT INTO public.audit_logs(actor_id,action,target_id) VALUES(actor,'ACCOUNT_DISABLED',target);
 ELSIF operation='role' THEN
  INSERT INTO public.user_roles(user_id,role) VALUES(target,new_role) ON CONFLICT DO NOTHING;
  INSERT INTO public.audit_logs(actor_id,action,target_id,metadata) VALUES(actor,'ROLE_CHANGED',target,jsonb_build_object('added_role',new_role));
 ELSE RAISE EXCEPTION 'invalid_operation';END IF;
END; $$;
REVOKE ALL ON FUNCTION public.attach_referral(uuid,text),public.convert_referral(uuid),public.on_paid_referral(),public.register_lead(uuid,text,text,jsonb,text),public.prepare_jobs(),public.admin_change(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.attach_referral(uuid,text),public.convert_referral(uuid),public.on_paid_referral(),public.register_lead(uuid,text,text,jsonb,text),public.prepare_jobs(),public.admin_change(uuid,uuid,text,text) TO service_role;
GRANT SELECT ON public.coupon_redemptions,public.referral_rewards TO authenticated;
CREATE POLICY own_coupon_redemptions ON public.coupon_redemptions FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY own_referral_rewards ON public.referral_rewards FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.referrals r WHERE r.id=referral_id AND r.referrer_user_id=auth.uid()));
COMMIT;
