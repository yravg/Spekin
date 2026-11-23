//! IMP-27: recorded GitHub fixtures. No test in this file touches the network.

use std::collections::HashMap;
use std::path::PathBuf;

use spekin_core::github_source::{
    BundleFile, GitHubRepo, GitHubSourceError, MAX_FILE_BYTES, PinnedSource,
};
use spekin_core::skills::{HoldReason, UpdateDecision, UpdatePolicy};
use spekin_server::skills::github::{GitHubClient, GitHubSkillSource};

const SKILL_DIR: &str = "skills/grill";
const REF_FIXTURE: &str = include_str!("fixtures/github/refs.json");

fn fixture_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/github")
}

/// Reads the recorded files from `tests/fixtures/github/`.
struct FixtureClient;

impl GitHubClient for FixtureClient {
    async fn resolve_ref(
        &self,
        repo: &GitHubRepo,
        git_ref: &str,
    ) -> Result<String, GitHubSourceError> {
        let refs: serde_json::Value = serde_json::from_str(REF_FIXTURE).unwrap();
        refs.get(format!("{}@{git_ref}", repo.slug()))
            .and_then(serde_json::Value::as_str)
            .map(str::to_string)
            .ok_or_else(|| GitHubSourceError::RefNotFound {
                repo: repo.slug(),
                git_ref: git_ref.into(),
            })
    }

    async fn fetch_file(
        &self,
        _repo: &GitHubRepo,
        commit: &str,
        path: &str,
    ) -> Result<String, GitHubSourceError> {
        std::fs::read_to_string(fixture_dir().join(commit).join(path))
            .map_err(|_| GitHubSourceError::MissingFile { path: path.into() })
    }

    async fn fetch_license(
        &self,
        repo: &GitHubRepo,
        commit: &str,
    ) -> Result<BundleFile, GitHubSourceError> {
        for name in ["LICENSE", "LICENSE.md"] {
            if let Ok(content) = self.fetch_file(repo, commit, name).await {
                return Ok(BundleFile {
                    path: name.into(),
                    content,
                });
            }
        }
        Err(GitHubSourceError::NoLicense { repo: repo.slug() })
    }
}

fn source() -> GitHubSkillSource<FixtureClient> {
    GitHubSkillSource::new(FixtureClient)
}

async fn install(git_ref: &str) -> spekin_core::SkillBundle {
    let adapter = source();
    let pinned = adapter
        .resolve("https://github.com/example/skills", SKILL_DIR, git_ref)
        .await
        .unwrap();
    adapter.fetch(&pinned).await.unwrap()
}

#[tokio::test]
async fn resolve_pins_a_branch_to_an_exact_commit_sha() {
    let pinned = source()
        .resolve("example/skills", SKILL_DIR, "main")
        .await
        .unwrap();
    assert_eq!(pinned.repo, "example/skills");
    assert_eq!(pinned.commit, "aaaa1111");
    assert_eq!(pinned.git_ref, "main");
    assert_eq!(pinned.path, format!("{SKILL_DIR}/SKILL.md"));
}

#[tokio::test]
async fn fetch_reads_the_skill_its_listed_file_and_the_licence() {
    let bundle = install("main").await;
    assert_eq!(bundle.source.commit, "aaaa1111");
    assert_eq!(bundle.manifest.version, "1.3.0");
    assert_eq!(bundle.manifest.licence, "MIT");
    assert_eq!(bundle.files.len(), 3, "SKILL.md, listed file and licence");
    assert!(
        bundle
            .files
            .iter()
            .any(|f| f.path == format!("{SKILL_DIR}/reference/one.md"))
    );
    assert!(bundle.manifest.body.contains("Ask one question at a time."));
}

#[tokio::test]
async fn wording_only_change_applies_under_auto() {
    let mut installed = install("main").await;
    installed.source.git_ref = "wording".into();
    let check = source()
        .check(&installed, UpdatePolicy::Auto)
        .await
        .unwrap();
    assert_eq!(check.decision, UpdateDecision::Apply);
    assert_eq!(check.from_version, "1.3.0");
    assert_eq!(check.to_version, "1.4.0");
}

#[tokio::test]
async fn licence_change_is_held() {
    let installed = install("main").await;
    // `installed` kept git_ref "main"; point it at the licence-change ref.
    let mut changed = installed;
    changed.source.git_ref = "licence".into();
    let check = source().check(&changed, UpdatePolicy::Auto).await.unwrap();
    assert!(matches!(
        check.decision,
        UpdateDecision::Hold { ref reasons } if reasons.iter().any(|r| matches!(
            r,
            HoldReason::LicenceChanged { from, to } if from == "MIT" && to == "Apache-2.0"
        ))
    ));
}

