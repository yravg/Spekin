import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MODELS_LEDGER, MODELS_USAGE } from '@spekin/sample';
import {
  ModelsUsageWorkArea,
  filterLedgerRows,
  maskKeyTail,
  nextRunBlocked,
  usageCommitted,
  usagePct,
  usageSeverity,
  type UsageMoment,
  type UsageSection,
} from './ModelsUsageWorkArea';

const render = (section: UsageSection, moment: UsageMoment = 'calm', source: 'hosted' | 'cli' | 'api' = 'hosted') =>
  renderToStaticMarkup(
    <ModelsUsageWorkArea section={section} moment={moment} initialSource={source} onSection={() => {}} onExit={() => {}} />,
  );

describe('S36 Models and usage (IMP-17)', () => {
  it('shows an API key as presence plus the last 4 characters, never the key itself', () => {
    expect(maskKeyTail('sk-ant-abcdef9f2a')).toBe('····9f2a');
    expect(maskKeyTail('1234')).toBe('····1234');
    const api = render('models', 'calm', 'api');
    // The saved key row keeps the tail only; the paste field is bullets, never a key value.
    expect(api).toContain('····9f2a');
    expect(api).not.toContain('sk-ant-abcdef9f2a');
    expect(api).toMatch(/sk-ant-[•]+/);
  });

  it('uses the sample usage moments: committed credits drive the severity and block a new hosted run at the cap', () => {
    expect(usageCommitted(MODELS_USAGE.calm)).toBe(1240 + 24 + 30);
    expect(usagePct(MODELS_USAGE.calm)).toBe(26);
    expect(usageSeverity(MODELS_USAGE.calm)).toBe('calm');
    expect(usageSeverity(MODELS_USAGE.near)).toBe('warn');
    expect(usageSeverity(MODELS_USAGE.capped)).toBe('crit');
    expect(nextRunBlocked(MODELS_USAGE.calm)).toBe(false);
    expect(nextRunBlocked(MODELS_USAGE.capped)).toBe(true);

    const capped = render('limits', 'capped');
    expect(capped).toContain('Monthly cap reached: 5,000 of 5,000 cr.');
    expect(capped).toContain('Send is off: the monthly cap is reached');
    expect(capped).toContain('Critical · 90%+');
    expect(capped).toContain('Top up');
  });

  it('reads the ledger from the sample, never showing an unreported CLI token count as 0', () => {
    const cli = filterLedgerRows(MODELS_LEDGER, 'cli');
    expect(cli.length).toBeGreaterThan(0);
    expect(cli.every((r) => r.kind === 'cli')).toBe(true);
    const unreported = MODELS_LEDGER.find((r) => r.kind === 'cli' && r.amt === 'not reported');
    expect(unreported).toBeTruthy();

    const ledger = render('ledger');
    expect(ledger).toContain('not reported');
    expect(ledger).toContain('Cancelled after partial usage');
    expect(ledger).toContain('k-2b90de');
  });

  it('renders all six board states with sample data, no data-todo and the CLI pair button LATER (C-05)', () => {
    const states: [UsageSection, UsageMoment, 'hosted' | 'cli' | 'api'][] = [
      ['models', 'calm', 'hosted'],
      ['models', 'calm', 'cli'],
      ['models', 'calm', 'api'],
      ['next', 'calm', 'hosted'],
      ['ledger', 'calm', 'hosted'],
      ['limits', 'capped', 'hosted'],
    ];
    for (const [section, moment, source] of states) {
      const html = render(section, moment, source);
      expect(html).toContain('Models and usage');
      expect(html).not.toContain('data-todo');
    }

    const cli = render('models', 'calm', 'cli');
    expect(cli).toContain('Spekin Connector');
    // Pairing and runs through the connector ship later: the pair button is drawn and off (C-05, ADR 0005).
    expect(cli).toMatch(/data-later="[^"]*"[^>]*>[\s\S]*?Pair again/);
    const source = render('models');
    expect(source).toMatch(/data-later="[^"]*"[^>]*>[\s\S]*?Top up/);
  });
});
