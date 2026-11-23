import { create } from 'zustand';
import { sampleData, type SampleConflict, type StageId } from '../data/source';
const { CONFLICT } = sampleData;

// Per-stage memory: switching stages swaps the work area in place and restores each stage's own view (R-WF-9, R-WF-10, AC-SPK-17).
// Drafts live here until saved; they never go into the URL (AC-SPK-18).
export type ViewMode = 'Canvas' | 'Preview' | 'Document' | 'Compare';
export type SaveStatus = 'saved' | 'saving' | 'failed' | 'conflict';
export interface SaveState {
  status: SaveStatus;
  tone: 'ok' | 'warn' | 'bad';
  text: string;
}

export const DEFAULT_SAVE: SaveState = { status: 'saved', tone: 'ok', text: 'Saved 12:41' };

function makeSaveState(status: SaveStatus, detail?: string): SaveState {
  switch (status) {
    case 'saving':
      return { status, tone: 'warn', text: detail ?? 'Saving…' };
    case 'failed':
      return { status, tone: 'bad', text: detail ?? 'Failed (kept on this device)' };
    case 'conflict':
      return { status, tone: 'bad', text: detail ?? 'Conflict · ' + CONFLICT.frame.split(' ')[0] };
    case 'saved':
    default:
      return { status: 'saved', tone: 'ok', text: detail ?? 'Saved 12:41' };
  }
}

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

const FALLBACK_VIEW: StageView = {
  tab: null,
  selection: [],
  zoom: 1,
  draft: '',
  viewMode: 'Document',
  inspTab: 'Links',
  removedCtx: [],
  tool: 'pointer',
  tableMode: false,
};

const DEFAULT_VIEWS: Partial<Record<StageId, StageView>> = {
  spec: {
    tab: 'Skills',
    selection: [],
    zoom: 1,
    draft: '',
    viewMode: 'Document',
    inspTab: 'Links',
    removedCtx: [],
    tool: 'pointer',
    tableMode: false,
  },
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
  return DEFAULT_VIEWS[stage] ?? FALLBACK_VIEW;
}

interface WorkspaceState {
  views: Partial<Record<StageId, StageView>>;
  chatWidth: number | null;
  chatCollapsed: boolean;
  lastIntent: string | null;
  save: SaveState;
  conflict: SampleConflict | null;
  dirtyTabs: string[];
  view: (stage: StageId) => StageView;
  setView: (stage: StageId, patch: Partial<StageView>) => void;
  setChatWidth: (w: number) => void;
  toggleChatCollapsed: () => void;
  recordIntent: (intent: string) => void;
  setSaveStatus: (status: SaveStatus, detail?: string) => void;
  triggerConflict: () => void;
  resolveConflict: (action: 'compare' | 'proposal' | 'discard') => void;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  views: {},
  chatWidth: null,
  chatCollapsed: false,
  lastIntent: null,
  save: DEFAULT_SAVE,
  conflict: null,
  dirtyTabs: [],
  view: (stage) => get().views[stage] ?? defaultView(stage),
  setView: (stage, patch) =>
    set((s) => ({
      views: { ...s.views, [stage]: { ...(s.views[stage] ?? defaultView(stage)), ...patch } },
    })),
  setChatWidth: (w) => set({ chatWidth: Math.min(520, Math.max(300, w)) }),
  toggleChatCollapsed: () => set((s) => ({ chatCollapsed: !s.chatCollapsed })),
  recordIntent: (intent) => set({ lastIntent: intent }),
  setSaveStatus: (status, detail) => set({ save: makeSaveState(status, detail) }),
  triggerConflict: () =>
    set((s) => ({
      conflict: CONFLICT,
      save: makeSaveState('conflict'),
      dirtyTabs: s.dirtyTabs.includes('F-04 Alert drawer') ? s.dirtyTabs : [...s.dirtyTabs, 'F-04 Alert drawer'],
    })),
  resolveConflict: (action) =>
    set((s) => {
      if (action === 'compare') {
        const prev = s.views.design ?? defaultView('design');
        return {
          views: { ...s.views, design: { ...prev, viewMode: 'Compare' } },
          lastIntent: 'F112:compare',
        };
      }
      return {
        conflict: null,
        save: DEFAULT_SAVE,
        dirtyTabs: s.dirtyTabs.filter((t) => t !== 'F-04 Alert drawer'),
        lastIntent: action === 'proposal' ? 'F112:keep-proposal' : 'F112:discard-draft',
      };
    }),
}));
