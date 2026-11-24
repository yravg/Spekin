// Sample data for gaps-canvas group B (boards-gap-b.mjs). Names start with GAPB_. Fictional Meranti Yard only.
export const GAPB_READY = true;

// ---- S07: the snapshot hash and the project principles (R-PRI-1)
export const GAPB_HASH = '7c1e4a9';
export const GAPB_PRINCIPLES = [
  { id: 'PRN-1', t: 'Money figures are never rounded in storage, only on screen.', rev: 'r9', src: 'D-07 Decision log', pill: ['ok', 'Accepted'] },
  { id: 'PRN-2', t: 'A variance alert always names its package and its period.', rev: 'r11', src: 'D-12 Decision log', pill: ['ok', 'Accepted'] },
  { id: 'PRN-3', t: 'Tests come before screens for every threshold rule.', rev: 'r14', src: 'Interview Q-04', pill: ['ok', 'Accepted'] },
  { id: 'PRN-4', t: 'Who may edit a threshold?', rev: '-', src: 'Open question Q-09', pill: ['warn', 'Open question'] },
];

// Spec blocks per layer. basis = linked decisions, pack requirements or reference FRs; empty means "tanpa dasar" (R-EDT-8).
export const GAPB_SIMPLE = [
  { k: 'Problem', t: 'Site managers learn about cost overruns a month late, after the monthly cost report.' },
  { k: 'Appetite', t: 'Six weeks, one designer and two engineers.' },
  { k: 'Solution', t: 'A dashboard that shows forecast against budget per package and flags packages over a threshold.' },
  { k: 'Rabbit holes', t: 'Currency conversion and late invoices. Both are left out of the first release.' },
  { k: 'No-gos', t: 'No write-back to the accounting system. No approval workflow.' },
];
export const GAPB_BLOCKS = [
  { id: 'R-DASH-014', k: 'Requirement', t: 'WHEN a package forecast exceeds its budget by more than 3% THE SYSTEM SHALL flag the package in the variance table.', basis: ['D-07', 'REF-02'], rev: 'r14' },
  { id: 'R-DASH-015', k: 'Requirement', t: 'WHEN the user selects a package THE SYSTEM SHALL show its cost lines.', basis: ['D-09'], rev: 'r14' },
  { id: 'R-DASH-021', k: 'Requirement', t: 'THE SYSTEM SHALL email the site manager every Monday with the packages over threshold.', basis: [], rev: 'r14' },
  { id: 'PLAN-04', k: 'Plan', t: 'Forecast values come from the monthly cost export; no live accounting connection.', basis: ['D-03'], rev: 'r14' },
  { id: 'R-DASH-023', k: 'Requirement', t: 'THE SYSTEM SHALL keep 24 months of variance history per package.', basis: [], rev: 'r14' },
];
export const GAPB_EXPERT = [
  { id: 'ADR-003', k: 'ADR', t: 'Store money as integer minor units', basis: ['PRN-1', 'R-DASH-014'], pill: ['ok', 'Accepted r12'] },
  { id: 'ADR-004', k: 'ADR', t: 'Variance is computed on the server, not in the browser', basis: ['R-DASH-014'], pill: ['ok', 'Accepted r13'] },
  { id: 'GLO-02', k: 'Glossary', t: 'Forecast: the latest cost-to-complete estimate for a package', basis: ['D-04'], pill: ['ok', 'Accepted r10'] },
  { id: 'TRC-14', k: 'Matrix', t: 'R-DASH-014 > T-212 > AC-014.2 > commit a41c9e0 > 1 of 3 passed', basis: ['R-DASH-014'], pill: ['warn', 'Partly verified'] },
];

// Proposal created when the user moves to a deeper layer with missing content (R-EDT-5)
export const GAPB_MISSING = [
  { id: 'R-DASH-016', t: 'Empty state when no package is over the threshold', from: 'Solution (Simple)' },
  { id: 'R-DASH-017', t: 'Threshold is stored per package, with a project default', from: 'Solution (Simple)' },
  { id: 'PLAN-05', t: 'Screens: variance table, alert drawer, package detail', from: 'Solution (Simple)' },
];

// ---- S07: add-feature increment impact (R-EVD-6)
export const GAPB_IMPACT = [
  { area: 'Stage readiness', item: 'Design 3 to review > 5 to review; Testing 4 of 11 > 4 of 14', n: 2, pill: ['warn', 'Changes'] },
  { area: 'Frames', item: 'F-03 Variance table gets a "Last export" column; F-07 Export dialog is new', n: 2, pill: ['warn', 'Changes'] },
  { area: 'Contracts', item: 'API contract variance alerts r2: new field exportedAt', n: 1, pill: ['warn', 'Changes'] },
  { area: 'Tasks', item: 'T-212 stays; T-231 Export dialog and T-232 CSV endpoint are new', n: 2, pill: ['acc', 'New'] },
  { area: 'Tests', item: 'AC-014.2 stays; AC-030.1 and AC-030.2 are new', n: 2, pill: ['acc', 'New'] },
  { area: 'Unaffected', item: 'F-01, F-04, R-DASH-014, R-DASH-015 and all their evidence', n: 11, pill: ['ok', 'Kept as accepted'] },
];

