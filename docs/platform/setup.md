# Local and provider setup

## Configurare deja efectuată

La 10 octombrie 2026, `.env` local conține configurația de dezvoltare pentru Supabase, Stripe sandbox, Resend test, PostHog, site-ul local și versiunea politicii de consimțământ. În Supabase sunt create tabelele, iar în Auth sunt setate redirecturile locale; în Stripe a avut loc un checkout sandbox reușit; un email Resend de test a ajuns la destinatarul autorizat; dashboardul PostHog de validare există. Nu copia aceste chei aici sau în Git. Comenzile din această pagină nu activează automat furnizorii.

## Local

Use Node 22 and `npm ci`. Copy `.env.example` to a local ignored `.env`, then configure only test/development credentials. Scripts do not silently load `.env`; run with `node --env-file=.env --import tsx scripts/build.ts` and `node --env-file=.env --import tsx scripts/dev.ts`, or inject environment values using your shell/secret manager.

`npm run verify` runs lint, TypeScript, tests, and build. `npm run build && npm run dev` previews at http://localhost:4174 without requiring credentials. Missing services return a deliberate error; they are never simulated in production code. Original frozen source can be viewed separately with `python3 -m http.server 4173 --directory dist`.

## Supabase

The owner chose to reuse the existing Supabase project for Production rather than create a second project. Vercel Production now stores its URL, anon key, service role key and database URL; secret values are never placed in Git or reported. This means Preview and Production share the same Supabase data, so keep Preview protected and avoid disposable or destructive tests there. Supabase accepts the exact Production Google OAuth and recovery redirects `https://www.matecusucces.com/auth/callback` and `https://www.matecusucces.com/auth/callback?auth=recovery`; no wildcard was added. A separate staging project remains an optional safety improvement.

Enable email/password, confirmation, minimum password length and managed auth rate limits/CAPTCHA where needed. Supabase's default mail service has recipient/rate restrictions; verify its delivery capability before signup release, or configure its custom SMTP using the approved provider if needed. Google Cloud branding and an External web OAuth client have been created, with local and intended production origins and the Supabase callback URL. The provider is enabled in Supabase and the authorized Google account completed a successful local sign-in on 11 October 2026. The application uses Supabase `signInWithOAuth`, not custom Google OAuth.

Use Supabase CLI migrations. `supabase start` requires Docker; it was unavailable in this workspace. `supabase db reset` is **only for a disposable local Supabase instance**, never linked production. The six application migrations have been applied to the reused Supabase project and its application tables were confirmed. Do not reapply migrations to Production without reviewing current migration state and schema first.

## Stripe

Use test mode until explicit live approval. Set secret and webhook signing secret only on the server. Create approved Products/Prices in Stripe test mode; insert the corresponding `prices` records and approved `plan_features`. No prices are predefined. A price ID submitted by a client must match an active database record and plan.

Configure Stripe Customer Portal in test mode (products, allowed changes/cancellation, return URLs). The sandbox Portal is configured with the four approved monthly prices and the Starter → Pro switch passed. A native redelivery of `customer.subscription.updated` was accepted and synchronized by Supabase using a temporary HTTPS tunnel; that temporary endpoint was deleted after the test. After hosting, create the persistent webhook `/api/v1/webhooks/stripe` for the events listed in billing.md. Stripe CLI forwarding remains useful for local raw-signature tests. SDK version is locked in package-lock; align webhook API version to the locked SDK and validate real test-mode payloads, particularly invoice parent/payments shapes.

Create test purchases with Stripe's published test methods, never real card data. A successful monthly STARTER checkout and resulting subscription were confirmed in sandbox. Verify failed renewal, cancellation, refund and duplicate/redelivered event behavior before treating billing as accepted. No yearly prices were supplied or created.

## Resend

The `matecusucces.com` sending domain is verified in Resend (DKIM and the `resend`/`send` CNAME records, 14 October 2026). The owner selected `notificari@matecusucces.com` as From and `stelutaenache05@gmail.com` as Reply-To; the application mailer now includes that Reply-To. One direct Resend API test was delivered to the authorized inbox on 15 October 2026. The replacement key `matecusucces-vercel-preview-2` has Sending access scoped to `matecusucces.com` and is stored as a Vercel Preview secret, and `RESEND_FROM` is configured only for branch `codex/matecusucces-preview-2026-10-14`. The first key `matecusucces-vercel-preview` remains active and unused. Preview commit `21ef412` is Ready and `/api/v1/ready` returned `{"status":"ready"}`. No application-originated email was sent; `EMAIL_SENDING_ENABLED=false` remains in effect and the worker is not scheduled.

Schedule the secret-protected outbox endpoint using approved provider infrastructure after credentials exist. For early local testing invoke it explicitly with the job bearer secret. Vercel Hobby's daily cron frequency is unsuitable for prompt billing email; commercial Vercel plan/approved scheduling is a launch dependency. No paid cron or subscription was activated. See operations.md.

## PostHog and Sentry

Use separate projects per environment. Set a PostHog public project key and approved regional ingest host. Do not supply personal admin API keys to the browser. Configure funnels/cohorts in the managed dashboard after test events arrive. Feature-flag getter exists; no experiment flags or replay are enabled.

Set server and public Sentry DSNs, environment and release. Controlled server and synthetic browser errors are visible in Sentry as `NODE-2`, `NODE-3` and `NODE-4`. The fresh browser test came from an anonymous local profile after analytics consent was granted for the test; consent was then withdrawn, and the owner's account was not changed. That historic event has no stored IP address or IP tag, but still displays derived city-level geography (Bucharest, Romania). On 15 October, project Allowed Domains was restricted to the two production hostnames; enhanced privacy, required server-side/default scrubbing and organization-level IP scrubbing were enabled; public issue sharing was disabled. Retention was not exposed as a verifiable setting in the checked dashboard. Verify derived geography on a new synthetic event after the configuration change. Stack-frame filenames are sanitized; raw error values, user context, requests, breadcrumbs and extras are removed. Performance tracing is initially off to limit overhead and exposure.

## Vercel

Import this repository with root `matecusucces` if importing its parent, otherwise repository root. Use framework Other, Node 22, build `npm run build`, output `build`. Vercel functions are discovered in `api/`; `vercel.json` supplies rewrites/security headers. Provision separate preview/test values. Never copy production Supabase service credentials, live Stripe keys or production email destinations into previews.

Set APP_ENV=preview for previews, APP_ENV=production only in production. The intended canonical domain is `https://www.matecusucces.com/`; set SITE_URL to the exact chosen origin and SITE_INDEXABLE=true only when approved public launch is ready. Previews always build noindex + robots disallow. Vercel also protects preview indexing. Keep deployment protection enabled where applicable. The owner still needs to connect the domain and approve DNS changes. Existing Sites preview remains untouched.

The existing Vercel project `site-final` is connected to `stamy1-debug/site_final`. A protected Preview was deployed from the preview branch. The owner authorized using the existing Supabase project for Production; the checked Environment Variables page shows Supabase and site configuration in Production, and Supabase/Stripe test variables in Preview. Preview and Production reuse the same Supabase project, so do not run disposable or destructive tests there. `RESEND_API_KEY` is now saved only in Preview for branch `codex/matecusucces-preview-2026-10-14`; no Resend key was added to Production. PostHog, Sentry and consent policy variables remain absent from Vercel. A Production-targeted staged deployment is READY and passed health/readiness smoke tests. It was created with `--skip-domain`, so `matecusucces.com` still points to the old deployment. Do not promote until the remaining owner/legal and operational release gates are accepted. Checkout, automated application email and optional tracking remain unavailable in Production by design.
