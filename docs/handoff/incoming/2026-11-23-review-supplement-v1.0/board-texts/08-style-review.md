# S30 — Style review: tokens learned from references

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
STYLE
S30 · STYLE · SPEKIN
Style review: tokens learned from references

Extends: New. Spekin has no built screen yet (owner, 22 Nov 2026). Opens from an artifact tab inside S35; promotes into the spec through a proposal on S08. Pattern: OpenDesign DesignKitView module stack, Paraframe style panel, Onlook register status.

Lives in: Spekin web app · /p/meranti-yard/design?artifact=style (stage in the path, artifact in the query; never draft text or keys). BW-04.

Learning
Visual review
Conflict
Markdown
Promote to spec
Accepted
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
Saved 12:34
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
· Style
NEW
Context for the next run
3 items
DESIGN.md
r3
REF-02 Site cost report
r1
REF-03 Package status page
r1
Add
≈ 3.2k tokens · images go to the model only while listed
Learn the style from my two references.
S
Spekin
Sonnet 5.5 · 41 s so far

Reading REF-02 and REF-03. Design requests wait until the style is ready, so every new frame uses it.

LEARNING STYLE
JOB 1 OF 1
REF-02 · all 5 steps
Done
REF-03 · Find type, step 3 of 5
Reading
Write the DESIGN.md draft
Waiting
Learning accepts nothing. It only proposes.
Learning style
6.1k tokens · 41 s
Stop
Ask about a token, or paste a style guide…
NEW
HOSTED
Sonnet 5.5
≈ 18–30 cr
NEW
Variance flows
F-03 Variance table
DESIGN.md
Style · learned
Share
LATER
Hand off
NEW
Learned from references
No style
Saved styles
2
NEW
Keep learning from new references
Learning · 1 of 2 references
NEW
Visual
Markdown
All
9
Accepted
5
Inferred
3
Conflict
1
Accept inferred
Promote to spec

Style is still learning. New designs wait until it ends, so they use the finished style. Chat, frames and review keep working.

