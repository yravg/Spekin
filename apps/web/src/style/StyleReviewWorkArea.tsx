import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  MODEL,
  STYLE_CTX,
  STYLE_HUNKS,
  STYLE_NEWREF,
  STYLE_NEWTOKEN,
  STYLE_REFS,
  STYLE_STEPS,
  STYLE_TOKENS,
  STYLE_contrast,
  type PillTuple,
  type SampleStyleHunk,
  type SampleStyleRef,
  type SampleStyleToken,
  type StyleTokenState,
} from '@spekin/sample';
import { useWorkspace, type SaveState } from '../state/workspace';
import { Icon, type IconName } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { Inspector } from '../shell/Inspector';

export type StyleMode = 'learning' | 'review' | 'conflict' | 'markdown' | 'promote' | 'accepted';

export interface StyleShellOverride {
  save?: SaveState;
  specRev?: string;
}

export interface ComputedStyleToken extends SampleStyleToken {
  rev: string;
  kept?: boolean;
}

export interface StyleCounts {
  ok: number;
  inf: number;
  cf: number;
  all: number;
}

export interface MarkdownLine {
  txt: string;
  cls: '' | 'h' | 'c' | 'inf' | 'cf' | 'ed';
}

const WHITE_HEX = String.fromCharCode(35) + 'FFFFFF';

const STATE_META: Record<StyleTokenState, [string, IconName, string]> = {
  ok: ['ok', 'check', 'Accepted'],
  inf: ['inf', 'spark', 'Inferred'],
  cf: ['bad', 'alert', 'Conflict'],
};

const SAVE_BY_MODE: Record<StyleMode, SaveState> = {
  learning: { status: 'saved', tone: 'ok', text: 'Saved 12:34' },
  review: { status: 'saved', tone: 'ok', text: 'Saved 12:41' },
  conflict: { status: 'saved', tone: 'ok', text: 'Saved 12:41' },
  markdown: { status: 'saved', tone: 'ok', text: 'Saved 12:48' },
  promote: { status: 'saved', tone: 'ok', text: 'Saved 12:52' },
  accepted: { status: 'saved', tone: 'ok', text: 'Saved 13:06' },
};

const S30_OUTLINE: [string, StyleTokenState, string][] = [
  ['Purpose', 'ok', 'r3'],
  ['Tone', 'ok', 'r3'],
  ['Grid', 'ok', 'r3'],
  ['Type scale', 'inf', '2 inferred'],
  ['Colour roles', 'cf', '3 inferred · 1 conflict'],
  ['Spacing', 'inf', '1 inferred'],
  ['Radius', 'cf', '1 conflict'],
  ['Motion rules', 'ok', 'r3'],
  ['Components', 'inf', '2 inferred'],
  ['Do and don’t', 'ok', 'r3'],
];

const S30_TABS: ArtifactTabItem[] = [
  { icon: 'grid', name: 'Variance flows' },
  { icon: 'frame', name: 'F-03 Variance table' },
  { icon: 'doc', name: 'DESIGN.md' },
  { icon: 'layers', name: 'Style · learned' },
];

export function buildStyleTokens(mode: StyleMode): ComputedStyleToken[] {
  return STYLE_TOKENS.map((t) => {
    const o: ComputedStyleToken = { ...t, rev: 'r3' };
    if (mode === 'accepted') {
      if (o.st === 'inf' && o.id !== 'space.half') {
        o.st = 'ok';
        o.rev = 'r4';
      }
      if (o.id === 'color.accent') {
        o.st = 'ok';
        o.kept = true;
        delete o.alt;
      }
      if (o.id === 'radius.card' && o.alt) {
        o.st = 'ok';
        o.rev = 'r4';
        o.spec = o.alt.spec;
        o.r = o.alt.r;
        delete o.alt;
      }
    }
    return o;
  });
}

// Draft-only token acceptance: never mutates the accepted spec revision (r3).
export function acceptDraftToken(list: ComputedStyleToken[], id: string): ComputedStyleToken[] {
  return list.map((t) => (t.id === id && t.st === 'inf' ? { ...t, st: 'ok', rev: 'draft' } : t));
}

export function countStyleTokens(list: ComputedStyleToken[]): StyleCounts {
  return {
    ok: list.filter((t) => t.st === 'ok').length,
    inf: list.filter((t) => t.st === 'inf').length,
    cf: list.filter((t) => t.st === 'cf').length,
    all: list.length,
  };
}

export function promoteStyleProposal(hunks: SampleStyleHunk[]) {
  return {
    id: 'P-021',
    baseRev: 'r3',
    targetRev: 'r4',
    includedCount: hunks.filter((h) => h.inc).length,
    totalCount: hunks.length,
    accepted: false,
  };
}

function padRight(s: string, n: number): string {
  return String(s).padEnd(n, ' ');
}

function slugName(s: string): string {
  return s.toLowerCase().replace(/ /g, '-');
}

export function buildDesignMarkdownLines(tokens: ComputedStyleToken[]): MarkdownLine[] {
  const lines: MarkdownLine[] = [];
  const add = (txt: string, cls: MarkdownLine['cls'] = '') => lines.push({ txt, cls });
  add('# DESIGN.md · Meranti Yard', 'h');
  add('');
  add('Status: draft on r3 · learned from REF-02, REF-03', 'c');
  add('Lines marked inferred are not part of the spec until accepted.', 'c');
  add('');
  add('## Colour roles', 'h');
  add('| role         | value   | state');
  add('|--------------|---------|------');
  for (const t of tokens.filter((x) => x.g === 'color')) {
    const stateText =
      t.st === 'ok'
        ? 'accepted r3'
        : t.st === 'inf'
          ? `inferred ${t.refs[0]}`
          : `accepted r3 · conflict, inferred ${t.alt?.hex ?? ''}`;
    add(`| ${padRight(slugName(t.name), 12)} | ${t.v?.hex ?? ''} | ${stateText}`, t.st === 'inf' ? 'inf' : t.st === 'cf' ? 'cf' : '');
  }
  add('');
  add('## Type scale', 'h');
  for (const t of tokens.filter((x) => x.g === 'type')) {
    const stateText = t.st === 'ok' ? 'accepted r3' : `inferred ${t.refs[0]}`;
    add(`| ${padRight(slugName(t.name), 12)} | ${padRight(t.spec ?? '', 22)} | ${stateText}`, t.st === 'inf' ? 'inf' : '');
  }
  add('');
  add('## Radius', 'h');
  for (const t of tokens.filter((x) => x.g === 'radius')) {
    const stateText = t.st === 'cf' ? `accepted r3 · conflict, inferred ${t.alt?.spec ?? ''}` : 'accepted r3';
    add(`| ${padRight(slugName(t.name), 12)} | ${padRight(t.spec ?? '', 7)} | ${stateText}`, t.st === 'cf' ? 'cf' : '');
  }
  return lines;
}

function StatePill({ state, label }: { state: StyleTokenState; label?: string }) {
  const [tone, icon, text] = STATE_META[state];
  return (
    <span className={'pill ' + tone}>
      <Icon name={icon} size={10} stroke={2.2} />
      {label ?? text}
    </span>
  );
}

