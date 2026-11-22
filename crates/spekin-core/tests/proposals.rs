//! IMP-04: proposals and revisions. A proposal is an exact diff against one base revision.
//! Accepting it makes the next revision; a proposal whose base is not the current revision is
//! stale and is never applied (R-EDT-1, AC-SPK-4/5, T-315).

use proptest::prelude::*;
use spekin_core::{Hunk, Proposal, ProposalError, Revision, accept, reject, revert};

fn proposal(base: u32, hunks: Vec<Hunk>) -> Proposal {
    Proposal {
        id: "p-1".into(),
        artifact: "spec".into(),
        title: "Add the variance threshold".into(),
        base,
        hunks,
    }
}

fn hunk(at: usize, remove: &[&str], add: &[&str]) -> Hunk {
    Hunk {
        at,
        remove: remove.iter().map(|s| s.to_string()).collect(),
        add: add.iter().map(|s| s.to_string()).collect(),
    }
}

#[test]
fn accepting_applies_the_exact_diff_and_bumps_the_revision() {
    let current = Revision::first("one\ntwo\nthree");
    let p = proposal(1, vec![hunk(1, &["two"], &["2", "two and a half"])]);

    let next = accept(&current, &p).expect("a proposal against the current revision applies");

    assert_eq!(next.n, 2);
    assert_eq!(next.content, "one\n2\ntwo and a half\nthree");
    assert_eq!(next.label(), "r2");
    assert_ne!(next.hash(), current.hash());
}

#[test]
fn a_diff_that_does_not_match_the_base_is_refused() {
    let current = Revision::first("one\ntwo\nthree");
    let p = proposal(1, vec![hunk(1, &["TWO"], &["2"])]);

    assert_eq!(
        accept(&current, &p),
        Err(ProposalError::Mismatch { at: 1 }),
        "the removed lines must be exactly what the base revision holds"
    );
}

#[test]
fn a_proposal_written_against_an_older_revision_is_stale() {
    let current = Revision::first("one\ntwo").next("one\n2");
    let p = proposal(1, vec![hunk(1, &["two"], &["2"])]);

    assert_eq!(
        accept(&current, &p),
        Err(ProposalError::Stale {
            base: 1,
            current: 2
        })
    );
}

#[test]
fn accepting_twice_gives_the_same_revision_and_the_second_is_stale() {
    let current = Revision::first("one\ntwo");
    let p = proposal(1, vec![hunk(1, &["two"], &["2"])]);

    let once = accept(&current, &p).unwrap();
    let twice = accept(&current, &p).unwrap();

    assert_eq!(once, twice, "accepting is a pure function of the same inputs");
    assert_eq!(
        accept(&once, &p),
        Err(ProposalError::Stale {
            base: 1,
            current: 2
        }),
        "a proposal cannot be accepted again on top of its own result"
    );
}

#[test]
fn reject_records_the_reason_and_changes_no_content() {
    let p = proposal(1, vec![hunk(0, &["one"], &["1"])]);

    let rejection = reject(&p, "The threshold belongs in the design stage.");

    assert_eq!(rejection.id, "p-1");
    assert_eq!(rejection.base, 1);
    assert_eq!(rejection.reason, "The threshold belongs in the design stage.");
    // Nothing was applied: the base content is untouched, so no revision was made.
    assert_eq!(Revision::first("one").content, "one");
}

#[test]
fn revert_restores_the_earlier_content_hash() {
    let r1 = Revision::first("one\ntwo");
    let r2 = r1.next("one\n2");

    let r3 = revert(&r2, &r1).expect("reverting to an earlier revision is allowed");

    assert_eq!(r3.n, 3);
    assert_eq!(r3.hash(), r1.hash(), "the content hash comes back");
    assert_eq!(r3.content, r1.content);
}

#[test]
fn revert_to_a_later_revision_is_refused() {
    let r1 = Revision::first("one");
    let r2 = r1.next("two");

    assert_eq!(
        revert(&r1, &r2),
        Err(ProposalError::NotEarlier { from: 1, to: 2 })
    );
}

#[test]
fn a_hunk_past_the_end_of_the_base_is_refused() {
    let current = Revision::first("one\ntwo");

    assert_eq!(
        accept(&current, &proposal(1, vec![hunk(5, &[], &["five"])])),
        Err(ProposalError::OutOfRange { at: 5 })
    );
}

#[test]
fn overlapping_hunks_are_refused() {
    let current = Revision::first("one\ntwo\nthree");
    let p = proposal(
        1,
        vec![hunk(1, &["two"], &["2"]), hunk(1, &["two"], &["TWO"])],
    );

    assert_eq!(accept(&current, &p), Err(ProposalError::Overlap { at: 1 }));
}

#[test]
fn a_trailing_newline_survives_an_edit() {
    let current = Revision::first("one\ntwo\n");
    let next = accept(&current, &proposal(1, vec![hunk(1, &["two"], &["2"])])).unwrap();

    assert_eq!(next.content, "one\n2\n");
}

proptest! {
    // T-315: accepting twice gives the same result.
    #[test]
    fn accept_is_deterministic(base in content(), p in edit()) {
        let current = Revision::first(base);
        let first = accept(&current, &p);
        let second = accept(&current, &p);
        prop_assert_eq!(&first, &second);
        if let Ok(next) = first {
            prop_assert_eq!(next.n, current.n + 1);
            prop_assert_ne!(next.hash(), current.hash());
        }
    }

    // T-315: revert restores the content hash.
    #[test]
    fn revert_restores_the_content_hash(a in content(), b in content()) {
        let r1 = Revision::first(a);
        let r2 = r1.next(b);
        let r3 = revert(&r2, &r1).unwrap();
        prop_assert_eq!(r3.hash(), r1.hash());
        prop_assert_eq!(r3.content, r1.content);
        prop_assert_eq!(r3.n, r2.n + 1);
    }

    // T-315: a stale proposal is never applied.
    #[test]
    fn a_stale_proposal_is_never_applied(base in content(), ahead in 1u32..5, p in edit()) {
        let current = Revision::first(base.clone());
        let moved = Revision { n: 1 + ahead, content: base };
        let before = moved.clone();
        let stale = Proposal { base: 1, ..p };
        prop_assert_eq!(
            accept(&moved, &stale),
            Err(ProposalError::Stale { base: 1, current: moved.n })
        );
        prop_assert_eq!(&moved, &before, "the current revision is untouched");
        prop_assert_eq!(&current.content, &moved.content);
    }
}

fn content() -> impl Strategy<Value = String> {
    prop::collection::vec(line(), 1..8).prop_map(|lines| lines.join("\n"))
}

fn line() -> impl Strategy<Value = String> {
    "[a-zA-Z0-9 .,:-]{0,12}"
}

/// A proposal that is always a valid exact diff against the base it is generated for.
fn edit() -> impl Strategy<Value = Proposal> {
    content().prop_flat_map(|base| {
        let lines: Vec<String> = base.split('\n').map(str::to_string).collect();
        let len = lines.len();
        (0..len, 0..3usize, prop::collection::vec(line(), 0..3)).prop_map(move |(at, take, add)| {
            let end = (at + take).min(len);
            Proposal {
                id: "p-1".into(),
                artifact: "spec".into(),
                title: "edit".into(),
                base: 1,
                hunks: vec![Hunk {
                    at,
                    remove: lines[at..end].to_vec(),
                    add,
                }],
            }
        })
    })
}
