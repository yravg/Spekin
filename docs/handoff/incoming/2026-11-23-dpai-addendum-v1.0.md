Source: external review agent, supplied by the owner (DPAI supplement, Claude addendum v1.0)
Received: 2026-11-23
Status: triaged
Affects: S35 and S29 (context chips, modes), S29 and S31 (logical artifact vs preview), S34 (handoff manifest); later ui cards for those boards; no board redraw needed now

# DesainPakeAI addendum v1.0: triage

The original text is in [2026-11-23-dpai-addendum-v1.0-SOURCE.md](2026-11-23-dpai-addendum-v1.0-SOURCE.md). Reading order (owner): original v0.2.3 → review supplement v1.0 → this addendum.

The illustrated review and the evidence bundle stay in the owner's Drive. They hold screenshots of a third-party product, so they are not in git (ADR 0004).

**What it is:** a read-only refresh of DesainPakeAI, a reference product. It is not a Spekin feature and proves nothing about Spekin. Its counts (1 or 17 pages, 50 tokens, 12 components) describe that product, not Spekin targets.

## Decisions

| Point | Verdict | Where it lands |
|---|---|---|
| 1. Selection adds a removable context chip. Removing it changes context, not content. Select, pin or navigate never sends, accepts or spends. The request carries only the listed context. | **accepted, already drawn** (S35 F106, S29) | Check added to the S29 card: a payload test proves the request contains only the listed items, never hidden or whole-board data (R-CAN-4). |
| 2. Keep logical artifacts (frames, pages) apart from previews, takes and viewport widths. Don't add a new page model or fixed limits. A preview width isn't a breakpoint. | **accepted** | S29 and S31 cards: count logical frames and their takes separately. Viewport switches change the preview only. |
| 3. Safe handoff: only accepted, immutable revisions, with an exact manifest (revisions, exclusions, hashes, required inputs). A missing PRD shows as missing. No public all-page link by default; share links stay later (R-WS-3). | **accepted, already drawn** (S34; Share is LATER on S35 and S40) | S34 card: the manifest lists missing inputs explicitly, a second export reads back byte-identical, and no link is created. |
| 4. Visible active mode, and Escape and keyboard never trap tab or sidebar navigation. Don't add comment or agent-send just to fill an empty panel. Empty review isn't acceptance. | **accepted** | S29 and S32 cards: keyboard check that Escape leaves select and targeted-edit modes and focus can reach the tabs. |
| Not authorised by the addendum: new libraries, engines, exports, links, paid runs, repo changes | noted | Nothing here changes the plan. CLI, MCP and publish stay later. |
