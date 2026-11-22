import { SKL_SOURCES, SKL_STAGES } from '@spekin/sample';
import type {
  SampleSkillDetail,
  SampleSkillDiffRow,
  SampleSkillEdit,
  SampleSkillGithub,
  SampleSkillGlossRow,
  SampleSkillRow,
  SampleSkillSource,
  SampleSkillUpdate,
} from '@spekin/sample';
import { Icon } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';

const SRC_MAP: Record<string, SampleSkillSource> = Object.fromEntries(SKL_SOURCES.map((s) => [s.id, s]));

const STARTER_TEMPLATES: [string, string][] = [
  ['Grill the idea', 'Planning'],
  ['Write the spec in EARS', 'Specification'],
  ['Split into tickets', 'Specification'],
  ['Test first', 'Build'],
];

const EDIT_STAGES = ['Planning', 'Specification', 'Design', 'Testing'];

const GH_POLICIES: [string, string][] = [
  [
    'Auto-update',
    'Recommended. Checks daily. Applies an update when the licence is unchanged and every check passes. Anything else waits for you. Roll back any time.',
  ],
  ['Notify me', 'Shows each new version; you apply it.'],
  ['Pin this version', 'Stays on 9b1f07e until you change it.'],
];

export type SlashPickerAction =
  | { type: 'move'; index: number }
  | { type: 'pick'; index: number }
  | { type: 'close' }
  | null;

// Keyboard-first / skill list navigation (IMP-23): arrows move, Enter picks, Escape closes and keeps text.
export function stepSlashPicker(opts: { key: string; index: number; count: number }): SlashPickerAction {
  const { key, index, count } = opts;
  if (count <= 0) return key === 'Escape' ? { type: 'close' } : null;
  if (key === 'ArrowDown') return { type: 'move', index: (index + 1) % count };
  if (key === 'ArrowUp') return { type: 'move', index: (index - 1 + count) % count };
  if (key === 'Enter') return { type: 'pick', index };
  if (key === 'Escape') return { type: 'close' };
  return null;
}

function SkillSwitch(props: { on: boolean; label: string; onToggle: () => void }) {
  const { on, label, onToggle } = props;
  return (
    <button
      type="button"
      className="skl-sw"
      role="switch"
      aria-checked={on}
      aria-label={label}
      data-does={
        on
          ? 'Turns this skill off for this project; runs already made keep their proposals'
          : 'Turns this skill on for this project; it then shows in the / list of its stages'
      }
      data-feature="F364"
      onClick={onToggle}
    >
      <i />
    </button>
  );
}

function SourceLine({ srcId }: { srcId: string }) {
  const s = SRC_MAP[srcId];
  if (!s) return null;
  return (
    <span className={'skl-src ' + s.kind}>
      <Icon name={s.kind === 'github' ? 'link' : s.kind === 'mine' ? 'pointer' : 'spark'} size={12} />
      {s.name}
    </span>
  );
}

function UpdateTag({ label }: { label: string }) {
  return (
    <span className={'skl-upd' + (label === 'Update ready' ? ' ready' : '')}>
      <Icon name={label === 'Update ready' ? 'down' : label === 'Your copy' ? 'pointer' : 'history'} size={12} />
      {label}
    </span>
  );
}

