//! Fail-closed GenUI card schema validator (S38, SPK-T-13, AC-SPK-25, R-GUI-2/6/8).
//!
//! Pure validation: no IO, no HTML/script evaluation, never returns a partial card.
//! Every public type derives `ts_rs::TS` so the UI reads the exact same contract.

use serde::{Deserialize, Serialize};
use serde_json::Value;
use ts_rs::TS;

pub const SCHEMA_VERSION: u32 = 1;
pub const MAX_NESTING_DEPTH: usize = 6;
pub const MAX_ITEMS: usize = 50;
pub const MAX_TEXT_LEN: usize = 2_000;

/// Provenance label required on every GenUI card (R-GUI-1).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum Provenance {
    AcceptedArtifact,
    ModelProposal,
    ImportedObservation,
}

/// Strictly allowlisted UI actions a GenUI card may offer.
/// None of these can accept a spec, deploy, spend credits, or execute tools/shell.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum AllowedActionKind {
    Pin,
    Unpin,
    ExpandDetails,
    OpenReview,
    Compare,
    EditDraft,
    SelectOption,
    SkipQuestion,
    ExportJson,
}

/// One allowlisted action button on a GenUI card.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(deny_unknown_fields)]
#[ts(export)]
pub struct GenUiAction {
    pub kind: AllowedActionKind,
    pub label: String,
    #[serde(default)]
    pub target_id: Option<String>,
    #[serde(default)]
    pub href: Option<String>,
}

/// Status of one checklist row (S38).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ChecklistStatus {
    Untested,
    PassedFixture,
    Passed,
    Failed,
    NoEvidence,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(deny_unknown_fields)]
#[ts(export)]
pub struct ChecklistItem {
    pub id: String,
    pub label: String,
    pub checked: bool,
    pub status: ChecklistStatus,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(deny_unknown_fields)]
#[ts(export)]
pub struct ComparisonOption {
    pub id: String,
    pub label: String,
    #[serde(default)]
    pub badge: Option<String>,
    #[serde(default)]
    pub summary: Option<String>,
    #[serde(default)]
    pub recommended: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(deny_unknown_fields)]
#[ts(export)]
pub struct QuestionOption {
    pub id: String,
    pub label: String,
    #[serde(default)]
    pub hint: Option<String>,
    #[serde(default)]
    pub recommended: bool,
}

/// The three allowlisted GenUI card families (S38, IMP-10).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(tag = "family", rename_all = "snake_case")]
#[ts(export)]
pub enum GenUiFamily {
    Checklist {
        items: Vec<ChecklistItem>,
        #[serde(default)]
        summary: Option<String>,
    },
    Comparison {
        options: Vec<ComparisonOption>,
        #[serde(default)]
        baseline_id: Option<String>,
    },
    Question {
        step: u32,
        total_steps: u32,
        prompt: String,
        #[serde(default)]
        why: Option<String>,
        options: Vec<QuestionOption>,
        #[serde(default)]
        allow_custom: bool,
    },
}

/// A validated GenUI card. Only constructed after all schema and safety checks pass.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct GenUiCard {
    pub schema_version: u32,
    pub id: String,
    pub title: String,
    pub provenance: Provenance,
    #[serde(default)]
    pub body: Option<String>,
    #[serde(default)]
    pub links: Vec<String>,
    #[serde(default)]
    pub actions: Vec<GenUiAction>,
    #[serde(flatten)]
    pub content: GenUiFamily,
}

/// Why a GenUI payload was rejected (fail-closed, AC-SPK-25).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS, thiserror::Error)]
#[serde(tag = "code", rename_all = "snake_case")]
#[ts(export)]
pub enum RejectionReason {
    #[error("invalid JSON: {message}")]
    InvalidJson { message: String },
    #[error("unsupported schema_version {found}, expected {expected}")]
    UnsupportedSchemaVersion { found: u32, expected: u32 },
    #[error("JSON nesting depth {depth} exceeds maximum {max}")]
    ExcessiveNesting { depth: usize, max: usize },
    #[error("unknown component family: {family}")]
    UnknownComponent { family: String },
    #[error("invalid enum value '{value}' for field '{field}'")]
    InvalidEnum { field: String, value: String },
    #[error("missing required field: {field}")]
    MissingRequiredField { field: String },
    #[error("too many items in '{field}': {count} exceeds maximum {max}")]
    TooManyItems {
        field: String,
        count: usize,
        max: usize,
    },
    #[error("text too long in '{field}': {len} exceeds maximum {max}")]
    TextTooLong {
        field: String,
        len: usize,
        max: usize,
    },
    #[error("unsafe URL in '{field}': {url}")]
    UnsafeUrl { field: String, url: String },
    #[error("disallowed script or tool pattern '{pattern}' in '{field}'")]
    DisallowedScriptOrTool { field: String, pattern: String },
    #[error("privilege-escalating action rejected: {action}")]
    PrivilegeEscalation { action: String },
}

