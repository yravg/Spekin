import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import {
  GAPB_BLOCKS,
  GAPB_EXPERT,
  GAPB_HASH,
  GAPB_IMPACT,
  GAPB_KIT,
  GAPB_MISSING,
  GAPB_PRINCIPLES,
  GAPB_SIMPLE,
} from '@spekin/sample';
import { ProjectShell } from '../shell/ProjectShell';
import { SpecDepthWorkArea, type SpecDepthView } from './SpecDepthWorkArea';

function renderRoute(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/p/:project/:stage" element={<ProjectShell />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderView(initialView: SpecDepthView) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/p/meranti-yard/spec?depth=detailed']}>
      <SpecDepthWorkArea initialView={initialView} />
    </MemoryRouter>,
  )
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"');
}

describe('S07 Spec document at every depth (IMP-58, F441-F449)', () => {
  it('routes /p/meranti-yard/spec?depth=detailed to data-screen="S07" while keeping /p/meranti-yard/spec on S40', () => {
    const s07 = renderRoute('/p/meranti-yard/spec?depth=detailed');
    expect(s07).toContain('data-screen="S07"');
    expect(s07).toContain('Behaviour spec and plan');
    expect(s07).not.toContain('data-todo');

    const s40 = renderRoute('/p/meranti-yard/spec');
    expect(s40).toContain('data-screen="S40"');
  });

  it('renders Simple depth with pitch, compact principles, shallower banner and unchanged snapshot hash (F441, F443, F445)', () => {
    const html = renderView('simple');
    expect(html).toContain('Shallower view.');
    expect(html).toContain(GAPB_HASH);
    for (const row of GAPB_SIMPLE) {
      expect(html).toContain(row.k);
      expect(html).toContain(row.t);
    }
    for (const p of GAPB_PRINCIPLES) {
      expect(html).toContain(p.id);
      expect(html).toContain(p.t);
    }
    expect(html).toContain('Project principles · compact');
    expect(html).toContain('data-feature="F441"');
    expect(html).toContain('data-feature="F443"');
    expect(html).toContain('data-feature="F445"');
  });

  it('renders Detailed depth with EARS blocks and tanpa dasar flags for blocks without basis (F444, F445)', () => {
    const html = renderView('detailed');
    expect(html).toContain('2 tanpa dasar');
    for (const b of GAPB_BLOCKS) {
      expect(html).toContain(b.id);
      expect(html).toContain(b.t);
    }
    expect(html).toContain('no decision, pack requirement or reference FR is linked');
    expect(html).toContain('Link a decision');
    expect(html).toContain('Propose removal');
    expect(html).toContain('data-feature="F444"');
  });

  it('renders Expert depth with ADRs, glossary, traceability and full principles (F441, F443, F445)', () => {
    const html = renderView('expert');
    expect(html).toContain('ADRs, glossary and traceability');
    for (const b of GAPB_EXPERT) {
      expect(html).toContain(b.id);
      expect(html).toContain(b.t);
    }
    expect(html).toContain('Trace of R-DASH-014');
    expect(html).toContain('Open S17');
  });

  it('renders Deeper: Proposal with dashed proposed blocks, P-31 banner and chat card (F442)', () => {
    const html = renderView('deeper');
    expect(html).toContain('Detailed has missing blocks.');
    expect(html).toContain('Proposal P-31');
    for (const m of GAPB_MISSING) {
      expect(html).toContain(m.id);
      expect(html).toContain(m.t);
    }
    expect(html).toContain('gpb-blk prop');
    expect(html).toContain('Send to review');
    expect(html).toContain('data-feature="F442"');
  });

  it('renders Principles change with hunk Proposal P-32 and untouched Plan card (F446)', () => {
    const html = renderView('principles');
    expect(html).toContain('PRN-4 · Principles · base r14');
    expect(html).toContain('Proposal P-32');
    expect(html).toContain('Only the project lead may edit a threshold.');
    expect(html).toContain('Accept hunk');
    expect(html).toContain('Plan, not principles');
    expect(html).toContain(GAPB_KIT.name + ' ' + GAPB_KIT.rev);
    expect(html).toContain('data-feature="F446"');
  });

  it('renders Add feature increment impact view with affected areas and kept accepted artifacts (F447, F448, F449)', () => {
    const html = renderView('impact');
    expect(html).toContain('Inc. 3 · CSV export');
    expect(html).toContain('What this increment touches');
    for (const row of GAPB_IMPACT) {
      expect(html).toContain(row.area);
      expect(html).toContain(row.item);
    }
    expect(html).toContain('Kept as accepted');
    expect(html).toContain('data-feature="F447"');
    expect(html).toContain('data-feature="F448"');
    expect(html).toContain('data-feature="F449"');
  });
});
