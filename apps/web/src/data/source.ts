// The one door for screen data (IMP-21).
//
// A screen reads either:
//  - the project context (project, stages, usage) through a DataSource, chosen with VITE_SPK_DATA
//    (`sample` by default, `api` for the Rust server), or
//  - the sample-only datasets (`sample.FRAMES`, `sample.DELIVERY_ITEMS`, ...), which are identical
//    in both modes until a later card gives them an API (see docs/handoff/lanes/ui.md).
//
// Nothing else under apps/web/src imports '@spekin/sample'; a test enforces it.
import * as sampleModule from '@spekin/sample';
import {
  ApiError,
  fetchAudit,
  fetchContracts,
  fetchDeletedProjects,
  fetchModels,
  fetchProject,
  fetchSkillHistory,
  fetchSkills,
  fetchStages,
  fetchUsage,
  validateGenUi as validateGenUiRequest,
  type ApiOptions,
} from './api';
import type {
  AuditResponse,
  LibrarySkill,
  ModelCapability,
  SkillHistoryEntry,
} from '@spekin/contracts';
import type {
  SampleDeliveryContract,
  SampleGenUiVerdict,
  SampleModelRegistryRow,
  SampleProject,
  SampleSkillRow,
  SampleStage,
  SampleUsage,
  StageId,
} from '@spekin/sample';

export type * from '@spekin/sample';

export const SAMPLE_PROJECT_ID = 'meranti-yard';

/** Everything the boards draw that has no API yet. Identical in both modes. */
export type SampleSurface = typeof sampleModule;

/** The sample-only datasets themselves, read through the same door in both modes. */
export const sampleData: SampleSurface = sampleModule;

export type DataMode = 'sample' | 'api';

/** The project context the top bar, the stage bar and the work areas draw. Equal in both modes. */
export interface ProjectSnapshot {
  project: SampleProject;
  stages: SampleStage[];
  usage: SampleUsage;
}

/** What the Rust GenUI validator says about one card, in the app's own words. */
export type CardVerdict = SampleGenUiVerdict;

/** Recently deleted projects: what S27 needs to mark a card gone, and the days it shows. */
export interface RecentlyDeleted {
  /** Project ids sitting in the restore window right now. */
  ids: string[];
  /** Whole days left per id, as the server counts them; the sample carries the window length. */
  daysLeft: Record<string, number>;
}

export interface DataSource {
  readonly mode: DataMode;
  /** Sample-only datasets. Both implementations serve the same ones. */
  readonly sample: SampleSurface;
  /** The local context, when the source has it in the bundle; null when it must be fetched. */
  snapshot(id: string): ProjectSnapshot | null;
  project(id: string, options?: ApiOptions): Promise<SampleProject | null>;
  stages(id: string, options?: ApiOptions): Promise<SampleStage[]>;
  usage(id: string, options?: ApiOptions): Promise<SampleUsage | null>;
  /** The S36 model registry, in the board's row shape. */
  models(options?: ApiOptions): Promise<SampleModelRegistryRow[]>;
  /** The S40 skills list, in the board's row shape and order. */
  skills(options?: ApiOptions): Promise<SampleSkillRow[]>;
  /** One skill's version history (IMP-34); the sample library starts with none. */
  skillHistory(skillId: string, options?: ApiOptions): Promise<SkillHistoryEntry[]>;
  /** The S37 build contracts, in the board's row shape. */
  contracts(id: string, options?: ApiOptions): Promise<SampleDeliveryContract[]>;
  /** The hash-chained audit view; null when the source has no chain (the sample). */
  audit(id: string, options?: ApiOptions): Promise<AuditResponse | null>;
  /** Recently deleted projects for S27. */
  recentlyDeleted(options?: ApiOptions): Promise<RecentlyDeleted>;
  /** A recorded verdict for a sample card, or null when the source must ask the server. */
  knownCardVerdict(card: unknown): CardVerdict | null;
  /** The verdict for a card; a refusal or a network error is a rejection, never a partial card. */
  validateGenUi(card: unknown, options?: ApiOptions): Promise<CardVerdict>;
}

const STAGE_NAMES: Record<StageId, string> = {
  planning: 'Planning',
  spec: 'Specification',
  design: 'Design',
  frontend: 'Frontend',
  backend: 'Backend',
  integration: 'Integration',
  testing: 'Testing',
  deploy: 'Deployment',
};

/** 200000 → "200k", as the board writes it. */
function tokenLabel(n: number): string {
  return n >= 1000 && n % 1000 === 0 ? `${n / 1000}k` : String(n);
}

