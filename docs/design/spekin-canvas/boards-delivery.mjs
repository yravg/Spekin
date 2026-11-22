// Delivery group: S34 Coding hand-off (BW-08) and S37 Build contracts and release readiness. Owner: this file only.
// Both screens sit inside the S35 project shell. All stories are NEW: Spekin has no built screen yet; OpenDesign is the primary reference.
// Data: sample/parts/delivery.mjs (DELIVERY_*). CSS: css/delivery.css (.del-*).
export const tier = 'Delivery: hand-off and build contracts';
export const order = 5;

export function boards(K) {
  const { S, ic, ib, btn, pill, note, NT, app, chatPanel, tabs, mini } = K;
  const M = S.DELIVERY_MANIFEST, IT = S.DELIVERY_ITEMS;
  const XI = {
    oct: '<path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86z"/><path d="M12 8v4M12 16h.01"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M3.3 17a9 9 0 1 1 17.4 0"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  };
  const I = (n, s = 14, sw = 1.75) => (XI[n] ? `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${XI[n]}</svg>` : ic(n, s, sw));
  const off = (label, does, f, cls = 'ghost') => `<button type="button" class="sp-btn ${cls}" aria-disabled="true" data-does="${does}" data-feature="${f}">${label}</button>`;
  const app34 = app, app37 = app;
  const hint = (t) => `<span class="del-kbd">${t}</span>`;

  // =====================================================================================================================
  // S34 Coding hand-off
  // =====================================================================================================================
  const right34 = btn('Share', { icon: 'share', later: 'Share and comment links (deferred in the browser MVP, R-WS-3)' }) + btn('Hand off', { cls: 'ink', icon: 'download', does: 'This screen is already open; the button reopens it with your last selection', f: 'F261' });
  const toolbar34 = (state = '') => `<div class="sp-tool"><span class="sp-crumb">Design${ic('chevR', 12)}<b>Coding hand-off</b></span><span class="del-chip">${ic('lock', 12)}Accepted revisions only</span>${state}<span class="sp-fill"></span>${btn('Whole-spec export (S25)', { sm: true, icon: 'doc', does: 'Opens S25, which exports the whole living spec. A hand-off does not replace it', f: 'F272' })}${ib('history', 'Hand-off history', { does: 'Lists earlier hand-offs: manifest, who, when. They never change', sm: true, f: 'F274' })}</div>`;
  const thumb = (x) => (x.thumb ? mini({ ...x.thumb, kpi: false, table: !x.thumb.chart, rows: 2, h: 48 }) : I(x.kind === 'ref' ? 'image' : 'doc', 20, 1.5));
  const itemRow = (x, o = {}) => {
    const dis = o.dis ?? !!x.reason, on = o.on ?? false, rev = o.rev ?? x.rev, why = o.reason ?? x.reason;
    const attrs = dis
      ? `aria-checked="false" aria-disabled="true" data-does="Cannot be ticked. ${why}" data-feature="F263"`
      : `aria-checked="${on}" data-does="${on ? 'Removes' : 'Adds'} ${x.id} ${rev} ${on ? 'from' : 'to'} the hand-off; the manifest on the right updates at once" data-feature="F262"`;
    const l3 = why ? `<span class="why${o.bad ? ' bad' : ''}">${ic('alert', 12)}${why}</span>` : `<span>${o.when ?? x.when}</span>`;
    return `<button type="button" role="checkbox" class="del-it${o.bad ? ' bad' : ''}" ${attrs}><span class="del-bx">${on ? ic('check', 11, 3) : dis ? ic('lock', 10, 2) : ''}</span><span class="del-th">${thumb(x)}</span><span class="t"><b>${x.id}<i>${rev}</i></b><span>${x.name}${x.size ? ' · ' + x.size : ''}</span>${l3}</span><span class="s">${pill([o.st ?? x.st, o.stText ?? x.stText])}</span></button>`;
  };
  const sub = (t, s = '') => `<div class="del-sub">${t}${s ? `<span>${s}</span>` : ''}</div>`;
  const left34 = ({ rows, foot, count = 6, filt = 'All' }) => `<section class="del-left del-col isnew" aria-label="Select revisions" data-feature="F262">${NT}
<div class="del-h"><h3>Select revisions</h3><span class="n">${count}</span><span class="sp-fill"></span><div class="sp-seg" role="group" aria-label="Filter">${[['All', 6], ['Accepted', 3], ['Not ready', 3]].map(([v, n]) => `<button type="button" aria-pressed="${v === filt}" data-does="Shows ${v === 'All' ? 'every item' : v === 'Accepted' ? 'only accepted revisions' : 'drafts, takes and references'}" data-feature="F263">${v} ${n}</button>`).join('')}</div></div>
<div class="del-list">${rows}</div>
<div class="del-lf">${btn('Select all accepted' + hint('⌘A'), { sm: true, does: 'Ticks every accepted revision; drafts, takes and references are never ticked', f: 'F263' })}${btn('Clear', { sm: true, cls: 'plain', does: 'Unticks everything', f: 'F262' })}<span class="sp-fill"></span><span>${foot}</span></div></section>`;
  const FWS = S.DELIVERY_FRAMEWORKS;
  const fwRow = (cur, chip) => `<div class="del-meta"><span class="del-fwl">Code framework</span><div class="sp-seg" role="group" aria-label="Code framework">${FWS.map(([id, n]) => `<button type="button" aria-pressed="${id === cur}" data-does="Writes ${n} into GUIDE.md and the pasted prompt; the frame files do not change" data-feature="F267">${n}</button>`).join('')}</div><span class="sp-fill"></span>${chip}</div>`;
  const finFresh = `<span class="del-chip seal">${ic('check', 12, 2.5)}DESIGN.md r3 fresh</span>${btn('Re-finalize', { sm: true, does: 'Regenerates DESIGN.md from the accepted frames only; changes no frame', f: 'F271' })}`;
  const finStale = `<span class="del-chip warn">${ic('alert', 12)}DESIGN.md r3 stale</span>${btn('Re-finalize (spec is stale)', { sm: true, cls: 'ink', does: 'Regenerates DESIGN.md from the accepted frames, with a spinner and Cancel; marks it fresh when done', f: 'F271' })}`;
  const rtabs = (cur, count, fin) => `<div class="del-rt"><div class="tabs" role="tablist">${[['Manifest', 'F264', count], ['Files', 'F266', ''], ['Agent prompt', 'F269', '']].map(([t, f, c]) => `<button type="button" role="tab" aria-selected="${t === cur}" data-does="Shows the ${t.toLowerCase()} of this hand-off" data-feature="${f}">${t}${c !== '' ? `<span class="c">${c}</span>` : ''}</button>`).join('')}</div><span class="sp-fill"></span><div class="fin">${fin}</div></div>`;
  const COLS = [124, 38, 90, 86, 74, 86, 132];
  const mhead = `<thead><tr>${['Frame', 'Rev', 'Size', 'sha256', 'HTML', 'Screenshot', 'Guide file'].map((h, i) => `<th style="width:${COLS[i]}px">${h}</th>`).join('')}</tr></thead>`;
  const mrow = (x, o = {}) => {
    const d = x.kind === 'design', g = d ? 'GUIDE.md#design' : 'GUIDE.md#' + x.id;
    return `<tr class="${o.cls || ''}"><td class="f"><button type="button" class="rb" data-does="Shows the full sha256 and file names of ${x.id} ${o.rev ?? x.rev} in manifest.json" data-feature="F264"><b>${x.id}</b><small>${x.name}</small></button></td><td><code>${o.rev ?? x.rev}</code></td><td>${d ? 'Markdown' : x.size}</td><td><code>${(o.sha ?? x.sha).slice(0, 8)}…</code></td><td>${o.html ?? x.html}</td><td>${d ? 'none' : o.png ?? x.png}</td><td><code>${g}</code></td></tr>`;
  };
  const mtable = (rows) => `<table class="sp-tbl del-mt">${mhead}<tbody>${rows}</tbody></table>`;
  const dlBtn = btn(I('box') + 'Download zip' + hint('⌘↵'), { cls: 'ink', does: 'Runs the privacy check, seals the manifest, then saves the zip; the server records who exported what', f: 'F266' });
  const cpBtn = btn(I('copy') + 'Copy for a coding agent' + hint('⌘⇧C'), { does: 'Copies one text block with the frame files, hashes and the guide for the chosen framework; a toast says what was copied', f: 'F267' });
  const act34 = (sum, subt, buttons = dlBtn + cpBtn) => `<div class="del-act"><div class="sum"><b>${sum}</b><span>${subt}</span></div>${buttons}</div>`;
  const main34 = ({ banner = '', st = '', left, right, foot, toast = '' }) => `<section class="sp-main" aria-label="Work area">
${tabs([['grid', 'Variance flows'], ['frame', 'F-03 Variance table'], ['download', 'Hand off', true]], right34)}
${banner}
${toolbar34(st)}
<div class="del-body">${left}<section class="del-right del-col isnew" aria-label="Hand-off bundle" data-feature="F264">${NT}${right}${foot}</section>${toast}</div></section>`;

  const chk = (rows, tag, foot) => `<div class="sp-gg isnew" data-feature="F273">${NT}<div class="gh"><span>Hand-off check · ${rows.length} items</span><button type="button" data-does="Shows the check as a plain table" data-feature="F273">Show as table</button></div><div class="sp-gc"><div class="k">${ic('lock', 12)}Before the file is made<span class="tag">${pill(tag)}</span></div><div class="sp-ck">${rows.map(([on, t, p]) => `<div><span class="bx ${on ? 'on' : ''}">${on ? ic('check', 10, 3) : ''}</span><span>${t}</span>${pill(p)}</div>`).join('')}</div><div class="ft"><span class="s">${foot}</span></div></div></div>`;
  const chat34 = (user, reply, card, suggs) => chatPanel({ title: 'Design chat', sub: 'hand-off', ctxItems: [['frame', 'F-01 Portfolio overview', 'r4'], ['frame', 'F-03 Variance table', 'r6'], ['doc', 'DESIGN.md', 'r3']], ctxFoot: '≈ 6.2k tokens · accepted revisions only', ph: 'Ask what is in the hand-off, or @ a frame…',
    msgs: `<div class="sp-ub">${user}</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 12 s · 6 cr</em></div><p>${reply}</p>${card}</div><div class="sp-sugg">${suggs.map((t) => `<button type="button" data-does="Puts this prompt in the composer; nothing runs until Send" data-feature="F273">${ic('spark', 13)}${t}</button>`).join('')}</div>` });

  // ---- S34 states
  const [F01, F03, F04, TAKES, REF, DSG] = IT;
  const G = (id) => IT.find((x) => x.id === id);
  const accepted = (...xs) => sub('Accepted revisions', '3 can be handed off') + xs.join('');
  const hold = (...xs) => sub('Not ready', 'greyed, with the reason') + xs.join('');
  const notReady = [itemRow(F04), itemRow(TAKES), itemRow(REF)];

  const zipFiles = (frames, design) => S.DELIVERY_FILES.filter(([n]) => (design || n !== 'DESIGN.md') && (frames === 2 || !n.includes('F-03')));
  const tree = (frames = 2, design = true) => {
    const f = zipFiles(frames, design), top = f.filter(([n]) => !n.includes('/')), fr = f.filter(([n]) => n.includes('/'));
    const r = ([n, s, h], cls = '') => `<div class="${cls}">${I('doc', 13)}<b>${n.replace('frames/', '')}</b><span>${s}</span><span>${h}…</span></div>`;
    return `<div class="del-tree" aria-label="Files in the zip"><div class="dir">${I('box', 13)}<b>${M.zip}</b><span>size</span><span>sha256</span></div>${top.map((x) => r(x)).join('')}<div class="dir">${ic('frame', 13)}<b>frames/</b><span></span><span></span></div>${fr.map((x) => r(x, 'in')).join('')}</div>`;
  };
  const sumBar = (frames, design) => (frames === 2 ? '2 frames' : '1 frame') + (design ? ' · DESIGN.md' : '') + ' · guide';
  const jsonLines = [
    ['{', ''], ['  "manifest": "m-0007", "spec": "r14", "framework": "react",', 'dim'], ['  "frames": [', ''],
    ['    { "id": "F-03", "revision": "r6", "size": "1440x900",', 'add'], ['      "html": "frames/F-03-r6.html", "screenshot": "frames/F-03-r6.png",', 'add'], ['      "sha256": "' + G('F-03').sha.slice(0, 32) + '…" },', 'add'],
    ['    …1 more frame', 'dim'], ['  ],', ''], ['  "excluded": ["F-04 draft", "F-03 takes", "REF-02"], "guide": "GUIDE.md"', 'dim'], ['}', ''],
  ];
  const code = (lines) => `<div class="del-code" aria-label="manifest.json">${lines.map(([t, c], i) => `<div class="${c}"><i>${i + 1}</i>${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</div>`).join('')}</div>`;

  // 1. Select revisions
  const v1 = (() => {
    const left = left34({ foot: '2 of 3 accepted ticked', rows: accepted(itemRow(F01, { on: true }), itemRow(F03), itemRow(DSG, { on: true })) + hold(...notReady) });
    const right = rtabs('Manifest', 2, finFresh) + `<div class="del-rb">${fwRow('react', `<span class="del-chip">Manifest <b>${M.id}</b> · draft</span>`)}
${mtable(mrow(F01) + mrow(DSG) + `<tr class="gone"><td colspan="7">F-03 Variance table r6 · not ticked yet</td></tr>`)}
${sub('Also in the zip', 'always included')}<div class="del-chips"><span class="del-chip">${I('doc', 12)}<b>manifest.json</b></span><span class="del-chip">${I('doc', 12)}<b>GUIDE.md</b></span></div>
${sub('Left out', '3 items')}<div class="del-chips"><span class="del-chip warn">F-04 draft</span><span class="del-chip">F-03 pending takes</span><span class="del-chip">REF-02 reference image</span></div></div>`;
    return app34({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat34('Hand off F-01 and the design guide.', 'Ticked F-01 r4 and DESIGN.md r3. F-03 r6 is accepted too; tick it when you want it in. F-04 stays out because it is a draft.', chk([[true, 'Only accepted revisions', ['ok', 'Yes']], [true, 'DESIGN.md is fresh', ['ok', 'r3']], [true, 'No keys, .env or private references', ['ok', 'Clear']], [false, 'F-04 draft is left out', ['warn', 'Draft']]], ['ok', 'Ready'], 'Checked 12:44 on the server'), ['Tick F-03 r6 as well', 'Explain why F-04 is left out']), main: main34({ left, right, foot: act34(sumBar(1, true), '≈ 0.2 MB · spec r14 · React') }) });
  })();

  // 2. Manifest preview
  const v2 = (() => {
    const left = left34({ foot: '3 of 3 accepted ticked', rows: accepted(itemRow(F01, { on: true }), itemRow(F03, { on: true }), itemRow(DSG, { on: true })) + hold(...notReady) });
    const right = rtabs('Manifest', 3, finFresh) + `<div class="del-rb">${fwRow('react', `<span class="del-chip">Manifest <b>${M.id}</b> · draft, seals on Download or Copy</span>`)}
${mtable(mrow(F01) + mrow(F03, { cls: 'sel' }) + mrow(DSG))}
${sub('manifest.json', 'F-03 r6 selected')}${code(jsonLines)}</div>`;
    return app34({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat34('Show me exactly what goes in the bundle.', 'The manifest lists F-01 r4, F-03 r6 and DESIGN.md r3 with their hashes. It is fixed when you download or copy; a later edit makes a new one.', chk([[true, 'Only accepted revisions', ['ok', 'Yes']], [true, 'Every file has a sha256', ['ok', '5 of 5']], [true, 'Guide file included', ['ok', 'GUIDE.md']]], ['ok', 'Ready'], 'Checked 12:45 on the server'), ['Compare with the last manifest', 'Copy the bundle']), main: main34({ left, right, foot: act34(sumBar(2, true), '≈ 0.5 MB · spec r14 · React') }) });
  })();

  // 3. Ready to download
  const v3 = (() => {
    const left = left34({ foot: '3 of 3 accepted ticked', rows: accepted(itemRow(F01, { on: true }), itemRow(F03, { on: true }), itemRow(DSG, { on: true })) + hold(...notReady) });
    const checks = [['Only accepted revisions', 'Yes'], ['DESIGN.md is fresh', 'r3'], ['No keys, .env or private references', 'Clear'], ['Drafts, takes and references left out', '3 items']];
    const right = rtabs('Files', 7, finFresh) + `<div class="del-rb">${fwRow('react', `<span class="del-chip seal">${ic('check', 12, 2.5)}Privacy check passed</span>`)}
${sub('In the zip', '7 files · ≈ 0.5 MB')}${tree(2, true)}
<div class="del-ro">${ic('lock', 14)}<span>The zip holds files and hashes only. It does not run anything, and it is not an execution command. Whole-spec export lives in S25.</span></div></div>`;
    return app34({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat34('Make the hand-off zip.', 'Ready: 7 files, about 0.5 MB, React guide. Download seals manifest m-0007.', chk([[true, 'Only accepted revisions', ['ok', 'Yes']], [true, 'DESIGN.md is fresh', ['ok', 'r3']], [true, 'No keys, .env or private references', ['ok', 'Clear']], [true, 'Zip under 25 MB', ['ok', '0.5 MB']]], ['ok', 'All clear'], 'Checked 12:46 on the server'), ['Download the zip', 'Copy for a coding agent instead']), main: main34({ left, right, foot: act34(sumBar(2, true), '≈ 0.5 MB · spec r14 · React') }) });
  })();

  // 4. Copied for an agent
  const toast = `<div class="del-toast isnew" role="status" data-feature="F268">${NT}<span class="ok">${ic('check', 15, 2.5)}</span><div><b>Copied for your coding agent</b><p>2 frames and DESIGN.md · manifest m-0007 · React · 1.9 KB of text.</p></div><button type="button" class="sp-ibtn" aria-label="Dismiss" data-does="Dismisses the toast; the clipboard keeps the text" data-feature="F268">${ic('x', 14)}</button><div class="row">Paste it into any coding agent, then say what to build ${hint('⌘V')}</div></div>`;
  const v4 = (() => {
    const left = left34({ foot: '3 of 3 accepted ticked', rows: accepted(itemRow(F01, { on: true }), itemRow(F03, { on: true }), itemRow(DSG, { on: true })) + hold(...notReady) });
    const lines = S.DELIVERY_PROMPT.map((t, i) => [t, i === 0 || t === 'Frames, accepted revisions only' ? 'hl' : /^ /.test(t) ? 'dim' : '']);
    const right = rtabs('Agent prompt', '', finFresh) + `<div class="del-rb">${fwRow('react', `<span class="del-chip seal">${ic('lock', 12)}Manifest <b>m-0007</b> sealed 12:47</span>`)}
${sub('What was copied', '14 lines · 1.9 KB')}${code(lines)}
<div class="del-meta">${btn('Copy as one link', { sm: true, icon: 'link', later: 'A single expiring link instead of the long text; expiry must be checked on the server (LATER)' })}<span class="del-fwl">Links would expire. The check belongs on the server, so it waits.</span></div></div>`;
    const foot = act34(sumBar(2, true), 'Copied 12:47 · manifest m-0007 sealed', dlBtn + btn(ic('check', 14, 2.5) + 'Copied', { does: 'Copies the same text again; the manifest stays m-0007', f: 'F267' }));
    return app34({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat34('Copy it for my coding agent.', 'Copied. The text lists F-01 r4 and F-03 r6 with their hashes, points to GUIDE.md first, and leaves F-04 out.', chk([[true, 'Only accepted revisions', ['ok', 'Yes']], [true, 'No keys, .env or private references', ['ok', 'Clear']], [true, 'Manifest m-0007 sealed', ['ok', '12:47']]], ['ok', 'Copied'], 'Export recorded: Rina, 12:47'), ['Show me the pasted text', 'Make a zip as well']), main: main34({ left, right, foot, toast }) });
  })();

  // 5. Blocked
  const v5 = (() => {
    const B = S.DELIVERY_BLOCKED;
    const banner = `<div class="sp-banner bad isnew" role="alert" data-feature="F270">${NT}${ic('alert', 16)}<p><b>Hand-off blocked.</b> 2 ticked items are not accepted revisions. Fix them or remove them; nothing is bundled until then.</p>${btn('Use accepted revisions', { sm: true, cls: 'ink', does: 'Swaps F-03 r5 for the accepted r6 and removes the draft F-04; accepts nothing', f: 'F270' })}${btn('Open review (S33)', { sm: true, does: 'Opens S33 so the draft F-04 can be reviewed and accepted there', f: 'F270' })}</div>`;
    const left = left34({ foot: '3 ticked · 2 need fixing', rows: sub('Selection from yesterday', 'restored') + itemRow(F01, { on: true }) + itemRow(F03, { on: true, rev: 'r5', bad: true, st: 'bad', stText: 'Stale r5', reason: 'r6 was accepted at 12:20. This is r5.', dis: false }) + itemRow(F04, { on: true, bad: true, st: 'warn', stText: 'Draft', dis: false }) + hold(itemRow(TAKES), itemRow(REF)) });
    const bl = B.map((b) => `<div class="it${b.ok ? '' : ' bad'}"><b>${b.id}</b><span class="rv">${b.rev}</span><span>${b.ok ? 'Accepted. Ready to bundle.' : b.kind + ': ' + b.text}</span>${b.ok ? pill(['ok', 'Ready']) : b.kind === 'Stale' ? btn('Pick r6', { sm: true, does: 'Replaces r5 with the accepted r6 in the selection', f: 'F270' }) : btn('Remove', { sm: true, does: 'Takes the draft out of the selection; the draft itself is untouched', f: 'F270' })}</div>`).join('');
    const right = rtabs('Manifest', 3, finFresh) + `<div class="del-rb">${fwRow('react', `<span class="del-chip warn">Manifest <b>m-0007</b> cannot be made</span>`)}
${sub('Why it is blocked', '2 of 3')}<div class="del-blk">${bl}</div>
${sub('After the fix', 'what changes')}${mtable(mrow(F03, { cls: 'fresh' }))}</div>`;
    const foot = act34('2 items need fixing', 'Off until every ticked item is accepted', off(I('box') + 'Download zip', 'Off until every ticked item is an accepted revision', 'F270', 'ink') + off(I('copy') + 'Copy for a coding agent', 'Off until every ticked item is an accepted revision', 'F270'));
    return app34({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chat34('Hand off everything I picked yesterday.', 'Two of the three picks are not ready. F-03 moved from r5 to r6, and F-04 is still a draft.', chk([[true, 'F-01 r4 is accepted', ['ok', 'Yes']], [false, 'F-03 r5 is the accepted revision', ['bad', 'Stale']], [false, 'F-04 r1 is accepted', ['warn', 'Draft']]], ['bad', 'Blocked'], 'Fix 2 items to continue'), ['Use the accepted revisions', 'Why is F-04 a draft?']), main: main34({ banner, left, right, foot }) });
  })();

  // 6. DESIGN.md stale
  const v6 = (() => {
    const F03n = { ...F03, rev: 'r7', when: 'Accepted 12:52', sha: S.DELIVERY_STALE.sha, html: S.DELIVERY_STALE.html, png: S.DELIVERY_STALE.png };
    const DSGs = { ...DSG, st: 'warn', stText: 'Stale' };
    const banner = `<div class="sp-banner warn isnew" role="status" data-feature="F271">${NT}${ic('alert', 16)}<p><b>DESIGN.md r3 is stale.</b> F-03 changed to r7 at 12:52, after it was finalized. Manifest m-0007 stays as exported; this selection makes m-0008.</p>${btn('Compare manifests', { sm: true, does: 'Shows m-0007 as exported and the draft m-0008 side by side; neither is changed', f: 'F265' })}</div>`;
    const left = left34({ foot: '2 of 3 accepted ticked', rows: accepted(itemRow(F01, { on: true }), itemRow(F03n, { on: true, st: 'ok', stText: 'Accepted r7' }), itemRow(DSGs, { dis: true, reason: 'Stale: F-03 r7 was accepted after it was finalized.' })) + hold(...notReady) });
    const right = rtabs('Manifest', 2, finStale) + `<div class="del-rb">${fwRow('react', `<span class="del-chip">Manifest <b>m-0008</b> · draft</span>`)}
${mtable(mrow(F01) + mrow(F03n, { cls: 'fresh' }) + `<tr class="gone"><td colspan="7">DESIGN.md r3 left out until it is re-finalized</td></tr>`)}
${sub('Changed since m-0007', 'exported 12:47, unchanged')}<div class="del-blk"><div class="it"><b>F-03</b><span class="rv">r6 → r7</span><span>Accepted 12:52. New sha256 <code>${S.DELIVERY_STALE.sha.slice(0, 8)}…</code></span>${pill(['warn', 'New in m-0008'])}</div><div class="it"><b>DESIGN.md</b><span class="rv">r3</span><span>Finalized 12:24, before F-03 r7. Re-finalize to rebuild it.</span>${pill(['warn', 'Stale'])}</div></div>
<div class="del-fin">${ic('refresh', 16)}<p>Re-finalize rebuilds DESIGN.md from the accepted frames only. It shows a spinner with Cancel and changes no frame.</p></div></div>`;
    return app34({ stage: 'design', save: ['ok', 'Saved 12:53'], chat: chat34('F-03 r7 is accepted. Hand off again.', 'F-03 r7 is in. DESIGN.md r3 no longer matches the frames, so I left it out. Re-finalize it and I will add it back.', chk([[true, 'Only accepted revisions', ['ok', 'Yes']], [false, 'DESIGN.md matches the frames', ['warn', 'Stale r3']], [true, 'No keys, .env or private references', ['ok', 'Clear']]], ['warn', '1 to fix'], 'Checked 12:53 on the server'), ['Re-finalize DESIGN.md', 'Compare m-0007 and m-0008']), main: main34({ banner, left, right, foot: act34('2 frames · guide · DESIGN.md left out', '≈ 0.5 MB · spec r14 · React · makes m-0008') }) });
  })();

  // =====================================================================================================================
  // S37 Build contracts and release readiness
  // =====================================================================================================================
  const B = S.DELIVERY_BUILD;
  const right37 = btn('Share', { icon: 'share', later: 'Share and comment links (deferred in the browser MVP, R-WS-3)' });
  const buildChip = `<span class="del-chip">${ic('lock', 12)}Build <b>${B.commit}</b> · ${B.env} · ${B.at}</span>`;
  const seg37 = (cur) => `<div class="sp-seg isnew" role="group" aria-label="Release readiness views" data-feature="F301">${NT}${[['Contracts', 'server', 'F301'], ['Readiness', 'grid', 'F305'], ['Release gate', 'flag', 'F307'], ['Evidence pack', 'doc', 'F312']].map(([v, i, f]) => `<button type="button" aria-pressed="${v === cur}" data-does="Shows ${v.toLowerCase()} for the pinned build" data-feature="${f}">${ic(i, 14)}${v}</button>`).join('')}</div>`;
  const tool37 = (cur, crumb) => `<div class="sp-tool">${seg37(cur)}<span class="sp-crumb">${crumb}</span><span class="sp-fill"></span>${buildChip}<span class="del-chip">${ic('eye', 12)}Read-only view</span>${ib('history', 'Revisions', { does: 'Lists earlier readiness snapshots; each is pinned and never edited', sm: true, f: 'F312' })}</div>`;
  const main37 = ({ tabsList, body, cur, crumb, banner = '', right = right37, noTool = false }) => `<section class="sp-main" aria-label="Work area">
${tabs(tabsList, right)}
${banner}
${noTool ? crumb : tool37(cur, crumb)}
<div class="del-body">${body}</div></section>`;
  const evl = (id, label = '') => `<button type="button" class="del-evl" data-does="Opens evidence ${id}${label ? ' (' + label + ')' : ''} in the Evidence pack, pinned to its build" data-feature="F306">${ic('link', 11)}${id}${label ? `<small>${label}</small>` : ''}</button>`;
  const glyph = (k) => `<span class="del-glyph ${k}">${k === 'ok' ? ic('check', 11, 3) : k === 'bad' ? ic('x', 11, 3) : k === 'warn' ? ic('alert', 10, 2.5) : ''}</span>`;
  const chat37 = (title, sub, ctxItems, user, reply, suggs, ph = 'Ask about a contract, a check or the release gate…') => chatPanel({ title, sub, ctxItems, ctxFoot: '≈ 5.4k tokens · secrets by name only', ph,
    msgs: `<div class="sp-ub">${user}</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 17 s · 8 cr</em></div><p>${reply}</p></div><div class="sp-sugg">${suggs.map((t) => `<button type="button" data-does="Puts this prompt in the composer; nothing runs until Send" data-feature="F316">${ic('spark', 13)}${t}</button>`).join('')}</div>` });
  const CTXB = [['server', 'API contract · variance alerts', 'r2'], ['db', 'Entity VarianceAlert', 'r1'], ['req', 'R-DASH-014', 'r14']];

  // 1. Contracts
  const C = S.DELIVERY_CONTRACTS;
  const cRow = (c) => `<tr class="${c.sel ? 'sel' : ''}"><td><span class="del-stg"><i>${c.n}</i>${c.stage}</span></td><td><button type="button" class="del-lnk" data-does="Opens ${c.name} with its version history and checks" data-feature="F302">${c.name}</button></td><td><span class="del-kind">${ic(c.ic, 13)}${c.kind}</span></td><td><span class="del-ver"><b>${c.ver}</b></span></td><td>${pill(c.st)}</td><td><code class="del-mono">${c.link}</code></td><td>${c.checks}</td></tr>`;
  const v7 = (() => {
    const body = `<div class="del-gate">
<div class="del-sum4"><div><span>Contracts</span><b>8</b></div><div><span>Accepted</span><b>1</b></div><div class="warn"><span>Needs review or draft</span><b>5</b></div><div class="bad"><span>Blocked</span><b>1</b></div></div>
<div class="del-meta"><div class="sp-seg" role="group" aria-label="Kind">${[['All kinds', 8], ['API contract', 1], ['Entity', 1], ['Migration', 1], ['Test definitions', 4], ['Checklist', 1]].map(([k, n], i) => `<button type="button" aria-pressed="${i === 0}" data-does="Shows only ${k === 'All kinds' ? 'every kind' : k.toLowerCase()}" data-feature="F301">${k} ${n}</button>`).join('')}</div><span class="sp-fill"></span><span class="del-fwl">A contract is a proposal until it is accepted in review. Accepting never writes to a database.</span></div>
<div class="del-tbw isnew" data-feature="F301">${NT}<table class="del-tb"><thead><tr><th style="width:118px">Stage</th><th>Contract</th><th style="width:158px">Kind</th><th style="width:70px">Version</th><th style="width:126px">Status</th><th style="width:176px">Linked requirements</th><th style="width:100px">Checks</th></tr></thead><tbody>${C.map(cRow).join('')}</tbody></table></div>
<div class="del-sub">What changed upstream</div>
<div class="del-ro">${ic('alert', 16)}<span>Spec r14 changed R-DASH-014 from 5% to 3%. The API contract and 1 test definition are marked Needs review. The r13 evidence is kept and can no longer verify r14.</span>${btn('Open the diff', { sm: true, cls: 'ink', does: 'Opens S08 with the r13 to r14 diff and the linked contract lines', f: 'F304' })}</div></div>`;
    return app37({ stage: 'backend', save: ['ok', 'Saved 12:41'], chat: chat37('Backend chat', 'contracts', CTXB, 'Which contracts hold up the release?', 'Four contracts are not accepted: the API contract needs review after r14, migration 0007 and the frontend tests are drafts, and the fixture contract is blocked by a failed run.', ['Open the API contract', 'Show only blocked contracts']), main: main37({ tabsList: [['flag', 'Release readiness', true], ['server', 'API contract · variance alerts'], ['db', 'Entity VarianceAlert']], cur: 'Contracts', crumb: `Backend${ic('chevR', 12)}<b>Contracts</b>`, body }) });
  })();

  // 2. Contract detail with checks
  const v8 = (() => {
    const CH = S.DELIVERY_CHECKS, cnt = (k) => CH.filter((c) => c.k === k).length;
    const doc = `<div class="sp-doc"><div class="meta">${pill(['warn', 'Needs review · r2'])}<span>Backend stage · contract, not code · no automatic database writes or migrations</span></div>
<h2>API contract: variance alerts</h2>
<div class="del-meta"><div class="del-vsw" role="group" aria-label="Version"><button type="button" aria-pressed="true" data-does="Shows r2, the current proposed revision" data-feature="F302">r2 current</button><button type="button" aria-pressed="false" data-does="Shows r1, the last accepted revision, read-only" data-feature="F302">r1 accepted</button></div>${btn('Diff r1 to r2', { sm: true, icon: 'diff', does: 'Opens the exact diff between r1 and r2 in S08 review', f: 'F302' })}<span class="sp-fill"></span><span class="del-fwl">Edited 12:38 · linked to R-DASH-014, 015, 019</span></div>
<table class="sp-tbl"><thead><tr><th style="width:64px">Method</th><th>Path</th><th style="width:110px">Requirement</th><th style="width:72px">Role</th><th style="width:116px">Status</th></tr></thead><tbody>${S.BACKEND.endpoints.map(([m, p, r, a, st]) => `<tr><td><code>${m}</code></td><td><code>${p}</code></td><td><code>${r}</code></td><td>${a}</td><td>${pill(st)}</td></tr>`).join('')}</tbody></table>
<h3>Response fixture, GET /projects/{id}/variance-alerts</h3>
${code([['{ "items": [', ''], ['  { "package_id": "P-03", "variance_pct": "6.40",', 'del'], ['    "periods_over": 2, "threshold_rev": "r13" }', 'del'], ['] }', '']])}
<h3>Changed in r2</h3><div class="del-blk"><div class="it"><b>R-DASH-019</b><span class="rv">new</span><span>POST acknowledge added for alerts that stay over 3% for 2 periods.</span>${pill(['acc', 'Proposal'])}</div></div></div>`;
    const side = `<aside class="del-side isnew" aria-label="Contract checks" data-feature="F303">${NT}<div><div class="del-sub flush">Contract checks<span>6 on r2</span></div><span class="del-fwl">${cnt('ok')} passed · ${cnt('bad')} failed · ${cnt('warn')} to review · ${cnt('mute')} missing</span></div>
<div class="del-ck">${CH.map((c) => `<div class="it${c.k === 'bad' ? ' bad' : ''}">${glyph(c.k)}<div class="b"><div class="a"><span>${c.t}</span>${pill([c.k === 'warn' ? 'warn' : c.k, c.p])}</div>${c.why ? `<div class="w">${c.why}</div>` : ''}<div class="z">${c.ev ? evl(c.ev) : `<span class="del-fwl">No evidence recorded</span>`}</div></div></div>`).join('')}</div></aside>`;
    const body = doc + side;
    return app37({ stage: 'backend', save: ['ok', 'Saved 12:41'], chat: chat37('Backend chat', 'contract r2', CTXB, 'Check this contract against the new 3% threshold.', 'The GET endpoint cites r13, so it still says 5%. POST acknowledge has no role, and no breaking-change check was recorded. Three of six checks pass.', ['Propose a fix for the role', 'Draft the missing diff check']), main: main37({ tabsList: [['server', 'API contract · variance alerts', true], ['db', 'Entity VarianceAlert'], ['flag', 'Release readiness']], cur: 'Contracts', crumb: `Backend${ic('chevR', 12)}<b>API contract</b>`, body }) });
  })();

  // 3. Readiness matrix
  const v9 = (() => {
    const pg = (d, t) => (t ? `<span class="del-pg"><i><u style="width:${Math.round((d / t) * 100)}%"></u></i>${d} of ${t}</span>` : `<span class="del-pg na">none</span>`);
    const SM = Object.fromEntries(S.STAGES.map((s) => [s.id, s]));
    const dotk = (k) => (k === 'ring' ? 'ring' : k);
    const mrow37 = ([id, ad, at, pd, pt, td, tt, ev, blk]) => {
      const s = SM[id];
      return `<tr class="${id === 'integration' ? 'cur' : ''}"><td><button type="button" class="del-lnk" data-does="Opens the ${s.name} stage with its artifact list and blockers" data-feature="F305"><span class="del-stg"><i>${s.n}</i>${s.name}</span></button><small><span class="del-st"><span class="dot ${dotk(s.st)}"></span>${s.text}</span></small></td><td>${pg(ad, at)}</td><td>${pg(pd, pt)}</td><td>${pg(td, tt)}</td><td>${ev.length ? ev.map(([e, l]) => evl(e)).join('') + (ev.length > 1 ? '' : '') : `<span class="del-fwl">no evidence</span>`}</td><td class="w">${blk ? `<span class="del-st">${ic(s.st === 'bad' ? 'alert' : 'chevR', 12)}${blk}</span>` : `<span class="del-fwl">none</span>`}</td></tr>`;
    };
    const tbl = `<div class="del-tbw isnew" data-feature="F305">${NT}<table class="del-tb"><thead><tr><th style="width:166px">Stage and status</th><th style="width:98px">Artifacts</th><th style="width:98px">Approvals</th><th style="width:98px">Tests</th><th style="width:112px">Evidence</th><th>Blocker</th></tr></thead><tbody>${S.DELIVERY_MATRIX.map(mrow37).join('')}</tbody></table></div>`;
    const side = `<aside class="del-side" aria-label="Stage readiness"><div class="del-sh"><div class="r"><b>Integration readiness</b>${pill(['bad', 'Blocked · 1'])}</div><span class="del-fwl">Derived from required artifacts, approvals and evidence. Never typed in.</span></div>
<div class="del-sub">Required artifacts<span>1 of 4</span></div>
<div class="del-ck">${[['ok', 'Integration plan', 'Accepted r1', ''], ['bad', 'Contract fixtures, GET alerts', 'Failed', 'EV-0447'], ['mute', 'POST acknowledge fixture', 'Skipped', ''], ['mute', 'Cost-lines fixture', 'Skipped', '']].map(([k, n, p, e]) => `<div class="it${k === 'bad' ? ' bad' : ''}">${glyph(k)}<div class="b"><div class="a"><span>${n}</span>${pill([k, p])}</div>${e ? `<div class="z">${evl(e)}</div>` : ''}</div></div>`).join('')}</div>
<div class="sp-ready"><div class="t">Next proposed action<span class="pill warn">Proposal</span></div><p>Fix the contract so variance_pct is a number, then re-run the fixture. Nothing is applied until reviewed.</p>${btn('Propose a contract fix', { cls: 'ink', sm: true, does: 'Adds a proposed contract change to S08 review with its exact diff; no code or run is started', f: 'F309' })}</div></aside>`;
    return app37({ stage: 'integration', save: ['ok', 'Saved 12:41'], chat: chat37('Integration chat', 'readiness', [['server', 'API contract · variance alerts', 'r2'], ['doc', 'Run #38 log', 'b4a1f9c'], ['req', 'R-DASH-014', 'r14']], 'Where does the release stand across all eight stages?', 'Two stages are ready, Design and Backend still need review, and Integration is blocked by one failed fixture run. Deployment waits on Testing.', ['Open the blocked run', 'Which stages lack evidence?']), main: main37({ tabsList: [['flag', 'Release readiness', true], ['server', 'API contract · variance alerts']], cur: 'Readiness', crumb: `Integration${ic('chevR', 12)}<b>All eight stages</b>`, body: `<div class="del-gate">${tbl}<div class="del-ro">${ic('lock', 14)}<span>A stage is Ready only when its required artifacts, approvals and evidence exist. Opening a stage never marks it ready.</span></div></div>` + side }) });
  })();

  // 4. Release gate blocked
  const v10 = (() => {
    const GT = S.DELIVERY_GATE;
    const cards = GT.map((g) => `<div class="del-gc"><div class="tt">${ic(g.ic, 15)}${g.title}${pill(g.pill)}</div><div class="bg">${g.big}<small>${g.sub}</small></div>${g.id === 'perf' ? `<div class="del-bar"><u style="width:100%"></u><i style="left:86%"></i></div><div class="del-barl"><span>0 s</span><span>budget 2.5 s</span></div>` : g.id === 'tests' ? `<div class="del-bar"><u class="ok" style="width:36%"></u></div><div class="del-barl"><span>4 passed</span><span>7 without a result</span></div>` : ''}<p>${g.reason}</p><div class="z">${g.ev.map(([e, l]) => evl(e, l)).join('')}${btn('Propose fix', { sm: true, cls: 'plain', does: 'Drafts a proposed ticket for this gate check; it goes to S08 review first', f: 'F309' })}</div></div>`).join('');
    const head = `<div class="del-gh isnew" data-feature="F307">${NT}<span></span><div><h2>Release gate: blocked, 4 reasons</h2><p>Pinned to build ${B.commit} on ${B.env}, spec r14. Release readiness needs all four checks to pass. Spekin records readiness; it does not deploy.</p></div><div class="ac">${btn('Request owner exception', { sm: true, does: 'Asks the owner for an exception with a written reason; it stays labelled Exception, not verified', f: 'F308' })}${btn('Propose fix tickets', { sm: true, cls: 'ink', does: 'Drafts one proposed ticket per failing check; nothing joins the task list until accepted in S08', f: 'F309' })}</div></div>`;
    const side = `<aside class="del-side" aria-label="Gate history"><div class="del-sub flush">Gate history</div><div class="del-hist"><div><b>12:31</b><span>Blocked, 4 reasons. Run #38 failed.</span></div><div><b>11:58</b><span>Blocked, 5 reasons. F-04 was a draft.</span></div><div><b>11:20</b><span>Blocked, 5 reasons. Run #36 queued.</span></div><div><b>20 Nov</b><span>Not evaluated. No build was pinned.</span></div></div>
<div class="del-exc"><div class="t">Owner exception${pill(['mute', 'None'])}</div><p>An exception records who, why and for which check. It shows as Exception, not verified, and never turns a check green.</p>${btn('Write the reason', { sm: true, does: 'Opens a short form: check, reason and expiry; saved to the audit record', f: 'F308' })}</div>
<div class="del-ro push">${ic('lock', 14)}<span>No deploy, retry or merge runs from here. Viewers can read every check and cannot change one.</span></div></aside>`;
    return app37({ stage: 'deploy', save: ['ok', 'Saved 12:41'], chat: chat37('Deployment chat', 'release gate', [['flag', 'Release checklist', 'r1'], ['doc', 'Build b4a1f9c', 'staging'], ['req', 'Spec', 'r14']], 'Can we release build b4a1f9c?', 'Not yet. Four checks block it: 7 criteria have no result, the table is 0.4 s over budget, there is no accessibility report for this build, and the auth rules are missing.', ['List what each reason needs', 'Draft tickets for all four']), main: main37({ tabsList: [['flag', 'Release readiness', true], ['server', 'API contract · variance alerts']], cur: 'Release gate', crumb: `Deployment${ic('chevR', 12)}<b>Release gate</b>`, body: `<div class="del-gate">${head}<div class="del-gg">${cards}</div></div>` + side }) });
  })();

  // 5. Run failure
  const v11 = (() => {
    const R = S.DELIVERY_RUN;
    const err = `<div class="del-err isnew" role="alert" data-feature="F310">${NT}<h3>${I('oct', 16, 2)}Integration run failed: the response does not match the contract</h3><p>${R.id} on build ${R.commit} called <code>GET /projects/{id}/variance-alerts</code> and got <code>variance_pct</code> as text. Contract r2 says a number with two decimals. 2 of 3 fixture calls did not run.</p><div class="ft"><span class="s">${R.check} · ${R.at} · read-only record</span>${btn('Show log', { sm: true, cls: 'plain', does: 'Opens the redacted run log; keys and tokens are masked', f: 'F311' })}${btn('Retry run', { sm: true, later: 'Needs a runner. Spekin has none in the browser MVP, so it cannot retry CI (R-DEL-2)' })}${btn('Propose contract fix', { sm: true, cls: 'ink', does: 'Adds a proposed fix to S08 review: variance_pct typed as a number, with the diff', f: 'F310' })}</div></div>`;
    const steps = `<div class="del-steps isnew" data-feature="F311">${NT}${R.steps.map(([k, t, s, d]) => `<div class="${k === 'bad' ? 'bad' : ''}">${glyph(k === 'mute' ? 'mute' : k)}<span>${t.startsWith('GET') || t.startsWith('POST') ? `<code>${t}</code>` : t}</span>${pill([k, s])}<span>${d}</span></div>`).join('')}</div>`;
    const cls = `<aside class="del-side wide" aria-label="Classification"><div class="del-sub flush">Classified as<span>from the run record</span></div><div class="del-cls" role="group" aria-label="Failure class">${R.classes.map(([c, on]) => `<button type="button" aria-pressed="${on}" data-does="Reclassifies the failure as ${c.toLowerCase()}; the repair options follow the class" data-feature="F310">${c}</button>`).join('')}</div>
<div class="del-ro">${ic('spark', 14)}<span>Matched by a schema diff on one field. Environment errors, timeouts and permission errors show different repairs.</span></div>
<div class="del-sub">Expected and received</div>${code([['- variance_pct: decimal(5,2)', 'add'], ['+ variance_pct: "6.40"', 'del'], ['  periods_over: 2', 'dim'], ['  threshold_rev: "r13"', 'dim']])}
<div class="del-ro">${ic('lock', 14)}<span>This card reports a run Spekin did not start. It cannot retry, merge or deploy.</span></div></aside>`;
    const mid = `<div class="del-gate">${err}<div class="del-sub">Steps<span>applied, failed, skipped and unknown are listed apart; no rollback is claimed</span></div>${steps}</div>`;
    return app37({ stage: 'integration', save: ['ok', 'Saved 12:41'], chat: chat37('Integration chat', 'run #38', [['doc', 'Run #38 log', 'b4a1f9c'], ['server', 'API contract · variance alerts', 'r2'], ['db', 'Entity VarianceAlert', 'r1']], 'Why did the integration run fail?', 'The fixture server returned variance_pct as text. That is a contract mismatch, not an environment problem. I can propose a contract fix for review.', ['Propose the contract fix', 'Show the redacted log']), main: main37({ tabsList: [['flag', 'Release readiness'], ['doc', 'Run #38 · integration-contract', true]], cur: '', crumb: `<div class="sp-tool"><span class="sp-crumb">Integration${ic('chevR', 12)}<b>${R.id}</b></span><span class="del-chip warn">${ic('alert', 12)}Failed 12:31</span><span class="sp-fill"></span>${buildChip}<span class="del-chip">${ic('eye', 12)}Read-only view</span></div>`, noTool: true, body: mid + cls }) });
  })();

  // 6. Evidence pack
  const v12 = (() => {
    const T = S.DELIVERY_TIMELINE;
    const pins = [['Spec', '<code>r14</code> accepted, 9 requirement revisions'], ['Frames', '<code>F-01 r4</code> · <code>F-03 r6</code> · DESIGN.md <code>r3</code>'], ['Build', '<code>' + B.commit + '</code> on ' + B.env + ', observed ' + B.at], ['Tools', 'Contract checker 0.9, test runner, browser budget run'], ['Record', B.pack + ' · pinned, never edited']];
    const pinsH = `<div class="del-pins">${pins.map(([k, v]) => `<span>${k}</span><div>${v}</div>`).join('')}</div>`;
    const tl = `<div class="del-tbw isnew" data-feature="F313">${NT}<table class="del-tb"><thead><tr><th style="width:152px">Source</th><th>Observation</th><th style="width:108px">Observed</th><th style="width:114px">Outcome</th><th style="width:132px">Linked to</th></tr></thead><tbody>${T.map(([s, w, o, p, l, n]) => `<tr><td><b>${s}</b></td><td class="w">${w}<small>${n}</small></td><td>${o}</td><td>${pill(p)}</td><td><code class="del-mono">${l || 'none'}</code></td></tr>`).join('')}</tbody></table></div>`;
    const side = `<aside class="del-side" aria-label="Evidence summary"><div class="del-sub flush">Acceptance criteria<span>11 required</span></div><div class="del-sum4 two"><div><span>Passed</span><b>4</b></div><div><span>Failed</span><b>0</b></div><div class="warn"><span>Untested</span><b>6</b></div><div class="bad"><span>Evidence missing</span><b>1</b></div></div>
<div class="del-ro">${ic('alert', 14)}<span>Missing evidence is never shown as passed. 3 gaps are proposed as tickets and wait for review in S08.</span></div>
<div class="del-sub">Export</div>${btn(I('box') + 'Download evidence pack', { cls: 'ink', does: 'Saves a zip of the pins, outcomes and evidence links; secrets are masked and private references stay out', f: 'F315' })}${btn('Open in S25 export', { does: 'Opens S25 to include this pack in the whole-spec export', f: 'F315' })}
<div class="del-ro push">${ic('lock', 14)}<span>Export is recorded: actor, pack, time. Viewers can read the pack and cannot export it.</span></div></aside>`;
    return app37({ stage: 'deploy', save: ['ok', 'Saved 12:41'], chat: chat37('Deployment chat', 'evidence', [['flag', 'Release checklist', 'r1'], ['doc', 'Evidence pack RC-0003', 'b4a1f9c']], 'What evidence do we have for the release?', 'One failed check, one job waiting, a stale staging deploy and no production observation. A green main build exists, but it is another commit, so it does not count.', ['Open the failed check', 'Propose tickets for the 3 gaps']), main: main37({ tabsList: [['flag', 'Release readiness', true], ['server', 'API contract · variance alerts']], cur: 'Evidence pack', crumb: `Deployment${ic('chevR', 12)}<b>RC-0003</b>`, body: `<div class="del-gate">${pinsH}${tl}</div>` + side }) });
  })();

  // ---- notes (navy): behaviour a still picture cannot show
  const N = {
    s1a: note('<b>Hover a greyed row</b>: its reason shows beside it. Drafts, pending takes, references and stale revisions cannot be ticked.', 'left:36px;top:680px;max-width:280px'),
    s1b: note('<b>Tick a row</b>: the manifest on the right gains its row at once. Nothing is written until you Download or Copy.', 'left:768px;top:608px;max-width:280px'),
    s2a: note('<b>Click a manifest row</b>: manifest.json below jumps to that frame. The hash is of the HTML file exactly as bundled.', 'left:36px;top:660px;max-width:280px'),
    s2b: note('<b>Download or Copy</b> seals m-0007. A later edit to F-03 never changes it; the next hand-off becomes m-0008.', 'left:468px;top:768px;max-width:290px'),
    s3a: note('<b>Download zip</b>: the privacy check runs first, then the browser saves the file. The server records who, what and when.', 'left:36px;top:664px;max-width:280px'),
    s3b: note('<b>A privacy hit</b> stops the download and names the item. Keys, .env files and private references never enter the zip.', 'left:768px;top:708px;max-width:290px'),
    s4a: note('<b>Copy for a coding agent</b>: one text block goes to the clipboard. The toast names what went in and fades after 6 s; hover keeps it.', 'left:36px;top:648px;max-width:280px'),
    s4b: note('<b>Paste it</b> into any coding agent and add what to build. The agent gets file names and hashes, not a command to run.', 'left:1116px;top:652px;max-width:290px'),
    s5a: note('<b>Pick r6</b> swaps the stale revision for the accepted one. <b>Remove</b> only unticks; the draft stays as it is.', 'left:36px;top:648px;max-width:280px'),
    s5b: note('<b>Disabled buttons</b> carry the reason in words under the summary, not in a popup that vanishes.', 'left:768px;top:668px;max-width:290px'),
    s6a: note('<b>Accept F-03 r7</b> in review and DESIGN.md turns stale at once. Spekin never regenerates it unasked.', 'left:36px;top:660px;max-width:280px'),
    s6b: note('<b>Re-finalize</b> shows a spinner with Cancel, then marks DESIGN.md fresh. No frame changes while it runs.', 'left:768px;top:708px;max-width:290px'),
    t1a: note('<b>Click a contract</b>: it opens in its own tab with versions and checks. Status words are never colour alone.', 'left:376px;top:808px;max-width:290px'),
    t1b: note('<b>Upstream change</b>: accepting spec r14 marks linked contracts Needs review. Older evidence is kept, not reused.', 'left:768px;top:808px;max-width:290px'),
    t2a: note('<b>Evidence link</b> opens that run in the pack, pinned to its build. No link means no evidence.', 'left:376px;top:716px;max-width:290px'),
    t2b: note('<b>Version switch</b>: r1 is read-only. A check on r2 never borrows r1 evidence.', 'left:768px;top:716px;max-width:290px'),
    t3a: note('<b>Click a stage</b>: its artifacts and blockers open here. Opening never marks a stage ready.', 'left:376px;top:708px;max-width:290px'),
    t3b: note('<b>Ready is derived</b> from required artifacts, approvals and evidence. An owner exception shows apart from verified.', 'left:768px;top:708px;max-width:290px'),
    t4a: note('<b>Open a reason</b>: Propose fix drafts a ticket, reviewed in S08 before it joins the task list.', 'left:376px;top:748px;max-width:290px'),
    t4b: note('<b>No deploy button exists.</b> The gate says ready or blocked; deployment stays outside Spekin.', 'left:768px;top:748px;max-width:290px'),
    t5a: note('<b>Reclassify</b> and the repair options change with the class: environment, timeout and permission each differ.', 'left:376px;top:768px;max-width:290px'),
    t5b: note('<b>Retry</b> is LATER. Spekin cannot start CI in the browser MVP; a repair is a proposal that needs review.', 'left:768px;top:768px;max-width:290px'),
    t6a: note('<b>Stale and unknown stay apart</b> from passed. An unrelated green build is shown, but not linked.', 'left:376px;top:768px;max-width:290px'),
    t6b: note('<b>Export</b> records actor, pack and time. Secrets are masked and private references stay out.', 'left:768px;top:768px;max-width:290px'),
  };

  const V = (id, label, html, entry, data) => ({ id, label, html, entry, data });
  const P34 = 'sample/parts/delivery.mjs → ';
  return [{
    file: 'S34-coding-handoff', code: 'S34', tier: 'DELIVERY', name: 'Coding hand-off',
    ext: 'New. Opens from Hand off in the S35 shell. Downloads or copies only accepted revisions with a fixed manifest. It does not replace S25 (whole-spec export). Uses S29 frames and S33 review outcomes.',
    lives: 'Spekin web app · /p/meranti-yard/design/handoff (selection in the query as frame IDs and revisions only; never file contents or keys).',
    views: [
      V('select', 'Select revisions', v1 + N.s1a + N.s1b, 'Projects > Meranti Yard > Design > Hand off.', P34 + 'DELIVERY_ITEMS (F-01, F-03, F-04, takes, REF-02, DESIGN.md), DELIVERY_FRAMEWORKS.'),
      V('manifest', 'Manifest preview', v2 + N.s2a + N.s2b, 'Hand off > tick F-03 r6 > click its manifest row.', P34 + 'DELIVERY_ITEMS, DELIVERY_MANIFEST (m-0007), sha256 per file.'),
      V('ready', 'Ready to download', v3 + N.s3a + N.s3b, 'Hand off > Files tab.', P34 + 'DELIVERY_FILES, DELIVERY_MANIFEST.zip.'),
      V('copied', 'Copied for an agent', v4 + N.s4a + N.s4b, 'Hand off > Copy for a coding agent.', P34 + 'DELIVERY_PROMPT, DELIVERY_FRAMEWORKS.'),
      V('blocked', 'Blocked', v5 + N.s5a + N.s5b, 'Hand off > reopen yesterday’s selection (F-03 r5, F-04).', P34 + 'DELIVERY_BLOCKED.'),
      V('stale', 'DESIGN.md stale', v6 + N.s6a + N.s6b, 'Design > accept F-03 r7 in review > Hand off.', P34 + 'DELIVERY_STALE, DELIVERY_ITEMS (DESIGN.md r3).'),
    ],
    side: {
      must: [
        'Only accepted revisions can be ticked. Drafts, pending takes, references and stale revisions are greyed, with the reason in words beside them.',
        'The manifest preview shows frame ID, revision, size, sha256, HTML, screenshot and guide file before anything is saved or copied.',
        'Download or Copy seals manifest m-0007. A later edit to a frame never changes it; the next hand-off is a new manifest.',
        'Copy for a coding agent puts one text block on the clipboard and a toast names what went in.',
        'A hand-off is not an execution command and does not replace the whole-spec export (S25).',
        'DESIGN.md turns stale when an accepted frame changes; Re-finalize rebuilds it from accepted frames only.',
      ],
      motion: [
        ['Tick a row', 'Checkbox fills in 120 ms (spring-ui); the manifest row rises 4 px and fades in over 160 ms.'],
        ['Manifest', 'Rows cross-fade 160 ms. Hash text never animates, so it can be read and compared.'],
        ['Toast', 'Rises 8 px and fades in over 220 ms with cubic-bezier(0.23,1,0.32,1). Stays 6 s; hover or focus keeps it; fades out in 140 ms.'],
        ['Copy button', 'Label swaps to Copied with a check in 140 ms and returns after 2 s.'],
        ['Re-finalize', 'Spinner with Cancel while pending, no progress bar without a real value; the label changes with a 140 ms fade.'],
        ['Reduce Motion', 'No rise or slide. Changes are instant and still announced to screen readers.'],
      ],
      stories: [
        ['F261', 'new', 'Hand-off screen opens from Hand off in the S35 shell, takes accepted revisions only and is not an execution command (R-WS-8, AC-58, AC-SPK-11).', 'PRD'],
        ['F262', 'new', 'Select list of frames and artifacts: checkbox, thumbnail, revision, status word (R-WS-8, S29).', 'OpenDesign'],
        ['F263', 'new', 'Drafts, pending takes, references and stale revisions are disabled with the reason; filters and Select all accepted (R-WS-8, R-WF-4).', 'PRD'],
        ['F264', 'new', 'Manifest preview: frame ID, revision, size, sha256, HTML, screenshot and guide file (R-EVD-4, FR-44).', 'Paraframe'],
        ['F265', 'new', 'Manifest is fixed when sealed; a later edit makes a new manifest and leaves the old one (R-WS-8, R-EVD-4, AC-SPK-11).', 'PRD'],
        ['F266', 'new', 'Download zip with a visible file tree and hashes (R-WS-8, AC-58).', 'PRD'],
        ['F267', 'new', 'Copy for a coding agent with a framework choice: React, Vue.js, Svelte, Next.js, JS (FR-43, HandoffButton).', 'OpenDesign'],
        ['F268', 'new', 'Confirmation toast that says what was copied; fades, hover keeps it (FR-43).', 'Paraframe'],
        ['F269', 'new', 'Pasted bundle preview: per-frame ID, size, files and hashes, plus a separate guide (FR-44, FR-45).', 'Paraframe'],
        ['F270', 'new', 'Blocked state when a draft or stale revision is ticked: reasons, Pick r6, Remove, buttons off (R-WS-8, R-WF-4, R-EVD-4).', 'PRD'],
        ['F271', 'new', 'Finalize design package: DESIGN.md regenerated from accepted frames, marked stale when frames change (FinalizeDesignButton).', 'OpenDesign'],
        ['F272', 'new', 'Whole-spec export stays in S25; hand-off links to it and never replaces it (R-WS-8, `7.16).', 'PRD'],
        ['F273', 'new', 'Hand-off check card in the chat before a file is made: keys, .env and private references stay out (R-SEC-2, R-SEC-4).', 'Onlook'],
        ['F274', 'new', 'Export record: actor, action, manifest, time; hand-off history never changes (R-SEC-5, R-EVD-4).', 'PRD'],
        ['F275', 'new', 'LATER: one expiring link instead of the long text; expiry must be validated on the server (FR-45, R-SEC-4).', 'Paraframe'],
      ],
      where: '<span><b>Route:</b> <code>/p/:project/design/handoff</code>, selection in the query as frame IDs and revisions. Back and Forward restore it and never download or copy.</span><span><b>UI (TS/React):</b> OpenDesign Studio patterns, Apache-2.0 reuse candidates at commit <code>e033aad</code>: <code>HandoffButton</code> (framework choice, copy prompt, Copied state), <code>FinalizeDesignButton</code> (three labels, stale flag). NOTICE file needed. The open-in-editor part is skipped.</span><span><b>Core (Rust):</b> accepted-revision check, manifest, sha256, zip, privacy pre-check and the export record (R-EVD-4, R-ARC-3). The browser never decides what is accepted.</span><span><b>Open for Enrico:</b> framework list (OpenDesign also has SolidJS; drawn without it) · whether a stale DESIGN.md blocks or is left out (drawn: left out) · link expiry (LATER).</span>',
    },
    refs: {
      note: 'OpenDesign (Apache-2.0, commit e033aad) is the main reference. Paraframe is described, not copied: no wording or assets are reused.',
      shots: [
        { img: 'od-app-preview.png', cap: '<b>OpenDesign header.</b> Share and Download sit in the tab bar. Spekin keeps them there and opens a Hand off screen from the button.' },
        { img: 'od-share-popup.png', cap: '<b>OpenDesign share popup.</b> A small panel with a link, one Copy action and a status line. Spekin’s toast follows this size, with its own wording.' },
        { img: 'od-studio-document.png', cap: '<b>OpenDesign document.</b> Files from this turn are listed under the reply. The zip file tree lists files the same way.' },
      ],
    },
  }, {
    file: 'S37-build-contracts', code: 'S37', tier: 'DELIVERY', name: 'Build contracts and release readiness',
    ext: 'New. The Frontend-to-Deployment half of the S35 shell: contracts per stage, readiness across all eight stages, a release gate that blocks with reasons, run failures and the evidence pack. Uses S15 tasks, S18 evidence and S25 export. No deployment executor.',
    lives: 'Spekin web app · /p/meranti-yard/backend (contracts) and /p/meranti-yard/deploy (gate and pack); artifact in the query.',
    views: [
      V('contracts', 'Contracts', v7 + N.t1a + N.t1b, 'Projects > Meranti Yard > Backend > Release readiness > Contracts.', 'sample/parts/delivery.mjs → DELIVERY_CONTRACTS.'),
      V('detail', 'Contract detail', v8 + N.t2a + N.t2b, 'Contracts > click API contract, variance alerts.', 'sample/parts/delivery.mjs → DELIVERY_CHECKS; sample/meranti-yard.mjs → BACKEND.'),
      V('matrix', 'Readiness matrix', v9 + N.t3a + N.t3b, 'Integration > Release readiness > Readiness.', 'sample/parts/delivery.mjs → DELIVERY_MATRIX; sample/meranti-yard.mjs → STAGES.'),
      V('gate', 'Release gate blocked', v10 + N.t4a + N.t4b, 'Deployment > Release readiness > Release gate.', 'sample/parts/delivery.mjs → DELIVERY_GATE, DELIVERY_BUILD.'),
      V('fail', 'Run failure', v11 + N.t5a + N.t5b, 'Integration > Readiness > click the failed stage > Run #38.', 'sample/parts/delivery.mjs → DELIVERY_RUN.'),
      V('evidence', 'Evidence pack', v12 + N.t6a + N.t6b, 'Deployment > Release readiness > Evidence pack.', 'sample/parts/delivery.mjs → DELIVERY_TIMELINE, DELIVERY_BUILD.'),
    ],
    side: {
      must: [
        'Contracts are grouped by stage: API contract, entity, migration and test definitions, each with a version and a status in words.',
        'Readiness for each of the eight stages is derived from required artifacts, approvals and evidence. Opening a stage never changes it.',
        'Every check reports passed, failed, untested or evidence missing, with an evidence link pinned to a build. Missing is never passed.',
        'The release gate blocks with one reason per check and names the build it judged. There is no deploy button.',
        'A failed run shows one title, one paragraph, its class and a repair that goes to review. It never retries, merges or deploys.',
        'Unknown, stale and unavailable observations stay apart from passed; an unrelated green build is not linked.',
      ],
      motion: [
        ['View switch', 'Content cross-fades 160 ms with a 4 px slide (spring-ui). The latest click wins.'],
        ['Matrix bars', 'Grow 200 ms on first show only; later changes swap the number with a 140 ms fade.'],
        ['Gate reasons', 'List in with a 40 ms stagger (OpenDesign), 220 ms each, ease cubic-bezier(0.23,1,0.32,1). The header does not move.'],
        ['Run failure card', 'Height reveal 180 ms; focus moves to the title. Actions stay in place.'],
        ['Evidence link', 'Row expands in place, 180 ms; focus stays on the link.'],
        ['Reduce Motion', 'No slide or stagger. Changes are instant and announced.'],
      ],
      stories: [
        ['F301', 'new', 'Contracts per stage with a view switch (Contracts, Readiness, Release gate, Evidence pack): kind, version, status, linked requirements, kind filters and counts (R-WF-6, R-ARC-3).', 'PRD'],
        ['F302', 'new', 'Contract detail: version switch r2 and r1, diff, endpoints and fixture (R-WF-4, R-ARC-3).', 'PRD'],
        ['F303', 'new', 'Contract checks with passed, failed, untested or evidence missing and an evidence link (R-EVD-2, R-ARC-3).', 'Momo'],
        ['F304', 'new', 'Upstream change marks linked contracts Needs review and keeps older evidence (R-WF-4).', 'PRD'],
        ['F305', 'new', 'Readiness matrix across the eight stages: artifacts, approvals, tests, evidence, blocker (R-WF-1, R-WF-3, R-WF-6, AC-SPK-1).', 'PRD'],
        ['F306', 'new', 'Evidence link chips pinned to build, spec and frame revisions (R-EVD-1).', 'PRD'],
        ['F307', 'new', 'Release gate: acceptance tests, performance budget, accessibility and security; blocks with reasons (R-EVD-2, AC-SPK-1).', 'PRD'],
        ['F308', 'new', 'Owner exception records a reason and stays different from verified readiness (R-WF-3, R-SEC-5).', 'PRD'],
        ['F309', 'new', 'Propose fix tickets and contract fixes; they enter review first and never change code (R-EVD-5, R-VER-11).', 'PRD'],
        ['F310', 'new', 'Run failure card: one title, one paragraph, classification, repair on the right (OpenDesign RunErrorCard, R-SEC-6).', 'OpenDesign'],
        ['F311', 'new', 'Run steps listed as applied, failed, skipped and unknown; no rollback claimed (R-EVD-3).', 'PRD'],
        ['F312', 'new', 'Evidence pack: pinned identities, outcome counts and snapshot history (R-EVD-1, R-EVD-4).', 'PRD'],
        ['F313', 'new', 'Evidence timeline keeps failed, queued, stale, unavailable and unknown apart from passed (R-DEL-1, AC-SPK-29).', 'PRD'],
        ['F314', 'new', 'Read-only: no deploy, retry or merge; viewers read and cannot change (R-DEL-2, R-ARC-5, R-SEC-1).', 'PRD'],
        ['F315', 'new', 'Export the evidence pack; masked secrets, recorded actor and time (R-SEC-2, R-SEC-4, R-SEC-5).', 'PRD'],
        ['F316', 'new', 'Suggested prompts under each readiness reply explain a blocker and propose fixes; nothing runs until Send (R-CAN-4, R-WS-2).', 'OpenDesign'],
      ],
      where: '<span><b>Route:</b> <code>/p/:project/:stage</code> with <code>?tab=readiness|contracts|gate|evidence</code>. Back and Forward restore the view and never start a run, spend credits or export.</span><span><b>UI (TS/React):</b> OpenDesign patterns, Apache-2.0 reuse candidates at commit <code>e033aad</code>: <code>RunErrorCard</code> (title, paragraph, actions right), <code>run-failure-classification</code> (classes), <code>GenUISurfaceRenderer</code> for check cards. NOTICE file needed. Momo contributes only its idea of a fixed state and a11y checklist.</span><span><b>Core (Rust):</b> stage readiness derivation, contract validation against fixtures, evidence pinning, release gate rules and the audit record (R-ARC-1, R-ARC-3, R-EVD-1). The browser never decides pass or fail.</span><span><b>Open for Enrico:</b> the performance budget and accessibility rules for Meranti Yard (2.5 s and axe are sample values) · who may grant an owner exception · retry after a runner exists (LATER).</span>',
    },
    refs: {
      note: 'OpenDesign (Apache-2.0, commit e033aad) is the main reference. Its run-failure card has no screenshot here, so it is described. Momo and Onlook are pattern references only.',
      shots: [
        { img: 'od-todo-progress.png', cap: '<b>OpenDesign chat.</b> Status and checklist cards inside the chat. The check cards and gate reasons follow this.' },
        { img: 'od-studio-document.png', cap: '<b>OpenDesign document.</b> A self-check result sits under the reply. Spekin’s contract checks read the same way.' },
        { img: 'od-studio-prototype.png', cap: '<b>OpenDesign Studio.</b> Chat left, file tabs and actions on the right. The readiness views keep this split.' },
      ],
    },
  }];
}
