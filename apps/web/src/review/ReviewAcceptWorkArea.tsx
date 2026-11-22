import { useLayoutEffect, useState } from 'react';
import {
  MODEL,
  REVIEW_NITS,
  REVIEW_PROPOSAL,
  type DiffSegment,
  type PillTuple,
  type SampleReviewProposal,
  type StageId,
} from '@spekin/sample';
import { useWorkspace, type SaveState } from '../state/workspace';
import { Icon } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { ViewSwitch } from '../shell/ViewSwitch';
import { Inspector, InspectorRow } from '../shell/Inspector';
import { F03_AFTER, F03Table, FrameAbs, RevBtn, ReviewCanvasPalette } from './F03Table';

export type ReviewState = 'pins' | 'hover' | 'stale' | 'diff' | 'accepted' | 'rejected';

export interface AcceptedResult {
  ok: true;
  revisionsCreated: 1;
  revision: { id: string; parent: string; hunks: string[]; snapshot: string };
  auditEntries: { id: string; at: string; text: string }[];
}

export interface RejectedAcceptResult {
  ok: false;
  reason: 'stale' | 'empty';
}

export interface RejectResult {
  revisionsCreated: 0;
  currentRev: string;
  auditEntries: { id: string; at: string; text: string }[];
}

// Pure proposal rules (R-EDT-1, R-EDT-3, R-EDT-4, C-03).
export function acceptProposal(
  proposal: SampleReviewProposal,
  currentRev: string,
  includedHunkIds: readonly string[],
): AcceptedResult | RejectedAcceptResult {
  if (proposal.from !== currentRev) return { ok: false, reason: 'stale' };
  if (includedHunkIds.length === 0) return { ok: false, reason: 'empty' };
  return {
    ok: true,
    revisionsCreated: 1,
    revision: {
      id: proposal.to,
      parent: proposal.from,
      hunks: [...includedHunkIds],
      snapshot: proposal.accepted.snapshot,
    },
    auditEntries: [proposal.audit.accepted],
  };
}

export function rejectProposal(proposal: SampleReviewProposal, currentRev: string): RejectResult {
  return {
    revisionsCreated: 0,
    currentRev,
    auditEntries: [proposal.audit.rejected],
  };
}

export interface ReviewShellOverride {
  save?: SaveState;
  stage?: StageId;
  specRev?: string;
}

const PINS: Record<string, number> = { title: 1, thr: 2, kpi: 3, head: 4, f3: 5, v3: 6, foot: 7 };
const STALE_NIT = REVIEW_NITS.find((n) => n.stale)!;
const READY_COUNT = REVIEW_NITS.length - 1;

const DESIGN_TABS: ArtifactTabItem[] = [
  { icon: 'grid', name: 'Variance flows' },
  { icon: 'frame', name: 'F-03 Variance table', dirty: true },
  { icon: 'frame', name: 'F-04 Alert drawer' },
  { icon: 'doc', name: 'DESIGN.md' },
  { icon: 'req', name: 'Spec §3' },
];

function DiffSegments({ segments }: { segments: DiffSegment[] }) {
  return (
    <>
      {segments.map(([kind, text], idx) =>
        kind === 'eq' ? (
          <span key={idx}>{text}</span>
        ) : kind === 'add' ? (
          <ins key={idx} className="rev-ins">
            {text}
          </ins>
        ) : (
          <del key={idx} className="rev-del">
            {text}
          </del>
        ),
      )}
    </>
  );
}

