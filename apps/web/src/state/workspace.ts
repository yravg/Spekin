import { create } from 'zustand';
import type { StageId } from '@spekin/sample';

// Per-stage memory: switching stages swaps the work area in place and restores each stage's own view (R-WF-9, R-WF-10, AC-SPK-17).
// Drafts live here until saved; they never go into the URL (AC-SPK-18).
export interface StageView {
  tab: string | null;
  selection: string[];
  zoom: number;
  draft: string;
}

const emptyView: StageView = { tab: null, selection: [], zoom: 1, draft: '' };

interface WorkspaceState {
  views: Partial<Record<StageId, StageView>>;
  view: (stage: StageId) => StageView;
  setView: (stage: StageId, patch: Partial<StageView>) => void;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  views: {},
  view: (stage) => get().views[stage] ?? emptyView,
  setView: (stage, patch) => set((s) => ({ views: { ...s.views, [stage]: { ...(s.views[stage] ?? emptyView), ...patch } } })),
}));
