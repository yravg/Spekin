import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PACKAGES } from '@spekin/sample';
import {
  validateGenUiCard,
  type GenUiCard,
  ALLOWED_ACTION_KINDS,
  GENUI_FAMILIES,
} from './validate';
import {
  createConfirmState,
  executeConfirmedAction,
  GenUiWorkArea,
} from './GenUiWorkArea';

const VALID_CHECKLIST_CARD: GenUiCard = {
  schema_version: 1,
  id: 'AC-DASH-019',
  title: 'AC-DASH-019 · Alert after 2 periods over 3%',
  provenance: 'imported_observation',
  body: null,
  links: ['R-DASH-014'],
  actions: [
    { kind: 'expand_details', label: 'Details', target_id: 'AC-DASH-019', href: null },
    { kind: 'pin', label: 'Pin', target_id: 'AC-DASH-019', href: null },
  ],
  family: 'checklist',
  items: [
    { id: 'c1', label: 'Alert raised after 2 periods over 3%', checked: false, status: 'untested' },
    { id: 'c2', label: 'Threshold read from accepted spec r14', checked: true, status: 'passed_fixture' },
    { id: 'c3', label: 'No alert for P-04 at −3.4%', checked: false, status: 'no_evidence' },
  ],
  summary: '1 of 3 passed. Nothing else is shown as passed.',
};

describe('S38 GenUI panel (IMP-19)', () => {
  it('validates the IMP-10 card families and allowlisted actions, and rejects invalid/unsafe payloads fail-closed', () => {
    expect(GENUI_FAMILIES).toEqual(['checklist', 'comparison', 'question']);
    expect(ALLOWED_ACTION_KINDS).toEqual([
      'pin',
      'unpin',
      'expand_details',
      'open_review',
      'compare',
      'edit_draft',
      'select_option',
      'skip_question',
      'export_json',
    ]);

    const ok = validateGenUiCard(VALID_CHECKLIST_CARD);
    expect(ok.status).toBe('ok');

    // Unknown component family
    const badFamily = validateGenUiCard({ ...VALID_CHECKLIST_CARD, family: 'raw_html' });
    expect(badFamily.status).toBe('rejected');

    // Privilege-escalating action
    const badAction = validateGenUiCard({
      ...VALID_CHECKLIST_CARD,
      actions: [{ kind: 'accept_spec', label: 'Accept now', target_id: null, href: null }],
    });
    expect(badAction.status).toBe('rejected');

    // Unsafe URL (javascript: / data:)
    const badUrl = validateGenUiCard({
      ...VALID_CHECKLIST_CARD,
      actions: [{ kind: 'open_review', label: 'Open', target_id: null, href: 'javascript:alert(1)' }],
    });
    expect(badUrl.status).toBe('rejected');

    const badDataUrl = validateGenUiCard({
      ...VALID_CHECKLIST_CARD,
      actions: [{ kind: 'open_review', label: 'Open', target_id: null, href: 'data:text/html,<svg>' }],
    });
    expect(badDataUrl.status).toBe('rejected');

    // Script/tool pattern in text
    const badScript = validateGenUiCard({
      ...VALID_CHECKLIST_CARD,
      title: 'Run <script>alert(1)</script>',
    });
    expect(badScript.status).toBe('rejected');

    // Missing required field
    const missingField = validateGenUiCard({
      schema_version: 1,
      id: 'BAD-1',
      provenance: 'model_proposal',
      family: 'checklist',
      items: [],
    });
    expect(missingField.status).toBe('rejected');
  });

  it('shows the fallback state for an invalid card and never renders it partly', () => {
    const invalidPayload = {
      schema_version: 1,
      id: 'PARTIAL-LEAK-99',
      title: 'SECRET_PARTIAL_TITLE_MUST_NOT_RENDER',
      provenance: 'model_proposal',
      family: 'unknown_widget',
      items: [{ id: 'x', label: 'LEAKED_ROW_TEXT', checked: false, status: 'untested' }],
    };

    const html = renderToStaticMarkup(
      <GenUiWorkArea initialMode="cards" customPayload={invalidPayload} />,
    );
    expect(html).toContain('Plain table · fallback');
    expect(html).toContain('Shown as a table.');
    expect(html).not.toContain('SECRET_PARTIAL_TITLE_MUST_NOT_RENDER');
    expect(html).not.toContain('LEAKED_ROW_TEXT');
    expect(html).not.toContain('PARTIAL-LEAK-99');
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
});
