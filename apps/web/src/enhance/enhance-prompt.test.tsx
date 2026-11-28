// @vitest-environment jsdom
import { describe, expect, it, afterEach } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ENH_BLOCKED,
  ENH_COST,
  ENH_CTX,
  ENH_NOT_SENT,
  ENH_ORIGINAL,
  ENH_SEGS,
  ENH_SHORTCUT,
} from '@spekin/sample';
import { EnhancePromptWorkArea, enhanceWordCount } from './EnhancePromptWorkArea';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

async function draw(node: ReactNode) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(node);
  });
}

afterEach(async () => {
  if (root) {
    await act(async () => {
      root!.unmount();
    });
    root = null;
  }
  if (container) {
    container.remove();
    container = null;
  }
});

async function setTextarea(el: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  await act(async () => {
    setter?.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

async function clickEl(el: Element) {
  await act(async () => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('S41 Enhance prompt (IMP-67, F531–F539)', () => {
  it('renders the empty state with disabled sparkle button left of Send and tooltip (F531)', () => {
    const html = renderToStaticMarkup(<EnhancePromptWorkArea />);
    expect(html).not.toMatch(/class="[^"]*\bisnew\b/);
    expect(html).not.toContain('newtag');
    expect(html).toContain('Ask for a change to F-03, or @ another frame…');
    expect(html).toContain('Write a message first: there is nothing to enhance');
    expect(html).toContain(ENH_SHORTCUT);
    expect(html).toContain('data-feature="F531"');
    expect(html).toContain('aria-label="Enhance prompt"');
    expect(html).toContain('aria-disabled="true"');
    // Sparkle button sits immediately before Send in the composer row
    const sparkIdx = html.indexOf('aria-label="Enhance prompt"');
    const sendIdx = html.indexOf('aria-label="Send"');
    expect(sparkIdx).toBeGreaterThan(-1);
    expect(sendIdx).toBeGreaterThan(sparkIdx);
  });

  it('activates Enhance when draft is non-empty and runs via click or Ctrl/Cmd+Shift+E (F531, F532)', async () => {
    await draw(<EnhancePromptWorkArea />);
    const ta = container!.querySelector('textarea[aria-label="Message composer"]') as HTMLTextAreaElement;

    // Shortcut does nothing on empty draft
    await act(async () => {
      ta.dispatchEvent(new KeyboardEvent('keydown', { key: 'E', ctrlKey: true, shiftKey: true, bubbles: true }));
    });
    expect(container!.querySelector('.enh-prog')).toBeNull();

    // Type draft -> ready state
    await setTextarea(ta, ENH_ORIGINAL);
    const spark = container!.querySelector('button[aria-label="Enhance prompt"]') as HTMLButtonElement;
    expect(spark.getAttribute('aria-disabled')).toBeNull();
    expect(container!.querySelector('.enh-tip')?.textContent).toContain('Enhance prompt');

    // Shortcut Ctrl+Shift+E starts busy state
    await act(async () => {
      ta.dispatchEvent(new KeyboardEvent('keydown', { key: 'E', ctrlKey: true, shiftKey: true, bubbles: true }));
    });
    expect(container!.querySelector('button[aria-label="Enhancing prompt"]')?.getAttribute('aria-busy')).toBe('true');
    expect(container!.textContent).toContain('Draft locked while Enhance runs');
    expect(container!.querySelector('button[aria-label="Send"]')?.getAttribute('aria-disabled')).toBe('true');

    // Cancel unlocks draft unchanged
    const cancelBtn = [...container!.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Cancel')!;
    await clickEl(cancelBtn);
    const taAfter = container!.querySelector('textarea[aria-label="Message composer"]') as HTMLTextAreaElement;
    expect(taAfter.value).toBe(ENH_ORIGINAL);
  });

  it('shows proposal review with compare sheet, context list, removable assumptions, and keeps Bahasa Indonesia (F533, F534, F535, F537, F538)', async () => {
    let sentCount = 0;
    await draw(<EnhancePromptWorkArea onSend={() => { sentCount += 1; }} />);
    const ta = container!.querySelector('textarea[aria-label="Message composer"]') as HTMLTextAreaElement;
    await setTextarea(ta, ENH_ORIGINAL);
    await clickEl(container!.querySelector('button[aria-label="Enhance prompt"]')!);

    // Complete run into review state
    await clickEl(container!.querySelector('.enh-prog span:not(.enh-spin)')!);

    // Compare sheet and context list (F533, F534)
    expect(container!.textContent).toContain('Enhanced prompt');
    expect(container!.textContent).toContain('Compare');
    for (const [, label] of ENH_CTX) {
      expect(container!.textContent).toContain(label);
    }
    expect(container!.textContent).toContain(ENH_NOT_SENT);

    // F538: Bahasa Indonesia stays Bahasa Indonesia
    expect(container!.textContent).toContain('Tambahkan');
    expect(container!.textContent).toContain('Bahasa Indonesia stays Bahasa Indonesia');

    // Send is disabled during review
    expect(container!.querySelector('button[aria-label="Send"]')?.getAttribute('aria-disabled')).toBe('true');

    // F537: Remove assumption A1 deletes only A1 and updates word count
    const fullWords = enhanceWordCount(ENH_SEGS.map((s) => s[1]).join(''));
    expect(container!.textContent).toContain(`${fullWords} words`);
    await clickEl(container!.querySelector('button[aria-label="Remove assumption A1"]')!);
    expect(container!.querySelector('button[aria-label="Remove assumption A1"]')).toBeNull();
    expect(container!.querySelector('button[aria-label="Remove assumption A2"]')).not.toBeNull();

    // F535: Use never sends by itself
    const useBtn = [...container!.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Use')!;
    await clickEl(useBtn);
    expect(sentCount).toBe(0);
    expect(container!.querySelector('.enh-chip')?.textContent).toContain('Enhanced');
    expect(container!.querySelector('.enh-chip')?.textContent).toContain(ENH_COST.actual);
  });

  it('restores exact original draft on Undo enhance and only sends when user presses Send (F535, F536)', async () => {
    let sentCount = 0;
    await draw(<EnhancePromptWorkArea onSend={() => { sentCount += 1; }} />);
    const ta = container!.querySelector('textarea[aria-label="Message composer"]') as HTMLTextAreaElement;
    await setTextarea(ta, ENH_ORIGINAL);
    await clickEl(container!.querySelector('button[aria-label="Enhance prompt"]')!);
    await clickEl(container!.querySelector('.enh-prog span:not(.enh-spin)')!);
    const useBtn = [...container!.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Use')!;
    await clickEl(useBtn);

    // Still not sent
    expect(sentCount).toBe(0);

    // Undo enhance restores exact original draft
    const undoBtn = [...container!.querySelectorAll('button')].find((b) => b.textContent?.includes('Undo enhance'))!;
    await clickEl(undoBtn);
    const taRestored = container!.querySelector('textarea[aria-label="Message composer"]') as HTMLTextAreaElement;
    expect(taRestored.value).toBe(ENH_ORIGINAL);
    expect(sentCount).toBe(0);

    // Pressing Send actually sends
    await clickEl(container!.querySelector('button[aria-label="Send"]')!);
    expect(sentCount).toBe(1);
  });

  it('blocks Enhance when credit cap is reached and shows recovery variants without changing draft (F539)', async () => {
    let overrideUsed: number | undefined;
    await draw(
      <EnhancePromptWorkArea
        capped
        onShellOverride={(ov) => {
          overrideUsed = ov.usage?.used;
        }}
      />,
    );
    const ta = container!.querySelector('textarea[aria-label="Message composer"]') as HTMLTextAreaElement;
    await setTextarea(ta, ENH_ORIGINAL);
    await clickEl(container!.querySelector('button[aria-label="Enhance prompt"]')!);

    expect(container!.textContent).toContain(ENH_BLOCKED[0]![0]);
    expect(container!.textContent).toContain('When Enhance cannot run');
    expect(container!.textContent).toContain(ENH_ORIGINAL);
    expect(container!.querySelector('button[aria-label="Enhance prompt"]')?.getAttribute('aria-disabled')).toBe('true');
    expect(container!.querySelector('button[aria-label="Send"]')?.getAttribute('aria-disabled')).toBe('true');
    expect(overrideUsed).toBe(5000);
  });
});
