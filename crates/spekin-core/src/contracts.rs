//! Build contracts and evidence for S37 (IMP-33, R-EVD-1, R-EVD-4, AC-SPK-22).
//!
//! A contract is a named requirement with a list of checks. Evidence records one
//! run of one check. The rules here are pure: the caller supplies the UTC clock
//! and the commit facts, so a missing check is `not_run` (never passed), evidence
//! from before the contract's last change is `stale`, and the release gate passes
//! only when every required contract is `met`. The sample shapes are seeded from
//! `docs/design/spekin-canvas/sample/parts/delivery.mjs` (DELIVERY_CONTRACTS and
//! DELIVERY_CHECKS) so the board, the app and the API read the same names.

use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Maximum size of an evidence log excerpt, in bytes (4 KB).
pub const MAX_LOG_BYTES: usize = 4096;

/// The kind of check that verifies a contract.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum CheckKind {
    Unit,
    Property,
    E2e,
    Harness,
}

/// The lane that owns a check.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum OwnerLane {
    Ui,
    Core,
    Lead,
}

/// One check of a contract: a test name, its kind and its owning lane.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Check {
    /// Test name. Evidence refers to a check by this name.
    pub name: String,
    pub kind: CheckKind,
    pub owner: OwnerLane,
}

/// The outcome of one recorded run of a check. `skipped` is not a pass.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum EvidenceResult {
    Passed,
    Failed,
    Skipped,
}

/// Why an evidence record could not be built.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS, thiserror::Error)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum EvidenceError {
    #[error("evidence log excerpt is {bytes} bytes, limit is {limit}")]
    LogTooLong { bytes: usize, limit: usize },
}

/// One run of one check. Use [`Evidence::new`] so the log limit is enforced.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Evidence {
    /// Name of the check this run verifies.
    pub check: String,
    /// Commit SHA the run was performed against.
    pub commit: String,
    /// UTC Unix seconds when the run finished.
    pub at: i64,
    pub result: EvidenceResult,
    pub duration_ms: u64,
    /// A log excerpt of at most [`MAX_LOG_BYTES`] bytes.
    pub log: String,
}

impl Evidence {
    /// Build an evidence record, refusing a log excerpt over 4 KB.
    pub fn new(
        check: impl Into<String>,
        commit: impl Into<String>,
        at: i64,
        result: EvidenceResult,
        duration_ms: u64,
        log: impl Into<String>,
    ) -> Result<Self, EvidenceError> {
        let log = log.into();
        if log.len() > MAX_LOG_BYTES {
            return Err(EvidenceError::LogTooLong {
                bytes: log.len(),
                limit: MAX_LOG_BYTES,
            });
        }
        Ok(Self {
            check: check.into(),
            commit: commit.into(),
            at,
            result,
            duration_ms,
            log,
        })
    }
}

/// A named requirement, for example `R-EDT-3: accept creates one revision`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Contract {
    /// Requirement id, for example `R-EDT-3`.
    pub id: String,
    /// Human-readable requirement, for example `accept creates one revision`.
    pub title: String,
    /// UTC Unix seconds of the commit that last changed this contract.
    /// Evidence from an earlier moment cannot verify this revision.
    pub changed_at: i64,
    pub checks: Vec<Check>,
}

/// Status of a check (or a whole contract) in the S37 readiness matrix.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ContractStatus {
    Met,
    Failing,
    NotRun,
    Stale,
}

impl ContractStatus {
    /// The word the board shows. Never colour alone (R-EVD-4).
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Met => "met",
            Self::Failing => "failing",
            Self::NotRun => "not_run",
            Self::Stale => "stale",
        }
    }

    /// Worst-first rank used to fold per-check statuses into a contract status.
    fn rank(self) -> u8 {
        match self {
            Self::NotRun => 3,
            Self::Failing => 2,
            Self::Stale => 1,
            Self::Met => 0,
        }
    }
}

/// One row of `matrix`: requirement × check × status.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct MatrixRow {
    pub contract: String,
    pub check: String,
    pub status: ContractStatus,
}

/// Result of `gate`: whether it passed and why it did not.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct GateResult {
    pub passed: bool,
    /// One reason per unmet or unknown required contract, in required order.
    pub reasons: Vec<String>,
}

