#!/usr/bin/env node
// Live worker page: a local HTML page that reloads every 5 s and shows each CLI worker
// (status, branch, commits ahead of main, pull request and CI, last log lines).
// Node port of the Clausarium idea (tools/live-workers.py there); Spekin has no Python.
//
// Usage: node tools/live/live-workers.mjs tools/live/team.json [--port 33107]
// Team file: {"title": "...", "workers": [{"id": "A", "title": "Spekin A", "model": "opencode-go/hy4",
//             "cards": "IMP-43, IMP-45", "worktree": "../Spekin-core", "log": "../worker-A.log"}]}
// Paths in the team file are relative to the repo root. A worker is "running" while a process whose
// command line contains `--title <title>` is alive.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const teamFile = path.resolve(args.find((a) => !a.startsWith('--')) ?? path.join(repo, 'tools/live/team.json'));
const portArg = args.indexOf('--port');
const port = Number(portArg >= 0 ? args[portArg + 1] : process.env.LIVE_PORT || 33107);
const host = process.env.LIVE_HOST || '127.0.0.1';

const run = (cmd, argv, cwd) => {
  try {
    return execFileSync(cmd, argv, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 8000 }).trim();
  } catch {
    return '';
  }
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Strip ANSI colour codes that opencode writes into its log.
const clean = (s) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');

// GitHub is slow and rate-limited: ask at most every 30 s.
let prCache = { at: 0, prs: [] };
function pullRequests() {
  if (Date.now() - prCache.at > 30_000) {
    const out = run('gh', ['pr', 'list', '--state', 'all', '--limit', '30', '--json',
      'number,title,headRefName,state,url,statusCheckRollup'], repo);
    try { prCache = { at: Date.now(), prs: JSON.parse(out || '[]') }; } catch { prCache.at = Date.now(); }
  }
  return prCache.prs;
}

function ciSummary(pr) {
  const checks = pr.statusCheckRollup ?? [];
  if (!checks.length) return { text: 'no checks yet', tone: 'wait' };
  const parts = checks.map((c) => `${c.name}: ${(c.conclusion || c.status || '?').toLowerCase()}`);
  const done = checks.every((c) => c.status === 'COMPLETED');
  const green = done && checks.every((c) => c.conclusion === 'SUCCESS');
  return { text: parts.join(' · '), tone: green ? 'ok' : done ? 'bad' : 'wait' };
}

function processes() {
  // Only the opencode workers: the full process list can pass 1 MB and overflow execFileSync.
  return run('pgrep', ['-fl', 'opencode run'], repo).split('\n').filter(Boolean);
}

function worker(w, ps, prs) {
  const wt = path.resolve(repo, w.worktree);
  const proc = ps.find((l) => l.includes('opencode') && l.includes(`--title ${w.title} `));
  const branch = run('git', ['branch', '--show-current'], wt) || '(detached)';
  const ahead = run('git', ['log', '--oneline', 'origin/main..HEAD'], wt).split('\n').filter(Boolean);
  const dirty = run('git', ['status', '--short'], wt).split('\n').filter(Boolean).length;
  let lines = [];
  let logAge = null;
  try {
    const logPath = path.resolve(repo, w.log);
    lines = clean(fs.readFileSync(logPath, 'utf8')).split('\n').map((l) => l.trimEnd()).filter((l) => l.trim());
    logAge = Math.round((Date.now() - fs.statSync(logPath).mtimeMs) / 1000);
  } catch { /* no log yet */ }
  const tail = lines.slice(-14);
  const mine = prs.filter((p) => w.branches?.some((b) => p.headRefName === b) || p.headRefName === branch);
  const failedLog = !proc && tail.slice(-5).some((l) => /error|failed|limit/i.test(l));
  const status = proc ? 'running' : failedLog ? 'stopped (check log)' : 'finished';
  const started = proc ? run('ps', ['-o', 'lstart=', '-p', proc.trim().split(/\s+/)[0]], repo) : '';
  return { ...w, status, started, branch, ahead, dirty, tail, logAge, prs: mine };
}

