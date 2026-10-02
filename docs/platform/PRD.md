# PRODUCT REQUIREMENTS DOCUMENT

## Mate cu succes — Production Platform Infrastructure

**Version:** 1.0  
**Status:** Ready for implementation  
**Product:** Mate cu succes  
**Scope:** Infrastructure, authentication, database, storage, payments, subscriptions, email, analytics, SEO, AEO/GEO, CRO, security, GDPR and monitoring.

---

# 1. OBJECTIVE

Mate cu succes already has an implemented public frontend including:

- visual identity;
- layouts;
- responsive behavior;
- animations;
- interactions;
- Three.js/WebGL experience;
- existing pages;
- existing navigation.

The objective of this project is **NOT to redesign or rebuild the frontend**.

The objective is to transform the existing frontend into the interface of a production-ready educational platform by implementing the required infrastructure behind it.

The platform must support:

- authentication;
- user accounts;
- database persistence;
- file storage;
- subscriptions;
- payments;
- plan-based access;
- transactional email;
- analytics;
- attribution;
- SEO;
- AEO/GEO;
- CRO measurement;
- security;
- GDPR;
- monitoring;
- future educational modules.

---

# 2. NON-NEGOTIABLE PRINCIPLE

## PRESERVE THE EXISTING FRONTEND

The existing frontend is considered:

> **COMPLETE / APPROVED / FROZEN**

The existing frontend is the visual specification.

Infrastructure must be built **around and underneath the existing frontend**.

The implementation must not redesign the product.

---

# 3. APPROVED TECHNOLOGY STACK

The approved infrastructure stack is:

```text
VERCEL
+
SUPABASE
+
STRIPE
+
RESEND
+
POSTHOG
+
SENTRY
```

These providers are fixed for the MVP unless explicit approval is given to change them.

---

# 4. RESPONSIBILITIES

## Vercel

Responsible for:

- frontend hosting;
- production deployment;
- preview deployments;
- environment configuration;
- Next.js execution;
- CDN/edge delivery where provided;
- production domain integration.

---

## Supabase

Responsible for:

- PostgreSQL;
- authentication;
- Google OAuth;
- email/password authentication;
- session/token infrastructure;
- password reset;
- email verification;
- Row Level Security;
- file/object storage.

---

## Stripe

Responsible for:

- payments;
- recurring subscriptions;
- Checkout;
- monthly/yearly billing;
- supported payment methods;
- Customer Portal;
- coupons where appropriate;
- payment lifecycle;
- payment webhooks.

---

## Resend

Responsible for:

- transactional application email;
- lifecycle email infrastructure;
- product notifications.

Authentication-specific email flows may initially remain within Supabase where appropriate.

---

## PostHog

Responsible for:

- product analytics;
- event tracking;
- funnels;
- cohorts;
- retention;
- attribution;
- session replay where enabled;
- feature flags;
- experimentation infrastructure.

---

## Sentry

Responsible for:

- frontend error monitoring;
- backend/server error monitoring;
- stack traces;
- production debugging;
- performance monitoring where appropriate.

---

# 5. NO PROVIDER SUBSTITUTION

DO NOT introduce another provider for functionality already covered by the approved stack without explicit approval.

Do NOT introduce, for example:

- Firebase;
- Clerk;
- Auth0;
- Neon;
- MongoDB;
- PlanetScale;
- AWS S3;
- Cloudflare;
- SendGrid;
- Mailgun;
- Mixpanel;
- Amplitude;
- Datadog;

where the required capability is already adequately covered by the approved stack.

---

# 6. FREE-TIER-FIRST POLICY

During MVP development:

> Use the free tier of each approved service whenever available and technically sufficient.

Do not move to a paid infrastructure tier merely for convenience.

Before introducing a recurring infrastructure expense:

1. determine whether the current free tier supports the requirement;
2. identify the limitation;
3. explain why the limitation blocks or materially harms the product;
4. estimate the required paid tier/cost;
5. request approval where practical.

---

# 7. DO NOT BUILD SOLVED INFRASTRUCTURE

Do NOT build from scratch:

- authentication servers;
- password storage infrastructure;
- OAuth servers;
- session infrastructure already provided by Supabase;
- PostgreSQL hosting;
- file-storage infrastructure;
- payment-card processing;
- checkout forms where Stripe Checkout is sufficient;
- analytics infrastructure;
- session recording infrastructure;
- error-monitoring infrastructure;
- email-delivery infrastructure.

Engineering time should focus on Mate cu succes-specific business logic.

---

# 8. TARGET ARCHITECTURE

```text
                         USERS
                           │
                           ▼
                 ┌─────────────────┐
                 │     VERCEL      │
                 │                 │
                 │ Existing        │
                 │ Next.js UI      │
                 │ Three.js/WebGL  │
                 └────────┬────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
        ┌────────────┐        Application Logic
        │  SUPABASE  │
        │            │
        │ Auth       │
        │ PostgreSQL │
        │ Storage    │
        │ RLS        │
        └─────┬──────┘
              │
       ┌──────┼───────────────┐
       │      │               │
       ▼      ▼               ▼
    STRIPE  RESEND          POSTHOG
   Payments  Email         Analytics
       │
       ▼
    Webhooks
       │
       ▼
Subscriptions /
Entitlements

                     SENTRY
                       │
             Frontend + server errors
```

