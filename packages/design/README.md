# @spekin/design

Generated. Do not edit by hand.

- `spekin.css`: the canvas stylesheet (docs/design/spekin-canvas/spekin.css plus css/*.css), copied from the canvas build so the app uses the same tokens and classes as the boards (canvas-to-app rule 12: build the same as drawn).
- `icons.json`: the stroke icon paths the boards use (kit.mjs ICONS).

Refresh: `npm run canvas:build && npm run sync:design`. CI fails when this copy and the canvas differ (`npm run check:sync`).
