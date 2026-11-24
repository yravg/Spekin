import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ReviewReportWorkArea,
  REPORT_VIEWS,
  buildReportMarkdown,
  type ReportView,
} from './ReviewReportWorkArea';

const render = (view: ReportView) =>
  renderToStaticMarkup(
    <ReviewReportWorkArea
      initialView={view}
      onShellOverride={() => {}}
      onOpenReview={() => {}}
    />,
  );

describe('S18 Verification and review report (IMP-64)', () => {
  it('renders all five drawn states from GAPD_REVIEW without stand-ins', () => {
    expect(REPORT_VIEWS).toEqual(['report', 'none', 'split', 'risk', 'prop']);
    const expected: Record<ReportView, string[]> = {
      report: [
        'Review of build 0412 against spec r14',
        'Unverified continuation packet.',
        'Evidence examined',
        'Missing inputs',
        'Spec coverage',
        'Standards conformance',
        'FND-01',
        'Propose remaining tickets',
      ],
      none: [
        'No inputs to review.',
        'Connect repository',
        'Not assessed',
        'No findings, and that is not a pass',
      ],
      split: [
        'Re-review after the fixes · build 0419 · independent review RUN-0431',
        'Met · 5 of 5',
        'Failed · 1 of 4',
        'Not accepted.',
        'FND-02 · SD-05',
        'Not verified',
      ],
      risk: [
        'Risk review is separate from both axes. It lists what a person must decide.',
        'Authorization and security',
        'Monetary impact',
        'Required human decisions',
        'Record decision',
        'Ask owner',
      ],
      prop: [
        'Findings with proposed tickets',
        'Proposed tickets',
        'T-231',
        'T-232',
        'T-233',
        'FND-03 has no ticket: the missing item is a run, not code.',
      ],
    };

    for (const view of REPORT_VIEWS) {
      const html = render(view);
      expect(html).not.toContain('data-todo');
      expect(html.toLowerCase()).not.toContain('not built yet');
      for (const text of expected[view]) {
        expect(html).toContain(text);
      }
    }
  });

  it('shows evidence examined (F501) and missing inputs (F502) before findings', () => {
    const html = render('report');
    const evIdx = html.indexOf('Evidence examined');
    const missIdx = html.indexOf('Missing inputs');
    const fndIdx = html.indexOf('FND-01');
    expect(evIdx).toBeGreaterThan(-1);
    expect(missIdx).toBeGreaterThan(evIdx);
    expect(fndIdx).toBeGreaterThan(missIdx);
    expect(html).toContain('data-feature="F501"');
    expect(html).toContain('data-feature="F502"');
  });

  it('keeps spec coverage (F503) and standards conformance (F504) separate and unverified on split', () => {
    const html = render('split');
    expect(html).toContain('data-feature="F503"');
    expect(html).toContain('data-feature="F504"');
    expect(html).toContain('data-feature="F505"');
    expect(html).toContain('The spec axis passed and the standards axis failed. The axes are not averaged.');
    expect(html).toContain('A ticket proposal never marks a requirement verified.');
  });

  it('lists six risk dimensions and three open human decisions without deciding for a person (F506)', () => {
    const html = render('risk');
    expect(html).toContain('data-feature="F506"');
    expect(html).toContain('Authorization and security');
    expect(html).toContain('Reversibility');
    expect(html).toContain('Data and tenant exposure');
    expect(html).toContain('External effects');
    expect(html).toContain('Migration');
    expect(html).toContain('Monetary impact');
    expect(html).toContain('3 open');
    expect(html).toContain('Decided<span>0</span>');
  });

  it('exports report as unverified continuation packet with secrets redacted (F508) and enforces independent review scope (F509)', () => {
    const html = render('report');
    expect(html).toContain('data-feature="F508"');
    expect(html).toContain('independent review: only the accepted spec, the build and the standards were given');

    const md = buildReportMarkdown('DATABASE_URL=postgres://user:supersecret@db/prod');
    expect(md).toContain('Unverified continuation packet');
    expect(md).toContain('Independent review run RUN-0418');
    expect(md).toContain('DATABASE_URL=[REDACTED]');
    expect(md).not.toContain('supersecret');
  });

  it('proposes remaining tickets as proposals only (F507)', () => {
    const html = render('prop');
    expect(html).toContain('data-feature="F507"');
    expect(html).toContain('3 selected');
    expect(html).toContain('Proposal');
  });
});
