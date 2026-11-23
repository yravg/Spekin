//! Shared helpers for the server route tests (IMP-42).
//!
//! The route tests run against [`Backend::Memory`] always, and against
//! [`Backend::Pg`] only when `TEST_DATABASE_URL` is set — seeded from the same
//! fixture `seed-sample` uses. Without the variable the Postgres stage prints
//! "postgres stage skipped" and never claims it passed.
//!
//! The Postgres half is serialised by [`PG_GUARD`]: `PgStore::seed` truncates
//! every table, so two tests sharing one database must not run at once (the
//! IMP-40 lesson). The memory half runs concurrently with other tests — each
//! `MemoryStore` is independent.

use axum::Router;
use spekin_server::seed::seed_from_fixture;
use spekin_server::{AppState, Backend, DEFAULT_NOW, router};
use spekin_store_pg::PgStore;
use tokio::sync::Mutex;

pub const SAMPLE: &str = include_str!("../../../../fixtures/meranti-yard.json");

/// Serialise the Postgres half of the route tests within this binary.
static PG_GUARD: Mutex<()> = Mutex::const_new(());

/// The in-memory app, seeded from the same fixture `seed-sample` uses.
fn memory_app_at(now: i64) -> Router {
    router(
        AppState::from_fixture_json(SAMPLE)
            .expect("sample fixture is valid")
            .with_now(now),
    )
}

/// The Postgres app, truncated and seeded from the same fixture `seed-sample`
/// uses. The caller must hold [`PG_GUARD`] (via [`run_on_both`]).
async fn pg_app_at(now: i64) -> Router {
    let url = std::env::var("TEST_DATABASE_URL").expect("TEST_DATABASE_URL is set");
    let store = PgStore::connect(&url)
        .await
        .expect("connect to TEST_DATABASE_URL");
    store.truncate().await.expect("truncate the test database");
    let (project_id, seed) =
        seed_from_fixture(SAMPLE, DEFAULT_NOW).expect("sample fixture is valid");
    store
        .seed(&project_id, &seed)
        .await
        .expect("seed the test database");
    router(AppState::with_store(Backend::Pg(store)).with_now(now))
}

/// Run one route test's assertions against memory (always) and Postgres (only
/// when `TEST_DATABASE_URL` is set). The clock defaults to [`DEFAULT_NOW`].
pub async fn run_on_both<F, Fut>(run: F)
where
    F: Fn(Router) -> Fut,
    Fut: std::future::Future<Output = ()>,
{
    run_on_both_at(DEFAULT_NOW, run).await;
}

/// [`run_on_both`] with a custom clock, for the restore-window test.
pub async fn run_on_both_at<F, Fut>(now: i64, run: F)
where
    F: Fn(Router) -> Fut,
    Fut: std::future::Future<Output = ()>,
{
    run(memory_app_at(now)).await;

    if std::env::var("TEST_DATABASE_URL").is_ok() {
        let _guard = PG_GUARD.lock().await;
        run(pg_app_at(now).await).await;
    } else {
        println!("postgres stage skipped (TEST_DATABASE_URL is not set)");
    }
}
