// The API source: one typed client for the Rust server (crates/spekin-server).
// Types come from @spekin/contracts, which is generated from the Rust types (R-ARC-3).
// This module only fetches and checks shapes. It decides no rules, and the screens still
// read apps/web/src/data/source.ts until the lead switches them (IMP-03 note).
import type {
  AddGithubSkillRequest,
  AuditEntry,
  AuditError,
  AuditResponse,
  BuildContextRequest,
  BuildManifestRequest,
  Check,
  CheckSkillUpdateRequest,
  Contract,
  ContractsResponse,
  CopySkillRequest,
  DeletedProjectView,
  EditSkillRequest,
  EstimateRunRequest,
  Evidence,
  GenUiValidation,
  HeldUpdate,
  LibrarySkill,
  Manifest,
  MatrixRow,
  ModelCapability,
  Project,
  ProjectEntry,
  Rejection,
  RequestContext,
  Reservation,
  ReserveRunRequest,
  Revision,
  RunEstimate,
  Settlement,
  SettleRunRequest,
  SkillCheckRequest,
  SkillHistoryEntry,
  SkillManifest,
  SkillUpdateOutcome,
  SkillsResponse,
  Stage,
  UpdateCheck,
  UsageSnapshot,
} from '@spekin/contracts';
// ts-rs exports the contract types, not the enum values; the value lists come from Rust (IMP-44).
import { STAGE_IDS, STAGE_TONES } from '@spekin/contracts';

/** What went wrong, so callers can branch without matching on messages. */
export type ApiErrorKind =
  /** The server could not be reached at all (offline, refused, DNS). */
  | 'network'
  /** The server answered, but not with 2xx or 404. */
  | 'http'
  /** The body was not JSON. */
  | 'json'
  /** The body was JSON, but not the contract shape. */
  | 'shape';

/** A typed failure from the API client. Bad input never escapes as a raw SyntaxError or TypeError. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly code: string | undefined;
  readonly url: string;

  constructor(
    kind: ApiErrorKind,
    message: string,
    details: { url: string; status?: number; code?: string; cause?: unknown },
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.url = details.url;
    this.status = details.status;
    this.code = details.code;
    if (details.cause !== undefined) this.cause = details.cause;
  }
}

export interface ApiOptions {
  /** Server origin, for example "http://127.0.0.1:8787". Defaults to VITE_API_BASE, then same origin. */
  baseUrl?: string;
  /** Lets a screen cancel a request when the stage switches away. */
  signal?: AbortSignal;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';
const oneOf = <T extends string>(allowed: readonly T[], v: unknown): v is T =>
  isString(v) && (allowed as readonly string[]).includes(v);

/** True when the value is a contract Project (S35 top bar). */
export function isProject(v: unknown): v is Project {
  return (
    isRecord(v) &&
    isString(v.name) &&
    isString(v.product) &&
    isString(v.increment) &&
    isString(v.spec) &&
    isString(v.user) &&
    isString(v.initials)
  );
}

/** True when the value is a contract Stage (S35 stage bar). */
export function isStage(v: unknown): v is Stage {
  return (
    isRecord(v) &&
    oneOf(STAGE_IDS, v.id) &&
    isString(v.n) &&
    isString(v.name) &&
    oneOf(STAGE_TONES, v.st) &&
    isString(v.text)
  );
}

/** True when the value is the eight stages. */
export function isStages(v: unknown): v is Stage[] {
  return Array.isArray(v) && v.every(isStage);
}

function isRevision(v: unknown): v is Revision {
  return isRecord(v) && isNumber(v.n) && isString(v.content);
}

function isRejection(v: unknown): v is Rejection {
  return isRecord(v) && isString(v.id) && isNumber(v.base) && isString(v.reason);
}

// Runtime mirrors of the IMP-30/31 Rust enums. ts-rs exports types, not values.
const AUDIT_ACTIONS = [
  'accept',
  'reject',
  'revert',
  'delete',
  'restore',
  'reserve',
  'settle',
  'skill_update_applied',
  'skill_update_held',
] as const;
const AUDIT_ERROR_KINDS = ['edited', 'broken_chain', 'sequence', 'truncated'] as const;

