# Onlook (`apps/studio`, `packages/*`) report for Spekin

**Read this first.** The clone is Onlook v2, an Electron desktop app. `README.md` says the v1 web version lives on a separate `v1` branch, and this repo has one commit and no such branch. So there is **no** hand-built style inspector, layers tree, or visual-edit-to-code AST engine here. Style edits go through the agent: pick an element, then the agent edits the files. The "visual edit → code" engine is described in section 3. I did not run anything. Where I only grepped, I say so.

## 1. FEATURES (by Spekin screen)

**S35 project shell**
- A window has a top band and tabs: one tab per open project plus the Projects screen (`AGENTS.md`, `apps/studio/src/main/tabs/`).
- A left rail holds Pages / Designs / Code views (`renderer/src/rail/`, `sidebar/PagesList.tsx`, `DesignsList.tsx`).
- A right rail holds the project chat. Panel widths persist, and the bounds are in `theme/REGISTER.md` §14.
- A Design/Interact mode switch sits at the top (`canvas/CanvasModeSwitch.tsx`). There are also a keyboard-shortcut registry (`shortcuts/registry.ts`), a tips/tour system (`tips/`, `tour/`), and onboarding (`packages/onboarding-ui`).

**S27 projects home**
- A fluid card grid with a 273:140 thumbnail ratio and a 220px column floor (`projects/ProjectGrid.tsx`, `gridTrack.ts`, `REGISTER.md` §12).
- A sidebar of workspaces, plus archive, discover and worktree cards (`projects/ProjectsSidebar.tsx`, `DiscoverCard.tsx`, `ArchiveDisclosure.tsx`).
- Project cards animate a thumbnail "arrival" (`REGISTER.md` §23).

**S28 import reference image**
- Images can be placed on the canvas by drop, paste or picker, with an alt field and a refusal band for bad files (`canvas/image/ingest.ts`, `dropSeat.ts`, `RefusalBand.tsx`).
- An "inspire" flow opens a reference site (Mobbin) in a frame, with a scripted choreography (`canvas/inspire/run.ts`, `choreography.ts`).
- First-run idea cards with generated illustrations (`canvas/ideas/IdeaCard.tsx`).

**S29 board canvas**
- Node types: frame (live app), artifact (HTML sketch), text, image, section (`canvas/model.ts`, `Canvas.tsx`).
- Device presets are 402×874, 744×1133 and 1512×982 (`canvas/frame/presets.ts`).
- A toolbar offers select, pan, frame, section, image, text and artifact, with a preview popover for each tool (`CanvasToolbar.tsx`, `toolPreview/`).
- Draw-a-frame with a live size readout, multi-select, resize handles, snapping guides, alt-drag duplicate, and arrow-key nudge that commits as one undo step (`gestures.ts`, `snapping.ts`, `useNodeNudge.ts`).
- Off-screen selection marks and a Recenter button (`OffscreenSelectionMarks.tsx`, `RecenterButton.tsx`). Pages hold their own cameras, and there is a node context menu (`canvas/menu/`).
- Frame toolbar: address pill, reload, open externally (`frame/FrameToolbar.tsx`).
- A frame cover shows server states: not started, stopped, page failed, port taken (`frame/FrameCover.tsx`, `coverState.ts`). The "breathing" ground shows that an agent is working in that frame (`frame/BreathingGround.tsx`).
- Frames can carry an agent "quote" overlay (`frame/FrameQuote.tsx`, `quoteRules.ts`).

**S30 style/design-system review**
- There is no style panel. What exists is the design register (`theme/REGISTER.md`, 890 lines), the theme (`theme/studioTheme.ts`, `neutralTheme.ts`) and a showroom of isolated components (`dev/showroom/`, `scripts/showroom.ts`).
- Alt-hold measurement shows distances between elements (`packages/events/src/measure.ts`) and margin/padding shading (`preload/spacing.ts`).

**S31 alternatives**
- The agent creates and duplicates frames and sections for variations (`main/agent-host/canvas-tools.ts`: `create_frame`, `duplicate_frames`, `create_section`). Frames can be reordered, and pages split work.
- There is no stack or compare viewer. Side-by-side on the canvas is the compare.

**S32 targeted edit**
- Click an element in a frame and an inline chat bubble opens beside it. The bubble morphs from an orb (`canvas/InlineElementChat.tsx`, `useInlineElementChat.ts`, `packages/chat-ui/src/InlineElementBubble.tsx`).
- Up to 10 element chips can be gathered into one prompt (`MAX_ELEMENT_SELECTIONS`, `packages/events/src/elements.ts`).
- Artifacts support direct text edit on static HTML only (`main/artifacts/README.md`, `text-edits.ts`).

