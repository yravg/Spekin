// Sample data for gaps-canvas group D (boards-gap-d.mjs). Names start with GAPD_. Fictional Meranti Yard only.
export const GAPD_READY = true;

// S18 review report. Two separate axes (R-STD-5): spec coverage and documented-standards conformance.
export const GAPD_REVIEW = {
  rev: 'r14', build: 'build 0412 · branch inc-2-alerts', at: '24 Nov 12:52', reviewer: 'Independent review run RUN-0418',
  evidence: [
    ['repo', 'Repository snapshot', 'inc-2-alerts @ 3f9a1c2', 'ok', 'Read'],
    ['server', 'Pinned build', 'build 0412', 'ok', 'Read'],
    ['check', 'Test run', '38 passed · 2 failed · 4 not run', 'warn', 'Partial'],
    ['doc', 'Standards set', 'SD-01 to SD-09 (accepted)', 'ok', 'Read'],
  ],
  missing: [
    ['E2E run on build 0412', 'Not uploaded. R-DASH-019 cannot be shown met.'],
    ['Security scan report', 'Not connected. Authorization risk stays open.'],
  ],
  spec: [
    ['R-DASH-014', 'Variance threshold per package', 'met', 'T-212 · AC-014.1 passed on build 0412'],
    ['R-DASH-015', 'Drill down from package to cost lines', 'met', 'AC-015.1, AC-015.2 passed'],
    ['R-DASH-016', 'Export the variance table', 'unmet', 'AC-016.2 failed: CSV drops the Var. column'],
    ['R-DASH-019', 'Alert after 2 periods over 3%', 'missing', 'No run on build 0412'],
    ['R-DASH-021', 'Empty state when no package is over', 'untested', 'No test defined'],
  ],
  specCounts: { met: 2, unmet: 1, untested: 1, missing: 1 },
  std: [
    ['SD-03', 'Accessible names on icon buttons', 'passed', 'Checked on 14 controls'],
    ['SD-05', 'Currency shown with two decimals', 'failed', 'Forecast column shows 1 decimal'],
    ['SD-07', 'Contrast of status text', 'passed', 'Checked on 6 states'],
    ['SD-08', 'Secrets by name only', 'untested', 'No scan connected'],
  ],
  stdCounts: { passed: 2, failed: 1, untested: 1, missing: 0 },
  findings: [
    ['FND-01', 'R-DASH-016', 'CSV drops the Var. column', 'High', 'Table export', 'Unmet', 'bad'],
    ['FND-02', 'SD-05', 'Forecast shown with 1 decimal', 'Medium', 'Variance table', 'Failed', 'bad'],
    ['FND-03', 'R-DASH-019', 'No evidence on build 0412', 'High', 'Alert rule', 'Evidence missing', 'mute'],
    ['FND-04', 'R-DASH-021', 'No test for the empty state', 'Low', 'Variance table', 'Untested', 'warn'],
  ],
  risk: [
    ['Authorization and security', 'warn', 'Alert acknowledge route has no role check in the contract.', 'Decide: who may acknowledge?'],
    ['Reversibility', 'ok', 'Alerts are read-only; acknowledge can be undone.', 'No decision needed'],
    ['Data and tenant exposure', 'ok', 'Thresholds read from spec r14, per project.', 'No decision needed'],
    ['External effects', 'ok', 'No email or webhook is sent.', 'No decision needed'],
    ['Migration', 'warn', 'Migration 0007 adds a table; no rollback script yet.', 'Decide: rollback plan'],
    ['Monetary impact', 'bad', 'Threshold bug could hide a +6.4% overrun on P-03.', 'Decide: block release?'],
  ],
  proposals: [
    ['T-231', 'Keep the Var. column in CSV export', 'R-DASH-016', 'FND-01'],
    ['T-232', 'Show forecast with two decimals', 'SD-05', 'FND-02'],
    ['T-233', 'Add a test for the empty state', 'R-DASH-021', 'FND-04'],
  ],
};

