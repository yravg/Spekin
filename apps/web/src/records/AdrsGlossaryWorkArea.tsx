import { Fragment, useState } from 'react';
import {
  sampleData,
  type ContextItem,
  type SampleAdrRow,
  type SampleGlossaryTerm,
} from '../data/source';
import { useWorkspace } from '../state/workspace';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { Btn, IconBtn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

const { MODEL, GAPB_TERMS, GAPB_ADRS, GAPB_ADR3, GAPB_PROPOSAL } = sampleData;

export const RECORDS_VIEWS = ['glossary', 'adrs', 'propose', 'contradiction', 'stale'] as const;
export type RecordsView = (typeof RECORDS_VIEWS)[number];

export function isRecordsView(v: string | null): v is RecordsView {
  return v !== null && (RECORDS_VIEWS as readonly string[]).includes(v);
}

export function nextViewFromPrompt(text: string): RecordsView | null {
  const q = text.trim().toLowerCase();
  if (!q) return null;
  if (q.includes('threshold') && (q.includes('row') || q.includes('most'))) return 'contradiction';
  if (q.includes('accept') && q.includes('adr')) return 'stale';
  if (q.includes('eac') || q.includes('forecast')) return 'propose';
  if (q.includes('integer') || q.includes('minor') || q.includes('adr')) return 'adrs';
  return null;
}

const CTX_RECORDS: ContextItem[] = [
  ['doc', 'Glossary', 'r14'],
  ['doc', 'ADR-003', 'r12'],
  ['req', 'R-DASH-014', 'r14'],
];

const RECORDS_TABS: ArtifactTabItem[] = [
  { icon: 'doc', name: 'Glossary' },
  { icon: 'doc', name: 'ADRs' },
  { icon: 'diff', name: 'Proposal P-33' },
  { icon: 'doc', name: 'Spec' },
];

function AdrRow({
  adr,
  current,
  onSelect,
}: {
  adr: SampleAdrRow;
  current: boolean;
  onSelect?: () => void;
}) {
  const dim = adr.st[1].startsWith('Superseded');
  return (
    <div
      className={'gpb-item' + (current ? ' cur' : '') + (dim ? ' dim' : '')}
      onClick={onSelect}
    >
      <span className="id">{adr.id}</span>
      <span className="nm">
        <span className="t">{adr.t}</span>
        <small>
          {adr.rev} · {adr.link}
        </small>
      </span>
      <Pill tone={adr.st[0]} label={adr.st[1]} />
    </div>
  );
}

function GlossaryTable({
  terms,
  selectedTerm,
  onSelect,
}: {
  terms: SampleGlossaryTerm[];
  selectedTerm: string;
  onSelect: (term: string) => void;
}) {
  return (
    <div className="gpb-card" data-feature="F461" style={{ padding: 0 }}>
      <table className="sp-tbl gpb-tbl">
        <thead>
          <tr>
            <th>Term</th>
            <th>Aliases</th>
            <th>Bounded context</th>
            <th>Meaning</th>
            <th>Rev</th>
          </tr>
        </thead>
        <tbody>
          {terms.map((t) => (
            <tr
              key={t.term}
              className={t.term === selectedTerm ? 'gpb-sel' : undefined}
              onClick={() => onSelect(t.term)}
            >
              <td>
                <span className="id">{t.term}</span>
                <small>{t.id}</small>
              </td>
              <td>{t.al}</td>
              <td>{t.ctx}</td>
              <td>{t.def}</td>
              <td className="mono">{t.rev}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// S19 ADRs and glossary (boards-gap-b.mjs, IMP-59).
export function AdrsGlossaryWorkArea(props: {
  view: RecordsView;
  onView: (next: RecordsView) => void;
  onOpenSpec?: () => void;
  onIntent: (id: string) => void;
}) {
  const { view, onView, onOpenSpec, onIntent } = props;
  const stageView = useWorkspace((s) => s.view('spec'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);

  const [selectedTerm, setSelectedTerm] = useState<string>('Forecast');
  const [selectedAdrId, setSelectedAdrId] = useState<string>(GAPB_ADRS[0]?.id ?? 'ADR-003');
  const [hunk1, setHunk1] = useState<'accept' | 'reject'>('accept');
  const [hunk2, setHunk2] = useState<'accept' | 'reject'>('reject');

  const ctxItems = CTX_RECORDS.filter(([, name]) => !stageView.removedCtx.includes(name));
  const activeTab =
    view === 'adrs' ? 'ADRs' : view === 'propose' || view === 'stale' ? 'Proposal P-33' : 'Glossary';
  const switchCur: 'Glossary' | 'ADRs' = view === 'adrs' || view === 'stale' ? 'ADRs' : 'Glossary';
  const crumb =
    view === 'adrs'
      ? 'ADRs'
      : view === 'propose'
        ? 'Proposal P-33'
        : view === 'stale'
          ? 'Proposal P-34'
          : 'Glossary';

  const currentTerm = GAPB_TERMS.find((t) => t.term === selectedTerm) ?? GAPB_TERMS[0]!;
  const currentAdr = GAPB_ADRS.find((a) => a.id === selectedAdrId) ?? GAPB_ADRS[0]!;

  function handleSend() {
    const next = nextViewFromPrompt(stageView.draft);
    if (next) {
      setView('spec', { draft: '' });
      onView(next);
    } else {
      onIntent('F114:send');
    }
  }

  function handleSelectTab(name: string) {
    if (name === 'Glossary') onView('glossary');
    else if (name === 'ADRs') onView('adrs');
    else if (name === 'Proposal P-33') onView('propose');
    else if (name === 'Spec' && onOpenSpec) onOpenSpec();
    else onIntent('F104:tab:' + name);
  }

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Spec chat"
          sub="Expert layer"
          ctxItems={ctxItems}
          ctxFoot="≈ 4.8k tokens · records by id, not full text"
          placeholder="Ask about a term or a decision…"
          draft={stageView.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => onIntent('F114:history')}
          onNewChat={() => setView('spec', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) =>
            setView('spec', {
              removedCtx: stageView.removedCtx.includes(name)
                ? stageView.removedCtx
                : [...stageView.removedCtx, name],
            })
          }
          onAddCtx={() => onIntent('F106:add')}
          onDraftChange={(draft) => setView('spec', { draft })}
          onAttach={() => onIntent('F114:attach')}
          onMention={() => onIntent('F106:mention')}
          onOpenModel={() => onIntent('F107:model')}
          onSend={handleSend}
        >
          {view === 'glossary' ? (
            <>
              <div className="sp-ub">What does forecast mean here?</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 5 s · 2 cr</em>
                </div>
                <p>
                  <b>Forecast</b> (Perkiraan) is the latest estimate of what a package will cost when
                  finished. GLO-02, accepted r10.
                </p>
              </div>
              <div className="sp-sugg">
                <button
                  type="button"
                  data-does="Puts this prompt in the composer; nothing runs until Send"
                  data-feature="F465"
                  onClick={() => setView('spec', { draft: 'Is forecast the same as EAC?' })}
                >
                  <Icon name="spark" size={13} />
                  Is forecast the same as EAC?
                </button>
              </div>
            </>
          ) : view === 'adrs' ? (
            <>
              <div className="sp-ub">Why integer minor units?</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 6 s · 3 cr</em>
                </div>
                <p>
                  ADR-003: summing rounded values drifted by 0.02 USD m. Linked to <b>PRN-1</b> and
                  R-DASH-014.
                </p>
              </div>
            </>
          ) : view === 'propose' ? (
            <>
              <div className="sp-ub">
                Is forecast the same as EAC? And should thresholds be per package?
              </div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 19 s · 11 cr</em>
                </div>
                <p>
                  Yes for EAC: I proposed it as an alias. Per-package thresholds are a
                  hard-to-reverse trade-off, so I drafted an ADR. Both are in <b>P-33</b>, not in
                  the glossary.
                </p>
                <div className="sp-gg" data-feature="F465">
                  <div className="gh">
                    <span>Proposal P-33 · 2 hunks</span>
                    <button
                      type="button"
                      data-does="Shows the hunks as a plain table"
                      data-feature="F465"
                      onClick={() => onIntent('F465:table')}
                    >
                      Show as table
                    </button>
                  </div>
                  <div className="sp-gc prop">
                    <div className="k">
                      <Icon name="diff" size={12} />
                      Glossary and ADR
                      <span className="tag">
                        <Pill tone="acc" label="Proposal" />
                      </span>
                    </div>
                    <div className="tt">Alias EAC · ADR-005</div>
                    <div className="bd">Source: message 4. Base r14.</div>
                    <div className="ft">
                      <span className="s">Not in spec</span>
                      <Btn
                        label="Open P-33"
                        sm
                        cls="ink"
                        does="Opens the proposal with both hunks"
                        feature="F465"
                        onClick={() => onView('propose')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : view === 'contradiction' ? (
            <>
              <div className="sp-ub">Let&apos;s say &quot;threshold&quot; means the most rows we show.</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 8 s · 4 cr</em>
                </div>
                <p>
                  That clashes with <b>GLO-05</b>, where a threshold is a percent over budget. I
                  changed nothing. Pick one of the options.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="sp-ub">Accept the ADR for per-package thresholds.</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 4 s · 1 cr</em>
                </div>
                <p>
                  I can not accept it yet. The spec moved to <b>r15</b> since the proposal was made.
                  Rebase it first.
                </p>
              </div>
            </>
          )}
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={RECORDS_TABS}
          activeTab={activeTab}
          onSelect={handleSelectTab}
          onClose={(name) => onIntent('F104:close:' + name)}
          onOpenArtifact={() => onIntent('F104:open')}
          right={
            <Btn
              label="Propose change"
              cls="ink"
              icon="diff"
              does="Starts a Proposal for a term or ADR; accepted records change only through S08, never by an inline write"
              feature="F465"
              onClick={() => onView(view === 'adrs' ? 'stale' : 'propose')}
            />
          }
        />

        <div className="sp-tool">
          <div className="sp-seg" role="group" aria-label="Record type" data-feature="F461">
            <button
              type="button"
              aria-pressed={switchCur === 'Glossary'}
              data-does="Shows the glossary of domain terms of Meranti Yard"
              data-feature="F461"
              onClick={() => onView('glossary')}
            >
              Glossary
            </button>
            <button
              type="button"
              aria-pressed={switchCur === 'ADRs'}
              data-does="Shows the architecture decision records of Meranti Yard"
              data-feature="F463"
              onClick={() => onView('adrs')}
            >
              ADRs
            </button>
          </div>
          <span className="sp-crumb">
            Expert layer
            <Icon name="chevR" size={12} />
            <b>{crumb}</b>
          </span>
          <span className="sp-fill" />
          <Btn
            label="Check contradictions"
            sm
            icon="search"
            does="Checks every term and ADR against each other and lists contradictions; nothing is changed"
            feature="F467"
            onClick={() => onView('contradiction')}
          />
          <IconBtn
            icon="undo"
            label="Undo"
            does="Undoes the last draft edit in this tab"
            sm
            feature="F461"
            onClick={() => onIntent('F461:undo')}
          />
          <IconBtn
            icon="redo"
            label="Redo"
            does="Redoes the last undone draft edit"
            sm
            feature="F461"
            onClick={() => onIntent('F461:redo')}
          />
          <IconBtn
            icon="history"
            label="Revisions"
            does="Opens S09 revision history for this document"
            sm
            feature="F461"
            onClick={() => onIntent('F461:revisions')}
          />
        </div>

        {view === 'glossary' ? (
          <div className="gpb-page">
            <div className="gpb-head">
              <h2>Glossary</h2>
              <Pill tone="ok" label="5 terms · accepted r14" />
              <span className="gpb-meta">Bahasa and English, domain meaning only</span>
            </div>
            <GlossaryTable
              terms={GAPB_TERMS}
              selectedTerm={currentTerm.term}
              onSelect={setSelectedTerm}
            />
            <div className="gpb-card" data-feature="F462">
              <div className="h">
                <Icon name="doc" size={14} />
                {currentTerm.term} · {currentTerm.id}
                <span>
                  {currentTerm.term === 'Forecast'
                    ? 'GLO-02 · meaning only, no field names or code'
                    : currentTerm.rev + ' · meaning only, no field names or code'}
                </span>
                <span className="sp-fill" />
                <Btn
                  label="Propose alias"
                  sm
                  does="Drafts a Proposal that adds an alias to GLO-02; the glossary stays r14"
                  feature="F462"
                  onClick={() => onView('propose')}
                />
              </div>
              <dl className="gpb-kvs">
                <dt>Aliases</dt>
                <dd>{currentTerm.al}</dd>
                <dt>Context</dt>
                <dd>
                  {currentTerm.term === 'Forecast'
                    ? 'Cost control only. In Alerts, "limit" is used instead.'
                    : currentTerm.ctx + ' — ' + currentTerm.def}
                </dd>
              </dl>
            </div>
          </div>
        ) : view === 'adrs' ? (
          <div className="gpb-page">
            <div className="gpb-head">
              <h2>Architecture decision records</h2>
              <span className="gpb-meta">Only hard-to-reverse trade-offs · 5 records</span>
            </div>
            <div className="gpb-two l">
              <div className="gpb-card" data-feature="F463">
                <div className="h">
                  <Icon name="list" size={14} />
                  Records
                </div>
                <div className="gpb-list">
                  {GAPB_ADRS.map((a) => (
                    <AdrRow
                      key={a.id}
                      adr={a}
                      current={a.id === currentAdr.id}
                      onSelect={() => setSelectedAdrId(a.id)}
                    />
                  ))}
                </div>
              </div>
              <div className="gpb-col">
                <div className="gpb-card">
                  <div className="h">
                    {currentAdr.id} ·{' '}
                    <Pill
                      tone={currentAdr.st[0]}
                      label={
                        currentAdr.id === 'ADR-003'
                          ? 'Accepted r12'
                          : currentAdr.st[1] + ' · ' + currentAdr.rev
                      }
                    />
                    <span className="sp-fill" />
                    <span className="gpb-chip">
                      {currentAdr.id === 'ADR-003' ? 'R-DASH-014' : currentAdr.link}
                    </span>
                    {currentAdr.id === 'ADR-003' ? (
                      <span className="gpb-chip">PRN-1</span>
                    ) : null}
                  </div>
                  {currentAdr.id === 'ADR-003' ? (
                    <dl className="gpb-kvs">
                      <dt>Context</dt>
                      <dd>{GAPB_ADR3.ctx}</dd>
                      <dt>Alternatives</dt>
                      <dd>
                        {GAPB_ADR3.alts.map((alt, idx) => (
                          <Fragment key={alt}>
                            {idx > 0 ? <br /> : null}
                            {alt}
                          </Fragment>
                        ))}
                      </dd>
                      <dt>Decision</dt>
                      <dd>{GAPB_ADR3.decision}</dd>
                      <dt>Consequences</dt>
                      <dd>{GAPB_ADR3.cons}</dd>
                    </dl>
                  ) : (
                    <dl className="gpb-kvs">
                      <dt>Decision</dt>
                      <dd>{currentAdr.t}</dd>
                      <dt>Revision</dt>
                      <dd>{currentAdr.rev}</dd>
                      <dt>Linked</dt>
                      <dd>{currentAdr.link}</dd>
                    </dl>
                  )}
                </div>
                <div className="gpb-card" data-feature="F464">
                  <div className="h">
                    <Icon name="link" size={14} />
                    Supersession
                  </div>
                  <div className="gpb-chain">
                    <span className="gpb-chip">ADR-002 · Superseded</span>
                    <span className="ar">
                      <Icon name="chevR" size={12} />
                    </span>
                    <span className="gpb-chip">ADR-006 · Accepted r11</span>
                    <span className="ap-gpb-hint">The earlier record stays readable.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : view === 'propose' ? (
          <div className="gpb-page">
            <div className="gpb-head">
              <h2>Proposal P-33</h2>
              <Pill tone="acc" label="Base r14" />
              <span className="gpb-meta">2 hunks · from the chat, nothing is written yet</span>
            </div>
            <div className="gpb-card" data-feature="F465">
              <dl className="gpb-kvs">
                <dt>Source</dt>
                <dd>{GAPB_PROPOSAL.src}</dd>
                <dt>Affects</dt>
                <dd>
                  {GAPB_PROPOSAL.affects.map((x, idx) => (
                    <Fragment key={x}>
                      {idx > 0 ? ' ' : null}
                      <span className="gpb-chip">{x}</span>
                    </Fragment>
                  ))}
                </dd>
                <dt>Base revision</dt>
                <dd>{GAPB_PROPOSAL.base} · current</dd>
              </dl>
            </div>
            <div className="gpb-hunk" data-feature="F466">
              <div className="hh">
                <Icon name="doc" size={12} />
                GLO-02 Forecast · aliases
                <span className="sp-fill" />
                <Pill
                  tone={hunk1 === 'accept' ? 'ok' : 'mute'}
                  label={hunk1 === 'accept' ? 'Will accept' : 'Left out'}
                />
              </div>
              <div className="hb">
                Aliases: <del>cost-to-complete</del> <ins>EAC, cost-to-complete</ins>
              </div>
              <div className="hf">
                <Btn
                  label="Accept hunk"
                  sm
                  cls={hunk1 === 'accept' ? 'ink' : 'ghost'}
                  does="Marks only this hunk for the new revision; the code is not renamed"
                  feature="F466"
                  onClick={() => setHunk1('accept')}
                />
                <Btn
                  label="Reject"
                  sm
                  does="Leaves this hunk out of the revision"
                  feature="F466"
                  onClick={() => setHunk1('reject')}
                />
              </div>
            </div>
            <div className="gpb-hunk">
              <div className="hh">
                <Icon name="doc" size={12} />
                ADR-005 · new record, Proposed
                <span className="sp-fill" />
                <Pill
                  tone={hunk2 === 'accept' ? 'ok' : 'mute'}
                  label={hunk2 === 'accept' ? 'Will accept' : 'Left out'}
                />
              </div>
              <div className="hb">
                <ins>Thresholds are per package, with a project default.</ins> Alternatives: one
                global value; per user. Consequence: harder to change later, because stored alerts
                keep their threshold.
              </div>
              <div className="hf">
                <Btn
                  label="Accept hunk"
                  sm
                  cls={hunk2 === 'accept' ? 'ink' : 'ghost'}
                  does="Marks this ADR hunk for the new revision"
                  feature="F466"
                  onClick={() => setHunk2('accept')}
                />
                <Btn
                  label="Reject"
                  sm
                  does="Leaves this ADR out; it can be proposed again later"
                  feature="F466"
                  onClick={() => setHunk2('reject')}
                />
              </div>
            </div>
            <div className="gpb-card" data-feature="F469">
              <div className="h">
                <Icon name="check" size={14} />
                Routine choice, no ADR
                <span>column order in the variance table</span>
              </div>
              <p className="ap-gpb-hint">
                Easy to reverse and not surprising, so Spekin did not ask for a record.
              </p>
            </div>
          </div>
        ) : view === 'contradiction' ? (
          <div className="gpb-page">
            <div className="gpb-head">
              <h2>Glossary</h2>
              <Pill tone="warn" label="1 contradiction" />
              <span className="gpb-meta">Checked against 5 terms and 5 ADRs</span>
            </div>
            <GlossaryTable
              terms={GAPB_TERMS}
              selectedTerm="Threshold"
              onSelect={setSelectedTerm}
            />
            <div className="gpb-card warn" data-feature="F467">
              <div className="h">
                <Icon name="alert" size={14} />
                Contradiction with GLO-05 Threshold
              </div>
              <p>
                Your new meaning is &quot;the most rows shown&quot;. GLO-05 says a threshold is the
                percent over budget that flags a package.
              </p>
              <div className="gpb-act">
                <Btn
                  label="Keep GLO-05"
                  sm
                  cls="ink"
                  does="Drops the new meaning; the glossary stays as it is"
                  feature="F467"
                  onClick={() => onView('glossary')}
                />
                <Btn
                  label="Propose a new term"
                  sm
                  does='Drafts a Proposal for a separate term such as "Row limit" in the Display context'
                  feature="F467"
                  onClick={() => onView('propose')}
                />
                <Btn
                  label="Propose a change to GLO-05"
                  sm
                  does="Drafts a Proposal that edits GLO-05 and lists every requirement that uses it"
                  feature="F467"
                  onClick={() => onView('propose')}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="gpb-page">
            <div className="gpb-head">
              <h2>Proposal P-34</h2>
              <Pill tone="bad" label="Stale" />
              <span className="gpb-meta">ADR-007 · base r14 · spec is now r15</span>
            </div>
            <div className="gpb-card" data-feature="F468">
              <div className="h">
                <Icon name="lock" size={14} />
                Accept is blocked until you rebase
              </div>
              <p>
                Another Proposal changed R-DASH-017 in r15. This ADR cites it, so the base must be
                refreshed first.
              </p>
              <div className="gpb-act">
                <button
                  type="button"
                  className="sp-btn ink sm"
                  disabled
                  aria-disabled="true"
                  data-does="Accept is unavailable while the base is r14 and the spec is r15; rebase first"
                  data-feature="F468"
                >
                  Accept
                </button>
                <Btn
                  label="Rebase on r15"
                  sm
                  cls="ink"
                  does="Re-reads the ADR against r15 and shows what changed; nothing is accepted"
                  feature="F468"
                  onClick={() => onView('propose')}
                />
                <Btn
                  label="Discard"
                  sm
                  does="Drops this proposal; the earlier records are untouched"
                  feature="F468"
                  onClick={() => onView('adrs')}
                />
              </div>
            </div>
            <div className="gpb-card" data-feature="F464">
              <div className="h">
                <Icon name="link" size={14} />
                The earlier record is still readable
              </div>
              {GAPB_ADRS.slice(3, 5).map((a) => (
                <AdrRow key={a.id} adr={a} current={false} />
              ))}
              <div className="gpb-chain">
                <span className="gpb-chip">ADR-002</span>
                <span className="ar">
                  <Icon name="chevR" size={12} />
                </span>
                <span className="gpb-chip">ADR-006</span>
                <span className="ar">
                  <Icon name="chevR" size={12} />
                </span>
                <span className="gpb-chip">ADR-007 proposed</span>
              </div>
            </div>
            <p className="gpb-sub">No code is renamed by any of these records.</p>
          </div>
        )}
      </section>
    </>
  );
}
