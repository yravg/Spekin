import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GAPA_KIT, GAPA_LOG, GAPA_NOBASIS, GAPA_OPEN } from '@spekin/sample';
import {
  DecisionLogTable,
  DecisionEntryInspector,
  DecisionSummaryInspector,
  OpenQuestionsTable,
  OpenQuestionsInspector,
  DecisionEmptyState,
  DecisionFilterBar,
  filterDecisionRows,
} from './DecisionLogViews';

const noop = () => {};

describe('S05 Decision log (IMP-56)', () => {
  it('renders the log state with all entries, Just written badge (F422) and filter counts (F421, F423)', () => {
    const html = renderToStaticMarkup(
      <>
        <DecisionFilterBar
          active="all"
          counts={{ all: 3, int: 3, plan: 0, kit: 0, open: 1 }}
          query=""
          onFilter={noop}
          onQueryChange={noop}
        />
        <DecisionLogTable rows={GAPA_LOG} selectedId={null} freshId="D-003" onSelect={noop} />
        <DecisionSummaryInspector openQuestion={GAPA_OPEN[0]!} activeTab="Summary" onSelectTab={noop} onShowOpen={noop} onMore={noop} />
      </>,
    );
    expect(html).toContain('data-feature="F421"');
    expect(html).toContain('data-feature="F422"');
    expect(html).toContain('data-feature="F423"');
    expect(html).toContain('Just written');
    for (const row of GAPA_LOG) {
      expect(html).toContain(row.id);
      expect(html).toContain(row.dec);
    }
    expect(html).toContain('Show open questions');
  });

  it('renders the entry detail inspector with alternatives, source note and append-only revise control (F424, F427)', () => {
    const html = renderToStaticMarkup(
      <DecisionEntryInspector
        entry={GAPA_LOG[1]!}
        isKit={false}
        activeTab="Entry"
        onSelectTab={noop}
        onOpenInChat={noop}
        onRevise={noop}
        onProposeKit={noop}
        onMore={noop}
      />,
    );
    expect(html).toContain('D-002 Appetite');
    expect(html).toContain('Edited recommendation');
    expect(html).toContain('Open in chat');
    expect(html).toContain('Revise this decision');
    expect(html).toContain('data-feature="F424"');
    expect(html).toContain('data-feature="F427"');
    expect(html).toContain('Append only');
  });

  it('renders the kit decision view with kit banner and propose-another-kit action (F426)', () => {
    const kitRow = { ...GAPA_KIT, field: 'Design kit' };
    const html = renderToStaticMarkup(
      <>
        <DecisionLogTable rows={[kitRow]} selectedId="D-004" freshId={null} onSelect={noop} />
        <DecisionEntryInspector
          entry={kitRow}
          isKit
          activeTab="Entry"
          onSelectTab={noop}
          onOpenInChat={noop}
          onRevise={noop}
          onProposeKit={noop}
          onMore={noop}
        />
      </>,
    );
    expect(html).toContain('D-004 Design kit');
    expect(html).toContain('yravg UI (default)');
    expect(html).toContain('Propose another kit');
    expect(html).toContain('data-feature="F426"');
  });

  it('renders the open questions table and tanpa dasar inspector card (F425, F429)', () => {
    const html = renderToStaticMarkup(
      <>
        <OpenQuestionsTable rows={GAPA_OPEN} onOpenId={noop} onAnswerNow={noop} />
        <OpenQuestionsInspector
          noBasis={GAPA_NOBASIS}
          activeTab="Open"
          onSelectTab={noop}
          onConfirmNoBasis={noop}
          onRemoveNoBasis={noop}
          onMore={noop}
        />
      </>,
    );
    expect(html).toContain('OQ-01');
    expect(html).toContain('Answer now');
    expect(html).toContain('data-feature="F425"');
    expect(html).toContain('Tanpa dasar');
    expect(html).toContain(GAPA_NOBASIS.text);
    expect(html).toContain('Confirm as decision');
    expect(html).toContain('data-feature="F429"');
  });

  it('renders the empty state before the interview with Start the interview CTA (F428)', () => {
    const html = renderToStaticMarkup(<DecisionEmptyState onStartInterview={noop} />);
    expect(html).toContain('No decisions yet');
    expect(html).toContain('Start the interview');
    expect(html).toContain('data-feature="F428"');
  });

  it('filters decision rows by search query across question, decision and id', () => {
    expect(filterDecisionRows(GAPA_LOG, '3%')).toHaveLength(1);
    expect(filterDecisionRows(GAPA_LOG, '3%')[0]?.id).toBe('D-003');
    expect(filterDecisionRows(GAPA_LOG, 'weeks')).toHaveLength(1);
    expect(filterDecisionRows(GAPA_LOG, '')).toHaveLength(3);
  });
});
