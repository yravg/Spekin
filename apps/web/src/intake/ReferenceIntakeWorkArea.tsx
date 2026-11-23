import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  INTAKE_LIMITS,
  INTAKE_PII,
  INTAKE_REFS,
  MODEL,
  type ContextItem,
  type PillTuple,
  type SampleIntakeLimits,
  type SampleIntakeRef,
} from '@spekin/sample';
import { useWorkspace, type SaveState } from '../state/workspace';
import { Icon } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { IntakeIcon, type IntakeIconName } from '../projects/IntakeIcon';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { ViewSwitch } from '../shell/ViewSwitch';
import { MiniDashboard } from '../shell/MiniDashboard';

export type IntakeMode = 'empty' | 'drop' | 'imported' | 'rejected' | 'pii' | 'pasted';

export interface IntakeShellOverride {
  save?: SaveState;
}

export interface ReferenceFileCandidate {
  name: string;
  mime: string;
  sizeMb: number;
}

export interface ReferenceValidationResult {
  ok: boolean;
  reason?: string;
}

export interface PiiHoldState {
  heldRefId: string;
  findings: number;
  styleJobWaiting: boolean;
  blurred: boolean;
  removed: boolean;
}

const ACCEPTED_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export function validateReferenceFile(
  file: ReferenceFileCandidate,
  limits: SampleIntakeLimits = INTAKE_LIMITS,
): ReferenceValidationResult {
  if (!ACCEPTED_MIMES.has(file.mime)) {
    return { ok: false, reason: `${file.name} is not an accepted image type (${limits.types}).` };
  }
  if (file.sizeMb > limits.sizeMb) {
    return {
      ok: false,
      reason: `${file.name} is ${file.sizeMb} MB and the limit is ${limits.sizeMb} MB per image.`,
    };
  }
  return { ok: true };
}

export function addReferenceIfMissing(
  existing: SampleIntakeRef[],
  candidate: SampleIntakeRef,
  validation: ReferenceValidationResult,
): SampleIntakeRef[] {
  if (!validation.ok) return existing;
  if (existing.some((r) => r.id === candidate.id || r.src === candidate.src)) return existing;
  return [...existing, candidate];
}

export function applyPiiDecision(state: PiiHoldState, decision: 'blur' | 'remove'): PiiHoldState {
  if (decision === 'blur') {
    return { ...state, blurred: true, removed: false, styleJobWaiting: false };
  }
  return { ...state, removed: true, styleJobWaiting: false };
}

const SAVE_BY_MODE: Record<IntakeMode, SaveState> = {
  empty: { status: 'saved', tone: 'ok', text: 'Saved 12:41' },
  drop: { status: 'saving', tone: 'ok', text: 'Saving…' },
  imported: { status: 'saved', tone: 'ok', text: 'Saved 12:41' },
  rejected: { status: 'saved', tone: 'ok', text: 'Saved 12:41' },
  pii: { status: 'saved', tone: 'ok', text: 'Saved 12:41' },
  pasted: { status: 'saved', tone: 'ok', text: 'Saved 12:41' },
};

const S28_TABS: ArtifactTabItem[] = [
  { icon: 'grid', name: 'Variance flows' },
  { icon: 'grid', name: 'Alert ideas' },
  { icon: 'frame', name: 'F-03 Variance table' },
  { icon: 'doc', name: 'DESIGN.md' },
];

const CTX_3: ContextItem[] = [
  ['image', INTAKE_REFS.r3.id + ' site-costs', 'r1'],
  ['image', INTAKE_REFS.r4.id + ' tracker', 'r1'],
  ['image', INTAKE_REFS.r5.id + ' status', 'r1'],
];

const CTX_FOOT = '≈ 4.1k tokens · listed items only';

function refMeta(r: SampleIntakeRef): string {
  return `${r.kind} · ${r.size}`;
}

function IntakeBtn(props: {
  label: string;
  cls?: 'ghost' | 'ink' | 'plain';
  sm?: boolean;
  icon?: IntakeIconName;
  kbd?: string;
  does: string;
  feature: string;
  onClick: () => void;
}) {
  const { label, cls = 'ghost', sm, icon, kbd, does, feature, onClick } = props;
  return (
    <button
      type="button"
      className={'sp-btn ' + cls + (sm ? ' sm' : '')}
      data-does={does}
      data-feature={feature}
      onClick={onClick}
    >
      {icon ? <IntakeIcon name={icon} size={14} /> : null}
      {label}
      {kbd ? <span className="int-k">{kbd}</span> : null}
    </button>
  );
}

