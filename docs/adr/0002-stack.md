# 0002. Rust core, TypeScript browser UI, no Python

Status: accepted, 23 Nov 2026 (owner direction 22 Nov; PRD §16.2, R-ARC-1–6)

## Context

The PRD asks for a Rust core and accepts TS/JS for the UI. The owner ruled out Python as a product dependency. Browser first, with local integration deferred.

## Decision

- **UI:** React 19, TypeScript (strict), Vite, React Router, Zustand for per-stage view memory. Canvas engine (P3): `@xyflow/react` with an operation log (Onlook idea). GenUI (P4): `@openuidev/react-lang` (MIT) after its licence check.
- **Core:** `crates/spekin-core`, pure Rust with no IO: types, rules, proposal/revision logic, ledger, GenUI schema validation.
- **API:** `crates/spekin-server`, Axum. It loads data and calls the core, and holds no business rules itself.
- **Contracts:** Rust types derive `ts_rs::TS`. `cargo test` writes `packages/contracts/src/generated/*.ts`. The Rust type is the source, and CI fails when the generated files are not committed.
- **No Python** anywhere: not in dependencies, scripts or CI (`npm run check:rules` R1).

## Consequences

Two toolchains (Node 22+, Rust stable). Business rules live in Rust and are tested there. The UI never decides a rule on its own. It shows what the core returns.
