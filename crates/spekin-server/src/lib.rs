//! Spekin HTTP API. Routes live here so tests can call them without a socket.
//!
//! The server reads and writes everything through the [`spekin_core::Store`] trait
//! (ADR 0008): [`Backend::Memory`] by default, [`Backend::Pg`] when `DATABASE_URL`
//! is set. All business rules stay in `spekin-core`; the server only loads data and
//! calls the core.

pub mod hardening;
pub mod seed;
pub mod skills;

use std::sync::Arc;

use async_trait::async_trait;
use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post, put},
};
use hardening::{HardeningConfig, apply_hardening};
use seed::{SAMPLE_PROJECT_ID, seed_from_fixture};
use skills::github::{DynGitHubSkillSource, HttpGitHubClient, injected_source};
use spekin_core::{
    AddGithubSkillRequest, ApiErrorBody, AuditAction, AuditEvent, AuditLog, AuditResponse,
    BuildContextRequest, BuildManifestRequest, CapabilityRegistry, CheckSkillUpdateRequest,
    ContractsResponse, CopySkillRequest, DeletedProjectView, EditSkillRequest, EstimateRunRequest,
    GenUiValidation, GitHubSourceError, LedgerError, LibrarySkill, Manifest, ManifestError,
    MemoryStore, ModelCapability, Project, ProjectEntry, ProjectState, ProposalError,
    RejectProposalRequest, Rejection, RejectionReason, RequestContext, Reservation,
    ReserveRunRequest, RestoreError, RevertRevisionRequest, Revision, RunEstimate,
    SettleRunRequest, Settlement, SkillCheckRequest, SkillHistoryEntry, SkillLibrary,
    SkillLibraryError, SkillSourceKind, SkillUpdateOutcome, SkillsResponse, Stage, Store,
    StoreError, UpdateCheck, UsageSnapshot, accept, build_context, build_manifest, check_update,
    days_left, delete, estimate, reject, restore, revert, sample_contracts, sample_evidence,
    sample_matrix, validate_genui_json, verify_with_head,
};
use spekin_store_pg::PgStore;

/// Actor recorded on audit entries until authentication exists (IMP-31).
const SAMPLE_ACTOR: &str = "sample-user";

/// Fixed UTC seconds (2025-01-01T00:00:00Z) used for audit entries and the restore window,
/// so every route is deterministic. Tests can override it with [`AppState::with_now`].
pub const DEFAULT_NOW: i64 = 1_735_689_600;

/// The active store. The server picks [`Backend::Pg`] when `DATABASE_URL` is set,
/// otherwise [`Backend::Memory`] seeded from the sample fixture (ADR 0008).
#[derive(Clone)]
pub enum Backend {
    Memory(MemoryStore),
    Pg(PgStore),
}

#[async_trait]
impl Store for Backend {
    async fn project(&self, id: &str) -> Result<Option<Project>, StoreError> {
        match self {
            Backend::Memory(m) => m.project(id).await,
            Backend::Pg(p) => p.project(id).await,
        }
    }

    async fn stages(&self, id: &str) -> Result<Option<Vec<Stage>>, StoreError> {
        match self {
            Backend::Memory(m) => m.stages(id).await,
            Backend::Pg(p) => p.stages(id).await,
        }
    }

    async fn revision(&self, id: &str, artifact: &str) -> Result<Option<Revision>, StoreError> {
        match self {
            Backend::Memory(m) => m.revision(id, artifact).await,
            Backend::Pg(p) => p.revision(id, artifact).await,
        }
    }

    async fn update_revision(
        &self,
        id: &str,
        artifact: &str,
        base: u32,
        next: &Revision,
    ) -> Result<(), StoreError> {
        match self {
            Backend::Memory(m) => m.update_revision(id, artifact, base, next).await,
            Backend::Pg(p) => p.update_revision(id, artifact, base, next).await,
        }
    }

    async fn load_state(&self, id: &str) -> Result<Option<ProjectState>, StoreError> {
        match self {
            Backend::Memory(m) => m.load_state(id).await,
            Backend::Pg(p) => p.load_state(id).await,
        }
    }