function Checklist({ rows }: { rows: [boolean, string, string][] }) {
  return (
    <div className="sp-ck">
      {rows.map(([on, text, status]) => (
        <div key={text}>
          <span className={'bx' + (on ? ' on' : '')}>{on ? <Icon name="check" size={10} stroke={2.4} /> : null}</span>
          {text}
          <span>{status}</span>
        </div>
      ))}
    </div>
  );
}

function FileRow(props: { name: string; sub: string; rt: ReactNode; cls?: string }) {
  const { name, sub, rt, cls = '' } = props;
  return (
    <div className={'int-file' + (cls ? ' ' + cls : '')}>
      <span className="th">
        <span className="tk">
          <u style={{ width: '70%' }} />
          <u className="hi" style={{ width: '44%' }} />
          <u />
        </span>
      </span>
      <span className="nm">
        {name}
        <small>{sub}</small>
      </span>
      <span className="rt">{rt}</span>
    </div>
  );
}

function RefFrame(props: {
  id: string;
  name: string;
  meta: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cls?: string;
  lab?: PillTuple;
  onClick?: () => void;
  children: ReactNode;
}) {
  const { id, name, meta, x, y, w, h, cls = '', lab, onClick, children } = props;
  const shownMeta = w < 260 ? meta.split(' · ')[0] : meta;
  return (
    <div
      className={'sp-fr' + (cls ? ' ' + cls : '')}
      style={{ left: x + 'px', top: y + 'px', width: w + 'px' }}
      data-ref={id || undefined}
      onClick={onClick}
    >
      <div className="sp-frl">
        <b>{id}</b>
        {name}
        <span className="r">{shownMeta}</span>
        {lab ? <Pill tone={lab[0]} label={lab[1]} /> : null}
      </div>
      <div className="sp-frb" style={{ height: h + 'px' }}>
        {children}
      </div>
    </div>
  );
}

function UploadSkeleton({ pct }: { pct: number }) {
  return (
    <>
      <div className="int-skel" aria-busy="true">
        <u style={{ width: '46%' }} />
        <u className="b" />
        <u style={{ width: '72%' }} />
      </div>
      <div className="int-prog">
        <span className="int-bar">
          <u style={{ width: pct + '%' }} />
        </span>
        <b className="int-pct">{pct}%</b>
      </div>
    </>
  );
}

function StyleJobBar({ text, wait, onCancel }: { text: string; wait?: boolean; onCancel: () => void }) {
  return (
    <div className={'int-job' + (wait ? ' wait' : '')} data-feature="F149">
      <IntakeIcon name="spark" size={14} />
      {text}
      {!wait ? (
        <>
          <span className="int-bar">
            <u style={{ width: '38%' }} />
          </span>
          <span className="e">≈ 40 s</span>
        </>
      ) : null}
      <Btn
        label="Cancel"
        sm
        cls="plain"
        does="Cancels the style job; the references stay on the board"
        feature="F149"
        onClick={onCancel}
      />
    </div>
  );
}

