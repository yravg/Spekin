import type { ReactNode } from 'react';
import { sampleData, type PillTuple } from '../data/source';
const { PACKAGES } = sampleData;
import { Icon, type IconName } from '../ui/Icon';
import { IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';

interface ReviewPkg {
  id: string;
  name: string;
  b: string;
  f: string;
  v: string;
  s: 'ok' | 'bad';
}

const PK: ReviewPkg[] = PACKAGES.map(([n, b, f, v, s]) => {
  const i = n.indexOf(' ');
  return { id: n.slice(0, i), name: n.slice(i + 1), b, f, v, s };
});

export interface F03Values {
  f3?: string;
  v3?: string;
  v3c?: string;
  kF?: string;
  kV?: string;
  kA?: string;
}

export const F03_AFTER: Required<F03Values> = {
  f3: '5.95',
  v3: '+0.8%',
  v3c: 'ok',
  kF: '31.32',
  kV: '+2.2%',
  kA: '1',
};

export const F03_ALSO_KEYS = ['v3', 'kF', 'kV', 'kA'];

// Mirrors boards-review.mjs f03(o).
export function F03Table(props: {
  val?: F03Values;
  also?: string[];
  extras?: Partial<Record<string, ReactNode>>;
  pins?: Partial<Record<string, number>>;
  hoverPin?: number;
  stalePin?: number;
  pillNode?: ReactNode;
  c1?: number;
  c2?: number;
  c3?: number;
  onClickPart?: (key: string) => void;
}) {
  const {
    val,
    also = [],
    extras,
    pins,
    hoverPin,
    stalePin,
    pillNode,
    c1 = 48,
    c2 = 190,
    c3 = 76,
    onClickPart,
  } = props;

  const v = {
    f3: val?.f3 ?? '6.28',
    v3: val?.v3 ?? '+6.4%',
    v3c: val?.v3c ?? '',
    kF: val?.kF ?? '31.65',
    kV: val?.kV ?? '+3.3%',
    kA: val?.kA ?? '2',
  };

  function renderPin(n: number, k: string) {
    const cls =
      (stalePin === n ? ' stale' : hoverPin ? (hoverPin === n ? ' on' : ' dim') : '') + (k === 'f3' ? ' l' : '');
    return <i className={'rev-pin' + cls}>{n}</i>;
  }

  function renderExtra(k: string) {
    const pinNum = pins?.[k];
    return (
      <>
        {extras?.[k] ?? null}
        {pinNum !== undefined ? renderPin(pinNum, k) : null}
      </>
    );
  }

  function renderAnchor(k: string, inner: ReactNode, cls = '') {
    return (
      <span
        className={['rev-a', cls, also.includes(k) ? 'rev-also' : ''].filter(Boolean).join(' ')}
        data-part={k}
        onClick={onClickPart ? () => onClickPart(k) : undefined}
      >
        {inner}
        {renderExtra(k)}
      </span>
    );
  }

  const kp: [string, string, string, string][] = [
    ['kpi', 'Budget', '30.65', ''],
    ['kF', 'Forecast', v.kF, ''],
    ['kV', 'Variance', v.kV, 'neg'],
    ['kA', 'Alerts', v.kA, ''],
  ];

  return (
    <div
      className="rev-pg"
      style={{
        ['--c1' as string]: c1 + 'px',
        ['--c2' as string]: c2 + 'px',
        ['--c3' as string]: c3 + 'px',
      }}
    >
      <div className="rev-ph">
        <div className="rev-pt">
          {renderAnchor('title', <b>Variance by package</b>)}
          <small>USD million · period 9</small>
        </div>
        <span className="rev-chip">
          Threshold 3% · r14{renderExtra('thr')}
        </span>
      </div>
      <div className="rev-kp">
        {kp.map(([k, l, value, c]) => (
          <div key={k} className={'rev-kc' + (also.includes(k) ? ' rev-also' : '')}>
            <span className="l">{l}</span>
            <b className={c || undefined}>{value}</b>
            {renderExtra(k)}
          </div>
        ))}
      </div>
      <div className="rev-tb">
        <div className="rev-th">
          <span>ID</span>
          <span>Package</span>
          <span className="r">Budget</span>
          <span className="r">Forecast</span>
          <span>{renderAnchor('head', 'Variance')}</span>
        </div>
        {PK.map((p) => {
          const isP3 = p.id === 'P-03';
          const fc = isP3 ? renderAnchor('f3', v.f3, 'cell') : p.f;
          const pl = isP3
            ? renderAnchor(
                'v3',
                pillNode ?? <span className={'rev-pl' + (v.v3c ? ' ' + v.v3c : '')}>{v.v3}</span>,
                'pill',
              )
            : <span className={'rev-pl' + (p.s === 'ok' ? ' ok' : '')}>{p.v}</span>;
          return (
            <div key={p.id} className="rev-tr">
              <span className="id">{p.id}</span>
              <span className="nm">{p.name}</span>
              <span className="rev-n r">{p.b}</span>
              <span className="rev-n r">{fc}</span>
              <span>{pl}</span>
            </div>
          );
        })}
      </div>
      <p className="rev-ft">{renderAnchor('foot', 'Source: cost ledger (sample) · Spec r14')}</p>
    </div>
  );
}

export function FrameAbs(props: {
  left?: number;
  top?: number;
  w?: number;
  rev?: string;
  st?: PillTuple;
  children: ReactNode;
}) {
  const { left = 64, top = 34, w = 560, rev = 'r6', st = ['ok', 'Accepted'], children } = props;
  return (
    <div className="sp-fr" style={{ left: left + 'px', top: top + 'px', width: w + 'px' }}>
      <div className="sp-frl">
        <b>F-03</b>Variance table<span className="r">{rev}</span>
        <Pill tone={st[0]} label={st[1]} />
      </div>
      <div className="sp-frb rev-fb">{children}</div>
    </div>
  );
}

const PALETTE_TOOLS: [IconName, string, string][] = [
  ['pointer', 'Select (V)', 'Selects frames; with Ask on select on, a click inside a frame selects a part'],
  ['hand', 'Pan (H)', 'Pans the board; Space-drag does the same'],
  ['frame', 'New frame (F)', 'Starts an empty frame'],
  ['type', 'Text (T)', 'Adds a text note to the board'],
  ['comment', 'Nitpick pin (C)', 'Drops a numbered nitpick pin on a frame region, for review in S33'],
  ['image', 'Import reference', 'Imports a PNG, JPEG or WebP the user picks as a reference image'],
];

export function ReviewCanvasPalette(props: {
  tool: IconName;
  ask: boolean;
  feature: string;
  onTool: (t: IconName) => void;
  onToggleAsk: () => void;
  onZoom: (action: string) => void;
}) {
  const { tool, ask, feature, onTool, onToggleAsk, onZoom } = props;
  return (
    <>
      <div className="sp-ftool" role="toolbar" aria-label="Canvas tools">
        {PALETTE_TOOLS.map(([icName, label, does]) => (
          <IconBtn
            key={icName}
            icon={icName}
            label={label}
            does={does}
            pressed={tool === icName}
            sm
            feature={feature}
            onClick={() => onTool(icName)}
          />
        ))}
        <span className="div" />
        <button
          type="button"
          className={'sp-btn plain sm' + (ask ? ' rev-on' : '')}
          aria-pressed={ask}
          data-does="When on, selecting a part of a frame opens the change popover; nothing is sent until Send"
          data-feature={feature}
          onClick={onToggleAsk}
        >
          <Icon name="spark" size={14} />
          Ask on select
        </button>
      </div>
      <div className="sp-zoom" role="group" aria-label="Zoom">
        <IconBtn icon="minus" label="Zoom out" does="Zooms the board out; UI text keeps its size" sm feature={feature} onClick={() => onZoom('out')} />
        <span>100%</span>
        <IconBtn icon="plus" label="Zoom in" does="Zooms the board in" sm feature={feature} onClick={() => onZoom('in')} />
        <IconBtn icon="fit" label="Fit selection" does="Fits the selected frame in view" sm feature={feature} onClick={() => onZoom('fit')} />
      </div>
    </>
  );
}

export function RevBtn(props: {
  children: ReactNode;
  does: string;
  feature: string;
  cls?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const { children, does, feature, cls = 'ghost', disabled, onClick } = props;
  return (
    <button
      type="button"
      className={'sp-btn ' + cls}
      disabled={disabled}
      aria-disabled={disabled ? 'true' : undefined}
      data-does={does}
      data-feature={feature}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
