# Spekin design canvas: handoff

Updated 22 Nov 2026, 22:15 Asia/Shanghai.

## Continue prompt (paste into any agent)

```text
Work in /Users/ricodmarlon/Developer/github/yravg/Spekin (branch main). Read AGENTS.md, then docs/handoff/spekin-canvas.md (this file), then docs/design/spekin-canvas/BOARD-BRIEF.md.
State: all 13 planned boards are drawn (S27-S38, S35, T01) plus F00 Feature map and R00 References and engine, published to the canvas below. The owner reviews them next.
Next step: apply the owner's review comments board by board (each board file is owned by one boards-<group>.mjs; see BOARD-BRIEF.md), then start P0 of the implementation plan only after the owner accepts the boards.
Checks that must pass (from docs/design/spekin-canvas): node build.mjs; PW_FROM=<package.json with playwright> node render.mjs; node build.mjs; lint every project/S*.dc.html and project/T*.dc.html with yra-skills canvas-to-app lint_boards.mjs --after-only; tastestack slop-scan 0 errors.
Publish: SPK_PUBLISH=1 node build.mjs, upload any new asset (stylesheet, reference image) with the Artifact tool (asset: true) and record its id in blobs.json, rebuild, then ONE publish call with root=publish, file_path=publish/project/canvas.json and the changed .dc.html files in files.
Never read a long file through a tool that may summarise it and write it back (see Known failures). End the session with a link the owner can open.
```

## Status

| Item | Status | Evidence |
|---|---|---|
| Inventory of existing yravgHub Studio | done, part blocked | Live image `yraverage-hub:7085ffd3ab28`; source only on the owner's ROG laptop. Not the baseline (owner, 22 Nov). |
| Reference research | done | docs/research/opendesign.md, onlook.md, momo.md, paraframe.md: features, taste, engine, mapping by screen, licence (22 Nov). |
| Canvas format | done | Clausarium style: one board per screen, state buttons at the top right (4 to 6 real states), five aside cards, reference strip. BOARD-BRIEF.md is the contract. |
| S35 Project shell | done, taste pass added | Busy chip, Cmd/Ctrl+K switcher key, usage meter severity (70/90%), resizable chat, live run row with Stop, off-screen frame mark. |
| S27, S28 (intake) | done | boards-intake.mjs, 6 + 6 states. |
| S29, S31 (canvas) | done | boards-canvas.mjs, 6 + 6 states. |
| S30, S38 (style) | done | boards-style.mjs, 6 + 6 states. |
| S32, S33 with S08 (review) | done | boards-review.mjs, 6 + 6 states. |
| S34, S37 (delivery) | done | boards-delivery.mjs, 6 + 6 states. |
| S36, T01 (models) | done | boards-models.mjs, 6 + 5 states. |
| F00 Feature map | done | Generated from the stories of every board (194 features), filters by reference, links to boards. maps-boards.mjs. |
| R00 References and engine | done | Engine stack by layer, taste list with status, licences, features per board by source. maps.mjs. |
| Checks | pass | 13/13 boards lint; render ok on every state; slop scan 99 (A), 0 errors, 7 warnings (known: thumbnail text 6-7 px, 11 px mono labels). |
| Published | done | Canvas below, version 1795356738-55f7. Old Index board removed (F00 replaces it). |
| Implementation | not started | Plan below. |

Canvas (owner view, needs Claude sign-in): https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U
Repo copy (source of truth): docs/design/spekin-canvas. Offline view: `node build.mjs`, then open docs/design/spekin-canvas/offline/index.html (reference images in project/ref are gitignored; restore them with refs-sources.md).

## The engine, in short (detail on R00 and docs/research)

