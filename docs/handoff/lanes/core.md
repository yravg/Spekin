# Lane core: OpenCode, DeepSeek V4.1 Flash

Only this lane edits this file. Write here before you stop working.

## Now

| Card | Branch | Status | Evidence | Not checked |
|---|---|---|---|---|
| IMP-03 | – | open | – | – |
| IMP-25 | imp-25-context-builder | done | `crates/spekin-core/tests/context_builder.rs`: 5 unit cases (`request_carries_only_listed_chips_and_never_unchipped_or_hidden_frames`, `hidden_frame_is_never_included_even_if_referenced_as_a_chip`, `removing_a_chip_changes_context_never_board_content`, `duplicate_chips_are_deduplicated_preserving_first_order`, `empty_chip_set_produces_empty_context_with_zero_tokens`) + 2 proptest properties (`every_output_item_is_in_the_chip_set_and_never_hidden`, `removing_any_chip_never_changes_board_hash`) + 2 unit tests in `src/context.rs`. `cargo test --workspace` (14 + 7 + 2 pass); `npm run gate` passes (rules, sync, board lint, typecheck, vitest, build, cargo fmt/clippy/test, contracts current). Bindings committed: `BoardArtifact`, `BoardSnapshot`, `ContextChip`, `ContextItemStatus`, `RequestContext`, `RequestContextItem`. | No HTTP API route yet (core-only card); not wired to S29 or S35 UI (ui lane cards IMP-01/IMP-07); no real model tokenizer (uses per-chip estimated token counts). |

## Requests to lead

(Files you need changed but don't own, board questions, dependency approvals. One line each, with the date.)

## Proposed glossary terms

## Log

- 23 Nov 2026 · IMP-25 · Pure `build_context(chips, board) -> RequestContext`, `BoardSnapshot::content_hash`, `format_token_estimate`, 5 unit + 2 proptest integration tests + 2 unit tests in `src/context.rs`, 6 ts-rs bindings committed (`BoardArtifact`, `BoardSnapshot`, `ContextChip`, `ContextItemStatus`, `RequestContext`, `RequestContextItem`), `proptest = "1"` dev-dependency (MIT OR Apache-2.0) · d6a89bd (test first: b12e803)
(Newest first: date, card, what changed, commit SHA.)
