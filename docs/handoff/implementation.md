[Input Router] Notes on /Users/ricodmarlon/Developer/github/yravg/Spekin/docs/handoff/implementation.md. Haiku (a helper model) read this file for this task and wrote these notes.
Text file, 419 lines. Haiku read all 419 lines. Refs like L120-L140 are line numbers in the real file.

**Task first: IMP-21 (no card body exists)**

- IMP-21 appears only as a table row at L140: "Screens read the API instead of the sample, and S38 calls POST /api/genui/validate in place of the TS mirror (apps/web/src/genui/validate.ts, then deleted) | IMP-26 | open". No body section follows. Write the card body from the facts below.
- L331: IMP-21 is kept free for "screens read the API" after the core API routes exist.
- L138 (IMP-19 row): a TS mirror of the Rust validator is used until IMP-21.
- L137 (IMP-18 row): some board copy still needs to move into sample data.
- Dependency: IMP-26 (L230-L241), which is still open-PR-based. Its PR is #15, "merge last" (L118).

**Ownership conflict to flag in the card**

- L56: ui owns `apps/web/src/**` except `apps/web/src/data/api*.ts`.
- L57: core owns `apps/web/src/data/api*.ts`.
- L58: lead owns the rest, including `packages/sample/index.js`.
- Screen changes are ui-lane work, but the client calls are core-lane work. Say which lane takes each part, or route it through "Requests to lead" (L52).

**Existing API client (core, IMP-03, L163-L166)**

- File: `apps/web/src/data/api.ts`.
- Exports `fetchProject(id)` and `fetchStages(id)`, typed from `@spekin/contracts`.
- Tests in `api.test.ts` (vitest) mock `fetch` with `fixtures/meranti-yard.json`. Results must deep-equal `getProject` and `getStages` in `apps/web/src/data/source.ts`.
- Unknown project gives `null` (404). Bad JSON gives a typed error, never a crash.
- A Rust test checks that `/api/projects/:id` equals the fixture's PROJECT.
- L165: do not switch screens to the API in IMP-03. That is a lead step after IMP-01.

**Server routes (IMP-26, L230-L241)**

- Axum routes in `spekin-server` call the pure core. Each returns ts-rs JSON and typed errors. One server test per route, plus one 4xx test.
- `POST /api/projects/{id}/proposals/{pid}/accept` and `…/reject` (IMP-04)
- `POST /api/projects/{id}/runs/estimate` and `…/reserve`, and `GET /api/projects/{id}/usage` (IMP-09)
- `GET /api/models` (IMP-11)
- `POST /api/genui/validate` (IMP-10)
- `POST /api/skills/check-update` (IMP-22)
- `POST /api/projects/{id}/context` (IMP-25)
- `POST /api/projects/{id}/handoff/manifest` (IMP-24)
- State is in memory, seeded from `fixtures/meranti-yard.json`. No database yet.
- Client functions go in `apps/web/src/data/api.ts`, with tests.
- Later routes exist too: IMP-31 (L283-L286), IMP-33 (`GET /api/projects/{id}/contracts`, L308), IMP-34 (L313-L318).

**Screens still on sample data**

- Board source per card: IMP-01 uses `@spekin/sample` (L144); IMP-23 uses SKL_* (L210); IMP-17 uses sample until its routes exist (L363); IMP-15 uses sample shaped like the types until PR #2 merges (L355).
- IMP-19 (S38, L369-L372): card families and actions are the ones IMP-10 validates. An invalid card shows fallback and never renders partly. Confirm never runs before the user confirms.

**Ports and runtime (L60, L294, L296)**

- ui dev server: 5173. API: 8787 (`npm run server`).
- Extra web port: `SPK_WEB_PORT=5174`, with `APP_URL=http://127.0.0.1:5174 npm run harness`.
- CORS origin default: `http://127.0.0.1:5173` (`SPEKIN_WEB_ORIGIN`).
- Server binds 127.0.0.1 (`SPEKIN_BIND` overrides).

**Gate and done rules**

- Done = `npm run gate` passes, and for ui `npm run harness -- <board>` passes with PNGs viewed (L15, L93).
- Failing test first (L91).
- Never remove a working control (L73, L85).
- No pasted board HTML; `dangerouslySetInnerHTML` is blocked by R10 (L66).
- Only the owner merges (L16). Workers never push to main (L16).

**Other references**

- Full card text for IMP-03, 26, and the UI cards: L142-L376.
- Canvas: https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U (L418).

These notes cover the whole file and were written for this task. You do not need to read the file again to check them.
Read exact lines of /Users/ricodmarlon/Developer/github/yravg/Spekin/docs/handoff/implementation.md (offset and limit, for example offset 120, limit 40) only when you must quote exact text, or right before you Edit or Write this file. A range under 100 lines and under about 2,000 tokens; if the lines are long, use a smaller limit, for example 10, passes through as exact text.
Reading this file again, or a range of 100 lines or more or over about 2,000 tokens, returns these same notes. For the exact text of all of it, ask the person to type /input-router full, then read it again.