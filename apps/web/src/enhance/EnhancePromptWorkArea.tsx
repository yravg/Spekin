import { useEffect, useState, type KeyboardEvent } from 'react';
import {
  sampleData,
  type SampleEnhanceSeg,
  type SampleUsage,
} from '../data/source';
const {
  CTX_DESIGN,
  ENH_BLOCKED,
  ENH_COST,
  ENH_CTX,
  ENH_NOT_SENT,
  ENH_ORIG_SEGS,
  ENH_ORIGINAL,
  ENH_SEGS,
  ENH_SHORTCUT,
  MODEL,
  USAGE,
} = sampleData;
import { useWorkspace } from '../state/workspace';
import { Icon } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { MiniDashboard } from '../shell/MiniDashboard';

export type EnhancePhase = 'empty' | 'ready' | 'busy' | 'review' | 'applied' | 'blocked';

export interface EnhanceShellOverride {
  usage?: SampleUsage;
}

const ENHANCE_TABS: ArtifactTabItem[] = [
  { icon: 'grid', name: 'Variance flows' },
  { icon: 'frame', name: 'F-03 Variance table' },
  { icon: 'frame', name: 'F-04 Alert drawer' },
  { icon: 'doc', name: 'DESIGN.md' },
];

export function enhanceWordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function SparkleIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      className="ic"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 4l1.8 4.7L16.5 10.5l-4.7 1.8L10 17l-1.8-4.7L3.5 10.5l4.7-1.8z" />
      <path d="M18.5 3v4M16.5 5h4M18 15v3.5M16.25 16.75h3.5" />
    </svg>
  );
}

function SegmentList(props: {
  segs: SampleEnhanceSeg[];
  removable: boolean;
  onRemove?: (id: string) => void;
}) {
  const { segs, removable, onRemove } = props;
  return (
    <>
      {segs.map(([k, t, id], i) =>
        k === 's' ? (
          <span key={id ?? i} className="s">
            <i>{id}</i>
            {t.trim()}
            {removable && id ? (
              <button
                type="button"
                aria-label={'Remove assumption ' + id}
                data-does="Removes this assumption from the proposal; the sentence is deleted, nothing else changes"
                data-feature="F537"
                onClick={() => onRemove?.(id)}
              >
                <Icon name="x" size={11} />
              </button>
            ) : null}
          </span>
        ) : (
          <span key={i} className={k}>
            {t}
          </span>
        ),
      )}
    </>
  );
}

function EnhanceLegend() {
  return (
    <div className="enh-legend">
      <span className="c">
        <i />
        Changed
      </span>
      <span className="a">
        <i />
        Added from project
      </span>
      <span className="s">
        <i />
        Assumption
      </span>
    </div>
  );
}

