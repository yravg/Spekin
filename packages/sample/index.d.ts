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
export declare const DELIVERY_PROMPT: string[];
// Everything else the boards use is exported too; declare it here before use.