    async fn save_state(&self, id: &str, state: &ProjectState) -> Result<(), StoreError> {
        match self {
            Backend::Memory(m) => m.save_state(id, state).await,
            Backend::Pg(p) => p.save_state(id, state).await,
        }
    }

    async fn entries(
        &self,
    ) -> Result<std::collections::BTreeMap<String, ProjectEntry>, StoreError> {
        match self {
            Backend::Memory(m) => m.entries().await,
            Backend::Pg(p) => p.entries().await,
        }
    }

    async fn put_entry(&self, entry: &ProjectEntry) -> Result<(), StoreError> {
        match self {
            Backend::Memory(m) => m.put_entry(entry).await,
            Backend::Pg(p) => p.put_entry(entry).await,
        }
    }

    async fn library(&self) -> Result<SkillLibrary, StoreError> {
        match self {
            Backend::Memory(m) => m.library().await,
            Backend::Pg(p) => p.library().await,
        }
    }

    async fn save_library(&self, library: &SkillLibrary) -> Result<(), StoreError> {
        match self {
            Backend::Memory(m) => m.save_library(library).await,
            Backend::Pg(p) => p.save_library(library).await,
        }
    }

    async fn skills_audit(&self) -> Result<(AuditLog, String), StoreError> {
        match self {
            Backend::Memory(m) => m.skills_audit().await,
            Backend::Pg(p) => p.skills_audit().await,
        }
    }

    async fn save_skills_audit(&self, log: &AuditLog, head: &str) -> Result<(), StoreError> {
        match self {
            Backend::Memory(m) => m.save_skills_audit(log, head).await,
            Backend::Pg(p) => p.save_skills_audit(log, head).await,
        }
    }
}

#[derive(Clone)]
pub struct AppState {
    pub store: Backend,
    models: Arc<CapabilityRegistry>,
    /// IMP-34: the GitHub adapter with an injected client (fixtures in tests).
    github: Arc<DynGitHubSkillSource>,
    /// UTC Unix seconds for audit entries and the 30-day restore window.
    now: i64,
    /// IMP-32 hardening values and the redacted rejection log.
    pub config: HardeningConfig,
}

impl AppState {
    /// The in-memory default: seed Meranti Yard and serve it through `MemoryStore`.
    pub fn from_fixture_json(text: &str) -> Result<Self, spekin_core::FixtureError> {
        let (project_id, seed) = seed_from_fixture(text, DEFAULT_NOW)?;
        Ok(Self::with_store(Backend::Memory(MemoryStore::from_seed(
            project_id, seed,
        ))))
    }

