# Momo GenUI research report for Spekin

Repo: `momo/repo` (momo-next, 165 files under `src/`). Paths below are relative to that root. I changed nothing in the repo.

Two checks need doing before anything is committed to. The `node_modules` packages are not installed, so licences come from `package-lock.json` only. Component counts differ between the README and the code, and I note them below.

## 1. FEATURES

**Chat (the main thread)**
- Streaming thread with prose and inline GenUI blocks mixed together. The mixed-stream parser is `src/lib/openui/streamParser.ts` and the thread view is `src/components/shell/MessageThread.tsx`.
- Collapsible "thinking process" with token and second counters and a tool-step timeline: `src/components/shell/MomoThinkingProcess.tsx`.
- Citation badges and source pills: `src/components/shell/CitationBadge.tsx`, `SourcePillRow.tsx`.
- Composer with a peaked attachment fan and a model/effort dock: `src/components/composer/*`, `src/lib/modelCatalog.ts`.
- 18 role personas. A server pre-flight returns HTTP 409 when a question belongs to another role, and the UI shows a handoff card: `src/lib/rolePersonas.ts`, `src/lib/localBrain.ts`, `src/app/api/brain/route.ts:494-505`.

**Explore (research spreads)**
- Horizontal editorial spreads. Vertical wheel input is converted to horizontal glide, and new spreads auto-scroll into view: `src/components/shell/ExploreWorkspaceView.tsx:2512-2580`.
- A cover planner picks one of four cover modes (photo, schematic, signal, monograph): `src/lib/openui/exploreCoverPlanner.ts`.
- Contextual follow-up branches at the end of each turn: `src/lib/openui/exploreEndcapPlanner.ts`.
- A place-detail modal with its own route: `src/components/genui/ExplorePlaceDetailModal.tsx`, `src/app/api/explore-detail/route.ts`.

**Pinboard**
- Kanvas (pan and zoom) and Grid views. Zoom is clamped to 0.72–1.15 and pan to a maximum of 180 px: `src/components/shell/RoleBoardWorkspaceView.tsx:69-74`.
- Custom pointer-based card drag with edge auto-pan and drop-index logic: lines 560-720. A card tilts up to ±4.5° with horizontal speed while dragged.
- Star, done and filter modes, a sticker menu, and tilted vinyl stickers: `src/components/genui/BoardSticker.tsx`. Handwritten notes use `handNote` on the item.
- "Rearrange this board" prompt chips call the `sync_workspace_board` tool: `RoleBoardWorkspaceView.tsx:865-894`.

**GenUI Studio (`/playground`, 1405 lines)**
- Mounts every registered component against sample data in `ready`, `loading`, `streaming`, `empty` and `error` states, in four variants and both themes. It has a 4-up compare mode and saves drafts to localStorage: `src/app/playground/page.tsx`, `src/app/playground/sampleData.ts`.
- DialKit live controls tune accent, radius, padding and font scale (`page.tsx:24,412`).

**Card families**
- Mistline classic cards: 29 entries in `src/lib/mistlineCatalog.ts`, rendered by `src/components/genui/MistlineLibrary.tsx` (11.6k lines).
- Intelligence cards: 127 registered ids in `src/lib/intelligence/*/register*.ts`, across 9 categories (`src/lib/intelligence/types.ts:19-28`).
- Charts built on d3 scales: `src/components/intelligence/charts/*`.
- Graph cards on xyflow + elk: `src/components/intelligence/graphs/IntelligenceGraph.tsx`.
- Map card on leaflet: `src/components/cards/InteractiveMapBlock.tsx`.
- Mermaid is rendered with `securityLevel: "strict"` (`MermaidRenderer.tsx:84`), and `src/lib/intelligence/mermaidToGraph.ts` converts it to graph data.
- Count mismatch: `src/lib/openui/momoSchema.ts` defines 212 components (178 in the `intelligence` group), but the README claims 169 + 32 + 24. Treat the README numbers as marketing.

