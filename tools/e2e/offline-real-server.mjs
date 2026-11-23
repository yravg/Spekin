// IMP-45 / IMP-39 follow-up: a REAL server-stop test for the S35 offline state (F378).
//
// Unlike the harness's S35:offline state (which uses the dev-only `?sim=offline` simulation),
// this builds nothing, starts the actual Rust server (`cargo run -p spekin-server`) on a free
// loopback port and the web dev server in API mode, loads the design stage from that server, kills
// the API process, triggers one read (switch stage and back), and proves the screen keeps the
// server's last copy with the offline banner/chip. It stops every process it starts, on success
// and on failure. Exit code 0 only when every assertion passes.
//
// The web dev server's `/api` requests are routed to that API port through the API client's
// documented VITE_API_BASE (apps/web/src/data/api.ts); the server reflects the web origin through
// SPEKIN_WEB_ORIGIN so the cross-origin reads are allowed. The vite proxy target is hardcoded to
// 127.0.0.1:8787 (apps/web/vite.config.ts), so this test uses free dynamic ports instead of taking
// that well-known port away from other parallel workers. A request to the lead to make the proxy
// target configurable is in docs/handoff/lanes/ui.md.
//
// The server is pointed (SPEKIN_FIXTURE) at a temporary copy of the sample fixture whose project
// name and one stage text are deliberately DIFFERENT from @spekin/sample. That proves the values
// on screen after the stop are the ones the real server served, not a sample-only fallback.

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const req = createRequire(import.meta.url);
const { chromium } = req('@playwright/test');
const ROOT = fileURLToPath(new URL('../..', import.meta.url));

// Distinctive, server-served values. These strings do NOT appear in @spekin/sample.
const LIVE_NAME = 'Meranti Yard · LIVE-API';
const LIVE_STAGE_TEXT = 'In progress · LIVE-API copy';
const SAMPLE_NAME = 'Meranti Yard';

const log = (m) => console.log('[offline-real-server] ' + m);
const pass = (m) => console.log('PASS: ' + m);
const assert = (cond, msg) => {
  if (!cond) throw new Error('assertion failed: ' + msg);
};

const children = [];
let tempDir = null;
let browser = null;

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}

// detached => its own process group, so one kill stops cargo+server and npm+vite together.
function spawnGroup(cmd, args, env, cwd) {
  const child = spawn(cmd, args, {
    cwd,
    env,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const lines = [];
  const keep = (s) => {
    lines.push(s);
    if (lines.length > 200) lines.shift();
  };
  child.stdout.on('data', (d) => keep(String(d)));
  child.stderr.on('data', (d) => keep(String(d)));
  child.on('error', (e) => keep('spawn error: ' + e.message));
  child.getLog = () => lines.join('').slice(-6000);
  children.push(child);
  return child;
}

function killGroup(child) {
  if (!child || !child.pid) return;
  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch (e) {
    if (e.code !== 'ESRCH') log('kill warning: ' + e.message);
  }
}

function cleanupSync() {
  for (const c of children) killGroup(c);
  if (tempDir) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
  }
}

async function cleanup() {
  if (browser) {
    try {
      // Bound the close so a wedged browser can never keep this script alive forever.
      await Promise.race([
        browser.close(),
        new Promise((r) => setTimeout(r, 5000)),
      ]);
    } catch {
      /* best effort */
    }
    browser = null;
  }
  cleanupSync();
  tempDir = null;
}
process.on('exit', cleanupSync);

async function waitFor(fn, timeoutMs, label) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      if (await fn()) return;
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`timed out waiting for ${label}${lastErr ? ': ' + lastErr.message : ''}`);
}

