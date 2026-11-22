use proptest::prelude::*;
use spekin_core::handoff::{
    ArtifactRevisionRecord, ArtifactRevisionState, ManifestError, ManifestInputStatus,
    ManifestSelection, ManifestSelectionItem, RequiredInput, build_manifest, sha256_hex,
};
use spekin_core::revision::Revision;

fn meranti_revisions() -> Vec<ArtifactRevisionRecord> {
    vec![
        ArtifactRevisionRecord {
            artifact_id: "F-03".to_string(),
            name: "Variance table".to_string(),
            kind: "frame".to_string(),
            revision: Revision {
                n: 6,
                content: "<frame id='F-03'>Variance table r6</frame>".to_string(),
            },
            state: ArtifactRevisionState::Accepted,
            latest_accepted_rev: Some(6),
            exclusion_reason: None,
        },
        ArtifactRevisionRecord {
            artifact_id: "F-01".to_string(),
            name: "Portfolio overview".to_string(),
            kind: "frame".to_string(),
            revision: Revision {
                n: 4,
                content: "<frame id='F-01'>Portfolio overview r4</frame>".to_string(),
            },
            state: ArtifactRevisionState::Accepted,
            latest_accepted_rev: Some(4),
            exclusion_reason: None,
        },
        ArtifactRevisionRecord {
            artifact_id: "F-04".to_string(),
            name: "Alert drawer".to_string(),
            kind: "frame".to_string(),
            revision: Revision::first("<frame id='F-04'>Alert drawer draft</frame>"),
            state: ArtifactRevisionState::Draft,
            latest_accepted_rev: None,
            exclusion_reason: Some("Draft, not accepted. Accept it in review first.".to_string()),
        },
        ArtifactRevisionRecord {
            artifact_id: "F-03".to_string(),
            name: "Variance table".to_string(),
            kind: "frame".to_string(),
            revision: Revision {
                n: 5,
                content: "<frame id='F-03'>Variance table r5</frame>".to_string(),
            },
            state: ArtifactRevisionState::Stale,
            latest_accepted_rev: Some(6),
            exclusion_reason: Some("r6 was accepted at 12:20. Pick r6.".to_string()),
        },
        ArtifactRevisionRecord {
            artifact_id: "REF-02".to_string(),
            name: "Site cost report".to_string(),
            kind: "ref".to_string(),
            revision: Revision::first("PNG reference"),
            state: ArtifactRevisionState::Reference,
            latest_accepted_rev: None,
            exclusion_reason: Some("Reference image, not a design frame.".to_string()),
        },
    ]
}

fn meranti_selection() -> ManifestSelection {
    ManifestSelection {
        manifest_id: "m-0007".to_string(),
        spec_rev: "r14".to_string(),
        framework: "React".to_string(),
        items: vec![
            ManifestSelectionItem {
                artifact_id: "F-03".to_string(),
                revision_n: 6,
            },
            ManifestSelectionItem {
                artifact_id: "F-01".to_string(),
                revision_n: 4,
            },
        ],
    }
}

fn meranti_inputs() -> Vec<RequiredInput> {
    vec![
        RequiredInput {
            name: "DESIGN.md".to_string(),
            present: true,
            revision: Some("r3".to_string()),
        },
        RequiredInput {
            name: "PRD".to_string(),
            present: false,
            revision: Some("should-never-be-invented".to_string()),
        },
    ]
}

