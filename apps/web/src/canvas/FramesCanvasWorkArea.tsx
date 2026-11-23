import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { sampleData, type SampleCanvasFrame } from '../data/source';
const { CANVAS_BASELINE, CANVAS_CHATS, CANVAS_FRAMES, CANVAS_REGIONS, CANVAS_STACK, CANVAS_TAKES, CANVAS_VIEWMENU, MODEL, REQS } = sampleData;
import { useWorkspace, type SaveState } from '../state/workspace';
import { Icon, type IconName } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { ViewSwitch } from '../shell/ViewSwitch';
import { ChatPanel } from '../shell/ChatPanel';
import { CanvasMiniUi, ReferenceImageStub, ScaledCanvasUi } from './CanvasMiniUi';

export type CanvasBoardState = 'board' | 'multi' | 'chat' | 'jobs' | 'over' | 'empty';

// S31 Alternatives: the takes stack viewer over the board (stack, grid, cmp, gen, fail) and the kept toast.
export type TakesViewerKind = 'stack' | 'grid' | 'cmp' | 'gen' | 'fail';
export type TakesViewerState = TakesViewerKind | 'closed';

export interface CanvasContextChip {
  icon: IconName;
  name: string;
  rev: string;
  tokens: number;
}

export interface NextRequestPayload {
  prompt: string;
  items: { icon: IconName; name: string; rev: string }[];
  estimatedTokens: number;
  wholeBoardSent: false;
}

// DPAI check 1: builds the next request strictly from the listed chips, never hidden frames or the whole board.
// Pure function: never mutates boardFrames, never sends, accepts or spends.
export function buildNextRequestContext(
  prompt: string,
  chips: readonly CanvasContextChip[],
  _boardFrames: readonly SampleCanvasFrame[],
): NextRequestPayload {
  return {
    prompt,
    items: chips.map(({ icon, name, rev }) => ({ icon, name, rev })),
    estimatedTokens: chips.reduce((sum, c) => sum + c.tokens, 0),
    wholeBoardSent: false,
  };
}

// DPAI check 2: logical frames are counted apart from takes and previews.
export function countBoardItems(frames: readonly SampleCanvasFrame[], takesCount: number): { frames: number; takes: number } {
  return { frames: frames.length, takes: takesCount };
}

// F162: a press moving 3 px or less is a click; longer is a drag.
export function isDragGesture(startX: number, startY: number, endX: number, endY: number): boolean {
  return Math.hypot(endX - startX, endY - startY) > 3;
}

const CANVAS_TABS: ArtifactTabItem[] = [
  { icon: 'grid', name: 'Variance flows' },
  { icon: 'frame', name: 'F-03 Variance table' },
  { icon: 'frame', name: 'F-04 Alert drawer', dirty: true },
  { icon: 'doc', name: 'DESIGN.md' },
];

const HANDLE_STYLES: React.CSSProperties[] = [
  { left: '-4px', top: '-4px' },
  { left: 'calc(50% - 4px)', top: '-4px' },
  { right: '-4px', top: '-4px' },
  { left: '-4px', top: 'calc(50% - 4px)' },
  { right: '-4px', top: 'calc(50% - 4px)' },
  { left: '-4px', bottom: '-4px' },
  { left: 'calc(50% - 4px)', bottom: '-4px' },
  { right: '-4px', bottom: '-4px' },
];

const RAIL_TOOLS: [IconName, string, string][] = [
  ['pointer', 'Select (V)', 'Selects and moves frames; a press that moves less than 3 px stays a click'],
  ['hand', 'Pan (H)', 'Pans the board; holding Space does the same'],
  ['frame', 'New frame (F)', 'Draws an empty frame with a live size readout, then asks for a prompt or a reference'],
  ['type', 'Text (T)', 'Adds a text note to the board; notes are not sent to a run unless selected'],
  ['comment', 'Nitpick pin (C)', 'Drops a pin on a frame region to start a targeted change (S32)'],
];

const MENU_DOES = [
  'Fits every frame in view with a 250 ms camera move',
  'Fits only the selected frames in view',
  'Sets the board to 100%; frames show at design size',
  'Zooms in one step',
  'Zooms out one step',
];

const COL = [130, 452, 774, 1096] as const;
const R1 = 60;
const R2 = 306;
const Z_BOARD = 0.2;
const CW = Math.round(1280 * Z_BOARD);

