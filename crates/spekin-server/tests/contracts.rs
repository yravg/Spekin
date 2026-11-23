//! IMP-33: `GET /api/projects/{id}/contracts` returns the S37 sample shapes.
//!
//! IMP-42: every test runs against the memory store always and the Postgres store
//! when `TEST_DATABASE_URL` is set.

use axum::{
    body::Body,
    http::{Method, Request, StatusCode},
};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use spekin_core::ContractsResponse;
use tower::ServiceExt;

mod support;
use support::run_on_both;

async fn get(app: &axum::Router, uri: &str) -> (StatusCode, Value) {
    let req = Request::builder()
        .method(Method::GET)
        .uri(uri)
        .body(Body::empty())
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    let status = res.status();
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    (
        status,
        serde_json::from_slice(&bytes).unwrap_or(Value::Null),
    )
}

#[tokio::test]
async fn contracts_route_returns_seeded_s37_contracts_evidence_and_matrix() {
    run_on_both(|app| async move {
        let (status, body) = get(&app, "/api/projects/meranti-yard/contracts").await;
        assert_eq!(status, StatusCode::OK, "body: {body}");

        let response: ContractsResponse =
            serde_json::from_value(body.clone()).expect("typed contracts response");
        assert_eq!(response.contracts.len(), 8);
        assert!(
            response
                .contracts
                .iter()
                .any(|c| c.title == "Variance alerts")
        );
        assert!(!response.evidence.is_empty());
        assert!(!response.matrix.is_empty());
        assert!(
            response
                .matrix
                .iter()
                .any(|row| row.status == spekin_core::contracts::ContractStatus::NotRun)
        );
        assert!(body["contracts"][0]["checks"].is_array());
        assert!(body["contracts"][1]["checks"][0]["name"].is_string());
    })
    .await;
}

#[tokio::test]
async fn contracts_route_404_for_unknown_project() {
    run_on_both(|app| async move {
        let (status, body) = get(&app, "/api/projects/nope/contracts").await;
        assert_eq!(status, StatusCode::NOT_FOUND, "body: {body}");
        assert_eq!(
            body,
            json!({ "code": "project_not_found", "message": "unknown project: nope" })
        );
    })
    .await;
}
