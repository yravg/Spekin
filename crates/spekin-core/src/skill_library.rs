//! Skills library state and rules (ADR 0007, IMP-34, board S40).
//!
//! Pure data and rules for the library the server serves: templates stay immutable,
//! user copies are versioned, GitHub skills are pinned, updates either apply as a new
//! version or are held with their diff and reasons, and any version can be rolled back
//! as a new version. No IO and no clock here: the server supplies the UTC timestamp.

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use ts_rs::TS;

use crate::{
    SkillBundle, SkillManifest, StageId, UpdateCheck, UpdateDecision, UpdatePolicy,
    skills::{HoldReason, SkillSource},
};

/// Where a library skill comes from. Mirrors the three SKL_SOURCES kinds.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum SkillSourceKind {
    Template,
    Github,
    User,
}

impl SkillSourceKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Template => "template",
            Self::Github => "github",
            Self::User => "user",
        }
    }
}

/// One skill in the library, with the policy and source kind the server and UI need.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct LibrarySkill {
    pub manifest: SkillManifest,
    pub policy: UpdatePolicy,
    pub kind: SkillSourceKind,
    pub uses: u32,
}

/// A source summary from SKL_SOURCES, shown on S40's source list.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SkillSourceInfo {
    pub id: String,
    pub name: String,
    /// The board's word: "template", "github" or "mine".
    pub kind: String,
    pub licence: String,
    #[serde(default)]
    pub notice: Option<String>,
    #[serde(default)]
    pub commit: Option<String>,
    pub policy: String,
    pub count: u32,
}

/// One immutable stored version of a skill.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SkillVersion {
    pub label: String,
    pub manifest: SkillManifest,
    pub created_at: i64,
    pub note: String,
}

/// What a history entry records.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum SkillHistoryAction {
    Copied,
    Edited,
    Installed,
    UpdateApplied,
    UpdateHeld,
    RolledBack,
}

/// One entry of a skill's version history, in sequence order.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SkillHistoryEntry {
    pub seq: u64,
    pub skill_id: String,
    pub action: SkillHistoryAction,
    pub version: String,
    pub reason: String,
    pub at: i64,
    /// Reasons on a held update; empty on every other action.
    #[serde(default)]
    pub reasons: Vec<HoldReason>,
}

/// A line in a stored held-update diff.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum DiffOp {
    Context,
    Remove,
    Add,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct DiffLine {
    pub op: DiffOp,
    pub text: String,
}

/// A held update: stored as data only. The current version never changes.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct HeldUpdate {
    pub skill_id: String,
    pub from_version: String,
    pub to_version: String,
    pub reasons: Vec<HoldReason>,
    pub diff: Vec<DiffLine>,
    pub at: i64,
}

/// Result of recording an update check.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(tag = "outcome", rename_all = "snake_case")]
#[ts(export)]
pub enum SkillUpdateOutcome {
    Applied {
        skill: Box<LibrarySkill>,
        version: String,
        seq: u64,
    },
    Held {
        held: HeldUpdate,
        seq: u64,
    },
}

/// Typed errors from the library rules. The server maps these to 4xx responses.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS, thiserror::Error)]
#[serde(tag = "code", rename_all = "snake_case")]
#[ts(export)]
pub enum SkillLibraryError {
    #[error("unknown skill: {id}")]
    NotFound { id: String },
    #[error("skill {id} is a template and cannot be changed")]
    TemplateImmutable { id: String },
    #[error("skill {id} is managed by {source_kind} and cannot be edited here")]
    NotEditable { id: String, source_kind: String },
    #[error("a skill already exists with id: {id}")]
    DuplicateId { id: String },
    #[error("unknown version {version} for skill {id}")]
    VersionNotFound { id: String, version: String },
    #[error("a skill copy needs a non-empty id")]
    EmptyCopyId,
}

/// The fields a user may edit on their own copy. Everything else (licence, notice,
/// source, reads, proposes) is kept from the manifest so attribution cannot be lost.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SkillEdit {
    #[serde(default)]
    pub title: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub stages: Option<Vec<StageId>>,
    #[serde(default)]
    pub body: Option<String>,
}

/// Response served by `GET /api/skills`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SkillsResponse {
    pub skills: Vec<LibrarySkill>,
    pub sources: Vec<SkillSourceInfo>,
}

