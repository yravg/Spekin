import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { sampleData, type CardVerdict, type ContextItem, type PillTuple, type SampleFrame } from '../data/source';
const { FRAMES, MODEL, PACKAGES, USAGE } = sampleData;
import { useData } from '../data/provider';
import { useWorkspace, type SaveState } from '../state/workspace';
import { Icon } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { ViewSwitch } from '../shell/ViewSwitch';
import { MiniDashboard } from '../shell/MiniDashboard';

export type GenUiMode = 'stream' | 'cards' | 'question' | 'fallback' | 'confirm' | 'pinned';

export interface GenUiShellOverride {
  save?: SaveState;
}

export interface ConfirmActionState {
  idempotencyKey: string;
  confirmed: boolean;
  executed: boolean;
  cancelled: boolean;
  runs: number;
  error: string | null;
}

export interface ConfirmPreconditions {
  actorCanEdit: boolean;
  actionAllowlisted: boolean;
  specRevision: string;
  expectedRevision: string;
  usedCredits: number;
  reserveCredits: number;
  capCredits: number;
}

export function createConfirmState(idempotencyKey = 'run-7f3a-c2'): ConfirmActionState {
  return {
    idempotencyKey,
    confirmed: false,
    executed: false,
    cancelled: false,
    runs: 0,
    error: null,
  };
}

export function executeConfirmedAction(
  prev: ConfirmActionState,
  checks: ConfirmPreconditions,
  onExecute?: () => void,
): ConfirmActionState {
  // Idempotency guard: a retry with the same key cannot charge or run twice.
  if (prev.executed) return prev;
  if (!checks.actorCanEdit) {
    return { ...prev, error: 'Actor does not have edit permission on this project.' };
  }
  if (!checks.actionAllowlisted) {
    return { ...prev, error: 'Action is not on the allowlist.' };
  }
  if (checks.specRevision !== checks.expectedRevision) {
    return {
      ...prev,
      error: `Spec revision moved past ${checks.expectedRevision} (now ${checks.specRevision}). Nothing ran.`,
    };
  }
  if (checks.usedCredits + checks.reserveCredits > checks.capCredits) {
    return {
      ...prev,
      error: 'Reserving credits would exceed the project credit cap. Nothing ran.',
    };
  }
  onExecute?.();
  return {
    ...prev,
    confirmed: true,
    executed: true,
    cancelled: false,
    runs: 3,
    error: null,
  };
}

export function routeGenUiPrompt(text: string): GenUiMode {
  const lower = text.trim().toLowerCase();
  if (lower.includes('3 more takes') || lower.includes('takes of f-04') || lower.includes('confirm')) {
    return 'confirm';
  }
  if (lower.includes('variance by package') || lower.includes('fallback') || lower.includes('as a card')) {
    return 'fallback';
  }
  if (lower.includes('alert drawer') || lower.includes('question')) {
    return 'question';
  }
  if (lower.includes('cards') || lower.includes('validated')) {
    return 'cards';
  }
  return 'stream';
}

const GENUI_CTX: ContextItem[] = [
  ['frame', 'F-04', 'r1'],
  ['req', 'R-DASH-014', 'r14'],
  ['image', 'REF-02', 'r1'],
];

const GENUI_TABS: ArtifactTabItem[] = [
  { icon: 'grid', name: 'Variance flows' },
  { icon: 'frame', name: 'F-03 Variance table' },
  { icon: 'frame', name: 'F-04 Alert drawer' },
];

const QUESTION_OPTIONS: { n: string; title: string; sub: string; rec?: boolean }[] = [
  { n: '1', title: 'After 2 periods over 3%', sub: 'Matches proposal R-DASH-019. Fewest false alerts.', rec: true },
  { n: '2', title: 'On the first period over 3%', sub: 'Earliest warning, but P-01 and P-03 alert every period.' },
  { n: '3', title: 'After 3 periods over 3%', sub: 'Slowest. P-01 would alert one period later.' },
];

