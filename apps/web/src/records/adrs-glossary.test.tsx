import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  GAPB_ADR3,
  GAPB_ADRS,
  GAPB_PROPOSAL,
  GAPB_TERMS,
} from '@spekin/sample';
import {
  AdrsGlossaryWorkArea,
  RECORDS_VIEWS,
  isRecordsView,
  nextViewFromPrompt,
  type RecordsView,
} from './AdrsGlossaryWorkArea';

const render = (view: RecordsView) =>
  renderToStaticMarkup(<AdrsGlossaryWorkArea view={view} onView={() => {}} onIntent={() => {}} />);

describe('S19 ADRs and glossary (IMP-59)', () => {
  it('renders all five drawn views with their exact feature ids and domain text', () => {
    expect(RECORDS_VIEWS).toEqual(['glossary', 'adrs', 'propose', 'contradiction', 'stale']);
    expect(isRecordsView('glossary')).toBe(true);
    expect(isRecordsView('adrs')).toBe(true);
    expect(isRecordsView('propose')).toBe(true);
    expect(isRecordsView('contradiction')).toBe(true);
    expect(isRecordsView('stale')).toBe(true);
    expect(isRecordsView('unknown')).toBe(false);

    const expected: Record<RecordsView, { text: string[]; features: string[] }> = {
      glossary: {
        text: [
          '5 terms · accepted r14',
          'Bahasa and English, domain meaning only',
          'Forecast · Perkiraan',
          'GLO-02 · meaning only, no field names or code',
          'Propose alias',
          'Is forecast the same as EAC?',
        ],
        features: ['F461', 'F462', 'F465', 'F467'],
      },
      adrs: {
        text: [
          'Architecture decision records',
          'Only hard-to-reverse trade-offs · 5 records',
          'ADR-003',
          'Accepted r12',
          GAPB_ADR3.ctx,
          GAPB_ADR3.decision,
          GAPB_ADR3.cons,
          'Supersession',
          'ADR-002 · Superseded',
          'ADR-006 · Accepted r11',
          'The earlier record stays readable.',
        ],
        features: ['F461', 'F463', 'F464', 'F465', 'F467'],
      },
      propose: {
        text: [
          'Proposal P-33',
          'Base r14',
          '2 hunks · from the chat, nothing is written yet',
          GAPB_PROPOSAL.src.replaceAll('"', '&quot;'),
          'GLO-02 Forecast · aliases',
          'Will accept',
          'ADR-005 · new record, Proposed',
          'Left out',
          'Routine choice, no ADR',
          'column order in the variance table',
          'Easy to reverse and not surprising, so Spekin did not ask for a record.',
          'Open P-33',
        ],
        features: ['F461', 'F463', 'F465', 'F466', 'F467', 'F469'],
      },
      contradiction: {
        text: [
          '1 contradiction',
          'Checked against 5 terms and 5 ADRs',
          'Contradiction with GLO-05 Threshold',
          'Keep GLO-05',
          'Propose a new term',
          'Propose a change to GLO-05',
        ],
        features: ['F461', 'F463', 'F465', 'F467'],
      },
      stale: {
        text: [
          'Proposal P-34',
          'Stale',
          'ADR-007 · base r14 · spec is now r15',
          'Accept is blocked until you rebase',
          'Rebase on r15',
          'Discard',
          'The earlier record is still readable',
          'ADR-007 proposed',
          'No code is renamed by any of these records.',
        ],
        features: ['F461', 'F463', 'F464', 'F465', 'F467', 'F468'],
      },
    };

    for (const view of RECORDS_VIEWS) {
      const html = render(view);
      expect(html).not.toContain('data-todo');
      for (const text of expected[view].text) {
        expect(html).toContain(text);
      }
      for (const f of expected[view].features) {
        expect(html).toContain('data-feature="' + f + '"');
      }
    }
  });

  it('draws every glossary term and ADR record from the sample dataset', () => {
    const glo = render('glossary');
    expect(GAPB_TERMS.length).toBe(5);
    for (const t of GAPB_TERMS) {
      expect(glo).toContain(t.term);
      expect(glo).toContain(t.id);
      expect(glo).toContain(t.al);
      expect(glo).toContain(t.ctx);
      expect(glo).toContain(t.def);
      expect(glo).toContain(t.rev);
    }

    const adrs = render('adrs');
    expect(GAPB_ADRS.length).toBe(5);
    for (const a of GAPB_ADRS) {
      expect(adrs).toContain(a.id);
      expect(adrs).toContain(a.t);
      expect(adrs).toContain(a.st[1]);
    }
  });

  it('keeps Accept disabled in stale state and routes chat prompts cleanly', () => {
    const stale = render('stale');
    expect(stale).toContain('disabled="" aria-disabled="true" data-does="Accept is unavailable while the base is r14 and the spec is r15; rebase first" data-feature="F468">Accept');

    expect(nextViewFromPrompt('Is forecast the same as EAC?')).toBe('propose');
    expect(nextViewFromPrompt('Let\'s say "threshold" means the most rows we show.')).toBe('contradiction');
    expect(nextViewFromPrompt('Accept the ADR for per-package thresholds.')).toBe('stale');
    expect(nextViewFromPrompt('Why integer minor units?')).toBe('adrs');
  });
});