---

# 9. FRONTEND FREEZE

The implementation agent MUST NOT independently modify:

- layouts;
- page structure;
- typography;
- fonts;
- font sizes;
- colors;
- backgrounds;
- gradients;
- borders;
- shadows;
- spacing;
- margins;
- padding;
- responsive design;
- breakpoints;
- existing copy;
- existing navigation;
- existing CTA wording;
- buttons;
- icons;
- images;
- videos;
- branding;
- Three.js scenes;
- WebGL effects;
- shaders;
- 3D models;
- particle systems;
- camera behavior;
- mouse interactions;
- scroll interactions;
- GSAP animations;
- transitions;
- loading animations;
- mobile behavior.

---

# 10. FRONTEND PROHIBITIONS

DO NOT:

- redesign pages;
- modernize the design;
- simplify the design;
- replace existing components;
- change navigation;
- change the visual hierarchy;
- change animations;
- remove Three.js;
- replace WebGL with static alternatives;
- introduce a new design system;
- migrate the frontend framework;
- perform unrelated frontend refactoring;
- rewrite existing copy;
- modify existing CTAs for CRO;
- alter responsive behavior.

A technically "better" frontend implementation is NOT justification for changing the approved frontend.

---

# 11. ALLOWED FRONTEND CHANGES

Only integration-related or invisible modifications are allowed without additional approval.

Examples:

- Supabase client initialization;
- auth provider/context;
- authentication state;
- connecting existing login buttons;
- connecting existing CTAs;
- API calls;
- replacing mocked data with real data;
- PostHog initialization;
- analytics events;
- Sentry initialization;
- metadata;
- canonical URLs;
- structured data;
- sitemap integration;
- consent-aware script loading;
- security configuration;
- error boundaries.

These changes must preserve the existing visual appearance.

---

# 12. NEW UI RULE

If implementation requires a visible component that does not currently exist, the agent MUST NOT independently design it.

Examples:

- login modal;
- signup form;
- pricing modal;
- user dashboard;
- cookie banner;
- account menu;
- payment screen;
- subscription-management screen.

Instead:

1. implement everything possible behind the component;
2. continue unrelated work;
3. report:

```text
UI REQUIRED

Component:
Reason:
Backend already implemented:
Required frontend action:
```

---

# 13. SUPABASE

Create/configure the Mate cu succes Supabase project.

Use Supabase for:

```text
Auth
PostgreSQL
Storage
Row Level Security
```

Do not provision another database or authentication service.

---

# 14. AUTHENTICATION

Use **Supabase Auth**.

Do NOT implement custom authentication.

Required functionality:

- email/password registration;
- email/password login;
- Google OAuth;
- email verification;
- logout;
- password reset;
- password change;
- session management;
- token refresh;
- account disable capability;
- account deletion workflow.

---

# 15. GOOGLE OAUTH

Google authentication must use Supabase OAuth.

Architecture:

```text
User
 ↓
Existing UI
 ↓
Supabase Auth
 ↓
Google OAuth
 ↓
Supabase
 ↓
Authenticated Session
```

Do NOT manually implement Google OAuth.

---

# 16. AUTH IDENTITY

Supabase user identity is the canonical user identity.

Do NOT create a second independent authentication identity system.

Application tables should reference the Supabase user ID.

---

# 17. AUTHORIZATION

Authentication and authorization are different concerns.

Supabase verifies identity.

The application determines what the authenticated user is allowed to do.

Initial roles:

```text
STUDENT
PARENT
TEACHER
ADMIN
SUPER_ADMIN
```

Authorization must always be enforced server-side and/or through appropriate RLS policies.

Never rely solely on hidden frontend elements.

---

# 18. DATABASE

Use **Supabase PostgreSQL**.

Do NOT provision:

- Neon;
- Railway PostgreSQL;
- standalone PostgreSQL;
- MongoDB;
- Firebase Database;

for application data.

---

# 19. INITIAL DATA MODEL

Prepare the application schema for:

```text
profiles

roles
user_roles

plans
prices

features
plan_features

subscriptions
subscription_events

payments
payment_events

entitlements

coupons
coupon_redemptions

leads
newsletter_subscribers

referrals
referral_rewards

consents

audit_logs
```

Future educational tables are outside this PRD unless already required.

---

# 20. DATABASE DESIGN REQUIREMENTS

Use appropriate:

- UUIDs;
- foreign keys;
- unique constraints;
- indexes;
- timestamps;
- status fields;
- nullable/non-null constraints;
- cascading rules.

Avoid unnecessary duplicated data.

Application tables referencing users should reference Supabase identities correctly.

---

# 21. DATABASE MIGRATIONS

Database schema must be reproducible.

Use Supabase migrations or the existing appropriate migration workflow.

DO NOT make production schema changes only through manual dashboard actions.

Schema changes must be represented in version-controlled migrations.

---

# 22. ROW LEVEL SECURITY

Enable and configure Supabase RLS where appropriate.

Users should be able to access only data they are authorized to access.

For example:

A normal user may access:

```text
their profile
their subscription information
their entitlements
their user-specific application data
```

A normal user must NOT access:

```text
other users' profiles
other users' subscriptions
other users' payments
audit logs
admin-only data
```

RLS policies must be tested.

---

# 23. SUPABASE SERVICE ROLE

