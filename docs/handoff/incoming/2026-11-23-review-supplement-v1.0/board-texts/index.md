# Spekin artifact review — 22 Nov 2026

## Scope and method
Read-only review of the signed-in Claude artifact at the source URL below. Dismissed the duplicate-artifact tooltip; used the canvas zoom menu, pan/scroll, selection and screenshot capture only. Did not edit canvas objects/content, duplicate/share, start chat, or invoke the artifact's Play/prototype controls. Artifact tab was kept open; later research uses a separate tab.

- Source: https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83
- Title: **Spekin: design canvas for review before build**
- Canvas shows 16 artboards (Cover, F00, R00, S27–S38 subset, T01) and long annotated design/spec text. Full accessible text is preserved one board per file under `boards/`.
- Synthetic data: one fictional sample project, **Meranti Yard**; sample dashboard uses USD millions.

## Executive readout and evidence boundary

The cover reports **13 of 13 planned boards drawn**, **195 stories/feature IDs F101+**, **195 NEW**, **0 partial / 0 built**, and explicitly says **no Spekin app exists yet**. This is a design proposal/specification, not proof that code runs. The sample project shell shows stage statuses (including Testing “In progress · 4 of 11”), but these are on-screen sample data, not test execution or CI results.

The artifact contains extensive implementation intent and “what it must show” acceptance notes, route proposals, sample states, reference rationale, data-record pointers, and open owner decisions. It does **not** show an actual Spekin source-repository commit, build/test output, deployed app, or verified runtime behavior. `e033aad` appears as the referenced **OpenDesign** source commit, not as a Spekin commit.

### Eight-stage workflow represented
1. Planning — sample: Ready · 6 of 6
2. Specification — Ready · r14
3. Design — In progress · 3 to review
4. Frontend — Not started
5. Backend — Needs review · 2
6. Integration — Blocked · 1
7. Testing — In progress · 4 of 11
8. Deployment — Not started

These are visible in S35 and repeated on boards; they describe the fictional demo project state only. Controls/future functionality marked `LATER` are not presented as available.

### Coverage and gaps
- The 13 planned boards cover project start/intake, shell, canvas, style, alternatives, targeted edit, review/S08 diff, hand-off, models/usage, build/release contracts and GenUI.
- Additional device board T01 is present as an artboard and has detailed tablet/phone screen content; however, Cover's board plan still labels **BW-T01 / BW-M01–03 “not drawn yet.”** Resolve this bookkeeping mismatch.
- All 195 stories are marked NEW and nothing is built. No implementation/tests were run in this review. Prototype Play and each in-board state control were not exercised; their intended states and entry/data notes are transcribed in the board files.
- Open design choices on the cover: accent color (Q-28, yravgUI clay used), UI language order (PRD says Bahasa Indonesia first; canvas is English), and brand mark (placeholder S). Other per-board “Open for Enrico” questions are preserved verbatim.

### Canvas decisions and references visible on Cover/R00
- OpenDesign is the primary reference; Apache-2.0 reuse allowed with LICENSE/NOTICE/change notes. `e033aad` is the reference revision.
- Onlook (Apache-2.0) supplies canvas/visual-edit patterns; R00 says only pure TS maths/patterns, not marks/icons/sounds/idea images.
- Momo has no license; patterns only, no Momo code copied. Use the same MIT libraries directly.
- Paraframe is behavior-only / private parity study (v0.1.6; 62 FR, 27 AT); fresh captures later.
- Proposed stack: Rust core, TypeScript/JavaScript browser UI, no Python; browser-first, local integration deferred.
- The existing yravgHub Studio is explicitly not the baseline; its code is to be checked later from the ROG laptop. “After only” and private reference-strip/offline-copy notes are recorded on Cover.

## Artifact/browser controls observed
- Artifact chrome: title dropdown; user/profile; Comments / “Comment on this artifact”; “More comment options”; **Start chat**; Share (“shared with anyone who has the link”). These were not activated.
- Canvas UI: Page 1 selector, Canvas/Prototype view radio, Play, Properties, zoom menu (Fit artboards, Zoom to selection, 25–200%), and canvas tools Select, Hand, Text, Artboard, Note, Pencil, Shapes.
- Duplicate-artifact tooltip appeared initially and was dismissed. No duplicate/share/chat action performed.

