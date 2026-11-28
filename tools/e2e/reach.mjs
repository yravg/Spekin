// Reach check (28 Nov 2026, lead): every control that is clickable at 1440 x 900 must stay
// clickable at 1024 x 768. For each checked state in tools/harness/paths/*.json (T01 and
// device-frame states skipped) it walks the click path at both sizes, scrolls each control into
// view, and reports a control that is cut off by a non-scrolling clip (overflow hidden/clip)
// or whose centre is covered by another element. Canvas viewports and scroll containers count
// as reachable. Report only: it never fails the gate. Usage:
//   npm run e2e:reach                 # all states, report in tools/e2e/out/reach.{json,md}
//   npm run e2e:reach -- "^S15:"      # a regex over state ids
// App must be running (npm run dev). APP_URL overrides http://127.0.0.1:5173.

import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const APP = process.env.APP_URL || 'http://127.0.0.1:5173';
const manifest = JSON.parse(fs.readFileSync('docs/design/spekin-canvas/canvas-states.json', 'utf8'));
const list = Array.isArray(manifest) ? manifest : (manifest.boards || []);
const screenOf = new Map(list.map(b => [b.board, b.screen]));
const states = [];
for (const f of fs.readdirSync('tools/harness/paths').filter(x => x.endsWith('.json')).sort()) {
  const j = JSON.parse(fs.readFileSync('tools/harness/paths/' + f, 'utf8'));
  const screen = screenOf.get(j.board) || j.board.replace(/[-.].*$/, '');
  if (screen === 'T01') continue;
  for (const [name, st] of Object.entries(j.states)) if (st.status === 'checked' && !st.viewport) states.push({ id: screen + ':' + name, screen, steps: st.steps });
}
const only = process.argv[2]; const todo = only ? states.filter(s => new RegExp(only).test(s.id)) : states;
const b = await chromium.launch();
const ctxs = { 1440: await b.newContext({ viewport: { width: 1440, height: 900 } }), 1024: await b.newContext({ viewport: { width: 1024, height: 768 } }) };
async function run(st, w) {
  const p = await ctxs[w].newPage();
  try {
    for (const s of st.steps) {
      if (s.goto) await p.goto(APP + s.goto);
      else if (s.wait) await p.waitForSelector(s.wait, { timeout: 5000 });
      else if (s.click) await p.click(s.click, { timeout: 5000 });
      else if (s.dblclick) await p.dblclick(s.dblclick, { timeout: 5000 });
      else if (s.hover) await p.hover(s.hover, { timeout: 5000 });
      else if (s.press) await p.keyboard.press(s.press);
      else if (s.type) await p.fill(s.type[0], s.type[1]);
    }
    await p.waitForSelector('[data-screen="' + st.screen + '"]', { timeout: 5000 });
    await p.waitForTimeout(250);
    return await p.evaluate(() => {
      const res = {};
      const els = [...document.querySelectorAll('button, a[href], input, [role=tab], [role=menuitem]')];
      const seen = {};
      for (const e of els) {
        let r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
        if (r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
        const base = (e.getAttribute('data-feature') || '') + '|' + (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
        seen[base] = (seen[base] || 0) + 1; const key = base + '#' + seen[base];
        e.scrollIntoView({ block: 'nearest', inline: 'nearest' }); r = e.getBoundingClientRect();
        // clip: rect clipped by an overflow ancestor?
        let clipped = false; let a = e.parentElement;
        while (a && a !== document.body) { const s = getComputedStyle(a); if (s.overflowX === 'auto' || s.overflowX === 'scroll') break; if (a.matches('.can-vp, .can-stage, .can-world, [data-canvas], .sp-canvas, .can-canvas')) break; if (s.overflowX === 'hidden' || s.overflowX === 'clip') { const ar = a.getBoundingClientRect(); if (r.right > ar.right + 1 || r.left < ar.left - 1) { clipped = 'x:' + String(a.className).slice(0, 24); break; } } a = a.parentElement; }
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        let hit = null;
        if (cx >= 0 && cx < innerWidth && cy >= 0 && cy < innerHeight) { const h = document.elementFromPoint(cx, cy); hit = !!h && (e === h || e.contains(h)); if (!hit && h) hit = 'by:' + h.tagName.toLowerCase() + '.' + String(h.className).slice(0, 30); }
        res[key] = { hit, clipped, x: Math.round(r.left), w: Math.round(r.width) };
      }
      return res;
    });
  } catch (e) { return { __err: String(e).split('\n')[0] }; } finally { await p.close(); }
}
const report = [];
for (const st of todo) {
  const [a, c] = [await run(st, 1440), await run(st, 1024)];
  if (a.__err || c.__err) { report.push({ id: st.id, err: a.__err || c.__err }); continue; }
  const issues = [];
  for (const [k, v] of Object.entries(a)) {
    if (v.hit !== true || v.clipped) continue;
    const n = c[k];
    if (!n) { issues.push(k + ' missing@1024'); continue; }
    if (n.clipped) issues.push(k + ' clipped(' + n.clipped + ') x' + n.x + ' w' + n.w);
    else if (typeof n.hit === 'string') issues.push(k + ' covered ' + n.hit);
  }
  report.push({ id: st.id, n: issues.length, issues: issues.slice(0, 8) });
}
fs.mkdirSync('tools/e2e/out', { recursive: true });
fs.writeFileSync('tools/e2e/out/reach.json', JSON.stringify(report, null, 1));
const bad = report.filter((r) => r.err || r.n);
const md = ['# Reach check: 1440 vs 1024', '', bad.length + ' of ' + report.length + ' states have a control that is reachable at 1440 but not at 1024 (' + bad.reduce((a, r) => a + (r.n || 0), 0) + ' controls).', '', '| State | Controls | First issues |', '|---|---|---|',
  ...bad.map((r) => '| ' + r.id + ' | ' + (r.err ? 'error' : r.n) + ' | ' + (r.err || r.issues.slice(0, 3).join('; ')).replace(/\|/g, '/') + ' |')];
fs.writeFileSync('tools/e2e/out/reach.md', md.join('\n') + '\n');
console.log(bad.length + ' / ' + report.length + ' states with unreachable controls at 1024. Report: tools/e2e/out/reach.md');
await b.close();
