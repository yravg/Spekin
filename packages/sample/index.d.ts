// Types for the fields the app reads. Add a type here when a screen starts reading a new export.
export interface SampleProject { name: string; product: string; increment: string; spec: string; user: string; initials: string }
export type StageTone = 'ok' | 'half' | 'ring' | 'warn' | 'bad';
export interface SampleStage { id: StageId; n: string; name: string; st: StageTone; text: string }
export type StageId = 'planning' | 'spec' | 'design' | 'frontend' | 'backend' | 'integration' | 'testing' | 'deploy';
export interface SampleUsage { source: string; used: number; cap: number }
export interface SampleModel { source: string; name: string; est: string }
export declare const PROJECT: SampleProject;
export declare const STAGES: SampleStage[];
export declare const USAGE: SampleUsage;
export declare const MODEL: SampleModel;
// Everything else the boards use is exported too; declare it here before use.