// S33 Review and accept, with S08 exact diff (boards-review.mjs).
export function ReviewAcceptWorkArea(props: {
  initialState?: ReviewState;
  onShellOverride?: (o: ReviewShellOverride) => void;
  onOpenHandoff?: (stale?: boolean) => void;
}) {
  const { initialState = 'pins', onShellOverride, onOpenHandoff } = props;
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const [state, setState] = useState<ReviewState>(initialState);
  const [includedHunks, setIncludedHunks] = useState<string[]>(REVIEW_PROPOSAL.hunks.map((h) => h.id));
  const [draft, setDraft] = useState('');

  useLayoutEffect(() => {
    if (!onShellOverride) return;
    if (state === 'diff' || state === 'rejected') {
      onShellOverride({
        save: { status: 'saved', tone: 'ok', text: 'Saved 12:52' },
        stage: 'spec',
        specRev: 'r14',
      });
    } else if (state === 'accepted') {
      onShellOverride({
        save: { status: 'saved', tone: 'ok', text: 'Saved 12:52' },
        stage: 'spec',
        specRev: 'r15',
      });
    } else {
      onShellOverride({
        save: { status: 'saved', tone: 'ok', text: 'Saved 12:51' },
        stage: 'design',
        specRev: 'r14',
      });
    }
  }, [state, onShellOverride]);

  const right = (
    <>
      <Btn label="Share" icon="share" later="Share and comment links (deferred in the browser MVP, R-WS-3)" />
      <Btn
        label="Hand off"
        cls="ink"
        icon="download"
        does="Opens S34: downloads only accepted revisions with a fixed revision manifest"
        feature="F104"
        onClick={() => {
          if (onOpenHandoff) onOpenHandoff(state === 'accepted');
          else recordIntent('F104:handoff');
        }}
      />
    </>
  );

  // ---- S08 exact diff states: diff, accepted, rejected
  if (state === 'diff' || state === 'accepted' || state === 'rejected') {
    const mode = state === 'diff' ? 'open' : state;
    const specTabs: ArtifactTabItem[] = [
      { icon: 'doc', name: 'Spec §3' },
      { icon: 'diff', name: mode === 'open' ? 'Proposal P-07 · r14 to r15' : 'P-07 · ' + mode },
      { icon: 'history', name: 'Revisions' },
    ];
    const activeSpecTab = specTabs[1]!.name;
    const inspPill: PillTuple =
      mode === 'accepted' ? ['ok', 'Accepted r15'] : mode === 'rejected' ? ['mute', 'Rejected'] : ['acc', 'Proposal'];

    return (
      <>
        <ChatPanel
          title="Specification chat"
          sub="proposal P-07"
          ctxItems={[
            ['req', 'R-DASH-019', 'proposal'],
            ['req', 'R-DASH-014', 'r14'],
            ['frame', 'F-03 review', '7 changes'],
          ]}
          ctxFoot="3.2k tokens · requirements and the review only"
          placeholder="Ask about this proposal, or @ a requirement…"
          draft={draft}
          model={MODEL}
          onResize={() => {}}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setDraft('')}
          onCollapse={() => recordIntent('F114:collapse')}
          onRemoveCtx={(n) => recordIntent('F106:rm:' + n)}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={setDraft}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          <div className="sp-ub">Put the 2-period rule and the sign format from the F-03 review into the spec.</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 27 s · 14 cr</em>
            </div>
            <p>
              {mode === 'open' ? (
                <>
                  Prepared <b>proposal P-07</b>: 4 hunks. The spec stays r14 until you accept it.
                </>
              ) : mode === 'accepted' ? (
                <>
                  <b>P-07 is accepted.</b> r15 is the spec now. Linked items are marked Needs review.
                </>
              ) : (
                <>
                  <b>P-07 is rejected.</b> The spec is still r14. Nothing was written.
                </>
              )}
            </p>
            <div className="sp-gg" data-feature="F254">
              <div className="gh">
                <span>Proposal card · {mode === 'open' ? 'pinned' : 'closed'}</span>
                <button
                  type="button"
                  data-does="Shows the same card as a plain table (text fallback)"
                  data-feature="F254"
                  onClick={() => recordIntent('F254:table')}
                >
                  Show as table
                </button>
              </div>
              <div className="sp-gc prop">
                <div className="k">
                  <Icon name="diff" size={12} />
                  Proposal
                  <span className="tag">
                    <Pill tone={inspPill[0]} label={inspPill[1]} />
                  </span>
                </div>
                <div className="tt">P-07 · r14 to r15</div>
                <div className="bd">
                  2 requirements, 1 criterion, 1 ticket.{' '}
                  {mode === 'open'
                    ? 'Pinning keeps it a proposal.'
                    : mode === 'accepted'
                      ? 'Audit A-0231 records it.'
                      : 'Audit A-0232 records it.'}
                </div>
                <div className="ft">
                  <span className="s">{mode === 'open' ? 'Pinned · not accepted' : 'Closed'}</span>
                  <Btn
                    label="Open diff"
                    sm
                    cls="ink"
                    does="Opens the exact diff of P-07 in the work area; the card itself accepts nothing"
                    feature="F254"
                    onClick={() => setState('diff')}
                  />
                </div>
              </div>
            </div>
          </div>
        </ChatPanel>

        <section className="sp-main" aria-label="Work area">
          <ArtifactTabs
            tabs={specTabs}
            activeTab={activeSpecTab}
            onSelect={(n) => recordIntent('F104:tab:' + n)}
            onClose={(n) => recordIntent('F104:close:' + n)}
            onOpenArtifact={() => recordIntent('F104:open')}
            right={right}
          />
          <div className="sp-tool">
            <ViewSwitch current="Compare" onChange={(v) => recordIntent('F104:view:' + v)} />
            <span className="sp-crumb">
              Specification
              <Icon name="chevR" size={12} />
              <b>Proposal P-07</b>
            </span>
            <span className="sp-fill" />
            <IconBtn icon="undo" label="Undo" does="Undoes the last draft edit on this board" sm feature="F116" onClick={() => recordIntent('F116:undo')} />
            <IconBtn icon="redo" label="Redo" does="Redoes the last undone draft edit" sm feature="F116" onClick={() => recordIntent('F116:redo')} />
            <IconBtn icon="history" label="Revisions" does="Opens the revision list of the selected artifact" sm feature="F108" onClick={() => recordIntent('F108:revisions')} />
          </div>

          {mode === 'open' ? (
            <div className="sp-banner warn" role="status">
              <Icon name="alert" size={16} />
              <p>
                <b>Proposal, not accepted.</b> The spec stays r14 until you accept. Base r14 is still the current revision.
              </p>
              <Btn
                label="Edit proposal"
                sm
                does="Edits the proposal text as a draft; the spec is unchanged"
                feature="F249"
                onClick={() => recordIntent('F249:edit')}
              />
            </div>
          ) : mode === 'accepted' ? (
            <div className="rev-bn ok" role="status">
              <Icon name="check" size={16} />
              <p>
                <b>Accepted. r15 created from r14.</b> Audit A-0231 · 12:52 · 3 linked items now need review. r14 stays readable.
              </p>
              <Btn
                label="Open revisions"
                sm
                does="Opens the revision list with r15 on top and r14 below it"
                feature="F251"
                onClick={() => recordIntent('F251:revisions')}
              />
            </div>
          ) : (
            <div className="rev-bn mute" role="status">
              <Icon name="x" size={16} />
              <p>
                <b>Rejected. r14 stays current.</b> No new revision was made. Audit A-0232 · 12:52.
              </p>
              <Btn
                label="Undo reject"
                sm
                does="Reopens P-07 for review if r14 is still the current revision; the audit entry stays"
                feature="F252"
                onClick={() => setState('diff')}
              />
            </div>
          )}

          <div className="sp-work">
            <div className="rev-dv">
              <div className="rev-dh">
                <div className="m">
                  <Pill tone={inspPill[0]} label={inspPill[1]} />
                  <code>P-07</code>
                  <span>
                    r14 to r15 · base r14 {mode === 'accepted' ? 'accepted 12:52' : 'is the current revision'}
                  </span>
                  <span>·</span>
                  <span>
                    {REVIEW_PROPOSAL.by}, {REVIEW_PROPOSAL.at}
                  </span>
                  <span className="sp-fill" />
                  <Btn
                    label="Show unchanged (3)"
                    cls="plain"
                    sm
                    does="Shows the 3 unchanged blocks around the hunks; they are never part of the diff"
                    feature="F249"
                    onClick={() => recordIntent('F249:unchanged')}
                  />
                </div>
                <h2>{REVIEW_PROPOSAL.title}</h2>
              </div>

              {REVIEW_PROPOSAL.hunks.map((h) => {
                const checked = includedHunks.includes(h.id);
                return (
                  <section key={h.id} className={'rev-hk' + (mode === 'rejected' ? ' off' : '')} aria-label={'Hunk ' + h.id}>
                    <div className="hh">
                      {mode === 'open' ? (
                        <button
                          type="button"
                          className={'rev-ck' + (checked ? ' on' : '')}
                          role="checkbox"
                          aria-checked={checked}
                          aria-label={'Include ' + h.id}
                          data-does={'Includes or leaves out hunk ' + h.id + '; Accept writes only the ticked hunks'}
                          data-feature="F249"
                          onClick={() =>
                            setIncludedHunks((prev) =>
                              prev.includes(h.id) ? prev.filter((x) => x !== h.id) : [...prev, h.id],
                            )
                          }
                        >
                          <Icon name="check" size={11} stroke={3} />
                        </button>
                      ) : null}
                      <b>{h.id}</b>
                      <span>{h.kind}</span>
                      <code>{h.ref}</code>
                      <span>{h.name}</span>
                      <span className="sp-fill" />
                      <span>{h.src}</span>
                      {mode === 'accepted' ? <Pill tone="ok" label="Accepted" /> : null}
                      {mode === 'rejected' ? <Pill tone="mute" label="Rejected" /> : null}
                    </div>
                    <div className="rev-ln o">
                      <span className="g">r14</span>
                      <span>{h.old ? <DiffSegments segments={h.old} /> : <span className="none">Not in r14</span>}</span>
                    </div>
                    <div className="rev-ln n">
                      <span className="g">r15</span>
                      <span>
                        <DiffSegments segments={h.now} />
                      </span>
                    </div>
                  </section>
                );
              })}

              {mode === 'open' ? (
                <div className="rev-ab">
                  <div className="tx">
                    <b>{includedHunks.length} of 4 hunks included</b>
                    <span>Creates r15 from r14 · 3 items need review · 1 ticket · 1 audit entry</span>
                  </div>
                  <span className="sp-fill" />
                  <RevBtn
                    does="Rejects the proposal: no new revision, r14 stays current; one audit entry is recorded"
                    feature="F252"
                    onClick={() => {
                      rejectProposal(REVIEW_PROPOSAL, 'r14');
                      setState('rejected');
                    }}
                  >
                    Reject
                  </RevBtn>
                  <RevBtn
                    cls="ink"
                    disabled={includedHunks.length === 0}
                    does="Asks to confirm with Cancel as the default, then creates r15 from r14 with the included hunks and one audit entry"
                    feature="F251"
                    onClick={() => {
                      const res = acceptProposal(REVIEW_PROPOSAL, 'r14', includedHunks);
                      if (res.ok) setState('accepted');
                    }}
                  >
                    Accept and create r15 <span className="rev-kbd">⌘↵</span>
                  </RevBtn>
                </div>
              ) : mode === 'accepted' ? (
                <div className="rev-ab">
                  <div className="tx">
                    <b>r15 is the current spec</b>
                    <span>
                      Parent r14 · {REVIEW_PROPOSAL.accepted.hunks} · snapshot {REVIEW_PROPOSAL.accepted.snapshot}
                    </span>
                  </div>
                  <span className="sp-fill" />
                  <RevBtn
                    does="Starts a new proposal that restores r14. Nothing changes until that proposal is accepted"
                    feature="F251"
                    onClick={() => recordIntent('F251:revert')}
                  >
                    Revert as proposal
                  </RevBtn>
                  <RevBtn
                    cls="ink"
                    does="Opens the spec document at r15"
                    feature="F251"
                    onClick={() => recordIntent('F251:open-r15')}
                  >
                    Open r15
                  </RevBtn>
                </div>
              ) : (
                <div className="rev-ab">
                  <div className="tx">
                    <b>r14 is still the current spec</b>
                    <span>Proposal P-07 is closed and kept for the record</span>
                  </div>
                  <span className="sp-fill" />
                  <RevBtn
                    does="Reopens the text of P-07 as a new draft proposal on top of r14"
                    feature="F252"
                    onClick={() => setState('diff')}
                  >
                    Edit and re-propose
                  </RevBtn>
                  <RevBtn
                    cls="ink"
                    does="Opens the spec document at r14"
                    feature="F252"
                    onClick={() => setState('pins')}
                  >
                    Back to the spec
                  </RevBtn>
                </div>
              )}
            </div>

            <Inspector
              title="Proposal P-07"
              pill={inspPill}
              sub={
                mode === 'open'
                  ? 'Base r14 is current · by Spekin · 12:46'
                  : mode === 'accepted'
                    ? 'Accepted 12:52 by Rina (sample)'
                    : 'Rejected 12:52 by Rina (sample)'
              }
              tabs={['Links', 'Sources', 'Audit']}
              activeTab="Links"
              onSelectTab={(t) => recordIntent('F108:tab:' + t)}
              onMore={() => recordIntent('F108:more')}
            >
              {mode === 'open' ? (
                <>
                  <div className="sp-sec">
                    <h4>
                      Requirements<span>3</span>
                    </h4>
                    {REVIEW_PROPOSAL.links.map((l) => (
                      <InspectorRow key={l.id} id={l.id} name={l.t} sub={l.sub} pill={l.p} />
                    ))}
                  </div>
                  <div className="sp-sec">
                    <h4>
                      Tests, tasks and tickets<span>5</span>
                    </h4>
                    {REVIEW_PROPOSAL.affected.map((l) => (
                      <InspectorRow key={l.id} id={l.id} name={l.t} sub={l.sub} pill={l.p} />
                    ))}
                  </div>
                  <div className="sp-ready">
                    <div className="t">
                      If you accept<span className="pill acc">Scope: spec</span>
                    </div>
                    <p>
                      Creates r15 and one audit entry. 3 linked items are marked Needs review and 1 ticket is proposed to S15.
                      Frames, code and the plan do not change.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="sp-sec">
                    <h4>
                      Revisions<span>{mode === 'accepted' ? 2 : 1}</span>
                    </h4>
                    <div className="rev-revs">
                      {mode === 'accepted' ? (
                        <div className="rev-rv cur">
                          <span className="id">r15</span>
                          <span className="nm">
                            Current · from P-07<small>Parent r14 · 12:52</small>
                          </span>
                          <Pill tone="ok" label="Current" />
                        </div>
                      ) : null}
                      <div className={'rev-rv' + (mode === 'rejected' ? ' cur' : '')}>
                        <span className="id">r14</span>
                        <span className="nm">
                          {mode === 'accepted' ? 'Previous · evidence kept' : 'Current · unchanged'}
                          <small>Accepted 11:58 by Rina (sample)</small>
                        </span>
                        <Pill tone={mode === 'accepted' ? 'mute' : 'ok'} label={mode === 'accepted' ? 'Readable' : 'Current'} />
                      </div>
                    </div>
                  </div>
                  <div className="sp-sec">
                    <h4>
                      Linked items<span>5</span>
                    </h4>
                    {REVIEW_PROPOSAL.affected.map((l) => (
                      <InspectorRow
                        key={l.id}
                        id={l.id}
                        name={l.t}
                        sub={l.sub}
                        pill={
                          mode === 'rejected'
                            ? ['mute', 'Not changed']
                            : mode === 'accepted' && l.id === 'T-219'
                              ? ['ok', 'Added to S15']
                              : l.p
                        }
                      />
                    ))}
                  </div>
                  <div className="sp-sec">
                    <h4>
                      Audit<span>1</span>
                    </h4>
                    <div className="rev-au">
                      <code>{REVIEW_PROPOSAL.audit[mode].id}</code>
                      <span>{REVIEW_PROPOSAL.audit[mode].at} · Rina (sample)</span>
                      <span className="full">
                        {REVIEW_PROPOSAL.audit[mode].text}
                        {mode === 'accepted' ? ' · snapshot ' + REVIEW_PROPOSAL.accepted.snapshot : ''}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </Inspector>
          </div>
        </section>
      </>
    );
  }

  // ---- Frame review states: pins, hover, stale
  const hov = state === 'hover' ? 4 : state === 'stale' ? 'open' : 0;
  const nit4 = REVIEW_NITS[3]!;
  const extras: Partial<Record<string, React.ReactNode>> = {};
  if (state === 'hover') {
    extras.head = (
      <>
        <i className="rev-out" />
        <div className="rev-tip" role="tooltip">
          <b>4 · Table header</b>
          <span>{nit4.tip}</span>
          <div className="ba">
            <s>{nit4.before}</s>
            <Icon name="chevR" size={12} />
            <b>{nit4.after}</b>
          </div>
        </div>
      </>
    );
  } else if (state === 'stale') {
    extras.f3 = (
      <>
        <i className="rev-out ghost" />
        <span className="rev-was">Nitpick saw {STALE_NIT.seen}</span>
      </>
    );
  }

  return (
    <>
      <ChatPanel
        title="Design chat"
        sub="F-03 draft r7"
        ctxItems={[
          ['frame', 'F-03 Variance table', 'r7 draft'],
          ['doc', 'DESIGN.md', 'r3'],
          ['req', 'R-DASH-014', 'r14'],
        ]}
        ctxFoot="F-03 draft r7 and the items listed"
        placeholder="Ask for a change to F-03, or @ another frame…"
        draft={draft}
        model={MODEL}
        onResize={() => {}}
        onHistory={() => recordIntent('F114:history')}
        onNewChat={() => setDraft('')}
        onCollapse={() => recordIntent('F114:collapse')}
        onRemoveCtx={(n) => recordIntent('F106:rm:' + n)}
        onAddCtx={() => recordIntent('F106:add')}
        onDraftChange={setDraft}
        onAttach={() => recordIntent('F114:attach')}
        onMention={() => recordIntent('F106:mention')}
        onOpenModel={() => recordIntent('F107:model')}
        onSend={() => recordIntent('F114:send')}
      >
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>Sonnet 5.5 · 41 s · 26 cr</em>
          </div>
          <p>
            Reviewed F-03: <b>7 changes</b> in draft r7.
          </p>
          <div className="rev-rc" data-feature="F242">
            <div className="rev-rh">
              <Icon name="comment" size={12} />
              Review · F-03 Variance table
              <Pill tone="warn" label="Draft r7" />
            </div>
            {REVIEW_NITS.map((n) => (
              <div
                key={n.n}
                className={['rev-rr', n.stale ? 'stale' : '', hov === n.n ? 'hov' : ''].filter(Boolean).join(' ')}
              >
                <span className="pn">{n.n}</span>
                <button
                  type="button"
                  className="rb"
                  data-does={`Rests the pointer on change ${n.n}: only its pin stays solid and the part is outlined; a click keeps it isolated`}
                  data-feature="F243"
                  onMouseEnter={() => {
                    if (n.n === 4) setState('hover');
                  }}
                  onClick={() => {
                    if (n.stale) setState('stale');
                    else if (n.n === 4) setState('hover');
                    else setState('pins');
                  }}
                >
                  <span className="nm">
                    <b>{n.el}</b>
                    <small>{n.what}</small>
                  </span>
                </button>
                <span className="st">
                  {n.stale ? (
                    <Pill tone="warn" label="Stale" />
                  ) : hov === n.n ? (
                    <IconBtn
                      icon="undo"
                      label="Undo this change"
                      does={'Puts back only change ' + n.n + '; the other changes stay'}
                      sm
                      feature="F246"
                      onClick={() => recordIntent('F246:undo-' + n.n)}
                    />
                  ) : (
                    <Icon name="check" size={14} />
                  )}
                </span>
                {n.stale && hov === 'open' ? (
                  <div className="rev-rs">
                    <p>Shown as the part was before it changed.</p>
                    <div className="cmp">
                      <span>Nitpick saw</span>
                      <s>{STALE_NIT.seen}</s>
                      <span>Part now</span>
                      <b>{STALE_NIT.now}</b>
                    </div>
                    <div className="acts">
                      <RevBtn
                        cls="ink"
                        does="Evaluates this nitpick again against the part as it is now; the row returns ready or stays flagged"
                        feature="F245"
                        onClick={() => recordIntent('F245:recheck')}
                      >
                        Re-check
                      </RevBtn>
                      <RevBtn
                        does="Removes this row without applying it. Dismissing is not a pass and nothing is accepted for it"
                        feature="F245"
                        onClick={() => recordIntent('F245:dismiss')}
                      >
                        Dismiss
                      </RevBtn>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
            <div className="rev-rf">
              <div className="c">
                <b>{REVIEW_NITS.length} changes</b> · <em>1 needs a look</em>
              </div>
              <div className="acts">
                <RevBtn
                  does="Undoes the whole review: all 7 changes go back to F-03 r6 in one step"
                  feature="F246"
                  onClick={() => recordIntent('F246:undo-all')}
                >
                  Undo all
                </RevBtn>
                <RevBtn
                  does="While held, shows the original F-03 r6 in place; release to return to the draft"
                  feature="F247"
                  onClick={() => recordIntent('F247:compare')}
                >
                  Compare <span className="rev-kbd">O</span>
                </RevBtn>
                <span className="sp-fill" />
                <RevBtn
                  cls="ink"
                  does="Accepts the 6 ready changes as F-03 r7. The stale item stays out until it is re-checked or dismissed"
                  feature="F247"
                  onClick={() => recordIntent('F247:accept-6')}
                >
                  Accept {READY_COUNT} <span className="rev-kbd">↵</span>
                </RevBtn>
              </div>
            </div>
          </div>
        </div>
        {state !== 'stale' ? (
          <div className="sp-sugg">
            <button
              type="button"
              data-does="Puts this prompt in the composer; nothing runs until Send"
              data-feature="F114"
              onClick={() => setDraft('Apply the header fix to F-04 (separate review)')}
            >
              <Icon name="spark" size={13} />
              Apply the header fix to F-04 (separate review)
            </button>
          </div>
        ) : null}
      </ChatPanel>

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={DESIGN_TABS}
          activeTab="Variance flows"
          onSelect={(n) => recordIntent('F104:tab:' + n)}
          onClose={(n) => recordIntent('F104:close:' + n)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={right}
        />
        <div className="sp-tool">
          <ViewSwitch current="Canvas" onChange={(v) => recordIntent('F104:view:' + v)} />
          <span className="sp-crumb">
            Design
            <Icon name="chevR" size={12} />
            <b>F-03 Variance table</b>
          </span>
          <span className="sp-fill" />
          <IconBtn icon="undo" label="Undo" does="Undoes the last draft edit on this board" sm feature="F116" onClick={() => recordIntent('F116:undo')} />
          <IconBtn icon="redo" label="Redo" does="Redoes the last undone draft edit" sm feature="F116" onClick={() => recordIntent('F116:redo')} />
          <IconBtn icon="history" label="Revisions" does="Opens the revision list of the selected artifact" sm feature="F108" onClick={() => recordIntent('F108:revisions')} />
        </div>
        <div className="sp-work">
          <div className="sp-cv" aria-label="Board: Variance flows">
            <div className="sp-cvt">
              Variance flows<span>F-03 at 100%</span>
            </div>
            <FrameAbs rev="r7" st={['warn', 'Draft · not accepted']}>
              <F03Table
                val={F03_AFTER}
                pins={PINS}
                stalePin={5}
                hoverPin={state === 'hover' ? 4 : undefined}
                extras={extras}
              />
            </FrameAbs>
            <ReviewCanvasPalette
              tool="comment"
              ask={false}
              feature="F241"
              onTool={(t) => recordIntent('F241:tool:' + t)}
              onToggleAsk={() => recordIntent('F241:ask')}
              onZoom={(z) => recordIntent('F241:zoom:' + z)}
            />
          </div>
          <Inspector
            title="F-03 Variance table"
            pill={['warn', 'Draft r7']}
            sub="Review of 7 changes · base r6 accepted"
            tabs={['Review', 'Revisions', 'Links']}
            activeTab="Review"
            onSelectTab={(t) => recordIntent('F108:tab:' + t)}
            onMore={() => recordIntent('F108:more')}
          >
            <div className="sp-sec">
              <h4>
                Revisions<span>2</span>
              </h4>
              <div className="rev-revs">
                <div className="rev-rv cur">
                  <span className="id">r7</span>
                  <span className="nm">
                    Draft · this review<small>7 changes · 1 stale · 12:51</small>
                  </span>
                  <Pill tone="warn" label="Draft" />
                </div>
                <div className="rev-rv">
                  <span className="id">r6</span>
                  <span className="nm">
                    Accepted · base<small>Accepted 12:12 by Rina (sample)</small>
                  </span>
                  <Pill tone="ok" label="Accepted" />
                </div>
              </div>
            </div>
            <div className="sp-sec">
              <h4>
                Spec impact<span>1 proposal</span>
              </h4>
              <InspectorRow
                id="P-07"
                name="Spec proposal r14 to r15"
                sub="From item 6 and chat · waits in S08"
                pill={['acc', 'Proposal']}
              />
            </div>
            <div className="sp-ready">
              <div className="t">
                Accepting this review<span className="pill mute">F-03 only</span>
              </div>
              <p>
                Accept creates F-03 r7 from the changes you kept. Dismissed rows stay out and no other frame changes. Spec
                changes go through S08.
              </p>
              <Btn
                label="Open spec proposal"
                cls="ink"
                sm
                does="Opens S08 with proposal P-07 (r14 to r15); opening it accepts nothing"
                feature="F249"
                onClick={() => setState('diff')}
              />
            </div>
          </Inspector>
        </div>
      </section>
    </>
  );
}
