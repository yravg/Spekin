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
| IMP-27 | `imp-27-github-skills` (PR stacked on #8) | done | `npm run gate` exit 0 (rules, sync, board lint, typecheck, web tests, build, `cargo fmt --check`, `cargo clippy -D warnings`, `cargo test --workspace`, contracts current); `cargo test --workspace`: core 21 unit/ts-rs + 8 `tests/github_source.rs`, server 2 route + 8 `tests/skills_github.rs` | Live HTTPS fetch against a real public repo; `GITHUB_TOKEN` header path against live GitHub; HTTP routes and S40 UI wiring (IMP-26 / IMP-23) |

## Requests to lead

- 2026-11-23 · IMP-27 · The IMP-27 card is absent from `docs/handoff/implementation.md` on this branch (based on `origin/imp-22-skills-core`); it is present on `origin/main` under "Task cards". I used the `origin/main` text verbatim for scope. Please merge this stack so the card is available on the core base line.

(Files you need changed but don't own, board questions, dependency approvals. One line each, with the date.)

## Proposed glossary terms

## Log

- 2026-11-23 · IMP-27 · Added `spekin-server::skills::github` (`GitHubClient` trait, `HttpGitHubClient`, `GitHubSkillSource::resolve/fetch/check`) with recorded fixtures under `crates/spekin-server/tests/fixtures/github/`. Pure rules and TS contracts added in `spekin-core::github_source` (pinned source, bundle, 256 KB / 2 MB / 50-file limits, licence detection, notices, `plan_updates` via IMP-22 `check_update`). New deps: `reqwest` 0.12 (MIT OR Apache-2.0, rustls) and `futures-util` 0.3 (MIT OR Apache-2.0), named in the PR.
- 2026-11-23 · IMP-22 · Added `crates/spekin-core/src/skills.rs` (`SkillManifest`, `SkillSource`, `UpdatePolicy`, `UpdateCheck`, `parse_skill_md`, `classify_update`, `check_update`, `enforce`, `copy_for_user`), exported ts-rs contracts, and added 5 integration tests without depending on unmerged IMP-04 types.