/// Tagged validation result for TypeScript consumers: either a complete validated card or a rejection.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(tag = "status", rename_all = "snake_case")]
#[ts(export)]
pub enum GenUiValidation {
    Ok { card: GenUiCard },
    Rejected { reason: RejectionReason },
}

const PRIVILEGED_ACTIONS: &[&str] = &[
    "accept",
    "accept_spec",
    "approve",
    "deploy",
    "spend",
    "spend_credits",
    "grant_admin",
    "grant_role",
    "escalate",
    "bypass_review",
    "run_shell",
    "exec",
    "exec_command",
    "shell",
    "write_file",
    "delete_project",
];

const DISALLOWED_PATTERNS: &[&str] = &[
    "<script",
    "</script",
    "javascript:",
    "vbscript:",
    "onerror=",
    "onload=",
    "eval(",
    "function(",
    "document.cookie",
    "window.location",
    "bash -c",
    "sh -c",
    "rm -rf",
    "mcp__",
    "exec_command",
    "run_shell",
    "child_process",
    "tool_call",
    "tool_use",
];

fn json_depth(v: &Value) -> usize {
    match v {
        Value::Array(items) => 1 + items.iter().map(json_depth).max().unwrap_or(0),
        Value::Object(map) => 1 + map.values().map(json_depth).max().unwrap_or(0),
        _ => 1,
    }
}

fn check_safe_url(field: &str, url: &str) -> Result<(), RejectionReason> {
    let trimmed = url.trim();
    if trimmed.is_empty() || trimmed.chars().any(|c| c.is_control()) {
        return Err(RejectionReason::UnsafeUrl {
            field: field.into(),
            url: url.into(),
        });
    }
    let lower = trimmed.to_ascii_lowercase();
    let ok_scheme = lower.starts_with("https://")
        || lower.starts_with("http://")
        || (trimmed.starts_with('/') && !trimmed.starts_with("//"));
    if !ok_scheme {
        return Err(RejectionReason::UnsafeUrl {
            field: field.into(),
            url: url.into(),
        });
    }
    Ok(())
}

fn scan_strings(field: &str, v: &Value) -> Result<(), RejectionReason> {
    match v {
        Value::String(s) => {
            if s.len() > MAX_TEXT_LEN {
                return Err(RejectionReason::TextTooLong {
                    field: field.into(),
                    len: s.len(),
                    max: MAX_TEXT_LEN,
                });
            }
            let lower = s.to_ascii_lowercase();
            for pat in DISALLOWED_PATTERNS {
                if lower.contains(pat) {
                    return Err(RejectionReason::DisallowedScriptOrTool {
                        field: field.into(),
                        pattern: (*pat).into(),
                    });
                }
            }
            Ok(())
        }
        Value::Array(arr) => {
            if arr.len() > MAX_ITEMS {
                return Err(RejectionReason::TooManyItems {
                    field: field.into(),
                    count: arr.len(),
                    max: MAX_ITEMS,
                });
            }
            for item in arr {
                scan_strings(field, item)?;
            }
            Ok(())
        }
        Value::Object(map) => {
            for (k, val) in map {
                scan_strings(k, val)?;
            }
            Ok(())
        }
        _ => Ok(()),
    }
}

fn is_allowed_family_key(family: &str, key: &str) -> bool {
    let common = matches!(
        key,
        "schema_version" | "id" | "title" | "provenance" | "body" | "links" | "actions" | "family"
    );
    if common {
        return true;
    }
    match family {
        "checklist" => matches!(key, "items" | "summary"),
        "comparison" => matches!(key, "options" | "baseline_id"),
        "question" => matches!(
            key,
            "step" | "total_steps" | "prompt" | "why" | "options" | "allow_custom"
        ),
        _ => false,
    }
}

