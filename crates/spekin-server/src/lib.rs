//! Spekin HTTP API. Routes live here so tests can call them without a socket.
//!
//! The server holds in-memory state seeded from `fixtures/meranti-yard.json` and calls
//! `spekin-core` for all business rules (ADR 0002).

use std::collections::BTreeMap;
use std::sync::{Arc, Mutex};

use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
};
use serde_json::Value;
use spekin_core::{
    ApiErrorBody, ArtifactRevisionRecord, ArtifactRevisionState, BoardArtifact, BoardSnapshot,
    BuildContextRequest, BuildManifestRequest, CapabilityRegistry, CheckSkillUpdateRequest,
    ContextItemStatus, EstimateRunRequest, Fixture, GenUiValidation, Hunk, Ledger, LedgerCaps,
    LedgerError, Manifest, ManifestError, ModelCapability, Project, Proposal, ProposalError,
    RejectProposalRequest, Rejection, RejectionReason, RequestContext, RequiredInput, Reservation,
    ReserveRunRequest, Revision, RunEstimate, Stage, UpdateCheck, UsageSnapshot, accept,
    build_context, build_manifest, check_update, estimate, reject, validate_genui_json,
};

/// The project id the sample fixture is served under. The URL uses it: /p/meranti-yard/design.
pub const SAMPLE_PROJECT_ID: &str = "meranti-yard";

/// Mutable in-memory state for one project, seeded from `fixtures/meranti-yard.json`.
struct ProjectStore {
    revisions: BTreeMap<String, Revision>,
    proposals: BTreeMap<String, Proposal>,
    rejections: Vec<Rejection>,
    ledger: Ledger,
    board: BoardSnapshot,
    handoff_revisions: Vec<ArtifactRevisionRecord>,
    required_inputs: Vec<RequiredInput>,
}

#[derive(Clone)]
pub struct AppState {
    pub sample: Arc<Fixture>,
    models: Arc<CapabilityRegistry>,
    project_store: Arc<Mutex<ProjectStore>>,
}

impl AppState {
    pub fn from_fixture_json(text: &str) -> Result<Self, spekin_core::FixtureError> {
        let sample = Fixture::from_json(text)?;
        let raw: Value = serde_json::from_str(text).unwrap_or(Value::Null);
        let store = seed_project_store(&raw);
        Ok(Self {
            sample: Arc::new(sample),
            models: Arc::new(CapabilityRegistry::sample_s36()),
            project_store: Arc::new(Mutex::new(store)),
        })
    }
}

/// Typed server error that always serialises as `ApiErrorBody`.
struct ServerError {
    status: StatusCode,
    code: String,
    message: String,
}

impl ServerError {
    fn new(status: StatusCode, code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            status,
            code: code.into(),
            message: message.into(),
        }
    }

    fn not_found(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::new(StatusCode::NOT_FOUND, code, message)
    }

    fn bad_request(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::new(StatusCode::BAD_REQUEST, code, message)
    }

    fn conflict(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::new(StatusCode::CONFLICT, code, message)
    }

    fn unprocessable(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self::new(StatusCode::UNPROCESSABLE_ENTITY, code, message)
    }
}

impl IntoResponse for ServerError {
    fn into_response(self) -> Response {
        (
            self.status,
            Json(ApiErrorBody {
                code: self.code,
                message: self.message,
            }),
        )
            .into_response()
    }
}

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/api/health", get(|| async { "ok" }))
        .route("/api/projects/{id}", get(project))
        .route("/api/projects/{id}/stages", get(stages))
        .route(
            "/api/projects/{id}/proposals/{pid}/accept",
            post(accept_proposal),
        )
        .route(
            "/api/projects/{id}/proposals/{pid}/reject",
            post(reject_proposal),
        )
        .route("/api/projects/{id}/runs/estimate", post(estimate_run))
        .route("/api/projects/{id}/runs/reserve", post(reserve_run))
        .route("/api/projects/{id}/usage", get(project_usage))
        .route("/api/models", get(list_models))
        .route("/api/genui/validate", post(validate_genui))
        .route("/api/skills/check-update", post(check_skill_update))
        .route("/api/projects/{id}/context", post(project_context))
        .route(
            "/api/projects/{id}/handoff/manifest",
            post(project_handoff_manifest),
        )
        .with_state(state)
}