**Other**
- A 4,209-line WebGL2 mascot at `src/avatar/*`. It is irrelevant to Spekin.

## 2. TASTE

- **Skeleton from partial data.** `GenerativeSkeleton` (`src/components/genui/MistlineBlocks.tsx:432`) outlines each block from the props received so far. It ghosts real text, grows list rows one at a time, draws chart bars at their real heights, and sets `aria-busy`. It then reveals the finished card.
- **Per-block progressive reveal.** The Stack renderer reveals each block in turn, so only the block being written shows as a skeleton (`src/lib/openui/momoLibrary.tsx:62-100`). Fade and rise values are 8 px, 0.24 s, ease `[0.22, 1, 0.36, 1]`, with stagger capped at 0.16 s.
- **One motion vocabulary.** Durations (0.12–0.36 s), springs, staggers and hover/press values are all tokens in `src/components/motion/MotionPrimitives.tsx`. A global `MotionConfig` sets `reducedMotion="user"` (`src/components/providers/MotionProvider.tsx`).
- **Rule that GenUI CSS has no `transition`.** State changes go through `motion/react`, and only shimmers and spinners are CSS keyframes (`AGENTS.md`). Helpers for check-mark drawing, meters and staggered entry are in `src/components/intelligence/shared/StateMotion.tsx`.
- **One shell for all card states.** `IntelCardShell.tsx` handles loading, error and empty, plus four variants (default, editorial, split, minimal). It has a spring entry, a "spine" header, a source list, and `role=status` or `role=alert`. An empty card renders nothing unless it is streaming.
- **Skeuomorphic surfaces.** Inset 1 px white highlights plus soft drops (`--e1..e3`), and shimmer built from `color-mix` (`src/styles/motion-and-skeletons.css`). Tokens live in `src/styles/00-base.css` line 3: warm grey surfaces, coral accent `#ef8c66`, `--col` 800 px, `--bar` 52 px.
- **Type pairing.** Space Grotesk for UI, Instrument Serif for editorial, and Indie Flower / Reenie Beanie for handwritten marginalia (`src/app/layout.tsx:11-45`). The `.gu-pen` annotation class is in `src/styles/mistline-genui.css`.
- **Themes.** Porcelain light and Obsidian dark are set by `data-theme`. An inline script avoids flash on first paint (`src/app/theme-script.tsx`), and `color-scheme` and the `theme-color` meta follow it.
- **Responsive and touch.** Container queries, an off-canvas drawer with drag, `env(safe-area-inset-*)`, a `hover:none` branch that shows actions permanently and uses `:active` states, and a reduced-motion block (all in `src/styles/00-base.css`).
- **Thinking telemetry.** Digit-reel number roll for tokens and seconds, dot-matrix glyphs for "thinking/globe/search/pen", and shimmering step labels (`MomoThinkingProcess.tsx:15-300,943,1073`).
- **Drag feel.** Tilt follows drag velocity, a decay timer settles it flat, and the card is carried as an overlay.
- **Error voice.** An unfinished block shows a quiet handwritten "block not finished" note, and render errors appear only if nothing rendered (`OpenUiStreamView.tsx:92-125`).

## 3. ENGINE

**Languages and stack.** TypeScript on Next.js 16.4.6, React 19.3.1 and Tailwind 4. Everything runs on Node: server routes use `runtime = "nodejs"` and `maxDuration = 60`. There is no Rust and no Python.

