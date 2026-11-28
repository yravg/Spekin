import { useState } from 'react';
import {
  sampleData,
  type SampleGapBEntry,
  type SampleGapCFrame,
  type SampleGapCFrameKind,
} from '../data/source';
import { useWorkspace } from '../state/workspace';
import { Icon } from '../ui/Icon';
import { Btn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { MiniDashboard } from '../shell/MiniDashboard';

const {
  GAPB_GAPS,
  GAPC_BLOCKED,
  GAPC_CTX_S21,
  GAPC_FRAMES,
  GAPC_LOCKED_TICKETS,
  GAPC_PINS,
  GAPC_POLICY,
  GAPC_TOOLS,
  GAPC_UNTRUSTED,
  MODEL,
} = sampleData;

export type CanvasStepState = 'grid' | 'detail' | 'sandbox' | 'untrusted' | 'approve' | 'approved';

const S21_TABS: ArtifactTabItem[] = [
  { icon: 'frame', name: 'Canvas step · Inc. 2' },
  { icon: 'doc', name: 'Decision log' },
  { icon: 'list', name: 'Ticket board' },
];

/**
 * Owner decision (24 Nov): "Setujui kanvas" is blocked while any UI part has no component;
 * a GAP register entry in @spekin/sample covering that frame unblocks it.
 */
export function canApproveCanvas(
  frames: readonly SampleGapCFrame[],
  gaps: readonly SampleGapBEntry[],
): { allowed: boolean; uncoveredFrameIds: string[] } {
  const uncoveredFrameIds = frames
    .filter((f) => f.noComp > 0)
    .filter((f) => !gaps.some((g) => g.used.split(/\s*·\s*|\s+/).includes(f.id)))
    .map((f) => f.id);
  return { allowed: uncoveredFrameIds.length === 0, uncoveredFrameIds };
}

function WireframeThumb({ kind }: { kind: SampleGapCFrameKind }) {
  if (kind === 'drawer') {
    return (
      <div className="gpc-wf" style={{ position: 'relative', height: '100%' }}>
        <i className="h" />
        <i />
        <i className="f" />
        <i />
        <div className="dr">
          <i className="h" style={{ width: '70%' }} />
          <i />
          <i />
          <i className="f" />
        </div>
      </div>
    );
  }
  if (kind === 'lines') {
    return (
      <div className="gpc-wf">
        <i className="h" />
        <i />
        <i />
        <i />
        <i />
      </div>
    );
  }
  if (kind === 'overview') {
    return (
      <div className="gpc-wf">
        <i className="h" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px' }}>
          <i style={{ height: '24px' }} />
          <i style={{ height: '24px' }} />
          <i style={{ height: '24px' }} />
          <i style={{ height: '24px' }} />
        </div>
        <i />
        <i />
      </div>
    );
  }
  return (
    <div className="gpc-wf">
      <i className="h" />
      <i />
      <i className="f" />
      <i />
      <i className="f" />
    </div>
  );
}

// S21 Canvas step: approval and sandboxed preview (F491-F499).
// Board: docs/design/spekin-canvas/project/S21-canvas-step.dc.html.
export function CanvasStepWorkArea(
  props: {
    initialState?: CanvasStepState;
    frames?: readonly SampleGapCFrame[];
    gaps?: readonly SampleGapBEntry[];
    onOpenTickets?: () => void;
    onOpenHandoff?: () => void;
  } = {},
) {
  const {
    initialState = 'grid',
    frames = GAPC_FRAMES,
    gaps = GAPB_GAPS,
    onOpenTickets,
    onOpenHandoff,
  } = props;

  const [viewMode, setViewMode] = useState<'grid' | 'detail' | 'sandbox' | 'untrusted'>(() =>
    initialState === 'detail' || initialState === 'sandbox' || initialState === 'untrusted'
      ? initialState
      : 'grid',
  );
  const [approveOpen, setApproveOpen] = useState(initialState === 'approve');
  const [approved, setApproved] = useState(initialState === 'approved');
  const [selectedFrameId, setSelectedFrameId] = useState<string>('F-04');
  const [removedCtx, setRemovedCtx] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [sandboxKey, setSandboxKey] = useState(0);

  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const noCompTotal = frames.reduce((acc, f) => acc + f.noComp, 0);
  const approvalGate = canApproveCanvas(frames, gaps);
  const ctxItems = GAPC_CTX_S21.filter(([, name]) => !removedCtx.includes(name));
  const detailFrame = frames.find((f) => f.id === selectedFrameId) ?? frames[2] ?? frames[0] ?? GAPC_FRAMES[2]!;
  const segCurrent = viewMode === 'sandbox' || viewMode === 'untrusted' ? 'prev' : viewMode;
  const blockedApproveReason =
    'Blocked while UI parts have no component or GAP register entry (' +
    approvalGate.uncoveredFrameIds.join(', ') +
    ')';

  const openDetail = (frameId: string) => {
    setSelectedFrameId(frameId);
    setApproveOpen(false);
    setViewMode('detail');
  };

  const openSandbox = () => {
    setApproveOpen(false);
    setViewMode('sandbox');
  };

  const handleSetujuiClick = () => {
    if (!approvalGate.allowed) {
      recordIntent('F496:blocked-no-component');
      return;
    }
    setApproveOpen(true);
  };

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Canvas chat"
          sub="Inc. 2"
          ctxItems={ctxItems}
          ctxFoot="≈ 5.4k tokens · secrets by name only"
          placeholder="Ask about the frames…"
          draft={draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setDraft('')}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setRemovedCtx((prev) => [...prev, name])}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={setDraft}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          <div className="sp-ub">Is the canvas ready to approve?</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 9 s · 4 cr</em>
            </div>
            <p>
              2 of 4 frames are accepted. F-04 and F-05 are drafts and 3 UI parts have no component. You can still
              approve; the tickets will ask for them.
            </p>
          </div>
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={S21_TABS}
          activeTab="Canvas step · Inc. 2"
          onSelect={(name) => {
            if (name === 'Ticket board' && onOpenTickets) onOpenTickets();
            else recordIntent('F104:tab:' + name);
          }}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={null}
        />

        {approved ? (
          <div className="sp-banner" role="status" data-feature="F497" style={{ background: 'var(--ok-soft)' }}>
            <Icon name="check" size={16} />
            <p>
              <b>Canvas approved.</b> T-05, T-06 and T-08 are unlocked. Decision D-21 was logged at 12:52.
            </p>
            <Btn
              label="Open ticket board"
              sm
              does="Opens S15 with the three tickets unlocked"
              feature="F497"
              onClick={() => (onOpenTickets ? onOpenTickets() : recordIntent('F497:open-tickets'))}
            />
          </div>
        ) : null}

        <div className="gpc-bar">
          <div className="gpc-seg" role="group" aria-label="View">
            <button
              type="button"
              aria-pressed={segCurrent === 'grid' ? 'true' : 'false'}
              data-does="Shows every user-app frame in a grid with screen id, title, component tags and the UI tanpa komponen count"
              data-feature="F491"
              onClick={() => {
                setApproveOpen(false);
                setViewMode('grid');
              }}
            >
              <Icon name="grid" size={14} />
              Frames
            </button>
            <button
              type="button"
              aria-pressed={segCurrent === 'detail' ? 'true' : 'false'}
              data-does="Shows one frame large with its pinned comments"
              data-feature="F492"
              onClick={() => openDetail(selectedFrameId)}
            >
              <Icon name="frame" size={14} />
              Frame detail
            </button>
            <button
              type="button"
              aria-pressed={segCurrent === 'prev' ? 'true' : 'false'}
              data-does="Shows the frame running in the sandboxed preview"
              data-feature="F493"
              onClick={openSandbox}
            >
              <Icon name="eye" size={14} />
              Preview
            </button>
          </div>

          <span className="gpc-sum">
            <b>{frames.length} frames</b>
            <span className={'cnt' + (approved ? ' ok' : '')}>
              {approved ? (
                <>
                  <Icon name="check" size={12} />
                  All unlocked
                </>
              ) : (
                <>
                  <Icon name="alert" size={12} />
                  UI tanpa komponen · {noCompTotal}
                </>
              )}
            </span>
          </span>
          <span className="gpc-fill" />

          {approved ? (
            <Btn
              label="Kirim ke yravgbuilder"
              sm
              cls="ink"
              does="Sends the approved canvas to yravgbuilder as a hand-off; opens S25 export with the frames pre-selected"
              feature="F498"
              onClick={() => (onOpenHandoff ? onOpenHandoff() : recordIntent('F498:handoff'))}
            />
          ) : (
            <button
              type="button"
              className="sp-btn ghost"
              aria-disabled="true"
              data-does="Disabled until the canvas is approved; hover says why"
              data-feature="F498"
              title="Disabled until the canvas is approved; hover says why"
              onClick={() => recordIntent('F498:blocked')}
            >
              Kirim ke yravgbuilder
            </button>
          )}

          {approved ? (
            <Pill tone="ok" label="Canvas approved 12:52" />
          ) : approvalGate.allowed ? (
            <Btn
              label="Setujui kanvas"
              sm
              cls="ink"
              does="Opens the approval dialog: it creates a Proposal, and only accepting that unlocks the frontend tickets"
              feature="F496"
              onClick={handleSetujuiClick}
            />
          ) : (
            <button
              type="button"
              className="sp-btn ink sm"
              aria-disabled="true"
              data-does={blockedApproveReason}
              data-feature="F496"
              title={blockedApproveReason}
              onClick={handleSetujuiClick}
            >
              Setujui kanvas
            </button>
          )}
        </div>

        <div className="gpc-body">
          {viewMode === 'grid' ? (
            <div className="gpc-gridw">
              <div className="gpc-fg">
                {frames.map((f) => (
                  <div key={f.id} className="gpc-fc">
                    <div className="th">
                      <WireframeThumb kind={f.kind} />
                    </div>
                    <div className="ft">
                      <div className="a">
                        <code>{f.id}</code>
                        <b>{f.title}</b>
                        <span className="gpc-fill" />
                        <Pill
                          tone={approved ? 'ok' : f.st[0]}
                          label={approved ? 'Accepted ' + f.rev : f.st[1]}
                        />
                      </div>
                      <div className="gpc-tg">
                        {f.comps.map((c) => (
                          <code key={c}>{c}</code>
                        ))}
                        {f.noComp ? (
                          <span className="none">
                            <Icon name="alert" size={12} />
                            UI tanpa komponen · {f.noComp}
                          </span>
                        ) : null}
                        {!f.comps.length && !f.noComp ? <code>none</code> : null}
                      </div>
                      <div className="gpc-tg">
                        <button
                          type="button"
                          className="gpc-chipf"
                          data-does={'Opens ' + f.id + ' in frame detail with its pinned comments'}
                          data-feature="F491"
                          onClick={() => openDetail(f.id)}
                        >
                          <Icon name="comment" size={12} />
                          {f.comments} pinned
                        </button>
                        <button
                          type="button"
                          className="gpc-chipf"
                          data-does={'Runs ' + f.id + ' in the sandboxed preview, with no network and no parent cookies'}
                          data-feature="F493"
                          onClick={openSandbox}
                        >
                          <Icon name="eye" size={12} />
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="gpc-side" aria-label="Approval">
                <h4>Approval</h4>
                <div className={'gpc-lock' + (approved ? ' open' : '')} data-feature="F497">
                  <div className="t">
                    <Icon name={approved ? 'unlock' : 'lock'} size={15} />
                    {approved ? 'Frontend tickets unlocked' : 'Frontend tickets locked'}
                  </div>
                  <p>
                    {approved
                      ? 'Approved by Rina (sample) at 12:52 through Proposal 0010. Decision D-21 is logged.'
                      : 'They unlock only when this canvas is approved through a Proposal. Planning and test tickets stay editable.'}
                  </p>
                  <div className="lk">
                    {GAPC_LOCKED_TICKETS.map((id) => (
                      <code key={id}>
                        <Icon name={approved ? 'check' : 'lock'} size={11} />
                        {id}
                      </code>
                    ))}
                  </div>
                </div>

                <h4>Checks</h4>
                <div className="gpc-ul">
                  <li>
                    <Icon name={approved ? 'check' : 'alert'} size={14} />
                    <span>Frames accepted</span>
                    <Pill tone={approved ? 'ok' : 'warn'} label={approved ? '4 of 4' : '2 of 4'} />
                  </li>
                  <li>
                    <Icon name={approved ? 'check' : 'alert'} size={14} />
                    <span>UI tanpa komponen</span>
                    <Pill tone={approved ? 'ok' : 'bad'} label={approved ? 'Planned in tickets' : String(noCompTotal)} />
                  </li>
                  <li>
                    <Icon name="check" size={14} />
                    <span>Open pinned comments</span>
                    <Pill tone="mute" label="4" />
                  </li>
                </div>

                <div data-feature="F499" style={{ paddingTop: '4px' }}>
                  <h4 style={{ marginBottom: '6px' }}>Canvas tool</h4>
                  <div className="gpc-tools">
                    {GAPC_TOOLS.map(([name, role, tone]) => (
                      <div key={name}>
                        <span>{name}</span>
                        <Pill tone={tone} label={role} />
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-dim)', lineHeight: 1.45 }}>
                  Source location of the default tool is pending the owner (Q-11).
                </p>
              </aside>
            </div>
          ) : viewMode === 'detail' ? (
            <div className="gpc-gridw">
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                <div className="gpc-meta">
                  <Btn
                    label="Back to frames"
                    sm
                    cls="plain"
                    icon="chevR"
                    does="Returns to the frame grid"
                    feature="F491"
                    onClick={() => setViewMode('grid')}
                  />
                  <code>{detailFrame.id}</code>
                  <b
                    style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: 1,
                      fontFamily: 'var(--font)',
                      color: 'var(--ink)',
                    }}
                  >
                    {detailFrame.title}
                  </b>
                  <Pill tone={detailFrame.st[0]} label={detailFrame.st[1]} />
                  <span>{detailFrame.rev} · 1440 × 900</span>
                </div>

                <div className="gpc-fc" style={{ flex: 1, minHeight: 0 }}>
                  <div className="th" style={{ height: '100%', padding: '14px 16px', position: 'relative' }}>
                    <MiniDashboard title="Alert drawer" kpi table rows={4} drawer h={300} />
                    <span className="gpc-pin" style={{ left: '610px', top: '78px' }}>
                      1
                    </span>
                    <span className="gpc-pin" style={{ left: '300px', top: '128px' }}>
                      2
                    </span>
                    <span className="gpc-pin done" style={{ left: '716px', top: '28px' }}>
                      3
                    </span>
                  </div>
                </div>

                <div className="gpc-tg">
                  <code>components/side-drawer</code>
                  <span className="none">
                    <Icon name="alert" size={12} />
                    UI tanpa komponen · 1
                  </span>
                  <Btn
                    label="Add pin"
                    sm
                    icon="comment"
                    does="Drops a pinned comment on the frame; comments feed the proposal, they do not change the frame"
                    feature="F492"
                    onClick={() => recordIntent('F492:add-pin')}
                  />
                </div>
              </div>

              <aside className="gpc-side" aria-label="Pinned comments">
                <h4>Pinned comments · 3</h4>
                <div
                  data-feature="F492"
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}
                >
                  {GAPC_PINS.map(([n, who, at, tx, st]) => (
                    <div key={n} className="gpc-cm">
                      <span className={'pn' + (st === 'done' ? ' done' : '')}>{n}</span>
                      <span>
                        {tx}
                        <small>
                          {who} · {at} · {st === 'done' ? 'Resolved' : 'Open'}
                        </small>
                      </span>
                    </div>
                  ))}
                </div>
                <h4>Component tags</h4>
                <div className="gpc-ul">
                  <li>
                    <Icon name="grid" size={14} />
                    <span>
                      <code>components/side-drawer</code>
                    </span>
                    <Pill tone="ok" label="Tagged" />
                  </li>
                  <li>
                    <Icon name="alert" size={14} />
                    <span>Close button</span>
                    <Pill tone="bad" label="No component" />
                  </li>
                </div>
              </aside>
            </div>
          ) : (
            <div className="gpc-sbx">
              <div className="gpc-sbl">
                <div className="gpc-meta">
                  <Btn
                    label="Back to frames"
                    sm
                    cls="plain"
                    icon="chevR"
                    does="Returns to the frame grid"
                    feature="F491"
                    onClick={() => setViewMode('grid')}
                  />
                  <b
                    style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: 1,
                      fontFamily: 'var(--font)',
                      color: 'var(--ink)',
                    }}
                  >
                    {viewMode === 'untrusted'
                      ? 'Reference REF-03 · imported skill'
                      : 'F-03 Variance table · prototype'}
                  </b>
                  <Pill tone="ok" label="Sandboxed" />
                </div>

                {viewMode === 'untrusted' ? (
                  <>
                    <div className="gpc-q" data-feature="F495">
                      <div className="k">
                        <Icon name="alert" size={12} />
                        Untrusted source text · {GAPC_UNTRUSTED.src}
                      </div>
                      <code>{GAPC_UNTRUSTED.text}</code>
                    </div>
                    <div className="gpc-ul">
                      {GAPC_UNTRUSTED.outcome.map(([a, b]) => (
                        <li key={a}>
                          <Icon name="ban" size={14} />
                          <span>
                            <b>{a}</b>
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12.5px',
                        lineHeight: 1.5,
                        color: 'var(--ink-dim)',
                        maxWidth: '560px',
                      }}
                    >
                      Imported code and reference text are data. Spekin shows them and can quote them in a proposal, but
                      never follows an instruction found inside them.
                    </p>
                  </>
                ) : (
                  <>
                    <div key={sandboxKey} className="gpc-frame" style={{ flex: 1, minHeight: 0 }}>
                      <div className="bar" data-feature="F493">
                        <Icon name="shield" size={14} />
                        sandbox · opaque origin · no network · no cookies
                        <span className="gpc-fill" />
                        <span>fixture.json</span>
                      </div>
                      <div className="pg">
                        <MiniDashboard title="Variance" kpi table rows={4} h={360} />
                        <iframe
                          title="Sandboxed prototype frame"
                          sandbox=""
                          aria-hidden="true"
                          className="ap-sbx-frame"
                        />
                      </div>
                    </div>
                    <div className="gpc-act">
                      <Btn
                        label="Reload sandbox"
                        sm
                        icon="refresh"
                        does="Restarts the preview in a fresh sandbox; nothing from the last run is kept"
                        feature="F493"
                        onClick={() => setSandboxKey((k) => k + 1)}
                      />
                      <Btn
                        label="Fixture data only"
                        sm
                        does="Shows which fixture file feeds the preview; no live data and no project secrets"
                        feature="F493"
                        onClick={() => setViewMode('untrusted')}
                      />
                    </div>
                  </>
                )}
              </div>

              <aside className="gpc-side" aria-label="Sandbox policy">
                <h4>Sandbox policy</h4>
                <div className="gpc-pol" data-feature="F494" style={{ paddingTop: '2px' }}>
                  {GAPC_POLICY.map(([title, desc]) => (
                    <div key={title}>
                      <Icon name="check" size={14} />
                      <span>
                        <b>{title}</b>
                        <small>{desc}</small>
                      </span>
                    </div>
                  ))}
                </div>
                <h4>Blocked in this run · {GAPC_BLOCKED.length}</h4>
                <div className="gpc-bl">
                  {GAPC_BLOCKED.map(([t, k, v, r], idx) => (
                    <div key={idx}>
                      <span>{t}</span>
                      <span>{k}</span>
                      <span>{v}</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      {approveOpen ? (
        <>
          <div className="gpc-dim" style={{ position: 'fixed' }} onClick={() => setApproveOpen(false)} />
          <div
            className="gpc-dlg"
            data-feature="F496"
            role="dialog"
            aria-label="Setujui kanvas"
            style={{ position: 'fixed', left: '470px', top: '230px', width: '540px' }}
          >
            <h3>Setujui kanvas for Inc. 2</h3>
            <p>This creates Proposal 0010. Nothing unlocks until you accept it on S08.</p>
            <div className="gpc-ul">
              <li>
                <Icon name="unlock" size={14} />
                <span>Unlocks frontend tickets T-05, T-06, T-08</span>
                <Pill tone="ok" label="On accept" />
              </li>
              <li>
                <Icon name="doc" size={14} />
                <span>Logs decision D-21 with the 4 frame revisions</span>
                <Pill tone="ok" label="On accept" />
              </li>
              <li>
                <Icon name="share" size={14} />
                <span>Enables Kirim ke yravgbuilder</span>
                <Pill tone="ok" label="On accept" />
              </li>
              <li>
                <Icon name="alert" size={14} />
                <span>{noCompTotal} UI parts have no component yet</span>
                <Pill tone="warn" label="Tickets need one" />
              </li>
            </div>
            <div className="ft">
              <Btn
                label="Cancel"
                cls="plain"
                does="Closes the dialog; the canvas stays unapproved and tickets stay locked"
                feature="F496"
                onClick={() => setApproveOpen(false)}
              />
              <Btn
                label="Create approval proposal"
                cls="ink"
                does="Creates Proposal 0010 for review on S08; no ticket unlocks until it is accepted"
                feature="F496"
                onClick={() => {
                  setApproveOpen(false);
                  setApproved(true);
                }}
              />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
