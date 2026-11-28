import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GAPA_PITCH, GAPA_SLICES } from '@spekin/sample';
import {
  PitchDocView,
  PitchInspector,
  PitchBanner,
  PitchDepthBar,
  PitchChatMessages,
} from './PitchViews';

const noop = () => {};

describe('S06 Pitch (Simple) (IMP-57)', () => {
  it('renders the proposal state with all 5 pitch fields, diff tint, source chips, Tanpa dasar actions, and decision inbox', () => {
    const banner = renderToStaticMarkup(
      <PitchBanner state="proposal" onEdit={noop} onAskChanges={noop} onAcceptPitch={noop} onEditSlices={noop} onRejectBreakdown={noop} onAcceptBreakdown={noop} />,
    );
    const bar = renderToStaticMarkup(<PitchDepthBar depth="Simple" ticketCount={0} onDepth={noop} />);
    const doc = renderToStaticMarkup(
      <PitchDocView state="proposal" pitch={GAPA_PITCH} slices={GAPA_SLICES} onOpenSource={noop} onConfirmNoBasis={noop} onBackToInterview={noop} />,
    );
    const insp = renderToStaticMarkup(
      <PitchInspector
        state="proposal"
        activeTab="Inbox"
        onSelectTab={noop}
        onMore={noop}
        onReviewPitch={noop}
        onAnswerOq={noop}
        onConfirmNoBasis={noop}
        onLanjutKeDetail={noop}
        onReviewBreakdown={noop}
        onReviewSpec={noop}
        onOpenTickets={noop}
      />,
    );

    expect(banner).toContain('Proposal.');
    expect(banner).toContain('Accept pitch');
    expect(banner).toContain('data-feature="F432"');
    expect(bar).toContain('Tickets 0');
    expect(bar).toContain('data-feature="F434"');
    expect(doc).toContain('Proposal r1');
    expect(doc).toContain('gpa-pf add');
    expect(doc).toContain('Tanpa dasar');
    expect(doc).toContain('data-feature="F431"');
    expect(doc).toContain('data-feature="F439"');
    for (const [name] of GAPA_PITCH) expect(doc).toContain(name);
    expect(insp).toContain('Decision inbox');
    expect(insp).toContain('data-feature="F433"');
    expect(insp).toContain('data-feature="F438"');
    expect(insp).toContain('Tickets unlock after');
  });

  it('renders the accepted state at Simple depth with D-005 source chip, 0 tickets, and Lanjut ke Detail CTA', () => {
    const doc = renderToStaticMarkup(
      <PitchDocView state="accepted" pitch={GAPA_PITCH} slices={GAPA_SLICES} onOpenSource={noop} onConfirmNoBasis={noop} onBackToInterview={noop} />,
    );
    const insp = renderToStaticMarkup(
      <PitchInspector
        state="accepted"
        activeTab="Next"
        onSelectTab={noop}
        onMore={noop}
        onReviewPitch={noop}
        onAnswerOq={noop}
        onConfirmNoBasis={noop}
        onLanjutKeDetail={noop}
        onReviewBreakdown={noop}
        onReviewSpec={noop}
        onOpenTickets={noop}
      />,
    );

    expect(doc).toContain('Accepted r1');
    expect(doc).not.toContain('gpa-pf add');
    expect(doc).toContain('D-005');
    expect(doc).not.toContain('Tanpa dasar');
    expect(insp).toContain('Lanjut ke Detail');
    expect(insp).toContain('data-feature="F435"');
    expect(insp).toContain('Done');
  });

  it('renders the guard state explaining tickets are locked and creates zero tickets', () => {
    const chat = renderToStaticMarkup(<PitchChatMessages state="guard" onLanjutKeDetail={noop} />);
    const bar = renderToStaticMarkup(<PitchDepthBar depth="Simple" ticketCount={0} onDepth={noop} />);
    const insp = renderToStaticMarkup(
      <PitchInspector
        state="guard"
        activeTab="Next"
        onSelectTab={noop}
        onMore={noop}
        onReviewPitch={noop}
        onAnswerOq={noop}
        onConfirmNoBasis={noop}
        onLanjutKeDetail={noop}
        onReviewBreakdown={noop}
        onReviewSpec={noop}
        onOpenTickets={noop}
      />,
    );

    expect(chat).toContain('Make the tickets now.');
    expect(chat).toContain('Tickets locked');
    expect(chat).toContain('data-feature="F436"');
    expect(chat).toContain('data-feature="F435"');
    expect(bar).toContain('Tickets 0');
    expect(insp).toContain('Tickets are still locked');
  });

  it('renders the breakdown state with 5 thin vertical slices, 0 tickets banner, and Accept breakdown', () => {
    const banner = renderToStaticMarkup(
      <PitchBanner state="breakdown" onEdit={noop} onAskChanges={noop} onAcceptPitch={noop} onEditSlices={noop} onRejectBreakdown={noop} onAcceptBreakdown={noop} />,
    );
    const doc = renderToStaticMarkup(
      <PitchDocView state="breakdown" pitch={GAPA_PITCH} slices={GAPA_SLICES} onOpenSource={noop} onConfirmNoBasis={noop} onBackToInterview={noop} />,
    );
    const insp = renderToStaticMarkup(
      <PitchInspector
        state="breakdown"
        activeTab="Inbox"
        onSelectTab={noop}
        onMore={noop}
        onReviewPitch={noop}
        onAnswerOq={noop}
        onConfirmNoBasis={noop}
        onLanjutKeDetail={noop}
        onReviewBreakdown={noop}
        onReviewSpec={noop}
        onOpenTickets={noop}
      />,
    );

    expect(banner).toContain('0 tickets exist.');
    expect(banner).toContain('Accept breakdown');
    expect(banner).toContain('data-feature="F437"');
    expect(banner).toContain('data-feature="F438"');
    expect(doc).toContain('Ticket breakdown');
    expect(doc).toContain('data-feature="F437"');
    for (const [id, title] of GAPA_SLICES) {
      expect(doc).toContain(id);
      expect(doc).toContain(title);
    }
    expect(doc).not.toContain('>Status<');
    expect(insp).toContain('2 waiting');
  });

  it('renders the made state with 5 created tickets, Status column, and Open ticket board', () => {
    const banner = renderToStaticMarkup(
      <PitchBanner state="made" onEdit={noop} onAskChanges={noop} onAcceptPitch={noop} onEditSlices={noop} onRejectBreakdown={noop} onAcceptBreakdown={noop} />,
    );
    const bar = renderToStaticMarkup(<PitchDepthBar depth="Detailed" ticketCount={5} onDepth={noop} />);
    const doc = renderToStaticMarkup(
      <PitchDocView state="made" pitch={GAPA_PITCH} slices={GAPA_SLICES} onOpenSource={noop} onConfirmNoBasis={noop} onBackToInterview={noop} />,
    );
    const insp = renderToStaticMarkup(
      <PitchInspector
        state="made"
        activeTab="Next"
        onSelectTab={noop}
        onMore={noop}
        onReviewPitch={noop}
        onAnswerOq={noop}
        onConfirmNoBasis={noop}
        onLanjutKeDetail={noop}
        onReviewBreakdown={noop}
        onReviewSpec={noop}
        onOpenTickets={noop}
      />,
    );

    expect(banner).toContain('Breakdown accepted.');
    expect(bar).toContain('Tickets 5');
    expect(bar).not.toContain('none until the breakdown is accepted');
    expect(doc).toContain('Accepted r1');
    expect(doc).toContain('Status');
    expect(doc).toContain('Open');
    expect(doc).toContain('data-feature="F438"');
    expect(insp).toContain('Open ticket board');
    expect(insp).toContain('5 created');
  });
});
