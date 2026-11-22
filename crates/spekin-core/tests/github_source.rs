//! IMP-27: pure GitHub source rules. All data is local fixtures: no network.

use spekin_core::github_source::{
    BundleFile, GitHubSourceError, MAX_FILE_BYTES, MAX_FILES, PinnedSource, assemble_bundle,
    check_bundle_limits, is_license_path, join_relative, license_from, listed_files,
    parse_github_repo, plan_updates, skill_md_path,
};
use spekin_core::skills::{HoldReason, SkillSource, UpdateDecision, UpdatePolicy, parse_skill_md};

const MIT_LICENSE: &str = "MIT License\n\nCopyright (c) 2026 Example Owner\n\nPermission is hereby granted, free of charge, to any person obtaining a copy.\n";

const GRILL_V1: &str = r#"---
id: grill
name: Grill the idea
description: Asks one sharp question at a time until the idea holds.
stages: [planning, spec]
licence: FRONTMATTER-IS-NOT-AUTHORITATIVE
notice: Copyright (c) 2026 Example Author
version: 1.3.0
files: [reference/one.md]
reads: [Pitch]
proposes: [Glossary terms]
tools: []
invocation: /grill
---
Ask one question at a time. Nothing changes until you accept in review.
"#;

fn pinned() -> PinnedSource {
    PinnedSource {
        repo: "example/skills".into(),
        path: "skills/grill/SKILL.md".into(),
        git_ref: "main".into(),
        commit: "abc123".into(),
    }
}

fn bundle() -> Result<spekin_core::SkillBundle, GitHubSourceError> {
    assemble_bundle(
        &pinned(),
        GRILL_V1,
        vec![BundleFile {
            path: "skills/grill/reference/one.md".into(),
            content: "Reference text.".into(),
        }],
        Some(license_from("LICENSE", MIT_LICENSE)),
    )
}

#[test]
fn parse_github_repo_accepts_slug_and_https_urls_and_rejects_others() {
    let expected = parse_github_repo("example/skills").unwrap();
    assert_eq!(expected.slug(), "example/skills");
    assert_eq!(
        parse_github_repo("https://github.com/example/skills.git").unwrap(),
        expected
    );
    assert_eq!(
        parse_github_repo("https://github.com/example/skills/tree/main/skills").unwrap(),
        expected
    );

    assert!(matches!(
        parse_github_repo("https://gitlab.com/example/skills"),
        Err(GitHubSourceError::UnsupportedHost { host }) if host == "gitlab.com"
    ));
    for bad in [
        "git@github.com:example/skills.git",
        "http://github.com/example/skills",
        "example",
        "example/",
        "/skills",
        "example/skill/$evil",
    ] {
        assert!(
            matches!(
                parse_github_repo(bad),
                Err(GitHubSourceError::InvalidRepoUrl { .. })
            ),
            "expected InvalidRepoUrl for {bad}"
        );
    }
}

#[test]
fn skill_md_path_and_join_relative_reject_traversal() {
    assert_eq!(skill_md_path("").unwrap(), "SKILL.md");
    assert_eq!(
        skill_md_path("skills/grill").unwrap(),
        "skills/grill/SKILL.md"
    );
    assert_eq!(
        skill_md_path("skills/grill/SKILL.md").unwrap(),
        "skills/grill/SKILL.md"
    );
    assert!(matches!(
        skill_md_path("../etc"),
        Err(GitHubSourceError::InvalidPath { .. })
    ));
    assert_eq!(
        join_relative("skills/grill/SKILL.md", "reference/one.md").unwrap(),
        "skills/grill/reference/one.md"
    );
    for bad in ["../one.md", "/etc/passwd", "a/../../b"] {
        assert!(matches!(
            join_relative("skills/grill/SKILL.md", bad),
            Err(GitHubSourceError::InvalidPath { .. })
        ));
    }
}

#[test]
fn listed_files_reads_inline_and_bullet_lists() {
    assert_eq!(listed_files(GRILL_V1), vec!["reference/one.md"]);
    let bullets = "---\nname: x\ndescription: y\nfiles:\n  - a.md\n  - b.md\ntools: []\n---\n";
    assert_eq!(listed_files(bullets), vec!["a.md", "b.md"]);
    assert!(listed_files("no frontmatter").is_empty());
}

#[test]
fn license_detection_identifies_common_spdx_ids() {
    assert!(is_license_path("LICENSE"));
    assert!(is_license_path("docs/LICENCE.md"));
    assert!(!is_license_path("docs/readme.md"));
    assert_eq!(license_from("LICENSE", MIT_LICENSE).spdx, "MIT");
    assert_eq!(
        license_from("LICENSE", "Apache License\nVersion 2.0, January 2004").spdx,
        "Apache-2.0"
    );
    assert_eq!(license_from("LICENSE", "custom terms").spdx, "UNKNOWN");
}

