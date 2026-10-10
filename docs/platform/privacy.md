# Privacy implementation and operations

## Stare curentă — 10 octombrie 2026

Pagina de preferințe este disponibilă la `/confidentialitate`; versiunea `local-test-v1` este configurată local. Proprietarul a verificat fluxul de acord/retragere în browser, iar evenimentele PostHog cu acord sunt vizibile. Istoricul deja colectat în PostHog nu se șterge automat la retragere; aplicația oprește colectarea viitoare și resetează identitatea locală. Informarea juridică completă, identitatea operatorului, contactul și termenele de păstrare încă trebuie aprobate înainte de lansare.

This document describes engineering behavior, not a legal compliance certification. No jurisdiction-specific retention period is invented. Before launch the owner must approve the privacy notice, terms, processor agreements, data regions, retention schedule and policy version.

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

No destructive provider operation has been performed. Establish an operator, access controls and a tested retention/deletion schedule before launch. Audit logs and webhook ledgers currently have no automatic purge job; review age/volume and implement the approved policy rather than accumulating indefinitely.

## UI REQUIRED — notă istorică

Acea constatare a fost depășită de aprobarea și livrarea paginilor; `/confidentialitate`, Auth, cont, programe și celelalte fluxuri enumerate sunt acum implementate. Vezi [pages-delivery.md](pages-delivery.md). Pagina de consimțământ nu înlocuiește politica juridică aprobată.

## Local completion update — 1 October 2026

The approved UI now exists; see pages-delivery.md. The former UI REQUIRED section is historical. Account deletion now creates an `erasure_cases` record with an independent ID and nullable identity link; it revokes optional consents and discards pending analytics jobs. `POST /api/v1/admin/erasure` is SUPER_ADMIN-only and records checkpoints for identity, storage, Stripe, Resend, PostHog, Sentry and retention review. It never performs or pretends to perform provider erasure. COMPLETED is rejected while the identity exists or checkpoints are absent. Operators must perform and verify the runbook steps before attesting to them. No names/emails are copied into the durable case.

The account page preserves export access for disabled accounts before identity removal. Audit export includes only action, ID and timestamp, not another user's identity. Coupon redemptions and own referral rewards are included. Apply the approved retention policy to the case register as well; no financial or legal retention period is hardcoded.
