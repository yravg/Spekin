import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { INTAKE_COMPOSER, INTAKE_DELETED, INTAKE_NEW, INTAKE_PROJECTS } from '@spekin/sample';
import { ProjectsHome, SwitchPalette, CreateProjectModal } from './ProjectsHome';

const noop = () => {};

function renderAt(path: string, initialView?: 'home' | 'all' | 'first' | 'restore') {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<ProjectsHome initialView={initialView ?? 'home'} />} />
        <Route path="/projects" element={<ProjectsHome initialView="all" />} />
        <Route path="/welcome" element={<ProjectsHome initialView="first" />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('S27 Projects home (IMP-05)', () => {
  it('renders Home at "/" with hero composer, starting chips and first 4 recent projects', () => {
    const html = renderAt('/');
    expect(html).toContain('data-screen="S27"');
    expect(html).toContain('Describe what you want to build');
    expect(html).toContain(INTAKE_COMPOSER.text);
    expect(html).toContain('View all ' + INTAKE_PROJECTS.length);
    for (const p of INTAKE_PROJECTS.slice(0, 4)) expect(html).toContain(p.name);
    expect(html).toContain('Recently deleted');
  });

  it('renders All projects at "/projects" with all 7 projects, filter tabs and stage marks legend', () => {
    const html = renderAt('/projects');
    expect(html).toContain('All projects');
    expect(html).toContain(INTAKE_PROJECTS.length + ' projects, newest opened first');
    for (const p of INTAKE_PROJECTS) expect(html).toContain(p.name);
    expect(html).toContain('Stage marks');
  });

  it('renders First run at "/welcome" with 3 start cards, 0 cr meter and Connect marked data-later', () => {
    const html = renderAt('/welcome');
    expect(html).toContain('Start your first project');
    expect(html).toContain('Describe an idea');
    expect(html).toContain('Add reference screenshots');
    expect(html).toContain('Bring an existing spec');
    expect(html).toContain('Open sample');
    expect(html.match(/data-later=/g)?.length).toBe(1);
  });

  it('renders Restore state with 30-day restore banner and Kenari Fleet marked deleted', () => {
    const html = renderAt('/', 'restore');
    expect(INTAKE_DELETED.days).toBe(30);
    expect(html).toContain('Kenari Fleet was deleted in another session');
    expect(html).toContain('Restore project');
    expect(html).toContain('Deleted ' + INTAKE_DELETED.at);
  });

  it('renders Switch project palette and Create project modal with sample data', () => {
    const pal = renderToStaticMarkup(
      <SwitchPalette
        projects={INTAKE_PROJECTS}
        selectedIndex={1}
        renamingIndex={2}
        renameValue="Bakau Permits renewals"
        onSelect={noop}
        onStartRename={noop}
        onRenameChange={noop}
        onNewProject={noop}
        onClose={noop}
      />,
    );
    expect(pal).toContain('role="dialog"');
    expect(pal).toContain('Switch project');
    expect(pal).toContain('Bakau Permits renewals');

    const mod = renderToStaticMarkup(
      <CreateProjectModal
        name={INTAKE_NEW.name}
        slug={INTAKE_NEW.slug}
        idea={INTAKE_NEW.idea}
        uiLang="en"
        startFrom="idea"
        onUiLang={noop}
        onStartFrom={noop}
        onClose={noop}
        onCreate={noop}
      />,
    );
    expect(mod).toContain('New project');
    expect(mod).toContain(INTAKE_NEW.name);
    expect(mod).toContain('/p/' + INTAKE_NEW.slug);
    expect(mod).toContain('Create project');
  });
});
