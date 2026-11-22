# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-03 | `imp-03-api-source` (PR #1) | open (in PR #1) | – | – |
| IMP-04 | `imp-04-proposals` (PR #2) | open (in PR #2) | – | – |
| IMP-12 | `imp-12-licences` (PR #4) | done (in PR #4) | – | – |
| IMP-11 | `imp-11-model-sources` (PR #5) | done (in PR #5) | – | – |
| IMP-10 | `imp-10-genui-validate` | done | `cargo test --workspace` (17 unit/ts-rs + 5 `tests/genui.rs` + 2 server tests pass); `npm run gate` passes | TS fallback renderer and S38 UI wiring (later UI card) |
| IMP-28 | `imp-28-genui-fuzz` (stacked on IMP-10) | done | `arbitrary_json_never_yields_an_unsafe_or_partial_card` (2 000 default; 50 000 with `SPEKIN_GENUI_FUZZ_CASES=50000`, both pass); `imp_28_failing_case_data_url_in_text_field_is_rejected`; `imp_28_unsafe_urls_are_rejected_in_every_string_field`; `npm run gate` exit 0 | CI run of the PR (not observed); repeated 50 000-case runs with other seeds; Windows/Linux; S38 TS fallback renderer and harness PNGs (UI, out of lane) |
| IMP-22 | – | open | – | – |

## Requests to lead

(Files you need changed but don't own, board questions, dependency approvals. One line each, with the date.)

- 2026-11-23 · IMP-28 · New dev-dependency `proptest` 1.12.0, licence MIT OR Apache-2.0 (permissive; named here and in the PR body).
- 2026-11-23 · IMP-28 · Behaviour change to note: absolute `http://` URLs are now rejected (https-only; relative paths such as `/p/meranti-yard/design` are still allowed). This tightens IMP-10 to meet the "no non-https URL" property — flag if the lead wants plain http links allowed.

## Proposed glossary terms

## Log

- 2026-11-23 · IMP-10 · Added fail-closed GenUI card validator in `crates/spekin-core/src/genui.rs` (checklist, comparison, question families; AC-SPK-25 rejections), exported ts-rs contracts, and added 5 integration tests.
- 2026-11-23 · IMP-28 · Wrote failing proptest first; it found `data:text/plain,hello` accepted in `actions[].label` (seed saved in `tests/genui_fuzz.proptest-regressions`). Fixed by scanning every card string for `data:`/`file:` schemes at word boundaries and any absolute non-https URL; relative paths and words like "metadata:" stay valid. Added named regression tests. Fuzzed 2 000 cases (CI default) and 50 000 cases locally; both pass. `npm run gate` exit 0.
