// Sample data for the style board group (S30 Style review, S38 Contextual GenUI). Fictional; same project as meranti-yard.mjs.
// Every export is prefixed STYLE_. Colour values are computed here from the yravgUI tokens (same maths as CSS color-mix in srgb),
// so a swatch on the board and the hex printed next to it can never disagree.
const TK = { accent: 'B4532A', canvas: 'FAF9F5', surface: 'FFFFFF', ink: '1F1F1F', ok: '3F7D5A', warn: 'C98A2B', danger: '8E3B24', line: 'E6E2D8', track: 'EEE9DF' };
const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (a) => '#' + a.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const tok = (k) => ({ hex: '#' + TK[k], css: 'var(--' + k + ')' });
const mix = (a, p, b) => ({ hex: hex(rgb(TK[a]).map((v, i) => (v * p) / 100 + (rgb(TK[b])[i] * (100 - p)) / 100)), css: 'color-mix(in srgb, var(--' + a + ') ' + p + '%, var(--' + b + '))' });
const lum = (h) => { const c = rgb(h.slice(1)).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
export const STYLE_contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return ((x + 0.05) / (y + 0.05)).toFixed(1); };

// Two imported references (REF-02 is the one S35 already shows). Steps are real job steps, not a fake percentage.
export const STYLE_REFS = [
  { id: 'REF-02', name: 'Site cost report', kind: 'PNG · imported', at: '12:31', read: 'Read in full', steps: 5 },
  { id: 'REF-03', name: 'Package status page', kind: 'PNG · imported', at: '12:33', read: 'Reading', steps: 5, at_step: 3 },
];
export const STYLE_STEPS = ['Read the image', 'Find colours', 'Find type', 'Find shapes and icons', 'Write the draft'];
export const STYLE_NEWREF = { id: 'REF-04', name: 'Yard KPI sheet', kind: 'PNG · imported', at: '13:05' };

