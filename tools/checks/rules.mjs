// House rules that a machine can check. Runs in CI and in npm run gate. Exit 1 on any breach.
// Each rule names where it comes from, so a failing agent knows why it exists.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SKIP = new Set(['node_modules', 'target', 'dist', '.git', 'graft', 'renders', 'publish', 'work', 'ref', 'out', 'inputs']);
const walk = (d, acc = []) => { for (const f of readdirSync(d)) { if (SKIP.has(f)) continue; const p = join(d, f); const s = statSync(p); if (s.isDirectory()) walk(p, acc); else acc.push(p); } return acc; };
const files = walk(ROOT).map((p) => relative(ROOT, p));
const bad = [];
const fail = (rule, where, why) => bad.push(rule + '  ' + where + '  ' + why);
const read = (f) => readFileSync(ROOT + f, 'utf8');

// R1 No Python anywhere in the product (owner direction, PRD 16.2, AC-SPK-19).
for (const f of files) if (/\.py$|(^|\/)(requirements[^/]*\.txt|pyproject\.toml|Pipfile|setup\.cfg)$/.test(f)) fail('R1 no-python', f, 'Python file or manifest');

// App source rules
const app = files.filter((f) => f.startsWith('apps/web/src/') && /\.(tsx?|css)$/.test(f));
for (const f of app) {
  const s = read(f);
  // R2 Board-only classes never ship (canvas language, not UI): isnew, part, newtag, parttag, latertag, note, board.
  if (!f.endsWith('app.css') && /className=["'{][^"'}]*\b(isnew|newtag|parttag|latertag|note|board|aside)\b/.test(s)) fail('R2 board-only-class', f, 'uses a board-only class');
  if (/\.(tsx)$/.test(f)) {
    // R3 Every raw <button> says what it does or is marked later (canvas-to-app rule 9; Clausarium: 3,849 "Not built yet").
    for (const m of s.matchAll(/<button\b[\s\S]*?>/g)) if (!/data-does=|data-later=|\{\.\.\.actionProps\(/.test(m[0])) fail('R3 control-contract', f + ':' + (s.slice(0, m.index).split('\n').length), 'button without data-does or data-later');
    // R4 No "Not built yet" toast or alert: a control is built, or disabled with data-later.
    if (/not built yet|coming soon|TODO: wire/i.test(s)) fail('R4 no-fake-controls', f, '"not built yet" / "coming soon" text');
    // R5 Screens declare their board id (canvas-to-app rule 17).
    if (/\/screens?\/|Shell\.tsx$/.test(f) && /export function [A-Z]/.test(s) && !/data-screen=/.test(s) && /return \(/.test(s) && /Shell\.tsx$|Screen\.tsx$/.test(f)) fail('R5 screen-id', f, 'screen component without data-screen');
  }
  // R10 Build components, don't paste board HTML: no innerHTML except the Icon helper, no imports from the canvas folder.
  if (!f.endsWith('ui/Icon.tsx') && /dangerouslySetInnerHTML|\.innerHTML\s*=/.test(s)) fail('R10 no-pasted-html', f, 'renders raw HTML; write components (ADR 0003)');
  if (/from ['"][^'"]*docs\/design/.test(s)) fail('R10 no-pasted-html', f, 'imports from docs/design; use @spekin/design or @spekin/sample');
  // R11 Board markup kept as a string (to paste or diff) is the same mistake as R10. JSX writes className, so an HTML tag with class="…" in app source is markup in a string.
  { const m = /<(?:div|span|button|section|svg|header|aside|nav|ul|li|p|a|table)\b[^>]*\bclass=["']/.exec(s); if (m) fail('R11 no-html-strings', f + ':' + s.slice(0, m.index).split('\n').length, 'board markup inside a string; build it as JSX components'); }
  // R6 Colours and fonts come from the design tokens: no raw hex in app code (tastestack QA gate 4).
  if (/#[0-9a-fA-F]{3,8}\b/.test(s.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, ''))) fail('R6 tokens', f, 'raw hex colour; use var(--token) from @spekin/design');
}
// R7 No secrets or keys in the repo (SECURITY.md).
const SECRET = /(sk-(ant|live|proj)-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[bp]-[A-Za-z0-9-]{20,})/;
for (const f of files) if (/\.(m?js|tsx?|rs|json|md|toml|ya?ml|env|html)$/.test(f) && statSync(ROOT + f).size < 2e6 && SECRET.test(read(f))) fail('R7 secrets', f, 'looks like a key or token');
// R8 Generated files are not hand-edited: design copy and fixtures carry their source (checked for drift by check:sync).
for (const f of ['packages/design/spekin.css', 'packages/design/icons.json', 'fixtures/meranti-yard.json']) if (!existsSync(ROOT + f)) fail('R8 generated', f, 'missing; run npm run sync:design / sync:fixtures');
// R9 Every board state has an app click path entry (the state gate can then report it, even as a draft).
const manifest = JSON.parse(read('docs/design/spekin-canvas/canvas-states.json'));
const paths = {};
for (const f of readdirSync(ROOT + 'tools/harness/paths').filter((x) => x.endsWith('.json'))) { const j = JSON.parse(read('tools/harness/paths/' + f)); paths[j.board] = j.states; }
const unmapped = manifest.flatMap((b) => b.states.filter((s) => !paths[b.board]?.[s.state]).map((s) => b.screen + ':' + s.state));
// Not a failure yet: boards get their paths when their task card starts. Reported so nobody forgets.
console.log('info  ' + unmapped.length + ' board state(s) have no app click path yet (added by each task card).');

if (bad.length) { console.log(bad.join('\n')); console.log(bad.length + ' rule breach(es)'); process.exit(1); }
console.log('rules ok (' + files.length + ' files)');
