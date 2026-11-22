import { KPIS, PACKAGES } from '@spekin/sample';

const CHART_BARS = [38, 52, 46, 60, 72, 58, 80, 66, 90, 74, 62, 84];

// Mirrors kit.mjs mini(...). Miniature cost-variance dashboard rendered inside canvas frames.
export function MiniDashboard(props: {
  title?: string;
  kpi?: boolean;
  chart?: boolean;
  table?: boolean;
  rows?: number;
  drawer?: boolean;
  h?: number;
}) {
  const { title = 'Variance', kpi = true, chart = false, table = true, rows = 4, drawer = false, h } = props;
  return (
    <div className="mini" style={{ height: h ? h + 'px' : '100%', position: 'relative' }}>
      <div className="mt">
        <i />
        {title}
        <span>USD m · sample</span>
      </div>
      <div className="mb">
        {kpi ? (
          <div className="kp">
            {KPIS.map(([l, v, c]) => (
              <div key={l}>
                <span>{l}</span>
                <b className={c}>{v}</b>
              </div>
            ))}
          </div>
        ) : null}
        {chart ? (
          <div className="ch">
            {CHART_BARS.map((v, i) => (
              <u key={i} style={{ height: v + '%' }} className={i === 8 ? 'hi' : undefined} />
            ))}
          </div>
        ) : null}
        {table ? (
          <div className="tb">
            <div>
              <span>Package</span>
              <span>Budget</span>
              <span>Forecast</span>
              <span>Var.</span>
            </div>
            {PACKAGES.slice(0, rows).map(([n, b, f, v, s]) => (
              <div key={n}>
                <span>{n}</span>
                <em>{b}</em>
                <em>{f}</em>
                <span className={'p ' + (s === 'ok' ? 'ok' : '')}>{v}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {drawer ? (
        <div className="dr">
          <b className="h">Alerts · 2</b>
          <div className="it">
            <b>P-03 Hook-up</b>
            <span>+6.4% · 2 periods</span>
          </div>
          <div className="it">
            <b>P-01 Jacket</b>
            <span>+5.6% · 3 periods</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
