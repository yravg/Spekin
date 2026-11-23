//! IMP-40: `PgStore` under concurrency.
//!
//! The stage runs only when `TEST_DATABASE_URL` is set; otherwise it prints
//! "postgres stage skipped" and returns without claiming the stage passed.
//!
//! Two connections race the same revision (accept) and the same ledger (reserve)
//! through a barrier so they really overlap. Exactly one must win; the loser gets
//! a typed [`StoreError`] (`StaleRevision` / `StaleState`). After each race the
//! audit chain verifies and carries exactly one entry per successful action.

use std::sync::Arc;

use spekin_core::store::test_support;
use spekin_core::{
    estimate, AuditAction, AuditEvent, Ledger, LedgerCaps, Store, StoreError,
};
use spekin_store_pg::PgStore;
use tokio::sync::Barrier;

/// Fixed UTC clock for audit entries, matching the store suite.
const NOW: u64 = 1_735_689_600;

/// The caps for the reserve race: a single 3000 cr reserve is allowed, but two of
/// them together (6000 cr) exceed the 5000 cr monthly cap.
fn reserve_caps() -> LedgerCaps {
    LedgerCaps {
        per_run: 4000,
        project: 5000,
        person: 5000,
        concurrency: 2,
    }
}

async fn connect() -> Option<PgStore> {
    let Ok(url) = std::env::var("TEST_DATABASE_URL") else {
        println!("postgres stage skipped (TEST_DATABASE_URL is not set)");
        return None;
    };
    let store = PgStore::connect(&url)
        .await
        .expect("connect to TEST_DATABASE_URL");
    Some(store)
}

/// One side of the accept race: read the current revision, then write the next one
/// under a base check. The write is the serialised point; the audit append and
/// state save only happen after the revision write wins.
async fn accept_once(
    store: PgStore,
    barrier: Arc<Barrier>,
    id: String,
) -> Result<(), StoreError> {
    let current = store.revision(&id, "spec").await?.unwrap();
    let next = current.next("R-DASH-019: alert rule.".to_owned());
    let mut state = store.load_state(&id).await?.unwrap();

    barrier.wait().await;

    store.update_revision(&id, "spec", current.n, &next).await?;

    let entry = state.audit.append(
        AuditEvent {
            actor: "sample-user".to_owned(),
            action: AuditAction::Accept,
            target_id: "P-1".to_owned(),
            revision: Some(next.label()),
            reason: "accepted".to_owned(),
        },
        NOW,
    );
    state.audit_head = entry.hash.clone();
    store.save_state(&id, &state).await?;
    Ok(())
}

/// One side of the reserve race: read the state, reserve locally, then save. The
/// save is the serialised point; with a stale read it must be refused, never a
/// second successful reservation past the cap.
async fn reserve_once(
    store: PgStore,
    barrier: Arc<Barrier>,
    id: String,
    run_id: String,
) -> Result<(), StoreError> {
    let mut state = store.load_state(&id).await?.unwrap();
    let est = estimate(1, 3000, 3000).expect("valid estimate");
    state
        .ledger
        .reserve(run_id.clone(), "user".to_owned(), format!("key-{run_id}"), &est)
        .expect("a single reserve is under the cap");
    let entry = state.audit.append(
        AuditEvent {
            actor: "sample-user".to_owned(),
            action: AuditAction::Reserve,
            target_id: run_id,
            revision: None,
            reason: "reserved".to_owned(),
        },
        NOW,
    );
    state.audit_head = entry.hash.clone();

    barrier.wait().await;

    store.save_state(&id, &state).await?;
    Ok(())
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn two_concurrent_accepts_only_one_wins() {
    let Some(store) = connect().await else { return };
    let (id, seed) = test_support::seed();
    store.seed(&id, &seed).await.expect("seed");

    for round in 0..50 {
        store.seed(&id, &seed).await.expect("reset for round");

        let barrier = Arc::new(Barrier::new(2));
        let h1 = tokio::spawn(accept_once(store.clone(), barrier.clone(), id.clone()));
        let h2 = tokio::spawn(accept_once(store.clone(), barrier.clone(), id.clone()));
        let r1 = h1.await.expect("accept task 1");
        let r2 = h2.await.expect("accept task 2");

        let ok = [r1.is_ok(), r2.is_ok()].iter().filter(|b| **b).count();
        assert_eq!(ok, 1, "round {round}: exactly one accept should win, got {r1:?} {r2:?}");
        let stale = [&r1, &r2].iter().any(|r| {
            matches!(r, Err(StoreError::StaleRevision { base: 1, current: 2 }))
        });
        assert!(stale, "round {round}: the loser must be StaleRevision, got {r1:?} {r2:?}");

        let state = store.load_state(&id).await.expect("load").expect("state");
        assert_eq!(state.audit.len(), 1, "round {round}: one audit entry");
        spekin_core::verify_with_head(&state.audit, &state.audit_head)
            .expect("round {round}: audit verifies");
        assert_eq!(
            store.revision(&id, "spec").await.unwrap().unwrap().n,
            2,
            "round {round}: revision advanced once"
        );
    }
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn two_concurrent_reserves_never_both_pass_the_cap() {
    let Some(store) = connect().await else { return };
    let (id, mut seed) = test_support::seed();
    seed.state.ledger = Ledger::new(reserve_caps());
    store.seed(&id, &seed).await.expect("seed");

    for round in 0..50 {
        store.seed(&id, &seed).await.expect("reset for round");

        let barrier = Arc::new(Barrier::new(2));
        let h1 = tokio::spawn(reserve_once(
            store.clone(),
            barrier.clone(),
            id.clone(),
            format!("run-{round}-a"),
        ));
        let h2 = tokio::spawn(reserve_once(
            store.clone(),
            barrier.clone(),
            id.clone(),
            format!("run-{round}-b"),
        ));
        let r1 = h1.await.expect("reserve task 1");
        let r2 = h2.await.expect("reserve task 2");

        let ok = [r1.is_ok(), r2.is_ok()].iter().filter(|b| **b).count();
        assert_eq!(ok, 1, "round {round}: exactly one reserve should win, got {r1:?} {r2:?}");

        let state = store.load_state(&id).await.expect("load").expect("state");
        assert_eq!(state.audit.len(), 1, "round {round}: one audit entry");
        spekin_core::verify_with_head(&state.audit, &state.audit_head)
            .expect("round {round}: audit verifies");
        assert_eq!(
            state.ledger.active_count(),
            1,
            "round {round}: one active reservation, not two"
        );
    }
}
