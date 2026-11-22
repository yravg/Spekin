// Sample data for the delivery board group (S34 Coding hand-off, S37 Build contracts and release readiness).
// Fictional; same project as meranti-yard.mjs. Every export is prefixed DELIVERY_. sha256 values are real hashes of fixture strings.
export const DELIVERY_READY = true;

// ---- S34: what can be handed off. Only accepted revisions are selectable.
export const DELIVERY_MANIFEST = { id: 'm-0007', next: 'm-0008', spec: 'r14', sealedAt: '12:47', zip: 'meranti-yard-handoff-m0007.zip', framework: 'React' };
export const DELIVERY_FRAMEWORKS = [['react', 'React'], ['vue', 'Vue.js'], ['svelte', 'Svelte'], ['next', 'Next.js'], ['vanilla', 'JS']];
// kind: frame | design | takes | ref. st: ok | warn | bad | mute. reason is shown when the row cannot be selected.
export const DELIVERY_ITEMS = [
  { id: 'F-01', name: 'Portfolio overview', kind: 'frame', rev: 'r4', st: 'ok', stText: 'Accepted r4', when: 'Accepted 11:52', size: '1440 × 900', sha: '1bea36aa0b49b414c5906d42435b2177e8610dfb1fdb467eff324374b9d4078a', html: '18.4 KB', png: '212 KB', thumb: { title: 'Portfolio overview', chart: true } },
  { id: 'F-03', name: 'Variance table', kind: 'frame', rev: 'r6', st: 'ok', stText: 'Accepted r6', when: 'Accepted 12:20', size: '1440 × 900', sha: '54d939e262a812760917ed1ed32809b1ae29088fb3ea4bdac65c9ac663a62023', html: '24.1 KB', png: '268 KB', thumb: { title: 'Variance table' } },
  { id: 'F-04', name: 'Alert drawer', kind: 'frame', rev: 'r1', st: 'warn', stText: 'Draft', when: 'Draft 12:38', size: '1440 × 900', reason: 'Draft, not accepted. Accept it in review first.', thumb: { title: 'Alert drawer', drawer: true } },
  { id: 'F-03', name: 'Variance table, 3 takes', kind: 'takes', rev: '3 takes', st: 'mute', stText: 'Pending', when: 'Alternatives, not chosen', size: '', reason: 'Pending alternatives are never bundled. Accept one take first.', thumb: { title: 'Take 1 of 3', kpi: false } },
  { id: 'REF-02', name: 'Site cost report', kind: 'ref', rev: 'r1', st: 'mute', stText: 'Reference', when: 'PNG · imported', size: '', reason: 'Reference image, not a design frame.', thumb: null },
  { id: 'DESIGN.md', name: 'Design guide', kind: 'design', rev: 'r3', st: 'ok', stText: 'Fresh', when: 'Finalized 12:24', size: '', sha: 'e6eb549e20044f7639023ccdcf498cbafc365e37550eb1cd11db4fedf89eb7b9', html: '3.2 KB', png: '', thumb: null },
];
export const DELIVERY_FILES = [
  ['manifest.json', '1.4 KB', 'b1dfde80'], ['GUIDE.md', '2.6 KB', 'c40a77e2'], ['DESIGN.md', '3.2 KB', 'e6eb549e'],
  ['frames/F-01-r4.html', '18.4 KB', '1bea36aa'], ['frames/F-01-r4.png', '212 KB', 'b6738a5e'],
  ['frames/F-03-r6.html', '24.1 KB', '54d939e2'], ['frames/F-03-r6.png', '268 KB', '79dbc815'],
];
// Selection restored from yesterday: F-03 r5 is no longer the accepted revision, F-04 is a draft.
export const DELIVERY_BLOCKED = [
  { id: 'F-01', rev: 'r4', ok: true, text: 'Accepted r4' },
  { id: 'F-03', rev: 'r5', ok: false, kind: 'Stale', text: 'r6 was accepted at 12:20. Pick r6.' },
  { id: 'F-04', rev: 'r1', ok: false, kind: 'Draft', text: 'Not accepted. Review it in S33.' },
];
// After F-03 r7 is accepted at 12:52 the finalized DESIGN.md r3 is stale and the manifest m-0007 stays as exported.
export const DELIVERY_STALE = { frame: 'F-03', rev: 'r7', at: '12:52', sha: 'd1253e5ae19ce445f5c566ce7b3febcfeb5d224e5c67817b651c64a9251fa535', html: '24.6 KB', png: '271 KB' };
export const DELIVERY_PROMPT = [
  'Build the Meranti Yard cost variance dashboard from this design hand-off.',
  'Framework: React (TypeScript). Manifest m-0007, spec r14, sealed 12:47.',
  '',
  'Frames, accepted revisions only',
  'F-01 Portfolio overview · r4 · 1440 × 900',
  '  frames/F-01-r4.html  sha256 1bea36aa…',
  '  frames/F-01-r4.png',
  'F-03 Variance table · r6 · 1440 × 900',
  '  frames/F-03-r6.html  sha256 54d939e2…',
  '  frames/F-03-r6.png',
  '',
  'Read GUIDE.md first, then DESIGN.md r3 for tokens.',
  'Build only the listed frames. F-04 is a draft and is not included.',
  'Ask before you change a token. Report the run and test commands when done.',
];

