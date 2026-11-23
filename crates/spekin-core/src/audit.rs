//! Append-only, hash-chained audit log (IMP-30).
//!
//! S33 adds exactly one audit entry when a proposal is rejected (C-03); the
//! evidence timeline (R-EVD-1) reads the same log. The core is pure: the caller
//! passes the UTC time in, so there is no system clock here. The only way to
//! add an entry is [`AuditLog::append`]; there is deliberately no update or
//! delete function. [`verify`] finds an edited, removed or reordered entry and
//! names its sequence number.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use ts_rs::TS;

/// The `prev_hash` of the first entry: 64 zero hex characters (UTC genesis).
pub const GENESIS_HASH: &str = "0000000000000000000000000000000000000000000000000000000000000000";

/// What happened. Serialized in snake_case so its canonical JSON is stable.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum AuditAction {
    Accept,
    Reject,
    Revert,
    Delete,
    Restore,
    Reserve,
    Settle,
    SkillUpdateApplied,
    SkillUpdateHeld,
}

/// The caller-supplied facts of an event. `append` adds the sequence, time and
/// hashes, so a caller cannot set them itself.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct AuditEvent {
    pub actor: String,
    pub action: AuditAction,
    pub target_id: String,
    /// Accepted revision the action applied to, when there is one.
    pub revision: Option<String>,
    pub reason: String,
}

/// One immutable record in the chain. `hash` covers every field except itself.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct AuditEntry {
    /// Gapless, starting at 1.
    pub seq: u64,
    pub actor: String,
    pub action: AuditAction,
    pub target_id: String,
    pub revision: Option<String>,
    pub reason: String,
    /// Unix timestamp in seconds (UTC), supplied by the caller.
    pub at: u64,
    pub prev_hash: String,
    /// sha256 of the canonical JSON of all the fields above plus `prev_hash`.
    pub hash: String,
}

/// Why verification failed. Every variant names the offending sequence number.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS, thiserror::Error)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum AuditError {
    #[error("audit entry {seq} was edited: its hash does not match its content")]
    Edited { seq: u64 },
    #[error(
        "audit entry {seq} is out of order or has a missing predecessor: prev_hash does not match the chain"
    )]
    BrokenChain { seq: u64 },
    #[error("audit entry {seq} breaks the gapless sequence")]
    Sequence { seq: u64 },
    #[error("audit log was truncated: tail entry {seq} is missing")]
    Truncated { seq: u64 },
}

/// The append-only chain. There is no update or delete function on purpose:
/// [`AuditLog::append`] is the only way to change it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct AuditLog {
    entries: Vec<AuditEntry>,
    /// Hash of the last entry, anchored so a truncated tail is also detected.
    head_hash: String,
}

/// Canonical hash input: every field of an entry except `hash`, with
/// `prev_hash` included. serde writes struct fields in declaration order, so
/// this serialisation is byte-stable across runs and machines.
#[derive(Serialize)]
struct HashPayload<'a> {
    seq: u64,
    actor: &'a str,
    action: &'a AuditAction,
    target_id: &'a str,
    revision: Option<&'a str>,
    reason: &'a str,
    at: u64,
    prev_hash: &'a str,
}

impl AuditLog {
    /// An empty chain, anchored at the genesis hash.
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
            head_hash: GENESIS_HASH.to_owned(),
        }
    }

    /// Read-only view of the chain, for the S33 review and the evidence timeline.
    pub fn entries(&self) -> &[AuditEntry] {
        &self.entries
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Append one entry and return it. Sequence, `prev_hash` and `hash` are
    /// computed here; earlier entries are never touched.
    pub fn append(&mut self, event: AuditEvent, now: u64) -> AuditEntry {
        let seq = self.entries.len() as u64 + 1;
        let prev_hash = self
            .entries
            .last()
            .map_or_else(|| GENESIS_HASH.to_owned(), |e| e.hash.clone());
        let payload = HashPayload {
            seq,
            actor: &event.actor,
            action: &event.action,
            target_id: &event.target_id,
            revision: event.revision.as_deref(),
            reason: &event.reason,
            at: now,
            prev_hash: &prev_hash,
        };
        let hash = compute_hash(&payload);
        let entry = AuditEntry {
            seq,
            actor: event.actor,
            action: event.action,
            target_id: event.target_id,
            revision: event.revision,
            reason: event.reason,
            at: now,
            prev_hash,
            hash: hash.clone(),
        };
        self.entries.push(entry.clone());
        self.head_hash = hash;
        entry
    }

    /// Convenience wrapper around the free [`verify`] function.
    pub fn verify(&self) -> Result<(), AuditError> {
        verify(self)
    }
}

