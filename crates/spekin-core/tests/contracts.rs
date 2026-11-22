//! IMP-33: build contracts and evidence core (S37, R-EVD-1, R-EVD-4, AC-SPK-22).
//!
//! A check with no evidence is `not_run`, never passed. Evidence older than the
//! contract's last change is `stale`. The release gate passes only when every
//! required contract is `met`.

use proptest::prelude::*;
use spekin_core::contracts::{
    Check, CheckKind, Contract, ContractStatus, Evidence, EvidenceError, EvidenceResult,
    GateResult, MAX_LOG_BYTES, MatrixRow, OwnerLane, gate, matrix, sample_contracts,
    sample_evidence, sample_matrix, status,
};

fn check(name: &str, kind: CheckKind) -> Check {
    Check {
        name: name.to_owned(),
        kind,
        owner: OwnerLane::Core,
    }
}

fn contract(id: &str, changed_at: i64, checks: Vec<Check>) -> Contract {
    Contract {
        id: id.to_owned(),
        title: format!("{id}: requirement"),
        changed_at,
        checks,
    }
}

fn evidence(check: &str, commit: &str, at: i64, result: EvidenceResult) -> Evidence {
    Evidence::new(check, commit, at, result, 12, "excerpt").expect("evidence inside the 4 KB limit")
}

// --- status(contract, evidence) ---

#[test]
fn a_check_with_no_evidence_is_not_run_never_met() {
    let c = contract("R-EDT-3", 1000, vec![check("accept_creates_one_revision", CheckKind::Unit)]);
    assert_eq!(status(&c, &[]), ContractStatus::NotRun);
    let rows = matrix(std::slice::from_ref(&c), &[]);
    assert_eq!(
        rows,
        vec![MatrixRow {
            contract: "R-EDT-3".into(),
            check: "accept_creates_one_revision".into(),
            status: ContractStatus::NotRun,
        }]
    );
}

#[test]
fn fresh_passing_evidence_makes_a_contract_met() {
    let c = contract("R-EDT-3", 1000, vec![check("accept_creates_one_revision", CheckKind::Unit)]);
    let ev = vec![evidence("accept_creates_one_revision", "abc1234", 1000, EvidenceResult::Passed)];
    assert_eq!(status(&c, &ev), ContractStatus::Met);
}

#[test]
fn failed_evidence_makes_a_contract_failing() {
    let c = contract("R-EDT-3", 1000, vec![check("accept_creates_one_revision", CheckKind::Unit)]);
    let ev = vec![evidence("accept_creates_one_revision", "abc1234", 1200, EvidenceResult::Failed)];
    assert_eq!(status(&c, &ev), ContractStatus::Failing);
}

#[test]
fn skipped_evidence_is_not_run_never_passed() {
    let c = contract("R-EDT-3", 1000, vec![check("accept_creates_one_revision", CheckKind::Unit)]);
    let ev = vec![evidence("accept_creates_one_revision", "abc1234", 1200, EvidenceResult::Skipped)];
    assert_eq!(status(&c, &ev), ContractStatus::NotRun);
}

#[test]
fn evidence_older_than_the_contract_change_is_stale() {
    let c = contract("R-EDT-3", 1000, vec![check("accept_creates_one_revision", CheckKind::Unit)]);
    let ev = vec![evidence("accept_creates_one_revision", "old1234", 999, EvidenceResult::Passed)];
    assert_eq!(status(&c, &ev), ContractStatus::Stale);
}

#[test]
fn the_latest_evidence_for_a_check_wins_regardless_of_input_order() {
    let c = contract("R-EDT-3", 1000, vec![check("accept_creates_one_revision", CheckKind::Unit)]);
    let old = evidence("accept_creates_one_revision", "old1234", 999, EvidenceResult::Failed);
    let new = evidence("accept_creates_one_revision", "new1234", 1100, EvidenceResult::Passed);
    assert_eq!(status(&c, &[old.clone(), new.clone()]), ContractStatus::Met);
    assert_eq!(status(&c, &[new, old]), ContractStatus::Met);
}

#[test]
fn a_contract_with_no_checks_is_never_met() {
    let c = contract("R-EMPTY", 1000, vec![]);
    assert_eq!(status(&c, &[]), ContractStatus::NotRun);
    assert!(matrix(std::slice::from_ref(&c), &[]).is_empty());
}

#[test]
fn an_evidence_log_over_four_kib_is_refused() {
    assert!(Evidence::new("c", "abc", 1000, EvidenceResult::Passed, 1, "x".repeat(MAX_LOG_BYTES)).is_ok());
    let too_long = Evidence::new(
        "c",
        "abc",
        1000,
        EvidenceResult::Passed,
        1,
        "x".repeat(MAX_LOG_BYTES + 1),
    );
    assert!(
        matches!(too_long, Err(EvidenceError::LogTooLong { bytes, limit }) if bytes == MAX_LOG_BYTES + 1 && limit == MAX_LOG_BYTES),
        "a log excerpt over 4 KB must be a typed error"
    );
}

#[test]
fn matrix_is_requirement_by_check_by_status_in_declared_order() {
    let contracts = vec![
        contract("R-1", 1000, vec![check("a", CheckKind::Unit), check("b", CheckKind::Property)]),
        contract("R-2", 1000, vec![check("c", CheckKind::E2e)]),
    ];
    let ev = vec![
        evidence("a", "abc", 1100, EvidenceResult::Passed),
        evidence("c", "abc", 1100, EvidenceResult::Failed),
    ];
    let rows = matrix(&contracts, &ev);
    assert_eq!(rows.len(), 3);
    assert_eq!((rows[0].contract.as_str(), rows[0].check.as_str(), &rows[0].status), ("R-1", "a", &ContractStatus::Met));
    assert_eq!((rows[1].contract.as_str(), rows[1].check.as_str(), &rows[1].status), ("R-1", "b", &ContractStatus::NotRun));
    assert_eq!((rows[2].contract.as_str(), rows[2].check.as_str(), &rows[2].status), ("R-2", "c", &ContractStatus::Failing));
}

