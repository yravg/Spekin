//! Hosted credit ledger: `estimate -> reserve(max) -> settle(actual) / refund`,
//! with per-run, per-person, per-project and concurrency caps, plus 70% / 90% warnings.
//!
//! Pure domain logic (no IO, no clocks). Data shapes follow S36 (`sample/parts/models.mjs`)
//! and PRD SPK-T-06, AC-SPK-8/9. Only Hosted runs touch this ledger (ADR 0005).

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Fixed warning threshold (amber banner on S36).
pub const WARN_THRESHOLD_PCT: u64 = 70;

/// Fixed critical threshold (red banner on S36).
pub const CRIT_THRESHOLD_PCT: u64 = 90;

/// Usage severity shown in the S36 meter and Limits page (`calm` < 70%, `warn` >= 70%, `crit` >= 90%).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum UsageSeverity {
    Calm,
    Warn,
    Crit,
}

/// Compute severity for `committed` against `cap` using integer arithmetic.
/// A zero cap is always critical (no room left).
pub fn severity_for(committed: u32, cap: u32) -> UsageSeverity {
    if cap == 0 {
        return UsageSeverity::Crit;
    }
    let lhs = u64::from(committed) * 100;
    let cap64 = u64::from(cap);
    if lhs >= cap64 * CRIT_THRESHOLD_PCT {
        UsageSeverity::Crit
    } else if lhs >= cap64 * WARN_THRESHOLD_PCT {
        UsageSeverity::Warn
    } else {
        UsageSeverity::Calm
    }
}

/// Caps enforced atomically at reservation time (S36 `MODELS_CAPS` + per-person cap).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct LedgerCaps {
    /// Maximum credits a single run may reserve (`MODELS_CAPS.perRun`, e.g. 60).
    pub per_run: u32,
    /// Monthly credit cap for the project (`MODELS_CAPS.monthly`, e.g. 5000).
    pub project: u32,
    /// Monthly credit cap for a single person.
    pub person: u32,
    /// Maximum number of concurrent active reservations (`MODELS_CAPS.concurrency`, e.g. 2).
    pub concurrency: u32,
}

/// Pre-run cost estimate and the maximum hold to reserve before starting (S36 `MODELS_RUN`).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct RunEstimate {
    /// Low end of the estimated credit range (e.g. 18).
    pub min: u32,
    /// High end of the estimated credit range (e.g. 30).
    pub max: u32,
    /// Maximum credits to reserve before the run starts (`>= max`, e.g. 36).
    pub reserve: u32,
}

/// Construct a validated [`RunEstimate`]. Requires `min <= max <= reserve`.
pub fn estimate(min: u32, max: u32, reserve: u32) -> Result<RunEstimate, LedgerError> {
    if min > max || max > reserve {
        return Err(LedgerError::InvalidEstimate { min, max, reserve });
    }
    Ok(RunEstimate { min, max, reserve })
}

/// Lifecycle state of one run's reservation.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum ReservationStatus {
    Active,
    Settled,
    Cancelled,
}

/// A reservation held for a single hosted run.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Reservation {
    pub run_id: String,
    pub person_id: String,
    pub idempotency_key: String,
    pub reserved: u32,
    pub charged: u32,
    pub refunded: u32,
    pub status: ReservationStatus,
}

/// Outcome returned by [`Ledger::settle`], [`Ledger::cancel`], or [`Ledger::cancel_with_usage`].
/// Always satisfies `charged + refunded == reserved`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Settlement {
    pub run_id: String,
    pub idempotency_key: String,
    pub reserved: u32,
    pub charged: u32,
    pub refunded: u32,
    pub cancelled: bool,
}

/// Entry kind recorded in the immutable ledger log (S36 `MODELS_LEDGER`).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum LedgerEntryKind {
    Reserve,
    Settle,
    Refund,
}

/// One append-only ledger entry recording a reserve, settle or refund.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct LedgerEntry {
    pub run_id: String,
    pub person_id: String,
    pub idempotency_key: String,
    pub kind: LedgerEntryKind,
    pub credits: u32,
    /// Remaining credits under the project cap immediately after this entry.
    pub project_left: u32,
}

/// Current usage totals and severity for a project or person (S36 `MODELS_USAGE`).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct UsageSnapshot {
    pub used: u32,
    pub reserved: u32,
    pub pending: u32,
    pub committed: u32,
    pub cap: u32,
    pub left: u32,
    pub severity: UsageSeverity,
}

