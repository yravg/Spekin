//! Recently deleted and restore (S27, F134). Pure logic, no IO (ADR 0002, R-ARC-3).
//!
//! Times are UTC Unix seconds passed in by the caller. The core never reads a system clock,
//! so the same input always gives the same result. Only the four card functions change state;
//! everything else here is a typed view or a stable helper.

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::project::Project;

/// UTC Unix timestamp in seconds. Supplied by the caller; no system clock in the core.
pub type Timestamp = i64;

/// The 30-day restore window (DECISIONS.md, 22 Nov 2026; S27 draws 30 days).
pub const RESTORE_WINDOW_DAYS: i64 = 30;
/// Seconds in a UTC day, used for the window arithmetic and the day counter.
pub const SECONDS_PER_DAY: i64 = 86_400;
/// Length of the restore window in seconds.
pub const WINDOW_SECONDS: i64 = RESTORE_WINDOW_DAYS * SECONDS_PER_DAY;

/// A project as stored for deletion/restore. While `deleted_at` is `None` the project is live;
/// delete only sets that mark. The project payload and every revision are kept untouched.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ProjectEntry {
    /// Stable project id, for example "kenari-fleet" (sample/parts/intake.mjs → INTAKE_DELETED).
    pub id: String,
    /// The project payload shown in the header (S35).
    pub project: Project,
    /// Revision ids kept through delete and restore; nothing is removed (F134).
    pub revisions: Vec<String>,
    /// Last time the project was created or changed (UTC seconds). Guards the clock.
    pub changed_at: Timestamp,
    /// Set only while the project sits in Recently deleted.
    pub deleted_at: Option<Timestamp>,
}

impl ProjectEntry {
    /// A live (not deleted) entry, created or last changed at `now`.
    pub fn new(
        id: impl Into<String>,
        project: Project,
        revisions: Vec<String>,
        now: Timestamp,
    ) -> Self {
        Self {
            id: id.into(),
            project,
            revisions,
            changed_at: now,
            deleted_at: None,
        }
    }

    /// Whether the project is currently in Recently deleted.
    pub fn is_deleted(&self) -> bool {
        self.deleted_at.is_some()
    }

    /// Stable content hash (FNV-1a 64, lowercase hex) over the parts delete/restore never
    /// touch: id, project payload and revisions. Equal content always hashes the same, so
    /// restore can be checked as the exact inverse of delete. A change detector, not a
    /// security hash (same convention as `Revision::hash`).
    pub fn content_hash(&self) -> String {
        let mut h: u64 = 0xcbf2_9ce4_8422_2325;
        feed(&self.id, &mut h);
        // Project is Serialize; these types cannot fail to serialise.
        if let Ok(bytes) = serde_json::to_vec(&self.project) {
            feed_bytes(&bytes, &mut h);
        }
        feed_bytes(&[0u8], &mut h);
        for rev in &self.revisions {
            feed(rev, &mut h);
        }
        format!("{h:016x}")
    }
}

/// Feed a UTF-8 field and a separator into the FNV-1a accumulator.
fn feed(text: &str, h: &mut u64) {
    feed_bytes(text.as_bytes(), h);
    feed_bytes(&[0u8], h);
}

fn feed_bytes(bytes: &[u8], h: &mut u64) {
    for b in bytes {
        *h ^= u64::from(*b);
        *h = h.wrapping_mul(0x0000_0100_0000_01b3);
    }
}

/// Typed errors for delete and restore. `WindowClosed` is what S27 shows once 30 days pass.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS, thiserror::Error)]
#[ts(export)]
pub enum RestoreError {
    #[error("project is not in Recently deleted")]
    NotDeleted,
    #[error("project is already in Recently deleted")]
    AlreadyDeleted,
    #[error("restore window closed at {closed_at}: deleted at {deleted_at}")]
    WindowClosed {
        deleted_at: Timestamp,
        closed_at: Timestamp,
    },
    #[error("clock went backwards: now {now} is before {before}")]
    ClockBackwards { now: Timestamp, before: Timestamp },
}

