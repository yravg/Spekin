import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Project, Stage } from '@spekin/contracts';
import fixture from '../../../../fixtures/meranti-yard.json';
import { ApiError, fetchProject, fetchStages } from './api';
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
