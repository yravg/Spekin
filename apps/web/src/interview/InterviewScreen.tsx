import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import {
  SAMPLE_PROJECT_ID,
  sampleData,
  type PillTone,
  type StageTone,
} from '../data/source';
import { useWorkspace } from '../state/workspace';
import { NotFound } from '../shell/NotFound';
import { Btn, IconBtn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

const {
  GAPA_ANSWERED,
  GAPA_GROUND,
  GAPA_IDEA,
  GAPA_PITCH,
  GAPA_PITCH_FIELDS,
  GAPA_Q5,
  GAPA_SKIPPED,
  GAPA_WHY,
  PROJECT,
} = sampleData;

type SegmentMark = '' | 'on' | 'skip' | 'cur';
type InterviewMode = 'new' | 'ground';

interface AnsweredRow {
  id: string;
  question: string;
  answer: string;
  decisionId: string;
}

interface SkippedRow {
  id: string;
  question: string;
  openId: string;
  fresh: boolean;
}

interface PitchFieldRow {
  name: string;
  tone: StageTone;
  sub: string;
}

const CUKUP_ROWS: PitchFieldRow[] = [
  { name: 'Problem', tone: 'ok', sub: 'Filled from Q-01' },
  { name: 'Appetite', tone: 'ok', sub: 'Filled from Q-02' },
  { name: 'Solution', tone: 'half', sub: 'Part: the empty state is not decided' },
  { name: 'Rabbit holes', tone: 'ring', sub: 'Will be proposed as an open question' },
  { name: 'No-gos', tone: 'ring', sub: 'Will be proposed as an open question' },
];

const GROUND_NEEDS: PitchFieldRow[] = [
  { name: 'User problem', tone: 'ok', sub: 'Alerts before month end' },
  { name: 'Non-goals', tone: 'half', sub: 'Editing thresholds unclear' },
  { name: 'Alternatives', tone: 'ring', sub: 'Not asked yet' },
  { name: 'Failure cases', tone: 'ring', sub: 'Not asked yet' },
  { name: 'Acceptance evidence', tone: 'ring', sub: 'Not asked yet' },
];

const TWELVE_FIELDS: PitchFieldRow[] = [
  { name: 'Problem', tone: 'ok', sub: 'From Q-01' },
  { name: 'Appetite', tone: 'ok', sub: 'From Q-02' },
  { name: 'Solution', tone: 'ok', sub: 'From Q-03, Q-05' },
  { name: 'Rabbit holes', tone: 'ok', sub: 'From Q-09, one part open' },
  { name: 'No-gos', tone: 'ring', sub: 'Proposed by Spekin, no decision' },
];

const GROUND_IDEA = 'Add feature: alerts when a package goes over its threshold';
const GROUND_QUESTION = {
  id: 'Q-02',
  n: 2,
  label: 'Question 2 of 12 at most',
  text: 'The spec says the alert drawer is read-only, but you asked to edit thresholds there. Which one is right?',
  rec: 'Keep it read-only now and plan threshold editing as its own increment.',
  alts: ['Make the drawer editable now', 'Drop threshold editing'],
  foot: 'Accepting changes the plan only. A change to the accepted spec opens review in S08.',
};

const Q4_QUESTION = {
  id: GAPA_SKIPPED[0],
  n: 4,
  label: 'Question 4 of 12 at most',
  text: GAPA_SKIPPED[1],
  rec: 'Import monthly actuals from the ERP cost ledger CSV.',
  alts: ['Enter actuals manually', 'Connect directly to ERP API'],
  foot: 'Accepting writes the decision to the log.',
};

const Q12_QUESTION = {
  id: 'Q-12',
  n: 12,
  label: 'Question 12 of 12 at most',
  text: 'Should this first increment include an approval workflow or per-user permissions?',
  rec: 'No forecasting model, no approval workflow and no per-user permissions in this increment.',
  alts: ['Add role permissions now', 'Add approval workflow now'],
  foot: 'Accepting writes the decision to the log.',
};

function fieldPill(tone: StageTone, ground: boolean): [PillTone, string] {
  if (ground) {
    if (tone === 'ok') return ['ok', 'Done'];
    if (tone === 'half') return ['warn', 'Part'];
    return ['mute', 'Open'];
  }
  if (tone === 'ok') return ['ok', 'Filled'];
  if (tone === 'half') return ['warn', 'Part'];
  return ['mute', 'Empty'];
}

function buildSegments(
  mode: InterviewMode,
  questionNum: number,
  stoppedAtTwelve: boolean,
  hasQ4Skip: boolean,
  extraSkips: Set<number>,
): SegmentMark[] {
  if (mode === 'ground') {
    return Array.from({ length: 12 }, (_, idx) => {
      const q = idx + 1;
      if (q < questionNum) return 'on';
      if (q === questionNum) return 'cur';
      return '';
    });
  }
  if (stoppedAtTwelve) {
    return ['on', 'on', 'on', 'skip', 'on', 'on', 'on', 'on', 'on', 'on', 'skip', 'on'];
  }
  return Array.from({ length: 12 }, (_, idx) => {
    const q = idx + 1;
    if (q === 4 && hasQ4Skip) return 'skip';
    if (extraSkips.has(q)) return 'skip';
    if (q < questionNum) return 'on';
    if (q === questionNum) return 'cur';
    return '';
  });
}

function IdBtn({
  label,
  does,
  feature,
  onClick,
}: {
  label: string;
  does: string;
  feature: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="gpa-idb" data-does={does} data-feature={feature} onClick={onClick}>
      {label}
    </button>
  );
}

// S04 Interview. Board: docs/design/spekin-canvas/project/S04-interview.dc.html (data-screen="S04").
export function InterviewScreen({ mode = 'new' }: { mode?: InterviewMode }) {
  const { project: projectId } = useParams();
  const navigate = useNavigate();
  // D-PLAN-1: in a project the planning artifacts open by click (S05, S06, S15 via ?artifact=).
  const openArtifact = (artifact: string) =>
    projectId ? navigate('/p/' + projectId + '/planning?artifact=' + artifact) : undefined;
  const [search] = useSearchParams();
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const qParam = Number(search.get('q'));
  const initialQ = mode === 'ground' ? 2 : qParam === 4 ? 4 : qParam === 12 ? 12 : 5;

  const [questionNum, setQuestionNum] = useState<number>(initialQ);
  const [answered, setAnswered] = useState<AnsweredRow[]>(() =>
    mode === 'ground'
      ? []
      : GAPA_ANSWERED.map(([id, question, answer, decisionId]) => ({ id, question, answer, decisionId })),
  );
  const [skippedQ4, setSkippedQ4] = useState<SkippedRow | null>(() =>
    mode === 'new' && initialQ >= 5
      ? { id: GAPA_SKIPPED[0], question: GAPA_SKIPPED[1], openId: 'OQ-01', fresh: false }
      : null,
  );
  const [justSkipped, setJustSkipped] = useState<SkippedRow | null>(null);
  const [extraSkips, setExtraSkips] = useState<Set<number>>(() => new Set());
  const [whyOpen, setWhyOpen] = useState<boolean>(false);
  const [deeperOpen, setDeeperOpen] = useState<boolean>(false);
  const [cukupOpen, setCukupOpen] = useState<boolean>(false);
  const [stoppedAtTwelve, setStoppedAtTwelve] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>('');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const whyBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!cukupOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCukupOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cukupOpen]);

  if (mode === 'ground' && projectId && projectId !== SAMPLE_PROJECT_ID) {
    return <NotFound />;
  }

  const activeQuestion =
    mode === 'ground'
      ? GROUND_QUESTION
      : questionNum === 4
        ? Q4_QUESTION
        : questionNum === 12
          ? Q12_QUESTION
          : {
              id: GAPA_Q5.id,
              n: questionNum,
              label: `Question ${questionNum} of 12 at most`,
              text: questionNum === 5 ? GAPA_Q5.text : `Question ${questionNum}: Confirm scope detail for Meranti Yard?`,
              rec: GAPA_Q5.rec,
              alts: GAPA_Q5.alts,
              foot: 'Accepting writes the decision to the log.',
            };

  const submitAnswer = (text: string) => {
    setWhyOpen(false);
    setDeeperOpen(false);
    setJustSkipped(null);
    setDraft('');
    if (mode === 'new' && questionNum >= 12) {
      setStoppedAtTwelve(true);
      recordIntent('F416:proposal-at-12');
      return;
    }
    const nextDecNum = answered.length + 1;
    const decId = 'D-' + String(nextDecNum).padStart(3, '0');
    setAnswered((prev) => [
      ...prev,
      {
        id: 'Q-' + String(questionNum).padStart(2, '0'),
        question: activeQuestion.text,
        answer: text,
        decisionId: decId,
      },
    ]);
    setQuestionNum((n) => Math.min(12, n + 1));
    recordIntent('F411:accept:' + decId);
  };

  const handleEdit = () => {
    setDraft(activeQuestion.rec);
    inputRef.current?.focus();
    recordIntent('F411:edit');
  };

  const handleSkip = () => {
    setWhyOpen(false);
    setDeeperOpen(false);
    const qId = 'Q-' + String(questionNum).padStart(2, '0');
    const openNum = (skippedQ4 ? 1 : 0) + extraSkips.size + 1;
    const openId = 'OQ-' + String(questionNum === 4 ? 1 : openNum).padStart(2, '0');
    const entry: SkippedRow = { id: qId, question: activeQuestion.text, openId, fresh: true };
    if (questionNum === 4) {
      setSkippedQ4(entry);
    } else {
      setExtraSkips((prev) => new Set(prev).add(questionNum));
    }
    setJustSkipped(entry);
    setQuestionNum((n) => Math.min(12, n + 1));
    recordIntent('F413:skip:' + openId);
  };

  const handleUndoSkip = () => {
    if (!justSkipped) return;
    const restoredQ = Number(justSkipped.id.replace('Q-', '')) || 4;
    if (restoredQ === 4) {
      setSkippedQ4(null);
    } else {
      setExtraSkips((prev) => {
        const next = new Set(prev);
        next.delete(restoredQ);
        return next;
      });
    }
    setJustSkipped(null);
    setQuestionNum(restoredQ);
    recordIntent('F413:undo-skip');
  };

  const handleAnswerNow = () => {
    if (!justSkipped) return;
    const restoredQ = Number(justSkipped.id.replace('Q-', '')) || 4;
    setJustSkipped(null);
    setQuestionNum(restoredQ);
    recordIntent('F413:answer-now');
  };

  const handleCloseWhy = () => {
    setWhyOpen(false);
    setDeeperOpen(false);
    whyBtnRef.current?.focus();
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      recordIntent('F411:send-empty');
      return;
    }
    submitAnswer(trimmed);
  };

  const ideaText = mode === 'ground' ? GROUND_IDEA : GAPA_IDEA;
  const progressLabel =
    mode === 'ground'
      ? `Increment 2 · question ${questionNum} of 12`
      : stoppedAtTwelve
        ? 'Question 12 of 12'
        : `Question ${questionNum} of 12`;
  const marks = buildSegments(mode, questionNum, stoppedAtTwelve, skippedQ4 !== null, extraSkips);

  const pitchFields: PitchFieldRow[] =
    mode === 'ground'
      ? GROUND_NEEDS
      : stoppedAtTwelve
        ? TWELVE_FIELDS
        : GAPA_PITCH_FIELDS.map(([name, tone, sub]) => ({ name, tone, sub }));

  const filledCount = pitchFields.filter((f) => f.tone === 'ok').length;
  const decisionCount = stoppedAtTwelve ? 9 : answered.length;
  const openCount = stoppedAtTwelve ? 2 : (skippedQ4 ? 1 : 0) + extraSkips.size;
  const logSummary = `${decisionCount} decisions · ${openCount} open${justSkipped ? ' (new)' : ''}`;

  const compactHistory = whyOpen || stoppedAtTwelve;

  return (
    <div className="ap-root" data-screen="S04">
      <div className="gpa-iv">
        <header className="gpa-ih">
          <span className="sp-mark" aria-hidden="true">
            S
          </span>
          <b className="gpa-brand">New project</b>
          <span className="gpa-idea" title={ideaText}>
            {ideaText}
          </span>
          <span className="sp-fill" />
          <div className="gpa-prog" data-feature="F412">
            <span className="c">{progressLabel}</span>
            <span className="gpa-seg12" aria-hidden="true">
              {marks.map((m, i) => (
                <i key={i} className={m} />
              ))}
            </span>
          </div>
          <Btn
            label="Cukup, buat pitch"
            cls="ink"
            does="Opens a confirmation that lists the pitch fields still empty, then proposes the pitch from what is decided"
            feature="F415"
            onClick={() => setCukupOpen(true)}
          />
          <span className="sp-av" aria-label={PROJECT.user}>
            {PROJECT.initials}
          </span>
        </header>

        <div className="gpa-ivb">
          <section className="gpa-chatcol" aria-label="Interview">
            <div className="gpa-th">
              {mode === 'ground' ? (
                <>
                  <div className="sp-ub">Add alerts when a package goes over its threshold.</div>
                  <div className="sp-ai">
                    <div className="h">
                      <span className="av">S</span>Spekin<em>Sonnet 5.5 · interview</em>
                    </div>
                    <p>
                      Before I ask, I read what you already have. Here is what I found, and what kind of evidence each
                      item is.
                    </p>
                  </div>
                  <div className="gpa-pc" data-feature="F414">
                    <div className="ap-iv-k">Read before asking · increment 2</div>
                    {GAPA_GROUND.map(([icon, name, rev, kind, tone, text]) => (
                      <div key={name} className="gpa-ev">
                        <Icon name={icon} size={14} />
                        <span>
                          <b>{name}</b>
                          <span className="r">{rev}</span>
                        </span>
                        <Pill tone={tone} label={kind} />
                        <p>{text}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : compactHistory ? (
                <div className="gpa-done">
                  <span className="dot ok" />
                  <span className="id">Q-01</span>
                  <span className="q">3 decided and 1 skipped so far</span>
                  <IdBtn
                    label="D-001"
                    does="Opens the decision log (S05) at D-001"
                    feature="F419"
                    onClick={() => recordIntent('F419:open-log:D-001')}
                  />
                  <IdBtn
                    label="D-003"
                    does="Opens the decision log (S05) at D-003"
                    feature="F419"
                    onClick={() => recordIntent('F419:open-log:D-003')}
                  />
                  <IdBtn
                    label="OQ-01"
                    does="Opens the open question OQ-01 in the spec document, section 2"
                    feature="F413"
                    onClick={() => recordIntent('F413:open-questions:OQ-01')}
                  />
                </div>
              ) : (
                <>
                  <div className="sp-ub">{GAPA_IDEA}</div>
                  <div className="sp-ai">
                    <div className="h">
                      <span className="av">S</span>Spekin<em>Sonnet 5.5 · interview</em>
                    </div>
                    <p>
                      I will ask one question at a time. Each has a recommended answer you can accept, edit or skip. I
                      stop after 12 questions or when you press Cukup, buat pitch.
                    </p>
                  </div>
                  {answered.map((row) => (
                    <div key={row.id} className="gpa-done">
                      <span className="dot ok" />
                      <span className="id">{row.id}</span>
                      <span className="q">{row.question}</span>
                      <b>{row.answer}</b>
                      <IdBtn
                        label={row.decisionId}
                        does={`Opens the decision log (S05) at ${row.decisionId}`}
                        feature="F419"
                        onClick={() => recordIntent('F419:open-log:' + row.decisionId)}
                      />
                    </div>
                  ))}
                  {skippedQ4 ? (
                    <div className="gpa-done skipped">
                      <span className="dot warn" />
                      <span className="id">{skippedQ4.id}</span>
                      <span className="q">{skippedQ4.question}</span>
                      <b>{justSkipped?.id === skippedQ4.id ? 'Skipped just now' : 'Skipped'}</b>
                      <IdBtn
                        label={skippedQ4.openId}
                        does="Opens the open question OQ-01 in the spec document, section 2"
                        feature="F413"
                        onClick={() => recordIntent('F413:open-questions:' + skippedQ4.openId)}
                      />
                    </div>
                  ) : null}
                </>
              )}

              {justSkipped ? (
                <>
                  <div className="gpa-bn ok" data-feature="F413">
                    <Icon name="check" size={16} />
                    <p>
                      <b>Saved as open question {justSkipped.openId}</b> in the spec document, section 2: “
                      {justSkipped.question}”. Skipping is not approval. The question stays open until you answer it.
                    </p>
                    <Btn
                      label="Answer now"
                      sm
                      cls="ink"
                      does={`Brings ${justSkipped.id} back as the current question`}
                      feature="F413"
                      onClick={handleAnswerNow}
                    />
                    <Btn
                      label="Undo skip"
                      sm
                      cls="plain"
                      does={`Reverses the skip and removes ${justSkipped.openId} from the spec`}
                      feature="F413"
                      onClick={handleUndoSkip}
                    />
                  </div>
                  <div className="sp-ai">
                    <div className="h">
                      <span className="av">S</span>Spekin<em>next question</em>
                    </div>
                    <p>Moving on. Next is question {questionNum}.</p>
                  </div>
                </>
              ) : stoppedAtTwelve ? (
                <>
                  <div className="sp-ai">
                    <div className="h">
                      <span className="av">S</span>Spekin<em>Sonnet 5.5 · interview</em>
                    </div>
                    <p>
                      That was question 12, the limit for a first pitch. I stopped asking and wrote the pitch as a
                      proposal from your 9 decisions.
                    </p>
                  </div>
                  <div className="sp-gc prop" data-feature="F416">
                    <div className="k">
                      <Icon name="doc" size={12} />
                      Pitch proposal r1
                      <span className="tag">
                        <Pill tone="acc" label="Proposal" />
                      </span>
                    </div>
                    <div className="tt">Variance alerts for Meranti Yard</div>
                    {GAPA_PITCH.map(([name, text]) => (
                      <div key={name} className="gpa-fld">
                        <span />
                        <span>
                          <b>{name}</b>
                          <small>{text.length > 96 ? text.slice(0, 94) + '…' : text}</small>
                        </span>
                        <span />
                      </div>
                    ))}
                    <div className="ft">
                      <span className="s">Not accepted · 2 open questions stay open</span>
                      <Btn
                        label="Review pitch proposal"
                        sm
                        cls="ink"
                        does="Opens S06 with the pitch proposal and its diff; accepting is a separate step"
                        feature="F416"
                        onClick={() => recordIntent('F416:review-pitch-proposal')}
                      />
                    </div>
                  </div>
                  <div className="gpa-bn warn" data-feature="F416">
                    <Icon name="alert" size={16} />
                    <p>
                      <b>Stopping is not approval.</b> OQ-01 and OQ-02 stay on the open list and the pitch is a Proposal
                      until you accept it.
                    </p>
                  </div>
                </>
              ) : (
                <div className="gpa-q" data-feature="F411">
                  <div className="k">
                    {activeQuestion.label}
                    <span className="sp-fill" />
                    <Pill tone="mute" label="One question at a time" />
                  </div>
                  <h3>{activeQuestion.text}</h3>
                  <div className="gpa-rec">
                    <div className="t">
                      <Icon name="spark" size={12} />
                      Recommended answer
                      <span className="sp-fill" />
                      <button
                        ref={whyBtnRef}
                        type="button"
                        className="gpa-idb"
                        data-does="Opens the plain-language explanation of this recommendation, read from accepted artifacts, with no model call"
                        data-feature="F417"
                        onClick={() => setWhyOpen((open) => !open)}
                      >
                        Why this?
                      </button>
                    </div>
                    <p>{activeQuestion.rec}</p>
                  </div>
                  <div className="gpa-alts">
                    Other answers:{' '}
                    {activeQuestion.alts.map((alt) => (
                      <button
                        key={alt}
                        type="button"
                        className="gpa-ch"
                        data-does={`Uses “${alt}” as the answer instead of the recommendation`}
                        data-feature="F411"
                        onClick={() => submitAnswer(alt)}
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                  {whyOpen ? (
                    <div className="gpa-why" data-feature="F417">
                      <h5>In plain words</h5>
                      <p>{GAPA_WHY.plain}</p>
                      <h5>Evidence</h5>
                      <div className="gpa-src">
                        {GAPA_WHY.evidence.map((ev) => (
                          <button
                            key={ev}
                            type="button"
                            data-does={`Opens ${ev.split(':')[0]} in its own tab`}
                            data-feature="F417"
                            onClick={() => recordIntent('F417:evidence:' + ev.split(':')[0])}
                          >
                            {ev}
                          </button>
                        ))}
                      </div>
                      <h5>Trade-offs</h5>
                      <div className="gpa-tr">
                        {GAPA_WHY.tradeoffs.map(([label, desc]) => (
                          <Fragment key={label}>
                            <b>{label}</b>
                            <span>{desc}</span>
                          </Fragment>
                        ))}
                      </div>
                      {deeperOpen ? (
                        <div className="ap-iv-deep">
                          <b>D-003 (24 Nov 12:06):</b> Forecast over budget by more than 3%.
                          <br />
                          <b>F-04 Alert drawer (draft):</b> No empty-state copy defined yet; still draft.
                        </div>
                      ) : null}
                      <div className="gpa-acts">
                        <Pill tone="ok" label="Read from accepted artifacts · no model call · 0 cr" />
                        <span className="sp-fill" />
                        <Btn
                          label="Deeper view"
                          sm
                          does="Expands the evidence table with the exact lines from D-003 and F-04"
                          feature="F417"
                          onClick={() => setDeeperOpen((v) => !v)}
                        />
                        <Btn
                          label="Close"
                          sm
                          cls="plain"
                          does="Closes the explanation; focus returns to the recommendation"
                          feature="F417"
                          onClick={handleCloseWhy}
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className="gpa-acts">
                    <Btn
                      label="Accept"
                      cls="ink"
                      icon="check"
                      does="Accepts the recommended answer in one tap and writes a decision-log entry with the question id, the answer, the alternatives and the time"
                      feature="F411"
                      onClick={() => submitAnswer(activeQuestion.rec)}
                    />
                    <Btn
                      label="Edit"
                      does="Puts the recommendation in the box so you can change it before it is written"
                      feature="F411"
                      onClick={handleEdit}
                    />
                    <Btn
                      label="Skip"
                      cls="plain"
                      does="Skips the question and records it as an open question in the spec document; nothing is approved"
                      feature="F413"
                      onClick={handleSkip}
                    />
                    <span className="sp-fill" />
                    <span className="gpa-hint">{activeQuestion.foot}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="gpa-comp">
              <div className="ap-iv-in">
                <span className={draft.length > 0 ? 'ph ap-iv-val' : 'ph'}>
                  {draft.length > 0 ? draft : 'Or type your own answer, or ask a question back…'}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className="ap-iv-input"
                  aria-label="Your answer"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && draft.trim()) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>
              <IconBtn
                icon="clip"
                label="Attach a file"
                sm
                does="Attaches a file or link as evidence for the answer; nothing is read until you send"
                feature="F411"
                onClick={() => recordIntent('F411:attach')}
              />
              <IconBtn
                icon="up"
                label="Send"
                sm
                does="Sends your own answer to the current question"
                feature="F411"
                onClick={handleSend}
              />
            </div>

            {cukupOpen ? (
              <div className="gpa-scrim">
                <div className="gpa-dlg" role="dialog" aria-label="Cukup, buat pitch" data-feature="F415">
                  <h3>Cukup, buat pitch?</h3>
                  <p>
                    Spekin proposes the pitch now from {decisionCount} decisions and {openCount} open question. You
                    review it before anything is accepted.
                  </p>
                  {CUKUP_ROWS.map((row) => {
                    const [tone, label] = fieldPill(row.tone, false);
                    return (
                      <div key={row.name} className="gpa-fld">
                        <span className={'dot ' + row.tone} />
                        <span>
                          <b>{row.name}</b>
                          <small>{row.sub}</small>
                        </span>
                        <Pill tone={tone} label={label} />
                      </div>
                    );
                  })}
                  <div className="gpa-acts">
                    <Btn
                      label="Keep asking"
                      does={`Closes the dialog and returns to question ${questionNum}; nothing changes`}
                      feature="F415"
                      onClick={() => setCukupOpen(false)}
                    />
                    <Btn
                      label="Cukup, buat pitch"
                      cls="ink"
                      does="Proposes the pitch as a Proposal with open questions for the empty fields, then opens S06 to review it"
                      feature="F415"
                      onClick={() => {
                        setCukupOpen(false);
                        setStoppedAtTwelve(true);
                        recordIntent('F415:propose-pitch');
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="gpa-sidecol">
            <div className="gpa-pc" data-feature="F412">
              <h4>
                {mode === 'ground' ? 'What Spekin still needs' : 'Pitch so far'}
                <span>{mode === 'ground' ? `${filledCount} of 5` : `${filledCount} of 5 filled`}</span>
              </h4>
              {pitchFields.map((row) => {
                const [tone, label] = fieldPill(row.tone, mode === 'ground');
                return (
                  <div key={row.name} className="gpa-fld">
                    <span className={'dot ' + row.tone} />
                    <span>
                      <b>{row.name}</b>
                      <small>{row.sub}</small>
                    </span>
                    <Pill tone={tone} label={label} />
                  </div>
                );
              })}
            </div>

            {mode === 'ground' ? (
              <>
              <div className="gpa-pc" data-feature="F540">
                <h4>
                  Planning artifacts<span>Meranti Yard</span>
                </h4>
                <div className="gpa-acts">
                  <Btn
                    label="Decision log"
                    sm
                    icon="list"
                    does="Opens the decision log (S05) for this project; the interview keeps its answers"
                    feature="F540"
                    onClick={() => openArtifact('decisions')}
                  />
                  <Btn
                    label="Pitch"
                    sm
                    icon="doc"
                    does="Opens the pitch (S06) for this project; nothing is accepted by opening it"
                    feature="F540"
                    onClick={() => openArtifact('pitch')}
                  />
                  <Btn
                    label="Tickets"
                    sm
                    icon="list"
                    does="Opens the ticket board (S15) for this project"
                    feature="F540"
                    onClick={() => openArtifact('tickets')}
                  />
                </div>
              </div>
              <div className="gpa-pc" data-feature="F418">
                <h4>Reviews and outside actions</h4>
                <p className="gpa-hint">
                  Changing an accepted spec needs your review in S08. Anything outside Spekin, such as sending an email,
                  needs a separate OK. Skipping or stopping approves neither.
                </p>
                <Btn
                  label="Open S08 review"
                  sm
                  does="Opens S08 review with the pending canonical changes; none are accepted by the interview"
                  feature="F418"
                  onClick={() => recordIntent('F418:open-s08-review')}
                />
              </div>
              </>
            ) : (
              <>
                <div className="gpa-pc" data-feature="F419">
                  <h4>
                    Decision log<span>{logSummary}</span>
                  </h4>
                  <div className="gpa-acts">
                    <Btn
                      label="Open log"
                      sm
                      icon="list"
                      does="Opens the decision log (S05) beside the interview"
                      feature="F419"
                      onClick={() => {
                        recordIntent('F419:open-log');
                        openArtifact('decisions');
                      }}
                    />
                    {!stoppedAtTwelve ? (
                      <Btn
                        label="Open questions"
                        sm
                        cls="plain"
                        does="Opens the open questions in the spec document, section 2"
                        feature="F413"
                        onClick={() => recordIntent('F413:open-questions')}
                      />
                    ) : null}
                  </div>
                </div>
                <div className="gpa-pc">
                  <h4>The interview stops when</h4>
                  {stoppedAtTwelve ? (
                    <>
                      <div className="gpa-need">
                        <span className="dot ok" />
                        <span>12 questions have been asked</span>
                        <Pill tone="ok" label="Reached" />
                      </div>
                      <div className="gpa-need">
                        <span className="dot ring" />
                        <span>All five pitch fields are filled</span>
                        <span />
                      </div>
                      <div className="gpa-need">
                        <span className="dot ring" />
                        <span>You press Cukup, buat pitch</span>
                        <span />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="gpa-need">
                        <span className="dot ring" />
                        <span>All five pitch fields are filled</span>
                        <span />
                      </div>
                      <div className="gpa-need">
                        <span className="dot ring" />
                        <span>You press Cukup, buat pitch</span>
                        <span />
                      </div>
                      <div className="gpa-need">
                        <span className="dot ring" />
                        <span>12 questions have been asked</span>
                        <span />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
