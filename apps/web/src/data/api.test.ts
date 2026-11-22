import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  GenUiValidation,
  Manifest,
  ModelCapability,
  Project,
  Rejection,
  RequestContext,
  Reservation,
  Revision,
  RunEstimate,
  SkillManifest,
  Stage,
  UpdateCheck,
  UsageSnapshot,
} from '@spekin/contracts';
import fixture from '../../../../fixtures/meranti-yard.json';
import {
  ApiError,
  acceptProposal,
  buildHandoffManifest,
  buildProjectContext,
  checkSkillUpdate,
  estimateRun,
  fetchModels,
  fetchProject,
  fetchStages,
  fetchUsage,
  rejectProposal,
  reserveRun,
  validateGenUi,
} from './api';
import { SAMPLE_PROJECT_ID, getProject, getStages } from './source';

// The fixture the boards draw is the one the Rust server serves (tools/export-fixtures.mjs).
const PROJECT = fixture.PROJECT as Project;
const STAGES = fixture.STAGES as Stage[];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** Mock fetch with one reply and hand back the spy, so tests can check the URL too. */
function mockFetch(reply: Response | (() => Response | Promise<Response>)) {
  const spy = vi.fn(async (..._args: Parameters<typeof fetch>) => (typeof reply === 'function' ? reply() : reply));
  vi.stubGlobal('fetch', spy);
  return spy;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('API source (IMP-03): the Rust API is the sample', () => {
  it('fetchProject returns exactly what getProject returns for the sample project', async () => {
    const spy = mockFetch(json(PROJECT));

    const fromApi = await fetchProject(SAMPLE_PROJECT_ID);

    expect(fromApi).toEqual(getProject(SAMPLE_PROJECT_ID));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(spy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard');
  });

  it('fetchStages returns exactly what getStages returns for the sample project', async () => {
    const spy = mockFetch(json(STAGES));

    const fromApi = await fetchStages(SAMPLE_PROJECT_ID);

    expect(fromApi).toEqual(getStages(SAMPLE_PROJECT_ID));
    expect(fromApi).toHaveLength(8);
    expect(String(spy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/stages');
  });

  it('an unknown project is null, not an empty object (404)', async () => {
    mockFetch(new Response('not found', { status: 404 }));

    await expect(fetchProject('nope')).resolves.toBeNull();
    await expect(fetchStages('nope')).resolves.toBeNull();
  });

  it('bad JSON is a typed error, never a crash', async () => {
    mockFetch(new Response('<html>oops</html>', { status: 200 }));

    const error = await fetchProject(SAMPLE_PROJECT_ID).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).not.toBeInstanceOf(SyntaxError);
    expect((error as ApiError).kind).toBe('json');
  });

  it('JSON of the wrong shape is a typed error', async () => {
    mockFetch(json({ name: 'Meranti Yard' }));

    const project = await fetchProject(SAMPLE_PROJECT_ID).catch((e: unknown) => e);
    expect(project).toBeInstanceOf(ApiError);
    expect((project as ApiError).kind).toBe('shape');

    mockFetch(json([{ id: 'planning' }]));
    const stages = await fetchStages(SAMPLE_PROJECT_ID).catch((e: unknown) => e);
    expect(stages).toBeInstanceOf(ApiError);
    expect((stages as ApiError).kind).toBe('shape');
  });

  it('a server error is a typed error carrying the status', async () => {
    mockFetch(new Response('boom', { status: 500 }));

    const error = await fetchProject(SAMPLE_PROJECT_ID).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).kind).toBe('http');
    expect((error as ApiError).status).toBe(500);
  });

  it('a refused connection is a typed error, not a raw TypeError', async () => {
    mockFetch(() => {
      throw new TypeError('fetch failed');
    });

    const error = await fetchStages(SAMPLE_PROJECT_ID).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).kind).toBe('network');
  });

  it('an explicit base URL is used for both calls', async () => {
    const spy = mockFetch(json(PROJECT));

    await fetchProject(SAMPLE_PROJECT_ID, { baseUrl: 'http://127.0.0.1:8787' });

    expect(String(spy.mock.calls[0]?.[0])).toBe('http://127.0.0.1:8787/api/projects/meranti-yard');
  });
});

