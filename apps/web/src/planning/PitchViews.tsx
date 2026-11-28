import type { ReactNode } from 'react';
import type { SamplePitchField, SampleTicketSlice } from '../data/source';
import { Inspector } from '../shell/Inspector';
import { Btn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

export type PitchState = 'proposal' | 'accepted' | 'guard' | 'breakdown' | 'made';
export type SpecDepth = 'Simple' | 'Detailed' | 'Expert';

export function PitchChatMessages(props: { state: PitchState; onLanjutKeDetail: () => void }) {
  const { state, onLanjutKeDetail } = props;
  if (state === 'proposal') {
    return (
      <div className="sp-ai">
        <div className="h">
          <span className="av">S</span>Spekin<em>Sonnet 5.5 · 41 s · 12 cr</em>
        </div>
        <p>I wrote the pitch from your 3 decisions and 1 open question. No-gos had no decision, so I proposed it and marked it for you.</p>
      </div>
    );
  }
  if (state === 'accepted') {
    return (
      <>
        <div className="sp-ub">Pitch looks right.</div>
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>Sonnet 5.5 · 6 s</em>
          </div>
          <p>Pitch r1 is accepted and the spec document is open at Simple depth. The next step is Lanjut ke Detail, when you want it.</p>
        </div>
      </>
    );
  }
  if (state === 'guard') {
    return (
      <>
        <div className="sp-ub">Make the tickets now.</div>
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>read from the plan · 0 cr</em>
          </div>
          <p>I have not made any ticket. Tickets are created on purpose: first Lanjut ke Detail, then you accept the ticket breakdown.</p>
          <div className="sp-gc prop" data-feature="F436">
            <div className="k">
              <Icon name="lock" size={12} />
              Tickets locked
              <span className="tag">
                <Pill tone="mute" label="2 steps left" />
              </span>
            </div>
            <div className="bd">Nothing was created by this message.</div>
            <div className="ft">
              <span className="s">Next: Lanjut ke Detail</span>
              <Btn
                label="Lanjut ke Detail"
                sm
                cls="ink"
                does="Generates the Detailed layer as a Proposal for review; no ticket is created"
                feature="F435"
                onClick={onLanjutKeDetail}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
  if (state === 'breakdown') {
    return (
      <>
        <div className="sp-ub">Lanjut ke Detail</div>
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>Sonnet 5.5 · 58 s · 31 cr</em>
          </div>
          <p>The Detailed layer is ready as a proposal. It has a behaviour spec, a plan and a breakdown of 5 thin slices. No ticket exists yet.</p>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="sp-ub">Accept the breakdown.</div>
      <div className="sp-ai">
        <div className="h">
          <span className="av">S</span>Spekin<em>Sonnet 5.5 · 4 s</em>
        </div>
        <p>Breakdown r1 is accepted. I created 5 tickets, one per slice, with their blockers.</p>
      </div>
    </>
  );
}

export function PitchBanner(props: {
  state: PitchState;
  onEdit: () => void;
  onAskChanges: () => void;
  onAcceptPitch: () => void;
  onEditSlices: () => void;
  onRejectBreakdown: () => void;
  onAcceptBreakdown: () => void;
}) {
  const { state, onEdit, onAskChanges, onAcceptPitch, onEditSlices, onRejectBreakdown, onAcceptBreakdown } = props;
  if (state === 'proposal') {
    return (
      <div className="sp-banner warn" role="status">
        <Icon name="alert" size={16} />
        <p>
          <b>Proposal.</b> The pitch is a draft until you accept it. Review the diff, edit a field, or ask for changes.
        </p>
        <Btn
          label="Edit"
          sm
          does="Edits one field as a draft; the proposal changes, nothing is accepted"
          feature="F432"
          onClick={onEdit}
        />
        <Btn
          label="Ask for changes"
          sm
          does="Sends a change request to the chat with the pitch as context"
          feature="F432"
          onClick={onAskChanges}
        />
        <Btn
          label="Accept pitch"
          sm
          cls="ink"
          does="Accepts pitch r1 as shown, records the revision and opens the spec document at Simple depth"
          feature="F432"
          onClick={onAcceptPitch}
        />
      </div>
    );
  }
  if (state === 'breakdown') {
    return (
      <div className="sp-banner warn" role="status">
        <Icon name="lock" size={16} />
        <p>
          <b>0 tickets exist.</b> They are created when you accept this breakdown, and not before.
        </p>
        <Btn
          label="Edit slices"
          sm
          does="Edits the slices as a draft: reorder, split, merge or change blockers"
          feature="F437"
          onClick={onEditSlices}
        />
        <Btn
          label="Reject"
          sm
          cls="plain"
          does="Rejects the breakdown; the Detailed layer stays a proposal and no ticket is made"
          feature="F437"
          onClick={onRejectBreakdown}
        />
        <Btn
          label="Accept breakdown"
          sm
          cls="ink"
          does="Accepts the breakdown as one proposal and creates the tickets it lists"
          feature="F438"
          onClick={onAcceptBreakdown}
        />
      </div>
    );
  }
  if (state === 'made') {
    return (
      <div className="sp-banner" role="status" style={{ background: 'var(--ok-soft)' }}>
        <Icon name="check" size={16} />
        <p>
          <b>Breakdown accepted.</b> 5 tickets were created from it. None existed before.
        </p>
      </div>
    );
  }
  return null;
}

export function PitchDepthBar(props: { depth: SpecDepth; ticketCount: number; onDepth: (d: SpecDepth) => void }) {
  const { depth, ticketCount, onDepth } = props;
  const levels: SpecDepth[] = ['Simple', 'Detailed', 'Expert'];
  return (
    <div className="gpa-fbar">
      <div className="gpa-nw gpa-depth" data-feature="F434">
        <span className="sp-seg" role="group" aria-label="Spec depth">
          {levels.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={d === depth ? 'true' : 'false'}
              style={d === 'Expert' ? { opacity: 0.5 } : undefined}
              data-does={'Shows the spec at ' + d + ' depth; ' + d + ' shows its layer and everything above it'}
              data-feature="F434"
              onClick={() => onDepth(d)}
            >
              {d}
            </button>
          ))}
        </span>
      </div>
      <span className="sp-fill" />
      <span className="gpa-lock">
        <Icon name={ticketCount === 0 ? 'lock' : 'check'} size={13} />
        Tickets {ticketCount}
        {ticketCount === 0 ? ' · none until the breakdown is accepted' : ''}
      </span>
    </div>
  );
}

function SliceTable(props: { slices: SampleTicketSlice[]; made: boolean }) {
  const { slices, made } = props;
  return (
    <table className="sp-tbl">
      <thead>
        <tr>
          <th style={{ width: '56px' }}>ID</th>
          <th>Slice</th>
          <th style={{ width: '230px' }}>Cuts through</th>
          <th style={{ width: '130px' }}>Blocked by</th>
          {made ? <th style={{ width: '80px' }}>Status</th> : null}
        </tr>
      </thead>
      <tbody>
        {slices.map(([id, title, cuts, blockedBy]) => (
          <tr key={id}>
            <td>
              <b>{id}</b>
            </td>
            <td>{title}</td>
            <td>{cuts}</td>
            <td>
              {blockedBy === 'None' ? (
                <span className="gpa-hint">None</span>
              ) : (
                <Pill tone={blockedBy.startsWith('OQ') ? 'warn' : 'mute'} label={blockedBy} />
              )}
            </td>
            {made ? (
              <td>
                <Pill tone="mute" label="Open" />
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PitchDocView(props: {
  state: PitchState;
  pitch: SamplePitchField[];
  slices: SampleTicketSlice[];
  onOpenSource: (id: string) => void;
  onConfirmNoBasis: () => void;
  onBackToInterview: () => void;
}) {
  const { state, pitch, slices, onOpenSource, onConfirmNoBasis, onBackToInterview } = props;
  if (state === 'breakdown') {
    return (
      <div className="sp-doc">
        <div className="meta">
          <Pill tone="acc" label="Proposal r1" />
          <span>Detailed depth · plan and tickets · thin vertical slices</span>
        </div>
        <h2>Ticket breakdown</h2>
        <p style={{ margin: 0, color: 'var(--ink-dim)' }}>
          Each slice cuts through schema, API, UI and tests and can be shown on its own. Blockers come from the open questions.
        </p>
        <div className="gpa-nw" data-feature="F437">
          <SliceTable slices={slices} made={false} />
        </div>
      </div>
    );
  }
  if (state === 'made') {
    return (
      <div className="sp-doc">
        <div className="meta">
          <Pill tone="ok" label="Accepted r1" />
          <span>Detailed depth · tickets T-01 to T-05</span>
        </div>
        <h2>Ticket breakdown</h2>
        <div className="gpa-nw" data-feature="F438">
          <SliceTable slices={slices} made />
        </div>
      </div>
    );
  }
  const isProposal = state === 'proposal';
  return (
    <div className="sp-doc">
      <div className="meta">
        {isProposal ? <Pill tone="acc" label="Proposal r1" /> : <Pill tone="ok" label="Accepted r1" />}
        <span>
          Simple depth · decide layer · {isProposal ? 'every line is new in this diff' : 'accepted 24 Nov 14:12'}
        </span>
      </div>
      <h2>Pitch: variance alerts for Meranti Yard</h2>
      {pitch.map(([name, body, sources, flag]) => {
        const displaySources = flag === 'nobasis' && !isProposal ? ['D-005'] : sources;
        return (
          <div key={name} className={isProposal ? 'gpa-pf add' : 'gpa-pf'}>
            <h4>{name}</h4>
            <div>
              <p>{body}</p>
              {displaySources.length > 0 ? (
                <div className="gpa-src">
                  {displaySources.map((id) => (
                    <button
                      key={id}
                      type="button"
                      data-does={'Opens ' + id + ' in the decision log (S05)'}
                      data-feature="F431"
                      onClick={() => onOpenSource(id)}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              ) : null}
              {flag === 'nobasis' && isProposal ? (
                <div className="gpa-acts">
                  <Pill tone="warn" label="Tanpa dasar" />
                  <span className="gpa-hint">Proposed by Spekin, no decision behind it.</span>
                  <button
                    type="button"
                    className="gpa-ch"
                    data-does="Confirms this field as a decision and writes a decision-log entry"
                    data-feature="F439"
                    onClick={onConfirmNoBasis}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="gpa-ch"
                    data-does="Reopens the interview to ask about this field"
                    data-feature="F439"
                    onClick={onBackToInterview}
                  >
                    Back to the interview
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StepsCard({ done }: { done: number }) {
  const steps: [string, boolean][] = [
    ['Pitch accepted', done >= 1],
    ['Lanjut ke Detail run', done >= 2],
    ['Ticket breakdown accepted', done >= 3],
  ];
  return (
    <div className="gpa-nw gpa-pc" data-feature="F438">
      <h4>Tickets unlock after</h4>
      {steps.map(([label, ok]) => (
        <div key={label} className="gpa-need">
          <span className={'dot ' + (ok ? 'ok' : 'ring')} />
          <span>{label}</span>
          <Pill tone={ok ? 'ok' : 'mute'} label={ok ? 'Done' : 'Not yet'} />
        </div>
      ))}
    </div>
  );
}

function InboxCard({ items }: { items: { title: string; sub: string; on?: boolean; right?: ReactNode }[] }) {
  return (
    <div className="gpa-nw" data-feature="F433">
      <div className="gpa-inbox">
        {items.map((item) => (
          <div key={item.title} className={item.on ? 'gpa-ir on' : 'gpa-ir'}>
            <b>{item.title}</b>
            {item.right}
            <small>{item.sub}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PitchInspector(props: {
  state: PitchState;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onMore: () => void;
  onReviewPitch: () => void;
  onAnswerOq: () => void;
  onConfirmNoBasis: () => void;
  onLanjutKeDetail: () => void;
  onReviewBreakdown: () => void;
  onReviewSpec: () => void;
  onOpenTickets: () => void;
}) {
  const {
    state,
    activeTab,
    onSelectTab,
    onMore,
    onReviewPitch,
    onAnswerOq,
    onConfirmNoBasis,
    onLanjutKeDetail,
    onReviewBreakdown,
    onReviewSpec,
    onOpenTickets,
  } = props;

  if (state === 'proposal') {
    const tabs = ['Inbox', 'Sources', 'Revisions'];
    return (
      <Inspector
        title="Decision inbox"
        pill={['warn', '1 waiting']}
        sub="What needs you before the pitch is accepted"
        tabs={tabs}
        activeTab={tabs.includes(activeTab) ? activeTab : 'Inbox'}
        onSelectTab={onSelectTab}
        onMore={onMore}
      >
        <InboxCard
          items={[
            {
              title: 'Pitch proposal r1',
              sub: 'Five fields from 3 decisions',
              on: true,
              right: (
                <Btn
                  label="Review"
                  sm
                  cls="ink"
                  does="Scrolls to the pitch diff and focuses its first field"
                  feature="F433"
                  onClick={onReviewPitch}
                />
              ),
            },
            {
              title: 'Open question OQ-01',
              sub: 'Where actual costs come from',
              right: (
                <Btn
                  label="Answer"
                  sm
                  does="Opens OQ-01 in the interview as the current question"
                  feature="F433"
                  onClick={onAnswerOq}
                />
              ),
            },
            {
              title: 'No-gos have no basis',
              sub: 'Confirm or remove before accepting',
              right: (
                <Btn
                  label="Confirm"
                  sm
                  does="Jumps to the No-gos field to confirm or reopen it"
                  feature="F433"
                  onClick={onConfirmNoBasis}
                />
              ),
            },
          ]}
        />
        <StepsCard done={0} />
      </Inspector>
    );
  }

  if (state === 'accepted') {
    const tabs = ['Next', 'Sources', 'Revisions'];
    return (
      <Inspector
        title="Next step"
        pill={['ok', 'Pitch accepted']}
        sub="Simple depth is done. Detailed is optional."
        tabs={tabs}
        activeTab={tabs.includes(activeTab) ? activeTab : 'Next'}
        onSelectTab={onSelectTab}
        onMore={onMore}
      >
        <InboxCard
          items={[
            {
              title: 'Nothing waiting',
              sub: 'The pitch is accepted as r1',
              right: <Pill tone="ok" label="Clear" />,
            },
          ]}
        />
        <div className="sp-ready">
          <div className="t">
            Lanjut ke Detail
            <span className="pill mute">Optional</span>
          </div>
          <p>Generates the Detailed layer as a proposal: behaviour spec, plan and a ticket breakdown. It creates no tickets.</p>
          <Btn
            label="Lanjut ke Detail"
            cls="ink"
            does="Generates the Detailed layer as a Proposal for review; no ticket is created"
            feature="F435"
            onClick={onLanjutKeDetail}
          />
        </div>
        <StepsCard done={1} />
      </Inspector>
    );
  }

  if (state === 'guard') {
    const tabs = ['Next', 'Sources', 'Revisions'];
    return (
      <Inspector
        title="Next step"
        pill={['ok', 'Pitch accepted']}
        sub="Tickets are still locked"
        tabs={tabs}
        activeTab={tabs.includes(activeTab) ? activeTab : 'Next'}
        onSelectTab={onSelectTab}
        onMore={onMore}
      >
        <StepsCard done={1} />
        <div className="sp-ready">
          <div className="t">
            Lanjut ke Detail
            <span className="pill mute">Optional</span>
          </div>
          <p>Generates the Detailed layer as a proposal. It creates no tickets.</p>
          <Btn
            label="Lanjut ke Detail"
            cls="ink"
            does="Generates the Detailed layer as a Proposal for review; no ticket is created"
            feature="F435"
            onClick={onLanjutKeDetail}
          />
        </div>
      </Inspector>
    );
  }

  if (state === 'breakdown') {
    const tabs = ['Inbox', 'Sources', 'Revisions'];
    return (
      <Inspector
        title="Decision inbox"
        pill={['warn', '2 waiting']}
        sub="Detailed layer r1 is a proposal"
        tabs={tabs}
        activeTab={tabs.includes(activeTab) ? activeTab : 'Inbox'}
        onSelectTab={onSelectTab}
        onMore={onMore}
      >
        <InboxCard
          items={[
            {
              title: 'Ticket breakdown r1',
              sub: '5 slices, 1 blocked by an open question',
              on: true,
              right: (
                <Btn
                  label="Review"
                  sm
                  cls="ink"
                  does="Scrolls to the breakdown table"
                  feature="F433"
                  onClick={onReviewBreakdown}
                />
              ),
            },
            {
              title: 'Behaviour spec r1',
              sub: '6 requirements in EARS',
              right: (
                <Btn
                  label="Review"
                  sm
                  does="Opens the behaviour spec proposal in S08 review"
                  feature="F433"
                  onClick={onReviewSpec}
                />
              ),
            },
          ]}
        />
        <StepsCard done={2} />
      </Inspector>
    );
  }

  const tabs = ['Next', 'Sources', 'Revisions'];
  return (
    <Inspector
      title="Next step"
      pill={['ok', 'Breakdown accepted']}
      sub="Tickets exist because you accepted the breakdown"
      tabs={tabs}
      activeTab={tabs.includes(activeTab) ? activeTab : 'Next'}
      onSelectTab={onSelectTab}
      onMore={onMore}
    >
      <InboxCard
        items={[
          {
            title: 'Nothing waiting',
            sub: 'Breakdown r1 accepted 24 Nov 14:40',
            right: <Pill tone="ok" label="Clear" />,
          },
        ]}
      />
      <div className="sp-ready">
        <div className="t">
          Tickets
          <span className="pill ok">5 created</span>
        </div>
        <p>One ticket per slice, with its blockers. T-04 waits for OQ-01.</p>
        <Btn
          label="Open ticket board"
          cls="ink"
          does="Opens the ticket board (S15) with the 5 new tickets"
          feature="F438"
          onClick={onOpenTickets}
        />
      </div>
      <StepsCard done={3} />
    </Inspector>
  );
}
