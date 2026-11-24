// Gap group C: S15 Ticket board, S16 Ticket detail and criteria, S21 Canvas step and sandboxed preview.
// All three sit inside the S35 project shell. All stories are NEW: Spekin has no built ticket or canvas-approval screen yet.
// Data: sample/parts/gap-c.mjs (GAPC_*). CSS: css/gap-c.css (.gpc-*). Plan: gaps-plan.mjs (group C).
export const tier = 'Build plan: tickets, ticket detail, canvas step';
export const order = 3;

export function boards(K) {
  const { S, ic, ib, btn, pill, note, NT, app, chatPanel, tabs, mini } = K;
  const XI = {
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    unlock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  };
  const I = (n, s = 14, sw = 1.75) => (XI[n] ? `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${XI[n]}</svg>` : ic(n, s, sw));
  const off = (label, does, f, cls = 'ghost', icon = '') => `<button type="button" class="sp-btn ${cls}" aria-disabled="true" data-does="${does}" data-feature="${f}">${icon ? I(icon, 14) : ''}${label}</button>`;
  const isnew = (f, inner, cls = '', style = '') => `<div class="isnew ${cls}" data-feature="${f}"${style ? ` style="${style}"` : ''}>${NT}${inner}</div>`;
  const T = Object.fromEntries(S.GAPC_TICKETS.map((t) => [t.id, t]));
  const LOCKED = S.GAPC_LOCKED_TICKETS;

  // ================================================================ shared main-area frame
  const main = ({ tablist, right = '', bar, body, banner = '' }) => `<section class="sp-main" aria-label="Work area">
${tabs(tablist, right)}${banner}${bar}<div class="gpc-body">${body}</div></section>`;
  const seg = (items) => `<div class="gpc-seg" role="group" aria-label="View">${items.map(([l, i, on, does, f]) => `<button type="button" aria-pressed="${on ? 'true' : 'false'}" data-does="${does}" data-feature="${f}">${ic(i, 14)}${l}</button>`).join('')}</div>`;

  // ================================================================ S15 ticket board
  const stPill = (t, locked) => (locked ? pill(['bad', 'Locked']) : t.st === 'blocked' ? pill(['warn', `Waits on ${t.blockers.length}`]) : pill(['ok', 'Ready']));
  const compCell = (t, o = {}) => {
    if (!t.ui) return '<span class="gpc-comp na">No screen</span>';
    if (!t.comp) return `<button type="button" class="gpc-comp none" data-does="Opens the component picker for ${t.id}; a UI ticket needs exactly one slug or GAP id" data-feature="F473">${ic('alert', 12)}UI tanpa komponen</button>`;
    return `<button type="button" class="gpc-comp" data-does="Opens the component picker for ${t.id}; picking another replaces the current one, never adds a second" data-feature="F473">${t.comp}${ic('chev', 11)}</button>`;
  };
  const stageCell = (t) => `<div class="gpc-sts">${t.stages.map((s, i) => `<span class="gpc-stg${i === 0 ? ' cur' : ''}">${s}</span>`).join('')}<button type="button" class="gpc-stg add" aria-label="Edit stage labels of ${t.id}" data-does="Opens the stage label editor for ${t.id}; labels never change the dependency order" data-feature="F476">${ic('plus', 11)}</button></div>`;
  const trow = (t, o = {}) => {
    const locked = o.unlocked ? false : LOCKED.includes(t.id) && o.lock !== false;
    return `<div class="gpc-tr${locked ? ' locked' : ''}${o.sel ? ' sel' : ''}"><span class="id">${t.id}</span>
<span class="tt">${locked ? ic('lock', 13) : ''}<button type="button" data-does="Opens ${t.id} in S16 with its criteria, blockers and copyable prompt" data-feature="F471">${t.title}</button></span>
${compCell(t)}${stageCell(t)}${stPill(t, locked)}<span class="cr">${t.crit} AC</span></div>`;
  };
  const th = `<div class="gpc-th"><span>ID</span><span>Ticket</span><span>Component</span><span>Stages</span><span>Status</span><span style="text-align:right">AC</span></div>`;
  const laneRow = (l) => `<div class="gpc-lane"><span class="n">${l.n}</span>${l.name}<small>${l.sub}</small></div>`;
  const ladder = (o = {}) => `<div class="gpc-tbl">${th}${S.GAPC_LANES.map((l) => laneRow(l) + S.GAPC_TICKETS.filter((t) => t.lane === l.id).map((t) => trow(t, { sel: o.sel === t.id, unlocked: o.unlocked })).join('')).join('')}</div>`;
  const s15bar = (cur, extra = '') => `<div class="gpc-bar">${isnew('F471', seg([['Trust ladder', 'layers', cur === 'ladder', 'Lists tickets in the pyramid order: benchmark before, core, static gates, verification, slices, prose, evidence review, benchmark after', 'F471'], ['Task graph', 'link', cur === 'graph', 'Draws the slices as a graph with blockers, owned files and parallel eligibility', 'F474']]), '', 'display:inline-flex;position:relative')}
<span class="gpc-sub">Inc. 2 · 11 tickets · spec r14</span><span class="gpc-fill"></span>${extra}
<button type="button" class="gpc-chipf" aria-pressed="false" data-does="Filters to UI tickets that have no component; the count is the same number S21 shows" data-feature="F473">${ic('alert', 12)}UI tanpa komponen · 1</button>
<button type="button" class="gpc-chipf" aria-pressed="false" data-does="Filters to tickets locked until the canvas is approved" data-feature="F477">${ic('lock', 12)}Locked · 3</button></div>`;
  const s15tabs = [['list', 'Tickets · Inc. 2', true], ['doc', 'Plan r2'], ['req', 'Proposal 0009']];
  const s15right = isnew('F478', btn('Usulkan tiket sisa', { sm: true, cls: 'ink', does: 'Opens S08 with a proposal for the remaining tickets; tickets join this board only when you accept it there', f: 'F478' }), '', 'display:inline-flex;position:relative');
  const chat15 = (msgs, run) => chatPanel({ title: 'Planning chat', sub: 'tickets r2', ctxItems: S.GAPC_CTX, ctxFoot: '≈ 3.2k tokens · secrets by name only', ph: 'Ask about tickets, order or blockers…', run, msgs });

  const msg15 = `<div class="sp-ub">Order the tickets for Inc. 2 so cheap checks come first.</div>
<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 24 s · 14 cr</em></div><p>I proposed 11 tickets. Benchmark before is first, benchmark after is last, and the four slices sit between verification and prose.</p>
<div class="sp-gg isnew" data-feature="F471">${NT}<div class="gh"><span>Ticket order</span></div><div class="sp-gc prop"><div class="k">${ic('layers', 12)}Trust ladder<span class="tag">${pill(['acc', 'Proposal 0009'])}</span></div><div class="bd">1 benchmark, 2 core, 3 gates, 4 verification, 5 slices, 6 prose, 7 review, 8 benchmark.</div><div class="ft"><span class="s">Accepted on S08 only</span>${btn('Review', { sm: true, cls: 'ink', does: 'Opens S08 with the ticket proposal', f: 'F478' })}</div></div></div></div>`;

  const N15 = {
    ord: note('<b>Click a lane header</b> to fold it. The numbered lanes are fixed: cheapest and strongest check first, a human last (R-KEEP-1).', 'left:372px;top:812px;max-width:300px'),
    bench: note('<b>Benchmark before</b> is always the first row and <b>benchmark after</b> the last. Dragging either one is refused (R-KEEP-2).', 'left:690px;top:812px;max-width:300px'),
    lock: note('<b>Lock icon</b>: the ticket changes a screen and the canvas is not approved yet. Planning and test tickets stay editable (R-KEEP-6).', 'left:1008px;top:812px;max-width:300px'),
    pick: note('<b>Click the red chip</b> on a UI ticket: pick exactly one slug or GAP id. A second one replaces the first (R-DS-3).', 'left:372px;top:812px;max-width:300px'),
    pick2: note('<b>The count</b> in the filter chip is the same number S21 shows as “UI tanpa komponen”. Both read the ticket list.', 'left:690px;top:812px;max-width:300px'),
    graph: note('<b>Click “Task graph”</b>: the same tickets as slices. Arrows are blockers; the red dashed link is a shared owned file.', 'left:372px;top:812px;max-width:300px'),
    graph2: note('<b>Nothing here runs anything.</b> A graph never authorises resets, merges, cleanup, issue publication, code execution or deployment (R-STD-4).', 'left:690px;top:812px;max-width:330px'),
    lab: note('<b>Click “+” on the Stages cell</b>: add or remove labels. The first label is the stage the work starts in; blockers still decide the order (R-WF-7).', 'left:372px;top:812px;max-width:330px'),
    lab2: note('<b>Chips are labels, not a sequence of gates.</b> Moving a chip never changes T-05’s blockers or its place in the ladder.', 'left:720px;top:812px;max-width:300px'),
    lk: note('<b>Hover or focus a locked row</b>: it says why and links to S21. No override button exists here; only approval on S21 unlocks.', 'left:372px;top:812px;max-width:300px'),
    lk2: note('<b>Tests, benchmarks and prose</b> are still editable while the canvas waits. Only frontend implementation is held.', 'left:690px;top:812px;max-width:300px'),
    emp: note('<b>Click “Propose tickets”</b>: starts the same increment Proposal as S07, reviewed and accepted on S08. Nothing appears here before acceptance.', 'left:372px;top:700px;max-width:330px'),
    emp2: note('<b>Why empty</b>: the Detailed layer (spec r14) is accepted, but no ticket proposal has been accepted for Inc. 2.', 'left:720px;top:700px;max-width:300px'),
  };

  const compPop = `<div class="gpc-pop isnew" data-feature="F473" style="left:519px;top:430px;width:330px">${NT}<h5>Primary component for T-08</h5><p>Exactly one. A GAP id means the register has no slug yet; S14 owns the GAP list.</p>
${S.GAPC_COMPONENTS.map(([slug, d, src], i) => `<button type="button" class="gpc-opt${i === 3 ? ' on' : ''}" data-does="Sets ${slug} as the only primary component of T-08" data-feature="F473"><span class="gpc-radio"></span><span><code>${slug}</code><small>${d}</small></span>${pill(['mute', src])}</button>`).join('')}
<div class="ft">${btn('Cancel', { sm: true, cls: 'plain', does: 'Closes the picker without a change', f: 'F473' })}${btn('Set component', { sm: true, cls: 'ink', does: 'Saves one component for T-08 as a draft edit; the UI tanpa komponen count drops by one', f: 'F473' })}</div></div>`;
  const stagePop = `<div class="gpc-pop isnew" data-feature="F476" style="left:535px;top:340px;width:340px">${NT}<h5>Stage labels for T-05</h5><p>A vertical slice can pass through several stages. Labels do not replace blockers.</p>
<div class="gpc-stl">${['Design', 'Frontend', 'Testing'].map((s, i) => `<div class="r"><span class="o">${i + 1}</span><span>${s}</span>${ib('x', `Remove ${s} label`, { sm: true, does: `Removes the ${s} label from T-05`, f: 'F476' })}</div>`).join('')}</div>
<div class="gpc-sts">${['Backend', 'Integration', 'Deployment'].map((s) => `<button type="button" class="gpc-stg" data-does="Adds the ${s} label to T-05" data-feature="F476">+ ${s}</button>`).join('')}</div>
<p><b>Blockers stay:</b> T-04, then canvas approval.</p>
<div class="ft">${btn('Cancel', { sm: true, cls: 'plain', does: 'Closes the editor without a change', f: 'F476' })}${btn('Save labels', { sm: true, cls: 'ink', does: 'Saves the label list as a draft edit; it is not a proposal and changes no dependency', f: 'F476' })}</div></div>`;
  const lockTip = `<div class="gpc-pop isnew" data-feature="F477" style="left:111px;top:340px;width:372px">${NT}<h5>${ic('lock', 13)} T-05 is locked</h5><p>This ticket changes a user-app screen and the canvas is not approved. Planning, test and benchmark tickets stay editable.</p>
<div class="gpc-sts"><span class="gpc-stg">T-05</span><span class="gpc-stg">T-06</span><span class="gpc-stg">T-08</span></div>
<div class="ft">${btn('Open canvas step (S21)', { sm: true, cls: 'ink', does: 'Opens S21 where Setujui kanvas is the only way to unlock frontend tickets', f: 'F477' })}</div></div>`;
  const lockBanner = `<div class="sp-banner warn isnew" role="status" data-feature="F477">${NT}${ic('lock', 16)}<p><b>Canvas not approved.</b> 3 frontend tickets are locked (T-05, T-06, T-08). Approve the canvas on S21 to release them.</p>${btn('Open S21', { sm: true, cls: 'ink', does: 'Opens S21 canvas step for Inc. 2', f: 'F477' })}</div>`;

  // task graph
  const nd = (id, x, y, cls, tag, extra = '') => {
    const t = T[id];
    return `<div class="gpc-nd ${cls}" style="left:${x}px;top:${y}px"><div class="h">${id}<span class="gpc-fill"></span>${tag}</div><b>${t.title.replace(/^Slice: |^Prefactor: |^Verification: /, '').replace(/^./, (c) => c.toUpperCase())}</b><span class="o">owns ${t.owns}</span>${extra}</div>`;
  };
  const edge = (d, cls = '') => `<path d="${d}" fill="none" stroke="${cls || 'var(--ink-dim)'}" stroke-width="1.5" marker-end="url(#gpc-ar)"${cls ? '' : ''}/>`;
  const graph = `<div class="gpc-graph">
<svg class="gpc-edges" aria-hidden="true"><defs><marker id="gpc-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--ink-dim)"/></marker></defs>
${edge('M137 130 L137 164')}${edge('M250 207 C275 207 275 87 300 87')}${edge('M250 207 L300 207')}${edge('M250 87 C275 87 275 327 300 327')}${edge('M526 87 L576 87')}${edge('M802 87 C827 87 827 207 852 207')}${edge('M526 207 L852 207')}${edge('M526 327 C700 327 800 207 852 207')}
<path d="M413 130 L413 164" stroke="var(--danger)" stroke-width="2" stroke-dasharray="4 3" fill="none"/></svg>
<span class="gpc-gl" style="left:24px;top:16px">Core</span><span class="gpc-gl" style="left:300px;top:16px">Slices</span><span class="gpc-gl" style="left:852px;top:136px">Review</span>
${nd('T-02', 24, 44, 'ok', pill(['ok', 'Ready']))}
${nd('T-04', 24, 164, 'ok', pill(['ok', 'Parallel-eligible']))}
${nd('T-05', 300, 44, 'bad', pill(['bad', 'Conflict']))}
${nd('T-06', 300, 164, 'bad', pill(['bad', 'Conflict']))}
${nd('T-07', 300, 284, 'ok', pill(['ok', 'Parallel-eligible']))}
${nd('T-08', 576, 44, 'lock', pill(['warn', 'Blocked by T-05']))}
${nd('T-10', 852, 164, 'lock', pill(['warn', 'Waits on 4']))}
<div class="gpc-pop isnew" data-feature="F474" style="left:24px;top:410px;width:420px">${NT}<h5>Graph check</h5><div class="gpc-ul"><li>${ic('alert', 14)}<span>T-05 and T-06 both own <code>src/variance/state.ts</code></span>${pill(['bad', 'Conflict'])}</li><li>${ic('check', 14)}<span>No cycle in 11 tickets</span>${pill(['ok', 'Pass'])}</li><li>${ic('check', 14)}<span>Every blocker names an existing ticket</span>${pill(['ok', 'Pass'])}</li></div></div>
<div class="gpc-pop isnew" data-feature="F475" style="left:470px;top:410px;width:572px">${NT}<h5>T-07 touches the alerts table: expand, migrate, contract</h5><p>A wide migration is split so every step can be verified and rolled back on its own, or it names a reviewed integration sequence.</p>
<div class="gpc-emc"><span class="s"><i>1</i>Expand: add <code>acknowledged_at</code></span><span class="s"><i>2</i>Migrate: backfill rows</span><span class="s"><i>3</i>Contract: drop old flag</span></div>
<div class="gpc-emc">${btn('Use a reviewed sequence instead', { sm: true, does: 'Replaces the three steps with one integration sequence that you review on S08', f: 'F475' })}${pill(['mute', 'Parallel budget 2 · 2 of 2 slots ready'])}</div></div>
<div class="gpc-leg" style="left:576px;top:16px"><span><i style="width:18px;border-top:2px solid var(--ink-dim);display:inline-block"></i>blocker</span><span><i style="width:18px;border-top:2px dashed var(--danger);display:inline-block"></i>shared owned file</span><span>${ic('check', 12)}green edge: parallel-eligible</span></div></div>`;

  const emptyBody = `<div class="gpc-empty"><div class="c">${isnew('F479', `<h3>No tickets for Inc. 2 yet</h3>`, '', 'position:relative;display:inline-block')}
<p>Spec r14 is accepted and the Detailed layer is done. Spekin can propose a ticket plan in trust-ladder order. You review it on S08; only an accepted proposal adds tickets here.</p>
<div class="gpc-ghostrow"><div>${ic('layers', 13)}1 Benchmark before · first</div><div>${ic('layers', 13)}2 to 7 Core, gates, verification, slices, prose, review</div><div>${ic('layers', 13)}8 Benchmark after · last</div></div>
<div class="gpc-act">${btn('Propose tickets', { cls: 'ink', does: 'Starts the same increment Proposal as S07 with a ticket plan in trust-ladder order; nothing is added until you accept it on S08', f: 'F479' })}${btn('Write tickets by hand', { does: 'Adds one empty ticket to a draft; the ladder order and the first and last benchmark rows are kept', f: 'F479' })}</div></div></div>`;

  const v15 = (cur, body, extra) => app({ stage: 'planning', save: ['ok', 'Saved 12:41'], chat: chat15(msg15), main: main({ tablist: s15tabs, right: s15right, bar: s15bar(cur), body, banner: extra && extra.banner ? extra.banner : '' }) });
  const s15views = [
    { id: 'ladder', label: 'Pyramid order', html: v15('ladder', ladder()) + N15.ord + N15.bench + N15.lock, entry: 'Projects > Meranti Yard > Planning > Tickets tab.', data: 'sample/parts/gap-c.mjs → GAPC_LANES, GAPC_TICKETS.' },
    { id: 'comp', label: 'One component per ticket', html: v15('ladder', ladder({ sel: 'T-08' }) + compPop) + N15.pick + N15.pick2, entry: 'Tickets tab: click the red “UI tanpa komponen” chip on T-08.', data: 'sample/parts/gap-c.mjs → GAPC_TICKETS, GAPC_COMPONENTS.' },
    { id: 'graph', label: 'Slices and blockers', html: v15('graph', graph) + N15.graph + N15.graph2, entry: 'Tickets tab: click Task graph in the view switch.', data: 'sample/parts/gap-c.mjs → GAPC_TICKETS (blockers, owns).' },
    { id: 'stages', label: 'Stage labels', html: v15('ladder', ladder({ sel: 'T-05' }) + stagePop) + N15.lab + N15.lab2, entry: 'Tickets tab: click + in the Stages cell of T-05.', data: 'sample/parts/gap-c.mjs → GAPC_TICKETS (stages).' },
    { id: 'locked', label: 'Frontend locked', html: v15('ladder', ladder({ sel: 'T-05' }) + lockTip, { banner: lockBanner }) + N15.lk + N15.lk2, entry: 'Tickets tab, canvas not approved: hover or focus T-05.', data: 'sample/parts/gap-c.mjs → GAPC_LOCKED_TICKETS.' },
    { id: 'empty', label: 'No tickets yet', html: v15('ladder', emptyBody) + N15.emp + N15.emp2, entry: 'Planning > Tickets tab, before any ticket proposal is accepted.', data: 'sample/parts/gap-c.mjs → GAPC_LANES.' },
  ];

  // ================================================================ S16 ticket detail
  const A = S.GAPC_T05;
  const T8 = { ...A, id: 'T-08', title: 'Drill down from package to cost lines', lane: 'Vertical slice', summary: 'A click on a package row opens its cost lines in place, with the same flag rules as the variance table.', comp: null,
    blockers: [['T-05', 'Variance table flags', 'warn', 'Waits'], ['S21', 'Canvas approved', 'warn', 'Waiting']], owns: 'src/drill', criteria: [A.criteria[3], ['AC-DASH-015.2', 'A package with no cost lines shows an empty row, not an error.', 'R-DASH-015', ['mute', 'Not started']]], stagesL: ['Design', 'Frontend'] };
  const crit = (c) => `<div class="gpc-ac"><code>${c[0]}</code><span>${c[1]}<small>${c[2]}</small></span>${pill(c[3])}</div>`;
  const detailLeft = (X, o = {}) => `<div class="gpc-doc">
<div class="gpc-meta">${pill(['mute', X.lane])}${o.unlocked ? pill(['ok', 'Unlocked · canvas approved']) : pill(['bad', 'Locked · canvas not approved'])}<span>Spec r14 · ticket ${X.rev}</span><span>Stages:</span>${(X.stagesL || ['Design', 'Frontend', 'Testing']).map((s, i) => `<span class="gpc-stg${i === 0 ? ' cur' : ''}">${s}</span>`).join('')}</div>
<h2>${X.id} · ${X.title}</h2><p>${X.summary}</p>
<h3>Blockers and owned files</h3>
<div class="gpc-blk">${X.blockers.map(([i, n, k, t]) => `<span><code>${i}</code>${n}${pill([k, o.unlocked && i === 'S21' ? 'Approved' : t])}</span>`).join('')}<span><code>owns</code>${X.owns}</span></div>
<h3>Primary component</h3>
${X.comp ? isnew('F483', `<div class="gpc-cc"><span class="th">${ic('grid', 18)}</span><span class="tx"><code>${X.comp.slug}</code><small>Install: ${X.comp.install} · v${X.comp.ver}</small></span><span class="gpc-fill"></span>${btn('Change', { sm: true, does: 'Opens the component picker; one component only, picking another replaces this one', f: 'F483' })}</div>`) : isnew('F488', `<div class="gpc-cc bad"><span class="th">${ic('alert', 18)}</span><span class="tx"><b>UI tanpa komponen</b><small>A UI ticket needs exactly one yravg UI slug or GAP id.</small></span><span class="gpc-fill"></span>${btn('Pick component', { sm: true, cls: 'ink', does: 'Opens the component picker for this ticket', f: 'F488' })}</div>`)}
<h3>Acceptance criteria<span class="pill mute">${X.criteria.length} linked</span><span class="gpc-fill"></span>${btn('Evidence in S18', { sm: true, does: 'Opens S18 evidence for this ticket’s criteria; this ticket never marks a requirement verified', f: 'F489' })}</h3>
${isnew('F482', `<div class="gpc-acs">${X.criteria.map(crit).join('')}</div>`, '', 'position:relative')}
</div>`;
  const prSec = (h, lines, mk = false) => `<span class="sec">${h}</span>${lines.map((l) => `<span${mk ? ' class="mark"' : ''}>${l}</span>`).join('')}`;
  const promptBlock = (X, o = {}) => `<div class="gpc-pr${o.off ? ' off' : ''}">
${prSec('Task', [`${X.id} · ${X.title}`, 'Spec r14 · R-DASH-014, R-DASH-015'])}
${X.comp ? prSec('Component', [`slug: ${X.comp.slug}`, `install: ${X.comp.install}`], o.mark) : prSec('Component', ['<i>missing: pick one slug or GAP id</i>'])}
${X.comp ? prSec(`DESIGN.md ${o.rev || 'r3'} rules`, o.stale ? ['1 Tokens only, no raw colours.', '2 Flag: danger colour plus icon and %.', '3 Text 12 px or larger, <b>row 40 px</b>.'] : A.rules.map((r, i) => `${i + 1} ${r}`), o.mark) : prSec('DESIGN.md rules', ['<i>not added: no component</i>'])}
${prSec('Criteria', X.criteria.map((c) => `${c[0]} ${c[1].slice(0, 48)}${c[1].length > 48 ? '…' : ''}`))}
${prSec('Scope', [`own: ${X.owns}`, 'no resets, merges or deploys'])}</div>`;
  const incList = (X, o = {}) => {
    const ok = !!X.comp;
    return `<div class="gpc-inc${ok ? '' : ' miss'}">${[['Component slug', ok ? X.comp.slug : 'missing'], ['Install line', ok ? 'npx yravg-ui add …' : 'missing'], [`DESIGN.md rules (${o.rev || 'r3'})`, ok ? '3 rules' : 'missing'], ['Linked criteria', `${X.criteria.length}`]].map(([a, b], i) => `<div>${ic(!ok && i < 3 ? 'x' : 'check', 14)}<span>${a}</span><span>${pill([!ok && i < 3 ? 'bad' : 'ok', b])}</span></div>`).join('')}</div>`;
  };
  const rt = (X, o = {}) => `<aside class="gpc-rt" aria-label="Ticket prompt"><div class="gpc-h">${ic('spark', 15)}<b>Ticket prompt</b>${pill(o.stale ? ['warn', 'Stale · DESIGN.md r4'] : X.comp ? ['ok', 'Fresh · r2'] : ['bad', 'Incomplete'])}<span class="gpc-fill"></span>${ib('refresh', 'Rebuild prompt', { does: 'Rebuilds the prompt from the ticket, component and DESIGN.md as they are now', sm: true, f: 'F487' })}</div>
<div class="gpc-c">${isnew('F485', promptBlock(X, o), '', 'position:relative')}${isnew('F484', incList(X, o), '', 'position:relative')}
${o.tail || ''}
<div class="gpc-act">${o.copyBtn || btn('Copy prompt', { cls: 'ink', icon: 'doc', does: 'Copies the whole prompt: component slug, install line and the DESIGN.md rules that apply, plus criteria and scope', f: 'F484' })}${btn('Agent pull link', { does: 'Shows the pull address an agent uses; it returns exactly this prompt, never a shorter one', f: 'F486' })}</div></div></aside>`;
  const s16bar = (X) => `<div class="gpc-bar">${btn('All tickets', { sm: true, cls: 'plain', icon: 'chevR', does: 'Returns to S15 Ticket board', f: 'F481' })}<span class="gpc-sub">Tickets / ${X.id}</span><span class="gpc-fill"></span>${btn('Mark ready for agent', { sm: true, does: 'Marks the ticket ready; an agent still cannot start while a blocker or the canvas lock holds', f: 'F481' })}${ib('history', 'Ticket revisions', { sm: true, does: 'Opens the revision list of this ticket', f: 'F481' })}</div>`;
  const msg16 = `<div class="sp-ub">Make sure the prompt for ${'T-05'} carries the component and DESIGN.md.</div>
<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 12 s · 6 cr</em></div><p>The prompt names <code>blocks/data-table</code>, its install line and 3 DESIGN.md r3 rules. Criteria AC-DASH-014.3 still has no test.</p></div>`;
  const chat16 = (m = msg16) => chatPanel({ title: 'Ticket chat', sub: 'T-05', ctxItems: S.GAPC_CTX_S16, ctxFoot: '≈ 2.8k tokens · secrets by name only', ph: 'Ask about this ticket…', msgs: m });
  const s16tabs = [['doc', 'T-05 Variance table flags', true], ['list', 'Ticket board'], ['doc', 'DESIGN.md r3']];
  const v16 = (X, o = {}) => app({ stage: 'planning', save: ['ok', 'Saved 12:41'], chat: chat16(o.msg), main: main({ tablist: s16tabs, bar: s16bar(X), body: `<div class="gpc-t16">${detailLeft(X, o)}${rt(X, o)}</div>`, banner: o.banner || '' }) });
  const toast = (txt, style) => `<div class="gpc-toast isnew" role="status" data-feature="F484" style="${style}">${NT}${ic('check', 14)}${txt}</div>`;
  const pullLog = `<div class="sp-gg isnew" data-feature="F486" style="position:relative">${NT}<div class="gpc-q" style="border-left-color:var(--ok)"><div class="k">${ic('download', 12)}Pulled by an agent</div><div class="gpc-log"><div><b>12:51</b><span>yravgbuilder pulled T-05 prompt r2</span></div><div><b>sha</b><span>a41c07e9 · same as Copy prompt</span></div><div><b>sent</b><span>slug, install line, 3 DESIGN.md r3 rules</span></div></div></div></div>`;
  const staleBanner = `<div class="sp-banner warn isnew" role="status" data-feature="F487">${NT}${ic('alert', 16)}<p><b>DESIGN.md changed.</b> r4 was accepted at 12:49; rule 3 now says row height 40 px. This prompt still carries r3.</p>${btn('Show the change', { sm: true, does: 'Opens S14 DESIGN.md with the r3 to r4 diff', f: 'F487' })}${btn('Rebuild prompt', { sm: true, cls: 'ink', does: 'Rebuilds the prompt from DESIGN.md r4; the r3 prompt is kept in the ticket history', f: 'F487' })}</div>`;
  const N16 = {
    d1: note('<b>Open a ticket</b> from S15: this page is the one place a person copies the prompt or an agent pulls it. The prompt is built, not typed.', 'left:372px;top:818px;max-width:350px'),
    d2: note('<b>Criteria are links</b>, not text copies: each AC points to its requirement and its test. A ticket cannot mark a requirement verified.', 'left:740px;top:818px;max-width:380px'),
    c1: note('<b>Click “Copy prompt”</b>: you get the full block. The slug, install line and DESIGN.md rules are always inside, never a shortened version (R-DS-6).', 'left:372px;top:818px;max-width:350px'),
    c2: note('<b>Highlighted lines</b> are the three parts R-DS-6 requires. The toast names them so a copy never silently drops one.', 'left:740px;top:818px;max-width:380px'),
    p1: note('<b>An agent pulls the ticket</b> by its address after the canvas is approved. A locked or blocked ticket answers “not ready”, not a half prompt.', 'left:372px;top:818px;max-width:350px'),
    p2: note('<b>Same text, same hash</b>: the log shows the pulled prompt equals the copied one, section by section.', 'left:740px;top:818px;max-width:380px'),
    n1: note('<b>Click “Pick component”</b>: the prompt is incomplete without one slug or GAP id, so Copy is disabled and says why (R-DS-3).', 'left:372px;top:818px;max-width:350px'),
    n2: note('<b>DESIGN.md rules are tied to the component</b>: with no component there is nothing to select rules for, so that section is empty.', 'left:740px;top:818px;max-width:380px'),
    s1: note('<b>DESIGN.md r4 accepted</b>: every prompt built from r3 turns stale. Rebuild shows the change before it replaces the text.', 'left:372px;top:818px;max-width:350px'),
    s2: note('<b>Copy stays off</b> until you rebuild: a stale prompt would send the old row height to the agent.', 'left:740px;top:818px;max-width:380px'),
  };
  const s16views = [
    { id: 'detail', label: 'Ticket and prompt', html: v16(A) + N16.d1 + N16.d2, entry: 'S15 Tickets > click T-05.', data: 'sample/parts/gap-c.mjs → GAPC_T05.' },
    { id: 'copied', label: 'Prompt copied', html: v16(A, { mark: true, tail: '', copyBtn: btn('Copied', { cls: 'ghost', icon: 'check', does: 'Copies the prompt again; the clipboard text is the same block', f: 'F484' }) }) + toast('Copied. Included: component slug, install line, 3 DESIGN.md r3 rules.', 'left:404px;top:780px') + N16.c1 + N16.c2, entry: 'S16 T-05: click Copy prompt.', data: 'sample/parts/gap-c.mjs → GAPC_T05 (comp, rules).' },
    { id: 'pulled', label: 'Pulled by an agent', html: v16(A, { unlocked: true, tail: pullLog, msg: msg16 }) + N16.p1 + N16.p2, entry: 'After S21 approval: an agent pulls T-05 through the hand-off.', data: 'sample/parts/gap-c.mjs → GAPC_T05.' },
    { id: 'nocomp', label: 'No component yet', html: v16(T8, { off: true, copyBtn: off('Copy prompt', 'Disabled: the prompt has no component yet; pick one slug or GAP id first', 'F488', 'ghost', 'doc') }) + N16.n1 + N16.n2, entry: 'S15 Tickets > click T-08.', data: 'sample/parts/gap-c.mjs → GAPC_TICKETS (T-08), GAPC_COMPONENTS.' },
    { id: 'stale', label: 'DESIGN.md changed', html: v16(A, { stale: true, banner: staleBanner, copyBtn: off('Copy prompt', 'Disabled until the prompt is rebuilt from DESIGN.md r4', 'F487', 'ghost', 'doc') }) + N16.s1 + N16.s2, entry: 'S16 T-05 after DESIGN.md r4 is accepted on S14.', data: 'sample/parts/gap-c.mjs → GAPC_T05 (designRev, newRev).' },
  ];

  // ================================================================ S21 canvas step
  const wfThumb = (kind) => {
    if (kind === 'drawer') return `<div class="gpc-wf" style="position:relative;height:100%"><i class="h"></i><i></i><i class="f"></i><i></i><div class="dr"><i class="h" style="width:70%"></i><i></i><i></i><i class="f"></i></div></div>`;
    if (kind === 'lines') return `<div class="gpc-wf"><i class="h"></i><i></i><i></i><i></i><i></i></div>`;
    if (kind === 'overview') return `<div class="gpc-wf"><i class="h"></i><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px"><i style="height:24px"></i><i style="height:24px"></i><i style="height:24px"></i><i style="height:24px"></i></div><i></i><i></i></div>`;
    return `<div class="gpc-wf"><i class="h"></i><i></i><i class="f"></i><i></i><i class="f"></i></div>`;
  };
  const frameCard = (f, o = {}) => `<div class="gpc-fc${o.sel ? ' sel' : ''}"><div class="th">${wfThumb(f.kind)}</div><div class="ft"><div class="a"><code>${f.id}</code><b>${f.title}</b><span class="gpc-fill"></span>${pill(o.accepted ? ['ok', 'Accepted ' + f.rev] : f.st)}</div>
<div class="gpc-tg">${f.comps.map((c) => `<code>${c}</code>`).join('')}${f.noComp ? `<span class="none">${ic('alert', 12)}UI tanpa komponen · ${f.noComp}</span>` : ''}${!f.comps.length && !f.noComp ? '<code>none</code>' : ''}</div>
<div class="gpc-tg"><button type="button" class="gpc-chipf" data-does="Opens ${f.id} in frame detail with its pinned comments" data-feature="F491">${ic('comment', 12)}${f.comments} pinned</button><button type="button" class="gpc-chipf" data-does="Runs ${f.id} in the sandboxed preview, with no network and no parent cookies" data-feature="F493">${ic('eye', 12)}Preview</button></div></div></div>`;
  const noCompTotal = S.GAPC_FRAMES.reduce((a, f) => a + f.noComp, 0);
  const s21bar = (cur, o = {}) => `<div class="gpc-bar">${isnew('F491', seg([['Frames', 'grid', cur === 'grid', 'Shows every user-app frame in a grid with screen id, title, component tags and the UI tanpa komponen count', 'F491'], ['Frame detail', 'frame', cur === 'detail', 'Shows one frame large with its pinned comments', 'F492'], ['Preview', 'eye', cur === 'prev', 'Shows the frame running in the sandboxed preview', 'F493']]), '', 'display:inline-flex;position:relative')}
<span class="gpc-sum"><b>${S.GAPC_FRAMES.length} frames</b><span class="cnt${o.ok ? ' ok' : ''}">${o.ok ? ic('check', 12) + 'All unlocked' : ic('alert', 12) + 'UI tanpa komponen · ' + noCompTotal}</span></span><span class="gpc-fill"></span>
${o.ok ? btn('Kirim ke yravgbuilder', { sm: true, cls: 'ink', does: 'Sends the approved canvas to yravgbuilder as a hand-off; opens S25 export with the frames pre-selected', f: 'F498' }) : off('Kirim ke yravgbuilder', 'Disabled until the canvas is approved; hover says why', 'F498')}
${o.ok ? pill(['ok', 'Canvas approved 12:52']) : isnew('F496', btn('Setujui kanvas', { sm: true, cls: 'ink', does: 'Opens the approval dialog: it creates a Proposal, and only accepting that unlocks the frontend tickets', f: 'F496' }), '', 'display:inline-flex;position:relative')}</div>`;
  const sideApproval = (o = {}) => `<aside class="gpc-side" aria-label="Approval">
<h4>Approval</h4>
${isnew('F497', `<div class="gpc-lock${o.ok ? ' open' : ''}"><div class="t">${o.ok ? I('unlock', 15) : ic('lock', 15)}${o.ok ? 'Frontend tickets unlocked' : 'Frontend tickets locked'}</div><p>${o.ok ? 'Approved by Rina (sample) at 12:52 through Proposal 0010. Decision D-21 is logged.' : 'They unlock only when this canvas is approved through a Proposal. Planning and test tickets stay editable.'}</p><div class="lk"><code>${ic(o.ok ? 'check' : 'lock', 11)}T-05</code><code>${ic(o.ok ? 'check' : 'lock', 11)}T-06</code><code>${ic(o.ok ? 'check' : 'lock', 11)}T-08</code></div></div>`, '', 'position:relative')}
<h4>Checks</h4>
<div class="gpc-ul"><li>${ic(o.ok ? 'check' : 'alert', 14)}<span>Frames accepted</span>${pill(o.ok ? ['ok', '4 of 4'] : ['warn', '2 of 4'])}</li><li>${ic(o.ok ? 'check' : 'alert', 14)}<span>UI tanpa komponen</span>${pill(o.ok ? ['ok', 'Planned in tickets'] : ['bad', String(noCompTotal)])}</li><li>${ic('check', 14)}<span>Open pinned comments</span>${pill(['mute', '4'])}</li></div>
${isnew('F499', `<h4 style="margin-bottom:6px">Canvas tool</h4><div class="gpc-tools">${S.GAPC_TOOLS.map(([n, r, k]) => `<div><span>${n}</span>${pill([k, r])}</div>`).join('')}</div>`, '', 'position:relative;padding-top:4px')}
<p style="margin:0;font-size:12px;color:var(--ink-dim);line-height:1.45">Source location of the default tool is pending the owner (Q-11).</p></aside>`;
  const gridBody = (o = {}) => `<div class="gpc-gridw"><div class="gpc-fg">${S.GAPC_FRAMES.map((f) => frameCard(f, { accepted: o.ok, sel: o.sel === f.id })).join('')}</div>${sideApproval(o)}</div>`;

  const detailBody = () => {
    const f = S.GAPC_FRAMES[2];
    return `<div class="gpc-gridw"><div style="padding:12px;display:flex;flex-direction:column;gap:10px;min-width:0">
<div class="gpc-meta">${btn('Back to frames', { sm: true, cls: 'plain', icon: 'chevR', does: 'Returns to the frame grid', f: 'F491' })}<code>F-04</code><b style="font:600 14px/1 var(--font);color:var(--ink)">Alert drawer</b>${pill(f.st)}<span>r1 · 1440 × 900</span></div>
<div class="gpc-fc" style="flex:1;min-height:0"><div class="th" style="height:100%;padding:14px 16px;position:relative">${mini({ title: 'Alert drawer', kpi: true, table: true, rows: 4, drawer: true, h: 300 })}<span class="gpc-pin" style="left:610px;top:78px">1</span><span class="gpc-pin" style="left:300px;top:128px">2</span><span class="gpc-pin done" style="left:716px;top:28px">3</span></div></div>
<div class="gpc-tg"><code>components/side-drawer</code><span class="none">${ic('alert', 12)}UI tanpa komponen · 1</span>${btn('Add pin', { sm: true, icon: 'comment', does: 'Drops a pinned comment on the frame; comments feed the proposal, they do not change the frame', f: 'F492' })}</div></div>
<aside class="gpc-side" aria-label="Pinned comments"><h4>Pinned comments · 3</h4>${isnew('F492', `<div style="display:flex;flex-direction:column;gap:10px">${S.GAPC_PINS.map(([n, who, at, tx, st]) => `<div class="gpc-cm"><span class="pn${st === 'done' ? ' done' : ''}">${n}</span><span>${tx}<small>${who} · ${at} · ${st === 'done' ? 'Resolved' : 'Open'}</small></span></div>`).join('')}</div>`, '', 'position:relative;padding-top:4px')}
<h4>Component tags</h4><div class="gpc-ul"><li>${ic('grid', 14)}<span><code>components/side-drawer</code></span>${pill(['ok', 'Tagged'])}</li><li>${ic('alert', 14)}<span>Close button</span>${pill(['bad', 'No component'])}</li></div></aside></div>`;
  };

  const prevBody = (untrusted) => `<div class="gpc-sbx"><div class="gpc-sbl"><div class="gpc-meta">${btn('Back to frames', { sm: true, cls: 'plain', icon: 'chevR', does: 'Returns to the frame grid', f: 'F491' })}<b style="font:600 14px/1 var(--font);color:var(--ink)">${untrusted ? 'Reference REF-03 · imported skill' : 'F-03 Variance table · prototype'}</b>${pill(['ok', 'Sandboxed'])}</div>
${untrusted ? `${isnew('F495', `<div class="gpc-q"><div class="k">${ic('alert', 12)}Untrusted source text · ${S.GAPC_UNTRUSTED.src}</div><code>${S.GAPC_UNTRUSTED.text}</code></div>`, '', 'position:relative')}
<div class="gpc-ul">${S.GAPC_UNTRUSTED.outcome.map(([a, b]) => `<li>${I('ban', 14)}<span><b>${a}</b></span><span>${b}</span></li>`).join('')}</div>
<p style="margin:0;font-size:12.5px;line-height:1.5;color:var(--ink-dim);max-width:560px">Imported code and reference text are data. Spekin shows them and can quote them in a proposal, but never follows an instruction found inside them.</p>`
  : `<div class="gpc-frame" style="flex:1;min-height:0">${isnew('F493', `<div class="bar">${I('shield', 14)}sandbox · opaque origin · no network · no cookies<span class="gpc-fill"></span><span>fixture.json</span></div>`, '', 'position:relative')}<div class="pg">${mini({ title: 'Variance', kpi: true, table: true, rows: 4, h: 360 })}</div></div>
<div class="gpc-act">${btn('Reload sandbox', { sm: true, icon: 'refresh', does: 'Restarts the preview in a fresh sandbox; nothing from the last run is kept', f: 'F493' })}${btn('Fixture data only', { sm: true, does: 'Shows which fixture file feeds the preview; no live data and no project secrets', f: 'F493' })}</div>`}</div>
<aside class="gpc-side" aria-label="Sandbox policy"><h4>Sandbox policy</h4>${isnew('F494', `<div class="gpc-pol">${S.GAPC_POLICY.map(([a, b]) => `<div>${ic('check', 14)}<span><b>${a}</b><small>${b}</small></span></div>`).join('')}</div>`, '', 'position:relative;padding-top:2px')}
<h4>Blocked in this run · ${S.GAPC_BLOCKED.length}</h4><div class="gpc-bl">${S.GAPC_BLOCKED.map(([t, k, v, r]) => `<div><span>${t}</span><span>${k}</span><span>${v}</span><span>${r}</span></div>`).join('')}</div></aside></div>`;

  const approveDlg = `<div class="gpc-dim"></div><div class="gpc-dlg isnew" data-feature="F496" role="dialog" aria-label="Setujui kanvas" style="left:470px;top:230px;width:540px">${NT}<h3>Setujui kanvas for Inc. 2</h3>
<p>This creates Proposal 0010. Nothing unlocks until you accept it on S08.</p>
<div class="gpc-ul"><li>${ic('unlock', 14)}<span>Unlocks frontend tickets T-05, T-06, T-08</span>${pill(['ok', 'On accept'])}</li><li>${ic('doc', 14)}<span>Logs decision D-21 with the 4 frame revisions</span>${pill(['ok', 'On accept'])}</li><li>${ic('share', 14)}<span>Enables Kirim ke yravgbuilder</span>${pill(['ok', 'On accept'])}</li><li>${ic('alert', 14)}<span>${noCompTotal} UI parts have no component yet</span>${pill(['warn', 'Tickets need one'])}</li></div>
<div class="ft">${btn('Cancel', { cls: 'plain', does: 'Closes the dialog; the canvas stays unapproved and tickets stay locked', f: 'F496' })}${btn('Create approval proposal', { cls: 'ink', does: 'Creates Proposal 0010 for review on S08; no ticket unlocks until it is accepted', f: 'F496' })}</div></div>`;
  const msg21 = `<div class="sp-ub">Is the canvas ready to approve?</div>
<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 9 s · 4 cr</em></div><p>2 of 4 frames are accepted. F-04 and F-05 are drafts and 3 UI parts have no component. You can still approve; the tickets will ask for them.</p></div>`;
  const chat21 = chatPanel({ title: 'Canvas chat', sub: 'Inc. 2', ctxItems: S.GAPC_CTX_S21, ctxFoot: '≈ 5.4k tokens · secrets by name only', ph: 'Ask about the frames…', msgs: msg21 });
  const s21tabs = [['frame', 'Canvas step · Inc. 2', true], ['doc', 'Decision log'], ['list', 'Ticket board']];
  const v21 = (cur, body, o = {}) => app({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat21, main: main({ tablist: s21tabs, bar: s21bar(cur, o), body, banner: o.banner || '' }) });
  const okBanner = `<div class="sp-banner isnew" role="status" data-feature="F497" style="background:var(--ok-soft)">${NT}${ic('check', 16)}<p><b>Canvas approved.</b> T-05, T-06 and T-08 are unlocked. Decision D-21 was logged at 12:52.</p>${btn('Open ticket board', { sm: true, does: 'Opens S15 with the three tickets unlocked', f: 'F497' })}</div>`;
  const N21 = {
    g1: note('<b>Click a frame</b> to open it with its pinned comments. The red count is every UI part without a component, summed over frames.', 'left:372px;top:818px;max-width:350px'),
    g2: note('<b>“Kirim ke yravgbuilder” is dimmed</b> until approval. Hover or focus says why; it never sends an unapproved canvas.', 'left:740px;top:818px;max-width:380px'),
    d1: note('<b>Click “Add pin”</b> then the frame. Pins feed the next proposal and never edit the accepted frame.', 'left:372px;top:818px;max-width:350px'),
    d2: note('<b>Green pin</b>: resolved. The side list keeps who and when, so approval can cite the discussion.', 'left:740px;top:818px;max-width:380px'),
    s1: note('<b>Click “Preview”</b> on a frame: the prototype runs inside an opaque-origin sandbox with no parent cookies, secrets or other projects (R-SEC-3).', 'left:372px;top:818px;max-width:350px'),
    s2: note('<b>Blocked requests</b> are listed, never silently dropped, so a reviewer sees what the prototype tried.', 'left:750px;top:820px;max-width:290px'),
    u1: note('<b>Imported text is data</b>: a skill or reference that asks to run a shell command or print a secret is shown as a quote, never followed (AC-SPK-39).', 'left:372px;top:818px;max-width:350px'),
    u2: note('<b>Open the run log</b> to see the flagged row. Only secret names are ever sent to a model; values never are.', 'left:750px;top:820px;max-width:290px'),
    a1: note('<b>Click “Setujui kanvas”</b>: you create a Proposal. Accepting it on S08 is what unlocks the tickets and logs the decision.', 'left:372px;top:818px;max-width:350px'),
    a2: note('<b>The warning stays visible</b>: approval is allowed with open component gaps, but each becomes a ticket obligation (R-DS-3).', 'left:740px;top:818px;max-width:380px'),
    k1: note('<b>After acceptance</b> the lock card turns green and the three tickets open on S15. “Kirim ke yravgbuilder” becomes active.', 'left:372px;top:818px;max-width:350px'),
    k2: note('<b>Decision D-21</b> sits in the decision log with the 4 frame revisions it approved. A later frame change reopens the lock.', 'left:740px;top:818px;max-width:380px'),
  };
  const s21views = [
    { id: 'grid', label: 'Frame grid', html: v21('grid', gridBody()) + N21.g1 + N21.g2, entry: 'Design stage > Canvas step tab, after the Detailed layer is accepted.', data: 'sample/parts/gap-c.mjs → GAPC_FRAMES, GAPC_TOOLS.' },
    { id: 'detail', label: 'Frame detail', html: v21('detail', detailBody()) + N21.d1 + N21.d2, entry: 'Frame grid: click the F-04 card.', data: 'sample/parts/gap-c.mjs → GAPC_FRAMES, GAPC_PINS.' },
    { id: 'sandbox', label: 'Sandboxed preview', html: v21('prev', prevBody(false)) + N21.s1 + N21.s2, entry: 'Frame grid: click Preview on F-03.', data: 'sample/parts/gap-c.mjs → GAPC_POLICY, GAPC_BLOCKED.' },
    { id: 'untrusted', label: 'Untrusted source text', html: v21('prev', prevBody(true)) + N21.u1 + N21.u2, entry: 'Preview: open an imported reference that holds instructions.', data: 'sample/parts/gap-c.mjs → GAPC_UNTRUSTED, GAPC_BLOCKED.' },
    { id: 'approve', label: 'Setujui kanvas', html: v21('grid', gridBody()) + approveDlg + N21.a1 + N21.a2, entry: 'Frame grid: click Setujui kanvas.', data: 'sample/parts/gap-c.mjs → GAPC_FRAMES, GAPC_LOCKED_TICKETS.' },
    { id: 'approved', label: 'Approved and unlocked', html: v21('grid', gridBody({ ok: true }), { ok: true, banner: okBanner }) + N21.k1 + N21.k2, entry: 'S08: accept Proposal 0010; S21 reopens approved.', data: 'sample/parts/gap-c.mjs → GAPC_FRAMES, GAPC_LOCKED_TICKETS.' },
  ];

  // ================================================================ board entries
  const motionCommon = (a, b) => [['Reduce Motion', 'All swaps and fades are instant. Status changes are still announced to screen readers.'], a, b];
  const refs = (img1, c1) => ({ note: 'OpenDesign (Apache-2.0, commit e033aad) is the main reference. Onlook and Momo are pattern references only. Spekin copies no brand, copy or assets.',
    shots: [{ img: 'od-todo-progress.png', cap: c1 }, { img: img1, cap: '<b>OpenDesign canvas.</b> Bottom tool bar, frames and “Ask on select”. Spekin’s frame grid and pins follow this.' }, { img: 'onlook-canvas.png', cap: '<b>Onlook (Apache-2.0).</b> Frames on a canvas with frame chips in the chat. Spekin’s frame cards follow this.' }, { img: 'momo-explore.png', cap: '<b>Momo (pattern only, no licence).</b> A header that swaps the whole workspace; here the stage header does it.' }] });

  return [
    {
      file: 'S15-ticket-board', code: 'S15', tier: 'BUILD PLAN', name: 'Ticket board: trust-ladder order, slices and locks',
      ext: 'New. Spekin has no ticket generator or board yet. Component blocks/task-board (PRD §7.7). Inside the S35 shell, Planning stage.',
      lives: 'Spekin web app · /p/meranti-yard/planning?artifact=tickets (stage in the path, view in the query; never ticket text or keys).',
      views: s15views,
      side: {
        must: [
          'Tickets in the fixed ladder order: benchmark before, prefactor and core, static gates, verification, vertical slices, prose, evidence review, benchmark after.',
          'The first row is always the benchmark before ticket and the last row the benchmark after ticket; neither can be moved.',
          'Every UI ticket shows exactly one component, a yravg UI slug or a GAP id. A UI ticket without one is flagged in red and counted.',
          'Slices show blockers, owned files and linked criteria. A conflict (two slices owning one file), a cycle or a missing blocker is flagged.',
          'Several stage labels per ticket, shown as chips; they never change dependency order.',
          'Frontend tickets show a lock and a reason until the canvas is approved on S21; planning and test tickets stay editable.',
          'New tickets arrive only by accepting a proposal on S08; the board never adds an unaccepted ticket.',
        ],
        motion: motionCommon(['Lane fold', 'Rows collapse in 180 ms spring-ui; the header stays.'], ['Popover', 'Opens in 140 ms with a 4 px rise, spring-ui. Escape closes and returns focus to the chip.']).concat([['View switch', 'Ladder and graph cross-fade 160 ms; the selected ticket stays selected.'], ['Graph edges', 'Drawn at once; no travelling animation, since position carries the meaning.']]),
        stories: [
          ['F471', 'new', 'Tickets listed in trust-ladder order: core, static gates, verification, slices, prose, one evidence review (R-KEEP-1).', 'PRD'],
          ['F472', 'new', 'Benchmark before is always first and benchmark after always last; dragging either is refused (R-KEEP-2).', 'PRD'],
          ['F473', 'new', 'Exactly one primary component per UI ticket, slug or GAP id; red count for “UI tanpa komponen” (R-DS-3).', 'PRD'],
          ['F474', 'new', 'Task graph of narrow vertical slices with explicit blockers, linked criteria and owned files; conflict, cycle and missing-blocker checks (R-STD-4).', 'PRD'],
          ['F475', 'new', 'Wide migrations declare expand, migrate, contract or a reviewed integration sequence; parallel only for ready, nonconflicting slices within budget (R-STD-4).', 'PRD'],
          ['F476', 'new', 'Several stage labels on a vertical-slice ticket without replacing dependency order (R-WF-7).', 'PRD'],
          ['F477', 'new', 'Frontend implementation tickets locked, with the reason, until the canvas is approved; planning and test tickets stay editable (R-KEEP-6).', 'PRD'],
          ['F478', 'new', 'Usulkan tiket sisa opens S08; tickets join the board only on acceptance (R-KEEP-1).', 'PRD'],
          ['F479', 'new', 'Empty state before any accepted ticket proposal; Propose tickets starts the increment Proposal (R-KEEP-1, R-KEEP-2).', 'OpenDesign'],
        ],
        where: '<span><b>Route:</b> <code>/p/:project/planning</code>, artifact <code>tickets</code> in the query. Back and Forward restore the view and never start a paid job.</span><span><b>UI (TS/React):</b> yravg UI <code>blocks/task-board</code>; no <code>agent-plan</code> block (PRD M4). Lock reasons and chips use shell tokens.</span><span><b>Core (Rust):</b> ticket order, graph checks (cycle, conflict, missing blocker), lock state from canvas approval (R-KEEP-1, R-STD-4, R-KEEP-6). No task graph authorises resets, merges, cleanup, issue publication, code execution or deployment.</span><span><b>Open for Enrico:</b> whether approval should be blocked while a UI part has no component (drawn as allowed with a warning).</span>',
      },
      refs: refs('od-design-canvas.png', '<b>OpenDesign chat.</b> Status and todo cards inside the chat. Spekin’s ticket-order card in the chat follows this.'),
    },
    {
      file: 'S16-ticket-detail', code: 'S16', tier: 'BUILD PLAN', name: 'Ticket detail: criteria and copyable prompt',
      ext: 'New. No ticket prompt exists today; the hand-off prompt only mentions DESIGN.md r3. Components components/approval-card and components/prompt-library (PRD §7.7).',
      lives: 'Spekin web app · /p/meranti-yard/planning?artifact=ticket-T-05 (ticket id in the query; never prompt text).',
      views: s16views,
      side: {
        must: [
          'The ticket shows its lane, stage labels, blockers, owned files and lock state in one header.',
          'The primary component is shown with its slug, install line and version. A UI ticket without one shows a red card and cannot copy a prompt.',
          'Acceptance criteria are links to a requirement and a test, each with its own status; the ticket never marks a requirement verified.',
          'The prompt is built from the ticket: it always contains the component slug, its install line and the DESIGN.md rules that apply.',
          'Copy prompt and an agent pull return the same text; the pull log shows the hash and the sections sent.',
          'A DESIGN.md change makes the prompt stale, says what changed and offers a rebuild before anything is copied.',
        ],
        motion: motionCommon(['Copy confirmation', 'Toast rises 4 px and fades in 140 ms, spring-ui; it stays 4 s and pauses on hover.'], ['Rebuild', 'Prompt text cross-fades 160 ms; changed lines are marked for 1.2 s, then settle.']).concat([['Banner', 'Stale banner slides down 180 ms, spring-panel; it does not push the prompt out of view.']]),
        stories: [
          ['F481', 'new', 'Ticket header: lane, stage labels, lock state, revisions and ready marker (R-DS-6, R-WF-7).', 'OpenDesign'],
          ['F482', 'new', 'Acceptance criteria linked to requirements and tests with status (R-DS-6, R-STD-4).', 'PRD'],
          ['F483', 'new', 'Primary component card with slug, install line and version (R-DS-6, R-DS-3).', 'PRD'],
          ['F484', 'new', 'Copy prompt includes the component slug, install line and relevant DESIGN.md rules (R-DS-6).', 'PRD'],
          ['F485', 'new', 'Readable prompt preview in sections: task, component, DESIGN.md rules, criteria, scope (R-DS-6).', 'OpenDesign'],
          ['F486', 'new', 'Agent pull returns the same prompt; a log row records hash and sections (R-DS-6).', 'PRD'],
          ['F487', 'new', 'Stale prompt after a DESIGN.md change: show the diff, rebuild before copy (R-DS-6).', 'PRD'],
          ['F488', 'new', 'No component: prompt marked incomplete, Copy disabled with the reason (R-DS-6, R-DS-3).', 'PRD'],
          ['F489', 'new', 'Evidence checkpoint link to S18; the ticket cannot mark requirements verified (R-DS-6, R-STD-4).', 'PRD'],
        ],
        where: '<span><b>Route:</b> <code>/p/:project/planning</code>, ticket id in the query.</span><span><b>UI (TS/React):</b> yravg UI <code>components/approval-card</code> for the ticket and its status; <code>components/prompt-library</code> for the prompt block (PRD M4).</span><span><b>Core (Rust):</b> prompt assembly from ticket, component register and DESIGN.md rules, so the copied and pulled text are one function (R-DS-6).</span><span><b>Open for Enrico:</b> the install line format: one line per component (drawn) or one line per ticket.</span>',
      },
      refs: refs('od-studio-document.png', '<b>OpenDesign document.</b> Files from this turn and next-step suggestions under the reply. Spekin’s prompt block with its included-parts list follows this.'),
    },
    {
      file: 'S21-canvas-step', code: 'S21', tier: 'BUILD PLAN', name: 'Canvas step: approval and sandboxed preview',
      ext: 'New. No canvas step, approval or sandbox exists. GAP-29 screen canvas; distinct from the S29 frames board. Inside the S35 shell, Design stage.',
      lives: 'Spekin web app · /p/meranti-yard/design?artifact=canvas-step (frame id in the query; never comment text).',
      views: s21views,
      side: {
        must: [
          'After the Detailed layer is accepted a Canvas step lists every user-app frame: screen id, title, component tags and the “UI tanpa komponen” count.',
          'Frame detail shows the frame large with pinned comments, open or resolved, and the component tags.',
          '“Setujui kanvas” creates a Proposal; only accepting it on S08 unlocks frontend tickets and logs a decision.',
          '“Kirim ke yravgbuilder” stays disabled, with a reason, until the canvas is approved.',
          'The preview runs prototype content in a sandbox: no parent cookies or storage, no project secrets, no privileged APIs, no other projects, navigation and network limited by policy.',
          'Blocked requests are listed. Imported code and reference text are shown as data and never followed.',
          'The canvas tool source is named (canvas-to-app by default, alternatives listed) and its source location is marked pending (Q-11).',
        ],
        motion: motionCommon(['Dialog', 'Dims 140 ms and rises 8 px in 180 ms, spring-panel; focus moves to the dialog title and returns on close.'], ['Unlock', 'Lock card swaps to the open state with a 160 ms cross-fade; ticket rows on S15 update without a reload.']).concat([['Sandbox reload', 'Frame content swaps instantly behind a 120 ms fade; no spinner without a real progress value.']]),
        stories: [
          ['F491', 'new', 'Canvas step frame grid with screen id, title, component tags and the UI tanpa komponen count (R-KEEP-5).', 'PRD'],
          ['F492', 'new', 'Frame detail with pinned comments that feed the proposal, never the accepted frame (R-KEEP-5).', 'OpenDesign'],
          ['F493', 'new', 'Sandboxed prototype preview with an opaque origin and fixture data only (R-SEC-3).', 'PRD'],
          ['F494', 'new', 'Sandbox policy list and a log of blocked navigation and network requests (R-SEC-3).', 'PRD'],
          ['F495', 'new', 'Imported code and reference text treated as untrusted data; shell and secret requests are shown, not run (R-SEC-3).', 'PRD'],
          ['F496', 'new', 'Setujui kanvas creates a Proposal for review on S08 (R-KEEP-5, R-KEEP-6).', 'PRD'],
          ['F497', 'new', 'On acceptance, frontend tickets unlock and decision D-21 is logged (R-KEEP-5, R-KEEP-6).', 'PRD'],
          ['F498', 'new', 'Kirim ke yravgbuilder disabled until approval, then opens the export hand-off (R-KEEP-5).', 'PRD'],
          ['F499', 'new', 'Canvas tool source: canvas-to-app by default, alternatives listed, source location pending Q-11 (R-KEEP-5).', 'PRD'],
        ],
        where: '<span><b>Route:</b> <code>/p/:project/design</code>, artifact <code>canvas-step</code> and frame in the query.</span><span><b>UI (TS/React):</b> GAP-29 (screen canvas for S21); frame cards reuse the S29 frame thumbnail. The sandbox is an <code>iframe</code> with <code>sandbox</code> and a restrictive CSP, no <code>allow-same-origin</code>.</span><span><b>Core (Rust):</b> approval state, ticket lock, decision log, sandbox policy check (R-KEEP-5, R-KEEP-6, R-SEC-3).</span><span><b>Open for Enrico:</b> Q-11, where the canvas-to-app tool lives; Q-10, hand-off transport.</span>',
      },
      refs: refs('od-design-canvas.png', '<b>OpenDesign chat.</b> Status cards in the chat; Spekin’s approval summary in the chat follows this.'),
    },
  ];
}
