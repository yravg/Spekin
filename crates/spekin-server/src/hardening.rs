//! IMP-32: server hardening as Axum / tower-http layers.
//!
//! Every rule here is a layer with its own test in
//! `crates/spekin-server/tests/hardening.rs`. The layers add no business rules:
//! they only bound requests, pin CORS to one web origin, add response headers
//! and keep error text free of request data (ADR 0002).

use std::net::Ipv6Addr;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use axum::{
    Json, Router,
    extract::{Request, State},
    http::{HeaderMap, HeaderValue, Method, StatusCode, header},
    middleware::{self, Next},
    response::{IntoResponse, Response},
};
use spekin_core::ApiErrorBody;
use tower_http::{
    cors::{AllowOrigin, CorsLayer},
    limit::RequestBodyLimitLayer,
};

/// 1 MB request body ceiling.
pub const BODY_LIMIT_BYTES: usize = 1024 * 1024;
/// A request that is still running after this long gets a typed 504.
pub const REQUEST_TIMEOUT: Duration = Duration::from_secs(15);
/// The GitHub adapter has its own, independent client timeout.
pub const GITHUB_TIMEOUT: Duration = Duration::from_secs(20);
/// The only web origin CORS is allowed to reflect.
pub const DEFAULT_WEB_ORIGIN: &str = "http://127.0.0.1:5173";
/// The API binds to loopback unless `SPEKIN_BIND` says otherwise.
pub const DEFAULT_BIND: &str = "127.0.0.1:8787";

/// A tiny in-memory log used by the hardening layers. Nothing that came from a
/// request (body, header, token, file path) is ever recorded here: only fixed
/// reason strings, so a test can prove a fake token is not echoed.
#[derive(Clone, Default)]
pub struct Log {
    lines: Arc<Mutex<Vec<String>>>,
}

impl Log {
    pub fn record(&self, line: impl Into<String>) {
        self.lines.lock().expect("log lock").push(line.into());
    }

    pub fn lines(&self) -> Vec<String> {
        self.lines.lock().expect("log lock").clone()
    }
}

/// Values behind [`apply_hardening`]. Tests can narrow the timeout or change
/// the web origin without touching process environment.
#[derive(Clone)]
pub struct HardeningConfig {
    pub body_limit: usize,
    pub timeout: Duration,
    pub web_origin: String,
    pub log: Log,
}

impl Default for HardeningConfig {
    fn default() -> Self {
        Self {
            body_limit: BODY_LIMIT_BYTES,
            timeout: REQUEST_TIMEOUT,
            web_origin: DEFAULT_WEB_ORIGIN.to_owned(),
            log: Log::default(),
        }
    }
}

impl HardeningConfig {
    pub fn from_env() -> Self {
        Self {
            web_origin: std::env::var("SPEKIN_WEB_ORIGIN")
                .unwrap_or_else(|_| DEFAULT_WEB_ORIGIN.to_owned()),
            ..Self::default()
        }
    }

    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.timeout = timeout;
        self
    }

    pub fn with_web_origin(mut self, origin: impl Into<String>) -> Self {
        self.web_origin = origin.into();
        self
    }
}

/// The socket address the server binds to. Only `SPEKIN_BIND` changes it;
/// the default is always the loopback interface.
pub fn bind_addr() -> String {
    std::env::var("SPEKIN_BIND").unwrap_or_else(|_| DEFAULT_BIND.to_owned())
}

/// Whether an address stays on the local machine. Used for the startup warning
/// when an operator deliberately binds to a wider interface.
pub fn is_loopback(addr: &str) -> bool {
    let host = addr
        .rsplit_once(':')
        .map_or(addr, |(host, _)| host)
        .trim_matches(['[', ']']);
    host == "localhost"
        || host == "127.0.0.1"
        || host.parse::<Ipv6Addr>().is_ok_and(|ip| ip.is_loopback())
}

