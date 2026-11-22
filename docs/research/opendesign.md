# OpenDesign (nexu-io/open-design @ e033aad): research report for Spekin

All paths are relative to the repo root. This was read-only. Some points are from file headers and greps rather than full reads, and I did not run anything.

**Bottom line**
- OpenDesign has no infinite board of frames, no alternatives stack or compare viewer, no accept/diff screen, and no hosted/BYOK/local model-source split like Spekin's.
- Its strengths are the project shell (chat plus preview split), preview-iframe hygiene, element comments, version history, and the token/motion system.
- Its engine is Node-only: Express 5, SQLite and Next.js, with agent CLIs spawned as child processes. It can serve as a pattern reference only, not as code to lift.

## 1. FEATURES (by Spekin screen)

**S35 project shell**
- Two-pane split of chat and workspace, with a resizable chat column (default 460px, min 345px, 4px handle, width persisted): `apps/web/src/components/project-split-layout.ts`, `ProjectView.tsx`.
- Tabbed workspace and tab launcher (`WorkspaceTabsBar.tsx`, `components/workspace/TabLauncherMenu.tsx`), Cmd/Ctrl+P file palette (`QuickSwitcher.tsx`), terminal tab (`TerminalViewer.tsx`), side chat (`SideChatTab.tsx`).
- Design Files panel (`DesignFilesPanel.tsx`), building state (`design-files/DesignFilesBuildingState.tsx`, `RunStepFeed.tsx`), conversation history dock (`chat/ConversationHistoryDock.tsx`).

**S27 projects home**
- Home hero with composer (`HomeHero.tsx`, `home-hero/`), recent-projects strip (`RecentProjectsStrip.tsx`), designs tab, new-project modal/panel (`NewProjectModal.tsx`), blank-state mark (`EntryBlankState.tsx`), nav rail (`EntryNavRail.tsx`).

**S28 import reference image**
- Figma import (`FigmaImportModal.tsx`), project reference modal (`ProjectReferenceModal.tsx`), brand reference picker (`BrandReferencePicker.tsx`).
- Composer attachments and paste. A "reference-extract" and "design-extract" atom exists in `runtime/design-toolbox.ts` and `plugins/_official/atoms/design-extract`.

**S29 board canvas**
- There is **no host-side infinite canvas or frame board**.
- The closest thing is a `.design-canvas` element authored inside the artifact, with the host reading its scroll position: `FileViewer.tsx:9242,9339`, `runtime/srcdoc.ts:2153`. A Claude Design import path patches `design-canvas.jsx` wheel handling: `apps/daemon/src/design/claude-design-import.ts:84`.
- Sketch editor on Excalidraw (`SketchEditor.tsx`, `sketch-model.ts`).
- Multi-frame was a stated aim in `docs/roadmap.md:120` and `docs/references.md`. The shipped version is a single preview with a viewport switcher.
- Device presets: desktop, tablet 820x1180, mobile 390x844 (`FileViewer.tsx:500-520`, `PreviewViewportControls`). Desktop has auto-fit zoom with a per-file cache (`FileViewer.tsx:586-1393`).
- Prompt-side device frames at `/frames/*.html` are referenced in `apps/daemon/src/prompts/discovery.ts:274-309`.

**S30 style / design-system review**
- Design-system picker, flow, kit view and preview modal: `DesignSystemFlow.tsx`, `DesignKitView.tsx` (the brand.html-style module stack: cover, logo, type, palette, voice), `DesignSystemPicker.tsx`, `DesignSystemPreviewModal.tsx`. Design-system revisions are fetched in `DesignSystemFlow.tsx`.
- 151 packages in `design-systems/<slug>/{manifest.json,DESIGN.md,tokens.css}`. Schema: `design-systems/_schema/{manifest,tokens}.schema.ts`. Contract described in `design-systems/README.md`.

**S31 alternatives**
- Only a `direction-picker` atom, which shows a visual catalogue of directions on request (`plugins/_official/atoms/direction-picker`, `docs/atoms.md`) and `QuestionForm.tsx` direction cards.
- No takes stack and no side-by-side compare.

**S32 targeted edit of a region**
- Comment mode: click an element to pin a comment and send it to chat. Marquee "pod" selection is a lasso stroke. Draw marks (box, pen, text) go through `PreviewDrawOverlay.tsx` and `components/BoardComposerPopover.tsx`.
- The element bridge protocol is `od:comment-target` / `od:pod-select` over postMessage: `runtime/comment-bridge.ts`.
- Anchors survive drift with an anchor state: `comments/anchor.ts`, `packages/contracts/src/api/comments.ts`, `preview_comments` table.
- Manual edit mode (Inspect, Edit, Tweaks, Draw) covers text/style/attribute patching, measurement and alignment guides: `edit-mode/{bridge,source-patches,types}.ts`, `ManualEditPanel.tsx`, `specs/current/manual-edit-mode-requirements.md`.