NEW
Aa
Learning a style…
Colours found so far, from 2 references
Palette
9 tokens · from both references
Canvas
#FAF9F5 · r3
Accepted
Ink
#1F1F1F · r3
Accepted
Line
#E6E2D8 · r3
Accepted
Accent
#B4532A vs #37664B
Conflict
Success
#3F7D5A · r3
Accepted
Warning
#C98A2B · r3
Accepted
Table band
#F3EFE8 · REF-02 · 12 rows
Inferred
Focus ring
#93B5A0 · REF-03 · 4 focused fields
Inferred
Chart series 2
#8B8440 · REF-02 · 1 chart
Inferred
Spacing
waiting
Waits for the type step
Type
writing · 3 of 6 names known
Display
Title
Heading
Body
Caption
Figures
Radii and icons
waiting
Waits for the type step
Sample controls
waiting
Controls are written last, from the finished tokens
NEW
Style references
2 references
Images you imported in S28. They stay in this project.
References
Tokens
History
REFERENCES
2
Site cost report
REF-02
PNG · imported · 12:31
Read in full · 19 tokens seen
Package status page
REF-03
PNG · imported · 12:33
Step 3 of 5 · Find type
LEARNING JOB
real telemetry
Sonnet 5.5 · Hosted · 6.1k tokens · 41 s so far · 9 credits reserved. Stop keeps what was read as a draft.
Stop learning
Per-block reveal: Palette is finished and shown. Type is still being written, so it is a skeleton built from the names already known, with aria-busy on. No percentage: only real steps.
Designs wait: new frames start after learning ends so they use the finished style. Stop keeps what was read as an Inferred draft.
WHAT IT MUST SHOW
Source picker with three choices: Learned from references, No style, Saved styles. The active choice shows by fill and weight, not colour alone.
A Keep learning toggle with a status in words: Up to date with 2 references, or Learning with a count of references.
Visual and Markdown are one draft. An edit in one shows in the other at once.
Every token row carries a state in words and an icon: Inferred, Accepted or Conflict.
An Inferred token never replaces a confirmed one. A conflict shows both values and contrast; Keep confirmed is the default.
Promote to spec makes a diff proposal with a per-hunk include box. Nothing is written here; S08 accepts it as one Revision.
Learning shows real steps per reference and a Stop. No estimated percentage. New designs wait for it to finish.
MOTION
Module reveal
Each module fades in 240 ms with an 8 px rise and a 40 ms stagger as its data arrives (OpenDesign stagger, Momo reveal, own build).
Skeleton
Only the module being written shimmers (1.4 s linear). It is drawn from names already known and carries aria-busy.
Token accept
The state pill swaps in 140 ms. The row keeps its place; the list never reorders under the pointer.
Switch
Keep learning slides 140 ms (spring-ui). The status text changes with it.
Conflict card
Compares in place; the height change takes 180 ms and focus stays on the button used.
Reduce Motion
All reveals are instant, the shimmer and spinner are static. Status changes are still announced.
STORIES
F181
Paraframe
New
Source picker: Learned from references, No style, Saved styles (R-WS-5, FR-12).
F182
Paraframe
New
Keep learning toggle and a plain-words status (R-WS-5, FR-13).
F183
Paraframe
New
Learning job with real steps per reference, Stop that keeps what was read, and designs that wait (R-GUI-11, FR-14).
F184
OpenDesign
New
Visual tab: module stack of cover, palette, type, spacing, radii and icons, sample controls (R-DS-1, FR-15).
F185
Onlook
New
State on every token row, with filters and counts: Inferred, Accepted, Conflict (R-WS-5, AC-56).
F186
PRD
New
Accept or dismiss Inferred tokens one by one or together, keys A and X (R-WS-5, R-EDT-1).
F187
Onlook
New
Conflict card: confirmed against inferred with contrast; keep confirmed or propose the inferred one (R-WS-5, AC-56).
F188
Paraframe
New
Markdown tab: DESIGN.md as the same draft, edited-line marks, paste surface (R-DS-1, FR-16).
F189
PRD
New
Promote to spec: diff proposal with per-hunk include, sent to S08 (R-EDT-1 to R-EDT-4, R-DS-7).
F191
PRD
New
Accepted state: one Revision, history and revert (R-EDT-3).
F192
PRD
New
A new reference after acceptance adds Inferred tokens only; confirmed values stay (R-WS-5, AC-56).
F193
Paraframe
New
Reference list with thumbnails, job steps and token counts per reference (FR-17).
F195
PRD
New
Shell controls kept from S35: artifact tabs, Share (later), Hand off (R-WF-12, R-WS-8).
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
WHERE IT LIVES
Route: /p/:project/design?artifact=style. Back and Forward restore the tab and filter; they never accept a token (R-WF-11).
UI (TS/React): OpenDesign patterns, Apache-2.0 reuse candidates at commit e033aad: DesignKitView, DesignSystemFlow, DesignSystemPreviewModal. Onlook REGISTER status idea is pattern only. Code reuse needs a NOTICE file.
Core (Rust): token store with a state per token, extraction jobs and steps, conflict detection, proposals, revisions (R-ARC-1, R-EDT-3). Extraction is labelled documented-method and is never auto-accepted (R-DS-7, AC-60).
Open for Enrico: tokens.json format (W3C, an assumption in R-DS-1) · Saved styles per project or per team · Keep learning on by default? · accent colour (Q-28).
STATES
Learning · Entry: Projects > Meranti Yard > Design > Import REF-03 in S28 > Style · learned. · Data: sample/parts/style.mjs → STYLE_REFS, STYLE_STEPS, STYLE_TOKENS.
Visual review · Entry: Style · learned > Visual (learning finished). · Data: sample/parts/style.mjs → STYLE_TOKENS (state per token), STYLE_CTX.
Conflict · Entry: Visual > Accent row > Resolve (or Conflict filter). · Data: sample/parts/style.mjs → STYLE_TOKENS (color.accent, radius.card with alt values), STYLE_contrast.
Markdown · Entry: Style · learned > Markdown tab, then edit line 31. · Data: sample/parts/style.mjs → STYLE_TOKENS rendered as DESIGN.md lines.
Promote to spec · Entry: Style · learned > Promote to spec. · Data: sample/parts/style.mjs → STYLE_HUNKS (proposal P-021).
Accepted · Entry: S08 > accept P-021, then back to Style · learned (REF-04 imported at 13:05). · Data: sample/parts/style.mjs → STYLE_TOKENS (accepted mode), STYLE_NEWTOKEN, STYLE_NEWREF.
Reference: the original UI
OpenDesign (Apache-2.0, commit e033aad) is the main reference. Paraframe is proprietary and has no screenshots here: its style panel is described in the stories only. Spekin copies no brand, copy or assets.
OpenDesign design system. A brand kit as a stack of modules with a Brand ready status. Spekin keeps the stack and adds a state on every token.
OpenDesign extraction compare. Old against new extraction, side by side, with sample controls. Spekin’s conflict card compares confirmed against inferred the same way.
OpenDesign design-system picker. Showcase and Tokens views of one system. Spekin’s source picker and Markdown tab follow this split.
```
