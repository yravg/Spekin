import { chromium } from 'playwright';
const [file, sel] = [process.argv[2], process.argv[3] || '.sp-app'];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1700, height: 1200 } });
await p.goto('file://' + file); await p.waitForTimeout(500);
const r = await p.$$eval(sel, (els) => els.slice(0, 3).map((e) => { const r = e.getBoundingClientRect(); let a = e, chain = []; while (a && chain.length < 8) { const r2 = a.getBoundingClientRect(); chain.push((a.className || a.tagName) + '@' + r2.y.toFixed(2) + '/' + r2.height.toFixed(2)); a = a.parentElement; } return { x: r.x, y: r.y, w: r.width, h: r.height, chain }; }));
console.log(JSON.stringify(r, null, 1)); await b.close();