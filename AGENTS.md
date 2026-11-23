# Spekin: start here (every agent)

Spekin takes an idea through eight stages to working software, using one living spec. Apache-2.0, public repository (owner, 23 Nov 2026). Everything you commit is public: no secrets, no client data, no private paths.

## Where the work stands

- **Canvas:** done. 14 boards, 81 states, 212 features (`docs/design/spekin-canvas`). S40 Skills library was added 23 Nov; the S35 offline state (F378) brought the count to 81.
- **PRD:** canonical v0.2.3 (`inputs/Spekin-PRD-v0.2.3.md`). The latest review is triaged in `docs/handoff/incoming/2026-11-23-review-supplement-v1.0.md`.
- **Build (verified 23 Nov):** every screen on the canvas is built and matches its board: 14 boards, **81/81 states pass the state gate**, with tablet and phone (T01) compared as device frames (`npm run harness`, exit 0, `tools/harness/out/report.md`). `npm run gate` also exits 0 (vitest 21 files / 142 tests; Rust 153 core tests plus workspace suites). The core (Rust) has 307 tests: proposals, ledger, GenUI validation and fuzzing, skills, handoff manifest, contracts and evidence, audit and restore, and a hardened API. **All of it is merged into main (final docs merge #47 at `0aba2c5`):** #22, #37 and #38–#45, as merge commits; #1–#36 show as merged through them. #43 needed one fix: a conflict in the generated `docs/licences.md`, regenerated with `node tools/checks/licences.mjs`, and the gate passed. No pull request and no worker card is open.
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
5. **Test first. One board or one module per pull request.** Workers never push to main and never merge. **Owner rule (23 Nov 2026):** the lead commits, says what it will merge, and merges to main by itself if the owner has not replied within 1 minute. Use merge commits, not squash, for stacked pull requests.
6. **Rust core, TS UI, no Python.** Business rules live in `crates/spekin-core`. The Rust types are the source of the TS contracts.
7. **References:** reuse OpenDesign and Onlook (Apache-2.0) only with a NOTICE entry. Momo: patterns only. Paraframe: behaviour only. Skills from mattpocock/skills (MIT) keep their notice and pinned commit (ADR 0007).
8. **No secrets and no real client data.** Fixtures use the fictional Meranti Yard only. No deployment, purchase or outside message without the owner.
9. **The repo is the memory.** Before you stop, update your lane file (status, evidence, next step, not checked) and push your branch.
10. **Owner's Mac only:** a hook may summarise long reads. Never write back text you read through it. Edit with exact-match patches or node scripts.
11. **End every session with a link** the owner can open: the pull request, the artifact or a Tailscale URL.

### Mistakes we already made (24 Nov 2026). Do not repeat them

12. **Workers never push to main, not even a docs fix.** Commit `a556960` went straight to main from a worker session. Push your branch and open a pull request. Only the lead merges.
13. **Green means GitHub CI green, not only your local gate.** Before you say "done", run `gh pr checks <n>` and read every job. "Unstable", "failure" or "cancelled" is not green: open the failed log (`gh run view <id> --log-failed`), say which job failed and why, and fix it or list it as open. Main was red from #45 to #47 because only the local gate was checked.
14. **The local harness and CI must test the same build.** The harness drives the dev server (`npm run dev`). A state that needs a dev-only switch (S35 offline uses `?sim=offline`) can never pass on `vite preview`. If you add a dev-only path, say so in the harness path note and check that CI still reaches it.
15. **Fresh checkout or new branch: run `npm ci` before `npm run gate`.** An old `node_modules` without a newly declared dev dependency (`jsdom`) makes vitest fail with `ERR_MODULE_NOT_FOUND`. That is your setup, not a code failure.
16. **Don't edit another session's files while it is working.** Before you edit a shared doc (AGENTS.md, implementation.md, lane files) in the main checkout, run `git status`. If it shows changes you didn't make, stop and ask the lead. Work in your own worktree (`../Spekin-core`, `../Spekin-ui`).
