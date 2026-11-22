# Paraframe doc pack: research report for Spekin

Source: `docpack-UzwV9bPlAgA`. Doc abbreviations: VB = VIDEO-BREAKDOWN, INV = INVENTORY, PC = PARITY-CHECKLIST, AT = ACCEPTANCE-TESTS, TR = TRANSCRIPT, WV = WATCHVIDEO-REPORT, PR = research/PRODUCT-RESEARCH, CL = research/pages/changelog.extract. "L" means a line number in the doc. A bare "t0xxx" is a still ID, not a time.

Method caveats:
- No source code exists in the pack.
- Several large files came back as condensed summaries with line references, so quotes are from those summaries and slices. I read none of them in full.
- The independent review covered 19 stills only. Timings and motion were not measured (VB L3, L5, L108-110).
- The pack is a clean-room spec. Labels, wording and URL schemes must not be copied (INV L3, AT L54).

## 1. FEATURES (by Spekin screen)

**S35 Project shell**
- A macOS desktop window with a title bar showing only the board name. Clicking the name opens the board switcher (⌘O), per CL 0.4.12 "New title bar" and VB.
- The title bar shows "Paraframe is busy" while frames wait (CL 0.4.12, L724).
- The title bar also holds a Share menu with the board link and who can edit it (CL 0.5.0). Teammates' presence and cursors appear there too (CL 0.5.0).
- The avatar menu shows trial progress as a ring around the avatar (CL 0.5.1), frames left, and "Restart to update" (CL 0.5.0).
- The board switcher is searchable (⌘O) and finds frames by title (CL Unreleased). ⌘O has a hold-⌘ cycle behaviour, and ⌘1–9 shortcuts show while ⌘ is held (CL Unreleased, 0.5.0). Boards are ordered by last opened (CL 0.5.0). Rename is inline: Enter saves, Esc cancels (CL 0.4.13).
- "What's new" dialog on update, with an Earlier versions catch-up (CL 0.4.6, 0.4.8).

**S27 Projects home**
- Boards, personal and team, with a "Move to…" list that scrolls and keeps "New board…" pinned at the bottom (CL 0.5.0). A personal board can be moved into a team (CL 0.5.1).
- Restore offered when the open board is deleted elsewhere (CL 0.4.7). A board-link error appears if the board is deleted or access is missing (CL Unreleased).
- Board previews show stacks as cards with a frame count (CL 0.4.13).

**S28 Import reference**
- The empty board reads "Start from your real app" (WV L18-22; VB L15). It offers:
  - "Capture a page / Open browser →"
  - "Drop screenshots / Choose files →" ("From any app, even behind a login")
  - "Working in an editor? Connect over MCP"
- The in-app browser has an address bar, a width field of 1280, a placeholder "Go to a page to capture it", and the 0:38–0:50 demo URL (WV; VB L17-18).
- Capture has three controls: "Capture part", "Capture viewport" and "Capture page". An unreleased change merges them into one button with a menu (CL Unreleased).
- Hint text: "Hovering something? Leave the pointer on it and press the keys…" (WV L18-22, t0051). The status chip reads "{url} is on the board / Show" (VB L20).
- While capturing, "Capturing the page…" shows with muted controls and a placeholder frame (t0060, 0:59; INV FR-06–09).
- Other ways in:
  - ⌘V on the board pastes a screenshot as a frame (CL 0.5.0).
  - A capture keeps hover and focus styles (CL 0.5.0).
  - Part captures show immediately (CL 0.4.6).
  - A capture stops at once if the page closes. It used to wait 30 s (CL 0.4.12, L714).

**S29 Board canvas**
- Infinite canvas (TR 00:00:10–22; PR L36).
- Frame chrome (VB L56):
  - The title is often the source URL, sometimes with a suffix such as "pitch-ready".
  - Export (or "Open stack" on stacks, CL 0.5.2) and an overflow menu.
- Canvas interactions:
  - Option-drag duplicates (CL 0.4.7).
  - A clicked or dragged frame stays on top (CL 0.5.0).
  - Drag-box select (CL 0.5.0).
  - The View menu has zoom to fit, zoom to selection, zoom in/out and actual size (CL 0.5.2).
  - Arrow keys follow board rows (CL 0.5.0).
  - Hold Space for the hand cursor (CL 0.4.13).
  - Frames start at the size of their content (CL 0.5.0).