**S33 nitpick review / S08 accept diff**
- "Design Jury" (Critique Theater) is a five-panelist scored critique with rounds, a threshold, and interrupt on click or Esc: `components/Theater/*`, `apps/daemon/src/critique/*`.
- GenUI auto-derived `__auto_diff_review_<stageId>` choice surface with a partial-file checklist: `GenUISurfaceRenderer.tsx:132`.
- Version panel with a preview iframe, restore confirm and search: `FileViewer.tsx:4060-4285`. Daemon side: `apps/daemon/src/project-file-versions.ts` (`.file-versions/manifest.json`, sha256 digest, parent version, origin), `run-html-version-snapshots.ts`.
- Per-message immutable snapshots are **not implemented**. `specs/current/chat-artifact-versioning-design.md` is an audit draft.

**S34 hand-off download**
- Handoff menu: open in a local editor, or copy a prompt for a CLI agent, with a framework choice (react/vue/svelte/solid/next/vanilla): `HandoffButton.tsx`.
- "Finalize design package" synthesises DESIGN.md and marks it stale: `FinalizeDesignButton.tsx`, `apps/daemon/src/design/finalize-design.ts`.
- Handoff synthesis into a fresh conversation's first message: `design/handoff-design.ts`, `packages/contracts/src/api/handoff.ts`.
- Export to HTML, ZIP, MD, image, PDF, PPTX, JSX: `runtime/exports.ts`.
- Share/publish: `components/share/*`, deploy: `apps/daemon/src/deploy/`.

**S36 model and usage**
- Model switcher with a CLI/BYOK segmented control, provider chips and a model radiogroup: `InlineModelSwitcher.tsx`.
- BYOK fields and connection test: `components/byok/*`, `providers/*-compatible.ts`.
- Usage: `CodingPlanUsage.tsx` plus `coding-plan-usage-model.ts` (simultaneous windows, 5h/7d, credit counts as BigInt).
- Wallet balance and credits dialogs: `AmrBalanceDialog.tsx`, `AmrConcurrencyDialog.tsx`. Specs: `specs/current/coding-plan-client-billing.md`, `amr-wallet-balance-display.md`.

**S37 build contracts / release readiness**
- Artifact lint (`apps/daemon/src/lint-artifact.ts`) and deliverable syntax validation (`run-deliverable-validation.ts`, `contracts/src/api/deliverable-syntax.ts`).
- Run-failure classification and a repair card: `run-failure-classification.ts`, `chat/RunErrorCard.tsx`.
- `build-test` atom and conformance harness (`plugins/_official/atoms/build-test`, `critique/conformance.ts`).

**S38 contextual GenUI**
- Surfaces: `confirmation`, `oauth-prompt`, `choice`, `form` (JSON-Schema form) and sandboxed-iframe plugin components, answered through `genui:respond` postMessage: `GenUISurfaceRenderer.tsx`, `GenUIInbox.tsx`, `apps/daemon/src/genui/*`.
- Streamed `<question-form>` rendered from a truncated JSON prefix: `artifacts/question-form.ts`, `runtime/partial-json.ts`, `QuestionForm.tsx`.
- Context chips with a kind icon and removal: `ContextChipStrip.tsx`.
- Next-step action rows: `NextStepActions.tsx`. Composer mode Plan/Design/Ask: `ComposerModePicker.tsx`.

**Tablet and phone**
- Only the preview viewport presets above. No responsive app chrome was found.

## 2. TASTE

- **Tokens**: neutral greys carry the UI. Brand green is reserved for sparse feedback (`--brand #87ea5c`, `--brand-ink #007106`). Send button is `#00ff08` on `#202020`. Radius scale is 2/4/8/12/16 with a "no off-scale values" lock. Z-ladder is `--z-hint 4000` and `--z-menu 9000`: `apps/web/src/styles/tokens.css`.
- **Type**: Albert Sans variable plus JiduMono Pro for times, paths and hex. UI weights are a consolidated 500/600/700 ladder, with 600 as the default. Body is 14px at 125% line height: `styles/base.css`.
- **Material**: frosted glass tiers (ultrathin/thin/regular/thick blur at 8/16/24/40px, saturate 1.6), a single app-wide modal scrim (`--scrim-tint` and a 50px blur), and a reduced-transparency fallback: `styles/material.css`.
- **Motion**: product ease `cubic-bezier(0.23,1,0.32,1)`. Springs for modal, popover and toast (stiffness 400-500, damping 25-30). A 40ms stagger: `apps/web/src/motion.ts`, `styles/entrance.css`, duration tokens `50-500ms`. Streamed text reveals per character: 0.4s, blur 10px to 0, 10ms stagger, capped to about 2s total. No cursor: `components/chat/useCharReveal.ts`.
- **Chat panel craft**:
  - Stick-to-bottom, anchor-to-top and jump-to-latest scroll logic (`runtime/chat/{stick-to-bottom,anchor-to-top,jump-to-latest}.ts`).
  - Queued sends (`chat/QueuedSendStack.tsx`), text-selection quoting (`chat/QuoteBar.tsx`) and a Lexical composer with @mentions (`components/composer/*`).
  - Components consume only `--chat-*` theme-seam variables: `components/chat/AGENTS.md`.
