// IMP-51 · Focused regression test for the 1024-1439 desktop band.
//
// The viewport/motion/error sweep (tools/e2e/sweep.mjs) found 11 checked states whose
// click path was blocked at 1024x768 by a floating overlay. This test runs exactly
// those checked click paths at 1024x768 and fails if any control is intercepted.
// Click paths are read from tools/harness/paths/*.json (never changed). Boards and
// click paths are not touched. Run with the dev server on the card's port:
//   SPK_WEB_PORT=5185 npm run dev
//   APP_URL=http://127.0.0.1:5185 node tools/e2e/band-1024.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const req = createRequire(ROOT + 'package.json');
const { chromium } = req('@playwright/test');
const APP = (process.env.APP_URL || 'http://127.0.0.1:5185').replace(/\/$/, '');

const CASES = [
  ['S28', 'drop'], ['S28', 'imported'], ['S28', 'rejected'], ['S28', 'pii'],
  ['S31', 'grid'],
  ['S32', 'select'], ['S32', 'working'], ['S32', 'applied'], ['S32', 'compare'],
  ['S32', 'variations'], ['S32', 'clip'],
];

const paths = new Map(CASES.map(([board]) => [board, JSON.parse(fs.readFileSync(ROOT + '/tools/harness/paths/' + board + '.json', 'utf8'))]));

try {
  const r = await fetch(APP + '/');
  if (!r.ok) throw new Error('HTTP ' + r.status);
} catch (e) {
  console.error('App not reachable at ' + APP + ' (' + e.message + ')');
  process.exit(2);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 });
let failed = 0;
try {
  for (const [board, name] of CASES) {
    const state = paths.get(board).states[name];
    if (state.status !== 'checked') throw new Error(board + ':' + name + ' is not checked');
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.split('\n')[0]));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text().slice(0, 200)); });
    try {
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
      await page.waitForSelector('[data-screen="' + board + '"]', { timeout: 5000 });
      const ok = errors.length === 0;
      if (!ok) failed++;
      console.log((ok ? 'PASS ' : 'FAIL ') + board + ':' + name + (errors.length ? ' ' + errors.join(' | ') : ''));
    } catch (e) {
      failed++;
      const lines = e.message.split('\n').map((l) => l.replace(/\x1b\[[0-9;]*m/g, '').trim());
      const why = lines.find((l) => /intercepts pointer events/.test(l)) || lines.find((l) => /Timeout/.test(l)) || lines[0];
      console.log('FAIL ' + board + ':' + name + ' ' + why);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
console.log((CASES.length - failed) + ' / ' + CASES.length + ' states reachable at 1024x768');
process.exit(failed === 0 ? 0 : 1);
