//! Storage boundary (ADR 0008).
//!
//! The [`Store`] trait names everything the server keeps today: projects, stages,
//! revisions and proposals, the credit ledger, the skills library and its versions,
//! the append-only audit chains (with their heads held apart), and the deleted
//! projects. The core stays pure: this module defines the *interface* and the
//! in-memory implementation, but no database code lives here. A Postgres
//! implementation lives in `spekin-store-pg`.

use std::collections::BTreeMap;
use std::sync::{Arc, Mutex};

use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use crate::{
    ArtifactRevisionRecord, AuditLog, BoardSnapshot, GENESIS_HASH, Ledger, Project, ProjectEntry,
    Proposal, Rejection, RequiredInput, Revision, SkillLibrary, Stage,
};

/// A typed persistence error. `StaleRevision` is the concurrency conflict: a
/// revision write whose `base` no longer matches the stored revision. The server
/// maps it to the same 409 body as the in-memory stale path (`ProposalError::Stale`).
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error, Serialize, Deserialize)]
pub enum StoreError {
    #[error("not found: {0}")]
    NotFound(String),
    #[error("revision is against r{base} but the artifact is at r{current}")]
    StaleRevision { base: u32, current: u32 },
    #[error("project state changed (loaded v{base}, now v{current}); re-read and retry")]
    StaleState { base: u64, current: u64 },
    #[error("store backend error: {0}")]
    Backend(String),
}

/// The mutable, per-project state the server persists (ADR 0008).
///
/// Revisions are deliberately *not* here: they are updated under a row lock by
/// [`Store::update_revision`] so a stale write is refused. Project entries for
/// delete/restore are also kept apart, in [`Store::entries`]/[`Store::put_entry`].
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ProjectState {
    /// Optimistic-concurrency version, bumped on every [`Store::save_state`]. Two
    /// writers that read the same version race; the second save is refused as
    /// [`StoreError::StaleState`] (IMP-40).
    #[serde(default = "initial_version")]
    pub version: u64,
    pub proposals: BTreeMap<String, Proposal>,
    pub rejections: Vec<Rejection>,
    pub ledger: Ledger,
    pub board: BoardSnapshot,
    pub handoff_revisions: Vec<ArtifactRevisionRecord>,
    pub required_inputs: Vec<RequiredInput>,
    /// The append-only audit chain, with its head held apart from the stored log.
    pub audit: AuditLog,
    pub audit_head: String,
}

/// The first version a fresh state starts at.
fn initial_version() -> u64 {
    1
}

/// The full seed for one project: everything a store needs to serve the sample
/// out of the box. Shared by [`MemoryStore::from_seed`] and `PgStore::seed`.
#[derive(Debug, Clone, PartialEq)]
pub struct StoreSeed {
    pub project: Project,
    pub stages: Vec<Stage>,
    pub revisions: BTreeMap<String, Revision>,
    pub state: ProjectState,
    pub entries: BTreeMap<String, ProjectEntry>,
    pub library: SkillLibrary,
}

/// Everything the server reads and writes, behind one interface so the same
/// routes run on an in-memory store and on Postgres.
#[async_trait]
pub trait Store: Send + Sync {
    // --- projects and stages (immutable seed) ---
    async fn project(&self, id: &str) -> Result<Option<Project>, StoreError>;
    async fn stages(&self, id: &str) -> Result<Option<Vec<Stage>>, StoreError>;

    // --- revisions (row-locked on Postgres) ---
    async fn revision(&self, id: &str, artifact: &str) -> Result<Option<Revision>, StoreError>;
    /// Write a revision only if the artifact is still at `base`. A stale write is
    /// refused with [`StoreError::StaleRevision`].
    async fn update_revision(
        &self,
        id: &str,
        artifact: &str,
        base: u32,
        next: &Revision,
    ) -> Result<(), StoreError>;

    // --- per-project mutable state ---
    async fn load_state(&self, id: &str) -> Result<Option<ProjectState>, StoreError>;
    async fn save_state(&self, id: &str, state: &ProjectState) -> Result<(), StoreError>;

    // --- project entries (delete / restore) ---
    async fn entries(&self) -> Result<BTreeMap<String, ProjectEntry>, StoreError>;
    async fn put_entry(&self, entry: &ProjectEntry) -> Result<(), StoreError>;

    // --- skills library and its own audit chain ---
    async fn library(&self) -> Result<SkillLibrary, StoreError>;
    async fn save_library(&self, library: &SkillLibrary) -> Result<(), StoreError>;
    async fn skills_audit(&self) -> Result<(AuditLog, String), StoreError>;
    async fn save_skills_audit(&self, log: &AuditLog, head: &str) -> Result<(), StoreError>;
}

