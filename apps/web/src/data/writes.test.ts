// IMP-41: every screen write goes through the one data door.
//
// Sample mode changes an in-memory copy of the sample and answers with the shape the boards draw
// for the next state. API mode posts to the server and answers with the server's body; a 409 is a
// stale conflict and a network failure raises the offline state. Nothing is shown as saved here:
// the outcome is the only thing a screen may draw.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  LibrarySkill,
  ProjectEntry,
  Reservation,
  Revision,
  RunEstimate,
  SkillManifest,
} from '@spekin/contracts';
import {
  SAMPLE_PROJECT_ID,
  apiSource,
  resetSampleWrites,
  sampleSource,
} from './source';
import { connection, resetSession } from './session';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, (_key, value) => (typeof value === 'bigint' ? Number(value) : value)), {
    status,
    headers: { 'content-type': 'application/json' },
  });

function mockFetch(reply: Response | (() => Response | Promise<Response>)) {
  const spy = vi.fn(async (..._args: Parameters<typeof fetch>) => (typeof reply === 'function' ? reply() : reply));
  vi.stubGlobal('fetch', spy);
  return spy;
}

const ESTIMATE: RunEstimate = { min: 18, max: 30, reserve: 36 };

const MANIFEST: SkillManifest = {
  id: 'grill-meranti',
  title: 'Grill the idea · Meranti copy',
  description: 'Grill a cost-report idea using Meranti cost words.',
  stages: ['planning', 'spec'],
  source: { kind: 'user', copied_from: 'grill' },
  licence: 'Yours',
  notice: null,
  version: '2',
  reads: ['Pitch', 'GLOSSARY.md'],
  proposes: ['Glossary terms', 'ADRs'],
  tools: [],
  scripts: [],
  invocation: '/grill-meranti',
  body: 'Ask in Bahasa Indonesia first.',
};

const SKILL: LibrarySkill = { manifest: MANIFEST, policy: 'auto', kind: 'user', uses: 0 };

const ENTRY: ProjectEntry = {
  id: 'kenari-fleet',
  project: {
    name: 'Kenari Fleet',
    product: 'Vessel schedule board',
    increment: 'Inc. 1 · First release',
    spec: 'r3',
    user: 'Dimas (sample)',
    initials: 'DM',
  },
  revisions: ['r1', 'r2', 'r3'],
  changed_at: 1n,
  deleted_at: 2n,
};

