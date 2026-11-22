# Implementation handoff: canvas to app

Owner: Enrico (lead, with Claude Code). Last updated 23 Nov 2026. Baseline commit: see `git log -1 --format=%h docs/handoff/implementation.md`.

## Continue prompts (paste one into the agent)

**Lane ui: Antigravity, Gemini Neon 4 (medium effort)**

```text
Repo: github.com/yravg/Spekin, branch from origin/main. You are the UI lane.
Read, in order: AGENTS.md, docs/handoff/implementation.md (all of it), docs/GLOSSARY.md, docs/adr/0003-canvas-is-the-ui-source.md, docs/handoff/lanes/ui.md.
Your next card is the first "open" ui card in the status table (start with IMP-01).
Work in your own worktree: git worktree add ../Spekin-ui -b imp-01-shell-work-area origin/main ; cd ../Spekin-ui ; npm ci
Only edit files the ui lane owns. Open the board with npm run canvas:serve (http://127.0.0.1:5180/S35-project-shell.dc.html) and build it EXACTLY as drawn: same classes, labels, order, data-feature ids, same sample data. No redesign, no "not built yet", no pasted board HTML.
Write the failing test first. Done means: npm run gate passes AND npm run harness -- S35 passes for the card's states AND you looked at tools/harness/out/*-board.png, *-app.png, *-diff.png.
Commit one board per pull request (gh pr create), never push to main, never merge your own PR. Update docs/handoff/lanes/ui.md before you stop: status word, evidence, what you did not check.
If anything is unclear or needs a file you don't own, write it under "Requests to lead" in lanes/ui.md and stop that part. Don't guess.
```

**Lane core: OpenCode, DeepSeek V4.1 Flash**

```text
Repo: github.com/yravg/Spekin, branch from origin/main. You are the core lane (Rust and contracts).
Read, in order: AGENTS.md, docs/handoff/implementation.md (all of it), docs/GLOSSARY.md, docs/adr/0002-stack.md, docs/handoff/lanes/core.md.
Your next card is the first "open" core card in the status table (start with IMP-03).
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
| IMP-01 | ui | S35 work area: chat, artifact tabs, canvas pane and inspector for the design and backend states | – | in progress (Antigravity, branch imp-01-shell-work-area) |
| IMP-02 | ui | S35 conflict state, save states (F112), per-stage memory across switches | IMP-01 | open |
| IMP-05 | ui | S27 Projects home (6 states), and "/" becomes S27 | IMP-01, C-01 | open (C-01 done 23 Nov) |
| IMP-03 | core | API source: typed client for the Rust API, equal to the sample | – | done, waiting for owner merge: PR #1 (lead review: approve) |
| IMP-04 | core | Proposals and revisions in the core (accept, reject, revert, stale) | – | done, waiting for owner merge: PR #2 (lead review: approve; merge after #1) |
| IMP-12 | core | No-Python and licence inventory check | – | open |
| IMP-09 | core | Ledger: estimate, reserve, settle, caps | IMP-04 | open |
| IMP-11 | core | Model sources and capability registry | – | open |
| IMP-10 | core | GenUI schema validation, fail closed | – | open |
| IMP-22 | core | Skills core: SkillManifest, versions, update policy and update checks | IMP-04 | open |
| IMP-23 | ui | S40 Skills library (6 states) | IMP-01, IMP-22 types | open |
| IMP-06 … IMP-08, IMP-13 … IMP-21 | ui | S28 … S38, T01, one card per board, written by the lead when P1 is done | P1 | open |

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

## Lead canvas tasks (from the review supplement)

These change boards, so only the lead does them: edit the generator, rebuild, lint, `npm run canvas:states`, then republish.

| Task | Board | Change | Blocks |
|---|---|---|---|
| C-01 | S27 | **done** 23 Nov (owner yes): create is four domain choices plus one idea box; name comes from the pitch; Bahasa default with a one-click switch. Part open: the first-run start cards and the Home "Start from" chips still show three starts. | – |
| C-02 | F00 and all boards | **done** 23 Nov: `maps-reqs.mjs` traces 200 of 212 stories to PRD v0.2.3 R-IDs (every ID checked against the PRD). 12 have none yet, with a reason (layout details, S40 owner features). F00 shows them. | – |
| C-03 | S33 | **done, part open**: Reject = no revision plus one audit entry. Still to do: the S30 local accept and S34 re-finalize wording. | S33 card |
| C-04 | S28 | **done**: the consent line and F146 say files go only to providers whose terms forbid training | – |
| C-05 | S36 | **done, part open**: the board says pairing and runs ship as a later adapter. Still to do: draw the cli state's pair button as later. | S36 card |

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
