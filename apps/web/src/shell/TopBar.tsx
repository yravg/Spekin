import type { SampleProject, SampleUsage } from '@spekin/sample';
import { Icon } from '../ui/Icon';
import { IconBtn } from '../ui/Button';

// S35 top bar. Markup mirrors docs/design/spekin-canvas/kit.mjs top(): same classes, labels, order and data-feature ids.
// Board-only marks (isnew, newtag) are left out; they are canvas language, not app UI.
export function TopBar(props: {
  project: SampleProject;
  usage: SampleUsage;
  save: { tone: 'ok' | 'warn' | 'bad'; text: string };
  busy?: string;
  onOpenSwitcher: () => void;
  onOpenIncrement: () => void;
  onOpenSpec: () => void;
  onOpenUsage: () => void;
  onOpenInbox: () => void;
  lang: 'en' | 'id';
  onLang: (l: 'en' | 'id') => void;
}) {
  const { project, usage, save, busy } = props;
  const pct = Math.round((usage.used / usage.cap) * 100);
  const sev = pct >= 90 ? ' crit' : pct >= 70 ? ' warn' : '';
  return (
    <header className="sp-top">
      <span className="sp-mark" aria-hidden="true">S</span>
      <div className="ap-grp" data-feature="F103">
        <button type="button" className="sp-proj" data-does="Opens the quick project switcher (Cmd/Ctrl+K), most recent first; switching restores only that project's saved state" data-feature="F103" onClick={props.onOpenSwitcher}>
          <b>{project.name}</b>
          <span>/</span>
          <span>{project.product}</span>
          <kbd className="sp-kbd">⌘K</kbd>
        </button>
        <span className="sp-sep" />
        <button type="button" className="sp-chip" data-does="Opens the increment picker: which feature increment the stages describe" data-feature="F103" onClick={props.onOpenIncrement}>
          <span className="k">Increment</span>
          {project.increment}
          <Icon name="chev" size={12} />
        </button>
        <button type="button" className="sp-chip" data-does="Opens the accepted spec revision and its history (S07); never edits it" data-feature="F103" onClick={props.onOpenSpec}>
          <Icon name="lock" size={12} />
          <span className="k">Spec</span>
          <span className="r">{project.spec}</span>accepted
        </button>
      </div>
      <span className="sp-fill" />
      {busy ? (
        <button type="button" className="sp-busy" data-does="Opens the job list: what is designing, what waits and why; a job never runs without a reserved maximum" data-feature="F109" onClick={props.onOpenInbox}>
          <span className="pulse" aria-hidden="true" />
          {busy}
        </button>
      ) : null}
      <span className={'sp-save' + (save.tone === 'bad' ? ' conflict' : '')} data-feature="F112" role="status">
        <span className={'dot ' + save.tone} />
        {save.text}
      </span>
      <button type="button" className={'sp-meter' + sev} data-does="Opens S36 usage: estimate, reservations, actuals, cap and remaining credits; the bar turns amber at 70% and red at 90% of the cap" data-feature="F111" onClick={props.onOpenUsage}>
        {usage.source}
        <i>
          <u style={{ width: pct + '%' }} />
        </i>
        <b>{usage.used.toLocaleString('en-US')}</b>of {usage.cap.toLocaleString('en-US')} cr
      </button>
      <span style={{ position: 'relative', display: 'inline-flex' }} data-feature="F109">
        <IconBtn icon="inbox" label="Agent inbox: 2 jobs need approval" does="Opens the Agent Inbox: running jobs and approvals, beside the work, never over it" feature="F109" badge={2} onClick={props.onOpenInbox} />
      </span>
      <div className="sp-lang" role="group" aria-label="Language">
        <button type="button" aria-pressed={props.lang === 'en'} data-does="Shows the UI in English" data-feature="F115" onClick={() => props.onLang('en')}>EN</button>
        <button type="button" aria-pressed={props.lang === 'id'} data-does="Shows the UI in Bahasa Indonesia" data-feature="F115" onClick={() => props.onLang('id')}>ID</button>
      </div>
      <span className="sp-av" aria-label={project.user}>{project.initials}</span>
    </header>
  );
}
