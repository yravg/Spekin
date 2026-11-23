import { afterEach, describe, expect, it, vi } from 'vitest';
import fixture from '../../../../fixtures/meranti-yard.json';
import { SAMPLE_PROJECT_ID, apiSource, sampleSource } from './source';

// The fixture is what the Rust server serves (fixtures/meranti-yard.json), the same one the boards draw.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function mockFetchByPath(): void {
  const calm = fixture.MODELS_USAGE.calm;
  const usageSnapshot = {
    used: calm.used,
    reserved: calm.reserved,
    pending: calm.pending,
    committed: calm.used + calm.reserved + calm.pending,
    cap: calm.cap,
    left: calm.cap - calm.used - calm.reserved - calm.pending,
    severity: 'calm',
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('no-such-project')) return new Response('', { status: 404 });
      if (url.endsWith('/stages')) return json(fixture.STAGES);
      if (url.endsWith('/usage')) return json(usageSnapshot);
      return json(fixture.PROJECT);
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('data source (IMP-21): one door, two implementations', () => {
  it('apiSource and sampleSource return deep-equal project, stages and usage for meranti-yard', async () => {
    mockFetchByPath();

    const [apiProject, apiStages, apiUsage] = await Promise.all([
      apiSource.project(SAMPLE_PROJECT_ID),
      apiSource.stages(SAMPLE_PROJECT_ID),
      apiSource.usage(SAMPLE_PROJECT_ID),
    ]);
    const [sampleProject, sampleStages, sampleUsage] = await Promise.all([
      sampleSource.project(SAMPLE_PROJECT_ID),
      sampleSource.stages(SAMPLE_PROJECT_ID),
      sampleSource.usage(SAMPLE_PROJECT_ID),
    ]);

    expect(apiProject).toEqual(sampleProject);
    expect(apiStages).toEqual(sampleStages);
    expect(apiUsage).toEqual(sampleUsage);
  });

  it('both sources answer an unknown project with null and no stages', async () => {
    mockFetchByPath();

    expect(await apiSource.project('no-such-project')).toBeNull();
    expect(await apiSource.stages('no-such-project')).toEqual([]);
    expect(await sampleSource.project('no-such-project')).toBeNull();
    expect(await sampleSource.stages('no-such-project')).toEqual([]);
  });

  it('sampleSource can hand its local snapshot over before any request', () => {
    expect(sampleSource.snapshot(SAMPLE_PROJECT_ID)?.project.name).toBe('Meranti Yard');
    expect(sampleSource.snapshot('no-such-project')).toBeNull();
    // The API source has nothing local: the screen shows nothing until the fetch resolves.
    expect(apiSource.snapshot(SAMPLE_PROJECT_ID)).toBeNull();
  });
});
