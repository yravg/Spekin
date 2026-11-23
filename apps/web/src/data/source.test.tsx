import { afterEach, describe, expect, it, vi } from 'vitest';
import fixture from '../../../../fixtures/meranti-yard.json';
import {
  SAMPLE_PROJECT_ID,
  apiSource,
  sampleSource,
  type SampleDeliveryContract,
  type SampleModelRegistryRow,
  type SampleSkillRow,
  type SampleSkillSource,
} from './source';

// The fixture is what the Rust server serves (fixtures/meranti-yard.json), the same one the boards draw.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const STAGE_IDS: Record<string, string> = {
  Planning: 'planning',
  Specification: 'spec',
  Design: 'design',
  Frontend: 'frontend',
  Backend: 'backend',
  Integration: 'integration',
  Testing: 'testing',
  Deployment: 'deploy',
};

const skillKind = (sourceId: string) =>
  sourceId === 'spekin' ? 'template' : sourceId === 'mine' ? 'user' : 'github';

/** The /api/skills body the server builds from the same fixture (IMP-34). */
function skillsBody() {
  return {
    skills: (fixture.SKL_SKILLS as SampleSkillRow[]).map((row) => ({
      manifest: {
        id: row[0],
        title: row[1],
        description: row[2],
        stages: row[3].map((name) => STAGE_IDS[name] ?? name),
        source: { kind: skillKind(row[4]) },
        licence: row[5],
        notice: null,
        version: 'v1.0',
        reads: [],
        proposes: [],
        tools: [],
        scripts: [],
        invocation: `/${row[0]}`,
        body: '',
      },
      policy: 'auto',
      kind: skillKind(row[4]),
      uses: row[8],
    })),
    sources: (fixture.SKL_SOURCES as SampleSkillSource[]).map((s) => ({
      ...s,
      notice: null,
      commit: null,
    })),
  };
}

const tokens = (text: string): number => {
  const value = text.trim().replace('k', '');
  return Number(value) * (text.includes('k') ? 1000 : 1);
};

/** The /api/models body the server serves (the S36 registry as capabilities). */
function modelsBody() {
  return (fixture.MODELS_REGISTRY as SampleModelRegistryRow[]).map((m) => {
    const [input, rest] = m.lim.split(' in · ');
    const output = (rest ?? '').replace(' out', '');
    return {
      id: m.id,
      name: m.name,
      provider: 'Anthropic',
      context_tokens: tokens(input ?? ''),
      max_output_tokens: tokens(output),
      image_input: m.caps.includes('Vision'),
      tools: true,
      price: { rate_card: m.rc, input_per_1k_micro_credits: 1, output_per_1k_micro_credits: 1, unit: 'micro-credits / 1k tokens' },
      availability: m.st === 'sel' ? 'selected' : m.st === 'ok' ? 'available' : 'unavailable',
    };
  });
}

/** The /api/projects/{id}/contracts body the server serves (one check per drawn contract count). */
function contractsBody() {
  return {
    contracts: (fixture.DELIVERY_CONTRACTS as SampleDeliveryContract[]).map((c) => ({
      id: c.link,
      title: c.name,
      changed_at: 1,
      checks: [{ name: `${c.name} check`, kind: 'unit', owner: 'core' }],
    })),
    evidence: [],
    matrix: [],
  };
}

const deletedBody = [
  {
    entry: {
      id: 'kenari-fleet',
      project: { ...fixture.PROJECT, name: 'Kenari Fleet' },
      revisions: ['r1'],
      changed_at: 1,
      deleted_at: 1,
    },
    days_left: 27,
  },
];

