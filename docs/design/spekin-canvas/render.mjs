// Renders every board and every state at 1900 px. node render.mjs [filter]
// Fails on console errors, broken images, page overflow, notes outside the window, and overflow inside the app panels.
// Writes renders/*.png and heights.json. Playwright: set PW_FROM to a package.json path whose node_modules has playwright.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = fileURLToPath(new URL('.', import.meta.url));
const { chromium } = createRequire(process.env.PW_FROM || HERE + 'package.json')('playwright');
const OUT = process.env.SPK_OUT || 'project';
const root = HERE + OUT, out = HERE + 'renders' + (OUT === 'project' ? '' : '/' + OUT.replace(/[^a-z0-9-]/gi, '_')), only = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'text/plain' }); r.end(b); } }); }).listen(0);
await new Promise((ok) => srv.once('listening', ok)); const PORT = srv.address().port;
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1900, height: 1200 } })).newPage();
let errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/woff2|favicon|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
p.on('response', (r) => { if (r.status() === 404 && !/woff2|favicon/.test(r.url())) errs.push('404 ' + r.url()); });
const hfile = HERE + 'heights.json', heights = fs.existsSync(hfile) ? JSON.parse(fs.readFileSync(hfile, 'utf8')) : {};
let bad = 0;
for (const f of fs.readdirSync(root).filter((x) => x.endsWith('.dc.html') && (!only || x.includes(only)))) {
  errs = [];
  await p.goto(`http://localhost:${PORT}/` + f); await p.waitForSelector('.board', { timeout: 15000 }); await p.waitForTimeout(900);
  const n = f.replace('.dc.html', ''), btns = await p.locator('.vw button').count();
  let hmax = 0; const probs = [];
  for (let k = 0; k < Math.max(1, btns); k++) {
    if (btns) { await p.locator('.vw button').nth(k).click(); await p.waitForTimeout(350); }
    await p.screenshot({ path: `${out}/${n}${btns ? '-' + k : ''}.png`, fullPage: true });
    const o = await p.evaluate(() => {
      const over = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1).map((e) => sel + ':' + (e.getAttribute('aria-label') || e.className)).slice(0, 3);
      const win = document.querySelector('.spwin')?.getBoundingClientRect();
      return { h: Math.ceil(document.querySelector('.board').getBoundingClientRect().height), pageX: document.documentElement.scrollWidth > 1900,
        panels: [...over('.sp-msgs'), ...over('.sp-ib'), ...over('.sp-doc'), ...over('.sp-tabs'), ...over('.sp-top'), ...over('.sp-chat'), ...over('.sp-stagebar'), ...over('.sp-tool'), ...over('.sp-banner'), ...over('.sp-insp')].join(' ') || 0,
        appWide: [...document.querySelectorAll('.spwin')].filter((w) => w.scrollWidth > w.clientWidth + 1 || [...w.querySelectorAll('.sp-app')].some((a) => a.getBoundingClientRect().width > 1441)).length,
        notesOut: win ? [...document.querySelectorAll('.spwin > .note')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > win.right || r.bottom > win.bottom || r.left < win.left || r.top < win.top; }).length : 0,
        img: [...document.images].filter((i) => !i.naturalWidth).length };
    });
    hmax = Math.max(hmax, o.h);
    for (const [key, v] of Object.entries(o)) if (key !== 'h' && v) probs.push(`state ${k}: ${key}=${v}`);
  }
  heights[n] = hmax;
  if (probs.length || errs.length) { bad++; console.log('FAIL', n, [...probs, ...errs.slice(0, 3)].join(' | ')); } else console.log('ok  ', n, hmax);
}
// merge into the latest heights.json (other workers may have written since we started)
const latest = fs.existsSync(hfile) ? JSON.parse(fs.readFileSync(hfile, 'utf8')) : {};
for (const [k, v] of Object.entries(heights)) if (!only || k.includes(only) || !(k in latest)) latest[k] = v;
fs.writeFileSync(hfile, JSON.stringify(latest, null, 1));
await b.close(); srv.close();
process.exit(bad ? 1 : 0);
