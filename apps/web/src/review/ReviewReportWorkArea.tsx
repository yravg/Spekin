import { useEffect, useState, type ReactNode } from 'react';
import { sampleData, type ContextItem, type PillTone, type PillTuple } from '../data/source';
import { useWorkspace, type SaveState } from '../state/workspace';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs } from '../shell/ArtifactTabs';
import { InspectorRow } from '../shell/Inspector';
import { Btn, IconBtn } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';
import { Pill } from '../ui/Pill';

const { MODEL } = sampleData;

export type ReportView = 'report' | 'none' | 'split' | 'risk' | 'prop';
export const REPORT_VIEWS: ReportView[] = ['report', 'none', 'split', 'risk', 'prop'];

export function isReportView(v: string | null | undefined): v is ReportView {
  return v === 'report' || v === 'none' || v === 'split' || v === 'risk' || v === 'prop';
}

export interface ReportShellOverride {
  save?: SaveState;
  busy?: string;
}

type EvidenceRow = [string, string, string, 'ok' | 'warn' | 'none', string];
type AxisRow = [string, string, string, string];
type FindingRow = [string, string, string, string, string, string, PillTone];
type RiskRow = [string, PillTone, string, string];
type ProposalRow = [string, string, string, string];

interface SampleGapdReview {
  rev: string;
  build: string;
  at: string;
  reviewer: string;
  evidence: EvidenceRow[];
  missing: [string, string][];
  spec: AxisRow[];
  specCounts: { met: number; unmet: number; untested: number; missing: number };
  std: AxisRow[];
  stdCounts: { passed: number; failed: number; untested: number; missing: number };
  findings: FindingRow[];
  risk: RiskRow[];
  proposals: ProposalRow[];
}

const gapd = sampleData as unknown as {
  GAPD_REVIEW: SampleGapdReview;
  GAPD_CTX: ContextItem[];
};
const R = gapd.GAPD_REVIEW;
const CTX = gapd.GAPD_CTX;

const OUT: Record<string, PillTuple> = {
  met: ['ok', 'Met'],
  unmet: ['bad', 'Unmet'],
  untested: ['warn', 'Untested'],
  missing: ['mute', 'Evidence missing'],
  passed: ['ok', 'Passed'],
  failed: ['bad', 'Failed'],
  na: ['mute', 'Not assessed'],
};

const NONE_EVIDENCE: EvidenceRow[] = [
  ['repo', 'Repository snapshot', 'Not connected', 'none', 'Missing'],
  ['server', 'Pinned build', 'Not set', 'none', 'Missing'],
  ['check', 'Test run', 'Not uploaded', 'none', 'Missing'],
  ['doc', 'Standards set', 'SD-01 to SD-09 (accepted)', 'ok', 'Read'],
];

const NONE_MISSING: [string, string][] = [
  ['Repository snapshot', 'Needed to read the code.'],
  ['Pinned build', 'Needed so evidence names one build.'],
  ['Test run', 'Needed for Met or Unmet.'],
];

const SPEC_RE_REVIEW: AxisRow[] = [
  ['R-DASH-014', 'Variance threshold per package', 'met', 'AC-014.1 passed on build 0412'],
  ['R-DASH-015', 'Drill down to cost lines', 'met', 'AC-015.1, AC-015.2 passed'],
  ['R-DASH-016', 'Export the variance table', 'met', 'AC-016.2 passed after fix'],
  ['R-DASH-019', 'Alert after 2 periods over 3%', 'met', 'E2E run uploaded, AC-019.1 passed'],
  ['R-DASH-021', 'Empty state when none over', 'met', 'AC-021.1 passed'],
];

