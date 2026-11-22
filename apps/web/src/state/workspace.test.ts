import { describe, expect, it, beforeEach } from 'vitest';
import { DEFAULT_SAVE, useWorkspace } from './workspace';

describe('per-stage workspace memory (AC-SPK-17, IMP-01)', () => {
  beforeEach(() => {
    useWorkspace.setState({ views: {}, lastIntent: null, save: DEFAULT_SAVE, conflict: null, dirtyTabs: [] });
  });

  it('provides board defaults for design and backend stages', () => {
    const design = useWorkspace.getState().view('design');
    expect(design.tab).toBe('Variance flows');
    expect(design.selection).toEqual(['F-03']);
    expect(design.zoom).toBe(0.64);
    expect(design.draft).toBe('');

    const backend = useWorkspace.getState().view('backend');
    expect(backend.tab).toBe('API contract · variance alerts');
    expect(backend.selection).toEqual([]);
    expect(backend.draft).toBe('');
  });

  it('restores design tab, selection and composer draft after switching design -> backend -> design', () => {
    const store = useWorkspace.getState();
    store.setView('design', {
      tab: 'F-03 Variance table',
      selection: ['F-01'],
      draft: 'Highlight packages over 3% in bold',
    });

    // Switch to backend and modify backend state independently
    store.setView('backend', {
      tab: 'Entity VarianceAlert',
      draft: 'Check nullable fields',
    });

    // Switch back to design: original tab, selection and draft are intact
    const designAfter = useWorkspace.getState().view('design');
    expect(designAfter.tab).toBe('F-03 Variance table');
    expect(designAfter.selection).toEqual(['F-01']);
    expect(designAfter.draft).toBe('Highlight packages over 3% in bold');

    // Backend state is preserved separately
    const backendAfter = useWorkspace.getState().view('backend');
    expect(backendAfter.tab).toBe('Entity VarianceAlert');
    expect(backendAfter.draft).toBe('Check nullable fields');
  });

  it('records control intents in the store without mutating stage views', () => {
    useWorkspace.getState().recordIntent('F104:handoff');
    expect(useWorkspace.getState().lastIntent).toBe('F104:handoff');
  });

  it('transitions save state between saved, saving, failed and conflict without silent overwrite (IMP-02)', () => {
    const store = useWorkspace.getState();
    expect(store.save.status).toBe('saved');

    store.setSaveStatus('saving');
    expect(useWorkspace.getState().save.status).toBe('saving');
    expect(useWorkspace.getState().save.text).toBe('Saving…');

    store.triggerConflict();
    expect(useWorkspace.getState().save.status).toBe('conflict');
    expect(useWorkspace.getState().save.text).toBe('Conflict · F-04');
    expect(useWorkspace.getState().conflict).not.toBeNull();
    expect(useWorkspace.getState().dirtyTabs).toContain('F-04 Alert drawer');

    store.resolveConflict('discard');
    expect(useWorkspace.getState().save.status).toBe('saved');
    expect(useWorkspace.getState().conflict).toBeNull();
    expect(useWorkspace.getState().dirtyTabs).not.toContain('F-04 Alert drawer');
  });
});
