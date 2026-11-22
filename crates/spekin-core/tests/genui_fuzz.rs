//! IMP-28: property/fuzz hardening of the fail-closed GenUI validator (IMP-10).
//!
//! `validate_genui` must never panic, must return either a complete validated card or a
//! rejection (never a partial card), must survive a serialise/re-validate round trip, and
//! must never accept a card carrying an unsafe URL or a script-like string anywhere.
//!
//! Case count: 2 000 by default (CI, plain `cargo test`). For the full local run set
//! `SPEKIN_GENUI_FUZZ_CASES=50000 cargo test -p spekin-core --test genui_fuzz`.

use proptest::collection::vec as pvec;
use proptest::prelude::*;
use serde_json::{Map, Value, json};
use spekin_core::genui::{GenUiCard, GenUiFamily, GenUiValidation, validate_genui};

/// Default is the CI budget; the env var raises it for local fuzzing.
fn fuzz_config() -> proptest::test_runner::Config {
    let cases = match std::env::var("SPEKIN_GENUI_FUZZ_CASES") {
        Ok(raw) => raw
            .parse()
            .expect("SPEKIN_GENUI_FUZZ_CASES must be a number"),
        Err(_) => 2_000,
    };
    proptest::test_runner::Config {
        cases,
        ..proptest::test_runner::Config::default()
    }
}

/// Hostile fragments placed into every string field of otherwise valid cards.
/// The first ones are deliberately the least obvious: no `<script`, no `javascript:`,
/// so only a scheme-aware check (not the legacy substring scan) can reject them.
const HOSTILE: &[&str] = &[
    "data:text/plain,hello",
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg==",
    "data:,",
    "DATA:text/html;base64,PHNjcmlwdD4=",
    " file:///etc/passwd ",
    "file:///etc/hosts",
    "javascript:alert(1)",
    "vbscript:msgbox(1)",
    "<script>alert(1)</script>",
    "x\" onerror=\"alert(1)",
    "onload=alert(1)",
    "eval(document.cookie)",
    "window.location='//evil.example'",
    "bash -c 'cat /etc/passwd'",
    "mcp__hub__delete_project",
    "tool_use: exec_command",
    "//evil.example/phish",
    "https://example.com/path?x=<img src=x onerror=alert(1)>",
    "😀🧪 ＨＴＴＰＳ://evil.example ẞ ß",
    "\u{202e}https://evil.example",
];

fn hostile_string() -> impl Strategy<Value = String> {
    prop_oneof![
        (0..HOSTILE.len()).prop_map(|i| HOSTILE[i].to_owned()),
        pvec(any::<char>(), 0..24).prop_map(|chars| chars.into_iter().collect::<String>()),
        Just("x".repeat(2_100)),
    ]
}

/// Arbitrary JSON with hostile strings and mixed types (bounded nesting; the deeply
/// nested case is generated separately as text).
fn arbitrary_json() -> impl Strategy<Value = Value> {
    prop_oneof![
        Just(Value::Null),
        any::<bool>().prop_map(Value::Bool),
        any::<i64>().prop_map(|n| Value::Number(n.into())),
        hostile_string().prop_map(Value::String),
        pvec(arbitrary_leaf(), 0..5).prop_map(Value::Array),
        pvec((hostile_string(), arbitrary_leaf()), 0..5).prop_map(|entries| {
            Value::Object(entries.into_iter().collect::<Map<String, Value>>())
        }),
        pvec(pvec((hostile_string(), arbitrary_leaf()), 0..3), 0..3).prop_map(|groups| {
            let mut obj = Map::new();
            for (i, group) in groups.into_iter().enumerate() {
                obj.insert(format!("g{i}"), Value::Object(group.into_iter().collect()));
            }
            Value::Object(obj)
        }),
    ]
}

