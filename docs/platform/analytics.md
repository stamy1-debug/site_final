# Analytics and CRO

Destination: the environment-specific PostHog project. Default: denied. Browser SDK loads only after analytics consent for the configured policy version; autocapture, replay, surveys, tracing and visual experiments are disabled. Withdrawal stops capture, resets identity and removes attribution storage. Authenticated consent is persisted even after a reload; anonymous evidence remains device-local pending approved consent UI.

| Event | Trigger/status | Application properties |
|---|---|---|
| page_view | Once per page after consent | path, approved UTM fields, landing_page, referrer origin |
| cta_clicked | Passive listener on existing CTA links | cta_id, path |
| signup_started | Auth facade signup call | none |
| signup_completed | Supabase accepts signup and returns user; not proof of email verification | none |
| login_completed | Auth session SIGNED_IN; deduplicated per sign-in | none |
| logout_completed | Successful facade signout | none |
| pricing_viewed | Taxonomy/facade ready; UI REQUIRED | plan_code if supplied |
| checkout_started | API returns Stripe Checkout URL | price_id |
| checkout_completed | Verified completed session and active/trial snapshot; server outbox | none |
| subscription_started | Applied transition into active/trial; server outbox | none |
| subscription_renewed | Applied paid invoice with billing_reason subscription_cycle; server outbox | none |
| subscription_cancelled | Applied subscription deletion; server outbox | none |
| lead_created | Taxonomy/facade available; approved form wiring pending | source if supplied |
| referral_created | Taxonomy/facade available; approved UI wiring pending | none |
| referral_converted | Reserved; attribution/reward business workflow pending | none |

Browser event IDs deduplicate within the controller lifetime. Server conversions use durable outbox keys as PostHog `$insert_id`; delivery requires analytics consent at enqueue and checks current policy/grant again before send. No guaranteed cross-device anonymous consent history exists. UUIDs are pseudonymous, not anonymous personal-data erasure.

Only allowlisted scalar properties pass; email/token-like values are dropped. Do not place names or sensitive free text in campaign values. Provider managed privacy settings must also be reviewed. First/last attribution is stored locally only with analytics consent; leads accept sanitized attribution. Feature flag reads are consent-gated and do not emit exposure events.

## Dashboard setup pending provider access

Create visitor → CTA → signup accepted → login → pricing → checkout → subscription funnels. Treat login as a proxy, not an implemented educational activation milestone. Compare source/medium/campaign and environment; construct weekly signup cohorts and return-page retention after real events arrive. Validate deduplication and payment conversion order in the test project before trusting conversion rates. No dashboard, cohort or experiment has been created remotely.
