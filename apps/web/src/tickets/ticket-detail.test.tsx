import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GAPC_T05 } from '@spekin/sample';
import {
  TicketDetailWorkArea,
  assembleTicketPrompt,
  resolveTicketDetail,
  type TicketDetailMode,
} from './TicketDetailWorkArea';

const render = (ticketId: string, initialMode?: TicketDetailMode) =>
  renderToStaticMarkup(
    <TicketDetailWorkArea
      ticketId={ticketId}
      initialMode={initialMode}
      onBackToBoard={() => {}}
      onSelectTicket={() => {}}
      onIntent={() => {}}
    />,
  );

describe('S16 Ticket detail and criteria (IMP-63)', () => {
  it('assembles one prompt containing component slug, install line, DESIGN.md rules, criteria and scope (F484, F485, F486)', () => {
    const t05 = resolveTicketDetail('T-05');
    const text = assembleTicketPrompt(t05);
    expect(text).toContain(GAPC_T05.id);
    expect(text).toContain(GAPC_T05.comp!.slug);
    expect(text).toContain(GAPC_T05.comp!.install);
    for (const rule of GAPC_T05.rules) expect(text).toContain(rule);
    for (const [acId] of GAPC_T05.criteria) expect(text).toContain(acId);
    expect(text).toContain(GAPC_T05.owns);
  });

  it('renders the five drawn states with exact feature ids F481-F489 and no stand-in text', () => {
    const detail = render('T-05', 'detail');
    expect(detail).toContain('T-05 · Variance table flags packages over 3%');
    expect(detail).toContain('Locked · canvas not approved');
    expect(detail).toContain('blocks/data-table');
    expect(detail).toContain('npx yravg-ui add blocks/data-table');
    expect(detail).toContain('Evidence in S18');
    expect(detail).toContain('Fresh · r2');
    for (const fid of ['F481', 'F482', 'F483', 'F484', 'F485', 'F486', 'F487', 'F489']) {
      expect(detail).toContain(`data-feature="${fid}"`);
    }

    const copied = render('T-05', 'copied');
    expect(copied).toContain('Copied. Included: component slug, install line, 3 DESIGN.md r3 rules.');
    expect(copied).toContain('class="mark"');

    const pulled = render('T-05', 'pulled');
    expect(pulled).toContain('Unlocked · canvas approved');
    expect(pulled).toContain('Pulled by an agent');
    expect(pulled).toContain('a41c07e9 · same as Copy prompt');
    expect(pulled).toContain('Approved');

    const nocomp = render('T-08', 'detail');
    expect(nocomp).toContain('T-08 · Drill down from package to cost lines');
    expect(nocomp).toContain('UI tanpa komponen');
    expect(nocomp).toContain('Pick component');
    expect(nocomp).toContain('Incomplete');
    expect(nocomp).toContain('aria-disabled="true"');
    expect(nocomp).toContain('data-feature="F488"');

    const stale = render('T-05', 'stale');
    expect(stale).toContain('DESIGN.md changed.');
    expect(stale).toContain('Stale · DESIGN.md r4');
    expect(stale).toContain('row 40 px');
    expect(stale).toContain('Show the change');
    expect(stale).toContain('Rebuild prompt');
    expect(stale).toContain('aria-disabled="true"');
  });

  it('marks incomplete prompt non-copyable when a UI ticket has no component (F488)', () => {
    const t08 = resolveTicketDetail('T-08');
    expect(t08.comp).toBeNull();
    const nocomp = render('T-08', 'detail');
    expect(nocomp).toContain('missing: pick one slug or GAP id');
    expect(nocomp).toContain('not added: no component');
    expect(nocomp).toContain('gpc-pr off');
    expect(nocomp).toContain('gpc-inc miss');
  });
});