/// The in-memory implementation used by default and by every test. All state sits
/// behind one mutex, exactly as the server did before the store existed, so the
/// behaviour of every route is unchanged.
#[derive(Clone)]
pub struct MemoryStore {
    inner: Arc<Mutex<MemoryInner>>,
}

struct MemoryInner {
    project_id: String,
    project: Project,
    stages: Vec<Stage>,
    revisions: BTreeMap<String, BTreeMap<String, Revision>>,
    states: BTreeMap<String, ProjectState>,
    entries: BTreeMap<String, ProjectEntry>,
    library: SkillLibrary,
    skills_audit_log: AuditLog,
    skills_audit_head: String,
}

impl MemoryStore {
    /// Build an in-memory store seeded with one project's state (ADR 0008).
    pub fn from_seed(project_id: impl Into<String>, seed: StoreSeed) -> Self {
        let project_id = project_id.into();
        let mut revs = BTreeMap::new();
        revs.insert(project_id.clone(), seed.revisions);
        let mut states = BTreeMap::new();
        states.insert(project_id.clone(), seed.state);
        Self {
            inner: Arc::new(Mutex::new(MemoryInner {
                project_id,
                project: seed.project,
                stages: seed.stages,
                revisions: revs,
                states,
                entries: seed.entries,
                library: seed.library,
                skills_audit_log: AuditLog::new(),
                skills_audit_head: GENESIS_HASH.to_owned(),
            })),
        }
    }

    /// Replace the skills library (used by tests to start from an empty library).
    pub fn set_library(&self, library: SkillLibrary) {
        self.inner.lock().expect("memory store lock").library = library;
    }
}

#[async_trait]
impl Store for MemoryStore {
    async fn project(&self, id: &str) -> Result<Option<Project>, StoreError> {
        let inner = self.inner.lock().expect("memory store lock");
        if id == inner.project_id {
            Ok(Some(inner.project.clone()))
        } else {
            Ok(None)
        }
    }

    async fn stages(&self, id: &str) -> Result<Option<Vec<Stage>>, StoreError> {
        let inner = self.inner.lock().expect("memory store lock");
        if id == inner.project_id {
            Ok(Some(inner.stages.clone()))
        } else {
            Ok(None)
        }
    }

    async fn revision(&self, id: &str, artifact: &str) -> Result<Option<Revision>, StoreError> {
        let inner = self.inner.lock().expect("memory store lock");
        Ok(inner
            .revisions
            .get(id)
            .and_then(|m| m.get(artifact))
            .cloned())
    }

    async fn update_revision(
        &self,
        id: &str,
        artifact: &str,
        base: u32,
        next: &Revision,
    ) -> Result<(), StoreError> {
        let mut inner = self.inner.lock().expect("memory store lock");
        let current = inner
            .revisions
            .get(id)
            .and_then(|m| m.get(artifact))
            .ok_or_else(|| StoreError::NotFound(format!("artifact: {artifact}")))?;
        if current.n != base {
            return Err(StoreError::StaleRevision {
                base,
                current: current.n,
            });
        }
        inner
            .revisions
            .get_mut(id)
            .expect("revision map present")
            .insert(artifact.to_owned(), next.clone());
        Ok(())
    }

    async fn load_state(&self, id: &str) -> Result<Option<ProjectState>, StoreError> {
        let inner = self.inner.lock().expect("memory store lock");
        Ok(inner.states.get(id).cloned())
    }

    async fn save_state(&self, id: &str, state: &ProjectState) -> Result<(), StoreError> {
        let mut inner = self.inner.lock().expect("memory store lock");
        // Optimistic concurrency (IMP-40): refuse a write whose version moved
        // since the caller loaded it, then bump on success — the same typed
        // conflict the Postgres store returns.
        if let Some(current) = inner.states.get(id) {
            if current.version != state.version {
                return Err(StoreError::StaleState {
                    base: state.version,
                    current: current.version,
                });
            }
        }
        let mut next = state.clone();
        next.version = state.version.saturating_add(1);
        inner.states.insert(id.to_owned(), next);
        Ok(())
    }

    async fn entries(&self) -> Result<BTreeMap<String, ProjectEntry>, StoreError> {
        let inner = self.inner.lock().expect("memory store lock");
        Ok(inner.entries.clone())
    }

    async fn put_entry(&self, entry: &ProjectEntry) -> Result<(), StoreError> {
        let mut inner = self.inner.lock().expect("memory store lock");
        inner.entries.insert(entry.id.clone(), entry.clone());
        Ok(())
    }

    async fn library(&self) -> Result<SkillLibrary, StoreError> {
        let inner = self.inner.lock().expect("memory store lock");
        Ok(inner.library.clone())
    }

    async fn save_library(&self, library: &SkillLibrary) -> Result<(), StoreError> {
        let mut inner = self.inner.lock().expect("memory store lock");
        inner.library = library.clone();
        Ok(())
    }

