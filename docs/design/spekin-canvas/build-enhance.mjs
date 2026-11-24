// Spekin ENHANCE PROMPT canvas generator (24 Nov 2026).  node build-enhance.mjs  ->  enhance/project/*.dc.html + canvas.json
// A third canvas beside the main and gaps canvases: one board (S41) for the "Enhance prompt" composer button.
// Same kit, stylesheet, rules and lint as build.mjs; boards come from boards-enh-*.mjs (build.mjs and build-gaps.mjs skip those and css/enh-*).
// SPK_PUBLISH=1 SPK_BLOBS=blobs-enhance.json writes publish-enhance/project with assets pointed at the canvas's /_blob/ uploads.
// Heights: SPK_OUT=enhance/project node render.mjs writes heights.json (shared; board names never clash) (build -> render -> build).
import { writeFileSync, readFileSync, existsSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as K from './kit.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const R = HERE + (K.PUBLISH ? 'publish-enhance/project' : 'enhance/project');
mkdirSync(R, { recursive: true });
const cssParts = existsSync(HERE + 'css') ? readdirSync(HERE + 'css').filter((f) => f.endsWith('.css') && !f.startsWith('gap-')).sort() : [];
writeFileSync(R + '/spekin.css', [readFileSync(HERE + 'spekin.css', 'utf8'), ...cssParts.map((f) => `/* ---- css/${f} */\n` + readFileSync(HERE + 'css/' + f, 'utf8'))].join('\n'));
copyFileSync(HERE + 'project/support.js', R + '/support.js');
if (!K.PUBLISH && existsSync(HERE + 'project/ref')) { mkdirSync(R + '/ref', { recursive: true }); for (const f of readdirSync(HERE + 'project/ref')) copyFileSync(HERE + 'project/ref/' + f, R + '/ref/' + f); }
const heights = existsSync(HERE + 'heights.json') ? JSON.parse(readFileSync(HERE + 'heights.json', 'utf8')) : {};
const add = (o) => K.board(R, writeFileSync, heights, o);
let bad = 0;
const fail = (m) => { bad++; console.log('FAIL', m); };

// ---- boards from boards-enh-*.mjs
const mods = readdirSync(HERE).filter((f) => /^boards-enh-.*\.mjs$/.test(f)).sort();
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
  if (errs.length) fail(`${b.file}: ${errs.join('; ')}`);
}

// ---- cover
const cover = `<div class="board" style="min-height:760px"><div class="hd"><div class="hdt"><span class="ey"><span class="tier">CANVAS</span>SPEKIN · ENHANCE PROMPT · BY YRAVG</span><h1 class="ttl">Spekin: an Enhance prompt button in the chat composer</h1><p class="ext">A small sparkle button left of Send that rewrites the user's draft into a clearer, fuller prompt before it is sent. One board, S41, with six states: empty draft, draft ready, enhancing, review proposal, applied with Undo, and blocked at the credit cap. Same look, kit and sample project (Meranti Yard) as the main canvas.</p></div></div>
<div class="rw" style="flex-wrap:wrap;gap:12px;align-items:flex-start">
<div class="card" style="width:600px"><span class="lbl">Board</span><div class="where"><span><a href="S41-enhance-prompt.dc.html"><b>S41</b></a> · Enhance prompt · F531 to F539</span></div></div>
<div class="card" style="width:600px"><span class="lbl">Why</span><div class="where"><span>Short or rough drafts waste a paid run. Enhance spends about 1 to 2 credits to make the message complete before an 18 to 30 credit run.</span><span>It stays safe: the result is a proposal you review, nothing is sent for you, one Undo restores your exact words, and it invents no requirement (guesses are marked assumptions).</span></div></div>
<div class="card" style="width:600px"><span class="lbl">Open questions for Enrico</span><div class="where"><span>1. Shortcut: Ctrl/Cmd+Shift+E proposed (not Ctrl/Cmd+I). Agree?</span><span>2. Which model runs it: the composer chip's model, or a smaller one on the same source?</span><span>3. Should Undo survive a page reload?</span><span>4. May a project switch Enhance off?</span></div></div>
<div class="card" style="width:600px"><span class="lbl">How to read a board</span><div class="where"><span>Yellow outline = NEW, navy note = behaviour, the state buttons switch real states, every control says what it does.</span></div></div>
</div></div>`;
writeFileSync(`${R}/Main.dc.html`, K.page('Spekin enhance prompt', cover, 'renderVals() { return {}; }', K.W, 760));

// ---- canvas.json (v3)
const boards = {}, order = [], notes = {};
const XS = K.W + 120;
boards['Main.dc.html'] = { x: 0, y: 300, w: K.W, h: 760, title: 'Cover' };
order.push('Main.dc.html');
let y = 300 + 760 + 420;
tiers.forEach((t, ti) => {
  notes['t' + ti] = { x: 0, y: y - 300, text: t.name, kind: 'title1', maxW: 1600 };
  for (let r = 0; r < t.files.length; r += 2) {
    const rowf = t.files.slice(r, r + 2); let hmax = 0;
    rowf.forEach((f, c) => { const b = K.BOARDS.find((x) => x.file === f); boards[f] = { x: c * XS, y, w: K.W, h: b.h, title: b.title, is_interactive: true }; order.push(f); hmax = Math.max(hmax, b.h); });
    y += hmax + 120;
  }
  y += 300;
});
writeFileSync(`${R}/canvas.json`, JSON.stringify({ v: 3, createdOnFiles: { v: 1, at: '2026-11-24T12:00:00Z' }, title: 'Spekin: enhance prompt', launch: { view: 'canvas' }, pages: [], boards, order, notes, designSystems: [] }, null, 1));
if (!K.PUBLISH) {
  mkdirSync(HERE + 'enhance/offline', { recursive: true });
  const all = ['Main.dc.html', ...K.BOARDS.map((b) => b.file)];
  writeFileSync(HERE + 'enhance/offline/index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Spekin enhance prompt canvas (offline)</title><style>body{margin:0;background:#EEE9DF;font:14px Inter,system-ui,sans-serif;color:#1F1F1F}nav{position:sticky;top:0;background:#FAF9F5;border-bottom:1px solid #E6E2D8;padding:10px 16px;display:flex;gap:14px;flex-wrap:wrap;z-index:2}nav a{color:#1F1F1F}iframe{display:block;border:0;width:1900px;margin:0 auto 40px}</style></head><body><nav>${all.map((f) => `<a href="#${f}">${f.replace('.dc.html', '')}</a>`).join('')}</nav>${all.map((f) => `<iframe id="${f}" title="${f}" src="../project/${f}" style="height:${(boards[f] || {}).h || 1500}px"></iframe>`).join('')}</body></html>`);
}
console.log(`enhance canvas: ${K.BOARDS.length} boards${bad ? `, ${bad} FAIL` : ''}`);
process.exit(bad ? 1 : 0);