beforeEach(() => {
  resetSampleWrites();
  resetSession();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Writes in sample mode (IMP-41): the in-memory copy moves to the next drawn state', () => {
  it('accept writes exactly the next revision the S33 accepted state draws', async () => {
    const out = await sampleSource.acceptProposal(SAMPLE_PROJECT_ID, 'P-07');
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.value.n).toBe(15);
      expect(out.value.content).toContain('Add the 2-period alert rule');
    }
    // The proposal is closed: a second accept is a stale conflict, never a second revision.
    const again = await sampleSource.acceptProposal(SAMPLE_PROJECT_ID, 'P-07');
    expect(again).toMatchObject({ ok: false, kind: 'stale' });
  });

  it('reject keeps r14 current and records the reviewer reason', async () => {
    const out = await sampleSource.rejectProposal(SAMPLE_PROJECT_ID, 'P-07', 'Too broad');
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.value).toEqual({ id: 'P-07', base: 14, reason: 'Too broad' });
    }
    // A rejected proposal cannot be accepted.
    const late = await sampleSource.acceptProposal(SAMPLE_PROJECT_ID, 'P-07');
    expect(late).toMatchObject({ ok: false, kind: 'stale' });
  });

  it('revert writes a new revision carrying the earlier content', async () => {
    const accepted = await sampleSource.acceptProposal(SAMPLE_PROJECT_ID, 'P-07');
    expect(accepted.ok).toBe(true);
    const out = await sampleSource.revertRevision(SAMPLE_PROJECT_ID, 'spec', { n: 14, content: 'r14 content restored' });
    expect(out.ok).toBe(true);
    if (out.ok) {
      expect(out.value.n).toBe(16);
      expect(out.value.content).toBe('r14 content restored');
    }
  });

  it('estimate then reserve then settle holds and settles credits', async () => {
    const estimate = await sampleSource.estimateRun(SAMPLE_PROJECT_ID, ESTIMATE);
    expect(estimate).toEqual({ ok: true, value: ESTIMATE });

    const reserved = await sampleSource.reserveRun(SAMPLE_PROJECT_ID, {
      run_id: 'run-0429',
      person_id: 'rina',
      idempotency_key: 'k-0429',
      estimate: ESTIMATE,
    });
    expect(reserved.ok).toBe(true);
    if (reserved.ok) {
      expect(reserved.value.status).toBe('active');
      expect(reserved.value.reserved).toBe(36);
    }

    const settled = await sampleSource.settleRun(SAMPLE_PROJECT_ID, { run_id: 'run-0429', actual: 24 });
    expect(settled.ok).toBe(true);
    if (settled.ok) {
      expect(settled.value).toMatchObject({ charged: 24, refunded: 12, cancelled: false });
    }
    // A retry never double-settles.
    const retry = await sampleSource.settleRun(SAMPLE_PROJECT_ID, { run_id: 'run-0429', actual: 24 });
    expect(retry).toMatchObject({ ok: true, value: { charged: 24, refunded: 12 } });
  });

  it('a reserve over the cap fails and holds nothing', async () => {
    const tooBig: RunEstimate = { min: 4900, max: 4960, reserve: 4960 };
    const out = await sampleSource.reserveRun(SAMPLE_PROJECT_ID, {
      run_id: 'run-huge',
      person_id: 'rina',
      idempotency_key: 'k-huge',
      estimate: tooBig,
    });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.kind).toBe('error');
    // No reservation exists, so a settle cannot report one.
    const settle = await sampleSource.settleRun(SAMPLE_PROJECT_ID, { run_id: 'run-huge', actual: 10 });
    expect(settle.ok).toBe(false);
  });

  it('copy and edit a skill, then roll it back', async () => {
    const copy = await sampleSource.copySkill('grill', {
      new_id: 'grill-meranti',
      new_title: 'Grill the idea · Meranti copy',
    });
    expect(copy.ok).toBe(true);
    if (copy.ok) {
      expect(copy.value.manifest.id).toBe('grill-meranti');
      expect(copy.value.kind).toBe('user');
    }
    const rows = await sampleSource.skills();
    expect(rows.some((row) => row[0] === 'grill-meranti')).toBe(true);

    const edit = await sampleSource.editSkill('grill-meranti', {
      title: 'Grill the cost idea',
      description: 'Meranti words only.',
      stages: ['planning', 'spec'],
    });
    expect(edit.ok).toBe(true);
    if (edit.ok) {
      expect(edit.value.manifest.version).toBe('2');
      expect(edit.value.manifest.title).toBe('Grill the cost idea');
    }

    // A template cannot be edited: the server answers 409 and so does the sample.
    const template = await sampleSource.editSkill('grill', { title: 'Nope' });
    expect(template).toMatchObject({ ok: false, kind: 'stale' });

    const rolled = await sampleSource.rollbackSkill('grill-meranti', '1');
    expect(rolled.ok).toBe(true);
    const history = await sampleSource.skillHistory('grill-meranti');
    expect(history.some((entry) => entry.action === 'rolled_back')).toBe(true);
  });

  it('delete a project, then restore it inside the window', async () => {
    const deleted = await sampleSource.deleteProject('bakau-permits');
    expect(deleted.ok).toBe(true);
    if (deleted.ok) expect(deleted.value.deleted_at).not.toBeNull();
    expect((await sampleSource.recentlyDeleted()).ids).toContain('bakau-permits');

    const restored = await sampleSource.restoreProject('bakau-permits');
    expect(restored.ok).toBe(true);
    if (restored.ok) expect(restored.value.deleted_at).toBeNull();
    expect((await sampleSource.recentlyDeleted()).ids).not.toContain('bakau-permits');
  });
});