#[test]
fn builds_stable_ordered_manifest_with_sha256_exclusions_and_explicit_missing_inputs() {
    let manifest = build_manifest(
        &meranti_selection(),
        &meranti_revisions(),
        &meranti_inputs(),
    )
    .expect("accepted selection builds manifest");

    // Stable order by artifact_id: F-01 before F-03 even though F-03 was listed first.
    let ids: Vec<&str> = manifest
        .artifacts
        .iter()
        .map(|a| a.artifact_id.as_str())
        .collect();
    assert_eq!(ids, vec!["F-01", "F-03"]);
    assert_eq!(manifest.artifacts[0].revision_label, "r4");
    assert_eq!(manifest.artifacts[0].sha256.len(), 64);
    assert_eq!(
        manifest.artifacts[0].sha256,
        sha256_hex("<frame id='F-01'>Portfolio overview r4</frame>")
    );

    // Exclusions list every non-selected revision explicitly.
    let excluded_ids: Vec<&str> = manifest
        .exclusions
        .iter()
        .map(|e| e.artifact_id.as_str())
        .collect();
    assert_eq!(excluded_ids, vec!["F-03", "F-04", "REF-02"]);

    // Required inputs sorted stably; missing PRD is explicit and never invented.
    assert_eq!(manifest.required_inputs.len(), 2);
    assert_eq!(manifest.required_inputs[0].name, "DESIGN.md");
    assert_eq!(manifest.required_inputs[0].status, ManifestInputStatus::Present);
    assert_eq!(manifest.required_inputs[0].label, "DESIGN.md: r3");

    assert_eq!(manifest.required_inputs[1].name, "PRD");
    assert_eq!(manifest.required_inputs[1].status, ManifestInputStatus::Missing);
    assert_eq!(manifest.required_inputs[1].revision, None);
    assert_eq!(manifest.required_inputs[1].label, "PRD: missing");

    // No share link, token, or expiry field exists in the serialized JSON (R-WS-3).
    let json = manifest.to_json().expect("serializes to json");
    let lower = json.to_lowercase();
    assert!(!lower.contains("\"url\""));
    assert!(!lower.contains("\"share"));
    assert!(!lower.contains("\"token\""));
    assert!(!lower.contains("\"expir"));
}

#[test]
fn draft_revision_is_refused_with_typed_error() {
    let mut selection = meranti_selection();
    selection.items.push(ManifestSelectionItem {
        artifact_id: "F-04".to_string(),
        revision_n: 1,
    });

    let err = build_manifest(&selection, &meranti_revisions(), &meranti_inputs())
        .expect_err("draft must be refused");
    assert_eq!(
        err,
        ManifestError::DraftNotAccepted {
            artifact_id: "F-04".to_string(),
            revision_n: 1,
        }
    );
}

#[test]
fn stale_revision_is_refused_with_typed_error() {
    let selection = ManifestSelection {
        manifest_id: "m-0007".to_string(),
        spec_rev: "r14".to_string(),
        framework: "React".to_string(),
        items: vec![ManifestSelectionItem {
            artifact_id: "F-03".to_string(),
            revision_n: 5,
        }],
    };

    let err = build_manifest(&selection, &meranti_revisions(), &meranti_inputs())
        .expect_err("stale revision must be refused");
    assert_eq!(
        err,
        ManifestError::StaleRevision {
            artifact_id: "F-03".to_string(),
            selected_n: 5,
            latest_accepted_n: Some(6),
        }
    );
}

#[test]
fn superseded_accepted_revision_is_detected_as_stale() {
    let revisions = vec![
        ArtifactRevisionRecord {
            artifact_id: "F-03".to_string(),
            name: "Variance table".to_string(),
            kind: "frame".to_string(),
            revision: Revision {
                n: 6,
                content: "r6".to_string(),
            },
            state: ArtifactRevisionState::Accepted,
            latest_accepted_rev: Some(6),
            exclusion_reason: None,
        },
        ArtifactRevisionRecord {
            artifact_id: "F-03".to_string(),
            name: "Variance table".to_string(),
            kind: "frame".to_string(),
            revision: Revision {
                n: 7,
                content: "r7".to_string(),
            },
            state: ArtifactRevisionState::Accepted,
            latest_accepted_rev: Some(7),
            exclusion_reason: None,
        },
    ];
    let selection = ManifestSelection {
        manifest_id: "m-0008".to_string(),
        spec_rev: "r14".to_string(),
        framework: "React".to_string(),
        items: vec![ManifestSelectionItem {
            artifact_id: "F-03".to_string(),
            revision_n: 6,
        }],
    };

    let err = build_manifest(&selection, &revisions, &[])
        .expect_err("superseded revision must be refused as stale");
    assert_eq!(
        err,
        ManifestError::StaleRevision {
            artifact_id: "F-03".to_string(),
            selected_n: 6,
            latest_accepted_n: Some(7),
        }
    );
}

