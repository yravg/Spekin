//! Spekin domain core.
//!
//! Pure functions and data types shared by the server and (through generated TypeScript)
//! the browser UI. No IO here: the server loads data and calls into this crate.
//! Field names follow the sample project (fixtures/meranti-yard.json), so the boards,
//! the app and the API read the same shapes (canvas-to-app rule 15, R-ARC-3).

pub mod context;
pub mod genui;
pub mod ledger;
pub mod model_source;
pub mod project;
pub mod proposal;
pub mod revision;
pub mod skills;
pub mod stage;

pub use context::{
    BoardArtifact, BoardSnapshot, ContextChip, ContextItemStatus, RequestContext,
    RequestContextItem, build_context, format_token_estimate,
};
pub use genui::{
    AllowedActionKind, ChecklistItem, ChecklistStatus, ComparisonOption, GenUiAction, GenUiCard,
    GenUiFamily, GenUiValidation, Provenance, QuestionOption, RejectionReason, validate_genui,
    validate_genui_json,
};
pub use ledger::{
    CRIT_THRESHOLD_PCT, Ledger, LedgerCaps, LedgerEntry, LedgerEntryKind, LedgerError, Reservation,
    ReservationStatus, RunEstimate, Settlement, UsageSeverity, UsageSnapshot, WARN_THRESHOLD_PCT,
    estimate, severity_for,
};
pub use model_source::{
    ApiKeyStatus, CapabilityCheckResult, CapabilityError, CapabilityRegistry, ConnectorStatus,
    JobRequirements, LocalCliSource, ModelAvailability, ModelCapability, ModelSource,
    ModelSourceKind, PricePerUnit,
};
pub use project::{Fixture, FixtureError, Project};
pub use proposal::{Hunk, Proposal, ProposalError, Rejection, accept, reject, revert};
pub use revision::Revision;
pub use skills::{
    AllowedContext, ContextItem, HoldReason, SkillError, SkillManifest, SkillSource, UpdateCheck,
    UpdateDecision, UpdatePolicy, check_update, classify_update, enforce, parse_skill_md,
};
pub use stage::{Stage, StageId, StageTone};
