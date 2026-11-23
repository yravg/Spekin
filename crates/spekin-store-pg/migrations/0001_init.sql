-- IMP-38: Postgres store schema (ADR 0008). Plain SQL, no ORM.
-- Complex values are stored as JSON text and (de)serialised by spekin-core types.

CREATE TABLE IF NOT EXISTS spekin_projects (
    id      TEXT PRIMARY KEY,
    project TEXT NOT NULL,  -- JSON: spekin_core::Project
    stages  TEXT NOT NULL   -- JSON: Vec<spekin_core::Stage>
);

-- Revisions are updated under a row lock (SELECT ... FOR UPDATE) so a stale
-- write is refused with the same conflict the in-memory store returns.
CREATE TABLE IF NOT EXISTS spekin_revisions (
    project_id TEXT    NOT NULL,
    artifact   TEXT    NOT NULL,
    n          INTEGER NOT NULL,
    content    TEXT    NOT NULL,
    PRIMARY KEY (project_id, artifact)
);

CREATE TABLE IF NOT EXISTS spekin_states (
    project_id TEXT PRIMARY KEY,
    state      TEXT NOT NULL  -- JSON: spekin_core::store::ProjectState
);

CREATE TABLE IF NOT EXISTS spekin_entries (
    id    TEXT PRIMARY KEY,
    entry TEXT NOT NULL  -- JSON: spekin_core::ProjectEntry
);

CREATE TABLE IF NOT EXISTS spekin_library (
    id      INTEGER PRIMARY KEY CHECK (id = 1),
    library TEXT NOT NULL  -- JSON: spekin_core::SkillLibrary
);

CREATE TABLE IF NOT EXISTS spekin_skills_audit (
    id   INTEGER PRIMARY KEY CHECK (id = 1),
    log  TEXT NOT NULL,  -- JSON: spekin_core::AuditLog
    head TEXT NOT NULL   -- held apart from the log (IMP-31/35)
);
