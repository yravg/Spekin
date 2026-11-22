# Spekin

Spekin turns an idea into working software through one living spec. A project moves through eight stages:

Planning → Specification → Design → Frontend → Backend → Integration → Testing → Deployment

Every change to the spec, the screens or the contracts is a reviewed **proposal**. Nothing changes without one.

Spekin is open source under the [Apache License 2.0](LICENSE). We build it in the open with several AI coding agents and people working side by side. This repo has the rules and handoffs that keep that work consistent.

> **Status: pre-alpha (P0 baseline).** The design canvas is complete: 13 screen boards, 74 states and 195 features. The app has a working skeleton, the S35 header, and a Rust core with API types shared with the UI. The screens are being built now, one board at a time. See [docs/ROADMAP.md](docs/ROADMAP.md).

## How we build: canvas first, then the same in code

1. **Every screen is drawn first** as a board on the design canvas (`docs/design/spekin-canvas/`). Each board has up to 6 states, and each state has an entry click path and a data source. Every control says what it does (`data-does`) or is marked for later (`data-later`).
2. **The app reuses the canvas's own CSS and sample data** (`packages/design`, `packages/sample`), so it can match the boards exactly.
3. **The state gate proves it.** `npm run harness` opens each board state and the running app side by side. It reaches the app state by real clicks, then compares text and pixels. A state is done only when it passes. A drawn placeholder counts as a fail.

Read [docs/handoff/implementation.md](docs/handoff/implementation.md) before writing code.

## Quick start

Needs Node 22 or later, npm, and Rust stable (rustfmt, clippy). No Python.

```sh
npm ci
npm run dev                  # app on http://127.0.0.1:5173 (goes to the sample project, Meranti Yard)
npm run server               # optional: Rust API on http://127.0.0.1:8787 (/api/health, /api/projects/meranti-yard/stages)
npm run canvas:serve         # the design boards on http://127.0.0.1:5180
npm run gate                 # every check CI runs, except the state gate
npx playwright install chromium && npm run harness   # state gate (needs the app running)
```

## Repo map

| Path | What it is |
|---|---|
| `apps/web` | Browser app: React, TypeScript and Vite |
| `crates/spekin-core` | Rust domain core: pure logic, no IO |
| `crates/spekin-server` | Rust HTTP API (Axum) |
| `packages/contracts` | TypeScript types generated from the Rust types (ts-rs) |
| `packages/design` | The canvas stylesheet and icons, copied by `npm run sync:design` |
| `packages/sample` | The fictional sample project used by the boards, the app and the tests |
| `fixtures/` | JSON export of the sample, for the Rust side |
| `docs/design/spekin-canvas` | The design canvas: board generators, boards, the feature map |
| `docs/handoff` | Where work stands and how to continue it |
| `docs/adr`, `docs/DECISIONS.md` | Architecture decisions and the owner's decision log |
| `docs/GLOSSARY.md` | Every term we use, defined once |
| `tools/` | Board lint, state gate, house-rule checks and sync scripts |
| `inputs/` | The PRD (v0.2.2) and the annotated wireframe brief |

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). In short: pick a task card, work on a branch, write the failing test first, build the board exactly as drawn, run `npm run gate` and the state gate for your board, and open one pull request per board.

Security issues: see [SECURITY.md](SECURITY.md). Please don't open a public issue.

## Licence and credits

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE). Spekin studied OpenDesign and Onlook (both Apache-2.0) and the behaviour of other tools. It copies no code, text or assets from products whose licences don't allow it ([ADR 0004](docs/adr/0004-reference-licences.md)).
