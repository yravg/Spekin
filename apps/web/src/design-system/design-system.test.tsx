import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  KitView,
  TokensView,
  GapDetailView,
  GapRegisterView,
  ReuseReviewView,
  ReusePolicyView,
  filterGapRegister,
  routeDesignSystemPrompt,
} from './DesignSystemViews';

const noop = () => {};

describe('S14 Design system: kit and GAP register (IMP-60)', () => {
  it('renders kit state with chosen kit decision, component picks and F451', () => {
    const html = renderToStaticMarkup(
      <KitView onChangeKit={noop} onOpenGap={noop} />,
    );
    expect(html).toContain('Design system');
    expect(html).toContain('yravg UI r3');
    expect(html).toContain('DESIGN.md r3');
    expect(html).toContain('1 GAP open');
    expect(html).toContain('data-feature="F451"');
    expect(html).toContain('D-15 Kit decision');
    expect(html).toContain('components/data-table');
    expect(html).toContain('components/flow-diagram');
    expect(html).toContain('GAP-01');
  });

  it('renders tokens state with DESIGN.md r3 tokens and F459 edit proposal control', () => {
    const html = renderToStaticMarkup(<TokensView onEditToken={noop} />);
    expect(html).toContain('DESIGN.md and tokens');
    expect(html).toContain('Accepted r3');
    expect(html).toContain('data-feature="F459"');
    expect(html).toContain('--accent');
    expect(html).toContain('--warn');
    expect(html).toContain('--danger');
    expect(html).toContain('Edit token');
  });

  it('renders gap detail state with GAP-01, closest item (F453) and ticket component_ref (F455)', () => {
    const html = renderToStaticMarkup(
      <GapDetailView
        onDraftKitProposal={noop}
        onOpenFrame={noop}
        onOpenInKit={noop}
        onUseClosest={noop}
      />,
    );
    expect(html).toContain('GAP-01 Variance bridge chart');
    expect(html).toContain('data-feature="F452"');
    expect(html).toContain('data-feature="F453"');
    expect(html).toContain('data-feature="F455"');
    expect(html).toContain('components/flow-diagram');
    expect(html).toContain('T-218');
    expect(html).toContain('component_ref');
  });

  it('renders gap register state and filters entries by status (F454)', () => {
    expect(filterGapRegister('all').length).toBe(4);
    expect(filterGapRegister('open').length).toBe(2);
    expect(filterGapRegister('proposal').length).toBe(1);
    expect(filterGapRegister('closed').length).toBe(1);

    const allHtml = renderToStaticMarkup(
      <GapRegisterView statusFilter="all" onFilterChange={noop} />,
    );
    expect(allHtml).toContain('GAP register');
    expect(allHtml).toContain('data-feature="F454"');
    expect(allHtml).toContain('GAP-01');
    expect(allHtml).toContain('GAP-04');
    expect(allHtml).toContain('Closed by kit r3');

    const openHtml = renderToStaticMarkup(
      <GapRegisterView statusFilter="open" onFilterChange={noop} />,
    );
    expect(openHtml).toContain('GAP-01');
    expect(openHtml).toContain('GAP-02');
    expect(openHtml).not.toContain('GAP-04');
  });

  it('renders reuse review state with per-file provenance (F456) and existing-first card (F458)', () => {
    const html = renderToStaticMarkup(
      <ReuseReviewView onUseDateRange={noop} onReviewSource={noop} />,
    );
    expect(html).toContain('Reuse review');
    expect(html).toContain('Proposal P-35');
    expect(html).toContain('data-feature="F456"');
    expect(html).toContain('data-feature="F458"');
    expect(html).toContain('StatusPill.tsx');
    expect(html).toContain('RevealBlock.tsx');
    expect(html).toContain('Blocked');
    expect(html).toContain('components/date-range');
  });

  it('renders policy state with no auto-refactor rule (F457) and offered alternatives (F458)', () => {
    const html = renderToStaticMarkup(<ReusePolicyView onReviewInventory={noop} />);
    expect(html).toContain('Codebase and reference reuse');
    expect(html).toContain('Never done automatically');
    expect(html).toContain('Offered instead');
    expect(html).toContain('data-feature="F457"');
    expect(html).toContain('data-feature="F458"');
    expect(html).toContain('Proposal P-36');
    expect(html).toContain('Review on S08');
  });

  it('routes design-system chat prompts to the matching S14 state', () => {
    expect(routeDesignSystemPrompt('F-05 needs a waterfall of package variances.')).toBe('gap');
    expect(routeDesignSystemPrompt('Can we reuse the pill and diff code from the reference?')).toBe('reuse');
    expect(routeDesignSystemPrompt('Refactor the whole repo to use the kit.')).toBe('policy');
    expect(routeDesignSystemPrompt('List every GAP and what is closest.')).toBe('register');
    expect(routeDesignSystemPrompt('Is --warn too light on the flag?')).toBe('tokens');
  });
});
