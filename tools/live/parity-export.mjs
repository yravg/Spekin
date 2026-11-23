#!/usr/bin/env node
// Spekin parity for the yravglive page: the app against the canvas (boards, states, features) and the spec (PRD).
// Prints one JSON document (the Clausarium parity.json shape) to stdout. Reads only; writes nothing.
//
//   kind "state"    every board state in docs/design/spekin-canvas/canvas-states.json
//                   proven  = the last harness run (tools/harness/out/report.json) says PASS on a checked path
//                   partial = the state was reached but failed;  open = not reached or not in the report
//   kind "feature"  every data-feature id a board draws (canvas-states.json "features")
//                   proven  = the harness saw the id rendered in the app (report.json "features") in a PASS state
//                             of a board that draws it: reached by a real click path, not just present in the source
//                   partial = in apps/web/src but never seen on a click path (e.g. behind a prop the app never sets)
//                   open    = not in apps/web/src
//   kind "req"      every R-XXX-n in the canonical PRD (inputs/Spekin-PRD-v0.2.3.md)
//                   proven  = a feature mapped to it (docs/design/spekin-canvas/maps-reqs.mjs REQS) is proven
//                   partial = mapped features exist, none proven;  unmapped = no feature maps to it
// Weights: state 3, feature 2, req 1. Score = weighted share of proven cells.
// Usage (from the repo root): node tools/live/parity-export.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const rd = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const canvasDir = 'docs/design/spekin-canvas';

const boards = JSON.parse(rd(`${canvasDir}/canvas-states.json`));
let report = { at: null, results: [] };
try { report = JSON.parse(rd('tools/harness/out/report.json')); } catch { /* no harness run yet: every state is open */ }
const { REQS } = await import(pathToFileURL(path.join(root, canvasDir, 'maps-reqs.mjs')).href);

// Feature descriptions: the annotation tuples in the board generators, e.g. ['F378', 'new', 'Server offline: ...', 'Lead'].
const fdesc = {};
for (const f of fs.readdirSync(path.join(root, canvasDir)).filter((x) => /^boards-.*\.mjs$/.test(x))) {
  for (const m of rd(`${canvasDir}/${f}`).matchAll(/\['(F\d+)',\s*'[a-z]+',\s*'((?:[^'\\]|\\.)*)'/g)) fdesc[m[1]] ??= m[2].replace(/\\'/g, "'");
}

// Feature ids present in the app source (tests excluded).
const inApp = new Set();
(function walk(dir) {
  for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(e.name) && !/\.test\./.test(e.name)) for (const m of rd(p).matchAll(/\bF\d{3}\b/g)) inApp.add(m[0]);
  }
})('apps/web/src');

