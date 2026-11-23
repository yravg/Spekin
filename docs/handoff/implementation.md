# Implementation handoff: canvas to app

Owner: Enrico (lead, with Claude Code). Last updated 23 Nov 2026. Baseline commit: see `git log -1 --format=%h docs/handoff/implementation.md`.

## Continue prompts (paste one into the agent)

**Lane ui: Antigravity, Gemini Neon 4 (medium effort)**

```text
Repo: github.com/yravg/Spekin, branch from origin/main. You are the UI lane.
Read, in order: AGENTS.md, docs/handoff/implementation.md (all of it), docs/GLOSSARY.md, docs/adr/0003-canvas-is-the-ui-source.md, docs/handoff/lanes/ui.md.
Your next card is the first "open" ui card in the status table. While earlier ui pull requests are still open, branch from the top of the open ui stack (see docs/handoff/workers.md), not from main.
Work in your own worktree: git worktree add ../Spekin-ui -b imp-01-shell-work-area origin/main ; cd ../Spekin-ui ; npm ci
Only edit files the ui lane owns. Open the board with npm run canvas:serve (http://127.0.0.1:5180/S35-project-shell.dc.html) and build it EXACTLY as drawn: same classes, labels, order, data-feature ids, same sample data. No redesign, no "not built yet", no pasted board HTML.
Write the failing test first. Done means: npm run gate passes AND npm run harness -- S35 passes for the card's states AND you looked at tools/harness/out/*-board.png, *-app.png, *-diff.png.
Commit one board per pull request (gh pr create), never push to main, never merge your own PR. Update docs/handoff/lanes/ui.md before you stop: status word, evidence, what you did not check.
If anything is unclear or needs a file you don't own, write it under "Requests to lead" in lanes/ui.md and stop that part. Don't guess.
```

**Lane core: Antigravity, Gemini Neon 4.** OpenCode with the free DeepSeek V4.1 Flash ran IMP-03 and IMP-04, then hit the free usage limit on 23 Nov. The same prompt works in OpenCode once OpenCode Go is signed in.

```text
Repo: github.com/yravg/Spekin, branch from origin/main. You are the core lane (Rust and contracts).
Read, in order: AGENTS.md, docs/handoff/implementation.md (all of it), docs/GLOSSARY.md, docs/adr/0002-stack.md, docs/handoff/lanes/core.md.
Your next card is the first "open" core card in the status table. If it depends on a card whose pull request is still open, branch from that card's branch (stacked), as in docs/handoff/workers.md.
Work in your own worktree: git worktree add ../Spekin-core -b imp-03-api-source origin/main ; cd ../Spekin-core ; npm ci
Only edit files the core lane owns. Business rules live in crates/spekin-core (pure, no IO, unit and property tests). The server only loads data and calls the core. Every type the UI needs derives ts_rs::TS; run cargo test --workspace and commit packages/contracts/src/generated.
Write the failing test first. Done means: npm run gate passes (it includes cargo fmt --check, clippy -D warnings, cargo test, contracts current) and the card's acceptance list is met with test names as evidence.
One card per pull request (gh pr create), never push to main, never merge your own PR. Update docs/handoff/lanes/core.md before you stop: status word, evidence, what you did not check.
No Python, no new crate without naming its licence in the PR. If unclear, write it under "Requests to lead" in lanes/core.md and stop that part.
```

## Where things stand (23 Nov 2026)

