import { beforeEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { PROJECT, STAGES, USAGE } from '@spekin/sample';
import { ProjectShell } from './ProjectShell';
import { DataSourceProvider } from '../data/provider';
import { apiSource } from '../data/source';
import { markReadFailed, primeLastCopy, resetSession } from '../data/session';

function renderDesign() {
  return renderToStaticMarkup(
    <DataSourceProvider source={apiSource}>
      <MemoryRouter initialEntries={['/p/meranti-yard/design']}>
        <Routes>
          <Route path="/p/:project/:stage" element={<ProjectShell />} />
        </Routes>
      </MemoryRouter>
    </DataSourceProvider>,
  );
}

beforeEach(() => resetSession());

describe('S35 server offline (IMP-39, F378)', () => {
  it('keeps the last loaded copy, shows the banner, the load time and the Offline chip', () => {
    const at = new Date();
    at.setHours(12, 41, 0, 0);
    primeLastCopy('project:meranti-yard', { project: PROJECT, stages: STAGES, usage: USAGE }, at);
    markReadFailed('project:meranti-yard', async () => {});

    const html = renderDesign();
    expect(html).toContain('data-feature="F378"');
    expect(html).toContain('The Spekin server is not answering.');
    expect(html).toContain('You are looking at the last copy loaded at 12:41.');
    expect(html).toContain('Try again');
    expect(html).toContain('Offline · kept on this device');
    expect(html).toContain('data-save="conflict"');
    // The last loaded copy is drawn, without the design stage's busy chip (the board draws none offline).
    expect(html).toContain('Design chat');
    expect(html).toContain(PROJECT.name);
    expect(html).not.toContain('1 designing · 1 waiting');
  });

  it('with no earlier copy shows the empty state and never the sample values', () => {
    markReadFailed('project:meranti-yard', async () => {});

    const html = renderDesign();
    expect(html).toContain('data-screen="NOTFOUND"');
    expect(html).not.toContain(PROJECT.name);
    expect(html).not.toContain('Design chat');
  });
});
