//! Coding handoff manifest core for S34 (DPAI addendum, point 3).
//!
//! Pure Rust, no IO:
//! - Only accepted, latest revisions can be selected; drafts and stale revisions are refused.
//! - Each included artifact records its exact revision and SHA-256 content hash.
//! - Exclusions and required inputs are listed explicitly; missing inputs (e.g. "PRD: missing")
//!   are never invented.
//! - Output ordering and `to_json()` serialization are deterministic (byte-identical across exports).
//! - No share link, URL, token, or expiry field exists (R-WS-3: sharing stays later).

use std::collections::{HashMap, HashSet};
use std::fmt::Write as _;

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use ts_rs::TS;

use crate::revision::Revision;

/// Lifecycle state of an artifact revision considered for coding handoff (S34).
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ArtifactRevisionState {
    Accepted,
    Draft,
    Stale,
    Pending,
    Reference,
}

impl ArtifactRevisionState {
    fn default_exclusion_reason(self) -> &'static str {
        match self {
            ArtifactRevisionState::Accepted => "Not selected for this handoff.",
            ArtifactRevisionState::Draft => "Draft, not accepted. Accept it in review first.",
            ArtifactRevisionState::Stale => "Stale revision. Select the latest accepted revision.",
            ArtifactRevisionState::Pending => {
                "Pending alternatives are never bundled. Accept one take first."
            }
            ArtifactRevisionState::Reference => "Reference artifact, not an accepted deliverable.",
        }
    }
}

/// One candidate artifact revision available in the workspace when building a handoff manifest.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ArtifactRevisionRecord {
    pub artifact_id: String,
    pub name: String,
    pub kind: String,
    pub revision: Revision,
    pub state: ArtifactRevisionState,
    pub latest_accepted_rev: Option<u32>,
    pub exclusion_reason: Option<String>,
}

/// One artifact + exact revision number chosen by the user for handoff.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ManifestSelectionItem {
    pub artifact_id: String,
    pub revision_n: u32,
}

/// The selection request for a coding handoff manifest (S34).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ManifestSelection {
    pub manifest_id: String,
    pub spec_rev: String,
    pub framework: String,
    pub items: Vec<ManifestSelectionItem>,
}

/// A required input checked when sealing a handoff manifest (for example PRD, DESIGN.md).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct RequiredInput {
    pub name: String,
    pub present: bool,
    pub revision: Option<String>,
}

/// Typed errors returned when a handoff selection cannot be sealed.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, thiserror::Error, TS)]
#[serde(tag = "kind", rename_all = "snake_case")]
#[ts(export)]
pub enum ManifestError {
    #[error("handoff selection must include at least one accepted artifact")]
    EmptySelection,
    #[error("selected artifact {artifact_id} r{revision_n} was not found")]
    NotFound {
        artifact_id: String,
        revision_n: u32,
    },
    #[error(
        "cannot select draft {artifact_id} r{revision_n}: only accepted revisions may be handed off"
    )]
    DraftNotAccepted {
        artifact_id: String,
        revision_n: u32,
    },
    #[error(
        "cannot select stale {artifact_id} r{selected_n}: revision is no longer the latest accepted"
    )]
    StaleRevision {
        artifact_id: String,
        selected_n: u32,
        latest_accepted_n: Option<u32>,
    },
    #[error("cannot select {artifact_id} r{revision_n}: state is not accepted")]
    NotSelectable {
        artifact_id: String,
        revision_n: u32,
        state: ArtifactRevisionState,
    },
}

/// One accepted artifact included in a sealed handoff manifest.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ManifestArtifact {
    pub artifact_id: String,
    pub name: String,
    pub kind: String,
    pub revision_n: u32,
    pub revision_label: String,
    /// Lowercase 64-character SHA-256 hex digest of the exact revision content.
    pub sha256: String,
}

/// One workspace artifact explicitly listed as excluded from the handoff.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ManifestExclusion {
    pub artifact_id: String,
    pub name: String,
    pub revision_label: String,
    pub state: ArtifactRevisionState,
    pub reason: String,
}

/// Presence status of a required input in the handoff manifest.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ManifestInputStatus {
    Present,
    Missing,
}

/// One required input recorded in the manifest; missing inputs are explicit and never invented.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ManifestInput {
    pub name: String,
    pub status: ManifestInputStatus,
    pub revision: Option<String>,
    /// Human-readable line such as "PRD: missing" or "DESIGN.md: r3".
    pub label: String,
}

/// Deterministic, immutable coding handoff manifest (S34).
///
/// By design (R-WS-3), no URL, share link, token, or expiry field exists here.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Manifest {
    pub manifest_id: String,
    pub spec_rev: String,
    pub framework: String,
    pub artifacts: Vec<ManifestArtifact>,
    pub exclusions: Vec<ManifestExclusion>,
    pub required_inputs: Vec<ManifestInput>,
}

impl Manifest {
    /// Serialize the manifest as deterministic, pretty-printed JSON.
    /// Two exports of the same selection are always byte-identical.
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }
}

/// Lowercase 64-character SHA-256 hex digest of `content`.
pub fn sha256_hex(content: &str) -> String {
    let digest = Sha256::digest(content.as_bytes());
    let mut out = String::with_capacity(64);
    for byte in digest {
        let _ = write!(&mut out, "{byte:02x}");
    }
    out
}

