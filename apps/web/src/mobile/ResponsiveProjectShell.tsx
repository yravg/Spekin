import { useState } from 'react';
import {
  MODELS_BUNDLE,
  MODELS_DEVICE_FRAMES,
  MODELS_FINDING,
  STYLE_TOKENS,
  type SampleDeviceBundlePick,
  type SampleDeviceFrame,
  type SampleDeviceThumbKind,
  type SampleProject,
  type SampleStage,
  type SampleUsage,
  type StageId,
} from '@spekin/sample';
import { useWorkspace } from '../state/workspace';
import { MiniDashboard } from '../shell/MiniDashboard';
import { Pill } from '../ui/Pill';
import { DeviceIcon, type DeviceIconName } from './DeviceIcon';

export type MobileTab = 'frames' | 'style' | 'review' | 'handoff';
export type MobileSheet = 'none' | 'actions' | 'confirm' | 'ready' | 'stages' | 'filter' | 'propose';

export interface MobileFindingItem {
  n: number;
  title: string;
  sub: string;
  frame: string;
  body: string;
  changed: string;
  status: 'open' | 'applied' | 'dismissed';
  stale?: boolean;
}

export interface MobileWorkspaceState {
  frames: SampleDeviceFrame[];
  findings: MobileFindingItem[];
  baselineRev: string;
  bundlePick: SampleDeviceBundlePick[];
}

export interface MobileHandoffSnapshot {
  id: string;
  spec: string;
  size: string;
  files: string[];
  frames: { id: string; name: string; rev: string }[];
  excluded: string[];
}

const INITIAL_FINDINGS: MobileFindingItem[] = [
  {
    n: 1,
    title: MODELS_FINDING.title,
    sub: 'F-03 · r6 to r7 · needs review',
    frame: MODELS_FINDING.frame,
    body: MODELS_FINDING.body,
    changed: MODELS_FINDING.changed,
    status: 'open',
  },
  {
    n: 2,
    title: 'Alert drawer is a draft',
    sub: 'F-04 · r1 · not accepted',
    frame: 'F-04 Alert drawer',
    body: 'F-04 Alert drawer is still a draft (r1). Review it before including it in hand off.',
    changed: '1 drawer',
    status: 'open',
  },
  {
    n: 3,
    title: 'Gap: no empty state',
    sub: 'Proposal · R-DASH-019',
    frame: 'F-03 Variance table',
    body: 'Proposed: show "No package over 3% this period" when no package exceeds threshold.',
    changed: '1 state',
    status: 'open',
  },
];

const REVISIONS: [string, string, ['ok' | 'mute', string]][] = [
  ['r6', 'Accepted · 12:41 · Rina (sample)', ['ok', 'Baseline']],
  ['r5', 'Accepted · yesterday', ['mute', 'Earlier']],
  ['r4', 'Accepted · 19 Nov', ['mute', 'Earlier']],
];

const TABS: [MobileTab, string, DeviceIconName, string][] = [
  ['frames', 'Frames', 'grid', 'Shows the frame list and the single-frame viewer; a tab never approves anything'],
  ['style', 'Style', 'palette', 'Shows the learned style of accepted frames (S30); a tab never approves anything'],
  ['review', 'Review', 'req', 'Shows the review queue: findings, compare, apply and dismiss; a tab never approves anything'],
  ['handoff', 'Hand off', 'download', 'Shows the hand-off bundle of accepted revisions only; a tab never approves anything'],
];

export function createInitialMobileState(): MobileWorkspaceState {
  return {
    frames: MODELS_DEVICE_FRAMES.map((f) => [f[0], f[1], f[2], [f[3][0], f[3][1]], f[4]]),
    findings: INITIAL_FINDINGS.map((f) => ({ ...f })),
    baselineRev: MODELS_FINDING.base,
    bundlePick: MODELS_BUNDLE.pick.map((r) => [r[0], r[1], r[2], r[3], r[4]]),
  };
}

// Non-drag reorder (F346)
export function moveFrame(frames: SampleDeviceFrame[], index: number, delta: -1 | 1): SampleDeviceFrame[] {
  const target = index + delta;
  if (index < 0 || index >= frames.length || target < 0 || target >= frames.length) return frames;
  const next = frames.slice();
  const [item] = next.splice(index, 1);
  if (item) next.splice(target, 0, item);
  return next;
}

// Duplicate as draft (F346): accepted baseline stays untouched
export function duplicateFrameAsDraft(frames: SampleDeviceFrame[], index: number): SampleDeviceFrame[] {
  const src = frames[index];
  if (!src) return frames;
  const copy: SampleDeviceFrame = [src[0], src[1], 'd1', ['warn', 'Draft'], src[4]];
  const next = frames.slice();
  next.splice(index + 1, 0, copy);
  return next;
}

// Dismissing records the decision without changing baseline (F348)
export function dismissFinding(state: MobileWorkspaceState, index: number): MobileWorkspaceState {
  const findings = state.findings.map((f, i) => (i === index ? { ...f, status: 'dismissed' as const } : f));
  return { ...state, findings };
}

// Applying moves baseline only when explicitly confirmed and not stale (F348, AC-57)
export function applyFinding(state: MobileWorkspaceState, index: number, confirmed: boolean): MobileWorkspaceState {
  const item = state.findings[index];
  if (!confirmed || !item || item.stale) return state;
  const findings = state.findings.map((f, i) => (i === index ? { ...f, status: 'applied' as const } : f));
  const baselineRev = index === 0 ? MODELS_FINDING.next : state.baselineRev;
  return { ...state, findings, baselineRev };
}

