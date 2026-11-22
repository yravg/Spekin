//! Spekin HTTP API. Routes live here so tests can call them without a socket.
//!
//! The server holds in-memory state seeded from `fixtures/meranti-yard.json` and calls
//! `spekin-core` for all business rules (ADR 0002).

pub mod hardening;
pub mod skills;

use std::collections::BTreeMap;
use std::sync::{Arc, Mutex};

use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post, put},
};
use hardening::{HardeningConfig, apply_hardening};
use serde_json::Value;
use skills::github::{DynGitHubSkillSource, HttpGitHubClient, injected_source};
use spekin_core::{
    AddGithubSkillRequest, ApiErrorBody, ArtifactRevisionRecord, ArtifactRevisionState,
    AuditAction, AuditEntry, AuditError, AuditEvent, AuditLog, AuditResponse, BoardArtifact,
    BoardSnapshot, BuildContextRequest, BuildManifestRequest, CapabilityRegistry,
    CheckSkillUpdateRequest, ContextItemStatus, ContractsResponse, CopySkillRequest,
    DeletedProjectView, EditSkillRequest, EstimateRunRequest, Fixture, GENESIS_HASH,
    GenUiValidation, GitHubSourceError, Hunk, Ledger, LedgerCaps, LedgerError, LibrarySkill,
    Manifest, ManifestError, ModelCapability, Project, ProjectEntry, Proposal, ProposalError,
    RejectProposalRequest, Rejection, RejectionReason, RequestContext, RequiredInput, Reservation,
    ReserveRunRequest, RestoreError, RevertRevisionRequest, Revision, RunEstimate, SECONDS_PER_DAY,
    SettleRunRequest, Settlement, SkillCheckRequest, SkillHistoryEntry, SkillLibrary,
    SkillLibraryError, SkillSourceKind, SkillUpdateOutcome, SkillsResponse, Stage, UpdateCheck,
    UsageSnapshot, accept, build_context, build_manifest, check_update, days_left, delete,
    estimate, reject, restore, revert, sample_contracts, sample_evidence, sample_matrix,
    validate_genui_json,
};

/// The project id the sample fixture is served under. The URL uses it: /p/meranti-yard/design.
pub const SAMPLE_PROJECT_ID: &str = "meranti-yard";

/// Actor recorded on audit entries until authentication exists (IMP-31).
const SAMPLE_ACTOR: &str = "sample-user";

/// Fixed UTC seconds (2025-01-01T00:00:00Z) used for audit entries and the restore window,
/// so every route is deterministic. Tests can override it with [`AppState::with_now`].
pub const DEFAULT_NOW: i64 = 1_735_689_600;

/// Mutable in-memory state for one project, seeded from `fixtures/meranti-yard.json`.
struct ProjectStore {
    revisions: BTreeMap<String, Revision>,
    proposals: BTreeMap<String, Proposal>,
    rejections: Vec<Rejection>,
    ledger: Ledger,
    board: BoardSnapshot,
    handoff_revisions: Vec<ArtifactRevisionRecord>,
    required_inputs: Vec<RequiredInput>,
    /// The append-only audit chain (IMP-30).
    audit: AuditLog,
    /// The head hash held *apart* from the log, as the lead's follow-up on #21 asks.
    /// Every append updates this; `GET .../audit` checks verify against it.
    audit_head: String,
    /// IMP-29 entries for delete / restore / Recently deleted.
    project_entries: BTreeMap<String, ProjectEntry>,
}

#[derive(Clone)]
pub struct AppState {
    pub sample: Arc<Fixture>,
    models: Arc<CapabilityRegistry>,
    project_store: Arc<Mutex<ProjectStore>>,
    /// IMP-34: the in-memory skills library (templates, copies, GitHub skills).
    library: Arc<Mutex<SkillLibrary>>,
    /// IMP-34: the GitHub adapter with an injected client (fixtures in tests).
    github: Arc<DynGitHubSkillSource>,
    /// UTC Unix seconds for audit entries and the 30-day restore window.
    now: i64,
    /// IMP-32 hardening values and the redacted rejection log.
    pub config: HardeningConfig,
}

