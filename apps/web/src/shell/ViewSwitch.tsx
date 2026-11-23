import { Icon, type IconName } from '../ui/Icon';
import type { ViewMode } from '../state/workspace';

const VIEWS: [ViewMode, IconName][] = [
  ['Canvas', 'grid'],
  ['Preview', 'eye'],
  ['Document', 'doc'],
  ['Compare', 'cols'],
];

// Mirrors kit.mjs views(cur). View mode switcher (F105).
export function ViewSwitch(props: { current: ViewMode; onChange: (mode: ViewMode) => void }) {
  const { current, onChange } = props;
  return (
    <div className="sp-seg" role="group" aria-label="View" data-feature="F105">
      {VIEWS.map(([v, i]) => (
        <button
          key={v}
          type="button"
          aria-pressed={v === current ? 'true' : 'false'}
          data-does={'Shows the selected artifact as ' + v}
          data-feature="F105"
          onClick={() => onChange(v)}
        >
          <Icon name={i} size={14} />
          {v}
        </button>
      ))}
    </div>
  );
}
