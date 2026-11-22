// Spekin design canvas kit. One source of truth for the Claude Design canvas and the offline copy.
// node build.mjs -> project/*.dc.html, project/canvas.json, offline/index.html. Boards live in boards-*.mjs (one owner per file).
// Format and runtime follow the Clausarium canvas kit (yravg/Clausarium docs/design/clausarium-canvas/cl.mjs), adapted for Spekin.
import { existsSync, readFileSync } from 'node:fs';
import * as S from './sample/meranti-yard.mjs';
export { S };
const HERE = new URL('.', import.meta.url);
// Publish mode (SPK_PUBLISH=1) points assets at the canvas's /_blob/ uploads (blobs.json); local mode keeps relative paths for render and offline.
export const PUBLISH = process.env.SPK_PUBLISH === '1';
const blobs = PUBLISH && existsSync(new URL('blobs.json', HERE)) ? JSON.parse(readFileSync(new URL('blobs.json', HERE), 'utf8')) : {};
export const W = 1900;
export const img = (p) => (blobs[p] ? '/_blob/' + blobs[p] : 'ref/' + p);

// Icons: simple 24px stroke glyphs in the Lucide style (drawn for this canvas).
const P = {
  chev: '<path d="M6 9l6 6 6-6"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>', down: '<path d="M12 5v14M5 12l7 7 7-7"/>', chevR: '<path d="M9 6l6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  pointer: '<path d="M4 4l7 17 2.5-7.5L21 11z"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  frame: '<path d="M22 6H2M22 18H2M6 2v20M18 2v20"/>', type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  comment: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  fit: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>', cols: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>', redo: '<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>',
  clip: '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>', panelR: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/>',
  alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
  server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
  db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
  req: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  diff: '<path d="M12 3v14M5 10h14M5 21h14"/>', flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  square: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
};
export const ic = (n, s = 16, sw = 1.75) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || P.square}</svg>`;
export const NT = '<span class="newtag">NEW</span>';
export const PT = '<span class="parttag">PARTIAL</span>';
export const LT = '<span class="latertag">LATER</span>';
export const note = (html, style, kind = '') => `<div class="note${kind ? ' ' + kind : ''}" style="${style}">${html}</div>`;
const act = (o) => (o.later ? ` data-later="${o.later}" disabled title="Later: ${o.later}"` : ` data-does="${o.does}"${o.f ? ` data-feature="${o.f}"` : ''}`);
// text button: o = { does, f, later, cls: ink|ghost|plain, icon, sm }
export const btn = (label, o = {}) => `<button type="button" class="sp-btn ${o.cls || 'ghost'}${o.sm ? ' sm' : ''}"${act(o)}>${o.icon ? ic(o.icon, 14) : ''}${label}${o.later ? LT : ''}</button>`;
// icon button: aria-label always present
export const ib = (icon, label, o = {}) => `<button type="button" class="sp-ibtn${o.sm ? ' sm' : ''}" aria-label="${label}"${o.pressed ? ' aria-pressed="true"' : ''}${act(o)}>${ic(icon, o.s || 16)}${o.badge ? `<span class="badge">${o.badge}</span>` : ''}</button>`;
export const pill = ([k, t]) => `<span class="pill ${k}">${t}</span>`;

// ---------------------------------------------------------------- the Spekin app shell (1440 x 900)
const STAGEDOES = (s) => `Switches the main workspace to ${s.name} in place, no reload; restores that stage's tabs, viewport, selection and drafts`;
export function top({ save = ['ok', 'Saved 12:41'], busy = null } = {}) {
  const [sk, st] = save;
  const pct = Math.round(S.USAGE.used / S.USAGE.cap * 100), sev = pct >= 90 ? ' crit' : pct >= 70 ? ' warn' : '';
  return `<header class="sp-top">
<span class="sp-mark" aria-hidden="true">S</span>
<div class="isnew" style="display:flex;align-items:center;gap:8px;position:relative" data-feature="F103">${NT}
<button type="button" class="sp-proj" data-does="Opens the quick project switcher (Cmd/Ctrl+K), most recent first; switching restores only that project's saved state" data-feature="F103"><b>${S.PROJECT.name}</b><span>/</span><span>${S.PROJECT.product}</span><kbd class="sp-kbd">⌘K</kbd></button>
<span class="sp-sep"></span>
<button type="button" class="sp-chip" data-does="Opens the increment picker: which feature increment the stages describe" data-feature="F103"><span class="k">Increment</span>${S.PROJECT.increment}${ic('chev', 12)}</button>
<button type="button" class="sp-chip" data-does="Opens the accepted spec revision and its history (S07); never edits it" data-feature="F103">${ic('lock', 12)}<span class="k">Spec</span><span class="r">${S.PROJECT.spec}</span>accepted</button>
</div>
<span class="sp-fill"></span>
${busy ? `<button type="button" class="sp-busy isnew" data-does="Opens the job list: what is designing, what waits and why; a job never runs without a reserved maximum" data-feature="F109">${NT}<span class="pulse" aria-hidden="true"></span>${busy}</button>` : ''}
<span class="sp-save${sk === 'bad' ? ' conflict' : ''} isnew" data-feature="F112" role="status">${NT}<span class="dot ${sk}"></span>${st}</span>
<button type="button" class="sp-meter isnew${sev}" data-does="Opens S36 usage: estimate, reservations, actuals, cap and remaining credits; the bar turns amber at 70% and red at 90% of the cap" data-feature="F111">${NT}${S.USAGE.source}<i><u style="width:${Math.round(S.USAGE.used / S.USAGE.cap * 100)}%"></u></i><b>${S.USAGE.used.toLocaleString('en-US')}</b>of ${S.USAGE.cap.toLocaleString('en-US')} cr</button>
<span class="isnew" style="position:relative;display:inline-flex" data-feature="F109">${NT}${ib('inbox', 'Agent inbox: 2 jobs need approval', { does: 'Opens the Agent Inbox: running jobs and approvals, beside the work, never over it', f: 'F109', badge: 2 })}</span>
<div class="sp-lang" role="group" aria-label="Language"><button type="button" aria-pressed="true" data-does="Shows the UI in English" data-feature="F115">EN</button><button type="button" data-does="Shows the UI in Bahasa Indonesia" data-feature="F115">ID</button></div>
<span class="sp-av" aria-label="${S.PROJECT.user}">${S.PROJECT.initials}</span>
</header>`;
}
export function stagebar(cur) {
  return `<nav class="sp-stagebar" aria-label="Workflow stages">
<ol class="sp-stl isnew" data-feature="F101">${NT}${S.STAGES.map((s) => `<li style="display:contents"><button type="button" class="sp-stage"${s.id === cur ? ' aria-current="page"' : ''} data-does="${STAGEDOES(s)}" data-feature="F102"><span class="nm"><i>${s.n}</i>${s.name}</span><span class="ss"><span class="dot ${s.st}"></span>${s.text}</span></button></li>`).join('')}</ol>
${btn('Readiness', { icon: 'flag', does: 'Opens the stage inspector: required artifacts, blockers, evidence and next proposed action for the current stage', f: 'F101' })}
</nav>`;
}
export const app = ({ stage, save, busy, chat, main }) => `<div class="sp-app">${top({ save, busy })}${stagebar(stage)}<div class="sp-body">${chat}${main}</div></div>`;

