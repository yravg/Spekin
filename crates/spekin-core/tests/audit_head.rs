//! IMP-35: the audit head hash is an anchor held *apart* from the stored log
//! (lead review on #21). A log that carries its own head can be rewritten so it
//! looks valid on its own; only a separately held head catches that.

use serde_json::Value;
use spekin_core::{AuditError, AuditEvent, AuditLog, GENESIS_HASH, verify, verify_with_head};

fn event(n: u64) -> AuditEvent {
    AuditEvent {
        actor: format!("actor-{n}"),
        action: spekin_core::AuditAction::Reject,
        target_id: format!("F-{n:03}"),
        revision: Some(format!("r{n}")),
        reason: format!("reason-{n}"),
    }
}

#[test]
fn verify_with_head_accepts_an_empty_chain_at_the_genesis_anchor() {
    assert_eq!(verify_with_head(&AuditLog::new(), GENESIS_HASH), Ok(()));
}

#[test]
fn verify_with_head_accepts_a_chain_with_its_separately_held_head() {
    let mut log = AuditLog::new();
    log.append(event(1), 1_700_000_001);
    let head = log.entries()[0].hash.clone();
    assert_eq!(verify_with_head(&log, &head), Ok(()));
    assert_eq!(verify_with_head(&log, GENESIS_HASH), Err(AuditError::Truncated { seq: 2 }));
}

#[test]
fn verify_with_head_catches_a_truncation_the_stored_log_cannot_see() {
    let mut log = AuditLog::new();
    log.append(event(1), 1_700_000_001);
    log.append(event(2), 1_700_000_002);
    let external_head = log.entries()[1].hash.clone();

    // Forge a copy that drops the tail and rewrites the log's own head so the
    // chain looks complete. `verify` alone is fooled; the external head is not.
    let mut value: Value = serde_json::from_str(&serde_json::to_string(&log).unwrap()).unwrap();
    value["entries"].as_array_mut().unwrap().pop();
    value["head_hash"] = Value::String(log.entries()[0].hash.clone());
    let forged: AuditLog = serde_json::from_value(value).unwrap();

    assert_eq!(verify(&forged), Ok(()), "the stored log now looks valid alone");
    assert_eq!(
        verify_with_head(&forged, &external_head),
        Err(AuditError::Truncated { seq: 2 })
    );
}

#[test]
fn verify_with_head_still_detects_an_edited_entry() {
    let mut log = AuditLog::new();
    log.append(event(1), 1_700_000_001);
    let head = log.entries()[0].hash.clone();
    // A stored log is edited through its JSON form; the core exposes no setter.
    let mut value: Value = serde_json::from_str(&serde_json::to_string(&log).unwrap()).unwrap();
    value["entries"][0]["reason"] = Value::String("tampered".to_owned());
    let edited: AuditLog = serde_json::from_value(value).unwrap();
    assert_eq!(
        verify_with_head(&edited, &head),
        Err(AuditError::Edited { seq: 1 })
    );
}
