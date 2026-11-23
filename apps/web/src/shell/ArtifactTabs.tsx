import { useState, type ReactNode } from 'react';
import { Icon, type IconName } from '../ui/Icon';
import { IconBtn } from '../ui/Button';

export interface ArtifactTabItem {
  icon: IconName;
  name: string;
  dirty?: boolean;
}

export interface ArtifactOpenItem {
  icon: IconName;
  name: string;
  onSelect: () => void;
}

// Mirrors kit.mjs tabs(list, right). Artifact tabs separate from stages (F104).
export function ArtifactTabs(props: {
  tabs: ArtifactTabItem[];
  activeTab: string;
  onSelect: (name: string) => void;
  onClose: (name: string) => void;
  onOpenArtifact: () => void;
  right: ReactNode;
  openItems?: ArtifactOpenItem[];
}) {
  const { tabs, activeTab, onSelect, onClose, onOpenArtifact, right, openItems } = props;
  const [open, setOpen] = useState(false);
  return (
    <div className="sp-tabs" role="tablist" aria-label="Open artifacts" data-feature="F104">
      {tabs.map(({ icon, name, dirty }) => (
        <button
          key={name}
          type="button"
          role="tab"
          className="sp-tab"
          aria-selected={name === activeTab ? 'true' : 'false'}
          data-does={'Shows ' + name + ' in the work area; tabs are artifacts, not stages'}
          data-feature="F104"
          onClick={() => onSelect(name)}
        >
          <Icon name={icon} size={14} />
          {name}
          {dirty ? <span className="dot acc" title="Unsaved draft" /> : null}
          <span
            className="x"
            onClick={(e) => {
              e.stopPropagation();
              onClose(name);
            }}
          >
            <Icon name="x" size={11} />
          </span>
        </button>
      ))}
      <span
        className="ap-open-wrap"
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
      >
        <IconBtn
          icon="plus"
          label="Open an artifact"
          does="Opens another artifact of this project in a new tab"
          sm
          feature="F104"
          onClick={() => (openItems?.length ? setOpen((v) => !v) : onOpenArtifact())}
        />
        {openItems?.length && open ? (
          <div className="ap-menu" role="menu" aria-label="Artifacts">
            {openItems.map((item) => (
              <button
                key={item.name}
                type="button"
                role="menuitem"
                className="ap-menu-it"
                data-does={'Shows ' + item.name + ' in the work area'}
                data-feature="F104"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                <Icon name={item.icon} size={14} />
                {item.name}
              </button>
            ))}
          </div>
        ) : null}
      </span>
      <span className="sp-fill" />
      {right}
    </div>
  );
}