/// A typed error that never includes request data.
fn typed_error(status: StatusCode, code: &'static str, message: &'static str) -> Response {
    (
        status,
        Json(ApiErrorBody {
            code: code.to_owned(),
            message: message.to_owned(),
        }),
    )
        .into_response()
}

/// Rewrite tower-http's plain-text 413 into the API's typed error body.
async fn typed_body_limit_error(res: Response) -> Response {
    if res.status() == StatusCode::PAYLOAD_TOO_LARGE {
        return typed_error(
            StatusCode::PAYLOAD_TOO_LARGE,
            "payload_too_large",
            "request body exceeds the 1 MB limit",
        );
    }
    res
}

/// POST routes that carry a body accept `application/json` only. A body-less
/// POST (accept, delete, restore) is allowed through: clients send it with an
/// `Accept` header and no body. The check is about media type, not about echoing
/// anything from the request.
async fn json_only(State(cfg): State<HardeningConfig>, req: Request, next: Next) -> Response {
    if req.method() == Method::POST {
        let content_type = req
            .headers()
            .get(header::CONTENT_TYPE)
            .and_then(|value| value.to_str().ok());
        let has_body = req.headers().contains_key(header::CONTENT_LENGTH)
            || req.headers().contains_key(header::TRANSFER_ENCODING);
        let is_json = content_type.is_some_and(|value| {
            value
                .split(';')
                .next()
                .is_some_and(|mime| mime.trim().eq_ignore_ascii_case("application/json"))
        });
        if (has_body || content_type.is_some()) && !is_json {
            cfg.log
                .record("request rejected: unsupported media type on POST");
            return typed_error(
                StatusCode::UNSUPPORTED_MEDIA_TYPE,
                "unsupported_media_type",
                "POST requests must use application/json",
            );
        }
    }
    next.run(req).await
}

/// A request that runs too long gets a typed 504, and the handler future is
/// dropped with it.
async fn request_timeout(State(cfg): State<HardeningConfig>, req: Request, next: Next) -> Response {
    match tokio::time::timeout(cfg.timeout, next.run(req)).await {
        Ok(res) => res,
        Err(_) => {
            cfg.log.record("request rejected: timeout");
            typed_error(
                StatusCode::GATEWAY_TIMEOUT,
                "request_timeout",
                "request timed out",
            )
        }
    }
}

/// Security headers on every response. `no-store` is scoped to `/api`, where
/// living-spec and audit data are served.
async fn security_headers(req: Request, next: Next) -> Response {
    let is_api = req.uri().path().starts_with("/api");
    let mut res = next.run(req).await;
    let headers: &mut HeaderMap = res.headers_mut();
    headers.insert(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    );
    headers.insert(
        header::REFERRER_POLICY,
        HeaderValue::from_static("no-referrer"),
    );
    if is_api {
        headers.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    }
    res
}

/// Apply every hardening layer to a router. Added in inner-to-outer order:
/// the body limit sees the routes first, and security headers wrap everything,
/// including rejections generated by the other layers.
pub fn apply_hardening(app: Router, cfg: HardeningConfig) -> Router {
    let origin = cfg
        .web_origin
        .parse::<HeaderValue>()
        .unwrap_or_else(|_| HeaderValue::from_static(DEFAULT_WEB_ORIGIN));
    let cors = CorsLayer::new()
        // `list` checks the request's Origin instead of echoing the configured
        // value to everyone, so a different origin gets no CORS permission.
        // It also refuses `*`, which this server must never send.
        .allow_origin(AllowOrigin::list([origin]))
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([header::CONTENT_TYPE, header::ACCEPT, header::AUTHORIZATION]);

    app.layer(RequestBodyLimitLayer::new(cfg.body_limit))
        .layer(middleware::map_response(typed_body_limit_error))
        .layer(middleware::from_fn_with_state(cfg.clone(), json_only))
        .layer(middleware::from_fn_with_state(cfg, request_timeout))
        .layer(cors)
        .layer(middleware::from_fn(security_headers))
}
