import type { PillTone } from '../data/source';

// Mirrors kit.mjs pill([k, t]).
export function Pill({ tone, label }: { tone: PillTone; label: string }) {
  return <span className={'pill ' + tone}>{label}</span>;
}