/// Why a ledger operation was refused. A refused operation never mutates the ledger.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS, thiserror::Error)]
#[ts(export)]
pub enum LedgerError {
    #[error("invalid estimate: min ({min}) <= max ({max}) <= reserve ({reserve}) must hold")]
    InvalidEstimate { min: u32, max: u32, reserve: u32 },
    #[error("reserve {requested} cr exceeds the per-run cap of {per_run_cap} cr")]
    PerRunCapExceeded { requested: u32, per_run_cap: u32 },
    #[error("reserve {requested} cr exceeds the project cap ({left} of {cap} cr left)")]
    ProjectCapExceeded { requested: u32, left: u32, cap: u32 },
    #[error("reserve {requested} cr exceeds {person_id}'s cap ({left} of {cap} cr left)")]
    PersonCapExceeded {
        person_id: String,
        requested: u32,
        left: u32,
        cap: u32,
    },
    #[error("concurrency limit reached ({active} of {limit} runs in flight)")]
    ConcurrencyCapExceeded { active: u32, limit: u32 },
    #[error("run {run_id} already exists with different parameters")]
    DuplicateRun { run_id: String },
    #[error("idempotency key {idempotency_key} is already bound to run {existing_run_id}")]
    IdempotencyConflict {
        idempotency_key: String,
        existing_run_id: String,
    },
    #[error("run {run_id} has no reservation")]
    NoReservation { run_id: String },
    #[error("actual charge {actual} cr for run {run_id} exceeds reserved {reserved} cr")]
    ActualExceedsReserve {
        run_id: String,
        actual: u32,
        reserved: u32,
    },
    #[error("run {run_id} is already settled at {charged} cr (attempted {attempted} cr)")]
    AlreadySettled {
        run_id: String,
        charged: u32,
        attempted: u32,
    },
    #[error("run {run_id} is already cancelled at {charged} cr (attempted {attempted} cr)")]
    AlreadyCancelled {
        run_id: String,
        charged: u32,
        attempted: u32,
    },
}

/// Pure, in-memory credit ledger for one project.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Ledger {
    caps: LedgerCaps,
    project_used: u32,
    project_pending: u32,
    person_used: BTreeMap<String, u32>,
    reservations: BTreeMap<String, Reservation>,
    entries: Vec<LedgerEntry>,
}

impl Ledger {
    /// Start an empty ledger with the given caps.
    pub fn new(caps: LedgerCaps) -> Self {
        Self::with_starting_usage(caps, 0, 0)
    }

    /// Start a ledger with existing settled (`project_used`) and pending reconciliation credits.
    pub fn with_starting_usage(caps: LedgerCaps, project_used: u32, project_pending: u32) -> Self {
        Self {
            caps,
            project_used,
            project_pending,
            person_used: BTreeMap::new(),
            reservations: BTreeMap::new(),
            entries: Vec::new(),
        }
    }

    /// Caps currently enforced by this ledger.
    pub fn caps(&self) -> &LedgerCaps {
        &self.caps
    }

    /// Append-only ledger entries in chronological order.
    pub fn entries(&self) -> &[LedgerEntry] {
        &self.entries
    }

    /// Number of currently active (in-flight) reservations.
    pub fn active_count(&self) -> u32 {
        self.reservations
            .values()
            .filter(|r| r.status == ReservationStatus::Active)
            .count() as u32
    }

    /// Total credits currently held in active reservations across the project.
    fn project_reserved(&self) -> u32 {
        self.reservations
            .values()
            .filter(|r| r.status == ReservationStatus::Active)
            .fold(0u32, |acc, r| acc.saturating_add(r.reserved))
    }

    /// Total credits currently held in active reservations for one person.
    fn person_reserved(&self, person_id: &str) -> u32 {
        self.reservations
            .values()
            .filter(|r| r.status == ReservationStatus::Active && r.person_id == person_id)
            .fold(0u32, |acc, r| acc.saturating_add(r.reserved))
    }

    /// Usage snapshot for the project.
    pub fn project_usage(&self) -> UsageSnapshot {
        let reserved = self.project_reserved();
        let committed = self
            .project_used
            .saturating_add(reserved)
            .saturating_add(self.project_pending);
        let left = self.caps.project.saturating_sub(committed);
        UsageSnapshot {
            used: self.project_used,
            reserved,
            pending: self.project_pending,
            committed,
            cap: self.caps.project,
            left,
            severity: severity_for(committed, self.caps.project),
        }
    }

    /// Usage snapshot for one person.
    pub fn person_usage(&self, person_id: &str) -> UsageSnapshot {
        let used = self.person_used.get(person_id).copied().unwrap_or(0);
        let reserved = self.person_reserved(person_id);
        let committed = used.saturating_add(reserved);
        let left = self.caps.person.saturating_sub(committed);
        UsageSnapshot {
            used,
            reserved,
            pending: 0,
            committed,
            cap: self.caps.person,
            left,
            severity: severity_for(committed, self.caps.person),
        }
    }

