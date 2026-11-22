# Spekin

Browser-first living-spec and design workspace (working name). Eight stages from Planning to Deployment, an infinite canvas, contextual chat. PRD: inputs/Spekin-PRD-v0.2.2.md. Wireframe pack: inputs/Spekin-annotated-wireframe-brief-v0.2.2.zip.

## Where the work stands

Design canvas for review before any build. Read **docs/handoff/spekin-canvas.md** first (status, continue prompt, plan, open decisions).

## Run and check

```
cd docs/design/spekin-canvas
node build.mjs                                   # boards, canvas.json, offline/index.html
PW_FROM=<path to a package.json with playwright> node render.mjs && node build.mjs
node <yra-skills>/canvas-to-app/skills/canvas-to-app/scripts/lint_boards.mjs project --after-only --manifest canvas-states.json
SPK_PUBLISH=1 node build.mjs                     # publish/ copy with /_blob/ urls for the Claude Design canvas
```

## House rules

- OpenDesign (Apache-2.0) is the primary reference; keep its NOTICE with any reused unit. Momo has no licence: patterns only.
- Rust core, TS/JS browser UI, no Python dependency. Browser first; local integration deferred.
- Tokens come from yravgUI (design/yravg-ui.css); no raw colours on boards.
- One synthetic sample project (sample/meranti-yard.mjs) for boards and the future demo app. No real client data.
- Every board control carries data-does and data-feature; at most 6 states per board.
- End every session with a link the owner can open (artifact or Tailscale URL).
