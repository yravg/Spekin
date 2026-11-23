//! Typed HTTP API request and error payloads shared between `spekin-server` and `@spekin/contracts`.
//!
//! Pure data structures only (no HTTP or IO). Every type derives `ts_rs::TS`.

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{
    ArtifactRevisionRecord, BoardSnapshot, ContextChip, ManifestSelection, RequiredInput,
    RunEstimate, SkillManifest, UpdatePolicy,
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
