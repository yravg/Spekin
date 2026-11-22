import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { MODEL, type SampleStage } from '@spekin/sample';
import { getProject, getStages, getUsage, isStageId } from '../data/source';
import { useWorkspace } from '../state/workspace';
import { TopBar } from './TopBar';
import { StageBar } from './StageBar';
import { NotFound } from './NotFound';
import { DesignWorkArea } from './DesignWorkArea';
import { BackendWorkArea } from './BackendWorkArea';
import { ChatPanel } from './ChatPanel';
import { ArtifactTabs } from './ArtifactTabs';
import { ViewSwitch } from './ViewSwitch';
import { Inspector } from './Inspector';
import { Btn, IconBtn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

function StagePlaceholderWorkArea({ stage }: { stage: SampleStage }) {
  const view = useWorkspace((s) => s.view(stage.id));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const tabName = stage.name + ' overview';
  const activeTab = view.tab ?? tabName;

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title={stage.name + ' chat'}
          sub={stage.text}
          ctxItems={[]}
          ctxFoot="Add artifacts to include them in the next run"
          placeholder={'Ask about ' + stage.name + '…'}
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView(stage.id, { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={() => {}}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setView(stage.id, { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin
            </div>
            <p>
              {stage.name} stage ({stage.text}). Switch back to Design or Backend to inspect active artifacts.
            </p>
          </div>
        </ChatPanel>
      ) : null}
      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={[{ icon: 'doc', name: tabName }]}
          activeTab={activeTab}
          onSelect={(tab) => setView(stage.id, { tab })}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={
            <>
              <Btn label="Share" icon="share" later="Share and comment links (deferred in the browser MVP, R-WS-3)" />
              <Btn
                label="Hand off"
                cls="ink"
                icon="download"
                does="Opens S34: downloads only accepted revisions with a fixed revision manifest"
                feature="F104"
                onClick={() => recordIntent('F104:handoff')}
              />
            </>
          }
        />
        <div className="sp-tool">
          <ViewSwitch current={view.viewMode} onChange={(viewMode) => setView(stage.id, { viewMode })} />
          <span className="sp-crumb">
            {stage.name}
            <Icon name="chevR" size={12} />
            <b>{tabName}</b>
          </span>
          <span className="sp-fill" />
          <IconBtn icon="undo" label="Undo" does="Undoes the last draft edit on this board" sm feature="F116" onClick={() => recordIntent('F116:undo')} />
          <IconBtn icon="redo" label="Redo" does="Redoes the last undone draft edit" sm feature="F116" onClick={() => recordIntent('F116:redo')} />
          <IconBtn icon="history" label="Revisions" does="Opens the revision list of the selected artifact" sm feature="F108" onClick={() => recordIntent('F108:revisions')} />
        </div>
        <div className="sp-work">
          <div className="sp-doc">
            <div className="meta">
              <Pill tone={stage.st === 'ring' || stage.st === 'half' ? 'mute' : stage.st} label={stage.text} />
              <span>Stage {stage.n} · {stage.name}</span>
            </div>
            <h2>{stage.name}</h2>
            <p>Artifacts for this stage are specified in their dedicated stage boards and open here when selected.</p>
          </div>
          <Inspector
            title={stage.name + ' readiness'}
            pill={[stage.st === 'ring' || stage.st === 'half' ? 'mute' : stage.st, stage.text]}
            sub="Derived from required artifacts, approvals and evidence"
            tabs={['Links', 'Evidence']}
            activeTab={view.inspTab}
            onSelectTab={(inspTab) => setView(stage.id, { inspTab })}
            onMore={() => recordIntent('F108:more')}
          >
            <div className="sp-ready">
              <div className="t">{stage.name} stage</div>
              <p>Status: {stage.text}.</p>
            </div>
          </Inspector>
        </div>
      </section>
    </>
  );
}

// S35 Project shell. Board: docs/design/spekin-canvas/project/S35-project-shell.dc.html (data-screen="S35").
export function ProjectShell() {
  const { project: projectId = '', stage } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [panel, setPanel] = useState<string | null>(null);
  const project = getProject(projectId);
  const usage = getUsage(projectId);
  const stages = getStages(projectId);
  if (!project || !usage || !isStageId(stages, stage)) return <NotFound />;
  const currentStage = stages.find((s) => s.id === stage)!;

  return (
    <div className="ap-root" data-screen="S35" data-panel={panel ?? undefined}>
      <div className="sp-app">
        <TopBar
          project={project}
          usage={usage}
          save={{ tone: 'ok', text: 'Saved 12:41' }}
          busy={stage === 'design' ? '1 designing · 1 waiting' : undefined}
          onOpenSwitcher={() => setPanel('switcher')}
          onOpenIncrement={() => setPanel('increment')}
          onOpenSpec={() => setPanel('spec')}
          onOpenUsage={() => setPanel('usage')}
          onOpenInbox={() => setPanel('inbox')}
          lang={lang}
          onLang={setLang}
        />
        <StageBar stages={stages} current={stage} onSwitch={(id) => navigate('/p/' + projectId + '/' + id)} onReadiness={() => setPanel('readiness')} />
        <div className="sp-body">
          {stage === 'design' ? (
            <DesignWorkArea />
          ) : stage === 'backend' ? (
            <BackendWorkArea />
          ) : (
            <StagePlaceholderWorkArea stage={currentStage} />
          )}
        </div>
      </div>
    </div>
  );
}
