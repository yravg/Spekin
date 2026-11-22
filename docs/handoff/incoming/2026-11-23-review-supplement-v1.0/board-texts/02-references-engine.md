# R00 — References, taste and the engine behind Spekin

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
MAP
R00 · MAP · SPEKIN
References, taste and the engine behind Spekin

Extends: What Spekin takes from OpenDesign, Paraframe, Onlook and Momo: the feel (taste), the working parts (engine) and what the licences allow.

Lives in: This canvas. Facts from docs/research/*.md (read 22 Nov 2026).

THE ENGINE DURING WORK, IN ONE PARAGRAPH

Spekin is not OpenDesign plus Momo glued together. OpenDesign gives the product shell and the GenUI surfaces, but its engine is a Node daemon that spawns agent CLIs, so Spekin keeps its UI patterns and rebuilds the engine in Rust. Momo gives the GenUI feel (cards that build block by block, tolerant rendering), and Spekin gets it from the same MIT libraries Momo uses (OpenUI react-lang), with no Momo code. Onlook fills the gap neither has: a real board canvas (React Flow, camera, snapping, one undoable op log) and part picking inside a frame. Paraframe gives the frame workflow (takes, part edits, nitpicks, hand-off) as behaviour only.

LICENCES
Reference	Licence	What Spekin may do
OpenDesign	Apache-2.0
nexu-io/open-design @ e033aad	Reuse code with LICENSE, NOTICE and change notes. Bundled templates keep their own licences; brand-named design systems and JiduMono font: do not reuse.
Onlook	Apache-2.0
onlook-dev/onlook (v2, Electron)	Pure TS maths and patterns only. Central Icons, Onlook marks, sounds and idea images are not covered: never copy.
Momo	none (all rights reserved)
momo-next	Patterns only. Use the same MIT libraries directly (OpenUI react-lang, zod, xyflow, motion).
Paraframe	proprietary
proprietary desktop app (doc pack only)	Behaviour only. Terms forbid reverse engineering; never copy labels, wording, URLs or assets.
ENGINE STACK: WHO DOES WHAT WHILE YOU WORK
Browser UI shell
TypeScript, React
Apache-2.0

Project split (chat, workspace, inspector), artifact tabs, context chips, model switcher, hand-off menu, tokens and motion.

OpenDesign ChatPane, FileWorkspace, ContextChipStrip, InlineModelSwitcher, HandoffButton, motion.ts. Apache-2.0: reuse with NOTICE; do not copy the 17k-line ProjectView.
Boards: S35 · S27 · S28 · S30 · S33 · S34 · S37 · T01
Board canvas
TypeScript
MIT, Apache-2.0

Infinite board of frames, camera, snapping, counter-scaled handles, off-screen marks, frame covers. One CanvasOp log shared by user, agent and system gives undo and redo.

Onlook React Flow node model, snapping.ts, offscreenMarks.ts, cameraMotion.ts, spring.ts, CanvasOp reducer and log shape. Apache-2.0 maths and patterns.
Library @xyflow/react (MIT); elkjs for auto layout (EPL-2.0 option).
Boards: S29 · S31
Frame preview and part picking
TypeScript in a sandboxed iframe
Apache-2.0

Each frame renders live HTML in a sandboxed iframe. A small injected picker reports the part under the pointer; comments and pins keep anchors when the page drifts.

OpenDesign srcdoc wrapper, comment bridge (postMessage), anchor drift states, keep-alive iframe pool of 5.
Onlook Element evidence schema (tag, DOM path, outer HTML, redaction) and stale-selection marking. Its Electron webview and CDP are not used.
Boards: S28 · S29 · S31 · S32
Contextual GenUI
TypeScript render, Rust validation
MIT, Apache-2.0

Cards stream in block by block with skeletons from partial data. A strict schema at the boundary, a tolerant renderer, content contracts that drop rows instead of inventing them, a plain table fallback.

Momo Pattern only (no licence): permissive runtime props, per-block reveal, prop repair, content contracts. No Momo code.
Library @openuidev/react-lang and lang-core (MIT), the same libraries Momo uses; zod generated from Rust schemas.
OpenDesign GenUI surfaces (confirmation, choice, form) answered in place; partial-JSON repair.
Boards: S38
Model and agent loop
Rust
own code

Three sources behind one interface: Hosted (Spekin credits), Local CLI (bring your own agent: Claude Code, Codex, OpenCode first, reached through the Spekin Connector on 127.0.0.1) and API provider (your key, any compatible base URL). The tool loop, SSE streaming, cancel and retry, estimate, reserve and settle stay in Rust.

OpenDesign Same split as its model switcher: Local CLI (daemon detects agent CLIs) and API provider (BYOK, base URL, connection test). Its Node daemon is replaced by a small Rust connector.
Paraframe Runs through the user's local Claude Code; parallel jobs capped by machine load. Behaviour only.
Boards: S35 · S29 · S30 · S31 · S32 · S36
Rust core service
Rust (Axum)
own code

Stage status and readiness, revisions and proposals, saves and conflicts, schema validation, file versions with digests, the hand-off bundle, the usage ledger. TS types are generated from Rust schemas.

OpenDesign File version manifest (sha256, parent, origin) and packages/contracts shapes, rebuilt in Rust.
Onlook Atomic writes and the append-only op log idea.
Boards: S35 · S27 · S28 · S29 · S30 · S32 · S33 · S34 · S36 · S37 · S38
TASTE: WHAT A USER SHOULD FEEL, AND WHERE IT IS
From	Detail	Board	Status
OpenDesign	Resizable chat column with a 4 px handle, width remembered	S35	Added to S35
OpenDesign	Streamed text appears per character; stick to bottom; jump-to-latest button	S35	Added to S35
OpenDesign	Run steps shown as a live feed while the agent works	S35	Added to S35
OpenDesign	Absent data shows nothing, never a placeholder value	all	House rule
OpenDesign	Error card: one title, one paragraph, actions on the right	S37	On its board
OpenDesign	One product ease cubic-bezier(0.23,1,0.32,1), 40 ms stagger, springs for popovers	all	House rule
OpenDesign	Design-system kit view: cover, palette, type, components	S30	On its board
OpenDesign	Hand-off menu with framework choice; finalize DESIGN.md and mark it stale	S34	On its board
Paraframe	Project name in the title opens a quick switcher; recent first	S35, S27	Added to S35
Paraframe	Busy chip when frames are designing or waiting	S35, S29	Added to S35
Paraframe	Board prompt bar that becomes "about these N frames" on selection	S29	On its board
Paraframe	Takes stack: N of M, angle titles, filmstrip, keep with Enter, hold a key to see the baseline	S31	On its board
Paraframe	Part popover that moves away from palettes; Send disabled while empty	S32	On its board
Paraframe	One review card per frame; hover a row to isolate its pin; stale rows	S33	On its board
Paraframe	Copy-for-agent toast and bundle	S34	On its board
Onlook	Selection handles and rings keep their size at any zoom	S29	On its board
Onlook	Off-screen selection marks and a Recenter button	S35, S29	Added to S35
Onlook	Frame covers: designing, waiting, failed with Retry	S29	On its board
Onlook	Usage meter: calm, warn at 70%, critical at 90%	S35, S36	Added to S35
OpenDesign	Model source split: Local CLI (bring your own agent) and API provider (any base URL), beside Hosted	S36	On its board
Onlook	Stepped question sheet with a recommended answer	S38	On its board
Onlook	Refusal band for a file that cannot be used	S28	On its board
Momo	Cards build block by block from a skeleton of the real shape	S38	On its board
Momo	Thinking row with live token and time counters	S35	Added to S35
Momo	Header swaps the whole workspace (Spekin: eight stages)	S35	Drawn
Momo	Every GenUI card state in one shell: loading, empty, error	S38	On its board
FEATURES PER BOARD BY SOURCE
Board	OpenDesign	Paraframe	Onlook	Momo	PRD
S29 Frames canvas: board, frames, prompt bar and jobs	1	7	5	·	2
S31 Alternatives: takes stack and compare with the baseline	·	8	·	·	7
S34 Coding hand-off	3	4	1	·	7
S37 Build contracts and release readiness	2	·	·	1	13
S27 Projects home: home, all projects, switcher, create	6	3	4	·	3
S28 Reference intake: drop, pick, paste screenshots	2	5	3	1	4
S36 Models and usage: source, local CLI, API key, estimate, ledger and caps	6	·	3	·	7
T01 Tablet and phone: frame list, review and hand off	1	1	·	1	11
S32 Targeted change: select a part, instruct, review in place	2	10	1	·	2
S33 Review and accept: nitpick pins, stale items and the S08 exact diff	1	5	1	1	7
S35 Project shell: eight stages, artifacts, chat and canvas	8	·	2	1	5
S30 Style review: tokens learned from references	1	5	2	·	5
S38 Contextual GenUI panel in chat	6	·	1	3	4

Missing on purpose: Paraframe capture of live pages, MCP and team sharing are deferred by the PRD (FR-04 to FR-09, FR-47, FR-50 to FR-52). OpenDesign deploy, plugins and the Design Jury are out of scope for the first slice.
```
