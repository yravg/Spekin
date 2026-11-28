import { useState, type KeyboardEvent } from 'react';
import type { SkillHistoryEntry, StageId } from '@spekin/contracts';
import { sampleData, type ContextItem, type SampleSkillRow } from '../data/source';
import { useData, useDataRead } from '../data/provider';
const { MODEL, SKL_DETAIL, SKL_DIFF, SKL_EDIT, SKL_GH, SKL_GLOSS, SKL_UPDATES } = sampleData;
import { useWorkspace, type SaveState } from '../state/workspace';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { Btn } from '../ui/Button';
import {
  SkillsLibraryView,
  SkillDetailView,
  SkillEditView,
  SkillGithubDrawer,
  SkillUpdatesView,
  SkillGlossaryView,
  SkillSlashMenu,
  stepSlashPicker,
} from './SkillsViews';

export type SkillsSubview = 'library' | 'detail' | 'edit' | 'github' | 'updates';

const CTX_SPEC: ContextItem[] = [
  ['req', 'Spec §3', 'r14'],
  ['doc', 'GLOSSARY.md', 'r5'],
  ['doc', 'ADR 0003', 'r1'],
];

const SPEC_TABS: ArtifactTabItem[] = [
  { icon: 'req', name: 'Spec §3' },
  { icon: 'doc', name: 'GLOSSARY.md' },
  { icon: 'layers', name: 'Skills' },
];

const COPY_ID = 'grill-meranti';

const STAGE_IDS: Record<string, StageId> = {
  Planning: 'planning',
  Specification: 'spec',
  Design: 'design',
  Frontend: 'frontend',
  Backend: 'backend',
  Integration: 'integration',
  Testing: 'testing',
  Deployment: 'deploy',
};