fn ensure_project(id: &str) -> Result<(), ServerError> {
    if id == SAMPLE_PROJECT_ID {
        Ok(())
    } else {
        Err(ServerError::not_found(
            "project_not_found",
            format!("unknown project: {id}"),
        ))
    }
}

fn find(state: &AppState, id: &str) -> Result<Arc<Fixture>, ServerError> {
    ensure_project(id)?;
    Ok(state.sample.clone())
}

async fn project(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Project>, ServerError> {
    Ok(Json(find(&s, &id)?.project.clone()))
}

async fn stages(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<Stage>>, ServerError> {
    Ok(Json(find(&s, &id)?.stages.clone()))
}

async fn accept_proposal(
    State(s): State<AppState>,
    Path((id, pid)): Path<(String, String)>,
) -> Result<Json<Revision>, ServerError> {
    ensure_project(&id)?;
    let mut store = s.project_store.lock().expect("project store lock");
    let proposal = store.proposals.get(&pid).cloned().ok_or_else(|| {
        ServerError::not_found("proposal_not_found", format!("unknown proposal: {pid}"))
    })?;
    let current = store.revisions.get(&proposal.artifact).ok_or_else(|| {
        ServerError::not_found(
            "artifact_not_found",
            format!("unknown artifact: {}", proposal.artifact),
        )
    })?;

    match accept(current, &proposal) {
        Ok(next_rev) => {
            store
                .revisions
                .insert(proposal.artifact.clone(), next_rev.clone());
            Ok(Json(next_rev))
        }
        Err(err) => Err(map_proposal_error(err)),
    }
}

async fn reject_proposal(
    State(s): State<AppState>,
    Path((id, pid)): Path<(String, String)>,
    Json(req): Json<RejectProposalRequest>,
) -> Result<Json<Rejection>, ServerError> {
    ensure_project(&id)?;
    let reason = req.reason.trim();
    if reason.is_empty() {
        return Err(ServerError::bad_request(
            "empty_reason",
            "rejection reason must not be empty",
        ));
    }
    let mut store = s.project_store.lock().expect("project store lock");
    let proposal = store.proposals.get(&pid).cloned().ok_or_else(|| {
        ServerError::not_found("proposal_not_found", format!("unknown proposal: {pid}"))
    })?;
    let rejection = reject(&proposal, reason);
    store.rejections.push(rejection.clone());
    Ok(Json(rejection))
}

async fn estimate_run(
    Path(id): Path<String>,
    Json(req): Json<EstimateRunRequest>,
) -> Result<Json<RunEstimate>, ServerError> {
    ensure_project(&id)?;
    estimate(req.min, req.max, req.reserve)
        .map(Json)
        .map_err(map_ledger_error)
}

async fn reserve_run(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<ReserveRunRequest>,
) -> Result<Json<Reservation>, ServerError> {
    ensure_project(&id)?;
    let est = estimate(req.estimate.min, req.estimate.max, req.estimate.reserve)
        .map_err(map_ledger_error)?;
    let mut store = s.project_store.lock().expect("project store lock");
    store
        .ledger
        .reserve(req.run_id, req.person_id, req.idempotency_key, &est)
        .map(Json)
        .map_err(map_ledger_error)
}

async fn project_usage(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<UsageSnapshot>, ServerError> {
    ensure_project(&id)?;
    let store = s.project_store.lock().expect("project store lock");
    Ok(Json(store.ledger.project_usage()))
}

async fn list_models(State(s): State<AppState>) -> Json<Vec<ModelCapability>> {
    Json(s.models.list().to_vec())
}

async fn validate_genui(body: String) -> (StatusCode, Json<GenUiValidation>) {
    match validate_genui_json(&body) {
        Ok(card) => (StatusCode::OK, Json(GenUiValidation::Ok { card })),
        Err(reason) => {
            let status = match reason {
                RejectionReason::InvalidJson { .. } => StatusCode::BAD_REQUEST,
                _ => StatusCode::UNPROCESSABLE_ENTITY,
            };
            (status, Json(GenUiValidation::Rejected { reason }))
        }
    }
}

async fn check_skill_update(
    Json(req): Json<CheckSkillUpdateRequest>,
) -> Result<Json<UpdateCheck>, ServerError> {
    if req.old.id.trim().is_empty() || req.new.id.trim().is_empty() || req.old.id != req.new.id {
        return Err(ServerError::bad_request(
            "skill_id_mismatch",
            format!(
                "old skill id '{}' does not match new skill id '{}'",
                req.old.id, req.new.id
            ),
        ));
    }
    Ok(Json(check_update(&req.old, &req.new, req.policy)))
}

async fn project_context(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<BuildContextRequest>,
) -> Result<Json<RequestContext>, ServerError> {
    ensure_project(&id)?;
    let store = s.project_store.lock().expect("project store lock");
    let board = req.board.as_ref().unwrap_or(&store.board);
    Ok(Json(build_context(&req.chips, board)))
}

async fn project_handoff_manifest(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<BuildManifestRequest>,
) -> Result<Json<Manifest>, ServerError> {
    ensure_project(&id)?;
    let store = s.project_store.lock().expect("project store lock");
    let revisions = req.revisions.as_deref().unwrap_or(&store.handoff_revisions);
    let inputs = req.inputs.as_deref().unwrap_or(&store.required_inputs);
    build_manifest(&req.selection, revisions, inputs)
        .map(Json)
        .map_err(map_manifest_error)
}

fn map_proposal_error(err: ProposalError) -> ServerError {
    let message = err.to_string();
    match err {
        ProposalError::Stale { .. } => ServerError::conflict("proposal_stale", message),
        ProposalError::Mismatch { .. } => ServerError::unprocessable("proposal_mismatch", message),
        ProposalError::OutOfRange { .. } => {
            ServerError::unprocessable("proposal_out_of_range", message)
        }
        ProposalError::Overlap { .. } => ServerError::unprocessable("proposal_overlap", message),
        ProposalError::NotEarlier { .. } => {
            ServerError::unprocessable("revert_not_earlier", message)
        }
    }
}

fn map_ledger_error(err: LedgerError) -> ServerError {
    let message = err.to_string();
    match err {
        LedgerError::InvalidEstimate { .. } => {
            ServerError::bad_request("invalid_estimate", message)
        }
        LedgerError::PerRunCapExceeded { .. } => {
            ServerError::conflict("per_run_cap_exceeded", message)
        }
        LedgerError::ProjectCapExceeded { .. } => {
            ServerError::conflict("project_cap_exceeded", message)
        }
        LedgerError::PersonCapExceeded { .. } => {
            ServerError::conflict("person_cap_exceeded", message)
        }
        LedgerError::ConcurrencyCapExceeded { .. } => {
            ServerError::conflict("concurrency_cap_exceeded", message)
        }
        LedgerError::DuplicateRun { .. } => ServerError::conflict("duplicate_run", message),
        LedgerError::IdempotencyConflict { .. } => {
            ServerError::conflict("idempotency_conflict", message)
        }
        LedgerError::NoReservation { .. } => ServerError::not_found("no_reservation", message),
        LedgerError::ActualExceedsReserve { .. } => {
            ServerError::unprocessable("actual_exceeds_reserve", message)
        }
        LedgerError::AlreadySettled { .. } => ServerError::conflict("already_settled", message),
        LedgerError::AlreadyCancelled { .. } => ServerError::conflict("already_cancelled", message),
    }
}

fn map_manifest_error(err: ManifestError) -> ServerError {
    let message = err.to_string();
    match err {
        ManifestError::EmptySelection => ServerError::unprocessable("empty_selection", message),
        ManifestError::NotFound { .. } => ServerError::not_found("artifact_not_found", message),
        ManifestError::DraftNotAccepted { .. } => {
            ServerError::unprocessable("draft_not_accepted", message)
        }
        ManifestError::StaleRevision { .. } => ServerError::conflict("stale_revision", message),
        ManifestError::NotSelectable { .. } => {
            ServerError::unprocessable("not_selectable", message)
        }
    }
}

fn parse_rev_number(label: &str) -> u32 {
    label
        .strip_prefix('r')
        .and_then(|s| s.parse::<u32>().ok())
        .unwrap_or(1)
}

/// Seed in-memory state from `fixtures/meranti-yard.json` so every route works out of the box.
fn seed_project_store(raw: &Value) -> ProjectStore {
    // 1. Proposals & spec revision from REVIEW_PROPOSAL.
    let prop_id = raw["REVIEW_PROPOSAL"]["id"]
        .as_str()
        .unwrap_or("P-07")
        .to_string();
    let prop_base = parse_rev_number(raw["REVIEW_PROPOSAL"]["from"].as_str().unwrap_or("r14"));
    let prop_title = raw["REVIEW_PROPOSAL"]["title"]
        .as_str()
        .unwrap_or("Add the 2-period alert rule and the variance display rule")
        .to_string();

    let mut revisions = BTreeMap::new();
    revisions.insert(
        "spec".to_string(),
        Revision {
            n: prop_base,
            content: "R-DASH-014: Flag packages with variance above 3%.\nAC-014.2: Highlight rows over 3% in red."
                .to_string(),
        },
    );

    let mut proposals = BTreeMap::new();
    proposals.insert(
        prop_id.clone(),
        Proposal {
            id: prop_id,
            artifact: "spec".to_string(),
            title: prop_title,
            base: prop_base,
            hunks: vec![Hunk {
                at: 1,
                remove: vec!["AC-014.2: Highlight rows over 3% in red.".to_string()],
                add: vec![
                    "R-DASH-019: Raise an alert for a package when its variance stays above 3% for 2 consecutive periods."
                        .to_string(),
                    "AC-014.2: Flag rows over 3% with text badge and colour.".to_string(),
                ],
            }],
        },
    );

    // 2. Ledger caps & starting usage from MODELS_CAPS and MODELS_USAGE.calm.
    let caps = LedgerCaps {
        per_run: raw["MODELS_CAPS"]["perRun"].as_u64().unwrap_or(60) as u32,
        project: raw["MODELS_CAPS"]["monthly"].as_u64().unwrap_or(5000) as u32,
        person: raw["MODELS_CAPS"]["monthly"].as_u64().unwrap_or(5000) as u32,
        concurrency: raw["MODELS_CAPS"]["concurrency"].as_u64().unwrap_or(2) as u32,
    };
    let used = raw["MODELS_USAGE"]["calm"]["used"].as_u64().unwrap_or(1240) as u32;
    let pending = raw["MODELS_USAGE"]["calm"]["pending"]
        .as_u64()
        .unwrap_or(30) as u32;
    let ledger = Ledger::with_starting_usage(caps, used, pending);

    // 3. Board snapshot seeded from CANVAS_FRAMES.
    let mut board_items = Vec::new();
    if let Some(frames) = raw["CANVAS_FRAMES"].as_object() {
        for frame in frames.values() {
            let Some(artifact_id) = frame["id"].as_str() else {
                continue;
            };
            let rev = frame["rev"].as_str().unwrap_or("r1").to_string();
            let status = match frame["st"].as_str().unwrap_or("draft") {
                "accepted" => ContextItemStatus::Accepted,
                "proposal" => ContextItemStatus::Proposal,
                "reference" => ContextItemStatus::Reference,
                "needs_review" => ContextItemStatus::NeedsReview,
                _ => ContextItemStatus::Draft,
            };
            let name = frame["name"].as_str().unwrap_or(artifact_id);
            board_items.push(BoardArtifact {
                artifact_id: artifact_id.to_string(),
                revision: rev,
                status,
                hidden: false,
                content: format!("{artifact_id} {name}"),
                estimated_tokens: 2400,
            });
        }
    }
    let board = BoardSnapshot {
        board_id: "design".to_string(),
        items: board_items,
    };

    // 4. Handoff artifact revisions seeded from DELIVERY_ITEMS.
    let mut handoff_revisions = Vec::new();
    if let Some(items) = raw["DELIVERY_ITEMS"].as_array() {
        for item in items {
            let Some(artifact_id) = item["id"].as_str() else {
                continue;
            };
            let name = item["name"].as_str().unwrap_or(artifact_id).to_string();
            let kind = item["kind"].as_str().unwrap_or("frame").to_string();
            let rev_str = item["rev"].as_str().unwrap_or("r1");
            let rev_n = parse_rev_number(rev_str);
            let st = item["st"].as_str().unwrap_or("warn");
            let state = match (kind.as_str(), st) {
                (_, "ok") => ArtifactRevisionState::Accepted,
                ("takes", _) => ArtifactRevisionState::Pending,
                ("ref", _) => ArtifactRevisionState::Reference,
                _ => ArtifactRevisionState::Draft,
            };
            let latest_accepted_rev = if state == ArtifactRevisionState::Accepted {
                Some(rev_n)
            } else {
                None
            };
            handoff_revisions.push(ArtifactRevisionRecord {
                artifact_id: artifact_id.to_string(),
                name: name.clone(),
                kind,
                revision: Revision {
                    n: rev_n,
                    content: format!("{artifact_id} {name} {rev_str}"),
                },
                state,
                latest_accepted_rev,
                exclusion_reason: None,
            });
        }
    }

    let required_inputs = vec![
        RequiredInput {
            name: "DESIGN.md".to_string(),
            present: true,
            revision: Some("r3".to_string()),
        },
        RequiredInput {
            name: "PRD".to_string(),
            present: false,
            revision: None,
        },
    ];

    ProjectStore {
        revisions,
        proposals,
        rejections: Vec::new(),
        ledger,
        board,
        handoff_revisions,
        required_inputs,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::Request;
    use http_body_util::BodyExt;
    use tower::ServiceExt;

    const SAMPLE: &str = include_str!("../../../fixtures/meranti-yard.json");

    async fn get_json(uri: &str) -> (StatusCode, serde_json::Value) {
        let app = router(AppState::from_fixture_json(SAMPLE).unwrap());
        let res = app
            .oneshot(Request::get(uri).body(Body::empty()).unwrap())
            .await
            .unwrap();
        let status = res.status();
        let bytes = res.into_body().collect().await.unwrap().to_bytes();
        (
            status,
            serde_json::from_slice(&bytes).unwrap_or(serde_json::Value::Null),
        )
    }

    #[tokio::test]
    async fn project_matches_the_fixture_exactly() {
        let (status, body) = get_json("/api/projects/meranti-yard").await;
        assert_eq!(status, StatusCode::OK);
        let fixture: serde_json::Value = serde_json::from_str(SAMPLE).unwrap();
        assert_eq!(
            body, fixture["PROJECT"],
            "API project must equal the sample the boards draw"
        );
    }

    #[tokio::test]
    async fn unknown_project_is_404_for_the_project_route() {
        let (status, _) = get_json("/api/projects/nope").await;
        assert_eq!(status, StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn stages_match_the_fixture_exactly() {
        let (status, body) = get_json("/api/projects/meranti-yard/stages").await;
        assert_eq!(status, StatusCode::OK);
        let fixture: serde_json::Value = serde_json::from_str(SAMPLE).unwrap();
        assert_eq!(
            body, fixture["STAGES"],
            "API stages must equal the sample the boards draw"
        );
    }

    #[tokio::test]
    async fn unknown_project_is_404() {
        let (status, _) = get_json("/api/projects/nope/stages").await;
        assert_eq!(status, StatusCode::NOT_FOUND);
    }
}
