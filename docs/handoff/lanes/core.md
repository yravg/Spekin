# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-03 | – | open | – | – |
| IMP-30 | imp-30-audit-log | done | `npm run gate` EXIT 0; 13 audit tests pass (8 behavior + 5 ts-rs export bindings), 19 core tests total. Tests: `append_starts_a_genesis_chain_and_links_each_entry`, `verify_accepts_empty_and_well_formed_logs`, `any_edit_to_any_entry_fails_verify_at_that_entry`, `editing_any_hashed_field_is_detected_at_that_entry`, `verify_names_the_sequence_of_a_removed_or_reordered_entry`, `verify_detects_tail_truncation`, `appending_never_changes_earlier_hashes`, `sequence_numbers_are_gapless`. Generated TS bindings committed; `check:contracts` current. | No harness/PNG check (core card, no board). Not wired into a server route (IMP-26 owns routes). Property tests use deterministic generated inputs, not the `proptest` crate, so sha2 stays the only new dependency (see below). |

## Requests to lead

(Files you need changed but don't own, board questions, dependency approvals. One line each, with the date.)

- 23 Nov 2026: new dependency `sha2` v0.10.9, licence **MIT OR Apache-2.0** (transitive crates `digest`, `block-buffer`, `crypto-common`, `generic-array`, `typenum`, `cpufeatures`, `cfg-if`, `version_check` are all MIT/Apache-2.0). Used for the sha256 content hash in `crates/spekin-core/src/audit.rs`, as the IMP-30 card specifies. No other dependency added.

## Proposed glossary terms

- **Audit entry**: one immutable record in the hash-chained log: a gapless sequence, actor, action, target id and revision, reason, UTC time, `prev_hash` and `hash`.
- **Audit log**: the append-only chain of audit entries; `verify` detects an edited, removed or reordered entry. No update or delete operation.

## Log

(Newest first: date, card, what changed, commit SHA.)

- 23 Nov 2026, IMP-30: wrote failing tests first (`todo!()` stubs, 7 red), then implemented `AuditLog::append`, `verify`, canonical-JSON sha256 hashing and a tail head-anchor; all 8 behavior properties pass. Added `sha2` (MIT OR Apache-2.0), exported 5 types with ts-rs, committed generated contracts. Commits: c68bfd2 (test first), c361f9b (impl), 5b5dec2 (fmt/clippy), 101366a (all-field edit test).