function isAuditEntry(v: unknown): v is AuditEntry {
  return (
    isRecord(v) &&
    isNumber(v.seq) &&
    isString(v.actor) &&
    oneOf(AUDIT_ACTIONS, v.action) &&
    isString(v.target_id) &&
    (v.revision === null || isString(v.revision)) &&
    isString(v.reason) &&
    isNumber(v.at) &&
    isString(v.prev_hash) &&
    isString(v.hash)
  );
}

function isAuditError(v: unknown): v is AuditError {
  return (
    isRecord(v) &&
    AUDIT_ERROR_KINDS.some(
      (kind) => isRecord(v[kind]) && isNumber((v[kind] as Record<string, unknown>).seq),
    )
  );
}

function isAuditResponse(v: unknown): v is AuditResponse {
  return (
    isRecord(v) &&
    Array.isArray(v.entries) &&
    v.entries.every(isAuditEntry) &&
    isString(v.head_hash) &&
    (v.error === null || isAuditError(v.error))
  );
}

function isProjectEntry(v: unknown): v is ProjectEntry {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isProject(v.project) &&
    Array.isArray(v.revisions) &&
    v.revisions.every(isString) &&
    isNumber(v.changed_at) &&
    (v.deleted_at === null || isNumber(v.deleted_at))
  );
}

function isDeletedProjectView(v: unknown): v is DeletedProjectView {
  return isRecord(v) && isProjectEntry(v.entry) && isNumber(v.days_left);
}

const CHECK_KINDS = ['unit', 'property', 'e2e', 'harness'] as const;
const OWNER_LANES = ['ui', 'core', 'lead'] as const;
const CONTRACT_STATUSES = ['met', 'failing', 'not_run', 'stale'] as const;
const EVIDENCE_RESULTS = ['passed', 'failed', 'skipped'] as const;

function isCheck(v: unknown): v is Check {
  return (
    isRecord(v) &&
    isString(v.name) &&
    oneOf(CHECK_KINDS, v.kind) &&
    oneOf(OWNER_LANES, v.owner)
  );
}

function isContract(v: unknown): v is Contract {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.title) &&
    isNumber(v.changed_at) &&
    Array.isArray(v.checks) &&
    v.checks.every(isCheck)
  );
}

function isEvidence(v: unknown): v is Evidence {
  return (
    isRecord(v) &&
    isString(v.check) &&
    isString(v.commit) &&
    isNumber(v.at) &&
    oneOf(EVIDENCE_RESULTS, v.result) &&
    isNumber(v.duration_ms) &&
    isString(v.log)
  );
}

function isMatrixRow(v: unknown): v is MatrixRow {
  return (
    isRecord(v) &&
    isString(v.contract) &&
    isString(v.check) &&
    oneOf(CONTRACT_STATUSES, v.status)
  );
}

function isContractsResponse(v: unknown): v is ContractsResponse {
  return (
    isRecord(v) &&
    Array.isArray(v.contracts) &&
    v.contracts.every(isContract) &&
    Array.isArray(v.evidence) &&
    v.evidence.every(isEvidence) &&
    Array.isArray(v.matrix) &&
    v.matrix.every(isMatrixRow)
  );
}

function isSettlement(v: unknown): v is Settlement {
  return (
    isRecord(v) &&
    isString(v.run_id) &&
    isString(v.idempotency_key) &&
    isNumber(v.reserved) &&
    isNumber(v.charged) &&
    isNumber(v.refunded) &&
    isBoolean(v.cancelled)
  );
}

function isRunEstimate(v: unknown): v is RunEstimate {
  return isRecord(v) && isNumber(v.min) && isNumber(v.max) && isNumber(v.reserve);
}

function isReservation(v: unknown): v is Reservation {
  return (
    isRecord(v) &&
    isString(v.run_id) &&
    isString(v.person_id) &&
    isString(v.idempotency_key) &&
    isNumber(v.reserved) &&
    isNumber(v.charged) &&
    isNumber(v.refunded) &&
    oneOf(['active', 'settled', 'cancelled'] as const, v.status)
  );
}

