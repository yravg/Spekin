// The API source: one typed client for the Rust server (crates/spekin-server).
// Types come from @spekin/contracts, which is generated from the Rust types (R-ARC-3).
// This module only fetches and checks shapes. It decides no rules, and the screens still
// read apps/web/src/data/source.ts until the lead switches them (IMP-03 note).
import type { Project, Stage, StageId, StageTone } from '@spekin/contracts';

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
  readonly url: string;

  constructor(
    kind: ApiErrorKind,
    message: string,
    details: { url: string; status?: number; cause?: unknown },
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.url = details.url;
    this.status = details.status;
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

async function getJson(url: string, signal: AbortSignal | undefined): Promise<JsonResult> {
  let response: Response;
  try {
    response = await fetch(url, { headers: { accept: 'application/json' }, signal });
  } catch (cause) {
    // A caller that cancels on purpose gets its own AbortError back, not an API failure.
    if (cause instanceof Error && cause.name === 'AbortError') throw cause;
    throw new ApiError('network', `cannot reach the API at ${url}`, { url, cause });
  }
  // The server answers 404 for an id it does not serve; that is "no such project", not a failure.
  if (response.status === 404) return { found: false };
  if (!response.ok) {
    throw new ApiError('http', `API answered ${response.status} for ${url}`, {
      url,
      status: response.status,
    });
  }
  try {
    return { found: true, value: await response.json() };
  } catch (cause) {
    throw new ApiError('json', `API body is not JSON: ${url}`, { url, cause });
  }
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
