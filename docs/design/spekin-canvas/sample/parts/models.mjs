// Sample data for the models board group (S36 Models and usage, T01 Tablet and phone). Fictional; same project as meranti-yard.mjs.
// Every export is prefixed MODELS_. Credit figures are fixture units, not a price list (PRD AC-SPK-8).
export const MODELS_READY = true;

// Usage in three moments of the same month. committed = used + reserved + pending; share = committed / cap.
export const MODELS_USAGE = {
  calm: { used: 1240, reserved: 24, pending: 30, cap: 5000, sev: 'calm', win5: [312, 900, '17:10'], win7: [842, 2400, 'Mon 08:00'] },
  near: { used: 3820, reserved: 60, pending: 0, cap: 5000, sev: 'warn', win5: [640, 900, '17:10'], win7: [1980, 2400, 'Mon 08:00'] },
  capped: { used: 4946, reserved: 24, pending: 30, cap: 5000, sev: 'crit', win5: [188, 900, '17:10'], win7: [2340, 2400, 'Mon 08:00'] },
};
export const MODELS_PERIOD = { label: '1–30 Nov', resets: '1 Dec', days: 8, workspaceCap: 20000, workspaceUsed: 8420 };
export const MODELS_CAPS = { perRun: 60, monthly: 5000, concurrency: 2 };

// Source cards: hosted bills credits, BYOK bills the user's provider, local agent is deferred.
export const MODELS_SOURCES = [
  { id: 'hosted', name: 'Hosted', icon: 'cloud', bills: 'Spekin credits', sub: 'No key needed. Runs reserve and settle credits.' },
  { id: 'byok', name: 'Bring your own key', icon: 'plug', bills: 'Your provider', sub: 'Your provider bills you. Spekin adds no model cost.' },
  { id: 'local', name: 'Local agent', icon: 'cpu', bills: 'Your machine', sub: 'Deferred. No connection flow in the browser version.' },
];
export const MODELS_PROVIDERS = [['Anthropic', 3], ['Google', 2], ['OpenAI', 2]];
// registry rows: [name, id, capabilities, limits, rate card, estimate, state, note]
export const MODELS_REGISTRY = [
  { name: 'Sonnet 5.5', id: 'claude-sonnet-5-5', caps: ['Text', 'Vision', 'Code', 'Structured'], lim: '200k in · 16k out', rc: 'rc-7', est: '18–30 cr', st: 'sel', note: 'Default for spec drafts and alternatives' },
  { name: 'Haiku 5', id: 'claude-haiku-5', caps: ['Text', 'Vision', 'Structured'], lim: '200k in · 8k out', rc: 'rc-7', est: '4–9 cr', st: 'ok', note: 'Fast and light; summaries and checks' },
  { name: 'Opus 5', id: 'claude-opus-5', caps: ['Text', 'Vision', 'Code', 'Structured'], lim: '200k in · 32k out', rc: 'rc-7', est: '60–110 cr', st: 'off', note: 'Not in the Hosted sample plan. Use BYOK, or ask the workspace owner.' },
];
export const MODELS_EFFORT = [['Low', '≈ 0.6× tokens, fastest'], ['Medium', 'balanced'], ['High', '≈ 1.6× tokens, slower']];
// routing: [task, model, source, vendor note]
export const MODELS_TASKS = [
  ['Interview and spec draft', 'Sonnet 5.5 · Medium', 'Hosted', ['mute', 'Auto']],
  ['Reference analysis (vision)', 'Sonnet 5.5 · High', 'Hosted', ['mute', 'Fixed']],
  ['Visual alternatives', 'Sonnet 5.5 · High', 'Hosted', ['mute', 'Fixed']],
  ['Independent review', 'Google · Pro tier', 'Hosted', ['ok', 'Different vendor']],
];

// BYOK key and connection test (the key itself is never in this file or on screen after save)
export const MODELS_KEY = {
  provider: 'Anthropic', tail: '9f2a', by: 'Rina (sample)', added: '12 Nov', tested: '12:38', models: 6,
  tests: [
    ['ok', 'Provider reachable', '184 ms'],
    ['ok', 'Key accepted', 'scope: messages'],
    ['ok', 'Models listed', '6 found, Sonnet 5.5 among them'],
    ['ok', 'Vision available', 'image input accepted'],
    ['warn', 'Provider spend limit', 'not reported by this provider'],
  ],
  usage: { tokensIn: '412k', tokensOut: '96k', runs: 14 },
};

// next run (estimate before Send)
export const MODELS_RUN = {
  id: '0429', task: 'Visual alternatives', target: 'F-04 Alert drawer', model: 'Sonnet 5.5', effort: 'High',
  est: [18, 30], reserve: 36, expect: 24, release: 12, outCap: '8k tokens', key: 'k-7f3c91', limitIn: '200k', rc: 'rc-7',
  ctx: [['F-03 Variance table', 'r6', 3.1], ['DESIGN.md', 'r3', 2.4], ['R-DASH-014', 'r14', 0.6], ['REF-02 Site cost report', 'r1', 3.7]],
  checks: [
    ['Model reads images', 'REF-02 is a PNG and Sonnet 5.5 takes images'],
    ['Context fits', '9.8k of 200k input tokens; the whole board is not sent'],
    ['Rate card rc-7 is active', 'Hosted price known, so a paid run is allowed'],
    ['Reserve fits the caps', '36 is under the per-run cap of 60 and the 3,706 left'],
    ['Runs in flight', '1 of 2 allowed; this one would be the second'],
  ],
};