function isUsageSnapshot(v: unknown): v is UsageSnapshot {
  return (
    isRecord(v) &&
    isNumber(v.used) &&
    isNumber(v.reserved) &&
    isNumber(v.pending) &&
    isNumber(v.committed) &&
    isNumber(v.cap) &&
    isNumber(v.left) &&
    oneOf(['calm', 'warn', 'crit'] as const, v.severity)
  );
}

function isModelCapability(v: unknown): v is ModelCapability {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.name) &&
    isString(v.provider) &&
    isNumber(v.context_tokens) &&
    isNumber(v.max_output_tokens) &&
    isBoolean(v.image_input) &&
    isBoolean(v.tools) &&
    oneOf(['selected', 'available', 'unavailable'] as const, v.availability)
  );
}

function isGenUiValidation(v: unknown): v is GenUiValidation {
  if (!isRecord(v)) return false;
  if (v.status === 'ok') return isRecord(v.card);
  if (v.status === 'rejected') return isRecord(v.reason) && isString(v.reason.code);
  return false;
}

function isUpdateCheck(v: unknown): v is UpdateCheck {
  return (
    isRecord(v) &&
    isString(v.skill_id) &&
    isString(v.from_version) &&
    isString(v.to_version) &&
    oneOf(['auto', 'notify', 'pinned'] as const, v.policy) &&
    isRecord(v.decision) &&
    oneOf(['apply', 'hold'] as const, v.decision.decision)
  );
}

const SKILL_SOURCE_KINDS = ['template', 'github', 'user'] as const;
const SKILL_HISTORY_ACTIONS = [
  'copied',
  'edited',
  'installed',
  'update_applied',
  'update_held',
  'rolled_back',
] as const;
const DIFF_OPS = ['context', 'remove', 'add'] as const;
const HOLD_REASON_CODES = [
  'licence_changed',
  'tool_added',
  'script_added',
  'injection_detected',
  'policy_notify',
  'policy_pinned',
] as const;

function isSkillManifest(v: unknown): v is SkillManifest {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.title) &&
    isString(v.description) &&
    Array.isArray(v.stages) &&
    isRecord(v.source) &&
    oneOf(SKILL_SOURCE_KINDS, v.source.kind) &&
    isString(v.licence) &&
    (v.notice === null || isString(v.notice)) &&
    isString(v.version) &&
    Array.isArray(v.reads) &&
    Array.isArray(v.proposes) &&
    Array.isArray(v.tools) &&
    Array.isArray(v.scripts) &&
    isString(v.invocation) &&
    isString(v.body)
  );
}

function isLibrarySkill(v: unknown): v is LibrarySkill {
  return (
    isRecord(v) &&
    isSkillManifest(v.manifest) &&
    oneOf(['auto', 'notify', 'pinned'] as const, v.policy) &&
    oneOf(SKILL_SOURCE_KINDS, v.kind) &&
    isNumber(v.uses)
  );
}

function isSkillsResponse(v: unknown): v is SkillsResponse {
  return (
    isRecord(v) &&
    Array.isArray(v.skills) &&
    v.skills.every(isLibrarySkill) &&
    Array.isArray(v.sources) &&
    v.sources.every(
      (s) =>
        isRecord(s) &&
        isString(s.id) &&
        isString(s.name) &&
        isString(s.kind) &&
        isString(s.licence) &&
        isString(s.policy) &&
        isNumber(s.count),
    )
  );
}

function isHeldUpdate(v: unknown): v is HeldUpdate {
  return (
    isRecord(v) &&
    isString(v.skill_id) &&
    isString(v.from_version) &&
    isString(v.to_version) &&
    Array.isArray(v.reasons) &&
    v.reasons.every((r) => isRecord(r) && oneOf(HOLD_REASON_CODES, r.code)) &&
    Array.isArray(v.diff) &&
    v.diff.every((d) => isRecord(d) && oneOf(DIFF_OPS, d.op) && isString(d.text)) &&
    isNumber(v.at)
  );
}

