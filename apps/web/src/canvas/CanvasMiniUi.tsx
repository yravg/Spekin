import { KPIS, PACKAGES } from '@spekin/sample';
import { Icon } from '../ui/Icon';

interface PkgRow {
  id: string;
  name: string;
  b: string;
  f: string;
  v: string;
  over: boolean;
}

const PK: PkgRow[] = PACKAGES.map(([n, b, f, v, s]) => {
  const i = n.indexOf(' ');
  return { id: n.slice(0, i), name: n.slice(i + 1), b, f, v, over: s === 'bad' };
});

const PK2: PkgRow[] = [
  { id: 'P-05', name: 'Pipeline tie-in', b: '2.30', f: '2.32', v: '+0.9%', over: false },
  { id: 'P-06', name: 'Survey and permits', b: '1.10', f: '1.08', v: '−1.8%', over: false },
];

const DRILL_LINES: [string, string, string][] = [
  ['Steel supply', '4.20', '4.55'],
  ['Fabrication labour', '5.10', '5.31'],
  ['Coating', '1.30', '1.42'],
  ['Load-out', '0.90', '0.92'],
  ['Engineering', '0.90', '0.90'],
];

const PORTFOLIO_BARS = [38, 52, 46, 60, 72, 58, 80, 66, 90, 74, 62, 84];

