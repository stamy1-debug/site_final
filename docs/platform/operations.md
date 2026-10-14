# Operations and launch gate

## Stare la 14 octombrie 2026

Preview-ul proiectului Vercel `site-final` este publicat pe `codex/matecusucces-preview-2026-10-14`, commit `4cf506f`; CI și smoke-testele hosted au trecut. `vercel curl` a confirmat paginile și health/readiness cu 200, `api/v1/plans` cu originea Preview cu 200 și originea neautorizată cu 403. CSP/security headers și noindex/robots sunt active. Redirectul de inițiere Google ajunge la Google, iar Supabase acceptă callback-ul Preview. Fără o sesiune utilizator, `/api/v1/me` răspunde `authentication_required`, așteptat după rezolvarea protecției Deployment Protection. Mediul Production Vercel nu are variabile configurate; domeniul rămâne pe site-ul vechi. Aceste rezultate validează Preview-ul, nu acceptanța Production.

Supabase, Stripe Sandbox, Resend, PostHog și Sentry au fost verificate în mediile lor de test/local. Pe 14 octombrie, un profil temporar cu acord analytics a parcurs checkoutul Starter Stripe Sandbox; webhookul semnat a fost procesat, evenimentele de conversie au ajuns în PostHog EU, iar retragerea consimțământului a oprit cererile. Identitatea temporară a fost ștearsă și abonamentul anulat. Backupul Supabase nu există: proiectul Free nu include backupuri programate. În Sentry, regiunea este EU, originea este permisă pentru `*`, IP scrubbing este activ doar la proiect, iar geografia derivată la nivel de oraș rămâne; trialul Business avea 11 zile rămase și consum 3/1.000.000. Retention nu are o valoare verificabilă în dashboard. Joburile au teste de autorizare trecute, dar `JOB_SECRET` și schedulerul lipsesc. Aceste verificări și cele din Preview nu reprezintă acceptanță de producție; Production Vercel nu este încă publicat pe domeniu. Pentru dovezi și pașii rămași, vezi [delivery.md](delivery.md).

## Managed services

Nu au fost activate plăți live, un domeniu sau plan plătit. Conturile test deja conectate nu înlocuiesc configurarea separată de producție. Notează dovezi pentru fiecare acceptanță în delivery.md.

| Provider | Free-tier consideration / required action |
|---|---|
| Vercel | Hobby is for personal/non-commercial use. Commercial subscriptions need an eligible plan; approve current pricing before purchase. Hobby cron's daily frequency is unsuitable for prompt outbox processing. |
| Supabase | Dashboard confirms the current Free project has no scheduled backups. Do not assume managed recovery; a backup/restore test needs an eligible backup/export and a separate safe restore target. No upgrade or second project has been created. |
| Stripe | Test mode precedes live enablement; live payment processing incurs published transaction fees. Account activation and applicable fee review remain owner tasks. |
| Resend | Sending DNS is verified (DKIM and both CNAMEs). Confirm the final sender address and test delivery from it before enabling sends; check current quotas in the owner dashboard. |
| PostHog | Checkout and subscription conversions were accepted with analytics consent; withdrawal stopped further requests. Replay remains disabled; confirm production ingestion limits and billing controls. |
| Sentry | EU region; Business trial showed 11 days remaining, 3/1M errors, no additional spend and no payment method. Allowed Domains is `*`; restrict it before launch. Project IP scrubbing is on while the organization-level control is off. City-level derived geography remains visible. Retention was not exposed as a verifiable setting in the dashboard; obtain the actual account retention term before launch. A high-priority issue email rule and Spike Protection are active. |

References: [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel pricing](https://vercel.com/pricing), [Cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing), [Supabase backups](https://supabase.com/docs/guides/platform/backups). Quotas and prices are provider-controlled; this implementation makes no subscription commitment.

## Outbox

`GET /api/v1/internal/jobs` accepts `Authorization: Bearer <CRON_SECRET>` (or JOB_SECRET fallback) and is compatible with managed scheduler requests. The retained `POST /api/v1/internal/email` uses JOB_SECRET. Both prepare idempotent expiring notices, prune only expired quota/lease state, and process up to ten outbox jobs. The worker suppresses outdated expiry notices before sending.

No cron is configured or running, and `JOB_SECRET` is absent. `npm test -- tests/jobs.test.ts` passes (2/2), covering exact bearer-secret authorization and rejecting an unauthenticated request before provider access. After hosting and an eligible scheduler cadence are approved, set `CRON_SECRET` (or `JOB_SECRET`) as a hosted secret and schedule `/api/v1/internal/jobs`. Do not add a public unauthenticated scheduler route. A five-minute lease protects claimed work; investigate exhausted attempts and ambiguous old delivery before retries. There is no custom always-on worker.

Alert on pending age, exhausted attempts, last_error, webhook delivery failures, readiness failures and repeated server errors. Stop ingestion-dependent launch if this worker has no approved runner. Do not reset attempts on old emails without checking Resend delivery: requests outside the idempotency safety window deliberately require reconciliation.

## Monitoring

Health only proves process availability; readiness checks database access. It is not a full test of Stripe/Resend/PostHog/Sentry. Structured server errors contain static codes/request IDs. Sentry scrubs user/request/context/message details; configure release identifiers and environment isolation. A high-priority issue email alert is active. Project-level IP scrubbing is enabled and the recent event had no stored IP/tag, but the organization-level toggle is off and city-level derived geography remains. Restrict the wildcard hostname allowlist and confirm account quota/retention and uptime checks before launch.

## Backup and rollback

Before first hosted migration: verify the exact target project, take a provider-supported backup/export, review SQL against existing objects, apply to a test project, and test restore separately. The current Supabase Free project has no scheduled backup and no backup artifact is available; do not upgrade the project or create a restore project without owner approval. Local restore is also unavailable in this environment (Supabase CLI absent, Docker daemon unavailable, and no database password configured). The PGlite SQL tests do not replace Supabase restore testing. Roll back frontend/functions through Vercel deployment history. Treat deployed schema rollback as a reviewed forward migration; never drop production data to undo a release.

## Acceptance checklist

Test real email/password signup, confirmation, Google OAuth, session refresh, password recovery, logout, two-user RLS and private Storage signed URLs on Supabase staging. Exercise Stripe monthly/yearly checkout/renewal/failure/cancellation/refund/portal and webhook replay. Verify Resend test inbox, consent withdrawal, PostHog events and scrubbed Sentry exceptions. Check deployed API rewrites, CSP, CORS/origin behavior, HTTPS, cache headers, canonical/sitemap/robots and noindex for previews. Measure real-device WebGL responsiveness and Core Web Vitals. None of these remote checks is satisfied merely by a successful local build.

## Disabled delivery channels

`claim_ready_outbox` only claims jobs for configured, enabled channels. Email requires sender/key, the explicit sending switch, and a test recipient outside production. Analytics requires a project key and policy version. Other jobs remain queued with unchanged attempt counts until the channel is ready. This is intentional deferral, not successful delivery.
