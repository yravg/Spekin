//! IMP-31: audit, revert, settle, delete and restore in the API.
//!
//! One test per route plus a 4xx test. The reject test proves C-03: a reject
//! adds exactly one audit entry and leaves the revision untouched.

use axum::{
    body::Body,
    http::{Method, Request, StatusCode, header},
};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use spekin_core::SECONDS_PER_DAY;
use spekin_server::{AppState, DEFAULT_NOW, router};
use tower::ServiceExt;

const SAMPLE: &str = include_str!("../../../fixtures/meranti-yard.json");

fn app() -> axum::Router {
    router(AppState::from_fixture_json(SAMPLE).expect("sample fixture is valid"))
}

async fn send(
    app: &axum::Router,
    method: Method,
    uri: &str,
    body: Option<Value>,
) -> (StatusCode, Value) {
    let req = match body {
        Some(payload) => Request::builder()
            .method(method)
            .uri(uri)
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(payload.to_string()))
            .unwrap(),
        None => Request::builder()
            .method(method)
            .uri(uri)
            .body(Body::empty())
            .unwrap(),
    };
    let res = app.clone().oneshot(req).await.unwrap();
    let status = res.status();
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    let parsed = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
    (status, parsed)
}

async fn audit_entries(app: &axum::Router) -> Vec<Value> {
    let (status, body) = send(app, Method::GET, "/api/projects/meranti-yard/audit", None).await;
    assert_eq!(status, StatusCode::OK, "audit route must work: {body}");
    assert_eq!(
        body["error"],
        Value::Null,
        "a fresh chain must verify: {body}"
    );
    body["entries"].as_array().expect("entries array").to_vec()
}

// --- GET /api/projects/{id}/audit ---

#[tokio::test]
async fn audit_route_starts_empty_and_404_for_unknown_project() {
    let app = app();
    let entries = audit_entries(&app).await;
    assert!(entries.is_empty(), "audit starts empty");

    let (status, body) = send(&app, Method::GET, "/api/projects/nope/audit", None).await;
    assert_eq!(status, StatusCode::NOT_FOUND);
    assert_eq!(body["code"], "project_not_found");
}

// --- Accept / reject / revert: one audit entry per action ---

#[tokio::test]
async fn reject_adds_exactly_one_audit_entry_and_no_revision() {
    let app = app();

    let (status, body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/proposals/P-07/reject",
        Some(json!({ "reason": "Threshold should be 5%." })),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "body: {body}");

    let entries = audit_entries(&app).await;
    assert_eq!(entries.len(), 1, "exactly one audit entry for a reject");
    assert_eq!(entries[0]["action"], "reject");
    assert_eq!(entries[0]["target_id"], "P-07");
    assert_eq!(entries[0]["reason"], "Threshold should be 5%.");

    // No revision was made: the proposal can still be accepted against r14 and
    // produces r15, exactly as it would have without the reject (C-03).
    let (accept_status, accept_body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/proposals/P-07/accept",
        None,
    )
    .await;
    assert_eq!(accept_status, StatusCode::OK, "body: {accept_body}");
    assert_eq!(accept_body["n"], 15, "reject left the revision at r14");

    let entries = audit_entries(&app).await;
    assert_eq!(entries.len(), 2);
    assert_eq!(entries[1]["action"], "accept");
}

#[tokio::test]
async fn accept_and_revert_each_append_one_audit_entry() {
    let app = app();

    let (status, _) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/proposals/P-07/accept",
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);

    let (rev_status, rev_body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/revisions/spec/revert",
        Some(json!({ "to": { "n": 14, "content": "r14 content restored" } })),
    )
    .await;
    assert_eq!(rev_status, StatusCode::OK, "body: {rev_body}");
    assert_eq!(
        rev_body["n"], 16,
        "revert writes a new revision, r15 -> r16"
    );
    assert_eq!(rev_body["content"], "r14 content restored");

    let entries = audit_entries(&app).await;
    assert_eq!(entries.len(), 2);
    assert_eq!(entries[0]["action"], "accept");
    assert_eq!(entries[1]["action"], "revert");
    assert_eq!(entries[1]["target_id"], "spec");

    // 4xx: reverting to a target that is not earlier is refused and adds nothing.
    let (bad_status, bad_body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/revisions/spec/revert",
        Some(json!({ "to": { "n": 16, "content": "not earlier" } })),
    )
    .await;
    assert_eq!(
        bad_status,
        StatusCode::UNPROCESSABLE_ENTITY,
        "body: {bad_body}"
    );
    assert_eq!(bad_body["code"], "revert_not_earlier");
    assert_eq!(
        audit_entries(&app).await.len(),
        2,
        "a refused revert adds no entry"
    );
}

// --- Runs: reserve and settle audit theirs ---

