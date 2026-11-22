# Contributing to Spekin

Spekin is built by people and AI coding agents together. The rules below exist because an earlier app (Clausarium) went from canvas to code badly: controls were drawn but never built, click paths were guessed, and "done" was claimed without proof. Every rule here prevents one of those failures.

## Before you start

1. Read [AGENTS.md](AGENTS.md), then [docs/handoff/implementation.md](docs/handoff/implementation.md).
2. Pick **one task card** (`IMP-nn`) that is `open` and in your lane. Write your name or agent name in your lane file (`docs/handoff/lanes/<lane>.md`) before you touch code.
3. Work on a branch: `imp-nn-short-name`. Keep your own git worktree if another agent shares the machine:
   `git worktree add ../Spekin-imp-nn -b imp-nn-short-name origin/main`.
4. Only edit the files your lane owns (the ownership table is in the implementation handoff). If you need a change in a file you don't own, write it under "Requests to lead" in your lane file and keep going with something else.

## While you build

- **Test first.** Write a test that fails on main, then make it pass. The commit message names the test.
- **Build the same as drawn.** Open the board (`npm run canvas:serve`), then copy its markup, classes, labels, order and `data-feature` ids. Don't redesign, rename or "improve" anything. If the board looks wrong, write it in your lane file and ask. Don't change the board yourself.
- **Every control is real or marked later.** Use `Btn` and `IconBtn` from `apps/web/src/ui/Button.tsx`. A control either does what its `data-does` says, or it is disabled with `later`, matching the board. Never show a "not built yet" message.
- **Use the sample data.** Screens read data through `apps/web/src/data/`. Don't write numbers or names into a component.
- **Tokens only.** Colours, fonts and spacing come from `@spekin/design` CSS variables and classes. No raw hex.
- **No Python.** Not as a dependency, not as a helper script.
- **No secrets and no real client data.** Fixtures are fictional.

## Before you open a pull request

```sh
npm run gate                       # rules, sync, board lint, types, tests, build, Rust fmt/clippy/test, contracts
npm run dev &                      # or npm run build && npm run preview
npm run harness -- S35             # the state gate for YOUR board (replace S35)
```

Then **look at** the three PNGs for each of your states in `tools/harness/out/` (`-board`, `-app`, `-diff`). A passing number you haven't looked at doesn't count.

Also check, and say in the PR that you did: 1024 px wide, 390 px wide, keyboard only (Tab, Enter, Escape), reduced motion, a long name in each text field, and both languages (EN and ID).

## Pull requests

- One board (or one core module) per pull request. Name the files you changed.
- Fill in the template. Say what you did not check.
- Status words, exactly: `done`, `done, part open`, `done, part blocked`, `open`, `blocked`. Don't say "done" when something is open.
- Commit messages: `feat(S35): stage header switches in place`, `fix(core): ...`, `docs: ...`, `test(harness): ...`.

## Licence of contributions

By contributing you agree your work is licensed under Apache-2.0 (LICENSE, section 5). Don't paste code from projects whose licence doesn't allow it. See [docs/adr/0004-reference-licences.md](docs/adr/0004-reference-licences.md).
