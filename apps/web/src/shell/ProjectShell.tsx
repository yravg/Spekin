import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getProject, getStages, getUsage, isStageId } from '../data/source';
import { TopBar } from './TopBar';
import { StageBar } from './StageBar';
import { NotFound } from './NotFound';

// S35 Project shell. Board: docs/design/spekin-canvas/project/S35-project-shell.dc.html (data-screen="S35").
// Built so far: top bar and stage header. The chat, tabs, canvas and inspector are task card IMP-01.
export function ProjectShell() {
  const { project: projectId = '', stage } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [panel, setPanel] = useState<string | null>(null);
  const project = getProject(projectId);
  const usage = getUsage(projectId);
  const stages = getStages(projectId);
  if (!project || !usage || !isStageId(stages, stage)) return <NotFound />;

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
          <div className="ap-todo" data-todo="IMP-01">
            Work area for {stage}: chat, tabs, canvas and inspector are built in task card IMP-01.
          </div>
        </div>
      </div>
    </div>
  );
}
