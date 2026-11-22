Source: external review agent, supplied by the owner (Spekin SUPPLEMENT v1.0, with the original v0.2.3 continuation)
Received: 2026-11-23
Status: triaged
Affects: S27, S28, S33, S36, F00, T01 plan; PRD v0.2.3; task cards IMP-05, IMP-09, IMP-10, IMP-11; lead canvas tasks C-01 to C-05

# Review supplement v1.0: triage

The text files of the bundle are in [2026-11-23-review-supplement-v1.0/](2026-11-23-review-supplement-v1.0/). Read `SUPPLEMENT-READ-ME-v1.0.md` first, then `sources/original-v0.2.3-handoff-UNMODIFIED.md` (the original continuation, which the owner says comes first), then `SUPPLEMENT-REVIEW-AND-DELTA-v1.0.md`. The canonical PRD v0.2.3 is at `inputs/Spekin-PRD-v0.2.3.md`. It is unchanged, with 334 definitions, and adds R-STD-1–8 and AC-SPK-33–40.

**Left out of git on purpose:** the 21-page PDF and the offline HTML (they embed images), `sources/architecture-lesson/*.png` (captures from a third-party video), and the owner-artifact screenshots. They are in the owner's Drive folder named in the README and in `~/Downloads/Spekin-SUPPLEMENT-v1.0-evidence-and-handoff.zip`.

**What the review covered:** the design canvas. It did not see the repo code or a running app. Its counts (for example "195 new, 0 built") are about the canvas, not about the build.

## Decisions on each finding

| Finding | Verdict | Becomes |
|---|---|---|
| REV-01 Keep the OpenDesign + Paraframe direction | accepted | already ADR 0004 |
| REV-02 S36 shows Local CLI, while the PRD defers local integration | **superseded by owner**: Local CLI was the owner's own canvas comment (22 Nov). Kept as a *source*. Execution through the connector stays later scope (ADR 0005). | C-05: label the S36 Local CLI as "connect: later", with no run path |
| REV-03 Intake should be four domain choices plus one idea box, Bahasa first, with no name or language wizard | accepted as recommendation (owner to confirm, DECISIONS.md) | **C-01** redraw S27 create. IMP-05 is blocked until then. |
| REV-04 Cover says T01 is not drawn | fixed | build.mjs PLAN, this commit |
| REV-05 F00 stories lack R-ID citations (traceability) | accepted | **C-02** add R-IDs to every story, then rebuild F00 |
| REV-06, 07, 10, 12–18 Keep and verify (state continuity, Rust authority, GenUI safety, registry, accounting, sealed exports, roles, motion, responsive) | accepted | Already covered by the state gate and IMP-02, IMP-04, IMP-09, IMP-10, IMP-11, plus the CHK list below |
| REV-08 Accept/Reject wording and an audit entry for Reject | accepted | **C-03** S33 wording, and the reject audit row |
| REV-09 Strict Rust validation wins over tolerant repair | accepted | IMP-10 acceptance (already "never a partial render") |
| REV-11 "No training" is a requirement, not a guarantee; retention policy | wording accepted. The 30-day restore window and the 30-day upload keep were **decided by the owner on 22 Nov**. | **C-04** S28 wording: say "required of providers", don't claim it is guaranteed |
| REV-19 Attribution breadth, licence checks per unit | accepted | IMP-12 (licence inventory), NOTICE per reused unit |
| REV-20 Unseen journeys | noted | P6 |
| REV-21 Optional flat/isometric architecture view | **not accepted for build**. Kept as a proposal. | none. `OPTIONAL-ARCHITECTURE-CLARITY-CONCEPT-v1.svg` stays as a reference. |
| REV-22 Defer scope and keep the architecture restrained | accepted | ADR 0002 |

## Checks the supplement asks for (CHK-01 to CHK-10)

These are folded into the task cards' acceptance lists rather than run as a separate checklist: navigation never approves or spends (IMP-01/02), stale proposals rejected (IMP-04), concurrent reservations can't overspend (IMP-09), GenUI fails closed (IMP-10), sealed handoff readback (S34 card), viewer and cross-project denial (P6). None has run yet.
