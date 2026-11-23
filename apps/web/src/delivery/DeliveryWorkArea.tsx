import { useState } from 'react';
import { SAMPLE_PROJECT_ID, sampleData, type ContextItem, type PillTuple, type PillTone, type SampleDeliveryCheck, type SampleDeliveryContract, type SampleDeliveryTimelineRow, type StageId } from '../data/source';
import { useData, useDataRead } from '../data/provider';
const { BACKEND, DELIVERY_BUILD, DELIVERY_CHECKS, DELIVERY_GATE, DELIVERY_MATRIX, DELIVERY_RUN, DELIVERY_TIMELINE, MODEL, STAGES } = sampleData;
import { useWorkspace } from '../state/workspace';
import { Icon, type IconName } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';

// S37 Build contracts and release readiness. Board: docs/design/spekin-canvas/project/S37-build-contracts.dc.html
// Six drawn views: contracts, detail, matrix, gate, fail, evidence. Data comes from the sample surface (DELIVERY_*).
export type DeliveryView = 'contracts' | 'detail' | 'matrix' | 'gate' | 'fail' | 'evidence';

export const DELIVERY_VIEWS: { id: DeliveryView; label: string; icon: IconName }[] = [
  { id: 'contracts', label: 'Contracts', icon: 'server' },
  { id: 'detail', label: 'Contract detail', icon: 'server' },
  { id: 'matrix', label: 'Readiness matrix', icon: 'grid' },
  { id: 'gate', label: 'Release gate blocked', icon: 'flag' },
  { id: 'fail', label: 'Run failure', icon: 'alert' },
  { id: 'evidence', label: 'Evidence pack', icon: 'doc' },
];

export function isDeliveryView(value: string | null): value is DeliveryView {
  return DELIVERY_VIEWS.some((v) => v.id === value);
}

// Each view belongs to one stage on the board; switching a view moves to the stage that owns it.
const VIEW_STAGE: Record<DeliveryView, StageId> = {
  contracts: 'backend',
  detail: 'backend',
  matrix: 'integration',
  fail: 'integration',
  gate: 'deploy',
  evidence: 'deploy',
};

export function deliveryViewStage(view: DeliveryView): StageId {
  return VIEW_STAGE[view];
}

// The view a stage opens first: Backend > Contracts, Integration > Readiness, Deployment > Release gate.
export function deliveryStageView(stage: StageId): DeliveryView {
  if (stage === 'integration') return 'matrix';
  if (stage === 'deploy') return 'gate';
  if (stage === 'backend') return 'contracts';
  return 'contracts';
}

// A check is passed only with evidence. A missing check shows as "not run", never as passed.
export function deliveryCheckOutcome(check: SampleDeliveryCheck): PillTuple {
  if (!check.ev && /^passed$/i.test(check.p.trim())) return ['mute', 'Not run'];
  return [check.k, check.p];
}

// An observation counts only when it is linked to the build it judged. Unlinked, unknown and stale stay apart from passed.
export function evidenceOutcome(row: SampleDeliveryTimelineRow): PillTuple {
  const [, , observed, pill, linked] = row;
  const unlinked = !linked || linked === 'none' || observed === 'none' || observed === 'no source';
  if (pill[1] === 'Passed' && unlinked) return ['mute', 'Not run'];
  return pill;
}

const CTX: Record<DeliveryView, ContextItem[]> = {
  contracts: [
    ['server', 'API contract · variance alerts', 'r2'],
    ['db', 'Entity VarianceAlert', 'r1'],
    ['req', 'R-DASH-014', 'r14'],
  ],
  detail: [
    ['server', 'API contract · variance alerts', 'r2'],
    ['db', 'Entity VarianceAlert', 'r1'],
    ['req', 'R-DASH-014', 'r14'],
  ],
  matrix: [
    ['server', 'API contract · variance alerts', 'r2'],
    ['doc', 'Run #38 log', 'b4a1f9c'],
    ['req', 'R-DASH-014', 'r14'],
  ],
  gate: [
    ['doc', 'Release checklist', 'r1'],
    ['doc', 'Build b4a1f9c', 'staging'],
    ['req', 'Spec', 'r14'],
  ],
  fail: [
    ['doc', 'Run #38 log', 'b4a1f9c'],
    ['server', 'API contract · variance alerts', 'r2'],
    ['db', 'Entity VarianceAlert', 'r1'],
  ],
  evidence: [
    ['doc', 'Release checklist', 'r1'],
    ['doc', 'Evidence pack RC-0003', 'b4a1f9c'],
  ],
};

interface DeliveryChatText {
  title: string;
  sub: string;
  ub: string;
  ai: string;
  sugg: [string, string];
}

