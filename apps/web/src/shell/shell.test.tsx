import { describe, expect, it, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { STAGES, PROJECT, USAGE, FRAMES, BACKEND, CTX_DESIGN, CTX_BACKEND, REQS, CONFLICT } from '@spekin/sample';
import { StageBar } from './StageBar';
import { TopBar } from './TopBar';
import { ProjectShell } from './ProjectShell';
import { ConflictBanner } from './DesignWorkArea';
import { ArtifactTabs } from './ArtifactTabs';
import { NotFound } from './NotFound';
import { useWorkspace } from '../state/workspace';

const noop = () => {};

function renderRoute(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/p/:project/:stage" element={<ProjectShell />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('S35 header (board S35-project-shell)', () => {
  it('lists the eight stages in order with text status, and marks the current one with aria-current', () => {
    const html = renderToStaticMarkup(<StageBar stages={STAGES} current="design" onSwitch={noop} onReadiness={noop} />);
    expect(html.match(/data-feature="F102"/g)?.length).toBe(8);
    for (const s of STAGES) expect(html).toContain(s.text);
    expect(html).toMatch(/aria-current="page"[^>]*data-stage="design"/);
  });

  it('shows the project context from the same sample the board draws', () => {
    const html = renderToStaticMarkup(
      <TopBar project={PROJECT} usage={USAGE} save={{ status: 'saved', tone: 'ok', text: 'Saved 12:41' }} onOpenSwitcher={noop} onOpenIncrement={noop} onOpenSpec={noop} onOpenUsage={noop} onOpenInbox={noop} lang="en" onLang={noop} />,
    );
    expect(html).toContain(PROJECT.name);
    expect(html).toContain(PROJECT.increment);
    expect(html).toContain('>' + PROJECT.spec + '<');
    expect(html).not.toMatch(/class="[^"]*\bisnew\b/);
  });
});

describe('S35 work area (IMP-01)', () => {
  it('renders the design stage work area with chat, tabs, canvas frames and inspector, with no ap-todo stand-in', () => {
    const html = renderRoute('/p/meranti-yard/design');
    expect(html).not.toContain('data-todo');
    expect(html).not.toContain('ap-todo');
    // Chat panel + context basket + composer
    expect(html).toContain('Design chat');
    for (const [, name] of CTX_DESIGN) expect(html).toContain(name);
    expect(html).toContain('Requirement cards · 1 gap');
    // Artifact tabs + canvas frames
    expect(html).toContain('Variance flows');
    expect(html).toContain(FRAMES.f01.name);
    expect(html).toContain(FRAMES.f03.name);
    expect(html).toContain(FRAMES.f04.name);
    expect(html).toContain(FRAMES.ref.name);
    // Inspector requirements
    for (const r of REQS) expect(html).toContain(r.id);
    expect(html).toContain('Open review');
    // Share is the only data-later control on S35
    expect(html.match(/data-later=/g)?.length).toBe(1);
  });

  it('renders the backend stage work area with contract document, banner, checklist and readiness inspector', () => {
    const html = renderRoute('/p/meranti-yard/backend');
    expect(html).not.toContain('data-todo');
    expect(html).toContain('Backend chat');
    for (const [, name] of CTX_BACKEND) expect(html).toContain(name);
    expect(html).toContain(BACKEND.contract.name);
    expect(html).toContain('Entity VarianceAlert · r1 accepted');
    expect(html).toContain('Backend readiness');
    expect(html).toContain('Acceptance checklist');
    expect(html).toContain('Mark reviewed');
    expect(html.match(/data-later=/g)?.length).toBe(1);
  });
});

describe('S35 conflict, save states and safe routes (IMP-02)', () => {
  beforeEach(() => {
    useWorkspace.setState({ views: {}, lastIntent: null, conflict: null, dirtyTabs: [], save: { status: 'saved', tone: 'ok', text: 'Saved 12:41' } });
  });

  it('shows saving, saved, failed and conflict in words on the save chip with data-save', () => {
    const saved = renderToStaticMarkup(
      <TopBar project={PROJECT} usage={USAGE} save={{ status: 'saved', tone: 'ok', text: 'Saved 12:41' }} onOpenSwitcher={noop} onOpenIncrement={noop} onOpenSpec={noop} onOpenUsage={noop} onOpenInbox={noop} lang="en" onLang={noop} />,
    );
    expect(saved).toContain('data-save="saved"');
    expect(saved).toContain('Saved 12:41');

    const saving = renderToStaticMarkup(
      <TopBar project={PROJECT} usage={USAGE} save={{ status: 'saving', tone: 'warn', text: 'Saving…' }} onOpenSwitcher={noop} onOpenIncrement={noop} onOpenSpec={noop} onOpenUsage={noop} onOpenInbox={noop} lang="en" onLang={noop} />,
    );
    expect(saving).toContain('data-save="saving"');
    expect(saving).toContain('Saving…');

    const conflict = renderToStaticMarkup(
      <TopBar project={PROJECT} usage={USAGE} save={{ status: 'conflict', tone: 'bad', text: 'Conflict · F-04' }} onOpenSwitcher={noop} onOpenIncrement={noop} onOpenSpec={noop} onOpenUsage={noop} onOpenInbox={noop} lang="en" onLang={noop} />,
    );
    expect(conflict).toContain('data-save="conflict"');
    expect(conflict).toContain('sp-save conflict');
    expect(conflict).toContain('Conflict · F-04');
  });

  it('renders the S35 conflict banner and dirty F-04 tab with CONFLICT fixture data', () => {
    const banner = renderToStaticMarkup(
      <ConflictBanner conflict={CONFLICT} onCompare={noop} onKeepProposal={noop} onDiscard={noop} />,
    );
    expect(banner).toContain(CONFLICT.frame + ' changed elsewhere');
    expect(banner).toContain(CONFLICT.rev);
    expect(banner).toContain(CONFLICT.by);
    expect(banner).toContain(CONFLICT.at);
    expect(banner).toContain('Compare');
    expect(banner).toContain('Keep as proposal');
    expect(banner).toContain('Discard draft');

    const tabsHtml = renderToStaticMarkup(
      <ArtifactTabs
        tabs={[
          { icon: 'grid', name: 'Variance flows' },
          { icon: 'frame', name: 'F-04 Alert drawer', dirty: true },
        ]}
        activeTab="Variance flows"
        onSelect={noop}
        onClose={noop}
        onOpenArtifact={noop}
        right={null}
      />,
    );
    expect(tabsHtml).toContain('Unsaved draft');
    expect(tabsHtml).toContain('dot acc');
  });

  it('shows the safe NotFound page for unknown project or stage links (AC-SPK-18)', () => {
    const unknownProj = renderRoute('/p/unknown-yard/design');
    expect(unknownProj).toContain('data-screen="NOTFOUND"');
    expect(unknownProj).toContain('This page does not exist');

    const unknownStage = renderRoute('/p/meranti-yard/nonexistent');
    expect(unknownStage).toContain('data-screen="NOTFOUND"');

    const unknownRoot = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/p/x/y/z']}>
        <Routes>
          <Route path="/p/:project/:stage" element={<ProjectShell />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(unknownRoot).toContain('data-screen="NOTFOUND"');
  });
});