// ---- S37: contracts per stage, readiness, release gate, run failure, evidence
// [stage, kind, name, version, [pill], linked, checks text]
export const DELIVERY_CONTRACTS = [
  { stage: 'Frontend', n: '04', kind: 'Test definitions', ic: 'req', name: 'Variance table behaviour', ver: 'r1', st: ['mute', 'Draft'], link: 'R-DASH-014', checks: '0 of 4 run' },
  { stage: 'Backend', n: '05', kind: 'API contract', ic: 'server', name: 'Variance alerts', ver: 'r2', st: ['warn', 'Needs review'], link: 'R-DASH-014, 015, 019', checks: '3 of 6 pass', sel: true },
  { stage: 'Backend', n: '05', kind: 'Entity', ic: 'db', name: 'VarianceAlert', ver: 'r1', st: ['ok', 'Accepted'], link: 'R-DASH-014', checks: '4 of 4 pass' },
  { stage: 'Backend', n: '05', kind: 'Migration', ic: 'layers', name: '0007 add variance_alerts', ver: 'r1', st: ['mute', 'Draft'], link: 'R-DASH-019', checks: '1 of 3 pass' },
  { stage: 'Backend', n: '05', kind: 'Test definitions', ic: 'req', name: 'AC-DASH-014 alert rules', ver: 'r1', st: ['acc', 'Proposed'], link: 'R-DASH-014', checks: '3 criteria' },
  { stage: 'Integration', n: '06', kind: 'Test definitions', ic: 'req', name: 'Contract fixtures, GET alerts', ver: 'r1', st: ['bad', 'Blocked'], link: 'R-DASH-014', checks: '1 failed' },
  { stage: 'Testing', n: '07', kind: 'Test definitions', ic: 'req', name: 'Acceptance criteria, 11', ver: 'r3', st: ['acc', 'In progress'], link: 'R-DASH-*', checks: '4 of 11 pass' },
  { stage: 'Deployment', n: '08', kind: 'Release checklist', ic: 'flag', name: 'Staging release, pinned', ver: 'r1', st: ['mute', 'Draft'], link: 'Build b4a1f9c', checks: '0 of 6 run' },
];
export const DELIVERY_BUILD = { commit: 'b4a1f9c', env: 'staging', at: '12:31', pack: 'RC-0003' };
// check outcome: ok passed, bad failed, mute untested, warn needs review / evidence missing
export const DELIVERY_CHECKS = [
  { k: 'ok', t: 'Schema is valid OpenAPI 3.1', p: 'Passed', ev: 'EV-0431' },
  { k: 'ok', t: 'Every endpoint links a requirement', p: 'Passed', ev: 'EV-0431' },
  { k: 'warn', t: 'Threshold comes from accepted spec r14', p: 'Needs review', ev: 'EV-0409', why: 'The contract cites r13 (5%). Spec r14 says 3%.' },
  { k: 'bad', t: 'Auth and permissions section present', p: 'Failed', ev: 'EV-0447', why: 'Missing. Roles are named per endpoint, but no rule says what each role may do.' },
  { k: 'ok', t: 'Fixture matches entity VarianceAlert r1', p: 'Passed', ev: 'EV-0431' },
  { k: 'mute', t: 'No breaking change against r1', p: 'Evidence missing', ev: '', why: 'No diff check was recorded for this revision.' },
];
// [stage id, status text from STAGES, artifacts done, artifacts total, approvals done, approvals total, tests done, tests total, evidence chips, blocker]
export const DELIVERY_MATRIX = [
  ['planning', 6, 6, 1, 1, 0, 0, [['EV-0101', 'Plan r3']], ''],
  ['spec', 9, 9, 1, 1, 0, 0, [['EV-0140', 'Spec r14']], ''],
  ['design', 4, 6, 2, 3, 0, 0, [['EV-0288', 'F-01 r4, F-03 r6']], 'F-04 is a draft'],
  ['frontend', 0, 5, 0, 1, 0, 4, [], 'Not started'],
  ['backend', 4, 6, 0, 1, 3, 6, [['EV-0409', 'Fixture run']], 'Spec r14 change'],
  ['integration', 1, 4, 0, 1, 0, 3, [['EV-0447', 'Run #38 failed']], 'Contract mismatch'],
  ['testing', 5, 8, 0, 1, 4, 11, [['EV-0431', 'Build b4a1f9c']], '7 untested'],
  ['deploy', 0, 6, 0, 1, 0, 6, [], 'Waits for Testing'],
];
// release gate: [id, title, icon, state pill, measure, of, reason, evidence chips]
export const DELIVERY_GATE = [
  { id: 'tests', title: 'Acceptance tests', ic: 'req', pill: ['bad', 'Blocked'], big: '4 of 11', sub: 'criteria passed on build b4a1f9c', reason: '7 required criteria have no result. Untested is never shown as passed.', ev: [['EV-0431', 'Test run']] },
  { id: 'perf', title: 'Performance budget', ic: 'gauge', pill: ['bad', 'Failed'], big: '2.9 s', sub: 'table first render, budget 2.5 s', reason: 'F-03 with 500 rows is 0.4 s over budget on staging.', ev: [['EV-0452', 'Budget run']] },
  { id: 'a11y', title: 'Accessibility', ic: 'eye', pill: ['warn', 'Evidence missing'], big: 'No report', sub: 'for build b4a1f9c', reason: 'The last report is for b3c7d2e, two builds ago. It cannot verify this build.', ev: [['EV-0388', 'Report, b3c7d2e']] },
  { id: 'sec', title: 'Security checks', ic: 'shield', pill: ['bad', 'Failed'], big: '1 open', sub: 'secrets scan passed, auth rules missing', reason: 'The auth and permissions section is missing from the API contract. Keys appear by name only.', ev: [['EV-0447', 'Contract check']] },
];
export const DELIVERY_RUN = {
  id: 'Run #38', check: 'integration-contract', commit: 'b4a1f9c', at: '12:31',
  steps: [['ok', 'Fetch accepted contract r2', 'Applied', '0.4 s'], ['ok', 'Start fixture server', 'Applied', '1.9 s'], ['bad', 'GET /projects/{id}/variance-alerts', 'Failed', '0.8 s'], ['mute', 'POST /variance-alerts/{id}/acknowledge', 'Skipped', ''], ['mute', 'GET /packages/{id}/cost-lines', 'Skipped', ''], ['warn', 'Stop fixture server', 'Unknown', 'runner lost']],
  classes: [['Contract mismatch', true], ['Test code', false], ['Environment', false], ['Timeout', false], ['Permission', false]],
};
// evidence timeline: [source, what, observed, outcome pill, linked, note]
export const DELIVERY_TIMELINE = [
  ['PR #41 check', 'contract-fixtures', '12:31', ['bad', 'Failed'], 'T-212 · b4a1f9c', 'Linked by commit'],
  ['Runner ci-linux-2', 'queued job #39', 'waiting 9 min', ['acc', 'Queued'], 'b4a1f9c', 'No result yet'],
  ['main build 91c3e07', 'all checks', '12:12', ['ok', 'Passed'], 'other commit', 'Not this release. Not linked.'],
  ['Staging deploy', 'b4a1f9c', '20 Nov', ['warn', 'Stale'], 'b3c7d2e', '2 days old, older build'],
  ['Accessibility report', 'axe on staging', 'no source', ['mute', 'Unavailable'], '', 'Connection removed'],
  ['Production', 'any observation', 'none', ['mute', 'Unknown'], '', 'Never shown as passed'],
];
