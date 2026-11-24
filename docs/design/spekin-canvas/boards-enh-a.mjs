// S41 Enhance prompt. Owner: this file only (plus css/enh-a.css, sample/parts/enh-a.mjs). Separate canvas: node build-enhance.mjs.
// Owner request 24 Nov 2026: a sparkle button left of Send that rewrites the draft into a clearer prompt, reviewed before use.
export const tier = 'Enhance prompt';
export const order = 1;

export function boards(K) {
  const { S, ic, ib, btn, pill, note, NT, app, chatPanel, tabs, mini } = K;
  const SC = S.ENH_SHORTCUT, C = S.ENH_COST;
  const wc = (t) => t.trim().split(/\s+/).length;
  const plain = S.ENH_SEGS.map((s) => s[1]).join('').trim();
  const nOrig = wc(S.ENH_ORIGINAL), nNew = wc(plain);

  // sparkle drawn for this board: stroke glyph, big star plus small star
  const spark = (s = 15) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4l1.8 4.7L16.5 10.5l-4.7 1.8L10 17l-1.8-4.7L3.5 10.5l4.7-1.8z"/><path d="M18.5 3v4M16.5 5h4M18 15v3.5M16.25 16.75h3.5"/></svg>`;
  const tip = (html) => `<div class="enh-tip" style="right:6px;bottom:calc(100% + 9px)" role="tooltip">${html}</div>`;

  const sparkBtn = (mode) => {
    const does = 'Rewrites the draft into a clearer, fuller prompt for review; a small paid run, nothing is sent';
    if (mode === 'off') return `<button type="button" class="sp-ibtn enh-btn" aria-label="Enhance prompt" aria-disabled="true" title="Write a message first: there is nothing to enhance" data-does="${does}; disabled while the draft is empty or a run is in progress" data-feature="F531">${spark()}</button>`;
    if (mode === 'busy') return `<button type="button" class="sp-ibtn enh-btn" aria-label="Enhancing prompt" aria-busy="true" title="Enhancing, press Esc to cancel" data-does="Shows that the enhance run is in progress; the button is not pressable until it ends" data-feature="F532"><span class="enh-spin" aria-hidden="true"></span></button>`;
    return `<button type="button" class="sp-ibtn enh-btn" aria-label="Enhance prompt" title="Enhance prompt (${SC})" data-does="${does}; also ${SC}" data-feature="F531">${spark()}</button>`;
  };
  const model = `<button type="button" class="sp-model isnew" data-does="Opens the model source picker: Hosted, BYOK, Local agent (deferred); the enhance run is billed to the same source" data-feature="F539">${NT}<span class="src">${S.MODEL.source}</span>${S.MODEL.name}${ic('chev', 12)}</button>`;
  const send = (off) => `<button type="button" class="sp-send"${off ? ' aria-disabled="true"' : ''} aria-label="Send" data-does="Sends the message with exactly the listed context; a paid run reserves its maximum first. Enhance never sends for you" data-feature="F535">${ic('up', 15, 2)}</button>`;
  const row = (mode, sendOff) => `<div class="enh-row">${ib('plus', 'Attach a file', { does: 'Attaches a PNG, JPEG or WebP the user picked; nothing is read without a file choice', s: 15, sm: true, f: 'F114' })}${ib('at', 'Mention an artifact', { does: 'Inserts an artifact reference and adds it to the context list', s: 15, sm: true, f: 'F106' })}${model}<span class="enh-spacer"></span><span class="isnew" style="position:relative;display:inline-flex">${NT}${sparkBtn(mode)}</span>${send(sendOff)}</div>`;
  const metaIdle = `<div class="enh-meta"><span>Enhance <b>${C.est}</b></span><span>·</span><span>Send <b>${C.send}</b></span></div>`;

  const seg = (list, removable = true) => list.map(([k, t, id]) => k === 's'
    ? `<span class="s"><i>${id}</i>${t.trim()}${removable ? `<button type="button" aria-label="Remove assumption ${id}" data-does="Removes this assumption from the proposal; the sentence is deleted, nothing else changes" data-feature="F537">${ic('x', 11)}</button>` : ''}</span>`
    : `<span class="${k}">${t}</span>`).join('');
  const legend = `<div class="enh-legend"><span class="c"><i></i>Changed</span><span class="a"><i></i>Added from project</span><span class="s"><i></i>Assumption</span></div>`;

  // ---- the six composers
  const cEmpty = `<div class="sp-comp enh-comp"><div class="ta ph">Ask for a change to F-03, or @ another frame…</div>${tip(`Write a message first: there is nothing to enhance <kbd>${SC}</kbd>`)}${metaIdle}${row('off', true)}</div>`;
  const cReady = `<div class="sp-comp enh-comp"><div class="ta">${S.ENH_ORIGINAL}</div>${tip(`Enhance prompt <kbd>${SC}</kbd>`)}${metaIdle}${row('on', false)}</div>`;
  const cBusy = `<div class="sp-comp enh-comp"><div class="enh-lockrow">${ic('lock', 12)}Draft locked while Enhance runs</div><div class="ta lock">${S.ENH_ORIGINAL}</div>
<div class="enh-prog" role="status"><span class="enh-spin" aria-hidden="true"></span><span>Reading Design stage, spec r14, F-03, DESIGN.md r3, 2 decisions…</span>${btn('Cancel', { sm: true, does: 'Cancels the enhance run at once (Esc); the draft unlocks unchanged and a cancelled run is not charged beyond what already ran', f: 'F532' })}</div>
<div class="enh-bar" aria-hidden="true"><u></u></div>
<div class="enh-meta"><span>Reserved up to <b>${C.max}</b></span><span>·</span><span class="src">${S.MODEL.source}</span><span>${S.MODEL.name}</span></div>${row('busy', true)}</div>`;
  const cReview = `<div class="sp-comp enh-comp enh-prop"><div class="enh-ph">${spark(14)}Enhanced prompt${pill(['acc', 'Proposal'])}<span class="sp-fill"></span><span class="enh-meta">${nOrig} to ${nNew} words</span></div>
<div class="enh-txt">${seg(S.ENH_SEGS)}</div>${legend}
<div class="enh-meta"><span>Used <b>${C.actual}</b></span><span>·</span><span class="src">${S.MODEL.source}</span><span>${S.MODEL.name}</span><span>·</span><span>${C.time}</span></div>
<div class="enh-acts">${btn('Use', { cls: 'ink', sm: true, icon: 'check', does: 'Puts the enhanced text in the composer in place of your draft and keeps an Undo; it does not send', f: 'F535' })}${btn('Edit', { sm: true, does: 'Puts the enhanced text in the composer for hand editing; the original stays one Undo away', f: 'F535' })}${btn('Discard', { sm: true, cls: 'plain', does: 'Drops the proposal and returns your original draft unchanged; the spent credits are not refunded', f: 'F535' })}<span class="sp-fill"></span>${send(true)}</div></div>`;
  const cApplied = `<div class="sp-comp enh-comp"><div class="enh-chip">${spark(13)}<span>Enhanced</span><span class="t">${C.actual}</span><span class="sp-fill"></span><button type="button" data-does="Restores your exact original draft word for word and removes this chip; one step, not a history" data-feature="F536">${ic('undo', 12)}Undo enhance</button></div>
<div class="ta"><div class="enh-txt">${seg(S.ENH_SEGS.map(([k, t, id]) => [k === 's' ? 's' : 'k', t, id]))}</div></div>${metaIdle}${row('on', false)}</div>`;
  const cBlocked = `<div class="sp-comp enh-comp"><div class="enh-ban bad" role="alert">${ic('alert', 14).replace('class="ic"', 'class="ic ib"')}<div class="bx"><b>${S.ENH_BLOCKED[0][0]}</b><span>${S.ENH_BLOCKED[0][2]}</span><div class="acts">${btn('Open usage', { sm: true, does: 'Opens S36 usage: cap, reservations and remaining credits', f: 'F539' })}${btn('Use my own key', { sm: true, does: 'Opens the model source picker to switch the enhance run to a BYOK key', f: 'F539' })}</div></div></div>
<div class="ta">${S.ENH_ORIGINAL}</div><div class="enh-meta"><span>Enhance <b>blocked</b></span><span>·</span><span>Send <b>blocked</b></span></div>${row('off', true)}</div>`;

  // ---- chat panel with our composer swapped in for the kit's
  const chat = (comp) => {
    const h = chatPanel({ title: 'Design chat', sub: 'F-03 selected', ctxItems: S.CTX_DESIGN, ctxFoot: '≈ 9.8k tokens · the whole board is never sent', ph: '',
      msgs: `<div class="sp-ub">Show the variance table with the three packages that are over budget.</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 21 s · 17 cr</em></div><p>F-03 stays accepted at r6. Three packages are over budget this period.</p></div>` });
    const i = h.lastIndexOf('<div class="sp-comp">');
    return h.slice(0, i) + comp + '\n</aside>';
  };

  // ---- main work area (a quiet frame; the feature lives in the composer)
  const main = (extra = '') => `<section class="sp-main" aria-label="Work area">
${tabs([['grid', 'Variance flows'], ['frame', 'F-03 Variance table', true], ['frame', 'F-04 Alert drawer'], ['doc', 'DESIGN.md']], '')}
<div class="enh-crumb">Design${ic('chevR', 12)}<b>F-03 Variance table</b><span class="sp-fill"></span>${pill(['ok', 'Accepted r6'])}</div>
<div class="enh-stage"><div class="enh-fr"><div class="lab">${ic('frame', 13)}F-03 Variance table</div>${mini({ title: 'Variance', kpi: true, chart: false, table: true, rows: 4, h: 300 })}</div>${extra}</div></section>`;

  const sheet = `<div class="enh-sheet isnew" role="region" aria-label="Compare original and enhanced prompt" data-feature="F533">${NT}
<div class="enh-sh">${ic('diff', 15)}Compare<span>original and enhanced, changes marked</span><span class="sp-fill"></span>${btn('Hide', { sm: true, cls: 'plain', does: 'Hides this compare sheet; the proposal stays in the composer', f: 'F533' })}</div>
<div class="enh-cols"><div class="enh-col"><h5>Your draft<em>${nOrig} words</em></h5><div class="enh-txt">${seg(S.ENH_ORIG_SEGS)}</div><span class="enh-nots">Kept exactly as typed until you press Use. Bahasa Indonesia stays Bahasa Indonesia.</span></div>
<div class="enh-col"><h5>Enhanced<em>${nNew} words</em></h5><div class="enh-txt">${seg(S.ENH_SEGS, false)}</div>${legend}</div></div>
<div class="enh-used"><h5>Context it used · ${S.ENH_CTX.length} items</h5><div class="enh-ul">${S.ENH_CTX.map(([i, l, v]) => `<div class="enh-u">${ic(i, 13)}<div><b>${l}</b><span>${v}</span></div></div>`).join('')}</div><span class="enh-nots">${S.ENH_NOT_SENT} It adds no fact that is not in this project: new statements are either from the list above or marked as an assumption.</span></div>
<div class="enh-sf"><span>Nothing is sent. Use puts this text in your draft, then you press Send.</span><span class="sp-fill"></span>${btn('Change context', { sm: true, does: 'Opens the context list so an item can be removed and Enhance run again; spends a new run', f: 'F534' })}</div></div>`;

  const variants = `<div class="enh-var isnew" role="region" aria-label="Messages when Enhance cannot run" data-feature="F539">${NT}<h5>When Enhance cannot run</h5>${S.ENH_BLOCKED.map(([t, k, m, a], i) => `<div class="enh-vr"><b>${pill([k === 'bad' ? 'bad' : 'warn', i === 0 ? 'Now' : 'Also'])}${t}</b><p>${m}</p><div class="acts">${a.map((x) => btn(x, { sm: true, does: `${x}: the recovery action for the “${t}” message; the draft is never changed or sent`, f: 'F539' })).join('')}</div></div>`).join('')}</div>`;

  // ---- notes (absolute inside the window; free space in the work area)
  const N = (h, x, y, w = 300) => note(h, `left:${x}px;top:${y}px;max-width:${w}px`);
  const wrapApp = (comp, mainHtml, o = {}) => app({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat(comp), main: mainHtml, ...o });

  const vEmpty = wrapApp(cEmpty, main())
    + N('<b>Empty draft</b>: the sparkle button is visible but disabled, and the tooltip says why. It never hides, so the position left of Send stays stable.', 930, 150)
    + N('<b>Hover or focus</b> the button: the tooltip names the reason and the shortcut. Disabled also means the shortcut does nothing.', 930, 262)
    + N(`<b>Shortcut ${SC}</b>: not Ctrl/Cmd+I (italic in rich fields, Page Info in Firefox, mail in Safari). Check it against the S36 key map before build.`, 380, 660, 340);
  const vReady = wrapApp(cReady, main())
    + N('<b>Type a draft</b>: the button turns active the moment the draft has a non-space character. Send is unchanged.', 930, 150)
    + N(`<b>Click it or press ${SC}</b> with the cursor in the composer: Enhance starts. The estimate and the paying source sit above the buttons, same source as the model chip.`, 930, 262)
    + N('<b>Same context list</b> as Send uses. Enhance reads it and adds nothing to it.', 380, 660, 300);
  const vBusy = wrapApp(cBusy, main())
    + N('<b>Enhancing</b>: the button shows a spinner, the draft is locked and greyed, Send is off. The only live control is Cancel (or Esc).', 930, 150)
    + N('<b>Cancel</b>: the draft unlocks unchanged at once. A reserved maximum is released; only what already ran is charged.', 930, 262)
    + N('<b>Reduce Motion</b>: the spinner becomes a still ring and the status text says “Enhancing”. It is announced to screen readers.', 380, 660, 330);
  const vReview = wrapApp(cReview, main(sheet))
    + N('<b>Proposal ready</b>: your draft is replaced in place by the enhanced text. Changed words, added project facts and assumptions are marked by shape, not only colour.', 1090, 150, 320)
    + N('<b>Press the × on an assumption</b>: only that sentence is removed. Send stays off until you press Use, Edit or Discard.', 1090, 262, 320)
    + N('<b>Use, Edit, Discard</b>: nothing is sent by any of them. Esc means Discard.', 380, 690, 300);
  const vApplied = wrapApp(cApplied, main())
    + N('<b>Press Use</b>: the text is now your draft. The Undo chip shows the cost and one button that restores the exact original.', 930, 150)
    + N('<b>Press Send</b> yourself: Spekin sends the draft as it stands, with the context list. Assumptions you left in stay marked until sent.', 930, 262)
    + N('<b>Undo is one step</b> and stays until you type, send or open another chat. Typing keeps your edits and drops the chip.', 380, 660, 330);
  const capBar = (h) => h.replace('class="sp-meter isnew"', 'class="sp-meter isnew crit"').replace(/width:\d+%/, 'width:100%').replace(/<b>1,240<\/b>/, '<b>5,000</b>');
  const vCap = capBar(wrapApp(cBlocked, main(variants)))
    + N('<b>Cap reached</b>: Enhance is blocked, and the message says what, how much, and what to do. The draft and Send follow the same cap rule as a normal run.', 380, 590, 340)
    + N('<b>Offline or server error</b> use the same place and shape (right). Neither charges credits and neither changes the draft.', 380, 640, 330);

  return [{
    file: 'S41-enhance-prompt', code: 'S41', tier: 'ENHANCE', name: 'Enhance prompt',
    ext: 'New. The chat composer of S35 (F114) gains a sparkle button left of Send. Pattern reference: the Enhance prompt button in WorkBuddy’s composer (described, not copied).',
    lives: 'Spekin web app · the composer of every stage chat (/p/meranti-yard/design and the other stages); the proposal is local UI state, never in the route.',
    views: [
      { id: 'empty', label: 'Empty draft', html: vEmpty, entry: 'Projects > Meranti Yard > Design > chat composer with no text.', data: 'sample/parts/enh-a.mjs → ENH_SHORTCUT, ENH_COST; sample/meranti-yard.mjs → MODEL, CTX_DESIGN.' },
      { id: 'ready', label: 'Draft ready', html: vReady, entry: 'Design > chat composer > type a message.', data: 'sample/parts/enh-a.mjs → ENH_ORIGINAL, ENH_COST.' },
      { id: 'busy', label: 'Enhancing', html: vBusy, entry: 'Draft ready > click Enhance prompt or press Ctrl/Cmd+Shift+E.', data: 'sample/parts/enh-a.mjs → ENH_ORIGINAL, ENH_COST.max.' },
      { id: 'review', label: 'Review proposal', html: vReview, entry: 'Enhancing > the run finishes (about 2 s).', data: 'sample/parts/enh-a.mjs → ENH_SEGS, ENH_ORIG_SEGS, ENH_CTX, ENH_NOT_SENT, ENH_COST.' },
      { id: 'applied', label: 'Applied with Undo', html: vApplied, entry: 'Review proposal > Use.', data: 'sample/parts/enh-a.mjs → ENH_SEGS, ENH_COST.actual.' },
      { id: 'blocked', label: 'Cap reached', html: vCap, entry: 'Draft ready > Enhance while the month’s credits are used up (offline and server error look the same).', data: 'sample/parts/enh-a.mjs → ENH_BLOCKED; sample/meranti-yard.mjs → USAGE.' },
    ],
    side: {
      must: [
        'A sparkle button directly left of Send, with the tooltip “Enhance prompt” and its shortcut. It is disabled, with the reason, when the draft is empty.',
        'While it runs: spinner in the button, draft locked, Send off, Cancel and Esc work, nothing else moves.',
        'The result replaces the draft as a proposal, never as a silent rewrite: your original and the enhanced text side by side, with changed words, added project facts and assumptions marked.',
        'The context it read is listed (stage, spec revision, selected frame, artifact, requirement, decision log) and what it did not read is stated.',
        'Use, Edit and Discard never send. After Use, one Undo chip restores your exact original.',
        'It adds no fact that is not in the project. Anything it guessed is an assumption, numbered, and removable. It answers in the language you wrote.',
        'The cost is shown before and after, billed to the same source as the model chip; the cap, offline and server-error cases block with a clear message and leave the draft alone.',
      ],
      motion: [
        ['Button to busy', 'Sparkle swaps to the spinner in 120 ms fade; the ring turns 800 ms linear.'],
        ['Draft lock', 'Draft greys over 140 ms; unlock is instant on Cancel.'],
        ['Proposal in', 'The proposal replaces the draft with a 180 ms cross-fade, spring-ui cubic-bezier(.25,1,.5,1); the compare sheet slides 8 px up over 220 ms.'],
        ['Undo chip', 'Fades in 140 ms; removed instantly when you type.'],
        ['Reduce Motion', 'The ring is still, swaps are instant, status is announced as text.'],
      ],
      stories: [
        ['F531', 'new', 'Sparkle button left of Send, tooltip “Enhance prompt”, shortcut Ctrl/Cmd+Shift+E, disabled with a reason on an empty draft (owner request, 24 Nov 2026; F114 composer).', 'PRD'],
        ['F532', 'new', 'Enhancing state: spinner in the button, draft locked, Send off, Cancel or Esc stops it without charge for unfinished work (owner request; R-MOD-3 before a model run).', 'PRD'],
        ['F533', 'new', 'Proposal replaces the draft in place, with a compare sheet of original against enhanced and the changes marked (owner request; S33 diff marks).', 'OpenDesign'],
        ['F534', 'new', 'Context used is listed: stage, spec revision, selected frame, artifact, requirement, decision log; what was not read is said (R-CAN-4).', 'PRD'],
        ['F535', 'new', 'Use, Edit, Discard: none of them sends; the user still presses Send (owner request, 24 Nov 2026).', 'PRD'],
        ['F536', 'new', 'After Use an Undo chip restores the exact original draft, one step (owner request).', 'PRD'],
        ['F537', 'new', 'No invented facts: new statements come from the context list or are numbered assumptions the user can remove (owner request; R-CAN-4 exact context).', 'PRD'],
        ['F538', 'new', 'The enhanced text keeps the language of the draft, Bahasa Indonesia or English, whatever the UI language (R-LANG-2).', 'PRD'],
        ['F539', 'new', 'Estimate and actual cost shown, billed to the model chip’s source; blocked with a clear message at the cap, offline or on a server error (R-MOD-1, R-MOD-3).', 'PRD'],
      ],
      where: '<span><b>Route:</b> none of its own. The composer is part of every stage chat; the proposal is local state and never in the URL or the saved draft until you press Use.</span><span><b>UI (TS/React):</b> extends the S35 composer (F114). The compare sheet reuses the S33 diff marks. OpenDesign ChatPane patterns, Apache-2.0, cite in NOTICE if code is reused. WorkBuddy’s button is a behaviour reference only: no copy, no assets.</span><span><b>Core (Rust):</b> builds the context list, reserves the run maximum, checks the cap, records the run in the usage ledger, and rejects an answer that names an ID not in the project.</span><span><b>Open for Enrico:</b> shortcut Ctrl/Cmd+Shift+E · which model runs it (the chip’s model or a smaller one on the same source) · whether Undo should survive a reload · whether Enhance may be switched off per project.</span>',
    },
    refs: {
      note: 'Spekin copies no brand, copy or assets. The WorkBuddy Enhance prompt button is described from the owner’s request; no screenshot of it is in the clean-room folder.',
      shots: [
        { img: 'od-studio-prototype.png', cap: '<b>OpenDesign Studio.</b> The composer row at the bottom of the chat. The sparkle button sits in this row, left of Send.' },
        { img: 'od-studio-document.png', cap: '<b>OpenDesign chat.</b> Replies carry cards and next-step suggestions. The proposal card follows this “reviewable result inside the chat” idea.' },
      ],
    },
  }];
}