- OpenDesign (Apache-2.0): product shell, chat, context chips, model switcher, hand-off, GenUI surfaces, tokens and motion. Its engine is a Node daemon that spawns agent CLIs: not reused.
- Momo (no licence): GenUI feel only. Spekin uses the same MIT libraries (@openuidev/react-lang, lang-core, zod) with schemas generated from Rust.
- Onlook (Apache-2.0): the board canvas engine (React Flow, camera, snapping, CanvasOp log) and part picking inside a frame.
- Paraframe (proprietary): frame workflow behaviour only (takes, part edits, nitpicks, hand-off). No wording or assets.
- Rust core (Axum): stages, revisions, proposals, schema validation, ledger, hand-off bundle, model loop (Hosted, BYOK). Local agent is a deferred adapter.

## Phased implementation plan (after boards are accepted)

1. P0 Source and baseline: get the ROG Studio repo; decide reuse vs fresh app per area; dependency and licence inventory (OpenDesign units with NOTICE); port validate.py to Rust or TS golden-equal; set PERF-SPK-A budgets.
2. P1 Shell: S35 and S27 in TS/React from OpenDesign patterns; per-stage state store; deep links. Tests AC-SPK-17, 18, 21.
3. P2 Rust core seam: Axum service for stage status, revisions, proposals and saves; schema fixtures shared with TS (R-ARC-1, 3). Tests AC-SPK-19, 20.
4. P3 Canvas and review: S28-S34 on React Flow with the CanvasOp log; S08 diff and accept (R-CAN, R-WS).
5. P4 Contextual GenUI: S38 with OpenUI react-lang, Rust validation, table fallback (R-GUI). Tests AC-SPK-24 to 28.
6. P5 Models and ledger: S36 registry, estimate, reserve and settle in Rust, caps (R-MOD). Prices stay an owner decision.
7. P6 S37 contracts, evidence, packs, T01 layouts, accessibility and security hardening. Local integration stays deferred.

Workers, when needed: Antigravity Gemini Neon 4 (medium) or Sonnet 5.5 (high) (owner, 22 Nov). This canvas was drawn by six Sonnet 5.5 high workers, one board group each, with the lead owning kit.mjs, spekin.css, build.mjs and the maps.

## Open decisions (recommendation first)

- Accent colour Q-28: keep yravgUI clay #B4532A (used on every board).
- UI language: boards drawn in English for review; ship Bahasa Indonesia first with the EN/ID switch (PRD).
- Payment for top-ups: Midtrans QRIS behind an adapter, Xendit swappable (drawn as LATER on S36).
- Upload limits (S28): assumed 10 MB per image, 30 per import, 30-day retention. Owner to confirm.
- Deleted project restore window (S27): assumed 30 days.
- T01: portrait only; phone tabs at the bottom (wireframe shows top). Owner to choose.
- Brand mark: placeholder "S".

## Known failures and cleanups

- **Read hook:** on this Mac a hook replaces long command output and long file reads with a summary. Reading a file that way and writing it back destroys it (happened to spekin.css and to two worker CSS files; all restored). Edit big files with node or sed on disk, never by round-tripping text.
- `build.mjs` with SPK_ONLY rewrites stories.md and offline/index.html with only that group. Run a full `node build.mjs` before committing.
- S29/S31 re-file the shared chat controls under F169 and the shell under F161; the other groups use the kit's "Shared shell" block instead. Harmless for the lint; tidy when S29 is next edited.
- S36 draws the top bar and stage bar as static markup (no data-does); the other boards use the live kit chrome.
- Unused reference images (od-design-dashboard, od-bug-fresh, od-studio-mobile, od-comment-avatars) sit in project/ref (gitignored); deletes were blocked by a safety hook.
- PRD FR- numbers: the Paraframe parity table (FR-01 to FR-62) is on Drive (file id 1N3ryxrMc9Fx4SmEtRBbjEJuKsWmxEuKv), not in the repo, so some workers cited FR groups rather than single IDs.
- Not checked: the canvas was not opened in a browser after publishing (canvas rule: no verification unless asked); CSS animations are not visible in the still renders.

## Restore reference images (gitignored, private to the canvas)

See docs/design/spekin-canvas/refs-sources.md: one line per image with its source path in the OpenDesign, Onlook or Momo clone. Convert with `sips -s format png -Z 1400`. Uploaded copies are on the canvas as assets (ids in blobs.json).