- Zoomed-out frames stay as rounded rectangles, not pills (CL 0.4.13).
- The prompt bar in the corner takes any ask, with chats stacked behind it that "deal out" on pointing (CL 0.5.0, 0.4.13 Labs).
- Placeholders are "Ask for anything on this board…" and "Ask about these N frames…" (VB L58). The empty-board prompt is "Starting from scratch? Describe a screen…" (VB L15).
- Typing "generate me a new auth modal" at 2:52–3:01 creates a frame with its chat open (VB L27; CL 0.5.0).
- Pasting more than 3 frames makes one chip, for example "12 frames", with a tooltip list (CL 0.4.13).
- Frame chat shows "Duplicated from… Carries over N messages" with Clear and Undo (CL 0.4.13; INV FR-26, 4:14 t0255 "6 messages").

**S30 Style review**
- Style panel "New style" at 1:51–2:11 (VB L25).
  - Options: Automatic, No style, Team styles (Flux was removed as a built-in, CL 0.5.1).
  - Toggle: "Keep learning from new captures", with the status "Up to date with 2 frames".
  - Tabs: Visual and Markdown.
  - Visual content: Inter 400–700, spacing 4–32, Heroicons "Outline, 1.5 stroke", radii 6/8/16 (WV L26).
- A picker shows colours, type, controls, spacing and corners at a glance (CL 0.5.1).
- The style is learned on drop and a Markdown guide is generated (TR 00:01:44–02:28).
- Designs wait for style learning to finish (CL 0.5.0).

**S31 Alternatives**
- Presets in frame chat: "Duplicate and improve this design", "5 takes on this screen", "Nitpick this design" (WV 1:20).
- Takes come from five angles such as hierarchy, each titled after its angle (CL 0.5.1).
- "5 takes on the pricing cards" is offered after almost every reply (CL 0.5.0). More than 10 is allowed in one stack (CL 0.4.13).
- Takes start as a copy of the screen, and a stack appears as soon as work starts (CL 0.5.0, 0.4.13).
- Unfinished takes are marked and cannot be added to the board (CL 0.4.13).
- The stack viewer (3:58 t0239) shows "3 of 5", size 1280×2015 at 44%, a filmstrip, "+ Add to board", "Hold O to see the original" and "↵ to add to the board" (WV L29; VB L29, L60).
- Single and Grid toggles sit before the size in the open stack's title bar (CL 0.5.0). Phone and tablet screens show whole in Grid (CL Unreleased).
- The frame in an open stack is live, not a picture (CL 0.5.0). Clicking beside the stack closes it (CL 0.4.13).
- Takes keep brand logo, colours and typefaces (CL 0.5.0).

**S32 Targeted edit**
- Select highlights a part (5:56). A popover at 6:11 asks "What should change about this element?" (INV FR-32).
  - Buttons: Send (muted when empty), Send to chat, See variations (− 3 +), Clip.
  - The box sits below, left or above the part when there is no room on the right. It stays clear of the window bar, the tool and zoom palettes and the prompt bar (CL Unreleased, L287).
- At 6:26 the edit applies in place: "Change or ask about this", "Hold to see original", Undo, Done (↵) (WV L33; INV FR-35/36). It changed $27900 to "$279.00" and also the order amount (WV L56). Related values may change, so do not claim isolation (INV L80).
- A pin spins on the part while the designer works, and select no longer opens the chat (CL 0.5.1).
- Clip keeps only its area and does not grow (CL 0.4.6, Unreleased).

**S33 Nitpick review and S08 accept**
- Nitpick pins are black circular numbered markers (8:06, t0487; job text "pin 5 to 10 nitpicks").
- One review card per frame, a row per change named after its element (CL 0.5.2). Pointing at a row shows only its pin.
- The footer reads "Review 7 changes · 1 to look at" with Hold to see original and Done (8:35).
- The stale warning is "Shown as the part was before it changed." with Dismiss and Apply (9:05–9:09, t0546–t0550). Dismissal removes the row and the footer suffix.
  - Stale Apply and whole-review Undo are unproven (PC P11, RG-01).
- Element variations review shows "Variation 1 of 2" with Hold to see original, Dismiss and Apply (7:14, t0435). It is distinct from take stacks and from Undo/Done (PC P09b).
- The designer offers "Add the search bar to the other frames" when a change touches shared parts (CL 0.5.0).

**S34 Hand-off**
- Export on frame chrome (10:16).
- A toast at 10:19 reads "Copied for a coding agent / Paste it into Claude Code, Codex or any coding agent, with what you want done."
- The pasted bundle (10:05–10:11) holds per-frame id, title and size, HTML and screenshot signed links, a separate guide, `get_frame_guide` and a "links work for a week" note (INV FR-44/45; AT-09).
  - Expiry is wording only, not verified (PC P12, RG-04).
- Labs "Copy frames as a link" gives one link instead of a long prompt (CL 0.5.0).
- Coding agents get a guide and leave new screens to the designer (CL 0.5.0).