// ledger, newest first. kind: reserve | settle | refund | hold | byok. amt is credits; left is what remains of the cap after the entry.
export const MODELS_LEDGER = [
  { t: '12:44', run: '0428', kind: 'reserve', task: 'Spec draft · R-DASH-019', model: 'Sonnet 5.5 · Medium', amt: '−24', left: '3,706', st: ['acc', 'Running'] },
  { t: '12:41', run: '0426', kind: 'refund', task: 'Visual alternatives · F-04', model: 'Sonnet 5.5 · High', amt: '+12', left: '3,730', st: ['ok', 'Settled'] },
  { t: '12:41', run: '0426', kind: 'settle', task: 'Visual alternatives · F-04', model: 'Sonnet 5.5 · High', amt: '24', left: '3,718', st: ['ok', 'Settled'] },
  { t: '12:40', run: '0426', kind: 'reserve', task: 'Visual alternatives · F-04', model: 'Sonnet 5.5 · High', amt: '−36', left: '3,718', st: ['ok', 'Settled'] },
  { t: '12:20', run: '0425', kind: 'refund', task: 'Reference analysis · REF-02', model: 'Sonnet 5.5 · High', amt: '+9', left: '3,754', st: ['ok', 'Settled'] },
  { t: '12:20', run: '0425', kind: 'settle', task: 'Reference analysis · REF-02', model: 'Sonnet 5.5 · High', amt: '21', left: '3,745', st: ['ok', 'Settled'] },
  { t: '12:18', run: '0425', kind: 'reserve', task: 'Reference analysis · REF-02', model: 'Sonnet 5.5 · High', amt: '−30', left: '3,745', st: ['ok', 'Settled'] },
  { t: '12:10', run: '0424', kind: 'refund', task: 'Alternatives · F-03 takes', model: 'Sonnet 5.5 · High', amt: '+30', left: '3,775', st: ['bad', 'Cancelled'], sel: true },
  { t: '12:10', run: '0424', kind: 'settle', task: 'Alternatives · F-03 takes', model: 'Sonnet 5.5 · High', amt: '6', left: '3,745', st: ['bad', 'Cancelled'], sel: true },
  { t: '12:08', run: '0424', kind: 'reserve', task: 'Alternatives · F-03 takes', model: 'Sonnet 5.5 · High', amt: '−36', left: '3,745', st: ['bad', 'Cancelled'], sel: true },
  { t: '11:30', run: '0423', kind: 'byok', task: 'Style summary', model: 'Haiku 5 · BYOK', amt: '0', left: '3,781', st: ['mute', 'Provider-billed'] },
  { t: '11:05', run: '0422', kind: 'hold', task: 'Independent review', model: 'Google · Pro tier', amt: '30 held', left: '3,781', st: ['warn', 'Pending'] },
];
export const MODELS_LEDGER_DETAIL = { run: '0424', title: 'Cancelled after partial usage', consumed: '6 cr', released: '30 cr', pending: '0 cr', provider: 'rc-7 · provider cost 5.8 cr · charged 6 cr', key: 'k-2b90de' };

// T01: tablet and phone. frames [id, name, rev, pill, thumb options]
export const MODELS_DEVICE_FRAMES = [
  ['F-01', 'Portfolio overview', 'r4', ['ok', 'Accepted'], 'chart'],
  ['F-03', 'Variance table', 'r6', ['ok', 'Accepted'], 'table'],
  ['F-04', 'Alert drawer', 'r1', ['warn', 'Draft'], 'drawer'],
  ['F-03', 'alternatives', '3 takes', ['mute', 'Pending'], 'table'],
  ['REF-02', 'Site cost report', 'PNG', ['mute', 'Reference'], 'image'],
];
export const MODELS_FINDING = { n: 1, of: 3, title: 'Clearer variance flags', body: 'Over-threshold rows now show a pill with the reason. Compare the whole frame before you apply.', base: 'r6', next: 'r7', frame: 'F-03 Variance table', reqs: ['R-DASH-014'], changed: '3 rows' };
export const MODELS_BUNDLE = {
  pick: [['F-01', 'Portfolio overview', 'r4', true], ['F-03', 'Variance table', 'r6', true], ['F-04', 'Alert drawer', 'r1 draft', false, 'Draft, not accepted'], ['F-03', 'alternatives', '3 takes', false, 'Pending alternatives']],
  files: ['PNG per frame', 'DESIGN.md r3', 'manifest.json', 'HANDOFF.md'],
  id: 'HO-0007', size: '1.4 MB', spec: 'r14',
};