// --- gate(contracts, evidence, required) ---

#[test]
fn gate_passes_only_when_every_required_contract_is_met() {
    let met = contract("R-MET", 1000, vec![check("a", CheckKind::Unit)]);
    let not_run = contract("R-NOT-RUN", 1000, vec![check("b", CheckKind::Unit)]);
    let ev = vec![evidence("a", "abc", 1100, EvidenceResult::Passed)];
    let contracts = vec![met.clone(), not_run.clone()];

    let only_met = gate(&contracts, &ev, &["R-MET".into()]);
    assert!(only_met.passed, "reasons: {:?}", only_met.reasons);
    assert!(only_met.reasons.is_empty());

    let both: GateResult = gate(&contracts, &ev, &["R-MET".into(), "R-NOT-RUN".into()]);
    assert!(!both.passed);
    assert_eq!(both.reasons.len(), 1);
    assert!(both.reasons[0].contains("R-NOT-RUN"), "reason: {}", both.reasons[0]);
    assert!(both.reasons[0].contains("not_run"), "reason: {}", both.reasons[0]);

    let unknown = gate(&contracts, &ev, &["R-MISSING".into()]);
    assert!(!unknown.passed);
    assert!(unknown.reasons[0].contains("R-MISSING"));
}

// --- S37 sample shapes (seeded from the board's sample parts) ---

#[test]
fn sample_contracts_are_seeded_from_the_s37_board() {
    let contracts = sample_contracts();
    let ev = sample_evidence();
    assert_eq!(contracts.len(), 8, "DELIVERY_CONTRACTS has eight contracts");
    assert!(contracts.iter().any(|c| c.title == "Variance alerts"));
    assert!(contracts.iter().any(|c| c.id.contains("R-DASH-014")));
    assert!(contracts.iter().flat_map(|c| c.checks.iter()).any(|c| c.name == "Schema is valid OpenAPI 3.1"));
    assert!(contracts.iter().flat_map(|c| c.checks.iter()).any(|c| c.name == "Auth and permissions section present"));

    let statuses: Vec<ContractStatus> = contracts.iter().map(|c| status(c, &ev)).collect();
    for expected in [ContractStatus::Met, ContractStatus::Failing, ContractStatus::NotRun, ContractStatus::Stale] {
        assert!(statuses.contains(&expected), "sample must show {expected}: {statuses:?}");
    }
    assert_eq!(sample_matrix(), matrix(&contracts, &ev));
    assert!(sample_matrix().len() > contracts.len());
}

// --- properties (T-315 style: one failing case is enough to break the rule) ---

fn check_strategy() -> impl Strategy<Value = Check> {
    (
        "[a-z]{4,10}",
        prop::sample::select(vec![CheckKind::Unit, CheckKind::Property, CheckKind::E2e, CheckKind::Harness]),
        prop::sample::select(vec![OwnerLane::Core, OwnerLane::Ui, OwnerLane::Lead]),
    )
        .prop_map(|(name, kind, owner)| Check { name, kind, owner })
}

proptest! {
    #[test]
    fn missing_evidence_is_never_met(
        checks in prop::collection::vec(check_strategy(), 2..6),
        covered in 0usize..4,
    ) {
        let covered = covered.min(checks.len() - 1); // at least one check is never run
        let c = contract("R-PROP", 1000, checks.clone());
        let ev: Vec<Evidence> = checks.iter().take(covered)
            .map(|ch| evidence(&ch.name, "abc", 1500, EvidenceResult::Passed))
            .collect();
        prop_assert_ne!(status(&c, &ev), ContractStatus::Met,
            "a check with no evidence was shown as met: {:?}, covered={}", checks, covered);
    }

    #[test]
    fn any_failed_required_check_fails_the_gate(
        checks in prop::collection::vec(check_strategy(), 1..5),
        at in 1001i64..2000i64,
    ) {
        let c = contract("R-PROP", 1000, checks.clone());
        let ev: Vec<Evidence> = checks.iter()
            .map(|ch| evidence(&ch.name, "bad", at, EvidenceResult::Failed))
            .collect();
        let result = gate(std::slice::from_ref(&c), &ev, &["R-PROP".to_owned()]);
        prop_assert!(!result.passed, "a failed required check passed the gate: {checks:?}");
        prop_assert!(!result.reasons.is_empty());
    }

    #[test]
    fn adding_newer_passing_evidence_never_turns_met_into_failing(
        checks in prop::collection::vec(check_strategy(), 1..4),
        base_at in 1001i64..2000i64,
        extra_at in 2001i64..3000i64,
        idx in 0usize..4,
    ) {
        let c = contract("R-PROP", 1000, checks.clone());
        let base: Vec<Evidence> = checks.iter()
            .map(|ch| evidence(&ch.name, "abc", base_at, EvidenceResult::Passed))
            .collect();
        prop_assume!(status(&c, &base) == ContractStatus::Met);
        let mut with_new = base.clone();
        let target = &checks[idx % checks.len()];
        with_new.push(evidence(&target.name, "new", extra_at, EvidenceResult::Passed));
        let after = status(&c, &with_new);
        prop_assert_eq!(after, ContractStatus::Met,
            "newer passing evidence changed met into {}: {:?}", after, target);
    }
}
