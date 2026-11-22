// Writes fixtures/meranti-yard.json from the sample module, for the Rust server and contract tests. --check fails on drift.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const check = process.argv.includes('--check');
const S = await import(pathToFileURL(ROOT + 'docs/design/spekin-canvas/sample/meranti-yard.mjs').href);
const data = {}; for (const k of Object.keys(S).sort()) data[k] = S[k];
const s = JSON.stringify(data, null, 1) + '\n';
const p = ROOT + 'fixtures/meranti-yard.json';
if (check) { const ok = existsSync(p) && readFileSync(p, 'utf8') === s; console.log(ok ? 'fixtures in sync' : 'OUT OF SYNC fixtures/meranti-yard.json (run npm run sync:fixtures)'); process.exit(ok ? 0 : 1); }
mkdirSync(ROOT + 'fixtures', { recursive: true }); writeFileSync(p, s); console.log('fixtures written', Object.keys(data).length, 'exports');
