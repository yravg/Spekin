//! Spekin HTTP API. Routes live here so tests can call them without a socket.

pub mod skills;

use std::sync::Arc;

use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    routing::get,
};
use spekin_core::{Fixture, Project, Stage};

/// The project id the sample fixture is served under. The URL uses it: /p/meranti-yard/design.
pub const SAMPLE_PROJECT_ID: &str = "meranti-yard";

#[derive(Clone)]
pub struct AppState {
    pub sample: Arc<Fixture>,
}

impl AppState {
    pub fn from_fixture_json(text: &str) -> Result<Self, spekin_core::FixtureError> {
        Ok(Self {
            sample: Arc::new(Fixture::from_json(text)?),
        })
    }
}

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/api/health", get(|| async { "ok" }))
        .route("/api/projects/{id}", get(project))
        .route("/api/projects/{id}/stages", get(stages))
        .with_state(state)
}

fn find(state: &AppState, id: &str) -> Result<Arc<Fixture>, StatusCode> {
    if id == SAMPLE_PROJECT_ID {
        Ok(state.sample.clone())
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

async fn project(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Project>, StatusCode> {
    Ok(Json(find(&s, &id)?.project.clone()))
}

async fn stages(
    State(s): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<Stage>>, StatusCode> {
    Ok(Json(find(&s, &id)?.stages.clone()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::Request;
    use http_body_util::BodyExt;
    use tower::ServiceExt;

    const SAMPLE: &str = include_str!("../../../fixtures/meranti-yard.json");

    async fn get_json(uri: &str) -> (StatusCode, serde_json::Value) {
        let app = router(AppState::from_fixture_json(SAMPLE).unwrap());
        let res = app
            .oneshot(Request::get(uri).body(Body::empty()).unwrap())
            .await
            .unwrap();
        let status = res.status();
        let bytes = res.into_body().collect().await.unwrap().to_bytes();
        (
            status,
            serde_json::from_slice(&bytes).unwrap_or(serde_json::Value::Null),
        )
    }

    #[tokio::test]
    async fn stages_match_the_fixture_exactly() {
        let (status, body) = get_json("/api/projects/meranti-yard/stages").await;
        assert_eq!(status, StatusCode::OK);
        let fixture: serde_json::Value = serde_json::from_str(SAMPLE).unwrap();
        assert_eq!(
            body, fixture["STAGES"],
            "API stages must equal the sample the boards draw"
        );
    }

    #[tokio::test]
    async fn unknown_project_is_404() {
        let (status, _) = get_json("/api/projects/nope/stages").await;
        assert_eq!(status, StatusCode::NOT_FOUND);
    }
}
