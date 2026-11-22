import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { PROJECT, STAGES, USAGE } from '@spekin/sample';
import { layoutTierForWidth } from './layoutTier';
import {
  applyFinding,
  buildMobileHandoffSnapshot,
  createInitialMobileState,
  dismissFinding,
  duplicateFrameAsDraft,
  moveFrame,
  ResponsiveProjectShell,
} from './ResponsiveProjectShell';
import { ProjectShell } from '../shell/ProjectShell';

const noop = () => {};

function renderResponsive(props: {
  tier: 'tablet' | 'phone';
  initialTab?: 'frames' | 'style' | 'review' | 'handoff';
  initialSheet?: 'none' | 'actions' | 'confirm' | 'ready' | 'stages' | 'filter' | 'propose';
  initialReviewPanel?: boolean;
}) {
  return renderToStaticMarkup(
    <ResponsiveProjectShell
      tier={props.tier}
      project={PROJECT}
      usage={USAGE}
      stages={STAGES}
      currentStage={STAGES[2]!}
      onSwitchStage={noop}
      initialTab={props.initialTab}
      initialSheet={props.initialSheet}
      initialReviewPanel={props.initialReviewPanel}
    />,
  );
}

describe('T01 Tablet and phone (IMP-20)', () => {
  it('maps viewport width to desktop, tablet and phone tiers without inspecting user agent', () => {
    expect(layoutTierForWidth(1440)).toBe('desktop');
    expect(layoutTierForWidth(1024)).toBe('desktop');
    expect(layoutTierForWidth(1023)).toBe('tablet');
    expect(layoutTierForWidth(820)).toBe('tablet');
    expect(layoutTierForWidth(768)).toBe('tablet');
    expect(layoutTierForWidth(767)).toBe('phone');
    expect(layoutTierForWidth(390)).toBe('phone');
  });

  it('keeps desktop ProjectShell at >= 1024 px untouched (data-screen="S35")', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/p/meranti-yard/design']}>
        <Routes>
          <Route path="/p/:project/:stage" element={<ProjectShell />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(html).toContain('data-screen="S35"');
    expect(html).toContain('sp-stagebar');
    expect(html).not.toContain('data-todo');
  });

  it('renders tablet board (tablet) and review panel replacing the list (tabreview) with no data-todo or board-only classes', () => {
    const tabletHtml = renderResponsive({ tier: 'tablet', initialTab: 'frames' });
    expect(tabletHtml).toContain('data-screen="T01"');
    expect(tabletHtml).toContain('Inc. 2 · Spec r14');
    expect(tabletHtml).not.toContain('Variance alerts');
    expect(tabletHtml).toContain('mod-rail');
    expect(tabletHtml).not.toContain('mod-pn');
    expect(tabletHtml).toContain('5 on this board');
    expect(tabletHtml).toContain('Canvas editing is on desktop. Review, compare and hand off work here.');
    expect(tabletHtml).toContain('Open context');
    expect(tabletHtml).toContain('Propose change');
    expect(tabletHtml).not.toContain('data-todo');
    expect(tabletHtml).not.toMatch(/class="[^"]*\bisnew\b/);

    const reviewHtml = renderResponsive({ tier: 'tablet', initialTab: 'review', initialReviewPanel: true });
    expect(reviewHtml).toContain('mod-pn');
    expect(reviewHtml).not.toContain('mod-rail');
    expect(reviewHtml).toContain('Finding 1 of 3');
    expect(reviewHtml).toContain('Original r6');
    expect(reviewHtml).toContain('Changed r7');
    expect(reviewHtml).toContain('Apply change');
    expect(reviewHtml).toContain('Dismiss');
    expect(reviewHtml).not.toContain('data-todo');
  });

  it('renders all three phone states (phlist, phreview, phhand) with sheets, touch targets and accepted-only handoff', () => {
    const phListHtml = renderResponsive({ tier: 'phone', initialTab: 'frames', initialSheet: 'actions' });
    expect(phListHtml).toContain('data-screen="T01"');
    expect(phListHtml).toContain('>Search frames<');
    expect(phListHtml).toContain('mod-tb');
    expect(phListHtml).toContain('Move earlier');
    expect(phListHtml).toContain('Duplicate as draft');
    expect(phListHtml).toContain('Compare r6 with r5');
    expect(phListHtml).toContain('Cancel');

    const phReviewHtml = renderResponsive({ tier: 'phone', initialTab: 'review', initialSheet: 'confirm' });
    expect(phReviewHtml).toContain('Review · 1 of 3');
    expect(phReviewHtml).toContain('Apply change to F-03?');
    expect(phReviewHtml).toContain('Baseline now');
    expect(phReviewHtml).toContain('Apply r7');

    const phHandHtml = renderResponsive({ tier: 'phone', initialTab: 'handoff', initialSheet: 'ready' });
    expect(phHandHtml).toContain('Only accepted revisions. No local agent runs.');
    expect(phHandHtml).toContain('Draft, not accepted');
    expect(phHandHtml).toContain('Pending alternatives');
    expect(phHandHtml).toContain('Bundle ready');
    expect(phHandHtml).toContain('HO-0007 · 2 frames · 4 files · 1.4 MB');
    expect(phHandHtml).toContain('Download bundle');
    expect(phHandHtml).not.toContain('data-todo');
  });

  it('supports non-drag reorder, draft duplication, confirm-gated apply, dismiss-not-pass, and pinned accepted-only snapshots', () => {
    const s0 = createInitialMobileState();
    // Move F-03 (index 1) earlier -> index 0
    const moved = moveFrame(s0.frames, 1, -1);
    expect(moved[0]?.[0]).toBe('F-03');
    expect(moved[1]?.[0]).toBe('F-01');

    // Duplicate as draft leaves accepted baseline untouched
    const duped = duplicateFrameAsDraft(s0.frames, 1);
    expect(duped.length).toBe(s0.frames.length + 1);
    expect(duped[1]?.[2]).toBe('r6');
    expect(duped[1]?.[3][1]).toBe('Accepted');
    expect(duped[2]?.[2]).toBe('d1');
    expect(duped[2]?.[3][1]).toBe('Draft');

    // Dismissing keeps baseline r6 and records dismissal (not a pass)
    const dismissed = dismissFinding(s0, 0);
    expect(dismissed.baselineRev).toBe('r6');
    expect(dismissed.findings[0]?.status).toBe('dismissed');

    // Confirming Apply moves baseline r6 -> r7
    const applied = applyFinding(s0, 0, true);
    expect(applied.baselineRev).toBe('r7');
    expect(applied.findings[0]?.status).toBe('applied');
    // Unconfirmed apply changes nothing
    const unconfirmed = applyFinding(s0, 0, false);
    expect(unconfirmed.baselineRev).toBe('r6');

    // Snapshot includes only accepted checked revisions and stays pinned
    const snap = buildMobileHandoffSnapshot(s0.bundlePick);
    expect(snap.frames.map((f) => f.id)).toEqual(['F-01', 'F-03']);
    expect(snap.excluded).toContain('F-04 Alert drawer');
    expect(snap.excluded).toContain('F-03 alternatives');
  });
});
