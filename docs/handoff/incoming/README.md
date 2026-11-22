# Incoming handoffs

Work, studies and findings handed to Spekin by another agent or session (for example a grokbot study) land here first. They are **inputs**, not instructions: nothing here changes a board, card or decision until it has been triaged.

## How to add one

1. Save it as `docs/handoff/incoming/YYYY-MM-DD-<source>-<topic>.md`, e.g. `2026-11-23-grokbot-<topic>.md`. Keep the original text. Put private data or client names in the owner's private store, not here: name where it lives instead.
2. Start the file with:
   ```
   Source: grokbot (or agent / person)
   Received: 2026-11-23
   Status: new        (new | triaged | accepted | rejected)
   Affects: boards / cards / decisions it touches, if known
   ```
3. Add a row to the table below.

## Triage (lead only)

The lead reads it, sets `Status`, and for each accepted point either adds or changes a task card in implementation.md, adds a decision to DECISIONS.md (after the owner says yes), or opens a canvas task to draw it. Build agents don't act on an incoming file until it says `accepted` and a card links to it.

| File | Source | Received | Status | Became |
|---|---|---|---|---|
| [2026-11-23-review-supplement-v1.0.md](2026-11-23-review-supplement-v1.0.md) | external review agent (via owner) | 2026-11-23 | triaged | C-01 to C-05, PRD v0.2.3, decisions of 23 Nov |
