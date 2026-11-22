# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-03 | imp-03-api-source (PR #1) | done | `apps/web/src/data/api.test.ts` 8 cases pass: `fetchProject`/`fetchStages` deep-equal `getProject`/`getStages`; 404 → `null`; non-JSON → `ApiError kind 'json'`; wrong shape → `'shape'`; 500 → `'http'` with status; refused connection → `'network'`; explicit base URL. Rust: `project_matches_the_fixture_exactly`, `unknown_project_is_404_for_the_project_route`. Live on 127.0.0.1:8787: `/api/projects/meranti-yard` 200 and byte-equal to fixture `PROJECT`, `/stages` equal to `STAGES`, `/api/projects/nope` 404. `npm run gate` passes. | Screens still read `source.ts` (card says not to switch them; lead step after IMP-01). No browser run of the client. No CORS (dev proxy covers `/api`). No client timeout; `AbortSignal` can be passed. |
| IMP-04 | imp-04-proposals (PR #2) | done | `crates/spekin-core/tests/proposals.rs`: 10 unit cases (exact diff applied, mismatch, stale, accept twice = same revision and second is stale, reject records the reason, revert restores the hash, revert to a later revision refused, out of range, overlap, trailing newline) + 3 proptest properties (`accept_is_deterministic`, `revert_restores_the_content_hash`, `a_stale_proposal_is_never_applied`). `cargo test -p spekin-core`: 17 + 13 pass. `npm run gate` passes (rules, sync, board lint, typecheck, vitest, build, cargo fmt/clippy/test, contracts current). Bindings committed: `Revision`, `Hunk`, `Proposal`, `ProposalError`, `Rejection`. | No diff **generation** (turning two contents into hunks) — a proposal is supplied as an exact diff; that is a later card. No artifact container/store type, no revision history persistence, no API route for proposals. Revisions are held as values; nothing writes them to disk. Not wired to any screen (S33 is a ui card). |
| IMP-12 | imp-12-licences (PR #4) | done | `node --test tools/checks/licences.test.mjs` (11/11 pass, incl. workspace link resolution without `node_modules`); `node tools/checks/licences.mjs --check` (`licences ok (170 npm packages, 62 crates, 0 Python)`); `npm run gate` passes | Not wired into root `package.json` `npm run gate` (lead-owned); Windows/Linux paths not tested (macOS only) |
| IMP-11 | imp-11-model-sources (PR #5) | done | `cargo test --workspace` (18 unit/ts-rs + 5 `tests/model_source.rs` + 2 server tests pass); `npm run gate` passes | Server endpoints and UI wiring for S36 (later cards) |
| IMP-10 | imp-10-genui-validate (PR #7) | done | `cargo test --workspace` (17 unit/ts-rs + 5 `tests/genui.rs` + 2 server tests pass); `npm run gate` passes | TS fallback renderer and S38 UI wiring (later UI card) |
| IMP-22 | imp-22-skills-core (PR #8) | done | `cargo test --workspace` (15 unit/ts-rs + 5 `tests/skills.rs` + 2 server tests pass); `npm run gate` passes | GitHub network fetcher and IMP-04 proposal integration (out of scope / waiting on PR #2) |

## Requests to lead

- 23 Nov 2026 · IMP-03: `apps/web/src/data/source.ts` still serves the screens. When IMP-01 lands, switch it to `fetchProject`/`fetchStages` (or keep it as the offline fallback) — that file is ui-lane owned, so I did not touch it.
- 23 Nov 2026 · IMP-03: `apps/web/src/data/api.ts` keeps runtime mirrors of the `StageId` and `StageTone` values for its shape check, because ts-rs exports the types but not the enum values. If you want one source, the core could emit a value list (for example a generated `STAGE_IDS` const) — that needs a lead decision on the ts-rs setup.
- 23 Nov 2026 · IMP-04: this branch and PR #1 both edit this lane file. If #1 merges first, take this branch's version of the file (it has both rows).
- 2026-11-23 (IMP-12): Please add `node tools/checks/licences.mjs --check` and `node --test tools/checks/licences.test.mjs` to `npm run gate` in root `package.json` (lead-owned).

## Proposed glossary terms

(none)

## Log

- 2026-11-23 · IMP-22 · Added `crates/spekin-core/src/skills.rs` (`SkillManifest`, `SkillSource`, `UpdatePolicy`, `UpdateCheck`, `parse_skill_md`, `classify_update`, `check_update`, `enforce`, `copy_for_user`), exported ts-rs contracts, and added 5 integration tests without depending on unmerged IMP-04 types.
- 2026-11-23 · IMP-10 · Added fail-closed GenUI card validator in `crates/spekin-core/src/genui.rs` (checklist, comparison, question families; AC-SPK-25 rejections), exported ts-rs contracts, and added 5 integration tests.
- 2026-11-23 · IMP-11 · Added `crates/spekin-core/src/model_source.rs` (Hosted, Local CLI with connector status, API provider with key presence/tail only, capability registry with S36 sample, ledger-touch check), exported ts-rs contracts, and added 5 integration tests.
- 2026-11-23 · IMP-12 follow-up · Resolved workspace link entries (`link: true`, `resolved`) from `<resolved>/package.json` so `licences.mjs` works without `node_modules`, with fallback to root licence (`Apache-2.0`) for private workspace packages without a `license` field; added regression test.
- 2026-11-23 · IMP-12 · Added `tools/checks/licences.mjs`, `tools/checks/licences.test.mjs`, `tools/checks/licence-allowlist.json`, and generated `docs/licences.md`; fixed false positive on `rules.mjs` `'R1 no-python'` text; `npm run gate` passes.
- 23 Nov 2026 · IMP-04 · `Revision` (content hash), `Hunk`/`Proposal` (exact diff), `accept`/`reject`/`revert`, stale never applied; proptest dev-dependency (MIT OR Apache-2.0); ts-rs bindings committed · 3cda706 (test first: 7390ffc)
- 23 Nov 2026 · IMP-03 · typed API client `api.ts` (404 → null, `ApiError` with kinds network/http/json/shape), 8 vitest cases against `fixtures/meranti-yard.json`, server test that `/api/projects/:id` equals the fixture `PROJECT` · 740fef8 (test first: 46a603a)
