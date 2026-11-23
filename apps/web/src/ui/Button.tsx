import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

// Every control is either built (does + feature + onClick) or LATER (disabled, says what it will do).
// The types make a third kind, a button that does nothing, impossible (canvas-to-app rule 9; Clausarium lesson).
type Built = { does: string; feature: string; onClick: () => void; later?: never };
type Later = { later: string; does?: never; feature?: string; onClick?: never };
export type Action = Built | Later;

function actionProps(a: Action) {
  return a.later !== undefined
    ? { 'data-later': a.later, disabled: true, title: 'Later: ' + a.later, ...(a.feature ? { 'data-feature': a.feature } : {}) }
    : { 'data-does': a.does, 'data-feature': a.feature, onClick: a.onClick };
}

export function Btn(props: Action & { label: ReactNode; cls?: 'ghost' | 'ink' | 'plain' | 'danger'; sm?: boolean; icon?: IconName }) {
  const { label, cls = 'ghost', sm, icon } = props;
  const clsName = cls === 'danger' ? 'ghost mod-danger' : cls;
  return (
    <button type="button" className={'sp-btn ' + clsName + (sm ? ' sm' : '')} {...actionProps(props)}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {label}
    </button>
  );
}

export function IconBtn(props: Action & { icon: IconName; label: string; sm?: boolean; pressed?: boolean; badge?: number; size?: number }) {
  const { icon, label, sm, pressed, badge, size = 16 } = props;
  return (
    <button type="button" className={'sp-ibtn' + (sm ? ' sm' : '')} aria-label={label} aria-pressed={pressed || undefined} {...actionProps(props)}>
      <Icon name={icon} size={size} />
      {badge ? <span className="badge">{badge}</span> : null}
    </button>
  );
}
