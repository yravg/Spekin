# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-03 | imp-03-api-source | done | `apps/web/src/data/api.test.ts` 8 cases pass (vitest): `fetchProject`/`fetchStages` deep-equal `getProject`/`getStages`; 404 → `null`; non-JSON → `ApiError kind 'json'`; wrong shape → `'shape'`; 500 → `'http'` with status; refused connection → `'network'`; explicit base URL. Rust: `project_matches_the_fixture_exactly`, `unknown_project_is_404_for_the_project_route` (4 server tests pass). Live check on 127.0.0.1:8787: `/api/projects/meranti-yard` 200 and byte-equal to fixture `PROJECT`, `/stages` 200 equal to `STAGES`, `/api/projects/nope` 404. `npm run gate` passes (rules, sync, board lint, typecheck, 10 vitest, build, cargo fmt/clippy/test, contracts current). | The screens still read `source.ts` on purpose (card says not to switch them; that is a lead step after IMP-01). No live test against a browser build, no CORS check (dev proxy covers `/api`). `fetchProject`/`fetchStages` have no timeout of their own; a caller can pass an `AbortSignal`. |
| IMP-03 | `imp-03-api-source` (PR #1) | open (in PR #1) | – | – |
| IMP-04 | `imp-04-proposals` (PR #2) | open (in PR #2) | – | – |
| IMP-12 | `imp-12-licences` (PR #4) | done (in PR #4) | – | – |
| IMP-11 | `imp-11-model-sources` | done | `cargo test --workspace` (18 unit/ts-rs + 5 `tests/model_source.rs` + 2 server tests pass); `npm run gate` passes | Server endpoints and UI wiring for S36 (later cards) |
| IMP-10 | – | open | – | – |
| IMP-11 | `imp-11-model-sources` (PR #5) | done (in PR #5) | – | – |
| IMP-10 | `imp-10-genui-validate` | done | `cargo test --workspace` (17 unit/ts-rs + 5 `tests/genui.rs` + 2 server tests pass); `npm run gate` passes | TS fallback renderer and S38 UI wiring (later UI card) |
| IMP-28 | `imp-28-genui-fuzz` (stacked on IMP-10) | done | `arbitrary_json_never_yields_an_unsafe_or_partial_card` (2 000 default; 50 000 with `SPEKIN_GENUI_FUZZ_CASES=50000`, both pass); `imp_28_failing_case_data_url_in_text_field_is_rejected`; `imp_28_unsafe_urls_are_rejected_in_every_string_field`; `npm run gate` exit 0 | CI run of the PR (not observed); repeated 50 000-case runs with other seeds; Windows/Linux; S38 TS fallback renderer and harness PNGs (UI, out of lane) |
| IMP-22 | – | open | – | – |
| IMP-03 | – | open | – | – |
| IMP-25 | imp-25-context-builder | done | `crates/spekin-core/tests/context_builder.rs`: 5 unit cases (`request_carries_only_listed_chips_and_never_unchipped_or_hidden_frames`, `hidden_frame_is_never_included_even_if_referenced_as_a_chip`, `removing_a_chip_changes_context_never_board_content`, `duplicate_chips_are_deduplicated_preserving_first_order`, `empty_chip_set_produces_empty_context_with_zero_tokens`) + 2 proptest properties (`every_output_item_is_in_the_chip_set_and_never_hidden`, `removing_any_chip_never_changes_board_hash`) + 2 unit tests in `src/context.rs`. `cargo test --workspace` (14 + 7 + 2 pass); `npm run gate` passes (rules, sync, board lint, typecheck, vitest, build, cargo fmt/clippy/test, contracts current). Bindings committed: `BoardArtifact`, `BoardSnapshot`, `ContextChip`, `ContextItemStatus`, `RequestContext`, `RequestContextItem`. | No HTTP API route yet (core-only card); not wired to S29 or S35 UI (ui lane cards IMP-01/IMP-07); no real model tokenizer (uses per-chip estimated token counts). |
| IMP-10 | `imp-10-genui-validate` (PR #7) | done (in PR #7) | – | – |
| IMP-22 | `imp-22-skills-core` | done | `cargo test --workspace` (15 unit/ts-rs + 5 `tests/skills.rs` + 2 server tests pass); `npm run gate` passes | GitHub network fetcher and IMP-04 proposal integration (out of scope / waiting on PR #2) |
| IMP-27 | `imp-27-github-skills` (PR stacked on #8) | done | `npm run gate` exit 0 (rules, sync, board lint, typecheck, web tests, build, `cargo fmt --check`, `cargo clippy -D warnings`, `cargo test --workspace`, contracts current); `cargo test --workspace`: core 21 unit/ts-rs + 8 `tests/github_source.rs`, server 2 route + 8 `tests/skills_github.rs` | Live HTTPS fetch against a real public repo; `GITHUB_TOKEN` header path against live GitHub; HTTP routes and S40 UI wiring (IMP-26 / IMP-23) |
| IMP-03 | imp-03-api-source (PR #1) | done | `apps/web/src/data/api.test.ts` 8 cases pass: `fetchProject`/`fetchStages` deep-equal `getProject`/`getStages`; 404 → `null`; non-JSON → `ApiError kind 'json'`; wrong shape → `'shape'`; 500 → `'http'` with status; refused connection → `'network'`; explicit base URL. Rust: `project_matches_the_fixture_exactly`, `unknown_project_is_404_for_the_project_route`. Live on 127.0.0.1:8787: `/api/projects/meranti-yard` 200 and byte-equal to fixture `PROJECT`, `/stages` equal to `STAGES`, `/api/projects/nope` 404. `npm run gate` passes. | Screens still read `source.ts` (card says not to switch them; lead step after IMP-01). No browser run of the client. No CORS (dev proxy covers `/api`). No client timeout; `AbortSignal` can be passed. |
| IMP-04 | imp-04-proposals | done | `crates/spekin-core/tests/proposals.rs`: 10 unit cases (exact diff applied, mismatch, stale, accept twice = same revision and second is stale, reject records the reason, revert restores the hash, revert to a later revision refused, out of range, overlap, trailing newline) + 3 proptest properties (`accept_is_deterministic`, `revert_restores_the_content_hash`, `a_stale_proposal_is_never_applied`). `cargo test -p spekin-core`: 17 + 13 pass. `npm run gate` passes (rules, sync, board lint, typecheck, vitest, build, cargo fmt/clippy/test, contracts current). Bindings committed: `Revision`, `Hunk`, `Proposal`, `ProposalError`, `Rejection`. | No diff **generation** (turning two contents into hunks) — a proposal is supplied as an exact diff; that is a later card. No artifact container/store type, no revision history persistence, no API route for proposals. Revisions are held as values; nothing writes them to disk. Not wired to any screen (S33 is a ui card). |

## Requests to lead

- 23 Nov 2026 · IMP-03: `apps/web/src/data/source.ts` still serves the screens. When IMP-01 lands, switch it to `fetchProject`/`fetchStages` (or keep it as the offline fallback) — that file is ui-lane owned, so I did not touch it.
- 23 Nov 2026 · IMP-03: `apps/web/src/data/api.ts` keeps runtime mirrors of the `StageId` and `StageTone` values for its shape check, because ts-rs exports the types but not the enum values. If you want one source, the core could emit a value list (for example a generated `STAGE_IDS` const) — that needs a lead decision on the ts-rs setup.
| IMP-03 | `imp-03-api-source` (PR #1) | open (in PR #1) | – | – |
| IMP-04 | `imp-04-proposals` (PR #2) | open (in PR #2) | – | – |
| IMP-12 | `imp-12-licences` | done | `node --test tools/checks/licences.test.mjs` (11/11 pass, incl. workspace link resolution without `node_modules`); `node tools/checks/licences.mjs --check` (`licences ok (170 npm packages, 62 crates, 0 Python)`); `npm run gate` passes | Not wired into root `package.json` `npm run gate` (lead-owned); Windows/Linux paths not tested (macOS only) |
| IMP-11 | – | open | – | – |
| IMP-10 | – | open | – | – |
| IMP-22 | – | open | – | – |


- 2026-11-23 (IMP-12): Please add `node tools/checks/licences.mjs --check` and `node --test tools/checks/licences.test.mjs` to `npm run gate` in root `package.json` (lead-owned).

- 2026-11-23 · IMP-28 · New dev-dependency `proptest` 1.12.0, licence MIT OR Apache-2.0 (permissive; named here and in the PR body).
- 2026-11-23 · IMP-28 · Behaviour change to note: absolute `http://` URLs are now rejected (https-only; relative paths such as `/p/meranti-yard/design` are still allowed). This tightens IMP-10 to meet the "no non-https URL" property — flag if the lead wants plain http links allowed.
- 2026-11-23 · IMP-27 · The IMP-27 card is absent from `docs/handoff/implementation.md` on this branch (based on `origin/imp-22-skills-core`); it is present on `origin/main` under "Task cards". I used the `origin/main` text verbatim for scope. Please merge this stack so the card is available on the core base line.

(Files you need changed but don't own, board questions, dependency approvals. One line each, with the date.)
- 23 Nov 2026 · IMP-04: this branch and PR #1 both edit this lane file. If #1 merges first, take this branch's version of the file (it has both rows).

## Proposed glossary terms

(none)

## Log

- 23 Nov 2026 · IMP-03 · typed API client `api.ts` (404 → null, `ApiError` with kinds network/http/json/shape), 8 vitest cases against `fixtures/meranti-yard.json`, server test that `/api/projects/:id` equals the fixture `PROJECT` · 740fef8 (test first: 46a603a)
- 2026-11-23 · IMP-12 · Added `tools/checks/licences.mjs`, `tools/checks/licences.test.mjs`, `tools/checks/licence-allowlist.json`, and generated `docs/licences.md`; fixed false positive on `rules.mjs` `'R1 no-python'` text; `npm run gate` passes.
- 2026-11-23 · IMP-12 follow-up · Resolved workspace link entries (`link: true`, `resolved`) from `<resolved>/package.json` so `licences.mjs` works without `node_modules`, with fallback to root licence (`Apache-2.0`) for private workspace packages without a `license` field; added regression test.
- 2026-11-23 · IMP-11 · Added `crates/spekin-core/src/model_source.rs` (Hosted, Local CLI with connector status, API provider with key presence/tail only, capability registry with S36 sample, ledger-touch check), exported ts-rs contracts, and added 5 integration tests.
- 2026-11-23 · IMP-10 · Added fail-closed GenUI card validator in `crates/spekin-core/src/genui.rs` (checklist, comparison, question families; AC-SPK-25 rejections), exported ts-rs contracts, and added 5 integration tests.
- 2026-11-23 · IMP-28 · Wrote failing proptest first; it found `data:text/plain,hello` accepted in `actions[].label` (seed saved in `tests/genui_fuzz.proptest-regressions`). Fixed by scanning every card string for `data:`/`file:` schemes at word boundaries and any absolute non-https URL; relative paths and words like "metadata:" stay valid. Added named regression tests. Fuzzed 2 000 cases (CI default) and 50 000 cases locally; both pass. `npm run gate` exit 0.
- 23 Nov 2026 · IMP-25 · Pure `build_context(chips, board) -> RequestContext`, `BoardSnapshot::content_hash`, `format_token_estimate`, 5 unit + 2 proptest integration tests + 2 unit tests in `src/context.rs`, 6 ts-rs bindings committed (`BoardArtifact`, `BoardSnapshot`, `ContextChip`, `ContextItemStatus`, `RequestContext`, `RequestContextItem`), `proptest = "1"` dev-dependency (MIT OR Apache-2.0) · d6a89bd (test first: b12e803)
(Newest first: date, card, what changed, commit SHA.)
- 2026-11-23 · IMP-27 · Added `spekin-server::skills::github` (`GitHubClient` trait, `HttpGitHubClient`, `GitHubSkillSource::resolve/fetch/check`) with recorded fixtures under `crates/spekin-server/tests/fixtures/github/`. Pure rules and TS contracts added in `spekin-core::github_source` (pinned source, bundle, 256 KB / 2 MB / 50-file limits, licence detection, notices, `plan_updates` via IMP-22 `check_update`). New deps: `reqwest` 0.12 (MIT OR Apache-2.0, rustls) and `futures-util` 0.3 (MIT OR Apache-2.0), named in the PR.
- 2026-11-23 · IMP-22 · Added `crates/spekin-core/src/skills.rs` (`SkillManifest`, `SkillSource`, `UpdatePolicy`, `UpdateCheck`, `parse_skill_md`, `classify_update`, `check_update`, `enforce`, `copy_for_user`), exported ts-rs contracts, and added 5 integration tests without depending on unmerged IMP-04 types.
- 23 Nov 2026 · IMP-04 · `Revision` (content hash), `Hunk`/`Proposal` (exact diff), `accept`/`reject`/`revert`, stale never applied; proptest dev-dependency (MIT OR Apache-2.0); ts-rs bindings committed · 3cda706 (test first: 7390ffc)
