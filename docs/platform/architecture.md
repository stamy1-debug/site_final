# Architecture

The latest Production Platform PRD is authoritative. The earlier FastAPI proposal is superseded.

Public source remains `dist/`: one static HTML document and hash navigation, not Next.js. No framework migration is necessary. `scripts/build.ts` copies those files into ignored `build/`, adds invisible head metadata plus an ES-module integration loader, and code-splits the provider SDKs. Styles, public body, original JavaScript, vendor Three.js and navigation remain byte-for-byte identical.

Vercel serves static output and routes `/api/v1/*` to `api/handler.ts`, a Node 22 function. Domain logic is in `src/server/`. Supabase is canonical identity, PostgreSQL, RLS and Storage. There is no custom password/session/OAuth service, Redis, alternate database or additional hosting provider. The previous `.openai/hosting.json` is historical; no new Sites publication or migration is attempted.

Trust boundaries:
- Browser receives only Supabase URL/public key, PostHog project key, public Sentry DSN, policy version and environment label.
- Supabase SDK owns PKCE, token refresh and persisted sessions. APIs accept explicit bearer tokens and validate them with `auth.getUser`, not decoded claims or client metadata. Browser token storage follows Supabase client behavior; there are no application auth cookies, hence no cookie-auth CSRF bypass. XSS protection remains important.
- User reads use their JWT and RLS. Service role is confined to trusted billing, audit, quotas, marketing and administration operations after server identity checks.
- Stripe Checkout/Portal handle card entry. Stripe signatures are checked against untouched request bytes. Current provider snapshots feed one atomic database function. A browser redirect never grants access.
- PostHog loads after analytics opt-in; autocapture, replay, surveys and visual experiments are disabled. Sentry browser monitoring also waits for opt-in. Server error reports are minimized.
- Transactional email and verified billing conversions use durable outbox records. Supabase Auth handles verification/reset email. Resend sends application email only when explicitly configured/enabled.

No paid feature mapping or price was invented. FREE/PREMIUM/PREMIUM_PLUS and feature names are seeded as configurable records. Product owners must approve the price and feature matrix before a purchasable price is enabled.

## File responsibilities

- `src/server/router.ts`: validated/versioned routes, server authorization, quotas.
- `src/server/billing.ts`: Stripe checkout/portal support, verified event normalization and synchronization.
- `src/server/email.ts`, `analytics.ts`: provider delivery behind a durable outbox.
- `src/server/config.ts`, `services.ts`, `monitoring.ts`: configuration, SDK factories and privacy-filtered reports.
- `src/browser/platform.ts`: invisible facade for later approved UI integration.
- `src/shared/`: event taxonomy, privacy allowlist, SEO and future educational-content validation.
- `supabase/migrations/`: reproducible application schema, RLS and atomic functions.
- `tests/`: provider-boundary unit/API tests, local PostgreSQL-compatible SQL/RLS tests, frozen-source and generated-output regression tests.

## API

All replies are JSON; errors have `{error:{code,request_id}}`. Sensitive responses are no-store/noindex. There is no public administration UI.

| Method | `/api/v1/…` | Purpose |
|---|---|---|
| GET | health / ready | Liveness / database readiness without private details |
| GET | plans | Active database catalog |
| GET, PATCH | me | Own profile; only display_name/grade/exam_type writable |
| DELETE | me | Confirmed deletion request, disables application access; does not immediately erase financial records |
| GET | me/export | Own current application data |
| GET | entitlements | Effective current feature access, evaluated by SQL |
| GET | subscriptions / payments | Own billing history |
| POST | checkout | Server-approved price UUID + idempotency request UUID |
| POST | portal | Stripe-hosted customer portal |
| GET, POST | consents | Consent history / versioned decision |
| POST | leads | Own verified-account lead record; no automatic marketing opt-in |
| POST, DELETE | newsletter | Atomic opt-in check / withdrawal |
| GET, POST | referrals | Own referral codes; no rewards or automatic conversion |
| POST | storage/signed-url | Own private path, short-lived signed URL |
| POST | webhooks/stripe | Signed raw Stripe event |
| POST | internal/email | Secret-protected outbox worker (email + conversions) |
| POST | admin/disable | ADMIN/SUPER_ADMIN disable; privileged targets require SUPER_ADMIN |
| POST | admin/roles | SUPER_ADMIN role grant, audit record |

Admin routes complement provider dashboards only. Initial SUPER_ADMIN must be assigned by the account owner using a reviewed trusted database operation; public registration always creates STUDENT.
