//! IMP-33: `GET /api/projects/{id}/contracts` returns the S37 sample shapes.

use axum::{
    body::Body,
    http::{Method, Request, StatusCode},
};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use spekin_core::ContractsResponse;
use spekin_server::{AppState, router};
use tower::ServiceExt;

const SAMPLE: &str = include_str!("../../../fixtures/meranti-yard.json");

fn app() -> axum::Router {
    router(AppState::from_fixture_json(SAMPLE).expect("sample fixture is valid"))
}

async fn get(uri: &str) -> (StatusCode, Value) {
    let req = Request::builder().method(Method::GET).uri(uri).body(Body::empty()).unwrap();
    let res = app().oneshot(req).await.unwrap();
    let status = res.status();
    let bytes = res.into_body().collect().await.unwrap().to_bytes();
    (status, serde_json::from_slice(&bytes).unwrap_or(Value::Null))
}

#[tokio::test]
async fn contracts_route_returns_seeded_s37_contracts_evidence_and_matrix() {
    let (status, body) = get("/api/projects/meranti-yard/contracts").await;
    assert_eq!(status, StatusCode::OK, "body: {body}");

    let response: ContractsResponse = serde_json::from_value(body.clone()).expect("typed contracts response");
    assert_eq!(response.contracts.len(), 8);
    assert!(response.contracts.iter().any(|c| c.title == "Variance alerts"));
    assert!(!response.evidence.is_empty());
    assert!(!response.matrix.is_empty());
    assert!(response.matrix.iter().any(|row| row.status == spekin_core::contracts::ContractStatus::NotRun));
    assert_eq!(body["contracts"][0]["checks"][0].is_array(), true);
}

#[tokio::test]
async fn contracts_route_404_for_unknown_project() {
    let (status, body) = get("/api/projects/nope/contracts").await;
    assert_eq!(status, StatusCode::NOT_FOUND, "body: {body}");
    assert_eq!(body, json!({ "code": "project_not_found", "message": "unknown project: nope" }));
}