impl AppState {
    pub fn from_fixture_json(text: &str) -> Result<Self, spekin_core::FixtureError> {
        let sample = Fixture::from_json(text)?;
        let raw: Value = serde_json::from_str(text).unwrap_or(Value::Null);
        let store = seed_project_store(&raw, DEFAULT_NOW);
        Ok(Self {
            sample: Arc::new(sample),
            models: Arc::new(CapabilityRegistry::sample_s36()),
            project_store: Arc::new(Mutex::new(store)),
            library: Arc::new(Mutex::new(SkillLibrary::from_fixture(&raw))),
            github: Arc::new(injected_source(HttpGitHubClient::new())),
            now: DEFAULT_NOW,
            config: HardeningConfig::from_env(),
        })
    }

    /// Inject a GitHub client (recorded fixtures in tests, never the network).
    pub fn with_github_client<C: skills::github::GitHubClient + 'static>(
        mut self,
        client: C,
    ) -> Self {
        self.github = Arc::new(injected_source(client));
        self
    }

    /// Start from an empty skills library (tests that install GitHub skills cleanly).
    pub fn with_library(mut self, library: SkillLibrary) -> Self {
        self.library = Arc::new(Mutex::new(library));
        self
    }

    /// Override the clock used by audit and restore routes, for deterministic tests.
    pub fn with_now(mut self, now: i64) -> Self {
        self.now = now;
        self
    }

    /// IMP-32: the fixed, redacted reason strings recorded by hardening layers.
    /// No request body, token or path is ever included.
    pub fn log_lines(&self) -> Vec<String> {
        self.config.log.lines()
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

/// Append one audit entry and move the separately held head to it (IMP-31).
/// The core computes the sequence, hashes and UTC time; the server only supplies the facts.
fn append_audit(
    store: &mut ProjectStore,
    now: i64,
    action: AuditAction,
    target_id: impl Into<String>,
    revision: Option<String>,
    reason: impl Into<String>,
) -> AuditEntry {
    let entry = store.audit.append(
        AuditEvent {
            actor: SAMPLE_ACTOR.to_owned(),
            action,
            target_id: target_id.into(),
            revision,
            reason: reason.into(),
        },
        now.max(0) as u64,
    );
    store.audit_head = entry.hash.clone();
    entry
}

/// Hash of the last entry, or the genesis anchor when the log is empty.
fn tail_hash(log: &AuditLog) -> String {
    log.entries()
        .last()
        .map_or_else(|| GENESIS_HASH.to_owned(), |e| e.hash.clone())
}

fn map_restore_error(err: RestoreError) -> ServerError {
    let message = err.to_string();
    match err {
        RestoreError::NotDeleted => ServerError::conflict("not_deleted", message),
        RestoreError::AlreadyDeleted => ServerError::conflict("already_deleted", message),
        RestoreError::WindowClosed { .. } => ServerError::conflict("window_closed", message),
        RestoreError::ClockBackwards { .. } => {
            ServerError::unprocessable("clock_backwards", message)
        }
    }
}

pub fn router(state: AppState) -> Router {
    let hardening = state.config.clone();
    let app = Router::new()
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
        .route(
            "/api/projects/{id}/revisions/{artifact}/revert",
            post(revert_revision),
        )
        .route("/api/projects/{id}/runs/estimate", post(estimate_run))
        .route("/api/projects/{id}/runs/reserve", post(reserve_run))
        .route("/api/projects/{id}/runs/settle", post(settle_run))
        .route("/api/projects/{id}/usage", get(project_usage))
        .route("/api/projects/{id}/audit", get(project_audit))
        .route("/api/projects/{id}/contracts", get(project_contracts))
        .route("/api/projects/{id}/delete", post(delete_project))
        .route("/api/projects/{id}/restore", post(restore_project))
        .route("/api/projects/deleted", get(deleted_projects))
        .route("/api/models", get(list_models))
        .route("/api/genui/validate", post(validate_genui))
        .route("/api/skills/check-update", post(check_skill_update))
        .route("/api/skills", get(list_skills))
        .route("/api/skills/github", post(add_github_skill))
        .route("/api/skills/{id}", put(edit_skill))
        .route("/api/skills/{id}/copy", post(copy_skill))
        .route("/api/skills/{id}/check", post(check_skill))
        .route("/api/skills/{id}/history", get(skill_history))
        .route("/api/skills/{id}/rollback/{version}", post(rollback_skill))
        .route("/api/projects/{id}/context", post(project_context))
        .route(
            "/api/projects/{id}/handoff/manifest",
            post(project_handoff_manifest),
        )
        .with_state(state);
    apply_hardening(app, hardening)
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
            append_audit(
                &mut store,
                s.now,
                AuditAction::Accept,
                &pid,
                Some(format!("r{}", next_rev.n)),
                format!("accepted proposal {pid}"),
            );
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
    append_audit(
        &mut store,
        s.now,
        AuditAction::Reject,
        &pid,
        Some(format!("r{}", proposal.base)),
        reason,
    );
    Ok(Json(rejection))
}

/// Revert one artifact to the content of an earlier revision, writing a new revision
/// and exactly one audit entry (IMP-31, C-03).
async fn revert_revision(
    State(s): State<AppState>,
    Path((id, artifact)): Path<(String, String)>,
    Json(req): Json<RevertRevisionRequest>,
) -> Result<Json<Revision>, ServerError> {
    ensure_project(&id)?;
    let mut store = s.project_store.lock().expect("project store lock");
    let current = store.revisions.get(&artifact).cloned().ok_or_else(|| {
        ServerError::not_found(
            "artifact_not_found",
            format!("unknown artifact: {artifact}"),
        )
    })?;
    let next = revert(&current, &req.to).map_err(map_proposal_error)?;
    store.revisions.insert(artifact.clone(), next.clone());
    append_audit(
        &mut store,
        s.now,
        AuditAction::Revert,
        &artifact,
        Some(format!("r{}", next.n)),
        format!("reverted {artifact} to r{}", req.to.n),
    );
    Ok(Json(next))
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
    let reservation = store
        .ledger
        .reserve(req.run_id, req.person_id, req.idempotency_key, &est)
        .map_err(map_ledger_error)?;
    append_audit(
        &mut store,
        s.now,
        AuditAction::Reserve,
        &reservation.run_id,
        None,
        format!(
            "reserved {} cr for run {}",
            reservation.reserved, reservation.run_id
        ),
    );
    Ok(Json(reservation))
}

/// Settle a reserved run at its actual cost, with one audit entry (IMP-31).
async fn settle_run(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<SettleRunRequest>,
) -> Result<Json<Settlement>, ServerError> {
    ensure_project(&id)?;
    let mut store = s.project_store.lock().expect("project store lock");
    let settlement = store
        .ledger
        .settle(&req.run_id, req.actual)
        .map_err(map_ledger_error)?;
    append_audit(
        &mut store,
        s.now,
        AuditAction::Settle,
        &req.run_id,
        None,
        format!("settled run {} at {} cr", req.run_id, req.actual),
    );
    Ok(Json(settlement))
}

async fn project_usage(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<UsageSnapshot>, ServerError> {
    ensure_project(&id)?;
    let store = s.project_store.lock().expect("project store lock");
    Ok(Json(store.ledger.project_usage()))
}

/// The audit chain plus the result of `verify` checked against the head hash the
/// server holds apart from the log (IMP-31, lead's follow-up on #21).
async fn project_audit(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<AuditResponse>, ServerError> {
    ensure_project(&id)?;
    let store = s.project_store.lock().expect("project store lock");
    let error = match store.audit.verify() {
        Err(err) => Some(err),
        Ok(()) if store.audit_head != tail_hash(&store.audit) => Some(AuditError::Truncated {
            seq: store.audit.len() as u64 + 1,
        }),
        Ok(()) => None,
    };
    Ok(Json(AuditResponse {
        entries: store.audit.entries().to_vec(),
        head_hash: store.audit_head.clone(),
        error,
    }))
}

/// S37 build contracts, evidence and matrix (IMP-33). The core seeds the sample
/// shapes from the board; the server only loads them and returns typed JSON.
async fn project_contracts(Path(id): Path<String>) -> Result<Json<ContractsResponse>, ServerError> {
    ensure_project(&id)?;
    Ok(Json(ContractsResponse {
        contracts: sample_contracts(),
        evidence: sample_evidence(),
        matrix: sample_matrix(),
    }))
}

/// Mark a live project deleted through the IMP-29 core and audit the action (IMP-31).
async fn delete_project(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ProjectEntry>, ServerError> {
    let mut store = s.project_store.lock().expect("project store lock");
    let entry = store.project_entries.get(&id).cloned().ok_or_else(|| {
        ServerError::not_found("project_not_found", format!("unknown project: {id}"))
    })?;
    let deleted = delete(entry, s.now).map_err(map_restore_error)?;
    store.project_entries.insert(id.clone(), deleted.clone());
    append_audit(
        &mut store,
        s.now,
        AuditAction::Delete,
        &id,
        None,
        "project deleted (S27)",
    );
    Ok(Json(deleted))
}

/// Restore a recently deleted project inside the 30-day window and audit it (IMP-31).
async fn restore_project(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ProjectEntry>, ServerError> {
    let mut store = s.project_store.lock().expect("project store lock");
    let entry = store.project_entries.get(&id).cloned().ok_or_else(|| {
        ServerError::not_found("project_not_found", format!("unknown project: {id}"))
    })?;
    let restored = restore(entry, s.now).map_err(map_restore_error)?;
    store.project_entries.insert(id.clone(), restored.clone());
    append_audit(
        &mut store,
        s.now,
        AuditAction::Restore,
        &id,
        None,
        "project restored (S27)",
    );
    Ok(Json(restored))
}

/// Recently deleted entries with the whole-day countdown S27 shows (IMP-31).
async fn deleted_projects(State(s): State<AppState>) -> Json<Vec<DeletedProjectView>> {
    let store = s.project_store.lock().expect("project store lock");
    let mut rows: Vec<DeletedProjectView> = store
        .project_entries
        .values()
        .filter(|entry| entry.is_deleted())
        .map(|entry| DeletedProjectView {
            entry: entry.clone(),
            days_left: days_left(entry, s.now),
        })
        .collect();
    rows.sort_by(|a, b| a.entry.id.cmp(&b.entry.id));
    Json(rows)
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

/// `GET /api/skills`: templates, user copies and GitHub sources with their policy (IMP-34).
async fn list_skills(State(s): State<AppState>) -> Json<SkillsResponse> {
    let library = s.library.lock().expect("skills library lock");
    Json(library.response())
}

/// `POST /api/skills/{id}/copy`: a template becomes the user's own version 1 (IMP-34).
async fn copy_skill(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<CopySkillRequest>,
) -> Result<Json<LibrarySkill>, ServerError> {
    let mut library = s.library.lock().expect("skills library lock");
    library
        .copy_template(&id, req.new_id, req.new_title, s.now)
        .map(Json)
        .map_err(map_library_error)
}

/// `PUT /api/skills/{id}`: edit a user copy, storing a new version (IMP-34).
async fn edit_skill(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<EditSkillRequest>,
) -> Result<Json<LibrarySkill>, ServerError> {
    let mut library = s.library.lock().expect("skills library lock");
    library
        .edit(&id, req.into(), s.now)
        .map(Json)
        .map_err(map_library_error)
}

/// `POST /api/skills/github`: resolve a ref to a SHA and store the fetched bundle (IMP-34).
async fn add_github_skill(
    State(s): State<AppState>,
    Json(req): Json<AddGithubSkillRequest>,
) -> Result<Json<LibrarySkill>, ServerError> {
    let pinned = s
        .github
        .resolve(&req.repo, &req.path, &req.git_ref)
        .await
        .map_err(map_github_error)?;
    let bundle = s.github.fetch(&pinned).await.map_err(map_github_error)?;
    let mut library = s.library.lock().expect("skills library lock");
    library
        .add_github(bundle, req.policy, s.now)
        .map(Json)
        .map_err(map_library_error)
}

/// `POST /api/skills/{id}/check`: run the update check. An applied update makes a new
/// version; a held one stores the diff and reasons and changes nothing (ADR 0007).
async fn check_skill(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<SkillCheckRequest>,
) -> Result<Json<SkillUpdateOutcome>, ServerError> {
    // Read what we need, then drop the guard: the adapter awaits IO and a MutexGuard
    // cannot be held across an await in an Axum handler.
    let (skill, bundle, policy) = {
        let library = s.library.lock().expect("skills library lock");
        let skill = library.get(&id).ok_or_else(|| {
            ServerError::not_found("skill_not_found", format!("unknown skill: {id}"))
        })?;
        let policy = req.policy.unwrap_or(skill.policy);
        let bundle = if skill.kind == SkillSourceKind::Github {
            Some(library.bundle(&id).ok_or_else(|| {
                ServerError::not_found("skill_bundle_missing", format!("no bundle for skill: {id}"))
            })?)
        } else {
            None
        };
        (skill, bundle, policy)
    };

    let (check, new_manifest) = if let Some(bundle) = bundle {
        let check = s
            .github
            .check(&bundle, policy)
            .await
            .map_err(map_github_error)?;
        let fresh = s
            .github
            .fetch_latest(&bundle)
            .await
            .map_err(map_github_error)?;
        (check, fresh.manifest)
    } else {
        let new = req.new.ok_or_else(|| {
            ServerError::conflict(
                "no_upstream",
                format!("skill {id} has no upstream to check"),
            )
        })?;
        if new.id != id {
            return Err(ServerError::bad_request(
                "skill_id_mismatch",
                format!("candidate skill id '{}' does not match {id}", new.id),
            ));
        }
        (check_update(&skill.manifest, &new, policy), new)
    };

    let diff = SkillLibrary::diff_text(&skill.manifest.body, &new_manifest.body);
    let mut library = s.library.lock().expect("skills library lock");
    let outcome = library
        .record_update(&id, &check, new_manifest, diff, s.now)
        .map_err(map_library_error)?;
    let (action, reason) = match &outcome {
        SkillUpdateOutcome::Applied { version, .. } => (
            AuditAction::SkillUpdateApplied,
            format!("applied skill update to {id} version {version}"),
        ),
        SkillUpdateOutcome::Held { held, .. } => (
            AuditAction::SkillUpdateHeld,
            format!(
                "held skill update for {id}: {} reason(s)",
                held.reasons.len()
            ),
        ),
    };
    let mut store = s.project_store.lock().expect("project store lock");
    append_audit(&mut store, s.now, action, &id, None, reason);
    Ok(Json(outcome))
}

/// `GET /api/skills/{id}/history`: every version and update decision in order (IMP-34).
async fn skill_history(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<SkillHistoryEntry>>, ServerError> {
    let library = s.library.lock().expect("skills library lock");
    if library.get(&id).is_none() {
        return Err(ServerError::not_found(
            "skill_not_found",
            format!("unknown skill: {id}"),
        ));
    }
    Ok(Json(library.history(&id)))
}

/// `POST /api/skills/{id}/rollback/{version}`: restore any version as a new one (IMP-34).
async fn rollback_skill(
    State(s): State<AppState>,
    Path((id, version)): Path<(String, String)>,
) -> Result<Json<LibrarySkill>, ServerError> {
    let mut library = s.library.lock().expect("skills library lock");
    let skill = library
        .rollback(&id, &version, s.now)
        .map_err(map_library_error)?;
    let mut store = s.project_store.lock().expect("project store lock");
    append_audit(
        &mut store,
        s.now,
        AuditAction::Revert,
        &id,
        Some(format!("v{}", skill.manifest.version)),
        format!("rolled back skill {id} to version {version}"),
    );
    Ok(Json(skill))
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

fn map_library_error(err: SkillLibraryError) -> ServerError {
    let message = err.to_string();
    match err {
        SkillLibraryError::NotFound { .. } => ServerError::not_found("skill_not_found", message),
        SkillLibraryError::VersionNotFound { .. } => {
            ServerError::not_found("version_not_found", message)
        }
        SkillLibraryError::TemplateImmutable { .. } => {
            ServerError::conflict("template_immutable", message)
        }
        SkillLibraryError::NotEditable { .. } => ServerError::conflict("not_editable", message),
        SkillLibraryError::DuplicateId { .. } => {
            ServerError::conflict("duplicate_skill_id", message)
        }
        SkillLibraryError::EmptyCopyId => ServerError::bad_request("empty_copy_id", message),
    }
}

fn map_github_error(err: GitHubSourceError) -> ServerError {
    let message = err.to_string();
    match err {
        GitHubSourceError::InvalidRepoUrl { .. }
        | GitHubSourceError::UnsupportedHost { .. }
        | GitHubSourceError::InvalidPath { .. }
        | GitHubSourceError::RefNotFound { .. } => {
            ServerError::bad_request("invalid_repo_url", message)
        }
        GitHubSourceError::NoLicense { .. }
        | GitHubSourceError::InvalidSkill { .. }
        | GitHubSourceError::MissingFile { .. }
        | GitHubSourceError::FileTooLarge { .. }
        | GitHubSourceError::BundleTooLarge { .. }
        | GitHubSourceError::TooManyFiles { .. } => {
            ServerError::unprocessable("invalid_skill_bundle", message)
        }
        GitHubSourceError::Transport { .. } => {
            ServerError::new(StatusCode::BAD_GATEWAY, "github_transport", message)
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
fn seed_project_store(raw: &Value, now: i64) -> ProjectStore {
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

    // 5. Projects for delete / restore (IMP-29) and the audit chain (IMP-30/31).
    let sample_project: Project =
        serde_json::from_value(raw["PROJECT"].clone()).unwrap_or(Project {
            name: "Meranti Yard".to_owned(),
            product: "Cost variance dashboard".to_owned(),
            increment: "Inc. 2 · Variance alerts".to_owned(),
            spec: "r14".to_owned(),
            user: "Rina (sample)".to_owned(),
            initials: "RS".to_owned(),
        });
    let mut project_entries = BTreeMap::new();
    project_entries.insert(
        SAMPLE_PROJECT_ID.to_owned(),
        ProjectEntry::new(
            SAMPLE_PROJECT_ID,
            sample_project.clone(),
            vec!["r14".to_owned()],
            now,
        ),
    );
    // The fixture's Recently deleted row (INTAKE_DELETED) seeds one entry three days into
    // the 30-day window, so S27's "27 days left" is served without a clock or a database.
    if let Some(deleted) = raw["INTAKE_DELETED"].as_object() {
        let id = deleted["id"].as_str().unwrap_or("kenari-fleet").to_owned();
        let deleted_at = now - 3 * SECONDS_PER_DAY;
        let mut entry = ProjectEntry::new(
            id.clone(),
            Project {
                name: "Kenari Fleet".to_owned(),
                ..sample_project
            },
            vec![
                "r1".to_owned(),
                "r2".to_owned(),
                "r3".to_owned(),
                "r4".to_owned(),
            ],
            deleted_at,
        );
        entry.deleted_at = Some(deleted_at);
        project_entries.insert(id, entry);
    }

    ProjectStore {
        revisions,
        proposals,
        rejections: Vec::new(),
        ledger,
        board,
        handoff_revisions,
        required_inputs,
        audit: AuditLog::new(),
        audit_head: GENESIS_HASH.to_owned(),
        project_entries,
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

    /// IMP-31 / lead's follow-up on #21: the head is held apart from the log, and
    /// the audit route reports a broken anchor even when the entries are untouched.
    #[tokio::test]
    async fn audit_head_is_checked_apart_from_the_log() {
        let state = AppState::from_fixture_json(SAMPLE).unwrap();
        {
            let mut store = state.project_store.lock().expect("project store lock");
            append_audit(
                &mut store,
                state.now,
                AuditAction::Accept,
                "P-07",
                Some("r15".to_owned()),
                "accepted proposal P-07",
            );
        }
        let Json(view) = project_audit(State(state.clone()), Path(SAMPLE_PROJECT_ID.to_owned()))
            .await
            .ok()
            .expect("audit route");
        assert_eq!(view.error, None, "a fresh chain verifies");
        assert_eq!(view.entries.len(), 1);
        let head = view.head_hash.clone();

        // Tamper only with the separately held head: the log is unchanged.
        state
            .project_store
            .lock()
            .expect("project store lock")
            .audit_head = "deadbeef".to_owned();
        let Json(broken) = project_audit(State(state), Path(SAMPLE_PROJECT_ID.to_owned()))
            .await
            .ok()
            .expect("audit route");
        assert_eq!(broken.head_hash, "deadbeef");
        assert_eq!(broken.entries.len(), 1, "the log itself was not edited");
        assert!(
            matches!(broken.error, Some(AuditError::Truncated { seq: 2 })),
            "the broken separate head is reported at the next sequence: {:?}",
            broken.error
        );
        assert_ne!(head, "deadbeef");
    }
}