**S33 / S08 nitpick and accept**
- A touched-files card lists files with +/− counts and a preview (`packages/chat-ui/src/TouchedFiles.tsx`).
- Tool approval cards have approve/deny (`ToolApproval.tsx`, `PermissionRow.tsx`).
- A Code panel has a save bar and a clash banner (`renderer/src/code/SaveBar.tsx`, `ClashBanner.tsx`, `clashVerdict.ts`).
- A git pill covers PR states from create-PR to merge (`packages/git-ui/src/state.ts`).
- There is no per-hunk accept/reject. Canvas undo and redo exist as an op log (`main/canvas/log.ts`).

**S34 hand-off**
- Export an artifact as HTML (self-contained), PDF, PNG, 2x PNG or JPEG, with a fan preview (`canvas/artifact/ExportPanel.tsx`, `main/artifacts/export.ts`, `pdf.ts`).
- The privacy check runs before the save dialog opens (`main/artifacts/privacy.ts`).

**S36 model and usage**
- Model and effort menu, permission-mode menu, and agent switch between Claude and Codex (`renderer/src/chat/ModelEffortMenu.tsx`, `PermissionModeMenu.tsx`, `agentSwitch.ts`).
- A usage meter with calm / warn (70%) / critical (90%) severity and rate-limit windows (`packages/chat-ui/src/UsageMeter.tsx`, `renderer/src/chat/limitCopy.ts`).
- BYOK is by design: it uses the user's own Claude Code or Codex login, and ships no model. This is hosted-agent only, with no local-model path.

**S38 contextual GenUI**
- The chat generates cards, but only from a closed set of tool outputs:
  - question sheet: stepped, tap or note, with a "recommended" mark (`packages/chat-ui/src/QuestionSheetView.tsx`, `questionSheet.ts`);
  - next-tasks card (`NextTasksCard.tsx`);
  - setup-steps card (`SetupStepsCard.tsx`);
  - queued-prompt "pen" row (`PenRow.tsx`);
  - tool rows, grouped files and commands (`tool-rows/`);
  - connectors menu (`renderer/src/chat/connectors/`).

**S37 build contracts / release readiness**
- Closest equivalents are the git/PR pill and the project setup proof (`main/workspace/setup-proof.ts`, `renderer/src/project-setup/`). Release gating is the repo's own `verify` script, not a product feature.

**Tablet and phone:** only as frame size presets. The app itself is desktop-only.

## 2. TASTE

- **Tokens.** Astryx theme with a documented design register where each value is marked FILLED, LEFT, CONFLICT or SUBSTITUTED, with the reason (`theme/REGISTER.md`, `studioTheme.ts`). Type scale is `{base 13, ratio 1.125}`. Radii are 4 / 8 / 12. Fonts are Inter Variable and JetBrains Mono (`REGISTER.md` §1–2).
- **Dark, low-chroma surfaces.** A panel is a near-black fill, a 0.5px hairline border, `--shadow-med`, and blur only where it floats (`REGISTER.md` §4, `panels/surface.ts`).
- **Accent semantics.** Teal means state on the canvas and blue means artifact kind (`REGISTER.md` §3). A P3 colour test exists (`theme/p3.test.ts`).
- **Handles and rings.** Both are counter-scaled so they stay constant on screen at any zoom (`canvas/NodeResizeHandles.tsx`, `frame/FrameRing.tsx`, `REGISTER.md` §9).
- **Layering.** One z-index ladder is mirrored in CSS and checked by a test (`overlay/layers.ts`, `layers.test.ts`).
- **Motion.**
  - Springs with velocity carry over on reversal (`canvas/spring.ts`, `useOrbMorph.ts`).
  - Bubble entry is 220ms with overshoot, and a send and a dismissal use different exits (`REGISTER.md` §22).
  - Camera moves are 250ms, with fit-on-open instant (`camera.ts`).
  - `cameraMotion.ts` pauses heavy work while panning.
  - Every animation has a `prefers-reduced-motion` branch (`styles.css`).
- **Micro-interactions.**
  - Hover is coalesced to one update per animation frame (`frame/hoverCoalesce.ts`).
  - A gesture tolerance of 3px separates click from drag.
  - Drop targets light up with an accent inset.
  - Chat has a sticky user message, scroll-to-bottom dot, shimmer text and char-morph text (`packages/chat-ui/`).
