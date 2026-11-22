use spekin_core::genui::{
    GenUiFamily, GenUiValidation, MAX_ITEMS, MAX_NESTING_DEPTH, Provenance, RejectionReason,
    validate_genui, validate_genui_json,
};

fn valid_checklist_json() -> &'static str {
    r#"{
        "schema_version": 1,
        "id": "AC-DASH-019",
        "title": "Alert after 2 periods over 3%",
        "provenance": "imported_observation",
        "family": "checklist",
        "items": [
            { "id": "i1", "label": "Alert raised after 2 periods over 3%", "checked": false, "status": "untested" },
            { "id": "i2", "label": "Threshold read from accepted spec r14", "checked": true, "status": "passed_fixture" }
        ],
        "summary": "1 of 2 passed.",
        "links": ["/p/meranti-yard/design"],
        "actions": [
            { "kind": "expand_details", "label": "Details", "target_id": "AC-DASH-019" },
            { "kind": "pin", "label": "Pin", "target_id": "AC-DASH-019" }
        ]
    }"#
}

#[test]
fn valid_cards_for_all_three_families_pass() {
    let ck = validate_genui_json(valid_checklist_json()).expect("valid checklist");
    assert_eq!(ck.provenance, Provenance::ImportedObservation);
    assert!(matches!(ck.content, GenUiFamily::Checklist { .. }));

    let cmp_json = r#"{
        "schema_version": 1,
        "id": "ALT-F03",
        "title": "3 takes of the drawer, same data",
        "provenance": "model_proposal",
        "family": "comparison",
        "options": [
            { "id": "t1", "label": "Take 1 · Drawer from the right", "badge": "Baseline", "recommended": false },
            { "id": "t2", "label": "Take 2 · Banner above the table", "badge": "1 more click", "recommended": false }
        ],
        "baseline_id": "t1",
        "links": [],
        "actions": [{ "kind": "compare", "label": "Compare", "target_id": "ALT-F03" }]
    }"#;
    let cmp = validate_genui_json(cmp_json).expect("valid comparison");
    assert!(matches!(cmp.content, GenUiFamily::Comparison { .. }));

    let q_json = r#"{
        "schema_version": 1,
        "id": "Q-02",
        "title": "Before I draw the drawer",
        "provenance": "model_proposal",
        "family": "question",
        "step": 2,
        "total_steps": 4,
        "prompt": "When should a package raise an alert?",
        "why": "R-DASH-014 sets the 3% threshold.",
        "options": [
            { "id": "o1", "label": "After 2 periods over 3%", "hint": "Fewest false alerts.", "recommended": true },
            { "id": "o2", "label": "On the first period over 3%", "recommended": false }
        ],
        "allow_custom": true,
        "links": [],
        "actions": [{ "kind": "skip_question", "label": "Skip" }]
    }"#;
    let q = validate_genui(q_json);
    assert!(matches!(q, GenUiValidation::Ok { .. }));
}

#[test]
fn ac_spk_25_rejects_unknown_component_and_invalid_enum() {
    let unknown = r#"{
        "schema_version": 1,
        "id": "X-1",
        "title": "Custom widget",
        "provenance": "model_proposal",
        "family": "arbitrary_iframe",
        "links": [],
        "actions": []
    }"#;
    assert!(matches!(
        validate_genui_json(unknown),
        Err(RejectionReason::UnknownComponent { .. })
    ));

    let bad_enum = valid_checklist_json().replace("imported_observation", "admin_override");
    assert!(matches!(
        validate_genui_json(&bad_enum),
        Err(RejectionReason::InvalidEnum { .. })
    ));

    let bad_status = valid_checklist_json().replace("passed_fixture", "verified_by_magic");
    assert!(matches!(
        validate_genui_json(&bad_status),
        Err(RejectionReason::InvalidEnum { .. })
    ));
}

#[test]
fn ac_spk_25_rejects_excessive_nesting_and_item_counts() {
    let mut nested = String::from("1");
    for _ in 0..=MAX_NESTING_DEPTH + 2 {
        nested = format!("{{\"a\":{nested}}}");
    }
    assert!(matches!(
        validate_genui_json(&nested),
        Err(RejectionReason::ExcessiveNesting { .. })
    ));

    let items: Vec<String> = (0..=MAX_ITEMS)
        .map(|i| {
            format!(r#"{{"id":"i{i}","label":"Item {i}","checked":false,"status":"untested"}}"#)
        })
        .collect();
    let too_many = format!(
        r#"{{
            "schema_version": 1,
            "id": "BIG-1",
            "title": "Too many items",
            "provenance": "model_proposal",
            "family": "checklist",
            "items": [{}],
            "links": [],
            "actions": []
        }}"#,
        items.join(",")
    );
    assert!(matches!(
        validate_genui_json(&too_many),
        Err(RejectionReason::TooManyItems { .. })
    ));
}

