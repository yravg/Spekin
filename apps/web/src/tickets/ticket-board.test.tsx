import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  TicketBoardBody,
  TicketChatMessages,
  canReorderTicket,
  checkTicketGraph,
  countUiWithoutComponent,
  setPrimaryComponent,
} from './TicketBoardWorkArea';
import { gapCSample } from '../data/source';

const noop = () => {};
const { lanes, tickets, components, lockedIds } = gapCSample();

describe('S15 Ticket board (IMP-62)', () => {
  it('renders trust-ladder order with all 8 lanes and 11 tickets (F471, F472)', () => {
    const html = renderToStaticMarkup(
      <TicketBoardBody
        mode="ladder"
        lanes={lanes}
        tickets={tickets}
        components={components}
        lockedIds={lockedIds}
        selectedId={null}
        foldedLanes={{}}
        popover={null}
        filterMissingComp={false}
        filterLocked={false}
        onSelectTicket={noop}
        onToggleLane={noop}
        onOpenCompPicker={noop}
        onPickComponent={noop}
        onSaveComponent={noop}
        onOpenStageEditor={noop}
        onRemoveStage={noop}
        onAddStage={noop}
        onSaveStages={noop}
        onHoverLocked={noop}
        onOpenCanvasStep={noop}
        onUseReviewedSequence={noop}
        onProposeTickets={noop}
        onWriteByHand={noop}
        onClosePopover={noop}
      />,
    );
    for (const lane of lanes) expect(html).toContain(lane.name);
    for (const t of tickets) {
      expect(html).toContain(t.id);
      expect(html).toContain(t.title.replace(/"/g, '&quot;'));
    }
    expect(html.indexOf('Benchmark before')).toBeLessThan(html.indexOf('Vertical slices'));
    expect(html.indexOf('Vertical slices')).toBeLessThan(html.indexOf('Benchmark after'));
    expect(canReorderTicket(tickets[0])).toBe(false);
    expect(canReorderTicket(tickets[tickets.length - 1])).toBe(false);
    expect(canReorderTicket(tickets[4])).toBe(true);
    expect(html).not.toContain('data-todo');
    expect(html.toLowerCase()).not.toContain('not built yet');
  });

  it('counts UI tanpa komponen and enforces exactly one primary component per UI ticket (F473)', () => {
    expect(countUiWithoutComponent(tickets)).toBe(1);
    const updated = setPrimaryComponent(tickets, 'T-08', 'GAP-30');
    expect(countUiWithoutComponent(updated)).toBe(0);
    expect(updated.find((t) => t.id === 'T-08')?.comp).toBe('GAP-30');
    const replaced = setPrimaryComponent(updated, 'T-08', 'blocks/data-table');
    expect(replaced.find((t) => t.id === 'T-08')?.comp).toBe('blocks/data-table');

    const html = renderToStaticMarkup(
      <TicketBoardBody
        mode="ladder"
        lanes={lanes}
        tickets={tickets}
        components={components}
        lockedIds={lockedIds}
        selectedId="T-08"
        foldedLanes={{}}
        popover={{ kind: 'comp', ticketId: 'T-08', draftComp: 'GAP-30' }}
        filterMissingComp={false}
        filterLocked={false}
        onSelectTicket={noop}
        onToggleLane={noop}
        onOpenCompPicker={noop}
        onPickComponent={noop}
        onSaveComponent={noop}
        onOpenStageEditor={noop}
        onRemoveStage={noop}
        onAddStage={noop}
        onSaveStages={noop}
        onHoverLocked={noop}
        onOpenCanvasStep={noop}
        onUseReviewedSequence={noop}
        onProposeTickets={noop}
        onWriteByHand={noop}
        onClosePopover={noop}
      />,
    );
    expect(html).toContain('Primary component for T-08');
    expect(html).toContain('GAP-30');
    expect(html).toContain('Set component');
  });

  it('renders task graph with conflict check and expand/migrate/contract card (F474, F475)', () => {
    const checks = checkTicketGraph(tickets);
    expect(checks.hasCycle).toBe(false);
    expect(checks.missingBlockers).toEqual([]);
    expect(checks.conflicts).toEqual([{ file: 'src/variance/state.ts', tickets: ['T-05', 'T-06'] }]);

    const html = renderToStaticMarkup(
      <TicketBoardBody
        mode="graph"
        lanes={lanes}
        tickets={tickets}
        components={components}
        lockedIds={lockedIds}
        selectedId={null}
        foldedLanes={{}}
        popover={null}
        filterMissingComp={false}
        filterLocked={false}
        onSelectTicket={noop}
        onToggleLane={noop}
        onOpenCompPicker={noop}
        onPickComponent={noop}
        onSaveComponent={noop}
        onOpenStageEditor={noop}
        onRemoveStage={noop}
        onAddStage={noop}
        onSaveStages={noop}
        onHoverLocked={noop}
        onOpenCanvasStep={noop}
        onUseReviewedSequence={noop}
        onProposeTickets={noop}
        onWriteByHand={noop}
        onClosePopover={noop}
      />,
    );
    expect(html).toContain('Graph check');
    expect(html).toContain('T-05 and T-06 both own');
    expect(html).toContain('No cycle in 11 tickets');
    expect(html).toContain('T-07 touches the alerts table: expand, migrate, contract');
    expect(html).toContain('Use a reviewed sequence instead');
    expect(html).toContain('Parallel budget 2 · 2 of 2 slots ready');
  });

  it('renders stage labels editor popover without altering blockers (F476)', () => {
    const html = renderToStaticMarkup(
      <TicketBoardBody
        mode="ladder"
        lanes={lanes}
        tickets={tickets}
        components={components}
        lockedIds={lockedIds}
        selectedId="T-05"
        foldedLanes={{}}
        popover={{ kind: 'stages', ticketId: 'T-05', draftStages: ['Design', 'Frontend', 'Testing'] }}
        filterMissingComp={false}
        filterLocked={false}
        onSelectTicket={noop}
        onToggleLane={noop}
        onOpenCompPicker={noop}
        onPickComponent={noop}
        onSaveComponent={noop}
        onOpenStageEditor={noop}
        onRemoveStage={noop}
        onAddStage={noop}
        onSaveStages={noop}
        onHoverLocked={noop}
        onOpenCanvasStep={noop}
        onUseReviewedSequence={noop}
        onProposeTickets={noop}
        onWriteByHand={noop}
        onClosePopover={noop}
      />,
    );
    expect(html).toContain('Stage labels for T-05');
    expect(html).toContain('Blockers stay:');
    expect(html).toContain('Save labels');
  });

  it('renders locked popover for frontend tickets while keeping planning/test tickets editable (F477)', () => {
    const html = renderToStaticMarkup(
      <TicketBoardBody
        mode="ladder"
        lanes={lanes}
        tickets={tickets}
        components={components}
        lockedIds={lockedIds}
        selectedId="T-05"
        foldedLanes={{}}
        popover={{ kind: 'locked', ticketId: 'T-05' }}
        filterMissingComp={false}
        filterLocked={false}
        onSelectTicket={noop}
        onToggleLane={noop}
        onOpenCompPicker={noop}
        onPickComponent={noop}
        onSaveComponent={noop}
        onOpenStageEditor={noop}
        onRemoveStage={noop}
        onAddStage={noop}
        onSaveStages={noop}
        onHoverLocked={noop}
        onOpenCanvasStep={noop}
        onUseReviewedSequence={noop}
        onProposeTickets={noop}
        onWriteByHand={noop}
        onClosePopover={noop}
      />,
    );
    expect(html).toContain('T-05 is locked');
    expect(html).toContain('Open canvas step (S21)');
    expect(html).toContain('Planning, test and benchmark tickets stay editable.');
  });

  it('renders empty state and planning chat proposal card (F478, F479)', () => {
    const emptyHtml = renderToStaticMarkup(
      <TicketBoardBody
        mode="empty"
        lanes={lanes}
        tickets={[]}
        components={components}
        lockedIds={lockedIds}
        selectedId={null}
        foldedLanes={{}}
        popover={null}
        filterMissingComp={false}
        filterLocked={false}
        onSelectTicket={noop}
        onToggleLane={noop}
        onOpenCompPicker={noop}
        onPickComponent={noop}
        onSaveComponent={noop}
        onOpenStageEditor={noop}
        onRemoveStage={noop}
        onAddStage={noop}
        onSaveStages={noop}
        onHoverLocked={noop}
        onOpenCanvasStep={noop}
        onUseReviewedSequence={noop}
        onProposeTickets={noop}
        onWriteByHand={noop}
        onClosePopover={noop}
      />,
    );
    expect(emptyHtml).toContain('No tickets for Inc. 2 yet');
    expect(emptyHtml).toContain('Propose tickets');
    expect(emptyHtml).toContain('Write tickets by hand');

    const chatHtml = renderToStaticMarkup(<TicketChatMessages onReviewProposal={noop} />);
    expect(chatHtml).toContain('Order the tickets for Inc. 2 so cheap checks come first.');
    expect(chatHtml).toContain('Proposal 0009');
    expect(chatHtml).toContain('Review');
  });
});
