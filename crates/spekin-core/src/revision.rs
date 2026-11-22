use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// A numbered, accepted version of one artifact (r6, r14 in the boards). Content is the whole
/// artifact text at that revision; `hash` is derived from it, never stored separately.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Revision {
    /// Revision number, starting at 1. Shown with an r in front: `label()` gives "r14".
    pub n: u32,
    /// The artifact content at this revision, exactly as accepted.
    pub content: String,
}

impl Revision {
    /// The first accepted revision of an artifact (r1).
    pub fn first(content: impl Into<String>) -> Self {
        Self {
            n: 1,
            content: content.into(),
        }
    }

    /// The revision after this one, holding new content. Accepting a proposal and reverting both
    /// come through here, so a number is never reused (R-EDT-1).
    pub fn next(&self, content: impl Into<String>) -> Self {
        Self {
            n: self.n + 1,
            content: content.into(),
        }
    }

    /// How the boards and the PRD write a revision: "r14".
    pub fn label(&self) -> String {
        format!("r{}", self.n)
    }

    /// A stable content hash (FNV-1a 64, lowercase hex). Equal content always hashes the same, so a
    /// revert can be checked by hash. It is a change detector, not a security hash.
    pub fn hash(&self) -> String {
        let mut h: u64 = 0xcbf2_9ce4_8422_2325;
        for b in self.content.as_bytes() {
            h ^= u64::from(*b);
            h = h.wrapping_mul(0x0000_0100_0000_01b3);
        }
        format!("{h:016x}")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn revisions_number_from_one_and_label_with_an_r() {
        let r1 = Revision::first("a");
        assert_eq!((r1.n, r1.label()), (1, "r1".to_string()));
        assert_eq!(r1.next("b").label(), "r2");
    }

    #[test]
    fn the_hash_depends_on_the_content_only() {
        assert_eq!(
            Revision::first("a\nb").hash(),
            Revision::first("a\nb").hash()
        );
        assert_ne!(
            Revision::first("a\nb").hash(),
            Revision::first("a\nc").hash()
        );
        assert_eq!(Revision::first("").hash().len(), 16);
    }
}
