BEGIN;
-- Minimal case tracking survives identity erasure without retaining email/name.
CREATE TABLE public.erasure_cases(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,status text NOT NULL DEFAULT 'REQUESTED' CHECK(status IN ('REQUESTED','PROCESSING','EXTERNAL_ERASURE_PENDING','COMPLETED')),checks jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.erasure_cases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.erasure_cases FROM anon,authenticated;
GRANT ALL ON public.erasure_cases TO service_role;
GRANT SELECT ON public.erasure_cases TO authenticated;
CREATE POLICY own_erasure_case ON public.erasure_cases FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE OR REPLACE FUNCTION public.request_deletion(uid uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE category_name text;version text;
BEGIN
 PERFORM 1 FROM public.profiles WHERE user_id=uid FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'user_missing';END IF;
 INSERT INTO public.deletion_requests(user_id) VALUES(uid) ON CONFLICT DO NOTHING;
 INSERT INTO public.erasure_cases(user_id) VALUES(uid) ON CONFLICT(user_id) DO NOTHING;
 FOREACH category_name IN ARRAY ARRAY['analytics','marketing','preferences'] LOOP
  SELECT policy_version INTO version FROM public.consents WHERE user_id=uid AND category=category_name ORDER BY revision DESC LIMIT 1;
  INSERT INTO public.consents(user_id,category,granted,policy_version) VALUES(uid,category_name,false,coalesce(version,'account-deletion'));
 END LOOP;
 UPDATE public.profiles SET disabled_at=now() WHERE user_id=uid;
 DELETE FROM public.leads WHERE user_id=uid;
 UPDATE public.newsletter_subscribers SET status='unsubscribed',unsubscribed_at=now() WHERE user_id=uid;
 DELETE FROM public.outbox WHERE user_id=uid AND delivered_at IS NULL AND kind LIKE 'analytics:%';
 INSERT INTO public.audit_logs(actor_id,action,target_id) VALUES(uid,'ACCOUNT_DELETION_REQUESTED',uid);
END; $$;
CREATE FUNCTION public.advance_erasure(actor uuid,case_id uuid,new_status text,evidence jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE current_case public.erasure_cases%ROWTYPE;merged jsonb;key text;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.user_id=r.user_id WHERE r.user_id=actor AND r.role='SUPER_ADMIN' AND p.disabled_at IS NULL) THEN RAISE EXCEPTION 'forbidden';END IF;
 SELECT * INTO current_case FROM public.erasure_cases WHERE id=case_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'case_missing';END IF;
 IF current_case.status='COMPLETED' THEN RAISE EXCEPTION 'case_completed';END IF;
 merged=current_case.checks||evidence;
 IF new_status='COMPLETED' THEN
  IF current_case.user_id IS NOT NULL THEN RAISE EXCEPTION 'identity_still_exists';END IF;
  FOREACH key IN ARRAY ARRAY['identity','storage','stripe','resend','posthog','sentry','retention_review'] LOOP
   IF coalesce(merged->>key,'') NOT IN ('done','not_applicable') THEN RAISE EXCEPTION 'external_erasure_unconfirmed';END IF;
  END LOOP;
  IF merged->>'identity'<>'done' OR merged->>'retention_review'<>'done' THEN RAISE EXCEPTION 'external_erasure_unconfirmed';END IF;
 END IF;
 UPDATE public.erasure_cases SET status=new_status,checks=merged,updated_at=now() WHERE id=case_id;
 UPDATE public.deletion_requests SET status=new_status,updated_at=now() WHERE user_id=current_case.user_id;
 INSERT INTO public.audit_logs(actor_id,action,metadata) VALUES(actor,'ERASURE_CASE_UPDATED',jsonb_build_object('case_id',case_id,'status',new_status));
END; $$;
REVOKE ALL ON FUNCTION public.advance_erasure(uuid,uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.advance_erasure(uuid,uuid,text,jsonb) TO service_role;
COMMIT;
