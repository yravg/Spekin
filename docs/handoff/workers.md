# Running the build workers

The owner runs two AI workers overnight. Each works in its own git worktree, on its own branch, one card per pull request. **Only the owner merges.** The lead (Claude Code) reviews each pull request and leaves a review comment, but a safety check stops the lead from merging.

| Lane | Tool | Model | Worktree |
|---|---|---|---|
| ui | Antigravity CLI (`agy`) | `gemini-4-neon-medium` | `../Spekin-ui` |
| core | OpenCode CLI (`opencode`) | `opencode/deepseek-v4.1-flash-free` (OpenCode Go isn't signed in on this Mac, so the free DeepSeek V4.1 Flash is used) | `../Spekin-core` |

## Set up a worktree (once per lane)

```sh
git fetch
git worktree add ../Spekin-ui -b imp-01-shell-work-area origin/main && (cd ../Spekin-ui && npm ci)
git worktree add ../Spekin-core -b imp-03-api-source origin/main && (cd ../Spekin-core && npm ci)
```

## Launch

The prompts are in `tools/workers/`. Replace `<repo>` with this repo's path and `<parent>` with its parent folder.

```sh
# ui: Antigravity headless denies shell commands unless allow-listed. tools/workers/agy-settings.json allows
# npm, node, cargo, git, gh and read-only tools, and denies pushing to main, force-push, merging PRs, rm and sudo.
# --add-dir <repo>/.git lets git work inside the worktree.
cd ../Spekin-ui && agy -p "$(cat <repo>/tools/workers/prompt-ui-IMP-01.txt)" --model gemini-4-neon-medium \
  --settings <repo>/tools/workers/agy-settings.json --add-dir <repo>/.git --print-timeout 0s > ../worker-ui.log 2>&1 &

# core: OpenCode uses its normal permission settings.
cd ../Spekin-core && opencode run -m opencode/deepseek-v4.1-flash-free --title "Spekin core" \
  "$(cat <repo>/tools/workers/prompt-core-batch2.txt)" > ../worker-core.log 2>&1 &
```

We don't use `--dangerously-skip-permissions` (Antigravity) or `--auto` (OpenCode): the scoped allow-list is the safer choice.

## Merge order for the open pull requests (owner)

**Simplest: merge [#22](https://github.com/yravg/Spekin/pull/22) only, with "Create a merge commit".** It already merges #1 to #21 in the order below, with the conflicts resolved. On that branch the gate passes (207 Rust tests, 48 web tests) and 33 of 33 board states pass. GitHub then shows #1 to #21 as merged; close any it does not. Pull requests opened after #22 are stacked on top of it: core #23 (IMP-31) → #24 (IMP-32) → IMP-33, and the ui ones from IMP-13 onwards. Merge them in that order, after #22.

The order used inside #22, if you would rather merge them one by one:

Use **"Create a merge commit"**, not squash, for stacked pull requests. A squash gives the lower branch's commits new ids, so the PR stacked above it then shows conflicts.

1. Core, not stacked: #1 (IMP-03), #4 (IMP-12), #5 (IMP-11), #7 (IMP-10), #12 (IMP-25), #8 (IMP-22).
2. Core, stacked: #2 (IMP-04), then #10 (IMP-09) and #13 (IMP-24). #17 (IMP-27) goes after #8. The IMP-28 PR goes after #7.
3. Core: #20 (IMP-29) is not stacked. The IMP-26 PR (#15, API routes) is stacked on all of the above: merge it last.
4. UI stack, bottom first: #3 (IMP-01) → #6 (IMP-02) → #9 (IMP-23) → #11 (IMP-05) → #14 (IMP-07) → #16 (IMP-15) → #19 (IMP-14) → the next ones as they open.

All core PRs edit `docs/handoff/lanes/core.md`, and all UI PRs edit `docs/handoff/lanes/ui.md`. If one conflicts there, keep the newer version: workers keep a row for every card. `packages/contracts/src/index.ts` can conflict between core PRs too. Keep both export lines, then run `npm run check:contracts`.

After each merge, CI must show web and rust as passing. The state-gate job reports only, until every board is built.

## After a worker finishes

1. The lead reviews each pull request (`gh pr diff N`, CI, and the harness PNGs for ui cards) and comments.
2. The owner merges in order. When two pull requests both touch a lane file, keep the newer one's version.
3. The lead updates the status table in implementation.md and gives the worker its next card.
