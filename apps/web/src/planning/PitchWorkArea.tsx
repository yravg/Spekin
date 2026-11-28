import { useEffect, useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import { sampleData, type ContextItem } from '../data/source';
import { useWorkspace, type SaveState } from '../state/workspace';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import {
  PitchBanner,
  PitchChatMessages,
  PitchDepthBar,
  PitchDocView,
  PitchInspector,
  type PitchState,
  type SpecDepth,
} from './PitchViews';

const { MODEL, GAPA_PITCH, GAPA_SLICES } = sampleData;

const CTX_PITCH: ContextItem[] = [
  ['doc', 'Pitch', 'r1'],
  ['doc', 'Decision log', 'D-001 to D-003'],
];

const PITCH_TABS: ArtifactTabItem[] = [
  { icon: 'doc', name: 'Pitch r1' },
  { icon: 'list', name: 'Decision log' },
  { icon: 'req', name: 'Spec · open questions' },
];

export const PITCH_SAVE: Record<PitchState, SaveState> = {
  proposal: { status: 'saving', tone: 'warn', text: 'Draft · pitch r1' },
  accepted: { status: 'saved', tone: 'ok', text: 'Saved 14:12' },
  guard: { status: 'saved', tone: 'ok', text: 'Saved 14:12' },
  breakdown: { status: 'saving', tone: 'warn', text: 'Draft · Detailed r1' },
  made: { status: 'saved', tone: 'ok', text: 'Saved 14:40' },
};

function parseDepth(raw: string | null): SpecDepth | null {
  if (raw === 'simple') return 'Simple';
  if (raw === 'detailed') return 'Detailed';
  if (raw === 'expert') return 'Expert';
  return null;
}

// S06 Pitch (Simple) work area inside the Planning stage (boards-gap-a.mjs).
export function PitchWorkArea(props: { onShellOverride?: (o: { save?: SaveState }) => void }) {
  const { onShellOverride } = props;
  const [search, setSearch] = useSearchParams();
  const view = useWorkspace((s) => s.view('planning'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const [state, setState] = useState<PitchState>('proposal');
  const [inspTab, setInspTab] = useState<string>('Inbox');
  const [activeTab, setActiveTab] = useState<string>('Pitch r1');
  const [removedCtx, setRemovedCtx] = useState<string[]>([]);

  useEffect(() => {
    onShellOverride?.({ save: PITCH_SAVE[state] });
  }, [state, onShellOverride]);

  const queryDepth = parseDepth(search.get('depth'));
  const defaultDepth: SpecDepth = state === 'breakdown' || state === 'made' ? 'Detailed' : 'Simple';
  const currentDepth: SpecDepth = queryDepth ?? defaultDepth;
  const ticketCount = state === 'made' ? GAPA_SLICES.length : 0;

  const ctxItems = CTX_PITCH.filter((item) => !removedCtx.includes(item[1]));

  const setDepthParam = (d: SpecDepth) => {
    const next = new URLSearchParams(search);
    next.set('depth', d.toLowerCase());
    setSearch(next, { replace: false });
  };

  const setNextState = (next: PitchState) => {
    setState(next);
    onShellOverride?.({ save: PITCH_SAVE[next] });
  };

  const handleAcceptPitch = () => {
    setNextState('accepted');
    setInspTab('Next');
    setDepthParam('Simple');
    recordIntent('F432:accept-pitch');
  };

  const handleLanjutKeDetail = () => {
    setNextState('breakdown');
    setInspTab('Inbox');
    setDepthParam('Detailed');
    recordIntent('F435:lanjut-ke-detail');
  };

  const handleAcceptBreakdown = () => {
    setNextState('made');
    setInspTab('Next');
    setDepthParam('Detailed');
    recordIntent('F438:accept-breakdown');
  };

  const handleSend = () => {
    const text = view.draft.trim();
    if ((state === 'accepted' || state === 'guard') && /ticket/i.test(text)) {
      setView('planning', { draft: '' });
      setNextState('guard');
      setInspTab('Next');
      recordIntent('F436:ticket-guard');
      return;
    }
    recordIntent('F114:send');
  };

  const handleComposerKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Planning chat"
          sub="pitch"
          ctxItems={ctxItems}
          ctxFoot="≈ 2.1k tokens · pitch and log only"
          placeholder="Ask about the pitch…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('planning', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setRemovedCtx((prev) => (prev.includes(name) ? prev : [...prev, name]))}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setView('planning', { draft })}
          onComposerKeyDown={handleComposerKeyDown}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={handleSend}
        >
          <PitchChatMessages state={state} onLanjutKeDetail={handleLanjutKeDetail} />
        </ChatPanel>
      ) : null}
      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={PITCH_TABS}
          activeTab={activeTab}
          onSelect={(name) => {
            setActiveTab(name);
            recordIntent('F104:tab:' + name);
          }}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={null}
        />
        <PitchBanner
          state={state}
          onEdit={() => recordIntent('F432:edit')}
          onAskChanges={() => recordIntent('F432:ask-changes')}
          onAcceptPitch={handleAcceptPitch}
          onEditSlices={() => recordIntent('F437:edit-slices')}
          onRejectBreakdown={() => {
            setNextState('accepted');
            setInspTab('Next');
            setDepthParam('Simple');
            recordIntent('F437:reject-breakdown');
          }}
          onAcceptBreakdown={handleAcceptBreakdown}
        />
        <PitchDepthBar
          depth={currentDepth}
          ticketCount={ticketCount}
          onDepth={(d) => {
            setDepthParam(d);
            recordIntent('F434:depth:' + d);
          }}
        />
        <div className="sp-work">
          <PitchDocView
            state={state}
            pitch={GAPA_PITCH}
            slices={GAPA_SLICES}
            onOpenSource={(id) => recordIntent('F431:source:' + id)}
            onConfirmNoBasis={() => recordIntent('F439:confirm-nobasis')}
            onBackToInterview={() => recordIntent('F439:back-to-interview')}
          />
          <PitchInspector
            state={state}
            activeTab={inspTab}
            onSelectTab={setInspTab}
            onMore={() => recordIntent('F108:more')}
            onReviewPitch={() => recordIntent('F433:review-pitch')}
            onAnswerOq={() => recordIntent('F433:answer-oq')}
            onConfirmNoBasis={() => recordIntent('F433:confirm-nobasis')}
            onLanjutKeDetail={handleLanjutKeDetail}
            onReviewBreakdown={() => recordIntent('F433:review-breakdown')}
            onReviewSpec={() => recordIntent('F433:review-spec')}
            onOpenTickets={() => recordIntent('F438:open-tickets')}
          />
        </div>
      </section>
    </>
  );
}