- **States.** The empty canvas has an animated scan illustration (`EmptyCanvasIllustration.tsx`, `styles.css` ~L1540). Frame cover states adapt to frame size through bands from full down to art (`frame/FrameCover.tsx`). Failure rows have their own copy modules (`failureLine.ts`).
- **Copy.** All strings are in i18n files with translator notes (`packages/i18n/src/locales/`). There is a writing guide (`WRITING.md`), and the agent is told to lead every question with a recommendation (`instructions/README.md`).
- **Performance.** Pan jank is measured per gesture kind (`renderer/src/perf/pan.ts`).

## 3. ENGINE

- **Languages and runtime.** TypeScript and React 19 only, on Electron 43, Bun and Turborepo (`package.json`, `apps/studio/package.json`). There is no Rust and no Python.
- **Canvas.** React Flow (`@xyflow/react` 12.11.2, MIT) does pan and zoom, and the zoom bounds are 0.05–4 (`canvas/model.ts`). Custom node types are registered in `canvas/Canvas.tsx`. State is a zustand store (`canvas/store.ts`), and persistence goes through main.
- **Document model.** A canvas is a `CanvasDoc` with typed ops: create, duplicate, move, resize, rename, set-text, create-page and others (`packages/events/src/canvas.ts` L163–183). A pure reducer applies them (`main/canvas/document.ts`) and writes an append-only op log with author, prior state and batch id (`main/canvas/log.ts`). The user, the agent and the system all author ops, which gives shared undo and redo. Files are written atomically (`main/fs-atomic.ts`, `main/state/file.ts`).
- **Frames and element mapping.** Each frame is an Electron `<webview>`, never an iframe (`GLOSSARY.md`). A guest preload script (`preload/guest.ts`, 836 lines) draws hover, selection and measure boxes in a fixed overlay that does not touch the user's DOM. It talks to the renderer over `sendToHost` / `ipc-message` (`canvas/frame/useFramePicker.ts`). An element is identified by evidence: tag, `tag:nth-of-type` DOM path, outer HTML (max 2KB), classes and frame URL, with secret redaction (`packages/events/src/elements.ts`, `preload/guest-evidence.ts`). Re-seeding after a reload marks a selection stale.
- **Visual pick → source mapping.** Main reads the React fiber `_debugSource` and the owner stack over an in-process CDP session. It resolves positions through source maps, clamps every candidate inside the worktree, and grades the result exact, likely or best-guess (`main/code/mapper/reader.ts`, `pipeline.ts`, `grade.ts`; types in `packages/events/src/code.ts`). This works only on a dev build of React. A production build gives a decline.
- **Edit engine.** The agent does the editing:
  - It runs on the Claude Agent SDK 0.3.322 or Codex's app-server, behind one `AgentBackend` (`main/agent-host/backend.ts`, `connection.ts`).
  - It works in a per-project git worktree, never the user's own checkout (`main/workspace/`).
  - Canvas and artifact tools are exposed to it as an MCP server (`canvas-tools.ts`, `studio-tools.ts`, `tool-names.ts`).
  - Briefings are plain string modules (`apps/studio/src/instructions/`).
  - Artifact edits are exact-match `oldText`/`newText` patches that must match once and carry an `expectedUpdatedAt` guard (`main/artifacts/text-edits.ts`).
- **Streaming.** SDK messages are folded into a typed `StudioEvent` log (`main/agent-host/reduce.ts`, `event-log.ts`, `packages/events/src/events.ts`). The renderer projects that log into the transcript. The log is replayable: there are recorded and replayed streams and a `replay/` module.
- **Preview.** The user's own dev server loads in a shared session. Artifacts load in an isolated no-network sandbox origin, and their previews are rendered offscreen as PNGs (`main/artifacts/session.ts`, `preview.ts`). Exports use `capturePage`, `printToPDF` and pdf-lib (`README.md`).
- **Validation.** One IPC contract table (`packages/events/src/channels.ts`, `ipc.ts`) is checked by import-layer rules (`scripts/check-imports.ts`) and Zod (4.6.6). Tests include unit (Bun), a PTY suite, Playwright e2e, and live token-spending tests (`tests/`).
- **Packages.** `events` (pure types and functions), `chat-ui`, `git-ui` and `onboarding-ui` (side-effect-free components), and `i18n`.

**Browser feasibility.** A browser build cannot use these:
- `<webview>`, the guest preload, CDP, and `node-pty`.
- The git worktree and the file system.
- The Agent SDK, which runs a local process in main.

