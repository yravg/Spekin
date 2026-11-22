# Spekin PRD v0.2.2. yravgHub Studio consolidation

| Field | Value |
|---|---|
| Product | Spekin. Browser-first living-spec and infinite-canvas revamp of existing yravgHub Studio |
| Owner | Enrico Marlon (yraveragework / yravg) |
| Version | v0.2.2 incremental draft, 22 November 2026, Asia/Shanghai UTC+8. Adds video-grounded contextual GenUI to the combined Spekin workflow and annotated existing-Studio design handoff; CI/CD references stay separate/optional. Rust-first, TS/JS UI, no Python and reuse-first remain. Previous snapshots are preserved. |
| Design source | Design v0.1 [`inputs/design-v0.1-HANDOFF.md`, `inputs/design-v0.1-GAPS.md`, `inputs/design-v0.1-COMPONENT-MAP.md`; Drive folder 1pz544Ku3x-8khIq8xZ6Kk03N5S-FGTHk; updated files 19 Nov 2026: COMPONENT-MAP 1Hc5yEUCMibbOSpR4y1uqtxYCMKTwteV2, HANDOFF 1t1mxeLQ7VwlIvSOsyE30SL9F3moB0ZJQ] |
| Decided in | "Etsy Launch: Build" room, 17 Nov 2026 |
| Status | Planning document only. No app code in this file. |
| Language | Bahasa Indonesia first, English second |
| Payment | IDR, QRIS through Midtrans. Paddle for global sales later |
| Architecture | Existing yravgHub Studio remains the base. Rust-first application core with TS/JS browser UI is the owner direction. No Python product dependency. Reuse working frontend and compatible licensed components. Actual source/deployed revision and migration details require audit. |

**Naming.** Spekin is the working project name. The generated artifact is the spec document, also called the PRD. Final public brand/domain remains an owner decision. This folder is the canonical consolidation; source folders remain unchanged.

## Revision brief. Spekin inside yravgHub Studio

Revision v0.2.2 retains the combined living-spec and canvas revamp of **yravgHub Studio**, not a Momo clone. Section 17 adds contextual GenUI based on reviewed Momo video evidence, a separate optional CI/CD reference, and annotated reuse of the existing Studio/DPAI baseline. The normative v0.2.1 addendum at the end adds workspace switching, Rust-first/no-Python architecture, accepted TS/JS UI, motion quality, and reuse-first decisions from Enrico at 6:50–6:52 PM Asia/Shanghai. Enrico requested this scope on 22 November 2026 at 12:31 PM Asia/Shanghai, UTC+8. Spekin is the working project name. This document authorizes no implementation, account creation, purchase, repository change, or deployment.

Enrico reports that Studio already has a DesainPakeAI-style infinite canvas. Treat that as the starting capability to audit and preserve. Do not build a second canvas or migrate Studio into Solvarium by assumption. The exact current Studio branch, unpushed work, deployed version, persistence model, and reusable components require an authorized implementation audit.

The product is a browser-first workspace for an idea, its requirements, visual design, build plan, and delivery evidence. The persistent header has this stage order:

**Planning → Specification → Design → Frontend → Backend → Integration → Testing → Deployment**

Users can inspect any stage. Progress depends on accepted artifacts and evidence, not on which stage they clicked. Testing begins during development. Deployment remains the final readiness stage and never means automatic production execution.

### What this revision changes

- One project context connects the living spec, infinite canvas, design system, artifact tabs, tasks, tests, and evidence.
- Onlook informs spatial design and targeted visual edits. Paraframe informs alternatives, review, and revision-pinned handoff. OpenDesign informs file tabs, preview modes, model-source choices, and transparent usage. DesainPakeAI informs foundations, canvas frames, and the prototype-to-build workflow. These are behavior references, not dependencies or copied interfaces.
- OpenDesign's current official pages document local-agent, BYOK, and hosted-model paths. Spekin adopts the separation as a product design proposal, not OpenDesign's desktop architecture. Local-agent execution remains deferred.
- The old illustrative Rp99,000 plan and numeric quotas are withdrawn as a current recommendation. New prices, credit conversion, quotas, and subscription rules require an owner decision. No new price is invented here.
- The four specialist packs remain intact. The engineering companion remains normative for its referenced requirements, subject to its existing license and reviewer gates.
- The eight-screen browser flow remains the approved design baseline. Its editable wireframes and PDF are now delivered source artifacts. They need a shell update for this revision; they are not final drawings of the expanded product.

### Reading order and precedence

Read this brief, §7.8, §7.11–7.16, §11.1, and §12 for the consolidated direction. Existing §5–8 pack detail and requirement IDs remain valid unless an explicit delta says otherwise. `TRACEABILITY-v0.2.2.csv` lists every baseline requirement definition and its status. `CHANGELOG-DECISIONS-v0.2.2.md` records scope conflicts. Archive files are evidence, not parallel canonical PRDs.

New detailed behavior is a design specification prepared for review. Enrico's explicit direction is the Studio revamp, named references, infinite canvas, full workflow header, and OpenDesign-inspired model/pricing approach. Exact monetization, routing defaults, implementation architecture details, proposed performance budgets, and expanded drawings need review. The Rust-first/no-Python core, accepted TS/JS UI, motion quality and reuse-first direction are recorded in the v0.2.1 addendum.

Tags:

