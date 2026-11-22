# T01 — Tablet and phone: frame list, review and hand off

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
DEVICES
T01 · DEVICES · SPEKIN
Tablet and phone: frame list, review and hand off

Extends: New. The browser app below 1024 px (BW-T01, BW-M01 to BW-M03): the same project, the same routes, a different layout. Replaces free-position canvas editing with a frame list and a single-frame viewer (R-WS-4, R-CAN-8).

Lives in: Spekin web app · the same routes as desktop (/p/meranti-yard/design). The layout changes by width: 768 to 1023 px tablet, under 768 px phone. No separate mobile app.

Tablet board
Tablet frame review
Phone list
Phone frame review
Phone hand off
Tablet
820 × 1180 px, shown at 68%
≥ 1024 · desktop canvas (S29)
768–1023 · list and frame
under 768 · list, frame, sheet
12:41
S
Meranti Yard
Inc. 2 · Spec r14
Design
Hosted
1,240
RS
Frames
Style
Review
3
Hand off
NEW
Frames
5 on this board
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
F-01 Portfolio overview
r4
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
F-03 Variance table
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
Alerts · 2
P-03 Hook-up
+6.4% · 2 periods
P-01 Jacket
+5.6% · 3 periods
F-04 Alert drawer
r1
Draft
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
F-03 alternatives
3 takes
Pending
REF-02 Site cost report
PNG
Reference
Import a reference
3
Review queue
1 change, 1 draft, 1 gap
NEW
F-03 Variance table
Accepted r6
Open context
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
Canvas editing is on desktop. Review, compare and hand off work here.
Status
Accepted r6
Requirement
R-DASH-014
Edited
12:41 · Rina
r6
Accepted · 12:41 · Rina (sample)
Baseline
r5
Accepted · yesterday
Earlier
r4
Accepted · 19 Nov
Earlier
Compare
Propose change
ONE SCREEN, THREE LAYOUTS
the layout follows the width, not the device
Desktop · 1024 px and up
Chat, board canvas and inspector side by side (S29, S35).
Tablet · 768 to 1023 px
Frame list and one frame. Context opens in place of the list.
Phone · under 768 px
List, then one frame; tabs at the bottom.
TOUCH RULES ON EVERY SMALL SCREEN
44
Every target is 44 × 44 px or larger, with 8 px between neighbours.
Actions are always on screen. Nothing waits for hover.
Popovers and menus become bottom sheets with a grabber and a scrim.
Safe areas stay clear: 28 px top and 22 px bottom on the tablet, 50 and 34 on the phone.
Body text is 16 px, so the browser never zooms into a field.
Reduce Motion: sheets and panels appear without sliding. Status stays as text.
Rotate or resize: at 1024 px and wider the same screen becomes the desktop canvas (S29). The layout follows the width, never the device name.
Tap a frame: the viewer changes in place. The list keeps its scroll and its selected row; nothing reloads and nothing is approved.
WHAT IT MUST SHOW
Below 1024 px the free canvas is replaced by a frame list and a single-frame viewer. Review and hand off stay fully available; canvas editing says it is on desktop.
Tablet (768 to 1023 px): the list sits beside one frame. Context and review open in place of the list, never stacked beside the viewer.
Phone (under 768 px): a frame list, then one frame, then sheets. Tabs for Frames, Style, Review and Hand off sit at the bottom, in thumb reach.
Every target is 44 px or larger. Actions are always visible: no hover, no hold, no drag. A bottom sheet replaces a popover or a context menu.
Safe areas stay clear at the top and bottom. Text is 16 px so the browser never zooms into a field.
Review shows Original and Changed as a toggle, then Dismiss and Apply change always in view; Apply asks first and Cancel is the default.
Hand off lists accepted revisions only, shows why a draft is left out, and builds one fixed snapshot with a ready sheet or a Retry.
MOTION
Bottom sheet
Rises 220 ms ease cubic-bezier(0.23,1,0.32,1) with a scrim fade of 160 ms. It closes by Cancel, a scrim tap or a swipe down.
Panel swap
On a tablet the review panel replaces the list in 200 ms spring-ui; the viewer keeps its frame and zoom.
Frame to frame
The viewer cross-fades 160 ms; the list keeps its scroll position. No reload.
Tab change
The bottom tab marker slides 200 ms; the page does not reload and never approves anything.
Reduce Motion
Sheets and panels appear without sliding. Status stays as text, and every action stays available (R-MOT-4).
STORIES
F341
PRD
New
One screen, three layouts by width: desktop canvas, tablet list and frame, phone list, frame and sheet (R-WS-4, R-CAN-8).
F342
PRD
New
Tablet board: frame list beside a single-frame viewer with status, revisions, Compare and Propose change (BW-T01, R-WS-4).
F343
PRD
New
Context and review panel opens in place of the frame list, never stacked beside the viewer (BW-T01).
F344
PRD
New
Workspace tabs Frames, Style, Review and Hand off with a review count; a tab never approves anything (BW-M01, R-WF-2).
F345
PRD
New
Phone frame list: search, status filter, status pills, and import a reference with a file picker (BW-M01, R-WS-2).
F346
PRD
New
Non-drag alternatives to canvas edits: a row actions sheet with Open, Move earlier, Move later, Duplicate and Compare (R-CAN-8, R-MOT-4).
F347
Paraframe
New
Single-frame review: an Original and Changed toggle replaces hold-to-peek, with a whole-frame compare (BW-M02, R-WS-7).
F348
PRD
New
Apply change and Dismiss always in view; a confirm sheet with Cancel as the default; a stale finding must be re-checked first (BW-M02, R-WS-7, AC-57).
F350
PRD
New
Phone hand off: accepted revisions only; drafts and pending alternatives are disabled with the reason (BW-M03, R-WS-8, AC-58).
F351
PRD
New
Prepare download with a ready sheet, or Retry of the same snapshot; the handoff is not an execution command (BW-M03, R-WS-8).
F352
Momo
New
Touch rules: 44 px targets, safe areas, 16 px text, no hover-only actions, Reduce Motion honoured (R-CAN-8, R-MOT-4).
F353
OpenDesign
New
Bottom sheet with grabber and scrim in place of popovers and menus on touch (Momo drawer pattern, OpenDesign mobile layout).
F355
PRD
New
Compact usage chip in the app bar opens Models and usage (R-MOD-10, S36).
F356
PRD
New
The eight-stage header becomes one stage chip that opens a sheet listing all stages with their status (R-WF-1, R-WF-2).
WHERE IT LIVES
Route: the same as desktop (/p/:project/:stage). Width decides the layout through container queries, not the user agent. Below 768 px free-position canvas editing is not offered (R-WS-4).
UI (TS/React): OpenDesign responsive layout (Apache-2.0, e033aad) for stacked panels and sheets; Momo (no licence) drawer, hover:none branch and safe-area insets as patterns only. Frame list, viewer, review bar and hand-off list are Spekin components over the same core calls as desktop.
Core (Rust): the same review, revision and manifest calls as desktop. The hand-off snapshot is built once and pinned (R-WS-8).
Open for Enrico: bottom tab bar (drawn) or top tabs as in the wireframe · whether Style is read-only on a phone · tablet landscape (drawn portrait only).
STATES
Tablet board · Entry: Open a Meranti Yard link on a tablet (820 px wide) > Design > Frames. · Data: sample/parts/models.mjs → MODELS_DEVICE_FRAMES; sample/meranti-yard.mjs → FRAMES.
Tablet frame review · Entry: Tablet > Frames > click Review queue (the panel replaces the list) > finding 1. · Data: sample/parts/models.mjs → MODELS_FINDING.
Phone list · Entry: Open the link on a phone (390 px wide) > Frames > tap ⋯ on F-03. · Data: sample/parts/models.mjs → MODELS_DEVICE_FRAMES.
Phone frame review · Entry: Phone > Review tab, or Frames > tap a frame > Apply change. · Data: sample/parts/models.mjs → MODELS_FINDING.
Phone hand off · Entry: Phone > Hand off tab > Prepare download. · Data: sample/parts/models.mjs → MODELS_BUNDLE.
Reference: the original UI
OpenDesign (Apache-2.0) runs at phone width by stacking its panels; Spekin goes further with a frame list and sheets. Momo (no licence) is a pattern reference only.
OpenDesign at 390 px. The studio stacks into one column with scrolling tabs. Spekin keeps one column but adds a bottom tab bar and sheets.
OpenDesign. A phone frame shown inside the app: the device sits in the middle with its actions above. T01 uses the same device frame with Spekin controls inside.
OpenDesign. Several phone screens side by side on one stage. T01 shows two states side by side where it helps.
```
