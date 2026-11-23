// Fail-closed GenUI card schema validator mirroring IMP-10 (crates/spekin-core/src/genui.rs).
// Pure validation: no IO, no HTML/script evaluation, never returns a partial card.

export const SCHEMA_VERSION = 1;
export const MAX_NESTING_DEPTH = 6;
export const MAX_ITEMS = 50;
export const MAX_TEXT_LEN = 2_000;

export const PROVENANCES = [
  'accepted_artifact',
  'model_proposal',
  'imported_observation',
] as const;
export type Provenance = (typeof PROVENANCES)[number];

export const ALLOWED_ACTION_KINDS = [
  'pin',
  'unpin',
  'expand_details',
  'open_review',
  'compare',
  'edit_draft',
  'select_option',
  'skip_question',
  'export_json',
] as const;
export type AllowedActionKind = (typeof ALLOWED_ACTION_KINDS)[number];

export const CHECKLIST_STATUSES = [
  'untested',
  'passed_fixture',
  'passed',
  'failed',
  'no_evidence',
] as const;
export type ChecklistStatus = (typeof CHECKLIST_STATUSES)[number];

export const GENUI_FAMILIES = ['checklist', 'comparison', 'question'] as const;
export type GenUiFamilyName = (typeof GENUI_FAMILIES)[number];

export interface GenUiAction {
  kind: AllowedActionKind;
  label: string;
  target_id: string | null;
  href: string | null;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  status: ChecklistStatus;
}

export interface ComparisonOption {
  id: string;
  label: string;
  badge?: string | null;
  summary?: string | null;
  recommended?: boolean;
}

export interface QuestionOption {
  id: string;
  label: string;
  hint?: string | null;
  recommended?: boolean;
}

export interface GenUiCardBase {
  schema_version: number;
  id: string;
  title: string;
  provenance: Provenance;
  body: string | null;
  links: string[];
  actions: GenUiAction[];
}

export type GenUiCard =
  | (GenUiCardBase & {
      family: 'checklist';
      items: ChecklistItem[];
      summary?: string | null;
    })
  | (GenUiCardBase & {
      family: 'comparison';
      options: ComparisonOption[];
      baseline_id?: string | null;
    })
  | (GenUiCardBase & {
      family: 'question';
      step: number;
      total_steps: number;
      prompt: string;
      why?: string | null;
      options: QuestionOption[];
      allow_custom?: boolean;
    });

export type RejectionReason =
  | { code: 'invalid_json'; message: string }
  | { code: 'unsupported_schema_version'; found: number; expected: number }
  | { code: 'excessive_nesting'; depth: number; max: number }
  | { code: 'unknown_component'; family: string }
  | { code: 'invalid_enum'; field: string; value: string }
  | { code: 'missing_required_field'; field: string }
  | { code: 'too_many_items'; field: string; count: number; max: number }
  | { code: 'text_too_long'; field: string; len: number; max: number }
  | { code: 'unsafe_url'; field: string; url: string }
  | { code: 'disallowed_script_or_tool'; field: string; pattern: string }
  | { code: 'privilege_escalation'; action: string };

export type GenUiValidation =
  | { status: 'ok'; card: GenUiCard }
  | { status: 'rejected'; reason: RejectionReason };

const PRIVILEGED_ACTIONS = new Set([
  'accept',
  'accept_spec',
  'approve',
  'deploy',
  'spend',
  'spend_credits',
  'grant_admin',
  'grant_role',
  'escalate',
  'bypass_review',
  'run_shell',
  'exec',
  'exec_command',
  'shell',
  'write_file',
  'delete_project',
]);