The Supabase service-role credential:

- must NEVER be exposed in frontend code;
- must NEVER be committed;
- must only be used in trusted server environments;
- must follow least-privilege principles wherever possible.

---

# 24. STORAGE

Use **Supabase Storage**.

Potential future storage:

```text
PDF files
worksheets
educational resources
generated documents
profile assets
public educational assets
```

Separate public and private buckets.

Private files must not be placed in public buckets for convenience.

Use signed URLs where appropriate.

---

# 25. APPLICATION BUSINESS LOGIC

Do NOT create a large backend merely because one was originally planned.

Use the simplest architecture compatible with the existing repository.

Application/server logic should handle only functionality not appropriately delegated to the approved providers.

Examples:

```text
entitlement evaluation
checkout-session creation
Stripe webhook processing
subscription synchronization
coupon/business rules
referral rules
admin-specific operations
future educational business logic
```

---

# 26. API STRUCTURE

Where custom APIs are required, use a clear versioned structure such as:

```text
/api/v1/me

/api/v1/plans
/api/v1/entitlements

/api/v1/checkout
/api/v1/subscriptions

/api/v1/coupons
/api/v1/referrals

/api/v1/webhooks/stripe
```

Exact structure may adapt to the existing architecture.

---

# 27. PLANS

Initial conceptual plans:

```text
FREE
PREMIUM
PREMIUM_PLUS
```

These are product entities, not hardcoded application conditions.

Final prices are NOT defined by this PRD.

Prices must be configurable.

---

# 28. FEATURES

Create a feature model.

Potential future features:

```text
premium_content
unlimited_exercises
advanced_tests
bac_generator
ai_tutor
pdf_downloads
advanced_statistics
```

The existence of a feature in this list does NOT mean it should be implemented now.

It defines access-control infrastructure.

---

# 29. ENTITLEMENTS

Access should be determined through entitlements.

Conceptually:

```text
has_entitlement(user, "premium_content")
```

Avoid spreading:

```text
if user.plan == "PREMIUM"
```

throughout the application.

This enables future plan changes without rewriting product logic.

---

# 30. STRIPE

Use **Stripe** for all payment infrastructure.

Do NOT build custom payment-card handling.

Use Stripe for:

- Checkout;
- customers;
- subscriptions;
- monthly billing;
- yearly billing;
- supported payment methods;
- coupons where appropriate;
- Customer Portal;
- refunds;
- payment lifecycle;
- billing webhooks.

---

# 31. STRIPE CHECKOUT

Use **Stripe-hosted Checkout** initially.

Preferred architecture:

```text
User
 ↓
Existing Premium CTA
 ↓
Server creates Stripe Checkout Session
 ↓
Stripe Checkout
 ↓
Payment
 ↓
Stripe webhook
 ↓
Application
 ↓
Supabase DB
 ↓
Entitlements
```

Do NOT build a custom card-entry UI unless explicitly requested later.

---

# 32. PAYMENT METHODS

Enable relevant payment methods supported by Stripe and the configured account.

Where available and appropriate:

- cards;
- Apple Pay;
- Google Pay.

Do not store card information.

---

# 33. STRIPE CUSTOMER PORTAL

Use Stripe Customer Portal for:

- subscription management;
- cancellation;
- payment methods;
- billing history;

where the managed portal satisfies requirements.

Do NOT build a custom billing-management frontend merely to duplicate Stripe functionality.

---

# 34. STRIPE WEBHOOKS

Webhook processing is mandatory.

Handle relevant events including:

```text
checkout.session.completed

invoice.paid
invoice.payment_failed

customer.subscription.created
customer.subscription.updated
customer.subscription.deleted

charge.refunded
```

Adapt event selection to the current Stripe API/version.

---

# 35. WEBHOOK SECURITY

Stripe webhooks must implement:

- signature verification;
- idempotent processing;
- duplicate-event protection;
- persistence/logging of processed event IDs;
- retry-safe logic;
- error handling.

Never grant Premium based solely on the browser reaching a success URL.

Backend-confirmed Stripe state is authoritative.

---

# 36. SUBSCRIPTIONS

Support:

```text
monthly
yearly
```

Internal subscription states should map Stripe state into application-level state.

Possible states:

```text
ACTIVE
TRIALING
PAST_DUE
CANCELLED
EXPIRED
INCOMPLETE
```

Do not duplicate unnecessary Stripe information.

---

# 37. BILLING DATA

Store sufficient application-side information such as:

```text
user_id

stripe_customer_id
stripe_subscription_id

plan_id

status

current_period_start
current_period_end

cancel_at_period_end
```

Stripe remains the authoritative payment system.

---

# 38. COUPONS

Support Stripe coupons/promotion codes where appropriate.

Application infrastructure should support campaign attribution such as:

```text
WELCOME
BAC
TIKTOK
REFERRAL
```

These are examples only.

Do NOT automatically create live promotions.

---

# 39. REFERRALS

Prepare basic referral infrastructure.

Example:

```text
referral_code

referrer_user_id
referred_user_id

status

reward_type
reward_value

created_at
converted_at
```

Do not implement financially meaningful rewards without appropriate anti-abuse logic.

---

# 40. RESEND

Use **Resend** for product/transactional email.

Potential email categories:

```text
welcome

subscription activated

payment failed

subscription cancelled

subscription expiring

account/security notification

future educational notification
```

