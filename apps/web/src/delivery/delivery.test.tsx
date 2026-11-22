import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  DELIVERY_CHECKS,
  DELIVERY_CONTRACTS,
  DELIVERY_GATE,
  DELIVERY_MATRIX,
  DELIVERY_RUN,
  DELIVERY_TIMELINE,
  type SampleDeliveryCheck,
  type SampleDeliveryTimelineRow,
} from '@spekin/sample';
import {
  DELIVERY_VIEWS,
  DeliveryWorkArea,
  deliveryCheckOutcome,
  deliveryViewStage,
  evidenceOutcome,
  type DeliveryView,
} from './DeliveryWorkArea';

const render = (view: DeliveryView) =>
  renderToStaticMarkup(<DeliveryWorkArea view={view} onView={() => {}} onIntent={() => {}} />);

// The card's rule: a check with no evidence is "not run", never passed.
const noEvidence: SampleDeliveryCheck = { k: 'ok', t: 'A check with no evidence', p: 'Passed', ev: '' };

describe('S37 Build contracts (IMP-18)', () => {
  it('never shows a check as passed when it has no evidence', () => {
    expect(deliveryCheckOutcome(noEvidence)).toEqual(['mute', 'Not run']);
    for (const c of DELIVERY_CHECKS) {
      if (!c.ev) expect(deliveryCheckOutcome(c)[1]).not.toBe('Passed');
    }

    // An observation is passed only when it is linked to the build it judged.
    const unlinked: SampleDeliveryTimelineRow = ['Production', 'any observation', 'none', ['ok', 'Passed'], '', 'Never shown as passed'];
    expect(evidenceOutcome(unlinked)).toEqual(['mute', 'Not run']);
    const production = DELIVERY_TIMELINE.find((r) => r[0] === 'Production');
    expect(production).toBeTruthy();
    expect(evidenceOutcome(production!)[1]).not.toBe('Passed');

    const detail = render('detail');
    expect(detail).toContain('No breaking change against r1');
    expect(detail).toContain('Evidence missing');
    expect(detail).toContain('No evidence recorded');
    const evidence = render('evidence');
    expect(evidence).toContain('Never shown as passed');
    expect(evidence).toContain('Unknown');
    expect(evidence).toContain('Unavailable');
  });

  it('renders the six drawn views from the sample with no stand-in and no extra later control', () => {
    expect(DELIVERY_VIEWS.map((v) => v.id)).toEqual(['contracts', 'detail', 'matrix', 'gate', 'fail', 'evidence']);
    const key: Record<DeliveryView, string[]> = {
      contracts: ['Release readiness', 'A contract is a proposal until it is accepted in review. Accepting never writes to a database.'],
      detail: ['API contract: variance alerts', 'Threshold comes from accepted spec r14', 'Contract checks'],
      matrix: ['Stage and status', 'Integration readiness', 'Waits for Testing'],
      gate: ['Release gate: blocked, 4 reasons', 'Request owner exception', 'No deploy, retry or merge runs from here.'],
      fail: ['Integration run failed: the response does not match the contract', 'read-only record', 'Expected and received'],
      evidence: ['Download evidence pack', 'Evidence missing', 'Export is recorded: actor, pack, time.'],
    };
    for (const view of DELIVERY_VIEWS) {
      const html = render(view.id);
      expect(html).not.toContain('data-todo');
      for (const text of key[view.id]) expect(html).toContain(text);
      expect(html).toContain('data-feature="F104"');
      if (view.id === 'detail' || view.id === 'matrix' || view.id === 'gate') expect(html).toContain('data-feature="F306"');
    }
  });

  it('draws every contract, matrix row, gate reason and timeline row the sample holds', () => {
    const contracts = render('contracts');
    expect(DELIVERY_CONTRACTS.length).toBe(8);
    for (const c of DELIVERY_CONTRACTS) {
      expect(contracts).toContain(c.name);
      expect(contracts).toContain(c.link);
    }
    const matrix = render('matrix');
    expect(DELIVERY_MATRIX.length).toBe(8);
    expect(matrix).toContain('All eight stages');
    expect(matrix).toContain('7 untested');

    const gate = render('gate');
    for (const g of DELIVERY_GATE) {
      expect(gate).toContain(g.title);
      expect(gate).toContain(g.reason);
      expect(gate).toContain(g.big);
    }
    const fail = render('fail');
    expect(fail).toContain(DELIVERY_RUN.id);
    for (const [, step] of DELIVERY_RUN.steps) expect(fail).toContain(step);

    const evidence = render('evidence');
    for (const [source, what] of DELIVERY_TIMELINE) {
      expect(evidence).toContain(source);
      expect(evidence).toContain(what);
    }
  });

  it('maps each view to the stage its board draws', () => {
    expect(deliveryViewStage('contracts')).toBe('backend');
    expect(deliveryViewStage('detail')).toBe('backend');
    expect(deliveryViewStage('matrix')).toBe('integration');
    expect(deliveryViewStage('fail')).toBe('integration');
    expect(deliveryViewStage('gate')).toBe('deploy');
    expect(deliveryViewStage('evidence')).toBe('deploy');
  });
});