/** Builds a Markdown continuation packet for F508/F509 with secret values redacted while keeping variable names. */
export function buildReportMarkdown(extraText = ''): string {
  const redact = (text: string) =>
    text.replace(/\b([A-Z][A-Z0-9_]{2,})=([^\s]+)/g, '$1=[REDACTED]');
  const lines = [
    '# Verification and review report (Unverified continuation packet)',
    '',
    `Build: ${R.build} · Spec: ${R.rev} · ${R.reviewer} · ${R.at}`,
    'Independent review (F509): only the accepted spec, the build and the standards were given.',
    '',
    '## Evidence examined',
    ...R.evidence.map(([, n, d, , l]) => `- ${n} (${d}): ${l}`),
    '',
    '## Missing inputs',
    ...R.missing.map(([n, d]) => `- ${n}: ${d}`),
    '',
    '## Findings',
    ...R.findings.map(([id, against, desc, sev, scope, st]) => `- ${id} (${against}, ${sev}, ${scope}): ${desc} [${st}]`),
  ];
  if (extraText) {
    lines.push('', '## Notes', redact(extraText));
  }
  return lines.join('\n');
}

function OutcomePill({ kind }: { kind: string }) {
  const [tone, label]: PillTuple = OUT[kind] ?? ['mute', 'Not assessed'];
  return <Pill tone={tone} label={label} />;
}

function CheckBox({ on }: { on: boolean }) {
  return (
    <span className={'gpd-chk' + (on ? ' on' : '')} aria-hidden="true">
      {on ? <Icon name="check" size={11} stroke={3} /> : null}
    </span>
  );
}

function EvidenceSection({
  rows,
  miss,
  missTone = '',
}: {
  rows: EvidenceRow[];
  miss: [string, string][];
  missTone?: '' | 'warn' | 'bad';
}) {
  const readCount = rows.filter((r) => r[3] === 'ok').length;
  return (
    <div className="gpd-two">
      <div className="gpd-card" data-feature="F501">
        <h3>
          Evidence examined
          <span>
            {readCount} of {rows.length} read
          </span>
        </h3>
        {rows.map(([icon, name, detail, tone, label]) => (
          <div key={name} className="gpd-evr">
            <Icon name={icon as IconName} size={15} />
            <span>
              {name}
              <small>{detail}</small>
            </span>
            <Pill tone={tone === 'ok' ? 'ok' : tone === 'none' ? 'mute' : 'warn'} label={label} />
          </div>
        ))}
      </div>
      <div className={'gpd-card' + (missTone ? ' ' + missTone : '')} data-feature="F502">
        <h3>
          Missing inputs<span>{miss.length}</span>
        </h3>
        {miss.map(([name, detail]) => (
          <div key={name} className="gpd-ms">
            <Icon name="alert" size={15} />
            <span>
              <b>{name}</b>
              <small>{detail}</small>
            </span>
          </div>
        ))}
        <div className="s">Shown before findings. A missing input is never a pass.</div>
      </div>
    </div>
  );
}

