//! The recorded S38 sample verdicts must equal the Rust validator (IMP-36).
//!
//! `fixtures/genui-cards.json` is written by `npm run sync:fixtures` from
//! `docs/design/spekin-canvas/sample/parts/genui.mjs`. Each card carries the verdict the panel records
//! (valid, or the refusal reason). This test runs every payload through `genui::validate` and fails when
//! the record and the validator disagree, so the sample can never drift from the rules the app trusts.

use serde::Deserialize;
use serde_json::Value;
use spekin_core::genui::{GenUiValidation, validate_genui};

const CARDS: &str = include_str!("../../../fixtures/genui-cards.json");

#[derive(Debug, Deserialize)]
struct SampleCard {
    id: String,
    title: String,
    family: String,
    payload: Value,
    verdict: RecordedVerdict,
}

#[derive(Debug, Deserialize, PartialEq, Eq)]
#[serde(tag = "status", rename_all = "snake_case")]
enum RecordedVerdict {
    Valid,
    Rejected { reason: String },
}

fn cards(text: &str) -> Vec<SampleCard> {
    serde_json::from_str(text).expect("fixtures/genui-cards.json parses")
}

/// The verdict `genui::validate` reaches for one card, in the sample's recorded shape.
fn actual_verdict(payload: &Value) -> RecordedVerdict {
    let raw = serde_json::to_string(payload).expect("payload serialises");
    match validate_genui(&raw) {
        GenUiValidation::Ok { .. } => RecordedVerdict::Valid,
        GenUiValidation::Rejected { reason } => RecordedVerdict::Rejected {
            reason: reason.to_string(),
        },
    }
}

/// Every card whose recorded verdict differs from the validator, as `id: recorded -> actual`.
fn mismatches(cards: &[SampleCard]) -> Vec<String> {
    cards
        .iter()
        .filter_map(|card| {
            let actual = actual_verdict(&card.payload);
            (actual != card.verdict).then(|| {
                format!(
                    "{}: recorded {:?} -> validator {:?}",
                    card.id, card.verdict, actual
                )
            })
        })
        .collect()
}

#[test]
fn the_sample_records_both_a_valid_card_and_a_refusal() {
    let cards = cards(CARDS);
    assert!(cards.len() >= 2, "the sample holds at least two cards");
    assert!(
        cards.iter().any(|c| c.claimed_status() == "valid"),
        "one card is recorded valid"
    );
    assert!(
        cards.iter().any(|c| c.claimed_status() == "rejected"),
        "one card records a refusal"
    );
    for card in &cards {
        assert_eq!(card.payload["id"], Value::String(card.id.clone()));
        assert_eq!(card.payload["title"], Value::String(card.title.clone()));
        assert_eq!(card.payload["family"], Value::String(card.family.clone()));
    }
}

#[test]
fn every_recorded_sample_verdict_equals_genui_validate() {
    let found = mismatches(&cards(CARDS));
    assert!(
        found.is_empty(),
        "recorded verdicts must equal genui::validate:\n{}",
        found.join("\n")
    );
}

#[test]
fn a_wrong_verdict_is_caught() {
    let mut cards = cards(CARDS);
    let first = cards.first_mut().expect("a first card");
    let flipped = match first.verdict {
        RecordedVerdict::Valid => RecordedVerdict::Rejected {
            reason: "made_up_reason".into(),
        },
        RecordedVerdict::Rejected { .. } => RecordedVerdict::Valid,
    };
    first.verdict = flipped;
    let found = mismatches(&cards);
    assert_eq!(found.len(), 1, "only the tampered card is reported");
    assert!(
        found[0].starts_with(&cards[0].id),
        "the report names the card"
    );
}

impl SampleCard {
    fn claimed_status(&self) -> &'static str {
        match self.verdict {
            RecordedVerdict::Valid => "valid",
            RecordedVerdict::Rejected { .. } => "rejected",
        }
    }
}