    /// Atomically reserve `est.reserve` credits for a hosted run.
    /// Retrying with the same `(run_id, person_id, idempotency_key, est.reserve)` is idempotent.
    pub fn reserve(
        &mut self,
        run_id: impl Into<String>,
        person_id: impl Into<String>,
        idempotency_key: impl Into<String>,
        est: &RunEstimate,
    ) -> Result<Reservation, LedgerError> {
        let run_id = run_id.into();
        let person_id = person_id.into();
        let idempotency_key = idempotency_key.into();

        // Idempotent retry check for the same run_id.
        if let Some(existing) = self.reservations.get(&run_id) {
            if existing.idempotency_key == idempotency_key
                && existing.person_id == person_id
                && existing.reserved == est.reserve
            {
                return Ok(existing.clone());
            }
            return Err(LedgerError::DuplicateRun { run_id });
        }

        // Prevent reusing an idempotency key for a different run.
        if let Some(existing) = self
            .reservations
            .values()
            .find(|r| r.idempotency_key == idempotency_key)
        {
            return Err(LedgerError::IdempotencyConflict {
                idempotency_key,
                existing_run_id: existing.run_id.clone(),
            });
        }

        // Enforce all four caps before mutating state.
        if est.reserve > self.caps.per_run {
            return Err(LedgerError::PerRunCapExceeded {
                requested: est.reserve,
                per_run_cap: self.caps.per_run,
            });
        }

        let active = self.active_count();
        if active >= self.caps.concurrency {
            return Err(LedgerError::ConcurrencyCapExceeded {
                active,
                limit: self.caps.concurrency,
            });
        }

        let proj = self.project_usage();
        if u64::from(proj.committed) + u64::from(est.reserve) > u64::from(self.caps.project) {
            return Err(LedgerError::ProjectCapExceeded {
                requested: est.reserve,
                left: proj.left,
                cap: self.caps.project,
            });
        }

        let pers = self.person_usage(&person_id);
        if u64::from(pers.committed) + u64::from(est.reserve) > u64::from(self.caps.person) {
            return Err(LedgerError::PersonCapExceeded {
                person_id,
                requested: est.reserve,
                left: pers.left,
                cap: self.caps.person,
            });
        }

        let reservation = Reservation {
            run_id: run_id.clone(),
            person_id: person_id.clone(),
            idempotency_key: idempotency_key.clone(),
            reserved: est.reserve,
            charged: 0,
            refunded: 0,
            status: ReservationStatus::Active,
        };
        self.reservations
            .insert(run_id.clone(), reservation.clone());

        let project_left = self.project_usage().left;
        self.entries.push(LedgerEntry {
            run_id,
            person_id,
            idempotency_key,
            kind: LedgerEntryKind::Reserve,
            credits: est.reserve,
            project_left,
        });

        Ok(reservation)
    }

    /// Confirm that `run_id` holds an active reservation before starting work.
    pub fn authorize_start(&self, run_id: &str) -> Result<&Reservation, LedgerError> {
        let res = self
            .reservations
            .get(run_id)
            .ok_or_else(|| LedgerError::NoReservation {
                run_id: run_id.to_string(),
            })?;
        match res.status {
            ReservationStatus::Active => Ok(res),
            ReservationStatus::Settled => Err(LedgerError::AlreadySettled {
                run_id: run_id.to_string(),
                charged: res.charged,
                attempted: 0,
            }),
            ReservationStatus::Cancelled => Err(LedgerError::AlreadyCancelled {
                run_id: run_id.to_string(),
                charged: res.charged,
                attempted: 0,
            }),
        }
    }

    /// Settle an active reservation with the actual credits consumed, refunding the remainder.
    /// Idempotent when retried with the same `actual` amount.
    pub fn settle(&mut self, run_id: &str, actual: u32) -> Result<Settlement, LedgerError> {
        self.finalize(run_id, actual, false)
    }

    /// Cancel an active reservation before any credits are consumed, releasing the full hold.
    pub fn cancel(&mut self, run_id: &str) -> Result<Settlement, LedgerError> {
        self.finalize(run_id, 0, true)
    }

    /// Cancel an active reservation after partial usage (S36 run 0424), charging `actual`
    /// and releasing `reserved - actual`.
    pub fn cancel_with_usage(
        &mut self,
        run_id: &str,
        actual: u32,
    ) -> Result<Settlement, LedgerError> {
        self.finalize(run_id, actual, true)
    }