/// Validate raw GenUI JSON fail-closed, returning either a complete `GenUiCard` or `RejectionReason`.
pub fn validate_genui_json(raw: &str) -> Result<GenUiCard, RejectionReason> {
    let value: Value = serde_json::from_str(raw).map_err(|e| RejectionReason::InvalidJson {
        message: e.to_string(),
    })?;

    let depth = json_depth(&value);
    if depth > MAX_NESTING_DEPTH {
        return Err(RejectionReason::ExcessiveNesting {
            depth,
            max: MAX_NESTING_DEPTH,
        });
    }

    let obj = value
        .as_object()
        .ok_or_else(|| RejectionReason::InvalidJson {
            message: "top-level GenUI payload must be a JSON object".into(),
        })?;

    let version = obj
        .get("schema_version")
        .and_then(Value::as_u64)
        .ok_or_else(|| RejectionReason::MissingRequiredField {
            field: "schema_version".into(),
        })?;
    if version != u64::from(SCHEMA_VERSION) {
        return Err(RejectionReason::UnsupportedSchemaVersion {
            found: u32::try_from(version).unwrap_or(u32::MAX),
            expected: SCHEMA_VERSION,
        });
    }

    let family = obj.get("family").and_then(Value::as_str).ok_or_else(|| {
        RejectionReason::MissingRequiredField {
            field: "family".into(),
        }
    })?;
    if !matches!(family, "checklist" | "comparison" | "question") {
        return Err(RejectionReason::UnknownComponent {
            family: family.into(),
        });
    }

    for key in obj.keys() {
        if !is_allowed_family_key(family, key) {
            return Err(RejectionReason::UnknownComponent {
                family: format!("{family}.{key}"),
            });
        }
    }

    let provenance = obj
        .get("provenance")
        .and_then(Value::as_str)
        .ok_or_else(|| RejectionReason::MissingRequiredField {
            field: "provenance".into(),
        })?;
    if !matches!(
        provenance,
        "accepted_artifact" | "model_proposal" | "imported_observation"
    ) {
        return Err(RejectionReason::InvalidEnum {
            field: "provenance".into(),
            value: provenance.into(),
        });
    }

    // Check actions for privilege escalation or unknown action kinds before full parse.
    if let Some(actions) = obj.get("actions").and_then(Value::as_array) {
        if actions.len() > MAX_ITEMS {
            return Err(RejectionReason::TooManyItems {
                field: "actions".into(),
                count: actions.len(),
                max: MAX_ITEMS,
            });
        }
        for action in actions {
            if let Some(kind) = action.get("kind").and_then(Value::as_str) {
                let lower = kind.to_ascii_lowercase();
                if PRIVILEGED_ACTIONS.iter().any(|p| *p == lower) {
                    return Err(RejectionReason::PrivilegeEscalation {
                        action: kind.into(),
                    });
                }
                if serde_json::from_value::<AllowedActionKind>(Value::String(kind.into())).is_err()
                {
                    return Err(RejectionReason::InvalidEnum {
                        field: "actions.kind".into(),
                        value: kind.into(),
                    });
                }
            }
            if let Some(href) = action.get("href").and_then(Value::as_str) {
                check_safe_url("actions.href", href)?;
            }
        }
    }

    if let Some(links) = obj.get("links").and_then(Value::as_array) {
        if links.len() > MAX_ITEMS {
            return Err(RejectionReason::TooManyItems {
                field: "links".into(),
                count: links.len(),
                max: MAX_ITEMS,
            });
        }
        for link in links {
            let url = link.as_str().ok_or_else(|| RejectionReason::UnsafeUrl {
                field: "links".into(),
                url: link.to_string(),
            })?;
            check_safe_url("links", url)?;
        }
    }

    // Check checklist item statuses explicitly so bad enums return InvalidEnum.
    if family == "checklist"
        && let Some(items) = obj.get("items").and_then(Value::as_array)
    {
        for item in items {
            if let Some(st) = item.get("status").and_then(Value::as_str)
                && serde_json::from_value::<ChecklistStatus>(Value::String(st.into())).is_err()
            {
                return Err(RejectionReason::InvalidEnum {
                    field: "items.status".into(),
                    value: st.into(),
                });
            }
        }
    }

    // Scan all strings and arrays for scripts, tool names, text length, and item limits.
    scan_strings("root", &value)?;

    let card: GenUiCard =
        serde_json::from_value(value).map_err(|e| RejectionReason::InvalidJson {
            message: e.to_string(),
        })?;

    if card.id.trim().is_empty() {
        return Err(RejectionReason::MissingRequiredField { field: "id".into() });
    }
    if card.title.trim().is_empty() {
        return Err(RejectionReason::MissingRequiredField {
            field: "title".into(),
        });
    }

    match &card.content {
        GenUiFamily::Checklist { items, .. } => {
            if items.is_empty() {
                return Err(RejectionReason::MissingRequiredField {
                    field: "items".into(),
                });
            }
        }
        GenUiFamily::Comparison { options, .. } => {
            if options.is_empty() {
                return Err(RejectionReason::MissingRequiredField {
                    field: "options".into(),
                });
            }
        }
        GenUiFamily::Question {
            step,
            total_steps,
            prompt,
            options,
            ..
        } => {
            if prompt.trim().is_empty() {
                return Err(RejectionReason::MissingRequiredField {
                    field: "prompt".into(),
                });
            }
            if options.is_empty() {
                return Err(RejectionReason::MissingRequiredField {
                    field: "options".into(),
                });
            }
            if *step == 0 || *total_steps == 0 || *step > *total_steps {
                return Err(RejectionReason::InvalidEnum {
                    field: "step".into(),
                    value: format!("{step}/{total_steps}"),
                });
            }
        }
    }

    Ok(card)
}

/// Convenience wrapper returning the tagged `GenUiValidation` enum (`Ok` or `Rejected`).
pub fn validate_genui(raw: &str) -> GenUiValidation {
    match validate_genui_json(raw) {
        Ok(card) => GenUiValidation::Ok { card },
        Err(reason) => GenUiValidation::Rejected { reason },
    }
}
