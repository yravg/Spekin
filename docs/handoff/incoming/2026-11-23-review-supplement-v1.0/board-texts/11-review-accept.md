# S33 — Review and accept: nitpick pins, stale items and the S08 exact diff

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
CHANGE
S33 · CHANGE · SPEKIN
Review and accept: nitpick pins, stale items and the S08 exact diff

Extends: New. Spekin has no built screen yet; the existing Hub Studio is not used as a baseline (owner, 22 Nov 2026). Frame review inside the S35 shell, then the canonical S08 proposal review. Baseline wireframe BW-07.

Lives in: Spekin web app · /p/meranti-yard/design?review=F-03 (frame review) and /p/meranti-yard/spec/proposals/P-07 (S08 diff). Revision IDs in the path, never draft text.

Pins and review card
Row hover isolates a pin
Stale item
S08 exact diff
Accepted: r15
Rejected: r14 kept
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
Saved 12:51
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
· F-03 draft r7
NEW
Context for the next run
3 items
F-03 Variance table
r7 draft
DESIGN.md
r3
R-DASH-014
r14
Add
F-03 draft r7 and the items listed
S
Spekin
Sonnet 5.5 · 41 s · 26 cr

Reviewed F-03: 7 changes in draft r7.

NEW
REVIEW · F-03 VARIANCE TABLE
Draft r7
1
Page title
Sentence case
2
Threshold chip
Cites r14
3
KPI cards
Equal height
4
Table header
Dim 11 px labels
5
Forecast cell P-03
Padding 12 px
Stale
6
Variance pill P-03
AA contrast
7
Source line
Names spec r14
7 changes
·
1 needs a look
Undo all
Compare
O
Accept 6
↵
Apply the header fix to F-04 (separate review)
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
r7
Draft · not accepted
Variance by package
1
USD million · period 9
Threshold 3% · r14
2
Budget
30.65
3
Forecast
31.32
Variance
+2.2%
Alerts
1
ID
Package
Budget
Forecast
Variance
4
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
5.95
5
+0.8%
6
P-04
Marine spread
4.10
3.96
−3.4%

Source: cost ledger (sample) · Spec r14
7

Ask on select
100%
NEW
F-03 Variance table
Draft r7
Review of 7 changes · base r6 accepted
Review
Revisions
Links
REVISIONS
2
r7
Draft · this review
7 changes · 1 stale · 12:51
Draft
r6
Accepted · base
Accepted 12:12 by Rina (sample)
Accepted
SPEC IMPACT
1 proposal
P-07
Spec proposal r14 to r15
From item 6 and chat · waits in S08
Proposal
Accepting this review
F-03 only

Accept creates F-03 r7 from the changes you kept. Dismissed rows stay out and no other frame changes. Spec changes go through S08.

