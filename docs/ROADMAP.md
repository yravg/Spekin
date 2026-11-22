# Roadmap

Phases P0–P6 are our build order. Each maps to the PRD slices (M0–M4) and tasks (SPK-T-nn). Each task card (`IMP-nn`) is defined in [handoff/implementation.md](handoff/implementation.md). The status of each card lives there too, not here.

| Phase | Goal | Boards | Cards | PRD |
|---|---|---|---|---|
| **P0 Baseline** | Repo, licence, rules, skeleton, shared design and sample, Rust seam, state gate, CI | – | done (this baseline) | M0, SPK-T-01, SPK-T-11, SPK-T-12 |
| **P1 Shell** | The project shell and projects home, built the same as drawn | S35, S27 | IMP-01, IMP-02, IMP-05 | M1, SPK-T-02, SPK-T-03, AC-SPK-1, 2, 14, 17, 18, 21 |
| **P2 Rust seam** | API source behind the same data functions, proposals and revisions in the core, API routes | – | IMP-03, IMP-04, IMP-12, IMP-25, IMP-26, IMP-29 | M1, SPK-T-03, SPK-T-04, SPK-T-11, AC-SPK-19, 20, 23 |
| **P3 Canvas and review** | Reference intake, frames canvas, style, alternatives, targeted change, review and accept, coding handoff | S28–S34 | IMP-06, IMP-07, IMP-08, IMP-13 … IMP-16, IMP-24 | M1, SPK-T-03, SPK-T-04, SPK-T-07 |
| **P3b Skills library** | Free skills library: templates, user copies, GitHub sources with bounded auto-update | S40 | IMP-22, IMP-23, IMP-27 | ADR 0007, R-STD-7, AC-SPK-39 |
| **P4 GenUI** | Contextual GenUI in chat, schema validated in Rust | S38 | IMP-10, IMP-19, IMP-28 | M1, SPK-T-13, AC-SPK-24 … 28 |
| **P5 Models and ledger** | Three model sources, capability registry, estimate/reserve/settle ledger, caps | S36 | IMP-09, IMP-11, IMP-17 | M2, SPK-T-05, SPK-T-06, AC-SPK-6 … 9 |
| **P6 Contracts and hardening** | Build contracts and release readiness, tablet and phone, accessibility, security, recovery, performance | S37, T01 | IMP-18, IMP-20, IMP-21 | M3, M4, SPK-T-07 … 10, SPK-T-14, AC-SPK-22 |

Later adapters (not in the browser MVP): Local CLI execution through the Spekin Connector, local-app canvas, repository writeback, deployment connectors and team roles. Each needs its own ADR and owner approval.

Every phase ends with: all its boards' states `checked` and passing the state gate, `npm run gate` green on main, and the handoff updated.