#[tokio::test]
async fn added_script_and_injection_pattern_are_each_held() {
    let installed = install("main").await;

    let mut script = installed.clone();
    script.source.git_ref = "script".into();
    let check = source().check(&script, UpdatePolicy::Auto).await.unwrap();
    assert!(matches!(
        check.decision,
        UpdateDecision::Hold { ref reasons } if reasons.iter().any(|r| matches!(
            r,
            HoldReason::ScriptAdded { script } if script.contains("setup.sh")
        ))
    ));

    let mut hostile = installed;
    hostile.source.git_ref = "injection".into();
    let check = source().check(&hostile, UpdatePolicy::Auto).await.unwrap();
    assert!(matches!(
        check.decision,
        UpdateDecision::Hold { ref reasons } if reasons.iter().any(|r| matches!(
            r,
            HoldReason::InjectionDetected { .. }
        ))
    ));
}

#[tokio::test]
async fn pinned_policy_never_changes() {
    let mut installed = install("main").await;
    installed.source.git_ref = "wording".into();
    let check = source()
        .check(&installed, UpdatePolicy::Pinned)
        .await
        .unwrap();
    assert!(matches!(
        check.decision,
        UpdateDecision::Hold { ref reasons } if reasons.contains(&HoldReason::PolicyPinned)
    ));
}

#[tokio::test]
async fn fetch_refuses_a_repo_without_a_licence() {
    let source = source();
    let pinned = source
        .resolve("example/skills", SKILL_DIR, "nolicence")
        .await
        .unwrap();
    assert!(matches!(
        source.fetch(&pinned).await,
        Err(GitHubSourceError::NoLicense { .. })
    ));
}

/// A scripted client for the size-limit tests; still no network.
struct ScriptedClient {
    refs: HashMap<String, String>,
    files: HashMap<String, String>,
}

const MIT: &str = "MIT License\nPermission is hereby granted, free of charge.\n";

impl ScriptedClient {
    fn skill_md(listed: &[String]) -> String {
        let files = listed
            .iter()
            .map(|f| format!("\"{f}\""))
            .collect::<Vec<_>>()
            .join(", ");
        format!(
            "---\nid: grill\nname: Grill\ndescription: Test skill.\nversion: 1.3.0\nfiles: [{files}]\n---\nBody.\n"
        )
    }

    fn with_files(listed: Vec<String>, content: String) -> Self {
        let path = format!("abc123/{SKILL_DIR}/SKILL.md");
        let mut files = HashMap::new();
        files.insert(path, Self::skill_md(&listed));
        for name in listed {
            files.insert(format!("abc123/{SKILL_DIR}/{name}"), content.clone());
        }
        Self {
            refs: HashMap::from([("example/skills@main".into(), "abc123".into())]),
            files,
        }
    }
}

impl GitHubClient for ScriptedClient {
    async fn resolve_ref(
        &self,
        repo: &GitHubRepo,
        git_ref: &str,
    ) -> Result<String, GitHubSourceError> {
        self.refs
            .get(&format!("{}@{git_ref}", repo.slug()))
            .cloned()
            .ok_or_else(|| GitHubSourceError::RefNotFound {
                repo: repo.slug(),
                git_ref: git_ref.into(),
            })
    }

    async fn fetch_file(
        &self,
        _repo: &GitHubRepo,
        commit: &str,
        path: &str,
    ) -> Result<String, GitHubSourceError> {
        self.files
            .get(&format!("{commit}/{path}"))
            .cloned()
            .ok_or_else(|| GitHubSourceError::MissingFile { path: path.into() })
    }

    async fn fetch_license(
        &self,
        _repo: &GitHubRepo,
        _commit: &str,
    ) -> Result<BundleFile, GitHubSourceError> {
        Ok(BundleFile {
            path: "LICENSE".into(),
            content: MIT.into(),
        })
    }
}

#[tokio::test]
async fn size_limits_are_refused() {
    // One file over 256 KB.
    let adapter = GitHubSkillSource::new(ScriptedClient::with_files(
        vec!["big.md".into()],
        "x".repeat(MAX_FILE_BYTES + 1),
    ));
    let pinned: PinnedSource = adapter
        .resolve("example/skills", SKILL_DIR, "main")
        .await
        .unwrap();
    assert!(matches!(
        adapter.fetch(&pinned).await,
        Err(GitHubSourceError::FileTooLarge { .. })
    ));

    // Over 50 files.
    let many: Vec<String> = (0..=50).map(|i| format!("f{i}.md")).collect();
    let adapter = GitHubSkillSource::new(ScriptedClient::with_files(many, "short".into()));
    let pinned = adapter
        .resolve("example/skills", SKILL_DIR, "main")
        .await
        .unwrap();
    assert!(matches!(
        adapter.fetch(&pinned).await,
        Err(GitHubSourceError::TooManyFiles { .. })
    ));

    // Over 2 MB in total, each file still under the per-file limit.
    let chunks: Vec<String> = (0..9).map(|i| format!("f{i}.md")).collect();
    let adapter = GitHubSkillSource::new(ScriptedClient::with_files(
        chunks,
        "x".repeat(MAX_FILE_BYTES),
    ));
    let pinned = adapter
        .resolve("example/skills", SKILL_DIR, "main")
        .await
        .unwrap();
    assert!(matches!(
        adapter.fetch(&pinned).await,
        Err(GitHubSourceError::BundleTooLarge { .. })
    ));
}
