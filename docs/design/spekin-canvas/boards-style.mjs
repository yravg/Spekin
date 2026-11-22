// S30 Style review (BW-04) and S38 Contextual GenUI panel. Owner: this file only (group: style). All stories are NEW:
// Spekin has no built screen yet (owner 2026-11-22: OpenDesign is the primary reference, Hub Studio is not the baseline).
export const tier = 'Style and contextual GenUI';
export const order = 3;

export function boards(K) {
  const { S, ic, ib, btn, pill, note, NT, app, chatPanel, tabs, insp, mini } = K;
  const TOK = S.STYLE_TOKENS;
  const ST = { ok: ['ok', 'check', 'Accepted'], inf: ['inf', 'spark', 'Inferred'], cf: ['bad', 'alert', 'Conflict'] };
  const sp = (s, label) => { const [tone, icon, text] = ST[s]; return `<span class="pill ${tone}">${ic(icon, 10, 2.2)}${label || text}</span>`; };
  const kbd = (k) => `<kbd class="sty-kbd">${k}</kbd>`;
  const off = (label, why, f, o = {}) => `<button type="button" class="sp-btn ${o.cls || 'ghost'}${o.sm ? ' sm' : ''}" disabled data-does="${why}" data-feature="${f}" title="${why}">${o.icon ? ic(o.icon, 14) : ''}${label}</button>`;
  const tabR = (f) => btn('Share', { icon: 'share', later: 'Share and comment links (deferred in the browser MVP, R-WS-3)' }) + btn('Hand off', { cls: 'ink', icon: 'download', does: 'Opens S34: downloads only accepted revisions with a fixed revision manifest', f });

  // ---------------------------------------------------------------- S30 data per mode
  // review and conflict show the learned draft; accepted shows it after S08 accepted proposal P-021 (DESIGN.md r4).
  const tokens = (mode) => TOK.map((t) => {
    const o = { ...t, rev: 'r3' };
    if (mode === 'accepted') {
      if (o.st === 'inf' && o.id !== 'space.half') { o.st = 'ok'; o.rev = 'r4'; }
      if (o.id === 'color.accent') { o.st = 'ok'; o.kept = true; delete o.alt; }
      if (o.id === 'radius.card') { o.st = 'ok'; o.rev = 'r4'; o.spec = o.alt.spec; o.r = o.alt.r; delete o.alt; }
    }
    return o;
  });
  const count = (T) => ({ ok: T.filter((t) => t.st === 'ok').length, inf: T.filter((t) => t.st === 'inf').length, cf: T.filter((t) => t.st === 'cf').length, all: T.length });
  const C0 = count(tokens('review'));
  const C4 = count(tokens('accepted'));

  // ---------------------------------------------------------------- S30 rows
  const meta = (t) => (t.st === 'ok' ? (t.kept ? 'confirmed r3 kept' : t.rev) : `${t.refs.join(' + ')} · ${t.seen}`);
  let ACT = true;
  const actions = (t) => (!ACT ? '' : t.st === 'inf'
    ? ib('check', `Accept ${t.name}`, { does: 'Accepts this token into the style draft; the spec stays unchanged until you promote', sm: true, f: 'F186' }) + ib('x', `Dismiss ${t.name}`, { does: 'Dismisses this inferred token; a later reference may infer it again', sm: true, f: 'F186' })
    : t.st === 'cf' ? btn('Resolve', { sm: true, cls: 'ink', does: 'Opens the conflict card: keep the confirmed token or propose the inferred one', f: 'F187' }) : '');
  const colorRow = (t, sel) => {
    const sw = t.st === 'cf' ? `<span class="sty-c split" style="--a:${t.v.css};--b:${t.alt.css}"></span>` : `<span class="sty-c" style="--c:${t.v.css}"></span>`;
    const small = t.st === 'cf' ? `<code>${t.v.hex}</code> vs <code>${t.alt.hex}</code>` : `<code>${t.v.hex}</code> · ${meta(t)}`;
    return `<div class="sty-tk${sel ? ' sel' : ''}" data-token="${t.id}">${sw}<span class="nm"><b>${t.name}</b><small>${small}</small></span>${sp(t.st)}<span class="act">${actions(t)}</span></div>`;
  };
  const typeRow = (t) => `<div class="sty-tk ty" data-token="${t.id}"><span class="aa ${t.cls}">Aa</span><span class="nm"><b>${t.name}</b><small>${t.spec}</small></span>${sp(t.st)}<span class="act">${actions(t)}</span></div>`;
  const sampleOf = (t) => (t.bars ? `<span class="sty-bars">${t.bars.map((b) => `<i style="height:${Math.max(3, Math.round(b * 0.65))}px"></i>`).join('')}</span>`
    : t.r != null ? `<span class="sty-rs" style="border-radius:${Math.min(t.r, 11)}px"></span>`
      : t.id === 'icon.style' ? ic('grid', 20, 1.5) : '<span></span>');
  const plainRow = (t, sel) => `<div class="sty-tk${sel ? ' sel' : ''}" data-token="${t.id}">${sampleOf(t)}<span class="nm"><b>${t.name}</b><small>${t.st === 'cf' ? `${t.spec} vs ${t.alt.spec}` : `${t.spec} · ${meta(t)}`}</small></span>${sp(t.st)}<span class="act">${actions(t)}</span></div>`;
  const skRow = (name, w) => `<div class="sty-sk-row"><span class="sty-sk sq"></span><span class="tx"><span class="nmg">${name}</span><span class="sty-sk" style="width:${w}%"></span></span><span class="sty-sk pl62"></span></div>`;
  const mod = (title, n, body, o = {}) => `<section class="sty-mod" aria-label="${title}"${o.busy ? ' aria-busy="true"' : ''}><div class="sty-mh${o.collapsed ? ' nb' : ''}"><b>${title}</b><span class="n">${n}</span><span class="sp-fill"></span>${o.collapsed ? ib('chevR', `Expand ${title}`, { does: `Expands the ${title} module`, sm: true, f: 'F184' }) : ib('chev', `Collapse ${title}`, { does: `Collapses the ${title} module; the draft is unchanged`, sm: true, f: 'F184' })}</div>${o.collapsed ? '' : `<div class="sty-mb">${body}</div>`}</section>`;
  const wait = (text) => `<div class="sty-wait" role="status">${text}</div>`;
  const cover = (T, o = {}) => `<section class="sty-mod sty-cover" aria-label="Style cover"${o.busy ? ' aria-busy="true"' : ''}><span class="aa">Aa</span><span class="tt">${o.busy ? `<b class="sty-ghost">Learning a style…</b><small>Colours found so far, from 2 references</small>` : `<b>Meranti Yard style</b><small>${o.small}</small>`}</span><span class="sty-strip" aria-label="Colour strip">${T.filter((t) => t.g === 'color').map((t) => `<i style="--c:${t.v.css}"></i>`).join('')}</span>${o.pill ? pill(o.pill) : ''}</section>`;
  const cmpCell = (t, sample) => `<div class="sty-cmp1${t.st === 'inf' ? ' inf' : ''}" data-token="${t.id}"><span>${sample}</span><span class="cap1">${t.short}<span class="sp-fill"></span>${sp(t.st)}</span></div>`;
  const comps = (T, collapsed) => {
    const g = (id) => T.find((t) => t.id === id);
    const cells = [
      cmpCell({ ...g('cmp.button'), short: 'Button' }, '<span class="sp-btn ink sm">Save</span> <span class="sp-btn ghost sm">Cancel</span>'),
      cmpCell({ ...g('cmp.input'), short: 'Input' }, '<span class="sty-in">Search packages</span>'),
      cmpCell({ ...g('cmp.pill'), short: 'Status' }, '<span class="pill ok">On track</span> <span class="pill warn">Review</span>'),
      cmpCell({ ...g('cmp.toggle'), short: 'Toggle' }, '<span class="sty-tg"></span>'),
      cmpCell({ ...g('cmp.table'), short: 'Table' }, '<span class="sty-tb"><span>P-01 <b>+5.6%</b></span><span>P-02 <b>+0.7%</b></span></span>'),
    ];
    return mod('Sample controls', `${T.filter((t) => t.g === 'cmp').length} components${collapsed ? ' · collapsed' : ''}`, `<div class="sty-cmps">${cells.join('')}</div>`, { collapsed });
  };

  // the Visual tab: a module stack after OpenDesign DesignKitView (cover, palette, type, components), plus shapes and icons
  const visual = (mode, o = {}) => {
    ACT = mode !== 'learning';
    const T = tokens(mode);
    const by = (g) => T.filter((t) => t.g === g);
    const pal = by('color').map((t) => colorRow(t, o.sel === t.id));
    if (mode === 'accepted') pal.push(colorRow({ ...S.STYLE_NEWTOKEN }));
    const cnt = (list) => `${list.length} tokens`;
    const lc = count(T);
    if (mode === 'learning') {
      return `<div class="sty-stack isnew" data-feature="F184" aria-label="Learned style">${NT}${cover(T, { busy: true })}
<div class="sty-cols"><div class="sty-col">${mod('Palette', '9 tokens · from both references', pal.join(''))}${mod('Spacing', 'waiting', wait('Waits for the type step'))}</div>
<div class="sty-col">${mod('Type', 'writing · 3 of 6 names known', ['Display', 'Title', 'Heading', 'Body', 'Caption', 'Figures'].map((n, i) => skRow(n, 70 - i * 8)).join(''), { busy: true })}${mod('Radii and icons', 'waiting', wait('Waits for the type step'))}</div></div>
${mod('Sample controls', 'waiting', wait('Controls are written last, from the finished tokens'))}</div>`;
    }
    const cvSmall = mode === 'accepted' ? 'DESIGN.md r4 · accepted 12:58 by Rina (sample)' : 'Learned from REF-02 and REF-03 · draft on DESIGN.md r3';
    return `<div class="sty-stack isnew" data-feature="F184" aria-label="Learned style">${NT}${cover(T, { small: cvSmall, pill: mode === 'accepted' ? ['ok', 'In the spec · r4'] : ['mute', 'Draft · not in the spec'] })}
<div class="sty-cols"><div class="sty-col">${mod('Palette', cnt(pal), pal.join(''))}${mod('Spacing', cnt(by('space')), by('space').map((t) => plainRow(t)).join(''))}</div>
<div class="sty-col">${mod('Type', cnt(by('type')), by('type').map(typeRow).join(''))}${mod('Radii and icons', `${by('radius').length + by('icon').length} tokens`, [...by('radius'), ...by('icon')].map((t) => plainRow(t, o.sel === t.id)).join(''))}</div></div>
${comps(T, mode === 'accepted')}</div>`;
  };

  // ---------------------------------------------------------------- S30 bars
  const srcBar = (status) => `<div class="sty-bar" aria-label="Style source">
<div class="sp-seg isnew" role="group" aria-label="Style source" data-feature="F181">${NT}<button type="button" aria-pressed="true" data-does="Uses the style learned from the imported references" data-feature="F181">${ic('spark', 14)}Learned from references</button><button type="button" aria-pressed="false" data-does="Designs with no learned style: only the yravg default tokens from DESIGN.md apply" data-feature="F181">${ic('x', 14)}No style</button><button type="button" aria-pressed="false" data-does="Opens the list of saved styles of this project (2) to apply one" data-feature="F181">${ic('layers', 14)}Saved styles<span class="sty-kbd">2</span></button></div>
<span class="sp-fill"></span>
<div class="isnew sty-kl" data-feature="F182">${NT}<button type="button" class="sty-sw" role="switch" aria-checked="true" data-does="When on, every new reference adds Inferred tokens to this style; nothing confirmed is replaced" data-feature="F182"><span class="tr"><i></i></span>Keep learning from new references</button>${status}</div></div>`;
  const stOk = (t) => `<span class="sty-st">${ic('check', 12, 2.4)}${t}</span>`;
  const stBusy = (t) => `<span class="sty-st busy"><span class="sty-spin"></span>${t}</span>`;
  const filt = (C, cur = 'all') => `<div class="sty-flt" role="group" aria-label="Filter tokens">${[['all', 'All', C.all], ['ok', 'Accepted', C.ok], ['inf', 'Inferred', C.inf], ['cf', 'Conflict', C.cf]].map(([k, l, n]) => `<button type="button" aria-pressed="${k === cur}" data-does="Shows only ${l.toLowerCase()} tokens in the module stack" data-feature="F185">${l} <b>${n}</b></button>`).join('')}</div>`;
  const modeBar = (mdTab, C, right, cur) => `<div class="sty-bar b2"><div class="sty-mt isnew" role="tablist" aria-label="Style view" data-feature="F184">${NT}<button type="button" role="tab" aria-selected="${!mdTab}" data-does="Shows the visual summary: colours, type, spacing, radii, icons, sample controls" data-feature="F184">${ic('grid', 14)}Visual</button><button type="button" role="tab" aria-selected="${!!mdTab}" data-does="Shows DESIGN.md as editable Markdown; it is the same draft as the Visual tab" data-feature="F188">${ic('doc', 14)}Markdown</button></div>${filt(C, cur)}<span class="sp-fill"></span>${right}</div>`;
  const promoBtn = btn('Promote to spec', { cls: 'ink', icon: 'diff', does: 'Opens the diff proposal for DESIGN.md r3 to r4; nothing is written until you accept it in S08', f: 'F189' });
  const acceptAll = (n) => btn(`Accept ${n} inferred`, { icon: 'check', does: 'Accepts every Inferred token into the style draft (not the spec); conflicts stay open', f: 'F186' });
  const hintAX = `<span class="sty-hint">${kbd('A')} accept ${kbd('X')} dismiss</span>`;

  // ---------------------------------------------------------------- S30 inspector bodies
  const thumb = (a) => `<span class="sty-th" aria-hidden="true"><u class="${a}"></u><u class="s"></u><u class="s"></u><u></u></span>`;
  const refCard = (r, mode) => {
    const done = mode !== 'learning' || r.id === 'REF-02';
    const n = TOK.filter((t) => t.refs.includes(r.id)).length;
    const line = done ? `${ic('check', 11, 2.4)} Read in full · ${n} tokens seen` : `Step ${r.at_step} of ${r.steps} · ${S.STYLE_STEPS[r.at_step - 1]}`;
    const steps = done ? '' : `<span class="sty-steps" role="img" aria-label="${done ? 5 : r.at_step - 1} of 5 steps done">${[1, 2, 3, 4, 5].map((i) => `<i class="${done || i < r.at_step ? 'd' : i === r.at_step ? 'a' : ''}"></i>`).join('')}</span>`;
    return `<div class="sty-ref">${thumb(r.id === 'REF-02' ? 'g' : 'a')}<div><div class="t">${r.name}<span>${r.id}</span><span class="sp-fill"></span>${ib('link', `Open ${r.id} in S28`, { does: 'Opens this reference in S28 to see the original image and its crop', sm: true, f: 'F193' })}</div><small>${r.kind} · ${r.at}</small><small>${line}</small>${steps}</div></div>`;
  };
  const refsBody = (mode) => {
    const T = tokens(mode === 'learning' ? 'review' : mode);
    const C = count(T);
    const stateBlock = mode === 'learning' || mode === 'accepted' ? ''
      : `<div class="sp-sec"><h4>Token states<span>${C.all} tokens</span></h4><div class="sty-cnt" role="img" aria-label="${C.ok} accepted, ${C.inf} inferred, ${C.cf} conflict"><i class="ok" style="flex:${C.ok}"></i><i class="inf" style="flex:${C.inf}"></i>${C.cf ? `<i class="cf" style="flex:${C.cf}"></i>` : ''}</div><div class="sty-lg"><span>Accepted <b>${C.ok}</b></span><span>Inferred <b>${C.inf}</b></span><span>Conflict <b>${C.cf}</b></span></div></div>`;
    const job = mode === 'learning' ? `<div class="sp-sec"><h4>Learning job<span>real telemetry</span></h4><div class="sty-rule">${ic('spark', 14)}<span>Sonnet 5.5 · Hosted · 6.1k tokens · 41 s so far · 9 credits reserved. Stop keeps what was read as a draft.</span></div>${btn('Stop learning', { sm: true, does: 'Stops the job; tokens already read stay as an Inferred draft, nothing is accepted', f: 'F183' })}</div>` : '';
    const extra = mode === 'accepted' ? `<div class="sty-ref"><span class="sty-th" aria-hidden="true"><u class="a"></u><u class="s"></u><u class="s"></u><u></u></span><div><div class="t">${S.STYLE_NEWREF.name}<span>${S.STYLE_NEWREF.id}</span></div><small>${S.STYLE_NEWREF.kind} · ${S.STYLE_NEWREF.at}</small><small>${ic('spark', 11, 2.2)} 1 new Inferred token · r4 unchanged</small></div></div>` : '';
    return `<div class="sp-sec"><h4>References<span>${mode === 'accepted' ? 3 : 2}</span></h4>${S.STYLE_REFS.map((r) => refCard(r, mode)).join('')}${extra}</div>
${job}${stateBlock}${mode === 'review' ? `<div class="sty-rule sty-pad6">${ic('lock', 14)}<span>Inferred tokens stay drafts. They never replace a confirmed token, and the spec changes only when S08 accepts a proposal.</span></div>` : ''}`;
  };
  const inspS30 = (mode, body, pillv, sub, tabsv) => insp({ title: 'Style references', pillv: pillv || ['mute', '2 references'], sub: sub || 'Images you imported in S28. They stay in this project.', tabsv: tabsv || [['References', 1], ['Tokens'], ['History']], body: body || refsBody(mode) });

  // ---------------------------------------------------------------- S30 chat
  const ctx30 = S.STYLE_CTX;
  const chat30 = (msgs, foot) => chatPanel({ title: 'Design chat', sub: 'Style', ctxItems: ctx30, ctxFoot: foot || '≈ 3.2k tokens · images go to the model only while listed', ph: 'Ask about a token, or paste a style guide…', msgs });
  const ai = (txt, extra = '', meta = 'Sonnet 5.5 · 41 s · 9 cr') => `<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>${meta}</em></div><p>${txt}</p>${extra}</div>`;
  const sugg = (list) => `<div class="sp-sugg">${list.map(([t, does, f]) => `<button type="button" data-does="${does}" data-feature="${f}">${ic('spark', 13)}${t}</button>`).join('')}</div>`;

  const tabs30 = (dirty) => tabs([['grid', 'Variance flows'], ['frame', 'F-03 Variance table'], ['doc', 'DESIGN.md', false, dirty], ['layers', 'Style · learned', true]], tabR('F195'));
  const main30 = ({ banner = '', srcStatus, modeB, work }) => `<section class="sp-main" aria-label="Style review">
${tabs30(false)}${srcBar(srcStatus)}${modeB}${banner}<div class="sp-work">${work}</div></section>`;


  // ---------------------------------------------------------------- S30 views
  // 1 Learning: per-block reveal; one block is a skeleton built from the names already known
  const palOnly = count(TOK.filter((t) => t.g === 'color'));
  const learnTodo = `<div class="sp-gc" aria-busy="true"><div class="k">${ic('spark', 12)}Learning style<span class="tag">${pill(['mute', 'Job 1 of 1'])}</span></div>
<div class="sp-ck"><div><span class="bx on">${ic('check', 10, 3)}</span><span>REF-02 · all 5 steps</span>${pill(['ok', 'Done'])}</div><div><span class="bx"></span><span>REF-03 · Find type, step 3 of 5</span>${pill(['mute', 'Reading'])}</div><div><span class="bx"></span><span>Write the DESIGN.md draft</span>${pill(['mute', 'Waiting'])}</div></div>
<div class="ft"><span class="s">Learning accepts nothing. It only proposes.</span></div></div>
<div class="sty-run" role="status">${'<span class="sty-spin"></span>'}<b>Learning style</b><span class="mono">6.1k tokens · 41 s</span><span class="sp-fill"></span>${btn('Stop', { sm: true, cls: 'plain', does: 'Stops the job; what was read stays as an Inferred draft', f: 'F183' })}</div>`;
  const learnMsgs = `<div class="sp-ub">Learn the style from my two references.</div>${ai('Reading REF-02 and REF-03. Design requests wait until the style is ready, so every new frame uses it.', learnTodo, 'Sonnet 5.5 · 41 s so far')}`;
  const vLearning = app({ stage: 'design', save: ['ok', 'Saved 12:34'], chat: chat30(learnMsgs), main: main30({
    srcStatus: stBusy('Learning · 1 of 2 references'),
    modeB: modeBar(false, palOnly, off('Accept inferred', 'Available when learning ends, so you review the whole draft once', 'F186') + off('Promote to spec', 'Available after you review the learned tokens', 'F189', { cls: 'ink', icon: 'diff' }), 'all'),
    banner: `<div class="sp-banner sty-info" role="status">${ic('spark', 16)}<p><b>Style is still learning.</b> New designs wait until it ends, so they use the finished style. Chat, frames and review keep working.</p></div>`,
    work: visual('learning') + inspS30('learning'),
  }) });

  // 2 Visual review: inferred tokens to accept
  const sumCard = `<div class="sp-gc"><div class="k">${ic('layers', 12)}Style summary<span class="tag">${pill(['mute', 'Draft'])}</span></div><div class="tt">${C0.all} tokens from 2 references</div>
<div class="sty-cnt" role="img" aria-label="${C0.ok} accepted, ${C0.inf} inferred, ${C0.cf} conflict"><i class="ok" style="flex:${C0.ok}"></i><i class="inf" style="flex:${C0.inf}"></i><i class="cf" style="flex:${C0.cf}"></i></div>
<div class="sty-lg"><span>Accepted <b>${C0.ok}</b></span><span>Inferred <b>${C0.inf}</b></span><span>Conflict <b>${C0.cf}</b></span></div>
<div class="ft"><span class="s">Source: REF-02, REF-03</span>${btn('Review new', { sm: true, cls: 'ink', does: 'Filters the module stack to the Inferred tokens', f: 'F185' })}</div></div>`;
  const revMsgs = `<div class="sp-ub">Learn the style from my two references.</div>${ai(`Done. ${C0.ok} tokens match DESIGN.md r3, ${C0.inf} are new and ${C0.cf} differ from what is confirmed. Nothing is accepted yet.`, sumCard)}
${sugg([['Accept the 3 new colours', 'Puts this prompt in the composer; nothing runs until Send', 'F186'], ['Show where Table band came from', 'Puts this prompt in the composer; nothing runs until Send', 'F193']])}`;
  const vReview = app({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat30(revMsgs), main: main30({
    srcStatus: stOk('Up to date with 2 references'),
    modeB: modeBar(false, C0, hintAX + acceptAll(C0.inf) + promoBtn, 'all'),
    work: visual('review') + inspS30('review'),
  }) });

  // 3 Conflict: inferred against confirmed
  const A = TOK.find((t) => t.id === 'color.accent');
  const cr = (h) => S.STYLE_contrast(h, '#FFFFFF');
  const conflictBody = `<div class="sp-sec"><h4>Conflict 1 of 2<span>Accent colour</span></h4>
<div class="sty-cmpd isnew" data-feature="F187">${NT}<div class="sty-pk pick"><div class="lb">Confirmed<span>r3</span></div><span class="big" style="--c:${A.v.css}"></span><div class="vv">Clay <code>${A.v.hex}</code></div><span><span class="sp-btn ink sm sty-sbtn" style="--c:${A.v.css}">Save</span></span><div class="cr">White text ${cr(A.v.hex)}:1</div></div>
<div class="sty-pk"><div class="lb">Inferred<span>REF-03</span></div><span class="big" style="--c:${A.alt.css}"></span><div class="vv">Forest <code>${A.alt.hex}</code></div><span><span class="sp-btn ink sm sty-sbtn" style="--c:${A.alt.css}">Save</span></span><div class="cr">White text ${cr(A.alt.hex)}:1 · 6 elements</div></div></div>
<div class="sty-rule">${ic('lock', 14)}<span>Until you decide, r3 stays in force. The inferred value is not used by any design.</span></div>
<div class="sty-col6">${btn('Keep confirmed · recommended', { cls: 'ink', does: 'Keeps clay (r3) and dismisses the inferred accent; no hunk is added to the proposal', f: 'F187' })}${btn('Propose the inferred one', { does: 'Adds a hunk that changes the confirmed accent to forest; it still needs acceptance in S08', f: 'F187' })}${btn('Decide later', { cls: 'plain', does: 'Leaves the conflict open; the proposal keeps the confirmed value', f: 'F187' })}</div></div>
<div class="sp-sec"><h4>Conflict 2 of 2<span>Card radius</span></h4><div class="sp-row"><span class="nm">Confirmed 10 · inferred 16<small>REF-03 · 5 cards</small></span>${sp('cf')}<span></span></div></div>`;
  const cfMsgs = `<div class="sp-ub">Why is Accent a conflict?</div>${ai(`The accent in REF-03 is forest (${A.alt.hex}). DESIGN.md r3 says clay (${A.v.hex}), so r3 stays in force and I changed nothing. Card radius differs too: 10 confirmed, 16 inferred.`, `<div class="sp-gc"><div class="k">${ic('alert', 12)}Conflicts<span class="tag">${pill(['bad', '2 to decide'])}</span></div><div class="sty-alt"><div class="r"><span class="sty-c split sm" style="--a:${A.v.css};--b:${A.alt.css}"></span><span>Accent<small>Confirmed r3 against REF-03</small></span>${btn('Open', { sm: true, does: 'Scrolls to the Accent row and opens its conflict card', f: 'F187' })}</div><div class="r"><span class="sty-rs sm"></span><span>Card radius<small>10 confirmed, 16 inferred</small></span>${btn('Open', { sm: true, does: 'Scrolls to the Card row and opens its conflict card', f: 'F187' })}</div></div></div>`, 'Sonnet 5.5 · 6 s · 3 cr')}
${sugg([['Keep confirmed for both', 'Puts this prompt in the composer; nothing runs until Send', 'F187'], ['Draw F-03 with the inferred accent as a draft', 'Puts this prompt in the composer; nothing runs until Send', 'F187']])}`;
  const vConflict = app({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat30(cfMsgs), main: main30({
    srcStatus: stOk('Up to date with 2 references'),
    modeB: modeBar(false, C0, `<span class="sty-st warn">${ic('alert', 12)}2 to decide</span>` + acceptAll(C0.inf) + promoBtn, 'cf'),
    work: visual('conflict', { sel: 'color.accent' }) + inspS30('conflict', conflictBody, ['bad', '2 conflicts'], 'Inferred values that differ from confirmed ones.', [['References'], ['Conflicts', 1], ['History']]),
  }) });

  // 4 Markdown: DESIGN.md as one draft with the Visual tab
  const pad = (s, n) => String(s).padEnd(n, ' ');
  const slug = (s) => s.toLowerCase().replace(/ /g, '-');
  const mdLines = () => {
    const T = tokens('review');
    const L = [];
    const add = (txt, cls = '', tg = '') => L.push({ txt, cls, tg });
    add('# DESIGN.md · Meranti Yard', 'h'); add('');
    add('Status: draft on r3 · learned from REF-02, REF-03', 'c'); add('Lines marked inferred are not part of the spec until accepted.', 'c'); add('');
    add('## Colour roles', 'h'); add('| role         | value   | state'); add('|--------------|---------|------');
    T.filter((t) => t.g === 'color').forEach((t) => add(`| ${pad(slug(t.name), 12)} | ${t.v.hex} | ${t.st === 'ok' ? 'accepted r3' : t.st === 'inf' ? `inferred ${t.refs[0]}` : `accepted r3 · conflict, inferred ${t.alt.hex}`}`, t.st === 'inf' ? 'inf' : t.st === 'cf' ? 'cf' : ''));
    add(''); add('## Type scale', 'h');
    T.filter((t) => t.g === 'type').forEach((t) => add(`| ${pad(slug(t.name), 12)} | ${pad(t.spec, 22)} | ${t.st === 'ok' ? 'accepted r3' : `inferred ${t.refs[0]}`}`, t.st === 'inf' ? 'inf' : ''));
    add(''); add('## Radius', 'h');
    T.filter((t) => t.g === 'radius').forEach((t) => add(`| ${pad(slug(t.name), 12)} | ${pad(t.spec, 7)} | ${t.st === 'cf' ? `accepted r3 · conflict, inferred ${t.alt.spec}` : 'accepted r3'}`, t.st === 'cf' ? 'cf' : ''));
    return L;
  };
  const edited = (txt) => txt.replace('· caps', '· caps, tables only');
  const mdHtml = mdLines().slice(0, 26).map((l, i) => {
    const isEd = l.txt.includes('| caption');
    const txt = isEd ? edited(l.txt) : l.txt;
    const cls = isEd ? 'ed' : l.cls;
    const body = l.cls === 'h' ? `<span class="h">${txt}</span>` : l.cls === 'c' ? `<span class="c">${txt}</span>` : txt.replace(/(#[0-9A-F]{6})/g, '<span class="k">$1</span>');
    return `<div class="sty-l ${cls}"><span class="ln">${i + 1}</span><span>${body}${isEd ? '<i class="sty-caret"></i>' : ''}</span><span class="tg">${isEd ? 'edited by you' : ''}</span></div>`;
  }).join('');
  const mdEditor = `<div class="sty-ed isnew" data-feature="F188">${NT}<div class="sty-edb"><b>DESIGN.md</b><span>draft on r3 · 1 line edited</span><span class="sp-fill"></span>${btn('Paste a guide', { sm: true, icon: 'clip', does: 'Pastes a style guide as Markdown; it is read into tokens that arrive as Inferred, never as accepted', f: 'F188' })}${ib('undo', 'Undo', { does: 'Undoes the last edit in the draft', sm: true, f: 'F188' })}${ib('redo', 'Redo', { does: 'Redoes the last undone edit', sm: true, f: 'F188' })}</div>
<div class="sty-code" aria-label="DESIGN.md draft">${mdHtml}</div>
<div class="sty-edf"><span class="mono">Ln 31, Col 52</span><span>Markdown</span><span>Draft saved on this device</span><span class="sp-fill"></span><span>${kbd('⌘ S')} save draft</span><span>${kbd('⌘ ⇧ P')} promote</span></div></div>`;
  const outline = [['Purpose', 'ok', 'r3'], ['Tone', 'ok', 'r3'], ['Grid', 'ok', 'r3'], ['Type scale', 'inf', '2 inferred'], ['Colour roles', 'cf', '3 inferred · 1 conflict'], ['Spacing', 'inf', '1 inferred'], ['Radius', 'cf', '1 conflict'], ['Motion rules', 'ok', 'r3'], ['Components', 'inf', '2 inferred'], ['Do and don’t', 'ok', 'r3']];
  const mdBody = `<div class="sp-sec"><h4>Outline<span>R-DS-1 sections</span></h4><div class="sty-ol">${outline.map(([n, s, t]) => `<div><span>${n}</span>${sp(s, t)}</div>`).join('')}</div></div>
<div class="sp-sec"><h4>Checks<span>3</span></h4>
<div class="sty-rule">${ic('check', 14)}<span>Markdown reads back to ${C0.all} tokens, the same as the Visual tab.</span></div>
<div class="sty-rule">${ic('alert', 14)}<span>Your edit on line 31 is marked Edited. It is not accepted until you promote it.</span></div></div>`;
  const mdMsgs = `<div class="sp-ub">Use the caption style on tables only.</div>${ai('Changed line 31 in the draft. The caption token stays Inferred, so the spec is unchanged. The Visual tab shows the same edit.', `<div class="sp-gc"><div class="k">${ic('doc', 12)}DESIGN.md draft<span class="tag">${pill(['warn', 'Edited'])}</span></div><div class="tt">type.caption · line 31</div><div class="bd"><code>11 / 1.3 · 500 · caps</code> to <code>11 / 1.3 · 500 · caps, tables only</code></div><div class="ft"><span class="s">Draft only · not in r3</span>${btn('Undo', { sm: true, does: 'Restores the line to the learned value', f: 'F188' })}</div></div>`, 'Sonnet 5.5 · 4 s · 2 cr')}`;
  const vMarkdown = app({ stage: 'design', save: ['ok', 'Saved 12:48'], chat: chat30(mdMsgs, '≈ 2.6k tokens · DESIGN.md draft included'), main: `<section class="sp-main" aria-label="Style review">
${tabs([['grid', 'Variance flows'], ['frame', 'F-03 Variance table'], ['doc', 'DESIGN.md'], ['layers', 'Style · learned', true, true]], tabR('F195'))}${srcBar(stOk('Up to date with 2 references'))}${modeBar(true, C0, btn('Copy', { icon: 'clip', does: 'Copies the Markdown draft to the clipboard', f: 'F188' }) + promoBtn, 'all')}<div class="sp-work">${mdEditor}${inspS30('markdown', mdBody, ['warn', '1 edited'], 'Same draft as the Visual tab. Edits here update the tokens there.', [['Outline', 1], ['Checks'], ['History']])}</div></section>` });

  // 5 Promote to spec: diff proposal for S08
  const dl = (kind, txt) => { const g = kind === 'add' ? '+' : kind === 'mod' ? '~' : ' '; const t = txt.replace(/~~(.+?)~~/g, '<del>$1</del>').replace(/\*\*(.+?)\*\*/g, '<ins>$1</ins>'); return `<div class="sty-dl ${kind}"><span class="g">${g}</span><span>${t}</span></div>`; };
  const hunk = (h) => `<section class="sty-hk${h.open ? ' open' : ''}" data-hunk="${h.id}" aria-label="${h.sec}"><div class="hh"><button type="button" class="sty-cb${h.inc ? ' on' : ''}" role="checkbox" aria-checked="${h.inc}" aria-label="Include ${h.sec}" data-does="${h.inc ? 'Leaves this hunk out of the proposal' : 'Includes this hunk in the proposal'}" data-feature="F189">${h.inc ? ic('check', 11, 3) : ''}</button><b>${h.sec}</b><span class="n"><em>+${h.add}</em> <s>−${h.del}</s></span>${h.conf ? pill(['warn', 'Changes a confirmed token']) : ''}${!h.inc ? pill(['mute', 'Left out']) : ''}<span class="sp-fill"></span>${ib(h.open ? 'chev' : 'chevR', `${h.open ? 'Collapse' : 'Expand'} ${h.sec}`, { does: 'Shows or hides the lines of this hunk; the include choice is kept', sm: true, f: 'F189' })}</div>${h.open ? h.lines.map(([k, t]) => dl(k, t)).join('') : ''}</section>`;
  const propHead = `<div class="sty-ph isnew" data-feature="F189">${NT}${ic('diff', 18)}<div><b>Proposal P-021 · DESIGN.md r3 to r4</b><br><small>From the style draft (REF-02, REF-03) · base is DESIGN.md r3, the current revision</small></div><span class="sp-fill"></span>${pill(['ok', 'Base is current'])}${pill(['acc', 'Proposal'])}</div>`;
  const incN = S.STYLE_HUNKS.filter((h) => h.inc).length;
  const propBody = `<div class="sp-sec"><h4>Targets<span>2 files</span></h4><div class="sty-ol"><div><span>DESIGN.md</span>${pill(['mute', 'r3 to r4'])}</div><div><span>tokens.json</span>${pill(['mute', 'r3 to r4'])}</div></div></div>
<div class="sp-sec"><h4>Included<span>${incN} of ${S.STYLE_HUNKS.length} hunks</span></h4><div class="sty-rule">${ic('check', 14)}<span>6 new tokens and 1 changed: Card radius 10 to 16, marked as a change to a confirmed token.</span></div><div class="sty-rule">${ic('x', 14)}<span>Left out: half step 4 (you unticked it). Accent: kept confirmed.</span></div></div>
<div class="sp-sec"><h4>Checks<span>R-DS-7</span></h4><div class="sty-rule">${ic('check', 14)}<span>Source is the documented method, not runtime-verified. No brand text or assets copied.</span></div><div class="sty-rule">${ic('lock', 14)}<span>Not auto-accepted. Accepting makes exactly one Revision.</span></div></div>
<div class="sty-col6 t2">${btn('Send to review in S08', { cls: 'ink', icon: 'diff', does: 'Opens S08 with this exact diff; nothing is written to the spec until you accept it there', f: 'F189' })}${btn('Back to style', { does: 'Returns to the Visual tab with the same draft', f: 'F189' })}</div>`;
  const promMsgs = `<div class="sp-ub">Promote this style to the spec.</div>${ai('Prepared proposal P-021. It adds 6 tokens and changes Card radius. Nothing is written to the spec; S08 shows the exact diff first.', `<div class="sp-gc prop"><div class="k">${ic('diff', 12)}Proposal<span class="tag">${pill(['acc', 'Draft'])}</span></div><div class="tt">P-021 · DESIGN.md r3 to r4</div><div class="bd">${incN} of ${S.STYLE_HUNKS.length} hunks included · 1 conflict kept confirmed</div><div class="ft"><span class="s">Not stale · base r3</span>${btn('Open in S08', { sm: true, cls: 'ink', does: 'Opens S08 review with this proposal and its exact diff', f: 'F189' })}</div></div>`, 'Sonnet 5.5 · 5 s · 3 cr')}`;
  const vPromote = app({ stage: 'design', save: ['ok', 'Saved 12:52'], chat: chat30(promMsgs), main: `<section class="sp-main" aria-label="Promote to spec">
${tabs30(false)}${srcBar(stOk('Up to date with 2 references'))}${modeBar(false, C0, btn('Back to style', { cls: 'plain', does: 'Returns to the Visual tab with the same draft', f: 'F189' }) + btn('Send to review in S08', { cls: 'ink', icon: 'diff', does: 'Opens S08 with this exact diff; nothing is written to the spec until you accept it there', f: 'F189' }), 'all')}<div class="sp-work"><div class="sty-prop">${propHead}${S.STYLE_HUNKS.map(hunk).join('')}</div>${inspS30('promote', propBody, ['acc', 'Proposal'], 'Per-hunk choice. S08 is where it is accepted.', [['Summary', 1], ['Sources'], ['Checks']])}</div></section>` });

  // 6 Accepted: DESIGN.md r4 in the spec; a new reference adds Inferred tokens only
  const histBody = refsBody('accepted') + `<div class="sp-sec"><h4>History<span>2</span></h4><div class="sp-row"><span class="id">r4</span><span class="nm">DESIGN.md from P-021<small>Accepted 12:58 · Rina (sample)</small></span>${pill(['ok', 'Current'])}</div><div class="sp-row"><span class="id">r3</span><span class="nm">DESIGN.md<small>Accepted earlier</small></span>${btn('Revert', { sm: true, does: 'Creates a new revision that restores r3; r4 stays in the history', f: 'F191' })}</div></div>`;
  const accMsgs = `${ai('DESIGN.md r4 is accepted. New designs use it. REF-04 arrived at 13:05, so Keep learning added one Inferred token. Nothing in r4 changed.', `<div class="sp-gc"><div class="k">${ic('check', 12)}Accepted<span class="tag">${pill(['ok', 'r4'])}</span></div><div class="tt">Style is in the spec</div><div class="bd">${C4.ok} tokens accepted · ${C4.inf} inferred waiting · accent kept confirmed, card radius now 16.</div><div class="ft"><span class="s">One accept, one Revision</span>${btn('History', { sm: true, does: 'Opens the revision list of DESIGN.md', f: 'F191' })}</div></div>`, 'Sonnet 5.5 · 3 s · 2 cr')}
${sugg([['Review the new Inferred token', 'Puts this prompt in the composer; nothing runs until Send', 'F192']])}`;
  const vAccepted = app({ stage: 'design', save: ['ok', 'Saved 13:06'], chat: chat30(accMsgs), main: main30({
    srcStatus: stOk('Up to date with 3 references'),
    modeB: modeBar(false, { ...C4, inf: C4.inf + 1, all: C4.all + 1 }, off('Promote to spec', 'Nothing new is accepted yet: 2 Inferred tokens are waiting for review', 'F189', { cls: 'ink', icon: 'diff' }), 'all'),
    banner: `<div class="sp-banner sty-ok" role="status">${ic('check', 16)}<p><b>DESIGN.md r4 accepted.</b> Rina (sample) accepted P-021 in S08 at 12:58. Designs now use r4; r3 stays in the history.</p>${btn('Open history', { sm: true, does: 'Opens the revision list of DESIGN.md', f: 'F191' })}</div>`,
    work: visual('accepted') + inspS30('accepted', histBody, ['ok', 'r4'], 'Style is in the spec. New references add Inferred tokens only.', [['References', 1], ['Tokens'], ['History']]),
  }) }).replace('<span class="r">r14</span>', '<span class="r">r15</span>');


  // ================================================================ S38 Contextual GenUI panel (chat resized wider; the canvas stays behind it)
  const F = S.FRAMES;
  const frame = (f, x, y, w, h, inner, cls = '', lab = '') => `<div class="sp-fr ${cls}" style="left:${x}px;top:${y}px;width:${w}px"><div class="sp-frl"><b>${f.id}</b>${f.name}<span class="r">${f.rev || ''}</span>${lab}</div><div class="sp-frb" style="height:${h}px">${inner}</div></div>`;
  const canvas38 = (extra = '') => `<div class="sty-cvx" aria-label="Board: Variance flows"><div class="sp-cvt">Variance flows<span>5 frames · 1 reference</span></div>
${frame(F.f01, 30, 56, 230, 150, mini({ title: 'Portfolio overview', chart: true, table: false, h: 150 }), '', pill(['ok', 'Accepted']))}
${frame(F.f03, 292, 56, 262, 176, mini({ title: 'Variance table', rows: 4, h: 176 }), '', pill(['ok', 'Accepted']))}
${frame(F.f04, 596, 56, 262, 176, mini({ title: 'Variance table', rows: 4, drawer: true, h: 176 }), 'sel', pill(['warn', 'Draft · not accepted']))}
${extra}</div>`;
  const main38 = (extra, busy = '') => `<section class="sp-main" aria-label="Work area">
${tabs([['grid', 'Variance flows', true], ['frame', 'F-03 Variance table'], ['frame', 'F-04 Alert drawer']], tabR('F339'))}
<div class="sp-tool">${K.views('Canvas')}<span class="sp-crumb">Design${ic('chevR', 12)}<b>Variance flows</b></span><span class="sp-fill"></span>${busy}</div>
<div class="sp-work">${canvas38(extra)}</div></section>`;
  const ctx38 = [['frame', 'F-04', 'r1'], ['req', 'R-DASH-014', 'r14'], ['image', 'REF-02', 'r1']];
  const chat38 = (msgs, foot) => chatPanel({ title: 'Design chat', sub: 'F-04 selected', ctxItems: ctx38, ctxFoot: foot || '≈ 6.4k tokens · the whole board is never sent', ph: 'Ask for a change to F-04, or @ another frame…', msgs }).replace('class="sp-chat"', 'class="sp-chat sty-wide"');
  const pvAcc = (t) => `<span class="sty-pv acc">${ic('lock', 10, 2.2)}${t}</span>`;
  const pvProp = `<span class="sty-pv prop">${ic('spark', 10, 2.2)}Model proposal</span>`;
  const pvObs = (t) => `<span class="sty-pv obs">${ic('image', 10, 2.2)}${t}</span>`;
  const reqCard = `<div class="sty-gx" data-id="R-DASH-014"><div class="k">${ic('req', 12)}Requirement<span class="tag">${pvAcc('Accepted artifact · r14')}</span></div><div class="tt">R-DASH-014 · Variance threshold per package</div><div class="bd">Flag a package when forecast exceeds budget by more than 3%.</div><div class="ft"><span class="s">Source: brief §2 · REF-02</span>${btn('Details', { sm: true, does: 'Expands the card in place: criteria, sources and linked frames; focus and edits stay', f: 'F325' })}${btn('Pin', { sm: true, does: 'Pins this reference to the board; an accepted artifact keeps its ID and revision', f: 'F331' })}</div></div>`;
  const gapCard = (pinned) => `<div class="sty-gx prop" data-id="GAP-07"><div class="k">${ic('alert', 12)}Gap<span class="tag">${pvProp}</span></div><div class="tt">No empty state when no package is over</div><div class="bd">Proposed: show “No package over 3% this period”.</div><div class="ft"><span class="s">${pinned ? '<b>Pinned</b> to Variance flows · still a proposal' : 'Not in the spec · needs review'}</span>${pinned ? btn('Unpin', { sm: true, does: 'Removes the pin from the board; the proposal itself stays in chat', f: 'F331' }) + btn('Open in S08', { sm: true, cls: 'ink', does: 'Opens S08 with the exact diff for this proposal', f: 'F331' }) : btn('Edit', { sm: true, does: 'Edits the proposed criterion as a draft; the spec is unchanged', f: 'F325' }) + btn('Pin', { sm: true, does: 'Pins the proposal to the board; it stays a proposal until accepted in S08', f: 'F331' })}</div></div>`;
  const altCard = `<div class="sty-gx prop" data-id="ALT-F03"><div class="k">${ic('cols', 12)}Alternatives<span class="tag">${pvProp}</span></div><div class="tt">3 takes of the drawer, same data</div>
<div class="sty-alt" role="radiogroup" aria-label="Takes"><button type="button" role="radio" aria-checked="false" class="r" data-does="Selects this take as the one to compare; nothing is accepted" data-feature="F327"><span class="sty-rd on"></span><span>Take 1 · Drawer from the right</span>${pill(['mute', 'Baseline'])}</button><button type="button" role="radio" aria-checked="false" class="r" data-does="Selects this take as the one to compare; nothing is accepted" data-feature="F327"><span class="sty-rd"></span><span>Take 2 · Banner above the table</span>${pill(['mute', '1 more click'])}</button><button type="button" role="radio" aria-checked="false" class="r" data-does="Selects this take as the one to compare; nothing is accepted" data-feature="F327"><span class="sty-rd"></span><span>Take 3 · Row badges only</span>${pill(['warn', 'Hides detail'])}</button></div>
<div class="ft"><span class="s">None is accepted. Pick one to compare.</span>${btn('Compare', { sm: true, cls: 'ink', does: 'Opens Compare with the chosen take beside the baseline; nothing is accepted', f: 'F325' })}</div></div>`;
  const gxAi = (txt, inner, meta = 'Sonnet 5.5 · 34 s · 22 cr') => `<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>${meta}</em></div><p>${txt}</p>${inner}</div>`;
  const nextRows = (list) => `<div class="sp-sugg isnew" data-feature="F332">${NT}${list.map(([t, does]) => `<button type="button" data-does="${does}" data-feature="F332">${ic('chevR', 13)}${t}</button>`).join('')}</div>`;

  // 1 Streaming: blocks reveal one at a time; the block being written is a skeleton built from the data that has arrived
  const skCk = `<div class="sty-gx" aria-busy="true" aria-label="Acceptance checklist, being written"><div class="k">${ic('check', 12)}Acceptance checklist<span class="tag">${pill(['mute', 'Writing block 3 of 3'])}</span></div><div class="tt">AC-DASH-019 · Alert after 2 periods over 3%</div>
<div class="sp-ck"><div><span class="bx"></span><span>Alert raised after 2 periods over 3%</span><span class="sty-sk pl58"></span></div><div><span class="bx"></span><span>Threshold read from accepted s<span class="sty-sk tail"></span></span><span class="sty-sk pl58"></span></div><div><span class="bx"></span><span class="sty-sk" style="width:62%"></span><span class="sty-sk pl58"></span></div></div>
<div class="ft"><span class="s">Actions turn on when the block is complete</span>${off('Pin', 'Not available until this block is complete and validated', 'F323', { sm: true })}</div></div>`;
  const streamMsgs = `${gxAi('Checked F-04 against spec r14. Blocks 1 and 2 are ready; block 3 is still being written.', `<div class="sty-reveal">${reqCard}</div><div class="sty-reveal">${gapCard(false)}</div>${skCk}`, 'Sonnet 5.5 · streaming')}
<div class="sty-run" role="status" aria-live="polite">${'<span class="sty-spin"></span>'}<b>Writing block 3 of 3</b><span class="mono">1.9k tokens · 12 s</span><span class="sp-fill"></span>${btn('Stop', { sm: true, cls: 'plain', does: 'Stops the stream; finished blocks stay, the partial block is dropped and nothing is charged for it', f: 'F324' })}</div>`;


  const vStream = app({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat38(streamMsgs, '≈ 6.4k tokens · 3 items listed'), main: main38('', `<span class="sty-st busy" role="status"><span class="sty-spin"></span>Spekin is writing · F-04</span>`) });

  // 2 Cards rendered: three families with distinct provenance labels, next-step rows
  const cardsMsgs = `${gxAi('F-04 matches spec r14. I found one gap and drew three takes.', `${reqCard}${gapCard(false)}${altCard}`)}
${nextRows([['Send the gap to review in S08', 'Adds GAP-07 to S08 review with its exact diff'], ['Open Style review for the drawer colours', 'Opens S30 with the style draft; nothing is accepted']])}`;
  const vCards = app({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat38(cardsMsgs), main: main38('') });

  // 3 Question sheet: stepped, with a recommended option, answered in place (Onlook QuestionSheet, OpenDesign choice surface)
  const opt = (n, t, s, o = {}) => `<button type="button" role="radio" aria-checked="${!!o.on}" class="sty-opt${o.rec ? ' rec' : ''}" data-does="Selects this answer; nothing is sent until you press Send answers" data-feature="F326"><span class="sty-rd${o.on ? ' on' : ''} rd"></span><span><b>${t}${o.rec ? `<span class="sty-pv prop">${ic('spark', 10, 2.2)}Recommended</span>` : ''}</b><small>${s}</small></span>${kbd(n)}</button>`;
  const qSheet = `<div class="sty-qs isnew" data-feature="F326" role="group" aria-label="Question 2 of 4">${NT}<div class="sty-qh">${ic('spark', 13)}Before I draw the drawer<span class="dots" role="img" aria-label="Question 2 of 4"><i class="d"></i><i class="a"></i><i></i><i></i></span><span class="sty-count">2 of 4</span></div>
<div class="sty-qb"><div class="sty-ans"><span>Q1</span><span>Which packages raise alerts?</span><span class="a">All four packages</span></div>
<div class="q">When should a package raise an alert?</div><div class="why">R-DASH-014 sets the 3% threshold. The period rule is still open, so this answer becomes a proposal, not a requirement.</div>
<div role="radiogroup" aria-label="When to raise an alert" style="display:flex;flex-direction:column;gap:6px">${opt('1', 'After 2 periods over 3%', 'Matches proposal R-DASH-019. Fewest false alerts.', { rec: true })}${opt('2', 'On the first period over 3%', 'Earliest warning, but P-01 and P-03 alert every period.')}${opt('3', 'After 3 periods over 3%', 'Slowest. P-01 would alert one period later.')}</div>
<div class="sty-note-in">${ic('type', 13)}Or write your own answer…<span class="sp-fill"></span>${kbd('4')}</div></div>
<div class="sty-qf"><span class="hint">${kbd('1-4')} pick ${kbd('↵')} next ${kbd('Esc')} skip</span>${btn('Back', { sm: true, cls: 'plain', does: 'Goes back one question; your earlier answer is kept', f: 'F326' })}${btn('Skip', { sm: true, does: 'Skips this question; the model will state the assumption it made', f: 'F326' })}${off('Next', 'Pick an answer first, or press Skip', 'F326', { sm: true, cls: 'ink' })}</div></div>`;
  const qMsgs = `${gxAi('I need four answers before I draw. Pick one or write your own. Nothing is sent until the last question.', qSheet, 'Sonnet 5.5 · 6 s · 3 cr')}`;
  const vQuestion = app({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat38(qMsgs), main: main38('') });

  // 4 Table fallback: validation failed, so a plain table and a short reason; a missing figure is never shown as 0
  const pk = S.PACKAGES;
  const fbTable = `<table class="sty-ft" aria-label="Variance by package, plain table"><thead><tr><th>Package</th><th>Budget</th><th>Forecast</th><th>Variance</th><th>Status</th></tr></thead><tbody>${pk.map(([n, b, f, v, s], i) => i === 3
    ? `<tr><td>P-04 Marine spread</td><td><code>${b}</code></td><td class="na">Not provided</td><td class="na">Not provided</td><td>${pill(['mute', 'Cannot tell'])}</td></tr>`
    : `<tr><td>${n.split(' ').slice(0, 2).join(' ')}</td><td><code>${b}</code></td><td><code>${f}</code></td><td><code>${v}</code></td><td>${pill([s === 'ok' ? 'ok' : 'bad', s === 'ok' ? 'On track' : 'Over 3%'])}</td></tr>`).join('')}</tbody></table>`;
  const fbBlock = `<div class="sty-gx isnew" data-feature="F328">${NT}<div class="k">${ic('doc', 12)}Plain table · fallback<span class="tag">${pvObs('REF-02 · imported')}</span></div>
<div class="sty-why" role="status">${ic('alert', 15)}<span><b>Shown as a table.</b> The card did not pass validation: <code>forecast</code> is missing for P-04. I left it empty instead of guessing, and no action on this block is active.</span></div>
${fbTable}
<div class="ft"><span class="s sty-m11">schema v1 · rejected by Rust validation</span>${btn('Copy table', { sm: true, does: 'Copies the table as plain text', f: 'F335' })}${btn('Export JSON', { sm: true, does: 'Exports the same rows with schema version, IDs, status, sources and filters; no model call', f: 'F335' })}${btn('Rebuild card', { sm: true, cls: 'ink', does: 'Asks the model for a corrected card; the old table stays until the new one validates', f: 'F328' })}</div></div>`;
  const fbMsgs = `<div class="sp-ub">Show cost variance by package as a card.</div>${gxAi('I could not draw this as a card. Here are the figures as a table, with the gap marked.', fbBlock, 'Sonnet 5.5 · 14 s · 8 cr')}`;
  const vFallback = app({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat38(fbMsgs), main: main38('') });

  // 5 Confirm a paid action: exact effect, cost, and checks before anything is committed
  const chk = (t, v) => `<div class="sty-chk"><span class="ok">${ic('check', 14, 2.4)}</span><span>${t}</span><span class="sty-m11 d">${v}</span></div>`;
  const confirmCard = `<div class="sty-cf isnew" data-feature="F330" role="group" aria-label="Confirm paid action">${NT}<div class="hd2">${ic('spark', 14)}Confirm: draw 3 takes of F-04<span class="sp-fill"></span>${pill(['warn', 'Paid · Hosted'])}</div>
<div class="bd2"><div class="sty-kv2"><span>Effect</span><span>Adds 3 draft takes to the F-04 alternatives. Accepted frames stay as they are.</span><span>Cost</span><span>About 22 cr each. Up to 90 cr is reserved first, the rest is released.</span><span>Model</span><span>Hosted · Sonnet 5.5 · 3 runs</span></div>
<div><div class="sty-bud" role="img" aria-label="1,240 of 5,000 credits used, 90 reserved"><i class="u" style="width:24.8%"></i><i class="r" style="width:1.8%"></i></div><div class="sty-lg mt"><span>Used <b>1,240</b></span><span>Reserved now <b>90</b></span><span>Cap <b>5,000</b></span></div></div>
<div class="sty-col6">${chk('Actor can edit this project', 'Rina (sample) · Editor')}${chk('Action is on the allowlist', 'generate_takes')}${chk('Spec revision is current', 'r14')}${chk('Within the credit cap', '3,670 left after reserve')}</div>
<div class="sty-lg"><span>Idempotency key <b>run-7f3a-c2</b></span><span>A retry cannot charge twice.</span></div></div>
<div class="sty-qf"><span class="hint">${kbd('Esc')} cancel ${kbd('⌘ ↵')} confirm</span>${btn('Cancel', { sm: true, does: 'Closes the confirmation; nothing is reserved or run', f: 'F330' })}${btn('Confirm · reserve 90 cr', { sm: true, cls: 'ink', does: 'Re-checks actor, permission, revision and budget, reserves 90 cr, then starts 3 runs; a stale or denied check shows an error, never success', f: 'F330' })}</div></div>`;
  const cfMsgs2 = `<div class="sp-ub">Draw 3 more takes of F-04 with the banner idea.</div>${gxAi('That runs the model three times, so I need your confirmation. Nothing has started.', confirmCard, 'Sonnet 5.5 · 3 s · 1 cr')}`;
  const vConfirm = app({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat38(cfMsgs2, '≈ 6.4k tokens · estimate before Send'), main: main38('') });

  // 6 Pinned to the board: still a proposal, exact diff waits in S08
  const pinCard = `<div class="sty-pin isnew" style="left:628px;top:300px" data-feature="F331" role="group" aria-label="Pinned proposal GAP-07">${NT}<div class="k">${ic('alert', 12)}Gap · pinned from chat<span class="tag">${pvProp}</span></div><div class="tt">No empty state when no package is over</div><div class="bd">Proposed: show “No package over 3% this period”.</div><div class="ft"><span class="s">Not accepted · F-04</span>${ib('chev', 'Move pin down', { does: 'Moves the pin by one step; arrow keys do the same, no dragging needed', sm: true, f: 'F331' })}${btn('Unpin', { sm: true, does: 'Removes the pin from the board', f: 'F331' })}</div></div>
<svg class="sp-arrows" width="950" height="694" aria-hidden="true"><path d="M727 254 L 727 298" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 4"/></svg>`;
  const ckCard = `<div class="sty-gx" data-id="AC-DASH-019"><div class="k">${ic('check', 12)}Acceptance checklist<span class="tag">${pvObs('Fixture run · not a pinned build')}</span></div><div class="tt">AC-DASH-019 · Alert after 2 periods over 3%</div><div class="sp-ck"><div><span class="bx"></span><span>Alert raised after 2 periods over 3%</span>${pill(['mute', 'Untested'])}</div><div><span class="bx on">${ic('check', 10, 3)}</span><span>Threshold read from accepted spec r14</span>${pill(['ok', 'Passed · fixture'])}</div><div><span class="bx"></span><span>No alert for P-04 at −3.4%</span>${pill(['bad', 'No evidence'])}</div></div><div class="ft"><span class="s">1 of 3 passed. Nothing else is shown as passed.</span>${btn('Details', { sm: true, does: 'Expands the checklist in place: run, evidence and linked tests; focus and edits stay', f: 'F325' })}${btn('Pin', { sm: true, does: 'Pins the checklist to the board; an observation stays an observation', f: 'F331' })}</div></div>`;
  const pinMsgs = `${gxAi('Pinned to Variance flows next to F-04. It is still a proposal: S08 shows the exact diff before it can become a requirement.', gapCard(true) + ckCard, 'Sonnet 5.5 · 2 s · 1 cr')}
${nextRows([['Send the gap to review in S08', 'Adds GAP-07 to S08 review with its exact diff'], ['Pin the 3 takes as well', 'Pins the alternatives card to the board; it stays a proposal'], ['Export this pin as JSON', 'Exports the pinned data with schema version and IDs; no model call']])}`;
  const vPinned = app({ stage: 'design', save: ['ok', 'Saved 12:44'], chat: chat38(pinMsgs), main: main38(pinCard) });


  // ---------------------------------------------------------------- notes (navy, on empty window space)
  const n = (html, x, y, w = 280) => note(html, `left:${x}px;top:${y}px;max-width:${w}px`);
  const NS = {
    learning: [n('<b>Per-block reveal</b>: Palette is finished and shown. Type is still being written, so it is a skeleton built from the names already known, with aria-busy on. No percentage: only real steps.', 14, 606, 316), n('<b>Designs wait</b>: new frames start after learning ends so they use the finished style. Stop keeps what was read as an Inferred draft.', 14, 696, 316)],
    review: [n('<b>Inferred never replaces confirmed</b>: 9 new tokens are Inferred. Accepting adds them to the draft only; the spec changes when S08 accepts a proposal (R-WS-5).', 14, 654, 316), n('<b>Keys</b>: A accepts the focused token, X dismisses it, arrow keys move. Several accepts make one undo step.', 1136, 700, 284)],
    conflict: [n('<b>Keep confirmed</b> is the default: it is what the spec says today. Propose the inferred one only adds a hunk for S08.', 14, 678, 316), n('<b>Contrast</b> is shown for both values, so the choice is not only about taste.', 1136, 760, 284)],
    markdown: [n('<b>One draft, two views</b>: an edit here updates the Visual tab at once. Edited lines get an amber bar and stay unaccepted.', 14, 582, 316), n('<b>Paste surface</b>: a pasted style guide is read into tokens that arrive as Inferred, never as accepted (R-DS-7).', 14, 680, 316)],
    promote: [n('<b>Per-hunk choice</b>: untick a hunk to leave it out. Nothing is written here; S08 shows this exact diff and accepts it as one Revision (R-EDT-2, R-EDT-3).', 14, 576, 316), n('<b>Stale guard</b>: if DESIGN.md moves past r3 before you send, this turns Stale and must be rebased (R-EDT-4).', 14, 676, 316)],
    accepted: [n('<b>Keep learning</b>: REF-04 arrived after r4. It added Inferred tokens only; confirmed r4 values are untouched (AC-56).', 14, 590, 316), n('<b>Revert</b> makes a new revision that restores r3. r4 stays in the history.', 14, 688, 316)],
    stream: [n('<b>Per-block reveal</b>: each block fades in over 0.24 s with an 8 px rise. Only the block being written is a skeleton, drawn from the title and rows that have arrived.', 500, 520, 330), n('<b>Partial means inactive</b>: Pin stays off until the block is complete and validated. Stop drops the partial block and keeps the finished ones (R-GUI-7).', 860, 520, 330)],
    cards: [n('<b>Three labels</b>: Accepted artifact (lock), Model proposal (spark, clay edge), Imported observation (image). Never colour alone (R-GUI-1).', 500, 520, 330), n('<b>Next steps</b> are rows under the reply. They fill the composer or open S08 or S30; none runs by itself.', 860, 520, 330)],
    question: [n('<b>Stepped sheet</b>: the recommended option is marked but not selected for you. Next stays off until you pick or Skip; Skip records the assumption.', 500, 520, 330), n('<b>Answered in place</b>: answers stay in the sheet and nothing is sent before the last question. Keys 1 to 4 pick, Enter moves on.', 860, 520, 330)],
    fallback: [n('<b>Validation failed</b>: incomplete card data falls back to a table and a one-line reason. No component is loaded from model output (R-GUI-2).', 500, 520, 330), n('<b>Missing is not zero</b>: P-04 forecast reads Not provided and status Cannot tell, never 0.0% or a green dot (R-GUI-5).', 860, 520, 330)],
    confirm: [n('<b>Before any commit</b>: actor, allowlist, current revision and budget are checked and the exact effect is stated. Model text cannot grant authority (R-GUI-6).', 500, 520, 330), n('<b>Stale or denied</b>: if r14 moved or the cap was hit meanwhile, the button becomes an error and nothing runs. Success is never shown for a failed action.', 860, 520, 330)],
    pinned: [n('<b>Pin is not accept</b>: the pinned card has a dashed link to F-04 and a Proposal label. Only S08 can turn it into a requirement (R-GUI-4).', 500, 560, 330), n('<b>No drag needed</b>: Move pin and the arrow keys place it. The pin keeps its ID across reload and stage changes (R-GUI-3, R-GUI-9).', 500, 690, 330)],
  };
  const withN = (v, k) => v + NS[k].join('');

  return [
    {
      file: 'S30-style-review', code: 'S30', tier: 'STYLE', name: 'Style review: tokens learned from references',
      ext: 'New. Spekin has no built screen yet (owner, 22 Nov 2026). Opens from an artifact tab inside S35; promotes into the spec through a proposal on S08. Pattern: OpenDesign DesignKitView module stack, Paraframe style panel, Onlook register status.',
      lives: 'Spekin web app · /p/meranti-yard/design?artifact=style (stage in the path, artifact in the query; never draft text or keys). BW-04.',
      views: [
        { id: 'learning', label: 'Learning', html: withN(vLearning, 'learning'), entry: 'Projects > Meranti Yard > Design > Import REF-03 in S28 > Style · learned.', data: 'sample/parts/style.mjs → STYLE_REFS, STYLE_STEPS, STYLE_TOKENS.' },
        { id: 'review', label: 'Visual review', html: withN(vReview, 'review'), entry: 'Style · learned > Visual (learning finished).', data: 'sample/parts/style.mjs → STYLE_TOKENS (state per token), STYLE_CTX.' },
        { id: 'conflict', label: 'Conflict', html: withN(vConflict, 'conflict'), entry: 'Visual > Accent row > Resolve (or Conflict filter).', data: 'sample/parts/style.mjs → STYLE_TOKENS (color.accent, radius.card with alt values), STYLE_contrast.' },
        { id: 'markdown', label: 'Markdown', html: withN(vMarkdown, 'markdown'), entry: 'Style · learned > Markdown tab, then edit line 31.', data: 'sample/parts/style.mjs → STYLE_TOKENS rendered as DESIGN.md lines.' },
        { id: 'promote', label: 'Promote to spec', html: withN(vPromote, 'promote'), entry: 'Style · learned > Promote to spec.', data: 'sample/parts/style.mjs → STYLE_HUNKS (proposal P-021).' },
        { id: 'accepted', label: 'Accepted', html: withN(vAccepted, 'accepted'), entry: 'S08 > accept P-021, then back to Style · learned (REF-04 imported at 13:05).', data: 'sample/parts/style.mjs → STYLE_TOKENS (accepted mode), STYLE_NEWTOKEN, STYLE_NEWREF.' },
      ],
      side: {
        must: [
          'Source picker with three choices: Learned from references, No style, Saved styles. The active choice shows by fill and weight, not colour alone.',
          'A Keep learning toggle with a status in words: Up to date with 2 references, or Learning with a count of references.',
          'Visual and Markdown are one draft. An edit in one shows in the other at once.',
          'Every token row carries a state in words and an icon: Inferred, Accepted or Conflict.',
          'An Inferred token never replaces a confirmed one. A conflict shows both values and contrast; Keep confirmed is the default.',
          'Promote to spec makes a diff proposal with a per-hunk include box. Nothing is written here; S08 accepts it as one Revision.',
          'Learning shows real steps per reference and a Stop. No estimated percentage. New designs wait for it to finish.',
        ],
        motion: [
          ['Module reveal', 'Each module fades in 240 ms with an 8 px rise and a 40 ms stagger as its data arrives (OpenDesign stagger, Momo reveal, own build).'],
          ['Skeleton', 'Only the module being written shimmers (1.4 s linear). It is drawn from names already known and carries aria-busy.'],
          ['Token accept', 'The state pill swaps in 140 ms. The row keeps its place; the list never reorders under the pointer.'],
          ['Switch', 'Keep learning slides 140 ms (spring-ui). The status text changes with it.'],
          ['Conflict card', 'Compares in place; the height change takes 180 ms and focus stays on the button used.'],
          ['Reduce Motion', 'All reveals are instant, the shimmer and spinner are static. Status changes are still announced.'],
        ],
        stories: [
          ['F181', 'new', 'Source picker: Learned from references, No style, Saved styles (R-WS-5, FR-12).', 'Paraframe'],
          ['F182', 'new', 'Keep learning toggle and a plain-words status (R-WS-5, FR-13).', 'Paraframe'],
          ['F183', 'new', 'Learning job with real steps per reference, Stop that keeps what was read, and designs that wait (R-GUI-11, FR-14).', 'Paraframe'],
          ['F184', 'new', 'Visual tab: module stack of cover, palette, type, spacing, radii and icons, sample controls (R-DS-1, FR-15).', 'OpenDesign'],
          ['F185', 'new', 'State on every token row, with filters and counts: Inferred, Accepted, Conflict (R-WS-5, AC-56).', 'Onlook'],
          ['F186', 'new', 'Accept or dismiss Inferred tokens one by one or together, keys A and X (R-WS-5, R-EDT-1).', 'PRD'],
          ['F187', 'new', 'Conflict card: confirmed against inferred with contrast; keep confirmed or propose the inferred one (R-WS-5, AC-56).', 'Onlook'],
          ['F188', 'new', 'Markdown tab: DESIGN.md as the same draft, edited-line marks, paste surface (R-DS-1, FR-16).', 'Paraframe'],
          ['F189', 'new', 'Promote to spec: diff proposal with per-hunk include, sent to S08 (R-EDT-1 to R-EDT-4, R-DS-7).', 'PRD'],
          ['F191', 'new', 'Accepted state: one Revision, history and revert (R-EDT-3).', 'PRD'],
          ['F192', 'new', 'A new reference after acceptance adds Inferred tokens only; confirmed values stay (R-WS-5, AC-56).', 'PRD'],
          ['F193', 'new', 'Reference list with thumbnails, job steps and token counts per reference (FR-17).', 'Paraframe'],
          ['F195', 'new', 'Shell controls kept from S35: artifact tabs, Share (later), Hand off (R-WF-12, R-WS-8).', 'PRD'],
        ],
        where: '<span><b>Route:</b> <code>/p/:project/design?artifact=style</code>. Back and Forward restore the tab and filter; they never accept a token (R-WF-11).</span><span><b>UI (TS/React):</b> OpenDesign patterns, Apache-2.0 reuse candidates at commit <code>e033aad</code>: <code>DesignKitView</code>, <code>DesignSystemFlow</code>, <code>DesignSystemPreviewModal</code>. Onlook REGISTER status idea is pattern only. Code reuse needs a NOTICE file.</span><span><b>Core (Rust):</b> token store with a state per token, extraction jobs and steps, conflict detection, proposals, revisions (R-ARC-1, R-EDT-3). Extraction is labelled documented-method and is never auto-accepted (R-DS-7, AC-60).</span><span><b>Open for Enrico:</b> tokens.json format (W3C, an assumption in R-DS-1) · Saved styles per project or per team · Keep learning on by default? · accent colour (Q-28).</span>',
      },
      refs: {
        note: 'OpenDesign (Apache-2.0, commit e033aad) is the main reference. Paraframe is proprietary and has no screenshots here: its style panel is described in the stories only. Spekin copies no brand, copy or assets.',
        shots: [
          { img: 'od-design-system.png', cap: '<b>OpenDesign design system.</b> A brand kit as a stack of modules with a Brand ready status. Spekin keeps the stack and adds a state on every token.' },
          { img: 'od-ds-components-compare.png', cap: '<b>OpenDesign extraction compare.</b> Old against new extraction, side by side, with sample controls. Spekin’s conflict card compares confirmed against inferred the same way.' },
          { img: 'od-design-systems-library.png', cap: '<b>OpenDesign design-system picker.</b> Showcase and Tokens views of one system. Spekin’s source picker and Markdown tab follow this split.' },
        ],
      },
    },
    {
      file: 'S38-genui-panel', code: 'S38', tier: 'GENUI', name: 'Contextual GenUI panel in chat',
      ext: 'New. A response and detail panel inside the project shell S35, not a ninth stage. Review stays canonical on S08; the board stays S29. Pattern: OpenDesign GenUISurfaceRenderer and QuestionForm, Onlook QuestionSheet, Momo per-block reveal (own build).',
      lives: 'Spekin web app · inside the chat of any stage (/p/meranti-yard/design shown). Chat width is user-resizable; 470 px here. Pinned items live on the board (S29).',
      views: [
        { id: 'stream', label: 'Streaming', html: withN(vStream, 'stream'), entry: 'Design > chat > send “Check F-04 against the 3% threshold”.', data: 'sample/meranti-yard.mjs → FRAMES, REQS; cards from sample/parts/style.mjs → STYLE_CTX.' },
        { id: 'cards', label: 'Cards rendered', html: withN(vCards, 'cards'), entry: 'Same chat when the stream ends and all blocks validate.', data: 'sample/meranti-yard.mjs → REQS, FRAMES.' },
        { id: 'question', label: 'Question sheet', html: withN(vQuestion, 'question'), entry: 'Chat > “Draw an alert drawer” when the period rule is open.', data: 'sample/meranti-yard.mjs → REQS (R-DASH-014, R-DASH-019).' },
        { id: 'fallback', label: 'Table fallback', html: withN(vFallback, 'fallback'), entry: 'Chat > “Show cost variance by package as a card” when card data fails validation.', data: 'sample/meranti-yard.mjs → PACKAGES (P-04 forecast withheld on purpose).' },
        { id: 'confirm', label: 'Confirm a paid action', html: withN(vConfirm, 'confirm'), entry: 'Chat > “Draw 3 more takes of F-04”.', data: 'sample/meranti-yard.mjs → USAGE, MODEL.' },
        { id: 'pinned', label: 'Pinned to the board', html: withN(vPinned, 'pinned'), entry: 'Cards rendered > Gap card > Pin.', data: 'sample/meranti-yard.mjs → FRAMES (F-04).' },
      ],
      side: {
        must: [
          'GenUI uses only registered card families: requirement or gap, alternatives, acceptance or evidence checklist. Anything else falls back to a table and a short reason.',
          'Every card says what it is, by icon and words: Accepted artifact, Model proposal or Imported observation.',
          'A streaming reply reveals block by block. The block being written is a skeleton with aria-busy and its actions are off.',
          'Questions come as a stepped sheet. The recommended option is marked, never pre-selected, and answers stay in the sheet until sent.',
          'A card never shows invented data: a missing figure reads Not provided, an untested item is never green.',
          'A paid or committing action states the exact effect and cost, re-checks actor, permission, revision and budget, and shows failure plainly.',
          'Pinning keeps a proposal a proposal. S08 shows the exact diff before any canonical write.',
          'Everything works by keyboard: no drag, no focus theft, and reduced motion is respected.',
        ],
        motion: [
          ['Block reveal', '0.24 s, 8 px rise, ease 0.22 / 1 / 0.36 / 1, stagger capped at 0.16 s. Momo pattern, own build.'],
          ['Streamed text', 'Per-character reveal 0.4 s, blur 10 px to 0, 10 ms stagger, capped near 2 s (OpenDesign). No cursor.'],
          ['Details', 'Expand in place, height 180 ms. Focus and edits stay on the card.'],
          ['Question step', 'Sheet enters 220 ms with a small overshoot (Onlook bubble); dots fill in 140 ms.'],
          ['Confirm', 'Sheet enters 250 ms (spring-panel). While running the button shows a busy state, never a made-up bar.'],
          ['Reduce Motion', 'Blocks appear at once, skeletons are static grey. Stream progress is announced politely, once per block.'],
        ],
        stories: [
          ['F321', 'new', 'Provenance labels on every card: Accepted artifact, Model proposal, Imported observation (R-GUI-1, R-GUI-4).', 'OpenDesign'],
          ['F322', 'new', 'Closed registry of card families, unknown components rejected (R-GUI-2, R-GUI-12).', 'Momo'],
          ['F323', 'new', 'Per-block progressive reveal with a skeleton from partial data and aria-busy; partial blocks have no active actions (R-GUI-7).', 'Momo'],
          ['F324', 'new', 'Stream status row: block count, tokens, time and Stop, with no fake progress (R-GUI-7, R-GUI-11).', 'OpenDesign'],
          ['F325', 'new', 'Details, Edit and Compare in place, keeping focus and edits, with stable IDs (R-GUI-3).', 'OpenDesign'],
          ['F326', 'new', 'Stepped question sheet with a recommended option, own answer and keys (R-GUI-9).', 'Onlook'],
          ['F327', 'new', 'Choice surface answered in place: pick a take to compare (R-GUI-3).', 'OpenDesign'],
          ['F328', 'new', 'Table fallback with a one-line reason; copy and rebuild (R-GUI-2, R-GUI-5).', 'Momo'],
          ['F329', 'new', 'Evidence honesty: untested and failed are never green, a missing figure is never zero (R-GUI-5, AC-SPK-29).', 'PRD'],
          ['F330', 'new', 'Confirmation surface for a paid action: exact effect, reserve, checks, idempotency (R-GUI-6, R-GUI-11).', 'OpenDesign'],
          ['F331', 'new', 'Pin to the board; a pin is not an accept; exact diff in S08 (R-GUI-4, AC-SPK-24).', 'PRD'],
          ['F332', 'new', 'Next-step rows under a reply (OpenDesign NextStepActions).', 'OpenDesign'],
          ['F335', 'new', 'Export of pinned or tabled data with schema version, IDs, status and sources; no model call (R-GUI-10).', 'PRD'],
          ['F339', 'new', 'Shell controls kept from S35: artifact tabs, Share (later), Hand off.', 'PRD'],
        ],
        where: '<span><b>Route:</b> no route of its own. The panel is part of the chat in <code>/p/:project/:stage</code>; pins carry a stable ID and survive reload (R-GUI-3).</span><span><b>UI (TS/React):</b> OpenDesign Apache-2.0 candidates at commit <code>e033aad</code>: <code>GenUISurfaceRenderer</code>, <code>GenUIInbox</code>, <code>QuestionForm</code>, <code>ContextChipStrip</code>, <code>NextStepActions</code>, <code>partial-json.ts</code> (copy needs a NOTICE). Onlook <code>QuestionSheetView</code> is a pattern. Momo has no licence: the skeleton pattern is rebuilt, nothing copied, and its permissive prop repair is not a validation policy (R-GUI-8).</span><span><b>Core (Rust):</b> validates schema version, types, enums, limits and permissions before any action is enabled; budget reserve, idempotency and audit (R-GUI-2, R-GUI-6, R-GUI-7).</span><span><b>Open for Enrico:</b> default credit reserve for a confirm · whether question answers count as one run · where the card registry is versioned.</span>',
      },
      refs: {
        note: 'OpenDesign (Apache-2.0, commit e033aad) and Onlook (Apache-2.0) are pattern references. Momo has no licence: pattern only, own build. Paraframe has no screenshots here. Spekin copies no brand, copy or assets.',
        shots: [
          { img: 'od-question-form.png', cap: '<b>OpenDesign question form.</b> A quick brief inside the chat, answered in place. Spekin’s stepped sheet adds a recommended option.' },
          { img: 'od-todo-progress.png', cap: '<b>OpenDesign progress card.</b> Todo and status inside the chat. Spekin’s stream row and checklist follow it.' },
          { img: 'od-studio-document.png', cap: '<b>OpenDesign next steps.</b> Suggestion rows under the reply. Spekin’s next-step rows follow it.' },
          { img: 'momo-chat-cards.png', cap: '<b>Momo (pattern only, no licence).</b> Cards inside the reply with a source row above. Spekin builds its own cards and labels.' },
          { img: 'momo-pinboard.png', cap: '<b>Momo (pattern only).</b> Cards pinned to a board. Spekin’s pin is a Proposal with a dashed link, never an accept.' },
          { img: 'onlook-canvas.png', cap: '<b>Onlook (Apache-2.0).</b> Frame chips in the chat. Spekin’s context chips above the reply follow this.' },
        ],
      },
    },
  ];
}
