// One synthetic sample project for every Spekin board. Fictional names and figures; no client or real project data.
// The boards import this file; the app's demo project must load the same file (canvas-to-app rule 15), so numbers cannot drift.
export const PROJECT = { name: 'Meranti Yard', product: 'Cost variance dashboard', increment: 'Inc. 2 · Variance alerts', spec: 'r14', user: 'Rina (sample)', initials: 'RS' };
export const STAGES = [
  { id: 'planning', n: '01', name: 'Planning', st: 'ok', text: 'Ready · 6 of 6' },
  { id: 'spec', n: '02', name: 'Specification', st: 'ok', text: 'Ready · r14' },
  { id: 'design', n: '03', name: 'Design', st: 'half', text: 'In progress · 3 to review' },
  { id: 'frontend', n: '04', name: 'Frontend', st: 'ring', text: 'Not started' },
  { id: 'backend', n: '05', name: 'Backend', st: 'warn', text: 'Needs review · 2' },
  { id: 'integration', n: '06', name: 'Integration', st: 'bad', text: 'Blocked · 1' },
  { id: 'testing', n: '07', name: 'Testing', st: 'half', text: 'In progress · 4 of 11' },
  { id: 'deploy', n: '08', name: 'Deployment', st: 'ring', text: 'Not started' },
];
export const USAGE = { source: 'Hosted', used: 1240, cap: 5000 };
export const MODEL = { source: 'HOSTED', name: 'Sonnet 5.5', est: '≈ 18–30 cr' };
// cost packages, USD million: [id + name, budget, forecast, variance, state]
export const PACKAGES = [
  ['P-01 Jacket fabrication', '12.40', '13.10', '+5.6%', 'bad'],
  ['P-02 Topside piping', '8.25', '8.31', '+0.7%', 'ok'],
  ['P-03 Hook-up and commissioning', '5.90', '6.28', '+6.4%', 'bad'],
  ['P-04 Marine spread', '4.10', '3.96', '−3.4%', 'ok'],
];
export const KPIS = [['Budget', '30.65'], ['Forecast', '31.65'], ['Variance', '+3.3%', 'neg'], ['Alerts', '2']];
export const FRAMES = {
  f01: { id: 'F-01', name: 'Portfolio overview', rev: 'r4', st: 'accepted' },
  f03: { id: 'F-03', name: 'Variance table', rev: 'r6', st: 'accepted' },
  f04: { id: 'F-04', name: 'Alert drawer', rev: 'r1', st: 'draft' },
  alt: { id: 'F-03', name: 'alternatives', takes: 3 },
  ref: { id: 'REF-02', name: 'Site cost report', kind: 'PNG · imported' },
};
export const REQS = [
  { id: 'R-DASH-014', t: 'Variance threshold per package', sub: 'Accepted in spec r14', pill: ['ok', 'Accepted'] },
  { id: 'R-DASH-015', t: 'Drill down from package to cost lines', sub: 'Accepted in spec r14', pill: ['ok', 'Accepted'] },
  { id: 'R-DASH-019', t: 'Alert after 2 periods over 3%', sub: 'Proposal from chat, not in spec', pill: ['acc', 'Proposal'] },
];
export const CTX_DESIGN = [['frame', 'F-03 Variance table', 'r6'], ['doc', 'DESIGN.md', 'r3'], ['req', 'R-DASH-014', 'r14'], ['image', 'REF-02 Site cost report', 'r1']];
export const CTX_BACKEND = [['server', 'API contract · variance alerts', 'r2'], ['db', 'Entity VarianceAlert', 'r1'], ['req', 'R-DASH-014', 'r14']];
export const BACKEND = {
  contract: { name: 'API contract: variance alerts', rev: 'r2' },
  endpoints: [
    ['GET', '/projects/{id}/variance-alerts', 'R-DASH-014', 'Viewer', ['warn', 'Needs review']],
    ['POST', '/variance-alerts/{id}/acknowledge', 'R-DASH-019', 'Editor', ['acc', 'Proposal']],
    ['GET', '/packages/{id}/cost-lines', 'R-DASH-015', 'Viewer', ['ok', 'Accepted']],
  ],
  entity: [['id', 'uuid'], ['package_id', 'P-01 … P-04'], ['variance_pct', 'decimal(5,2)'], ['periods_over', 'int'], ['threshold_rev', 'spec revision, e.g. r14'], ['acknowledged_by', 'user id, nullable']],
  ready: [['ok', 'Entities', 'Accepted r1'], ['warn', 'API contract', 'Needs review'], ['bad', 'Auth and permissions', 'Missing'], ['mute', 'Migration proposal 0007', 'Draft'], ['bad', 'Rollback notes', 'Missing'], ['mute', 'Evidence for pinned build', 'None yet']],
  checks: [['off', 'Alert raised over 3% for 2 periods', ['mute', 'Untested']], ['on', 'Threshold read from accepted spec r14', ['ok', 'Passed · fixture']], ['off', 'No alert for P-04 at −3.4%', ['bad', 'No evidence']]],
};
export const CONFLICT = { frame: 'F-04 Alert drawer', rev: 'r8', by: 'Dimas (sample)', at: '12:43' };

// Board-group data (one file per board group; names are prefixed by the group so they never clash).
export * from './parts/intake.mjs';
export * from './parts/canvas.mjs';
export * from './parts/style.mjs';
export * from './parts/review.mjs';
export * from './parts/delivery.mjs';
export * from './parts/models.mjs';