// Token states: ok = Accepted (equals the confirmed value in DESIGN.md r3), inf = Inferred (new, from a reference), cf = Conflict (inferred differs from confirmed).
// refs = which references show it. seen = what the extractor counted (a count of elements, never a percentage of belief).
const INF_ACCENT = mix('ok', 75, 'ink');
export const STYLE_TOKENS = [
  { id: 'color.canvas', g: 'color', name: 'Canvas', v: tok('canvas'), st: 'ok', refs: ['REF-02', 'REF-03'], seen: 'page ground' },
  { id: 'color.ink', g: 'color', name: 'Ink', v: tok('ink'), st: 'ok', refs: ['REF-02', 'REF-03'], seen: 'body text' },
  { id: 'color.line', g: 'color', name: 'Line', v: tok('line'), st: 'ok', refs: ['REF-02'], seen: '14 dividers' },
  { id: 'color.accent', g: 'color', name: 'Accent', v: tok('accent'), alt: INF_ACCENT, st: 'cf', refs: ['REF-03'], seen: '6 elements', altName: 'forest' },
  { id: 'color.success', g: 'color', name: 'Success', v: tok('ok'), st: 'ok', refs: ['REF-02'], seen: '3 status dots' },
  { id: 'color.warning', g: 'color', name: 'Warning', v: tok('warn'), st: 'ok', refs: ['REF-02'], seen: '2 flags' },
  { id: 'color.band', g: 'color', name: 'Table band', v: mix('track', 60, 'canvas'), st: 'inf', refs: ['REF-02'], seen: '12 rows' },
  { id: 'color.focus', g: 'color', name: 'Focus ring', v: mix('ok', 55, 'canvas'), st: 'inf', refs: ['REF-03'], seen: '4 focused fields' },
  { id: 'color.chart2', g: 'color', name: 'Chart series 2', v: mix('warn', 55, 'ok'), st: 'inf', refs: ['REF-02'], seen: '1 chart' },
  { id: 'type.display', g: 'type', name: 'Display', spec: '44 / 1.1 · 600', cls: 't44', st: 'ok', refs: ['REF-02', 'REF-03'], seen: '1 heading', smp: 'Aa 3.3%' },
  { id: 'type.title', g: 'type', name: 'Title', spec: '26 / 1.2 · 600', cls: 't26', st: 'ok', refs: ['REF-02', 'REF-03'], seen: '2 headings', smp: 'Variance' },
  { id: 'type.heading', g: 'type', name: 'Heading', spec: '18 / 1.3 · 600', cls: 't18', st: 'ok', refs: ['REF-02'], seen: '5 headings', smp: 'Packages' },
  { id: 'type.body', g: 'type', name: 'Body', spec: '13 / 1.45 · 400', cls: 't13', st: 'ok', refs: ['REF-02', 'REF-03'], seen: '30+ lines', smp: 'Forecast exceeds budget by 3.3%' },
  { id: 'type.caption', g: 'type', name: 'Caption', spec: '11 / 1.3 · 500 · caps', cls: 'cap', st: 'inf', refs: ['REF-03'], seen: '9 labels', smp: 'PACKAGE · BUDGET' },
  { id: 'type.figure', g: 'type', name: 'Figures', spec: 'Mono 12 · tabular', cls: 'fig', st: 'inf', refs: ['REF-02'], seen: '4 columns', smp: '31.65  +3.3%' },
  { id: 'space.scale', g: 'space', name: 'Scale', spec: '8 · 16 · 24 · 32', bars: [8, 16, 24, 32], st: 'ok', refs: ['REF-02', 'REF-03'], seen: '40+ gaps' },
  { id: 'space.half', g: 'space', name: 'Half step', spec: '4', bars: [4], st: 'inf', refs: ['REF-02'], seen: '11 gaps' },
  { id: 'radius.input', g: 'radius', name: 'Input', spec: '8', r: 8, st: 'ok', refs: ['REF-02', 'REF-03'], seen: '3 fields' },
  { id: 'radius.card', g: 'radius', name: 'Card', spec: '10', r: 10, alt: { spec: '16', r: 16 }, st: 'cf', refs: ['REF-03'], seen: '5 cards' },
  { id: 'radius.pill', g: 'radius', name: 'Pill', spec: '999', r: 999, st: 'ok', refs: ['REF-02'], seen: '6 chips' },
  { id: 'icon.style', g: 'icon', name: 'Icon style', spec: 'Outline · 1.5 stroke · 16', st: 'inf', refs: ['REF-03'], seen: '14 icons' },
  { id: 'cmp.button', g: 'cmp', name: 'Button', spec: 'ink fill · 8 radius', st: 'ok', refs: ['REF-02', 'REF-03'], seen: '4 buttons' },
  { id: 'cmp.input', g: 'cmp', name: 'Input', spec: '30 high · line border', st: 'ok', refs: ['REF-03'], seen: '3 fields' },
  { id: 'cmp.pill', g: 'cmp', name: 'Status pill', spec: 'soft fill · 10.5 bold', st: 'ok', refs: ['REF-02'], seen: '6 pills' },
  { id: 'cmp.toggle', g: 'cmp', name: 'Toggle', spec: '30 × 18 · ink on', st: 'inf', refs: ['REF-03'], seen: '2 toggles' },
  { id: 'cmp.table', g: 'cmp', name: 'Banded table', spec: 'band on odd rows', st: 'inf', refs: ['REF-02'], seen: '1 table' },
];
export const STYLE_NEWTOKEN = { id: 'color.chart3', g: 'color', name: 'Chart series 3', v: mix('danger', 60, 'warn'), st: 'inf', refs: ['REF-04'], seen: '1 chart' };
// Promotion proposal: DESIGN.md r3 to r4, hunks the user can include or leave out one by one (R-EDT-2).
export const STYLE_HUNKS = [
  { id: 'H1', sec: 'Colour roles', inc: true, add: 3, del: 0, open: true, lines: [['ctx', '| canvas | #FAF9F5 | Page ground |'], ['add', '| table-band | ' + mix('track', 60, 'canvas').hex + ' | Alternate table rows |'], ['add', '| focus-ring | ' + mix('ok', 55, 'canvas').hex + ' | Focus outline |'], ['add', '| chart-2 | ' + mix('warn', 55, 'ok').hex + ' | Second chart series |']] },
  { id: 'H2', sec: 'Type scale', inc: true, add: 2, del: 0, open: true, lines: [['ctx', '| body | 13 / 1.45 · 400 |'], ['add', '| caption | 11 / 1.3 · 500 · caps |'], ['add', '| figures | Mono 12 · tabular |']] },
  { id: 'H3', sec: 'Spacing', inc: false, add: 1, del: 0, open: false, lines: [['add', '| half-step | 4 |']] },
  { id: 'H4', sec: 'Radius', inc: true, add: 1, del: 1, open: true, conf: true, lines: [['mod', '| card | ~~10~~ **16** | Changes a confirmed token |']] },
  { id: 'H5', sec: 'Icons', inc: true, add: 2, del: 0, open: false, lines: [['add', '## Icons'], ['add', 'Outline, 1.5 stroke, 16 px.']] },
  { id: 'H6', sec: 'Components', inc: true, add: 2, del: 0, open: false, lines: [['add', '| toggle | 30 × 18 · ink on |'], ['add', '| banded-table | band on odd rows |']] },
];
export const STYLE_CTX = [['doc', 'DESIGN.md', 'r3'], ['image', 'REF-02 Site cost report', 'r1'], ['image', 'REF-03 Package status page', 'r1']];
