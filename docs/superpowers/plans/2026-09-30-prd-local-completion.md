# PRD local completion

User requests all remaining PRD implementation without credentials, connecting third parties or deploying. Provider account acceptance is explicitly excluded; never report it as passed.

- [x] Run every migration locally and add SQL tests for remaining business workflows.
- [x] Add atomic referral association/conversion (no rewards), lead registration with consent-gated attribution, newsletter source.
- [x] Add secret-checked GET scheduled job adapter, idempotent expiring notifications and transient-state maintenance; no cron activated.
- [x] Make sensitive admin writes atomic with audit and expand personal export coverage.
- [x] Complete account UI for interest/referral entry, consent synchronization and relevant API failures.
- [x] Add offline launch-readiness report, deletion/retention operational checklist and PRD traceability matrix.
- [x] Complete tests/build/security review/browser checks, update final local delivery report.

No paid plan, external mutation, fabricated production data, legal retention periods or financial referral rewards. Existing teaching content and live service delivery are outside infrastructure scope. Provider dashboards remain managed, not rebuilt. UI was approved in prior user turn.

Verification: 93 tests, lint/typecheck/build passing. Independent review: stale consent control issue fixed with awaiting reconciliation + regression test. No provider connection or deployment. Live acceptance explicitly remains outside this local completion.
