# S35 — Project shell: eight stages, artifacts, chat and canvas

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
SHELL
S35 · SHELL · SPEKIN
Project shell: eight stages, artifacts, chat and canvas

Extends: New. Spekin has no built screen yet; the existing Hub Studio is not used as a baseline (owner, 22 Nov 2026). Wraps S01–S34 and S29 (shared canvas).

Lives in: Spekin web app · /p/meranti-yard/design (stage in the path, artifact and frame in the query; never draft text or keys).

Design stage
Switched to Backend
Save conflict
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
1 designing · 1 waiting
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
Design chat
· F-03 selected
NEW
Context for the next run
4 items
F-03 Variance table
r6
DESIGN.md
r3
R-DASH-014
r14
REF-02 Site cost report
r1
Add
≈ 9.8k tokens · the whole board is never sent
Add an alert drawer to the variance table for packages over 3%.
S
Spekin
Sonnet 5.5 · 34 s · 22 cr

Drew F-04 Alert drawer as a draft. F-03 stays accepted at r6. One gap found.

NEW
Requirement cards · 1 gap
Show as table
REQUIREMENT
ACCEPTED R14
R-DASH-014 · Variance threshold per package
Flag a package when forecast exceeds budget by more than 3%.
Source: brief §2 · REF-02
Details
GAP
PROPOSAL
No empty state when no package is over
Proposed: show “No package over 3% this period”.
Not in spec · needs review
Edit
Send to review
Compare F-04 with F-03
NEW
F-06 take 2 of 3
Step 3 of 4 · self-check
1.2k · 14 s
Ask for a change to F-03, or @ another frame…
NEW
HOSTED
Sonnet 5.5
≈ 18–30 cr
NEW
Variance flows
F-03 Variance table
F-04 Alert drawer
DESIGN.md
Spec §3
Share
LATER
Hand off
NEW
Canvas
Preview
Document
Compare
Design
Variance flows
Variance flows
5 frames · 1 reference
F-01
Portfolio overview
r4
Accepted
Portfolio overview
USD m · sample
Budget
30.65
Forecast
31.65
Variance
+3.3%
Alerts
2
F-03
Variance table
r6
Accepted
Variance table
USD m · sample
Budget
30.65
Forecast
31.65
Variance
+3.3%
Alerts
2
Package
Budget
Forecast
Var.
P-01 Jacket fabrication
12.40
13.10
+5.6%
P-02 Topside piping
8.25
8.31
+0.7%
P-03 Hook-up and commissioning
5.90
6.28
+6.4%
P-04 Marine spread
4.10
3.96
−3.4%
F-04
Alert drawer
r1
Draft · not accepted
Variance table
USD m · sample
Budget
30.65
Forecast
31.65
Variance
+3.3%
Alerts
2
Package
Budget
Forecast
Var.
P-01 Jacket fabrication
12.40
13.10
+5.6%
P-02 Topside piping
8.25
8.31
+0.7%
P-03 Hook-up and commissioning
5.90
6.28
+6.4%
P-04 Marine spread
4.10
3.96
−3.4%
Alerts · 2
P-03 Hook-up
+6.4% · 2 periods
P-01 Jacket
+5.6% · 3 periods
F-03
alternatives
3 takes
Take 1 of 3
USD m · sample
Package
Budget
Forecast
Var.
P-01 Jacket fabrication
12.40
13.10
+5.6%
P-02 Topside piping
8.25
8.31
+0.7%
P-03 Hook-up and commissioning
5.90
6.28
+6.4%
REF-02
Site cost report
Reference image · PNG · imported
not an editable frame
Ask on select
NEW
F-06 designing
64%
NEW
F-03 Variance table
Accepted r6
Frame · Design stage · edited 12:41 by Rina (sample)
Links
Contract
Revisions
Evidence
REQUIREMENTS
3
R-DASH-014
Variance threshold per package
Accepted in spec r14
Accepted
R-DASH-015
Drill down from package to cost lines
Accepted in spec r14
Accepted
R-DASH-019
Alert after 2 periods over 3%
Proposal from chat, not in spec
Proposal
DESIGN
1
DESIGN.md
Tokens and type scale
Accepted r3 · 18 tokens
Accepted
TASK AND TEST
2
T-212
Build variance table
Frontend · not started
Open
AC-014.2
Over-threshold rows flagged
No evidence on a pinned build
Untested
Design stage
3 to review

F-04 draft, 1 gap card and 1 proposal wait for review. Nothing is accepted until you review it.

