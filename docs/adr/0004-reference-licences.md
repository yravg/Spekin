# 0004. How we use reference products

Status: accepted, 23 Nov 2026

## Context

Spekin studied OpenDesign (Apache-2.0, primary reference), Onlook (Apache-2.0, canvas engine), Momo (no licence published) and Paraframe (proprietary). PRD R-REU-1–5 and AC-SPK-23 require exact provenance for any reuse.

## Decision

- **OpenDesign, Onlook:** code may be reused after recording its source file, commit, version and licence in NOTICE in the same pull request, and keeping their notices.
- **Momo:** patterns only. No code, text, icons or assets.
- **Paraframe:** behaviour only. No code, wording or assets.
- Third-party screenshots stay out of git (`docs/design/spekin-canvas/project/ref/` is ignored). Restore them from the owner's archive, listed in docs/handoff/spekin-canvas.md.
- A new npm or Cargo dependency is named in the pull request with its licence. Copyleft licences (GPL, AGPL) need the owner's approval.

## Consequences

Some ideas take longer to rebuild cleanly. The repo stays safe to publish under Apache-2.0.
