// Copies the canvas stylesheet and icon map into packages/design. --check fails when they differ.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const check = process.argv.includes('--check');
const css = readFileSync(ROOT + 'docs/design/spekin-canvas/project/spekin.css', 'utf8');
const { ICONS } = await import(pathToFileURL(ROOT + 'docs/design/spekin-canvas/kit.mjs').href);
const icons = JSON.stringify(ICONS, null, 1) + '\n';
const out = [['packages/design/spekin.css', css], ['packages/design/icons.json', icons]];
let bad = 0;
for (const [p, s] of out) {
  if (check) { if (!existsSync(ROOT + p) || readFileSync(ROOT + p, 'utf8') !== s) { bad++; console.log('OUT OF SYNC', p, '(run npm run canvas:build && npm run sync:design)'); } }
  else writeFileSync(ROOT + p, s);
}
console.log(check ? (bad ? bad + ' file(s) out of sync' : 'design in sync') : 'design synced');
process.exit(bad ? 1 : 0);
