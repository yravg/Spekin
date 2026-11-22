//! Spekin domain core.
//!
//! Pure functions and data types shared by the server and (through generated TypeScript)
//! the browser UI. No IO here: the server loads data and calls into this crate.
//! Field names follow the sample project (fixtures/meranti-yard.json), so the boards,
//! the app and the API read the same shapes (canvas-to-app rule 15, R-ARC-3).

pub mod api;
pub mod audit;
pub mod context;
pub mod contracts;
pub mod genui;
pub mod github_source;
pub mod handoff;
pub mod ledger;
pub mod model_source;
pub mod project;
pub mod proposal;
pub mod restore;
pub mod revision;
pub mod skills;
pub mod stage;

pub use api::{
    ApiErrorBody, AuditResponse, BuildContextRequest, BuildManifestRequest,
    CheckSkillUpdateRequest, ContractsResponse, DeletedProjectView, EstimateRunRequest,
    RejectProposalRequest, ReserveRunRequest, RevertRevisionRequest, SettleRunRequest,
};
pub use audit::{AuditAction, AuditEntry, AuditError, AuditEvent, AuditLog, GENESIS_HASH, verify};
pub use context::{
    BoardArtifact, BoardSnapshot, ContextChip, ContextItemStatus, RequestContext,
    RequestContextItem, build_context, format_token_estimate,
};
pub use contracts::{
    Check, CheckKind, Contract, ContractStatus, Evidence, EvidenceError, EvidenceResult,
    GateResult, MAX_LOG_BYTES, MatrixRow, OwnerLane, check_status, gate, matrix, sample_contracts,
    sample_evidence, sample_matrix, status,
};
pub use genui::{
    AllowedActionKind, ChecklistItem, ChecklistStatus, ComparisonOption, GenUiAction, GenUiCard,
    GenUiFamily, GenUiValidation, Provenance, QuestionOption, RejectionReason, validate_genui,
    validate_genui_json,
};
pub use github_source::{
    BundleFile, GitHubRepo, GitHubSourceError, LicenseFile, MAX_BUNDLE_BYTES, MAX_FILE_BYTES,
    MAX_FILES, PinnedSource, SkillBundle, assemble_bundle, build_notice, check_bundle_limits,
    is_license_path, join_relative, license_from, listed_files, parse_github_repo, plan_updates,
    skill_md_path,
};
pub use handoff::{
    ArtifactRevisionRecord, ArtifactRevisionState, Manifest, ManifestArtifact, ManifestError,
    ManifestExclusion, ManifestInput, ManifestInputStatus, ManifestSelection,
    ManifestSelectionItem, RequiredInput, build_manifest, sha256_hex,
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
pub use restore::{
    ProjectEntry, RESTORE_WINDOW_DAYS, RestoreError, SECONDS_PER_DAY, Timestamp, WINDOW_SECONDS,
    days_left, delete, purge_due, restore, window_close,
};
pub use revision::Revision;
pub use skills::{
    AllowedContext, ContextItem, HoldReason, SkillError, SkillManifest, SkillSource, UpdateCheck,
    UpdateDecision, UpdatePolicy, check_update, classify_update, enforce, parse_skill_md,
};
pub use stage::{Stage, StageId, StageTone};
