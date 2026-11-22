// Licence and no-Python inventory (IMP-12; AC-SPK-19 and AC-SPK-23, partial).
//
// Lists every npm package (from package-lock.json) and every crate (from cargo metadata)
// with its licence, and fails when:
//   - a package or crate has no licence,
//   - a licence is GPL, LGPL or AGPL and has no entry in tools/checks/licence-allowlist.json,
//   - a licence cannot be classified and has no allow-list entry,
//   - Python is anywhere in the dependency tree or the build.
//
// It writes docs/licences.md, which is generated: do not edit it by hand.
//
// Usage:
//   node tools/checks/licences.mjs           # audit, write docs/licences.md, exit 1 on a problem
//   node tools/checks/licences.mjs --check   # audit and fail if docs/licences.md is out of date
//   node --test tools/checks/licences.test.mjs
//
// No dependency: Node built-ins only. No Python, by design (ADR 0002).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const ALLOWLIST = 'tools/checks/licence-allowlist.json';
const OUTPUT = 'docs/licences.md';

// Directories that are never part of the product or the inventory (same list as rules.mjs).
const SKIP = new Set(['node_modules', 'target', 'dist', '.git', 'graft', 'renders', 'publish', 'work', 'ref', 'out', 'inputs', '.vite']);

// Licences we can read as permissive without asking a person. Anything not here is either
// copyleft (GPL family, below) or unknown, and unknown needs an allow-list entry too.
const PERMISSIVE = new Set([
  'MIT', 'MIT-0', 'APACHE-2.0', 'ISC', 'BSD-2-CLAUSE', 'BSD-3-CLAUSE', '0BSD', 'UNLICENSE',
  'CC0-1.0', 'CC-BY-3.0', 'CC-BY-4.0', 'ZLIB', 'BLUEOAK-1.0.0', 'UNICODE-3.0',
  'UNICODE-DFS-2016', 'BSL-1.0', 'W3C', 'W3C-20150313', 'CC-BY-2.5', 'PUBLIC-DOMAIN',
]);
// Exceptions that ride on top of a permissive base licence.
const EXCEPTIONS = new Set(['LLVM-EXCEPTION']);

/**
 * Classify one licence expression (SPDX, cargo's legacy `MIT/Apache-2.0`, or an OR/AND list).
 * Returns { kind: 'permissive' | 'copyleft' | 'unknown', copyleft: boolean, family?: 'GPL'|'LGPL'|'AGPL' }.
 */
export function classifyLicence(expression) {
  const text = String(expression ?? '').trim();
  if (!text) return { kind: 'unknown', copyleft: false };
  const ids = text
    .replace(/[()]/g, ' ')
    .split(/\s+OR\s+|\s+AND\s+|\s+WITH\s+|\//i)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  if (ids.length === 0) return { kind: 'unknown', copyleft: false };

  const gpl = ids.filter((id) => /^(A?GPL|L?GPL)[-0-9.]/.test(id) || id === 'GPL' || id === 'AGPL' || id === 'LGPL');
  if (gpl.length) {
    const family = gpl.some((id) => id.startsWith('AGPL')) ? 'AGPL' : gpl.some((id) => id.startsWith('LGPL')) ? 'LGPL' : 'GPL';
    return { kind: 'copyleft', copyleft: true, family };
  }
  const unknown = ids.filter((id) => !PERMISSIVE.has(id) && !EXCEPTIONS.has(id));
  if (unknown.length) return { kind: 'unknown', copyleft: false };
  return { kind: 'permissive', copyleft: false };
}

// Python in a build or a package script. Written so that prose ("no Python anywhere") does not match:
// only a command, a flag, a .py path or a Python manifest counts.
const PYTHON_PATTERNS = [
  /(?<![\w-])python[0-9.]*\s+-[a-zA-Z]/, // python -V, python3 -m pip
  /(?<![\w-])python[0-9.]*\s+["'`]?[\w./-]+\.py\b/i, // python3 build.py
  /["'`]python[0-9.]*["'`]\s*[,)\]}]/, // execFileSync("python", ...) / spawn('python')
  /\bpip[0-9.]*\s+install\b/i,
  /\bpyproject\.toml\b/i,
  /\brequirements[\w.-]*\.txt\b/i,
  /\bPipfile\b/,
  /\bsetup\.cfg\b/i,
  /\.py\b/i,
];

/** The first Python hit in one build file or package script: [{ kind: 'python', name, detail }] (at most one). */
export function scanBuildText(path, text) {
  const body = String(text ?? '');
  for (const re of PYTHON_PATTERNS) {
    const m = body.match(re);
    if (m) return [{ kind: 'python', name: path, detail: 'Python in the build: ' + m[0].trim() }];
  }
  return [];
}

// Code files name Python in their detectors and comments ("no Python anywhere"), so strip
// comments and regex literals before scanning a script. Manifests are scanned as they are.
const stripCodeNoise = (text) =>
  String(text)
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:\\])\/\/.*$/gm, '$1 ')
    .replace(/\/(?:\\.|\[[^\]]*\]|[^/\n\\])+\/[gimsuy]*/g, ' ');