#[test]
fn reference_and_empty_selection_are_refused() {
    let ref_selection = ManifestSelection {
        manifest_id: "m-0007".to_string(),
        spec_rev: "r14".to_string(),
        framework: "React".to_string(),
        items: vec![ManifestSelectionItem {
            artifact_id: "REF-02".to_string(),
            revision_n: 1,
        }],
    };
    let err = build_manifest(&ref_selection, &meranti_revisions(), &[])
        .expect_err("reference artifact must be refused");
    assert_eq!(
        err,
        ManifestError::NotSelectable {
            artifact_id: "REF-02".to_string(),
            revision_n: 1,
            state: ArtifactRevisionState::Reference,
        }
    );

    let empty = ManifestSelection {
        manifest_id: "m-0007".to_string(),
        spec_rev: "r14".to_string(),
        framework: "React".to_string(),
        items: vec![],
    };
    assert_eq!(
        build_manifest(&empty, &meranti_revisions(), &[]),
        Err(ManifestError::EmptySelection)
    );
}

fn accepted_record_strategy() -> impl Strategy<Value = ArtifactRevisionRecord> {
    (
        prop_oneof![
            Just("F-01".to_string()),
            Just("F-02".to_string()),
            Just("F-03".to_string()),
            Just("DESIGN.md".to_string()),
        ],
        "[a-zA-Z0-9 ]{1,24}",
        1u32..10,
        "[a-zA-Z0-9 <>/_-]{0,64}",
    )
        .prop_map(|(artifact_id, name, n, content)| ArtifactRevisionRecord {
            artifact_id,
            name,
            kind: "frame".to_string(),
            revision: Revision { n, content },
            state: ArtifactRevisionState::Accepted,
            latest_accepted_rev: Some(n),
            exclusion_reason: None,
        })
}

fn required_input_strategy() -> impl Strategy<Value = RequiredInput> {
    (
        prop_oneof![
            Just("PRD".to_string()),
            Just("DESIGN.md".to_string()),
            Just("GUIDE.md".to_string()),
            Just("TOKENS".to_string()),
        ],
        any::<bool>(),
        proptest::option::of((1u32..20).prop_map(|n| format!("r{n}"))),
    )
        .prop_map(|(name, present, revision)| RequiredInput {
            name,
            present,
            revision,
        })
}

proptest! {
    #[test]
    fn two_exports_of_the_same_selection_are_byte_identical(
        records in prop::collection::vec(accepted_record_strategy(), 1..8),
        inputs in prop::collection::vec(required_input_strategy(), 0..6),
    ) {
        // Pick the highest accepted revision per artifact_id so every selected item is latest accepted.
        let mut latest_by_id = std::collections::BTreeMap::<String, ArtifactRevisionRecord>::new();
        for rec in records {
            latest_by_id
                .entry(rec.artifact_id.clone())
                .and_modify(|existing| {
                    if rec.revision.n > existing.revision.n {
                        *existing = rec.clone();
                    }
                })
                .or_insert(rec);
        }

        let unique_records: Vec<ArtifactRevisionRecord> = latest_by_id.into_values().collect();
        let selection_items: Vec<ManifestSelectionItem> = unique_records
            .iter()
            .map(|r| ManifestSelectionItem {
                artifact_id: r.artifact_id.clone(),
                revision_n: r.revision.n,
            })
            .collect();

        let sel_a = ManifestSelection {
            manifest_id: "m-prop".to_string(),
            spec_rev: "r14".to_string(),
            framework: "React".to_string(),
            items: selection_items.clone(),
        };

        // Reverse selection, revisions, and inputs for the second export to prove order independence too.
        let mut reversed_items = selection_items;
        reversed_items.reverse();
        let sel_b = ManifestSelection {
            manifest_id: "m-prop".to_string(),
            spec_rev: "r14".to_string(),
            framework: "React".to_string(),
            items: reversed_items,
        };
        let mut reversed_records = unique_records.clone();
        reversed_records.reverse();
        let mut reversed_inputs = inputs.clone();
        reversed_inputs.reverse();

        let manifest_a = build_manifest(&sel_a, &unique_records, &inputs)
            .expect("first export builds");
        let manifest_b = build_manifest(&sel_b, &reversed_records, &reversed_inputs)
            .expect("second export builds");

        let json_a = manifest_a.to_json().expect("first export serializes");
        let json_b = manifest_b.to_json().expect("second export serializes");

        prop_assert_eq!(json_a.as_bytes(), json_b.as_bytes());
    }
}
