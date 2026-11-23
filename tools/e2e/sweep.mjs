// IMP-46 · Viewport, motion and error sweep.
//
// Reuses the *checked* click paths in tools/harness/paths/*.json (read only) against the
// running dev server, exactly as tools/harness/state-gate.mjs reaches them. For every
// checked state it runs the same click path three times and records:
//   - 1440x900  (or a T01 state's own frame size): 0 pageerror events + 0 console errors
//   - 1024x768  (skipped for T01): the same errors, plus no sideways page scroll
//                (document.documentElement.scrollWidth <= window.innerWidth + 2)
//   - 1440x900  (or a T01 frame size) with reducedMotion:'reduce': no running CSS
//                animation/transition longer than 0.01 s on a visible element
//                (document.getAnimations()).
// Writes tools/e2e/out/sweep.md (state, errors, overflow, motion) and exits 1 if any
// check fails, 2 if the app is not reachable. Boards and harness paths are never changed.
//
// Usage: APP_URL=http://127.0.0.1:5175 npm run e2e:sweep
// Needs the dev server running (SPK_WEB_PORT=5175 npm run dev) and Playwright's Chromium.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const req = createRequire(ROOT + 'package.json');
const { chromium } = req('@playwright/test');
const APP = (process.env.APP_URL || 'http://127.0.0.1:5173').replace(/\/$/, '');
const OUT = ROOT + 'tools/e2e/out';
fs.mkdirSync(OUT, { recursive: true });

// Board -> screen id, from the canvas state manifest (the same source the harness uses).
const manifest = JSON.parse(fs.readFileSync(ROOT + 'docs/design/spekin-canvas/canvas-states.json', 'utf8'));
const screenOf = new Map(manifest.map((b) => [b.board, b.screen]));

// Collect every checked state. T01 keeps its own device frame sizes and skips the 1024 check.
const states = [];
const pathsDir = ROOT + 'tools/harness/paths';
for (const f of fs.readdirSync(pathsDir).filter((x) => x.endsWith('.json')).sort()) {
  const j = JSON.parse(fs.readFileSync(pathsDir + '/' + f, 'utf8'));
  const screen = screenOf.get(j.board) || j.board.replace(/[-.].*$/, '');
  for (const [name, st] of Object.entries(j.states)) {
    if (st.status !== 'checked') continue;
    const isDevice = screen === 'T01' || !!st.viewport;
    states.push({ id: screen + ':' + name, screen, steps: st.steps, isDevice, vp: st.viewport || { width: 1440, height: 900 } });
  }
}

try {
  const r = await fetch(APP + '/');
  if (!r.ok) throw new Error('HTTP ' + r.status);
} catch (e) {
  console.error('App not reachable at ' + APP + ' (' + e.message + '). Start it: SPK_WEB_PORT=5175 npm run dev');
  process.exit(2);
}

const browser = await chromium.launch();
// Contexts are cached per viewport + reduced-motion combination; the harness reuses its
// context too. Every run starts with a goto (a full reload), so in-memory app state resets.
const contexts = new Map();
async function context(w, h, rm) {
  const k = w + 'x' + h + ':' + rm;
  if (!contexts.has(k)) contexts.set(k, await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: rm }));
  return contexts.get(k);
}

async function runSteps(page, state) {
  for (const [i, s] of state.steps.entries()) {
    if (s.goto !== undefined) { if (i > 0) throw new Error('goto after the first step'); await page.goto(APP + s.goto); }
    else if (s.wait) await page.waitForSelector(s.wait, { timeout: 5000 });
    else if (s.click) await page.locator(s.click).first().click({ timeout: 5000 });
    else if (s.dblclick) await page.locator(s.dblclick).first().dblclick({ timeout: 5000 });
    else if (s.hover) await page.locator(s.hover).first().hover({ timeout: 5000 });
    else if (s.press) await page.keyboard.press(s.press);
    else if (s.type) await page.locator(s.type[0]).first().fill(s.type[1], { timeout: 5000 });
    else throw new Error('unknown step ' + JSON.stringify(s));
  }
  await page.waitForSelector('[data-screen="' + state.screen + '"]', { timeout: 5000 });
  await page.evaluate(() => document.fonts.ready);
}

