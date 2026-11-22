# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-03 | `imp-03-api-source` (PR #1) | open (in PR #1) | – | – |
| IMP-04 | `imp-04-proposals` (PR #2) | open (in PR #2) | – | – |
| IMP-12 | `imp-12-licences` | done | `node --test tools/checks/licences.test.mjs` (10/10 pass); `node tools/checks/licences.mjs --check` (`licences ok (170 npm packages, 62 crates, 0 Python)`); `npm run gate` passes (rules, sync, canvas:lint, typecheck, 2 vitest, build, 8 Rust tests, contracts current) | Not wired into root `package.json` `npm run gate` (lead-owned); Windows/Linux paths not tested (macOS only) |
| IMP-11 | – | open | – | – |
| IMP-10 | – | open | – | – |
| IMP-22 | – | open | – | – |

## Requests to lead

- 2026-11-23 (IMP-12): Please add `node tools/checks/licences.mjs --check` and `node --test tools/checks/licences.test.mjs` to `npm run gate` in root `package.json` (lead-owned).

## Proposed glossary terms

## Log

- 2026-11-23 · IMP-12 · Added `tools/checks/licences.mjs`, `tools/checks/licences.test.mjs`, `tools/checks/licence-allowlist.json`, and generated `docs/licences.md`; fixed false positive on `rules.mjs` `'R1 no-python'` text; `npm run gate` passes.
