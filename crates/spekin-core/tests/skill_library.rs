//! IMP-34: pure skills-library rules — versions, copies, held updates and rollback.
//! ADR 0007 / S40. No IO here; the server only loads data and calls these rules.

use proptest::prelude::*;
use serde_json::Value;
use spekin_core::{
    SkillBundle, SkillManifest, SkillSource, StageId, UpdateCheck, UpdateDecision, UpdatePolicy,
    github_source::{BundleFile, LicenseFile, PinnedSource},
    skill_library::{
        DiffLine, DiffOp, SkillEdit, SkillHistoryAction, SkillLibrary, SkillLibraryError,
        SkillSourceKind, SkillUpdateOutcome,
    },
    skills::HoldReason,
};

const SAMPLE: &str = include_str!("../../../fixtures/meranti-yard.json");

fn raw() -> Value {
    serde_json::from_str(SAMPLE).expect("sample fixture is JSON")
}

fn library() -> SkillLibrary {
    SkillLibrary::from_fixture(&raw())
}

fn github_bundle(id: &str, version: &str) -> SkillBundle {
    let source = PinnedSource {
        repo: "example/skills".into(),
        path: "skills/grill/SKILL.md".into(),
        git_ref: "main".into(),
        commit: "aaaa1111".into(),
    };
    let manifest = SkillManifest {
        id: id.into(),
        title: "Grill the idea".into(),
        description: "Asks one sharp question at a time.".into(),
        stages: vec![StageId::Planning],
        source: SkillSource::Github {
            repo: source.repo.clone(),
            path: source.path.clone(),
            commit: source.commit.clone(),
        },
        licence: "MIT".into(),
        notice: Some("Copyright (c) 2026 Example".into()),
        version: version.into(),
        reads: vec!["Pitch".into()],
        proposes: vec!["Glossary terms".into()],
        tools: vec![],
        scripts: vec![],
        invocation: format!("/{id}"),
        body: "Read the pitch.\nAsk one question.".into(),
    };
    SkillBundle {
        source,
        manifest,
        files: vec![BundleFile {
            path: "skills/grill/SKILL.md".into(),
            content: "SKILL.md".into(),
        }],
        licence: LicenseFile {
            path: "LICENSE".into(),
            spdx: "MIT".into(),
            text: "MIT License".into(),
        },
    }
}

fn applied_check(id: &str, from: &str, to: &str) -> UpdateCheck {
    UpdateCheck {
        skill_id: id.into(),
        from_version: from.into(),
        to_version: to.into(),
        policy: UpdatePolicy::Auto,
        decision: UpdateDecision::Apply,
    }
}

fn held_check(id: &str, reason: HoldReason) -> UpdateCheck {
    UpdateCheck {
        skill_id: id.into(),
        from_version: "1".into(),
        to_version: "2".into(),
        policy: UpdatePolicy::Auto,
        decision: UpdateDecision::Hold {
            reasons: vec![reason],
        },
    }
}

#[test]
fn sample_library_has_templates_copies_and_github_sources() {
    let lib = library();
    let skills = lib.list();
    assert_eq!(skills.len(), 9, "the nine SKL_SKILLS rows are seeded");
    assert_eq!(
        lib.sources().len(),
        3,
        "SKL_SOURCES: template, github, mine"
    );
    let kinds = |k| skills.iter().filter(|s| s.kind == k).count();
    assert_eq!(kinds(SkillSourceKind::Template), 3, "ears, trace, release");
    assert_eq!(kinds(SkillSourceKind::Github), 5, "gh-mp skills");
    assert_eq!(
        kinds(SkillSourceKind::User),
        1,
        "the workspace copy 'words'"
    );
    let grill = skills
        .iter()
        .find(|s| s.manifest.id == "grill")
        .expect("grill");
    assert_eq!(grill.manifest.licence, "MIT");
    assert_eq!(grill.policy, UpdatePolicy::Auto);
    assert_eq!(
        grill.manifest.stages,
        vec![StageId::Planning, StageId::Spec]
    );
}