Do NOT build email-delivery infrastructure.

---

# 41. AUTHENTICATION EMAILS

For:

```text
email verification
password reset
```

use Supabase authentication flows initially.

Do not duplicate authentication email infrastructure unnecessarily.

---

# 42. EMAIL ARCHITECTURE

Application email logic should remain separated from business logic.

Conceptually:

```text
EmailService
    │
    ▼
Resend
```

Templates should be reusable and versionable.

---

# 43. EMAIL DOMAIN

Prepare proper sending-domain configuration for Resend.

Configure relevant DNS records when credentials/domain access are available.

Do not claim production email is operational until domain verification is complete.

---

# 44. POSTHOG

Use **PostHog** as the primary product analytics platform.

Implement:

- event tracking;
- funnels;
- cohorts;
- retention;
- feature flags;
- experimentation infrastructure;
- session replay if approved and consent-compliant.

---

# 45. EVENT TAXONOMY

Implement a documented event taxonomy.

Initial events:

```text
page_view

cta_clicked

signup_started
signup_completed

login_completed
logout_completed

pricing_viewed

checkout_started
checkout_completed

subscription_started
subscription_renewed
subscription_cancelled

lead_created

referral_created
referral_converted
```

Do not send unnecessary personal information.

---

# 46. EVENT REQUIREMENTS

Each analytics event must document:

```text
event name
description
trigger
properties
destination
consent requirement
```

Avoid duplicate event firing.

Events should use consistent naming.

---

# 47. ATTRIBUTION

Capture:

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term

referrer
landing_page
```

Where appropriate preserve:

```text
first-touch attribution
last-touch attribution
```

The infrastructure should eventually allow analysis such as:

```text
TikTok
 ↓
Landing page
 ↓
Signup
 ↓
Checkout
 ↓
Premium
```

---

# 48. SESSION REPLAY

PostHog session replay may be enabled only when privacy requirements are satisfied.

Mask sensitive data.

Never capture:

- passwords;
- authentication tokens;
- payment information;
- sensitive private form content.

---

# 49. CRO

CRO in this PRD means:

> MEASURE FIRST.

Do NOT redesign the frontend for CRO.

Track the existing journey:

```text
visitor
 ↓
CTA
 ↓
signup
 ↓
activation
 ↓
pricing
 ↓
checkout
 ↓
subscription
```

Measure:

- conversion rate;
- drop-off;
- activation;
- retention;
- checkout completion.

---

# 50. FEATURE FLAGS

Use PostHog feature flags for future experimentation infrastructure.

Possible future flags:

```text
pricing_v2
onboarding_v2
cta_test
annual_plan_default
```

Do NOT activate visual experiments under this PRD.

---

# 51. A/B TESTING

Prepare infrastructure only.

DO NOT change:

- headlines;
- CTA wording;
- pricing;
- layout;
- visual hierarchy;

without explicit approval.

A/B tests affecting the visible frontend are a separate product task.

---

# 52. SEO

Implement technical SEO while preserving the existing visual frontend.

Required:

- crawlable HTML;
- correct HTTP status codes;
- title metadata;
- meta descriptions;
- canonical URLs;
- robots.txt;
- sitemap.xml;
- Open Graph metadata;
- social metadata;
- redirects;
- index/noindex controls;
- semantic HTML where possible without visual change.

---

# 53. THREE.JS SEO RULE

Three.js/WebGL must remain.

DO NOT remove or visually simplify the Three.js experience for SEO.

Instead:

> SEO must coexist with Three.js.

Important searchable information should not require search engines to interpret WebGL to understand the page.

Use semantic/crawlable content underneath or alongside the existing visual experience where technically appropriate and visually non-disruptive.

---

# 54. SITEMAP

Implement dynamic/scalable sitemap generation.

Prepare for future routes such as:

```text
/

/clasa-5
/clasa-6
/clasa-7
/clasa-8

/evaluare-nationala

/bac
/bac/mate-info
/bac/stiinte
/bac/tehnologic

/lectii
/exercitii
/formule
/teste
/simulari
```

Do NOT automatically create these pages unless they exist.

Do NOT generate thousands of thin pages for SEO.

---

# 55. ROBOTS

Implement a correct `robots.txt`.

Production should expose intended public content.

Prevent indexing where appropriate for:

```text
authentication callbacks
private account areas
internal utility routes
admin
staging/preview environments
```

Preview/staging deployments should not accidentally become indexed.

---

# 56. CANONICALS

Implement canonical URLs.

Prevent duplicate indexing caused by:

- query parameters;
- tracking parameters;
- alternate URLs;
- accidental route duplication.

UTM parameters must not create independent canonical pages.

---

# 57. STRUCTURED DATA

Implement valid structured data where it truthfully represents visible content.

Potential schema types:

```text
Organization
WebSite
BreadcrumbList
Article
Course
FAQPage
VideoObject
```

Only use schema that accurately matches the page.

Do not create misleading structured data.

Validate schema.

---

# 58. AEO

Prepare the platform for **Answer Engine Optimization**.

Future educational content should be structurally capable of representing:

```text
Question

Direct Answer

Explanation

Formula

Worked Example

Common Mistakes

FAQ

