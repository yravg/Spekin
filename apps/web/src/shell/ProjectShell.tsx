import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { sampleData, isStageId, type SampleStage, type StageId } from '../data/source';
const { MODEL, MODELS_USAGE } = sampleData;
import { useProjectData, useConnection } from '../data/provider';
import { useWorkspace, type SaveState } from '../state/workspace';
import { TopBar } from './TopBar';
import { StageBar } from './StageBar';
import { NotFound } from './NotFound';
import { DesignWorkArea } from './DesignWorkArea';
import { BackendWorkArea } from './BackendWorkArea';
import { SkillsWorkArea } from '../skills/SkillsWorkArea';
import { AdrsGlossaryWorkArea, isRecordsView, type RecordsView } from '../records/AdrsGlossaryWorkArea';
import { FramesCanvasWorkArea, type CanvasShellOverride } from '../canvas/FramesCanvasWorkArea';
import { ReviewAcceptWorkArea, type ReviewShellOverride } from '../review/ReviewAcceptWorkArea';
import { TargetedChangeWorkArea } from '../review/TargetedChangeWorkArea';
import { StyleReviewWorkArea, type StyleShellOverride } from '../style/StyleReviewWorkArea';
import { ReferenceIntakeWorkArea, type IntakeShellOverride } from '../intake/ReferenceIntakeWorkArea';
import { CodingHandoffWorkArea, type HandoffMode, type HandoffShellOverride } from '../delivery/CodingHandoffWorkArea';
import { GenUiWorkArea, type GenUiMode, type GenUiShellOverride } from '../genui/GenUiWorkArea';
import { useLayoutTier } from '../mobile/layoutTier';
import { ResponsiveProjectShell } from '../mobile/ResponsiveProjectShell';
import { ModelsUsageWorkArea, isUsageMoment, isUsageSection, usagePct, type UsageMoment, type UsageSection } from '../models/ModelsUsageWorkArea';
import { DeliveryWorkArea, deliveryStageView, deliveryViewStage, isDeliveryView } from '../delivery/DeliveryWorkArea';
import { ChatPanel } from './ChatPanel';
import { ArtifactTabs } from './ArtifactTabs';
import { ViewSwitch } from './ViewSwitch';
import { Inspector } from './Inspector';
import { Btn, IconBtn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

function StagePlaceholderWorkArea({ stage, onOpenDelivery }: { stage: SampleStage; onOpenDelivery?: (stage: SampleStage) => void }) {
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
          openItems={
            stage.id === 'integration' || stage.id === 'deploy'
              ? [
                  {
                    icon: 'flag',
                    name: 'Release readiness',
                    onSelect: () => (onOpenDelivery ? onOpenDelivery(stage) : recordIntent('F104:release-readiness')),
                  },
                ]
              : undefined
          }
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
export function ProjectShell({ usageView = false, recordsView = false }: { usageView?: boolean; recordsView?: boolean } = {}) {
  const { project: projectId = '', stage: stageParam } = useParams();
  const stage = stageParam ?? (recordsView ? 'spec' : 'design');
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const section: UsageSection = isUsageSection(search.get('section')) ? (search.get('section') as UsageSection) : 'models';
  const moment: UsageMoment = isUsageMoment(search.get('moment')) ? (search.get('moment') as UsageMoment) : 'calm';
  const recordsType = search.get('type');
  const recordsMode: RecordsView = isRecordsView(recordsType) ? recordsType : 'glossary';
  // S37 keeps its artifact view in the query (never draft text): /p/meranti-yard/backend?view=contracts.
  const viewParam = search.get('view');
  const delivery = isDeliveryView(viewParam) ? viewParam : null;
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [panel, setPanel] = useState<string | null>(null);
  const [specOverride, setSpecOverride] = useState<{ save?: SaveState; busy?: string }>({});
  const [designSub, setDesignSub] = useState<'shell' | 'canvas' | 'review' | 'targeted' | 'style' | 'intake' | 'handoff' | 'genui'>('shell');
  const [handoffInitialMode, setHandoffInitialMode] = useState<HandoffMode>('select');
  const [genUiInitialMode, setGenUiInitialMode] = useState<GenUiMode>('stream');
  const [canvasOverride, setCanvasOverride] = useState<CanvasShellOverride>({});
  const [reviewOverride, setReviewOverride] = useState<ReviewShellOverride>({});
  const [styleOverride, setStyleOverride] = useState<StyleShellOverride>({});
  const [intakeOverride, setIntakeOverride] = useState<IntakeShellOverride>({});
  const [handoffOverride, setHandoffOverride] = useState<HandoffShellOverride>({});
  const [genUiOverride, setGenUiOverride] = useState<GenUiShellOverride>({});
  const layoutTier = useLayoutTier();
  const save = useWorkspace((s) => s.save);
  const conflict = useWorkspace((s) => s.conflict);
  const setView = useWorkspace((s) => s.setView);
  const recordIntent = useWorkspace((s) => s.recordIntent);
  const { project, stages, usage, loading } = useProjectData(projectId);
  const connection = useConnection();
  // Loading draws nothing: the boards draw no spinner. In api mode the fetch resolves within the harness wait.
  if (loading) return null;
  if (!project || !usage || !isStageId(stages, stage)) return <NotFound />;
  const currentStage = stages.find((s) => s.id === stage)!;
  const screenId = usageView
    ? 'S36'
    : recordsView
      ? 'S19'
      : delivery
      ? 'S37'
      : stage === 'spec'
        ? 'S40'
      : stage === 'design' && designSub === 'canvas'
        ? (canvasOverride.screen ?? 'S29')
        : stage === 'design' && designSub === 'review'
          ? 'S33'
          : stage === 'design' && designSub === 'targeted'
            ? 'S32'
            : stage === 'design' && designSub === 'style'
              ? 'S30'
              : stage === 'design' && designSub === 'intake'
                ? 'S28'
                : stage === 'design' && designSub === 'handoff'
                  ? 'S34'
                  : stage === 'design' && designSub === 'genui'
                    ? 'S38'
                    : 'S35';
  const s36Usage = MODELS_USAGE[moment];
  const activeSave: SaveState =
    usageView
      ? save
      : recordsView
        ? { status: 'saved', tone: 'ok', text: 'Saved 12:52' }
        : stage === 'spec' && specOverride.save
      ? specOverride.save
      : stage === 'design' && designSub === 'canvas' && canvasOverride.save
        ? canvasOverride.save
        : stage === 'design' && designSub === 'review' && reviewOverride.save
          ? reviewOverride.save
          : stage === 'design' && designSub === 'style' && styleOverride.save
            ? styleOverride.save
            : stage === 'design' && designSub === 'intake' && intakeOverride.save
              ? intakeOverride.save
              : stage === 'design' && designSub === 'handoff' && handoffOverride.save
                ? handoffOverride.save
                : stage === 'design' && designSub === 'genui' && genUiOverride.save
                  ? genUiOverride.save
                  : save;
  const activeBusy =
    usageView || recordsView
      ? undefined
      : stage === 'spec'
      ? specOverride.busy
      : stage === 'design' && designSub === 'shell' && !conflict
        ? '1 designing · 1 waiting'
        : undefined;
  const activeBusyNode = stage === 'design' && designSub === 'canvas' ? canvasOverride.busyNode : undefined;
  // IMP-39: with the server offline the shell says so in the save chip and draws no busy chip.
  const offline = connection.offline;
  const shownSave: SaveState = offline
    ? { status: 'conflict', tone: 'bad', text: 'Offline · kept on this device' }
    : activeSave;
  const shownBusy = offline ? undefined : activeBusy;
  const displayStage = stage === 'design' && designSub === 'review' && reviewOverride.stage ? reviewOverride.stage : stage;
  const displayProject =
    stage === 'design' && designSub === 'review' && reviewOverride.specRev
      ? { ...project, spec: reviewOverride.specRev }
      : stage === 'design' && designSub === 'style' && styleOverride.specRev
        ? { ...project, spec: styleOverride.specRev }
        : project;
  const displayStages =
    stage === 'design' && designSub === 'review' && reviewOverride.specRev === 'r15'
      ? stages.map((s) => (s.id === 'spec' ? { ...s, text: 'Ready · r15' } : s))
      : stages;
  const openDelivery = (from: StageId) => navigate('/p/' + projectId + '/' + from + '?view=' + deliveryStageView(from));

  if (layoutTier !== 'desktop') {
    return (
      <ResponsiveProjectShell
        tier={layoutTier}
        project={displayProject}
        usage={usage}
        stages={displayStages}
        currentStage={currentStage}
        onSwitchStage={(id) => {
          if (id === 'design') setDesignSub('shell');
          navigate('/p/' + projectId + '/' + id);
        }}
      />
    );
  }

  return (
    <div className="ap-root" data-screen={screenId} data-panel={panel ?? undefined}>
      <div className="sp-app">
        <TopBar
          project={displayProject}
          usage={usageView ? { ...usage, used: s36Usage.used, cap: s36Usage.cap } : usage}
          save={shownSave}
          busy={shownBusy}
          busyNode={activeBusyNode}
          plain={usageView}
          usagePct={usageView ? usagePct(s36Usage) : undefined}
          onOpenSwitcher={() => setPanel('switcher')}
          onOpenIncrement={() => setPanel('increment')}
          onOpenSpec={() => setPanel('spec')}
          onOpenUsage={() => {
            if (usageView) setSearch({ section: 'limits', moment });
            else navigate('/p/' + projectId + '/usage?section=models');
          }}
          onOpenInbox={() => setPanel('inbox')}
          lang={lang}
          onLang={setLang}
        />
        <StageBar
          stages={displayStages}
          current={displayStage}
          onSwitch={(id) => {
            if (id === 'design') setDesignSub('shell');
            navigate('/p/' + projectId + '/' + id);
          }}
          onReadiness={() => setPanel('readiness')}
        />
        <div className="sp-body">
          {usageView ? (
            <ModelsUsageWorkArea
              key={section + ':' + moment}
              section={section}
              moment={moment}
              onSection={(next) => setSearch({ section: next, moment })}
              onExit={(tab) => {
                setView('design', { tab });
                navigate('/p/' + projectId + '/design');
              }}
              onIntent={recordIntent}
            />
          ) : recordsView ? (
            <AdrsGlossaryWorkArea
              key={recordsMode}
              view={recordsMode}
              onView={(next) => setSearch({ type: next })}
              onOpenSpec={() => navigate('/p/' + projectId + '/spec')}
              onIntent={recordIntent}
            />
          ) : delivery ? (
            <DeliveryWorkArea
              view={delivery}
              onView={(next) => navigate('/p/' + projectId + '/' + deliveryViewStage(next) + '?view=' + next)}
              onIntent={recordIntent}
            />
          ) : stage === 'design' ? (
            designSub === 'canvas' ? (
              <FramesCanvasWorkArea onShellOverride={setCanvasOverride} />
            ) : designSub === 'review' ? (
              <ReviewAcceptWorkArea
                onShellOverride={setReviewOverride}
                onOpenHandoff={(stale) => {
                  setHandoffInitialMode(stale ? 'stale' : 'select');
                  setDesignSub('handoff');
                }}
              />
            ) : designSub === 'targeted' ? (
              <TargetedChangeWorkArea onLeaveTargeted={() => setDesignSub('shell')} />
            ) : designSub === 'style' ? (
              <StyleReviewWorkArea onShellOverride={setStyleOverride} />
            ) : designSub === 'intake' ? (
              <ReferenceIntakeWorkArea
                onShellOverride={setIntakeOverride}
                onOpenShell={() => setDesignSub('shell')}
                onOpenStyle={() => setDesignSub('style')}
              />
            ) : designSub === 'handoff' ? (
              <CodingHandoffWorkArea
                key={handoffInitialMode}
                initialMode={handoffInitialMode}
                onShellOverride={setHandoffOverride}
                onOpenShell={() => setDesignSub('shell')}
                onOpenReview={() => setDesignSub('review')}
              />
            ) : designSub === 'genui' ? (
              <GenUiWorkArea
                key={genUiInitialMode}
                initialMode={genUiInitialMode}
                onShellOverride={setGenUiOverride}
                onOpenReview={() => setDesignSub('review')}
                onOpenStyle={() => setDesignSub('style')}
                onOpenHandoff={() => {
                  setHandoffInitialMode('select');
                  setDesignSub('handoff');
                }}
              />
            ) : (
              <DesignWorkArea
                onOpenCanvas={() => setDesignSub('canvas')}
                onOpenReview={() => setDesignSub('review')}
                onOpenTargeted={() => setDesignSub('targeted')}
                onOpenStyle={() => setDesignSub('style')}
                onOpenIntake={() => setDesignSub('intake')}
                onOpenHandoff={() => {
                  setHandoffInitialMode('select');
                  setDesignSub('handoff');
                }}
                onOpenGenUi={(m) => {
                  setGenUiInitialMode(m);
                  setDesignSub('genui');
                }}
                onOpenUsage={() => navigate('/p/' + projectId + '/usage?section=models')}
              />
            )
          ) : stage === 'backend' ? (
            <BackendWorkArea onOpenDelivery={() => openDelivery('backend')} />
          ) : stage === 'spec' ? (
            <SkillsWorkArea
              onShellOverride={setSpecOverride}
              onOpenRecords={() => navigate('/p/' + projectId + '/spec/records?type=glossary')}
            />
          ) : (
            <StagePlaceholderWorkArea stage={currentStage} onOpenDelivery={(s) => openDelivery(s.id)} />
          )}
        </div>
      </div>
    </div>
  );
}
