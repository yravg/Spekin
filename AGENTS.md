# Spekin

Browser-first living-spec and design workspace (working name). Eight stages from Planning to Deployment, an infinite canvas, contextual chat. PRD: inputs/Spekin-PRD-v0.2.2.md. Wireframe pack: inputs/Spekin-annotated-wireframe-brief-v0.2.2.zip.

## Where the work stands

Design canvas for review before any build: 13 screen boards, F00 Feature map and R00 References and engine are drawn and published. Read **docs/handoff/spekin-canvas.md** first (status, continue prompt, plan, open decisions), then docs/design/spekin-canvas/BOARD-BRIEF.md before touching a board.

## Run and check

```
cd docs/design/spekin-canvas
node build.mjs                                   # boards, F00, R00, canvas.json, offline/index.html, stories.md
PW_FROM=<path to a package.json with playwright> node render.mjs && node build.mjs
for f in project/S*.dc.html project/T*.dc.html; do node <yra-skills>/canvas-to-app/skills/canvas-to-app/scripts/lint_boards.mjs $f --after-only; done
node <tastestack>/skills/tastemaker-guard/scripts/slop-scan.mjs project/*.dc.html boards-*.mjs css/*.css spekin.css
SPK_PUBLISH=1 node build.mjs                     # publish/ copy with /_blob/ asset urls for the Claude Design canvas
SPK_OUT=work/<group> SPK_ONLY=<group> node build.mjs   # a worker's private build of one board group
```

## House rules

- OpenDesign (Apache-2.0) is the primary reference; keep its NOTICE with any reused unit. Onlook (Apache-2.0) for the canvas engine. Momo (no licence) and Paraframe (proprietary): behaviour and patterns only, never their wording or assets.
- Rust core, TS/JS browser UI, no Python dependency. Browser first; local integration deferred.
- Tokens come from yravgUI (design/yravg-ui.css); no raw colours on boards.
- One synthetic sample project (sample/meranti-yard.mjs plus sample/parts/*.mjs) for boards and the future demo app. No real client data.
- Every board control carries data-does and data-feature; 4 to 6 states per board; each board group is owned by one boards-<group>.mjs.
- A hook on the owner's Mac may summarise long reads: never write back text you read through it.
- End every session with a link the owner can open (artifact or Tailscale URL).
