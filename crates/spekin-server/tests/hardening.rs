//! IMP-32: server hardening layers, each with its own test.
//!
//! Body limit, JSON-only POSTs, request timeout, single-origin CORS, security
//! headers, loopback bind and errors that never echo request data.

use std::time::Duration;

use axum::{
    Router,
    body::Body,
    http::{HeaderMap, Method, Request, StatusCode, header},
    routing::{get, post},
};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use spekin_server::{
    AppState,
    hardening::{
        BODY_LIMIT_BYTES, DEFAULT_BIND, DEFAULT_WEB_ORIGIN, GITHUB_TIMEOUT, HardeningConfig,
        REQUEST_TIMEOUT, apply_hardening, bind_addr, is_loopback,
    },
    router,
};
use tower::ServiceExt;

const SAMPLE: &str = include_str!("../../../fixtures/meranti-yard.json");

async fn call(app: &Router, req: Request<Body>) -> (StatusCode, HeaderMap, Value) {
    let res = app.clone().oneshot(req).await.expect("router responds");
    let status = res.status();
    let headers = res.headers().clone();
    let bytes = res.into_body().collect().await.expect("body").to_bytes();
    let body = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
    (status, headers, body)
}

fn state() -> AppState {
    AppState::from_fixture_json(SAMPLE).expect("sample fixture is valid")
}

#[tokio::test]
async fn body_over_one_megabyte_is_a_typed_413() {
    let app = router(state());
    let big = "x".repeat(BODY_LIMIT_BYTES + 1);
    let req = Request::post("/api/genui/validate")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::CONTENT_LENGTH, big.len())
        .body(Body::from(big))
        .expect("request");
    let (status, _, body) = call(&app, req).await;
    assert_eq!(status, StatusCode::PAYLOAD_TOO_LARGE);
    assert_eq!(body["code"], json!("payload_too_large"));
    assert!(body["message"].as_str().is_some_and(|m| !m.is_empty()));
}

#[tokio::test]
async fn a_body_at_the_limit_is_not_rejected() {
    let app = router(state());
    let exact = "x".repeat(BODY_LIMIT_BYTES);
    let req = Request::post("/api/genui/validate")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::CONTENT_LENGTH, exact.len())
        .body(Body::from(exact))
        .expect("request");
    let (status, _, _) = call(&app, req).await;
    assert_ne!(
        status,
        StatusCode::PAYLOAD_TOO_LARGE,
        "exactly 1 MB is allowed"
    );
}

#[tokio::test]
async fn post_with_a_non_json_content_type_is_a_typed_415() {
    let secret = "FAKE_TOKEN_never_echo_9f3a7c";
    let st = state();
    let app = router(st.clone());
    let body = format!("{{\"token\":\"{secret}\"}}");
    let req = Request::post("/api/genui/validate")
        .header(header::CONTENT_TYPE, "text/plain")
        .header(header::AUTHORIZATION, format!("Bearer {secret}"))
        .header(header::CONTENT_LENGTH, body.len())
        .body(Body::from(body))
        .expect("request");
    let (status, _, body) = call(&app, req).await;
    assert_eq!(status, StatusCode::UNSUPPORTED_MEDIA_TYPE);
    assert_eq!(body["code"], json!("unsupported_media_type"));

    // The rejected body and the bearer token must appear neither in the typed
    // error nor in the server's log lines.
    let response = body.to_string();
    let logs = st.log_lines().join("\n");
    assert!(!response.contains(secret), "typed error echoes the token");
    assert!(!logs.contains(secret), "log line echoes the token");
    assert!(
        st.log_lines()
            .iter()
            .any(|line| line.contains("unsupported media type")),
        "the rejection is logged without request data: {logs}"
    );
}