fn arbitrary_leaf() -> impl Strategy<Value = Value> {
    prop_oneof![
        Just(Value::Null),
        any::<bool>().prop_map(Value::Bool),
        any::<i64>().prop_map(|n| Value::Number(n.into())),
        hostile_string().prop_map(Value::String),
    ]
}

fn deeply_nested_json() -> impl Strategy<Value = String> {
    (0..60usize).prop_map(|n| {
        let mut s = String::from("1");
        for _ in 0..n {
            s = format!("[{s}]");
        }
        s
    })
}

/// Valid card templates from all three families, used so fuzzing reaches the accept path.
fn template_cards() -> impl Strategy<Value = Value> {
    prop_oneof![
        Just(json!({
            "schema_version": 1, "id": "CK-1", "title": "Alert after 2 periods over 3%",
            "provenance": "imported_observation", "family": "checklist",
            "body": "Threshold from accepted spec r14.", "summary": "1 of 2 passed.",
            "items": [
                {"id": "i1", "label": "Alert raised", "checked": false, "status": "untested"},
                {"id": "i2", "label": "Threshold read from spec", "checked": true, "status": "passed_fixture"}
            ],
            "links": ["https://example.com/spec/r14"],
            "actions": [
                {"kind": "expand_details", "label": "Details", "target_id": "CK-1", "href": "https://example.com/details"}
            ]
        })),
        Just(json!({
            "schema_version": 1, "id": "CMP-1", "title": "Same data, three takes",
            "provenance": "model_proposal", "family": "comparison",
            "options": [
                {"id": "t1", "label": "Drawer", "badge": "Baseline"},
                {"id": "t2", "label": "Banner", "summary": "One more click", "recommended": true}
            ],
            "baseline_id": "t1", "links": [],
            "actions": [{"kind": "compare", "label": "Compare"}]
        })),
        Just(json!({
            "schema_version": 1, "id": "Q-1", "title": "Before I draw",
            "provenance": "model_proposal", "family": "question",
            "step": 2, "total_steps": 4, "prompt": "When should a package raise an alert?",
            "why": "R-DASH-014 sets the 3% threshold.", "allow_custom": true,
            "options": [{"id": "o1", "label": "After 2 periods", "hint": "Fewest false alerts."}],
            "links": [], "actions": [{"kind": "skip_question", "label": "Skip"}]
        })),
    ]
}

fn string_leaf_count(v: &Value) -> usize {
    match v {
        Value::String(_) => 1,
        Value::Array(items) => items.iter().map(string_leaf_count).sum(),
        Value::Object(map) => map.values().map(string_leaf_count).sum(),
        _ => 0,
    }
}

fn replace_nth_string(v: &mut Value, payload: &str, target: usize, seen: &mut usize) {
    match v {
        Value::String(s) => {
            if *seen == target {
                *s = payload.to_owned();
            }
            *seen += 1;
        }
        Value::Array(items) => {
            for item in items {
                replace_nth_string(item, payload, target, seen);
            }
        }
        Value::Object(map) => {
            for value in map.values_mut() {
                replace_nth_string(value, payload, target, seen);
            }
        }
        _ => {}
    }
}

/// A valid card with one hostile payload injected into one of its string fields,
/// including URLs (`links`, `actions[].href`) and plain text (`title`, `body`, labels).
fn hostile_card_json() -> impl Strategy<Value = String> {
    (template_cards(), 0..HOSTILE.len(), any::<u16>()).prop_map(|(mut card, pi, idx)| {
        let leaves = string_leaf_count(&card);
        if leaves > 0 {
            let target = usize::from(idx) % leaves;
            let mut seen = 0;
            replace_nth_string(&mut card, HOSTILE[pi], target, &mut seen);
        }
        card.to_string()
    })
}

fn fuzz_raw_json() -> impl Strategy<Value = String> {
    prop_oneof![
        arbitrary_json().prop_map(|v| v.to_string()),
        deeply_nested_json(),
        hostile_card_json(),
    ]
}