describe('Writes in API mode (IMP-41): the request body and the server answer', () => {
  it('accept posts to the proposal route and answers with the server revision', async () => {
    const revision: Revision = { n: 15, content: 'R-DASH-019 accepted' };
    const spy = mockFetch(json(revision));

    const out = await apiSource.acceptProposal(SAMPLE_PROJECT_ID, 'P-07');
    expect(out).toEqual({ ok: true, value: revision });
    expect(String(spy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/proposals/P-07/accept');
    expect(spy.mock.calls[0]?.[1]?.method).toBe('POST');
  });

  it('reject posts the reason exactly once', async () => {
    const spy = mockFetch(json({ id: 'P-07', base: 14, reason: 'Too broad' }));
    const out = await apiSource.rejectProposal(SAMPLE_PROJECT_ID, 'P-07', 'Too broad');
    expect(out).toEqual({ ok: true, value: { id: 'P-07', base: 14, reason: 'Too broad' } });
    expect(String(spy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/proposals/P-07/reject');
    expect(spy.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ reason: 'Too broad' }));
  });

  it('revert posts the target revision and redraws from the new revision', async () => {
    const revision: Revision = { n: 16, content: 'r14 content restored' };
    const spy = mockFetch(json(revision));
    const out = await apiSource.revertRevision(SAMPLE_PROJECT_ID, 'spec', { n: 14, content: 'r14 content restored' });
    expect(out).toEqual({ ok: true, value: revision });
    expect(String(spy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/revisions/spec/revert');
    expect(spy.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({ to: { n: 14, content: 'r14 content restored' } }),
    );
  });

  it('estimate, reserve and settle use the ledger routes and bodies', async () => {
    const estimateSpy = mockFetch(json(ESTIMATE));
    await expect(apiSource.estimateRun(SAMPLE_PROJECT_ID, ESTIMATE)).resolves.toEqual({
      ok: true,
      value: ESTIMATE,
    });
    expect(String(estimateSpy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/runs/estimate');

    const reservation: Reservation = {
      run_id: 'run-0429',
      person_id: 'rina',
      idempotency_key: 'k-0429',
      reserved: 36,
      charged: 0,
      refunded: 0,
      status: 'active',
    };
    const reserveSpy = mockFetch(json(reservation));
    const reserved = await apiSource.reserveRun(SAMPLE_PROJECT_ID, {
      run_id: 'run-0429',
      person_id: 'rina',
      idempotency_key: 'k-0429',
      estimate: ESTIMATE,
    });
    expect(reserved).toEqual({ ok: true, value: reservation });
    expect(String(reserveSpy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/runs/reserve');

    const settleSpy = mockFetch(
      json({ run_id: 'run-0429', idempotency_key: 'k-0429', reserved: 36, charged: 24, refunded: 12, cancelled: false }),
    );
    const settled = await apiSource.settleRun(SAMPLE_PROJECT_ID, { run_id: 'run-0429', actual: 24 });
    expect(settled.ok).toBe(true);
    expect(String(settleSpy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/runs/settle');
    expect(settleSpy.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ run_id: 'run-0429', actual: 24 }));
  });

  it('copy, edit and roll back a skill over the skill routes', async () => {
    const copySpy = mockFetch(json(SKILL));
    await expect(
      apiSource.copySkill('grill', { new_id: 'grill-meranti', new_title: 'Grill the idea · Meranti copy' }),
    ).resolves.toEqual({ ok: true, value: SKILL });
    expect(String(copySpy.mock.calls[0]?.[0])).toBe('/api/skills/grill/copy');

    const editSpy = mockFetch(json(SKILL));
    await apiSource.editSkill('grill-meranti', { title: 'Grill the cost idea' });
    expect(String(editSpy.mock.calls[0]?.[0])).toBe('/api/skills/grill-meranti');
    expect(editSpy.mock.calls[0]?.[1]?.method).toBe('PUT');
    expect(editSpy.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ title: 'Grill the cost idea' }));

    const rollbackSpy = mockFetch(json(SKILL));
    await apiSource.rollbackSkill('grill-meranti', '1');
    expect(String(rollbackSpy.mock.calls[0]?.[0])).toBe('/api/skills/grill-meranti/rollback/1');
    expect(rollbackSpy.mock.calls[0]?.[1]?.method).toBe('POST');
  });

  it('delete and restore a project over the project routes', async () => {
    const deleteSpy = mockFetch(json(ENTRY));
    const deleted = await apiSource.deleteProject('kenari-fleet');
    expect(deleted.ok).toBe(true);
    expect(String(deleteSpy.mock.calls[0]?.[0])).toBe('/api/projects/kenari-fleet/delete');

    const restoreSpy = mockFetch(json({ ...ENTRY, deleted_at: null }));
    const restored = await apiSource.restoreProject('kenari-fleet');
    expect(restored.ok).toBe(true);
    if (restored.ok) expect(restored.value.deleted_at).toBeNull();
    expect(String(restoreSpy.mock.calls[0]?.[0])).toBe('/api/projects/kenari-fleet/restore');
  });
});

describe('Write failures (IMP-41)', () => {
  it('a 409 is a stale conflict, never a saved state', async () => {
    mockFetch(json({ code: 'proposal_stale', message: 'proposal is against r14' }, 409));
    const out = await apiSource.acceptProposal(SAMPLE_PROJECT_ID, 'P-07');
    expect(out).toMatchObject({ ok: false, kind: 'stale' });
    expect(connection().offline).toBe(false);
  });

  it('a network failure raises the offline banner', async () => {
    mockFetch(() => {
      throw new TypeError('fetch failed');
    });
    const out = await apiSource.reserveRun(SAMPLE_PROJECT_ID, {
      run_id: 'run-0429',
      person_id: 'rina',
      idempotency_key: 'k-0429',
      estimate: ESTIMATE,
    });
    expect(out).toMatchObject({ ok: false, kind: 'offline' });
    expect(connection().offline).toBe(true);
  });
});
