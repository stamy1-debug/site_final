# Local and provider setup

## Local

Use Node 22 and `npm ci`. Copy `.env.example` to a local ignored `.env`, then configure only test/development credentials. Scripts do not silently load `.env`; run with `node --env-file=.env --import tsx scripts/build.ts` and `node --env-file=.env --import tsx scripts/dev.ts`, or inject environment values using your shell/secret manager.

`npm run verify` runs lint, TypeScript, tests, and build. `npm run build && npm run dev` previews at http://localhost:4174 without requiring credentials. Missing services return a deliberate error; they are never simulated in production code. Original frozen source can be viewed separately with `python3 -m http.server 4173 --directory dist`.

## Supabase

Account-owner action required: create/select separate Supabase development and production projects (start free where appropriate); provide project URL/public key and server-only service role in environment settings, not chat or Git. Choose an appropriate data region and approve processing terms. Configure Supabase Auth Site URL and exact allowed redirects `/auth/callback` and `/auth/callback?auth=recovery` for each environment; never use a broad production wildcard for untrusted previews.

Enable email/password, confirmation, minimum password length and managed auth rate limits/CAPTCHA where needed. Supabase's default mail service has recipient/rate restrictions; verify its delivery capability before signup release, or configure its custom SMTP using the approved provider if needed. Configure Google provider client ID/secret in Supabase and its callback URL in the Google console. Google consent screen and allowed test users require owner setup. The application uses Supabase `signInWithOAuth`, not custom Google OAuth.

Use Supabase CLI migrations. `supabase start` requires Docker; it was unavailable in this workspace. `supabase db reset` is **only for a disposable local Supabase instance**, never linked production. For remote application use `supabase link --project-ref <explicit test project>` then inspect migration diff and run `supabase db push` against test first. Hosted migrations have not been executed in this task. Review the migration against any existing schema before using an existing project.

## Stripe

Use test mode until explicit live approval. Set secret and webhook signing secret only on the server. Create approved Products/Prices in Stripe test mode; insert the corresponding `prices` records and approved `plan_features`. No prices are predefined. A price ID submitted by a client must match an active database record and plan.

Configure Stripe Customer Portal in test mode (products, allowed changes/cancellation, return URLs). Create webhook `/api/v1/webhooks/stripe` for events listed in billing.md. Use Stripe CLI forwarding to test raw signatures and retries. SDK version is locked in package-lock; align webhook API version to the locked SDK and validate real test-mode payloads, particularly invoice parent/payments shapes.

Create test purchases with Stripe's published test methods, never real card data. Verify monthly/yearly checkout, portal upgrade/downgrade/cancel, failed renewal, refund and duplicate/redelivered event behavior. These live sandbox checks remain unexecuted because account access was not supplied.

## Resend

Set API key, verified sender domain/address and DNS records from Resend's dashboard. Confirm domain verification; send to an explicitly authorized test recipient first. Outside production `RESEND_TEST_RECIPIENT` overrides recipients. `EMAIL_SENDING_ENABLED=false` by default. No real email has been sent.

Schedule the secret-protected outbox endpoint using approved provider infrastructure after credentials exist. For early local testing invoke it explicitly with the job bearer secret. Vercel Hobby's daily cron frequency is unsuitable for prompt billing email; commercial Vercel plan/approved scheduling is a launch dependency. No paid cron or subscription was activated. See operations.md.

## PostHog and Sentry

Use separate projects per environment. Set a PostHog public project key and approved regional ingest host. Do not supply personal admin API keys to the browser. Configure funnels/cohorts in the managed dashboard after test events arrive. Feature-flag getter exists; no experiment flags or replay are enabled.

Set server and public Sentry DSNs, environment and release. Trigger a controlled test error on staging and verify the scrubbed event in Sentry. Do not consider this completed until observed there. Stack-frame filenames are sanitized; raw error values, user context, requests, breadcrumbs and extras are removed. Performance tracing is initially off to limit overhead and exposure.

## Vercel

Import this repository with root `matecusucces` if importing its parent, otherwise repository root. Use framework Other, Node 22, build `npm run build`, output `build`. Vercel functions are discovered in `api/`; `vercel.json` supplies rewrites/security headers. Provision separate preview/test values. Never copy production Supabase service credentials, live Stripe keys or production email destinations into previews.

Set APP_ENV=preview for previews, APP_ENV=production only in production. Set canonical SITE_URL to the chosen production origin and SITE_INDEXABLE=true only when approved public launch is ready. Previews always build noindex + robots disallow. Vercel also protects preview indexing. Keep deployment protection enabled where applicable. No production domain is assumed; owner must select/connect it and approve DNS changes. Existing Sites preview remains untouched.

No Vercel project was created, no preview/production deployment was made, and no domain was changed in this infrastructure task. The account and deployment credentials are absent.
