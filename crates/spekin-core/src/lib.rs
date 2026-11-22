//! Spekin domain core.
//!
//! Pure functions and data types shared by the server and (through generated TypeScript)
//! the browser UI. No IO here: the server loads data and calls into this crate.
//! Field names follow the sample project (fixtures/meranti-yard.json), so the boards,
//! the app and the API read the same shapes (canvas-to-app rule 15, R-ARC-3).

pub mod github_source;
pub mod project;
pub mod skills;
pub mod stage;

pub use github_source::{
    BundleFile, GitHubRepo, GitHubSourceError, LicenseFile, MAX_BUNDLE_BYTES, MAX_FILES,
    MAX_FILE_BYTES, PinnedSource, SkillBundle, assemble_bundle, build_notice, check_bundle_limits,
    is_license_path, join_relative, license_from, listed_files, parse_github_repo, plan_updates,
    skill_md_path,
};
pub use project::{Fixture, FixtureError, Project};
pub use skills::{
    AllowedContext, ContextItem, HoldReason, SkillError, SkillManifest, SkillSource, UpdateCheck,
    UpdateDecision, UpdatePolicy, check_update, classify_update, enforce, parse_skill_md,
};
pub use stage::{Stage, StageId, StageTone};
