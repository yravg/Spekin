// Tests for the licence and no-Python inventory (IMP-12, AC-SPK-19 and 23).
// Run with: node --test tools/checks/licences.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { audit, classifyLicence, npmInventory, renderLicences, scanBuildText } from './licences.mjs';

const npmPkg = (name, licence, extra = {}) => ({ name, version: '1.0.0', licence, source: 'npm', scope: 'dev', ...extra });
const crate = (name, licence, extra = {}) => ({ name, version: '1.0.0', licence, source: 'crate', ...extra });

test('permissive licences are allowed and reported as permissive', () => {
  for (const l of ['MIT', 'Apache-2.0', 'ISC', 'BSD-3-Clause', 'MIT OR Apache-2.0', 'Apache-2.0 OR MIT', '(MIT OR Apache-2.0) AND Unicode-3.0', 'Apache-2.0 WITH LLVM-exception OR Apache-2.0 OR MIT']) {
    const c = classifyLicence(l);
    assert.equal(c.kind, 'permissive', l);
    assert.equal(c.copyleft, false, l);
  }
});

test('GPL, LGPL and AGPL are copyleft and need an allow-list entry', () => {
  for (const [l, family] of [['GPL-3.0-only', 'GPL'], ['GPL-2.0-or-later', 'GPL'], ['AGPL-3.0', 'AGPL'], ['LGPL-2.1', 'LGPL'], ['MIT OR GPL-3.0', 'GPL']]) {
    const c = classifyLicence(l);
    assert.equal(c.copyleft, true, l);
    assert.equal(c.family, family, l);
  }
});

test('an empty or unrecognised licence is unknown, never silently permissive', () => {
  for (const l of ['', undefined, 'SEE LICENCE IN LICENSE', 'WTFPL']) {
    assert.equal(classifyLicence(l).kind, 'unknown', String(l));
  }
});

test('a missing licence fails the inventory', () => {
  const r = audit({ npm: [npmPkg('ok', 'MIT'), npmPkg('nolicence', '')], crates: [crate('ok', 'MIT')] });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.kind === 'missing-licence' && p.name === 'nolicence'));
});

test('GPL without an allow-list entry fails, with the reason naming the licence', () => {
  const r = audit({ npm: [npmPkg('copyleft', 'GPL-3.0-only')], crates: [] });
  assert.equal(r.ok, false);
  const p = r.problems.find((x) => x.kind === 'copyleft');
  assert.ok(p, 'expected a copyleft problem');
  assert.match(p.detail, /GPL-3\.0-only/);
});

test('GPL with an allow-list entry passes and is still listed as copyleft', () => {
  const r = audit({
    npm: [npmPkg('copyleft', 'GPL-3.0-only')],
    crates: [],
    allowlist: [{ package: 'copyleft', licence: 'GPL-3.0-only', reason: 'reviewed by the owner' }],
  });
  assert.equal(r.ok, true);
  assert.equal(r.copyleft.length, 1);
  assert.equal(r.copyleft[0].allowed, true);
});

test('an allow-list entry for another licence or package does not cover this one', () => {
  const r = audit({
    npm: [npmPkg('copyleft', 'GPL-3.0-only')],
    crates: [],
    allowlist: [{ package: 'other', licence: 'GPL-3.0-only', reason: 'x' }, { package: 'copyleft', licence: 'AGPL-3.0', reason: 'x' }],
  });
  assert.equal(r.ok, false);
});

test('python in a build script or a .py file fails the inventory', () => {
  assert.equal(scanBuildText('package.json', '{"scripts":{"build":"python3 build.py"}}').length, 1);
  assert.equal(scanBuildText('ci.yml', 'run: pip install -r requirements.txt').length, 1);
  assert.equal(scanBuildText('tools/build.mjs', 'execFileSync("python", ["-V"])').length, 1);
  assert.equal(scanBuildText('README.md', 'No Python anywhere, ever.').length, 0);
  assert.equal(scanBuildText('tools/checks/rules.mjs', "fail('R1 no-python', f, 'Python file or manifest');").length, 0);
  assert.equal(scanBuildText('package.json', '{"scripts":{"build":"node build.mjs"}}').length, 0);
  const r = audit({ npm: [], crates: [], files: ['tools/old.py'] });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.kind === 'python' && p.name === 'tools/old.py'));
});

test('python in an npm install script fails the inventory', () => {
  const r = audit({ npm: [npmPkg('pybind', 'MIT', { installScript: 'node-gyp rebuild && python3 setup.py build' })], crates: [] });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.kind === 'python' && p.name === 'pybind'));
});

test('the rendered inventory lists every package with its licence and says it is generated', () => {
  const r = audit({ npm: [npmPkg('alpha', 'MIT'), npmPkg('beta', 'GPL-3.0-only')], crates: [crate('gamma', 'MIT OR Apache-2.0')] });
  const md = renderLicences(r);
  assert.match(md, /generated/i);
  assert.match(md, /alpha/);
  assert.match(md, /beta/);
  assert.match(md, /gamma/);
  assert.match(md, /MIT OR Apache-2\.0/);
  assert.match(md, /GPL-3\.0-only/);
  assert.match(md, /npm run check:licences|node tools\/checks\/licences\.mjs/);
});

test('workspace link entries resolve licence without node_modules and fall back for private packages', () => {
  const dir = mkdtempSync(join(tmpdir(), 'spekin-licences-'));
  try {
    mkdirSync(join(dir, 'apps/web'), { recursive: true });
    mkdirSync(join(dir, 'packages/priv'), { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'spekin', private: true, license: 'Apache-2.0' }));
    writeFileSync(join(dir, 'apps/web/package.json'), JSON.stringify({ name: '@spekin/web', version: '0.1.0', license: 'Apache-2.0' }));
    writeFileSync(join(dir, 'packages/priv/package.json'), JSON.stringify({ name: '@spekin/priv', version: '0.1.0', private: true }));
    writeFileSync(
      join(dir, 'package-lock.json'),
      JSON.stringify({
        name: 'spekin',
        lockfileVersion: 3,
        packages: {
          '': { name: 'spekin', license: 'Apache-2.0' },
          'apps/web': { name: '@spekin/web', version: '0.1.0', license: 'Apache-2.0' },
          'node_modules/@spekin/web': { resolved: 'apps/web', link: true },
          'packages/priv': { name: '@spekin/priv', version: '0.1.0' },
          'node_modules/@spekin/priv': { resolved: 'packages/priv', link: true },
          'node_modules/third-party': { version: '1.0.0' },
        },
      }),
    );

    const entries = npmInventory(dir);
    const webLink = entries.find((e) => e.name === '@spekin/web' && e.version === '');
    const privDirect = entries.find((e) => e.name === '@spekin/priv' && e.version === '0.1.0');
    const privLink = entries.find((e) => e.name === '@spekin/priv' && e.version === '');
    const thirdParty = entries.find((e) => e.name === 'third-party');

    assert.equal(webLink?.licence, 'Apache-2.0');
    assert.equal(privDirect?.licence, 'Apache-2.0');
    assert.equal(privLink?.licence, 'Apache-2.0');
    assert.equal(thirdParty?.licence, '');

    const res = audit({ npm: entries.filter((e) => e.name !== 'third-party'), crates: [] });
    assert.equal(res.ok, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