// conversation panel pieces
const CI = { frame: 'frame', doc: 'doc', req: 'req', image: 'image', server: 'server', db: 'db' };
export const ctx = (items, foot) => `<div class="sp-ctx isnew" data-feature="F106">${NT}
<div class="t">Context for the next run<span>${items.length} items</span></div>
<div class="sp-cc">${items.map(([k, n, r]) => `<span class="sp-cchip">${ic(CI[k] || 'doc', 12)}${n}<span class="r">${r}</span><button type="button" aria-label="Remove ${n} from context" data-does="Removes ${n} from the next run's context" data-feature="F106">${ic('x', 11)}</button></span>`).join('')}<button type="button" class="sp-cchip add" data-does="Adds a frame, artifact, requirement or reference to the context list" data-feature="F106">${ic('plus', 11)}Add</button></div>
<div class="f">${foot}</div></div>`;
export const composer = (ph) => `<div class="sp-comp"><div class="ta">${ph}</div><div class="row">
${ib('plus', 'Attach a file', { does: 'Attaches a PNG, JPEG or WebP the user picked; nothing is read without a file choice', s: 15, sm: true, f: 'F114' })}
${ib('at', 'Mention an artifact', { does: 'Inserts an artifact reference and adds it to the context list', s: 15, sm: true, f: 'F106' })}
<button type="button" class="sp-model isnew" data-does="Opens the model source picker: Hosted, BYOK, Local agent (deferred); provider, model, limits, billing source" data-feature="F107">${NT}<span class="src">${S.MODEL.source}</span>${S.MODEL.name}${ic('chev', 12)}</button>
<span class="sp-est" title="Estimated cost range for this run">${S.MODEL.est}</span>
<button type="button" class="sp-send" aria-label="Send" data-does="Sends the message with exactly the listed context; a paid run reserves its maximum first" data-feature="F114">${ic('up', 15, 2)}</button>
</div></div>`;
// run: optional live run row [label, step text, counters]; jump: show the jump-to-latest button
export const chatPanel = ({ title, sub, ctxItems, ctxFoot, msgs, ph, run, jump }) => `<aside class="sp-chat" aria-label="Conversation">
<button type="button" class="sp-rsz" aria-label="Resize chat; arrow keys move 16 px" data-does="Drag to resize the chat column (300 to 520 px); the width is remembered per project" data-feature="F114"></button>
<div class="sp-chat-h"><b>${title}</b><span>· ${sub}</span><span class="sp-fill"></span>${ib('history', 'Chat history', { does: 'Lists earlier chats of this stage', sm: true, f: 'F114' })}${ib('plus', 'New chat', { does: 'Starts a new chat in this stage; the context list is kept', sm: true, f: 'F114' })}${ib('panel', 'Collapse chat', { does: 'Collapses the chat panel; the board keeps its viewport', sm: true, f: 'F114' })}</div>
${ctx(ctxItems, ctxFoot)}
<div class="sp-msgs">${msgs}</div>
${jump ? `<button type="button" class="sp-jump" data-does="Scrolls to the newest message and keeps following the stream" data-feature="F114">${ic('down', 12)}Jump to latest</button>` : ''}
${run ? `<div class="sp-run isnew" role="status" data-feature="F109">${NT}<span class="pulse" aria-hidden="true"></span><span class="t"><b>${run[0]}</b><span>${run[1]}</span></span><span class="c">${run[2]}</span>${ib('list', 'Show steps', { does: 'Expands the run steps: each tool call, file and check, live', sm: true, f: 'F109' })}${ib('stop', 'Stop run', { does: 'Stops this run at its next step; charges settle to what was used', sm: true, f: 'F109' })}</div>` : ''}
${composer(ph)}
</aside>`;

