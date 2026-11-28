// Types for the fields the app reads. Add a type here when a screen starts reading a new export.
export interface SampleProject { name: string; product: string; increment: string; spec: string; user: string; initials: string }
export type StageTone = 'ok' | 'half' | 'ring' | 'warn' | 'bad';
export interface SampleStage { id: StageId; n: string; name: string; st: StageTone; text: string }
export type StageId = 'planning' | 'spec' | 'design' | 'frontend' | 'backend' | 'integration' | 'testing' | 'deploy';
export interface SampleUsage { source: string; used: number; cap: number }
export interface SampleModel { source: string; name: string; est: string }
export type PillTone = 'ok' | 'warn' | 'bad' | 'mute' | 'acc' | 'ink';
export type PillTuple = [PillTone, string];
export type SamplePackage = [string, string, string, string, 'ok' | 'bad'];
export type SampleKpi = [string, string] | [string, string, string];
export interface SampleFrame { id: string; name: string; rev: string; st: 'accepted' | 'draft' }
export interface SampleFrames {
  f01: SampleFrame;
  f03: SampleFrame;
  f04: SampleFrame;
  alt: { id: string; name: string; takes: number };
  ref: { id: string; name: string; kind: string };
}
export interface SampleReq { id: string; t: string; sub: string; pill: PillTuple }
export type ContextKind = 'frame' | 'doc' | 'req' | 'image' | 'server' | 'db';
export type ContextItem = [ContextKind, string, string];
export interface SampleBackend {
  contract: { name: string; rev: string };
  endpoints: [string, string, string, string, PillTuple][];
  entity: [string, string][];
  ready: [PillTone, string, string][];
  checks: ['on' | 'off', string, PillTuple][];
}
export interface SampleConflict { frame: string; rev: string; by: string; at: string }

export interface SampleSkillSource {
  id: string;
  name: string;
  kind: 'template' | 'github' | 'mine';
  url?: string;
  count: number;
  licence: string;
  notice?: string;
  commit?: string;
  policy: string;
}
export type SampleSkillRow = [string, string, string, string[], string, string, string, boolean, number];
export interface SampleSkillDetail {
  id: string;
  title: string;
  version: string;
  path: string;
  adapted: string;
  reads: string[];
  proposes: string[];
  tools: string;
  invoke: string;
  steps: string[];
  used: [string, string][];
}
export interface SampleSkillEdit {
  title: string;
  from: string;
  desc: string;
  stages: string[];
  body: string[];
  checks: ['ok' | 'warn', string][];
  dry: [string, string, string, string][];
}
export interface SampleSkillGithub {
  url: string;
  found: number;
  licence: string;
  file: string;
  notice: string;
  groups: [string, [string, boolean][]][];
  checks: ['ok' | 'warn', string][];
}
export interface SampleSkillUpdate {
  when: string;
  src: string;
  from: string;
  to: string;
  applied: number;
  held: number;
  rows: ['ok' | 'warn', string, string, string][];
}
export type SampleSkillDiffRow = [string, string];
export type SampleSkillGlossRow = [string, string, string, 'proposed' | 'accepted'];

export type IntakeThumb = 'dash' | 'gantt' | 'table' | 'form' | 'cards' | 'empty';
export interface SampleIntakeProject {
  id: string;
  name: string;
  idea: string;
  inc: string;
  stages: StageTone[];
  now: string;
  at: string;
  ago: string;
  owner: string;
  ini: string;
  role: 'Owner' | 'Viewer';
  thumb: IntakeThumb;
}
export interface SampleIntakeNew {
  name: string;
  slug: string;
  idea: string;
  ideaLen: number;
  max: number;
  min: number;
}
export interface SampleIntakeDeleted {
  id: string;
  by: string;
  at: string;
  days: number;
}
export interface SampleIntakeComposer {
  text: string;
  len: number;
}
export interface SampleIntakeLimits {
  types: string;
  sizeMb: number;
  perImport: number;
  keepDays: number;
}
export interface SampleIntakeRef {
  id: string;
  src: string;
  kind: string;
  size: string;
  dim: string;
}
export interface SampleIntakeRefs {
  r3: SampleIntakeRef;
  r4: SampleIntakeRef;
  r5: SampleIntakeRef;
  r6: SampleIntakeRef;
}
export type SampleIntakePiiRow = [string, string, string];

