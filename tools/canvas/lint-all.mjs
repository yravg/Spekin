// Lints every screen board and keeps docs/design/spekin-canvas/canvas-states.json (the app harness input) equal to the boards.
// node tools/canvas/lint-all.mjs          lint + check the manifest is current (CI)
// node tools/canvas/lint-all.mjs --write  lint + rewrite the manifest (after a canvas change; commit it with the boards)
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const boards = ROOT + 'docs/design/spekin-canvas/project';
const committed = ROOT + 'docs/design/spekin-canvas/canvas-states.json';
const dir = mkdtempSync(join(tmpdir(), 'spk-'));
// Screen boards only (S.., T..). F00 feature map and R00 references are index pages, not boards. The canvas is After-only (owner).
const files = readdirSync(boards).filter((f) => /^[ST]\d+.*\.dc\.html$/.test(f)).sort();
const all = [];
let failed = 0;
for (const f of files) {
  const out = join(dir, f + '.json');
  try {
    execFileSync(process.execPath, [ROOT + 'tools/canvas/lint_boards.mjs', join(boards, f), '--after-only', '--manifest', out], { encoding: 'utf8' });
  } catch (e) { process.stdout.write(e.stdout || ''); failed++; continue; }
  all.push(...JSON.parse(readFileSync(out, 'utf8')));
}
if (failed) { console.log(failed + ' board(s) fail the board lint'); process.exit(1); }
console.log(files.length + ' boards pass the board lint, ' + all.reduce((n, b) => n + b.states.length, 0) + ' states');
const fresh = JSON.stringify(all, null, 2) + '\n';
if (process.argv.includes('--write')) { writeFileSync(committed, fresh); console.log('canvas-states.json written'); process.exit(0); }
if (!existsSync(committed) || readFileSync(committed, 'utf8') !== fresh) {
  console.log('canvas-states.json is out of date with the boards. Run: node tools/canvas/lint-all.mjs --write, then commit it.');
  process.exit(1);
}
console.log('canvas-states.json current');
