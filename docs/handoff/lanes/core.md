# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-29 | imp-29-restore | done | `npm run gate` PASS (rules, sync, canvas lint, typecheck, web tests, build, `cargo fmt --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test --workspace` 18+2 tests, `check:contracts` current). TDD: 10 card tests red on stubs (commit ab69297), green on implementation (commit f1fbfe0). Test names below. | S27 state gate / PNGs (ui lane, IMP-05); server routes for delete/restore (IMP-26, separate card); wiring into screens (lead step); Windows/Linux; 50k-case property run (default 256 used). |

### IMP-29 · Recently deleted and restore — evidence

Files: `crates/spekin-core/src/restore.rs` (new), `crates/spekin-core/src/lib.rs`, `crates/spekin-core/Cargo.toml`, `Cargo.lock`, `packages/contracts/src/index.ts`, `packages/contracts/src/generated/ProjectEntry.ts`, `packages/contracts/src/generated/RestoreError.ts`.

Type/contract: `ProjectEntry` (id, project, revisions, changed_at, deleted_at) and `RestoreError` (`NotDeleted`, `AlreadyDeleted`, `WindowClosed { deleted_at, closed_at }`, `ClockBackwards { now, before }`) derive `TS`; `Timestamp = i64` (UTC Unix seconds passed in, no system clock). Window = 30 days (DECISIONS.md 22 Nov).

Unit tests (`cargo test -p spekin-core`):
- `delete_marks_the_project_without_removing_anything`
- `restore_is_the_exact_inverse_of_delete_inside_the_window`
- `window_closed_is_a_typed_error_at_and_after_thirty_days`
- `days_left_counts_down_and_matches_the_board` (3 days elapsed → 27 left, as S27 draws)
- `deleting_twice_or_restoring_a_live_project_is_refused`
- `purge_due_lists_only_projects_past_the_window_and_removes_nothing`

Property tests (proptest, 256 cases each):
- `property_restore_inverts_delete_inside_the_window` (content hash, revisions and payload preserved)
- `property_nothing_is_restorable_after_the_window`
- `property_purge_due_never_lists_a_project_inside_the_window`
- `property_the_clock_never_goes_backwards_in_an_accepted_operation`

New dependency: `proptest = "1"` (dev only), licence **MIT OR Apache-2.0**; named in the PR body. No new runtime dependency. No Python.

## Requests to lead

(Files you need changed but don't own, board questions, dependency approvals. One line each, with the date.)

- 23 Nov 2026: none. The S27 restore state and `INTAKE_DELETED` (`days: 30`) already match the 30-day window in DECISIONS.md.

## Proposed glossary terms

- **Restore window** — the 30 days a deleted project stays restorable; after it, `purge_due` lists the project for a later purge job. (Core calls it `RESTORE_WINDOW_DAYS`.)

## Log

(Newest first: date, card, what changed, commit SHA.)

- 23 Nov 2026 · IMP-29 · implemented delete/restore/purge_due/days_left, typed `WindowClosed`, content-hash inverse property tests, ts-rs contracts; gate green · f1fbfe0 (+ red-test step ab69297).
