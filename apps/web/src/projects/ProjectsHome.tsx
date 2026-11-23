import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { sampleData, type IntakeThumb, type RecentlyDeleted, type SampleIntakeProject, type StageTone } from '../data/source';
import { useData, useDataRead } from '../data/provider';
const { INTAKE_COMPOSER, INTAKE_DELETED, INTAKE_NEW, INTAKE_PROJECTS, INTAKE_SWITCH_ORDER, MODEL, PROJECT, STAGES, USAGE } = sampleData;
import { useWorkspace } from '../state/workspace';
import { Icon } from '../ui/Icon';
import { IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { MiniDashboard } from '../shell/MiniDashboard';
import { IntakeIcon, type IntakeIconName } from './IntakeIcon';

const TXT: Record<StageTone, string> = {
  ok: 'ready',
  half: 'in progress',
  ring: 'not started',
  warn: 'needs review',
  bad: 'blocked',
};

function dotOf(p: SampleIntakeProject): StageTone {
  return p.stages.find((s) => s === 'bad') ?? p.stages.find((s) => s === 'warn') ?? p.stages.find((s) => s === 'half') ?? 'ok';
}

function IntakeBtn(props: {
  label: string;
  icon?: IntakeIconName;
  cls?: 'ink' | 'ghost' | 'plain';
  sm?: boolean;
  kbd?: string;
  does?: string;
  feature?: string;
  later?: string;
  onClick?: () => void;
}) {
  const { label, icon, cls = 'ghost', sm, kbd, does, feature, later, onClick } = props;
  const className = ['sp-btn', cls, sm ? 'sm' : ''].filter(Boolean).join(' ');
  if (later) {
    return (
      <button type="button" className={className} data-later={later} disabled title={'Later: ' + later}>
        {icon ? <IntakeIcon name={icon} size={14} /> : null}
        {label}
      </button>
    );
  }
  return (
    <button type="button" className={className} data-does={does} data-feature={feature} onClick={onClick}>
      {icon ? <IntakeIcon name={icon} size={14} /> : null}
      {label}
      {kbd ? <span className="int-k">{kbd}</span> : null}
    </button>
  );
}

function IntakeIconBtn(props: { icon: IntakeIconName; label: string; does: string; feature: string; size?: number; onClick: () => void }) {
  const { icon, label, does, feature, size = 15, onClick } = props;
  return (
    <button type="button" className="sp-ibtn sm" aria-label={label} data-does={does} data-feature={feature} onClick={onClick}>
      <IntakeIcon name={icon} size={size} />
    </button>
  );
}

function ProjectThumb({ thumb }: { thumb: IntakeThumb }) {
  switch (thumb) {
    case 'dash':
      return <MiniDashboard title="Variance" kpi table rows={3} />;
    case 'gantt': {
      const bars: [number, number, string][] = [
        [0, 40, 'dk'],
        [18, 50, ''],
        [32, 38, 'hi'],
        [8, 30, ''],
        [52, 36, 'dk'],
        [40, 44, ''],
      ];
      return (
        <div className="tk">
          <div className="tk-h">
            <i />
            <u style={{ width: '30%' }} />
          </div>
          {bars.map(([l, w, c], idx) => (
            <div key={idx} className="tk-g">
              <u />
              <span className="tr">
                <u className={c || undefined} style={{ left: l + '%', width: w + '%' }} />
              </span>
            </div>
          ))}
        </div>
      );
    }
    case 'table': {
      const rows: [number, number, number, boolean?][] = [
        [40, 22, 20],
        [52, 30, 26],
        [34, 26, 16, true],
        [46, 18, 24],
        [38, 28, 18],
      ];
      return (
        <div className="tk">
          <div className="tk-h">
            <i />
            <u style={{ width: '26%' }} />
          </div>
          {rows.map(([a, b, c, hi], idx) => (
            <div key={idx} className="tk-r">
              <u style={{ width: a + '%' }} />
              <u style={{ width: b + '%' }} />
              <u className={hi ? 'hi' : undefined} style={{ width: c + '%' }} />
            </div>
          ))}
        </div>
      );
    }
    case 'form':
      return (
        <div className="tk">
          <div className="tk-h">
            <i />
            <u style={{ width: '34%' }} />
          </div>
          <div className="tk-f">
            <u style={{ width: '22%' }} />
            <div className="fld" />
            <u style={{ width: '28%' }} />
            <div className="fld" />
            <div className="go" />
          </div>
        </div>
      );
    case 'cards':
      return (
        <div className="tk">
          <div className="tk-h">
            <i />
            <u style={{ width: '28%' }} />
          </div>
          <div className="tk-c">
            {[70, 54, 62].map((w) => (
              <div key={w}>
                <b />
                <u style={{ width: w + '%' }} />
                <u style={{ width: '40%' }} />
              </div>
            ))}
          </div>
        </div>
      );
    case 'empty':
      return (
        <div className="tk-e">
          <Icon name="frame" size={22} stroke={1.5} />
          No frames yet
        </div>
      );
  }
}

function ProjectCard(props: {
  project: SampleIntakeProject;
  gone?: boolean;
  onOpen: (id: string) => void;
  onRestore: (id: string) => void;
  onMenu: (id: string) => void;
}) {
  const { project: p, gone, onOpen, onRestore, onMenu } = props;
  const readyCount = p.stages.filter((s) => s === 'ok').length;
  const ariaMarks = 'Stages: ' + STAGES.map((s, i) => s.name + ' ' + TXT[p.stages[i] ?? 'ring']).join(', ');
  return (
    <article className={'int-card' + (gone ? ' gone' : '')}>
      <div className="int-thw">
        <button
          type="button"
          className="int-th"
          data-does={'Opens ' + p.name + ' at ' + p.now + '; its tabs, zoom and selection come back'}
          data-feature="F126"
          onClick={() => onOpen(p.id)}
        >
          <ProjectThumb thumb={p.thumb} />
        </button>
        {gone ? (
          <div className="int-gone">
            <IntakeIcon name="trash" size={14} />
            Deleted {INTAKE_DELETED.at}
            <IntakeBtn
              label="Restore"
              cls="ink"
              sm
              does={'Restores ' + p.name + ' with its specs, boards and history; it returns to the list in its last-opened place'}
              feature="F134"
              onClick={() => onRestore(p.id)}
            />
          </div>
        ) : (
          <IntakeIconBtn
            icon="more"
            label={'Actions for ' + p.name}
            does={
              p.role === 'Viewer'
                ? 'Opens the card menu: Open only, because you are a viewer on this project'
                : 'Opens the card menu: Open, Rename, Archive, Delete (owner only)'
            }
            feature="F135"
            onClick={() => onMenu(p.id)}
          />
        )}
      </div>
      <div className="int-cb">
        <button
          type="button"
          className="int-cn"
          data-does={'Opens ' + p.name + ' at ' + p.now}
          data-feature="F126"
          onClick={() => onOpen(p.id)}
        >
          {p.name}
          {p.role === 'Viewer' ? <Pill tone="mute" label="Viewer" /> : null}
        </button>
        <span className="int-cp">{p.idea}</span>
        <span className="int-cp">{p.inc}</span>
        <div className="int-cm">
          <span className="int-mk" role="img" aria-label={ariaMarks}>
            {p.stages.map((t, i) => (
              <i key={i} className={'dot ' + t} title={(STAGES[i]?.name ?? '') + ': ' + TXT[t]} />
            ))}
          </span>
          <em>{readyCount} of 8 ready</em>
        </div>
        <div className="int-cf">
          <span>{p.at}</span>
          <span className="o">
            <span className="sp-av" aria-hidden="true">
              {p.ini}
            </span>
            {p.owner}
          </span>
        </div>
      </div>
    </article>
  );
}

// Mirrors boards-intake.mjs palette (S27:switch).
export function SwitchPalette(props: {
  projects: SampleIntakeProject[];
  selectedIndex: number;
  renamingIndex: number | null;
  renameValue: string;
  onSelect: (id: string) => void;
  onStartRename: (idx: number) => void;
  onRenameChange: (v: string) => void;
  onNewProject: () => void;
  onClose: () => void;
}) {
  const { projects, selectedIndex, renamingIndex, renameValue, onSelect, onStartRename, onNewProject } = props;
  return (
    <div className="int-pal" role="dialog" aria-label="Switch project" data-feature="F128">
      <div className="int-pq">
        <IntakeIcon name="search" size={18} />
        <i className="int-caret" />
        <span>Type to find a project</span>
        <span className="sp-fill" />
        <span className="int-k">esc</span>
      </div>
      <div className="int-pg">
        Opened recently<span>by last opened, newest first</span>
      </div>
      {projects.map((p, i) =>
        renamingIndex === i ? (
          <div key={p.id} className="int-prw ren">
            <i className={'dot ' + dotOf(p)} />
            <div className="int-ren">
              {renameValue}
              <i className="int-caret" />
            </div>
            <span className="int-hint">↵ saves · esc cancels</span>
          </div>
        ) : (
          <div key={p.id} className="int-prw">
            <button
              type="button"
              className={'int-pr' + (selectedIndex === i ? ' sel' : '')}
              data-does={'Opens ' + p.name + '; Enter does the same on the highlighted row'}
              data-feature="F128"
              onClick={() => onSelect(p.id)}
            >
              <i className={'dot ' + dotOf(p)} />
              <span className="t">
                {p.name}
                <small>
                  {p.idea} · {p.inc}
                </small>
              </span>
              <span className="w">{p.ago}</span>
              <span className="int-k">⌘{i + 1}</span>
            </button>
            {selectedIndex === i ? (
              <IntakeIconBtn
                icon="pencil"
                label={'Rename ' + p.name}
                does="Renames this project in place (F2)"
                feature="F129"
                onClick={() => onStartRename(i)}
              />
            ) : null}
          </div>
        ),
      )}
      <div className="int-pf">
        <IntakeBtn
          label="New project…"
          sm
          cls="plain"
          icon="plus"
          does="Opens the Create project dialog with the typed text as the name"
          feature="F130"
          onClick={onNewProject}
        />
        <div className="hs">
          <span>
            <span className="int-k">↑↓</span>move
          </span>
          <span>
            <span className="int-k">↵</span>open
          </span>
          <span>
            <span className="int-k">F2</span>rename
          </span>
          <span>
            <span className="int-k">esc</span>close
          </span>
        </div>
      </div>
    </div>
  );
}

// Mirrors boards-intake.mjs createModal (S27:create, C-01).
export type CreateDomain = 'dashboard' | 'engineering' | 'control' | 'finance';

export function CreateProjectModal(props: {
  idea: string;
  domain: CreateDomain;
  uiLang: 'id' | 'en';
  onDomain: (d: CreateDomain) => void;
  onUiLang: (l: 'id' | 'en') => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  const { idea, domain, uiLang, onDomain, onUiLang, onClose, onCreate } = props;
  return (
    <div className="int-mod" role="dialog" aria-label="New project" data-feature="F130">
      <div className="int-mh">
        <b>New project</b>
        <span>Creating it costs no credits</span>
        <span className="sp-fill" />
        <IntakeIconBtn icon="x" label="Close" does="Closes the dialog without creating anything" feature="F130" onClick={onClose} />
      </div>
      <div className="int-mb">
        <div className="int-fl">
          <div className="lb">
            What is it for?<span>Picks the questions and the specialist pack</span>
          </div>
          <div className="int-rcs d4" role="radiogroup" aria-label="What is it for">
            <button
              type="button"
              role="radio"
              aria-checked={domain === 'dashboard'}
              className="int-rc"
              data-does="Sets the domain to Dashboard: the interview uses its question bank and pack"
              data-feature="F130"
              onClick={() => onDomain('dashboard')}
            >
              <b>
                <Icon name="grid" size={14} />
                Dashboard
              </b>
              Reports and KPIs from your own data
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={domain === 'engineering'}
              className="int-rc"
              data-does="Sets the domain to Engineering: the interview uses its question bank and pack"
              data-feature="F130"
              onClick={() => onDomain('engineering')}
            >
              <b>
                <Icon name="layers" size={14} />
                Engineering
              </b>
              Drawings, models and IFC (CAD/BIM)
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={domain === 'control'}
              className="int-rc"
              data-does="Sets the domain to Project control: the interview uses its question bank and pack"
              data-feature="F130"
              onClick={() => onDomain('control')}
            >
              <b>
                <Icon name="flag" size={14} />
                Project control
              </b>
              Schedule, cost, progress and EAC
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={domain === 'finance'}
              className="int-rc"
              data-does="Sets the domain to Finance and stock: the interview uses its question bank and pack"
              data-feature="F130"
              onClick={() => onDomain('finance')}
            >
              <b>
                <Icon name="db" size={14} />
                Finance and stock
              </b>
              Budgets, invoices and stock levels
            </button>
          </div>
        </div>
        <div className="int-fl">
          <div className="lb">
            What do you want to build?<span>20 to 4,000 characters</span>
          </div>
          <div className="int-fi ta foc">
            {idea}
            <i className="int-caret" />
          </div>
          <div className="int-fh">
            <span>{idea === INTAKE_NEW.idea ? INTAKE_NEW.ideaLen : idea.length} / 4,000</span>
            <Pill tone="ok" label="Long enough to start" />
          </div>
        </div>
      </div>
      <div className="int-mf">
        <span className="int-hint">
          The name comes from your pitch; change it any time. Shown in {uiLang === 'en' ? 'English' : 'Bahasa Indonesia'} ·{' '}
          <button
            type="button"
            className="int-lang"
            data-does="Switches the UI to Bahasa Indonesia at once; the idea you typed is kept"
            data-feature="F131"
            onClick={() => onUiLang(uiLang === 'en' ? 'id' : 'en')}
          >
            {uiLang === 'en' ? 'Bahasa Indonesia' : 'English'}
          </button>
        </span>
        <span className="sp-fill" />
        <IntakeBtn label="Cancel" cls="plain" does="Closes the dialog without creating anything" feature="F130" onClick={onClose} />
        <IntakeBtn
          label="Create project"
          cls="ink"
          kbd="⌘↵"
          does="Creates the project and asks the first question; disabled until a domain is picked and the idea has 20 characters"
          feature="F130"
          onClick={onCreate}
        />
      </div>
    </div>
  );
}

// S27 Projects home (boards-intake.mjs). States: home, all, switch, create, first, restore.
export function ProjectsHome({ initialView = 'home' }: { initialView?: 'home' | 'all' | 'first' | 'restore' }) {
  const navigate = useNavigate();
  const recordIntent = useWorkspace((s) => s.recordIntent);
  // IMP-37: Recently deleted comes through the data door; the drawn copy is the seed.
  const data = useData();
  const deleted =
    useDataRead(
      'projects:deleted',
      {
        ids: [data.sample.INTAKE_DELETED.id],
        daysLeft: { [data.sample.INTAKE_DELETED.id]: data.sample.INTAKE_DELETED.days },
      },
      (source) => source.recentlyDeleted(),
      [],
    ).value ?? { ids: [], daysLeft: {} };

  const [view, setView] = useState<'home' | 'all' | 'first' | 'restore'>(initialView);
  const [overlay, setOverlay] = useState<'none' | 'switch' | 'create'>('none');
  const [deletedView, setDeletedView] = useState<RecentlyDeleted | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const deletedNow = deletedView ?? deleted;
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [ideaLang, setIdeaLang] = useState<'id' | 'en'>('en');
  const [startChip, setStartChip] = useState<'idea' | 'refs' | 'spec'>('idea');
  const [activeFilterTab, setActiveFilterTab] = useState('Recently opened');
  const [layout, setLayout] = useState<'cards' | 'list'>('cards');
  const [createUiLang, setCreateUiLang] = useState<'id' | 'en'>('en');
  const [createDomain, setCreateDomain] = useState<CreateDomain>('control');
  const [goneId, setGoneId] = useState<string | null>(
    initialView === 'restore' ? (deleted.ids[0] ?? null) : null,
  );
  const [showRestoreBanner, setShowRestoreBanner] = useState(initialView === 'restore');
  const [palSel, setPalSel] = useState(1);
  const [palRenaming, setPalRenaming] = useState<number | null>(2);
  const [palRenameVal, setPalRenameVal] = useState('Bakau Permits renewals');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setView('all');
        setOverlay('switch');
      } else if (e.key === 'Escape' && overlay !== 'none') {
        setOverlay('none');
      } else if (e.key === 'F2' && overlay === 'switch') {
        setPalRenaming(2);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay]);

  const orderedProjects = INTAKE_SWITCH_ORDER.map((id) => INTAKE_PROJECTS.find((p) => p.id === id)!).filter(Boolean);
  const isFirst = view === 'first';
  const isRestore = view === 'restore';
  const navCur = view === 'all' || view === 'restore' ? 'projects' : 'home';
  const pct = Math.round((USAGE.used / USAGE.cap) * 100);
  const sev = pct >= 90 ? ' crit' : pct >= 70 ? ' warn' : '';

  function openProject(id: string) {
    if (id === 'meranti-yard') {
      navigate('/p/meranti-yard/design');
    } else {
      recordIntent('F126:open:' + id);
      navigate('/p/meranti-yard/design');
    }
  }

  function openRestore() {
    setView('restore');
    setGoneId(deletedNow.ids[0] ?? INTAKE_DELETED.id);
    setShowRestoreBanner(true);
    setOverlay('none');
  }

  // IMP-41: Restore writes through the data door; the screen redraws only when it answers.
  async function restore(id: string) {
    setRestoreError(null);
    const out = await data.restoreProject(id);
    if (out.ok) {
      const daysLeft = { ...deletedNow.daysLeft };
      delete daysLeft[id];
      setDeletedView({ ids: deletedNow.ids.filter((x) => x !== id), daysLeft });
      setGoneId(null);
      setShowRestoreBanner(false);
    } else {
      setRestoreError(out.message);
      if (out.kind === 'stale') {
        // Already live elsewhere: draw it live rather than pretending a restore happened.
        setDeletedView({ ids: deletedNow.ids.filter((x) => x !== id), daysLeft: deletedNow.daysLeft });
        setGoneId(null);
      }
    }
  }

  return (
    <div className="ap-root" data-screen="S27">
      <div className="int-app">
        <header className="sp-top">
          <span className="sp-mark" aria-hidden="true">
            S
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="int-crumb">{isFirst ? 'Welcome' : 'Projects'}</span>
            {!isFirst ? (
              <>
                <span className="sp-sep" />
                <button
                  type="button"
                  className="sp-chip"
                  data-does="Opens Meranti Yard where you left it: Design stage, tab Variance flows"
                  data-feature="F139"
                  onClick={() => openProject('meranti-yard')}
                >
                  <span className="k">Resume</span>Meranti Yard
                  <Icon name="chevR" size={12} />
                </button>
              </>
            ) : null}
            <IntakeBtn
              label="Switch project"
              sm
              kbd="⌘K"
              does="Opens the switch-project palette; Ctrl+K on Windows and Linux"
              feature="F128"
              onClick={() => {
                setView('all');
                setOverlay('switch');
              }}
            />
          </div>
          <span className="sp-fill" />
          {!isFirst ? (
            <span className="sp-save" data-feature="F112" role="status">
              <span className="dot ok" />
              Saved 12:41
            </span>
          ) : null}
          {isFirst ? (
            <button
              type="button"
              className="sp-meter"
              data-does="Opens S36 usage: no credits used yet"
              data-feature="F139"
              onClick={() => recordIntent('F139:usage')}
            >
              Hosted
              <i>
                <u style={{ width: '0%' }} />
              </i>
              <b>0</b>of 5,000 cr
            </button>
          ) : (
            <button
              type="button"
              className={'sp-meter' + sev}
              data-does="Opens S36 usage: estimate, reservations, actuals, cap and remaining credits; the bar turns amber at 70% and red at 90% of the cap"
              data-feature="F111"
              onClick={() => recordIntent('F111:usage')}
            >
              {USAGE.source}
              <i>
                <u style={{ width: pct + '%' }} />
              </i>
              <b>{USAGE.used.toLocaleString('en-US')}</b>of {USAGE.cap.toLocaleString('en-US')} cr
            </button>
          )}
          {!isFirst ? (
            <span style={{ position: 'relative', display: 'inline-flex' }} data-feature="F109">
              <IconBtn
                icon="inbox"
                label="Agent inbox: 2 jobs need approval"
                does="Opens the Agent Inbox: running jobs and approvals, beside the work, never over it"
                feature="F109"
                badge={2}
                onClick={() => recordIntent('F109:inbox')}
              />
            </span>
          ) : null}
          <div className="sp-lang" role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === 'en'} data-does="Shows the UI in English" data-feature="F115" onClick={() => setLang('en')}>
              EN
            </button>
            <button type="button" aria-pressed={lang === 'id'} data-does="Shows the UI in Bahasa Indonesia" data-feature="F115" onClick={() => setLang('id')}>
              ID
            </button>
          </div>
          <span className="sp-av" aria-label={PROJECT.user}>
            {PROJECT.initials}
          </span>
        </header>

        <div className="int-body">
          <nav className="int-rail" aria-label="Spekin" data-feature="F121">
            <div className="int-rtop">
              <IntakeBtn
                label="New project"
                cls="ink"
                icon="plus"
                does="Opens the Create project dialog"
                feature="F130"
                onClick={() => {
                  setView('all');
                  setOverlay('create');
                }}
              />
              <IntakeIconBtn
                icon="panel"
                label="Collapse navigation"
                does="Collapses the rail to icons; the choice is remembered on this device"
                feature="F121"
                onClick={() => recordIntent('F121:collapse')}
              />
            </div>
            <button
              type="button"
              className="int-nav"
              aria-current={navCur === 'home' ? 'page' : undefined}
              data-does="Opens Home: the composer and your recent projects"
              data-feature="F121"
              onClick={() => {
                setView(isFirst ? 'first' : 'home');
                setOverlay('none');
              }}
            >
              <IntakeIcon name="home" size={16} />
              Home
            </button>
            <button
              type="button"
              className="int-nav"
              aria-current={navCur === 'projects' ? 'page' : undefined}
              data-does="Opens All projects"
              data-feature="F121"
              onClick={() => {
                setView('all');
                setOverlay('none');
              }}
            >
              <IntakeIcon name="folder" size={16} />
              Projects
              {!isFirst ? <span className="n">{INTAKE_PROJECTS.length}</span> : null}
            </button>
            <button
              type="button"
              className="int-nav"
              data-does="Opens S36 usage: credits used, reservations and the cap"
              data-feature="F121"
              onClick={() => recordIntent('F121:usage')}
            >
              <IntakeIcon name="gauge" size={16} />
              Usage
              <span className="n">{isFirst ? '0' : USAGE.used.toLocaleString('en-US')} cr</span>
            </button>
            <button
              type="button"
              className="int-nav"
              data-does="Opens settings: language, account, model sources"
              data-feature="F121"
              onClick={() => recordIntent('F121:settings')}
            >
              <IntakeIcon name="sliders" size={16} />
              Settings
            </button>
            <div className="int-rl">
              Recent<span>by last opened</span>
            </div>
            {isFirst ? (
              <p className="int-rempty">No projects yet. The ones you open show up here.</p>
            ) : (
              INTAKE_PROJECTS.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="int-rp"
                  data-does={'Opens ' + p.name + ' where you left it'}
                  data-feature="F121"
                  onClick={() => openProject(p.id)}
                >
                  <i className={'dot ' + dotOf(p)} />
                  <span>{p.name}</span>
                </button>
              ))
            )}
            <div className="int-rfoot">
              <button
                type="button"
                className="int-nav"
                data-does={'Opens projects deleted in the last ' + INTAKE_DELETED.days + ' days, each with Restore'}
                data-feature="F134"
                onClick={openRestore}
              >
                <IntakeIcon name="trash" size={16} />
                Recently deleted
                {isRestore && goneId ? <span className="bd">1</span> : null}
              </button>
              <div className="int-user">
                <span className="sp-av" aria-hidden="true">
                  {PROJECT.initials}
                </span>
                <span>
                  <b>{PROJECT.user}</b>Personal workspace
                </span>
              </div>
            </div>
          </nav>

          {isFirst ? (
            <section className="int-main" aria-label="Start">
              <div className="int-first" data-feature="F132">
                <h1 className="int-h1">Start your first project</h1>
                <p className="int-sub">Pick the way in that matches what you already have. You can add the others later.</p>
                <div className="int-st3">
                  <button
                    type="button"
                    className="int-sc lead"
                    data-does="Opens the Create project dialog on An idea"
                    data-feature="F132"
                    onClick={() => {
                      setView('all');
                      setOverlay('create');
                    }}
                  >
                    <span className="tile">
                      <Icon name="spark" size={18} />
                    </span>
                    <b>Describe an idea</b>
                    Write a few sentences. Spekin asks short questions, then writes a pitch you can edit.
                    <span className="go">
                      Start with an idea
                      <IntakeIcon name="arrow" size={14} />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="int-sc"
                    data-does="Opens the Create project dialog on Reference screenshots; the project opens on the Design stage import (S28)"
                    data-feature="F132"
                    onClick={() => {
                      setView('all');
                      setOverlay('create');
                    }}
                  >
                    <span className="tile">
                      <Icon name="image" size={18} />
                    </span>
                    <b>Add reference screenshots</b>
                    Drop or paste screenshots of an app you like. Spekin learns its look before it draws.
                    <span className="go">
                      Add screenshots
                      <IntakeIcon name="arrow" size={14} />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="int-sc"
                    data-does="Opens the Create project dialog on An existing spec"
                    data-feature="F132"
                    onClick={() => {
                      setView('all');
                      setOverlay('create');
                    }}
                  >
                    <span className="tile">
                      <Icon name="doc" size={18} />
                    </span>
                    <b>Bring an existing spec</b>
                    Paste or upload a spec you already wrote. Spekin reads it as revision r1.
                    <span className="go">
                      Import a spec
                      <IntakeIcon name="arrow" size={14} />
                    </span>
                  </button>
                </div>
                <div className="int-low">
                  <div className="int-lw">
                    <IntakeIcon name="plug" size={18} />
                    <span>
                      <b>Connect a local agent</b>Run models through an agent on your own computer.
                    </span>
                    <button
                      type="button"
                      className="sp-btn ghost sm"
                      data-later="Local agent as a model source is deferred (R-MOD-1)"
                      disabled
                    >
                      Connect
                    </button>
                  </div>
                  <div className="int-lw">
                    <IntakeIcon name="folder" size={18} />
                    <span>
                      <b>Look around first</b>Open the Meranti Yard sample, read only.
                    </span>
                    <IntakeBtn
                      label="Open sample"
                      sm
                      does="Opens the Meranti Yard sample project read only, so nothing you do is saved"
                      feature="F133"
                      onClick={() => openProject('meranti-yard')}
                    />
                  </div>
                </div>
                <p className="int-priv">
                  <IntakeIcon name="lock" size={13} />
                  Everything you add is private to you until you share it.
                </p>
              </div>
            </section>
          ) : view === 'home' ? (
            <section className="int-main" aria-label="Home">
              <div className="int-hero">
                <h1 className="int-h1">Describe what you want to build</h1>
                <p className="int-sub">
                  Spekin turns the idea into a spec, a design and a coding hand-off. Nothing is approved until you review it.
                </p>
                <div className="int-comp" data-feature="F122">
                  <div className="ta">
                    {INTAKE_COMPOSER.text}
                    <i className="int-caret" />
                  </div>
                  <div className="int-cr">
                    <IntakeIconBtn
                      icon="plus"
                      label="Add reference screenshots"
                      does="Adds screenshots to the idea; they open in the Design stage import once the project exists"
                      feature="F123"
                      onClick={() => recordIntent('F123:add-refs')}
                    />
                    <div className="int-seg" role="group" aria-label="Idea language">
                      <button
                        type="button"
                        aria-pressed={ideaLang === 'id'}
                        data-does="Writes the idea and the spec in Bahasa Indonesia"
                        data-feature="F131"
                        onClick={() => setIdeaLang('id')}
                      >
                        ID
                      </button>
                      <button
                        type="button"
                        aria-pressed={ideaLang === 'en'}
                        data-does="Writes the idea and the spec in English"
                        data-feature="F131"
                        onClick={() => setIdeaLang('en')}
                      >
                        EN
                      </button>
                    </div>
                    <button
                      type="button"
                      className="sp-model"
                      data-does="Opens the model source picker: Hosted, BYOK, Local agent (deferred)"
                      data-feature="F122"
                      onClick={() => recordIntent('F122:model')}
                    >
                      <span className="src">{MODEL.source}</span>
                      {MODEL.name}
                      <Icon name="chev" size={12} />
                    </button>
                    <span className="sp-est">{MODEL.est}</span>
                    <span className="int-cnt">{INTAKE_COMPOSER.len} / 4,000</span>
                    <button
                      type="button"
                      className="sp-send"
                      aria-label="Start"
                      data-does="Creates the project from this idea and starts the first interview question; enabled from 20 characters"
                      data-feature="F122"
                      onClick={() => openProject('meranti-yard')}
                    >
                      <Icon name="up" size={15} stroke={2} />
                    </button>
                  </div>
                </div>
                <div className="int-chips" data-feature="F123">
                  <span className="lb">Start from</span>
                  <button
                    type="button"
                    className="int-chip"
                    aria-pressed={startChip === 'idea'}
                    data-does="Starts from a written idea: Spekin asks short questions, then writes a pitch"
                    data-feature="F123"
                    onClick={() => setStartChip('idea')}
                  >
                    <Icon name="spark" size={14} />
                    An idea
                  </button>
                  <button
                    type="button"
                    className="int-chip"
                    aria-pressed={startChip === 'refs'}
                    data-does="Starts from screenshots: creates the project and opens the Design stage import (S28)"
                    data-feature="F123"
                    onClick={() => setStartChip('refs')}
                  >
                    <Icon name="image" size={14} />
                    Reference screenshots
                  </button>
                  <button
                    type="button"
                    className="int-chip"
                    aria-pressed={startChip === 'spec'}
                    data-does="Starts from a spec you already have: pasted or uploaded, read as revision r1"
                    data-feature="F123"
                    onClick={() => setStartChip('spec')}
                  >
                    <Icon name="doc" size={14} />
                    An existing spec
                  </button>
                </div>
              </div>
              <div className="int-strip" data-feature="F124">
                <div className="int-sh">
                  <b>Recent projects</b>
                  <IntakeBtn
                    label={'View all ' + INTAKE_PROJECTS.length}
                    sm
                    cls="plain"
                    does="Opens All projects"
                    feature="F125"
                    onClick={() => setView('all')}
                  />
                </div>
                <div className="int-grid">
                  {INTAKE_PROJECTS.slice(0, 4).map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onOpen={openProject}
                      onRestore={() => setGoneId(null)}
                      onMenu={(id) => recordIntent('F135:menu:' + id)}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="int-main" aria-label="All projects">
              {isRestore && showRestoreBanner ? (
                <div className="sp-banner warn" role="alert" data-feature="F134">
                  <span className="ib">
                    <Icon name="alert" size={16} />
                  </span>
                  <p>
                    <b>Kenari Fleet was deleted in another session</b> ({INTAKE_DELETED.by}, {INTAKE_DELETED.at}). Restore it to
                    bring back its specs, boards and history.
                  </p>
                  <IntakeBtn
                    label="Restore project"
                    sm
                    cls="ink"
                    does="Restores Kenari Fleet with all revisions; it returns to the list in its last-opened place"
                    feature="F134"
                    onClick={() => void restore(INTAKE_DELETED.id)}
                  />
                  <IntakeBtn
                    label="Dismiss"
                    sm
                    cls="plain"
                    does="Hides this banner; the project stays under Recently deleted"
                    feature="F134"
                    onClick={() => setShowRestoreBanner(false)}
                  />
                </div>
              ) : null}
              {restoreError ? (
                <div className="sp-banner bad" role="alert" data-feature="F134">
                  <p>{restoreError}</p>
                </div>
              ) : null}
              <div className="int-ph">
                <div>
                  <h1>All projects</h1>
                  <p>{INTAKE_PROJECTS.length} projects, newest opened first</p>
                </div>
                <span className="sp-fill" />
                <label className="int-input">
                  <IntakeIcon name="search" size={14} />
                  <input type="text" readOnly aria-label="Filter projects" placeholder="Filter by name or increment" />
                </label>
                <IntakeBtn
                  label="Last opened"
                  icon="sort"
                  does="Changes the order: Last opened, Name or Stage"
                  feature="F127"
                  onClick={() => recordIntent('F127:sort')}
                />
                <div className="sp-seg" role="group" aria-label="Layout">
                  <button
                    type="button"
                    aria-pressed={layout === 'cards'}
                    data-does="Shows projects as cards"
                    data-feature="F125"
                    onClick={() => setLayout('cards')}
                  >
                    <IntakeIcon name="grid" size={14} />
                    Cards
                  </button>
                  <button
                    type="button"
                    aria-pressed={layout === 'list'}
                    data-does="Shows projects as a compact list"
                    data-feature="F125"
                    onClick={() => setLayout('list')}
                  >
                    <IntakeIcon name="list" size={14} />
                    List
                  </button>
                </div>
                <IntakeBtn
                  label="New project"
                  cls="ink"
                  icon="plus"
                  does="Opens the Create project dialog"
                  feature="F130"
                  onClick={() => setOverlay('create')}
                />
              </div>

              <div className="int-tabs" role="tablist" aria-label="Project filter">
                {(
                  [
                    ['Recently opened', INTAKE_PROJECTS.length],
                    ['Mine', 5],
                    ['Shared with me', 2],
                    ['Archived', 1],
                  ] as const
                ).map(([t, n]) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    className="int-tab"
                    aria-selected={activeFilterTab === t}
                    data-does={'Shows ' + t.toLowerCase() + ' projects'}
                    data-feature="F127"
                    onClick={() => setActiveFilterTab(t)}
                  >
                    {t}
                    <span className="n">{n}</span>
                  </button>
                ))}
                <span className="int-leg">
                  Stage marks
                  <i className="dot ok" />
                  ready
                  <i className="dot half" />
                  in progress
                  <i className="dot warn" />
                  needs review
                  <i className="dot bad" />
                  blocked
                  <i className="dot ring" />
                  not started
                </span>
              </div>

              <div className="int-grid" data-feature="F125">
                {INTAKE_PROJECTS.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    gone={isRestore && goneId === p.id}
                    onOpen={openProject}
                    onRestore={() => void restore(p.id)}
                    onMenu={(id) => recordIntent('F135:menu:' + id)}
                  />
                ))}
                <button
                  type="button"
                  className="int-new"
                  data-does="Opens the Create project dialog"
                  data-feature="F130"
                  onClick={() => setOverlay('create')}
                >
                  <IntakeIcon name="plus" size={20} />
                  <b>New project</b>
                  Name it, describe the idea, pick a start
                </button>
              </div>
            </section>
          )}
        </div>

        {overlay !== 'none' ? <div className="int-scrim" onClick={() => setOverlay('none')} /> : null}
        {overlay === 'switch' ? (
          <SwitchPalette
            projects={orderedProjects}
            selectedIndex={palSel}
            renamingIndex={palRenaming}
            renameValue={palRenameVal}
            onSelect={(id) => {
              setOverlay('none');
              openProject(id);
            }}
            onStartRename={(i) => {
              setPalSel(i);
              setPalRenaming(i);
            }}
            onRenameChange={setPalRenameVal}
            onNewProject={() => setOverlay('create')}
            onClose={() => setOverlay('none')}
          />
        ) : null}
        {overlay === 'create' ? (
          <CreateProjectModal
            idea={INTAKE_NEW.idea}
            domain={createDomain}
            uiLang={createUiLang}
            onDomain={setCreateDomain}
            onUiLang={setCreateUiLang}
            onClose={() => setOverlay('none')}
            onCreate={() => {
              setOverlay('none');
              openProject('meranti-yard');
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
