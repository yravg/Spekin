import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GAPD_EXPORT } from '@spekin/sample';
import { ExportWorkArea, countSelectedStatusUpdates } from './ExportWorkArea';

describe('S25 Export (IMP-66)', () => {
  it('counts selected ticket status updates from yravgbuilder without auto-accepting', () => {
    expect(countSelectedStatusUpdates(GAPD_EXPORT.statusBack, [true, true, false])).toBe(2);
    expect(countSelectedStatusUpdates(GAPD_EXPORT.statusBack, [true, false, false])).toBe(1);
    expect(countSelectedStatusUpdates(GAPD_EXPORT.statusBack, [false, false, false])).toBe(0);
  });

  it('renders md state with format chooser, accepted-only scope, file tree, and manifest card', () => {
    const html = renderToStaticMarkup(<ExportWorkArea initialMode="md" />);
    expect(html).not.toContain('data-todo');
    expect(html).toContain('Export project');
    expect(html).toContain('data-feature="F521"');
    expect(html).toContain('data-feature="F522"');
    expect(html).toContain('data-feature="F523"');
    expect(html).toContain('data-feature="F528"');
    expect(html).toContain('Preview · what the files will contain');
    expect(html).toContain(GAPD_EXPORT.name);
    expect(html).toContain('MANIFEST.json');
    expect(html).toContain('Export Markdown');
  });

  it('renders yb state with spec layers, AREA-NNN tickets, design files, and MCP/CLI marked LATER', () => {
    const html = renderToStaticMarkup(<ExportWorkArea initialMode="yb" />);
    expect(html).toContain('data-feature="F524"');
    expect(html).toContain('data-feature="F525"');
    expect(html).toContain('data-feature="F526"');
    expect(html).toContain('yravgbuilder bundle');
    expect(html).toContain('VAR-001');
    expect(html).toContain('VAR-004');
    expect(html).toContain('DESIGN.md r3');
    expect(html).toContain('Export for yravgbuilder');
    expect(html.match(/data-later=/g)?.length).toBe(2);
  });

  it('renders left state with warning banner, left-out groups, redaction check, and stale reference', () => {
    const html = renderToStaticMarkup(<ExportWorkArea initialMode="left" />);
    expect(html).toContain('data-feature="F527"');
    expect(html).toContain('6 items are not accepted.');
    expect(html).toContain('Left out of this export');
    expect(html).toContain('3 draft frames');
    expect(html).toContain('DATABASE_URL');
    expect(html).toContain('SESSION_KEY');
    expect(html).toContain('T-198');
    expect(html).toContain('Export accepted only');
    expect(html).toContain('Review drafts first');
  });

  it('renders build state with real file-count progressbar and Cancel build', () => {
    const html = renderToStaticMarkup(<ExportWorkArea initialMode="build" />);
    expect(html).toContain('Building the zip');
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="8"');
    expect(html).toContain('aria-valuemax="11"');
    expect(html).toContain('Writing files: 8 of 11');
    expect(html).toContain('Cancel build');
  });

  it('renders done state with recorded file metadata, checksum, and status-back drop zone', () => {
    const html = renderToStaticMarkup(<ExportWorkArea initialMode="done" />);
    expect(html).toContain('Export ready');
    expect(html).toContain(`${GAPD_EXPORT.name}-yb.zip`);
    expect(html).toContain('9c41 e07b 5d2a 18f3 aa60 71c9');
    expect(html).toContain('data-feature="F529"');
    expect(html).toContain('Bring ticket status back.');
    expect(html).toContain('Choose file');
    expect(html).toContain('Download again');
    expect(html).toContain('Copy hand-over note');
  });

  it('renders back state with ticket status diff table and non-acceptance disclaimer', () => {
    const html = renderToStaticMarkup(<ExportWorkArea initialMode="back" />);
    expect(html).toContain('Ticket status from yravgbuilder');
    expect(html).toContain('Apply 2 changes');
    expect(html).toContain('Discard');
    expect(html).toContain('VAR-001');
    expect(html).toContain('Built · tests pass');
    expect(html).toContain('What this does not do');
  });
});
