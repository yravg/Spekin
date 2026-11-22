# S28 — Reference intake: drop, pick, paste screenshots

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
START
S28 · START · SPEKIN
Reference intake: drop, pick, paste screenshots

Extends: New (BW-02). Sits inside the S35 shell at the Design stage. Import first: drop, choose or paste PNG, JPEG or WebP. Capture from a live page and MCP connect are LATER. Feeds S29 (frames) and S30 (style review).

Lives in: Spekin web app · /p/meranti-yard/design (board in the query; never file names or image data). Reached from Create project, First run, the + tab, or Add references.

Empty board
Dropping files
Imported
Rejected file
Personal data found
Pasted screenshot
S
Meranti Yard
/
Cost variance dashboard
⌘K
Increment
Inc. 2 · Variance alerts
Spec
r14
accepted
Saved 12:41
Hosted
1,240
of 5,000 cr
2
EN
ID
RS
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
· Alert ideas
Context for the next run
0 items
Add
Nothing is sent until you add a reference
S
Spekin
Sonnet 5.5

No references on this board yet. Add screenshots of an app you like and I will learn its look before I draw. I read only the images you add.

What can I add here?
Draw alert ideas without references
Add references, or ask for a screen…
HOSTED
Sonnet 5.5
≈ 18–30 cr
Variance flows
Alert ideas
F-03 Variance table
DESIGN.md
Add references
Canvas
Preview
Document
Compare
Design
Alert ideas
No references yet
Alert ideas
0 images · 0 frames
NEW
Start from what you already have

References teach Spekin the look and the structure you want. Nothing leaves this project unless you add it to a run.

