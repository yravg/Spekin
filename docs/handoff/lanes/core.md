# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-03 | imp-03-api-source | done | `apps/web/src/data/api.test.ts` 8 cases pass (vitest): `fetchProject`/`fetchStages` deep-equal `getProject`/`getStages`; 404 → `null`; non-JSON → `ApiError kind 'json'`; wrong shape → `'shape'`; 500 → `'http'` with status; refused connection → `'network'`; explicit base URL. Rust: `project_matches_the_fixture_exactly`, `unknown_project_is_404_for_the_project_route` (4 server tests pass). Live check on 127.0.0.1:8787: `/api/projects/meranti-yard` 200 and byte-equal to fixture `PROJECT`, `/stages` 200 equal to `STAGES`, `/api/projects/nope` 404. `npm run gate` passes (rules, sync, board lint, typecheck, 10 vitest, build, cargo fmt/clippy/test, contracts current). | The screens still read `source.ts` on purpose (card says not to switch them; that is a lead step after IMP-01). No live test against a browser build, no CORS check (dev proxy covers `/api`). `fetchProject`/`fetchStages` have no timeout of their own; a caller can pass an `AbortSignal`. |

## Requests to lead

- 23 Nov 2026 · IMP-03: `apps/web/src/data/source.ts` still serves the screens. When IMP-01 lands, switch it to `fetchProject`/`fetchStages` (or keep it as the offline fallback) — that file is ui-lane owned, so I did not touch it.
- 23 Nov 2026 · IMP-03: `apps/web/src/data/api.ts` keeps runtime mirrors of the `StageId` and `StageTone` values for its shape check, because ts-rs exports the types but not the enum values. If you want one source, the core could emit a value list (for example a generated `STAGE_IDS` const) — that needs a lead decision on the ts-rs setup.

## Proposed glossary terms

(none)

## Log

- 23 Nov 2026 · IMP-03 · typed API client `api.ts` (404 → null, `ApiError` with kinds network/http/json/shape), 8 vitest cases against `fixtures/meranti-yard.json`, server test that `/api/projects/:id` equals the fixture `PROJECT` · 740fef8 (test first: 46a603a)
