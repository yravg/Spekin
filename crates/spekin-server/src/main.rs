use spekin_core::MemoryStore;
use spekin_server::hardening::{bind_addr, is_loopback};
use spekin_server::seed::seed_from_fixture;
use spekin_server::{AppState, Backend, DEFAULT_NOW, router};
use spekin_store_pg::PgStore;

fn fixture_path() -> String {
    std::env::var("SPEKIN_FIXTURE").unwrap_or_else(|_| "fixtures/meranti-yard.json".into())
}

fn read_fixture() -> String {
    let path = fixture_path();
    std::fs::read_to_string(&path).unwrap_or_else(|e| panic!("cannot read fixture {path}: {e}"))
}

/// `cargo run -p spekin-server -- seed-sample [--yes]`: seed Meranti Yard into the
/// Postgres store. Refuses to overwrite unless `--yes` is given (ADR 0008).
async fn seed_sample(args: &[String]) {
    let url = std::env::var("DATABASE_URL")
        .expect("seed-sample needs DATABASE_URL to know where to write");
    if !args.iter().any(|a| a == "--yes") {
        eprintln!("seed-sample overwrites every table in {url}.");
        eprintln!("Re-run with --yes to confirm.");
        std::process::exit(2);
    }
    let text = read_fixture();
    let (project_id, seed) = seed_from_fixture(&text, DEFAULT_NOW).expect("fixture is valid");
    let store = PgStore::connect(&url)
        .await
        .unwrap_or_else(|e| panic!("cannot connect to {url}: {e}"));
    store
        .seed(&project_id, &seed)
        .await
        .unwrap_or_else(|e| panic!("cannot seed {url}: {e}"));
    println!("seeded Meranti Yard into {url}");
}

#[tokio::main]
async fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.iter().skip(1).any(|a| a == "seed-sample") {
        seed_sample(&args).await;
        return;
    }

    // Pick the store: Postgres when DATABASE_URL is set, otherwise the in-memory
    // sample (ADR 0008).
    let store = match std::env::var("DATABASE_URL") {
        Ok(url) => Backend::Pg(
            PgStore::connect(&url)
                .await
                .expect("connect to DATABASE_URL"),
        ),
        Err(_) => {
            let text = read_fixture();
            let (project_id, seed) =
                seed_from_fixture(&text, DEFAULT_NOW).expect("fixture is valid");
            Backend::Memory(MemoryStore::from_seed(project_id, seed))
        }
    };

    let state = AppState::with_store(store);
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