/// Build a deterministic coding handoff manifest from a selection, the known artifact revisions,
/// and the required inputs.
pub fn build_manifest(
    selection: &ManifestSelection,
    revisions: &[ArtifactRevisionRecord],
    inputs: &[RequiredInput],
) -> Result<Manifest, ManifestError> {
    if selection.items.is_empty() {
        return Err(ManifestError::EmptySelection);
    }

    // Track the highest accepted revision number per artifact_id so superseded revisions
    // are always detected as stale even if their stored state wasn't flipped yet.
    let mut max_accepted_by_id: HashMap<&str, u32> = HashMap::new();
    for rec in revisions {
        if rec.state == ArtifactRevisionState::Accepted {
            max_accepted_by_id
                .entry(rec.artifact_id.as_str())
                .and_modify(|max_n| {
                    if rec.revision.n > *max_n {
                        *max_n = rec.revision.n;
                    }
                })
                .or_insert(rec.revision.n);
        }
    }

    let mut selected_keys: HashSet<(&str, u32)> = HashSet::new();
    let mut artifacts: Vec<ManifestArtifact> = Vec::with_capacity(selection.items.len());

    for sel in &selection.items {
        let Some(rec) = revisions
            .iter()
            .find(|r| r.artifact_id == sel.artifact_id && r.revision.n == sel.revision_n)
        else {
            return Err(ManifestError::NotFound {
                artifact_id: sel.artifact_id.clone(),
                revision_n: sel.revision_n,
            });
        };

        match rec.state {
            ArtifactRevisionState::Draft => {
                return Err(ManifestError::DraftNotAccepted {
                    artifact_id: rec.artifact_id.clone(),
                    revision_n: rec.revision.n,
                });
            }
            ArtifactRevisionState::Stale => {
                let latest = rec
                    .latest_accepted_rev
                    .or_else(|| max_accepted_by_id.get(rec.artifact_id.as_str()).copied());
                return Err(ManifestError::StaleRevision {
                    artifact_id: rec.artifact_id.clone(),
                    selected_n: rec.revision.n,
                    latest_accepted_n: latest,
                });
            }
            ArtifactRevisionState::Pending | ArtifactRevisionState::Reference => {
                return Err(ManifestError::NotSelectable {
                    artifact_id: rec.artifact_id.clone(),
                    revision_n: rec.revision.n,
                    state: rec.state,
                });
            }
            ArtifactRevisionState::Accepted => {
                if let Some(&latest_n) = max_accepted_by_id.get(rec.artifact_id.as_str())
                    && latest_n > rec.revision.n
                {
                    return Err(ManifestError::StaleRevision {
                        artifact_id: rec.artifact_id.clone(),
                        selected_n: rec.revision.n,
                        latest_accepted_n: Some(latest_n),
                    });
                }
                if selected_keys.insert((rec.artifact_id.as_str(), rec.revision.n)) {
                    artifacts.push(ManifestArtifact {
                        artifact_id: rec.artifact_id.clone(),
                        name: rec.name.clone(),
                        kind: rec.kind.clone(),
                        revision_n: rec.revision.n,
                        revision_label: rec.revision.label(),
                        sha256: sha256_hex(&rec.revision.content),
                    });
                }
            }
        }
    }

    let mut exclusions: Vec<ManifestExclusion> = revisions
        .iter()
        .filter(|rec| !selected_keys.contains(&(rec.artifact_id.as_str(), rec.revision.n)))
        .map(|rec| ManifestExclusion {
            artifact_id: rec.artifact_id.clone(),
            name: rec.name.clone(),
            revision_label: rec.revision.label(),
            state: rec.state,
            reason: rec
                .exclusion_reason
                .clone()
                .unwrap_or_else(|| rec.state.default_exclusion_reason().to_string()),
        })
        .collect();

    let mut required_inputs: Vec<ManifestInput> = inputs
        .iter()
        .map(|input| {
            if input.present {
                let label = match &input.revision {
                    Some(rev) => format!("{}: {rev}", input.name),
                    None => format!("{}: present", input.name),
                };
                ManifestInput {
                    name: input.name.clone(),
                    status: ManifestInputStatus::Present,
                    revision: input.revision.clone(),
                    label,
                }
            } else {
                ManifestInput {
                    name: input.name.clone(),
                    status: ManifestInputStatus::Missing,
                    revision: None,
                    label: format!("{}: missing", input.name),
                }
            }
        })
        .collect();

    // Stable deterministic ordering for every list in the manifest.
    artifacts.sort_by(|a, b| {
        a.artifact_id
            .cmp(&b.artifact_id)
            .then_with(|| a.revision_n.cmp(&b.revision_n))
    });
    exclusions.sort_by(|a, b| {
        a.artifact_id
            .cmp(&b.artifact_id)
            .then_with(|| a.revision_label.cmp(&b.revision_label))
            .then_with(|| a.state.cmp(&b.state))
            .then_with(|| a.name.cmp(&b.name))
            .then_with(|| a.reason.cmp(&b.reason))
    });
    required_inputs.sort_by(|a, b| {
        a.name
            .cmp(&b.name)
            .then_with(|| a.status.cmp(&b.status))
            .then_with(|| a.revision.cmp(&b.revision))
            .then_with(|| a.label.cmp(&b.label))
    });

    Ok(Manifest {
        manifest_id: selection.manifest_id.clone(),
        spec_rev: selection.spec_rev.clone(),
        framework: selection.framework.clone(),
        artifacts,
        exclusions,
        required_inputs,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sha256_hex_matches_known_nist_test_vector() {
        // SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
        assert_eq!(
            sha256_hex(""),
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        );
        // SHA-256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
        assert_eq!(
            sha256_hex("abc"),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }
}