| Area | Status | Evidence |
|---|---|---|
| Canvas: 14 boards, 80 states, 212 features, F00 map, R00 references (S40 Skills library added 23 Nov) | done | `npm run canvas:lint`: 14 boards pass, manifest current |
| Build: 21 pull requests (#1 to #21), all reviewed by the lead. [#22](https://github.com/yravg/Spekin/pull/22) merges all of them with the conflicts resolved: gate passes, 207 Rust tests, 48 web tests, 33 of 33 states pass. Waiting for the owner to merge #22, as described in [workers.md](workers.md). Core: IMP-03, 04, 09, 10, 11, 12, 22, 24, 25, 26. UI: IMP-01, 02, 05, 07, 23. | done, waiting for owner merge | The status table below. The lead re-ran the state gate on every UI branch: S27 6/6, S29 6/6, S35 3/3, S40 6/6 PASS, pixel differences 0 to 0.09 %. |
| CI state gate | part open | [#29](https://github.com/yravg/Spekin/pull/29) (stacked on #22) makes it required for checked click paths. On the #22 code: 33 of 33 pass. Until #29 merges, the job is report-only. |
| DPAI addendum v1.0 | triaged | [incoming/2026-11-23-dpai-addendum-v1.0.md](incoming/2026-11-23-dpai-addendum-v1.0.md). Its checks are in cards IMP-07, 13, 14, 16, 24 and 25. |
| Review supplement v1.0 and PRD v0.2.3 | triaged | [incoming/2026-11-23-review-supplement-v1.0.md](incoming/2026-11-23-review-supplement-v1.0.md). Canonical PRD is `inputs/Spekin-PRD-v0.2.3.md` (v0.2.2 kept for history). |
| Repo standards: licence, NOTICE, README, CONTRIBUTING, SECURITY, glossary, ADRs, decisions, roadmap | done | this commit |
| App skeleton: Vite, React, TS strict, router `/p/:project/:stage`, per-stage view store | done | `npm run build`, `npm test` |
| S35 header (top bar and stage bar), same markup as the board | done, part open | Header text matches the board line for line in the harness. The pixel diff is the unbuilt work area. The `.ap-todo` stand-in is IMP-01. |
| Rust core (Project, Stage, fixture check) and Axum server (`/api/health`, `/api/projects/:id`, `/stages`) | done | `cargo test`: 8 tests, including "API stages equal the sample the boards draw" |
| Contracts: ts-rs to `packages/contracts` | done | `node tools/check-contracts.mjs` |
| State gate harness | done | `npm run harness -- S35`: 0 / 3 pass. This is the **baseline**: it fails for the right reasons (work area not built, conflict path draft). |
| CI (rules, sync, board lint, types, tests, build, Rust, contracts; state gate as report) | done | GitHub Actions run since the repo went public (23 Nov). Run 45046818401 on 1750598: web ✓, rust ✓, state gate reports 0 passing as expected. |

## Lanes and file ownership

Only the owner of a file edits it. If you need a change elsewhere, ask under "Requests to lead" in your lane file. This is the main defence against the Clausarium problem of parallel agents overwriting each other.

| Lane | Agent | Owns (may create and edit) |
|---|---|---|
| **ui** | Antigravity, Gemini Neon 4 | `apps/web/src/**` except `apps/web/src/data/api*.ts` · `apps/web/package.json` · `package-lock.json` · `packages/sample/index.d.ts` (types only) · `tools/harness/paths/<board>.json` for its boards · `docs/handoff/lanes/ui.md` |
| **core** | OpenCode, DeepSeek V4.1 Flash | `crates/**` · `Cargo.toml` · `Cargo.lock` · `packages/contracts/**` · `apps/web/src/data/api*.ts` (API client and its tests) · `tools/checks/licences.mjs` (IMP-12) · `docs/handoff/lanes/core.md` |
| **lead** | Owner with Claude Code | Everything else: root `package.json`, configs and CI, `docs/design/**` (the canvas), `packages/design`, `packages/sample/index.js`, `fixtures/`, `tools/harness/state-gate.mjs`, `tools/checks/rules.mjs`, `tools/canvas/**`, `AGENTS.md`, this file, `docs/adr`, `docs/DECISIONS.md`, `docs/GLOSSARY.md` (agents may *propose* terms in their lane file) |

Ports on one machine: ui uses 5173 (`npm run dev`). Core runs the API on 8787 (`npm run server`). If a second web server is needed, use `SPK_WEB_PORT=5174 npm run dev` and `APP_URL=http://127.0.0.1:5174 npm run harness`.

## The canvas-to-app contract (read this twice)

From the canvas-to-app method, rules 12, 15, 16 and 17, and the Clausarium lessons.

1. **Build the same as drawn (rule 12).** Open the board. Its markup is generated by `docs/design/spekin-canvas/kit.mjs` (shared helpers: `top`, `stagebar`, `chatPanel`, `btn`, `ib`, `pill`) and `boards-<group>.mjs` (each board's own parts). Each helper that returns HTML becomes one React component with the **same elements, classes, text and order**. `apps/web/src/shell/TopBar.tsx` and `StageBar.tsx` show how. Don't paste board HTML (`dangerouslySetInnerHTML` is blocked by rule R10), and don't import from `docs/design`.
2. **States have an entry and data (rule 15).** Each state's entry click path and data source are listed in `docs/design/spekin-canvas/canvas-states.json` and on the board's state strip. The app must reach the state by those clicks and show that data from `@spekin/sample`.
3. **Every control is real or later (rule 9).** Use `Btn` and `IconBtn` (`apps/web/src/ui/Button.tsx`). The types allow only two kinds: built (`does`, `feature`, `onClick`) or later (`later`: disabled, with the reason). A control is later in the app only if the board marks it later. Opening a panel, menu or dialog that the board draws is part of the card. If the board doesn't draw what a control opens, the control opens nothing yet: set `onClick` to record the intent in the view store, and list it under "part open" in your lane file.
4. **The state gate decides (rule 16).** `npm run harness -- <board>`. A state passes only with all of these: reached by real clicks (no URL jumps after the first step), text equal to the board's, pixel difference of 1 % or less, no `data-todo` stand-ins, and no more later controls than the board has. The click path must also be `checked`. Click paths go in `tools/harness/paths/<board>.json`. Write them as `draft` from the board's entry text, try them, then mark them `checked` after you've **looked at** the PNGs.
5. **Ids in both places (rule 17).** `data-screen="S35"` on the screen root and `data-feature="F1nn"` on each control, exactly as on the board.
6. **Board-only marks are never built.** NEW, PART and LATER tags, outlines and callout notes are canvas language.
7. **Never change a board to fit the code.** If the board is wrong or impossible, write it under "Requests to lead". The lead fixes the generator and rebuilds.
8. **Never remove a working control for looks** (owner, 18 Nov). Never exclude a region from the pixel score unless the owner has decided it in DECISIONS.md.

### Clausarium lessons, each turned into a rule here

| What went wrong in Clausarium | Rule here |
|---|---|
| 3,849 drawn controls said "Not built yet" | Control types allow only built or later. Rules R3 and R4 block fake controls. The gate counts later controls against the board's. |
| Drafted click paths were wrong in the app (a row needed a double-click, a state needed a selection first) | Paths start as `draft`, become `checked` only after the harness reached them, and a person viewed the PNGs. |
| `?view=` URL shortcuts hid states nobody could reach | No `goto` after the first step. The harness rejects it. |
| "Done" claimed from code alone | Done = gate plus harness plus PNGs viewed. Exact status words, and "not checked" is always listed. |
| Demo data and canvas data drifted | One sample module for boards, app and Rust. `check:sync` fails on drift. |
| Many parallel worktrees overwrote shared files | Two lanes with owned files. Shared files belong to the lead. One board per pull request. |
| Working legacy controls removed to match a drawing | Never remove a working control. Ask instead. |

## How to do a card (both lanes)

1. On main, run the **baseline**: `npm ci && npm run gate`. If main is red, stop and tell the lead in your lane file.
2. Make a branch and worktree (see the continue prompt). Write your name and card in your lane file. Commit that first.
3. **Write the failing test**: a vitest unit test for ui, a Rust test for core, or a harness path for a board state. Run it and see it fail.
4. Build until it passes. Commit in small steps, and name the files in each message.
5. Run `npm run gate`. For ui cards, also run `npm run harness -- <board>`, look at every PNG, then check 1024 px, 390 px, keyboard only, reduced motion, long text, and EN and ID.
6. Update your lane file: status word, evidence (test names, harness table), what you did not check. Open the pull request with the template.

**Definition of done for a card:** every acceptance line below is met with evidence. A card that has any line not met is `done, part open` at best.

**Stop and ask (write in your lane file, then work on something else):** the board is unclear or contradicts the PRD · you need a file you don't own · main is red · a new dependency has a licence that isn't permissive · anything needs a secret, a deployment, a payment or a message to someone outside · a test can't be made to fail first.

## Task cards

Status words: `done`, `done, part open`, `done, part blocked`, `open`, `blocked`. The lead updates this table when a pull request merges.

| Card | Lane | Title | Depends on | Status |
|---|---|---|---|---|
| IMP-01 | ui | S35 work area: chat, artifact tabs, canvas pane and inspector for the design and backend states | – | done, part open, waiting for owner merge: PR #3. Lead re-ran the gate: design PASS 0.41 %, backend PASS 0.47 %. The conflict state is IMP-02. |
| IMP-02 | ui | S35 conflict state, save states (F112), per-stage memory across switches | IMP-01 | done, waiting for owner merge: PR #6, stacked on #3 (lead re-ran: S35 3/3 PASS) |
| IMP-05 | ui | S27 Projects home (6 states), and "/" becomes S27 | IMP-01, C-01 | done, part open: PR #11, stacked on #9 (lead re-ran with the harness fixes: S27 6/6, S35 3/3, S40 6/6 PASS; C-01 create redraw matched in 271558a) |
| IMP-03 | core | API source: typed client for the Rust API, equal to the sample | – | done, waiting for owner merge: PR #1 (lead review: approve) |
| IMP-04 | core | Proposals and revisions in the core (accept, reject, revert, stale) | – | done, waiting for owner merge: PR #2 (lead review: approve; merge after #1) |
| IMP-12 | core | No-Python and licence inventory check | – | done, waiting for owner merge: PR #4 (lead review: approve; one small follow-up on workspace links) |
| IMP-09 | core | Ledger: estimate, reserve, settle, caps | IMP-04 | done, waiting for owner merge: PR #10, stacked on #2 |
| IMP-11 | core | Model sources and capability registry | – | done, waiting for owner merge: PR #5 (lead review: approve) |
| IMP-10 | core | GenUI schema validation, fail closed | – | done, waiting for owner merge: PR #7 (lead review: approve) |
| IMP-22 | core | Skills core: SkillManifest, versions, update policy and update checks | IMP-04 | done, waiting for owner merge: PR #8 (lead review: approve) |
| IMP-24 | core | Handoff manifest core (S34): accepted revisions, hashes, missing inputs, deterministic | IMP-04 | done, waiting for owner merge: PR #13, stacked on #2 |
| IMP-25 | core | Next-request context builder (S29, S35): only the listed chips, pure | – | done, waiting for owner merge: PR #12 |
| IMP-26 | core | API routes for the core (all core cards) + web client | IMP-03…IMP-25 | done, waiting for owner merge: PR #15 (merge last) |
| IMP-27 | core | GitHub skill source adapter: pin to SHA, fetch with limits, update check | IMP-22 | done, waiting for owner merge: PR #17, stacked on #8 |
| IMP-29 | core | Recently deleted and restore: 30-day window, pure | – | done, waiting for owner merge: PR #20 |
| IMP-31 | core | Audit and restore in the API (routes, one audit entry per action, head kept apart) | IMP-26, IMP-29, IMP-30 | done, waiting for owner merge: PR #23, stacked on #22 |
| IMP-32 | core | Server hardening: body limit, JSON only, timeout, CORS, headers, loopback bind | IMP-31 | done, waiting for owner merge: PR #24, stacked on #23 |
| IMP-33 | core | Build contracts and evidence core (S37): not run is never passed | IMP-32 | done, waiting for owner merge: PR #26, stacked on #24 |
| IMP-34 | core | Skills library API (S40): copies, versions, GitHub sources, update history and rollback | IMP-22, 27, 31 | done, waiting for owner merge: PR #27, stacked on #26 |
| IMP-35 | core | Review follow-ups: chunked 413, skills audit chain, licences in gate, audit head | IMP-34 | done, waiting for owner merge: PR #28, stacked on #27 (allow-list empty; SPDX classifier) |
| IMP-30 | core | Audit log core: append-only, hash-chained, verify | – | done, waiting for owner merge: PR #21 (follow-up: store the head hash apart from the log) |
| IMP-28 | core | GenUI validation fuzzing (never panics, never partial) | IMP-10 | done, waiting for owner merge: PR #18, stacked on #7 (the fuzzer found and fixed a data: URL hole) |
| IMP-23 | ui | S40 Skills library (6 states) | IMP-01, IMP-22 types | done, waiting for owner merge: PR #9, stacked on #6 (S40 6/6 PASS after the harness fix) |
| IMP-06 | ui | S28 Reference intake | IMP-01 | done, part open: PR #31, stacked on #30 (lead re-ran: S28 6/6 PASS; uploads, PII detector and job cancel record intent only) |
| IMP-07 | ui | S29 Frames canvas | IMP-01 | done, waiting for owner merge: PR #14, stacked on #11 (lead re-ran: S29 6/6 PASS) |
| IMP-08 | ui | S30 Style review | IMP-01 | done, part open: PR #30, stacked on #25 (lead re-ran: S30 6/6 PASS; links to later boards record intent only) |
| IMP-13 | ui | S31 Alternatives | IMP-01 | done, waiting for owner merge: PR #25, stacked on #19 (lead re-ran: S31 6/6 PASS) |
| IMP-14 | ui | S32 Targeted change | IMP-01 | done, waiting for owner merge: PR #19, stacked on #16 (lead re-ran: S32 6/6 PASS) |
| IMP-15 | ui | S33 Review and accept | IMP-01 | done, waiting for owner merge: PR #16, stacked on #14 (lead re-ran: S33 6/6 PASS) |
| IMP-16 | ui | S34 Coding handoff | IMP-01 | done, part open: PR #32, stacked on #31 (lead re-ran: S34 6/6 PASS; zip download and clipboard record intent only) |
| IMP-17 | ui | S36 Models and usage | IMP-01 | done, part open: PR #33, stacked on #30 (lead re-ran: S36 6/6 PASS; ledger and model actions record intent only) |
| IMP-18 | ui | S37 Build contracts | IMP-01 | done, part open: PR #36, stacked on #33 (lead re-ran: S37 6/6 PASS; some board copy still to move into sample data) |
| IMP-19 | ui | S38 GenUI panel | IMP-01 | done, part open: PR #34, stacked on #32 (lead re-ran: S38 6/6 PASS; a TS mirror of the Rust validator is used until IMP-21) |
| IMP-20 | ui | T01 Tablet and phone | IMP-01 | done, part open: PR #35, stacked on #34 (lead re-ran: T01 5/5 PASS with device frames; real upload, zip download and keyboard-only traversal not checked) |
| IMP-21 | ui | Screens read through one data source (sample default, API mode); S38 stops validating in the browser | IMP-26, PR #37 | done, part open: PR #38, stacked on #37 (lead re-ran: 80/80 sample mode; API mode S27, S35, S36, S40 pass per worker; project, stages, usage only so far) |
| IMP-37 | ui + core | API mode for models, skills and history, contracts, audit, deleted projects | IMP-21 | done, part open: PR #39, stacked on #38 (lead re-ran 80/80 sample mode; worker: API mode S27, S35, S36, S37, S40 pass; some fields still sample-only) |
| IMP-39 | lead then ui | API offline / read failed state: draw it on the canvas, then build it; API mode must never fall back to sample data silently | IMP-37 | open |
| IMP-38 | core | Store trait, memory store, Postgres store (ADR 0008) | PR #37 | in progress (OpenCode Go DeepSeek V4 Pro, on #37) |
| IMP-36 | core | GenUI sample verdicts equal the Rust validator | IMP-21 | open |

### IMP-21 · Screens read through one data source; API mode (ui)

Base: `integration-2-2026-11-23` (PR #37). Branch `imp-21-data-source`.

1. **One door.** No screen imports `@spekin/sample` any more (tests may). Every read goes through `apps/web/src/data/source.ts`, through a `DataSource` interface with two implementations: `sampleSource` (today's data, the default) and `apiSource` (`apps/web/src/data/api.ts`). Pick it with `VITE_SPK_DATA=api`; the default stays `sample`, so the boards and the harness keep comparing against the same data. Screens get data from a React context (`DataSourceProvider`, `useData()`); loading shows the board's skeleton or nothing, never a spinner that the boards do not draw.
2. **What the API serves now**: project, stages, usage, models, skills (list, history), contracts, audit, deleted projects. Everything else (frames, findings, alternatives, delivery, intake, device frames) stays sample-only in both modes. List those under "Still sample-only" in ui.md, one line each, with the screen.
3. **S38 GenUI.** Delete `apps/web/src/genui/validate.ts` and its imports: the browser never validates. In api mode a card goes through `validateGenUi()` (POST /api/genui/validate) before it renders; a refusal or a network error shows the fallback card, never part of the card. In sample mode the sample cards carry the verdict (`valid` or the refusal reason) recorded from the Rust validator, and the screen renders on that verdict. Add the verdict fields to `packages/sample/index.d.ts` and write under "Requests to lead": the lead adds the verdicts to `sample/parts` and IMP-36 adds a Rust test that keeps them equal to `genui::validate`.
4. **Tests (write them first):** a vitest that `apiSource` and `sampleSource` return deep-equal project, stages and usage for meranti-yard, with `fetch` mocked from `fixtures/meranti-yard.json`; a vitest that S38 with a mocked refusal shows the fallback and no part of the card; a vitest that no file under `apps/web/src` other than `data/source.ts` and `*.test.tsx` imports `@spekin/sample`.
5. **Checks:** `npm run gate` passes. In sample mode all 14 boards still pass (80/80). In api mode (`cargo run -p spekin-server` on 8787, then `VITE_SPK_DATA=api SPK_WEB_PORT=5174 npm run dev`): S27, S35, S36 and S40 still pass. Report any that do not, with the reason, rather than changing the board.

Not in scope: writes from the screens (accept, reserve, copy skill and so on stay recorded intent), auth, persistence.

### IMP-36 · GenUI sample verdicts equal the Rust validator (core)

A Rust test reads the GenUI sample cards (exported to `fixtures/genui-cards.json` by `npm run sync:design`) and checks each card's recorded verdict equals `genui::validate`. Depends on IMP-21 and the lead adding the verdicts to the sample.

### IMP-37 · API mode for the remaining reads (core then ui, one worker)

Base: `imp-21-data-source` (PR #38). Branch `imp-37-api-reads`.
1. Core part (`apps/web/src/data/api*.ts`): add `fetchContracts(projectId)` for GET /api/projects/{id}/contracts, with a test like the others (mocked fetch, typed error on bad JSON, null on 404).
2. UI part: add models, skills (list and history), contracts, audit and deleted projects to the `DataSource` interface, both `sampleSource` and `apiSource`. S36, S40, S37 and S27 (Recently deleted) read them through `useData()`. Where the API shape differs from the sample shape, map it in `apiSource`, not in the screen. Anything the API cannot supply yet keeps the sample value and is listed in ui.md under "Still sample-only".
3. Tests first: `apiSource` and `sampleSource` agree for each new read on the Meranti Yard fixture, or the test names the field that differs and why.
4. Checks: `npm run gate`; sample mode all 14 boards 80/80; API mode (server on 8787) S27, S35, S36, S37, S40 pass or each failure is explained.

### IMP-38 · Store trait, memory store, Postgres store (core)

Read docs/adr/0008-persistence.md (short). Base: `origin/integration-2-2026-11-23` (PR #37). Branch `imp-38-store`.
1. In `crates/spekin-core`: a `Store` trait covering what the server keeps today (projects, stages, revisions and proposals, ledger entries, skills and versions, audit entries plus the audit head kept apart, deleted projects). No database code in core.
2. `MemoryStore` implements it; the server uses it by default, so every existing test passes unchanged.
3. New crate `crates/spekin-store-pg` with `sqlx` (postgres, runtime-tokio, rustls; no default features you do not need) and plain SQL migrations in `crates/spekin-store-pg/migrations`. Revisions update under a row lock; a stale write returns the same typed conflict error the memory store returns.
4. The server picks `PgStore` when `DATABASE_URL` is set. A command `cargo run -p spekin-server -- seed-sample` seeds Meranti Yard; it refuses unless `--yes` is given.
5. Tests: one shared test suite run against `MemoryStore` always, and against `PgStore` only when `TEST_DATABASE_URL` is set; without it print "postgres stage skipped" (never claim it passed). Licence check (`node tools/checks/licences.mjs --check`) must pass with the new crates.
6. Checks: `npm run gate` passes. Say in the PR whether the Postgres stage ran.

### IMP-01 · S35 work area (ui)

Board: `S35-project-shell.dc.html`, states `design` and `backend`. Generators: `kit.mjs` (`chatPanel`, tabs, inspector helpers) and `boards-shell.mjs`. Data: `sample/meranti-yard.mjs` (STAGES, FRAMES, REQS, CTX_DESIGN, BACKEND, CTX_BACKEND), read through `@spekin/sample`. Add any type you read to `packages/sample/index.d.ts`.

Acceptance:
- `.ap-todo` is gone from S35. The chat panel (context basket, messages, requirement cards, composer with model chip), artifact tabs, centre pane (canvas frames in design, contract document in backend) and inspector are built as components with the board's markup.
- `npm run harness -- S35`: `design` and `backend` PASS. That means text equal, pixels ≤ 1 %, no stand-ins, and paths `checked`.
- Clicking a stage swaps the work area in place without a reload. Switching design → backend → design restores design's tab, selection and composer draft (vitest on the store plus a harness path). This is AC-SPK-17, partial.
- Every control is built or later, as on the board. The rules check passes.
- Checks: 1024 px, 390 px, keyboard, reduced motion, long text, EN and ID. List any not done.

Not in scope: the real canvas engine (S29, P3), real model calls, and the API.

### IMP-02 · S35 conflict, save states, stage memory (ui)

States: `conflict`. Features F112 (save status) and F104–F108 as drawn. Acceptance: the `conflict` state reached by the board's entry path (edit F-04 while r8 is saved in another session, using the CONFLICT fixture) PASSes the harness. The save chip shows saving, saved and conflict with words, not colour alone. A keyboard-only stage switch works, unknown `/p/x/y` links show the safe not-found page, and no draft text appears in the URL. This is AC-SPK-18, partial.

### IMP-05 · S27 Projects home (ui)

Board `S27-projects.dc.html`, states `home, all, switch, create, first, restore`. "/" renders S27 instead of redirecting. In the **same pull request**, update every `tools/harness/paths/*.json` so its first steps go from "/" to the project by clicks (ask the lead to merge it quickly, since it touches other boards' paths). The restore window is 30 days (DECISIONS.md). All six states PASS.

### IMP-03 · API source (core)

`apps/web/src/data/api.ts` exports `fetchProject(id)` and `fetchStages(id)`, typed with `@spekin/contracts`. Tests (`api.test.ts`, vitest): with `fetch` mocked to return `fixtures/meranti-yard.json` data, the results deep-equal `getProject` and `getStages` from `apps/web/src/data/source.ts`. Unknown project → `null` (404). Bad JSON → a typed error, never a crash. A Rust test checks that the `/api/projects/:id` body equals the fixture's PROJECT. Don't switch the screens to the API: that is a lead step after IMP-01.

### IMP-04 · Proposals and revisions (core)

In `spekin-core`: `Revision`, `Proposal` (exact diff against a base revision), and `accept`, `reject`, `revert`. A proposal whose base isn't the current revision is `Stale` and can't be accepted (R-EDT-1, AC-SPK-4/5). Property tests (add `proptest`, MIT/Apache) cover these: accepting twice gives the same result, revert restores the content hash, and a stale proposal is never applied (T-315). All types export to TypeScript.

### IMP-12 · No-Python and licence inventory (core)

`tools/checks/licences.mjs` lists every npm package (from `package-lock.json`) and crate (`cargo metadata`) with its licence. It fails on a missing licence, on GPL or AGPL without an entry in an allow-list file, and on any Python in the dependency tree or build. It writes `docs/licences.md` (generated). This is AC-SPK-19 and 23, partial. The lead adds it to `npm run gate` after review.

### IMP-09 · Ledger (core)

Pure core: `estimate → reserve(max) → settle(actual)`, with caps per person and project, plus warnings at 70 % and 90 %. A job can't start without a reservation. Concurrent reservations never exceed the cap. Cancel releases the reservation. Retry never double-settles. Tests cover race, retry, cancel and over-cap. This is SPK-T-06, AC-SPK-8/9. Data shapes follow S36 (`sample/parts/models.mjs`).

### IMP-11 · Model sources and capability registry (core)

Types for the three sources (ADR 0005): Hosted, Local CLI (connector status: not set up, offline, ready) and API provider (key present, never the key itself). Add a capability registry (model, context size, image input, tools, price per unit). Only Hosted jobs touch the ledger. This is SPK-T-05, AC-SPK-6/7. Fixtures come from the S36 sample.

### IMP-10 · GenUI schema validation (core)

A Rust validator for GenUI card JSON (families: checklist, comparison, question, as on S38). It rejects unknown components, invalid enums, excessive nesting or item counts, unsafe URLs, scripts and tool names, and privilege-raising actions. The result is `Ok(validated)` or `Rejected(reason)`, never a partial render. Tests cover each AC-SPK-25 case. This is SPK-T-13.

### IMP-22 · Skills core (core)

ADR 0007, board S40, data `sample/parts/skills.mjs`. In `spekin-core`, these types export to TypeScript:
- `SkillManifest`: id, title, description, stages, source (template | github {repo, path, commit} | user), licence, notice, version, reads, proposes, tools, invocation.
- `UpdatePolicy`: Auto | Notify | Pinned.
- `UpdateCheck`, with outcomes.

Pure functions:
- `parse_skill_md(text) -> Result<SkillManifest, SkillError>`: YAML frontmatter needs `name` and `description`, and the body is kept as text.
- `classify_update(old, new) -> Apply | Hold(reasons)`. Hold when the licence changed, a tool was added, a script was added, or the text matches an injection pattern list (AC-SPK-39).
- `enforce(manifest, context) -> allowed context`, which returns only the declared `reads`.

Tests:
- a real SKILL.md shape parses, and one without a name fails;
- wording-only updates apply;
- an added tool, a script or a licence change is held, each with its reason;
- a skill asking for shell or secret export is held and stays data;
- copies keep the notice.

There is no network code in this card. Fetching from GitHub is a later card.

### IMP-23 · S40 Skills library (ui)

Board `S40-skills-library.dc.html`, states `library, detail, edit, github, updates, use`. It reads `@spekin/sample` (SKL_*) until IMP-22's API exists. All six states must PASS the harness. The `/` list is keyboard-first: arrows move, Enter picks, Escape closes and keeps the text. A switch never runs anything.

### IMP-24 · Handoff manifest core (core)

Pure Rust in spekin-core for S34 (DPAI addendum, point 3). `build_manifest(selection, revisions, inputs) -> Manifest`:
- only accepted revisions can be selected; a draft or stale one is refused with a typed error;
- the manifest lists, in a stable order, each artifact with its exact revision and a sha256 content hash, the exclusions, and the required inputs, where a missing one is listed explicitly (for example `PRD: missing`) and is never invented;
- `to_json` is deterministic, so two exports of the same selection are byte-identical (a property test);
- nothing creates a link: no URL, token or expiry field exists (R-WS-3, sharing stays later).
Export the types with ts-rs. Stack on IMP-04 (uses `Revision`).

### IMP-25 · Next-request context builder (core)

Pure Rust in spekin-core for S29 and S35 (DPAI addendum, point 1). `build_context(chips, board) -> RequestContext`:
- the request carries exactly the listed chips (artifact id, revision, status); it never includes hidden frames or the whole board (property test: for any board and any chip set, every item in the output is in the chip set);
- removing a chip changes the context, never the content (the board is unchanged, compared by hash);
- building the context never sends, accepts or spends: the function is pure and has no ledger or proposal side effect;
- the token estimate is the sum of the chip estimates (S35 shows "≈ 9.8k tokens").
Export the types with ts-rs.

### IMP-26 · API routes for the core (core)

Axum routes in spekin-server that call the pure core. Each route returns typed JSON (the ts-rs types) and typed errors, with one server test per route plus a 4xx test:
- `POST /api/projects/{id}/proposals/{pid}/accept` and `…/reject` (IMP-04);
- `POST /api/projects/{id}/runs/estimate` and `…/reserve` (IMP-09); `GET /api/projects/{id}/usage`;
- `GET /api/models` (IMP-11);
- `POST /api/genui/validate` (IMP-10);
- `POST /api/skills/check-update` (IMP-22);
- `POST /api/projects/{id}/context` (IMP-25);
- `POST /api/projects/{id}/handoff/manifest` (IMP-24).
State is in memory, seeded from `fixtures/meranti-yard.json` (no database yet). Add the client functions to `apps/web/src/data/api.ts` with tests (as in IMP-03). Branch: start from origin/main and merge every open core branch into it (`git merge origin/imp-03-api-source origin/imp-04-proposals …`), so the PR is stacked on all of them. Say so in the PR body.

### IMP-27 · GitHub skill source adapter (core)

Owner request (23 Nov): skills from public GitHub repositories that can update automatically. It works within ADR 0007. In spekin-server, add a `skills::github` module:
- `resolve(repo, path, git_ref) -> PinnedSource`: resolves a branch or tag to the exact commit SHA. A skill is always stored against a SHA, never against a moving branch.
- `fetch(pinned) -> SkillBundle`: downloads SKILL.md and the files it lists, plus the repository licence, over HTTPS from the GitHub API or raw content only. Size limits: 256 KB per file, 2 MB per bundle, 50 files. Nothing is executed, and scripts are only listed.
- `check(installed, policy) -> UpdateCheck`: fetches the newest SHA for the same ref, parses it with `parse_skill_md`, and returns `check_update` from IMP-22 (hold with reasons, or apply).
- The HTTP client sits behind a trait, so tests use recorded fixtures under `crates/spekin-server/tests/fixtures/github/`. No test touches the network. Add tests for: a licence change, an added script and an injection pattern each hold; a wording-only change applies under Auto; Pinned never changes; the size limits are refused.
- A new dependency is allowed only under MIT or Apache-2.0 (for example reqwest with rustls). Name it in the PR.
- No token is needed for public repositories. If `GITHUB_TOKEN` is set it is used, but it is never logged or stored.

### IMP-28 · GenUI validation fuzzing (core)

Hardening for IMP-10. Proptest strategies generate arbitrary JSON (deep nesting, long strings, unknown keys, mixed types, unicode, `javascript:` and `data:` URLs, event-handler strings in every field). Properties:
- `validate_genui` never panics;
- it either returns a full valid card or a rejection, never a partial card;
- every accepted card passes the limits again when re-serialised and re-validated (a round trip);
- no accepted card contains a non-https URL or a script-like string anywhere.
Run 2,000 cases in CI and 50,000 cases locally with an env var. Fix any bug found, with its failing case first. Stack on IMP-10.

### IMP-29 · Recently deleted and restore (core)

Pure Rust in spekin-core for S27 (states `restore`, F-stories on the Recently deleted list). The restore window is 30 days (DECISIONS.md).
- `delete(project, now)` marks the project deleted with `deleted_at`. Nothing is removed and its revisions are kept.
- `restore(project, now)` works only within 30 days. After that it gives a typed error, `WindowClosed { deleted_at, closed_at }`.
- `purge_due(projects, now)` lists the projects past the window. It removes nothing itself; a later server job uses the list.
- `days_left(project, now)` gives the number S27 shows ("27 days left").
- Property tests: restore is the exact inverse of delete inside the window (same content hash); nothing is restorable after the window; `purge_due` never lists a project inside the window; the clock never goes backwards in an accepted operation.
Times are UTC, passed in as arguments (no system clock in the core). Export the types with ts-rs. Branch from origin/main.

### IMP-30 · Audit log core (core)

Pure Rust in spekin-core. S33 needs it, because a reject adds exactly one audit entry (C-03), and so does the evidence timeline (R-EVD-1).
- `AuditLog::append(entry, now) -> AuditEntry`: append-only. Each entry has a sequence number, the actor, the action (accept, reject, revert, delete, restore, reserve, settle, skill update applied or held), the target id and revision, the reason, a UTC time, and `prev_hash` and `hash` (sha256 over the canonical JSON of the entry plus `prev_hash`).
- `verify(log) -> Result<(), AuditError>` finds any edited, removed or reordered entry and names its sequence number.
- There is no update or delete function.
- Property tests: any edit to any entry fails verify at that entry; appending never changes earlier hashes; sequence numbers are gapless.
- A new dependency only under MIT or Apache-2.0 (sha2). Export the types with ts-rs. Branch from origin/main.

### IMP-31 · Audit and restore in the API (core)

Builds on IMP-26, IMP-29 and IMP-30. Branch from `origin/integration-2026-11-23` (PR #22).
- The accept, reject and revert routes each append exactly one audit entry (C-03: a reject makes no revision and one audit entry). Reserve and settle append theirs too.
- The server keeps the audit head hash apart from the log, as the lead's follow-up on #21 asks. `GET /api/projects/{id}/audit` returns the entries and the result of `verify` checked against that separate head.
- `POST /api/projects/{id}/delete` and `…/restore` use the IMP-29 core and audit both. `GET /api/projects/deleted` lists entries with `days_left`.
- One server test per route plus a 4xx test. One test shows that a reject adds exactly one audit entry and no revision. Add the client functions to `apps/web/src/data/api.ts`, with tests.

### IMP-32 · Server hardening (core)

Builds on IMP-31 (branch from `origin/imp-31-audit-restore-api`). Axum and tower-http layers, each with a test:
- request body limit of 1 MB, giving a typed 413;
- `POST` routes accept `application/json` only, giving a typed 415;
- a request timeout of 15 s, giving a typed 504; the GitHub fetch has its own 20 s client timeout;
- CORS allows only the configured web origin (`SPEKIN_WEB_ORIGIN`, default `http://127.0.0.1:5173`), never `*`;
- security headers on every response: `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store` on `/api`;
- the server binds to 127.0.0.1 by default; `SPEKIN_BIND` changes it, and a log line says when it is not loopback;
- errors never echo request bodies, tokens or file paths (a test sends a fake token and checks that the response and logs do not contain it).

### IMP-33 · Build contracts and evidence core (core)

Pure Rust in spekin-core for S37 (R-EVD-1, R-EVD-4, AC-SPK-22). Branch from `origin/imp-32-server-hardening`.
- A `Contract` is a named requirement, for example `R-EDT-3: accept creates one revision`. It has a list of `Check`s (test name, kind unit/property/e2e/harness, owner lane).
- `Evidence` records one run of one check: commit SHA, UTC time, result `passed | failed | skipped`, duration, and a log excerpt of at most 4 KB.
- `status(contract, evidence) -> ContractStatus` returns `met | failing | not_run | stale`. A check with no evidence is `not_run`, never passed. Evidence from a commit older than the contract's last change is `stale`.
- `matrix(contracts, evidence)` gives the S37 matrix rows: requirement × check × status.
- `gate(contracts, evidence, required)` passes only when every required contract is `met`. It lists the reasons otherwise.
- Property tests: missing evidence is never `met`; any failed required check fails the gate; adding newer passing evidence never turns `met` into `failing`.
- Seed the S37 sample shapes from `docs/design/spekin-canvas/sample/parts/` (contracts, matrix). Export the types with ts-rs. Add `GET /api/projects/{id}/contracts` with a test.

### IMP-34 · Skills library API (core)

Builds on IMP-22, IMP-27 and IMP-31 (branch from `origin/imp-33-contracts-evidence`). It serves S40 and follows ADR 0007:
- `GET /api/skills` returns the templates, the user's copies and the GitHub sources, each with its stage, source, licence and update policy (sample from `sample/parts/skills.mjs`, SKL_*).
- `POST /api/skills/{id}/copy` makes a user copy of a template (`copy_for_user`). The template itself never changes.
- `PUT /api/skills/{id}` edits a user copy and stores it as a new version. Editing a template or a GitHub skill gives a typed 409.
- `POST /api/skills/github` adds a source with `{repo, path, ref}`, using the IMP-27 adapter through an injected client (tests use the fixtures) and pinning it to a SHA.
- `POST /api/skills/{id}/check` runs the update check. An applied update makes a new version and one history entry. A held update stores the diff and the reasons, and nothing changes.
- `GET /api/skills/{id}/history` and `POST /api/skills/{id}/rollback/{version}`: every version can be rolled back to, and the rollback is itself one history entry and one audit entry.
- One test per route plus a 4xx test. Add the client functions to `apps/web/src/data/api.ts`, with tests.

### IMP-35 · Review follow-ups (core)

Branch from `origin/imp-34-skills-api`. Small items from the lead reviews:
1. A typed 413 for a chunked request body with no Content-Length (from #24), with a test.
2. A separate audit chain for the skills library (from #27). Skills routes append there, not to a project's chain. `GET /api/skills/audit` returns it with `verify`.
3. Wire `tools/checks/licences.mjs` (IMP-12) into the root `npm run gate` after `check:rules`. The lead allows this edit of the lead-owned root `package.json` for this card only.
4. The audit head hash: `AuditLog` serialisation skips `head_hash`, so a stored log can't carry its own anchor (from #21). The server keeps the head apart, as IMP-31 does.

### UI cards after P1 (written 23 Nov)

Order: IMP-07 (S29), IMP-15 (S33), IMP-14 (S32), IMP-13 (S31), IMP-08 (S30), IMP-06 (S28), IMP-16 (S34), IMP-17 (S36), IMP-19 (S38), IMP-18 (S37), IMP-20 (T01). Each card branches from the previous ui branch while the earlier pull requests are still open (stacked), or from origin/main once they are merged. IMP-21 is kept free for "screens read the API" after the core API routes exist.

### IMP-06 · S28 Reference intake (ui)

Board `S28-reference-intake.dc.html`, states `empty, drop, imported, rejected, pii, pasted`. Add `tools/harness/paths/S28.json` and mark each state "checked" only after it passes. The limits and messages come from `sample/parts/intake.mjs` (INTAKE_LIMITS). A rejected file shows its reason and is never stored. The PII state blocks the import until the user chooses. Consent wording follows C-04: files go only to providers whose terms forbid training. All states must PASS the harness.

### IMP-07 · S29 Frames canvas (ui)

Board `S29-frames-canvas.dc.html`, states `board, multi, chat, jobs, over, empty`. Add `tools/harness/paths/S29.json` and mark each state "checked" only after it passes. A press of 3 px or less is a click; a longer press is a drag (F162). Zoom, fit, 100 % and pan come from the toolbar and the keys. **DPAI checks:** (1) a unit test builds the next request from the context strip and shows that it carries only the listed chips, never hidden frames or the whole board. Removing a chip changes context, not content. Select, pin and navigate never send, accept or spend. (2) Logical frames are counted apart from takes and previews. (3) Escape leaves select mode, the active tool is visible, and Tab reaches the artifact tabs and the sidebar. All states must PASS the harness.

### IMP-08 · S30 Style review (ui)

Board `S30-style-review.dc.html`, states `learning, review, conflict, markdown, promote, accepted`. Add `tools/harness/paths/S30.json` and mark each state "checked" only after it passes. DESIGN.md is a view of accepted tokens and is only changed through review (proposal → diff → accept). It is never edited directly. The conflict state shows both values and the source of each. All states must PASS the harness.

### IMP-13 · S31 Alternatives (ui)

Board `S31-alternatives.dc.html`, states `stack, grid, cmp, gen, kept, fail`. Add `tools/harness/paths/S31.json` and mark each state "checked" only after it passes. Takes are previews of one logical frame. The frame count does not change when takes are added. A failed take shows its error and a retry button that never spends without the estimate shown first. **DPAI:** a viewport width switch changes only the preview, never the frame. All states must PASS the harness.

### IMP-14 · S32 Targeted change (ui)

Board `S32-targeted-change.dc.html`, states `select, working, applied, compare, variations, clip`. Add `tools/harness/paths/S32.json` and mark each state "checked" only after it passes. A targeted change creates a proposal and never edits the frame directly. **DPAI:** the targeted-edit mode is visible, Escape leaves it, and keyboard focus can reach the tabs and sidebar from inside it. All states must PASS the harness.

### IMP-15 · S33 Review and accept (ui)

Board `S33-review-accept.dc.html`, states `pins, hover, stale, diff, accepted, rejected`. Add `tools/harness/paths/S33.json` and mark each state "checked" only after it passes. Uses the IMP-04 types (Proposal, Revision, Rejection) from `@spekin/contracts` once PR #2 is merged. Until then it uses sample data shaped like them. Accept creates exactly one revision. Reject creates no revision and adds one audit entry (C-03). A stale proposal cannot be accepted. An empty review list is never shown as accepted. All states must PASS the harness.

### IMP-16 · S34 Coding handoff (ui)

Board `S34-coding-handoff.dc.html`, states `select, manifest, ready, copied, blocked, stale`. Add `tools/harness/paths/S34.json` and mark each state "checked" only after it passes. Only accepted revisions can be selected. **DPAI checks:** the manifest lists exact revisions, exclusions and hashes, and names missing inputs explicitly (for example "PRD: missing"). Two exports of the same selection are byte-identical (unit test). No share link is created; Share stays LATER (R-WS-3). All states must PASS the harness.

### IMP-17 · S36 Models and usage (ui)

Board `S36-models-usage.dc.html`, states `source, cli, api, estimate, ledger, capped`. Add `tools/harness/paths/S36.json` and mark each state "checked" only after it passes. Reads the IMP-11 (model sources) and IMP-09 (ledger) shapes; uses sample data until their API routes exist. An API key is shown as presence plus the last 4 characters only. The CLI pair button is LATER (C-05). No prices or quotas that the sample does not hold. All states must PASS the harness.

### IMP-18 · S37 Build contracts (ui)

Board `S37-build-contracts.dc.html`, states `contracts, detail, matrix, gate, fail, evidence`. Add `tools/harness/paths/S37.json` and mark each state "checked" only after it passes. Evidence shows what ran, when, and its result. A missing check shows as "not run", never as passed. All states must PASS the harness.

### IMP-19 · S38 GenUI panel (ui)

Board `S38-genui-panel.dc.html`, states `stream, cards, question, fallback, confirm, pinned`. Add `tools/harness/paths/S38.json` and mark each state "checked" only after it passes. The card families and actions are the ones IMP-10 validates. An invalid card shows the fallback state and never renders partly. A confirm action never runs before the user confirms. All states must PASS the harness.

### IMP-20 · T01 Tablet and phone (ui)

Board `T01-tablet-phone.dc.html`, states `tablet, tabreview, phlist, phreview, phhand`. Add `tools/harness/paths/T01.json` and mark each state "checked" only after it passes. Same components at narrower widths (no separate mobile app). The harness path sets the viewport per state. No horizontal scroll at the phone width. All states must PASS the harness.

## Carry-forward checks for later ui cards (DPAI addendum, 23 Nov)

When the lead writes the S29, S31, S32 and S34 cards, add these acceptance lines (see incoming/2026-11-23-dpai-addendum-v1.0.md):
- **S29:** a payload test shows the next request carries only the listed context chips. Removing a chip changes context, not content. Select, pin and navigate never send, accept or spend.
- **S29 and S31:** logical frames are counted apart from their takes and previews. A viewport width changes the preview only.
- **S29 and S32:** Escape leaves select and targeted-edit modes, the active mode is visible, and keyboard focus can reach the tabs and sidebar.
- **S34:** the manifest has exact revisions, exclusions and hashes, and lists missing inputs (for example "PRD: missing"). Two exports are byte-identical. No share link is created (R-WS-3).

## Lead canvas tasks (from the review supplement)

These change boards, so only the lead does them: edit the generator, rebuild, lint, `npm run canvas:states`, then republish.

| Task | Board | Change | Blocks |
|---|---|---|---|
| C-01 | S27 | **done** 23 Nov (owner yes): create is four domain choices plus one idea box; name comes from the pitch; Bahasa default with a one-click switch. Part open: the first-run start cards and the Home "Start from" chips still show three starts. | – |
| C-02 | F00 and all boards | **done** 23 Nov: `maps-reqs.mjs` traces 200 of 212 stories to PRD v0.2.3 R-IDs (every ID checked against the PRD). 12 have none yet, with a reason (layout details, S40 owner features). F00 shows them. | – |
| C-03 | S33 | **done, part open**: Reject = no revision plus one audit entry. Still to do: the S30 local accept and S34 re-finalize wording. | S33 card |
| C-04 | S28 | **done**: the consent line and F146 say files go only to providers whose terms forbid training | – |
| C-05 | S36 | Draw the S36 Local CLI pair button as LATER: **done** 23 Nov. Pair again is now LATER on the board (the app already matched; S36 6/6 PASS) | S36 card |

## Open decisions (owner)

See [docs/DECISIONS.md](../DECISIONS.md) → Open. Agents never decide these.

## Known failures and limits (baseline)

- The state gate is 0 / 3 on S35 on purpose: the work area is IMP-01, and the conflict path is a draft for IMP-02.
- The board's `.sp-app` measures 1440 × 901 and the app's 1440 × 900. The harness compares the common area and fails only on a gap over 2 px.
- 71 board states have no click path yet. `check:rules` reports the count, and each card adds its own.
- The state gate in CI only reports (`continue-on-error`). It becomes required per board as cards finish.
- Playwright needs Chromium: run `npx playwright install chromium` once.

## Not checked in this baseline

- CI runs on every push and pull request (public repo, free minutes). Still run `npm run gate` locally before you push. The state gate job only reports, and it fails until boards are built.
- Windows and Linux local setup: only macOS was tried.
- The app at 390 px and the EN/ID switch: the header switch exists, but no translations are wired yet (part of IMP-01/02).

## Where the canvas lives

- Source: `docs/design/spekin-canvas/`. Generators are `*.mjs`, boards are `project/*.dc.html`, and the build is `node docs/design/spekin-canvas/build.mjs`. Check the boards with `npm run canvas:lint`. View them with `npm run canvas:serve`.
- Owner view only: https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U. Other agents can't open it, so use the files.
- Reference screenshots are not in git. See docs/handoff/spekin-canvas.md for how to restore them.
