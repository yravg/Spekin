# Decision log (owner)

One line per decision, newest first. The owner decides product questions. Agents record what was decided here and never decide it themselves. Open questions are listed at the end with a recommendation.

| Date | Decision | Where it shows |
|---|---|---|
| 28 Nov 2026 | D-RESP-1: S30, S32 and S34 get a 1024 layout (owner: "go ahead with all your recommendations"). Built as 1024 band rules in the app, proved by `npm run e2e:reach`; the drawn 1024 board states follow in IMP-71, because board CSS cannot express a viewport band yet. | IMP-70, app.css |
| 28 Nov 2026 | D-PLAN-1: S04 add-feature draws a Planning artifacts row (Decision log, Pitch, Tickets) and the S05/S06 artifact tabs switch `?artifact=` (owner: "go ahead with all your recommendations"). | S04 F540 |
| 23 Nov 2026 | PRD files carry no personal names or Drive links: in inputs/Spekin-PRD-v0.2.2.md, v0.2.3.md and the supplement's PRD snapshot, the owner's name is now 'the owner' and Drive IDs and URLs are now 'owner's Drive'. The supplement's SHA-256 values describe the unredacted files. Earlier commits still hold the old text (git history). | Owner, 23 Nov |
| 23 Nov 2026 | S27 create is four domain choices plus one idea box, with no name or language step; Bahasa is the default (owner yes to REV-03). | S27, C-01 |
| 23 Nov 2026 | Repository made **public** (owner: "Yes, go public"). The PRD (`inputs/`), research notes and canvas are public with it. | README |
| 23 Nov 2026 | **Skills library:** free for everyone, templates from day one, easy user copies, skills from GitHub repos with Auto-update (bounded, visible, roll back). | ADR 0007, S40 |
| 23 Nov 2026 | Review supplement v1.0 accepted as input. Two of its points are superseded by owner decisions: S36 Local CLI was the owner's own request (22 Nov comment), and the 30-day restore window was accepted by the owner on 22 Nov. Canonical PRD is now v0.2.3 (`inputs/Spekin-PRD-v0.2.3.md`). | docs/handoff/incoming/2026-11-23-review-supplement-v1.0.md |
| 23 Nov 2026 | Repository licence: Apache-2.0. Many agents build in parallel (Antigravity with Gemini Neon 4, OpenCode with DeepSeek V4.1 Flash). | ADR 0006, README |
| 23 Nov 2026 | Persistence: Postgres via sqlx behind a Store trait, memory store by default (ADR 0008) | owner approved lead recommendation |
| 23 Nov 2026 | Drive links outside the PRD may stay where they are needed: only the owner can open them | owner |
| 22 Nov 2026 | Upload limits for references: 10 MB per file, 30 images per batch, kept 30 days. | S28 |
| 22 Nov 2026 | Restore window for deleted projects: 30 days. | S27 restore state |
| 22 Nov 2026 | T01 tablet in portrait, phone with tabs at the bottom. | T01 |
| 22 Nov 2026 | Model sources: Hosted, Local CLI (bring your own agent) and API provider (bring your own key), as in OpenDesign. | ADR 0005, S36 |
| 22 Nov 2026 | OpenDesign is the primary reference, then Paraframe (behaviour), Onlook (canvas engine) and Momo (patterns). Hub Studio is not the baseline. | ADR 0004, R00 |
| 22 Nov 2026 | Rust core, TypeScript UI, no Python dependency. | ADR 0002 |
| 22 Nov 2026 | Canvas before build. Every feature is drawn as its own board, plus a feature map (F00). | ADR 0003 |

## Open (owner to decide)

| Question | Recommendation |
|---|---|
| Payment method for paid plans (PRD T-404). | Midtrans QRIS. This is a recommendation only, not decided. |
| When to build the MCP server that serves skills to the user's own agent. | After P5, with its own ADR (auth, tokens, connector). |
| Which other skill sets join the library (each needs a licence check). | Start with mattpocock/skills (MIT) and Spekin templates; add others one repo at a time. |
