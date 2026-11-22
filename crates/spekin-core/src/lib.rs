//! Spekin domain core.
//!
//! Pure functions and data types shared by the server and (through generated TypeScript)
//! the browser UI. No IO here: the server loads data and calls into this crate.
//! Field names follow the sample project (fixtures/meranti-yard.json), so the boards,
//! the app and the API read the same shapes (canvas-to-app rule 15, R-ARC-3).

pub mod context;
pub mod project;
pub mod stage;

pub use context::{
    BoardArtifact, BoardSnapshot, ContextChip, ContextItemStatus, RequestContext,
    RequestContextItem, build_context, format_token_estimate,
};
pub use project::{Fixture, FixtureError, Project};
pub use stage::{Stage, StageId, StageTone};