Open review
Click a stage above: the work area swaps in place, no reload. Each stage keeps its tabs, zoom, selection and drafts. Switching never approves anything.
Context list (left) is exactly what the next run gets. Remove a chip to leave it out.
Model source: Hosted spends credits, BYOK bills your provider, Local agent shows as deferred. Estimate before Send.
Save state (top bar): Saving, Saved, Failed (kept on this device) or Conflict. A failed save never shows Saved.
Drafts have a dashed edge and stay apart from accepted frames until reviewed in S08.
WHAT IT MUST SHOW
All eight stages in order, each with a text status and a count. The current stage is shown by position, weight and underline, not by colour alone.
A stage click swaps the work area in place: no reload, and that stage’s tabs, zoom, selection and drafts come back.
Project, increment and the accepted spec revision stay in the top bar on every stage.
Artifact tabs and the Canvas / Preview / Document / Compare views are separate from stages and from the model picker.
The context list shows exactly what the next run sends; the model picker shows source, model and a cost estimate before Send.
Save state is always visible: Saving, Saved, Failed (kept locally) or Conflict.
The inspector shows the selection’s requirement, task, test and revision links, plus stage readiness.
MOTION
Stage switch
Work area cross-fades 160 ms with a 4 px slide (spring-ui). The latest click wins; nothing remounts or reloads.
Stage pill
White pill slides to the new stage, 200 ms spring-ui.
Panels
Chat and inspector collapse in 320 ms spring-panel; the board keeps its viewport.
GenUI card
Details expand in place, height 180 ms; focus stays on the card.
Save state
Text swaps with a 140 ms fade. No spinner without a real progress value.
Reduce Motion
All swaps are instant. Status changes are still announced.
STORIES
F101
PRD
New
Eight-stage header in order with text status and counts; readiness derived from artifacts and evidence (R-WF-1, R-WF-3, R-WF-6, R-WF-8).
F102
Momo
New
Stage click switches the workspace in place and restores per-stage state; never approves (R-WF-2, R-WF-9, R-WF-10, R-MOT-1).
F103
PRD
New
Project context bar: project, increment, accepted spec revision (§7.11).
F104
OpenDesign
New
Artifact tabs separate from stages, with dirty-draft marks and Hand off (§7.11, R-WF-12, R-WS-8).
F105
OpenDesign
New
Canvas, Preview, Document and Compare views (§7.11).
F106
OpenDesign
New
Context list for the next run; whole board never sent (R-CAN-4).
F107
OpenDesign
New
Model source picker with estimate before Send (R-MOD-1, R-MOD-3, R-MOD-5).
F108
PRD
New
Inspector: links, contract, revisions, evidence, stage readiness (§7.11, R-CAN-3).
F109
OpenDesign
New
Agent inbox, busy chip and a live run row (step, tokens, time, Stop) for jobs and approvals, beside the work (§7.11).
F110
OpenDesign
New
Contextual GenUI families: requirement and gap cards, acceptance checklist, with a table fallback (R-GUI-1, R-GUI-4).
F111
Onlook
New
Usage meter: source, used and cap (R-MOD-10).
F112
PRD
New
Save states and conflict recovery; no silent overwrite (R-CAN-6, R-WF-10).
F113
OpenDesign
New
Canvas tools: select, pan, frame, text, nitpick pin, import, zoom, fit, Ask on select; zoom scales frames, not UI text (R-CAN-1, R-CAN-8, R-WS-4).
F114
OpenDesign
New
Chat controls: history, new chat, collapse, resize, jump to latest, attach, suggestions, Send with the listed context only (R-CAN-4, R-WS-2).
F115
PRD
New
UI language switch, English and Bahasa Indonesia (R-LANG).
F116
Onlook
New
Undo and redo for draft edits on the board (R-CAN-5).
WHERE IT LIVES
Route: /p/:project/:stage, artifact in the query. Back and Forward restore state and never start a paid job (R-WF-11).
UI (TS/React): OpenDesign Studio patterns, Apache-2.0 reuse candidates at commit e033aad: ChatPane, FileWorkspace, ContextChipStrip, InlineModelSwitcher, GenUISurfaceRenderer, HandoffButton.
Core (Rust): stage status, readiness, revisions, saves and conflicts (R-ARC-1, R-ARC-3).
Open for Enrico: accent colour (Q-28; yravgUI clay used here) · UI language order (PRD says Bahasa Indonesia first; drawn in English for this review).
STATES
Design stage · Entry: Projects > Meranti Yard > header: Design. · Data: sample/meranti-yard.mjs → STAGES, FRAMES, REQS, CTX_DESIGN.
Switched to Backend · Entry: From Design, click Backend in the stage header. · Data: sample/meranti-yard.mjs → BACKEND, CTX_BACKEND.
Save conflict · Entry: Design > F-04 tab: edit while r8 is saved in another session. · Data: sample/meranti-yard.mjs → CONFLICT.
Reference: the original UI
OpenDesign (Apache-2.0, commit e033aad) is the main reference. Momo and Onlook are pattern references only. Spekin copies no brand, copy or assets.
OpenDesign Studio. Chat on the left, file tabs, Preview / Code, Export and Share. Spekin keeps the split and adds the stage header and inspector.
OpenDesign canvas. Canvas / Files / Preview tabs, bottom tool bar, “Ask on select”. Spekin uses the same bottom tool bar.
OpenDesign chat. Status and todo cards inside the chat. Spekin’s checklist and requirement cards follow this.
OpenDesign document. Self-check result, files from this turn, next-step suggestions under the reply.
Momo (pattern only, no licence). The header swaps the whole workspace. Spekin does this with eight stages.
Onlook (Apache-2.0). Frames on a canvas with frame chips in the chat. Spekin’s context chips follow this.
```
