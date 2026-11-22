# S38 — Contextual GenUI panel in chat

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
GENUI
S38 · GENUI · SPEKIN
Contextual GenUI panel in chat

Extends: New. A response and detail panel inside the project shell S35, not a ninth stage. Review stays canonical on S08; the board stays S29. Pattern: OpenDesign GenUISurfaceRenderer and QuestionForm, Onlook QuestionSheet, Momo per-block reveal (own build).

Lives in: Spekin web app · inside the chat of any stage (/p/meranti-yard/design shown). Chat width is user-resizable; 470 px here. Pinned items live on the board (S29).

Streaming
Cards rendered
Question sheet
Table fallback
Confirm a paid action
Pinned to the board
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
Design chat
· F-04 selected
NEW
Context for the next run
3 items
F-04
r1
R-DASH-014
r14
REF-02
r1
Add
≈ 6.4k tokens · 3 items listed
S
Spekin
Sonnet 5.5 · streaming

Checked F-04 against spec r14. Blocks 1 and 2 are ready; block 3 is still being written.

REQUIREMENT
ACCEPTED ARTIFACT · R14
R-DASH-014 · Variance threshold per package
Flag a package when forecast exceeds budget by more than 3%.
Source: brief §2 · REF-02
Details
Pin
GAP
MODEL PROPOSAL
No empty state when no package is over
Proposed: show “No package over 3% this period”.
Not in the spec · needs review
Edit
Pin
ACCEPTANCE CHECKLIST
WRITING BLOCK 3 OF 3
AC-DASH-019 · Alert after 2 periods over 3%
Alert raised after 2 periods over 3%
Threshold read from accepted s
Actions turn on when the block is complete
Pin
Writing block 3 of 3
1.9k tokens · 12 s
Stop
Ask for a change to F-04, or @ another frame…
NEW
HOSTED
Sonnet 5.5
≈ 18–30 cr
NEW
Variance flows
F-03 Variance table
F-04 Alert drawer
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
Spekin is writing · F-04
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
Per-block reveal: each block fades in over 0.24 s with an 8 px rise. Only the block being written is a skeleton, drawn from the title and rows that have arrived.
Partial means inactive: Pin stays off until the block is complete and validated. Stop drops the partial block and keeps the finished ones (R-GUI-7).
WHAT IT MUST SHOW
GenUI uses only registered card families: requirement or gap, alternatives, acceptance or evidence checklist. Anything else falls back to a table and a short reason.
Every card says what it is, by icon and words: Accepted artifact, Model proposal or Imported observation.
A streaming reply reveals block by block. The block being written is a skeleton with aria-busy and its actions are off.
Questions come as a stepped sheet. The recommended option is marked, never pre-selected, and answers stay in the sheet until sent.
A card never shows invented data: a missing figure reads Not provided, an untested item is never green.
A paid or committing action states the exact effect and cost, re-checks actor, permission, revision and budget, and shows failure plainly.
Pinning keeps a proposal a proposal. S08 shows the exact diff before any canonical write.
Everything works by keyboard: no drag, no focus theft, and reduced motion is respected.
MOTION
Block reveal
0.24 s, 8 px rise, ease 0.22 / 1 / 0.36 / 1, stagger capped at 0.16 s. Momo pattern, own build.
Streamed text
Per-character reveal 0.4 s, blur 10 px to 0, 10 ms stagger, capped near 2 s (OpenDesign). No cursor.
Details
Expand in place, height 180 ms. Focus and edits stay on the card.
Question step
Sheet enters 220 ms with a small overshoot (Onlook bubble); dots fill in 140 ms.
Confirm
Sheet enters 250 ms (spring-panel). While running the button shows a busy state, never a made-up bar.
Reduce Motion
Blocks appear at once, skeletons are static grey. Stream progress is announced politely, once per block.
STORIES
F321
OpenDesign
New
Provenance labels on every card: Accepted artifact, Model proposal, Imported observation (R-GUI-1, R-GUI-4).
F322
Momo
New
Closed registry of card families, unknown components rejected (R-GUI-2, R-GUI-12).
F323
Momo
New
Per-block progressive reveal with a skeleton from partial data and aria-busy; partial blocks have no active actions (R-GUI-7).
F324
OpenDesign
New
Stream status row: block count, tokens, time and Stop, with no fake progress (R-GUI-7, R-GUI-11).
F325
OpenDesign
New
Details, Edit and Compare in place, keeping focus and edits, with stable IDs (R-GUI-3).
F326
Onlook
New
Stepped question sheet with a recommended option, own answer and keys (R-GUI-9).
F327
OpenDesign
New
Choice surface answered in place: pick a take to compare (R-GUI-3).
F328
Momo
New
Table fallback with a one-line reason; copy and rebuild (R-GUI-2, R-GUI-5).
F329
PRD
New
Evidence honesty: untested and failed are never green, a missing figure is never zero (R-GUI-5, AC-SPK-29).
F330
OpenDesign
New
Confirmation surface for a paid action: exact effect, reserve, checks, idempotency (R-GUI-6, R-GUI-11).
F331
PRD
New
Pin to the board; a pin is not an accept; exact diff in S08 (R-GUI-4, AC-SPK-24).
F332
OpenDesign
New
Next-step rows under a reply (OpenDesign NextStepActions).
F335
PRD
New
Export of pinned or tabled data with schema version, IDs, status and sources; no model call (R-GUI-10).
F339
PRD
New
Shell controls kept from S35: artifact tabs, Share (later), Hand off.
Shared shell controls on this board, specified on S35:
F101
New
F102
New
F103
New
F104
New
F105
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
Route: no route of its own. The panel is part of the chat in /p/:project/:stage; pins carry a stable ID and survive reload (R-GUI-3).
UI (TS/React): OpenDesign Apache-2.0 candidates at commit e033aad: GenUISurfaceRenderer, GenUIInbox, QuestionForm, ContextChipStrip, NextStepActions, partial-json.ts (copy needs a NOTICE). Onlook QuestionSheetView is a pattern. Momo has no licence: the skeleton pattern is rebuilt, nothing copied, and its permissive prop repair is not a validation policy (R-GUI-8).
Core (Rust): validates schema version, types, enums, limits and permissions before any action is enabled; budget reserve, idempotency and audit (R-GUI-2, R-GUI-6, R-GUI-7).
Open for Enrico: default credit reserve for a confirm · whether question answers count as one run · where the card registry is versioned.
STATES
Streaming · Entry: Design > chat > send “Check F-04 against the 3% threshold”. · Data: sample/meranti-yard.mjs → FRAMES, REQS; cards from sample/parts/style.mjs → STYLE_CTX.
Cards rendered · Entry: Same chat when the stream ends and all blocks validate. · Data: sample/meranti-yard.mjs → REQS, FRAMES.
Question sheet · Entry: Chat > “Draw an alert drawer” when the period rule is open. · Data: sample/meranti-yard.mjs → REQS (R-DASH-014, R-DASH-019).
Table fallback · Entry: Chat > “Show cost variance by package as a card” when card data fails validation. · Data: sample/meranti-yard.mjs → PACKAGES (P-04 forecast withheld on purpose).
Confirm a paid action · Entry: Chat > “Draw 3 more takes of F-04”. · Data: sample/meranti-yard.mjs → USAGE, MODEL.
Pinned to the board · Entry: Cards rendered > Gap card > Pin. · Data: sample/meranti-yard.mjs → FRAMES (F-04).
Reference: the original UI
OpenDesign (Apache-2.0, commit e033aad) and Onlook (Apache-2.0) are pattern references. Momo has no licence: pattern only, own build. Paraframe has no screenshots here. Spekin copies no brand, copy or assets.
OpenDesign question form. A quick brief inside the chat, answered in place. Spekin’s stepped sheet adds a recommended option.
OpenDesign progress card. Todo and status inside the chat. Spekin’s stream row and checklist follow it.
OpenDesign next steps. Suggestion rows under the reply. Spekin’s next-step rows follow it.
Momo (pattern only, no licence). Cards inside the reply with a source row above. Spekin builds its own cards and labels.
Momo (pattern only). Cards pinned to a board. Spekin’s pin is a Proposal with a dashed link, never an accept.
Onlook (Apache-2.0). Frame chips in the chat. Spekin’s context chips above the reply follow this.
```
