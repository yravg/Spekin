//! IMP-09: ledger (estimate -> reserve -> settle/refund, caps, warnings at 70%/90%).
//! Pure core rules following S36 (`sample/parts/models.mjs`), SPK-T-06, AC-SPK-8/9.

use std::sync::{Arc, Barrier, Mutex};
use std::thread;

use proptest::prelude::*;
use spekin_core::{
    Ledger, LedgerCaps, LedgerEntryKind, LedgerError, ReservationStatus, UsageSeverity, estimate,
    severity_for,
};

fn s36_caps() -> LedgerCaps {
    LedgerCaps {
        per_run: 60,
        project: 5000,
        person: 5000,
        concurrency: 2,
    }
}

#[test]
fn s36_run_0426_estimate_reserve_settle_and_refund_matches_board() {
    // S36 MODELS_RUN / MODELS_LEDGER run 0426: estimate 18..30, reserve 36, settle 24, refund 12.
    let mut ledger = Ledger::with_starting_usage(s36_caps(), 1216, 30);
    let est = estimate(18, 30, 36).expect("valid S36 estimate");

    let res = ledger
        .reserve("0426", "rina", "k-7f3c91", &est)
        .expect("reserve fits all caps");
    assert_eq!(res.reserved, 36);
    assert_eq!(res.status, ReservationStatus::Active);
    assert_eq!(ledger.project_usage().reserved, 36);
    assert_eq!(ledger.project_usage().left, 5000 - (1216 + 36 + 30));

    // Job may start only with an active reservation.
    let auth = ledger
        .authorize_start("0426")
        .expect("active reservation allows start");
    assert_eq!(auth.run_id, "0426");

    let settled = ledger.settle("0426", 24).expect("settle succeeds");
    assert_eq!(settled.reserved, 36);
    assert_eq!(settled.charged, 24);
    assert_eq!(settled.refunded, 12);
    assert_eq!(settled.charged + settled.refunded, settled.reserved);
    assert!(!settled.cancelled);

    let usage = ledger.project_usage();
    assert_eq!(usage.used, 1240);
    assert_eq!(usage.reserved, 0);
    assert_eq!(usage.pending, 30);
    assert_eq!(usage.committed, 1270);
    assert_eq!(usage.left, 3730);
    assert_eq!(usage.severity, UsageSeverity::Calm);

    let kinds: Vec<LedgerEntryKind> = ledger.entries().iter().map(|e| e.kind).collect();
    assert_eq!(
        kinds,
        vec![
            LedgerEntryKind::Reserve,
            LedgerEntryKind::Settle,
            LedgerEntryKind::Refund
        ]
    );
}

#[test]
fn s36_severity_thresholds_match_calm_warn_70_and_crit_90() {
    // S36 MODELS_USAGE: calm 1294/5000, near 3880/5000 (77.6%), capped 5000/5000 (100%).
    assert_eq!(severity_for(1294, 5000), UsageSeverity::Calm);
    assert_eq!(severity_for(3499, 5000), UsageSeverity::Calm);
    assert_eq!(severity_for(3500, 5000), UsageSeverity::Warn);
    assert_eq!(severity_for(3880, 5000), UsageSeverity::Warn);
    assert_eq!(severity_for(4499, 5000), UsageSeverity::Warn);
    assert_eq!(severity_for(4500, 5000), UsageSeverity::Crit);
    assert_eq!(severity_for(5000, 5000), UsageSeverity::Crit);
    assert_eq!(severity_for(0, 0), UsageSeverity::Crit);
}

#[test]
fn job_cannot_start_or_settle_without_a_reservation() {
    let mut ledger = Ledger::new(s36_caps());

    assert_eq!(
        ledger.authorize_start("missing"),
        Err(LedgerError::NoReservation {
            run_id: "missing".into()
        })
    );
    assert_eq!(
        ledger.settle("missing", 10),
        Err(LedgerError::NoReservation {
            run_id: "missing".into()
        })
    );
    assert_eq!(
        ledger.cancel("missing"),
        Err(LedgerError::NoReservation {
            run_id: "missing".into()
        })
    );
    assert_eq!(ledger.project_usage().used, 0);
    assert!(ledger.entries().is_empty());
}

