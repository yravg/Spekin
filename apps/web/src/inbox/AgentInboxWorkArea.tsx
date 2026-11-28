import { useEffect, useState, type ReactNode } from 'react';
import { sampleData, type SampleAgentRun } from '../data/source';
import { useWorkspace } from '../state/workspace';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs } from '../shell/ArtifactTabs';
import { Btn, IconBtn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

const { GAPD_RUNS, GAPD_STEPS, GAPD_CTX, MODEL } = sampleData;

export type InboxFilter = 'all' | 'need' | 'running' | 'done';
export type InboxMoment = 'cap' | 'empty';

export interface AgentInboxShellOverride {
  busy?: string;
}

export function defaultInboxBusy(moment?: InboxMoment, filter: InboxFilter = 'all'): string | undefined {
  if (moment === 'empty' || filter === 'done') return undefined;
  if (moment === 'cap') return '0 running · 2 waiting';
  return '2 running · 2 waiting';
}

const DEFAULT_STEER_NOTE =
  'Use 2 consecutive periods, not 2 of the last 3. Keep the acknowledge action out of this ticket.';

function runById(id: string): SampleAgentRun {
  const found = GAPD_RUNS.find((r) => r.id === id);
  if (found) return found;
  throw new Error('Unknown sample run: ' + id);
}

function RunCard(props: {
  run: SampleAgentRun;
  open?: boolean;
  capped?: boolean;
  stepText?: string;
  inline?: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  onSelect?: () => void;
}) {
  const { run, open, capped, stepText, inline, body, actions, onSelect } = props;
  const need = run.st === 'wait';
  const failed = run.st === 'fail';
  const running = run.st === 'run';
  const pillTone = need ? 'warn' : failed ? 'bad' : running ? 'acc' : 'ok';
  const pillLabel = need ? (capped ? 'Paused' : 'Needs you') : failed ? 'Failed' : running ? 'Running' : 'Done';
  const cls = 'gpd-run' + (open ? ' open' : '') + (need ? ' need' : '') + (failed ? ' failed' : '');

  return (
    <div
      className={cls}
      data-run={run.id}
      onClick={onSelect}
    >
      <div className="gpd-rt">
        <span className="gpd-ri">
          <Icon name={run.icon} size={15} />
        </span>
        <span>
          <span className="k">
            {run.type} · {run.id}
          </span>
          <span className="n">{run.title}</span>
        </span>
        <Pill tone={pillTone} label={pillLabel} />
      </div>
      <div className="gpd-rs">
        {running ? <span className="pulse" aria-hidden="true" /> : null}
        <span>{capped ? 'Waiting: credit cap reached' : (stepText ?? run.step)}</span>
        <span className="c">{run.cost}</span>
        {inline}
      </div>
      {body}
      {actions ? <div className="gpd-actions">{actions}</div> : null}
    </div>
  );
}

// S20 Agent inbox (IMP-65). Board: docs/design/spekin-canvas/project/S20-agent-inbox.dc.html (F511-F519).
export function AgentInboxWorkArea(props: {
  initialFilter?: InboxFilter;
  initialOpenRun?: string;
  moment?: InboxMoment;
  onClose: () => void;
  onSelectRun?: (runId: string | null) => void;
  onOpenUsage?: () => void;
  onOpenReview?: () => void;
  onOpenHandoff?: () => void;
  onShellOverride?: (o: AgentInboxShellOverride) => void;
}) {
  const {
    moment,
    onClose,
    onSelectRun,
    onOpenUsage,
    onOpenReview,
    onOpenHandoff,
    onShellOverride,
  } = props;

  const startFilter: InboxFilter =
    moment
      ? 'all'
      : props.initialFilter
        ? props.initialFilter
        : props.initialOpenRun === 'RUN-0420'
          ? 'running'
          : props.initialOpenRun === 'RUN-0417'
            ? 'need'
            : props.initialOpenRun === 'RUN-0418'
              ? 'done'
              : 'all';
  const startOpenRun: string | null =
    moment
      ? null
      : props.initialOpenRun ?? (startFilter === 'done' ? 'RUN-0418' : null);

  const [filter, setFilter] = useState<InboxFilter>(startFilter);
  const [openRun, setOpenRun] = useState<string | null>(startOpenRun);
  const [steerNote, setSteerNote] = useState(DEFAULT_STEER_NOTE);
  const [docked, setDocked] = useState(true);
  const [ctxItems, setCtxItems] = useState(GAPD_CTX);
  const [activeTab, setActiveTab] = useState('Spec r14 · R-DASH-019');

  const view = useWorkspace((s) => s.view('spec'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  useEffect(() => {
    onShellOverride?.({ busy: defaultInboxBusy(moment, filter) });
  }, [moment, filter, onShellOverride]);

  const selectFilter = (next: InboxFilter) => {
    setFilter(next);
    onShellOverride?.({ busy: defaultInboxBusy(moment, next) });
    if (next === 'done') {
      setOpenRun('RUN-0418');
      onSelectRun?.('RUN-0418');
    } else {
      setOpenRun(null);
      onSelectRun?.(null);
    }
  };

  const openSteer = (runId: string) => {
    setFilter('running');
    setOpenRun(runId);
    onSelectRun?.(runId);
  };

  const openApprove = (runId: string) => {
    setFilter('need');
    setOpenRun(runId);
    onSelectRun?.(runId);
  };

  // Board chat messages mirror each of the 6 states.
  const chatCopy: { user: string; ai: string } =
    moment === 'empty'
      ? {
          user: 'What is running?',
          ai: 'Nothing is running. Runs from the interview, reference capture and review will list here.',
        }
      : moment === 'cap'
        ? {
            user: 'Start the ticket breakdown.',
            ai: 'The credit cap is reached, so no run can start. Approvals stay open until the cap is raised.',
          }
        : filter === 'running' && openRun
          ? {
              user: 'Make the alert rule stricter.',
              ai: 'I can steer the running expansion without stopping it. Add a note in the inbox.',
            }
          : filter === 'need' && openRun
            ? {
                user: 'Break Inc. 2 into tickets.',
                ai: 'This run needs your approval first because it can write 12 or more proposals. It reserves its maximum before it starts.',
              }
            : filter === 'done'
              ? {
                  user: 'Is the review done?',
                  ai: 'The independent review finished. One run failed at intake and can be retried.',
                }
              : {
                  user: 'Expand R-DASH-019 and break Inc. 2 into tickets.',
                  ai: 'Started 2 background runs. They keep going while you work; both are listed in the inbox with their steps.',
                };

  const liveDoc = moment !== 'cap' && moment !== 'empty';
  const counts: [number, number, number, number] =
    moment === 'empty' ? [0, 0, 0, 0] : moment === 'cap' ? [3, 2, 0, 1] : [6, 2, 2, 2];

  const filterDefs: [InboxFilter, string, number][] = [
    ['all', 'All', counts[0]],
    ['need', 'Needs you', counts[1]],
    ['running', 'Running', counts[2]],
    ['done', 'Finished', counts[3]],
  ];

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Specification chat"
          sub="R-DASH-019"
          ctxItems={ctxItems}
          ctxFoot="≈ 3.2k tokens · secrets by name only"
          placeholder="Ask about R-DASH-019, or @ a run…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('spec', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setCtxItems((prev) => prev.filter(([, n]) => n !== name))}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setView('spec', { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => (onOpenUsage ? onOpenUsage() : recordIntent('F107:model'))}
          onSend={() => recordIntent('F114:send')}
        >
          <div className="sp-ub">{chatCopy.user}</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 41 s · 14 cr</em>
            </div>
            <p>{chatCopy.ai}</p>
          </div>
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={[
            { icon: 'doc', name: 'Spec r14 · R-DASH-019' },
            { icon: 'req', name: 'Requirements' },
          ]}
          activeTab={activeTab}
          onSelect={setActiveTab}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={
            <Btn
              label="Hand off"
              cls="ink"
              icon="download"
              does="Opens S34 hand-off for accepted revisions only"
              feature="F104"
              onClick={() => (onOpenHandoff ? onOpenHandoff() : recordIntent('F104:handoff'))}
            />
          }
        />

        <div className="sp-work">
          <div className="gpd-pane">
            <div className="gpd-head">
              <div className="t">
                <h2>R-DASH-019 · Alert after 2 periods over 3%</h2>
                <p>Proposal from chat · not in the accepted spec</p>
              </div>
              <Pill tone="acc" label="Proposal" />
            </div>
            <div className="gpd-doc-prev">
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.55, maxWidth: '560px' }}>
                Show an alert on a package when its forecast stays above budget by more than 3% for two periods in a row. Acknowledging the alert records who and when.
              </p>
              {liveDoc ? (
                <div className="gpd-card" data-feature="F512">
                  <h3>
                    <Icon name="doc" size={15} />
                    Depth expansion · RUN-0420<span>live</span>
                  </h3>
                  <p>
                    Drafting acceptance criteria. The result arrives here as a proposal; the spec is unchanged until you accept it in review.
                  </p>
                  <div className="gpd-skel" style={{ width: '92%' }} />
                  <div className="gpd-skel" style={{ width: '78%' }} />
                  <div className="gpd-skel" style={{ width: '60%' }} />
                </div>
              ) : (
                <div className="gpd-card">
                  <h3>
                    <Icon name="doc" size={15} />
                    No run is working on this requirement<span>idle</span>
                  </h3>
                  <p>
                    Start a depth expansion from the chat. It will show here while it runs, and in the inbox.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="gpd-inbox" aria-label="Agent inbox" data-feature="F511" data-docked={docked ? 'true' : 'false'}>
            <div className="gpd-ibh">
              <b>Agent inbox</b>
              <Pill tone="mute" label="Project: Meranti Yard" />
              <span className="sp-fill" />
              <IconBtn
                icon="panel"
                label="Dock inbox"
                does="Docks or undocks the inbox; it always sits beside the work, never over it"
                sm
                feature="F511"
                onClick={() => {
                  setDocked((d) => !d);
                  recordIntent('F511:dock');
                }}
              />
              <IconBtn
                icon="x"
                label="Close inbox"
                does="Closes the inbox; runs keep going and the top-bar chip keeps counting"
                sm
                feature="F511"
                onClick={onClose}
              />
            </div>

            {moment === 'cap' ? (
              <div className="sp-banner bad" role="alert" data-feature="F519" style={{ borderBottom: '1px solid var(--line)' }}>
                <Icon name="alert" size={16} />
                <p>
                  <b>Credit cap reached.</b> No run can start. Running jobs finished first.
                </p>
              </div>
            ) : null}

            <div className="gpd-ibf" role="group" aria-label="Filter runs" data-feature="F517">
              {filterDefs.map(([id, label, count]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={filter === id ? 'true' : 'false'}
                  data-does={'Shows ' + label.toLowerCase() + ' runs only; the order inside a group is newest first'}
                  data-feature="F517"
                  onClick={() => selectFilter(id)}
                >
                  {label} {count}
                </button>
              ))}
            </div>

            <div className="gpd-ibl">
              {moment === 'empty' ? (
                <div className="gpd-empty" data-feature="F519" style={{ flex: 'none', height: '300px' }}>
                  <Icon name="inbox" size={24} />
                  <b>No runs yet</b>
                  <span>These background runs will appear here, each with steps, cost and a stop button:</span>
                  <span style={{ fontSize: '12px', lineHeight: 1.7 }}>
                    Interview turn · Depth expansion · Reference capture
                    <br />
                    Ticket breakdown · Verification intake · Independent review
                  </span>
                </div>
              ) : moment === 'cap' ? (
                <>
                  <div className="gpd-grp">
                    <span>Needs you</span>
                    <span>2</span>
                  </div>
                  <RunCard
                    run={runById('RUN-0419')}
                    capped
                    actions={
                      <>
                        <button
                          type="button"
                          className="sp-btn ghost sm"
                          disabled
                          data-does="Disabled until credits are available; the run keeps its place"
                          data-feature="F519"
                        >
                          Approve
                        </button>
                        <Btn
                          label="Decline"
                          sm
                          does="Declines the run; nothing is spent"
                          feature="F515"
                          onClick={() => recordIntent('F515:decline:RUN-0419')}
                        />
                      </>
                    }
                  />
                  <RunCard
                    run={runById('RUN-0417')}
                    capped
                    actions={
                      <Btn
                        label="Raise cap in usage"
                        sm
                        cls="ink"
                        does="Opens S36 usage to raise or top up the cap"
                        feature="F519"
                        onClick={() => (onOpenUsage ? onOpenUsage() : recordIntent('F519:usage'))}
                      />
                    }
                  />
                  <div className="gpd-grp">
                    <span>Finished</span>
                    <span>1</span>
                  </div>
                  <RunCard
                    run={runById('RUN-0418')}
                    actions={
                      <Btn
                        label="Open report"
                        sm
                        does="Opens the report in S18"
                        feature="F518"
                        onClick={() => recordIntent('F518:report:RUN-0418')}
                      />
                    }
                  />
                </>
              ) : filter === 'running' ? (
                <>
                  <div className="gpd-grp">
                    <span>Running</span>
                    <span>2</span>
                  </div>
                  {openRun === 'RUN-0420' ? (
                    <>
                      <RunCard
                        run={runById('RUN-0420')}
                        open
                        body={
                          <>
                            <div className="gpd-steps">
                              {GAPD_STEPS.map(([tone, text]) => (
                                <div key={text} className={'gpd-st' + (tone === 'mute' ? ' mute' : '')}>
                                  <span className={'d ' + tone} />
                                  {text}
                                </div>
                              ))}
                            </div>
                            <div className="gpd-steer" data-feature="F514">
                              <div className="ta ap-ta-wrap">
                                <span className="ap-ta-ph">{steerNote}</span>
                                <textarea
                                  className="ap-ta-input"
                                  aria-label="Steering note for RUN-0420"
                                  value={steerNote}
                                  onChange={(e) => setSteerNote(e.target.value)}
                                />
                              </div>
                              <div className="q">
                                <Icon name="history" size={13} />
                                Queued · applied at step 4, the run does not restart
                              </div>
                            </div>
                          </>
                        }
                        actions={
                          <>
                            <Btn
                              label="Send note"
                              sm
                              cls="ink"
                              does="Adds the note to the run; it is recorded in the run log and applied at the next step"
                              feature="F514"
                              onClick={() => recordIntent('F514:send:RUN-0420')}
                            />
                            <Btn
                              label="Stop"
                              sm
                              icon="stop"
                              does="Stops the run at its next step; charges settle to what was used"
                              feature="F516"
                              onClick={() => recordIntent('F516:stop:RUN-0420')}
                            />
                            <IconBtn
                              icon="list"
                              label="Show full log"
                              does="Opens every tool call, file and check of this run, live"
                              sm
                              feature="F513"
                              onClick={() => recordIntent('F513:log:RUN-0420')}
                            />
                          </>
                        }
                      />
                      <RunCard run={runById('RUN-0421')} />
                    </>
                  ) : (
                    <>
                      <RunCard
                        run={runById('RUN-0421')}
                        inline={
                          <>
                            <IconBtn
                              icon="comment"
                              label="Steer this run"
                              does="Opens a note box for this run; the note applies at its next step"
                              sm
                              feature="F514"
                              onClick={() => openSteer('RUN-0421')}
                            />
                            <IconBtn
                              icon="stop"
                              label="Stop this run"
                              does="Stops the run at its next step; charges settle to what was used"
                              sm
                              feature="F516"
                              onClick={() => recordIntent('F516:stop:RUN-0421')}
                            />
                          </>
                        }
                      />
                      <RunCard
                        run={runById('RUN-0420')}
                        inline={
                          <>
                            <IconBtn
                              icon="comment"
                              label="Steer this run"
                              does="Opens a note box for this run; the note applies at its next step"
                              sm
                              feature="F514"
                              onClick={() => openSteer('RUN-0420')}
                            />
                            <IconBtn
                              icon="stop"
                              label="Stop this run"
                              does="Stops the run at its next step; charges settle to what was used"
                              sm
                              feature="F516"
                              onClick={() => recordIntent('F516:stop:RUN-0420')}
                            />
                          </>
                        }
                      />
                    </>
                  )}
                </>
              ) : filter === 'need' ? (
                <>
                  <div className="gpd-grp">
                    <span>Needs you</span>
                    <span>2</span>
                  </div>
                  {openRun === 'RUN-0417' ? (
                    <>
                      <RunCard
                        run={runById('RUN-0417')}
                        open
                        body={
                          <div className="gpd-steps" data-feature="F515">
                            <dl className="gpd-kvs" style={{ margin: '2px 0' }}>
                              <dt>Reads</dt>
                              <dd>Spec r14 · 24 requirements · DESIGN.md r3</dd>
                              <dt>Writes</dt>
                              <dd>Ticket proposals only, none accepted</dd>
                              <dt>Reserves</dt>
                              <dd>26 cr maximum (estimate 14 to 22)</dd>
                              <dt>Model</dt>
                              <dd>Sonnet 5.5 · Hosted</dd>
                            </dl>
                          </div>
                        }
                        actions={
                          <>
                            <Btn
                              label="Approve and run"
                              sm
                              cls="ink"
                              does="Reserves 26 credits and starts the run; unused credits are released at the end"
                              feature="F515"
                              onClick={() => recordIntent('F515:approve:RUN-0417')}
                            />
                            <Btn
                              label="Change model"
                              sm
                              does="Opens the model picker for this run before it starts"
                              feature="F515"
                              onClick={() => (onOpenUsage ? onOpenUsage() : recordIntent('F515:model:RUN-0417'))}
                            />
                            <Btn
                              label="Decline"
                              sm
                              does="Declines the run; nothing is reserved or spent"
                              feature="F515"
                              onClick={() => recordIntent('F515:decline:RUN-0417')}
                            />
                          </>
                        }
                      />
                      <RunCard
                        run={runById('RUN-0419')}
                        actions={
                          <>
                            <Btn
                              label="Approve"
                              sm
                              cls="ink"
                              does="Approves RUN-0419 with its reserved maximum of 18 credits"
                              feature="F515"
                              onClick={() => recordIntent('F515:approve:RUN-0419')}
                            />
                            <Btn
                              label="Decline"
                              sm
                              does="Declines the run; nothing is spent"
                              feature="F515"
                              onClick={() => recordIntent('F515:decline:RUN-0419')}
                            />
                          </>
                        }
                      />
                    </>
                  ) : (
                    <>
                      <RunCard
                        run={runById('RUN-0419')}
                        onSelect={() => openApprove('RUN-0419')}
                        actions={
                          <>
                            <Btn
                              label="Approve"
                              sm
                              cls="ink"
                              does="Approves RUN-0419 with its reserved maximum of 18 credits"
                              feature="F515"
                              onClick={() => recordIntent('F515:approve:RUN-0419')}
                            />
                            <Btn
                              label="Decline"
                              sm
                              does="Declines the run; nothing is spent"
                              feature="F515"
                              onClick={() => recordIntent('F515:decline:RUN-0419')}
                            />
                          </>
                        }
                      />
                      <RunCard
                        run={runById('RUN-0417')}
                        onSelect={() => openApprove('RUN-0417')}
                        actions={
                          <>
                            <Btn
                              label="Approve"
                              sm
                              cls="ink"
                              does="Approves RUN-0417 with its reserved maximum of 26 credits"
                              feature="F515"
                              onClick={() => recordIntent('F515:approve:RUN-0417')}
                            />
                            <Btn
                              label="Decline"
                              sm
                              does="Declines the run; nothing is spent"
                              feature="F515"
                              onClick={() => recordIntent('F515:decline:RUN-0417')}
                            />
                          </>
                        }
                      />
                    </>
                  )}
                </>
              ) : filter === 'done' ? (
                <>
                  <div className="gpd-grp">
                    <span>Finished</span>
                    <span>2</span>
                  </div>
                  <RunCard
                    run={runById('RUN-0418')}
                    open
                    body={
                      <div className="gpd-steps" data-feature="F518">
                        <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                          <b>Result:</b> spec coverage 2 met, 1 unmet, 1 untested, 1 evidence missing. Standards 2 passed, 1 failed. 3 tickets proposed.
                        </div>
                      </div>
                    }
                    actions={
                      <>
                        <Btn
                          label="Open report"
                          sm
                          cls="ink"
                          does="Opens the full report in S18"
                          feature="F518"
                          onClick={() => recordIntent('F518:report:RUN-0418')}
                        />
                        <Btn
                          label="Open in review"
                          sm
                          does="Opens S08 with the 3 proposed tickets"
                          feature="F518"
                          onClick={() => (onOpenReview ? onOpenReview() : recordIntent('F518:review:RUN-0418'))}
                        />
                      </>
                    }
                  />
                  <RunCard
                    run={runById('RUN-0416')}
                    body={
                      <div className="gpd-steps">
                        <div className="gpd-st">
                          <span className="d" style={{ background: 'var(--danger)' }} />
                          results.xml could not be read: not valid XML
                        </div>
                      </div>
                    }
                    actions={
                      <>
                        <Btn
                          label="Retry"
                          sm
                          cls="ink"
                          does="Starts the run again; a paid retry reserves its maximum first"
                          feature="F516"
                          onClick={() => recordIntent('F516:retry:RUN-0416')}
                        />
                        <Btn
                          label="Open log"
                          sm
                          does="Opens the run log with the failing step"
                          feature="F513"
                          onClick={() => recordIntent('F513:log:RUN-0416')}
                        />
                      </>
                    }
                  />
                </>
              ) : (
                <>
                  <div className="gpd-grp">
                    <span>Needs you</span>
                    <span>2</span>
                  </div>
                  <RunCard
                    run={runById('RUN-0419')}
                    stepText="Awaiting approval"
                    onSelect={() => openApprove('RUN-0419')}
                    inline={
                      <>
                        <Btn
                          label="Approve"
                          sm
                          cls="ink"
                          does="Approves RUN-0419 with its reserved maximum of 18 credits"
                          feature="F515"
                          onClick={() => recordIntent('F515:approve:RUN-0419')}
                        />
                        <Btn
                          label="Decline"
                          sm
                          does="Declines the run; nothing is spent"
                          feature="F515"
                          onClick={() => recordIntent('F515:decline:RUN-0419')}
                        />
                      </>
                    }
                  />
                  <RunCard
                    run={runById('RUN-0417')}
                    stepText="Awaiting approval"
                    onSelect={() => openApprove('RUN-0417')}
                    inline={
                      <>
                        <Btn
                          label="Approve"
                          sm
                          cls="ink"
                          does="Approves RUN-0417 with its reserved maximum of 26 credits"
                          feature="F515"
                          onClick={() => recordIntent('F515:approve:RUN-0417')}
                        />
                        <Btn
                          label="Decline"
                          sm
                          does="Declines the run; nothing is spent"
                          feature="F515"
                          onClick={() => recordIntent('F515:decline:RUN-0417')}
                        />
                      </>
                    }
                  />
                  <div className="gpd-grp">
                    <span>Running</span>
                    <span>2</span>
                  </div>
                  <RunCard
                    run={runById('RUN-0421')}
                    inline={
                      <>
                        <IconBtn
                          icon="comment"
                          label="Steer this run"
                          does="Opens a note box for this run; the note applies at its next step"
                          sm
                          feature="F514"
                          onClick={() => openSteer('RUN-0421')}
                        />
                        <IconBtn
                          icon="stop"
                          label="Stop this run"
                          does="Stops the run at its next step; charges settle to what was used"
                          sm
                          feature="F516"
                          onClick={() => recordIntent('F516:stop:RUN-0421')}
                        />
                      </>
                    }
                  />
                  <RunCard
                    run={runById('RUN-0420')}
                    inline={
                      <>
                        <IconBtn
                          icon="comment"
                          label="Steer this run"
                          does="Opens a note box for this run; the note applies at its next step"
                          sm
                          feature="F514"
                          onClick={() => openSteer('RUN-0420')}
                        />
                        <IconBtn
                          icon="stop"
                          label="Stop this run"
                          does="Stops the run at its next step; charges settle to what was used"
                          sm
                          feature="F516"
                          onClick={() => recordIntent('F516:stop:RUN-0420')}
                        />
                      </>
                    }
                  />
                  <div className="gpd-grp">
                    <span>Finished</span>
                    <span>2</span>
                  </div>
                  <RunCard
                    run={runById('RUN-0418')}
                    inline={
                      <IconBtn
                        icon="eye"
                        label="Open report"
                        does="Opens the report in S18"
                        sm
                        feature="F518"
                        onClick={() => recordIntent('F518:report:RUN-0418')}
                      />
                    }
                  />
                  <RunCard
                    run={runById('RUN-0416')}
                    inline={
                      <IconBtn
                        icon="redo"
                        label="Retry run"
                        does="Starts the run again; a paid retry reserves its maximum first"
                        sm
                        feature="F516"
                        onClick={() => recordIntent('F516:retry:RUN-0416')}
                      />
                    }
                  />
                </>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
