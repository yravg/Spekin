# Spekin canvas: board brief (for any agent drawing a board)

Updated 22 Nov 2026. Owner: Enrico. Lead: the chat that runs build.mjs. Read this before drawing.

## What a board is

The canvas follows the Clausarium canvas: **one board per screen or feature area**. Each board is one interactive `.dc.html` page with:
- a header (code, name, Extends, Lives in) and **state buttons at the top right**. Each button switches the whole 1440x900 app window to a real state of that screen. 4 to 6 states per board, never more than 6.
- the app window on the left, drawn after the reference products, in yravgUI tokens (spekin.css).
- five aside cards on the right: What it must show, Motion, Stories, Where it lives, States (Entry click path + Data record per state). kit.mjs builds them.
- a reference strip at the bottom (screenshots of the reference products, private to the canvas).

S35 (boards-shell.mjs) is the finished exemplar. Copy its structure, density and polish.

## Files and ownership

| Group | Board file (yours) | Boards | Feature IDs | CSS (yours) | Data (yours) |
|---|---|---|---|---|---|
| shell | boards-shell.mjs | S35 | F101-F116 | spekin.css (lead) | meranti-yard.mjs (lead) |
| intake | boards-intake.mjs | S27 Projects, S28 Reference intake | S27 F121-F139, S28 F141-F159 | css/intake.css | sample/parts/intake.mjs |
| canvas | boards-canvas.mjs | S29 Frames canvas, S31 Alternatives | S29 F161-F179, S31 F201-F219 | css/canvas.css | sample/parts/canvas.mjs |
| style | boards-style.mjs | S30 Style review, S38 Contextual GenUI | S30 F181-F199, S38 F321-F339 | css/style.css | sample/parts/style.mjs |
| review | boards-review.mjs | S32 Targeted change, S33 Review and accept (with S08 diff) | S32 F221-F239, S33 F241-F259 | css/review.css | sample/parts/review.mjs |
| delivery | boards-delivery.mjs | S34 Coding hand-off, S37 Build contracts and release | S34 F261-F279, S37 F301-F319 | css/delivery.css | sample/parts/delivery.mjs |
| models | boards-models.mjs | S36 Models and usage, T01 Tablet and phone | S36 F281-F299, T01 F341-F359 | css/models.css | sample/parts/models.mjs |

Edit only your three files. Prefix data exports with your group in capitals (`CANVAS_FRAMES`) and CSS classes with the first three letters (`.can-stack`). Need a kit or spekin.css change? Put it in your report; the lead makes it.

Module shape (see boards-shell.mjs):
```js
export const tier = 'Frames: board canvas and alternatives';  // the canvas row title
export const order = 2;                                           // intake 1, canvas 2, style 3, review 4, delivery 5, models 6
export function boards(K) { const { S, ic, ib, btn, pill, note, NT, app, chatPanel, tabs, views, insp, row, mini, top, stagebar } = K; return [ { file: 'S29-frames-canvas', code: 'S29', name: '...', ext: '...', lives: '...', views: [ { id, label, entry, data, html } ], side: { must, motion, stories, where }, refs: { note, shots: [ { img, cap } ] } }, {...} ]; }
```
K.S is the sample namespace: meranti-yard.mjs plus every sample/parts file.

## Rules (the lint and the owner check these)

1. Every clickable thing has `data-does` (what happens, one sentence) and `data-feature` (a feature ID from your block), or `data-later` with a LATER tag. Use K.btn / K.ib; a raw `<button>` needs both attributes by hand.
2. Every state has an Entry click path ("Projects > Meranti Yard > Design > select F-03") and a Data source ("sample/parts/canvas.mjs → CANVAS_TAKES").
3. At least 2 navy notes per state (K.note). The first starts with `<b>trigger</b>` then the result: "<b>Hold Alt</b>: the take fades to the baseline...". Notes sit on empty board space inside the window and never cover a control.
4. New regions are wrapped in `class="isnew"` with K.NT. Spekin has no built screen, so all stories are `new`.
5. Stories: 8 to 16 per board, in your ID block. Each cites PRD IDs (R-WS-7, AC-57...) and names its reference in the src field: 'OpenDesign', 'Paraframe', 'Onlook', 'Momo' or 'PRD'.
6. All names and figures come from the one fictional sample project, Meranti Yard (cost variance dashboard). No real people, clients or companies.
7. Tokens only. No raw hex, rgb or named colours in CSS or inline styles; use var(--...) from spekin.css (look at its :root). Text 11 px or more, except thumbnails inside frames.
8. English UI text, plain and short. No em dashes in UI copy.
9. **Clean room.** Paraframe is proprietary and Momo has no licence: copy behaviour and layout ideas only, never their labels, wording, names or assets. Write your own copy. OpenDesign and Onlook are Apache-2.0: patterns and component names may be cited; code reuse needs a NOTICE (say so in Where it lives).
10. Motion card: real durations and easing, a Reduce Motion row. Good sources: OpenDesign ease cubic-bezier(0.23,1,0.32,1) and 40 ms stagger; Onlook 220 ms bubble entry, 250 ms camera; Momo 0.24 s block reveal, 8 px rise.
11. Where it lives: route, UI units to reuse (OpenDesign / Onlook names, licence), what the Rust core owns, open owner decisions.

## Reference strip images

Existing in project/ref (gitignored): od-studio-prototype.png, od-design-canvas.png, od-todo-progress.png, od-studio-document.png, momo-explore.png, onlook-canvas.png. You may add more from the local clones (paths in the worker prompt): convert with `sips -s format png -Z 1400 <in> --out project/ref/<od|onlook|momo>-<name>.png` and add one line per image to refs-sources.md under your group heading (source path in the clone). Paraframe has no screenshots: describe its pattern in a note or a story instead.

## Where the facts are

- PRD: ../../../inputs/Spekin-PRD-v0.2.2.md (grep for your R- IDs, S-numbers and BW- codes; §7.10 to §7.16, §16, §17).
- Research notes per reference (features, taste, engine, licence, mapping by screen): ../../research/opendesign.md, onlook.md, momo.md, paraframe.md.
- Paraframe parity list FR-01 to FR-62 with Spekin decisions: listed in ../../research/paraframe.md and the PRD appendix.

## Checks before you report

```
SPK_OUT=work/<group> SPK_ONLY=<group> node build.mjs
SPK_OUT=work/<group> PW_FROM=<playwright package.json> node render.mjs <CODE>   # twice: the first run measures heights
node <lint_boards.mjs> work/<group>/<file>.dc.html --after-only                  # per board
node <slop-scan.mjs> boards-<group>.mjs css/<group>.css work/<group>/<file>.dc.html   # 0 errors
```
Then open every state screenshot in renders/work_<group>_/ (or the folder render prints) and fix what looks wrong: clipped text, overlaps, empty areas, notes over controls, anything that would not pass a design review next to OpenDesign. Render is not done until you looked at each state.
