// S32 Targeted change and S33 Review and accept (with the S08 exact diff). Owner: this file only. All stories are NEW: Spekin has no built screen yet
// (owner 2026-11-22: the existing Hub Studio is not the baseline; OpenDesign is the primary reference). Clean room: Paraframe behaviour only, own copy.
export const tier = 'Change: targeted edit and review';
export const order = 4;

export function boards(K) {
  const { S, ic, ib, btn, pill, note, NT, app, chatPanel, tabs, views, insp, row } = K;
  const P = S.REVIEW_PART, PR = S.REVIEW_PROPOSAL, NITS = S.REVIEW_NITS, ALSO = S.REVIEW_ALSO, VAR = S.REVIEW_VARIANTS;
  // Shell controls (F101-F116) keep their S35 IDs; the kit lists them in a Shared shell block of the Stories card.
  const shell = (h) => h;
  const rb = (label, does, f, cls = 'ghost', more = '') => `<button type="button" class="sp-btn ${cls}"${more} data-does="${does}" data-feature="${f}">${label}</button>`;
  const kbd = (k) => `<span class="rev-kbd">${k}</span>`;
  const right = btn('Share', { icon: 'share', later: 'Share and comment links (deferred in the browser MVP, R-WS-3)' }) + btn('Hand off', { cls: 'ink', icon: 'download', does: 'Opens S34: downloads only accepted revisions with a fixed revision manifest', f: 'F104' });
  const toolRow = (cur, crumb, extra = '') => `<div class="sp-tool">${views(cur)}<span class="sp-crumb">${crumb}</span><span class="sp-fill"></span>${extra}${ib('undo', 'Undo', { does: 'Undoes the last draft edit on this board', sm: true, f: 'F116' })}${ib('redo', 'Redo', { does: 'Redoes the last undone draft edit', sm: true, f: 'F116' })}${ib('history', 'Revisions', { does: 'Opens the revision list of the selected artifact', sm: true, f: 'F108' })}</div>`;
  const sugg = (arr) => `<div class="sp-sugg">${arr.map((t) => `<button type="button" data-does="Puts this prompt in the composer; nothing runs until Send" data-feature="F114">${ic('spark', 13)}${t}</button>`).join('')}</div>`;

  // ---- F-03 Variance table drawn at working zoom (text at real size). Package rows come from the sample file.
  const PK = S.PACKAGES.map(([n, b, f, v, s]) => { const i = n.indexOf(' '); return { id: n.slice(0, i), name: n.slice(i + 1), b, f, v, s }; });
  const pinH = (n, o, k) => { const cls = (o.stale === n ? ' stale' : o.hover ? (o.hover === n ? ' on' : ' dim') : '') + (k === 'f3' ? ' l' : ''); return `<i class="rev-pin${cls}">${n}</i>`; };
  // o: val (changed values), also (keys marked "also changed"), x (extra html inside an anchor, by key), pins (key to number), hover, stale, pill (replacement pill html), c1..c3 (column widths)
  const f03 = (o = {}) => {
    const v = { f3: '6.28', v3: '+6.4%', v3c: '', kF: '31.65', kV: '+3.3%', kA: '2', ...(o.val || {}) };
    const also = o.also || [];
    const X = (k) => ((o.x && o.x[k]) || '') + (o.pins && o.pins[k] ? pinH(o.pins[k], o, k) : '');
    const A = (k, inner, cls = '') => `<span class="rev-a ${cls}${also.includes(k) ? ' rev-also' : ''}">${inner}${X(k)}</span>`;
    const kp = [['kpi', 'Budget', '30.65', ''], ['kF', 'Forecast', v.kF, ''], ['kV', 'Variance', v.kV, 'neg'], ['kA', 'Alerts', v.kA, '']];
    const kpi = kp.map(([k, l, val, c]) => `<div class="rev-kc${also.includes(k) ? ' rev-also' : ''}"><span class="l">${l}</span><b${c ? ' class="' + c + '"' : ''}>${val}</b>${X(k)}</div>`).join('');
    const rows = PK.map((p) => {
      const p3 = p.id === 'P-03';
      const fc = p3 ? A('f3', v.f3, 'cell') : p.f;
      const pl = p3 ? A('v3', o.pill || `<span class="rev-pl${v.v3c ? ' ' + v.v3c : ''}">${v.v3}</span>`, 'pill') : `<span class="rev-pl${p.s === 'ok' ? ' ok' : ''}">${p.v}</span>`;
      return `<div class="rev-tr"><span class="id">${p.id}</span><span class="nm">${p.name}</span><span class="rev-n r">${p.b}</span><span class="rev-n r">${fc}</span><span>${pl}</span></div>`;
    }).join('');
    return `<div class="rev-pg" style="--c1:${o.c1 || 48}px;--c2:${o.c2 || 190}px;--c3:${o.c3 || 76}px">
<div class="rev-ph"><div class="rev-pt">${A('title', '<b>Variance by package</b>')}<small>USD million · period 9</small></div><span class="rev-chip">Threshold 3% · r14${X('thr')}</span></div>
<div class="rev-kp">${kpi}</div>
<div class="rev-tb"><div class="rev-th"><span>ID</span><span>Package</span><span class="r">Budget</span><span class="r">Forecast</span><span>${A('head', 'Variance')}</span></div>${rows}</div>
<p class="rev-ft">${A('foot', 'Source: cost ledger (sample) · Spec r14')}</p></div>`;
  };
  const frameAbs = (inner, { left = 64, top = 34, w = 560, rev = 'r6', st = ['ok', 'Accepted'] } = {}) => `<div class="sp-fr" style="left:${left}px;top:${top}px;width:${w}px"><div class="sp-frl"><b>F-03</b>Variance table<span class="r">${rev}</span>${pill(st)}</div><div class="sp-frb rev-fb">${inner}</div></div>`;
  const OUT = '<i class="rev-out"></i>', OUTP = '<i class="rev-out pill"></i>';
  const spin = '<span class="rev-spin" role="status" aria-label="Working on this part"><i></i></span>';

  // ---- canvas: tools at the bottom, zoom at the bottom right, nothing else overlaps them
  const palette = (tool, ask, F = 'F221') => `<div class="sp-ftool" role="toolbar" aria-label="Canvas tools">${[['pointer', 'Select (V)', 'Selects frames; with Ask on select on, a click inside a frame selects a part'], ['hand', 'Pan (H)', 'Pans the board; Space-drag does the same'], ['frame', 'New frame (F)', 'Starts an empty frame'], ['type', 'Text (T)', 'Adds a text note to the board'], ['comment', 'Nitpick pin (C)', 'Drops a numbered nitpick pin on a frame region, for review in S33'], ['image', 'Import reference', 'Imports a PNG, JPEG or WebP the user picks as a reference image']].map(([i, l, d]) => ib(i, l, { does: d, pressed: tool === i, sm: true, f: F })).join('')}<span class="div"></span><button type="button" class="sp-btn plain sm${ask ? ' rev-on' : ''}" aria-pressed="${ask ? 'true' : 'false'}" data-does="When on, selecting a part of a frame opens the change popover; nothing is sent until Send" data-feature="${F}">${ic('spark', 14)}Ask on select</button></div>
<div class="sp-zoom" role="group" aria-label="Zoom">${ib('minus', 'Zoom out', { does: 'Zooms the board out; UI text keeps its size', sm: true, f: F })}<span>100%</span>${ib('plus', 'Zoom in', { does: 'Zooms the board in', sm: true, f: F })}${ib('fit', 'Fit selection', { does: 'Fits the selected frame in view', sm: true, f: F })}</div>`;
  const cv = (inner, { tool = 'pointer', ask = false, F = 'F221' } = {}) => `<div class="sp-cv" aria-label="Board: Variance flows"><div class="sp-cvt">Variance flows<span>F-03 at 100%</span></div>
${inner}
${palette(tool, ask, F)}</div>`;
  const canvasMain = ({ tabsL, cvHtml, inspHtml, crumb = '', extra = '' }) => `<section class="sp-main" aria-label="Work area">
${tabs(tabsL, right)}
${toolRow('Canvas', 'Design' + ic('chevR', 12) + '<b>' + crumb + '</b>', extra)}
<div class="sp-work">${cvHtml}${inspHtml}</div></section>`;
  const TABS = (dirty) => [['grid', 'Variance flows', true], ['frame', 'F-03 Variance table', false, dirty], ['frame', 'F-04 Alert drawer'], ['doc', 'DESIGN.md'], ['req', 'Spec §3']];


  // ================================================================ S32 Targeted change
  const C = P.cell, PL = P.pill;
  const pop = ({ pos = 'r', part, text = '', clip = false, warn = '' }) => `<div class="rev-pop ${pos}" role="dialog" aria-label="Change the ${part.name}">
<div class="rev-pn">${ic('pointer', 14)}<b>${part.name}</b><small>${part.pkg}</small><span class="sp-fill"></span>${ib('x', 'Close', { does: 'Closes the popover and keeps the part selected; Esc does the same', sm: true, f: 'F222' })}</div>
<div class="rev-pm"><span>Size</span><b>${part.size}</b><span>Type</span><b>${part.font}</b></div>
<input class="rev-in" type="text" value="${text}" placeholder="What should change about this element?" aria-label="Instruction for the ${part.name}" data-does="Takes a one-line instruction for this part only; Enter sends it" data-feature="F223">
<div class="rev-act">${rb('Send ' + kbd('↵'), 'Sends the instruction as a change to this part only. Disabled while the field is empty', 'F224', 'ink', text ? '' : ' disabled aria-disabled="true"')}${rb('Send to chat ' + kbd('⌘↵'), 'Moves the instruction and the selected part into the chat composer instead of running it', 'F225')}</div>
<div class="rev-opt-row"><span class="rev-grp"><button type="button" class="go" data-does="Draws the chosen number of variations of this part; each one is reviewed on its own" data-feature="F228">${ic('layers', 14)}Variations</button>${ib('minus', 'Fewer variations', { does: 'Lowers the number of variations, minimum 2', sm: true, f: 'F228' })}<span class="nbr">3</span>${ib('plus', 'More variations', { does: 'Raises the number of variations, maximum 6', sm: true, f: 'F228' })}</span><button type="button" class="rev-tg" aria-pressed="${clip}" title="Change only this area" data-does="Clip: the change stays inside this part's box; nothing around it moves or resizes" data-feature="F230">${ic('square', 14)}Clip</button></div>
${warn}<div class="rev-pf"><span>≈ 4 to 8 cr · Sonnet 5.5</span><span class="sp-fill"></span><span>Esc closes</span></div></div>`;
  const pillV = (v) => `<span class="rev-pl">${v.text}</span>${v.badge ? `<span class="rev-bd" title="Periods over">${v.badge}</span>` : ''}`;
  const AFTER = { f3: C.after, v3: '+0.8%', v3c: 'ok', kF: '31.32', kV: '+2.2%', kA: '1' };
  const ALSO_KEYS = ['v3', 'kF', 'kV', 'kA'];
  const barApplied = (top) => `<div class="rev-bar" style="left:44px;top:${top}px;width:600px"><div class="tx"><b>Applied in place</b><span>Draft r7 · 4 related values changed</span></div><span class="sp-fill"></span>${rb(ic('spark', 14) + 'Ask or change', 'Reopens the popover on this part with the last instruction, to refine it or to ask a question about it', 'F227')}${rb('Compare ' + kbd('O'), 'Hold to show the original of the whole frame in place; release to return to the change', 'F232')}${rb(ic('undo', 14) + 'Undo', 'Undoes this change and its related values in one step', 'F233')}${rb('Done ' + kbd('↵'), 'Keeps the change as a draft and closes this bar; it is accepted later in the review (S33)', 'F227', 'ink')}</div>`;
  const barWork = (top) => `<div class="rev-bar" style="left:64px;top:${top}px"><span class="rev-spin in" role="status" aria-label="Working on the Forecast cell"><i></i></span><div class="tx"><b>Changing 1 part · 6 s</b><span>Chat stays closed. Pan, zoom and select other parts meanwhile.</span></div>${rb('Stop', 'Stops the job; the part keeps 6.28 and the reserved credits are released', 'F226')}</div>`;
  const barVar = (top) => `<div class="rev-bar" style="left:44px;top:${top}px;width:600px"><div class="tx"><b>Variation 1 of 3</b><span>Nothing applies until you press Apply</span></div><span class="rev-flip">${ib('chevR', 'Previous variation', { does: 'Shows the previous variation in place; arrow keys do the same', sm: true, f: 'F229' })}</span>${ib('chevR', 'Next variation', { does: 'Shows the next variation in place; arrow keys do the same', sm: true, f: 'F229' })}<span class="rev-dots" aria-hidden="true"><i class="on"></i><i></i><i></i></span><span class="sp-fill"></span>${rb('Compare ' + kbd('O'), 'Hold to show the original part in place; release to return to the variation', 'F229')}${rb('Dismiss', 'Drops all 3 variations; F-03 stays at r6', 'F229')}${rb('Apply', 'Applies variation 1 in place as a draft; the other two are dropped', 'F229', 'ink')}</div>`;

  const partRow = (id, name, sub, sel) => `<div class="sp-row"><span class="id">${id}</span><span class="nm">${name}<small>${sub}</small></span>${sel ? pill(['acc', 'Selected']) : '<span></span>'}</div>`;
  const chat32 = ({ foot, msgs, partChip = 'F-03 · Forecast cell P-03' }) => shell(chatPanel({ title: 'Design chat', sub: 'F-03 selected', ctxItems: [['frame', partChip, 'part'], ['frame', 'F-03 Variance table', 'r6'], ['doc', 'DESIGN.md', 'r3'], ['req', 'R-DASH-014', 'r14']], ctxFoot: foot, msgs, ph: 'Ask for a change to F-03, or @ another frame…' }));
  const earlier = `<div class="sp-ub">Add an alert drawer to the variance table for packages over 3%.</div>
<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 34 s · 22 cr</em></div><p>Drew <b>F-04 Alert drawer</b> as a draft. F-03 stays accepted at r6.</p></div>`;
  const jobCard = `<div class="sp-gc"><div class="k">${ic('spark', 12)}Part change<span class="tag">${pill(['acc', 'Working · 6 s'])}</span></div><div class="tt">Forecast cell, P-03 in F-03</div><div class="bd">“${C.ask}”</div>
<div class="sp-ck"><div><span class="bx on">${ic('check', 10, 3)}</span><span>Read the part and its links</span>${pill(['ok', 'Done'])}</div><div><span class="bx"></span><span>Change the value</span>${pill(['acc', 'Working'])}</div><div><span class="bx"></span><span>Check related values</span>${pill(['mute', 'Waiting'])}</div></div>
<div class="ft"><span class="s">Reserved 8 cr · Sonnet 5.5</span>${rb('Stop', 'Stops the job; the part keeps 6.28 and the reserved credits are released', 'F226')}</div></div>`;

  // inspector bodies
  const inspSel = insp({ title: C.name, pillv: ['mute', 'Part'], sub: 'P-03 row in F-03 Variance table r6', tabsv: [['Part', 1], ['Changes'], ['Links']],
    body: `<div class="sp-sec"><h4>Selected part</h4><div class="rev-kv"><span>Element</span><b>Table cell</b><span>Text</span><b>${C.before}</b><span>Size</span><b>${C.size}</b><span>Type</span><b>${C.font}</b></div></div>
<div class="sp-sec"><h4>Parts in this frame<span>6</span></h4>${partRow('Title', 'Page title', 'Variance by package')}${partRow('Chip', 'Threshold chip', 'Threshold 3% · r14')}${partRow('KPI', 'KPI cards', '4 cards')}${partRow('Head', 'Table header', '5 labels')}${partRow('Cell', 'Forecast cell', 'P-03 · 6.28', true)}${partRow('Pill', 'Variance pill', 'P-03 · +6.4%')}</div>
<p class="rev-note"><b>No pointer?</b> Tab into the frame, arrow keys move through the parts and Enter selects. This list does the same.</p>` });
  const inspWork = insp({ title: C.name, pillv: ['acc', 'Working'], sub: 'P-03 row in F-03 · locked until the change applies', tabsv: [['Changes', 1], ['Part'], ['Links']],
    body: `<div class="sp-sec"><h4>This change<span>1 job</span></h4>${row('Ask', C.ask, 'Sent 12:47 · Sonnet 5.5', ['acc', 'Working'])}${row('Part', 'Forecast cell, P-03', '6.28 stays until the change applies', ['mute', 'Locked'])}${row('Cost', 'Reserved 8 cr', 'Estimate 4 to 8 cr · released if stopped', ['mute', 'Hosted'])}</div>
<p class="rev-note"><b>Selection does not open chat.</b> The pin spins on the part, the job shows here and in the chat list. Escape does not cancel the job; Stop does.</p>
<div class="sp-ready"><div class="t">Related values<span class="pill mute">Checked after</span></div><p>When the value is in, Spekin looks for other values that follow from it and lists them. It never says the edit stayed inside the part.</p></div>` });
  const alsoRows = ALSO.map((a) => `<div class="rev-ch"><span class="e">${a.el}</span><span class="w">${a.where}</span><span class="v"><s>${a.from}</s>${ic('chevR', 12)}<b>${a.to}</b></span></div>`).join('');
  const inspApplied = insp({ title: C.name, pillv: ['warn', 'Changed · draft r7'], sub: `${C.before} to ${C.after} · F-03 draft r7 · 12:48`, tabsv: [['Changes', 1], ['Part'], ['Links']],
    body: `<div class="sp-sec"><h4>Also changed<span>4</span></h4>${alsoRows}</div>
<div class="rev-leg"><i class="s"></i>You changed this<i class="d"></i>Changed with it</div>
<p class="rev-note"><b>Not isolated.</b> Related values moved with the cell. ${S.REVIEW_OUTSIDE}</p>
<div class="sp-ready"><div class="t">Draft r7<span class="pill warn">Not accepted</span></div><p>Done keeps this as a draft. You accept it in the frame review (S33); until then F-03 stays at r6.</p>${btn('Compare whole frame', { cls: 'ink', sm: true, does: 'Opens Compare: the original F-03 r6 beside the draft, every differing value marked', f: 'F232' })}</div>` });
  const inspVar = insp({ title: PL.name, pillv: ['acc', 'Variation 1 of 3'], sub: 'P-03 row · “' + PL.ask + '”', tabsv: [['Variations', 1], ['Part'], ['Links']],
    body: `<div class="sp-sec"><h4>Variations<span>3</span></h4>${VAR.map((v) => `<button type="button" class="rev-vc" aria-pressed="${v.id === 1}" data-does="Shows variation ${v.id} of ${VAR.length} in place of the part" data-feature="F229"><span class="t"><b>${v.id} · ${v.label}</b><small>${v.hint}</small></span><span class="pv">${pillV(v)}</span></button>`).join('')}</div>
<p class="rev-note"><b>Only text changes.</b> The variations touch this pill and nothing else, so no related values moved. Variations are separate from Undo and Done.</p>
<div class="sp-ready"><div class="t">Review<span class="pill acc">Variation 1 of 3</span></div><p>Apply keeps this one as a draft and drops the other two. Dismiss drops all three and F-03 stays at r6.</p></div>` });
  const inspClip = insp({ title: PL.name, pillv: ['ink', 'Clip on'], sub: 'P-03 row in F-03 Variance table r6', tabsv: [['Part', 1], ['Changes'], ['Links']],
    body: `<div class="sp-sec"><h4>Clip<span>on</span></h4><div class="rev-kv"><span>Area</span><b>${PL.size}, fixed</b><span>Layout</span><b>Nothing moves</b><span>Related</span><b>Not updated</b></div></div>
<p class="rev-note"><b>Clip keeps the change inside the part.</b> The pill cannot grow, so a longer text is cut. Values elsewhere are left as they are, which can leave them out of step.</p>
<div class="sp-ready"><div class="t">Text does not fit<span class="pill warn">Check</span></div><p>“+6.4% · 2 periods” needs about 122 px. The clip is ${PL.size}. Shorten the text or turn Clip off.</p></div>` });


  const A32 = (o) => shell(app({ stage: 'design', save: ['ok', 'Saved 12:41'], ...o }));
  const N = (html, x, y, w = 240) => note(html, `left:${x}px;top:${y}px;max-width:${w}px`);
  const warnClip = `<div class="rev-warn">${ic('alert', 14)}<span>Text does not fit the clip: it is cut to “+6.4…”. Shorten it or turn Clip off.</span></div>`;
  const mk32 = (o) => A32({ chat: chat32(o.chat), main: canvasMain({ tabsL: TABS(!!o.dirty), crumb: 'F-03 Variance table', cvHtml: cv(o.cv, { ask: true }), inspHtml: o.insp }) });
  const gen = (t, cost) => `<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>${cost}</em></div><p>${t}</p></div>`;

  const v1 = mk32({
    chat: { foot: 'Selecting sends nothing and does not open chat', msgs: earlier + sugg(['Round every forecast to 2 decimals', 'Show the period count in the pills']) },
    cv: frameAbs(f03({ x: { f3: OUT + pop({ pos: 'r', part: C }) } })), insp: inspSel,
  }) + N('<b>Click a part</b> (Ask on select is on): the outline hugs the part, a pill gets a pill outline, and the popover opens beside it. Nothing is sent and chat stays shut.', 358, 668, 215)
     + N('<b>Popover placement</b>: right of the part when it fits, then below, left or above. It never covers the tool palette, the zoom control or the prompt bar.', 585, 668, 215)
     + N('<b>Send stays off</b> while the field is empty. Enter sends, ⌘ Enter sends to chat, Esc closes.', 358, 790, 440);

  const v2 = mk32({
    chat: { foot: '8 cr reserved · selection kept on the canvas', msgs: earlier + jobCard },
    cv: frameAbs(f03({ x: { f3: OUT + spin } })) + barWork(468), insp: inspWork,
  }) + N('<b>Send</b>: the popover closes and a small pin spins on the part. Selecting other parts meanwhile does not open chat.', 358, 724, 240)
     + N('<b>Stop</b> releases the reserved credits and the cell keeps 6.28. The latest request wins; nothing replays.', 612, 724, 240)
     + N('<b>Reduce Motion</b>: the pin stops turning and the bar still says Changing.', 866, 724, 240);

  const v3 = mk32({
    dirty: true,
    chat: { foot: '9.4k tokens · only F-03 and the items listed', msgs: earlier + gen('Changed the P-03 forecast from <b>6.28 to 5.95</b>. <b>4 related values</b> changed with it, so this edit is not isolated.', 'Sonnet 5.5 · 22 s · 7 cr') + sugg(['Compare the whole frame', 'Ask the same re-quote on F-04']) },
    cv: frameAbs(f03({ val: AFTER, also: ALSO_KEYS, x: { f3: OUT } }), { rev: 'r7', st: ['warn', 'Draft · not accepted'] }) + barApplied(468), insp: inspApplied,
  }) + N('<b>The job ends</b>: the value changes in place, no reload. Solid outline is what you asked for. Dashed boxes are values that changed with it.', 358, 724, 240)
     + N('<b>Hold O</b>: the whole frame shows its original while the key is down. <b>Undo</b> puts back the cell and all 4 related values in one step.', 612, 724, 240)
     + N('<b>Done or Enter</b> keeps a draft. Nothing is accepted here (R-WS-7).', 866, 724, 240);

  const rowsCmp = [[true, 'Forecast cell · P-03', C.before, C.after, 'Selected region']].concat(ALSO.map((a) => [false, a.el, a.from, a.to, 'Outside the region']));
  const sumRows = rowsCmp.map(([s, e, b, a, w]) => `<div class="rev-sr"><i class="sw ${s ? 's' : 'd'}"></i><span>${e}</span><span class="m"><s>${b}</s></span><span class="m">${a}</span><span>${w}</span></div>`).join('');
  const cmpMain = `<section class="sp-main" aria-label="Work area">
${tabs(TABS(true), right)}
${toolRow('Compare', 'Design' + ic('chevR', 12) + '<b>F-03 Variance table</b>')}
<div class="sp-work rev-cwork">
<div class="rev-cmp"><div class="rev-cf"><div class="rev-cl"><b>Original</b>F-03 r6 ${pill(['ok', 'Accepted'])}</div><div class="sp-frb rev-fb">${f03({ c1: 50, c2: 176, c3: 62 })}</div></div>
<div class="rev-cf"><div class="rev-cl"><b>With your change</b>F-03 draft r7 ${pill(['warn', 'Draft'])}</div><div class="sp-frb rev-fb">${f03({ val: AFTER, also: ALSO_KEYS, x: { f3: OUT }, c1: 50, c2: 176, c3: 62 })}</div></div></div>
<div class="rev-sum"><div class="rev-sh">5 values differ<span>1 in the region you selected, 4 outside it</span><span class="sp-fill"></span>${rb('Hold to compare ' + kbd('O'), 'While held, flips the right frame to the original in place', 'F232')}${rb(ic('undo', 14) + 'Undo', 'Undoes the change and its related values in one step', 'F233')}${rb('Done ' + kbd('↵'), 'Keeps the change as a draft and returns to the canvas', 'F227', 'ink')}</div>
<div class="rev-sr hd"><span></span><span>Element</span><span>Before</span><span>After</span><span>Where</span></div>${sumRows}</div></div></section>`;
  const v4 = A32({ chat: chat32({ foot: '9.4k tokens · only F-03 and the items listed', msgs: earlier + gen('Comparing F-03 r6 with the draft. <b>5 values differ</b>; 4 of them are outside the part you selected.', 'Sonnet 5.5 · 22 s · 7 cr') }), main: cmpMain })
    + N('<b>Compare whole frame</b>: the solid box is the part you picked; dashed boxes are values you did not pick that still changed.', 366, 844, 520)
    + N('<b>Not isolated</b>: F-04 Alert drawer was not touched but still lists P-03 at +6.4%. The chat names it.', 908, 844, 520);

  const v5 = mk32({
    dirty: true,
    chat: { foot: 'Only the Variance pill is sent', msgs: earlier + gen('Drew <b>3 variations</b> of the Variance pill. Nothing applies until you press Apply.', 'Sonnet 5.5 · 18 s · 12 cr') + sugg(['Try 3 more variations']), partChip: 'F-03 · Variance pill P-03' },
    cv: frameAbs(f03({ x: { v3: OUTP }, pill: pillV(VAR[0]) }), { rev: 'r6', st: ['acc', 'Variation preview'] }) + barVar(468), insp: inspVar,
  }) + N('<b>Variations</b>: 3 takes of this part only. Arrow keys step through them and the part changes in place; the inspector lists all three.', 358, 724, 240)
     + N('<b>Apply or Dismiss</b> are separate from Undo and Done. Apply keeps one and drops the rest; Dismiss leaves F-03 at r6.', 612, 724, 240)
     + N('<b>Hold O</b> shows the original pill while the key is down.', 866, 724, 240);

  const v6 = mk32({
    chat: { foot: 'Only the Variance pill is sent', msgs: earlier + sugg(['Round every forecast to 2 decimals']), partChip: 'F-03 · Variance pill P-03' },
    cv: frameAbs(f03({ x: { v3: '<i class="rev-clip pill"></i><span class="rev-cliptag">Clip ' + PL.size + '</span>' + OUTP + pop({ pos: 'b', part: PL, text: PL.ask, clip: true, warn: warnClip }) }, pill: '<span class="rev-pl fix">+6.4% · 2 periods</span>' })), insp: inspClip,
  }) + N('<b>Clip on</b>: the change must fit the ' + PL.size + ' box. The pill cannot grow and nothing around it moves. The popover flipped below because the right side has no room.', 358, 668, 215)
     + N('<b>Related values</b> are not updated under Clip, so a mismatch can appear. The inspector says so before you send.', 585, 668, 195);


  const s32 = {
    file: 'S32-targeted-change', code: 'S32', tier: 'CHANGE', name: 'Targeted change: select a part, instruct, review in place',
    ext: 'New. Spekin has no built screen yet; the existing Hub Studio is not used as a baseline (owner, 22 Nov 2026). Opens from S29 (shared canvas) inside the S35 shell; accepted later in S33 and S08. Baseline wireframe BW-06.',
    lives: 'Spekin web app · /p/meranti-yard/design?frame=F-03 (the part is kept in the query as a stable ID; instruction text never goes in the link).',
    views: [
      { id: 'select', label: 'Part selected', html: v1, entry: 'Projects &gt; Meranti Yard &gt; Design &gt; Variance flows &gt; turn on Ask on select &gt; click the forecast 6.28 in row P-03 of F-03.', data: 'sample/parts/review.mjs → REVIEW_PART.cell; sample/meranti-yard.mjs → PACKAGES, KPIS.' },
      { id: 'working', label: 'Working', html: v2, entry: 'Select the forecast cell, type “Set the forecast to 5.95 after the re-quote”, press Send (Enter).', data: 'sample/parts/review.mjs → REVIEW_PART.cell.ask.' },
      { id: 'applied', label: 'Applied in place', html: v3, entry: 'Wait for the job to end (about 20 s); the bar appears under the frame.', data: 'sample/parts/review.mjs → REVIEW_ALSO, REVIEW_OUTSIDE.' },
      { id: 'compare', label: 'Whole-frame compare', html: v4, entry: 'On the applied bar or in the inspector, click Compare whole frame (or the Compare view).', data: 'sample/parts/review.mjs → REVIEW_ALSO (5 differing values).' },
      { id: 'variations', label: 'Variations', html: v5, entry: 'Select the P-03 variance pill, type an instruction, leave Variations at 3 and click Variations.', data: 'sample/parts/review.mjs → REVIEW_VARIANTS, REVIEW_PART.pill.' },
      { id: 'clip', label: 'Clip', html: v6, entry: 'Select the P-03 variance pill (the right side has no room, so the popover opens below), type an instruction, turn on Clip.', data: 'sample/parts/review.mjs → REVIEW_PART.pill.' },
    ],
    side: {
      must: [
        'Select a part of a frame. The outline hugs the part, and a pill-shaped part gets a pill outline with no gap at the top.',
        'The popover opens beside the part and moves below, left or above when there is no room. It never covers the tool palette, the zoom control or the prompt bar.',
        'The popover has a one-line field, Send (off while the field is empty), Send to chat, Variations with a minus, 3, plus stepper, and Clip (change only this area).',
        'While a change runs, a small spinning pin sits on the part. Selecting does not open chat. Closing the popover keeps the typed instruction.',
        'After it applies in place: change or ask more, hold to compare with the original, Undo, Done (Enter). The result is a draft; nothing is accepted here.',
        'Related values can change with the part (here the forecast moves the variance pill, two KPIs and the alert count). List them, offer whole-frame compare, and never claim the edit is isolated (R-WS-7).',
        'Element variations are reviewed apart from Undo and Done: Variation 1 of 3 with Apply and Dismiss.',
        'Every pointer action has a keyboard path: a parts list, arrow keys and Enter pick a part (R-CAN-7).',
      ],
      motion: [
        ['Outline', 'Appears in 120 ms, spring-ui. It follows the part if the frame is resized or zoomed.'],
        ['Popover', 'Entry 220 ms with a small overshoot, scale 0.96 to 1, from the part (Onlook bubble timing). Moving to another side does not replay the entry.'],
        ['Spinning pin', 'One turn per 0.9 s, only while a job really runs. It never decorates an idle part.'],
        ['Apply in place', 'Value swaps with a 140 ms fade, ease cubic-bezier(0.23,1,0.32,1) (OpenDesign). Related values follow with a 40 ms stagger.'],
        ['Hold to compare', 'The original shows on key down and goes back on key up. No animation, so the frame never looks half-changed.'],
        ['Reduce Motion', 'The pin stops turning and shows a still dot. Swaps are instant. Working, Applied and Undone are still announced.'],
      ],
      stories: [
        ['F221', 'new', 'Ask on select: a click inside a frame selects a part; the outline hugs it and pill parts get pill outlines (R-WS-7, Paraframe parity FR-31 to FR-42).', 'Paraframe'],
        ['F222', 'new', 'Popover beside the part; moves below, left or above when there is no room and never covers the tool palette, zoom or prompt bar (FR-32).', 'Paraframe'],
        ['F223', 'new', 'One-line field “What should change about this element?” with the part name, size and type; closing keeps the text (FR-32, R-CAN-4).', 'OpenDesign'],
        ['F224', 'new', 'Send is off while the field is empty; Enter sends a change to this part only (FR-32, R-CAN-5).', 'Paraframe'],
        ['F225', 'new', 'Send to chat moves the instruction and the part into the composer instead of running it (FR-32, R-CAN-4).', 'Paraframe'],
        ['F226', 'new', 'Working: a spinning pin on the part, a job card in chat, a Stop that releases reserved credits; selecting does not open chat (R-MOT-5, R-MOD-3).', 'Paraframe'],
        ['F227', 'new', 'Applied in place as a draft: change or ask more, Undo, Done (Enter); success alone accepts nothing (FR-35, R-CAN-5, R-GUI-4).', 'Paraframe'],
        ['F228', 'new', 'Variations stepper (minus, 3, plus) draws N variations of one part (R-WS-6, R-CAN-5).', 'Paraframe'],
        ['F229', 'new', 'Element variations review: Variation 1 of 3 with Apply and Dismiss, apart from Undo and Done (R-CAN-5).', 'Paraframe'],
        ['F230', 'new', 'Clip: the change stays inside the part box, nothing grows or moves, text that does not fit is flagged (R-CAN-5).', 'Paraframe'],
        ['F231', 'new', 'Also changed: related values are listed with before and after; the edit is never called isolated (R-WS-7, FR-36).', 'Paraframe'],
        ['F232', 'new', 'Whole-frame compare and hold to compare with the original; selected and outside values are marked differently (R-WS-7, R-CAN-5).', 'PRD'],
        ['F233', 'new', 'Undo and redo put back the part and its related values as one step (R-CAN-5).', 'Onlook'],
        ['F234', 'new', 'Part inspector with a parts list: a keyboard way to pick a part; Enter selects, Esc closes (R-CAN-7, AC-SPK-5).', 'OpenDesign'],
        ['F235', 'new', 'Credit estimate and model source shown before Send; the part, not the board, is the context (R-CAN-4, R-MOD-3).', 'PRD'],
      ],
      where: '<span><b>Route:</b> <code>/p/:project/design</code> with <code>frame</code> and <code>part</code> in the query. The part is a stable element ID, never a pixel position. Back and Forward restore the selection and start no paid job (R-WF-11).</span><span><b>UI (TS/React):</b> OpenDesign comment pattern, Apache-2.0 at commit <code>e033aad</code>: <code>comment-bridge</code> (<code>od:comment-target</code>), <code>BoardComposerPopover</code>, anchor drift states. Onlook, Apache-2.0: <code>InlineElementChat</code> bubble placement and <code>useOrbMorph</code>. Code reuse needs a NOTICE entry.</span><span><b>Core (Rust):</b> part IDs and anchors, the change as a draft revision, related-value diff, undo steps, credit reservation (R-ARC-1).</span><span><b>Open for Enrico:</b> Variations default of 3 and the 2 to 6 range · whether Done should also offer Accept in S33 · accent for the selection outline (Q-28).</span>',
    },
    refs: {
      note: 'OpenDesign and Onlook (Apache-2.0) give the popover pattern. Paraframe is behaviour only: no label, wording or asset is copied.',
      shots: [
        { img: 'od-comment-entry.png', cap: '<b>OpenDesign comment entry.</b> A popover beside the picked element: size, colour and type, a text box, Send to chat. Spekin adds Send, Variations and Clip.' },
        { img: 'od-comment-pin.png', cap: '<b>OpenDesign pinned comment.</b> A numbered pin on the element and the same popover. Spekin uses a spinning pin while a change runs.' },
        { img: 'onlook-canvas.png', cap: '<b>Onlook (Apache-2.0).</b> Frames on a canvas with an inline bubble beside the clicked element. Spekin follows the beside-the-part placement.' },
        { img: 'od-design-canvas.png', cap: '<b>OpenDesign canvas.</b> Bottom tool bar with Ask on select. Spekin keeps the palette and zoom clear of the popover.' },
        { img: 'od-todo-progress.png', cap: '<b>OpenDesign job card.</b> Steps with status inside the chat. Spekin’s Working card follows this.' },
        { img: 'momo-playground.png', cap: '<b>Momo (pattern only, no licence).</b> A state strip: Loading, Error, Empty, 4 Variants, Compare, Approve. Spekin lists its own states on this board.' },
      ],
    },
  };


  // ================================================================ S33 Review and accept, with the S08 exact diff
  const PINS = { title: 1, thr: 2, kpi: 3, head: 4, f3: 5, v3: 6, foot: 7 };
  const STALE = NITS.find((n) => n.stale);
  const READY = NITS.length - 1;
  const nitRow = (n, hov) => `<div class="rev-rr${n.stale ? ' stale' : ''}${hov === n.n ? ' hov' : ''}"><span class="pn">${n.n}</span><button type="button" class="rb" data-does="Rests the pointer on change ${n.n}: only its pin stays solid and the part is outlined; a click keeps it isolated" data-feature="F243"><span class="nm"><b>${n.el}</b><small>${n.what}</small></span></button><span class="st">${n.stale ? pill(['warn', 'Stale']) : hov === n.n ? ib('undo', 'Undo this change', { does: 'Puts back only change ' + n.n + '; the other changes stay', sm: true, f: 'F246' }) : ic('check', 14)}</span>${n.stale && hov === 'open' ? staleBox : ''}</div>`;
  const staleBox = `<div class="rev-rs"><p>Shown as the part was before it changed.</p><div class="cmp"><span>Nitpick saw</span><s>${STALE.seen}</s><span>Part now</span><b>${STALE.now}</b></div><div class="acts">${rb('Re-check', 'Evaluates this nitpick again against the part as it is now; the row returns ready or stays flagged', 'F245', 'ink')}${rb('Dismiss', 'Removes this row without applying it. Dismissing is not a pass and nothing is accepted for it', 'F245')}</div></div>`;
  const reviewCard = (hov) => `<div class="rev-rc isnew" data-feature="F242">${NT}<div class="rev-rh">${ic('comment', 12)}Review · F-03 Variance table${pill(['warn', 'Draft r7'])}</div>${NITS.map((n) => nitRow(n, hov)).join('')}
<div class="rev-rf"><div class="c"><b>${NITS.length} changes</b> · <em>1 needs a look</em></div><div class="acts">${rb('Undo all', 'Undoes the whole review: all 7 changes go back to F-03 r6 in one step', 'F246')}${rb('Compare ' + kbd('O'), 'While held, shows the original F-03 r6 in place; release to return to the draft', 'F247')}<span class="sp-fill"></span>${rb('Accept ' + READY + ' ' + kbd('↵'), 'Accepts the 6 ready changes as F-03 r7. The stale item stays out until it is re-checked or dismissed', 'F247', 'ink')}</div></div></div>`;
  const chat33 = ({ foot, hov, more = '' }) => shell(chatPanel({ title: 'Design chat', sub: 'F-03 draft r7', ctxItems: [['frame', 'F-03 Variance table', 'r7 draft'], ['doc', 'DESIGN.md', 'r3'], ['req', 'R-DASH-014', 'r14']], ctxFoot: foot, ph: 'Ask for a change to F-03, or @ another frame…',
    msgs: `<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 41 s · 26 cr</em></div><p>Reviewed F-03: <b>7 changes</b> in draft r7.</p>${reviewCard(hov)}</div>${more}` }));
  const inspRev = insp({ title: 'F-03 Variance table', pillv: ['warn', 'Draft r7'], sub: 'Review of 7 changes · base r6 accepted', tabsv: [['Review', 1], ['Revisions'], ['Links']],
    body: `<div class="sp-sec"><h4>Revisions<span>2</span></h4><div class="rev-revs"><div class="rev-rv cur"><span class="id">r7</span><span class="nm">Draft · this review<small>7 changes · 1 stale · 12:51</small></span>${pill(['warn', 'Draft'])}</div><div class="rev-rv"><span class="id">r6</span><span class="nm">Accepted · base<small>Accepted 12:12 by Rina (sample)</small></span>${pill(['ok', 'Accepted'])}</div></div></div>
<div class="sp-sec"><h4>Spec impact<span>1 proposal</span></h4>${row('P-07', 'Spec proposal r14 to r15', 'From item 6 and chat · waits in S08', ['acc', 'Proposal'])}</div>
<div class="sp-ready"><div class="t">Accepting this review<span class="pill mute">F-03 only</span></div><p>Accept creates F-03 r7 from the changes you kept. Dismissed rows stay out and no other frame changes. Spec changes go through S08.</p>${btn('Open spec proposal', { cls: 'ink', sm: true, does: 'Opens S08 with proposal P-07 (r14 to r15); opening it accepts nothing', f: 'F249' })}</div>` });
  const cv33 = (o) => cv(frameAbs(f03({ val: AFTER, pins: PINS, ...o }), { rev: 'r7', st: ['warn', 'Draft · not accepted'] }), { tool: 'comment', ask: false, F: 'F241' });
  const mk33 = (o) => A33({ chat: chat33(o.chat), main: canvasMain({ tabsL: TABS(true), crumb: 'F-03 Variance table', cvHtml: o.cv, inspHtml: inspRev }) });
  const A33 = (o) => shell(app({ stage: 'design', save: ['ok', 'Saved 12:51'], ...o }));
  const tipH = `<div class="rev-tip" role="tooltip"><b>4 · Table header</b><span>${NITS[3].tip}</span><div class="ba"><s>${NITS[3].before}</s>${ic('chevR', 12)}<b>${NITS[3].after}</b></div></div>`;

  const w1 = mk33({ chat: { foot: 'F-03 draft r7 and the items listed', hov: 0, more: sugg(['Apply the header fix to F-04 (separate review)']) }, cv: cv33({ stale: 5 }) })
    + N('<b>Pins</b> are numbered markers on the frame, one per change, drawn on the part each change names. A dashed pin means the part changed after its nitpick.', 358, 668, 240)
    + N('<b>One review card per frame</b> sits in the chat: a row per change, named after its element. The footer counts what is left: 7 changes, 1 needs a look.', 612, 668, 240)
    + N('<b>Accept 6</b> creates F-03 r7 from the ready changes. Undo all puts all 7 back to r6 in one step. Hold O shows the original.', 866, 668, 240);
  const w2 = mk33({ chat: { foot: 'F-03 draft r7 and the items listed', hov: 4, more: sugg(['Apply the header fix to F-04 (separate review)']) }, cv: cv33({ stale: 5, hover: 4, x: { head: OUT + tipH } }) })
    + N('<b>Point at a row</b>: only its pin stays solid and the part is outlined. The other six pins fade, so one change is seen at a time. Moving away brings them back.', 358, 668, 240)
    + N('<b>Click a row</b> to keep it isolated until you click away. Keyboard: arrow keys move between rows and Enter isolates.', 612, 668, 240);
  const w3 = mk33({ chat: { foot: 'F-03 draft r7 and the items listed', hov: 'open' }, cv: cv33({ stale: 5, x: { f3: '<i class="rev-out ghost"></i><span class="rev-was">Nitpick saw ' + STALE.seen + '</span>' } }) })
    + N('<b>Stale row</b>: the part changed after this nitpick (6.28 became 5.95), so the row is shown as the part was. Accept 6 leaves it out.', 358, 668, 240)
    + N('<b>Re-check</b> judges the nitpick against the part as it is now. <b>Dismiss</b> drops the row; dismissing is not a pass (AC-57).', 612, 668, 240);


  // ---- S08 exact diff (Specification stage)
  const seg = (a) => a.map(([k, t]) => (k === 'eq' ? t : k === 'add' ? `<ins class="rev-ins">${t}</ins>` : `<del class="rev-del">${t}</del>`)).join('');
  const hunk = (h, mode) => {
    const ctl = mode === 'open' ? `<button type="button" class="rev-ck on" role="checkbox" aria-checked="true" aria-label="Include ${h.id}" data-does="Includes or leaves out hunk ${h.id}; Accept writes only the ticked hunks" data-feature="F249">${ic('check', 11, 3)}</button>` : '';
    const st = mode === 'accepted' ? pill(['ok', 'Accepted']) : mode === 'rejected' ? pill(['mute', 'Rejected']) : '';
    return `<section class="rev-hk${mode === 'rejected' ? ' off' : ''}" aria-label="Hunk ${h.id}"><div class="hh">${ctl}<b>${h.id}</b><span>${h.kind}</span><code>${h.ref}</code><span>${h.name}</span><span class="sp-fill"></span><span>${h.src}</span>${st}</div>
<div class="rev-ln o"><span class="g">r14</span><span>${h.old ? seg(h.old) : '<span class="none">Not in r14</span>'}</span></div>
<div class="rev-ln n"><span class="g">r15</span><span>${seg(h.now)}</span></div></section>`;
  };
  const bar08 = {
    open: `<div class="rev-ab"><div class="tx"><b>4 of 4 hunks included</b><span>Creates r15 from r14 · 3 items need review · 1 ticket · 1 audit entry</span></div><span class="sp-fill"></span>${rb('Reject', 'Rejects the proposal: no new revision, r14 stays current; one audit entry is recorded', 'F252')}${rb('Accept and create r15 ' + kbd('⌘↵'), 'Asks to confirm with Cancel as the default, then creates r15 from r14 with the included hunks and one audit entry', 'F251', 'ink')}</div>`,
    accepted: `<div class="rev-ab"><div class="tx"><b>r15 is the current spec</b><span>Parent r14 · ${PR.accepted.hunks} · snapshot ${PR.accepted.snapshot}</span></div><span class="sp-fill"></span>${rb('Revert as proposal', 'Starts a new proposal that restores r14. Nothing changes until that proposal is accepted', 'F251')}${rb('Open r15', 'Opens the spec document at r15', 'F251', 'ink')}</div>`,
    rejected: `<div class="rev-ab"><div class="tx"><b>r14 is still the current spec</b><span>Proposal P-07 is closed and kept for the record</span></div><span class="sp-fill"></span>${rb('Edit and re-propose', 'Reopens the text of P-07 as a new draft proposal on top of r14', 'F252')}${rb('Back to the spec', 'Opens the spec document at r14', 'F252', 'ink')}</div>`,
  };
  const banner08 = {
    open: `<div class="sp-banner warn" role="status">${ic('alert', 16)}<p><b>Proposal, not accepted.</b> The spec stays r14 until you accept. Base r14 is still the current revision.</p>${btn('Edit proposal', { sm: true, does: 'Edits the proposal text as a draft; the spec is unchanged', f: 'F249' })}</div>`,
    accepted: `<div class="rev-bn ok" role="status">${ic('check', 16)}<p><b>Accepted. r15 created from r14.</b> Audit A-0231 · 12:52 · 3 linked items now need review. r14 stays readable.</p>${btn('Open revisions', { sm: true, does: 'Opens the revision list with r15 on top and r14 below it', f: 'F251' })}</div>`,
    rejected: `<div class="rev-bn mute" role="status">${ic('x', 16)}<p><b>Rejected. r14 stays current.</b> No new revision was made. Audit A-0232 · 12:52.</p>${btn('Undo reject', { sm: true, does: 'Reopens P-07 for review if r14 is still the current revision; the audit entry stays', f: 'F252' })}</div>`,
  };
  const diffView = (mode) => `<div class="rev-dv"><div class="rev-dh"><div class="m">${mode === 'accepted' ? pill(['ok', 'Accepted r15']) : mode === 'rejected' ? pill(['mute', 'Rejected']) : pill(['acc', 'Proposal'])}<code>P-07</code><span>r14 to r15 · base r14 ${mode === 'accepted' ? 'accepted 12:52' : 'is the current revision'}</span><span>·</span><span>${PR.by}, ${PR.at}</span><span class="sp-fill"></span>${btn('Show unchanged (3)', { cls: 'plain', sm: true, does: 'Shows the 3 unchanged blocks around the hunks; they are never part of the diff', f: 'F249' })}</div><h2>${PR.title}</h2></div>
${PR.hunks.map((h) => hunk(h, mode)).join('')}${bar08[mode]}</div>`;
  const affRows = (st) => PR.affected.map((l) => row(l.id, l.t, l.sub, st === 'rejected' ? ['mute', 'Not changed'] : st === 'accepted' && l.id === 'T-219' ? ['ok', 'Added to S15'] : l.p)).join('');
  const inspDiff = (mode) => insp({ title: 'Proposal P-07', pillv: mode === 'accepted' ? ['ok', 'Accepted r15'] : mode === 'rejected' ? ['mute', 'Rejected'] : ['acc', 'Proposal'], sub: mode === 'open' ? 'Base r14 is current · by Spekin · 12:46' : mode === 'accepted' ? 'Accepted 12:52 by Rina (sample)' : 'Rejected 12:52 by Rina (sample)', tabsv: [['Links', 1], ['Sources'], ['Audit']],
    body: (mode === 'open'
      ? `<div class="sp-sec"><h4>Requirements<span>3</span></h4>${PR.links.map((l) => row(l.id, l.t, l.sub, l.p)).join('')}</div>
<div class="sp-sec"><h4>Tests, tasks and tickets<span>5</span></h4>${affRows('open')}</div>
<div class="sp-ready"><div class="t">If you accept<span class="pill acc">Scope: spec</span></div><p>Creates r15 and one audit entry. 3 linked items are marked Needs review and 1 ticket is proposed to S15. Frames, code and the plan do not change.</p></div>`
      : `<div class="sp-sec"><h4>Revisions<span>${mode === 'accepted' ? 2 : 1}</span></h4><div class="rev-revs">${mode === 'accepted' ? '<div class="rev-rv cur"><span class="id">r15</span><span class="nm">Current · from P-07<small>Parent r14 · 12:52</small></span>' + pill(['ok', 'Current']) + '</div>' : ''}<div class="rev-rv${mode === 'rejected' ? ' cur' : ''}"><span class="id">r14</span><span class="nm">${mode === 'accepted' ? 'Previous · evidence kept' : 'Current · unchanged'}<small>Accepted 11:58 by Rina (sample)</small></span>${pill(mode === 'accepted' ? ['mute', 'Readable'] : ['ok', 'Current'])}</div></div></div>
<div class="sp-sec"><h4>Linked items<span>5</span></h4>${affRows(mode)}</div>
<div class="sp-sec"><h4>Audit<span>1</span></h4><div class="rev-au"><code>${PR.audit[mode].id}</code><span>${PR.audit[mode].at} · Rina (sample)</span><span class="full">${PR.audit[mode].text}${mode === 'accepted' ? ' · snapshot ' + PR.accepted.snapshot : ''}</span></div></div>`) });
  const chat08 = (mode) => shell(chatPanel({ title: 'Specification chat', sub: 'proposal P-07', ctxItems: [['req', 'R-DASH-019', 'proposal'], ['req', 'R-DASH-014', 'r14'], ['frame', 'F-03 review', '7 changes']], ctxFoot: '3.2k tokens · requirements and the review only', ph: 'Ask about this proposal, or @ a requirement…',
    msgs: `<div class="sp-ub">Put the 2-period rule and the sign format from the F-03 review into the spec.</div>
<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 27 s · 14 cr</em></div><p>${mode === 'open' ? 'Prepared <b>proposal P-07</b>: 4 hunks. The spec stays r14 until you accept it.' : mode === 'accepted' ? '<b>P-07 is accepted.</b> r15 is the spec now. Linked items are marked Needs review.' : '<b>P-07 is rejected.</b> The spec is still r14. Nothing was written.'}</p>
<div class="sp-gg isnew" data-feature="F254">${NT}<div class="gh"><span>Proposal card · ${mode === 'open' ? 'pinned' : 'closed'}</span><button type="button" data-does="Shows the same card as a plain table (text fallback)" data-feature="F254">Show as table</button></div>
<div class="sp-gc prop"><div class="k">${ic('diff', 12)}Proposal<span class="tag">${pill(mode === 'accepted' ? ['ok', 'Accepted r15'] : mode === 'rejected' ? ['mute', 'Rejected'] : ['acc', 'Proposal'])}</span></div><div class="tt">P-07 · r14 to r15</div><div class="bd">2 requirements, 1 criterion, 1 ticket. ${mode === 'open' ? 'Pinning keeps it a proposal.' : mode === 'accepted' ? 'Audit A-0231 records it.' : 'Audit A-0232 records it.'}</div><div class="ft"><span class="s">${mode === 'open' ? 'Pinned · not accepted' : 'Closed'}</span>${btn('Open diff', { sm: true, cls: 'ink', does: 'Opens the exact diff of P-07 in the work area; the card itself accepts nothing', f: 'F254' })}</div></div></div></div>` }));
  const spec08 = (mode) => `<section class="sp-main" aria-label="Work area">
${tabs([['doc', 'Spec §3'], ['diff', mode === 'open' ? 'Proposal P-07 · r14 to r15' : 'P-07 · ' + mode, true], ['history', 'Revisions']], right)}
${toolRow('Compare', 'Specification' + ic('chevR', 12) + '<b>Proposal P-07</b>')}
${banner08[mode]}
<div class="sp-work">${diffView(mode)}${inspDiff(mode)}</div></section>`;
  const mk08 = (mode) => {
    let h = shell(app({ stage: 'spec', save: ['ok', 'Saved 12:52'], chat: chat08(mode), main: spec08(mode) }));
    if (mode === 'accepted') h = h.replace('<span class="r">r14</span>accepted', '<span class="r">r15</span>accepted').replace('Ready · r14', 'Ready · r15');
    return h;
  };
  const x1 = mk08('open')
    + N('<b>Accept</b> asks to confirm, with Cancel as the default. It creates exactly one revision, r15, whose parent is r14, plus one audit entry. Blocks outside the hunks are not rewritten (R-EDT-3).', 372, 736, 340)
    + N('<b>Untick a hunk</b> and Accept writes only the ticked ones. If r14 stops being current the proposal turns Stale and Accept is blocked until it is rebased (R-EDT-4).', 728, 736, 340);
  const x2 = mk08('accepted')
    + N('<b>Accept</b>: r15 shows in the top bar, the stage header and the revision list. 3 linked items are marked Needs review. r14 and its evidence stay readable (R-EDT-6).', 372, 736, 340)
    + N('<b>Audit</b>: one line records who, when, the parent, the hunks and the snapshot. It cannot be edited. Revert starts a new proposal, never a silent rollback (R-EDT-7).', 728, 736, 340);
  const x3 = mk08('rejected')
    + N('<b>Reject</b>: no revision is made. r14 stays current; the proposal is closed and one audit entry records who rejected it and when.', 372, 736, 340)
    + N('<b>Frames are separate</b>: rejecting P-07 leaves the F-03 r7 draft in S33 as it is. Edit and re-propose reopens the text.', 728, 736, 340);


  const s33 = {
    file: 'S33-review-accept', code: 'S33', tier: 'CHANGE', name: 'Review and accept: nitpick pins, stale items and the S08 exact diff',
    ext: 'New. Spekin has no built screen yet; the existing Hub Studio is not used as a baseline (owner, 22 Nov 2026). Frame review inside the S35 shell, then the canonical S08 proposal review. Baseline wireframe BW-07.',
    lives: 'Spekin web app · /p/meranti-yard/design?review=F-03 (frame review) and /p/meranti-yard/spec/proposals/P-07 (S08 diff). Revision IDs in the path, never draft text.',
    views: [
      { id: 'pins', label: 'Pins and review card', html: w1, entry: 'Projects &gt; Meranti Yard &gt; Design &gt; Variance flows &gt; ask the chat for a review of F-03; the review card appears in the reply and the pins on the frame.', data: 'sample/parts/review.mjs → REVIEW_NITS.' },
      { id: 'hover', label: 'Row hover isolates a pin', html: w2, entry: 'In the review card, point at row 4 (Table header).', data: 'sample/parts/review.mjs → REVIEW_NITS (n 4, tip, before, after).' },
      { id: 'stale', label: 'Stale item', html: w3, entry: 'Change the P-03 forecast with S32 after pin 5 was set; row 5 turns Stale. Open the card in the chat.', data: 'sample/parts/review.mjs → REVIEW_NITS (n 5: seen, now).' },
      { id: 'diff', label: 'S08 exact diff', html: x1, entry: 'Review card &gt; Inspector &gt; Open spec proposal (or the proposal card in the Specification chat &gt; Open diff).', data: 'sample/parts/review.mjs → REVIEW_PROPOSAL (hunks, links, affected).' },
      { id: 'accepted', label: 'Accepted: r15', html: x2, entry: 'In the S08 diff click Accept and create r15, then confirm (Cancel is the default).', data: 'sample/parts/review.mjs → REVIEW_PROPOSAL.audit.accepted, .accepted.' },
      { id: 'rejected', label: 'Rejected: r14 kept', html: x3, entry: 'In the S08 diff click Reject.', data: 'sample/parts/review.mjs → REVIEW_PROPOSAL.audit.rejected.' },
    ],
    side: {
      must: [
        'Nitpick pins are numbered markers on the frame, one per change, each on the part it names. A dashed pin marks a stale change.',
        'One review card per frame, in the chat: a row per change named after its element, with a check or a Stale chip.',
        'Pointing at a row isolates its pin and outlines the part. The other pins fade. Keyboard arrows and Enter do the same.',
        'The footer counts what is left: “7 changes · 1 needs a look”. Accept takes the ready changes; Undo all reverts the whole review in one step.',
        'A stale row (the part changed after the nitpick) cannot be accepted without re-evaluation. It offers Re-check and Dismiss, and dismissing is not a pass (AC-57).',
        'S08 shows the spec proposal r14 to r15 as an exact diff, per hunk, with sources, linked requirements, tests and the scope of the approval.',
        'Accept creates exactly one revision (r15, parent r14) and an audit entry. Reject creates no revision, keeps r14 and records one audit entry. Both stay visible afterwards.',
        'Pinning a proposal in chat leaves it a proposal. Only Accept in S08 writes the spec (R-GUI-4).',
      ],
      motion: [
        ['Pins', 'Appear with a 40 ms stagger and a 160 ms fade, ease cubic-bezier(0.23,1,0.32,1) (OpenDesign).'],
        ['Row hover', 'The other pins fade to 18% in 120 ms; the pointed pin grows from 20 to 24 px. Leaving restores both in 120 ms.'],
        ['Stale row', 'Expands in place, height 180 ms; focus stays on the row (R-GUI-3).'],
        ['Accept in S08', 'Hunks settle to Accepted with a 140 ms fade and r15 rises 8 px into the revision list. No spinner without real progress.'],
        ['Hold to compare', 'Instant on key down and on key up. No animation, so the frame never looks half-reviewed.'],
        ['Reduce Motion', 'Fades and rises become instant. Counts, Stale and Accepted are still announced.'],
      ],
      stories: [
        ['F241', 'new', 'Nitpick pins: numbered markers on the frame, one per change, each on the part it names; dashed when stale (R-WS-7, Paraframe parity FR-31 to FR-42).', 'Paraframe'],
        ['F242', 'new', 'One review card per frame in the chat: a row per change named after its element (R-WS-7, R-GUI-1).', 'Paraframe'],
        ['F243', 'new', 'Pointing at a row isolates its pin and outlines the part; arrows and Enter work without a pointer (R-CAN-7).', 'Paraframe'],
        ['F244', 'new', 'The footer counts what is left: “7 changes · 1 needs a look” (R-WS-7).', 'Paraframe'],
        ['F245', 'new', 'A stale row cannot be accepted without re-evaluation; Re-check and Dismiss stay available and dismissal is not a pass (R-WS-7, AC-57).', 'PRD'],
        ['F246', 'new', 'Whole-review Undo returns every change to the accepted revision in one step; a single row can be undone too (R-CAN-5).', 'Onlook'],
        ['F247', 'new', 'Hold to compare with the original and Accept N creates the next frame revision from the ready changes (R-CAN-5, R-WS-7).', 'PRD'],
        ['F248', 'new', 'Apply to other frames is a separate reviewed change set with each target listed (R-CAN-5).', 'Paraframe'],
        ['F249', 'new', 'S08 exact diff: word level, per-hunk include, base revision shown (R-EDT-2, R-GUI-4).', 'OpenDesign'],
        ['F250', 'new', 'Linked requirements, tests, tasks and sources, with what will be marked Needs review (R-EDT-6, R-GUI-4).', 'PRD'],
        ['F251', 'new', 'Accept creates exactly one revision, r15 with parent r14, and one audit entry; r14 and its evidence stay readable (R-EDT-3, R-PRI-2, R-EDT-9).', 'PRD'],
        ['F252', 'new', 'Reject keeps r14, writes nothing and records an audit entry; Edit and re-propose stays open (R-EDT-1).', 'PRD'],
        ['F253', 'new', 'Stale proposal guard: a proposal whose base is no longer current cannot be accepted until it is rebased (R-EDT-4, AC-11).', 'PRD'],
        ['F254', 'new', 'A pinned proposal in chat stays a proposal; the card never accepts; sources and approval scope show before any write (R-GUI-4, AC-50).', 'Momo'],
        ['F255', 'new', 'Follow-up tickets from a gap check sit in the same diff and join the ticket board only on accept (R-EVD-5, R-VER-11).', 'PRD'],
      ],
      where: '<span><b>Route:</b> <code>/p/:project/design?review=F-03</code> for the frame review and <code>/p/:project/spec/proposals/:id</code> for S08. Back and Forward restore the view and never accept or reject (R-WF-11).</span><span><b>UI (TS/React):</b> OpenDesign, Apache-2.0 at commit <code>e033aad</code>: comment panel and <code>preview_comments</code> anchors, the <code>__auto_diff_review</code> choice surface in <code>GenUISurfaceRenderer</code>, version panel with digest and parent. Onlook, Apache-2.0: <code>TouchedFiles</code> counts and the stale-edit clash banner. Momo (no licence): pattern only, <code>DocumentDiff</code> Before and After. Code reuse needs a NOTICE entry.</span><span><b>Core (Rust):</b> proposals and hunks, base revision check, one-revision accept, audit log, needs-review marking, snapshot hash (R-ARC-1, R-EDT-3).</span><span><b>Open for Enrico:</b> whether Accept needs a typed reason on Reject · hunk size, word or sentence · whether Accept 6 may also publish the F-03 r7 revision to the board at once.</span>',
    },
    refs: {
      note: 'OpenDesign (Apache-2.0) gives the pin-and-list pairing. Momo and Paraframe are behaviour only: no label, wording or asset is copied.',
      shots: [
        { img: 'od-comment-panel.png', cap: '<b>OpenDesign comments panel.</b> A numbered pin on the page and a list of comments, each with a tick. Spekin’s review card keeps the pin-and-row pairing.' },
        { img: 'od-comment-pin.png', cap: '<b>OpenDesign pinned comment.</b> The pin and the element outline show together. Spekin isolates one pin by pointing at its row.' },
        { img: 'od-studio-document.png', cap: '<b>OpenDesign document.</b> Self-check result and files from this turn under a reply. Spekin ends the review card with counts and Accept.' },
        { img: 'od-todo-progress.png', cap: '<b>OpenDesign checklist card.</b> Status per step inside the chat. The Stale chip and checks follow this row style.' },
        { img: 'momo-playground.png', cap: '<b>Momo (pattern only, no licence).</b> Before, After, Compare and Approve in one toolbar. Spekin’s S08 diff keeps Accept and Reject apart from the content.' },
        { img: 'od-studio-prototype.png', cap: '<b>OpenDesign Studio.</b> Chat on the left and the artifact on the right. S08 uses the same split with the diff as the artifact.' },
      ],
    },
  };
  return [s32, s33];
}
