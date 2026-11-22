//! Skills core (ADR 0007, board S40, AC-SPK-39, R-STD-7).
//!
//! Pure types and logic: parses SKILL.md frontmatter, classifies upstream updates
//! (auto-applying clean wording updates while holding licence changes, added tools,
//! added scripts, or injection patterns), preserves attribution/notice on user copies,
//! and enforces declared `reads` on context. No network or IO here.

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::stage::StageId;

/// Where a skill comes from (ADR 0007).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(tag = "kind", rename_all = "snake_case")]
#[ts(export)]
pub enum SkillSource {
    Template,
    Github {
        repo: String,
        path: String,
        commit: String,
    },
    User {
        copied_from: Option<String>,
    },
}

/// Update policy per skill source (ADR 0007).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum UpdatePolicy {
    Auto,
    Notify,
    Pinned,
}

/// Rust record of a skill (ADR 0007, S40).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SkillManifest {
    pub id: String,
    pub title: String,
    pub description: String,
    pub stages: Vec<StageId>,
    pub source: SkillSource,
    pub licence: String,
    pub notice: Option<String>,
    pub version: String,
    pub reads: Vec<String>,
    pub proposes: Vec<String>,
    pub tools: Vec<String>,
    pub scripts: Vec<String>,
    pub invocation: String,
    /// Markdown instructions, always treated as plain data (never executed).
    pub body: String,
}

impl SkillManifest {
    /// Create a user-owned copy of this skill, preserving attribution licence and notice (ADR 0007).
    pub fn copy_for_user(
        &self,
        new_id: impl Into<String>,
        new_title: impl Into<String>,
    ) -> SkillManifest {
        let id = new_id.into();
        SkillManifest {
            id: id.clone(),
            title: new_title.into(),
            description: self.description.clone(),
            stages: self.stages.clone(),
            source: SkillSource::User {
                copied_from: Some(self.id.clone()),
            },
            licence: self.licence.clone(),
            notice: self.notice.clone(),
            version: self.version.clone(),
            reads: self.reads.clone(),
            proposes: self.proposes.clone(),
            tools: self.tools.clone(),
            scripts: self.scripts.clone(),
            invocation: format!("/{id}"),
            body: self.body.clone(),
        }
    }
}

/// Why an upstream skill update is held for human review (AC-SPK-39, ADR 0007).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(tag = "code", rename_all = "snake_case")]
#[ts(export)]
pub enum HoldReason {
    LicenceChanged { from: String, to: String },
    ToolAdded { tool: String },
    ScriptAdded { script: String },
    InjectionDetected { pattern: String },
    PolicyNotify,
    PolicyPinned,
}

/// Classification outcome for an upstream skill update.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(tag = "decision", rename_all = "snake_case")]
#[ts(export)]
pub enum UpdateDecision {
    Apply,
    Hold { reasons: Vec<HoldReason> },
}

/// Recorded result of checking one skill update against its source policy.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UpdateCheck {
    pub skill_id: String,
    pub from_version: String,
    pub to_version: String,
    pub policy: UpdatePolicy,
    pub decision: UpdateDecision,
}

/// Errors returned by `parse_skill_md`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS, thiserror::Error)]
#[serde(tag = "code", rename_all = "snake_case")]
#[ts(export)]
pub enum SkillError {
    #[error("SKILL.md must begin with YAML frontmatter delimited by ---")]
    MissingFrontmatter,
    #[error("SKILL.md frontmatter is missing a closing --- delimiter")]
    UnterminatedFrontmatter,
    #[error("SKILL.md frontmatter is missing required field: {field}")]
    MissingField { field: String },
    #[error("unknown stage in SKILL.md: {stage}")]
    InvalidStage { stage: String },
}

/// One context entry supplied to a skill run.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ContextItem {
    pub key: String,
    pub content: String,
}

/// Context filtered down to only the keys declared in `manifest.reads`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct AllowedContext {
    pub skill_id: String,
    pub items: Vec<ContextItem>,
    pub excluded_keys: Vec<String>,
}

const INJECTION_PATTERNS: &[&str] = &[
    "ignore previous instructions",
    "ignore all previous",
    "disregard previous",
    "disregard system",
    "reveal system prompt",
    "bypass review",
    "skip confirmation",
    "run shell",
    "exec_command",
    "bash -c",
    "sh -c",
    "curl ",
    "wget ",
    "rm -rf",
    "chmod +x",
    "export secret",
    "exfiltrate",
    "api_key",
    "process.env",
    "id_rsa",
    "~/.ssh",
    ".env",
];

