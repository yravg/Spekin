import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { sampleData, type ContextItem, type SampleDecisionLogEntry } from '../data/source';
import { useWorkspace, type SaveState } from '../state/workspace';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { Btn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';
import {
  DecisionEmptyState,
  DecisionEntryInspector,
  DecisionFilterBar,
  DecisionLogTable,
  DecisionSummaryInspector,
  OpenQuestionsInspector,
  OpenQuestionsTable,
  filterDecisionRows,
  type DecisionCounts,
  type DecisionFilter,
} from './DecisionLogViews';

const { GAPA_KIT, GAPA_LOG, GAPA_NOBASIS, GAPA_OPEN, MODEL } = sampleData;

export interface PlanningShellOverride {
  screen?: 'S05' | 'S06';
  save?: SaveState;
}

const CTX_LOG: ContextItem[] = [
  ['doc', 'Decision log', 'D-001 to D-003'],
  ['doc', 'Pitch', 'r1'],
];

const LOG_TABS: ArtifactTabItem[] = [
  { icon: 'list', name: 'Decision log' },
  { icon: 'doc', name: 'Pitch r1' },
  { icon: 'req', name: 'Spec · open questions' },
];

const EMPTY_TABS: ArtifactTabItem[] = [{ icon: 'list', name: 'Decision log' }];

const COUNTS_BASE: DecisionCounts = { all: 3, int: 3, plan: 0, kit: 0, open: 1 };
const COUNTS_DETAILED: DecisionCounts = { all: 4, int: 3, plan: 1, kit: 1, open: 1 };
const COUNTS_EMPTY: DecisionCounts = { all: 0, int: 0, plan: 0, kit: 0, open: 0 };

const KIT_ROW: SampleDecisionLogEntry = { ...GAPA_KIT, field: 'Design kit' };

// S05 Decision log work area inside the Planning stage (boards-gap-a.mjs).
export function DecisionLogWorkArea(props: { onShellOverride?: (o: PlanningShellOverride) => void }) {
  const { onShellOverride } = props;
  const [search, setSearch] = useSearchParams();
  const view = useWorkspace((s) => s.view('planning'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const initialEntry = search.get('d');
  const [filter, setFilter] = useState<DecisionFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(initialEntry);
  const [emptyMode, setEmptyMode] = useState<boolean>(search.get('empty') === '1');
  const [query, setQuery] = useState('');
  const [inspTab, setInspTab] = useState<string | null>(null);
  const [extraRows, setExtraRows] = useState<SampleDecisionLogEntry[]>([]);

  const isKit = !emptyMode && filter === 'kit';
  const isOpen = !emptyMode && filter === 'open';
  const counts = emptyMode ? COUNTS_EMPTY : isKit || isOpen ? COUNTS_DETAILED : COUNTS_BASE;

  function saveFor(empty: boolean, f: DecisionFilter): SaveState {
    const text = empty ? 'Saved 12:00' : f === 'kit' || f === 'open' ? 'Saved 14:20' : 'Saved 12:06';
    return { status: 'saved', tone: 'ok', text };
  }

  useEffect(() => {
    if (!onShellOverride) return;
    onShellOverride({ screen: 'S05', save: saveFor(emptyMode, filter) });
  }, [emptyMode, filter, onShellOverride]);

  const allEntries = [...GAPA_LOG, ...extraRows];
  const visibleRows = isKit
    ? filterDecisionRows([KIT_ROW], query)
    : filter === 'plan'
      ? filterDecisionRows(extraRows.filter((r) => r.kind === 'Plan'), query)
      : filterDecisionRows(allEntries, query);

  const activeEntry: SampleDecisionLogEntry | null = isKit
    ? KIT_ROW
    : selectedId
      ? allEntries.find((r) => r.id === selectedId) ?? null
      : null;

  const freshId = !selectedId && !isKit && !isOpen && !emptyMode ? 'D-003' : null;
  const ctxItems = CTX_LOG.filter(([, name]) => !view.removedCtx.includes(name));
  const activeTab = view.tab ?? 'Decision log';

  function selectEntry(id: string) {
    const nextFilter = id !== KIT_ROW.id && filter === 'kit' ? 'all' : filter;
    setEmptyMode(false);
    setSelectedId(id);
    setInspTab('Entry');
    if (nextFilter !== filter) setFilter(nextFilter);
    onShellOverride?.({ screen: 'S05', save: saveFor(false, nextFilter) });
    setSearch((prev) => {
      const next = new URLSearchParams(prev);
      next.set('d', id);
      next.delete('empty');
      return next;
    });
  }

  function changeFilter(next: DecisionFilter) {
    if (emptyMode) {
      setFilter(next);
      return;
    }
    setFilter(next);
    setInspTab(null);
    onShellOverride?.({ screen: 'S05', save: saveFor(false, next) });
    if (next === 'kit') {
      setSelectedId(KIT_ROW.id);
    } else if (next === 'open') {
      setSelectedId(null);
    } else if (selectedId === KIT_ROW.id) {
      setSelectedId(null);
    }
  }

  function enterEmpty() {
    setEmptyMode(true);
    setFilter('all');
    setSelectedId(null);
    setQuery('');
    onShellOverride?.({ screen: 'S05', save: saveFor(true, 'all') });
    setSearch((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('d');
      return next;
    });
  }

  function leaveEmpty() {
    setEmptyMode(false);
    setFilter('all');
    setSelectedId(null);
    onShellOverride?.({ screen: 'S05', save: saveFor(false, 'all') });
  }

  function appendRevision(base: SampleDecisionLogEntry) {
    const nextNum = allEntries.length + (isKit ? 2 : 1);
    const id = 'D-' + String(nextNum).padStart(3, '0');
    const revised: SampleDecisionLogEntry = {
      ...base,
      id,
      how: `Supersedes ${base.id}`,
      at: '24 Nov 14:25',
    };
    setExtraRows((prev) => [...prev, revised]);
    recordIntent(`F427:revise:${base.id}->${id}`);
  }

  const chatMessages = emptyMode ? (
    <div className="sp-ai">
      <div className="h">
        <span className="av">S</span>Spekin<em>planning</em>
      </div>
      <p>No interview yet, so the log is empty. Start the interview and each answer shows up here.</p>
    </div>
  ) : isKit ? (
    <>
      <div className="sp-ub">Which kit did the plan pick?</div>
      <div className="sp-ai">
        <div className="h">
          <span className="av">S</span>Spekin<em>read from the log · 0 cr</em>
        </div>
        <p>yravg UI, the default. It is recorded as D-004, a plan decision, when the Detailed layer is generated.</p>
      </div>
    </>
  ) : isOpen ? (
    <>
      <div className="sp-ub">What is still open?</div>
      <div className="sp-ai">
        <div className="h">
          <span className="av">S</span>Spekin<em>read from the log · 0 cr</em>
        </div>
        <p>One skipped question, OQ-01, and one statement in the Detailed layer that has no decision behind it.</p>
      </div>
    </>
  ) : (
    <>
      <div className="sp-ub">Why did we pick 3%?</div>
      <div className="sp-ai">
        <div className="h">
          <span className="av">S</span>Spekin<em>read from the log · 0 cr</em>
        </div>
        <p>D-003 (24 Nov 12:06): you accepted 3% from four answers offered. It answers Q-03 and feeds the pitch Solution.</p>
        <div className="sp-gc">
          <div className="k">
            <Icon name="list" size={12} />
            Decision
            <span className="tag">
              <Pill tone="ok" label="D-003" />
            </span>
          </div>
          <div className="tt">Forecast over budget by more than 3%</div>
          <div className="ft">
            <span className="s">Interview · Q-03</span>
            <Btn
              label="Open entry"
              sm
              does="Selects D-003 in the log and opens its detail"
              feature="F424"
              onClick={() => selectEntry('D-003')}
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Planning chat"
          sub="decision log"
          ctxItems={ctxItems}
          ctxFoot="≈ 1.4k tokens · decisions only"
          placeholder="Ask about a decision…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('planning', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setView('planning', { removedCtx: [...view.removedCtx, name] })}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setView('planning', { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          {chatMessages}
        </ChatPanel>
      ) : null}
      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={emptyMode ? EMPTY_TABS : LOG_TABS}
          activeTab={activeTab}
          onSelect={(tab) => {
            setView('planning', { tab });
            if (tab === 'Spec · open questions') changeFilter('open');
            else if (tab === 'Decision log' && filter === 'open') changeFilter('all');
          }}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          openItems={
            emptyMode
              ? [{ icon: 'list', name: 'Meranti Yard log', onSelect: leaveEmpty }]
              : [{ icon: 'list', name: 'New project (empty log)', onSelect: enterEmpty }]
          }
          right={null}
        />
        <DecisionFilterBar
          active={filter}
          counts={counts}
          query={query}
          onFilter={changeFilter}
          onQueryChange={setQuery}
        />
        {emptyMode ? (
          <DecisionEmptyState onStartInterview={() => recordIntent('F428:start-interview')} />
        ) : (
          <div className="sp-work">
            <div className="gpa-dt">
              {isKit ? (
                <div className="gpa-nw gpa-bn ok" data-feature="F426">
                  <Icon name="check" size={16} />
                  <p>
                    <b>Kit recorded.</b> When the Detailed layer was generated, Spekin wrote the design kit as a plan decision with its own entry, D-004.
                  </p>
                </div>
              ) : null}
              {isOpen ? (
                <OpenQuestionsTable
                  rows={GAPA_OPEN}
                  onOpenId={(id) => recordIntent('F425:open:' + id)}
                  onAnswerNow={(id) => recordIntent('F425:answer:' + id)}
                />
              ) : (
                <DecisionLogTable
                  rows={visibleRows}
                  selectedId={isKit ? KIT_ROW.id : selectedId}
                  freshId={freshId}
                  onSelect={selectEntry}
                />
              )}
            </div>
            {isOpen ? (
              <OpenQuestionsInspector
                noBasis={GAPA_NOBASIS}
                activeTab={inspTab ?? 'Open'}
                onSelectTab={setInspTab}
                onConfirmNoBasis={() => recordIntent('F429:confirm')}
                onRemoveNoBasis={() => recordIntent('F429:remove')}
                onMore={() => recordIntent('F108:more')}
              />
            ) : activeEntry ? (
              <DecisionEntryInspector
                entry={activeEntry}
                isKit={isKit}
                activeTab={inspTab ?? 'Entry'}
                onSelectTab={setInspTab}
                onOpenInChat={() => recordIntent('F424:chat:' + activeEntry.id)}
                onRevise={() => appendRevision(activeEntry)}
                onProposeKit={() => recordIntent('F426:propose-kit')}
                onMore={() => recordIntent('F108:more')}
              />
            ) : (
              <DecisionSummaryInspector
                openQuestion={GAPA_OPEN[0]!}
                activeTab={inspTab ?? 'Summary'}
                onSelectTab={setInspTab}
                onShowOpen={() => changeFilter('open')}
                onMore={() => recordIntent('F108:more')}
              />
            )}
          </div>
        )}
      </section>
    </>
  );
}