// S41 Enhance prompt (F531–F539).
// F538: the enhanced proposal keeps the language of the draft (Bahasa Indonesia or English), regardless of UI language.
export function EnhancePromptWorkArea(
  props: {
    capped?: boolean;
    onShellOverride?: (ov: EnhanceShellOverride) => void;
    onOpenShell?: () => void;
    onOpenStyle?: () => void;
    onOpenUsage?: () => void;
    onSend?: (text: string) => void;
  } = {},
) {
  const { capped = false, onShellOverride, onOpenShell, onOpenStyle, onOpenUsage, onSend } = props;
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const [draft, setDraft] = useState('');
  const [originalDraft, setOriginalDraft] = useState('');
  const [phase, setPhase] = useState<EnhancePhase>('empty');
  const [removedAssumptions, setRemovedAssumptions] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(true);
  const [editingApplied, setEditingApplied] = useState(false);
  const [removedCtx, setRemovedCtx] = useState<string[]>([]);

  useEffect(() => {
    if (!onShellOverride) return;
    return () => onShellOverride({});
  }, [onShellOverride]);

  const activeSegs = ENH_SEGS.filter(([, , id]) => !id || !removedAssumptions.includes(id));
  const appliedSegs: SampleEnhanceSeg[] = activeSegs.map(([k, t, id]) => [k === 's' ? 's' : 'k', t, id]);
  const plainEnhanced = activeSegs.map((s) => s[1]).join('').trim();
  const nOrig = enhanceWordCount(originalDraft || draft || ENH_ORIGINAL);
  const nNew = enhanceWordCount(plainEnhanced);

  const ctxItems = CTX_DESIGN.filter(([, name]) => !removedCtx.includes(name));

  const startEnhance = () => {
    if (!draft.trim() || phase === 'busy' || phase === 'blocked') return;
    setOriginalDraft(draft);
    if (capped) {
      onShellOverride?.({ usage: { ...USAGE, used: USAGE.cap } });
      setPhase('blocked');
      return;
    }
    setRemovedAssumptions([]);
    setSheetOpen(true);
    setEditingApplied(false);
    setPhase('busy');
  };

  const completeEnhance = () => {
    if (phase !== 'busy') return;
    setPhase('review');
  };

  const cancelOrDiscard = () => {
    const restored = originalDraft || draft;
    setDraft(restored);
    setEditingApplied(false);
    setPhase(restored.trim() ? 'ready' : 'empty');
  };

  const applyProposal = (forEdit: boolean) => {
    setDraft(plainEnhanced);
    setEditingApplied(forEdit);
    setPhase('applied');
  };

  const undoEnhance = () => {
    const restored = originalDraft || ENH_ORIGINAL;
    setDraft(restored);
    setEditingApplied(false);
    setPhase(restored.trim() ? 'ready' : 'empty');
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    setEditingApplied(false);
    setPhase(value.trim() ? 'ready' : 'empty');
  };

  const handleSend = () => {
    if (phase === 'empty' || phase === 'busy' || phase === 'review' || phase === 'blocked') return;
    const text = phase === 'applied' && !editingApplied ? plainEnhanced : draft;
    if (!text.trim()) return;
    if (onSend) onSend(text);
    else recordIntent('F535:send');
    setDraft('');
    setOriginalDraft('');
    setEditingApplied(false);
    setPhase('empty');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      startEnhance();
    } else if (e.key === 'Escape' && (phase === 'busy' || phase === 'review')) {
      e.preventDefault();
      cancelOrDiscard();
    }
  };

  useEffect(() => {
    if (phase !== 'busy' && phase !== 'review') return;
    const onGlobalKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelOrDiscard();
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  });

  const removeAssumption = (id: string) => {
    setRemovedAssumptions((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const sparkDoes = 'Rewrites the draft into a clearer, fuller prompt for review; a small paid run, nothing is sent';

  const renderSparkBtn = (mode: 'off' | 'on' | 'busy') => {
    if (mode === 'off') {
      return (
        <button
          type="button"
          className="sp-ibtn enh-btn"
          aria-label="Enhance prompt"
          aria-disabled="true"
          title="Write a message first: there is nothing to enhance"
          data-does={sparkDoes + '; disabled while the draft is empty or a run is in progress'}
          data-feature="F531"
          onClick={() => {}}
        >
          <SparkleIcon size={15} />
        </button>
      );
    }
    if (mode === 'busy') {
      return (
        <button
          type="button"
          className="sp-ibtn enh-btn"
          aria-label="Enhancing prompt"
          aria-busy="true"
          title="Enhancing, press Esc to cancel"
          data-does="Shows that the enhance run is in progress; the button is not pressable until it ends"
          data-feature="F532"
          onClick={() => {}}
        >
          <span className="enh-spin" aria-hidden="true" />
        </button>
      );
    }
    return (
      <button
        type="button"
        className="sp-ibtn enh-btn"
        aria-label="Enhance prompt"
        title={'Enhance prompt (' + ENH_SHORTCUT + ')'}
        data-does={sparkDoes + '; also ' + ENH_SHORTCUT}
        data-feature="F531"
        onClick={startEnhance}
      >
        <SparkleIcon size={15} />
      </button>
    );
  };

  const renderSendBtn = (off: boolean) => (
    <button
      type="button"
      className="sp-send"
      aria-disabled={off ? 'true' : undefined}
      aria-label="Send"
      data-does="Sends the message with exactly the listed context; a paid run reserves its maximum first. Enhance never sends for you"
      data-feature="F535"
      onClick={off ? () => {} : handleSend}
    >
      <Icon name="up" size={15} stroke={2} />
    </button>
  );

  const renderRow = (mode: 'off' | 'on' | 'busy', sendOff: boolean) => (
    <div className="enh-row">
      <IconBtn
        icon="plus"
        label="Attach a file"
        does="Attaches a PNG, JPEG or WebP the user picked; nothing is read without a file choice"
        size={15}
        sm
        feature="F114"
        onClick={() => recordIntent('F114:attach')}
      />
      <IconBtn
        icon="at"
        label="Mention an artifact"
        does="Inserts an artifact reference and adds it to the context list"
        size={15}
        sm
        feature="F106"
        onClick={() => recordIntent('F106:mention')}
      />
      <button
        type="button"
        className="sp-model"
        data-does="Opens the model source picker: Hosted, BYOK, Local agent (deferred); the enhance run is billed to the same source"
        data-feature="F539"
        onClick={() => {
          recordIntent('F539:model');
          onOpenUsage?.();
        }}
      >
        <span className="src">{MODEL.source}</span>
        {MODEL.name}
        <Icon name="chev" size={12} />
      </button>
      <span className="enh-spacer" />
      <span style={{ position: 'relative', display: 'inline-flex' }}>{renderSparkBtn(mode)}</span>
      {renderSendBtn(sendOff)}
    </div>
  );

  const metaIdle = (
    <div className="enh-meta">
      <span>
        Enhance <b>{ENH_COST.est}</b>
      </span>
      <span>·</span>
      <span>
        Send <b>{ENH_COST.send}</b>
      </span>
    </div>
  );

  let composerNode;
  if (phase === 'busy') {
    composerNode = (
      <div className="sp-comp enh-comp">
        <div className="enh-lockrow">
          <Icon name="lock" size={12} />
          Draft locked while Enhance runs
        </div>
        <div className="ta lock">{draft}</div>
        <div className="enh-prog" role="status">
          <span className="enh-spin" aria-hidden="true" />
          <span onClick={completeEnhance}>Reading Design stage, spec r14, F-03, DESIGN.md r3, 2 decisions…</span>
          <Btn
            label="Cancel"
            sm
            does="Cancels the enhance run at once (Esc); the draft unlocks unchanged and a cancelled run is not charged beyond what already ran"
            feature="F532"
            onClick={cancelOrDiscard}
          />
        </div>
        <div className="enh-bar" aria-hidden="true">
          <u />
        </div>
        <div className="enh-meta">
          <span>
            Reserved up to <b>{ENH_COST.max}</b>
          </span>
          <span>·</span>
          <span className="src">{MODEL.source}</span>
          <span>{MODEL.name}</span>
        </div>
        {renderRow('busy', true)}
      </div>
    );
  } else if (phase === 'review') {
    composerNode = (
      <div className="sp-comp enh-comp enh-prop">
        <div className="enh-ph">
          <SparkleIcon size={14} />
          Enhanced prompt
          <Pill tone="acc" label="Proposal" />
          <span className="sp-fill" />
          <span className="enh-meta">
            {nOrig} to {nNew} words
          </span>
        </div>
        <div className="enh-txt">
          <SegmentList segs={activeSegs} removable onRemove={removeAssumption} />
        </div>
        <EnhanceLegend />
        <div className="enh-meta">
          <span>
            Used <b>{ENH_COST.actual}</b>
          </span>
          <span>·</span>
          <span className="src">{MODEL.source}</span>
          <span>{MODEL.name}</span>
          <span>·</span>
          <span>{ENH_COST.time}</span>
        </div>
        <div className="enh-acts">
          <Btn
            label="Use"
            cls="ink"
            sm
            icon="check"
            does="Puts the enhanced text in the composer in place of your draft and keeps an Undo; it does not send"
            feature="F535"
            onClick={() => applyProposal(false)}
          />
          <Btn
            label="Edit"
            sm
            does="Puts the enhanced text in the composer for hand editing; the original stays one Undo away"
            feature="F535"
            onClick={() => applyProposal(true)}
          />
          <Btn
            label="Discard"
            sm
            cls="plain"
            does="Drops the proposal and returns your original draft unchanged; the spent credits are not refunded"
            feature="F535"
            onClick={cancelOrDiscard}
          />
          <span className="sp-fill" />
          {renderSendBtn(true)}
        </div>
      </div>
    );
  } else if (phase === 'applied') {
    composerNode = (
      <div className="sp-comp enh-comp">
        <div className="enh-chip">
          <SparkleIcon size={13} />
          <span>Enhanced</span>
          <span className="t">{ENH_COST.actual}</span>
          <span className="sp-fill" />
          <button
            type="button"
            data-does="Restores your exact original draft word for word and removes this chip; one step, not a history"
            data-feature="F536"
            onClick={undoEnhance}
          >
            <Icon name="undo" size={12} />
            Undo enhance
          </button>
        </div>
        {editingApplied ? (
          <div className="ta ap-ta-wrap">
            <span className="ap-ta-ph" aria-hidden="true">
              {draft}
            </span>
            <textarea
              className="ap-ta-input"
              aria-label="Message composer"
              value={draft}
              onChange={(e) => handleDraftChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        ) : (
          <div className="ta">
            <div className="enh-txt">
              <SegmentList segs={appliedSegs} removable onRemove={removeAssumption} />
            </div>
          </div>
        )}
        {metaIdle}
        {renderRow('on', false)}
      </div>
    );
  } else if (phase === 'blocked') {
    const capBlocked = ENH_BLOCKED[0];
    composerNode = (
      <div className="sp-comp enh-comp">
        <div className="enh-ban bad" role="alert">
          <Icon name="alert" size={14} className="ib" />
          <div className="bx">
            <b>{capBlocked?.[0]}</b>
            <span>{capBlocked?.[2]}</span>
            <div className="acts">
              <Btn
                label="Open usage"
                sm
                does="Opens S36 usage: cap, reservations and remaining credits"
                feature="F539"
                onClick={() => {
                  recordIntent('F539:open-usage');
                  onOpenUsage?.();
                }}
              />
              <Btn
                label="Use my own key"
                sm
                does="Opens the model source picker to switch the enhance run to a BYOK key"
                feature="F539"
                onClick={() => {
                  recordIntent('F539:byok');
                  onOpenUsage?.();
                }}
              />
            </div>
          </div>
        </div>
        <div className="ta">{draft}</div>
        <div className="enh-meta">
          <span>
            Enhance <b>blocked</b>
          </span>
          <span>·</span>
          <span>
            Send <b>blocked</b>
          </span>
        </div>
        {renderRow('off', true)}
      </div>
    );
  } else {
    const isEmpty = phase === 'empty';
    composerNode = (
      <div className="sp-comp enh-comp">
        <div className={isEmpty ? 'ta ph ap-ta-wrap' : 'ta ap-ta-wrap'}>
          <span className="ap-ta-ph" aria-hidden="true">
            {draft || 'Ask for a change to F-03, or @ another frame…'}
          </span>
          <textarea
            className="ap-ta-input"
            aria-label="Message composer"
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="enh-tip" style={{ right: '6px', bottom: 'calc(100% + 9px)' }} role="tooltip">
          {isEmpty ? 'Write a message first: there is nothing to enhance ' : 'Enhance prompt '}
          <kbd>{ENH_SHORTCUT}</kbd>
        </div>
        {metaIdle}
        {renderRow(isEmpty ? 'off' : 'on', isEmpty)}
      </div>
    );
  }

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Design chat"
          sub="F-03 selected"
          ctxItems={ctxItems}
          ctxFoot="≈ 9.8k tokens · the whole board is never sent"
          placeholder=""
          draft={draft}
          model={MODEL}
          width={chatWidth}
          composer={composerNode}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => {
            setDraft('');
            setOriginalDraft('');
            setPhase('empty');
          }}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setRemovedCtx((prev) => [...prev, name])}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={handleDraftChange}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => {
            recordIntent('F539:model');
            onOpenUsage?.();
          }}
          onSend={handleSend}
        >
          <div className="sp-ub">Show the variance table with the three packages that are over budget.</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 21 s · 17 cr</em>
            </div>
            <p>F-03 stays accepted at r6. Three packages are over budget this period.</p>
          </div>
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={ENHANCE_TABS}
          activeTab="F-03 Variance table"
          onSelect={(tab) => {
            if (tab === 'Variance flows' && onOpenShell) onOpenShell();
            else if (tab === 'DESIGN.md' && onOpenStyle) onOpenStyle();
            else recordIntent('F104:tab:' + tab);
          }}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={null}
        />
        <div className="enh-crumb">
          Design
          <Icon name="chevR" size={12} />
          <b>F-03 Variance table</b>
          <span className="sp-fill" />
          <Pill tone="ok" label="Accepted r6" />
        </div>
        <div className="enh-stage">
          <div className="enh-fr">
            <div className="lab">
              <Icon name="frame" size={13} />
              F-03 Variance table
            </div>
            <MiniDashboard title="Variance" kpi chart={false} table rows={4} h={300} />
          </div>

          {phase === 'review' && sheetOpen ? (
            <div className="enh-sheet" role="region" aria-label="Compare original and enhanced prompt" data-feature="F533">
              <div className="enh-sh">
                <Icon name="diff" size={15} />
                Compare
                <span>original and enhanced, changes marked</span>
                <span className="sp-fill" />
                <Btn
                  label="Hide"
                  sm
                  cls="plain"
                  does="Hides this compare sheet; the proposal stays in the composer"
                  feature="F533"
                  onClick={() => setSheetOpen(false)}
                />
              </div>
              <div className="enh-cols">
                <div className="enh-col">
                  <h5>
                    Your draft<em>{nOrig} words</em>
                  </h5>
                  <div className="enh-txt">
                    <SegmentList segs={ENH_ORIG_SEGS} removable={false} />
                  </div>
                  <span className="enh-nots">
                    Kept exactly as typed until you press Use. Bahasa Indonesia stays Bahasa Indonesia.
                  </span>
                </div>
                <div className="enh-col">
                  <h5>
                    Enhanced<em>{nNew} words</em>
                  </h5>
                  <div className="enh-txt">
                    <SegmentList segs={activeSegs} removable={false} />
                  </div>
                  <EnhanceLegend />
                </div>
              </div>
              <div className="enh-used">
                <h5>Context it used · {ENH_CTX.length} items</h5>
                <div className="enh-ul">
                  {ENH_CTX.map(([icName, label, val]) => (
                    <div key={label} className="enh-u">
                      <Icon name={icName} size={13} />
                      <div>
                        <b>{label}</b>
                        <span>{val}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <span className="enh-nots">
                  {ENH_NOT_SENT} It adds no fact that is not in this project: new statements are either from the list above or marked as an assumption.
                </span>
              </div>
              <div className="enh-sf">
                <span>Nothing is sent. Use puts this text in your draft, then you press Send.</span>
                <span className="sp-fill" />
                <Btn
                  label="Change context"
                  sm
                  does="Opens the context list so an item can be removed and Enhance run again; spends a new run"
                  feature="F534"
                  onClick={() => recordIntent('F534:change-context')}
                />
              </div>
            </div>
          ) : null}

          {phase === 'blocked' ? (
            <div className="enh-var" role="region" aria-label="Messages when Enhance cannot run" data-feature="F539">
              <h5>When Enhance cannot run</h5>
              {ENH_BLOCKED.map(([title, kind, msg, actions], i) => (
                <div key={title} className="enh-vr">
                  <b>
                    <Pill tone={kind === 'bad' ? 'bad' : 'warn'} label={i === 0 ? 'Now' : 'Also'} />
                    {title}
                  </b>
                  <p>{msg}</p>
                  <div className="acts">
                    {actions.map((act) => (
                      <Btn
                        key={act}
                        label={act}
                        sm
                        does={act + ': the recovery action for the “' + title + '” message; the draft is never changed or sent'}
                        feature="F539"
                        onClick={() => {
                          recordIntent('F539:' + act);
                          if (act === 'Open usage' || act === 'Use my own key') onOpenUsage?.();
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
