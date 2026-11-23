# Running the build workers

The owner runs two AI workers overnight. Each works in its own git worktree, on its own branch, one card per pull request. **Only the owner merges.** The lead (Claude Code) reviews each pull request and leaves a review comment, but a safety check stops the lead from merging.

| Lane | Tool | Model | Worktree |
|---|---|---|---|
| ui | Antigravity CLI (`agy`) | `gemini-4-neon-medium` | `../Spekin-ui` |
| core | OpenCode CLI (`opencode`) | `opencode-go/deepseek-v4.1-flash` (OpenCode Go isn't signed in on this Mac, so the free DeepSeek V4.1 Flash is used) | `../Spekin-core` |

## Model availability, 23 Nov (night)

- **Antigravity (Gemini Neon 4)** hit its individual quota at 18:25 UTC, and it resets at about 22:05 UTC. The UI lane's S30 card (IMP-08) is scheduled to start on it at 22:07 UTC, with the prompt in `tools/workers/prompt-ui-IMP-08.txt`.
- **OpenCode free models.** `deepseek-v4.1-flash-free`, `nemotron-3.5-super-vl-free` and `flint-40b-free` reached their free limits. `hy4-flash-free` ran the core cards IMP-27 to IMP-34 well. `beam-free` finished the S31 fix, but its runs are killed after about 6 to 10 minutes (exit 143), and one S30 attempt pasted board HTML into a string and edited lead-owned sample files. That attempt was stashed in `../Spekin-ui` (`git stash list`, "do not use"), and rule R11 now rejects markup in strings.
- 23 Nov, 22:30 UTC: the owner has OpenCode Go. After `opencode auth login` (OpenCode Go) the CLI offers `opencode-go/deepseek-v4.1-flash`. Use that id; the `-free` id keeps hitting the free limit. It now runs S36 (IMP-17) in `../Spekin-core` while Antigravity runs S28 (IMP-06) in `../Spekin-ui`.

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
cd ../Spekin-core && opencode run -m opencode-go/deepseek-v4.1-flash --title "Spekin core" \
  "$(cat <repo>/tools/workers/prompt-core-batch2.txt)" > ../worker-core.log 2>&1 &
```

We don't use `--dangerously-skip-permissions` (Antigravity) or `--auto` (OpenCode): the scoped allow-list is the safer choice.

## Merge order for the open pull requests (owner)

**Simplest: merge [#22](https://github.com/yravg/Spekin/pull/22) only, with "Create a merge commit".** It already merges #1 to #21 in the order below, with the conflicts resolved. On that branch the gate passes (207 Rust tests, 48 web tests) and 33 of 33 board states pass. GitHub then shows #1 to #21 as merged; close any it does not. Pull requests opened after #22 are stacked on top of it, each on the one before. After #22, merge them in this order:
- core: #23 (IMP-31) → #24 (IMP-32) → #26 (IMP-33) → #27 (IMP-34) → #28 (IMP-35);
- **Live preview (owner's tailnet, host not in git):** port 8443 on the owner's Mac, serving the static build of PR #37 with sample data. To rebuild: in a worktree of `integration-2-2026-11-23` run `npm ci && npm run build -w @spekin/web`, serve `apps/web/dist` on 127.0.0.1:5300 with SPA fallback (any static server; Vite's dev server refuses the tailnet host name), then `tailscale serve --bg --https=8443 http://127.0.0.1:5300`. Stop with `tailscale serve --https=8443 off`.
- **Prompts carry the card text.** On the owner's Mac a hook summarises long file reads, workers' shell reads included, so a worker told to read the card from implementation.md may see only a summary. Paste the whole card into the prompt (see IMP-21's launch).
- **Simplest: merge #22, then #37 (integration 2).** #37 already holds #23–#36; after it, close those PRs. The chains below are only for merging one at a time.
- ui: #25 (IMP-13, S31) → #30 (IMP-08, S30) → #31 (IMP-06, S28) → #32 (IMP-16, S34) → #34 (IMP-19, S38) → #35 (IMP-20, T01). Beside it: #33 (IMP-17, S36) → #36 (IMP-18, S37). The S36 pull request (IMP-17) is also stacked on #30, beside #31: merge it after #31, and if both changed `ProjectShell.tsx` or `DesignWorkArea.tsx`, keep both views;
- ci: #29 makes the state gate a required check, for states marked checked. Merge it right after #22. From then on, CI fails any built state that drifts from its board.

Each is a straight line on the one before, so none of them should conflict.

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