Related Concepts
```

This PRD does NOT authorize rewriting existing content.

---

# 59. GEO

Prepare the platform for **Generative Engine Optimization**.

Goals:

- clear semantic structure;
- identifiable entities;
- canonical source pages;
- clear authorship/organization information where appropriate;
- machine-readable content;
- stable URLs;
- crawlability;
- direct factual answers;
- meaningful internal linking.

Do not add artificial AI-targeted keyword stuffing.

---

# 60. PERFORMANCE / CORE WEB VITALS

Infrastructure changes must not unnecessarily degrade:

```text
LCP
INP
CLS
```

Monitor:

- JS payload;
- third-party script impact;
- API latency;
- image loading;
- Three.js initialization;
- analytics overhead.

Load third-party scripts responsibly.

---

# 61. VERCEL

Use **Vercel** for deployment.

Maintain:

```text
production
preview
development
```

environments.

Use Vercel environment variables/secrets appropriately.

Do not commit production secrets.

---

# 62. VERCEL PREVIEWS

Pull requests/branches may use preview deployments where supported.

Preview deployments must not accidentally:

- use production payment credentials;
- mutate production data;
- send production emails;
- pollute production analytics;
- become search-engine indexed.

---

# 63. ENVIRONMENT SEPARATION

At minimum distinguish:

```text
development
production
```

Prefer:

```text
development
preview/staging
production
```

Use Stripe test mode outside production.

Use separate configuration for analytics where appropriate.

---

# 64. SENTRY

Use **Sentry** for application error monitoring.

Integrate with the frontend/server environment as appropriate.

Capture:

- unhandled frontend exceptions;
- server exceptions;
- failed API operations;
- stack traces;
- performance information where useful.

---

# 65. SENTRY PRIVACY

Do NOT intentionally send:

- passwords;
- access tokens;
- refresh tokens;
- Stripe secrets;
- Supabase service keys;
- payment-card data;
- sensitive form contents.

Configure filtering/scrubbing where necessary.

---

# 66. SECURITY

Security is mandatory.

Implement:

- HTTPS;
- secure session handling;
- server-side authorization;
- Supabase RLS;
- input validation;
- CORS restrictions;
- secure headers;
- rate limiting where required;
- brute-force mitigation;
- webhook verification;
- secrets management;
- least privilege;
- dependency monitoring.

---

# 67. RATE LIMITING

Protect sensitive/high-cost operations such as:

```text
authentication-related operations
password-reset related operations
checkout-session creation
coupon validation
referral operations
admin operations
future expensive API endpoints
```

Use existing managed/platform capabilities where sufficient.

Do not build unnecessarily complex distributed infrastructure.

---

# 68. SECRETS

Secrets must use environment configuration.

Conceptual variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

RESEND_API_KEY

NEXT_PUBLIC_POSTHOG_KEY

SENTRY_DSN
```

Use the exact current environment-variable requirements of each SDK.

Never expose server-only credentials through `NEXT_PUBLIC_*`.

---

# 69. GDPR

Prepare the platform for GDPR requirements.

Support:

- necessary consent;
- analytics consent;
- marketing consent;
- preference consent where applicable;
- consent withdrawal;
- consent versioning;
- data export;
- account deletion;
- retention policies.

---

# 70. CONSENT MODEL

Store appropriate consent information.

Conceptually:

```text
user_id / anonymous identifier

consent_type

status

policy_version

timestamp
```

Do not collect unnecessary personal information merely for consent records.

---

# 71. COOKIE CONSENT

Non-essential tracking must respect applicable consent requirements.

Categories:

```text
Necessary
Analytics
Marketing
Preferences
```

If the existing frontend does not contain a cookie-consent interface:

```text
UI REQUIRED — Cookie Consent Component
```

Do NOT independently redesign the frontend to insert one.

---

# 72. DATA EXPORT

Implement backend capability allowing a user to request/export relevant personal information.

The implementation must be secure and authenticated.

Do not expose another user's data.

---

# 73. ACCOUNT DELETION

Implement account deletion workflow.

Deletion should appropriately handle:

- Supabase identity;
- profile;
- user-generated application data;
- marketing records;
- analytics identity where applicable;
- legally required financial records.

Do not blindly cascade-delete accounting/payment records that may require retention.

Use anonymization where appropriate.

---

# 74. MINORS

The platform may be used by minors.

Therefore:

- minimize collected personal information;
- avoid unnecessary profiling;
- do not expose private user information;
- keep privacy requirements in mind when implementing analytics;
- ensure consent/legal requirements can evolve without architectural rewrite.

This PRD does not replace legal review.

---

# 75. ADMINISTRATION

Do NOT immediately build a large custom admin panel.

Use existing provider dashboards wherever appropriate.

---

# 76. SUPABASE DASHBOARD

Use for appropriate:

- user inspection;
- database inspection;
- storage;
- logs;
- project configuration.

---

# 77. STRIPE DASHBOARD

Use for:

- customers;
- payments;
- subscriptions;
- refunds;
- invoices;
- payment troubleshooting.

---

# 78. POSTHOG DASHBOARD

Use for:

- analytics;
- funnels;
- cohorts;
- retention;
- session replay;
- feature flags.

---

# 79. SENTRY DASHBOARD

Use for:

- errors;
- stack traces;
- regressions;
- performance monitoring.

---

# 80. VERCEL DASHBOARD

Use for:

- deployments;
- environment variables;
- domains;
- deployment logs;
- runtime monitoring where available.

