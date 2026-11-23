// State gate (canvas-to-app rule 16): every board state must be reached in the real app by clicks and look and read the same.
// Usage: APP_URL=http://127.0.0.1:5173 node tools/harness/state-gate.mjs [ONLY]   (ONLY filters boards, e.g. S35 or S35:backend)
// Needs the app running (npm run dev, or npm run build && npm run preview -w @spekin/web) and Playwright's Chromium (npx playwright install chromium).
// Writes tools/harness/out/<board>-<state>-{board,app,diff}.png and report.json / report.md. Exit 1 when any checked state fails.
//
// A state PASSES only when all hold:
//   reached  the click path in app-paths.json ran with no URL jumps after the first goto, and [data-screen] matches the board
//   text     the app's visible text in .sp-app equals the board's (board-only marks removed); line diff shown when not
//   pixels   pixelmatch difference of the 1440 x 900 app root (.sp-app, or .int-app on S27) <= 1.0 %
//   built    no [data-todo] stand-ins in the app (a drawn placeholder counts as FAIL, never as done)
//   later    the app has no more data-later controls than the board marks as later (nothing silently deferred)
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const req = createRequire(ROOT + 'package.json');
const { chromium } = req('@playwright/test');
const { PNG } = req('pngjs');
const pixelmatch = req('pixelmatch').default ?? req('pixelmatch');
const APP = (process.env.APP_URL || 'http://127.0.0.1:5173').replace(/\/$/, '');
const ONLY = process.argv[2] || process.env.ONLY || '';
// GATE=checked runs only the states whose click path is marked "checked" (the required CI job); drafts and missing paths are skipped.
const CHECKED_ONLY = process.env.GATE === 'checked';
// The app root on a board and in the app: .sp-app inside a project, .int-app on S27 (outside a project).
const APP_ROOT = '.sp-app, .int-app';
const MAX_DIFF = 1.0;
const OUT = ROOT + 'tools/harness/out';
fs.mkdirSync(OUT, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(ROOT + 'docs/design/spekin-canvas/canvas-states.json', 'utf8'));
// One file per board in tools/harness/paths (owned by that board's task card).
const paths = {};
for (const f of fs.readdirSync(ROOT + 'tools/harness/paths').filter((x) => x.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(ROOT + 'tools/harness/paths/' + f, 'utf8'));
  paths[j.board] = j.states;
}

// Board pages need the dc runtime, so serve project/ over http like render.mjs does.
const boardsDir = ROOT + 'docs/design/spekin-canvas/project';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
const srv = http.createServer((q, r) => {
  const f = path.join(boardsDir, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(boardsDir)) { r.writeHead(403); r.end(); return; }
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'text/plain' }); r.end(b); } });
}).listen(0, '127.0.0.1');
await new Promise((ok) => srv.once('listening', ok));
const BOARDS = 'http://127.0.0.1:' + srv.address().port + '/';

// Board-only language: callouts, NEW / PART / LATER tags and outlines. Hidden before the board is measured.
const BOARD_ONLY_CSS = '.note,.newtag,.parttag,.latertag{display:none!important}.isnew,.part{outline:none!important}';
const norm = (t) => t.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);

