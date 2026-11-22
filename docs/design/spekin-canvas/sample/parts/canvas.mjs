// Sample data for the canvas board group (S29 Frames canvas, S31 Alternatives). Fictional; same project as meranti-yard.mjs.
// Every export is prefixed CANVAS_. Numbers here must match what the boards draw.

// Frames on the Variance flows board. size = design size in px, shown in the selection chip. kind separates editable frames from references (R-CAN-2).
export const CANVAS_FRAMES = {
  f01: { id: 'F-01', name: 'Portfolio overview', rev: 'r4', st: 'accepted', ui: 'portfolio', size: '1280 × 900' },
  f02: { id: 'F-02', name: 'Package drill-down', rev: 'r2', st: 'accepted', ui: 'drill', size: '1280 × 900' },
  f03: { id: 'F-03', name: 'Variance table', rev: 'r6', st: 'accepted', ui: 'base', size: '1280 × 900' },
  f04: { id: 'F-04', name: 'Alert drawer', rev: 'r1', st: 'draft', ui: 'drawer', size: '1280 × 900' },
  f05: { id: 'F-05', name: 'Empty state', rev: 'r1', st: 'draft', ui: 'empty', size: '1280 × 900' },
  ref2: { id: 'REF-02', name: 'Site cost report', rev: '', st: 'reference', ui: 'ref', size: '960 × 900', kind: 'PNG · imported' },
};

// Earlier chats of this board, stacked behind the prompt bar (newest first).
export const CANVAS_CHATS = [
  { t: 'Alert drawer for packages over 3%', meta: '6 messages · F-04 · 12:20' },
  { t: '5 takes on the variance table', meta: '4 messages · F-03 · 11:52' },
  { t: 'Wording for the empty state', meta: '3 messages · F-05 · 11:30' },
];

// View menu: label, keys.
export const CANVAS_VIEWMENU = [
  ['Zoom to fit', 'Shift+1'], ['Zoom to selection', 'Shift+2'], ['Actual size (100%)', 'Ctrl+0'], ['Zoom in', 'Ctrl+ +'], ['Zoom out', 'Ctrl+ −'],
];

// Jobs on the board while it is busy. cap = design slots at once on the Hosted source.
export const CANVAS_JOBS = { cap: 2, designing: ['F-03 r7', 'F-04 r2'], waiting: ['F-02 r3'], failed: ['F-05 r1'] };

// Takes of F-03 Variance table against baseline r8 (the accepted revision). angle titles each take (R-WS-6).
export const CANVAS_BASELINE = { frame: 'F-03', name: 'Variance table', rev: 'r8', size: '1280 × 900', ds: 'DESIGN.md r3', req: 'R-DASH-014 r14' };
export const CANVAS_TAKES = [
  { n: 1, angle: 'Hierarchy', ui: 'hierarchy', line: 'The total variance becomes one large figure above the table.', changes: [['Header', 'Variance +3.3% is the hero figure; Budget and Forecast step back'], ['Table', 'Unchanged']] },
  { n: 2, angle: 'Density', ui: 'density', line: 'Rows shrink to 28 px so six packages fit without scrolling.', changes: [['Rows', '38 px to 28 px, two more packages visible'], ['Chart', 'Removed to make room']] },
  { n: 3, angle: 'Contrast', ui: 'contrast', line: 'Packages over 3% get a solid band and an icon, so status no longer rests on red text alone.', changes: [['Over-threshold rows', 'Solid left band and tinted row'], ['Variance figures', 'Bold, full-strength ink'], ['Status column', 'Icon and the words "Over 3%"']] },
  { n: 4, angle: 'Layout', ui: 'layout', line: 'A filter bar replaces the KPI row and the totals stay pinned under the table.', changes: [['Filters', 'Period, package group, over 3% only'], ['Totals', 'Pinned footer row']] },
  { n: 5, angle: 'Copy', ui: 'copy', line: 'Plainer column names: Planned, Expected, Over plan.', changes: [['Headers', 'Four columns renamed'], ['Status', '"Needs a look" instead of "Alert"']] },
];
// Changed regions of take 3 against the baseline, in the 640 x 450 preview space: [label, left, top, width, height].
export const CANVAS_REGIONS = [['1', 12, 148, 616, 38], ['2', 12, 224, 616, 38], ['3', 496, 120, 132, 180]];
export const CANVAS_STACK = { count: 5, input: ['F-03 r8', 'DESIGN.md r3', 'R-DASH-014 r14'], cost: '≈ 54 cr for 5 takes', kept: { id: 'F-06', from: 3 } };