// PRD requirements and their line text.
const prd = rd('inputs/Spekin-PRD-v0.2.3.md');
const reqTitle = {};
for (const line of prd.split('\n')) {
  for (const m of line.matchAll(/\bR-[A-Z]+-\d+\b/g)) reqTitle[m[0]] ??= line.replace(/[|*#`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
}

const result = (screen, state) => report.results.find((r) => r.screen === screen && r.state === state);
const stateCell = (b, st) => {
  const r = result(b.screen, st.state);
  const k = `${b.screen}:${st.state}`;
  if (!r) return { k, kind: 'state', w: 3, s: 'open', why: 'not in the last harness report' };
  if (r.verdict === 'PASS' && r.status === 'checked') return { k, kind: 'state', w: 3, s: 'proven', why: `harness PASS, pixels ${r.pixels}%`, ev: ['tools/harness/out/report.json'] };
  return { k, kind: 'state', w: 3, s: r.reached ? 'partial' : 'open', why: `harness ${r.verdict}${r.status !== 'checked' ? ' (path ' + r.status + ')' : ''}: ${(r.reasons || []).join('; ').slice(0, 200) || 'no reason given'}` };
};

const boardPass = {};
for (const b of boards) boardPass[b.screen] = b.states.every((st) => stateCell(b, st).s === 'proven');
const boardsOf = {};
for (const b of boards) for (const f of b.features) (boardsOf[f] ??= new Set()).add(b.screen);

const featureState = {};
// Where the harness saw each id rendered, in PASS states only.
const seenIn = {};
for (const r of report.results) {
  if (r.verdict !== 'PASS' || r.status !== 'checked') continue;
  for (const f of r.features ?? []) (seenIn[f] ??= []).push(`${r.screen}:${r.state}`);
}
const harnessHasFeatures = report.results.some((r) => Array.isArray(r.features));
const featureCell = (f) => {
  const on = [...(boardsOf[f] ?? [])];
  const seen = (seenIn[f] ?? []).filter((x) => on.includes(x.split(':')[0]));
  let s, why;
  if (!inApp.has(f)) { s = 'open'; why = `not in apps/web/src; drawn on ${on.join(', ')}`; }
  else if (!harnessHasFeatures) { s = 'partial'; why = 'in apps/web/src; the harness report predates feature tracking: run npm run harness'; }
  else if (seen.length) { s = 'proven'; why = `rendered by the app on a passing click path: ${seen.slice(0, 4).join(', ')}${seen.length > 4 ? ' …' : ''}`; }
  else { s = 'partial'; why = `in apps/web/src but never rendered on a click path of ${on.join(', ')} (wire it or add a harness state)`; }
  featureState[f] = s;
  return { k: `${f} ${(fdesc[f] ?? '').slice(0, 70)}`.trim(), kind: 'feature', w: 2, s, why };
};

const features = boards.map((b) => ({
  id: b.board.replace(/\.dc\.html$/, ''),
  fid: b.screen,
  title: `Board ${b.board.replace(/\.dc\.html$/, '')}`,
  status: boardPass[b.screen] ? 'done' : 'open',
  note: `${b.states.length} states, ${b.features.length} features`,
  cells: [...b.states.map((st) => stateCell(b, st)), ...b.features.map(featureCell)],
}));

// Spec rows: one per requirement group (R-WS, R-MOD, ...).
const featuresOfReq = {};
for (const [f, reqs] of Object.entries(REQS)) for (const r of reqs) (featuresOfReq[r] ??= []).push(f);
const groups = {};
for (const r of Object.keys(reqTitle).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))) {
  const fs_ = featuresOfReq[r] ?? [];
  let s, why;
  if (!fs_.length) { s = 'unmapped'; why = 'no canvas feature maps to it (maps-reqs.mjs)'; }
  else if (fs_.some((f) => featureState[f] === 'proven')) { s = 'proven'; why = `proven by ${fs_.filter((f) => featureState[f] === 'proven').join(', ')}`; }
  else { s = 'partial'; why = `mapped to ${fs_.join(', ')}; none proven yet`; }
  (groups[r.replace(/-\d+$/, '')] ??= []).push({ k: `${r} ${reqTitle[r].replace(r, '').trim().slice(0, 70)}`.trim(), kind: 'req', w: 1, s, why });
}
for (const [g, cells] of Object.entries(groups)) {
  features.push({ id: g, fid: g, title: `PRD ${g}`, status: cells.every((c) => c.s === 'proven') ? 'done' : 'open', note: `${cells.length} requirements`, cells });
}

const all = features.flatMap((f) => f.cells);
const counts = {};
for (const c of all) counts[c.s] = (counts[c.s] || 0) + 1;
const wAll = all.reduce((a, c) => a + c.w, 0);
const wProven = all.filter((c) => c.s === 'proven').reduce((a, c) => a + c.w, 0);
const by_kind = {};
for (const c of all) { const k = (by_kind[c.kind] ??= { items: 0, proven: 0 }); k.items++; if (c.s === 'proven') k.proven++; }
let commit = '';
try { commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(); } catch { /* not a git checkout */ }
const reportAge = report.at ? `harness run ${new Date(report.at).toISOString().slice(0, 16).replace('T', ' ')} UTC` : 'no harness run found';

process.stdout.write(JSON.stringify({
  title: `Parity: app against the canvas (${boards.length} boards) and the PRD (${Object.keys(reqTitle).length} requirements) · ${reportAge}`,
  search: 'Find a board, state, F-id or R-id',
  kinds: ['state', 'feature', 'req'],
  updated: Date.now(),
  commit,
  score: wAll ? Math.round((1000 * wProven) / wAll) / 10 : 0,
  by_kind,
  counts,
  invalid: [],
  features,
}));