try { await fetch(APP + '/'); } catch { console.log('App not reachable at ' + APP + '. Start it first: npm run dev'); process.exit(2); }

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const results = [];
for (const b of manifest) {
  for (const st of b.states) {
    const id = b.screen + ':' + st.state;
    if (ONLY && !(id === ONLY || b.screen === ONLY || b.board.startsWith(ONLY))) continue;
    if (CHECKED_ONLY && paths[b.board]?.[st.state]?.status !== 'checked') continue;
    const p = paths[b.board]?.[st.state];
    const r = { board: b.board, screen: b.screen, state: st.state, status: p?.status || 'missing', verdict: 'FAIL', reasons: [] };
    results.push(r);
    if (!p) { r.reasons.push('no click path in tools/harness/paths/' + b.screen + '.json'); continue; }
    const base = OUT + '/' + b.screen + '-' + st.state;
    // Board side
    const bp = await ctx.newPage();
    await bp.goto(BOARDS + b.board);
    await bp.waitForSelector('.board', { timeout: 15000 });
    await bp.addStyleTag({ content: BOARD_ONLY_CSS });
    const sb = bp.locator('.vw button[data-state="' + st.state + '"]');
    if (await sb.count()) await sb.first().click();
    await bp.evaluate(() => document.fonts.ready);
    // Device boards (T01) draw each screen at its design size inside a scaled frame (.mod-dsc). A path state with
    // "frame": { "index": n } compares the nth frame: scale removed, phone status and home bars hidden, other frames hidden.
    const frame = p?.frame;
    let bApp;
    if (frame) {
      // Pick the frame inside the visible window by position: hiding the other frames must not change which one this is.
      bApp = bp.locator('.spwin:has(.mod-dsc)').filter({ visible: true }).first().locator('.mod-dsc').nth(frame.index || 0);
      await bApp.evaluate((el) => {
        const win = el.closest('.spwin');
        for (const d of win.querySelectorAll('.mod-dv, .mod-spec, .mod-st')) if (!d.contains(el)) d.style.visibility = 'hidden';
        for (const s of el.querySelectorAll('.mod-sbar, .mod-ph-bar, .mod-hb')) s.style.display = 'none';
        el.style.transform = 'none';
        for (let a = el.parentElement; a && a !== win; a = a.parentElement) { a.style.overflow = 'visible'; a.style.width = 'auto'; a.style.height = 'auto'; a.style.transform = 'none'; }
        // The window clips at 900 px; grow it to hold the unscaled frame (frames are absolutely placed, so not 'auto').
        win.style.overflow = 'visible'; win.style.boxShadow = 'none';
        win.style.height = Math.ceil(el.getBoundingClientRect().bottom - win.getBoundingClientRect().top + 8) + 'px';
      });
    } else bApp = bp.locator(APP_ROOT.split(',').map((s) => '.spwin ' + s.trim()).join(',')).filter({ visible: true }).first();
    // Read the whole window: some boards draw overlays (S27's switcher and create modal) beside the app root.
    // Board notes are hidden by BOARD_ONLY_CSS, so they are not in innerText.
    const bText = norm(await bApp.evaluate((el, f) => (f ? el : el.closest('.spwin') || el).innerText, !!frame));
    const bBox = frame ? await bApp.boundingBox() : null;
    // Boards stack notes above the window, so the window can sit at a fractional y (e.g. 232.69 px) and every
    // row would be resampled. Shift the window by the fraction so the capture starts on a whole pixel.
    await bApp.evaluate((el) => { const w = el.closest('.spwin') || el; const r = el.getBoundingClientRect(); const dx = Math.round(r.x) - r.x, dy = Math.round(r.y) - r.y; if (dx || dy) { const cs = getComputedStyle(w); w.style.marginTop = parseFloat(cs.marginTop) + dy + 'px'; w.style.marginLeft = parseFloat(cs.marginLeft) + dx + 'px'; } });
    await bApp.screenshot({ path: base + '-board.png', animations: 'disabled' });
    await bp.close();
    // App side: real clicks only after the first goto
    // A device state runs the app at the frame's design size.
    const actx = bBox ? await browser.newContext({ viewport: { width: Math.round(bBox.width), height: Math.round(bBox.height) }, deviceScaleFactor: 1, reducedMotion: 'reduce' }) : ctx;
    const ap = await actx.newPage();
    const urls = [];
    ap.on('framenavigated', (f) => { if (f === ap.mainFrame()) urls.push(f.url()); });
    try {
      for (const [i, s] of p.steps.entries()) {
        if (s.goto !== undefined) { if (i > 0) throw new Error('goto after the first step is a URL shortcut'); await ap.goto(APP + s.goto); }
        else if (s.wait) await ap.waitForSelector(s.wait, { timeout: 5000 });
        else if (s.click) await ap.locator(s.click).first().click({ timeout: 5000 });
        else if (s.dblclick) await ap.locator(s.dblclick).first().dblclick({ timeout: 5000 });
        else if (s.hover) await ap.locator(s.hover).first().hover({ timeout: 5000 });
        else if (s.press) await ap.keyboard.press(s.press);
        else if (s.type) await ap.locator(s.type[0]).first().fill(s.type[1], { timeout: 5000 });
        else throw new Error('unknown step ' + JSON.stringify(s));
      }
      await ap.waitForSelector('[data-screen="' + b.screen + '"]', { timeout: 5000 });
    } catch (e) { r.reasons.push('not reached: ' + e.message.split('\n')[0]); await ap.close(); if (actx !== ctx) await actx.close(); continue; }
    await ap.evaluate(() => document.fonts.ready);
    const aApp = frame ? ap.locator('body') : ap.locator(APP_ROOT).first();
    const aText = norm(await aApp.innerText());
    await aApp.screenshot({ path: base + '-app.png', animations: 'disabled' });
    const todo = await ap.locator('[data-todo]').count();
    const later = await ap.locator('[data-later]').count();
    // Feature ids the app really renders in this state, reached by the click path (live parity evidence:
    // an id that only sits in the source behind an unset prop is never seen here).
    r.features = await ap.evaluate(() => [...new Set([...document.querySelectorAll('[data-feature]')]
      .flatMap((e) => (e.getAttribute('data-feature') || '').split(/[\s,]+/).filter(Boolean)))].sort());
    await ap.close();
    if (actx !== ctx) await actx.close();
    r.reached = true;
    // Text
    const missing = bText.filter((l) => !aText.includes(l));
    const extra = aText.filter((l) => !bText.includes(l));
    r.text = { missing: missing.slice(0, 40), extra: extra.slice(0, 40), ok: !missing.length && !extra.length };
    if (!r.text.ok) r.reasons.push('text: ' + missing.length + ' board line(s) missing, ' + extra.length + ' extra');
    // Pixels
    // Sub-pixel layout can make one side 1 px larger; compare the common area, fail on a real size gap.
    const A0 = PNG.sync.read(fs.readFileSync(base + '-board.png'));
    const B0 = PNG.sync.read(fs.readFileSync(base + '-app.png'));
    const w = Math.min(A0.width, B0.width), h = Math.min(A0.height, B0.height);
    const crop = (P) => { const o = new PNG({ width: w, height: h }); PNG.bitblt(P, o, 0, 0, w, h, 0, 0); return o; };
    const A = crop(A0), B = crop(B0);
    if (Math.abs(A0.width - B0.width) > 2 || Math.abs(A0.height - B0.height) > 2) { r.reasons.push('size: board ' + A0.width + 'x' + A0.height + ' vs app ' + B0.width + 'x' + B0.height); r.pixels = null; }
    else {
      const D = new PNG({ width: A.width, height: A.height });
      const n = pixelmatch(A.data, B.data, D.data, A.width, A.height, { threshold: 0.1 });
      fs.writeFileSync(base + '-diff.png', PNG.sync.write(D));
      r.pixels = Math.round((n / (A.width * A.height)) * 10000) / 100;
      if (r.pixels > MAX_DIFF) r.reasons.push('pixels: ' + r.pixels + ' % differ (max ' + MAX_DIFF + ' %)');
    }
    if (todo) r.reasons.push('built: ' + todo + ' drawn stand-in(s) [data-todo] still in the app');
    if (later > b.later.length) r.reasons.push('later: app has ' + later + ' data-later controls, board marks ' + b.later.length);
    if (p.status !== 'checked') r.reasons.push('click path is still a draft');
    r.verdict = r.reasons.length ? 'FAIL' : 'PASS';
  }
}
await browser.close();
srv.close();
const pass = results.filter((r) => r.verdict === 'PASS').length;
fs.writeFileSync(OUT + '/report.json', JSON.stringify({ app: APP, at: new Date().toISOString(), pass, total: results.length, results }, null, 2));
const md = ['# State gate', '', pass + ' / ' + results.length + ' states pass. App: ' + APP, '', '| State | Path | Verdict | Pixels % | Why |', '|---|---|---|---|---|',
  ...results.map((r) => '| ' + r.screen + ':' + r.state + ' | ' + r.status + ' | ' + r.verdict + ' | ' + (r.pixels ?? '–') + ' | ' + r.reasons.join('; ').replace(/\|/g, '/') + ' |')];
fs.writeFileSync(OUT + '/report.md', md.join('\n') + '\n');
for (const r of results) console.log(r.verdict.padEnd(4), (r.screen + ':' + r.state).padEnd(22), r.reasons.join('; '));
console.log(pass + '/' + results.length + ' states pass. Report: tools/harness/out/report.md');
process.exit(pass === results.length ? 0 : 1);
