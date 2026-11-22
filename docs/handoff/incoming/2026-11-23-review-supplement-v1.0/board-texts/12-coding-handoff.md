# S34 — Coding hand-off

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
DELIVERY
S34 · DELIVERY · SPEKIN
Coding hand-off

Extends: New. Opens from Hand off in the S35 shell. Downloads or copies only accepted revisions with a fixed manifest. It does not replace S25 (whole-spec export). Uses S29 frames and S33 review outcomes.

Lives in: Spekin web app · /p/meranti-yard/design/handoff (selection in the query as frame IDs and revisions only; never file contents or keys).

Select revisions
Manifest preview
Ready to download
Copied for an agent
Blocked
DESIGN.md stale
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
· hand-off
NEW
Context for the next run
3 items
F-01 Portfolio overview
r4
F-03 Variance table
r6
DESIGN.md
r3
Add
≈ 6.2k tokens · accepted revisions only
Hand off F-01 and the design guide.
S
Spekin
Sonnet 5.5 · 12 s · 6 cr

Ticked F-01 r4 and DESIGN.md r3. F-03 r6 is accepted too; tick it when you want it in. F-04 stays out because it is a draft.

NEW
Hand-off check · 4 items
Show as table
BEFORE THE FILE IS MADE
READY
Only accepted revisions
Yes
DESIGN.md is fresh
r3
No keys, .env or private references
Clear
F-04 draft is left out
Draft
Checked 12:44 on the server
Tick F-03 r6 as well
Explain why F-04 is left out
Ask what is in the hand-off, or @ a frame…
NEW
HOSTED
Sonnet 5.5
≈ 18–30 cr
NEW
Variance flows
F-03 Variance table
Hand off
Share
LATER
Hand off
Design
Coding hand-off
Accepted revisions only
Whole-spec export (S25)
NEW
Select revisions
6
All 6
Accepted 3
Not ready 3
ACCEPTED REVISIONS
3 can be handed off
Portfolio overview
USD m · sample
F-01
r4
Portfolio overview · 1440 × 900
Accepted 11:52
Accepted r4
Variance table
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
F-03
r6
Variance table · 1440 × 900
Accepted 12:20
Accepted r6
DESIGN.md
r3
Design guide
Finalized 12:24
Fresh
NOT READY
greyed, with the reason
Alert drawer
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
Alerts · 2
P-03 Hook-up
+6.4% · 2 periods
P-01 Jacket
+5.6% · 3 periods
F-04
r1
Alert drawer · 1440 × 900
Draft, not accepted. Accept it in review first.
Draft
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
F-03
3 takes
Variance table, 3 takes
Pending alternatives are never bundled. Accept one take first.
Pending
REF-02
r1
Site cost report
Reference image, not a design frame.
Reference
Select all accepted
⌘A
Clear
2 of 3 accepted ticked
NEW
Manifest
2
Files
Agent prompt
DESIGN.md r3 fresh
Re-finalize
Code framework
React
Vue.js
Svelte
Next.js
JS
Manifest
m-0007
· draft
Frame	Rev	Size	sha256	HTML	Screenshot	Guide file

F-01
Portfolio overview
	r4	1440 × 900	1bea36aa…	18.4 KB	212 KB	GUIDE.md#F-01

DESIGN.md
Design guide
	r3	Markdown	e6eb549e…	3.2 KB	none	GUIDE.md#design