- **TO VERIFY**: depends on something not seen first-hand (signed-in NPA/DPAI screens, an undefined internal tool, a missing source).
- **ASSUMPTION**: a number or rule picked so the document is complete. Product Desk owns the final value.
- **GAP**: a screen or control this product needs that yravg UI (https://uiux.yraveragehub.io) does not have.
- **[NPA:file]**, **[DPAI:file]**, **[CG:file]**, **[BG:file]**, **[TM:file]**: grab pack files under `/workspace/grab/ngodingpakeai/`, `desainpakeai/`, `codeguide/`, `braingrid/`, `taskmaster/`. **[CMP]** = PRD-tool comparison v2 (Drive 1oWLYFhaYRXu0kMGm08-gXuDTCq9beJ0K; box copy `inputs/COMPARISON-v2.md`). **[REF]** = `inputs/SPEC-START-FROM-REFERENCE.md`. **[MN]** = method note `inputs/POCOCK-VERCEL.md`. `inputs/` = `/workspace/documentation/prd-studio/inputs/`.
- Requirement ids use EARS: `WHEN <trigger> THE SYSTEM SHALL <response>` (also `WHILE`, `IF … THEN`, `WHERE`, and plain `THE SYSTEM SHALL` for always-on rules).

---

## 0. Historical decisions retained from v0.1

| # | Decision (Enrico, via the room) | Where it lands |
|---|---|---|
| S1 | Onboarding as simple as NPA: one path — pick a domain, write one text box. After generation the spec document stays editable at three depths: Simple, Detailed, Expert. Every edit (user or AI) goes propose → diff → accept. No silent overwrites. | §6, R-ONB, R-EDT, entities Proposal / Diff / Revision |
| S2 | Exactly four domains: Dashboard, Engineering, Project control, Financial analysis. | §5, §8 |
| S3 | Keep as requirements: poteto pyramid rules, the yravgbuilder ("yrabuilder") plugin, canvas-to-app. v0.1.2: both defined from the repo audit. | §7.7 |
| S4 | Architecture on hold pending the yravg repo audit. v0.1.2: audit done; §12 is now a PROPOSED architecture, not adopted (pending Enrico decision, audit item 3). | §12 |
| S5 | Positioning: lead with (a) start from a site or screen recording → checked clean-room feature list, and (b) design system built into the plan. Per-task acceptance tests + traceability are baseline. Packs = Indonesian project-control and engineering packs. | §2 |
| S6 | Output is a living spec in three layers mapped to the depths (Spec Kit / Kiro spec–plan–tasks split): Simple = grill interview + decision log + Shape Up pitch; Detailed = EARS behaviour spec + plan + thin vertical-slice tickets whose criteria fail at the starting commit; Expert = ADRs, glossary, traceability matrix, independent review of each diff. | §6 |
| S7 | Engineering domain detail comes from CAD/BIM Desk. v0.1.2: CAD/BIM Desk's Engineering pack v0.1 merged. | §8.2 |
| S8 | "Spec" vs "PRD" naming undecided. | Naming note above |
| S9 | v0.1.1: adopt Template Desk's D-PC additions and REQ-DASH-020/021; hold the D-FIN refocus as a proposal pending Enrico. | §8.1, §8.3, §8.4.1 |
| S10 Reference: gate | `components/definitions-table` + `components/rule-card` | `components/decision-inbox` | PS-SCR-10 | mapped |
| S11 | 22 Nov 2026: Enrico approved, in a 1:1 reply “Yes I agree”, three living-spec additions to this existing spec (not a new PRD): (D1) project-wide principles; (D2) a repeatable add-feature cycle; (D3) a post-build check that turns unmet requirements into PROPOSED tickets. These use existing screens: principles on S07, increment proposals on S08 (entry may also come from S07 or S15), and the gap check on S18. No new depth layer and no new onboarding wizard. A Design Desk UX mapping (Drive doc 18lecBuedqdXet_P1NuIjc_PTTnXIAAyH, 21 Nov 2026) is an optional alignment reference only; it is not a user-approved replacement of Design v0.1, and canonical design is unchanged. | §6.5–6.7, R-PRI, R-EDT-9/10, R-VER-11, AC-49–54 |
| S12 | 22 Nov 2026: Enrico, replying to the completed Paraframe grab pack, said “I want this one to be included.” The Paraframe-inspired frame workspace is included in this same Spec SaaS, not as a separate app. Browser-first and deferred local-project integration now apply to this included workspace; they do not approve the whole SaaS architecture, name, domain, or hosting. Open Design (https://github.com/nexu-io/open-design, research note) is a documented method source for repo-to-spec / UI inventory only; this decision does not adopt its code, plugins, brand, or Apache-2.0 license (Q-30). Videos BogcYWf4siM and pA54H1VYlYg are a later study and are not in this revision. | §7.10, R-WS, R-DS-7/8, S27–S34, Q-30, Q-31 |
| S13 | 22 Nov 2026, ~11:00 Asia/Shanghai: Enrico, in Etsy Launch: Build, replying to Design Desk’s screen-flow widget, said “Approve this screen flow and draw the browser-first wireframes.” The eight-screen browser-first flow (BW-01–BW-08) in Drive `1ni_DhB6mIYthUK0adgQ9Q0jkxrSZ9Hn6` is the approved screen flow for the included workspace (S12). This approval is the screen flow plus a request that Design Desk draw the wireframes; it is not approval to implement code, and local-project integration stays deferred. Design Desk owns the wireframes (offline editable + PDF, because of the room sign-in restriction). This file does not duplicate those drawings. Editable offline wireframes and the 17-page PDF were delivered on 22 Nov 2026. They remain the prior eight-screen baseline and need the v0.2.0 shell revision. Canonical Design v0.1 (S01–S26) is unchanged. | §7.10, S27–S34 |

---

## 1. Problem

Indonesian solo builders who use AI coding agents (Cursor, Claude Code, Codex, Antigravity) start from a one-line idea and ask the agent to build. The agent fills the gaps with guesses: features nobody asked for, screens that do not match, no tests, and no way to tell whether a "done" task is done.

Planning tools exist. All four we studied turn a text idea, a repo or a pasted document into something an agent can build [CMP Headline]. NgodingPakeAI (NPA) and DesainPakeAI (DPAI) already hold the Bahasa + rupiah lane [CMP §2]. What is still open, per the comparison [CMP §4.5, §5]:

- Nobody starts from a **gated capture of a site or a screen recording** turned into a feature inventory in the plan. BrainGrid comes closest with URL / screenshot paste (FR-BG-008) [CMP §4.1].
- Nobody stores a **chosen design system and component set in the plan** [CMP §4.3].
- Nobody shows a **requirement → ticket → test → commit** chain in a UI, though BrainGrid (FR-BG-007, FR-BG-012) and Taskmaster (FR-TM-012, FR-TM-013) cover parts of it [CMP §4.2].
- Nobody ships **Indonesian project-control or engineering packs** [CMP §4.4].
- NPA's public sign-in shows Google only, and live `/plan` is not public [NPA:GAPS.md]. Enrico finds live NPA too tight once a PRD exists [inputs/codeguide-PARITY.md "Start simple, go deep"].

### 1.1 Target users

| Segment | Who | What they need from us | Evidence today |
|---|---|---|---|
| U1 Solo builder / vibe coder (ID) | Indonesian indie developer or non-coder using an AI coding agent, pays in IDR, often by QRIS | One text box → PRD and tasks their agent can follow; Bahasa UI; low monthly price | NPA and DPAI audiences [NPA:PRD.md §1; DPAI:PRD.md §1–2, home counter 8,490 users on 17 Nov 2026] |
| U2 Freelancer / small agency (ID) | Builds client apps, reuses patterns | Reference-to-PRD; one design system per client | DPAI persona "Freelance / agency" [DPAI:PRD.md §2] |
| U3 Planning / project-control engineer (EPCI) | Planner, cost controller, document controller at an EPCI contractor or owner | Plans for internal tools (registers, schedule views, cost reports) that follow real PE practice, not generic CRUD | Enrico's own work. No market data yet, see §1.2 |
| U4 BIM / engineering coordinator | Works with IFC models, quantities, 4D/5D | Plans for model viewers and model-to-schedule/cost links | CAD/BIM Desk scope [/home/box/agent-data/agents/79da4f08-035c-487c-a4e9-94e3c045b350/profile.json] |
| U5 Analyst (dashboard / finance) | Builds dashboards or financial models for a business unit | Plans that apply named dashboard methods or a standard financial model | Gus Bavia method set [/workspace/gusbavia/PATTERNS.md] |

### 1.2 Problem and user validation plan

Nothing here is validated with paying users. These must be true before Build starts Phase 3 (backend):

| # | Must be true | How we test it | Pass mark (ASSUMPTION) | Owner |
|---|---|---|---|---|
| V1 | U1 builders lose time because agents build from vague prompts | 8 interviews with Indonesian AI-coding builders (Discord/YouTube communities, Enrico's network). Ask for the last project that went wrong and why | ≥5 of 8 describe rework caused by a missing spec | Product Desk |
| V2 | U1 will pay IDR monthly for a planning tool while NPA exists | Same interviews + a pricing-page smoke test (waitlist, no checkout) | ≥3 of 8 pay or would pay for NPA-class tools; ≥40 waitlist sign-ups from one post | Product Desk / Launch Desk |
| V3 | Acceptance tests per task change outcomes | 3 builders build one feature twice: plain task vs task with ATs + verify | Fewer reopened tasks with ATs for ≥2 of 3 | Build Desk |
| V4 | Reference-to-PRD is wanted and the clean-room limits are acceptable | Show 3 builders a PRD generated from a public site; ask what they expected that we refused | ≥2 of 3 would use it; refusals are not a deal-breaker | Product Desk |
| V5 | EPCI users (U3) want generated tool plans, not only templates | 5 interviews with planners / cost controllers / document controllers | ≥3 of 5 name a tool they would plan this week | Product Desk (Enrico as SME) |
| V6 | Engineering (U4) and finance (U5) domains pull users | 3 interviews per domain | ≥2 of 3 per domain | Product Desk |

Interview outline (Bahasa, 30 min): last project and where it went wrong; tools in use (NPA, ChatGPT, Cursor rules); how they check an agent's work today; what they pay for now and how (QRIS, card, transfer); show v0.1 flow sketches; ask what they would remove.

---

---

## 2. Positioning

| Layer | What | Comparison verdict [CMP §4.5] | How we state it |
|---|---|---|---|
| Lead (a) | Start from a public site or a screen recording → gated capture → checked clean-room feature inventory (FR-REF ids) → accepted rows land in the spec document | NPA no; BrainGrid partial (URL/screenshot paste, FR-BG-008); Taskmaster no; CodeGuide no (extension briefs out, FR-CG-050). **Open** | Headline |
| Lead (b) | Design system inside the plan: DESIGN.md + tokens, a chosen kit (yravg UI first), each UI ticket names its component | NPA partial via DPAI; BrainGrid no; Taskmaster no; CodeGuide partial (wireframes, no DESIGN.md or per-task component). **Open** | Headline, paired with (a): measured reference tokens become a suggestion, then the user picks a system instead of cloning [CMP §4.3, §4.6] |
| Baseline | Acceptance criteria per ticket, a done-check that runs tests in the user's repo, and a visible requirement → ticket → test → commit trace | **Partially taken** (BrainGrid AC + AI review of PR; Taskmaster `testStrategy` + TDD autopilot) | Table stakes. Shipped in v1 at parity-plus (the visible chain is still open), not used as the headline |
| Packs | Indonesian project-control and engineering packs in Bahasa with local practice (document register, transmittals, WBS/CPM schedule, cost control; IFC/4D/5D; Midtrans/QRIS) | **Open** for ID packs; generic Supabase/Stripe kits are taken by CodeGuide (FR-CG-008) | Domain layer (§8), not a Supabase starter shelf |
| Market door | Bahasa UI and docs, visible IDR prices, QRIS, email + Google login, a free first spec | QRIS till open; free first PRD open vs NPA [CMP §2, rows 11–12] | Entry conditions, not differentiators |

Stated plainly: none of NPA, CodeGuide, BrainGrid or Taskmaster offers (a) or (b) [CMP §4.1, §4.3, §4.5].

---

## 3. Goals and non-goals

### 3.1 Goals (v1)

| ID | Goal | Measure (ASSUMPTION) |
|---|---|---|
| G1 | One domain pick + one text box → a Simple-layer pitch in Bahasa, through a short interview | Median time from first answer to accepted pitch ≤ 10 min |
| G2 | A reference (URL or recording) → gated, checked FR inventory → accepted rows in the spec document | ≥ 70% of references reach an accepted inventory without support |
| G3 | Every plan names a design system and every UI ticket names a component | 100% of UI tickets carry a yravg UI slug or a GAP id |
| G4 | Baseline: every ticket has criteria that fail at its starting commit and a real test command; a verification report after the agent finishes | 100% of tickets; report for ≥ 80% of tickets marked done in month one |
| G5 | Four domains with real substance | Each pack signed off by its reviewer (Enrico for Project control; CAD/BIM Desk for Engineering) |
| G6 | Pay in IDR with QRIS | Sandbox QRIS payment passes on localhost before deploy |

### 3.2 Non-goals (v1)

- Autonomous production code changes or deployment in the browser MVP. Spekin supports editable prototype artifacts, contracts, tasks, and evidence; an explicitly authorized external agent writes production code.
- Copying unlicensed/proprietary code, protected text, assets, or brand. Compatible licensed code reuse with notices/provenance is allowed and preferred under R-REU. Oyenza and named reference-only engineering sources retain stricter study-only restrictions.
- Signing in to a reference on the user's behalf, or accepting cookies / passwords [REF §2].
- Our own autonomous coding agent (CodeGuide markets "Sv2"; BrainGrid has a sandbox Builder, FR-BG-011).
- A CAD editor or a P6 replacement. Packs produce specs for tools; they are not the tools.
- Paddle and non-IDR pricing (later). Team seats beyond owner + viewer (later).

---

## 4. Reference products

| Item | NPA | DPAI | CodeGuide | BrainGrid | Taskmaster |
|---|---|---|---|---|---|
| Core job | Idea → PRD, features, tasks [NPA:HANDOFF.md] | Agent-first prototype canvas with DESIGN.md/tokens [DPAI:PRD.md §1] | Idea or GitHub repo → PRD, stack, flow, wireframes, tasks [inputs/codeguide-HANDOFF.md] | Loop: Frame, Spec, Scope, Load, Verify (FR-BG-005) | `parse-prd` → task graph (FR-TM-006) |
| Intake | Text idea; `/plan` not opened [FR-NPA-006/007] | Hero composer → Google sign-in | Text idea + a few questions; repo (FR-CG-022, FR-CG-032) | Plain idea, interrogated (FR-BG-006); paste PRD / URL / screenshot (FR-BG-008) | PRD text file (FR-TM-006, FR-TM-022) |
| Criteria / tests | Board status from the agent; no AC field [CMP §4.2] | `preview verify` on frames | `testing_document` type only (FR-CG-029) | AC in Spec (FR-BG-007); success criteria per task (FR-BG-009); AI review walks AC (FR-BG-012) | `testStrategy` per task (FR-TM-012); TDD autopilot (FR-TM-013) |
| Dependencies | UNKNOWN | n/a | Not public | Sequenced tasks (FR-BG-009) | `next`, deps add/validate (FR-TM-010, FR-TM-011); complexity 1–10 (FR-TM-008) |
| Agent hand-off | Copy-prompt board + CLI (FR-NPA-045, FR-NPA-054) | CLI 0.3.1 device-code login | `codeguide pull`, extension (FR-CG-050) | MCP / CLI (FR-BG-010, FR-BG-021, FR-BG-022) | MCP + CLI (FR-TM-014) |
| Existing-repo privacy | Local index, summaries only (FR-NPA-052) | n/a | Repo connect; retention UNKNOWN | Analysed temporarily, not stored (FR-BG-020) | Tasks live in the repo |
| Price | Structured data Pro IDR 150,000/mo; bundle IDR 199,000/30 d; live cards UNKNOWN [FR-NPA-017] | Pro Rp99,000/30 d; Pro+Hosting Rp179,000; bundle Rp199,000 [DPAI:research/web/api_api_billing_plans.json] | Free 120 one-time credits; Pro US$24/mo; Founder US$29/mo [inputs/codeguide-HANDOFF.md] | USD from US$29/seat/mo, no free trial (FR-BG-002, FR-BG-014) [CMP §2] | OSS free; Hamster Team US$40/creator/mo (FR-TM-019, FR-TM-020) |
| Language | Bahasa (FR-NPA-065) | Bahasa | English only (FR-CG-054) | English only (FR-BG-025) | English only (FR-TM-021) |
| Sign-in | Google only seen (FR-NPA-037) | Google only | Google or email/password (FR-CG-053) | `app.braingrid.ai/signup` not opened (FR-BG-028) | n/a (CLI) |

NPA's live `/plan` app is **TO VERIFY** throughout: the pack has public `/mock/*` fixtures and the npm README only [NPA:GAPS.md].

### 4.1 Competitive inputs — status

| Input | State at v0.1 | Folded in | Still pending |
|---|---|---|---|
| CodeGuide pack (Grabber Bot) | Finished; HANDOFF, PRD, PARITY downloaded to `inputs/` | Pricing, intake, auth, design-in-plan verdicts, "start simple, go deep" | Signed-in planner, generated docs, checkout (gated) |
| BrainGrid pack (Grabber2) | Finished; FR-BG-001…028 in `/workspace/grab/braingrid/INVENTORY.md` | Loop, AC, verify, intake paste, pricing, privacy | Signed-in app; how Verify scores |
| Taskmaster pack (Grabber2) | Finished; FR-TM-001…023 in `/workspace/grab/taskmaster/INVENTORY.md` | Task model, deps, complexity, TDD autopilot, MCP | Hamster Studio signed-in features |
| Comparison v2 + Indonesian market | Finished [CMP] | Positioning (§2), market door, gap list | — |
| SPEC-START-FROM-REFERENCE | Finished [REF] | §7.3 reference pipeline | Its open questions (video limits, YouTube/Drive links, retention) → Q-06, Q-19 |
| Method note (Pocock, Vercel) | Finished [MN] | §6 layered spec | — |

---

## 5. Domains

Exactly four. The user picks one at onboarding. The domain decides which pack (§8) seeds the spec document, which interview questions come first, and which yravg UI components are suggested.

| Domain | Bahasa label (TO CONFIRM) | For | Not for |
|---|---|---|---|
| D-DASH Dashboard | Dasbor | Data-vis dashboards built on the 24 methods in `/workspace/gusbavia/PATTERNS.md` | Admin panels with no analytic question |
| D-ENG Engineering | Rekayasa (CAD/BIM) | Real CAD/BIM work: IFC models, 4D/5D links from model elements to schedule and cost | Document registers (those are Project control) |
| D-PC Project control | Pengendalian proyek | Document register, transmittals, WBS/CPM schedule, cost control for EPCI projects | CAD viewers |
| D-FIN Financial analysis | Analisis keuangan | Contractor project finance (PoC revenue, billing, cash, bid appraisal) and a simple stock-analysis starter from public sources | Bookkeeping ledgers, tax filing, investment advice |

A user planning a generic SaaS app has to pick the closest domain. Whether a fifth "General app" domain is needed is Q-01.

---

## 6. The living spec: three layers

The spec document (PRD) the product produces is one record with three layers. The depth switch (Simple / Detailed / Expert) shows a layer and everything above it. The split follows the spec → plan → tasks separation that GitHub Spec Kit and Kiro use, as described in Vercel's "What is spec-driven development?" (https://vercel.com/i/spec-driven-development, published 26 Oct 2026, updated 9 Nov 2026) [MN §6], plus Matt Pocock's grill → spec → tickets order (https://www.aihero.dev/skills-grill-me, https://www.aihero.dev/skills-to-spec, https://www.aihero.dev/skills-to-tickets) [MN §1–4].

| Depth | Layer | Artifacts | Source of the method |
|---|---|---|---|
| Simple | Decide | Grill-style interview (one question at a time) → **decision log** → **Shape Up pitch** (problem, appetite, solution, rabbit holes, no-gos) | Pocock `/grill-me`; Shape Up pitch format; Vercel "scale the spec to the change" [MN §2, §6] |
| Detailed | Specify and plan | **Behaviour spec in EARS** (`WHEN <trigger> THE SYSTEM SHALL <response>`), the **plan** (approach, entities, screens with components, constraints), and **thin vertical-slice tickets** with blockers; each ticket's criteria fail at its starting commit and name a real test command | Kiro EARS; Spec Kit requirements / plan / tasks; Pocock `/to-spec`, `/to-tickets`; Vercel Academy "Write the Supported Spec" [MN §4, §6, §7] |
| Expert | Prove and keep | **ADRs**, **glossary**, **traceability matrix** (requirement → ticket → test → commit), and an **independent review** of each diff against the ticket's criteria | Pocock `GLOSSARY.md` + ADR rule; Vercel software factory reviewer station [MN §2, §8] |

`AGENTS.md` for the user's repo is generated as a short standing brief (build/test commands, hard constraints). It is not a fourth layer of the spec [MN §5, §9].

### 6.1 Onboarding (one path) and the Simple layer

Flow:

1. Landing → "Mulai" → sign-in (Better Auth: email + Google; not Google-only [CMP §2]).
2. One screen: four domain cards and one text box ("Ceritakan ide kamu", 20–4,000 characters; ASSUMPTION). The same box takes an optional reference URL or recording (§7.3); Q-08 decides whether that stays in onboarding.
3. Submit → the **interview** starts in chat. One question at a time, never a form. Each question offers a recommended answer the user can accept with one tap, edit, or skip. Questions come from the domain's question bank first, then from gaps in what the user wrote.
4. Every settled answer is written to the **decision log** (decision, alternatives considered, who decided, timestamp, question id). Unanswered or skipped items become open questions.
5. The interview stops when the pitch fields are filled or the user presses "Cukup, buat pitch" (stop rule: at most 12 questions by default; ASSUMPTION).
6. The pitch is proposed (propose → diff → accept, §6.4). On accept, the spec document opens at Simple depth.
7. "Lanjut ke Detail" generates the Detailed layer as a proposal. Tickets are created on purpose, never as a side effect of chatting (same pattern as NPA's public mock, FR-NPA-041).

Pitch fields (Shape Up):

| Field | Content |
|---|---|
| Problem | One paragraph, from the interview |
| Appetite | Time box the user picked (e.g. 1 week, 2 weeks, 6 weeks) |
| Solution | Key flows and screens in plain words; fat-marker level, no field lists |
| Rabbit holes | Known risks and how the pitch avoids them |
| No-gos | What is out of scope |

Rule from [MN §1]: the spec records decisions already made. If the Detailed layer states something with no decision-log entry or pack source, it is flagged "tanpa dasar" (no basis) for the user to confirm or remove.

### 6.2 Detailed layer

- **Behaviour spec**: every requirement in EARS, numbered (`R-<area>-<n>`), each linked to decision-log entries or a pack requirement. Ubiquitous rules use `THE SYSTEM SHALL`. This document's own requirements in §7 are written the same way.
- **Plan**: approach, entities, screens with their components (from the design system), integrations, constraints (the canonical stack is a constraint, not a plan decision [MN §6]).
- **Tickets**: thin vertical slices — each cuts through schema, API, UI and tests and can be demoed on its own; no layer-by-layer slicing [MN §4]. Each ticket has: id, title, linked requirements, component, blockers, acceptance criteria written as observable behaviour, and for each criterion a test name and a real command [MN §7]. Prefactor tickets come first. The breakdown is approved (one proposal) before tickets are published.
- **Starting-commit rule**: each criterion must fail at the ticket's starting commit. The CLI checks this when the ticket starts (§7.5); a criterion that already passes is flagged and must be rewritten or dropped.

### 6.3 Expert layer

- **ADRs**: written only when a decision is hard to reverse, surprising without context, and a real trade-off [MN §2]. Fields: id, title, status, context, decision, consequences, linked requirements.
- **Glossary**: terms settled in the interview (Bahasa + English), e.g. "transmittal", "data date", "EAC".
- **Traceability matrix**: requirement → ticket → criterion → test → commit → latest verification result.
- **Independent review**: after a ticket's verification run, a reviewer agent in a fresh session, ideally on a different model vendor, sees only the diff (commit range) and the ticket's criteria — never the implementer's reasoning — and returns pass / fail per criterion with reasons [MN §8]. Code stays on the user's side; see §7.5 for how the diff reaches the reviewer.
- **Owner and update rule**: the spec is spec-anchored: it has an owner, and changes after tickets start go through proposals with downstream "needs review" marks [MN §6].

### 6.4 Editing: propose → diff → accept (all layers)

Every change to pitch, decision log, requirements, plan, tickets, criteria, ADRs, glossary, DESIGN.md or tokens goes through one pipeline, including the user's own typing.

| Step | User edit | AI edit (interview, chat, depth expansion, reference import, CLI context, domain pack) |
|---|---|---|
| Propose | User edits in edit mode; "Simpan usulan" turns the edit into a Proposal | Agent writes a Proposal with a one-line reason and its source (decision id, chat message id, reference id, CLI sync id, pack version) |
| Diff | Word-level diff per block, plus the list of affected requirements, tickets and criteria | Same |
| Decide | Accept all, accept or reject per hunk, or edit then accept | Same. AI proposals never auto-accept |
| Result | One new Revision (number, author type, author id, parent revision) | Same |

- **Stale**: if the base revision changed, the proposal is Stale and cannot be accepted until rebased; the user reviews the new diff.
- **Downstream**: an accepted change to a requirement marks linked tickets and criteria "perlu ditinjau" (needs review). Nothing downstream is rewritten without its own proposal.
- **Revert** = a new proposal whose diff restores an older revision.
- **Depth switching**: moving up with missing content creates a proposal; moving down only hides.

### 6.5 Project principles (S11 / D1; surface: S07)

Approved 22 Nov 2026 (S11). This is not a fourth layer, not a new onboarding wizard, and it does not replace `AGENTS.md` or the plan's stack, kit, or design-system choices.

The living spec holds a first-class **project-principles** block (“Prinsip proyek”), visible on the existing S07 Spec document at every depth (a compact form is enough on Simple). Each principle records its accepted revision and decision source. An unaccepted starter is visibly a Proposal; an unanswered principle is an open question, not an accepted default. Edits go through propose → diff → accept (R-EDT) on S08. Acceptance marks affected downstream blocks “perlu ditinjau”; it does not silently repair them or overwrite `AGENTS.md`.

A Design Desk proposal (21 Nov 2026, Drive 18lecBuedqdXet_P1NuIjc_PTTnXIAAyH) maps this onto S07/S08. That mapping is optional alignment only and is not a user-approved design change.

| ID | Requirement |
|---|---|
| R-PRI-1 | THE SYSTEM SHALL store a project-principles block in the living spec, distinct from the Shape Up pitch, the plan, and any agent instruction file, and SHALL show it on S07 at every depth. |
| R-PRI-2 | WHEN the project-principles block is created or changed THE SYSTEM SHALL apply the propose → diff → accept pipeline (R-EDT-1) on S08. |
| R-PRI-3 | THE SYSTEM SHALL not treat a principles change as a change to the chosen stack, kit, or design-system selection in the plan; those stay in the plan (R-DS) and change only by their own Proposals. |

### 6.6 Incremental features in the same living spec (S11 / D2; surface: S08)

Later features are increment Proposals in the **same** living spec. The product shall not require a Git feature branch for an increment to be valid. Previously accepted requirements stay as they are unless a **separate** accepted Proposal changes them.

Entry may come from the current project on S07 or from the ticket board on S15; both start the same increment Proposal, not a second project and not an overwritten pitch. A short interview (S04) appears only for unanswered increment questions; already cited answers stay on S05. S08 groups added requirements, changed plan rows, new tickets, and explicit removals. Unchanged accepted content stays outside the diff. Adding a feature is not permission to regenerate every layer.

| ID | Requirement |
|---|---|
| R-EDT-9 | WHEN the user starts an add-feature increment THE SYSTEM SHALL create one or more Proposals in the same living spec (requirements, plan, tickets, and criteria as needed) and SHALL present them on S08; THE SYSTEM SHALL not require a Git feature branch for the increment to be valid; THE SYSTEM SHALL not treat the increment as a new project or as permission to regenerate unchanged layers. |
| R-EDT-10 | THE SYSTEM SHALL leave previously accepted requirements unchanged by an add-feature increment unless the increment includes a separate Proposal that changes those requirements and that Proposal is accepted. |

### 6.7 Post-build gap check (S11 / D3; surface: S18)

After implementation, S18 can run a read-only comparison of an identified spec revision against **available** build or repo evidence. S18 shall show which evidence was examined, and shall show missing inputs, **before** the findings. No connected repository, or otherwise missing evidence, is a missing-evidence state — not a clean “no gaps” report. Missing evidence is not a pass, and an untested requirement is not a pass.

Findings list the affected requirement or plan item, the supporting evidence, and a suggested follow-up. “Usulkan tiket sisa” (or equivalent) opens S08; only acceptance appends linked tickets to S15. Ticket proposals never silently change approved requirements, the plan, or code, and they never mark a requirement verified (R-VER-8 still governs). If a requirement itself is missing, the system raises a question or a separate requirement Proposal rather than disguising new scope as a leftover ticket. A clean report may say that no gaps were found **on the evidence examined**, not that all requirements are verified. This workflow stays on S18 / S08 / S15; it is not sent to S26 and is not the project-control schedule.

| ID | Requirement |
|---|---|
| R-VER-11 | WHEN a post-build gap check runs THE SYSTEM SHALL show on S18 which evidence was examined and the outcome for each in-scope requirement (met, unmet, untested, or evidence missing), and SHALL show missing inputs before the findings; THE SYSTEM SHALL NOT treat missing evidence or an untested requirement as a pass or as “no gaps found”; THE SYSTEM SHALL, for unmet behaviour, offer only PROPOSED tickets that append work (reviewed on S08; appended to S15 only on accept), and SHALL NOT silently change accepted requirements, the plan, or code, and SHALL NOT mark a requirement verified (R-VER-8 still governs). |

---

## 7. Behaviour spec (EARS) and feature detail

### 7.1 Onboarding and interview (R-ONB)

| ID | Requirement |
|---|---|
| R-ONB-1 | THE SYSTEM SHALL show exactly four domain options and one text box on the onboarding screen, and no other required input. |
| R-ONB-2 | WHEN the user submits a domain and an idea of at least 20 characters THE SYSTEM SHALL start the interview in chat. |
| R-ONB-3 | WHILE the interview runs THE SYSTEM SHALL ask one question at a time, each with a recommended answer the user can accept, edit or skip. |
| R-ONB-4 | WHEN the user answers or accepts a recommendation THE SYSTEM SHALL write a decision-log entry with the question id, the decision, the alternatives offered and a timestamp. |
| R-ONB-5 | WHEN the user skips a question THE SYSTEM SHALL record it as an open question in the spec document. |
| R-ONB-6 | WHEN all pitch fields are filled, or the user presses "Cukup, buat pitch", or 12 questions have been asked THE SYSTEM SHALL propose the Shape Up pitch as a Proposal. |
| R-ONB-7 | THE SYSTEM SHALL not create tickets until the user asks for the Detailed layer and accepts the ticket breakdown proposal. |
| R-ONB-8 | THE SYSTEM SHALL default the UI to Bahasa Indonesia and keep the interview state when the user switches to English. |
| R-ONB-9 | THE SYSTEM SHALL offer sign-in by email and by Google. |

### 7.2 Editing (R-EDT)

| ID | Requirement |
|---|---|
| R-EDT-1 | THE SYSTEM SHALL change spec content (pitch, decisions, requirements, plan, tickets, criteria, ADRs, glossary, DESIGN.md, tokens) only by accepting a Proposal. |
| R-EDT-2 | WHEN a Proposal is opened THE SYSTEM SHALL show a word-level diff per target with per-hunk accept and reject. |
| R-EDT-3 | WHEN a Proposal is accepted THE SYSTEM SHALL create exactly one Revision whose parent is the proposal's base revision. |
| R-EDT-4 | IF a Proposal's base revision is not the current revision THEN THE SYSTEM SHALL mark it Stale and block acceptance until it is rebased. |
| R-EDT-5 | WHEN the user moves to a deeper layer that has missing content THE SYSTEM SHALL create a Proposal for the missing blocks; WHEN the user moves to a shallower layer THE SYSTEM SHALL change no data. |
| R-EDT-6 | WHEN a requirement change is accepted THE SYSTEM SHALL mark linked tickets and criteria "needs review". |
| R-EDT-7 | WHEN the user reverts to revision N THE SYSTEM SHALL create a Proposal whose accepted result has revision N's snapshot hash. |
| R-EDT-8 | IF a Detailed or Expert block has no linked decision, pack requirement or reference FR THEN THE SYSTEM SHALL flag it "tanpa dasar". |
| R-EDT-9 | WHEN the user starts an add-feature increment THE SYSTEM SHALL create one or more Proposals in the same living spec (requirements, plan, tickets, and criteria as needed) and SHALL present them on S08; THE SYSTEM SHALL not require a Git feature branch for the increment to be valid; THE SYSTEM SHALL not treat the increment as a new project or as permission to regenerate unchanged layers. |
| R-EDT-10 | THE SYSTEM SHALL leave previously accepted requirements unchanged by an add-feature increment unless the increment includes a separate Proposal that changes those requirements and that Proposal is accepted. |

### 7.3 Lead (a): start from a site or screen recording (R-REF)

Product version of the team's `/grab` pipeline [REF]. The comparison calls this gap open; BrainGrid's URL/screenshot paste (FR-BG-008) is the nearest thing and has no gate, capture, inventory, captions or clean-room step [CMP §4.1].

Pipeline: **gate → capture → FR inventory → captioned figures → clean-room check → review (accept / reject rows) → accepted rows become requirements**, each still carrying its FR id and evidence pointer [REF §3–§8].

| ID | Requirement |
|---|---|
| R-REF-1 | THE SYSTEM SHALL write a gate record (target, purpose, authority, robots or permission result, reuse boundary, stop rules) before any fetch or transcription [REF §3]. |
| R-REF-2 | WHEN a URL is given THE SYSTEM SHALL read `robots.txt` and, where present, `ai.txt`, `llms.txt`, `Content-Signal` and `X-Robots-Tag`, and record allowed / blocked / unclear. |
| R-REF-3 | IF the site disallows AI agents by name or sets `ai-input=no` THEN THE SYSTEM SHALL not capture it and SHALL offer three choices: stop; use only cited public third-party writing; or return with written permission from the site owner [REF §3]. |
| R-REF-4 | WHILE capturing THE SYSTEM SHALL abort requests to disallowed paths, including `/api/`, sign-in, checkout and any robots-listed path. |
| R-REF-5 | IF a page ends on sign-in, sign-up, payment or a disallowed path (including a client-side redirect) THEN THE SYSTEM SHALL stop, keep any public screenshot of the gate, and record a gap. |
| R-REF-6 | WHEN the user uploads a recording THE SYSTEM SHALL require a permission confirmation and SHALL state that this is not a licence to clone a product or reuse its brand, copy or art. |
| R-REF-7 | IF a recording frame shows a password, card number, sign-in secret or personal data THEN THE SYSTEM SHALL blur or skip that frame and SHALL not store the secret in the spec. |
| R-REF-8 | WHEN capture is allowed THE SYSTEM SHALL capture each allowed page at 1440 and 390 px (viewport and full page), or key screens from the recording with timestamps, and SHALL record title, URL, time (UTC+8) and how it was reached. |
| R-REF-9 | THE SYSTEM SHALL produce an FR inventory where each row has an `FR-REF-nnn` id, a short name in our wording, an evidence pointer (shot + marker number, or timestamp), a status (seen / partial / not reached with reason) and behaviour notes. |
| R-REF-10 | THE SYSTEM SHALL mark anything not visible as UNKNOWN with what would resolve it, and SHALL not invent features. |
| R-REF-11 | THE SYSTEM SHALL caption every figure with screen, how reached, purpose, numbered markers with a key, supported FR ids, source and capture date. |
| R-REF-12 | WHEN the user accepts inventory rows THE SYSTEM SHALL propose them as requirements with FR id and evidence pointer attached; rejected rows SHALL stay as "seen, not in scope". |
| R-REF-13 | THE SYSTEM SHALL turn measured reference tokens into a design note only, and SHALL require the user to pick a design system (§7.4) instead of cloning the reference. |
| R-REF-14 | IF a URL and a recording are both given THEN THE SYSTEM SHALL keep them as two evidence sources and SHALL not merge them silently. |
| R-REF-15 | THE SYSTEM SHALL never ask for cookies, session files or passwords for a reference. |
| R-REF-16 | THE SYSTEM SHALL not use reference packs to train models, and SHALL honour `ai-train=no` / `use=reference`. |
| R-REF-17 | WHEN `purge_at` is reached THE SYSTEM SHALL delete raw captures (default 30 days; ASSUMPTION, Q-06). |

Input limits (ASSUMPTION): URL ≤ 10 allowed pages per reference; recording `.mp4`/`.webm` ≤ 10 min and ≤ 500 MB on Pro, ≤ 2 min on Free; screenshots ≤ 30. Whether public YouTube or Drive links count as recordings is Q-19 [REF §11].

#### 7.3.1 Clean-room policy (shown in the product)

Allowed: behaviour and measured values (a button books a slot; a price of Rp199.000 / 30 days; a background of `#0a1128`) written in new wording; short UI titles only to identify a control [REF §7].

What the system refuses:

| Refusal | Detection | What the user sees |
|---|---|---|
| Source code, CSS, JS or HTML of the reference | Scripts are never fetched for output; generated code fences are compared with fetched content | "Kode dari referensi tidak disalin." |
| Copy text beyond short labels | Any run of ≥ 8 words matching captured text is blocked (ASSUMPTION threshold) | Block replaced by a neutral paraphrase proposal |
| Brand names, logos, product names, mascots, unique illustrations | Brand terms from title, meta and OCR; images never exported | Brand replaced with "[nama produk kamu]" |
| Colour palette, fonts, illustrations as a theme | Tokens come from the chosen design system, never captured CSS | "Token desain diambil dari sistem desain kamu, bukan dari referensi." |
| Pages behind login or paywall, robots-disallowed paths, AI opt-out | R-REF-2…5 | Reference or page rejected, with the rule and path |
| Recordings the user has no right to share | Not reliably detectable; consent box + ToS | Warning at upload |
| "Make it look exactly like X" / "clone X" | Prompt classifier | Agent says it plans accepted behaviour on the user's own design system |

Screenshots stay in the private reference pack and are not copied into the user's repo or exported in the spec document.

#### 7.3.2 What lands in the spec document [REF §8]

| Pack piece | Lands as |
|---|---|
| Gate result | "Sources and limits" section: allowed, blocked, UNKNOWN |
| Accepted FR rows | Requirements (EARS) carrying FR id + evidence pointer |
| Rejected FR rows | Out of scope, kept for traceability |
| Captioned figures | Reference figures attached to the requirement (owner-only), not brand art |
| Measured tokens | Starting-point design note; the plan then picks a design system |
| Sitemap and flows | Editable user-flow and IA drafts |
| Gaps (login, blocked API, missing footage) | Open questions or later tickets |

### 7.4 Lead (b): design system in the plan (R-DS)

| ID | Requirement |
|---|---|
| R-DS-1 | WHEN the Detailed layer is generated THE SYSTEM SHALL include a DESIGN.md (purpose, tone, grid, type scale, colour roles, spacing, radius, motion rules, component list, do/don't) and a `tokens.json` (W3C design-tokens format; ASSUMPTION) mapped to Tailwind + shadcn CSS variables. |
| R-DS-2 | THE SYSTEM SHALL record the chosen kit (yravg UI by default) as a plan decision with a decision-log entry. |
| R-DS-3 | THE SYSTEM SHALL give every UI ticket exactly one primary component: a yravg UI slug or a GAP id. |
| R-DS-4 | IF a needed component is not in the chosen kit THEN THE SYSTEM SHALL create a GAP entry with the closest existing item. |
| R-DS-5 | WHERE the user is on Free THE SYSTEM SHALL use yravg default tokens (canvas `#FAF9F5`, Inter, JetBrains Mono for numbers, clay `#B4532A`, no gradients) [/workspace/gusbavia/PATTERNS.md header]. |
| R-DS-6 | WHEN a ticket prompt is copied or pulled by an agent THE SYSTEM SHALL include the component slug, its install line, and the relevant DESIGN.md rules. |
| R-DS-7 | WHEN the user asks to sort out UI from a connected existing codebase, or from an entitled screenshot or URL already in scope, THE SYSTEM SHALL propose a UI inventory and a DESIGN.md / tokens draft as a Proposal (R-EDT-1), citing the documented Open Design method as a source only (https://github.com/nexu-io/open-design, ref recorded in OPEN-DESIGN-RESEARCH.md); THE SYSTEM SHALL not auto-accept that Proposal, SHALL not copy third-party brand or source into the plan, and SHALL mark the extraction as documented-method, not runtime-verified behaviour. |
| R-DS-8 | THE SYSTEM SHALL NOT automatically refactor the user's codebase or adopt a whole reference application/desktop stack. It SHALL prefer reusable existing components and compatible licensed source under R-REU, with per-file license/provenance review. Q-30 governs codebase-refresh architecture and any broader adoption, not a blanket ban on permissively licensed code. |

#### 7.4.1 yravg UI items (confirmed)

Checked against the live catalogue `https://uiux.yraveragehub.io/llms-full.txt` (WebFetch, 17 Nov 2026, about 21:00 UTC+8) and the box copy `/workspace/grab/codeguide/research/uiux/llms-full.txt` (179 items). All six named in the brief exist:

| Name in brief | yravg UI item | Use here |
|---|---|---|
| Agent Run | `screens/agent-run` | Spec generation run; reference capture run |
| Agent Chat | `screens/agent-chat` | Interview and spec chat with the editable brief beside it |
| Agent Inbox | `components/agent-inbox` | All background runs (generations, captures, verifications, reviews) with Approve / Reject / Retry |
| Steering | `components/agent-steering` (catalogue name "Agent Steering") | Queue a note into a running generation or capture |
| Trace Waterfall | `components/trace-waterfall` | Tokens and cost per run step |
| Task Board | `blocks/task-board` | Ticket board |

Other items planned: `components/ask-panel` (interview question), `components/inline-diff`, `components/change-summary`, `components/review-center`, `components/approval-card`, `components/decision-inbox`, `components/agent-plan`, `components/dropzone`, `components/soft-gate`, `components/status-pill`, `components/locked-item`, `components/agent-monitor`, `components/progress-tracker`, `components/data-table-plus`, `components/definitions-table`, `components/source-note`, `components/context-map`, `components/usage-meter`, `blocks/pricing-plans`, `screens/settings-billing`, `screens/evals`, `components/data-table`, `components/schedule-chart`, `components/dcma-bars`, `blocks/schedule-dashboard`, `components/milestone-stepper`, `components/plan-vs-actual`, `components/breakdown-chart`, `screens/app-shell`. Reference-step picks follow [REF §10].

The catalogue also has 42 Foundations items not listed in `llms-full.txt`; whether one is a token viewer is TO VERIFY.

#### 7.4.2 GAPs (no yravg UI item found)

| GAP | Needed for | Closest existing item |
|---|---|---|
| GAP-01 Domain picker + single idea box | §6.1 | `screens/assistant-home`, `screens/onboarding` (more controls than we want) |
| GAP-02 Spec document view with Simple / Detailed / Expert switch | §6 | `components/writing-assistant` |
| GAP-03 Section-level proposal diff with per-hunk accept and stale/rebase state | §6.4 | `components/inline-diff`, `components/review-center` |
| GAP-04 Revision history timeline for a document | §6.4 | Design v0.1: closed by `components/feed-list` + "Kembalikan sebagai usulan" (revert creates a Proposal) |
| GAP-05 Decision log view (decision, alternatives, source question) | §6.1 | Design v0.1: closed by `components/data-table` + `filter-chips` + `source-note` |
| GAP-06 Shape Up pitch card (problem, appetite, solution, rabbit holes, no-gos) | §6.1 | none |
| GAP-07 Recording review surface: timeline, key-frame strip, timestamp markers tied to FR rows | §7.3 | none [REF §10; inputs/codeguide-HANDOFF.md "Agentic UI"] |
| GAP-08 FR inventory review: rows with evidence thumbnail, marker key, accept/reject | §7.3 | `components/data-table-plus`, `components/review-center` |
| GAP-09 Clean-room refusal panel ("Yang tidak kami salin") | §7.3.1 | Design v0.1: closed by `components/rule-card` |
| GAP-10 DESIGN.md + token viewer/editor | §7.4 | Foundations (TO VERIFY) |
| GAP-11 Traceability matrix requirement → ticket → test → commit | §7.5 | `components/data-table` |
| GAP-12 Verification + independent review report | §7.5 | `screens/evals` |
| GAP-13 QRIS checkout (QR, countdown, status polling) | §7.8 | `blocks/pricing-plans`, `screens/settings-billing` |
| GAP-14 Gantt with WBS rows, logic links and critical path | §8.3 | `components/schedule-chart` (curves, not a Gantt) |
| GAP-15 Transmittal composer (document picker, purpose, recipients, cover sheet) | §8.3 | `components/data-table` |
| GAP-16 Cost breakdown tree with budget / commitment / actual / EAC columns | §8.3 | `components/data-table`, `components/expandable-row` |
| GAP-17 Variance bridge (waterfall) chart | §8.1, §8.3 | `components/flow-diagram` (signed bands, not a waterfall) |
| GAP-18 ModelViewer: WebGL viewport, toolbar, view cube, status bar (pack §6.2, largest gap) | §8.2 | none — nothing in the catalogue renders 3D |
| GAP-19 ModelTree with per-node visibility, counts, Pset grouping, two-way 3D sync | §8.2 | none |
| GAP-20 PropertiesPanel: grouped key/value, units in mono, "varies", sum, `qto` / `computed` badge | §8.2 | none |
| GAP-21 SectionTool and MeasureTool (3D handles plus list) | §8.2 | none |
| GAP-22 IssuePin / ClashPin anchored in 3D with status colour and card | §8.2 | `components/comments-panel` (card part only) |
| GAP-23 TakeoffCanvas and ScaleCalibrator for PDF sheets (v2) | §8.2 | none |
| GAP-24 Timeline4D: date scrubber, play controls, state legend, planned/actual | §8.2 | none |
| GAP-25 LinkMatrix: activities × sources with counts and an unlinked column | §8.2 | `components/data-table-plus` (matrix mode missing) |
| GAP-26 Cost S-curve with period bars, baseline/current/actual curves, data-date line | §8.2, §8.3 | Design v0.1: closed by `components/schedule-chart` (S-curve, banana, cash-flow modes) + `components/breakdown-chart`; prop request if all three curves must draw together |
| GAP-27 LinkRuleEditor and PlanView (v2) | §8.2 | none |
| GAP-28 Sector heatmap (sectors × ratios, normalised colour) | §8.4 | Design v0.1: closed by `components/heatmap` (non-time columns TO VERIFY) |
| GAP-29 Screen canvas for S21: frame grid (screen id, title, component tags, "UI tanpa komponen" count), frame detail with pinned comments, "Setujui kanvas" (unlocks frontend tickets, logs a decision), "Kirim ke yravgbuilder" (disabled until approved) | §7.7.3, R-KEEP-4…6 | none (Design v0.1, PS-CMP-33; proposed there, adopted here) |

GAP-18…27 come from CAD/BIM Desk's pack §6.2 (the pack notes its yravgUI check used a partial clone). Design Desk's verdicts (Design v0.1 GAPS.md, answers T-106 / Q-07): 14 confirmed to add to yravgUI (01, 02, 03, 06, 07, 08, 10, 11, 12, 13, 14, 15, 16, 17); 5 closed by existing components (04, 05, 09, 26, 28); 9 engineering GAPs (18…25, 27) handed to CAD/BIM Desk as stubs; GAP-29 new.

#### 7.4.3 Screen-to-component table (filled from Design v0.1)

| Screen | Primary | Secondary | Design v0.1 frame | Status |
|---|---|---|---|---|
| S01 Landing (ID/EN) | `components/button` + `components/fat-footer` | `blocks/pricing-plans` | PS-SCR-01 | mapped |
| S02 Sign-in (email code first, Google second) | `components/text-input` + `components/otp-input` | `components/button` | PS-SCR-02 | mapped |
| S03 Onboarding: domain + idea box | GAP-01 | `components/dropzone` | PS-SCR-03 | mapped |
| S04 Interview | `screens/agent-chat` | `components/smart-recommendation`, GAP-02 (compact), `components/progress-tracker` | PS-SCR-04 | mapped |
| S05 Decision log | `components/data-table` | `components/filter-chips`, `components/source-note` | PS-SCR-05 (GAP-05 closed) | mapped |
| S06 Pitch (Simple) | GAP-06 | `components/decision-inbox` | PS-SCR-06 | mapped |
| S07 Spec document (depth switch) | GAP-02 | `components/segmented-control` | PS-SCR-07 | mapped |
| S08 Proposal review | GAP-03 | `components/inline-diff`, `components/change-summary` | PS-SCR-08 | mapped |
| S09 Revision history | `components/feed-list` | `components/button` | PS-SCR-09 (GAP-04 closed) | mapped |
| S10 Reference: gate | `components/soft-gate` | `components/status-pill` | _Design Desk_ | open |
| S11 Reference: capture run | `screens/agent-run` | `components/agent-steering`, `components/trace-waterfall`, `components/agent-monitor` | PS-SCR-11 | mapped |
| S12 Reference: recording review | GAP-07 | `components/source-note` | PS-SCR-12 | mapped |
| S13 Reference: FR inventory review | GAP-08 | `components/rule-card` (GAP-09 closed) | PS-SCR-13 | mapped |
| S14 Design system | GAP-10 | `blocks/app-directory`, `components/agent-findings` | PS-SCR-14 | mapped |
| S15 Ticket board | `blocks/task-board` | — | PS-SCR-15 | mapped |
| S16 Ticket detail + criteria | `components/approval-card` | `components/prompt-library` | PS-SCR-16 | mapped |
| S17 Traceability matrix | GAP-11 | `components/kpi-tiles` | PS-SCR-17 | mapped |
| S18 Verification + review report | GAP-12 | `screens/evals` | PS-SCR-18 | mapped |
| S19 ADRs + glossary | `components/definitions-table` | `components/feed-list` | PS-SCR-19 | mapped |
| S20 Agent inbox | `components/agent-inbox` | `components/usage-meter` | PS-SCR-20 | mapped |
| S21 Canvas step (canvas-to-app) | GAP-29 | — | PS-SCR-21 | mapped (GAP-29) |
| S22 Pricing + QRIS checkout | `blocks/pricing-plans` | GAP-13 | PS-SCR-22 | mapped |
| S23 Settings, billing, usage | `screens/settings-billing` | `components/pill-tabs`, `components/soft-gate` | PS-SCR-23 | mapped |
| S24 CLI device-code page | `components/otp-input` | `components/permission-request` | PS-SCR-24 | mapped |
| S25 Export (Markdown / zip / yravgbuilder) | `screens/files` | — | PS-SCR-25 | mapped |
| S26 Plan control (Expert; Design PROPOSAL): build plan of the user's app — tickets planned vs done, credits budgeted vs spent | `components/schedule-chart` (GAP-26 closed) | `components/milestone-stepper`, `components/kpi-tiles`, GAP-17 | PS-SCR-26 | mapped; Design's scope is the default until Enrico confirms (Q-29) |
| S27 Frame workspace: project entry (BW-01) | — | — | — | added v0.1.5 (S12); eight-screen flow approved v0.1.6 (S13); wireframes owned by Design Desk (delivered baseline, not redrawn in this file); not a Design v0.1 screen |
| S28 Frame workspace: reference intake (BW-02) | — | — | — | added v0.1.5 (S12); flow approved v0.1.6 (S13); import-first; capture/browse not working controls in this slice |
| S29 Frame workspace: frames canvas (BW-03) | — | — | — | added v0.1.5 (S12); flow approved v0.1.6 (S13). Distinct from S21 canvas-to-app |
| S30 Frame workspace: style review (BW-04) | — | — | — | added v0.1.5 (S12); flow approved v0.1.6 (S13); inferred tokens need acceptance; promoting into the plan uses R-DS / R-EDT |
| S31 Frame workspace: alternatives and comparison (BW-05) | — | — | — | added v0.1.5 (S12); flow approved v0.1.6 (S13); alternatives do not change the accepted baseline |
| S32 Frame workspace: targeted change (BW-06) | — | — | — | added v0.1.5 (S12); flow approved v0.1.6 (S13) |
| S33 Frame workspace: review and accept (BW-07) | — | — | — | added v0.1.5 (S12); flow approved v0.1.6 (S13); stale items cannot be accepted without re-evaluation |
| S34 Frame workspace: coding handoff (BW-08) | — | — | — | added v0.1.5 (S12); flow approved v0.1.6 (S13); download of selected accepted revisions; does not replace S25 |

Source: Design v0.1 [`inputs/design-v0.1-HANDOFF.md`, `inputs/design-v0.1-GAPS.md`, `inputs/design-v0.1-COMPONENT-MAP.md`; Drive folder 1pz544Ku3x-8khIq8xZ6Kk03N5S-FGTHk] COMPONENT-MAP §A. Design checked slugs against the catalogue on 17 Nov 2026.

S26 traceability: §6.3 Expert layer; tickets and their states (§7.5 R-VER, §11); usage limits (§7.8.1). S26 is a Design PROPOSAL (per Design Desk, relayed by Grok Bot, 19 Nov 2026): it shows the build plan of the user's app (tickets planned vs done, credits budgeted vs spent). The user's own project schedule and cost views stay in the Project control pack (§8.3). No requirement defines S26 yet, and "credits" are not defined in §7.8; both wait on Q-29.

**Where Design v0.1 and this spec do not match (v0.1.3 check, updated v0.1.4)**

| # | Item | Design v0.1 | This spec | Action |
|---|---|---|---|---|
| M1 | Plan control screen | PS-SCR-26, a Design PROPOSAL: build plan of the user's app (per Design Desk, relayed by Grok Bot, 19 Nov 2026) | no requirement | S26 added with Design's scope as default; open until Enrico confirms (Q-29) |
| M2 | Screen canvas GAP id | an earlier Design draft called it GAP-19 | GAP-19 is ModelTree | GAP-29 used |
| M3 | GAP-04, 05, 09, 26, 28 | closed by existing components | listed as gaps | verdicts recorded in §7.4.2 |
| M4 | Proposed components | S04 `smart-recommendation` (not `ask-panel`); S10 `definitions-table` + `rule-card` (not `soft-gate`); S15 no `agent-plan`; S16 `prompt-library`; S23 `soft-gate` | v0.1 placeholders | Design's picks adopted in the table |
| M5 | Extra frames F01–F07, G14–G17 | no S-id | not screens of this product | **Closed v0.1.4.** F01 needs no new requirement (per Design Desk, relayed by Grok Bot, 19 Nov 2026): its basis is REQ-FIN-010 (percentage-of-completion revenue), 011 (billing with retention and advance recovery), 012 (under/over billing) and 013 (project cash with peak negative month); F01 is now the seventh showcase in REQ-FIN-027. F02–F07 = the other six (F04–F07 not drawn yet). G14–G17 are GAP sheets. No S-ids given |
| M6 | yravgUI catalogue size | 144 | 179 (llms.txt, §15) | **Closed v0.1.4.** Both are right (per Design Desk, relayed by Grok Bot, 19 Nov 2026): 179 is every unique entry (117 components, 12 blocks, 15 screens, 3 patterns, 8 motion, 24 illustrations); 144 counts only the components, blocks and screens that can stand behind a UI element |
| M7 | Solvarium accent | teal `#0A7473` (rebrand note `#0ea5a4`) | audit: navy in places (§12 A9) | Q-28 |
| M8 | Engineering GAP set | PS-CMP-46 says GAP-18…27; GAPS.md says 18…25 and 27 (26 closed) | GAP-18…27 from the pack | GAPS.md reading used |
| M9 | D-FIN refocus status | brief says approved (Q-DD-04) | v0.1.2 said pending | fixed in S10 |

### 7.5 Baseline: criteria, traceability, verification (R-VER)

Parity-plus with BrainGrid (AC in Spec, FR-BG-007; AI review against AC on a PR, FR-BG-012) and Taskmaster (`testStrategy`, FR-TM-012; TDD autopilot with commits tied to the task, FR-TM-013). The part still open is the visible chain and a "done" that requires a test run in the user's repo [CMP §4.2].

Ticket fields: `id` (`T-014`), `title`, `requirements` (`REQ-PC-003`…), `component` (yravg slug or GAP), `blockers` (`T-010`), `criteria` (`AC-014-1…n`), `prompt` (copyable, like NPA's "Salin prompt", FR-NPA-045), `status` (Belum mulai / Dikerjakan / Menunggu verifikasi / Lulus / Gagal).

Criterion fields: `id`; observable behaviour in given/when/then; `kind` (`unit`, `e2e`, `api`, `property`, `manual`); `test_ref` (tag such as `@AC-014-1` in a Playwright title or Vitest `describe`); `command` (e.g. `pnpm vitest -t "@AC-014-1"`); `required` (default true). `manual` criteria are counted separately and need a screenshot or note.

Chain: `Requirement (R) → Ticket (T) → Criterion (AC) → test in repo (@AC tag) → commit (trailer "Refs: T-014") → VerificationRun → ReviewRun`. Trailers: `Refs: T-014` and `Evidence: <run url>` (Enrico's decision D2 [/home/box/agent-data/workflows/yravg-trust-ladder/SKILL.md]).

| ID | Requirement |
|---|---|
| R-VER-1 | WHEN the ticket breakdown is proposed THE SYSTEM SHALL reject any ticket without at least one required criterion and one linked requirement. |
| R-VER-2 | WHEN a ticket starts (`studio start T-014`, CLI name TO CONFIRM) THE SYSTEM SHALL run each criterion's command at the starting commit and SHALL flag any criterion that already passes. |
| R-VER-3 | WHEN the user or agent runs `studio verify T-014` THE SYSTEM SHALL run each criterion's command locally, map results to criteria by `@AC` tag, read commits with `Refs: T-014`, and post results, durations, SHAs, exit codes and failure messages ≤ 2 KB. |
| R-VER-4 | THE SYSTEM SHALL not upload file contents or `.env` during verification (same privacy line as NPA's CLI, FR-NPA-052). |
| R-VER-5 | WHEN every required criterion passes in one run on a commit carrying `Refs: <ticket>` THE SYSTEM SHALL set the ticket to Lulus; IF any fails or has no tagged test THEN Gagal with reasons. |
| R-VER-6 | WHEN a verification run passes THE SYSTEM SHALL start an independent review: a reviewer agent in a fresh session, on a different model vendor where available, receives only the diff of the ticket's commit range and the criteria, and returns pass/fail per criterion with reasons. |
| R-VER-7 | WHERE the project has not opted in to sending diffs THE SYSTEM SHALL run the reviewer through the local CLI / MCP with the user's own model key, and SHALL send only the review verdict to the server (Q-20). |
| R-VER-8 | THE SYSTEM SHALL show a requirement as verified only if every linked required criterion passed in its latest run and the latest review did not fail it. |
| R-VER-9 | THE SYSTEM SHALL list drift: tagged tests not in the plan, and criteria with no test. |
| R-VER-10 | THE SYSTEM SHALL expose `get_ticket`, `next_ticket` (first unblocked, like FR-TM-010) and `verify_ticket` over MCP and CLI. |
| R-VER-11 | WHEN a post-build gap check runs THE SYSTEM SHALL show on S18 which evidence was examined and the outcome for each in-scope requirement (met, unmet, untested, or evidence missing), and SHALL show missing inputs before the findings; THE SYSTEM SHALL NOT treat missing evidence or an untested requirement as a pass or as “no gaps found”; THE SYSTEM SHALL, for unmet behaviour, offer only PROPOSED tickets that append work (reviewed on S08; appended to S15 only on accept), and SHALL NOT silently change accepted requirements, the plan, or code, and SHALL NOT mark a requirement verified (R-VER-8 still governs). |

Verification report blocks: header (ticket, result, run time, SHAs, trigger CLI/CI/MCP); criteria table (outcome pass / fail / missing / skipped / manual-pending, duration); starting-commit check result; failures (first message, test file and name, re-run command); independent review verdict per criterion; trace (linked requirements and whether each is now verified); drift; history; copyable `Evidence:` line. A GitHub Action template runs the same on push.

### 7.6 Agent surfaces (R-AGT)

| ID | Requirement |
|---|---|
| R-AGT-1 | THE SYSTEM SHALL run interview turns that write many blocks, depth expansion, reference capture, ticket breakdown, verification intake and independent review as background runs listed in Agent Inbox. |
| R-AGT-2 | WHILE a run is active THE SYSTEM SHALL show its steps (Agent Run) and accept a steering note that applies at the next step (Agent Steering). |
| R-AGT-3 | THE SYSTEM SHALL record each model and tool call with tokens and cost in IDR (Trace Waterfall). |
| R-AGT-4 | THE SYSTEM SHALL deliver every agent output as a Proposal. |
| R-AGT-5 | THE SYSTEM SHALL keep a fixed eval set for the in-app agent with a score ratchet that cannot drop (pyramid in-app agent rule [/home/box/agent-data/workflows/yravg-trust-ladder/SKILL.md "In-app agents"]). |

### 7.7 Kept requirements (S3)

#### 7.7.1 Poteto pyramid rules

Sources: `/home/box/agent-data/workflows/yravg-trust-ladder/SKILL.md`; worked example `/workspace/grab/nod/repos/yravgSolvarium/docs/POTETO-PYRAMID.md`. Order, cheapest and strongest first, human last: (1) codebase, (2) static analysis, (3) verification — formal, runtime, UI property-based, domain property tests, (4) prose — AGENTS.md, CLAUDE.md, rules, (5) human review of evidence. Six-step order: benchmark before → codebase → static gates → verification → prose → benchmark after.

| ID | Requirement |
|---|---|
| R-KEEP-1 | WHEN tickets are generated for a user's plan THE SYSTEM SHALL include, in order, prefactor / domain-core tickets, static-gate tickets (strict TypeScript, rule runner, CI), verification tickets (criteria, domain property tests, a UI property run where there is UI), prose tickets (AGENTS.md "Trust ladder", CLAUDE.md), and one evidence-review ticket. |
| R-KEEP-2 | WHEN tickets are generated THE SYSTEM SHALL include a benchmark-before ticket first and a benchmark-after ticket last. |
| R-KEEP-3 | THE SYSTEM SHALL itself be built under Enrico's decisions D1–D4: comment-count ratchet, `Evidence:` trailer, plain-Node rule runner, auto-merge only when every gate passes [same skill file]. |

| R-KEEP-7 | THE SYSTEM's verification and merge gate (for this product and in the gate tickets it generates) SHALL run without GitHub Actions: as a pre-deploy step on the VPS that refuses a ref without a green gate, or by hand with the same commands, and SHALL write the same `Evidence:` trailer either way. Hosted CI MAY be added when available but SHALL NOT be the only route. |

Historical basis for R-KEEP-7: the 17 Nov audit reported no merge gate in yravgbuilder/canvas-to-app and GitHub Actions billing failures. Those findings require recheck before engineering work; the audit reported proofs run by hand [`inputs/repo-audit-ARCHITECTURE-REFLECTION.md` §(c)]. Risk RK-01 (§12.4).

Vertical slices and the pyramid fit together: each slice ticket carries its own tests; the static-gate and prose tickets are cross-cutting and come in the order above.

#### 7.7.2 yravgbuilder plugin ("yrabuilder")

Defined by the repo audit (17 Nov 2026) [`inputs/repo-audit-ARCHITECTURE-REFLECTION.md` §(d), Drive 19i2faPpr_bh5ZcJJj9ofuIiSsfnum_Cf]; also read in `/workspace/repo-audit/clones/yra-skills/yravgbuilder/README.md` and `CHANGELOG.md`. "yrabuilder" appears only in bot profiles; every repo spells it `yravgbuilder`.

- **What:** plugin `yra-skills/yravgbuilder` v0.1.1 (8 Nov 2026), Enrico's house standard for building business apps without slop.
- **House stack:** Vite + React (plain JS/TS) on the yravg catalogue (B1 Clean); Rust only for heavy cores with a JS oracle (`engine-rs/`, WASM in a Worker, golden-equal to the JS); Node server for auth, DB and billing; Tauri 2 desktop.
- **How it runs:** `/yravgbuilder-mode` picks one of 10 playbooks (new app, build screen, feature delivery, canvas first, design review, Rust decision, Rust port, ship desktop, investigation, session pickup) and runs an 11-point QA gate (reuse, tokens only, every state, no invented data, no dead control, slop scan, rendered at 1440/1024/390 + keyboard + dark, failing-first test in CI, Rust golden-equal, changelog and how-to, report what was not run).
- **Output it expects from a spec:** PRD rows `AREA-NNN` with observable acceptance and status `missing | partial | done`, roadmap and handoff docs, commits ending `PRD: AREA-NNN`.
- **Known issue:** its core skill points at Windows `E:\` paths; off that machine they map to `yravg/yravgSolvarium` and `yravg/yravgUI`.

| ID | Requirement |
|---|---|
| R-KEEP-4 | WHEN the user exports a plan THE SYSTEM SHALL offer a yravgbuilder export: spec layers, tickets as `AREA-NNN` PRD rows with observable acceptance and status, criteria, DESIGN.md, tokens and component picks, so `/yravgbuilder-mode` can start a playbook from it; and SHALL accept ticket status back. Transport (file, MCP, CLI) is open (Q-10). |

#### 7.7.3 canvas-to-app

Defined by the repo audit [`inputs/repo-audit-ARCHITECTURE-REFLECTION.md` §(d) "canvas-to-app: what exists", Drive 19i2faPpr_bh5ZcJJj9ofuIiSsfnum_Cf]. **Source location pending Enrico.**

- **What:** a canvas-first plugin made of the skills `canvas-to-app`, `canvas-to-app-html` and `canvas-to-app-nohtml`, plus `scripts/lint_boards.mjs` and `render_boards.mjs`. It draws Before / After boards in the app's real chrome: Before is a real screenshot, After is drawn with the app's own tokens; one sample project runs across all boards; boards are linted and rendered before publishing.
- **Generator:** Clausarium's checked-in `tools/canvas-to-app/generate.py` (with `dom.py`, `scope_css.py`) turns `.dc.html` boards into React.
- **Where it lives:** in no GitHub repo, at any commit or branch, including `yra-skills`; the audit infers it is installed only under `~/.claude/plugins` on Enrico's machines. Two sessions already hit its absence. Enrico said it lives in `yra-skills`; the audit did not find it there, and Grok Bot confirmed it is not in `yra-skills` (17 Nov 2026).
- Also found: Enrico's CPA request "use canvas-to-app before implementation" and the CPA PRD rule that implementation waits for canvas approval [/workspace/research/yravgSolvarium/docs/plans/community-plugins-agent.prd.md §11].

| ID | Requirement |
|---|---|
| R-KEEP-5 | WHEN the Detailed layer is accepted THE SYSTEM SHALL add a Canvas step where the user-app screens are drawn and approved through a Proposal. |
| R-KEEP-6 | WHILE the Canvas step is not approved THE SYSTEM SHALL keep frontend implementation tickets locked; planning and test-design artifacts remain editable. Default tool: canvas-to-app (source location pending Enrico, Q-11); alternatives Cursor Canvas, DPAI handoff, Figma. |

### 7.8 Pricing, payment, and limits

#### 7.8.1 Commercial structure under revision

The v0.1.6 Free/Pro table, including Rp99,000/30 days, Rp990,000/year, 15 projects, 60 specs/month, and other numeric quotas, was an assumption. It is preserved in the archived baseline and is **not a current offer or implementation default**. Enrico asked for OpenDesign-inspired model and pricing design. §7.13 replaces that table with explicit model sources, allowance/cost visibility, and undecided commercial terms.

| Proposed access path | Billing source | Decision still needed |
|---|---|---|
| Free/manual or trial | Spekin trial allowance if any | Project/artifact limits, trial expiry, available generation models |
| Browser BYOK | Model provider bills the owner's key; any platform fee disclosed separately | Key custody, provider list, platform fee, access entitlements |
| Paid Hosted | Spekin plan allowance and transparent usage ledger | IDR price, credit conversion, concurrency, caps, renewal and refunds |
| Local agent | Owner's agent/provider billing | Deferred, not an active browser-MVP connection |
| Shared workspace | Proposed shared credits with owner-controlled caps | Team roles, seats versus workspace terms, concurrency, later release |

Prices and limits are configuration with versioned effective dates. A pricing card must show interval, currency, included model allowance, eligible capabilities, overage policy, expiry, and cancellation terms. It must not advertise unlimited AI. Required safety checks, a user's accepted documents, and cost/error visibility must not disappear behind an upgrade dialog. No checkout goes live until commercial terms and provider costs are approved.

#### 7.8.2 Payment requirements retained with explicit status

IDR/QRIS via Midtrans remains the previously specified local payment direction. The following IDs remain traceable. They are conditional requirements for the later paid launch, not proof of an implemented checkout. Thirty-day pass duration and reminders are legacy assumptions to reconcile with Q-04 before build.

| ID | Requirement |
|---|---|
| R-PAY-1 | WHEN the user picks an approved paid plan THE SYSTEM SHALL create an order and a Midtrans Snap token with QRIS enabled. Other methods remain Q-05. |
| R-PAY-2 | WHEN a Midtrans notification arrives THE SYSTEM SHALL check signature_key = SHA-512(order_id + status_code + gross_amount + server key) and re-query the transaction status from Midtrans before acting. |
| R-PAY-3 | IF the signature is invalid THE SYSTEM SHALL reject and log the notification and leave entitlement unchanged. |
| R-PAY-4 | WHEN settlement is verified THE SYSTEM SHALL activate the purchased entitlement once per order_id using the versioned offer's duration and allowance. The previous 30-day value is not hard-coded. |
| R-PAY-5 | WHEN the status is expire, cancel, or deny THE SYSTEM SHALL leave entitlement unchanged. |
| R-PAY-6 | THE SYSTEM SHALL apply the owner-approved renewal/expiry notice policy. The previous three-day reminder and no-auto-renew pass remain unapproved defaults, not a launch promise. |
| R-PAY-7 | WHEN an approved plan limit is reached THE SYSTEM SHALL stop the affected action, name the limit, show remaining allowance/pending charges, and preserve existing artifacts. |

Paddle, production keys, live payment, automatic top-up, and automatic renewal are outside this documentation task. Spekin never borrows OpenDesign's model credits or resells an owner's local-agent subscription.

### 7.9 Language (R-LANG)

| ID | Requirement |
|---|---|
| R-LANG-1 | THE SYSTEM SHALL keep UI strings in `id` and `en` message files, default `id`, with a switch in header and settings. |
| R-LANG-2 | THE SYSTEM SHALL write the spec in the language of the idea text unless the user picks otherwise. |
| R-LANG-3 | THE SYSTEM SHALL keep domain terms in the English form Indonesian practice uses (transmittal, WBS, CPM, IFC, EAC) and list them in the glossary with a Bahasa gloss. |
| R-LANG-4 | THE SYSTEM SHALL serve Terms and Privacy in Bahasa at launch (CodeGuide and NPA 404 these, FR-CG-012 [NPA:GAPS.md]). |

---


### 7.10 Included frame workspace (S12; approved eight-screen flow, S13)

Included in this same product on 22 Nov 2026 (S12), from the Paraframe-inspired grab pack (`/workspace/grab/UzwV9bPlAgA/`; Drive `184Chcy8LjWAxxu0TXgQuNU2qVnqTtoC2`). On 22 Nov 2026, ~11:00 Asia/Shanghai (S13), Enrico approved the eight-screen browser-first flow (BW-01–BW-08) in Drive `1ni_DhB6mIYthUK0adgQ9Q0jkxrSZ9Hn6` and asked Design Desk to draw the wireframes. That document is the approved screen flow for this workspace, not merely a proposal. This approval is screen flow and wireframes only: it does not authorize implementation, and it does not lift deferred local-project integration. Design Desk owns the wireframes (offline editable + PDF, because of the room sign-in restriction); this spec does not duplicate those drawings. Editable offline wireframes and the 17-page PDF were delivered on 22 Nov 2026. They remain the prior eight-screen baseline and need the v0.2.0 shell revision. This is not a separate app. Browser-first and deferred local-project integration apply to **this workspace**; they do not approve §12 architecture, the product name, a domain, or hosting.

The approved frame-workspace slice loop is: import an entitled reference image, inspect its style, request alternatives, compare revisions, review changes, accept a baseline, and download a coding handoff. Supporting parity for all 62 reference FRs and 27 ATs is in `FRAME-WORKSPACE-PARITY.md` (not a separate PRD). Evidence classes (observed / official / narrated / proposed) and the pack's UNKNOWN items (capture-mode completeness; live MCP) are preserved. Do not adopt the reference product's brand, assets, wording, or code.

S21 remains the canvas-to-app step (GAP-29). S25 remains export of the spec / zip / yravgbuilder. Accepted workspace frames may later be handed to those screens; they do not replace them. URL or recording capture **into the living spec** remains R-REF (S5 lead a). In-app browsing and page/viewport/part capture, including local-development URLs (reference FR-04), stay deferred. Local Claude Code / the user's Anthropic account (FR-48, AT-26) and optional Labs (FR-49) are not adopted. Workspace palette defaults in the approved screen-flow document do not resolve Q-28.

Open Design method folds for repo UI inventory live in R-DS-7 and R-DS-8, not as a dependency on that product.

| ID | Requirement |
|---|---|
| R-WS-1 | THE SYSTEM SHALL include the browser-first frame workspace in this same product, as project-scoped boards and frames, and SHALL not treat it as a separate application. |
| R-WS-2 | WHEN the user imports a reference in this workspace slice THE SYSTEM SHALL accept only user-selected PNG, JPEG, or WebP files the user is entitled to use, and SHALL NOT read the user's screen or filesystem without that file selection; cancelling an upload SHALL send no generation job, and a retried interrupted upload SHALL not duplicate a completed reference. |
| R-WS-3 | IN the browser workspace slice THE SYSTEM SHALL NOT present local-site capture, localhost/local-project browsing, local-agent execution, live MCP, collaboration/share-and-comment, separate frame-workspace billing, or expiring share links as working controls. Model and usage controls SHALL use the project-wide service in §7.13, with paid features gated until commercial approval. |
| R-WS-4 | THE SYSTEM SHALL show imported and accepted frames on a project board / canvas (S29), with zoom that changes frame presentation rather than UI font size; WHERE the viewport is below 768 px THE SYSTEM SHALL offer a frame list and single-frame viewer with review and handoff still available, and SHALL make free-position canvas editing unavailable. |
| R-WS-5 | THE SYSTEM SHALL offer a learned-style review of imported or accepted frames (visual and markdown views) on S30; THE SYSTEM SHALL not replace a confirmed token or accepted style with a newly inferred one without acceptance. |
| R-WS-6 | WHEN the user requests alternatives or a new frame THE SYSTEM SHALL keep the accepted baseline unchanged, including on partial failure or cancellation; THE SYSTEM SHALL list the exact input frame and style revisions in the job context and SHALL not silently include the whole board. |
| R-WS-7 | THE SYSTEM SHALL provide targeted change and change-approval / nitpick review (S32, S33) in which a stale review item cannot be accepted without re-evaluation, dismissal remains available, and whole-frame comparison reveals related changes outside a selected region. |
| R-WS-8 | WHEN the user prepares a coding handoff THE SYSTEM SHALL provide a download (S34) that includes only the selected accepted revisions, excludes pending alternatives, and SHALL NOT change that bundle's revision manifest if the frame is later edited; THE SYSTEM SHALL not treat the handoff as an execution command. |
| R-WS-9 | THE SYSTEM SHALL NOT copy the reference product's protected brand, assets, copy, or unlicensed source. Compatible licensed code reuse SHALL follow R-REU. A named third-party model vendor, local Claude Code, or the user's Anthropic account SHALL NOT be a hard dependency of this workspace. |
| R-WS-10 | THE SYSTEM SHALL keep living-spec start-from-site-or-recording on the existing R-REF path; in-app browse or capture of sites, including local-development URLs, remains deferred for this workspace. |
| R-WS-11 | THE SYSTEM SHALL allow accepted workspace frames to be handed later to existing S21 (canvas-to-app) or S25 (export) flows, and SHALL not replace those screens with the workspace canvas or handoff. |
| R-WS-12 | THE SYSTEM SHALL treat reference capture-mode completeness and live MCP use as UNKNOWN and SHALL not claim them as capabilities of this workspace slice. |

### 7.11 Project shell and workflow header

The shell has three separate navigation levels. They must not be interchangeable.

| Level | Content | Behavior |
|---|---|---|
| Project context | Spekin / project name, selected feature increment, accepted spec revision, save state, account and access | Remains visible across stages. Switching projects restores only that project's saved state. |
| Workflow header | Planning, Specification, Design, Frontend, Backend, Integration, Testing, Deployment | Describes delivery stage, readiness, blockers, and evidence. Each item has a text status and a count where useful. |
| Artifact tabs | Named spec sections, DESIGN.md, token set, board, frame, reference, task, contract, report, or handoff | Opens multiple artifacts inside the current project. A tab is an artifact view, not a workflow stage or model selection. |

The center supports **Canvas, Preview, Document, and Compare** where the selected artifact supports that view. Code is a read-only delivered artifact view initially, not an in-browser IDE promise. The left panel contains project artifacts and frame navigation. The right panel contains the selected frame, requirement links, behavior contract, revisions, and evidence. A resizable conversation panel carries an explicit context list and a model-source picker. Panels can collapse without resetting the board. An Agent Inbox shows jobs and approvals without covering the active work.

This layout adapts OpenDesign's documented artifact tabs and official Studio screenshot. That screenshot shows a conversation panel, file tabs, Preview and Code controls, a device selector, and Export/Share controls. It does not prove runtime behavior or prove that OpenDesign lacks an infinite canvas. Spekin's infinite canvas is required regardless.

| ID | Requirement |
|---|---|
| R-WF-1 | THE SYSTEM SHALL render all eight workflow stages in the stated order in the persistent project header, with the current stage distinct from each stage's status. |
| R-WF-2 | THE SYSTEM SHALL allow read access to every stage without treating navigation as completion, unlocking code execution, creating a paid run, or changing an approved artifact. |
| R-WF-3 | THE SYSTEM SHALL store stage status as not started, in progress, needs review, blocked, or ready, and SHALL derive ready from the stage's required artifacts, approvals, and evidence. An owner exception SHALL record its reason and SHALL remain visibly different from verified readiness. |
| R-WF-4 | WHEN an accepted upstream artifact changes THE SYSTEM SHALL mark linked downstream artifacts, tasks, tests, and stage readiness as needs review. It SHALL preserve older accepted revisions and their evidence. |
| R-WF-5 | THE SYSTEM SHALL retain project, feature increment, accepted revision, open artifact tabs, active artifact, board position, zoom, selection, and panel arrangement across stage switches and a successful save/reload. State SHALL be scoped to project and user. |
| R-WF-6 | THE SYSTEM SHALL give every stage an artifact list, readiness summary, blockers, next proposed action, and links to the source requirements. Hiding a stage's details SHALL NOT hide blockers. |
| R-WF-7 | THE SYSTEM SHALL allow users to label vertical-slice tickets with multiple stages without replacing their dependency order with eight disconnected task backlogs. |
| R-WF-8 | THE SYSTEM SHALL provide keyboard navigation for the stage header and artifact tabs, visible focus, a non-color status label, and an overflow stage menu on narrow screens. The project and active stage SHALL remain identifiable. |

Stage contracts apply to the **user's product project**, not eight separate applications:

| Stage | Required artifacts | Ready condition | Execution boundary |
|---|---|---|---|
| Planning | Idea, users, problem, scope, project principles, assumptions, source manifest, chosen pack | Owner accepts the brief; unresolved constraints are named | Interview and draft generation only |
| Specification | Versioned requirements, acceptance criteria, entities, risks, dependency plan, glossary | Each in-scope requirement has an owner/basis and testable criterion; change Proposal accepted | No silent requirement regeneration |
| Design | DESIGN.md, tokens, flows, screen/frame alternatives, behavior contracts, accepted frame revisions | Required screens and key states accepted; unresolved GAP components listed | Editable sandboxed prototype, not production app |
| Frontend | Screen/component mapping, state/data contracts, implementation tickets, accepted design handoff | UI slice has expected-state evidence or explicit untested status; required design approval precedes implementation handoff | MVP exports tickets/handoff; external agent performs code work |
| Backend | Entities, schema proposals, API/auth contracts, data migrations, rollback notes, service tickets | Required API and permission criteria have evidence for the pinned build | No automatic database writes or migrations |
| Integration | Contract mapping, environment/config checklist, provider permissions, fixture or sandbox results | Required integrations tested with permitted fixtures/sandbox; secret names only | No credential capture in chat; no automatic provider setup |
| Testing | Requirement-to-test matrix, build/environment manifest, results, independent review, gap report | Required criteria pass on the pinned revision/build; no missing evidence counted as pass | Imports and reviews evidence in browser; local runner deferred |
| Deployment | Release manifest, readiness report, environment plan, approval, rollback and smoke results | Approved release and required evidence present; readiness and actual deployment are separate | MVP records proposed release and supplied evidence; does not deploy |

### 7.12 Infinite canvas and artifact continuity

The existing Studio canvas is owner-reported, not audited in this task. The revamp must preserve usable existing boards before adding features. S29 becomes the shared project board view inside the shell. S21 remains the approval milestone for user-app designs. S34 remains the design handoff; S25 remains the whole-spec export. They share artifacts and IDs rather than maintaining duplicate documents.

| ID | Requirement |
|---|---|
| R-CAN-1 | THE SYSTEM SHALL keep a desktop infinite canvas with pan, zoom, fit-to-selection, named boards, frame grouping, and spatial alternatives. Zoom SHALL transform board content, not shrink application chrome. |
| R-CAN-2 | THE SYSTEM SHALL distinguish imported reference images, editable prototype frames, document cards, and evidence attachments. It SHALL NOT claim an imported screenshot is an editable source tree or working application. |
| R-CAN-3 | THE SYSTEM SHALL link a board node to stable project/artifact IDs and a specific revision. Opening the same frame in a tab and on the canvas SHALL refer to the same artifact, with draft and accepted states clearly distinct. |
| R-CAN-4 | WHEN a user requests AI changes THE SYSTEM SHALL list selected frames, reference revisions, design-system revision, requirements, and target region before submission. It SHALL NOT send the whole board or hidden artifacts by default. |
| R-CAN-5 | THE SYSTEM SHALL support alternatives and targeted edits as drafts with Undo, redo, dismiss, whole-frame comparison, and explicit acceptance. Applying to multiple frames SHALL show each target and require a separate reviewed change set. |
| R-CAN-6 | THE SYSTEM SHALL save board layout and artifact edits with visible pending, saved, failed, and conflict states. A failed save SHALL preserve the local draft for recovery and SHALL NOT claim a successful server save. Conflicting revisions SHALL not silently overwrite each other. |
| R-CAN-7 | THE SYSTEM SHALL give every editable screen a behavior contract for keyboard, focus entry/return, Escape, selection, drag/drop, validation, loading, empty, error, cancellation, and responsive states. Unsupported interactions SHALL be named as gaps. |
| R-CAN-8 | BELOW 768 px THE SYSTEM SHALL use a frame list and single-frame viewer with review and handoff. It SHALL NOT require free-position canvas editing on a phone. Canvas operations SHALL have non-drag alternatives. |
| R-CAN-9 | BEFORE changing the existing Studio storage contract THE SYSTEM SHALL define a reversible board migration, preserve stable IDs and revision links, and prove old-board reopen/export on fixtures. This requirement does not authorize a migration now. |

Direct visual editing means edits to Spekin's prototype representation. Onlook's real-code editing and codebase synchronization remain future research, not an MVP promise. Design/Interact modes must separate selection from running prototype controls. Preview HTML must run in an isolated frame with restricted navigation and network access. An AI success response never substitutes for checking the resulting value or state.

### 7.13 Models, routing, and cost accounting

OpenDesign documents three model sources. Local CLI uses an already installed/signed-in agent. BYOK uses provider keys and provider billing. Hosted models use Cloud credits. Its pricing FAQ documents shared workspace pools and concurrency, owner-controlled spending, separate allowance rules, and credit reset/top-up behavior. These are reference facts, not Spekin commercial terms.

Spekin's proposed model-source selector has **Hosted** and **BYOK** browser paths. **Local agent** is a visibly deferred capability without a connect button that appears to work. The model picker is separate from artifact tabs and workflow stages. It shows provider, model/version, capabilities, context limit, billing source, current availability, and routing policy. A project default can be overridden per job. The chosen design-system and artifact context remain unchanged by a model switch.

| ID | Requirement |
|---|---|
| R-MOD-1 | THE SYSTEM SHALL separate Hosted, BYOK, and deferred Local agent sources. It SHALL display who bills usage and SHALL NOT describe BYOK as free model inference. |
| R-MOD-2 | THE SYSTEM SHALL keep a versioned model registry with provider, exact model identifier, text/vision/code/structured-output capabilities, input/output limits, region/retention disclosures where known, availability, rate-card version, and eligible plan/source. Unknown fields SHALL be labelled unknown. |
| R-MOD-3 | BEFORE a model run THE SYSTEM SHALL validate the requested capabilities and context limits, display the selected model or routing policy, and show the exact artifact context plus estimated cost range or an explicit unavailable estimate. A paid hosted run SHALL require a usable rate card and budget authorization. |
| R-MOD-4 | THE SYSTEM SHALL allow task-specific routing for interview/spec drafting, vision/reference analysis, visual alternatives, implementation handoff, and independent review. Routing defaults and any provider substitutions SHALL be project-visible. A fallback to a different provider or higher cost SHALL require prior policy permission or explicit approval. |
| R-MOD-5 | THE SYSTEM SHALL distinguish a fixed model selection from Auto routing. It SHALL show the actual provider/model used in every run, including fallback reason. Unavailable or incompatible models SHALL disable submission with an explanation. |
| R-MOD-6 | THE SYSTEM SHALL record a run ID, idempotency key, workspace/project, actor, stage/task, input artifact revisions, source, model, rate-card version, usage units, provider charge where returned, user credit charge, currency, exchange-rate snapshot, estimate, and final settlement state. Provider cost and user price SHALL be separate fields. |
| R-MOD-7 | THE SYSTEM SHALL reserve a maximum authorized hosted charge atomically before work, enforce project/workspace limits and concurrency, and reconcile actual cost after completion. It SHALL NOT accept a new job if concurrent reservations would exceed a hard cap. |
| R-MOD-8 | WHEN a job is cancelled or fails THE SYSTEM SHALL release unused reservations and show any already-consumed provider usage separately. Duplicate callbacks or retries SHALL not duplicate charges or artifacts. Unknown final provider cost SHALL remain pending reconciliation, not become zero. |
| R-MOD-9 | THE SYSTEM SHALL meter BYOK provider usage separately from hosted credits. Any Spekin platform fee SHALL be disclosed before the run. It SHALL provide revocation and a connection test without exposing the key to project members, prompts, previews, exports, or logs. |
| R-MOD-10 | THE SYSTEM SHALL show estimates, reservations, actuals, remaining allowance, cap, pending charges, and failed-run adjustments in project usage and S26. It SHALL warn before a limit and stop at a hard cap. Automatic top-up SHALL be off and unavailable until separately approved. |
| R-MOD-11 | THE SYSTEM SHALL offer an independent reviewer using a different vendor where permitted and available. It SHALL disclose any same-vendor fallback and SHALL NOT claim independent review when only the original generation result exists. |

Commercial route proposal, not a launch commitment: free/manual workspace access or a small trial allowance; browser BYOK; paid Hosted tiers based on model allowance and job concurrency. Team pooling is target scope after owner/viewer permissions and a budget ledger are proven. Exact free entitlements, tier names, IDR prices, credit conversion, margin, expiry, top-up, refund, renewal, seat/workspace billing, and tax rules remain Q-03/Q-04/Q-32. No vendor subscription is bundled or transferred.

OpenDesign source disagreement matters: its homepage describes Plus/Pro/Max and per-seat Team plans; the current pricing FAQ describes Go-family workspace subscriptions, unlimited members, and shared concurrency. The fetched pricing page and README also show different promotion amounts. Therefore this PRD uses the verified **separation of model sources and visible allowance accounting**, not any single supposedly settled vendor price or seat rule. See REFERENCE-MATRIX-v0.2.2.md for the exact evidence limits.

### 7.14 Revision-pinned delivery and evidence

| ID | Requirement |
|---|---|
| R-EVD-1 | THE SYSTEM SHALL pin each handoff, review, test run, gap report, and release record to accepted spec revision, requirement revisions, frame/design-system revisions, build commit or immutable build identifier, environment, and tool/version where available. Missing build identity SHALL block verified readiness. |
| R-EVD-2 | THE SYSTEM SHALL report each required criterion as passed, failed, untested, or evidence missing. Passed SHALL require the expected postcondition and evidence, not only an HTTP success, tool ok flag, generated test file, or agent completion message. |
| R-EVD-3 | WHEN a sequence partly succeeds THE SYSTEM SHALL list applied, failed, skipped, and unknown steps, and SHALL NOT claim rollback without evidence. Acceptance of a design change and verification of a build SHALL be separate records. |
| R-EVD-4 | THE SYSTEM SHALL generate an immutable handoff manifest containing selected accepted artifacts, linked requirements/tasks/criteria, exact revisions, exclusions, hashes, open questions, and permitted evidence. A later edit SHALL create a new manifest rather than mutate an exported handoff. |
| R-EVD-5 | THE SYSTEM SHALL keep post-build gaps as proposed follow-up tickets linked to requirement and evidence. Only acceptance on S08 SHALL publish them to S15. The gap checker SHALL NOT rewrite requirements, mark missing tests as passed, or run a deployment. |
| R-EVD-6 | THE SYSTEM SHALL support a repeatable add-feature increment within the same project. It SHALL show impacts on stage readiness, frames, contracts, tasks, and tests before acceptance, while preserving unaffected accepted artifacts. |

Existing R-VER-1–11 and R-PRI/R-EDT remain the baseline. In the report labels, met maps to passed and unmet maps to failed; untested and evidence missing remain separate non-pass states. The browser MVP can import evidence and identify gaps. Local `studio start/verify`, local reviewer execution, live workspace MCP, code mutation, and remote deployment automation remain deferred. Manual evidence and supplied agent reports must be labelled by origin and trust; an untrusted report is not an independently executed test.

### 7.15 Roles, data boundaries, and failure states

| ID | Requirement |
|---|---|
| R-SEC-1 | THE SYSTEM SHALL enforce project ownership and role permissions on the server for every artifact, job, approval, export, budget, and provider configuration. MVP roles are owner and viewer. A viewer SHALL NOT mutate, spend, accept, or disclose private artifacts through a guessed identifier. Expanded editor/admin roles are later scope. |
| R-SEC-2 | THE SYSTEM SHALL keep keys in an encrypted server-side secret store or an approved provider connection. It SHALL redact secrets from errors, telemetry, AI context, browser storage, and downloads. The browser SHALL receive masked metadata, never the stored key. Custom BYOK endpoints require allowlisting/SSRF controls. |
| R-SEC-3 | THE SYSTEM SHALL sandbox executable prototype content, restrict navigation/network by policy, and prevent preview content from reading parent cookies, project secrets, privileged APIs, or other projects. Imported code and reference text SHALL be untrusted data, not agent instructions. |
| R-SEC-4 | THE SYSTEM SHALL keep references and exports private by default, retain source rights/provenance, and disclose provider/context transfer before generation. Sharing, publishing, connector writes, repository operations, and deployment SHALL require a separate authorized action and defined scope. |
| R-SEC-5 | THE SYSTEM SHALL log actor, action, target revision, decision, time, and outcome for acceptance, permissions, budget changes, provider changes, export, and evidence submission. Retention and deletion requests SHALL cover originals, derived artifacts, and backups under a published policy. |
| R-SEC-6 | THE SYSTEM SHALL show recoverable states for offline work, expired session, upload failure, rate limit, model outage, cancelled job, save conflict, exhausted allowance, denied permission, and missing evidence without losing the last accepted revision. |

Storage and privacy ceilings, upload sizes, backup retention, p95 latency, initial load, and maximum active board frames are implementation decisions to benchmark in SPK-T-01. The first engineering pass must set numeric budgets from the existing Studio baseline, then test 1440×900, 1024×768, and 390×844. No unmeasured performance claim is a shipped guarantee. The UI uses Inter, JetBrains Mono for numeric identifiers, canvas #FAF9F5, and working clay #B4532A. Accent remains Q-28. No gradients or glass panels. Reduced motion must stop decorative loops.

### 7.16 Screen and artifact reconciliation

No existing S-ID is renumbered. Existing S01–S26 remain the living-spec screens. S27–S34 remain the approved BW-01–BW-08 flow. The new project shell wraps these screens; the eight workflow stages are **not** replacements for the eight browser screens.

| New screen ID | Role | Reuses / links |
|---|---|---|
| S35 Project workflow shell | Persistent context, header, artifact tabs, stage inspector | All S01–S34; S26 readiness/usage summary |
| S36 Model and usage panel | Source/model selection, context estimate, cap/ledger, errors | Existing billing/settings/usage and Agent Run; R-AGT-3 |
| S37 Build contracts and release readiness | Stage-specific frontend/backend/integration artifacts, pinned release checklist | S15 tasks, S18 evidence, S25 export; no deployment executor |

S07 holds principles and the layered spec. S08 remains the only review/acceptance route for canonical changes. S29 is the shared canvas. S30–S33 handle style, alternatives, targeted edits, and approval. S18 verifies evidence against the exact approved revision. S26 is proposed as Spekin build/credit control, not the user's project-control schedule/cost dashboard. Confirm its scope in Q-29.

## 8. Domain packs

A pack is a versioned set of requirements, entities, criteria, tickets, component picks, interview questions and domain rules that seeds the spec document (as a Proposal) when the user picks the domain. Packs contain no code. The old "starter packs" differentiator now lives here: the project-control content is D-PC, and engineering is D-ENG. Packs are written in Bahasa with local practice (IDR, Indonesian national holiday calendars, bilingual labels); pack requirements are seeded into the user's behaviour spec in EARS form.

### 8.1 D-DASH Dashboard

Method source: `/workspace/gusbavia/PATTERNS.md`, 24 numbered methods written in our words. Methods only: no copying of Gus Bavia's pixels, 3D assets, themes, colour tokens, DAX, HTML or copy (that file's header rule). `GB-nn` below = heading number nn in that file.

| Requirement | Method |
|---|---|
| REQ-DASH-001 List the questions before drawing; name measure groups after the questions | GB-06 The model answers the wireframe; folders are questions, not subject areas |
| REQ-DASH-002 A first screen per audience (owner, planner, cost lead…) | GB-01 The first screen matches the audience |
| REQ-DASH-003 One period control drives every visual on the page | GB-04 One period control drives the picture, the cards and the charts |
| REQ-DASH-004 Variance shown as a named bridge, not one tile | GB-02 Every gap has a name — show variance as a bridge |
| REQ-DASH-005 Click the object (asset, cost code, package) to drill in | GB-07 Click the asset or the cost code, not a filter |
| REQ-DASH-006 "Good direction" defined per measure, inverted metrics handled; totals reconcile on screen | GB-09 Honour inverted metrics, and make the numbers close |
| REQ-DASH-007 Exceptions shown in-page; one-time three-step "how to read" overlay | GB-08 Stay in flow: in-page alerts, and a short tutorial on the page |
| REQ-DASH-008 Tokens set once and inherited by every visual | GB-05 Lock the design tokens once, then inherit them everywhere |
| REQ-DASH-009 Still by default; motion only for a threshold breach or a selection | GB-10 Motion and decoration have to earn the slot |
| REQ-DASH-010 Risk attached to the activity or cost code it affects | GB-11 Tie risk to the activity, not to a generic banner |
| REQ-DASH-011 Native charts first; a custom visual only where it adds a decision; keep a native-only tier | GB-12, GB-17 |
| REQ-DASH-012 One shell reused across datasets | GB-13 Same structure, different job |
| REQ-DASH-013 Optional scroll briefing for monthly packs | GB-14 A briefing can beat a dashboard, for some readers |
| REQ-DASH-014 Design the questions, model and tokens before the front-end tool | GB-15 Design above the tool |
| REQ-DASH-015 Cognitive review pass per screen before release | GB-16 Run a cognitive pass on every screen |
| REQ-DASH-016 Health score: normalise each dimension, then compose; show strongest and weakest | GB-19 Normalise first, then compose a health score |
| REQ-DASH-017 Executive pack (PDF/PPTX) generated from the same model | GB-22 Automate the executive pack from the pipeline |
| REQ-DASH-018 Hand over a kit: brief, tokens, sample data, how-to-read, README | GB-23 Hand over a kit, not only a file |
| REQ-DASH-019 Success = time to find the issue and act, not time on page | GB-24 Judge the screen as a task tool |
| REQ-DASH-020 THE SYSTEM SHALL ship every dashboard spec with a sample dataset that tells one realistic story (e.g. a project 4% behind with one cost code overrunning), not random numbers, and each "how to read" overlay SHALL point at that story. Proposed by Template Desk | GB-08 (overlay), GB-23 (kit) |
| REQ-DASH-021 WHEN the viewer chooses "Ekspor" on a page THE SYSTEM SHALL export that page's underlying table to Excel (.xlsx) or Google Sheets, with the same filters and period as the page. Proposed by Template Desk | GB-09 (numbers close), GB-24 (task tool) |
| REQ-DASH-022 THE SYSTEM SHALL offer a stock-watch showcase built on the D-FIN stock module (REQ-FIN-020…029), with the module's guardrails REQ-FIN-028 and 029 applied unchanged: pages for market overview, single-stock deep dive, dividend tracker and sector heatmap, each answering one stated question, with source and as-of date on every tile; it SHALL run on bundled sample data until a licensed feed is confirmed. Proposed by Template Desk | GB-06 (one question per page), GB-23 (kit) |

GB-03 (progress on the object), GB-18 (model ↔ progress join by stable ids), GB-20 (rehearse the bad day on the asset) and GB-21 (margin risk on one screen) are offered when the idea involves physical assets or margin; they cross-link to D-ENG, D-PC and D-FIN.

Pack ACs: AC-DASH-1 changing the period control updates every KPI and chart on the page in one render; AC-DASH-2 every KPI in the spec has a "good direction" field; AC-DASH-3 every variance view lists named steps that sum to the total shown. AC-DASH-4 the sample dataset has a written one-paragraph story and every overlay step references a value from it (REQ-DASH-020); AC-DASH-5 the exported sheet's totals equal the page totals for the same filters and period (REQ-DASH-021); AC-DASH-6 with no licensed feed configured, every stock-watch tile shows the sample-data label, a source and an as-of date (REQ-DASH-022).

Export gating in the generated dashboard spec (ASSUMPTION — the builder decides for their own app): the pack seeds a default row in the user's Free vs Paid table — Free: CSV of the current page; Paid: .xlsx and Google Sheets for every page. In this product's own limits (§7.8.1), REQ-DASH-020 is part of the Free core pack and REQ-DASH-021 is part of the full pack on Pro (ASSUMPTION, Product Desk).

Components: `blocks/kpi-board`, `components/kpi-tiles`, `components/line-chart`, `components/breakdown-chart`, `components/date-range-picker`, `blocks/metrics-dashboard`; bridge = GAP-17.

### 8.2 D-ENG Engineering (CAD/BIM) — Engineering pack v0.1

**Owner: CAD/BIM Desk.** Merged in v0.1.2 from CAD/BIM Desk's Engineering pack v0.1 (2026-11-17), Drive file 1-61R50ye1BKIiDxcs002TrEvoOXSew1J, box copy `inputs/engineering-pack-prd-v0.1.md`. All requirement, test, ticket, ADR, spike and performance IDs are CAD/BIM Desk's and are kept unchanged. Replaces the v0.1 placeholder "Owner: CAD/BIM Desk — pending".

**Where the rest lives.** This section holds the pack's scope, hard rules, the 66 EARS requirements, the acceptance index (requirement → ticket → test) and the performance tests. The full pack — scoping interview and starter PRD (Simple), data model, component specs, file formats, implementation plan, spikes, the 36 thin-slice tickets with the 81 failing-first tests in Given/When/Then, and the 7 ADRs (Expert), source notes and the pack's own open questions — is the companion file [ENGINEERING-PACK-v0.1.md](ENGINEERING-PACK-v0.1.md) in the same folder (Drive: https://drive.google.com/file/d/1HFJzDSscZlQ0eqJRBD8LcA_TCKWxq_fi/view). The companion is the pack verbatim plus a header; if requirement text differs, this section wins and the change is logged in CHANGELOG-PRD.md.

**Pack ID spaces (from its merge note).** FR-ENG-VWR/QTO/4D5D-### (requirements), ENG-T-## (tickets), T-<module>-###-n (tests, e.g. T-VWR-001-1), ENG-ADR-### (decisions), ENG-SP-# (spikes), ENG-PERF-# (performance). Pack references "Q1…Q17" mean the pack's own questions (read as ENG-Q1…ENG-Q17 in this document), "L1…L11" its licence rules, and "S0…S6" its build stages (read as ENG stage S0…S6; not the §0 decisions S1…S10 or the S01…S26 screens). The ID check is in §8.2.7.

Modules: A. IFC model viewer (FR-ENG-VWR), B. Quantity takeoff (FR-ENG-QTO), C. 4D/5D linking (FR-ENG-4D5D). Users: planner, QS / cost engineer, BIM coordinator, project manager (U4).

#### 8.2.1 Hard rules (pack §3.2, licence check 2026-11-17)

| # | Rule |
|---|---|
| L1 | Paid, closed-source product. |
| L2 | v1 is IFC-first on That Open Engine: `web-ifc`, `@thatopen/fragments`, `@thatopen/components`, `@thatopen/components-front`; `@thatopen/ui` and `@thatopen/ui-obc` are optional (ENG-ADR-001). |
| L3 | **Licence split confirmed** (ENG-ADR-002). The That Open packages above are MIT: keep the copyright and licence notice with any redistributed file. Only `web-ifc` is MPL-2.0: the publish-changes duty applies to `web-ifc` files only. Any changed `web-ifc` file (including its WASM build sources) must be published under MPL-2.0. Our own code stays in our own files and stays closed. |
| L4 | Self-host and pin the `web-ifc` WASM and the Fragments worker; never load them from a public CDN in production (Grabber2 GAPS.md item 10). |
| L5 | xeokit is AGPL-3.0: reference only. No xeokit code, packages or copied snippets. |
| L6 | LibreDWG is GPL-3.0: do not use, not even as a server-side converter. |
| L7 | DWG is deferred to a later phase through the paid ODA SDK only (ENG-ADR-005). |
| L8 | Copy features and flows only. Never competitor code, UI text, brand names or logos. The zzTakeoff plugin sources on the box are marked "REFERENCE ONLY. Do not copy code into our products" (/workspace/zztakeoff/plugins-src/HOW-PLUGINS-ARE-BUILT.md). Bexel screenshots are internal reference only (/workspace/grab/bexel-intelligent-scheduling/PRD.md). |
| L9 | Bexel sample models and schedules, including Grabber2's TwoTowers working copies, are test fixtures only; they do not go into Drive or the product until redistribution is cleared (Q8). |
| L10 | CI runs a dependency licence scan that blocks AGPL, GPL and LGPL packages. |
| L11 | A human reviews the MIT notices and the MPL-2.0 obligations before ship (Grabber2 LICENCES.md, "Not legal advice"). |

#### 8.2.2 Boundary with D-PC (pack §3.4)

The document register, transmittals and MDR/VDRL belong to Template Desk's Project control pack. This pack does not build them. Where a sheet or an issue points to a controlled document it stores an external, read-only reference:

```text
DocRef { doc_no: string, rev: string, title?: string, register_id?: string }
```

If the register is not installed, the DocRef is stored as text and shown as "not linked". No Template Desk notes about either pack were found on the box; this boundary comes from the orchestrator.

In v0.1.2 terms: the register is D-PC §8.3.1 (REQ-PC-001…005) and transmittals §8.3.3. Schedule import overlaps D-PC §8.3.5 and the shared `Activity` entity (§9); one schedule store serves both packs (Q-25 also covers the generator).

EARS patterns used: **Ubiquitous** "The <system> shall <response>"; **Event** "When <trigger>, the <system> shall <response>"; **State** "While <state>, the <system> shall <response>"; **Unwanted** "If <unwanted condition>, then the <system> shall <response>"; **Optional** "Where <feature is included>, the <system> shall <response>". Every requirement keeps its FR-ENG id and phase. Its acceptance tests are written as failing-first tests in the ticket that implements it (companion §11; index in §8.2.8).

#### 8.2.3 Module A: IFC model viewer (FR-ENG-VWR)

User stories:

- VWR-US1. As a BIM coordinator, I load one or more IFC files and see them in 3D with a spatial tree, so I can check the model before takeoff.
- VWR-US2. As a QS, I click an element and read its property sets and quantity sets.
- VWR-US3. As a planner, I isolate, hide and colour elements by a property to check what a rule picked up.
- VWR-US4. As a BIM coordinator, I cut the model with sections and measure lengths and areas.
- VWR-US5. As a BIM coordinator or PM, I drop an issue pin with a viewpoint, status and assignee and exchange it as BCF.

| Id | Requirement | Phase | EARS | Statement |
|---|---|---|---|---|
| FR-ENG-VWR-001 | Load IFC in the browser | v1 | Ubiquitous | The viewer shall load `.ifc` files in IFC2X3 and IFC4 from local upload by parsing them with web-ifc, converting them to Fragments and displaying them in one World. |
|  |  |  | Event | When a file is uploaded, the viewer shall show load progress per file. |
|  |  |  | Unwanted | If a file is not IFC or fails to parse, then the viewer shall stop loading that file, show a named error, and leave no partial model in the scene. |
| FR-ENG-VWR-002 | Federate several models | v1 | Event | When several IFC or `.frag` files are loaded into one project, the viewer shall show them in one World with one tree root and one visibility toggle per model. |
| FR-ENG-VWR-003 | Convert once, reopen fast | v1 | Event | When an IFC file has been converted once, the viewer shall store the `.frag` output keyed by file hash. |
|  |  |  | Event | When a project is reopened, the viewer shall load stored `.frag` files and shall not re-parse the IFC. |
| FR-ENG-VWR-004 | Spatial and model tree | v1 | Ubiquitous | The viewer shall show a spatial tree (site, building, storey, space, element) and a second grouping by IFC class and type, with an element count per node. |
|  |  |  | Event | When a tree node is selected, the viewer shall highlight its elements in 3D; when an element is picked in 3D, the viewer shall expand and scroll the tree to it. |
| FR-ENG-VWR-005 | Pick and highlight | v1 | Event | When the user hovers, clicks, Ctrl-clicks or box-drags in 3D, the viewer shall pre-highlight, select, add to selection or box-select elements. |
| FR-ENG-VWR-006 | Properties panel | v1 | Event | When the selection changes, the viewer shall show GlobalId, IFC class, name, type, storey, materials, all property sets, all quantity sets (`Qto_*` and other `IfcElementQuantity`) and classification references of the selection, read from Fragments item data. |
|  |  |  | State | While more than one element is selected, the viewer shall show shared values once and mark differing values as "varies". |
|  |  |  | Unwanted | If the selected element has no quantity set, then the viewer shall say so and offer computed geometry values labelled "computed". |
| FR-ENG-VWR-007 | Ad-hoc sum of a property | v1 | Event | When the user picks "Sum over selection" on a numeric property, the viewer shall show the sum, the count of contributing elements and the unit. |
| FR-ENG-VWR-008 | Visibility: isolate, hide, show all, ghost | v1 | Event | When the user picks isolate, hide, show all or ghost others, the viewer shall apply it to the current selection through one shared visibility service (Hider). |
| FR-ENG-VWR-009 | Colour by property | v1 | Event | When the user picks a colour-by field (attribute, Pset value, storey, class, type, classification code, link status or 4D status), the viewer shall colour each element by its value and show a legend of value, colour and count, with "Not set" as its own row. |
| FR-ENG-VWR-010 | Selection sets (regular and rule-based) | v1 | Ubiquitous | The viewer shall save selection sets as a fixed list of GlobalIds (regular) or as a rule over attributes and Pset values (smart), in folders. |
|  |  |  | Event | When a model version changes, the viewer shall re-evaluate every smart set. |
|  |  |  | Event | When the user imports or exports sets, the viewer shall use a sheet with columns Folder, Name, Query. |
| FR-ENG-VWR-011 | Section planes and section box | v1 | Event | When the user adds a section plane or a section box, the viewer shall clip geometry on the outer side and let the user move, flip, resize, toggle and delete it. |
| FR-ENG-VWR-012 | Measurement | v1 | Event | When the user measures length or area (v1), or angle or volume (v2), the viewer shall snap to vertices, edges and faces and show the value in project units. |
| FR-ENG-VWR-013 | Clash pins | v1 | Event | When a BCF file with clash topics is imported, the viewer shall show one clash pin per topic at its referenced elements. |
|  |  |  | Optional | Where clash computation is enabled (v2), when the user runs a clash test between two selection sets with a tolerance, the viewer shall report overlaps larger than the tolerance with status New and their distance. |
|  |  |  | Event | When a clash test is re-run, the viewer shall set earlier New clashes to Active or Solved and mark only clashes with new elements as New. |
| FR-ENG-VWR-014 | Issue pins (BCF-style) | v1 | Event | When the user creates an issue from a point or a selection, the viewer shall store title, description, status, priority, assignee, due date, labels, element GlobalIds, camera, clipping planes, visibility, colouring and an optional snapshot as a BCF-style topic and viewpoint. |
|  |  |  | Event | When a user opens an issue pin, the viewer shall restore its camera, clipping planes, visibility and selection. |
| FR-ENG-VWR-015 | BCF import and export | v1 | Event | When the user exports or imports issues, the viewer shall write or read `.bcfzip` (BCF 2.1 and 3.0 are supported by BCFTopics). |
|  |  |  | Unwanted | If an issue has no viewpoint at export, then the viewer shall create one from the current view. |
| FR-ENG-VWR-016 | Link an issue to a controlled document | v1 | Optional | Where the Project control pack is installed, the viewer shall let an issue carry one or more DocRef (doc number and revision) chosen from its register. |
|  |  |  | Unwanted | If the register is not installed, then the viewer shall store the DocRef as text and mark it "not linked". |
| FR-ENG-VWR-017 | Copy element IDs | v1 | Event | When the user picks Copy IDs, the viewer shall copy the GlobalIds of the selection to the clipboard, one per line. |
| FR-ENG-VWR-018 | 2D plan views from the model | v2 | Event | When the user opens plan views, the viewer shall generate one floor plan per IfcBuildingStorey with Views and navigate it with PlanMode. |
| FR-ENG-VWR-019 | Model version compare | v2 | Event | When a new version of a model is loaded, the viewer shall match it to the previous version by GlobalId and list added, removed and changed elements. |
|  |  |  | Event | When elements are missing in the new version, the viewer shall apply the chosen policy: delete, keep, or keep and add to a selection set. |

Count: 19 requirements (v1 17, v2 2, later 0).

#### 8.2.4 Module B: Quantity takeoff (FR-ENG-QTO)

User stories:

- QTO-US1. As a QS, I generate a takeoff grouped by storey, class and type from the quantity sets, with computed geometry where they are missing, and I see which is which.
- QTO-US2. As a QS, I regroup by UniFormat or WBS and export to Excel/CSV.
- QTO-US3. As a QS with only PDF drawings, I count, measure lengths and areas after calibrating the scale (v2 by default; Q1).
- QTO-US4. As a cost engineer, I compare model and drawing quantities for the same item.

| Id | Requirement | Phase | EARS | Statement |
|---|---|---|---|---|
| FR-ENG-QTO-001 | Create a takeoff from model elements | v1 | Event | When the user creates a takeoff, the takeoff module shall take a name, a scope (all, model, storey, IFC class, selection set or current selection), ordered grouping rules and quantity columns, and generate a grouped tree. |
| FR-ENG-QTO-002 | Quantities from IFC quantity sets first | v1 | Ubiquitous | The takeoff module shall read quantities from `IfcElementQuantity` sets first, in a configurable key order per IFC class. |
| FR-ENG-QTO-003 | Computed geometry fallback | v1 | Unwanted | If a quantity-set value is missing, then the takeoff module shall compute it from geometry (bounding box, mesh volume, footprint, perimeter). |
|  |  |  | Ubiquitous | The takeoff module shall flag every value as `qto` or `geom` on screen and in exports. |
| FR-ENG-QTO-004 | Units | v1 | Ubiquitous | The takeoff module shall store quantities in SI units and show each with its unit. |
|  |  |  | Event | When the user switches unit system, the takeoff module shall convert displayed values without changing stored values. |
| FR-ENG-QTO-005 | Group by folder and classification | v1 | Event | When the user picks a grouping, the takeoff module shall group by any attribute or Pset value, by a classification system (UniFormat in v1) or by the project WBS, in an editable folder tree, and shall list unclassified elements under "Unclassified" with a count. |
| FR-ENG-QTO-006 | Classification by rule | v1 | Event | When classification rules run, the takeoff module shall assign codes by rules over properties (equals, contains, in, range; and, or, not). |
|  |  |  | Unwanted | If an element matches no rule or more than one rule, then the takeoff module shall list it in a rule report. |
| FR-ENG-QTO-007 | Takeoff templates | v1 | Event | When the user saves a takeoff as a template, the takeoff module shall store its scope, grouping rules and columns so it can be applied to another model. |
| FR-ENG-QTO-008 | Takeoff table | v1 | Ubiquitous | The takeoff module shall show a table with group, code, description, count, quantity columns, unit, source, element count and link status, with sort, filter, level collapse and level totals. |
|  |  |  | Event | When the user selects a row, the takeoff module shall select its elements in the viewer. |
| FR-ENG-QTO-009 | Export to Excel and CSV | v1 | Event | When the user exports a takeoff, the takeoff module shall write `.xlsx` (outline levels, Source column, header block with model file, version, date and unit system) or flat UTF-8 `.csv` (one row per leaf). |
| FR-ENG-QTO-010 | Takeoff refresh on model update | v2 | Event | When a model version changes, the takeoff module shall re-run the takeoff and show added, removed and quantity deltas per group. |
| FR-ENG-QTO-011 | Upload PDF drawings as sheets | v2 | Optional | Where 2D takeoff is enabled, when the user uploads a PDF, the takeoff module shall create one Sheet per page with sheet number, name, page index and page size. |
| FR-ENG-QTO-012 | Scale calibration | v2 | Event | When the user calibrates a sheet with two points and a real length, or picks a standard scale, the takeoff module shall store and show the sheet scale. |
|  |  |  | Unwanted | If the user starts a measurement on an uncalibrated sheet, then the takeoff module shall block it and ask for calibration. |
| FR-ENG-QTO-013 | Count tool | v2 | Event | When the user places count marks for a takeoff item, the takeoff module shall show each mark in the item colour and update the count live. |
| FR-ENG-QTO-014 | Linear tool | v2 | Event | When the user draws a polyline, the takeoff module shall report its scaled length, with ortho lock and snap, and length × height when a height is set. |
| FR-ENG-QTO-015 | Area tool with cutouts | v2 | Event | When the user draws an area with cutouts, the takeoff module shall report net area (outer minus cutouts) and outer perimeter. |
| FR-ENG-QTO-016 | Takeoff items, folders and properties | v2 | Ubiquitous | The takeoff module shall attach every 2D markup to a TakeoffItem with folder, classification code, unit, colour and optional cost item, and group and export it like model takeoff. |
| FR-ENG-QTO-017 | Sheet revision overlay | later | Event | When the user overlays two revisions of a sheet, the takeoff module shall show changed linework in a distinct colour and let takeoffs move to the newer revision. |
| FR-ENG-QTO-018 | Model vs drawing check | v2 | State | While a TakeoffItem has both model and drawing quantities, the takeoff module shall show model qty, drawing qty and difference %, and mark a match below the set threshold. |
| FR-ENG-QTO-019 | Sheet linked to the document register | v2 | Optional | Where the Project control pack is installed, the takeoff module shall store a DocRef on each sheet. |
|  |  |  | Event | When the register holds a newer revision than the sheet's DocRef, the takeoff module shall flag "newer revision available" and keep takeoffs on the old revision until the user moves them. |

Count: 19 requirements (v1 9, v2 9, later 1).

#### 8.2.5 Module C: 4D/5D linking (FR-ENG-4D5D)

User stories:

- 4D5D-US1. As a planner, I import my P6 (XER/XML), MS Project XML or CSV schedule and keep IDs, WBS, dates, logic and codes.
- 4D5D-US2. As a planner, I link elements to activities by property rules, see what stayed unlinked, and fix it.
- 4D5D-US3. As a planner or PM, I play 4D on planned and actual dates.
- 4D5D-US4. As a cost engineer, I attach cost items with rates so each activity has a cost, and read the S-curve and cashflow.
- 4D5D-US5. As a planner, I record progress for a period and compare with the baseline.
- 4D5D-US6. (v2) As a planner, I generate a linked schedule from a methodology and zones.

| Id | Requirement | Phase | EARS | Statement |
|---|---|---|---|---|
| FR-ENG-4D5D-001 | Import P6 XER | v1 | Event | When the user imports a P6 XER, the 4D/5D module shall create the WBS, activities, relationships, calendars, activity codes and UDFs, keyed by P6 activity ID. |
| FR-ENG-4D5D-002 | Import P6 XML and MS Project XML | v1 | Event | When the user imports a P6 XML or MS Project XML file, the 4D/5D module shall create the same objects as for XER, keyed by activity ID or MSP UID. |
| FR-ENG-4D5D-003 | Import CSV | v1 | Event | When the user imports a CSV, the 4D/5D module shall map columns to activity fields and save the mapping for the next import of the same layout. |
| FR-ENG-4D5D-004 | Re-import as update | v1 | Event | When a schedule is re-imported as an update, the 4D/5D module shall match activities by external key, add new ones, update dates and logic, flag removed ones, and keep element links on matched activities. |
| FR-ENG-4D5D-005 | Export schedule | v2 | Event | When the user exports a schedule, the 4D/5D module shall write P6 XML/XER or MSP XML with the options export-to-level, include relations and include resources. |
| FR-ENG-4D5D-006 | Manual link, both ways | v1 | Event | When the user links a selection to an activity, the 4D/5D module shall store element-activity links. |
|  |  |  | Event | When the user selects an activity or a summary, the 4D/5D module shall select all elements linked to it or to its children; when the user selects elements, it shall list their activities. |
| FR-ENG-4D5D-007 | Link rules | v1 | Ubiquitous | The 4D/5D module shall let each activity or WBS node carry ordered include and exclude link rules over element properties, where a rule value can reference an activity field. |
| FR-ENG-4D5D-008 | Rule order and Update | v1 | Event | When the user runs Update, the 4D/5D module shall evaluate rules parent first, limit children to their parent's elements, and show a dry run of adds and removes per activity before writing. |
|  |  |  | State | While rules are edited and Update has not been applied, the 4D/5D module shall keep existing links unchanged. |
| FR-ENG-4D5D-009 | Link warnings | v1 | Event | When Update finishes, the 4D/5D module shall list Distribution warnings (unlinked, linked twice) and Link-rule warnings (rule matched nothing, missing property) per activity. |
|  |  |  | Event | When the user picks "select non-distributed elements", the 4D/5D module shall put them in the viewer selection. |
| FR-ENG-4D5D-010 | Link matrix | v1 | Ubiquitous | The 4D/5D module shall show a link matrix of activities against link sources (sets, codes or storeys) with element counts per cell and an unlinked total per column. |
| FR-ENG-4D5D-011 | "4D from an external schedule" wizard | v1 | Event | When the user starts the 4D wizard, the 4D/5D module shall walk through import, property validation, breakdown from schedule structure, smart sets, linking, and 4D, and report linked, unlinked and warning counts. |
| FR-ENG-4D5D-012 | 4D timeline playback | v1 | State | While 4D playback runs, the 4D/5D module shall drive Hider and Highlighter from the external schedule's dates so each element shows as not started, in progress or complete on the current date. |
|  |  |  | Event | When the user changes playback settings (length, fps, interval, overlays, display per state, start date), the 4D/5D module shall apply them on the next frame. |
| FR-ENG-4D5D-013 | Planned vs actual 4D | v1 | State | While actual mode is on, the 4D/5D module shall use progress dates and mark elements behind baseline as "late". |
| FR-ENG-4D5D-014 | Colour 4D by a breakdown | v1 | Event | When the user picks a 4D colour-by grouping, the 4D/5D module shall colour elements by their activity's value and show a legend. |
| FR-ENG-4D5D-015 | Export 4D frames | later | Event | When the user exports 4D for a date range, the 4D/5D module shall write a video or an image sequence stamped with dates. |
| FR-ENG-4D5D-016 | Baseline and progress entries | v1 | Event | When the user copies a schedule as baseline, the 4D/5D module shall freeze it for comparison. |
|  |  |  | Event | When the user sets a status date, the 4D/5D module shall apply all progress entries up to that date and recalculate once; before that it shall not change the schedule. |
| FR-ENG-4D5D-017 | Progress from BCF site sets | v2 | Event | When the user imports a BCF progress file for a period, the 4D/5D module shall set progress on the activities linked to the referenced GlobalIds. |
| FR-ENG-4D5D-018 | Cost items and cost versions | v1 | Ubiquitous | The 4D/5D module shall hold cost items (code, parent, name, description, unit, quantity type, unit rate, fixed cost, daily output, element query, quantity formula) in cost versions, and bind each schedule to one cost version. |
|  |  |  | Event | When the user imports or exports cost items, the 4D/5D module shall use Excel with those columns and round-trip without change. |
| FR-ENG-4D5D-019 | Auto-assign cost items to elements | v1 | Event | When the user runs auto-assign, the 4D/5D module shall select elements by each item's query, compute quantity by its formula, and set cost = quantity × unit rate in the chosen cost version. |
|  |  |  | Event | When the user runs "check applicable", the 4D/5D module shall report per item: no query, no elements, missing or non-numeric property. |
| FR-ENG-4D5D-020 | Non-model cost items | v1 | Ubiquitous | The 4D/5D module shall support cost items with a typed quantity and no elements. |
|  |  |  | Event | When an activity's duration changes, the 4D/5D module shall recalculate its time-based costs (rate × working days). |
| FR-ENG-4D5D-021 | Activity cost roll-up | v1 | Ubiquitous | The 4D/5D module shall compute activity cost as Σ (linked quantity × unit rate) + non-model items, roll it up through the WBS, and show it as a column. |
| FR-ENG-4D5D-022 | Cost S-curve and cashflow | v1 | Event | When the user opens cost curves, the 4D/5D module shall spread each activity's cost over its working days and show period cashflow and cumulative S-curves for baseline, current and actual, with the data date. |
| FR-ENG-4D5D-023 | Earned value figures | v2 | State | While a baseline, progress and actual cost exist, the 4D/5D module shall compute PV, EV, AC, CV, SV, CPI and SPI per period and WBS node. |
| FR-ENG-4D5D-024 | Payment certificate report | later | Event | When the user runs a payment certificate for a period, the 4D/5D module shall report contracted, certified accumulated, this period, to date and balance to finish. |
| FR-ENG-4D5D-025 | Methodology and zones | v2 | Optional | Where schedule generation is enabled, the 4D/5D module shall let the user build methodologies (two levels, typed links with hour or % DUR lag, Copy To Children, Constructive with offset) and zone sets referencing selection sets. |
| FR-ENG-4D5D-026 | Generate a linked schedule | v2 | Event | When the user generates from a creation template, the 4D/5D module shall make leaves only where elements exist, relink around missing items, check cycles, preview counts, and write activities and links with a stable `gen_key`. |
|  |  |  | Unwanted | If a regeneration would delete a started activity or a manual activity or link, then the 4D/5D module shall keep it. |
| FR-ENG-4D5D-027 | Look-ahead by group | v2 | Event | When the user runs a look-ahead for a period, the 4D/5D module shall group overlapping activities, linked elements and pro-rated quantities by the chosen fields and save each group as a selection set. |
| FR-ENG-4D5D-028 | Line of balance | later | Event | When the user opens line of balance, the 4D/5D module shall plot zone items on the y-axis and one line per methodology item. |

Count: 28 requirements (v1 19, v2 6, later 3).

#### 8.2.6 Requirement counts

| Module | v1 | v2 | later | Total | Acceptance tests |
|---|---|---|---|---|---|
| A. Viewer (FR-ENG-VWR) | 17 | 2 | 0 | 19 | 25 |
| B. Takeoff (FR-ENG-QTO) | 9 | 9 | 1 | 19 | 22 |
| C. 4D/5D (FR-ENG-4D5D) | 19 | 6 | 3 | 28 | 34 |
| **Total** | **45** | **17** | **4** | **66** | **81** |

FR-ENG-VWR-012 (angle, volume) and FR-ENG-VWR-013 (clash computation) have v2 parts and are counted as v1. Performance tests ENG-PERF-1 to -5 are in §8.2.8.

Source notes per requirement: companion §4.

#### 8.2.7 ID clash check (Spec Desk, v0.1.2)

| Pack ID | Clashes with | Resolution |
|---|---|---|
| FR-ENG-*, ENG-T-##, ENG-ADR-###, ENG-SP-#, ENG-PERF-# | none | kept |
| Tests T-VWR/QTO/4D5D-###-n | our tickets T-101…T-606 share the "T-" prefix, different shape | kept; no literal clash |
| Questions Q1…Q17 | our Q-01…Q-27 | read as ENG-Q1…ENG-Q17; ENG-Q1 and ENG-Q4 promoted to Q-24 and Q-25 |
| Stages S0…S6 | §0 decisions S1…S10, screens S01…S26 | read as "ENG stage S0…S6" |
| Entities Activity, Relation, Schedule, CostItem (pack §5) | D-PC entities Activity, Relationship, CostAccount (§9) | logical overlap, not an ID clash; Build Desk merges into one schedule and cost store (T-107) |
| VWR-US1… user stories | none | kept |

#### 8.2.8 Acceptance index: requirement → ticket → tests (pack §15.1)

Each pack requirement is accepted by the failing-first tests in its ticket (full Given/When/Then in the companion §11). Ordering of every ticket's checks follows the poteto pyramid (§7.7.1). Commit is TBD until Build Desk lands the code.

| FR | Phase | Ticket | Tests | Commit |
|---|---|---|---|---|
| FR-ENG-VWR-001 | v1 | ENG-T-01 | T-VWR-001-1, T-VWR-001-2 | TBD |
| FR-ENG-VWR-002 | v1 | ENG-T-03 | T-VWR-002-1 | TBD |
| FR-ENG-VWR-003 | v1 | ENG-T-02 | T-VWR-003-1 | TBD |
| FR-ENG-VWR-004 | v1 | ENG-T-04 | T-VWR-004-1, T-VWR-004-2 | TBD |
| FR-ENG-VWR-005 | v1 | ENG-T-04 | T-VWR-005-1 | TBD |
| FR-ENG-VWR-006 | v1 | ENG-T-05 | T-VWR-006-1, T-VWR-006-2 | TBD |
| FR-ENG-VWR-007 | v1 | ENG-T-05 | T-VWR-007-1 | TBD |
| FR-ENG-VWR-008 | v1 | ENG-T-06 | T-VWR-008-1 | TBD |
| FR-ENG-VWR-009 | v1 | ENG-T-06 | T-VWR-009-1 | TBD |
| FR-ENG-VWR-010 | v1 | ENG-T-07 | T-VWR-010-1, T-VWR-010-2 | TBD |
| FR-ENG-VWR-011 | v1 | ENG-T-08 | T-VWR-011-1 | TBD |
| FR-ENG-VWR-012 | v1 | ENG-T-08 | T-VWR-012-1 | TBD |
| FR-ENG-VWR-013 | v1 | ENG-T-09 | T-VWR-013-1, T-VWR-013-2 | TBD |
| FR-ENG-VWR-014 | v1 | ENG-T-09 | T-VWR-014-1 | TBD |
| FR-ENG-VWR-015 | v1 | ENG-T-09 | T-VWR-015-1, T-VWR-015-2 | TBD |
| FR-ENG-VWR-016 | v1 | ENG-T-09 | T-VWR-016-1 | TBD |
| FR-ENG-VWR-017 | v1 | ENG-T-09 | T-VWR-017-1 | TBD |
| FR-ENG-VWR-018 | v2 | ENG-T-21 | T-VWR-018-1 | TBD |
| FR-ENG-VWR-019 | v2 | ENG-T-22 | T-VWR-019-1 | TBD |
| FR-ENG-QTO-001 | v1 | ENG-T-10 | T-QTO-001-1 | TBD |
| FR-ENG-QTO-002 | v1 | ENG-T-10 | T-QTO-002-1 | TBD |
| FR-ENG-QTO-003 | v1 | ENG-T-10 | T-QTO-003-1, T-QTO-003-2 | TBD |
| FR-ENG-QTO-004 | v1 | ENG-T-10 | T-QTO-004-1 | TBD |
| FR-ENG-QTO-005 | v1 | ENG-T-11 | T-QTO-005-1 | TBD |
| FR-ENG-QTO-006 | v1 | ENG-T-11 | T-QTO-006-1 | TBD |
| FR-ENG-QTO-007 | v1 | ENG-T-11 | T-QTO-007-1 | TBD |
| FR-ENG-QTO-008 | v1 | ENG-T-12 | T-QTO-008-1 | TBD |
| FR-ENG-QTO-009 | v1 | ENG-T-12 | T-QTO-009-1, T-QTO-009-2 | TBD |
| FR-ENG-QTO-010 | v2 | ENG-T-22 | T-QTO-010-1 | TBD |
| FR-ENG-QTO-011 | v2 | ENG-T-23 | T-QTO-011-1 | TBD |
| FR-ENG-QTO-012 | v2 | ENG-T-23 | T-QTO-012-1, T-QTO-012-2 | TBD |
| FR-ENG-QTO-013 | v2 | ENG-T-24 | T-QTO-013-1 | TBD |
| FR-ENG-QTO-014 | v2 | ENG-T-24 | T-QTO-014-1 | TBD |
| FR-ENG-QTO-015 | v2 | ENG-T-24 | T-QTO-015-1 | TBD |
| FR-ENG-QTO-016 | v2 | ENG-T-24 | T-QTO-016-1 | TBD |
| FR-ENG-QTO-017 | later | ENG-T-31 | T-QTO-017-1 | TBD |
| FR-ENG-QTO-018 | v2 | ENG-T-25 | T-QTO-018-1 | TBD |
| FR-ENG-QTO-019 | v2 | ENG-T-25 | T-QTO-019-1 | TBD |
| FR-ENG-4D5D-001 | v1 | ENG-T-13 | T-4D5D-001-1 | TBD |
| FR-ENG-4D5D-002 | v1 | ENG-T-13 | T-4D5D-002-1 | TBD |
| FR-ENG-4D5D-003 | v1 | ENG-T-13 | T-4D5D-003-1 | TBD |
| FR-ENG-4D5D-004 | v1 | ENG-T-13 | T-4D5D-004-1 | TBD |
| FR-ENG-4D5D-005 | v2 | ENG-T-26 | T-4D5D-005-1 | TBD |
| FR-ENG-4D5D-006 | v1 | ENG-T-14 | T-4D5D-006-1 | TBD |
| FR-ENG-4D5D-007 | v1 | ENG-T-14 | T-4D5D-007-1, T-4D5D-007-2 | TBD |
| FR-ENG-4D5D-008 | v1 | ENG-T-14 | T-4D5D-008-1, T-4D5D-008-2 | TBD |
| FR-ENG-4D5D-009 | v1 | ENG-T-14 | T-4D5D-009-1, T-4D5D-009-2 | TBD |
| FR-ENG-4D5D-010 | v1 | ENG-T-15 | T-4D5D-010-1 | TBD |
| FR-ENG-4D5D-011 | v1 | ENG-T-15 | T-4D5D-011-1 | TBD |
| FR-ENG-4D5D-012 | v1 | ENG-T-16 | T-4D5D-012-1, T-4D5D-012-2 | TBD |
| FR-ENG-4D5D-013 | v1 | ENG-T-16 | T-4D5D-013-1 | TBD |
| FR-ENG-4D5D-014 | v1 | ENG-T-16 | T-4D5D-014-1 | TBD |
| FR-ENG-4D5D-015 | later | ENG-T-32 | T-4D5D-015-1 | TBD |
| FR-ENG-4D5D-016 | v1 | ENG-T-17 | T-4D5D-016-1 | TBD |
| FR-ENG-4D5D-017 | v2 | ENG-T-27 | T-4D5D-017-1 | TBD |
| FR-ENG-4D5D-018 | v1 | ENG-T-18 | T-4D5D-018-1 | TBD |
| FR-ENG-4D5D-019 | v1 | ENG-T-18 | T-4D5D-019-1, T-4D5D-019-2 | TBD |
| FR-ENG-4D5D-020 | v1 | ENG-T-18 | T-4D5D-020-1 | TBD |
| FR-ENG-4D5D-021 | v1 | ENG-T-19 | T-4D5D-021-1 | TBD |
| FR-ENG-4D5D-022 | v1 | ENG-T-19 | T-4D5D-022-1 | TBD |
| FR-ENG-4D5D-023 | v2 | ENG-T-28 | T-4D5D-023-1 | TBD |
| FR-ENG-4D5D-024 | later | ENG-T-33 | T-4D5D-024-1 | TBD |
| FR-ENG-4D5D-025 | v2 | ENG-T-29 | T-4D5D-025-1 | TBD |
| FR-ENG-4D5D-026 | v2 | ENG-T-29 | T-4D5D-026-1, T-4D5D-026-2 | TBD |
| FR-ENG-4D5D-027 | v2 | ENG-T-30 | T-4D5D-027-1 | TBD |
| FR-ENG-4D5D-028 | later | ENG-T-34 | T-4D5D-028-1 | TBD |
| (enabler) | v1 | ENG-T-00 | licence-scan and integrity tests | TBD |
| (performance) | v1 | ENG-T-20 | ENG-PERF-1, -2, -3 (CI); -4, -5 (spike) | TBD |
| (DWG) | DWG phase | ENG-T-35 | DWG render-and-measure test | TBD |


Performance tests (pack §10; thresholds proposed, to verify in spike, ENG-Q7):

| Test | Given / When / Then | Threshold (proposed, to verify in spike) |
|---|---|---|
| ENG-PERF-1 Parse | Given the Superstructure fixture on the CI runner, When web-ifc parses it in a fresh Node process, Then parse time and peak RSS are recorded and compared with the baseline. | Parse ≤ 276 ms × 1.5; fail the build on a larger regression (factor is a proposal) |
| ENG-PERF-2 Convert | Given the same fixture, When IfcImporter converts it to `.frag`, Then convert time, `.frag` size and peak RSS are recorded. | Convert ≤ 5.2 s × 1.5; peak RSS ≤ 515 MB × 1.2; `.frag` size within ±10 % of 3.731 MB (all proposals) |
| ENG-PERF-3 Counts | Given each fixture, When parsed, Then IfcElement counts equal 269, 6,421 and 5,466 and `IfcTask` is 0. | Exact |
| ENG-PERF-4 Browser load (spike) | Given the three `.frag` files served from our origin, When loaded alone and federated in Chromium, Then time to first triangle, JS heap, GPU memory (where measurable) and frame time during orbit are recorded. | No threshold until measured; Enrico sets it from the spike result |
| ENG-PERF-5 4D step (spike) | Given the ENG-SP-3 date file, When playback steps once per second, Then frame time per step is recorded. | No threshold until measured |

#### 8.2.9 Phasing (pack §12)

| Phase | Scope | Exit criteria |
|---|---|---|
| v1 (IFC-first) | Viewer: load and federate IFC, cached fragments, tree, pick, properties, ad-hoc sum, isolate/hide/colour-by, selection sets, sections, length and area measure, BCF clash import, issue pins, BCF exchange, DocRef on issues, copy IDs. Takeoff: model takeoff with qto/geom flags, units, grouping by folder, UniFormat or WBS, rule classification, templates, table, xlsx/csv export. 4D/5D: XER, P6 XML, MSP XML and CSV import and update; manual and rule linking; Update dry run; warnings; link matrix; 4D wizard; 4D playback planned vs actual; colour by breakdown; baseline and progress entries; cost items and versions; auto-assign; non-model items; cost roll-up; S-curve and cashflow. | The starter flow in companion §2 runs on the fixtures; all v1 tests pass; licence scan is clean. |
| v2 | 2D PDF takeoff (sheets, calibration, count, linear, area, items and folders, model vs drawing, sheet DocRef); model version compare; takeoff refresh; clash computation; angle and volume measure; plan views; IFC4X3 and ifczip; schedule export; progress from BCF; EV figures; methodology and zone generation; look-ahead. | `test-plan.pdf` measures known paper distances correctly after calibration; the generator passes the Solvarium PRD acceptance tests 1–3. |
| later | Sheet revision overlay, 4D video export, payment certificate, line of balance, MPP and DXF import. | Per item. |
| DWG phase | DWG import and DWG sheet takeoff through the paid ODA SDK. Licence and pricing decision first. | ODA licence in place; a DWG fixture renders and measures like a PDF sheet. |

#### 8.2.10 yravg UI gaps, Free vs Paid, open questions

yravg UI gaps from pack §6.2 are GAP-18…GAP-27 in §7.4.2 (ModelViewer is the largest). Spikes ENG-SP-1…4 run before the viewer UI is locked.

Free vs Paid (ASSUMPTION, Product Desk; the pack defines no tiers): in this product, Free includes the Engineering core pack (Module A v1 requirements and the Simple-layer interview); Pro adds Modules B and C, v2/later items, and the companion's tickets, tests and ADRs as generated tickets. The pack's own L1 ("paid, closed-source product") is about the user's planned app, not our tiers. The Bexel sample fixtures cannot be offered as a Free demo until redistribution is cleared (ENG-Q8).

Questions for Enrico promoted to §13: Q-24 (2D takeoff v1 or v2; the draft says v2) and Q-25 (schedule generator overlap with Solvarium). The pack ranks ENG-Q1, Q4, Q7, Q2, Q10 as most important; the rest stay in the companion §18.

### 8.3 D-PC Project control (EPCI)

Basis: Enrico's EPCI planning and project-control practice; common EPCI usage (AACE, PMI, DCMA 14-point assessment). Defaults are reviewed by Enrico before v1 (Q-12). v0.1.1 adds items proposed by Template Desk [/workspace/etsy-launch/prd-studio-packs/PACK-REVIEW-v0.1.md], marked "(TD)". Pack requirements are written in EARS and numbered in blocks of ten per subsection; the old → new id map is in CHANGELOG-PRD.md (v0.1.1).

#### 8.3.1 Document register (MDR)

| Field | Notes |
|---|---|
| Document number | Project-coded, e.g. `PRJ-AREA-DISC-TYPE-SEQ`; pattern configurable per contract |
| Title, discipline, document type, area/unit, originator | Discipline list seeded: process, piping, mechanical, electrical, instrument, civil, structural, HSE, QA/QC, project control |
| Revision | Letters for pre-IFC issues (A, B, C…), numbers from IFC (0, 1, 2…) |
| Issue purpose | IFR (review), IFA (approval), IFC (construction), IFI (information), AB (as-built) |
| Client review code | 1 approved; 2 approved with comments; 3 revise and resubmit; 4 information only (configurable per contract) |
| Planned / forecast / actual dates | First issue, client return, approval |
| Weight and progress steps | Default IFR 40%, IFA 70%, IFC 100% (ASSUMPTION, editable) |
| Linked activity | Schedule activity id for engineering progress roll-up |

| ID | Requirement |
|---|---|
| REQ-PC-001 | THE SYSTEM SHALL let users create, edit and import / export register rows as xlsx or csv. |
| REQ-PC-002 | WHEN a document gets a new revision THE SYSTEM SHALL keep the earlier revisions with their dates and codes. |
| REQ-PC-003 | THE SYSTEM SHALL filter the register by discipline, status and overdue. |
| REQ-PC-004 | IF a planned date has passed with no actual date THEN THE SYSTEM SHALL mark the document overdue. |
| REQ-PC-005 | THE SYSTEM SHALL draw the engineering progress S-curve from document weights and progress steps. |

#### 8.3.2 Vendor document register (VDRL) (TD)

Supplier documents run separately from the contractor's own MDR and drive procurement and construction float.

| ID | Requirement |
|---|---|
| REQ-PC-010 | THE SYSTEM SHALL keep a vendor document register keyed by PO number with: PO, vendor, tag numbers, document code, required-by date, review code, status at the vendor. (TD) |
| REQ-PC-011 | THE SYSTEM SHALL compute each vendor document's required-by date as PO date + an offset set per document type (e.g. GA drawing: PO + 4 weeks; ASSUMPTION default). (TD) |
| REQ-PC-012 | WHEN a PO date changes THE SYSTEM SHALL recompute the required-by date of every vendor document on that PO. (TD) |

#### 8.3.3 Transmittals and comment resolution

| Field | Notes |
|---|---|
| Transmittal number | Sequential per direction (outgoing / incoming) and party |
| From / to / cc | Parties: client, contractor, vendor, subcontractor |
| Documents | Document number + revision + issue purpose + copies / format |
| Purpose | Review, approval, information, construction |
| Response due | Contract review period, e.g. 10 working days (configurable) |
| Return code + comments | Writes back to the register |

| ID | Requirement |
|---|---|
| REQ-PC-020 | WHEN the user selects register rows and chooses "Buat transmittal" THE SYSTEM SHALL create a transmittal listing those document revisions. |
| REQ-PC-021 | THE SYSTEM SHALL produce a bilingual cover-sheet PDF for each transmittal. |
| REQ-PC-022 | WHEN an incoming return is recorded THE SYSTEM SHALL update each listed document's review code and dates. |
| REQ-PC-023 | IF a transmittal's response due date has passed with no return THEN THE SYSTEM SHALL list it as an overdue response. |
| REQ-PC-024 | IF a user transmits a document revision again for the same purpose THEN THE SYSTEM SHALL require a stated reason. |
| REQ-PC-025 | THE SYSTEM SHALL keep a comment resolution sheet per document revision with: comment no., reviewer, comment, response, status (open / closed / carried to next revision). (TD) |
| REQ-PC-026 | WHEN a return carries code 2 or 3 THE SYSTEM SHALL open a comment resolution sheet for that revision and link it to the return. (TD) |
| REQ-PC-027 | WHEN a new revision is issued THE SYSTEM SHALL carry open comments from the previous revision's sheet forward as "carried". (TD) |

#### 8.3.4 RFI / TQ log (TD)

An answered technical query with cost or schedule impact is the usual first step towards a variation.

| ID | Requirement |
|---|---|
| REQ-PC-030 | THE SYSTEM SHALL keep an RFI / TQ log with: number, raised by, addressed to, discipline, linked documents, date raised, date required, date answered, cost impact flag, schedule impact flag, linked change item. (TD) |
| REQ-PC-031 | IF a TQ has a cost or schedule impact flag THEN THE SYSTEM SHALL block closing it until it is linked to a change item (REQ-PC-066) or marked "no change" with a reason. (TD) |
| REQ-PC-032 | IF a TQ's date required has passed with no answer THEN THE SYSTEM SHALL list it as overdue. |

#### 8.3.5 Schedule (Spider / Primavera style)

| ID | Requirement |
|---|---|
| REQ-PC-040 | THE SYSTEM SHALL hold a hierarchical WBS: project → phase (E, P, C, I) → area → discipline → work package, with codes and weights. |
| REQ-PC-041 | THE SYSTEM SHALL hold activities with id, name, WBS, original and remaining duration, calendar, type (task, start milestone, finish milestone, LOE), and resource and cost loading. |
| REQ-PC-042 | THE SYSTEM SHALL support FS, SS, FF and SF relationships with lag; IF an activity other than project start or finish has no predecessor or no successor THEN THE SYSTEM SHALL flag it as an open end. |
| REQ-PC-043 | WHEN the user schedules (F9) THE SYSTEM SHALL run the CPM forward and backward pass and compute total float, free float, critical activities (TF ≤ threshold, default 0) and the longest path. |
| REQ-PC-044 | THE SYSTEM SHALL support work-week, holiday and shift calendars, with Indonesian national holidays seeded. |
| REQ-PC-045 | THE SYSTEM SHALL support start-no-earlier-than, finish-no-later-than and mandatory constraints, and count them in the DCMA hard-constraint check. |
| REQ-PC-046 | THE SYSTEM SHALL keep baselines, the data date, actual start / finish, remaining duration and % complete, and show variance against the baseline. |
| REQ-PC-047 | THE SYSTEM SHALL run the DCMA 14-point checks: logic, leads, lags, relationship types, hard constraints, high float, negative float, high duration, invalid dates, resources, missed tasks, critical path test, CPLI, BEI. |
| REQ-PC-048 | THE SYSTEM SHALL import and export XER and MS Project XML. |
| REQ-PC-049 | THE SYSTEM SHALL measure physical progress by rules of credit (milestone steps, units complete, LOE), roll it up by WBS weight, and show the planned vs actual S-curve and SPI. |
| REQ-PC-050 | WHEN the user sets a new data date THE SYSTEM SHALL accept it only if it is later than the current data date; moving back is done only by restoring an earlier saved update, through a Proposal with a reason. (TD, adjusted) |
| REQ-PC-051 | IF an actual start, actual finish or actual quantity is dated after the data date THEN THE SYSTEM SHALL reject it. (TD) |

Domain property tests seeded into generated plans (from the pyramid skill): an early start never comes before its predecessors plus lag; recalculating twice gives the same result; export then import gives the same schedule [/home/box/agent-data/workflows/yravg-trust-ladder/SKILL.md].

#### 8.3.6 Cost control

| ID | Requirement |
|---|---|
| REQ-PC-060 | THE SYSTEM SHALL map the cost breakdown structure to the WBS; a cost account = WBS element × cost type (labour, material, equipment, subcontract, indirect). |
| REQ-PC-061 | THE SYSTEM SHALL keep original budget, approved variations and current budget per cost account. |
| REQ-PC-062 | THE SYSTEM SHALL keep commitments (POs, subcontracts) by cost account. |
| REQ-PC-063 | THE SYSTEM SHALL keep actuals per period in two states — accrued (work done, not yet invoiced) and invoiced / paid — and SHALL use accrued + invoiced as AC (ACWP) for earned value. (TD) |
| REQ-PC-064 | THE SYSTEM SHALL compute PV (BCWS), EV (BCWP), AC (ACWP), CPI, SPI, CV and SV at every WBS level. |
| REQ-PC-065 | THE SYSTEM SHALL compute ETC and EAC by a selectable method — AC + bottom-up ETC; BAC / CPI; AC + (BAC − EV) / (CPI × SPI) — and VAC. |
| REQ-PC-066 | THE SYSTEM SHALL keep a change register where each item moves through the states trend → potential change (PCN) → submitted (COP / VO) → approved or rejected, storing the value at each state and the date of each change. (TD) |
| REQ-PC-067 | WHEN a change item is approved THE SYSTEM SHALL add its value to current budget; WHILE it is submitted THE SYSTEM SHALL include it in the forecast only; WHEN it is rejected THE SYSTEM SHALL remove it from the forecast. (TD) |
| REQ-PC-068 | THE SYSTEM SHALL keep contingency and management reserve as separate lines, each with a drawdown log (date, amount, cost account, reason, approver). (TD) |
| REQ-PC-069 | THE SYSTEM SHALL show EAC before and after contingency. (TD) |
| REQ-PC-070 | THE SYSTEM SHALL show planned vs actual cash flow with a cumulative curve. |
| REQ-PC-071 | THE SYSTEM SHALL produce a monthly cost report with a bridge budget → variations → commitments → actuals → EAC (GB-02) and a visible reconciliation check (GB-09). |

#### 8.3.7 Completion: punch list (TD)

| ID | Requirement |
|---|---|
| REQ-PC-080 | THE SYSTEM SHALL keep a punch list with: item no., system / subsystem, tag, category, raised by, action party, target date, closed date, evidence. (TD) |
| REQ-PC-081 | THE SYSTEM SHALL seed categories A (must close before mechanical completion) and B (must close before handover), editable per contract. (TD) |
| REQ-PC-082 | IF a system has an open category A item THEN THE SYSTEM SHALL not allow it to be marked mechanically complete; IF it has an open category B item THEN THE SYSTEM SHALL not allow it to be marked handed over. (TD) |

#### 8.3.8 Pack acceptance criteria

| ID | Criterion | Proves |
|---|---|---|
| AC-PC-1 | CPM on a 30-activity test network returns the expected early / late dates and floats | REQ-PC-043 |
| AC-PC-2 | DCMA check counts match a hand-checked fixture | REQ-PC-047 |
| AC-PC-3 | EV at every WBS level equals the sum of its children | REQ-PC-064 |
| AC-PC-4 | A return with code 3 sets the document to "revise and resubmit", opens the next revision and opens a comment resolution sheet | REQ-PC-022, REQ-PC-026 |
| AC-PC-5 | A TQ flagged with cost impact cannot be closed until it is linked to a change item or marked "no change" with a reason (TD) | REQ-PC-031 |
| AC-PC-6 | Changing a PO date changes the required-by date of every vendor document on that PO (TD) | REQ-PC-011, REQ-PC-012 |
| AC-PC-7 | EAC before and after contingency is shown, and the drawdown log sums to the difference (TD) | REQ-PC-068, REQ-PC-069 |
| AC-PC-8 | Setting a data date earlier than the current one is refused; an actual finish dated after the data date is refused | REQ-PC-050, REQ-PC-051 |

Components: `components/schedule-chart`, `components/dcma-bars`, `blocks/schedule-dashboard`, `components/milestone-stepper`, `components/data-table`; Gantt = GAP-14, transmittal composer = GAP-15, CBS tree = GAP-16, bridge = GAP-17.

Localisation for D-PC (Bahasa, local practice): field labels in Bahasa with the English term kept (e.g. "Transmittal / Surat pengantar dokumen", "Daftar punch"); Indonesian national holidays seeded in calendars (REQ-PC-044); IDR as default currency with PPN as a separate cost line; bilingual transmittal cover sheet. Client- or regulator-specific codes (e.g. oil and gas contract numbering) are **TO VERIFY** with Enrico (Q-12).

Not adopted in v0.1.1 (Template Desk review §1.2, outside this bump's scope): a "started / internal check" progress step with weights held in the rule-of-credit set, and moving forecast dates by the review period on a code 3 return. Both are open in Q-12.

### 8.4 D-FIN Financial analysis

**Decision S10.** Approved by Enrico in the Etsy Launch: Build room, 17 Nov 2026, as reported by Template Desk and Grok Bot. (1) Q-13 approved: D-FIN is refocused on contractor project finance. (2) D-FIN gets a second module: simple stock analysis from public sources only. Source: [/workspace/etsy-launch/prd-studio-packs/PACK-REVIEW-v0.3.md §2, §2A] (rev 3, replaces rev 2). No finance reviewer is named yet; every module 1 item stays TO VERIFY with one (TV-13).

Old v0.1 items REQ-FIN-001…003 (trial-balance import, three linked statements, corporate ratio set) and AC-FIN-1 are removed; see CHANGELOG-PRD.md v0.1.2. Their IDs are retired, not reused.

| Module | What | IDs |
|---|---|---|
| 1 Contractor project finance | Revenue by percentage of completion, progress billing, under/over billing, project cash, bid appraisal, forex, plus the kept v0.1 items | REQ-FIN-004…015, AC-FIN-2…5 |
| 2 Stock analysis (public sources only) | Watchlist, company page, valuation set, peers, screener, sources and guardrails, showcase gallery | REQ-FIN-020…029, AC-FIN-6…8 |

#### 8.4.1 Module 1 — contractor project finance (adopted v0.1.2, TD)

Proposed by Template Desk as the v0.1.1 PROPOSAL block; adopted as written.

| ID | Requirement (EARS) |
|---|---|
| REQ-FIN-010 | THE SYSTEM SHALL recognise contract revenue over time by cost-to-cost percentage of completion (cost incurred ÷ estimated total cost) and state the method on the page. PSAK 72 (aligned with IFRS 15) as the Indonesian standard is **TO VERIFY**. (TD) |
| REQ-FIN-011 | THE SYSTEM SHALL hold a progress billing schedule (milestone or measured value) with retention % held, advance payment and its recovery % per invoice, and PPN and PPh withholding as separate lines. Rates are **TO VERIFY**. (TD) |
| REQ-FIN-012 | THE SYSTEM SHALL show under / over billing per period (revenue recognised − amount billed) as a contract asset or contract liability. (TD) |
| REQ-FIN-013 | THE SYSTEM SHALL build project cash flow from the D-PC cost-loaded schedule, the billing schedule and payment terms (e.g. 30 / 60 days), and SHALL show peak negative cash and its month on the first screen. (TD) |
| REQ-FIN-014 | WHEN the user appraises a bid THE SYSTEM SHALL show estimate, contingency, margin, cash profile and NPV at the company discount rate (uses REQ-FIN-006). (TD) |
| REQ-FIN-015 | THE SYSTEM SHALL hold foreign-currency lines (USD, SGD, others) with a budget rate and a current rate, and SHALL show forex variance apart from cost variance. (TD) |

#### 8.4.2 Kept from v0.1 (fit module 1)

| ID | Requirement (EARS) | Change in v0.1.2 |
|---|---|---|
| REQ-FIN-004 | THE SYSTEM SHALL show budget vs actual by period and cost centre, with a named variance bridge (GB-02). | EARS wording |
| REQ-FIN-005 | THE SYSTEM SHALL forecast company cash for 13 weeks and 12 months, summing the project cash flows of REQ-FIN-013. | Tied to REQ-FIN-013 |
| REQ-FIN-006 | THE SYSTEM SHALL compute NPV, IRR and payback from a cash profile and a discount-rate input. | EARS wording; used by REQ-FIN-014 |
| REQ-FIN-007 | THE SYSTEM SHALL run scenarios and a sensitivity view (tornado on key drivers such as unit rates, duration, payment terms). | Contractor drivers named |
| REQ-FIN-008 | THE SYSTEM SHALL format money as IDR (`Rp 1.234.567`) with a thousands / millions toggle. | PSAK and PPN part moved to REQ-FIN-010 / 011 |
| REQ-FIN-009 | THE SYSTEM SHALL show project margin by joining the D-PC EAC with contract revenue (GB-21). | EARS wording |

#### 8.4.3 Module 1 acceptance criteria

| AC | Criterion | Covers |
|---|---|---|
| AC-FIN-2 | NPV and IRR match a spreadsheet fixture to 2 decimal places | REQ-FIN-006, 014 |
| AC-FIN-3 | Revenue recognised to date = PoC × contract value; under/over billing = that − cumulative billing (TD) | REQ-FIN-010, 012 |
| AC-FIN-4 | Retention held = sum of retention per invoice − retention released (TD) | REQ-FIN-011 |
| AC-FIN-5 | The project cash curve reconciles to cumulative cost − cumulative receipts in every period (TD) | REQ-FIN-013 |

#### 8.4.4 Module 2 — stock analysis from public sources (adopted v0.1.2, TD)

Deliberately simpler than oyenza.trade, and a showcase domain: users start from ready dashboards. All items proposed by Template Desk [PACK-REVIEW-v0.3.md §2A].

| ID | Requirement (EARS) |
|---|---|
| REQ-FIN-020 | THE SYSTEM SHALL keep a watchlist of tickers (IDX first, e.g. BBCA, TLKM); WHEN the user adds or removes a ticker THE SYSTEM SHALL update the list, and each row SHALL show last price, change, volume, and the price's date and source. (TD) |
| REQ-FIN-021 | WHEN the user opens a ticker THE SYSTEM SHALL show a company page with a price chart (1M / 6M / 1Y / 5Y), key figures from the latest published annual and quarterly reports (revenue, net profit, EPS, equity, debt) and dividend history. (TD) |
| REQ-FIN-022 | THE SYSTEM SHALL show a valuation set (P/E, P/BV, dividend yield, ROE, debt-to-equity), each with its formula, the period it covers and a "good direction" (GB-09). (TD) |
| REQ-FIN-023 | WHEN the user picks a sector THE SYSTEM SHALL show a peer table with the REQ-FIN-022 ratios side by side and a sector median. (TD) |
| REQ-FIN-024 | THE SYSTEM SHALL filter the stored universe by ratio thresholds and let the user save the screen. (TD) |
| REQ-FIN-025 | THE SYSTEM SHALL show the source and as-of date for every number and label prices "tertunda / akhir hari" (delayed / end of day). THE SYSTEM SHALL NOT present any output as a buy or sell recommendation, and every page SHALL carry the line "informasi, bukan saran investasi". (TD) |
| REQ-FIN-026 | THE SYSTEM SHALL read each public source through its own adapter that records the source's terms of use, rate limits and whether redistribution is allowed. IF a source's terms forbid display or storage THEN THE SYSTEM SHALL NOT enable that adapter. (TD) |
| REQ-FIN-027 | THE SYSTEM SHALL offer a gallery of at least 7 ready dashboards on sample data — market overview, single-stock deep dive, dividend tracker, sector heatmap, portfolio vs IHSG, earnings calendar, and contractor project finance (F01, on REQ-FIN-010…013; added v0.1.4 per Design Desk, relayed by Grok Bot, 19 Nov 2026) — each built on the D-DASH methods (§8.4.7). (TD) |
| REQ-FIN-028 | THE SYSTEM SHALL treat oyenza.trade as a study reference only: patterns may be described in our own words and built in yravg tokens, and THE SYSTEM SHALL NOT reuse its screens, layout, copy, data or brand. (TD) |
| REQ-FIN-029 | THE SYSTEM SHALL enable only sources whose terms allow use in a paid product. Yahoo Finance and other personal-use-only feeds SHALL NOT be enabled. Default sources: IDX public disclosures, company filings and IR PDFs, and any price feed with a commercial licence (§8.4.5). (TD) |

#### 8.4.5 Sources and terms (all TO VERIFY before build)

| Source | Use | Status |
|---|---|---|
| IDX published financial reports and company announcements (idx.co.id) | Key figures, dividends, earnings dates | **TO VERIFY** — terms of use for display and storage in a paid product not checked |
| Company investor-relations PDFs | Key figures where IDX files are missing | **TO VERIFY** — terms per company |
| End-of-day price feed with a commercial licence | Prices, volume, IHSG | **TO VERIFY** — no vendor chosen; licence must allow display in a paid product |
| Yahoo Finance and other personal-use-only feeds | — | Excluded (REQ-FIN-029) |

The terms found for each source fill its adapter record (REQ-FIN-026). Until a licensed feed is confirmed, every module 2 page and the D-DASH stock-watch showcase (REQ-DASH-022) run on bundled sample data.

#### 8.4.6 Clean-room and regulatory notes

- **Clean room (oyenza.trade).** Reference only, nothing copied: no code, screens, layout, copy, data or brand (REQ-FIN-028). The module stays deliberately simpler: no live prices, no signals, no portfolio trading. Template Desk says the study is under the owner's permission; not seen first-hand (**TO VERIFY**).
- **Regulatory.** The product does not give investment advice (REQ-FIN-025). Template Desk states that giving investment advice in Indonesia needs an OJK licence, which we do not hold. Whether OJK rules on investment advice or investment content apply to a stock-analysis tool like this is **TO VERIFY** with a legal check (TV-17).

#### 8.4.7 Showcase dashboards and Gus Bavia methods

| Showcase (REQ-FIN-027) | Question it answers | Methods |
|---|---|---|
| Market overview | How did the market and my watchlist move this period? | GB-01 first screen per audience, GB-04 one period control |
| Single-stock deep dive | Is this company's price backed by its reported numbers? | GB-07 click the object to drill in, GB-09 good direction, numbers close |
| Dividend tracker | What did my holdings pay, and when is the next payment? | GB-09, GB-13 same structure, different job |
| Sector heatmap | Which sectors are cheap or dear on the same ratios? | GB-19 normalise first, then compose; GB-12 custom visual only where it adds a decision |
| Portfolio vs IHSG | Why is my sample portfolio ahead of or behind the index? | GB-02 variance as a named bridge, GB-04 |
| Earnings calendar | Which reports are due this month for my tickers? | GB-08 in-page alerts, GB-11 attach the item to the ticker it affects |
| Contractor project finance (F01) | Where does this contract stand on revenue, billing and cash, and when is cash lowest? (REQ-FIN-010…013) | GB-02 variance as a named bridge, GB-21 margin risk on one screen |

All seven follow GB-06 (one stated question per page), GB-23 (hand over a kit: sample data, how-to-read) and REQ-DASH-020 (sample data that tells one story).

#### 8.4.8 Free vs Paid lines (ASSUMPTION, Product Desk)

| Item | Free | Paid (Pro) |
|---|---|---|
| Watchlist size in the seeded app spec | 10 tickers | 100 tickers |
| Screener | run preset screens; no saved screens | custom thresholds and saved screens |
| Showcase dashboards in our gallery | Market overview, Single-stock deep dive | all 6 |

These are defaults for Product Desk to confirm (Q-03). In the user's own planned app they seed the Free vs Paid table, which the builder can change.

#### 8.4.9 Module 2 acceptance criteria

| AC | Criterion | Covers |
|---|---|---|
| AC-FIN-6 | Every ratio on screen recomputes from the stored source figures to the same result at 2 decimal places (TD) | REQ-FIN-022, 023 |
| AC-FIN-7 | Every number has a source and an as-of date; a page with any number missing one fails the check (TD) | REQ-FIN-020, 021, 025, 026 |
| AC-FIN-8 | No page contains recommendation wording (beli, jual, target harga / buy, sell, target price) unless it sits inside a quoted third-party source, and every page carries "informasi, bukan saran investasi" (TD) | REQ-FIN-025, 029 |

Components: `components/kpi-tiles`, `components/line-chart`, `components/breakdown-chart`, `components/data-table-plus`, `blocks/metrics-dashboard`; sector heatmap = GAP-28; bridge = GAP-17.

---

## 9. Entities (logical data model)

Physical schema waits for the architecture audit (§12).

| Entity | Key fields | Notes |
|---|---|---|
| User | id, email, name, locale (`id`/`en`), auth provider | Better Auth; email + Google |
| Project | id, owner_id, name, domain (`dash`/`eng`/`pc`/`fin`), current_revision_id, design_system_id, canvas_status | One spec document per project |
| Idea | id, project_id, text, attachments[] | The one text box |
| InterviewQuestion | id, project_id, order, text, recommended_answer, source (`domain_bank`/`gap`), status (`asked`/`answered`/`skipped`) | One at a time |
| Decision | id, project_id, question_id, decision, alternatives[], decided_by (`user`/`accepted_recommendation`), created_at | The decision log |
| Spec | id, project_id, title, language, owner_id | The spec document (PRD); name TO CONFIRM |
| SpecBlock | id, spec_id, layer (`simple`/`detailed`/`expert`), kind (`pitch_field`/`requirement`/`plan`/`adr`/`glossary`/`open_question`/`sources_limits`), content, basis_refs[] (decision ids, pack requirement ids, FR-REF ids) | `basis_refs` empty → "tanpa dasar" |
| Requirement | id (`R-…`), spec_id, ears_type (`event`/`state`/`unwanted`/`optional`/`ubiquitous`), text, status (`draft`/`accepted`/`needs_review`), fr_ref_ids[], pack_ref | EARS |
| Adr | id, spec_id, title, status, context, decision, consequences, requirement_ids[] | Only for hard-to-reverse trade-offs |
| GlossaryTerm | id, spec_id, term, bahasa, english, definition | |
| Revision | id, spec_id, number, parent_revision_id, author_type (`user`/`agent`), author_id, proposal_id, snapshot_hash, created_at | Immutable |
| Proposal | id, spec_id, base_revision_id, author_type, author_id, reason, source (`user_edit`/`interview`/`chat`/`depth_expand`/`reference`/`cli_sync`/`domain_pack`/`revert`), status (`open`/`stale`/`accepted`/`partially_accepted`/`rejected`), created_at, decided_at | Every change |
| Diff | id, proposal_id, target_type (`spec_block`/`requirement`/`ticket`/`criterion`/`decision`/`design_md`/`token`), target_id, op (`add`/`change`/`remove`), before, after, hunk_index, decision (`pending`/`accepted`/`rejected`) | Per-hunk decisions |
| Ticket | id (`T-…`), project_id, title, prompt, component_ref, blockers[], status, starting_commit_sha | Thin vertical slice |
| TicketRequirement | ticket_id, requirement_id | Many-to-many |
| Criterion | id (`AC-…`), ticket_id, given, when, then, kind, test_ref, command, required, fails_at_start (`unknown`/`yes`/`no`) | R-VER-2 sets `fails_at_start` |
| Commit | sha, project_id, message_summary, ticket_refs[], committed_at | Reported by CLI/CI; no code |
| VerificationRun | id, ticket_id, trigger (`cli`/`ci`/`mcp`), kind (`start_check`/`verify`), commit_shas[], env, started_at, finished_at, result | |
| VerificationResult | id, run_id, criterion_id, outcome (`pass`/`fail`/`missing`/`skipped`/`manual_pending`), duration_ms, message | |
| ReviewRun | id, ticket_id, commit_range, reviewer_model, mode (`server`/`local`), verdicts[] (criterion_id, pass/fail, reason) | Independent review |
| Reference | id, project_id, kind (`url`/`recording`/`screenshots`), source, consent_at, purge_at | |
| GateRecord | id, reference_id, target, purpose, authority, robots_result (`allowed`/`blocked`/`unclear`), signals_json, reuse_boundary, stop_rules | Written before capture |
| CaptureItem | id, reference_id, url or timestamp, viewport (1440/390), shot_ref, reached_by, captured_at | Private pack |
| FrRef | id (`FR-REF-nnn`), reference_id, name, evidence (shot + marker / timestamp), status (`seen`/`partial`/`not_reached`), reason, notes, decision (`pending`/`accepted`/`rejected`) | The inventory |
| Figure | id, reference_id, caption, markers[] (n, label, fr_ref_id), source, captured_at | Owner-only |
| CleanRoomCheck | id, proposal_id, rule, outcome, detail | Audit of refusals |
| DesignSystem | id, project_id, kit (`yravg_ui`/other), design_md, tokens_json, source (`yravg_default`/`custom`) | Changes via Proposal |
| ComponentRef | id, slug or gap_id, name | |
| Screen | id, project_id, name, component_ref, canvas_state | User-app screens for the Canvas step |
| DomainPack | id, domain, version, question_bank[], requirements[], tickets[], criteria[], rules | Seed content |
| Plan | id, slug, price_idr, duration_days, limits_json, active | Admin-managed; DPAI keeps limits in plan data the same way [DPAI:research/web/api_api_billing_plans.json] |
| Subscription | id, user_id, plan_id, starts_at, ends_at, status | 30-day passes |
| Payment | id, user_id, plan_id, provider (`midtrans`), order_id, gross_amount, method, status, signature_ok, raw_notification | Idempotent by order_id |
| UsageCounter | user_id, period, metric, count | Enforces §7.8.1 |
| ApiToken | id, user_id, project_id, token_hash, scopes, last_used_at | CLI/MCP; device-code login like DPAI CLI 0.3.x [DPAI:PRD.md §5] |
| AgentRun | id, project_id, kind, status, steps[], tokens, cost_idr, steering_notes[] | Agent Inbox / Run / Trace Waterfall |

Domain-pack entities (Document, VendorDocument, Transmittal, CommentSheet, Rfi, PunchItem, WbsNode, Activity, Relationship, Calendar, CostAccount, Commitment, Actual, ChangeItem (with state history), ContingencyDrawdown, Scenario, BillingLine, RetentionLedger, FxLine, Ticker, PriceBar, ReportFigure, Watchlist, SavedScreen, SourceAdapter; Engineering entities Model, Element, SelectionSet, Classification, Schedule, CostVersion, CostItem, Link per ENGINEERING-PACK-v0.1.md §5) belong to the **user's** planned app and are written into their spec by the pack. They are not tables in this product.

---

### 9.1 Consolidation entity extensions

Logical additions, not database migrations: WorkflowStageState(project, stage, status, artifact_revision_refs, blocker_refs, exception_reason); Artifact(project, type, stable_id); ArtifactRevision(artifact, parent, content_hash, acceptance); ArtifactLink(source_revision, target_revision, relation); BoardNode(board, artifact_revision, transform, group); UserWorkspaceState(user, project, stage, tab_order, active_artifact, viewport, panels); ModelRegistryVersion; RateCardVersion; ModelJob(context_manifest, source, model, idempotency_key); Budget; UsageReservation; UsageSettlement; EvidenceManifest(spec_revision, requirement_revisions, design_revisions, build_id, environment, hashes); ReleaseReadiness(manifest, approvals, gaps). Role checks apply to each record. Existing Revision/Proposal/Ticket/Criterion stay authoritative; these records link to them instead of creating another spec store.

## 10. Acceptance criteria (product)

Each criterion is observable and names the requirement it proves. Set executable commands against the audited Studio source. Test during each slice and before release readiness. Tool selection does not prove a result.

| # | Criterion | Proves |
|---|---|---|
| AC-1 | The onboarding screen has four domain cards, one text box, and nothing else required | R-ONB-1 |
| AC-2 | Submit stays disabled until a domain is picked and the text has ≥ 20 characters | R-ONB-2 |
| AC-3 | The interview never shows more than one open question at a time; each has accept / edit / skip | R-ONB-3 |
| AC-4 | After 3 answered and 1 skipped question, the decision log has 3 entries and the spec has 1 open question | R-ONB-4, R-ONB-5 |
| AC-5 | At the 12th question, or on "Cukup, buat pitch", a pitch Proposal with all five fields appears | R-ONB-6 |
| AC-6 | No ticket exists before the ticket breakdown Proposal is accepted | R-ONB-7 |
| AC-7 | Switching ID → EN mid-interview changes UI strings and keeps answered questions | R-ONB-8 |
| AC-8 | Sign-in works with email and with Google | R-ONB-9 |
| AC-9 | The API has no endpoint that writes spec content outside Proposal acceptance (route audit test) | R-EDT-1 |
| AC-10 | Accepting 2 of 3 hunks writes only those 2 changes and one Revision with the right parent | R-EDT-2, R-EDT-3 |
| AC-11 | A Proposal made on revision 4 cannot be accepted when the current revision is 5 | R-EDT-4 |
| AC-12 | Moving Expert → Simple → Expert leaves the snapshot hash unchanged | R-EDT-5 |
| AC-13 | Accepting a requirement change marks every linked ticket and criterion "needs review" | R-EDT-6 |
| AC-14 | Revert to revision 2 produces a Revision whose snapshot hash equals revision 2's | R-EDT-7 |
| AC-15 | A Detailed block with no basis shows "tanpa dasar" | R-EDT-8 |
| AC-16 | No HTTP request for a reference is made before its GateRecord exists | R-REF-1 |
| AC-17 | A fixture site with `Disallow: /pricing` is captured without `/pricing`; a site naming the crawler in robots is not captured and the three choices appear | R-REF-2, R-REF-3, R-REF-4 |
| AC-18 | A page that client-redirects to `/login` is recorded as a gap, not analysed | R-REF-5 |
| AC-19 | A recording upload cannot proceed without the permission confirmation | R-REF-6 |
| AC-20 | A fixture recording with a visible card number produces no stored frame or text containing that number | R-REF-7 |
| AC-21 | Every inventory row has an FR-REF id, evidence pointer and status; rows for unseen features are UNKNOWN | R-REF-9, R-REF-10 |
| AC-22 | Accepted rows appear as requirements carrying FR id and evidence; rejected rows appear under "seen, not in scope" | R-REF-12 |
| AC-23 | No generated block contains a run of ≥ 8 words matching captured text, a detected brand term, or a captured colour/font value | §7.3.1, R-REF-13 |
| AC-24 | Raw captures are gone after `purge_at` | R-REF-17 |
| AC-25 | Every Detailed layer has a DESIGN.md, tokens and a kit decision in the decision log | R-DS-1, R-DS-2 |
| AC-26 | Every UI ticket has exactly one component_ref that is a valid yravg slug or a GAP id | R-DS-3, R-DS-4 |
| AC-27 | A copied ticket prompt contains the component slug, its install line and the DESIGN.md rules | R-DS-6 |
| AC-28 | A breakdown with a ticket that has no required criterion is rejected with the ticket id named | R-VER-1 |
| AC-29 | `studio start` on a ticket whose criterion already passes flags that criterion | R-VER-2 |
| AC-30 | `studio verify` traffic (captured by a proxy in test) contains no file contents | R-VER-3, R-VER-4 |
| AC-31 | A ticket becomes Lulus only when all required criteria pass on a commit with `Refs: <ticket>`; a missing test gives Gagal "tes tidak ditemukan" | R-VER-5 |
| AC-32 | After a passing run, a ReviewRun exists whose input is the diff and criteria only | R-VER-6, R-VER-7 |
| AC-33 | The matrix shows a requirement verified only when all linked required criteria passed and review did not fail | R-VER-8 |
| AC-34 | `next_ticket` returns the first ticket with all blockers Lulus | R-VER-10 |
| AC-35 | Every agent run appears in Agent Inbox and accepts a steering note | R-AGT-1, R-AGT-2 |
| AC-36 | A generated plan lists benchmark-before first, benchmark-after last, and pyramid ticket order | R-KEEP-1, R-KEEP-2 |
| AC-37 | Frontend tickets are locked until the Canvas step is approved | R-KEEP-5, R-KEEP-6 |
| AC-38 | For the approved paid-launch offer, sandbox QRIS payment activates exactly the purchased duration and allowance, once | R-PAY-1, R-PAY-2, R-PAY-4 |
| AC-39 | A forged-signature notification is rejected and logged; plan unchanged | R-PAY-3 |
| AC-40 | Replaying the same settlement notification does not extend the pass | R-PAY-4 |
| AC-41 | `expire` / `cancel` / `deny` leave the plan unchanged | R-PAY-5 |
| AC-42 | Reaching the Free reference limit blocks with a message naming the limit | R-PAY-7 |
| AC-43 | `/syarat` and `/privasi` (names TO CONFIRM) return Bahasa pages | R-LANG-4 |
| AC-44 | Dashboard pack requirements each cite a GB-nn method id | §8.1 |
| AC-45 | Project control plans include the CPM and DCMA property tests and AC-PC-1…8 | §8.3 |
| AC-46 | Financial module 1 items carry TO VERIFY until a reviewer clears them; module 2 plans include AC-FIN-6…8 | §8.4 |
| AC-47 | Engineering plans list every FR-ENG requirement with its ENG-T ticket and T-<module>-###-n tests (§8.2.8), and no generated ticket imports xeokit or LibreDWG | §8.2 |
| AC-48 | With GitHub Actions disabled, the gate runs on the VPS (or by hand), refuses a deploy of a ref with a red gate, and writes the `Evidence:` trailer | R-KEEP-7 |
| AC-49 | S07 shows the project-principles block at Simple, Detailed and Expert; there is no new depth and no new onboarding wizard for principles | R-PRI-1 |
| AC-50 | A principles edit is a Proposal on S08; it cannot silently change accepted principles, and accepting it does not overwrite AGENTS.md or the plan's stack or kit | R-PRI-2, R-PRI-3, R-EDT-1 |
| AC-51 | An add-feature increment is reviewed on S08 in the same living spec, remains valid without a Git feature branch, and does not create a second project or regenerate unchanged layers | R-EDT-9 |
| AC-52 | Previously accepted requirements stay unchanged when a feature is added, unless a separate Proposal that changes those requirements is accepted | R-EDT-10 |
| AC-53 | S18's post-build gap check lists the evidence examined and any missing inputs before findings; a run with no connected repository or otherwise missing evidence is not reported as “no gaps found,” and an untested requirement is not a pass | R-VER-11 |
| AC-54 | Unmet behaviour from a gap check can be appended only as tickets proposed on S08 and accepted into S15; the check cannot silently edit requirements, the plan or code, and cannot mark a requirement verified | R-VER-11, R-VER-8 |
| AC-55 | The workspace first slice imports only a user-selected entitled PNG, JPEG or WebP; cancelling sends no job; a retry does not duplicate a completed reference; no silent screen or filesystem read occurs | R-WS-2 |
| AC-56 | Generating alternatives leaves the accepted baseline unchanged, including on partial failure or cancellation; a newly inferred token is not confirmed without acceptance | R-WS-5, R-WS-6 |
| AC-57 | A stale workspace review item cannot be accepted without re-evaluation; dismissal remains available | R-WS-7 |
| AC-58 | A coding handoff download includes only selected accepted revisions, excludes pending alternatives, and does not change that bundle's manifest if the frame is later edited; the handoff is not an execution command | R-WS-8 |
| AC-59 | In this workspace slice, local-capture, local-execution, live MCP and collaboration actions do not appear as working controls | R-WS-3, R-WS-12 |
| AC-60 | A repo-UI / DESIGN.md extraction is a Proposal, is labelled documented-method rather than runtime-verified, and is not auto-accepted. No protected brand or unlicensed source is copied. Any licensed component reuse follows R-REU; no whole OpenDesign fork or automatic codebase refresh is implied (Q-30) | R-DS-7, R-DS-8 |

---

### 10.1 Consolidation acceptance tests

These are test specifications, not executed app results. Every test needs fixture IDs, an observable result, and a command when the implementation source is selected. All new runtime tests are currently **untested**.

| ID | Given / when / expected result | Requirements | Screen | Task |
|---|---|---|---|---|
| AC-SPK-1 | Given an accepted project, visit all eight stages. Order stays fixed, current stage changes, project/revision stays visible, and no visit marks a stage ready or starts execution/spending. Deployment with missing required tests stays blocked. | R-WF-1–3,6–7 | S35,S37 | SPK-T-02,08 |
| AC-SPK-2 | Open Spec, DESIGN.md, a reference, and board tabs. Select frame F7 at 80% zoom, pan, switch to Backend, then Design, then reload after save. Same project, tabs, frame, viewport, and panel state return. Another project does not inherit them. | R-WF-5,R-CAN-1,3,6 | S35,S29 | SPK-T-03 |
| AC-SPK-3 | Accept requirement revision R8 after testing R7. Linked frontend/backend/integration artifacts, criteria, and readiness show needs review. The R7 report remains readable and cannot verify R8. | R-WF-4,R-EVD-1,6 | S08,S18,S35 | SPK-T-03,07 |
| AC-SPK-4 | Import a screenshot and an editable prototype. Only the prototype offers element edits. Change one region, inspect whole-frame diff, Undo, then accept. Untargeted accepted frames stay unchanged; stale edits refuse acceptance. | R-CAN-2,4–5,R-WS-7 | S29,S32,S33 | SPK-T-03,04 |
| AC-SPK-5 | Use keyboard alone to open a frame, select a target through its layer/list alternative, edit text, cancel with Escape, and return focus. In Interact mode a button runs the preview instead of selecting its parent. Behavior contract names all missing states. | R-CAN-7–8 | S29,S32,S35 | SPK-T-04 |
| AC-SPK-6 | Choose a text-only model for a vision job or a missing rate card for paid Hosted. Submission refuses with the exact mismatch. Switching model leaves selected frames/design-system intact. | R-MOD-1–3,5 | S36 | SPK-T-05 |
| AC-SPK-7 | Auto routing cannot silently switch provider or exceed authorized cost. Allowed fallback logs its model/reason. The review record names its actual vendor and discloses a same-vendor fallback. Local agent is marked deferred and has no working connection flow. | R-MOD-1,4–5,11 | S36,Agent Run | SPK-T-05 |
| AC-SPK-8 | With a synthetic 100-unit cap and two simultaneous 60-unit reservations, at most one is authorized. Final settlement releases unused units. Duplicate callback/retry does not charge again. These fixture units are not a pricing offer. | R-MOD-6–8,10 | S36,S26 | SPK-T-06 |
| AC-SPK-9 | Cancel after partial provider usage. Show consumed, released, and pending amounts separately. BYOK has no hosted-credit debit. Unknown provider cost stays pending. No auto-top-up runs. | R-MOD-8–10 | S36,S26 | SPK-T-06 |
| AC-SPK-10 | An action returns success but a callback leaves the value unchanged. The requirement fails its postcondition. With no report, show untested/evidence missing, never no gaps. A later failed step yields a partial report, not claimed rollback. | R-EVD-1–3,R-VER-11 | S18,S37 | SPK-T-07,08 |
| AC-SPK-11 | Export accepted frame A3/spec R8/build B4 and proposed follow-up gaps. Bundle manifest includes only accepted selections and their hashes; later A4 does not change it. Gaps appear as proposed until accepted on S08. | R-EVD-4–6 | S34,S25,S08 | SPK-T-07,08 |
| AC-SPK-12 | A viewer attempts mutation, generation, budget change, key read, and cross-project export via direct API IDs. All refuse. A hostile prototype cannot read parent session or secrets; secrets are absent from prompt, log, and export fixtures. | R-SEC-1–5,R-MOD-9 | S35,S36,preview | SPK-T-09 |
| AC-SPK-13 | Using copies of existing Studio board fixtures, migrate and reopen/export. Stable IDs, frame revisions, coordinates, notes, and links survive. Rollback recovers the original fixture. No existing production board is modified by this test. | R-CAN-9 | S29 | SPK-T-01 |
| AC-SPK-14 | At 1440, 1024, and 390 widths, the stage/menu/tab focus order is usable, labels do not overlap, and 390 uses frame list/viewer. Reduced motion stops decorative loops. Status remains understandable without color. | R-WF-8,R-CAN-8 | S35,S29 | SPK-T-02 |
| AC-SPK-15 | Disconnect during save and generation. Show pending/failed state, preserve local draft and accepted baseline, recover without duplicate job/charge, and reauthorize after session expiry. Conflicting saves require review. | R-CAN-6,R-SEC-6,R-MOD-8 | S29,S35,S36 | SPK-T-03,09 |
| AC-SPK-16 | Generate one fixture project per domain. All baseline requirement IDs and linked pack criteria remain present; financial/stock source/license/reviewer gaps stay visible. Complete one fixture chain through release readiness with recorded build/test evidence. No deployment occurs. | §8,R-EVD-1–6,R-WF-6 | S07,S15,S18,S37 | SPK-T-10 |

## 11. Build tickets (Enrico's ship order)

Historical T-ID groups below retain their original labels for traceability. The current stage header and release-readiness order is Planning → Specification → Design → Frontend → Backend → Integration → Testing → Deployment. §11.1 defines the consolidation slices. TestSprite is an optional test tool, not proof of passing tests. Local-execution tickets are later-adapter scope, not browser-MVP commitments.

### 11.1 Consolidated delivery plan for v0.2.0

The prior T-101–T-606 IDs remain work references, not claims of completion. The header stage order replaces the earlier displayed Deploy-before-Testing sequence. Deploy-to-staging setup may occur during development; release readiness requires testing evidence before production deployment approval. Test definitions accompany every implementation slice, not only a final testing phase.

| Slice | Scope and deliverable | Gate | Deferred |
|---|---|---|---|
| M0 Baseline and design | Audit actual Studio, preserve board data, approve revised header/tabs/canvas shell, set benchmark budgets and commercial decisions | Reuse map, migration test plan, revised drawings accepted | No code changes in this documentation task |
| M1 Browser workspace | Existing infinite canvas + persistent header/artifact tabs + linked spec/proposals + manual/imported evidence | Cross-stage/reload persistence, approval, permission, and export tests pass | No local-project integration |
| M2 Model and commercial foundation | Hosted/BYOK capability registry, explicit context, estimate/reserve/settle ledger, budgets, owner spending | Race/retry/cancel/security tests; approved prices before paid checkout | No auto-top-up or unapproved team plan |
| M3 Full delivery contracts | Frontend/backend/integration contracts, task dependencies, tests, build evidence, gap review, release readiness | End-to-end fixture links accepted requirement to frame/task/test/build/release; no false pass | No deployment executor |
| M4 Pack validation and hardening | Dashboard, CAD/BIM, project control, financial/stock pack fixtures; accessibility, security, recovery | Existing pack criteria plus new shell/ledger/evidence tests pass | Legal/data-license gaps remain blockers for affected modules |
| Later adapters | Local CLI/agent/MCP, local-app canvas, repository writeback, deployment connectors, expanded team roles | Separate architecture, security, and explicit action approvals | Not part of browser MVP |

Target scope covers the full lifecycle now as contracts and evidence. M1 is the first usable delivery slice, not a promise that M1 implements every full-lifecycle automation.

| Task ID | Deliverable | Existing task links | Acceptance IDs |
|---|---|---|---|
| SPK-T-01 | Audit actual Studio and reversible board reuse plan | T-104, T-111 | AC-SPK-13 |
| SPK-T-02 | Revised shell and stage/artifact information architecture | T-106, T-112, T-201 | AC-SPK-1, 2, 14 |
| SPK-T-03 | Canvas/artifact persistence and draft recovery | T-205, T-206, T-401 | AC-SPK-2, 3, 4, 15 |
| SPK-T-04 | Behavior contracts and targeted-edit review | T-208, T-209 | AC-SPK-4, 5 |
| SPK-T-05 | Model capability registry and routing/source UI | T-211, T-305 | AC-SPK-6, 7 |
| SPK-T-06 | Atomic allowance ledger, estimates, caps, reconciliation | T-212, T-311, T-312 | AC-SPK-8, 9 |
| SPK-T-07 | Pinned handoff, evidence, actual-state checks, gaps | T-210, T-309, T-405 | AC-SPK-10, 11 |
| SPK-T-08 | Frontend/backend/integration/release contracts | T-305, T-407, T-606 | AC-SPK-1, 10, 11 |
| SPK-T-09 | Roles, secret isolation, preview sandbox, audit | T-301, T-302, T-504 | AC-SPK-12, 15 |
| SPK-T-10 | All-pack regression and full-lifecycle fixture | T-107, T-604, T-605 | AC-44–47, AC-SPK-16 |



### Phase 1 — Planning

| ID | Ticket | Owner |
|---|---|---|
| T-101 | Run validation interviews V1–V6 (§1.2); write findings | Product Desk |
| T-102 | Decide Free/Paid limits and IDR prices (§7.8.1) | Product Desk |
| T-103 | Confirm product name and "Spec" vs "PRD" | Enrico / Launch Desk |
| T-104 | Repo audit: yravg repos, why yraveragehub and studio stalled; write §12 | Build Desk |
| T-105 | Define the yravgbuilder export contract (R-KEEP-4) and the canvas-to-app step; needs canvas-to-app source location (Q-11) | Build Desk / Enrico |
| T-106 | Design Desk maps §7.4.3 screens; confirm/close GAP-01…29 (done in Design v0.1; S26 scope pending Q-29) | Design Desk |
| T-107 | Pack reviews: Enrico (D-PC), CAD/BIM Desk owns D-ENG (merged v0.1.2; merge its Activity/Schedule/CostItem with D-PC entities), reviewer TBD (D-FIN modules 1–2), Gus Bavia method mapping check (D-DASH) | Product Desk |
| T-108 | Clean-room wording, thresholds, retention; Terms and Privacy in Bahasa | Launch Desk |
| T-109 | Signed-in NPA/DPAI tour with Enrico's OK in a 1:1 chat, to clear TO VERIFY items | Enrico / Grabber |
| T-110 | Write domain question banks for the interview (four domains) | Product Desk + pack owners |
| T-111 | Benchmark-before plan (interview latency, generation time, page loads) | Build Desk |
| T-112 | Canvas step for our own screens (canvas-to-app) and approval | Design Desk |

### Phase 2 — Frontend

| ID | Ticket | Component |
|---|---|---|
| T-201 | App shell, i18n (`id`/`en`), tokens from DESIGN.md | `screens/app-shell` |
| T-202 | Landing, pricing (from Plan data), Bahasa Terms/Privacy | `blocks/pricing-plans` |
| T-203 | Onboarding: domain picker + idea box | GAP-01 |
| T-204 | Interview UI + decision log + pitch card | `screens/agent-chat`, `components/ask-panel`, GAP-05, GAP-06 |
| T-205 | Spec document view with depth switch | GAP-02 |
| T-206 | Proposal review (per-hunk, stale) + revision history | GAP-03, GAP-04 |
| T-207 | Reference: gate, capture run, recording review, FR inventory review, refusal panel | `components/soft-gate`, `screens/agent-run`, GAP-07, GAP-08, GAP-09 |
| T-208 | Design system page | GAP-10 |
| T-209 | Ticket board + ticket detail with criteria | `blocks/task-board` |
| T-210 | Traceability matrix, verification + review report, ADRs + glossary | GAP-11, GAP-12, `components/definitions-table` |
| T-211 | Agent inbox, run view, steering, trace | `components/agent-inbox`, `components/agent-steering`, `components/trace-waterfall` |
| T-212 | Settings, billing, usage, QRIS checkout UI | `screens/settings-billing`, `components/usage-meter`, GAP-13 |
| T-213 | Static gates: strict TS, plain-Node rule runner, comment ratchet (D1, D3) | — |

### Phase 3 — Backend

| ID | Ticket |
|---|---|
| T-301 | Auth (Better Auth: email + Google) |
| T-302 | Schema for §9 entities (Drizzle, reversible migrations) |
| T-303 | Proposal / Diff / Revision service; no write path outside it (AC-9) |
| T-304 | Interview engine: question banks, recommended answers, decision log, stop rule, pitch proposal |
| T-305 | Detailed generator: EARS requirements with basis refs, plan, DESIGN.md/tokens, vertical-slice ticket breakdown |
| T-306 | Expert generator: ADR rule, glossary, matrix queries |
| T-307 | Domain pack loader and versioning |
| T-308 | Reference pipeline: gate record, robots/AI-signal checks, capture with path abort, recording key frames + redaction, FR inventory, captions, clean-room checks, purge job |
| T-309 | Verification API: start check, verify, drift, evidence links |
| T-310 | Independent review service (server mode) + local-mode verdict intake |
| T-311 | Usage counters and limits |
| T-312 | Plans, subscriptions, payments; Midtrans notification handler |
| T-313 | API tokens, device-code login, MCP server (`get_ticket`, `next_ticket`, `verify_ticket`) |
| T-314 | In-app agent eval set + score ratchet |
| T-315 | Property tests: accept twice = same result; revert restores hash; depth switch is lossless |

### Phase 4 — Integration

| ID | Ticket |
|---|---|
| T-401 | Wire frontend to API; remove fixtures |
| T-402 | CLI: `login`, `pull`, `start`, `verify`, `review --local`, commit trailer helper |
| T-403 | GitHub Action template for verify on push |
| T-404 | **Midtrans sandbox QRIS on localhost**: Snap token from the local server; expose the notification URL through a tunnel (cloudflared or ngrok) set in the Midtrans sandbox dashboard; pay with the sandbox QRIS simulator; prove AC-38…41, including a forged-signature POST and a replayed notification |
| T-405 | Export: Markdown, zip, AGENTS.md brief; yravgbuilder once T-105 lands |
| T-406 | Email: expiry reminder, receipt |
| T-407 | End-to-end smoke: onboarding → interview → pitch → Detailed → tickets → start → verify → review (fixture repo) |

### Phase 5 — Deploy

| ID | Ticket |
|---|---|
| T-501 | Dockerfile(s); Coolify app on VPS; Postgres with daily backups |
| T-502 | Domains, TLS, secrets in Coolify (not in repo) |
| T-503 | Midtrans production keys behind a flag; production notification URL |
| T-504 | Private object storage for reference packs; purge job scheduled |
| T-505 | Error tracking, uptime check |
| T-506 | Gate workflow; auto-merge only when all gates pass (D4); `Evidence:` hook (D2) |

### Phase 6 — Testing (TestSprite)

| ID | Ticket |
|---|---|
| T-601 | TestSprite run on staging: onboarding, interview, editing, reference, verification, billing |
| T-602 | UI property run (Bombadil-style): long text, unicode, paste, undo/redo in the spec view and interview |
| T-603 | Clean-room set: 10 public references incl. robots-blocked and login-redirect fixtures; AC-16…24 |
| T-604 | Pack fixtures: CPM network, DCMA fixture, EV roll-up, NPV fixture, PoC/retention fixture, stock sample dataset; IFC fixtures per ENG-T-00 (Bexel samples are test-only until ENG-Q8 clears) |
| T-605 | Benchmark-after vs T-111; before/after table |
| T-606 | Human review of evidence (reports, screenshots, bench table); go / no-go |

v0.2.0 maps the approved principles, add-feature cycle, post-build checks, design-system folds, and R-WS into SPK-T-02–10. The engineering companion remains preserved unchanged. T-402/T-403/T-313 local execution and live MCP are later-adapter scope; phase labels are not authorization to run them.

---

## 12. Architecture and existing-Studio boundary

### 12.1 Product location decision

Enrico's 22 Nov 2026 request specifies a **revamp of existing yravgHub Studio**. The old audit's suggestion to build inside Solvarium is no longer the default product-location recommendation. No repository, framework migration, database replacement, or hosting change is approved by this PRD revision.

The earlier audit recorded Hub Studio/hub-build work only on Enrico's ROG computer. That is a dated finding, not evidence of today's pushed or deployed state. Enrico's current report of a working infinite canvas takes precedence as product context, but does not prove which branch or runtime supplies it. This task made no clone, code audit, repo edits, or registered-computer changes.

### 12.2 Reuse before architecture changes

SPK-T-01 must identify the actual Studio repo/branch, unpushed differences, deployed revision, canvas/frame schema, auth boundaries, model clients, token system, billing hooks, and export paths. Produce a reuse/change/remove map and reversible migration plan before implementation. Do not delete working canvas behavior because an older spec assumed a new app.

The owner now selects a Rust-first application core with a TypeScript/JavaScript browser UI and no Python product dependency. Preserve working Studio canvas/UI and proven compatible dependencies; Rust-first is not permission to rewrite them wholesale. The earlier Next.js/Better Auth/Drizzle and Vite/React/Node prescriptions are historical options, not mandated backend stacks. Q-26 now covers the audited Rust boundary, existing integration reuse, and staged migration. Exact crates and deployment topology remain proposed.

### 12.3 Logical services, not an adopted deployment diagram

The target has project/artifact/revision storage, Proposal acceptance, canvas state, model routing, a usage ledger, private reference storage, job processing, evidence ingestion, and export manifests. These can be modules in existing Studio. This PRD does not mandate microservices, a daemon, an OpenDesign fork, a desktop shell, or a new database.

Browser-first MVP uses permitted file upload, browser-hosted generation where configured, and explicit file handoff. Local files, localhost browsing, CLI adapters, MCP mutation, GitHub writes, and deployment execution remain deferred. Stage navigation does not grant these capabilities.

### 12.4 Risks and controls

| ID | Risk | Required control |
|---|---|---|
| RK-01 | Prior audit found GitHub Actions billing failures | Recheck during authorized engineering work. A missing gate cannot be recorded as passed. Keep permitted manual/VPS gate evidence if still needed. |
| RK-02 | Current Studio work may be local/unpushed | Audit the owner-selected source before changes. Do not overwrite or infer a missing implementation. |
| RK-03 | Eight-stage scope is mistaken for an autonomous IDE | MVP exports contracts and handoffs. Execution adapters are separate decisions. |
| RK-04 | Model prices or vendor plans change | Use rate-card versions and source dates. Do not hard-code vendor promotions. |
| RK-05 | Canvas, spec, and artifact tabs diverge | Stable artifact IDs, revision pins, saved state, and conflict tests. |
| RK-06 | Untrusted prototypes or references access secrets | Sandboxing, server authorization, scoped AI context, and secret-redaction tests. |
| RK-07 | Specialist packs disappear during a UI revamp | Preserve all baseline IDs and run pack-coverage checks before acceptance. |

## 13. Open questions and decisions

| ID | Question | Owner | Needed by |
|---|---|---|---|
| Q-01 | Fifth "General app" domain, or do the four cover every idea? | Product Desk | T-102 |
| Q-02 | Product name; "Spec" vs "PRD" for the artifact | Enrico (Product Desk / Launch Desk) | T-103 |
| Q-03 | Approve new Free/BYOK/Hosted structure, limits, IDR prices, and credit conversion; old §7.8.1 amounts withdrawn as defaults | Product Desk | T-102 |
| Q-04 | Auto-renew: 30-day passes only, or tokenised GoPay/card renewals? | Product Desk | T-312 |
| Q-05 | Midtrans methods beyond QRIS at launch (GoPay, VA, OVO, DANA, ShopeePay) | Product Desk | T-312 |
| Q-06 | Clean-room thresholds (≤ 4-word labels, ≥ 8-word overlap) and raw capture retention (30 days) | Launch Desk | T-108 |
| Q-07 | Confirm/close GAP-01…28; fill §7.4.3 **Closed v0.1.4.** Answered by Design v0.1 (GAPS.md, COMPONENT-MAP.md); the catalogue count is reconciled in M6 (per Design Desk, relayed by Grok Bot, 19 Nov 2026) | Design Desk | closed |
| Q-08 | Reference input in the onboarding box, or only after the first pitch? | Product Desk | T-203 |
| Q-09 | Is a token viewer among the 42 Foundations items? | Design Desk | T-208 |
| Q-10 | yravgbuilder export: transport (file, MCP, CLI) and whether `AREA-NNN` rows replace our ticket ids in the export (definition now known, §7.7.2) | Build Desk / Enrico | T-105 |
| Q-11 | canvas-to-app: where is the plugin source? Push it into `yra-skills` (audit decision 6)? | Enrico | T-112 |
| Q-12 | D-PC defaults (progress weights, review codes, review days, vendor document offsets, punch categories) and any client/regulator codes. Also from Template Desk: add a "started / internal check" progress step and hold weights in the rule-of-credit set? Shift forecast dates by the review period on a code 3 return? | Product Desk (Enrico) | T-107 |
| Q-13 | D-FIN: keep corporate finance, or refocus on contractor project finance? **Closed v0.1.2:** refocus approved (S10: approved by Enrico in the Etsy Launch: Build room, 17 Nov 2026, as reported by Template Desk and Grok Bot). Reviewer still unnamed (T-107) | Enrico (Product Desk) | closed |
| Q-14 | Bundle with another yravg product? (Do not lead with it [CMP §2]) | Launch Desk | after V2 |
| Q-15 | Models, BYOK, cost per spec in IDR; review on a different vendor | Build Desk | T-305 |
| Q-16 | Read NPA's signed-in `/plan` (needs Enrico's OK in a 1:1 chat)? | Enrico | T-109 |
| Q-17 | Product location resolved to revamp existing yravgHub Studio per 22 Nov request. Exact repo/branch, unpushed state, deployment revision, and reuse map still require audit. Solvarium is not the selected migration target | Enrico / Build Desk | T-104 |
| Q-18 | Launch channels (Indonesian Discord/WhatsApp/YouTube, Etsy listing) | Launch Desk | after V2 |
| Q-19 | Allow public YouTube / Drive links as recordings? Prefer official `.md` / `llms.txt` twins over screenshots for text facts? [REF §11] | Product Desk | T-308 |
| Q-20 | Independent review default: server mode (diff sent, opt-in) or local mode (user's key)? | Product Desk / Build Desk | T-310 |
| Q-21 | v0.2.0 uses eight workflow stages as navigation and labels while retaining dependent vertical slices. Confirm any alternative generated-plan presentation before changing it. | Product Desk / Build Desk | T-305 |
| Q-22 | Interview stop rule (12 questions) and question-bank size per domain | Product Desk | T-110 |
| Q-23 | Engineering pack open questions ENG-Q2…ENG-Q17 (companion §18) and the human licence review (pack L11) | CAD/BIM Desk / Enrico | T-107 |
| Q-24 | 2D PDF takeoff (FR-ENG-QTO-011…019): v1 or v2? The pack draft says v2 (ENG-Q1) | Enrico | T-107 |
| Q-25 | Schedule generator (FR-ENG-4D5D-025…028): how far does it overlap Solvarium Intelligent Scheduling (SOL-IS)? One shared engine, or does the pack call Solvarium? (ENG-Q4) | Enrico | T-107 |
| Q-26 | Rust-first core and TS/JS UI are owner directions. Audit exact Studio reuse boundaries, Rust crates, contracts and a non-destructive staged migration; do not rewrite the working frontend | Enrico | T-104 |
| Q-27 | Fix GitHub Actions billing, or keep the gate on the VPS (R-KEEP-7, RK-01; audit decision 2) | Enrico | T-111 |
| Q-28 | Accent colour: Design Desk proposes clay `#B4532A`, scoped to Studio; the earlier Solvarium comparison used teal `#0A7473` (Design v0.1 HANDOFF §5 Q-DD-01; the audit also saw navy in places). Spec picks neither; clay stays Design's working default until Enrico decides | Enrico | T-208 |
| Q-29 | S26 Plan control: confirm or overrule Design's PROPOSAL (per Design Desk, relayed by Grok Bot, 19 Nov 2026): S26 shows the build plan of the user's app (tickets planned vs done, credits budgeted vs spent), and the user's project schedule and cost views stay in the Project control pack. Design's proposal is the default until Enrico decides | Enrico (Product Desk) | T-106 |
| Q-30 | Which exact OpenDesign units, if any, merit selective compatible-licensed reuse after per-file/transitive review, and whether broader codebase-refresh/plugin architecture is needed. Eligible component reuse is allowed/preferred under R-REU; a whole fork, desktop stack or automatic refresh is not approved. | Enrico | — |
| Q-31 | Frame-workspace generation provider, storage contract, and any later share-link or cross-device sync behaviour. The eight-screen flow is approved (S13); provider/storage are still required before implementation, which this approval does not authorize. Model vendor names from the reference product are not adopted. | Enrico | — |

| Q-32 | Exact hosted/BYOK providers, rate cards, credit conversion, margin, cap defaults, refund policy, renewal, and team billing unit | Enrico | Before paid build |
| Q-33 | Revised S35–S37 drawings and mapping of existing Studio components and persistence | Enrico / design review | Before implementation |
| Q-34 | Board limits, latency, storage retention, regional data transfer, backups, recovery objectives | Engineering audit / owner | Before implementation acceptance |

---

## 14. TO VERIFY register

| # | Item | Why |
|---|---|---|
| TV-01 | Spekin working name used for this consolidation; final public brand/domain and artifact terminology remain owner decisions | Undecided (Enrico) |
| TV-02 | NPA live `/plan` flows (clarifying questions, PRD chapters, versioning, task creation) | Only mocks, npm README, YouTube [NPA:GAPS.md] |
| TV-03 | NPA live prices and checkout (Midtrans Snap, BSI transfer, QRIS at the till) | Cards did not render [NPA:GAPS.md; CMP §2] |
| TV-04 | NPA sign-in methods beyond Google | Only Google seen (FR-NPA-037) |
| TV-05 | DPAI signed-in canvas, DESIGN.md/token editor, export, payment provider | Not captured [DPAI:GAPS.md] |
| TV-06 | DPAI ↔ NPA handoff and bundle activation | Only the empty-link state seen |
| TV-07 | CodeGuide live planner, question count, generated docs | Gated [inputs/codeguide-HANDOFF.md] |
| TV-08 | BrainGrid signed-in app and how Verify scores | Signup not opened (FR-BG-028) |
| TV-09 | yravg UI Foundations coverage of a token viewer (GAP-10) | Not in llms-full.txt |
| TV-10 | yravgbuilder plugin definition resolved v0.1.2 from the repo audit (§7.7.2) | `yra-skills/yravgbuilder` v0.1.1 [audit §(d)] |
| TV-11 | canvas-to-app: definition known (§7.7.3); **source location pending Enrico** | In no GitHub repo [audit §(d)] |
| TV-12 | D-ENG items the pack marks **assumption** or "proposed, to verify in spike" (IDR default, tolerances, perf thresholds, `Qto_*` in viewer, BCF colour/clip restore) | CAD/BIM Desk pack §19; spikes ENG-SP-1…4 |
| TV-13 | D-FIN module 1 (REQ-FIN-004…015): PSAK 72 basis, PPN/PPh rates, all depth until a finance reviewer clears it | No source on box; reviewer unnamed |
| TV-14 | D-PC client/regulator-specific codes | Need Enrico |
| TV-15 | Clean-room legal wording and thresholds | Launch Desk / legal |
| TV-16 | D-FIN module 2 sources: IDX reports and announcements, company IR PDFs, end-of-day price feed — terms of use for a paid product | Not checked (§8.4.5) |
| TV-17 | Whether OJK rules on investment advice / investment content apply to the stock module | Legal check (§8.4.6) |
| TV-18 | oyenza.trade study "under the owner's permission" | Template Desk statement only |
| TV-19 | Existing Studio infinite canvas, exact repo and deployed revision | Owner-reported; no code/runtime audit in this task |
| TV-20 | OpenDesign exact current price/credit offer and billing unit | Official homepage, pricing FAQ, and README disagree; no checkout/session inspected |
| TV-21 | OpenDesign infinite canvas absence | Not established; official Studio screenshot shows tabs/preview, not proof of absence |
| TV-22 | Onlook/UI SDK video frames and timestamped actions | Prior studies used transcript and docs; not visually verified |
| TV-23 | Runtime of new model, ledger, header, and canvas requirements | Specified here; not implemented or tested |

---

## 15. Sources

| Source | Where |
|---|---|
| NPA pack | `/workspace/grab/ngodingpakeai/` (HANDOFF.md, PRD.md, INVENTORY.md, GAPS.md); Drive 1t0w_x2j-Cm5DZ-bZI7nEs7UZ7kxSmpAR |
| DPAI pack | `/workspace/grab/desainpakeai/` (HANDOFF.md, PRD.md, FEATURE-INVENTORY.md, GAPS.md, research/web/api_api_billing_plans.json); Drive 1kVXWVAVisSW2Tt5PZ4KXM1j4Pkjl_TQa |
| CodeGuide HANDOFF / PRD / PARITY | Drive 1l6VmJQKyJqa3pJ9ed5BoB_Gzb1mB2N8L, 1CDM8tEnkXhfvD0FPekcISb_5BQkaUQWI, 19jxbrxdx716DsuSHrDQS4Q9aJ2fmGAhH; box `inputs/codeguide-*` and `/workspace/grab/codeguide/` |
| BrainGrid inventory | `/workspace/grab/braingrid/INVENTORY.md` (FR-BG-001…028) |
| Taskmaster inventory | `/workspace/grab/taskmaster/INVENTORY.md` (FR-TM-001…023) |
| PRD-tool comparison v2 | Drive 1oWLYFhaYRXu0kMGm08-gXuDTCq9beJ0K (PDF 1w6RipeO-oOzI8oefeFoAXJl_r0EDeq8h); box `inputs/COMPARISON-v2.md` |
| SPEC-START-FROM-REFERENCE | Drive 1ukaKCBp8dtVuC68tRV5mdy21NKwgWHVr; box `inputs/SPEC-START-FROM-REFERENCE.md` |
| Method note (Pocock, Vercel) | Drive 1V2oFoMAdRiGHJDjF3-7re4uEPpQTBwiX; box `inputs/POCOCK-VERCEL.md` |
| Vercel, "What is spec-driven development?" | https://vercel.com/i/spec-driven-development (published 26 Oct 2026; updated 9 Nov 2026) |
| Vercel Academy, "Write the Supported Spec" | https://vercel.com/academy/creating-a-software-factory/write-the-supported-spec |
| Vercel, software factory with eve | https://vercel.com/kb/guide/eve-software-factory |
| Matt Pocock skills | https://www.aihero.dev/skills-grill-me, https://www.aihero.dev/skills-to-spec, https://www.aihero.dev/skills-to-tickets |
| yravg UI catalogue | https://uiux.yraveragehub.io/llms-full.txt (live, 17 Nov 2026) |
| Gus Bavia methods | `/workspace/gusbavia/PATTERNS.md` |
| Poteto pyramid | `/home/box/agent-data/workflows/yravg-trust-ladder/SKILL.md`; `/workspace/grab/nod/repos/yravgSolvarium/docs/POTETO-PYRAMID.md` |
| canvas-to-app | `/workspace/research/yravgSolvarium/docs/plans/community-plugins-agent.prd.md` §11 |
| CAD/BIM scope, yrabuilder mention | `/home/box/agent-data/agents/79da4f08-035c-487c-a4e9-94e3c045b350/profile.json` |
| Engineering pack v0.1 (CAD/BIM Desk) | Drive 1-61R50ye1BKIiDxcs002TrEvoOXSew1J (folder 16GHwQgMrBqobcRvdHeppCkxiL_eU2UtE); box `inputs/engineering-pack-prd-v0.1.md`; companion `ENGINEERING-PACK-v0.1.md` |
| PRD Studio Design v0.1 (Design Desk) | Drive folder 1pz544Ku3x-8khIq8xZ6Kk03N5S-FGTHk: HANDOFF 1t1mxeLQ7VwlIvSOsyE30SL9F3moB0ZJQ, GAPS 1iFefkwte3wTTxrdqCnK2TBgsHLLaYuMQ, COMPONENT-MAP 1Hc5yEUCMibbOSpR4y1uqtxYCMKTwteV2 (COMPONENT-MAP and HANDOFF updated 19 Nov 2026); box `inputs/design-v0.1-*.md` |
| Template Desk pack review rev 3 | `/workspace/etsy-launch/prd-studio-packs/PACK-REVIEW-v0.3.md`; Drive 1uD9zhGzcEb3a-29yktBNwmDOFERx9Fuq (replaces rev 2, Drive 1Ar9cu9QIzakWASsiRJVGv-yvXC73TxnE) |
| yravg repo audit (Grok Bot, 17 Nov 2026) | Drive 19i2faPpr_bh5ZcJJj9ofuIiSsfnum_Cf (folder 1bKCgu10Niptl3z_lWg1n8db0lvNbU2nl); box `inputs/repo-audit-ARCHITECTURE-REFLECTION.md` |
| yravgbuilder | `/workspace/repo-audit/clones/yra-skills/yravgbuilder/` (README.md, CHANGELOG.md) |
| Spec Kit learn pack (21–22 Nov 2026; NOTES + approved D1–D3; not D4) | `/workspace/learn/7aUEjRw0yzk/` (`NOTES.md`, `SPEC-DELTA-PROPOSAL.md`); Drive folder 1FTZugadf1wm3RhGu3Q6je90z6A_7jmJv |
| Paraframe-inspired workspace pack (clean-room reference) | `/workspace/grab/UzwV9bPlAgA/`; Drive folder 184Chcy8LjWAxxu0TXgQuNU2qVnqTtoC2; parity map `FRAME-WORKSPACE-PARITY.md` |
| Browser-first frame workspace eight-screen flow (approved 22 Nov 2026, S13; originally written 21 Nov 2026; not a Design v0.1 replacement). Prior editable wireframes and PDF delivered 22 Nov 2026; v0.2.0 shell revision pending. Not an implementation approval. | https://docs.google.com/document/d/1ni_DhB6mIYthUK0adgQ9Q0jkxrSZ9Hn6/edit ; box `context/Browser-Frame-Workspace-Design-v0.1.md` |
| Design Desk Spec Kit UX delta proposal (21 Nov 2026; optional S07/S08/S18 alignment only; canonical design unchanged; D4 not applied) | https://docs.google.com/document/d/18lecBuedqdXet_P1NuIjc_PTTnXIAAyH/edit |
| Open Design documented method (identified public repo; no clone; not runtime-verified; license/architecture not adopted) | https://github.com/nexu-io/open-design (pinned `e033aad1d15a9d4084316e5223f2c6597fd32619`); `OPEN-DESIGN-RESEARCH.md` |
| Later research reconciled in v0.2.0 | Combined Onlook/UI SDK study informs behavior contracts and actual-state checks. Video frames remain unverified. Local runtime bridges and real-code canvas remain deferred. |

### 15.1 Consolidation sources checked 22 November 2026

- Latest source PRD v0.1.6: https://drive.google.com/file/d/1hF0u701x-POCnGGvPe0ck3fDmmE-3UwL/view . Newer than the v0.1.4 supplied pointer.
- OpenDesign identity and prior method research: https://drive.google.com/file/d/1LqHcCfHPgDD8BtLTgCAVcE20xV3_j5P0/view . Identified product is https://open-design.ai and https://github.com/nexu-io/open-design . Prior identification remains indirect from the Raf workflow, not a spoken repository URL.
- Official pages checked this run: https://open-design.ai/ , https://open-design.ai/pricing , https://raw.githubusercontent.com/nexu-io/open-design/main/README.md . Current-source claims, not runtime tests.
- Official Studio screenshot inspected: https://raw.githubusercontent.com/nexu-io/open-design/main/docs/screenshots/product-tour/studio-prototype-2026.webp . Static visual evidence for artifact tabs and Preview/Code toolbar only.
- Onlook official pages checked: https://onlook.com/ and https://docs.onlook.com/ . Official site explicitly describes an infinite canvas, working page frames, visual token/component tools, and variations. Not executed here.
- Combined Onlook/UI SDK proposal: https://docs.google.com/document/d/1n7KlYkl8EeT9SHxxJge6ngsSnibJA_n9T5SDIpwWsAs/edit . Video frames not verified.
- DesainPakeAI latest public refresh: https://drive.google.com/file/d/1e8I0j0Y8IJ_Aheezc-6mqfXyh7nVVzBy/view and handoff https://drive.google.com/file/d/1JaWamHUMj_klNWajlUQ7htlu7wnNi_Ex/view . Public/demo/CLI evidence; no signed-in project tour.
- Browser wireframes delivered: https://drive.google.com/file/d/1wJyGQP-ycDEWhoskWRtpsH49rxH3CsjA/view and PDF https://drive.google.com/file/d/1ICJkM9xBsJ79zhSySrLyR59QllNJGtS8/view . Archived copies in Spekin.
- Full source links and evidence classifications are in REFERENCE-MATRIX-v0.2.2.md. No competitor source code, brand, imagery, or license is adopted.

## 16. v0.2.1 decisions and evidence

This addendum is normative where it changes earlier v0.2.0 wording. Enrico asked at 6:50 PM Asia/Shanghai on 22 Nov 2026 to add alexandephilia/momo_genui and use mostly Rust without Python. At 6:51 PM he accepted TypeScript/JavaScript for the browser UI and requested animation/interaction quality. At 6:52 PM he required reuse of the existing repo and references instead of reinvention, except Spekin branding/taste and necessary integration/domain gaps. These directions do not authorize implementation in this task.

Momo is a useful workspace-navigation reference. Its README names three synchronized workspaces: Chat, Explore, and Pinboard. Its official Chat screenshot shows a compact centered Explore/Chat/Pinboard header with Chat active. The official Explore screenshot shows the same header with Explore active and different main content. The Pinboard screenshot shows a spatial board with Kanvas/Grid and zoom controls. This is static evidence of a workspace-selection pattern, not a live verification of navigation, animation, persistence, or browser history.

Checked repository main head: 311a0019c596f23faa2c3740f8425a04e259e51e. README, root listing, package.json and linked screenshots only were inspected. No clone, install, source behavior investigation, live demo interaction, or benchmark occurred. README/package metadata identify a Next.js/React/TypeScript app, not a Rust implementation.

License gate: GitHub reports license=null; the root listing contains no LICENSE file; README and package.json declare no license. Public visibility is not a reuse grant. No reusable repository license was established by this narrow inspection. Use Momo's functional navigation idea only; do not copy its source, mascot, imagery, decorative chrome, or animation assets without permission or a later verified compatible license. No license conclusion about its separately licensed dependencies is inferred.

Exact sources: https://github.com/alexandephilia/momo_genui ; https://github.com/alexandephilia/momo_genui/blob/311a0019c596f23faa2c3740f8425a04e259e51e/README.md ; https://github.com/alexandephilia/momo_genui/blob/311a0019c596f23faa2c3740f8425a04e259e51e/package.json ; screenshots at the same ref under docs/screenshots/01-chat-home.jpg, 02-explore-home.jpg, and 03-pinboard-canvas.jpg. Current metadata/root listing were checked with the sanctioned GitHub connector. No LICENSE URL is invented.

## 16.1 Header switches the stage workspace

Retain Planning → Specification → Design → Frontend → Backend → Integration → Testing → Deployment. Activating a header item switches the central stage workspace/main view within the same project shell. It is not merely a progress indicator, a new app, a new browser window, or a full-page reload. Momo provides the mode-switching pattern; Spekin uses its own accessible light header and eight lifecycle stages, not Momo's three labels or visual treatment.

The project, accepted spec revision, permissions, and active feature increment remain global. StageWorkspaceState is keyed by user + project + stage and contains board viewport/zoom, selected artifact/frame, open artifact tabs and tab order, active view, panels, draft references, and focus-return target. An artifact opened in several stages still has one stable artifact ID and revision lineage. Unsaved edits belong to that artifact, not duplicate stage copies. Shared accepted changes update all views and mark affected downstream work needs review.

R-WF-9: THE SYSTEM SHALL switch the actual stage workspace from the header without a document reload or destructive remount/reset of its state. It SHALL restore that stage's canvas viewport, selection, artifact tabs, panels, draft references, and valid focus target. Shared project/spec revision and permissions SHALL not change merely because a stage changes.

R-WF-10: THE SYSTEM SHALL preserve unsaved artifact edits when switching stages. It SHALL distinguish unsaved, queued, saved, conflict, and failed-save states. If leaving would lose a nonrecoverable draft, it SHALL offer stay, recover/save, or explicit discard; navigation SHALL never silently discard or auto-accept changes.

R-WF-11: THE SYSTEM SHALL provide permission-checked deep links for project/stage and optional stable artifact references. Browser Back/Forward SHALL restore workspace state without creating paid jobs or approval records. Unknown/deleted/forbidden targets SHALL show recoverable states. Draft text, provider keys, and private prompt content SHALL NOT be encoded in URLs.

R-WF-12: THE SYSTEM SHALL use keyboard-operable navigation with visible focus, an announced current stage, predictable focus after a view switch, and appropriate link/tab semantics. Workflow navigation, artifact tabs, and Preview/Code/Canvas/Document/Compare modes SHALL remain distinct. Navigating SHALL never mean approve, complete, verify, spend, or deploy.

S35 remains the shell; S29 remains the shared canvas. No new parallel navigation framework is required. Extend the existing router/state/component patterns once audited.

## 16.2 Rust-first core, no Python dependency

Feasible target: Rust owns API/business services, domain model, validation, canonical requirement/task/test traceability, revision/diff/change-control rules, authorization enforcement, documented provider-API adapters, background jobs, usage reservations/settlement, and future integration/test/release orchestration. Keep the existing TS/JS browser layer for React UI, canvas, DOM/accessibility, interaction, and motion. Reuse its proven components and contracts. Browser Rust/WASM is possible but a wholesale UI rewrite is unnecessary and conflicts with reuse-first delivery.

Proposed Rust building blocks, not audited Studio dependencies: Axum for HTTP, Tokio for async work, Serde for typed serialization, and an audited Rust database client for existing Postgres. Axum's official docs verify Tokio compatibility and Serde-based JSON extraction. Specific crate versions, security posture, license compatibility, persistence migrations, and auth integrations need implementation review. Node is allowed only where the existing frontend build/tool/test/preview runtime actually requires it; it is not the default application API/business server. Preserve existing auth/payment integrations through defined contracts rather than writing new auth or payment frameworks.

R-ARC-1: THE SYSTEM SHALL use Rust as the default application-core language for the listed business/API/domain/job/ledger responsibilities. Existing working modules SHALL be inventoried and retained or integrated before replacement; unavoidable transitional non-Rust core components SHALL be named, scoped, and reviewed in the migration plan, not silently treated as the final architecture.

R-ARC-2: SPEKIN SHALL introduce no Python dependency for its product runtime, installation, build tooling, product tests, migrations, document/prototype generation, or operational jobs. Backend tests SHALL use Rust tools; browser tests/tooling may use JS/TS. The dependency inventory and CI shall verify this boundary, including scripts, containers and generators. This is a product policy, separate from research tools used outside the shipped product.

R-ARC-3: THE SYSTEM SHALL keep the TS/JS browser UI thin in business authority but fully capable in interaction/accessibility. The Rust server SHALL remain authoritative for permissions, accepted revisions, validation and charges. UI validation SHALL not replace server validation. API schema/contract fixtures SHALL prevent Rust/UI drift.

R-ARC-4: THE SYSTEM SHALL add Rust-to-WASM only when a measured shared deterministic calculation or CPU-heavy workload justifies it. Existing JS canvas/motion libraries SHALL not be replaced solely to increase Rust percentage. The implementation plan SHALL measure workload, boundary costs, bundle/startup cost, and maintenance tradeoffs before adopting WASM.

R-ARC-5: THE SYSTEM SHALL integrate models through documented authorized provider APIs in current scope. Rust orchestration SHALL NOT imply access to a user's subscription CLI, local files, local agent, repository writes, or deployment privileges. Future adapters remain deferred and require their existing security/authorization decisions. Spekin may plan or orchestrate permitted tools for user projects in other languages, including Python; the no-Python rule applies to Spekin's own dependencies, not a ban on a user's project language.

R-ARC-6: THE SYSTEM SHALL prefer existing compatible-licensed tooling for browser automation, screenshots, PDF/export, and integrations. JS/TS tooling or a separately approved service is allowed without a Python dependency. Subprocess/service boundaries SHALL have timeouts, cancellation, resource limits, provenance and privacy controls. External transfers SHALL not be introduced merely to avoid writing an adapter.

Tradeoffs: Rust can improve type/domain guarantees and CPU/memory control, but does not automatically reduce total app cost or make LLM/network calls faster. Rust skills, slower iteration for unfamiliar teams, dependency gaps and integration glue are real costs. Keep the useful existing browser ecosystem. Use measured bottlenecks, not a language-percentage target.

Official feasibility sources: https://docs.rs/axum/latest/axum/ and https://www.rust-lang.org/what/wasm . These verify available building blocks, not an audited Studio stack or a ready migration.

## 16.3 Motion and interaction quality

Treat "flawless" as a quality goal with observable regression gates, not a universal guarantee. Motion serves feedback and orientation. Keep yravg's light canvas #FAF9F5, Inter UI, numeric monospace, and the existing accent decision. No gradients, glass panels, copied mascot, decorative 3D header, or effects that hide content or latency.

R-MOT-1: THE SYSTEM SHALL use purposeful, consistent motion for stage/view changes, selection, panel disclosure, drag/drop, and job feedback. Stage transitions SHALL preserve mounted state or an equivalent recoverable state store, viewport, drafts, selection, and focus. Motion SHALL NOT trigger a data reset or loading flicker.

R-MOT-2: THE SYSTEM SHALL make transitions interruptible and retargetable. Input, keyboard navigation, cancellation, and a new stage selection SHALL not wait for an exit animation. Rapid changes SHALL settle on the latest requested workspace without replaying a queue of stale transitions or firing duplicate jobs.

R-MOT-3: THE SYSTEM SHALL keep pan/zoom/drag/select feedback responsive, avoid unnecessary whole-board redraws, and retain selection/focus during async updates. It SHALL use the existing motion/canvas implementation where fit, prefer compositor-safe transform/opacity where appropriate, and avoid layout/scroll jumps and pointer-target movement during commit.

R-MOT-4: THE SYSTEM SHALL respect OS prefers-reduced-motion and an explicit reduced-motion preference. Nonessential transforms, parallax, decorative loops and continuous pulses SHALL stop or be replaced by immediate state changes. Equivalent status feedback, keyboard operations, screen-reader announcements, and touch/non-drag actions SHALL remain available. Reduced motion SHALL not reduce capability.

R-MOT-5: THE SYSTEM SHALL define loading, real progress where measurable, indeterminate waiting, partial success, empty, error, retry, cancellation, offline, and recovery states. Skeletons SHALL reserve layout space; status updates SHALL not steal focus. It SHALL not fabricate percentage progress or impose a cosmetic minimum delay to conceal model/network latency.

R-MOT-6: THE SYSTEM SHALL run deterministic interaction/state and measured performance regression checks for stage switching, canvas operations, reduced motion, layout stability and recovery. Results SHALL identify hardware, OS/browser build, viewport/DPR, fixture, warm/cold status, network/cache and sampling method; failed budgets SHALL block the affected release or require a visible documented exception.

Proposed reviewable budgets, not measured results: qualify a reference laptop class with four physical CPU cores/eight logical threads, 16 GB RAM, integrated graphics, 60 Hz display; record the actual model/CPU/GPU/OS and stable Chromium build. Primary run: 1440×900 CSS px at DPR 1, plugged in, no CPU throttling, controlled assets and mocked provider latency. Also run functional layouts at 1024×768 and 390×844. If actual target hardware is weaker, define a separate recorded tier rather than silently relaxing results.

Fixture PERF-SPK-A: one project/eight stage workspaces, 100 canvas nodes, 20 visible image/prototype placeholders, fixed local assets capped at 4 MB total, eight open artifacts, one dirty text draft, and a deterministic mocked streaming job. Run five warmups then 30 measured stage round trips and a 60-second scripted pan/zoom/drag sequence. Include a separate cold/network-delayed run and slow/error/cancel fixtures; never mix model generation latency into local-interaction figures.

Candidate gates for that fixture: p95 local interaction acknowledgement ≤100 ms; p95 warm stage switch to usable target ≤200 ms; stage selection highlight responds without waiting for network; p95 canvas frame interval ≤20 ms with frames over 50 ms under 1% in the measured sequence; cumulative layout shift from unexpected non-user-driven shifts ≤0.05 in the fixed scripted flow. Include a direct assertion that selected/active controls do not jump during interaction, since CLS alone excludes some user-triggered movement. These values require baseline validation in SPK-T-01 and review before becoming release commitments. Motion tokens can start at 120–200 ms feedback/disclosure and 160–240 ms stage/panel transitions, with no enforced wait and reduced-motion override. They are proposed tokens, not benchmark claims.

## 16.4 Reuse-first policy and decision matrix

Use the existing repo and eligible references before custom work. This supersedes generic earlier "never competitor code" wording where that wording could prohibit lawful permissively licensed component reuse. It does not override study-only/proprietary-source limits, engineering license restrictions, privacy, security, attribution, or trademark rules. No source was copied into Spekin in this documentation task.

R-REU-1: BEFORE implementing or replacing a feature THE TEAM SHALL inventory the existing Studio implementation and record reuse-as-is, adopt, adapt, custom, or verify with source path/commit, owner/license, purpose, compatibility, and test evidence. Existing canvas, shell, router/state, auth, model integrations, billing/export and motion components SHALL be checked first.

R-REU-2: THE TEAM SHALL prefer maintained compatible-licensed libraries/components and eligible reference implementations over hand-rolled equivalents. Each adopted/adapted unit SHALL record exact version/commit, per-file/transitive licenses, notices/attribution, required source-disclosure obligations if any, security/maintenance status, and frontend/Rust boundary. Public visibility alone SHALL NOT pass the license gate.

R-REU-3: CUSTOM work SHALL be limited to Spekin branding/taste, necessary domain rules, and unavoidable integration/contract gaps after reuse options are checked. New UI frameworks, canvas engines, state systems, animation frameworks, auth stacks, or general orchestration frameworks SHALL NOT be created or substituted without a concrete unmet requirement and a recorded tradeoff. Rust-first SHALL NOT force a wholesale rewrite of the working TS frontend or proven compatible dependencies.

R-REU-4: WHEN a source is unlicensed, proprietary, or explicitly study-only THE TEAM SHALL use functional ideas only, not copy its source/assets/brand. Momo currently falls in the no-established-license category. Oyenza remains strictly study-only under REQ-FIN-028; its screens, layout, copy, data and brand are not reusable. Named engineering reference-only sources and the existing GPL/AGPL/LGPL restrictions remain unchanged.

R-REU-5: BEFORE delivery THE TEAM SHALL demonstrate provenance/license review, compatibility tests, required notices and no-Python dependency checks for adopted/adapted units. A reuse matrix SHALL distinguish confirmed existing capability from unverified candidate/library claims. Candidate status SHALL NOT be described as installed, licensed for our use, or runtime-tested.

Practical reuse matrix. All code paths and integrations below require the actual Studio audit; this document did not inspect that repository.

Existing Hub Studio canvas/frame persistence: VERIFY → REUSE/ADAPT. Owner-reported working canvas; record exact code/commit/ownership and old-board fixtures. Keep TS frontend and stable storage IDs; Rust wraps necessary authority/contracts, not a new canvas engine.
Existing Studio shell/router/tabs/state: VERIFY → ADAPT. Extend current components into eight stage workspaces. Preserve per-stage state and global project/revision. Use current accessible navigation primitives before adding a router/state library.
Existing motion/interactions: VERIFY → REUSE/ADAPT. Use the installed motion library if compatible/licensed and it meets tests; otherwise use existing CSS/Web Animations facilities or one justified compatible library, not several new systems. Spekin tokens and timing taste are custom.
Existing auth/payment/model/export integrations: VERIFY → REUSE/ADAPT behind Rust contracts. Preserve proven flows and permissions. Do not rewrite an auth/payment framework; replace unsupported business-server responsibilities incrementally with evidence.
Rust HTTP/async/serialization/database tooling: ADOPT CANDIDATES after license/security/version review. Axum/Tokio/Serde are proposed examples; database/auth clients follow the audited integration. Implement only the domain/contract gap, not new generic frameworks.
Onlook/OpenDesign source: CANDIDATE, not automatically adopted. Prior official studies identify Apache-2.0 at repository level; inspect the exact desired unit, bundled licenses and notices before selective reuse. Do not import the desktop/local-agent architecture into browser MVP. Favor smaller existing Studio dependencies if they solve the need.
Momo header: ADAPT FUNCTIONAL PATTERN ONLY. No repository license established; implement workspace switching with Studio's existing navigation, not copied Momo source/chrome/assets.
Paraframe/DesainPakeAI: PATTERNS / VERIFY CODE RIGHTS. Reuse captured behavioral lessons and existing Studio implementation; no permission to copy vendor code is inferred from a public site or study pack.
Oyenza and named reference-only engineering material: STUDY ONLY. Existing stricter boundaries remain. Engineering's explicitly permitted MIT/MPL dependencies keep their documented per-file obligations and phase limits.
Spekin brand/domain glue: CUSTOM only where needed. Own colors/typography/spacing/motion taste, stage-to-artifact mapping, domain contracts, evidence links, and integration adapters. Reuse existing components beneath them.

## 16.5 Acceptance, tasks, and unresolved decisions

All tests below are specifications, not executed results. Existing requirement, screen and task IDs remain. New requirements are R-WF-9–12, R-ARC-1–6, R-MOT-1–6, R-REU-1–5. R-DS-8 and R-WS-9 are revised to distinguish licensed reuse from copying unlicensed/protected material. All specialist packs and original stricter license/source gates remain.

AC-SPK-17: Open a dirty spec artifact and a selected board frame in Design. Switch via header to Backend, modify its panel arrangement, navigate Back/Forward and a valid direct stage link. Restore each stage's tabs/viewport/selection/draft/focus; global project/revision stays fixed. No reload, lost edit, duplicate artifact, approval, completion, paid job or deployment occurs. Proves R-WF-9–12. Screens S35/S29. Tasks SPK-T-02/03.

AC-SPK-18: Use keyboard alone for all stage switches and artifact/view tabs, then a mobile overflow menu. Unknown/forbidden/deleted deep links fail safely. Back/Forward respects permissions, empty states and unsaved-draft recovery. URLs contain no draft text or secrets. Proves R-WF-10–12/R-SEC. Task SPK-T-02/09.

AC-SPK-19: Inventory shipped runtime/build/test/container/generator dependencies and run a clean build/test/export job without Python installed. Rust core plus accepted JS/TS frontend tooling succeeds; no hidden Python subprocess/package is required. Local-agent/deploy controls remain deferred. This does not prohibit a fixture describing a user's Python project. Proves R-ARC-1–6. Tasks SPK-T-01 and SPK-T-11, a Rust-boundary/no-Python contract audit before implementation.

AC-SPK-20: Run identical requirement acceptance/stale-revision, permission denial, and budget reservation fixtures through the Rust API contract and TS client. Invalid/malicious client data cannot bypass the server. UI and server versions reject incompatible schemas explicitly. Proves R-ARC-3/R-MOD/R-SEC. Tasks SPK-T-03/06/09/11.

AC-SPK-21: During stage animation rapidly request three other stages, type, press Escape/cancel, and toggle reduced motion. Latest navigation wins; input stays usable; no stale-animation replay, blocked focus, lost selection/draft, duplicate run or layout-target jump occurs. Test loading/empty/error/retry/offline/partial/cancel states and screen-reader status without focus theft. Proves R-MOT-1–5. Tasks SPK-T-02/03/04/09.

AC-SPK-22: Execute PERF-SPK-A and the specified sampling/recording plan. Publish actual p95 input/stage/frame metrics, >50-ms frame share, CLS and pointer-target continuity, including reduced-motion and cold/error fixtures. Mark each proposed budget passed/failed/untested; no benchmark result or universally flawless guarantee is inferred from this PRD. Proves R-MOT-3/6. Tasks SPK-T-01/02/03 and existing T-111/T-605.

AC-SPK-23: For every planned adopted/adapted dependency, verify exact source/version, license compatibility, obligations/notices, maintenance/security, Rust/UI fit and test coverage. Show existing Studio option before custom work. A Momo code-copy proposal without a license fails; an eligible permissively licensed component with obligations satisfied can pass. Oyenza study-only and engineering-specific restrictions still block their forbidden reuse. Proves R-REU-1–5/R-DS-8/R-WS-9. Task SPK-T-12, reuse/provenance inventory integrated with SPK-T-01.

Q-26 now concerns exact Rust boundary/crates, existing service reuse and staged migration, not whether TS/JS is allowed. TS/JS UI is accepted. No-Python is owner direction. Exact Rust crate versions, audited architecture, existing local/unpushed Studio state, benchmark reference device/budgets, eligible source units and required licenses remain to verify. Q-30 remains about broader codebase-refresh/fork/plugin architecture; compatible licensed component reuse is allowed/preferred under R-REU. Momo code adoption is blocked pending a verified license/permission. Model providers and pricing decisions are unchanged. Browser-first scope and local-agent deferral are unchanged.


## 17. v0.2.2 synthesis: one Spekin, not a Momo clone

This revision incorporates Enrico's latest GenUI and annotated-wireframe directions. Momo contributes contextual chat/UI patterns, not the whole product. Existing yravgHub Studio, including its owner-reported DesainPakeAI-style infinite canvas and controls, remains the baseline to inventory and preserve. DesainPakeAI is not a forgotten or newly added module. Exact existing buttons, shortcuts, state and behavior are pending inventory, not verified by the owner's description alone.

The first-value job is to turn a project engineer's brief/references into a reviewed, build-ready slice without losing why a requirement exists. Fixture: a contractor cost-variance dashboard change using fictional data. Inspect extracted requirements/gaps, compare two justified alternatives, edit one proposed criterion, accept a bounded diff in S08, then locate its stable design/task/test links and evidence. Users should not need to understand seven reference products or move between copied apps.

The combination is deliberate: Studio/DesainPakeAI supplies the existing canvas foundation; Paraframe informs frame alternatives and targeted edits; Onlook informs visual editing; OpenDesign informs model-source controls/cost transparency; living-spec/Spec Kit material supplies traceability/change control; Momo informs contextual structured responses and alternate presentations. Yoseph's CI/CD factory separately informs optional delivery-bottleneck visibility. These are study/adaptation roles, not proof that every source implements every proposed behavior or is already integrated. All specialist packs remain intact.

Choose contextual GenUI within the existing shell rather than cloning Momo's persona/entertainment surface or inventing a general-purpose UI engine. Reuse existing Studio/yravgUI and eligible maintained libraries first. Custom work serves Spekin taste and necessary domain/integration gaps. Original light design remains: canvas #FAF9F5, Inter, numeric mono, no gradients/glass; accent decision remains open. Sections 16 and 17 are cumulative. Earlier static-only inspection statements are dated history, now extended by video evidence.

## 17.1 Momo video evidence and limits

Exact source: https://www.threads.com/@0xnihilist/post/DgBBIHcE84n . Completed watchVideo findings were supplied by the parent for the downloaded public video at /workspace/spekin-consolidation-20261122/v0.2.2-research/media/momo-genui-demo.mp4; post capture is v0.2.2-research/momo-genui-post.png. This is recorded demonstration evidence, not a live product test, source audit or benchmark.

0:00–0:24: persona dropdown, model/settings including a temperature slider, and image attachment interactions are demonstrated. These do not establish provider billing, role permissions, storage policy or validation. 0:25–0:35: contextual-photo loading and streamed text appear; this does not establish media rights, source verification or latency results.

Around 0:36: recipe cards and filter controls appear; a card is clicked and expands inline to details and a stepper. Filters and stepper operation are not established. 0:49–1:03: structured event panels, transport comparison, map/hotel presentation, budget sliders, checkboxes, setlist tabs and a matrix table are visible. Sliders were not manipulated and checkboxes were not clicked. Visibility is not verified end-to-end operation.

1:04–1:13: Explore is clicked and opens split outline/context plus a scrollable article-like presentation of the same topic and suggested follow-ups. 1:14–1:19: the third header tab switches to a board of generated UI cards grouped in columns; drag-pan is demonstrated. Reset/add/filter controls are visible only. ALL these scenes are Momo, not a Paraframe workspace, OpenDesign board or demonstrated cross-repository integration. Infinite extent, synchronization, reload persistence, action authorization and production reliability are not proven.

The post calls Momo experimental/open source. That wording is not a reuse grant. The prior inspected repository metadata/root/README/package established no repository license; compatible exact-unit licensing or permission remains required before copying source/assets. README capability statements not demonstrated in the clip remain documentation claims. No Momo prices or safety guarantees are inferred.

## 17.2 Contextual GenUI in the stage workspace

S38 Contextual response/detail panel is within the existing workspace, not a ninth stage or replacement canvas. S35 remains the shell, S08 canonical review, S29 the shared canvas. Retain Planning → Specification → Design → Frontend → Backend → Integration → Testing → Deployment. Stage navigation switches the main workspace; artifact tabs, conversation/document/board presentations and model controls remain distinct. Switching presentation cannot approve, spend or deploy.

Start with three task-shaped families: requirement/gap cards, alternative comparisons, and acceptance/evidence checklists. Retain plain text/deterministic forms when clearer. Later tables/charts/risk components need a named user task, adequate input data and a tested registered implementation. Interactive previews of generated apps remain separately sandboxed; they are not executable GenUI. Persona/task hints never grant security roles.

R-GUI-1: THE SYSTEM SHALL choose a registered contextual presentation for the current task/stage/artifacts; label model proposals, imported observations and accepted artifacts distinctly; and offer a readable text/table fallback. GenUI SHALL NOT replace stable navigation or canonical forms for novelty.

R-GUI-2: THE SYSTEM SHALL reuse an allowlisted, versioned Studio/yravgUI-compatible registry with typed props/actions. Rust SHALL validate schema versions, types, required fields, enums, nesting/item/text/media limits and permissions before enabling actions. Invalid/unknown output SHALL fall back safely, never load arbitrary components, eval code, invoke shell commands or execute model-generated application code.

R-GUI-3: THE SYSTEM SHALL expand/collapse details without losing edits/focus/selection. Stable request/component/artifact IDs SHALL preserve state across streaming, view/stage changes and recovery under R-WF/R-MOT. Accepted artifacts referenced in chat/document/canvas SHALL resolve to the authoritative revision, not unrelated copies.

R-GUI-4: THE SYSTEM SHALL separate generated suggestions from canonical requirements/tasks/designs. Explicit S08 review SHALL show exact diff, sources, affected IDs, approval scope and current revision before canonical writes. Pinning a proposal SHALL NOT accept it; referencing an accepted artifact SHALL retain its ID/revision/permissions.

R-GUI-5: THE SYSTEM SHALL show source/evidence links, provenance, as-of/retrieval time, scope and verification status where applicable. Generated analysis SHALL be distinguished from observations and user facts. Fluent cards, green accents, citation icons and animations SHALL NOT turn missing/failed/untested evidence into passed evidence.

R-GUI-6: BEFORE any generated action commits a canonical change or external side effect THE SYSTEM SHALL verify actor, permission, allowlisted action, current artifact/spec revision and relevant budget/approval; confirm exact effects; and use idempotency with audit/result evidence. Model text cannot grant authority. Read-only expansion/filtering needs no write confirmation; stale/denied/failed actions SHALL not display success.

R-GUI-7: THE SYSTEM SHALL stream recoverable validated updates with stable IDs, sequence/revision checks and bounded buffers. Partial/malformed output SHALL not activate actions. Cancel/retry/error/offline/late-response handling SHALL retain drafts, reject superseded updates and prevent duplicate writes/charges under the existing model ledger.

R-GUI-8: THE SYSTEM SHALL render through accepted TS/JS UI while Rust owns validation, domain rules, authorization and persistence contracts. No Python product dependency SHALL be introduced. Compatible parsers/renderers may be reused after license/security review; Momo's documented permissive prop-repair SHALL NOT be assumed safe or copied as a validation policy.

R-GUI-9: THE SYSTEM SHALL support keyboard actions/expansion/selection, semantic labels/table alternatives, non-drag board actions, preserved focus and appropriate stream announcements. Reduced-motion and R-MOT interruption/layout/performance gates SHALL cover generated panels. Updates SHALL not steal focus or move the action being selected.

R-GUI-10: THE SYSTEM SHALL export structured data with schema version, stable IDs, accepted/proposed status, spec revision, sources and selected filters. Reopening/exporting the same pinned data SHALL not call a model or silently regenerate content. Declared export-time metadata may differ; semantic content/revisions SHALL remain deterministic.

R-GUI-11: THE SYSTEM SHALL use the existing model capability/context/budget/usage contract. Unsupported images, temperature or other settings SHALL be disabled/explained, not decorative promises. Status SHALL use available operational telemetry, not fake progress, required hidden-reasoning disclosure or unsupported subscription-CLI access.

R-GUI-12: THE TEAM SHALL test adopted components in ready/loading/streaming/empty/error/cancelled/stale/denied states, malicious props/actions and keyboard/reduced-motion fixtures using existing component tooling first. MVP SHALL start with the three named families and one reviewed slice, not Momo's entire catalogue/personas.

## 17.3 Separate optional CI/CD evidence reference

Sources: https://www.threads.com/@yosephgratika/post/Df9alcQE8Vx and https://www.threads.com/@yosephgratika/post/Df9V9btEwBf . Public text and downloaded static JPGs were inspected. They show CI/CD factory: Agent work → PR gate → Merge → Main CI → Staging → Production, with Back to author/Night shift branches, filters, PR IDs/counts, freshness and production-unknown status. They are NOT Momo. Live animation/clicks, automation accuracy and integration behavior were not verified. Screenshot counts are not Spekin results.

S39 Delivery bottleneck/evidence view is an optional read-only extension of S37/S18 in M3, not an MVP prerequisite, new project-control pack or deployment executor. Begin with imported evidence/synthetic fixtures. Live integration needs authorized read-only access, least privilege and separate review. A clear pipeline/table suffices; an isometric factory is not required. Do not copy protected assets or visual identity.

R-DEL-1: WHEN optional delivery evidence is enabled THE SYSTEM SHALL correlate available requirement/task/build/PR/check/deployment observations by stable IDs and revision/commit; show queue/wait/failure/owner-needed states, timestamps and evidence links; distinguish unknown/stale/unavailable from passed; and provide an accessible filtered table. Unlinked evidence SHALL stay visibly unlinked. Upstream green checks SHALL NOT imply production success.

R-DEL-2: THE SYSTEM SHALL keep this view read-only under browser-first scope. Navigation, filters, animation or suggestions SHALL NOT start agents, retry CI, merge, deploy or alter source systems. Proposed remediation may enter the reviewed task workflow. No local-agent or deployment execution is added.

## 17.4 Existing Studio and annotated design handoff

R-WIR-1: BEFORE replacing Studio canvas controls THE TEAM SHALL inventory actual existing buttons/shortcuts, frame operations, chat/context, model controls and state, recording source path/revision and observed behavior. Owner-described existing capability SHALL be marked pending inventory until audited. DesainPakeAI studies SHALL be linked as existing baseline inputs, not treated as a new add-on or proof of current Studio button parity.

R-WIR-2: THE DESIGN HANDOFF SHALL map the approved BW-01–08 screens and supplementary states to current requirements and annotate every major region as Existing Studio, reference pattern or Spekin-specific with source, evidence confidence and reuse decision. It SHALL distinguish the eight approved flow screens from the eight workflow stages, preserve originals, and identify proposed versus drawn versus verified controls. A current Design Desk revision SHALL be reconciled before replacement drawings; unavailable active work SHALL yield an annotated source-to-screen brief, not a competing final design.

Shared Design Desk files inspected: /workspace/design/frame-workspace/ contains the approved editable 17-sheet baseline (eight main screens, five states, tablet and three mobile sheets), generated earlier on 22 Nov 2026. /workspace/design/prd-studio/ contains earlier handoff/components/coverage and Spec Kit delta. No current evening eight-screen update was accessible in inspected files/own transcript. Do not assume another agent has not produced one. The companion annotated offline brief reuses these exact vectors without changing the source directory, and is not a replacement final screen design. Original pack/flow links stay indexed. Its historical Python drawing script is an archived research/design source, not a dependency of Spekin or the new brief.

Common annotation regions: project/spec context and actual stage workspace navigation (Spekin-specific synthesis plus Momo switching pattern); per-artifact tabs/state (Spekin contract plus OpenDesign study); canvas/frame rail and existing controls (Studio/DPAI baseline, pending inventory; Paraframe/Onlook patterns separately attributed); chat/detail (Momo demonstrated pattern plus Spekin proposal/review contract); model/source/usage (OpenDesign study plus Spekin ledger, actual prices undecided); revision inspector/review/evidence (Spekin/living spec). Onlook descriptions and prior studies retain their existing evidence limits; no video scene is mislabeled as another product.

## 17.5 Reuse, sequencing and acceptance

Reuse/adapt existing Studio registry, chat/ask panel, canvas, shell/router/tabs, artifact store, review/diff, auth, model/usage and state fixtures first (SPK-T-01/12). Adopt/verify only missing compatible-licensed parser/renderer/UI/motion units, with exact versions, per-file/transitive licensing/notices, security and Rust/TS contracts. Momo README's OpenUI/D3/Motion names are candidate leads, not audited dependencies or permission to reuse its wrappers. Momo and unlicensed/proprietary references remain patterns-only; Oyenza study-only/engineering restrictions remain. Custom work fills documented domain/adapter/branding gaps only.

M0: inventory and annotate baseline controls/registry; reconcile current Design Desk work. M1: SPK-T-13 adds three contextual families, detail/fallback, S08 review and linked canvas references with mocked/imported fixtures explicitly labelled, reusing SPK-T-02/03/04/09. M2: connect the same slice through SPK-T-05/06 capability/budget contracts; no new prices promised. M3: optional SPK-T-14 adds read-only bottleneck correlation under SPK-T-07/08. M4: run all existing specialist-pack fixtures and security/accessibility/recovery gates. These are staged targets, not shipped capabilities.

AC-SPK-24: On the fictional contractor-dashboard fixture, inspect three card families, expand details, edit a proposed criterion and compare alternatives. No canonical change before S08. Accept one exact diff; requirement/design/task/test/source links agree across chat/document/canvas; a pinned unaccepted item remains proposed. Covers R-GUI-1/3/4; S38/S08/S29/S35; SPK-T-13/02/03/04.

AC-SPK-25: Submit unknown components, invalid enums, excessive nesting/items, unsafe URLs, scripts/tool names and a privilege-escalating action. Rust fails closed according to the declared schema; TS renders safe fallback; no arbitrary execution/request/side effect. Covers R-GUI-2/6/8; SPK-T-13/09/11/12.

AC-SPK-26: Stream malformed/out-of-order/truncated updates; cancel, retry and switch stages. Preserve drafts/focus/selection; reject stale output, partial actions and incompatible schema; no duplicate write/settlement. Stale or denied confirmed actions require refreshed review, not fake success. Covers R-GUI-3/6/7/11; S35/S36/S38; SPK-T-13/03/06/09.

AC-SPK-27: Keyboard/assistive-technology/reduced-motion tests cover expansion, comparison, checklists and non-drag pin/reference. Extend PERF-SPK-A with a recorded GenUI fixture size; no focus theft/moving action targets. Reopen/export pinned data twice without model calls; semantic data/status/IDs/filters/revisions match. Covers R-GUI-9/10/12; SPK-T-13/03/09.

AC-SPK-28: Run every component state and unsupported images/settings, absent-provider and missing-source cases. Label fixture/unavailable/unknown correctly; no fabricated verification/progress/hidden-reasoning requirement. Record exact-unit licensing/provenance review. Covers R-GUI-5/8/11/12; SPK-T-13/05/06/12.

AC-SPK-29: Optional pipeline fixture has one failed PR check, queued runner, unrelated newer green main build, stale staging and no production observation. Correctly link commits/IDs and preserve failed/queued/stale/unknown with source timestamps and filtered evidence table. No false release pass. Covers R-DEL-1/R-GUI-5; S39/S18/S37; SPK-T-14/07/08.

AC-SPK-30: Viewer/denied-scope/disconnected integration cases and every pipeline control cause no external retry/merge/deploy/agent action or evidence leak. Remediation creates at most a reviewed proposal. Covers R-DEL-2/R-GUI-6; SPK-T-14/09.

AC-SPK-31: In a formative test with three representative project-engineering/build users, record whether each can identify one requirement's source, edit one proposal criterion, accept only that change and locate its task/test without assistance. Record failures/time and review before widening the catalogue. No completed usability result is claimed. Covers R-GUI-1/4/12; SPK-T-13.

AC-SPK-32: Inspect all eight BW source-to-screen mappings and empty/loading/error/cancel/review/stale/handoff states. Every major region has classification, source/evidence confidence, requirement and reuse action. Existing Studio controls remain pending inventory unless observed. Verify unchanged baseline SVG hashes, offline editability, PDF page/text completeness, preserved source links, and explicit Design Desk reconciliation status. Covers R-WIR-1/2; SPK-T-01/02/12/13.

D-SPK-10: combined Spekin, not Momo reskinned. D-SPK-11: video-grounded contextual GenUI with reviewed promotion and Rust-validated actions. D-SPK-12: separate optional/read-only Yoseph evidence. D-SPK-13: existing Studio/DPAI baseline first; annotate/reuse approved vectors and reconcile active Design Desk work. Added R-GUI-1–12, R-DEL-1–2, R-WIR-1–2; all 310 prior definition IDs remain unchanged. All runtime acceptance tests remain untested. Document/render checks do not prove application behavior.

Open: actual Studio/yravgUI and local/unpushed/deployed audit; exact unit licenses/schema/limits; active Design Desk reconciliation and final drawings; user task validation; device/fixture performance; provider/API/key custody; OpenDesign-inspired prices/quotas/refunds. Mostly Rust + accepted TS/JS, no Python product dependency, browser first, original yravg branding and no local-agent/deployment execution remain. No app implementation, new account, purchase, sharing expansion, external message or deployment occurred.


Design deliverables v0.2.2: editable offline annotated source-to-screen brief (HTML/JSON plus 17 unchanged baseline SVGs and PDF): https://drive.google.com/file/d/130-7jBQGFGDBWAGMBpzqlVZtCWKsVuqi/view ; readable 12-page annotated PDF: https://drive.google.com/file/d/1yhL-87Zncm8WXy6fGGEuNw1-VxQ1LUK1/view . These reuse BW-01–08 and supplementary states; they do not replace the inaccessible current Design Desk revision or constitute final updated product drawings. Existing Studio controls remain pending inventory. Document checks passed; runtime acceptance remains untested.