/// The instant the 30-day window closes for a deletion at `deleted_at` (UTC seconds).
pub fn window_close(deleted_at: Timestamp) -> Timestamp {
    deleted_at + WINDOW_SECONDS
}

/// Mark a live project as deleted at `now`. Nothing is removed: the payload and every
/// revision are kept. Deleting an already-deleted project or moving the clock back is refused.
pub fn delete(entry: ProjectEntry, now: Timestamp) -> Result<ProjectEntry, RestoreError> {
    todo!("IMP-29: implement delete")
}

/// Restore a deleted project at `now`, only inside the 30-day window. Outside it the typed
/// `WindowClosed { deleted_at, closed_at }` error is returned. Restore keeps the payload and
/// revisions and flips the deletion mark back off; it is the exact inverse of delete.
pub fn restore(entry: ProjectEntry, now: Timestamp) -> Result<ProjectEntry, RestoreError> {
    todo!("IMP-29: implement restore")
}

/// The whole days left S27 shows ("27 days left"). `0` when the project is live or the window
/// has closed. Ceiling division keeps a second of grace showing as "1", never "0" while still
/// restorable.
pub fn days_left(entry: &ProjectEntry, now: Timestamp) -> i64 {
    todo!("IMP-29: implement days_left")
}

/// Projects past the 30-day window. Returns clones and removes nothing: a later server job
/// uses this list to purge (ADR 0002 keeps IO out of the core).
pub fn purge_due(entries: &[ProjectEntry], now: Timestamp) -> Vec<ProjectEntry> {
    todo!("IMP-29: implement purge_due")
}

