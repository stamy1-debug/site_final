# Privacy implementation and operations

## Stare curentă — 16 octombrie 2026

Pagina de preferințe este disponibilă la `/confidentialitate`; versiunea `local-test-v1` este configurată local. Proprietarul a verificat fluxul de acord/retragere în browser, iar evenimentele PostHog cu acord sunt vizibile. Istoricul deja colectat în PostHog nu se șterge automat la retragere; aplicația oprește colectarea viitoare și resetează identitatea locală. La 15 octombrie, proprietarul a aprobat termenele de mai jos ca propunere operațională pentru redactarea informării, cu verificarea contabilului/avocatului necesară pentru obligațiile legale și categoriile financiare.

This document describes engineering behavior, not a legal compliance certification. Owner-approved operator/contact details for the notice: SS TEAM S.R.L., CUI 52720209, Reg. Com. J2025079707003, Romania, Bascov, Argeș, SAT GLAMBOCU COM. BASCOV, STR. GLAMBOC DN, NR. 39; contact `stelutaenache05@gmail.com`. Capital social was not provided and is omitted. The owner selected `Mate cu succes <notificari@matecusucces.com>` as the Resend From identity and `stelutaenache05@gmail.com` as Reply-To. The From identity does not require a separate inbox; responses go to the Gmail Reply-To. Transactional sending remains disabled until configured and tested.

## Termene aprobate de proprietar — propunere operațională

These periods were approved on 15 October 2026 as the working retention schedule for the notice and engineering plan. They must be implemented and checked against the company's accounting/legal obligations before public launch; approval here is not a legal compliance certification.

| Category | Working period | Operational rule |
|---|---|---|
| Account, profile and learning progress | While the account is active | On a verified deletion request, target removal within 30 days, except records subject to a documented legal obligation or hold. |
| Inactive accounts | 24 months without activity | Notify before deletion; then delete or anonymize the account and learning data unless a documented exception applies. |
| Parent email and student's consent declaration | While the minor's account is active | Delete with the account. The current checkbox records the student's statement; it is not independent proof that a parent confirmed. |
| Support messages | 12 months after the request is closed | Then delete or anonymize unless needed for an open dispute or legal claim. |
| Application/security logs and audit records | 12 months | Purge or anonymize on schedule; preserve only records covered by a documented hold. |
| Sentry error events | 90 days | Configure the provider to this period if the account plan supports it; verify the effective setting before production. |
| Consented PostHog analytics | 14 months | Keep optional analytics off until the policy is published and consent is collected; verify provider-side retention. |
| Accounting records | Applicable statutory term | The owner-approved working reference is the current accounting-law period for records in scope; the accountant must identify which application/payment records qualify and confirm the start date. Keep required financial evidence segregated from deletable learning/profile data. |

For minors, the owner approved requiring a parent/guardian email and the student's attestation that parental permission exists when the student identifies as under 18. The signup form applies this to email signup and Google signup. The app does not collect date of birth, impose a minimum age, send a parent confirmation link, or independently verify the parent's identity or permission. The captured timestamp is the student's attestation time, not proof of parent action. For processing based on consent in an information-society service offered directly to children, GDPR Article 8 sets Romania’s threshold at 16: below that, parental authorization is required and the controller must make reasonable efforts to verify it. The current student checkbox and parent email do not independently verify the parent. A qualified legal review must determine the lawful basis for each flow and whether the service may accept under-16 users before launch.

The owner approved restricting Sentry to the production hostnames and minimizing personal data in captured errors. Sentry project `node` allows only `matecusucces.com` and `www.matecusucces.com`; enhanced privacy, required server-side/default scrubbing and IP scrubbing are enabled organization-wide, with project scrubbing also enabled. Public issue sharing is off. A synthetic event after these changes did not show a raw IP, but it did show the derived city “Bucharest, Romania”; the public notice now explains this approximate location inference. Browser Sentry is gated by the analytics opt-in, but server error reporting is not consent-gated when its DSN is configured. The notice now describes this distinction; the operator and legal adviser still need to confirm its purpose and lawful basis before launch. The effective provider retention is not visible in the checked dashboard. The organization is on a Business trial, so confirm the retention and plan state before launch.