#[tokio::test]
async fn post_with_json_and_a_charset_is_accepted() {
    let app = router(state());
    let req = Request::post("/api/genui/validate")
        .header(header::CONTENT_TYPE, "application/json; charset=utf-8")
        .header(header::CONTENT_LENGTH, 2)
        .body(Body::from("{}"))
        .expect("request");
    let (status, _, _) = call(&app, req).await;
    assert_ne!(
        status,
        StatusCode::UNSUPPORTED_MEDIA_TYPE,
        "application/json with a charset is JSON"
    );
}

#[tokio::test]
async fn get_with_a_non_json_content_type_is_not_rejected() {
    let app = router(state());
    let req = Request::get("/api/health")
        .header(header::CONTENT_TYPE, "text/plain")
        .body(Body::empty())
        .expect("request");
    let (status, _, _) = call(&app, req).await;
    assert_eq!(status, StatusCode::OK, "only POST is JSON-only");
}

#[tokio::test]
async fn a_slow_request_is_a_typed_504() {
    let cfg = HardeningConfig::from_env().with_timeout(Duration::from_millis(30));
    let app = apply_hardening(
        Router::new().route(
            "/api/slow",
            get(|| async {
                tokio::time::sleep(Duration::from_secs(1)).await;
                "too late"
            }),
        ),
        cfg,
    );
    let (status, _, body) =
        call(&app, Request::get("/api/slow").body(Body::empty()).unwrap()).await;
    assert_eq!(status, StatusCode::GATEWAY_TIMEOUT);
    assert_eq!(body["code"], json!("request_timeout"));
}

#[tokio::test]
async fn cors_allows_only_the_configured_web_origin() {
    let cfg = HardeningConfig::from_env().with_web_origin("https://app.example.test");
    let app = apply_hardening(
        Router::new().route("/api/health", get(|| async { "ok" })),
        cfg,
    );

    let preflight = |origin: &'static str| {
        Request::builder()
            .method(Method::OPTIONS)
            .uri("/api/health")
            .header(header::ORIGIN, origin)
            .header(header::ACCESS_CONTROL_REQUEST_METHOD, "POST")
            .body(Body::empty())
            .expect("preflight")
    };

    let (status, headers, _) = call(&app, preflight("https://app.example.test")).await;
    assert_eq!(status, StatusCode::OK);
    let allowed = headers
        .get(header::ACCESS_CONTROL_ALLOW_ORIGIN)
        .expect("allowed origin is echoed");
    assert_eq!(allowed, "https://app.example.test");
    assert_ne!(allowed, "*", "a wildcard is never used");

    let (_, headers, _) = call(&app, preflight("https://evil.example")).await;
    assert!(
        headers.get(header::ACCESS_CONTROL_ALLOW_ORIGIN).is_none(),
        "another origin is not allowed"
    );
}

#[tokio::test]
async fn security_headers_are_on_every_response() {
    let app = apply_hardening(
        Router::new()
            .route("/api/health", get(|| async { "ok" }))
            .route("/health", get(|| async { "ok" })),
        HardeningConfig::from_env(),
    );

    for uri in ["/api/health", "/api/nope"] {
        let (_, headers, _) = call(&app, Request::get(uri).body(Body::empty()).unwrap()).await;
        assert_eq!(
            headers.get(header::X_CONTENT_TYPE_OPTIONS).unwrap(),
            "nosniff",
            "{uri}"
        );
        assert_eq!(
            headers.get(header::REFERRER_POLICY).unwrap(),
            "no-referrer",
            "{uri}"
        );
        assert_eq!(
            headers.get(header::CACHE_CONTROL).unwrap(),
            "no-store",
            "{uri}"
        );
    }

    let (_, headers, _) = call(&app, Request::get("/health").body(Body::empty()).unwrap()).await;
    assert_eq!(
        headers.get(header::X_CONTENT_TYPE_OPTIONS).unwrap(),
        "nosniff"
    );
    assert_eq!(headers.get(header::REFERRER_POLICY).unwrap(), "no-referrer");
    assert!(
        headers.get(header::CACHE_CONTROL).is_none(),
        "no-store is for /api only"
    );
}