#[tokio::test]
async fn reserve_and_settle_each_append_one_audit_entry() {
    let app = app();

    let (res_status, res_body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/runs/reserve",
        Some(json!({
            "run_id": "run-0429",
            "person_id": "user-enrico",
            "idempotency_key": "k-7f3c91",
            "estimate": { "min": 18, "max": 30, "reserve": 36 }
        })),
    )
    .await;
    assert_eq!(res_status, StatusCode::OK, "body: {res_body}");

    let (set_status, set_body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/runs/settle",
        Some(json!({ "run_id": "run-0429", "actual": 24 })),
    )
    .await;
    assert_eq!(set_status, StatusCode::OK, "body: {set_body}");
    assert_eq!(set_body["run_id"], "run-0429");
    assert_eq!(set_body["charged"], 24);
    assert_eq!(set_body["refunded"], 12);

    let entries = audit_entries(&app).await;
    assert_eq!(entries.len(), 2);
    assert_eq!(entries[0]["action"], "reserve");
    assert_eq!(entries[1]["action"], "settle");

    // 4xx: settling an unknown run is refused and adds no entry.
    let (bad_status, bad_body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/runs/settle",
        Some(json!({ "run_id": "nope", "actual": 10 })),
    )
    .await;
    assert_eq!(bad_status, StatusCode::NOT_FOUND, "body: {bad_body}");
    assert_eq!(bad_body["code"], "no_reservation");
    assert_eq!(audit_entries(&app).await.len(), 2);
}

// --- Delete / restore / recently deleted ---

#[tokio::test]
async fn delete_and_restore_audit_and_the_deleted_list_has_days_left() {
    let app = app();

    let (list_status, list_body) = send(&app, Method::GET, "/api/projects/deleted", None).await;
    assert_eq!(list_status, StatusCode::OK, "body: {list_body}");
    let seeded = list_body.as_array().expect("deleted list is an array");
    assert!(!seeded.is_empty(), "the sample deleted project is listed");
    assert!(seeded[0]["entry"]["deleted_at"].is_number());
    assert!(seeded[0]["days_left"].is_number());

    let (del_status, del_body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/delete",
        None,
    )
    .await;
    assert_eq!(del_status, StatusCode::OK, "body: {del_body}");
    assert_eq!(del_body["id"], "meranti-yard");
    assert!(del_body["deleted_at"].is_number());

    let entries = audit_entries(&app).await;
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0]["action"], "delete");

    let (list_status, list_body) = send(&app, Method::GET, "/api/projects/deleted", None).await;
    assert_eq!(list_status, StatusCode::OK);
    let listed = list_body.as_array().expect("deleted list is an array");
    assert!(
        listed.iter().any(|v| v["entry"]["id"] == "meranti-yard"),
        "the deleted project appears in the list"
    );

    let (res_status, res_body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/restore",
        None,
    )
    .await;
    assert_eq!(res_status, StatusCode::OK, "body: {res_body}");
    assert_eq!(res_body["id"], "meranti-yard");
    assert!(res_body["deleted_at"].is_null(), "restore clears the mark");

    let entries = audit_entries(&app).await;
    assert_eq!(entries.len(), 2);
    assert_eq!(entries[1]["action"], "restore");

    // 4xx: deleting twice and restoring a live project are refused.
    let (bad_status, bad_body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/restore",
        None,
    )
    .await;
    assert_eq!(bad_status, StatusCode::CONFLICT, "body: {bad_body}");
    assert_eq!(bad_body["code"], "not_deleted");

    let (del_again_status, del_again_body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/delete",
        None,
    )
    .await;
    assert_eq!(del_again_status, StatusCode::OK, "body: {del_again_body}");
    let (twice_status, twice_body) = send(
        &app,
        Method::POST,
        "/api/projects/meranti-yard/delete",
        None,
    )
    .await;
    assert_eq!(twice_status, StatusCode::CONFLICT, "body: {twice_body}");
    assert_eq!(twice_body["code"], "already_deleted");
}

#[tokio::test]
async fn restore_after_the_window_is_409_and_adds_no_audit_entry() {
    // The seeded kenari-fleet was deleted three days before DEFAULT_NOW; a month later
    // the IMP-29 window is closed. No audit entry is written for a refused restore.
    let state = AppState::from_fixture_json(SAMPLE)
        .expect("sample fixture is valid")
        .with_now(DEFAULT_NOW + 31 * SECONDS_PER_DAY);
    let app = router(state);

    let (status, body) = send(
        &app,
        Method::POST,
        "/api/projects/kenari-fleet/restore",
        None,
    )
    .await;
    assert_eq!(status, StatusCode::CONFLICT, "body: {body}");
    assert_eq!(body["code"], "window_closed");
    assert!(
        audit_entries(&app).await.is_empty(),
        "a refused restore adds no audit entry"
    );
}

#[tokio::test]
async fn audit_route_404_for_unknown_project_on_revert_and_delete() {
    let app = app();
    let (s1, b1) = send(
        &app,
        Method::POST,
        "/api/projects/nope/revisions/spec/revert",
        Some(json!({ "to": { "n": 1, "content": "old" } })),
    )
    .await;
    assert_eq!(s1, StatusCode::NOT_FOUND);
    assert_eq!(b1["code"], "project_not_found");

    let (s2, b2) = send(&app, Method::POST, "/api/projects/nope/delete", None).await;
    assert_eq!(s2, StatusCode::NOT_FOUND);
    assert_eq!(b2["code"], "project_not_found");
}