// main panel pieces
export const tabs = (list, right) => `<div class="sp-tabs isnew" role="tablist" aria-label="Open artifacts" data-feature="F104">${NT}${list.map(([icon, name, sel, dirty]) => `<button type="button" role="tab" class="sp-tab" aria-selected="${sel ? 'true' : 'false'}" data-does="Shows ${name} in the work area; tabs are artifacts, not stages" data-feature="F104">${ic(icon, 14)}${name}${dirty ? '<span class="dot acc" title="Unsaved draft"></span>' : ''}<span class="x">${ic('x', 11)}</span></button>`).join('')}
${ib('plus', 'Open an artifact', { does: 'Opens another artifact of this project in a new tab', sm: true, f: 'F104' })}<span class="sp-fill"></span>${right}</div>`;
export const views = (cur) => `<div class="sp-seg isnew" role="group" aria-label="View" data-feature="F105">${NT}${[['Canvas', 'grid'], ['Preview', 'eye'], ['Document', 'doc'], ['Compare', 'cols']].map(([v, i]) => `<button type="button" aria-pressed="${v === cur ? 'true' : 'false'}" data-does="Shows the selected artifact as ${v}" data-feature="F105">${ic(i, 14)}${v}</button>`).join('')}</div>`;
export const insp = ({ title, pillv, sub, tabsv, body }) => `<aside class="sp-insp isnew" aria-label="Inspector" data-feature="F108">${NT}
<div class="sp-ih"><div class="a"><b>${title}</b>${pill(pillv)}<span class="sp-fill"></span>${ib('more', 'More', { does: 'Opens frame actions: duplicate, compare, hand off', sm: true, f: 'F108' })}</div><div class="s">${sub}</div></div>
<div class="sp-itabs" role="tablist">${tabsv.map(([t, sel]) => `<button type="button" role="tab" aria-selected="${sel ? 'true' : 'false'}" data-does="Shows the ${t} of the selection" data-feature="F108">${t}</button>`).join('')}</div>
<div class="sp-ib">${body}</div></aside>`;
export const row = (id, name, sub, p) => `<div class="sp-row"><span class="id">${id}</span><span class="nm">${name}<small>${sub}</small></span>${pill(p)}</div>`;

