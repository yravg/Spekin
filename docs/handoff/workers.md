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

## After a worker finishes

1. The lead reviews each pull request (`gh pr diff N`, CI, and the harness PNGs for ui cards) and comments.
2. The owner merges in order. When two pull requests both touch a lane file, keep the newer one's version.
3. The lead updates the status table in implementation.md and gives the worker its next card.