const CHAT: Record<DeliveryView, DeliveryChatText> = {
  contracts: {
    title: 'Backend chat',
    sub: 'contracts',
    ub: 'Which contracts hold up the release?',
    ai: 'Four contracts are not accepted: the API contract needs review after r14, migration 0007 and the frontend tests are drafts, and the fixture contract is blocked by a failed run.',
    sugg: ['Open the API contract', 'Show only blocked contracts'],
  },
  detail: {
    title: 'Backend chat',
    sub: 'contract r2',
    ub: 'Check this contract against the new 3% threshold.',
    ai: 'The GET endpoint cites r13, so it still says 5%. POST acknowledge has no role, and no breaking-change check was recorded. Three of six checks pass.',
    sugg: ['Propose a fix for the role', 'Draft the missing diff check'],
  },
  matrix: {
    title: 'Integration chat',
    sub: 'readiness',
    ub: 'Where does the release stand across all eight stages?',
    ai: 'Two stages are ready, Design and Backend still need review, and Integration is blocked by one failed fixture run. Deployment waits on Testing.',
    sugg: ['Open the blocked run', 'Which stages lack evidence?'],
  },
  gate: {
    title: 'Deployment chat',
    sub: 'release gate',
    ub: 'Can we release build b4a1f9c?',
    ai: 'Not yet. Four checks block it: 7 criteria have no result, the table is 0.4 s over budget, there is no accessibility report for this build, and the auth rules are missing.',
    sugg: ['List what each reason needs', 'Draft tickets for all four'],
  },
  fail: {
    title: 'Integration chat',
    sub: 'run #38',
    ub: 'Why did the integration run fail?',
    ai: 'The fixture server returned variance_pct as text. That is a contract mismatch, not an environment problem. I can propose a contract fix for review.',
    sugg: ['Propose the contract fix', 'Show the redacted log'],
  },
  evidence: {
    title: 'Deployment chat',
    sub: 'evidence',
    ub: 'What evidence do we have for the release?',
    ai: 'One failed check, one job waiting, a stale staging deploy and no production observation. A green main build exists, but it is another commit, so it does not count.',
    sugg: ['Open the failed check', 'Propose tickets for the 3 gaps'],
  },
};

const TABS: Record<DeliveryView, ArtifactTabItem[]> = {
  contracts: [
    { icon: 'flag', name: 'Release readiness' },
    { icon: 'server', name: 'API contract · variance alerts' },
    { icon: 'db', name: 'Entity VarianceAlert' },
  ],
  detail: [
    { icon: 'server', name: 'API contract · variance alerts' },
    { icon: 'db', name: 'Entity VarianceAlert' },
    { icon: 'flag', name: 'Release readiness' },
  ],
  matrix: [
    { icon: 'flag', name: 'Release readiness' },
    { icon: 'server', name: 'API contract · variance alerts' },
  ],
  gate: [
    { icon: 'flag', name: 'Release readiness' },
    { icon: 'server', name: 'API contract · variance alerts' },
  ],
  fail: [
    { icon: 'flag', name: 'Release readiness' },
    { icon: 'doc', name: 'Run #38 · integration-contract' },
  ],
  evidence: [
    { icon: 'flag', name: 'Release readiness' },
    { icon: 'server', name: 'API contract · variance alerts' },
  ],
};

const ACTIVE_TAB: Record<DeliveryView, string> = {
  contracts: 'Release readiness',
  detail: 'API contract · variance alerts',
  matrix: 'Release readiness',
  gate: 'Release readiness',
  fail: 'Run #38 · integration-contract',
  evidence: 'Release readiness',
};

const CRUMB: Record<DeliveryView, string> = {
  contracts: 'Contracts',
  detail: 'API contract',
  matrix: 'All eight stages',
  gate: 'Release gate',
  fail: 'Run #38',
  evidence: 'RC-0003',
};

const SHARE_LATER = 'Share and comment links (deferred in the browser MVP, R-WS-3)';

const GLYPH: Record<PillTone, IconName | null> = { ok: 'check', warn: 'alert', bad: 'x', mute: null, acc: null, ink: null };

function Progress({ done, total }: { done: number; total: number }) {
  if (!total) return <span className="del-pg na">none</span>;
  return (
    <span className="del-pg">
      <i>
        <u style={{ width: Math.round((done / total) * 100) + '%' }} />
      </i>
      {done} of {total}
    </span>
  );
}

