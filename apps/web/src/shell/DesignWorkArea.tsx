import { CTX_DESIGN, FRAMES, MODEL, REQS } from '@spekin/sample';
import type { PillTuple, SampleConflict, SampleFrame } from '@spekin/sample';
import { useWorkspace } from '../state/workspace';
import { Icon } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { ChatPanel } from './ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from './ArtifactTabs';
import { ViewSwitch } from './ViewSwitch';
import { Inspector, InspectorRow } from './Inspector';
import { MiniDashboard } from './MiniDashboard';

const DESIGN_TABS: ArtifactTabItem[] = [
  { icon: 'grid', name: 'Variance flows' },
  { icon: 'frame', name: 'F-03 Variance table' },
  { icon: 'frame', name: 'F-04 Alert drawer' },
  { icon: 'doc', name: 'DESIGN.md' },
  { icon: 'req', name: 'Spec §3' },
];

function CanvasFrame(props: {
  frame: SampleFrame;
  x: number;
  y: number;
  w: number;
  h: number;
  selected?: boolean;
  draft?: boolean;
  pill: PillTuple;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  const { frame, x, y, w, h, selected, draft, pill, onSelect, children } = props;
  const cls = ['sp-fr', selected ? 'sel' : '', draft ? 'draft' : ''].filter(Boolean).join(' ');
  return (
    <div className={cls} style={{ left: x + 'px', top: y + 'px', width: w + 'px' }} onClick={onSelect}>
      <div className="sp-frl">
        <b>{frame.id}</b>
        {frame.name}
        <span className="r">{frame.rev}</span>
        <Pill tone={pill[0]} label={pill[1]} />
      </div>
      <div className="sp-frb" style={{ height: h + 'px' }}>
        {children}
      </div>
      {selected ? (
        <>
          <span className="hdl" style={{ left: '-4px', top: '19px' }} />
          <span className="hdl" style={{ right: '-4px', top: '19px' }} />
          <span className="hdl" style={{ left: '-4px', bottom: '-4px' }} />
          <span className="hdl" style={{ right: '-4px', bottom: '-4px' }} />
        </>
      ) : null}
    </div>
  );
}

export function ConflictBanner(props: {
  conflict: SampleConflict;
  onCompare: () => void;
  onKeepProposal: () => void;
  onDiscard: () => void;
}) {
  const { conflict, onCompare, onKeepProposal, onDiscard } = props;
  return (
    <div className="sp-banner bad" role="alert" data-feature="F112">
      <Icon name="alert" size={16} />
      <p>
        <b>{conflict.frame} changed elsewhere</b> ({conflict.rev}, {conflict.by}, {conflict.at}). Your edit is kept as a local draft.
      </p>
      <Btn
        label="Compare"
        sm
        cls="ink"
        does="Opens Compare: r8 on the left, your local draft on the right"
        feature="F112"
        onClick={onCompare}
      />
      <Btn
        label="Keep as proposal"
        sm
        does="Saves your draft as a proposal on top of r8, for review in S08"
        feature="F112"
        onClick={onKeepProposal}
      />
      <Btn
        label="Discard draft"
        sm
        cls="plain"
        does="Asks to confirm, then drops the local draft and shows r8"
        feature="F112"
        onClick={onDiscard}
      />
    </div>
  );
}

// Mirrors boards-shell.mjs Design stage: chat, artifact tabs, canvas with frames, inspector.
export function DesignWorkArea(
  props: {
    onOpenCanvas?: () => void;
    onOpenReview?: () => void;
    onOpenTargeted?: () => void;
    onOpenStyle?: () => void;
    onOpenIntake?: () => void;
  } = {},
) {
  const view = useWorkspace((s) => s.view('design'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);
  const conflict = useWorkspace((s) => s.conflict);
  const dirtyTabs = useWorkspace((s) => s.dirtyTabs);
  const triggerConflict = useWorkspace((s) => s.triggerConflict);
  const resolveConflict = useWorkspace((s) => s.resolveConflict);

  const ctxItems = CTX_DESIGN.filter(([, name]) => !view.removedCtx.includes(name));
  const selectedFrame = view.selection[0] ?? 'F-03';
  const activeTab = view.tab ?? 'Variance flows';
  const tabsWithDirty = DESIGN_TABS.map((t) => ({ ...t, dirty: dirtyTabs.includes(t.name) }));

  const right = (
    <>
      <Btn label="Share" icon="share" later="Share and comment links (deferred in the browser MVP, R-WS-3)" />
      <Btn
        label="Hand off"
        cls="ink"
        icon="download"
        does="Opens S34: downloads only accepted revisions with a fixed revision manifest"
        feature="F104"
        onClick={() => recordIntent('F104:handoff')}
      />
    </>
  );

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Design chat"
          sub={selectedFrame + ' selected'}
          ctxItems={ctxItems}
          ctxFoot="≈ 9.8k tokens · the whole board is never sent"
          placeholder="Ask for a change to F-03, or @ another frame…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          run={['F-06 take 2 of 3', 'Step 3 of 4 · self-check', '1.2k · 14 s']}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('design', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setView('design', { removedCtx: [...view.removedCtx, name] })}
          onAddCtx={() => recordIntent('F106:add')}
          onShowSteps={() => recordIntent('F109:steps')}
          onStopRun={() => recordIntent('F109:stop')}
          onDraftChange={(draft) => setView('design', { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          <div className="sp-ub">Add an alert drawer to the variance table for packages over 3%.</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 34 s · 22 cr</em>
            </div>
            <p>
              Drew <b>F-04 Alert drawer</b> as a draft. F-03 stays accepted at r6. One gap found.
            </p>
            <div className="sp-gg" data-feature="F110">
              <div className="gh">
                <span>Requirement cards · 1 gap</span>
                <button
                  type="button"
                  data-does="Shows the same cards as a plain table (text fallback)"
                  data-feature="F110"
                  onClick={() => setView('design', { tableMode: !view.tableMode })}
                >
                  Show as table
                </button>
              </div>
              <div className="sp-gc">
                <div className="k">
                  <Icon name="req" size={12} />
                  Requirement
                  <span className="tag">
                    <Pill tone="ok" label="Accepted r14" />
                  </span>
                </div>
                <div className="tt">R-DASH-014 · Variance threshold per package</div>
                <div className="bd">Flag a package when forecast exceeds budget by more than 3%.</div>
                <div className="ft">
                  <span className="s">Source: brief §2 · REF-02</span>
                  <Btn
                    label="Details"
                    sm
                    does="Expands the card in place: criteria, sources and linked frames; focus stays on the card"
                    feature="F110"
                    onClick={() => recordIntent('F110:details')}
                  />
                </div>
              </div>
              <div className="sp-gc prop">
                <div className="k">
                  <Icon name="alert" size={12} />
                  Gap
                  <span className="tag">
                    <Pill tone="acc" label="Proposal" />
                  </span>
                </div>
                <div className="tt">No empty state when no package is over</div>
                <div className="bd">Proposed: show “No package over 3% this period”.</div>
                <div className="ft">
                  <span className="s">Not in spec · needs review</span>
                  <Btn
                    label="Edit"
                    sm
                    does="Edits the proposed criterion as a draft; the spec is unchanged"
                    feature="F110"
                    onClick={() => recordIntent('F110:edit')}
                  />
                  <Btn
                    label="Send to review"
                    sm
                    cls="ink"
                    does="Adds this proposal to S08 review with its exact diff"
                    feature="F110"
                    onClick={() => recordIntent('F110:send-review')}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="sp-sugg">
            <button
              type="button"
              data-does="Puts this prompt in the composer; nothing runs until Send"
              data-feature="F114"
              onClick={() => setView('design', { draft: 'Compare F-04 with F-03' })}
            >
              <Icon name="spark" size={13} />
              Compare F-04 with F-03
            </button>
          </div>
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={tabsWithDirty}
          activeTab={activeTab}
          onSelect={(tab) => {
            if (tab === 'F-04 Alert drawer') {
              triggerConflict();
            } else if (tab === 'DESIGN.md' && props.onOpenStyle) {
              props.onOpenStyle();
            } else if (tab === 'Variance flows' && activeTab === 'Variance flows' && props.onOpenCanvas) {
              props.onOpenCanvas();
            } else {
              setView('design', { tab });
            }
          }}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => {
            if (props.onOpenIntake) props.onOpenIntake();
            else recordIntent('F104:open');
          }}
          right={right}
        />
        {conflict ? (
          <ConflictBanner
            conflict={conflict}
            onCompare={() => resolveConflict('compare')}
            onKeepProposal={() => resolveConflict('proposal')}
            onDiscard={() => resolveConflict('discard')}
          />
        ) : null}
        <div className="sp-tool">
          <ViewSwitch current={view.viewMode} onChange={(viewMode) => setView('design', { viewMode })} />
          <span className="sp-crumb">
            Design
            <Icon name="chevR" size={12} />
            <b>Variance flows</b>
          </span>
          <span className="sp-fill" />
          <IconBtn
            icon="undo"
            label="Undo"
            does="Undoes the last draft edit on this board"
            sm
            feature="F116"
            onClick={() => recordIntent('F116:undo')}
          />
          <IconBtn
            icon="redo"
            label="Redo"
            does="Redoes the last undone draft edit"
            sm
            feature="F116"
            onClick={() => recordIntent('F116:redo')}
          />
          <IconBtn
            icon="history"
            label="Revisions"
            does="Opens the revision list of the selected artifact"
            sm
            feature="F108"
            onClick={() => recordIntent('F108:revisions')}
          />
        </div>
        <div className="sp-work">
          <div className="sp-cv" aria-label="Board: Variance flows">
            <div className="sp-cvt">
              Variance flows<span>5 frames · 1 reference</span>
            </div>
            <svg className="sp-arrows" width={782} height={694} aria-hidden="true">
              <defs>
                <marker id="ah" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto">
                  <path d="M0 0L8 4L0 8z" fill="rgba(31,31,31,.35)" />
                </marker>
              </defs>
              <path
                d="M258 135 C 276 135, 278 150, 294 150"
                fill="none"
                stroke="rgba(31,31,31,.35)"
                strokeWidth={1.5}
                markerEnd="url(#ah)"
              />
              <path
                d="M426 258 L 426 290"
                fill="none"
                stroke="rgba(31,31,31,.35)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                markerEnd="url(#ah)"
              />
            </svg>
            <CanvasFrame
              frame={FRAMES.f01}
              x={28}
              y={60}
              w={230}
              h={150}
              selected={selectedFrame === 'F-01'}
              pill={['ok', 'Accepted']}
              onSelect={() => setView('design', { selection: ['F-01'] })}
            >
              <MiniDashboard title="Portfolio overview" chart table={false} h={150} />
            </CanvasFrame>
            <CanvasFrame
              frame={FRAMES.f03}
              x={296}
              y={60}
              w={262}
              h={176}
              selected={selectedFrame === 'F-03'}
              pill={['ok', 'Accepted']}
              onSelect={() => setView('design', { selection: ['F-03'] })}
            >
              <MiniDashboard title="Variance table" rows={4} h={176} />
            </CanvasFrame>
            <CanvasFrame
              frame={FRAMES.f04}
              x={296}
              y={296}
              w={262}
              h={176}
              selected={selectedFrame === 'F-04'}
              draft
              pill={['warn', 'Draft · not accepted']}
              onSelect={() => setView('design', { selection: ['F-04'] })}
            >
              <MiniDashboard title="Variance table" rows={4} drawer h={176} />
            </CanvasFrame>
            <div className="sp-fr" style={{ left: '600px', top: '60px', width: '160px' }}>
              <div className="sp-frl">
                <b>{FRAMES.alt.id}</b>
                {FRAMES.alt.name}
                <span className="r">{FRAMES.alt.takes} takes</span>
              </div>
              <div className="sp-stack" style={{ position: 'relative', height: '104px' }}>
                <span className="bk" style={{ transform: 'translate(10px,10px)' }} />
                <span className="bk" style={{ transform: 'translate(5px,5px)' }} />
                <div className="sp-frb" style={{ height: '100px' }}>
                  <MiniDashboard title="Take 1 of 3" rows={3} kpi={false} h={100} />
                </div>
              </div>
            </div>
            <div className="sp-fr" style={{ left: '28px', top: '296px', width: '230px' }}>
              <div className="sp-frl">
                <b>{FRAMES.ref.id}</b>
                {FRAMES.ref.name}
              </div>
              <div className="sp-frb sp-ref" style={{ height: '150px' }}>
                <div>
                  <Icon name="image" size={22} stroke={1.5} />
                  <span>
                    Reference image · {FRAMES.ref.kind}
                    <br />
                    not an editable frame
                  </span>
                </div>
              </div>
            </div>
            <div className="sp-ftool" role="toolbar" aria-label="Canvas tools">
              <IconBtn
                icon="pointer"
                label="Select (V)"
                does="Select and move frames"
                pressed={view.tool === 'pointer'}
                sm
                feature="F113"
                onClick={() => setView('design', { tool: 'pointer' })}
              />
              <IconBtn
                icon="hand"
                label="Pan (H)"
                does="Pans the board; Space-drag does the same"
                pressed={view.tool === 'hand'}
                sm
                feature="F113"
                onClick={() => setView('design', { tool: 'hand' })}
              />
              <IconBtn
                icon="frame"
                label="New frame (F)"
                does="Starts an empty frame; asks for a prompt or a reference"
                pressed={view.tool === 'frame'}
                sm
                feature="F113"
                onClick={() => setView('design', { tool: 'frame' })}
              />
              <IconBtn
                icon="type"
                label="Text (T)"
                does="Adds a text note to the board"
                pressed={view.tool === 'type'}
                sm
                feature="F113"
                onClick={() => setView('design', { tool: 'type' })}
              />
              <IconBtn
                icon="comment"
                label="Nitpick pin (C)"
                does="Drops a nitpick pin on a frame region (S33)"
                pressed={view.tool === 'comment'}
                sm
                feature="F113"
                onClick={() => setView('design', { tool: 'comment' })}
              />
              <IconBtn
                icon="image"
                label="Import reference"
                does="Imports a PNG, JPEG or WebP the user picks as a reference image (S28)"
                sm
                feature="F113"
                onClick={() => {
                  if (props.onOpenIntake) props.onOpenIntake();
                  else recordIntent('F113:import');
                }}
              />
              <span className="div" />
              <Btn
                label="Ask on select"
                cls="plain"
                sm
                icon="spark"
                does="When on, selecting a frame region opens the part-instruction popover (S32)"
                feature="F113"
                onClick={() => {
                  if (props.onOpenTargeted) props.onOpenTargeted();
                  else recordIntent('F113:ask-on-select');
                }}
              />
            </div>
            <button
              type="button"
              className="sp-offm"
              style={{ right: '14px', top: '262px' }}
              data-does="Pans to F-06, which is being designed off screen; the selection does not change"
              data-feature="F113"
              onClick={() => recordIntent('F113:pan-f06')}
            >
              F-06 designing
              <Icon name="chevR" size={13} />
            </button>
            <div className="sp-zoom" role="group" aria-label="Zoom">
              <IconBtn
                icon="minus"
                label="Zoom out"
                does="Zooms the board out; UI text keeps its size"
                sm
                feature="F113"
                onClick={() => setView('design', { zoom: Math.max(0.25, Math.round((view.zoom - 0.1) * 100) / 100) })}
              />
              <span>{Math.round(view.zoom * 100)}%</span>
              <IconBtn
                icon="plus"
                label="Zoom in"
                does="Zooms the board in"
                sm
                feature="F113"
                onClick={() => setView('design', { zoom: Math.min(2, Math.round((view.zoom + 0.1) * 100) / 100) })}
              />
              <IconBtn
                icon="fit"
                label="Fit selection"
                does="Fits the selected frames in view"
                sm
                feature="F113"
                onClick={() => setView('design', { zoom: 0.64 })}
              />
            </div>
          </div>

          <Inspector
            title={FRAMES.f03.id + ' ' + FRAMES.f03.name}
            pill={['ok', 'Accepted r6']}
            sub="Frame · Design stage · edited 12:41 by Rina (sample)"
            tabs={['Links', 'Contract', 'Revisions', 'Evidence']}
            activeTab={view.inspTab}
            onSelectTab={(inspTab) => setView('design', { inspTab })}
            onMore={() => recordIntent('F108:more')}
          >
            <div className="sp-sec">
              <h4>
                Requirements<span>3</span>
              </h4>
              {REQS.map((r) => (
                <InspectorRow key={r.id} id={r.id} name={r.t} sub={r.sub} pill={r.pill} />
              ))}
            </div>
            <div className="sp-sec">
              <h4>
                Design<span>1</span>
              </h4>
              <InspectorRow
                id="DESIGN.md"
                name="Tokens and type scale"
                sub="Accepted r3 · 18 tokens"
                pill={['ok', 'Accepted']}
              />
            </div>
            <div className="sp-sec">
              <h4>
                Task and test<span>2</span>
              </h4>
              <InspectorRow id="T-212" name="Build variance table" sub="Frontend · not started" pill={['mute', 'Open']} />
              <InspectorRow
                id="AC-014.2"
                name="Over-threshold rows flagged"
                sub="No evidence on a pinned build"
                pill={['mute', 'Untested']}
              />
            </div>
            <div className="sp-ready">
              <div className="t">
                Design stage
                <Pill tone="warn" label="3 to review" />
              </div>
              <p>F-04 draft, 1 gap card and 1 proposal wait for review. Nothing is accepted until you review it.</p>
              <Btn
                label="Open review"
                cls="ink"
                sm
                does="Opens S08 review with the 3 pending items for this stage"
                feature="F108"
                onClick={() => {
                  if (props.onOpenReview) props.onOpenReview();
                  else recordIntent('F108:open-review');
                }}
              />
            </div>
          </Inspector>
        </div>
      </section>
    </>
  );
}
