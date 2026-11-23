import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { REVIEW_NITS, REVIEW_PROPOSAL } from '@spekin/sample';
import {
  acceptProposal,
  rejectProposal,
  ReviewAcceptWorkArea,
  reviewCounts,
  applyOtherChangeSet,
  APPLY_OTHER_TARGETS,
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

// IMP-49: prove the five S33 parity features with real behaviour, tests first.
// Grab the opening tag that carries the Accept button's data-does, without writing a literal tag in this source.
function acceptTagOf(markup: string): string {
  const i = markup.indexOf('data-does="Asks to confirm');
  if (i < 0) return '';
  const start = markup.lastIndexOf('<', i);
  const end = markup.indexOf('>', i);
  return markup.slice(start, end + 1);
}

describe('S33 parity features F244, F248, F250, F253, F255 (IMP-49)', () => {
  it('F244: the footer counts what is left, derived from the nitpicks', () => {
    const counts = reviewCounts(REVIEW_NITS);
    expect(counts.changes).toBe(7);
    expect(counts.needsLook).toBe(1);
    const pins = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="pins" />);
    expect(pins).toContain('data-feature="F244"');
    expect(pins).toContain('7 changes');
    expect(pins).toContain('1 needs a look');
  });

  it('F248: applying to other frames is a separate reviewed change set with each target listed', () => {
    const cs = applyOtherChangeSet();
    expect(cs.separateReview).toBe(true);
    expect(cs.targets).toContain('F-04');
    expect(cs.targets).toHaveLength(APPLY_OTHER_TARGETS.length);
    const shown = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="pins" showApplyOther />);
    expect(shown).toContain('data-feature="F248"');
    expect(shown).toContain('Separate review · apply header fix to other frames');
    expect(shown).toContain('reviewed apart from F-03');
    expect(shown).toContain('Alert drawer');
    const canonical = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="pins" />);
    expect(canonical).not.toContain('reviewed apart from F-03');
  });

  it('F250: the diff shows linked requirements, tests, tasks and sources with what will be marked', () => {
    const diff = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="diff" />);
    expect(diff).toContain('data-feature="F250"');
    expect(diff).toContain('R-DASH-019');
    expect(diff).toContain('R-DASH-020');
    expect(diff).toContain('R-DASH-014');
    expect(diff).toContain('Needs review');
    expect(diff).toContain('3 linked items are marked Needs review');
    expect(diff).toContain('Gap check, S35');
    expect(diff).toContain('AC-014.2');
    expect(diff).toContain('T-212');
  });

  it('F253: a proposal whose base is no longer current is shown stale and Accept is blocked', () => {
    const staleCore = acceptProposal(REVIEW_PROPOSAL, 'r15', ['H1']);
    expect(staleCore.ok).toBe(false);
    if (!staleCore.ok) expect(staleCore.reason).toBe('stale');

    const stale = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="diff" currentSpecRev="r15" />);
    expect(stale).toContain('data-feature="F253"');
    expect(stale).toContain('Proposal is stale');
    expect(stale).toContain('Accept is blocked');
    expect(stale).not.toContain('Proposal, not accepted.');
    expect(acceptTagOf(stale)).toContain('disabled');

    const canonical = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="diff" />);
    expect(canonical).toContain('Proposal, not accepted.');
    expect(canonical).not.toContain('Proposal is stale');
    expect(acceptTagOf(canonical)).not.toContain('disabled');
  });

  it('F255: follow-up tickets sit in the same diff and join the ticket board only on accept', () => {
    const open = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="diff" />);
    expect(open).toContain('data-feature="F255"');
    expect(open).toContain('T-219');
    expect(open).toContain('Proposed ticket · joins S15 on accept');
    expect(open).toContain('Proposed');

    const accepted = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="accepted" />);
    expect(accepted).toContain('data-feature="F255"');
    expect(accepted).toContain('Added to S15');

    const rejected = renderToStaticMarkup(<ReviewAcceptWorkArea initialState="rejected" />);
    expect(rejected).toContain('data-feature="F255"');
    expect(rejected).toContain('Not changed');
    expect(rejected).not.toContain('Added to S15');
  });
});
