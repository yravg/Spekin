//! IMP-38: the shared store suite, run against `MemoryStore` (always).
//! `spekin-store-pg` runs the same suite against `PgStore` when `TEST_DATABASE_URL` is set.

use spekin_core::MemoryStore;
use spekin_core::store::test_support;

#[tokio::test]
async fn memory_store_passes_the_shared_suite() {
    let (project_id, seed) = test_support::seed();
    let store = MemoryStore::from_seed(project_id, seed);
    test_support::run_suite(&store).await;
}