PostHog's current Free plan retains events for one year. This is shorter than the owner-approved maximum of 14 months and is reflected in the public notice; the provider retention window is plan-controlled and read-only. Keep the analytics setting consent-gated and replay/autocapture disabled.

Necessary authentication uses Supabase-managed sessions. Analytics and browser Sentry default to off; marketing is independent and required for newsletter subscription. Newsletter consent write and subscription write lock the same profile row, preventing a concurrent withdrawal from leaving an active subscription. Withdrawal unsubscribes. Newsletter campaign sending is not implemented.

## Data export

Authenticated `GET /api/v1/me/export` exports own identity/profile, roles, subscriptions, payments, entitlements, consent, leads, newsletter, deletion request and redacted referral information. Queries page through provider row caps. RLS remains applied. The endpoint is available after account disabling, before identity erasure; rate limit is three requests/minute. Large accounts may require an operator-assisted export because serverless time/response limits still apply. This API is not a complete export of records held separately by Stripe, Resend, PostHog and Sentry; retrieve those through their managed dashboards when handling a full data rights request.

## Account deletion runbook — not automatic erasure

`DELETE /api/v1/me` with `confirmation: DELETE_ACCOUNT` returns 202 REQUESTED, disables application access, removes the lead and unsubscribes newsletter. It does not claim that all records have been erased.

An authorized operator must:
1. Verify the request, preserve export access while needed, inspect active Stripe subscriptions and resolve cancellation/refund obligations with the owner.
2. Record required financial retention and separate it from deletable personal data. Do not erase invoices or records with unresolved obligations.
3. Delete user-owned Storage objects through Supabase Storage, not direct SQL storage metadata deletion.
4. Revoke managed sessions and erase eligible Supabase Auth identity. Personal foreign keys cascade; retained financial mappings lose their user link.
5. Remove eligible Stripe customer personal metadata, Resend recipient history, PostHog person/events and Sentry data using provider-supported operations. Track provider erasure outside the cascading user record using an approved minimal audit reference.
6. Confirm completion, including the backup-expiry policy and any retained data explanation. Do not mark complete while external erasure is outstanding.

No destructive provider operation has been performed. Establish an operator, access controls and a tested retention/deletion schedule before launch. Audit logs and webhook ledgers currently have no automatic purge job; implement the approved schedule, including these records, rather than accumulating indefinitely. GitHub history and Vercel deployment history back up source code/deployments, not the Supabase database, Auth users or Storage objects; the current Supabase Free project has no scheduled backup, and no database restore artifact has been tested.

## UI REQUIRED — notă istorică

Acea constatare a fost depășită de aprobarea și livrarea paginilor; `/confidentialitate`, Auth, cont, programe și celelalte fluxuri enumerate sunt acum implementate. Vezi [pages-delivery.md](pages-delivery.md). Pagina de consimțământ nu înlocuiește politica juridică aprobată.

## Local completion update — 1 October 2026

The approved UI now exists; see pages-delivery.md. The former UI REQUIRED section is historical. Account deletion now creates an `erasure_cases` record with an independent ID and nullable identity link; it revokes optional consents and discards pending analytics jobs. `POST /api/v1/admin/erasure` is SUPER_ADMIN-only and records checkpoints for identity, storage, Stripe, Resend, PostHog, Sentry and retention review. It never performs or pretends to perform provider erasure. COMPLETED is rejected while the identity exists or checkpoints are absent. Operators must perform and verify the runbook steps before attesting to them. No names/emails are copied into the durable case.

The account page preserves export access for disabled accounts before identity removal. Audit export includes only action, ID and timestamp, not another user's identity. Coupon redemptions and own referral rewards are included. Apply the approved retention policy to the case register as well; no financial or legal retention period is hardcoded.