/// Status of one check. The newest evidence for that check wins; ties are broken
/// by commit SHA so the result never depends on the order of the input vector.
pub fn check_status(contract: &Contract, check: &Check, evidence: &[Evidence]) -> ContractStatus {
    let latest = evidence
        .iter()
        .filter(|e| e.check == check.name)
        .max_by(|a, b| (a.at, &a.commit).cmp(&(b.at, &b.commit)));
    match latest {
        None => ContractStatus::NotRun,
        Some(e) if e.result == EvidenceResult::Skipped => ContractStatus::NotRun,
        Some(e) if e.at < contract.changed_at => ContractStatus::Stale,
        Some(e) if e.result == EvidenceResult::Failed => ContractStatus::Failing,
        Some(e) if e.result == EvidenceResult::Passed => ContractStatus::Met,
        // Defensive: an unknown future result is not a pass.
        Some(_) => ContractStatus::NotRun,
    }
}

/// Status of a whole contract: the worst status of its checks. A contract with no
/// checks is `not_run`, never `met`.
pub fn status(contract: &Contract, evidence: &[Evidence]) -> ContractStatus {
    if contract.checks.is_empty() {
        return ContractStatus::NotRun;
    }
    contract
        .checks
        .iter()
        .map(|check| check_status(contract, check, evidence))
        .max_by_key(|s| s.rank())
        .unwrap_or(ContractStatus::NotRun)
}

/// The S37 matrix rows, in contract then check declaration order.
pub fn matrix(contracts: &[Contract], evidence: &[Evidence]) -> Vec<MatrixRow> {
    contracts
        .iter()
        .flat_map(|contract| {
            contract.checks.iter().map(move |check| MatrixRow {
                contract: contract.id.clone(),
                check: check.name.clone(),
                status: check_status(contract, check, evidence),
            })
        })
        .collect()
}

/// The release gate passes only when every required contract is `met`.
pub fn gate(contracts: &[Contract], evidence: &[Evidence], required: &[String]) -> GateResult {
    let mut reasons = Vec::new();
    for id in required {
        match contracts.iter().find(|contract| contract.id == *id) {
            None => reasons.push(format!("{id}: unknown required contract")),
            Some(contract) => {
                let overall = status(contract, evidence);
                if overall != ContractStatus::Met {
                    let unmet: Vec<&str> = contract
                        .checks
                        .iter()
                        .filter(|check| {
                            check_status(contract, check, evidence) != ContractStatus::Met
                        })
                        .map(|check| check.name.as_str())
                        .collect();
                    reasons.push(format!(
                        "{}: {} [{}]",
                        contract.id,
                        overall.as_str(),
                        unmet.join(", ")
                    ));
                }
            }
        }
    }
    GateResult {
        passed: reasons.is_empty(),
        reasons,
    }
}

const S37_CHANGED_AT: i64 = 1000; // spec r14 accepted: evidence before this is stale
const S37_FRESH_AT: i64 = 2000; // build b4a1f9c ran after the change
const S37_STALE_AT: i64 = 500; // old build b3c7d2e ran before it

fn s37_check(name: &str, kind: CheckKind) -> Check {
    Check {
        name: name.to_owned(),
        kind,
        owner: OwnerLane::Core,
    }
}

fn numbered(prefix: &str, count: usize, kind: CheckKind) -> Vec<Check> {
    (1..=count)
        .map(|i| s37_check(&format!("{prefix} check {i}"), kind))
        .collect()
}