**S36 Model and usage**
- A model picker in the prompt bar lists Fable, Opus (Default, checked) and Sonnet (3:01 t0182; CL 0.5.1). It is also in Settings → Connections (CL 0.5.0).
- Fable needs Claude Code ≥ 2.1.170 (CL 0.5.0).
- The only usage surface is the trial ring and the Pro welcome screen "You're on Pro" (CL 0.5.1). There is no usage ledger in the pack.
- Billing: Pro is monthly per seat via Stripe, with a 14-day refund window (AT-11).

**S37 Build contracts and release**
- Not present. The closest items are MCP/agent hand-off and the "bin of parts" and flowchart workflow idea (TR 00:11:17–11:31).

**S38 Contextual GenUI**
- Chat cards are frame-scoped: the review card, a "5 takes on…" button naming the part, and "Add X to other frames".
- Error and Retry cards (see Taste).

**Tablet and phone**
- Frames can be phone, tablet, slide or social-image sized (CL 0.5.0). The app itself is desktop-only, and only an arm64 macOS build was seen (PR; PC P18).

## 2. TASTE

Doc caveat: no durations, easing or tokens are claimed (VB L108-110; WV L45-48).

- **Held-key peek.** "Hold O to see the original" appears in the stack viewer (3:58–4:01), on in-place edits (6:26) and on nitpicks (8:35). The overlay shows a labelled "Original" at a different size and zoom (1280×1562 at 57%), then returns to the take (t0239/t0241/t0242). Do not infer fixed zoom (RG-03).
- **Keyboard everywhere.** "↵ to add to the board" and Done (↵). ⌘↵ steers a running job (CL 0.4.9). ⌘O switches boards with hold-and-cycle. ⌘V pastes a screenshot into a frame. ⌘C copies the selected frame. ⌥-drag duplicates.
- **Contextual popover placement.** The select box avoids the part, the palettes and the prompt bar (CL Unreleased).
- **Pin affordances.** Spinning pin while working (CL 0.5.1). Hover a review row to isolate its pin (CL 0.5.2). Pill-shaped elements get pill-shaped outlines with no gap at the top (CL 0.4.13).
- **Review in one place.** One grouped card, not one card per pin (CL 0.5.2). Counts in the footer ("7 changes · 1 to look at") (VB L38).
- **Busy and queue states.**
  - Job chips: "Learning style", "Thinking…", "Waiting to start" (VB L74; WV 2:45, 3:01).
  - "Paraframe is designing too many frames right now…" shows when over capacity (3:01).
  - The title bar says "Paraframe is busy" (CL 0.4.12).
  - Concurrency is capped by memory and CPU, so the computer stays responsive (CL 0.4.6, 0.4.12).
  - "Three more to finish" (TR 00:08:22).
- **Error and empty states.**
  - "Claude Opus couldn't use Paraframe's tools" with Try again (CL 0.5.0, L565).
  - "Stopped when Paraframe quit" with Try again (CL 0.5.0, L581).
  - Capture fails fast when the page closes (CL L714).
  - Muted controls while capturing, and Send muted on empty input (VB L77).
  - Not seen: validation, auth, offline, payment (VB L78).
- **Density and stability.**
  - No flicker on board switch ("comes in once, already sharp") (CL 0.4.13).
  - Zoom and scroll never stutter while pictures load or while many frames design (CL 0.5.0, Unreleased).
  - Zooming while dragging keeps the frame under the pointer (CL 0.4.11).
  - Big boards use less memory (CL 0.5.0).
  - The designer zooms in to check small type and edges after a change (CL 0.4.12).
- **Copy tone.** Short, plain sentences, and a before/after image pair on each changelog entry (CL meta, L7).
- **Style surface.** A visual summary next to an editable Markdown tab. The Markdown tab also serves as a paste surface (10:00, VB L41).

Not measured or not shown: motion timings, exact typography/colour of Paraframe's own UI, dark mode (WV L45-48; VB L108-110).

## 3. ENGINE

Sources: PR L24 (a third-party podcast interview, informal), Terms §1/§5, Privacy "The AI designer".

- **Agent/model orchestration.**
  - The designer runs through Claude Code on the user's own machine, under the user's Anthropic account (Privacy, Terms §5; INV FR-48; AT-26).
  - The founder says "Anthropic's Agent SDK" (PR L24). This is an interview statement only.
  - Variants and nitpicks "spawn individual threads" in parallel (TR 00:08:03–06).
  - The concurrency cap depends on memory and CPU, and waiting frames are queued (CL 0.4.12).
  - ⌘↵ steers the running turn at its next step (CL 0.4.9).
  - Optional cloud generation sits under Labs, with one cloud sandbox per variation (CL 0.5.0; INV FR-49).