**Generation loop** (`src/app/api/brain/route.ts`, 2128 lines)
1. The client POSTs messages, a workspace snapshot, model id and effort. The snapshot holds board columns, the first 24 items, pinned titles and Explore component names (`MomoAppShell.tsx:2620-2670`).
2. The server builds a static system prompt plus dynamic turn guidance (`src/lib/genUiDesignSpec.ts`).
3. The UI Planner decides response UI versus persistent workspace, and the task transition (`new_task`, `continue_task`, `refine_task`, `change_direction`). It picks capability families and a subset of components for the turn (`src/lib/openui/uiPlanner.ts`, `momoSchema.ts:3150-3175`).
4. The server calls the Gemini `streamGenerateContent?alt=sse` endpoint (route.ts:825). Reasoning effort is mapped to a thinking budget of 1024, 4096 or 8192 (route.ts:355-370). Function calls are `web_search`, `search_images` and `sync_workspace_board` (`genUiDesignSpec.ts:1102`).
5. It re-streams typed SSE events: `turn_meta`, `reasoning_delta`, `text_delta`, `tool_result`, `board_update`, `turn_done`, `turn_error` and others (`src/types/momo.ts:354-450`).
6. A continuation pass runs when the output stops inside an unclosed fence or leaves undefined references (`streamParser.ts:1141-1180`, route.ts:2027).

Other server behaviour:
- Provider key rotation with cooldowns is held in module-level memory (route.ts:160-225).
- It reads `.env.local` from disk (route.ts:227).

**OpenUI Lang rendering**
- Schemas are zod, with one source of truth for server and client (`src/lib/openui/momoSchema.ts`). `createLibrary` and `defineComponent` come from `@openuidev/lang-core`, and the prompt is generated from the library (`momoSchema.ts:3205`).
- The runtime schema is made permissive on purpose. `toPermissiveRuntimePropsSchema` turns every field into `z.any()` plus passthrough, so a bad prop never drops the whole node (`momoSchema.ts:3068`).
- Pre-parse repair of model output (`streamParser.ts:319-700`):
  - swaps title-first argument order
  - strips named arguments
  - wraps a single root component in a Stack
  - balances quotes and brackets
  - repairs glued restarts
- Incremental parsing uses `createStreamingParser` for partial text and `createParser` once final, with a streaming fallback if the final parse has no root (`streamParser.ts:686-709`).
- The client mounts `<Renderer response library isStreaming onError>` from `@openuidev/react-lang` (`OpenUiStreamView.tsx`). Leaf renderers call `useIsStreaming`.
- Post-parse prop repair is in `propRepair.ts` (README says "5-pass"; I count roughly five fixes, so treat this as approximate):
  - shifted positional slots
  - string-to-number coercion in charts, including "Rp 6.000.000"
  - table rows re-keyed to the declared columns
  - follow-up items normalised
  - image field aliases mapped
- Content contracts drop junk rows and drop a whole card if no usable row is left: "missing is not zero" (`src/lib/openui/contentContracts.ts:560-576`).

**State and persistence**
- There is no store library. All state is one `sessions: ChatSession[]` in `useState` inside `MomoAppShell.tsx` (5,471 lines).
- Each `ChatSession` holds `messages` (Chat), `exploreMessages` (Explore), `pinnedItems`, `boardItems`, `boardColumns` and `boardsByLook` (Pinboard) (`src/types/momo.ts:333-352`).
- Sync paths between the three views:
  - the pin toggle from any card calls `handleTogglePinItem` (`MomoAppShell.tsx:1988-2050`)
  - the `board_update` SSE event overwrites the board (`:2774`)
  - the board snapshot goes back to the model on every turn
  - `storage` events keep other tabs in step for theme and bots
- Persistence is localStorage, newest 20 sessions, falling back to 6 when the quota is exceeded (`MomoAppShell.tsx:1170-1240`).
- Image handling: a proxy blocks unsafe URLs, follows redirects manually for up to 4 hops and re-checks every hop (`src/app/api/image/route.ts:30-55`). It also uses a verified-URL pool and Gemini vision reranking (`src/lib/visionRerank.ts`).

**Canvas.** The Pinboard canvas is not `@xyflow/react`. It is hand-written pointer handling, `motion` values and CSS `zoom` (`RoleBoardWorkspaceView.tsx:1527`). Only the Intelligence graph cards use xyflow. They compute layouts with `elk.bundled.js` using layered, mrtree, force, radial, stress and rectpacking (`IntelligenceGraph.tsx:41-90`).