---

# 81. CUSTOM ADMIN RULE

Only build custom administration functionality when Mate cu succes-specific operations cannot reasonably be handled through existing provider dashboards.

Do NOT recreate Stripe, Supabase, PostHog or Sentry dashboards.

---

# 82. LEADS

Prepare basic lead storage.

Potential fields:

```text
id
email
source
utm_source
utm_medium
utm_campaign
landing_page
created_at
marketing_consent
```

Avoid duplicate lead records where appropriate.

---

# 83. NEWSLETTER

Prepare newsletter subscriber infrastructure.

Store:

```text
email
status
consent
source
created_at
unsubscribed_at
```

Do not automatically subscribe registered users to marketing communication without appropriate consent.

---

# 84. LIFECYCLE EMAIL HOOKS

Prepare events/hooks for future sequences such as:

```text
signup
 ↓
welcome

checkout started
 ↓
no purchase
 ↓
possible follow-up

payment failed
 ↓
payment notification

subscription cancelled
 ↓
cancellation confirmation
```

Do not activate aggressive marketing automation without approval.

---

# 85. OBSERVABILITY

The system must make important failures visible.

Monitor:

- application errors;
- Supabase-related failures;
- Stripe webhook failures;
- email-delivery failures;
- checkout errors;
- authentication errors;
- unexpected server failures.

Use Sentry and provider-native dashboards/logs rather than creating a custom monitoring platform.

---

# 86. HEALTH CHECKS

Where custom server/API logic exists, provide health/readiness mechanisms where technically appropriate.

Health checks should not expose sensitive infrastructure information publicly.

---

# 87. AUDIT LOGS

Maintain application-level audit records for sensitive Mate cu succes-specific actions where appropriate.

Examples:

```text
ROLE_CHANGED

ACCOUNT_DISABLED

ENTITLEMENT_CHANGED

COUPON_APPLIED

REFERRAL_REWARD_GRANTED

ACCOUNT_DELETION_REQUESTED
```

Do not duplicate every provider log unnecessarily.

---

# 88. BACKUPS

Use Supabase-managed database backup capabilities available under the selected plan.

Document:

- what backup capability currently exists;
- free-tier limitations;
- what upgrade would be necessary if stronger recovery guarantees become required.

Do not claim disaster recovery guarantees that the selected tier does not provide.

---

# 89. TESTING STRATEGY

Implement automated testing for custom application logic.

Do not attempt to test Supabase/Stripe/PostHog themselves.

Test our integration with them.

---

# 90. AUTH TESTS

Test:

```text
authenticated user accepted

missing token rejected

invalid token rejected

expired token rejected

unauthorized role rejected

authorized role accepted
```

---

# 91. RLS TESTS

Verify:

```text
user can access own permitted data

user cannot access another user's private data

normal user cannot access admin data

server-side trusted operations work as intended
```

---

# 92. PAYMENT TESTS

Using Stripe test mode, test:

```text
checkout creation

successful checkout

failed payment

valid webhook

invalid webhook signature

duplicate webhook

subscription activation

subscription update

subscription cancellation

payment failure

refund
```

---

# 93. ENTITLEMENT TESTS

Test:

```text
FREE user
PREMIUM user
PREMIUM_PLUS user

subscription upgrade
subscription downgrade
subscription cancellation
expired subscription
failed payment state
```

---

# 94. ANALYTICS TESTS

Verify:

```text
events fire once

events use correct names

expected properties exist

UTM attribution works

sensitive information is not included

consent state is respected
```

---

# 95. SEO TESTS

Verify:

```text
metadata

canonical

robots.txt

sitemap.xml

structured data

status codes

index/noindex rules

preview environment indexing protection
```

---

# 96. FRONTEND REGRESSION TESTING

Before infrastructure implementation, capture the existing frontend baseline.

After implementation verify:

```text
same layout

same typography

same colors

same spacing

same Three.js scenes

same animations

same interactions

same scroll behavior

same responsive behavior

same mobile behavior

same navigation
```

Infrastructure work must not cause visual regression.

---

# 97. PERFORMANCE REGRESSION

Compare before/after where practical.

Infrastructure integrations must not unnecessarily degrade:

- initial page load;
- interaction responsiveness;
- Three.js performance;
- Core Web Vitals.

Third-party SDKs should be initialized responsibly.

---

# 98. IMPLEMENTATION PHASE 0 — AUDIT

Before modifying code:

1. inspect repository;
2. identify framework/version;
3. identify routing architecture;
4. identify existing server/API logic;
5. identify deployment configuration;
6. identify existing environment variables;
7. identify existing auth;
8. identify existing analytics;
9. identify existing SEO;
10. identify existing tests.

Run the current:

```text
build
lint
typecheck
tests
```

where available.

Record the baseline.

DO NOT begin by refactoring the frontend.

---

# 99. PHASE 1 — VERCEL

Verify/configure:

```text
production deployment

preview deployments

environment variables

production domain

preview indexing protection
```

Do not migrate hosting away from Vercel.

---

# 100. PHASE 2 — SUPABASE FOUNDATION

Configure:

```text
Supabase project

PostgreSQL

schema migrations

Auth

Google OAuth

Storage

RLS
```

Connect existing frontend to Supabase without visual modification.

---