/// In-memory library. The server owns one of these and calls only these rules.
/// `Serialize`/`Deserialize` let the [`crate::store::Store`] implementations persist it (ADR 0008).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SkillLibrary {
    skills: BTreeMap<String, LibrarySkill>,
    versions: BTreeMap<String, Vec<SkillVersion>>,
    bundles: BTreeMap<String, SkillBundle>,
    sources: Vec<SkillSourceInfo>,
    history: Vec<SkillHistoryEntry>,
    held: BTreeMap<String, Vec<HeldUpdate>>,
    next_seq: u64,
}

fn stage_from_name(name: &str) -> StageId {
    match name.trim().to_ascii_lowercase().as_str() {
        "spec" | "specification" => StageId::Spec,
        "design" => StageId::Design,
        "frontend" => StageId::Frontend,
        "backend" => StageId::Backend,
        "integration" => StageId::Integration,
        "testing" => StageId::Testing,
        "deploy" | "deployment" => StageId::Deploy,
        _ => StageId::Planning,
    }
}

fn policy_from_label(label: &str) -> UpdatePolicy {
    match label.trim().to_ascii_lowercase().as_str() {
        "auto-update" | "update ready" | "auto" => UpdatePolicy::Auto,
        "notify me" | "notify" => UpdatePolicy::Notify,
        _ => UpdatePolicy::Pinned,
    }
}

fn kind_from_source(id: &str) -> SkillSourceKind {
    match id {
        "spekin" => SkillSourceKind::Template,
        "gh-mp" => SkillSourceKind::Github,
        _ => SkillSourceKind::User,
    }
}

fn str_at(row: &Value, i: usize) -> String {
    row.get(i).and_then(Value::as_str).unwrap_or("").to_string()
}

impl SkillLibrary {
    /// Build the library from the SKL_* exports in the sample fixture. The fixture is
    /// the same data the S40 board draws (canvas-to-app rule 15).
    pub fn from_fixture(raw: &Value) -> Self {
        let detail = &raw["SKL_DETAIL"];
        let detail_version = detail["version"].as_str().unwrap_or("").to_string();
        let reads: Vec<String> = detail["reads"]
            .as_array()
            .map(|a| {
                a.iter()
                    .filter_map(Value::as_str)
                    .map(str::to_string)
                    .collect()
            })
            .unwrap_or_default();
        let proposes: Vec<String> = detail["proposes"]
            .as_array()
            .map(|a| {
                a.iter()
                    .filter_map(Value::as_str)
                    .map(str::to_string)
                    .collect()
            })
            .unwrap_or_default();
        let steps: Vec<String> = detail["steps"]
            .as_array()
            .map(|a| {
                a.iter()
                    .filter_map(Value::as_str)
                    .map(str::to_string)
                    .collect()
            })
            .unwrap_or_default();
        let body = if steps.is_empty() {
            detail["adapted"].as_str().unwrap_or("").to_string()
        } else {
            steps.join("\n")
        };

        let sources: Vec<SkillSourceInfo> = raw["SKL_SOURCES"]
            .as_array()
            .map(|rows| {
                rows.iter()
                    .map(|s| SkillSourceInfo {
                        id: s["id"].as_str().unwrap_or("").to_string(),
                        name: s["name"].as_str().unwrap_or("").to_string(),
                        kind: s["kind"].as_str().unwrap_or("").to_string(),
                        licence: s["licence"].as_str().unwrap_or("").to_string(),
                        notice: s["notice"].as_str().map(str::to_string),
                        commit: s["commit"].as_str().map(str::to_string),
                        policy: s["policy"].as_str().unwrap_or("").to_string(),
                        count: s["count"].as_u64().unwrap_or(0) as u32,
                    })
                    .collect()
            })
            .unwrap_or_default();

        let mut skills = BTreeMap::new();
        let mut versions = BTreeMap::new();
        if let Some(rows) = raw["SKL_SKILLS"].as_array() {
            for row in rows {
                let id = str_at(row, 0);
                if id.is_empty() {
                    continue;
                }
                let source_id = str_at(row, 4);
                let kind = kind_from_source(&source_id);
                let notice = sources
                    .iter()
                    .find(|s| s.id == source_id)
                    .and_then(|s| s.notice.clone());
                let source = match kind {
                    SkillSourceKind::Template => SkillSource::Template,
                    SkillSourceKind::User => SkillSource::User { copied_from: None },
                    SkillSourceKind::Github => {
                        let repo = sources
                            .iter()
                            .find(|s| s.id == source_id)
                            .and_then(SkillSourceInfo::repo_slug)
                            .unwrap_or_else(|| "mattpocock/skills".to_string());
                        let commit = sources
                            .iter()
                            .find(|s| s.id == source_id)
                            .and_then(|s| s.commit.clone())
                            .unwrap_or_default();
                        SkillSource::Github {
                            repo,
                            path: format!("skills/{id}/SKILL.md"),
                            commit,
                        }
                    }
                };
                let stages: Vec<StageId> = row
                    .get(3)
                    .and_then(Value::as_array)
                    .map(|a| {
                        a.iter()
                            .filter_map(Value::as_str)
                            .map(stage_from_name)
                            .collect()
                    })
                    .unwrap_or_default();
                let version = if kind == SkillSourceKind::Github {
                    detail_version.clone()
                } else {
                    "v1.0".to_string()
                };
                let manifest = SkillManifest {
                    id: id.clone(),
                    title: str_at(row, 1),
                    description: str_at(row, 2),
                    stages,
                    source,
                    licence: str_at(row, 5),
                    notice,
                    version: version.clone(),
                    reads: reads.clone(),
                    proposes: proposes.clone(),
                    tools: vec![],
                    scripts: vec![],
                    invocation: format!("/{id}"),
                    body: body.clone(),
                };
                let skill = LibrarySkill {
                    policy: policy_from_label(&str_at(row, 6)),
                    kind,
                    uses: row.get(8).and_then(Value::as_u64).unwrap_or(0) as u32,
                    manifest,
                };
                versions.insert(
                    id.clone(),
                    vec![SkillVersion {
                        label: version,
                        manifest: skill.manifest.clone(),
                        created_at: 0,
                        note: "seeded from the sample".to_string(),
                    }],
                );
                skills.insert(id, skill);
            }
        }

        Self {
            skills,
            versions,
            bundles: BTreeMap::new(),
            sources,
            history: Vec::new(),
            held: BTreeMap::new(),
            next_seq: 1,
        }
    }

