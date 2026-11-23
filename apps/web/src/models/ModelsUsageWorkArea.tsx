import { useEffect, useState, type ReactNode } from 'react';
import { sampleData, SAMPLE_PROJECT_ID, type ModelsLedgerKind, type ModelsSourceId, type ModelsUsageMoment, type PillTuple, type SampleModelsCaps, type SampleModelsUsage } from '../data/source';
import { useData, useDataRead } from '../data/provider';
const { CTX_DESIGN, MODELS_AGENT_RUN, MODELS_AGENTS, MODELS_API, MODELS_CAPS, MODELS_CONNECTOR, MODELS_EFFORT, MODELS_KEY, MODELS_LEDGER, MODELS_LEDGER_DETAIL, MODELS_PERIOD, MODELS_PROVIDERS, MODELS_RUN, MODELS_SOURCES, MODELS_TASKS, MODELS_USAGE } = sampleData;
import { Icon, type IconName } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';

// S36 Models and usage. Board: docs/design/spekin-canvas/project/S36-models-usage.dc.html (data-screen="S36").
// Each card mirrors boards-models.mjs: same classes, text, order and data-feature ids. Credits are fixture units.
export type UsageSection = 'models' | 'next' | 'ledger' | 'limits';
export type UsageMoment = ModelsUsageMoment;
export type LedgerFilter = 'all' | 'hosted' | 'cli' | 'byok' | 'adjustments';

const SECTIONS: UsageSection[] = ['models', 'next', 'ledger', 'limits'];
const MOMENTS: UsageMoment[] = ['calm', 'near', 'capped'];
const FILTERS: [LedgerFilter, string][] = [
  ['all', 'All'],
  ['hosted', 'Hosted'],
  ['cli', 'CLI'],
  ['byok', 'BYOK'],
  ['adjustments', 'Adjustments'],
];

export const isUsageSection = (v: string | null): v is UsageSection => SECTIONS.includes(v as UsageSection);
export const isUsageMoment = (v: string | null): v is UsageMoment => MOMENTS.includes(v as UsageMoment);

const fmt = (n: number) => n.toLocaleString('en-US');

// committed = used + reserved + pending; share = committed / cap. The meter, severity and cap check all use it.
export function usageCommitted(u: SampleModelsUsage): number {
  return u.used + u.reserved + u.pending;
}
export function usagePct(u: SampleModelsUsage): number {
  return Math.round((usageCommitted(u) / u.cap) * 100);
}
export function usageSeverity(u: SampleModelsUsage): 'calm' | 'warn' | 'crit' {
  const pct = usageCommitted(u) / u.cap;
  return pct >= 0.9 ? 'crit' : pct >= 0.7 ? 'warn' : 'calm';
}
// A new hosted run is refused at the cap: reserved and pending credits already count (board note, S36).
export function nextRunBlocked(u: SampleModelsUsage): boolean {
  return usageCommitted(u) >= u.cap;
}
// An API key is never shown: presence plus the last 4 characters only (card acceptance, IMP-17).
export function maskKeyTail(key: string): string {
  return '····' + key.slice(-4);
}
export function maskTypedKey(key: string): string {
  return key ? 'sk-ant-' + '•'.repeat(6) + key.slice(-4) : 'sk-ant-••••••••••••••';
}

const HOSTED_KINDS: ModelsLedgerKind[] = ['reserve', 'settle', 'refund', 'hold'];
export function filterLedgerRows(rows: typeof MODELS_LEDGER, filter: LedgerFilter): typeof MODELS_LEDGER {
  if (filter === 'all') return rows;
  if (filter === 'hosted') return rows.filter((r) => HOSTED_KINDS.includes(r.kind));
  if (filter === 'adjustments') return [];
  return rows.filter((r) => r.kind === filter);
}

const KIND: Record<ModelsLedgerKind, string> = {
  reserve: 'RESERVE',
  settle: 'SETTLE',
  refund: 'REFUND',
  hold: 'HOLD',
  byok: 'BYOK',
  cli: 'CLI',
};

function Card(props: { feature: string; cls?: string; children: ReactNode }) {
  return (
    <div className={'mod-r' + (props.cls ? ' ' + props.cls : '')} data-feature={props.feature}>
      {props.children}
    </div>
  );
}

