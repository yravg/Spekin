// IMP-39 · a dev-only simulation of "the Spekin server stopped answering" (S35 state `offline`, F378).
//
// `?sim=offline` on the app URL (development builds only) serves the shape the screens load from
// the Rust server, remembers it as the last copy loaded at the sample's 12:41, and then refuses
// every read. The design stage therefore draws its last copy with the offline banner and chip,
// which is exactly the board state. Nothing here runs in a production build.
import { sampleSource, type DataSource } from './source';
import { primeLastCopy } from './session';

/** The sample's drawn moment; the board writes "last copy loaded at 12:41". */
export const SIM_LOADED_AT = '12:41';

export const OFFLINE_SIM = 'offline';

/** True only in a development build with `?sim=offline` in the URL. */
export function offlineSimRequested(search: string, dev: boolean | undefined): boolean {
  return dev === true && new URLSearchParams(search).get('sim') === OFFLINE_SIM;
}

function atToday(hhmm: string, now: Date): Date {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  const at = new Date(now);
  at.setHours(h, m, 0, 0);
  return at;
}

/** The simulated offline source: every read refuses, the last copy is the sample snapshot. */
export function createOfflineSimSource(now: Date = new Date()): DataSource {
  const copy = sampleSource.snapshot('meranti-yard');
  if (copy) primeLastCopy('project:meranti-yard', copy, atToday(SIM_LOADED_AT, now));
  const refuse = async (): Promise<never> => {
    throw new Error('The Spekin server is not answering.');
  };
  return {
    ...sampleSource,
    mode: 'api',
    snapshot: () => null,
    project: refuse,
    stages: refuse,
    usage: refuse,
    models: refuse,
    skills: refuse,
    skillHistory: refuse,
    contracts: refuse,
    audit: refuse,
    recentlyDeleted: refuse,
  };
}

/** The source the app starts with when the URL asks for the simulation; otherwise null. */
export function devOfflineSimSource(): DataSource | null {
  const dev = typeof import.meta.env === 'object' ? import.meta.env?.DEV : false;
  if (!dev) return null;
  const search = typeof window === 'undefined' ? '' : window.location.search;
  return offlineSimRequested(search, true) ? createOfflineSimSource() : null;
}