F-03 Variance table r6 · not ticked yet
ALSO IN THE ZIP
always included
manifest.json
GUIDE.md
LEFT OUT
3 items
F-04 draft
F-03 pending takes
REF-02 reference image
1 frame · DESIGN.md · guide
≈ 0.2 MB · spec r14 · React
Download zip
⌘↵
Copy for a coding agent
⌘⇧C
Hover a greyed row: its reason shows beside it. Drafts, pending takes, references and stale revisions cannot be ticked.
Tick a row: the manifest on the right gains its row at once. Nothing is written until you Download or Copy.
WHAT IT MUST SHOW
Only accepted revisions can be ticked. Drafts, pending takes, references and stale revisions are greyed, with the reason in words beside them.
The manifest preview shows frame ID, revision, size, sha256, HTML, screenshot and guide file before anything is saved or copied.
Download or Copy seals manifest m-0007. A later edit to a frame never changes it; the next hand-off is a new manifest.
Copy for a coding agent puts one text block on the clipboard and a toast names what went in.
A hand-off is not an execution command and does not replace the whole-spec export (S25).
DESIGN.md turns stale when an accepted frame changes; Re-finalize rebuilds it from accepted frames only.
MOTION
Tick a row
Checkbox fills in 120 ms (spring-ui); the manifest row rises 4 px and fades in over 160 ms.
Manifest
Rows cross-fade 160 ms. Hash text never animates, so it can be read and compared.
Toast
Rises 8 px and fades in over 220 ms with cubic-bezier(0.23,1,0.32,1). Stays 6 s; hover or focus keeps it; fades out in 140 ms.
Copy button
Label swaps to Copied with a check in 140 ms and returns after 2 s.
Re-finalize
Spinner with Cancel while pending, no progress bar without a real value; the label changes with a 140 ms fade.
Reduce Motion
No rise or slide. Changes are instant and still announced to screen readers.
STORIES
F261
PRD
New
Hand-off screen opens from Hand off in the S35 shell, takes accepted revisions only and is not an execution command (R-WS-8, AC-58, AC-SPK-11).
F262
OpenDesign
New
Select list of frames and artifacts: checkbox, thumbnail, revision, status word (R-WS-8, S29).
F263
PRD
New
Drafts, pending takes, references and stale revisions are disabled with the reason; filters and Select all accepted (R-WS-8, R-WF-4).
F264
Paraframe
New
Manifest preview: frame ID, revision, size, sha256, HTML, screenshot and guide file (R-EVD-4, FR-44).
F265
PRD
New
Manifest is fixed when sealed; a later edit makes a new manifest and leaves the old one (R-WS-8, R-EVD-4, AC-SPK-11).
F266
PRD
New
Download zip with a visible file tree and hashes (R-WS-8, AC-58).
F267
OpenDesign
New
Copy for a coding agent with a framework choice: React, Vue.js, Svelte, Next.js, JS (FR-43, HandoffButton).
F268
Paraframe
New
Confirmation toast that says what was copied; fades, hover keeps it (FR-43).
F269
Paraframe
New
Pasted bundle preview: per-frame ID, size, files and hashes, plus a separate guide (FR-44, FR-45).
F270
PRD
New
Blocked state when a draft or stale revision is ticked: reasons, Pick r6, Remove, buttons off (R-WS-8, R-WF-4, R-EVD-4).
F271
OpenDesign
New
Finalize design package: DESIGN.md regenerated from accepted frames, marked stale when frames change (FinalizeDesignButton).
F272
PRD
New
Whole-spec export stays in S25; hand-off links to it and never replaces it (R-WS-8, `7.16).
F273
Onlook
New
Hand-off check card in the chat before a file is made: keys, .env and private references stay out (R-SEC-2, R-SEC-4).
F274
PRD
New
Export record: actor, action, manifest, time; hand-off history never changes (R-SEC-5, R-EVD-4).
F275
Paraframe
New
LATER: one expiring link instead of the long text; expiry must be validated on the server (FR-45, R-SEC-4).
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
Route: /p/:project/design/handoff, selection in the query as frame IDs and revisions. Back and Forward restore it and never download or copy.
UI (TS/React): OpenDesign Studio patterns, Apache-2.0 reuse candidates at commit e033aad: HandoffButton (framework choice, copy prompt, Copied state), FinalizeDesignButton (three labels, stale flag). NOTICE file needed. The open-in-editor part is skipped.
Core (Rust): accepted-revision check, manifest, sha256, zip, privacy pre-check and the export record (R-EVD-4, R-ARC-3). The browser never decides what is accepted.
Open for Enrico: framework list (OpenDesign also has SolidJS; drawn without it) · whether a stale DESIGN.md blocks or is left out (drawn: left out) · link expiry (LATER).
STATES
Select revisions · Entry: Projects > Meranti Yard > Design > Hand off. · Data: sample/parts/delivery.mjs → DELIVERY_ITEMS (F-01, F-03, F-04, takes, REF-02, DESIGN.md), DELIVERY_FRAMEWORKS.
Manifest preview · Entry: Hand off > tick F-03 r6 > click its manifest row. · Data: sample/parts/delivery.mjs → DELIVERY_ITEMS, DELIVERY_MANIFEST (m-0007), sha256 per file.
Ready to download · Entry: Hand off > Files tab. · Data: sample/parts/delivery.mjs → DELIVERY_FILES, DELIVERY_MANIFEST.zip.
Copied for an agent · Entry: Hand off > Copy for a coding agent. · Data: sample/parts/delivery.mjs → DELIVERY_PROMPT, DELIVERY_FRAMEWORKS.
Blocked · Entry: Hand off > reopen yesterday’s selection (F-03 r5, F-04). · Data: sample/parts/delivery.mjs → DELIVERY_BLOCKED.
DESIGN.md stale · Entry: Design > accept F-03 r7 in review > Hand off. · Data: sample/parts/delivery.mjs → DELIVERY_STALE, DELIVERY_ITEMS (DESIGN.md r3).
Reference: the original UI
OpenDesign (Apache-2.0, commit e033aad) is the main reference. Paraframe is described, not copied: no wording or assets are reused.
OpenDesign header. Share and Download sit in the tab bar. Spekin keeps them there and opens a Hand off screen from the button.
OpenDesign share popup. A small panel with a link, one Copy action and a status line. Spekin’s toast follows this size, with its own wording.
OpenDesign document. Files from this turn are listed under the reply. The zip file tree lists files the same way.
```
