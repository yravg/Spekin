# S27 — Projects home: home, all projects, switcher, create

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
START
S27 · START · SPEKIN
Projects home: home, all projects, switcher, create

Extends: New (BW-01). Spekin has no built screen yet. OpenDesign Home and All projects are the base (Apache-2.0, patterns only), Onlook ProjectGrid sets the grid, Paraframe’s board switcher gives the palette behaviour (own wording). Opening a project loads S35.

Lives in: Spekin web app · /projects (Projects) and / (Home); a project opens at /p/meranti-yard/design. Outside a project there is no stage header.

Home
All projects
Switch project
Create project
First run
Restore
S
Projects
Resume
Meranti Yard
Switch project
⌘K
Saved 12:41
Hosted
1,240
of 5,000 cr
2
EN
ID
RS
NEW
New project
Home
Projects
7
Usage
1,240 cr
Settings
RECENT
by last opened
Meranti Yard
Kenari Fleet
Bakau Permits
Pelita Clinic
Rawa Warehouse
Recently deleted
RS
Rina (sample)
Personal workspace
Describe what you want to build

Spekin turns the idea into a spec, a design and a coding hand-off. Nothing is approved until you review it.

NEW
A cost variance dashboard for offshore project teams. Flag any work package that is more than 3 percent over budget, and show why.
ID
EN
HOSTED
Sonnet 5.5
≈ 18–30 cr
131 / 4,000
NEW
Start from
An idea
Reference screenshots
An existing spec
NEW
Recent projects
View all 7
Variance
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
Meranti Yard
Cost variance dashboard
Inc. 2 · Variance alerts
2 of 8 ready
Today 12:41
RS
Rina (sample)
Kenari Fleet
Viewer
Vessel schedule board
Inc. 1 · First release
3 of 8 ready
Today 09:15
DM
Dimas (sample)
Bakau Permits
Permit tracker
Inc. 3 · Renewal reminders
5 of 8 ready
Yesterday
RS
Rina (sample)
Pelita Clinic
Viewer
Booking portal
Inc. 1 · Slots and reminders
2 of 8 ready
19 Nov
AY
Ayu (sample)
Type 20 or more characters: Start turns on. Below 20 it stays off and says how many are missing. Nothing is created yet.
Pick a chip: the starting point is set before the project exists. Reference screenshots opens the Design import (S28).
Click a recent card: the project opens where you left it, with its stage, tab, zoom and selection.
Press ⌘K (Ctrl+K on Windows) on any page: the switch palette opens over what you are doing.
WHAT IT MUST SHOW
Home is one composer and the way back in: describe what you want to build, pick a start, or reopen a recent project. Nothing is created before Start.
Start stays off until the idea has 20 characters and a name can be made; the counter says how many are missing (R-ONB-2).
All projects is a fluid grid: 220 px column floor, thumbnail 273:140. Each card shows thumbnail, product, increment, 8 stage marks with a count, last opened and owner.
The stage marks use the same five tones as the stage header, and every mark has a text label for screen readers.
Cmd or Ctrl+K switches project from anywhere: type to filter, ordered by last opened, rename in place with Enter and Esc.
Create asks only for a name, the idea, the UI language and where to start. Language default is Bahasa Indonesia; the spec follows the idea’s language.
First run shows three start cards and nothing invented. Connect a local agent is visible but off, tagged LATER.
A project deleted in another session shows a restore banner, not a blank error or a silent disappearance.
MOTION
Card arrival
Thumbnails fade in 220 ms, 40 ms apart, ease cubic-bezier(0.23,1,0.32,1). The grid never jumps when a thumbnail loads (fixed 273:140 box).
Palette
Opens with a 160 ms fade and 0.98 to 1 scale, spring-ui. Typing filters at once; rows do not animate while you type.
Rename
The field swaps in place in 120 ms. Esc restores the old text in the same frame.
Start button
Fades on at 20 characters in 140 ms; the counter colour changes with it, not the colour alone.
Restore
The banner slides down 200 ms spring-panel. The card returns to its place in the list in 220 ms.
Reduce Motion
All fades and slides are instant. Counts, marks and status text are unchanged and still announced.
STORIES
F121
OpenDesign
New
Navigation rail: Home, Projects, Usage, Settings, recent projects by last opened, collapse. Usage opens S36 (R-WS-1, R-MOD-10).
F122
OpenDesign
New
Hero composer “Describe what you want to build”: idea text, idea language, model source with estimate, Start from 20 characters (R-ONB-1, R-ONB-2, R-MOD-3).
F123
OpenDesign
New
Starting chips: an idea, reference screenshots, an existing spec. Screenshots lead to the Design import (BW-01, R-ONB-1, R-WS-2).
F124
OpenDesign
New
Recent projects strip, newest first; a click restores stage, tab, zoom and selection (BW-01, R-WF-11).
F125
Onlook
New
All projects fluid grid: 220 px floor, thumbnail ratio 273:140, cards or list (BW-01).
F126
Onlook
New
Project card: thumbnail, name, product, increment, 8 stage marks with count, last opened, owner (R-WF-1, R-WF-6).
F127
Onlook
New
Filters and order: Recently opened, Mine, Shared with me, Archived; filter box and sort; owner and viewer roles shown (R-SEC-1).
F128
Paraframe
New
Switch palette on Cmd or Ctrl+K: type to filter, ordered by last opened, numbers while Cmd or Ctrl is held, New project pinned at the bottom (BW-01).
F129
Paraframe
New
Inline rename: Enter saves, Esc cancels, an empty name is refused, the link keeps working (BW-01).
F130
OpenDesign
New
Create project dialog: name, idea (20 to 4,000 characters), UI language, start from idea, screenshots or spec; creating costs nothing (R-ONB-1, R-ONB-2).
F131
PRD
New
UI language EN and ID: default Bahasa Indonesia, typed text and interview state kept on switch, spec in the idea’s language (R-ONB-8, R-LANG-1, R-LANG-2).
F132
OpenDesign
New
First run: three start cards, empty rail, top bar without a project, meter at 0 (BW-01, R-ONB-1).
F133
PRD
New
Look-around option: open the Meranti Yard sample read only; nothing you do is saved (BW-01).
F134
Paraframe
New
Restore: banner when another session deletes a project, Recently deleted list, a link to a deleted project lands on the prompt (R-SEC-6, R-CAN-6).
F135
Onlook
New
Card menu: Open, Rename, Archive, Delete for owners; Open only for viewers (R-SEC-1).
F139
PRD
New
Top bar outside a project: Resume chip, switcher hint, save state, usage meter, inbox, language. Shared with S35 (F103 to F115).
Shared shell controls on this board, specified on S35:
F109
New
F111
New
F112
New
F115
New
WHERE IT LIVES
Route: / (Home) and /projects; a project is /p/:project/:stage. Back and Forward never start a paid job (R-WF-11).
UI (TS/React): OpenDesign (Apache-2.0, commit e033aad): HomeHero, RecentProjectsStrip, EntryNavRail, NewProjectModal, EntryBlankState. Onlook (Apache-2.0): ProjectGrid, gridTrack, ArchiveDisclosure. Reusing their code needs a NOTICE entry. The palette copies Paraframe’s behaviour only, with our own wording; Momo’s layout idea only.
Core (Rust): project list, last opened, roles, delete and restore, stage status per project (R-ARC-1, R-SEC-1).
Open for Enrico: how long a deleted project stays restorable (30 days drawn) · whether “An existing spec” is in the first release · Home or Projects as the landing page.
STATES
Home · Entry: Open Spekin > Home in the rail. · Data: sample/parts/intake.mjs → INTAKE_COMPOSER, INTAKE_PROJECTS (first four).
All projects · Entry: Home > Projects in the rail (or View all). · Data: sample/parts/intake.mjs → INTAKE_PROJECTS.
Switch project · Entry: Projects > press Cmd or Ctrl+K > arrow to a row > press F2. · Data: sample/parts/intake.mjs → INTAKE_SWITCH_ORDER, INTAKE_PROJECTS.
Create project · Entry: Projects > New project. · Data: sample/parts/intake.mjs → INTAKE_NEW.
First run · Entry: Sign in for the first time > Home with an empty project list. · Data: sample/parts/intake.mjs → INTAKE_PROJECTS (empty list); sample/meranti-yard.mjs → USAGE cap.
Restore · Entry: Projects, after another session deletes Kenari Fleet > the restore banner. · Data: sample/parts/intake.mjs → INTAKE_DELETED, INTAKE_PROJECTS.
Reference: the original UI
OpenDesign and Onlook (Apache-2.0) are pattern references. Paraframe is proprietary and Momo has no licence: behaviour and layout ideas only, no wording, names or assets.
OpenDesign Home. One hero line, one composer, starting chips below. Spekin keeps the single composer and swaps the chips for ways to start.
OpenDesign Home with the rail. Home, All projects and Recent projects in a left rail. Spekin’s rail adds Usage and Recently deleted.
OpenDesign All projects. Tabs, thumbnail cards with owner and age. Spekin adds the increment and the 8 stage marks.
OpenDesign entry view. A new-project panel beside the project list. Spekin’s Create dialog follows the same fields-then-create flow.
Momo (pattern only, no licence). Several views and a session list on one home page. Spekin takes the layout idea, not the code.
Onlook (Apache-2.0). Its ProjectGrid sets the 273:140 thumbnail and the 220 px column floor; this shot shows the canvas a card opens into.
```