function BarsChart() {
  return (
    <div className="ch">
      <span>Forecast against budget, USD m</span>
      <div className="bars">
        {PK.map((p) => (
          <div key={p.id}>
            <u style={{ height: Math.round((parseFloat(p.b) / 13.1) * 100) + '%' }} />
            <u className={'f' + (p.over ? ' o' : '')} style={{ height: Math.round((parseFloat(p.f) / 13.1) * 100) + '%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiRow({ items }: { items: ([string, string] | [string, string, string])[] }) {
  return (
    <div className="uk">
      {items.map(([a, b, c]) => (
        <div key={a}>
          <span>{a}</span>
          <b className={c}>{b}</b>
        </div>
      ))}
    </div>
  );
}

function UiTop({ title, extra }: { title: string; extra?: React.ReactNode }) {
  return (
    <div className="ut">
      <i />
      <b>{title}</b>
      <span>Meranti Yard · USD m · sample</span>
      {extra}
      <em>Period 06</em>
    </div>
  );
}

// Mirrors boards-canvas.mjs tui(k).
export function CanvasMiniUi({ kind = 'base' }: { kind?: string }) {
  const copy = kind === 'copy';
  const head = copy ? ['Package', 'Planned', 'Expected', 'Over plan', 'What to do'] : ['Package', 'Budget', 'Forecast', 'Variance', 'Status'];
  const kpis: ([string, string] | [string, string, string])[] = copy
    ? [
        ['Planned', '30.65'],
        ['Expected', '31.65'],
        ['Over plan', '+3.3%', 'neg'],
        ['Needs a look', '2'],
      ]
    : KPIS;

  const renderStat = (over: boolean) => {
    if (kind === 'contrast') {
      return over ? (
        <span className="pl hi">
          <Icon name="alert" size={11} />
          Over 3%
        </span>
      ) : (
        <span className="pl no">Within 3%</span>
      );
    }
    if (copy) {
      return over ? <span className="pl wn">Needs a look</span> : <span className="pl ok">On plan</span>;
    }
    return over ? <span className="pl wn">Alert</span> : <span className="pl ok">OK</span>;
  };

  const renderTable = (rows: PkgRow[], withTotal = false) => (
    <div className="tb">
      <div className="tr th">
        {head.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      {rows.map((p) => (
        <div key={p.id} className={'tr' + (p.over ? ' o' : '')}>
          <span className="nm">
            {p.id} {p.name}
          </span>
          <em>{p.b}</em>
          <em>{p.f}</em>
          <span className="v">{p.v}</span>
          {renderStat(p.over)}
        </div>
      ))}
      {withTotal ? (
        <div className="tr tot">
          <span className="nm">Total</span>
          <em>30.65</em>
          <em>31.65</em>
          <span className="v">+3.3%</span>
          <span />
        </div>
      ) : null}
    </div>
  );

  let body: React.ReactNode;
  if (kind === 'portfolio') {
    body = (
      <>
        <UiTop title="Portfolio overview" />
        <KpiRow items={KPIS} />
        <div className="big">
          {PORTFOLIO_BARS.map((v, i) => (
            <u key={i} className={i === 8 ? 'hi' : ''} style={{ height: v + '%' }} />
          ))}
        </div>
      </>
    );
  } else if (kind === 'drill') {
    body = (
      <>
        <UiTop title="P-01 Jacket fabrication · cost lines" />
        <KpiRow
          items={[
            ['Budget', '12.40'],
            ['Forecast', '13.10'],
            ['Variance', '+5.6%', 'neg'],
            ['Lines', '5'],
          ]}
        />
        <div className="tb">
          <div className="tr th">
            <span>Line</span>
            <span>Budget</span>
            <span>Forecast</span>
            <span>Change</span>
            <span>Share</span>
          </div>
          {DRILL_LINES.map(([n, b, f]) => {
            const d = parseFloat(f) - parseFloat(b);
            return (
              <div key={n} className={'tr' + (d > 0.2 ? ' o' : '')}>
                <span className="nm">{n}</span>
                <em>{b}</em>
                <em>{f}</em>
                <span className="v">
                  {d >= 0 ? '+' : '−'}
                  {Math.abs(d).toFixed(2)}
                </span>
                <em>{Math.round((parseFloat(b) / 12.4) * 100)}%</em>
              </div>
            );
          })}
        </div>
      </>
    );
  } else if (kind === 'empty') {
    body = (
      <>
        <UiTop title="Variance table" />
        <KpiRow items={KPIS} />
        <div className="em">
          <Icon name="check" size={22} />
          <b>No package is over 3% this period</b>
          <span>Next review: period 07</span>
        </div>
      </>
    );
  } else if (kind === 'layout') {
    body = (
      <>
        <UiTop
          title="Variance table"
          extra={
            <span className="kp">
              <span>Variance +3.3%</span>
              <span>Alerts 2</span>
            </span>
          }
        />
        <div className="uf">
          <span className="on">Period 06</span>
          <span>All packages</span>
          <span>Over 3% only</span>
        </div>
        {renderTable(PK, true)}
        <BarsChart />
      </>
    );
  } else if (kind === 'hierarchy') {
    body = (
      <>
        <UiTop title="Variance table" />
        <KpiRow
          items={[
            ['Variance', '+3.3%', 'neg'],
            ['Forecast', '31.65'],
            ['Alerts', '2'],
          ]}
        />
        {renderTable(PK)}
        <BarsChart />
      </>
    );
  } else if (kind === 'density') {
    body = (
      <>
        <UiTop title="Variance table" />
        <KpiRow items={KPIS} />
        {renderTable(PK.concat(PK2))}
      </>
    );
  } else {
    body = (
      <>
        <UiTop title="Variance table" />
        <KpiRow items={kpis} />
        {renderTable(PK)}
        <BarsChart />
        {kind === 'drawer' ? (
          <div className="dr">
            <b className="h">Alerts · 2</b>
            <div className="it">
              <b>P-03 Hook-up</b>
              <span>+6.4% · 2 periods over</span>
            </div>
            <div className="it">
              <b>P-01 Jacket</b>
              <span>+5.6% · 3 periods over</span>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return <div className={'can-ui k-' + kind}>{body}</div>;
}

export function ScaledCanvasUi({ kind, scale }: { kind: string; scale: number }) {
  return (
    <div
      className="can-sc"
      style={{
        width: Math.round(640 * scale) + 'px',
        height: Math.round(450 * scale) + 'px',
        ['--s' as string]: scale,
      }}
    >
      <CanvasMiniUi kind={kind} />
    </div>
  );
}

export function ReferenceImageStub() {
  return (
    <div className="can-refimg">
      <u className="h" />
      <u />
      <u style={{ width: '82%' }} />
      <div className="bx">
        {[40, 62, 50, 78, 56, 90, 66].map((v, i) => (
          <s key={i} style={{ height: v + '%' }} />
        ))}
      </div>
      <u />
      <u style={{ width: '70%' }} />
      <u style={{ width: '90%' }} />
      <u style={{ width: '46%' }} />
      <u />
      <u style={{ width: '76%' }} />
      <span className="tag">Reference, not editable</span>
    </div>
  );
}