const ALT_TAKES: { id: string; label: string; pill: PillTuple }[] = [
  { id: 'take-1', label: 'Take 1 · Drawer from the right', pill: ['mute', 'Baseline'] },
  { id: 'take-2', label: 'Take 2 · Banner above the table', pill: ['mute', '1 more click'] },
  { id: 'take-3', label: 'Take 3 · Row badges only', pill: ['warn', 'Hides detail'] },
];

function Kbd({ children }: { children: string }) {
  return <kbd className="sty-kbd">{children}</kbd>;
}

function ProvenanceAcc({ label }: { label: string }) {
  return (
    <span className="sty-pv acc">
      <Icon name="lock" size={10} stroke={2.2} />
      {label}
    </span>
  );
}

function ProvenanceProp({ label = 'Model proposal' }: { label?: string }) {
  return (
    <span className="sty-pv prop">
      <Icon name="spark" size={10} stroke={2.2} />
      {label}
    </span>
  );
}

function ProvenanceObs({ label }: { label: string }) {
  return (
    <span className="sty-pv obs">
      <Icon name="image" size={10} stroke={2.2} />
      {label}
    </span>
  );
}

function GenUiFrame(props: {
  frame: SampleFrame;
  x: number;
  y: number;
  w: number;
  h: number;
  cls?: string;
  pill: PillTuple;
  children: ReactNode;
}) {
  const { frame, x, y, w, h, cls = '', pill, children } = props;
  return (
    <div className={`sp-fr ${cls}`} style={{ left: `${x}px`, top: `${y}px`, width: `${w}px` }}>
      <div className="sp-frl">
        <b>{frame.id}</b>
        {frame.name}
        <span className="r">{frame.rev || ''}</span>
        <Pill tone={pill[0]} label={pill[1]} />
      </div>
      <div className="sp-frb" style={{ height: `${h}px` }}>
        {children}
      </div>
    </div>
  );
}

