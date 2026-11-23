import { useLayoutEffect, useState, type ReactNode } from 'react';
import { sampleData, type ContextItem, type PillTuple, type SampleDeliveryItem } from '../data/source';
const { DELIVERY_BLOCKED, DELIVERY_FILES, DELIVERY_FRAMEWORKS, DELIVERY_ITEMS, DELIVERY_MANIFEST, DELIVERY_PROMPT, DELIVERY_STALE, MODEL } = sampleData;
import { useWorkspace, type SaveState } from '../state/workspace';
import { Icon } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { MiniDashboard } from '../shell/MiniDashboard';

export type HandoffMode = 'select' | 'manifest' | 'ready' | 'copied' | 'blocked' | 'stale';
export type HandoffFilter = 'All' | 'Accepted' | 'Not ready';
export type HandoffRightTab = 'Manifest' | 'Files' | 'Agent prompt';

export interface HandoffShellOverride {
  save?: SaveState;
}

export interface HandoffManifestFrame {
  id: string;
  revision: string;
  size: string;
  html: string;
  screenshot: string;
  sha256: string;
}

export interface HandoffManifestDesign {
  id: string;
  revision: string;
  sha256: string;
}

export interface HandoffManifest {
  manifest: string;
  spec: string;
  framework: string;
  frames: HandoffManifestFrame[];
  design: HandoffManifestDesign | null;
  excluded: string[];
  missingInputs: string[];
  guide: string;
  shareLink: null;
}

export function deliveryItemKey(item: Pick<SampleDeliveryItem, 'id' | 'kind'>): string {
  return `${item.id}:${item.kind}`;
}

export function isSelectableForHandoff(item: SampleDeliveryItem, staleDesign = false): boolean {
  if (item.reason) return false;
  if (item.kind !== 'frame' && item.kind !== 'design') return false;
  if (item.kind === 'design' && staleDesign) return false;
  return true;
}

export function buildHandoffManifest(opts: {
  manifestId: string;
  specRev: string;
  framework: string;
  items: readonly SampleDeliveryItem[];
  selectedKeys: readonly string[];
  staleDesign?: boolean;
  missingInputs?: readonly string[];
}): HandoffManifest {
  const selected = new Set(opts.selectedKeys);
  const frames: HandoffManifestFrame[] = [];
  let design: HandoffManifestDesign | null = null;
  const excluded: string[] = [];

  for (const item of opts.items) {
    const key = deliveryItemKey(item);
    if (!isSelectableForHandoff(item, opts.staleDesign)) {
      if (item.kind === 'frame') excluded.push(`${item.id} draft`);
      else if (item.kind === 'takes') excluded.push(`${item.id} takes`);
      else if (item.kind === 'ref') excluded.push(item.id);
      else if (item.kind === 'design') excluded.push(`${item.id} stale`);
      continue;
    }
    if (!selected.has(key)) continue;
    if (item.kind === 'frame') {
      frames.push({
        id: item.id,
        revision: item.rev,
        size: item.size.replace(/\s*×\s*/g, 'x'),
        html: `frames/${item.id}-${item.rev}.html`,
        screenshot: `frames/${item.id}-${item.rev}.png`,
        sha256: item.sha ?? '',
      });
    } else if (item.kind === 'design') {
      design = {
        id: item.id,
        revision: item.rev,
        sha256: item.sha ?? '',
      };
    }
  }

  return {
    manifest: opts.manifestId,
    spec: opts.specRev,
    framework: opts.framework,
    frames,
    design,
    excluded,
    missingInputs: [...(opts.missingInputs ?? [])],
    guide: 'GUIDE.md',
    shareLink: null,
  };
}

export function serializeHandoffExport(manifest: HandoffManifest): string {
  return JSON.stringify(
    {
      manifest: manifest.manifest,
      spec: manifest.spec,
      framework: manifest.framework,
      frames: manifest.frames,
      design: manifest.design,
      excluded: manifest.excluded,
      missing_inputs: manifest.missingInputs,
      guide: manifest.guide,
      share_link: manifest.shareLink,
    },
    null,
    2,
  );
}

const HANDOFF_TABS: ArtifactTabItem[] = [
  { icon: 'grid', name: 'Variance flows' },
  { icon: 'frame', name: 'F-03 Variance table' },
  { icon: 'download', name: 'Hand off' },
];

const HANDOFF_CTX: ContextItem[] = [
  ['frame', 'F-01 Portfolio overview', 'r4'],
  ['frame', 'F-03 Variance table', 'r6'],
  ['doc', 'DESIGN.md', 'r3'],
];

const COLS = [124, 38, 90, 86, 74, 86, 132];

const [F01, F03, F04, TAKES, REF, DSG] = DELIVERY_ITEMS as [
  SampleDeliveryItem,
  SampleDeliveryItem,
  SampleDeliveryItem,
  SampleDeliveryItem,
  SampleDeliveryItem,
  SampleDeliveryItem,
];

function DeliveryIcon({ name, size = 14, stroke = 1.75 }: { name: 'box' | 'copy' | 'refresh'; size?: number; stroke?: number }) {
  return (
    <svg
      className="ic"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'box' ? (
        <>
          <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
          <path d="M3 8l9 5 9-5M12 13v8" />
        </>
      ) : name === 'copy' ? (
        <>
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </>
      ) : (
        <>
          <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
          <path d="M21 3v5h-5" />
        </>
      )}
    </svg>
  );
}