**Libraries and licences** (`package-lock.json`)

| Package | Version | Licence |
|---|---|---|
| `@openuidev/react-lang` | 1.1.1 | MIT (L946) |
| `@openuidev/lang-core` | 1.1.1 | MIT (L921), has an install script |
| `@openuidev/devtools` | 0.3.1 | MIT (L892) |
| `@openuidev/observability` | 0.0.4 | MIT (L940) |
| `@xyflow/react` | 13.0.2 | MIT (L1664) |
| `@xyflow/system` | 1.0.0 | MIT |
| `elkjs` | 0.12.1 | EPL-2.0 OR GPL-3.0-or-later (L2394) |
| `motion` / `motion-dom` / `motion-utils` | 14.14.0 / 14.14.0 / 14.7.0 | MIT |
| `dialkit` | 2.2.1 | MIT (L2347) |
| `zod` | 4.6.7 | MIT |
| `d3` | 7.9.2 | ISC |
| `mermaid` | 12.3.0 | MIT |
| `leaflet` | 1.9.4 | BSD-2-Clause |
| `next` | 16.4.6 | MIT |
| `react` | 19.3.1 | MIT |

`lang-core` has peer dependencies on zod and an optional MCP SDK, and depends on `ci-info`. `react-lang` pulls in devtools and observability, which are bundled as dependencies.

## 4. MAPPING

Overall rule: copy nothing from Momo. Use the libraries directly.

| Spekin screen | Momo features and engine that apply | Decision |
|---|---|---|
| S38 contextual GenUI panel | The streaming loop, `Renderer` with a zod library, permissive schemas, `GenerativeSkeleton`, and content contracts | Use the libraries. Adapt the patterns for permissive runtime schemas, per-block skeletons, and contracts that drop rows rather than pad. Skip Gemini-in-Node and the role gate. |
| S29 board canvas | Pointer drag with edge auto-pan, tilt, pan/zoom clamp, drag overlay | Adapt the pattern only. Spekin needs an infinite canvas, so use `@xyflow/react` (MIT) and `elkjs` for auto-layout. Momo's CSS `zoom` approach does not scale. |
| S35 project shell, S27 projects home | Three-view switcher, session list, sticky dock | Adapt the layout pattern. Do not copy the single 5,471-line shell or the localStorage store. Use Rust-backed persistence. |
| S28 import reference image | Verified-image pipeline, SSRF-safe proxy, vision rerank | Adapt the SSRF rules into the Rust core. Skip the web-search providers. |
| S30 style and design-system review | Playground states and variants, DialKit controls, theme tokens | Reuse `dialkit` (MIT) for live token tuning. Adapt the playground state grid for screen QA. |
| S31 alternatives | Playground 4-up compare, pinboard drag-to-reorder | Adapt the compare grid. |
| S32 targeted edit | Positional-argument repair, prop repair, `Followups` chips | Adapt the repair ideas for edits. No Momo feature for region editing. |
| S33 / S08 accept diff | `CodeDiffPatch` and `DocumentDiff` cards (Both/Before/After) | Adapt the interaction pattern only. |
| S34 hand-off download | Nothing. Momo has no export. | Not covered. |
| S36 model and usage panel | `modelCatalog.ts`, effort levels, telemetry events (prompt, completion, reasoning, cached tokens), thinking-process reel | Adapt the telemetry event shape and the digit-reel look. Add BYOK and a ledger in Rust. |
| S37 build contracts and release readiness | `IntelComponentSpec`, a 13-point contract for states, a11y and sources (`src/lib/intelligence/types.ts`) | Adapt as a checklist for Spekin cards. |
| Tablet and phone | `@container` queries, drawer drag, `hover:none` branch, safe-area insets | Adapt the patterns. |