// Run one configuration of a state. Returns the errors, and (when requested) the overflow
// and the running animations found on visible elements.
async function measure(state, w, h, rm, opts) {
  const ctx = await context(w, h, rm);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.split('\n')[0]));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text().slice(0, 240)); });
  try {
    await runSteps(page, state);
  } catch (e) {
    await page.close();
    const lines = e.message.split('\n').map((l) => l.replace(/\[[0-9;]*m/g, '').trim());
    const why = lines.find((l) => /intercepts pointer events/.test(l))
      || lines.find((l) => /not stable|Timeout/.test(l))
      || lines[0];
    return { errors, notReached: why };
  }
  // Let any transient, click-triggered transition finish before sampling steady state.
  // Infinite animations persist; a well-behaved reduced-motion app has none running.
  if (opts.motion) await new Promise((r) => setTimeout(r, 350));
  let overflow = null;
  if (opts.overflow) {
    const g = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    overflow = { sw: g.sw, iw: g.iw, over: Math.max(0, g.sw - (g.iw + 2)), ok: g.sw <= g.iw + 2 };
  }
  let motion = null;
  if (opts.motion) {
    motion = await page.evaluate(() => {
      const out = [];
      for (const a of document.getAnimations()) {
        const eff = a.effect;
        if (!eff) continue;
        const dur = eff.getTiming().duration;
        if (typeof dur !== 'number' || !(dur > 10)) continue;      // longer than 0.01 s
        if (a.playState !== 'running') continue;                   // running only
        const el = eff.target;
        if (!el || el.nodeType !== 1) continue;                    // a real element
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;             // visible element
        const cls = typeof el.className === 'string' ? el.className : el.tagName;
        out.push({ kind: a.constructor.name, name: a.animationName || a.transitionProperty || '', ms: Math.round(dur), el: cls.slice(0, 48) });
      }
      return out;
    });
  }
  await page.close();
  return { errors, overflow, motion };
}

const rows = [];
try {
  for (const state of states) {
    // 1. Errors at the design viewport (T01 uses its own frame size).
    const a = await measure(state, state.vp.width, state.vp.height, 'no-preference', { overflow: false, motion: false });
    // 2. Errors + overflow at 1024x768 (skipped for T01 device frames).
    const b = state.isDevice ? null : await measure(state, 1024, 768, 'no-preference', { overflow: true, motion: false });
    // 3. Motion at the design viewport with reduced motion.
    const c = await measure(state, state.vp.width, state.vp.height, 'reduce', { overflow: false, motion: true });

    const errA = a.errors.length;
    const errB = b ? b.errors.length : 0;
    const overflowOk = !b || (b.overflow && b.overflow.ok);
    const motionOk = !c.motion || c.motion.length === 0;
    const reached = !a.notReached && !b?.notReached && !c.notReached;
    const ok = errA === 0 && errB === 0 && overflowOk && motionOk && reached;

    const details = [];
    for (const [label, m] of [['1440', a], ['1024', b], ['reduce', c]]) {
      if (!m) continue;
      if (m.notReached) details.push(label + ': not reached (' + m.notReached + ')');
      for (const e of m.errors) details.push(label + ': ' + e);
    }
    if (b && b.overflow && !b.overflow.ok) details.push('1024: scrollWidth ' + b.overflow.sw + ' > innerWidth+2 ' + (b.overflow.iw + 2) + ' (overflow ' + b.overflow.over + 'px)');
    if (c.motion && c.motion.length) for (const m of c.motion) details.push('reduce: running ' + m.kind + ' ' + (m.name || '') + ' ' + m.ms + 'ms on ' + m.el);

    rows.push({
      id: state.id,
      errors: (state.isDevice ? String(errA) : errA + '/' + errB) + (reached ? '' : ' (not reached)'),
      overflow: b ? (b.overflow ? (b.overflow.ok ? 'ok' : '+' + b.overflow.over + 'px') : 'n/a') : 'skip (T01)',
      motion: c.motion ? (c.motion.length === 0 ? 'ok' : c.motion.length + ' running') : 'n/a',
      ok,
      details,
    });
    process.stdout.write((ok ? 'PASS ' : 'FAIL ') + state.id + '\n');
  }
} finally {
  await browser.close();
}

const pass = rows.filter((r) => r.ok).length;
const lines = [
  '# IMP-46 viewport / motion / error sweep',
  '',
  'App: ' + APP + ' · ' + new Date().toISOString() + ' · ' + states.length + ' checked states',
  '',
  'Errors = pageerror + console.error counts at 1440 (or the T01 frame) / 1024. Overflow = '
    + '`document.documentElement.scrollWidth <= innerWidth + 2` at 1024 (skipped for T01). '
    + 'Motion = running CSS animations / transitions > 0.01 s on visible elements with '
    + '`reducedMotion: reduce`. Click paths are read from tools/harness/paths/*.json.',
  '',
  '| State | Errors | Overflow | Motion | Result |',
  '|---|---|---|---|---|',
  ...rows.map((r) => '| ' + r.id + ' | ' + r.errors + ' | ' + r.overflow + ' | ' + r.motion + ' | ' + (r.ok ? 'PASS' : 'FAIL') + ' |'),
  '',
  pass + ' / ' + rows.length + ' states pass all checks.',
  '',
];
const failing = rows.filter((r) => !r.ok);
if (failing.length) {
  lines.push('## Failure details', '');
  for (const r of failing) {
    lines.push('- **' + r.id + '**');
    for (const d of r.details) lines.push('  - ' + d.replace(/\|/g, '/'));
  }
  lines.push('');
}
fs.writeFileSync(OUT + '/sweep.md', lines.join('\n') + '\n');
console.log(pass + ' / ' + rows.length + ' states pass. Report: tools/e2e/out/sweep.md');
process.exit(pass === rows.length ? 0 : 1);
