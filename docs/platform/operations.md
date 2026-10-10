# Operations and launch gate

## Stare la 10 octombrie 2026

Supabase, Stripe sandbox, Resend test și PostHog au proiecte conectate. A fost verificată înregistrarea Supabase, o plată Stripe de test, livrarea unui singur email de test autorizat și evenimentele PostHog cu consimțământ. Acestea nu reprezintă acceptanță completă sau producție. Emailul automat, Sentry și schedulerul sunt inactive; Vercel/deploymentul sunt amânate. Pentru statusul detaliat și testele lipsă, vezi [delivery.md](delivery.md).

## Managed services

Nu au fost activate plăți live, un domeniu sau plan plătit. Conturile test deja conectate nu înlocuiesc configurarea separată de producție. Notează dovezi pentru fiecare acceptanță în delivery.md.

| Provider | Free-tier consideration / required action |
|---|---|
| Vercel | Hobby is for personal/non-commercial use. Commercial subscriptions need an eligible plan; approve current pricing before purchase. Hobby cron's daily frequency is unsuitable for prompt outbox processing. |
| Supabase | Free projects have resource/auth/email limits and may pause after inactivity. Establish offsite backups and a tested restore; do not assume managed free-tier recovery. |
| Stripe | Test mode precedes live enablement; live payment processing incurs published transaction fees. Account activation and applicable fee review remain owner tasks. |
| Resend | Verify sender domain/DNS and current daily/monthly limits before enabling sends. Domain ownership and delivery test are pending. |
| PostHog | Set ingestion/replay limits and billing alerts in the project. Replay remains disabled; confirm current free allowances in the owner dashboard. |
| Sentry | Set event quotas, alert routing and retention. Tracing is disabled; test a scrubbed error before launch. |

References: [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel pricing](https://vercel.com/pricing), [Cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing), [Supabase backups](https://supabase.com/docs/guides/platform/backups). Quotas and prices are provider-controlled; this implementation makes no subscription commitment.

## Outbox

`GET /api/v1/internal/jobs` accepts `Authorization: Bearer <CRON_SECRET>` (or JOB_SECRET fallback) and is compatible with managed scheduler requests. The retained `POST /api/v1/internal/email` uses JOB_SECRET. Both prepare idempotent expiring notices, prune only expired quota/lease state, and process up to ten outbox jobs. The worker suppresses outdated expiry notices before sending.

No cron is configured or running. After an eligible provider plan/cadence is approved, configure Vercel Cron for `/api/v1/internal/jobs` and set CRON_SECRET. Do not add a public unauthenticated scheduler route. A five-minute lease protects claimed work; investigate exhausted attempts and ambiguous old delivery before retries. There is no custom always-on worker.

Alert on pending age, exhausted attempts, last_error, webhook delivery failures, readiness failures and repeated server errors. Stop ingestion-dependent launch if this worker has no approved runner. Do not reset attempts on old emails without checking Resend delivery: requests outside the idempotency safety window deliberately require reconciliation.

## Monitoring

Health only proves process availability; readiness checks database access. It is not a full test of Stripe/Resend/PostHog/Sentry. Structured server errors contain static codes/request IDs. Sentry scrubs user/request/context/message details; configure release identifiers and environment isolation. No external alert rules or uptime checks are configured yet.

## Backup and rollback

Before first hosted migration: verify the exact target project, take a provider-supported backup/export, review SQL against existing objects, apply to a test project, and test restore separately. The PGlite SQL tests do not replace Supabase restore testing. Roll back frontend/functions through Vercel deployment history. Treat deployed schema rollback as a reviewed forward migration; never drop production data to undo a release.

## Acceptance checklist

Test real email/password signup, confirmation, Google OAuth, session refresh, password recovery, logout, two-user RLS and private Storage signed URLs on Supabase staging. Exercise Stripe monthly/yearly checkout/renewal/failure/cancellation/refund/portal and webhook replay. Verify Resend test inbox, consent withdrawal, PostHog events and scrubbed Sentry exceptions. Check deployed API rewrites, CSP, CORS/origin behavior, HTTPS, cache headers, canonical/sitemap/robots and noindex for previews. Measure real-device WebGL responsiveness and Core Web Vitals. None of these remote checks is satisfied merely by a successful local build.

## Disabled delivery channels

`claim_ready_outbox` only claims jobs for configured, enabled channels. Email requires sender/key, the explicit sending switch, and a test recipient outside production. Analytics requires a project key and policy version. Other jobs remain queued with unchanged attempt counts until the channel is ready. This is intentional deferral, not successful delivery.