function ItemThumb({ item }: { item: SampleDeliveryItem }) {
  if (item.thumb) {
    return (
      <MiniDashboard
        title={item.thumb.title}
        kpi={false}
        chart={Boolean(item.thumb.chart)}
        table={!item.thumb.chart}
        rows={2}
        drawer={Boolean(item.thumb.drawer)}
        h={48}
      />
    );
  }
  return <Icon name={item.kind === 'ref' ? 'image' : 'doc'} size={20} stroke={1.5} />;
}

function ItemRow(props: {
  item: SampleDeliveryItem;
  on?: boolean;
  dis?: boolean;
  rev?: string;
  bad?: boolean;
  st?: PillTuple[0];
  stText?: string;
  when?: string;
  reason?: string;
  onToggle?: () => void;
}) {
  const { item, on = false, bad = false, onToggle } = props;
  const dis = props.dis ?? Boolean(item.reason);
  const rev = props.rev ?? item.rev;
  const why = props.reason ?? item.reason;
  const st = props.st ?? item.st;
  const stText = props.stText ?? item.stText;
  const when = props.when ?? item.when;
  const does = dis
    ? `Cannot be ticked. ${why}`
    : `${on ? 'Removes' : 'Adds'} ${item.id} ${rev} ${on ? 'from' : 'to'} the hand-off; the manifest on the right updates at once`;

  return (
    <button
      type="button"
      role="checkbox"
      className={`del-it${bad ? ' bad' : ''}`}
      aria-checked={dis ? false : on}
      aria-disabled={dis ? true : undefined}
      data-does={does}
      data-feature={dis ? 'F263' : 'F262'}
      onClick={dis ? undefined : onToggle}
    >
      <span className="del-bx">
        {on ? <Icon name="check" size={11} stroke={3} /> : dis ? <Icon name="lock" size={10} stroke={2} /> : null}
      </span>
      <span className="del-th">
        <ItemThumb item={item} />
      </span>
      <span className="t">
        <b>
          {item.id}
          <i>{rev}</i>
        </b>
        <span>
          {item.name}
          {item.size ? ' · ' + item.size : ''}
        </span>
        {why ? (
          <span className={`why${bad ? ' bad' : ''}`}>
            <Icon name="alert" size={12} />
            {why}
          </span>
        ) : (
          <span>{when}</span>
        )}
      </span>
      <span className="s">
        <Pill tone={st} label={stText} />
      </span>
    </button>
  );
}

function SubHead({ title, right }: { title: string; right?: string }) {
  return (
    <div className="del-sub">
      {title}
      {right ? <span>{right}</span> : null}
    </div>
  );
}

function ManifestRow(props: {
  item: SampleDeliveryItem;
  cls?: string;
  rev?: string;
  sha?: string;
  html?: string;
  png?: string;
  onSelect: () => void;
}) {
  const { item, cls = '', onSelect } = props;
  const isDesign = item.kind === 'design';
  const rev = props.rev ?? item.rev;
  const sha = props.sha ?? item.sha ?? '';
  const html = props.html ?? item.html ?? '';
  const png = props.png ?? item.png ?? '';
  const guide = isDesign ? 'GUIDE.md#design' : `GUIDE.md#${item.id}`;
  return (
    <tr className={cls}>
      <td className="f">
        <button
          type="button"
          className="rb"
          data-does={`Shows the full sha256 and file names of ${item.id} ${rev} in manifest.json`}
          data-feature="F264"
          onClick={onSelect}
        >
          <b>{item.id}</b>
          <small>{item.name}</small>
        </button>
      </td>
      <td>
        <code>{rev}</code>
      </td>
      <td>{isDesign ? 'Markdown' : item.size}</td>
      <td>
        <code>{sha.slice(0, 8)}…</code>
      </td>
      <td>{html}</td>
      <td>{isDesign ? 'none' : png}</td>
      <td>
        <code>{guide}</code>
      </td>
    </tr>
  );
}