#[test]
fn over_cap_reservations_are_refused_for_per_run_project_person_and_concurrency() {
    // Per-run cap exceeded.
    let mut ledger = Ledger::new(s36_caps());
    let too_big = estimate(40, 60, 61).unwrap();
    assert_eq!(
        ledger.reserve("r-big", "rina", "k-big", &too_big),
        Err(LedgerError::PerRunCapExceeded {
            requested: 61,
            per_run_cap: 60
        })
    );

    // Person cap exceeded even when project cap has room.
    let mut person_limited = Ledger::new(LedgerCaps {
        per_run: 60,
        project: 5000,
        person: 50,
        concurrency: 2,
    });
    let est40 = estimate(20, 30, 40).unwrap();
    person_limited
        .reserve("r-1", "rina", "k-1", &est40)
        .unwrap();
    let est20 = estimate(10, 15, 20).unwrap();
    assert_eq!(
        person_limited.reserve("r-2", "rina", "k-2", &est20),
        Err(LedgerError::PersonCapExceeded {
            person_id: "rina".into(),
            requested: 20,
            left: 10,
            cap: 50
        })
    );
    // Another person can still reserve under the same project cap.
    person_limited
        .reserve("r-3", "budi", "k-3", &est20)
        .unwrap();
    // Concurrency cap (2) now blocks a third concurrent run.
    assert_eq!(
        person_limited.reserve("r-4", "siti", "k-4", &est20),
        Err(LedgerError::ConcurrencyCapExceeded {
            active: 2,
            limit: 2
        })
    );

    // Project cap reached (S36 capped state: 4946 used + 24 reserved + 30 pending = 5000).
    let mut capped = Ledger::with_starting_usage(s36_caps(), 4946, 30);
    let est24 = estimate(12, 20, 24).unwrap();
    capped.reserve("0428", "rina", "k-0428", &est24).unwrap();
    assert_eq!(capped.project_usage().left, 0);
    assert_eq!(capped.project_usage().severity, UsageSeverity::Crit);
    let est1 = estimate(1, 1, 1).unwrap();
    assert_eq!(
        capped.reserve("0429", "budi", "k-0429", &est1),
        Err(LedgerError::ProjectCapExceeded {
            requested: 1,
            left: 0,
            cap: 5000
        })
    );
}

#[test]
fn cancel_releases_the_reservation_fully_or_with_partial_usage() {
    // Full cancel before usage releases 100% of the reservation.
    let mut ledger = Ledger::new(s36_caps());
    let est = estimate(18, 30, 36).unwrap();
    ledger
        .reserve("r-cancel", "rina", "k-cancel", &est)
        .unwrap();
    assert_eq!(ledger.project_usage().reserved, 36);

    let full = ledger.cancel("r-cancel").unwrap();
    assert_eq!(full.charged, 0);
    assert_eq!(full.refunded, 36);
    assert!(full.cancelled);
    assert_eq!(ledger.project_usage().used, 0);
    assert_eq!(ledger.project_usage().reserved, 0);
    assert_eq!(ledger.active_count(), 0);

    // S36 run 0424: cancelled after partial usage (reserved 36, consumed 6, released 30).
    ledger.reserve("0424", "rina", "k-2b90de", &est).unwrap();
    let partial = ledger.cancel_with_usage("0424", 6).unwrap();
    assert_eq!(partial.reserved, 36);
    assert_eq!(partial.charged, 6);
    assert_eq!(partial.refunded, 30);
    assert!(partial.cancelled);
    assert_eq!(ledger.project_usage().used, 6);
    assert_eq!(ledger.project_usage().reserved, 0);
}

