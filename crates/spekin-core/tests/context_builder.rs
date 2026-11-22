use std::collections::HashSet;

use proptest::prelude::*;
use spekin_core::context::{
    BoardArtifact, BoardSnapshot, ContextChip, ContextItemStatus, RequestContext, build_context,
    format_token_estimate,
};

fn meranti_board() -> BoardSnapshot {
    BoardSnapshot {
        board_id: "variance-flows".to_string(),
        items: vec![
            BoardArtifact {
                artifact_id: "F-01".to_string(),
                revision: "r4".to_string(),
                status: ContextItemStatus::Accepted,
                hidden: false,
                content: "Portfolio overview frame".to_string(),
                estimated_tokens: 2100,
            },
            BoardArtifact {
                artifact_id: "F-03".to_string(),
                revision: "r6".to_string(),
                status: ContextItemStatus::Accepted,
                hidden: false,
                content: "Variance table frame".to_string(),
                estimated_tokens: 3400,
            },
            BoardArtifact {
                artifact_id: "F-04".to_string(),
                revision: "r1".to_string(),
                status: ContextItemStatus::Draft,
                hidden: false,
                content: "Alert drawer frame".to_string(),
                estimated_tokens: 1800,
            },
            BoardArtifact {
                artifact_id: "F-05".to_string(),
                revision: "r1".to_string(),
                status: ContextItemStatus::Draft,
                hidden: true,
                content: "Hidden empty state frame".to_string(),
                estimated_tokens: 1200,
            },
        ],
    }
}

fn meranti_design_chips() -> Vec<ContextChip> {
    vec![
        ContextChip {
            artifact_id: "F-03".to_string(),
            revision: "r6".to_string(),
            status: ContextItemStatus::Accepted,
            estimated_tokens: 3400,
        },
        ContextChip {
            artifact_id: "DESIGN.md".to_string(),
            revision: "r3".to_string(),
            status: ContextItemStatus::Accepted,
            estimated_tokens: 2200,
        },
        ContextChip {
            artifact_id: "R-DASH-014".to_string(),
            revision: "r14".to_string(),
            status: ContextItemStatus::Accepted,
            estimated_tokens: 1800,
        },
        ContextChip {
            artifact_id: "REF-02".to_string(),
            revision: "r1".to_string(),
            status: ContextItemStatus::Reference,
            estimated_tokens: 2400,
        },
    ]
}

#[test]
fn request_carries_only_listed_chips_and_never_unchipped_or_hidden_frames() {
    let board = meranti_board();
    let chips = meranti_design_chips();

    let ctx: RequestContext = build_context(&chips, &board);

    let ids: Vec<&str> = ctx.items.iter().map(|i| i.artifact_id.as_str()).collect();
    assert_eq!(ids, vec!["F-03", "DESIGN.md", "R-DASH-014", "REF-02"]);
    assert!(!ids.contains(&"F-01"));
    assert!(!ids.contains(&"F-04"));
    assert!(!ids.contains(&"F-05"));
    assert_eq!(ctx.total_estimated_tokens, 9800);
    assert_eq!(format_token_estimate(ctx.total_estimated_tokens), "≈ 9.8k tokens");
}

#[test]
fn hidden_frame_is_never_included_even_if_referenced_as_a_chip() {
    let board = meranti_board();
    let chips = vec![
        ContextChip {
            artifact_id: "F-03".to_string(),
            revision: "r6".to_string(),
            status: ContextItemStatus::Accepted,
            estimated_tokens: 3400,
        },
        ContextChip {
            artifact_id: "F-05".to_string(),
            revision: "r1".to_string(),
            status: ContextItemStatus::Draft,
            estimated_tokens: 1200,
        },
    ];

    let ctx = build_context(&chips, &board);

    let ids: Vec<&str> = ctx.items.iter().map(|i| i.artifact_id.as_str()).collect();
    assert_eq!(ids, vec!["F-03"]);
    assert_eq!(ctx.total_estimated_tokens, 3400);
}

#[test]
fn removing_a_chip_changes_context_never_board_content() {
    let board = meranti_board();
    let hash_before = board.content_hash();

    let full_chips = meranti_design_chips();
    let full_ctx = build_context(&full_chips, &board);

    let trimmed_chips: Vec<ContextChip> = full_chips
        .into_iter()
        .filter(|c| c.artifact_id != "REF-02")
        .collect();
    let trimmed_ctx = build_context(&trimmed_chips, &board);

    assert_eq!(board.content_hash(), hash_before);
    assert_eq!(full_ctx.items.len(), 4);
    assert_eq!(trimmed_ctx.items.len(), 3);
    assert_eq!(trimmed_ctx.total_estimated_tokens, 7400);
    assert!(trimmed_ctx.items.iter().all(|i| i.artifact_id != "REF-02"));
}