// ---- S14: kit, tokens and the GAP register (R-DS-4, R-DS-8)
export const GAPB_KIT = { name: 'yravg UI', rev: 'r3', picked: 14, decision: 'D-15 Kit decision', by: 'Rina (sample)' };
export const GAPB_PICKS = [
  ['components/data-table', 'Variance table', 'F-03', 'ok'],
  ['components/status-pill', 'Over-threshold flag', 'F-03', 'ok'],
  ['components/kpi-tiles', 'Package totals', 'F-01', 'ok'],
  ['components/inline-diff', 'Spec diff', 'S08', 'ok'],
  ['components/expandable-row', 'Cost lines', 'F-03', 'ok'],
  ['components/flow-diagram', 'Variance bridge', 'F-05', 'gap'],
];
export const GAPB_TOKENS = [
  ['--accent', 'Burnt orange', 'Primary action, current stage', 'r3'],
  ['--warn', 'Amber', 'Over-threshold flag', 'r3'],
  ['--danger', 'Rust red', 'Over budget by more than 5%', 'r3'],
  ['--r-card', '10 px', 'Card radius', 'r3'],
  ['--t13', '13 px', 'Body text in tables', 'r2'],
];
export const GAPB_GAPS = [
  { id: 'GAP-01', need: 'Variance bridge (waterfall) chart', closest: 'components/flow-diagram', why: 'Signed bands, no running total', used: 'F-05 · T-218', st: ['warn', 'Open'] },
  { id: 'GAP-02', need: 'Threshold slider with live preview', closest: 'components/slider', why: 'No preview of affected rows', used: 'F-06 · T-221', st: ['warn', 'Open'] },
  { id: 'GAP-03', need: 'Period picker (month, quarter, custom)', closest: 'components/date-range', why: 'No fiscal period presets', used: 'F-01 · T-205', st: ['acc', 'Proposal'] },
  { id: 'GAP-04', need: 'Package cost-line drawer', closest: 'components/side-sheet', why: 'No sticky totals row', used: 'F-04 · T-214', st: ['ok', 'Closed by kit r3'] },
];
// R-DS-8: per-file licence and provenance review of a reuse candidate
export const GAPB_PROV = [
  { file: 'StatusPill.tsx', src: 'OpenDesign e033aad', lic: 'Apache-2.0', obl: 'Keep NOTICE; list change', v: ['ok', 'Eligible'] },
  { file: 'DiffHunk.tsx', src: 'OpenDesign e033aad', lic: 'Apache-2.0', obl: 'Keep NOTICE; list change', v: ['ok', 'Eligible'] },
  { file: 'RevealBlock.tsx', src: 'Momo (public repo)', lic: 'none found', obl: 'No licence: no copy', v: ['bad', 'Blocked'] },
  { file: 'canvas-core/ (whole app)', src: 'Onlook', lic: 'Apache-2.0', obl: 'Whole stack adoption', v: ['mute', 'Not offered'] },
];

// ---- S19: glossary and ADRs (R-STD-2)
export const GAPB_TERMS = [
  { term: 'Forecast', id: 'Perkiraan', al: 'EAC, cost-to-complete', ctx: 'Cost control', def: 'The latest estimate of what a package will cost when finished.', rev: 'r10', pill: ['ok', 'Accepted'] },
  { term: 'Variance', id: 'Selisih', al: 'Delta', ctx: 'Cost control', def: 'Forecast minus budget for one package, as a number and a percent.', rev: 'r10', pill: ['ok', 'Accepted'] },
  { term: 'Package', id: 'Paket kerja', al: 'Work package, WP', ctx: 'Cost control', def: 'A priced slice of the yard works, such as Jacket fabrication.', rev: 'r8', pill: ['ok', 'Accepted'] },
  { term: 'Period', id: 'Periode', al: 'Cost period', ctx: 'Reporting', def: 'One calendar month of the monthly cost export.', rev: 'r8', pill: ['ok', 'Accepted'] },
  { term: 'Threshold', id: 'Ambang batas', al: 'Alert limit', ctx: 'Alerts', def: 'The percent over budget at which a package is flagged.', rev: 'r14', pill: ['ok', 'Accepted'] },
];
export const GAPB_ADRS = [
  { id: 'ADR-003', t: 'Store money as integer minor units', st: ['ok', 'Accepted'], rev: 'r12', link: 'PRN-1' },
  { id: 'ADR-004', t: 'Variance is computed on the server', st: ['ok', 'Accepted'], rev: 'r13', link: 'R-DASH-014' },
  { id: 'ADR-005', t: 'Thresholds are per package, with a project default', st: ['acc', 'Proposed'], rev: 'base r14', link: 'R-DASH-017' },
  { id: 'ADR-002', t: 'Show variance in USD millions only', st: ['mute', 'Superseded by ADR-006'], rev: 'r7', link: 'R-DASH-009' },
  { id: 'ADR-006', t: 'Show variance in the package currency, USD as the total', st: ['ok', 'Accepted'], rev: 'r11', link: 'R-DASH-009' },
];
export const GAPB_ADR3 = {
  ctx: 'Forecasts arrive from the cost export as decimals. Summing rounded values drifted by 0.02 USD m on Jacket fabrication.',
  alts: ['Floating point (rejected: drift)', 'Decimal strings (rejected: slow to sum)', 'Integer minor units (chosen)'],
  decision: 'Store every money value as an integer count of cents. Round only when drawing a number.',
  cons: 'Import needs a conversion step. Reports can not show sub-cent values. Linked requirement: R-DASH-014.',
};
export const GAPB_PROPOSAL = {
  src: 'Chat · message 4 · Rina asked if "forecast" and "EAC" are the same',
  base: 'r14',
  affects: ['GLO-02 Forecast', 'R-DASH-014', 'F-03'],
};