function isSkillUpdateOutcome(v: unknown): v is SkillUpdateOutcome {
  if (!isRecord(v)) return false;
  if (v.outcome === 'applied') {
    return isLibrarySkill(v.skill) && isString(v.version) && isNumber(v.seq);
  }
  if (v.outcome === 'held') return isHeldUpdate(v.held) && isNumber(v.seq);
  return false;
}

function isSkillHistoryEntry(v: unknown): v is SkillHistoryEntry {
  return (
    isRecord(v) &&
    isNumber(v.seq) &&
    isString(v.skill_id) &&
    oneOf(SKILL_HISTORY_ACTIONS, v.action) &&
    isString(v.version) &&
    isString(v.reason) &&
    isNumber(v.at) &&
    Array.isArray(v.reasons)
  );
}

function isRequestContext(v: unknown): v is RequestContext {
  return isRecord(v) && Array.isArray(v.items) && isNumber(v.total_estimated_tokens);
}

function isManifest(v: unknown): v is Manifest {
  return (
    isRecord(v) &&
    isString(v.manifest_id) &&
    isString(v.spec_rev) &&
    isString(v.framework) &&
    Array.isArray(v.artifacts) &&
    Array.isArray(v.exclusions) &&
    Array.isArray(v.required_inputs)
  );
}

const envBase = (import.meta.env?.VITE_API_BASE as string | undefined) ?? '';

function apiBase(options: ApiOptions): string {
  return (options.baseUrl ?? envBase).replace(/\/+$/, '');
}

/** The URL the server serves one project under. */
export function projectUrl(id: string, options: ApiOptions = {}): string {
  return `${apiBase(options)}/api/projects/${encodeURIComponent(id)}`;
}

/** The URL the server serves that project's stages under. */
export function stagesUrl(id: string, options: ApiOptions = {}): string {
  return `${projectUrl(id, options)}/stages`;
}

/** The URL the server serves that project's build contracts under. */
export function contractsUrl(id: string, options: ApiOptions = {}): string {
  return `${projectUrl(id, options)}/contracts`;
}

type JsonResult = { found: false } | { found: true; value: unknown };

async function readErrorDetails(response: Response): Promise<{ code?: string; message?: string }> {
  try {
    const parsed: unknown = await response.json();
    if (isRecord(parsed) && isString(parsed.code) && isString(parsed.message)) {
      return { code: parsed.code, message: parsed.message };
    }
  } catch {
    // Non-JSON error body; fall back to status-only message.
  }
  return {};
}

async function doFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (cause) {
    // A caller that cancels on purpose gets its own AbortError back, not an API failure.
    if (cause instanceof Error && cause.name === 'AbortError') throw cause;
    throw new ApiError('network', `cannot reach the API at ${url}`, { url, cause });
  }
}

async function parseJson(response: Response, url: string): Promise<unknown> {
  try {
    return await response.json();
  } catch (cause) {
    throw new ApiError('json', `API body is not JSON: ${url}`, { url, cause });
  }
}

async function getJson(url: string, signal: AbortSignal | undefined): Promise<JsonResult> {
  const response = await doFetch(url, { headers: { accept: 'application/json' }, signal });
  // The server answers 404 for an id it does not serve; that is "no such project", not a failure.
  if (response.status === 404) return { found: false };
  if (!response.ok) {
    const err = await readErrorDetails(response);
    throw new ApiError('http', err.message ?? `API answered ${response.status} for ${url}`, {
      url,
      status: response.status,
      ...(err.code !== undefined ? { code: err.code } : {}),
    });
  }
  return { found: true, value: await parseJson(response, url) };
}

