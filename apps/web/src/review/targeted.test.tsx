import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { REVIEW_ALSO, REVIEW_PART, REVIEW_VARIANTS } from '@spekin/sample';
import {
  createTargetedProposal,
  TargetedChangeWorkArea,
} from './TargetedChangeWorkArea';

describe('S32 Targeted change (IMP-14)', () => {
  it('creates a draft proposal and never mutates the accepted frame directly', () => {
    const acceptedFrame = { id: 'F-03', rev: 'r6', status: 'accepted' as const, forecast: '6.28' };
    const before = JSON.stringify(acceptedFrame);
    const proposal = createTargetedProposal(acceptedFrame, REVIEW_PART.cell.ask, REVIEW_PART.cell.after);
    expect(proposal.status).toBe('draft');
    expect(proposal.baseRev).toBe('r6');
    expect(proposal.draftRev).toBe('r7');
    expect(proposal.accepted).toBe(false);
    expect(proposal.relatedCount).toBe(REVIEW_ALSO.length);
    expect(JSON.stringify(acceptedFrame)).toBe(before);
  });

  it('DPAI & states: targeted-edit mode is visible (Ask on select pressed), focusable tabs/sidebar, and all 6 states render without data-todo', () => {
    const selectHtml = renderToStaticMarkup(<TargetedChangeWorkArea initialState="select" />);
    expect(selectHtml).not.toContain('data-todo');
    expect(selectHtml).toContain('aria-pressed="true"');
    expect(selectHtml).toContain('Ask on select');
    expect(selectHtml).toContain('role="tablist"');
    expect(selectHtml).toContain('role="dialog"');
    expect(selectHtml).toContain('What should change about this element?');
    expect(selectHtml.match(/data-later=/g)?.length).toBe(1);

    const workingHtml = renderToStaticMarkup(<TargetedChangeWorkArea initialState="working" />);
    expect(workingHtml).toContain('Changing 1 part · 6 s');
    expect(workingHtml).toContain('Part change');

    const appliedHtml = renderToStaticMarkup(<TargetedChangeWorkArea initialState="applied" />);
    expect(appliedHtml).toContain('Applied in place');
    expect(appliedHtml).toContain('Draft r7 · 4 related values changed');
    expect(appliedHtml).toContain('Not isolated.');

    const compareHtml = renderToStaticMarkup(<TargetedChangeWorkArea initialState="compare" />);
    expect(compareHtml).toContain('5 values differ');
    expect(compareHtml).toContain('With your change');

    const variationsHtml = renderToStaticMarkup(<TargetedChangeWorkArea initialState="variations" />);
    expect(variationsHtml).toContain('Variation 1 of 3');
    for (const v of REVIEW_VARIANTS) expect(variationsHtml).toContain(v.label);

    const clipHtml = renderToStaticMarkup(<TargetedChangeWorkArea initialState="clip" />);
    expect(clipHtml).toContain('Clip ' + REVIEW_PART.pill.size);
    expect(clipHtml).toContain('Text does not fit the clip');
  });
});

describe('S32 parity (IMP-48): F231, F234, F235', () => {
  it('F231: "Also changed" lists every related value with its before and after', () => {
    const appliedHtml = renderToStaticMarkup(<TargetedChangeWorkArea initialState="applied" />);
    expect(appliedHtml).toContain('data-feature="F231"');
    expect(appliedHtml).toContain('Also changed');
    for (const a of REVIEW_ALSO) {
      expect(appliedHtml).toContain(a.from);
      expect(appliedHtml).toContain(a.to);
    }
    expect(appliedHtml).toContain('Not isolated.');
  });

  it('F234: the part inspector has a keyboard-pickable parts list (Enter selects)', () => {
    const selectHtml = renderToStaticMarkup(<TargetedChangeWorkArea initialState="select" />);
    expect(selectHtml).toContain('data-feature="F234"');
    expect(selectHtml).toContain('Parts in this frame');
    expect(selectHtml).toContain('Tab into the frame');
    // every part row is keyboard reachable and says what picking it does
    expect(selectHtml).toContain('tabindex="0"');
    expect((selectHtml.match(/data-does="Selects the /g) ?? []).length).toBe(6);
  });

  it('F235: credit estimate and model source are shown before Send, scoped to the part', () => {
    const selectHtml = renderToStaticMarkup(<TargetedChangeWorkArea initialState="select" />);
    expect(selectHtml).toContain('data-feature="F235"');
    expect(selectHtml).toContain('≈ 4 to 8 cr');
    expect(selectHtml).toContain('Sonnet 5.5');
    // the popover is scoped to the part, not the whole board
    expect(selectHtml).toContain('Change the ');
  });
});