export interface SampleCanvasFrame {
  id: string;
  name: string;
  rev: string;
  st: 'accepted' | 'draft' | 'reference';
  ui: string;
  size: string;
  kind?: string;
}
export interface SampleCanvasFrames {
  f01: SampleCanvasFrame;
  f02: SampleCanvasFrame;
  f03: SampleCanvasFrame;
  f04: SampleCanvasFrame;
  f05: SampleCanvasFrame;
  ref2: SampleCanvasFrame;
}
export interface SampleCanvasChat {
  t: string;
  meta: string;
}
export interface SampleCanvasJobs {
  cap: number;
  designing: string[];
  waiting: string[];
  failed: string[];
}
export interface SampleCanvasTake {
  n: number;
  angle: string;
  ui: string;
  line: string;
  changes: [string, string][];
}
export interface SampleCanvasBaseline {
  frame: string;
  name: string;
  rev: string;
  size: string;
  ds: string;
  req: string;
}
export interface SampleCanvasStack {
  count: number;
  input: string[];
  cost: string;
  kept: { id: string; from: number };
}

export interface SampleReviewPart {
  frame: string;
  rev: string;
  draft: string;
  cell: { name: string; pkg: string; size: string; font: string; before: string; after: string; ask: string };
  pill: { name: string; pkg: string; size: string; font: string; text: string; ask: string };
}
export interface SampleReviewAlso {
  el: string;
  where: string;
  from: string;
  to: string;
}
export interface SampleReviewVariant {
  id: number;
  label: string;
  hint: string;
  text: string;
  badge: string;
}
export interface SampleReviewNit {
  n: number;
  el: string;
  what: string;
  tip: string;
  before?: string;
  after?: string;
  key: string;
  stale?: boolean;
  seen?: string;
  now?: string;
}
export type DiffSegment = ['eq' | 'add' | 'del', string];
export interface SampleReviewHunk {
  id: string;
  kind: string;
  ref: string;
  name: string;
  src: string;
  old: DiffSegment[] | null;
  now: DiffSegment[];
}
export interface SampleReviewProposalLink {
  id: string;
  t: string;
  sub: string;
  p: PillTuple;
}
export interface SampleReviewProposal {
  id: string;
  from: string;
  to: string;
  title: string;
  by: string;
  at: string;
  snapshot: string;
  hunks: SampleReviewHunk[];
  links: SampleReviewProposalLink[];
  affected: SampleReviewProposalLink[];
  sources: string[];
  audit: {
    accepted: { id: string; at: string; text: string };
    rejected: { id: string; at: string; text: string };
  };
  accepted: { hunks: string; parent: string; snapshot: string };
}

export interface SampleStyleColor {
  hex: string;
  css: string;
}
export interface SampleStyleRef {
  id: string;
  name: string;
  kind: string;
  at: string;
  read?: string;
  steps?: number;
  at_step?: number;
}
export type StyleTokenState = 'ok' | 'inf' | 'cf';
export type StyleTokenGroup = 'color' | 'type' | 'space' | 'radius' | 'icon' | 'cmp';
export interface SampleStyleToken {
  id: string;
  g: StyleTokenGroup;
  name: string;
  v?: SampleStyleColor;
  alt?: { hex?: string; css?: string; spec?: string; r?: number };
  altName?: string;
  spec?: string;
  cls?: string;
  smp?: string;
  bars?: number[];
  r?: number;
  st: StyleTokenState;
  refs: string[];
  seen: string;
}
export type StyleHunkLine = ['ctx' | 'add' | 'mod', string];
export interface SampleStyleHunk {
  id: string;
  sec: string;
  inc: boolean;
  add: number;
  del: number;
  open: boolean;
  conf?: boolean;
  lines: StyleHunkLine[];
}

