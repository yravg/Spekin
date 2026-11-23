//! Postgres implementation of [`spekin_core::Store`] (ADR 0008).
//!
//! Plain SQL through `sqlx`; no ORM. Revisions are updated under a row lock, so a
//! stale write is refused with [`spekin_core::StoreError::StaleRevision`] — the same
//! typed conflict the in-memory store returns. The skills library and the audit
//! chains are persisted as JSON text columns.

use std::collections::BTreeMap;

use async_trait::async_trait;
use serde::Deserialize;
use spekin_core::{
    AuditLog, GENESIS_HASH, Project, ProjectEntry, ProjectState, Revision, SkillLibrary, Stage,
    Store, StoreError, StoreSeed,
};
use sqlx::Row;

/// The plain SQL migrations (ADR 0008), applied directly on connect.
const MIGRATIONS: &str = include_str!("../migrations/0001_init.sql");

fn backend(e: sqlx::Error) -> StoreError {
    StoreError::Backend(e.to_string())
}

fn backend_json(e: serde_json::Error) -> StoreError {
    StoreError::Backend(e.to_string())
}

/// A connected, migrated Postgres store. Clone is cheap: it shares the pool.
#[derive(Clone)]
pub struct PgStore {
    pool: sqlx::PgPool,
}

impl PgStore {
    /// Connect and run the migrations. This is the entry point the server uses
    /// when `DATABASE_URL` is set.
    pub async fn connect(url: &str) -> Result<Self, StoreError> {
        let pool = sqlx::postgres::PgPoolOptions::new()
            .connect(url)
            .await
            .map_err(backend)?;
        sqlx::raw_sql(MIGRATIONS)
            .execute(&pool)
            .await
            .map_err(backend)?;
        Ok(Self { pool })
    }

    /// Seed Meranti Yard. Clears every table first, so this is the explicit,
    /// `--yes`-gated command (ADR 0008), never automatic against a real database.
    pub async fn seed(&self, project_id: &str, seed: &StoreSeed) -> Result<(), StoreError> {
        let mut tx = self.pool.begin().await.map_err(backend)?;

        sqlx::query(
            "TRUNCATE spekin_projects, spekin_revisions, spekin_states, \
             spekin_entries, spekin_library, spekin_skills_audit",
        )
        .execute(&mut *tx)
        .await
        .map_err(backend)?;

        let project = serde_json::to_string(&seed.project).map_err(backend_json)?;
        let stages = serde_json::to_string(&seed.stages).map_err(backend_json)?;
        sqlx::query("INSERT INTO spekin_projects (id, project, stages) VALUES ($1, $2, $3)")
            .bind(project_id)
            .bind(&project)
            .bind(&stages)
            .execute(&mut *tx)
            .await
            .map_err(backend)?;

        for (artifact, revision) in &seed.revisions {
            sqlx::query(
                "INSERT INTO spekin_revisions (project_id, artifact, n, content) \
                 VALUES ($1, $2, $3, $4)",
            )
            .bind(project_id)
            .bind(artifact)
            .bind(revision.n as i32)
            .bind(&revision.content)
            .execute(&mut *tx)
            .await
            .map_err(backend)?;
        }

        let state = serde_json::to_string(&seed.state).map_err(backend_json)?;
        sqlx::query("INSERT INTO spekin_states (project_id, state) VALUES ($1, $2)")
            .bind(project_id)
            .bind(&state)
            .execute(&mut *tx)
            .await
            .map_err(backend)?;

        for (id, entry) in &seed.entries {
            let entry = serde_json::to_string(entry).map_err(backend_json)?;
            sqlx::query("INSERT INTO spekin_entries (id, entry) VALUES ($1, $2)")
                .bind(id)
                .bind(&entry)
                .execute(&mut *tx)
                .await
                .map_err(backend)?;
        }

        let library = serde_json::to_string(&seed.library).map_err(backend_json)?;
        sqlx::query("INSERT INTO spekin_library (id, library) VALUES (1, $1)")
            .bind(&library)
            .execute(&mut *tx)
            .await
            .map_err(backend)?;

        tx.commit().await.map_err(backend)?;
        Ok(())
    }

    /// Remove every row, used by the shared test suite before each run.
    pub async fn truncate(&self) -> Result<(), StoreError> {
        sqlx::query(
            "TRUNCATE spekin_projects, spekin_revisions, spekin_states, \
             spekin_entries, spekin_library, spekin_skills_audit",
        )
        .execute(&self.pool)
        .await
        .map_err(backend)?;
        Ok(())
    }
}

fn decode<T: for<'de> Deserialize<'de>>(text: &str) -> Result<T, StoreError> {
    serde_json::from_str(text).map_err(backend_json)
}

