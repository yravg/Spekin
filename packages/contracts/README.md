# @spekin/contracts

Types shared by the Rust core and the TypeScript UI (R-ARC-3). The Rust types in crates/spekin-core are the source; `cargo test --workspace` writes src/generated/*.ts through ts-rs. CI fails when the generated files are not committed (`npm run check:contracts`).