function mockFetchByPath(overrides: { contracts?: unknown; skills?: unknown; models?: unknown } = {}): void {
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
      if (url.endsWith('/api/projects/deleted')) return json(deletedBody);
      if (url.endsWith('/contracts')) return json(overrides.contracts ?? contractsBody());
      if (url.endsWith('/audit')) return json({ entries: [], head_hash: 'a'.repeat(64), error: null });
      if (url.endsWith('/history')) return json([]);
      if (url === '/api/models') return json(overrides.models ?? modelsBody());
      if (url === '/api/skills') return json(overrides.skills ?? skillsBody());
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

// IMP-37: models, skills (list and history), contracts, audit and deleted projects go through
// the same door. Each test says which fields the API really supplies and which stay the drawn copy.
describe('data source (IMP-37): the remaining reads', () => {
  it('models: the API supplies name, limits, rate card and availability; caps, est and note stay the drawn copy', async () => {
    mockFetchByPath();

    const [fromApi, fromSample] = await Promise.all([apiSource.models(), sampleSource.models()]);

    expect(fromApi.map((m) => m.id)).toEqual(fromSample.map((m) => m.id));
    expect(fromApi.map(({ name, lim, rc, st }) => ({ name, lim, rc, st }))).toEqual(
      fromSample.map(({ name, lim, rc, st }) => ({ name, lim, rc, st })),
    );
    // Not in ModelCapability: the board's "Code"/"Structured" caps, the credit estimate and
    // the note are carried from the sample row, so the whole row still equals the board's.
    expect(fromApi).toEqual(fromSample);
  });

  it('models: a renamed capability renames its row and keeps the drawn caps, est and note', async () => {
    const renamed = modelsBody().map((m, i) => (i === 0 ? { ...m, name: 'Sonnet 6' } : m));
    mockFetchByPath({ models: renamed });

    const rows = await apiSource.models();
    const drawn = await sampleSource.models();
    const row = rows.find((m) => m.id === drawn[0]?.id);
    expect(row?.name).toBe('Sonnet 6');
    expect(row?.caps).toEqual(drawn[0]?.caps);
    expect(row?.est).toEqual(drawn[0]?.est);
    expect(row?.note).toEqual(drawn[0]?.note);
  });

  it('skills: the API supplies title, description, stages, source, licence and uses; switch and update label stay the drawn copy', async () => {
    mockFetchByPath();

    const [fromApi, fromSample] = await Promise.all([apiSource.skills(), sampleSource.skills()]);

    // The board's order is kept even though LibrarySkill.list() is sorted by id.
    expect(fromApi.map((s) => s[0])).toEqual(fromSample.map((s) => s[0]));
    expect(fromApi.map((s) => [s[1], s[2], s[3], s[4], s[5], s[8]])).toEqual(
      fromSample.map((s) => [s[1], s[2], s[3], s[4], s[5], s[8]]),
    );
    // LibrarySkill has no enabled switch and no update label ("Update ready", "Ships with
    // Spekin"), so those two stay the drawn copy.
    expect(fromApi).toEqual(fromSample);
  });

  it('skills: a changed API description changes the row text; the switch and update label stay drawn', async () => {
    const body = skillsBody();
    const first = body.skills[0];
    expect(first).toBeDefined();
    const changed = {
      ...body,
      skills: body.skills.map((s, i) =>
        i === 0 ? { ...s, manifest: { ...s.manifest, description: 'Tells you what to do first.' } } : s,
      ),
    };
    mockFetchByPath({ skills: changed });

    const [rows, drawn] = await Promise.all([apiSource.skills(), sampleSource.skills()]);
    expect(rows[0]?.[2]).toBe('Tells you what to do first.');
    expect(rows[0]?.[6]).toBe(drawn[0]?.[6]);
    expect(rows[0]?.[7]).toBe(drawn[0]?.[7]);
  });

  it('skill history: the sample library has none and the server starts with none; S40 draws its update log as copy', async () => {
    mockFetchByPath();

    expect(await apiSource.skillHistory('grill')).toEqual([]);
    expect(await sampleSource.skillHistory('grill')).toEqual([]);
  });

  it('contracts: the API names the rows; stage, number, kind, icon, version, status, link and check copy stay drawn', async () => {
    mockFetchByPath();

    const [fromApi, fromSample] = await Promise.all([
      apiSource.contracts(SAMPLE_PROJECT_ID),
      sampleSource.contracts(SAMPLE_PROJECT_ID),
    ]);

    expect(fromApi.map((c) => c.name)).toEqual(fromSample.map((c) => c.name));
    // The server's ids differ from the board's link labels (R-DASH-014-entity against
    // R-DASH-014), and it carries no stage, number, kind, icon, version, status or check
    // count, so those columns stay the drawn copy.
    expect(fromApi).toEqual(fromSample);
  });

  it('contracts: a retitled API contract changes the row name and nothing else', async () => {
    const body = contractsBody();
    const first = body.contracts[0];
    expect(first).toBeDefined();
    mockFetchByPath({
      contracts: {
        ...body,
        contracts: body.contracts.map((c, i) => (i === 0 ? { ...c, title: 'Variance table, retitled' } : c)),
      },
    });

    const [rows, drawn] = await Promise.all([
      apiSource.contracts(SAMPLE_PROJECT_ID),
      sampleSource.contracts(SAMPLE_PROJECT_ID),
    ]);
    expect(rows[0]?.name).toBe('Variance table, retitled');
    expect(rows[0]?.stage).toBe(drawn[0]?.stage);
    expect(rows[0]?.link).toBe(drawn[0]?.link);
    expect(rows[0]?.checks).toBe(drawn[0]?.checks);
  });

  it('contracts: an unknown project has no contracts, not the sample rows', async () => {
    mockFetchByPath();

    expect(await apiSource.contracts('no-such-project')).toEqual([]);
    expect(await sampleSource.contracts('no-such-project')).toEqual([]);
  });

  it('audit: the server serves a verified empty chain; the sample has no hash-chained log', async () => {
    mockFetchByPath();

    const fromApi = await apiSource.audit(SAMPLE_PROJECT_ID);
    expect(fromApi?.entries).toEqual([]);
    expect(fromApi?.error).toBeNull();
    expect(fromApi?.head_hash).toHaveLength(64);
    expect(await sampleSource.audit(SAMPLE_PROJECT_ID)).toBeNull();
    expect(await apiSource.audit('no-such-project')).toBeNull();
  });

  it('recently deleted: both know kenari-fleet; the server counts 27 days left and the sample carries the 30-day window', async () => {
    mockFetchByPath();

    const [fromApi, fromSample] = await Promise.all([
      apiSource.recentlyDeleted(),
      sampleSource.recentlyDeleted(),
    ]);

    expect(fromApi.ids).toEqual(fromSample.ids);
    expect(fromApi.ids).toEqual(['kenari-fleet']);
    // The sample's `days` is the window length the S27 trigger promises; the API's days_left
    // is the whole-day countdown. They are different numbers by design.
    expect(fromSample.daysLeft['kenari-fleet']).toBe(30);
    expect(fromApi.daysLeft['kenari-fleet']).toBe(27);
  });
});
