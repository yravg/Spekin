# 0003. The design canvas is the source of truth for every screen

Status: accepted, 23 Nov 2026

## Context

In Clausarium, screens were built from boards by eye. The result: 3,849 controls showing "Not built yet", click paths that did not work in the app, and screens claimed done that did not match. The owner asked that this never happen again.

## Decision

- The app imports the canvas stylesheet and icons (`packages/design`, synced by `npm run sync:design`) and the same sample data (`packages/sample`). Markup mirrors the board's classes, order, labels and `data-feature` ids.
- Board-only marks (NEW, PART, LATER tags, notes, outlines) are never built.
- A state is done only when the state gate passes it: reached by clicks, text equal, pixels within 1 %, no stand-ins, no extra later controls, and the click path checked by a person.
- Agents never change a board to match their code. A board change is a lead task: edit the generator, rebuild, re-lint, then `npm run canvas:states`.

## Consequences

Building is slower at first and much faster to review. Any visual idea goes to the canvas first.
