# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-03 | `imp-03-api-source` (PR #1) | open (in PR #1) | – | – |
| IMP-04 | `imp-04-proposals` (PR #2) | open (in PR #2) | – | – |
| IMP-12 | `imp-12-licences` (PR #4) | done (in PR #4) | – | – |
| IMP-11 | `imp-11-model-sources` (PR #5) | done (in PR #5) | – | – |
| IMP-10 | `imp-10-genui-validate` (PR #7) | done (in PR #7) | – | – |
| IMP-22 | `imp-22-skills-core` | done | `cargo test --workspace` (15 unit/ts-rs + 5 `tests/skills.rs` + 2 server tests pass); `npm run gate` passes | GitHub network fetcher and IMP-04 proposal integration (out of scope / waiting on PR #2) |

## Requests to lead

(Files you need changed but don't own, board questions, dependency approvals. One line each, with the date.)

## Proposed glossary terms

## Log

- 2026-11-23 · IMP-22 · Added `crates/spekin-core/src/skills.rs` (`SkillManifest`, `SkillSource`, `UpdatePolicy`, `UpdateCheck`, `parse_skill_md`, `classify_update`, `check_update`, `enforce`, `copy_for_user`), exported ts-rs contracts, and added 5 integration tests without depending on unmerged IMP-04 types.
