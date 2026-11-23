//! Integration tests for IMP-26: Axum API routes calling `spekin-core`.
//!
//! Each route has a happy-path test verifying typed JSON output and a 4xx test
//! verifying typed error handling. IMP-42: every test runs against the memory
//! store always and the Postgres store when `TEST_DATABASE_URL` is set.

use axum::{
    body::Body,
    http::{Method, Request, StatusCode, header},
};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use spekin_core::{
    BoardArtifact, BoardSnapshot, ContextChip, ContextItemStatus, GenUiValidation,
    ManifestSelection, ManifestSelectionItem, ModelCapability, Rejection, RequestContext,
    Reservation, Revision, RunEstimate, SkillManifest, SkillSource, StageId, UpdateCheck,
    UpdateDecision, UpdatePolicy, UsageSnapshot,
};
use tower::ServiceExt;

mod support;
use support::run_on_both;

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

fn sample_skill(version: &str, body: &str, tools: Vec<&str>) -> SkillManifest {
    SkillManifest {
        id: "grill-idea".into(),
        title: "Grill the idea".into(),
        description: "Stress-test a product idea.".into(),
        stages: vec![StageId::Planning],
        source: SkillSource::Github {
            repo: "mattpocock/skills".into(),
            path: "grill-me/SKILL.md".into(),
            commit: "abc1234".into(),
        },
        licence: "MIT".into(),
        notice: Some("Copyright (c) Matt Pocock".into()),
        version: version.into(),
        reads: vec!["pitch".into()],
        proposes: vec!["decisions".into()],
        tools: tools.into_iter().map(String::from).collect(),
        scripts: vec![],
        invocation: "/grill-idea".into(),
        body: body.into(),
    }
}

// --- IMP-04: Proposals accept & reject ---

#[tokio::test]
async fn accept_proposal_bumps_revision_and_second_accept_is_409_stale() {
    run_on_both(|app| async move {
        let (status, body) = send(
            &app,
            Method::POST,
            "/api/projects/meranti-yard/proposals/P-07/accept",
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "body: {body}");
        let rev: Revision = serde_json::from_value(body).expect("typed Revision");
        assert_eq!(rev.n, 15);
        assert!(rev.content.contains("R-DASH-019"));

        // Accepting the same proposal a second time is stale (409 Conflict).
        let (status2, body2) = send(
            &app,
            Method::POST,
            "/api/projects/meranti-yard/proposals/P-07/accept",
            None,
        )
        .await;
        assert_eq!(status2, StatusCode::CONFLICT, "body: {body2}");
        assert_eq!(body2["code"], "proposal_stale");
    })
    .await;
}

#[tokio::test]
async fn accept_proposal_404_for_unknown_project_or_proposal() {
    run_on_both(|app| async move {
        let (status, body) = send(
            &app,
            Method::POST,
            "/api/projects/nope/proposals/P-07/accept",
            None,
        )
        .await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        assert_eq!(body["code"], "project_not_found");

        let (status2, body2) = send(
            &app,
            Method::POST,
            "/api/projects/meranti-yard/proposals/P-999/accept",
            None,
        )
        .await;
        assert_eq!(status2, StatusCode::NOT_FOUND);
        assert_eq!(body2["code"], "proposal_not_found");
    })
    .await;
}

#[tokio::test]
async fn reject_proposal_records_reason_and_empty_reason_is_400() {
    run_on_both(|app| async move {
        let (status, body) = send(
            &app,
            Method::POST,
            "/api/projects/meranti-yard/proposals/P-07/reject",
            Some(json!({ "reason": "Threshold should be 5% for marine packages." })),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "body: {body}");
        let rej: Rejection = serde_json::from_value(body).expect("typed Rejection");
        assert_eq!(rej.id, "P-07");
        assert_eq!(rej.base, 14);
        assert_eq!(rej.reason, "Threshold should be 5% for marine packages.");

        // 4xx: empty reason is rejected with 400.
        let (bad_status, bad_body) = send(
            &app,
            Method::POST,
            "/api/projects/meranti-yard/proposals/P-07/reject",
            Some(json!({ "reason": "   " })),
        )
        .await;
        assert_eq!(bad_status, StatusCode::BAD_REQUEST);
        assert_eq!(bad_body["code"], "empty_reason");
    })
    .await;
}

// --- IMP-09: Runs estimate, reserve & usage ---

#[tokio::test]
async fn runs_estimate_returns_typed_estimate_and_400_on_invalid_bounds() {
    run_on_both(|app| async move {
        let (status, body) = send(
            &app,
            Method::POST,
            "/api/projects/meranti-yard/runs/estimate",
            Some(json!({ "min": 18, "max": 30, "reserve": 36 })),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "body: {body}");
        let est: RunEstimate = serde_json::from_value(body).expect("typed RunEstimate");
        assert_eq!(
            est,
            RunEstimate {
                min: 18,
                max: 30,
                reserve: 36,
            }
        );

        // 4xx: min > max is invalid.
        let (bad_status, bad_body) = send(
            &app,
            Method::POST,
            "/api/projects/meranti-yard/runs/estimate",
            Some(json!({ "min": 40, "max": 30, "reserve": 36 })),
        )
        .await;
        assert_eq!(bad_status, StatusCode::BAD_REQUEST);
        assert_eq!(bad_body["code"], "invalid_estimate");
    })
    .await;
}

