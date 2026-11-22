//! IMP-27: GitHub skill source adapter (ADR 0007, AC-SPK-39). All data is local fixtures: no network.

use spekin_core::github_source::{
    GitHubFile, GitHubRepo, GitHubSnapshot, GitHubSourceError, detect_license, discover_skill_paths,
    import_repository, parse_github_repo, plan_updates,
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
reads: [Pitch]
proposes: [Glossary terms]
tools: []
invocation: /grill
---
Ask one question at a time. Nothing changes until you accept in review.
"#;

fn repo() -> GitHubRepo {
    GitHubRepo {
        owner: "example".into(),
        repo: "skills".into(),
    }
}

fn snapshot_with_license() -> GitHubSnapshot {
    GitHubSnapshot {
        repo: repo(),
        commit: "abc123".into(),
        files: vec![
            GitHubFile {
                path: "LICENSE".into(),
                content: MIT_LICENSE.into(),
            },
            GitHubFile {
                path: "skills/grill/SKILL.md".into(),
                content: GRILL_V1.into(),
            },
        ],
    }
}

#[test]
fn parse_github_repo_accepts_slug_and_https_urls_and_rejects_others() {
    let expected = repo();
    assert_eq!(parse_github_repo("example/skills").unwrap(), expected);
    assert_eq!(
        parse_github_repo("https://github.com/example/skills.git").unwrap(),
        expected
    );
    assert_eq!(
        parse_github_repo("https://github.com/example/skills/tree/main/skills").unwrap(),
        expected
    );
    assert_eq!(expected.slug(), "example/skills");

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
            matches!(parse_github_repo(bad), Err(GitHubSourceError::InvalidRepoUrl { .. })),
            "expected InvalidRepoUrl for {bad}"
        );
    }
}

#[test]
fn discover_skill_paths_finds_skill_md_and_ignores_hidden_and_vendor() {
    let files = vec![
        "skills/grill/SKILL.md",
        "SKILL.md",
        ".github/skills/SKILL.md",
        "node_modules/pkg/SKILL.md",
        "docs/readme.md",
        "skills/test/skill.md",
        "skills/grill/SKILL.md",
    ]
    .into_iter()
    .map(|path| GitHubFile {
        path: path.into(),
        content: String::new(),
    })
    .collect::<Vec<_>>();

    assert_eq!(
        discover_skill_paths(&files),
        vec!["SKILL.md", "skills/grill/SKILL.md", "skills/test/skill.md"]
    );
}

#[test]
fn detect_license_prefers_root_file_and_detects_spdx() {
    let files = vec![
        GitHubFile {
            path: "docs/LICENSE".into(),
            content: "MIT License".into(),
        },
        GitHubFile {
            path: "LICENSE".into(),
            content: "Apache License\nVersion 2.0, January 2004".into(),
        },
    ];
    let found = detect_license(&files).expect("a licence file must be found");
    assert_eq!(found.path, "LICENSE");
    assert_eq!(found.spdx, "Apache-2.0");

    assert_eq!(detect_license(&[]), None);
}

#[test]
fn import_repository_refuses_repo_without_a_license() {
    let mut snapshot = snapshot_with_license();
    snapshot.files.retain(|f| f.path != "LICENSE");

    assert!(matches!(
        import_repository(&repo(), &snapshot),
        Err(GitHubSourceError::NoLicense { .. })
    ));
}

#[test]
fn import_repository_marks_source_keeps_notice_and_uses_repo_license() {
    let manifests = import_repository(&repo(), &snapshot_with_license()).unwrap();
    assert_eq!(manifests.len(), 1);
    let skill = &manifests[0];

    assert_eq!(
        skill.source,
        SkillSource::Github {
            repo: "example/skills".into(),
            path: "skills/grill/SKILL.md".into(),
            commit: "abc123".into(),
        }
    );
    assert_eq!(skill.licence, "MIT", "the repository LICENSE is authoritative");
    let notice = skill.notice.as_deref().unwrap_or_default();
    assert!(
        notice.contains("Copyright (c) 2026 Example Author"),
        "upstream notice must survive the import"
    );
    assert!(
        notice.contains("github.com/example/skills@abc123"),
        "pinned provenance must travel with the skill"
    );
    assert!(notice.contains("MIT"));
    assert!(skill.body.contains("Ask one question at a time."));
}

#[test]
fn import_repository_reports_invalid_skill_with_its_path() {
    let mut snapshot = snapshot_with_license();
    snapshot.files[1].content = "not a skill".into();

    assert!(matches!(
        import_repository(&repo(), &snapshot),
        Err(GitHubSourceError::InvalidSkill { path, .. }) if path == "skills/grill/SKILL.md"
    ));
}

#[test]
fn plan_updates_checks_each_stored_skill_with_the_policy() {
    let old = parse_skill_md(GRILL_V1).unwrap();
    let mut wording = old.clone();
    wording.version = "1.4.0".into();
    wording.body = "Ask one concise question at a time. Nothing changes until accepted.".into();

    let auto = plan_updates(&[old.clone()], &[wording.clone()], UpdatePolicy::Auto);
    assert_eq!(auto.len(), 1);
    assert_eq!(auto[0].decision, UpdateDecision::Apply);
    assert_eq!(auto[0].from_version, "1.3.0");
    assert_eq!(auto[0].to_version, "1.4.0");

    let pinned = plan_updates(&[old.clone()], &[wording.clone()], UpdatePolicy::Pinned);
    assert!(matches!(
        pinned[0].decision,
        UpdateDecision::Hold { ref reasons } if reasons.contains(&HoldReason::PolicyPinned)
    ));

    let mut with_tool = wording.clone();
    with_tool.tools.push("shell".into());
    let held = plan_updates(&[old.clone()], &[with_tool], UpdatePolicy::Auto);
    assert!(matches!(
        held[0].decision,
        UpdateDecision::Hold { ref reasons } if reasons.iter().any(|r| matches!(r, HoldReason::ToolAdded { tool } if tool == "shell"))
    ));

    let mut new_skill = wording.clone();
    new_skill.id = "brand-new".into();
    assert!(plan_updates(&[old], &[wording, new_skill], UpdatePolicy::Auto).len() == 1);
}