- **States as a first-class rule**: absent data gets no placeholder or fake value, per `components/chat/AGENTS.md` section 3. The reconnect row is a borderless status line with "2/5" attempts, a shimmer, and disappears on recovery (`chat/Reconnect.tsx`). Error card is one red title, one paragraph and right-aligned actions (`chat/RunErrorCard.tsx`). Loaders: `MatrixLoader.tsx`, `SiriOrb.tsx`, `PixelLiquid.tsx`. Blank-state mark draws on with hover (`EntryBlankState.tsx`).
- **Preview performance**: keep-alive iframe pool of 5 (`IframeKeepAlivePool.tsx`), zoom and viewport cached per file. i18n covers 19 locales and keys are enforced by typecheck.
- **Weak spots for Spekin to avoid**: files of 7k-20k lines (`FileViewer.tsx` is 20,759 lines, `ProjectView.tsx` 17,066), with the CSS split between global `chat.css` (3,966 lines) and CSS Modules, and the Chinese-language design rationale embedded in comments.

## 3. ENGINE

- **Languages and runtime**: all TypeScript on Node 24, with pnpm workspaces. Web is Next.js 16 on React 18 (`apps/web/package.json`). The daemon is Express 5 with `better-sqlite3`, `node-pty`, `chokidar`, `multer` and the MCP SDK (`apps/daemon/package.json`). Shared contracts use zod (`packages/contracts`).
- **Agent orchestration**: the daemon does not call models itself. It spawns the user's installed agent CLI (Claude, Codex, OpenCode, cursor-agent and about 20 more) through a runtime registry, with per-runtime stream parsers: `apps/daemon/src/runtimes/{registry,detection,launch,runs}.ts`, `claude-stream.ts`, `json-event-stream.ts`. Protocol adapters: ACP and pi-RPC (`agent-protocol/`), codex app-server.
- **BYOK**: either a thin streaming proxy (`routes/chat.ts:986-1395`, `/api/proxy/{anthropic,openai,azure,google,ollama}/stream`) or a headless `byok-opencode` run (`docs/headless-byok.md`).
- **Streaming**: HTTP plus SSE (`providers/sse.ts`), run events typed in `packages/contracts/src/sse/*`, with cancel, retry and resume (`run-retry-policy.ts`, `agent-session-resume.ts`).
- **Prompt composition**: design system, skill/template, craft rules and project metadata compose into one prompt: `apps/daemon/src/prompts/`, `docs/prompt-composition.md`.
- **Preview pipeline**: HTML is wrapped by `buildSrcdoc` (`runtime/srcdoc.ts`, 4,433 lines) with injected bridges for comments, edit mode, deck navigation, a redirect-loop guard, a sandbox shim and a base-href bridge, then rendered in an `<iframe sandbox>`. Same-origin `/artifacts/*` and `/frames/*` are rewritten through the daemon.
- **State and persistence**: no client store library. React state plus `localStorage` for UI preferences. SQLite holds projects, conversations, messages, `preview_comments`, `tabs` and `deployments`. Generated files live on disk, with per-file versions in `.file-versions/`.
- **Validation**: zod contracts, artifact lint, deliverable syntax repair, path validation (`projects.ts`) and `O_NOFOLLOW` in the critique writer.
- **Extension model**: plugins are static `SKILL.md` plus `open-design.json` assembled from atoms into pipeline stages. The same flow runs headless through the `od` CLI (`docs/plugins-spec.md`, `docs/atoms.md`).
- **Key web packages (licences from my knowledge of these projects, not read in-repo)**: `motion` (MIT), `@excalidraw/excalidraw` (MIT), `lexical` (MIT), `shiki` (MIT), `three` (MIT), `dompurify` (Apache-2.0/MPL-2.0). `gsap` has its own licence and needs a check.

## 4. MAPPING

