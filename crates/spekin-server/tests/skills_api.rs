//! IMP-34: skills library HTTP API (S40, ADR 0007). One test per route plus 4xx paths.
//! The GitHub client is injected: everything here uses recorded fixtures, no network.

use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use axum::Router;
use axum::body::Body;
use axum::http::{Request, StatusCode};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use spekin_core::SkillLibrary;
use spekin_core::github_source::{BundleFile, GitHubRepo, GitHubSourceError};
use spekin_server::skills::github::GitHubClient;
use spekin_server::{AppState, router};
use tower::ServiceExt;

const SAMPLE: &str = include_str!("../../../fixtures/meranti-yard.json");
const SKILL_DIR: &str = "skills/grill";

/// Recorded GitHub client whose ref map can be moved forward to simulate an upstream update.
#[derive(Clone)]
struct FixtureClient {
    refs: Arc<Mutex<Value>>,
}

impl FixtureClient {
    fn new() -> Self {
        Self {
            refs: Arc::new(Mutex::new(
                serde_json::from_str(include_str!("fixtures/github/refs.json")).unwrap(),
            )),
        }
    }

    fn advance_main_to(&self, commit: &str) {
        self.refs.lock().unwrap()["example/skills@main"] = Value::String(commit.into());
    }
}

fn fixture_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures/github")
}