function AxesOverview({
  onOpenSpec,
  onOpenStd,
}: {
  onOpenSpec: () => void;
  onOpenStd: () => void;
}) {
  const sc = R.specCounts;
  const tc = R.stdCounts;
  return (
    <div className="gpd-eq">
      <div className="gpd-card" data-feature="F503">
        <h3>
          <Icon name="req" size={15} />
          Spec coverage<span>against accepted spec {R.rev}</span>
        </h3>
        <div className="gpd-cnts">
          <div className="gpd-cnt ok">
            <b>{sc.met}</b>
            <span>Met</span>
          </div>
          <div className="gpd-cnt bad">
            <b>{sc.unmet}</b>
            <span>Unmet</span>
          </div>
          <div className="gpd-cnt warn">
            <b>{sc.untested}</b>
            <span>Untested</span>
          </div>
          <div className="gpd-cnt ">
            <b>{sc.missing}</b>
            <span>Evidence missing</span>
          </div>
        </div>
        <div className="gpd-bar" aria-hidden="true">
          <i className="ok" style={{ flex: sc.met }} />
          <i className="bad" style={{ flex: sc.unmet }} />
          <i className="warn" style={{ flex: sc.untested }} />
          <i className="mute" style={{ flex: sc.missing }} />
        </div>
        <Btn
          label="Open spec coverage"
          sm
          does="Lists every requirement with its outcome and the evidence behind it"
          feature="F503"
          onClick={onOpenSpec}
        />
      </div>
      <div className="gpd-card" data-feature="F504">
        <h3>
          <Icon name="check" size={15} />
          Standards conformance<span>against SD-01 to SD-09</span>
        </h3>
        <div className="gpd-cnts">
          <div className="gpd-cnt ok">
            <b>{tc.passed}</b>
            <span>Passed</span>
          </div>
          <div className="gpd-cnt bad">
            <b>{tc.failed}</b>
            <span>Failed</span>
          </div>
          <div className="gpd-cnt warn">
            <b>{tc.untested}</b>
            <span>Untested</span>
          </div>
          <div className="gpd-cnt ">
            <b>{tc.missing}</b>
            <span>Evidence missing</span>
          </div>
        </div>
        <div className="gpd-bar" aria-hidden="true">
          <i className="ok" style={{ flex: tc.passed }} />
          <i className="bad" style={{ flex: tc.failed }} />
          <i className="warn" style={{ flex: tc.untested }} />
          <i className="mute" style={{ flex: tc.missing }} />
        </div>
        <Btn
          label="Open standards"
          sm
          does="Lists every documented standard with its outcome; this axis never offsets the spec axis"
          feature="F504"
          onClick={onOpenStd}
        />
      </div>
    </div>
  );
}