| Spekin screen | OpenDesign pieces | Reuse / adapt / skip |
|---|---|---|
| S35 shell | split layout, tabs, quick switcher | **Adapt** (pattern only). Don't copy the 17k-line `ProjectView.tsx`. |
| S27 home | hero composer, recents strip, blank state | **Adapt**. |
| S28 import | Figma import, reference picker, `design-extract` atom | **Adapt**. Rust core would do the extraction, not the Node agent. |
| S29 canvas | none host-side (in-artifact `.design-canvas` only), device presets | **Build new.** Reuse device presets 820x1180 and 390x844 (adapt). Excalidraw (MIT) is an option only for sketch tools. |
| S30 style | design-system flow, kit view, `design-systems/` (manifest, DESIGN.md, tokens.css) | **Adapt** the package shape. **Copy** the JSON-Schema or manifest idea. Third-party brand content is **skip** (trademark and provenance). |
| S31 alternatives | direction picker only | **Build new.** |
| S32 targeted edit | comment bridge, pod lasso, anchor drift states, `BoardComposerPopover`, draw overlay | **Adapt** (strongest match). The bridge protocol and anchor-state enum are worth copying as patterns (Apache-2.0 allows copying with NOTICE). |
| S33 / S08 | Design Jury, version panel, `__auto_diff_review`, project-file-versions | **Adapt** version manifest (digest, parent, restore) as a Rust persistence design. Critique parser pattern is optional. |
| S34 hand-off | `HandoffButton`, finalize/DESIGN.md, `exports.ts` | **Adapt**. Skip the "open in editor" part. Rebuild exports in Rust or WASM. |
| S36 model/usage | `InlineModelSwitcher`, `CodingPlanUsage`, BYOK fields, wallet dialogs | **Adapt** the UI. Note the string-credits-as-BigInt pattern. Daemon billing is Vela/AMR-specific, so **skip**. |
| S37 build contracts | lint, syntax repair, failure classification, `RunErrorCard` | **Adapt**. |
| S38 GenUI | `GenUISurfaceRenderer`, partial-json, `ContextChipStrip`, `QuestionForm` | **Adapt**. The `genui:respond` iframe envelope and truncated-JSON repair are good small patterns. Copy `partial-json.ts` with a NOTICE if wanted. |
| Tablet/phone | none | **Build new.** |
| Tokens and motion | `tokens.css`, `material.css`, `motion.ts`, `entrance.css` | **Copy with NOTICE**, or **adapt** values. Cheapest high-taste win. |

**Conflicts with the Rust-core / no-Python rule**
- **Business logic is Node-bound.** Orchestration, persistence and validation live in `apps/daemon` (Express, `better-sqlite3`, `node-pty`). Spekin's Rust core replaces all of it. The reusable surface is `packages/contracts` shapes (zod becomes serde plus generated TS) and the React components.
- **Python in the repo is outside `apps/` and `packages/`**: no `.py` under either. It sits in `skills/hatch-pet`, `skills/oil-motion`, `skills/ui-animation`, `skills/chat-motion-overlay`, `skills/pptx-html-fidelity-audit`, `design-templates/last30days` and `.github/scripts`. Skip all of it.
- **One runtime Python dependency**: prompts tell agents to run `python3 -c` to parse JSON, at `apps/daemon/src/prompts/media-contract.ts:400-411` and `apps/daemon/src/cli.ts:2791-2797`. Don't copy those snippets.
- I found no Rust code (`.rs` / `Cargo.toml`) in the repo.
- The agent model is CLI-spawn. It fits Spekin's "deferred local agent" but not Hosted or BYOK, which need a Rust-side model client.

## 5. LICENCE

- **Repo**: Apache-2.0 (`LICENSE`, `package.json`, `README.md:745`). Copying code needs the licence text, changed-file notices and any NOTICE carried over.
- **Bundled units with their own licences** (README says they retain them). There are 105 LICENSE files, mostly MIT, with authors including Zara Zhang, Leonxlnx, alchaincyf, GreenSock, lewis and Matt Pocock.
  - `design-templates/guizang-ppt/` (MIT).
  - `design-templates/html-ppt/` (MIT).
  - `skills/web-clone/` (MIT).
  - `skills/hatch-pet/LICENSE.txt` (Apache-2.0).
  - `skills/gsap-*` (MIT, GreenSock copyright).
  - `design-templates/last30days/scripts/lib/vendor/bird-search/` (vendored, own LICENSE).
  - A vendored Three.js r160 under `plugins/_official/examples/*` (MIT).
  - `tools/pack/resources/win/7zip/License.txt`.
- **Not verified, so check before reusing**:
  - `gsap` and `hyperframes` npm packages (licences not read).
  - `@ffmpeg-installer/ffmpeg` (bundles binaries).
  - JiduMono Pro font (`apps/web/public/fonts/`, no licence file found).
  - Albert Sans (likely OFL, no licence file found).
  - The 151 brand-named `design-systems/*` packages (e.g. stripe, linear-app). Their manifests describe them as "OpenDesign curated bundled fixture", so treat their provenance and trademarks as unresolved.