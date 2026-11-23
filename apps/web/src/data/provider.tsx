import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  defaultSource,
  sampleSource,
  type DataSource,
  type ProjectSnapshot,
  type SampleProject,
  type SampleStage,
  type SampleUsage,
} from './source';

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

export interface ProjectData {
  project: SampleProject | null;
  stages: SampleStage[];
  usage: SampleUsage | null;
  /** True while the API source has not answered. The screen draws nothing, never a spinner the boards do not draw. */
  loading: boolean;
  error: string | null;
}

function fromSnapshot(snapshot: ProjectSnapshot | null, hasLocalData: boolean): ProjectData {
  return snapshot
    ? { ...snapshot, loading: false, error: null }
    : { project: null, stages: [], usage: null, loading: !hasLocalData, error: null };
}

/** Project, stages and usage for one id, from whichever source the provider holds. */
export function useProjectData(id: string): ProjectData {
  const source = useData();
  const hasLocalData = source.mode === 'sample';
  const [data, setData] = useState<ProjectData>(() => fromSnapshot(source.snapshot(id), hasLocalData));

  useEffect(() => {
    if (source.mode === 'sample') {
      const local = source.snapshot(id);
      setData(fromSnapshot(local, true));
      return;
    }
    let alive = true;
    setData({ project: null, stages: [], usage: null, loading: true, error: null });
    Promise.all([source.project(id), source.stages(id), source.usage(id)])
      .then(([project, stages, usage]) => {
        if (!alive) return;
        setData({ project, stages, usage, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setData({
          project: null,
          stages: [],
          usage: null,
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    return () => {
      alive = false;
    };
  }, [source, id]);

  return data;
}

/**
 * One screen read through the door (IMP-37), seeded with the drawn sample value.
 *
 * In sample mode the seed is the answer. In api mode the source's read replaces it when it
 * arrives; an error keeps the seed on screen and is available to the caller, so a screen never
 * draws half a board. `deps` are the read's arguments (a project id, a skill id).
 */
export function useDataRead<T>(
  seed: T,
  read: (source: DataSource) => Promise<T>,
  deps: readonly unknown[] = [],
): { value: T; error: string | null } {
  const source = useData();
  const [state, setState] = useState<{ value: T; error: string | null }>({
    value: seed,
    error: null,
  });

  useEffect(() => {
    if (source.mode === 'sample') {
      setState({ value: seed, error: null });
      return;
    }
    let alive = true;
    read(source)
      .then((value) => {
        if (alive) setState({ value, error: null });
      })
      .catch((error: unknown) => {
        if (!alive) return;
        setState({ value: seed, error: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      alive = false;
    };
    // `read` and `seed` are read at call time; deps name the arguments that change the answer.
  }, [source, ...deps]);

  return state;
}
