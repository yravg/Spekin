# Lane ui: Antigravity, Gemini Neon 4

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-01 | imp-01-shell-work-area | done, part open | `npm run gate` pass (rules ok 204 files, sync ok, 14 boards lint, typecheck ok, vitest 7/7: `workspace.test.ts` 3 + `shell.test.tsx` 4, vite build ok, Rust fmt/clippy/test 8/8, contracts current). `npm run harness -- S35`: `S35:design` PASS (0.41% pixels, text equal), `S35:backend` PASS (0.47% pixels, text equal), `S35:conflict` FAIL (IMP-02 scope). Viewed all 6 PNGs (`S35-{design,backend}-{board,app,diff}.png`). Playwright verified AC-SPK-17 stage switch memory (`design -> backend -> design`, 0 reloads, tab/selection/draft preserved) and keyboard-only stage switch. | Controls targeting later boards (S08 review/diff, S28 import, S32 ask-on-select, S34 hand off, S36 model picker, chat history/attach/send, undo/redo, revisions, run steps/stop) record intent in `useWorkspace.lastIntent` (part open). `S35:conflict` is IMP-02. EN/ID copy translations not wired yet. Long text truncation not tested. 1024 px and 390 px viewports currently overflow horizontally (desktop shell fixed widths; responsive layout is board T01). |
| IMP-02 | imp-02-conflict-save-memory | done, part open | `npm run gate` pass (rules ok, sync ok, 14 boards lint, typecheck ok, vitest 11/11: `workspace.test.ts` 4 + `shell.test.tsx` 7, vite build ok, Rust fmt/clippy/test 8/8, contracts current). `npm run harness -- S35`: 3/3 PASS (`S35:design` 0.41%, `S35:backend` 0.47%, `S35:conflict` 0.42%, text equal, paths `checked`). Viewed all 3 conflict PNGs (`S35-conflict-{board,app,diff}.png`). Verified save chip words (`saved`, `saving`, `failed`, `conflict` with `data-save`), conflict banner + dirty F-04 tab, keyboard ArrowLeft/ArrowRight + Tab/Enter stage switching, safe `NotFound` for unknown `/p/x/y` links, and drafts kept in store (never in URL). | Conflict actions (`Compare`, `Keep as proposal`, `Discard draft`) update local state/intent; full Compare diff view and S08 review handoff are later boards. EN/ID copy translations, long text truncation, 1024 px and 390 px viewports (board T01) not checked. |

## Requests to lead

(Files you need changed but don't own, board questions, dependency approvals. One line each, with the date.)

## Proposed glossary terms

## Log

- 2026-11-23 · IMP-01 · Built S35 design and backend work areas, removed `.ap-todo`, added unit tests (`shell.test.tsx`, `workspace.test.ts`), verified `npm run gate` and `npm run harness -- S35` (2/3 pass: design 0.41%, backend 0.47%; PNGs inspected). Commits: `a2dc76b`, `47b4576`, `7cc1f3d`.
- 2026-11-23 · IMP-02 · Built S35 conflict state (`ConflictBanner`, dirty F-04 tab, save status chip with `data-save`), added keyboard ArrowLeft/ArrowRight stage navigation, unit tests for save states/conflict/NotFound, verified `npm run gate` and `npm run harness -- S35` (3/3 pass: design 0.41%, backend 0.47%, conflict 0.42%; PNGs inspected).