#[test]
fn assemble_bundle_marks_source_keeps_notice_and_uses_repo_license() {
    let skill = bundle().unwrap();
    let manifest = &skill.manifest;

    assert_eq!(
        manifest.source,
        SkillSource::Github {
            repo: "example/skills".into(),
            path: "skills/grill/SKILL.md".into(),
            commit: "abc123".into(),
        }
    );
    assert_eq!(
        manifest.licence, "MIT",
        "the repository LICENSE is authoritative"
    );
    let notice = manifest.notice.as_deref().unwrap_or_default();
    assert!(
        notice.contains("Copyright (c) 2026 Example Author"),
        "upstream notice must survive the import"
    );
    assert!(
        notice.contains("github.com/example/skills@abc123"),
        "pinned provenance must travel with the skill"
    );
    assert!(notice.contains("MIT"));
    assert!(manifest.body.contains("Ask one question at a time."));
    assert_eq!(skill.files.len(), 3, "SKILL.md, listed file and licence");
}

#[test]
fn assemble_bundle_refuses_missing_license_and_invalid_skill() {
    assert!(matches!(
        assemble_bundle(&pinned(), GRILL_V1, vec![], None),
        Err(GitHubSourceError::NoLicense { .. })
    ));
    assert!(matches!(
        assemble_bundle(
            &pinned(),
            "not a skill",
            vec![],
            Some(license_from("LICENSE", MIT_LICENSE))
        ),
        Err(GitHubSourceError::InvalidSkill { path, .. }) if path == "skills/grill/SKILL.md"
    ));
}

#[test]
fn check_bundle_limits_refuses_oversized_file_bundle_and_count() {
    let big = BundleFile {
        path: "big.md".into(),
        content: "x".repeat(MAX_FILE_BYTES + 1),
    };
    assert!(matches!(
        check_bundle_limits(&[big]),
        Err(GitHubSourceError::FileTooLarge { .. })
    ));

    let mut many = Vec::new();
    for i in 0..=MAX_FILES {
        many.push(BundleFile {
            path: format!("{i}.md"),
            content: "short".into(),
        });
    }
    assert!(matches!(
        check_bundle_limits(&many),
        Err(GitHubSourceError::TooManyFiles { .. })
    ));

    let mut total = Vec::new();
    for i in 0..9 {
        total.push(BundleFile {
            path: format!("{i}.md"),
            content: "x".repeat(MAX_FILE_BYTES),
        });
    }
    assert!(matches!(
        check_bundle_limits(&total),
        Err(GitHubSourceError::BundleTooLarge { .. })
    ));
    assert!(
        check_bundle_limits(&[BundleFile {
            path: "ok.md".into(),
            content: "fine".into(),
        }])
        .is_ok()
    );
}

#[test]
fn plan_updates_checks_each_stored_skill_with_the_policy() {
    let old = parse_skill_md(GRILL_V1).unwrap();
    let mut wording = old.clone();
    wording.version = "1.4.0".into();
    wording.body = "Ask one concise question at a time. Nothing changes until accepted.".into();

    let auto = plan_updates(
        std::slice::from_ref(&old),
        std::slice::from_ref(&wording),
        UpdatePolicy::Auto,
    );
    assert_eq!(auto.len(), 1);
    assert_eq!(auto[0].decision, UpdateDecision::Apply);
    assert_eq!(auto[0].from_version, "1.3.0");
    assert_eq!(auto[0].to_version, "1.4.0");

    let pinned = plan_updates(
        std::slice::from_ref(&old),
        std::slice::from_ref(&wording),
        UpdatePolicy::Pinned,
    );
    assert!(matches!(
        pinned[0].decision,
        UpdateDecision::Hold { ref reasons } if reasons.contains(&HoldReason::PolicyPinned)
    ));

    let mut with_tool = wording.clone();
    with_tool.tools.push("shell".into());
    let held = plan_updates(std::slice::from_ref(&old), &[with_tool], UpdatePolicy::Auto);
    assert!(matches!(
        held[0].decision,
        UpdateDecision::Hold { ref reasons } if reasons.iter().any(|r| matches!(r, HoldReason::ToolAdded { tool } if tool == "shell"))
    ));

    let mut new_skill = wording.clone();
    new_skill.id = "brand-new".into();
    assert_eq!(
        plan_updates(&[old], &[wording, new_skill], UpdatePolicy::Auto).len(),
        1
    );
}