- **Agent protocol.** MCP exists for local and cloud agents. They can duplicate, delete, restore, retry, reply to notes, capture pages, fill forms and click in the browser (CL 0.4.8, 0.4.11, 0.5.0). The tool `get_frame_guide` is named in the export text (INV FR-47). Transport is UNKNOWN (PR L60: `/mcp` accepts POST only).
- **Rendering and preview.** Frames are live HTML. Captured pages keep hover and focus styles (CL 0.5.0), and 3D scenes are captured. Frames get a picture taken by the app, retaken after sleep (CL 0.5.0). Frame HTML is stored and exposed to agents (export bundle). The renderer and engine are UNKNOWN.
- **Canvas engine and state store.** UNKNOWN. The founder says "Electron and pure JavaScript" (PR L24).
- **Persistence and sync.** Boards sync through a Laravel sync engine, with frames on Cloudflare R2 (PR L24, informal). Sync retries after storage errors (CL 0.5.0). DigitalOcean, Cloudflare, Stripe, Postmark and GitHub are the processors (Privacy). Deleted accounts go at once, files and backups within 30 days (Privacy).
- **Validation.** UNKNOWN.
- **Languages and packages.** Electron, JavaScript, Laravel, Livewire and Flux UI are named (PR L15, L24, L59; CL footer). Their licences are not stated in the pack.

## 4. MAPPING

Every Paraframe item is pattern-only. Nothing can be copied: the Terms ban scraping, reverse engineering and building a competing product (PR L71), and the pack has no code.

| Spekin screen | Applies | Spekin action |
|---|---|---|
| S35 shell | Name-only title bar opening a ⌘O switcher; busy chip; Share menu; presence | Adapt. |
| S27 home | Switcher ordered by last opened; inline rename; Restore on delete; Move to… | Adapt. |
| S28 import | Empty-state cards; capture (part, viewport, page); drop; paste; MCP line; width field | Adapt. A Chrome-style capture needs a browser engine, which is not decided. |
| S29 canvas | Infinite canvas; prompt bar with stacked chats; View zoom menu; frame chrome | Adapt. Engine UNKNOWN, so choose independently (for example a TS/React canvas with a Rust core). |
| S30 style | Auto-learned style; Visual + Markdown; keep learning toggle | Adapt. Define our own token format. |
| S31 alternatives | N of M; filmstrip; hold-to-original; Grid/Single; "Add to board"; takes from angles | Adapt. |
| S32 targeted edit | Select box; popover; pins; Undo/Done; Clip | Adapt. Related-value changes need a diff, not isolation. |
| S33 + S08 review/accept | Pin card; Dismiss/Apply; Variation N of M | Adapt. Stale Apply and group Undo are unproven, so design our own rules. |
| S34 hand-off | Toast; bundle with HTML, screenshot, guide; coding-agent paste | Adapt (our own payload and URLs). Validate and expire links server-side, since expiry is unverified here. |
| S36 model/usage | Prompt-bar picker; Settings → Connections; trial ring | Adapt. Hosted, BYOK and deferred-local fit better than a single mandatory Claude Code. A usage ledger is absent from the pack, so Spekin designs it. |
| S37 contracts | Not covered | Skip. |
| S38 GenUI | Frame-scoped cards: take offer, review, "other frames" | Adapt. |
| Tablet/phone | Phone/tablet frame sizes only | Adapt. The app itself is desktop-only, so no reference exists. |

Conflicts with the Rust-core, no-Python rule:
- Electron, Node and pure JavaScript are the stated runtime (PR L24). Do not copy that as architecture.
- Laravel and Livewire are PHP (PR L15, L59).
- The Claude Code or Agent SDK dependency is Node-based. Treat it as a "deferred local agent" adapter behind a Rust-defined interface. The user's account must be signed in (AT-26).
- Python is not mentioned anywhere.

## 5. LICENCE

- There is no repo licence and no code. The pack is a text doc pack.
- The Paraframe product is proprietary. Terms §7 reserves its software, design and name to Wireable LLC. Terms §6 bans scraping, reverse engineering and building a competing product. The legal name conflicts with the changelog footer "Paraframe, Inc." (PR L85).
- Third-party units named without licence text: Flux UI, Livewire, Laravel (Electron by interview), Stripe, DigitalOcean, Cloudflare, Postmark, GitHub (PR L15, L24, L59, L66).
- Not verified: the pack's own licence or reuse terms. Check the doc pack's SOURCES.md and README.md before redistributing any of its text.

## Unknowns that block exact parity

- Which capture control is first, and what the three capture modes actually output (RG-06; PC P03).
- Stale Apply and whole-review Undo.
- "10 alternatives" (homepage) versus "5 takes" (in-app) (PR L84).
- Live MCP and the transport.
- The Hold O key press is not visible on screen (VB L29, L115).
- Errors, sharing, comments and permissions are not shown in the video.
- The unreleased items (merged capture button, dev-server launcher) may not match the filmed build.