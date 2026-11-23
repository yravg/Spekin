import { useEffect, useState } from 'react';
import { sampleData, type SampleReviewVariant } from '../data/source';
const { MODEL, REVIEW_ALSO, REVIEW_OUTSIDE, REVIEW_PART, REVIEW_VARIANTS } = sampleData;
import { useWorkspace } from '../state/workspace';
import { Icon } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { ViewSwitch } from '../shell/ViewSwitch';
import { Inspector, InspectorRow } from '../shell/Inspector';
import { F03_AFTER, F03_ALSO_KEYS, F03Table, FrameAbs, RevBtn, ReviewCanvasPalette } from './F03Table';

export type TargetedState = 'select' | 'working' | 'applied' | 'compare' | 'variations' | 'clip';

export interface TargetedProposal {
  status: 'draft';
  baseRev: string;
  draftRev: string;
  accepted: false;
  instruction: string;
  proposedValue: string;
  relatedCount: number;
}

// Pure helper: a targeted change creates a draft proposal and never edits the accepted frame directly (R-WS-7, R-CAN-5).
export function createTargetedProposal(
  acceptedFrame: Readonly<{ id: string; rev: string; status: 'accepted'; forecast: string }>,
  instruction: string,
  proposedValue: string,
): TargetedProposal {
  return {
    status: 'draft',
    baseRev: acceptedFrame.rev,
    draftRev: REVIEW_PART.draft,
    accepted: false,
    instruction,
    proposedValue,
    relatedCount: REVIEW_ALSO.length,
  };
}

function makeTabs(dirty: boolean): ArtifactTabItem[] {
  return [
    { icon: 'grid', name: 'Variance flows' },
    { icon: 'frame', name: 'F-03 Variance table', dirty },
    { icon: 'frame', name: 'F-04 Alert drawer' },
    { icon: 'doc', name: 'DESIGN.md' },
    { icon: 'req', name: 'Spec §3' },
  ];
}

function PillVariant({ v }: { v: SampleReviewVariant }) {
  return (
    <>
      <span className="rev-pl">{v.text}</span>
      {v.badge ? (
        <span className="rev-bd" title="Periods over">
          {v.badge}
        </span>
      ) : null}
    </>
  );
}

function PartListRow({ id, name, sub, sel }: { id: string; name: string; sub: string; sel?: boolean }) {
  return (
    <div className="sp-row">
      <span className="id">{id}</span>
      <span className="nm">
        {name}
        <small>{sub}</small>
      </span>
      {sel ? <Pill tone="acc" label="Selected" /> : <span />}
    </div>
  );
}