export declare const PROJECT: SampleProject;
export declare const STAGES: SampleStage[];
export declare const USAGE: SampleUsage;
export declare const MODEL: SampleModel;
export declare const PACKAGES: SamplePackage[];
export declare const KPIS: SampleKpi[];
export declare const FRAMES: SampleFrames;
export declare const REQS: SampleReq[];
export declare const CTX_DESIGN: ContextItem[];
export declare const CTX_BACKEND: ContextItem[];
export declare const BACKEND: SampleBackend;
export declare const CONFLICT: SampleConflict;
export declare const SKL_SOURCES: SampleSkillSource[];
export declare const SKL_SKILLS: SampleSkillRow[];
export declare const SKL_STAGES: [string, number][];
export declare const SKL_DETAIL: SampleSkillDetail;
export declare const SKL_EDIT: SampleSkillEdit;
export declare const SKL_GH: SampleSkillGithub;
export declare const SKL_UPDATES: SampleSkillUpdate[];
export declare const SKL_DIFF: SampleSkillDiffRow[];
export declare const SKL_GLOSS: SampleSkillGlossRow[];
export declare const INTAKE_PROJECTS: SampleIntakeProject[];
export declare const INTAKE_SWITCH_ORDER: string[];
export declare const INTAKE_NEW: SampleIntakeNew;
export declare const INTAKE_DELETED: SampleIntakeDeleted;
export declare const INTAKE_COMPOSER: SampleIntakeComposer;
export declare const INTAKE_LIMITS: SampleIntakeLimits;
export declare const INTAKE_REFS: SampleIntakeRefs;
export declare const INTAKE_PII: SampleIntakePiiRow[];
export declare const CANVAS_FRAMES: SampleCanvasFrames;
export declare const CANVAS_CHATS: SampleCanvasChat[];
export declare const CANVAS_VIEWMENU: [string, string][];
export declare const CANVAS_JOBS: SampleCanvasJobs;
export declare const CANVAS_BASELINE: SampleCanvasBaseline;
export declare const CANVAS_TAKES: SampleCanvasTake[];
export declare const CANVAS_REGIONS: [string, number, number, number, number][];
export declare const CANVAS_STACK: SampleCanvasStack;
export declare const REVIEW_PART: SampleReviewPart;
export declare const REVIEW_ALSO: SampleReviewAlso[];
export declare const REVIEW_OUTSIDE: string;
export declare const REVIEW_VARIANTS: SampleReviewVariant[];
export declare const REVIEW_NITS: SampleReviewNit[];
export declare const REVIEW_PROPOSAL: SampleReviewProposal;
export declare const STYLE_REFS: SampleStyleRef[];
export declare const STYLE_STEPS: string[];
export declare const STYLE_NEWREF: SampleStyleRef;
export declare const STYLE_TOKENS: SampleStyleToken[];
export declare const STYLE_NEWTOKEN: SampleStyleToken;
export declare const STYLE_HUNKS: SampleStyleHunk[];
export interface SampleDeliveryManifest {
  id: string;
  next: string;
  spec: string;
  sealedAt: string;
  zip: string;
  framework: string;
}
export interface SampleDeliveryThumb {
  title: string;
  chart?: boolean;
  drawer?: boolean;
  kpi?: boolean;
}
export interface SampleDeliveryItem {
  id: string;
  name: string;
  kind: 'frame' | 'design' | 'takes' | 'ref';
  rev: string;
  st: PillTone;
  stText: string;
  when: string;
  size: string;
  sha?: string;
  html?: string;
  png?: string;
  reason?: string;
  thumb: SampleDeliveryThumb | null;
}
export type SampleDeliveryFile = [string, string, string];
export interface SampleDeliveryBlockedItem {
  id: string;
  rev: string;
  ok: boolean;
  kind?: string;
  text: string;
}
export interface SampleDeliveryStale {
  frame: string;
  rev: string;
  at: string;
  sha: string;
  html: string;
  png: string;
}

export declare const STYLE_CTX: ContextItem[];
export declare function STYLE_contrast(a: string, b: string): string;
export declare const DELIVERY_MANIFEST: SampleDeliveryManifest;
export declare const DELIVERY_FRAMEWORKS: [string, string][];
export declare const DELIVERY_ITEMS: SampleDeliveryItem[];
export declare const DELIVERY_FILES: SampleDeliveryFile[];
export declare const DELIVERY_BLOCKED: SampleDeliveryBlockedItem[];
export declare const DELIVERY_STALE: SampleDeliveryStale;
export type SampleDeviceThumbKind = 'chart' | 'table' | 'drawer' | 'image';
export type SampleDeviceFrame = [string, string, string, PillTuple, SampleDeviceThumbKind];
export interface SampleDeviceFinding {
  n: number;
  of: number;
  title: string;
  body: string;
  base: string;
  next: string;
  frame: string;
  reqs: string[];
  changed: string;
}
export type SampleDeviceBundlePick = [string, string, string, boolean, string?];
export interface SampleDeviceBundle {
  pick: SampleDeviceBundlePick[];
  files: string[];
  id: string;
  size: string;
  spec: string;
}

