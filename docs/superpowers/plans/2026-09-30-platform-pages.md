# Platform Pages Implementation Plan

Goal: Complete approved visitor/account interfaces locally, ready for managed provider setup.
Architecture: build-time HTML templates + shared stylesheet + TypeScript browser controller, existing managed-service facade/API.
Spec: ../specs/2026-09-30-platform-pages.md
Execution: inline, autonomous per user authorization; no approval pauses or provider deployment.

- [x] Add tested catalog and safe return URL/price matching helpers.
- [x] Build program selection, auth forms, account and consent pages with responsive shared shell.
- [x] Connect forms/account/consent to facade, add deterministic auth callback readiness and safe redirects.
- [x] Generate clean routes, metadata/sitemap, catalog migration and minimal homepage navigation.
- [x] Verify tests/typecheck/lint/build, desktop/mobile flows and missing-key states; update delivery documentation.

Review focus: no fake billing/account data; no client-authorized entitlements; no open redirect; no leaked session in URLs/logs; no analytics without consent; no unresolved loading UI on absent providers.

Review: callback ordering, exact price selection and fail-closed states checked independently. Newsletter status reload corrected with authenticated GET endpoint. No provider deployment or secrets configured.