export function DeliveryWorkArea(props: {
  view: DeliveryView;
  onView: (view: DeliveryView) => void;
  onIntent: (intent: string) => void;
}) {
  const { view, onView, onIntent } = props;
  // IMP-37: the contracts table comes through the data door; sample mode is the drawn rows.
  const data = useData();
  const contracts = useDataRead(
    data.sample.DELIVERY_CONTRACTS,
    (source) => source.contracts(SAMPLE_PROJECT_ID),
    [],
  ).value;
  const stage = deliveryViewStage(view);
  const stageRow = STAGES.find((s) => s.id === stage)!;
  const chat = CHAT[view];

  const viewState = useWorkspace((s) => s.view(stage));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);

  const ctxItems = CTX[view].filter(([, name]) => !viewState.removedCtx.includes(name));
  const [kind, setKind] = useState<string>('All kinds');

  function selectTab(name: string) {
    if (name === 'Release readiness') onView(deliveryStageView(stage));
    else if (name === 'API contract · variance alerts') onView('detail');
    else if (name === 'Run #38 · integration-contract') onView('fail');
    else onIntent('F104:entity');
  }

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title={chat.title}
          sub={chat.sub}
          ctxItems={ctxItems}
          ctxFoot="≈ 5.4k tokens · secrets by name only"
          placeholder="Ask about a contract, a check or the release gate…"
          draft={viewState.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => onIntent('F114:history')}
          onNewChat={() => setView(stage, { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setView(stage, { removedCtx: [...viewState.removedCtx, name] })}
          onAddCtx={() => onIntent('F106:add')}
          onDraftChange={(draft) => setView(stage, { draft })}
          onAttach={() => onIntent('F114:attach')}
          onMention={() => onIntent('F106:mention')}
          onOpenModel={() => onIntent('F107:model')}
          onSend={() => onIntent('F114:send')}
        >
          <div className="sp-ub">{chat.ub}</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 17 s · 8 cr</em>
            </div>
            <p>{chat.ai}</p>
            <div className="sp-sugg">
              {chat.sugg.map((text) => (
                <button
                  key={text}
                  type="button"
                  data-does="Puts this prompt in the composer; nothing runs until Send"
                  data-feature="F316"
                  onClick={() => {
                    setView(stage, { draft: text });
                    onIntent('F316:suggest:' + text);
                  }}
                >
                  <Icon name="spark" size={13} />
                  {text}
                </button>
              ))}
            </div>
          </div>
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={TABS[view]}
          activeTab={ACTIVE_TAB[view]}
          onSelect={selectTab}
          onClose={(name) => onIntent('F104:close:' + name)}
          onOpenArtifact={() => onIntent('F104:open')}
          right={<Btn label="Share" icon="share" later={SHARE_LATER} />}
        />
        <div className="sp-tool">
          {view !== 'fail' ? (
            <div className="sp-seg" role="group" aria-label="Release readiness views" data-feature="F301">
              <button
                type="button"
                aria-pressed={view === 'contracts' || view === 'detail'}
                data-does="Shows contracts for the pinned build"
                data-feature="F301"
                onClick={() => onView('contracts')}
              >
                <Icon name="server" size={14} />
                Contracts
              </button>
              <button
                type="button"
                aria-pressed={view === 'matrix'}
                data-does="Shows readiness for the pinned build"
                data-feature="F305"
                onClick={() => onView('matrix')}
              >
                <Icon name="grid" size={14} />
                Readiness
              </button>
              <button
                type="button"
                aria-pressed={view === 'gate'}
                data-does="Shows release gate for the pinned build"
                data-feature="F307"
                onClick={() => onView('gate')}
              >
                <Icon name="flag" size={14} />
                Release gate
              </button>
              <button
                type="button"
                aria-pressed={view === 'evidence'}
                data-does="Shows evidence pack for the pinned build"
                data-feature="F312"
                onClick={() => onView('evidence')}
              >
                <Icon name="doc" size={14} />
                Evidence pack
              </button>
            </div>
          ) : null}
          <span className="sp-crumb">
            {stageRow.name}
            <Icon name="chevR" size={12} />
            <b>{CRUMB[view]}</b>
          </span>
          {view === 'fail' ? (
            <span className="del-chip warn">
              <Icon name="alert" size={14} />
              Failed {DELIVERY_RUN.at}
            </span>
          ) : null}
          <span className="sp-fill" />
          <span className="del-chip">
            <Icon name="lock" size={14} />
            Build <b>{DELIVERY_BUILD.commit}</b> · {DELIVERY_BUILD.env} · {DELIVERY_BUILD.at}
          </span>
          <span className="del-chip">
            <Icon name="eye" size={14} />
            Read-only view
          </span>
          {view !== 'fail' ? (
            <IconBtn
              icon="history"
              label="Revisions"
              does="Lists earlier readiness snapshots; each is pinned and never edited"
              sm
              feature="F312"
              onClick={() => onIntent('F312:revisions')}
            />
          ) : null}
        </div>

        {view === 'contracts' ? (
          <ContractsBody
            contracts={contracts}
            kind={kind}
            onKind={setKind}
            onView={onView}
            onIntent={onIntent}
          />
        ) : null}
        {view === 'detail' ? <DetailBody onView={onView} onIntent={onIntent} /> : null}
        {view === 'matrix' ? <MatrixBody onView={onView} onIntent={onIntent} /> : null}
        {view === 'gate' ? <GateBody onIntent={onIntent} onView={onView} /> : null}
        {view === 'fail' ? <FailBody onIntent={onIntent} /> : null}
        {view === 'evidence' ? <EvidenceBody onIntent={onIntent} /> : null}
      </section>
    </>
  );
}