## Artboard index
- [Cover](boards/00-cover.md) — Canvas inventory, status legend, decisions, source/licence notes.
- [F00 · Every Spekin feature and where it lives](boards/01-feature-map.md) — 195 feature/story IDs mapped to boards, PRD requirements, references and engine layer; generated from board files per canvas copy.
- [R00 · References, taste and the engine behind Spekin](boards/02-references-engine.md) — Reference tradeoffs, engine architecture, licence boundaries.
- [S35 · Project shell: eight stages, artifacts, chat and canvas](boards/03-project-shell.md) — Global shell, stage header, artifact tabs, chat/canvas and sample Meranti Yard project status.
- [S27 · Projects home: home, all projects, switcher, create](boards/04-projects-home.md) — Home, project listing, create/switcher, empty/recent states.
- [S28 · Reference intake: drop, pick, paste screenshots](boards/05-reference-intake.md) — PNG/JPEG/WebP import, preview/status/error/retry, privacy and future capture/MCP.
- [S29 · Frames canvas: board, frames, prompt bar and jobs](boards/06-frames-canvas.md) — Board canvas, frames, tool palette, prompt bar, frame chat, jobs and zoom states.
- [S31 · Alternatives: takes stack and compare with the baseline](boards/07-alternatives.md) — Takes stack/grid/compare/generating/kept/partial failure; keep as draft, baseline protection.
- [S30 · Style review: tokens learned from references](boards/08-style-review.md) — Learned design tokens, visual/markdown views, promotion/proposal flow.
- [S38 · Contextual GenUI panel in chat](boards/09-contextual-genui.md) — Chat response/detail cards, question forms, confirmation/next-step actions and fallback states.
- [S32 · Targeted change: select a part, instruct, review in place](boards/10-targeted-change.md) — Part selection, instruction, variations, apply/dismiss, board context.
- [S33 · Review and accept: nitpick pins, stale items and exact diff](boards/11-review-accept.md) — Frame review, comments/nitpick pins, stale checks, S08 proposal diff and accept/reject.
- [S34 · Coding hand-off](boards/12-coding-handoff.md) — Accepted revisions only, fixed manifest, framework choice/export/copy states.
- [S37 · Build contracts and release readiness](boards/13-build-contracts.md) — Frontend-to-Deployment contracts, check/release gate, failure and evidence-pack concepts.
- [S36 · Models and usage: source, local CLI, API key, estimate, ledger and caps](boards/14-models-usage.md) — Hosted/BYOK/deferred local-agent concepts, estimate/reserve, caps/ledger.
- [T01 · Tablet and phone: frame list, review and hand off](boards/15-tablet-phone.md) — Responsive frame-list/single-frame review/handoff layouts and touch rules.

## Screenshots

Screenshots are viewport/contact-sheet captures of the artifact at the specified canvas zoom/pan. The design boards are very tall and the contact-sheet thumbnails are not a substitute for the full accessible text in `boards/`; file labels make their partial visibility explicit.

- `screenshots/00-overview-fit-artboards-2pct.png` — All-artboard canvas overview at fit (2%); confirms layout, not readable design copy.
- `screenshots/01-contact-frames-25pct.png` — Frames cluster: S29 canvas and S31 alternatives at 25%.
- `screenshots/02-contact-style-genui-25pct.png` — Style and contextual GenUI cluster at 25%.
- `screenshots/03-contact-targeted-change-review-25pct.png` — Targeted-edit and review boards in the 25% canvas viewport.
- `screenshots/04-contact-models-devices-25pct.png` — Models/usage and device boards entering viewport at 25%.
- `screenshots/05-contact-delivery-device-lower-25pct.png` — Lower canvas region / device and reference-strip boards at 25%.
- `screenshots/06-lower-board-reference-strip-25pct.png` — Lower canvas strip; partial board content due pan position.
- `screenshots/07-selected-canvas-frame-19pct.png` — S29 selected on canvas with adjacent S31; whole annotated boards are tall.
- `screenshots/08-frame-artboard-content.png` — Rendered board frame snapshot; thumbnail-scale content, retained as supporting evidence only.
- `screenshots/09-s29-frames-canvas-readable-100pct.png` — S29 canvas at 100%: readable top-level board UI, frame table/board, controls, and annotation column.
- `screenshots/10-s35-project-shell-readable-100pct.png` — S35 shell at 100%: readable title, project shell, eight-stage header, tabs and sample status.

## Optional visual idea for the Claude hand-off (not an implementation request)

The public HLD/LLD lesson demonstrates a clear “whole system → zoom into one service” isometric diagram. As an optional *design reference*, the hand-off could show a one-page service map with typed request/response/event arrows, data-store labels and a small throughput badge; then a focused LLD view with controller/service/repository, state machine, API/event contract and one short “why this trade-off” callout. Keep an equivalent text/table view and avoid implying this interaction is already built in Spekin.

## Handling note for next hand-off

When handing the design to Claude/build planning, use this as a design-only input. Ask for implementation planning and validation separately; do not imply any of the 195 features are already built or tested. Before coding, reconcile T01 coverage and the open owner decisions above, especially language, accent, brand and per-board questions.