const allowedBy = (entry, allowlist) =>
  (allowlist ?? []).some(
    (a) => a && a.package === entry.name && String(a.licence ?? '').trim().toLowerCase() === String(entry.licence ?? '').trim().toLowerCase() && String(a.reason ?? '').trim().length > 0,
  );

/**
 * Audit an inventory. Pure: no IO, so the tests can drive every case.
 * npm: [{ name, version, licence, scope, installScript? }]
 * crates: [{ name, version, licence }]
 * files: ['tools/old.py'] (paths found in the repo)
 * buildTexts: [{ path, text }] (manifests, CI files and build scripts)
 */
export function audit({ npm = [], crates = [], files = [], buildTexts = [], allowlist = [] }) {
  const problems = [];
  const copyleft = [];
  const unknown = [];

  for (const entry of [...npm, ...crates]) {
    const licence = String(entry.licence ?? '').trim();
    if (entry.installScript) {
      for (const hit of scanBuildText(entry.name, entry.installScript)) {
        problems.push({ ...hit, detail: 'install script runs Python' });
      }
    }
    if (!licence) {
      problems.push({ kind: 'missing-licence', name: entry.name, detail: 'no licence field in ' + (entry.source === 'crate' ? 'Cargo metadata' : 'package-lock.json or node_modules') });
      continue;
    }
    const c = classifyLicence(licence);
    if (c.copyleft) {
      const allowed = allowedBy(entry, allowlist);
      copyleft.push({ ...entry, family: c.family, allowed });
      if (!allowed) {
        problems.push({ kind: 'copyleft', name: entry.name, detail: licence + ' (' + c.family + ') needs an entry in ' + ALLOWLIST });
      }
    } else if (c.kind === 'unknown') {
      const allowed = allowedBy(entry, allowlist);
      unknown.push({ ...entry, allowed });
      if (!allowed) {
        problems.push({ kind: 'unknown-licence', name: entry.name, detail: licence + ' cannot be classified; add it to ' + ALLOWLIST + ' with a reason' });
      }
    }
  }

  for (const path of files) {
    if (/\.py$/.test(path) || /(^|\/)(requirements[^/]*\.txt|pyproject\.toml|Pipfile|setup\.cfg)$/.test(path)) {
      problems.push({ kind: 'python', name: path, detail: 'Python file or manifest in the repository' });
    }
  }
  for (const { path, text } of buildTexts) {
    for (const hit of scanBuildText(path, text)) problems.push(hit);
  }

  const inventory = { npm, crates };
  return { ok: problems.length === 0, problems, copyleft, unknown, inventory };
}

const byName = (a, b) => a.name.localeCompare(b.name, 'en') || String(a.version ?? '').localeCompare(String(b.version ?? ''), 'en');