impl Default for AuditLog {
    fn default() -> Self {
        Self::new()
    }
}

/// sha256 over the canonical JSON of an entry's fields plus `prev_hash`.
/// The `hash` field itself is deliberately not part of the input.
fn compute_hash(payload: &HashPayload<'_>) -> String {
    let bytes = serde_json::to_vec(payload).expect("hashing plain fields cannot fail");
    to_hex(Sha256::digest(bytes))
}

/// Lowercase hex encoding, without another dependency.
fn to_hex(bytes: impl AsRef<[u8]>) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let bytes = bytes.as_ref();
    let mut out = String::with_capacity(bytes.len() * 2);
    for &b in bytes {
        out.push(HEX[(b >> 4) as usize] as char);
        out.push(HEX[(b & 0x0f) as usize] as char);
    }
    out
}

/// Find an edited, removed or reordered entry and name its sequence number.
pub fn verify(log: &AuditLog) -> Result<(), AuditError> {
    for (i, entry) in log.entries.iter().enumerate() {
        let expected_seq = (i + 1) as u64;
        if entry.seq != expected_seq {
            return Err(AuditError::Sequence { seq: entry.seq });
        }

        let expected_prev = if i == 0 {
            GENESIS_HASH
        } else {
            &log.entries[i - 1].hash
        };
        if entry.prev_hash != expected_prev {
            return Err(AuditError::BrokenChain { seq: entry.seq });
        }

        let payload = HashPayload {
            seq: entry.seq,
            actor: &entry.actor,
            action: &entry.action,
            target_id: &entry.target_id,
            revision: entry.revision.as_deref(),
            reason: &entry.reason,
            at: entry.at,
            prev_hash: &entry.prev_hash,
        };
        let recomputed = compute_hash(&payload);
        if recomputed != entry.hash {
            return Err(AuditError::Edited { seq: entry.seq });
        }
    }

    // The head stored inside the log catches accidental truncation; a stored
    // log's own head can be rewritten, so callers must also use
    // `verify_with_head` with an anchor kept apart from the log.
    if log.head_hash != head_hash(log) {
        return Err(AuditError::Truncated {
            seq: log.entries.len() as u64 + 1,
        });
    }

    Ok(())
}

/// Hash of the last entry, or the genesis anchor when the log is empty.
///
/// The server keeps this value *apart* from the stored log (lead review on
/// #21): a log that carries its own head can be rewritten so it looks valid on
/// its own. Callers that persist a log must persist this anchor separately and
/// pass it to [`verify_with_head`].
pub fn head_hash(log: &AuditLog) -> String {
    log.entries
        .last()
        .map_or_else(|| GENESIS_HASH.to_owned(), |entry| entry.hash.clone())
}

