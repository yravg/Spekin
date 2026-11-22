// The API source: one typed client for the Rust server (crates/spekin-server).
// Types come from @spekin/contracts, which is generated from the Rust types (R-ARC-3).
// This module only fetches and checks shapes. It decides no rules, and the screens still
// read apps/web/src/data/source.ts until the lead switches them (IMP-03 note).
import type {
  BuildContextRequest,
  BuildManifestRequest,
  CheckSkillUpdateRequest,
  EstimateRunRequest,
  GenUiValidation,
  Manifest,
  ModelCapability,
  Project,
  Rejection,
  RequestContext,
  Reservation,
  ReserveRunRequest,
  Revision,
  RunEstimate,
  Stage,
  StageId,
  StageTone,
  UpdateCheck,
  UsageSnapshot,
} from '@spekin/contracts';

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

// Runtime mirrors of the Rust enums (crates/spekin-core/src/stage.rs). ts-rs exports the types,
// not the values, so the shape check keeps its own list next to the type import above.
const STAGE_IDS: readonly StageId[] = [
  'planning',
  'spec',
  'design',
  'frontend',
  'backend',
  'integration',
  'testing',
  'deploy',
];
const STAGE_TONES: readonly StageTone[] = ['ok', 'half', 'ring', 'warn', 'bad'];

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
