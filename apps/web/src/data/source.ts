import { PROJECT, STAGES, USAGE } from '@spekin/sample';
import type { SampleProject, SampleStage, SampleUsage, StageId } from '@spekin/sample';

// One data source for the screens. Today it reads the sample module the boards use.
// IMP-03 adds an API source (Rust server) behind the same functions; a contract test keeps both equal.
export const SAMPLE_PROJECT_ID = 'meranti-yard';

export function getProject(id: string): SampleProject | null {
  return id === SAMPLE_PROJECT_ID ? PROJECT : null;
}

export function getStages(id: string): SampleStage[] {
  return id === SAMPLE_PROJECT_ID ? STAGES : [];
}

export function getUsage(id: string): SampleUsage | null {
  return id === SAMPLE_PROJECT_ID ? USAGE : null;
}

export function isStageId(stages: SampleStage[], s: string | undefined): s is StageId {
  return !!s && stages.some((x) => x.id === s);
}
