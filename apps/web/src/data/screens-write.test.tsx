// @vitest-environment jsdom
// IMP-41: the screen a click reaches after a write, drawn from the data door's answer.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import type { DataSource } from './source';
import { resetSampleWrites, sampleSource } from './source';
import { DataSourceProvider } from './provider';
import { resetSession } from './session';
import { ReviewAcceptWorkArea } from '../review/ReviewAcceptWorkArea';
import { ProjectsHome } from '../projects/ProjectsHome';
import { ModelsUsageWorkArea } from '../models/ModelsUsageWorkArea';

// React 19 asks for this flag before act() drives an update outside a test renderer.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

async function draw(node: ReactNode, source: DataSource = sampleSource) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(<DataSourceProvider source={source}>{node}</DataSourceProvider>);
  });
}

async function click(label: string) {
  const button = [...container.querySelectorAll('button')].find((b) =>
    (b.textContent ?? '').replace(/\s+/g, ' ').trim().includes(label),
  );
  if (!button) throw new Error('no button matching ' + label);
  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await act(async () => {});
}

beforeEach(() => {
  resetSampleWrites();
  resetSession();
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  document.body.replaceChildren();
});

describe('The screen a write reaches (IMP-41)', () => {
  it('Accept on S33 draws the accepted state, not the proposal', async () => {
    await draw(<ReviewAcceptWorkArea initialState="diff" />);
    expect(container.textContent).toContain('Proposal, not accepted.');

    await click('Accept and create r15');

    expect(container.textContent).toContain('Accepted. r15 created from r14.');
    expect(container.textContent).toContain('A-0231');
    expect(container.textContent).not.toContain('Proposal, not accepted.');
  });

  it('a 409 on Accept draws the stale/conflict result and never the accepted state', async () => {
    const staleSource: DataSource = {
      ...sampleSource,
      acceptProposal: async () => ({ ok: false, kind: 'stale', message: 'proposal is against r14' }),
    };
    const overrides: { save?: { status: string } }[] = [];
    await draw(
      <ReviewAcceptWorkArea
        initialState="diff"
        onShellOverride={(o) => overrides.push(o as { save?: { status: string } })}
      />,
      staleSource,
    );

    await click('Accept and create r15');

    expect(container.textContent).not.toContain('Accepted. r15 created from r14.');
    expect(container.textContent).toContain('Shown as the part was before it changed.');
    // The shell's S35 conflict save chip is raised by the 409, never "saved".
    expect(overrides.at(-1)?.save?.status).toBe('conflict');
  });

  it('Restore on S27 writes through the door and closes the deleted banner', async () => {
    await draw(
      <MemoryRouter>
        <ProjectsHome initialView="restore" />
      </MemoryRouter>,
    );
    expect(container.textContent).toContain('was deleted in another session');

    await click('Restore project');

    expect(container.textContent).not.toContain('was deleted in another session');
    const out = await sampleSource.recentlyDeleted();
    expect(out.ids).not.toContain('kenari-fleet');
  });

  it('a refused reserve never draws as reserved', async () => {
    const failing: DataSource = {
      ...sampleSource,
      reserveRun: async () => ({ ok: false, kind: 'error', message: 'the reserve does not fit the monthly cap' }),
    };
    await draw(
      <ModelsUsageWorkArea
        section="next"
        moment="calm"
        onSection={() => {}}
        onExit={() => {}}
      />,
      failing,
    );

    await click('Send and reserve');

    const status = container.querySelector('[role="status"]');
    expect((status?.textContent ?? '')).not.toContain('Reserved');
    expect(container.textContent).toContain('the reserve does not fit the monthly cap');
  });

  it('in API mode Send estimates and reserves once and never settles from the browser', async () => {
    const calls: string[] = [];
    const api: DataSource = {
      ...sampleSource,
      mode: 'api',
      estimateRun: async (...a) => { calls.push('estimate'); return sampleSource.estimateRun(...a); },
      reserveRun: async (...a) => { calls.push('reserve'); return sampleSource.reserveRun(...a); },
      settleRun: async () => { calls.push('settle'); throw new Error('the browser must not settle'); },
    };
    await draw(<ModelsUsageWorkArea section="next" moment="calm" onSection={() => {}} onExit={() => {}} />, api);

    await click('Send and reserve');

    expect(calls).toEqual(['estimate', 'reserve']);
    const status = container.querySelector('[role="status"]');
    expect(status?.textContent).toContain('settles when the run finishes');
    expect(status?.textContent).not.toContain('settled');
  });

  it('a reserve that answers draws the reserved and settled amounts', async () => {
    await draw(
      <ModelsUsageWorkArea section="next" moment="calm" onSection={() => {}} onExit={() => {}} />,
    );

    await click('Send and reserve');

    const status = container.querySelector('[role="status"]');
    expect(status?.textContent).toContain('Reserved 36 cr');
    expect(status?.textContent).toContain('settled 24 cr');
  });
});