These would work in a pure browser:
- The React Flow canvas, camera, snapping, selection and measure maths. Most of these are pure and unit-tested in `canvas/*.ts` (`snapping.ts`, `offscreenMarks.ts`, `readModel.ts`).
- The `CanvasOp` reducer and log, if ported or called through a Rust-WASM core.
- Chat-ui components, theme and motion.
- The inline bubble and question sheet.
- A browser lab already exists with a faked bridge: `bun run dev:lab` (`apps/studio/vite.lab.config.ts`, `renderer/lab/bridge.ts`).

In a browser, the frame's iframe would need a same-origin sandbox plus a small injected picker script.

## 4. MAPPING

| Spekin screen | Reuse (copy, with notice) | Adapt (pattern only) | Skip |
|---|---|---|---|
| S35 shell | Rail and panel resize rules; the `REGION` layout idea | Tab strip, top band | Electron window code |
| S27 home | `projects/gridTrack.ts` approach | Card grid, arrival animation | Worktree discovery |
| S28 import | `canvas/image/aspect.ts`; refusal band | Drop and paste seat | Mobbin "inspire" |
| S29 board | `snapping.ts`, `offscreenMarks.ts`, `cameraMotion.ts`, `spring.ts`, `measure.ts`; the `CanvasOp` log shape | React Flow node model; counter-scaled handles; frame cover bands | `<webview>`, CDP, server-state cover |
| S30 style review | REGISTER-style status table | Accent semantics (state vs kind) | Astryx-specific overrides |
| S31 alternatives | none | Section and duplicate-frames flow | none |
| S32 targeted edit | `elements.ts` evidence schema with redaction; hover coalescer; `useOrbMorph` | Inline bubble placement and morph; stale-selection marking | Guest preload (Electron IPC); fiber mapper (dev-React only) |
| S33 / S08 diff | `TouchedFiles` counts pattern | Stale-edit clash banner; touched-file list | Per-hunk accept (not built here) |
| S34 hand-off | `artifacts/privacy.ts` pre-check idea | Export panel and fan preview | `capturePage`, `printToPDF` |
| S36 model/usage | `usageSeverity` 70/90 thresholds; `limitCopy` reset formatting | Model/effort menu; permission menu | Claude/Codex login coupling |
| S37 contracts | none | Git pill state machine | Release scripts |
| S38 GenUI | Question-sheet state machine; `nextTasks` placement | Closed card set rendered from a typed event log | `PenRow` is app-specific |
| Tablet/phone | Preset sizes as frame data | none | Desktop chrome |

**Rust-core and no-Python conflicts.** All logic is TypeScript on Node/Bun/Electron, so nothing is Python-bound.
- **Node-bound:** `@anthropic-ai/claude-agent-sdk`, `node-pty`, `electron`, and `main/` file and git access. Do not carry these into Spekin.
- **Portable to a Rust core:** the canvas reducer and log (`main/canvas/document.ts`, `log.ts`), snapping and measure maths, and evidence validation. Treat the TS as the spec and port it, with golden tests.
- **Python scripts:** none found. `argparse` in the dependency list is a JS package.

## 5. LICENCE

- **Repo licence:** Apache-2.0, "Copyright 2024 On Off, Inc." (`LICENSE`). `package.json` agrees. Apache §4 applies: keep the licence, mark modifications, keep notices.
- **Not covered by the repo licence** (`ASSETS.md`):
  - Central Icons by Iconists, in `@central-icons-react/...` and `renderer/src/icons/`. Not reusable without your own licence.
  - Onlook name, logo and wordmark (`icons/OnlookMark.tsx`, `resources/brand/`).
  - DMG art, sounds, and the idea-card images (`canvas/ideas/*.webp`).
- **Custom terms:** `@anthropic-ai/claude-agent-sdk` (Anthropic legal terms, flagged custom-or-compound in `compliance/dependencies.json`).
- **Other notable entries** (`compliance/dependencies.json`, `NOTICE`):
  - Astryx, React Flow, zustand, motion, CodeMirror, pdf-lib, Electron and node-pty are MIT.
  - Inter and JetBrains Mono fonts are OFL-1.1.
  - `dompurify` is MPL-2.0 OR Apache-2.0.
  - `pako` is MIT AND Zlib.
  - `posthog-js` is Apache-2.0 AND MIT, and its embedded `rrweb` files are UNKNOWN.
- Of 258 inventory entries, 209 are MIT.
- Recommendation: copy only pure-TS maths and patterns, and replace the icon set. The Spekin icon set must not be Central Icons.