    async fn skills_audit(&self) -> Result<(AuditLog, String), StoreError> {
        let inner = self.inner.lock().expect("memory store lock");
        Ok((
            inner.skills_audit_log.clone(),
            inner.skills_audit_head.clone(),
        ))
    }

    async fn save_skills_audit(&self, log: &AuditLog, head: &str) -> Result<(), StoreError> {
        let mut inner = self.inner.lock().expect("memory store lock");
        inner.skills_audit_log = log.clone();
        inner.skills_audit_head = head.to_owned();
        Ok(())
    }
}

/// Test support shared by the `MemoryStore` and `PgStore` suites (IMP-38):
/// the same seed and the same assertions run against both implementations.
#[doc(hidden)]
pub mod test_support {
    use std::collections::BTreeMap;

    use super::{ProjectState, Store, StoreError, StoreSeed};
    use crate::{
        AuditAction, AuditEvent, AuditLog, BoardSnapshot, GENESIS_HASH, Ledger, LedgerCaps,
        Project, ProjectEntry, Proposal, Revision, SkillLibrary, Stage, StageId, StageTone,
    };

    /// A minimal, deterministic seed that exercises every store method.
    pub fn seed() -> (String, StoreSeed) {
        let project_id = "meranti-yard".to_owned();
        let project = Project {
            name: "Meranti Yard".to_owned(),
            product: "Cost variance dashboard".to_owned(),
            increment: "Inc. 2 · Variance alerts".to_owned(),
            spec: "r1".to_owned(),
            user: "Rina (sample)".to_owned(),
            initials: "RS".to_owned(),
        };
        let stages = vec![Stage {
            id: StageId::Design,
            n: "03".to_owned(),
            name: "Design".to_owned(),
            st: StageTone::Warn,
            text: "3 to review".to_owned(),
        }];
        let mut revisions = BTreeMap::new();
        revisions.insert(
            "spec".to_owned(),
            Revision {
                n: 1,
                content: "R-DASH-014: Flag packages.\nAC-014.2: Highlight rows.".to_owned(),
            },
        );
        let mut proposals = BTreeMap::new();
        proposals.insert(
            "P-1".to_owned(),
            Proposal {
                id: "P-1".to_owned(),
                artifact: "spec".to_owned(),
                title: "Add an alert rule".to_owned(),
                base: 1,
                hunks: vec![],
            },
        );
        let ledger = Ledger::new(LedgerCaps {
            per_run: 60,
            project: 5000,
            person: 5000,
            concurrency: 2,
        });
        let state = ProjectState {
            version: 1,
            proposals,
            rejections: vec![],
            ledger,
            board: BoardSnapshot {
                board_id: "design".to_owned(),
                items: vec![],
            },
            handoff_revisions: vec![],
            required_inputs: vec![],
            audit: AuditLog::new(),
            audit_head: GENESIS_HASH.to_owned(),
        };
        let mut entries = BTreeMap::new();
        entries.insert(
            project_id.clone(),
            ProjectEntry::new(
                project_id.clone(),
                project.clone(),
                vec!["r1".to_owned()],
                1_735_689_600,
            ),
        );
        let library = SkillLibrary::from_fixture(&serde_json::json!({}));
        (
            project_id,
            StoreSeed {
                project,
                stages,
                revisions,
                state,
                entries,
                library,
            },
        )
    }