function FindingsTable({
  rows,
  sel = -1,
  onSelect,
}: {
  rows: FindingRow[];
  sel?: number;
  onSelect: (id: string) => void;
}) {
  return (
    <table className="sp-tbl" data-feature="F505">
      <thead>
        <tr>
          <th style={{ width: '64px' }}>ID</th>
          <th style={{ width: '96px' }}>Against</th>
          <th>Finding</th>
          <th style={{ width: '64px' }}>Severity</th>
          <th style={{ width: '120px' }}>Scope</th>
          <th style={{ width: '130px' }}>State</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr
            key={r[0]}
            style={i === sel ? { background: 'var(--accent-soft)' } : undefined}
            onClick={() => onSelect(r[0])}
          >
            <td>
              <code>{r[0]}</code>
            </td>
            <td>
              <code>{r[1]}</code>
            </td>
            <td>{r[2]}</td>
            <td>{r[3]}</td>
            <td>{r[4]}</td>
            <td>
              <Pill tone={r[6]} label={r[5]} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AxisListCard({
  title,
  rows,
  feature,
  sel = -1,
}: {
  title: string;
  rows: AxisRow[];
  feature: string;
  sel?: number;
}) {
  return (
    <div className="gpd-card" data-feature={feature}>
      <h3>
        {title}
        <span>{rows.length} assessed</span>
      </h3>
      <div className="gpd-list">
        {rows.map((r, i) => (
          <div key={r[0]} className={'gpd-li' + (i === sel ? ' sel' : '')}>
            <code>{r[0]}</code>
            <span>
              {r[1]}
              <small>{r[3]}</small>
            </span>
            <OutcomePill kind={r[2]} />
          </div>
        ))}
      </div>
    </div>
  );
}

// S18 Verification and review report (IMP-64, F501-F509).
// Board: docs/design/spekin-canvas/project/S18-review-report.dc.html.
export function ReviewReportWorkArea(props: {
  initialView?: ReportView;
  onShellOverride?: (o: ReportShellOverride) => void;
  onOpenReview?: () => void;
}) {
  const { initialView = 'report', onShellOverride, onOpenReview } = props;
  const [view, setView] = useState<ReportView>(initialView);
  const [activeTab, setActiveTab] = useState('Review report · build 0412');
  const [selectedProposals, setSelectedProposals] = useState<Record<string, boolean>>({
    'T-231': true,
    'T-232': true,
    'T-233': true,
  });

  const wsView = useWorkspace((s) => s.view('testing'));
  const setWsView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const switchView = (next: ReportView) => {
    onShellOverride?.({ busy: next === 'report' ? '1 reviewing' : undefined });
    setView(next);
  };

  useEffect(() => {
    setView(initialView);
    onShellOverride?.({ busy: initialView === 'report' ? '1 reviewing' : undefined });
  }, [initialView, onShellOverride]);

  useEffect(() => {
    onShellOverride?.({ busy: view === 'report' ? '1 reviewing' : undefined });
    return () => onShellOverride?.({});
  }, [view, onShellOverride]);

  const handleChatSend = () => {
    const q = wsView.draft.trim().toLowerCase();
    setWsView('testing', { draft: '' });
    if (q.includes('review the build') || q.includes('no repo') || q.includes('not connected')) {
      switchView('none');
      recordIntent('F502:no-inputs');
    } else if (q.includes('ship') || q.includes('standard') || q.includes('split')) {
      switchView('split');
      recordIntent('F504:split');
    } else if (q.includes('decide') || q.includes('risk')) {
      switchView('risk');
      recordIntent('F506:risk');
    } else if (q.includes('propose') || q.includes('ticket')) {
      switchView('prop');
      recordIntent('F507:propose');
    } else {
      switchView('report');
      recordIntent('F509:independent-review');
    }
  };

  const handleExport = () => {
    buildReportMarkdown();
    recordIntent('F508:export-report');
  };

  const chatMessages: Record<ReportView, { msg: string; reply: ReactNode }> = {
    report: {
      msg: 'Review build 0412 against spec r14.',
      reply: (
        <p>
          Read 3 of 4 inputs. <b>1 requirement unmet, 1 untested, 1 without evidence.</b> I could not read an end-to-end
          run, so R-DASH-019 is not shown as met.
        </p>
      ),
    },
    none: {
      msg: 'Review the build against r14.',
      reply: (
        <p>
          No repository or build is connected. I cannot assess anything yet, so I am <b>not</b> saying “no gaps found”.
        </p>
      ),
    },
    split: {
      msg: 'Spec looks done. Can we ship?',
      reply: (
        <p>
          <b>Not yet.</b> Every requirement is met, but one documented standard failed. Spec and standards are reported
          apart, so a pass on one cannot cover the other.
        </p>
      ),
    },
    risk: {
      msg: 'What do I still have to decide?',
      reply: (
        <p>
          Three risk dimensions need a human decision before this build can go on. I recorded none of them for you.
        </p>
      ),
    },
    prop: {
      msg: 'Propose tickets for what is left.',
      reply: (
        <p>
          3 tickets drafted from the unmet and untested findings. They are <b>proposals</b>: they reach the ticket board
          only after you accept them in review.
        </p>
      ),
    },
  };

  const activeSection: number = view === 'risk' ? 3 : view === 'prop' ? 4 : 0;
  const selectedCount = R.proposals.filter((p) => selectedProposals[p[0]]).length;

  const head = (sub: string, extra?: ReactNode) => (
    <div className="gpd-head" data-feature="F509">
      <div className="t">
        <h2>Review of build 0412 against spec {R.rev}</h2>
        <p>{sub}</p>
      </div>
      {extra}
    </div>
  );

  const banner =
    view === 'report' ? (
      <div className="sp-banner warn" role="status" data-feature="F508">
        <Icon name="alert" size={16} />
        <p>
          <b>Unverified continuation packet.</b> This report is evidence for review (S08). It does not accept anything
          or approve a release.
        </p>
      </div>
    ) : view === 'none' ? (
      <div className="sp-banner bad" role="alert" data-feature="F502">
        <Icon name="alert" size={16} />
        <p>
          <b>No inputs to review.</b> Connect a repository and upload a test run. Until then every requirement is Not
          assessed.
        </p>
        <Btn
          label="Connect repository"
          cls="ink"
          sm
          does="Opens the repository connection step in project settings"
          feature="F502"
          onClick={() => recordIntent('F502:connect-repo')}
        />
      </div>
    ) : null;

  let pane: ReactNode = null;
  let inspector: ReactNode = null;

  if (view === 'report') {
    pane = (
      <>
        {head(
          `${R.reviewer} · ${R.at} · independent review: only the accepted spec, the build and the standards were given`,
          <Btn
            label="Propose remaining tickets"
            cls="ink"
            does="Opens S08 with proposed tickets for the unmet and untested items; nothing is added to S15 until accepted"
            feature="F507"
            onClick={() => {
              switchView('prop');
              recordIntent('F507:propose');
            }}
          />,
        )}
        <EvidenceSection rows={R.evidence} miss={R.missing} missTone="warn" />
        <AxesOverview
          onOpenSpec={() => {
            switchView('split');
            recordIntent('F503:open-spec');
          }}
          onOpenStd={() => {
            switchView('split');
            recordIntent('F504:open-std');
          }}
        />
        <FindingsTable
          rows={R.findings}
          onSelect={(id) => {
            if (id === 'FND-02') switchView('split');
            else switchView('prop');
            recordIntent('F505:select:' + id);
          }}
        />
      </>
    );
  } else if (view === 'none') {
    pane = (
      <>
        {head('Review not started · 0 of 4 inputs read')}
        <EvidenceSection rows={NONE_EVIDENCE} miss={NONE_MISSING} missTone="bad" />
        <div className="gpd-eq">
          <div className="gpd-card">
            <h3>
              Spec coverage
              <span>
                <OutcomePill kind="na" />
              </span>
            </h3>
            <p>5 requirements are in scope. None can be assessed.</p>
          </div>
          <div className="gpd-card">
            <h3>
              Standards conformance
              <span>
                <OutcomePill kind="na" />
              </span>
            </h3>
            <p>9 standards are in scope. None can be assessed.</p>
          </div>
        </div>
        <div className="gpd-empty">
          <Icon name="alert" size={22} />
          <b>No findings, and that is not a pass</b>
          <span>The report will say “no gaps found on the evidence examined” only after evidence is read.</span>
        </div>
      </>
    );
  } else if (view === 'split') {
    pane = (
      <>
        {head('Re-review after the fixes · build 0419 · independent review RUN-0431')}
        <div className="gpd-verdict" data-feature="F504">
          <div className="ax">
            <small>Spec coverage</small>
            <Pill tone="ok" label="Met · 5 of 5" />
          </div>
          <span className="vs" />
          <div className="ax">
            <small>Standards</small>
            <Pill tone="bad" label="Failed · 1 of 4" />
          </div>
          <p>
            <b>Not accepted.</b> The spec axis passed and the standards axis failed. The axes are not averaged. An
            unrelated green build does not verify a requirement without a test that names it.
          </p>
        </div>
        <div className="gpd-eq">
          <AxisListCard title="Spec coverage" rows={SPEC_RE_REVIEW} feature="F503" />
          <AxisListCard title="Standards conformance" rows={R.std} feature="F504" sel={1} />
        </div>
      </>
    );
    inspector = (
      <aside className="sp-insp" aria-label="Inspector" data-feature="F505">
        <div className="sp-ih">
          <div className="a">
            <b>FND-02 · SD-05</b>
            <Pill tone="bad" label="Failed" />
            <span className="sp-fill" />
            <IconBtn
              icon="more"
              label="More"
              does="Opens finding actions: copy link, mark reviewed, open evidence"
              sm
              feature="F505"
              onClick={() => recordIntent('F505:more')}
            />
          </div>
          <div className="s">Standards finding · Medium · Variance table</div>
        </div>
        <div className="sp-ib">
          <div className="sp-sec">
            <h4>
              Evidence<span>2</span>
            </h4>
            <InspectorRow id="E-114" name="Screenshot of Forecast column" sub="build 0419 · 24 Nov 13:20" pill={['ok', 'Read']} />
            <InspectorRow id="E-115" name="Rendered DOM of table" sub="1 decimal in 4 of 4 rows" pill={['ok', 'Read']} />
          </div>
          <div className="sp-sec">
            <h4>
              Follow-up<span>1</span>
            </h4>
            <InspectorRow id="T-232" name="Show forecast with two decimals" sub="Proposed ticket · not in S15" pill={['acc', 'Proposal']} />
          </div>
          <div className="sp-ready">
            <div className="t">
              Verification<span className="pill bad">Not verified</span>
            </div>
            <p>A ticket proposal never marks a requirement verified.</p>
            <Btn
              label="Open in review"
              cls="ink"
              sm
              does="Opens S08 with the proposed ticket and its evidence"
              feature="F507"
              onClick={() => {
                recordIntent('F507:open-review');
                onOpenReview?.();
              }}
            />
          </div>
        </div>
      </aside>
    );
  } else if (view === 'risk') {
    pane = (
      <>
        {head('Risk review is separate from both axes. It lists what a person must decide.')}
        <div className="gpd-risk" data-feature="F506">
          {R.risk.map(([name, tone, desc, dec]) => (
            <div
              key={name}
              className={'gpd-card' + (tone === 'bad' ? ' bad' : tone === 'warn' ? ' warn' : '')}
            >
              <h3>
                {name}
                <span>
                  <Pill tone={tone} label={tone === 'ok' ? 'Low' : tone === 'warn' ? 'Needs decision' : 'High'} />
                </span>
              </h3>
              <p>{desc}</p>
              <div className="s">{dec}</div>
            </div>
          ))}
        </div>
        <div className="gpd-actions">
          <Btn
            label="Record decision"
            cls="ink"
            does="Opens a decision form: choice, reason and your name; written to the decision log (S05) with this report revision"
            feature="F506"
            onClick={() => recordIntent('F506:record-decision')}
          />
          <Btn
            label="Ask owner"
            does="Sends the three open decisions to the project owner as a review request"
            feature="F506"
            onClick={() => recordIntent('F506:ask-owner')}
          />
          <span className="s" style={{ fontSize: '12px', color: 'var(--ink-dim)' }}>
            Reviewer input is limited to the accepted spec, the build and the standards (R-VER-6).
          </span>
        </div>
      </>
    );
    inspector = (
      <aside className="sp-insp" aria-label="Required decisions" data-feature="F506">
        <div className="sp-ih">
          <div className="a">
            <b>Required human decisions</b>
            <Pill tone="warn" label="3 open" />
          </div>
          <div className="s">Recorded in the decision log, never by the agent</div>
        </div>
        <div className="sp-ib">
          <div className="sp-sec">
            <h4>
              Open<span>3</span>
            </h4>
            <div className="gpd-dec">
              <b>Who may acknowledge an alert?</b>
              <small>Authorization · owner: Rina (sample)</small>
            </div>
            <div className="gpd-dec">
              <b>Rollback plan for migration 0007</b>
              <small>Migration · owner: Rina (sample)</small>
            </div>
            <div className="gpd-dec">
              <b>Block release over the P-03 threshold bug?</b>
              <small>Monetary impact · owner: Rina (sample)</small>
            </div>
          </div>
          <div className="sp-sec">
            <h4>
              Decided<span>0</span>
            </h4>
          </div>
        </div>
      </aside>
    );
  } else {
    pane = (
      <>
        {head(
          'Findings with proposed tickets',
          <Btn
            label="Propose remaining tickets"
            cls="ink"
            icon="spark"
            does="Sends the selected proposals to S08 review; on accept they are appended to the ticket board (S15)"
            feature="F507"
            onClick={() => {
              recordIntent('F507:send-proposals');
              onOpenReview?.();
            }}
          />,
        )}
        <FindingsTable
          rows={R.findings}
          sel={0}
          onSelect={(id) => {
            if (id === 'FND-02') switchView('split');
            recordIntent('F505:select:' + id);
          }}
        />
        <div className="gpd-card" data-feature="F507">
          <h3>
            Proposed tickets<span>{selectedCount} selected</span>
          </h3>
          <div className="gpd-list">
            {R.proposals.map((p) => {
              const checked = !!selectedProposals[p[0]];
              return (
                <div
                  key={p[0]}
                  className="gpd-li"
                  style={{ gridTemplateColumns: '22px 60px minmax(0,1fr) auto' }}
                  onClick={() =>
                    setSelectedProposals((prev) => ({ ...prev, [p[0]]: !prev[p[0]] }))
                  }
                >
                  <CheckBox on={checked} />
                  <code>{p[0]}</code>
                  <span>
                    {p[1]}
                    <small>
                      From {p[3]} · against {p[2]}
                    </small>
                  </span>
                  <Pill tone="acc" label="Proposal" />
                </div>
              );
            })}
          </div>
          <div className="s">FND-03 has no ticket: the missing item is a run, not code. Upload the E2E run instead.</div>
        </div>
      </>
    );
  }

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Review chat"
          sub="build 0412 vs r14"
          ctxItems={CTX}
          ctxFoot="≈ 3.2k tokens · secrets by name only"
          placeholder="Ask about this report, or @ a requirement…"
          draft={wsView.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setWsView('testing', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={() => {}}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setWsView('testing', { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={handleChatSend}
        >
          <div className="sp-ub">{chatMessages[view].msg}</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 2 min · 31 cr</em>
            </div>
            {chatMessages[view].reply}
          </div>
        </ChatPanel>
      ) : null}
      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={[
            { icon: 'check', name: 'Review report · build 0412' },
            { icon: 'doc', name: 'Spec r14' },
            { icon: 'list', name: 'Tests' },
          ]}
          activeTab={activeTab}
          onSelect={(tab) => setActiveTab(tab)}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={
            <Btn
              label="Export report"
              icon="download"
              does="Downloads this report as Markdown, labelled as an unverified continuation packet; secrets are redacted"
              feature="F508"
              onClick={handleExport}
            />
          }
        />
        {banner}
        <div className="gpd-sub" role="tablist" aria-label="Report sections">
          <button
            type="button"
            className="gpd-sbtn"
            aria-pressed={activeSection === 0 ? 'true' : 'false'}
            data-does="Shows evidence, missing inputs and both axes"
            data-feature="F501"
            onClick={() => switchView('report')}
          >
            Overview
          </button>
          <button
            type="button"
            className="gpd-sbtn"
            aria-pressed={activeSection === 1 ? 'true' : 'false'}
            data-does="Lists requirements and outcomes"
            data-feature="F503"
            onClick={() => switchView('split')}
          >
            Spec coverage<span className="n">5</span>
          </button>
          <button
            type="button"
            className="gpd-sbtn"
            aria-pressed={activeSection === 2 ? 'true' : 'false'}
            data-does="Lists standards and outcomes"
            data-feature="F504"
            onClick={() => switchView('split')}
          >
            Standards<span className="n">4</span>
          </button>
          <button
            type="button"
            className="gpd-sbtn"
            aria-pressed={activeSection === 3 ? 'true' : 'false'}
            data-does="Shows the six risk dimensions and the human decisions they need"
            data-feature="F506"
            onClick={() => switchView('risk')}
          >
            Risk review<span className="n">3</span>
          </button>
          <button
            type="button"
            className="gpd-sbtn"
            aria-pressed={activeSection === 4 ? 'true' : 'false'}
            data-does="Lists findings and the tickets proposed from them"
            data-feature="F505"
            onClick={() => switchView('prop')}
          >
            Findings<span className="n">4</span>
          </button>
        </div>
        <div className="sp-work">
          <div className="gpd-pane">{pane}</div>
          {inspector}
        </div>
      </section>
    </>
  );
}
