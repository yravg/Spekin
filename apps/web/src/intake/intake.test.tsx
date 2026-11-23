import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { INTAKE_LIMITS, INTAKE_PII, INTAKE_REFS } from '@spekin/sample';
import {
  addReferenceIfMissing,
  applyPiiDecision,
  ReferenceIntakeWorkArea,
  validateReferenceFile,
} from './ReferenceIntakeWorkArea';

describe('S28 Reference intake (IMP-06)', () => {
  it('uses INTAKE_LIMITS to reject oversized or unsupported files and never stores them', () => {
    const tooBig = validateReferenceFile({ name: 'payroll-export.png', mime: 'image/png', sizeMb: 14.2 }, INTAKE_LIMITS);
    expect(tooBig.ok).toBe(false);
    expect(tooBig.reason).toContain('14.2 MB');
    expect(tooBig.reason).toContain(`${INTAKE_LIMITS.sizeMb} MB`);

    const wrongType = validateReferenceFile({ name: 'spec.pdf', mime: 'application/pdf', sizeMb: 1.1 }, INTAKE_LIMITS);
    expect(wrongType.ok).toBe(false);
    expect(wrongType.reason).toContain(INTAKE_LIMITS.types);

    const valid = validateReferenceFile({ name: INTAKE_REFS.r3.src, mime: 'image/png', sizeMb: 1.2 }, INTAKE_LIMITS);
    expect(valid.ok).toBe(true);

    // Rejected files are never added; retrying an already-added ref never duplicates it.
    const existing = [INTAKE_REFS.r3, INTAKE_REFS.r4];
    const afterRejected = addReferenceIfMissing(existing, { ...INTAKE_REFS.r5, src: 'payroll-export.png' }, tooBig);
    expect(afterRejected).toHaveLength(2);
    const afterRetryExisting = addReferenceIfMissing(existing, INTAKE_REFS.r3, valid);
    expect(afterRetryExisting).toHaveLength(2);
    const afterAddNew = addReferenceIfMissing(existing, INTAKE_REFS.r5, valid);
    expect(afterAddNew).toHaveLength(3);
  });

  it('holds the import on personal data until the user blurs or removes the image', () => {
    const held = { heldRefId: INTAKE_REFS.r4.id, findings: 3, styleJobWaiting: true, blurred: false, removed: false };
    expect(held.styleJobWaiting).toBe(true);

    const blurred = applyPiiDecision(held, 'blur');
    expect(blurred.blurred).toBe(true);
    expect(blurred.removed).toBe(false);
    expect(blurred.styleJobWaiting).toBe(false);

    const removed = applyPiiDecision(held, 'remove');
    expect(removed.removed).toBe(true);
    expect(removed.styleJobWaiting).toBe(false);
  });

  it('uses C-04 consent wording and INTAKE_LIMITS in the reference panel', () => {
    const html = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="empty" />);
    expect(html).toContain(
      'I may use these images here. They stay private and go only to model providers whose terms forbid training on them.',
    );
    expect(html).toContain(`${INTAKE_LIMITS.types} · ${INTAKE_LIMITS.sizeMb} MB each · ${INTAKE_LIMITS.perImport} max`);
    expect(html).toContain(`Originals are deleted ${INTAKE_LIMITS.keepDays} days after import, unless you keep them.`);
  });

  it('renders all 6 states (empty, drop, imported, rejected, pii, pasted) with sample data and no data-todo', () => {
    const empty = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="empty" />);
    expect(empty).not.toContain('data-todo');
    expect(empty).toContain('Start from what you already have');
    expect(empty).toContain('No references yet');
    expect(empty.match(/data-later=/g)?.length).toBe(4);

    const drop = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="drop" />);
    expect(drop).toContain('Release to add 3 images');
    expect(drop).toContain(INTAKE_REFS.r3.src);
    expect(drop).toContain('62%');
    expect(drop.match(/data-later=/g)?.length).toBe(2);

    const imported = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="imported" />);
    expect(imported).toContain('Learning style from 3 references');
    expect(imported).toContain('3 references · 0 drawn frames');
    expect(imported.match(/data-later=/g)?.length).toBe(2);

    const rejected = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="rejected" />);
    expect(rejected).toContain('payroll-export.png was not added.');
    expect(rejected).toContain('Not added: over the size limit');
    expect(rejected.match(/data-later=/g)?.length).toBe(2);

    const pii = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="pii" />);
    expect(pii).toContain(`3 email addresses found in ${INTAKE_REFS.r4.id}.`);
    expect(pii).toContain(INTAKE_PII[0]![1]);
    expect(pii).toContain('Blur all 3');
    expect(pii.match(/data-later=/g)?.length).toBe(2);

    const pasted = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="pasted" />);
    expect(pasted).toContain('Pasted from the clipboard. Preview only; nothing is uploaded yet.');
    expect(pasted).toContain(INTAKE_REFS.r6.src);
    expect(pasted).toContain('Add to board');
    expect(pasted.match(/data-later=/g)?.length).toBe(2);
  });
});

