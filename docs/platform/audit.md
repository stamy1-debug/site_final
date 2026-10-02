# Phase 0 — audit

Baseline commit: 06dc8e9f1787d6f50adc20887e5bc2209d18998b.
Public frontend: static HTML/CSS/ES modules, vendored Three.js 0.180.0, Google Fonts, one document with hash anchors. No React/Next.js, package manager, APIs, auth, analytics, environment configuration or automated tests. JavaScript syntax check passes. Existing hosting is a private Sites deployment; its manifest is retained as historical state, not used for the new Vercel deployment.

Existing SEO: Romanian lang, title, description, semantic headings and favicon. No canonical, sitemap, robots, Open Graph or JSON-LD.

Freeze: all original dist files captured by SHA-256 before implementation. Integration build copies dist, injects only head metadata and one deferred integration loader. Existing visual code, styles, text, DOM body, Three.js and interactions remain unchanged. No new UI or CTA remapping. No social image invented.

External tools: no Vercel/Supabase/Stripe/Resend/PostHog/Sentry connector or CLI configured in this task. No credentials requested in chat. Docker daemon is unavailable. Local isolated database tests will use PGlite PostgreSQL with a minimal auth/storage test harness, not a production database provider. Live Supabase and Stripe test-mode acceptance remain external checks.

No original lint/typecheck/build/test commands existed; node --check dist/app.js passed. Existing unrelated .DS_Store is preserved and ignored.
