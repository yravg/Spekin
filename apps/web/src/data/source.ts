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
  acceptProposal as acceptProposalRequest,
  copySkill as copySkillRequest,
  deleteProject as deleteProjectRequest,
  editSkill as editSkillRequest,
  estimateRun as estimateRunRequest,
  fetchAudit,
  fetchContracts,
  fetchDeletedProjects,
  fetchModels,
  fetchProject,
  fetchSkillHistory,
  fetchSkills,
  fetchSkillsAudit,
  revertRevision as revertRevisionRequest,
  fetchStages,
  fetchUsage,
  rejectProposal as rejectProposalRequest,
  reserveRun as reserveRunRequest,
  restoreProject as restoreProjectRequest,
  rollbackSkill as rollbackSkillRequest,
  settleRun as settleRunRequest,
  validateGenUi as validateGenUiRequest,
  type ApiOptions,
} from './api';
import { markWriteFailed, markWriteSucceeded } from './session';
import type {
  AuditResponse,
  CopySkillRequest,
  EditSkillRequest,
  EstimateRunRequest,
  LibrarySkill,
  ModelCapability,
  ProjectEntry,
  Rejection,
  Reservation,
  ReserveRunRequest,
  Revision,
  RunEstimate,
  Settlement,
  SettleRunRequest,
  SkillHistoryEntry,
  SkillManifest,
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

/**
 * What a write answered (IMP-41).
 *
 * A screen draws the next board state only on `ok`. A `stale` answer is the server's 409: the item
 * changed elsewhere, so the screen shows the conflict (S35) and never a saved state. An `offline`
 * answer raises the shell's offline banner and the screen keeps the user's input. No write is ever
 * shown as saved before the source says so.
 */
export type WriteFailureKind = 'stale' | 'offline' | 'error';
export interface WriteFailure {
  ok: false;
  kind: WriteFailureKind;
  message: string;
}
export type WriteOutcome<T> = { ok: true; value: T } | WriteFailure;

/** The retry stored for an offline write: re-run it, and clear the banner once it answers. */
function offlineWrite<T>(key: string, run: () => Promise<T>, message: string): WriteFailure {
  markWriteFailed(key, async () => {
    await run();
    markWriteSucceeded(key);
  });
  return { ok: false, kind: 'offline', message };
}

/** Run one API write and turn every failure into a typed outcome, never a raw throw. */
async function apiWrite<T>(key: string, run: () => Promise<T>): Promise<WriteOutcome<T>> {
  try {
    const value = await run();
    markWriteSucceeded(key);
    return { ok: true, value };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        markWriteSucceeded(key);
        return { ok: false, kind: 'stale', message: error.message };
      }
      if (error.kind === 'network') return offlineWrite(key, run, error.message);
      return { ok: false, kind: 'error', message: error.message };
    }
    const message = error instanceof Error ? error.message : String(error);
    return offlineWrite(key, run, message);
  }
}