const DISALLOWED_REGEXES: [string, RegExp][] = [
  ['script_tag', /<\s*\/?\s*script/i],
  ['javascript:', /javascript:/i],
  ['vbscript:', /vbscript:/i],
  ['data:', /data:/i],
  ['onerror=', /onerror\s*=/i],
  ['onload=', /onload\s*=/i],
  ['eval(', /eval\s*\(/i],
  ['function(', /function\s*\(/i],
  ['document.cookie', /document\.cookie/i],
  ['window.location', /window\.location/i],
  ['bash -c', /bash\s+-c/i],
  ['sh -c', /sh\s+-c/i],
  ['rm -rf', /rm\s+-rf/i],
  ['mcp__', /mcp__/i],
  ['exec_command', /exec_command/i],
  ['run_shell', /run_shell/i],
  ['child_process', /child_process/i],
  ['tool_call', /tool_call/i],
  ['tool_use', /tool_use/i],
];

const COMMON_KEYS = new Set([
  'schema_version',
  'id',
  'title',
  'provenance',
  'body',
  'links',
  'actions',
  'family',
]);

const FAMILY_KEYS: Record<GenUiFamilyName, Set<string>> = {
  checklist: new Set(['items', 'summary']),
  comparison: new Set(['options', 'baseline_id']),
  question: new Set(['step', 'total_steps', 'prompt', 'why', 'options', 'allow_custom']),
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function jsonDepth(v: unknown): number {
  if (Array.isArray(v)) {
    return 1 + v.reduce<number>((max, item) => Math.max(max, jsonDepth(item)), 0);
  }
  if (isRecord(v)) {
    return 1 + Object.values(v).reduce<number>((max, val) => Math.max(max, jsonDepth(val)), 0);
  }
  return 1;
}

function checkSafeUrl(field: string, url: string): RejectionReason | null {
  const trimmed = url.trim();
  if (!trimmed || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    return { code: 'unsafe_url', field, url };
  }
  const lower = trimmed.toLowerCase();
  const okScheme =
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    (trimmed.startsWith('/') && !trimmed.startsWith('//'));
  if (!okScheme) {
    return { code: 'unsafe_url', field, url };
  }
  return null;
}

function scanStrings(field: string, v: unknown): RejectionReason | null {
  if (typeof v === 'string') {
    if (v.length > MAX_TEXT_LEN) {
      return { code: 'text_too_long', field, len: v.length, max: MAX_TEXT_LEN };
    }
    for (const [label, re] of DISALLOWED_REGEXES) {
      if (re.test(v)) {
        return { code: 'disallowed_script_or_tool', field, pattern: label };
      }
    }
    return null;
  }
  if (Array.isArray(v)) {
    if (v.length > MAX_ITEMS) {
      return { code: 'too_many_items', field, count: v.length, max: MAX_ITEMS };
    }
    for (const item of v) {
      const err = scanStrings(field, item);
      if (err) return err;
    }
    return null;
  }
  if (isRecord(v)) {
    for (const [k, val] of Object.entries(v)) {
      const err = scanStrings(k, val);
      if (err) return err;
    }
  }
  return null;
}

function reject(reason: RejectionReason): GenUiValidation {
  return { status: 'rejected', reason };
}

export function validateGenUiCard(input: unknown): GenUiValidation {
  let value: unknown = input;
  if (typeof input === 'string') {
    try {
      value = JSON.parse(input);
    } catch (e) {
      return reject({
        code: 'invalid_json',
        message: e instanceof Error ? e.message : 'parse error',
      });
    }
  }

  if (!isRecord(value)) {
    return reject({ code: 'invalid_json', message: 'root must be an object' });
  }

  const depth = jsonDepth(value);
  if (depth > MAX_NESTING_DEPTH) {
    return reject({ code: 'excessive_nesting', depth, max: MAX_NESTING_DEPTH });
  }

  const scanErr = scanStrings('root', value);
  if (scanErr) return reject(scanErr);

  if (typeof value.schema_version !== 'number') {
    return reject({ code: 'missing_required_field', field: 'schema_version' });
  }
  if (value.schema_version !== SCHEMA_VERSION) {
    return reject({
      code: 'unsupported_schema_version',
      found: value.schema_version,
      expected: SCHEMA_VERSION,
    });
  }

  if (typeof value.id !== 'string' || !value.id.trim()) {
    return reject({ code: 'missing_required_field', field: 'id' });
  }
  if (typeof value.title !== 'string' || !value.title.trim()) {
    return reject({ code: 'missing_required_field', field: 'title' });
  }
  if (typeof value.provenance !== 'string') {
    return reject({ code: 'missing_required_field', field: 'provenance' });
  }
  if (!(PROVENANCES as readonly string[]).includes(value.provenance)) {
    return reject({ code: 'invalid_enum', field: 'provenance', value: value.provenance });
  }
  if (typeof value.family !== 'string') {
    return reject({ code: 'missing_required_field', field: 'family' });
  }
  if (!(GENUI_FAMILIES as readonly string[]).includes(value.family)) {
    return reject({ code: 'unknown_component', family: value.family });
  }

  const family = value.family as GenUiFamilyName;
  const allowedFamilyKeys = FAMILY_KEYS[family];
  for (const key of Object.keys(value)) {
    if (!COMMON_KEYS.has(key) && !allowedFamilyKeys.has(key)) {
      return reject({ code: 'invalid_json', message: 'unknown field: ' + key });
    }
  }

  const linksRaw = value.links ?? [];
  if (!Array.isArray(linksRaw) || linksRaw.some((l) => typeof l !== 'string')) {
    return reject({ code: 'invalid_json', message: 'links must be string[]' });
  }

  const actionsRaw = value.actions ?? [];
  if (!Array.isArray(actionsRaw)) {
    return reject({ code: 'invalid_json', message: 'actions must be an array' });
  }

  const actions: GenUiAction[] = [];
  for (const raw of actionsRaw) {
    if (!isRecord(raw) || typeof raw.kind !== 'string' || typeof raw.label !== 'string') {
      return reject({ code: 'missing_required_field', field: 'actions' });
    }
    if (PRIVILEGED_ACTIONS.has(raw.kind.toLowerCase())) {
      return reject({ code: 'privilege_escalation', action: raw.kind });
    }
    if (!(ALLOWED_ACTION_KINDS as readonly string[]).includes(raw.kind)) {
      return reject({ code: 'invalid_enum', field: 'actions.kind', value: raw.kind });
    }
    if (raw.href !== undefined && raw.href !== null) {
      if (typeof raw.href !== 'string') {
        return reject({ code: 'invalid_json', message: 'action href must be string' });
      }
      const urlErr = checkSafeUrl('actions.href', raw.href);
      if (urlErr) return reject(urlErr);
    }
    actions.push({
      kind: raw.kind as AllowedActionKind,
      label: raw.label,
      target_id: typeof raw.target_id === 'string' ? raw.target_id : null,
      href: typeof raw.href === 'string' ? raw.href : null,
    });
  }

  const base: GenUiCardBase = {
    schema_version: SCHEMA_VERSION,
    id: value.id,
    title: value.title,
    provenance: value.provenance as Provenance,
    body: typeof value.body === 'string' ? value.body : null,
    links: linksRaw as string[],
    actions,
  };

  if (family === 'checklist') {
    if (!Array.isArray(value.items)) {
      return reject({ code: 'missing_required_field', field: 'items' });
    }
    const items: ChecklistItem[] = [];
    for (const row of value.items) {
      if (
        !isRecord(row) ||
        typeof row.id !== 'string' ||
        typeof row.label !== 'string' ||
        typeof row.checked !== 'boolean' ||
        typeof row.status !== 'string'
      ) {
        return reject({ code: 'missing_required_field', field: 'items' });
      }
      if (!(CHECKLIST_STATUSES as readonly string[]).includes(row.status)) {
        return reject({ code: 'invalid_enum', field: 'items.status', value: row.status });
      }
      items.push({
        id: row.id,
        label: row.label,
        checked: row.checked,
        status: row.status as ChecklistStatus,
      });
    }
    return {
      status: 'ok',
      card: {
        ...base,
        family: 'checklist',
        items,
        summary: typeof value.summary === 'string' ? value.summary : null,
      },
    };
  }

  if (family === 'comparison') {
    if (!Array.isArray(value.options)) {
      return reject({ code: 'missing_required_field', field: 'options' });
    }
    const options: ComparisonOption[] = [];
    for (const opt of value.options) {
      if (!isRecord(opt) || typeof opt.id !== 'string' || typeof opt.label !== 'string') {
        return reject({ code: 'missing_required_field', field: 'options' });
      }
      options.push({
        id: opt.id,
        label: opt.label,
        badge: typeof opt.badge === 'string' ? opt.badge : null,
        summary: typeof opt.summary === 'string' ? opt.summary : null,
        recommended: Boolean(opt.recommended),
      });
    }
    return {
      status: 'ok',
      card: {
        ...base,
        family: 'comparison',
        options,
        baseline_id: typeof value.baseline_id === 'string' ? value.baseline_id : null,
      },
    };
  }

  // question
  if (
    typeof value.step !== 'number' ||
    typeof value.total_steps !== 'number' ||
    typeof value.prompt !== 'string' ||
    !Array.isArray(value.options)
  ) {
    return reject({ code: 'missing_required_field', field: 'question' });
  }
  const options: QuestionOption[] = [];
  for (const opt of value.options) {
    if (!isRecord(opt) || typeof opt.id !== 'string' || typeof opt.label !== 'string') {
      return reject({ code: 'missing_required_field', field: 'options' });
    }
    options.push({
      id: opt.id,
      label: opt.label,
      hint: typeof opt.hint === 'string' ? opt.hint : null,
      recommended: Boolean(opt.recommended),
    });
  }
  return {
    status: 'ok',
    card: {
      ...base,
      family: 'question',
      step: value.step,
      total_steps: value.total_steps,
      prompt: value.prompt,
      why: typeof value.why === 'string' ? value.why : null,
      options,
      allow_custom: Boolean(value.allow_custom),
    },
  };
}