    fn finalize(
        &mut self,
        run_id: &str,
        actual: u32,
        cancelled: bool,
    ) -> Result<Settlement, LedgerError> {
        let Some(existing) = self.reservations.get(run_id) else {
            return Err(LedgerError::NoReservation {
                run_id: run_id.to_string(),
            });
        };

        match existing.status {
            ReservationStatus::Settled => {
                if !cancelled && existing.charged == actual {
                    return Ok(Settlement {
                        run_id: existing.run_id.clone(),
                        idempotency_key: existing.idempotency_key.clone(),
                        reserved: existing.reserved,
                        charged: existing.charged,
                        refunded: existing.refunded,
                        cancelled: false,
                    });
                }
                return Err(LedgerError::AlreadySettled {
                    run_id: run_id.to_string(),
                    charged: existing.charged,
                    attempted: actual,
                });
            }
            ReservationStatus::Cancelled => {
                if cancelled && existing.charged == actual {
                    return Ok(Settlement {
                        run_id: existing.run_id.clone(),
                        idempotency_key: existing.idempotency_key.clone(),
                        reserved: existing.reserved,
                        charged: existing.charged,
                        refunded: existing.refunded,
                        cancelled: true,
                    });
                }
                return Err(LedgerError::AlreadyCancelled {
                    run_id: run_id.to_string(),
                    charged: existing.charged,
                    attempted: actual,
                });
            }
            ReservationStatus::Active => {}
        }

        if actual > existing.reserved {
            return Err(LedgerError::ActualExceedsReserve {
                run_id: run_id.to_string(),
                actual,
                reserved: existing.reserved,
            });
        }

        let reserved = existing.reserved;
        let refunded = reserved - actual;
        let person_id = existing.person_id.clone();
        let idempotency_key = existing.idempotency_key.clone();

        // Update reservation status first so project_reserved() drops the hold.
        if let Some(res) = self.reservations.get_mut(run_id) {
            res.charged = actual;
            res.refunded = refunded;
            res.status = if cancelled {
                ReservationStatus::Cancelled
            } else {
                ReservationStatus::Settled
            };
        }

        self.project_used = self.project_used.saturating_add(actual);
        let person_entry = self.person_used.entry(person_id.clone()).or_insert(0);
        *person_entry = person_entry.saturating_add(actual);

        // Record settle entry (if any credits were consumed, or always for non-cancelled settles).
        if !cancelled || actual > 0 {
            // Left before refund matches S36 run 0426 (reserve 36 -> left 3718; settle 24 -> left 3718; refund +12 -> left 3730).
            let left_after_settle = self.project_usage().left.saturating_sub(refunded);
            self.entries.push(LedgerEntry {
                run_id: run_id.to_string(),
                person_id: person_id.clone(),
                idempotency_key: idempotency_key.clone(),
                kind: LedgerEntryKind::Settle,
                credits: actual,
                project_left: left_after_settle,
            });
        }

        if refunded > 0 {
            let project_left = self.project_usage().left;
            self.entries.push(LedgerEntry {
                run_id: run_id.to_string(),
                person_id,
                idempotency_key: idempotency_key.clone(),
                kind: LedgerEntryKind::Refund,
                credits: refunded,
                project_left,
            });
        }

        Ok(Settlement {
            run_id: run_id.to_string(),
            idempotency_key,
            reserved,
            charged: actual,
            refunded,
            cancelled,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn invalid_estimates_are_rejected() {
        assert_eq!(
            estimate(30, 18, 36),
            Err(LedgerError::InvalidEstimate {
                min: 30,
                max: 18,
                reserve: 36
            })
        );
        assert_eq!(
            estimate(18, 30, 29),
            Err(LedgerError::InvalidEstimate {
                min: 18,
                max: 30,
                reserve: 29
            })
        );
    }

    #[test]
    fn actual_exceeding_reserve_is_refused_without_mutating_ledger() {
        let mut ledger = Ledger::new(LedgerCaps {
            per_run: 60,
            project: 5000,
            person: 5000,
            concurrency: 2,
        });
        let est = estimate(10, 20, 25).unwrap();
        ledger.reserve("r-1", "rina", "k-1", &est).unwrap();

        assert_eq!(
            ledger.settle("r-1", 26),
            Err(LedgerError::ActualExceedsReserve {
                run_id: "r-1".into(),
                actual: 26,
                reserved: 25
            })
        );
        assert_eq!(ledger.project_usage().used, 0);
        assert_eq!(ledger.project_usage().reserved, 25);
        assert_eq!(ledger.active_count(), 1);
    }

    #[test]
    fn idempotency_key_cannot_be_reused_across_different_runs() {
        let mut ledger = Ledger::new(LedgerCaps {
            per_run: 60,
            project: 5000,
            person: 5000,
            concurrency: 2,
        });
        let est = estimate(10, 20, 20).unwrap();
        ledger.reserve("r-1", "rina", "k-shared", &est).unwrap();

        assert_eq!(
            ledger.reserve("r-2", "rina", "k-shared", &est),
            Err(LedgerError::IdempotencyConflict {
                idempotency_key: "k-shared".into(),
                existing_run_id: "r-1".into(),
            })
        );
    }
}
