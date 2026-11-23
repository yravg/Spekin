import type { SampleStage, StageId } from '@spekin/sample';
import { Btn } from '../ui/Button';

// S35 stage header (F101, F102). Mirrors kit.mjs stagebar(). The current stage is shown by position, weight and underline
// (aria-current), not by colour alone (R-WF-6). A click switches the work area in place, never approves (R-WF-2).
export function StageBar(props: { stages: SampleStage[]; current: StageId; onSwitch: (id: StageId) => void; onReadiness: () => void }) {
  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (idx + (e.key === 'ArrowRight' ? 1 : -1) + props.stages.length) % props.stages.length;
    const nav = e.currentTarget.closest('ol');
    const target = nav?.querySelectorAll<HTMLButtonElement>('button.sp-stage')[next];
    target?.focus();
  }

  return (
    <nav className="sp-stagebar" aria-label="Workflow stages">
      <ol className="sp-stl" data-feature="F101">
        {props.stages.map((s, idx) => (
          <li key={s.id} style={{ display: 'contents' }}>
            <button
              type="button"
              className="sp-stage"
              aria-current={s.id === props.current ? 'page' : undefined}
              data-stage={s.id}
              data-does={'Switches the main workspace to ' + s.name + " in place, no reload; restores that stage's tabs, viewport, selection and drafts"}
              data-feature="F102"
              onClick={() => props.onSwitch(s.id)}
              onKeyDown={(e) => onKeyDown(e, idx)}
            >
              <span className="nm">
                <i>{s.n}</i>
                {s.name}
              </span>
              <span className="ss">
                <span className={'dot ' + s.st} />
                {s.text}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <Btn label="Readiness" icon="flag" does="Opens the stage inspector: required artifacts, blockers, evidence and next proposed action for the current stage" feature="F101" onClick={props.onReadiness} />
    </nav>
  );
}
