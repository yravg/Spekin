//! Spekin domain core.
//!
//! Pure functions and data types shared by the server and (through generated TypeScript)
//! the browser UI. No IO here: the server loads data and calls into this crate.
//! Field names follow the sample project (fixtures/meranti-yard.json), so the boards,
//! the app and the API read the same shapes (canvas-to-app rule 15, R-ARC-3).

pub mod model_source;
pub mod github_source;
pub mod project;
pub mod skills;
pub mod stage;

pub use model_source::{
    ApiKeyStatus, CapabilityCheckResult, CapabilityError, CapabilityRegistry, ConnectorStatus,
    JobRequirements, LocalCliSource, ModelAvailability, ModelCapability, ModelSource,
    ModelSourceKind, PricePerUnit,
pub mod genui;

pub use genui::{
    AllowedActionKind, ChecklistItem, ChecklistStatus, ComparisonOption, GenUiAction, GenUiCard,
    GenUiFamily, GenUiValidation, Provenance, QuestionOption, RejectionReason, validate_genui,
    validate_genui_json,
pub mod context;

pub use context::{
    BoardArtifact, BoardSnapshot, ContextChip, ContextItemStatus, RequestContext,
    RequestContextItem, build_context, format_token_estimate,
pub use github_source::{
    BundleFile, GitHubRepo, GitHubSourceError, LicenseFile, MAX_BUNDLE_BYTES, MAX_FILE_BYTES,
    MAX_FILES, PinnedSource, SkillBundle, assemble_bundle, build_notice, check_bundle_limits,
    is_license_path, join_relative, license_from, listed_files, parse_github_repo, plan_updates,
    skill_md_path,
};
pub use project::{Fixture, FixtureError, Project};
pub use skills::{
    AllowedContext, ContextItem, HoldReason, SkillError, SkillManifest, SkillSource, UpdateCheck,
    UpdateDecision, UpdatePolicy, check_update, classify_update, enforce, parse_skill_md,
};
pub use stage::{Stage, StageId, StageTone};