// a tiny cost-variance dashboard drawn inside frames (from the sample file)
export function mini({ title = 'Variance', kpi = true, chart = false, table = true, rows = 4, drawer = false, h }) {
  const kp = kpi ? `<div class="kp">${S.KPIS.map(([l, v, c]) => `<div><span>${l}</span><b${c ? ` class="${c}"` : ''}>${v}</b></div>`).join('')}</div>` : '';
  const ch = chart ? `<div class="ch">${[38, 52, 46, 60, 72, 58, 80, 66, 90, 74, 62, 84].map((v, i) => `<u style="height:${v}%"${i === 8 ? ' class="hi"' : ''}></u>`).join('')}</div>` : '';
  const tb = table ? `<div class="tb"><div><span>Package</span><span>Budget</span><span>Forecast</span><span>Var.</span></div>${S.PACKAGES.slice(0, rows).map(([n, b, f, v, s]) => `<div><span>${n}</span><em>${b}</em><em>${f}</em><span class="p ${s === 'ok' ? 'ok' : ''}">${v}</span></div>`).join('')}</div>` : '';
  const dr = drawer ? `<div class="dr"><b class="h">Alerts · 2</b><div class="it"><b>P-03 Hook-up</b><span>+6.4% · 2 periods</span></div><div class="it"><b>P-01 Jacket</b><span>+5.6% · 3 periods</span></div></div>` : '';
  return `<div class="mini" style="height:${h}px;position:relative"><div class="mt"><i></i>${title}<span>USD m · sample</span></div><div class="mb">${kp}${ch}${tb}</div>${dr}</div>`;
}

