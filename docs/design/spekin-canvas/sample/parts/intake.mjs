// Sample data for the intake board group (S27 Projects, S28 Reference intake). Fictional; same world as meranti-yard.mjs.
// Every export is prefixed INTAKE_. Stage marks use the same tones as STAGES in meranti-yard.mjs: ok, half, ring, warn, bad.
export const INTAKE_READY = true;

// Projects: stages is the 8-mark row in stage order (Planning .. Deployment); at is the last-opened label; thumb picks a drawn thumbnail.
export const INTAKE_PROJECTS = [
  { id: 'meranti-yard', name: 'Meranti Yard', idea: 'Cost variance dashboard', inc: 'Inc. 2 · Variance alerts', stages: ['ok', 'ok', 'half', 'ring', 'warn', 'bad', 'half', 'ring'], now: 'Design · 3 to review', at: 'Today 12:41', ago: '12:41', owner: 'Rina (sample)', ini: 'RS', role: 'Owner', thumb: 'dash' },
  { id: 'kenari-fleet', name: 'Kenari Fleet', idea: 'Vessel schedule board', inc: 'Inc. 1 · First release', stages: ['ok', 'ok', 'ok', 'half', 'ring', 'ring', 'ring', 'ring'], now: 'Frontend · in progress', at: 'Today 09:15', ago: '09:15', owner: 'Dimas (sample)', ini: 'DM', role: 'Viewer', thumb: 'gantt' },
  { id: 'bakau-permits', name: 'Bakau Permits', idea: 'Permit tracker', inc: 'Inc. 3 · Renewal reminders', stages: ['ok', 'ok', 'ok', 'ok', 'ok', 'half', 'half', 'ring'], now: 'Integration · in progress', at: 'Yesterday', ago: 'Yesterday', owner: 'Rina (sample)', ini: 'RS', role: 'Owner', thumb: 'table' },
  { id: 'pelita-clinic', name: 'Pelita Clinic', idea: 'Booking portal', inc: 'Inc. 1 · Slots and reminders', stages: ['ok', 'ok', 'half', 'ring', 'ring', 'ring', 'ring', 'ring'], now: 'Design · in progress', at: '19 Nov', ago: '19 Nov', owner: 'Ayu (sample)', ini: 'AY', role: 'Viewer', thumb: 'form' },
  { id: 'rawa-warehouse', name: 'Rawa Warehouse', idea: 'Stock count app', inc: 'Inc. 2 · Cycle counts', stages: ['ok', 'ok', 'ok', 'ok', 'warn', 'ring', 'ring', 'ring'], now: 'Backend · needs review', at: '17 Nov', ago: '17 Nov', owner: 'Dimas (sample)', ini: 'DM', role: 'Owner', thumb: 'cards' },
  { id: 'tembaga-quote', name: 'Tembaga Quote', idea: 'Quote builder', inc: 'Inc. 1 · Price lists', stages: ['ok', 'half', 'ring', 'ring', 'ring', 'ring', 'ring', 'ring'], now: 'Specification · in progress', at: '14 Nov', ago: '14 Nov', owner: 'Rina (sample)', ini: 'RS', role: 'Owner', thumb: 'form' },
  { id: 'sagu-field', name: 'Sagu Field Notes', idea: 'Inspection forms', inc: 'Inc. 1 · Offline forms', stages: ['half', 'ring', 'ring', 'ring', 'ring', 'ring', 'ring', 'ring'], now: 'Planning · in progress', at: '11 Nov', ago: '11 Nov', owner: 'Ayu (sample)', ini: 'AY', role: 'Owner', thumb: 'empty' },
];
export const INTAKE_SWITCH_ORDER = ['meranti-yard', 'kenari-fleet', 'bakau-permits', 'pelita-clinic', 'rawa-warehouse', 'tembaga-quote', 'sagu-field'];
export const INTAKE_NEW = { name: 'Lontar Notices', slug: 'lontar-notices', idea: 'A notice board for a primary school. Teachers post short notices; parents read them in Bahasa Indonesia or English.', ideaLen: 117, max: 4000, min: 20 };
export const INTAKE_DELETED = { id: 'kenari-fleet', by: 'Dimas (sample)', at: '12:43', days: 30 };
export const INTAKE_COMPOSER = { text: 'A cost variance dashboard for offshore project teams. Flag any work package that is more than 3 percent over budget, and show why.', len: 131 };

// Reference intake (S28). Limits are ASSUMPTIONS until the owner sets them (PRD §17.1 lists screenshots <= 30 per reference).
export const INTAKE_LIMITS = { types: 'PNG, JPEG, WebP', sizeMb: 10, perImport: 30, keepDays: 30 };
// Reference images already on the project: REF-02 is in S35. New ones continue the numbering.
export const INTAKE_REFS = {
  r3: { id: 'REF-03', src: 'site-costs-q2.png', kind: 'PNG', size: '1.2 MB', dim: '1440 × 900' },
  r4: { id: 'REF-04', src: 'tracker-weekly.webp', kind: 'WebP', size: '860 KB', dim: '1280 × 800' },
  r5: { id: 'REF-05', src: 'status-board.png', kind: 'PNG', size: '520 KB', dim: '1280 × 720' },
  r6: { id: 'REF-06', src: 'Pasted screenshot 12:36', kind: 'PNG', size: '340 KB', dim: '1280 × 720' },
};
// Fictional addresses on the reserved .test domain, shown inside a drawn screenshot only.
export const INTAKE_PII = [['Putri Lestari', 'putri.l@example.test', 'P-01'], ['Bayu Santoso', 'bayu.s@example.test', 'P-02'], ['Citra Dewi', 'citra.d@example.test', 'P-03'], ['Eko Prasetyo', 'eko.p@example.test', 'P-04']];