// ---------------------------------------------------------------- contracts
function ContractsBody(props: {
  contracts: SampleDeliveryContract[];
  kind: string;
  onKind: (kind: string) => void;
  onView: (view: DeliveryView) => void;
  onIntent: (intent: string) => void;
}) {
  const { contracts, kind, onKind, onView, onIntent } = props;
  const kinds: [string, string][] = [
    ['All kinds', String(contracts.length)],
    ['API contract', String(contracts.filter((c) => c.kind === 'API contract').length)],
    ['Entity', String(contracts.filter((c) => c.kind === 'Entity').length)],
    ['Migration', String(contracts.filter((c) => c.kind === 'Migration').length)],
    ['Test definitions', String(contracts.filter((c) => c.kind === 'Test definitions').length)],
    ['Checklist', String(contracts.filter((c) => c.kind === 'Release checklist').length)],
  ];
  const rows = kind === 'All kinds' ? contracts : contracts.filter((c) => c.kind === kind || (kind === 'Checklist' && c.kind === 'Release checklist'));

  return (
    <div className="del-body">
      <div className="del-gate">
        <div className="del-sum4">
          <div>
            <span>Contracts</span>
            <b>8</b>
          </div>
          <div>
            <span>Accepted</span>
            <b>1</b>
          </div>
          <div className="warn">
            <span>Needs review or draft</span>
            <b>5</b>
          </div>
          <div className="bad">
            <span>Blocked</span>
            <b>1</b>
          </div>
        </div>
        <div className="del-meta">
          <div className="sp-seg" role="group" aria-label="Kind">
            {kinds.map(([label, n]) => (
              <button
                key={label}
                type="button"
                aria-pressed={kind === label}
                data-does={'Shows only ' + (label === 'All kinds' ? 'every kind' : label.toLowerCase())}
                data-feature="F301"
                onClick={() => onKind(label)}
              >
                {label} {n}
              </button>
            ))}
          </div>
          <span className="sp-fill" />
          <span className="del-fwl">A contract is a proposal until it is accepted in review. Accepting never writes to a database.</span>
        </div>
        <div className="del-tbw" data-feature="F301">
          <table className="del-tb">
            <thead>
              <tr>
                <th style={{ width: '118px' }}>Stage</th>
                <th>Contract</th>
                <th style={{ width: '158px' }}>Kind</th>
                <th style={{ width: '70px' }}>Version</th>
                <th style={{ width: '126px' }}>Status</th>
                <th style={{ width: '176px' }}>Linked requirements</th>
                <th style={{ width: '100px' }}>Checks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.name} className={c.sel ? 'sel' : ''}>
                  <td>
                    <span className="del-stg">
                      <i>{c.n}</i>
                      {c.stage}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="del-lnk"
                      data-does={'Opens ' + c.name + ' with its version history and checks'}
                      data-feature="F302"
                      onClick={() => (c.name === 'Variance alerts' ? onView('detail') : onIntent('F302:open:' + c.name))}
                    >
                      {c.name}
                    </button>
                  </td>
                  <td>
                    <span className="del-kind">
                      <Icon name={c.ic} size={13} />
                      {c.kind}
                    </span>
                  </td>
                  <td>
                    <span className="del-ver">
                      <b>{c.ver}</b>
                    </span>
                  </td>
                  <td>
                    <Pill tone={c.st[0]} label={c.st[1]} />
                  </td>
                  <td>
                    <code className="del-mono">{c.link}</code>
                  </td>
                  <td>{c.checks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="del-sub">What changed upstream</div>
        <div className="del-ro">
          <Icon name="alert" size={16} />
          <span>
            Spec r14 changed R-DASH-014 from 5% to 3%. The API contract and 1 test definition are marked Needs review. The r13
            evidence is kept and can no longer verify r14.
          </span>
          <Btn
            label="Open the diff"
            cls="ink"
            sm
            does="Opens S08 with the r13 to r14 diff and the linked contract lines"
            feature="F304"
            onClick={() => onIntent('F304:open-diff')}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- detail
function DetailBody(props: { onView: (view: DeliveryView) => void; onIntent: (intent: string) => void }) {
  const { onView, onIntent } = props;
  const counts = DELIVERY_CHECKS.reduce(
    (acc, c) => {
      const pill = deliveryCheckOutcome(c);
      if (pill[1] === 'Passed') acc.passed += 1;
      else if (pill[1] === 'Failed') acc.failed += 1;
      else if (pill[1] === 'Needs review') acc.review += 1;
      else acc.missing += 1;
      return acc;
    },
    { passed: 0, failed: 0, review: 0, missing: 0 },
  );

  return (
    <div className="del-body">
      <div className="sp-doc">
        <div className="meta">
          <Pill tone="warn" label="Needs review · r2" />
          <span>Backend stage · contract, not code · no automatic database writes or migrations</span>
        </div>
        <h2>{BACKEND.contract.name}</h2>
        <div className="del-meta">
          <div className="del-vsw" role="group" aria-label="Version">
            <button type="button" aria-pressed data-does="Shows r2, the current proposed revision" data-feature="F302" onClick={() => onIntent('F302:r2')}>
              r2 current
            </button>
            <button
              type="button"
              aria-pressed={false}
              data-does="Shows r1, the last accepted revision, read-only"
              data-feature="F302"
              onClick={() => onIntent('F302:r1')}
            >
              r1 accepted
            </button>
          </div>
          <Btn
            label="Diff r1 to r2"
            cls="ghost"
            sm
            icon="diff"
            does="Opens the exact diff between r1 and r2 in S08 review"
            feature="F302"
            onClick={() => onIntent('F302:diff')}
          />
          <span className="sp-fill" />
          <span className="del-fwl">Edited 12:38 · linked to R-DASH-014, 015, 019</span>
        </div>
        <table className="sp-tbl">
          <thead>
            <tr>
              <th style={{ width: '64px' }}>Method</th>
              <th>Path</th>
              <th style={{ width: '110px' }}>Requirement</th>
              <th style={{ width: '72px' }}>Role</th>
              <th style={{ width: '116px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {BACKEND.endpoints.map(([method, path, req, role, pill]) => (
              <tr key={method + path}>
                <td>
                  <code>{method}</code>
                </td>
                <td>
                  <code>{path}</code>
                </td>
                <td>
                  <code>{req}</code>
                </td>
                <td>{role}</td>
                <td>
                  <Pill tone={pill[0]} label={pill[1]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Response fixture, GET /projects/{'{id}'}/variance-alerts</h3>
        <div className="del-code" aria-label="manifest.json">
          <div className="">
            <i>1</i>
            {'{ "items": ['}
          </div>
          <div className="del">
            <i>2</i>
            {'  { "package_id": "P-03", "variance_pct": "6.40",'}
          </div>
          <div className="del">
            <i>3</i>
            {'    "periods_over": 2, "threshold_rev": "r13" }'}
          </div>
          <div className="">
            <i>4</i>
            {'] }'}
          </div>
        </div>
        <h3>Changed in r2</h3>
        <div className="del-blk">
          <div className="it">
            <b>R-DASH-019</b>
            <span className="rv">new</span>
            <span>POST acknowledge added for alerts that stay over 3% for 2 periods.</span>
            <Pill tone="acc" label="Proposal" />
          </div>
        </div>
      </div>
      <aside className="del-side" aria-label="Contract checks" data-feature="F303">
        <div>
          <div className="del-sub flush">
            Contract checks<span>{DELIVERY_CHECKS.length} on r2</span>
          </div>
          <span className="del-fwl">
            {counts.passed} passed · {counts.failed} failed · {counts.review} to review · {counts.missing} missing
          </span>
        </div>
        <div className="del-ck">
          {DELIVERY_CHECKS.map((c) => {
            const pill = deliveryCheckOutcome(c);
            const glyph = GLYPH[pill[0]];
            return (
              <div className={'it' + (pill[0] === 'bad' ? ' bad' : '')} key={c.t}>
                <span className={'del-glyph ' + pill[0]}>{glyph ? <Icon name={glyph} size={11} stroke={3} /> : null}</span>
                <div className="b">
                  <div className="a">
                    <span>{c.t}</span>
                    <Pill tone={pill[0]} label={pill[1]} />
                  </div>
                  {c.why ? <div className="w">{c.why}</div> : null}
                  <div className="z">
                    {c.ev ? (
                      <button
                        type="button"
                        className="del-evl"
                        data-does={'Opens evidence ' + c.ev + ' in the Evidence pack, pinned to its build'}
                        data-feature="F306"
                        onClick={() => onView('evidence')}
                      >
                        <Icon name="link" size={11} />
                        {c.ev}
                      </button>
                    ) : (
                      <span className="del-fwl">No evidence recorded</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------- matrix
function MatrixBody(props: { onView: (view: DeliveryView) => void; onIntent: (intent: string) => void }) {
  const { onView, onIntent } = props;
  return (
    <div className="del-body">
      <div className="del-gate">
        <div className="del-tbw" data-feature="F305">
          <table className="del-tb">
            <thead>
              <tr>
                <th style={{ width: '166px' }}>Stage and status</th>
                <th style={{ width: '98px' }}>Artifacts</th>
                <th style={{ width: '98px' }}>Approvals</th>
                <th style={{ width: '98px' }}>Tests</th>
                <th style={{ width: '112px' }}>Evidence</th>
                <th>Blocker</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERY_MATRIX.map(([sid, artDone, artTotal, appDone, appTotal, testDone, testTotal, ev, blocker]) => {
                const s = STAGES.find((x) => x.id === sid)!;
                return (
                  <tr key={sid} className={sid === 'integration' ? 'cur' : ''}>
                    <td>
                      <button
                        type="button"
                        className="del-lnk"
                        data-does={'Opens the ' + s.name + ' stage with its artifact list and blockers'}
                        data-feature="F305"
                        onClick={() => (sid === 'integration' ? onView('fail') : onIntent('F305:stage:' + sid))}
                      >
                        <span className="del-stg">
                          <i>{s.n}</i>
                          {s.name}
                        </span>
                      </button>
                      <small>
                        <span className="del-st">
                          <span className={'dot ' + s.st} />
                          {s.text}
                        </span>
                      </small>
                    </td>
                    <td>
                      <Progress done={artDone} total={artTotal} />
                    </td>
                    <td>
                      <Progress done={appDone} total={appTotal} />
                    </td>
                    <td>
                      <Progress done={testDone} total={testTotal} />
                    </td>
                    <td>
                      {ev.length ? (
                        ev.map(([id]) => (
                          <button
                            key={id}
                            type="button"
                            className="del-evl"
                            data-does={'Opens evidence ' + id + ' in the Evidence pack, pinned to its build'}
                            data-feature="F306"
                            onClick={() => onView('evidence')}
                          >
                            <Icon name="link" size={11} />
                            {id}
                          </button>
                        ))
                      ) : (
                        <span className="del-fwl">no evidence</span>
                      )}
                    </td>
                    <td className="w">
                      {blocker ? (
                        <span className="del-st">
                          <Icon name="alert" size={14} />
                          {blocker}
                        </span>
                      ) : (
                        <span className="del-fwl">none</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="del-ro">
          <Icon name="lock" size={16} />
          <span>A stage is Ready only when its required artifacts, approvals and evidence exist. Opening a stage never marks it ready.</span>
        </div>
      </div>
      <aside className="del-side" aria-label="Stage readiness">
        <div className="del-sh">
          <div className="r">
            <b>Integration readiness</b>
            <Pill tone="bad" label="Blocked · 1" />
          </div>
          <span className="del-fwl">Derived from required artifacts, approvals and evidence. Never typed in.</span>
        </div>
        <div className="del-sub">
          Required artifacts<span>1 of 4</span>
        </div>
        <div className="del-ck">
          <div className="it">
            <span className="del-glyph ok">
              <Icon name="check" size={11} stroke={3} />
            </span>
            <div className="b">
              <div className="a">
                <span>Integration plan</span>
                <Pill tone="ok" label="Accepted r1" />
              </div>
            </div>
          </div>
          <div className="it bad">
            <span className="del-glyph bad">
              <Icon name="x" size={11} stroke={3} />
            </span>
            <div className="b">
              <div className="a">
                <span>Contract fixtures, GET alerts</span>
                <Pill tone="bad" label="Failed" />
              </div>
              <div className="z">
                <button
                  type="button"
                  className="del-evl"
                  data-does="Opens evidence EV-0447 in the Evidence pack, pinned to its build"
                  data-feature="F306"
                  onClick={() => onView('evidence')}
                >
                  <Icon name="link" size={11} />
                  EV-0447
                </button>
              </div>
            </div>
          </div>
          <div className="it">
            <span className="del-glyph mute" />
            <div className="b">
              <div className="a">
                <span>POST acknowledge fixture</span>
                <Pill tone="mute" label="Skipped" />
              </div>
            </div>
          </div>
          <div className="it">
            <span className="del-glyph mute" />
            <div className="b">
              <div className="a">
                <span>Cost-lines fixture</span>
                <Pill tone="mute" label="Skipped" />
              </div>
            </div>
          </div>
        </div>
        <div className="sp-ready">
          <div className="t">
            Next proposed action<Pill tone="warn" label="Proposal" />
          </div>
          <p>Fix the contract so variance_pct is a number, then re-run the fixture. Nothing is applied until reviewed.</p>
          <Btn
            label="Propose a contract fix"
            cls="ink"
            sm
            does="Adds a proposed contract change to S08 review with its exact diff; no code or run is started"
            feature="F309"
            onClick={() => onIntent('F309:propose-contract-fix')}
          />
        </div>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------- gate
function GateBody(props: { onView: (view: DeliveryView) => void; onIntent: (intent: string) => void }) {
  const { onView, onIntent } = props;
  return (
    <div className="del-body">
      <div className="del-gate">
        <div className="del-gh" data-feature="F307">
          <span />
          <div>
            <h2>Release gate: blocked, 4 reasons</h2>
            <p>
              Pinned to build {DELIVERY_BUILD.commit} on {DELIVERY_BUILD.env}, spec r14. Release readiness needs all four checks to
              pass. Spekin records readiness; it does not deploy.
            </p>
          </div>
          <div className="ac">
            <Btn
              label="Request owner exception"
              cls="ghost"
              sm
              does="Asks the owner for an exception with a written reason; it stays labelled Exception, not verified"
              feature="F308"
              onClick={() => onIntent('F308:request-exception')}
            />
            <Btn
              label="Propose fix tickets"
              cls="ink"
              sm
              does="Drafts one proposed ticket per failing check; nothing joins the task list until accepted in S08"
              feature="F309"
              onClick={() => onIntent('F309:propose-fix-tickets')}
            />
          </div>
        </div>
        <div className="del-gg">
          {DELIVERY_GATE.map((g) => (
            <div className="del-gc" key={g.id}>
              <div className="tt">
                <Icon name={g.ic} size={14} />
                {g.title}
                <Pill tone={g.pill[0]} label={g.pill[1]} />
              </div>
              <div className="bg">
                {g.big}
                <small>{g.sub}</small>
              </div>
              {g.id === 'tests' ? (
                <div className="del-bar">
                  <u className="ok" style={{ width: '36%' }} />
                </div>
              ) : null}
              {g.id === 'perf' ? (
                <div className="del-bar">
                  <u style={{ width: '100%' }} />
                  <i style={{ left: '86%' }} />
                </div>
              ) : null}
              {g.id === 'tests' ? (
                <div className="del-barl">
                  <span>4 passed</span>
                  <span>7 without a result</span>
                </div>
              ) : null}
              {g.id === 'perf' ? (
                <div className="del-barl">
                  <span>0 s</span>
                  <span>budget 2.5 s</span>
                </div>
              ) : null}
              <p>{g.reason}</p>
              <div className="z">
                {g.ev.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className="del-evl"
                    data-does={'Opens evidence ' + id + ' (' + label + ') in the Evidence pack, pinned to its build'}
                    data-feature="F306"
                    onClick={() => onView('evidence')}
                  >
                    <Icon name="link" size={11} />
                    {id}
                    <small>{label}</small>
                  </button>
                ))}
                <Btn
                  label="Propose fix"
                  cls="plain"
                  sm
                  does="Drafts a proposed ticket for this gate check; it goes to S08 review first"
                  feature="F309"
                  onClick={() => onIntent('F309:propose-fix:' + g.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <aside className="del-side" aria-label="Gate history">
        <div className="del-sub flush">Gate history</div>
        <div className="del-hist">
          <div>
            <b>12:31</b>
            <span>Blocked, 4 reasons. Run #38 failed.</span>
          </div>
          <div>
            <b>11:58</b>
            <span>Blocked, 5 reasons. F-04 was a draft.</span>
          </div>
          <div>
            <b>11:20</b>
            <span>Blocked, 5 reasons. Run #36 queued.</span>
          </div>
          <div>
            <b>20 Nov</b>
            <span>Not evaluated. No build was pinned.</span>
          </div>
        </div>
        <div className="del-exc">
          <div className="t">
            Owner exception<Pill tone="mute" label="None" />
          </div>
          <p>An exception records who, why and for which check. It shows as Exception, not verified, and never turns a check green.</p>
          <Btn
            label="Write the reason"
            cls="ghost"
            sm
            does="Opens a short form: check, reason and expiry; saved to the audit record"
            feature="F308"
            onClick={() => onIntent('F308:write-reason')}
          />
        </div>
        <div className="del-ro push">
          <Icon name="lock" size={16} />
          <span>No deploy, retry or merge runs from here. Viewers can read every check and cannot change one.</span>
        </div>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------- fail
function FailBody(props: { onIntent: (intent: string) => void }) {
  const { onIntent } = props;
  const [cls, setCls] = useState(() => DELIVERY_RUN.classes.find(([, selected]) => selected)?.[0] ?? 'Contract mismatch');

  return (
    <div className="del-body">
      <div className="del-gate">
        <div className="del-err" role="alert" data-feature="F310">
          <h3>
            <Icon name="octagon" size={16} stroke={2} />
            Integration run failed: the response does not match the contract
          </h3>
          <p>
            Run #38 on build {DELIVERY_RUN.commit} called <code>GET /projects/{'{id}'}/variance-alerts</code> and got{' '}
            <code>variance_pct</code> as text. Contract r2 says a number with two decimals. 2 of 3 fixture calls did not run.
          </p>
          <div className="ft">
            <span className="s">integration-contract · {DELIVERY_RUN.at} · read-only record</span>
            <Btn
              label="Show log"
              cls="plain"
              sm
              does="Opens the redacted run log; keys and tokens are masked"
              feature="F311"
              onClick={() => onIntent('F311:show-log')}
            />
            <Btn
              label="Retry run"
              cls="ghost"
              sm
              later="Needs a runner. Spekin has none in the browser MVP, so it cannot retry CI (R-DEL-2)"
            />
            <Btn
              label="Propose contract fix"
              cls="ink"
              sm
              does="Adds a proposed fix to S08 review: variance_pct typed as a number, with the diff"
              feature="F310"
              onClick={() => onIntent('F310:propose-contract-fix')}
            />
          </div>
        </div>
        <div className="del-sub">
          Steps<span>applied, failed, skipped and unknown are listed apart; no rollback is claimed</span>
        </div>
        <div className="del-steps" data-feature="F311">
          {DELIVERY_RUN.steps.map(([k, step, outcome, time], idx) => {
            const glyph = GLYPH[k];
            const isCall = /^[A-Z]+ \//.test(step);
            return (
              <div key={step} className={(idx === 0 ? 'ap-steps-first ' : '') + (k === 'bad' ? 'bad' : '')}>
                <span className={'del-glyph ' + k}>{glyph ? <Icon name={glyph} size={11} stroke={3} /> : null}</span>
                <span>{isCall ? <code>{step}</code> : step}</span>
                <Pill tone={k} label={outcome} />
                <span>{time}</span>
              </div>
            );
          })}
        </div>
      </div>
      <aside className="del-side wide" aria-label="Classification">
        <div className="del-sub flush">
          Classified as<span>from the run record</span>
        </div>
        <div className="del-cls" role="group" aria-label="Failure class">
          {DELIVERY_RUN.classes.map(([label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={cls === label}
              data-does={'Reclassifies the failure as ' + label.toLowerCase() + '; the repair options follow the class'}
              data-feature="F310"
              onClick={() => {
                setCls(label);
                onIntent('F310:class:' + label);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="del-ro">
          <Icon name="spark" size={16} />
          <span>Matched by a schema diff on one field. Environment errors, timeouts and permission errors show different repairs.</span>
        </div>
        <div className="del-sub">Expected and received</div>
        <div className="del-code" aria-label="manifest.json">
          <div className="add">
            <i>1</i>- variance_pct: decimal(5,2)
          </div>
          <div className="del">
            <i>2</i>+ variance_pct: &quot;6.40&quot;
          </div>
          <div className="dim">
            <i>3</i>
            {'  periods_over: 2'}
          </div>
          <div className="dim">
            <i>4</i>
            {'  threshold_rev: "r13"'}
          </div>
        </div>
        <div className="del-ro">
          <Icon name="lock" size={16} />
          <span>This card reports a run Spekin did not start. It cannot retry, merge or deploy.</span>
        </div>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------- evidence
function EvidenceBody(props: { onIntent: (intent: string) => void }) {
  const { onIntent } = props;
  return (
    <div className="del-body">
      <div className="del-gate">
        <div className="del-pins">
          <span>Spec</span>
          <div>
            <code>r14</code> accepted, 9 requirement revisions
          </div>
          <span>Frames</span>
          <div>
            <code>F-01 r4</code> · <code>F-03 r6</code> · DESIGN.md <code>r3</code>
          </div>
          <span>Build</span>
          <div>
            <code>{DELIVERY_BUILD.commit}</code> on {DELIVERY_BUILD.env}, observed {DELIVERY_BUILD.at}
          </div>
          <span>Tools</span>
          <div>Contract checker 0.9, test runner, browser budget run</div>
          <span>Record</span>
          <div>{DELIVERY_BUILD.pack} · pinned, never edited</div>
        </div>
        <div className="del-tbw" data-feature="F313">
          <table className="del-tb">
            <thead>
              <tr>
                <th style={{ width: '152px' }}>Source</th>
                <th>Observation</th>
                <th style={{ width: '108px' }}>Observed</th>
                <th style={{ width: '114px' }}>Outcome</th>
                <th style={{ width: '132px' }}>Linked to</th>
              </tr>
            </thead>
            <tbody>
              {DELIVERY_TIMELINE.map((row) => {
                const [source, what, observed, , linked, note] = row;
                const pill = evidenceOutcome(row);
                return (
                  <tr key={source + what}>
                    <td>
                      <b>{source}</b>
                    </td>
                    <td className="w">
                      {what}
                      <small>{note}</small>
                    </td>
                    <td>{observed}</td>
                    <td>
                      <Pill tone={pill[0]} label={pill[1]} />
                    </td>
                    <td>
                      <code className="del-mono">{linked || 'none'}</code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <aside className="del-side" aria-label="Evidence summary">
        <div className="del-sub flush">
          Acceptance criteria<span>11 required</span>
        </div>
        <div className="del-sum4 two">
          <div>
            <span>Passed</span>
            <b>4</b>
          </div>
          <div>
            <span>Failed</span>
            <b>0</b>
          </div>
          <div className="warn">
            <span>Untested</span>
            <b>6</b>
          </div>
          <div className="bad">
            <span>Evidence missing</span>
            <b>1</b>
          </div>
        </div>
        <div className="del-ro">
          <Icon name="alert" size={16} />
          <span>Missing evidence is never shown as passed. 3 gaps are proposed as tickets and wait for review in S08.</span>
        </div>
        <div className="del-sub">Export</div>
        <Btn
          label="Download evidence pack"
          cls="ink"
          icon="package"
          does="Saves a zip of the pins, outcomes and evidence links; secrets are masked and private references stay out"
          feature="F315"
          onClick={() => onIntent('F315:download')}
        />
        <Btn
          label="Open in S25 export"
          cls="ghost"
          does="Opens S25 to include this pack in the whole-spec export"
          feature="F315"
          onClick={() => onIntent('F315:s25')}
        />
        <div className="del-ro push">
          <Icon name="lock" size={16} />
          <span>Export is recorded: actor, pack, time. Viewers can read the pack and cannot export it.</span>
        </div>
      </aside>
    </div>
  );
}