// S20 agent inbox. The six background-run types of R-AGT-1.
export const GAPD_RUNS = [
  { id: 'RUN-0421', type: 'Interview turn', icon: 'comment', title: 'Next question: alert recipients', where: 'Planning', st: 'run', step: 'Step 2 of 3 · reading answers', cost: '0.9k · 8 s', cr: '4 cr' },
  { id: 'RUN-0420', type: 'Depth expansion', icon: 'doc', title: 'Expand R-DASH-019 to Detailed', where: 'Specification', st: 'run', step: 'Step 3 of 5 · drafting criteria', cost: '4.2k · 41 s', cr: '14 cr' },
  { id: 'RUN-0419', type: 'Reference capture', icon: 'image', title: 'Capture REF-03 Vendor cost portal', where: 'Planning', st: 'wait', step: 'Waiting for your approval', cost: 'reserve 18 cr', cr: '18 cr max' },
  { id: 'RUN-0418', type: 'Independent review', icon: 'eye', title: 'Review build 0412 against r14', where: 'Testing', st: 'done', step: 'Report ready · 3 gaps', cost: '9.6k · 2 min', cr: '31 cr' },
  { id: 'RUN-0417', type: 'Ticket breakdown', icon: 'list', title: 'Break Inc. 2 into AREA-NNN tickets', where: 'Planning', st: 'wait', step: 'Waiting for your approval', cost: 'reserve 26 cr', cr: '26 cr max' },
  { id: 'RUN-0416', type: 'Verification intake', icon: 'check', title: 'Read test results of build 0412', where: 'Testing', st: 'fail', step: 'Failed at step 2: results.xml not readable', cost: '1.1k · 6 s', cr: '3 cr' },
];
export const GAPD_STEPS = [
  ['ok', 'Read R-DASH-019 and its two linked frames'],
  ['ok', 'Listed 4 open questions from the decision log'],
  ['run', 'Drafting acceptance criteria for the 2-period rule'],
  ['mute', 'Check criteria against DESIGN.md tokens'],
  ['mute', 'Write the proposal to review (S08)'],
];

// S25 export.
export const GAPD_EXPORT = {
  rev: 'r14', name: 'meranti-yard-inc2-r14',
  tree: [
    ['dir', 'spec/', ''],
    ['file', 'spec/00-brief.md', '2.1 KB'],
    ['file', 'spec/10-requirements.md', '14.8 KB'],
    ['file', 'spec/20-acceptance.md', '9.3 KB'],
    ['dir', 'design/', ''],
    ['file', 'design/DESIGN.md', '3.4 KB'],
    ['file', 'design/tokens.json', '1.2 KB'],
    ['file', 'design/components.md', '2.7 KB'],
    ['dir', 'tickets/', ''],
    ['file', 'tickets/AREA-tickets.md', '11.5 KB'],
    ['file', 'MANIFEST.json', '0.9 KB'],
  ],
  tickets: [
    ['VAR-001', 'Variance table with 3% threshold flag', 'AC-014.1 Rows over 3% show a red value and a Over label', 'Accepted', 'ok'],
    ['VAR-002', 'Drill down from package to cost lines', 'AC-015.1 Click a package: cost lines open in a drawer', 'Accepted', 'ok'],
    ['VAR-003', 'Export the variance table as CSV', 'AC-016.2 CSV has the same 5 columns as the table', 'Proposed', 'acc'],
    ['VAR-004', 'Alert after 2 periods over 3%', 'AC-019.1 Alert shows after the second period', 'Proposed', 'acc'],
  ],
  layers: [['Brief and decisions', 'r14', '3 files'], ['Requirements', 'r14', '24 items'], ['Acceptance criteria', 'r14', '31 items'], ['Tickets as AREA-NNN rows', 'r14', '4 tickets'], ['DESIGN.md, tokens, components', 'r3', '3 files']],
  left: [['3 draft frames', 'F-04 and 2 takes are not accepted'], ['2 proposals', 'R-DASH-019 and R-DASH-021 wait in review'], ['1 stale ticket', 'T-198 points at spec r12']],
  statusBack: [
    ['VAR-001', 'Accepted', 'Built · tests pass', 'ok'],
    ['VAR-002', 'Accepted', 'In progress', 'warn'],
    ['VAR-003', 'Proposed', 'Not in export scope', 'mute'],
  ],
};
export const GAPD_CTX = [['doc', 'Spec r14', 'r14'], ['req', 'R-DASH-014', 'r14'], ['server', 'build 0412', 'pinned']];
