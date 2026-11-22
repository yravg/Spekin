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
// Everything else the boards use is exported too; declare it here before use.
