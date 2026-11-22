# 0007. A free skills library with templates, user copies and GitHub sources that update

Status: accepted, 23 Nov 2026 (owner: "yes… library for skills as template from the beginning or change it easily for user… free and anyone can use it… if from GitHub repo… autoupdate")

## Context

Users want proven working methods (grill an idea, write the spec, split tickets, test first, review against the spec) without writing prompts. Good open sets exist, for example github.com/mattpocock/skills (MIT). PRD v0.2.3 R-STD-7 and AC-SPK-39 forbid silent skill updates and say a hostile upstream skill must stay data.

## Decision

- **Library from day one, free for everyone.** It contains Spekin templates (Apache-2.0) and adapted open skills, each renamed and shown with its source, pinned commit, licence and notice. Using, copying and editing skills is free. Only hosted *runs* cost credits, through the ledger.
- **Easy to change.** Any skill can be copied, and the copy is the user's own, versioned, edited through plain fields, and tried on the sample before saving. Projects stay on the version they use until they switch.
- **GitHub sources.** Paste a public repo link. Spekin reads the SKILL.md folders and the licence, and refuses a repo with no licence. Choose **Auto-update** (the default), **Notify me** or **Pinned**.
- **Auto-update is visible, bounded and reversible.** That is how it meets R-STD-7 and AC-SPK-39. An update applies on its own only if the licence is unchanged, the skill asks for no new tool, has no new script and passes the injection scan. Anything else is held with its diff for a person. Every update is listed in the history with one-click roll back, and nothing is silent.
- **Limits enforced in Rust.** A skill declares what it `reads` and `proposes`. The core gives it only that context and accepts only proposals (R-EDT-1). Hosted Spekin never runs scripts inside a skill; they go only into exports.
- **Screens:** S40 Skills library (6 states, F361–F377), the `/` list in each composer, and skills to include in the S34 handoff. The MCP server that serves skills to a user's own agent is later work with its own ADR.

## Consequences

New core types (`SkillManifest`, update policy, update checks) and a scheduled checker. Attribution travels with every copy and export. Upstream licence changes are always held.
