# S37 — Build contracts and release readiness

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
DELIVERY
S37 · DELIVERY · SPEKIN
Build contracts and release readiness

Extends: New. The Frontend-to-Deployment half of the S35 shell: contracts per stage, readiness across all eight stages, a release gate that blocks with reasons, run failures and the evidence pack. Uses S15 tasks, S18 evidence and S25 export. No deployment executor.

Lives in: Spekin web app · /p/meranti-yard/backend (contracts) and /p/meranti-yard/deploy (gate and pack); artifact in the query.

Contracts
Contract detail
Readiness matrix
Release gate blocked
Run failure
Evidence pack
S
NEW
Meranti Yard
/
Cost variance dashboard
⌘K
Increment
Inc. 2 · Variance alerts
Spec
r14
accepted
NEW
Saved 12:41
NEW
Hosted
1,240
of 5,000 cr
NEW
2
EN
ID
RS
NEW
01
Planning
Ready · 6 of 6
02
Specification
Ready · r14
03
Design
In progress · 3 to review
04
Frontend
Not started
05
Backend
Needs review · 2
06
Integration
Blocked · 1
07
Testing
In progress · 4 of 11
08
Deployment
Not started
Readiness
Backend chat
· contracts
NEW
Context for the next run
3 items
API contract · variance alerts
r2
Entity VarianceAlert
r1
R-DASH-014
r14
Add
≈ 5.4k tokens · secrets by name only
Which contracts hold up the release?
S
Spekin
Sonnet 5.5 · 17 s · 8 cr

Four contracts are not accepted: the API contract needs review after r14, migration 0007 and the frontend tests are drafts, and the fixture contract is blocked by a failed run.

Open the API contract
Show only blocked contracts
Ask about a contract, a check or the release gate…
NEW
HOSTED
Sonnet 5.5
≈ 18–30 cr
NEW
Release readiness
API contract · variance alerts
Entity VarianceAlert
Share
LATER
NEW
Contracts
Readiness
Release gate
Evidence pack
Backend
Contracts
Build
b4a1f9c
· staging · 12:31
Read-only view
Contracts
8
Accepted
1
Needs review or draft
5
Blocked
1
All kinds 8
API contract 1
Entity 1
Migration 1
Test definitions 4
Checklist 1
A contract is a proposal until it is accepted in review. Accepting never writes to a database.
NEW
Stage	Contract	Kind	Version	Status	Linked requirements	Checks

04
Frontend	Variance table behaviour	
Test definitions	
r1
	Draft	R-DASH-014	0 of 4 run

05
Backend	Variance alerts	
API contract	
r2
	Needs review	R-DASH-014, 015, 019	3 of 6 pass

05
Backend	VarianceAlert	
Entity	
r1
	Accepted	R-DASH-014	4 of 4 pass

05
Backend	0007 add variance_alerts	
Migration	
r1
	Draft	R-DASH-019	1 of 3 pass

05
Backend	AC-DASH-014 alert rules	
Test definitions	
r1
	Proposed	R-DASH-014	3 criteria

06
Integration	Contract fixtures, GET alerts	
Test definitions	
r1
	Blocked	R-DASH-014	1 failed

07
Testing	Acceptance criteria, 11	
Test definitions	
r3
	In progress	R-DASH-*	4 of 11 pass

08
Deployment	Staging release, pinned	
Release checklist	
r1
	Draft	Build b4a1f9c	0 of 6 run