#[async_trait]
impl Store for PgStore {
    async fn project(&self, id: &str) -> Result<Option<Project>, StoreError> {
        let row = sqlx::query("SELECT project FROM spekin_projects WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(backend)?;
        match row {
            Some(row) => {
                let text: String = row.try_get("project").map_err(backend)?;
                Ok(Some(decode(&text)?))
            }
            None => Ok(None),
        }
    }

    async fn stages(&self, id: &str) -> Result<Option<Vec<Stage>>, StoreError> {
        let row = sqlx::query("SELECT stages FROM spekin_projects WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(backend)?;
        match row {
            Some(row) => {
                let text: String = row.try_get("stages").map_err(backend)?;
                Ok(Some(decode(&text)?))
            }
            None => Ok(None),
        }
    }

    async fn revision(&self, id: &str, artifact: &str) -> Result<Option<Revision>, StoreError> {
        let row = sqlx::query(
            "SELECT n, content FROM spekin_revisions WHERE project_id = $1 AND artifact = $2",
        )
        .bind(id)
        .bind(artifact)
        .fetch_optional(&self.pool)
        .await
        .map_err(backend)?;
        match row {
            Some(row) => {
                let n: i32 = row.try_get("n").map_err(backend)?;
                let content: String = row.try_get("content").map_err(backend)?;
                Ok(Some(Revision {
                    n: n as u32,
                    content,
                }))
            }
            None => Ok(None),
        }
    }

    async fn update_revision(
        &self,
        id: &str,
        artifact: &str,
        base: u32,
        next: &Revision,
    ) -> Result<(), StoreError> {
        let mut tx = self.pool.begin().await.map_err(backend)?;
        let row = sqlx::query(
            "SELECT n FROM spekin_revisions WHERE project_id = $1 AND artifact = $2 FOR UPDATE",
        )
        .bind(id)
        .bind(artifact)
        .fetch_optional(&mut *tx)
        .await
        .map_err(backend)?;

        let Some(row) = row else {
            return Err(StoreError::NotFound(format!("artifact: {artifact}")));
        };
        let current: i32 = row.try_get("n").map_err(backend)?;
        let current = current as u32;
        if current != base {
            return Err(StoreError::StaleRevision { base, current });
        }

        sqlx::query(
            "UPDATE spekin_revisions SET n = $1, content = $2 \
             WHERE project_id = $3 AND artifact = $4",
        )
        .bind(next.n as i32)
        .bind(&next.content)
        .bind(id)
        .bind(artifact)
        .execute(&mut *tx)
        .await
        .map_err(backend)?;

        tx.commit().await.map_err(backend)?;
        Ok(())
    }

    async fn load_state(&self, id: &str) -> Result<Option<ProjectState>, StoreError> {
        let row = sqlx::query("SELECT state FROM spekin_states WHERE project_id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .map_err(backend)?;
        match row {
            Some(row) => {
                let text: String = row.try_get("state").map_err(backend)?;
                Ok(Some(decode(&text)?))
            }
            None => Ok(None),
        }
    }

    async fn save_state(&self, id: &str, state: &ProjectState) -> Result<(), StoreError> {
        let text = serde_json::to_string(state).map_err(backend_json)?;
        sqlx::query(
            "INSERT INTO spekin_states (project_id, state) VALUES ($1, $2) \
             ON CONFLICT (project_id) DO UPDATE SET state = EXCLUDED.state",
        )
        .bind(id)
        .bind(&text)
        .execute(&self.pool)
        .await
        .map_err(backend)?;
        Ok(())
    }

    async fn entries(&self) -> Result<BTreeMap<String, ProjectEntry>, StoreError> {
        let rows = sqlx::query("SELECT id, entry FROM spekin_entries ORDER BY id")
            .fetch_all(&self.pool)
            .await
            .map_err(backend)?;
        let mut map = BTreeMap::new();
        for row in rows {
            let id: String = row.try_get("id").map_err(backend)?;
            let text: String = row.try_get("entry").map_err(backend)?;
            map.insert(id, decode(&text)?);
        }
        Ok(map)
    }

    async fn put_entry(&self, entry: &ProjectEntry) -> Result<(), StoreError> {
        let text = serde_json::to_string(entry).map_err(backend_json)?;
        sqlx::query(
            "INSERT INTO spekin_entries (id, entry) VALUES ($1, $2) \
             ON CONFLICT (id) DO UPDATE SET entry = EXCLUDED.entry",
        )
        .bind(&entry.id)
        .bind(&text)
        .execute(&self.pool)
        .await
        .map_err(backend)?;
        Ok(())
    }

    async fn library(&self) -> Result<SkillLibrary, StoreError> {
        let row = sqlx::query("SELECT library FROM spekin_library WHERE id = 1")
            .fetch_optional(&self.pool)
            .await
            .map_err(backend)?;
        match row {
            Some(row) => {
                let text: String = row.try_get("library").map_err(backend)?;
                decode(&text)
            }
            None => Err(StoreError::NotFound("skills library".to_owned())),
        }
    }

    async fn save_library(&self, library: &SkillLibrary) -> Result<(), StoreError> {
        let text = serde_json::to_string(library).map_err(backend_json)?;
        sqlx::query(
            "INSERT INTO spekin_library (id, library) VALUES (1, $1) \
             ON CONFLICT (id) DO UPDATE SET library = EXCLUDED.library",
        )
        .bind(&text)
        .execute(&self.pool)
        .await
        .map_err(backend)?;
        Ok(())
    }

    async fn skills_audit(&self) -> Result<(AuditLog, String), StoreError> {
        let row = sqlx::query("SELECT log, head FROM spekin_skills_audit WHERE id = 1")
            .fetch_optional(&self.pool)
            .await
            .map_err(backend)?;
        match row {
            Some(row) => {
                let log_text: String = row.try_get("log").map_err(backend)?;
                let head: String = row.try_get("head").map_err(backend)?;
                Ok((decode(&log_text)?, head))
            }
            None => Ok((AuditLog::new(), GENESIS_HASH.to_owned())),
        }
    }

    async fn save_skills_audit(&self, log: &AuditLog, head: &str) -> Result<(), StoreError> {
        let log = serde_json::to_string(log).map_err(backend_json)?;
        sqlx::query(
            "INSERT INTO spekin_skills_audit (id, log, head) VALUES (1, $1, $2) \
             ON CONFLICT (id) DO UPDATE SET log = EXCLUDED.log, head = EXCLUDED.head",
        )
        .bind(&log)
        .bind(head)
        .execute(&self.pool)
        .await
        .map_err(backend)?;
        Ok(())
    }
}
