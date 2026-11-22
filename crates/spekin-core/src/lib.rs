//! Spekin domain core.
//!
//! Pure functions and data types shared by the server and (through generated TypeScript)
//! the browser UI. No IO here: the server loads data and calls into this crate.
//! Field names follow the sample project (fixtures/meranti-yard.json), so the boards,
//! the app and the API read the same shapes (canvas-to-app rule 15, R-ARC-3).

pub mod model_source;
pub mod project;
pub mod proposal;
pub mod revision;
pub mod stage;

pub use model_source::{
    ApiKeyStatus, CapabilityCheckResult, CapabilityError, CapabilityRegistry, ConnectorStatus,
    JobRequirements, LocalCliSource, ModelAvailability, ModelCapability, ModelSource,
    ModelSourceKind, PricePerUnit,
};
pub use project::{Fixture, FixtureError, Project};
pub use proposal::{Hunk, Proposal, ProposalError, Rejection, accept, reject, revert};
pub use revision::Revision;
pub use stage::{Stage, StageId, StageTone};