    /// Build an `AppState` around an already-constructed store (e.g. `PgStore`).
    pub fn with_store(store: Backend) -> Self {
        Self {
            store,
            models: Arc::new(CapabilityRegistry::sample_s36()),
            github: Arc::new(injected_source(HttpGitHubClient::new())),
            now: DEFAULT_NOW,
            config: HardeningConfig::from_env(),
        }
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
    /// Only meaningful for the in-memory store used in tests.
    pub fn with_library(self, library: SkillLibrary) -> Self {
        if let Backend::Memory(store) = &self.store {
            store.set_library(library);
        }
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
#[derive(Debug)]
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

/// Append one audit entry to the sample project's chain and move its separately
/// held head to the entry (IMP-31). The core computes the sequence, hashes and
/// UTC time; the server only supplies the facts.
fn audit_event(
    state: &mut ProjectState,
    now: i64,
    action: AuditAction,
    target_id: impl Into<String>,
    revision: Option<String>,
    reason: impl Into<String>,
) {
    let entry = state.audit.append(
        AuditEvent {
            actor: SAMPLE_ACTOR.to_owned(),
            action,
            target_id: target_id.into(),
            revision,
            reason: reason.into(),
        },
        now.max(0) as u64,
    );
    state.audit_head = entry.hash.clone();
}

/// Append one entry to the skills library's own chain and move its separately
/// held head. A skills route never touches a project's chain (IMP-35).
async fn append_skills_audit(
    state: &AppState,
    action: AuditAction,
    target_id: impl Into<String>,
    revision: Option<String>,
    reason: impl Into<String>,
) -> Result<(), ServerError> {
    let (mut log, _head) = state.store.skills_audit().await.map_err(map_store_error)?;
    let entry = log.append(
        AuditEvent {
            actor: SAMPLE_ACTOR.to_owned(),
            action,
            target_id: target_id.into(),
            revision,
            reason: reason.into(),
        },
        state.now.max(0) as u64,
    );
    let head = entry.hash.clone();
    state
        .store
        .save_skills_audit(&log, &head)
        .await
        .map_err(map_store_error)?;
    Ok(())
}

/// The view both audit routes return: the entries, the head held apart from the
/// log, and the typed verify result against that head (IMP-35).
fn audit_response(log: &AuditLog, head: &str) -> AuditResponse {
    AuditResponse {
        entries: log.entries().to_vec(),
        head_hash: head.to_owned(),
        error: verify_with_head(log, head).err(),
    }
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

fn map_store_error(err: StoreError) -> ServerError {
    let message = err.to_string();
    match err {
        StoreError::NotFound(_) => ServerError::not_found("not_found", message),
        StoreError::StaleRevision { .. } => ServerError::conflict("proposal_stale", message),
        StoreError::Backend(_) => {
            ServerError::new(StatusCode::INTERNAL_SERVER_ERROR, "store_error", message)
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
        .route("/api/skills/audit", get(skills_audit))
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

/// Load a project's mutable state, or a 404 for an unknown project.
async fn load_state(s: &AppState, id: &str) -> Result<ProjectState, ServerError> {
    s.store
        .load_state(id)
        .await
        .map_err(map_store_error)?
        .ok_or_else(|| {
            ServerError::not_found("project_not_found", format!("unknown project: {id}"))
        })
}

async fn project(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Project>, ServerError> {
    let project = s
        .store
        .project(&id)
        .await
        .map_err(map_store_error)?
        .ok_or_else(|| {
            ServerError::not_found("project_not_found", format!("unknown project: {id}"))
        })?;
    Ok(Json(project))
}

async fn stages(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<Stage>>, ServerError> {
    let stages = s
        .store
        .stages(&id)
        .await
        .map_err(map_store_error)?
        .ok_or_else(|| {
            ServerError::not_found("project_not_found", format!("unknown project: {id}"))
        })?;
    Ok(Json(stages))
}

async fn accept_proposal(
    State(s): State<AppState>,
    Path((id, pid)): Path<(String, String)>,
) -> Result<Json<Revision>, ServerError> {
    let mut state = load_state(&s, &id).await?;
    let proposal = state.proposals.get(&pid).cloned().ok_or_else(|| {
        ServerError::not_found("proposal_not_found", format!("unknown proposal: {pid}"))
    })?;
    let current = s
        .store
        .revision(&id, &proposal.artifact)
        .await
        .map_err(map_store_error)?
        .ok_or_else(|| {
            ServerError::not_found(
                "artifact_not_found",
                format!("unknown artifact: {}", proposal.artifact),
            )
        })?;

    match accept(&current, &proposal) {
        Ok(next_rev) => {
            s.store
                .update_revision(&id, &proposal.artifact, current.n, &next_rev)
                .await
                .map_err(map_store_error)?;
            audit_event(
                &mut state,
                s.now,
                AuditAction::Accept,
                &pid,
                Some(format!("r{}", next_rev.n)),
                format!("accepted proposal {pid}"),
            );
            s.store
                .save_state(&id, &state)
                .await
                .map_err(map_store_error)?;
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
    let reason = req.reason.trim();
    if reason.is_empty() {
        return Err(ServerError::bad_request(
            "empty_reason",
            "rejection reason must not be empty",
        ));
    }
    let mut state = load_state(&s, &id).await?;
    let proposal = state.proposals.get(&pid).cloned().ok_or_else(|| {
        ServerError::not_found("proposal_not_found", format!("unknown proposal: {pid}"))
    })?;
    let rejection = reject(&proposal, reason);
    state.rejections.push(rejection.clone());
    audit_event(
        &mut state,
        s.now,
        AuditAction::Reject,
        &pid,
        Some(format!("r{}", proposal.base)),
        reason,
    );
    s.store
        .save_state(&id, &state)
        .await
        .map_err(map_store_error)?;
    Ok(Json(rejection))
}

/// Revert one artifact to the content of an earlier revision, writing a new revision
/// and exactly one audit entry (IMP-31, C-03).
async fn revert_revision(
    State(s): State<AppState>,
    Path((id, artifact)): Path<(String, String)>,
    Json(req): Json<RevertRevisionRequest>,
) -> Result<Json<Revision>, ServerError> {
    let mut state = load_state(&s, &id).await?;
    let current = s
        .store
        .revision(&id, &artifact)
        .await
        .map_err(map_store_error)?
        .ok_or_else(|| {
            ServerError::not_found(
                "artifact_not_found",
                format!("unknown artifact: {artifact}"),
            )
        })?;
    let next = revert(&current, &req.to).map_err(map_proposal_error)?;
    s.store
        .update_revision(&id, &artifact, current.n, &next)
        .await
        .map_err(map_store_error)?;
    audit_event(
        &mut state,
        s.now,
        AuditAction::Revert,
        &artifact,
        Some(format!("r{}", next.n)),
        format!("reverted {artifact} to r{}", req.to.n),
    );
    s.store
        .save_state(&id, &state)
        .await
        .map_err(map_store_error)?;
    Ok(Json(next))
}

async fn estimate_run(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<EstimateRunRequest>,
) -> Result<Json<RunEstimate>, ServerError> {
    load_state(&s, &id).await?;
    estimate(req.min, req.max, req.reserve)
        .map(Json)
        .map_err(map_ledger_error)
}

async fn reserve_run(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<ReserveRunRequest>,
) -> Result<Json<Reservation>, ServerError> {
    let est = estimate(req.estimate.min, req.estimate.max, req.estimate.reserve)
        .map_err(map_ledger_error)?;
    let mut state = load_state(&s, &id).await?;
    let reservation = state
        .ledger
        .reserve(req.run_id, req.person_id, req.idempotency_key, &est)
        .map_err(map_ledger_error)?;
    audit_event(
        &mut state,
        s.now,
        AuditAction::Reserve,
        &reservation.run_id,
        None,
        format!(
            "reserved {} cr for run {}",
            reservation.reserved, reservation.run_id
        ),
    );
    s.store
        .save_state(&id, &state)
        .await
        .map_err(map_store_error)?;
    Ok(Json(reservation))
}

/// Settle a reserved run at its actual cost, with one audit entry (IMP-31).
async fn settle_run(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<SettleRunRequest>,
) -> Result<Json<Settlement>, ServerError> {
    let mut state = load_state(&s, &id).await?;
    let settlement = state
        .ledger
        .settle(&req.run_id, req.actual)
        .map_err(map_ledger_error)?;
    audit_event(
        &mut state,
        s.now,
        AuditAction::Settle,
        &req.run_id,
        None,
        format!("settled run {} at {} cr", req.run_id, req.actual),
    );
    s.store
        .save_state(&id, &state)
        .await
        .map_err(map_store_error)?;
    Ok(Json(settlement))
}

async fn project_usage(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<UsageSnapshot>, ServerError> {
    let state = load_state(&s, &id).await?;
    Ok(Json(state.ledger.project_usage()))
}

/// The audit chain plus the result of `verify` checked against the head hash the
/// server holds apart from the log (IMP-31, lead's follow-up on #21).
async fn project_audit(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<AuditResponse>, ServerError> {
    let state = load_state(&s, &id).await?;
    Ok(Json(audit_response(&state.audit, &state.audit_head)))
}

/// S37 build contracts, evidence and matrix (IMP-33). The core seeds the sample
/// shapes from the board; the server only loads them and returns typed JSON.
async fn project_contracts(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ContractsResponse>, ServerError> {
    load_state(&s, &id).await?;
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
    let entries = s.store.entries().await.map_err(map_store_error)?;
    let entry = entries.get(&id).cloned().ok_or_else(|| {
        ServerError::not_found("project_not_found", format!("unknown project: {id}"))
    })?;
    let deleted = delete(entry, s.now).map_err(map_restore_error)?;
    s.store.put_entry(&deleted).await.map_err(map_store_error)?;
    let mut state = load_state(&s, SAMPLE_PROJECT_ID).await?;
    audit_event(
        &mut state,
        s.now,
        AuditAction::Delete,
        &id,
        None,
        "project deleted (S27)",
    );
    s.store
        .save_state(SAMPLE_PROJECT_ID, &state)
        .await
        .map_err(map_store_error)?;
    Ok(Json(deleted))
}

/// Restore a recently deleted project inside the 30-day window and audit it (IMP-31).
async fn restore_project(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<ProjectEntry>, ServerError> {
    let entries = s.store.entries().await.map_err(map_store_error)?;
    let entry = entries.get(&id).cloned().ok_or_else(|| {
        ServerError::not_found("project_not_found", format!("unknown project: {id}"))
    })?;
    let restored = restore(entry, s.now).map_err(map_restore_error)?;
    s.store
        .put_entry(&restored)
        .await
        .map_err(map_store_error)?;
    let mut state = load_state(&s, SAMPLE_PROJECT_ID).await?;
    audit_event(
        &mut state,
        s.now,
        AuditAction::Restore,
        &id,
        None,
        "project restored (S27)",
    );
    s.store
        .save_state(SAMPLE_PROJECT_ID, &state)
        .await
        .map_err(map_store_error)?;
    Ok(Json(restored))
}

/// Recently deleted entries with the whole-day countdown S27 shows (IMP-31).
async fn deleted_projects(State(s): State<AppState>) -> Json<Vec<DeletedProjectView>> {
    let entries = match s.store.entries().await {
        Ok(entries) => entries,
        Err(_) => return Json(Vec::new()),
    };
    let mut rows: Vec<DeletedProjectView> = entries
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

/// `GET /api/skills/audit`: the skills library's own chain with `verify` checked
/// against the head the server keeps apart from the log (IMP-35).
async fn skills_audit(State(s): State<AppState>) -> Result<Json<AuditResponse>, ServerError> {
    let (log, head) = s.store.skills_audit().await.map_err(map_store_error)?;
    Ok(Json(audit_response(&log, &head)))
}

/// `GET /api/skills`: templates, user copies and GitHub sources with their policy (IMP-34).
async fn list_skills(State(s): State<AppState>) -> Result<Json<SkillsResponse>, ServerError> {
    let library = s.store.library().await.map_err(map_store_error)?;
    Ok(Json(library.response()))
}

/// `POST /api/skills/{id}/copy`: a template becomes the user's own version 1 (IMP-34).
async fn copy_skill(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<CopySkillRequest>,
) -> Result<Json<LibrarySkill>, ServerError> {
    let mut library = s.store.library().await.map_err(map_store_error)?;
    let skill = library
        .copy_template(&id, req.new_id, req.new_title, s.now)
        .map_err(map_library_error)?;
    s.store
        .save_library(&library)
        .await
        .map_err(map_store_error)?;
    Ok(Json(skill))
}

/// `PUT /api/skills/{id}`: edit a user copy, storing a new version (IMP-34).
async fn edit_skill(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<EditSkillRequest>,
) -> Result<Json<LibrarySkill>, ServerError> {
    let mut library = s.store.library().await.map_err(map_store_error)?;
    let skill = library
        .edit(&id, req.into(), s.now)
        .map_err(map_library_error)?;
    s.store
        .save_library(&library)
        .await
        .map_err(map_store_error)?;
    Ok(Json(skill))
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
    let mut library = s.store.library().await.map_err(map_store_error)?;
    let skill = library
        .add_github(bundle, req.policy, s.now)
        .map_err(map_library_error)?;
    s.store
        .save_library(&library)
        .await
        .map_err(map_store_error)?;
    Ok(Json(skill))
}

/// `POST /api/skills/{id}/check`: run the update check. An applied update makes a new
/// version; a held one stores the diff and reasons and changes nothing (ADR 0007).
async fn check_skill(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<SkillCheckRequest>,
) -> Result<Json<SkillUpdateOutcome>, ServerError> {
    // Read what we need, then drop the store's data: the adapter awaits IO.
    let (skill, bundle, policy) = {
        let library = s.store.library().await.map_err(map_store_error)?;
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
    let mut library = s.store.library().await.map_err(map_store_error)?;
    let outcome = library
        .record_update(&id, &check, new_manifest, diff, s.now)
        .map_err(map_library_error)?;
    s.store
        .save_library(&library)
        .await
        .map_err(map_store_error)?;

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
    append_skills_audit(&s, action, &id, None, reason).await?;
    Ok(Json(outcome))
}

/// `GET /api/skills/{id}/history`: every version and update decision in order (IMP-34).
async fn skill_history(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<SkillHistoryEntry>>, ServerError> {
    let library = s.store.library().await.map_err(map_store_error)?;
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
    let mut library = s.store.library().await.map_err(map_store_error)?;
    let skill = library
        .rollback(&id, &version, s.now)
        .map_err(map_library_error)?;
    s.store
        .save_library(&library)
        .await
        .map_err(map_store_error)?;
    append_skills_audit(
        &s,
        AuditAction::Revert,
        &id,
        Some(format!("v{}", skill.manifest.version)),
        format!("rolled back skill {id} to version {version}"),
    )
    .await?;
    Ok(Json(skill))
}

async fn project_context(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<BuildContextRequest>,
) -> Result<Json<RequestContext>, ServerError> {
    let state = load_state(&s, &id).await?;
    let board = req.board.as_ref().unwrap_or(&state.board);
    Ok(Json(build_context(&req.chips, board)))
}

async fn project_handoff_manifest(
    State(s): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<BuildManifestRequest>,
) -> Result<Json<Manifest>, ServerError> {
    let state = load_state(&s, &id).await?;
    let revisions = req.revisions.as_deref().unwrap_or(&state.handoff_revisions);
    let inputs = req.inputs.as_deref().unwrap_or(&state.required_inputs);
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

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::Request;
    use http_body_util::BodyExt;
    use spekin_core::AuditError;
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
        let mut store_state = state
            .store
            .load_state(SAMPLE_PROJECT_ID)
            .await
            .unwrap()
            .unwrap();
        audit_event(
            &mut store_state,
            state.now,
            AuditAction::Accept,
            "P-07",
            Some("r15".to_owned()),
            "accepted proposal P-07",
        );
        state
            .store
            .save_state(SAMPLE_PROJECT_ID, &store_state)
            .await
            .unwrap();

        let Json(view) = project_audit(State(state.clone()), Path(SAMPLE_PROJECT_ID.to_owned()))
            .await
            .expect("audit route");
        assert_eq!(view.error, None, "a fresh chain verifies");
        assert_eq!(view.entries.len(), 1);
        let head = view.head_hash.clone();

        // Tamper only with the separately held head: the log is unchanged.
        let mut tampered = state
            .store
            .load_state(SAMPLE_PROJECT_ID)
            .await
            .unwrap()
            .unwrap();
        tampered.audit_head = "deadbeef".to_owned();
        state
            .store
            .save_state(SAMPLE_PROJECT_ID, &tampered)
            .await
            .unwrap();
        let Json(broken) = project_audit(State(state), Path(SAMPLE_PROJECT_ID.to_owned()))
            .await
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

    /// IMP-35: the skills chain keeps its head apart too; a rewritten stored
    /// head cannot satisfy the route's verify check.
    #[tokio::test]
    async fn skills_audit_head_is_checked_apart_from_the_log() {
        let state = AppState::from_fixture_json(SAMPLE).expect("sample fixture is valid");
        append_skills_audit(
            &state,
            AuditAction::Revert,
            "grill",
            Some("v2".to_owned()),
            "rolled back skill grill",
        )
        .await
        .unwrap();
        let Json(view) = skills_audit(State(state.clone())).await.unwrap();
        assert_eq!(view.error, None, "a fresh chain verifies");
        let head = view.head_hash.clone();

        let (log, _head) = state.store.skills_audit().await.unwrap();
        state
            .store
            .save_skills_audit(&log, "deadbeef")
            .await
            .unwrap();
        let Json(broken) = skills_audit(State(state)).await.unwrap();
        assert_eq!(broken.head_hash, "deadbeef");
        assert_eq!(broken.entries.len(), 1, "the log itself was not edited");
        assert!(matches!(
            broken.error,
            Some(AuditError::Truncated { seq: 2 })
        ));
        assert_ne!(head, "deadbeef");
    }
}