export declare const DELIVERY_PROMPT: string[];
export declare const MODELS_DEVICE_FRAMES: SampleDeviceFrame[];
export declare const MODELS_FINDING: SampleDeviceFinding;
export declare const MODELS_BUNDLE: SampleDeviceBundle;

// S36 Models and usage. Credits are fixture units, not a price list (PRD AC-SPK-8).
export type ModelsSourceId = 'hosted' | 'cli' | 'api';
export type ModelsSeverity = 'calm' | 'warn' | 'crit';
export type ModelsUsageMoment = 'calm' | 'near' | 'capped';
export type ModelsRegistryState = 'sel' | 'ok' | 'off';
export type ModelsAgentInstalled = 'ok' | 'none';
export type ModelsAgentSignIn = 'ok' | 'no' | 'unknown';
export type ModelsLedgerKind = 'reserve' | 'settle' | 'refund' | 'hold' | 'byok' | 'cli';
export interface SampleModelsUsage {
  used: number;
  reserved: number;
  pending: number;
  cap: number;
  sev: ModelsSeverity;
  win5: [number, number, string];
  win7: [number, number, string];
}
export interface SampleModelsPeriod { label: string; resets: string; days: number; workspaceCap: number; workspaceUsed: number }
export interface SampleModelsCaps { perRun: number; monthly: number; concurrency: number }
export interface SampleModelSource { id: ModelsSourceId; name: string; short?: string; icon: string; bills: string; sub: string; billsC: string }
export interface SampleModelRegistryRow { name: string; id: string; caps: string[]; lim: string; rc: string; est: string; st: ModelsRegistryState; note: string }
export type SampleModelEffort = [string, string];
export type SampleModelTask = [string, string, string, PillTuple];
export interface SampleModelsKey {
  provider: string;
  tail: string;
  by: string;
  added: string;
  tested: string;
  models: number;
  tests: ['ok' | 'warn', string, string][];
  usage: { tokensIn: string; tokensOut: string; runs: number };
}
export interface SampleModelsApi {
  providers: [string, string, boolean, string][];
  sel: number;
  fetched: [string, string, 'sel' | 'ok'][];
  fetchedCount: number;
}
export interface SampleModelsConnector { state: string; paired: string; since: string; version: string; addr: string; os: string; code: string }
export interface SampleModelsAgent { name: string; ver?: string; inst: ModelsAgentInstalled; sign: ModelsAgentSignIn; pick?: boolean; sub: string; hint?: string }
export interface SampleModelsAgentRun {
  agent: string;
  model: string;
  models: string[];
  effort: string;
  efforts: string[];
  perm: number;
  perms: [string, string][];
  copy: string;
  branch: string;
  usage: { runs: number; tokens: string; plan: string };
}
export interface SampleModelsRun {
  id: string;
  task: string;
  target: string;
  model: string;
  effort: string;
  est: [number, number];
  reserve: number;
  expect: number;
  release: number;
  outCap: string;
  key: string;
  limitIn: string;
  rc: string;
  ctx: [string, string, number][];
  checks: [string, string][];
}
export interface SampleModelsLedgerRow { t: string; run: string; kind: ModelsLedgerKind; task: string; model: string; amt: string; left: string; st: PillTuple; sel?: boolean }
export interface SampleModelsLedgerDetail { run: string; title: string; consumed: string; released: string; pending: string; provider: string; key: string }
export declare const MODELS_READY: boolean;
export declare const MODELS_USAGE: Record<ModelsUsageMoment, SampleModelsUsage>;
export declare const MODELS_PERIOD: SampleModelsPeriod;
export declare const MODELS_CAPS: SampleModelsCaps;
export declare const MODELS_SOURCES: SampleModelSource[];
export declare const MODELS_PROVIDERS: [string, number][];
export declare const MODELS_REGISTRY: SampleModelRegistryRow[];
export declare const MODELS_EFFORT: SampleModelEffort[];
export declare const MODELS_TASKS: SampleModelTask[];
export declare const MODELS_KEY: SampleModelsKey;
export declare const MODELS_API: SampleModelsApi;
export declare const MODELS_CONNECTOR: SampleModelsConnector;
export declare const MODELS_AGENTS: SampleModelsAgent[];
export declare const MODELS_AGENT_RUN: SampleModelsAgentRun;
export declare const MODELS_RUN: SampleModelsRun;
export declare const MODELS_LEDGER: SampleModelsLedgerRow[];
export declare const MODELS_LEDGER_DETAIL: SampleModelsLedgerDetail;