// Hand-off snapshot: accepted revisions only, pinned when Prepare is pressed (F350, F351)
export function buildMobileHandoffSnapshot(pick: SampleDeviceBundlePick[]): MobileHandoffSnapshot {
  const frames: { id: string; name: string; rev: string }[] = [];
  const excluded: string[] = [];
  for (const row of pick) {
    const [id, name, rev, included, reason] = row;
    if (included && !reason) {
      frames.push({ id, name, rev });
    } else {
      excluded.push(id + ' ' + name);
    }
  }
  return {
    id: MODELS_BUNDLE.id,
    spec: MODELS_BUNDLE.spec,
    size: MODELS_BUNDLE.size,
    files: [...MODELS_BUNDLE.files],
    frames,
    excluded,
  };
}

function FrameThumb({ kind }: { kind: SampleDeviceThumbKind }) {
  return (
    <span className="mod-th">
      <span className="in" style={{ width: '230px', height: '150px', transform: 'scale(0.296)' }}>
        {kind === 'image' ? (
          <span className="mod-imgph">
            <DeviceIcon name="image" size={40} stroke={1.5} />
          </span>
        ) : (
          <MiniDashboard
            title={kind === 'chart' ? 'Portfolio overview' : 'Variance table'}
            chart={kind === 'chart'}
            table={kind !== 'chart'}
            rows={4}
            drawer={kind === 'drawer'}
            h={150}
          />
        )}
      </span>
    </span>
  );
}

function FramePreview(props: {
  width: number;
  height: number;
  scale: number;
  kind?: SampleDeviceThumbKind;
  chart?: boolean;
  showChange?: boolean;
  compactTag?: boolean;
}) {
  const { width, height, scale, kind = 'table', chart = true, showChange = false, compactTag = false } = props;
  const iw = Math.round(width / scale);
  const ih = Math.round(height / scale);
  return (
    <div className="mod-pvw ap-t01-pvw" style={{ width: width + 'px', height: height + 'px' }}>
      <span className="in" style={{ width: iw + 'px', height: ih + 'px', transform: 'scale(' + scale + ')' }}>
        {kind === 'image' ? (
          <span className="mod-imgph">
            <DeviceIcon name="image" size={40} stroke={1.5} />
          </span>
        ) : (
          <MiniDashboard
            title={kind === 'chart' ? 'Portfolio overview' : 'Variance table'}
            chart={kind === 'chart' ? true : chart}
            table={kind !== 'chart'}
            rows={4}
            drawer={kind === 'drawer'}
            h={ih}
          />
        )}
      </span>
      {showChange ? (
        <>
          <span
            className="mod-chg"
            style={
              compactTag
                ? { left: '278px', top: '90px', width: '72px', height: '106px' }
                : { left: '384px', top: '118px', width: '96px', height: '150px' }
            }
          />
          <span className="mod-chtag" style={compactTag ? { left: '10px', bottom: '10px' } : { left: '14px', bottom: '14px' }}>
            <DeviceIcon name="diff" size={compactTag ? 13 : 14} />
            {compactTag ? 'Changed' : 'Changed · ' + MODELS_FINDING.changed}
          </span>
        </>
      ) : null}
    </div>
  );
}

