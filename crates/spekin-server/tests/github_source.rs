//! IMP-27: the adapter must work through an injected transport; these tests never touch the network.

use std::sync::Arc;

use spekin_core::github_source::{GitHubFile, GitHubRepo, GitHubSnapshot, GitHubSourceError};
use spekin_core::skills::{SkillSource, UpdateDecision, UpdatePolicy};
use spekin_server::github_source::{GitHubSourceAdapter, GitHubTransport};

const MIT_LICENSE: &str = "MIT License\nPermission is hereby granted, free of charge.\n";

const SKILL_V1: &str = r#"---
id: grill
name: Grill the idea
description: Asks one sharp question at a time.
version: 1.3.0
---
Ask one question at a time.
"#;

const SKILL_V2: &str = r#"---
id: grill
name: Grill the idea
description: Asks one sharp question at a time.
version: 1.4.0
tools: [shell]
---
Ask one question at a time.
"#;

fn snapshot(content: &str) -> GitHubSnapshot {
    GitHubSnapshot {
        repo: GitHubRepo {
            owner: "example".into(),
            repo: "skills".into(),
        },
        commit: "abc123".into(),
        files: vec![
            GitHubFile {
                path: "LICENSE".into(),
                content: MIT_LICENSE.into(),
            },
            GitHubFile {
                path: "skills/grill/SKILL.md".into(),
                content: content.into(),
            },
        ],
    }
}

struct FakeTransport {
    content: Arc<std::sync::Mutex<String>>,
    fail: bool,
}

impl GitHubTransport for FakeTransport {
    async fn fetch_snapshot(
        &self,
        _repo: &GitHubRepo,
    ) -> Result<GitHubSnapshot, GitHubSourceError> {
        if self.fail {
            return Err(GitHubSourceError::Transport {
                message: "offline".into(),
            });
        }
        let content = self.content.lock().unwrap().clone();
        Ok(snapshot(&content))
    }
}

#[tokio::test]
async fn adapter_imports_a_repo_through_the_transport() {
    let adapter = GitHubSourceAdapter::new(FakeTransport {
        content: Arc::new(std::sync::Mutex::new(SKILL_V1.into())),
        fail: false,
    });

    let skills = adapter
        .import("https://github.com/example/skills")
        .await
        .unwrap();
    assert_eq!(skills.len(), 1);
    assert_eq!(skills[0].version, "1.3.0");
    assert_eq!(skills[0].licence, "MIT");
    assert!(matches!(
        skills[0].source,
        SkillSource::Github { ref commit, .. } if commit == "abc123"
    ));
}

#[tokio::test]
async fn adapter_checks_updates_and_holds_an_added_tool() {
    let content = Arc::new(std::sync::Mutex::new(SKILL_V1.into()));
    let adapter = GitHubSourceAdapter::new(FakeTransport {
        content: content.clone(),
        fail: false,
    });

    let stored = adapter.import("example/skills").await.unwrap();
    *content.lock().unwrap() = SKILL_V2.into();

    let checks = adapter
        .check_for_updates("example/skills", &stored, UpdatePolicy::Auto)
        .await
        .unwrap();
    assert_eq!(checks.len(), 1);
    assert!(matches!(
        checks[0].decision,
        UpdateDecision::Hold { ref reasons } if reasons.iter().any(|r| format!("{r:?}").contains("ToolAdded"))
    ));
}

#[tokio::test]
async fn adapter_propagates_a_transport_error() {
    let adapter = GitHubSourceAdapter::new(FakeTransport {
        content: Arc::new(std::sync::Mutex::new(SKILL_V1.into())),
        fail: true,
    });
    let err = adapter.import("example/skills").await.unwrap_err();
    assert!(matches!(err, GitHubSourceError::Transport { .. }));
}
