import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { STYLE_HUNKS, STYLE_NEWREF, STYLE_NEWTOKEN, STYLE_TOKENS } from '@spekin/sample';
import {
  acceptDraftToken,
  buildDesignMarkdownLines,
  buildStyleTokens,
  promoteStyleProposal,
  StyleReviewWorkArea,
} from './StyleReviewWorkArea';

describe('S30 Style review (IMP-08)', () => {
  it('DESIGN.md is a view of accepted tokens and is never mutated directly by draft edits', () => {
    const base = buildStyleTokens('review');
    const acceptedBefore = base.filter((t) => t.st === 'ok').map((t) => `${t.id}:${t.rev}`);
    const draftAfter = acceptDraftToken(base, 'color.band');
    // Draft acceptance never changes the accepted spec revision (r3) or mutates input tokens
    expect(base.find((t) => t.id === 'color.band')?.st).toBe('inf');
    expect(draftAfter.find((t) => t.id === 'color.band')?.st).toBe('ok');
    expect(draftAfter.find((t) => t.id === 'color.band')?.rev).toBe('draft');
    expect(base.filter((t) => t.st === 'ok').map((t) => `${t.id}:${t.rev}`)).toEqual(acceptedBefore);

    // Markdown lines reflect r3 draft status and never mark inferred lines as accepted
    const md = buildDesignMarkdownLines(base);
    expect(md.some((l) => l.txt.includes('Status: draft on r3'))).toBe(true);
    expect(md.some((l) => l.txt.includes('table-band') && l.txt.includes('inferred REF-02'))).toBe(true);
  });

  it('promote creates proposal P-021 and only accepting in S08 advances DESIGN.md from r3 to r4', () => {
    const proposal = promoteStyleProposal(STYLE_HUNKS);
    expect(proposal.id).toBe('P-021');
    expect(proposal.baseRev).toBe('r3');
    expect(proposal.targetRev).toBe('r4');
    expect(proposal.includedCount).toBe(STYLE_HUNKS.filter((h) => h.inc).length);
    expect(proposal.accepted).toBe(false);

    const afterAccept = buildStyleTokens('accepted');
    expect(afterAccept.find((t) => t.id === 'radius.card')?.spec).toBe('16');
    expect(afterAccept.find((t) => t.id === 'radius.card')?.rev).toBe('r4');
    expect(afterAccept.find((t) => t.id === 'color.accent')?.kept).toBe(true);
    expect(afterAccept.find((t) => t.id === 'space.half')?.st).toBe('inf');
  });

  it('conflict state shows both values and the source of each', () => {
    const html = renderToStaticMarkup(<StyleReviewWorkArea initialMode="conflict" />);
    const accent = STYLE_TOKENS.find((t) => t.id === 'color.accent')!;
    expect(html).toContain('Conflict 1 of 2');
    expect(html).toContain('Confirmed<span>r3</span>');
    expect(html).toContain('Inferred<span>REF-03</span>');
    expect(html).toContain(accent.v!.hex);
    expect(html).toContain(accent.alt!.hex!);
    expect(html).toContain('Clay');
    expect(html).toContain('Forest');
    expect(html).toContain('Conflict 2 of 2');
    expect(html).toContain('Confirmed 10 · inferred 16');
    expect(html).toContain('REF-03 · 5 cards');
  });

  it('renders all 6 states (learning, review, conflict, markdown, promote, accepted) with sample data and no data-todo', () => {
    const learning = renderToStaticMarkup(<StyleReviewWorkArea initialMode="learning" />);
    expect(learning).not.toContain('data-todo');
    expect(learning).toContain('Style is still learning.');
    expect(learning).toContain('Learning · 1 of 2 references');
    expect(learning).toContain('Stop learning');
    expect(learning.match(/data-later=/g)?.length).toBe(1);

    const review = renderToStaticMarkup(<StyleReviewWorkArea initialMode="review" />);
    expect(review).toContain('Meranti Yard style');
    expect(review).toContain('Draft · not in the spec');
    expect(review).toContain('Accept 9 inferred');
    expect(review).toContain('Promote to spec');

    const markdown = renderToStaticMarkup(<StyleReviewWorkArea initialMode="markdown" />);
    expect(markdown).toContain('draft on r3 · 1 line edited');
    expect(markdown).toContain('edited by you');
    expect(markdown).toContain('Ln 31, Col 52');

    const promote = renderToStaticMarkup(<StyleReviewWorkArea initialMode="promote" />);
    expect(promote).toContain('Proposal P-021 · DESIGN.md r3 to r4');
    expect(promote).toContain('Base is current');
    expect(promote).toContain('Send to review in S08');

    const accepted = renderToStaticMarkup(<StyleReviewWorkArea initialMode="accepted" />);
    expect(accepted).toContain('DESIGN.md r4 accepted.');
    expect(accepted).toContain('In the spec · r4');
    expect(accepted).toContain(STYLE_NEWTOKEN.name);
    expect(accepted).toContain(STYLE_NEWREF.name);
  });
});