#[test]
fn default_configuration_matches_the_card() {
    let cfg = HardeningConfig::from_env();
    assert_eq!(cfg.body_limit, 1_048_576);
    assert_eq!(cfg.timeout, Duration::from_secs(15));
    assert_eq!(cfg.web_origin, DEFAULT_WEB_ORIGIN);
    assert_eq!(BODY_LIMIT_BYTES, 1_048_576);
    assert_eq!(REQUEST_TIMEOUT, Duration::from_secs(15));
    assert_eq!(GITHUB_TIMEOUT, Duration::from_secs(20));
    assert_eq!(DEFAULT_BIND, "127.0.0.1:8787");
}

#[test]
fn the_server_binds_loopback_by_default_and_knows_when_it_does_not() {
    assert_eq!(bind_addr(), DEFAULT_BIND);
    assert!(is_loopback("127.0.0.1:8787"));
    assert!(is_loopback("localhost:8787"));
    assert!(is_loopback("[::1]:8787"));
    assert!(!is_loopback("0.0.0.0:8787"));
    assert!(!is_loopback("192.168.1.10:8787"));
}

/// IMP-35 follow-up on #24: a chunked body has no `Content-Length`, so a
/// header-only limit lets it stream past the byte cap.
#[tokio::test]
async fn chunked_body_over_the_limit_is_a_typed_413() {
    let app = router(state());
    // Two frames whose total crosses the cap, as a real chunked stream arrives.
    let chunk = "x".repeat(BODY_LIMIT_BYTES / 2 + 1);
    let chunks = vec![
        Ok::<_, std::io::Error>(chunk.clone()),
        Ok::<_, std::io::Error>(chunk),
    ];
    let req = Request::post("/api/genui/validate")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::TRANSFER_ENCODING, "chunked")
        .body(Body::from_stream(futures_util::stream::iter(chunks)))
        .expect("request");
    assert!(
        !req.headers().contains_key(header::CONTENT_LENGTH),
        "the chunked body declares no Content-Length"
    );
    let (status, _, body) = call(&app, req).await;
    assert_eq!(status, StatusCode::PAYLOAD_TOO_LARGE);
    assert_eq!(body["code"], json!("payload_too_large"));
    assert!(body["message"].as_str().is_some_and(|m| !m.is_empty()));
}

/// tower-http's `Limited` only surfaces the breach when the body is read, so
/// a body-less POST would otherwise accept an unlimited chunked stream.
#[tokio::test]
async fn chunked_oversized_body_is_rejected_even_when_the_handler_ignores_it() {
    let app = apply_hardening(
        Router::new().route("/api/nobody", post(|| async { "ok" })),
        HardeningConfig::from_env(),
    );
    let chunk = "x".repeat(BODY_LIMIT_BYTES / 2 + 1);
    let chunks = vec![
        Ok::<_, std::io::Error>(chunk.clone()),
        Ok::<_, std::io::Error>(chunk),
    ];
    let req = Request::post("/api/nobody")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::TRANSFER_ENCODING, "chunked")
        .body(Body::from_stream(futures_util::stream::iter(chunks)))
        .expect("request");
    let (status, _, body) = call(&app, req).await;
    assert_eq!(status, StatusCode::PAYLOAD_TOO_LARGE);
    assert_eq!(body["code"], json!("payload_too_large"));
}

#[tokio::test]
async fn chunked_body_at_the_limit_is_not_rejected() {
    let app = router(state());
    let exact = "x".repeat(BODY_LIMIT_BYTES);
    let req = Request::post("/api/genui/validate")
        .header(header::CONTENT_TYPE, "application/json")
        .header(header::TRANSFER_ENCODING, "chunked")
        .body(Body::from_stream(futures_util::stream::iter(vec![Ok::<
            _,
            std::io::Error,
        >(exact)])))
        .expect("request");
    let (status, _, _) = call(&app, req).await;
    assert_ne!(status, StatusCode::PAYLOAD_TOO_LARGE, "exactly 1 MB is allowed");
}
