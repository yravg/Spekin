//! Typed HTTP API request and error payloads shared between `spekin-server` and `@spekin/contracts`.
//!
//! Pure data structures only (no HTTP or IO). Every type derives `ts_rs::TS`.

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    ArtifactRevisionRecord, AuditEntry, AuditError, BoardSnapshot, ContextChip, Contract, Evidence,
    ManifestSelection, MatrixRow, ProjectEntry, RequiredInput, Revision, RunEstimate,
    SkillManifest, UpdatePolicy,
};

/// Typed error body returned by `spekin-server` on 4xx/5xx responses.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ApiErrorBody {
    pub code: String,
    pub message: String,
}

/// Request body for `POST /api/projects/{id}/proposals/{pid}/reject`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct RejectProposalRequest {
    pub reason: String,
}

/// Request body for `POST /api/projects/{id}/runs/estimate`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct EstimateRunRequest {
    pub min: u32,
    pub max: u32,
    pub reserve: u32,
}

/// Request body for `POST /api/projects/{id}/runs/reserve`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ReserveRunRequest {
    pub run_id: String,
    pub person_id: String,
    pub idempotency_key: String,
    pub estimate: RunEstimate,
}

/// Request body for `POST /api/skills/check-update`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CheckSkillUpdateRequest {
    pub old: SkillManifest,
    pub new: SkillManifest,
    pub policy: UpdatePolicy,
}

/// Request body for `POST /api/projects/{id}/revisions/{artifact}/revert` (IMP-31).
/// The earlier revision's content is written as a new revision; history is never rewritten.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct RevertRevisionRequest {
    pub to: Revision,
}

/// Request body for `POST /api/projects/{id}/runs/settle` (IMP-31).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SettleRunRequest {
    pub run_id: String,
    pub actual: u32,
}

/// Request body for `POST /api/projects/{id}/context`.
/// When `board` is omitted, the server uses the project's seeded board snapshot.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct BuildContextRequest {
    pub chips: Vec<ContextChip>,
    #[serde(default)]
    pub board: Option<BoardSnapshot>,
}

/// Request body for `POST /api/projects/{id}/handoff/manifest`.
/// When `revisions` or `inputs` are omitted, the server uses the project's seeded records.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct BuildManifestRequest {
    pub selection: ManifestSelection,
    #[serde(default)]
    pub revisions: Option<Vec<ArtifactRevisionRecord>>,
    #[serde(default)]
    pub inputs: Option<Vec<RequiredInput>>,
}

/// The audit view served by `GET /api/projects/{id}/audit` (IMP-31).
///
/// The head hash is held by the server *apart* from the log (the lead's follow-up on #21):
/// `verify` is checked against that separate anchor, and `error` is null only when both the
/// hash chain and the head are intact. The log itself never carries its own head in this view.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct AuditResponse {
    pub entries: Vec<AuditEntry>,
    /// The head hash the server keeps apart from the log.
    pub head_hash: String,
    /// Typed verify failure, or null when the chain and the separate head agree.
    pub error: Option<AuditError>,
}

/// One row of `GET /api/projects/deleted` (IMP-31): an IMP-29 entry with the
/// whole-day countdown S27 shows ("27 days left").
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct DeletedProjectView {
    pub entry: ProjectEntry,
    pub days_left: i64,
}

/// Response for `GET /api/projects/{id}/contracts` (IMP-33). The matrix carries
/// the status of every check, so a missing check is shown as `not_run`, never passed.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ContractsResponse {
    pub contracts: Vec<Contract>,
    pub evidence: Vec<Evidence>,
    pub matrix: Vec<MatrixRow>,
}