/// The eight contracts of `DELIVERY_CONTRACTS` (S37 board), with the six named
/// checks of `DELIVERY_CHECKS` on the selected API contract.
pub fn sample_contracts() -> Vec<Contract> {
    vec![
        Contract {
            id: "R-DASH-014".into(),
            title: "Variance table behaviour".into(),
            changed_at: S37_CHANGED_AT,
            checks: numbered("variance table behaviour", 4, CheckKind::Unit),
        },
        Contract {
            id: "R-DASH-014, 015, 019".into(),
            title: "Variance alerts".into(),
            changed_at: S37_CHANGED_AT,
            checks: vec![
                s37_check("Schema is valid OpenAPI 3.1", CheckKind::Unit),
                s37_check("Every endpoint links a requirement", CheckKind::Unit),
                s37_check(
                    "Threshold comes from accepted spec r14",
                    CheckKind::Property,
                ),
                s37_check("Auth and permissions section present", CheckKind::E2e),
                s37_check("Fixture matches entity VarianceAlert r1", CheckKind::Unit),
                s37_check("No breaking change against r1", CheckKind::Harness),
            ],
        },
        Contract {
            id: "R-DASH-014-entity".into(),
            title: "VarianceAlert".into(),
            changed_at: S37_CHANGED_AT,
            checks: numbered("VarianceAlert", 4, CheckKind::Property),
        },
        Contract {
            id: "R-DASH-019".into(),
            title: "0007 add variance_alerts".into(),
            changed_at: S37_CHANGED_AT,
            checks: numbered("migration 0007", 3, CheckKind::Unit),
        },
        Contract {
            id: "AC-DASH-014".into(),
            title: "AC-DASH-014 alert rules".into(),
            changed_at: S37_CHANGED_AT,
            checks: numbered("AC-DASH-014 alert rules", 3, CheckKind::E2e),
        },
        Contract {
            id: "R-DASH-014-integration".into(),
            title: "Contract fixtures, GET alerts".into(),
            changed_at: S37_CHANGED_AT,
            checks: numbered("contract fixtures", 1, CheckKind::E2e),
        },
        Contract {
            id: "R-DASH-*".into(),
            title: "Acceptance criteria, 11".into(),
            changed_at: S37_CHANGED_AT,
            checks: numbered("acceptance criterion", 11, CheckKind::E2e),
        },
        Contract {
            id: "Build b4a1f9c".into(),
            title: "Staging release, pinned".into(),
            changed_at: S37_CHANGED_AT,
            checks: numbered("release checklist", 6, CheckKind::Harness),
        },
    ]
}

fn sample_ev(check: &str, commit: &str, at: i64, result: EvidenceResult) -> Evidence {
    Evidence::new(check, commit, at, result, 1200, "fixture log excerpt").expect("sample log fits")
}

/// Evidence for the S37 sample: every status the board shows (`met`, `failing`,
/// `not_run` and `stale`) is present, and an old run never verifies a new contract.
pub fn sample_evidence() -> Vec<Evidence> {
    let mut out = Vec::new();
    // Variance alerts: three passes, one failure, one skipped and one stale run.
    for name in [
        "Schema is valid OpenAPI 3.1",
        "Every endpoint links a requirement",
        "Fixture matches entity VarianceAlert r1",
    ] {
        out.push(sample_ev(
            name,
            "b4a1f9c",
            S37_FRESH_AT,
            EvidenceResult::Passed,
        ));
    }
    out.push(sample_ev(
        "Auth and permissions section present",
        "b4a1f9c",
        S37_FRESH_AT,
        EvidenceResult::Failed,
    ));
    out.push(sample_ev(
        "Threshold comes from accepted spec r14",
        "b3c7d2e",
        S37_STALE_AT,
        EvidenceResult::Passed,
    ));
    out.push(sample_ev(
        "No breaking change against r1",
        "b4a1f9c",
        S37_FRESH_AT,
        EvidenceResult::Skipped,
    ));
    // VarianceAlert: all four checks pass on the current build.
    for i in 1..=4 {
        out.push(sample_ev(
            &format!("VarianceAlert check {i}"),
            "b4a1f9c",
            S37_FRESH_AT,
            EvidenceResult::Passed,
        ));
    }
    // Contract fixtures: one failed check is a concrete release blocker.
    out.push(sample_ev(
        "contract fixtures check 1",
        "b4a1f9c",
        S37_FRESH_AT,
        EvidenceResult::Failed,
    ));
    // AC-DASH-014 alert rules: only old evidence exists, so it is stale.
    for i in 1..=3 {
        out.push(sample_ev(
            &format!("AC-DASH-014 alert rules check {i}"),
            "b3c7d2e",
            S37_STALE_AT,
            EvidenceResult::Passed,
        ));
    }
    out
}

/// The S37 matrix rows for the seeded contracts and evidence.
pub fn sample_matrix() -> Vec<MatrixRow> {
    matrix(&sample_contracts(), &sample_evidence())
}