// S37 Build contracts and release readiness. A check is passed only with evidence (IMP-18).
export interface SampleDeliveryContract {
  stage: string;
  n: string;
  kind: string;
  ic: 'req' | 'server' | 'db' | 'layers' | 'flag';
  name: string;
  ver: string;
  st: PillTuple;
  link: string;
  checks: string;
  sel?: boolean;
}
export interface SampleDeliveryBuild {
  commit: string;
  env: string;
  at: string;
  pack: string;
}
export interface SampleDeliveryCheck {
  k: PillTone;
  t: string;
  p: string;
  ev: string;
  why?: string;
}
export type SampleDeliveryMatrixRow = [StageId, number, number, number, number, number, number, [string, string][], string];
export interface SampleDeliveryGate {
  id: string;
  title: string;
  ic: 'req' | 'gauge' | 'eye' | 'shield';
  pill: PillTuple;
  big: string;
  sub: string;
  reason: string;
  ev: [string, string][];
}
export interface SampleDeliveryRun {
  id: string;
  check: string;
  commit: string;
  at: string;
  steps: [PillTone, string, string, string][];
  classes: [string, boolean][];
}
export type SampleDeliveryTimelineRow = [string, string, string, PillTuple, string, string];
export declare const DELIVERY_READY: boolean;
export declare const DELIVERY_CONTRACTS: SampleDeliveryContract[];
export declare const DELIVERY_BUILD: SampleDeliveryBuild;
export declare const DELIVERY_CHECKS: SampleDeliveryCheck[];
export declare const DELIVERY_MATRIX: SampleDeliveryMatrixRow[];
export declare const DELIVERY_GATE: SampleDeliveryGate[];
export declare const DELIVERY_RUN: SampleDeliveryRun;
export declare const DELIVERY_TIMELINE: SampleDeliveryTimelineRow[];
// S38 GenUI cards and the verdict the Rust validator recorded for each (IMP-21, IMP-36).
// A card renders only on a `valid` verdict; a refusal renders the fallback card and never part of the card.
export type SampleGenUiVerdict =
  | { status: 'valid' }
  | { status: 'rejected'; reason: string };
export interface SampleGenUiCard {
  id: string;
  title: string;
  family: 'checklist' | 'comparison' | 'question';
  payload: unknown;
  verdict: SampleGenUiVerdict;
}
export declare const GENUI_CARDS: SampleGenUiCard[];

