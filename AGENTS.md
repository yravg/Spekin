# Spekin: start here (every agent)

Spekin takes an idea through eight stages to working software, using one living spec. The license is Apache-2.0. The repo is private until the owner decides otherwise (docs/DECISIONS.md).

## Where the work stands

- **Canvas:** done. 13 boards, 74 states, 195 features (`docs/design/spekin-canvas`).
- **Build:** P0 baseline is done. P1 (S35 shell, S27 home) and P2 (Rust seam) are starting. Two agents work in parallel lanes.
- **Read first:** [docs/handoff/implementation.md](docs/handoff/implementation.md). It has the continue prompts, the file ownership, the canvas-to-app contract and the task cards.
- Then read [docs/GLOSSARY.md](docs/GLOSSARY.md), the [ADRs](docs/adr/README.md), [docs/DECISIONS.md](docs/DECISIONS.md) and your lane file in `docs/handoff/lanes/`.
- The canvas history and how to restore reference images are in [docs/handoff/spekin-canvas.md](docs/handoff/spekin-canvas.md). Work handed in from other agents or studies goes to [docs/handoff/incoming/](docs/handoff/incoming/README.md).

## Run and check

```sh
npm ci                     # Node 22+, Rust stable. No Python.
npm run dev                # app  http://127.0.0.1:5173   (SPK_WEB_PORT to change)
npm run server             # API  http://127.0.0.1:8787
npm run canvas:serve       # boards http://127.0.0.1:5180
npm run gate               # rules, design/fixture sync, board lint, types, tests, build, Rust fmt/clippy/test, contracts
npm run harness -- S35     # state gate for one board (app must be running; npx playwright install chromium once)
npm run canvas:build       # lead only: rebuild boards from the generators (SPK_OUT / SPK_ONLY as before)
npm run canvas:states      # lead only: rewrite canvas-states.json after a board change
npm run sync:design && npm run sync:fixtures   # lead only: copy the canvas CSS, icons and sample into the app and fixtures
```

## House rules

1. **Own your files.** Edit only what your lane owns (table in the implementation handoff). Ask the lead for anything else.
2. **Build the same as drawn.** Copy the board's markup, classes, text, order and ids. Don't paste board HTML, don't redesign, and never edit a board to fit your code.
3. **Every control is built or later.** No "not built yet" anywhere. Never remove a working control.
4. **Done = gate + harness + you looked at the PNGs.** Use only these status words: `done`, `done, part open`, `done, part blocked`, `open`, `blocked`. Always list what you did not check.
5. **Test first. One board or one module per pull request.** Never push to main, and never merge your own pull request.
6. **Rust core, TS UI, no Python.** Business rules live in `crates/spekin-core`. The Rust types are the source of the TS contracts.
7. **References:** reuse OpenDesign and Onlook (Apache-2.0) only with a NOTICE entry. Momo: patterns only. Paraframe: behaviour only. Matt Pocock's skills (MIT) are a proposal only: see docs/research/skills-library.md.
8. **No secrets and no real client data.** Fixtures use the fictional Meranti Yard only. No deployment, purchase or outside message without the owner.
9. **The repo is the memory.** Before you stop, update your lane file (status, evidence, next step, not checked) and push your branch.
10. **Owner's Mac only:** a hook may summarise long reads. Never write back text you read through it. Edit with exact-match patches or node scripts.
11. **End every session with a link** the owner can open: the pull request, the artifact or a Tailscale URL.