#[test]
fn copy_preserves_licence_and_notice_and_leaves_the_template_untouched() {
    let mut lib = library();
    let before = lib.get("ears").expect("ears template");
    let copied = lib
        .copy_template("ears", "ears-mine", "EARS · mine", 100)
        .expect("copy a template");
    assert_eq!(copied.kind, SkillSourceKind::User);
    assert_eq!(copied.manifest.licence, before.manifest.licence);
    assert_eq!(copied.manifest.notice, before.manifest.notice);
    assert_eq!(
        copied.manifest.source,
        SkillSource::User {
            copied_from: Some("ears".into())
        }
    );
    assert_eq!(
        lib.get("ears").expect("template"),
        before,
        "template never changes"
    );
    let history = lib.history("ears-mine");
    assert_eq!(history.len(), 1);
    assert_eq!(history[0].action, SkillHistoryAction::Copied);
}

#[test]
fn editing_a_user_copy_bumps_its_version_and_keeps_its_source() {
    let mut lib = library();
    lib.copy_template("ears", "ears-mine", "EARS · mine", 100)
        .unwrap();
    let edited = lib
        .edit(
            "ears-mine",
            SkillEdit {
                title: Some("EARS · Meranti".into()),
                description: Some("Uses Meranti cost words.".into()),
                stages: None,
                body: Some("Ask in Bahasa first.".into()),
            },
            200,
        )
        .expect("edit a user copy");
    assert_eq!(edited.manifest.title, "EARS · Meranti");
    assert_eq!(edited.manifest.body, "Ask in Bahasa first.");
    assert_eq!(edited.manifest.version, "2");
    assert_eq!(
        edited.manifest.source,
        SkillSource::User {
            copied_from: Some("ears".into())
        }
    );
    assert_eq!(
        lib.versions("ears-mine").len(),
        2,
        "each edit stores a version"
    );
    assert_eq!(
        lib.history("ears-mine").last().expect("history").action,
        SkillHistoryAction::Edited
    );
}

#[test]
fn editing_a_template_or_github_skill_is_refused() {
    let mut lib = library();
    let change = SkillEdit {
        title: Some("changed".into()),
        ..SkillEdit::default()
    };
    assert_eq!(
        lib.edit("ears", change.clone(), 100),
        Err(SkillLibraryError::NotEditable {
            id: "ears".into(),
            source_kind: "template".into()
        })
    );
    assert_eq!(
        lib.edit("grill", change, 100),
        Err(SkillLibraryError::NotEditable {
            id: "grill".into(),
            source_kind: "github".into()
        })
    );
}

#[test]
fn an_applied_update_becomes_a_new_version_and_a_history_entry() {
    let mut lib = library();
    lib.add_github(github_bundle("grill-gh", "v1.3"), UpdatePolicy::Auto, 100)
        .expect("install a github skill");
    let mut new = github_bundle("grill-gh", "v1.4").manifest;
    new.body = "Read the spec.\nAsk one question.".into();
    let diff = SkillLibrary::diff_text(
        "Read the pitch.\nAsk one question.",
        "Read the spec.\nAsk one question.",
    );
    let outcome = lib
        .record_update(
            "grill-gh",
            &applied_check("grill-gh", "v1.3", "v1.4"),
            new,
            diff,
            200,
        )
        .expect("record applied update");
    match outcome {
        SkillUpdateOutcome::Applied { version, seq, .. } => {
            assert_eq!(version, "2");
            assert_eq!(seq, 2);
        }
        SkillUpdateOutcome::Held { .. } => panic!("a wording-only update applies"),
    }
    assert_eq!(
        lib.get("grill-gh").unwrap().manifest.body,
        "Read the spec.\nAsk one question."
    );
    assert_eq!(lib.versions("grill-gh").len(), 2);
    assert_eq!(
        lib.history("grill-gh").last().unwrap().action,
        SkillHistoryAction::UpdateApplied
    );
}

