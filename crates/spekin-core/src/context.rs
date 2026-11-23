//! Next-request context builder for S29 and S35 (DPAI addendum, point 1).
//!
//! Pure functions only: building a request context never mutates the board,
//! never sends a request, never accepts a proposal, and never touches the ledger.

use std::collections::HashSet;

use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Status of an artifact shown in a context chip or on a board (S29, S35).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ContextItemStatus {
    Accepted,
    Draft,
    Proposal,
    Reference,
    NeedsReview,
}

impl ContextItemStatus {
    fn as_tag(self) -> &'static str {
        match self {
            ContextItemStatus::Accepted => "accepted",
            ContextItemStatus::Draft => "draft",
            ContextItemStatus::Proposal => "proposal",
            ContextItemStatus::Reference => "reference",
            ContextItemStatus::NeedsReview => "needs_review",
        }
    }
}

/// One removable context chip listed in the chat context basket or canvas strip (S29, S35 F106).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ContextChip {
    pub artifact_id: String,
    pub revision: String,
    pub status: ContextItemStatus,
    pub estimated_tokens: u32,
}

/// One artifact currently present on a board (S29).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct BoardArtifact {
    pub artifact_id: String,
    pub revision: String,
    pub status: ContextItemStatus,
    pub hidden: bool,
    pub content: String,
    pub estimated_tokens: u32,
}

/// Immutable snapshot of a board used when building a request context.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct BoardSnapshot {
    pub board_id: String,
    pub items: Vec<BoardArtifact>,
}

impl BoardSnapshot {
    /// Deterministic content hash of the board state, used to verify that
    /// context selection or chip removal never mutates board content.
    pub fn content_hash(&self) -> String {
        let mut h: u64 = 0xcbf2_9ce4_8422_2325;
        fnv_str(&mut h, &self.board_id);
        for item in &self.items {
            fnv_byte(&mut h, 0x1e);
            fnv_str(&mut h, &item.artifact_id);
            fnv_byte(&mut h, 0x1f);
            fnv_str(&mut h, &item.revision);
            fnv_byte(&mut h, 0x1f);
            fnv_str(&mut h, item.status.as_tag());
            fnv_byte(&mut h, 0x1f);
            fnv_byte(&mut h, u8::from(item.hidden));
            fnv_byte(&mut h, 0x1f);
            fnv_str(&mut h, &item.content);
            fnv_byte(&mut h, 0x1f);
            for b in item.estimated_tokens.to_le_bytes() {
                fnv_byte(&mut h, b);
            }
        }
        format!("{h:016x}")
    }
}

/// One artifact entry carried in the next model request.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct RequestContextItem {
    pub artifact_id: String,
    pub revision: String,
    pub status: ContextItemStatus,
    pub estimated_tokens: u32,
}

/// Pure payload context for the next request: carries only the listed chips,
/// never hidden frames or the whole board.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct RequestContext {
    pub items: Vec<RequestContextItem>,
    pub total_estimated_tokens: u32,
}

/// Build the next-request context from the explicitly listed chips and a board snapshot.
///
/// Guarantees:
/// - Every item in the returned `RequestContext` comes from `chips`.
/// - Hidden frames on `board` are never included, even if listed in `chips`.
/// - Unchipped frames on `board` are never included.
/// - Duplicate `(artifact_id, revision)` chips are deduplicated while preserving order.
/// - `total_estimated_tokens` is the sum of the included chips' token estimates.
/// - Pure: borrows both inputs immutably, with no ledger, proposal, or IO side effects.
pub fn build_context(chips: &[ContextChip], board: &BoardSnapshot) -> RequestContext {
    let hidden_ids: HashSet<&str> = board
        .items
        .iter()
        .filter(|item| item.hidden)
        .map(|item| item.artifact_id.as_str())
        .collect();

    let mut seen: HashSet<(&str, &str)> = HashSet::new();
    let mut items = Vec::with_capacity(chips.len());
    let mut total_estimated_tokens: u32 = 0;

    for chip in chips {
        if hidden_ids.contains(chip.artifact_id.as_str()) {
            continue;
        }
        if !seen.insert((chip.artifact_id.as_str(), chip.revision.as_str())) {
            continue;
        }
        total_estimated_tokens = total_estimated_tokens.saturating_add(chip.estimated_tokens);
        items.push(RequestContextItem {
            artifact_id: chip.artifact_id.clone(),
            revision: chip.revision.clone(),
            status: chip.status,
            estimated_tokens: chip.estimated_tokens,
        });
    }

    RequestContext {
        items,
        total_estimated_tokens,
    }
}

/// Format a token estimate for display (e.g. `9800` → `"≈ 9.8k tokens"` on S35).
pub fn format_token_estimate(tokens: u32) -> String {
    if tokens >= 1_000 {
        let tenths = (u64::from(tokens) + 50) / 100;
        let whole = tenths / 10;
        let frac = tenths % 10;
        format!("≈ {whole}.{frac}k tokens")
    } else {
        format!("≈ {tokens} tokens")
    }
}

fn fnv_byte(h: &mut u64, b: u8) {
    *h ^= u64::from(b);
    *h = h.wrapping_mul(0x0000_0100_0000_01b3);
}

fn fnv_str(h: &mut u64, s: &str) {
    for &b in s.as_bytes() {
        fnv_byte(h, b);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn token_estimate_formats_small_and_thousands() {
        assert_eq!(format_token_estimate(0), "≈ 0 tokens");
        assert_eq!(format_token_estimate(640), "≈ 640 tokens");
        assert_eq!(format_token_estimate(9_800), "≈ 9.8k tokens");
        assert_eq!(format_token_estimate(12_049), "≈ 12.0k tokens");
        assert_eq!(format_token_estimate(12_050), "≈ 12.1k tokens");
    }

    #[test]
    fn board_content_hash_changes_when_content_changes() {
        let mut board = BoardSnapshot {
            board_id: "b1".to_string(),
            items: vec![BoardArtifact {
                artifact_id: "F-03".to_string(),
                revision: "r6".to_string(),
                status: ContextItemStatus::Accepted,
                hidden: false,
                content: "v1".to_string(),
                estimated_tokens: 100,
            }],
        };
        let h1 = board.content_hash();
        board.items[0].content = "v2".to_string();
        let h2 = board.content_hash();
        assert_ne!(h1, h2);
    }
}
