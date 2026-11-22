import { create } from 'zustand';
import type { StageId } from '@spekin/sample';

// Per-stage memory: switching stages swaps the work area in place and restores each stage's own view (R-WF-9, R-WF-10, AC-SPK-17).
// Drafts live here until saved; they never go into the URL (AC-SPK-18).
export type ViewMode = 'Canvas' | 'Preview' | 'Document' | 'Compare';

export interface StageView {
  tab: string | null;
  selection: string[];
  zoom: number;
  draft: string;
  viewMode: ViewMode;
  inspTab: string;
  removedCtx: string[];
  tool: string;
  tableMode: boolean;
}

const DEFAULT_VIEWS: Partial<Record<StageId, StageView>> = {
  design: {
    tab: 'Variance flows',
    selection: ['F-03'],
    zoom: 0.64,
    draft: '',
    viewMode: 'Canvas',
    inspTab: 'Links',
    removedCtx: [],
    tool: 'pointer',
    tableMode: false,
  },
  backend: {
    tab: 'API contract · variance alerts',
    selection: [],
    zoom: 1,
    draft: '',
    viewMode: 'Document',
    inspTab: 'Checklist',
    removedCtx: [],
    tool: 'pointer',
    tableMode: false,
  },
};

function defaultView(stage: StageId): StageView {
  return (
    DEFAULT_VIEWS[stage] ?? {
      tab: null,
      selection: [],
      zoom: 1,
      draft: '',
      viewMode: 'Document',
      inspTab: 'Links',
      removedCtx: [],
      tool: 'pointer',
      tableMode: false,
    }
  );
}

interface WorkspaceState {
  views: Partial<Record<StageId, StageView>>;
  chatWidth: number | null;
  chatCollapsed: boolean;
  lastIntent: string | null;
  view: (stage: StageId) => StageView;
  setView: (stage: StageId, patch: Partial<StageView>) => void;
  setChatWidth: (w: number) => void;
  toggleChatCollapsed: () => void;
  recordIntent: (intent: string) => void;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  views: {},
  chatWidth: null,
  chatCollapsed: false,
  lastIntent: null,
  view: (stage) => get().views[stage] ?? defaultView(stage),
  setView: (stage, patch) =>
    set((s) => ({
      views: { ...s.views, [stage]: { ...(s.views[stage] ?? defaultView(stage)), ...patch } },
    })),
  setChatWidth: (w) => set({ chatWidth: Math.min(520, Math.max(300, w)) }),
  toggleChatCollapsed: () => set((s) => ({ chatCollapsed: !s.chatCollapsed })),
  recordIntent: (intent) => set({ lastIntent: intent }),
}));