// S28 Reference intake. Board: docs/design/spekin-canvas/project/S28-reference-intake.dc.html (data-screen="S28").
export function ReferenceIntakeWorkArea(props: {
  initialMode?: IntakeMode;
  onShellOverride?: (o: IntakeShellOverride) => void;
  onOpenShell?: () => void;
  onOpenStyle?: () => void;
} = {}) {
  const { initialMode = 'empty', onShellOverride, onOpenShell, onOpenStyle } = props;
  const [mode, setMode] = useState<IntakeMode>(initialMode);
  const [consent, setConsent] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [piiHold, setPiiHold] = useState<PiiHoldState>({
    heldRefId: INTAKE_REFS.r4.id,
    findings: 3,
    styleJobWaiting: true,
    blurred: false,
    removed: false,
  });

  const view = useWorkspace((s) => s.view('design'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const changeMode = (next: IntakeMode) => {
    setMode(next);
    onShellOverride?.({ save: SAVE_BY_MODE[next] });
  };

  useEffect(() => {
    onShellOverride?.({ save: SAVE_BY_MODE[mode] });
  }, [mode, onShellOverride]);

  const R = INTAKE_REFS;
  const LIM = INTAKE_LIMITS;

  const baseCtx: ContextItem[] =
    mode === 'empty' || mode === 'drop'
      ? []
      : mode === 'imported'
        ? CTX_3
        : mode === 'pii'
          ? CTX_3.slice(0, 1)
          : CTX_3.slice(0, 2);
  const ctxItems = baseCtx.filter(([, name]) => !view.removedCtx.includes(name));
  const ctxFoot = mode === 'empty' || mode === 'drop' ? 'Nothing is sent until you add a reference' : CTX_FOOT;
  const placeholder =
    mode === 'empty' || mode === 'drop'
      ? 'Add references, or ask for a screen…'
      : 'Ask for a screen in the style of your references…';

  const handleChooseOrAdd = () => {
    setBannerDismissed(false);
    if (mode === 'empty') changeMode('drop');
    else if (mode === 'drop') changeMode('imported');
    else if (mode === 'imported') changeMode('rejected');
    else changeMode('drop');
  };

  const handleBoardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      changeMode('pasted');
    } else if (mode === 'pasted' && e.key === 'Escape') {
      e.preventDefault();
      changeMode('imported');
    } else if (mode === 'pasted' && e.key === 'Enter') {
      e.preventDefault();
      changeMode('imported');
    }
  };

  const renderSuggestions = (items: string[]) => (
    <div className="sp-sugg">
      {items.map((text) => (
        <button
          key={text}
          type="button"
          data-does="Puts this prompt in the composer; nothing runs until Send"
          data-feature="F155"
          onClick={() => setView('design', { draft: text })}
        >
          <Icon name="spark" size={13} />
          {text}
        </button>
      ))}
    </div>
  );

  const renderChatBody = () => {
    if (mode === 'empty') {
      return (
        <>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>{MODEL.name}</em>
            </div>
            <p>
              No references on this board yet. Add screenshots of an app you like and I will learn its look before I draw. I read only the images you add.
            </p>
          </div>
          {renderSuggestions(['What can I add here?', 'Draw alert ideas without references'])}
        </>
      );
    }
    if (mode === 'drop') {
      return (
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>{MODEL.name}</em>
          </div>
          <p>Receiving 3 images. I check each one for personal data before I read it.</p>
          <Checklist
            rows={[
              [true, R.r3.src, 'checked'],
              [false, R.r4.src, 'uploading'],
              [false, R.r5.src, 'waiting'],
            ]}
          />
        </div>
      );
    }
    if (mode === 'imported') {
      return (
        <>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>{MODEL.name}</em>
            </div>
            <p>Added 3 references. I am learning their colours, type and spacing. This takes about 40 seconds.</p>
            <div className="sp-gc" data-feature="F149">
              <div className="k">
                <Icon name="spark" size={12} />
                Style job
                <span className="tag">
                  <Pill tone="acc" label="Running" />
                </span>
              </div>
              <div className="tt">Learning style from 3 references</div>
              <Checklist
                rows={[
                  [true, 'Colours and surfaces', 'done'],
                  [false, 'Type scale', 'reading'],
                  [false, 'Spacing and layout', 'queued'],
                ]}
              />
              <div className="ft">
                <span className="s">≈ 40 s · 18 cr, estimate</span>
                <Btn
                  label="Cancel"
                  sm
                  does="Cancels the style job; the references stay on the board and nothing is charged for the unfinished part"
                  feature="F149"
                  onClick={() => recordIntent('F149:cancel-style-job')}
                />
              </div>
            </div>
          </div>
          {renderSuggestions(['Draw an alert drawer in this style'])}
        </>
      );
    }
    if (mode === 'rejected') {
      return (
        <>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>{MODEL.name}</em>
            </div>
            <p>
              2 of 4 images were added. payroll-export.png is over the size limit and status-board.png stopped at 48 percent.
            </p>
          </div>
          {renderSuggestions(['Retry status-board.png', 'Draw alert ideas from the 2 references'])}
        </>
      );
    }
    if (mode === 'pii') {
      return (
        <>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>{MODEL.name}</em>
            </div>
            <p>
              REF-04 shows email addresses, so I have not read it. Blur them or remove the image, and I will carry on with the style.
            </p>
          </div>
          {renderSuggestions(['Blur all 3', 'Use only REF-03 for now'])}
        </>
      );
    }
    return (
      <>
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>{MODEL.name}</em>
          </div>
          <p>Pasted image ready. Check the preview, give it a name if you like, then add it to the board.</p>
        </div>
        {renderSuggestions(['Add to board', 'Discard it'])}
      </>
    );
  };

  const toolStatus =
    mode === 'empty'
      ? 'No references yet'
      : mode === 'drop'
        ? 'Receiving 3 files'
        : mode === 'imported'
          ? 'Style job running'
          : mode === 'rejected'
            ? '2 need your attention'
            : mode === 'pii'
              ? '1 image held'
              : 'Preview before upload';

  const boardSub =
    mode === 'empty'
      ? '0 images · 0 frames'
      : mode === 'drop'
        ? '1 image added · 2 coming'
        : mode === 'imported'
          ? '3 references · 0 drawn frames'
          : mode === 'rejected'
            ? '2 references · 1 refused'
            : mode === 'pii'
              ? '2 references · 1 held'
              : '2 references · 1 pasted preview';

  const panelCount =
    mode === 'empty'
      ? { n: 0, s: 'empty' }
      : mode === 'drop'
        ? { n: 1, s: '3 files' }
        : mode === 'imported'
          ? { n: 3, s: '3 added' }
          : mode === 'rejected'
            ? { n: 2, s: '2 added · 2 need you' }
            : mode === 'pii'
              ? { n: 2, s: '1 added · 1 held' }
              : { n: 2, s: '1 pasted' };

  const renderPanelFiles = () => {
    if (mode === 'empty') return null;
    if (mode === 'drop') {
      return (
        <>
          <FileRow name={R.r3.src} sub={`${R.r3.size} · checked, nothing found`} rt={<Pill tone="ok" label="Added" />} />
          <FileRow
            name={R.r4.src}
            sub={`${R.r4.size} · uploading 62%`}
            rt={
              <>
                <span className="int-bar">
                  <u style={{ width: '62%' }} />
                </span>
                <IconBtn
                  icon="x"
                  size={15}
                  sm
                  label={`Cancel ${R.r4.src}`}
                  does="Cancels this file only: no job is sent for it and the other files continue"
                  feature="F144"
                  onClick={() => recordIntent('F144:cancel:' + R.r4.src)}
                />
              </>
            }
          />
          <FileRow
            name={R.r5.src}
            sub={`${R.r5.size} · waiting`}
            rt={
              <>
                <Pill tone="mute" label="Waiting" />
                <IconBtn
                  icon="x"
                  size={15}
                  sm
                  label={`Cancel ${R.r5.src}`}
                  does="Removes this file from the queue; no job is sent for it"
                  feature="F144"
                  onClick={() => recordIntent('F144:cancel:' + R.r5.src)}
                />
              </>
            }
          />
        </>
      );
    }
    if (mode === 'imported') {
      return [R.r3, R.r4, R.r5].map((r) => (
        <FileRow key={r.id} name={r.src} sub={`${r.size} · ${r.dim}`} rt={<Pill tone="ok" label="Added" />} />
      ));
    }
    if (mode === 'rejected') {
      return (
        <>
          <FileRow name={R.r3.src} sub={R.r3.size} rt={<Pill tone="ok" label="Added" />} />
          <FileRow name={R.r4.src} sub={R.r4.size} rt={<Pill tone="ok" label="Added" />} />
          <FileRow
            name="payroll-export.png"
            sub="14.2 MB · over the limit"
            cls="bad"
            rt={
              <Btn
                label="Retry"
                sm
                does="Reads payroll-export.png again once; images already added are kept and nothing is added twice"
                feature="F148"
                onClick={() => changeMode('imported')}
              />
            }
          />
          <FileRow
            name={R.r5.src}
            sub="520 KB · stopped at 48%"
            cls="bad"
            rt={
              <Btn
                label="Retry"
                sm
                does={`Reads ${R.r5.src} again once; images already added are kept and nothing is added twice`}
                feature="F148"
                onClick={() => changeMode('imported')}
              />
            }
          />
        </>
      );
    }
    if (mode === 'pii') {
      return (
        <>
          <FileRow name={R.r3.src} sub={`${R.r3.size} · checked, nothing found`} rt={<Pill tone="ok" label="Added" />} />
          <FileRow
            name={R.r4.src}
            sub="860 KB · 3 emails found"
            cls="warn"
            rt={<Pill tone="warn" label="Held" />}
          />
        </>
      );
    }
    return (
      <FileRow
        name={R.r6.src}
        sub={`${R.r6.size} · not uploaded`}
        rt={
          <>
            <Pill tone="acc" label="Ready" />
            <IconBtn
              icon="x"
              size={15}
              sm
              label="Discard pasted image"
              does="Drops the pasted image; nothing was uploaded"
              feature="F152"
              onClick={() => changeMode('imported')}
            />
          </>
        }
      />
    );
  };

  const renderBanner = () => {
    if (mode === 'rejected' && !bannerDismissed) {
      return (
        <div className="sp-banner bad" role="alert" data-feature="F150">
          <span className="ib">
            <Icon name="alert" size={16} />
          </span>
          <p>
            <b>payroll-export.png was not added.</b> It is 14.2 MB and the limit is {LIM.sizeMb} MB per image. The 2 images already added are kept.
          </p>
          <Btn
            label="Retry"
            sm
            cls="ink"
            does="Reads payroll-export.png again, for example after you made it smaller; it is added once"
            feature="F150"
            onClick={() => changeMode('imported')}
          />
          <Btn
            label="Choose another file"
            sm
            does="Opens the file picker for a different image"
            feature="F150"
            onClick={() => changeMode('drop')}
          />
          <Btn
            label="Dismiss"
            sm
            cls="plain"
            does="Hides this message; the file stays in the list below until you remove it"
            feature="F150"
            onClick={() => setBannerDismissed(true)}
          />
        </div>
      );
    }
    if (mode === 'pii' && !piiHold.removed) {
      return (
        <div className="sp-banner warn" role="alert" data-feature="F151">
          <span className="ib">
            <Icon name="alert" size={16} />
          </span>
          <p>
            <b>3 email addresses found in {R.r4.id}.</b> Spekin will not use this image until you blur them or remove it.
          </p>
          <IntakeBtn
            label="Blur all 3"
            sm
            cls="ink"
            icon="blur"
            does="Blurs the 3 regions in a copy the model reads; the original stays private until it is purged"
            feature="F151"
            onClick={() => setPiiHold((s) => applyPiiDecision(s, 'blur'))}
          />
          <Btn
            label="Review each"
            sm
            does="Steps through the 3 findings so you can blur or keep each region"
            feature="F151"
            onClick={() => recordIntent('F151:review-each')}
          />
          <Btn
            label="Remove image"
            sm
            cls="plain"
            does="Removes this reference and its original from the project after you confirm"
            feature="F151"
            onClick={() => setPiiHold((s) => applyPiiDecision(s, 'remove'))}
          />
        </div>
      );
    }
    return null;
  };

  const renderBoardInner = () => {
    if (mode === 'empty') {
      return (
        <div className="int-start" data-feature="F141">
          <h2>Start from what you already have</h2>
          <p>
            References teach Spekin the look and the structure you want. Nothing leaves this project unless you add it to a run.
          </p>
          <div className="int-sg">
            <div className="int-s2 lead">
              <b>
                <Icon name="image" size={16} />
                Drop screenshots
              </b>
              PNG, JPEG or WebP from any app, even one behind a login.
              <span className="row">
                <Btn
                  label="Choose files"
                  cls="ink"
                  sm
                  does="Opens the system file picker for PNG, JPEG or WebP; keyboard users reach it with Tab then Enter"
                  feature="F143"
                  onClick={handleChooseOrAdd}
                />
              </span>
            </div>
            <div className="int-s2">
              <b>
                <IntakeIcon name="clipboard" size={16} />
                Paste a screenshot
              </b>
              Copy one, click the board, then press
              <span className="row">
                <span className="int-k">⌘V</span>
                <span>or</span>
                <span className="int-k">Ctrl V</span>
              </span>
            </div>
            <button
              type="button"
              className="int-s2"
              data-later="Capture from a live page needs an in-app browser; deferred (FR-04 to FR-09)"
              disabled
            >
              <b>
                <Icon name="globe" size={16} />
                Capture a live page
              </b>
              Needs an in-app browser. Planned after the first release.
            </button>
            <button
              type="button"
              className="int-s2"
              data-later="Sending frames from an editor over MCP is deferred (FR-47)"
              disabled
            >
              <b>
                <IntakeIcon name="plug" size={16} />
                Send frames from your editor
              </b>
              Connect over MCP. Planned after the first release.
            </button>
          </div>
        </div>
      );
    }

    if (mode === 'drop') {
      return (
        <>
          <div className="int-droplit" data-feature="F144" onClick={() => changeMode('imported')}>
            <span className="ico">
              <IntakeIcon name="upload" size={22} />
            </span>
            <b>Release to add 3 images</b>
            <span>
              {R.r3.src}, {R.r4.src} and {R.r5.src}
            </span>
          </div>
          <RefFrame id={R.r3.id} name={R.r3.src} meta={refMeta(R.r3)} x={28} y={250} w={226} h={150}>
            <MiniDashboard title="Site costs · Q2" kpi chart table={false} h={150} />
            <div className="int-prog">
              <span>Checked</span>
              <span className="int-bar">
                <u style={{ width: '100%' }} />
              </span>
              <b className="int-pct">100%</b>
            </div>
          </RefFrame>
          <RefFrame id={R.r4.id} name={R.r4.src} meta={refMeta(R.r4)} x={270} y={250} w={226} h={150} cls="draft">
            <UploadSkeleton pct={62} />
          </RefFrame>
          <RefFrame id={R.r5.id} name={R.r5.src} meta={refMeta(R.r5)} x={512} y={250} w={226} h={150} cls="draft">
            <UploadSkeleton pct={0} />
          </RefFrame>
        </>
      );
    }

    if (mode === 'imported') {
      return (
        <>
          <StyleJobBar text="Learning style from 3 references" onCancel={() => recordIntent('F149:cancel-style-job')} />
          <RefFrame id={R.r3.id} name={R.r3.src} meta={refMeta(R.r3)} x={28} y={64} w={340} h={214}>
            <MiniDashboard title="Site costs · Q2" kpi chart table={false} h={214} />
          </RefFrame>
          <RefFrame
            id={R.r4.id}
            name={R.r4.src}
            meta={refMeta(R.r4)}
            x={396}
            y={64}
            w={340}
            h={214}
            onClick={() => changeMode('pii')}
          >
            <MiniDashboard title="Weekly tracker" kpi={false} chart={false} table rows={4} h={214} />
          </RefFrame>
          <RefFrame id={R.r5.id} name={R.r5.src} meta={refMeta(R.r5)} x={28} y={322} w={340} h={214}>
            <MiniDashboard title="Status board" kpi chart={false} table rows={2} h={214} />
          </RefFrame>
        </>
      );
    }

    if (mode === 'rejected') {
      return (
        <>
          <RefFrame id={R.r3.id} name={R.r3.src} meta={refMeta(R.r3)} x={28} y={64} w={340} h={214}>
            <MiniDashboard title="Site costs · Q2" kpi chart table={false} h={214} />
          </RefFrame>
          <RefFrame
            id={R.r4.id}
            name={R.r4.src}
            meta={refMeta(R.r4)}
            x={396}
            y={64}
            w={340}
            h={214}
            onClick={() => changeMode('pii')}
          >
            <MiniDashboard title="Weekly tracker" kpi={false} chart={false} table rows={4} h={214} />
          </RefFrame>
          <RefFrame id="" name="payroll-export.png" meta="not added" x={28} y={322} w={340} h={150} cls="draft">
            <div className="tk-e">
              <Icon name="alert" size={20} stroke={1.5} />
              Not added: over the size limit
            </div>
          </RefFrame>
        </>
      );
    }

    if (mode === 'pii') {
      return (
        <>
          <StyleJobBar
            text={`Style job waits for ${R.r4.id}`}
            wait={piiHold.styleJobWaiting}
            onCancel={() => recordIntent('F149:cancel-style-job')}
          />
          {!piiHold.removed ? (
            <>
              <RefFrame
                id={R.r4.id}
                name={R.r4.src}
                meta={refMeta(R.r4)}
                x={28}
                y={64}
                w={430}
                h={250}
                cls="sel"
                lab={['warn', 'Held']}
              >
                <div className="int-shot">
                  <div className="bar">
                    <i />
                    Weekly tracker<span>Week 47</span>
                  </div>
                  <div className="tb h">
                    <span>Package</span>
                    <span>Owner</span>
                    <span>Status</span>
                  </div>
                  {INTAKE_PII.map(([, email, pkg], i) => (
                    <div key={pkg} className="tb">
                      <span>{pkg}</span>
                      <span>
                        {i < 3 ? (
                          <span className={'int-em' + (piiHold.blurred ? ' bl' : '')}>
                            <i>{i + 1}</i>
                            {email}
                          </span>
                        ) : (
                          'Unassigned'
                        )}
                      </span>
                      <span>{i === 2 ? 'Over' : 'On track'}</span>
                    </div>
                  ))}
                  <div className="int-sbar">4 packages · updated 12:20</div>
                </div>
              </RefFrame>
              <div className="int-pop" data-feature="F151" style={{ left: '480px', top: '92px' }}>
                <div className="k">
                  <Icon name="alert" size={14} />
                  Personal data in {R.r4.id}
                </div>
                <p>Email addresses in the Owner column. Blurred regions cannot be read by the model or in exports.</p>
                <ul>
                  {[1, 2, 3].map((n) => (
                    <li key={n}>
                      <i>{n}</i>Owner column, row P-0{n}
                      <span>email</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
          <RefFrame id={R.r3.id} name={R.r3.src} meta={refMeta(R.r3)} x={480} y={330} w={226} h={150}>
            <MiniDashboard title="Site costs · Q2" kpi chart table={false} h={150} />
          </RefFrame>
        </>
      );
    }

    return (
      <>
        <div className="int-toast">
          <IntakeIcon name="clipboard" size={14} />
          Pasted from the clipboard. Preview only; nothing is uploaded yet.
        </div>
        <RefFrame id={R.r3.id} name={R.r3.src} meta={refMeta(R.r3)} x={28} y={64} w={226} h={150}>
          <MiniDashboard title="Site costs · Q2" kpi chart table={false} h={150} />
        </RefFrame>
        <RefFrame id={R.r4.id} name={R.r4.src} meta={refMeta(R.r4)} x={270} y={64} w={226} h={150}>
          <MiniDashboard title="Weekly tracker" kpi={false} chart={false} table rows={4} h={150} />
        </RefFrame>
        <RefFrame
          id={R.r6.id}
          name={R.r6.src}
          meta={refMeta(R.r6)}
          x={176}
          y={250}
          w={380}
          h={170}
          cls="int-ghost"
          lab={['acc', 'Not added yet']}
        >
          <MiniDashboard title="Status board" kpi chart={false} table rows={2} h={170} />
        </RefFrame>
        <div className="int-pbar" data-feature="F152" style={{ left: '176px', top: '456px' }}>
          <div className="int-fi">
            {R.r6.src}
            <i className="int-caret" />
          </div>
          <div className="r">
            <span className="int-hint">
              {R.r6.kind} · {R.r6.size} · {R.r6.dim}
            </span>
            <span className="sp-fill" />
            <IntakeBtn
              label="Discard"
              sm
              cls="plain"
              kbd="esc"
              does="Drops the pasted image; nothing was uploaded"
              feature="F152"
              onClick={() => changeMode('imported')}
            />
            <IntakeBtn
              label="Add to board"
              sm
              cls="ink"
              kbd="↵"
              does="Uploads the pasted image and places it as a reference frame on the board"
              feature="F152"
              onClick={() => changeMode('imported')}
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Design chat"
          sub="Alert ideas"
          ctxItems={ctxItems}
          ctxFoot={ctxFoot}
          placeholder={placeholder}
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
          onAttach={handleChooseOrAdd}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          {renderChatBody()}
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={S28_TABS}
          activeTab="Alert ideas"
          onSelect={(tab) => {
            if (tab === 'Variance flows' && onOpenShell) onOpenShell();
            else if (tab === 'DESIGN.md' && onOpenStyle) onOpenStyle();
            else setView('design', { tab });
          }}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={
            <Btn
              label="Add references"
              cls="ink"
              icon="image"
              does="Opens the file picker for PNG, JPEG or WebP images"
              feature="F143"
              onClick={handleChooseOrAdd}
            />
          }
        />
        {renderBanner()}
        <div className="sp-tool">
          <ViewSwitch current={view.viewMode} onChange={(viewMode) => setView('design', { viewMode })} />
          <span className="sp-crumb">
            Design
            <Icon name="chevR" size={12} />
            <b>Alert ideas</b>
          </span>
          <span className="sp-fill" />
          <span className="sp-crumb">{toolStatus}</span>
        </div>
        <div className="sp-work">
          <div
            className="sp-cv int-cv"
            aria-label="Board: Alert ideas"
            tabIndex={0}
            onKeyDown={handleBoardKeyDown}
            onPaste={(e) => {
              e.preventDefault();
              changeMode('pasted');
            }}
          >
            <div className="sp-cvt">
              Alert ideas<span>{boardSub}</span>
            </div>
            {renderBoardInner()}
          </div>

          <aside className="int-pan" aria-label="Reference intake" data-feature="F142">
            <div className="ph">
              <div className="a">
                <b>References</b>
                <Pill tone="mute" label={panelCount.n + (panelCount.n === 1 ? ' image' : ' images')} />
              </div>
              <span className="s">Private to this project. Used only when you add them to a run.</span>
            </div>
            <div className="int-pb">
              <div className={'int-dz' + (mode === 'drop' ? ' lit' : '')}>
                <span className="ico">
                  <IntakeIcon name="upload" size={18} />
                </span>
                <b>{mode === 'drop' ? 'Release to add' : 'Drop images here'}</b>
                <span className="or">
                  <Btn
                    label="Choose files"
                    sm
                    does="Opens the system file picker for PNG, JPEG or WebP; Enter or Space on the focused button does the same"
                    feature="F143"
                    onClick={handleChooseOrAdd}
                  />
                  or paste <span className="int-k">⌘V</span>
                </span>
                <span>
                  {LIM.types} · {LIM.sizeMb} MB each · {LIM.perImport} max
                </span>
              </div>
              <button
                type="button"
                role="checkbox"
                aria-checked={consent}
                className="int-cons"
                data-does="Confirms you may use these images in this project; the choice is saved with each reference"
                data-feature="F146"
                onClick={() => setConsent((c) => !c)}
              >
                <span className={'bx' + (consent ? ' on' : '')}>
                  {consent ? <Icon name="check" size={11} stroke={2.4} /> : null}
                </span>
                <span>
                  I may use these images here. They stay private and go only to model providers whose terms forbid training on them.
                </span>
              </button>
              <div className="int-pd">
                <IntakeIcon name="shield" size={15} />
                <span>Spekin checks each image for emails, card numbers and passwords before any model reads it.</span>
              </div>
              <div className="int-lh">
                This import<span>{panelCount.s}</span>
              </div>
              <div className="int-fs">{renderPanelFiles()}</div>
              {mode === 'empty' ? (
                <div className="int-empty">
                  Nothing added yet. Files you drop, choose or paste show up here with their status.
                </div>
              ) : null}
              <div className="int-lh">
                Not yet<span>planned</span>
              </div>
              <button
                type="button"
                className="int-later"
                data-later="Capture from a live page needs an in-app browser; deferred (FR-04 to FR-09)"
                disabled
              >
                <Icon name="globe" size={15} />
                <span>Capture a live page</span>
              </button>
              <button
                type="button"
                className="int-later"
                data-later="Connecting an editor over MCP is deferred (FR-47)"
                disabled
              >
                <IntakeIcon name="plug" size={15} />
                <span>Connect an editor (MCP)</span>
              </button>
              <div className="int-keep">
                <Icon name="history" size={15} />
                <span>Originals are deleted {LIM.keepDays} days after import, unless you keep them.</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
