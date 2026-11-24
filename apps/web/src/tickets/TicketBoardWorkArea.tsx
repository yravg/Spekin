import { useEffect, useState } from 'react';
import {
  gapCSample,
  sampleData,
  type GapCComponentOption,
  type GapCLane,
  type GapCTicket,
  type PillTone,
} from '../data/source';
import { useWorkspace } from '../state/workspace';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs } from '../shell/ArtifactTabs';
import { Btn, IconBtn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

const { MODEL } = sampleData;

export type TicketBoardMode = 'ladder' | 'graph' | 'empty';

export type TicketPopover =
  | { kind: 'comp'; ticketId: string; draftComp: string }
  | { kind: 'stages'; ticketId: string; draftStages: string[] }
  | { kind: 'locked'; ticketId: string };

export interface TicketGraphConflict {
  file: string;
  tickets: string[];
}

export interface TicketGraphCheck {
  hasCycle: boolean;
  missingBlockers: string[];
  conflicts: TicketGraphConflict[];
}

const ALL_STAGE_LABELS = ['Design', 'Frontend', 'Testing', 'Backend', 'Integration', 'Deployment'];

// F472: Benchmark before is always first and benchmark after always last; moving either is refused (R-KEEP-2).
export function canReorderTicket(ticket: GapCTicket): boolean {
  return ticket.lane !== 'bench-before' && ticket.lane !== 'bench-after';
}

// F473: Count UI tickets that do not yet have a single primary component slug or GAP id.
export function countUiWithoutComponent(tickets: GapCTicket[]): number {
  return tickets.filter((t) => t.ui && !t.comp).length;
}

// F473: Replace the primary component of a UI ticket (never add a second one).
export function setPrimaryComponent(tickets: GapCTicket[], ticketId: string, slug: string): GapCTicket[] {
  return tickets.map((t) => (t.id === ticketId ? { ...t, comp: slug } : t));
}

// F474: Check graph for shared owned files, cycles, and missing blockers.
export function checkTicketGraph(tickets: GapCTicket[]): TicketGraphCheck {
  const byId = new Map(tickets.map((t) => [t.id, t]));
  const missingBlockers: string[] = [];
  for (const t of tickets) {
    for (const b of t.blockers) {
      if (!byId.has(b)) missingBlockers.push(b);
    }
  }
  const owners = new Map<string, string[]>();
  for (const t of tickets) {
    if (t.lane !== 'slice') continue;
    const list = owners.get(t.owns) ?? [];
    list.push(t.id);
    owners.set(t.owns, list);
  }
  const conflicts: TicketGraphConflict[] = [];
  for (const [file, ids] of owners) {
    if (ids.length > 1) conflicts.push({ file, tickets: ids });
  }
  const state = new Map<string, 0 | 1 | 2>();
  let hasCycle = false;
  const visit = (id: string) => {
    const s = state.get(id) ?? 0;
    if (s === 1) {
      hasCycle = true;
      return;
    }
    if (s === 2) return;
    state.set(id, 1);
    const t = byId.get(id);
    if (t) {
      for (const b of t.blockers) visit(b);
    }
    state.set(id, 2);
  };
  for (const t of tickets) visit(t.id);
  return { hasCycle, missingBlockers, conflicts };
}

function statusPill(t: GapCTicket, locked: boolean): [PillTone, string] {
  if (locked) return ['bad', 'Locked'];
  if (t.st === 'blocked') return ['warn', 'Waits on ' + t.blockers.length];
  return ['ok', 'Ready'];
}

function shortNodeTitle(title: string): string {
  const stripped = title.replace(/^Slice: |^Prefactor: |^Verification: /, '');
  return stripped.slice(0, 1).toUpperCase() + stripped.slice(1);
}

export function TicketChatMessages({ onReviewProposal }: { onReviewProposal: () => void }) {
  return (
    <>
      <div className="sp-ub">Order the tickets for Inc. 2 so cheap checks come first.</div>
      <div className="sp-ai">
        <div className="h">
          <span className="av">S</span>Spekin<em>Sonnet 5.5 · 24 s · 14 cr</em>
        </div>
        <p>
          I proposed 11 tickets. Benchmark before is first, benchmark after is last, and the four slices sit between
          verification and prose.
        </p>
        <div className="sp-gg" data-feature="F471">
          <div className="gh">
            <span>Ticket order</span>
          </div>
          <div className="sp-gc prop">
            <div className="k">
              <Icon name="layers" size={12} />
              Trust ladder
              <span className="tag">
                <Pill tone="acc" label="Proposal 0009" />
              </span>
            </div>
            <div className="bd">
              1 benchmark, 2 core, 3 gates, 4 verification, 5 slices, 6 prose, 7 review, 8 benchmark.
            </div>
            <div className="ft">
              <span className="s">Accepted on S08 only</span>
              <Btn
                label="Review"
                sm
                cls="ink"
                does="Opens S08 with the ticket proposal"
                feature="F478"
                onClick={onReviewProposal}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export interface TicketBoardBodyProps {
  mode: TicketBoardMode;
  lanes: GapCLane[];
  tickets: GapCTicket[];
  components: GapCComponentOption[];
  lockedIds: string[];
  selectedId: string | null;
  foldedLanes: Record<string, boolean>;
  popover: TicketPopover | null;
  filterMissingComp: boolean;
  filterLocked: boolean;
  reviewedSequence?: boolean;
  onSelectTicket: (id: string) => void;
  onToggleLane: (laneId: string) => void;
  onOpenCompPicker: (ticket: GapCTicket) => void;
  onPickComponent: (slug: string) => void;
  onSaveComponent: () => void;
  onOpenStageEditor: (ticket: GapCTicket) => void;
  onRemoveStage: (stage: string) => void;
  onAddStage: (stage: string) => void;
  onSaveStages: () => void;
  onHoverLocked: (ticketId: string) => void;
  onOpenCanvasStep: () => void;
  onUseReviewedSequence: () => void;
  onProposeTickets: () => void;
  onWriteByHand: () => void;
  onClosePopover: () => void;
}

export function TicketBoardBody(props: TicketBoardBodyProps) {
  const {
    mode,
    lanes,
    tickets,
    components,
    lockedIds,
    selectedId,
    foldedLanes,
    popover,
    filterMissingComp,
    filterLocked,
    reviewedSequence = false,
    onSelectTicket,
    onToggleLane,
    onOpenCompPicker,
    onPickComponent,
    onSaveComponent,
    onOpenStageEditor,
    onRemoveStage,
    onAddStage,
    onSaveStages,
    onHoverLocked,
    onOpenCanvasStep,
    onUseReviewedSequence,
    onProposeTickets,
    onWriteByHand,
    onClosePopover,
  } = props;

  if (mode === 'empty') {
    return (
      <div className="gpc-empty">
        <div className="c">
          <h3 data-feature="F479">No tickets for Inc. 2 yet</h3>
          <p>
            Spec r14 is accepted and the Detailed layer is done. Spekin can propose a ticket plan in trust-ladder
            order. You review it on S08; only an accepted proposal adds tickets here.
          </p>
          <div className="gpc-ghostrow">
            <div>
              <Icon name="layers" size={13} />1 Benchmark before · first
            </div>
            <div>
              <Icon name="layers" size={13} />2 to 7 Core, gates, verification, slices, prose, review
            </div>
            <div>
              <Icon name="layers" size={13} />8 Benchmark after · last
            </div>
          </div>
          <div className="gpc-act">
            <Btn
              label="Propose tickets"
              cls="ink"
              does="Starts the same increment Proposal as S07 with a ticket plan in trust-ladder order; nothing is added until you accept it on S08"
              feature="F479"
              onClick={onProposeTickets}
            />
            <Btn
              label="Write tickets by hand"
              does="Adds one empty ticket to a draft; the ladder order and the first and last benchmark rows are kept"
              feature="F479"
              onClick={onWriteByHand}
            />
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'graph') {
    const byId = Object.fromEntries(tickets.map((t) => [t.id, t])) as Record<string, GapCTicket>;
    const checks = checkTicketGraph(tickets);
    const renderNode = (id: string, x: number, y: number, cls: string, tone: PillTone, tag: string) => {
      const t = byId[id];
      if (!t) return null;
      return (
        <div className={'gpc-nd ' + cls} style={{ left: x, top: y }}>
          <div className="h">
            {id}
            <span className="gpc-fill" />
            <Pill tone={tone} label={tag} />
          </div>
          <b>{shortNodeTitle(t.title)}</b>
          <span className="o">{'owns ' + t.owns}</span>
        </div>
      );
    };
    return (
      <div className="gpc-graph">
        <svg className="gpc-edges" aria-hidden="true">
          <defs>
            <marker
              id="gpc-ar"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0 0L10 5L0 10z" fill="var(--ink-dim)" />
            </marker>
          </defs>
          <path d="M137 130 L137 164" fill="none" stroke="var(--ink-dim)" strokeWidth="1.5" markerEnd="url(#gpc-ar)" />
          <path d="M250 207 C275 207 275 87 300 87" fill="none" stroke="var(--ink-dim)" strokeWidth="1.5" markerEnd="url(#gpc-ar)" />
          <path d="M250 207 L300 207" fill="none" stroke="var(--ink-dim)" strokeWidth="1.5" markerEnd="url(#gpc-ar)" />
          <path d="M250 87 C275 87 275 327 300 327" fill="none" stroke="var(--ink-dim)" strokeWidth="1.5" markerEnd="url(#gpc-ar)" />
          <path d="M526 87 L576 87" fill="none" stroke="var(--ink-dim)" strokeWidth="1.5" markerEnd="url(#gpc-ar)" />
          <path d="M802 87 C827 87 827 207 852 207" fill="none" stroke="var(--ink-dim)" strokeWidth="1.5" markerEnd="url(#gpc-ar)" />
          <path d="M526 207 L852 207" fill="none" stroke="var(--ink-dim)" strokeWidth="1.5" markerEnd="url(#gpc-ar)" />
          <path d="M526 327 C700 327 800 207 852 207" fill="none" stroke="var(--ink-dim)" strokeWidth="1.5" markerEnd="url(#gpc-ar)" />
          <path d="M413 130 L413 164" stroke="var(--danger)" strokeWidth="2" strokeDasharray="4 3" fill="none" />
        </svg>
        <span className="gpc-gl" style={{ left: 24, top: 16 }}>Core</span>
        <span className="gpc-gl" style={{ left: 300, top: 16 }}>Slices</span>
        <span className="gpc-gl" style={{ left: 852, top: 136 }}>Review</span>
        {renderNode('T-02', 24, 44, 'ok', 'ok', 'Ready')}
        {renderNode('T-04', 24, 164, 'ok', 'ok', 'Parallel-eligible')}
        {renderNode('T-05', 300, 44, 'bad', 'bad', 'Conflict')}
        {renderNode('T-06', 300, 164, 'bad', 'bad', 'Conflict')}
        {renderNode('T-07', 300, 284, 'ok', 'ok', 'Parallel-eligible')}
        {renderNode('T-08', 576, 44, 'lock', 'warn', 'Blocked by T-05')}
        {renderNode('T-10', 852, 164, 'lock', 'warn', 'Waits on 4')}
        <div className="gpc-pop" data-feature="F474" style={{ left: 24, top: 410, width: 420 }}>
          <h5>Graph check</h5>
          <ul className="gpc-ul">
            <li>
              <Icon name="alert" size={14} />
              <span>
                T-05 and T-06 both own <code>{checks.conflicts[0]?.file ?? 'src/variance/state.ts'}</code>
              </span>
              <Pill tone="bad" label="Conflict" />
            </li>
            <li>
              <Icon name="check" size={14} />
              <span>{'No cycle in ' + tickets.length + ' tickets'}</span>
              <Pill tone={checks.hasCycle ? 'bad' : 'ok'} label={checks.hasCycle ? 'Cycle' : 'Pass'} />
            </li>
            <li>
              <Icon name="check" size={14} />
              <span>Every blocker names an existing ticket</span>
              <Pill tone={checks.missingBlockers.length ? 'bad' : 'ok'} label={checks.missingBlockers.length ? 'Missing' : 'Pass'} />
            </li>
          </ul>
        </div>
        <div className="gpc-pop" data-feature="F475" style={{ left: 470, top: 410, width: 572 }}>
          <h5>T-07 touches the alerts table: expand, migrate, contract</h5>
          <p>
            A wide migration is split so every step can be verified and rolled back on its own, or it names a reviewed
            integration sequence.
          </p>
          <div className="gpc-emc">
            <span className="s">
              <i>1</i>Expand: add <code>acknowledged_at</code>
            </span>
            <span className="s">
              <i>2</i>Migrate: backfill rows
            </span>
            <span className="s">
              <i>3</i>Contract: drop old flag
            </span>
          </div>
          <div className="gpc-emc">
            <Btn
              label={reviewedSequence ? 'Reviewed sequence queued for S08' : 'Use a reviewed sequence instead'}
              sm
              does="Replaces the three steps with one integration sequence that you review on S08"
              feature="F475"
              onClick={onUseReviewedSequence}
            />
            <Pill tone="mute" label="Parallel budget 2 · 2 of 2 slots ready" />
          </div>
        </div>
        <div className="gpc-leg" style={{ left: 576, top: 16 }}>
          <span>
            <i style={{ width: 18, borderTop: '2px solid var(--ink-dim)', display: 'inline-block' }} />
            blocker
          </span>
          <span>
            <i style={{ width: 18, borderTop: '2px dashed var(--danger)', display: 'inline-block' }} />
            shared owned file
          </span>
          <span>
            <Icon name="check" size={12} />
            green edge: parallel-eligible
          </span>
        </div>
      </div>
    );
  }

  const visibleTickets = tickets.filter((t) => {
    if (filterMissingComp && !(t.ui && !t.comp)) return false;
    if (filterLocked && !lockedIds.includes(t.id)) return false;
    return true;
  });

  return (
    <>
      <div className="gpc-tbl">
        <div className="gpc-th">
          <span>ID</span>
          <span>Ticket</span>
          <span>Component</span>
          <span>Stages</span>
          <span>Status</span>
          <span style={{ textAlign: 'right' }}>AC</span>
        </div>
        {lanes.map((lane) => {
          const laneTickets = visibleTickets.filter((t) => t.lane === lane.id);
          if ((filterMissingComp || filterLocked) && laneTickets.length === 0) return null;
          const folded = !!foldedLanes[lane.id];
          const isBenchmark = lane.id === 'bench-before' || lane.id === 'bench-after';
          return (
            <div key={lane.id} style={{ display: 'contents' }}>
              <div
                className="gpc-lane"
                data-feature={isBenchmark ? 'F472' : undefined}
                onClick={() => onToggleLane(lane.id)}
              >
                <span className="n">{lane.n}</span>
                {lane.name}
                <small>{lane.sub}</small>
              </div>
              {!folded
                ? laneTickets.map((t) => {
                    const locked = lockedIds.includes(t.id);
                    const sel = selectedId === t.id;
                    const [tone, label] = statusPill(t, locked);
                    return (
                      <div
                        key={t.id}
                        className={'gpc-tr' + (locked ? ' locked' : '') + (sel ? ' sel' : '')}
                        onMouseEnter={locked ? () => onHoverLocked(t.id) : undefined}
                      >
                        <span className="id">{t.id}</span>
                        <span className="tt">
                          {locked ? <Icon name="lock" size={13} /> : null}
                          <button
                            type="button"
                            data-does={'Opens ' + t.id + ' in S16 with its criteria, blockers and copyable prompt'}
                            data-feature="F471"
                            onFocus={locked ? () => onHoverLocked(t.id) : undefined}
                            onClick={() => onSelectTicket(t.id)}
                          >
                            {t.title}
                          </button>
                        </span>
                        {!t.ui ? (
                          <span className="gpc-comp na">No screen</span>
                        ) : !t.comp ? (
                          <button
                            type="button"
                            className="gpc-comp none"
                            data-does={
                              'Opens the component picker for ' +
                              t.id +
                              '; a UI ticket needs exactly one slug or GAP id'
                            }
                            data-feature="F473"
                            onClick={() => onOpenCompPicker(t)}
                          >
                            <Icon name="alert" size={12} />
                            UI tanpa komponen
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="gpc-comp"
                            data-does={
                              'Opens the component picker for ' +
                              t.id +
                              '; picking another replaces the current one, never adds a second'
                            }
                            data-feature="F473"
                            onClick={() => onOpenCompPicker(t)}
                          >
                            {t.comp}
                            <Icon name="chev" size={11} />
                          </button>
                        )}
                        <div className="gpc-sts">
                          {t.stages.map((s, i) => (
                            <span key={s} className={'gpc-stg' + (i === 0 ? ' cur' : '')}>
                              {s}
                            </span>
                          ))}
                          <button
                            type="button"
                            className="gpc-stg add"
                            aria-label={'Edit stage labels of ' + t.id}
                            data-does={
                              'Opens the stage label editor for ' +
                              t.id +
                              '; labels never change the dependency order'
                            }
                            data-feature="F476"
                            onClick={() => onOpenStageEditor(t)}
                          >
                            <Icon name="plus" size={11} />
                          </button>
                        </div>
                        <Pill tone={tone} label={label} />
                        <span className="cr">{t.crit} AC</span>
                      </div>
                    );
                  })
                : null}
            </div>
          );
        })}
      </div>

      {popover?.kind === 'comp' ? (
        <div className="gpc-pop" data-feature="F473" style={{ left: 519, top: 430, width: 330 }}>
          <h5>{'Primary component for ' + popover.ticketId}</h5>
          <p>Exactly one. A GAP id means the register has no slug yet; S14 owns the GAP list.</p>
          {components.map(([slug, desc, src]) => (
            <button
              key={slug}
              type="button"
              className={'gpc-opt' + (popover.draftComp === slug ? ' on' : '')}
              data-does={'Sets ' + slug + ' as the only primary component of ' + popover.ticketId}
              data-feature="F473"
              onClick={() => onPickComponent(slug)}
            >
              <span className="gpc-radio" />
              <span>
                <code>{slug}</code>
                <small>{desc}</small>
              </span>
              <Pill tone="mute" label={src} />
            </button>
          ))}
          <div className="ft">
            <Btn
              label="Cancel"
              sm
              cls="plain"
              does="Closes the picker without a change"
              feature="F473"
              onClick={onClosePopover}
            />
            <Btn
              label="Set component"
              sm
              cls="ink"
              does={'Saves one component for ' + popover.ticketId + ' as a draft edit; the UI tanpa komponen count drops by one'}
              feature="F473"
              onClick={onSaveComponent}
            />
          </div>
        </div>
      ) : null}

      {popover?.kind === 'stages' ? (
        <div className="gpc-pop" data-feature="F476" style={{ left: 535, top: 340, width: 340 }}>
          <h5>{'Stage labels for ' + popover.ticketId}</h5>
          <p>A vertical slice can pass through several stages. Labels do not replace blockers.</p>
          <div className="gpc-stl">
            {popover.draftStages.map((s, i) => (
              <div key={s} className="r">
                <span className="o">{i + 1}</span>
                <span>{s}</span>
                <IconBtn
                  icon="x"
                  label={'Remove ' + s + ' label'}
                  sm
                  does={'Removes the ' + s + ' label from ' + popover.ticketId}
                  feature="F476"
                  onClick={() => onRemoveStage(s)}
                />
              </div>
            ))}
          </div>
          <div className="gpc-sts">
            {ALL_STAGE_LABELS.filter((s) => !popover.draftStages.includes(s)).map((s) => (
              <button
                key={s}
                type="button"
                className="gpc-stg"
                data-does={'Adds the ' + s + ' label to ' + popover.ticketId}
                data-feature="F476"
                onClick={() => onAddStage(s)}
              >
                {'+ ' + s}
              </button>
            ))}
          </div>
          <p>
            <b>Blockers stay:</b> T-04, then canvas approval.
          </p>
          <div className="ft">
            <Btn
              label="Cancel"
              sm
              cls="plain"
              does="Closes the editor without a change"
              feature="F476"
              onClick={onClosePopover}
            />
            <Btn
              label="Save labels"
              sm
              cls="ink"
              does="Saves the label list as a draft edit; it is not a proposal and changes no dependency"
              feature="F476"
              onClick={onSaveStages}
            />
          </div>
        </div>
      ) : null}

      {popover?.kind === 'locked' ? (
        <div className="gpc-pop" data-feature="F477" style={{ left: 111, top: 340, width: 372 }}>
          <h5>
            <Icon name="lock" size={13} />
            {' ' + popover.ticketId + ' is locked'}
          </h5>
          <p>
            This ticket changes a user-app screen and the canvas is not approved. Planning, test and benchmark tickets
            stay editable.
          </p>
          <div className="gpc-sts">
            {lockedIds.map((id) => (
              <span key={id} className="gpc-stg">
                {id}
              </span>
            ))}
          </div>
          <div className="ft">
            <Btn
              label="Open canvas step (S21)"
              sm
              cls="ink"
              does="Opens S21 where Setujui kanvas is the only way to unlock frontend tickets"
              feature="F477"
              onClick={onOpenCanvasStep}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

// S15 Ticket board. Board: docs/design/spekin-canvas/project/S15-ticket-board.dc.html (data-screen="S15").
export function TicketBoardWorkArea({ onOpenTicket }: { onOpenTicket?: (ticketId: string) => void } = {}) {
  const gapC = gapCSample();
  const view = useWorkspace((s) => s.view('planning'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const [mode, setMode] = useState<TicketBoardMode>('ladder');
  const [tickets, setTickets] = useState<GapCTicket[]>(() => gapC.tickets.map((t) => ({ ...t, stages: [...t.stages] })));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [foldedLanes, setFoldedLanes] = useState<Record<string, boolean>>({});
  const [popover, setPopover] = useState<TicketPopover | null>(null);
  const [filterMissingComp, setFilterMissingComp] = useState(false);
  const [filterLocked, setFilterLocked] = useState(false);
  const [reviewedSequence, setReviewedSequence] = useState(false);
  const [removedCtx, setRemovedCtx] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && popover) {
        setPopover(null);
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [popover]);

  const activeTab = view.tab ?? 'Tickets · Inc. 2';
  const ctxItems = gapC.ctx.filter(([, name]) => !removedCtx.includes(name));
  const missingCount = countUiWithoutComponent(tickets);
  const lockedCount = tickets.filter((t) => gapC.lockedIds.includes(t.id)).length;

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Planning chat"
          sub="tickets r2"
          ctxItems={ctxItems}
          ctxFoot="≈ 3.2k tokens · secrets by name only"
          placeholder="Ask about tickets, order or blockers…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('planning', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setRemovedCtx((prev) => [...prev, name])}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setView('planning', { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          <TicketChatMessages onReviewProposal={() => recordIntent('F478:review-proposal')} />
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={[
            { icon: 'list', name: 'Tickets · Inc. 2' },
            { icon: 'doc', name: 'Plan r2' },
            { icon: 'req', name: 'Proposal 0009' },
          ]}
          activeTab={activeTab}
          onSelect={(tab) => {
            setView('planning', { tab });
            if (tab === 'Tickets · Inc. 2' && mode === 'empty') setMode('ladder');
          }}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => {
            setPopover(null);
            setSelectedId(null);
            setMode('empty');
            recordIntent('F479:empty');
          }}
          right={
            <Btn
              label="Usulkan tiket sisa"
              sm
              cls="ink"
              does="Opens S08 with a proposal for the remaining tickets; tickets join this board only when you accept it there"
              feature="F478"
              onClick={() => recordIntent('F478:propose-remaining')}
            />
          }
        />

        {popover?.kind === 'locked' ? (
          <div className="sp-banner warn" role="status" data-feature="F477">
            <Icon name="lock" size={16} />
            <p>
              <b>Canvas not approved.</b> 3 frontend tickets are locked (T-05, T-06, T-08). Approve the canvas on S21
              to release them.
            </p>
            <Btn
              label="Open S21"
              sm
              cls="ink"
              does="Opens S21 canvas step for Inc. 2"
              feature="F477"
              onClick={() => recordIntent('F477:open-s21')}
            />
          </div>
        ) : null}

        <div className="gpc-bar">
          <div className="gpc-seg" role="group" aria-label="View" data-feature="F471">
            <button
              type="button"
              aria-pressed={mode !== 'graph' ? 'true' : 'false'}
              data-does="Lists tickets in the pyramid order: benchmark before, core, static gates, verification, slices, prose, evidence review, benchmark after"
              data-feature="F471"
              onClick={() => {
                setPopover(null);
                setSelectedId(null);
                setMode('ladder');
              }}
            >
              <Icon name="layers" size={14} />
              Trust ladder
            </button>
            <button
              type="button"
              aria-pressed={mode === 'graph' ? 'true' : 'false'}
              data-does="Draws the slices as a graph with blockers, owned files and parallel eligibility"
              data-feature="F474"
              onClick={() => {
                setPopover(null);
                setSelectedId(null);
                setMode('graph');
              }}
            >
              <Icon name="link" size={14} />
              Task graph
            </button>
          </div>
          <span className="gpc-sub">{'Inc. 2 · ' + tickets.length + ' tickets · spec r14'}</span>
          <span className="gpc-fill" />
          <button
            type="button"
            className="gpc-chipf"
            aria-pressed={filterMissingComp ? 'true' : 'false'}
            data-does="Filters to UI tickets that have no component; the count is the same number S21 shows"
            data-feature="F473"
            onClick={() => setFilterMissingComp((v) => !v)}
          >
            <Icon name="alert" size={12} />
            {'UI tanpa komponen · ' + missingCount}
          </button>
          <button
            type="button"
            className="gpc-chipf"
            aria-pressed={filterLocked ? 'true' : 'false'}
            data-does="Filters to tickets locked until the canvas is approved"
            data-feature="F477"
            onClick={() => setFilterLocked((v) => !v)}
          >
            <Icon name="lock" size={12} />
            {'Locked · ' + lockedCount}
          </button>
        </div>

        <div className="gpc-body">
          <TicketBoardBody
            mode={mode}
            lanes={gapC.lanes}
            tickets={tickets}
            components={gapC.components}
            lockedIds={gapC.lockedIds}
            selectedId={selectedId}
            foldedLanes={foldedLanes}
            popover={popover}
            filterMissingComp={filterMissingComp}
            filterLocked={filterLocked}
            reviewedSequence={reviewedSequence}
            onSelectTicket={(id) => {
              if (onOpenTicket) onOpenTicket(id);
              else recordIntent('F471:open-ticket:' + id);
            }}
            onToggleLane={(laneId) => setFoldedLanes((prev) => ({ ...prev, [laneId]: !prev[laneId] }))}
            onOpenCompPicker={(t) => {
              setSelectedId(t.id);
              setPopover({ kind: 'comp', ticketId: t.id, draftComp: t.comp ?? 'GAP-30' });
            }}
            onPickComponent={(slug) =>
              setPopover((prev) => (prev?.kind === 'comp' ? { ...prev, draftComp: slug } : prev))
            }
            onSaveComponent={() => {
              if (popover?.kind === 'comp') {
                setTickets((prev) => setPrimaryComponent(prev, popover.ticketId, popover.draftComp));
                setPopover(null);
                setSelectedId(null);
              }
            }}
            onOpenStageEditor={(t) => {
              setSelectedId(t.id);
              setPopover({ kind: 'stages', ticketId: t.id, draftStages: [...t.stages] });
            }}
            onRemoveStage={(stage) =>
              setPopover((prev) =>
                prev?.kind === 'stages'
                  ? { ...prev, draftStages: prev.draftStages.filter((s) => s !== stage) }
                  : prev,
              )
            }
            onAddStage={(stage) =>
              setPopover((prev) =>
                prev?.kind === 'stages' && !prev.draftStages.includes(stage)
                  ? { ...prev, draftStages: [...prev.draftStages, stage] }
                  : prev,
              )
            }
            onSaveStages={() => {
              if (popover?.kind === 'stages') {
                setTickets((prev) =>
                  prev.map((t) => (t.id === popover.ticketId ? { ...t, stages: [...popover.draftStages] } : t)),
                );
                setPopover(null);
                setSelectedId(null);
              }
            }}
            onHoverLocked={(ticketId) => {
              setSelectedId(ticketId);
              setPopover({ kind: 'locked', ticketId });
            }}
            onOpenCanvasStep={() => recordIntent('F477:open-canvas-step')}
            onUseReviewedSequence={() => {
              setReviewedSequence((v) => !v);
              recordIntent('F475:reviewed-sequence');
            }}
            onProposeTickets={() => recordIntent('F479:propose-tickets')}
            onWriteByHand={() => {
              setMode('ladder');
              recordIntent('F479:write-by-hand');
            }}
            onClosePopover={() => {
              setPopover(null);
              setSelectedId(null);
            }}
          />
        </div>
      </section>
    </>
  );
}
