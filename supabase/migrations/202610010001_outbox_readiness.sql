BEGIN;
-- Preserve attempts while a delivery channel is intentionally disabled/unconfigured.
CREATE FUNCTION public.claim_ready_outbox(include_email boolean,include_analytics boolean) RETURNS SETOF public.outbox LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 UPDATE public.outbox SET locked_until=now()+interval '5 minutes',claim_id=gen_random_uuid(),attempts=attempts+1
 WHERE id IN (
  SELECT id FROM public.outbox
  WHERE delivered_at IS NULL AND available_at<=now() AND (locked_until IS NULL OR locked_until<now()) AND attempts<8
   AND ((kind LIKE 'analytics:%' AND include_analytics) OR (kind NOT LIKE 'analytics:%' AND include_email))
  ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT 10
 ) RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.claim_ready_outbox(boolean,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_ready_outbox(boolean,boolean) TO service_role;
COMMIT;