describe('S28 reference intake parity (IMP-47)', () => {
  // Opening tags that carry a given data-feature id. The id must be on the element that
  // does what the board draws, never in a comment and never only in a test.
  const tagsWith = (html: string, tag: 'div' | 'button', feature: string) =>
    [...html.matchAll(new RegExp(`<${tag}[^>]*>`, 'g'))]
      .map((m) => m[0] ?? '')
      .filter((t) => t.includes(`data-feature="${feature}"`));

  it('F145: Cmd/Ctrl+V paste lands on the focusable board as a preview, never straight to a run', () => {
    const empty = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="empty" />);
    const pasteTargets = tagsWith(empty, 'div', 'F145');
    expect(pasteTargets).toHaveLength(1);
    expect(pasteTargets[0]).toContain('sp-cv');
    expect(pasteTargets[0]).toContain('int-cv');
    expect(pasteTargets[0]).toMatch(/tabindex="0"/i);
    // The empty board advertises the shortcut; reaching the pasted state shows a preview only.
    expect(empty).toContain('Paste a screenshot');
    expect(empty).toContain('⌘V');
    expect(empty).toContain('Ctrl V');
    const pasted = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="pasted" />);
    expect(pasted).toContain('Preview only; nothing is uploaded yet.');
    expect(pasted).toContain('Not added yet');
  });

  it('F147: reference frames are titled by source (ID, file name, kind, size)', () => {
    const imported = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="imported" />);
    const frames = tagsWith(imported, 'div', 'F147');
    expect(frames).toHaveLength(3);
    for (const f of frames) expect(f).toContain('sp-fr');
    for (const r of [INTAKE_REFS.r3, INTAKE_REFS.r4, INTAKE_REFS.r5]) {
      expect(imported).toContain(r.id);
      expect(imported).toContain(r.src);
      expect(imported).toContain(r.kind);
      expect(imported).toContain(r.size);
    }
  });

  it('F153: Capture a live page is shown, disabled and tagged LATER (FR-04 to FR-09)', () => {
    const empty = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="empty" />);
    const btns = tagsWith(empty, 'button', 'F153');
    expect(btns.length).toBeGreaterThanOrEqual(1);
    for (const b of btns) {
      expect(b).toContain('disabled');
      expect(b).toContain('data-later="Capture from a live page');
      expect(b).toContain('FR-04 to FR-09');
    }
    expect(empty).toContain('Capture a live page');
  });

  it('F154: Send frames from an editor over MCP is shown, disabled and tagged LATER (FR-47)', () => {
    const empty = renderToStaticMarkup(<ReferenceIntakeWorkArea initialMode="empty" />);
    const btns = tagsWith(empty, 'button', 'F154');
    expect(btns.length).toBeGreaterThanOrEqual(1);
    for (const b of btns) {
      expect(b).toContain('disabled');
      expect(b).toContain('data-later=');
      expect(b).toContain('FR-47');
    }
    expect(empty).toContain('Send frames from your editor');
    expect(empty).toContain('Connect an editor (MCP)');
  });
});
