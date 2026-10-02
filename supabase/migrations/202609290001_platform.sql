-- Forward-only production migration; rollback guidance is in docs/platform/database.md.
BEGIN;
CREATE TABLE public.profiles(user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, display_name text CHECK(length(display_name)<=100),grade smallint CHECK(grade BETWEEN 1 AND 12),exam_type text CHECK(exam_type IN ('EN','BAC')),disabled_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.roles(code text PRIMARY KEY CHECK(code IN ('STUDENT','PARENT','TEACHER','ADMIN','SUPER_ADMIN')));
INSERT INTO public.roles VALUES ('STUDENT'),('PARENT'),('TEACHER'),('ADMIN'),('SUPER_ADMIN');
CREATE TABLE public.user_roles(user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,role text REFERENCES public.roles(code),created_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(user_id,role));
CREATE TABLE public.plans(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),code text UNIQUE NOT NULL,name text NOT NULL,active boolean NOT NULL DEFAULT true,is_default boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now());
CREATE UNIQUE INDEX one_default_plan ON public.plans(is_default) WHERE is_default;
INSERT INTO public.plans(code,name,is_default) VALUES('FREE','Free',true),('PREMIUM','Premium',false),('PREMIUM_PLUS','Premium Plus',false);
CREATE TABLE public.prices(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),plan_id uuid NOT NULL REFERENCES public.plans(id),stripe_price_id text UNIQUE NOT NULL,interval text NOT NULL CHECK(interval IN ('month','year')),currency text NOT NULL CHECK(currency ~ '^[a-z]{3}$'),unit_amount integer NOT NULL CHECK(unit_amount>=0),active boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.features(key text PRIMARY KEY,description text NOT NULL);
INSERT INTO public.features VALUES ('premium_content','Premium content access'),('unlimited_exercises','Unrestricted exercise quota'),('advanced_tests','Advanced tests'),('bac_generator','Future BAC generator'),('ai_tutor','Future AI tutor'),('pdf_downloads','Private document downloads'),('advanced_statistics','Advanced learning statistics');
CREATE TABLE public.plan_features(plan_id uuid REFERENCES public.plans(id),feature_key text REFERENCES public.features(key),PRIMARY KEY(plan_id,feature_key));
-- No pricing or paid feature matrix invented. Configure approved mappings before checkout.
CREATE TABLE public.billing_customers(user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE SET NULL,stripe_customer_id text UNIQUE NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
-- user_id must be nullable for financial retention; use an independent primary key.
ALTER TABLE public.billing_customers DROP CONSTRAINT billing_customers_pkey;
ALTER TABLE public.billing_customers ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.billing_customers ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE public.billing_customers ADD UNIQUE(user_id);
CREATE TABLE public.checkout_sessions(user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,stripe_session_id text UNIQUE,request_id uuid NOT NULL,price_id uuid NOT NULL REFERENCES public.prices(id),created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.subscriptions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,stripe_subscription_id text UNIQUE NOT NULL,plan_id uuid NOT NULL REFERENCES public.plans(id),status text NOT NULL CHECK(status IN ('ACTIVE','TRIALING','PAST_DUE','CANCELLED','EXPIRED','INCOMPLETE')),current_period_start timestamptz,current_period_end timestamptz,cancel_at_period_end boolean NOT NULL DEFAULT false,last_event_created bigint NOT NULL DEFAULT 0,updated_at timestamptz NOT NULL DEFAULT now(),created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX subscriptions_user ON public.subscriptions(user_id);
CREATE TABLE public.subscription_events(id text PRIMARY KEY,subscription_id uuid REFERENCES public.subscriptions(id),type text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.payments(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,stripe_invoice_id text UNIQUE,stripe_payment_intent_id text UNIQUE,stripe_charge_id text UNIQUE,status text NOT NULL CHECK(status IN ('PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED')),amount integer NOT NULL CHECK(amount>=0),amount_refunded integer NOT NULL DEFAULT 0 CHECK(amount_refunded>=0),currency text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX payments_user ON public.payments(user_id);
CREATE TABLE public.payment_events(id text PRIMARY KEY,type text NOT NULL,created bigint NOT NULL,processed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.entitlements(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,feature_key text NOT NULL REFERENCES public.features(key),source text NOT NULL CHECK(source IN ('manual','promotion')),expires_at timestamptz,revoked_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,feature_key,source));
CREATE TABLE public.coupons(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),code text UNIQUE NOT NULL,stripe_promotion_code_id text UNIQUE NOT NULL,active boolean NOT NULL DEFAULT false,expires_at timestamptz,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.coupon_redemptions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),coupon_id uuid REFERENCES public.coupons(id),user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,stripe_checkout_id text UNIQUE NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.leads(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,email text NOT NULL,source text,attribution jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.newsletter_subscribers(user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,email text NOT NULL,status text NOT NULL CHECK(status IN ('subscribed','unsubscribed')),policy_version text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),unsubscribed_at timestamptz);
CREATE TABLE public.referrals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),referral_code text UNIQUE NOT NULL,referrer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,referred_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','CONVERTED','REJECTED')),created_at timestamptz NOT NULL DEFAULT now(),converted_at timestamptz,CHECK(referrer_user_id<>referred_user_id));
CREATE TABLE public.referral_rewards(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),referral_id uuid NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,reward_type text NOT NULL,reward_value numeric NOT NULL DEFAULT 0 CHECK(reward_value>=0),status text NOT NULL DEFAULT 'PENDING',created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.consents(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),revision bigint GENERATED ALWAYS AS IDENTITY UNIQUE,user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,anonymous_id uuid,category text NOT NULL CHECK(category IN ('necessary','analytics','marketing','preferences')),granted boolean NOT NULL,policy_version text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),CHECK((user_id IS NOT NULL)<>(anonymous_id IS NOT NULL)));
CREATE INDEX consent_latest ON public.consents(user_id,category,revision DESC);
CREATE TABLE public.audit_logs(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,action text NOT NULL,target_id uuid,metadata jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.deletion_requests(user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,status text NOT NULL DEFAULT 'REQUESTED' CHECK(status IN ('REQUESTED','PROCESSING','EXTERNAL_ERASURE_PENDING','COMPLETED')),requested_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.outbox(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),dedupe_key text UNIQUE NOT NULL,user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,kind text NOT NULL,payload jsonb NOT NULL DEFAULT '{}',attempts integer NOT NULL DEFAULT 0,available_at timestamptz NOT NULL DEFAULT now(),locked_until timestamptz,claim_id uuid,delivered_at timestamptz,last_error text,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.rate_limits(key text PRIMARY KEY,hits integer NOT NULL,reset_at timestamptz NOT NULL);
CREATE TABLE public.billing_locks(key text PRIMARY KEY,lease uuid NOT NULL,expires_at timestamptz NOT NULL);

CREATE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN NEW.updated_at=now();RETURN NEW;END; $$;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE FUNCTION public.initialize_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 INSERT INTO public.profiles(user_id) VALUES(NEW.id);
 INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'STUDENT');
 INSERT INTO public.outbox(dedupe_key,user_id,kind) VALUES('welcome:'||NEW.id,NEW.id,'welcome');
 RETURN NEW;END; $$;
CREATE TRIGGER initialize_user AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.initialize_user();
CREATE FUNCTION public.active_user() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id=auth.uid() AND disabled_at IS NULL) $$;
CREATE FUNCTION public.has_entitlement(feature text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT public.active_user() AND (
 EXISTS(SELECT 1 FROM public.entitlements e WHERE e.user_id=auth.uid() AND e.feature_key=feature AND e.revoked_at IS NULL AND (e.expires_at IS NULL OR e.expires_at>now())) OR
 EXISTS(SELECT 1 FROM public.plan_features f JOIN public.plans p ON p.id=f.plan_id WHERE f.feature_key=feature AND p.active AND (p.is_default OR EXISTS(SELECT 1 FROM public.subscriptions s WHERE s.plan_id=p.id AND s.user_id=auth.uid() AND s.status IN ('ACTIVE','TRIALING') AND s.current_period_end>now())))) $$;
CREATE FUNCTION public.my_entitlements() RETURNS TABLE(feature_key text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT key FROM public.features WHERE public.has_entitlement(key) $$;

DO $$ DECLARE t text;BEGIN
 FOREACH t IN ARRAY ARRAY['profiles','roles','user_roles','plans','prices','features','plan_features','billing_customers','checkout_sessions','subscriptions','subscription_events','payments','payment_events','entitlements','coupons','coupon_redemptions','leads','newsletter_subscribers','referrals','referral_rewards','consents','audit_logs','deletion_requests','outbox','rate_limits','billing_locks'] LOOP
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON public.%I FROM anon,authenticated',t);
 EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
 END LOOP;
END $$;
GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;
GRANT SELECT ON public.plans,public.prices,public.features,public.plan_features TO anon,authenticated;
CREATE POLICY published_plans ON public.plans FOR SELECT TO anon,authenticated USING(active);
CREATE POLICY published_prices ON public.prices FOR SELECT TO anon,authenticated USING(active AND EXISTS(SELECT 1 FROM public.plans WHERE id=plan_id AND active));
CREATE POLICY published_features ON public.features FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY published_plan_features ON public.plan_features FOR SELECT TO anon,authenticated USING(EXISTS(SELECT 1 FROM public.plans WHERE id=plan_id AND active));
GRANT SELECT ON public.profiles,public.user_roles,public.subscriptions,public.payments,public.entitlements,public.consents,public.leads,public.newsletter_subscribers,public.deletion_requests,public.referrals TO authenticated;
GRANT UPDATE(display_name,grade,exam_type) ON public.profiles TO authenticated;
CREATE POLICY own_profile ON public.profiles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY edit_own_profile ON public.profiles FOR UPDATE TO authenticated USING(user_id=auth.uid() AND public.active_user()) WITH CHECK(user_id=auth.uid());
DO $$ DECLARE t text;BEGIN
 FOREACH t IN ARRAY ARRAY['user_roles','subscriptions','payments','entitlements','consents','leads','newsletter_subscribers','deletion_requests'] LOOP
 EXECUTE format('CREATE POLICY own_records ON public.%I FOR SELECT TO authenticated USING(user_id=auth.uid())',t);
 END LOOP;
END $$;
CREATE POLICY own_referrals ON public.referrals FOR SELECT TO authenticated USING(referrer_user_id=auth.uid());

CREATE FUNCTION public.consume_rate_limit(bucket text,max_hits integer,window_seconds integer) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE n integer;BEGIN
 INSERT INTO public.rate_limits(key,hits,reset_at) VALUES(bucket,1,now()+make_interval(secs=>window_seconds)) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN public.rate_limits.reset_at<=now() THEN 1 ELSE public.rate_limits.hits+1 END,reset_at=CASE WHEN public.rate_limits.reset_at<=now() THEN now()+make_interval(secs=>window_seconds) ELSE public.rate_limits.reset_at END RETURNING hits INTO n; RETURN n<=max_hits;END; $$;
CREATE FUNCTION public.claim_billing_lock(lock_key text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE result uuid;BEGIN
 INSERT INTO public.billing_locks(key,lease,expires_at) VALUES(lock_key,gen_random_uuid(),now()+interval '90 seconds') ON CONFLICT(key) DO UPDATE SET lease=excluded.lease,expires_at=excluded.expires_at WHERE public.billing_locks.expires_at<now() RETURNING lease INTO result;RETURN result;END; $$;
CREATE FUNCTION public.release_billing_lock(lock_key text,lock_lease uuid) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$ DELETE FROM public.billing_locks WHERE key=lock_key AND lease=lock_lease $$;

-- Input is a minimized, verified Stripe snapshot. Only the trusted server can invoke this atomic transaction.
CREATE FUNCTION public.apply_billing_event(event_id text,event_type text,event_created bigint,customer_id text,snapshot jsonb,payment jsonb DEFAULT NULL) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid; pid uuid; sid uuid; new_event text; prior_status text;BEGIN
 INSERT INTO public.payment_events(id,type,created) VALUES(event_id,event_type,event_created) ON CONFLICT DO NOTHING RETURNING id INTO new_event;
 IF new_event IS NULL THEN RETURN 'duplicate'; END IF;
 SELECT user_id INTO uid FROM public.billing_customers WHERE stripe_customer_id=customer_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'unmapped_customer'; END IF;
 IF event_type='checkout.session.completed' THEN DELETE FROM public.checkout_sessions WHERE user_id=uid;END IF;
 IF snapshot IS NOT NULL THEN
 SELECT status INTO prior_status FROM public.subscriptions WHERE stripe_subscription_id=snapshot->>'stripe_subscription_id';
 SELECT plan_id INTO pid FROM public.prices WHERE stripe_price_id=snapshot->>'stripe_price_id';
 IF pid IS NULL THEN RAISE EXCEPTION 'unmapped_price'; END IF;
 INSERT INTO public.subscriptions(user_id,stripe_subscription_id,plan_id,status,current_period_start,current_period_end,cancel_at_period_end,last_event_created)
 VALUES(uid,snapshot->>'stripe_subscription_id',pid,snapshot->>'status',(snapshot->>'current_period_start')::timestamptz,(snapshot->>'current_period_end')::timestamptz,(snapshot->>'cancel_at_period_end')::boolean,event_created)
 ON CONFLICT(stripe_subscription_id) DO UPDATE SET plan_id=excluded.plan_id,status=excluded.status,current_period_start=excluded.current_period_start,current_period_end=excluded.current_period_end,cancel_at_period_end=excluded.cancel_at_period_end,last_event_created=excluded.last_event_created,updated_at=now()
 WHERE public.subscriptions.last_event_created<=event_created RETURNING id INTO sid;
 IF sid IS NOT NULL THEN INSERT INTO public.subscription_events(id,subscription_id,type) VALUES(event_id,sid,event_type); END IF;
 END IF;
 IF payment IS NOT NULL THEN
 IF event_type='charge.refunded' THEN
 UPDATE public.payments SET amount_refunded=(payment->>'amount_refunded')::integer,status=payment->>'status',updated_at=now() WHERE stripe_payment_intent_id=payment->>'stripe_payment_intent_id';
 IF NOT FOUND THEN RAISE EXCEPTION 'refund_payment_missing_retry';END IF;
 ELSE
 INSERT INTO public.payments(user_id,stripe_invoice_id,stripe_payment_intent_id,status,amount,currency) VALUES(uid,payment->>'stripe_invoice_id',payment->>'stripe_payment_intent_id',payment->>'status',(payment->>'amount')::integer,payment->>'currency')
 ON CONFLICT(stripe_invoice_id) DO UPDATE SET status=CASE WHEN public.payments.amount_refunded>0 THEN public.payments.status ELSE excluded.status END,amount=excluded.amount,stripe_payment_intent_id=COALESCE(excluded.stripe_payment_intent_id,public.payments.stripe_payment_intent_id),updated_at=now();
 END IF;END IF;
 IF uid IS NOT NULL AND ((event_type='invoice.payment_failed' AND payment->>'status'='FAILED') OR (event_type='invoice.paid' AND payment->>'status'='PAID') OR (event_type='customer.subscription.deleted' AND sid IS NOT NULL) OR (event_type='customer.subscription.created' AND sid IS NOT NULL AND snapshot->>'status' IN ('ACTIVE','TRIALING'))) THEN
 INSERT INTO public.outbox(dedupe_key,user_id,kind) VALUES(event_id||':email',uid,CASE event_type WHEN 'invoice.payment_failed' THEN 'payment_failed' WHEN 'invoice.paid' THEN 'payment_confirmation' WHEN 'customer.subscription.deleted' THEN 'subscription_cancelled' ELSE 'subscription_activated' END) ON CONFLICT DO NOTHING;
 END IF;
 IF uid IS NOT NULL AND EXISTS(SELECT 1 FROM public.consents c WHERE c.user_id=uid AND c.category='analytics' AND c.granted AND c.id=(SELECT id FROM public.consents WHERE user_id=uid AND category='analytics' ORDER BY revision DESC LIMIT 1)) THEN
 IF sid IS NOT NULL AND snapshot->>'status' IN ('ACTIVE','TRIALING') AND (prior_status IS NULL OR prior_status NOT IN ('ACTIVE','TRIALING')) THEN
 INSERT INTO public.outbox(dedupe_key,user_id,kind) VALUES(event_id||':analytics:started',uid,'analytics:subscription_started') ON CONFLICT DO NOTHING;
 END IF;
 IF (event_type='checkout.session.completed' AND snapshot->>'status' IN ('ACTIVE','TRIALING')) OR (event_type='customer.subscription.deleted' AND sid IS NOT NULL) OR (event_type='invoice.paid' AND payment->>'status'='PAID' AND payment->>'billing_reason'='subscription_cycle') THEN
 INSERT INTO public.outbox(dedupe_key,user_id,kind) VALUES(event_id||':analytics',uid,'analytics:'||CASE event_type WHEN 'checkout.session.completed' THEN 'checkout_completed' WHEN 'customer.subscription.deleted' THEN 'subscription_cancelled' ELSE 'subscription_renewed' END) ON CONFLICT DO NOTHING;
 END IF;END IF;
 RETURN 'processed';END; $$;
CREATE FUNCTION public.record_consent(uid uuid,category_name text,is_granted boolean,version text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 PERFORM 1 FROM public.profiles WHERE user_id=uid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'unknown_user';END IF;
 INSERT INTO public.consents(user_id,category,granted,policy_version) VALUES(uid,category_name,is_granted,version);
 IF category_name='marketing' AND NOT is_granted THEN UPDATE public.newsletter_subscribers SET status='unsubscribed',unsubscribed_at=now() WHERE user_id=uid;END IF;
END; $$;
CREATE FUNCTION public.subscribe_newsletter(uid uuid,email_address text,version text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ DECLARE allowed boolean; BEGIN
 PERFORM 1 FROM public.profiles WHERE user_id=uid AND disabled_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'account_disabled';END IF;
 SELECT granted AND policy_version=version INTO allowed FROM public.consents WHERE user_id=uid AND category='marketing' ORDER BY revision DESC LIMIT 1;
 IF allowed IS DISTINCT FROM true THEN RAISE EXCEPTION 'marketing_consent_required'; END IF;
 INSERT INTO public.newsletter_subscribers(user_id,email,status,policy_version) VALUES(uid,email_address,'subscribed',version) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,status='subscribed',policy_version=excluded.policy_version,unsubscribed_at=NULL;
END; $$;
CREATE FUNCTION public.request_deletion(uid uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
 INSERT INTO public.deletion_requests(user_id) VALUES(uid) ON CONFLICT DO NOTHING;
 UPDATE public.profiles SET disabled_at=now() WHERE user_id=uid;
 DELETE FROM public.leads WHERE user_id=uid;
 UPDATE public.newsletter_subscribers SET status='unsubscribed',unsubscribed_at=now() WHERE user_id=uid;
 INSERT INTO public.audit_logs(actor_id,action,target_id) VALUES(uid,'ACCOUNT_DELETION_REQUESTED',uid);
END; $$;
CREATE FUNCTION public.claim_outbox() RETURNS SETOF public.outbox LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 UPDATE public.outbox SET locked_until=now()+interval '5 minutes',claim_id=gen_random_uuid(),attempts=attempts+1 WHERE id IN(SELECT id FROM public.outbox WHERE delivered_at IS NULL AND available_at<=now() AND (locked_until IS NULL OR locked_until<now()) AND attempts<8 ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 10) RETURNING * $$;

REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO service_role;
REVOKE EXECUTE ON FUNCTION public.initialize_user() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_user() TO service_role;
REVOKE EXECUTE ON FUNCTION public.active_user() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.active_user() TO service_role;
REVOKE EXECUTE ON FUNCTION public.has_entitlement(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.has_entitlement(text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.my_entitlements() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.my_entitlements() TO service_role;
REVOKE EXECUTE ON FUNCTION public.consume_rate_limit(text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text,integer,integer) TO service_role;
REVOKE EXECUTE ON FUNCTION public.claim_billing_lock(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_billing_lock(text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.release_billing_lock(text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.release_billing_lock(text,uuid) TO service_role;
REVOKE EXECUTE ON FUNCTION public.apply_billing_event(text,text,bigint,text,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.apply_billing_event(text,text,bigint,text,jsonb,jsonb) TO service_role;
REVOKE EXECUTE ON FUNCTION public.record_consent(uuid,text,boolean,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_consent(uuid,text,boolean,text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.subscribe_newsletter(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.subscribe_newsletter(uuid,text,text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.request_deletion(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.request_deletion(uuid) TO service_role;
REVOKE EXECUTE ON FUNCTION public.claim_outbox() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_outbox() TO service_role;
GRANT EXECUTE ON FUNCTION public.active_user(),public.has_entitlement(text),public.my_entitlements() TO authenticated;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('public-assets','public-assets',true,5242880,ARRAY['image/png','image/jpeg','image/webp']),('private-resources','private-resources',false,20971520,ARRAY['application/pdf']);
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.objects TO authenticated;
CREATE POLICY own_private_files ON storage.objects FOR SELECT TO authenticated USING(bucket_id='private-resources' AND (storage.foldername(name))[1]=auth.uid()::text AND public.active_user());
-- Uploads are service-only until an approved upload UI and validation rules exist.
COMMIT;
