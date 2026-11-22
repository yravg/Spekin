# S32 — Targeted change: select a part, instruct, review in place

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
CHANGE
S32 · CHANGE · SPEKIN
Targeted change: select a part, instruct, review in place

Extends: New. Spekin has no built screen yet; the existing Hub Studio is not used as a baseline (owner, 22 Nov 2026). Opens from S29 (shared canvas) inside the S35 shell; accepted later in S33 and S08. Baseline wireframe BW-06.

Lives in: Spekin web app · /p/meranti-yard/design?frame=F-03 (the part is kept in the query as a stable ID; instruction text never goes in the link).

Part selected
Working
Applied in place
Whole-frame compare
Variations
Clip
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
· F-03 selected
NEW
Context for the next run
4 items
F-03 · Forecast cell P-03
part
F-03 Variance table
r6
DESIGN.md
r3
R-DASH-014
r14
Add
Selecting sends nothing and does not open chat
Add an alert drawer to the variance table for packages over 3%.
S
Spekin
Sonnet 5.5 · 34 s · 22 cr

Drew F-04 Alert drawer as a draft. F-03 stays accepted at r6.

Round every forecast to 2 decimals
Show the period count in the pills
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
F-03 Variance table
Variance flows
F-03 at 100%
F-03
Variance table
r6
Accepted
Variance by package
USD million · period 9
Threshold 3% · r14
Budget
30.65
Forecast
31.65
Variance
+3.3%
Alerts
2
ID
Package
Budget
Forecast
Variance
P-01
Jacket fabrication
12.40
13.10
+5.6%
P-02
Topside piping
8.25
8.31
+0.7%
P-03
Hook-up and commissioning
5.90
6.28
Forecast cell
P-03
Size
46 × 22
Type
12.5 px mono
Send
↵
Send to chat
⌘↵
Variations
3
Clip
≈ 4 to 8 cr · Sonnet 5.5
Esc closes
+6.4%
P-04
Marine spread
4.10
3.96
−3.4%

Source: cost ledger (sample) · Spec r14

Ask on select
100%
NEW
Forecast cell
Part
P-03 row in F-03 Variance table r6
Part
Changes
Links
SELECTED PART
Element
Table cell
Text
6.28
Size
46 × 22
Type
12.5 px mono
PARTS IN THIS FRAME
6
Title
Page title
Variance by package
Chip
Threshold chip
Threshold 3% · r14
KPI
KPI cards
4 cards
Head
Table header
5 labels
Cell
Forecast cell
P-03 · 6.28
Selected
Pill
Variance pill
P-03 · +6.4%

No pointer? Tab into the frame, arrow keys move through the parts and Enter selects. This list does the same.

