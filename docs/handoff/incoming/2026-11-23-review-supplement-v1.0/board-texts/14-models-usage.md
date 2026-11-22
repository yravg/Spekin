# S36 — Models and usage: source, local CLI, API key, estimate, ledger and caps

Artifact: [Spekin: design canvas for review before build](https://claude.ai/artifact/1FPcR3TkQhGk4sUjPSPo6U#page-dcb81aee8d83)

Read-only text capture of the artboard. This is design/reference material, not evidence of a running product.

## Visible board text

```text
MODELS
S36 · MODELS · SPEKIN
Models and usage: source, local CLI, API key, estimate, ledger and caps

Extends: New. Spekin has no built screen yet. Opens from the model chip in the chat composer and from the usage meter in the top bar of S35; extends the existing billing, settings and usage ideas with a per-run ledger (PRD S36, R-MOD-1 to R-MOD-11). Local CLI added by owner decision 22 Nov 2026.

Lives in: Spekin web app · /p/meranti-yard/usage (section in the query: models, run, ledger, limits). Opens as an artifact tab beside the work; keys, key text and pairing codes are never in the URL or in any export.

Source picker
Local CLI
API provider setup and test
Estimate before Send
Usage ledger
Cap reached
S
Meranti Yard
/
Cost variance dashboard
Increment
Inc. 2 · Variance alerts
Spec
r14
accepted
Saved 12:41
NEW
Hosted
1,240
of 5,000 cr
2
EN
RS
01
Planning
Ready · 6 of 6
02
Specification
Ready · r14
03
Design
In progress · 3 to review
04
Frontend
Not started
05
Backend
Needs review · 2
06
Integration
Blocked · 1
07
Testing
In progress · 4 of 11
08
Deployment
Not started
Readiness
Design chat
· F-03 selected
Context for the next run
4 items · 9.8k tokens
F-03 Variance table
r6
DESIGN.md
r3
R-DASH-014
r14
REF-02 Site cost report
r1
The whole board is never sent
Add an alert drawer to the variance table for packages over 3%.
S
Spekin
Sonnet 5.5 · 34 s · 24 cr

Drew F-04 Alert drawer as a draft. F-03 stays accepted at r6.

NEW
Run 0426
Settled
Estimate
18–30
Reserved
36
Charged
24
Refunded
12
credits · Sonnet 5.5 · 34 s
Ledger
Try 2 more takes of the F-04 drawer with a denser table.
NEW
HOSTED
Sonnet 5.5
High
≈ 18–30 cr
Variance flows
F-03 Variance table
F-04 Alert drawer
Models and usage
Hand off
Models and usage
Meranti Yard · every run in this project
Models
Next run
Ledger
Limits
NEW
Hosted
Bills: Spekin credits
No setup. Runs reserve and settle credits.
Local CLI
CLI
Bills: your agent's own plan
Bring your own agent. Spekin credits are not used.
API provider
BYOK
Bills: your provider
Your own key. Spekin adds no model cost.
PROVIDER
Anthropic
3
Google
2
OpenAI
2
Rate card rc-7 · region and retention unknown
Sonnet 5.5
claude-sonnet-5-5
Text
Vision
Code
Structured
200k in · 16k out
rc-7
18–30 cr
Haiku 5
claude-haiku-5
Text
Vision
Structured
200k in · 8k out
rc-7
4–9 cr
Opus 5
claude-opus-5
Text
Vision
Code
Structured
Not in the Hosted sample plan. Use your own key or agent.
200k in · 32k out
rc-7
60–110 cr
EFFORT
Low
Medium
High

High: ≈ 1.6× tokens, slower.

MODEL CHOICE
Fixed
Auto

Auto never changes provider or cap without asking.

ROUTING BY TASK
Edit routing
Task
Model
Source
Note
Interview and spec draft
Sonnet 5.5 · Medium
Hosted
Auto
Reference analysis (vision)
Sonnet 5.5 · High
Hosted
Fixed
Visual alternatives
Sonnet 5.5 · High
Hosted
Fixed
Independent review
Google · Pro tier
Hosted
Different vendor
NEW
THIS MONTH
1–30 Nov · resets 1 Dec
1,240
of 5,000 cr used
Calm
70%
90%
Used
1,240
Reserved, in flight
24
Pending reconciliation
30
Left under the cap
3,706
NEW
RATE WINDOWS
Hosted · sample units
5 hours
312 of 900 cr
35% · resets 17:10
7 days
842 of 2,400 cr
35% · resets Mon 08:00
NEW
TOP UP CREDITS

Pay by QRIS through a payment adapter. Credits are added once, after the payment is verified. Automatic top-up stays off.

Top up
LATER
Pick a source: each card says who bills. Hosted spends Spekin credits, Local CLI uses your own agent and its plan, API provider bills your provider.
Select a model: the estimate and reserve update at once. A disabled row says why (plan, capability or missing rate card) and keeps Send off.
WHAT IT MUST SHOW
Three sources, each saying who bills: Hosted (Spekin credits), Local CLI · bring your own agent (your agent's own plan; Spekin credits not used) and API provider · your key (BYOK; your provider bills you).
The composer chip names the active source on every state: HOSTED, CLI or API.
Hosted: provider chips and a model radio group. Each model shows capabilities, limits, rate card and retention; anything not known says unknown. A model that cannot be used is disabled with the reason.
Local CLI: Spekin Connector status (running, paired, version), the detected agents with installed and signed-in state, a sign-in hint or an install link, then agent, model, effort and a permission mode. Runs happen in a separate work copy, never your checkout.
Usage from a CLI run shows only where the agent reports it; otherwise the field says not reported, never 0.
API provider: provider picker, base URL (prefilled, editable for Custom), a write-only key (encrypted on the server, never shown again, revocable), a model list fetched from the provider plus a custom id, and a connection test with per-check results.
Before Send on Hosted: the estimate range, the exact context in tokens, the checks, and the maximum that will be reserved. After the run: settle the actual, refund the rest.
A usage meter with reserved and pending pieces, calm until 70%, warn at 70%, critical at 90%; caps per run and per month; rate windows.
At the cap new Hosted runs stop, the limit is named, Local CLI and API runs are not counted, and every artifact stays. Credit top-up is drawn and off (LATER).
MOTION
Meter fill
Bar width eases 320 ms spring-panel. Colour changes at 70% and 90% with a 140 ms fade; nothing pulses.
Estimate
The range band redraws in 180 ms when model, effort or context changes; numbers swap with a 120 ms fade.
Source switch
The form below cross-fades 200 ms spring-ui. Typed key text is cleared on a switch, never carried over.
Connector and agents
The status dot and pills fade 140 ms when the Connector connects or drops. After Scan, agent rows resolve one by one every 40 ms, ease cubic-bezier(0.23,1,0.32,1); a spinner shows only while that row’s own check is open.
Ledger rows
New entries rise 4 px with a 40 ms stagger, ease cubic-bezier(0.23,1,0.32,1) (OpenDesign).
Connection test
Rows resolve one by one every 60 ms. A spinner shows only while that row’s request is open; no fake progress bar.
Reduce Motion
Fills and swaps are instant. Severity, cap and Connector messages are still announced as text.
STORIES
F281
OpenDesign
New
Model source picker: Hosted, Local CLI (bring your own agent) and API provider (BYOK), each naming who bills; the active source shows as HOSTED, CLI or API on the composer chip (R-MOD-1, AC-SPK-7).
F282
OpenDesign
New
Hosted provider chips and a model radio group with capabilities, limits, rate card and retention (unknown stays unknown); unusable models are disabled with the reason (R-MOD-2, R-MOD-5, AC-SPK-6).
F283
Onlook
New
Effort levels, Fixed or Auto routing and routing by task with an independent reviewer from a different vendor; the actual model of every run is shown (R-MOD-4, R-MOD-5, R-MOD-11).
F285
OpenDesign
New
API provider (BYOK): picker for Anthropic, OpenAI, Google Gemini, Azure OpenAI, Ollama on this computer and Custom OpenAI-compatible; base URL prefilled and editable for Custom; write-only key, encrypted on the server, never shown again, revocable (R-MOD-9, AC-SPK-12).
F286
OpenDesign
New
Connection test with per-check results and a model list fetched from the provider, with a custom model id allowed; a failed test saves nothing (R-MOD-9).
F287
PRD
New
Estimate before Send: range, exact context, capability and rate-card checks, and the reserve; Send is off with the reason when a check fails (R-MOD-3, AC-SPK-6).
F288
PRD
New
Reserve the maximum, settle the actual, refund the rest; idempotent retries and duplicate callbacks never charge twice (R-MOD-6, R-MOD-7, R-MOD-8, AC-SPK-8).
F289
PRD
New
Usage ledger: reserve, settle, refund, hold, BYOK and CLI entries with a running balance; a CLI row shows tokens only when the agent reported them, else not reported, never 0; provider cost and credit charge stay separate (R-MOD-6, R-MOD-10, AC-SPK-9).
F290
Onlook
New
Usage meter with reserved and pending pieces, plus the 5-hour and 7-day rate windows; calm, warn at 70%, critical at 90% (R-MOD-10, Onlook UsageMeter, OpenDesign CodingPlanUsage).
F291
PRD
New
Caps per run, per project month and per workspace, plus a concurrency limit; checked at reservation (R-MOD-7, R-MOD-10).
F293
OpenDesign
New
Spekin Connector: a small local Rust program the user starts once and pairs with a 6-digit code; the browser talks to it on 127.0.0.1 only; the screen shows running, paired and version (R-MOD-1, owner decision 22 Nov 2026).
F294
PRD
New
Cap reached: stop the affected Hosted action, name the limit, show what is left and pending, preserve every artifact; CLI and API runs are not counted; the 70% and 90% steps lead here (R-PAY-7, R-MOD-7, R-MOD-10, AC-42).
F295
PRD
New
Credit top-up by QRIS through a swappable payment adapter, drawn and off; automatic top-up stays off (R-PAY-1 to R-PAY-5, R-MOD-10).
F296
OpenDesign
New
Detected agents: Claude Code, Codex CLI, OpenCode, Antigravity (Gemini), Cursor Agent and GitHub Copilot CLI with installed and signed-in state, a sign-in hint or an install link (R-MOD-1).
F297
Onlook
New
Local run settings: the agent, its model, effort and a permission mode (ask before writing files, or edit files in a work copy only); runs happen in a separate work copy, never the user checkout (R-MOD-1).
F299
PRD
New
Honest local usage: it comes from the agent where it reports it, else the field says not reported, never 0; CLI runs debit no Spekin credits (R-MOD-6, R-MOD-10).
WHERE IT LIVES
Owner decision 22 Nov 2026: Local CLI is in scope as a model source; the PRD deferred local integration.
Route: /p/:project/usage?s=models|run|ledger|limits. Back and Forward restore the section and never start a paid job (R-WF-11).
UI (TS/React): OpenDesign (Apache-2.0, commit e033aad) InlineModelSwitcher, components/byok/*, the runtime registry and agent detection, CodingPlanUsage and its string-credit model; Onlook (Apache-2.0) UsageMeter with usageSeverity 70 and 90, ModelEffortMenu, and the worktree pattern for runs. Reuse needs a NOTICE file. Momo (no licence): the effort dock is a pattern only.
Connector (Rust): the Spekin Connector is a small local Rust program: 127.0.0.1 listener, 6-digit pairing, agent detection, work copies, run streaming. Agent adapters for Claude Code, Codex and OpenCode come first; the others follow the same adapter shape.
Core (Rust): model registry and rate cards, atomic reservations, the ledger, concurrency limits, the encrypted key vault, the payment adapter and webhook checks (R-MOD-6 to R-MOD-9, R-PAY-2).
Open for Enrico: payment gateway (Midtrans QRIS is the leaning, Xendit stays swappable; Q-05) · credit pack sizes and prices · whether the cap is per project or per workspace by default · any BYOK platform fee · which agents follow the first three · Connector install and signing per operating system. Credit figures here are fixture units, not a price list.
STATES
Source picker · Entry: Projects > Meranti Yard > Design > click the HOSTED Sonnet 5.5 chip in the chat composer > Models. · Data: sample/parts/models.mjs → MODELS_SOURCES, MODELS_PROVIDERS, MODELS_REGISTRY, MODELS_EFFORT, MODELS_TASKS.
Local CLI · Entry: Models > click the Local CLI card > pair the Spekin Connector with its 6-digit code > click Claude Code in the agent list. · Data: sample/parts/models.mjs → MODELS_CONNECTOR, MODELS_AGENTS, MODELS_AGENT_RUN.
API provider setup and test · Entry: Models > click the API provider card > pick Anthropic > paste a key > Test connection. · Data: sample/parts/models.mjs → MODELS_API, MODELS_KEY (tests, tail, usage).
Estimate before Send · Entry: Type in the chat composer > the meter chip shows the estimate > click Next run in Models and usage. · Data: sample/parts/models.mjs → MODELS_RUN (est, reserve, ctx, checks).
Usage ledger · Entry: Click the usage meter in the top bar > Ledger, or click Ledger on a run card in the chat. · Data: sample/parts/models.mjs → MODELS_LEDGER (incl. cli rows), MODELS_LEDGER_DETAIL, MODELS_USAGE.calm.
Cap reached · Entry: Usage meter turns amber at 70% and red at 90% > Send in the composer turns off at the cap > click the meter > Limits. · Data: sample/parts/models.mjs → MODELS_USAGE.capped, MODELS_CAPS, MODELS_PERIOD.
Reference: the original UI
OpenDesign (Apache-2.0, commit e033aad) is the source for the model switcher with its local CLI and API provider modes, the BYOK fields and agent detection; Onlook (Apache-2.0) for the meter and work-copy runs. Momo (no licence) and Paraframe are pattern references only; Spekin copies none of their wording or assets.
OpenDesign. The agent and model chip sits bottom left of the entry view and opens a switcher with a local CLI mode and an API provider mode. Spekin adds Hosted as a third source and says who bills on each.
Momo (pattern only). The model and effort dock sits on the composer. Spekin keeps the idea: source tag, model, effort and an estimate on the composer row, with no brand or wording.
OpenDesign Studio. The chat composer sits under the conversation with its model control. The Spekin composer adds the source tag (HOSTED, CLI or API), the estimate and Send.
```