/**
 * One S36 registry row from one capability.
 *
 * The API supplies the name, the limits, the rate card and availability. It does not carry the
 * board's caps list ("Code", "Structured"), its credit estimate or its note, so those stay the
 * drawn sample row's values (see docs/handoff/lanes/ui.md, "Still sample-only").
 */
function modelRow(cap: ModelCapability, drawn: SampleModelRegistryRow | undefined): SampleModelRegistryRow {
  return {
    id: cap.id,
    name: cap.name,
    caps: drawn?.caps ?? (cap.image_input ? ['Text', 'Vision'] : ['Text']),
    lim: `${tokenLabel(cap.context_tokens)} in · ${tokenLabel(cap.max_output_tokens)} out`,
    rc: cap.price?.rate_card ?? drawn?.rc ?? '',
    est: drawn?.est ?? '',
    st: cap.availability === 'selected' ? 'sel' : cap.availability === 'available' ? 'ok' : 'off',
    note: drawn?.note ?? '',
  };
}

/**
 * One S40 row from one library skill.
 *
 * The API supplies the title, description, stages, source kind, licence and use count. The
 * switch state and the update label ("Auto-update", "Update ready", …) are the board's
 * vocabulary and are not in LibrarySkill, so they stay the drawn sample row's values.
 */
function skillRow(
  skill: LibrarySkill,
  drawn: SampleSkillRow | undefined,
  sources: typeof sampleModule.SKL_SOURCES,
): SampleSkillRow {
  const kind = skill.kind;
  const sourceKind = kind === 'template' ? 'template' : kind === 'user' ? 'mine' : 'github';
  const source = sources.find((s) => s.kind === sourceKind) ?? sources[0];
  return [
    skill.manifest.id,
    skill.manifest.title,
    skill.manifest.description,
    skill.manifest.stages.map((s) => STAGE_NAMES[s] ?? s),
    source?.id ?? drawn?.[4] ?? '',
    skill.manifest.licence,
    drawn?.[6] ?? 'Auto-update',
    drawn?.[7] ?? true,
    skill.uses,
  ];
}

function cardId(card: unknown): string | null {
  if (typeof card !== 'object' || card === null) return null;
  const id = (card as { id?: unknown }).id;
  return typeof id === 'string' ? id : null;
}

/** The S38 cards the sample records, each with the verdict `genui::validate` reached (IMP-36).
 *  `fixtures/genui-cards.json` is the same list; a Rust test keeps the verdicts equal. */
function recordedVerdict(card: unknown): CardVerdict | null {
  const id = cardId(card);
  if (!id) return null;
  const found = sampleModule.GENUI_CARDS.find((c) => c.id === id);
  return found ? found.verdict : null;
}

function reasonText(reason: unknown): string {
  if (typeof reason !== 'object' || reason === null) return 'rejected';
  const r = reason as Record<string, unknown>;
  const code = typeof r.code === 'string' ? r.code : 'rejected';
  const detail =
    typeof r.message === 'string'
      ? r.message
      : typeof r.field === 'string'
        ? r.field
        : typeof r.family === 'string'
          ? r.family
          : '';
  return detail ? `${code}: ${detail}` : code;
}

function sampleSnapshot(id: string): ProjectSnapshot | null {
  if (id !== SAMPLE_PROJECT_ID) return null;
  return { project: sampleModule.PROJECT, stages: sampleModule.STAGES, usage: sampleModule.USAGE };
}

/** Today's data: the same module the boards draw. The default. */
export const sampleSource: DataSource = {
  mode: 'sample',
  sample: sampleModule,
  snapshot: sampleSnapshot,
  project: async (id) => sampleSnapshot(id)?.project ?? null,
  stages: async (id) => sampleSnapshot(id)?.stages ?? [],
  usage: async (id) => sampleSnapshot(id)?.usage ?? null,
  models: async () => sampleModule.MODELS_REGISTRY,
  skills: async () => sampleModule.SKL_SKILLS,
  // The sample library has no version history: S40's update log (SKL_UPDATES) is drawn copy.
  skillHistory: async () => [],
  contracts: async (id) => (id === SAMPLE_PROJECT_ID ? sampleModule.DELIVERY_CONTRACTS : []),
  // The sample has no hash-chained log; S33 draws its proposal's recorded audit entry.
  audit: async () => null,
  recentlyDeleted: async () => ({
    ids: [sampleModule.INTAKE_DELETED.id],
    daysLeft: { [sampleModule.INTAKE_DELETED.id]: sampleModule.INTAKE_DELETED.days },
  }),
  knownCardVerdict: recordedVerdict,
  validateGenUi: async (card) =>
    recordedVerdict(card) ?? { status: 'rejected', reason: 'not recorded in the sample verdicts' },
};