/** The generated docs/licences.md. Deterministic: no timestamps, so --check can compare it. */
export function renderLicences(result) {
  const { npm, crates } = result.inventory;
  const lines = [];
  lines.push('# Licences');
  lines.push('');
  lines.push('Generated by `node tools/checks/licences.mjs`. Do not edit by hand: run the command after changing dependencies.');
  lines.push('');
  lines.push('It lists every npm package (from `package-lock.json`) and every crate (from `cargo metadata`) with its licence, and it fails on a missing licence, on GPL, LGPL or AGPL without an entry in [`licence-allowlist.json`](../' + ALLOWLIST + '), and on any Python in the dependency tree or the build (AC-SPK-19 and AC-SPK-23, partial).');
  lines.push('');
  lines.push('| | Count |');
  lines.push('|---|---|');
  lines.push('| npm packages | ' + npm.length + ' |');
  lines.push('| crates | ' + crates.length + ' |');
  lines.push('| copyleft, allowed | ' + result.copyleft.filter((c) => c.allowed).length + ' |');
  lines.push('| copyleft, not allowed | ' + result.copyleft.filter((c) => !c.allowed).length + ' |');
  lines.push('| unclassified | ' + result.unknown.length + ' |');
  lines.push('| Python | ' + result.problems.filter((p) => p.kind === 'python').length + ' |');
  lines.push('');
  lines.push('## npm packages');
  lines.push('');
  lines.push('| Package | Version | Scope | Licence |');
  lines.push('|---|---|---|---|');
  for (const p of [...npm].sort(byName)) {
    lines.push('| ' + p.name + ' | ' + (p.version || '-') + ' | ' + (p.scope === 'dev' ? 'dev' : 'runtime') + ' | ' + (p.licence || '**missing**') + ' |');
  }
  lines.push('');
  lines.push('## Crates');
  lines.push('');
  lines.push('| Crate | Version | Licence |');
  lines.push('|---|---|---|');
  for (const c of [...crates].sort(byName)) {
    lines.push('| ' + c.name + ' | ' + (c.version || '-') + ' | ' + (c.licence || '**missing**') + ' |');
  }
  lines.push('');
  lines.push('## Copyleft and unclassified');
  lines.push('');
  if (result.copyleft.length === 0 && result.unknown.length === 0) {
    lines.push('None. Every package and crate is under a permissive licence.');
  } else {
    lines.push('| Package | Licence | Family | Allow-list entry |');
    lines.push('|---|---|---|---|');
    for (const c of [...result.copyleft, ...result.unknown].sort(byName)) {
      lines.push('| ' + c.name + ' | ' + c.licence + ' | ' + (c.family || 'unclassified') + ' | ' + (c.allowed ? 'yes' : '**no**') + ' |');
    }
  }
  lines.push('');
  lines.push('## No Python');
  lines.push('');
  const python = result.problems.filter((p) => p.kind === 'python');
  if (python.length === 0) {
    lines.push('No Python file, manifest or build step was found in the repository or in an npm install script.');
  } else {
    for (const p of python) lines.push('- ' + p.name + ': ' + p.detail);
  }
  lines.push('');
  lines.push('## Problems');
  lines.push('');
  if (result.ok) {
    lines.push('None. This file is current.');
  } else {
    for (const p of result.problems) lines.push('- ' + p.kind + ' · ' + p.name + ' · ' + p.detail);
  }
  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------- IO (the CLI)

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

const rel = (path) => relative(ROOT, path).split(sep).join('/');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function npmInventory() {
  const lock = readJson(join(ROOT, 'package-lock.json'));
  const entries = [];
  for (const [key, value] of Object.entries(lock.packages ?? {})) {
    if (!key) continue; // the root package, listed above as the repo
    const name = value.name || key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length);
    const installed = join(ROOT, key, 'package.json');
    let licence = value.license;
    let installScript = '';
    if (existsSync(installed)) {
      const pkg = readJson(installed);
      licence = licence || pkg.license;
      if (value.hasInstallScript) installScript = Object.values(pkg.scripts ?? {}).join('\n');
    }
    entries.push({
      name,
      version: value.version || '',
      licence: String(licence ?? ''),
      source: 'npm',
      scope: value.dev || value.devOptional ? 'dev' : 'runtime',
      ...(installScript ? { installScript } : {}),
    });
  }
  return entries;
}

function crateInventory() {
  const raw = execFileSync('cargo', ['metadata', '--format-version', '1', '--all-features'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const metadata = JSON.parse(raw);
  return (metadata.packages ?? []).map((p) => ({
    name: p.name,
    version: p.version,
    licence: p.license || (p.license_file ? 'file: ' + p.license_file : ''),
    source: 'crate',
  }));
}

function buildTexts() {
  const texts = [];
  const add = (path) => {
    const full = join(ROOT, path);
    if (!existsSync(full) || statSync(full).size >= 2e6) return;
    const text = readFileSync(full, 'utf8');
    texts.push({ path, text: /\.(mjs|cjs|js|ts)$/.test(path) ? stripCodeNoise(text) : text });
  };
  add('package.json');
  add('Cargo.toml');
  add('rust-toolchain.toml');
  for (const dir of ['apps', 'packages']) {
    const base = join(ROOT, dir);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base)) add(join(dir, name, 'package.json'));
  }
  for (const path of walk(ROOT)) {
    const r = rel(path);
    if (/^\.github\/workflows\/.*\.ya?ml$/.test(r) || /(^|\/)Dockerfile[^/]*$/.test(r) || /^crates\/[^/]+\/(Cargo\.toml|build\.rs)$/.test(r)) add(r);
    // Build scripts, not the checker and not its tests: this file names Python on purpose.
    if (/^tools\/.*\.mjs$/.test(r) && !r.endsWith('.test.mjs') && r !== 'tools/checks/licences.mjs') add(r);
  }
  return texts;
}

function main() {
  const check = process.argv.includes('--check');
  const allowlistPath = join(ROOT, ALLOWLIST);
  const allowlist = existsSync(allowlistPath) ? readJson(allowlistPath).allowed ?? [] : [];
  const files = walk(ROOT).map(rel).filter((p) => !p.startsWith('docs/licences.md'));

  const result = audit({ npm: npmInventory(), crates: crateInventory(), files, buildTexts: buildTexts(), allowlist });
  const markdown = renderLicences(result);
  const outPath = join(ROOT, OUTPUT);
  const previous = existsSync(outPath) ? readFileSync(outPath, 'utf8') : '';

  if (check) {
    if (previous !== markdown) {
      console.log('docs/licences.md is out of date. Run: node tools/checks/licences.mjs');
    }
  } else if (previous !== markdown) {
    writeFileSync(outPath, markdown);
    console.log('wrote ' + OUTPUT);
  }

  for (const p of result.problems) console.log(p.kind + '  ' + p.name + '  ' + p.detail);
  const stale = check && previous !== markdown;
  if (result.ok && !stale) {
    console.log('licences ok (' + result.inventory.npm.length + ' npm packages, ' + result.inventory.crates.length + ' crates, 0 Python)');
  }
  process.exit(result.ok && !stale ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
