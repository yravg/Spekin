# Enhance prompt (S41), 24 Nov 2026

## Continue prompt

> Repo yravg/Spekin, branch main. Read AGENTS.md, then this file, then docs/design/spekin-canvas/boards-enh-a.mjs.
> S41 is drawn on its own canvas and waits for owner review. Next step after approval: write build card IMP-53
> (composer sparkle button left of Send, F531-F539) and give it to a worker; extend the state harness with S41 states.
> Checks: `cd docs/design/spekin-canvas && node build-enhance.mjs` prints "1 boards" and no FAIL; `node build.mjs` and
> `node build-gaps.mjs` unchanged; `npm run check:sync` passes.

## What it is

Owner request: an "Enhance prompt" button like WorkBuddy's, a sparkle icon immediately left of Send in the chat composer.
It rewrites the draft into a fuller prompt as a reviewable proposal (original vs enhanced, the context it used, removable
assumptions), never sends by itself, and keeps an Undo to the exact original. States: Empty draft, Draft ready,
Enhancing, Review proposal, Applied with Undo, Cap reached (offline and server error as cards). Shortcut drawn:
Ctrl/Cmd+Shift+E (Ctrl/Cmd+I clashes with italic and browser keys).

## Where the real source is

Generator: docs/design/spekin-canvas/build-enhance.mjs, boards-enh-a.mjs, css/enh-a.css, sample/parts/enh-a.mjs.
Built board: enhance/project/S41-enhance-prompt.dc.html; offline view enhance/offline/index.html (needs project/ref/,
private, copy from the main checkout). Publish: `SPK_PUBLISH=1 SPK_BLOBS=blobs-enhance.json node build-enhance.mjs`.
Owner view (claude.ai, private): https://claude.ai/artifact/4htTCUUHZueZZa8J7zooi4

## Open questions (owner)

1. Shortcut Ctrl/Cmd+Shift+E: right, and free in the S36 key map?
2. Model: the composer chip's model, or a smaller one on the same billing source?
3. Should Undo survive a page reload?
4. May a project switch Enhance off?
5. The PRD has no requirement for this; stories cite R-MOD-1, R-MOD-3, R-CAN-4, R-LANG-2. Add a PRD requirement?