describe('Core API client (IMP-26): typed requests, responses and 4xx errors', () => {
  it('acceptProposal posts to accept and parses Revision; 409 carries server code', async () => {
    const rev: Revision = { n: 15, content: 'R-DASH-019' };
    const spy = mockFetch(json(rev));

    const out = await acceptProposal(SAMPLE_PROJECT_ID, 'P-07');
    expect(out).toEqual(rev);
    expect(String(spy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/proposals/P-07/accept');
    expect(spy.mock.calls[0]?.[1]?.method).toBe('POST');

    mockFetch(json({ code: 'proposal_stale', message: 'proposal is against r14' }, 409));
    const err = await acceptProposal(SAMPLE_PROJECT_ID, 'P-07').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).kind).toBe('http');
    expect((err as ApiError).status).toBe(409);
    expect((err as ApiError).code).toBe('proposal_stale');
  });

  it('rejectProposal posts reason and parses Rejection', async () => {
    const rej: Rejection = { id: 'P-07', base: 14, reason: 'Too broad' };
    const spy = mockFetch(json(rej));

    const out = await rejectProposal(SAMPLE_PROJECT_ID, 'P-07', 'Too broad');
    expect(out).toEqual(rej);
    expect(String(spy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/proposals/P-07/reject');
    expect(spy.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ reason: 'Too broad' }));
  });

  it('estimateRun, reserveRun and fetchUsage call the ledger routes', async () => {
    const est: RunEstimate = { min: 18, max: 30, reserve: 36 };
    const estSpy = mockFetch(json(est));
    await expect(estimateRun(SAMPLE_PROJECT_ID, est)).resolves.toEqual(est);
    expect(String(estSpy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/runs/estimate');

    const res: Reservation = {
      run_id: 'run-0429',
      person_id: 'user-enrico',
      idempotency_key: 'k-1',
      reserved: 36,
      charged: 0,
      refunded: 0,
      status: 'active',
    };
    const resSpy = mockFetch(json(res));
    await expect(
      reserveRun(SAMPLE_PROJECT_ID, {
        run_id: 'run-0429',
        person_id: 'user-enrico',
        idempotency_key: 'k-1',
        estimate: est,
      }),
    ).resolves.toEqual(res);
    expect(String(resSpy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/runs/reserve');

    const usage: UsageSnapshot = {
      used: 1240,
      reserved: 36,
      pending: 30,
      committed: 1306,
      cap: 5000,
      left: 3694,
      severity: 'calm',
    };
    const usageSpy = mockFetch(json(usage));
    await expect(fetchUsage(SAMPLE_PROJECT_ID)).resolves.toEqual(usage);
    expect(String(usageSpy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/usage');

    mockFetch(json({ code: 'project_not_found', message: 'unknown' }, 404));
    await expect(fetchUsage('nope')).resolves.toBeNull();
  });

  it('fetchModels returns the ModelCapability list', async () => {
    const models: ModelCapability[] = [
      {
        id: 'claude-sonnet-5-5',
        name: 'Sonnet 5.5',
        provider: 'Anthropic',
        context_tokens: 200000,
        max_output_tokens: 16000,
        image_input: true,
        tools: true,
        price: null,
        availability: 'selected',
      },
    ];
    const spy = mockFetch(json(models));
    await expect(fetchModels()).resolves.toEqual(models);
    expect(String(spy.mock.calls[0]?.[0])).toBe('/api/models');
  });

  it('validateGenUi returns Ok on 200 and Rejected on 422', async () => {
    const ok: GenUiValidation = {
      status: 'ok',
      card: {
        schema_version: 1,
        id: 'c1',
        title: 'Checklist',
        provenance: 'model_proposal',
        body: null,
        links: [],
        actions: [],
        family: 'checklist',
        items: [],
        summary: null,
      },
    };
    mockFetch(json(ok, 200));
    await expect(validateGenUi({ family: 'checklist' })).resolves.toEqual(ok);

    const rejected: GenUiValidation = {
      status: 'rejected',
      reason: { code: 'privilege_escalation', action: 'deploy' },
    };
    mockFetch(json(rejected, 422));
    await expect(validateGenUi({ family: 'checklist' })).resolves.toEqual(rejected);
  });

  it('checkSkillUpdate posts manifests and policy and returns UpdateCheck', async () => {
    const skill: SkillManifest = {
      id: 'grill-idea',
      title: 'Grill',
      description: 'Stress-test',
      stages: ['planning'],
      source: { kind: 'template' },
      licence: 'MIT',
      notice: null,
      version: '1.0.0',
      reads: ['pitch'],
      proposes: ['decisions'],
      tools: [],
      scripts: [],
      invocation: '/grill-idea',
      body: 'Ask questions.',
    };
    const check: UpdateCheck = {
      skill_id: 'grill-idea',
      from_version: '1.0.0',
      to_version: '1.1.0',
      policy: 'auto',
      decision: { decision: 'apply' },
    };
    const spy = mockFetch(json(check));
    await expect(checkSkillUpdate({ old: skill, new: skill, policy: 'auto' })).resolves.toEqual(check);
    expect(String(spy.mock.calls[0]?.[0])).toBe('/api/skills/check-update');
  });

  it('buildProjectContext posts chips and returns RequestContext', async () => {
    const ctx: RequestContext = {
      items: [{ artifact_id: 'F-03', revision: 'r6', status: 'accepted', estimated_tokens: 3100 }],
      total_estimated_tokens: 3100,
    };
    const spy = mockFetch(json(ctx));
    await expect(
      buildProjectContext(SAMPLE_PROJECT_ID, {
        chips: [{ artifact_id: 'F-03', revision: 'r6', status: 'accepted', estimated_tokens: 3100 }],
        board: null,
      }),
    ).resolves.toEqual(ctx);
    expect(String(spy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/context');
  });

  it('buildHandoffManifest posts selection and returns Manifest', async () => {
    const manifest: Manifest = {
      manifest_id: 'm-0008',
      spec_rev: 'r14',
      framework: 'React',
      artifacts: [],
      exclusions: [],
      required_inputs: [{ name: 'PRD', status: 'missing', revision: null, label: 'PRD: missing' }],
    };
    const spy = mockFetch(json(manifest));
    await expect(
      buildHandoffManifest(SAMPLE_PROJECT_ID, {
        selection: {
          manifest_id: 'm-0008',
          spec_rev: 'r14',
          framework: 'React',
          items: [{ artifact_id: 'F-01', revision_n: 4 }],
        },
        revisions: null,
        inputs: null,
      }),
    ).resolves.toEqual(manifest);
    expect(String(spy.mock.calls[0]?.[0])).toBe('/api/projects/meranti-yard/handoff/manifest');
  });
});
