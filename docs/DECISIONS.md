# Decision log (owner)

One line per decision, newest first. The owner decides product questions. Agents record what was decided here and never decide it themselves. Open questions are listed at the end with a recommendation.

| Date | Decision | Where it shows |
|---|---|---|
| 23 Nov 2026 | Repository licence: Apache-2.0. Many agents build in parallel (Antigravity with Gemini Neon 4, OpenCode with DeepSeek V4.1 Flash). | ADR 0006, README |
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
| Make the repository public? This would publish the PRD (`inputs/`), the research notes (`docs/research/`) and the canvas. | Review `inputs/` and `docs/research/` first. Keep the repo private until the owner says yes. |
| Payment method for paid plans (PRD T-404). | Midtrans QRIS. This is a recommendation only, not decided. |
| Pre-built skills library for the MCP SaaS (owner request, 23 Nov). | See docs/research/skills-library.md. |
