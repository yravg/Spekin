# Glossary

Each term is defined once, here. Use these words the same way in code, boards, docs, commits and chats. If a word you need is missing, add it in the same pull request. Product terms that users will see also need an Indonesian (ID) form. Domain terms keep the English form Indonesian practice uses (PRD R-LANG-3).

## The product

| Term | Meaning |
|---|---|
| **Spekin** | This product: one living spec that takes an idea through eight stages to working software. |
| **Living spec** | The project's single source of truth: pitch, decisions, requirements, plan, tickets, criteria, ADRs, glossary, DESIGN.md and tokens. It changes only through accepted proposals. |
| **Stage** | One of the eight steps in the header, in this order: Planning, Specification, Design, Frontend, Backend, Integration, Testing, Deployment. Ids: `planning`, `spec`, `design`, `frontend`, `backend`, `integration`, `testing`, `deploy`. Switching stage swaps the work area in place and never approves anything (R-WF-2). |
| **Stage status** | How a stage reads in the header, always in words plus a mark: ready (`ok`), in progress (`half`), not started (`ring`), needs review (`warn`), blocked (`bad`). Colour alone never carries meaning. |
| **Project** | One product being specified and built. The sample project is *Meranti Yard / Cost variance dashboard*. |
| **Increment** | The feature slice the stages currently describe (e.g. "Inc. 2 · Variance alerts"). |
| **Artifact** | Anything the spec holds that opens in a tab: a spec section, a frame, an API contract, an entity, a migration proposal, a test plan. |
| **Artifact tab** | A tab in the work area showing one artifact. Each stage remembers its own tabs. |
| **Frame** | One screen design on the canvas (ids like `F-03`; don't confuse these with feature ids `F103`). |
| **Canvas (in the product)** | The infinite board in the Design stage where frames live (S29). |
| **Proposal** | A suggested change to the living spec, shown as an exact diff. Nothing changes until someone accepts it (R-EDT-1). |
| **Revision** | A numbered, accepted version of an artifact (`r6`, `r14`). The **accepted spec** is the latest accepted revision of the whole spec. |
| **Stale** | An item whose inputs changed after it was made, e.g. a contract written against spec r13 when r14 is accepted. Stale items need review, never silent updates. |
| **Pin** | Keeping a chat card or GenUI result as a reference. A pinned item that hasn't been accepted stays a proposal. |
| **Evidence** | Proof that a criterion passed: a test run, a build, a screenshot, each with its source and time. Fixture evidence is labelled as fixture. |
| **Readiness** | The stage inspector's view of what a stage still needs: required artifacts, blockers, evidence and the next proposed action. |
| **Agent inbox** | The list of running agent jobs and the approvals they wait for. It sits beside the work, never over it. |
| **GenUI** | Interactive cards that a model streams into chat (checklists, comparisons, questions). Rust validates them against a declared schema before they render. Unknown or unsafe content fails closed (S38, AC-SPK-25). |
| **Coding handoff** | The S34 screen that packs an accepted spec slice for a coding agent. Not to be confused with an **agent handoff**, defined below. |
| **Build contract** | The frontend, backend, integration and release contracts that link a requirement to its task, test, build and release (S37). |
| **Domain pack** | A set of domain rules and fixtures (dashboard, CAD/BIM, project control, finance and stock). |
| **Clean-room** | Learning from a reference product's behaviour without copying its code, text or assets. |

## Skills

| Term | Meaning |
|---|---|
| **Skill** | A reusable working method (for example "Grill the idea" or "Test first"): a SKILL.md with a name, when to use it, and plain instructions. A run of a skill makes proposals, never direct changes. |
| **Skill template** | A skill that ships with Spekin, free for everyone to use and copy. |
| **Skill copy** | A user's own versioned copy of any skill. It doesn't auto-update. It shows when the original has a newer version. |
| **Skill source** | Where skills come from: Spekin templates, a GitHub repository (pinned commit, licence and notice kept), or the workspace itself. |
| **Update policy** | Per source: **Auto-update** (clean updates apply on their own; a new tool, a script or a licence change is held), **Notify me**, or **Pinned**. Every update is listed and can be rolled back. |
| **Skill manifest** | The Rust record of a skill: source, commit, licence, notice, stages, and what it `reads` and `proposes`. The core enforces both. |

## Models and money

| Term | Meaning |
|---|---|
| **Model source** | Where the model runs. There are three (ADR 0005). **Hosted**: Spekin pays and counts credits. **Local CLI**, also called bring your own agent (BYOA): the user's own coding agent CLI, reached through the Spekin Connector. **API provider**, also called bring your own key (BYOK): the user's key for a provider, stored server-side. |
| **Spekin Connector** | A small local helper on `127.0.0.1` that lets the browser app talk to the user's own agent CLI. Later-adapter scope. |
| **Credit (cr)** | The unit of hosted usage shown in the meter. |
| **Ledger** | The record of every hosted job: **estimate** (before), **reserve** (hold the maximum), **settle** (actual cost, release the rest). A job never runs without a reservation (SPK-T-06). |
| **Cap** | The spending limit for a person, project or plan. The meter turns amber at 70 % and red at 90 % of it. |

## The design canvas (how we draw)

| Term | Meaning |
|---|---|
| **Design canvas** | The Claude Design canvas in `docs/design/spekin-canvas`. Its generators (`*.mjs`) write the boards (`project/*.dc.html`). The claude.ai link is the owner's view only, and the files are the source. View them locally with `npm run canvas:serve`. |
| **Board** | One screen drawn in full: the app window, its states, callout notes and the aside cards (What it must show, Motion, Stories, Where it lives). |
| **Screen id** | A board's permanent number: `S27`–`S38` and `T01` (tablet and phone). It is never reused. It appears as `data-screen` in the board and in the app. |
| **Feature id** | A permanent number for one feature: `F101`–`F359`. It appears as `data-feature` on the controls that implement it, in both the board and the app. `F00` is the feature map page. |
| **State** | One view of a board (at most 6 per board). Each has an **entry** (the clicks that reach it) and a **data** source (which sample export it shows). |
| **Board-only marks** | The canvas's annotation language: NEW and PART tags, the LATER tag, outlines and callout notes. These are never built into the app. |
| **Control contract** | Every control either has `data-does` (what it does, which must be true in the app) or `data-later` (disabled, with the reason). A third kind, a button that does nothing, isn't allowed. |
| **Sample project** | *Meranti Yard*, fictional. `docs/design/spekin-canvas/sample/meranti-yard.mjs` plus `sample/parts/*.mjs`. The boards, the app (`@spekin/sample`) and Rust (`fixtures/meranti-yard.json`) all read it. |
| **Feature map (F00)** | The canvas page listing all 195 features with their board, layer and status. |
| **R00** | The canvas page on references and the engine (which ideas come from where, and under which licence). |

## Building (how we prove it)

| Term | Meaning |
|---|---|
| **Canvas-to-app** | Our method: draw, then build the same as drawn, then prove it with the state gate. Rules 12, 15, 16 and 17 are in docs/handoff/implementation.md. |
| **State gate / harness** | `npm run harness`. For each board state it compares the board with the running app: whether the state is reached by clicks, the text, the pixels (at most 1 % different), whether it is built (no stand-ins), and later controls. |
| **Click path** | The steps that reach a state in the app, stored in `tools/harness/paths/<board>.json`. A path is `draft` until it has been tried, and `checked` once the harness reached the state and someone looked at the PNGs. No URL jumps after the first step. |
| **Stand-in (DRAWN)** | A placeholder region (`data-todo`) standing where real UI should be. It always fails the gate. |
| **State manifest** | `docs/design/spekin-canvas/canvas-states.json`: every board's states, controls and later items, generated by `npm run canvas:states`. |
| **Baseline gate** | The full checks run on main before a card starts, so we know what was already failing. |
| **Task card** | One buildable unit with owned files and acceptance checks: `IMP-nn`. |
| **Lane** | A set of files owned by one agent: **ui** (Antigravity, Gemini Neon 4) or **core** (OpenCode, DeepSeek V4.1 Flash). The **lead** (owner with Claude) owns the shared files. |
| **Agent handoff** | A file in `docs/handoff/` saying where work stands, the exact next step and a continue prompt any agent can paste. |
| **Incoming handoff** | Work handed to us by another agent or study (for example from grokbot), kept in `docs/handoff/incoming/` until it is triaged. |
| **Status words** | Only these: `done`, `done, part open`, `done, part blocked`, `open`, `blocked`. |
| **Contract types** | Rust types in `spekin-core` exported to TypeScript (`packages/contracts`) by ts-rs. The Rust type is the source (R-ARC-3). |

## PRD identifiers

| Prefix | Meaning |
|---|---|
| `R-…` | A requirement in the PRD (`R-WF-9`, `R-EDT-1`, `R-GUI-2`). |
| `AC-SPK-n` | An acceptance test in the PRD. All are specifications: none has been run yet. |
| `SPK-T-nn` | A PRD delivery task (SPK-T-01 to SPK-T-14). |
| `M0`–`M4` | PRD delivery slices: baseline, browser workspace, model and commercial foundation, full delivery contracts, pack validation. |
| `P0`–`P6` | Our build phases (docs/ROADMAP.md), mapped to M0–M4. |
| `T-nnn` | Older PRD ticket ids, kept for traceability. |
| `D-SPK-n`, `Q-n` | PRD decisions and open questions. |

## Domain terms (English form used in Indonesia, with an ID gloss)

| Term | ID gloss | Meaning |
|---|---|---|
| Transmittal | surat pengantar dokumen | A cover record listing documents sent between parties. |
| WBS | struktur rincian kerja | Work breakdown structure. |
| CPM | metode jalur kritis | Critical path method scheduling. |
| Data date | tanggal data | The date a schedule's progress is measured to. |
| EAC | perkiraan biaya akhir | Estimate at completion. |
| Variance | selisih / deviasi | Difference between forecast and budget. The sample project flags packages over 3 %. |
| IFC | IFC (format BIM) | Industry Foundation Classes, the open BIM file format. |