    /// All skills, sorted by id for a stable API body.
    pub fn list(&self) -> Vec<LibrarySkill> {
        self.skills.values().cloned().collect()
    }

    pub fn sources(&self) -> Vec<SkillSourceInfo> {
        self.sources.clone()
    }

    pub fn response(&self) -> SkillsResponse {
        SkillsResponse {
            skills: self.list(),
            sources: self.sources(),
        }
    }

    pub fn get(&self, id: &str) -> Option<LibrarySkill> {
        self.skills.get(id).cloned()
    }

    /// The pinned bundle of a GitHub skill, used by the update-check adapter.
    pub fn bundle(&self, id: &str) -> Option<SkillBundle> {
        self.bundles.get(id).cloned()
    }

    pub fn versions(&self, id: &str) -> Vec<SkillVersion> {
        self.versions.get(id).cloned().unwrap_or_default()
    }

    pub fn history(&self, id: &str) -> Vec<SkillHistoryEntry> {
        self.history
            .iter()
            .filter(|e| e.skill_id == id)
            .cloned()
            .collect()
    }

    pub fn held(&self, id: &str) -> Vec<HeldUpdate> {
        self.held.get(id).cloned().unwrap_or_default()
    }

    fn push_history(
        &mut self,
        skill_id: &str,
        action: SkillHistoryAction,
        version: &str,
        reason: String,
        now: i64,
        reasons: Vec<HoldReason>,
    ) -> u64 {
        let seq = self.next_seq;
        self.next_seq += 1;
        self.history.push(SkillHistoryEntry {
            seq,
            skill_id: skill_id.to_string(),
            action,
            version: version.to_string(),
            reason,
            at: now,
            reasons,
        });
        seq
    }

