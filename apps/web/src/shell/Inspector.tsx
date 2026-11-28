import type { ReactNode } from 'react';
import type { PillTuple } from '../data/source';
import { IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';

// Mirrors kit.mjs row(id, name, sub, p).
export function InspectorRow(props: { id: string; name: string; sub: string; pill: PillTuple; onClick?: () => void }) {
  const { id, name, sub, pill, onClick } = props;
  return (
    <div className="sp-row" onClick={onClick}>
      <span className="id">{id}</span>
      <span className="nm">
        {name}
        <small>{sub}</small>
      </span>
      <Pill tone={pill[0]} label={pill[1]} />
    </div>
  );
}

// Mirrors kit.mjs insp({ title, pillv, sub, tabsv, body }). Right inspector panel (F108).
export function Inspector(props: {
  title: string;
  pill: PillTuple;
  sub: string;
  tabs: string[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onMore: () => void;
  children: ReactNode;
}) {
  const { title, pill, sub, tabs, activeTab, onSelectTab, onMore, children } = props;
  return (
    <aside className="sp-insp" aria-label="Inspector" data-feature="F108">
      <div className="sp-ih">
        <div className="a">
          <b>{title}</b>
          <Pill tone={pill[0]} label={pill[1]} />
          <span className="sp-fill" />
          <IconBtn
            icon="more"
            label="More"
            does="Opens frame actions: duplicate, compare, hand off"
            sm
            feature="F108"
            onClick={onMore}
          />
        </div>
        <div className="s">{sub}</div>
      </div>
      <div className="sp-itabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={t === activeTab ? 'true' : 'false'}
            data-does={'Shows the ' + t + ' of the selection'}
            data-feature="F108"
            onClick={() => onSelectTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="sp-ib">{children}</div>
    </aside>
  );
}
