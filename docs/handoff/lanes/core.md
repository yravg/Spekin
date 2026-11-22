# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-03 | imp-03-api-source (PR #1) | done | `apps/web/src/data/api.test.ts` 8 cases pass: `fetchProject`/`fetchStages` deep-equal `getProject`/`getStages`; 404 → `null`; non-JSON → `ApiError kind 'json'`; wrong shape → `'shape'`; 500 → `'http'` with status; refused connection → `'network'`; explicit base URL. Rust: `project_matches_the_fixture_exactly`, `unknown_project_is_404_for_the_project_route`. Live on 127.0.0.1:8787: `/api/projects/meranti-yard` 200 and byte-equal to fixture `PROJECT`, `/stages` equal to `STAGES`, `/api/projects/nope` 404. `npm run gate` passes. | Screens still read `source.ts` (card says not to switch them; lead step after IMP-01). No browser run of the client. No CORS (dev proxy covers `/api`). No client timeout; `AbortSignal` can be passed. |
| IMP-04 | imp-04-proposals | done | `crates/spekin-core/tests/proposals.rs`: 10 unit cases (exact diff applied, mismatch, stale, accept twice = same revision and second is stale, reject records the reason, revert restores the hash, revert to a later revision refused, out of range, overlap, trailing newline) + 3 proptest properties (`accept_is_deterministic`, `revert_restores_the_content_hash`, `a_stale_proposal_is_never_applied`). `cargo test -p spekin-core`: 17 + 13 pass. `npm run gate` passes (rules, sync, board lint, typecheck, vitest, build, cargo fmt/clippy/test, contracts current). Bindings committed: `Revision`, `Hunk`, `Proposal`, `ProposalError`, `Rejection`. | No diff **generation** (turning two contents into hunks) — a proposal is supplied as an exact diff; that is a later card. No artifact container/store type, no revision history persistence, no API route for proposals. Revisions are held as values; nothing writes them to disk. Not wired to any screen (S33 is a ui card). |
| IMP-09 | imp-09-ledger (stacked on #2) | done | `crates/spekin-core/tests/ledger.rs`: 7 unit/integration cases (S36 run 0426 reserve/settle/refund, 70%/90% severity thresholds, no start/settle/cancel without reservation, over-cap refusal for per-run/project/person/concurrency, full & partial cancel like S36 run 0424, idempotent retry on reserve & settle, 8-thread race test) + 4 proptest properties (`a_reserve_never_exceeds_the_cap`, `settle_plus_refund_equals_the_reserve`, `no_charge_without_a_reserve`, `idempotent_settle`) + 3 unit tests in `src/ledger.rs`. `cargo test --workspace` (31 + 11 + 13 + 2 pass); `npm run gate` passes. Bindings committed: `Ledger`, `LedgerCaps`, `LedgerEntry`, `LedgerEntryKind`, `LedgerError`, `Reservation`, `ReservationStatus`, `RunEstimate`, `Settlement`, `UsageSeverity`, `UsageSnapshot`. | No persistence/DB storage, no HTTP API routes, no 5h/7d sliding rate-window enforcement, no payment/top-up adapter (R-PAY-1–5, later), not wired to S36 UI (separate ui card). |

## Requests to lead

- 23 Nov 2026 · IMP-03: `apps/web/src/data/source.ts` still serves the screens. When IMP-01 lands, switch it to `fetchProject`/`fetchStages` (or keep it as the offline fallback) — that file is ui-lane owned, so I did not touch it.
- 23 Nov 2026 · IMP-03: `apps/web/src/data/api.ts` keeps runtime mirrors of the `StageId` and `StageTone` values for its shape check, because ts-rs exports the types but not the enum values. If you want one source, the core could emit a value list (for example a generated `STAGE_IDS` const) — that needs a lead decision on the ts-rs setup.
- 23 Nov 2026 · IMP-04: this branch and PR #1 both edit this lane file. If #1 merges first, take this branch's version of the file (it has both rows).

## Proposed glossary terms

(none)

## Log

- 23 Nov 2026 · IMP-09 · `Ledger` (`estimate`, `reserve`, `authorize_start`, `settle`, `cancel`, `cancel_with_usage`), per-run/project/person/concurrency caps, 70%/90% `UsageSeverity`, 7 integration/race tests + 4 proptest properties + 3 unit tests, 11 ts-rs bindings committed (stacked on #2 IMP-04)
- 23 Nov 2026 · IMP-04 · `Revision` (content hash), `Hunk`/`Proposal` (exact diff), `accept`/`reject`/`revert`, stale never applied; proptest dev-dependency (MIT OR Apache-2.0); ts-rs bindings committed · 3cda706 (test first: 7390ffc)
- 23 Nov 2026 · IMP-03 · typed API client `api.ts` (404 → null, `ApiError` with kinds network/http/json/shape), 8 vitest cases against `fixtures/meranti-yard.json`, server test that `/api/projects/:id` equals the fixture `PROJECT` · 740fef8 (test first: 46a603a)