    /// Copy a template into the user's own versioned skill. The template is untouched.
    pub fn copy_template(
        &mut self,
        id: &str,
        new_id: impl Into<String>,
        new_title: impl Into<String>,
        now: i64,
    ) -> Result<LibrarySkill, SkillLibraryError> {
        let source = self
            .skills
            .get(id)
            .cloned()
            .ok_or_else(|| SkillLibraryError::NotFound { id: id.into() })?;
        if source.kind != SkillSourceKind::Template {
            return Err(SkillLibraryError::TemplateImmutable { id: id.into() });
        }
        let new_id = new_id.into();
        if new_id.trim().is_empty() {
            return Err(SkillLibraryError::EmptyCopyId);
        }
        if self.skills.contains_key(&new_id) {
            return Err(SkillLibraryError::DuplicateId { id: new_id });
        }
        let mut manifest = source.manifest.copy_for_user(&new_id, new_title);
        manifest.version = "1".to_string();
        let skill = LibrarySkill {
            manifest: manifest.clone(),
            // A user copy never auto-updates (ADR 0007); it shows upstream changes instead.
            policy: UpdatePolicy::Pinned,
            kind: SkillSourceKind::User,
            uses: 0,
        };
        self.skills.insert(new_id.clone(), skill.clone());
        self.versions.insert(
            new_id.clone(),
            vec![SkillVersion {
                label: "1".to_string(),
                manifest,
                created_at: now,
                note: format!("copied from {id}"),
            }],
        );
        self.push_history(
            &new_id,
            SkillHistoryAction::Copied,
            "1",
            format!("copied from {id}"),
            now,
            Vec::new(),
        );
        Ok(skill)
    }

    /// Edit a user copy, storing the result as a new version.
    pub fn edit(
        &mut self,
        id: &str,
        changes: SkillEdit,
        now: i64,
    ) -> Result<LibrarySkill, SkillLibraryError> {
        let skill = self
            .skills
            .get(id)
            .cloned()
            .ok_or_else(|| SkillLibraryError::NotFound { id: id.into() })?;
        if skill.kind != SkillSourceKind::User {
            return Err(SkillLibraryError::NotEditable {
                id: id.into(),
                source_kind: skill.kind.as_str().to_string(),
            });
        }
        let mut manifest = skill.manifest.clone();
        if let Some(title) = changes.title {
            manifest.title = title;
        }
        if let Some(description) = changes.description {
            manifest.description = description;
        }
        if let Some(stages) = changes.stages {
            manifest.stages = stages;
        }
        if let Some(body) = changes.body {
            manifest.body = body;
        }
        let label = (self.versions.get(id).map_or(1, Vec::len) + 1).to_string();
        manifest.version = label.clone();
        self.skills.insert(
            id.to_string(),
            LibrarySkill {
                manifest: manifest.clone(),
                ..skill
            },
        );
        self.versions
            .entry(id.to_string())
            .or_default()
            .push(SkillVersion {
                label: label.clone(),
                manifest,
                created_at: now,
                note: "user edit".to_string(),
            });
        self.push_history(
            id,
            SkillHistoryAction::Edited,
            &label,
            "user edit".into(),
            now,
            Vec::new(),
        );
        Ok(self.skills[id].clone())
    }

    /// Install a GitHub skill fetched through the injected adapter, pinned to its SHA.
    pub fn add_github(
        &mut self,
        bundle: SkillBundle,
        policy: UpdatePolicy,
        now: i64,
    ) -> Result<LibrarySkill, SkillLibraryError> {
        let id = bundle.manifest.id.clone();
        if self.skills.contains_key(&id) {
            return Err(SkillLibraryError::DuplicateId { id });
        }
        let label = bundle.manifest.version.clone();
        let skill = LibrarySkill {
            manifest: bundle.manifest.clone(),
            policy,
            kind: SkillSourceKind::Github,
            uses: 0,
        };
        self.skills.insert(id.clone(), skill.clone());
        self.versions.insert(
            id.clone(),
            vec![SkillVersion {
                label: label.clone(),
                manifest: bundle.manifest.clone(),
                created_at: now,
                note: format!("installed at {}", bundle.source.commit),
            }],
        );
        self.bundles.insert(id.clone(), bundle);
        self.push_history(
            &id,
            SkillHistoryAction::Installed,
            &label,
            format!("installed from {}", label),
            now,
            Vec::new(),
        );
        Ok(skill)
    }

