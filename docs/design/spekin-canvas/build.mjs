// Spekin design canvas generator.  node build.mjs  ->  project/*.dc.html, project/canvas.json, offline/index.html
// One source of truth for the Claude Design canvas and the offline copy. Boards come from boards-*.mjs.
// Heights come from render.mjs (heights.json): run build -> render -> build.
import { writeFileSync, readFileSync, existsSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as K from './kit.mjs';
import { featureMap, engineBoard } from './maps-boards.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// SPK_OUT: write to another folder (a worker's private copy); SPK_ONLY: comma list of boards-*.mjs names to build.
const OUT = process.env.SPK_OUT || 'project';
const R = HERE + (K.PUBLISH ? 'publish/project' : OUT);
mkdirSync(R, { recursive: true });
// One stylesheet: spekin.css, then css/*.css (one file per board group), sorted.
const cssParts = existsSync(HERE + 'css') ? readdirSync(HERE + 'css').filter((f) => f.endsWith('.css') && !f.startsWith('gap-')).sort() : [];
writeFileSync(R + '/spekin.css', [readFileSync(HERE + 'spekin.css', 'utf8'), ...cssParts.map((f) => `/* ---- css/${f} */\n` + readFileSync(HERE + 'css/' + f, 'utf8'))].join('\n'));
if (OUT !== 'project' || K.PUBLISH) {
  copyFileSync(HERE + 'project/support.js', R + '/support.js');
  if (!K.PUBLISH && existsSync(HERE + 'project/ref')) { mkdirSync(R + '/ref', { recursive: true }); for (const f of readdirSync(HERE + 'project/ref')) copyFileSync(HERE + 'project/ref/' + f, R + '/ref/' + f); }
}
const heights = existsSync(HERE + 'heights.json') ? JSON.parse(readFileSync(HERE + 'heights.json', 'utf8')) : {};
const add = (o) => K.board(R, writeFileSync, heights, o);

const ONLY = (process.env.SPK_ONLY || '').split(',').filter(Boolean);
const mods = readdirSync(HERE).filter((f) => /^boards-.*\.mjs$/.test(f) && !f.startsWith('boards-gap-') && (!ONLY.length || ONLY.some((o) => f.includes(o)))).sort();
const tiers = [];
for (const f of mods) {
  const m = await import(pathToFileURL(HERE + f).href);
  const list = m.boards(K);
  list.forEach(add);
  const files = list.map((b) => b.file + '.dc.html'), same = tiers.find((t) => t.name === m.tier);
  if (same) same.files.push(...files); else tiers.push({ name: m.tier, order: m.order ?? 9, files });
}
tiers.sort((a, b) => a.order - b.order);

