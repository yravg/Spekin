//! IMP-38: run the shared store suite against `PgStore`.
//!
//! The stage runs only when `TEST_DATABASE_URL` is set; otherwise it prints
//! "postgres stage skipped" and returns without claiming the stage passed.

use spekin_core::store::test_support;
use spekin_store_pg::PgStore;

#[tokio::test]
async fn pg_store_passes_the_shared_suite() {
    let Ok(url) = std::env::var("TEST_DATABASE_URL") else {
        println!("postgres stage skipped (TEST_DATABASE_URL is not set)");
        return;
    };

    let store = PgStore::connect(&url)
        .await
        .expect("connect to TEST_DATABASE_URL");
    store.truncate().await.expect("truncate the test database");

    let (project_id, seed) = test_support::seed();
    store
        .seed(&project_id, &seed)
        .await
        .expect("seed the test database");

    test_support::run_suite(&store).await;
}