# 101. PHASE 3 — USER / AUTHORIZATION LAYER

Implement:

```text
profiles

roles

user_roles

authorization

user/session integration
```

Verify RLS.

---

# 102. PHASE 4 — COMMERCIAL MODEL

Implement:

```text
plans

prices

features

plan_features

subscriptions

entitlements
```

No payment UI redesign.

---

# 103. PHASE 5 — STRIPE

Implement:

```text
Stripe customers

Checkout

monthly subscriptions

yearly subscriptions

Customer Portal

webhooks

subscription synchronization

refund state

payment failure state

coupons where needed
```

Use Stripe test mode until production configuration is explicitly enabled.

---

# 104. PHASE 6 — RESEND

Implement:

```text
Resend integration

transactional email service

email templates

subscription/payment emails

domain configuration
```

Use Supabase flows for authentication emails unless a reason exists to change.

---

# 105. PHASE 7 — POSTHOG

Implement:

```text
PostHog SDK

event taxonomy

funnels

attribution

feature flags

consent-aware analytics

session replay configuration if approved
```

Do not redesign frontend based on analytics during this phase.

---

# 106. PHASE 8 — SEO

Implement:

```text
metadata

canonical URLs

robots.txt

sitemap.xml

Open Graph

structured data

crawlability

preview noindex
```

Preserve Three.js and existing design.

---

# 107. PHASE 9 — AEO/GEO

Implement technical foundations:

```text
semantic content support

structured content model support

canonical source structure

machine-readable metadata

future FAQ/question-answer support
```

Do not rewrite existing content.

---

# 108. PHASE 10 — CRO INFRASTRUCTURE

Implement:

```text
funnels

conversion tracking

drop-off measurement

cohorts

retention

feature-flag infrastructure
```

Do NOT launch visual experiments.

---

# 109. PHASE 11 — SENTRY

Integrate:

```text
frontend error tracking

server error tracking

error filtering

environment separation

release/deployment identification where appropriate
```

Verify sensitive data is not exposed.

---

# 110. PHASE 12 — SECURITY / GDPR

Complete:

```text
RLS review

authorization review

secrets review

rate limiting

consent storage

analytics consent

marketing consent

data export

account deletion

audit logging
```

---

# 111. EXTERNAL CONFIGURATION BLOCKERS

The implementation may eventually require account-owner actions such as:

```text
Supabase project configuration

Google OAuth credentials

Stripe account setup

Stripe product/price creation

Stripe production activation

Resend domain verification

PostHog project key

Sentry project configuration

Vercel domain/environment configuration
```

When required, do NOT abandon the entire implementation.

Stop only the blocked integration.

Report:

```text
BLOCKER

Service:
Required action:
Why required:
What is already implemented:
What remains:
```

Continue independent work.

---

# 112. AGENT AUTONOMY

Once implementation begins, continue autonomously through safe, reversible and clearly defined tasks.

Do NOT repeatedly ask permission to:

- create database migrations;
- create application modules;
- configure SDKs;
- write tests;
- fix test failures;
- add documentation;
- implement the next PRD phase;
- refactor newly written integration code.

---

# 113. STOP CONDITIONS

Stop and request input only when:

1. credentials/account-owner action is required;
2. a destructive production operation is required;
3. a visible frontend modification is required;
4. an important product decision is unspecified;
5. proceeding would risk existing production data;
6. moving from free to paid infrastructure is required.

---

# 114. NO DESTRUCTIVE OPERATIONS

Do NOT:

- drop production databases;
- delete production users;
- erase production storage;
- reset production projects;
- rewrite Git history;
- force push;
- remove unrelated code;
- overwrite unrelated user work;
- disable existing functionality.

---

# 115. SOURCE CONTROL

Changes should be:

- incremental;
- reviewable;
- logically grouped.

Do not mix unrelated refactors with infrastructure work.

Do not perform massive formatting changes across the repository.

---

# 116. CONTINUOUS VERIFICATION

After meaningful implementation steps run available:

```text
lint
typecheck
tests
build
```

Do not continue accumulating known regressions.

Fix regressions caused by the implementation before proceeding.

---

# 117. DOCUMENTATION

Create/update documentation covering:

```text
architecture

local setup

environment variables

Supabase setup

Google OAuth

database migrations

RLS

Stripe setup

Stripe webhooks

Resend

PostHog

Sentry

Vercel deployment

SEO

analytics events

GDPR flows
```

---

# 118. ENVIRONMENT EXAMPLE

Maintain a safe `.env.example`.

It should contain variable names and documentation but NEVER real secrets.

---

# 119. DEFINITION OF DONE — VERCEL

Complete when:

- production deployment works;
- previews work where applicable;
- environments are separated;
- secrets are configured correctly;
- preview indexing is prevented.

---

# 120. DEFINITION OF DONE — SUPABASE

Complete when:

- database works;
- migrations are reproducible;
- email/password auth works;
- Google OAuth works;
- sessions work;
- password reset works;
- RLS works;
- Storage is correctly configured where required.

---

# 121. DEFINITION OF DONE — STRIPE

Complete when:

- Checkout works in test mode;
- monthly subscriptions work;
- yearly subscriptions work;
- webhooks verify correctly;
- duplicate webhooks are safe;
- subscription state synchronizes;
- entitlements synchronize;
- cancellation works;
- payment failure is handled;
- Customer Portal works where configured.

