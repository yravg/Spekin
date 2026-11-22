import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { STAGES, PROJECT, USAGE } from '@spekin/sample';
import { StageBar } from './StageBar';
import { TopBar } from './TopBar';

const noop = () => {};

describe('S35 header (board S35-project-shell)', () => {
  it('lists the eight stages in order with text status, and marks the current one with aria-current', () => {
    const html = renderToStaticMarkup(<StageBar stages={STAGES} current="design" onSwitch={noop} onReadiness={noop} />);
    expect(html.match(/data-feature="F102"/g)?.length).toBe(8);
    for (const s of STAGES) expect(html).toContain(s.text);
    expect(html).toMatch(/aria-current="page"[^>]*data-stage="design"/);
  });

  it('shows the project context from the same sample the board draws', () => {
    const html = renderToStaticMarkup(
      <TopBar project={PROJECT} usage={USAGE} save={{ tone: 'ok', text: 'Saved 12:41' }} onOpenSwitcher={noop} onOpenIncrement={noop} onOpenSpec={noop} onOpenUsage={noop} onOpenInbox={noop} lang="en" onLang={noop} />,
    );
    expect(html).toContain(PROJECT.name);
    expect(html).toContain(PROJECT.increment);
    expect(html).toContain('>' + PROJECT.spec + '<');
    expect(html).not.toMatch(/class="[^"]*\bisnew\b/);
  });
});