function ChangePopover(props: {
  pos: 'r' | 'b';
  part: { name: string; pkg: string; size: string; font: string };
  text: string;
  clip: boolean;
  warn?: boolean;
  varCount: number;
  onText: (t: string) => void;
  onSend: () => void;
  onSendToChat: () => void;
  onVariations: () => void;
  onVarDelta: (d: number) => void;
  onToggleClip: () => void;
  onClose: () => void;
}) {
  const { pos, part, text, clip, warn, varCount, onText, onSend, onSendToChat, onVariations, onVarDelta, onToggleClip, onClose } =
    props;
  return (
    <div className={'rev-pop ' + pos} role="dialog" aria-label={'Change the ' + part.name}>
      <div className="rev-pn">
        <Icon name="pointer" size={14} />
        <b>{part.name}</b>
        <small>{part.pkg}</small>
        <span className="sp-fill" />
        <IconBtn
          icon="x"
          label="Close"
          does="Closes the popover and keeps the part selected; Esc does the same"
          sm
          feature="F222"
          onClick={onClose}
        />
      </div>
      <div className="rev-pm">
        <span>Size</span>
        <b>{part.size}</b>
        <span>Type</span>
        <b>{part.font}</b>
      </div>
      <input
        className="rev-in"
        type="text"
        value={text}
        onChange={(e) => onText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && text.trim()) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="What should change about this element?"
        aria-label={'Instruction for the ' + part.name}
        data-does="Takes a one-line instruction for this part only; Enter sends it"
        data-feature="F223"
      />
      <div className="rev-act">
        <RevBtn
          cls="ink"
          disabled={!text}
          does="Sends the instruction as a change to this part only. Disabled while the field is empty"
          feature="F224"
          onClick={onSend}
        >
          Send <span className="rev-kbd">↵</span>
        </RevBtn>
        <RevBtn
          does="Moves the instruction and the selected part into the chat composer instead of running it"
          feature="F225"
          onClick={onSendToChat}
        >
          Send to chat <span className="rev-kbd">⌘↵</span>
        </RevBtn>
      </div>
      <div className="rev-opt-row">
        <span className="rev-grp">
          <button
            type="button"
            className="go"
            data-does="Draws the chosen number of variations of this part; each one is reviewed on its own"
            data-feature="F228"
            onClick={onVariations}
          >
            <Icon name="layers" size={14} />
            Variations
          </button>
          <IconBtn
            icon="minus"
            label="Fewer variations"
            does="Lowers the number of variations, minimum 2"
            sm
            feature="F228"
            onClick={() => onVarDelta(-1)}
          />
          <span className="nbr">{varCount}</span>
          <IconBtn
            icon="plus"
            label="More variations"
            does="Raises the number of variations, maximum 6"
            sm
            feature="F228"
            onClick={() => onVarDelta(1)}
          />
        </span>
        <button
          type="button"
          className="rev-tg"
          aria-pressed={clip}
          title="Change only this area"
          data-does="Clip: the change stays inside this part's box; nothing around it moves or resizes"
          data-feature="F230"
          onClick={onToggleClip}
        >
          <Icon name="square" size={14} />
          Clip
        </button>
      </div>
      {warn ? (
        <div className="rev-warn">
          <Icon name="alert" size={14} />
          <span>Text does not fit the clip: it is cut to “+6.4…”. Shorten it or turn Clip off.</span>
        </div>
      ) : null}
      <div className="rev-pf">
        <span>≈ 4 to 8 cr · Sonnet 5.5</span>
        <span className="sp-fill" />
        <span>Esc closes</span>
      </div>
    </div>
  );
}

