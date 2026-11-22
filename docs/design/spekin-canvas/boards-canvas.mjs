// S29 Frames canvas and S31 Alternatives. Owner: this file only. All stories are NEW: Spekin has no built screen yet
// (owner 2026-11-22: the existing Hub Studio is not the baseline; OpenDesign is the primary reference).
// Clean room: Paraframe and Momo supply behaviour and layout ideas only; every label and sentence here is our own.
export const tier = 'Frames: board canvas and alternatives';
export const order = 2;

export function boards(K) {
  const { S, ic, ib, btn, pill, note, NT, app, chatPanel, tabs, views } = K;
  const FR = S.CANVAS_FRAMES, TK = S.CANVAS_TAKES, BL = S.CANVAS_BASELINE, STK = S.CANVAS_STACK;
  const kbd = (t) => `<span class="can-kbd">${t}</span>`;
  const gut = '<div class="can-gut"></div>';

  // ---------------------------------------------------------------- the miniature product UI inside frames and takes
  const PK = S.PACKAGES.map(([n, b, f, v, s]) => { const i = n.indexOf(' '); return { id: n.slice(0, i), name: n.slice(i + 1), b, f, v, over: s === 'bad' }; });
  const PK2 = [{ id: 'P-05', name: 'Pipeline tie-in', b: '2.30', f: '2.32', v: '+0.9%', over: false }, { id: 'P-06', name: 'Survey and permits', b: '1.10', f: '1.08', v: '−1.8%', over: false }];
  const bars = `<div class="ch"><span>Forecast against budget, USD m</span><div class="bars">${PK.map((p) => `<div><u style="height:${Math.round(parseFloat(p.b) / 13.1 * 100)}%"></u><u class="f${p.over ? ' o' : ''}" style="height:${Math.round(parseFloat(p.f) / 13.1 * 100)}%"></u></div>`).join('')}</div></div>`;
  const tui = (k = 'base') => {
    const copy = k === 'copy';
    const head = copy ? ['Package', 'Planned', 'Expected', 'Over plan', 'What to do'] : ['Package', 'Budget', 'Forecast', 'Variance', 'Status'];
    const stat = (o) => k === 'contrast' ? (o ? `<span class="pl hi">${ic('alert', 11)}Over 3%</span>` : '<span class="pl no">Within 3%</span>') : copy ? (o ? '<span class="pl wn">Needs a look</span>' : '<span class="pl ok">On plan</span>') : (o ? '<span class="pl wn">Alert</span>' : '<span class="pl ok">OK</span>');
    const th = `<div class="tr th">${head.map((h) => `<span>${h}</span>`).join('')}</div>`;
    const rows = (l) => l.map((p) => `<div class="tr${p.over ? ' o' : ''}"><span class="nm">${p.id} ${p.name}</span><em>${p.b}</em><em>${p.f}</em><span class="v">${p.v}</span>${stat(p.over)}</div>`).join('');
    const kp = (l) => `<div class="uk">${l.map(([a, b, c]) => `<div><span>${a}</span><b${c ? ` class="${c}"` : ''}>${b}</b></div>`).join('')}</div>`;
    const ut = (t, extra = '') => `<div class="ut"><i></i><b>${t}</b><span>Meranti Yard · USD m · sample</span>${extra}<em>Period 06</em></div>`;
    const KP = copy ? [['Planned', '30.65'], ['Expected', '31.65'], ['Over plan', '+3.3%', 'neg'], ['Needs a look', '2']] : S.KPIS;
    let body;
    if (k === 'portfolio') body = ut('Portfolio overview') + kp(S.KPIS) + `<div class="big">${[38, 52, 46, 60, 72, 58, 80, 66, 90, 74, 62, 84].map((v, i) => `<u class="${i === 8 ? 'hi' : ''}" style="height:${v}%"></u>`).join('')}</div>`;
    else if (k === 'drill') {
      const L = [['Steel supply', '4.20', '4.55'], ['Fabrication labour', '5.10', '5.31'], ['Coating', '1.30', '1.42'], ['Load-out', '0.90', '0.92'], ['Engineering', '0.90', '0.90']];
      body = ut('P-01 Jacket fabrication · cost lines') + kp([['Budget', '12.40'], ['Forecast', '13.10'], ['Variance', '+5.6%', 'neg'], ['Lines', '5']]) + `<div class="tb"><div class="tr th"><span>Line</span><span>Budget</span><span>Forecast</span><span>Change</span><span>Share</span></div>${L.map(([n, b, f]) => { const d = parseFloat(f) - parseFloat(b); return `<div class="tr${d > 0.2 ? ' o' : ''}"><span class="nm">${n}</span><em>${b}</em><em>${f}</em><span class="v">${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(2)}</span><em>${Math.round(parseFloat(b) / 12.4 * 100)}%</em></div>`; }).join('')}</div>`;
    } else if (k === 'empty') body = ut('Variance table') + kp(S.KPIS) + `<div class="em">${ic('check', 22)}<b>No package is over 3% this period</b><span>Next review: period 07</span></div>`;
    else if (k === 'layout') body = ut('Variance table', '<span class="kp"><span>Variance +3.3%</span><span>Alerts 2</span></span>') + `<div class="uf"><span class="on">Period 06</span><span>All packages</span><span>Over 3% only</span></div>` + `<div class="tb">${th}${rows(PK)}<div class="tr tot"><span class="nm">Total</span><em>30.65</em><em>31.65</em><span class="v">+3.3%</span><span></span></div></div>` + bars;
    else if (k === 'hierarchy') body = ut('Variance table') + kp([['Variance', '+3.3%', 'neg'], ['Forecast', '31.65'], ['Alerts', '2']]) + `<div class="tb">${th}${rows(PK)}</div>` + bars;
    else if (k === 'density') body = ut('Variance table') + kp(S.KPIS) + `<div class="tb">${th}${rows(PK.concat(PK2))}</div>`;
    else body = ut('Variance table') + kp(KP) + `<div class="tb">${th}${rows(PK)}</div>` + bars + (k === 'drawer' ? `<div class="dr"><b class="h">Alerts · 2</b><div class="it"><b>P-03 Hook-up</b><span>+6.4% · 2 periods over</span></div><div class="it"><b>P-01 Jacket</b><span>+5.6% · 3 periods over</span></div></div>` : '');
    return `<div class="can-ui k-${k}">${body}</div>`;
  };
  const sc = (k, s) => `<div class="can-sc" style="width:${Math.round(640 * s)}px;height:${Math.round(450 * s)}px;--s:${s}">${tui(k)}</div>`;
  const refimg = `<div class="can-refimg"><u class="h"></u><u></u><u style="width:82%"></u><div class="bx">${[40, 62, 50, 78, 56, 90, 66].map((v) => `<s style="height:${v}%"></s>`).join('')}</div><u></u><u style="width:70%"></u><u style="width:90%"></u><u style="width:46%"></u><u></u><u style="width:76%"></u><span class="tag">Reference, not editable</span></div>`;

  // ---------------------------------------------------------------- frame covers, frames, stack card
  const cover = (kind, f, o = {}) => {
    const c = o.compact ? ' compact' : '';
    if (kind === 'designing') return `<div class="can-cover designing${c}" role="status"><span class="ci">${ic('spark', 18)}</span><div class="tt">Designing ${o.rev}</div><div class="sb">Reading ${f.id} ${f.rev} and DESIGN.md r3 · ${o.t}</div><div class="ac">${btn('Stop', { sm: true, does: `Stops this job for ${f.id}; the accepted revision stays as it is and unused credits are released`, f: 'F170' })}</div></div>`;
    if (kind === 'waiting') return `<div class="can-cover waiting${c}" role="status"><span class="ci">${ic('history', 18)}</span><div class="tt">Waiting for a free slot</div>${o.compact ? '' : '<div class="sb">First in line. It starts when a running job ends; nothing is charged while it waits.</div>'}<div class="ac">${btn('Cancel', { sm: true, does: `Takes ${f.id} out of the queue; nothing was reserved`, f: 'F170' })}</div></div>`;
    return `<div class="can-cover failed${c}" role="alert"><span class="ci">${ic('alert', 18)}</span><div class="tt">Could not finish this frame</div><div class="sb">The model stopped after 90 s. The unused reservation was released.</div><div class="ac">${btn('Retry', { sm: true, cls: 'ink', icon: 'redo', does: `Reruns ${f.id} with the same context and revisions; no duplicate charge`, f: 'F170' })}${btn('Dismiss', { sm: true, does: `Removes the failed attempt; ${f.id} stays as an empty draft`, f: 'F170' })}</div></div>`;
  };
  const HD = ['left:-4px;top:-4px', 'left:calc(50% - 4px);top:-4px', 'right:-4px;top:-4px', 'left:-4px;top:calc(50% - 4px)', 'right:-4px;top:calc(50% - 4px)', 'left:-4px;bottom:-4px', 'left:calc(50% - 4px);bottom:-4px', 'right:-4px;bottom:-4px'];
  const frame = (f, { x, y, z, sel = false, handles = false, size = false, cov = '', chrome = true }) => {
    const ref = f.ui === 'ref';
    const w = Math.round((ref ? 960 : 1280) * z), h = Math.round(900 * z);
    const inner = ref ? refimg : `<div class="can-sc" style="width:${w}px;height:${h}px;--s:${z * 2}">${tui(f.ui)}</div>`;
    const rev = f.rev ? `<span class="r">${f.rev}</span>` : '';
    const dt = f.st === 'draft' ? '<span class="dt">Draft</span>' : '';
    const acts = chrome ? (w > 200 ? ib('download', `Export ${f.id}`, { sm: true, does: `Exports ${f.id} as PNG or HTML; a draft carries a Draft mark and exports are never counted as accepted`, f: 'F164' }) : '') + ib('more', `More actions for ${f.id}`, { sm: true, does: `Opens frame actions: open as a tab, duplicate (Alt-drag does the same), copy link, delete`, f: 'F164' }) : '';
    return `<div class="can-fr${sel ? ' sel' : ''}${f.st === 'draft' ? ' draft' : ''}" style="left:${x}px;top:${y}px;width:${w}px"><div class="can-fh"><b>${f.id}</b><span class="t">${f.name}</span>${rev}${dt}<span class="can-fill"></span>${acts}</div><div class="can-fbw"><div class="can-fb" style="height:${h}px">${inner}${cov}</div>${handles ? HD.map((p) => `<span class="hdl" style="${p}"></span>`).join('') : ''}${size ? `<span class="can-size">${f.size}</span>` : ''}</div></div>`;
  };
  const stackCard = ({ x, y, z, n, open = true }) => {
    const w = Math.round(1280 * z), h = Math.round(900 * z);
    return `<div class="can-fr" style="left:${x}px;top:${y}px;width:${w}px"><div class="can-fh"><b>F-03</b><span class="t">alternatives</span><span class="r">${n} takes</span><span class="can-fill"></span>${open ? btn('Open stack', { sm: true, does: 'Opens the takes viewer (S31) over the board: Single or Grid, with Keep on board', f: 'F164' }) : ''}</div><div class="can-stk" style="height:${h}px"><span class="bk" style="transform:translate(12px,12px)"></span><span class="bk" style="transform:translate(6px,6px)"></span><div class="can-fb" style="height:${h}px">${sc(TK[0].ui, w / 640)}</div></div></div>`;
  };
  const arrows = (id, list) => `<svg class="can-arrows" width="1418" height="694" aria-hidden="true"><defs><marker id="${id}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="currentColor"/></marker></defs>${list.map(([x1, y1, x2, y2, d]) => `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="currentColor" stroke-width="1.5"${d ? ' stroke-dasharray="4 4"' : ''} marker-end="url(#${id})"/>`).join('')}</svg>`;

  // ---------------------------------------------------------------- canvas chrome: tool rail, zoom, View menu, prompt bar, chats, marks
  const RAIL = [['pointer', 'Select (V)', 'Selects and moves frames; a press that moves less than 3 px stays a click'], ['hand', 'Pan (H)', 'Pans the board; holding Space does the same'], ['frame', 'New frame (F)', 'Draws an empty frame with a live size readout, then asks for a prompt or a reference'], ['type', 'Text (T)', 'Adds a text note to the board; notes are not sent to a run unless selected'], ['comment', 'Nitpick pin (C)', 'Drops a pin on a frame region to start a targeted change (S32)']];
  const rail = (cur = 'pointer') => `<div class="can-rail isnew" role="toolbar" aria-label="Canvas tools" aria-orientation="vertical" data-feature="F162">${NT}${RAIL.map(([i, l, d]) => ib(i, l, { sm: true, pressed: i === cur, does: d, f: 'F162' })).join('')}<span class="div"></span>${ib('image', 'Import reference (I)', { sm: true, does: 'Imports a PNG, JPEG or WebP the user picks, as a reference image (S28); it is not an editable frame', f: 'F162' })}</div>`;
  const zoomBar = (z, open = false) => `<div class="sp-zoom isnew" role="group" aria-label="Zoom" data-feature="F163">${NT}${ib('minus', 'Zoom out', { sm: true, does: 'Zooms the board out one step; frames shrink, UI text keeps its size', f: 'F163' })}<button type="button" class="can-zp" aria-haspopup="menu" aria-expanded="${open}" data-does="Opens the View menu: fit, fit selection, 100%, zoom in, zoom out" data-feature="F163">${z}${ic('chev', 12)}</button>${ib('plus', 'Zoom in', { sm: true, does: 'Zooms the board in one step', f: 'F163' })}${ib('fit', 'Fit all frames', { sm: true, does: 'Fits every frame in view with a 250 ms camera move', f: 'F163' })}</div>`;
  const MENU_DOES = ['Fits every frame in view with a 250 ms camera move', 'Fits only the selected frames in view', 'Sets the board to 100%; frames show at design size', 'Zooms in one step', 'Zooms out one step'];
  const viewMenu = (cur) => `<div class="can-menu isnew" role="menu" aria-label="View" data-feature="F163">${NT}${S.CANVAS_VIEWMENU.map(([t, k], i) => `${i === 3 ? '<span class="sep"></span>' : ''}<button type="button" role="menuitem" aria-checked="${i === cur}" data-does="${MENU_DOES[i]}" data-feature="F163"><span>${t}</span><span class="can-kbd">${k}</span></button>`).join('')}</div>`;
  const chip = (icon, name, r) => `<span class="sp-cchip">${ic(icon, 12)}${name}<span class="r">${r}</span><button type="button" aria-label="Remove ${name} from this run" data-does="Removes ${name} from this run; the frame stays on the board" data-feature="F167">${ic('x', 11)}</button></span>`;
  const promptBar = ({ chips = '', ph, hint }) => `<div class="can-pb isnew" data-feature="F167">${NT}<span class="pk a"></span><span class="pk b"></span><button type="button" class="pc" data-does="Deals out the 3 earlier chats of this board; pointing at the stack does the same" data-feature="F168">${ic('history', 12)}3 chats</button><div class="box">${chips ? `<div class="chips">${chips}</div>` : ''}<div class="in">${ph}</div><div class="row">${ib('plus', 'Attach a reference', { sm: true, does: 'Attaches a PNG, JPEG or WebP the user picks; nothing is read without a file choice', f: 'F167' })}${ib('at', 'Mention a frame or requirement', { sm: true, does: 'Adds a frame or requirement to the run context and to the chips above', f: 'F167' })}<button type="button" class="sp-model" data-does="Opens the model source picker: Hosted, BYOK, Local agent (deferred)" data-feature="F167"><span class="src">${S.MODEL.source}</span>${S.MODEL.name}${ic('chev', 12)}</button><span class="sp-est">${S.MODEL.est}</span>${hint ? `<span class="hint">${hint}</span>` : ''}<span class="can-fill"></span><span class="hint">${kbd('Enter')} to send</span><button type="button" class="sp-send" aria-label="Send" data-does="Sends the question with exactly the listed context; a paid run reserves its maximum first" data-feature="F167">${ic('up', 15, 2)}</button></div></div></div>`;
  const fan = `<div class="can-fan" role="list" aria-label="Earlier chats">${S.CANVAS_CHATS.map((c, i) => `<button type="button" class="ch" style="left:${i * 14}px;bottom:${i * 52}px" data-does="Reopens this chat and selects the frames it covered" data-feature="F168"><b>${c.t}</b><span>${c.meta}</span></button>`).join('')}</div>`;
  const busy = (inner) => `<span class="isnew" style="position:relative;display:inline-flex" data-feature="F171">${NT}<button type="button" class="sp-chip can-busy" data-does="Opens the job list: what is designing and what is waiting, with Stop and Cancel for each" data-feature="F171"><span class="dot"></span>${inner}</button></span>`;

  // ---------------------------------------------------------------- work area and window
  const right = btn('Share', { icon: 'share', later: 'Share and comment links (deferred in the browser MVP, R-WS-3)' }) + btn('Hand off', { cls: 'ink', icon: 'download', does: 'Opens S34: downloads only accepted frames with a fixed revision manifest; drafts and takes are never included', f: 'F161' });
  const tabsL = [['grid', 'Variance flows', true], ['frame', 'F-03 Variance table'], ['frame', 'F-04 Alert drawer', false, true], ['doc', 'DESIGN.md']];
  const toolRow = (chatBtn = true) => `<div class="sp-tool">${views('Canvas')}<span class="sp-crumb">Design${ic('chevR', 12)}<b>Variance flows</b></span><span class="sp-fill"></span>${chatBtn ? ib('panel', 'Open the Design chat', { sm: true, does: 'Opens the Design chat beside the board; the prompt bar sends into the same chat', f: 'F168' }) : ''}${ib('layers', 'Frame list', { sm: true, does: 'Opens a list of every frame by name: select, open or move one with the keyboard, the same actions as on the board', f: 'F174' })}${ib('undo', 'Undo', { sm: true, does: 'Undoes the last board action: move, resize, duplicate or delete', f: 'F161' })}${ib('redo', 'Redo', { sm: true, does: 'Redoes the last undone board action', f: 'F161' })}</div>`;
  const mainOf = (cv, chatBtn = true) => `<section class="sp-main" aria-label="Work area">${tabs(tabsL, right)}${toolRow(chatBtn)}<div class="sp-work">${cv}</div></section>`;
  // The kit draws the S35 shell chrome with S35 feature IDs (F101-F116). Here that chrome only frames the board, so its controls are filed under this board: chat controls under the frame chat story, the rest under the board header story.
  const refile = (h, to) => h.replace(/data-feature="F1(0\d|1[0-6])"/g, `data-feature="${to}"`);
  const win = ({ chat = gut, cv, save = ['ok', 'Saved 12:41'], busyChip = '', chatBtn = true }) => { const h = app({ stage: 'design', save, chat: chat === gut ? chat : chat.replace(/data-feature="F\d+"/g, 'data-feature="F169"'), main: mainOf(cv, chatBtn) }); return refile(busyChip ? h.replace('<span class="sp-save', () => busyChip + '<span class="sp-save') : h, 'F161'); };
  const board = (title, count, inner) => `<div class="sp-cv" aria-label="Board: Variance flows"><div class="sp-cvt">${title}<span>${count}</span></div>${inner}</div>`;

  // ================================================================ S29 Frames canvas
  const Z = 0.2, COL = [130, 452, 774, 1096], R1 = 60, R2 = 306, CW = Math.round(1280 * Z);
  const flow = (id) => arrows(id, [[COL[0] + CW + 4, 179, COL[1] - 4, 179], [COL[1] + CW + 4, 179, COL[2] - 4, 179], [COL[2] + CW + 4, 179, COL[3] - 4, 179, true]]);
  const notes29 = (list, ox = 12) => list.map(([h, x, y, w]) => note(h, `left:${ox + x}px;top:${196 + y}px;max-width:${w}px`)).join('');

  // 1 Board: six frames, F-03 selected
  const boardWorld = `<div class="can-world">${flow('can-a1')}${frame(FR.f01, { x: COL[0], y: R1, z: Z })}${frame(FR.f02, { x: COL[1], y: R1, z: Z })}${frame(FR.f03, { x: COL[2], y: R1, z: Z, sel: true, handles: true, size: true })}${frame(FR.f04, { x: COL[3], y: R1, z: Z })}${frame(FR.f05, { x: COL[0], y: R2, z: Z })}${frame(FR.ref2, { x: COL[1], y: R2, z: Z })}${stackCard({ x: COL[2], y: R2, z: Z, n: 5 })}</div>`;
  const vBoard = win({ cv: board('Variance flows', '6 frames · 5 takes', boardWorld + rail() + promptBar({ chips: chip('frame', 'F-03 Variance table', 'r6') + chip('doc', 'DESIGN.md', 'r3'), ph: 'Ask about F-03 Variance table', hint: '1 frame · 9k tokens' }) + zoomBar('20%')) })
    + notes29([
      ['<b>Click a frame</b>: its ring and 8 handles stay 8 px wide at every zoom. A press that moves less than 3 px is still a click, so a shaky click never nudges a frame.', 1100, 345, 290],
      ['<b>Zoom</b> scales the frames only. Titles, chips, tools and these notes keep their size at 20%, 100% and 400%.', 1100, 462, 290],
      ['<b>REF-02</b> is a picture, not an editable frame (PNG, imported). It can feed a run as a reference but has no element edits.', 60, 590, 330],
      ['<b>Pointing at the stack</b> behind the bar deals out the 3 earlier chats. The bar always names its scope: the board, one frame, or N frames.', 1030, 572, 300],
    ]);

  // 2 Multi-select: the bar lists exactly what the run gets; F-05 is selected but off screen
  const Z2 = 0.34;
  const multiWorld = `<div class="can-world">${arrows('can-a2', [[75 + 435 + 4, 242, 570 - 4, 242], [570 + 435 + 4, 242, 1065 - 4, 242, true]])}${frame(FR.f02, { x: 75, y: R1, z: Z2 })}${frame(FR.f03, { x: 570, y: R1, z: Z2, sel: true })}${frame(FR.f04, { x: 1065, y: R1, z: Z2, sel: true })}${frame(FR.f05, { x: 75, y: 760, z: Z2, sel: true })}</div>`;
  const edgeMark = `<button type="button" class="can-edge" style="left:236px;bottom:14px" data-does="Pans the view to F-05, which is selected but below the visible area" data-feature="F166">${ic('chev', 12)}F-05 is below</button>`;
  const recenter = `<span class="can-recenter isnew" style="right:16px;top:12px" data-feature="F166">${NT}${btn('Recenter', { cls: 'ink', sm: true, icon: 'fit', does: 'Moves the camera to the selected frames in 250 ms; zoom stays as it is', f: 'F166' })}</span>`;
  const vMulti = win({ save: ['ok', 'Saved 12:44'], cv: board('Variance flows', '3 of 6 frames selected', multiWorld + rail() + edgeMark + recenter + promptBar({ chips: chip('frame', 'F-03', 'r6') + chip('frame', 'F-04', 'r1 draft') + chip('frame', 'F-05', 'r1 draft') + chip('doc', 'DESIGN.md', 'r3'), ph: 'Ask about these 3 frames', hint: '3 frames · 14k tokens' }) + zoomBar('34%')) })
    + notes29([
      ['<b>Shift-click</b> or drag a box to add frames. The bar changes to Ask about these 3 frames and lists exactly what the run gets; the rest of the board stays out (R-CAN-4).', 75, 425, 300],
      ['<b>Rings only</b> on a multi-selection. Handles return when one frame is selected, so a group is never resized by accident.', 480, 425, 290],
      ['<b>Chats behind the bar</b> wait as a stack. Point at it and they deal out; a click reopens that chat with its frames selected.', 880, 425, 300],
      ['<b>Off-screen selection</b>: F-05 is selected but below the view. A mark at the edge points to it; Recenter brings all selected frames back in 250 ms.', 60, 540, 330],
    ]);

  // 3 Frame chat: scoped to F-04, copied from F-03
  const Z3 = 0.17;
  const c3 = [60, 318, 576, 834];
  const chatF04 = chatPanel({ title: 'F-04 Alert drawer', sub: 'frame chat', ctxItems: [['frame', 'F-04 Alert drawer', 'r1'], ['doc', 'DESIGN.md', 'r3'], ['req', 'R-DASH-014', 'r14']], ctxFoot: '≈ 6.2k tokens · only these items, not the whole board', ph: 'Ask about F-04, or @ another frame…',
    msgs: `<div class="can-carry">${ic('layers', 14)}<span><b>Copied from F-03.</b> 6 earlier messages came along.</span>${btn('Clear', { sm: true, does: 'Clears the 6 carried messages from this chat; F-03 keeps its own', f: 'F169' })}${btn('Undo', { sm: true, cls: 'plain', does: 'Brings the cleared messages back', f: 'F169' })}</div>
<div class="sp-ub">Add an alert drawer for packages over 3%.</div>
<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 34 s · 22 cr</em></div><p>Drew the drawer as F-04 r1, a draft. F-03 stays accepted at r6.</p><span class="can-chatchip">${ic('frame', 12)}F-04 Alert drawer · r1 draft</span></div>
<div class="sp-sugg">${[['spark', 'Improve this frame', 'Puts an improve request in the composer; nothing runs until Send'], ['layers', 'Try 5 takes on this frame', 'Puts a 5-takes request in the composer with its cost estimate; the stack opens in S31 when the run starts'], ['comment', 'Nitpick this frame', 'Switches to Nitpick pins on this frame (S33) and waits for the pins']].map(([i, t, d]) => `<button type="button" data-does="${d}" data-feature="F169">${ic(i, 13)}${t}</button>`).join('')}</div>` });
  const chatWorld = `<div class="can-world">${arrows('can-a3', [[c3[0] + 218 + 4, 166, c3[1] - 4, 166], [c3[1] + 218 + 4, 166, c3[2] - 4, 166], [c3[2] + 218 + 4, 166, c3[3] - 4, 166, true]])}${frame(FR.f01, { x: c3[0], y: R1, z: Z3 })}${frame(FR.f02, { x: c3[1], y: R1, z: Z3 })}${frame(FR.f03, { x: c3[2], y: R1, z: Z3 })}${frame(FR.f04, { x: c3[3], y: R1, z: Z3, sel: true, handles: true, size: true })}${frame(FR.f05, { x: c3[0], y: 290, z: Z3 })}${frame(FR.ref2, { x: c3[1], y: 290, z: Z3 })}${stackCard({ x: c3[2], y: 290, z: Z3, n: 5 })}<button type="button" class="can-lin" style="left:704px;top:252px" data-does="Selects F-03, the frame F-04 was copied from, and shows the copy line in its chat" data-feature="F175">${ic('layers', 12)}Copy of F-03</button></div>`;
  const vChat = win({ chat: chatF04, chatBtn: false, cv: board('Variance flows', '6 frames · F-04 selected', chatWorld + rail() + zoomBar('17%')) })
    + notes29([
      ['<b>Duplicate a frame</b> (Alt-drag, or More) and its chat comes along. The copy says so, with Clear and Undo, and the original chat is not touched.', 830, 300, 235],
      ['<b>Suggestions</b> sit under every reply: Improve, 5 takes, Nitpick. 5 takes opens S31, Nitpick drops pins (S33). Nothing runs until Send.', 60, 520, 320],
      ['<b>The composer is scoped</b> to F-04. Its context list is the whole input; the board and the other frames are not sent unless added with @.', 420, 520, 320],
    ], 344);

  // 4 Jobs running: covers, busy chip, capacity
  const jobsWorld = `<div class="can-world">${flow('can-a4')}${frame(FR.f01, { x: COL[0], y: R1, z: Z })}${frame(FR.f02, { x: COL[1], y: R1, z: Z, cov: cover('waiting', FR.f02, { compact: true }) })}${frame(FR.f03, { x: COL[2], y: R1, z: Z, cov: cover('designing', FR.f03, { rev: 'r7', t: '0:41' }) })}${frame(FR.f04, { x: COL[3], y: R1, z: Z, cov: cover('designing', FR.f04, { rev: 'r2', t: '0:12' }) })}${frame(FR.f05, { x: COL[0], y: R2, z: Z, cov: cover('failed', FR.f05) })}${frame(FR.ref2, { x: COL[1], y: R2, z: Z })}</div>`;
  const cap = `<div class="can-cap isnew" role="status" data-feature="F171">${NT}${ic('alert', 16)}<span><b>2 of 2 design slots in use.</b> F-02 waits for a free slot.</span>${btn('Usage and limits', { sm: true, does: 'Opens S36: slots, credits, cap and reservations for this project', f: 'F171' })}</div>`;
  const vJobs = win({ save: ['warn', 'Saving…'], busyChip: busy('<span><b>2</b> designing, <b>1</b> waiting</span>'), cv: board('Variance flows', '6 frames · 4 jobs', jobsWorld + cap + rail() + promptBar({ ph: 'Ask about this board', hint: 'Waits for a slot' }) + zoomBar('20%')) })
    + notes29([
      ['<b>Covers</b> say what a frame is doing: designing on a breathing ground, waiting for a slot, or failed with a reason and Retry. The accepted revision stays under the cover and is not changed.', 660, 345, 300],
      ['<b>Capacity</b>: Hosted runs 2 jobs at once. A third waits in line and is never dropped or charged while it waits. The busy chip counts them from any stage.', 990, 345, 300],
      ['<b>Retry</b> reruns F-05 with the same inputs. A failed job releases its unused reservation; tokens already used show in Usage as consumed (R-MOD-8).', 660, 462, 330],
    ]);

  // 5 Zoomed out overview with the View menu and dealt-out chats
  const Z5 = 0.1, O = [120, 280, 440, 600];
  const overWorld = `<div class="can-world"><div class="can-section" style="left:100px;top:70px;width:648px;height:320px"><span>Variance flows · 7 items</span></div>${frame(FR.f01, { x: O[0], y: 98, z: Z5 })}${frame(FR.f02, { x: O[1], y: 98, z: Z5 })}${frame(FR.f03, { x: O[2], y: 98, z: Z5 })}${frame(FR.f04, { x: O[3], y: 98, z: Z5 })}${frame(FR.f05, { x: O[0], y: 244, z: Z5 })}${frame(FR.ref2, { x: O[1], y: 244, z: Z5 })}${stackCard({ x: O[2], y: 244, z: Z5, n: 5, open: false })}</div>`;
  const vOver = win({ cv: board('Variance flows', '6 frames · 5 takes', overWorld + rail() + fan + promptBar({ ph: 'Ask about this board' }) + zoomBar('10%', true) + viewMenu(-1)) })
    + notes29([
      ['<b>Zoomed out</b>, frames keep their rounded shape and their title stays at 11.5 px. Only the picture shrinks; the chrome never turns into a pill or a dot (R-WS-4).', 800, 90, 300],
      ['<b>View menu</b>: fit, fit selection, 100%, in, out, with their keys. Fit moves the camera in 250 ms; Back and Forward never move it without a click.', 800, 210, 300],
      ['<b>Dealt-out chats</b>: pointing at the stack fans the 3 earlier chats above the bar, newest nearest. Esc or moving away folds them back.', 60, 440, 300],
    ]);

  // 6 Empty board
  const emptyWorld = `<div class="can-world"><div class="can-empty"><div class="can-scan" aria-hidden="true"><i style="left:0;top:14px;width:104px;height:74px"></i><i class="dash" style="left:122px;top:0;width:118px;height:84px"></i><i style="left:30px;top:96px;width:92px;height:54px"></i><s></s></div><h3>This board has no frames yet</h3><p>Describe the first screen in the bar below, draw a frame, or bring in a reference image. A new frame starts as a draft.</p><div style="display:flex;gap:8px">${btn('Import a reference', { icon: 'image', does: 'Opens S28: pick a PNG, JPEG or WebP and confirm you may use it', f: 'F172' })}${btn('Draw a frame', { icon: 'frame', does: 'Switches to the Frame tool; drag on the board to size it', f: 'F172' })}</div><div class="can-reqs"><div class="h">Spec r14 has no frame for these yet</div>${S.REQS.map((r) => `<button type="button" data-does="Starts a frame for ${r.id}: its text and criteria enter the run as context, nothing else" data-feature="F172"><span class="id">${r.id}</span><span>${r.t}</span><span class="go">Start frame</span></button>`).join('')}</div></div></div>`;
  const vEmpty = win({ save: ['ok', 'Saved 12:02'], cv: board('Variance flows', 'empty', emptyWorld + rail('frame') + `<div class="can-tip" style="left:56px;top:114px">New frame ${kbd('F')}</div>` + promptBar({ ph: 'Describe the first screen, for example a variance table with alerts' }) + zoomBar('100%')) })
    + notes29([
      ['<b>Start from a requirement</b>: accepted spec r14 lists three requirements with no frame. Clicking one drafts a frame for it and nothing else.', 70, 290, 340],
      ['<b>Draw a frame</b> (F): drag on the board and a live size readout shows 1280 × 900. On release Spekin asks for a prompt or a reference. The frame is a draft until it is reviewed.', 970, 200, 300],
    ]);

  // ================================================================ S31 Alternatives (takes stack viewer over the board)
  const F03b = Object.assign({}, FR.f03, { rev: 'r8' });
  const bgWorld = (extra = '', n = 5) => `<div class="can-world">${flow('can-b1')}${frame(FR.f01, { x: COL[0], y: R1, z: Z })}${frame(FR.f02, { x: COL[1], y: R1, z: Z })}${frame(F03b, { x: COL[2], y: R1, z: Z })}${frame(FR.f04, { x: COL[3], y: R1, z: Z })}${frame(FR.f05, { x: COL[0], y: R2, z: Z })}${frame(FR.ref2, { x: COL[1], y: R2, z: Z })}${stackCard({ x: COL[2], y: R2, z: Z, n })}${extra}</div>`;
  const inChips = `<span class="can-chatchip">${ic('frame', 12)}${STK.input[0]}</span><span class="can-chatchip">${ic('doc', 12)}${STK.input[1]}</span><span class="can-chatchip">${ic('req', 12)}${STK.input[2]}</span>`;
  const stDot = (k) => `<span class="dot ${k}"></span>`;
  const thumb = (t, st, act) => {
    const unfinished = st === 'designing' || st === 'waiting' || st === 'failed';
    const tag = st === 'designing' ? '<span class="st">Designing</span>' : st === 'waiting' ? '<span class="st">Waiting</span>' : st === 'failed' ? '<span class="st bad">Failed</span>' : '';
    return `<button type="button" class="can-th${act ? ' act' : ''}" data-does="${unfinished ? `Shows Take ${t.n} (${t.angle}); it is not finished, so it cannot be kept` : `Shows Take ${t.n} (${t.angle}) in the stage`}" data-feature="F203"><span class="pic" style="width:128px;height:90px">${tag}<span style="display:block;${unfinished ? 'opacity:.5' : ''}">${sc(unfinished ? 'base' : t.ui, 0.2)}</span></span><span class="can-cp"><b>${t.n}</b>${t.angle}${st === 'done' ? stDot('ok') : st === 'failed' ? stDot('bad') : st ? stDot('warn') : ''}</span></button>`;
  };
  const strip = (states, cur) => `<footer class="can-vf" aria-label="Takes"><button type="button" class="can-th" data-does="Shows the accepted baseline F-03 r8 in the stage, read only" data-feature="F203"><span class="pic" style="width:128px;height:90px">${sc('base', 0.2)}</span><span class="can-cp"><b>r8</b>Baseline${ic('lock', 11)}</span></button><span class="can-vsep"></span>${TK.map((t, i) => thumb(t, states[i], cur === i)).join('')}<span class="can-fill"></span><div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">${btn('Dismiss take', { sm: true, cls: 'plain', does: 'Removes this take from the stack; the baseline and the other takes are unchanged', f: 'F205' })}${btn('More takes', { sm: true, does: 'Asks for more takes from other angles; shows the estimate and the exact inputs first', f: 'F215' })}</div></footer>`;
  const segSG = (cur) => `<div class="sp-seg" role="group" aria-label="Layout">${[['Single', 'square'], ['Grid', 'grid']].map(([v, i]) => `<button type="button" aria-pressed="${v.toLowerCase() === cur}" data-does="${v === 'Single' ? 'Shows one take at a time, large and live' : 'Shows the baseline and all takes together; a click opens one in Single'}" data-feature="F204">${ic(i, 14)}${v}</button>`).join('')}</div>`;
  const step = (n, ang) => `<span class="step"><span class="can-flip">${ib('chevR', 'Previous take', { sm: true, does: 'Shows the previous take; the Left arrow key does the same', f: 'F202' })}</span><b>Take ${n} of 5</b>${ib('chevR', 'Next take', { sm: true, does: 'Shows the next take; the Right arrow key does the same', f: 'F202' })}</span><span class="ang">${ang}</span>`;
  const vh = ({ title, sub, mid = '', rhs = '' }) => `<header class="can-vh">${ib('x', 'Close the stack (Esc)', { sm: true, does: 'Closes the viewer; clicking beside it does the same. The board and the baseline stay exactly as they were', f: 'F214' })}<div class="ti"><b>${title}</b><span>${sub}</span></div>${mid}<span class="can-fill"></span>${rhs}</header>`;
  const live = `<span class="can-live" data-feature="F209"><i></i>Live</span><span class="size">1280 × 900 · 50%</span>`;
  const cmpBtn = btn(`Compare ${kbd('Hold B')}`, { icon: 'cols', does: 'Opens Compare: baseline r8 beside this take with changed regions outlined. Holding B instead fades the take to the baseline while the key is down', f: 'F206' });
  const keepBtn = btn(`Keep on board ${kbd('Enter')}`, { cls: 'ink', icon: 'check', does: 'Adds this take to the board as a new draft with its own ID. F-03 r8 stays as it is until a review accepts something', f: 'F205' });
  const keepOff = `<button type="button" class="sp-btn ghost" disabled aria-disabled="true" data-does="Unavailable until the take is finished" data-feature="F208">${ic('check', 14)}Keep on board</button>`;
  const viewer = (inner) => `<div class="can-scrim"></div><section class="can-vw isnew" role="dialog" aria-label="Takes of F-03 Variance table" data-feature="F201">${NT}${inner}</section>`;
  const win31 = (o) => win(o).replace(/data-feature="F171"/g, 'data-feature="F210"').replace(/data-feature="F1(6\d|7[0-5])"/g, 'data-feature="F201"');
  const s31 = (inner, o = {}) => win31({ save: o.save || ['ok', 'Saved 12:47'], busyChip: o.busy || '', cv: board('Variance flows', o.count || '6 frames · 5 takes', bgWorld(o.extra, o.n) + rail() + zoomBar('20%') + (o.noViewer ? '' : viewer(inner)) + (o.after || '')) });
  const n31 = (list) => list.map(([h, x, y, w]) => note(h, `left:${x}px;top:${y}px;max-width:${w}px`)).join('');
  const sideRun = (rows) => `<div><h4>This run</h4><div class="can-run">${rows.map(([n, a, k, t]) => `<div><span>${stDot(k)}</span><b>${n} ${a}</b><span>${t}</span></div>`).join('')}</div></div>`;

  // 1 Stack, Single view: Take 3 of 5, live
  const T3 = TK[2];
  const sideSingle = `<aside class="can-side" aria-label="Take details"><div><h4>Take 3 · ${T3.angle}</h4><p>${T3.line}</p></div><div><h4>Changed from baseline</h4><div class="can-chg">${T3.changes.map(([a, b], i) => `<div><i>${i + 1}</i><span><b>${a}</b>: ${b}</span></div>`).join('')}</div></div><div class="isnew" style="position:relative" data-feature="F213">${NT}<h4>Input for this run</h4><div class="can-in">${inChips}</div><p class="can-small">The whole board was not sent. ${STK.cost}. 0 new tokens inferred; the style stays at ${BL.ds}.</p></div><div class="can-note"><b>Baseline stays.</b> F-03 r8 remains the accepted frame. Keep adds this take as a draft.</div></aside>`;
  const stackInner = vh({ title: '5 takes on F-03 Variance table', sub: 'Baseline r8 stays accepted', mid: step(3, 'Contrast'), rhs: segSG('single') + live + cmpBtn + keepBtn }) + `<div class="can-vb"><div class="can-stage"><div class="can-take act" style="width:640px;height:450px">${sc(T3.ui, 1)}</div><div class="can-hint">${kbd('B')} hold to compare ${kbd('←')}${kbd('→')} step ${kbd('G')} grid</div></div>${sideSingle}</div>` + strip(['done', 'done', 'done', 'done', 'done'], 2);
  const vStack = s31(stackInner) + n31([
    ['<b>Hold B</b>: the take fades to the baseline while the key is down and back when released. There is no mode to leave.', 52, 296, 190],
    ['<b>Live take</b>: this is the real UI, not a picture. Rows hover and the drawer opens; in Interact mode buttons run.', 52, 436, 190],
    ['<b>Enter</b> keeps this take as a new draft. Esc, or a click beside the stack, closes it. Neither touches F-03 r8.', 903, 296, 190],
  ]);

  // 2 Grid view
  const cell = (lb, ui, act, extra = '') => `<div class="can-cell"><div class="lb">${lb}</div><button type="button" class="can-take can-cellb${act ? ' act' : ''}" data-does="Opens this take in Single view" data-feature="F204">${sc(ui, 0.46)}</button>${extra}</div>`;
  const gridInner = vh({ title: '5 takes on F-03 Variance table', sub: 'Baseline r8 stays accepted', mid: `<span class="ang">Take 3 selected</span>`, rhs: segSG('grid') + `<span class="size">1280 × 900 · 46%</span>` + cmpBtn + btn(`Keep Take 3 ${kbd('Enter')}`, { cls: 'ink', icon: 'check', does: 'Adds the selected take to the board as a new draft; F-03 r8 is unchanged', f: 'F205' }) }) + `<div class="can-vb"><div class="can-grid">${cell(`<b>r8</b>Baseline${pill(['ok', 'Accepted'])}`, 'base', false)}${TK.map((t) => cell(`<b>${t.n}</b>${t.angle}`, t.ui, t.n === 3, t.n === 3 ? `<span class="keep">${btn('Keep', { sm: true, cls: 'ink', does: 'Keeps Take 3 directly from the grid as a new draft', f: 'F205' })}</span>` : '')).join('')}</div></div>`;
  const vGrid = s31(gridInner) + n31([
    ['<b>Grid</b> shows the baseline and every take at once. A click opens one in Single; its Keep button keeps it without opening.', 52, 330, 180],
    ['<b>Takes are not ranked.</b> They are ordered by angle. Any generated score is analysis, not test evidence (R-GUI-5).', 1210, 330, 180],
  ]);

  // 3 Compare with baseline
  const rg = S.CANVAS_REGIONS.map(([n, l, t, w, h]) => `<span class="can-rg" style="left:${Math.round(l * 0.72)}px;top:${Math.round(t * 0.72)}px;width:${Math.round(w * 0.72)}px;height:${Math.round(h * 0.72)}px"><i>${n}</i></span>`).join('');
  const pane = (lb, ui) => `<div class="can-pane"><div class="lb">${lb}</div><div class="can-take" style="width:461px;height:324px">${sc(ui, 0.72)}${rg}</div></div>`;
  const cmpInner = vh({ title: 'Compare: Take 3 · Contrast with baseline r8', sub: '3 regions changed · read only', rhs: btn('Back to Take 3', { does: 'Returns to the Single view of Take 3', f: 'F207' }) + keepBtn }) + `<div class="can-vb"><div class="can-cmp"><div class="can-panes">${pane(`<b>Baseline r8</b>${pill(['ok', 'Accepted'])}`, 'base')}${pane(`<b>Take 3 · Contrast</b>${pill(['warn', 'Not kept'])}`, T3.ui)}</div><div class="can-cl">${T3.changes.map(([a, b], i) => `<div><i>${i + 1}</i><span><b>${a}</b>${b}</span></div>`).join('')}</div><div class="can-gen">${ic('spark', 13)}Generated comparison against R-DASH-014. It describes differences; it is not test evidence.</div></div></div>`;
  const vCompare = s31(cmpInner) + n31([
    ['<b>Changed regions</b> are outlined and numbered on both sides. They are measured on the rendered frames, so a region marks a real difference from r8.', 52, 330, 180],
    ['<b>Compare is read only.</b> Keep it as a draft or go back; the baseline is never edited, and nothing is accepted here.', 1211, 330, 180],
  ]);

  // 4 Generating: 2 of 5 done
  const genInner = vh({ title: '5 takes on F-03 Variance table', sub: 'Baseline r8 stays accepted', mid: step(3, 'Contrast'), rhs: `<span class="can-prog">2 of 5 done<i><u style="width:40%"></u></i></span>` + segSG('single') + '<span class="size">Not finished</span>' + btn('Cancel run', { does: 'Stops the 3 unfinished takes, keeps the 2 finished ones and releases the unused reservation; F-03 r8 is untouched', f: 'F210' }) + keepOff }) + `<div class="can-vb"><div class="can-stage"><div class="can-take" style="width:640px;height:450px">${sc('base', 1)}<div class="can-cover designing" role="status"><span class="ci">${ic('spark', 20)}</span><div class="tt">Designing Contrast</div><div class="sb">Starts from a copy of F-03 r8 · 0:24. Not finished, so it cannot be kept.</div><div class="ac">${btn('Stop this take', { sm: true, does: 'Stops Take 3 only; the other takes continue', f: 'F208' })}</div></div></div><div class="can-hint">${kbd('Esc')} close, the run keeps going</div></div><aside class="can-side" aria-label="Run status">${sideRun([[1, 'Hierarchy', 'ok', 'Done'], [2, 'Density', 'ok', 'Done'], [3, 'Contrast', 'warn', 'Designing 0:24'], [4, 'Layout', 'warn', 'Designing 0:09'], [5, 'Copy', 'ring', 'Waiting']])}<div class="isnew" style="position:relative" data-feature="F215">${NT}<h4>Estimate</h4><p>Reserved ≈ 54 cr. 21 cr used so far. Cancel releases what is not used.</p></div><div class="isnew" style="position:relative" data-feature="F213">${NT}<h4>Input for this run</h4><div class="can-in">${inChips}</div></div><div class="can-note"><b>Two slots at a time.</b> Copy waits for a free slot and is not charged while it waits.</div></aside></div>` + strip(['done', 'done', 'designing', 'designing', 'waiting'], 2);
  const vGen = s31(genInner, { busy: busy('<span><b>2</b> designing, <b>1</b> waiting</span>') }) + n31([
    ['<b>Cancel run</b> stops the 3 unfinished takes, keeps the 2 finished ones and releases the unused reservation. F-03 r8 is untouched (R-WS-6, R-MOD-8).', 52, 300, 190],
    ['<b>Unfinished takes</b> start as a copy of the baseline and carry a mark. They cannot be kept until they are done.', 52, 452, 190],
    ['<b>The stack opened on the first click</b>, before any take finished, so the wait is visible instead of hidden behind a spinner.', 903, 300, 190],
  ]);

  // 5 Kept: toast, F-06 draft on the board
  const f06 = { id: 'F-06', name: 'Variance table, contrast', rev: 'r1', st: 'draft', ui: 'contrast', size: '1280 × 900' };
  const keptExtra = arrows('can-b5', [[COL[2] + CW + 4, 425, COL[3] - 4, 425, true]]) + frame(f06, { x: COL[3], y: R2, z: Z, sel: true, handles: true, size: true });
  const toast = `<div class="can-toast isnew" role="status" data-feature="F212">${NT}${ic('check', 16)}<span><b>Take 3 added to the board as F-06 draft.</b> F-03 is still r8.</span>${btn('Undo', { sm: true, does: 'Removes F-06 and puts Take 3 back in the stack', f: 'F212' })}${btn('Open F-06', { sm: true, does: 'Opens F-06 as a tab in the Design stage', f: 'F212' })}</div>`;
  const vKept = s31('', { noViewer: true, n: 4, extra: keptExtra, count: '7 frames · 4 takes', after: toast }) + n31([
    ['<b>Keep made F-06 a draft</b> with its own ID and a dashed edge. F-03 is still r8; a review (S33) decides whether anything is accepted (R-WS-6).', 72, 776, 320],
    ['<b>Undo</b> in the toast removes F-06 and puts Take 3 back. The stack shows 4 takes now; the kept one is not duplicated.', 1032, 776, 330],
  ]);

  // 6 Partial failure: Take 4 failed, baseline unchanged
  const failInner = vh({ title: '5 takes on F-03 Variance table', sub: 'Baseline r8 stays accepted', mid: step(4, 'Layout'), rhs: `<span class="can-prog">4 of 5 done · 1 failed</span>` + segSG('single') + '<span class="size">Not available</span>' + keepOff }) + `<div class="can-vbn warn" role="alert">${ic('alert', 16)}<p><b>Take 4 failed.</b> Takes 1, 2, 3 and 5 are ready and can be kept. F-03 r8 is unchanged.</p>${btn('See usage', { sm: true, does: 'Opens S36 usage: 3.1k tokens consumed by the failed take, the rest of the reservation released', f: 'F211' })}</div><div class="can-vb"><div class="can-stage"><div class="can-take" style="width:640px;height:450px">${sc('base', 1)}<div class="can-cover failed" role="alert"><span class="ci">${ic('alert', 20)}</span><div class="tt">Take 4 (Layout) stopped before finishing</div><div class="sb">The model timed out after 90 s. 3.1k tokens were used and show in Usage; the rest of the reservation was released.</div><div class="ac">${btn('Retry take 4', { sm: true, cls: 'ink', icon: 'redo', does: 'Reruns only Take 4 with the same inputs; no duplicate charge', f: 'F211' })}${btn('Dismiss take', { sm: true, does: 'Removes Take 4 from the stack', f: 'F211' })}</div></div></div></div><aside class="can-side" aria-label="Run status">${sideRun([[1, 'Hierarchy', 'ok', 'Done'], [2, 'Density', 'ok', 'Done'], [3, 'Contrast', 'ok', 'Done'], [4, 'Layout', 'bad', 'Failed'], [5, 'Copy', 'ok', 'Done']])}<div class="isnew" style="position:relative" data-feature="F213">${NT}<h4>Input for this run</h4><div class="can-in">${inChips}</div></div><div class="can-note"><b>Retry reruns one take.</b> The other four stay as they are, and F-03 r8 never changed.</div></aside></div>` + strip(['done', 'done', 'done', 'failed', 'done'], 3);
  const vFail = s31(failInner) + n31([
    ['<b>Partial failure</b>: Take 4 failed, the rest are fine. The baseline is unchanged, and the four good takes can be kept now (AC-56).', 52, 300, 190],
    ['<b>Charges stay honest</b>: tokens the failed take used show in Usage as consumed, the unused reservation is released (R-MOD-8).', 52, 452, 190],
    ['<b>Failed takes are marked</b> in the filmstrip and cannot be kept, the same as unfinished ones.', 903, 300, 190],
  ]);

  const sideMotion29 = [
    ['Camera', 'Fit, Fit selection and Recenter move the camera in 250 ms (Onlook). Opening a board is instant. Zoom steps use the same ease.'],
    ['Selection', 'Ring and handles fade in over 120 ms. Their size is counter-scaled, so they never change on screen.'],
    ['Chats behind the bar', 'Deal out with a 40 ms stagger, 240 ms each, ease cubic-bezier(0.23,1,0.32,1) (OpenDesign); fold back in 160 ms.'],
    ['Frame cover', 'The designing ground breathes on a 2.8 s cycle, opacity .5 to 1. Waiting and failed covers are still.'],
    ['Busy chip', 'The dot pulses on a 1.6 s cycle while any job runs. The count text swaps with a 140 ms fade.'],
    ['Reduce Motion', 'Camera moves jump, the breathing ground and the pulse stop, chats appear without a stagger. Status text still changes.'],
  ];
  const sideMotion31 = [
    ['Stack opens', 'The viewer scales in from the stack card in 220 ms with a small overshoot (Onlook bubble timing); the scrim fades in 160 ms.'],
    ['Step', 'Take to take is a 160 ms cross-fade. The filmstrip scrolls the active thumbnail into view in 250 ms.'],
    ['Hold B', 'The take fades to the baseline in 90 ms and back in 120 ms. No state is left behind when the key is released.'],
    ['Keep', 'The take moves to its place on the board in 250 ms; the toast rises 8 px over 240 ms (Momo reveal timing).'],
    ['Generating', 'Unfinished takes breathe on a 2.8 s cycle. A finished take replaces its copy with a 160 ms cross-fade.'],
    ['Reduce Motion', 'Fades and moves become instant, breathing stops, and the toast stays 6 s so it can be read.'],
  ];

  return [
    {
      file: 'S29-frames-canvas', code: 'S29', tier: 'FRAMES', name: 'Frames canvas: board, frames, prompt bar and jobs',
      ext: 'New (BW-03). Spekin has no built canvas screen and OpenDesign has no host-side board, so the board follows Onlook patterns (Apache-2.0) and Paraframe behaviour, written in our own words. It is the Design stage of the S35 shell.',
      lives: 'Spekin web app · /p/meranti-yard/design (board, selected frames and camera in the query; never prompt text or keys).',
      views: [
        { id: 'board', label: 'Board', html: vBoard, entry: 'Projects > Meranti Yard > Design > Variance flows; click F-03.', data: 'sample/parts/canvas.mjs → CANVAS_FRAMES, CANVAS_CHATS.' },
        { id: 'multi', label: 'Multi-select', html: vMulti, entry: 'Design > Variance flows: Shift-click F-03, F-04, then F-05, which is below the view.', data: 'sample/parts/canvas.mjs → CANVAS_FRAMES.' },
        { id: 'chat', label: 'Frame chat', html: vChat, entry: 'Design > Variance flows: Alt-drag F-03 to copy it, then More > Open chat on F-04.', data: 'sample/parts/canvas.mjs → CANVAS_FRAMES; sample/meranti-yard.mjs → FRAMES.' },
        { id: 'jobs', label: 'Jobs running', html: vJobs, entry: 'Design > Variance flows: ask for changes on F-02, F-03, F-04 and F-05 in a row; two run, one waits, one fails.', data: 'sample/parts/canvas.mjs → CANVAS_JOBS.' },
        { id: 'over', label: 'Zoomed out', html: vOver, entry: 'Design > Variance flows > zoom control > View menu, then zoom out to 10%; point at the chat stack.', data: 'sample/parts/canvas.mjs → CANVAS_VIEWMENU, CANVAS_CHATS.' },
        { id: 'empty', label: 'Empty board', html: vEmpty, entry: 'Projects > Meranti Yard > Design > New board.', data: 'sample/meranti-yard.mjs → REQS.' },
      ],
      side: {
        must: [
          'An infinite board of frames. Zoom scales the frames; tools, titles, chips and handles keep their size on screen.',
          'Tool palette: select, pan, frame, text, nitpick pin, import. Each has a key, and every drag action has a non-drag route (frame list, keyboard).',
          'View menu and zoom control: fit, fit selection, 100%, zoom in, zoom out, with their keys.',
          'Each frame shows its title, revision chip, Export and more. Accepted, draft and reference frames look different.',
          'The prompt bar names its scope (board, one frame, N frames) and lists exactly what the run gets. Earlier chats wait behind it.',
          'Selection uses counter-scaled rings and handles. A selection that is off screen is marked at the edge, with a Recenter button.',
          'Frame covers show designing, waiting and failed with Retry. The top bar counts designing and waiting jobs and notes when capacity is full.',
          'Empty, zoomed-out and busy boards are drawn, not left to chance.',
        ],
        motion: sideMotion29,
        stories: [
          ['F161', 'new', 'Board header inside the S35 shell (project bar, stages, artifact tabs, view switch, saved state; those controls are S35 F101-F116): named board, Hand off of accepted frames only, Undo and Redo for board actions (R-CAN-1, R-CAN-3, R-CAN-5, R-CAN-6).', 'OpenDesign'],
          ['F162', 'new', 'Tool palette: select, pan, frame, text, nitpick pin, import, each with a key. A press under 3 px is a click, over 3 px a drag (R-CAN-1, R-CAN-8).', 'Onlook'],
          ['F163', 'new', 'View menu and zoom: fit, fit selection, 100%, in, out. Zoom scales frames, never UI text (R-CAN-1, R-WS-4).', 'Paraframe'],
          ['F164', 'new', 'Frame chrome: title (name or source), revision chip, Export, more. Accepted, draft and reference frames differ; a reference gets no element edits (R-CAN-2, R-CAN-3).', 'Paraframe'],
          ['F165', 'new', 'Selection: counter-scaled ring and handles, Shift and box multi-select, Alt-drag duplicate (R-CAN-1).', 'Onlook'],
          ['F166', 'new', 'Off-screen selection marks at the view edge and a Recenter button (R-CAN-1).', 'Onlook'],
          ['F167', 'new', 'Prompt bar: scope-aware text, chips for the exact frames, DESIGN.md revision and requirements before Send; the whole board is never sent (R-CAN-4, R-WS-6, R-MOD-3).', 'Paraframe'],
          ['F168', 'new', 'Earlier chats stacked behind the prompt bar, dealt out on pointing; the chat panel can be reopened beside the board (R-CAN-4).', 'Paraframe'],
          ['F169', 'new', 'Frame chat scoped to one frame (its context list, composer and model picker are the S35 chat controls, F106, F107, F114) with Improve, 5 takes and Nitpick suggestions; a duplicated frame carries its messages with Clear and Undo (R-WS-6, FR-26).', 'Paraframe'],
          ['F170', 'new', 'Frame covers: designing on a breathing ground, waiting for a slot, failed with a reason and Retry; the accepted revision stays under the cover (R-WS-6, R-MOD-8, AC-SPK-15).', 'Onlook'],
          ['F171', 'new', 'Busy chip in the top bar counts designing and waiting jobs; a capacity note appears when jobs exceed the slots and nothing is dropped (R-MOD-10).', 'PRD'],
          ['F172', 'new', 'Empty board: start from spec requirements that have no frame, draw one, import a reference, or describe the screen (R-WS-4, R-CAN-2).', 'Onlook'],
          ['F173', 'new', 'Zoomed-out overview keeps rounded frames and fixed-size titles; sections group frames; takes collapse into one stack card (R-CAN-1, R-WS-4).', 'Paraframe'],
          ['F174', 'new', 'Frame list and keyboard route: every canvas action has a non-drag path; below 768 px the board becomes a frame list and viewer (R-CAN-7, R-CAN-8, AC-SPK-5).', 'PRD'],
          ['F175', 'new', 'Lineage: a duplicated frame shows where it was copied from, and a click selects the source (R-CAN-3).', 'Paraframe'],
        ],
        where: '<span><b>Route:</b> <code>/p/:project/design</code>, board, selected frames and camera in the query (<code>?board=variance-flows&amp;f=F-03&amp;z=20</code>). Back and Forward restore the camera and never start a paid job (R-WF-11).</span><span><b>UI (TS/React):</b> Onlook patterns, Apache-2.0, a NOTICE is needed if code is reused: <code>Canvas</code>, <code>CanvasToolbar</code>, <code>NodeResizeHandles</code>, <code>FrameRing</code>, <code>OffscreenSelectionMarks</code>, <code>RecenterButton</code>, <code>FrameCover</code>, <code>BreathingGround</code>, <code>EmptyCanvasIllustration</code>. OpenDesign (Apache-2.0, e033aad): <code>ContextChipStrip</code>, <code>InlineModelSwitcher</code> for the bar chips and model chip. Momo has no licence: layout ideas only.</span><span><b>Core (Rust):</b> board layout and revisions, resolving a selection to the exact run context, the job queue and slot cap, save and conflict states (R-ARC-1, R-ARC-3).</span><span><b>Open for Enrico:</b> Hosted slot cap (drawn as 2) · whether the bar stays while the chat panel is open (drawn: hidden) · key set, Cmd on Mac and Ctrl elsewhere.</span>',
      },
      refs: {
        note: 'Onlook (Apache-2.0) and OpenDesign (Apache-2.0) are pattern references. Momo has no licence and Paraframe is proprietary: behaviour only, no labels, wording or assets.',
        shots: [
          { img: 'od-design-canvas.png', cap: '<b>OpenDesign canvas.</b> Bottom tool bar, Ask on select, device frames. It has no board of many frames, so Spekin adds one.' },
          { img: 'onlook-canvas.png', cap: '<b>Onlook (Apache-2.0).</b> Frames on an infinite canvas with a left tool rail. Spekin follows its rings, handles and Recenter.' },
          { img: 'momo-pinboard.png', cap: '<b>Momo pinboard (pattern only, no licence).</b> Canvas and Grid toggle, zoom stepper, Reset Canvas and a floating input bar at the bottom centre. Spekin takes the zoom group and the floating bar, not the cards.' },
          { img: 'od-studio-prototype.png', cap: '<b>OpenDesign Studio.</b> Export and Share sit on the artifact toolbar, and a status line with next-step suggestions follows each reply. Spekin puts Export on every frame and keeps the suggestions in the frame chat.' },
          { img: 'od-comment-pin.png', cap: '<b>OpenDesign comment pin.</b> A selected element shows a size, colour and font readout beside a comment box. Spekin uses the same idea for the size readout and the Nitpick pin.' },
          { img: 'od-todo-progress.png', cap: '<b>OpenDesign chat.</b> Progress and todo cards under a reply show work in flight. Spekin shows the same on the frame itself, as a cover, and in the top-bar busy chip.' },
        ],
      },
    },
    {
      file: 'S31-alternatives', code: 'S31', tier: 'FRAMES', name: 'Alternatives: takes stack and compare with the baseline',
      ext: 'New (BW-05). Neither OpenDesign nor Onlook has a takes viewer, so the stack follows Paraframe behaviour, written in our own words. It opens over the S29 board.',
      lives: 'Spekin web app · /p/meranti-yard/design?stack=F-03 (take and view in the query; the baseline revision is fixed in the link).',
      views: [
        { id: 'stack', label: 'Stack', html: vStack, entry: 'Design > Variance flows > F-03 alternatives > Open stack.', data: 'sample/parts/canvas.mjs → CANVAS_TAKES, CANVAS_BASELINE, CANVAS_STACK.' },
        { id: 'grid', label: 'Grid', html: vGrid, entry: 'Open stack > Grid in the title bar (or press G).', data: 'sample/parts/canvas.mjs → CANVAS_TAKES.' },
        { id: 'cmp', label: 'Compare', html: vCompare, entry: 'Open stack > Take 3 > Compare.', data: 'sample/parts/canvas.mjs → CANVAS_REGIONS, CANVAS_TAKES.' },
        { id: 'gen', label: 'Generating', html: vGen, entry: 'Design > F-03 frame chat > Try 5 takes > Send; the stack opens at once.', data: 'sample/parts/canvas.mjs → CANVAS_TAKES, CANVAS_JOBS, CANVAS_STACK.' },
        { id: 'kept', label: 'Kept', html: vKept, entry: 'Open stack > Take 3 > Keep on board (Enter).', data: 'sample/parts/canvas.mjs → CANVAS_STACK.' },
        { id: 'fail', label: 'Partial failure', html: vFail, entry: 'Design > F-03 > Try 5 takes; Take 4 times out while the others finish.', data: 'sample/parts/canvas.mjs → CANVAS_TAKES.' },
      ],
      side: {
        must: [
          'A takes stack opens over the board: Take 3 of 5, each titled by its angle, with a size readout and a filmstrip.',
          'Single and Grid views. The take in the viewer is live, not a picture.',
          'Keep on board (Enter) adds the take as a draft. The accepted baseline never changes until a review accepts something.',
          'Holding B fades the take to the baseline. Compare shows baseline r8 beside the take with changed regions outlined and numbered.',
          'Unfinished and failed takes are marked and cannot be kept. Cancel and Retry are always in reach.',
          'The exact inputs of the run are listed: frame, style and requirement revisions. The whole board is never sent.',
          'After Keep, a toast names the new draft and offers Undo.',
        ],
        motion: sideMotion31,
        stories: [
          ['F201', 'new', 'Takes stack on the board: one card with a count and Open stack in place of Export; it appears as soon as work starts; the baseline stays on the board. The board and shell behind the viewer are S29 and S35 (R-WS-6, R-CAN-1).', 'Paraframe'],
          ['F202', 'new', 'Stack viewer: Take 3 of 5, step arrows, each take titled by its angle: Hierarchy, Density, Contrast, Layout, Copy (R-CAN-5).', 'Paraframe'],
          ['F203', 'new', 'Filmstrip with the baseline pinned first and a status on every take (R-CAN-5).', 'Paraframe'],
          ['F204', 'new', 'Single and Grid toggle; Grid shows the baseline and all takes and opens one on click (R-CAN-5).', 'Paraframe'],
          ['F205', 'new', 'Keep on board (Enter) makes a draft with its own ID; the accepted baseline never changes until a review (R-WS-6, R-CAN-5, AC-56).', 'PRD'],
          ['F206', 'new', 'Hold B to fade the take to the baseline; Compare opens the side-by-side (R-CAN-5).', 'Paraframe'],
          ['F207', 'new', 'Compare view: baseline r8 beside the take, changed regions outlined and numbered, read only (R-CAN-5).', 'PRD'],
          ['F208', 'new', 'Unfinished and failed takes are marked and cannot be kept (R-WS-6).', 'Paraframe'],
          ['F209', 'new', 'The take in the viewer is live, not a picture; Interact mode runs the preview (R-CAN-7, AC-SPK-5).', 'Paraframe'],
          ['F210', 'new', 'Generating: 2 of 5 done, per-take status, Cancel run keeps finished takes and releases the unused reservation (R-WS-6, R-MOD-8).', 'PRD'],
          ['F211', 'new', 'Partial failure: one take failed with a reason, Retry reruns only it, the baseline is unchanged, consumed usage is shown (R-WS-6, R-MOD-8, AC-SPK-15).', 'PRD'],
          ['F212', 'new', 'Kept toast: take added as F-06 draft, with Undo and Open (R-CAN-5).', 'PRD'],
          ['F213', 'new', 'Run input listed: exact frame, DESIGN.md and requirement revisions; the whole board is not sent (R-WS-6, R-CAN-4).', 'PRD'],
          ['F214', 'new', 'Close on Esc or a click beside the stack; the board and the baseline are unchanged (R-CAN-7).', 'Paraframe'],
          ['F215', 'new', 'Estimate and slot cap shown before more takes run; reserved credits and slots in the run panel (R-MOD-3, R-MOD-10).', 'PRD'],
        ],
        where: '<span><b>Route:</b> <code>/p/:project/design?stack=F-03&amp;take=3&amp;view=single</code>. The link fixes the baseline revision (r8) so a shared link never compares against a newer one.</span><span><b>UI (TS/React):</b> new build. OpenDesign has only a direction picker and Onlook has no stack or compare; Momo&apos;s Playground compare grid is a layout idea only (no licence). The Onlook duplicate-frames flow (Apache-2.0, NOTICE if reused) places the kept draft.</span><span><b>Core (Rust):</b> take jobs and their slots, baseline immutability, Keep creating a draft with a new ID, partial failure and reservations (R-ARC-1, R-ARC-3, R-MOD-8).</span><span><b>Open for Enrico:</b> default take count (5; Paraframe allows more than 10) · compare key (B) · whether changed regions come from a DOM diff or a pixel diff.</span>',
      },
      refs: {
        note: 'No reference product ships this viewer. OpenDesign and Onlook cover neighbouring pieces; Momo gives a compare-grid layout idea. Paraframe behaviour is described in the stories, not copied.',
        shots: [
          { img: 'od-direction-picker.png', cap: '<b>OpenDesign direction picker.</b> A visual choice of directions in the chat. Closest built relative, but it is a pick list, not a stack.' },
          { img: 'od-ds-components-compare.png', cap: '<b>OpenDesign component compare.</b> Cards side by side with labels. Spekin keeps the labelled panes and adds outlines.' },
          { img: 'momo-playground-compare.png', cap: '<b>Momo Playground (pattern only, no licence).</b> Variants and Compare toggles sit above one component. Spekin adapts the idea as the Single and Grid toggle.' },
        ],
      },
    },
  ];
}