Open spec proposal
Pins are numbered markers on the frame, one per change, drawn on the part each change names. A dashed pin means the part changed after its nitpick.
One review card per frame sits in the chat: a row per change, named after its element. The footer counts what is left: 7 changes, 1 needs a look.
Accept 6 creates F-03 r7 from the ready changes. Undo all puts all 7 back to r6 in one step. Hold O shows the original.
WHAT IT MUST SHOW
Nitpick pins are numbered markers on the frame, one per change, each on the part it names. A dashed pin marks a stale change.
One review card per frame, in the chat: a row per change named after its element, with a check or a Stale chip.
Pointing at a row isolates its pin and outlines the part. The other pins fade. Keyboard arrows and Enter do the same.
The footer counts what is left: “7 changes · 1 needs a look”. Accept takes the ready changes; Undo all reverts the whole review in one step.
A stale row (the part changed after the nitpick) cannot be accepted without re-evaluation. It offers Re-check and Dismiss, and dismissing is not a pass (AC-57).
S08 shows the spec proposal r14 to r15 as an exact diff, per hunk, with sources, linked requirements, tests and the scope of the approval.
Accept creates exactly one revision (r15, parent r14) and an audit entry. Reject keeps r14 and writes nothing. Both stay visible afterwards.
Pinning a proposal in chat leaves it a proposal. Only Accept in S08 writes the spec (R-GUI-4).
MOTION
Pins
Appear with a 40 ms stagger and a 160 ms fade, ease cubic-bezier(0.23,1,0.32,1) (OpenDesign).
Row hover
The other pins fade to 18% in 120 ms; the pointed pin grows from 20 to 24 px. Leaving restores both in 120 ms.
Stale row
Expands in place, height 180 ms; focus stays on the row (R-GUI-3).
Accept in S08
Hunks settle to Accepted with a 140 ms fade and r15 rises 8 px into the revision list. No spinner without real progress.
Hold to compare
Instant on key down and on key up. No animation, so the frame never looks half-reviewed.
Reduce Motion
Fades and rises become instant. Counts, Stale and Accepted are still announced.
STORIES
F241
Paraframe
New
Nitpick pins: numbered markers on the frame, one per change, each on the part it names; dashed when stale (R-WS-7, Paraframe parity FR-31 to FR-42).
F242
Paraframe
New
One review card per frame in the chat: a row per change named after its element (R-WS-7, R-GUI-1).
F243
Paraframe
New
Pointing at a row isolates its pin and outlines the part; arrows and Enter work without a pointer (R-CAN-7).
F244
Paraframe
New
The footer counts what is left: “7 changes · 1 needs a look” (R-WS-7).
F245
PRD
New
A stale row cannot be accepted without re-evaluation; Re-check and Dismiss stay available and dismissal is not a pass (R-WS-7, AC-57).
F246
Onlook
New
Whole-review Undo returns every change to the accepted revision in one step; a single row can be undone too (R-CAN-5).
F247
PRD
New
Hold to compare with the original and Accept N creates the next frame revision from the ready changes (R-CAN-5, R-WS-7).
F248
Paraframe
New
Apply to other frames is a separate reviewed change set with each target listed (R-CAN-5).
F249
OpenDesign
New
S08 exact diff: word level, per-hunk include, base revision shown (R-EDT-2, R-GUI-4).
F250
PRD
New
Linked requirements, tests, tasks and sources, with what will be marked Needs review (R-EDT-6, R-GUI-4).
F251
PRD
New
Accept creates exactly one revision, r15 with parent r14, and one audit entry; r14 and its evidence stay readable (R-EDT-3, R-PRI-2, R-EDT-9).
F252
PRD
New
Reject keeps r14, writes nothing and records an audit entry; Edit and re-propose stays open (R-EDT-1).
F253
PRD
New
Stale proposal guard: a proposal whose base is no longer current cannot be accepted until it is rebased (R-EDT-4, AC-11).
F254
Momo
New
A pinned proposal in chat stays a proposal; the card never accepts; sources and approval scope show before any write (R-GUI-4, AC-50).
F255
PRD
New
Follow-up tickets from a gap check sit in the same diff and join the ticket board only on accept (R-EVD-5, R-VER-11).
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
Route: /p/:project/design?review=F-03 for the frame review and /p/:project/spec/proposals/:id for S08. Back and Forward restore the view and never accept or reject (R-WF-11).
UI (TS/React): OpenDesign, Apache-2.0 at commit e033aad: comment panel and preview_comments anchors, the __auto_diff_review choice surface in GenUISurfaceRenderer, version panel with digest and parent. Onlook, Apache-2.0: TouchedFiles counts and the stale-edit clash banner. Momo (no licence): pattern only, DocumentDiff Before and After. Code reuse needs a NOTICE entry.
Core (Rust): proposals and hunks, base revision check, one-revision accept, audit log, needs-review marking, snapshot hash (R-ARC-1, R-EDT-3).
Open for Enrico: whether Accept needs a typed reason on Reject · hunk size, word or sentence · whether Accept 6 may also publish the F-03 r7 revision to the board at once.
STATES
Pins and review card · Entry: Projects > Meranti Yard > Design > Variance flows > ask the chat for a review of F-03; the review card appears in the reply and the pins on the frame. · Data: sample/parts/review.mjs → REVIEW_NITS.
Row hover isolates a pin · Entry: In the review card, point at row 4 (Table header). · Data: sample/parts/review.mjs → REVIEW_NITS (n 4, tip, before, after).
Stale item · Entry: Change the P-03 forecast with S32 after pin 5 was set; row 5 turns Stale. Open the card in the chat. · Data: sample/parts/review.mjs → REVIEW_NITS (n 5: seen, now).
S08 exact diff · Entry: Review card > Inspector > Open spec proposal (or the proposal card in the Specification chat > Open diff). · Data: sample/parts/review.mjs → REVIEW_PROPOSAL (hunks, links, affected).
Accepted: r15 · Entry: In the S08 diff click Accept and create r15, then confirm (Cancel is the default). · Data: sample/parts/review.mjs → REVIEW_PROPOSAL.audit.accepted, .accepted.
Rejected: r14 kept · Entry: In the S08 diff click Reject. · Data: sample/parts/review.mjs → REVIEW_PROPOSAL.audit.rejected.
Reference: the original UI
OpenDesign (Apache-2.0) gives the pin-and-list pairing. Momo and Paraframe are behaviour only: no label, wording or asset is copied.
OpenDesign comments panel. A numbered pin on the page and a list of comments, each with a tick. Spekin’s review card keeps the pin-and-row pairing.
OpenDesign pinned comment. The pin and the element outline show together. Spekin isolates one pin by pointing at its row.
OpenDesign document. Self-check result and files from this turn under a reply. Spekin ends the review card with counts and Accept.
OpenDesign checklist card. Status per step inside the chat. The Stale chip and checks follow this row style.
Momo (pattern only, no licence). Before, After, Compare and Approve in one toolbar. Spekin’s S08 diff keeps Accept and Reject apart from the content.
OpenDesign Studio. Chat on the left and the artifact on the right. S08 uses the same split with the diff as the artifact.
```