// ---------------------------------------------------------------- top-level screen
export function ModelsUsageWorkArea(props: {
  section: UsageSection;
  moment: UsageMoment;
  initialSource?: ModelsSourceId;
  initialFilter?: LedgerFilter;
  onSection: (section: UsageSection) => void;
  onExit: (tab: string) => void;
  onIntent?: (intent: string) => void;
}) {
  const { section, moment, initialSource = 'hosted', initialFilter = 'all', onSection, onExit } = props;
  const intent = props.onIntent ?? (() => {});
  // IMP-37: the registry comes through the data door; sample mode is the drawn row.
  const data = useData();
  const registry = useDataRead('models', data.sample.MODELS_REGISTRY, (s) => s.models(), []).value ?? [];
  const [source, setSource] = useState<ModelsSourceId>(initialSource);
  const [filter, setFilter] = useState<LedgerFilter>(initialFilter);
  const [caps, setCaps] = useState<SampleModelsCaps>({ ...MODELS_CAPS });
  const [effort, setEffort] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [sourceKey, setSourceKey] = useState(MODELS_API.sel);
  // IMP-41: Send estimates, reserves and settles through the data door. The words below appear
  // only after the source answered; a refused reserve never reads as "reserved".
  const [runWrite, setRunWrite] = useState<'idle' | 'saving' | 'done' | 'failed'>('idle');
  const [runMessage, setRunMessage] = useState<string | null>(null);

  async function sendRun() {
    if (runWrite === 'saving') return;
    if (source !== 'hosted') {
      intent(source === 'cli' ? 'F287:send-cli' : 'F287:send-api');
      return;
    }
    setRunWrite('saving');
    setRunMessage('Estimating…');
    const estimate = await data.estimateRun(SAMPLE_PROJECT_ID, {
      min: MODELS_RUN.est[0],
      max: MODELS_RUN.est[1],
      reserve: MODELS_RUN.reserve,
    });
    if (!estimate.ok) {
      setRunWrite('failed');
      setRunMessage(estimate.message);
      return;
    }
    const reserved = await data.reserveRun(SAMPLE_PROJECT_ID, {
      run_id: 'run-' + MODELS_RUN.id,
      person_id: 'rina',
      idempotency_key: 'k-' + MODELS_RUN.key,
      estimate: estimate.value,
    });
    if (!reserved.ok) {
      setRunWrite('failed');
      setRunMessage(reserved.message);
      return;
    }
    // The sample run finishes at once, so it settles to its expected cost and releases the rest.
    const settled = await data.settleRun(SAMPLE_PROJECT_ID, {
      run_id: reserved.value.run_id,
      actual: MODELS_RUN.expect,
    });
    if (!settled.ok) {
      setRunWrite('failed');
      setRunMessage(settled.message);
      return;
    }
    setRunWrite('done');
    setRunMessage(
      'Reserved ' + reserved.value.reserved + ' cr · settled ' + settled.value.charged + ' cr · ' + settled.value.refunded + ' cr released',
    );
  }

  useEffect(() => {
    setDraft(null);
    setEffort(null);
    setSourceKey(MODELS_API.sel);
  }, [section, source, moment]);

  const usage: SampleModelsUsage = { ...MODELS_USAGE[moment], cap: caps.monthly };
  const committed = usageCommitted(usage);
  const pct = usagePct(usage);
  const sev = usageSeverity(usage);
  const blocked = nextRunBlocked(usage);

  // ---------------------------------------------------------------- composer (state per source and section)
  const hosted = {
    text: 'Try 2 more takes of the F-04 drawer with a denser table.',
    resv: null as null | 'est' | 'cli' | 'api' | 'crit',
    est: '≈ 18–30 cr',
    src: 'HOSTED',
    mdl: 'Sonnet 5.5',
    eff: 'High',
    send: true,
  };
  const comp =
    section === 'limits'
      ? { ...hosted, est: '', resv: 'crit' as const, send: false }
      : section === 'next'
        ? { ...hosted, resv: 'est' as const }
        : section === 'ledger'
          ? { ...hosted, text: 'Ask for a different take of F-03.' }
          : source === 'cli'
            ? { text: 'Summarise the variance rules in F-03 as a short list.', resv: 'cli' as const, est: '', src: 'CLI', mdl: 'Claude Code', eff: 'Medium', send: true }
            : source === 'api'
              ? { text: 'Check the new key with a short style summary.', resv: 'api' as const, est: '≈ 9.8k tok', src: 'API', mdl: 'Sonnet 5.5', eff: 'High', send: true }
              : hosted;
  const text = draft ?? comp.text;
  const shownEff = effort ?? comp.eff;

  const resvNode = (() => {
    if (comp.resv === null) return null;
    if (comp.resv === 'est')
      return (
        <div className="mod-resv">
          <Icon name="clock" size={13} />
          <span>
            Reserves <b>{MODELS_RUN.reserve} cr</b> on Send · settles on finish
          </span>
        </div>
      );
    if (comp.resv === 'cli')
      return (
        <div className="mod-resv">
          <Icon name="folder" size={13} />
          <span>
            Runs in a <b>work copy</b> · no Spekin credits
          </span>
        </div>
      );
    if (comp.resv === 'api')
      return (
        <div className="mod-resv">
          <Icon name="key" size={13} />
          <span>
            Your provider bills this run · <b>0 cr</b> debited
          </span>
        </div>
      );
    return (
      <div className="mod-resv crit">
        <Icon name="clock" size={13} />
        <span>Send is off: the monthly cap is reached</span>
      </div>
    );
  })();

  const composer = (
    <div className="sp-comp">
      <div className="ta ap-ta-wrap">
        <span className="ap-ta-ph" aria-hidden="true">
          {text}
        </span>
        <textarea
          className="ap-ta-input"
          aria-label="Message composer"
          value={text}
          onChange={(e) => setDraft(e.target.value)}
        />
      </div>
      {resvNode}
      <div className="row">
        <span className="mod-r" data-feature="F281">
          <button
            type="button"
            className="sp-model"
            data-does="Opens Models: source, provider, model and effort for this chat"
            data-feature="F281"
            onClick={() => onSection('models')}
          >
            <span className="src">{comp.src}</span>
            {comp.mdl}
            <Icon name="chev" size={12} />
          </button>
        </span>
        <button
          type="button"
          className="mod-eff"
          data-does="Changes the effort for this run; the estimate updates before Send"
          data-feature="F283"
          onClick={() => {
            const names = MODELS_EFFORT.map(([n]) => n);
            const at = names.indexOf(shownEff);
            setEffort(names[(at + 1) % names.length] ?? names[0] ?? 'High');
            intent('F283:effort');
          }}
        >
          {shownEff}
          <Icon name="chev" size={11} />
        </button>
        <span className="sp-est">{comp.est}</span>
        {comp.send ? (
          <button
            type="button"
            className="sp-send"
            aria-label="Send"
            disabled={runWrite === 'saving'}
            data-does="Sends with exactly the listed context after reserving the maximum estimate"
            data-feature="F287"
            onClick={() => void sendRun()}
          >
            <Icon name="up" size={15} stroke={2} />
          </button>
        ) : (
          <button
            type="button"
            className="sp-send"
            aria-label="Send"
            disabled
            aria-disabled
            data-does="Send is off: the monthly cap is reached, so no new hosted run is accepted"
            data-feature="F294"
          >
            <Icon name="up" size={15} stroke={2} />
          </button>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------------- chat panel with the S36 composer
  const ctxChips = CTX_DESIGN.map(([k, n, r]) => (
    <span className="sp-cchip" key={n}>
      <Icon name={k === 'frame' ? 'frame' : k === 'doc' ? 'doc' : k === 'req' ? 'req' : 'image'} size={12} />
      {n}
      <span className="r">{r}</span>
    </span>
  ));

  const chat = (
    <aside className="sp-chat" aria-label="Conversation">
      <div className="sp-chat-h">
        <b>Design chat</b>
        <span>· F-03 selected</span>
      </div>
      <div className="sp-ctx">
        <div className="t">
          Context for the next run<span>4 items · 9.8k tokens</span>
        </div>
        <div className="sp-cc">{ctxChips}</div>
        <div className="f">The whole board is never sent</div>
      </div>
      <div className="sp-msgs">
        <div className="sp-ub">Add an alert drawer to the variance table for packages over 3%.</div>
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>
            Spekin
            <em>Sonnet 5.5 · 34 s · 24 cr</em>
          </div>
          <p>
            Drew <b>F-04 Alert drawer</b> as a draft. F-03 stays accepted at r6.
          </p>
          <div className="mod-run mod-r" data-feature="F288">
            <div className="rh">
              <Icon name="clock" size={14} />
              Run 0426
              <Pill tone="ok" label="Settled" />
            </div>
            <div className="rg">
              <div>
                Estimate<b>18–30</b>
              </div>
              <div>
                Reserved<b>36</b>
              </div>
              <div>
                Charged<b>24</b>
              </div>
              <div>
                Refunded<b>12</b>
              </div>
            </div>
            <div className="ft">
              <span className="s">credits · Sonnet 5.5 · 34 s</span>
              <Btn
                label="Ledger"
                sm
                does="Opens the usage ledger at run 0426: its reserve, settle and refund entries"
                feature="F289"
                onClick={() => onSection('ledger')}
              />
            </div>
          </div>
        </div>
      </div>
      {composer}
    </aside>
  );

  // ---------------------------------------------------------------- page frame
  const tabsBar = (
    <div className="sp-tabs" role="tablist" aria-label="Open artifacts">
      {(
        [
          ['grid', 'Variance flows'],
          ['frame', 'F-03 Variance table'],
          ['frame', 'F-04 Alert drawer'],
          ['sliders', 'Models and usage'],
        ] as [IconName, string][]
      ).map(([icon, name]) => (
        <button
          key={name}
          type="button"
          role="tab"
          className="sp-tab"
          aria-selected={name === 'Models and usage' ? 'true' : 'false'}
          data-does={'Shows ' + name + ' in the work area; tabs are artifacts, not stages'}
          data-feature="F104"
          onClick={() => {
            if (name !== 'Models and usage') onExit(name);
          }}
        >
          <Icon name={icon as IconName} size={14} />
          {name}
          <span className="x">
            <Icon name="x" size={11} />
          </span>
        </button>
      ))}
      <span className="sp-fill" />
      <Btn
        label="Hand off"
        cls="ink"
        icon="download"
        does="Opens S34: downloads only accepted revisions with a fixed revision manifest"
        feature="F104"
        onClick={() => intent('F104:handoff')}
      />
    </div>
  );

  const nav: [UsageSection, string, IconName, string][] = [
    ['models', 'Models', 'sliders', 'Shows the model source, provider, model and effort'],
    ['next', 'Next run', 'up', 'Shows the estimate, checks and reservation for the run in the composer'],
    ['ledger', 'Ledger', 'layers', 'Shows every reserve, settle and refund entry of this project'],
    ['limits', 'Limits', 'flag', 'Shows caps, thresholds and what happens at each'],
  ];

  const page = (opts: { lf: string; banner?: ReactNode; left: ReactNode; side: ReactNode }) => (
    <section className="sp-main" aria-label="Work area">
      {tabsBar}
      {opts.banner}
      <div className="mod-page">
        <div className="mod-ph">
          <div className="mod-ttl">
            <h2>Models and usage</h2>
            <span>Meranti Yard · every run in this project</span>
          </div>
          <span className="sp-fill" />
          <div className="sp-seg" role="group" aria-label="Models and usage sections">
            {nav.map(([id, label, icon, does]) => (
              <button
                key={id}
                type="button"
                aria-pressed={id === section}
                data-does={does}
                data-feature={id === 'models' ? 'F281' : id === 'next' ? 'F287' : id === 'ledger' ? 'F289' : 'F291'}
                onClick={() => onSection(id)}
              >
                <Icon name={icon} size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mod-cols">
          <div className="mod-left mod-r" data-feature={opts.lf}>
            {opts.left}
          </div>
          <aside className="mod-side" aria-label="Usage this month">
            {opts.side}
          </aside>
        </div>
      </div>
    </section>
  );

  // ---------------------------------------------------------------- side panels
  const usagePanel = (
    <Card feature="F290" cls={'mod-card mod-sev-' + sev}>
      <div className="mod-h">
        This month
        <em>
          {MODELS_PERIOD.label} · resets {MODELS_PERIOD.resets}
        </em>
      </div>
      <div className="mod-big">
        <b>{fmt(usage.used)}</b>
        <span>of {fmt(usage.cap)} cr used</span>
        {sev === 'crit' ? (
          <Pill tone="bad" label="Critical · 90%+" />
        ) : sev === 'warn' ? (
          <Pill tone="warn" label="Warn · 70%+" />
        ) : (
          <Pill tone="ok" label="Calm" />
        )}
      </div>
      <div className="mod-barw">
        <div className="mod-bar">
          <i className="u" style={{ width: ((usage.used / usage.cap) * 100).toFixed(2) + '%' }} />
          <i className="r" style={{ width: ((usage.reserved / usage.cap) * 100).toFixed(2) + '%' }} />
          <i className="p" style={{ width: ((usage.pending / usage.cap) * 100).toFixed(2) + '%' }} />
        </div>
        <span className="mod-tk" style={{ left: '70%' }} />
        <span className="mod-tk" style={{ left: '90%' }} />
        <span className="mod-tkl" style={{ left: '70%' }}>
          70%
        </span>
        <span className="mod-tkl" style={{ left: '90%' }}>
          90%
        </span>
      </div>
      <div className="mod-leg">
        <div>
          <i className="u" />
          <span>Used</span>
          <b>{fmt(usage.used)}</b>
        </div>
        <div>
          <i className="r" />
          <span>Reserved, in flight</span>
          <b>{usage.reserved}</b>
        </div>
        <div>
          <i className="p" />
          <span>Pending reconciliation</span>
          <b>{usage.pending}</b>
        </div>
        <div>
          <i className="l" />
          <span>Left under the cap</span>
          <b>{fmt(Math.max(0, usage.cap - committed))}</b>
        </div>
      </div>
    </Card>
  );

  const winRow = (label: string, [a, b, r]: [number, number, string]) => {
    const share = Math.round((a / b) * 100);
    const k = share >= 90 ? ' crit' : share >= 70 ? ' warn' : '';
    return (
      <div className={'mod-win' + k}>
        <div className="l">
          <b>{label}</b>
          <span>
            {fmt(a)} of {fmt(b)} cr
          </span>
        </div>
        <div className="tr">
          <i style={{ width: share + '%' }} />
        </div>
        <small>
          {share}% · resets {r}
        </small>
      </div>
    );
  };

  const winPanel = (
    <Card feature="F290" cls="mod-card">
      <div className="mod-h">
        Rate windows<em>Hosted · sample units</em>
      </div>
      {winRow('5 hours', usage.win5)}
      {winRow('7 days', usage.win7)}
    </Card>
  );

  const topUp = (long = false) => (
    <Card feature="F295" cls="mod-card">
      <div className="mod-h">Top up credits</div>
      <div className="mod-qr">
        <span className="bx">
          <Icon name="qr" size={22} />
        </span>
        <p className="mod-p">
          Pay by QRIS through a payment adapter. Credits are added once, after the payment is verified. Automatic top-up stays off.
          {long ? ' Pack sizes and prices are not decided yet.' : ''}
        </p>
      </div>
      <Btn label="Top up" later="Credit top-up through a payment adapter (R-PAY-1 to R-PAY-5; owner leaning Midtrans QRIS, Xendit swappable; Q-05)" />
    </Card>
  );

  const byokSide = (
    <Card feature="F285" cls="mod-card">
      <div className="mod-h">
        BYOK this month<em>reported by the provider</em>
      </div>
      <div className="mod-leg">
        <div>
          <i className="l" />
          <span>Runs</span>
          <b>{MODELS_KEY.usage.runs}</b>
        </div>
        <div>
          <i className="l" />
          <span>Tokens in / out</span>
          <b>
            {MODELS_KEY.usage.tokensIn} / {MODELS_KEY.usage.tokensOut}
          </b>
        </div>
        <div>
          <i className="l" />
          <span>Credits debited</span>
          <b>0</b>
        </div>
      </div>
      <p className="mod-p">
        Billed by {MODELS_KEY.provider}, not by Spekin. Platform fee: none set; any fee is shown before a run.
      </p>
    </Card>
  );

  const cliSide = (
    <Card feature="F299" cls="mod-card">
      <div className="mod-h">
        Local CLI<em>reported by the agent</em>
      </div>
      <div className="mod-leg">
        <div>
          <i className="l" />
          <span>Runs</span>
          <b>{MODELS_AGENT_RUN.usage.runs}</b>
        </div>
        <div>
          <i className="l" />
          <span>Tokens in / out</span>
          <b className="mod-nr">{MODELS_AGENT_RUN.usage.tokens}</b>
        </div>
        <div>
          <i className="l" />
          <span>Agent plan window</span>
          <b className="mod-nr">{MODELS_AGENT_RUN.usage.plan}</b>
        </div>
        <div>
          <i className="l" />
          <span>Spekin credits used</span>
          <b>none</b>
        </div>
      </div>
      <p className="mod-p">
        Billed by the plan of your agent, not by Spekin. Where the agent reports usage it shows here; where it does not, the field says{' '}
        <b>not reported</b>, never 0.
      </p>
    </Card>
  );

  // ---------------------------------------------------------------- Models: source cards, registry, effort, routing
  const sourceCards = (sel: ModelsSourceId, compact: boolean) => (
    <Card feature="F281" cls="mod-bare">
      <div className="mod-src" role="radiogroup" aria-label="Model source">
        {MODELS_SOURCES.map((s) => {
          const on = s.id === sel;
          const does = {
            hosted: 'Uses Hosted: each run reserves Spekin credits and settles the actual cost',
            cli: 'Uses an agent on your computer through the Spekin Connector; its own plan bills, not Spekin credits',
            api: 'Uses your own provider key; opens provider setup, and the provider bills you',
          }[s.id];
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={'mod-sc' + (compact ? ' compact' : '')}
              data-does={does}
              data-feature="F281"
              onClick={() => setSource(s.id)}
            >
              <span className="t">
                <span className={'mod-rad' + (on ? ' on' : '')} />
                <Icon name={s.icon as IconName} size={16} />
                {s.name}
                {s.short ? <span className="mod-stg">{s.short}</span> : null}
              </span>
              <span className="s">
                <b className="bill">Bills: {compact ? s.billsC : s.bills}</b>
                {compact ? null : s.sub}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );

  const modelsCard = (
    <Card feature="F282" cls="mod-card">
      <div className="mod-h">
        Provider
        <span className="mod-pcs" role="group" aria-label="Provider">
          {MODELS_PROVIDERS.map(([n, c], i) => (
            <button
              key={n}
              type="button"
              className="mod-pc"
              aria-pressed={i === 0}
              data-does={'Lists the ' + n + ' models this source can use'}
              data-feature="F282"
              onClick={() => intent('F282:provider')}
            >
              {n}
              <small>{c}</small>
            </button>
          ))}
        </span>
        <em>Rate card rc-7 · region and retention unknown</em>
      </div>
      <div className="mod-mods" role="radiogroup" aria-label="Model">
        {registry.map((m) => {
          const on = m.st === 'sel';
          const off = m.st === 'off';
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={on}
              className="mod-mr"
              data-does={off ? 'Not available on this source: ' + m.note : 'Uses ' + m.name + ' for new runs in this project; the estimate updates before Send'}
              data-feature="F282"
              disabled={off || undefined}
              aria-disabled={off || undefined}
              onClick={off ? undefined : () => intent('F282:model')}
            >
              <span className={'mod-rad' + (on ? ' on' : '')} />
              <span className="nm">
                {m.name}
                <code>{m.id}</code>
              </span>
              <span className="cp">
                <i>
                  {m.caps.map((c) => (
                    <span className="mod-cap" key={c}>
                      {c}
                    </span>
                  ))}
                </i>
                {off ? <small>{m.note}</small> : null}
              </span>
              <span className="lm">
                {m.lim}
                <br />
                {m.rc}
              </span>
              <span className="es">{m.est}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );

  const effortCard = (
    <Card feature="F283" cls="mod-card">
      <div className="mod-row2">
        <div className="mod-col">
          <div className="mod-h">Effort</div>
          <div className="mod-seg" role="group" aria-label="Effort">
            {MODELS_EFFORT.map(([n], i) => (
              <button
                key={n}
                type="button"
                aria-pressed={i === 2}
                data-does={'Sets the effort to ' + n + '; the estimate and the reserve change with it'}
                data-feature="F283"
                onClick={() => setEffort(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mod-p">
            <b>High</b>: ≈ 1.6× tokens, slower.
          </p>
        </div>
        <div className="mod-col">
          <div className="mod-h">Model choice</div>
          <div className="mod-seg" role="group" aria-label="Routing">
            <button
              type="button"
              aria-pressed
              data-does="Uses the model you picked for every run; nothing is swapped"
              data-feature="F283"
              onClick={() => intent('F283:fixed')}
            >
              Fixed
            </button>
            <button
              type="button"
              aria-pressed={false}
              data-does="Lets routing pick a model per task inside your policy"
              data-feature="F283"
              onClick={() => intent('F283:auto')}
            >
              Auto
            </button>
          </div>
          <p className="mod-p">Auto never changes provider or cap without asking.</p>
        </div>
      </div>
    </Card>
  );

  const routingCard = (
    <Card feature="F283" cls="mod-card">
      <div className="mod-h">
        Routing by task
        <em>
          <Btn
            label="Edit routing"
            sm
            does="Edits which model each task uses; a provider change or a higher cost needs prior permission"
            feature="F283"
            onClick={() => intent('F283:edit-routing')}
          />
        </em>
      </div>
      <div className="mod-tbl">
        <div className="mod-tr mod-hd">
          <span>Task</span>
          <span>Model</span>
          <span>Source</span>
          <span>Note</span>
        </div>
        {MODELS_TASKS.map(([t, m, s, p]) => (
          <div className="mod-tr" key={t}>
            <b>{t}</b>
            <span>{m}</span>
            <span>{s}</span>
            <Pill tone={p[0]} label={p[1]} />
          </div>
        ))}
      </div>
    </Card>
  );

  // ---------------------------------------------------------------- Local CLI
  const CN = MODELS_CONNECTOR;
  const connector = (
    <Card feature="F293" cls="mod-card">
      <div className="mod-h">
        Spekin Connector
        <em>
          <Pill tone="ok" label={CN.state} />
          <Pill tone="ok" label="Paired" />
        </em>
      </div>
      <div className="mod-cn">
        <div>
          <span>Version</span>
          <b className="mod-mono">{CN.version}</b>
        </div>
        <div>
          <span>Listens on</span>
          <b className="mod-mono">{CN.addr}</b>
        </div>
        <div>
          <span>Pairing</span>
          <b>
            {CN.paired} at {CN.since}
          </b>
        </div>
        <div className="bt">
          <Btn
            label="Pair again"
            sm
            later="Pairing and runs through the Connector ship as a later adapter after a security review (C-05, ADR 0005, REV-02)"
            feature="F293"
          />
          <Btn
            label="Unpair"
            sm
            cls="danger"
            does="Removes the pairing after you confirm; the Connector then refuses this browser until it is paired again"
            feature="F293"
            onClick={() => intent('F293:unpair')}
          />
        </div>
      </div>
      <div className="mod-sec">
        <Icon name="shield" size={15} />
        <span>
          <b>This computer only.</b> You start the Connector once and type its code here: {CN.code}. The browser talks to it on 127.0.0.1 and nowhere else.
        </span>
      </div>
    </Card>
  );

  const agentRow = (a: (typeof MODELS_AGENTS)[number]) => {
    const none = a.inst === 'none';
    const blocked = none || a.sign === 'no';
    const dot = none ? 'ring' : a.sign === 'ok' ? 'ok' : a.sign === 'no' ? 'warn' : 'half';
    const does = blocked
      ? none
        ? a.name + ' is not found on this computer, so it cannot be used'
        : a.name + ' needs a sign-in first, so it cannot be used yet'
      : 'Uses ' + a.name + ' for new runs through the Connector; its own plan bills';
    return (
      <div className="mod-ag" key={a.name}>
        <button
          type="button"
          role="radio"
          aria-checked={!!a.pick}
          className="mod-agr"
          disabled={blocked}
          aria-disabled={blocked || undefined}
          data-does={does}
          data-feature="F296"
          onClick={() => intent('F296:agent')}
        >
          <span className={'mod-rad' + (a.pick ? ' on' : '')} />
          <span className="nm">
            <span>
              {a.name}
              {a.ver ? <code>{a.ver}</code> : null}
            </span>
            <small>
              <span className={'dot ' + dot} />
              {a.sub}
            </small>
          </span>
        </button>
        <span className="ac">
          {a.pick ? (
            <Pill tone="acc" label="In use" />
          ) : a.hint ? (
            <Btn
              label={a.hint}
              sm
              does={
                none
                  ? 'Opens the install guide of ' + a.name + ' in a new tab'
                  : 'Shows the command that signs in ' + a.name + ' in your terminal; Spekin never sees the login'
              }
              feature="F296"
              onClick={() => intent('F296:hint')}
            />
          ) : null}
        </span>
      </div>
    );
  };

  const agentsCard = (
    <Card feature="F296" cls="mod-card">
      <div className="mod-h">
        Agents on this computer
        <em>
          {MODELS_AGENTS.filter((a) => a.inst === 'ok').length} of {MODELS_AGENTS.length} found
          <Btn
            label="Scan again"
            sm
            does="Asks the Connector to look again for installed agents and their sign-in state"
            feature="F296"
            onClick={() => intent('F296:scan')}
          />
        </em>
      </div>
      <div className="mod-ags" role="radiogroup" aria-label="Agent">
        {MODELS_AGENTS.map(agentRow)}
      </div>
    </Card>
  );

  const segOf = (name: string, list: string[], on: number, what: string) => (
    <div className="mod-seg" role="group" aria-label={name}>
      {list.map((n, i) => (
        <button
          key={n}
          type="button"
          aria-pressed={i === on}
          data-does={what.replace('%', n)}
          data-feature="F297"
          onClick={() => intent('F297:' + name.toLowerCase())}
        >
          {n}
        </button>
      ))}
    </div>
  );

  const runSet = (
    <Card feature="F297" cls="mod-card">
      <div className="mod-h">
        Run settings<em>{MODELS_AGENT_RUN.agent}</em>
      </div>
      <div className="mod-inl">
        <span className="lb">Model</span>
        {segOf('Model', MODELS_AGENT_RUN.models, 0, 'Uses % for new runs; the agent lists its own models')}
        <span className="lb">Effort</span>
        {segOf('Effort', MODELS_AGENT_RUN.efforts, 1, 'Sets the agent effort to %')}
      </div>
      <div className="mod-col">
        <b className="mod-h2">Permission mode</b>
        <div className="mod-pm" role="radiogroup" aria-label="Permission mode">
          {MODELS_AGENT_RUN.perms.map(([n, s], i) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={i === MODELS_AGENT_RUN.perm}
              className="mod-pmo"
              data-does={'Sets the permission mode to: ' + n.toLowerCase()}
              data-feature="F297"
              onClick={() => intent('F297:perm')}
            >
              <span className={'mod-rad' + (i === MODELS_AGENT_RUN.perm ? ' on' : '')} />
              <span className="nm">
                {n}
                <small>{s}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="mod-wc">
        <Icon name="folder" size={15} />
        <span>
          <b>Runs in a separate work copy:</b> <span className="mod-mono">{MODELS_AGENT_RUN.copy}</span>. Your own checkout is never touched.
        </span>
      </div>
    </Card>
  );

  // ---------------------------------------------------------------- API provider (BYOK)
  const API = MODELS_API;
  const provider = API.providers[sourceKey] ?? API.providers[0]!;
  const provForm = (
    <Card feature="F285" cls="mod-card">
      <div className="mod-h">
        API provider
        <em>
          <Pill tone="mute" label="BYOK · test, then save" />
        </em>
      </div>
      <div className="mod-pcs" role="group" aria-label="Provider">
        {API.providers.map(([n], i) => (
          <button
            key={n}
            type="button"
            className="mod-pc"
            aria-pressed={i === sourceKey}
            data-does={'Sets the provider to ' + n + '; the base URL fills in for it'}
            data-feature="F285"
            onClick={() => setSourceKey(i)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mod-row2">
        <div className="mod-fld">
          <label>Base URL</label>
          <div className="mod-in ro">
            <Icon name="lock" size={14} />
            {provider[1]}
            <span className="end">prefilled</span>
          </div>
        </div>
        <div className="mod-fld">
          <label>API key</label>
          <div className="mod-in foc ap-key">
            <Icon name="key" size={14} />
            <span className="ap-key-ph">{maskTypedKey(apiKey)}</span>
            <span className="caret" />
            <span className="end">hidden</span>
            <input
              className="ap-key-input"
              aria-label="API key"
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </div>
      </div>
      <p className="mod-fine">Only Custom OpenAI-compatible lets you edit the base URL. Ollama on this computer needs no key and is reached through the Connector.</p>
      <div className="mod-sec">
        <Icon name="lock" size={15} />
        <span>
          <b>Write-only.</b> The key is encrypted on the server when you save it and is never shown again. Members, prompts, previews, exports and logs never see it.
        </span>
      </div>
      <div className="mod-foot">
        <Btn
          label="Test connection"
          icon="check"
          does="Calls the provider with the typed key and lists what passed; nothing is saved by a test"
          feature="F286"
          onClick={() => intent('F286:test')}
        />
        <Btn
          label="Save key"
          cls="ink"
          icon="lock"
          does="Encrypts the key on the server and clears the field; the key can be revoked but never read back"
          feature="F285"
          onClick={() => {
            setApiKey('');
            intent('F285:save-key');
          }}
        />
        <span className="mod-fine">Save unlocks after the test passes.</span>
      </div>
    </Card>
  );

  const testCard = (
    <Card feature="F286" cls="mod-card">
      <div className="mod-h">
        Connection test
        <em>
          <Pill tone="ok" label="Passed · 1 note" /> {MODELS_KEY.tested}
        </em>
      </div>
      <div className="mod-tst">
        {MODELS_KEY.tests.map(([k, l, d]) => (
          <div className="mod-ts" key={l}>
            {k === 'ok' ? (
              <span className="okc">
                <Icon name="check" size={15} stroke={2.2} />
              </span>
            ) : (
              <span className="wnc">
                <Icon name="alert" size={15} />
              </span>
            )}
            <b>{l}</b>
            <span>{d}</span>
          </div>
        ))}
      </div>
    </Card>
  );

  const modelCard = (
    <Card feature="F286" cls="mod-card">
      <div className="mod-h">
        Model
        <em>
          {API.fetchedCount} fetched from {provider[0]}
        </em>
      </div>
      <div className="mod-in">
        <Icon name="cpu" size={14} />
        {API.fetched[0]?.[0] ?? ''}
        <span className="end">
          <Btn label="Refresh" sm does="Fetches the model list from the provider again" feature="F286" onClick={() => intent('F286:refresh')} />
        </span>
      </div>
      <div className="mod-pcs" role="group" aria-label="Fetched models">
        {API.fetched.map(([id, n, st]) => (
          <button
            key={id}
            type="button"
            className="mod-pc"
            aria-pressed={st === 'sel'}
            data-does={'Uses ' + id + ' for new runs on this key; the estimate shows tokens'}
            data-feature="F286"
            onClick={() => intent('F286:fetched')}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className="mod-pc"
          aria-pressed={false}
          data-does="Lets you type a model id the provider does not list; it is checked on the next test"
          data-feature="F286"
          onClick={() => intent('F286:custom-id')}
        >
          <Icon name="plus" size={12} />
          Custom id
        </button>
      </div>
      <p className="mod-fine">Pick from the list or type your own id.</p>
    </Card>
  );

  const savedKey = (
    <Card feature="F285" cls="mod-card">
      <div className="mod-h">Saved key</div>
      <div className="mod-kr2">
        <span className="mod-pc">{MODELS_KEY.provider}</span>
        <b className="mod-mono">{maskKeyTail(MODELS_KEY.tail)}</b>
      </div>
      <p className="mod-p">
        Added by {MODELS_KEY.by}, {MODELS_KEY.added}. Tested {MODELS_KEY.tested}. Billed by the provider.
      </p>
      <div className="mod-foot">
        <Btn label="Test again" sm does="Runs the connection test again with the stored key; the key stays hidden" feature="F286" onClick={() => intent('F286:test-again')} />
        <Btn
          label="Revoke"
          sm
          cls="danger"
          does="Asks to confirm, then deletes the stored key; runs that use it stop until a new key is saved"
          feature="F285"
          onClick={() => intent('F285:revoke')}
        />
      </div>
    </Card>
  );

  // ---------------------------------------------------------------- Next run (estimate before Send)
  const RUN = MODELS_RUN;
  const tokTotal = RUN.ctx.reduce((a, c) => a + c[2], 0);
  const ctxBar = (
    <>
      <div className="mod-ctxbar">
        {RUN.ctx.map((c, i) => (
          <i key={c[0]} className={'s' + (i + 1)} style={{ width: ((c[2] / tokTotal) * 100).toFixed(1) + '%' }} />
        ))}
      </div>
      <div className="mod-cl">
        {RUN.ctx.map((c, i) => (
          <div key={c[0]}>
            <i className={'s' + (i + 1)} />
            <b>{c[0]}</b>
            <span>{c[1]}</span>
            <span>{c[2].toFixed(1)}k</span>
          </div>
        ))}
      </div>
    </>
  );
  const scale = (n: number) => ((n / MODELS_CAPS.perRun) * 100).toFixed(1);
  const rangeBar = (
    <div className="mod-rng">
      <div className="trk" />
      <div className="band" style={{ left: scale(RUN.est[0]) + '%', width: (Number(scale(RUN.est[1])) - Number(scale(RUN.est[0]))).toFixed(1) + '%' }} />
      <span className="lb up" style={{ left: scale(RUN.est[0]) + '%' }}>
        {RUN.est[0]}
      </span>
      <span className="lb up" style={{ left: scale(RUN.est[1]) + '%' }}>
        {RUN.est[1]}
      </span>
      <span className="mk" style={{ left: scale(RUN.reserve) + '%' }} />
      <span className="lb dn" style={{ left: scale(RUN.reserve) + '%' }}>
        <b>Reserve {RUN.reserve}</b> · maximum
      </span>
      <span className="mk mod-capmk" style={{ left: '99.6%' }} />
      <span className="lb dn" style={{ left: '94%' }}>
        cap {MODELS_CAPS.perRun}
      </span>
    </div>
  );

  const ticket = (
    <Card feature="F287" cls="mod-card">
      <div className="mod-h">
        Before you send · run {RUN.id}
        <em>
          <Pill tone="mute" label="Hosted" />
          <Pill tone="mute" label="Fixed model" />
        </em>
      </div>
      <div className="mod-row2">
        <div className="mod-col">
          <b className="mod-h2">
            {RUN.task} · {RUN.target}
          </b>
          <p className="mod-p">
            {RUN.model} · {RUN.effort} effort · output capped at {RUN.outCap} · rate card {RUN.rc}
          </p>
          <div className="mod-foot">
            <Btn
              label="Change model"
              sm
              does="Opens Models to pick another model; the estimate recalculates"
              feature="F281"
              onClick={() => onSection('models')}
            />
          </div>
        </div>
        <div className="mod-col">
          <b className="mod-h2">
            Context · {tokTotal.toFixed(1)}k of {RUN.limitIn} tokens
          </b>
          {ctxBar}
        </div>
      </div>
      <div className="mod-h">
        Estimate in credits<em>cost range, then the amount held</em>
      </div>
      {rangeBar}
      <div className="mod-ckl">
        {RUN.checks.map(([a, b]) => (
          <div className="mod-ck" key={a}>
            <span className="okc">
              <Icon name="check" size={15} stroke={2.2} />
            </span>
            <b>{a}</b>
            <span>{b}</span>
          </div>
        ))}
      </div>
      <div className="mod-foot">
        <Btn
          label={'Send and reserve ' + RUN.reserve + ' cr'}
          cls="ink"
          icon="up"
          does="Reserves 36 credits atomically, then starts the run with exactly this context"
          feature="F287"
          onClick={() => void sendRun()}
        />
        <Btn
          label="Trim context"
          does="Goes back to the context list in the chat to remove items; the estimate updates live"
          feature="F287"
          onClick={() => intent('F287:trim')}
        />
        <span className="mod-fine">Nothing is charged until the run ends.</span>
        {runMessage ? (
          <span className="mod-fine" role="status" data-feature="F287">
            {runMessage}
          </span>
        ) : null}
      </div>
    </Card>
  );

  const life = (
    <Card feature="F288" cls="mod-card">
      <div className="mod-h">
        What happens after Send<em>ledger: reserve, settle, refund</em>
      </div>
      <div className="mod-life">
        <div className="mod-ls go">
          <span className="n">
            <i>1</i>Reserve
          </span>
          <b className="v">−{RUN.reserve} cr</b>
          <p>Held before work starts. No second run can spend it.</p>
        </div>
        <span className="mod-arr">
          <Icon name="arrowR" size={16} />
        </span>
        <div className="mod-ls">
          <span className="n">
            <i>2</i>Settle
          </span>
          <b className="v">{RUN.expect} cr</b>
          <p>The actual cost replaces the hold when the run ends.</p>
        </div>
        <span className="mod-arr">
          <Icon name="arrowR" size={16} />
        </span>
        <div className="mod-ls">
          <span className="n">
            <i>3</i>Refund
          </span>
          <b className="v">+{RUN.release} cr</b>
          <p>The unused part comes back, also on cancel or failure.</p>
        </div>
      </div>
      <p className="mod-fine">
        Key <span className="mod-mono">{RUN.key}</span>: a retry never charges twice. Hosted only; CLI and API runs bill outside Spekin credits.
      </p>
    </Card>
  );

  // ---------------------------------------------------------------- Ledger
  const LD = MODELS_LEDGER_DETAIL;
  const ledgerRows = filterLedgerRows(MODELS_LEDGER, filter);
  const ledger = (
    <Card feature="F289" cls="mod-card">
      <div className="mod-tools">
        <div className="mod-seg" role="group" aria-label="Ledger filter">
          {FILTERS.map(([id, name]) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              data-does={'Shows ' + name.toLowerCase() + ' entries only'}
              data-feature="F289"
              onClick={() => setFilter(id)}
            >
              {name}
            </button>
          ))}
        </div>
        <span className="sp-fill" />
        <span className="mod-tot">
          Committed <b>{fmt(committed)}</b> · Pending <b>1 run</b>
        </span>
      </div>
      <div className="mod-led">
        <div className="mod-lr mod-hd">
          <span>Time</span>
          <span>Run</span>
          <span>Entry</span>
          <span>Task · model</span>
          <span className="r">Amount</span>
          <span className="r">Left</span>
          <span>State</span>
        </div>
        {ledgerRows.map((r) => (
          <div className={'mod-lr' + (r.sel ? ' sel' : '')} key={r.t + r.run + r.kind}>
            <span className="mod-tm">{r.t}</span>
            <span className="mod-id">{r.run}</span>
            <span className={'mod-ent ' + r.kind}>{KIND[r.kind]}</span>
            <span className="mod-tt2">
              {r.task} <span>· {r.model}</span>
            </span>
            <span className={'mod-am ' + (r.amt.startsWith('−') ? 'neg' : r.amt.startsWith('+') ? 'pos' : r.amt === 'not reported' ? 'nr' : '')}>{r.amt}</span>
            <span className="mod-lf">{r.left}</span>
            <Pill tone={r.st[0] as PillTuple[0]} label={r.st[1]} />
          </div>
        ))}
      </div>
    </Card>
  );

  const detail = (
    <Card feature="F289" cls="mod-card">
      <div className="mod-h">
        Run {LD.run} · {LD.title}
        <em>{LD.key}</em>
      </div>
      <div className="mod-dt">
        <div>
          Consumed<b>{LD.consumed}</b>
        </div>
        <div>
          Released<b>{LD.released}</b>
        </div>
        <div>
          Pending<b>{LD.pending}</b>
        </div>
        <div>
          Provider cost, charge<b>5.8, 6 cr</b>
        </div>
      </div>
    </Card>
  );

  // ---------------------------------------------------------------- Limits (near cap and cap reached)
  const capRow = (lab: string, sub: string, val: ReactNode, ex: ReactNode, ctl: ReactNode, cls = '') => (
    <div className={'mod-cr ' + cls}>
      <div className="lb">
        {lab}
        <span>{sub}</span>
      </div>
      <b className="v">{val}</b>
      <div className="ex">{ex}</div>
      {ctl}
    </div>
  );

  const stepper = (what: string, v: ReactNode, onStep: (dir: 1 | -1) => void) => (
    <div className="mod-step" role="group" aria-label={what}>
      <IconBtn
        icon="minus"
        label={'Lower ' + what}
        sm
        does={'Lowers ' + what + '; applies to new reservations only'}
        feature="F291"
        onClick={() => onStep(-1)}
      />
      <span>{v}</span>
      <IconBtn
        icon="plus"
        label={'Raise ' + what}
        sm
        does={'Raises ' + what + '; a workspace owner limit still applies'}
        feature="F291"
        onClick={() => onStep(1)}
      />
    </div>
  );

  const capsCard = (
    <Card feature="F291" cls="mod-card">
      <div className="mod-h">
        Caps<em>Checked at reservation, not after</em>
      </div>
      {capRow(
        'Per run',
        'Maximum reserve',
        caps.perRun + ' cr',
        'A run whose reserve is above this asks first.',
        stepper('the per-run cap', caps.perRun, (d) => setCaps((c) => ({ ...c, perRun: Math.max(10, c.perRun + d * 10) }))),
      )}
      {capRow(
        'This project',
        'Monthly',
        fmt(caps.monthly) + ' cr',
        <>
          <div className="tr">
            <i style={{ width: Math.min(100, pct) + '%' }} />
          </div>
          {fmt(committed)} of {fmt(caps.monthly)} · {pct}%{sev === 'crit' ? ' · reached' : ''}
        </>,
        stepper('the monthly cap', fmt(caps.monthly), (d) => setCaps((c) => ({ ...c, monthly: Math.max(1000, c.monthly + d * 100) }))),
        sev,
      )}
      {capRow(
        'Workspace',
        'Monthly, all projects',
        fmt(MODELS_PERIOD.workspaceCap) + ' cr',
        fmt(MODELS_PERIOD.workspaceUsed) + ' used across 3 projects',
        <span className="mod-lock">
          <Icon name="lock" size={13} />
          Owner only
        </span>,
      )}
      {capRow(
        'Concurrent runs',
        'Hard limit',
        String(caps.concurrency),
        usage.reserved ? '1 running now, ' + usage.reserved + ' cr reserved' : 'none running',
        stepper('concurrent runs', caps.concurrency, (d) => setCaps((c) => ({ ...c, concurrency: Math.min(8, Math.max(1, c.concurrency + d)) }))),
      )}
    </Card>
  );

  const ladder = (
    <Card feature="F290" cls="mod-card">
      <div className="mod-h">
        Severity<em>Fixed in this version: 70% and 90%</em>
      </div>
      <div className="mod-ladw">
        <span className="mod-here" style={{ left: Math.min(100, pct) + '%' }}>
          {pct}%
        </span>
        <div className="mod-lad">
          <i className="a" />
          <i className="b" />
          <i className="c" />
        </div>
      </div>
      <div className="mod-zn">
        <div>
          <b>Calm, under 70%</b>No banner. The estimate shows credits only.
        </div>
        <div>
          <b>Warn from 70%</b>Amber banner, and the cap share beside every estimate.
        </div>
        <div>
          <b>Critical from 90%</b>Red banner. A run whose reserve does not fit is refused.
        </div>
      </div>
    </Card>
  );

  const bannerCap = (
    <div className="sp-banner bad mod-r" role="alert" data-feature="F294">
      <Icon name="alert" size={16} />
      <p>
        <b>
          Monthly cap reached: {fmt(committed)} of {fmt(caps.monthly)} cr.
        </b>{' '}
        New Hosted runs are stopped. Local CLI and API runs are not counted against it. Your frames, specs and drafts are untouched.
      </p>
      <Btn
        label="Use Local CLI"
        sm
        cls="ink"
        does="Switches this chat to Local CLI and opens the agent list; runs there do not touch the cap"
        feature="F294"
        onClick={() => {
          setSource('cli');
          onSection('models');
        }}
      />
      <Btn
        label="Use API key"
        sm
        does="Switches this chat to your API provider; runs there do not touch the cap"
        feature="F294"
        onClick={() => {
          setSource('api');
          onSection('models');
        }}
      />
    </div>
  );

  const optCap = (
    <Card feature="F294" cls="mod-card">
      <div className="mod-h">What you can do now</div>
      <div className="mod-opt">
        <div>
          <b>Runs already started finish</b>
          <span>1 running run settles as usual; its unused credits come back.</span>
        </div>
      </div>
      <div className="mod-opt">
        <div>
          <b>Everything except Hosted runs still works</b>
          <span>Open, compare, accept and hand off frames. Local CLI and API runs send as usual. Nothing is deleted at the cap.</span>
        </div>
      </div>
      <div className="mod-opt">
        <div>
          <b>Ask for more room, or wait for {MODELS_PERIOD.resets}</b>
          <span>
            From 70% the banner asks for this earlier. The cap resets in {MODELS_PERIOD.days} days.
          </span>
        </div>
        <Btn
          label="Ask for a higher cap"
          sm
          does="Sends a request to the workspace owner to raise the monthly cap; nothing changes until it is approved"
          feature="F294"
          onClick={() => intent('F294:ask-cap')}
        />
      </div>
    </Card>
  );

  // ---------------------------------------------------------------- assemble the page
  const sideStd = (
    <>
      {usagePanel}
      {winPanel}
      {topUp()}
    </>
  );

  let main: ReactNode;
  if (section === 'models' && source === 'cli') {
    main = page({
      lf: 'F296',
      left: (
        <>
          {sourceCards('cli', true)}
          {connector}
          {agentsCard}
          {runSet}
        </>
      ),
      side: (
        <>
          {usagePanel}
          {cliSide}
        </>
      ),
    });
  } else if (section === 'models' && source === 'api') {
    main = page({
      lf: 'F285',
      left: (
        <>
          {sourceCards('api', true)}
          {provForm}
          <div className="mod-row2 mod-gap">
            {testCard}
            {modelCard}
          </div>
        </>
      ),
      side: (
        <>
          {usagePanel}
          {byokSide}
          {savedKey}
        </>
      ),
    });
  } else if (section === 'next') {
    main = page({ lf: 'F287', left: <>{ticket}{life}</>, side: sideStd });
  } else if (section === 'ledger') {
    main = page({ lf: 'F289', left: <>{ledger}{detail}</>, side: sideStd });
  } else if (section === 'limits') {
    main = page({
      lf: 'F291',
      banner: blocked ? bannerCap : null,
      left: (
        <>
          {capsCard}
          {ladder}
          {optCap}
        </>
      ),
      side: (
        <>
          {usagePanel}
          {winPanel}
          {topUp(true)}
        </>
      ),
    });
  } else {
    main = page({
      lf: 'F281',
      left: (
        <>
          {sourceCards('hosted', false)}
          {modelsCard}
          {effortCard}
          {routingCard}
        </>
      ),
      side: sideStd,
    });
  }

  return (
    <>
      {chat}
      {main}
    </>
  );
}
