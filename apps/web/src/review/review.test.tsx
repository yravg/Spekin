import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { REVIEW_NITS, REVIEW_PROPOSAL } from '@spekin/sample';
import {
  acceptProposal,
  rejectProposal,
  ReviewAcceptWorkArea,
} from './ReviewAcceptWorkArea';

describe('S33 Review and accept (IMP-15)', () => {
  it('Accept creates exactly one revision and one audit entry', () => {
    const res = acceptProposal(REVIEW_PROPOSAL, 'r14', ['H1', 'H2', 'H3', 'H4']);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.revisionsCreated).toBe(1);
      expect(res.revision.id).toBe('r15');
      expect(res.revision.parent).toBe('r14');
      expect(res.auditEntries).toHaveLength(1);
      expect(res.auditEntries[0]?.id).toBe('A-0231');
    }
  });

  it('Reject creates no revision and adds exactly one audit entry (C-03)', () => {
    const res = rejectProposal(REVIEW_PROPOSAL, 'r14');
    expect(res.revisionsCreated).toBe(0);
    expect(res.currentRev).toBe('r14');
    expect(res.auditEntries).toHaveLength(1);
    expect(res.auditEntries[0]?.id).toBe('A-0232');
  });

  it('A stale proposal cannot be accepted, and an empty review list is never accepted', () => {
    const stale = acceptProposal(REVIEW_PROPOSAL, 'r15', ['H1']);
    expect(stale.ok).toBe(false);
    if (!stale.ok) expect(stale.reason).toBe('stale');

    const empty = acceptProposal(REVIEW_PROPOSAL, 'r14', []);
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.reason).toBe('empty');
  });

  it('renders all 6 states (pins, hover, stale, diff, accepted, rejected) with sample data and no data-todo', () => {
    const pins = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="pins" />);
    expect(pins).not.toContain('data-todo');
    expect(pins).toContain('Review · F-03 Variance table');
    expect(pins).toContain('7 changes');
    expect(pins).toContain('1 needs a look');
    for (const n of REVIEW_NITS) expect(pins).toContain(n.el);
    expect(pins.match(/data-later=/g)?.length).toBe(1);

    const hover = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="hover" />);
    expect(hover).toContain('4 · Table header');
    expect(hover).toContain('13 px ink');
    expect(hover).toContain('11 px dim');

    const stale = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="stale" />);
    expect(stale).toContain('Shown as the part was before it changed.');
    expect(stale).toContain('Nitpick saw 6.28');
    expect(stale).toContain('Re-check');

    const diff = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="diff" />);
    expect(diff).toContain('Proposal, not accepted.');
    expect(diff).toContain(REVIEW_PROPOSAL.title);
    expect(diff).toContain('Accept and create r15');

    const accepted = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="accepted" />);
    expect(accepted).toContain('Accepted. r15 created from r14.');
    expect(accepted).toContain('A-0231');

    const rejected = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="rejected" />);
    expect(rejected).toContain('Rejected. r14 stays current.');
    expect(rejected).toContain('No new revision was made.');
    expect(rejected).toContain('A-0232');
  });
});
