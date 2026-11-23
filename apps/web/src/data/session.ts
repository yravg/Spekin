// IMP-39 · F378: one session memory for API reads.
//
// A read that succeeded keeps its last value here, in memory for this browser session. A later
// read that fails leaves that value in place and raises the offline state; it never swaps in the
// sample. "Try again" re-runs the reads that failed, and the offline state clears once they answer.
//
// Kept outside React so the behaviour is testable without a DOM, and so the memory survives every
// screen and stage switch inside one session (a reload starts clean, as the card says).

export interface LastCopy<T> {
  value: T;
  at: Date;
}

export interface ConnectionState {
  /** Any read failed and has not succeeded since. The shell draws the banner while this is true. */
  offline: boolean;
  /** When the newest copy now on screen came from the API; null before any read has answered. */
  lastLoadedAt: Date | null;
}

const copies = new Map<string, LastCopy<unknown>>();
// One retry per read that failed: the same read, run again. A success deletes its entry.
const retries = new Map<string, () => Promise<unknown>>();
const listeners = new Set<() => void>();

function newestLoad(): Date | null {
  let newest: Date | null = null;
  for (const copy of copies.values()) if (!newest || copy.at > newest) newest = copy.at;
  return newest;
}

function notify(): void {
  for (const listener of listeners) listener();
}

/** What a screen should draw right now. */
export function connection(): ConnectionState {
  return { offline: retries.size > 0, lastLoadedAt: newestLoad() };
}

export function subscribeConnection(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The last value the API gave for this read, or undefined when it has never answered. */
export function lastCopy<T>(key: string): LastCopy<T> | undefined {
  return copies.get(key) as LastCopy<T> | undefined;
}

export function isReadFailed(key: string): boolean {
  return retries.has(key);
}

/** Remember an API answer (and, in a dev simulation, the copy the server "loaded" before it stopped). */
export function primeLastCopy<T>(key: string, value: T, at: Date = new Date()): void {
  copies.set(key, { value, at });
  retries.delete(key);
  notify();
}

/** Raise the offline state for a read without running it (tests and the dev simulation). */
export function markReadFailed(key: string, retry: () => Promise<unknown>): void {
  retries.set(key, retry);
  notify();
}

/** Run one API read: a success is remembered as the last copy, a failure raises the offline state. */
export async function readThrough<T>(key: string, read: () => Promise<T>): Promise<T> {
  try {
    const value = await read();
    copies.set(key, { value, at: new Date() });
    retries.delete(key);
    notify();
    return value;
  } catch (error) {
    markReadFailed(key, () => readThrough(key, read));
    throw error;
  }
}

/** "Try again": re-run every read that failed. The banner closes when none is left. */
export async function retryFailedReads(): Promise<void> {
  const pending = [...retries.values()];
  await Promise.allSettled(pending.map((retry) => retry()));
  notify();
}

/** Tests and the dev simulation start from a clean session. */
export function resetSession(): void {
  copies.clear();
  retries.clear();
  notify();
}
