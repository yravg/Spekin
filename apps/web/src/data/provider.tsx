import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  defaultSource,
  sampleSource,
  type DataMode,
  type DataSource,
  type ProjectSnapshot,
  type SampleProject,
  type SampleStage,
  type SampleUsage,
} from './source';
import {
  connection,
  isReadFailed,
  lastCopy,
  readThrough,
  retryFailedReads,
  subscribeConnection,
  type ConnectionState,
} from './session';

// DataSourceProvider (IMP-21): every screen reads its data from this context, never from @spekin/sample.
const DataContext = createContext<DataSource>(sampleSource);

export function DataSourceProvider({
  source = defaultSource,
  children,
}: {
  source?: DataSource;
  children: ReactNode;
}) {
  return <DataContext.Provider value={source}>{children}</DataContext.Provider>;
}

export function useData(): DataSource {
  return useContext(DataContext);
}

/** The session's API read state: offline and when the newest copy loaded. IMP-39, F378. */
export function useConnection(): ConnectionState {
  const [state, setState] = useState(connection);
  useEffect(() => subscribeConnection(() => setState(connection())), []);
  return state;
}

export interface ProjectData {
  project: SampleProject | null;
  stages: SampleStage[];
  usage: SampleUsage | null;
  /** True while the API source has not answered and has no earlier copy. The screen draws nothing. */
  loading: boolean;
  error: string | null;
}

const PROJECT_KEY = (id: string) => 'project:' + id;

function fromSnapshot(snapshot: ProjectSnapshot | null, loading: boolean): ProjectData {
  return snapshot
    ? { ...snapshot, loading: false, error: null }
    : { project: null, stages: [], usage: null, loading, error: null };
}

function fromLastCopy(id: string): ProjectData {
  const copy = lastCopy<ProjectSnapshot>(PROJECT_KEY(id));
  const failed = isReadFailed(PROJECT_KEY(id));
  const data = fromSnapshot(copy?.value ?? null, !copy && !failed);
  return failed ? { ...data, error: 'The Spekin server is not answering.' } : data;
}

async function readProject(source: DataSource, id: string): Promise<ProjectSnapshot> {
  const [project, stages, usage] = await Promise.all([source.project(id), source.stages(id), source.usage(id)]);
  if (!project || !usage) throw new Error('The Spekin server has no project ' + id + '.');
  return { project, stages, usage };
}

/** Project, stages and usage for one id, from whichever source the provider holds. */
export function useProjectData(id: string): ProjectData {
  const source = useData();
  const [data, setData] = useState<ProjectData>(() =>
    source.mode === 'sample' ? fromSnapshot(source.snapshot(id), false) : fromLastCopy(id),
  );

  useEffect(() => {
    if (source.mode === 'sample') {
      setData(fromSnapshot(source.snapshot(id), false));
      return;
    }
    let alive = true;
    // Draw the last copy while the read runs; never the sample (IMP-39).
    setData(fromLastCopy(id));
    const stop = subscribeConnection(() => {
      const copy = lastCopy<ProjectSnapshot>(PROJECT_KEY(id));
      if (alive && copy) setData({ ...copy.value, loading: false, error: null });
    });
    readThrough(PROJECT_KEY(id), () => readProject(source, id))
      .then((snapshot) => {
        if (alive) setData({ ...snapshot, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setData({
          ...fromLastCopy(id),
          error: error instanceof Error ? error.message : String(error),
        });
      });
    return () => {
      alive = false;
      stop();
    };
  }, [source, id]);

  return data;
}

/**
 * The value a screen should draw before its read answers (IMP-39).
 *
 * Sample mode answers with the drawn sample. API mode answers with the last copy the API gave in
 * this session, or null — the screen's empty state. It is never the sample.
 */
export function initialReadValue<T>(key: string, mode: DataMode, seed: T): T | null {
  return mode === 'sample' ? seed : (lastCopy<T>(key)?.value ?? null);
}

/**
 * One screen read through the door (IMP-37, IMP-39), never falling back to the sample.
 *
 * In sample mode the seed is the answer. In api mode the source's read replaces the last copy when
 * it arrives; an error keeps the last API value and raises the shell's offline banner. With no
 * earlier copy the value is null, so the screen draws its empty state. `deps` are the read's
 * arguments (a project id, a skill id); `key` names the memory for this read.
 */
export function useDataRead<T>(
  key: string,
  seed: T,
  read: (source: DataSource) => Promise<T>,
  deps: readonly unknown[] = [],
): { value: T | null; error: string | null } {
  const source = useData();
  const [state, setState] = useState<{ value: T | null; error: string | null }>(() => ({
    value: initialReadValue(key, source.mode, seed),
    error: null,
  }));

  useEffect(() => {
    if (source.mode === 'sample') {
      setState({ value: seed, error: null });
      return;
    }
    let alive = true;
    setState({ value: initialReadValue(key, source.mode, seed), error: null });
    // A retry that answers updates this screen, and so does any later copy of the same read.
    const stop = subscribeConnection(() => {
      const copy = lastCopy<T>(key);
      if (alive && copy) setState({ value: copy.value, error: null });
    });
    readThrough(key, () => read(source))
      .then((value) => {
        if (alive) setState({ value, error: null });
      })
      .catch((error: unknown) => {
        if (!alive) return;
        // Keep the last API value (readThrough left it in place); never the seed.
        setState({ value: initialReadValue(key, source.mode, seed), error: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      alive = false;
      stop();
    };
    // `read` and `seed` are read at call time; deps name the arguments that change the answer.
  }, [source, key, ...deps]);

  return state;
}

/** "Try again" in the offline banner: re-run the reads that failed. Throw away with the session. */
export function useTryAgain(): () => void {
  return () => {
    void retryFailedReads();
  };
}
