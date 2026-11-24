// Gaps canvas plan (24 Nov 2026): the PRD requirements that no screen draws yet, grouped into boards.
// Source of the 38 gaps: docs/handoff/req-map-2026-11-24.md (IMP-52), verdict "gap". The build (build-gaps.mjs)
// fails if a gap row is missing here or listed twice, so this plan and the classification cannot drift apart.
// Board codes are the PRD's own screen codes (inputs/Spekin-PRD-v0.2.3.md, screen list S01-S26).

export const GAP_BOARDS = [
  { code: 'S02', file: 'S02-sign-in', name: 'Sign-in and legal pages', group: 'A', f: 401, reqs: ['R-ONB-9', 'R-LANG-4'] },
  { code: 'S04', file: 'S04-interview', name: 'Interview', group: 'A', f: 411, reqs: ['R-ONB-5', 'R-ONB-6', 'R-STD-1', 'R-STD-8'] },
  { code: 'S05', file: 'S05-decision-log', name: 'Decision log', group: 'A', f: 421, reqs: ['R-ONB-4', 'R-DS-2'] },
  { code: 'S06', file: 'S06-pitch', name: 'Pitch (Simple)', group: 'A', f: 431, reqs: ['R-ONB-7'] },
  { code: 'S07', file: 'S07-spec-depth', name: 'Spec document at every depth', group: 'B', f: 441, reqs: ['R-EDT-5', 'R-EDT-8', 'R-PRI-1', 'R-PRI-3', 'R-EVD-6'] },
  { code: 'S14', file: 'S14-design-system', name: 'Design system: kit and GAP register', group: 'B', f: 451, reqs: ['R-DS-4', 'R-DS-8'] },
  { code: 'S19', file: 'S19-adrs-glossary', name: 'ADRs and glossary', group: 'B', f: 461, reqs: ['R-STD-2'] },
  { code: 'S15', file: 'S15-ticket-board', name: 'Ticket board', group: 'C', f: 471, reqs: ['R-KEEP-1', 'R-KEEP-2', 'R-DS-3', 'R-STD-4', 'R-WF-7', 'R-KEEP-6'] },
  { code: 'S16', file: 'S16-ticket-detail', name: 'Ticket detail and criteria', group: 'C', f: 481, reqs: ['R-DS-6'] },
  { code: 'S21', file: 'S21-canvas-step', name: 'Canvas step and sandboxed preview', group: 'C', f: 491, reqs: ['R-KEEP-5', 'R-SEC-3'] },
  { code: 'S18', file: 'S18-review-report', name: 'Verification and review report', group: 'D', f: 501, reqs: ['R-STD-5'] },
  { code: 'S20', file: 'S20-agent-inbox', name: 'Agent inbox', group: 'D', f: 511, reqs: ['R-AGT-1'] },
  { code: 'S25', file: 'S25-export', name: 'Export (Markdown, zip, yravgbuilder)', group: 'D', f: 521, reqs: ['R-KEEP-4'] },
];

// Gaps that are engineering or team rules, not screens: G00 lists them as cards for task cards, no board.
export const GAP_RULES = ['R-AGT-5', 'R-ARC-4', 'R-MOT-3', 'R-MOT-6', 'R-KEEP-7', 'R-REU-1', 'R-REU-3', 'R-WIR-1', 'R-WIR-2'];

export const GROUPS = {
  A: 'Start: sign-in, interview, decisions and pitch',
  B: 'Living spec: depth, design system, ADRs and glossary',
  C: 'Build plan: tickets, ticket detail, canvas step',
  D: 'Delivery: review report, agent inbox, export',
};
export const GROUP_ORDER = { A: 1, B: 2, C: 3, D: 4 };