const SCRIPT_MARKERS: &[&str] = &["#!/bin/", "<script", "```sh", "```bash", "```python"];

fn strip_quotes(s: &str) -> String {
    let t = s.trim();
    if t.len() >= 2
        && ((t.starts_with('"') && t.ends_with('"')) || (t.starts_with('\'') && t.ends_with('\'')))
    {
        t[1..t.len() - 1].to_string()
    } else {
        t.to_string()
    }
}

fn parse_inline_list(s: &str) -> Vec<String> {
    let trimmed = s.trim();
    let inner = trimmed
        .strip_prefix('[')
        .and_then(|v| v.strip_suffix(']'))
        .unwrap_or(trimmed);
    inner
        .split(',')
        .map(strip_quotes)
        .filter(|v| !v.is_empty())
        .collect()
}

fn slugify(name: &str) -> String {
    let mut out = String::new();
    let mut last_dash = false;
    for ch in name.chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch.to_ascii_lowercase());
            last_dash = false;
        } else if !last_dash && !out.is_empty() {
            out.push('-');
            last_dash = true;
        }
    }
    out.trim_end_matches('-').to_string()
}

fn parse_stage(s: &str) -> Result<StageId, SkillError> {
    match s.trim().to_ascii_lowercase().as_str() {
        "planning" => Ok(StageId::Planning),
        "spec" | "specification" => Ok(StageId::Spec),
        "design" => Ok(StageId::Design),
        "frontend" => Ok(StageId::Frontend),
        "backend" => Ok(StageId::Backend),
        "integration" => Ok(StageId::Integration),
        "testing" => Ok(StageId::Testing),
        "deploy" | "deployment" => Ok(StageId::Deploy),
        other => Err(SkillError::InvalidStage {
            stage: other.to_string(),
        }),
    }
}

/// Parse a SKILL.md document with YAML frontmatter (`name` and `description` required).
/// The markdown body is preserved as plain text data.
pub fn parse_skill_md(text: &str) -> Result<SkillManifest, SkillError> {
    let normalized = text.replace("\r\n", "\n");
    let mut lines = normalized.lines();
    match lines.next() {
        Some(first) if first.trim() == "---" => {}
        _ => return Err(SkillError::MissingFrontmatter),
    }

    let mut frontmatter_lines = Vec::new();
    let mut closed = false;
    let mut body_lines = Vec::new();
    for line in lines {
        if !closed {
            if line.trim() == "---" {
                closed = true;
            } else {
                frontmatter_lines.push(line);
            }
        } else {
            body_lines.push(line);
        }
    }
    if !closed {
        return Err(SkillError::UnterminatedFrontmatter);
    }

    let mut scalars: BTreeMap<String, String> = BTreeMap::new();
    let mut lists: BTreeMap<String, Vec<String>> = BTreeMap::new();
    let mut current_list_key: Option<String> = None;

    for raw_line in frontmatter_lines {
        let trimmed = raw_line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        if let Some(item) = trimmed.strip_prefix("- ") {
            if let Some(ref key) = current_list_key {
                let val = strip_quotes(item);
                if !val.is_empty() {
                    lists.entry(key.clone()).or_default().push(val);
                }
            }
            continue;
        }
        current_list_key = None;
        if let Some((k, v)) = raw_line.split_once(':') {
            let key = k.trim().to_ascii_lowercase();
            let val = v.trim();
            if val.is_empty() {
                current_list_key = Some(key);
            } else if val.starts_with('[') && val.ends_with(']') {
                lists.insert(key, parse_inline_list(val));
            } else {
                scalars.insert(key, strip_quotes(val));
            }
        }
    }

    let name = scalars
        .get("name")
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .ok_or_else(|| SkillError::MissingField {
            field: "name".into(),
        })?
        .to_string();

    let description = scalars
        .get("description")
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .ok_or_else(|| SkillError::MissingField {
            field: "description".into(),
        })?
        .to_string();

    let id = scalars
        .get("id")
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| slugify(&name));

    let title = scalars
        .get("title")
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or(name);

    let stage_values = lists.get("stages").cloned().unwrap_or_default();
    let mut stages = Vec::with_capacity(stage_values.len());
    for s in stage_values {
        stages.push(parse_stage(&s)?);
    }

    let licence = scalars
        .get("licence")
        .or_else(|| scalars.get("license"))
        .cloned()
        .unwrap_or_default();

    let notice = scalars
        .get("notice")
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty());

    let version = scalars
        .get("version")
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "0.1.0".into());

    let invocation = scalars
        .get("invocation")
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| format!("/{id}"));

    let body = body_lines.join("\n").trim().to_string();

    Ok(SkillManifest {
        id,
        title,
        description,
        stages,
        source: SkillSource::User { copied_from: None },
        licence,
        notice,
        version,
        reads: lists.remove("reads").unwrap_or_default(),
        proposes: lists.remove("proposes").unwrap_or_default(),
        tools: lists.remove("tools").unwrap_or_default(),
        scripts: lists.remove("scripts").unwrap_or_default(),
        invocation,
        body,
    })
}