Click a part (Ask on select is on): the outline hugs the part, a pill gets a pill outline, and the popover opens beside it. Nothing is sent and chat stays shut.
Popover placement: right of the part when it fits, then below, left or above. It never covers the tool palette, the zoom control or the prompt bar.
Send stays off while the field is empty. Enter sends, ⌘ Enter sends to chat, Esc closes.
WHAT IT MUST SHOW
Select a part of a frame. The outline hugs the part, and a pill-shaped part gets a pill outline with no gap at the top.
The popover opens beside the part and moves below, left or above when there is no room. It never covers the tool palette, the zoom control or the prompt bar.
The popover has a one-line field, Send (off while the field is empty), Send to chat, Variations with a minus, 3, plus stepper, and Clip (change only this area).
While a change runs, a small spinning pin sits on the part. Selecting does not open chat. Closing the popover keeps the typed instruction.
After it applies in place: change or ask more, hold to compare with the original, Undo, Done (Enter). The result is a draft; nothing is accepted here.
Related values can change with the part (here the forecast moves the variance pill, two KPIs and the alert count). List them, offer whole-frame compare, and never claim the edit is isolated (R-WS-7).
Element variations are reviewed apart from Undo and Done: Variation 1 of 3 with Apply and Dismiss.
Every pointer action has a keyboard path: a parts list, arrow keys and Enter pick a part (R-CAN-7).
MOTION
Outline
Appears in 120 ms, spring-ui. It follows the part if the frame is resized or zoomed.
Popover
Entry 220 ms with a small overshoot, scale 0.96 to 1, from the part (Onlook bubble timing). Moving to another side does not replay the entry.
Spinning pin
One turn per 0.9 s, only while a job really runs. It never decorates an idle part.
Apply in place
Value swaps with a 140 ms fade, ease cubic-bezier(0.23,1,0.32,1) (OpenDesign). Related values follow with a 40 ms stagger.
Hold to compare
The original shows on key down and goes back on key up. No animation, so the frame never looks half-changed.
Reduce Motion
The pin stops turning and shows a still dot. Swaps are instant. Working, Applied and Undone are still announced.
STORIES
F221
Paraframe
New
Ask on select: a click inside a frame selects a part; the outline hugs it and pill parts get pill outlines (R-WS-7, Paraframe parity FR-31 to FR-42).
F222
Paraframe
New
Popover beside the part; moves below, left or above when there is no room and never covers the tool palette, zoom or prompt bar (FR-32).
F223
OpenDesign
New
One-line field “What should change about this element?” with the part name, size and type; closing keeps the text (FR-32, R-CAN-4).
F224
Paraframe
New
Send is off while the field is empty; Enter sends a change to this part only (FR-32, R-CAN-5).
F225
Paraframe
New
Send to chat moves the instruction and the part into the composer instead of running it (FR-32, R-CAN-4).
F226
Paraframe
New
Working: a spinning pin on the part, a job card in chat, a Stop that releases reserved credits; selecting does not open chat (R-MOT-5, R-MOD-3).
F227
Paraframe
New
Applied in place as a draft: change or ask more, Undo, Done (Enter); success alone accepts nothing (FR-35, R-CAN-5, R-GUI-4).
F228
Paraframe
New
Variations stepper (minus, 3, plus) draws N variations of one part (R-WS-6, R-CAN-5).
F229
Paraframe
New
Element variations review: Variation 1 of 3 with Apply and Dismiss, apart from Undo and Done (R-CAN-5).
F230
Paraframe
New
Clip: the change stays inside the part box, nothing grows or moves, text that does not fit is flagged (R-CAN-5).
F231
Paraframe
New
Also changed: related values are listed with before and after; the edit is never called isolated (R-WS-7, FR-36).
F232
PRD
New
Whole-frame compare and hold to compare with the original; selected and outside values are marked differently (R-WS-7, R-CAN-5).
F233
Onlook
New
Undo and redo put back the part and its related values as one step (R-CAN-5).
F234
OpenDesign
New
Part inspector with a parts list: a keyboard way to pick a part; Enter selects, Esc closes (R-CAN-7, AC-SPK-5).
F235
PRD
New
Credit estimate and model source shown before Send; the part, not the board, is the context (R-CAN-4, R-MOD-3).
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
F108
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
F116
New
WHERE IT LIVES
Route: /p/:project/design with frame and part in the query. The part is a stable element ID, never a pixel position. Back and Forward restore the selection and start no paid job (R-WF-11).
UI (TS/React): OpenDesign comment pattern, Apache-2.0 at commit e033aad: comment-bridge (od:comment-target), BoardComposerPopover, anchor drift states. Onlook, Apache-2.0: InlineElementChat bubble placement and useOrbMorph. Code reuse needs a NOTICE entry.
Core (Rust): part IDs and anchors, the change as a draft revision, related-value diff, undo steps, credit reservation (R-ARC-1).
Open for Enrico: Variations default of 3 and the 2 to 6 range · whether Done should also offer Accept in S33 · accent for the selection outline (Q-28).
STATES
Part selected · Entry: Projects > Meranti Yard > Design > Variance flows > turn on Ask on select > click the forecast 6.28 in row P-03 of F-03. · Data: sample/parts/review.mjs → REVIEW_PART.cell; sample/meranti-yard.mjs → PACKAGES, KPIS.
Working · Entry: Select the forecast cell, type “Set the forecast to 5.95 after the re-quote”, press Send (Enter). · Data: sample/parts/review.mjs → REVIEW_PART.cell.ask.
Applied in place · Entry: Wait for the job to end (about 20 s); the bar appears under the frame. · Data: sample/parts/review.mjs → REVIEW_ALSO, REVIEW_OUTSIDE.
Whole-frame compare · Entry: On the applied bar or in the inspector, click Compare whole frame (or the Compare view). · Data: sample/parts/review.mjs → REVIEW_ALSO (5 differing values).
Variations · Entry: Select the P-03 variance pill, type an instruction, leave Variations at 3 and click Variations. · Data: sample/parts/review.mjs → REVIEW_VARIANTS, REVIEW_PART.pill.
Clip · Entry: Select the P-03 variance pill (the right side has no room, so the popover opens below), type an instruction, turn on Clip. · Data: sample/parts/review.mjs → REVIEW_PART.pill.
Reference: the original UI
OpenDesign and Onlook (Apache-2.0) give the popover pattern. Paraframe is behaviour only: no label, wording or asset is copied.
OpenDesign comment entry. A popover beside the picked element: size, colour and type, a text box, Send to chat. Spekin adds Send, Variations and Clip.
OpenDesign pinned comment. A numbered pin on the element and the same popover. Spekin uses a spinning pin while a change runs.
Onlook (Apache-2.0). Frames on a canvas with an inline bubble beside the clicked element. Spekin follows the beside-the-part placement.
OpenDesign canvas. Bottom tool bar with Ask on select. Spekin keeps the palette and zoom clear of the popover.
OpenDesign job card. Steps with status inside the chat. Spekin’s Working card follows this.
Momo (pattern only, no licence). A state strip: Loading, Error, Empty, 4 Variants, Compare, Approve. Spekin lists its own states on this board.
```
