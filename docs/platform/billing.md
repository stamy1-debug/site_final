# Billing lifecycle

Stripe owns card entry, recurring billing, invoices and the Customer Portal. The API accepts a database price UUID, checks the active plan/price server-side and binds the verified Supabase identity to one Stripe customer. No monthly/yearly amounts or paid feature mappings have been invented.

Checkout holds a per-user database lease and durably reserves a request generation before contacting Stripe. Retries reuse that idempotency key, including when Stripe succeeded but database response persistence failed. Existing open sessions are reused; an incompatible price or existing subscription requires the Portal. Uncertain requests beyond the provider idempotency window require manual reconciliation, not a new charge attempt.

## Webhooks

Subscribe the test endpoint `/api/v1/webhooks/stripe` to:
- `checkout.session.completed`
- `customer.subscription.created`, `.updated`, `.deleted`
- `invoice.paid`, `invoice.payment_failed`
- `charge.refunded`

The handler verifies the signature against unmodified bytes, rejects test/live mismatch, retrieves current Stripe objects, takes a customer lease, and calls one transactional SQL routine. The event ledger, subscription/payment state and outbox update atomically. Duplicates do not repeat effects; older subscription snapshots cannot replace newer ones. Financial mappings survive identity deletion with a null user reference; no further email is queued for an erased identity.

Access comes from current database state: active/trial subscriptions, unexpired periods and configured features. Unknown/past_due/unpaid/cancelled states fail closed. A success redirect never grants access. Cancellation scheduled at period end keeps active access until period end. Refunds are recorded; refunding an invoice does not by itself cancel a subscription in Stripe.

## Sandbox acceptance still required

Real Stripe test-mode monthly/yearly checkout, portal changes, asynchronous payment, failed renewal, cancellation, refund and redelivery must be exercised with the configured webhook API version. Unit tests use the SDK and synthetic signed payloads; they do not prove a configured Stripe account works.

Coupon tables exist but coupons and redemption orchestration are not enabled. Configure business rules and trusted Stripe promotion mappings before activating them. Referral reward fulfillment is likewise pending business rules.

For uncertain checkout/outbox delivery, inspect the stored request/dedupe ID against Stripe/Resend provider records before retrying. Never clear an unresolved reservation merely to bypass a conflict.