// T01 Tablet and phone layout for ProjectShell below 1024 px.
export function ResponsiveProjectShell(props: {
  tier: 'tablet' | 'phone';
  project: SampleProject;
  usage: SampleUsage;
  stages: SampleStage[];
  currentStage: SampleStage;
  onSwitchStage: (id: StageId) => void;
  initialTab?: MobileTab;
  initialSheet?: MobileSheet;
  initialReviewPanel?: boolean;
}) {
  const { tier, project, usage, stages, currentStage, onSwitchStage } = props;
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const [ws, setWs] = useState<MobileWorkspaceState>(createInitialMobileState);
  const [tab, setTab] = useState<MobileTab>(props.initialTab ?? 'frames');
  const [selectedFrameIdx, setSelectedFrameIdx] = useState<number>(1);
  const [selectedRev, setSelectedRev] = useState<string>('r6');
  const [leftPanel, setLeftPanel] = useState<'list' | 'review' | 'context'>(props.initialReviewPanel ? 'review' : 'list');
  const [findingIdx, setFindingIdx] = useState<number>(0);
  const [versionView, setVersionView] = useState<'orig' | 'changed'>('changed');
  const [sheet, setSheet] = useState<MobileSheet>(props.initialSheet ?? 'none');
  const [actionFrameIdx, setActionFrameIdx] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [proposalText, setProposalText] = useState<string>('');
  const [snapshot, setSnapshot] = useState<MobileHandoffSnapshot>(() => buildMobileHandoffSnapshot(MODELS_BUNDLE.pick));

  const pendingCount = ws.findings.filter((f) => f.status === 'open').length;
  const fallbackFrame: SampleDeviceFrame = ['F-03', 'Variance table', 'r6', ['ok', 'Accepted'], 'table'];
  const fallbackFinding: MobileFindingItem = INITIAL_FINDINGS[0]!;
  const currentFrame: SampleDeviceFrame = ws.frames[selectedFrameIdx] ?? ws.frames[0] ?? fallbackFrame;
  const currentFinding: MobileFindingItem = ws.findings[findingIdx] ?? ws.findings[0] ?? fallbackFinding;
  const actionFrame: SampleDeviceFrame = ws.frames[actionFrameIdx] ?? ws.frames[1] ?? ws.frames[0] ?? fallbackFrame;
  const usagePct = Math.min(100, Math.round((usage.used / usage.cap) * 100));

  const filteredFrames = ws.frames
    .map((f, idx) => ({ f, idx }))
    .filter(({ f }) => {
      const matchesText = !search.trim() || (f[0] + ' ' + f[1]).toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === 'All' || f[3][1] === statusFilter;
      return matchesText && matchesStatus;
    });

  const selectedBundleCount = ws.bundlePick.filter((r) => r[3] && !r[4]).length;

  function selectTab(next: MobileTab) {
    setTab(next);
    setSheet('none');
    if (tier === 'tablet') {
      if (next === 'review') setLeftPanel('review');
      else if (next === 'frames') setLeftPanel('list');
    }
  }

  function toggleBundleRow(idx: number) {
    setWs((prev) => ({
      ...prev,
      bundlePick: prev.bundlePick.map((row, i) => (i === idx && !row[4] ? [row[0], row[1], row[2], !row[3], row[4]] : row)),
    }));
  }

  function openPrepareDownload() {
    setSnapshot(buildMobileHandoffSnapshot(ws.bundlePick));
    setSheet('ready');
  }

  const renderHandOffView = () => (
    <>
      <div className="mod-pb ap-t01-scroll">
        <h3>Hand off</h3>
        <div className="sub">
          <span>Only accepted revisions. No local agent runs.</span>
        </div>
        <div className="mod-pl mod-r" data-feature="F350">
          {ws.bundlePick.map((r, i) => {
            const selectable = !r[4];
            const checked = Boolean(r[3]) && selectable;
            return (
              <div key={r[0] + '-' + r[1]} className={'mod-ck2' + (selectable ? '' : ' off')}>
                <button
                  type="button"
                  className="go"
                  role="checkbox"
                  aria-checked={checked}
                  aria-disabled={!selectable || undefined}
                  disabled={!selectable}
                  data-does={
                    selectable
                      ? 'Includes ' + r[0] + ' ' + r[1] + ' ' + r[2] + ' in the bundle; unchecking leaves it out'
                      : 'Not in the bundle: ' + (r[4] ?? 'Not accepted')
                  }
                  data-feature="F350"
                  onClick={() => toggleBundleRow(i)}
                >
                  <span className={'bx' + (checked ? ' on' : '')}>
                    {checked ? <DeviceIcon name="check" size={16} stroke={3} /> : null}
                  </span>
                  <span className="tx">
                    {r[0]} {r[1]}
                    <small>{selectable ? r[2] + ' · accepted' : r[4]}</small>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        <div className="mod-bun">
          <span className="k">Bundle contents</span>
          <div className="fl2">
            {MODELS_BUNDLE.files.map((file) => (
              <span key={file}>{file}</span>
            ))}
          </div>
          <span>The snapshot does not follow later edits. It is not a runnable app.</span>
        </div>
      </div>
      <div className="mod-bar2">
        <button
          type="button"
          className="mod-b ink grow"
          disabled={selectedBundleCount === 0}
          data-does={'Builds the snapshot of the ' + selectedBundleCount + ' selected accepted frames and shows a ready sheet; it does not start a coding agent'}
          data-feature="F351"
          onClick={openPrepareDownload}
        >
          <DeviceIcon name="download" size={18} />
          Prepare download · {selectedBundleCount} frames
        </button>
      </div>
    </>
  );

  const renderStyleView = () => (
    <div className="mod-pb ap-t01-scroll">
      <h3>Style</h3>
      <div className="sub">
        <DeviceIcon name="palette" size={18} />
        <span>Learned tokens from accepted frames (DESIGN.md r3). Promotion stays in review.</span>
      </div>
      <div className="mod-pl">
        {STYLE_TOKENS.slice(0, 6).map((tk) => (
          <div key={tk.id} className="mod-pr">
            <button
              type="button"
              className="go"
              data-does={'Inspects learned token ' + tk.name + '; style changes go through review'}
              data-feature="F344"
              onClick={() => recordIntent('F344:style:' + tk.id)}
            >
              <span className="tx">
                {tk.name}
                <small>
                  {tk.spec ?? tk.v?.hex ?? tk.id}
                  <Pill tone={tk.st === 'ok' ? 'ok' : tk.st === 'cf' ? 'warn' : 'mute'} label={tk.st === 'ok' ? 'Accepted' : tk.st === 'cf' ? 'Conflict' : 'Inferred'} />
                </small>
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSheets = () => {
    if (sheet === 'none') return null;

    if (sheet === 'actions') {
      return (
        <>
          <div className="mod-scrim" onClick={() => setSheet('none')} />
          <div className="mod-sh mod-r" role="dialog" aria-modal="true" aria-label="Frame actions" data-feature="F353">
            <div className="mod-grab" />
            <div className="mod-sheadrow">
              <FrameThumb kind={actionFrame[4]} />
              <div>
                <h4>
                  {actionFrame[0]} {actionFrame[1]}
                </h4>
                <span className="sm">
                  {actionFrame[2]} · {actionFrame[3][1]}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="mod-sa"
              data-does={'Opens ' + actionFrame[0] + ' in the single-frame viewer'}
              data-feature="F346"
              onClick={() => {
                setSelectedFrameIdx(actionFrameIdx);
                setTab('review');
                setSheet('none');
              }}
            >
              <DeviceIcon name="arrowR" size={22} />
              Open frame
            </button>
            <button
              type="button"
              className="mod-sa"
              disabled={actionFrameIdx === 0}
              data-does={'Moves ' + actionFrame[0] + ' one place earlier in the list; the non-drag way to reorder'}
              data-feature="F346"
              onClick={() => {
                setWs((prev) => ({ ...prev, frames: moveFrame(prev.frames, actionFrameIdx, -1) }));
                setActionFrameIdx((i) => Math.max(0, i - 1));
                setSheet('none');
              }}
            >
              <DeviceIcon name="arrowU" size={22} />
              Move earlier
              <small>
                now {actionFrameIdx + 1} of {ws.frames.length}
              </small>
            </button>
            <button
              type="button"
              className="mod-sa"
              data-does={'Moves ' + actionFrame[0] + ' one place later in the list; the non-drag way to reorder'}
              data-feature="F346"
              disabled={actionFrameIdx === ws.frames.length - 1}
              onClick={() => {
                setWs((prev) => ({ ...prev, frames: moveFrame(prev.frames, actionFrameIdx, 1) }));
                setActionFrameIdx((i) => Math.min(ws.frames.length - 1, i + 1));
                setSheet('none');
              }}
            >
              <DeviceIcon name="arrowD" size={22} />
              Move later
            </button>
            <button
              type="button"
              className="mod-sa"
              data-does={'Makes ' + actionFrame[0] + ' d1, a draft copy; the accepted baseline is untouched'}
              data-feature="F346"
              onClick={() => {
                setWs((prev) => ({ ...prev, frames: duplicateFrameAsDraft(prev.frames, actionFrameIdx) }));
                setSheet('none');
              }}
            >
              <DeviceIcon name="copy" size={22} />
              Duplicate as draft
            </button>
            <button
              type="button"
              className="mod-sa"
              data-does="Opens the whole-frame comparison of two revisions"
              data-feature="F346"
              onClick={() => {
                setSelectedFrameIdx(actionFrameIdx);
                setTab('review');
                setVersionView('changed');
                setSheet('none');
              }}
            >
              <DeviceIcon name="cols" size={22} />
              Compare r6 with r5
            </button>
            <div className="btns">
              <button
                type="button"
                className="mod-b ghost grow"
                data-does="Closes the sheet; nothing changes"
                data-feature="F353"
                onClick={() => setSheet('none')}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      );
    }

    if (sheet === 'confirm') {
      return (
        <>
          <div className="mod-scrim" onClick={() => setSheet('none')} />
          <div className="mod-sh mod-r" role="dialog" aria-modal="true" aria-label="Confirm apply change" data-feature="F348">
            <div className="mod-grab" />
            <h4>Apply change to F-03?</h4>
            <div className="mod-kvs">
              <span>Baseline now</span>
              <b>{ws.baselineRev}</b>
              <span>After you confirm</span>
              <b>{MODELS_FINDING.next}</b>
              <span>Requirement</span>
              <b>R-DASH-014 stays r14</b>
              <span>Test</span>
              <b>AC-014.2 needs review</b>
            </div>
            <div className="btns">
              <button
                type="button"
                className="mod-b ghost grow foc"
                data-does="Closes the sheet and changes nothing; this is the default choice"
                data-feature="F348"
                onClick={() => setSheet('none')}
              >
                Cancel
              </button>
              <button
                type="button"
                className="mod-b ink grow"
                data-does="Applies r7 as the new baseline of F-03 and records who applied it"
                data-feature="F348"
                onClick={() => {
                  setWs((prev) => applyFinding(prev, findingIdx, true));
                  setSheet('none');
                }}
              >
                Apply {MODELS_FINDING.next}
              </button>
            </div>
          </div>
        </>
      );
    }

    if (sheet === 'ready') {
      return (
        <>
          <div className="mod-scrim" onClick={() => setSheet('none')} />
          <div className="mod-sh mod-r" role="dialog" aria-modal="true" aria-label="Bundle ready" data-feature="F351">
            <div className="mod-grab" />
            <div className="mod-sheadrow">
              <span className="mod-okb">
                <DeviceIcon name="check" size={22} stroke={2.4} />
              </span>
              <div>
                <h4>Bundle ready</h4>
                <span className="sm">
                  {snapshot.id} · {snapshot.frames.length} frames · {snapshot.files.length} files · {snapshot.size}
                </span>
              </div>
            </div>
            <div className="mod-kvs">
              <span>Spec</span>
              <b>{snapshot.spec}</b>
              {snapshot.frames.map((fr) => (
                <div key={fr.id} className="ap-kv-pair">
                  <span>{fr.id}</span>
                  <b>{fr.rev}</b>
                </div>
              ))}
            </div>
            <p className="sm">Pinned to these revisions. Later edits do not change this bundle.</p>
            <div className="btns">
              <button
                type="button"
                className="mod-b ink grow"
                data-does="Downloads the prepared bundle to this device; the file is the snapshot, not an instruction to run"
                data-feature="F351"
                onClick={() => {
                  recordIntent('F351:download:' + snapshot.id);
                  setSheet('none');
                }}
              >
                <DeviceIcon name="download" size={18} />
                Download bundle
              </button>
            </div>
          </div>
        </>
      );
    }

    if (sheet === 'stages') {
      return (
        <>
          <div className="mod-scrim" onClick={() => setSheet('none')} />
          <div className="mod-sh mod-r" role="dialog" aria-modal="true" aria-label="Stages" data-feature="F356">
            <div className="mod-grab" />
            <h4>Stages</h4>
            {stages.map((s) => (
              <button
                key={s.id}
                type="button"
                className="mod-sa"
                aria-current={s.id === currentStage.id ? 'page' : undefined}
                data-does={'Switches to the ' + s.name + ' stage in place; never approves anything'}
                data-feature="F356"
                onClick={() => {
                  onSwitchStage(s.id);
                  setSheet('none');
                }}
              >
                <span>
                  {s.n}. {s.name}
                </span>
                <small>{s.text}</small>
              </button>
            ))}
            <div className="btns">
              <button
                type="button"
                className="mod-b ghost grow"
                data-does="Closes the stage sheet without switching"
                data-feature="F356"
                onClick={() => setSheet('none')}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      );
    }

    if (sheet === 'filter') {
      const options = ['All', 'Accepted', 'Draft', 'Pending', 'Reference'];
      return (
        <>
          <div className="mod-scrim" onClick={() => setSheet('none')} />
          <div className="mod-sh mod-r" role="dialog" aria-modal="true" aria-label="Filter by status" data-feature="F345">
            <div className="mod-grab" />
            <h4>Filter by status</h4>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="mod-sa"
                aria-pressed={statusFilter === opt}
                data-does={'Filters frames by status: ' + opt}
                data-feature="F345"
                onClick={() => {
                  setStatusFilter(opt);
                  setSheet('none');
                }}
              >
                {opt}
                {statusFilter === opt ? <small>Active</small> : null}
              </button>
            ))}
            <div className="btns">
              <button
                type="button"
                className="mod-b ghost grow"
                data-does="Closes the filter sheet"
                data-feature="F353"
                onClick={() => setSheet('none')}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      );
    }

    // propose sheet
    return (
      <>
        <div className="mod-scrim" onClick={() => setSheet('none')} />
        <div className="mod-sh mod-r" role="dialog" aria-modal="true" aria-label="Propose change" data-feature="F348">
          <div className="mod-grab" />
          <h4>Propose change to {currentFrame[0]}</h4>
          <p className="sm">Describe the change. Nothing is applied until you review it.</p>
          <div className="mod-sf">
            <input
              type="text"
              className="ap-sf-input"
              aria-label="Describe proposed change"
              placeholder="Describe change…"
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
            />
          </div>
          <div className="btns">
            <button
              type="button"
              className="mod-b ghost grow foc"
              data-does="Closes the proposal sheet without creating a proposal"
              data-feature="F353"
              onClick={() => setSheet('none')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="mod-b ink grow"
              data-does="Creates a draft proposal for review; baseline stays unchanged"
              data-feature="F348"
              onClick={() => {
                recordIntent('F348:propose:' + currentFrame[0] + ':' + proposalText);
                setProposalText('');
                setSheet('none');
              }}
            >
              Send to review
            </button>
          </div>
        </div>
      </>
    );
  };

  if (tier === 'tablet') {
    const showReview = tab === 'review' || leftPanel === 'review';
    const showContext = !showReview && leftPanel === 'context';
    const findingPill: ['ok' | 'acc' | 'mute', string] =
      currentFinding.status === 'applied'
        ? ['ok', 'Accepted ' + ws.baselineRev]
        : currentFinding.status === 'dismissed'
          ? ['mute', 'Dismissed']
          : ['acc', MODELS_FINDING.next + ' proposed'];

    return (
      <div className="ap-root" data-screen="T01" data-tier="tablet">
        <div className="sp-app mod-dsc ap-t01">
          <header className="mod-ah">
            <span className="mk">S</span>
            <div className="pj">
              {project.name}
              <span>
                {project.increment} · Spec {project.spec}
              </span>
            </div>
            <span className="fl" />
            <button
              type="button"
              className="mod-chb"
              data-does="Opens the stage list as a sheet: all eight stages with a text status; choosing one switches in place"
              data-feature="F356"
              onClick={() => setSheet('stages')}
            >
              {currentStage.name}
              <DeviceIcon name="chev" size={14} />
            </button>
            <button
              type="button"
              className="mod-mtr"
              data-does="Opens Models and usage (S36): used, reserved and cap"
              data-feature="F355"
              onClick={() => recordIntent('F355:usage')}
            >
              {usage.source}
              <i>
                <u style={{ width: usagePct + '%' }} />
              </i>
              <b>{usage.used.toLocaleString('en-US')}</b>
            </button>
            <span className="mod-avt">{project.initials}</span>
          </header>

          <div className="mod-t4" role="tablist" aria-label="Frame workspace">
            {TABS.map(([id, label, icon, does]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-current={tab === id ? 'page' : undefined}
                data-does={does}
                data-feature="F344"
                onClick={() => selectTab(id)}
              >
                <DeviceIcon name={icon} size={18} />
                {label}
                {id === 'review' && pendingCount > 0 ? <span className="bd">{pendingCount}</span> : null}
              </button>
            ))}
          </div>

          {tab === 'style' ? (
            renderStyleView()
          ) : tab === 'handoff' ? (
            renderHandOffView()
          ) : (
            <div className="mod-bd ap-t01-scroll">
              {showReview ? (
                <div className="mod-r mod-pn" data-feature="F343">
                  <div className="mod-rh">
                    Review
                    <span>{pendingCount} waiting</span>
                    <span className="fl" />
                    <button
                      type="button"
                      className="mod-chb"
                      data-does="Closes the review panel and shows the frame list again; the viewer keeps its frame"
                      data-feature="F343"
                      onClick={() => {
                        setLeftPanel('list');
                        setTab('frames');
                      }}
                    >
                      <DeviceIcon name="back" size={16} />
                      Frames
                    </button>
                  </div>
                  {ws.findings.map((f, i) => (
                    <button
                      key={f.n}
                      type="button"
                      className={'mod-it' + (i === findingIdx ? ' sel' : '')}
                      data-does={'Shows finding ' + f.n + ' in the viewer: ' + f.title}
                      data-feature="F343"
                      onClick={() => setFindingIdx(i)}
                    >
                      <i>{f.n}</i>
                      <span>
                        <b>{f.title}</b>
                        <span>{f.status === 'open' ? f.sub : f.status === 'applied' ? 'Applied · ' + ws.baselineRev : 'Dismissed · on record'}</span>
                      </span>
                    </button>
                  ))}
                  <div className="ap-mod-callout">
                    <DeviceIcon name="lock" size={18} />
                    <span>
                      Baseline stays <b>{ws.baselineRev}</b> until you apply. Dismissing is not a pass.
                    </span>
                  </div>
                </div>
              ) : showContext ? (
                <div className="mod-r mod-pn" data-feature="F343">
                  <div className="mod-rh">
                    Context
                    <span>{currentFrame[0]}</span>
                    <span className="fl" />
                    <button
                      type="button"
                      className="mod-chb"
                      data-does="Closes the context panel and shows the frame list again; the viewer keeps its frame"
                      data-feature="F343"
                      onClick={() => setLeftPanel('list')}
                    >
                      <DeviceIcon name="back" size={16} />
                      Frames
                    </button>
                  </div>
                  <div className="mod-fnd">
                    <span className="k">Linked requirement</span>
                    <h4>R-DASH-014 · Variance threshold</h4>
                    <p>Flag a package when forecast exceeds budget by more than 3%. Spec r14.</p>
                  </div>
                  <div className="ap-mod-callout">
                    <DeviceIcon name="lock" size={18} />
                    <span>Context replaces the frame list and never stacks beside the viewer.</span>
                  </div>
                </div>
              ) : (
                <div className="mod-r mod-rail" data-feature="F342">
                  <div className="mod-rh">
                    Frames<span>{ws.frames.length} on this board</span>
                  </div>
                  {ws.frames.map((f, i) => (
                    <div key={f[0] + '-' + f[1] + '-' + i} className={'mod-fr' + (i === selectedFrameIdx ? ' sel' : '')}>
                      <button
                        type="button"
                        className="go"
                        data-does={'Shows ' + f[0] + ' ' + f[1] + ' in the viewer; the list keeps its scroll position'}
                        data-feature="F342"
                        onClick={() => setSelectedFrameIdx(i)}
                      >
                        <FrameThumb kind={f[4]} />
                        <span className="tx">
                          {f[0]} {f[1]}
                          <small>
                            {f[2]}
                            <Pill tone={f[3][0]} label={f[3][1]} />
                          </small>
                        </span>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mod-add"
                    data-does="Opens the file picker for a PNG, JPEG or WebP reference you are entitled to use; nothing is read without your choice"
                    data-feature="F345"
                    onClick={() => recordIntent('F345:import')}
                  >
                    <DeviceIcon name="plus" size={18} />
                    Import a reference
                  </button>
                  <button
                    type="button"
                    className="mod-it"
                    data-does="Opens the review panel in place of this list"
                    data-feature="F343"
                    onClick={() => {
                      setLeftPanel('review');
                      setTab('review');
                    }}
                  >
                    <i>{pendingCount}</i>
                    <span>
                      <b>Review queue</b>
                      <span>1 change, 1 draft, 1 gap</span>
                    </span>
                  </button>
                </div>
              )}

              {showReview ? (
                <div className="mod-r mod-vw" data-feature="F347">
                  <div className="mod-vh">
                    <h3>{currentFinding.frame}</h3>
                    <Pill tone={findingPill[0]} label={findingPill[1]} />
                  </div>
                  <div className="mod-tg" role="group" aria-label="Version">
                    <button
                      type="button"
                      aria-pressed={versionView === 'orig'}
                      data-does={'Shows F-03 as it is in the baseline ' + ws.baselineRev}
                      data-feature="F347"
                      onClick={() => setVersionView('orig')}
                    >
                      Original {ws.baselineRev}
                    </button>
                    <button
                      type="button"
                      aria-pressed={versionView === 'changed'}
                      data-does={'Shows F-03 with the proposed change ' + MODELS_FINDING.next + ' highlighted'}
                      data-feature="F347"
                      onClick={() => setVersionView('changed')}
                    >
                      Changed {MODELS_FINDING.next}
                    </button>
                  </div>
                  <FramePreview width={488} height={330} scale={2.4} chart={false} showChange={versionView === 'changed'} />
                  <div className="mod-fnd">
                    <span className="k">
                      Finding {currentFinding.n} of {ws.findings.length}
                    </span>
                    <h4>{currentFinding.title}</h4>
                    <p>{currentFinding.body}</p>
                    <div className="ch">
                      <span>R-DASH-014</span>
                      <span>{currentFinding.changed} changed</span>
                      <span>spec {project.spec}</span>
                    </div>
                  </div>
                  <div className="mod-acts">
                    <button
                      type="button"
                      className="mod-b ghost grow"
                      data-does="Dismisses this finding; it stays on record and dismissal is not a pass"
                      data-feature="F348"
                      onClick={() => setWs((prev) => dismissFinding(prev, findingIdx))}
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      className="mod-b ghost grow"
                      data-does="Opens the whole-frame comparison of r6 and r7, including changes outside the highlighted part"
                      data-feature="F347"
                      onClick={() => setVersionView((v) => (v === 'changed' ? 'orig' : 'changed'))}
                    >
                      Compare frame
                    </button>
                    <button
                      type="button"
                      className="mod-b ink grow"
                      disabled={Boolean(currentFinding.stale) || currentFinding.status === 'applied'}
                      data-does="Opens a confirm sheet; the baseline moves from r6 to r7 only after you confirm"
                      data-feature="F348"
                      onClick={() => setSheet('confirm')}
                    >
                      {currentFinding.stale ? 'Re-check first' : 'Apply change'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mod-r mod-vw" data-feature="F342">
                  <div className="mod-vh">
                    <h3>
                      {currentFrame[0]} {currentFrame[1]}
                    </h3>
                    <Pill tone={currentFrame[3][0]} label={currentFrame[3][1] + ' ' + selectedRev} />
                    <span className="fl" />
                    <button
                      type="button"
                      className="mod-b ghost"
                      data-does="Opens the context panel (links, contract, revisions, evidence) in place of the frame list"
                      data-feature="F343"
                      onClick={() => setLeftPanel(showContext ? 'list' : 'context')}
                    >
                      Open context
                    </button>
                  </div>
                  <FramePreview width={526} height={440} scale={2.4} kind={currentFrame[4]} />
                  <div className="ap-mod-callout">
                    <DeviceIcon name="monitor" size={18} />
                    <span>Canvas editing is on desktop. Review, compare and hand off work here.</span>
                  </div>
                  <div className="mod-meta">
                    <div>
                      Status
                      <b>
                        {currentFrame[3][1]} {selectedRev}
                      </b>
                    </div>
                    <div>
                      Requirement<b>R-DASH-014</b>
                    </div>
                    <div>
                      Edited<b>12:41 · Rina</b>
                    </div>
                  </div>
                  <div className="mod-revs">
                    {REVISIONS.map(([rev, text, pillVal]) => (
                      <button
                        key={rev}
                        type="button"
                        className="mod-rv"
                        data-does={'Shows revision ' + rev + ' of ' + currentFrame[0] + ' in the viewer'}
                        data-feature="F342"
                        onClick={() => setSelectedRev(rev)}
                      >
                        <b>{rev}</b>
                        <span>{text}</span>
                        <Pill tone={pillVal[0]} label={pillVal[1]} />
                      </button>
                    ))}
                  </div>
                  <div className="mod-acts">
                    <button
                      type="button"
                      className="mod-b ghost grow"
                      data-does="Compares F-03 r6 with its latest proposal on the whole frame"
                      data-feature="F347"
                      onClick={() => {
                        setLeftPanel('review');
                        setTab('review');
                      }}
                    >
                      Compare
                    </button>
                    <button
                      type="button"
                      className="mod-b ink grow"
                      data-does="Opens a bottom sheet to describe a change to F-03; nothing is applied until you review it"
                      data-feature="F348"
                      onClick={() => setSheet('propose')}
                    >
                      Propose change
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {renderSheets()}
        </div>
      </div>
    );
  }

  // Phone layout (< 768 px): list, single-frame review, hand off, bottom tabs and bottom sheets.
  const phoneFindingPill: ['ok' | 'acc' | 'mute', string] =
    currentFinding.status === 'applied'
      ? ['ok', 'Accepted ' + ws.baselineRev]
      : currentFinding.status === 'dismissed'
        ? ['mute', 'Dismissed']
        : ['acc', ws.baselineRev + ' to ' + MODELS_FINDING.next];

  return (
    <div className="ap-root" data-screen="T01" data-tier="phone">
      <div className="sp-app mod-dsc ap-t01">
        {tab === 'review' ? (
          <>
            <header className="mod-pa">
              <button
                type="button"
                className="mod-ib"
                aria-label="Back to frames"
                data-does="Goes back to the frame list; nothing is decided"
                data-feature="F347"
                onClick={() => selectTab('frames')}
              >
                <DeviceIcon name="back" size={20} />
              </button>
              <span className="ttl">
                Review · {currentFinding.n} of {ws.findings.length}
              </span>
              <button
                type="button"
                className="mod-ib"
                aria-label="Next finding"
                data-does="Shows the next finding in the queue"
                data-feature="F347"
                onClick={() => setFindingIdx((i) => (i + 1) % ws.findings.length)}
              >
                <DeviceIcon name="chevR" size={20} />
              </button>
            </header>
            <div className="mod-pb ap-t01-scroll">
              <div className="mod-vh">
                <h3 className="h3s">{currentFinding.frame}</h3>
                <span className="fl" />
                <Pill tone={phoneFindingPill[0]} label={phoneFindingPill[1]} />
              </div>
              <div className="mod-tg" role="group" aria-label="Version">
                <button
                  type="button"
                  aria-pressed={versionView === 'orig'}
                  data-does={'Shows F-03 as it is in the baseline ' + ws.baselineRev}
                  data-feature="F347"
                  onClick={() => setVersionView('orig')}
                >
                  Original {ws.baselineRev}
                </button>
                <button
                  type="button"
                  aria-pressed={versionView === 'changed'}
                  data-does={'Shows F-03 with the proposed change ' + MODELS_FINDING.next + ' highlighted'}
                  data-feature="F347"
                  onClick={() => setVersionView('changed')}
                >
                  Changed {MODELS_FINDING.next}
                </button>
              </div>
              <div className="mod-r" data-feature="F347">
                <FramePreview width={358} height={226} scale={1.9} chart={false} showChange={versionView === 'changed'} compactTag />
              </div>
              <div className="mod-fnd">
                <span className="k">Finding {currentFinding.n}</span>
                <h4>{currentFinding.title}</h4>
                <p>Compare the whole frame before you apply. The baseline stays {ws.baselineRev} until you do.</p>
              </div>
              <button
                type="button"
                className="mod-b plain"
                data-does="Opens the whole-frame comparison of r6 and r7, including changes outside the highlighted part"
                data-feature="F347"
                onClick={() => setVersionView((v) => (v === 'changed' ? 'orig' : 'changed'))}
              >
                <DeviceIcon name="arrowR" size={18} />
                Compare the whole frame
              </button>
            </div>
            <div className="mod-bar2 mod-r" data-feature="F348">
              <button
                type="button"
                className="mod-b ghost grow"
                data-does="Dismisses this finding; it stays on record and dismissal is not a pass"
                data-feature="F348"
                onClick={() => setWs((prev) => dismissFinding(prev, findingIdx))}
              >
                Dismiss
              </button>
              <button
                type="button"
                className="mod-b ink grow"
                disabled={Boolean(currentFinding.stale) || currentFinding.status === 'applied'}
                data-does="Opens a confirm sheet; the baseline moves from r6 to r7 only after you confirm"
                data-feature="F348"
                onClick={() => setSheet('confirm')}
              >
                {currentFinding.stale ? 'Re-check first' : 'Apply change'}
              </button>
            </div>
          </>
        ) : (
          <>
            <header className="mod-pa">
              <span className="mk">S</span>
              <b>{project.name}</b>
              <span className="fl" />
              <button
                type="button"
                className="mod-chb"
                data-does="Opens the stage list as a bottom sheet with all eight stages"
                data-feature="F356"
                onClick={() => setSheet('stages')}
              >
                {currentStage.name}
                <DeviceIcon name="chev" size={14} />
              </button>
              <button
                type="button"
                className="mod-mtr"
                data-does="Opens Models and usage (S36)"
                data-feature="F355"
                onClick={() => recordIntent('F355:usage')}
              >
                <b>{usage.used.toLocaleString('en-US')}</b>
              </button>
            </header>

            {tab === 'style' ? (
              renderStyleView()
            ) : tab === 'handoff' ? (
              renderHandOffView()
            ) : (
              <div className="mod-pb ap-t01-scroll">
                <h3>Frames</h3>
                <div className="sub">
                  <DeviceIcon name="monitor" size={18} />
                  <span>Canvas editing is on desktop. Review and hand off work here.</span>
                </div>
                <div className="mod-sr">
                  <div className="mod-sf">
                    <DeviceIcon name="search" size={18} />
                    <input
                      type="search"
                      className="ap-sf-input"
                      aria-label="Search frames"
                      placeholder="Search frames"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="mod-ib"
                    aria-label="Filter by status"
                    data-does="Opens a bottom sheet to filter frames by status"
                    data-feature="F345"
                    onClick={() => setSheet('filter')}
                  >
                    <DeviceIcon name="layers" size={20} />
                  </button>
                </div>
                <div className="mod-pl mod-r" data-feature="F345">
                  {filteredFrames.map(({ f, idx }) => (
                    <div key={f[0] + '-' + f[1] + '-' + idx} className="mod-pr">
                      <button
                        type="button"
                        className="go"
                        data-does={'Opens ' + f[0] + ' ' + f[1] + ' in the single-frame viewer'}
                        data-feature="F345"
                        onClick={() => {
                          setSelectedFrameIdx(idx);
                          setTab('review');
                        }}
                      >
                        <FrameThumb kind={f[4]} />
                        <span className="tx">
                          {f[0]} {f[1]}
                          <small>
                            {f[2]}
                            <Pill tone={f[3][0]} label={f[3][1]} />
                          </small>
                        </span>
                      </button>
                      <button
                        type="button"
                        className="mo"
                        aria-label={'Actions for ' + f[0] + ' ' + f[1]}
                        data-does="Opens a bottom sheet of actions for this frame: open, move, duplicate, compare"
                        data-feature="F346"
                        onClick={() => {
                          setActionFrameIdx(idx);
                          setSheet('actions');
                        }}
                      >
                        <DeviceIcon name="more" size={22} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mod-tb" role="tablist" aria-label="Frame workspace">
              {TABS.map(([id, label, icon, does]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-current={tab === id ? 'page' : undefined}
                  data-does={does}
                  data-feature="F344"
                  onClick={() => selectTab(id)}
                >
                  <DeviceIcon name={icon} size={22} />
                  {label}
                  {id === 'review' && pendingCount > 0 ? <span className="bd">{pendingCount}</span> : null}
                </button>
              ))}
            </div>
          </>
        )}

        {renderSheets()}
      </div>
    </div>
  );
}
