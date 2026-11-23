import type { ContextItem, ContextKind } from '@spekin/sample';
import { Icon, type IconName } from '../ui/Icon';

const CI: Record<ContextKind, IconName> = {
  frame: 'frame',
  doc: 'doc',
  req: 'req',
  image: 'image',
  server: 'server',
  db: 'db',
};

// Mirrors kit.mjs ctx(items, foot). Context basket for the next run (F106).
export function ContextBasket(props: {
  items: ContextItem[];
  foot: string;
  onRemove: (name: string) => void;
  onAdd: () => void;
}) {
  const { items, foot, onRemove, onAdd } = props;
  return (
    <div className="sp-ctx" data-feature="F106">
      <div className="t">
        Context for the next run<span>{items.length} items</span>
      </div>
      <div className="sp-cc">
        {items.map(([k, n, r]) => (
          <span key={n} className="sp-cchip">
            <Icon name={CI[k] ?? 'doc'} size={12} />
            {n}
            <span className="r">{r}</span>
            <button
              type="button"
              aria-label={'Remove ' + n + ' from context'}
              data-does={'Removes ' + n + " from the next run's context"}
              data-feature="F106"
              onClick={() => onRemove(n)}
            >
              <Icon name="x" size={11} />
            </button>
          </span>
        ))}
        <button
          type="button"
          className="sp-cchip add"
          data-does="Adds a frame, artifact, requirement or reference to the context list"
          data-feature="F106"
          onClick={onAdd}
        >
          <Icon name="plus" size={11} />
          Add
        </button>
      </div>
      <div className="f">{foot}</div>
    </div>
  );
}