WHAT CHANGED UPSTREAM
Spec r14 changed R-DASH-014 from 5% to 3%. The API contract and 1 test definition are marked Needs review. The r13 evidence is kept and can no longer verify r14.
Open the diff
Click a contract: it opens in its own tab with versions and checks. Status words are never colour alone.
Upstream change: accepting spec r14 marks linked contracts Needs review. Older evidence is kept, not reused.
WHAT IT MUST SHOW
Contracts are grouped by stage: API contract, entity, migration and test definitions, each with a version and a status in words.
Readiness for each of the eight stages is derived from required artifacts, approvals and evidence. Opening a stage never changes it.
Every check reports passed, failed, untested or evidence missing, with an evidence link pinned to a build. Missing is never passed.
The release gate blocks with one reason per check and names the build it judged. There is no deploy button.
A failed run shows one title, one paragraph, its class and a repair that goes to review. It never retries, merges or deploys.
Unknown, stale and unavailable observations stay apart from passed; an unrelated green build is not linked.
MOTION
View switch
Content cross-fades 160 ms with a 4 px slide (spring-ui). The latest click wins.
Matrix bars
Grow 200 ms on first show only; later changes swap the number with a 140 ms fade.
Gate reasons
List in with a 40 ms stagger (OpenDesign), 220 ms each, ease cubic-bezier(0.23,1,0.32,1). The header does not move.
Run failure card
Height reveal 180 ms; focus moves to the title. Actions stay in place.
Evidence link
Row expands in place, 180 ms; focus stays on the link.
Reduce Motion
No slide or stagger. Changes are instant and announced.
STORIES
F301
PRD
New
Contracts per stage with a view switch (Contracts, Readiness, Release gate, Evidence pack): kind, version, status, linked requirements, kind filters and counts (R-WF-6, R-ARC-3).
F302
PRD
New
Contract detail: version switch r2 and r1, diff, endpoints and fixture (R-WF-4, R-ARC-3).
F303
Momo
New
Contract checks with passed, failed, untested or evidence missing and an evidence link (R-EVD-2, R-ARC-3).
F304
PRD
New
Upstream change marks linked contracts Needs review and keeps older evidence (R-WF-4).
F305
PRD
New
Readiness matrix across the eight stages: artifacts, approvals, tests, evidence, blocker (R-WF-1, R-WF-3, R-WF-6, AC-SPK-1).
F306
PRD
New
Evidence link chips pinned to build, spec and frame revisions (R-EVD-1).
F307
PRD
New
Release gate: acceptance tests, performance budget, accessibility and security; blocks with reasons (R-EVD-2, AC-SPK-1).
F308
PRD
New
Owner exception records a reason and stays different from verified readiness (R-WF-3, R-SEC-5).
F309
PRD
New
Propose fix tickets and contract fixes; they enter review first and never change code (R-EVD-5, R-VER-11).
F310
OpenDesign
New
Run failure card: one title, one paragraph, classification, repair on the right (OpenDesign RunErrorCard, R-SEC-6).
F311
PRD
New
Run steps listed as applied, failed, skipped and unknown; no rollback claimed (R-EVD-3).
F312
PRD
New
Evidence pack: pinned identities, outcome counts and snapshot history (R-EVD-1, R-EVD-4).
F313
PRD
New
Evidence timeline keeps failed, queued, stale, unavailable and unknown apart from passed (R-DEL-1, AC-SPK-29).
F314
PRD
New
Read-only: no deploy, retry or merge; viewers read and cannot change (R-DEL-2, R-ARC-5, R-SEC-1).
F315
PRD
New
Export the evidence pack; masked secrets, recorded actor and time (R-SEC-2, R-SEC-4, R-SEC-5).
F316
OpenDesign
New
Suggested prompts under each readiness reply explain a blocker and propose fixes; nothing runs until Send (R-CAN-4, R-WS-2).
Shared shell controls on this board, specified on S35:
F101
New
F102
New
F103
New
F104
New
F106
New
F107
New
F109
New
F111
New
F112
New
F114
New
F115
New
WHERE IT LIVES
Route: /p/:project/:stage with ?tab=readiness|contracts|gate|evidence. Back and Forward restore the view and never start a run, spend credits or export.
UI (TS/React): OpenDesign patterns, Apache-2.0 reuse candidates at commit e033aad: RunErrorCard (title, paragraph, actions right), run-failure-classification (classes), GenUISurfaceRenderer for check cards. NOTICE file needed. Momo contributes only its idea of a fixed state and a11y checklist.
Core (Rust): stage readiness derivation, contract validation against fixtures, evidence pinning, release gate rules and the audit record (R-ARC-1, R-ARC-3, R-EVD-1). The browser never decides pass or fail.
Open for Enrico: the performance budget and accessibility rules for Meranti Yard (2.5 s and axe are sample values) · who may grant an owner exception · retry after a runner exists (LATER).
STATES
Contracts · Entry: Projects > Meranti Yard > Backend > Release readiness > Contracts. · Data: sample/parts/delivery.mjs → DELIVERY_CONTRACTS.
Contract detail · Entry: Contracts > click API contract, variance alerts. · Data: sample/parts/delivery.mjs → DELIVERY_CHECKS; sample/meranti-yard.mjs → BACKEND.
Readiness matrix · Entry: Integration > Release readiness > Readiness. · Data: sample/parts/delivery.mjs → DELIVERY_MATRIX; sample/meranti-yard.mjs → STAGES.
Release gate blocked · Entry: Deployment > Release readiness > Release gate. · Data: sample/parts/delivery.mjs → DELIVERY_GATE, DELIVERY_BUILD.
Run failure · Entry: Integration > Readiness > click the failed stage > Run #38. · Data: sample/parts/delivery.mjs → DELIVERY_RUN.
Evidence pack · Entry: Deployment > Release readiness > Evidence pack. · Data: sample/parts/delivery.mjs → DELIVERY_TIMELINE, DELIVERY_BUILD.
Reference: the original UI
OpenDesign (Apache-2.0, commit e033aad) is the main reference. Its run-failure card has no screenshot here, so it is described. Momo and Onlook are pattern references only.
OpenDesign chat. Status and checklist cards inside the chat. The check cards and gate reasons follow this.
OpenDesign document. A self-check result sits under the reply. Spekin’s contract checks read the same way.
OpenDesign Studio. Chat left, file tabs and actions on the right. The readiness views keep this split.
```