function OffBtn(props: { label: string; why: string; feature: string; cls?: 'ghost' | 'ink' | 'plain'; sm?: boolean; icon?: IconName }) {
  const { label, why, feature, cls = 'ghost', sm, icon } = props;
  return (
    <button
      type="button"
      className={'sp-btn ' + cls + (sm ? ' sm' : '')}
      disabled
      data-does={why}
      data-feature={feature}
      title={why}
    >
      {icon ? <Icon name={icon} size={14} /> : null}
      {label}
    </button>
  );
}

function AiMessage({ text, meta = 'Sonnet 5.5 · 41 s · 9 cr', children }: { text: string; meta?: string; children?: ReactNode }) {
  return (
    <div className="sp-ai">
      <div className="h">
        <span className="av">S</span>Spekin<em>{meta}</em>
      </div>
      <p>{text}</p>
      {children}
    </div>
  );
}

function StyleModule(props: {
  title: string;
  countLabel: string;
  collapsed?: boolean;
  busy?: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  const { title, countLabel, collapsed, busy, onToggle, children } = props;
  return (
    <section className="sty-mod" aria-label={title} aria-busy={busy ? 'true' : undefined}>
      <div className={'sty-mh' + (collapsed ? ' nb' : '')}>
        <b>{title}</b>
        <span className="n">{countLabel}</span>
        <span className="sp-fill" />
        <IconBtn
          icon={collapsed ? 'chevR' : 'chev'}
          label={(collapsed ? 'Expand ' : 'Collapse ') + title}
          does={collapsed ? `Expands the ${title} module` : `Collapses the ${title} module; the draft is unchanged`}
          sm
          feature="F184"
          onClick={onToggle}
        />
      </div>
      {collapsed ? null : <div className="sty-mb">{children}</div>}
    </section>
  );
}

function tokenMeta(t: ComputedStyleToken): string {
  return t.st === 'ok' ? (t.kept ? 'confirmed r3 kept' : t.rev) : `${t.refs.join(' + ')} · ${t.seen}`;
}

function renderHexLine(txt: string): ReactNode {
  const parts = txt.split(/(#[0-9A-F]{6})/g);
  return parts.map((part, i) => (i % 2 === 1 ? <span key={i} className="k">{part}</span> : part));
}

function renderDiffText(txt: string): ReactNode {
  const parts = txt.split(/(~~.+?~~|\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('~~') && part.endsWith('~~')) return <del key={i}>{part.slice(2, -2)}</del>;
    if (part.startsWith('**') && part.endsWith('**')) return <ins key={i}>{part.slice(2, -2)}</ins>;
    return part;
  });
}

function RefCard(props: { r: SampleStyleRef; mode: StyleMode; onOpenRef: (id: string) => void }) {
  const { r, mode, onOpenRef } = props;
  const done = mode !== 'learning' || r.id === 'REF-02';
  const count = STYLE_TOKENS.filter((t) => t.refs.includes(r.id)).length;
  const stepIdx = r.at_step ?? 5;
  return (
    <div className="sty-ref">
      <span className="sty-th" aria-hidden="true">
        <u className={r.id === 'REF-02' ? 'g' : 'a'} />
        <u className="s" />
        <u className="s" />
        <u />
      </span>
      <div>
        <div className="t">
          {r.name}
          <span>{r.id}</span>
          <span className="sp-fill" />
          <IconBtn
            icon="link"
            label={`Open ${r.id} in S28`}
            does="Opens this reference in S28 to see the original image and its crop"
            sm
            feature="F193"
            onClick={() => onOpenRef(r.id)}
          />
        </div>
        <small>
          {r.kind} · {r.at}
        </small>
        <small>
          {done ? (
            <>
              <Icon name="check" size={11} stroke={2.4} /> Read in full · {count} tokens seen
            </>
          ) : (
            `Step ${stepIdx} of ${r.steps ?? 5} · ${STYLE_STEPS[stepIdx - 1] ?? ''}`
          )}
        </small>
        {done ? null : (
          <span className="sty-steps" role="img" aria-label={`${stepIdx - 1} of 5 steps done`}>
            {[1, 2, 3, 4, 5].map((i) => (
              <i key={i} className={i < stepIdx ? 'd' : i === stepIdx ? 'a' : ''} />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

// S30 Style review. Board: docs/design/spekin-canvas/project/S30-style-review.dc.html (data-screen="S30").
export function StyleReviewWorkArea(props: {
  initialMode?: StyleMode;
  onShellOverride?: (o: StyleShellOverride) => void;
} = {}) {
  const { initialMode = 'review', onShellOverride } = props;
  const view = useWorkspace((s) => s.view('design'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const [mode, setMode] = useState<StyleMode>(initialMode);
  const [keepLearning, setKeepLearning] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ok' | 'inf' | 'cf'>(initialMode === 'conflict' ? 'cf' : 'all');
  const [collapsedMods, setCollapsedMods] = useState<Record<string, boolean>>({});
  const [hunks, setHunks] = useState<SampleStyleHunk[]>(() => STYLE_HUNKS.map((h) => ({ ...h })));
  const [inspTab, setInspTab] = useState<string>('References');

  useEffect(() => {
    onShellOverride?.({
      save: SAVE_BY_MODE[mode],
      specRev: mode === 'accepted' ? 'r15' : undefined,
    });
  }, [mode, onShellOverride]);

  const switchMode = (next: StyleMode) => {
    setMode(next);
    setFilter(next === 'conflict' ? 'cf' : 'all');
    if (next === 'conflict') setInspTab('Conflicts');
    else if (next === 'markdown') setInspTab('Outline');
    else if (next === 'promote') setInspTab('Summary');
    else setInspTab('References');
    onShellOverride?.({
      save: SAVE_BY_MODE[next],
      specRev: next === 'accepted' ? 'r15' : undefined,
    });
  };

  const toggleMod = (title: string) => {
    setCollapsedMods((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const reviewTokens = buildStyleTokens('review');
  const acceptedTokens = buildStyleTokens('accepted');
  const C0 = countStyleTokens(reviewTokens);
  const C4 = countStyleTokens(acceptedTokens);
  const palOnly = countStyleTokens(reviewTokens.filter((t) => t.g === 'color'));
  const currentTokens = buildStyleTokens(mode);
  const showActions = mode !== 'learning';
  const accentToken = STYLE_TOKENS.find((t) => t.id === 'color.accent')!;
  const includedHunkCount = hunks.filter((h) => h.inc).length;

  const ctxItems = STYLE_CTX.filter(([, name]) => !view.removedCtx.includes(name));
  const ctxFoot =
    mode === 'markdown'
      ? '≈ 2.6k tokens · DESIGN.md draft included'
      : '≈ 3.2k tokens · images go to the model only while listed';

  const tokenActions = (t: ComputedStyleToken) => {
    if (!showActions) return null;
    if (t.st === 'inf') {
      return (
        <>
          <IconBtn
            icon="check"
            label={`Accept ${t.name}`}
            does="Accepts this token into the style draft; the spec stays unchanged until you promote"
            sm
            feature="F186"
            onClick={() => recordIntent('F186:accept:' + t.id)}
          />
          <IconBtn
            icon="x"
            label={`Dismiss ${t.name}`}
            does="Dismisses this inferred token; a later reference may infer it again"
            sm
            feature="F186"
            onClick={() => recordIntent('F186:dismiss:' + t.id)}
          />
        </>
      );
    }
    if (t.st === 'cf') {
      return (
        <Btn
          label="Resolve"
          sm
          cls="ink"
          does="Opens the conflict card: keep the confirmed token or propose the inferred one"
          feature="F187"
          onClick={() => switchMode('conflict')}
        />
      );
    }
    return null;
  };

  const renderColorRow = (t: ComputedStyleToken, sel = false) => (
    <div key={t.id} className={'sty-tk' + (sel ? ' sel' : '')} data-token={t.id}>
      {t.st === 'cf' && t.alt?.css && t.v ? (
        <span className="sty-c split" style={{ '--a': t.v.css, '--b': t.alt.css } as CSSProperties} />
      ) : (
        <span className="sty-c" style={{ '--c': t.v?.css } as CSSProperties} />
      )}
      <span className="nm">
        <b>{t.name}</b>
        <small>
          {t.st === 'cf' ? (
            <>
              <code>{t.v?.hex}</code> vs <code>{t.alt?.hex}</code>
            </>
          ) : (
            <>
              <code>{t.v?.hex}</code> · {tokenMeta(t)}
            </>
          )}
        </small>
      </span>
      <StatePill state={t.st} />
      <span className="act">{tokenActions(t)}</span>
    </div>
  );

  const renderTypeRow = (t: ComputedStyleToken) => (
    <div key={t.id} className="sty-tk ty" data-token={t.id}>
      <span className={'aa ' + (t.cls ?? '')}>Aa</span>
      <span className="nm">
        <b>{t.name}</b>
        <small>{t.spec}</small>
      </span>
      <StatePill state={t.st} />
      <span className="act">{tokenActions(t)}</span>
    </div>
  );

  const renderPlainSample = (t: ComputedStyleToken) => {
    if (t.bars) {
      return (
        <span className="sty-bars">
          {t.bars.map((b, i) => (
            <i key={i} style={{ height: `${Math.max(3, Math.round(b * 0.65))}px` }} />
          ))}
        </span>
      );
    }
    if (t.r != null) {
      return <span className="sty-rs" style={{ borderRadius: `${Math.min(t.r, 11)}px` }} />;
    }
    if (t.id === 'icon.style') {
      return <Icon name="grid" size={20} stroke={1.5} />;
    }
    return <span />;
  };

  const renderPlainRow = (t: ComputedStyleToken, sel = false) => (
    <div key={t.id} className={'sty-tk' + (sel ? ' sel' : '')} data-token={t.id}>
      {renderPlainSample(t)}
      <span className="nm">
        <b>{t.name}</b>
        <small>{t.st === 'cf' ? `${t.spec} vs ${t.alt?.spec ?? ''}` : `${t.spec} · ${tokenMeta(t)}`}</small>
      </span>
      <StatePill state={t.st} />
      <span className="act">{tokenActions(t)}</span>
    </div>
  );

  const renderVisual = () => {
    const by = (g: SampleStyleToken['g']) => currentTokens.filter((t) => t.g === g);
    const paletteList: ComputedStyleToken[] =
      mode === 'accepted' ? [...by('color'), { ...STYLE_NEWTOKEN, rev: 'r4' }] : by('color');

    const coverEl = (
      <section className="sty-mod sty-cover" aria-label="Style cover" aria-busy={mode === 'learning' ? 'true' : undefined}>
        <span className="aa">Aa</span>
        <span className="tt">
          {mode === 'learning' ? (
            <>
              <b className="sty-ghost">Learning a style…</b>
              <small>Colours found so far, from 2 references</small>
            </>
          ) : (
            <>
              <b>Meranti Yard style</b>
              <small>
                {mode === 'accepted'
                  ? 'DESIGN.md r4 · accepted 12:58 by Rina (sample)'
                  : 'Learned from REF-02 and REF-03 · draft on DESIGN.md r3'}
              </small>
            </>
          )}
        </span>
        <span className="sty-strip" aria-label="Colour strip">
          {by('color').map((t) => (
            <i key={t.id} style={{ '--c': t.v?.css } as CSSProperties} />
          ))}
        </span>
        {mode === 'learning' ? null : (
          <Pill tone={mode === 'accepted' ? 'ok' : 'mute'} label={mode === 'accepted' ? 'In the spec · r4' : 'Draft · not in the spec'} />
        )}
      </section>
    );

    if (mode === 'learning') {
      const skNames = ['Display', 'Title', 'Heading', 'Body', 'Caption', 'Figures'];
      return (
        <div className="sty-stack" data-feature="F184" aria-label="Learned style">
          {coverEl}
          <div className="sty-cols">
            <div className="sty-col">
              <StyleModule
                title="Palette"
                countLabel="9 tokens · from both references"
                collapsed={!!collapsedMods.Palette}
                onToggle={() => toggleMod('Palette')}
              >
                {paletteList.map((t) => renderColorRow(t))}
              </StyleModule>
              <StyleModule
                title="Spacing"
                countLabel="waiting"
                collapsed={!!collapsedMods.Spacing}
                onToggle={() => toggleMod('Spacing')}
              >
                <div className="sty-wait" role="status">
                  Waits for the type step
                </div>
              </StyleModule>
            </div>
            <div className="sty-col">
              <StyleModule
                title="Type"
                countLabel="writing · 3 of 6 names known"
                busy
                collapsed={!!collapsedMods.Type}
                onToggle={() => toggleMod('Type')}
              >
                {skNames.map((n, i) => (
                  <div key={n} className="sty-sk-row">
                    <span className="sty-sk sq" />
                    <span className="tx">
                      <span className="nmg">{n}</span>
                      <span className="sty-sk" style={{ width: `${70 - i * 8}%` }} />
                    </span>
                    <span className="sty-sk pl62" />
                  </div>
                ))}
              </StyleModule>
              <StyleModule
                title="Radii and icons"
                countLabel="waiting"
                collapsed={!!collapsedMods['Radii and icons']}
                onToggle={() => toggleMod('Radii and icons')}
              >
                <div className="sty-wait" role="status">
                  Waits for the type step
                </div>
              </StyleModule>
            </div>
          </div>
          <StyleModule
            title="Sample controls"
            countLabel="waiting"
            collapsed={!!collapsedMods['Sample controls']}
            onToggle={() => toggleMod('Sample controls')}
          >
            <div className="sty-wait" role="status">
              Controls are written last, from the finished tokens
            </div>
          </StyleModule>
        </div>
      );
    }

    const getToken = (id: string) => currentTokens.find((t) => t.id === id)!;
    const sampleCollapsed = collapsedMods['Sample controls'] ?? mode === 'accepted';
    const cmpCount = by('cmp').length;
    const cmpDefs: [ComputedStyleToken, string, ReactNode][] = [
      [
        getToken('cmp.button'),
        'Button',
        <>
          <span className="sp-btn ink sm">Save</span> <span className="sp-btn ghost sm">Cancel</span>
        </>,
      ],
      [getToken('cmp.input'), 'Input', <span className="sty-in">Search packages</span>],
      [
        getToken('cmp.pill'),
        'Status',
        <>
          <span className="pill ok">On track</span> <span className="pill warn">Review</span>
        </>,
      ],
      [getToken('cmp.toggle'), 'Toggle', <span className="sty-tg" />],
      [
        getToken('cmp.table'),
        'Table',
        <span className="sty-tb">
          <span>
            P-01 <b>+5.6%</b>
          </span>
          <span>
            P-02 <b>+0.7%</b>
          </span>
        </span>,
      ],
    ];

    return (
      <div className="sty-stack" data-feature="F184" aria-label="Learned style">
        {coverEl}
        <div className="sty-cols">
          <div className="sty-col">
            <StyleModule
              title="Palette"
              countLabel={`${paletteList.length} tokens`}
              collapsed={!!collapsedMods.Palette}
              onToggle={() => toggleMod('Palette')}
            >
              {paletteList.map((t) => renderColorRow(t, mode === 'conflict' && t.id === 'color.accent'))}
            </StyleModule>
            <StyleModule
              title="Spacing"
              countLabel={`${by('space').length} tokens`}
              collapsed={!!collapsedMods.Spacing}
              onToggle={() => toggleMod('Spacing')}
            >
              {by('space').map((t) => renderPlainRow(t))}
            </StyleModule>
          </div>
          <div className="sty-col">
            <StyleModule
              title="Type"
              countLabel={`${by('type').length} tokens`}
              collapsed={!!collapsedMods.Type}
              onToggle={() => toggleMod('Type')}
            >
              {by('type').map((t) => renderTypeRow(t))}
            </StyleModule>
            <StyleModule
              title="Radii and icons"
              countLabel={`${by('radius').length + by('icon').length} tokens`}
              collapsed={!!collapsedMods['Radii and icons']}
              onToggle={() => toggleMod('Radii and icons')}
            >
              {[...by('radius'), ...by('icon')].map((t) => renderPlainRow(t, mode === 'conflict' && t.id === 'color.accent'))}
            </StyleModule>
          </div>
        </div>
        <StyleModule
          title="Sample controls"
          countLabel={`${cmpCount} components${sampleCollapsed ? ' · collapsed' : ''}`}
          collapsed={sampleCollapsed}
          onToggle={() => toggleMod('Sample controls')}
        >
          <div className="sty-cmps">
            {cmpDefs.map(([tok, short, sample]) => (
              <div key={tok.id} className={'sty-cmp1' + (tok.st === 'inf' ? ' inf' : '')} data-token={tok.id}>
                <span>{sample}</span>
                <span className="cap1">
                  {short}
                  <span className="sp-fill" />
                  <StatePill state={tok.st} />
                </span>
              </div>
            ))}
          </div>
        </StyleModule>
      </div>
    );
  };

  const renderMarkdownEditor = () => {
    const mdLines = buildDesignMarkdownLines(reviewTokens).slice(0, 26);
    return (
      <div className="sty-ed" data-feature="F188">
        <div className="sty-edb">
          <b>DESIGN.md</b>
          <span>draft on r3 · 1 line edited</span>
          <span className="sp-fill" />
          <Btn
            label="Paste a guide"
            sm
            icon="clip"
            does="Pastes a style guide as Markdown; it is read into tokens that arrive as Inferred, never as accepted"
            feature="F188"
            onClick={() => recordIntent('F188:paste')}
          />
          <IconBtn icon="undo" label="Undo" does="Undoes the last edit in the draft" sm feature="F188" onClick={() => recordIntent('F188:undo')} />
          <IconBtn icon="redo" label="Redo" does="Redoes the last undone edit" sm feature="F188" onClick={() => recordIntent('F188:redo')} />
        </div>
        <div className="sty-code" aria-label="DESIGN.md draft">
          {mdLines.map((l, i) => {
            const isEd = l.txt.includes('| caption');
            const txt = isEd ? l.txt.replace('· caps', '· caps, tables only') : l.txt;
            const cls = isEd ? 'ed' : l.cls;
            return (
              <div key={i} className={'sty-l ' + cls}>
                <span className="ln">{i + 1}</span>
                <span>
                  {l.cls === 'h' ? (
                    <span className="h">{txt}</span>
                  ) : l.cls === 'c' ? (
                    <span className="c">{txt}</span>
                  ) : (
                    renderHexLine(txt)
                  )}
                  {isEd ? <i className="sty-caret" /> : null}
                </span>
                <span className="tg">{isEd ? 'edited by you' : ''}</span>
              </div>
            );
          })}
        </div>
        <div className="sty-edf">
          <span className="mono">Ln 31, Col 52</span>
          <span>Markdown</span>
          <span>Draft saved on this device</span>
          <span className="sp-fill" />
          <span>
            <kbd className="sty-kbd">⌘ S</kbd> save draft
          </span>
          <span>
            <kbd className="sty-kbd">⌘ ⇧ P</kbd> promote
          </span>
        </div>
      </div>
    );
  };

  const renderPromote = () => (
    <div className="sty-prop">
      <div className="sty-ph" data-feature="F189">
        <Icon name="diff" size={18} />
        <div>
          <b>Proposal P-021 · DESIGN.md r3 to r4</b>
          <br />
          <small>From the style draft (REF-02, REF-03) · base is DESIGN.md r3, the current revision</small>
        </div>
        <span className="sp-fill" />
        <Pill tone="ok" label="Base is current" />
        <Pill tone="acc" label="Proposal" />
      </div>
      {hunks.map((h) => (
        <section key={h.id} className={'sty-hk' + (h.open ? ' open' : '')} data-hunk={h.id} aria-label={h.sec}>
          <div className="hh">
            <button
              type="button"
              className={'sty-cb' + (h.inc ? ' on' : '')}
              role="checkbox"
              aria-checked={h.inc}
              aria-label={`Include ${h.sec}`}
              data-does={h.inc ? 'Leaves this hunk out of the proposal' : 'Includes this hunk in the proposal'}
              data-feature="F189"
              onClick={() => setHunks((prev) => prev.map((x) => (x.id === h.id ? { ...x, inc: !x.inc } : x)))}
            >
              {h.inc ? <Icon name="check" size={11} stroke={3} /> : null}
            </button>
            <b>{h.sec}</b>
            <span className="n">
              <em>+{h.add}</em> <s>−{h.del}</s>
            </span>
            {h.conf ? <Pill tone="warn" label="Changes a confirmed token" /> : null}
            {!h.inc ? <Pill tone="mute" label="Left out" /> : null}
            <span className="sp-fill" />
            <IconBtn
              icon={h.open ? 'chev' : 'chevR'}
              label={`${h.open ? 'Collapse' : 'Expand'} ${h.sec}`}
              does="Shows or hides the lines of this hunk; the include choice is kept"
              sm
              feature="F189"
              onClick={() => setHunks((prev) => prev.map((x) => (x.id === h.id ? { ...x, open: !x.open } : x)))}
            />
          </div>
          {h.open
            ? h.lines.map(([k, t], idx) => (
                <div key={idx} className={'sty-dl ' + k}>
                  <span className="g">{k === 'add' ? '+' : k === 'mod' ? '~' : ' '}</span>
                  <span>{renderDiffText(t)}</span>
                </div>
              ))
            : null}
        </section>
      ))}
    </div>
  );

  const renderRefsInspectorBody = () => {
    const countsForBody = mode === 'learning' ? C0 : countStyleTokens(currentTokens);
    return (
      <>
        <div className="sp-sec">
          <h4>
            References<span>{mode === 'accepted' ? 3 : 2}</span>
          </h4>
          {STYLE_REFS.map((r) => (
            <RefCard key={r.id} r={r} mode={mode} onOpenRef={(id) => recordIntent('F193:open:' + id)} />
          ))}
          {mode === 'accepted' ? (
            <div className="sty-ref">
              <span className="sty-th" aria-hidden="true">
                <u className="a" />
                <u className="s" />
                <u className="s" />
                <u />
              </span>
              <div>
                <div className="t">
                  {STYLE_NEWREF.name}
                  <span>{STYLE_NEWREF.id}</span>
                </div>
                <small>
                  {STYLE_NEWREF.kind} · {STYLE_NEWREF.at}
                </small>
                <small>
                  <Icon name="spark" size={11} stroke={2.2} /> 1 new Inferred token · r4 unchanged
                </small>
              </div>
            </div>
          ) : null}
        </div>
        {mode === 'learning' ? (
          <div className="sp-sec">
            <h4>
              Learning job<span>real telemetry</span>
            </h4>
            <div className="sty-rule">
              <Icon name="spark" size={14} />
              <span>Sonnet 5.5 · Hosted · 6.1k tokens · 41 s so far · 9 credits reserved. Stop keeps what was read as a draft.</span>
            </div>
            <Btn
              label="Stop learning"
              sm
              does="Stops the job; tokens already read stay as an Inferred draft, nothing is accepted"
              feature="F183"
              onClick={() => switchMode('review')}
            />
          </div>
        ) : null}
        {mode === 'review' ? (
          <div className="sp-sec">
            <h4>
              Token states<span>{countsForBody.all} tokens</span>
            </h4>
            <div
              className="sty-cnt"
              role="img"
              aria-label={`${countsForBody.ok} accepted, ${countsForBody.inf} inferred, ${countsForBody.cf} conflict`}
            >
              <i className="ok" style={{ flex: countsForBody.ok }} />
              <i className="inf" style={{ flex: countsForBody.inf }} />
              {countsForBody.cf ? <i className="cf" style={{ flex: countsForBody.cf }} /> : null}
            </div>
            <div className="sty-lg">
              <span>
                Accepted <b>{countsForBody.ok}</b>
              </span>
              <span>
                Inferred <b>{countsForBody.inf}</b>
              </span>
              <span>
                Conflict <b>{countsForBody.cf}</b>
              </span>
            </div>
          </div>
        ) : null}
        {mode === 'review' ? (
          <div className="sty-rule sty-pad6">
            <Icon name="lock" size={14} />
            <span>Inferred tokens stay drafts. They never replace a confirmed token, and the spec changes only when S08 accepts a proposal.</span>
          </div>
        ) : null}
        {mode === 'accepted' ? (
          <div className="sp-sec">
            <h4>
              History<span>2</span>
            </h4>
            <div className="sp-row">
              <span className="id">r4</span>
              <span className="nm">
                DESIGN.md from P-021<small>Accepted 12:58 · Rina (sample)</small>
              </span>
              <Pill tone="ok" label="Current" />
            </div>
            <div className="sp-row">
              <span className="id">r3</span>
              <span className="nm">
                DESIGN.md<small>Accepted earlier</small>
              </span>
              <Btn
                label="Revert"
                sm
                does="Creates a new revision that restores r3; r4 stays in the history"
                feature="F191"
                onClick={() => recordIntent('F191:revert')}
              />
            </div>
          </div>
        ) : null}
      </>
    );
  };

  const renderInspector = () => {
    if (mode === 'conflict') {
      const accentHex = accentToken.v?.hex ?? '';
      const altHex = accentToken.alt?.hex ?? '';
      const confirmedContrast = STYLE_contrast(accentHex, WHITE_HEX);
      const inferredContrast = STYLE_contrast(altHex, WHITE_HEX);
      return (
        <Inspector
          title="Style references"
          pill={['bad', '2 conflicts']}
          sub="Inferred values that differ from confirmed ones."
          tabs={['References', 'Conflicts', 'History']}
          activeTab={inspTab}
          onSelectTab={setInspTab}
          onMore={() => recordIntent('F108:more')}
        >
          <div className="sp-sec">
            <h4>
              Conflict 1 of 2<span>Accent colour</span>
            </h4>
            <div className="sty-cmpd" data-feature="F187">
              <div className="sty-pk pick">
                <div className="lb">
                  Confirmed<span>r3</span>
                </div>
                <span className="big" style={{ '--c': accentToken.v?.css } as CSSProperties} />
                <div className="vv">
                  Clay <code>{accentHex}</code>
                </div>
                <span>
                  <span className="sp-btn ink sm sty-sbtn" style={{ '--c': accentToken.v?.css } as CSSProperties}>
                    Save
                  </span>
                </span>
                <div className="cr">White text {confirmedContrast}:1</div>
              </div>
              <div className="sty-pk">
                <div className="lb">
                  Inferred<span>REF-03</span>
                </div>
                <span className="big" style={{ '--c': accentToken.alt?.css } as CSSProperties} />
                <div className="vv">
                  Forest <code>{altHex}</code>
                </div>
                <span>
                  <span className="sp-btn ink sm sty-sbtn" style={{ '--c': accentToken.alt?.css } as CSSProperties}>
                    Save
                  </span>
                </span>
                <div className="cr">White text {inferredContrast}:1 · 6 elements</div>
              </div>
            </div>
            <div className="sty-rule">
              <Icon name="lock" size={14} />
              <span>Until you decide, r3 stays in force. The inferred value is not used by any design.</span>
            </div>
            <div className="sty-col6">
              <Btn
                label="Keep confirmed · recommended"
                cls="ink"
                does="Keeps clay (r3) and dismisses the inferred accent; no hunk is added to the proposal"
                feature="F187"
                onClick={() => recordIntent('F187:keep-confirmed')}
              />
              <Btn
                label="Propose the inferred one"
                does="Adds a hunk that changes the confirmed accent to forest; it still needs acceptance in S08"
                feature="F187"
                onClick={() => recordIntent('F187:propose-inferred')}
              />
              <Btn
                label="Decide later"
                cls="plain"
                does="Leaves the conflict open; the proposal keeps the confirmed value"
                feature="F187"
                onClick={() => switchMode('review')}
              />
            </div>
          </div>
          <div className="sp-sec">
            <h4>
              Conflict 2 of 2<span>Card radius</span>
            </h4>
            <div className="sp-row">
              <span className="nm">
                Confirmed 10 · inferred 16<small>REF-03 · 5 cards</small>
              </span>
              <StatePill state="cf" />
              <span />
            </div>
          </div>
        </Inspector>
      );
    }

    if (mode === 'markdown') {
      return (
        <Inspector
          title="Style references"
          pill={['warn', '1 edited']}
          sub="Same draft as the Visual tab. Edits here update the tokens there."
          tabs={['Outline', 'Checks', 'History']}
          activeTab={inspTab}
          onSelectTab={setInspTab}
          onMore={() => recordIntent('F108:more')}
        >
          <div className="sp-sec">
            <h4>
              Outline<span>R-DS-1 sections</span>
            </h4>
            <div className="sty-ol">
              {S30_OUTLINE.map(([n, s, t]) => (
                <div key={n}>
                  <span>{n}</span>
                  <StatePill state={s} label={t} />
                </div>
              ))}
            </div>
          </div>
          <div className="sp-sec">
            <h4>
              Checks<span>3</span>
            </h4>
            <div className="sty-rule">
              <Icon name="check" size={14} />
              <span>Markdown reads back to {C0.all} tokens, the same as the Visual tab.</span>
            </div>
            <div className="sty-rule">
              <Icon name="alert" size={14} />
              <span>Your edit on line 31 is marked Edited. It is not accepted until you promote it.</span>
            </div>
          </div>
        </Inspector>
      );
    }

    if (mode === 'promote') {
      return (
        <Inspector
          title="Style references"
          pill={['acc', 'Proposal']}
          sub="Per-hunk choice. S08 is where it is accepted."
          tabs={['Summary', 'Sources', 'Checks']}
          activeTab={inspTab}
          onSelectTab={setInspTab}
          onMore={() => recordIntent('F108:more')}
        >
          <div className="sp-sec">
            <h4>
              Targets<span>2 files</span>
            </h4>
            <div className="sty-ol">
              <div>
                <span>DESIGN.md</span>
                <Pill tone="mute" label="r3 to r4" />
              </div>
              <div>
                <span>tokens.json</span>
                <Pill tone="mute" label="r3 to r4" />
              </div>
            </div>
          </div>
          <div className="sp-sec">
            <h4>
              Included<span>{includedHunkCount} of {hunks.length} hunks</span>
            </h4>
            <div className="sty-rule">
              <Icon name="check" size={14} />
              <span>6 new tokens and 1 changed: Card radius 10 to 16, marked as a change to a confirmed token.</span>
            </div>
            <div className="sty-rule">
              <Icon name="x" size={14} />
              <span>Left out: half step 4 (you unticked it). Accent: kept confirmed.</span>
            </div>
          </div>
          <div className="sp-sec">
            <h4>
              Checks<span>R-DS-7</span>
            </h4>
            <div className="sty-rule">
              <Icon name="check" size={14} />
              <span>Source is the documented method, not runtime-verified. No brand text or assets copied.</span>
            </div>
            <div className="sty-rule">
              <Icon name="lock" size={14} />
              <span>Not auto-accepted. Accepting makes exactly one Revision.</span>
            </div>
          </div>
          <div className="sty-col6 t2">
            <Btn
              label="Send to review in S08"
              cls="ink"
              icon="diff"
              does="Opens S08 with this exact diff; nothing is written to the spec until you accept it there"
              feature="F189"
              onClick={() => switchMode('accepted')}
            />
            <Btn
              label="Back to style"
              does="Returns to the Visual tab with the same draft"
              feature="F189"
              onClick={() => switchMode('review')}
            />
          </div>
        </Inspector>
      );
    }

    const inspPill: PillTuple = mode === 'accepted' ? ['ok', 'r4'] : ['mute', '2 references'];
    const inspSub =
      mode === 'accepted'
        ? 'Style is in the spec. New references add Inferred tokens only.'
        : 'Images you imported in S28. They stay in this project.';
    return (
      <Inspector
        title="Style references"
        pill={inspPill}
        sub={inspSub}
        tabs={['References', 'Tokens', 'History']}
        activeTab={inspTab}
        onSelectTab={setInspTab}
        onMore={() => recordIntent('F108:more')}
      >
        {renderRefsInspectorBody()}
      </Inspector>
    );
  };

  const renderChatMessages = () => {
    if (mode === 'learning') {
      return (
        <>
          <div className="sp-ub">Learn the style from my two references.</div>
          <AiMessage
            text="Reading REF-02 and REF-03. Design requests wait until the style is ready, so every new frame uses it."
            meta="Sonnet 5.5 · 41 s so far"
          >
            <div className="sp-gc" aria-busy="true">
              <div className="k">
                <Icon name="spark" size={12} />
                Learning style
                <span className="tag">
                  <Pill tone="mute" label="Job 1 of 1" />
                </span>
              </div>
              <div className="sp-ck">
                <div>
                  <span className="bx on">
                    <Icon name="check" size={10} stroke={3} />
                  </span>
                  <span>REF-02 · all 5 steps</span>
                  <Pill tone="ok" label="Done" />
                </div>
                <div>
                  <span className="bx" />
                  <span>REF-03 · Find type, step 3 of 5</span>
                  <Pill tone="mute" label="Reading" />
                </div>
                <div>
                  <span className="bx" />
                  <span>Write the DESIGN.md draft</span>
                  <Pill tone="mute" label="Waiting" />
                </div>
              </div>
              <div className="ft">
                <span className="s">Learning accepts nothing. It only proposes.</span>
              </div>
            </div>
            <div className="sty-run" role="status">
              <span className="sty-spin" />
              <b>Learning style</b>
              <span className="mono">6.1k tokens · 41 s</span>
              <span className="sp-fill" />
              <Btn
                label="Stop"
                sm
                cls="plain"
                does="Stops the job; what was read stays as an Inferred draft"
                feature="F183"
                onClick={() => switchMode('review')}
              />
            </div>
          </AiMessage>
        </>
      );
    }

    if (mode === 'conflict') {
      const accentHex = accentToken.v?.hex ?? '';
      const altHex = accentToken.alt?.hex ?? '';
      return (
        <>
          <div className="sp-ub">Why is Accent a conflict?</div>
          <AiMessage
            text={`The accent in REF-03 is forest (${altHex}). DESIGN.md r3 says clay (${accentHex}), so r3 stays in force and I changed nothing. Card radius differs too: 10 confirmed, 16 inferred.`}
            meta="Sonnet 5.5 · 6 s · 3 cr"
          >
            <div className="sp-gc">
              <div className="k">
                <Icon name="alert" size={12} />
                Conflicts
                <span className="tag">
                  <Pill tone="bad" label="2 to decide" />
                </span>
              </div>
              <div className="sty-alt">
                <div className="r">
                  <span className="sty-c split sm" style={{ '--a': accentToken.v?.css, '--b': accentToken.alt?.css } as CSSProperties} />
                  <span>
                    Accent<small>Confirmed r3 against REF-03</small>
                  </span>
                  <Btn
                    label="Open"
                    sm
                    does="Scrolls to the Accent row and opens its conflict card"
                    feature="F187"
                    onClick={() => recordIntent('F187:open-accent')}
                  />
                </div>
                <div className="r">
                  <span className="sty-rs sm" />
                  <span>
                    Card radius<small>10 confirmed, 16 inferred</small>
                  </span>
                  <Btn
                    label="Open"
                    sm
                    does="Scrolls to the Card row and opens its conflict card"
                    feature="F187"
                    onClick={() => recordIntent('F187:open-card')}
                  />
                </div>
              </div>
            </div>
          </AiMessage>
          <div className="sp-sugg">
            <button
              type="button"
              data-does="Puts this prompt in the composer; nothing runs until Send"
              data-feature="F187"
              onClick={() => setView('design', { draft: 'Keep confirmed for both' })}
            >
              <Icon name="spark" size={13} />
              Keep confirmed for both
            </button>
            <button
              type="button"
              data-does="Puts this prompt in the composer; nothing runs until Send"
              data-feature="F187"
              onClick={() => setView('design', { draft: 'Draw F-03 with the inferred accent as a draft' })}
            >
              <Icon name="spark" size={13} />
              Draw F-03 with the inferred accent as a draft
            </button>
          </div>
        </>
      );
    }

    if (mode === 'markdown') {
      return (
        <>
          <div className="sp-ub">Use the caption style on tables only.</div>
          <AiMessage
            text="Changed line 31 in the draft. The caption token stays Inferred, so the spec is unchanged. The Visual tab shows the same edit."
            meta="Sonnet 5.5 · 4 s · 2 cr"
          >
            <div className="sp-gc">
              <div className="k">
                <Icon name="doc" size={12} />
                DESIGN.md draft
                <span className="tag">
                  <Pill tone="warn" label="Edited" />
                </span>
              </div>
              <div className="tt">type.caption · line 31</div>
              <div className="bd">
                <code>11 / 1.3 · 500 · caps</code> to <code>11 / 1.3 · 500 · caps, tables only</code>
              </div>
              <div className="ft">
                <span className="s">Draft only · not in r3</span>
                <Btn
                  label="Undo"
                  sm
                  does="Restores the line to the learned value"
                  feature="F188"
                  onClick={() => recordIntent('F188:undo-line31')}
                />
              </div>
            </div>
          </AiMessage>
        </>
      );
    }

    if (mode === 'promote') {
      return (
        <>
          <div className="sp-ub">Promote this style to the spec.</div>
          <AiMessage
            text="Prepared proposal P-021. It adds 6 tokens and changes Card radius. Nothing is written to the spec; S08 shows the exact diff first."
            meta="Sonnet 5.5 · 5 s · 3 cr"
          >
            <div className="sp-gc prop">
              <div className="k">
                <Icon name="diff" size={12} />
                Proposal
                <span className="tag">
                  <Pill tone="acc" label="Draft" />
                </span>
              </div>
              <div className="tt">P-021 · DESIGN.md r3 to r4</div>
              <div className="bd">
                {includedHunkCount} of {hunks.length} hunks included · 1 conflict kept confirmed
              </div>
              <div className="ft">
                <span className="s">Not stale · base r3</span>
                <Btn
                  label="Open in S08"
                  sm
                  cls="ink"
                  does="Opens S08 review with this proposal and its exact diff"
                  feature="F189"
                  onClick={() => switchMode('accepted')}
                />
              </div>
            </div>
          </AiMessage>
        </>
      );
    }

    if (mode === 'accepted') {
      return (
        <>
          <AiMessage
            text="DESIGN.md r4 is accepted. New designs use it. REF-04 arrived at 13:05, so Keep learning added one Inferred token. Nothing in r4 changed."
            meta="Sonnet 5.5 · 3 s · 2 cr"
          >
            <div className="sp-gc">
              <div className="k">
                <Icon name="check" size={12} />
                Accepted
                <span className="tag">
                  <Pill tone="ok" label="r4" />
                </span>
              </div>
              <div className="tt">Style is in the spec</div>
              <div className="bd">
                {C4.ok} tokens accepted · {C4.inf} inferred waiting · accent kept confirmed, card radius now 16.
              </div>
              <div className="ft">
                <span className="s">One accept, one Revision</span>
                <Btn
                  label="History"
                  sm
                  does="Opens the revision list of DESIGN.md"
                  feature="F191"
                  onClick={() => setInspTab('History')}
                />
              </div>
            </div>
          </AiMessage>
          <div className="sp-sugg">
            <button
              type="button"
              data-does="Puts this prompt in the composer; nothing runs until Send"
              data-feature="F192"
              onClick={() => setView('design', { draft: 'Review the new Inferred token' })}
            >
              <Icon name="spark" size={13} />
              Review the new Inferred token
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="sp-ub">Learn the style from my two references.</div>
        <AiMessage
          text={`Done. ${C0.ok} tokens match DESIGN.md r3, ${C0.inf} are new and ${C0.cf} differ from what is confirmed. Nothing is accepted yet.`}
        >
          <div className="sp-gc">
            <div className="k">
              <Icon name="layers" size={12} />
              Style summary
              <span className="tag">
                <Pill tone="mute" label="Draft" />
              </span>
            </div>
            <div className="tt">{C0.all} tokens from 2 references</div>
            <div className="sty-cnt" role="img" aria-label={`${C0.ok} accepted, ${C0.inf} inferred, ${C0.cf} conflict`}>
              <i className="ok" style={{ flex: C0.ok }} />
              <i className="inf" style={{ flex: C0.inf }} />
              <i className="cf" style={{ flex: C0.cf }} />
            </div>
            <div className="sty-lg">
              <span>
                Accepted <b>{C0.ok}</b>
              </span>
              <span>
                Inferred <b>{C0.inf}</b>
              </span>
              <span>
                Conflict <b>{C0.cf}</b>
              </span>
            </div>
            <div className="ft">
              <span className="s">Source: REF-02, REF-03</span>
              <Btn
                label="Review new"
                sm
                cls="ink"
                does="Filters the module stack to the Inferred tokens"
                feature="F185"
                onClick={() => setFilter('inf')}
              />
            </div>
          </div>
        </AiMessage>
        <div className="sp-sugg">
          <button
            type="button"
            data-does="Puts this prompt in the composer; nothing runs until Send"
            data-feature="F186"
            onClick={() => setView('design', { draft: 'Accept the 3 new colours' })}
          >
            <Icon name="spark" size={13} />
            Accept the 3 new colours
          </button>
          <button
            type="button"
            data-does="Puts this prompt in the composer; nothing runs until Send"
            data-feature="F193"
            onClick={() => setView('design', { draft: 'Show where Table band came from' })}
          >
            <Icon name="spark" size={13} />
            Show where Table band came from
          </button>
        </div>
      </>
    );
  };

  const filterCounts: StyleCounts =
    mode === 'learning'
      ? palOnly
      : mode === 'accepted'
        ? { ...C4, inf: C4.inf + 1, all: C4.all + 1 }
        : C0;

  const filterButtons: ['all' | 'ok' | 'inf' | 'cf', string, number][] = [
    ['all', 'All', filterCounts.all],
    ['ok', 'Accepted', filterCounts.ok],
    ['inf', 'Inferred', filterCounts.inf],
    ['cf', 'Conflict', filterCounts.cf],
  ];

  const modeBarRight = (() => {
    if (mode === 'learning') {
      return (
        <>
          <OffBtn
            label="Accept inferred"
            why="Available when learning ends, so you review the whole draft once"
            feature="F186"
          />
          <OffBtn
            label="Promote to spec"
            why="Available after you review the learned tokens"
            feature="F189"
            cls="ink"
            icon="diff"
          />
        </>
      );
    }
    if (mode === 'conflict') {
      return (
        <>
          <span className="sty-st warn">
            <Icon name="alert" size={12} />2 to decide
          </span>
          <Btn
            label={`Accept ${C0.inf} inferred`}
            icon="check"
            does="Accepts every Inferred token into the style draft (not the spec); conflicts stay open"
            feature="F186"
            onClick={() => recordIntent('F186:accept-all')}
          />
          <Btn
            label="Promote to spec"
            cls="ink"
            icon="diff"
            does="Opens the diff proposal for DESIGN.md r3 to r4; nothing is written until you accept it in S08"
            feature="F189"
            onClick={() => switchMode('promote')}
          />
        </>
      );
    }
    if (mode === 'markdown') {
      return (
        <>
          <Btn
            label="Copy"
            icon="clip"
            does="Copies the Markdown draft to the clipboard"
            feature="F188"
            onClick={() => recordIntent('F188:copy')}
          />
          <Btn
            label="Promote to spec"
            cls="ink"
            icon="diff"
            does="Opens the diff proposal for DESIGN.md r3 to r4; nothing is written until you accept it in S08"
            feature="F189"
            onClick={() => switchMode('promote')}
          />
        </>
      );
    }
    if (mode === 'promote') {
      return (
        <>
          <Btn
            label="Back to style"
            cls="plain"
            does="Returns to the Visual tab with the same draft"
            feature="F189"
            onClick={() => switchMode('review')}
          />
          <Btn
            label="Send to review in S08"
            cls="ink"
            icon="diff"
            does="Opens S08 with this exact diff; nothing is written to the spec until you accept it there"
            feature="F189"
            onClick={() => switchMode('accepted')}
          />
        </>
      );
    }
    if (mode === 'accepted') {
      return (
        <OffBtn
          label="Promote to spec"
          why="Nothing new is accepted yet: 2 Inferred tokens are waiting for review"
          feature="F189"
          cls="ink"
          icon="diff"
        />
      );
    }
    return (
      <>
        <span className="sty-hint">
          <kbd className="sty-kbd">A</kbd> accept <kbd className="sty-kbd">X</kbd> dismiss
        </span>
        <Btn
          label={`Accept ${C0.inf} inferred`}
          icon="check"
          does="Accepts every Inferred token into the style draft (not the spec); conflicts stay open"
          feature="F186"
          onClick={() => recordIntent('F186:accept-all')}
        />
        <Btn
          label="Promote to spec"
          cls="ink"
          icon="diff"
          does="Opens the diff proposal for DESIGN.md r3 to r4; nothing is written until you accept it in S08"
          feature="F189"
          onClick={() => switchMode('promote')}
        />
      </>
    );
  })();

  const tabsWithDirty = S30_TABS.map((t) => ({
    ...t,
    dirty: mode === 'markdown' && t.name === 'Style · learned',
  }));

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Design chat"
          sub="Style"
          ctxItems={ctxItems}
          ctxFoot={ctxFoot}
          placeholder="Ask about a token, or paste a style guide…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('design', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setView('design', { removedCtx: [...view.removedCtx, name] })}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setView('design', { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          {renderChatMessages()}
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label={mode === 'promote' ? 'Promote to spec' : 'Style review'}>
        <ArtifactTabs
          tabs={tabsWithDirty}
          activeTab="Style · learned"
          onSelect={(name) => recordIntent('F104:tab:' + name)}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={
            <>
              <Btn label="Share" icon="share" later="Share and comment links (deferred in the browser MVP, R-WS-3)" />
              <Btn
                label="Hand off"
                cls="ink"
                icon="download"
                does="Opens S34: downloads only accepted revisions with a fixed revision manifest"
                feature="F195"
                onClick={() => recordIntent('F195:handoff')}
              />
            </>
          }
        />

        <div className="sty-bar" aria-label="Style source">
          <div className="sp-seg" role="group" aria-label="Style source" data-feature="F181">
            <button
              type="button"
              aria-pressed="true"
              data-does="Uses the style learned from the imported references"
              data-feature="F181"
              onClick={() => switchMode('learning')}
            >
              <Icon name="spark" size={14} />
              Learned from references
            </button>
            <button
              type="button"
              aria-pressed="false"
              data-does="Designs with no learned style: only the yravg default tokens from DESIGN.md apply"
              data-feature="F181"
              onClick={() => recordIntent('F181:no-style')}
            >
              <Icon name="x" size={14} />
              No style
            </button>
            <button
              type="button"
              aria-pressed="false"
              data-does="Opens the list of saved styles of this project (2) to apply one"
              data-feature="F181"
              onClick={() => recordIntent('F181:saved')}
            >
              <Icon name="layers" size={14} />
              Saved styles<span className="sty-kbd">2</span>
            </button>
          </div>
          <span className="sp-fill" />
          <div className="sty-kl" data-feature="F182">
            <button
              type="button"
              className="sty-sw"
              role="switch"
              aria-checked={keepLearning}
              data-does="When on, every new reference adds Inferred tokens to this style; nothing confirmed is replaced"
              data-feature="F182"
              onClick={() => setKeepLearning((v) => !v)}
            >
              <span className="tr">
                <i />
              </span>
              Keep learning from new references
            </button>
            {mode === 'learning' ? (
              <span className="sty-st busy">
                <span className="sty-spin" />
                Learning · 1 of 2 references
              </span>
            ) : (
              <span className="sty-st">
                <Icon name="check" size={12} stroke={2.4} />
                {mode === 'accepted' ? 'Up to date with 3 references' : 'Up to date with 2 references'}
              </span>
            )}
          </div>
        </div>

        <div className="sty-bar b2">
          <div className="sty-mt" role="tablist" aria-label="Style view" data-feature="F184">
            <button
              type="button"
              role="tab"
              aria-selected={mode !== 'markdown'}
              data-does="Shows the visual summary: colours, type, spacing, radii, icons, sample controls"
              data-feature="F184"
              onClick={() => switchMode('review')}
            >
              <Icon name="grid" size={14} />
              Visual
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'markdown'}
              data-does="Shows DESIGN.md as editable Markdown; it is the same draft as the Visual tab"
              data-feature="F188"
              onClick={() => switchMode('markdown')}
            >
              <Icon name="doc" size={14} />
              Markdown
            </button>
          </div>
          <div className="sty-flt" role="group" aria-label="Filter tokens">
            {filterButtons.map(([k, l, n]) => (
              <button
                key={k}
                type="button"
                aria-pressed={k === filter}
                data-does={`Shows only ${l.toLowerCase()} tokens in the module stack`}
                data-feature="F185"
                onClick={() => {
                  setFilter(k);
                  if (k === 'cf') switchMode('conflict');
                }}
              >
                {l} <b>{n}</b>
              </button>
            ))}
          </div>
          <span className="sp-fill" />
          {modeBarRight}
        </div>

        {mode === 'learning' ? (
          <div className="sp-banner sty-info" role="status">
            <Icon name="spark" size={16} />
            <p>
              <b>Style is still learning.</b> New designs wait until it ends, so they use the finished style. Chat, frames and review keep working.
            </p>
          </div>
        ) : mode === 'accepted' ? (
          <div className="sp-banner sty-ok" role="status">
            <Icon name="check" size={16} />
            <p>
              <b>DESIGN.md r4 accepted.</b> Rina (sample) accepted P-021 in S08 at 12:58. Designs now use r4; r3 stays in the history.
            </p>
            <Btn
              label="Open history"
              sm
              does="Opens the revision list of DESIGN.md"
              feature="F191"
              onClick={() => setInspTab('History')}
            />
          </div>
        ) : null}

        <div className="sp-work">
          {mode === 'markdown' ? renderMarkdownEditor() : mode === 'promote' ? renderPromote() : renderVisual()}
          {renderInspector()}
        </div>
      </section>
    </>
  );
}
