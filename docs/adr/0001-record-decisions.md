# 0001. Record architecture decisions

Status: accepted, 23 Nov 2026

## Context

Several agents (Antigravity, OpenCode, Claude Code, Cursor, Codex) and people build Spekin, often in different sessions. A decision made in a chat is lost to the next agent.

## Decision

Architecture decisions go in `docs/adr/NNNN-slug.md` (context, decision, consequences). Owner product decisions go in `docs/DECISIONS.md`, one line each with the date. Neither is ever edited to change history: a new ADR supersedes an old one and says so.

## Consequences

Every agent reads the ADR index (this folder) before changing structure. A pull request that changes a decided point without a new ADR is sent back.