impl GitHubClient for FixtureClient {
    async fn resolve_ref(
        &self,
        repo: &GitHubRepo,
        git_ref: &str,
    ) -> Result<String, GitHubSourceError> {
        self.refs
            .lock()
            .unwrap()
            .get(format!("{}@{git_ref}", repo.slug()))
            .and_then(Value::as_str)
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

fn state(client: FixtureClient) -> AppState {
    AppState::from_fixture_json(SAMPLE)
        .unwrap()
        .with_github_client(client)
}

/// An empty library for tests that install a GitHub skill with the sample's id.
fn empty_library() -> SkillLibrary {
    SkillLibrary::from_fixture(&json!({}))
}

async fn call(app: &Router, method: &str, uri: &str, body: Option<Value>) -> (StatusCode, Value) {
    let mut builder = Request::builder().method(method).uri(uri);
    if body.is_some() {
        builder = builder.header("content-type", "application/json");
    }
    let request = builder
        .body(Body::from(body.map(|b| b.to_string()).unwrap_or_default()))
        .unwrap();
    let response = app.clone().oneshot(request).await.unwrap();
    let status = response.status();
    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    let value = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
    (status, value)
}

async fn audit_actions(app: &Router, uri: &str) -> Vec<String> {
    let (status, body) = call(app, "GET", uri, None).await;
    assert_eq!(status, StatusCode::OK, "audit route {uri}");
    body["entries"]
        .as_array()
        .unwrap()
        .iter()
        .map(|e| e["action"].as_str().unwrap().to_string())
        .collect()
}

const SKILLS_AUDIT: &str = "/api/skills/audit";
const PROJECT_AUDIT: &str = "/api/projects/meranti-yard/audit";

/// IMP-35: skills events go to their own chain; a project's chain is untouched.
async fn assert_project_audit_unchanged(app: &Router, before: Vec<String>) {
    assert_eq!(audit_actions(app, PROJECT_AUDIT).await, before);
}

#[tokio::test]
async fn skills_route_lists_the_seeded_templates_copies_and_sources() {
    let app = router(state(FixtureClient::new()));
    let (status, body) = call(&app, "GET", "/api/skills", None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["skills"].as_array().unwrap().len(), 9);
    assert_eq!(body["sources"].as_array().unwrap().len(), 3);
    let grill = body["skills"]
        .as_array()
        .unwrap()
        .iter()
        .find(|s| s["manifest"]["id"] == "grill")
        .expect("grill is seeded");
    assert_eq!(grill["kind"], "github");
    assert_eq!(grill["manifest"]["licence"], "MIT");
    assert_eq!(grill["policy"], "auto");
}

#[tokio::test]
async fn copy_route_makes_a_user_copy_and_never_changes_the_template() {
    let app = router(state(FixtureClient::new()));
    let (_, before) = call(&app, "GET", "/api/skills", None).await;
    let template = before["skills"]
        .as_array()
        .unwrap()
        .iter()
        .find(|s| s["manifest"]["id"] == "ears")
        .unwrap()
        .clone();

    let (status, copied) = call(
        &app,
        "POST",
        "/api/skills/ears/copy",
        Some(json!({"new_id": "ears-mine", "new_title": "EARS mine"})),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(copied["kind"], "user");
    assert_eq!(
        copied["manifest"]["licence"],
        template["manifest"]["licence"]
    );
    assert_eq!(copied["manifest"]["version"], "1");
    assert_eq!(copied["manifest"]["source"]["kind"], "user");
    assert_eq!(copied["manifest"]["source"]["copied_from"], "ears");

    let (_, after) = call(&app, "GET", "/api/skills", None).await;
    let template_after = after["skills"]
        .as_array()
        .unwrap()
        .iter()
        .find(|s| s["manifest"]["id"] == "ears")
        .unwrap();
    assert_eq!(template_after, &template, "the template is immutable");
}

#[tokio::test]
async fn copy_route_404_for_unknown_skill_and_409_for_duplicate_id() {
    let app = router(state(FixtureClient::new()));
    let (status, body) = call(
        &app,
        "POST",
        "/api/skills/nope/copy",
        Some(json!({"new_id": "x", "new_title": "X"})),
    )
    .await;
    assert_eq!(status, StatusCode::NOT_FOUND);
    assert_eq!(body["code"], "skill_not_found");

    let req = Some(json!({"new_id": "ears-mine", "new_title": "EARS mine"}));
    assert_eq!(
        call(&app, "POST", "/api/skills/ears/copy", req.clone())
            .await
            .0,
        StatusCode::OK
    );
    let (status, body) = call(&app, "POST", "/api/skills/ears/copy", req).await;
    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(body["code"], "duplicate_skill_id");
}

#[tokio::test]
async fn edit_route_stores_a_new_version_on_a_user_copy() {
    let app = router(state(FixtureClient::new()));
    call(
        &app,
        "POST",
        "/api/skills/ears/copy",
        Some(json!({"new_id": "ears-mine", "new_title": "EARS mine"})),
    )
    .await;
    let (status, edited) = call(
        &app,
        "PUT",
        "/api/skills/ears-mine",
        Some(json!({"title": "EARS Meranti", "body": "Ask in Bahasa first."})),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(edited["manifest"]["title"], "EARS Meranti");
    assert_eq!(edited["manifest"]["version"], "2");

    let (_, history) = call(&app, "GET", "/api/skills/ears-mine/history", None).await;
    let rows = history.as_array().unwrap();
    assert_eq!(rows.len(), 2);
    assert_eq!(rows[0]["action"], "copied");
    assert_eq!(rows[1]["action"], "edited");
}

#[tokio::test]
async fn edit_route_409_for_a_template_or_a_github_skill() {
    let app = router(state(FixtureClient::new()));
    let body = Some(json!({"title": "changed"}));
    let (status, err) = call(&app, "PUT", "/api/skills/ears", body.clone()).await;
    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(err["code"], "not_editable");
    let (status, err) = call(&app, "PUT", "/api/skills/grill", body).await;
    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(err["code"], "not_editable");
}

#[tokio::test]
async fn add_github_route_pins_a_sha_through_the_injected_client() {
    let app = router(state(FixtureClient::new()).with_library(empty_library()));
    let (status, installed) = call(
        &app,
        "POST",
        "/api/skills/github",
        Some(json!({
            "repo": "example/skills",
            "path": SKILL_DIR,
            "git_ref": "main",
            "policy": "auto"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(installed["kind"], "github");
    assert_eq!(installed["manifest"]["source"]["commit"], "aaaa1111");
    assert_eq!(installed["manifest"]["licence"], "MIT");
    assert!(
        installed["manifest"]["notice"]
            .as_str()
            .unwrap()
            .contains("aaaa1111")
    );
}

#[tokio::test]
async fn add_github_route_400_for_an_invalid_repo() {
    let app = router(state(FixtureClient::new()));
    let (status, err) = call(
        &app,
        "POST",
        "/api/skills/github",
        Some(json!({
            "repo": "not a repo",
            "path": SKILL_DIR,
            "git_ref": "main",
            "policy": "auto"
        })),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(err["code"], "invalid_repo_url");
}

#[tokio::test]
async fn check_route_applies_a_wording_update_and_appends_one_audit_entry() {
    let client = FixtureClient::new();
    let app = router(state(client.clone()).with_library(empty_library()));
    call(
        &app,
        "POST",
        "/api/skills/github",
        Some(json!({
            "repo": "example/skills",
            "path": SKILL_DIR,
            "git_ref": "main",
            "policy": "auto"
        })),
    )
    .await;
    // Move the upstream ref forward: the installed skill is pinned to aaaa1111.
    client.advance_main_to("bbbb2222");
    let before = audit_actions(&app, SKILLS_AUDIT).await.len();
    let project_before = audit_actions(&app, PROJECT_AUDIT).await;

    let (status, outcome) = call(&app, "POST", "/api/skills/grill/check", Some(json!({}))).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(outcome["outcome"], "applied");
    assert_eq!(outcome["version"], "2");
    let (_, skill) = call(&app, "GET", "/api/skills", None).await;
    let installed = skill["skills"]
        .as_array()
        .unwrap()
        .iter()
        .find(|s| s["manifest"]["id"] == "grill")
        .unwrap();
    assert_eq!(
        installed["manifest"]["version"], "2",
        "a new version was stored"
    );

    let actions = audit_actions(&app, SKILLS_AUDIT).await;
    assert_eq!(actions.len(), before + 1);
    assert_eq!(actions.last().unwrap(), "skill_update_applied");
    assert_project_audit_unchanged(&app, project_before).await;
}

#[tokio::test]
async fn check_route_holds_a_hostile_update_storing_diff_and_reasons() {
    let client = FixtureClient::new();
    let app = router(state(client.clone()).with_library(empty_library()));
    call(
        &app,
        "POST",
        "/api/skills/github",
        Some(json!({
            "repo": "example/skills",
            "path": SKILL_DIR,
            "git_ref": "main",
            "policy": "auto"
        })),
    )
    .await;
    client.advance_main_to("eeee5555");
    let before = audit_actions(&app, SKILLS_AUDIT).await.len();
    let project_before = audit_actions(&app, PROJECT_AUDIT).await;

    let (status, outcome) = call(&app, "POST", "/api/skills/grill/check", Some(json!({}))).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(outcome["outcome"], "held");
    assert_eq!(outcome["held"]["reasons"][0]["code"], "injection_detected");
    assert!(!outcome["held"]["diff"].as_array().unwrap().is_empty());
    let (_, skill) = call(&app, "GET", "/api/skills", None).await;
    let installed = skill["skills"]
        .as_array()
        .unwrap()
        .iter()
        .find(|s| s["manifest"]["id"] == "grill")
        .unwrap();
    assert_eq!(
        installed["manifest"]["version"], "1.3.0",
        "nothing changed on hold"
    );

    let actions = audit_actions(&app, SKILLS_AUDIT).await;
    assert_eq!(actions.len(), before + 1);
    assert_eq!(actions.last().unwrap(), "skill_update_held");
    assert_project_audit_unchanged(&app, project_before).await;
}

#[tokio::test]
async fn check_route_404_for_unknown_skill_and_409_without_an_upstream() {
    let app = router(state(FixtureClient::new()));
    let (status, body) = call(&app, "POST", "/api/skills/nope/check", Some(json!({}))).await;
    assert_eq!(status, StatusCode::NOT_FOUND);
    assert_eq!(body["code"], "skill_not_found");

    let (status, body) = call(&app, "POST", "/api/skills/ears/check", Some(json!({}))).await;
    assert_eq!(status, StatusCode::CONFLICT);
    assert_eq!(body["code"], "no_upstream");
}

#[tokio::test]
async fn history_route_lists_every_action_in_sequence() {
    let app = router(state(FixtureClient::new()));
    call(
        &app,
        "POST",
        "/api/skills/ears/copy",
        Some(json!({"new_id": "ears-mine", "new_title": "EARS mine"})),
    )
    .await;
    call(
        &app,
        "PUT",
        "/api/skills/ears-mine",
        Some(json!({"title": "EARS Meranti"})),
    )
    .await;
    let (status, history) = call(&app, "GET", "/api/skills/ears-mine/history", None).await;
    assert_eq!(status, StatusCode::OK);
    let rows = history.as_array().unwrap();
    assert_eq!(rows.len(), 2);
    assert_eq!(rows[0]["seq"], 1);
    assert_eq!(rows[1]["seq"], 2);
}

#[tokio::test]
async fn rollback_route_creates_a_new_version_one_history_entry_and_one_audit_entry() {
    let app = router(state(FixtureClient::new()));
    call(
        &app,
        "POST",
        "/api/skills/ears/copy",
        Some(json!({"new_id": "ears-mine", "new_title": "EARS mine"})),
    )
    .await;
    call(
        &app,
        "PUT",
        "/api/skills/ears-mine",
        Some(json!({"title": "EARS Meranti"})),
    )
    .await;
    let before = audit_actions(&app, SKILLS_AUDIT).await.len();
    let project_before = audit_actions(&app, PROJECT_AUDIT).await;

    let (status, rolled) = call(&app, "POST", "/api/skills/ears-mine/rollback/1", None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(rolled["manifest"]["title"], "EARS mine");
    assert_eq!(rolled["manifest"]["version"], "3");
    let (_, history) = call(&app, "GET", "/api/skills/ears-mine/history", None).await;
    let rows = history.as_array().unwrap();
    assert_eq!(rows.len(), 3);
    assert_eq!(rows[2]["action"], "rolled_back");

    let actions = audit_actions(&app, SKILLS_AUDIT).await;
    assert_eq!(actions.len(), before + 1);
    assert_eq!(actions.last().unwrap(), "revert");
    assert_project_audit_unchanged(&app, project_before).await;
}

#[tokio::test]
async fn rollback_route_404_for_an_unknown_version() {
    let app = router(state(FixtureClient::new()));
    let (status, body) = call(&app, "POST", "/api/skills/ears/rollback/99", None).await;
    assert_eq!(status, StatusCode::NOT_FOUND);
    assert_eq!(body["code"], "version_not_found");
}

/// IMP-35: the skills library has its own append-only chain, verified with a
/// head that the server keeps apart from the log.
#[tokio::test]
async fn skills_audit_route_starts_empty_and_reports_verify() {
    let app = router(state(FixtureClient::new()));
    let (status, body) = call(&app, "GET", SKILLS_AUDIT, None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["entries"].as_array().unwrap().len(), 0);
    assert_eq!(
        body["head_hash"],
        "0000000000000000000000000000000000000000000000000000000000000000"
    );
    assert!(body["error"].is_null(), "an empty chain verifies");
}

#[tokio::test]
async fn skills_audit_route_hashes_and_verifies_its_own_chain() {
    let app = router(state(FixtureClient::new()));
    call(
        &app,
        "POST",
        "/api/skills/ears/copy",
        Some(json!({"new_id": "ears-mine", "new_title": "EARS mine"})),
    )
    .await;
    call(&app, "POST", "/api/skills/ears-mine/rollback/1", None).await;

    let (status, body) = call(&app, "GET", SKILLS_AUDIT, None).await;
    assert_eq!(status, StatusCode::OK);
    let entries = body["entries"].as_array().unwrap();
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0]["seq"], 1);
    assert_eq!(entries[0]["action"], "revert");
    assert_eq!(
        entries[0]["prev_hash"],
        "0000000000000000000000000000000000000000000000000000000000000000"
    );
    let hash = entries[0]["hash"].as_str().unwrap();
    assert_eq!(hash.len(), 64, "an entry carries its sha256 hash");
    assert_eq!(body["head_hash"], hash, "the head is the last entry's hash");
    assert!(body["error"].is_null(), "the chain verifies");
}
