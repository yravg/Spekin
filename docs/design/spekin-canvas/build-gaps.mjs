// Spekin GAPS canvas generator (24 Nov 2026).  node build-gaps.mjs  ->  gaps/project/*.dc.html + canvas.json
// A second canvas beside the main one: boards for the PRD requirements no screen draws yet (IMP-52 "gap" rows).
// Same kit, stylesheet, rules and lint as build.mjs; boards come from boards-gap-*.mjs (build.mjs skips those).
// SPK_PUBLISH=1 writes publish-gaps/project instead, with assets pointed at the canvas's /_blob/ uploads.
// Heights: SPK_OUT=gaps/project node render.mjs writes heights.json (shared; board names never clash) (build -> render -> build).
import { writeFileSync, readFileSync, existsSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as K from './kit.mjs';
import { GAP_BOARDS, GAP_RULES, GROUPS, GROUP_ORDER } from './gaps-plan.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const R = HERE + (K.PUBLISH ? 'publish-gaps/project' : 'gaps/project');
mkdirSync(R, { recursive: true });
const cssParts = existsSync(HERE + 'css') ? readdirSync(HERE + 'css').filter((f) => f.endsWith('.css')).sort() : [];
writeFileSync(R + '/spekin.css', [readFileSync(HERE + 'spekin.css', 'utf8'), ...cssParts.map((f) => `/* ---- css/${f} */\n` + readFileSync(HERE + 'css/' + f, 'utf8'))].join('\n'));
copyFileSync(HERE + 'project/support.js', R + '/support.js');
if (!K.PUBLISH && existsSync(HERE + 'project/ref')) { mkdirSync(R + '/ref', { recursive: true }); for (const f of readdirSync(HERE + 'project/ref')) copyFileSync(HERE + 'project/ref/' + f, R + '/ref/' + f); }
const heights = existsSync(HERE + 'heights.json') ? JSON.parse(readFileSync(HERE + 'heights.json', 'utf8')) : {};
const add = (o) => K.board(R, writeFileSync, heights, o);

// ---- the classification (IMP-52): every "gap" row must be on exactly one board or in GAP_RULES
const mapFile = HERE + '../../handoff/req-map-2026-11-24.md';
const rows = existsSync(mapFile) ? readFileSync(mapFile, 'utf8').split('\n').map((l) => l.split('|').map((c) => c.trim())).filter((c) => /^R-[A-Z]+-\d+$/.test(c[2] || '')) : [];
const REQ = Object.fromEntries(rows.map((c) => [c[2], { short: c[3].replace(/…$/, ''), verdict: c[4].toLowerCase(), evidence: c[5] }]));
const gaps = rows.filter((c) => c[4].toLowerCase() === 'gap').map((c) => c[2]);
const placed = [...GAP_BOARDS.flatMap((b) => b.reqs), ...GAP_RULES];
let bad = 0;
const fail = (m) => { bad++; console.log('FAIL', m); };
if (!rows.length) fail('docs/handoff/req-map-2026-11-24.md not found (merge PR #67 first)');
for (const g of gaps) if (!placed.includes(g)) fail(`gap ${g} is on no board and not in GAP_RULES (gaps-plan.mjs)`);
for (const p of placed) { if (placed.filter((x) => x === p).length > 1) fail(`${p} is placed twice`); if (rows.length && !gaps.includes(p)) fail(`${p} is placed but is not a "gap" row`); }

// ---- boards from boards-gap-*.mjs
// SPK_ONLY=gap-a builds one group (a worker checking its own boards while others are mid-edit).
const ONLY = (process.env.SPK_ONLY || '').split(',').filter(Boolean);
const mods = readdirSync(HERE).filter((f) => /^boards-gap-.*\.mjs$/.test(f) && (!ONLY.length || ONLY.some((o) => f.includes(o)))).sort();
const tiers = [];
for (const f of mods) {
  const m = await import(pathToFileURL(HERE + f).href);
  const list = m.boards(K);
  list.forEach(add);
  const files = list.map((b) => b.file + '.dc.html'), same = tiers.find((t) => t.name === m.tier);
  if (same) same.files.push(...files); else tiers.push({ name: m.tier, order: m.order ?? 9, files });
}
tiers.sort((a, b) => a.order - b.order);
for (const b of K.BOARDS) {
  const s = readFileSync(`${R}/${b.file}`, 'utf8'), n = (re) => (s.match(re) || []).length;
  const errs = [];
  if (n(/class="note[ "]/g) < 2) errs.push('needs 2 notes');
  if (n(/class="stat new"/g) && !n(/class="newtag"/g)) errs.push('New story, no NEW tag');
  if (/\{\{(?!is_|go_| ?(true|false))/.test(s)) errs.push('stray {{ }} binding');
  const plan = GAP_BOARDS.find((p) => p.file + '.dc.html' === b.file);
  if (!plan) errs.push('board not in gaps-plan.mjs');
  else for (const r of plan.reqs) if (!s.includes(r)) errs.push(`does not name ${r}`);
  if (errs.length) fail(`${b.file}: ${errs.join('; ')}`);
}

// ---- cover and G00 gap map
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const drawn = (p) => K.BOARDS.find((b) => b.file === p.file + '.dc.html');
const kpi = (l, v, s) => `<div class="card" style="flex:1"><span class="lbl">${l}</span><b style="font-size:34px;line-height:1.1">${v}</b><span style="color:var(--ink-3)">${s}</span></div>`;
const reqLine = (r) => `<span><b>${r}</b> · ${esc(REQ[r]?.short || '')}<br><i style="color:var(--ink-3)">Today: ${esc((REQ[r]?.evidence || '').slice(0, 220))}</i></span>`;
const counts = rows.reduce((a, c) => ((a[c[4].toLowerCase()] = (a[c[4].toLowerCase()] || 0) + 1), a), {});
const cover = `<div class="board" style="min-height:1240px"><div class="hd"><div class="hdt"><span class="ey"><span class="tier">CANVAS</span>SPEKIN · GAPS CANVAS · BY YRAVG</span><h1 class="ttl">Spekin: gaps canvas, the screens the PRD asks for that nothing draws yet</h1><p class="ext">The main canvas covers 15 boards and every one of their 314 feature cells is now built and proven in the app. This second canvas draws what is still missing: the PRD v0.2.3 requirements that no board and no screen covers. The list comes from the IMP-52 classification of the 80 unmapped requirements (24 Nov 2026): ${counts.gap || 0} are real gaps. ${GAP_BOARDS.reduce((a, b) => a + b.reqs.length, 0)} of them become screens on ${GAP_BOARDS.length} boards here; ${GAP_RULES.length} are engineering rules listed on G00 for task cards. Same look, kit and sample project (Meranti Yard) as the main canvas.</p></div></div>
<div style="display:flex;gap:12px">${kpi('Boards drawn', K.BOARDS.length, 'of ' + GAP_BOARDS.length + ' planned')}${kpi('Gap requirements', counts.gap || 0, 'from the IMP-52 classification')}${kpi('On boards', GAP_BOARDS.reduce((a, b) => a + b.reqs.length, 0), 'screen requirements')}${kpi('Rules (no screen)', GAP_RULES.length, 'task cards, see G00')}</div>
<div class="rw" style="flex-wrap:wrap;gap:12px">
${Object.entries(GROUPS).map(([g, t]) => `<div class="card" style="width:600px"><span class="lbl">${g} · ${t}</span><div class="where">${GAP_BOARDS.filter((b) => b.group === g).map((b) => `<span>${drawn(b) ? `<a href="${b.file}.dc.html"><b>${b.code}</b></a>` : `<b>${b.code}</b>`} · ${b.name} · ${b.reqs.join(', ')} · <i>${drawn(b) ? 'drawn' : 'not drawn yet'}</i></span>`).join('')}</div></div>`).join('')}
<div class="card" style="width:600px"><span class="lbl">How this canvas was made</span><div class="where"><span>Classification: docs/handoff/req-map-2026-11-24.md, 80 rows: ${['map', 'core', 'later', 'gap'].map((k) => `${counts[k] || 0} ${k}`).join(', ')}.</span><span>Plan: docs/design/spekin-canvas/gaps-plan.mjs. The build fails if a gap is on no board or on two.</span><span>Boards use the PRD's own screen codes and new feature IDs from F401.</span><span>The 27 "later" rows (deferred by the PRD) and 13 "core" rows are not drawn here; they need an owner decision or a test, not a screen.</span></div></div>
<div class="card" style="width:600px"><span class="lbl">How to read a board</span><div class="where"><span>Same as the main canvas: yellow outline = NEW, navy note = behaviour, state buttons switch real states, every control says what it does, LATER marks a future control.</span><span>Each board's Stories card names the PRD requirement IDs it answers.</span></div></div>
</div></div>`;
writeFileSync(`${R}/Main.dc.html`, K.page('Spekin gaps canvas', cover, 'renderVals() { return {}; }', K.W, 1240));
const gmap = `<div class="board"><div class="hd"><div class="hdt"><span class="ey"><span class="tier">MAP</span>G00 · GAP MAP</span><h1 class="ttl">G00 · Every gap requirement and where it is answered</h1><p class="ext">One row per gap requirement: its board on this canvas, or a task card for engineering rules. "Today" is the IMP-52 evidence of what exists now.</p></div></div>
<div class="rw" style="flex-wrap:wrap;gap:12px;align-items:flex-start">
${GAP_BOARDS.map((b) => `<div class="card" style="width:900px"><span class="lbl">${b.code} · ${b.name} · F${b.f}–F${b.f + 8}</span><div class="where">${b.reqs.map(reqLine).join('')}</div></div>`).join('')}
<div class="card" style="width:900px"><span class="lbl">Engineering and team rules (task cards, no screen)</span><div class="where">${GAP_RULES.map(reqLine).join('')}</div></div>
</div>${K.note('<b>Why two canvases.</b> The main canvas is the accepted, built design; it stays unchanged. This one is for review before any of these screens are built.', 'margin-top:16px;max-width:900px')}${K.note('<b>Source of truth.</b> gaps-plan.mjs places each gap; the build fails if the classification and the plan disagree.', 'margin-top:12px;max-width:900px')}</div>`;
const gh = heights['G00-gap-map'] || 2400;
writeFileSync(`${R}/G00-gap-map.dc.html`, K.page('G00 Gap map', gmap, 'renderVals() { return {}; }', K.W, gh));

// ---- canvas.json (v3)
const boards = {}, order = [], notes = {};
const XS = K.W + 120;
boards['Main.dc.html'] = { x: 0, y: 300, w: K.W, h: 1240, title: 'Cover' };
boards['G00-gap-map.dc.html'] = { x: XS, y: 300, w: K.W, h: gh, title: 'G00 · Gap map' };
order.push('Main.dc.html', 'G00-gap-map.dc.html');
let y = 300 + Math.max(1240, gh) + 420;
tiers.forEach((t, ti) => {
  notes['t' + ti] = { x: 0, y: y - 300, text: t.name, kind: 'title1', maxW: 1600 };
  for (let r = 0; r < t.files.length; r += 2) {
    const rowf = t.files.slice(r, r + 2); let hmax = 0;
    rowf.forEach((f, c) => { const b = K.BOARDS.find((x) => x.file === f); boards[f] = { x: c * XS, y, w: K.W, h: b.h, title: b.title, is_interactive: true }; order.push(f); hmax = Math.max(hmax, b.h); });
    y += hmax + 120;
  }
  y += 300;
});
writeFileSync(`${R}/canvas.json`, JSON.stringify({ v: 3, createdOnFiles: { v: 1, at: '2026-11-24T12:00:00Z' }, title: 'Spekin: gaps canvas for review before build', launch: { view: 'canvas' }, pages: [], boards, order, notes, designSystems: [] }, null, 1));
if (!K.PUBLISH) {
  mkdirSync(HERE + 'gaps/offline', { recursive: true });
  const all = ['Main.dc.html', 'G00-gap-map.dc.html', ...K.BOARDS.map((b) => b.file)];
  writeFileSync(HERE + 'gaps/offline/index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Spekin gaps canvas (offline)</title><style>body{margin:0;background:#EEE9DF;font:14px Inter,system-ui,sans-serif;color:#1F1F1F}nav{position:sticky;top:0;background:#FAF9F5;border-bottom:1px solid #E6E2D8;padding:10px 16px;display:flex;gap:14px;flex-wrap:wrap;z-index:2}nav a{color:#1F1F1F}iframe{display:block;border:0;width:1900px;margin:0 auto 40px}</style></head><body><nav>${all.map((f) => `<a href="#${f}">${f.replace('.dc.html', '')}</a>`).join('')}</nav>${all.map((f) => `<iframe id="${f}" title="${f}" src="../project/${f}" style="height:${(boards[f] || {}).h || 1500}px"></iframe>`).join('')}</body></html>`);
}
console.log(`gaps canvas: ${K.BOARDS.length}/${GAP_BOARDS.length} boards, ${gaps.length} gap rows, ${GAP_RULES.length} rules${bad ? `, ${bad} FAIL` : ''}`);
process.exit(bad ? 1 : 0);
