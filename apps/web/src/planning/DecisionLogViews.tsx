import type { SampleDecisionLogEntry, SampleNoBasis, SampleOpenQuestion } from '../data/source';
import { Inspector, InspectorRow } from '../shell/Inspector';
import { Btn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

export type DecisionFilter = 'all' | 'int' | 'plan' | 'kit' | 'open';

export interface DecisionCounts {
  all: number;
  int: number;
  plan: number;
  kit: number;
  open: number;
}

export function filterDecisionRows(rows: SampleDecisionLogEntry[], query: string): SampleDecisionLogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (r) =>
      r.id.toLowerCase().includes(q) ||
      r.q.toLowerCase().includes(q) ||
      r.qt.toLowerCase().includes(q) ||
      r.dec.toLowerCase().includes(q) ||
      r.alts.some((a) => a.toLowerCase().includes(q)),
  );
}

export function DecisionFilterBar(props: {
  active: DecisionFilter;
  counts: DecisionCounts;
  query: string;
  onFilter: (f: DecisionFilter) => void;
  onQueryChange: (q: string) => void;
}) {
  const { active, counts, query, onFilter, onQueryChange } = props;
  const chips: [string, number, DecisionFilter][] = [
    ['All', counts.all, 'all'],
    ['Interview', counts.int, 'int'],
    ['Plan', counts.plan, 'plan'],
    ['Kit', counts.kit, 'kit'],
    ['Open questions', counts.open, 'open'],
  ];
  return (
    <div className="gpa-nw gpa-fbar" data-feature="F423">
      {chips.map(([label, count, key]) => (
        <button
          key={key}
          type="button"
          className="gpa-fc"
          aria-pressed={key === active ? 'true' : 'false'}
          data-does={`Filters the log to ${label.toLowerCase()} entries; the count stays on the chip`}
          data-feature="F423"
          onClick={() => onFilter(key)}
        >
          {label}
          <b>{count}</b>
        </button>
      ))}
      <div className="gpa-sbox ap-ta-wrap">
        <Icon name="search" size={13} />
        <span className="ap-ta-ph">{query || 'Search decisions'}</span>
        <input
          type="text"
          className="ap-ta-input"
          aria-label="Search decisions"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function AltChips({ alts, pick }: { alts: string[]; pick?: string }) {
  return (
    <div className="gpa-alt">
      {pick ? <span className="pick">{pick}</span> : null}
      {alts.map((a) => (
        <span key={a}>{a}</span>
      ))}
    </div>
  );
}

export function DecisionLogTable(props: {
  rows: SampleDecisionLogEntry[];
  selectedId: string | null;
  freshId: string | null;
  onSelect: (id: string) => void;
}) {
  const { rows, selectedId, freshId, onSelect } = props;
  return (
    <div className="gpa-nw" data-feature="F421">
      <table className="sp-tbl">
        <thead>
          <tr>
            <th style={{ width: '62px' }}>ID</th>
            <th style={{ width: '150px' }}>Question</th>
            <th>Decision</th>
            <th style={{ width: '210px' }}>Alternatives offered</th>
            <th style={{ width: '96px' }}>Written</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const cls = [r.id === selectedId ? 'sel' : '', r.id === freshId ? 'fresh' : ''].filter(Boolean).join(' ');
            return (
              <tr key={r.id} className={cls || undefined}>
                <td>
                  <button
                    type="button"
                    className="gpa-idb"
                    data-does={`Selects ${r.id} and opens its detail in the inspector`}
                    data-feature="F424"
                    onClick={() => onSelect(r.id)}
                  >
                    {r.id}
                  </button>
                </td>
                <td>
                  {r.qt}
                  <small>{r.q}</small>
                </td>
                <td>
                  <b>{r.dec}</b>
                  <small>{r.how}</small>
                </td>
                <td>
                  <AltChips alts={r.alts} />
                </td>
                <td>
                  {r.at}
                  {r.id === freshId ? (
                    <small data-feature="F422">
                      <Pill tone="ok" label="Just written" />
                    </small>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function OpenQuestionsTable(props: {
  rows: SampleOpenQuestion[];
  onOpenId: (id: string) => void;
  onAnswerNow: (id: string) => void;
}) {
  const { rows, onOpenId, onAnswerNow } = props;
  return (
    <div className="gpa-nw" data-feature="F425">
      <table className="sp-tbl">
        <thead>
          <tr>
            <th style={{ width: '62px' }}>ID</th>
            <th>Question</th>
            <th style={{ width: '120px' }}>Skipped</th>
            <th style={{ width: '170px' }}>Lives in</th>
            <th style={{ width: '110px' }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id}>
              <td>
                <button
                  type="button"
                  className="gpa-idb"
                  data-does={`Opens ${o.id} in the spec document, section 2`}
                  data-feature="F425"
                  onClick={() => onOpenId(o.id)}
                >
                  {o.id}
                </button>
              </td>
              <td>
                <b>{o.qt}</b>
                <small>{o.q}</small>
              </td>
              <td>{o.at}</td>
              <td>{o.where}</td>
              <td>
                <Btn
                  label="Answer now"
                  sm
                  cls="ink"
                  does="Brings the question back into the interview chat as the current question"
                  feature="F425"
                  onClick={() => onAnswerNow(o.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DecisionSummaryInspector(props: {
  openQuestion: SampleOpenQuestion;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onShowOpen: () => void;
  onMore: () => void;
}) {
  const { openQuestion, activeTab, onSelectTab, onShowOpen, onMore } = props;
  return (
    <Inspector
      title="Decision log"
      pill={['ok', '3 decisions']}
      sub="Append only · 1 open question"
      tabs={['Summary', 'Sources', 'Open']}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      onMore={onMore}
    >
      <div className="sp-sec">
        <h4>
          By source<span>3</span>
        </h4>
        <InspectorRow id="INT" name="Interview" sub="3 entries · 2 accepted, 1 edited" pill={['ok', '3']} />
        <InspectorRow id="PLN" name="Plan" sub="No plan decisions yet" pill={['mute', '0']} />
        <InspectorRow id="KIT" name="Design kit" sub="Recorded when Detailed is generated" pill={['mute', '0']} />
      </div>
      <div className="sp-ready">
        <div className="t">
          Open questions
          <span className="pill warn">1</span>
        </div>
        <p>
          {openQuestion.q} “{openQuestion.qt}” was skipped and lives in the spec, section 2.
        </p>
        <Btn
          label="Show open questions"
          sm
          cls="ink"
          does="Filters the log to open questions"
          feature="F425"
          onClick={onShowOpen}
        />
      </div>
    </Inspector>
  );
}

export function DecisionEntryInspector(props: {
  entry: SampleDecisionLogEntry;
  isKit: boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenInChat: () => void;
  onRevise: () => void;
  onProposeKit: () => void;
  onMore: () => void;
}) {
  const { entry, isKit, activeTab, onSelectTab, onOpenInChat, onRevise, onProposeKit, onMore } = props;
  const heading = `${entry.id} ${entry.field || entry.kind}`;
  return (
    <Inspector
      title={heading}
      pill={['ok', entry.how]}
      sub={`${entry.q} · ${entry.by} · ${entry.at}`}
      tabs={['Entry', 'Sources', 'Used by']}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      onMore={onMore}
    >
      <div className="sp-sec">
        <h4>
          Decision<span />
        </h4>
        <div className="sp-row">
          <span className="nm">
            {entry.dec}
            <small>{entry.qt}</small>
          </span>
        </div>
      </div>
      <div className="sp-sec">
        <h4>
          Alternatives offered<span>{entry.alts.length + 1}</span>
        </h4>
        <div className="gpa-alt" style={{ padding: '0 4px 4px' }}>
          <AltChips alts={entry.alts} pick={entry.dec} />
        </div>
      </div>
      <div className="sp-sec">
        <h4>
          Source note<span />
        </h4>
        <div className="sp-row">
          <span className="id">
            <Icon name="doc" size={14} />
          </span>
          <span className="nm">
            {entry.kind === 'Kit' ? 'Planning chat' : 'Interview chat'} · {entry.q}
            <small>
              {entry.at} · {entry.by}
            </small>
          </span>
          <Btn
            label="Open in chat"
            sm
            does="Scrolls the interview chat to the message that wrote this entry"
            feature="F424"
            onClick={onOpenInChat}
          />
        </div>
      </div>
      {isKit ? (
        <>
          <div className="sp-sec">
            <h4>
              Plan<span>1</span>
            </h4>
            <InspectorRow id="PLAN-01" name="Design kit" sub="Used by DESIGN.md r1 and tokens.json" pill={['ok', 'Active']} />
          </div>
          <div className="sp-ready">
            <div className="t">
              Change the kit
              <span className="pill acc">Proposal</span>
            </div>
            <p>A different kit is proposed, diffed and accepted in S08. D-004 stays in the log.</p>
            <Btn
              label="Propose another kit"
              sm
              does="Opens a proposal to change the kit; accepting it writes a new entry that supersedes D-004"
              feature="F426"
              onClick={onProposeKit}
            />
          </div>
        </>
      ) : (
        <div className="sp-sec">
          <h4>
            Used by<span>1</span>
          </h4>
          <InspectorRow id="Pitch" name="Appetite" sub="Proposal r1" pill={['acc', 'Proposed']} />
        </div>
      )}
      <div className="sp-ready">
        <div className="t">
          Append only
          <span className="pill mute">Log</span>
        </div>
        <p>An entry is never edited. A revision adds a new entry that supersedes this one; the old one stays visible.</p>
        <Btn
          label="Revise this decision"
          sm
          cls="ink"
          does="Starts a new entry that supersedes this one after you confirm; the old entry keeps its text and time"
          feature="F427"
          onClick={onRevise}
        />
      </div>
    </Inspector>
  );
}

export function OpenQuestionsInspector(props: {
  noBasis: SampleNoBasis;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onConfirmNoBasis: () => void;
  onRemoveNoBasis: () => void;
  onMore: () => void;
}) {
  const { noBasis, activeTab, onSelectTab, onConfirmNoBasis, onRemoveNoBasis, onMore } = props;
  return (
    <Inspector
      title="Open and unbased"
      pill={['warn', '2 to look at']}
      sub="Spec statements that no decision backs"
      tabs={['Open', 'No basis', 'Sources']}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      onMore={onMore}
    >
      <div className="sp-sec">
        <h4>
          No basis (tanpa dasar)<span>1</span>
        </h4>
        <div className="sp-gc">
          <div className="k">
            <Icon name="alert" size={12} />
            Tanpa dasar
            <span className="tag">
              <Pill tone="warn" label="Confirm" />
            </span>
          </div>
          <div className="tt">{noBasis.text}</div>
          <div className="bd">
            {noBasis.where}. {noBasis.note}
          </div>
          <div className="ft">
            <Btn
              label="Confirm as decision"
              sm
              cls="ink"
              does="Writes a decision-log entry for this statement after you confirm it"
              feature="F429"
              onClick={onConfirmNoBasis}
            />
            <Btn
              label="Remove"
              sm
              cls="plain"
              does="Proposes removing the statement from the spec; it goes to review in S08"
              feature="F429"
              onClick={onRemoveNoBasis}
            />
          </div>
        </div>
      </div>
      <div className="sp-sec">
        <h4>
          Open questions<span>1</span>
        </h4>
        <InspectorRow id="OQ-01" name="Actual costs source" sub="Skipped at Q-04" pill={['warn', 'Open']} />
      </div>
    </Inspector>
  );
}

export function DecisionEmptyState(props: { onStartInterview: () => void }) {
  return (
    <div className="gpa-empty">
      <div
        className="gpa-nw"
        data-feature="F428"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '26px 30px' }}
      >
        <Icon name="list" size={28} />
        <h3>No decisions yet</h3>
        <p>Every answer you accept in the interview is written here with the question, the other answers offered and the time.</p>
        <Btn
          label="Start the interview"
          cls="ink"
          does="Opens the interview at question 1 for this project"
          feature="F428"
          onClick={props.onStartInterview}
        />
      </div>
    </div>
  );
}