#[test]
fn ac_spk_25_rejects_unsafe_urls_scripts_tools_and_privilege_escalation() {
    for bad_url in [
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "file:///etc/passwd",
        "//evil.example/phish",
    ] {
        let json = valid_checklist_json().replace("/p/meranti-yard/design", bad_url);
        let res = validate_genui_json(&json);
        assert!(
            matches!(
                res,
                Err(RejectionReason::UnsafeUrl { .. })
                    | Err(RejectionReason::DisallowedScriptOrTool { .. })
            ),
            "expected rejection for url {bad_url}, got {res:?}"
        );
    }

    for payload in [
        "<script>alert(1)</script>",
        "Run bash -c 'cat /etc/passwd'",
        "Invoke mcp__hub__delete_project now",
        "eval(window.location)",
    ] {
        let json = valid_checklist_json().replace("1 of 2 passed.", payload);
        assert!(
            matches!(
                validate_genui_json(&json),
                Err(RejectionReason::DisallowedScriptOrTool { .. })
            ),
            "expected script/tool rejection for {payload}"
        );
    }

    for priv_action in [
        "accept_spec",
        "deploy",
        "spend_credits",
        "run_shell",
        "grant_admin",
    ] {
        let json =
            valid_checklist_json().replace("\"expand_details\"", &format!("\"{priv_action}\""));
        assert!(
            matches!(
                validate_genui_json(&json),
                Err(RejectionReason::PrivilegeEscalation { .. })
            ),
            "expected privilege escalation rejection for {priv_action}"
        );
    }
}

#[test]
fn imp_28_failing_case_data_url_in_text_field_is_rejected() {
    // Exact failing case found by the IMP-28 fuzzer: a data: URL in actions[].label.
    let raw = r#"{"actions":[{"href":"https://example.com/details","kind":"expand_details","label":"data:text/plain,hello","target_id":"CK-1"}],"body":"Threshold from accepted spec r14.","family":"checklist","id":"CK-1","items":[{"checked":false,"id":"i1","label":"Alert raised","status":"untested"},{"checked":true,"id":"i2","label":"Threshold read from spec","status":"passed_fixture"}],"links":["https://example.com/spec/r14"],"provenance":"imported_observation","schema_version":1,"summary":"1 of 2 passed.","title":"Alert after 2 periods over 3%"}"#;
    assert!(matches!(
        validate_genui(raw),
        GenUiValidation::Rejected {
            reason: RejectionReason::DisallowedScriptOrTool { .. }
        }
    ));
}

#[test]
fn imp_28_unsafe_urls_are_rejected_in_every_string_field() {
    // Plain-text fields, not just links/href, must reject dangerous schemes and
    // absolute non-https URLs (AC-SPK-25, R-GUI-2/8).
    for payload in [
        "data:text/plain,hello",
        "file:///etc/passwd",
        "http://example.com/insecure",
        "ftp://example.com/file",
    ] {
        let json = valid_checklist_json().replace("1 of 2 passed.", payload);
        assert!(
            matches!(
                validate_genui_json(&json),
                Err(RejectionReason::UnsafeUrl { .. })
                    | Err(RejectionReason::DisallowedScriptOrTool { .. })
            ),
            "expected rejection for embedded URL {payload}"
        );
    }
    // Word boundaries keep ordinary words legitimate.
    let ok = valid_checklist_json().replace("1 of 2 passed.", "Metadata and updates: see notes.");
    assert!(validate_genui_json(&ok).is_ok());
}

#[test]
fn rejects_unsupported_schema_version_and_never_returns_partial_render() {
    let v99 = valid_checklist_json().replace("\"schema_version\": 1", "\"schema_version\": 99");
    assert!(matches!(
        validate_genui(&v99),
        GenUiValidation::Rejected {
            reason: RejectionReason::UnsupportedSchemaVersion {
                found: 99,
                expected: 1
            }
        }
    ));

    let truncated = &valid_checklist_json()[..40];
    assert!(matches!(
        validate_genui(truncated),
        GenUiValidation::Rejected {
            reason: RejectionReason::InvalidJson { .. }
        }
    ));
}
