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
  fetchProject,
  fetchStages,
  fetchUsage,
  validateGenUi as validateGenUiRequest,
  type ApiOptions,
} from './api';
import type {
  SampleGenUiCard,
  SampleGenUiVerdict,
  SampleProject,
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

export interface DataSource {
  readonly mode: DataMode;
  /** Sample-only datasets. Both implementations serve the same ones. */
  readonly sample: SampleSurface;
  /** The local context, when the source has it in the bundle; null when it must be fetched. */
  snapshot(id: string): ProjectSnapshot | null;
  project(id: string, options?: ApiOptions): Promise<SampleProject | null>;
  stages(id: string, options?: ApiOptions): Promise<SampleStage[]>;
  usage(id: string, options?: ApiOptions): Promise<SampleUsage | null>;
  /** A recorded verdict for a sample card, or null when the source must ask the server. */
  knownCardVerdict(card: unknown): CardVerdict | null;
  /** The verdict for a card; a refusal or a network error is a rejection, never a partial card. */
  validateGenUi(card: unknown, options?: ApiOptions): Promise<CardVerdict>;
}

// Recorded from the Rust validator (crates/spekin-core/src/genui.rs). IMP-36 will keep them equal to
// genui::validate; the lead moves this list into sample/parts and exports GENUI_CARDS (see lanes/ui.md).
export const SAMPLE_GENUI_CARDS: readonly SampleGenUiCard[] = [
  {
    id: 'AC-DASH-019',
    title: 'AC-DASH-019 · Alert after 2 periods over 3%',
    family: 'checklist',
    payload: {
      schema_version: 1,
      id: 'AC-DASH-019',
      title: 'AC-DASH-019 · Alert after 2 periods over 3%',
      provenance: 'imported_observation',
      body: null,
      links: ['R-DASH-014'],
      actions: [
        { kind: 'expand_details', label: 'Details', target_id: 'AC-DASH-019', href: null },
        { kind: 'pin', label: 'Pin', target_id: 'AC-DASH-019', href: null },
      ],
      family: 'checklist',
      items: [
        { id: 'c1', label: 'Alert raised after 2 periods over 3%', checked: false, status: 'untested' },
        { id: 'c2', label: 'Threshold read from accepted spec r14', checked: true, status: 'passed_fixture' },
        { id: 'c3', label: 'No alert for P-04 at −3.4%', checked: false, status: 'no_evidence' },
      ],
      summary: '1 of 3 passed. Nothing else is shown as passed.',
    },
    verdict: { status: 'valid' },
  },
  {
    id: 'P-04-variance',
    title: 'P-04 variance comparison',
    family: 'comparison',
    payload: {
      schema_version: 1,
      id: 'P-04-variance',
      title: 'P-04 variance comparison',
      provenance: 'model_proposal',
      body: null,
      links: ['R-DASH-014'],
      actions: [{ kind: 'pin', label: 'Pin', target_id: 'P-04-variance', href: null }],
      family: 'comparison',
      options: [
        { id: 'P-01', label: 'P-01 Mooring', badge: 'ok', summary: 'On track', recommended: false },
        { id: 'P-04', label: 'P-04 Marine spread', badge: 'bad', summary: null, recommended: false },
      ],
      baseline_id: 'P-01',
    },
    verdict: { status: 'rejected', reason: 'missing_required_field: forecast (P-04)' },
  },
];

function cardId(card: unknown): string | null {
  if (typeof card !== 'object' || card === null) return null;
  const id = (card as { id?: unknown }).id;
  return typeof id === 'string' ? id : null;
}

function recordedVerdict(card: unknown): CardVerdict | null {
  const id = cardId(card);
  if (!id) return null;
  const cards = sampleModule.GENUI_CARDS ?? SAMPLE_GENUI_CARDS;
  const found = cards.find((c) => c.id === id);
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