#[test]
fn duplicate_chips_are_deduplicated_preserving_first_order() {
    let board = meranti_board();
    let chips = vec![
        ContextChip {
            artifact_id: "F-03".to_string(),
            revision: "r6".to_string(),
            status: ContextItemStatus::Accepted,
            estimated_tokens: 3400,
        },
        ContextChip {
            artifact_id: "F-03".to_string(),
            revision: "r6".to_string(),
            status: ContextItemStatus::Accepted,
            estimated_tokens: 3400,
        },
    ];

    let ctx = build_context(&chips, &board);
    assert_eq!(ctx.items.len(), 1);
    assert_eq!(ctx.total_estimated_tokens, 3400);
}

#[test]
fn empty_chip_set_produces_empty_context_with_zero_tokens() {
    let board = meranti_board();
    let ctx = build_context(&[], &board);
    assert!(ctx.items.is_empty());
    assert_eq!(ctx.total_estimated_tokens, 0);
}

fn status_strategy() -> impl Strategy<Value = ContextItemStatus> {
    prop_oneof![
        Just(ContextItemStatus::Accepted),
        Just(ContextItemStatus::Draft),
        Just(ContextItemStatus::Proposal),
        Just(ContextItemStatus::Reference),
        Just(ContextItemStatus::NeedsReview),
    ]
}

fn artifact_id_strategy() -> impl Strategy<Value = String> {
    prop_oneof![
        Just("F-01".to_string()),
        Just("F-02".to_string()),
        Just("F-03".to_string()),
        Just("F-04".to_string()),
        Just("F-05".to_string()),
        Just("DESIGN.md".to_string()),
        Just("R-DASH-014".to_string()),
        Just("REF-02".to_string()),
    ]
}

fn revision_strategy() -> impl Strategy<Value = String> {
    (1u32..20).prop_map(|n| format!("r{n}"))
}

fn board_artifact_strategy() -> impl Strategy<Value = BoardArtifact> {
    (
        artifact_id_strategy(),
        revision_strategy(),
        status_strategy(),
        any::<bool>(),
        "[a-zA-Z0-9 ]{0,40}",
        0u32..20_000,
    )
        .prop_map(
            |(artifact_id, revision, status, hidden, content, estimated_tokens)| BoardArtifact {
                artifact_id,
                revision,
                status,
                hidden,
                content,
                estimated_tokens,
            },
        )
}

fn chip_strategy() -> impl Strategy<Value = ContextChip> {
    (
        artifact_id_strategy(),
        revision_strategy(),
        status_strategy(),
        0u32..20_000,
    )
        .prop_map(|(artifact_id, revision, status, estimated_tokens)| ContextChip {
            artifact_id,
            revision,
            status,
            estimated_tokens,
        })
}

proptest! {
    #[test]
    fn every_output_item_is_in_the_chip_set_and_never_hidden(
        board_items in prop::collection::vec(board_artifact_strategy(), 0..12),
        chips in prop::collection::vec(chip_strategy(), 0..12),
    ) {
        let board = BoardSnapshot {
            board_id: "prop-board".to_string(),
            items: board_items,
        };
        let hash_before = board.content_hash();

        let ctx = build_context(&chips, &board);

        let chip_keys: HashSet<(&str, &str)> = chips
            .iter()
            .map(|c| (c.artifact_id.as_str(), c.revision.as_str()))
            .collect();
        let hidden_ids: HashSet<&str> = board
            .items
            .iter()
            .filter(|item| item.hidden)
            .map(|item| item.artifact_id.as_str())
            .collect();

        for item in &ctx.items {
            prop_assert!(
                chip_keys.contains(&(item.artifact_id.as_str(), item.revision.as_str())),
                "output item {:?} was not in the input chip set",
                item
            );
            prop_assert!(
                !hidden_ids.contains(item.artifact_id.as_str()),
                "hidden frame {:?} leaked into request context",
                item.artifact_id
            );
        }

        let expected_tokens: u32 = ctx
            .items
            .iter()
            .fold(0u32, |acc, item| acc.saturating_add(item.estimated_tokens));
        prop_assert_eq!(ctx.total_estimated_tokens, expected_tokens);
        prop_assert_eq!(board.content_hash(), hash_before);
    }

    #[test]
    fn removing_any_chip_never_changes_board_hash(
        board_items in prop::collection::vec(board_artifact_strategy(), 1..8),
        chips in prop::collection::vec(chip_strategy(), 1..8),
        remove_idx in 0usize..8,
    ) {
        let board = BoardSnapshot {
            board_id: "prop-board".to_string(),
            items: board_items,
        };
        let hash_before = board.content_hash();

        let _full = build_context(&chips, &board);
        let idx = remove_idx % chips.len();
        let mut shorter = chips.clone();
        shorter.remove(idx);
        let _after = build_context(&shorter, &board);

        prop_assert_eq!(board.content_hash(), hash_before);
    }
}