function ManifestTable({ children }: { children: ReactNode }) {
  const headers = ['Frame', 'Rev', 'Size', 'sha256', 'HTML', 'Screenshot', 'Guide file'];
  return (
    <table className="sp-tbl del-mt">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={h} style={{ width: `${COLS[i]}px` }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function CodeBlock({ label, lines }: { label: string; lines: readonly [string, string][] }) {
  return (
    <div className="del-code" aria-label={label}>
      {lines.map(([text, cls], idx) => (
        <div key={idx} className={cls}>
          <i>{idx + 1}</i>
          {text}
        </div>
      ))}
    </div>
  );
}

function CheckCard(props: {
  rows: readonly [boolean, string, PillTuple][];
  tag: PillTuple;
  foot: string;
  onShowTable: () => void;
}) {
  const { rows, tag, foot, onShowTable } = props;
  return (
    <div className="sp-gg" data-feature="F273">
      <div className="gh">
        <span>Hand-off check · {rows.length} items</span>
        <button type="button" data-does="Shows the check as a plain table" data-feature="F273" onClick={onShowTable}>
          Show as table
        </button>
      </div>
      <div className="sp-gc">
        <div className="k">
          <Icon name="lock" size={12} />
          Before the file is made
          <span className="tag">
            <Pill tone={tag[0]} label={tag[1]} />
          </span>
        </div>
        <div className="sp-ck">
          {rows.map(([on, text, p]) => (
            <div key={text}>
              <span className={`bx ${on ? 'on' : ''}`}>{on ? <Icon name="check" size={10} stroke={3} /> : null}</span>
              <span>{text}</span>
              <Pill tone={p[0]} label={p[1]} />
            </div>
          ))}
        </div>
        <div className="ft">
          <span className="s">{foot}</span>
        </div>
      </div>
    </div>
  );
}

const CHAT_CONTENT: Record<
  HandoffMode,
  {
    user: string;
    reply: string;
    rows: [boolean, string, PillTuple][];
    tag: PillTuple;
    foot: string;
    suggs: string[];
  }
> = {
  select: {
    user: 'Hand off F-01 and the design guide.',
    reply:
      'Ticked F-01 r4 and DESIGN.md r3. F-03 r6 is accepted too; tick it when you want it in. F-04 stays out because it is a draft.',
    rows: [
      [true, 'Only accepted revisions', ['ok', 'Yes']],
      [true, 'DESIGN.md is fresh', ['ok', 'r3']],
      [true, 'No keys, .env or private references', ['ok', 'Clear']],
      [false, 'F-04 draft is left out', ['warn', 'Draft']],
    ],
    tag: ['ok', 'Ready'],
    foot: 'Checked 12:44 on the server',
    suggs: ['Tick F-03 r6 as well', 'Explain why F-04 is left out'],
  },
  manifest: {
    user: 'Show me exactly what goes in the bundle.',
    reply:
      'The manifest lists F-01 r4, F-03 r6 and DESIGN.md r3 with their hashes. It is fixed when you download or copy; a later edit makes a new one.',
    rows: [
      [true, 'Only accepted revisions', ['ok', 'Yes']],
      [true, 'Every file has a sha256', ['ok', '5 of 5']],
      [true, 'Guide file included', ['ok', 'GUIDE.md']],
    ],
    tag: ['ok', 'Ready'],
    foot: 'Checked 12:45 on the server',
    suggs: ['Compare with the last manifest', 'Copy the bundle'],
  },
  ready: {
    user: 'Make the hand-off zip.',
    reply: 'Ready: 7 files, about 0.5 MB, React guide. Download seals manifest m-0007.',
    rows: [
      [true, 'Only accepted revisions', ['ok', 'Yes']],
      [true, 'DESIGN.md is fresh', ['ok', 'r3']],
      [true, 'No keys, .env or private references', ['ok', 'Clear']],
      [true, 'Zip under 25 MB', ['ok', '0.5 MB']],
    ],
    tag: ['ok', 'All clear'],
    foot: 'Checked 12:46 on the server',
    suggs: ['Download the zip', 'Copy for a coding agent instead'],
  },
  copied: {
    user: 'Copy it for my coding agent.',
    reply:
      'Copied. The text lists F-01 r4 and F-03 r6 with their hashes, points to GUIDE.md first, and leaves F-04 out.',
    rows: [
      [true, 'Only accepted revisions', ['ok', 'Yes']],
      [true, 'No keys, .env or private references', ['ok', 'Clear']],
      [true, 'Manifest m-0007 sealed', ['ok', '12:47']],
    ],
    tag: ['ok', 'Copied'],
    foot: 'Export recorded: Rina, 12:47',
    suggs: ['Show me the pasted text', 'Make a zip as well'],
  },
  blocked: {
    user: 'Hand off everything I picked yesterday.',
    reply: 'Two of the three picks are not ready. F-03 moved from r5 to r6, and F-04 is still a draft.',
    rows: [
      [true, 'F-01 r4 is accepted', ['ok', 'Yes']],
      [false, 'F-03 r5 is the accepted revision', ['bad', 'Stale']],
      [false, 'F-04 r1 is accepted', ['warn', 'Draft']],
    ],
    tag: ['bad', 'Blocked'],
    foot: 'Fix 2 items to continue',
    suggs: ['Use the accepted revisions', 'Why is F-04 a draft?'],
  },
  stale: {
    user: 'F-03 r7 is accepted. Hand off again.',
    reply:
      'F-03 r7 is in. DESIGN.md r3 no longer matches the frames, so I left it out. Re-finalize it and I will add it back.',
    rows: [
      [true, 'Only accepted revisions', ['ok', 'Yes']],
      [false, 'DESIGN.md matches the frames', ['warn', 'Stale r3']],
      [true, 'No keys, .env or private references', ['ok', 'Clear']],
    ],
    tag: ['warn', '1 to fix'],
    foot: 'Checked 12:53 on the server',
    suggs: ['Re-finalize DESIGN.md', 'Compare m-0007 and m-0008'],
  },
};

const MANIFEST_JSON_LINES: [string, string][] = [
  ['{', ''],
  ['  "manifest": "m-0007", "spec": "r14", "framework": "react",', 'dim'],
  ['  "frames": [', ''],
  ['    { "id": "F-03", "revision": "r6", "size": "1440x900",', 'add'],
  ['      "html": "frames/F-03-r6.html", "screenshot": "frames/F-03-r6.png",', 'add'],
  [`      "sha256": "${(F03.sha ?? '').slice(0, 32)}…" },`, 'add'],
  ['    …1 more frame', 'dim'],
  ['  ],', ''],
  ['  "excluded": ["F-04 draft", "F-03 takes", "REF-02"], "guide": "GUIDE.md"', 'dim'],
  ['}', ''],
];

// S34 Coding hand-off. Board: docs/design/spekin-canvas/project/S34-coding-handoff.dc.html (data-screen="S34").
export function CodingHandoffWorkArea(props: {
  initialMode?: HandoffMode;
  onShellOverride?: (override: HandoffShellOverride) => void;
  onOpenShell?: () => void;
  onOpenReview?: () => void;
}) {
  const initialMode = props.initialMode ?? 'select';
  const [mode, setMode] = useState<HandoffMode>(initialMode);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() =>
    initialMode === 'select'
      ? [deliveryItemKey(F01), deliveryItemKey(DSG)]
      : initialMode === 'stale'
        ? [deliveryItemKey(F01), deliveryItemKey(F03)]
        : [deliveryItemKey(F01), deliveryItemKey(F03), deliveryItemKey(DSG)],
  );
  const [filter, setFilter] = useState<HandoffFilter>('All');
  const [framework, setFramework] = useState<string>('react');
  const [toastOpen, setToastOpen] = useState<boolean>(initialMode === 'copied');
  const [removedCtx, setRemovedCtx] = useState<string[]>([]);

  const view = useWorkspace((s) => s.view('design'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  useLayoutEffect(() => {
    if (!props.onShellOverride) return;
    props.onShellOverride({
      save: { status: 'saved', tone: 'ok', text: mode === 'stale' ? 'Saved 12:53' : 'Saved 12:41' },
    });
  }, [mode, props.onShellOverride]);

  const hasF01 = selectedKeys.includes(deliveryItemKey(F01));
  const hasF03 = selectedKeys.includes(deliveryItemKey(F03));
  const hasDsg = selectedKeys.includes(deliveryItemKey(DSG));
  const frameCount = (hasF01 ? 1 : 0) + (hasF03 ? 1 : 0);
  const acceptedTickedCount = frameCount + (mode !== 'stale' && hasDsg ? 1 : 0);
  const fwName = DELIVERY_FRAMEWORKS.find(([id]) => id === framework)?.[1] ?? 'React';

  const toggleItem = (item: SampleDeliveryItem) => {
    const key = deliveryItemKey(item);
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const selectAllAccepted = () => {
    if (mode === 'stale') {
      setSelectedKeys([deliveryItemKey(F01), deliveryItemKey(F03)]);
    } else {
      setSelectedKeys([deliveryItemKey(F01), deliveryItemKey(F03), deliveryItemKey(DSG)]);
    }
  };

  const clearSelection = () => setSelectedKeys([]);

  const rightTab: HandoffRightTab =
    mode === 'ready' ? 'Files' : mode === 'copied' ? 'Agent prompt' : 'Manifest';

  const manifestCount: number | '' =
    mode === 'ready'
      ? 7
      : mode === 'copied'
        ? ''
        : mode === 'blocked'
          ? 3
          : mode === 'stale'
            ? 2
            : acceptedTickedCount;

  const ctxItems = HANDOFF_CTX.filter(([, name]) => !removedCtx.includes(name));
  const chat = CHAT_CONTENT[mode];

  const f03Stale: SampleDeliveryItem = {
    ...F03,
    rev: DELIVERY_STALE.rev,
    when: `Accepted ${DELIVERY_STALE.at}`,
    sha: DELIVERY_STALE.sha,
    html: DELIVERY_STALE.html,
    png: DELIVERY_STALE.png,
    st: 'ok',
    stText: `Accepted ${DELIVERY_STALE.rev}`,
  };
  const dsgStale: SampleDeliveryItem = {
    ...DSG,
    st: 'warn',
    stText: 'Stale',
  };

  const showAcceptedGroup = filter === 'All' || filter === 'Accepted';
  const showNotReadyGroup = filter === 'All' || filter === 'Not ready';

  const leftFoot =
    mode === 'blocked'
      ? '3 ticked · 2 need fixing'
      : `${acceptedTickedCount} of 3 accepted ticked`;

  const zipFiles = DELIVERY_FILES.filter(
    ([name]) => (hasDsg || name !== 'DESIGN.md') && (frameCount === 2 || !name.includes('F-03')),
  );
  const topFiles = zipFiles.filter(([name]) => !name.includes('/'));
  const frameFiles = zipFiles.filter(([name]) => name.includes('/'));

  const promptLines: [string, string][] = DELIVERY_PROMPT.map((line, i) => [
    line,
    i === 0 || line === 'Frames, accepted revisions only' ? 'hl' : /^ /.test(line) ? 'dim' : '',
  ]);

  const sumTitle =
    mode === 'blocked'
      ? '2 items need fixing'
      : mode === 'stale'
        ? '2 frames · guide · DESIGN.md left out'
        : `${frameCount === 2 ? '2 frames' : '1 frame'}${hasDsg ? ' · DESIGN.md' : ''} · guide`;

  const sumSub =
    mode === 'blocked'
      ? 'Off until every ticked item is accepted'
      : mode === 'copied'
        ? `Copied ${DELIVERY_MANIFEST.sealedAt} · manifest ${DELIVERY_MANIFEST.id} sealed`
        : mode === 'stale'
          ? `≈ 0.5 MB · spec ${DELIVERY_MANIFEST.spec} · ${fwName} · makes ${DELIVERY_MANIFEST.next}`
          : `≈ ${frameCount === 2 ? '0.5' : '0.2'} MB · spec ${DELIVERY_MANIFEST.spec} · ${fwName}`;

  const handleCopy = () => {
    setMode('copied');
    setToastOpen(true);
    recordIntent('F267:copy');
  };

  const handleDownload = () => {
    setMode('ready');
    recordIntent('F266:download');
  };

  const tabRight = (
    <>
      <Btn label="Share" icon="share" later="Share and comment links (deferred in the browser MVP, R-WS-3)" />
      <Btn
        label="Hand off"
        cls="ink"
        icon="download"
        does="This screen is already open; the button reopens it with your last selection"
        feature="F261"
        onClick={() => recordIntent('F261:reopen')}
      />
    </>
  );

  const dlButton = (
    <Btn
      label={
        <>
          <DeliveryIcon name="box" />
          Download zip
          <span className="del-kbd">⌘↵</span>
        </>
      }
      cls="ink"
      does="Runs the privacy check, seals the manifest, then saves the zip; the server records who exported what"
      feature="F266"
      onClick={handleDownload}
    />
  );

  const cpButton = (
    <Btn
      label={
        <>
          <DeliveryIcon name="copy" />
          Copy for a coding agent
          <span className="del-kbd">⌘⇧C</span>
        </>
      }
      does="Copies one text block with the frame files, hashes and the guide for the chosen framework; a toast says what was copied"
      feature="F267"
      onClick={handleCopy}
    />
  );

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Design chat"
          sub="hand-off"
          ctxItems={ctxItems}
          ctxFoot="≈ 6.2k tokens · accepted revisions only"
          placeholder="Ask what is in the hand-off, or @ a frame…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('design', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setRemovedCtx((prev) => [...prev, name])}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setView('design', { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          <div className="sp-ub">{chat.user}</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin
              <em>Sonnet 5.5 · 12 s · 6 cr</em>
            </div>
            <p>{chat.reply}</p>
            <CheckCard
              rows={chat.rows}
              tag={chat.tag}
              foot={chat.foot}
              onShowTable={() => recordIntent('F273:table')}
            />
          </div>
          <div className="sp-sugg">
            {chat.suggs.map((prompt) => (
              <button
                key={prompt}
                type="button"
                data-does="Puts this prompt in the composer; nothing runs until Send"
                data-feature="F273"
                onClick={() => setView('design', { draft: prompt })}
              >
                <Icon name="spark" size={13} />
                {prompt}
              </button>
            ))}
          </div>
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={HANDOFF_TABS}
          activeTab="Hand off"
          onSelect={(tab) => {
            if (tab === 'Variance flows' && props.onOpenShell) props.onOpenShell();
            else recordIntent('F104:tab:' + tab);
          }}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={tabRight}
        />

        {mode === 'blocked' ? (
          <div className="sp-banner bad" role="alert" data-feature="F270">
            <Icon name="alert" size={16} />
            <p>
              <b>Hand-off blocked.</b> 2 ticked items are not accepted revisions. Fix them or remove them; nothing is
              bundled until then.
            </p>
            <Btn
              label="Use accepted revisions"
              sm
              cls="ink"
              does="Swaps F-03 r5 for the accepted r6 and removes the draft F-04; accepts nothing"
              feature="F270"
              onClick={() => {
                setSelectedKeys([deliveryItemKey(F01), deliveryItemKey(F03), deliveryItemKey(DSG)]);
                setMode('manifest');
              }}
            />
            <Btn
              label="Open review (S33)"
              sm
              does="Opens S33 so the draft F-04 can be reviewed and accepted there"
              feature="F270"
              onClick={() => {
                if (props.onOpenReview) props.onOpenReview();
                else recordIntent('F270:review');
              }}
            />
          </div>
        ) : null}

        {mode === 'stale' ? (
          <div className="sp-banner warn" role="status" data-feature="F271">
            <Icon name="alert" size={16} />
            <p>
              <b>DESIGN.md r3 is stale.</b> F-03 changed to r7 at 12:52, after it was finalized. Manifest m-0007 stays
              as exported; this selection makes m-0008.
            </p>
            <Btn
              label="Compare manifests"
              sm
              does="Shows m-0007 as exported and the draft m-0008 side by side; neither is changed"
              feature="F265"
              onClick={() => recordIntent('F265:compare')}
            />
          </div>
        ) : null}

        <div className="sp-tool">
          <span className="sp-crumb">
            Design
            <Icon name="chevR" size={12} />
            <b>Coding hand-off</b>
          </span>
          <span className="del-chip">
            <Icon name="lock" size={12} />
            Accepted revisions only
          </span>
          <span className="sp-fill" />
          <Btn
            label="Whole-spec export (S25)"
            sm
            icon="doc"
            does="Opens S25, which exports the whole living spec. A hand-off does not replace it"
            feature="F272"
            onClick={() => recordIntent('F272:export-s25')}
          />
          <IconBtn
            icon="history"
            label="Hand-off history"
            does="Lists earlier hand-offs: manifest, who, when. They never change"
            sm
            feature="F274"
            onClick={() => setMode('blocked')}
          />
        </div>

        <div className="del-body">
          <section className="del-left del-col" aria-label="Select revisions" data-feature="F262">
            <div className="del-h">
              <h3>Select revisions</h3>
              <span className="n">6</span>
              <span className="sp-fill" />
              <div className="sp-seg" role="group" aria-label="Filter">
                {(
                  [
                    ['All', 6, 'every item'],
                    ['Accepted', 3, 'only accepted revisions'],
                    ['Not ready', 3, 'drafts, takes and references'],
                  ] as const
                ).map(([v, n, desc]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={filter === v}
                    data-does={`Shows ${desc}`}
                    data-feature="F263"
                    onClick={() => setFilter(v)}
                  >
                    {v} {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="del-list">
              {mode === 'blocked' ? (
                <>
                  {showAcceptedGroup ? (
                    <>
                      <SubHead title="Selection from yesterday" right="restored" />
                      <ItemRow item={F01} on={true} onToggle={() => recordIntent('F262:toggle:F-01')} />
                      <ItemRow
                        item={F03}
                        on={true}
                        rev="r5"
                        bad={true}
                        st="bad"
                        stText="Stale r5"
                        reason="r6 was accepted at 12:20. This is r5."
                        dis={false}
                        onToggle={() => recordIntent('F262:toggle:F-03')}
                      />
                      <ItemRow
                        item={F04}
                        on={true}
                        bad={true}
                        st="warn"
                        stText="Draft"
                        dis={false}
                        onToggle={() => recordIntent('F262:toggle:F-04')}
                      />
                    </>
                  ) : null}
                  {showNotReadyGroup ? (
                    <>
                      <SubHead title="Not ready" right="greyed, with the reason" />
                      <ItemRow item={TAKES} />
                      <ItemRow item={REF} />
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  {showAcceptedGroup ? (
                    <>
                      <SubHead title="Accepted revisions" right="3 can be handed off" />
                      <ItemRow item={F01} on={hasF01} onToggle={() => toggleItem(F01)} />
                      {mode === 'stale' ? (
                        <>
                          <ItemRow
                            item={f03Stale}
                            on={hasF03}
                            st="ok"
                            stText="Accepted r7"
                            onToggle={() => toggleItem(F03)}
                          />
                          <ItemRow
                            item={dsgStale}
                            dis={true}
                            reason="Stale: F-03 r7 was accepted after it was finalized."
                          />
                        </>
                      ) : (
                        <>
                          <ItemRow item={F03} on={hasF03} onToggle={() => toggleItem(F03)} />
                          <ItemRow item={DSG} on={hasDsg} onToggle={() => toggleItem(DSG)} />
                        </>
                      )}
                    </>
                  ) : null}
                  {showNotReadyGroup ? (
                    <>
                      <SubHead title="Not ready" right="greyed, with the reason" />
                      <ItemRow item={F04} />
                      <ItemRow item={TAKES} />
                      <ItemRow item={REF} />
                    </>
                  ) : null}
                </>
              )}
            </div>

            <div className="del-lf">
              <Btn
                label={
                  <>
                    Select all accepted
                    <span className="del-kbd">⌘A</span>
                  </>
                }
                sm
                does="Ticks every accepted revision; drafts, takes and references are never ticked"
                feature="F263"
                onClick={selectAllAccepted}
              />
              <Btn label="Clear" sm cls="plain" does="Unticks everything" feature="F262" onClick={clearSelection} />
              <span className="sp-fill" />
              <span>{leftFoot}</span>
            </div>
          </section>

          <section className="del-right del-col" aria-label="Hand-off bundle" data-feature="F264">
            <div className="del-rt">
              <div className="tabs" role="tablist">
                {(
                  [
                    ['Manifest', 'F264', manifestCount],
                    ['Files', 'F266', ''],
                    ['Agent prompt', 'F269', ''],
                  ] as const
                ).map(([label, feature, count]) => (
                  <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={rightTab === label}
                    data-does={`Shows the ${label.toLowerCase()} of this hand-off`}
                    data-feature={feature}
                    onClick={() => {
                      if (label === 'Manifest') setMode(hasF03 ? 'manifest' : 'select');
                      else if (label === 'Files') setMode('ready');
                      else {
                        setMode('copied');
                        setToastOpen(true);
                      }
                    }}
                  >
                    {label}
                    {count !== '' ? <span className="c">{count}</span> : null}
                  </button>
                ))}
              </div>
              <span className="sp-fill" />
              <div className="fin">
                {mode === 'stale' ? (
                  <>
                    <span className="del-chip warn">
                      <Icon name="alert" size={12} />
                      DESIGN.md r3 stale
                    </span>
                    <Btn
                      label="Re-finalize (spec is stale)"
                      sm
                      cls="ink"
                      does="Regenerates DESIGN.md from the accepted frames, with a spinner and Cancel; marks it fresh when done"
                      feature="F271"
                      onClick={() => recordIntent('F271:refinalize')}
                    />
                  </>
                ) : (
                  <>
                    <span className="del-chip seal">
                      <Icon name="check" size={12} stroke={2.5} />
                      DESIGN.md r3 fresh
                    </span>
                    <Btn
                      label="Re-finalize"
                      sm
                      does="Regenerates DESIGN.md from the accepted frames only; changes no frame"
                      feature="F271"
                      onClick={() => recordIntent('F271:refinalize')}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="del-rb">
              <div className="del-meta">
                <span className="del-fwl">Code framework</span>
                <div className="sp-seg" role="group" aria-label="Code framework">
                  {DELIVERY_FRAMEWORKS.map(([id, name]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={framework === id}
                      data-does={`Writes ${name} into GUIDE.md and the pasted prompt; the frame files do not change`}
                      data-feature="F267"
                      onClick={() => setFramework(id)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <span className="sp-fill" />
                {mode === 'select' ? (
                  <span className="del-chip">
                    Manifest <b>{DELIVERY_MANIFEST.id}</b> · draft
                  </span>
                ) : mode === 'manifest' ? (
                  <span className="del-chip">
                    Manifest <b>{DELIVERY_MANIFEST.id}</b> · draft, seals on Download or Copy
                  </span>
                ) : mode === 'ready' ? (
                  <span className="del-chip seal">
                    <Icon name="check" size={12} stroke={2.5} />
                    Privacy check passed
                  </span>
                ) : mode === 'copied' ? (
                  <span className="del-chip seal">
                    <Icon name="lock" size={12} />
                    Manifest <b>{DELIVERY_MANIFEST.id}</b> sealed {DELIVERY_MANIFEST.sealedAt}
                  </span>
                ) : mode === 'blocked' ? (
                  <span className="del-chip warn">
                    Manifest <b>{DELIVERY_MANIFEST.id}</b> cannot be made
                  </span>
                ) : (
                  <span className="del-chip">
                    Manifest <b>{DELIVERY_MANIFEST.next}</b> · draft
                  </span>
                )}
              </div>

              {mode === 'select' ? (
                <>
                  <ManifestTable>
                    {hasF01 ? <ManifestRow item={F01} onSelect={() => setMode('manifest')} /> : null}
                    {hasF03 ? <ManifestRow item={F03} onSelect={() => setMode('manifest')} /> : null}
                    {hasDsg ? <ManifestRow item={DSG} onSelect={() => setMode('manifest')} /> : null}
                    {!hasF03 ? (
                      <tr className="gone">
                        <td colSpan={7}>F-03 Variance table r6 · not ticked yet</td>
                      </tr>
                    ) : null}
                  </ManifestTable>
                  <SubHead title="Also in the zip" right="always included" />
                  <div className="del-chips">
                    <span className="del-chip">
                      <Icon name="doc" size={12} />
                      <b>manifest.json</b>
                    </span>
                    <span className="del-chip">
                      <Icon name="doc" size={12} />
                      <b>GUIDE.md</b>
                    </span>
                  </div>
                  <SubHead title="Left out" right="3 items" />
                  <div className="del-chips">
                    <span className="del-chip warn">F-04 draft</span>
                    <span className="del-chip">F-03 pending takes</span>
                    <span className="del-chip">REF-02 reference image</span>
                  </div>
                </>
              ) : null}

              {mode === 'manifest' ? (
                <>
                  <ManifestTable>
                    {hasF01 ? <ManifestRow item={F01} onSelect={() => recordIntent('F264:inspect:F-01')} /> : null}
                    {hasF03 ? (
                      <ManifestRow item={F03} cls="sel" onSelect={() => recordIntent('F264:inspect:F-03')} />
                    ) : null}
                    {hasDsg ? <ManifestRow item={DSG} onSelect={() => recordIntent('F264:inspect:DESIGN.md')} /> : null}
                  </ManifestTable>
                  <SubHead title="manifest.json" right="F-03 r6 selected" />
                  <CodeBlock label="manifest.json" lines={MANIFEST_JSON_LINES} />
                </>
              ) : null}

              {mode === 'ready' ? (
                <>
                  <SubHead title="In the zip" right={`${zipFiles.length} files · ≈ 0.5 MB`} />
                  <div className="del-tree" aria-label="Files in the zip">
                    <div className="dir">
                      <DeliveryIcon name="box" size={13} />
                      <b>{DELIVERY_MANIFEST.zip}</b>
                      <span>size</span>
                      <span>sha256</span>
                    </div>
                    {topFiles.map(([name, size, hash]) => (
                      <div key={name} className="">
                        <Icon name="doc" size={13} />
                        <b>{name}</b>
                        <span>{size}</span>
                        <span>{hash}…</span>
                      </div>
                    ))}
                    <div className="dir">
                      <Icon name="frame" size={13} />
                      <b>frames/</b>
                      <span />
                      <span />
                    </div>
                    {frameFiles.map(([name, size, hash]) => (
                      <div key={name} className="in">
                        <Icon name="doc" size={13} />
                        <b>{name.replace('frames/', '')}</b>
                        <span>{size}</span>
                        <span>{hash}…</span>
                      </div>
                    ))}
                  </div>
                  <div className="del-ro">
                    <Icon name="lock" size={14} />
                    <span>
                      The zip holds files and hashes only. It does not run anything, and it is not an execution
                      command. Whole-spec export lives in S25.
                    </span>
                  </div>
                </>
              ) : null}

              {mode === 'copied' ? (
                <>
                  <SubHead title="What was copied" right="14 lines · 1.9 KB" />
                  <CodeBlock label="manifest.json" lines={promptLines} />
                  <div className="del-meta">
                    <Btn
                      label="Copy as one link"
                      sm
                      icon="link"
                      later="A single expiring link instead of the long text; expiry must be checked on the server (LATER)"
                    />
                    <span className="del-fwl">
                      Links would expire. The check belongs on the server, so it waits.
                    </span>
                  </div>
                </>
              ) : null}

              {mode === 'blocked' ? (
                <>
                  <SubHead title="Why it is blocked" right="2 of 3" />
                  <div className="del-blk">
                    {DELIVERY_BLOCKED.map((b) => (
                      <div key={`${b.id}:${b.rev}`} className={`it${b.ok ? '' : ' bad'}`}>
                        <b>{b.id}</b>
                        <span className="rv">{b.rev}</span>
                        <span>{b.ok ? 'Accepted. Ready to bundle.' : `${b.kind}: ${b.text}`}</span>
                        {b.ok ? (
                          <Pill tone="ok" label="Ready" />
                        ) : b.kind === 'Stale' ? (
                          <Btn
                            label="Pick r6"
                            sm
                            does="Replaces r5 with the accepted r6 in the selection"
                            feature="F270"
                            onClick={() => recordIntent('F270:pick-r6')}
                          />
                        ) : (
                          <Btn
                            label="Remove"
                            sm
                            does="Takes the draft out of the selection; the draft itself is untouched"
                            feature="F270"
                            onClick={() => recordIntent('F270:remove-draft')}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <SubHead title="After the fix" right="what changes" />
                  <ManifestTable>
                    <ManifestRow item={F03} cls="fresh" onSelect={() => recordIntent('F264:inspect:F-03')} />
                  </ManifestTable>
                </>
              ) : null}

              {mode === 'stale' ? (
                <>
                  <ManifestTable>
                    <ManifestRow item={F01} onSelect={() => recordIntent('F264:inspect:F-01')} />
                    <ManifestRow item={f03Stale} cls="fresh" onSelect={() => recordIntent('F264:inspect:F-03')} />
                    <tr className="gone">
                      <td colSpan={7}>DESIGN.md r3 left out until it is re-finalized</td>
                    </tr>
                  </ManifestTable>
                  <SubHead title="Changed since m-0007" right="exported 12:47, unchanged" />
                  <div className="del-blk">
                    <div className="it">
                      <b>F-03</b>
                      <span className="rv">r6 → r7</span>
                      <span>
                        Accepted 12:52. New sha256 <code>{DELIVERY_STALE.sha.slice(0, 8)}…</code>
                      </span>
                      <Pill tone="warn" label="New in m-0008" />
                    </div>
                    <div className="it">
                      <b>DESIGN.md</b>
                      <span className="rv">r3</span>
                      <span>Finalized 12:24, before F-03 r7. Re-finalize to rebuild it.</span>
                      <Pill tone="warn" label="Stale" />
                    </div>
                  </div>
                  <div className="del-fin">
                    <DeliveryIcon name="refresh" size={16} />
                    <p>
                      Re-finalize rebuilds DESIGN.md from the accepted frames only. It shows a spinner with Cancel and
                      changes no frame.
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="del-act">
              <div className="sum">
                <b>{sumTitle}</b>
                <span>{sumSub}</span>
              </div>
              {mode === 'blocked' ? (
                <>
                  <button
                    type="button"
                    className="sp-btn ink"
                    aria-disabled="true"
                    data-does="Off until every ticked item is an accepted revision"
                    data-feature="F270"
                  >
                    <DeliveryIcon name="box" />
                    Download zip
                  </button>
                  <button
                    type="button"
                    className="sp-btn ghost"
                    aria-disabled="true"
                    data-does="Off until every ticked item is an accepted revision"
                    data-feature="F270"
                  >
                    <DeliveryIcon name="copy" />
                    Copy for a coding agent
                  </button>
                </>
              ) : mode === 'copied' ? (
                <>
                  {dlButton}
                  <Btn
                    label={
                      <>
                        <Icon name="check" size={14} stroke={2.5} />
                        Copied
                      </>
                    }
                    does="Copies the same text again; the manifest stays m-0007"
                    feature="F267"
                    onClick={handleCopy}
                  />
                </>
              ) : (
                <>
                  {dlButton}
                  {cpButton}
                </>
              )}
            </div>
          </section>

          {mode === 'copied' && toastOpen ? (
            <div className="del-toast" role="status" data-feature="F268">
              <span className="ok">
                <Icon name="check" size={15} stroke={2.5} />
              </span>
              <div>
                <b>Copied for your coding agent</b>
                <p>2 frames and DESIGN.md · manifest m-0007 · React · 1.9 KB of text.</p>
              </div>
              <IconBtn
                icon="x"
                label="Dismiss"
                size={14}
                does="Dismisses the toast; the clipboard keeps the text"
                feature="F268"
                onClick={() => setToastOpen(false)}
              />
              <div className="row">
                Paste it into any coding agent, then say what to build <span className="del-kbd">⌘V</span>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