#[test]
fn retry_never_double_reserves_or_double_settles() {
    let mut ledger = Ledger::new(s36_caps());
    let est = estimate(18, 30, 36).unwrap();

    let first_res = ledger.reserve("0426", "rina", "k-7f3c91", &est).unwrap();
    let retry_res = ledger.reserve("0426", "rina", "k-7f3c91", &est).unwrap();
    assert_eq!(first_res, retry_res);
    assert_eq!(ledger.project_usage().reserved, 36);
    assert_eq!(ledger.active_count(), 1);

    let first_settle = ledger.settle("0426", 24).unwrap();
    let retry_settle = ledger.settle("0426", 24).unwrap();
    assert_eq!(first_settle, retry_settle);
    assert_eq!(ledger.project_usage().used, 24);
    assert_eq!(ledger.project_usage().reserved, 0);
    assert_eq!(ledger.entries().len(), 3); // reserve, settle, refund — never duplicated

    // Settling again with a different amount is refused rather than double-settling.
    assert!(matches!(
        ledger.settle("0426", 25),
        Err(LedgerError::AlreadySettled { .. })
    ));
}

#[test]
fn concurrent_reservations_in_a_race_never_exceed_the_cap() {
    let caps = LedgerCaps {
        per_run: 60,
        project: 100,
        person: 100,
        concurrency: 4,
    };
    let ledger = Arc::new(Mutex::new(Ledger::new(caps.clone())));
    let barrier = Arc::new(Barrier::new(8));
    let mut handles = Vec::new();

    for i in 0..8 {
        let ledger = Arc::clone(&ledger);
        let barrier = Arc::clone(&barrier);
        handles.push(thread::spawn(move || {
            let est = estimate(20, 30, 35).unwrap();
            barrier.wait();
            let mut guard = ledger.lock().unwrap();
            guard.reserve(
                format!("run-{i}"),
                format!("user-{i}"),
                format!("key-{i}"),
                &est,
            )
        }));
    }

    let mut succeeded = 0u32;
    for h in handles {
        if h.join().unwrap().is_ok() {
            succeeded += 1;
        }
    }

    // 100 / 35 = 2 runs max; the remaining 6 must be refused.
    assert_eq!(succeeded, 2);
    let guard = ledger.lock().unwrap();
    assert!(guard.project_usage().committed <= caps.project);
    assert_eq!(guard.project_usage().reserved, 70);
    assert_eq!(guard.active_count(), 2);
}

#[derive(Debug, Clone)]
enum Op {
    Reserve { person: u8, reserve: u32 },
    Settle { slot: usize, pct: u8 },
    Cancel { slot: usize, pct: u8 },
}

fn op_strategy() -> impl Strategy<Value = Op> {
    prop_oneof![
        (0u8..4, 1u32..80).prop_map(|(person, reserve)| Op::Reserve { person, reserve }),
        (0usize..12, 0u8..=100).prop_map(|(slot, pct)| Op::Settle { slot, pct }),
        (0usize..12, 0u8..=100).prop_map(|(slot, pct)| Op::Cancel { slot, pct }),
    ]
}