    /// Run every store assertion against one implementation. Panics on the first
    /// failure so a `#[tokio::test]` wrapper reports it.
    pub async fn run_suite<S: Store + ?Sized>(store: &S) {
        let (id, seed) = seed();

        // projects and stages read back the seed; unknown ids are absent.
        assert_eq!(
            store.project(&id).await.unwrap(),
            Some(seed.project.clone())
        );
        assert_eq!(store.project("nope").await.unwrap(), None);
        assert_eq!(store.stages(&id).await.unwrap(), Some(seed.stages.clone()));
        assert_eq!(store.stages("nope").await.unwrap(), None);

        // revisions read, then update under a base check; a stale write is refused.
        let spec = store.revision(&id, "spec").await.unwrap().unwrap();
        assert_eq!(spec.n, 1);
        let r2 = spec.next("R-DASH-019: alert rule.".to_owned());
        store.update_revision(&id, "spec", 1, &r2).await.unwrap();
        assert_eq!(store.revision(&id, "spec").await.unwrap().unwrap().n, 2);
        let stale = store.update_revision(&id, "spec", 1, &r2.next("x")).await;
        assert!(matches!(
            stale,
            Err(StoreError::StaleRevision {
                base: 1,
                current: 2
            })
        ));
        assert!(matches!(
            store.update_revision(&id, "nope", 1, &r2).await,
            Err(StoreError::NotFound(_))
        ));

        // project state round-trips; a mutation is visible after save.
        let mut state = store.load_state(&id).await.unwrap().unwrap();
        assert_eq!(state, seed.state);
        state.rejections.push(crate::Rejection {
            id: "P-1".to_owned(),
            base: 1,
            reason: "no".to_owned(),
        });
        let stale_state = state.clone();
        store.save_state(&id, &state).await.unwrap();
        let mut expected = state;
        expected.version += 1;
        assert_eq!(store.load_state(&id).await.unwrap().unwrap(), expected);
        assert_eq!(store.load_state("nope").await.unwrap(), None);

        // a stale state save is refused on both backends (IMP-40): the version
        // moved since the caller loaded it, so the write must not overwrite it.
        let stale_save = store.save_state(&id, &stale_state).await;
        assert!(matches!(
            stale_save,
            Err(StoreError::StaleState { base: 1, current: 2 })
        ));

        // an atomic revision + state write lands both or neither (IMP-40): the
        // revision advances only together with the state that carries its audit entry.
        let r3 = r2.next("R-DASH-020: second alert rule.".to_owned());
        let mut atomic_state = store.load_state(&id).await.unwrap().unwrap();
        assert_eq!(atomic_state.version, 2);
        let entry = atomic_state.audit.append(
            AuditEvent {
                actor: "sample-user".to_owned(),
                action: AuditAction::Accept,
                target_id: "P-1".to_owned(),
                revision: Some(r3.label()),
                reason: "accepted".to_owned(),
            },
            1_735_689_600,
        );
        atomic_state.audit_head = entry.hash.clone();
        store
            .update_revision_and_state(&id, "spec", 2, &r3, &atomic_state)
            .await
            .unwrap();
        assert_eq!(store.revision(&id, "spec").await.unwrap().unwrap().n, 3);
        let after_atomic = store.load_state(&id).await.unwrap().unwrap();
        assert_eq!(after_atomic.version, 3);
        assert_eq!(after_atomic.audit.len(), 1);
        assert_eq!(after_atomic.audit_head, entry.hash);

        // a stale state version refuses the whole write — the revision must not move.
        let r4 = r3.next("R-DASH-021".to_owned());
        let stale_atomic = store
            .update_revision_and_state(&id, "spec", 3, &r4, &atomic_state)
            .await;
        assert!(matches!(
            stale_atomic,
            Err(StoreError::StaleState { base: 2, current: 3 })
        ));
        assert_eq!(
            store.revision(&id, "spec").await.unwrap().unwrap().n,
            3,
            "a stale state must not advance the revision"
        );

        // a stale revision base refuses the whole write — the state must not move.
        let mut rev_stale_state = store.load_state(&id).await.unwrap().unwrap();
        rev_stale_state.rejections.push(crate::Rejection {
            id: "P-1".to_owned(),
            base: 1,
            reason: "again".to_owned(),
        });
        let stale_rev = store
            .update_revision_and_state(&id, "spec", 2, &r4, &rev_stale_state)
            .await;
        assert!(matches!(
            stale_rev,
            Err(StoreError::StaleRevision { base: 2, current: 3 })
        ));
        assert_eq!(
            store.load_state(&id).await.unwrap().unwrap().version,
            3,
            "a stale revision base must not move the state"
        );

        // project entries: put a second, deleted project, then list both.
        let mut deleted = ProjectEntry::new(
            "kenari-fleet".to_owned(),
            seed.project.clone(),
            vec!["r1".to_owned(), "r2".to_owned()],
            1_735_689_600,
        );
        deleted.deleted_at = Some(1_735_689_600 + 3 * 86_400);
        store.put_entry(&deleted).await.unwrap();
        let entries = store.entries().await.unwrap();
        assert_eq!(entries.len(), 2);
        assert!(entries.values().any(|e| e.is_deleted()));

        // skills library round-trips.
        let library = store.library().await.unwrap();
        assert_eq!(library, seed.library);
        store.save_library(&library).await.unwrap();
        assert_eq!(store.library().await.unwrap(), library);

        // skills audit round-trips with its head held apart.
        let (log, head) = store.skills_audit().await.unwrap();
        assert_eq!(head, GENESIS_HASH);
        let mut log = log;
        let entry = log.append(
            AuditEvent {
                actor: "sample-user".to_owned(),
                action: AuditAction::Revert,
                target_id: "grill".to_owned(),
                revision: Some("v2".to_owned()),
                reason: "rolled back".to_owned(),
            },
            1_735_689_600,
        );
        store.save_skills_audit(&log, &entry.hash).await.unwrap();
        let (saved_log, saved_head) = store.skills_audit().await.unwrap();
        assert_eq!(saved_log, log);
        assert_eq!(saved_head, entry.hash);
    }
}
