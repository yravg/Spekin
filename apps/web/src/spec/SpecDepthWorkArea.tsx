import { useState, useEffect } from 'react';
import {
  sampleData,
  type ContextItem,
  type SampleGapbBlock,
} from '../data/source';
import { useWorkspace } from '../state/workspace';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { Btn, IconBtn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

const {
  PROJECT,
  MODEL,
  GAPB_HASH,
  GAPB_PRINCIPLES,
  GAPB_SIMPLE,
  GAPB_BLOCKS,
  GAPB_EXPERT,
  GAPB_MISSING,
  GAPB_IMPACT,
  GAPB_KIT,
} = sampleData;

export type SpecDepthView = 'simple' | 'detailed' | 'expert' | 'deeper' | 'principles' | 'impact';

const SPEC_DEPTH_VIEWS: readonly SpecDepthView[] = ['simple', 'detailed', 'expert', 'deeper', 'principles', 'impact'];

export function isSpecDepthView(value: string | null): value is SpecDepthView {
  return value !== null && (SPEC_DEPTH_VIEWS as readonly string[]).includes(value);
}

const CTX_SPEC: ContextItem[] = [
  ['doc', 'Spec', 'r14'],
  ['req', 'R-DASH-014', 'r14'],
  ['doc', 'Pitch', 'r14'],
];

const CTX_IMPACT: ContextItem[] = [
  ['doc', 'Spec', 'r14'],
  ['frame', 'F-03 Variance table', 'r6'],
  ['server', 'API contract · variance alerts', 'r2'],
];

const PITCH_DECISIONS: [string, string, string][] = [
  ['D-03', 'Forecasts come from the monthly cost export', 'Accepted r6'],
  ['D-07', 'Money is stored without rounding', 'Accepted r9'],
  ['D-09', 'Cost lines open from a package row', 'Accepted r11'],
];

// S07 Spec document at every depth (docs/design/spekin-canvas/boards-gap-b.mjs).
export function SpecDepthWorkArea(props: {
  initialView?: SpecDepthView;
  onDepthChange?: (next: SpecDepthView) => void;
}) {
  const { initialView = 'detailed', onDepthChange } = props;
  const [mode, setMode] = useState<SpecDepthView>(initialView);
  const view = useWorkspace((s) => s.view('spec'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  useEffect(() => {
    setMode(initialView);
  }, [initialView]);

  function switchMode(next: SpecDepthView) {
    setMode(next);
    onDepthChange?.(next);
  }

  function clickDepth(target: 'Simple' | 'Detailed' | 'Expert') {
    if (target === 'Simple') {
      switchMode('simple');
    } else if (target === 'Expert') {
      switchMode('expert');
    } else {
      // Going deeper from Simple to Detailed proposes the 3 missing blocks (F442);
      // going shallower from Expert or returning from Principles shows Detailed (F441).
      switchMode(mode === 'simple' ? 'deeper' : 'detailed');
    }
  }

  const isImpact = mode === 'impact';
  const isDirty = mode === 'deeper' || mode === 'principles';
  const activeDepth: 'Simple' | 'Detailed' | 'Expert' =
    mode === 'simple' ? 'Simple' : mode === 'expert' ? 'Expert' : 'Detailed';

  const baseCtx = isImpact ? CTX_IMPACT : CTX_SPEC;
  const ctxItems = baseCtx.filter(([, name]) => !view.removedCtx.includes(name));

  const tabs: ArtifactTabItem[] = isImpact
    ? [
        { icon: 'doc', name: 'Spec' },
        { icon: 'layers', name: 'Inc. 3 · CSV export', dirty: true },
        { icon: 'frame', name: 'F-03 Variance table' },
      ]
    : [
        { icon: 'doc', name: 'Spec', dirty: isDirty },
        { icon: 'req', name: 'Decision log' },
        { icon: 'doc', name: 'Pitch' },
        { icon: 'frame', name: 'F-03 Variance table' },
      ];

  const activeTab = isImpact ? 'Inc. 3 · CSV export' : 'Spec';

  const rightAction = isImpact ? (
    <Btn
      label="Add feature"
      cls="ink"
      icon="plus"
      does="Starts another increment in this project, not a new project"
      feature="F447"
      onClick={() => recordIntent('F447:add-feature')}
    />
  ) : (
    <Btn
      label="Propose change"
      cls="ink"
      icon="diff"
      does="Starts a Proposal for the open section; nothing in the spec changes until it is accepted on S08"
      feature="F442"
      onClick={() => switchMode('deeper')}
    />
  );

  function renderUndoRedo(feature: string) {
    return (
      <>
        <IconBtn
          icon="undo"
          label="Undo"
          does="Undoes the last draft edit in this tab"
          sm
          feature={feature}
          onClick={() => recordIntent(feature + ':undo')}
        />
        <IconBtn
          icon="redo"
          label="Redo"
          does="Redoes the last undone draft edit"
          sm
          feature={feature}
          onClick={() => recordIntent(feature + ':redo')}
        />
        <IconBtn
          icon="history"
          label="Revisions"
          does="Opens S09 revision history for this document"
          sm
          feature={feature}
          onClick={() => recordIntent(feature + ':revisions')}
        />
      </>
    );
  }

  function renderPrinciples(compact: boolean) {
    return (
      <div className="gpb-card pr" data-feature="F445">
        <div className="h">
          <Icon name="flag" size={14} />
          Prinsip proyek
          <span>{compact ? 'Project principles · compact' : 'Project principles'}</span>
          <span className="sp-fill" />
          <Btn
            label="Edit"
            sm
            does="Opens a Proposal on S08 for the principles; accepted principles stay as they are until you accept the change"
            feature="F446"
            onClick={() => switchMode('principles')}
          />
        </div>
        {GAPB_PRINCIPLES.map((p) => (
          <div key={p.id} className={compact ? 'gpb-pi compact' : 'gpb-pi'}>
            <span className="id">{p.id}</span>
            <span>
              {p.t}
              {compact ? null : (
                <small>
                  {p.rev === '-' ? 'Not accepted yet' : 'Accepted ' + p.rev} · {p.src}
                </small>
              )}
            </span>
            {compact ? null : <Pill tone={p.pill[0]} label={p.pill[1]} />}
          </div>
        ))}
        <p className="ap-gpb-hint">
          Separate from the pitch, the plan and AGENTS.md. PRN-4 has no answer, so it stays an open question.
        </p>
      </div>
    );
  }

  function renderBlockRow(b: Pick<SampleGapbBlock, 'id' | 'k' | 't' | 'basis'>, prop = false) {
    const noBasis = !b.basis.length;
    return (
      <div
        key={b.id}
        className={'gpb-blk' + (noBasis && !prop ? ' nb' : '') + (prop ? ' prop' : '')}
        data-feature={noBasis ? 'F444' : undefined}
      >
        <span className="id">
          {b.id}
          <small>{b.k}</small>
        </span>
        <span>
          {b.t}
          {noBasis && !prop ? (
            <span className="gpb-nb">
              <Icon name="alert" size={12} />
              no decision, pack requirement or reference FR is linked
            </span>
          ) : null}
        </span>
        <span>
          {prop ? (
            <Pill tone="acc" label="Proposed" />
          ) : (
            <Pill tone={b.basis.length ? 'ok' : 'warn'} label={b.basis.length ? 'Basis ' + b.basis.length : 'tanpa dasar'} />
          )}
          {b.basis.length ? (
            <span className="gpb-basis">
              {b.basis.map((x) => (
                <span key={x} className="gpb-chip">
                  {x}
                </span>
              ))}
            </span>
          ) : null}
        </span>
        {noBasis && !prop ? (
          <span className="gpb-act">
            <Btn
              label="Link a decision"
              sm
              does="Opens a picker of decisions, pack requirements and reference FRs; the link is saved as a Proposal"
              feature="F444"
              onClick={() => recordIntent('F444:link:' + b.id)}
            />
            <Btn
              label="Propose removal"
              sm
              does="Creates a Proposal that removes this block; the block stays in the accepted spec until you accept it"
              feature="F444"
              onClick={() => recordIntent('F444:remove:' + b.id)}
            />
          </span>
        ) : null}
      </div>
    );
  }

  function renderSuggestion(text: string) {
    return (
      <div className="sp-sugg">
        <button
          type="button"
          data-does="Puts this prompt in the composer; nothing runs until Send"
          data-feature="F441"
          onClick={() => setView('spec', { draft: text })}
        >
          <Icon name="spark" size={13} />
          {text}
        </button>
      </div>
    );
  }

  function handleSend() {
    const q = view.draft.trim().toLowerCase();
    if (q.includes('csv') || q.includes('export') || q.includes('increment')) {
      setView('spec', { draft: '' });
      switchMode('impact');
      return;
    }
    recordIntent('F114:send');
  }

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Spec chat"
          sub={isImpact ? 'Inc. 3 · draft' : 'Spec ' + PROJECT.spec}
          ctxItems={ctxItems}
          ctxFoot="≈ 6.2k tokens · the whole spec is never sent"
          placeholder="Ask about a block, or @ a decision…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('spec', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setView('spec', { removedCtx: [...view.removedCtx, name] })}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setView('spec', { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={handleSend}
        >
          {mode === 'deeper' ? (
            <>
              <div className="sp-ub">Show me the Detailed layer.</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 28 s · 18 cr</em>
                </div>
                <p>
                  Detailed has 2 blocks. The Simple pitch implies 3 more. I made <b>one Proposal</b>; the spec is still r14.
                </p>
                <div className="sp-gg" data-feature="F442">
                  <div className="gh">
                    <span>Proposal P-31 · 3 blocks</span>
                    <button
                      type="button"
                      data-does="Shows the proposed blocks as a plain table"
                      data-feature="F442"
                      onClick={() => recordIntent('F442:show-table')}
                    >
                      Show as table
                    </button>
                  </div>
                  <div className="sp-gc prop">
                    <div className="k">
                      <Icon name="diff" size={12} />
                      Missing at Detailed
                      <span className="tag">
                        <Pill tone="acc" label="Proposal" />
                      </span>
                    </div>
                    <div className="tt">R-DASH-016, R-DASH-017, PLAN-05</div>
                    <div className="bd">Each block cites the pitch line it comes from.</div>
                    <div className="ft">
                      <span className="s">Base r14 · not in spec</span>
                      <Btn
                        label="Send to review"
                        sm
                        cls="ink"
                        does="Adds Proposal P-31 to S08 with its exact diff; the spec stays r14 until accepted"
                        feature="F442"
                        onClick={() => recordIntent('F442:send-review')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : mode === 'impact' ? (
            <>
              <div className="sp-ub">Add a CSV export of the variance table as a new increment.</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 41 s · 26 cr</em>
                </div>
                <p>
                  I opened <b>Inc. 3 · CSV export</b> in this project. Nothing is accepted. The impact is listed on the left;{' '}
                  <b>11</b> accepted items are not touched.
                </p>
              </div>
              {renderSuggestion('Narrow to the table only')}
            </>
          ) : mode === 'principles' ? (
            <>
              <div className="sp-ub">Answer PRN-4: only the project lead may edit a threshold.</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 12 s · 7 cr</em>
                </div>
                <p>
                  I drafted <b>PRN-4</b> as a Proposal. It changes principles only. The stack, the kit (yravg UI r3) and AGENTS.md
                  are not part of it.
                </p>
              </div>
            </>
          ) : mode === 'simple' ? (
            <>
              <div className="sp-ub">Back to Simple, please.</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 3 s · 0 cr</em>
                </div>
                <p>
                  Showing the pitch. <b>No data changed</b>: Detailed and Expert blocks are kept, and the snapshot is still{' '}
                  <b>{GAPB_HASH}</b>.
                </p>
              </div>
              {renderSuggestion('Show the Detailed layer')}
            </>
          ) : (
            <>
              <div className="sp-ub">Which blocks have no basis?</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 9 s · 4 cr</em>
                </div>
                <p>
                  <b>R-DASH-021</b> (Monday email) and <b>R-DASH-023</b> (24 months of history) have no decision behind them. Confirm
                  each one, or propose its removal.
                </p>
              </div>
              {renderSuggestion('Link R-DASH-021 to a decision')}
            </>
          )}
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={tabs}
          activeTab={activeTab}
          onSelect={(name) => {
            if (name === 'Spec' && isImpact) switchMode('detailed');
            else recordIntent('F104:tab:' + name);
          }}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          openItems={[
            {
              icon: 'layers',
              name: 'Add feature',
              onSelect: () => switchMode('impact'),
            },
          ]}
          right={rightAction}
        />

        {mode === 'simple' ? (
          <div className="sp-banner" role="status" data-feature="F441">
            <Icon name="check" size={16} />
            <p>
              <b>Shallower view.</b> Nothing was changed or deleted. Detailed and Expert blocks stay in the spec.
            </p>
          </div>
        ) : mode === 'deeper' ? (
          <div className="sp-banner warn" role="status" data-feature="F442">
            <Icon name="alert" size={16} />
            <p>
              <b>Detailed has missing blocks.</b> 3 blocks were proposed as P-31. The accepted spec stays r14 until you accept them.
            </p>
            <Btn
              label="Open P-31"
              sm
              does="Opens S08 with Proposal P-31 and its 3 hunks"
              feature="F442"
              onClick={() => recordIntent('F442:open-p31')}
            />
          </div>
        ) : null}

        {isImpact ? (
          <div className="sp-tool">
            <span className="sp-crumb">
              {PROJECT.name}
              <Icon name="chevR" size={12} />
              Increments
              <Icon name="chevR" size={12} />
              <b>Inc. 3 · CSV export</b>
            </span>
            <span className="sp-fill" />
            <Btn
              label="Cancel increment"
              sm
              does="Drops the draft increment; no accepted artifact changes"
              feature="F447"
              onClick={() => switchMode('detailed')}
            />
            {renderUndoRedo('F447')}
          </div>
        ) : (
          <div className="sp-tool">
            <div className="sp-seg" role="group" aria-label="Depth" data-feature="F441">
              {(['Simple', 'Detailed', 'Expert'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={d === activeDepth ? 'true' : 'false'}
                  data-does={
                    d === 'Simple'
                      ? 'Shows the spec at Simple; going shallower changes no data and keeps the deeper blocks'
                      : `Shows the spec at ${d}; blocks that do not exist at this layer yet are offered as one Proposal, never written directly`
                  }
                  data-feature={d === 'Simple' ? 'F441' : 'F442'}
                  onClick={() => clickDepth(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            <span className="sp-crumb">
              Specification
              <Icon name="chevR" size={12} />
              <b>Spec {PROJECT.spec}</b>
            </span>
            <span className="sp-fill" />
            <button
              type="button"
              className="gpb-hash"
              data-does="Copies the snapshot hash of the accepted spec; moving between depths never changes it"
              data-feature="F443"
              onClick={() => recordIntent('F443:copy-hash:' + GAPB_HASH)}
            >
              <Icon name="lock" size={12} />
              Snapshot <b>{GAPB_HASH}</b> · unchanged
            </button>
            {renderUndoRedo('F441')}
          </div>
        )}

        {isImpact ? (
          <div className="gpb-page">
            <div className="gpb-head">
              <h2>Inc. 3 · CSV export</h2>
              <Pill tone="acc" label="Draft" />
              <span className="gpb-meta">Impact before you accept anything</span>
            </div>
            <div className="gpb-card" data-feature="F448">
              <div className="h">
                <Icon name="layers" size={14} />
                What this increment touches
                <span>stage readiness, frames, contracts, tasks and tests</span>
              </div>
              <div className="gpb-imp">
                {GAPB_IMPACT.map((r) => (
                  <div key={r.area} style={{ display: 'contents' }}>
                    <span className="a">{r.area}</span>
                    <span>{r.item}</span>
                    <span className="n">{r.n}</span>
                    <Pill tone={r.pill[0]} label={r.pill[1]} />
                    <span className="ln" />
                  </div>
                ))}
              </div>
            </div>
            <div className="gpb-card" data-feature="F449">
              <div className="h">
                <Icon name="lock" size={14} />
                Kept as accepted
                <span>R-EVD-6 · the older revisions and their evidence are not rewritten</span>
                <span className="sp-fill" />
                <Btn
                  label="Show list"
                  sm
                  does="Lists the 11 untouched accepted artifacts with their revisions"
                  feature="F449"
                  onClick={() => recordIntent('F449:show-list')}
                />
                <Btn
                  label="Send to review"
                  sm
                  cls="ink"
                  does="Sends the increment as proposals to S08; accepting is a separate step per proposal"
                  feature="F449"
                  onClick={() => recordIntent('F449:send-review')}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="gpb-page">
            <div className="gpb-two">
              <div className="gpb-col">
                {mode === 'simple' ? (
                  <>
                    <div className="gpb-card">
                      <div className="h">
                        <Icon name="doc" size={14} />
                        Pitch
                        <span>Shape Up form · accepted r14</span>
                      </div>
                      <dl className="gpb-kvs">
                        {GAPB_SIMPLE.map((r) => (
                          <div key={r.k} className="ap-kv-pair">
                            <dt>{r.k}</dt>
                            <dd>{r.t}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <div className="gpb-card">
                      <div className="h">
                        <Icon name="list" size={14} />
                        Decisions behind this pitch
                        <span>3 of 14 shown</span>
                        <span className="sp-fill" />
                        <Btn
                          label="Open decision log"
                          sm
                          does="Opens S05 with the decisions that back this pitch"
                          feature="F441"
                          onClick={() => recordIntent('F441:open-decisions')}
                        />
                      </div>
                      <div className="gpb-list">
                        {PITCH_DECISIONS.map(([id, name, sub]) => (
                          <div key={id} className="sp-row">
                            <span className="id">{id}</span>
                            <span className="nm">
                              {name}
                              <small>{sub}</small>
                            </span>
                            <Pill tone="ok" label="Accepted" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : mode === 'detailed' ? (
                  <>
                    <div className="gpb-head">
                      <h3>Behaviour spec and plan</h3>
                      <Pill tone="warn" label="2 tanpa dasar" />
                      <span className="gpb-meta">EARS blocks · 5 of 5 shown</span>
                    </div>
                    {GAPB_BLOCKS.map((b) => renderBlockRow(b))}
                  </>
                ) : mode === 'expert' ? (
                  <>
                    <div className="gpb-head">
                      <h3>ADRs, glossary and traceability</h3>
                      <span className="gpb-meta">Expert layer · accepted r14</span>
                    </div>
                    {GAPB_EXPERT.map((b) => (
                      <div key={b.id} className="gpb-blk">
                        <span className="id">
                          {b.id}
                          <small>{b.k}</small>
                        </span>
                        <span>{b.t}</span>
                        <span>
                          <Pill tone={b.pill[0]} label={b.pill[1]} />
                          <span className="gpb-basis">
                            {b.basis.map((x) => (
                              <span key={x} className="gpb-chip">
                                {x}
                              </span>
                            ))}
                          </span>
                        </span>
                      </div>
                    ))}
                    <div className="gpb-card">
                      <div className="h">
                        <Icon name="link" size={14} />
                        Trace of R-DASH-014
                        <span>requirement &gt; ticket &gt; criterion &gt; test &gt; commit</span>
                        <span className="sp-fill" />
                        <Btn
                          label="Open S17"
                          sm
                          does="Opens the traceability matrix for R-DASH-014"
                          feature="F441"
                          onClick={() => recordIntent('F441:open-s17')}
                        />
                      </div>
                    </div>
                  </>
                ) : mode === 'deeper' ? (
                  <>
                    <div className="gpb-head">
                      <h3>Behaviour spec and plan</h3>
                      <Pill tone="acc" label="Proposal P-31" />
                      <span className="gpb-meta">Spec r14 unchanged</span>
                    </div>
                    {GAPB_BLOCKS.slice(0, 2).map((b) => renderBlockRow(b))}
                    {GAPB_MISSING.map((m) => renderBlockRow({ id: m.id, k: 'Missing', t: m.t, basis: [] }, true))}
                  </>
                ) : (
                  <>
                    {renderPrinciples(false)}
                    <div className="gpb-hunk" data-feature="F446">
                      <div className="hh">
                        <Icon name="diff" size={12} />
                        PRN-4 · Principles · base r14
                        <span className="sp-fill" />
                        <Pill tone="acc" label="Proposal P-32" />
                      </div>
                      <div className="hb">
                        Who may edit a threshold? <del>(no answer)</del> <ins>Only the project lead may edit a threshold.</ins>
                      </div>
                      <div className="hf">
                        <Btn
                          label="Accept hunk"
                          sm
                          cls="ink"
                          does="Accepts only this hunk in a new revision r15; the stack, the kit and AGENTS.md are not written"
                          feature="F446"
                          onClick={() => recordIntent('F446:accept-hunk')}
                        />
                        <Btn
                          label="Reject"
                          sm
                          does="Rejects this hunk; PRN-4 stays an open question"
                          feature="F446"
                          onClick={() => switchMode('detailed')}
                        />
                        <span className="ap-gpb-hint">Source: chat, message 2 · affects PRN-4</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="gpb-col">
                {mode === 'principles' ? (
                  <div className="gpb-card" data-feature="F446">
                    <div className="h">
                      <Icon name="layers" size={14} />
                      Plan, not principles
                      <span>R-DS</span>
                    </div>
                    <dl className="gpb-kvs">
                      <dt>Stack</dt>
                      <dd>
                        React with a Rust core · <b>not changed</b>
                      </dd>
                      <dt>Kit</dt>
                      <dd>
                        {GAPB_KIT.name} {GAPB_KIT.rev} · <b>not changed</b>
                      </dd>
                      <dt>AGENTS.md</dt>
                      <dd>Not written by this Proposal</dd>
                    </dl>
                    <p className="ap-gpb-hint">These change only by their own Proposals on S08.</p>
                  </div>
                ) : (
                  renderPrinciples(mode === 'simple')
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
