import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DELIVERY_ITEMS, DELIVERY_MANIFEST } from '@spekin/sample';
import {
  buildHandoffManifest,
  CodingHandoffWorkArea,
  isSelectableForHandoff,
  serializeHandoffExport,
} from './CodingHandoffWorkArea';

describe('S34 Coding handoff (IMP-16)', () => {
  it('allows only accepted revisions to be selected and excludes drafts, takes, references and stale guides', () => {
    const [f01, f03, f04, takes, ref02, dsg] = DELIVERY_ITEMS;
    expect(isSelectableForHandoff(f01!)).toBe(true);
    expect(isSelectableForHandoff(f03!)).toBe(true);
    expect(isSelectableForHandoff(dsg!)).toBe(true);
    expect(isSelectableForHandoff(dsg!, true)).toBe(false);
    expect(isSelectableForHandoff(f04!)).toBe(false);
    expect(isSelectableForHandoff(takes!)).toBe(false);
    expect(isSelectableForHandoff(ref02!)).toBe(false);
  });

  it('builds a manifest with exact revisions, exclusions, hashes, explicit missing inputs, and no share link (DPAI)', () => {
    const manifest = buildHandoffManifest({
      manifestId: DELIVERY_MANIFEST.id,
      specRev: DELIVERY_MANIFEST.spec,
      framework: 'react',
      items: DELIVERY_ITEMS,
      selectedKeys: ['F-01:frame', 'F-03:frame', 'DESIGN.md:design'],
      missingInputs: ['PRD: missing'],
    });

    expect(manifest.manifest).toBe('m-0007');
    expect(manifest.spec).toBe('r14');
    expect(manifest.frames).toHaveLength(2);
    expect(manifest.frames[0]).toMatchObject({
      id: 'F-01',
      revision: 'r4',
      sha256: DELIVERY_ITEMS[0]!.sha,
    });
    expect(manifest.frames[1]).toMatchObject({
      id: 'F-03',
      revision: 'r6',
      sha256: DELIVERY_ITEMS[1]!.sha,
    });
    expect(manifest.design).toMatchObject({
      id: 'DESIGN.md',
      revision: 'r3',
      sha256: DELIVERY_ITEMS[5]!.sha,
    });
    expect(manifest.excluded).toEqual(['F-04 draft', 'F-03 takes', 'REF-02']);
    expect(manifest.missingInputs).toEqual(['PRD: missing']);
    expect(manifest.shareLink).toBeNull();
  });

  it('produces byte-identical exports for two exports of the same selection (DPAI)', () => {
    const args = {
      manifestId: DELIVERY_MANIFEST.id,
      specRev: DELIVERY_MANIFEST.spec,
      framework: 'react',
      items: DELIVERY_ITEMS,
      selectedKeys: ['F-01:frame', 'F-03:frame', 'DESIGN.md:design'],
      missingInputs: ['PRD: missing'],
    };
    const first = serializeHandoffExport(buildHandoffManifest(args));
    const second = serializeHandoffExport(buildHandoffManifest(args));
    expect(first).toBe(second);
    const enc = new TextEncoder();
    expect(Array.from(enc.encode(first))).toEqual(Array.from(enc.encode(second)));
  });

  it('renders all 6 states (select, manifest, ready, copied, blocked, stale) with sample data, no data-todo, and Share as LATER', () => {
    const select = renderToStaticMarkup(<CodingHandoffWorkArea initialMode="select" />);
    expect(select).not.toContain('data-todo');
    expect(select).toContain('2 of 3 accepted ticked');
    expect(select).toContain('F-03 Variance table r6 · not ticked yet');
    expect(select.match(/data-later=/g)?.length).toBe(1);

    const manifest = renderToStaticMarkup(<CodingHandoffWorkArea initialMode="manifest" />);
    expect(manifest).toContain('3 of 3 accepted ticked');
    expect(manifest).toContain('F-03 r6 selected');
    expect(manifest).toContain('manifest.json');
    expect(manifest.match(/data-later=/g)?.length).toBe(1);

    const ready = renderToStaticMarkup(<CodingHandoffWorkArea initialMode="ready" />);
    expect(ready).toContain('Privacy check passed');
    expect(ready).toContain(DELIVERY_MANIFEST.zip);
    expect(ready.match(/data-later=/g)?.length).toBe(1);

    const copied = renderToStaticMarkup(<CodingHandoffWorkArea initialMode="copied" />);
    expect(copied).toContain('Copied for your coding agent');
    expect(copied).toContain('Copy as one link');
    expect(copied.match(/data-later=/g)?.length).toBe(2);

    const blocked = renderToStaticMarkup(<CodingHandoffWorkArea initialMode="blocked" />);
    expect(blocked).toContain('Hand-off blocked.');
    expect(blocked).toContain('3 ticked · 2 need fixing');
    expect(blocked).toContain('Pick r6');
    expect(blocked.match(/data-later=/g)?.length).toBe(1);

    const stale = renderToStaticMarkup(<CodingHandoffWorkArea initialMode="stale" />);
    expect(stale).toContain('DESIGN.md r3 is stale.');
    expect(stale).toContain('m-0008');
    expect(stale).toContain('Re-finalize (spec is stale)');
    expect(stale.match(/data-later=/g)?.length).toBe(1);
  });

  it('F275: one expiring link is a disabled LATER control carrying its id, not a shipped link', () => {
    const copied = renderToStaticMarkup(<CodingHandoffWorkArea initialMode="copied" />);
    expect(copied).toContain('Copy as one link');
    expect(copied).toContain('data-feature="F275"');
    expect(copied).toContain('data-later="A single expiring link instead of the long text');
    // The long pasted text stays; the single-link option is deferred, not wired to a URL.
    expect(copied).toContain('Links would expire.');
    // The F275 id sits on the same disabled, LATER-tagged button.
    const at = copied.indexOf('data-feature="F275"');
    expect(at).toBeGreaterThan(-1);
    const tag = copied.slice(copied.lastIndexOf('<', at), at);
    expect(tag).toContain('data-later=');
    expect(tag).toContain('disabled');
  });
});
