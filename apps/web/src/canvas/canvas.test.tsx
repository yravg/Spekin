import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CANVAS_FRAMES, CANVAS_TAKES } from '@spekin/sample';
import {
  buildNextRequestContext,
  countBoardItems,
  isDragGesture,
  FramesCanvasWorkArea,
  type CanvasContextChip,
} from './FramesCanvasWorkArea';

describe('S29 Frames canvas (IMP-07)', () => {
  it('DPAI-1: builds next request payload strictly from listed context chips, never hidden frames or whole board', () => {
    const allFrames = Object.values(CANVAS_FRAMES);
    const snapshotBefore = JSON.stringify(allFrames);
    const chips: CanvasContextChip[] = [
      { icon: 'frame', name: 'F-03 Variance table', rev: 'r6', tokens: 6000 },
      { icon: 'doc', name: 'DESIGN.md', rev: 'r3', tokens: 3000 },
    ];
    const req = buildNextRequestContext('Ask about F-03', chips, allFrames);
    expect(req.items.map((i) => i.name)).toEqual(['F-03 Variance table', 'DESIGN.md']);
    expect(req.items).toHaveLength(2);
    expect(req.wholeBoardSent).toBe(false);
    expect(req.estimatedTokens).toBe(9000);
    // Hidden/unlisted frames are never included
    expect(req.items.some((i) => i.name.includes('F-01') || i.name.includes('F-05'))).toBe(false);

    // Removing a chip changes context only, never board content
    const nextChips = chips.filter((c) => c.name !== 'DESIGN.md');
    const reqAfterRemove = buildNextRequestContext('Ask about F-03', nextChips, allFrames);
    expect(reqAfterRemove.items.map((i) => i.name)).toEqual(['F-03 Variance table']);
    expect(reqAfterRemove.estimatedTokens).toBe(6000);
    expect(JSON.stringify(allFrames)).toBe(snapshotBefore);
  });

  it('DPAI-2: counts logical frames apart from takes and previews', () => {
    const frames = Object.values(CANVAS_FRAMES);
    const counts = countBoardItems(frames, CANVAS_TAKES.length);
    expect(counts.frames).toBe(6);
    expect(counts.takes).toBe(5);
    // Adding more takes does not change logical frame count
    const moreTakes = countBoardItems(frames, CANVAS_TAKES.length + 3);
    expect(moreTakes.frames).toBe(6);
    expect(moreTakes.takes).toBe(8);
  });

  it('F162: treats a press of 3 px or less as a click and longer as a drag', () => {
    expect(isDragGesture(100, 100, 103, 100)).toBe(false);
    expect(isDragGesture(100, 100, 102, 102)).toBe(false);
    expect(isDragGesture(100, 100, 104, 100)).toBe(true);
    expect(isDragGesture(100, 100, 100, 105)).toBe(true);
  });

  it('DPAI-3 & states: renders board, multi, chat, jobs, over and empty states with active tool and focusable tabs/rail', () => {
    const boardHtml = renderToStaticMarkup(<FramesCanvasWorkArea initialState="board" />);
    expect(boardHtml).not.toContain('data-todo');
    expect(boardHtml).toContain('6 frames · 5 takes');
    expect(boardHtml).toContain('Ask about F-03 Variance table');
    expect(boardHtml).toContain('aria-pressed="true"');
    expect(boardHtml).toContain('role="tablist"');
    expect(boardHtml).toContain('aria-label="Canvas tools"');
    expect(boardHtml.match(/data-later=/g)?.length).toBe(1);

    const multiHtml = renderToStaticMarkup(<FramesCanvasWorkArea initialState="multi" />);
    expect(multiHtml).toContain('3 of 6 frames selected');
    expect(multiHtml).toContain('F-05 is below');
    expect(multiHtml).toContain('Recenter');

    const chatHtml = renderToStaticMarkup(<FramesCanvasWorkArea initialState="chat" />);
    expect(chatHtml).toContain('F-04 Alert drawer');
    expect(chatHtml).toContain('Copied from F-03.');
    expect(chatHtml).toContain('Copy of F-03');

    const jobsHtml = renderToStaticMarkup(<FramesCanvasWorkArea initialState="jobs" />);
    expect(jobsHtml).toContain('2 of 2 design slots in use.');
    expect(jobsHtml).toContain('Could not finish this frame');

    const overHtml = renderToStaticMarkup(<FramesCanvasWorkArea initialState="over" />);
    expect(overHtml).toContain('Variance flows · 7 items');
    expect(overHtml).toContain('Zoom to fit');
    expect(overHtml).toContain('Earlier chats');

    const emptyHtml = renderToStaticMarkup(<FramesCanvasWorkArea initialState="empty" />);
    expect(emptyHtml).toContain('This board has no frames yet');
    expect(emptyHtml).toContain('Spec r14 has no frame for these yet');
  });
});
