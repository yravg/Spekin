# Spekin design canvas: handoff

Updated 22 Nov 2026, 20:20 Asia/Shanghai.

## Continue prompt (paste into any agent)

```text
Work in /Users/ricodmarlon/Developer/github/yravg/Spekin. Read AGENTS.md, then docs/handoff/spekin-canvas.md (this file), then inputs/Spekin-PRD-v0.2.2.md sections 7.10-7.16, 16 and 17.
Task: continue the review canvas in docs/design/spekin-canvas. The owner reviews S35 first; apply their comments, then draw the next boards in the order of the "Board plan" below, one board file per boards-*.mjs owner.
Rules: OpenDesign (Apache-2.0) is the primary reference; Momo is patterns only; no Python; tokens from yravgUI only; every control has data-does + data-feature; max 6 states per board.
Checks that must pass: node build.mjs; PW_FROM=<a package.json whose node_modules has playwright> node render.mjs; node build.mjs; node ../../../../yra-skills/canvas-to-app/skills/canvas-to-app/scripts/lint_boards.mjs project --after-only --manifest canvas-states.json; tastestack slop scan 0 errors. Then SPK_PUBLISH=1 node build.mjs and publish changed files to the canvas URL below, one file per call.
End the session with a link the owner can open (artifact or Tailscale URL).
```

## Status

| Item | Status | Evidence |
|---|---|---|
| Inventory of existing yravgHub Studio | done, part blocked | Live Studio at yraveragehub.io/studio runs VPS image `yraverage-hub:7085ffd3ab28` (built 2026-10-22). Its source is not on GitHub (yravg/yravgHub last push 2026-09-18, main 58179e1, no studio files), not on this Mac, not on the VPS. Owner will share it from the ROG laptop. Seen in the image: routes `/studio`, `/studio/new`, `/studio/[projectId]`, `/api/studio/[projectId]/{state,assets,import,cli}`; migrations 0028 studio_revisions (append-only whole-doc revisions), 0029 agents.studio_project, 0030 studio_assets, 0031 credit_ledger (no reserve/settle), 0032 workspaces; Next 15, React 19, next-auth 5 beta, drizzle, PGlite. No undo/redo or motion tools in the deployed build. `packages/prd-engine/reference/.../validate.py` is a Python check (conflicts with R-ARC-2). |
| Owner direction change | done | 22 Nov: Studio "still not good", not the baseline. OpenDesign first ("use all of it"), then Paraframe, Onlook, Momo. Canvases for review before any build. |
| Reference sources | done | OpenDesign full snapshot @ e033aad (Apache-2.0) in the session scratchpad; re-download: `curl -L https://codeload.github.com/nexu-io/open-design/tar.gz/e033aad1d15a9d4084316e5223f2c6597fd32619`. Onlook and Momo shallow clones. Paraframe: Drive parity study FRAME-WORKSPACE-PARITY v0.1.6 (62 FR, 27 AT), file id 1N3ryxrMc9Fx4SmEtRBbjEJuKsWmxEuKv. |
| Canvas generator | done | docs/design/spekin-canvas: kit.mjs, spekin.css (yravgUI tokens @ 95617166), sample/meranti-yard.mjs, boards-shell.mjs, build.mjs, render.mjs. |
| S35 Project shell board | done, review open | 3 states (Design, switched to Backend, Save conflict), 16 stories F101-F116. Render ok, lint 1/1, slop scan 96 (A) 0 errors, contrast AA. Published. |
| Boards S27-S34, S36-S38, tablet, phone | open | Wait for owner review of S35. |
| Implementation | not started | No app code. Plan below. |

Canvas (owner view, needs Claude sign-in): https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U
Repo copy (source of truth): docs/design/spekin-canvas. Offline view: run `node build.mjs`, then open docs/design/spekin-canvas/offline/index.html (needs the project/ folder beside it; reference images in project/ref/ are gitignored and must be re-copied, see below).

## Board plan (one board = one buildable screen)

S35 shell (done) · S27 projects (OpenDesign Home and All projects) · S28 import reference · S29 board canvas · S30 style (OpenDesign Design systems) · S31 alternatives · S32 targeted edit · S33/S08 review and accept · S34 hand off · S36 model and usage (Hosted, BYOK, deferred Local agent) · S37 build contracts and release readiness · S38 contextual GenUI panel · tablet and phone.

## Phased implementation plan (after boards are accepted)

1. P0 Source and baseline: get the ROG Studio repo; decide reuse vs fresh app per area; dependency and licence inventory (OpenDesign units with NOTICE); port validate.py to Rust or TS golden-equal; set PERF-SPK-A budgets.
2. P1 Shell: S35 in TS/React from OpenDesign components (ChatPane, FileWorkspace, ContextChipStrip, InlineModelSwitcher, HandoffButton); per-stage state store; deep links. Tests AC-SPK-17, 18, 21.
3. P2 Rust core seam: Axum service for stage status, revisions, proposals and saves; schema fixtures shared with TS (R-ARC-1, 3). Tests AC-SPK-19, 20.
4. P3 Canvas and review: S29-S34 with stable artifact ids, drafts, S08 diff and accept (R-CAN, R-WS). Reversible migration only if old boards are imported (R-CAN-9).
5. P4 Contextual GenUI: three families, Rust validation, table fallback (R-GUI). Tests AC-SPK-24 to 28.
6. P5 Models and ledger: registry, estimate, reserve and settle in Rust, caps (R-MOD). Prices stay an owner decision.
7. P6 Contracts, evidence, packs, accessibility and security hardening (M3, M4). Local integration stays deferred.

Workers, when needed: Antigravity Gemini Neon 4 (medium) or Sonnet 5.5 (high) (owner, 22 Nov).

## Open decisions (recommendation first)

- Accent colour Q-28: keep yravgUI clay #B4532A for now (used on the boards).
- UI language order: PRD says Bahasa Indonesia first; boards drawn in English for review. Recommend ID-first strings at build time with the EN/ID switch kept.
- Brand mark: placeholder "S".
- Git: this folder is not a git repo yet. Recommend `git init` and a private GitHub repo yravg/Spekin; not done without the owner's yes.
- Payment: deployed Hub has Paddle and Xendit webhooks, PRD names Midtrans QRIS. Decide before S36.

## Known gaps and what was not checked

- Live Studio UI controls were not inventoried (needs a signed-in browser; Claude in Chrome is not available in Code Mode). The production database was not read (blocked, correctly).
- Board text is English only. Touch targets in the desktop app are 26-30 px (dense desktop tool); the phone boards must use 44 px.
- Slop-scan warnings kept on purpose: 6-7 px text inside frame thumbnails (miniatures at canvas zoom) and 11 px mono labels on the --t11 token.
- The canvas was not opened in a browser after publish (canvas rule: no verification unless asked).

## Restore reference images (gitignored, private to the canvas)

project/ref/*.png come from: OpenDesign docs/screenshots (product-tour/studio-prototype-2026.webp, current-2026-06/qoder-design-canvas.webp, 04-todo-progress.png, product-tour/studio-document.png), Momo docs/screenshots/02-explore-home.jpg, Onlook assets/web-preview.png. Convert with `sips -s format png -Z 1400`.