**Conflicts with the Rust-core / no-Python rule**
- `src/app/api/brain/route.ts` holds orchestration, tool calls, key rotation and in-memory cooldowns in Node. In Spekin this belongs in a Rust service.
- The same file reads `.env.local` with `node:fs`.
- The `@openuidev/lang-core` parser and the zod schemas are TypeScript-only. The parse step stays in the browser unless a Rust port is made.
- State and business logic live in one TypeScript React component with localStorage. That is the opposite of the Rust persistence rule.
- No Python anywhere.

## 5. LICENCE

- **Repo licence:** none. There is no `LICENSE`, `NOTICE` or `COPYING` file at the root. The README and `AGENTS.md` carry no licence text, and `package.json` has no `license` field (see `package.json`, not the lock file). Git history has no licence-related commits. So all rights are reserved by default and nothing can be copied.
- **Vendored third-party source units:** none found. The only local binaries are the two Space Grotesk `.woff2` files in `public/fonts/`. Other fonts (Instrument Sans, Instrument Serif, Indie Flower, Reenie Beanie) load through `next/font/google`. Space Grotesk and the others are, from general knowledge, SIL OFL, but I did not verify this in the repo.
- **Notable licences in the lock file** (`package-lock.json`):
  - 142 packages are MIT and 37 are ISC.
  - `elkjs` is the odd one: EPL-2.0 OR GPL-3.0-or-later. Choose EPL-2.0. It is weak, file-level copyleft and fine to depend on unmodified.
  - `lightningcss` (MPL-2.0) is a build-time tool.
  - `dompurify` is MPL-2.0 OR Apache-2.0.
  - About 10 LGPL-3.0-or-later entries (from line 215) look like `sharp` libvips binaries for Next image optimisation. This repo sets `images.unoptimized: true`, so Spekin would not need them.
  - `CC-BY-4.0` appears once and probably belongs to `caniuse-lite`. I did not check the name.

## Recommendation: getting the same GenUI engine legally

The engine is made of permissive libraries plus about 5,000 lines of glue that cannot be copied. Spekin can rebuild the glue from the pattern.

1. **Use the libraries directly.** `@openuidev/react-lang` and `lang-core` (MIT), zod 4 (MIT), `@xyflow/react` (MIT), `elkjs` (EPL-2.0 option), `motion` (MIT), `dialkit` (MIT), `d3` (ISC). Add a `NOTICE` file with the licences. Pin exact versions, and review the `lang-core` install script before allowing it in CI.
2. **Single source of truth for schemas in Rust.** Define the Spekin component catalogue as Rust structs with serde and `schemars`, which emits JSON Schema. Generate the TypeScript types and zod validators from that schema. This replaces Momo's `momoSchema.ts`, which exports to JSON Schema via `library.toJSONSchema()` (`momoSchema.ts:3177`) so a schema-first layout already works.
3. **Rust validates, TypeScript parses and renders.** The browser parses OpenUI Lang with `lang-core` and renders with `react-lang`. The Rust core receives the resulting AST (or the final program text) and validates it against the generated JSON Schema (for example with the `jsonschema` crate). It also applies the content contracts and runs a prop-repair pass as pure functions. Both are small and rule-based (`contentContracts.ts`, `propRepair.ts`), so they port to Rust with golden tests. The language is positional (`name = Component(args)`), so a Rust port of the parser is possible later if needed.
4. **Rust runs the model loop.** Model calls (hosted or BYOK), the tool loop, SSE streaming, usage ledger and persistence live in the Rust core. Browser TypeScript keeps only rendering and UI state.
5. **Keep the permissive-runtime idea.** Validation at the boundary is strict, but the renderer tolerates drift, so one bad prop never blanks a card.

Key files for follow-up: `src/lib/openui/momoSchema.ts`, `src/lib/openui/streamParser.ts`, `src/lib/openui/propRepair.ts`, `src/lib/openui/contentContracts.ts`, `src/lib/openui/momoLibrary.tsx`, `src/components/genui/OpenUiStreamView.tsx`, `src/components/genui/MistlineBlocks.tsx` (skeleton), `src/components/shell/RoleBoardWorkspaceView.tsx`, `src/app/api/brain/route.ts`, `package-lock.json`.