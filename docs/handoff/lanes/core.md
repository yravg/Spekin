# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-03 | `imp-03-api-source` (PR #1) | open (in PR #1) | – | – |
| IMP-04 | `imp-04-proposals` (PR #2) | open (in PR #2) | – | – |
| IMP-12 | `imp-12-licences` (PR #4) | done (in PR #4) | – | – |
| IMP-11 | `imp-11-model-sources` | done | `cargo test --workspace` (18 unit/ts-rs + 5 `tests/model_source.rs` + 2 server tests pass); `npm run gate` passes | Server endpoints and UI wiring for S36 (later cards) |
| IMP-10 | – | open | – | – |
| IMP-22 | – | open | – | – |

## Requests to lead

(Files you need changed but don't own, board questions, dependency approvals. One line each, with the date.)

## Proposed glossary terms

## Log

- 2026-11-23 · IMP-11 · Added `crates/spekin-core/src/model_source.rs` (Hosted, Local CLI with connector status, API provider with key presence/tail only, capability registry with S36 sample, ledger-touch check), exported ts-rs contracts, and added 5 integration tests.
