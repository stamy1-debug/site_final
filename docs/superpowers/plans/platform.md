# Production Platform Implementation Plan

**Goal:** Add the approved managed platform behind the frozen public frontend.
**Architecture:** Static frontend retained; Vercel Node functions with modular TypeScript services; Supabase canonical identity/PostgreSQL/Storage/RLS; Stripe hosted billing; Resend email; consent-gated PostHog; scrubbed Sentry.
**Spec:** docs/platform/PRD.md (newest user PRD supersedes previous FastAPI proposal).
**Execution:** Native, autonomous as explicitly requested. No redesign, custom auth or alternate providers. No paid provisioning, live charges, production data mutation or sending real messages.

## Review focus
- Cross-user access, client-controlled role/plan/price data.
- Webhook duplicates, old events, races and partial failures.
- Missing configuration must fail closed; preview must reject live payment configuration.
- Consent withdrawal, PII in analytics/errors and deletion with financial retention.
- Frozen source byte equivalence and invisible-only generated metadata.

## Tasks
- [x] 1. Baseline and tooling. Capture hashes; install typed SDKs; tests for configuration, privacy and freeze; run red then implement; build separate output.
- [x] 2. Supabase migrations. Application models, trigger for profile/default role, private storage, least-privilege RLS, grants, entitlements, atomic webhook RPC, rate limit, consent and deletion requests. Run SQL tests with two users and service role.
- [x] 3. API identity and business layer. Supabase verified JWT, RBAC, versioned endpoints, export/deletion request, plans and entitlement queries, storage signed URLs; test missing/invalid identity and forbidden roles.
- [x] 4. Stripe. Trusted price lookup, deterministic customer binding, checkout idempotency, portal, signature verification on raw bytes, retrieve authoritative subscription state, atomic persistence, duplicate/retry protection, refund/payment state, durable lifecycle outbox. Test all billing states and duplicates.
- [x] 5. Browser integrations. Lazy Supabase auth facade, consent state, PostHog event allowlists/attribution/deduplication/flags; no replay or visual experiments. Lazy scrubbed Sentry. Test analytics privacy and consent.
- [x] 6. Email and GDPR. Versioned Resend templates, idempotent durable outbox worker, authenticated opt-in newsletter/leads/referrals, export and deletion request operations; document external erasure/retention workflow.
- [x] 7. SEO/deploy. Vercel configuration, preview noindex, sitemap registry, canonical metadata, truthful WebSite JSON-LD, AEO schema types only. Frozen dist unchanged. Environment example and security headers.
- [x] 8. Verification and handoff. Typecheck, tests, build, dependency audit, frontend freeze checks, independent review; exact external blockers, UI REQUIRED and free-tier limits. No false claim of live provider integration.

## Local implementation status
Checked tasks describe local implementation/review only. Provider acceptance, approved UI, commercial rules, scheduler and deployment remain incomplete; see docs/platform/delivery.md.
