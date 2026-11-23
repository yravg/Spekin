//! Seed Meranti Yard from the sample fixture (ADR 0008).
//!
//! The seed is the same data the boards draw, turned into the core types a
//! [`spekin_core::Store`] persists. `seed-sample` and the in-memory default both use it.

use std::collections::BTreeMap;

use serde_json::Value;
use spekin_core::{
    ArtifactRevisionRecord, ArtifactRevisionState, AuditLog, BoardArtifact, BoardSnapshot,
    ContextItemStatus, Fixture, FixtureError, GENESIS_HASH, Hunk, Ledger, LedgerCaps, Project,
    ProjectEntry, ProjectState, Proposal, RequiredInput, Revision, SECONDS_PER_DAY, SkillLibrary,
    Stage, StoreSeed,
};

/// The id the sample fixture is served under: /p/meranti-yard/design.
pub const SAMPLE_PROJECT_ID: &str = "meranti-yard";

fn parse_rev_number(label: &str) -> u32 {
    label
        .strip_prefix('r')
        .and_then(|s| s.parse::<u32>().ok())
        .unwrap_or(1)
}

/// Parse the fixture and build the full seed. `now` is the fixed clock used for
/// the audit entries and the restore window (deterministic, no system clock).
pub fn seed_from_fixture(text: &str, now: i64) -> Result<(String, StoreSeed), FixtureError> {
    let fixture = Fixture::from_json(text)?;
    let raw: Value = serde_json::from_str(text).unwrap_or(Value::Null);

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

    let state = ProjectState {
        version: 1,
        proposals,
        rejections: Vec::new(),
        ledger,
        board,
        handoff_revisions,
        required_inputs,
        audit: AuditLog::new(),
        audit_head: GENESIS_HASH.to_owned(),
    };

    // 5. Project entries for delete / restore (IMP-29).
    let sample_project: Project =
        serde_json::from_value(raw["PROJECT"].clone()).unwrap_or(fixture.project.clone());
    let mut entries = BTreeMap::new();
    entries.insert(
        SAMPLE_PROJECT_ID.to_owned(),
        ProjectEntry::new(
            SAMPLE_PROJECT_ID,
            sample_project.clone(),
            vec!["r14".to_owned()],
            now,
        ),
    );
    // The fixture's Recently deleted row (INTAKE_DELETED) seeds one entry three days
    // into the 30-day window, so S27's "27 days left" is served without a clock.
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
        entries.insert(id, entry);
    }

    let seed = StoreSeed {
        project: fixture.project,
        stages: fixture.stages,
        revisions,
        state,
        entries,
        library: SkillLibrary::from_fixture(&raw),
    };

    Ok((SAMPLE_PROJECT_ID.to_owned(), seed))
}

/// The eight stages the seed always provides, for callers that only need the list.
pub fn seed_stages(text: &str) -> Result<Vec<Stage>, FixtureError> {
    Ok(Fixture::from_json(text)?.stages)
}
