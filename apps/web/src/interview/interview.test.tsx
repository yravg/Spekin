// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import {
  GAPA_ANSWERED,
  GAPA_GROUND,
  GAPA_IDEA,
  GAPA_PITCH,
  GAPA_PITCH_FIELDS,
  GAPA_Q5,
  GAPA_SKIPPED,
  GAPA_WHY,
} from '@spekin/sample';
import { InterviewScreen } from './InterviewScreen';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

afterEach(async () => {
  if (root) {
    await act(async () => {
      root?.unmount();
    });
    root = null;
  }
  if (container) {
    container.remove();
    container = null;
  }
});

async function renderInterview(initialEntry: string) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/new/interview" element={<InterviewScreen mode="new" />} />
          <Route path="/p/:project/planning" element={<InterviewScreen mode="ground" />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  return container;
}

async function clickBtn(el: HTMLElement, label: string) {
  const button = [...el.querySelectorAll('button')].find(
    (b) => (b.textContent ?? '').replace(/\s+/g, ' ').trim() === label,
  );
  if (!button) throw new Error('no button with exact label: ' + label);
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('S04 Interview (IMP-55)', () => {
  it('renders Ask and answer state at /new/interview with Q-01..Q-04 history, Q-05 recommendation, and pitch progress', async () => {
    const el = await renderInterview('/new/interview');
    expect(el.querySelector('[data-screen="S04"]')).not.toBeNull();
    expect(el.querySelector('.gpa-iv')).not.toBeNull();
    expect(el.textContent).toContain('Question 5 of 12');
    expect(el.textContent).toContain(GAPA_IDEA);
    for (const [id, q, ans, dec] of GAPA_ANSWERED) {
      expect(el.textContent).toContain(id);
      expect(el.textContent).toContain(q);
      expect(el.textContent).toContain(ans);
      expect(el.textContent).toContain(dec);
    }
    expect(el.textContent).toContain(GAPA_SKIPPED[0]);
    expect(el.textContent).toContain(GAPA_Q5.text);
    expect(el.textContent).toContain(GAPA_Q5.rec);
    for (const alt of GAPA_Q5.alts) expect(el.textContent).toContain(alt);
    for (const [name] of GAPA_PITCH_FIELDS) expect(el.textContent).toContain(name);
    expect(el.querySelector('[data-feature="F411"]')).not.toBeNull();
    expect(el.querySelector('[data-feature="F412"]')).not.toBeNull();
    expect(el.querySelector('[data-feature="F415"]')).not.toBeNull();
    expect(el.querySelector('[data-feature="F419"]')).not.toBeNull();
  });

  it('opens Why this? in place with evidence, trade-offs, 0 cr pill, Deeper view and Close (F417)', async () => {
    const el = await renderInterview('/new/interview');
    await clickBtn(el, 'Why this?');
    expect(el.querySelector('.gpa-why[data-feature="F417"]')).not.toBeNull();
    expect(el.textContent).toContain(GAPA_WHY.plain);
    expect(el.textContent).toContain('Read from accepted artifacts · no model call · 0 cr');
    expect(el.textContent).toContain('3 decided and 1 skipped so far');
    for (const ev of GAPA_WHY.evidence) expect(el.textContent).toContain(ev);
    for (const [label, desc] of GAPA_WHY.tradeoffs) {
      expect(el.textContent).toContain(label);
      expect(el.textContent).toContain(desc);
    }
    await clickBtn(el, 'Close');
    expect(el.querySelector('.gpa-why')).toBeNull();
  });

  it('opens Cukup, buat pitch confirmation dialog and closes on Keep asking or Escape (F415)', async () => {
    const el = await renderInterview('/new/interview');
    await clickBtn(el, 'Cukup, buat pitch');
    const dialog = el.querySelector('[role="dialog"][aria-label="Cukup, buat pitch"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('Cukup, buat pitch?');
    expect(dialog?.textContent).toContain('Will be proposed as an open question');
    await clickBtn(el, 'Keep asking');
    expect(el.querySelector('[role="dialog"]')).toBeNull();

    await clickBtn(el, 'Cukup, buat pitch');
    expect(el.querySelector('[role="dialog"]')).not.toBeNull();
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(el.querySelector('[role="dialog"]')).toBeNull();
  });

  it('records Q-04 as open question OQ-01 on Skip with Answer now and Undo skip (F413)', async () => {
    const el = await renderInterview('/new/interview?q=4');
    expect(el.textContent).toContain(GAPA_SKIPPED[1]);
    await clickBtn(el, 'Skip');
    expect(el.querySelector('.gpa-bn.ok[data-feature="F413"]')).not.toBeNull();
    expect(el.textContent).toContain('Saved as open question OQ-01');
    expect(el.textContent).toContain('Skipped just now');
    expect(el.textContent).toContain('Moving on. Next is question 5.');
    expect(el.textContent).toContain('3 decisions · 1 open (new)');

    await clickBtn(el, 'Undo skip');
    expect(el.querySelector('.gpa-bn.ok')).toBeNull();
    expect(el.querySelector('.gpa-q h3')?.textContent).toBe(GAPA_SKIPPED[1]);
  });

  it('renders Grounded (add feature) at /p/meranti-yard/planning with evidence labels and S08 review card (F414, F418)', async () => {
    const el = await renderInterview('/p/meranti-yard/planning');
    expect(el.querySelector('[data-screen="S04"]')).not.toBeNull();
    expect(el.textContent).toContain('Increment 2 · question 2 of 12');
    expect(el.textContent).toContain('Read before asking · increment 2');
    for (const [, name, rev, kind, , text] of GAPA_GROUND) {
      expect(el.textContent).toContain(name);
      expect(el.textContent).toContain(rev);
      expect(el.textContent).toContain(kind);
      expect(el.textContent).toContain(text);
    }
    expect(el.querySelector('[data-feature="F414"]')).not.toBeNull();
    expect(el.querySelector('[data-feature="F418"]')).not.toBeNull();
    expect(el.textContent).toContain('Reviews and outside actions');
    expect(el.textContent).toContain('Open S08 review');
  });

  it('stops at Question 12 and proposes Pitch proposal r1 with Stopping is not approval warning (F416)', async () => {
    const el = await renderInterview('/new/interview?q=12');
    await clickBtn(el, 'Accept');
    expect(el.textContent).toContain('Question 12 of 12');
    expect(el.textContent).toContain('Pitch proposal r1');
    expect(el.textContent).toContain('Variance alerts for Meranti Yard');
    expect(el.textContent).toContain('Stopping is not approval.');
    expect(el.textContent).toContain('9 decisions · 2 open');
    expect(el.textContent).toContain('4 of 5 filled');
    expect(el.textContent).toContain('Reached');
    for (const [field] of GAPA_PITCH) expect(el.textContent).toContain(field);
    expect(el.querySelector('.sp-gc.prop[data-feature="F416"]')).not.toBeNull();
    expect(el.querySelector('.gpa-bn.warn[data-feature="F416"]')).not.toBeNull();
  });

  it('supports Edit to place the recommendation in the answer box and Accept to write a decision', async () => {
    const el = await renderInterview('/new/interview');
    await clickBtn(el, 'Edit');
    const input = el.querySelector('input[aria-label="Your answer"]') as HTMLInputElement | null;
    expect(input?.value).toBe(GAPA_Q5.rec);

    await clickBtn(el, 'Accept');
    expect(el.textContent).toContain('D-004');
    expect(el.textContent).toContain('Question 6 of 12');
  });
it('opens S05, S06 and S15 by click from an add-feature increment (F540, D-PLAN-1)', async () => {
    let seen = '';
    function Probe() {
      const loc = useLocation();
      seen = loc.pathname + loc.search;
      return null;
    }
    for (const [label, artifact] of [
      ['Decision log', 'decisions'],
      ['Pitch', 'pitch'],
      ['Tickets', 'tickets'],
    ]) {
      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);
      await act(async () => {
        root?.render(
          <MemoryRouter initialEntries={['/p/meranti-yard/planning']}>
            <Probe />
            <Routes>
              <Route path="/p/:project/planning" element={<InterviewScreen mode="ground" />} />
            </Routes>
          </MemoryRouter>,
        );
      });
      const card = container.querySelector('[data-feature="F540"]') as HTMLElement;
      expect(card).not.toBeNull();
      await clickBtn(card, label);
      expect(seen).toBe('/p/meranti-yard/planning?artifact=' + artifact);
      await act(async () => root?.unmount());
      root = null;
      container.remove();
      container = null;
    }
  });

  it('shows no planning artifacts row before a project exists (F540)', async () => {
    const el = await renderInterview('/new/interview');
    expect(el.querySelector('[data-feature="F540"]')).toBeNull();
  });
});