/// Security policy independent of the validator's internals: reject script/tool patterns
/// and dangerous URL schemes, whether they are the whole field or embedded in text.
fn contains_unsafe_string(s: &str) -> bool {
    const NASTY: &[&str] = &[
        "<script",
        "</script",
        "javascript:",
        "vbscript:",
        "onerror=",
        "onload=",
        "eval(",
        "document.cookie",
        "window.location",
        "bash -c",
        "sh -c",
        "rm -rf",
        "mcp__",
        "exec_command",
        "run_shell",
        "child_process",
        "tool_call",
        "tool_use",
    ];
    let lower = s.to_ascii_lowercase();
    if NASTY.iter().any(|pat| lower.contains(pat)) {
        return true;
    }
    // A scheme is dangerous when it appears at a word boundary, so "metadata:" and
    // "update:" are not falsely rejected.
    for scheme in ["data:", "file:"] {
        let mut start = 0;
        while let Some(rel) = lower[start..].find(scheme) {
            let i = start + rel;
            if i == 0 || !lower.as_bytes()[i - 1].is_ascii_alphanumeric() {
                return true;
            }
            start = i + scheme.len();
        }
    }
    // Every absolute URL (`scheme://...`) in an accepted card must use https.
    // Relative paths have no "://" and stay allowed, as in the IMP-10 fixture links.
    let mut start = 0;
    while let Some(rel) = lower[start..].find("://") {
        let i = start + rel;
        let before = &lower[..i];
        let scheme_start = before
            .char_indices()
            .rev()
            .find(|(_, c)| !matches!(c, 'a'..='z' | '0'..='9' | '+' | '-' | '.'))
            .map_or(0, |(idx, c)| idx + c.len_utf8());
        if &lower[scheme_start..i] != "https" {
            return true;
        }
        start = i + 3;
    }
    false
}

fn walk_strings(value: &Value, visit: &mut impl FnMut(&str)) {
    match value {
        Value::String(s) => visit(s),
        Value::Array(items) => {
            for item in items {
                walk_strings(item, visit);
            }
        }
        Value::Object(map) => {
            for value in map.values() {
                walk_strings(value, visit);
            }
        }
        _ => {}
    }
}

fn card_is_complete(card: &GenUiCard) -> bool {
    if card.id.trim().is_empty() || card.title.trim().is_empty() {
        return false;
    }
    match &card.content {
        GenUiFamily::Checklist { items, .. } => !items.is_empty(),
        GenUiFamily::Comparison { options, .. } => !options.is_empty(),
        GenUiFamily::Question {
            step,
            total_steps,
            prompt,
            options,
            ..
        } => {
            !prompt.trim().is_empty()
                && !options.is_empty()
                && *step > 0
                && *total_steps > 0
                && *step <= *total_steps
        }
    }
}

proptest! {
    #![proptest_config(fuzz_config())]

    /// All four IMP-28 properties in one pass: no panic (a panic fails the test),
    /// full-card-or-rejection, round-trip stability, no unsafe URL/script in an
    /// accepted card.
    #[test]
    fn arbitrary_json_never_yields_an_unsafe_or_partial_card(raw in fuzz_raw_json()) {
        if let GenUiValidation::Ok { card } = validate_genui(&raw) {
            prop_assert!(card_is_complete(&card), "partial card accepted from: {raw}");

            let again = serde_json::to_string(&card).expect("accepted card must serialise");
            prop_assert!(
                matches!(validate_genui(&again), GenUiValidation::Ok { .. }),
                "round trip rejected an accepted card: {again}"
            );

            let as_value = serde_json::to_value(&card).expect("accepted card must be JSON");
            let mut unsafe_strings = Vec::new();
            walk_strings(&as_value, &mut |s| {
                if contains_unsafe_string(s) {
                    unsafe_strings.push(s.to_owned());
                }
            });
            prop_assert!(
                unsafe_strings.is_empty(),
                "accepted card with unsafe strings {unsafe_strings:?} from: {raw}"
            );
        }
    }
}