    /// Record an update check: apply becomes a new version, hold stores diff and reasons.
    pub fn record_update(
        &mut self,
        id: &str,
        check: &UpdateCheck,
        mut new_manifest: SkillManifest,
        diff: Vec<DiffLine>,
        now: i64,
    ) -> Result<SkillUpdateOutcome, SkillLibraryError> {
        let skill = self
            .skills
            .get(id)
            .cloned()
            .ok_or_else(|| SkillLibraryError::NotFound { id: id.into() })?;
        // Keep the local source kind when the candidate came from a plain manifest.
        if skill.kind != SkillSourceKind::Github {
            new_manifest.source = skill.manifest.source.clone();
        }
        let label = (self.versions.get(id).map_or(1, Vec::len) + 1).to_string();
        match &check.decision {
            UpdateDecision::Apply => {
                new_manifest.version = label.clone();
                self.skills.insert(
                    id.to_string(),
                    LibrarySkill {
                        manifest: new_manifest.clone(),
                        ..skill
                    },
                );
                self.versions
                    .entry(id.to_string())
                    .or_default()
                    .push(SkillVersion {
                        label: label.clone(),
                        manifest: new_manifest,
                        created_at: now,
                        note: format!("update {}", check.to_version),
                    });
                let seq = self.push_history(
                    id,
                    SkillHistoryAction::UpdateApplied,
                    &label,
                    format!(
                        "applied update {} -> {}",
                        check.from_version, check.to_version
                    ),
                    now,
                    Vec::new(),
                );
                Ok(SkillUpdateOutcome::Applied {
                    skill: Box::new(self.skills[id].clone()),
                    version: label,
                    seq,
                })
            }
            UpdateDecision::Hold { reasons } => {
                let held = HeldUpdate {
                    skill_id: id.to_string(),
                    from_version: check.from_version.clone(),
                    to_version: check.to_version.clone(),
                    reasons: reasons.clone(),
                    diff,
                    at: now,
                };
                self.held
                    .entry(id.to_string())
                    .or_default()
                    .push(held.clone());
                let seq = self.push_history(
                    id,
                    SkillHistoryAction::UpdateHeld,
                    &check.to_version,
                    "update held for review".to_string(),
                    now,
                    reasons.clone(),
                );
                Ok(SkillUpdateOutcome::Held { held, seq })
            }
        }
    }

    /// Roll a skill back to any earlier version. The rollback is itself a new version
    /// and one history entry; no earlier version or history entry is ever removed.
    pub fn rollback(
        &mut self,
        id: &str,
        version: &str,
        now: i64,
    ) -> Result<LibrarySkill, SkillLibraryError> {
        let skill = self
            .skills
            .get(id)
            .cloned()
            .ok_or_else(|| SkillLibraryError::NotFound { id: id.into() })?;
        let target = self
            .versions
            .get(id)
            .and_then(|vs| vs.iter().find(|v| v.label == version))
            .cloned()
            .ok_or_else(|| SkillLibraryError::VersionNotFound {
                id: id.into(),
                version: version.into(),
            })?;
        let label = (self.versions.get(id).map_or(1, Vec::len) + 1).to_string();
        let mut manifest = target.manifest;
        manifest.version = label.clone();
        self.skills.insert(
            id.to_string(),
            LibrarySkill {
                manifest: manifest.clone(),
                ..skill
            },
        );
        self.versions
            .entry(id.to_string())
            .or_default()
            .push(SkillVersion {
                label: label.clone(),
                manifest,
                created_at: now,
                note: format!("rolled back to version {version}"),
            });
        let reason = format!("rolled back to version {version}");
        self.push_history(
            id,
            SkillHistoryAction::RolledBack,
            &label,
            reason,
            now,
            Vec::new(),
        );
        Ok(self.skills[id].clone())
    }

    /// A simple line diff for a held update: lines missing from the new text are
    /// removals, lines missing from the old text are additions, the rest are context.
    pub fn diff_text(old: &str, new: &str) -> Vec<DiffLine> {
        let old_lines: Vec<&str> = old.lines().collect();
        let new_lines: Vec<&str> = new.lines().collect();
        let mut diff = Vec::new();
        for line in &old_lines {
            let op = if new_lines.contains(line) {
                DiffOp::Context
            } else {
                DiffOp::Remove
            };
            diff.push(DiffLine {
                op,
                text: (*line).to_string(),
            });
        }
        for line in &new_lines {
            if !old_lines.contains(line) {
                diff.push(DiffLine {
                    op: DiffOp::Add,
                    text: (*line).to_string(),
                });
            }
        }
        diff
    }
}

impl SkillSourceInfo {
    /// The `owner/repo` slug for a GitHub source. The sample's display name is the slug.
    fn repo_slug(&self) -> Option<String> {
        if self.kind == "github" {
            Some(self.name.clone())
        } else {
            None
        }
    }
}
