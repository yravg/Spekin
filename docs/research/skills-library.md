# Skills library: pre-built skills in Spekin (brainstorm)

Status: **decided 23 Nov 2026**. See ADR 0007 and board S40. The owner said yes to the library, templates from the start, easy user changes, free for everyone, and auto-update for GitHub sources. The rest of this file is the background. Owner request, 23 Nov 2026: "pre-build well-known, good standard skills and plugins in our app, as part of our MCP SaaS features, starting with Matt Pocock's skills (aihero.dev/skills)."

Nothing here is built or drawn yet. Canvas first: if accepted, the screens get their own boards before any code (ADR 0003).

## 1. What Matt Pocock's skills are (verified 23 Nov 2026)

- **Source:** one open repo, https://github.com/mattpocock/skills. aihero.dev/skills is the catalogue and install page. The plugin manifest lists 27 skills, v1.3.2.
- **Format:** each skill is a folder with `SKILL.md`: YAML frontmatter (`name`, `description`, optional `disable-model-invocation: true` for skills only a user invokes), then plain Markdown instructions. Some skills have sibling reference files or script templates. Skills call each other by name: `grill-with-docs` is just "grilling" plus "domain-modeling".
- **Licence: MIT**, "Copyright (c) 2026 Matt Pocock". We may bundle, serve, adapt and sell them, including in a hosted SaaS. The only condition is that the copyright and permission notice travel with any copy or substantial part. MIT is compatible with our Apache-2.0.
- **Limits:** MIT grants no trademark. Don't present anything as Matt Pocock's or AI Hero's product, and rename skills that carry his name (`ask-matt`, `setup-matt-pocock-skills`). His paid courses and the email course are **not** in the repo and not covered: don't copy them. The aihero.dev terms page returned 404, so that is unverified. Pin a commit SHA and keep that commit's LICENSE.

### How they map to Spekin's eight stages

| Stage | Skills that fit | Gap Spekin fills with its own skills |
|---|---|---|
| Planning | grill-me, grilling, wayfinder, research, to-questionnaire, prototype | domain question banks (PRD T-110) |
| Specification | to-spec, domain-modeling (GLOSSARY.md and ADR rules), grill-with-docs, to-tickets, triage | **EARS requirements, traceability matrix**: not in his set |
| Design | codebase-design, improve-codebase-architecture, prototype | screen boards, canvas-to-app state contract |
| Frontend / Backend | none dedicated | build-same-as-drawn, contract-first API (ours) |
| Integration | implement-spec, pr | integration contracts (S37) |
| Testing | tdd, code-review (Spec axis), diagnosing-bugs | evidence pinning, state gate |
| Deployment | wizard (human-only steps) | release readiness (S37) |

His `domain-modeling` skill holds the "GLOSSARY.md + ADR rule" that the PRD cites (§6, Expert depth). That is a direct fit for Spekin's living spec.

## 2. Three ways to offer skills (they combine)

**A. Built into the stages (recommended first).** Spekin runs a skill's *method* inside its own agent loop, and every result is a **proposal**, never a direct write (R-EDT-1). Examples:
- Planning → "Grill the idea" (grilling plus domain-modeling) proposes glossary terms and ADRs.
- Specification → "Write the spec" (to-spec, using our EARS template) proposes the requirements.
- Specification → "Split into tickets" (to-tickets) proposes task cards with blocking edges.
- Testing → "Review against the spec" (code-review, Spec axis) attaches its findings as evidence.

This uses Hosted credits through the ledger, or the user's own source (ADR 0005).

**B. Served over MCP to the user's own agent (bring your own agent).** Spekin's MCP server, already planned as `get_ticket`, `next_ticket` and `verify_ticket` (PRD T-313), adds:
- `list_skills`, `get_skill(id)`;
- MCP *prompts*, one per skill, filled with the project's context (glossary, ADRs, the current ticket and its criteria).

Claude Code, Cursor, Codex or OpenCode then work with the same skills *and* the live spec. This is the "MCP SaaS" part: the skills are only as good as the context they get, and Spekin owns that context. It falls under later-adapter scope (PRD), so it needs its own ADR and approval.

**C. Exported with the coding handoff.** S34 adds the chosen skills to the hand-off package: `.agents/skills/<id>/SKILL.md` plus their LICENSE, an `AGENTS.md`, the GLOSSARY and the ADRs. Any agent can use them offline. The cost is low, and it works today with every tool.

## 3. The library itself

A **skill manifest** per entry, stored in the repo and checked in CI:

```yaml
id: spekin.grill-the-idea          # our id; never someone else's name
title: Grill the idea
source: { repo: mattpocock/skills, path: skills/productivity/grilling, commit: <sha>, licence: MIT,
          notice: "Copyright (c) 2026 Matt Pocock" }
adapted: true                      # we changed it; diff kept in the repo
stages: [planning, spec]
reads: [pitch, glossary, adr]      # which spec artifacts it may see
proposes: [glossary-term, adr]     # what it may suggest; never writes
invocation: user                   # user | model
tools: []                          # tools it may call; empty = text only
```

- **Catalogue tiers:** *Core* (ours plus adapted, pinned and reviewed), *Community* (well-known sets, licence checked, shown with their source), *Project* (a team's own skills).
- **Candidate sources to check next:** Anthropic's published skills, obra/superpowers, and others the owner names. Each needs the same licence check as above before it is listed. None are verified yet.
- **Updates:** a new upstream commit is a proposal showing the diff. Nothing auto-updates.

## 4. Safety (skills are instructions, so they are an attack surface)

- Pin by commit SHA. Review every update as a diff. Show the source and licence in the UI.
- Hosted Spekin never runs a skill's scripts. Scripts are only exported (option C), for the user's own machine.
- A skill can only *propose* changes to the artifacts it declares, and the Rust core enforces `reads` and `proposes`.
- Skill text is checked for prompt-injection patterns, and anything it asks to fetch outside the project is refused.

## 5. Screens (to draw before any build)

The next free screen numbers are needed. The PRD already uses up to S39, so these would be **S40 Skills library** (catalogue, detail with source and licence, enable per project, stage mapping) and a **skill picker in the chat composer** (`/` menu, an addition to S35 and S38). The S34 coding handoff gains a "Skills to include" list, and S36 gains MCP connection settings.

## 6. Recommendation

1. **Yes, start with option C plus a small option A:** export skills with the handoff, and offer three built-in skills (Grill the idea, Write the spec in EARS, Split into tickets). That is low risk and shows value early.
2. Draw S40 and the composer picker on the canvas next (a lead task), then add `SkillManifest` types to the core (one core card).
3. Option B (MCP server) after P5, with its own ADR, because it touches auth, tokens and the local connector.
4. Credit Matt Pocock visibly on each adapted skill (source link and notice). MIT doesn't require this in the UI, but it is right and builds trust.

## Questions for the owner

1. Is the order above (C, then a little of A, then B) right, or do you want the MCP server sooner?
2. Which other skill sets should the library include? Each needs a licence check.
3. Are skills free for everyone, with only Hosted runs costing credits (recommended)?