Drop screenshots
PNG, JPEG or WebP from any app, even one behind a login.
Choose files
Paste a screenshot
Copy one, click the board, then press
⌘V
or
Ctrl V
Capture a live page
LATER
Needs an in-app browser. Planned after the first release.
Send frames from your editor
LATER
Connect over MCP. Planned after the first release.
NEW
References
0 images
Private to this project. Used only when you add them to a run.
Drop images here
Choose files
or paste
⌘V
PNG, JPEG, WebP · 10 MB each · 30 max
I may use these images here. They stay private and are never used to train a model.
Spekin checks each image for emails, card numbers and passwords before any model reads it.
THIS IMPORT
empty
Nothing added yet. Files you drop, choose or paste show up here with their status.
NOT YET
planned
Capture a live page
LATER
Connect an editor (MCP)
LATER
Originals are deleted 30 days after import, unless you keep them.
Drag files over the board: the whole board lights up as the drop target. Dropping on the chat or the panel does nothing.
Press ⌘V (Ctrl+V) with the board focused: a preview opens first. Nothing uploads until you click Add.
Tab to a LATER card: it is skipped, because it is disabled. Hover says what is missing.
WHAT IT MUST SHOW
Import comes first: a drop zone, a file picker that works with the keyboard, and paste with Cmd or Ctrl+V. Nothing is read without a choice the user made (R-WS-2).
The accepted types and the size limit are always visible: PNG, JPEG, WebP, 10 MB each, 30 per reference (limits are assumptions until the owner sets them).
A consent line and a personal-data line sit in the panel, not in a dialog: the user may use these images, they stay private, no model training (R-REF-16, R-SEC-4).
Every file has its own status: waiting, uploading with a real percentage, added, refused or stopped. Cancel on one file sends no job for it.
A refused file gets a band with the reason and Retry. Images already added are kept, and a retry never adds the same image twice.
Emails, card numbers and passwords found in an image hold it: blur a copy before any model reads it, or remove the image (R-REF-7).
Reference frames are titled by source (ID, file name, kind, size) and the style job shows a real estimate before and while it runs.
Capture from a live page and MCP connect are shown as LATER and cannot be used.
MOTION
Drop target
Lights up with an accent edge in 120 ms and clears in 160 ms when the pointer leaves. No layout shift.
Progress
Bars move with real bytes sent; no spinner without a value. A finished file turns to Added with a 140 ms text swap.
New frame
The board pans to the new frame in 250 ms; the frame rises 8 px and fades in 0.24 s, 40 ms after the one before it.
Refusal band
Slides down 200 ms spring-panel and stays until the user acts. Retry replaces the band with a progress row in place.
Paste preview
The ghost frame fades in 160 ms at the drop seat; Add moves it to a real frame without a jump.
Reduce Motion
Panning and fades are instant. Progress still updates and every status change is announced.
STORIES
F141
Paraframe
New
Empty board start cards: drop screenshots, paste, and two LATER options. Wording follows the UI language; file names stay as they are (R-WS-2, R-LANG-1, FR-02, FR-03).
F142
OpenDesign
New
Reference panel: accepted types, size limit, per-import cap, queue, and the retention line; originals purged after purge_at (R-WS-2, R-REF-17, FR-10).
F143
OpenDesign
New
File picker: Choose files, reachable by Tab and Enter, no read before the choice (R-WS-2, FR-02).
F144
Onlook
New
Drop zone: the board lights up, per-file progress, Cancel on one file sends no job (R-WS-2, FR-02).
F145
Paraframe
New
Paste on the board with Cmd or Ctrl+V: the image arrives as a preview, never straight to a run (R-WS-2, FR-03).
F146
PRD
New
Consent line: the user may use the image, it stays private, never trains a model (R-REF-16, R-SEC-4, R-WS-2).
F147
Onlook
New
Reference frames titled by source on the board: ID, file name, kind, size (R-WS-1, FR-11).
F148
PRD
New
Per-file status and Retry: finished uploads are kept, a retry never duplicates (R-WS-2, R-SEC-6).
F149
Momo
New
Learning style job chip with estimate and Cancel; it waits when an image is held (R-MOD-3, R-SEC-6).
F150
Onlook
New
Refusal band: names the file and the reason, offers Retry and Choose another (R-SEC-6).
F151
PRD
New
Personal data found: emails detected, blur a copy or remove; the model does not read the image until then (R-REF-7).
F152
Paraframe
New
Pasted screenshot preview with a name field; Add or Discard, nothing uploaded before Add (R-WS-2, FR-03).
F153
Paraframe
New
Capture from a live page: shown, disabled, tagged LATER (FR-04 to FR-09).
F154
Paraframe
New
Send frames from an editor over MCP: shown, disabled, tagged LATER (FR-47).
F155
PRD
New
Context list names the reference IDs and revisions of the next run; no silent send of the whole board (R-GUI-5, R-GUI-11).
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
Route: /p/:project/design, board in the query. Paste works only while the board has focus (R-WS-2).
UI (TS/React): Onlook (Apache-2.0): canvas/image/ingest.ts, dropSeat.ts, aspect.ts (copyable), RefusalBand.tsx. OpenDesign (Apache-2.0, commit e033aad): ProjectReferenceModal, composer attachment and paste. Code reuse needs a NOTICE entry. Momo: only the idea of a skeleton while data arrives. Paraframe: behaviour only.
Core (Rust): type sniffing, size limit, content hash for no-duplicate retry, personal-data detection and blur, consent record, purge_at (R-REF-7, R-REF-17).
Open for Enrico: size limit (10 MB drawn) and the 30 per reference cap are assumptions · retention default 30 days (Q-06) · whether personal-data detection runs on the device or on the server.
STATES
Empty board · Entry: Projects > Meranti Yard > Design > open tab + > Alert ideas (new board). · Data: sample/parts/intake.mjs → INTAKE_LIMITS.
Dropping files · Entry: Design > Alert ideas > drag 3 files from the desktop over the board. · Data: sample/parts/intake.mjs → INTAKE_REFS (r3, r4, r5), INTAKE_LIMITS.
Imported · Entry: Design > Alert ideas > drop 3 files > wait for the last one. · Data: sample/parts/intake.mjs → INTAKE_REFS (r3, r4, r5).
Rejected file · Entry: Design > Alert ideas > drop payroll-export.png (14.2 MB) with 3 other files. · Data: sample/parts/intake.mjs → INTAKE_LIMITS, INTAKE_REFS.
Personal data found · Entry: Design > Alert ideas > drop tracker-weekly.webp > Held banner appears. · Data: sample/parts/intake.mjs → INTAKE_PII, INTAKE_REFS (r4).
Pasted screenshot · Entry: Design > Alert ideas > click the board > press Cmd or Ctrl+V. · Data: sample/parts/intake.mjs → INTAKE_REFS (r6).
Reference: the original UI
Onlook and OpenDesign (Apache-2.0) are pattern references. Paraframe has no screenshots here: its capture-or-drop start screen is described in the stories. Momo has no licence.
Onlook (Apache-2.0). Images become frames on a canvas through ingest and drop seats. Spekin titles each frame by source.
OpenDesign canvas. An import entry in the bottom tool bar and Ask on select. Spekin adds the panel with limits and status.
OpenDesign chat. Status cards with checklist steps. Spekin’s style job card follows this.
```
