use spekin_server::hardening::{bind_addr, is_loopback};
use spekin_server::{AppState, router};

#[tokio::main]
async fn main() {
    let path =
        std::env::var("SPEKIN_FIXTURE").unwrap_or_else(|_| "fixtures/meranti-yard.json".into());
    let text = std::fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("cannot read fixture {path}: {e}"));
    let state = AppState::from_fixture_json(&text).expect("fixture is valid");
    let addr = bind_addr();
    if !is_loopback(&addr) {
        eprintln!(
            "warning: SPEKIN_BIND={addr} is not loopback; the API is reachable from other hosts"
        );
    }
    let listener = tokio::net::TcpListener::bind(&addr).await.expect("bind");
    println!("spekin-server listening on http://{addr}");
    axum::serve(listener, router(state)).await.expect("server");
}