// S07 Spec document at every depth (sample/parts/gap-b.mjs).
export interface SampleGapbPrinciple { id: string; t: string; rev: string; src: string; pill: PillTuple }
export interface SampleGapbSimpleRow { k: string; t: string }
export interface SampleGapbBlock { id: string; k: string; t: string; basis: string[]; rev: string }
export interface SampleGapbExpertBlock { id: string; k: string; t: string; basis: string[]; pill: PillTuple }
export interface SampleGapbMissingBlock { id: string; t: string; from: string }
export interface SampleGapbImpactRow { area: string; item: string; n: number; pill: PillTuple }
export interface SampleGapbKit { name: string; rev: string; picked: number; decision: string; by: string }
export declare const GAPB_HASH: string;
export declare const GAPB_PRINCIPLES: SampleGapbPrinciple[];
export declare const GAPB_SIMPLE: SampleGapbSimpleRow[];
export declare const GAPB_BLOCKS: SampleGapbBlock[];
export declare const GAPB_EXPERT: SampleGapbExpertBlock[];
export declare const GAPB_MISSING: SampleGapbMissingBlock[];
export declare const GAPB_IMPACT: SampleGapbImpactRow[];
export declare const GAPB_KIT: SampleGapbKit;
// S05 Decision log (gap-a.mjs, IMP-56).
export interface SampleDecisionLogEntry {
  id: string;
  q: string;
  qt: string;
  dec: string;
  alts: string[];
  by: string;
  at: string;
  how: string;
  kind: 'Interview' | 'Plan' | 'Kit';
  field?: string;
}
export interface SampleOpenQuestion {
  id: string;
  q: string;
  qt: string;
  at: string;
  where: string;
}
export interface SampleNoBasis {
  text: string;
  where: string;
  note: string;
}
export declare const GAPA_LOG: SampleDecisionLogEntry[];
export declare const GAPA_OPEN: SampleOpenQuestion[];
export declare const GAPA_KIT: SampleDecisionLogEntry;
export declare const GAPA_NOBASIS: SampleNoBasis;
// S02 Sign-in and legal pages (IMP-54).
export interface SampleGapUser {
  email: string;
  code: string[];
  resend: string;
  left: number;
}
export interface SampleGapTerms {
  title: string;
  since: string;
  route: string;
  items: [string, string][];
}
export interface SampleGapPrivacy {
  title: string;
  since: string;
  route: string;
  rows: [string, string, string][];
}
export declare const GAPA_USER: SampleGapUser;
export declare const GAPA_TERMS: SampleGapTerms;
export declare const GAPA_PRIVACY: SampleGapPrivacy;
// S25 Export (IMP-66).
export interface SampleGapdExport {
  rev: string;
  name: string;
  tree: ['dir' | 'file', string, string][];
  tickets: [string, string, string, string, PillTone][];
  layers: [string, string, string][];
  left: [string, string][];
  statusBack: [string, string, string, PillTone][];
}
export declare const GAPD_EXPORT: SampleGapdExport;
export declare const GAPD_CTX: ContextItem[];
// S06 Pitch (Simple) (IMP-57).
export type SamplePitchField = [string, string, string[], '' | 'nobasis'];
export type SampleTicketSlice = [string, string, string, string];
export declare const GAPA_PITCH: SamplePitchField[];
export declare const GAPA_SLICES: SampleTicketSlice[];
// S19 ADRs and glossary (IMP-59, boards-gap-b.mjs).
export interface SampleGlossaryTerm {
  term: string;
  id: string;
  al: string;
  ctx: string;
  def: string;
  rev: string;
  pill: PillTuple;
}
export interface SampleAdrRow {
  id: string;
  t: string;
  st: PillTuple;
  rev: string;
  link: string;
}
export interface SampleAdrDetail {
  ctx: string;
  alts: string[];
  decision: string;
  cons: string;
}
export interface SampleRecordProposal {
  src: string;
  base: string;
  affects: string[];
}
export declare const GAPB_TERMS: SampleGlossaryTerm[];
export declare const GAPB_ADRS: SampleAdrRow[];
export declare const GAPB_ADR3: SampleAdrDetail;
export declare const GAPB_PROPOSAL: SampleRecordProposal;
// S04 Interview (Group A, IMP-55).
export interface SampleInterviewQuestion {
  id: string;
  n: number;
  text: string;
  rec: string;
  why: string;
  alts: string[];
}
export interface SampleInterviewWhy {
  plain: string;
  evidence: string[];
  tradeoffs: [string, string][];
}
export interface SampleInterviewOpen {
  id: string;
  q: string;
  qt: string;
  at: string;
  where: string;
}
export type SampleInterviewGroundRow = ['req' | 'frame' | 'doc', string, string, string, PillTone, string];
export declare const GAPA_IDEA: string;
export declare const GAPA_ANSWERED: [string, string, string, string][];
export declare const GAPA_SKIPPED: [string, string];
export declare const GAPA_Q5: SampleInterviewQuestion;
export declare const GAPA_PITCH_FIELDS: [string, StageTone, string][];
export declare const GAPA_GROUND: SampleInterviewGroundRow[];
export declare const GAPA_WHY: SampleInterviewWhy;
// S14 GAP register and S21 Canvas step (IMP-60, IMP-61).
export interface SampleGapBEntry {
  id: string;
  need: string;
  closest: string;
  why: string;
  used: string;
  st: PillTuple;
}
export type SampleGapCFrameKind = 'overview' | 'table' | 'drawer' | 'lines';
export interface SampleGapCFrame {
  id: string;
  title: string;
  rev: string;
  comps: string[];
  noComp: number;
  st: PillTuple;
  comments: number;
  kind: SampleGapCFrameKind;
}
export type SampleGapCPin = [string, string, string, string, 'open' | 'done'];
export type SampleGapCPolicy = [string, string, PillTone];
export type SampleGapCBlocked = [string, string, string, string];
export interface SampleGapCUntrusted {
  src: string;
  text: string;
  outcome: [string, string][];
}
export type SampleGapCTool = [string, string, PillTone];
export declare const GAPB_GAPS: SampleGapBEntry[];
export declare const GAPC_CTX_S21: ContextItem[];
export declare const GAPC_FRAMES: SampleGapCFrame[];
export declare const GAPC_PINS: SampleGapCPin[];
export declare const GAPC_POLICY: SampleGapCPolicy[];
export declare const GAPC_BLOCKED: SampleGapCBlocked[];
export declare const GAPC_UNTRUSTED: SampleGapCUntrusted;
export declare const GAPC_LOCKED_TICKETS: string[];
export declare const GAPC_TOOLS: SampleGapCTool[];
// Gap group C: S16 Ticket detail and criteria (IMP-63).
export type SampleGapcComponentOption = [string, string, string];
export interface SampleGapcTicketComponent {
  slug: string;
  name: string;
  install: string;
  ver: string;
}
export type SampleGapcBlocker = [string, string, PillTone, string];
export type SampleGapcCriterion = [string, string, string, PillTuple];
export interface SampleGapcTicketDetail {
  id: string;
  title: string;
  lane: string;
  rev: string;
  summary: string;
  comp: SampleGapcTicketComponent | null;
  blockers: SampleGapcBlocker[];
  owns: string;
  criteria: SampleGapcCriterion[];
  rules: string[];
  designRev: string;
  newRev: string;
  stagesL?: string[];
}
export declare const GAPC_CTX_S16: ContextItem[];
export declare const GAPC_T05: SampleGapcTicketDetail;
export declare const GAPC_COMPONENTS: SampleGapcComponentOption[];
// S20 Agent inbox (IMP-65). The six background-run types of R-AGT-1.
export type AgentRunStatus = 'run' | 'wait' | 'done' | 'fail';
export interface SampleAgentRun {
  id: string;
  type: string;
  icon: 'comment' | 'doc' | 'image' | 'eye' | 'list' | 'check';
  title: string;
  where: string;
  st: AgentRunStatus;
  step: string;
  cost: string;
  cr: string;
}
export type SampleAgentStep = ['ok' | 'run' | 'mute', string];
export declare const GAPD_RUNS: SampleAgentRun[];
export declare const GAPD_STEPS: SampleAgentStep[];
// S41 Enhance prompt (F531–F539).
export type SampleEnhanceSeg = ['k' | 'c' | 'a' | 'd' | 's', string, string?];
export type SampleEnhanceCtxItem = ['flag' | 'lock' | 'frame' | 'doc' | 'req' | 'history', string, string];
export interface SampleEnhanceCost {
  est: string;
  actual: string;
  max: string;
  time: string;
  send: string;
  words: [string, string];
}
export type SampleEnhanceBlockedVariant = [string, 'bad' | 'warn', string, string[]];
export declare const ENH_READY: boolean;
export declare const ENH_ORIGINAL: string;
export declare const ENH_SEGS: SampleEnhanceSeg[];
export declare const ENH_ORIG_SEGS: SampleEnhanceSeg[];
export declare const ENH_ASSUMPTIONS: [string, string][];
export declare const ENH_CTX: SampleEnhanceCtxItem[];
export declare const ENH_NOT_SENT: string;
export declare const ENH_COST: SampleEnhanceCost;
export declare const ENH_SHORTCUT: string;
export declare const ENH_BLOCKED: SampleEnhanceBlockedVariant[];

// Everything else the boards use is exported too; declare it here before use.
