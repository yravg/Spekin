use spekin_server::{AppState, router};

#[tokio::main]
async fn main() {
    let path =
        std::env::var("SPEKIN_FIXTURE").unwrap_or_else(|_| "fixtures/meranti-yard.json".into());
    let text = std::fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("cannot read fixture {path}: {e}"));
    let state = AppState::from_fixture_json(&text).expect("fixture is valid");
    let addr = std::env::var("SPEKIN_ADDR").unwrap_or_else(|_| "127.0.0.1:8787".into());
    let listener = tokio::net::TcpListener::bind(&addr).await.expect("bind");
    println!("spekin-server listening on http://{addr}");
    axum::serve(listener, router(state)).await.expect("server");
}