/** The Rust server (crates/spekin-server). Same reads, same shapes the boards draw. */
export const apiSource: DataSource = {
  mode: 'api',
  sample: sampleModule,
  snapshot: () => null,
  project: (id, options) => fetchProject(id, options),
  stages: (id, options) => fetchStages(id, options).then((stages) => stages ?? []),
  usage: async (id, options) => {
    const snapshot = await fetchUsage(id, options);
    // The server carries numbers; the meter's source label is the drawn one ("Hosted").
    return snapshot ? { source: sampleModule.USAGE.source, used: snapshot.used, cap: snapshot.cap } : null;
  },
  models: async (options) => {
    const capabilities = await fetchModels(options);
    const drawn = new Map(sampleModule.MODELS_REGISTRY.map((row) => [row.id, row]));
    return capabilities.map((cap) => modelRow(cap, drawn.get(cap.id)));
  },
  skills: async (options) => {
    const library = await fetchSkills(options);
    const drawn = new Map(sampleModule.SKL_SKILLS.map((row) => [row[0], row]));
    const mapped = new Map(
      library.skills.map((skill) => {
        const row = skillRow(skill, drawn.get(skill.manifest.id), sampleModule.SKL_SOURCES);
        return [row[0], row] as const;
      }),
    );
    // Keep the order the board draws and append anything the library gained.
    const ordered = sampleModule.SKL_SKILLS.flatMap((row) => {
      const match = mapped.get(row[0]);
      if (!match) return [];
      mapped.delete(row[0]);
      return [match];
    });
    return [...ordered, ...mapped.values()];
  },
  skillHistory: async (skillId, options) => (await fetchSkillHistory(skillId, options)) ?? [],
  contracts: async (id, options) => {
    const body = await fetchContracts(id, options);
    if (!body) return [];
    const drawn = new Map(sampleModule.DELIVERY_CONTRACTS.map((row) => [row.name, row]));
    // The server serves the contracts in the board's order, so the row's position maps them.
    return body.contracts.map((contract, i) => {
      const row = drawn.get(contract.title) ?? sampleModule.DELIVERY_CONTRACTS[i];
      // The API names the contract; the rest of the row is the board's copy (stage, number,
      // kind, icon, version, status, link label and check count) until the server carries it.
      if (row) return { ...row, name: contract.title };
      return {
        stage: '',
        n: '',
        kind: 'Contract',
        ic: 'req',
        name: contract.title,
        ver: '',
        st: ['mute', 'Draft'],
        link: contract.id,
        checks: `${contract.checks.length} checks`,
      };
    });
  },
  audit: (id, options) => fetchAudit(id, options),
  recentlyDeleted: async (options) => {
    const rows = await fetchDeletedProjects(options);
    return {
      ids: rows.map((row) => row.entry.id),
      daysLeft: Object.fromEntries(rows.map((row) => [row.entry.id, Number(row.days_left)])),
    };
  },
  knownCardVerdict: () => null,
  validateGenUi: async (card, options) => {
    try {
      const result = await validateGenUiRequest(card, options);
      return result.status === 'ok'
        ? { status: 'valid' }
        : { status: 'rejected', reason: reasonText(result.reason) };
    } catch (error) {
      // A refusal and a network error both fail closed: the screen shows the fallback, never part of the card.
      const kind = error instanceof ApiError ? error.kind : 'network';
      const message = error instanceof Error ? error.message : String(error);
      return { status: 'rejected', reason: `${kind} error: ${message}` };
    }
  },
};

/** `VITE_SPK_DATA=api` reads the Rust server; anything else keeps the boards' sample. */
export function dataMode(): DataMode {
  return import.meta.env?.VITE_SPK_DATA === 'api' ? 'api' : 'sample';
}

export const defaultSource: DataSource = dataMode() === 'api' ? apiSource : sampleSource;

export function getDataSource(): DataSource {
  return defaultSource;
}

// Synchronous sample reads kept for callers that already held them (tests, the workspace store).
export function getProject(id: string): SampleProject | null {
  return id === SAMPLE_PROJECT_ID ? sampleModule.PROJECT : null;
}

export function getStages(id: string): SampleStage[] {
  return id === SAMPLE_PROJECT_ID ? sampleModule.STAGES : [];
}

export function getUsage(id: string): SampleUsage | null {
  return id === SAMPLE_PROJECT_ID ? sampleModule.USAGE : null;
}

export function isStageId(stages: SampleStage[], s: string | undefined): s is StageId {
  return !!s && stages.some((x) => x.id === s);
}

