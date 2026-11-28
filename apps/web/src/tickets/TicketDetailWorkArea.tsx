import { useState } from 'react';
import {
  sampleData,
  type SampleGapcTicketDetail,
} from '../data/source';
import { useWorkspace } from '../state/workspace';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { Btn, IconBtn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

const { GAPC_CTX_S16, GAPC_T05, MODEL } = sampleData;

// S16 Ticket detail and criteria (F481-F489). Board: docs/design/spekin-canvas/project/S16-ticket-detail.dc.html.
// Five drawn states: detail, copied, pulled, nocomp (T-08), stale (DESIGN.md r4).
export type TicketDetailMode = 'detail' | 'copied' | 'pulled' | 'stale';

const DEFAULT_STAGES = ['Design', 'Frontend', 'Testing'];

const TICKET_T08: SampleGapcTicketDetail = {
  ...GAPC_T05,
  id: 'T-08',
  title: 'Drill down from package to cost lines',
  lane: 'Vertical slice',
  summary: 'A click on a package row opens its cost lines in place, with the same flag rules as the variance table.',
  comp: null,
  blockers: [
    ['T-05', 'Variance table flags', 'warn', 'Waits'],
    ['S21', 'Canvas approved', 'warn', 'Waiting'],
  ],
  owns: 'src/drill',
  criteria: [
    ...(GAPC_T05.criteria[3] ? [GAPC_T05.criteria[3]] : []),
    ['AC-DASH-015.2', 'A package with no cost lines shows an empty row, not an error.', 'R-DASH-015', ['mute', 'Not started']],
  ],
  stagesL: ['Design', 'Frontend'],
};

export function resolveTicketDetail(ticketId: string): SampleGapcTicketDetail {
  return ticketId === 'T-08' ? TICKET_T08 : GAPC_T05;
}

// One assembly function for both Copy prompt (F484) and Agent pull (F486), so copied and pulled text never diverge.
export function assembleTicketPrompt(ticket: SampleGapcTicketDetail, rev = ticket.designRev): string {
  const lines: string[] = [
    'Task',
    `${ticket.id} · ${ticket.title}`,
    'Spec r14 · R-DASH-014, R-DASH-015',
    'Component',
  ];
  if (ticket.comp) {
    lines.push(`slug: ${ticket.comp.slug}`);
    lines.push(`install: ${ticket.comp.install}`);
    lines.push(`DESIGN.md ${rev} rules`);
    ticket.rules.forEach((rule, i) => lines.push(`${i + 1} ${rule}`));
  } else {
    lines.push('missing: pick one slug or GAP id');
    lines.push('DESIGN.md rules');
    lines.push('not added: no component');
  }
  lines.push('Criteria');
  for (const [acId, text] of ticket.criteria) {
    lines.push(`${acId} ${text}`);
  }
  lines.push('Scope');
  lines.push(`own: ${ticket.owns}`);
  lines.push('no resets, merges or deploys');
  return lines.join('\n');
}

const S16_TABS: ArtifactTabItem[] = [
  { icon: 'doc', name: 'T-05 Variance table flags' },
  { icon: 'list', name: 'Ticket board' },
  { icon: 'doc', name: 'DESIGN.md r3' },
];

export function TicketDetailWorkArea(props: {
  ticketId: string;
  initialMode?: TicketDetailMode;
  onSelectTicket: (ticketId: string) => void;
  onBackToBoard: () => void;
  onIntent: (intent: string) => void;
}) {
  const { ticketId, initialMode = 'detail', onSelectTicket, onBackToBoard, onIntent } = props;
  const ticket = resolveTicketDetail(ticketId);
  const [mode, setMode] = useState<TicketDetailMode>(initialMode);

  const view = useWorkspace((s) => s.view('planning'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);

  const ctxItems = GAPC_CTX_S16.filter(([, name]) => !view.removedCtx.includes(name));
  const hasComp = ticket.comp !== null;
  const isCopied = hasComp && mode === 'copied';
  const isPulled = hasComp && mode === 'pulled';
  const isStale = hasComp && mode === 'stale';
  const stages = ticket.stagesL ?? DEFAULT_STAGES;

  const handleCopy = () => {
    if (!hasComp || isStale) return;
    const text = assembleTicketPrompt(ticket);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).catch(() => {});
    }
    setMode('copied');
    onIntent('F484:copy-prompt:' + ticket.id);
  };

  const handleAgentPull = () => {
    if (hasComp) setMode('pulled');
    onIntent('F486:agent-pull:' + ticket.id);
  };

  const handleRefresh = () => {
    if (!hasComp) {
      onIntent('F487:rebuild-prompt:' + ticket.id);
      return;
    }
    if (isStale) {
      setMode('detail');
      onIntent('F487:rebuild-prompt:' + ticket.id);
      return;
    }
    setMode('stale');
    onIntent('F487:design-changed:' + ticket.id);
  };

  const handleRebuild = () => {
    setMode('detail');
    onIntent('F487:rebuild-prompt:' + ticket.id);
  };

  const incRows: [string, string][] = [
    ['Component slug', ticket.comp ? ticket.comp.slug : 'missing'],
    ['Install line', ticket.comp ? 'npx yravg-ui add …' : 'missing'],
    ['DESIGN.md rules (r3)', ticket.comp ? '3 rules' : 'missing'],
    ['Linked criteria', String(ticket.criteria.length)],
  ];

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Ticket chat"
          sub="T-05"
          ctxItems={ctxItems}
          ctxFoot="≈ 2.8k tokens · secrets by name only"
          placeholder="Ask about this ticket…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => onIntent('F114:history')}
          onNewChat={() => setView('planning', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setView('planning', { removedCtx: [...view.removedCtx, name] })}
          onAddCtx={() => onIntent('F106:add')}
          onDraftChange={(draft) => setView('planning', { draft })}
          onAttach={() => onIntent('F114:attach')}
          onMention={() => onIntent('F106:mention')}
          onOpenModel={() => onIntent('F107:model')}
          onSend={() => onIntent('F114:send')}
        >
          <div className="sp-ub">Make sure the prompt for T-05 carries the component and DESIGN.md.</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 12 s · 6 cr</em>
            </div>
            <p>
              The prompt names <code>blocks/data-table</code>, its install line and 3 DESIGN.md r3 rules. Criteria AC-DASH-014.3 still has no test.
            </p>
          </div>
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={S16_TABS}
          activeTab="T-05 Variance table flags"
          onSelect={(name) => {
            if (name === 'Ticket board') onBackToBoard();
            else if (name === 'T-05 Variance table flags') onSelectTicket('T-05');
            else onIntent('F104:tab:' + name);
          }}
          onClose={(name) => onIntent('F104:close:' + name)}
          onOpenArtifact={() => onIntent('F104:open')}
          openItems={[
            { icon: 'doc', name: 'T-05 Variance table flags', onSelect: () => onSelectTicket('T-05') },
            { icon: 'doc', name: 'T-08 Drill down to cost lines', onSelect: () => onSelectTicket('T-08') },
          ]}
          right={null}
        />

        {isStale ? (
          <div className="sp-banner warn" role="status" data-feature="F487">
            <Icon name="alert" size={16} />
            <p>
              <b>DESIGN.md changed.</b> r4 was accepted at 12:49; rule 3 now says row height 40 px. This prompt still carries r3.
            </p>
            <Btn
              label="Show the change"
              sm
              does="Opens S14 DESIGN.md with the r3 to r4 diff"
              feature="F487"
              onClick={() => onIntent('F487:show-change')}
            />
            <Btn
              label="Rebuild prompt"
              sm
              cls="ink"
              does="Rebuilds the prompt from DESIGN.md r4; the r3 prompt is kept in the ticket history"
              feature="F487"
              onClick={handleRebuild}
            />
          </div>
        ) : null}

        <div className="gpc-bar">
          <Btn
            label="All tickets"
            sm
            cls="plain"
            icon="chevR"
            does="Returns to S15 Ticket board"
            feature="F481"
            onClick={onBackToBoard}
          />
          <span className="gpc-sub">Tickets / {ticket.id}</span>
          <span className="gpc-fill" />
          <Btn
            label="Mark ready for agent"
            sm
            does="Marks the ticket ready; an agent still cannot start while a blocker or the canvas lock holds"
            feature="F481"
            onClick={() => onIntent('F481:mark-ready:' + ticket.id)}
          />
          <IconBtn
            icon="history"
            label="Ticket revisions"
            sm
            does="Opens the revision list of this ticket"
            feature="F481"
            onClick={() => onIntent('F481:revisions:' + ticket.id)}
          />
        </div>

        <div className="gpc-body">
          <div className="gpc-t16">
            <div className="gpc-doc">
              <div className="gpc-meta">
                <Pill tone="mute" label={ticket.lane} />
                <Pill
                  tone={isPulled ? 'ok' : 'bad'}
                  label={isPulled ? 'Unlocked · canvas approved' : 'Locked · canvas not approved'}
                />
                <span>Spec r14 · ticket {ticket.rev}</span>
                <span>Stages:</span>
                {stages.map((s, i) => (
                  <span key={s} className={'gpc-stg' + (i === 0 ? ' cur' : '')}>
                    {s}
                  </span>
                ))}
              </div>

              <h2>
                {ticket.id} · {ticket.title}
              </h2>
              <p>{ticket.summary}</p>

              <h3>Blockers and owned files</h3>
              <div className="gpc-blk">
                {ticket.blockers.map(([id, name, tone, label]) => (
                  <span key={id}>
                    <code>{id}</code>
                    {name}
                    <Pill tone={tone} label={isPulled && id === 'S21' ? 'Approved' : label} />
                  </span>
                ))}
                <span>
                  <code>owns</code>
                  {ticket.owns}
                </span>
              </div>

              <h3>Primary component</h3>
              {ticket.comp ? (
                <div className="gpc-cc" data-feature="F483">
                  <span className="th">
                    <Icon name="grid" size={18} />
                  </span>
                  <span className="tx">
                    <code>{ticket.comp.slug}</code>
                    <small>
                      Install: {ticket.comp.install} · v{ticket.comp.ver}
                    </small>
                  </span>
                  <span className="gpc-fill" />
                  <Btn
                    label="Change"
                    sm
                    does="Opens the component picker; one component only, picking another replaces this one"
                    feature="F483"
                    onClick={() => onIntent('F483:change-component:' + ticket.id)}
                  />
                </div>
              ) : (
                <div className="gpc-cc bad" data-feature="F488">
                  <span className="th">
                    <Icon name="alert" size={18} />
                  </span>
                  <span className="tx">
                    <b>UI tanpa komponen</b>
                    <small>A UI ticket needs exactly one yravg UI slug or GAP id.</small>
                  </span>
                  <span className="gpc-fill" />
                  <Btn
                    label="Pick component"
                    sm
                    cls="ink"
                    does="Opens the component picker for this ticket"
                    feature="F488"
                    onClick={() => onIntent('F488:pick-component:' + ticket.id)}
                  />
                </div>
              )}

              <h3>
                Acceptance criteria
                <span className="pill mute">{ticket.criteria.length} linked</span>
                <span className="gpc-fill" />
                <Btn
                  label="Evidence in S18"
                  sm
                  does="Opens S18 evidence for this ticket’s criteria; this ticket never marks a requirement verified"
                  feature="F489"
                  onClick={() => onIntent('F489:evidence:' + ticket.id)}
                />
              </h3>
              <div className="gpc-acs" data-feature="F482" style={{ position: 'relative' }}>
                {ticket.criteria.map(([acId, text, reqId, statusPill]) => (
                  <div key={acId} className="gpc-ac">
                    <code>{acId}</code>
                    <span>
                      {text}
                      <small>{reqId}</small>
                    </span>
                    <Pill tone={statusPill[0]} label={statusPill[1]} />
                  </div>
                ))}
              </div>
            </div>

            <aside className="gpc-rt" aria-label="Ticket prompt">
              <div className="gpc-h">
                <Icon name="spark" size={15} />
                <b>Ticket prompt</b>
                <Pill
                  tone={isStale ? 'warn' : hasComp ? 'ok' : 'bad'}
                  label={isStale ? 'Stale · DESIGN.md r4' : hasComp ? 'Fresh · r2' : 'Incomplete'}
                />
                <span className="gpc-fill" />
                <IconBtn
                  icon="refresh"
                  label="Rebuild prompt"
                  sm
                  does="Rebuilds the prompt from the ticket, component and DESIGN.md as they are now"
                  feature="F487"
                  onClick={handleRefresh}
                />
              </div>

              <div className="gpc-c">
                <div data-feature="F485" style={{ position: 'relative' }}>
                  <div className={'gpc-pr' + (hasComp ? '' : ' off')}>
                    <span className="sec">Task</span>
                    <span>
                      {ticket.id} · {ticket.title}
                    </span>
                    <span>Spec r14 · R-DASH-014, R-DASH-015</span>

                    <span className="sec">Component</span>
                    {ticket.comp ? (
                      <>
                        <span className={isCopied ? 'mark' : undefined}>slug: {ticket.comp.slug}</span>
                        <span className={isCopied ? 'mark' : undefined}>install: {ticket.comp.install}</span>
                      </>
                    ) : (
                      <span>
                        <i>missing: pick one slug or GAP id</i>
                      </span>
                    )}

                    <span className="sec">{hasComp ? 'DESIGN.md r3 rules' : 'DESIGN.md rules'}</span>
                    {!hasComp ? (
                      <span>
                        <i>not added: no component</i>
                      </span>
                    ) : isStale ? (
                      <>
                        <span>1 Tokens only, no raw colours.</span>
                        <span>2 Flag: danger colour plus icon and %.</span>
                        <span>
                          3 Text 12 px or larger, <b>row 40 px</b>.
                        </span>
                      </>
                    ) : (
                      ticket.rules.map((rule, i) => (
                        <span key={rule} className={isCopied ? 'mark' : undefined}>
                          {i + 1} {rule}
                        </span>
                      ))
                    )}

                    <span className="sec">Criteria</span>
                    {ticket.criteria.map(([acId, text]) => (
                      <span key={acId}>
                        {acId} {text.slice(0, 48)}
                        {text.length > 48 ? '…' : ''}
                      </span>
                    ))}

                    <span className="sec">Scope</span>
                    <span>own: {ticket.owns}</span>
                    <span>no resets, merges or deploys</span>
                  </div>
                </div>

                <div className={'gpc-inc' + (hasComp ? '' : ' miss')} data-feature="F484" style={{ position: 'relative' }}>
                  {incRows.map(([label, value], i) => {
                    const missing = !hasComp && i < 3;
                    return (
                      <div key={label}>
                        <Icon name={missing ? 'x' : 'check'} size={14} />
                        <span>{label}</span>
                        <span>
                          <Pill tone={missing ? 'bad' : 'ok'} label={value} />
                        </span>
                      </div>
                    );
                  })}
                </div>

                {isPulled ? (
                  <div className="sp-gg" data-feature="F486" style={{ position: 'relative' }}>
                    <div className="gpc-q" style={{ borderLeftColor: 'var(--ok)' }}>
                      <div className="k">
                        <Icon name="download" size={12} />
                        Pulled by an agent
                      </div>
                      <div className="gpc-log">
                        <div>
                          <b>12:51</b>
                          <span>yravgbuilder pulled T-05 prompt r2</span>
                        </div>
                        <div>
                          <b>sha</b>
                          <span>a41c07e9 · same as Copy prompt</span>
                        </div>
                        <div>
                          <b>sent</b>
                          <span>slug, install line, 3 DESIGN.md r3 rules</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="gpc-act">
                  {!hasComp ? (
                    <button
                      type="button"
                      className="sp-btn ghost"
                      aria-disabled="true"
                      data-does="Disabled: the prompt has no component yet; pick one slug or GAP id first"
                      data-feature="F488"
                    >
                      <Icon name="doc" size={14} />
                      Copy prompt
                    </button>
                  ) : isStale ? (
                    <button
                      type="button"
                      className="sp-btn ghost"
                      aria-disabled="true"
                      data-does="Disabled until the prompt is rebuilt from DESIGN.md r4"
                      data-feature="F487"
                    >
                      <Icon name="doc" size={14} />
                      Copy prompt
                    </button>
                  ) : isCopied ? (
                    <Btn
                      label="Copied"
                      cls="ghost"
                      icon="check"
                      does="Copies the prompt again; the clipboard text is the same block"
                      feature="F484"
                      onClick={handleCopy}
                    />
                  ) : (
                    <Btn
                      label="Copy prompt"
                      cls="ink"
                      icon="doc"
                      does="Copies the whole prompt: component slug, install line and the DESIGN.md rules that apply, plus criteria and scope"
                      feature="F484"
                      onClick={handleCopy}
                    />
                  )}
                  <Btn
                    label="Agent pull link"
                    does="Shows the pull address an agent uses; it returns exactly this prompt, never a shorter one"
                    feature="F486"
                    onClick={handleAgentPull}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {isCopied ? (
        <div className="gpc-toast" role="status" data-feature="F484" style={{ left: '404px', top: '780px' }}>
          <Icon name="check" size={14} />
          Copied. Included: component slug, install line, 3 DESIGN.md r3 rules.
        </div>
      ) : null}
    </>
  );
}