proptest! {
    // Property 1: a reserve never exceeds the project, person, per-run or concurrency cap.
    #[test]
    fn a_reserve_never_exceeds_the_cap(
        per_run in 10u32..100,
        project in 50u32..500,
        person in 30u32..300,
        concurrency in 1u32..6,
        ops in prop::collection::vec(op_strategy(), 1..40),
    ) {
        let caps = LedgerCaps { per_run, project, person, concurrency };
        let mut ledger = Ledger::new(caps.clone());
        let mut active_runs: Vec<(String, u32)> = Vec::new();
        let mut seq = 0u32;

        for op in ops {
            match op {
                Op::Reserve { person: p, reserve } => {
                    seq += 1;
                    let run_id = format!("r-{seq}");
                    let person_id = format!("u-{p}");
                    let key = format!("k-{seq}");
                    let est = estimate(0, reserve, reserve).unwrap();
                    if let Ok(res) = ledger.reserve(&run_id, &person_id, &key, &est) {
                        prop_assert!(res.reserved <= caps.per_run);
                        active_runs.push((run_id, res.reserved));
                    }
                }
                Op::Settle { slot, pct } => {
                    if !active_runs.is_empty() {
                        let idx = slot % active_runs.len();
                        let (run_id, reserved) = active_runs.remove(idx);
                        let actual = ((u64::from(reserved) * u64::from(pct)) / 100) as u32;
                        let s = ledger.settle(&run_id, actual).unwrap();
                        prop_assert_eq!(s.charged + s.refunded, s.reserved);
                    }
                }
                Op::Cancel { slot, pct } => {
                    if !active_runs.is_empty() {
                        let idx = slot % active_runs.len();
                        let (run_id, reserved) = active_runs.remove(idx);
                        let actual = ((u64::from(reserved) * u64::from(pct)) / 100) as u32;
                        let s = ledger.cancel_with_usage(&run_id, actual).unwrap();
                        prop_assert_eq!(s.charged + s.refunded, s.reserved);
                    }
                }
            }

            prop_assert!(ledger.project_usage().committed <= caps.project);
            prop_assert!(ledger.active_count() <= caps.concurrency);
            for p in 0u8..4 {
                let pid = format!("u-{p}");
                prop_assert!(ledger.person_usage(&pid).committed <= caps.person);
            }
        }
    }

    // Property 2: settle + refund always equals the reserve.
    #[test]
    fn settle_plus_refund_equals_the_reserve(reserve in 1u32..=60, pct in 0u8..=100) {
        let mut ledger = Ledger::new(s36_caps());
        let est = estimate(0, reserve, reserve).unwrap();
        ledger.reserve("r-1", "rina", "k-1", &est).unwrap();
        let actual = ((u64::from(reserve) * u64::from(pct)) / 100) as u32;

        let settled = ledger.settle("r-1", actual).unwrap();
        prop_assert_eq!(settled.charged + settled.refunded, reserve);
        prop_assert_eq!(ledger.project_usage().used, actual);
        prop_assert_eq!(ledger.project_usage().reserved, 0);
    }

    // Property 3: no charge without a reserve.
    #[test]
    fn no_charge_without_a_reserve(run_id in "[a-z0-9-]{1,12}", actual in 0u32..500) {
        let mut ledger = Ledger::new(s36_caps());
        prop_assert_eq!(
            ledger.authorize_start(&run_id),
            Err(LedgerError::NoReservation { run_id: run_id.clone() })
        );
        prop_assert_eq!(
            ledger.settle(&run_id, actual),
            Err(LedgerError::NoReservation { run_id: run_id.clone() })
        );
        prop_assert_eq!(ledger.project_usage().used, 0);
        prop_assert!(ledger.entries().is_empty());
    }

    // Property 4: idempotent settle (retrying settle never double-settles).
    #[test]
    fn idempotent_settle(reserve in 1u32..=60, pct in 0u8..=100, retries in 2usize..8) {
        let mut ledger = Ledger::new(s36_caps());
        let est = estimate(0, reserve, reserve).unwrap();
        ledger.reserve("r-1", "rina", "k-1", &est).unwrap();
        let actual = ((u64::from(reserve) * u64::from(pct)) / 100) as u32;

        let first = ledger.settle("r-1", actual).unwrap();
        let entries_after_first = ledger.entries().len();
        let used_after_first = ledger.project_usage().used;

        for _ in 1..retries {
            let again = ledger.settle("r-1", actual).unwrap();
            prop_assert_eq!(&again, &first);
            prop_assert_eq!(ledger.entries().len(), entries_after_first);
            prop_assert_eq!(ledger.project_usage().used, used_after_first);
        }
    }
}
