# S29 — Frames canvas: board, frames, prompt bar and jobs

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
FRAMES
S29 · FRAMES · SPEKIN
Frames canvas: board, frames, prompt bar and jobs

Extends: New (BW-03). Spekin has no built canvas screen and OpenDesign has no host-side board, so the board follows Onlook patterns (Apache-2.0) and Paraframe behaviour, written in our own words. It is the Design stage of the S35 shell.

Lives in: Spekin web app · /p/meranti-yard/design (board, selected frames and camera in the query; never prompt text or keys).

Board
Multi-select
Frame chat
Jobs running
Zoomed out
Empty board
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
NEW
Variance flows
F-03 Variance table
F-04 Alert drawer
DESIGN.md
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
6 frames · 5 takes
F-01
Portfolio overview
r4
Portfolio overview
Meranti Yard · USD m · sample
Period 06
Budget
30.65
Forecast
31.65
Variance
+3.3%
Alerts
2
F-02
Package drill-down
r2
P-01 Jacket fabrication · cost lines
Meranti Yard · USD m · sample
Period 06
Budget
12.40
Forecast
13.10
Variance
+5.6%
Lines
5
Line
Budget
Forecast
Change
Share
Steel supply
4.20
4.55
+0.35
34%
Fabrication labour
5.10
5.31
+0.21
41%
Coating
1.30
1.42
+0.12
10%
Load-out
0.90
0.92
+0.02
7%
Engineering
0.90
0.90
+0.00
7%
F-03
Variance table
r6
Variance table
Meranti Yard · USD m · sample
Period 06
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
Variance
Status
P-01 Jacket fabrication
12.40
13.10
+5.6%
Alert
P-02 Topside piping
8.25
8.31
+0.7%
OK
P-03 Hook-up and commissioning
5.90
6.28
+6.4%
Alert
P-04 Marine spread
4.10
3.96
−3.4%
OK
Forecast against budget, USD m
1280 × 900
F-04
Alert drawer
r1
Draft
Variance table
Meranti Yard · USD m · sample
Period 06
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
Variance
Status
P-01 Jacket fabrication
12.40
13.10
+5.6%
Alert
P-02 Topside piping
8.25
8.31
+0.7%
OK
P-03 Hook-up and commissioning
5.90
6.28
+6.4%
Alert
P-04 Marine spread
4.10
3.96
−3.4%
OK
Forecast against budget, USD m
Alerts · 2
P-03 Hook-up
+6.4% · 2 periods over
P-01 Jacket
+5.6% · 3 periods over
F-05
Empty state
r1
Draft
Variance table
Meranti Yard · USD m · sample
Period 06
Budget
30.65
Forecast
31.65
Variance
+3.3%
Alerts
2
No package is over 3% this period
Next review: period 07
REF-02
Site cost report
Reference, not editable
F-03
alternatives
5 takes
Open stack
Variance table
Meranti Yard · USD m · sample
Period 06
Variance
+3.3%
Forecast
31.65
Alerts
2
Package
Budget
Forecast
Variance
Status
P-01 Jacket fabrication
12.40
13.10
+5.6%
Alert
P-02 Topside piping
8.25
8.31
+0.7%
OK
P-03 Hook-up and commissioning
5.90
6.28
+6.4%
Alert
P-04 Marine spread
4.10
3.96
−3.4%
OK
Forecast against budget, USD m
NEW
NEW
3 chats
F-03 Variance table
r6
DESIGN.md
r3
Ask about F-03 Variance table
HOSTED
Sonnet 5.5
≈ 18–30 cr
1 frame · 9k tokens
Enter to send
NEW
20%
Click a frame: its ring and 8 handles stay 8 px wide at every zoom. A press that moves less than 3 px is still a click, so a shaky click never nudges a frame.
Zoom scales the frames only. Titles, chips, tools and these notes keep their size at 20%, 100% and 400%.
REF-02 is a picture, not an editable frame (PNG, imported). It can feed a run as a reference but has no element edits.
Pointing at the stack behind the bar deals out the 3 earlier chats. The bar always names its scope: the board, one frame, or N frames.
WHAT IT MUST SHOW
An infinite board of frames. Zoom scales the frames; tools, titles, chips and handles keep their size on screen.
Tool palette: select, pan, frame, text, nitpick pin, import. Each has a key, and every drag action has a non-drag route (frame list, keyboard).
View menu and zoom control: fit, fit selection, 100%, zoom in, zoom out, with their keys.
Each frame shows its title, revision chip, Export and more. Accepted, draft and reference frames look different.
The prompt bar names its scope (board, one frame, N frames) and lists exactly what the run gets. Earlier chats wait behind it.
Selection uses counter-scaled rings and handles. A selection that is off screen is marked at the edge, with a Recenter button.
Frame covers show designing, waiting and failed with Retry. The top bar counts designing and waiting jobs and notes when capacity is full.
Empty, zoomed-out and busy boards are drawn, not left to chance.
MOTION
Camera
Fit, Fit selection and Recenter move the camera in 250 ms (Onlook). Opening a board is instant. Zoom steps use the same ease.
Selection
Ring and handles fade in over 120 ms. Their size is counter-scaled, so they never change on screen.
Chats behind the bar
Deal out with a 40 ms stagger, 240 ms each, ease cubic-bezier(0.23,1,0.32,1) (OpenDesign); fold back in 160 ms.
Frame cover
The designing ground breathes on a 2.8 s cycle, opacity .5 to 1. Waiting and failed covers are still.
Busy chip
The dot pulses on a 1.6 s cycle while any job runs. The count text swaps with a 140 ms fade.
Reduce Motion
Camera moves jump, the breathing ground and the pulse stop, chats appear without a stagger. Status text still changes.
STORIES
F161
OpenDesign
New
Board header inside the S35 shell (project bar, stages, artifact tabs, view switch, saved state; those controls are S35 F101-F116): named board, Hand off of accepted frames only, Undo and Redo for board actions (R-CAN-1, R-CAN-3, R-CAN-5, R-CAN-6).
F162
Onlook
New
Tool palette: select, pan, frame, text, nitpick pin, import, each with a key. A press under 3 px is a click, over 3 px a drag (R-CAN-1, R-CAN-8).
F163
Paraframe
New
View menu and zoom: fit, fit selection, 100%, in, out. Zoom scales frames, never UI text (R-CAN-1, R-WS-4).
F164
Paraframe
New
Frame chrome: title (name or source), revision chip, Export, more. Accepted, draft and reference frames differ; a reference gets no element edits (R-CAN-2, R-CAN-3).
F165
Onlook
New
Selection: counter-scaled ring and handles, Shift and box multi-select, Alt-drag duplicate (R-CAN-1).
F166
Onlook
New
Off-screen selection marks at the view edge and a Recenter button (R-CAN-1).
F167
Paraframe
New
Prompt bar: scope-aware text, chips for the exact frames, DESIGN.md revision and requirements before Send; the whole board is never sent (R-CAN-4, R-WS-6, R-MOD-3).
F168
Paraframe
New
Earlier chats stacked behind the prompt bar, dealt out on pointing; the chat panel can be reopened beside the board (R-CAN-4).
F169
Paraframe
New
Frame chat scoped to one frame (its context list, composer and model picker are the S35 chat controls, F106, F107, F114) with Improve, 5 takes and Nitpick suggestions; a duplicated frame carries its messages with Clear and Undo (R-WS-6, FR-26).
F170
Onlook
New
Frame covers: designing on a breathing ground, waiting for a slot, failed with a reason and Retry; the accepted revision stays under the cover (R-WS-6, R-MOD-8, AC-SPK-15).
F171
PRD
New
Busy chip in the top bar counts designing and waiting jobs; a capacity note appears when jobs exceed the slots and nothing is dropped (R-MOD-10).
F172
Onlook
New
Empty board: start from spec requirements that have no frame, draw one, import a reference, or describe the screen (R-WS-4, R-CAN-2).
F173
Paraframe
New
Zoomed-out overview keeps rounded frames and fixed-size titles; sections group frames; takes collapse into one stack card (R-CAN-1, R-WS-4).
F174
PRD
New
Frame list and keyboard route: every canvas action has a non-drag path; below 768 px the board becomes a frame list and viewer (R-CAN-7, R-CAN-8, AC-SPK-5).
F175
Paraframe
New
Lineage: a duplicated frame shows where it was copied from, and a click selects the source (R-CAN-3).
WHERE IT LIVES
Route: /p/:project/design, board, selected frames and camera in the query (?board=variance-flows&f=F-03&z=20). Back and Forward restore the camera and never start a paid job (R-WF-11).
UI (TS/React): Onlook patterns, Apache-2.0, a NOTICE is needed if code is reused: Canvas, CanvasToolbar, NodeResizeHandles, FrameRing, OffscreenSelectionMarks, RecenterButton, FrameCover, BreathingGround, EmptyCanvasIllustration. OpenDesign (Apache-2.0, e033aad): ContextChipStrip, InlineModelSwitcher for the bar chips and model chip. Momo has no licence: layout ideas only.
Core (Rust): board layout and revisions, resolving a selection to the exact run context, the job queue and slot cap, save and conflict states (R-ARC-1, R-ARC-3).
Open for Enrico: Hosted slot cap (drawn as 2) · whether the bar stays while the chat panel is open (drawn: hidden) · key set, Cmd on Mac and Ctrl elsewhere.
STATES
Board · Entry: Projects > Meranti Yard > Design > Variance flows; click F-03. · Data: sample/parts/canvas.mjs → CANVAS_FRAMES, CANVAS_CHATS.
Multi-select · Entry: Design > Variance flows: Shift-click F-03, F-04, then F-05, which is below the view. · Data: sample/parts/canvas.mjs → CANVAS_FRAMES.
Frame chat · Entry: Design > Variance flows: Alt-drag F-03 to copy it, then More > Open chat on F-04. · Data: sample/parts/canvas.mjs → CANVAS_FRAMES; sample/meranti-yard.mjs → FRAMES.
Jobs running · Entry: Design > Variance flows: ask for changes on F-02, F-03, F-04 and F-05 in a row; two run, one waits, one fails. · Data: sample/parts/canvas.mjs → CANVAS_JOBS.
Zoomed out · Entry: Design > Variance flows > zoom control > View menu, then zoom out to 10%; point at the chat stack. · Data: sample/parts/canvas.mjs → CANVAS_VIEWMENU, CANVAS_CHATS.
Empty board · Entry: Projects > Meranti Yard > Design > New board. · Data: sample/meranti-yard.mjs → REQS.
Reference: the original UI
Onlook (Apache-2.0) and OpenDesign (Apache-2.0) are pattern references. Momo has no licence and Paraframe is proprietary: behaviour only, no labels, wording or assets.
OpenDesign canvas. Bottom tool bar, Ask on select, device frames. It has no board of many frames, so Spekin adds one.
Onlook (Apache-2.0). Frames on an infinite canvas with a left tool rail. Spekin follows its rings, handles and Recenter.
Momo pinboard (pattern only, no licence). Canvas and Grid toggle, zoom stepper, Reset Canvas and a floating input bar at the bottom centre. Spekin takes the zoom group and the floating bar, not the cards.
OpenDesign Studio. Export and Share sit on the artifact toolbar, and a status line with next-step suggestions follows each reply. Spekin puts Export on every frame and keeps the suggestions in the frame chat.
OpenDesign comment pin. A selected element shows a size, colour and font readout beside a comment box. Spekin uses the same idea for the size readout and the Nitpick pin.
OpenDesign chat. Progress and todo cards under a reply show work in flight. Spekin shows the same on the frame itself, as a cover, and in the top-bar busy chip.
```