async function postJson(
  url: string,
  body: unknown | undefined,
  signal: AbortSignal | undefined,
): Promise<unknown> {
  const headers: Record<string, string> = { accept: 'application/json' };
  const init: RequestInit = { method: 'POST', headers, signal };
  if (body !== undefined) {
    headers['content-type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const response = await doFetch(url, init);
  if (!response.ok) {
    const err = await readErrorDetails(response);
    throw new ApiError('http', err.message ?? `API answered ${response.status} for ${url}`, {
      url,
      status: response.status,
      ...(err.code !== undefined ? { code: err.code } : {}),
    });
  }
  return parseJson(response, url);
}

async function putJson(
  url: string,
  body: unknown | undefined,
  signal: AbortSignal | undefined,
): Promise<unknown> {
  const headers: Record<string, string> = { accept: 'application/json' };
  const init: RequestInit = { method: 'PUT', headers, signal };
  if (body !== undefined) {
    headers['content-type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const response = await doFetch(url, init);
  if (!response.ok) {
    const err = await readErrorDetails(response);
    throw new ApiError('http', err.message ?? `API answered ${response.status} for ${url}`, {
      url,
      status: response.status,
      ...(err.code !== undefined ? { code: err.code } : {}),
    });
  }
  return parseJson(response, url);
}

/**
 * The project context for one id, as the server serves it.
 * `null` means the server does not know the id (404), which is different from an empty project.
 */
export async function fetchProject(id: string, options: ApiOptions = {}): Promise<Project | null> {
  const url = projectUrl(id, options);
  const result = await getJson(url, options.signal);
  if (!result.found) return null;
  if (!isProject(result.value)) {
    throw new ApiError('shape', `API project body is not a Project: ${url}`, { url });
  }
  return result.value;
}

/**
 * The eight stages for one id, in header order, as the server serves them.
 * `null` means the server does not know the id (404).
 */
export async function fetchStages(id: string, options: ApiOptions = {}): Promise<Stage[] | null> {
  const url = stagesUrl(id, options);
  const result = await getJson(url, options.signal);
  if (!result.found) return null;
  if (!isStages(result.value)) {
    throw new ApiError('shape', `API stages body is not a Stage[]: ${url}`, { url });
  }
  return result.value;
}

/** Accept a pending proposal against the project's current revision (IMP-04). */
export async function acceptProposal(
  projectId: string,
  proposalId: string,
  options: ApiOptions = {},
): Promise<Revision> {
  const url = `${projectUrl(projectId, options)}/proposals/${encodeURIComponent(proposalId)}/accept`;
  const value = await postJson(url, undefined, options.signal);
  if (!isRevision(value)) {
    throw new ApiError('shape', `API accept body is not a Revision: ${url}`, { url });
  }
  return value;
}

/** Reject a pending proposal with a required reviewer reason (IMP-04). */
export async function rejectProposal(
  projectId: string,
  proposalId: string,
  reason: string,
  options: ApiOptions = {},
): Promise<Rejection> {
  const url = `${projectUrl(projectId, options)}/proposals/${encodeURIComponent(proposalId)}/reject`;
  const value = await postJson(url, { reason }, options.signal);
  if (!isRejection(value)) {
    throw new ApiError('shape', `API reject body is not a Rejection: ${url}`, { url });
  }
  return value;
}

/** Validate and return a hosted run estimate (IMP-09). */
export async function estimateRun(
  projectId: string,
  req: EstimateRunRequest,
  options: ApiOptions = {},
): Promise<RunEstimate> {
  const url = `${projectUrl(projectId, options)}/runs/estimate`;
  const value = await postJson(url, req, options.signal);
  if (!isRunEstimate(value)) {
    throw new ApiError('shape', `API estimate body is not a RunEstimate: ${url}`, { url });
  }
  return value;
}

/** Atomically reserve credits for a hosted run (IMP-09). */
export async function reserveRun(
  projectId: string,
  req: ReserveRunRequest,
  options: ApiOptions = {},
): Promise<Reservation> {
  const url = `${projectUrl(projectId, options)}/runs/reserve`;
  const value = await postJson(url, req, options.signal);
  if (!isReservation(value)) {
    throw new ApiError('shape', `API reserve body is not a Reservation: ${url}`, { url });
  }
  return value;
}

/** Current hosted credit usage snapshot for a project (IMP-09). `null` on 404. */
export async function fetchUsage(
  projectId: string,
  options: ApiOptions = {},
): Promise<UsageSnapshot | null> {
  const url = `${projectUrl(projectId, options)}/usage`;
  const result = await getJson(url, options.signal);
  if (!result.found) return null;
  if (!isUsageSnapshot(result.value)) {
    throw new ApiError('shape', `API usage body is not a UsageSnapshot: ${url}`, { url });
  }
  return result.value;
}

/** Declared model capability registry (IMP-11). */
export async function fetchModels(options: ApiOptions = {}): Promise<ModelCapability[]> {
  const url = `${apiBase(options)}/api/models`;
  const response = await doFetch(url, {
    headers: { accept: 'application/json' },
    signal: options.signal,
  });
  if (!response.ok) {
    const err = await readErrorDetails(response);
    throw new ApiError('http', err.message ?? `API answered ${response.status} for ${url}`, {
      url,
      status: response.status,
      ...(err.code !== undefined ? { code: err.code } : {}),
    });
  }
  const value = await parseJson(response, url);
  if (!Array.isArray(value) || !value.every(isModelCapability)) {
    throw new ApiError('shape', `API models body is not a ModelCapability[]: ${url}`, { url });
  }
  return value;
}

/**
 * Validate a GenUI card payload through the fail-closed Rust validator (IMP-10).
 * Both 200 (Ok) and 400/422 (Rejected) return the typed `GenUiValidation` union.
 */
export async function validateGenUi(
  card: unknown,
  options: ApiOptions = {},
): Promise<GenUiValidation> {
  const url = `${apiBase(options)}/api/genui/validate`;
  const response = await doFetch(url, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(card),
    signal: options.signal,
  });
  if (!response.ok && response.status !== 400 && response.status !== 422) {
    const err = await readErrorDetails(response);
    throw new ApiError('http', err.message ?? `API answered ${response.status} for ${url}`, {
      url,
      status: response.status,
      ...(err.code !== undefined ? { code: err.code } : {}),
    });
  }
  const value = await parseJson(response, url);
  if (!isGenUiValidation(value)) {
    throw new ApiError('shape', `API genui body is not a GenUiValidation: ${url}`, { url });
  }
  return value;
}

/** Classify an upstream skill update against a source update policy (IMP-22). */
export async function checkSkillUpdate(
  req: CheckSkillUpdateRequest,
  options: ApiOptions = {},
): Promise<UpdateCheck> {
  const url = `${apiBase(options)}/api/skills/check-update`;
  const value = await postJson(url, req, options.signal);
  if (!isUpdateCheck(value)) {
    throw new ApiError('shape', `API skills check body is not an UpdateCheck: ${url}`, { url });
  }
  return value;
}

/** Build the pure next-request context from explicit chips (IMP-25). */
export async function buildProjectContext(
  projectId: string,
  req: BuildContextRequest,
  options: ApiOptions = {},
): Promise<RequestContext> {
  const url = `${projectUrl(projectId, options)}/context`;
  const value = await postJson(url, req, options.signal);
  if (!isRequestContext(value)) {
    throw new ApiError('shape', `API context body is not a RequestContext: ${url}`, { url });
  }
  return value;
}

/** Seal a deterministic coding handoff manifest for accepted revisions (IMP-24). */
export async function buildHandoffManifest(
  projectId: string,
  req: BuildManifestRequest,
  options: ApiOptions = {},
): Promise<Manifest> {
  const url = `${projectUrl(projectId, options)}/handoff/manifest`;
  const value = await postJson(url, req, options.signal);
  if (!isManifest(value)) {
    throw new ApiError('shape', `API manifest body is not a Manifest: ${url}`, { url });
  }
  return value;
}

/**
 * The build contracts for one id: the named requirements, the recorded evidence and the
 * readiness matrix S37 draws (IMP-33/IMP-37). `null` means the server does not know the id.
 */
export async function fetchContracts(
  projectId: string,
  options: ApiOptions = {},
): Promise<ContractsResponse | null> {
  const url = contractsUrl(projectId, options);
  const result = await getJson(url, options.signal);
  if (!result.found) return null;
  if (!isContractsResponse(result.value)) {
    throw new ApiError('shape', `API contracts body is not a ContractsResponse: ${url}`, { url });
  }
  return result.value;
}

/** The hash-chained audit view; the head hash is held by the server apart from the log (IMP-31). */
export async function fetchAudit(
  projectId: string,
  options: ApiOptions = {},
): Promise<AuditResponse | null> {
  const url = `${projectUrl(projectId, options)}/audit`;
  const result = await getJson(url, options.signal);
  if (!result.found) return null;
  if (!isAuditResponse(result.value)) {
    throw new ApiError('shape', `API audit body is not an AuditResponse: ${url}`, { url });
  }
  return result.value;
}

/** The URL the server serves the skills library's own hash-chained audit under (IMP-43). */
export function skillsAuditUrl(options: ApiOptions = {}): string {
  return `${apiBase(options)}/api/skills/audit`;
}

/**
 * The skills library's own audit view (IMP-43). Both audit routes answer the same generated
 * `AuditResponse`, so this reuses the project audit client's shape check. `null` means the server
 * does not serve the chain (404); it is different from a verified but empty chain.
 */
export async function fetchSkillsAudit(
  options: ApiOptions = {},
): Promise<AuditResponse | null> {
  const url = skillsAuditUrl(options);
  const result = await getJson(url, options.signal);
  if (!result.found) return null;
  if (!isAuditResponse(result.value)) {
    throw new ApiError('shape', `API skills audit body is not an AuditResponse: ${url}`, { url });
  }
  return result.value;
}

/** Revert an artifact to an earlier revision's content, writing a new revision (IMP-31). */
export async function revertRevision(
  projectId: string,
  artifact: string,
  to: Revision,
  options: ApiOptions = {},
): Promise<Revision> {
  const url = `${projectUrl(projectId, options)}/revisions/${encodeURIComponent(artifact)}/revert`;
  const value = await postJson(url, { to }, options.signal);
  if (!isRevision(value)) {
    throw new ApiError('shape', `API revert body is not a Revision: ${url}`, { url });
  }
  return value;
}

/** Settle a reserved hosted run at its actual cost (IMP-31). */
export async function settleRun(
  projectId: string,
  req: SettleRunRequest,
  options: ApiOptions = {},
): Promise<Settlement> {
  const url = `${projectUrl(projectId, options)}/runs/settle`;
  const value = await postJson(url, req, options.signal);
  if (!isSettlement(value)) {
    throw new ApiError('shape', `API settle body is not a Settlement: ${url}`, { url });
  }
  return value;
}

/** Mark a project deleted through the 30-day restore window (IMP-29/IMP-31). */
export async function deleteProject(
  projectId: string,
  options: ApiOptions = {},
): Promise<ProjectEntry> {
  const url = `${projectUrl(projectId, options)}/delete`;
  const value = await postJson(url, undefined, options.signal);
  if (!isProjectEntry(value)) {
    throw new ApiError('shape', `API delete body is not a ProjectEntry: ${url}`, { url });
  }
  return value;
}

/** Restore a recently deleted project inside the window (IMP-29/IMP-31). */
export async function restoreProject(
  projectId: string,
  options: ApiOptions = {},
): Promise<ProjectEntry> {
  const url = `${projectUrl(projectId, options)}/restore`;
  const value = await postJson(url, undefined, options.signal);
  if (!isProjectEntry(value)) {
    throw new ApiError('shape', `API restore body is not a ProjectEntry: ${url}`, { url });
  }
  return value;
}

/** Recently deleted entries with the whole-day countdown S27 shows (IMP-31). */
export async function fetchDeletedProjects(
  options: ApiOptions = {},
): Promise<DeletedProjectView[]> {
  const url = `${apiBase(options)}/api/projects/deleted`;
  const result = await getJson(url, options.signal);
  if (!result.found) return [];
  if (!Array.isArray(result.value) || !result.value.every(isDeletedProjectView)) {
    throw new ApiError('shape', `API deleted body is not a DeletedProjectView[]: ${url}`, { url });
  }
  return result.value;
}

/** The S40 library: templates, the user's copies and GitHub sources (IMP-34). */
export async function fetchSkills(options: ApiOptions = {}): Promise<SkillsResponse> {
  const url = `${apiBase(options)}/api/skills`;
  const result = await getJson(url, options.signal);
  if (!result.found) {
    throw new ApiError('http', `API has no skills library: ${url}`, { url, status: 404 });
  }
  if (!isSkillsResponse(result.value)) {
    throw new ApiError('shape', `API skills body is not a SkillsResponse: ${url}`, { url });
  }
  return result.value;
}

/** Make a user-owned copy of a template; the template itself never changes (IMP-34). */
export async function copySkill(
  id: string,
  req: CopySkillRequest,
  options: ApiOptions = {},
): Promise<LibrarySkill> {
  const url = `${apiBase(options)}/api/skills/${encodeURIComponent(id)}/copy`;
  const value = await postJson(url, req, options.signal);
  if (!isLibrarySkill(value)) {
    throw new ApiError('shape', `API skill copy body is not a LibrarySkill: ${url}`, { url });
  }
  return value;
}

/** Edit a user copy, storing a new version; templates and GitHub skills are 409 (IMP-34). */
export async function editSkill(
  id: string,
  req: EditSkillRequest,
  options: ApiOptions = {},
): Promise<LibrarySkill> {
  const url = `${apiBase(options)}/api/skills/${encodeURIComponent(id)}`;
  const value = await putJson(url, req, options.signal);
  if (!isLibrarySkill(value)) {
    throw new ApiError('shape', `API skill edit body is not a LibrarySkill: ${url}`, { url });
  }
  return value;
}

/** Add a public GitHub source, pinned to an exact commit by the server (IMP-34). */
export async function addGithubSkill(
  req: AddGithubSkillRequest,
  options: ApiOptions = {},
): Promise<LibrarySkill> {
  const url = `${apiBase(options)}/api/skills/github`;
  const value = await postJson(url, req, options.signal);
  if (!isLibrarySkill(value)) {
    throw new ApiError('shape', `API github skill body is not a LibrarySkill: ${url}`, { url });
  }
  return value;
}

/** Run an update check: applied updates make a version, held updates keep their diff (IMP-34). */
export async function checkSkillForUpdates(
  id: string,
  req: SkillCheckRequest,
  options: ApiOptions = {},
): Promise<SkillUpdateOutcome> {
  const url = `${apiBase(options)}/api/skills/${encodeURIComponent(id)}/check`;
  const value = await postJson(url, req, options.signal);
  if (!isSkillUpdateOutcome(value)) {
    throw new ApiError('shape', `API skills check body is not a SkillUpdateOutcome: ${url}`, {
      url,
    });
  }
  return value;
}

/** Every version and update decision for one skill, in sequence (IMP-34). */
export async function fetchSkillHistory(
  id: string,
  options: ApiOptions = {},
): Promise<SkillHistoryEntry[]> {
  const url = `${apiBase(options)}/api/skills/${encodeURIComponent(id)}/history`;
  const result = await getJson(url, options.signal);
  if (!result.found) return [];
  if (!Array.isArray(result.value) || !result.value.every(isSkillHistoryEntry)) {
    throw new ApiError('shape', `API skill history body is not a SkillHistoryEntry[]: ${url}`, {
      url,
    });
  }
  return result.value;
}

/** Roll a skill back to any earlier version; the rollback is a new version (IMP-34). */
export async function rollbackSkill(
  id: string,
  version: string,
  options: ApiOptions = {},
): Promise<LibrarySkill> {
  const url = `${apiBase(options)}/api/skills/${encodeURIComponent(id)}/rollback/${encodeURIComponent(version)}`;
  const value = await postJson(url, undefined, options.signal);
  if (!isLibrarySkill(value)) {
    throw new ApiError('shape', `API skill rollback body is not a LibrarySkill: ${url}`, { url });
  }
  return value;
}
