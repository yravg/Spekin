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
use std::time::Duration;

use spekin_core::store::test_support;
use spekin_core::{
    AuditAction, AuditEvent, Ledger, LedgerCaps, ProjectState, Rejection, Revision, Store,
    StoreError, estimate,
};
use spekin_store_pg::PgStore;
use tokio::sync::{Barrier, Mutex};

/// Fixed UTC clock for audit entries, matching the store suite.
const NOW: u64 = 1_735_689_600;

/// A single round must resolve well under this; a longer run means a task is
/// stuck on the barrier or a database lock, and the test must fail, not hang.
const RACE_TIMEOUT: Duration = Duration::from_secs(20);

/// Serialise the two race tests against each other. `PgStore::seed` truncates
/// every table (it is the `--yes`-gated bootstrap), so two tests sharing one
/// database must not run at once or they wipe each other's seed mid-race. This
/// guard is per test binary; run the shared store suite and these races as
/// separate `cargo test --test …` commands against one database.
static DB_GUARD: Mutex<()> = Mutex::const_new(());

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

/// One side of the accept race. Every fallible step happens *before* the barrier
/// and its error is captured into `prep`, so the barrier is always awaited and the
/// two writes always overlap — one racer can never leave the other stuck on the
/// barrier because it failed or panicked first.
async fn accept_once(store: PgStore, barrier: Arc<Barrier>, id: String) -> Result<(), StoreError> {
    let prep: Result<(u32, Revision, ProjectState), StoreError> = async {
        let current = store
            .revision(&id, "spec")
            .await?
            .ok_or_else(|| StoreError::NotFound("revision spec".to_owned()))?;
        let base = current.n;
        let next = current.next("R-DASH-019: alert rule.".to_owned());
        let state = store
            .load_state(&id)
            .await?
            .ok_or_else(|| StoreError::NotFound("state".to_owned()))?;
        Ok((base, next, state))
    }
    .await;

    barrier.wait().await;

    let (base, next, mut state) = prep?;
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
    // IMP-40: the revision and its audit entry (in the state) commit atomically,
    // so a revision can never advance without its entry.
    store
        .update_revision_and_state(&id, "spec", base, &next, &state)
        .await
}

/// One side of the accept-vs-reject race. A reject only writes the state (a
/// rejection plus its audit entry); all fallible work happens before the barrier,
/// so the barrier is always awaited and the two writes always overlap.
async fn reject_once(store: PgStore, barrier: Arc<Barrier>, id: String) -> Result<(), StoreError> {
    let prep: Result<ProjectState, StoreError> = async {
        let mut state = store
            .load_state(&id)
            .await?
            .ok_or_else(|| StoreError::NotFound("state".to_owned()))?;
        state.rejections.push(Rejection {
            id: "P-1".to_owned(),
            base: 1,
            reason: "no".to_owned(),
        });
        let entry = state.audit.append(
            AuditEvent {
                actor: "sample-user".to_owned(),
                action: AuditAction::Reject,
                target_id: "P-1".to_owned(),
                revision: Some("r1".to_owned()),
                reason: "rejected".to_owned(),
            },
            NOW,
        );
        state.audit_head = entry.hash.clone();
        Ok(state)
    }
    .await;

    barrier.wait().await;

    let state = prep?;
    store.save_state(&id, &state).await?;
    Ok(())
}