// S32 Targeted change (boards-review.mjs). States: select, working, applied, compare, variations, clip.
export function TargetedChangeWorkArea(props: { initialState?: TargetedState; onLeaveTargeted?: () => void }) {
  const { initialState = 'select', onLeaveTargeted } = props;
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const [state, setState] = useState<TargetedState>(initialState);
  const [selectedPart, setSelectedPart] = useState<'cell' | 'pill'>(
    initialState === 'variations' || initialState === 'clip' ? 'pill' : 'cell',
  );
  const [askOnSelect, setAskOnSelect] = useState(true);
  const [instruction, setInstruction] = useState(initialState === 'clip' ? REVIEW_PART.pill.ask : '');
  const [varCount, setVarCount] = useState(3);
  const [activeVar, setActiveVar] = useState(1);
  const [chatDraft, setChatDraft] = useState('');

  // DPAI: Escape leaves targeted-edit mode / popover, while keeping tabs and sidebar keyboard-reachable.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (state === 'clip' || state === 'variations' || state === 'compare') {
          setState('select');
          setSelectedPart('cell');
        } else if (state === 'select') {
          setAskOnSelect(false);
          onLeaveTargeted?.();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, onLeaveTargeted]);

  const C = REVIEW_PART.cell;
  const PL = REVIEW_PART.pill;
  const isDirty = state === 'applied' || state === 'compare' || state === 'variations';

  const right = (
    <>
      <Btn label="Share" icon="share" later="Share and comment links (deferred in the browser MVP, R-WS-3)" />
      <Btn
        label="Hand off"
        cls="ink"
        icon="download"
        does="Opens S34: downloads only accepted revisions with a fixed revision manifest"
        feature="F104"
        onClick={() => recordIntent('F104:handoff')}
      />
    </>
  );

  const partChip =
    state === 'variations' || state === 'clip' ? 'F-03 · Variance pill P-03' : 'F-03 · Forecast cell P-03';
  const ctxFoot =
    state === 'select'
      ? 'Selecting sends nothing and does not open chat'
      : state === 'working'
        ? '8 cr reserved · selection kept on the canvas'
        : state === 'variations' || state === 'clip'
          ? 'Only the Variance pill is sent'
          : '9.4k tokens · only F-03 and the items listed';

  const renderChatMsgs = () => (
    <>
      <div className="sp-ub">Add an alert drawer to the variance table for packages over 3%.</div>
      <div className="sp-ai">
        <div className="h">
          <span className="av">S</span>Spekin<em>Sonnet 5.5 · 34 s · 22 cr</em>
        </div>
        <p>
          Drew <b>F-04 Alert drawer</b> as a draft. F-03 stays accepted at r6.
        </p>
      </div>
      {state === 'select' ? (
        <div className="sp-sugg">
          <button
            type="button"
            data-does="Puts this prompt in the composer; nothing runs until Send"
            data-feature="F114"
            onClick={() => setChatDraft('Round every forecast to 2 decimals')}
          >
            <Icon name="spark" size={13} />
            Round every forecast to 2 decimals
          </button>
          <button
            type="button"
            data-does="Puts this prompt in the composer; nothing runs until Send"
            data-feature="F114"
            onClick={() => setChatDraft('Show the period count in the pills')}
          >
            <Icon name="spark" size={13} />
            Show the period count in the pills
          </button>
        </div>
      ) : null}
      {state === 'working' ? (
        <div className="sp-gc" onClick={() => setState('applied')}>
          <div className="k">
            <Icon name="spark" size={12} />
            Part change
            <span className="tag">
              <Pill tone="acc" label="Working · 6 s" />
            </span>
          </div>
          <div className="tt">Forecast cell, P-03 in F-03</div>
          <div className="bd">“{C.ask}”</div>
          <div className="sp-ck">
            <div>
              <span className="bx on">
                <Icon name="check" size={10} stroke={3} />
              </span>
              <span>Read the part and its links</span>
              <Pill tone="ok" label="Done" />
            </div>
            <div>
              <span className="bx" />
              <span>Change the value</span>
              <Pill tone="acc" label="Working" />
            </div>
            <div>
              <span className="bx" />
              <span>Check related values</span>
              <Pill tone="mute" label="Waiting" />
            </div>
          </div>
          <div className="ft">
            <span className="s">Reserved 8 cr · Sonnet 5.5</span>
            <RevBtn
              does="Stops the job; the part keeps 6.28 and the reserved credits are released"
              feature="F226"
              onClick={() => setState('select')}
            >
              Stop
            </RevBtn>
          </div>
        </div>
      ) : null}
      {state === 'applied' ? (
        <>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 22 s · 7 cr</em>
            </div>
            <p>
              Changed the P-03 forecast from <b>6.28 to 5.95</b>. <b>4 related values</b> changed with it, so this edit is not
              isolated.
            </p>
          </div>
          <div className="sp-sugg">
            <button
              type="button"
              data-does="Puts this prompt in the composer; nothing runs until Send"
              data-feature="F114"
              onClick={() => setState('compare')}
            >
              <Icon name="spark" size={13} />
              Compare the whole frame
            </button>
            <button
              type="button"
              data-does="Puts this prompt in the composer; nothing runs until Send"
              data-feature="F114"
              onClick={() => setChatDraft('Ask the same re-quote on F-04')}
            >
              <Icon name="spark" size={13} />
              Ask the same re-quote on F-04
            </button>
          </div>
        </>
      ) : null}
      {state === 'compare' ? (
        <div className="sp-ai">
          <div className="h">
            <span className="av">S</span>Spekin<em>Sonnet 5.5 · 22 s · 7 cr</em>
          </div>
          <p>
            Comparing F-03 r6 with the draft. <b>5 values differ</b>; 4 of them are outside the part you selected.
          </p>
        </div>
      ) : null}
      {state === 'variations' ? (
        <>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 18 s · 12 cr</em>
            </div>
            <p>
              Drew <b>3 variations</b> of the Variance pill. Nothing applies until you press Apply.
            </p>
          </div>
          <div className="sp-sugg">
            <button
              type="button"
              data-does="Puts this prompt in the composer; nothing runs until Send"
              data-feature="F114"
              onClick={() => setChatDraft('Try 3 more variations')}
            >
              <Icon name="spark" size={13} />
              Try 3 more variations
            </button>
          </div>
        </>
      ) : null}
      {state === 'clip' ? (
        <div className="sp-sugg">
          <button
            type="button"
            data-does="Puts this prompt in the composer; nothing runs until Send"
            data-feature="F114"
            onClick={() => setChatDraft('Round every forecast to 2 decimals')}
          >
            <Icon name="spark" size={13} />
            Round every forecast to 2 decimals
          </button>
        </div>
      ) : null}
    </>
  );

  const chat = (
    <ChatPanel
      title="Design chat"
      sub="F-03 selected"
      ctxItems={[
        ['frame', partChip, 'part'],
        ['frame', 'F-03 Variance table', 'r6'],
        ['doc', 'DESIGN.md', 'r3'],
        ['req', 'R-DASH-014', 'r14'],
      ]}
      ctxFoot={ctxFoot}
      placeholder="Ask for a change to F-03, or @ another frame…"
      draft={chatDraft}
      model={MODEL}
      onResize={() => {}}
      onHistory={() => recordIntent('F114:history')}
      onNewChat={() => setChatDraft('')}
      onCollapse={() => recordIntent('F114:collapse')}
      onRemoveCtx={(n) => recordIntent('F106:rm:' + n)}
      onAddCtx={() => recordIntent('F106:add')}
      onDraftChange={setChatDraft}
      onAttach={() => recordIntent('F114:attach')}
      onMention={() => recordIntent('F106:mention')}
      onOpenModel={() => recordIntent('F107:model')}
      onSend={() => recordIntent('F114:send')}
    >
      {renderChatMsgs()}
    </ChatPanel>
  );

  // ---- Whole-frame Compare state
  if (state === 'compare') {
    const rowsCmp: [boolean, string, string, string, string][] = [
      [true, 'Forecast cell · P-03', C.before, C.after, 'Selected region'],
      ...REVIEW_ALSO.map((a): [boolean, string, string, string, string] => [false, a.el, a.from, a.to, 'Outside the region']),
    ];
    return (
      <>
        {chat}
        <section className="sp-main" aria-label="Work area">
          <ArtifactTabs
            tabs={makeTabs(true)}
            activeTab="Variance flows"
            onSelect={(n) => recordIntent('F104:tab:' + n)}
            onClose={(n) => recordIntent('F104:close:' + n)}
            onOpenArtifact={() => recordIntent('F104:open')}
            right={right}
          />
          <div className="sp-tool">
            <ViewSwitch current="Compare" onChange={(v) => (v === 'Canvas' ? setState('applied') : recordIntent('F104:' + v))} />
            <span className="sp-crumb">
              Design
              <Icon name="chevR" size={12} />
              <b>F-03 Variance table</b>
            </span>
            <span className="sp-fill" />
            <IconBtn icon="undo" label="Undo" does="Undoes the last draft edit on this board" sm feature="F116" onClick={() => setState('select')} />
            <IconBtn icon="redo" label="Redo" does="Redoes the last undone draft edit" sm feature="F116" onClick={() => recordIntent('F116:redo')} />
            <IconBtn icon="history" label="Revisions" does="Opens the revision list of the selected artifact" sm feature="F108" onClick={() => recordIntent('F108:revisions')} />
          </div>
          <div className="sp-work rev-cwork">
            <div className="rev-cmp">
              <div className="rev-cf">
                <div className="rev-cl">
                  <b>Original</b>F-03 r6 <Pill tone="ok" label="Accepted" />
                </div>
                <div className="sp-frb rev-fb">
                  <F03Table c1={50} c2={176} c3={62} />
                </div>
              </div>
              <div className="rev-cf">
                <div className="rev-cl">
                  <b>With your change</b>F-03 draft r7 <Pill tone="warn" label="Draft" />
                </div>
                <div className="sp-frb rev-fb">
                  <F03Table
                    val={F03_AFTER}
                    also={F03_ALSO_KEYS}
                    extras={{ f3: <i className="rev-out" /> }}
                    c1={50}
                    c2={176}
                    c3={62}
                  />
                </div>
              </div>
            </div>
            <div className="rev-sum">
              <div className="rev-sh">
                5 values differ<span>1 in the region you selected, 4 outside it</span>
                <span className="sp-fill" />
                <RevBtn does="While held, flips the right frame to the original in place" feature="F232" onClick={() => recordIntent('F232:hold')}>
                  Hold to compare <span className="rev-kbd">O</span>
                </RevBtn>
                <RevBtn does="Undoes the change and its related values in one step" feature="F233" onClick={() => setState('select')}>
                  <Icon name="undo" size={14} />
                  Undo
                </RevBtn>
                <RevBtn cls="ink" does="Keeps the change as a draft and returns to the canvas" feature="F227" onClick={() => setState('applied')}>
                  Done <span className="rev-kbd">↵</span>
                </RevBtn>
              </div>
              <div className="rev-sr hd">
                <span />
                <span>Element</span>
                <span>Before</span>
                <span>After</span>
                <span>Where</span>
              </div>
              {rowsCmp.map(([isSel, el, before, after, where]) => (
                <div key={el} className="rev-sr">
                  <i className={'sw ' + (isSel ? 's' : 'd')} />
                  <span>{el}</span>
                  <span className="m">
                    <s>{before}</s>
                  </span>
                  <span className="m">{after}</span>
                  <span>{where}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  // ---- Canvas states: select, working, applied, variations, clip
  const currentVar = REVIEW_VARIANTS.find((v) => v.id === activeVar) ?? REVIEW_VARIANTS[0]!;

  const renderCanvasContent = () => {
    if (state === 'working') {
      return (
        <>
          <FrameAbs>
            <F03Table
              extras={{
                f3: (
                  <>
                    <i className="rev-out" />
                    <span className="rev-spin" role="status" aria-label="Working on this part">
                      <i />
                    </span>
                  </>
                ),
              }}
            />
          </FrameAbs>
          <div className="rev-bar" style={{ left: '64px', top: '468px' }}>
            <span className="rev-spin in" role="status" aria-label="Working on the Forecast cell">
              <i />
            </span>
            <div className="tx" onClick={() => setState('applied')}>
              <b>Changing 1 part · 6 s</b>
              <span>Chat stays closed. Pan, zoom and select other parts meanwhile.</span>
            </div>
            <RevBtn
              does="Stops the job; the part keeps 6.28 and the reserved credits are released"
              feature="F226"
              onClick={() => setState('select')}
            >
              Stop
            </RevBtn>
          </div>
        </>
      );
    }

    if (state === 'applied') {
      return (
        <>
          <FrameAbs rev="r7" st={['warn', 'Draft · not accepted']}>
            <F03Table val={F03_AFTER} also={F03_ALSO_KEYS} extras={{ f3: <i className="rev-out" /> }} />
          </FrameAbs>
          <div className="rev-bar" style={{ left: '44px', top: '468px', width: '600px' }}>
            <div className="tx">
              <b>Applied in place</b>
              <span>Draft r7 · 4 related values changed</span>
            </div>
            <span className="sp-fill" />
            <RevBtn
              does="Reopens the popover on this part with the last instruction, to refine it or to ask a question about it"
              feature="F227"
              onClick={() => setState('select')}
            >
              <Icon name="spark" size={14} />
              Ask or change
            </RevBtn>
            <RevBtn
              does="Hold to show the original of the whole frame in place; release to return to the change"
              feature="F232"
              onClick={() => setState('compare')}
            >
              Compare <span className="rev-kbd">O</span>
            </RevBtn>
            <RevBtn does="Undoes this change and its related values in one step" feature="F233" onClick={() => setState('select')}>
              <Icon name="undo" size={14} />
              Undo
            </RevBtn>
            <RevBtn
              cls="ink"
              does="Keeps the change as a draft and closes this bar; it is accepted later in the review (S33)"
              feature="F227"
              onClick={() => recordIntent('F227:done')}
            >
              Done <span className="rev-kbd">↵</span>
            </RevBtn>
          </div>
        </>
      );
    }

    if (state === 'variations') {
      return (
        <>
          <FrameAbs rev="r6" st={['acc', 'Variation preview']}>
            <F03Table extras={{ v3: <i className="rev-out pill" /> }} pillNode={<PillVariant v={currentVar} />} />
          </FrameAbs>
          <div className="rev-bar" style={{ left: '44px', top: '468px', width: '600px' }}>
            <div className="tx">
              <b>Variation {activeVar} of 3</b>
              <span>Nothing applies until you press Apply</span>
            </div>
            <span className="rev-flip">
              <IconBtn
                icon="chevR"
                label="Previous variation"
                does="Shows the previous variation in place; arrow keys do the same"
                sm
                feature="F229"
                onClick={() => setActiveVar((v) => (v > 1 ? v - 1 : 3))}
              />
            </span>
            <IconBtn
              icon="chevR"
              label="Next variation"
              does="Shows the next variation in place; arrow keys do the same"
              sm
              feature="F229"
              onClick={() => setActiveVar((v) => (v < 3 ? v + 1 : 1))}
            />
            <span className="rev-dots" aria-hidden="true">
              {[1, 2, 3].map((i) => (
                <i key={i} className={activeVar === i ? 'on' : undefined} />
              ))}
            </span>
            <span className="sp-fill" />
            <RevBtn
              does="Hold to show the original part in place; release to return to the variation"
              feature="F229"
              onClick={() => recordIntent('F229:compare')}
            >
              Compare <span className="rev-kbd">O</span>
            </RevBtn>
            <RevBtn does="Drops all 3 variations; F-03 stays at r6" feature="F229" onClick={() => setState('select')}>
              Dismiss
            </RevBtn>
            <RevBtn
              cls="ink"
              does="Applies variation 1 in place as a draft; the other two are dropped"
              feature="F229"
              onClick={() => setState('applied')}
            >
              Apply
            </RevBtn>
          </div>
        </>
      );
    }

    if (state === 'clip') {
      return (
        <FrameAbs>
          <F03Table
            extras={{
              v3: (
                <>
                  <i className="rev-clip pill" />
                  <span className="rev-cliptag">Clip {PL.size}</span>
                  <i className="rev-out pill" />
                  <ChangePopover
                    pos="b"
                    part={PL}
                    text={instruction || PL.ask}
                    clip
                    warn
                    varCount={varCount}
                    onText={setInstruction}
                    onSend={() => setState('working')}
                    onSendToChat={() => setChatDraft(instruction || PL.ask)}
                    onVariations={() => setState('variations')}
                    onVarDelta={(d) => setVarCount((n) => Math.max(2, Math.min(6, n + d)))}
                    onToggleClip={() => setState('select')}
                    onClose={() => setState('select')}
                  />
                </>
              ),
            }}
            pillNode={<span className="rev-pl fix">+6.4% · 2 periods</span>}
          />
        </FrameAbs>
      );
    }

    // Default: select
    const popNode = (
      <ChangePopover
        pos={selectedPart === 'pill' ? 'b' : 'r'}
        part={selectedPart === 'pill' ? PL : C}
        text={instruction}
        clip={false}
        varCount={varCount}
        onText={setInstruction}
        onSend={() => {
          createTargetedProposal({ id: 'F-03', rev: 'r6', status: 'accepted', forecast: C.before }, instruction, C.after);
          setState('working');
        }}
        onSendToChat={() => setChatDraft(instruction)}
        onVariations={() => {
          setSelectedPart('pill');
          setState('variations');
        }}
        onVarDelta={(d) => setVarCount((n) => Math.max(2, Math.min(6, n + d)))}
        onToggleClip={() => {
          setSelectedPart('pill');
          setInstruction(PL.ask);
          setState('clip');
        }}
        onClose={() => {
          setAskOnSelect(false);
          onLeaveTargeted?.();
        }}
      />
    );

    return (
      <FrameAbs>
        <F03Table
          onClickPart={(k) => {
            if (k === 'v3') setSelectedPart('pill');
            else if (k === 'f3') setSelectedPart('cell');
          }}
          extras={
            selectedPart === 'pill'
              ? {
                  v3: (
                    <>
                      <i className="rev-out pill" />
                      {popNode}
                    </>
                  ),
                }
              : {
                  f3: (
                    <>
                      <i className="rev-out" />
                      {popNode}
                    </>
                  ),
                }
          }
        />
      </FrameAbs>
    );
  };

  const renderInspector = () => {
    if (state === 'working') {
      return (
        <Inspector
          title={C.name}
          pill={['acc', 'Working']}
          sub="P-03 row in F-03 · locked until the change applies"
          tabs={['Changes', 'Part', 'Links']}
          activeTab="Changes"
          onSelectTab={(t) => recordIntent('F108:tab:' + t)}
          onMore={() => recordIntent('F108:more')}
        >
          <div className="sp-sec">
            <h4>
              This change<span>1 job</span>
            </h4>
            <InspectorRow id="Ask" name={C.ask} sub="Sent 12:47 · Sonnet 5.5" pill={['acc', 'Working']} />
            <InspectorRow id="Part" name="Forecast cell, P-03" sub="6.28 stays until the change applies" pill={['mute', 'Locked']} />
            <InspectorRow id="Cost" name="Reserved 8 cr" sub="Estimate 4 to 8 cr · released if stopped" pill={['mute', 'Hosted']} />
          </div>
          <p className="ap-callout">
            <b>Selection does not open chat.</b> The pin spins on the part, the job shows here and in the chat list. Escape does
            not cancel the job; Stop does.
          </p>
          <div className="sp-ready">
            <div className="t">
              Related values<span className="pill mute">Checked after</span>
            </div>
            <p>
              When the value is in, Spekin looks for other values that follow from it and lists them. It never says the edit
              stayed inside the part.
            </p>
          </div>
        </Inspector>
      );
    }

    if (state === 'applied') {
      return (
        <Inspector
          title={C.name}
          pill={['warn', 'Changed · draft r7']}
          sub={`${C.before} to ${C.after} · F-03 draft r7 · 12:48`}
          tabs={['Changes', 'Part', 'Links']}
          activeTab="Changes"
          onSelectTab={(t) => recordIntent('F108:tab:' + t)}
          onMore={() => recordIntent('F108:more')}
        >
          <div className="sp-sec">
            <h4>
              Also changed<span>4</span>
            </h4>
            {REVIEW_ALSO.map((a) => (
              <div key={a.el} className="rev-ch">
                <span className="e">{a.el}</span>
                <span className="w">{a.where}</span>
                <span className="v">
                  <s>{a.from}</s>
                  <Icon name="chevR" size={12} />
                  <b>{a.to}</b>
                </span>
              </div>
            ))}
          </div>
          <div className="rev-leg">
            <i className="s" />
            You changed this
            <i className="d" />
            Changed with it
          </div>
          <p className="ap-callout">
            <b>Not isolated.</b> Related values moved with the cell. {REVIEW_OUTSIDE}
          </p>
          <div className="sp-ready">
            <div className="t">
              Draft r7<span className="pill warn">Not accepted</span>
            </div>
            <p>Done keeps this as a draft. You accept it in the frame review (S33); until then F-03 stays at r6.</p>
            <Btn
              label="Compare whole frame"
              cls="ink"
              sm
              does="Opens Compare: the original F-03 r6 beside the draft, every differing value marked"
              feature="F232"
              onClick={() => setState('compare')}
            />
          </div>
        </Inspector>
      );
    }

    if (state === 'variations') {
      return (
        <Inspector
          title={PL.name}
          pill={['acc', 'Variation ' + activeVar + ' of 3']}
          sub={'P-03 row · “' + PL.ask + '”'}
          tabs={['Variations', 'Part', 'Links']}
          activeTab="Variations"
          onSelectTab={(t) => recordIntent('F108:tab:' + t)}
          onMore={() => recordIntent('F108:more')}
        >
          <div className="sp-sec">
            <h4>
              Variations<span>3</span>
            </h4>
            {REVIEW_VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                className="rev-vc"
                aria-pressed={v.id === activeVar}
                data-does={`Shows variation ${v.id} of ${REVIEW_VARIANTS.length} in place of the part`}
                data-feature="F229"
                onClick={() => setActiveVar(v.id)}
              >
                <span className="t">
                  <b>
                    {v.id} · {v.label}
                  </b>
                  <small>{v.hint}</small>
                </span>
                <span className="pv">
                  <PillVariant v={v} />
                </span>
              </button>
            ))}
          </div>
          <p className="ap-callout">
            <b>Only text changes.</b> The variations touch this pill and nothing else, so no related values moved. Variations
            are separate from Undo and Done.
          </p>
          <div className="sp-ready">
            <div className="t">
              Review<span className="pill acc">Variation {activeVar} of 3</span>
            </div>
            <p>Apply keeps this one as a draft and drops the other two. Dismiss drops all three and F-03 stays at r6.</p>
          </div>
        </Inspector>
      );
    }

    if (state === 'clip') {
      return (
        <Inspector
          title={PL.name}
          pill={['ink', 'Clip on']}
          sub="P-03 row in F-03 Variance table r6"
          tabs={['Part', 'Changes', 'Links']}
          activeTab="Part"
          onSelectTab={(t) => recordIntent('F108:tab:' + t)}
          onMore={() => recordIntent('F108:more')}
        >
          <div className="sp-sec">
            <h4>
              Clip<span>on</span>
            </h4>
            <div className="rev-kv">
              <span>Area</span>
              <b>{PL.size}, fixed</b>
              <span>Layout</span>
              <b>Nothing moves</b>
              <span>Related</span>
              <b>Not updated</b>
            </div>
          </div>
          <p className="ap-callout">
            <b>Clip keeps the change inside the part.</b> The pill cannot grow, so a longer text is cut. Values elsewhere are
            left as they are, which can leave them out of step.
          </p>
          <div className="sp-ready">
            <div className="t">
              Text does not fit<span className="pill warn">Check</span>
            </div>
            <p>“+6.4% · 2 periods” needs about 122 px. The clip is {PL.size}. Shorten the text or turn Clip off.</p>
          </div>
        </Inspector>
      );
    }

    return (
      <Inspector
        title={C.name}
        pill={['mute', 'Part']}
        sub="P-03 row in F-03 Variance table r6"
        tabs={['Part', 'Changes', 'Links']}
        activeTab="Part"
        onSelectTab={(t) => recordIntent('F108:tab:' + t)}
        onMore={() => recordIntent('F108:more')}
      >
        <div className="sp-sec">
          <h4>Selected part</h4>
          <div className="rev-kv">
            <span>Element</span>
            <b>Table cell</b>
            <span>Text</span>
            <b>{C.before}</b>
            <span>Size</span>
            <b>{C.size}</b>
            <span>Type</span>
            <b>{C.font}</b>
          </div>
        </div>
        <div className="sp-sec">
          <h4>
            Parts in this frame<span>6</span>
          </h4>
          <PartListRow id="Title" name="Page title" sub="Variance by package" />
          <PartListRow id="Chip" name="Threshold chip" sub="Threshold 3% · r14" />
          <PartListRow id="KPI" name="KPI cards" sub="4 cards" />
          <PartListRow id="Head" name="Table header" sub="5 labels" />
          <PartListRow id="Cell" name="Forecast cell" sub="P-03 · 6.28" sel />
          <PartListRow id="Pill" name="Variance pill" sub="P-03 · +6.4%" />
        </div>
        <p className="ap-callout">
          <b>No pointer?</b> Tab into the frame, arrow keys move through the parts and Enter selects. This list does the same.
        </p>
      </Inspector>
    );
  };

  return (
    <>
      {chat}
      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={makeTabs(isDirty)}
          activeTab="Variance flows"
          onSelect={(n) => recordIntent('F104:tab:' + n)}
          onClose={(n) => recordIntent('F104:close:' + n)}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={right}
        />
        <div className="sp-tool">
          <ViewSwitch current="Canvas" onChange={(v) => (v === 'Compare' ? setState('compare') : recordIntent('F104:' + v))} />
          <span className="sp-crumb">
            Design
            <Icon name="chevR" size={12} />
            <b>F-03 Variance table</b>
          </span>
          <span className="sp-fill" />
          <IconBtn icon="undo" label="Undo" does="Undoes the last draft edit on this board" sm feature="F116" onClick={() => setState('select')} />
          <IconBtn icon="redo" label="Redo" does="Redoes the last undone draft edit" sm feature="F116" onClick={() => recordIntent('F116:redo')} />
          <IconBtn icon="history" label="Revisions" does="Opens the revision list of the selected artifact" sm feature="F108" onClick={() => recordIntent('F108:revisions')} />
        </div>
        <div className="sp-work">
          <div className="sp-cv" aria-label="Board: Variance flows">
            <div className="sp-cvt">
              Variance flows<span>F-03 at 100%</span>
            </div>
            {renderCanvasContent()}
            <ReviewCanvasPalette
              tool="pointer"
              ask={askOnSelect}
              feature="F221"
              onTool={(t) => recordIntent('F221:tool:' + t)}
              onToggleAsk={() => setAskOnSelect((v) => !v)}
              onZoom={(z) => recordIntent('F221:zoom:' + z)}
            />
          </div>
          {renderInspector()}
        </div>
      </section>
    </>
  );
}