// S38 Contextual GenUI panel. Board: docs/design/spekin-canvas/project/S38-genui-panel.dc.html (data-screen="S38").
export function GenUiWorkArea(props: {
  initialMode?: GenUiMode;
  customPayload?: unknown;
  /** A verdict already obtained from a DataSource (tests, or a caller that validated before mounting). */
  validation?: CardVerdict;
  onShellOverride?: (next: GenUiShellOverride) => void;
  onOpenReview?: () => void;
  onOpenStyle?: () => void;
  onOpenHandoff?: () => void;
  onExecuteConfirm?: () => void;
} = {}) {
  const {
    initialMode = 'stream',
    customPayload,
    validation,
    onShellOverride,
    onOpenReview,
    onOpenStyle,
    onOpenHandoff,
    onExecuteConfirm,
  } = props;

  // The browser never validates: a card renders only on the verdict the Rust validator gave (or the
  // sample recorded). A refusal or a network error reaches the fallback, never part of the card.
  const dataSource = useData();
  const localVerdict = customPayload !== undefined ? (validation ?? dataSource.knownCardVerdict(customPayload)) : null;
  const [fetchedVerdict, setFetchedVerdict] = useState<CardVerdict | null>(null);

  useEffect(() => {
    if (customPayload === undefined || localVerdict !== null) return;
    let alive = true;
    dataSource.validateGenUi(customPayload).then((verdict) => {
      if (alive) setFetchedVerdict(verdict);
    });
    return () => {
      alive = false;
    };
  }, [customPayload, localVerdict, dataSource]);

  const cardVerdict = customPayload !== undefined ? (localVerdict ?? fetchedVerdict) : null;
  const refused = cardVerdict?.status === 'rejected';
  const pendingCard = customPayload !== undefined && cardVerdict === null;

  const effectiveInitialMode: GenUiMode = refused ? 'fallback' : initialMode;

  const [mode, setMode] = useState<GenUiMode>(effectiveInitialMode);
  const [selectedTake, setSelectedTake] = useState<string>('take-1');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [pinTop, setPinTop] = useState<number>(300);
  const [confirmState, setConfirmState] = useState<ConfirmActionState>(() => createConfirmState());
  const [removedCtx, setRemovedCtx] = useState<string[]>([]);

  const view = useWorkspace((s) => s.view('design'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const activeMode: GenUiMode = refused ? 'fallback' : mode;

  useLayoutEffect(() => {
    onShellOverride?.({
      save:
        activeMode === 'pinned'
          ? { status: 'saved', tone: 'ok', text: 'Saved 12:44' }
          : { status: 'saved', tone: 'ok', text: 'Saved 12:41' },
    });
  }, [activeMode, onShellOverride]);

  const ctxItems = GENUI_CTX.filter(([, name]) => !removedCtx.includes(name));
  const ctxFoot =
    activeMode === 'stream'
      ? '≈ 6.4k tokens · 3 items listed'
      : activeMode === 'confirm'
        ? '≈ 6.4k tokens · estimate before Send'
        : '≈ 6.4k tokens · the whole board is never sent';

  const handleSend = () => {
    const next = routeGenUiPrompt(view.draft);
    setView('design', { draft: '' });
    setMode(next);
  };

  const reqCard = (
    <div className="sty-gx" data-id="R-DASH-014">
      <div className="k">
        <Icon name="req" size={12} />
        Requirement
        <span className="tag">
          <ProvenanceAcc label="Accepted artifact · r14" />
        </span>
      </div>
      <div className="tt">R-DASH-014 · Variance threshold per package</div>
      <div className="bd">Flag a package when forecast exceeds budget by more than 3%.</div>
      <div className="ft">
        <span className="s">Source: brief §2 · REF-02</span>
        <Btn
          label="Details"
          sm
          does="Expands the card in place: criteria, sources and linked frames; focus and edits stay"
          feature="F325"
          onClick={() => recordIntent('F325:details:R-DASH-014')}
        />
        <Btn
          label="Pin"
          sm
          does="Pins this reference to the board; an accepted artifact keeps its ID and revision"
          feature="F331"
          onClick={() => recordIntent('F331:pin:R-DASH-014')}
        />
      </div>
    </div>
  );

  const renderGapCard = (pinned: boolean) => (
    <div className="sty-gx prop" data-id="GAP-07">
      <div className="k">
        <Icon name="alert" size={12} />
        Gap
        <span className="tag">
          <ProvenanceProp />
        </span>
      </div>
      <div className="tt">No empty state when no package is over</div>
      <div className="bd">Proposed: show “No package over 3% this period”.</div>
      <div className="ft">
        <span className="s">
          {pinned ? (
            <>
              <b>Pinned</b> to Variance flows · still a proposal
            </>
          ) : (
            'Not in the spec · needs review'
          )}
        </span>
        {pinned ? (
          <>
            <Btn
              label="Unpin"
              sm
              does="Removes the pin from the board; the proposal itself stays in chat"
              feature="F331"
              onClick={() => setMode('cards')}
            />
            <Btn
              label="Open in S08"
              sm
              cls="ink"
              does="Opens S08 with the exact diff for this proposal"
              feature="F331"
              onClick={() => (onOpenReview ? onOpenReview() : recordIntent('F331:open-s08'))}
            />
          </>
        ) : (
          <>
            <Btn
              label="Edit"
              sm
              does="Edits the proposed criterion as a draft; the spec is unchanged"
              feature="F325"
              onClick={() => recordIntent('F325:edit:GAP-07')}
            />
            <Btn
              label="Pin"
              sm
              does="Pins the proposal to the board; it stays a proposal until accepted in S08"
              feature="F331"
              onClick={() => setMode('pinned')}
            />
          </>
        )}
      </div>
    </div>
  );

  const altCard = (
    <div className="sty-gx prop" data-id="ALT-F03">
      <div className="k">
        <Icon name="cols" size={12} />
        Alternatives
        <span className="tag">
          <ProvenanceProp />
        </span>
      </div>
      <div className="tt">3 takes of the drawer, same data</div>
      <div className="sty-alt" role="radiogroup" aria-label="Takes">
        {ALT_TAKES.map((t) => {
          const isSelected = selectedTake === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className="r"
              data-does="Selects this take as the one to compare; nothing is accepted"
              data-feature="F327"
              onClick={() => setSelectedTake(t.id)}
            >
              <span className={isSelected ? 'sty-rd on' : 'sty-rd'} />
              <span>{t.label}</span>
              <Pill tone={t.pill[0]} label={t.pill[1]} />
            </button>
          );
        })}
      </div>
      <div className="ft">
        <span className="s">None is accepted. Pick one to compare.</span>
        <Btn
          label="Compare"
          sm
          cls="ink"
          does="Opens Compare with the chosen take beside the baseline; nothing is accepted"
          feature="F325"
          onClick={() => recordIntent('F325:compare:' + selectedTake)}
        />
      </div>
    </div>
  );

  const skChecklist = (
    <div className="sty-gx" aria-busy="true" aria-label="Acceptance checklist, being written">
      <div className="k">
        <Icon name="check" size={12} />
        Acceptance checklist
        <span className="tag">
          <Pill tone="mute" label="Writing block 3 of 3" />
        </span>
      </div>
      <div className="tt">AC-DASH-019 · Alert after 2 periods over 3%</div>
      <div className="sp-ck">
        <div>
          <span className="bx" />
          <span>Alert raised after 2 periods over 3%</span>
          <span className="sty-sk pl58" />
        </div>
        <div>
          <span className="bx" />
          <span>
            Threshold read from accepted s<span className="sty-sk tail" />
          </span>
          <span className="sty-sk pl58" />
        </div>
        <div>
          <span className="bx" />
          <span className="sty-sk" style={{ width: '62%' }} />
          <span className="sty-sk pl58" />
        </div>
      </div>
      <div className="ft">
        <span className="s">Actions turn on when the block is complete</span>
        <button
          type="button"
          className="sp-btn ghost sm"
          disabled
          data-does="Not available until this block is complete and validated"
          data-feature="F323"
          title="Not available until this block is complete and validated"
        >
          Pin
        </button>
      </div>
    </div>
  );

  const ckCard = (
    <div className="sty-gx" data-id="AC-DASH-019">
      <div className="k">
        <Icon name="check" size={12} />
        Acceptance checklist
        <span className="tag">
          <ProvenanceObs label="Fixture run · not a pinned build" />
        </span>
      </div>
      <div className="tt">AC-DASH-019 · Alert after 2 periods over 3%</div>
      <div className="sp-ck">
        <div>
          <span className="bx" />
          <span>Alert raised after 2 periods over 3%</span>
          <Pill tone="mute" label="Untested" />
        </div>
        <div>
          <span className="bx on">
            <Icon name="check" size={10} stroke={3} />
          </span>
          <span>Threshold read from accepted spec r14</span>
          <Pill tone="ok" label="Passed · fixture" />
        </div>
        <div>
          <span className="bx" />
          <span>No alert for P-04 at −3.4%</span>
          <Pill tone="bad" label="No evidence" />
        </div>
      </div>
      <div className="ft">
        <span className="s">1 of 3 passed. Nothing else is shown as passed.</span>
        <Btn
          label="Details"
          sm
          does="Expands the checklist in place: run, evidence and linked tests; focus and edits stay"
          feature="F325"
          onClick={() => recordIntent('F325:details:AC-DASH-019')}
        />
        <Btn
          label="Pin"
          sm
          does="Pins the checklist to the board; an observation stays an observation"
          feature="F331"
          onClick={() => recordIntent('F331:pin:AC-DASH-019')}
        />
      </div>
    </div>
  );

  const usedPct = ((USAGE.used / USAGE.cap) * 100).toFixed(1) + '%';
  const reserveCredits = 90;
  const reservePct = ((reserveCredits / USAGE.cap) * 100).toFixed(1) + '%';
  const leftAfterReserve = (USAGE.cap - USAGE.used - reserveCredits).toLocaleString('en-US');

  const handleConfirm = () => {
    setConfirmState((prev) =>
      executeConfirmedAction(
        prev,
        {
          actorCanEdit: true,
          actionAllowlisted: true,
          specRevision: 'r14',
          expectedRevision: 'r14',
          usedCredits: USAGE.used,
          reserveCredits,
          capCredits: USAGE.cap,
        },
        onExecuteConfirm,
      ),
    );
  };

  let chatMessages: ReactNode;
  if (activeMode === 'stream') {
    chatMessages = (
      <>
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>Sonnet 5.5 · streaming</em>
          </div>
          <p>Checked F-04 against spec r14. Blocks 1 and 2 are ready; block 3 is still being written.</p>
          <div className="sty-reveal">{reqCard}</div>
          <div className="sty-reveal">{renderGapCard(false)}</div>
          {skChecklist}
        </div>
        <div className="sty-run" role="status" aria-live="polite">
          <span className="sty-spin" />
          <b>Writing block 3 of 3</b>
          <span className="mono">1.9k tokens · 12 s</span>
          <span className="sp-fill" />
          <Btn
            label="Stop"
            sm
            cls="plain"
            does="Stops the stream; finished blocks stay, the partial block is dropped and nothing is charged for it"
            feature="F324"
            onClick={() => recordIntent('F324:stop')}
          />
        </div>
      </>
    );
  } else if (activeMode === 'cards') {
    chatMessages = (
      <>
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>Sonnet 5.5 · 34 s · 22 cr</em>
          </div>
          <p>F-04 matches spec r14. I found one gap and drew three takes.</p>
          {reqCard}
          {renderGapCard(false)}
          {altCard}
        </div>
        <div className="sp-sugg" data-feature="F332">
          <button
            type="button"
            data-does="Adds GAP-07 to S08 review with its exact diff"
            data-feature="F332"
            onClick={() => (onOpenReview ? onOpenReview() : recordIntent('F332:send-s08'))}
          >
            <Icon name="chevR" size={13} />
            Send the gap to review in S08
          </button>
          <button
            type="button"
            data-does="Opens S30 with the style draft; nothing is accepted"
            data-feature="F332"
            onClick={() => (onOpenStyle ? onOpenStyle() : recordIntent('F332:open-s30'))}
          >
            <Icon name="chevR" size={13} />
            Open Style review for the drawer colours
          </button>
        </div>
      </>
    );
  } else if (activeMode === 'question') {
    chatMessages = (
      <div className="sp-ai">
        <div className="h">
          <span className="av">S</span>Spekin<em>Sonnet 5.5 · 6 s · 3 cr</em>
        </div>
        <p>I need four answers before I draw. Pick one or write your own. Nothing is sent until the last question.</p>
        <div
          className="sty-qs"
          data-feature="F326"
          role="group"
          aria-label="Question 2 of 4"
          onKeyDown={(e) => {
            if (e.key === '1' || e.key === '2' || e.key === '3') setSelectedAnswer(e.key);
            else if (e.key === 'Escape') recordIntent('F326:skip');
          }}
        >
          <div className="sty-qh">
            <Icon name="spark" size={13} />
            Before I draw the drawer
            <span className="dots" role="img" aria-label="Question 2 of 4">
              <i className="d" />
              <i className="a" />
              <i />
              <i />
            </span>
            <span className="sty-count">2 of 4</span>
          </div>
          <div className="sty-qb">
            <div className="sty-ans">
              <span>Q1</span>
              <span>Which packages raise alerts?</span>
              <span className="a">All four packages</span>
            </div>
            <div className="q">When should a package raise an alert?</div>
            <div className="why">
              R-DASH-014 sets the 3% threshold. The period rule is still open, so this answer becomes a proposal, not a
              requirement.
            </div>
            <div role="radiogroup" aria-label="When to raise an alert" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {QUESTION_OPTIONS.map((o) => {
                const isOn = selectedAnswer === o.n;
                return (
                  <button
                    key={o.n}
                    type="button"
                    role="radio"
                    aria-checked={isOn}
                    className={'sty-opt' + (o.rec ? ' rec' : '')}
                    data-does="Selects this answer; nothing is sent until you press Send answers"
                    data-feature="F326"
                    onClick={() => setSelectedAnswer(o.n)}
                  >
                    <span className={'sty-rd' + (isOn ? ' on' : '') + ' rd'} />
                    <span>
                      <b>
                        {o.title}
                        {o.rec ? <ProvenanceProp label="Recommended" /> : null}
                      </b>
                      <small>{o.sub}</small>
                    </span>
                    <Kbd>{o.n}</Kbd>
                  </button>
                );
              })}
            </div>
            <div className="ap-custom-answer">
              <Icon name="type" size={13} />
              Or write your own answer…
              <span className="sp-fill" />
              <Kbd>4</Kbd>
            </div>
          </div>
          <div className="sty-qf">
            <span className="hint">
              <Kbd>1-4</Kbd> pick <Kbd>↵</Kbd> next <Kbd>Esc</Kbd> skip
            </span>
            <Btn
              label="Back"
              sm
              cls="plain"
              does="Goes back one question; your earlier answer is kept"
              feature="F326"
              onClick={() => recordIntent('F326:back')}
            />
            <Btn
              label="Skip"
              sm
              does="Skips this question; the model will state the assumption it made"
              feature="F326"
              onClick={() => recordIntent('F326:skip')}
            />
            <button
              type="button"
              className="sp-btn ink sm"
              disabled={!selectedAnswer}
              data-does="Pick an answer first, or press Skip"
              data-feature="F326"
              title="Pick an answer first, or press Skip"
              onClick={() => recordIntent('F326:next:' + (selectedAnswer ?? ''))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  } else if (activeMode === 'fallback') {
    chatMessages = (
      <>
        <div className="sp-ub">Show cost variance by package as a card.</div>
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>Sonnet 5.5 · 14 s · 8 cr</em>
          </div>
          <p>I could not draw this as a card. Here are the figures as a table, with the gap marked.</p>
          <div className="sty-gx" data-feature="F328">
            <div className="k">
              <Icon name="doc" size={12} />
              Plain table · fallback
              <span className="tag">
                <ProvenanceObs label="REF-02 · imported" />
              </span>
            </div>
            <div className="sty-why" role="status">
              <Icon name="alert" size={15} />
              <span>
                <b>Shown as a table.</b> The card did not pass validation: <code>forecast</code> is missing for P-04. I
                left it empty instead of guessing, and no action on this block is active.
              </span>
            </div>
            <table className="sty-ft" aria-label="Variance by package, plain table">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Budget</th>
                  <th>Forecast</th>
                  <th>Variance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {PACKAGES.map(([n, b, f, v, s], i) =>
                  i === 3 ? (
                    <tr key={n}>
                      <td>P-04 Marine spread</td>
                      <td>
                        <code>{b}</code>
                      </td>
                      <td className="na">Not provided</td>
                      <td className="na">Not provided</td>
                      <td>
                        <Pill tone="mute" label="Cannot tell" />
                      </td>
                    </tr>
                  ) : (
                    <tr key={n}>
                      <td>{n.split(' ').slice(0, 2).join(' ')}</td>
                      <td>
                        <code>{b}</code>
                      </td>
                      <td>
                        <code>{f}</code>
                      </td>
                      <td>
                        <code>{v}</code>
                      </td>
                      <td>
                        <Pill tone={s === 'ok' ? 'ok' : 'bad'} label={s === 'ok' ? 'On track' : 'Over 3%'} />
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
            <div className="ft">
              <span className="s sty-m11">schema v1 · rejected by Rust validation</span>
              <Btn
                label="Copy table"
                sm
                does="Copies the table as plain text"
                feature="F335"
                onClick={() => recordIntent('F335:copy-table')}
              />
              <Btn
                label="Export JSON"
                sm
                does="Exports the same rows with schema version, IDs, status, sources and filters; no model call"
                feature="F335"
                onClick={() => recordIntent('F335:export-json')}
              />
              <Btn
                label="Rebuild card"
                sm
                cls="ink"
                does="Asks the model for a corrected card; the old table stays until the new one validates"
                feature="F328"
                onClick={() => recordIntent('F328:rebuild-card')}
              />
            </div>
          </div>
        </div>
      </>
    );
  } else if (activeMode === 'confirm') {
    const chk = (t: string, v: string) => (
      <div className="sty-chk">
        <span className="ok">
          <Icon name="check" size={14} stroke={2.4} />
        </span>
        <span>{t}</span>
        <span className="sty-m11 d">{v}</span>
      </div>
    );
    chatMessages = (
      <>
        <div className="sp-ub">Draw 3 more takes of F-04 with the banner idea.</div>
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>Sonnet 5.5 · 3 s · 1 cr</em>
          </div>
          <p>That runs the model three times, so I need your confirmation. Nothing has started.</p>
          <div
            className="sty-cf"
            data-feature="F330"
            role="group"
            aria-label="Confirm paid action"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setConfirmState((prev) => ({ ...prev, cancelled: true }));
                recordIntent('F330:cancel');
              } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                handleConfirm();
              }
            }}
          >
            <div className="hd2">
              <Icon name="spark" size={14} />
              Confirm: draw 3 takes of F-04
              <span className="sp-fill" />
              <Pill tone="warn" label="Paid · Hosted" />
            </div>
            <div className="bd2">
              <div className="sty-kv2">
                <span>Effect</span>
                <span>Adds 3 draft takes to the F-04 alternatives. Accepted frames stay as they are.</span>
                <span>Cost</span>
                <span>About 22 cr each. Up to 90 cr is reserved first, the rest is released.</span>
                <span>Model</span>
                <span>Hosted · Sonnet 5.5 · 3 runs</span>
              </div>
              <div>
                <div className="sty-bud" role="img" aria-label="1,240 of 5,000 credits used, 90 reserved">
                  <i className="u" style={{ width: usedPct }} />
                  <i className="r" style={{ width: reservePct }} />
                </div>
                <div className="sty-lg mt">
                  <span>
                    Used <b>{USAGE.used.toLocaleString('en-US')}</b>
                  </span>
                  <span>
                    Reserved now <b>{reserveCredits}</b>
                  </span>
                  <span>
                    Cap <b>{USAGE.cap.toLocaleString('en-US')}</b>
                  </span>
                </div>
              </div>
              <div className="sty-col6">
                {chk('Actor can edit this project', 'Rina (sample) · Editor')}
                {chk('Action is on the allowlist', 'generate_takes')}
                {chk('Spec revision is current', 'r14')}
                {chk('Within the credit cap', `${leftAfterReserve} left after reserve`)}
              </div>
              <div className="sty-lg">
                <span>
                  Idempotency key <b>{confirmState.idempotencyKey}</b>
                </span>
                <span>A retry cannot charge twice.</span>
              </div>
              {confirmState.error ? (
                <div className="sty-why" role="alert">
                  <Icon name="alert" size={15} />
                  <span>{confirmState.error}</span>
                </div>
              ) : null}
            </div>
            <div className="sty-qf">
              <span className="hint">
                <Kbd>Esc</Kbd> cancel <Kbd>⌘ ↵</Kbd> confirm
              </span>
              <Btn
                label="Cancel"
                sm
                does="Closes the confirmation; nothing is reserved or run"
                feature="F330"
                onClick={() => {
                  setConfirmState((prev) => ({ ...prev, cancelled: true }));
                  recordIntent('F330:cancel');
                }}
              />
              <Btn
                label="Confirm · reserve 90 cr"
                sm
                cls="ink"
                does="Re-checks actor, permission, revision and budget, reserves 90 cr, then starts 3 runs; a stale or denied check shows an error, never success"
                feature="F330"
                onClick={handleConfirm}
              />
            </div>
          </div>
        </div>
      </>
    );
  } else {
    // pinned
    chatMessages = (
      <>
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>Sonnet 5.5 · 2 s · 1 cr</em>
          </div>
          <p>
            Pinned to Variance flows next to F-04. It is still a proposal: S08 shows the exact diff before it can become
            a requirement.
          </p>
          {renderGapCard(true)}
          {ckCard}
        </div>
        <div className="sp-sugg" data-feature="F332">
          <button
            type="button"
            data-does="Adds GAP-07 to S08 review with its exact diff"
            data-feature="F332"
            onClick={() => (onOpenReview ? onOpenReview() : recordIntent('F332:send-s08'))}
          >
            <Icon name="chevR" size={13} />
            Send the gap to review in S08
          </button>
          <button
            type="button"
            data-does="Pins the alternatives card to the board; it stays a proposal"
            data-feature="F332"
            onClick={() => recordIntent('F332:pin-takes')}
          >
            <Icon name="chevR" size={13} />
            Pin the 3 takes as well
          </button>
          <button
            type="button"
            data-does="Exports the pinned data with schema version and IDs; no model call"
            data-feature="F332"
            onClick={() => recordIntent('F332:export-pin-json')}
          >
            <Icon name="chevR" size={13} />
            Export this pin as JSON
          </button>
        </div>
      </>
    );
  }

  const right = (
    <>
      <Btn label="Share" icon="share" later="Share and comment links (deferred in the browser MVP, R-WS-3)" />
      <Btn
        label="Hand off"
        cls="ink"
        icon="download"
        does="Opens S34: downloads only accepted revisions with a fixed revision manifest"
        feature="F339"
        onClick={() => (onOpenHandoff ? onOpenHandoff() : recordIntent('F339:handoff'))}
      />
    </>
  );

  // A card without a verdict yet (api mode, request in flight) draws nothing, never a spinner.
  if (pendingCard) return null;

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          className="sty-wide"
          title="Design chat"
          sub="F-04 selected"
          ctxItems={ctxItems}
          ctxFoot={ctxFoot}
          placeholder="Ask for a change to F-04, or @ another frame…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 470) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('design', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setRemovedCtx((prev) => (prev.includes(name) ? prev : [...prev, name]))}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setView('design', { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={handleSend}
        >
          {chatMessages}
        </ChatPanel>
      ) : null}
      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={GENUI_TABS}
          activeTab="Variance flows"
          onSelect={(tab) => setView('design', { tab })}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={right}
        />
        <div className="sp-tool">
          <ViewSwitch current="Canvas" onChange={(viewMode) => setView('design', { viewMode })} />
          <span className="sp-crumb">
            Design
            <Icon name="chevR" size={12} />
            <b>Variance flows</b>
          </span>
          <span className="sp-fill" />
          {activeMode === 'stream' ? (
            <span className="sty-st busy" role="status">
              <span className="sty-spin" />
              Spekin is writing · F-04
            </span>
          ) : null}
        </div>
        <div className="sp-work">
          <div className="sty-cvx" aria-label="Board: Variance flows">
            <div className="sp-cvt">
              Variance flows<span>5 frames · 1 reference</span>
            </div>
            <GenUiFrame frame={FRAMES.f01} x={30} y={56} w={230} h={150} pill={['ok', 'Accepted']}>
              <MiniDashboard title="Portfolio overview" chart table={false} h={150} />
            </GenUiFrame>
            <GenUiFrame frame={FRAMES.f03} x={292} y={56} w={262} h={176} pill={['ok', 'Accepted']}>
              <MiniDashboard title="Variance table" rows={4} h={176} />
            </GenUiFrame>
            <GenUiFrame
              frame={FRAMES.f04}
              x={596}
              y={56}
              w={262}
              h={176}
              cls="sel"
              pill={['warn', 'Draft · not accepted']}
            >
              <MiniDashboard title="Variance table" rows={4} drawer h={176} />
            </GenUiFrame>
            {activeMode === 'pinned' ? (
              <>
                <div
                  className="sty-pin"
                  style={{ left: '628px', top: `${pinTop}px` }}
                  data-feature="F331"
                  role="group"
                  aria-label="Pinned proposal GAP-07"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') setPinTop((y) => y + 16);
                    else if (e.key === 'ArrowUp') setPinTop((y) => Math.max(260, y - 16));
                  }}
                >
                  <div className="k">
                    <Icon name="alert" size={12} />
                    Gap · pinned from chat
                    <span className="tag">
                      <ProvenanceProp />
                    </span>
                  </div>
                  <div className="tt">No empty state when no package is over</div>
                  <div className="bd">Proposed: show “No package over 3% this period”.</div>
                  <div className="ft">
                    <span className="s">Not accepted · F-04</span>
                    <IconBtn
                      icon="chev"
                      label="Move pin down"
                      does="Moves the pin by one step; arrow keys do the same, no dragging needed"
                      sm
                      feature="F331"
                      onClick={() => setPinTop((y) => y + 16)}
                    />
                    <Btn
                      label="Unpin"
                      sm
                      does="Removes the pin from the board"
                      feature="F331"
                      onClick={() => setMode('cards')}
                    />
                  </div>
                </div>
                <svg className="sp-arrows" width="950" height="694" aria-hidden="true">
                  <path
                    d="M727 254 L 727 298"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </svg>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