let bad = 0;
for (const b of K.BOARDS) {
  const s = readFileSync(`${R}/${b.file}`, 'utf8'), n = (re) => (s.match(re) || []).length;
  const errs = [];
  if (n(/class="note[ "]/g) < 2) errs.push('needs 2 notes');
  if (n(/class="stat new"/g) && !n(/class="newtag"/g)) errs.push('New story, no NEW tag');
  if (/\{\{(?!is_|go_| ?(true|false))/.test(s)) errs.push('stray {{ }} binding');
  if (errs.length) { bad++; console.log('FAIL', b.file, errs.join('; ')); }
}

// ---- cover + index
const S = K.STORIES, cnt = (k) => S.filter((s) => s.st === k).length;
const esc = (t) => String(t).replace(/<[^>]+>/g, '');
const kpi = (l, v, sub = '') => `<div class="card" style="flex:1;display:flex;flex-direction:column;gap:6px"><span class="lbl" style="margin:0">${l}</span><b style="font:600 34px/1 var(--font);letter-spacing:-.02em">${v}</b><span style="font-size:12.5px;color:var(--ink-dim)">${sub}</span></div>`;
const PLAN = [
  ['S35', 'Project shell: stages, artifacts, chat, canvas', 'this wave'],
  ['S27 · BW-01', 'Projects: list and create (OpenDesign Home and All projects)', 'after review'],
  ['S28 · BW-02', 'Import a reference image: upload, preview, error and retry', 'after review'],
  ['S29 · BW-03', 'Board canvas: frames, context, nitpick pins', 'after review'],
  ['S30 · BW-04', 'Style: learned tokens, visual and markdown views (OpenDesign Design systems)', 'after review'],
  ['S31 · BW-05', 'Alternatives: takes, stack viewer, compare revisions', 'after review'],
  ['S32 · BW-06', 'Targeted edit: select a part, instruct, Apply or Dismiss', 'after review'],
  ['S33 / S08 · BW-07', 'Review: nitpicks, stale changes, exact diff and accept', 'after review'],
  ['S34 · BW-08', 'Hand off: accepted revisions only, fixed manifest', 'after review'],
  ['S36', 'Model and usage: Hosted, BYOK, deferred Local agent; estimate, cap, ledger', 'after review'],
  ['S37', 'Build contracts and release readiness (Frontend to Deployment stages)', 'after review'],
  ['S38', 'Contextual GenUI panel: three card families, table fallback', 'after review'],
  ['T01 · BW-T01 · BW-M01–03', 'Tablet and phone: frame list, single-frame review, hand off', 'after review'],
  ['S40', 'Skills library: free templates, own copies, GitHub sources that update', 'this wave'],
];
const cover = `<div class="board" style="min-height:1240px"><div class="hd"><div class="hdt"><span class="ey"><span class="tier">CANVAS</span>SPEKIN · LIVING SPEC AND DESIGN CANVAS · BY YRAVG</span><h1 class="ttl">Spekin: design canvas for review before build</h1><p class="ext">Browser-first workspace that takes an idea through eight stages, from Planning to Deployment, with a living spec, an infinite canvas and contextual chat. Drawn after OpenDesign (the main reference), with Paraframe, Onlook and Momo as pattern references. Every board shows the new design only. All data is one fictional sample project, Meranti Yard.</p></div></div>
<div style="display:flex;gap:12px">${kpi('Boards drawn', K.BOARDS.length, 'of ' + PLAN.length + ' planned')}${kpi('Stories', S.length, 'feature IDs F101 and up')}${kpi('New', cnt('new'), 'nothing built yet')}${kpi('Partial / built', cnt('partial') + ' / ' + cnt('built'), 'no Spekin app exists yet')}</div>
<div class="rw" style="flex-wrap:wrap;gap:12px">
${tiers.map((t) => `<div class="card" style="width:600px"><span class="lbl">${t.name}</span><div class="where">${t.files.map((f) => { const b = K.BOARDS.find((x) => x.file === f); return `<a href="${f}">${b.title}</a>`; }).join('')}</div></div>`).join('')}
<div class="card" style="width:600px"><span class="lbl">Board plan (one board = one buildable screen)</span><div class="where">${PLAN.map(([c, t]) => { const b = K.BOARDS.find((x) => c.startsWith(x.code)); return `<span>${b ? `<a href="${b.file}"><b>${c}</b></a>` : `<b>${c}</b>`} · ${t} · <i>${b ? 'drawn' : 'not drawn yet'}</i></span>`; }).join('')}</div></div>
<div class="card" style="width:600px"><span class="lbl">How to read a board</span><div class="where"><span><span class="isnew" style="display:inline-block;padding:1px 8px">yellow outline</span> = NEW. Spekin has nothing like it yet.</span><span><span class="part" style="display:inline-block;padding:1px 8px">amber dashed</span> = PARTIAL, with Exists and Missing.</span><span><span style="display:inline-block;background:var(--mk-note);color:var(--on-ink);border-radius:6px;padding:1px 8px">navy note</span> = behaviour a still picture cannot show.</span><span>State buttons (top right of a board) switch real states. Each state names its Entry click path and its Data record.</span><span>Every control carries what it does; LATER marks a control shown only as future.</span></div></div>
<div class="card" style="width:600px"><span class="lbl">Decisions on this canvas (owner, 22 Nov 2026)</span><div class="where"><span>OpenDesign is the primary reference; use all of it. Patterns, layouts and Apache-2.0 components may be reused with notices.</span><span>The existing yravgHub Studio is not the baseline. Its code will be checked later from the ROG laptop.</span><span>After only. Reference strip on every board. Offline copy kept in the repo.</span><span>Paraframe: prior parity study now (62 FR, 27 AT), fresh captures later.</span><span>Stack: Rust core, TS/JS browser UI, no Python. Browser first; local integration deferred.</span><span>Open: accent colour (Q-28, yravgUI clay used), UI language order (PRD: Bahasa Indonesia first), brand mark (placeholder S).</span></div></div>
<div class="card" style="width:600px"><span class="lbl">Reference sources and licences</span><div class="where"><span><b>OpenDesign</b> nexu-io/open-design @ e033aad, Apache-2.0. Main reference; code reuse allowed with NOTICE.</span><span><b>Onlook</b> onlook-dev/onlook, Apache-2.0. Canvas and visual-edit patterns.</span><span><b>Momo</b> alexandephilia/momo_genui, no licence. Patterns only; nothing copied.</span><span><b>Paraframe</b> no public source. Parity study FRAME-WORKSPACE-PARITY v0.1.6 only.</span><span>Reference screenshots are private to this canvas and kept out of git.</span></div></div>
</div></div>`;
writeFileSync(`${R}/Main.dc.html`, K.page('Spekin canvas', cover, 'renderVals() { return {}; }', K.W, 1240));
const FM = featureMap(K), EB = engineBoard(K);
writeFileSync(`${R}/F00-feature-map.dc.html`, K.page('F00 Feature map', FM.body, FM.logic, K.W, FM.h));
writeFileSync(`${R}/R00-references-engine.dc.html`, K.page('R00 References and engine', EB.body, EB.logic, K.W, heights['R00-references-engine'] || EB.h));
const fh = heights['F00-feature-map'] || FM.h, rh = heights['R00-references-engine'] || EB.h;

// ---- canvas.json (v3): Main + Index first, then one tier per block, 2 boards per row
const boards = {}, order = [], notes = {};
const XS = K.W + 120;
boards['Main.dc.html'] = { x: 0, y: 300, w: K.W, h: 1240, title: 'Cover' };
boards['F00-feature-map.dc.html'] = { x: XS, y: 300, w: K.W, h: fh, title: 'F00 · Feature map', is_interactive: true };
boards['R00-references-engine.dc.html'] = { x: 2 * XS, y: 300, w: K.W, h: rh, title: 'R00 · References, taste and engine' };
order.push('Main.dc.html', 'F00-feature-map.dc.html', 'R00-references-engine.dc.html');
let y = 300 + Math.max(1240, fh, rh) + 420;
tiers.forEach((t, ti) => {
  notes['t' + ti] = { x: 0, y: y - 300, text: t.name, kind: 'title1', maxW: 1600 };
  for (let r = 0; r < t.files.length; r += 2) {
    const rowf = t.files.slice(r, r + 2); let hmax = 0;
    rowf.forEach((f, c) => { const b = K.BOARDS.find((x) => x.file === f); boards[f] = { x: c * XS, y, w: K.W, h: b.h, title: b.title, is_interactive: true }; order.push(f); hmax = Math.max(hmax, b.h); });
    y += hmax + 120;
  }
  y += 300;
});
writeFileSync(`${R}/canvas.json`, JSON.stringify({ v: 3, createdOnFiles: { v: 1, at: '2026-11-22T12:00:00Z' }, title: 'Spekin: design canvas for review before build', launch: { view: 'canvas' }, pages: [], boards, order, notes, designSystems: [] }, null, 1));

if (!K.PUBLISH) {
// ---- offline copy: one static page that shows every board (open offline/index.html; needs the project folder beside it)
mkdirSync(HERE + 'offline', { recursive: true });
const all = ['Main.dc.html', 'F00-feature-map.dc.html', 'R00-references-engine.dc.html', ...K.BOARDS.map((b) => b.file)];
writeFileSync(HERE + 'offline/index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Spekin canvas (offline)</title><style>body{margin:0;background:#EEE9DF;font:14px Inter,system-ui,sans-serif;color:#1F1F1F}nav{position:sticky;top:0;background:#FAF9F5;border-bottom:1px solid #E6E2D8;padding:10px 16px;display:flex;gap:14px;flex-wrap:wrap;z-index:2}nav a{color:#1F1F1F}iframe{display:block;border:0;width:1900px;margin:0 auto 40px}</style></head><body><nav>${all.map((f) => `<a href="#${f}">${f.replace('.dc.html', '')}</a>`).join('')}</nav>${all.map((f) => `<iframe id="${f}" title="${f}" src="../project/${f}" style="height:${(boards[f] || {}).h || 1500}px"></iframe>`).join('')}</body></html>`);
}
writeFileSync(HERE + 'stories.md', ['# Spekin stories', '', 'Generated by build.mjs. Do not edit by hand.', '', '| ID | Status | Story | Board |', '|---|---|---|---|', ...S.map((s) => `| ${s.id} | ${s.st} | ${esc(s.t)} | ${s.code} |`), ''].join('\n'));
console.log(`${K.BOARDS.length} boards, ${S.length} stories (${cnt('built')} built, ${cnt('partial')} partial, ${cnt('new')} new)${bad ? `, ${bad} FAIL` : ''}`);
process.exit(bad ? 1 : 0);