/// Verify the chain *and* the head held apart from it. `verify` alone checks
/// the head stored inside the log; this is the authoritative check for a stored
/// log, whose own head may have been tampered with together with its entries.
pub fn verify_with_head(log: &AuditLog, expected_head: &str) -> Result<(), AuditError> {
    verify(log)?;
    if expected_head != head_hash(log) {
        return Err(AuditError::Truncated {
            seq: log.entries.len() as u64 + 1,
        });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Deterministic sample events: the property tests vary n over a wide range
    /// instead of pulling in a random generator dependency.
    fn event(n: u64) -> AuditEvent {
        AuditEvent {
            actor: format!("actor-{n}"),
            action: if n.is_multiple_of(2) {
                AuditAction::Reject
            } else {
                AuditAction::Accept
            },
            target_id: format!("F-{n:03}"),
            revision: Some(format!("r{n}")),
            reason: format!("reason-{n}"),
        }
    }

    fn filled_log(n: u64) -> AuditLog {
        let mut log = AuditLog::new();
        for i in 1..=n {
            log.append(event(i), 1_700_000_000 + i);
        }
        log
    }

    fn err_seq(err: &AuditError) -> u64 {
        match err {
            AuditError::Edited { seq }
            | AuditError::BrokenChain { seq }
            | AuditError::Sequence { seq }
            | AuditError::Truncated { seq } => *seq,
        }
    }

    #[test]
    fn append_starts_a_genesis_chain_and_links_each_entry() {
        let mut log = AuditLog::new();
        let first = log.append(event(1), 1_700_000_001);
        assert_eq!(first.seq, 1);
        assert_eq!(first.prev_hash, GENESIS_HASH);
        assert_eq!(first.hash.len(), 64);
        let second = log.append(event(2), 1_700_000_002);
        assert_eq!(second.seq, 2);
        assert_eq!(second.prev_hash, first.hash);
        assert_eq!(log.head_hash, second.hash);
        assert_eq!(log.entries().len(), 2);
    }

    #[test]
    fn verify_accepts_empty_and_well_formed_logs() {
        assert_eq!(verify(&AuditLog::new()), Ok(()));
        assert_eq!(verify(&filled_log(20)), Ok(()));
        assert_eq!(filled_log(20).verify(), Ok(()));
    }

    #[test]
    fn any_edit_to_any_entry_fails_verify_at_that_entry() {
        let log = filled_log(12);
        for idx in 0..log.entries().len() {
            let seq = log.entries()[idx].seq;

            let mut edited = log.clone();
            edited.entries[idx].reason.push('!');
            assert_eq!(
                verify(&edited),
                Err(AuditError::Edited { seq }),
                "edited reason at entry {seq}"
            );

            let mut edited = log.clone();
            edited.entries[idx].hash = "deadbeef".to_owned();
            assert_eq!(
                verify(&edited),
                Err(AuditError::Edited { seq }),
                "edited hash at entry {seq}"
            );

            let mut edited = log.clone();
            edited.entries[idx].prev_hash = "00".to_owned();
            let err = verify(&edited).expect_err("edited prev_hash must fail verify");
            assert_eq!(err_seq(&err), seq, "edited prev_hash at entry {seq}");
        }
    }

    #[test]
    fn editing_any_hashed_field_is_detected_at_that_entry() {
        let log = filled_log(12);
        for idx in 0..log.entries().len() {
            let seq = log.entries()[idx].seq;

            let mut edited = log.clone();
            edited.entries[idx].actor.push('!');
            assert_eq!(
                verify(&edited),
                Err(AuditError::Edited { seq }),
                "actor {seq}"
            );

            let mut edited = log.clone();
            edited.entries[idx].action = AuditAction::Delete;
            assert_eq!(
                verify(&edited),
                Err(AuditError::Edited { seq }),
                "action {seq}"
            );

            let mut edited = log.clone();
            edited.entries[idx].target_id.push('!');
            assert_eq!(
                verify(&edited),
                Err(AuditError::Edited { seq }),
                "target_id {seq}"
            );

            let mut edited = log.clone();
            edited.entries[idx].revision = Some(format!("r-{seq}-tampered"));
            assert_eq!(
                verify(&edited),
                Err(AuditError::Edited { seq }),
                "revision {seq}"
            );

            let mut edited = log.clone();
            edited.entries[idx].at += 1;
            assert_eq!(verify(&edited), Err(AuditError::Edited { seq }), "at {seq}");
        }
    }

    #[test]
    fn verify_names_the_sequence_of_a_removed_or_reordered_entry() {
        let log = filled_log(6);

        let mut removed = log.clone();
        removed.entries.remove(2); // original seq 3 is gone
        let err = verify(&removed).expect_err("a removed middle entry must fail verify");
        // The gap surfaces at the first surviving entry after the hole (seq 4).
        assert_eq!(err_seq(&err), 4);

        let mut reordered = log.clone();
        reordered.entries.swap(1, 2); // seqs become 1, 3, 2, ...
        let err = verify(&reordered).expect_err("a reordered entry must fail verify");
        assert_eq!(err_seq(&err), 3);
    }

    #[test]
    fn verify_detects_tail_truncation() {
        let log = filled_log(5);
        let mut truncated = log.clone();
        truncated.entries.pop(); // original seq 5
        let err = verify(&truncated).expect_err("a truncated tail must fail verify");
        assert_eq!(err, AuditError::Truncated { seq: 5 });
    }

    #[test]
    fn appending_never_changes_earlier_hashes() {
        let mut log = filled_log(8);
        let before: Vec<(u64, String, String)> = log
            .entries()
            .iter()
            .map(|e| (e.seq, e.prev_hash.clone(), e.hash.clone()))
            .collect();
        for i in 9..=24 {
            log.append(event(i), 1_700_000_000 + i);
        }
        let after: Vec<(u64, String, String)> = log
            .entries()
            .iter()
            .take(8)
            .map(|e| (e.seq, e.prev_hash.clone(), e.hash.clone()))
            .collect();
        assert_eq!(before, after);
        assert_eq!(verify(&log), Ok(()));
    }

    #[test]
    fn sequence_numbers_are_gapless() {
        let log = filled_log(64);
        for (i, e) in log.entries().iter().enumerate() {
            assert_eq!(e.seq, (i + 1) as u64);
        }
        assert_eq!(verify(&log), Ok(()));
    }
}
