// Lead-owned maps for the F00 feature map and the R00 references-and-engine board.
// Sources: docs/research/{opendesign,onlook,momo,paraframe}.md (22 Nov 2026) and PRD v0.2.2.

// Board -> stage it serves and the engine layers it needs (layer ids from ENGINE below).
export const BOARD_META = {
  S35: { stage: 'All stages', layers: ['ui', 'core', 'agent'] },
  S27: { stage: 'Before a project', layers: ['ui', 'core'] },
  S28: { stage: 'Design', layers: ['ui', 'core', 'preview'] },
  S29: { stage: 'Design', layers: ['canvas', 'preview', 'agent', 'core'] },
  S30: { stage: 'Design', layers: ['ui', 'core', 'agent'] },
  S31: { stage: 'Design', layers: ['canvas', 'preview', 'agent'] },
  S32: { stage: 'Design, Frontend', layers: ['preview', 'agent', 'core'] },
  S33: { stage: 'Design, Specification', layers: ['ui', 'core'] },
  S34: { stage: 'Frontend', layers: ['core', 'ui'] },
  S36: { stage: 'All stages', layers: ['agent', 'core'] },
  S37: { stage: 'Backend to Deployment', layers: ['core', 'ui'] },
  S38: { stage: 'All stages', layers: ['genui', 'core'] },
  T01: { stage: 'Design review on the go', layers: ['ui'] },
  S40: { stage: 'All stages', layers: ['ui', 'core', 'agent'] },
};

// The engine Spekin runs on, layer by layer. take = what Spekin uses; from = where the idea or code comes from.
export const ENGINE = [
  { id: 'ui', name: 'Browser UI shell', lang: 'TypeScript, React', take: 'Project split (chat, workspace, inspector), artifact tabs, context chips, model switcher, hand-off menu, tokens and motion.', from: [['OpenDesign', 'ChatPane, FileWorkspace, ContextChipStrip, InlineModelSwitcher, HandoffButton, motion.ts. Apache-2.0: reuse with NOTICE; do not copy the 17k-line ProjectView.']], lic: 'Apache-2.0' },
  { id: 'canvas', name: 'Board canvas', lang: 'TypeScript', take: 'Infinite board of frames, camera, snapping, counter-scaled handles, off-screen marks, frame covers. One CanvasOp log shared by user, agent and system gives undo and redo.', from: [['Onlook', 'React Flow node model, snapping.ts, offscreenMarks.ts, cameraMotion.ts, spring.ts, CanvasOp reducer and log shape. Apache-2.0 maths and patterns.'], ['Library', '@xyflow/react (MIT); elkjs for auto layout (EPL-2.0 option).']], lic: 'MIT, Apache-2.0' },
  { id: 'preview', name: 'Frame preview and part picking', lang: 'TypeScript in a sandboxed iframe', take: 'Each frame renders live HTML in a sandboxed iframe. A small injected picker reports the part under the pointer; comments and pins keep anchors when the page drifts.', from: [['OpenDesign', 'srcdoc wrapper, comment bridge (postMessage), anchor drift states, keep-alive iframe pool of 5.'], ['Onlook', 'Element evidence schema (tag, DOM path, outer HTML, redaction) and stale-selection marking. Its Electron webview and CDP are not used.']], lic: 'Apache-2.0' },
  { id: 'genui', name: 'Contextual GenUI', lang: 'TypeScript render, Rust validation', take: 'Cards stream in block by block with skeletons from partial data. A strict schema at the boundary, a tolerant renderer, content contracts that drop rows instead of inventing them, a plain table fallback.', from: [['Momo', 'Pattern only (no licence): permissive runtime props, per-block reveal, prop repair, content contracts. No Momo code.'], ['Library', '@openuidev/react-lang and lang-core (MIT), the same libraries Momo uses; zod generated from Rust schemas.'], ['OpenDesign', 'GenUI surfaces (confirmation, choice, form) answered in place; partial-JSON repair.']], lic: 'MIT, Apache-2.0' },
  { id: 'agent', name: 'Model and agent loop', lang: 'Rust', take: 'Three sources behind one interface: Hosted (Spekin credits), Local CLI (bring your own agent: Claude Code, Codex, OpenCode first, reached through the Spekin Connector on 127.0.0.1) and API provider (your key, any compatible base URL). The tool loop, SSE streaming, cancel and retry, estimate, reserve and settle stay in Rust.', from: [['OpenDesign', 'Same split as its model switcher: Local CLI (daemon detects agent CLIs) and API provider (BYOK, base URL, connection test). Its Node daemon is replaced by a small Rust connector.'], ['Paraframe', 'Runs through the user\'s local Claude Code; parallel jobs capped by machine load. Behaviour only.']], lic: 'own code' },
  { id: 'core', name: 'Rust core service', lang: 'Rust (Axum)', take: 'Stage status and readiness, revisions and proposals, saves and conflicts, schema validation, file versions with digests, the hand-off bundle, the usage ledger. TS types are generated from Rust schemas.', from: [['OpenDesign', 'File version manifest (sha256, parent, origin) and packages/contracts shapes, rebuilt in Rust.'], ['Onlook', 'Atomic writes and the append-only op log idea.']], lic: 'own code' },
];

