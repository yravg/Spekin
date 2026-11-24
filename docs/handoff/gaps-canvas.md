# Gaps canvas (24 Nov 2026)

## Continue prompt

> Repo yravg/Spekin, branch main. Read AGENTS.md, then this file, then docs/design/spekin-canvas/gaps-plan.mjs.
> The gaps canvas draws the 38 PRD requirements that IMP-52 classified as "gap" (docs/handoff/req-map-2026-11-24.md).
> Next step: owner review of the 13 boards; answer the open questions below; then cut build cards (IMP-53 and up) per board.
> Checks: `cd docs/design/spekin-canvas && node build-gaps.mjs` prints "13/13 boards" and no FAIL; `node build.mjs` still builds the main canvas unchanged.

## Status

| Item | State | Evidence |
|---|---|---|
| Plan: 29 gaps on 13 boards, 9 rules on G00 | done | gaps-plan.mjs; build fails if a gap is unplaced or placed twice |
| Boards S02 S04 S05 S06 (group A) | done | boards-gap-a.mjs, 22 states, F401-F439 |
| Boards S07 S14 S19 (group B) | done | boards-gap-b.mjs, 17 states, F441-F469 |
| Boards S15 S16 S21 (group C) | done | boards-gap-c.mjs, 17 states, F471-F499 |
| Boards S18 S20 S25 (group D) | done | boards-gap-d.mjs, 17 states, F501-F529 |
| Lint (spec-to-canvas lint_boards --after-only) | 13/13 pass | |
| Slop scan (tastemaker-guard) | 0 errors | |
| Render (render.mjs, SPK_OUT=gaps/project) | 13/13 ok | heights.json |
| Published | done | owner view: https://claude.ai/artifact/PbMaGNdKCmfX2nDhPCBNoz |

## Where the real source is

The claude.ai canvas is an owner view only. The source is the generator in docs/design/spekin-canvas/:
gaps-plan.mjs, build-gaps.mjs, boards-gap-*.mjs, css/gap-*.css, sample/parts/gap-*.mjs. Built boards: gaps/project/*.dc.html.
View locally: open gaps/offline/index.html (needs project/ref/ images, which are private and kept out of git; copy them from
the main checkout's docs/design/spekin-canvas/project/ref/).
Publish build: `SPK_PUBLISH=1 SPK_BLOBS=blobs-gaps.json node build-gaps.mjs` writes publish-gaps/project (gitignored);
blobs-gaps.json holds the canvas's own upload ids (stylesheet and 6 reference images). If the stylesheet changes, upload it
again to the canvas and update the id.

## Open decisions (owner)

1. The 27 "later" rows: mark them deferred on the parity page, or keep them open. Recommendation: mark deferred, with the PRD line as the reason.
2. S21: block canvas approval while a UI part has no component? Recommendation: block, with a GAP entry as the way out.
3. Install-line format on ticket prompts (S16).
4. Q-10 hand-off transport and Q-11 where the canvas tool lives (PRD open questions).
5. S02 legal text is sample Bahasa, marked "Teks contoh, belum ditinjau hukum"; routes /masuk /syarat /privasi are TO CONFIRM (AC-43).

## Known gaps in this work

- Component slugs on S15, S16 and S21 (blocks/data-table, components/side-drawer, blocks/kpi-row) are sample values, not checked against the yravg UI register.
- Sample ticket ids (T-231 to T-233) on S18 are placeholders.
