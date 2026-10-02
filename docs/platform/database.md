# Database and RLS

Migration `202609290001_platform.sql` defines profiles; roles/user_roles; plans/prices/features/plan_features; billing_customers/checkout_sessions/subscriptions/subscription_events; payments/payment_events; entitlements; coupons/coupon_redemptions; leads/newsletter_subscribers; referrals/referral_rewards; consents; audit_logs; deletion_requests; outbox; rate_limits; billing_locks.

Canonical user foreign keys reference `auth.users(id)`. Profile/default STUDENT role/welcome-outbox creation is an Auth insert trigger with fixed search_path. No password, OAuth secret, refresh token or card data is stored in application tables.

RLS is enabled on every application table. Anonymous users can read the active public catalog only. Authenticated users read their own profile, role grants, subscriptions, payments, entitlements, consent history, leads/newsletter status, requests and issued referrals. Profile updates are column-granted only for optional display_name/grade/exam_type; clients cannot update disabled_at, roles, paid states or entitlements. Audit, event ledger, quotas and jobs are inaccessible to ordinary users. All service functions are explicitly revoked from public/anon/authenticated except the current-user access evaluators. Policies/grants are restricted to application-owned objects, not every table/function in an existing public schema.

Effective entitlements combine active default plan features, unexpired ACTIVE/TRIALING subscription features and unrevoked manual/promotion grants. PAST_DUE/EXPIRED/INCOMPLETE/CANCELLED provide no subscription features; cancellation at period end remains active until expiry. Disabled profiles cannot obtain entitlements. Product-specific grace periods are not invented. Refunds update financial records; they do not silently cancel an otherwise active Stripe subscription. Use the Stripe cancellation lifecycle to revoke subscription access.

Private Storage bucket is `private-resources`; ownership is first path segment equal to Supabase UUID. Only owning active users can read; signed URLs expire after 60 seconds. Uploads are service-only pending an approved feature/UI. Public-assets accepts PNG/JPEG/WebP, 5 MiB max; private-resources accepts PDF, 20 MiB max. Application does not provide upload UI. Shared premium-resource delivery is not implemented as a speculative educational feature.

## Migrations and rollback

Apply to a dedicated test project first. Migration is transactional. Verify schema, grants, RLS and Auth trigger before production. No migration has been applied remotely. Initial migration fails on conflicting existing object names rather than replacing unknown data. Once applied, do not edit history; write a forward migration. For rollback, revert app deployment, disable newly exposed writes, and apply a reviewed non-destructive forward correction. Do not drop tables or auth identities to roll back infrastructure.

## Tests and limits

SQL tests execute on PGlite (PostgreSQL WASM) with minimal test-only `auth.users`, `auth.uid`, roles and storage schema. They test real SQL policies/functions, two identities, attempted role escalation, trusted service access, quotas, subscription states, event rollback/duplicates, refunds, consent withdrawal, financial retention and private-file access. This is not proof of a hosted Supabase configuration: repeat with two real test Auth identities, anon client and service client against staging. Auth email/OAuth/Storage signing and concurrent multi-connection contention require live integration acceptance.
