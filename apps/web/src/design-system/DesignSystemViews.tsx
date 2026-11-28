import { gapBDesignSystem, type SampleGapBGap } from '../data/source';
import { Icon } from '../ui/Icon';
import { Btn } from '../ui/Button';
import { Pill } from '../ui/Pill';

export type DesignSystemState = 'kit' | 'tokens' | 'gap' | 'register' | 'reuse' | 'policy';
export type GapStatusFilter = 'all' | 'open' | 'proposal' | 'closed';

const { GAPB_KIT, GAPB_PICKS, GAPB_TOKENS, GAPB_GAPS, GAPB_PROV } = gapBDesignSystem;

export function filterGapRegister(filter: GapStatusFilter, gaps: SampleGapBGap[] = GAPB_GAPS): SampleGapBGap[] {
  if (filter === 'all') return gaps;
  if (filter === 'open') return gaps.filter((g) => g.st[1].toLowerCase() === 'open');
  if (filter === 'proposal') return gaps.filter((g) => g.st[1].toLowerCase() === 'proposal');
  return gaps.filter((g) => g.st[1].toLowerCase().startsWith('closed'));
}

export function routeDesignSystemPrompt(text: string): DesignSystemState {
  const q = text.trim().toLowerCase();
  if (q.includes('refactor') || q.includes('whole repo') || q.includes('policy')) return 'policy';
  if (q.includes('reuse') || q.includes('licence') || q.includes('license') || q.includes('reference')) return 'reuse';
  if (q.includes('waterfall') || q.includes('bridge') || q.includes('f-05') || q.includes('gap-01')) return 'gap';
  if (q.includes('list') || q.includes('register') || q.includes('every gap')) return 'register';
  if (q.includes('token') || q.includes('--warn') || q.includes('design.md')) return 'tokens';
  return 'kit';
}