function page() {
  const team = JSON.parse(fs.readFileSync(teamFile, 'utf8'));
  const ps = processes();
  const prs = pullRequests();
  const ws = team.workers.map((w) => worker(w, ps, prs));
  const now = new Date().toLocaleTimeString('en-GB');
  const card = (w) => `
  <section class="card">
    <header>
      <h2>${esc(w.id)} · ${esc(w.cards)}</h2>
      <span class="pill ${w.status === 'running' ? 'ok' : w.status === 'finished' ? 'done' : 'bad'}">${esc(w.status)}</span>
    </header>
    <dl>
      <dt>Model</dt><dd>${esc(w.model)}</dd>
      <dt>Worktree</dt><dd><code>${esc(w.worktree)}</code></dd>
      <dt>Branch</dt><dd><code>${esc(w.branch)}</code> · ${w.ahead.length} commit(s) ahead of main · ${w.dirty} changed file(s)</dd>
      ${w.started ? `<dt>Started</dt><dd>${esc(w.started)}</dd>` : ''}
      <dt>Log</dt><dd>${w.logAge === null ? 'no log yet' : `last write ${w.logAge}s ago`}</dd>
    </dl>
    ${w.ahead.length ? `<ul class="commits">${w.ahead.slice(0, 6).map((c) => `<li><code>${esc(c)}</code></li>`).join('')}</ul>` : ''}
    ${w.prs.map((p) => { const ci = ciSummary(p); return `<p class="pr"><a href="${esc(p.url)}">#${p.number} ${esc(p.title)}</a> <span class="pill ${p.state === 'MERGED' ? 'done' : ci.tone}">${esc(p.state.toLowerCase())}</span><br><small>${esc(ci.text)}</small></p>`; }).join('') || '<p class="muted">No pull request yet.</p>'}
    <pre>${esc(w.tail.join('\n')) || 'waiting for output'}</pre>
  </section>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="5">
<title>Spekin Live Workers</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--ink:#1b1f24;--muted:#5b6470;--line:#dde1e6;--ok:#1f7a3f;--okbg:#e3f4e8;--bad:#a12a2a;--badbg:#fbe4e4;--wait:#8a5a00;--waitbg:#fdf1d8;--done:#3b4aa8;--donebg:#e6e9fb;--pre:#0f1419;--preink:#d7dde3}
@media (prefers-color-scheme: dark){:root{--bg:#0f1216;--card:#171b21;--ink:#e6e9ed;--muted:#9aa4af;--line:#2a3038;--okbg:#123222;--ok:#6fd39a;--badbg:#3a1717;--bad:#f09a9a;--waitbg:#3a2c10;--wait:#f0c36a;--donebg:#1d2448;--done:#a9b4f5;--pre:#0a0d10}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;padding:16px}
h1{font-size:18px;margin:0 0 2px}.sub{color:var(--muted);margin:0 0 16px}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px;min-width:0}
header{display:flex;justify-content:space-between;align-items:center;gap:8px}h2{font-size:15px;margin:0}
.pill{font-size:12px;padding:2px 8px;border-radius:99px;white-space:nowrap}
.ok{background:var(--okbg);color:var(--ok)}.bad{background:var(--badbg);color:var(--bad)}.wait{background:var(--waitbg);color:var(--wait)}.done{background:var(--donebg);color:var(--done)}
dl{display:grid;grid-template-columns:max-content 1fr;gap:2px 10px;margin:10px 0}dt{color:var(--muted)}dd{margin:0;min-width:0;overflow-wrap:anywhere}
.commits{margin:0 0 8px;padding-left:18px}.pr{margin:6px 0}.pr small,.muted{color:var(--muted)}a{color:var(--done)}
pre{background:var(--pre);color:var(--preink);padding:10px;border-radius:8px;font-size:12px;overflow:auto;max-height:280px;white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 0}
</style></head><body>
<h1>${esc(team.title)}</h1>
<p class="sub">Updated ${now} · reloads every 5 s · GitHub checked every 30 s</p>
<div class="grid">${ws.map(card).join('')}</div>
</body></html>`;
}

http.createServer((req, res) => {
  try {
    const body = req.url === '/live.json'
      ? JSON.stringify(JSON.parse(fs.readFileSync(teamFile, 'utf8')))
      : page();
    res.writeHead(200, { 'content-type': req.url === '/live.json' ? 'application/json' : 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(body);
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end(String(e));
  }
}).listen(port, host, () => console.log(`live workers: http://${host}:${port}/`));
