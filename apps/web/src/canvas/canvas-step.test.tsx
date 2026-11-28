import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  GAPB_GAPS,
  GAPC_BLOCKED,
  GAPC_FRAMES,
  GAPC_LOCKED_TICKETS,
  GAPC_PINS,
  GAPC_POLICY,
  GAPC_TOOLS,
  GAPC_UNTRUSTED,
} from '@spekin/sample';
import { CanvasStepWorkArea, canApproveCanvas } from './CanvasStepWorkArea';

describe('S21 Canvas step and sandboxed preview (IMP-61)', () => {
  it('blocks Setujui kanvas while any UI part has no component and no GAP register entry covers it', () => {
    const none = canApproveCanvas(GAPC_FRAMES, []);
    expect(none.allowed).toBe(false);
    expect(none.uncoveredFrameIds).toEqual(['F-04', 'F-05']);

    // Only F-04 covered by GAP-04; F-05 still uncovered.
    const partial = canApproveCanvas(
      GAPC_FRAMES,
      GAPB_GAPS.filter((g) => g.used.includes('F-04')),
    );
    expect(partial.allowed).toBe(false);
    expect(partial.uncoveredFrameIds).toEqual(['F-05']);

    const blockedHtml = renderToStaticMarkup(<CanvasStepWorkArea gaps={[]} />);
    expect(blockedHtml).toMatch(/aria-disabled="true"[^>]*>Setujui kanvas</);
  });

  it('unblocks Setujui kanvas when GAP register entries from @spekin/sample cover every frame with missing components', () => {
    const covered = canApproveCanvas(GAPC_FRAMES, GAPB_GAPS);
    expect(covered.allowed).toBe(true);
    expect(covered.uncoveredFrameIds).toEqual([]);

    const unblockedHtml = renderToStaticMarkup(<CanvasStepWorkArea />);
    expect(unblockedHtml).toContain('Setujui kanvas');
    expect(unblockedHtml).not.toMatch(/aria-disabled="true"[^>]*>Setujui kanvas</);
  });

  it('renders grid state matching S21 board content and data-feature ids', () => {
    const html = renderToStaticMarkup(<CanvasStepWorkArea initialState="grid" />);
    expect(html).not.toContain('data-todo');
    expect(html).not.toContain('data-later');
    expect(html).toContain('4 frames');
    expect(html).toContain('UI tanpa komponen · 3');
    expect(html).toContain('Frontend tickets locked');
    for (const f of GAPC_FRAMES) {
      expect(html).toContain(f.id);
      expect(html).toContain(f.title);
    }
    for (const t of GAPC_LOCKED_TICKETS) {
      expect(html).toContain(t);
    }
    for (const [name] of GAPC_TOOLS) {
      expect(html).toContain(name);
    }
    expect(html).toContain('Q-11');
    expect(html).toContain('data-feature="F491"');
    expect(html).toContain('data-feature="F496"');
    expect(html).toContain('data-feature="F497"');
    expect(html).toContain('data-feature="F498"');
    expect(html).toContain('data-feature="F499"');
  });

  it('renders detail state with pinned comments and component tags (F492)', () => {
    const html = renderToStaticMarkup(<CanvasStepWorkArea initialState="detail" />);
    expect(html).toContain('F-04');
    expect(html).toContain('Alert drawer');
    expect(html).toContain('r1 · 1440 × 900');
    expect(html).toContain('Pinned comments · 3');
    for (const [, who, , tx] of GAPC_PINS) {
      expect(html).toContain(who);
      expect(html).toContain(tx);
    }
    expect(html).toContain('Add pin');
    expect(html).toContain('Close button');
    expect(html).toContain('No component');
    expect(html).toContain('data-feature="F492"');
  });

  it('renders sandbox preview with opaque-origin iframe, policy list and blocked log (F493, F494)', () => {
    const html = renderToStaticMarkup(<CanvasStepWorkArea initialState="sandbox" />);
    expect(html).toContain('F-03 Variance table · prototype');
    expect(html).toContain('Sandboxed');
    expect(html).toContain('sandbox · opaque origin · no network · no cookies');
    expect(html).toContain('fixture.json');
    expect(html).toContain('Reload sandbox');
    expect(html).toContain('Fixture data only');
    expect(html).toContain('sandbox=""');
    expect(html).not.toContain('allow-same-origin');
    for (const [label] of GAPC_POLICY) {
      expect(html).toContain(label);
    }
    for (const [, , target] of GAPC_BLOCKED) {
      expect(html).toContain(target);
    }
    expect(html).toContain('data-feature="F493"');
    expect(html).toContain('data-feature="F494"');
  });

  it('renders untrusted reference text as quoted data, never executed (F495)', () => {
    const html = renderToStaticMarkup(<CanvasStepWorkArea initialState="untrusted" />);
    expect(html).toContain('Reference REF-03 · imported skill');
    expect(html).toContain('Untrusted source text');
    expect(html).toContain(GAPC_UNTRUSTED.src);
    expect(html).toContain('$PROJECT_SECRET');
    expect(html).toContain('Not run. Shown as source text.');
    expect(html).toContain('Not answered. Spekin sends secret names only.');
    expect(html).toContain('data-feature="F495"');
  });

  it('renders approve dialog and approved state with unlocked tickets and active hand-off (F496, F497, F498)', () => {
    const approveHtml = renderToStaticMarkup(<CanvasStepWorkArea initialState="approve" />);
    expect(approveHtml).toContain('role="dialog"');
    expect(approveHtml).toContain('Setujui kanvas for Inc. 2');
    expect(approveHtml).toContain('Proposal 0010');
    expect(approveHtml).toContain('Create approval proposal');

    const approvedHtml = renderToStaticMarkup(<CanvasStepWorkArea initialState="approved" />);
    expect(approvedHtml).toContain('Canvas approved.');
    expect(approvedHtml).toContain('All unlocked');
    expect(approvedHtml).toContain('Canvas approved 12:52');
    expect(approvedHtml).toContain('Frontend tickets unlocked');
    expect(approvedHtml).toContain('4 of 4');
    expect(approvedHtml).toContain('Planned in tickets');
    expect(approvedHtml).toContain('Open ticket board');
    expect(approvedHtml).not.toMatch(/aria-disabled="true"[^>]*>Kirim ke yravgbuilder</);
  });
});