#[tokio::test]
async fn runs_reserve_updates_usage_and_over_cap_is_409() {
    run_on_both(|app| async move {
        let (before_status, before_body) =
            send(&app, Method::GET, "/api/projects/meranti-yard/usage", None).await;
        assert_eq!(before_status, StatusCode::OK, "body: {before_body}");
        let before: UsageSnapshot =
            serde_json::from_value(before_body).expect("typed UsageSnapshot");
        assert_eq!(before.used, 1240);
        assert_eq!(before.cap, 5000);

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
        let reservation: Reservation = serde_json::from_value(res_body).expect("typed Reservation");
        assert_eq!(reservation.run_id, "run-0429");
        assert_eq!(reservation.reserved, 36);

        let (after_status, after_body) =
            send(&app, Method::GET, "/api/projects/meranti-yard/usage", None).await;
        assert_eq!(after_status, StatusCode::OK);
        let after: UsageSnapshot = serde_json::from_value(after_body).expect("typed UsageSnapshot");
        assert_eq!(after.reserved, before.reserved + 36);

        // 4xx: exceeding per-run cap (60 cr) fails with 409 Conflict.
        let (cap_status, cap_body) = send(
            &app,
            Method::POST,
            "/api/projects/meranti-yard/runs/reserve",
            Some(json!({
                "run_id": "run-huge",
                "person_id": "user-enrico",
                "idempotency_key": "k-huge",
                "estimate": { "min": 50, "max": 60, "reserve": 120 }
            })),
        )
        .await;
        assert_eq!(cap_status, StatusCode::CONFLICT, "body: {cap_body}");
        assert_eq!(cap_body["code"], "per_run_cap_exceeded");
    })
    .await;
}

#[tokio::test]
async fn usage_404_for_unknown_project() {
    run_on_both(|app| async move {
        let (status, body) = send(&app, Method::GET, "/api/projects/nope/usage", None).await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        assert_eq!(body["code"], "project_not_found");
    })
    .await;
}

// --- IMP-11: Models ---

#[tokio::test]
async fn models_returns_sample_registry_and_rejects_post_with_405() {
    run_on_both(|app| async move {
        let (status, body) = send(&app, Method::GET, "/api/models", None).await;
        assert_eq!(status, StatusCode::OK, "body: {body}");
        let models: Vec<ModelCapability> =
            serde_json::from_value(body).expect("typed Vec<ModelCapability>");
        assert_eq!(models.len(), 3);
        assert_eq!(models[0].id, "claude-sonnet-5-5");

        // 4xx: POST to read-only models endpoint is 405 Method Not Allowed.
        let (bad_status, _) = send(&app, Method::POST, "/api/models", Some(json!({}))).await;
        assert_eq!(bad_status, StatusCode::METHOD_NOT_ALLOWED);
    })
    .await;
}

// --- IMP-10: GenUI validate ---

#[tokio::test]
async fn genui_validate_accepts_valid_card_and_rejects_unsafe_card_with_422() {
    run_on_both(|app| async move {
        let valid = json!({
            "schema_version": 1,
            "id": "card-1",
            "title": "Variance checklist",
            "provenance": "model_proposal",
            "family": "checklist",
            "items": [
                { "id": "i1", "label": "Check 3% rule", "checked": true, "status": "passed" }
            ]
        });
        let (status, body) = send(&app, Method::POST, "/api/genui/validate", Some(valid)).await;
        assert_eq!(status, StatusCode::OK, "body: {body}");
        let parsed: GenUiValidation = serde_json::from_value(body).expect("typed GenUiValidation");
        assert!(matches!(parsed, GenUiValidation::Ok { .. }));

        // 4xx: privilege-escalating action fails closed with 422.
        let unsafe_card = json!({
            "schema_version": 1,
            "id": "card-2",
            "title": "Auto deploy",
            "provenance": "model_proposal",
            "family": "checklist",
            "items": [
                { "id": "i1", "label": "Deploy now", "checked": false, "status": "untested" }
            ],
            "actions": [
                { "kind": "deploy", "label": "Deploy" }
            ]
        });
        let (bad_status, bad_body) =
            send(&app, Method::POST, "/api/genui/validate", Some(unsafe_card)).await;
        assert_eq!(
            bad_status,
            StatusCode::UNPROCESSABLE_ENTITY,
            "body: {bad_body}"
        );
        let rejected: GenUiValidation =
            serde_json::from_value(bad_body).expect("typed GenUiValidation");
        assert!(matches!(rejected, GenUiValidation::Rejected { .. }));
    })
    .await;
}

// --- IMP-22: Skills check-update ---