---

# 122. DEFINITION OF DONE — RESEND

Complete when:

- API integration works;
- templates work;
- test email works;
- domain requirements are documented/configured;
- transactional email failures are observable.

---

# 123. DEFINITION OF DONE — POSTHOG

Complete when:

- SDK works;
- core events fire correctly;
- no duplicate events occur;
- attribution works;
- funnels can be constructed;
- consent requirements are respected;
- sensitive data is excluded.

---

# 124. DEFINITION OF DONE — SENTRY

Complete when:

- frontend errors appear correctly;
- server errors appear correctly where applicable;
- environment is identified;
- sensitive values are filtered;
- test error can be observed.

---

# 125. DEFINITION OF DONE — SEO/AEO

Complete when:

- sitemap works;
- robots works;
- canonical URLs work;
- metadata works;
- Open Graph works;
- structured data validates where implemented;
- important content is crawlable;
- Three.js remains intact;
- preview deployments are protected from indexing;
- technical infrastructure supports future AEO/GEO content.

---

# 126. DEFINITION OF DONE — CRO

Complete when the current funnel can be measured:

```text
visitor
→ CTA
→ signup
→ activation
→ pricing
→ checkout
→ subscription
```

No visual redesign is required.

---

# 127. DEFINITION OF DONE — SECURITY

Complete when:

- secrets are protected;
- server-side authorization works;
- RLS is tested;
- Stripe signatures are verified;
- sensitive operations are appropriately rate-limited;
- no service-role/private keys are exposed;
- sensitive analytics/error data is filtered.

---

# 128. DEFINITION OF DONE — GDPR

Complete when infrastructure supports:

- consent recording;
- consent withdrawal;
- analytics/marketing consent enforcement;
- data export;
- account deletion;
- appropriate retention handling.

Any required visible consent UI not already present must be reported separately.

---

# 129. FINAL DELIVERY REPORT

At completion provide:

## Implemented

List every implemented module.

## Vercel

Deployment/configuration status.

## Supabase

Auth/database/storage/RLS status.

## Stripe

Payments/subscriptions/webhooks status.

## Resend

Email status.

## PostHog

Analytics/CRO status.

## Sentry

Monitoring status.

## SEO

Technical SEO status.

## AEO/GEO

Technical readiness.

## Security

Implemented protections.

## GDPR

Implemented capabilities.

## Tests

Exact tests executed and results.

## External configuration remaining

Any credentials or account-owner actions still required.

## UI required

Any functionality blocked because a visible component does not exist.

## Free-tier limitations

Any discovered limitations likely to require a future upgrade.

## Known limitations

Anything intentionally deferred.

## Frontend regression

Explicitly confirm whether the public frontend remains visually and behaviorally unchanged.

---

# 130. FINAL IMPLEMENTATION RULES

The following rules override implementation convenience:

### 1.

**Do not redesign the existing frontend.**

### 2.

**Do not replace the approved stack.**

Approved stack:

```text
Vercel
Supabase
Stripe
Resend
PostHog
Sentry
```

### 3.

**Do not build infrastructure already provided by the approved services.**

### 4.

**Use free tiers whenever sufficient for MVP.**

### 5.

**Do not introduce recurring infrastructure costs without a demonstrated requirement.**

### 6.

**Do not expose secrets.**

### 7.

**Do not trust frontend authorization.**

### 8.

**Do not grant paid access based solely on Stripe success redirects.**

### 9.

**Do not disable RLS to make development easier.**

### 10.

**Do not collect unnecessary user data.**

### 11.

**Do not create custom dashboards when provider dashboards already solve the requirement.**

### 12.

**Do not stop implementation for minor engineering decisions.**

### 13.

**Do stop before an unapproved visible frontend change.**

### 14.

**Do test continuously.**

### 15.

**Preserve all existing working functionality.**

---

# 131. PRODUCT PHILOSOPHY

Mate cu succes should own the things that make Mate cu succes unique.

It should NOT spend engineering effort rebuilding commodity infrastructure.

Therefore:

```text
Hosting          → Vercel

Authentication   → Supabase Auth

Database         → Supabase PostgreSQL

Storage          → Supabase Storage

Payments         → Stripe

Billing          → Stripe

Email            → Resend

Product Analytics → PostHog

CRO Measurement  → PostHog

Feature Flags    → PostHog

Error Monitoring → Sentry
```

Mate cu succes custom code should focus on:

```text
business logic
entitlements
product rules
educational functionality
future AI functionality
future BAC functionality
future learning systems
```

---

# 132. FINAL DIRECTIVE

The existing Mate cu succes frontend is already approved.

Do not rebuild it.

Do not reinterpret it.

Do not simplify it.

Do not redesign it.

Do not replace existing visual or Three.js functionality.

Build the production infrastructure **behind it**.

Use:

**Vercel + Supabase + Stripe + Resend + PostHog + Sentry.**

Prefer managed functionality over custom infrastructure.

Prefer free tiers during MVP.

Keep infrastructure simple until actual usage demonstrates the need for additional complexity.

The implementation is successful when Mate cu succes retains the same frontend experience while gaining a secure, measurable, monetizable and scalable production foundation.

> **Preserve the experience.  
> Connect the infrastructure.  
> Measure everything important.  
> Build only what makes Mate cu succes unique.**