// Taste: what each reference does that a Spekin user should feel. where = board that carries it; s35 = state of S35 today.
export const TASTE = [
  ['OpenDesign', 'Resizable chat column with a 4 px handle, width remembered', 'S35', 'added'],
  ['OpenDesign', 'Streamed text appears per character; stick to bottom; jump-to-latest button', 'S35', 'added'],
  ['OpenDesign', 'Run steps shown as a live feed while the agent works', 'S35', 'added'],
  ['OpenDesign', 'Absent data shows nothing, never a placeholder value', 'all', 'rule'],
  ['OpenDesign', 'Error card: one title, one paragraph, actions on the right', 'S37', 'board'],
  ['OpenDesign', 'One product ease cubic-bezier(0.23,1,0.32,1), 40 ms stagger, springs for popovers', 'all', 'rule'],
  ['OpenDesign', 'Design-system kit view: cover, palette, type, components', 'S30', 'board'],
  ['OpenDesign', 'Hand-off menu with framework choice; finalize DESIGN.md and mark it stale', 'S34', 'board'],
  ['Paraframe', 'Project name in the title opens a quick switcher; recent first', 'S35, S27', 'added'],
  ['Paraframe', 'Busy chip when frames are designing or waiting', 'S35, S29', 'added'],
  ['Paraframe', 'Board prompt bar that becomes "about these N frames" on selection', 'S29', 'board'],
  ['Paraframe', 'Takes stack: N of M, angle titles, filmstrip, keep with Enter, hold a key to see the baseline', 'S31', 'board'],
  ['Paraframe', 'Part popover that moves away from palettes; Send disabled while empty', 'S32', 'board'],
  ['Paraframe', 'One review card per frame; hover a row to isolate its pin; stale rows', 'S33', 'board'],
  ['Paraframe', 'Copy-for-agent toast and bundle', 'S34', 'board'],
  ['Onlook', 'Selection handles and rings keep their size at any zoom', 'S29', 'board'],
  ['Onlook', 'Off-screen selection marks and a Recenter button', 'S35, S29', 'added'],
  ['Onlook', 'Frame covers: designing, waiting, failed with Retry', 'S29', 'board'],
  ['Onlook', 'Usage meter: calm, warn at 70%, critical at 90%', 'S35, S36', 'added'],
  ['OpenDesign', 'Model source split: Local CLI (bring your own agent) and API provider (any base URL), beside Hosted', 'S36', 'board'],
  ['Onlook', 'Stepped question sheet with a recommended answer', 'S38', 'board'],
  ['Onlook', 'Refusal band for a file that cannot be used', 'S28', 'board'],
  ['Momo', 'Cards build block by block from a skeleton of the real shape', 'S38', 'board'],
  ['Momo', 'Thinking row with live token and time counters', 'S35', 'added'],
  ['Momo', 'Header swaps the whole workspace (Spekin: eight stages)', 'S35', 'drawn'],
  ['Momo', 'Every GenUI card state in one shell: loading, empty, error', 'S38', 'board'],
];

export const LICENCES = [
  ['OpenDesign', 'nexu-io/open-design @ e033aad', 'Apache-2.0', 'Reuse code with LICENSE, NOTICE and change notes. Bundled templates keep their own licences; brand-named design systems and JiduMono font: do not reuse.'],
  ['Onlook', 'onlook-dev/onlook (v2, Electron)', 'Apache-2.0', 'Pure TS maths and patterns only. Central Icons, Onlook marks, sounds and idea images are not covered: never copy.'],
  ['Momo', 'momo-next', 'none (all rights reserved)', 'Patterns only. Use the same MIT libraries directly (OpenUI react-lang, zod, xyflow, motion).'],
  ['mattpocock/skills', 'github.com/mattpocock/skills (pinned commit per import)', 'MIT', 'Skills may be bundled, adapted and served. Keep "Copyright (c) 2026 Matt Pocock" and the MIT text with every copy and export; rename skills that carry his name; his courses are not covered.'],
  ['Paraframe', 'proprietary desktop app (doc pack only)', 'proprietary', 'Behaviour only. Terms forbid reverse engineering; never copy labels, wording, URLs or assets.'],
];