export function KitView(props: { onChangeKit: () => void; onOpenGap: () => void }) {
  const { onChangeKit, onOpenGap } = props;
  return (
    <div className="gpb-page">
      <div className="gpb-head">
        <h2>Design system</h2>
        <Pill tone="ok" label={GAPB_KIT.name + ' ' + GAPB_KIT.rev} />
        <Pill tone="ok" label="DESIGN.md r3" />
        <Pill tone="warn" label="1 GAP open" />
      </div>
      <div className="gpb-two">
        <div className="gpb-col">
          <div className="gpb-card" data-feature="F451">
            <div className="h">
              <Icon name="layers" size={14} />
              Component picks
              <span>{GAPB_KIT.picked} used by screens · 6 shown</span>
              <span className="sp-fill" />
              <Btn
                label="Change kit"
                sm
                does="Starts a kit Proposal; the chosen kit changes only when it is accepted, never from a principles change"
                feature="F451"
                onClick={onChangeKit}
              />
            </div>
            <div className="gpb-kit">
              {GAPB_PICKS.map((p) => (
                <div
                  key={p[0]}
                  className={p[3] === 'gap' ? 'gpb-pick gap' : 'gpb-pick'}
                  onClick={p[3] === 'gap' ? onOpenGap : undefined}
                >
                  <code>{p[0]}</code>
                  <span>
                    {p[1]} · {p[2]}
                  </span>
                  {p[3] === 'gap' ? <Pill tone="warn" label="GAP-01" /> : <Pill tone="ok" label="In kit" />}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="gpb-col">
          <div className="gpb-card">
            <div className="h">
              <Icon name="check" size={14} />
              Kit decision
            </div>
            <dl className="gpb-kvs">
              <dt>Kit</dt>
              <dd>
                {GAPB_KIT.name} · {GAPB_KIT.rev}
              </dd>
              <dt>Decision</dt>
              <dd>{GAPB_KIT.decision}</dd>
              <dt>Chosen by</dt>
              <dd>{GAPB_KIT.by}</dd>
              <dt>Tickets</dt>
              <dd>Each UI ticket names one slug or one GAP id</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TokensView(props: { onEditToken: () => void }) {
  const { onEditToken } = props;
  return (
    <div className="gpb-page">
      <div className="gpb-head">
        <h2>DESIGN.md and tokens</h2>
        <Pill tone="ok" label="Accepted r3" />
        <span className="gpb-meta">18 tokens · mapped to Tailwind and shadcn variables</span>
      </div>
      <div className="gpb-card" data-feature="F459">
        <div className="h">
          <Icon name="doc" size={14} />
          Token viewer
          <span>read here; every edit is a Proposal</span>
          <span className="sp-fill" />
          <Btn
            label="Edit token"
            sm
            does="Drafts a token change as a Proposal on S08; the accepted tokens stay r3"
            feature="F459"
            onClick={onEditToken}
          />
        </div>
        <table className="sp-tbl">
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
              <th>Used for</th>
              <th>Rev</th>
            </tr>
          </thead>
          <tbody>
            {GAPB_TOKENS.map((t, i) => (
              <tr key={t[0]}>
                <td className="mono">{t[0]}</td>
                <td>
                  {i < 3 ? <span className="gpb-sw" style={{ background: 'var(' + t[0] + ')' }} /> : null}
                  {t[1]}
                </td>
                <td>{t[2]}</td>
                <td className="mono">{t[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GapDetailView(props: {
  onDraftKitProposal: () => void;
  onOpenFrame: () => void;
  onOpenInKit: () => void;
  onUseClosest: () => void;
}) {
  const { onDraftKitProposal, onOpenFrame, onOpenInKit, onUseClosest } = props;
  return (
    <div className="gpb-page">
      <div className="gpb-head">
        <h2>GAP-01 Variance bridge chart</h2>
        <Pill tone="warn" label="Open" />
        <span className="gpb-meta">Created from F-05 · 12:44</span>
      </div>
      <div className="gpb-two">
        <div className="gpb-col">
          <div className="gpb-card" data-feature="F452">
            <div className="h">
              <Icon name="alert" size={14} />
              Needed, not in {GAPB_KIT.name}
              <span>R-DS-4</span>
            </div>
            <p>
              F-05 needs a waterfall that starts at budget, adds each package variance and ends at forecast. The kit has no
              such component.
            </p>
            <div className="gpb-act">
              <Btn
                label="Draft as kit proposal"
                sm
                cls="ink"
                does="Drafts a Proposal to add a waterfall to the kit or to build it in this project; nothing is added yet"
                feature="F452"
                onClick={onDraftKitProposal}
              />
              <Btn
                label="Open F-05"
                sm
                does="Opens frame F-05 on the canvas with the GAP badge shown"
                feature="F452"
                onClick={onOpenFrame}
              />
            </div>
          </div>
          <div className="gpb-card" data-feature="F453">
            <div className="h">
              <Icon name="link" size={14} />
              Closest existing item
            </div>
            <div className="gpb-pick">
              <code>components/flow-diagram</code>
              <span>Signed bands per step. No running total, no start and end bars.</span>
            </div>
            <div className="gpb-act">
              <Btn
                label="Open in kit"
                sm
                does="Opens the closest kit item in the Kit tab so you can compare it with F-05"
                feature="F453"
                onClick={onOpenInKit}
              />
              <Btn
                label="Use closest instead"
                sm
                does="Drafts a Proposal that changes F-05 to use the closest item and closes the GAP"
                feature="F453"
                onClick={onUseClosest}
              />
            </div>
          </div>
        </div>
        <div className="gpb-col">
          <div className="gpb-card" data-feature="F455">
            <div className="h">
              <Icon name="req" size={14} />
              Ticket
            </div>
            <dl className="gpb-kvs">
              <dt>T-218</dt>
              <dd>Build variance bridge</dd>
              <dt>component_ref</dt>
              <dd>
                <span className="gpb-chip">GAP-01</span>
              </dd>
            </dl>
            <p className="ap-gpb-hint">One reference per UI ticket: a kit slug or a GAP id. Never empty.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTER_OPTIONS: { id: GapStatusFilter; label: string; word: string }[] = [
  { id: 'all', label: 'All 4', word: 'all' },
  { id: 'open', label: 'Open 2', word: 'open' },
  { id: 'proposal', label: 'Proposal 1', word: 'proposal' },
  { id: 'closed', label: 'Closed 1', word: 'closed' },
];

export function GapRegisterView(props: {
  statusFilter: GapStatusFilter;
  onFilterChange: (next: GapStatusFilter) => void;
}) {
  const { statusFilter, onFilterChange } = props;
  const rows = filterGapRegister(statusFilter);
  return (
    <div className="gpb-page">
      <div className="gpb-head">
        <h2>GAP register</h2>
        <span className="gpb-meta">Components the screens need that {GAPB_KIT.name} does not have</span>
        <span className="sp-fill" />
        <div className="sp-seg" role="group" aria-label="Status filter">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={statusFilter === opt.id ? 'true' : 'false'}
              data-does={'Shows only the ' + opt.word + ' GAP entries'}
              data-feature="F454"
              onClick={() => onFilterChange(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="gpb-card" data-feature="F454" style={{ padding: 0 }}>
        <table className="sp-tbl gpb-tbl">
          <thead>
            <tr>
              <th>GAP</th>
              <th>Needed component</th>
              <th>Closest existing item</th>
              <th>Used by</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.id}>
                <td>
                  <span className="id">{g.id}</span>
                </td>
                <td>{g.need}</td>
                <td>
                  <span className="mono">{g.closest}</span>
                  <small>{g.why}</small>
                </td>
                <td className="mono">{g.used}</td>
                <td>
                  <Pill tone={g.st[0]} label={g.st[1]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gpb-sub">
        Every entry names its closest existing item. A GAP closes when a kit revision adds the component or a ticket
        switches to the closest item.
      </p>
    </div>
  );
}

export function ReuseReviewView(props: { onUseDateRange: () => void; onReviewSource: () => void }) {
  const { onUseDateRange, onReviewSource } = props;
  return (
    <div className="gpb-page">
      <div className="gpb-head">
        <h2>Reuse review</h2>
        <Pill tone="acc" label="Proposal P-35" />
        <span className="gpb-meta">Per file: source, licence, obligations</span>
      </div>
      <div className="gpb-card" data-feature="F456" style={{ padding: 0 }}>
        <table className="sp-tbl gpb-tbl">
          <thead>
            <tr>
              <th>File</th>
              <th>Source</th>
              <th>Licence</th>
              <th>Obligation</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {GAPB_PROV.map((r) => (
              <tr key={r.file}>
                <td className="mono">{r.file}</td>
                <td>{r.src}</td>
                <td>{r.lic}</td>
                <td>{r.obl}</td>
                <td>
                  <Pill tone={r.v[0]} label={r.v[1]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="gpb-card" data-feature="F458">
        <div className="h">
          <Icon name="check" size={14} />
          Existing component first
          <span>GAP-03 Period picker</span>
        </div>
        <p>
          Before any custom work, Spekin shows the kit option: <span className="gpb-chip">components/date-range</span>{' '}
          covers 4 of 5 needs. Missing: fiscal period presets.
        </p>
        <div className="gpb-act">
          <Btn
            label="Use date-range"
            sm
            cls="ink"
            does="Drafts a Proposal that points F-01 at date-range and narrows GAP-03 to the presets only"
            feature="F458"
            onClick={onUseDateRange}
          />
          <Btn
            label="Review source"
            sm
            does="Opens the licence and provenance review for the chosen component"
            feature="F456"
            onClick={onReviewSource}
          />
        </div>
      </div>
    </div>
  );
}

export function ReusePolicyView(props: { onReviewInventory: () => void }) {
  const { onReviewInventory } = props;
  return (
    <div className="gpb-page">
      <div className="gpb-head">
        <h2>Codebase and reference reuse</h2>
        <span className="gpb-meta">What Spekin will and will not do</span>
      </div>
      <div
        className="gpb-two"
        style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', flex: 'none', alignItems: 'start' }}
      >
        <div className="gpb-card" data-feature="F457">
          <div className="h">
            <Icon name="x" size={14} />
            Never done automatically
          </div>
          <div className="gpb-list">
            <div className="gpb-item">
              <span />
              <span>Refactor your codebase to match the kit</span>
              <span />
            </div>
            <div className="gpb-item">
              <span />
              <span>Adopt a whole reference app or desktop stack</span>
              <span />
            </div>
            <div className="gpb-item">
              <span />
              <span>Copy a file with no licence or a protected brand</span>
              <span />
            </div>
          </div>
        </div>
        <div className="gpb-card" data-feature="F458">
          <div className="h">
            <Icon name="check" size={14} />
            Offered instead
          </div>
          <div className="gpb-list">
            <div className="gpb-item">
              <span />
              <span>Reuse an existing kit component</span>
              <span />
            </div>
            <div className="gpb-item">
              <span />
              <span>Reuse a compatibly licensed file after a per-file review</span>
              <span />
            </div>
            <div className="gpb-item">
              <span />
              <span>A UI inventory and DESIGN.md draft as a Proposal</span>
              <span />
            </div>
          </div>
        </div>
      </div>
      <div className="gpb-card" data-feature="F457">
        <div className="h">
          <Icon name="diff" size={14} />
          UI inventory draft
          <span>documented method, not runtime-verified</span>
          <span className="sp-fill" />
          <Pill tone="acc" label="Proposal P-36" />
          <Btn
            label="Review on S08"
            sm
            cls="ink"
            does="Opens S08 with the inventory draft; it is never auto-accepted and no file in your repo is edited"
            feature="F457"
            onClick={onReviewInventory}
          />
        </div>
      </div>
    </div>
  );
}