// ---------------------------------------------------------------- page, aside, header, refs, board writer
const a11y = (s) => s;
export const page = (title, body, logic, w, h) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="${blobs['spekin.css'] ? '/_blob/' + blobs['spekin.css'] : 'spekin.css'}">
</head>
<body>
<x-dc>
<helmet>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<style>body{margin:0}</style>
</helmet>
${a11y(body)}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
${logic}
}
</script>
</body>
</html>
`;
export const STAT = { built: 'Built', partial: 'Partial', new: 'New' };
// stories: [id, status, text, src, exists, missing]
export const aside = ({ must, motion, stories, where }, views, shared = []) => `<div class="aside">
<div class="card"><span class="lbl">What it must show</span><ul class="must">${must.map((x) => `<li>${x}</li>`).join('')}</ul></div>
<div class="card"><span class="lbl">Motion</span><div class="motion">${motion.map(([a, b]) => `<div class="m"><span>${a}</span><span>${b}</span></div>`).join('')}</div></div>
<div class="card"><span class="lbl">Stories</span><div class="stories">${stories.map(([id, st, tx, src, ex, miss]) => `<div class="sto"><div class="sti"><span class="sid">${id}</span><span class="src">${src || 'PRD'}</span><span class="stat ${st}">${STAT[st]}</span></div><span class="stt">${tx}</span>${st === 'partial' ? `<span class="gap"><b>Exists:</b> ${ex} · <b>Missing:</b> ${miss}</span>` : ''}</div>`).join('')}${shared.length ? `<div class="sto shared"><div class="sti"><span class="stt">Shared shell controls on this board, specified on <a href="S35-project-shell.dc.html">S35</a>:</span></div><div class="shf">${shared.map((id) => `<span class="shc"><span class="sid">${id}</span><span class="stat new">New</span></span>`).join('')}</div></div>` : ''}</div></div>
<div class="card"><span class="lbl">Where it lives</span><div class="where">${where}</div></div>
<div class="card"><span class="lbl">States</span><ul class="states">${views.map((v) => `<li class="state" data-state="${v.id}"><b>${v.label}</b> · <b>Entry:</b> ${v.entry} · <b>Data:</b> ${v.data}</li>`).join('')}</ul></div>
</div>`;
export const header = (code, tier, name, ext, lives, views) => `<div class="hd"><div class="hdt"><span class="ey"><span class="tier">${tier}</span>${code} · ${tier} · SPEKIN</span><h1 class="ttl">${name}</h1><p class="ext"><b>Extends:</b> ${ext}</p><p class="ext"><b>Lives in:</b> ${lives}</p></div>${views.length < 2 ? '' : `<div class="vw vs" role="group" aria-label="States">${views.map((v) => `<button type="button" data-state="${v.id}" aria-pressed="{{is_${v.id}}}" onClick="{{go_${v.id}}}">${v.label}</button>`).join('')}</div>`}</div>`;
export const logicOf = (views, start) => `state = { v: '${start}' };
renderVals() {
const v = this.state.v;
return { ${views.map((x) => `is_${x.id}: v === '${x.id}', go_${x.id}: () => this.setState({ v: '${x.id}' })`).join(', ')} };
}`;
const swaps = (views) => views.map((v) => `<sc-if value="{{is_${v.id}}}" hint-placeholder-val="{{ ${v.first ? 'true' : 'false'} }}"><div class="spwin">${v.html}</div></sc-if>`).join('\n');
const refsStrip = (r) => (!r ? '' : `<div class="refs"><div class="rh"><b>Reference: the original UI</b><span>${r.note}</span></div><div class="rg">${r.shots.map((s) => `<figure><img src="${img(s.img)}" alt="${s.alt || s.cap.replace(/<[^>]+>/g, '')}"><figcaption>${s.cap}</figcaption></figure>`).join('')}</div></div>`);

export const STORIES = [];
export const BOARDS = [];
export function board(R, writeFileSync, heights, { file, code, tier = 'CORE', name, ext, lives, views, side, refs, start }) {
  const s = start || views[0].id;
  views.forEach((v) => { v.first = v.id === s; });
  side.stories.forEach(([id, st, tx, src, ex, miss]) => STORIES.push({ id, st, t: tx, src, ex, miss, code, file: file + '.dc.html' }));
  const h = heights[file] || 1500;
  const body = `<div class="board" data-screen="${code}">${header(code, tier, name, ext, lives, views)}<div class="rw"><div class="win">
${swaps(views)}
</div>${aside(side, views, code === 'S35' ? [] : [...new Set([...views.map((v) => v.html).join('').matchAll(/data-feature="(F1(?:0[1-9]|1[0-6]))"/g)].map((m) => m[1]))].filter((id) => !side.stories.some((x) => x[0] === id)).sort())}</div>${refsStrip(refs)}</div>`;
  writeFileSync(`${R}/${file}.dc.html`, page(`${code} ${name}`, body, logicOf(views, s), W, h));
  BOARDS.push({ file: file + '.dc.html', title: `${code} · ${name}`, code, tier, name, h });
}
