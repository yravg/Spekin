import { useState } from 'react';
import { sampleData, type ContextItem } from '../data/source';
import { useWorkspace } from '../state/workspace';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { Btn, IconBtn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';
import {
  KitView,
  TokensView,
  GapDetailView,
  GapRegisterView,
  ReuseReviewView,
  ReusePolicyView,
  routeDesignSystemPrompt,
  type DesignSystemState,
  type GapStatusFilter,
} from './DesignSystemViews';

const { MODEL } = sampleData;

const DS_CTX: ContextItem[] = [
  ['doc', 'DESIGN.md', 'r3'],
  ['frame', 'F-05 Variance bridge', 'r1'],
  ['doc', 'Kit: yravg UI', 'r3'],
];

const DS_TABS: ArtifactTabItem[] = [
  { icon: 'doc', name: 'DESIGN.md' },
  { icon: 'layers', name: 'Kit: yravg UI r3' },
  { icon: 'alert', name: 'GAP register' },
  { icon: 'frame', name: 'F-05 Variance bridge' },
];

export function isDesignSystemState(v: string | null): v is DesignSystemState {
  return v === 'kit' || v === 'tokens' || v === 'gap' || v === 'register' || v === 'reuse' || v === 'policy';
}

function activeTabFor(state: DesignSystemState): string {
  if (state === 'tokens') return 'DESIGN.md';
  if (state === 'register') return 'GAP register';
  if (state === 'gap') return 'F-05 Variance bridge';
  return 'Kit: yravg UI r3';
}

function crumbFor(state: DesignSystemState): string {
  if (state === 'tokens') return 'DESIGN.md and tokens';
  if (state === 'gap') return 'GAP-01';
  if (state === 'register') return 'GAP register';
  if (state === 'reuse') return 'Reuse review';
  if (state === 'policy') return 'Reuse policy';
  return 'Kit';
}

// S14 Design system: kit and GAP register (boards-gap-b.mjs).
export function DesignSystemWorkArea(props: {
  state: DesignSystemState;
  onStateChange: (next: DesignSystemState) => void;
  onOpenReview?: () => void;
  onOpenCanvas?: () => void;
  onOpenUsage?: () => void;
}) {
  const { state, onStateChange, onOpenReview, onOpenCanvas, onOpenUsage } = props;
  const view = useWorkspace((s) => s.view('design'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const [statusFilter, setStatusFilter] = useState<GapStatusFilter>('all');
  const [draft, setDraft] = useState('');
  const [removedCtx, setRemovedCtx] = useState<string[]>([]);
  const [gapAsTable, setGapAsTable] = useState(false);

  const ctxItems = DS_CTX.filter(([, name]) => !removedCtx.includes(name));
  const activeTab = activeTabFor(state);

  const sendPrompt = () => {
    const next = routeDesignSystemPrompt(draft);
    setDraft('');
    onStateChange(next);
  };

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Design chat"
          sub="Design system"
          ctxItems={ctxItems}
          ctxFoot="≈ 5.4k tokens · kit names only, no source code"
          placeholder="Ask about the kit, a token or a GAP…"
          draft={draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setDraft('')}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setRemovedCtx((prev) => [...prev, name])}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={setDraft}
          onComposerKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendPrompt();
            }
          }}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => {
            recordIntent('F107:model');
            onOpenUsage?.();
          }}
          onSend={sendPrompt}
        >
          {state === 'kit' ? (
            <>
              <div className="sp-ub">Which kit are we on?</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 6 s · 3 cr</em>
                </div>
                <p>
                  yravg UI r3, chosen in <b>D-15</b>. 14 components are in use and 1 is a GAP.
                </p>
              </div>
              <div className="sp-sugg">
                <button
                  type="button"
                  data-does="Puts this prompt in the composer; nothing runs until Send"
                  data-feature="F454"
                  onClick={() => setDraft('Show the GAP register')}
                >
                  <Icon name="spark" size={13} />
                  Show the GAP register
                </button>
              </div>
            </>
          ) : state === 'tokens' ? (
            <>
              <div className="sp-ub">Is --warn too light on the flag?</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 11 s · 6 cr</em>
                </div>
                <p>
                  It passes on the table row. I can draft a darker value as a <b>Proposal</b>. Tokens stay r3 until you
                  accept it.
                </p>
              </div>
            </>
          ) : state === 'gap' ? (
            <>
              <div className="sp-ub">F-05 needs a waterfall of package variances.</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 24 s · 14 cr</em>
                </div>
                <p>
                  The kit has no waterfall. I created <b>GAP-01</b> and linked the closest item.
                </p>
                <div className="sp-gg" data-feature="F452">
                  <div className="gh">
                    <span>GAP created</span>
                    <button
                      type="button"
                      data-does="Shows the GAP as a plain table row"
                      data-feature="F452"
                      onClick={() => setGapAsTable((v) => !v)}
                    >
                      Show as table
                    </button>
                  </div>
                  {gapAsTable ? (
                    <table className="sp-tbl">
                      <tbody>
                        <tr>
                          <td className="mono">GAP-01</td>
                          <td>Variance bridge chart</td>
                          <td className="mono">components/flow-diagram</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className="sp-gc prop">
                      <div className="k">
                        <Icon name="alert" size={12} />
                        GAP-01
                        <span className="tag">
                          <Pill tone="warn" label="Open" />
                        </span>
                      </div>
                      <div className="tt">Variance bridge chart</div>
                      <div className="bd">Closest: components/flow-diagram. Ticket T-218 points at GAP-01.</div>
                      <div className="ft">
                        <span className="s">Not a kit change</span>
                        <Btn
                          label="Open GAP"
                          sm
                          does="Opens the GAP entry with its closest item"
                          feature="F453"
                          onClick={() => onStateChange('gap')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : state === 'register' ? (
            <>
              <div className="sp-ub">List every GAP and what is closest.</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 8 s · 4 cr</em>
                </div>
                <p>
                  4 entries. <b>GAP-04</b> closed when kit r3 added a side sheet. 2 are open, 1 is a proposal.
                </p>
              </div>
            </>
          ) : state === 'reuse' ? (
            <>
              <div className="sp-ub">Can we reuse the pill and diff code from the reference?</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 31 s · 20 cr</em>
                </div>
                <p>
                  Two files are eligible under Apache-2.0 with a NOTICE. <b>RevealBlock.tsx</b> has no licence, so it is
                  blocked. I listed each file.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="sp-ub">Refactor the whole repo to use the kit.</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 9 s · 5 cr</em>
                </div>
                <p>
                  I will not change your codebase automatically, and I will not adopt a whole reference app. I can
                  propose a <b>UI inventory</b> and reuse single components after a licence review.
                </p>
              </div>
              <div className="sp-sugg">
                <button
                  type="button"
                  data-does="Puts this prompt in the composer; nothing runs until Send"
                  data-feature="F457"
                  onClick={() => setDraft('Draft the UI inventory')}
                >
                  <Icon name="spark" size={13} />
                  Draft the UI inventory
                </button>
              </div>
            </>
          )}
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={DS_TABS}
          activeTab={activeTab}
          onSelect={(tab) => {
            if (tab === 'DESIGN.md') onStateChange('tokens');
            else if (tab === 'GAP register') onStateChange('register');
            else if (tab === 'F-05 Variance bridge') onStateChange('gap');
            else onStateChange('kit');
          }}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={
            <Btn
              label="Propose change"
              cls="ink"
              icon="diff"
              does="Starts a Proposal for DESIGN.md, tokens or the kit; nothing changes until it is accepted on S08"
              feature="F459"
              onClick={() => {
                recordIntent('F459:propose');
                onOpenReview?.();
              }}
            />
          }
        />
        <div className="sp-tool">
          <span className="sp-crumb">
            Design
            <Icon name="chevR" size={12} />
            Design system
            <Icon name="chevR" size={12} />
            <b>{crumbFor(state)}</b>
          </span>
          <span className="sp-fill" />
          <IconBtn
            icon="undo"
            label="Undo"
            does="Undoes the last draft edit in this tab"
            sm
            feature="F451"
            onClick={() => recordIntent('F451:undo')}
          />
          <IconBtn
            icon="redo"
            label="Redo"
            does="Redoes the last undone draft edit"
            sm
            feature="F451"
            onClick={() => recordIntent('F451:redo')}
          />
          <IconBtn
            icon="history"
            label="Revisions"
            does="Opens S09 revision history for this document"
            sm
            feature="F451"
            onClick={() => recordIntent('F451:revisions')}
          />
        </div>
        {state === 'kit' ? (
          <KitView
            onChangeKit={() => {
              recordIntent('F451:change-kit');
              onOpenReview?.();
            }}
            onOpenGap={() => onStateChange('gap')}
          />
        ) : state === 'tokens' ? (
          <TokensView
            onEditToken={() => {
              recordIntent('F459:edit-token');
              onOpenReview?.();
            }}
          />
        ) : state === 'gap' ? (
          <GapDetailView
            onDraftKitProposal={() => {
              recordIntent('F452:draft-kit-proposal');
              onOpenReview?.();
            }}
            onOpenFrame={() => {
              recordIntent('F452:open-f05');
              onOpenCanvas?.();
            }}
            onOpenInKit={() => onStateChange('kit')}
            onUseClosest={() => {
              recordIntent('F453:use-closest');
              onOpenReview?.();
            }}
          />
        ) : state === 'register' ? (
          <GapRegisterView statusFilter={statusFilter} onFilterChange={setStatusFilter} />
        ) : state === 'reuse' ? (
          <ReuseReviewView
            onUseDateRange={() => {
              recordIntent('F458:use-date-range');
              onOpenReview?.();
            }}
            onReviewSource={() => {
              recordIntent('F456:review-source');
              onStateChange('reuse');
            }}
          />
        ) : (
          <ReusePolicyView
            onReviewInventory={() => {
              recordIntent('F457:review-s08');
              setView('design', { tab: view.tab });
              onOpenReview?.();
            }}
          />
        )}
      </section>
    </>
  );
}
