import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { GAPD_RUNS, GAPD_STEPS } from '@spekin/sample';
import { ProjectShell } from '../shell/ProjectShell';
import { AgentInboxWorkArea } from './AgentInboxWorkArea';

function renderRoute(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/p/:project/:stage" element={<ProjectShell />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('S20 Agent inbox (IMP-65, F511-F519)', () => {
  it('renders the docked inbox on /p/meranti-yard/spec?inbox=1 with all six run types and groups', () => {
    const html = renderRoute('/p/meranti-yard/spec?inbox=1');
    expect(html).toContain('data-screen="S20"');
    expect(html).toContain('data-feature="F511"');
    expect(html).toContain('data-feature="F512"');
    expect(html).toContain('data-feature="F517"');
    expect(html).toContain('Agent inbox');
    expect(html).toContain('2 running · 2 waiting');
    for (const run of GAPD_RUNS) {
      expect(html).toContain(run.id);
      expect(html).toContain(run.type);
      expect(html).toContain(run.title);
    }
    expect(html).toContain('All 6');
    expect(html).toContain('Needs you 2');
    expect(html).toContain('Running 2');
    expect(html).toContain('Finished 2');
    expect(html).not.toMatch(/class="[^"]*\bisnew\b/);
  });

  it('renders the steer state with live steps (F513) and queued steering note (F514)', () => {
    const html = renderToStaticMarkup(
      <AgentInboxWorkArea initialFilter="running" initialOpenRun="RUN-0420" onClose={() => {}} />,
    );
    expect(html).toContain('data-feature="F514"');
    expect(html).toContain('data-feature="F513"');
    expect(html).toContain('data-feature="F516"');
    for (const [, text] of GAPD_STEPS) {
      expect(html).toContain(text);
    }
    expect(html).toContain('Queued · applied at step 4, the run does not restart');
    expect(html).toContain('Send note');
  });

  it('renders the approve state with read/write scope and reserved maximum (F515)', () => {
    const html = renderToStaticMarkup(
      <AgentInboxWorkArea initialFilter="need" initialOpenRun="RUN-0417" onClose={() => {}} />,
    );
    expect(html).toContain('data-feature="F515"');
    expect(html).toContain('26 cr maximum (estimate 14 to 22)');
    expect(html).toContain('Ticket proposals only, none accepted');
    expect(html).toContain('Approve and run');
    expect(html).toContain('Change model');
  });

  it('renders the finished and failed state with report and review links (F518) and retry (F516)', () => {
    const html = renderToStaticMarkup(
      <AgentInboxWorkArea initialFilter="done" onClose={() => {}} />,
    );
    expect(html).toContain('data-feature="F518"');
    expect(html).toContain('data-feature="F516"');
    expect(html).toContain('Open report');
    expect(html).toContain('Open in review');
    expect(html).toContain('results.xml could not be read: not valid XML');
    expect(html).toContain('Retry');
  });

  it('renders the credit cap reached state (F519) with paused runs and disabled Approve', () => {
    const html = renderRoute('/p/meranti-yard/spec?inbox=1&moment=cap');
    expect(html).toContain('data-screen="S20"');
    expect(html).toContain('data-feature="F519"');
    expect(html).toContain('Credit cap reached.');
    expect(html).toContain('0 running · 2 waiting');
    expect(html).toContain('Waiting: credit cap reached');
    expect(html).toContain('Raise cap in usage');
    expect(html).toContain('No run is working on this requirement');
  });

  it('renders the empty inbox state (F519) listing all six run types without a spinner', () => {
    const html = renderRoute('/p/meranti-yard/spec?inbox=1&moment=empty');
    expect(html).toContain('data-screen="S20"');
    expect(html).toContain('data-feature="F519"');
    expect(html).toContain('No runs yet');
    expect(html).toContain('Interview turn · Depth expansion · Reference capture');
    expect(html).toContain('Ticket breakdown · Verification intake · Independent review');
    expect(html).not.toContain('2 running · 2 waiting');
  });
});
