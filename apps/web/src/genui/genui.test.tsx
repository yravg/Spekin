import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { apiSource, sampleData, sampleSource } from '../data/source';
import { createConfirmState, executeConfirmedAction, GenUiWorkArea } from './GenUiWorkArea';

const { PACKAGES } = sampleData;

// A card the Rust validator refuses: it carries text that must never reach the screen.
const REFUSED_CARD = {
  schema_version: 1,
  id: 'PARTIAL-LEAK-99',
  title: 'SECRET_PARTIAL_TITLE_MUST_NOT_RENDER',
  provenance: 'model_proposal',
  body: null,
  links: [] as string[],
  actions: [] as { kind: string; label: string; target_id: string | null; href: string | null }[],
  family: 'unknown_widget',
  items: [{ id: 'x', label: 'LEAKED_ROW_TEXT', checked: false, status: 'untested' }],
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('S38 GenUI panel (IMP-19, IMP-21)', () => {
  it('a mocked API refusal shows the fallback card and no part of the card', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        json({ status: 'rejected', reason: { code: 'unknown_component', family: 'unknown_widget' } }, 422),
      ),
    );

    const verdict = await apiSource.validateGenUi(REFUSED_CARD);
    expect(verdict.status).toBe('rejected');

    const html = renderToStaticMarkup(
      <GenUiWorkArea initialMode="cards" customPayload={REFUSED_CARD} validation={verdict} />,
    );
    expect(html).toContain('Plain table · fallback');
    expect(html).toContain('Shown as a table.');
    expect(html).not.toContain('SECRET_PARTIAL_TITLE_MUST_NOT_RENDER');
    expect(html).not.toContain('LEAKED_ROW_TEXT');
    expect(html).not.toContain('PARTIAL-LEAK-99');
  });

  it('a network error is a refusal, never a partly drawn card', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('offline');
      }),
    );

    const verdict = await apiSource.validateGenUi(REFUSED_CARD);
    expect(verdict.status).toBe('rejected');
    expect(verdict.status === 'rejected' ? verdict.reason : '').toMatch(/network/i);

    const html = renderToStaticMarkup(
      <GenUiWorkArea initialMode="cards" customPayload={REFUSED_CARD} validation={verdict} />,
    );
    expect(html).toContain('Plain table · fallback');
    expect(html).not.toContain('SECRET_PARTIAL_TITLE_MUST_NOT_RENDER');
  });

  it('in sample mode the recorded Rust verdict decides, with no request', async () => {
    const valid = sampleData.GENUI_CARDS.find((c) => c.verdict.status === 'valid')!;
    const refused = sampleData.GENUI_CARDS.find((c) => c.verdict.status === 'rejected')!;

    expect(sampleSource.knownCardVerdict(valid.payload)?.status).toBe('valid');
    expect(sampleSource.knownCardVerdict(refused.payload)?.status).toBe('rejected');
    expect(sampleSource.knownCardVerdict({ id: 'not-a-sample-card' })).toBeNull();
    expect(await sampleSource.validateGenUi(refused.payload)).toEqual({
      status: 'rejected',
      reason: expect.stringMatching(/privilege|accept/i),
    });

    const html = renderToStaticMarkup(
      <GenUiWorkArea initialMode="cards" customPayload={refused.payload} />,
    );
    expect(html).toContain('Plain table · fallback');
    expect(html).not.toContain(refused.title);
  });

  it('never runs a confirm action before the user confirms, and blocks stale or over-cap confirms', () => {
    const onExecute = vi.fn();
    const initial = createConfirmState();
    expect(initial.confirmed).toBe(false);
    expect(initial.executed).toBe(false);
    expect(initial.runs).toBe(0);

    // Rendering the confirm UI never triggers execution
    renderToStaticMarkup(<GenUiWorkArea initialMode="confirm" onExecuteConfirm={onExecute} />);
    expect(onExecute).not.toHaveBeenCalled();

    // Stale revision blocks execution
    const stale = executeConfirmedAction(initial, {
      actorCanEdit: true,
      actionAllowlisted: true,
      specRevision: 'r15',
      expectedRevision: 'r14',
      usedCredits: 1240,
      reserveCredits: 90,
      capCredits: 5000,
    }, onExecute);
    expect(stale.executed).toBe(false);
    expect(stale.error).toContain('r14');
    expect(onExecute).not.toHaveBeenCalled();

    // Over cap blocks execution
    const overCap = executeConfirmedAction(initial, {
      actorCanEdit: true,
      actionAllowlisted: true,
      specRevision: 'r14',
      expectedRevision: 'r14',
      usedCredits: 4950,
      reserveCredits: 90,
      capCredits: 5000,
    }, onExecute);
    expect(overCap.executed).toBe(false);
    expect(overCap.error).toContain('cap');
    expect(onExecute).not.toHaveBeenCalled();

    // Valid user confirm executes once; idempotency prevents double execution
    const confirmed = executeConfirmedAction(initial, {
      actorCanEdit: true,
      actionAllowlisted: true,
      specRevision: 'r14',
      expectedRevision: 'r14',
      usedCredits: 1240,
      reserveCredits: 90,
      capCredits: 5000,
    }, onExecute);
    expect(confirmed.confirmed).toBe(true);
    expect(confirmed.executed).toBe(true);
    expect(confirmed.runs).toBe(3);
    expect(onExecute).toHaveBeenCalledTimes(1);

    const retry = executeConfirmedAction(confirmed, {
      actorCanEdit: true,
      actionAllowlisted: true,
      specRevision: 'r14',
      expectedRevision: 'r14',
      usedCredits: 1240,
      reserveCredits: 90,
      capCredits: 5000,
    }, onExecute);
    expect(retry.runs).toBe(3);
    expect(onExecute).toHaveBeenCalledTimes(1);
  });

  it('renders all 6 S38 states (stream, cards, question, fallback, confirm, pinned) with sample data, no data-todo, and Share as LATER', () => {
    const stream = renderToStaticMarkup(<GenUiWorkArea initialMode="stream" />);
    expect(stream).not.toContain('data-todo');
    expect(stream).toContain('Writing block 3 of 3');
    expect(stream).toContain('Spekin is writing · F-04');
    expect(stream).toContain('aria-busy="true"');
    expect(stream.match(/data-later=/g)?.length).toBe(1);

    const cards = renderToStaticMarkup(<GenUiWorkArea initialMode="cards" />);
    expect(cards).toContain('Accepted artifact · r14');
    expect(cards).toContain('Model proposal');
    expect(cards).toContain('3 takes of the drawer, same data');
    expect(cards).toContain('Send the gap to review in S08');
    expect(cards.match(/data-later=/g)?.length).toBe(1);

    const question = renderToStaticMarkup(<GenUiWorkArea initialMode="question" />);
    expect(question).toContain('Before I draw the drawer');
    expect(question).toContain('When should a package raise an alert?');
    expect(question).toContain('Recommended');
    expect(question.match(/data-later=/g)?.length).toBe(1);

    const fallback = renderToStaticMarkup(<GenUiWorkArea initialMode="fallback" />);
    expect(fallback).toContain('Plain table · fallback');
    expect(fallback).toContain('Not provided');
    expect(fallback).toContain('Cannot tell');
    expect(fallback).toContain(PACKAGES[0]![1]);
    expect(fallback.match(/data-later=/g)?.length).toBe(1);

    const confirm = renderToStaticMarkup(<GenUiWorkArea initialMode="confirm" />);
    expect(confirm).toContain('Confirm: draw 3 takes of F-04');
    expect(confirm).toContain('run-7f3a-c2');
    expect(confirm).toContain('Confirm · reserve 90 cr');
    expect(confirm.match(/data-later=/g)?.length).toBe(1);

    const pinned = renderToStaticMarkup(<GenUiWorkArea initialMode="pinned" />);
    expect(pinned).toContain('Gap · pinned from chat');
    expect(pinned).toContain('Not accepted · F-04');
    expect(pinned).toContain('1 of 3 passed. Nothing else is shown as passed.');
    expect(pinned.match(/data-later=/g)?.length).toBe(1);
  });

  it('F321: every GenUI card states its provenance and the label carries the feature id', () => {
    const stream = renderToStaticMarkup(<GenUiWorkArea initialMode="stream" />);
    const cards = renderToStaticMarkup(<GenUiWorkArea initialMode="cards" />);
    const pinned = renderToStaticMarkup(<GenUiWorkArea initialMode="pinned" />);
    const fallback = renderToStaticMarkup(<GenUiWorkArea initialMode="fallback" />);
    for (const html of [stream, cards, pinned, fallback]) expect(html).toContain('data-feature="F321"');
    // Accepted artifact, Model proposal and the imported observation family are all drawn.
    expect(cards).toContain('Accepted artifact');
    expect(cards).toContain('Model proposal');
    expect(fallback).toContain('imported');
    expect(pinned).toContain('Fixture run');
  });

  it('F322: an unknown card family is rejected by the Rust validator and the fallback shows why', () => {
    const rejected = { status: 'rejected', reason: 'unknown_component: unknown_widget' } as const;
    const html = renderToStaticMarkup(
      <GenUiWorkArea initialMode="cards" customPayload={REFUSED_CARD} validation={rejected} />,
    );
    expect(html).toContain('data-feature="F322"');
    expect(html).toContain('Plain table · fallback');
    expect(html).toContain('rejected by Rust validation');
    // None of the refused card reaches the screen.
    expect(html).not.toContain('LEAKED_ROW_TEXT');
    expect(html).not.toContain('SECRET_PARTIAL_TITLE_MUST_NOT_RENDER');
    // The plain fallback state carries the id too.
    const plain = renderToStaticMarkup(<GenUiWorkArea initialMode="fallback" />);
    expect(plain).toContain('data-feature="F322"');
  });

  it('F329: untested and failed are never green, a missing figure says so', () => {
    const pinned = renderToStaticMarkup(<GenUiWorkArea initialMode="pinned" />);
    const fallback = renderToStaticMarkup(<GenUiWorkArea initialMode="fallback" />);
    expect(pinned).toContain('data-feature="F329"');
    expect(pinned).toContain('Untested');
    expect(pinned).toContain('No evidence');
    expect(pinned).toContain('Nothing else is shown as passed');
    // A missing figure is labelled, never shown as zero or green.
    expect(fallback).toContain('data-feature="F329"');
    expect(fallback).toContain('Not provided');
    expect(fallback).toContain('Cannot tell');
  });
});