// S40 Skills library work area inside the Specification stage (boards-skills.mjs).
export function SkillsWorkArea(props: {
  onShellOverride?: (o: { save?: SaveState; busy?: string }) => void;
  onOpenRecords?: () => void;
}) {
  // IMP-37: the library and one skill's history come through the data door.
  const data = useData();
  const skills = useDataRead('skills', data.sample.SKL_SKILLS, (s) => s.skills(), []).value ?? [];
  const history = useDataRead<SkillHistoryEntry[]>('skills:history:grill', [], (s) => s.skillHistory('grill'), []).value ?? [];
  const view = useWorkspace((s) => s.view('spec'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const [subview, setSubview] = useState<SkillsSubview>('library');
  const [stageFilter, setStageFilter] = useState('All stages');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'on' | 'waiting' | null>(null);
  const [query, setQuery] = useState('');
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(skills.map((s) => [s[0], s[7]])),
  );
  const [detailPolicy, setDetailPolicy] = useState<'Auto' | 'Notify me' | 'Pinned'>('Auto');
  const [editTitle, setEditTitle] = useState(SKL_EDIT.title);
  const [editDesc, setEditDesc] = useState(SKL_EDIT.desc);
  const [editStages, setEditStages] = useState<string[]>(SKL_EDIT.stages);
  const [ghUrl, setGhUrl] = useState(SKL_GH.url);
  const [ghSelected, setGhSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SKL_GH.groups.flatMap(([, list]) => list)),
  );
  const [ghPolicy, setGhPolicy] = useState('Auto-update');
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashDismissed, setSlashDismissed] = useState(false);
  // IMP-41: a write refreshes what the screen draws from the source's answer.
  const [skillRows, setSkillRows] = useState<SampleSkillRow[] | null>(null);
  const [historyRows, setHistoryRows] = useState<SkillHistoryEntry[] | null>(null);
  const [copyId, setCopyId] = useState<string | null>(null);
  const [writeError, setWriteError] = useState<string | null>(null);

  const shownSkills = skillRows ?? skills;
  const shownHistory = historyRows ?? history;

  const activeTab = view.tab ?? 'Skills';
  const isUseMode = activeTab === 'GLOSSARY.md';
  const ctxItems = CTX_SPEC.filter(([, name]) => !view.removedCtx.includes(name));
  const specSlashSkills: SampleSkillRow[] = skills.filter(
    (s) => s[3].includes('Specification') && (enabledMap[s[0]] ?? s[7]),
  ).slice(0, 4);
  const showSlashMenu = view.draft.startsWith('/') && !slashDismissed;

  function syncOverride(nextTab: string, nextSub: SkillsSubview) {
    if (!props.onShellOverride) return;
    if (nextTab === 'GLOSSARY.md') {
      props.onShellOverride({ busy: '1 running' });
    } else if (nextSub === 'edit') {
      props.onShellOverride({ save: { status: 'saving', tone: 'warn', text: 'Draft · not saved' } });
    } else {
      props.onShellOverride({});
    }
  }

  function openSubview(next: SkillsSubview) {
    setSubview(next);
    setView('spec', { tab: 'Skills' });
    syncOverride('Skills', next);
  }

  function selectTab(tab: string) {
    setView('spec', { tab });
    syncOverride(tab, subview);
  }

  function handleDraftChange(val: string) {
    setView('spec', { draft: val });
    if (val.startsWith('/')) {
      setSlashDismissed(false);
      setSlashIndex(0);
    } else {
      setSlashDismissed(false);
    }
  }

  function handleComposerKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!showSlashMenu) return;
    const action = stepSlashPicker({ key: e.key, index: slashIndex, count: specSlashSkills.length });
    if (!action) return;
    e.preventDefault();
    if (action.type === 'move') {
      setSlashIndex(action.index);
    } else if (action.type === 'pick') {
      const picked = specSlashSkills[action.index];
      if (picked) {
        setView('spec', { draft: '/' + picked[0] + ' ' });
        setSlashDismissed(true);
      }
    } else if (action.type === 'close') {
      setSlashDismissed(true);
    }
  }

  // IMP-41: Copy and edit, Save and Roll back write through the data door. The screen redraws
  // from the source's answer; a 409 stays on the drawn state and shows the failure, never "saved".
  async function copyAndEdit() {
    setWriteError(null);
    const out = await data.copySkill('grill', { new_id: COPY_ID, new_title: SKL_EDIT.title });
    if (out.ok) {
      setCopyId(out.value.manifest.id);
    } else if (out.kind === 'stale') {
      // The copy already exists in this session; editing it is still the drawn next step.
      setCopyId(COPY_ID);
    } else {
      setWriteError(out.message);
      props.onShellOverride?.({ save: { status: 'failed', tone: 'bad', text: 'Failed (kept on this device)' } });
      return;
    }
    setSkillRows(await data.skills());
    openSubview('edit');
  }

  async function saveCopy() {
    if (!copyId) {
      recordIntent('F368:save-v2');
      openSubview('detail');
      return;
    }
    setWriteError(null);
    props.onShellOverride?.({ save: { status: 'saving', tone: 'warn', text: 'Saving…' } });
    const out = await data.editSkill(copyId, {
      title: editTitle,
      description: editDesc,
      stages: editStages.map((s) => STAGE_IDS[s]).filter((s): s is StageId => s !== undefined),
    });
    if (out.ok) {
      setSkillRows(await data.skills());
      setHistoryRows(await data.skillHistory(copyId));
      props.onShellOverride?.({ save: { status: 'saved', tone: 'ok', text: 'Saved 12:53' } });
      openSubview('detail');
    } else if (out.kind === 'stale') {
      props.onShellOverride?.({ save: { status: 'conflict', tone: 'bad', text: 'Conflict · skill changed' } });
      setWriteError(out.message);
    } else {
      props.onShellOverride?.({ save: { status: 'failed', tone: 'bad', text: 'Failed (kept on this device)' } });
      setWriteError(out.message);
    }
  }

  async function rollback(from: string) {
    const target = copyId ?? 'grill';
    const out = await data.rollbackSkill(target, from);
    if (out.ok) {
      setHistoryRows(await data.skillHistory(target));
      setSkillRows(await data.skills());
    } else {
      // The drawn updates log is per source; a template that has no user copy keeps the intent.
      recordIntent('F373:rollback:' + from);
    }
  }

  const right = (
    <Btn
      label="Hand off"
      cls="ink"
      icon="download"
      does="Opens S34: downloads only accepted revisions with a fixed revision manifest; chosen skills go in the package"
      feature="F377"
      onClick={() => recordIntent('F377:handoff')}
    />
  );

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Specification chat"
          sub="skills"
          ctxItems={ctxItems}
          ctxFoot="≈ 6.2k tokens · a skill reads only this list"
          placeholder="Type / to use a skill, or ask anything…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          beforeComposer={
            showSlashMenu ? (
              <SkillSlashMenu
                skills={specSlashSkills}
                activeIndex={slashIndex}
                onPick={(s) => {
                  setView('spec', { draft: '/' + s[0] + ' ' });
                  setSlashDismissed(true);
                }}
                onBrowseAll={() => {
                  setSlashDismissed(true);
                  openSubview('library');
                }}
              />
            ) : null
          }
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('spec', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setView('spec', { removedCtx: [...view.removedCtx, name] })}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={handleDraftChange}
          onComposerKeyDown={handleComposerKeyDown}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          {isUseMode ? (
            <>
              <div className="sp-ub">/grill Alert drawer for packages over 3%</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Grill the idea<em>Sonnet 5.5 · 41 s · 6 cr</em>
                </div>
                <p>Question 4 of 12 settled two terms and one decision. Proposed; nothing changes until you accept.</p>
                <div className="skl-prop" data-feature="F375">
                  <div className="skl-pr">
                    <span className="pill mute">Glossary</span>
                    <b>Data date</b>
                    <span>tanggal data</span>
                  </div>
                  <div className="skl-pr">
                    <span className="pill mute">Glossary</span>
                    <b>EAC</b>
                    <span>perkiraan biaya akhir</span>
                  </div>
                  <div className="skl-pr">
                    <span className="pill acc">ADR</span>
                    <b>Variance threshold is set per package</b>
                  </div>
                  <div className="skl-pa">
                    <Btn
                      label="Send to review"
                      sm
                      cls="ink"
                      does="Sends the 3 proposals to S33 review; the spec changes only when you accept there"
                      feature="F375"
                      onClick={() => recordIntent('F375:send-review')}
                    />
                    <Btn
                      label="Skip"
                      sm
                      does="Drops these proposals; the run is kept in history"
                      feature="F375"
                      onClick={() => recordIntent('F375:skip')}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="sp-ub">Which skills should I use to write the spec for variance alerts?</div>
              <div className="sp-ai">
                <div className="h">
                  <span className="av">S</span>Spekin<em>Sonnet 5.5 · 6 s · 2 cr</em>
                </div>
                <p>
                  For Specification, start with <b>Grill the idea</b>, then <b>Write the spec in EARS</b>, then{' '}
                  <b>Split into tickets</b>. Type <b>/</b> in the composer to pick one. Each run makes proposals you review; nothing
                  changes the spec on its own.
                </p>
              </div>
            </>
          )}
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={SPEC_TABS}
          activeTab={activeTab}
          onSelect={selectTab}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          openItems={
            props.onOpenRecords
              ? [{ icon: 'doc', name: 'ADRs and glossary', onSelect: props.onOpenRecords }]
              : undefined
          }
          right={right}
        />

        {writeError ? (
          <div className="sp-banner bad" role="alert" data-feature="F368">
            <p>{writeError}</p>
          </div>
        ) : null}

        {isUseMode ? (
          <SkillGlossaryView rows={SKL_GLOSS} onOpenReview={() => recordIntent('F375:open-review')} />
        ) : subview === 'detail' ? (
          <SkillDetailView
            detail={SKL_DETAIL}
            policy={detailPolicy}
            enabled={enabledMap.grill ?? true}
            onBack={() => openSubview('library')}
            onCopyEdit={() => void copyAndEdit()}
            onUseInChat={() => {
              setView('spec', { draft: '/grill' });
              setSlashDismissed(false);
              setSlashIndex(0);
            }}
            onOpenGithub={() => recordIntent('F366:open-github')}
            onPolicyChange={setDetailPolicy}
            onToggleEnabled={() => setEnabledMap((m) => ({ ...m, grill: !m.grill }))}
          />
        ) : subview === 'edit' ? (
          <SkillEditView
            edit={SKL_EDIT}
            title={editTitle}
            desc={editDesc}
            stages={editStages}
            onTitleChange={setEditTitle}
            onDescChange={setEditDesc}
            onToggleStage={(st) =>
              setEditStages((prev) => (prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st]))
            }
            onDiscard={() => openSubview('detail')}
            onSave={() => void saveCopy()}
            onTryAgain={() => recordIntent('F369:try-again')}
          />
        ) : subview === 'updates' ? (
          <SkillUpdatesView
            updates={SKL_UPDATES}
            history={shownHistory}
            diff={SKL_DIFF}
            onBack={() => openSubview('library')}
            onCheckNow={() => recordIntent('F372:check-now')}
            onRollback={(from) => void rollback(from)}
            onKeepCurrent={() => recordIntent('F372:keep-current')}
            onApplyWithoutTool={() => recordIntent('F372:apply-without-tool')}
            onApply={() => recordIntent('F372:apply')}
          />
        ) : (
          <SkillsLibraryView
            skills={shownSkills}
            stageFilter={stageFilter}
            sourceFilter={sourceFilter}
            statusFilter={statusFilter}
            query={query}
            enabledMap={enabledMap}
            onStageFilter={setStageFilter}
            onSourceFilter={setSourceFilter}
            onStatusFilter={setStatusFilter}
            onQueryChange={setQuery}
            onToggleSkill={(id) => setEnabledMap((m) => ({ ...m, [id]: !m[id] }))}
            onOpenSkill={() => openSubview('detail')}
            onOpenUpdates={() => openSubview('updates')}
            onOpenGithub={() => openSubview('github')}
            onNewSkill={() => openSubview('edit')}
          />
        )}

        {!isUseMode && subview === 'github' ? (
          <SkillGithubDrawer
            gh={SKL_GH}
            url={ghUrl}
            selected={ghSelected}
            policy={ghPolicy}
            onUrlChange={setGhUrl}
            onScan={() => recordIntent('F370:scan')}
            onTogglePick={(n) => setGhSelected((m) => ({ ...m, [n]: !m[n] }))}
            onPolicyChange={setGhPolicy}
            onClose={() => openSubview('library')}
            onAdd={() => {
              recordIntent('F370:add-skills');
              openSubview('library');
            }}
          />
        ) : null}
      </section>
    </>
  );
}
