# Operations and launch gate

## Stare la 16 octombrie 2026

Preview-ul proiectului Vercel `site-final` este publicat pe `codex/deploy-preview-2026-10-14`; actualizarea documentației `e6f3619` a trecut GitHub CI. Un deployment Production etapizat `Aqt423YhKzYi5YfSS49TctpF83AJ` este READY după setarea variabilelor de site/Supabase. Proprietarul a ales reutilizarea proiectului Supabase existent; Preview și Production împart astfel aceleași date, iar Preview rămâne protejat. `vercel curl` a confirmat paginile și health/readiness cu 200, `/api/v1/plans` pe originea canonică cu 200 și originea străină cu 403. CSP/security headers și `robots.txt` noindex sunt active. Supabase acceptă redirecturile exacte Production pentru login și recovery. Fără sesiune, `/api/v1/me` răspunde `authentication_required`. Deploymentul etapizat nu a fost promovat, iar domeniul încă servește vechiul site. Checkout, emailurile și trackingul opțional nu sunt configurate în Production.

Supabase, Stripe Sandbox, Resend, PostHog și Sentry au fost verificate în mediile lor de test/local. Pe 14 octombrie, un profil temporar cu acord analytics a parcurs checkoutul Starter Stripe Sandbox; webhookul semnat a fost procesat, evenimentele de conversie au ajuns în PostHog EU, iar retragerea consimțământului a oprit cererile. Identitatea temporară a fost ștearsă și abonamentul anulat. Proprietarul a confirmat lansarea fără backup Supabase, fluxul Sentry actual și ținta de retenție de 90 de zile, și a ales să continue fără revizie juridică sau contabilă externă. În Sentry, regiunea este EU; `Allowed Domains` este limitat la cele două domenii de producție, IP scrubbing este activ la proiect și organizație, iar partajarea publică a issue-urilor este dezactivată. Un eveniment sintetic nu afișează IP brut, dar include oraș derivat. Valoarea efectivă a retenției nu a fost vizibilă în dashboard. Google OAuth a fost testat pe callback-ul Preview exact aprobat și a deschis contul. Joburile au teste de autorizare trecute, dar `JOB_SECRET` și schedulerul lipsesc intenționat cât timp emailurile automate sunt oprite. Domeniul nu a fost promovat. Pentru dovezi și pașii rămași, vezi [delivery.md](delivery.md).

## Managed services

Nu au fost activate plăți live sau un plan plătit; domeniul personalizat rămâne pe site-ul vechi. Ownerul a ales folosirea proiectului Supabase existent pentru Production. Notează dovezi pentru fiecare acceptanță în delivery.md.

| Provider | Free-tier consideration / required action |
|---|---|
| Vercel | Hobby is for personal/non-commercial use. Commercial subscriptions need an eligible plan; approve current pricing before purchase. Hobby cron's daily frequency is unsuitable for prompt outbox processing. |
| Supabase | The owner accepted launching without a database backup. The current Free project has no scheduled backup; GitHub/Vercel history covers code/deployments, not hosted database/Auth/Storage. Production reuses the current project by owner decision; a separate staging project remains optional. |
| Stripe | Test mode precedes live enablement; live payment processing incurs published transaction fees. Account activation and applicable fee review remain owner tasks. |
| Resend | Sending DNS is verified (DKIM and both CNAMEs). Confirm the final sender address and test delivery from it before enabling sends; check current quotas in the owner dashboard. |
| PostHog | Checkout and subscription conversions were accepted with analytics consent; withdrawal stopped further requests. Replay remains disabled; confirm production ingestion limits and billing controls. |
| Sentry | EU region. Allowed Domains is limited to `matecusucces.com` and `www.matecusucces.com`; organization enhanced privacy, server-side/default scrubbing, and IP scrubbing are on. Public issue sharing is off. A new event hides raw IP but includes derived city data. Owner-approved flow and 90-day retention target; effective retention was not exposed as a verifiable setting in the dashboard. A high-priority issue email rule and Spike Protection are active. |

References: [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel pricing](https://vercel.com/pricing), [Cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing), [Supabase backups](https://supabase.com/docs/guides/platform/backups). Quotas and prices are provider-controlled; this implementation makes no subscription commitment.

## Outbox

`GET /api/v1/internal/jobs` accepts `Authorization: Bearer <CRON_SECRET>` (or JOB_SECRET fallback) and is compatible with managed scheduler requests. The retained `POST /api/v1/internal/email` uses JOB_SECRET. Both prepare idempotent expiring notices, prune only expired quota/lease state, and process up to ten outbox jobs. The worker suppresses outdated expiry notices before sending.

No cron is configured or running, and `JOB_SECRET` is absent. `npm test -- tests/jobs.test.ts` passes (2/2), covering exact bearer-secret authorization and rejecting an unauthenticated request before provider access. After hosting and an eligible scheduler cadence are approved, set `CRON_SECRET` (or `JOB_SECRET`) as a hosted secret and schedule `/api/v1/internal/jobs`. Do not add a public unauthenticated scheduler route. A five-minute lease protects claimed work; investigate exhausted attempts and ambiguous old delivery before retries. There is no custom always-on worker.

Alert on pending age, exhausted attempts, last_error, webhook delivery failures, readiness failures and repeated server errors. Keep the worker disabled while transactional email sending is off. Do not reset attempts on old emails without checking Resend delivery: requests outside the idempotency safety window deliberately require reconciliation.

## Monitoring

Health only proves process availability; readiness checks database access. It is not a full test of Stripe/Resend/PostHog/Sentry. Structured server errors contain static codes/request IDs. Sentry scrubs user/request/context/message details; configure release identifiers and environment isolation. A high-priority issue email alert is active. Enhanced privacy, required default/server-side scrubbers and organization/project IP scrubbing are enabled; public issue sharing is off. A verified synthetic event hides raw IP and shows derived city-level geography. The owner approved this flow and a 90-day retention target; the effective retention term is not exposed in the checked dashboard.

## Backup and rollback

The owner explicitly accepted launching without a Supabase backup or restore test. The current Supabase Free project has no scheduled backup and no backup artifact is available. GitHub/Vercel history can roll back frontend deployments/functions, but it cannot restore hosted database, Auth, or Storage data. Local restore is also unavailable in this environment (Supabase CLI absent, Docker daemon unavailable, and no database password configured). Treat deployed schema rollback as a reviewed forward migration; never drop production data to undo a release.

## Acceptance checklist

The existing Supabase project serves Production and Preview, so do not use disposable identities or destructive scenarios there. Signup/OAuth was verified with the authorized account on the exact approved Preview callback; recovery and private Storage acceptance are documented in `delivery.md`. Stripe checkout remains disabled in Production per owner instruction; sandbox billing acceptance is recorded in `billing.md`. Resend tests are complete; automated sending stays off. Consent-based PostHog remains disabled in Production by owner choice. Check deployed API rewrites, CSP, CORS/origin behavior, HTTPS, cache headers, canonical/sitemap/robots and noindex for previews. Measure real-device WebGL responsiveness and Core Web Vitals. None of these remote checks is satisfied merely by a successful local build.

## Disabled delivery channels

`claim_ready_outbox` only claims jobs for configured, enabled channels. Email requires sender/key, the explicit sending switch, and a test recipient outside production. Analytics requires a project key and policy version. Other jobs remain queued with unchanged attempt counts until the channel is ready. This is intentional deferral, not successful delivery.
