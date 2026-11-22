# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-03 | `imp-03-api-source` (PR #1) | open (in PR #1) | – | – |
| IMP-04 | `imp-04-proposals` (PR #2) | open (in PR #2) | – | – |
| IMP-12 | `imp-12-licences` (PR #4) | done (in PR #4) | – | – |
| IMP-11 | `imp-11-model-sources` (PR #5) | done (in PR #5) | – | – |
| IMP-10 | `imp-10-genui-validate` | done | `cargo test --workspace` (17 unit/ts-rs + 5 `tests/genui.rs` + 2 server tests pass); `npm run gate` passes | TS fallback renderer and S38 UI wiring (later UI card) |
| IMP-22 | – | open | – | – |

## Requests to lead

(Files you need changed but don't own, board questions, dependency approvals. One line each, with the date.)

## Proposed glossary terms

## Log

- 2026-11-23 · IMP-10 · Added fail-closed GenUI card validator in `crates/spekin-core/src/genui.rs` (checklist, comparison, question families; AC-SPK-25 rejections), exported ts-rs contracts, and added 5 integration tests.
