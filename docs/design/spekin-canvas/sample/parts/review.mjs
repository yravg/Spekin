// Sample data for the review board group (S32 Targeted change, S33 Review and accept, S08 diff). Fictional; same project as meranti-yard.mjs.
// Prefix every export with REVIEW_. Figures follow S.PACKAGES: budget 30.65, forecast 31.65 (13.10 + 8.31 + 6.28 + 3.96), variance +3.3%.
export const REVIEW_READY = true;

// ---- S32: the part, the change and what moved with it (checked by hand: 6.28 to 5.95 gives +0.8%, forecast 31.32, variance +2.2%, one alert left)
export const REVIEW_PART = {
  frame: 'F-03 Variance table', rev: 'r6', draft: 'r7',
  cell: { name: 'Forecast cell', pkg: 'P-03', size: '46 × 22', font: '12.5 px mono', before: '6.28', after: '5.95', ask: 'Set the forecast to 5.95 after the re-quote' },
  pill: { name: 'Variance pill', pkg: 'P-03', size: '57 × 22', font: '12 px 600', text: '+6.4%', ask: 'Show how many periods it is over' },
};
export const REVIEW_ALSO = [
  { el: 'P-03 variance', where: 'Row P-03', from: '+6.4%', to: '+0.8%' },
  { el: 'Forecast total', where: 'KPI row', from: '31.65', to: '31.32' },
  { el: 'Variance KPI', where: 'KPI row', from: '+3.3%', to: '+2.2%' },
  { el: 'Alerts KPI', where: 'KPI row', from: '2', to: '1' },
];
export const REVIEW_OUTSIDE = 'F-04 Alert drawer still lists P-03 at +6.4%. This edit did not touch it.';
export const REVIEW_VARIANTS = [
  { id: 1, label: 'Count in the pill', hint: 'One pill, count after a dot', text: '+6.4% · 2 periods', badge: '' },
  { id: 2, label: 'Arrow and count', hint: 'Trend arrow, short count', text: '▲ +6.4% · 2 per.', badge: '' },
  { id: 3, label: 'Count badge', hint: 'Pill stays, small badge', text: '+6.4%', badge: '2' },
];

// ---- S33: seven nitpick changes on F-03 (item 5 changed again after its nitpick, so it is stale)
export const REVIEW_NITS = [
  { n: 1, el: 'Page title', what: 'Sentence case', tip: 'Title reads in sentence case at 15 px.', key: 'title' },
  { n: 2, el: 'Threshold chip', what: 'Cites r14', tip: 'Chip now reads “Threshold 3% · r14”.', key: 'thr' },
  { n: 3, el: 'KPI cards', what: 'Equal height', tip: 'Four cards share one height; figures use tabular digits.', key: 'kpi' },
  { n: 4, el: 'Table header', what: 'Dim 11 px labels', tip: 'Labels moved from 13 px ink to 11 px dim ink in a 32 px row.', before: '13 px ink', after: '11 px dim', key: 'head' },
  { n: 5, el: 'Forecast cell P-03', what: 'Padding 12 px', tip: 'Cell padding 10 to 12 px, mono weight 500.', key: 'f3', stale: true, seen: '6.28', now: '5.95' },
  { n: 6, el: 'Variance pill P-03', what: 'AA contrast', tip: 'Pill text raised to AA contrast.', key: 'v3' },
  { n: 7, el: 'Source line', what: 'Names spec r14', tip: 'Source line names the spec revision.', key: 'foot' },
];

// ---- S08: spec proposal P-07, r14 to r15. Segments: [kind, text] with kind eq, add or del.
export const REVIEW_PROPOSAL = {
  id: 'P-07', from: 'r14', to: 'r15', title: 'Add the 2-period alert rule and the variance display rule',
  by: 'Spekin, from the F-03 review', at: '12:46', snapshot: '7a1e…c4d',
  hunks: [
    { id: 'H1', kind: 'Added requirement', ref: 'R-DASH-019', name: 'Alert after 2 periods over 3%', src: 'Chat proposal, 12:44',
      old: null, now: [['add', 'Raise an alert for a package when its variance stays above 3% for 2 consecutive periods.']] },
    { id: 'H2', kind: 'Added requirement', ref: 'R-DASH-020', name: 'Variance display', src: 'F-03 review, item 6',
      old: null, now: [['add', 'Show variance with a sign and one decimal place, for example +6.4% or −3.4%.']] },
    { id: 'H3', kind: 'Changed criterion', ref: 'AC-014.2', name: 'Over-threshold rows flagged', src: 'F-03 review, item 6',
      old: [['eq', 'Over-threshold rows are flagged.']],
      now: [['eq', 'Over-threshold rows are flagged'], ['add', ' with a pill that shows the number of periods'], ['eq', '.']] },
    { id: 'H4', kind: 'Added ticket', ref: 'T-219', name: 'Empty state when no package is over 3%', src: 'Gap check, S35',
      old: null, now: [['add', 'Show “No package over 3% this period” when no row is over. Proposed ticket.']] },
  ],
  links: [
    { id: 'R-DASH-019', t: 'Alert after 2 periods over 3%', sub: 'New in r15 · from chat proposal', p: ['acc', 'New'] },
    { id: 'R-DASH-020', t: 'Variance display', sub: 'New in r15 · from F-03 review', p: ['acc', 'New'] },
    { id: 'R-DASH-014', t: 'Variance threshold per package', sub: 'Unchanged · accepted r14', p: ['ok', 'Unchanged'] },
  ],
  affected: [
    { id: 'AC-014.2', t: 'Over-threshold rows flagged', sub: 'Criterion text changes (H3)', p: ['warn', 'Needs review'] },
    { id: 'T-212', t: 'Build variance table', sub: 'Frontend task · not started', p: ['warn', 'Needs review'] },
    { id: 'AC-019.1', t: 'Alert raised after 2 periods', sub: 'New criterion · no evidence yet', p: ['mute', 'Untested'] },
    { id: 'API-2', t: 'API contract · variance alerts', sub: 'Backend · contract r2', p: ['warn', 'Needs review'] },
    { id: 'T-219', t: 'Empty state, no package over 3%', sub: 'Proposed ticket · joins S15 on accept', p: ['acc', 'Proposed'] },
  ],
  sources: ['F-03 review · 7 changes', 'REF-02 Site cost report', 'Gap check, S35'],
  audit: { accepted: { id: 'A-0231', at: '12:52', text: 'Accepted P-07: created r15 from r14, 4 of 4 hunks' },
           rejected: { id: 'A-0232', at: '12:52', text: 'Rejected P-07: r14 stays current, nothing written' } },
  accepted: { hunks: '4 of 4 hunks', parent: 'r14', snapshot: '7a1e…c4d' },
};