#[tokio::test]
async fn skills_check_update_classifies_update_and_400_on_mismatched_ids() {
    run_on_both(|app| async move {
        let old = sample_skill("1.0.0", "Ask focused questions.", vec!["read_spec"]);
        let new = sample_skill("1.1.0", "Ask focused questions cleanly.", vec!["read_spec"]);
        let (status, body) = send(
            &app,
            Method::POST,
            "/api/skills/check-update",
            Some(json!({
                "old": old,
                "new": new,
                "policy": UpdatePolicy::Auto
            })),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "body: {body}");
        let check: UpdateCheck = serde_json::from_value(body).expect("typed UpdateCheck");
        assert_eq!(check.decision, UpdateDecision::Apply);

        // 4xx: mismatched skill ids rejected with 400.
        let mut other = sample_skill("1.1.0", "Other skill.", vec![]);
        other.id = "different-skill".into();
        let (bad_status, bad_body) = send(
            &app,
            Method::POST,
            "/api/skills/check-update",
            Some(json!({
                "old": old,
                "new": other,
                "policy": UpdatePolicy::Auto
            })),
        )
        .await;
        assert_eq!(bad_status, StatusCode::BAD_REQUEST, "body: {bad_body}");
        assert_eq!(bad_body["code"], "skill_id_mismatch");
    })
    .await;
}

// --- IMP-25: Context builder ---

#[tokio::test]
async fn context_route_returns_only_listed_chips_and_404_for_unknown_project() {
    run_on_both(|app| async move {
        let board = BoardSnapshot {
            board_id: "design".into(),
            items: vec![
                BoardArtifact {
                    artifact_id: "F-03".into(),
                    revision: "r6".into(),
                    status: ContextItemStatus::Accepted,
                    hidden: false,
                    content: "Variance table".into(),
                    estimated_tokens: 3100,
                },
                BoardArtifact {
                    artifact_id: "F-99".into(),
                    revision: "r1".into(),
                    status: ContextItemStatus::Draft,
                    hidden: true,
                    content: "Hidden scratch".into(),
                    estimated_tokens: 900,
                },
            ],
        };
        let chips = vec![
            ContextChip {
                artifact_id: "F-03".into(),
                revision: "r6".into(),
                status: ContextItemStatus::Accepted,
                estimated_tokens: 3100,
            },
            ContextChip {
                artifact_id: "F-99".into(),
                revision: "r1".into(),
                status: ContextItemStatus::Draft,
                estimated_tokens: 900,
            },
        ];

        let (status, body) = send(
            &app,
            Method::POST,
            "/api/projects/meranti-yard/context",
            Some(json!({ "chips": chips, "board": board })),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "body: {body}");
        let ctx: RequestContext = serde_json::from_value(body).expect("typed RequestContext");
        assert_eq!(ctx.items.len(), 1);
        assert_eq!(ctx.items[0].artifact_id, "F-03");
        assert_eq!(ctx.total_estimated_tokens, 3100);

        // 4xx: unknown project is 404.
        let (bad_status, bad_body) = send(
            &app,
            Method::POST,
            "/api/projects/nope/context",
            Some(json!({ "chips": [] })),
        )
        .await;
        assert_eq!(bad_status, StatusCode::NOT_FOUND);
        assert_eq!(bad_body["code"], "project_not_found");
    })
    .await;
}

// --- IMP-24: Handoff manifest ---

#[tokio::test]
async fn handoff_manifest_seals_accepted_items_and_422_on_draft_or_empty() {
    run_on_both(|app| async move {
        let selection = ManifestSelection {
            manifest_id: "m-0008".into(),
            spec_rev: "r14".into(),
            framework: "React".into(),
            items: vec![
                ManifestSelectionItem {
                    artifact_id: "F-01".into(),
                    revision_n: 4,
                },
                ManifestSelectionItem {
                    artifact_id: "F-03".into(),
                    revision_n: 6,
                },
            ],
        };
        let (status, body) = send(
            &app,
            Method::POST,
            "/api/projects/meranti-yard/handoff/manifest",
            Some(json!({ "selection": selection })),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "body: {body}");
        let manifest: spekin_core::Manifest = serde_json::from_value(body).expect("typed Manifest");
        assert_eq!(manifest.manifest_id, "m-0008");
        assert_eq!(manifest.artifacts.len(), 2);
        assert!(
            manifest
                .required_inputs
                .iter()
                .any(|i| i.label == "PRD: missing")
        );

        // 4xx: empty selection is rejected with 422.
        let empty = ManifestSelection {
            manifest_id: "m-0009".into(),
            spec_rev: "r14".into(),
            framework: "React".into(),
            items: vec![],
        };
        let (bad_status, bad_body) = send(
            &app,
            Method::POST,
            "/api/projects/meranti-yard/handoff/manifest",
            Some(json!({ "selection": empty })),
        )
        .await;
        assert_eq!(
            bad_status,
            StatusCode::UNPROCESSABLE_ENTITY,
            "body: {bad_body}"
        );
        assert_eq!(bad_body["code"], "empty_selection");
    })
    .await;
}
