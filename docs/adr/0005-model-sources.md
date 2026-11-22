# 0005. Three model sources: Hosted, Local CLI, API provider

Status: accepted, 22 Nov 2026 (owner comment on S36: "Follow how Open-Design have. It have CLI (BYOA) and API, not only BYOK")

## Context

The first S36 drawing offered only hosted models and bring-your-own-key. OpenDesign also lets users bring their own agent through a CLI.

## Decision

- **Hosted:** Spekin's models. Every job is estimated, reserved and settled in the ledger, and counts against caps.
- **Local CLI (bring your own agent):** the user's own coding-agent CLI, reached through the Spekin Connector on `127.0.0.1`. No Spekin credits are used. This is later-adapter scope for execution. The browser MVP shows the source, its status and the connector setup.
- **API provider (bring your own key):** the user's provider key, stored server-side and never in the browser. Estimates are shown, and the provider bills the user.
- Source choice is explicit per job, and the UI never switches source silently.

## Consequences

The ledger, the capability registry (SPK-T-05) and the S36 board all carry the three sources.