/// One side of the reserve race. All fallible work (load, estimate, reserve,
/// audit append) is done before the barrier and its error captured into `prep`,
/// so the barrier is always awaited; the `save_state` is the serialised point and
/// must refuse a stale read, never accept a second reservation past the cap.
async fn reserve_once(
    store: PgStore,
    barrier: Arc<Barrier>,
    id: String,
    run_id: String,
) -> Result<(), StoreError> {
    let prep: Result<ProjectState, StoreError> = async {
        let mut state = store
            .load_state(&id)
            .await?
            .ok_or_else(|| StoreError::NotFound("state".to_owned()))?;
        // Deterministic inputs: a single 3000 cr reserve is always valid here.
        // A `LedgerError` cannot happen, but map it instead of panicking so the
        // barrier is never skipped.
        let est = estimate(1, 3000, 3000).map_err(|e| StoreError::Backend(e.to_string()))?;
        state
            .ledger
            .reserve(
                run_id.clone(),
                "user".to_owned(),
                format!("key-{run_id}"),
                &est,
            )
            .map_err(|e| StoreError::Backend(e.to_string()))?;
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
        Ok(state)
    }
    .await;

    barrier.wait().await;

    let state = prep?;
    store.save_state(&id, &state).await?;
    Ok(())
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn two_concurrent_accepts_only_one_wins() {
    let Some(store) = connect().await else { return };
    let _guard = DB_GUARD.lock().await;

    let id = "imp40-accept".to_owned();
    let (_, seed) = test_support::seed();
    store.seed(&id, &seed).await.expect("seed");

    for round in 0..50 {
        store.seed(&id, &seed).await.expect("reset for round");

        let barrier = Arc::new(Barrier::new(2));
        let h1 = tokio::spawn(accept_once(store.clone(), barrier.clone(), id.clone()));
        let h2 = tokio::spawn(accept_once(store.clone(), barrier.clone(), id.clone()));

        let (r1, r2) = tokio::time::timeout(RACE_TIMEOUT, async {
            let r1 = h1.await.expect("accept task 1 panicked");
            let r2 = h2.await.expect("accept task 2 panicked");
            (r1, r2)
        })
        .await
        .unwrap_or_else(|_| panic!("round {round}: accept race timed out after {RACE_TIMEOUT:?}"));

        let ok = [r1.is_ok(), r2.is_ok()].iter().filter(|b| **b).count();
        assert_eq!(
            ok, 1,
            "round {round}: exactly one accept should win, got {r1:?} {r2:?}"
        );
        let stale = [&r1, &r2].iter().any(|r| {
            matches!(
                r,
                Err(StoreError::StaleRevision {
                    base: 1,
                    current: 2
                })
            )
        });
        assert!(
            stale,
            "round {round}: the loser must be StaleRevision, got {r1:?} {r2:?}"
        );

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

/// IMP-40 item 2: an accept (revision + state) racing a reject (state only) on the
/// same project. Exactly one wins; the loser is refused with `StaleState`. The
/// invariant is that the revision advances *only* when its audit entry committed
/// with it — if the revision moved, the single audit entry is the accept; if not,
/// it is the reject.
#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn accept_vs_reject_never_advances_the_revision_without_its_audit_entry() {
    let Some(store) = connect().await else { return };
    let _guard = DB_GUARD.lock().await;

    let id = "imp40-accept-reject".to_owned();
    let (_, seed) = test_support::seed();
    store.seed(&id, &seed).await.expect("seed");

    for round in 0..50 {
        store.seed(&id, &seed).await.expect("reset for round");

        let barrier = Arc::new(Barrier::new(2));
        let h1 = tokio::spawn(accept_once(store.clone(), barrier.clone(), id.clone()));
        let h2 = tokio::spawn(reject_once(store.clone(), barrier.clone(), id.clone()));

        let (r1, r2) = tokio::time::timeout(RACE_TIMEOUT, async {
            let r1 = h1.await.expect("accept task panicked");
            let r2 = h2.await.expect("reject task panicked");
            (r1, r2)
        })
        .await
        .unwrap_or_else(|_| {
            panic!("round {round}: accept-vs-reject race timed out after {RACE_TIMEOUT:?}")
        });

        let ok = [r1.is_ok(), r2.is_ok()].iter().filter(|b| **b).count();
        assert_eq!(
            ok, 1,
            "round {round}: exactly one of accept/reject should win, got {r1:?} {r2:?}"
        );
        let stale = [&r1, &r2].iter().any(|r| {
            matches!(
                r,
                Err(StoreError::StaleState {
                    base: 1,
                    current: 2
                })
            )
        });
        assert!(
            stale,
            "round {round}: the loser must be StaleState, got {r1:?} {r2:?}"
        );

        let state = store.load_state(&id).await.expect("load").expect("state");
        assert_eq!(state.audit.len(), 1, "round {round}: one audit entry");
        spekin_core::verify_with_head(&state.audit, &state.audit_head)
            .expect("round {round}: audit verifies");
        let action = state.audit.entries()[0].action;
        let rev_n = store.revision(&id, "spec").await.unwrap().unwrap().n;
        match rev_n {
            2 => assert_eq!(
                action,
                AuditAction::Accept,
                "round {round}: the revision advanced, so the audit entry must be the accept"
            ),
            1 => assert_eq!(
                action,
                AuditAction::Reject,
                "round {round}: the revision did not advance, so the audit entry must be the reject"
            ),
            other => panic!("round {round}: unexpected revision {other}"),
        }
    }
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn two_concurrent_reserves_never_both_pass_the_cap() {
    let Some(store) = connect().await else { return };
    let _guard = DB_GUARD.lock().await;

    let id = "imp40-reserve".to_owned();
    let (_, mut seed) = test_support::seed();
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

        let (r1, r2) = tokio::time::timeout(RACE_TIMEOUT, async {
            let r1 = h1.await.expect("reserve task 1 panicked");
            let r2 = h2.await.expect("reserve task 2 panicked");
            (r1, r2)
        })
        .await
        .unwrap_or_else(|_| panic!("round {round}: reserve race timed out after {RACE_TIMEOUT:?}"));

        let ok = [r1.is_ok(), r2.is_ok()].iter().filter(|b| **b).count();
        assert_eq!(
            ok, 1,
            "round {round}: exactly one reserve should win, got {r1:?} {r2:?}"
        );
        let stale = [&r1, &r2].iter().any(|r| {
            matches!(
                r,
                Err(StoreError::StaleState {
                    base: 1,
                    current: 2
                })
            )
        });
        assert!(
            stale,
            "round {round}: the loser must be StaleState, got {r1:?} {r2:?}"
        );

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
