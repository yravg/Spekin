use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::revision::Revision;

/// One changed region of an artifact, as line numbers against the base revision.
/// `remove` must equal the base lines at `at` exactly; otherwise the diff is not exact and
/// accepting it fails (Mismatch) instead of guessing.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Hunk {
    /// 0-based line index in the base revision where the hunk starts.
    pub at: usize,
    /// The lines that must be there now. Empty for a pure insert.
    pub remove: Vec<String>,
    /// The lines that replace them. Empty for a pure delete.
    pub add: Vec<String>,
}

/// A suggested change to one artifact, shown as an exact diff against one base revision.
/// Nothing changes until it is accepted (R-EDT-1).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Proposal {
    pub id: String,
    /// The artifact this proposal changes, for example "spec" or "F-03".
    pub artifact: String,
    pub title: String,
    /// The revision number this diff was written against. If the artifact has moved on, the
    /// proposal is stale and can never be applied (AC-SPK-5).
    pub base: u32,
    pub hunks: Vec<Hunk>,
}

/// Why a proposal or a revert was refused. A refusal never leaves a half-applied revision.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS, thiserror::Error)]
#[ts(export)]
pub enum ProposalError {
    /// The base revision is not the current one: the proposal needs review, not silent application.
    #[error("proposal is against r{base} but the artifact is at r{current}")]
    Stale { base: u32, current: u32 },
    /// The base lines at a hunk are not what the proposal says they are.
    #[error("the base revision does not hold the lines this hunk removes at line {at}")]
    Mismatch { at: usize },
    /// A hunk points past the end of the base revision.
    #[error("hunk starts at line {at}, past the end of the base revision")]
    OutOfRange { at: usize },
    /// Two hunks change the same lines, so the diff is ambiguous.
    #[error("hunks overlap at line {at}")]
    Overlap { at: usize },
    /// A revert must point at an earlier revision.
    #[error("cannot revert from r{from} to r{to}: the target is not earlier")]
    NotEarlier { from: u32, to: u32 },
}

/// The record of a rejected proposal, kept for the audit row the boards draw (S33).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Rejection {
    pub id: String,
    /// The revision the rejected proposal was written against.
    pub base: u32,
    /// Why it was rejected, in the reviewer's words.
    pub reason: String,
}

/// Accept a proposal against the current revision, giving the next revision.
/// Pure: the same inputs always give the same result, and the current revision is not modified.
pub fn accept(current: &Revision, proposal: &Proposal) -> Result<Revision, ProposalError> {
    if proposal.base != current.n {
        return Err(ProposalError::Stale {
            base: proposal.base,
            current: current.n,
        });
    }
    Ok(current.next(apply(&current.content, &proposal.hunks)?))
}

/// Reject a proposal, recording the reason. No revision is made and no content changes.
pub fn reject(proposal: &Proposal, reason: impl Into<String>) -> Rejection {
    Rejection {
        id: proposal.id.clone(),
        base: proposal.base,
        reason: reason.into(),
    }
}

/// Revert to an earlier revision by accepting its content again as a new revision (r2 → r3 that
/// holds r1's content), so the history is never rewritten.
pub fn revert(current: &Revision, to: &Revision) -> Result<Revision, ProposalError> {
    if to.n >= current.n {
        return Err(ProposalError::NotEarlier {
            from: current.n,
            to: to.n,
        });
    }
    Ok(current.next(to.content.clone()))
}

/// Apply exact hunks to the base content. Lines are split on '\n' and joined the same way, so a
/// trailing newline survives unchanged. Nothing is applied unless every hunk checks out.
fn apply(content: &str, hunks: &[Hunk]) -> Result<String, ProposalError> {
    let mut lines: Vec<String> = content.split('\n').map(str::to_string).collect();

    let mut ordered: Vec<&Hunk> = hunks.iter().collect();
    ordered.sort_by_key(|h| h.at);
    let mut previous_end = 0usize;
    for h in &ordered {
        if h.at < previous_end {
            return Err(ProposalError::Overlap { at: h.at });
        }
        previous_end = h.at + h.remove.len();
    }

    // Latest hunk first, so the line numbers of the earlier ones stay valid.
    for h in ordered.iter().rev() {
        let end = h.at + h.remove.len();
        if end > lines.len() {
            return Err(ProposalError::OutOfRange { at: h.at });
        }
        if lines[h.at..end] != h.remove[..] {
            return Err(ProposalError::Mismatch { at: h.at });
        }
        lines.splice(h.at..end, h.add.iter().cloned());
    }

    Ok(lines.join("\n"))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn p(base: u32, hunks: Vec<Hunk>) -> Proposal {
        Proposal {
            id: "p-1".into(),
            artifact: "spec".into(),
            title: "t".into(),
            base,
            hunks,
        }
    }

    #[test]
    fn a_proposal_serialises_with_the_names_the_ui_reads() {
        let json = serde_json::to_value(p(
            3,
            vec![Hunk {
                at: 0,
                remove: vec!["a".into()],
                add: vec!["b".into()],
            }],
        ))
        .unwrap();
        assert_eq!(json["base"], 3);
        assert_eq!(json["hunks"][0]["at"], 0);
        assert_eq!(json["hunks"][0]["remove"][0], "a");
    }

    #[test]
    fn an_empty_diff_accepts_unchanged_content() {
        let current = Revision::first("a\nb");
        let next = accept(&current, &p(1, vec![])).unwrap();
        assert_eq!(next.content, current.content);
        assert_eq!(next.hash(), current.hash());
        assert_eq!(next.n, 2, "accepting still makes a new revision");
    }

    #[test]
    fn a_pure_insert_and_a_pure_delete_work() {
        let current = Revision::first("a\nc");
        let inserted = accept(
            &current,
            &p(
                1,
                vec![Hunk {
                    at: 1,
                    remove: vec![],
                    add: vec!["b".into()],
                }],
            ),
        )
        .unwrap();
        assert_eq!(inserted.content, "a\nb\nc");

        let deleted = accept(
            &inserted,
            &p(
                2,
                vec![Hunk {
                    at: 1,
                    remove: vec!["b".into()],
                    add: vec![],
                }],
            ),
        )
        .unwrap();
        assert_eq!(deleted.content, "a\nc");
    }

    #[test]
    fn hunks_apply_from_the_bottom_up_without_shifting() {
        let current = Revision::first("1\n2\n3\n4");
        let next = accept(
            &current,
            &p(
                1,
                vec![
                    Hunk {
                        at: 0,
                        remove: vec!["1".into()],
                        add: vec!["one".into()],
                    },
                    Hunk {
                        at: 3,
                        remove: vec!["4".into()],
                        add: vec!["four".into()],
                    },
                ],
            ),
        )
        .unwrap();
        assert_eq!(next.content, "one\n2\n3\nfour");
    }
}
