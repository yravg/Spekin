// Writes fixtures/meranti-yard.json and fixtures/genui-cards.json from the sample module, for the Rust
// server and contract tests. --check fails on drift.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const check = process.argv.includes('--check');
const S = await import(pathToFileURL(ROOT + 'docs/design/spekin-canvas/sample/meranti-yard.mjs').href);
const data = {}; for (const k of Object.keys(S).sort()) data[k] = S[k];
const s = JSON.stringify(data, null, 1) + '\n';
const cards = S.GENUI_CARDS ?? [];
const genui = JSON.stringify(cards, null, 1) + '\n';
const out = [['fixtures/meranti-yard.json', s], ['fixtures/genui-cards.json', genui]];
let bad = 0;
for (const [p, text] of out) {
  if (check) {
    const ok = existsSync(ROOT + p) && readFileSync(ROOT + p, 'utf8') === text;
    if (!ok) { bad++; console.log('OUT OF SYNC ' + p + ' (run npm run sync:fixtures)'); }
  } else {
    mkdirSync(ROOT + 'fixtures', { recursive: true }); writeFileSync(ROOT + p, text);
  }
}
if (check) { console.log(bad ? bad + ' fixture file(s) out of sync' : 'fixtures in sync'); process.exit(bad ? 1 : 0); }
console.log('fixtures written', Object.keys(data).length, 'exports and', cards.length, 'GenUI cards');