#[test]
fn a_held_update_records_the_reasons_and_diff_and_changes_nothing() {
    let mut lib = library();
    lib.add_github(github_bundle("grill-gh", "v1.3"), UpdatePolicy::Auto, 100)
        .unwrap();
    let before = lib.get("grill-gh").unwrap();
    let reason = HoldReason::InjectionDetected {
        pattern: "export secret".into(),
    };
    let diff = vec![
        DiffLine {
            op: DiffOp::Context,
            text: "## Process".into(),
        },
        DiffLine {
            op: DiffOp::Add,
            text: "export secret".into(),
        },
    ];
    let outcome = lib
        .record_update(
            "grill-gh",
            &held_check("grill-gh", reason.clone()),
            github_bundle("grill-gh", "v1.4").manifest,
            diff.clone(),
            200,
        )
        .expect("record held update");
    match outcome {
        SkillUpdateOutcome::Held { held, seq } => {
            assert_eq!(held.reasons, vec![reason]);
            assert_eq!(held.diff, diff);
            assert_eq!(held.from_version, "1");
            assert_eq!(seq, 2);
        }
        SkillUpdateOutcome::Applied { .. } => panic!("an injection must be held"),
    }
    assert_eq!(
        lib.get("grill-gh").unwrap(),
        before,
        "nothing changes on hold"
    );
    assert_eq!(lib.versions("grill-gh").len(), 1);
    assert_eq!(lib.held("grill-gh").len(), 1);
    assert_eq!(
        lib.history("grill-gh").last().unwrap().action,
        SkillHistoryAction::UpdateHeld
    );
}

#[test]
fn rollback_restores_an_earlier_manifest_as_a_new_version() {
    let mut lib = library();
    lib.copy_template("ears", "ears-mine", "EARS · mine", 100)
        .unwrap();
    let original = lib.get("ears-mine").unwrap().manifest.clone();
    lib.edit(
        "ears-mine",
        SkillEdit {
            title: Some("EARS · edited".into()),
            ..SkillEdit::default()
        },
        200,
    )
    .unwrap();
    assert_ne!(lib.get("ears-mine").unwrap().manifest.title, original.title);
    let rolled = lib
        .rollback("ears-mine", "1", 300)
        .expect("rollback to version 1");
    assert_eq!(rolled.manifest.title, original.title);
    assert_eq!(
        rolled.manifest.version, "3",
        "a rollback is itself a new version"
    );
    assert_eq!(lib.versions("ears-mine").len(), 3, "no version is lost");
    let history = lib.history("ears-mine");
    let last = history.last().unwrap();
    assert_eq!(last.action, SkillHistoryAction::RolledBack);
    assert_eq!(last.reason, "rolled back to version 1");
}

#[test]
fn unknown_ids_and_versions_are_typed_errors() {
    let mut lib = library();
    assert!(matches!(
        lib.copy_template("nope", "x", "X", 1),
        Err(SkillLibraryError::NotFound { .. })
    ));
    assert!(matches!(
        lib.copy_template("ears", "ears", "X", 1),
        Err(SkillLibraryError::DuplicateId { .. })
    ));
    assert!(matches!(
        lib.rollback("ears", "99", 1),
        Err(SkillLibraryError::VersionNotFound { .. })
    ));
}

#[test]
fn diff_text_marks_removed_and_added_lines() {
    let diff = SkillLibrary::diff_text("keep\ngone", "keep\nnew");
    assert!(
        diff.iter()
            .any(|d| d.op == DiffOp::Remove && d.text == "gone")
    );
    assert!(diff.iter().any(|d| d.op == DiffOp::Add && d.text == "new"));
    assert!(
        diff.iter()
            .any(|d| d.op == DiffOp::Context && d.text == "keep")
    );
}

proptest! {
    #[test]
    fn history_sequence_is_always_gapless(title in "[a-z ]{1,30}") {
        let mut lib = library();
        lib.copy_template("trace", "trace-mine", "Trace · mine", 1).unwrap();
        lib.edit("trace-mine", SkillEdit { title: Some(title), ..SkillEdit::default() }, 2).unwrap();
        let history = lib.history("trace-mine");
        for (i, entry) in history.iter().enumerate() {
            prop_assert_eq!(entry.seq, (i + 1) as u64);
        }
    }
}