function failure<T>(kind: WriteFailureKind, message: string): WriteOutcome<T> {
  return { ok: false, kind, message };
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
  /** The skills library's own audit view (IMP-45); null when the source has no chain (the sample). */
  skillsAudit(options?: ApiOptions): Promise<AuditResponse | null>;
  /** Recently deleted projects for S27. */
  recentlyDeleted(options?: ApiOptions): Promise<RecentlyDeleted>;
  /** A recorded verdict for a sample card, or null when the source must ask the server. */
  knownCardVerdict(card: unknown): CardVerdict | null;
  /** The verdict for a card; a refusal or a network error is a rejection, never a partial card. */
  validateGenUi(card: unknown, options?: ApiOptions): Promise<CardVerdict>;

  // ---- Writes (IMP-41). Each answers with the shape the board draws for the next state. ----
  /** S33: accept one pending proposal, creating exactly one revision. */
  acceptProposal(projectId: string, proposalId: string, options?: ApiOptions): Promise<WriteOutcome<Revision>>;
  /** S33: reject one proposal with the reviewer's reason; no revision is made. */
  rejectProposal(
    projectId: string,
    proposalId: string,
    reason: string,
    options?: ApiOptions,
  ): Promise<WriteOutcome<Rejection>>;
  /** S33: revert an artifact to earlier content, writing a new revision. */
  revertRevision(
    projectId: string,
    artifact: string,
    to: Revision,
    options?: ApiOptions,
  ): Promise<WriteOutcome<Revision>>;
  /** Composer Send / S36: validate the estimate before anything is held. */
  estimateRun(projectId: string, req: EstimateRunRequest, options?: ApiOptions): Promise<WriteOutcome<RunEstimate>>;
  /** Composer Send / S36: hold the maximum atomically; a cap refusal reserves nothing. */
  reserveRun(projectId: string, req: ReserveRunRequest, options?: ApiOptions): Promise<WriteOutcome<Reservation>>;
  /** Composer Send / S36: settle a reserved run at its actual cost. */
  settleRun(projectId: string, req: SettleRunRequest, options?: ApiOptions): Promise<WriteOutcome<Settlement>>;
  /** S40: copy a template into the user's own skill; the template never changes. */
  copySkill(id: string, req: CopySkillRequest, options?: ApiOptions): Promise<WriteOutcome<LibrarySkill>>;
  /** S40: edit a user copy, storing a new version; a template answers 409 (stale). */
  editSkill(id: string, req: EditSkillRequest, options?: ApiOptions): Promise<WriteOutcome<LibrarySkill>>;
  /** S40: roll a skill back to an earlier version; the rollback is a new version. */
  rollbackSkill(id: string, version: string, options?: ApiOptions): Promise<WriteOutcome<LibrarySkill>>;
  /** S27: mark a project deleted through the 30-day window. */
  deleteProject(projectId: string, options?: ApiOptions): Promise<WriteOutcome<ProjectEntry>>;
  /** S27: restore a project inside the window. */
  restoreProject(projectId: string, options?: ApiOptions): Promise<WriteOutcome<ProjectEntry>>;
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

// ---- The sample write store (IMP-41) -------------------------------------------------------
//
// Writes in sample mode change this in-memory copy, never the `@spekin/sample` module and never
// the fixtures. A reset (tests, the dev simulation) starts from the boards' drawn data again.

const RESTORE_WINDOW_DAYS = sampleModule.INTAKE_DELETED.days;
const SECONDS_PER_DAY = 86_400;

interface SampleSkillRecord {
  skill: LibrarySkill;
  history: SkillHistoryEntry[];
}

interface SampleRunRecord {
  run_id: string;
  person_id: string;
  idempotency_key: string;
  reserved: number;
  charged: number;
  refunded: number;
  status: 'active' | 'settled' | 'cancelled';
}

interface SampleWrites {
  spec: { current: Revision; history: Revision[] };
  proposals: Map<string, { base: number; title: string; status: 'open' | 'accepted' | 'rejected' }>;
  skills: Map<string, SampleSkillRecord>;
  deleted: Map<string, number>;
  usage: { used: number; reserved: number; pending: number; cap: number };
  runs: Map<string, SampleRunRecord>;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function createSampleWrites(): SampleWrites {
  const proposal = sampleModule.REVIEW_PROPOSAL;
  const base = Number(proposal.from.replace('r', '')) || 14;
  const removedAt = nowSeconds(); // the sample promises the window length (30); the API counts real days
  return {
    spec: {
      current: { n: base, content: proposal.from + ' sample spec' },
      history: [{ n: base, content: proposal.from + ' sample spec' }],
    },
    proposals: new Map([[proposal.id, { base, title: proposal.title, status: 'open' }]]),
    skills: new Map(),
    deleted: new Map([[sampleModule.INTAKE_DELETED.id, removedAt]]),
    usage: {
      used: sampleModule.USAGE.used,
      reserved: sampleModule.MODELS_USAGE.calm.reserved,
      pending: sampleModule.MODELS_USAGE.calm.pending,
      cap: sampleModule.USAGE.cap,
    },
    runs: new Map(),
  };
}

let sampleWrites: SampleWrites = createSampleWrites();

/** Tests and the dev simulation start from the drawn sample again. */
export function resetSampleWrites(): void {
  sampleWrites = createSampleWrites();
}

function sampleProjectEntry(id: string, deletedAt: number | null): ProjectEntry | null {
  const row = sampleModule.INTAKE_PROJECTS.find((p) => p.id === id);
  if (!row) return null;
  return {
    id,
    project: {
      name: row.name,
      product: row.idea,
      increment: row.inc,
      spec: 'r14',
      user: row.owner,
      initials: row.ini,
    },
    revisions: ['r1', 'r2', 'r3'],
    changed_at: BigInt(nowSeconds()),
    deleted_at: deletedAt === null ? null : BigInt(deletedAt),
  };
}

function skillManifestRow(skill: LibrarySkill): SampleSkillRow {
  return skillRow(skill, undefined, sampleModule.SKL_SOURCES);
}

function nextHistorySeq(history: SkillHistoryEntry[]): bigint {
  return BigInt(history.reduce((max, entry) => Math.max(max, Number(entry.seq)), 0) + 1);
}

function sampleEstimate(req: EstimateRunRequest): WriteOutcome<RunEstimate> {
  if (!Number.isFinite(req.min) || !Number.isFinite(req.max) || !Number.isFinite(req.reserve)) {
    return failure('error', 'estimate needs numbers');
  }
  if (req.min < 0 || req.max < req.min || req.reserve < req.max) {
    return failure('error', 'estimate must satisfy 0 ≤ min ≤ max ≤ reserve');
  }
  return { ok: true, value: { min: req.min, max: req.max, reserve: req.reserve } };
}

function committedCredits(): number {
  return sampleWrites.usage.used + sampleWrites.usage.reserved + sampleWrites.usage.pending;
}

function settlementFor(run: SampleRunRecord): Settlement {
  return {
    run_id: run.run_id,
    idempotency_key: run.idempotency_key,
    reserved: run.reserved,
    charged: run.charged,
    refunded: run.refunded,
    cancelled: run.status === 'cancelled',
  };
}

/** The sample source's writes: the same rules the Rust core applies, on the in-memory copy. */
const sampleWritesSource: Pick<
  DataSource,
  | 'acceptProposal'
  | 'rejectProposal'
  | 'revertRevision'
  | 'estimateRun'
  | 'reserveRun'
  | 'settleRun'
  | 'copySkill'
  | 'editSkill'
  | 'rollbackSkill'
  | 'deleteProject'
  | 'restoreProject'
> = {
  acceptProposal: async (_id, proposalId) => {
    const proposal = sampleWrites.proposals.get(proposalId);
    if (!proposal) return failure('error', 'unknown proposal ' + proposalId);
    if (proposal.status !== 'open' || proposal.base !== sampleWrites.spec.current.n) {
      return failure('stale', 'proposal ' + proposalId + ' is not against the current revision');
    }
    const next: Revision = { n: sampleWrites.spec.current.n + 1, content: proposal.title };
    sampleWrites.spec.current = next;
    sampleWrites.spec.history.push(next);
    proposal.status = 'accepted';
    return { ok: true, value: next };
  },
  rejectProposal: async (_id, proposalId, reason) => {
    if (!reason.trim()) return failure('error', 'rejection reason must not be empty');
    const proposal = sampleWrites.proposals.get(proposalId);
    if (!proposal) return failure('error', 'unknown proposal ' + proposalId);
    if (proposal.status === 'accepted') return failure('stale', 'proposal ' + proposalId + ' was accepted');
    proposal.status = 'rejected';
    return { ok: true, value: { id: proposalId, base: proposal.base, reason: reason.trim() } };
  },
  revertRevision: async (_id, artifact, to) => {
    if (artifact !== 'spec') return failure('error', 'unknown artifact ' + artifact);
    if (to.n >= sampleWrites.spec.current.n) {
      return failure('stale', 'revert needs an earlier revision');
    }
    const next: Revision = { n: sampleWrites.spec.current.n + 1, content: to.content };
    sampleWrites.spec.current = next;
    sampleWrites.spec.history.push(next);
    return { ok: true, value: next };
  },
  estimateRun: async (_id, req) => sampleEstimate(req),
  reserveRun: async (_id, req) => {
    const estimated = sampleEstimate(req.estimate);
    if (!estimated.ok) return estimated;
    const existing = sampleWrites.runs.get(req.run_id);
    if (existing && existing.idempotency_key === req.idempotency_key) return { ok: true, value: { ...existing } };
    if (committedCredits() + estimated.value.reserve > sampleWrites.usage.cap) {
      return failure('error', 'the reserve does not fit the monthly cap');
    }
    const run: SampleRunRecord = {
      run_id: req.run_id,
      person_id: req.person_id,
      idempotency_key: req.idempotency_key,
      reserved: estimated.value.reserve,
      charged: 0,
      refunded: 0,
      status: 'active',
    };
    sampleWrites.runs.set(req.run_id, run);
    sampleWrites.usage.reserved += run.reserved;
    return { ok: true, value: { ...run } };
  },
  settleRun: async (_id, req) => {
    const run = sampleWrites.runs.get(req.run_id);
    if (!run) return failure('error', 'no reservation for run ' + req.run_id);
    if (run.status !== 'active') return { ok: true, value: settlementFor(run) };
    const actual = Math.max(0, Math.min(req.actual, run.reserved));
    run.charged = actual;
    run.refunded = run.reserved - actual;
    run.status = 'settled';
    sampleWrites.usage.used += run.charged;
    sampleWrites.usage.reserved -= run.reserved;
    return { ok: true, value: settlementFor(run) };
  },
  copySkill: async (id, req) => {
    if (sampleWrites.skills.has(req.new_id)) return failure('stale', 'a skill with id ' + req.new_id + ' exists');
    const detail = sampleModule.SKL_DETAIL;
    const manifest: SkillManifest = {
      id: req.new_id,
      title: req.new_title,
      description: detail.adapted,
      stages: ['planning', 'spec'],
      source: { kind: 'user', copied_from: id },
      licence: 'Yours',
      notice: null,
      version: '1',
      reads: [...detail.reads],
      proposes: [...detail.proposes],
      tools: [],
      scripts: [],
      invocation: '/' + req.new_id,
      body: detail.steps.join('\n'),
    };
    const skill: LibrarySkill = { manifest, policy: 'auto', kind: 'user', uses: 0 };
    sampleWrites.skills.set(req.new_id, {
      skill,
      history: [
        {
          seq: 1n,
          skill_id: req.new_id,
          action: 'copied',
          version: '1',
          reason: 'copied from ' + id,
          at: BigInt(nowSeconds()),
          reasons: [],
        },
      ],
    });
    return { ok: true, value: skill };
  },
  editSkill: async (id, req) => {
    const record = sampleWrites.skills.get(id);
    if (!record) return failure('stale', 'only a user copy can be edited; ' + id + ' is a template or GitHub skill');
    const version = String(Number(record.skill.manifest.version) + 1);
    record.skill = {
      ...record.skill,
      manifest: {
        ...record.skill.manifest,
        ...(req.title !== undefined ? { title: req.title } : {}),
        ...(req.description !== undefined ? { description: req.description } : {}),
        ...(req.stages !== undefined ? { stages: [...req.stages] } : {}),
        ...(req.body !== undefined ? { body: req.body } : {}),
        version,
      },
    };
    record.history.push({
      seq: nextHistorySeq(record.history),
      skill_id: id,
      action: 'edited',
      version,
      reason: 'saved as version ' + version,
      at: BigInt(nowSeconds()),
      reasons: [],
    });
    return { ok: true, value: record.skill };
  },
  rollbackSkill: async (id, version) => {
    const record = sampleWrites.skills.get(id);
    if (!record) return failure('stale', 'no user copy ' + id + ' to roll back');
    if (!record.history.some((entry) => entry.version === version)) {
      return failure('stale', 'version ' + version + ' is not in this skill history');
    }
    const nextVersion = String(Number(record.skill.manifest.version) + 1);
    record.skill = { ...record.skill, manifest: { ...record.skill.manifest, version: nextVersion } };
    record.history.push({
      seq: nextHistorySeq(record.history),
      skill_id: id,
      action: 'rolled_back',
      version: nextVersion,
      reason: 'rolled back to version ' + version,
      at: BigInt(nowSeconds()),
      reasons: [],
    });
    return { ok: true, value: record.skill };
  },
  deleteProject: async (projectId) => {
    const existing = sampleWrites.deleted.get(projectId);
    if (existing !== undefined) {
      const entry = sampleProjectEntry(projectId, existing);
      return entry ? { ok: true, value: entry } : failure('error', 'unknown project ' + projectId);
    }
    const entry = sampleProjectEntry(projectId, nowSeconds());
    if (!entry) return failure('error', 'unknown project ' + projectId);
    sampleWrites.deleted.set(projectId, nowSeconds());
    return { ok: true, value: entry };
  },
  restoreProject: async (projectId) => {
    const deletedAt = sampleWrites.deleted.get(projectId);
    if (deletedAt === undefined) return failure('stale', 'project ' + projectId + ' is not deleted');
    const days = Math.floor((nowSeconds() - deletedAt) / SECONDS_PER_DAY);
    if (days > RESTORE_WINDOW_DAYS) {
      return failure('error', 'the ' + RESTORE_WINDOW_DAYS + '-day restore window has closed');
    }
    const entry = sampleProjectEntry(projectId, null);
    if (!entry) return failure('error', 'unknown project ' + projectId);
    sampleWrites.deleted.delete(projectId);
    return { ok: true, value: entry };
  },
};

/** Today's data: the same module the boards draw. The default. */
export const sampleSource: DataSource = {
  mode: 'sample',
  sample: sampleModule,
  snapshot: sampleSnapshot,
  project: async (id) => sampleSnapshot(id)?.project ?? null,
  stages: async (id) => sampleSnapshot(id)?.stages ?? [],
  usage: async (id) =>
    id === SAMPLE_PROJECT_ID
      ? { ...sampleModule.USAGE, used: sampleWrites.usage.used }
      : null,
  models: async () => sampleModule.MODELS_REGISTRY,
  skills: async () => [
    ...sampleModule.SKL_SKILLS,
    ...[...sampleWrites.skills.values()].map((record) => skillManifestRow(record.skill)),
  ],
  // The sample library has no version history of its own: only a copy made in this session has one.
  skillHistory: async (skillId) => sampleWrites.skills.get(skillId)?.history ?? [],
  contracts: async (id) => (id === SAMPLE_PROJECT_ID ? sampleModule.DELIVERY_CONTRACTS : []),
  // The sample has no hash-chained log; S33 draws its proposal's recorded audit entry.
  audit: async () => null,
  // The sample draws no skills audit; the library's own chain lives on the API only.
  skillsAudit: async () => null,
  recentlyDeleted: async () => ({
    ids: [...sampleWrites.deleted.keys()],
    daysLeft: Object.fromEntries(
      [...sampleWrites.deleted.entries()].map(([id, at]) => [
        id,
        Math.max(0, RESTORE_WINDOW_DAYS - Math.floor((nowSeconds() - at) / SECONDS_PER_DAY)),
      ]),
    ),
  }),
  knownCardVerdict: recordedVerdict,
  validateGenUi: async (card) =>
    recordedVerdict(card) ?? { status: 'rejected', reason: 'not recorded in the sample verdicts' },
  ...sampleWritesSource,
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
  skillsAudit: (options) => fetchSkillsAudit(options),
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
  acceptProposal: (projectId, proposalId, options) =>
    apiWrite('accept:' + proposalId, () => acceptProposalRequest(projectId, proposalId, options)),
  rejectProposal: (projectId, proposalId, reason, options) =>
    apiWrite('reject:' + proposalId, () => rejectProposalRequest(projectId, proposalId, reason, options)),
  revertRevision: (projectId, artifact, to, options) =>
    apiWrite('revert:' + artifact, () => revertRevisionRequest(projectId, artifact, to, options)),
  estimateRun: (projectId, req, options) =>
    apiWrite('estimate:' + req.reserve, () => estimateRunRequest(projectId, req, options)),
  reserveRun: (projectId, req, options) =>
    apiWrite('reserve:' + req.run_id, () => reserveRunRequest(projectId, req, options)),
  settleRun: (projectId, req, options) =>
    apiWrite('settle:' + req.run_id, () => settleRunRequest(projectId, req, options)),
  copySkill: (id, req, options) =>
    apiWrite('skill-copy:' + req.new_id, () => copySkillRequest(id, req, options)),
  editSkill: (id, req, options) => apiWrite('skill-edit:' + id, () => editSkillRequest(id, req, options)),
  rollbackSkill: (id, version, options) =>
    apiWrite('skill-rollback:' + id + ':' + version, () => rollbackSkillRequest(id, version, options)),
  deleteProject: (projectId, options) =>
    apiWrite('delete:' + projectId, () => deleteProjectRequest(projectId, options)),
  restoreProject: (projectId, options) =>
    apiWrite('restore:' + projectId, () => restoreProjectRequest(projectId, options)),
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

export interface GapCLane {
  id: string;
  n: number;
  name: string;
  sub: string;
}

export interface GapCTicket {
  id: string;
  lane: string;
  title: string;
  ui: boolean;
  comp: string | null;
  stages: string[];
  blockers: string[];
  owns: string;
  st: 'ready' | 'blocked' | 'locked' | 'proposed';
  crit: number;
}

export type GapCComponentOption = [slug: string, desc: string, src: string];

export interface GapCTicketDetail {
  id: string;
  title: string;
  lane: string;
  rev: string;
  summary: string;
  comp: { slug: string; name: string; install: string; ver: string } | null;
  blockers: [string, string, PillTone, string][];
  owns: string;
  criteria: [string, string, string, [PillTone, string]][];
  rules: string[];
  designRev: string;
  newRev: string;
  stagesL?: string[];
}

export interface GapCSample {
  ctx: ContextItem[];
  ctxS16: ContextItem[];
  lanes: GapCLane[];
  tickets: GapCTicket[];
  components: GapCComponentOption[];
  lockedIds: string[];
  t05: GapCTicketDetail;
}

export function gapCSample(): GapCSample {
  const m = sampleModule as unknown as Record<string, unknown>;
  return {
    ctx: m.GAPC_CTX as ContextItem[],
    ctxS16: m.GAPC_CTX_S16 as ContextItem[],
    lanes: m.GAPC_LANES as GapCLane[],
    tickets: m.GAPC_TICKETS as GapCTicket[],
    components: m.GAPC_COMPONENTS as GapCComponentOption[],
    lockedIds: m.GAPC_LOCKED_TICKETS as string[],
    t05: m.GAPC_T05 as GapCTicketDetail,
  };
}