/// Classify an upstream skill update (AC-SPK-39, ADR 0007).
///
/// Wording-only updates return `Apply`. Any licence change, newly added tool,
/// newly added script, or injection/exfiltration pattern returns `Hold(reasons)`.
pub fn classify_update(old: &SkillManifest, new: &SkillManifest) -> UpdateDecision {
    let mut reasons = Vec::new();

    if old.licence.trim() != new.licence.trim() {
        reasons.push(HoldReason::LicenceChanged {
            from: old.licence.clone(),
            to: new.licence.clone(),
        });
    }

    for tool in &new.tools {
        if !old.tools.iter().any(|t| t == tool) {
            reasons.push(HoldReason::ToolAdded { tool: tool.clone() });
        }
    }

    for script in &new.scripts {
        if !old.scripts.iter().any(|s| s == script) {
            reasons.push(HoldReason::ScriptAdded {
                script: script.clone(),
            });
        }
    }

    let old_body_lower = old.body.to_ascii_lowercase();
    let new_body_lower = new.body.to_ascii_lowercase();
    for marker in SCRIPT_MARKERS {
        if new_body_lower.contains(marker) && !old_body_lower.contains(marker) {
            reasons.push(HoldReason::ScriptAdded {
                script: (*marker).into(),
            });
        }
    }

    let scan_targets = [
        new.title.as_str(),
        new.description.as_str(),
        new.body.as_str(),
    ];
    for text in scan_targets {
        let lower = text.to_ascii_lowercase();
        for pat in INJECTION_PATTERNS {
            if lower.contains(pat) {
                let reason = HoldReason::InjectionDetected {
                    pattern: (*pat).into(),
                };
                if !reasons.contains(&reason) {
                    reasons.push(reason);
                }
            }
        }
    }

    if reasons.is_empty() {
        UpdateDecision::Apply
    } else {
        UpdateDecision::Hold { reasons }
    }
}

/// Evaluate an update against a source's `UpdatePolicy`.
pub fn check_update(old: &SkillManifest, new: &SkillManifest, policy: UpdatePolicy) -> UpdateCheck {
    let base = classify_update(old, new);
    let decision = match (policy, base) {
        (UpdatePolicy::Auto, d) => d,
        (UpdatePolicy::Notify, UpdateDecision::Apply) => UpdateDecision::Hold {
            reasons: vec![HoldReason::PolicyNotify],
        },
        (UpdatePolicy::Notify, UpdateDecision::Hold { mut reasons }) => {
            reasons.push(HoldReason::PolicyNotify);
            UpdateDecision::Hold { reasons }
        }
        (UpdatePolicy::Pinned, UpdateDecision::Apply) => UpdateDecision::Hold {
            reasons: vec![HoldReason::PolicyPinned],
        },
        (UpdatePolicy::Pinned, UpdateDecision::Hold { mut reasons }) => {
            reasons.push(HoldReason::PolicyPinned);
            UpdateDecision::Hold { reasons }
        }
    };

    UpdateCheck {
        skill_id: new.id.clone(),
        from_version: old.version.clone(),
        to_version: new.version.clone(),
        policy,
        decision,
    }
}

/// Enforce `manifest.reads`: return only context items whose key is declared in `reads`.
pub fn enforce(manifest: &SkillManifest, context: &[ContextItem]) -> AllowedContext {
    let mut items = Vec::new();
    let mut excluded_keys = Vec::new();

    for entry in context {
        let key_norm = entry.key.trim();
        let allowed = manifest
            .reads
            .iter()
            .any(|r| r.trim().eq_ignore_ascii_case(key_norm));
        if allowed {
            items.push(entry.clone());
        } else {
            excluded_keys.push(entry.key.clone());
        }
    }

    AllowedContext {
        skill_id: manifest.id.clone(),
        items,
        excluded_keys,
    }
}
