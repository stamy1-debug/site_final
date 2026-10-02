BEGIN;
-- Published monthly educational programs supplied by the owner (matecusucces.com/8).
-- Stripe price IDs are deliberately absent until the provider test catalog is configured.
INSERT INTO public.plans(code,name) VALUES ('STARTER','Starter'),('PRO','Pro'),('ELITE','Elite'),('INDEPENDENT','Elevul independent')
ON CONFLICT(code) DO UPDATE SET name=excluded.name;
COMMIT;