// Mirrors boards-skills.mjs libMain() (S40:library).
export function SkillsLibraryView(props: {
  skills: SampleSkillRow[];
  stageFilter: string;
  sourceFilter: string | null;
  statusFilter: 'on' | 'waiting' | null;
  query: string;
  enabledMap: Record<string, boolean>;
  onStageFilter: (stage: string) => void;
  onSourceFilter: (srcId: string | null) => void;
  onStatusFilter: (status: 'on' | 'waiting' | null) => void;
  onQueryChange: (q: string) => void;
  onToggleSkill: (id: string) => void;
  onOpenSkill: (id: string) => void;
  onOpenUpdates: () => void;
  onOpenGithub: () => void;
  onNewSkill: () => void;
}) {
  const {
    skills,
    stageFilter,
    sourceFilter,
    statusFilter,
    query,
    enabledMap,
    onStageFilter,
    onSourceFilter,
    onStatusFilter,
    onQueryChange,
    onToggleSkill,
    onOpenSkill,
    onOpenUpdates,
    onOpenGithub,
    onNewSkill,
  } = props;

  const onCount = skills.filter((s) => enabledMap[s[0]] ?? s[7]).length;
  const waitingCount = skills.filter((s) => s[6] === 'Update ready').length;

  const q = query.trim().toLowerCase();
  const filtered = skills.filter((s) => {
    const [id, title, line, stages, src, , upd] = s;
    const isOn = enabledMap[id] ?? s[7];
    if (stageFilter !== 'All stages' && !stages.includes(stageFilter)) return false;
    if (sourceFilter && src !== sourceFilter) return false;
    if (statusFilter === 'on' && !isOn) return false;
    if (statusFilter === 'waiting' && upd !== 'Update ready') return false;
    if (q && !(title.toLowerCase().includes(q) || line.toLowerCase().includes(q) || stages.some((x) => x.toLowerCase().includes(q)))) {
      return false;
    }
    return true;
  });

  return (
    <div className="skl-page">
      <div className="skl-ph">
        <div className="skl-tt">
          <h2>Skills</h2>
          <span>Free for everyone · 9 in this workspace · runs make proposals, never direct changes</span>
        </div>
        <span className="sp-fill" />
        <label className="skl-search">
          <Icon name="search" size={14} />
          <input
            type="search"
            placeholder="Search skills"
            aria-label="Search skills"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            data-does="Filters skills by name, words in the description and stage"
            data-feature="F361"
          />
        </label>
        <Btn
          label="Updates"
          icon="history"
          does="Opens the update history: what changed, what was applied, what waits, with roll back"
          feature="F373"
          onClick={onOpenUpdates}
        />
        <Btn
          label="Add from GitHub"
          icon="link"
          does="Opens the GitHub import: paste a repo link, see its skills and licence, pick, set how it updates"
          feature="F370"
          onClick={onOpenGithub}
        />
        <Btn
          label="New skill"
          cls="ink"
          icon="plus"
          does="Starts a new skill from a blank template or a copy of one you pick"
          feature="F367"
          onClick={onNewSkill}
        />
      </div>

      <div className="skl-body">
        <nav className="skl-rail" aria-label="Filter skills">
          <span className="skl-rl">Stage</span>
          {SKL_STAGES.map(([n, c]) => (
            <button
              key={n}
              type="button"
              className="skl-fi"
              aria-pressed={stageFilter === n && !sourceFilter && !statusFilter ? 'true' : undefined}
              data-does={'Shows only skills for ' + (n === 'All stages' ? 'every stage' : n)}
              data-feature="F361"
              onClick={() => {
                onSourceFilter(null);
                onStatusFilter(null);
                onStageFilter(n);
              }}
            >
              <span>{n}</span>
              <b>{c}</b>
            </button>
          ))}
          <span className="skl-rl">Source</span>
          {SKL_SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="skl-fi"
              aria-pressed={sourceFilter === s.id ? 'true' : undefined}
              data-does={'Shows only skills from ' + s.name}
              data-feature="F361"
              onClick={() => {
                onStageFilter('All stages');
                onStatusFilter(null);
                onSourceFilter(sourceFilter === s.id ? null : s.id);
              }}
            >
              <span>{s.name}</span>
              <b>{s.count}</b>
            </button>
          ))}
          <span className="skl-rl">Status</span>
          <button
            type="button"
            className="skl-fi"
            aria-pressed={statusFilter === 'on' ? 'true' : undefined}
            data-does="Shows only skills switched on in this project"
            data-feature="F364"
            onClick={() => onStatusFilter(statusFilter === 'on' ? null : 'on')}
          >
            <span>On in this project</span>
            <b>{onCount}</b>
          </button>
          <button
            type="button"
            className="skl-fi"
            aria-pressed={statusFilter === 'waiting' ? 'true' : undefined}
            data-does="Shows updates that wait for your review"
            data-feature="F372"
            onClick={() => onStatusFilter(statusFilter === 'waiting' ? null : 'waiting')}
          >
            <span>Updates waiting</span>
            <b>{waitingCount}</b>
          </button>
        </nav>

        <div className="skl-main">
          <div className="skl-band" data-feature="F362">
            <div className="skl-bt">
              <b>Start here: free templates</b>
              <span>Every skill is free to use, copy and change. Copies are yours; the original keeps updating.</span>
            </div>
            <div className="skl-tpl">
              {STARTER_TEMPLATES.map(([n, st]) => (
                <button
                  key={n}
                  type="button"
                  data-does={'Opens ' + n + ' with a Use and a Copy button'}
                  data-feature="F362"
                  onClick={() => onOpenSkill('grill')}
                >
                  <b>{n}</b>
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="skl-grid" data-feature="F363">
            {filtered.map((s) => {
              const [id, title, line, stages, src, lic, u, initOn, uses] = s;
              const on = enabledMap[id] ?? initOn;
              return (
                <article key={id} className="skl-card" aria-label={title}>
                  <div className="skl-ch">
                    <SourceLine srcId={src} />
                    <SkillSwitch
                      on={on}
                      label={(on ? 'Turn off ' : 'Turn on ') + title + ' in this project'}
                      onToggle={() => onToggleSkill(id)}
                    />
                  </div>
                  <button
                    type="button"
                    className="skl-cn"
                    data-does="Opens the skill: what it does, what it reads and proposes, its source, licence and updates"
                    data-feature="F365"
                    onClick={() => onOpenSkill(id)}
                  >
                    <b>{title}</b>
                    <span>{line}</span>
                  </button>
                  <div className="skl-st">
                    {stages.map((x) => (
                      <span key={x}>{x}</span>
                    ))}
                  </div>
                  <div className="skl-cf">
                    <span className="skl-lic">{lic}</span>
                    <UpdateTag label={u} />
                    <span className="skl-uses">{uses} runs</span>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="skl-fine">
            <Icon name="lock" size={12} />
            Each card shows its source and licence. Skills from mattpocock/skills are MIT, Copyright (c) 2026 Matt Pocock; adapted copies say so. Spekin&apos;s own templates are Apache-2.0.
          </p>
        </div>
      </div>
    </div>
  );
}

// Mirrors boards-skills.mjs detailMain (S40:detail).
export function SkillDetailView(props: {
  detail: SampleSkillDetail;
  policy: 'Auto' | 'Notify me' | 'Pinned';
  enabled: boolean;
  onBack: () => void;
  onCopyEdit: () => void;
  onUseInChat: () => void;
  onOpenGithub: () => void;
  onPolicyChange: (p: 'Auto' | 'Notify me' | 'Pinned') => void;
  onToggleEnabled: () => void;
}) {
  const { detail, policy, enabled, onBack, onCopyEdit, onUseInChat, onOpenGithub, onPolicyChange, onToggleEnabled } = props;
  const ghSrc = SRC_MAP['gh-mp'];
  return (
    <div className="skl-page">
      <div className="skl-ph">
        <div className="skl-tt">
          <h2>
            <button
              type="button"
              className="skl-back"
              data-does="Goes back to the skills list with your filters kept"
              data-feature="F365"
              onClick={onBack}
            >
              <Icon name="chevR" size={12} />
              Skills
            </button>{' '}
            {detail.title}
          </h2>
          <span>
            {detail.version} · {ghSrc?.name ?? ''}
          </span>
        </div>
        <span className="sp-fill" />
        <span className="skl-r" data-feature="F376">
          <Btn label="Share" icon="share" later="Share with other workspaces or publish to the community library" />
        </span>
        <Btn
          label="Copy and edit"
          icon="plus"
          does="Makes your own copy (version 1) and opens it in the editor; the original keeps updating"
          feature="F367"
          onClick={onCopyEdit}
        />
        <Btn
          label="Use in chat"
          cls="ink"
          icon="spark"
          does="Puts /grill in the composer with the current context list; nothing runs until Send"
          feature="F374"
          onClick={onUseInChat}
        />
      </div>

      <div className="skl-dbody">
        <div className="skl-doc" data-feature="F365">
          <span className="skl-rl">What it does</span>
          <ol>
            {detail.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <span className="skl-rl">Adapted for Spekin</span>
          <p>{detail.adapted}</p>
          <div className="skl-kv">
            <span>Reads</span>
            <b>{detail.reads.join(' · ')}</b>
            <span>Proposes</span>
            <b>{detail.proposes.join(' · ')}</b>
            <span>Tools</span>
            <b>{detail.tools}</b>
            <span>How to use</span>
            <b>{detail.invoke}</b>
          </div>
        </div>

        <aside className="skl-side">
          <div className="skl-box" data-feature="F366">
            <span className="skl-rl">Source and licence</span>
            <p>
              <b>github.com/mattpocock/skills</b>
              <br />
              <code>{detail.path}</code>
            </p>
            <p>
              MIT · <span className="skl-mono">Copyright (c) 2026 Matt Pocock</span>. The notice travels with every copy and every export.
            </p>
            <Btn
              label="Open on GitHub"
              sm
              icon="link"
              does="Opens the source folder on GitHub at the pinned commit, in a new tab"
              feature="F366"
              onClick={onOpenGithub}
            />
          </div>

          <div className="skl-box" data-feature="F371">
            <span className="skl-rl">Updates</span>
            <div className="skl-seg" role="radiogroup" aria-label="How this source updates">
              {(['Auto', 'Notify me', 'Pinned'] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={policy === n}
                  data-does={
                    n === 'Auto'
                      ? 'Applies updates that pass the safety checks; anything else waits for you'
                      : n === 'Notify me'
                        ? 'Shows new versions; you apply them'
                        : 'Stays on this commit until you change it'
                  }
                  data-feature="F371"
                  onClick={() => onPolicyChange(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="skl-small">Checked daily at 06:00. Last update today, 2 applied, 1 waiting.</p>
          </div>

          <div className="skl-box">
            <span className="skl-rl">Used in</span>
            {detail.used.map(([p, w]) => (
              <div key={p} className="skl-used">
                <b>{p}</b>
                <span>{w}</span>
              </div>
            ))}
            <div className="skl-ch2">
              <SkillSwitch on={enabled} label="Turn off Grill the idea in this project" onToggle={onToggleEnabled} />
              <span>On in Meranti Yard</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Mirrors boards-skills.mjs editMain (S40:edit).
export function SkillEditView(props: {
  edit: SampleSkillEdit;
  title: string;
  desc: string;
  stages: string[];
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onToggleStage: (s: string) => void;
  onDiscard: () => void;
  onSave: () => void;
  onTryAgain: () => void;
}) {
  const { edit, title, desc, stages, onTitleChange, onDescChange, onToggleStage, onDiscard, onSave, onTryAgain } = props;
  return (
    <div className="skl-page">
      <div className="skl-ph">
        <div className="skl-tt">
          <h2>{title}</h2>
          <span>Your copy of {edit.from} · draft, not saved</span>
        </div>
        <span className="sp-fill" />
        <Btn
          label="Discard"
          does="Drops the unsaved changes; the saved version stays"
          feature="F368"
          onClick={onDiscard}
        />
        <Btn
          label="Save as version 2"
          cls="ink"
          icon="check"
          does="Saves version 2; projects using version 1 keep it until you switch them"
          feature="F368"
          onClick={onSave}
        />
      </div>

      <div className="skl-dbody">
        <div className="skl-form" data-feature="F368">
          <label className="skl-f">
            <span>Name</span>
            <input
              value={title}
              aria-label="Skill name"
              onChange={(e) => onTitleChange(e.target.value)}
              data-does="Sets the skill name shown in the list and the / menu"
              data-feature="F368"
            />
          </label>
          <label className="skl-f">
            <span>When to use it</span>
            <input
              value={desc}
              aria-label="Description"
              onChange={(e) => onDescChange(e.target.value)}
              data-does="Sets the one line that tells people and the model when this skill fits"
              data-feature="F368"
            />
          </label>
          <div className="skl-f">
            <span>Stages</span>
            <div className="skl-chips">
              {EDIT_STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={stages.includes(s)}
                  data-does={'Adds or removes ' + s + ' from where this skill is offered'}
                  data-feature="F368"
                  onClick={() => onToggleStage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="skl-f">
            <span>Instructions</span>
            <div className="skl-ed" role="textbox" aria-multiline="true" aria-label="Instructions">
              {edit.body.map((l, i) => (
                <div key={i}>
                  <i>{i + 1}</i>
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="skl-side">
          <div className="skl-box" data-feature="F368">
            <span className="skl-rl">Checks</span>
            {edit.checks.map(([k, t]) => (
              <div key={t} className={'skl-ck ' + k}>
                <Icon name={k === 'ok' ? 'check' : 'alert'} size={13} />
                <span>{t}</span>
              </div>
            ))}
          </div>

          <div className="skl-box" data-feature="F369">
            <span className="skl-rl">Try on the sample</span>
            <p className="skl-small">Runs on Meranti Yard&apos;s context. Results are shown here only; nothing is saved or proposed.</p>
            {edit.dry.map(([k, t, id, m]) => (
              <div key={t} className="skl-dry">
                <span className={'pill ' + (k === 'ADR' ? 'acc' : 'mute')}>{k}</span>
                <b>{t}</b>
                {id ? <em>{id}</em> : null}
                <span>{m}</span>
              </div>
            ))}
            <Btn
              label="Try again"
              sm
              icon="spark"
              does="Runs the draft once more on the sample context; about 3 cr, shown before it runs"
              feature="F369"
              onClick={onTryAgain}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

// Mirrors boards-skills.mjs ghDrawer (S40:github).
export function SkillGithubDrawer(props: {
  gh: SampleSkillGithub;
  url: string;
  selected: Record<string, boolean>;
  policy: string;
  onUrlChange: (v: string) => void;
  onScan: () => void;
  onTogglePick: (name: string) => void;
  onPolicyChange: (p: string) => void;
  onClose: () => void;
  onAdd: () => void;
}) {
  const { gh, url, selected, policy, onUrlChange, onScan, onTogglePick, onPolicyChange, onClose, onAdd } = props;
  const pickedCount = Object.values(selected).filter(Boolean).length;
  return (
    <>
      <div className="skl-scrim" onClick={onClose} />
      <div className="skl-dlg" role="dialog" aria-label="Add skills from GitHub" data-feature="F370">
        <div className="skl-dh">
          <b>Add skills from GitHub</b>
          <span className="sp-fill" />
          <IconBtn icon="x" label="Close" does="Closes the import; nothing is added" sm feature="F370" onClick={onClose} />
        </div>
        <label className="skl-url">
          <Icon name="link" size={14} />
          <input
            value={url}
            aria-label="GitHub repository link"
            onChange={(e) => onUrlChange(e.target.value)}
            data-does="Takes a public GitHub repository link; Spekin reads it, it never writes to it"
            data-feature="F370"
          />
          <Btn
            label="Scan"
            sm
            does="Reads the repository: finds SKILL.md folders, the licence and any scripts; runs nothing"
            feature="F370"
            onClick={onScan}
          />
        </label>
        <div className="skl-found">
          <b>{gh.found} skills found</b>
          <span className="pill ok">{gh.licence}</span>
          <span>
            {gh.file} · {gh.notice}
          </span>
        </div>
        <div className="skl-pick2">
          {gh.groups.map(([g, l]) => (
            <div key={g} className="skl-grp">
              <span className="skl-rl">{g}</span>
              {l.map(([n]) => (
                <label key={n} className="skl-cb">
                  <input
                    type="checkbox"
                    checked={!!selected[n]}
                    aria-label={n}
                    onChange={() => onTogglePick(n)}
                    data-does={'Adds or leaves out ' + n}
                    data-feature="F370"
                  />
                  <span>{n}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
        <div className="skl-pol" data-feature="F371">
          <span className="skl-rl">When the repository changes</span>
          {GH_POLICIES.map(([n, t]) => (
            <label key={n} className="skl-rad">
              <input
                type="radio"
                name="pol"
                checked={policy === n}
                aria-label={n}
                onChange={() => onPolicyChange(n)}
                data-does={t}
                data-feature="F371"
              />
              <span>
                <b>{n}</b>
                {t}
              </span>
            </label>
          ))}
        </div>
        <div className="skl-checks" data-feature="F372">
          {gh.checks.map(([k, t]) => (
            <div key={t} className={'skl-ck ' + k}>
              <Icon name={k === 'ok' ? 'check' : 'alert'} size={13} />
              <span>{t}</span>
            </div>
          ))}
        </div>
        <div className="skl-df">
          <Btn label="Cancel" does="Closes the import; nothing is added" feature="F370" onClick={onClose} />
          <Btn
            label={'Add ' + pickedCount + ' skills'}
            cls="ink"
            icon="plus"
            does="Adds the 6 chosen skills at commit 9b1f07e with their licence notice; they start switched off in this project"
            feature="F370"
            onClick={onAdd}
          />
        </div>
      </div>
    </>
  );
}

// Mirrors boards-skills.mjs updMain (S40:updates).
export function SkillUpdatesView(props: {
  updates: SampleSkillUpdate[];
  diff: SampleSkillDiffRow[];
  onBack: () => void;
  onCheckNow: () => void;
  onRollback: (from: string) => void;
  onKeepCurrent: () => void;
  onApplyWithoutTool: () => void;
  onApply: () => void;
}) {
  const { updates, diff, onBack, onCheckNow, onRollback, onKeepCurrent, onApplyWithoutTool, onApply } = props;
  return (
    <div className="skl-page">
      <div className="skl-ph">
        <div className="skl-tt">
          <h2>
            <button
              type="button"
              className="skl-back"
              data-does="Goes back to the skills list"
              data-feature="F373"
              onClick={onBack}
            >
              <Icon name="chevR" size={12} />
              Skills
            </button>{' '}
            Updates
          </h2>
          <span>Every change to a skill, newest first</span>
        </div>
        <span className="sp-fill" />
        <Btn
          label="Check now"
          icon="history"
          does="Checks every source for new versions now instead of at 06:00"
          feature="F372"
          onClick={onCheckNow}
        />
      </div>

      <div className="skl-dbody">
        <div className="skl-hist" data-feature="F373">
          {updates.map((u, i) => (
            <div key={u.when + u.src} className={'skl-ev' + (i === 0 ? ' open' : '')}>
              <div className="skl-evh">
                <b>{u.src}</b>
                <span className="skl-mono">
                  {u.from} → {u.to}
                </span>
                <span className="pill ok">{u.applied} applied</span>
                {u.held ? <span className="pill warn">{u.held} waiting</span> : null}
                <span className="sp-fill" />
                <span className="skl-when">{u.when}</span>
                <Btn
                  label="Roll back"
                  sm
                  icon="undo"
                  does={'Returns this source to ' + u.from + '; projects keep their accepted proposals'}
                  feature="F373"
                  onClick={() => onRollback(u.from)}
                />
              </div>
              {u.rows.map(([k, n, w, s]) => (
                <div key={n} className="skl-evr">
                  <span className={'skl-ck ' + k}>
                    <Icon name={k === 'ok' ? 'check' : 'alert'} size={13} />
                  </span>
                  <b>{n}</b>
                  <span>{w}</span>
                  <span className={'pill ' + (k === 'ok' ? 'mute' : 'warn')}>{s}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <aside className="skl-side wide">
          <div className="skl-box" data-feature="F372">
            <span className="skl-rl">Waiting for you: Split into tickets</span>
            <p className="skl-small">Held because the new version asks for a tool it did not have. Read the change, then choose.</p>
            <div className="skl-diff" aria-label="Changes to SKILL.md">
              {diff.map(([k, l], idx) => (
                <div key={idx} className={k === '+' ? 'add' : k === '-' ? 'del' : undefined}>
                  <i>{k}</i>
                  {l}
                </div>
              ))}
            </div>
            <div className="skl-df">
              <Btn
                label="Keep current"
                does="Stays on the current version; the update stays listed"
                feature="F372"
                onClick={onKeepCurrent}
              />
              <Btn
                label="Apply without the tool"
                does="Applies the wording change and leaves the new tool out"
                feature="F372"
                onClick={onApplyWithoutTool}
              />
              <Btn
                label="Apply"
                cls="ink"
                does="Applies the update including the new tool request; the tool still asks before each use"
                feature="F372"
                onClick={onApply}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Mirrors boards-skills.mjs glossMain (S40:use).
export function SkillGlossaryView(props: { rows: SampleSkillGlossRow[]; onOpenReview: () => void }) {
  const { rows, onOpenReview } = props;
  return (
    <div className="skl-page">
      <div className="skl-ph">
        <div className="skl-tt">
          <h2>GLOSSARY.md</h2>
          <span>r5 accepted · 2 proposals waiting for review</span>
        </div>
        <span className="sp-fill" />
        <Btn
          label="Open review"
          icon="diff"
          does="Opens S33 with the waiting proposals for this document"
          feature="F375"
          onClick={onOpenReview}
        />
      </div>
      <div className="skl-gl">
        <div className="skl-glh">
          <span>Term</span>
          <span>Bahasa</span>
          <span>Meaning</span>
          <span>Status</span>
        </div>
        {rows.map(([t, b, m, s]) => (
          <div key={t} className={'skl-glr' + (s === 'proposed' ? ' prop' : '')}>
            <b>{t}</b>
            <span>{b}</span>
            <span>{m}</span>
            <span className={'pill ' + (s === 'proposed' ? 'warn' : 'ok')}>
              {s === 'proposed' ? 'Proposed · not applied' : 'Accepted r5'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mirrors boards-skills.mjs picker (S40:use, F374).
export function SkillSlashMenu(props: {
  skills: SampleSkillRow[];
  activeIndex: number;
  onPick: (skill: SampleSkillRow) => void;
  onBrowseAll: () => void;
}) {
  const { skills, activeIndex, onPick, onBrowseAll } = props;
  return (
    <div className="skl-menu" role="listbox" aria-label="Skills for Specification" data-feature="F374">
      <div className="skl-mh">
        Skills for Specification<span>↑↓ to move · Enter to pick</span>
      </div>
      {skills.map((s, i) => {
        const [id, title] = s;
        return (
          <button
            key={id}
            type="button"
            role="option"
            aria-selected={i === activeIndex}
            data-does={'Picks ' + title + ': shows what it reads and an estimate before Send'}
            data-feature="F374"
            onClick={() => onPick(s)}
          >
            <b>/{id}</b>
            <span>{title}</span>
          </button>
        );
      })}
      <div className="skl-mf">
        <Btn label="Browse all skills" sm does="Opens the Skills tab" feature="F374" onClick={onBrowseAll} />
      </div>
    </div>
  );
}