async function main() {
  const apiPort = await freePort();
  const webPort = await freePort();
  const apiUrl = `http://127.0.0.1:${apiPort}`;
  const webUrl = `http://127.0.0.1:${webPort}`;

  // A temporary fixture the real server serves, with values the sample package does NOT have.
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spekin-e2e-offline-'));
  const fixturePath = path.join(tempDir, 'meranti-yard.json');
  const fixture = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'fixtures/meranti-yard.json'), 'utf8'),
  );
  fixture.PROJECT.name = LIVE_NAME;
  const design = fixture.STAGES.find((s) => s.id === 'design');
  assert(design, 'the sample fixture lists a design stage');
  design.text = LIVE_STAGE_TEXT;
  fs.writeFileSync(fixturePath, JSON.stringify(fixture));

  const baseEnv = { ...process.env };
  delete baseEnv.DATABASE_URL;
  delete baseEnv.TEST_DATABASE_URL;
  delete baseEnv.VITE_API_BASE;
  delete baseEnv.VITE_SPK_DATA;

  const apiEnv = {
    ...baseEnv,
    SPEKIN_BIND: `127.0.0.1:${apiPort}`,
    SPEKIN_WEB_ORIGIN: webUrl,
    SPEKIN_FIXTURE: fixturePath,
  };
  const webEnv = {
    ...baseEnv,
    VITE_SPK_DATA: 'api',
    VITE_API_BASE: apiUrl,
    SPK_WEB_PORT: String(webPort),
  };

  const apiProc = spawnGroup('cargo', ['run', '-p', 'spekin-server'], apiEnv, ROOT);
  log(`API  : cargo run -p spekin-server on ${apiUrl}`);
  log(`       SPEKIN_BIND=${apiEnv.SPEKIN_BIND} SPEKIN_WEB_ORIGIN=${webUrl} SPEKIN_FIXTURE=${fixturePath}`);
  const webProc = spawnGroup('npm', ['run', 'dev', '-w', '@spekin/web'], webEnv, ROOT);
  log(`web  : npm run dev -w @spekin/web on ${webUrl} (VITE_SPK_DATA=api, VITE_API_BASE=${apiUrl}, SPK_WEB_PORT=${webPort})`);
  log('mode : real server, no ?sim=offline');

  // 1. Wait for the real API and confirm it serves the distinctive values (not the sample).
  let projectBody;
  await waitFor(
    async () => {
      try {
        const r = await fetch(`${apiUrl}/api/projects/meranti-yard`);
        if (r.status !== 200) return false;
        projectBody = await r.json();
        return true;
      } catch {
        return false;
      }
    },
    180000,
    'the real API (GET /api/projects/meranti-yard -> 200)',
  );
  assert(projectBody.name === LIVE_NAME, `server served name ${projectBody.name}, expected ${LIVE_NAME}`);
  pass(`real API serves the distinctive project name "${LIVE_NAME}" (the sample says "${SAMPLE_NAME}")`);

  // 2. The API client reads cross-origin through VITE_API_BASE; prove CORS reflects the web origin.
  const corsRes = await fetch(`${apiUrl}/api/projects/meranti-yard`, { headers: { Origin: webUrl } });
  const acao = corsRes.headers.get('access-control-allow-origin');
  assert(acao === webUrl, `CORS did not reflect ${webUrl}: access-control-allow-origin=${acao}`);
  pass(`CORS reflects the web origin ${webUrl} (VITE_API_BASE cross-origin reads)`);

  // 3. Wait for the web dev server.
  await waitFor(
    async () => {
      try {
        const r = await fetch(webUrl + '/');
        return r.status === 200;
      } catch {
        return false;
      }
    },
    90000,
    'the web dev server (GET / -> 200)',
  );

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const failedRequests = [];
  const apiResponses = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('requestfailed', (r) => failedRequests.push(r.url() + ' :: ' + (r.failure()?.errorText ?? '')));
  page.on('response', (r) => {
    if (/\/api\/projects\/meranti-yard/.test(r.url())) {
      apiResponses.push({ url: r.url(), status: r.status() });
    }
  });

  // 4. Open S35 for Meranti Yard in API mode and wait for the design stage (no ?sim=offline).
  log('opening /p/meranti-yard/design (no simulation flag)');
  await page.goto(`${webUrl}/p/meranti-yard/design`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-screen="S35"]', { timeout: 30000 });
  await page.waitForSelector('[data-stage="design"][aria-current="page"]', { timeout: 30000 });
  await page.waitForFunction(
    (n) => document.querySelector('.sp-proj b')?.textContent === n,
    LIVE_NAME,
    { timeout: 30000 },
  );
  pass('design stage (S35) loaded from the real API');

  const nameBefore = (await page.locator('.sp-proj b').innerText()).trim();
  const stageBarBefore = (await page.locator('nav.sp-stagebar').innerText()).trim();
  assert(nameBefore === LIVE_NAME, `top bar shows ${nameBefore}, expected ${LIVE_NAME}`);
  assert(stageBarBefore.includes(LIVE_STAGE_TEXT), 'the distinctive server-served stage text is not on screen');
  assert((await page.locator('[data-stage]').count()) === 8, 'the stage bar does not show the eight stages');

  const okResponses = apiResponses.filter((r) => r.status === 200);
  assert(okResponses.length >= 1, 'no real 200 GET /api/projects/meranti-yard response was seen');
  pass(`${okResponses.length} real GET /api/projects/meranti-yard -> 200 response(s) seen before the stop`);

  // 5. Kill the API process (the real server stop) and confirm the port refuses connections.
  killGroup(apiProc);
  log('killed the API process group (the real server stop)');
  await waitFor(
    async () => {
      try {
        await fetch(`${apiUrl}/api/projects/meranti-yard`);
        return false;
      } catch {
        return true;
      }
    },
    15000,
    'the API port to refuse connections',
  );
  pass('the real API process is stopped (connection refused)');

  // 6. Trigger one read: switch stage and back. The spec stage (S40) mounts a useDataRead, which
  //    re-runs the skills read; with the server gone it fails and raises the offline state.
  await page.click('[data-stage="spec"]');
  await page.waitForSelector('[data-stage="spec"][aria-current="page"]', { timeout: 15000 });
  await page.click('[data-stage="design"]');
  await page.waitForSelector('[data-stage="design"][aria-current="page"]', { timeout: 15000 });
  log('switched stage spec -> design to trigger one read after the stop');

  // 7. Assertions.
  // The "Try again" button inside the banner also carries data-feature="F378"; target the alert.
  const banner = page.locator('[data-feature="F378"][role="alert"]');
  await banner.waitFor({ state: 'visible', timeout: 15000 });
  pass('[data-feature="F378"] offline banner visible');

  const chip = page.locator('[data-feature="F112"][data-save="conflict"]');
  await chip.waitFor({ state: 'visible', timeout: 15000 });
  const chipText = (await chip.innerText()).trim();
  assert(
    chipText.includes('Offline · kept on this device'),
    'Offline save chip text is wrong: ' + chipText,
  );
  pass('Offline save chip shown ("Offline · kept on this device", data-save=conflict)');

  const nameAfter = (await page.locator('.sp-proj b').innerText()).trim();
  assert(
    nameAfter === nameBefore && nameAfter === LIVE_NAME && nameAfter !== SAMPLE_NAME,
    `project name not kept: before="${nameBefore}" after="${nameAfter}"`,
  );
  pass(`project name kept as the server-served "${LIVE_NAME}" (NOT the sample-only "${SAMPLE_NAME}")`);

  const stageBarAfter = (await page.locator('nav.sp-stagebar').innerText()).trim();
  assert(
    stageBarAfter === stageBarBefore && stageBarAfter.includes(LIVE_STAGE_TEXT),
    'the eight stages were not kept exactly as the server served them',
  );
  pass('all eight stages kept as the server served them (stage bar text identical, distinctive text present)');

  assert(pageErrors.length === 0, 'pageerror events: ' + JSON.stringify(pageErrors));
  pass('0 pageerror events');

  if (consoleErrors.length) {
    log(`note: ${consoleErrors.length} console error(s) after the stop (expected: refused /api fetches)`);
  }
  if (failedRequests.length) {
    log(`note: ${failedRequests.length} failed request(s) after the stop (expected)`);
  }

  log('ALL ASSERTIONS PASSED');
}

try {
  await main();
  process.exitCode = 0;
} catch (e) {
  console.log('FAIL: ' + (e?.message ?? String(e)));
  for (const c of children) {
    if (c.getLog && c.getLog().trim()) log('--- child log ---\n' + c.getLog());
  }
  process.exitCode = 1;
} finally {
  await cleanup();
  // Never hang the caller: if a stray handle stays open after cleanup, force exit with the result.
  setTimeout(() => process.exit(process.exitCode ?? 0), 5000).unref();
}