#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    // A roomy but overflow-safe range: adding WINDOW_SECONDS (~2.6e6) stays well inside i64.
    fn ts() -> impl Strategy<Value = Timestamp> {
        -1_000_000_000_000i64..1_000_000_000_000
    }

    fn sample_live(created: Timestamp) -> ProjectEntry {
        ProjectEntry::new(
            "kenari-fleet",
            Project {
                name: "Kenari Fleet".into(),
                product: "Fleet dashboard".into(),
                increment: "Inc. 1 · Variance alerts".into(),
                spec: "r4".into(),
                user: "Rina (sample)".into(),
                initials: "RS".into(),
            },
            vec!["r1".into(), "r2".into(), "r3".into(), "r4".into()],
            created,
        )
    }

    #[test]
    fn delete_marks_the_project_without_removing_anything() {
        let live = sample_live(1_000);
        let hash = live.content_hash();
        let gone = delete(live.clone(), 2_000).expect("delete in window");
        assert!(gone.is_deleted());
        assert_eq!(gone.deleted_at, Some(2_000));
        assert_eq!(gone.id, live.id);
        assert_eq!(gone.project, live.project);
        assert_eq!(gone.revisions, live.revisions);
        assert_eq!(gone.content_hash(), hash);
    }

    #[test]
    fn restore_is_the_exact_inverse_of_delete_inside_the_window() {
        let live = sample_live(0);
        let hash = live.content_hash();
        let gone = delete(live.clone(), 100).expect("delete");
        let back = restore(gone, 100 + WINDOW_SECONDS - 1).expect("restore one second before close");
        assert!(!back.is_deleted());
        assert_eq!(back.content_hash(), hash, "restore keeps the exact content hash");
        assert_eq!(back.revisions, live.revisions);
        assert_eq!(back.project, live.project);
    }

    #[test]
    fn window_closed_is_a_typed_error_at_and_after_thirty_days() {
        let gone = delete(sample_live(0), 5_000).expect("delete");
        let close = window_close(5_000);
        let err = restore(gone.clone(), close).unwrap_err();
        assert_eq!(err, RestoreError::WindowClosed { deleted_at: 5_000, closed_at: close });
        assert!(matches!(restore(gone, close + 1), Err(RestoreError::WindowClosed { .. })));
    }

    #[test]
    fn days_left_counts_down_and_matches_the_board() {
        let gone = delete(sample_live(0), 0).expect("delete");
        assert_eq!(days_left(&gone, 0), RESTORE_WINDOW_DAYS);
        // Deleted three days ago: S27 reads "27 days left".
        assert_eq!(days_left(&gone, 3 * SECONDS_PER_DAY), 27);
        assert_eq!(days_left(&gone, 30 * SECONDS_PER_DAY - 1), 1);
        assert_eq!(days_left(&gone, 30 * SECONDS_PER_DAY), 0);
        assert_eq!(days_left(&sample_live(0), 100), 0, "a live project has no countdown");
    }

    #[test]
    fn deleting_twice_or_restoring_a_live_project_is_refused() {
        let gone = delete(sample_live(0), 10).expect("delete");
        assert_eq!(delete(gone, 20).unwrap_err(), RestoreError::AlreadyDeleted);
        assert_eq!(restore(sample_live(0), 20).unwrap_err(), RestoreError::NotDeleted);
    }

    #[test]
    fn purge_due_lists_only_projects_past_the_window_and_removes_nothing() {
        let old = delete(sample_live(0), 100).expect("delete");
        let fresh = delete(ProjectEntry::new("other", old.project.clone(), vec![], 100), 9_000)
            .expect("delete");
        let entries = vec![old.clone(), fresh.clone()];
        let due = purge_due(&entries, 100 + WINDOW_SECONDS);
        assert_eq!(due.len(), 1);
        assert_eq!(due[0].id, old.id);
        assert_eq!(entries.len(), 2, "purge_due removes nothing");
        assert!(purge_due(&entries, 9_000 + WINDOW_SECONDS).len() == 2);
    }

    proptest! {
        #[test]
        fn property_restore_inverts_delete_inside_the_window(
            deleted_at in ts(),
            elapsed in 0..WINDOW_SECONDS,
        ) {
            let live = sample_live(deleted_at - WINDOW_SECONDS);
            let hash = live.content_hash();
            let gone = delete(live.clone(), deleted_at).expect("delete");
            let back = restore(gone, deleted_at + elapsed).expect("restore inside the window");
            prop_assert!(!back.is_deleted());
            prop_assert_eq!(back.content_hash(), hash);
            prop_assert_eq!(back.revisions, live.revisions);
            prop_assert_eq!(back.project, live.project);
        }

        #[test]
        fn property_nothing_is_restorable_after_the_window(
            deleted_at in ts(),
            extra in 0..WINDOW_SECONDS,
        ) {
            let gone = delete(sample_live(deleted_at - WINDOW_SECONDS), deleted_at).expect("delete");
            let now = deleted_at + WINDOW_SECONDS + extra;
            prop_assert_eq!(
                restore(gone, now),
                Err(RestoreError::WindowClosed {
                    deleted_at,
                    closed_at: deleted_at + WINDOW_SECONDS,
                })
            );
        }

        #[test]
        fn property_purge_due_never_lists_a_project_inside_the_window(
            deleted_at in ts(),
            now in ts(),
        ) {
            let gone = delete(sample_live(deleted_at - WINDOW_SECONDS), deleted_at).expect("delete");
            let due = purge_due(&[gone], now);
            let inside = now >= deleted_at && now < deleted_at + WINDOW_SECONDS;
            prop_assert_eq!(due.is_empty(), inside);
        }

        #[test]
        fn property_the_clock_never_goes_backwards_in_an_accepted_operation(
            created in ts(),
            now in ts(),
        ) {
            let live = sample_live(created);
            if now < created {
                let backwards = matches!(delete(live, now), Err(RestoreError::ClockBackwards { .. }));
                prop_assert!(backwards);
            } else {
                let gone = delete(live, now).expect("delete forwards");
                let backwards = matches!(
                    restore(gone.clone(), now - 1),
                    Err(RestoreError::ClockBackwards { .. })
                );
                prop_assert!(backwards);
            }
        }
    }
}