function FlowArrows({ id, lines }: { id: string; lines: [number, number, number, number, boolean?][] }) {
  return (
    <svg className="can-arrows" width={1418} height={694} aria-hidden="true">
      <defs>
        <marker id={id} viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0 0L8 4L0 8z" fill="currentColor" />
        </marker>
      </defs>
      {lines.map(([x1, y1, x2, y2, dashed], idx) => (
        <path
          key={idx}
          d={`M${x1} ${y1} L${x2} ${y2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeDasharray={dashed ? '4 4' : undefined}
          markerEnd={`url(#${id})`}
        />
      ))}
    </svg>
  );
}

function FrameCover(props: {
  kind: 'designing' | 'waiting' | 'failed';
  frame: SampleCanvasFrame;
  rev?: string;
  time?: string;
  compact?: boolean;
  onAction: (id: string) => void;
}) {
  const { kind, frame, rev, time, compact, onAction } = props;
  const c = compact ? ' compact' : '';
  if (kind === 'designing') {
    return (
      <div className={'can-cover designing' + c} role="status">
        <span className="ci">
          <Icon name="spark" size={18} />
        </span>
        <div className="tt">Designing {rev}</div>
        <div className="sb">
          Reading {frame.id} {frame.rev} and DESIGN.md r3 · {time}
        </div>
        <div className="ac">
          <Btn
            label="Stop"
            sm
            does={`Stops this job for ${frame.id}; the accepted revision stays as it is and unused credits are released`}
            feature="F170"
            onClick={() => onAction('stop:' + frame.id)}
          />
        </div>
      </div>
    );
  }
  if (kind === 'waiting') {
    return (
      <div className={'can-cover waiting' + c} role="status">
        <span className="ci">
          <Icon name="history" size={18} />
        </span>
        <div className="tt">Waiting for a free slot</div>
        {compact ? null : (
          <div className="sb">First in line. It starts when a running job ends; nothing is charged while it waits.</div>
        )}
        <div className="ac">
          <Btn
            label="Cancel"
            sm
            does={`Takes ${frame.id} out of the queue; nothing was reserved`}
            feature="F170"
            onClick={() => onAction('cancel:' + frame.id)}
          />
        </div>
      </div>
    );
  }
  return (
    <div className={'can-cover failed' + c} role="alert">
      <span className="ci">
        <Icon name="alert" size={18} />
      </span>
      <div className="tt">Could not finish this frame</div>
      <div className="sb">The model stopped after 90 s. The unused reservation was released.</div>
      <div className="ac">
        <Btn
          label="Retry"
          sm
          cls="ink"
          icon="redo"
          does={`Reruns ${frame.id} with the same context and revisions; no duplicate charge`}
          feature="F170"
          onClick={() => onAction('retry:' + frame.id)}
        />
        <Btn
          label="Dismiss"
          sm
          does={`Removes the failed attempt; ${frame.id} stays as an empty draft`}
          feature="F170"
          onClick={() => onAction('dismiss:' + frame.id)}
        />
      </div>
    </div>
  );
}

function BoardFrame(props: {
  frame: SampleCanvasFrame;
  x: number;
  y: number;
  z: number;
  sel?: boolean;
  handles?: boolean;
  size?: boolean;
  cover?: React.ReactNode;
  chrome?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  onExport?: (id: string) => void;
  onMore?: (id: string) => void;
}) {
  const { frame: f, x, y, z, sel, handles, size, cover, chrome = true, onClick, onDoubleClick, onExport, onMore } = props;
  const isRef = f.ui === 'ref';
  const w = Math.round((isRef ? 960 : 1280) * z);
  const h = Math.round(900 * z);
  const downPos = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      className={['can-fr', sel ? 'sel' : '', f.st === 'draft' ? 'draft' : ''].filter(Boolean).join(' ')}
      style={{ left: x + 'px', top: y + 'px', width: w + 'px' }}
      data-frame={f.id}
      onPointerDown={(e) => {
        downPos.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        if (!downPos.current) return;
        const dragged = isDragGesture(downPos.current.x, downPos.current.y, e.clientX, e.clientY);
        downPos.current = null;
        if (!dragged && onClick) onClick(e);
      }}
      onDoubleClick={onDoubleClick}
    >
      <div className="can-fh">
        <b>{f.id}</b>
        <span className="t">{f.name}</span>
        {f.rev ? <span className="r">{f.rev}</span> : null}
        {f.st === 'draft' ? <span className="dt">Draft</span> : null}
        <span className="can-fill" />
        {chrome ? (
          <>
            {w > 200 ? (
              <IconBtn
                icon="download"
                label={`Export ${f.id}`}
                sm
                does={`Exports ${f.id} as PNG or HTML; a draft carries a Draft mark and exports are never counted as accepted`}
                feature="F164"
                onClick={() => onExport?.(f.id)}
              />
            ) : null}
            <IconBtn
              icon="more"
              label={`More actions for ${f.id}`}
              sm
              does="Opens frame actions: open as a tab, duplicate (Alt-drag does the same), copy link, delete"
              feature="F164"
              onClick={() => onMore?.(f.id)}
            />
          </>
        ) : null}
      </div>
      <div className="can-fbw">
        <div className="can-fb" style={{ height: h + 'px' }}>
          {isRef ? (
            <ReferenceImageStub />
          ) : (
            <div className="can-sc" style={{ width: w + 'px', height: h + 'px', ['--s' as string]: z * 2 }}>
              <CanvasMiniUi kind={f.ui} />
            </div>
          )}
          {cover}
        </div>
        {handles ? HANDLE_STYLES.map((st, idx) => <span key={idx} className="hdl" style={st} />) : null}
        {size ? <span className="can-size">{f.size}</span> : null}
      </div>
    </div>
  );
}

function StackCard({
  x,
  y,
  z,
  n,
  open = true,
  onOpenStack,
}: {
  x: number;
  y: number;
  z: number;
  n: number;
  open?: boolean;
  onOpenStack: () => void;
}) {
  const w = Math.round(1280 * z);
  const h = Math.round(900 * z);
  return (
    <div className="can-fr" style={{ left: x + 'px', top: y + 'px', width: w + 'px' }}>
      <div className="can-fh">
        <b>F-03</b>
        <span className="t">alternatives</span>
        <span className="r">{n} takes</span>
        <span className="can-fill" />
        {open ? (
          <Btn
            label="Open stack"
            sm
            does="Opens the takes viewer (S31) over the board: Single or Grid, with Keep on board"
            feature="F164"
            onClick={onOpenStack}
          />
        ) : null}
      </div>
      <div className="can-stk" style={{ height: h + 'px' }}>
        <span className="bk" style={{ transform: 'translate(12px,12px)' }} />
        <span className="bk" style={{ transform: 'translate(6px,6px)' }} />
        <div className="can-fb" style={{ height: h + 'px' }}>
          <ScaledCanvasUi kind={CANVAS_TAKES[0]!?.ui ?? 'hierarchy'} scale={w / 640} />
        </div>
      </div>
    </div>
  );
}

export interface CanvasShellOverride {
  save?: SaveState;
  busyNode?: React.ReactNode;
  screen?: string;
}

// S29 Frames canvas (boards-canvas.mjs). States: board, multi, chat, jobs, over, empty.
export function FramesCanvasWorkArea(props: {
  initialState?: CanvasBoardState;
  onShellOverride?: (o: CanvasShellOverride) => void;
}) {
  const { initialState = 'board', onShellOverride } = props;
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const [mode, setMode] = useState<CanvasBoardState>(initialState);
  const [tool, setTool] = useState<IconName>(initialState === 'empty' ? 'frame' : 'pointer');
  const [viewMenuOpen, setViewMenuOpen] = useState(initialState === 'over');
  const [chatsFanned, setChatsFanned] = useState(initialState === 'over');
  const [removedChips, setRemovedChips] = useState<string[]>([]);
  const [chatDraft, setChatDraft] = useState('');
  const [viewer, setViewer] = useState<TakesViewerState>('closed');
  const [takeIdx, setTakeIdx] = useState(2);
  const [kept, setKept] = useState(false);

  const viewerOpen = viewer !== 'closed';
  const openStack = () => {
    setTakeIdx(2);
    setViewer('stack');
  };
  const keepTake = () => {
    setKept(true);
    setViewer('closed');
  };

  // Sync top bar save state & busy chip to match the board's state.
  useLayoutEffect(() => {
    if (!onShellOverride) return;
    const screen = viewerOpen || kept ? 'S31' : undefined;
    const saveText = viewerOpen || kept ? 'Saved 12:47' : null;
    if (mode === 'multi') {
      onShellOverride({ save: { status: 'saved', tone: 'ok', text: saveText ?? 'Saved 12:44' }, screen });
    } else if (mode === 'jobs' || viewer === 'gen') {
      onShellOverride({
        save: { status: 'saving', tone: 'warn', text: saveText ?? 'Saving…' },
        busyNode: (
          <span style={{ position: 'relative', display: 'inline-flex' }} data-feature="F171">
            <button
              type="button"
              className="sp-chip can-busy"
              data-does="Opens the job list: what is designing and what is waiting, with Stop and Cancel for each"
              data-feature="F171"
              onClick={() => recordIntent('F171:jobs')}
            >
              <span className="dot" />
              <span>
                <b>2</b> designing, <b>1</b> waiting
              </span>
            </button>
          </span>
        ),
        screen,
      });
    } else if (mode === 'empty') {
      onShellOverride({ save: { status: 'saved', tone: 'ok', text: saveText ?? 'Saved 12:02' }, screen });
    } else {
      onShellOverride({ save: { status: 'saved', tone: 'ok', text: saveText ?? 'Saved 12:41' }, screen });
    }
  }, [mode, viewer, viewerOpen, kept, onShellOverride, recordIntent]);

  // DPAI check 3: Escape leaves select mode / closes overlays, active tool is visible, keys switch tools & zoom.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (viewerOpen) {
          setViewer('closed');
          return;
        }
        setViewMenuOpen(false);
        setChatsFanned(false);
        setTool('pointer');
        if (mode === 'multi') setMode('board');
      } else if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      } else if (e.key.toLowerCase() === 'v') {
        setTool('pointer');
      } else if (e.key.toLowerCase() === 'h') {
        setTool('hand');
      } else if (e.key.toLowerCase() === 'f') {
        setTool('frame');
      } else if (e.key.toLowerCase() === 't') {
        setTool('type');
      } else if (e.key.toLowerCase() === 'c') {
        setTool('comment');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, viewerOpen]);

  const counts = countBoardItems(Object.values(CANVAS_FRAMES), CANVAS_TAKES.length);
  const subtitle =
    viewerOpen || kept
      ? kept
        ? '7 frames · 4 takes'
        : '6 frames · 5 takes'
      : mode === 'multi'
        ? `3 of ${counts.frames} frames selected`
        : mode === 'chat'
          ? `${counts.frames} frames · F-04 selected`
          : mode === 'jobs'
            ? `${counts.frames} frames · 4 jobs`
            : mode === 'empty'
              ? 'empty'
              : `${counts.frames} frames · ${counts.takes} takes`;

  const zoomLabel = viewerOpen || kept ? '20%' : mode === 'multi' ? '34%' : mode === 'chat' ? '17%' : mode === 'over' ? '10%' : mode === 'empty' ? '100%' : '20%';

  const boardChips: CanvasContextChip[] =
    mode === 'board'
      ? [
          { icon: 'frame', name: 'F-03 Variance table', rev: 'r6', tokens: 6000 },
          { icon: 'doc', name: 'DESIGN.md', rev: 'r3', tokens: 3000 },
        ]
      : mode === 'multi'
        ? [
            { icon: 'frame', name: 'F-03', rev: 'r6', tokens: 4000 },
            { icon: 'frame', name: 'F-04', rev: 'r1 draft', tokens: 3500 },
            { icon: 'frame', name: 'F-05', rev: 'r1 draft', tokens: 3500 },
            { icon: 'doc', name: 'DESIGN.md', rev: 'r3', tokens: 3000 },
          ]
        : [];
  const activeChips = boardChips.filter((c) => !removedChips.includes(c.name));

  const promptPh =
    mode === 'board'
      ? 'Ask about F-03 Variance table'
      : mode === 'multi'
        ? 'Ask about these 3 frames'
        : mode === 'empty'
          ? 'Describe the first screen, for example a variance table with alerts'
          : 'Ask about this board';
  const promptHint =
    mode === 'board'
      ? '1 frame · 9k tokens'
      : mode === 'multi'
        ? '3 frames · 14k tokens'
        : mode === 'jobs'
          ? 'Waits for a slot'
          : undefined;

  const right = (
    <>
      <Btn label="Share" icon="share" later="Share and comment links (deferred in the browser MVP, R-WS-3)" />
      <Btn
        label="Hand off"
        cls="ink"
        icon="download"
        does="Opens S34: downloads only accepted frames with a fixed revision manifest; drafts and takes are never included"
        feature="F161"
        onClick={() => recordIntent('F161:handoff')}
      />
    </>
  );

  const flowLines: [number, number, number, number, boolean?][] = [
    [COL[0] + CW + 4, 179, COL[1] - 4, 179],
    [COL[1] + CW + 4, 179, COL[2] - 4, 179],
    [COL[2] + CW + 4, 179, COL[3] - 4, 179, true],
  ];

  const c3 = [60, 318, 576, 834] as const;
  const o5 = [120, 280, 440, 600] as const;
  const take = CANVAS_TAKES[Math.min(Math.max(takeIdx, 0), CANVAS_TAKES.length - 1)]!;
  const F03bFrame: SampleCanvasFrame = { ...CANVAS_FRAMES.f03, rev: 'r8' };
  const F06Frame: SampleCanvasFrame = { id: 'F-06', name: 'Variance table, contrast', rev: 'r1', st: 'draft', ui: 'contrast', size: '1280 × 900' };

  const segSG = (cur: 'single' | 'grid') => (
    <div className="sp-seg" role="group" aria-label="Layout">
      {(['Single', 'Grid'] as const).map((v, i) => (
        <button
          key={v}
          type="button"
          aria-pressed={v.toLowerCase() === cur}
          data-does={v === 'Single' ? 'Shows one take at a time, large and live' : 'Shows the baseline and all takes together; a click opens one in Single'}
          data-feature="F204"
          onClick={() => setViewer(v === 'Grid' ? 'grid' : 'stack')}
        >
          <Icon name={i === 0 ? 'square' : 'grid'} size={14} />
          {v}
        </button>
      ))}
    </div>
  );
  const cmpBtn = (
    <Btn
      label={<>Compare <span className="can-kbd">Hold B</span></>}
      icon="cols"
      does="Opens Compare: baseline r8 beside this take with changed regions outlined. Holding B instead fades the take to the baseline while the key is down"
      feature="F206"
      onClick={() => setViewer('cmp')}
    />
  );
  const keepBtn = (
    <Btn
      label={<>Keep on board <span className="can-kbd">Enter</span></>}
      cls="ink"
      icon="check"
      does="Adds this take to the board as a new draft with its own ID. F-03 r8 stays as it is until a review accepts something"
      feature="F205"
      onClick={() => keepTake()}
    />
  );
  const keepOff = (
    <button type="button" className="sp-btn ghost" disabled aria-disabled="true" data-does="Unavailable until the take is finished" data-feature="F208">
      Keep on board
    </button>
  );
  const cancelRun = (
    <Btn
      label="Cancel run"
      does="Stops the 3 unfinished takes, keeps the 2 finished ones and releases the unused reservation; F-03 r8 is untouched"
      feature="F210"
      onClick={() => setViewer('closed')}
    />
  );
  const vhDone = (
    <>
      <span className="can-prog">2 of 5 done<i>
        <u style={{ width: '40%' }} />
      </i></span>
      {segSG('single')}
      <span className="size">Not finished</span>
      {cancelRun}
      {keepOff}
    </>
  );
  const vhFailed = (
    <>
      <span className="can-prog">4 of 5 done · 1 failed</span>
      {segSG('single')}
      <span className="size">Not available</span>
      {keepOff}
    </>
  );

  const stripFor = (states: string[], cur: number) => {
    const dotsFor = (st: string) => (st === 'failed' ? 'bad' : st === 'designing' || st === 'waiting' ? 'warn' : 'ok');
    return (
      <footer className="can-vf" aria-label="Takes">
        <button type="button" className="can-th" data-does="Shows the accepted baseline F-03 r8 in the stage, read only" data-feature="F203">
          <span className="pic" style={{ width: 128, height: 90 }}>
            <ScaledCanvasUi kind="base" scale={0.2} />
          </span>
          <span className="can-cp">
            <b>r8</b>Baseline
            <Icon name="lock" size={11} />
          </span>
        </button>
        <span className="can-vsep" />
        {CANVAS_TAKES.map((t, i) => {
          const st = states[i] ?? 'done';
          const unfinished = st === 'designing' || st === 'waiting' || st === 'failed';
          const tag = st === 'designing' ? <span className="st">Designing</span> : st === 'waiting' ? <span className="st">Waiting</span> : st === 'failed' ? <span className="st bad">Failed</span> : null;
          return (
            <button
              key={i}
              type="button"
              className={'can-th' + (i === cur ? ' act' : '')}
              data-does={unfinished ? `Shows Take ${t.n} (${t.angle}); it is not finished, so it cannot be kept` : `Shows Take ${t.n} (${t.angle}) in the stage`}
              data-feature="F203"
              onClick={() => {
                setTakeIdx(i);
                setViewer('stack');
              }}
            >
              <span className="pic" style={{ width: 128, height: 90 }}>
                {tag}
                <span style={{ display: 'block', opacity: unfinished ? 0.5 : 1 }}>
                  <ScaledCanvasUi kind={unfinished ? 'base' : t.ui} scale={0.2} />
                </span>
              </span>
              <span className="can-cp">
                <b>{t.n}</b>
                {t.angle}
                <span className={'dot ' + dotsFor(st)} />
              </span>
            </button>
          );
        })}
        <span className="can-fill" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <Btn label="Dismiss take" sm cls="plain" does="Removes this take from the stack; the baseline and the other takes are unchanged" feature="F205" onClick={() => recordIntent('F205:dismiss')} />
          <Btn label="More takes" sm does="Asks for more takes from other angles; shows the estimate and the exact inputs first" feature="F215" onClick={() => setViewer('gen')} />
        </div>
      </footer>
    );
  };

  return (
    <>
      {mode === 'chat' ? (
        <ChatPanel
          title="F-04 Alert drawer"
          sub="frame chat"
          ctxItems={[
            ['frame', 'F-04 Alert drawer', 'r1'],
            ['doc', 'DESIGN.md', 'r3'],
            ['req', 'R-DASH-014', 'r14'],
          ]}
          ctxFoot="≈ 6.2k tokens · only these items, not the whole board"
          placeholder="Ask about F-04, or @ another frame…"
          draft={chatDraft}
          model={MODEL}
          onResize={() => {}}
          onHistory={() => recordIntent('F169:history')}
          onNewChat={() => setChatDraft('')}
          onCollapse={() => setMode('board')}
          onRemoveCtx={(n) => recordIntent('F169:rm:' + n)}
          onAddCtx={() => recordIntent('F169:add')}
          onDraftChange={setChatDraft}
          onAttach={() => recordIntent('F169:attach')}
          onMention={() => recordIntent('F169:mention')}
          onOpenModel={() => recordIntent('F169:model')}
          onSend={() => recordIntent('F169:send')}
        >
          <div className="can-carry">
            <Icon name="layers" size={14} />
            <span>
              <b>Copied from F-03.</b> 6 earlier messages came along.
            </span>
            <Btn
              label="Clear"
              sm
              does="Clears the 6 carried messages from this chat; F-03 keeps its own"
              feature="F169"
              onClick={() => recordIntent('F169:clear')}
            />
            <Btn
              label="Undo"
              sm
              cls="plain"
              does="Brings the cleared messages back"
              feature="F169"
              onClick={() => recordIntent('F169:undo')}
            />
          </div>
          <div className="sp-ub">Add an alert drawer for packages over 3%.</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 34 s · 22 cr</em>
            </div>
            <p>Drew the drawer as F-04 r1, a draft. F-03 stays accepted at r6.</p>
            <span className="can-chatchip">
              <Icon name="frame" size={12} />
              F-04 Alert drawer · r1 draft
            </span>
          </div>
          <div className="sp-sugg">
            <button
              type="button"
              data-does="Puts an improve request in the composer; nothing runs until Send"
              data-feature="F169"
              onClick={() => setChatDraft('Improve this frame')}
            >
              <Icon name="spark" size={13} />
              Improve this frame
            </button>
            <button
              type="button"
              data-does="Puts a 5-takes request in the composer with its cost estimate; the stack opens in S31 when the run starts"
              data-feature="F169"
              onClick={() => setChatDraft('Try 5 takes on this frame')}
            >
              <Icon name="layers" size={13} />
              Try 5 takes on this frame
            </button>
            <button
              type="button"
              data-does="Switches to Nitpick pins on this frame (S33) and waits for the pins"
              data-feature="F169"
              onClick={() => recordIntent('F169:nitpick')}
            >
              <Icon name="comment" size={13} />
              Nitpick this frame
            </button>
          </div>
        </ChatPanel>
      ) : (
        <div className="can-gut" />
      )}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={CANVAS_TABS}
          activeTab="Variance flows"
          onSelect={(t) => {
            if (t === 'Variance flows') {
              setMode('board');
              setViewMenuOpen(false);
              setChatsFanned(false);
              setTool('pointer');
            } else {
              recordIntent('F161:tab:' + t);
            }
          }}
          onClose={(n) => recordIntent('F161:close:' + n)}
          onOpenArtifact={() => {
            setMode('empty');
            setTool('frame');
            setViewMenuOpen(false);
            setChatsFanned(false);
          }}
          right={right}
        />
        <div className="sp-tool">
          <ViewSwitch current="Canvas" onChange={(v) => recordIntent('F161:view:' + v)} />
          <span className="sp-crumb">
            Design
            <Icon name="chevR" size={12} />
            <b>Variance flows</b>
          </span>
          <span className="sp-fill" />
          {mode !== 'chat' ? (
            <IconBtn
              icon="panel"
              label="Open the Design chat"
              sm
              does="Opens the Design chat beside the board; the prompt bar sends into the same chat"
              feature="F168"
              onClick={() => {
                setMode('chat');
                setViewMenuOpen(false);
                setChatsFanned(false);
              }}
            />
          ) : null}
          <IconBtn
            icon="layers"
            label="Frame list"
            sm
            does="Opens a list of every frame by name: select, open or move one with the keyboard, the same actions as on the board"
            feature="F174"
            onClick={() => recordIntent('F174:frame-list')}
          />
          <IconBtn
            icon="undo"
            label="Undo"
            sm
            does="Undoes the last board action: move, resize, duplicate or delete"
            feature="F161"
            onClick={() => recordIntent('F161:undo')}
          />
          <IconBtn
            icon="redo"
            label="Redo"
            sm
            does="Redoes the last undone board action"
            feature="F161"
            onClick={() => recordIntent('F161:redo')}
          />
        </div>
        <div className="sp-work">
          <div className="sp-cv" aria-label="Board: Variance flows">
            <div className="sp-cvt">
              Variance flows<span>{subtitle}</span>
            </div>

            {mode === 'board' && !viewerOpen && !kept ? (
              <div className="can-world">
                <FlowArrows id="can-a1" lines={flowLines} />
                <BoardFrame frame={CANVAS_FRAMES.f01} x={COL[0]} y={R1} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame frame={CANVAS_FRAMES.f02} x={COL[1]} y={R1} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame
                  frame={CANVAS_FRAMES.f03}
                  x={COL[2]}
                  y={R1}
                  z={Z_BOARD}
                  sel
                  handles
                  size
                  onMore={(id) => recordIntent('F164:' + id)}
                />
                <BoardFrame
                  frame={CANVAS_FRAMES.f04}
                  x={COL[3]}
                  y={R1}
                  z={Z_BOARD}
                  onClick={(e) => {
                    if (e.shiftKey) setMode('multi');
                  }}
                  onDoubleClick={() => setMode('multi')}
                  onMore={() => setMode('chat')}
                />
                <BoardFrame
                  frame={CANVAS_FRAMES.f05}
                  x={COL[0]}
                  y={R2}
                  z={Z_BOARD}
                  onClick={() => setMode('multi')}
                  onMore={(id) => recordIntent('F164:' + id)}
                />
                <BoardFrame frame={CANVAS_FRAMES.ref2} x={COL[1]} y={R2} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <StackCard x={COL[2]} y={R2} z={Z_BOARD} n={5} onOpenStack={openStack} />
              </div>
            ) : null}

            {mode === 'multi' && !viewerOpen && !kept ? (
              <>
                <div className="can-world">
                  <FlowArrows
                    id="can-a2"
                    lines={[
                      [75 + 435 + 4, 242, 570 - 4, 242],
                      [570 + 435 + 4, 242, 1065 - 4, 242, true],
                    ]}
                  />
                  <BoardFrame frame={CANVAS_FRAMES.f02} x={75} y={R1} z={0.34} />
                  <BoardFrame frame={CANVAS_FRAMES.f03} x={570} y={R1} z={0.34} sel />
                  <BoardFrame frame={CANVAS_FRAMES.f04} x={1065} y={R1} z={0.34} sel />
                  <BoardFrame frame={CANVAS_FRAMES.f05} x={75} y={760} z={0.34} sel />
                </div>
                <button
                  type="button"
                  className="can-edge"
                  style={{ left: '236px', bottom: '14px' }}
                  data-does="Pans the view to F-05, which is selected but below the visible area"
                  data-feature="F166"
                  onClick={() => recordIntent('F166:pan-f05')}
                >
                  <Icon name="chev" size={12} />
                  F-05 is below
                </button>
                <span className="can-recenter" style={{ right: '16px', top: '12px' }} data-feature="F166">
                  <Btn
                    label="Recenter"
                    cls="ink"
                    sm
                    icon="fit"
                    does="Moves the camera to the selected frames in 250 ms; zoom stays as it is"
                    feature="F166"
                    onClick={() => setMode('board')}
                  />
                </span>
              </>
            ) : null}

            {mode === 'chat' && !viewerOpen && !kept ? (
              <div className="can-world">
                <FlowArrows
                  id="can-a3"
                  lines={[
                    [c3[0] + 218 + 4, 166, c3[1] - 4, 166],
                    [c3[1] + 218 + 4, 166, c3[2] - 4, 166],
                    [c3[2] + 218 + 4, 166, c3[3] - 4, 166, true],
                  ]}
                />
                <BoardFrame frame={CANVAS_FRAMES.f01} x={c3[0]} y={R1} z={0.17} />
                <BoardFrame frame={CANVAS_FRAMES.f02} x={c3[1]} y={R1} z={0.17} />
                <BoardFrame frame={CANVAS_FRAMES.f03} x={c3[2]} y={R1} z={0.17} />
                <BoardFrame frame={CANVAS_FRAMES.f04} x={c3[3]} y={R1} z={0.17} sel handles size />
                <BoardFrame frame={CANVAS_FRAMES.f05} x={c3[0]} y={290} z={0.17} />
                <BoardFrame frame={CANVAS_FRAMES.ref2} x={c3[1]} y={290} z={0.17} />
                <StackCard x={c3[2]} y={290} z={0.17} n={5} onOpenStack={openStack} />
                <button
                  type="button"
                  className="can-lin"
                  style={{ left: '704px', top: '252px' }}
                  data-does="Selects F-03, the frame F-04 was copied from, and shows the copy line in its chat"
                  data-feature="F175"
                  onClick={() => recordIntent('F175:lineage-f03')}
                >
                  <Icon name="layers" size={12} />
                  Copy of F-03
                </button>
              </div>
            ) : null}

            {mode === 'jobs' && !viewerOpen && !kept ? (
              <>
                <div className="can-world">
                  <FlowArrows id="can-a4" lines={flowLines} />
                  <BoardFrame frame={CANVAS_FRAMES.f01} x={COL[0]} y={R1} z={Z_BOARD} />
                  <BoardFrame
                    frame={CANVAS_FRAMES.f02}
                    x={COL[1]}
                    y={R1}
                    z={Z_BOARD}
                    cover={<FrameCover kind="waiting" frame={CANVAS_FRAMES.f02} compact onAction={(a) => recordIntent('F170:' + a)} />}
                  />
                  <BoardFrame
                    frame={CANVAS_FRAMES.f03}
                    x={COL[2]}
                    y={R1}
                    z={Z_BOARD}
                    cover={
                      <FrameCover
                        kind="designing"
                        frame={CANVAS_FRAMES.f03}
                        rev="r7"
                        time="0:41"
                        onAction={(a) => recordIntent('F170:' + a)}
                      />
                    }
                  />
                  <BoardFrame
                    frame={CANVAS_FRAMES.f04}
                    x={COL[3]}
                    y={R1}
                    z={Z_BOARD}
                    cover={
                      <FrameCover
                        kind="designing"
                        frame={CANVAS_FRAMES.f04}
                        rev="r2"
                        time="0:12"
                        onAction={(a) => recordIntent('F170:' + a)}
                      />
                    }
                  />
                  <BoardFrame
                    frame={CANVAS_FRAMES.f05}
                    x={COL[0]}
                    y={R2}
                    z={Z_BOARD}
                    cover={<FrameCover kind="failed" frame={CANVAS_FRAMES.f05} onAction={(a) => recordIntent('F170:' + a)} />}
                  />
                  <BoardFrame frame={CANVAS_FRAMES.ref2} x={COL[1]} y={R2} z={Z_BOARD} />
                </div>
                <div className="can-cap" role="status" data-feature="F171">
                  <Icon name="alert" size={16} />
                  <span>
                    <b>2 of 2 design slots in use.</b> F-02 waits for a free slot.
                  </span>
                  <Btn
                    label="Usage and limits"
                    sm
                    does="Opens S36: slots, credits, cap and reservations for this project"
                    feature="F171"
                    onClick={() => recordIntent('F171:usage')}
                  />
                </div>
              </>
            ) : null}

            {mode === 'over' ? (
              <div className="can-world">
                <div className="can-section" style={{ left: '100px', top: '70px', width: '648px', height: '320px' }}>
                  <span>Variance flows · 7 items</span>
                </div>
                <BoardFrame frame={CANVAS_FRAMES.f01} x={o5[0]} y={98} z={0.1} />
                <BoardFrame frame={CANVAS_FRAMES.f02} x={o5[1]} y={98} z={0.1} />
                <BoardFrame frame={CANVAS_FRAMES.f03} x={o5[2]} y={98} z={0.1} />
                <BoardFrame frame={CANVAS_FRAMES.f04} x={o5[3]} y={98} z={0.1} />
                <BoardFrame frame={CANVAS_FRAMES.f05} x={o5[0]} y={244} z={0.1} />
                <BoardFrame frame={CANVAS_FRAMES.ref2} x={o5[1]} y={244} z={0.1} />
                <StackCard x={o5[2]} y={244} z={0.1} n={5} open={false} onOpenStack={openStack} />
              </div>
            ) : null}

            {mode === 'empty' ? (
              <div className="can-world">
                <div className="can-empty">
                  <div className="can-scan" aria-hidden="true">
                    <i style={{ left: '0px', top: '14px', width: '104px', height: '74px' }} />
                    <i className="dash" style={{ left: '122px', top: '0px', width: '118px', height: '84px' }} />
                    <i style={{ left: '30px', top: '96px', width: '92px', height: '54px' }} />
                    <s />
                  </div>
                  <h3>This board has no frames yet</h3>
                  <p>
                    Describe the first screen in the bar below, draw a frame, or bring in a reference image. A new frame starts as a
                    draft.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Btn
                      label="Import a reference"
                      icon="image"
                      does="Opens S28: pick a PNG, JPEG or WebP and confirm you may use it"
                      feature="F172"
                      onClick={() => recordIntent('F172:import')}
                    />
                    <Btn
                      label="Draw a frame"
                      icon="frame"
                      does="Switches to the Frame tool; drag on the board to size it"
                      feature="F172"
                      onClick={() => setTool('frame')}
                    />
                  </div>
                  <div className="can-reqs">
                    <div className="h">Spec r14 has no frame for these yet</div>
                    {REQS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        data-does={`Starts a frame for ${r.id}: its text and criteria enter the run as context, nothing else`}
                        data-feature="F172"
                        onClick={() => recordIntent('F172:req:' + r.id)}
                      >
                        <span className="id">{r.id}</span>
                        <span>{r.t}</span>
                        <span className="go">Start frame</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="can-rail" role="toolbar" aria-label="Canvas tools" aria-orientation="vertical" data-feature="F162">
              {RAIL_TOOLS.map(([icName, label, does]) => (
                <IconBtn
                  key={icName}
                  icon={icName}
                  label={label}
                  sm
                  pressed={tool === icName}
                  does={does}
                  feature="F162"
                  onClick={() => setTool(icName)}
                />
              ))}
              <span className="div" />
              <IconBtn
                icon="image"
                label="Import reference (I)"
                sm
                does="Imports a PNG, JPEG or WebP the user picks, as a reference image (S28); it is not an editable frame"
                feature="F162"
                onClick={() => recordIntent('F162:import')}
              />
            </div>

            {mode === 'empty' ? (
              <div className="can-tip" style={{ left: '56px', top: '114px' }}>
                New frame <span className="can-kbd">F</span>
              </div>
            ) : null}

            {chatsFanned && mode !== 'chat' && !viewerOpen && !kept ? (
              <div className="can-fan" role="list" aria-label="Earlier chats">
                {CANVAS_CHATS.map((c, i) => (
                  <button
                    key={c.t}
                    type="button"
                    className="ch"
                    style={{ left: i * 14 + 'px', bottom: i * 52 + 'px' }}
                    data-does="Reopens this chat and selects the frames it covered"
                    data-feature="F168"
                    onClick={() => {
                      setChatsFanned(false);
                      setMode('chat');
                    }}
                  >
                    <b>{c.t}</b>
                    <span>{c.meta}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {mode !== 'chat' && !viewerOpen && !kept ? (
              <div className="can-pb" data-feature="F167">
                <span className="pk a" />
                <span className="pk b" />
                <button
                  type="button"
                  className="pc"
                  data-does="Deals out the 3 earlier chats of this board; pointing at the stack does the same"
                  data-feature="F168"
                  onMouseEnter={() => setChatsFanned(true)}
                  onClick={() => setChatsFanned((v) => !v)}
                >
                  <Icon name="history" size={12} />3 chats
                </button>
                <div className="box">
                  {activeChips.length > 0 ? (
                    <div className="chips">
                      {activeChips.map((c) => (
                        <span key={c.name} className="sp-cchip">
                          <Icon name={c.icon} size={12} />
                          {c.name}
                          <span className="r">{c.rev}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${c.name} from this run`}
                            data-does={`Removes ${c.name} from this run; the frame stays on the board`}
                            data-feature="F167"
                            onClick={() => setRemovedChips((prev) => [...prev, c.name])}
                          >
                            <Icon name="x" size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="in">{promptPh}</div>
                  <div className="row">
                    <IconBtn
                      icon="plus"
                      label="Attach a reference"
                      sm
                      does="Attaches a PNG, JPEG or WebP the user picks; nothing is read without a file choice"
                      feature="F167"
                      onClick={() => recordIntent('F167:attach')}
                    />
                    <IconBtn
                      icon="at"
                      label="Mention a frame or requirement"
                      sm
                      does="Adds a frame or requirement to the run context and to the chips above"
                      feature="F167"
                      onClick={() => recordIntent('F167:mention')}
                    />
                    <button
                      type="button"
                      className="sp-model"
                      data-does="Opens the model source picker: Hosted, BYOK, Local agent (deferred)"
                      data-feature="F167"
                      onClick={() => recordIntent('F167:model')}
                    >
                      <span className="src">{MODEL.source}</span>
                      {MODEL.name}
                      <Icon name="chev" size={12} />
                    </button>
                    <span className="sp-est">{MODEL.est}</span>
                    {promptHint ? <span className="hint">{promptHint}</span> : null}
                    <span className="can-fill" />
                    <span className="hint">
                      <span className="can-kbd">Enter</span> to send
                    </span>
                    <button
                      type="button"
                      className="sp-send"
                      aria-label="Send"
                      data-does="Sends the question with exactly the listed context; a paid run reserves its maximum first"
                      data-feature="F167"
                      onClick={() => {
                        buildNextRequestContext(promptPh, activeChips, Object.values(CANVAS_FRAMES));
                        setMode('jobs');
                        setViewMenuOpen(false);
                        setChatsFanned(false);
                      }}
                    >
                      <Icon name="up" size={15} stroke={2} />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="sp-zoom" role="group" aria-label="Zoom" data-feature="F163">
              <IconBtn
                icon="minus"
                label="Zoom out"
                sm
                does="Zooms the board out one step; frames shrink, UI text keeps its size"
                feature="F163"
                onClick={() => setMode('over')}
              />
              <button
                type="button"
                className="can-zp"
                aria-haspopup="menu"
                aria-expanded={viewMenuOpen}
                data-does="Opens the View menu: fit, fit selection, 100%, zoom in, zoom out"
                data-feature="F163"
                onClick={() => setViewMenuOpen((v) => !v)}
              >
                {zoomLabel}
                <Icon name="chev" size={12} />
              </button>
              <IconBtn
                icon="plus"
                label="Zoom in"
                sm
                does="Zooms the board in one step"
                feature="F163"
                onClick={() => setMode('board')}
              />
              <IconBtn
                icon="fit"
                label="Fit all frames"
                sm
                does="Fits every frame in view with a 250 ms camera move"
                feature="F163"
                onClick={() => {
                  setMode('board');
                  setViewMenuOpen(false);
                }}
              />
            </div>

            {viewerOpen ? (
              <div className="can-world">
                <FlowArrows id="can-b1" lines={flowLines} />
                <BoardFrame frame={CANVAS_FRAMES.f01} x={COL[0]} y={R1} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame frame={CANVAS_FRAMES.f02} x={COL[1]} y={R1} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame frame={F03bFrame} x={COL[2]} y={R1} z={Z_BOARD} sel handles onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame frame={CANVAS_FRAMES.f04} x={COL[3]} y={R1} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame frame={CANVAS_FRAMES.f05} x={COL[0]} y={R2} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame frame={CANVAS_FRAMES.ref2} x={COL[1]} y={R2} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <StackCard x={COL[2]} y={R2} z={Z_BOARD} n={5} onOpenStack={openStack} />
                <div className="can-scrim" />
                <section className="can-vw" role="dialog" aria-label="Takes of F-03 Variance table" data-feature="F201">
                  {viewer === 'stack' ? (
                    <>
                      <div className="can-vh" data-feature="F214">
                        <IconBtn
                          icon="x"
                          label="Close the stack (Esc)"
                          sm
                          does="Closes the viewer; clicking beside it does the same. The board and the baseline stay exactly as they were"
                          feature="F214"
                          onClick={() => setViewer('closed')}
                        />
                        <div className="ti">
                          <b>5 takes on F-03 Variance table</b>
                          <span>Baseline r8 stays accepted</span>
                        </div>
                        <span className="step">
                          <span className="can-flip">
                            <IconBtn
                              icon="chevR"
                              label="Previous take"
                              sm
                              does="Shows the previous take; the Left arrow key does the same"
                              feature="F202"
                              onClick={() => setTakeIdx((takeIdx - 1 + CANVAS_TAKES.length) % CANVAS_TAKES.length)}
                            />
                          </span>
                          <b>Take {take.n} of {CANVAS_TAKES.length}</b>
                          <IconBtn
                            icon="chevR"
                            label="Next take"
                            sm
                            does="Shows the next take; the Right arrow key does the same"
                            feature="F202"
                            onClick={() => setTakeIdx((takeIdx + 1) % CANVAS_TAKES.length)}
                          />
                        </span>
                        <span className="ang">{take.angle}</span>
                        <span className="can-fill" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {segSG('single')}
                          <span className="can-live" data-feature="F209">
                            <i />
                            Live
                          </span>
                          <span className="size">1280 × 900 · 50%</span>
                          {cmpBtn}
                          {keepBtn}
                        </div>
                      </div>
                      <div className="can-vb">
                        <div className="can-stage">
                          <div className="can-take act" style={{ width: 640, height: 450 }}>
                            <ScaledCanvasUi kind={take.ui} scale={1} />
                          </div>
                          <div className="can-hint">
                            <span className="can-kbd">B</span> hold to compare <span className="can-kbd">←</span>
                            <span className="can-kbd">→</span> step <span className="can-kbd">G</span> grid
                          </div>
                        </div>
                        <aside className="can-side" aria-label="Take details">
                          <div>
                            <h4>Take {take.n} · {take.angle}</h4>
                            <p>{take.line}</p>
                          </div>
                          <div>
                            <h4>Changed from baseline</h4>
                            <div className="can-chg">
                              {take.changes.map(([a, b], i) => (
                                <div key={i}>
                                  <i>{i + 1}</i>
                                  <span>
                                    <b>{a}</b>: {b}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div data-feature="F213">
                            <h4>Input for this run</h4>
                            <div className="can-in">
                              <span className="can-chatchip">
                                <Icon name="frame" size={12} />
                                {CANVAS_STACK.input[0]}
                              </span>
                              <span className="can-chatchip">
                                <Icon name="doc" size={12} />
                                {CANVAS_STACK.input[1]}
                              </span>
                              <span className="can-chatchip">
                                <Icon name="req" size={12} />
                                {CANVAS_STACK.input[2]}
                              </span>
                            </div>
                            <p className="can-small">
                              The whole board was not sent. {CANVAS_STACK.cost}. 0 new tokens inferred; the style stays at {CANVAS_BASELINE.ds}.
                            </p>
                          </div>
                          <div className="ap-sticky">
                            <b>Baseline stays.</b> F-03 r8 remains the accepted frame. Keep adds this take as a draft.
                          </div>
                        </aside>
                      </div>
                      {stripFor(['done', 'done', 'done', 'done', 'done'], takeIdx)}
                    </>
                  ) : viewer === 'grid' ? (
                    <>
                      <div className="can-vh" data-feature="F214">
                        <IconBtn
                          icon="x"
                          label="Close the stack (Esc)"
                          sm
                          does="Closes the viewer; clicking beside it does the same. The board and the baseline stay exactly as they were"
                          feature="F214"
                          onClick={() => setViewer('closed')}
                        />
                        <div className="ti">
                          <b>5 takes on F-03 Variance table</b>
                          <span>Baseline r8 stays accepted</span>
                        </div>
                        <span className="ang">Take 3 selected</span>
                        <span className="can-fill" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {segSG('grid')}
                          <span className="size">1280 × 900 · 46%</span>
                          {cmpBtn}
                          <Btn
                            label={<>Keep Take 3 <span className="can-kbd">Enter</span></>}
                            cls="ink"
                            icon="check"
                            does="Adds the selected take to the board as a new draft; F-03 r8 is unchanged"
                            feature="F205"
                            onClick={() => keepTake()}
                          />
                        </div>
                      </div>
                      <div className="can-vb">
                        <div className="can-grid">
                          <div className="can-cell">
                            <div className="lb">
                              <b>r8</b>Baseline
                              <span className="pill ok">Accepted</span>
                            </div>
                            <button type="button" className="can-take can-cellb" data-does="Opens this take in Single view" data-feature="F204" onClick={() => setViewer('stack')}>
                              <ScaledCanvasUi kind="base" scale={0.46} />
                            </button>
                          </div>
                          {CANVAS_TAKES.map((t, i) => (
                            <div className="can-cell" key={i}>
                              <div className="lb">
                                <b>{t.n}</b>
                                {t.angle}
                              </div>
                              <button type="button" className="can-take can-cellb" data-does="Opens this take in Single view" data-feature="F204" onClick={() => setViewer('stack')}>
                                <ScaledCanvasUi kind={t.ui} scale={0.46} />
                              </button>
                              {t.n === 3 ? (
                                <span className="keep">
                                  <Btn label="Keep" sm cls="ink" does="Keeps Take 3 directly from the grid as a new draft" feature="F205" onClick={() => keepTake()} />
                                </span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : viewer === 'cmp' ? (
                    <>
                      <div className="can-vh" data-feature="F214">
                        <IconBtn
                          icon="x"
                          label="Close the stack (Esc)"
                          sm
                          does="Closes the viewer; clicking beside it does the same. The board and the baseline stay exactly as they were"
                          feature="F214"
                          onClick={() => setViewer('closed')}
                        />
                        <div className="ti">
                          <b>Compare: Take 3 · Contrast with baseline r8</b>
                          <span>3 regions changed · read only</span>
                        </div>
                        <span className="can-fill" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Btn label="Back to Take 3" does="Returns to the Single view of Take 3" feature="F207" onClick={() => setViewer('stack')} />
                          {keepBtn}
                        </div>
                      </div>
                      <div className="can-vb">
                        <div className="can-cmp">
                          <div className="can-panes">
                            <div className="can-pane">
                              <div className="lb">
                                <b>Baseline r8</b>
                                <span className="pill ok">Accepted</span>
                              </div>
                              <div className="can-take" style={{ width: 461, height: 324 }}>
                                <ScaledCanvasUi kind="base" scale={0.72} />
                                {CANVAS_REGIONS.map(([n, l, t, w, h], i) => (
                                  <span key={i} className="can-rg" style={{ left: Math.round(l * 0.72), top: Math.round(t * 0.72), width: Math.round(w * 0.72), height: Math.round(h * 0.72) }}>
                                    <i>{n}</i>
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="can-pane">
                              <div className="lb">
                                <b>Take 3 · Contrast</b>
                                <span className="pill warn">Not kept</span>
                              </div>
                              <div className="can-take" style={{ width: 461, height: 324 }}>
                                <ScaledCanvasUi kind={take.ui} scale={0.72} />
                              </div>
                            </div>
                          </div>
                          <div className="can-cl">
                            {take.changes.map(([a, b], i) => (
                              <div key={i}>
                                <i>{i + 1}</i>
                                <span>
                                  <b>{a}</b>
                                  {b}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="can-gen">
                            <Icon name="spark" size={13} />
                            Generated comparison against R-DASH-014. It describes differences; it is not test evidence.
                          </div>
                        </div>
                      </div>
                    </>
                  ) : viewer === 'gen' ? (
                    <>
                      <div className="can-vh" data-feature="F214">
                        <IconBtn
                          icon="x"
                          label="Close the stack (Esc)"
                          sm
                          does="Closes the viewer; clicking beside it does the same. The board and the baseline stay exactly as they were"
                          feature="F214"
                          onClick={() => setViewer('closed')}
                        />
                        <div className="ti">
                          <b>5 takes on F-03 Variance table</b>
                          <span>Baseline r8 stays accepted</span>
                        </div>
                        <span className="step">
                          <span className="can-flip">
                            <IconBtn
                              icon="chevR"
                              label="Previous take"
                              sm
                              does="Shows the previous take; the Left arrow key does the same"
                              feature="F202"
                              onClick={() => setTakeIdx((takeIdx - 1 + CANVAS_TAKES.length) % CANVAS_TAKES.length)}
                            />
                          </span>
                          <b>Take {take.n} of {CANVAS_TAKES.length}</b>
                          <IconBtn
                            icon="chevR"
                            label="Next take"
                            sm
                            does="Shows the next take; the Right arrow key does the same"
                            feature="F202"
                            onClick={() => setTakeIdx((takeIdx + 1) % CANVAS_TAKES.length)}
                          />
                        </span>
                        <span className="ang">{take.angle}</span>
                        <span className="can-fill" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{vhDone}</div>
                      </div>
                      <div className="can-vb">
                        <div className="can-stage">
                          <div className="can-take" style={{ width: 640, height: 450 }}>
                            <ScaledCanvasUi kind="base" scale={1} />
                            <div className="can-cover designing" role="status">
                              <span className="ci">
                                <Icon name="spark" size={20} />
                              </span>
                              <div className="tt">Designing {take.angle}</div>
                              <div className="sb">Starts from a copy of F-03 r8 · 0:24. Not finished, so it cannot be kept.</div>
                              <div className="ac">
                                <Btn label="Stop this take" sm does="Stops Take 3 only; the other takes continue" feature="F208" onClick={() => { setTakeIdx(3); setViewer('fail'); }} />
                              </div>
                            </div>
                          </div>
                          <div className="can-hint"><span className="can-kbd">Esc</span> close, the run keeps going</div>
                        </div>
                        <aside className="can-side" aria-label="Run status">
                          <div>
                            <h4>This run</h4>
                            <div className="can-run">
                              <div>
                                <span>
                                  <span className="dot ok" />
                                </span>
                                <b>{CANVAS_TAKES[0]!.n} {CANVAS_TAKES[0]!.angle}</b>
                                <span>Done</span>
                              </div>
                              <div>
                                <span>
                                  <span className="dot ok" />
                                </span>
                                <b>{CANVAS_TAKES[1]!.n} {CANVAS_TAKES[1]!.angle}</b>
                                <span>Done</span>
                              </div>
                              <div>
                                <span>
                                  <span className="dot warn" />
                                </span>
                                <b>{CANVAS_TAKES[2]!.n} {CANVAS_TAKES[2]!.angle}</b>
                                <span>Designing 0:24</span>
                              </div>
                              <div>
                                <span>
                                  <span className="dot warn" />
                                </span>
                                <b>{CANVAS_TAKES[3]!.n} {CANVAS_TAKES[3]!.angle}</b>
                                <span>Designing 0:09</span>
                              </div>
                              <div>
                                <span>
                                  <span className="dot ring" />
                                </span>
                                <b>{CANVAS_TAKES[4]!.n} {CANVAS_TAKES[4]!.angle}</b>
                                <span>Waiting</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4>Estimate</h4>
                            <p>Reserved ≈ 54 cr. 21 cr used so far. Cancel releases what is not used.</p>
                          </div>
                          <div data-feature="F213">
                            <h4>Input for this run</h4>
                            <div className="can-in">
                              <span className="can-chatchip">
                                <Icon name="frame" size={12} />
                                {CANVAS_STACK.input[0]}
                              </span>
                              <span className="can-chatchip">
                                <Icon name="doc" size={12} />
                                {CANVAS_STACK.input[1]}
                              </span>
                              <span className="can-chatchip">
                                <Icon name="req" size={12} />
                                {CANVAS_STACK.input[2]}
                              </span>
                            </div>
                          </div>
                          <div className="ap-sticky">
                            <b>Two slots at a time.</b> Copy waits for a free slot and is not charged while it waits.
                          </div>
                        </aside>
                      </div>
                      {stripFor(['done', 'done', 'designing', 'designing', 'waiting'], 2)}
                    </>
                  ) : viewer === 'fail' ? (
                    <>
                      <div className="can-vh" data-feature="F214">
                        <IconBtn
                          icon="x"
                          label="Close the stack (Esc)"
                          sm
                          does="Closes the viewer; clicking beside it does the same. The board and the baseline stay exactly as they were"
                          feature="F214"
                          onClick={() => setViewer('closed')}
                        />
                        <div className="ti">
                          <b>5 takes on F-03 Variance table</b>
                          <span>Baseline r8 stays accepted</span>
                        </div>
                        <span className="step">
                          <span className="can-flip">
                            <IconBtn
                              icon="chevR"
                              label="Previous take"
                              sm
                              does="Shows the previous take; the Left arrow key does the same"
                              feature="F202"
                              onClick={() => setTakeIdx((takeIdx - 1 + CANVAS_TAKES.length) % CANVAS_TAKES.length)}
                            />
                          </span>
                          <b>Take {take.n} of {CANVAS_TAKES.length}</b>
                          <IconBtn
                            icon="chevR"
                            label="Next take"
                            sm
                            does="Shows the next take; the Right arrow key does the same"
                            feature="F202"
                            onClick={() => setTakeIdx((takeIdx + 1) % CANVAS_TAKES.length)}
                          />
                        </span>
                        <span className="ang">{take.angle}</span>
                        <span className="can-fill" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{vhFailed}</div>
                      </div>
                      <div className="can-vbn warn" role="alert">
                        <Icon name="alert" size={16} />
                        <p><b>Take 4 failed.</b> Takes 1, 2, 3 and 5 are ready and can be kept. F-03 r8 is unchanged.</p>
                        <Btn label="See usage" sm cls="ghost" does="Opens S36 usage: 3.1k tokens consumed by the failed take, the rest of the reservation released" feature="F211" onClick={() => recordIntent('F211:usage')} />
                      </div>
                      <div className="can-vb">
                        <div className="can-stage">
                          <div className="can-take" style={{ width: 640, height: 450 }}>
                            <ScaledCanvasUi kind="base" scale={1} />
                            <div className="can-cover failed" role="alert">
                              <span className="ci">
                                <Icon name="alert" size={20} />
                              </span>
                              <div className="tt">Take 4 (Layout) stopped before finishing</div>
                              <div className="sb">The model timed out after 90 s. 3.1k tokens were used and show in Usage; the rest of the reservation was released.</div>
                              <div className="ac"><Btn label="Retry take 4" sm cls="ink" icon="redo" does="Reruns only Take 4 with the same context and revisions; no duplicate charge" feature="F211" onClick={() => recordIntent('F211:retry-take')} /><Btn label="Dismiss take" sm does="Removes the failed attempt; Take 4 stays as an empty draft" feature="F211" onClick={() => recordIntent('F211:dismiss-take')} /></div>
                            </div>
                          </div>

                        </div>
                        <aside className="can-side" aria-label="Run status">
                          <div>
                            <h4>This run</h4>
                            <div className="can-run">
                              <div>
                                <span>
                                  <span className="dot ok" />
                                </span>
                                <b>{CANVAS_TAKES[0]!.n} {CANVAS_TAKES[0]!.angle}</b>
                                <span>Done</span>
                              </div>
                              <div>
                                <span>
                                  <span className="dot ok" />
                                </span>
                                <b>{CANVAS_TAKES[1]!.n} {CANVAS_TAKES[1]!.angle}</b>
                                <span>Done</span>
                              </div>
                              <div>
                                <span>
                                  <span className="dot ok" />
                                </span>
                                <b>{CANVAS_TAKES[2]!.n} {CANVAS_TAKES[2]!.angle}</b>
                                <span>Done</span>
                              </div>
                              <div>
                                <span>
                                  <span className="dot bad" />
                                </span>
                                <b>{CANVAS_TAKES[3]!.n} {CANVAS_TAKES[3]!.angle}</b>
                                <span>Failed</span>
                              </div>
                              <div>
                                <span>
                                  <span className="dot ok" />
                                </span>
                                <b>{CANVAS_TAKES[4]!.n} {CANVAS_TAKES[4]!.angle}</b>
                                <span>Done</span>
                              </div>
                            </div>
                          </div>
                          <div data-feature="F213">
                            <h4>Input for this run</h4>
                            <div className="can-in">
                              <span className="can-chatchip">
                                <Icon name="frame" size={12} />
                                {CANVAS_STACK.input[0]}
                              </span>
                              <span className="can-chatchip">
                                <Icon name="doc" size={12} />
                                {CANVAS_STACK.input[1]}
                              </span>
                              <span className="can-chatchip">
                                <Icon name="req" size={12} />
                                {CANVAS_STACK.input[2]}
                              </span>
                            </div>
                          </div>
                          <div className="ap-sticky">
                            <b>Retry reruns one take.</b> The other four stay as they are, and F-03 r8 never changed.
                          </div>
                        </aside>
                      </div>
                      {stripFor(['done', 'done', 'done', 'failed', 'done'], 3)}
                    </>
                  ) : null}
                </section>
              </div>
            ) : kept ? (
              <div className="can-world">
                <FlowArrows id="can-a1" lines={flowLines} />
                <BoardFrame frame={CANVAS_FRAMES.f01} x={COL[0]} y={R1} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame frame={CANVAS_FRAMES.f02} x={COL[1]} y={R1} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame frame={F03bFrame} x={COL[2]} y={R1} z={Z_BOARD} sel handles onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame frame={CANVAS_FRAMES.f04} x={COL[3]} y={R1} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame frame={CANVAS_FRAMES.f05} x={COL[0]} y={R2} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <BoardFrame frame={CANVAS_FRAMES.ref2} x={COL[1]} y={R2} z={Z_BOARD} onMore={(id) => recordIntent('F164:' + id)} />
                <StackCard x={COL[2]} y={R2} z={Z_BOARD} n={4} onOpenStack={openStack} />
                <BoardFrame frame={F06Frame} x={COL[3]} y={R2} z={Z_BOARD} sel handles size onMore={(id) => recordIntent('F164:' + id)} />
                <FlowArrows id="can-b5" lines={[[COL[2] + CW + 4, 425, COL[3] - 4, 425, true]]} />
                <div className="can-toast" role="status" data-feature="F212">
                  <Icon name="check" size={16} />
                  <span>
                    <b>Take 3 added to the board as F-06 draft.</b> F-03 is still r8.
                  </span>
                  <Btn label="Undo" sm cls="plain" does="Removes F-06 and puts Take 3 back in the stack" feature="F212" onClick={() => setKept(false)} />
                  <Btn label="Open F-06" sm does="Opens F-06 as a tab in the Design stage" feature="F212" onClick={() => recordIntent('F212:open-f06')} />
                </div>
              </div>
            ) : null}

            {viewMenuOpen ? (
              <div className="can-menu" role="menu" aria-label="View" data-feature="F163">
                {CANVAS_VIEWMENU.map(([t, k], i) => (
                  <div key={t} style={{ display: 'contents' }}>
                    {i === 3 ? <span className="sep" /> : null}
                    <button
                      type="button"
                      role="menuitem"
                      aria-checked={false}
                      data-does={MENU_DOES[i]}
                      data-feature="F163"
                      onClick={() => {
                        if (t === 'Zoom out') setMode('over');
                        else if (t === 'Zoom to fit') setMode('board');
                        else if (t === 'Zoom to selection') setMode('multi');
                        else recordIntent('F163:' + t);
                      }}
                    >
                      <span>{t}</span>
                      <span className="can-kbd">{k}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
