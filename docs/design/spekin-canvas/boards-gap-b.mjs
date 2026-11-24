// Gaps canvas, group B: S07 spec at every depth, S14 design system (kit and GAP register), S19 ADRs and glossary.
// Owner: this file only. All stories are NEW. OpenDesign is the primary reference; Momo and Paraframe are pattern references only.
export const tier = 'Living spec: depth, design system, ADRs and glossary';
export const order = 2;

export function boards(K) {
  const { S, ic, ib, btn, pill, note, NT, app, chatPanel, tabs, insp, row } = K;
  const P = S.PROJECT;
  const sugg = (list, f = 'F441') => `<div class="sp-sugg">${list.map((t) => `<button type="button" data-does="Puts this prompt in the composer; nothing runs until Send" data-feature="${f}">${ic('spark', 13)}${t}</button>`).join('')}</div>`;
  const ai = (model, body) => `<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>${model}</em></div>${body}</div>`;
  const tool = (inner) => `<div class="sp-tool">${inner}</div>`;
  const undoRedo = (f) => ib('undo', 'Undo', { does: 'Undoes the last draft edit in this tab', sm: true, f }) + ib('redo', 'Redo', { does: 'Redoes the last undone draft edit', sm: true, f }) + ib('history', 'Revisions', { does: 'Opens S09 revision history for this document', sm: true, f });
  const main = (tabsHtml, toolHtml, body, banner = '') => `<section class="sp-main" aria-label="Work area">${tabsHtml}${banner}${toolHtml}${body}</section>`;

  // =====================================================================================================
  // S07  Spec document at every depth
  // =====================================================================================================
  const specRight = btn('Propose change', { cls: 'ink', icon: 'diff', does: 'Starts a Proposal for the open section; nothing in the spec changes until it is accepted on S08', f: 'F442' });
  const specTabs = (dirty) => tabs([['doc', 'Spec', true, dirty], ['req', 'Decision log'], ['doc', 'Pitch'], ['frame', 'F-03 Variance table']], specRight);
  const depthSwitch = (cur) => `<div class="sp-seg isnew" role="group" aria-label="Depth" data-feature="F441">${NT}${['Simple', 'Detailed', 'Expert'].map((d) => `<button type="button" aria-pressed="${d === cur ? 'true' : 'false'}" data-does="${d === 'Simple' ? 'Shows the spec at Simple; going shallower changes no data and keeps the deeper blocks' : `Shows the spec at ${d}; blocks that do not exist at this layer yet are offered as one Proposal, never written directly`}" data-feature="${d === 'Simple' ? 'F441' : 'F442'}">${d}</button>`).join('')}</div>`;
  const hashChip = (txt = 'unchanged') => `<button type="button" class="gpb-hash" data-does="Copies the snapshot hash of the accepted spec; moving between depths never changes it" data-feature="F443">${ic('lock', 12)}Snapshot <b>${S.GAPB_HASH}</b> · ${txt}</button>`;
  const specTool = (cur, hash) => tool(`${depthSwitch(cur)}<span class="sp-crumb">Specification${ic('chevR', 12)}<b>Spec ${P.spec}</b></span><span class="sp-fill"></span>${hashChip(hash)}${undoRedo('F441')}`);

  // principles block: same block at every depth (R-PRI-1)
  const principles = (mode, edit = false) => `<div class="gpb-card pr isnew" data-feature="F445">${NT}<div class="h">${ic('flag', 14)}Prinsip proyek<span>Project principles${mode === 'compact' ? ' · compact' : ''}</span><span class="sp-fill"></span>${btn('Edit', { sm: true, does: 'Opens a Proposal on S08 for the principles; accepted principles stay as they are until you accept the change', f: 'F446' })}</div>
${S.GAPB_PRINCIPLES.map((p, i) => `<div class="gpb-pi${mode === 'compact' ? ' compact' : ''}"><span class="id">${p.id}</span><span>${p.t}${mode === 'compact' ? '' : `<small>${p.rev === '-' ? 'Not accepted yet' : 'Accepted ' + p.rev} · ${p.src}</small>`}</span>${mode === 'compact' ? '' : pill(p.pill)}</div>`).join('')}
<p class="gpb-note-in">Separate from the pitch, the plan and AGENTS.md. PRN-4 has no answer, so it stays an open question.</p></div>`;

  const simpleDoc = `<div class="gpb-card"><div class="h">${ic('doc', 14)}Pitch<span>Shape Up form · accepted r14</span></div>
<dl class="gpb-kvs">${S.GAPB_SIMPLE.map((r) => `<dt>${r.k}</dt><dd>${r.t}</dd>`).join('')}</dl></div>
<div class="gpb-card"><div class="h">${ic('list', 14)}Decisions behind this pitch<span>3 of 14 shown</span><span class="sp-fill"></span>${btn('Open decision log', { sm: true, does: 'Opens S05 with the decisions that back this pitch', f: 'F441' })}</div>
<div class="gpb-list">${row('D-03', 'Forecasts come from the monthly cost export', 'Accepted r6', ['ok', 'Accepted'])}${row('D-07', 'Money is stored without rounding', 'Accepted r9', ['ok', 'Accepted'])}${row('D-09', 'Cost lines open from a package row', 'Accepted r11', ['ok', 'Accepted'])}</div></div>`;

  const blockRow = (b, o = {}) => `<div class="gpb-blk${b.basis.length || o.prop ? '' : ' nb'}${o.prop ? ' prop' : ''}" ${b.basis.length ? '' : 'data-feature="F444"'}>
<span class="id">${b.id}<small>${b.k}</small></span>
<span>${b.t}${b.basis.length || o.prop ? '' : `<span class="gpb-nb">${ic('alert', 12)}no decision, pack requirement or reference FR is linked</span>`}</span>
<span>${o.prop ? pill(['acc', 'Proposed']) : pill(b.basis.length ? ['ok', 'Basis ' + b.basis.length] : ['warn', 'tanpa dasar'])}${b.basis.length ? `<span class="gpb-basis">${b.basis.map((x) => `<span class="gpb-chip">${x}</span>`).join('')}</span>` : ''}</span>
${!b.basis.length && !o.prop ? `<span class="gpb-act">${btn('Link a decision', { sm: true, does: 'Opens a picker of decisions, pack requirements and reference FRs; the link is saved as a Proposal', f: 'F444' })}${btn('Propose removal', { sm: true, does: 'Creates a Proposal that removes this block; the block stays in the accepted spec until you accept it', f: 'F444' })}</span>` : ''}</div>`;
  const detailedDoc = `<div class="gpb-head"><h3>Behaviour spec and plan</h3>${pill(['warn', '2 tanpa dasar'])}<span class="gpb-meta">EARS blocks · 5 of 5 shown</span></div>${S.GAPB_BLOCKS.map((b) => blockRow(b)).join('')}`;
  const expertDoc = `<div class="gpb-head"><h3>ADRs, glossary and traceability</h3><span class="gpb-meta">Expert layer · accepted r14</span></div>${S.GAPB_EXPERT.map((b) => `<div class="gpb-blk"><span class="id">${b.id}<small>${b.k}</small></span><span>${b.t}</span><span>${pill(b.pill)}<span class="gpb-basis">${b.basis.map((x) => `<span class="gpb-chip">${x}</span>`).join('')}</span></span></div>`).join('')}
<div class="gpb-card"><div class="h">${ic('link', 14)}Trace of R-DASH-014<span>requirement > ticket > criterion > test > commit</span><span class="sp-fill"></span>${btn('Open S17', { sm: true, does: 'Opens the traceability matrix for R-DASH-014', f: 'F441' })}</div></div>`;
  const missingDoc = `<div class="gpb-head"><h3>Behaviour spec and plan</h3>${pill(['acc', 'Proposal P-31'])}<span class="gpb-meta">Spec r14 unchanged</span></div>
${S.GAPB_BLOCKS.slice(0, 2).map((b) => blockRow(b)).join('')}${S.GAPB_MISSING.map((m) => blockRow({ id: m.id, k: 'Missing', t: m.t, basis: [] }, { prop: true })).join('')}`;

  const chatSpec = (variant) => {
    const base = { title: 'Spec chat', sub: `Spec ${P.spec}`, ctxItems: [['doc', 'Spec', 'r14'], ['req', 'R-DASH-014', 'r14'], ['doc', 'Pitch', 'r14']], ctxFoot: '≈ 6.2k tokens · the whole spec is never sent', ph: 'Ask about a block, or @ a decision…' };
    if (variant === 'deeper') return chatPanel({ ...base, msgs: `<div class="sp-ub">Show me the Detailed layer.</div>${ai('Sonnet 5.5 · 28 s · 18 cr', `<p>Detailed has 2 blocks. The Simple pitch implies 3 more. I made <b>one Proposal</b>; the spec is still r14.</p><div class="sp-gg isnew" data-feature="F442">${NT}<div class="gh"><span>Proposal P-31 · 3 blocks</span><button type="button" data-does="Shows the proposed blocks as a plain table" data-feature="F442">Show as table</button></div>
<div class="sp-gc prop"><div class="k">${ic('diff', 12)}Missing at Detailed<span class="tag">${pill(['acc', 'Proposal'])}</span></div><div class="tt">R-DASH-016, R-DASH-017, PLAN-05</div><div class="bd">Each block cites the pitch line it comes from.</div><div class="ft"><span class="s">Base r14 · not in spec</span>${btn('Send to review', { sm: true, cls: 'ink', does: 'Adds Proposal P-31 to S08 with its exact diff; the spec stays r14 until accepted', f: 'F442' })}</div></div></div>`)}` });
    if (variant === 'impact') return chatPanel({ ...base, sub: 'Inc. 3 · draft', ctxItems: [['doc', 'Spec', 'r14'], ['frame', 'F-03 Variance table', 'r6'], ['server', 'API contract · variance alerts', 'r2']], msgs: `<div class="sp-ub">Add a CSV export of the variance table as a new increment.</div>${ai('Sonnet 5.5 · 41 s · 26 cr', `<p>I opened <b>Inc. 3 · CSV export</b> in this project. Nothing is accepted. The impact is listed on the left; <b>11</b> accepted items are not touched.</p>`)}${sugg(['Narrow to the table only'])}` });
    if (variant === 'principles') return chatPanel({ ...base, msgs: `<div class="sp-ub">Answer PRN-4: only the project lead may edit a threshold.</div>${ai('Sonnet 5.5 · 12 s · 7 cr', `<p>I drafted <b>PRN-4</b> as a Proposal. It changes principles only. The stack, the kit (yravg UI r3) and AGENTS.md are not part of it.</p>`)}` });
    if (variant === 'simple') return chatPanel({ ...base, msgs: `<div class="sp-ub">Back to Simple, please.</div>${ai('Sonnet 5.5 · 3 s · 0 cr', `<p>Showing the pitch. <b>No data changed</b>: Detailed and Expert blocks are kept, and the snapshot is still <b>${S.GAPB_HASH}</b>.</p>`)}${sugg(['Show the Detailed layer'])}` });
    return chatPanel({ ...base, msgs: `<div class="sp-ub">Which blocks have no basis?</div>${ai('Sonnet 5.5 · 9 s · 4 cr', `<p><b>R-DASH-021</b> (Monday email) and <b>R-DASH-023</b> (24 months of history) have no decision behind them. Confirm each one, or propose its removal.</p>`)}${sugg(['Link R-DASH-021 to a decision'])}` });
  };
  const bannerDeeper = `<div class="sp-banner warn" role="status" data-feature="F442">${ic('alert', 16)}<p><b>Detailed has missing blocks.</b> 3 blocks were proposed as P-31. The accepted spec stays r14 until you accept them.</p>${btn('Open P-31', { sm: true, does: 'Opens S08 with Proposal P-31 and its 3 hunks', f: 'F442' })}</div>`;
  const bannerSimple = `<div class="sp-banner" role="status" data-feature="F441">${ic('check', 16)}<p><b>Shallower view.</b> Nothing was changed or deleted. Detailed and Expert blocks stay in the spec.</p></div>`;

  const right = (inner) => `<div class="gpb-col">${inner}</div>`;
  const page = (left, rightCol) => `<div class="gpb-page"><div class="gpb-two"><div class="gpb-col">${left}</div>${right(rightCol)}</div></div>`;
  const impactBody = `<div class="gpb-page"><div class="gpb-head"><h2>Inc. 3 · CSV export</h2>${pill(['acc', 'Draft'])}<span class="gpb-meta">Impact before you accept anything</span></div>
<div class="gpb-card isnew" data-feature="F448">${NT}<div class="h">${ic('layers', 14)}What this increment touches<span>stage readiness, frames, contracts, tasks and tests</span></div>
<div class="gpb-imp">${S.GAPB_IMPACT.map((r) => `<span class="a">${r.area}</span><span>${r.item}</span><span class="n">${r.n}</span>${pill(r.pill)}<span class="ln"></span>`).join('')}</div></div>
<div class="gpb-card isnew" data-feature="F449">${NT}<div class="h">${ic('lock', 14)}Kept as accepted<span>R-EVD-6 · the older revisions and their evidence are not rewritten</span><span class="sp-fill"></span>${btn('Show list', { sm: true, does: 'Lists the 11 untouched accepted artifacts with their revisions', f: 'F449' })}${btn('Send to review', { sm: true, cls: 'ink', does: 'Sends the increment as proposals to S08; accepting is a separate step per proposal', f: 'F449' })}</div></div></div>`;
  const impactTabs = tabs([['doc', 'Spec', false], ['layers', 'Inc. 3 · CSV export', true, true], ['frame', 'F-03 Variance table']], btn('Add feature', { cls: 'ink', icon: 'plus', does: 'Starts another increment in this project, not a new project', f: 'F447' }));
  const impactTool = tool(`<span class="sp-crumb">${P.name}${ic('chevR', 12)}Increments${ic('chevR', 12)}<b>Inc. 3 · CSV export</b></span><span class="sp-fill"></span>${btn('Cancel increment', { sm: true, does: 'Drops the draft increment; no accepted artifact changes', f: 'F447' })}${undoRedo('F447')}`);

  const N7 = {
    switch: note('<b>Click a depth</b>: the same accepted spec is shown at three levels. Going deeper may offer a Proposal; going shallower changes nothing.', 'left:384px;top:706px;max-width:300px'),
    hash: note('<b>Snapshot</b> (top right): Expert > Simple > Expert leaves this hash the same. It changes only when a Proposal is accepted.', 'left:760px;top:700px;max-width:290px'),
    prin: note('<b>Same block, every depth</b>: principles sit in this column on Simple, Detailed and Expert. Simple shows the compact form.', 'left:1060px;top:700px;max-width:330px'),
    nb: note('<b>tanpa dasar</b>: a Detailed block with no linked decision, pack requirement or reference FR is flagged for you to confirm or remove. Spekin never deletes it.', 'left:384px;top:700px;max-width:330px'),
    prop: note('<b>Click Detailed</b> with content missing: one Proposal, dashed blocks, the spec still r14. Nothing is written into the accepted spec.', 'left:384px;top:700px;max-width:330px'),
    plan: note('<b>Plan stays apart</b>: stack and kit change only by their own Proposals (R-DS). Accepting PRN-4 does not touch them or AGENTS.md.', 'left:760px;top:700px;max-width:300px'),
    imp: note('<b>Add feature</b>: a repeatable increment in the same project. Impact is listed before acceptance, and unaffected accepted work is kept.', 'left:384px;top:700px;max-width:330px'),
    trace: note('<b>Expert</b> adds ADRs, glossary and the trace. Every item names the blocks it rests on.', 'left:760px;top:700px;max-width:290px'),
  };

  const vSimple = app({ stage: 'spec', save: ['ok', 'Saved 12:41'], chat: chatSpec('simple'), main: main(specTabs(false), specTool('Simple', 'unchanged'), page(simpleDoc, principles('compact')), bannerSimple) }) + N7.switch + N7.hash + N7.prin;
  const vDetailed = app({ stage: 'spec', save: ['ok', 'Saved 12:41'], chat: chatSpec('detailed'), main: main(specTabs(false), specTool('Detailed', 'unchanged'), page(detailedDoc, principles('full'))) }) + N7.nb + N7.prin;
  const vExpert = app({ stage: 'spec', save: ['ok', 'Saved 12:41'], chat: chatSpec('expert'), main: main(specTabs(false), specTool('Expert', 'unchanged'), page(expertDoc, principles('full'))) }) + N7.trace + N7.hash;
  const vDeeper = app({ stage: 'spec', save: ['ok', 'Saved 12:41'], chat: chatSpec('deeper'), main: main(specTabs(true), specTool('Detailed', 'unchanged'), page(missingDoc, principles('full')), bannerDeeper) }) + N7.prop + N7.hash;

  const hunk = `<div class="gpb-hunk isnew" data-feature="F446">${NT}<div class="hh">${ic('diff', 12)}PRN-4 · Principles · base r14<span class="sp-fill"></span>${pill(['acc', 'Proposal P-32'])}</div>
<div class="hb">Who may edit a threshold? <del>(no answer)</del> <ins>Only the project lead may edit a threshold.</ins></div>
<div class="hf">${btn('Accept hunk', { sm: true, cls: 'ink', does: 'Accepts only this hunk in a new revision r15; the stack, the kit and AGENTS.md are not written', f: 'F446' })}${btn('Reject', { sm: true, does: 'Rejects this hunk; PRN-4 stays an open question', f: 'F446' })}<span class="gpb-note-in">Source: chat, message 2 · affects PRN-4</span></div></div>`;
  const planCard = `<div class="gpb-card isnew" data-feature="F446">${NT}<div class="h">${ic('layers', 14)}Plan, not principles<span>R-DS</span></div>
<dl class="gpb-kvs"><dt>Stack</dt><dd>React with a Rust core · <b>not changed</b></dd><dt>Kit</dt><dd>${S.GAPB_KIT.name} ${S.GAPB_KIT.rev} · <b>not changed</b></dd><dt>AGENTS.md</dt><dd>Not written by this Proposal</dd></dl>
<p class="gpb-note-in">These change only by their own Proposals on S08.</p></div>`;
  const vPrinciples = app({ stage: 'spec', save: ['ok', 'Saved 12:41'], chat: chatSpec('principles'), main: main(specTabs(true), specTool('Detailed', 'unchanged'), page(principles('full') + hunk, planCard)) }) + N7.plan;
  const vImpact = app({ stage: 'spec', save: ['ok', 'Saved 12:41'], chat: chatSpec('impact'), main: main(impactTabs, impactTool, impactBody) }) + N7.imp + N7.hash;

  const s07 = {
    file: 'S07-spec-depth', code: 'S07', tier: 'LIVING SPEC', name: 'Spec document at every depth',
    ext: 'New. Spekin has no built screen yet. Wraps S08 (proposal review) and S09 (revision history). PRD GAP-02: Simple / Detailed / Expert switch on one accepted spec.',
    lives: 'Spekin web app · /p/meranti-yard/spec?depth=detailed (depth and tab in the query; never draft text).',
    views: [
      { id: 'simple', label: 'Simple', html: vSimple, entry: 'Projects > Meranti Yard > Specification > depth switch: Simple (from Expert).', data: 'sample/parts/gap-b.mjs → GAPB_SIMPLE, GAPB_PRINCIPLES, GAPB_HASH.' },
      { id: 'detailed', label: 'Detailed, tanpa dasar', html: vDetailed, entry: 'Specification > depth switch: Detailed.', data: 'sample/parts/gap-b.mjs → GAPB_BLOCKS (2 blocks with empty basis), GAPB_PRINCIPLES.' },
      { id: 'expert', label: 'Expert', html: vExpert, entry: 'Specification > depth switch: Expert.', data: 'sample/parts/gap-b.mjs → GAPB_EXPERT, GAPB_PRINCIPLES.' },
      { id: 'deeper', label: 'Deeper: Proposal', html: vDeeper, entry: 'Specification > Simple > click Detailed when 3 blocks are missing.', data: 'sample/parts/gap-b.mjs → GAPB_MISSING, GAPB_BLOCKS.' },
      { id: 'principles', label: 'Principles change', html: vPrinciples, entry: 'Specification > Prinsip proyek > Edit.', data: 'sample/parts/gap-b.mjs → GAPB_PRINCIPLES, GAPB_KIT.' },
      { id: 'impact', label: 'Add feature', html: vImpact, entry: 'Specification > Add feature > describe "CSV export" in chat.', data: 'sample/parts/gap-b.mjs → GAPB_IMPACT.' },
    ],
    side: {
      must: [
        'One accepted spec, three depths: Simple (pitch), Detailed (EARS blocks and plan), Expert (ADRs, glossary, trace). The switch is a view, not a new document.',
        'Moving deeper where blocks are missing creates one Proposal for them; moving shallower changes no data. The snapshot hash proves it.',
        'A Detailed or Expert block with no linked decision, pack requirement or reference FR shows "tanpa dasar" with actions to link it or propose removal.',
        'Prinsip proyek is one block, shown at every depth (compact on Simple), apart from the pitch, the plan and AGENTS.md.',
        'A principles edit is a Proposal on S08. It never changes the stack, the kit or the design system selection.',
        'Add feature opens an increment in the same project and lists its impact on stage readiness, frames, contracts, tasks and tests before anything is accepted.',
      ],
      motion: [
        ['Depth switch', 'Content cross-fades 160 ms, ease cubic-bezier(0.23,1,0.32,1); blocks stagger 40 ms, 8 px rise.'],
        ['New dashed blocks', 'Proposed blocks enter 220 ms with a 4 px rise; they keep the dashed edge until accepted.'],
        ['tanpa dasar flag', 'Warn tint fades in 140 ms; the flag never blinks.'],
        ['Impact rows', 'Rows reveal top to bottom, 40 ms apart, 180 ms each.'],
        ['Snapshot chip', 'Holds still on a depth change; on accept the new hash fades in 140 ms.'],
        ['Reduce Motion', 'All swaps are instant. Banners are still announced (role status).'],
      ],
      stories: [
        ['F441', 'new', 'Depth switch Simple / Detailed / Expert on one accepted spec; going shallower changes no data and keeps deeper blocks (R-EDT-5).', 'PRD'],
        ['F442', 'new', 'Going deeper with missing blocks creates one Proposal, shown as dashed blocks; the accepted spec stays unchanged (R-EDT-5).', 'PRD'],
        ['F443', 'new', 'Snapshot hash chip; Expert > Simple > Expert leaves it the same (R-EDT-5, AC-12).', 'PRD'],
        ['F444', 'new', 'A Detailed or Expert block with no basis shows "tanpa dasar" with link and propose-removal actions (R-EDT-8).', 'PRD'],
        ['F445', 'new', 'Prinsip proyek block in the same place at every depth, compact on Simple, with revision and source (R-PRI-1).', 'PRD'],
        ['F446', 'new', 'Principles edit as a hunk Proposal; stack, kit and AGENTS.md are untouched (R-PRI-3).', 'PRD'],
        ['F447', 'new', 'Add feature starts a repeatable increment in the same project (R-EVD-6).', 'PRD'],
        ['F448', 'new', 'Impact view of the increment: stage readiness, frames, contracts, tasks, tests, before acceptance (R-EVD-6).', 'PRD'],
        ['F449', 'new', 'Unaffected accepted artifacts listed as kept; accepting stays per proposal (R-EVD-6).', 'PRD'],
      ],
      where: '<span><b>Route:</b> <code>/p/:project/spec</code>, depth and tab in the query.</span><span><b>UI units:</b> segmented control (PRD GAP-02), OpenDesign <code>DocumentPane</code> and <code>InlineDiff</code> patterns (Apache-2.0, NOTICE needed for code reuse).</span><span><b>Rust core owns:</b> spec blocks with layer and basis refs, the snapshot hash, principles as their own record, proposals and revisions.</span><span><b>Open decisions:</b> Q-09 who may edit a threshold; whether the hash covers principles (recommended: yes).</span>',
    },
    refs: { note: 'OpenDesign is the main reference for the document pane and diff. Paraframe and Momo are pattern references only; no brand, copy or assets are copied.', shots: [
      { img: 'od-studio-document.png', cap: '<b>OpenDesign document.</b> A document pane next to the chat. Spekin adds the depth switch and the principles column.' },
      { img: 'od-studio-prototype.png', cap: '<b>OpenDesign Studio.</b> Chat left, file tabs, view switch. Spekin keeps the split for the spec.' },
    ] },
  };

  // =====================================================================================================
  // S14  Design system: kit and GAP register
  // =====================================================================================================
  const dsRight = btn('Propose change', { cls: 'ink', icon: 'diff', does: 'Starts a Proposal for DESIGN.md, tokens or the kit; nothing changes until it is accepted on S08', f: 'F459' });
  const dsTabs = (cur) => tabs([['doc', 'DESIGN.md', cur === 'tokens'], ['layers', 'Kit: yravg UI r3', cur === 'kit'], ['alert', 'GAP register', cur === 'reg'], ['frame', 'F-05 Variance bridge', cur === 'gap']], dsRight);
  const dsTool = (crumb, extra = '') => tool(`<span class="sp-crumb">Design${ic('chevR', 12)}Design system${ic('chevR', 12)}<b>${crumb}</b></span><span class="sp-fill"></span>${extra}${undoRedo('F451')}`);
  const pickCard = (p, o = {}) => `<div class="gpb-pick${p[3] === 'gap' ? ' gap' : ''}${o.isnew ? ' isnew' : ''}"${o.isnew ? ' data-feature="F452"' : ''}>${o.isnew ? NT : ''}<code>${p[0]}</code><span>${p[1]} · ${p[2]}</span>${p[3] === 'gap' ? pill(['warn', o.isnew ? 'GAP-01 new' : 'GAP-01']) : pill(['ok', 'In kit'])}</div>`;
  const kitBody = `<div class="gpb-page"><div class="gpb-head"><h2>Design system</h2>${pill(['ok', S.GAPB_KIT.name + ' ' + S.GAPB_KIT.rev])}${pill(['ok', 'DESIGN.md r3'])}${pill(['warn', '1 GAP open'])}</div>
<div class="gpb-two"><div class="gpb-col"><div class="gpb-card isnew" data-feature="F451">${NT}<div class="h">${ic('layers', 14)}Component picks<span>${S.GAPB_KIT.picked} used by screens · 6 shown</span><span class="sp-fill"></span>${btn('Change kit', { sm: true, does: 'Starts a kit Proposal; the chosen kit changes only when it is accepted, never from a principles change', f: 'F451' })}</div>
<div class="gpb-kit">${S.GAPB_PICKS.map((p) => pickCard(p)).join('')}</div></div></div>
<div class="gpb-col"><div class="gpb-card"><div class="h">${ic('check', 14)}Kit decision</div><dl class="gpb-kvs"><dt>Kit</dt><dd>${S.GAPB_KIT.name} · ${S.GAPB_KIT.rev}</dd><dt>Decision</dt><dd>${S.GAPB_KIT.decision}</dd><dt>Chosen by</dt><dd>${S.GAPB_KIT.by}</dd><dt>Tickets</dt><dd>Each UI ticket names one slug or one GAP id</dd></dl></div></div></div></div>`;

  const tokenBody = `<div class="gpb-page"><div class="gpb-head"><h2>DESIGN.md and tokens</h2>${pill(['ok', 'Accepted r3'])}<span class="gpb-meta">18 tokens · mapped to Tailwind and shadcn variables</span></div>
<div class="gpb-card isnew" data-feature="F459">${NT}<div class="h">${ic('doc', 14)}Token viewer<span>read here; every edit is a Proposal</span><span class="sp-fill"></span>${btn('Edit token', { sm: true, does: 'Drafts a token change as a Proposal on S08; the accepted tokens stay r3', f: 'F459' })}</div>
<table class="sp-tbl"><thead><tr><th>Token</th><th>Value</th><th>Used for</th><th>Rev</th></tr></thead><tbody>${S.GAPB_TOKENS.map((t, i) => `<tr><td class="mono">${t[0]}</td><td>${i < 3 ? `<span class="gpb-sw" style="background:var(${t[0]})"></span>` : ''}${t[1]}</td><td>${t[2]}</td><td class="mono">${t[3]}</td></tr>`).join('')}</tbody></table></div></div>`;

  const gapDetail = `<div class="gpb-page"><div class="gpb-head"><h2>GAP-01 Variance bridge chart</h2>${pill(['warn', 'Open'])}<span class="gpb-meta">Created from F-05 · 12:44</span></div>
<div class="gpb-two"><div class="gpb-col"><div class="gpb-card isnew" data-feature="F452">${NT}<div class="h">${ic('alert', 14)}Needed, not in ${S.GAPB_KIT.name}<span>R-DS-4</span></div><p>F-05 needs a waterfall that starts at budget, adds each package variance and ends at forecast. The kit has no such component.</p>
<div class="gpb-act">${btn('Draft as kit proposal', { sm: true, cls: 'ink', does: 'Drafts a Proposal to add a waterfall to the kit or to build it in this project; nothing is added yet', f: 'F452' })}${btn('Open F-05', { sm: true, does: 'Opens frame F-05 on the canvas with the GAP badge shown', f: 'F452' })}</div></div>
<div class="gpb-card isnew" data-feature="F453">${NT}<div class="h">${ic('link', 14)}Closest existing item</div><div class="gpb-pick"><code>components/flow-diagram</code><span>Signed bands per step. No running total, no start and end bars.</span></div>
<div class="gpb-act">${btn('Open in kit', { sm: true, does: 'Opens the closest kit item in the Kit tab so you can compare it with F-05', f: 'F453' })}${btn('Use closest instead', { sm: true, does: 'Drafts a Proposal that changes F-05 to use the closest item and closes the GAP', f: 'F453' })}</div></div></div>
<div class="gpb-col"><div class="gpb-card isnew" data-feature="F455">${NT}<div class="h">${ic('req', 14)}Ticket</div><dl class="gpb-kvs"><dt>T-218</dt><dd>Build variance bridge</dd><dt>component_ref</dt><dd><span class="gpb-chip">GAP-01</span></dd></dl><p class="gpb-note-in">One reference per UI ticket: a kit slug or a GAP id. Never empty.</p></div></div></div></div>`;

  const regBody = `<div class="gpb-page"><div class="gpb-head"><h2>GAP register</h2><span class="gpb-meta">Components the screens need that ${S.GAPB_KIT.name} does not have</span><span class="sp-fill"></span>
<div class="sp-seg" role="group" aria-label="Status filter">${['All 4', 'Open 2', 'Proposal 1', 'Closed 1'].map((t, i) => `<button type="button" aria-pressed="${i === 0 ? 'true' : 'false'}" data-does="Shows only the ${t.split(' ')[0].toLowerCase()} GAP entries" data-feature="F454">${t}</button>`).join('')}</div></div>
<div class="gpb-card isnew" data-feature="F454" style="padding:0">${NT}<table class="sp-tbl gpb-tbl"><thead><tr><th>GAP</th><th>Needed component</th><th>Closest existing item</th><th>Used by</th><th>Status</th></tr></thead><tbody>${S.GAPB_GAPS.map((g) => `<tr><td><span class="id">${g.id}</span></td><td>${g.need}</td><td><span class="mono">${g.closest}</span><small>${g.why}</small></td><td class="mono">${g.used}</td><td>${pill(g.st)}</td></tr>`).join('')}</tbody></table></div>
<p class="gpb-sub">Every entry names its closest existing item. A GAP closes when a kit revision adds the component or a ticket switches to the closest item.</p></div>`;

  const reuseBody = `<div class="gpb-page"><div class="gpb-head"><h2>Reuse review</h2>${pill(['acc', 'Proposal P-35'])}<span class="gpb-meta">Per file: source, licence, obligations</span></div>
<div class="gpb-card isnew" data-feature="F456" style="padding:0">${NT}<table class="sp-tbl gpb-tbl"><thead><tr><th>File</th><th>Source</th><th>Licence</th><th>Obligation</th><th>Verdict</th></tr></thead><tbody>${S.GAPB_PROV.map((r) => `<tr><td class="mono">${r.file}</td><td>${r.src}</td><td>${r.lic}</td><td>${r.obl}</td><td>${pill(r.v)}</td></tr>`).join('')}</tbody></table></div>
<div class="gpb-card isnew" data-feature="F458">${NT}<div class="h">${ic('check', 14)}Existing component first<span>GAP-03 Period picker</span></div><p>Before any custom work, Spekin shows the kit option: <span class="gpb-chip">components/date-range</span> covers 4 of 5 needs. Missing: fiscal period presets.</p>
<div class="gpb-act">${btn('Use date-range', { sm: true, cls: 'ink', does: 'Drafts a Proposal that points F-01 at date-range and narrows GAP-03 to the presets only', f: 'F458' })}${btn('Review source', { sm: true, does: 'Opens the licence and provenance review for the chosen component', f: 'F456' })}</div></div></div>`;

  const policyBody = `<div class="gpb-page"><div class="gpb-head"><h2>Codebase and reference reuse</h2><span class="gpb-meta">What Spekin will and will not do</span></div>
<div class="gpb-two" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr);flex:none;align-items:start"><div class="gpb-card isnew" data-feature="F457">${NT}<div class="h">${ic('x', 14)}Never done automatically</div>
<div class="gpb-list"><div class="gpb-item"><span></span><span>Refactor your codebase to match the kit</span><span></span></div><div class="gpb-item"><span></span><span>Adopt a whole reference app or desktop stack</span><span></span></div><div class="gpb-item"><span></span><span>Copy a file with no licence or a protected brand</span><span></span></div></div></div>
<div class="gpb-card isnew" data-feature="F458">${NT}<div class="h">${ic('check', 14)}Offered instead</div>
<div class="gpb-list"><div class="gpb-item"><span></span><span>Reuse an existing kit component</span><span></span></div><div class="gpb-item"><span></span><span>Reuse a compatibly licensed file after a per-file review</span><span></span></div><div class="gpb-item"><span></span><span>A UI inventory and DESIGN.md draft as a Proposal</span><span></span></div></div></div></div>
<div class="gpb-card isnew" data-feature="F457">${NT}<div class="h">${ic('diff', 14)}UI inventory draft<span>documented method, not runtime-verified</span><span class="sp-fill"></span>${pill(['acc', 'Proposal P-36'])}${btn('Review on S08', { sm: true, cls: 'ink', does: 'Opens S08 with the inventory draft; it is never auto-accepted and no file in your repo is edited', f: 'F457' })}</div></div></div>`;

  const chatDs = (variant) => {
    const base = { title: 'Design chat', sub: 'Design system', ctxItems: [['doc', 'DESIGN.md', 'r3'], ['frame', 'F-05 Variance bridge', 'r1'], ['doc', 'Kit: yravg UI', 'r3']], ctxFoot: '≈ 5.4k tokens · kit names only, no source code', ph: 'Ask about the kit, a token or a GAP…' };
    const m = {
      kit: `<div class="sp-ub">Which kit are we on?</div>${ai('Sonnet 5.5 · 6 s · 3 cr', '<p>yravg UI r3, chosen in <b>D-15</b>. 14 components are in use and 1 is a GAP.</p>')}${sugg(['Show the GAP register'], 'F454')}`,
      tokens: `<div class="sp-ub">Is --warn too light on the flag?</div>${ai('Sonnet 5.5 · 11 s · 6 cr', '<p>It passes on the table row. I can draft a darker value as a <b>Proposal</b>. Tokens stay r3 until you accept it.</p>')}`,
      gap: `<div class="sp-ub">F-05 needs a waterfall of package variances.</div>${ai('Sonnet 5.5 · 24 s · 14 cr', `<p>The kit has no waterfall. I created <b>GAP-01</b> and linked the closest item.</p><div class="sp-gg isnew" data-feature="F452">${NT}<div class="gh"><span>GAP created</span><button type="button" data-does="Shows the GAP as a plain table row" data-feature="F452">Show as table</button></div><div class="sp-gc prop"><div class="k">${ic('alert', 12)}GAP-01<span class="tag">${pill(['warn', 'Open'])}</span></div><div class="tt">Variance bridge chart</div><div class="bd">Closest: components/flow-diagram. Ticket T-218 points at GAP-01.</div><div class="ft"><span class="s">Not a kit change</span>${btn('Open GAP', { sm: true, does: 'Opens the GAP entry with its closest item', f: 'F453' })}</div></div></div>`)}`,
      reg: `<div class="sp-ub">List every GAP and what is closest.</div>${ai('Sonnet 5.5 · 8 s · 4 cr', '<p>4 entries. <b>GAP-04</b> closed when kit r3 added a side sheet. 2 are open, 1 is a proposal.</p>')}`,
      reuse: `<div class="sp-ub">Can we reuse the pill and diff code from the reference?</div>${ai('Sonnet 5.5 · 31 s · 20 cr', '<p>Two files are eligible under Apache-2.0 with a NOTICE. <b>RevealBlock.tsx</b> has no licence, so it is blocked. I listed each file.</p>')}`,
      refuse: `<div class="sp-ub">Refactor the whole repo to use the kit.</div>${ai('Sonnet 5.5 · 9 s · 5 cr', '<p>I will not change your codebase automatically, and I will not adopt a whole reference app. I can propose a <b>UI inventory</b> and reuse single components after a licence review.</p>')}${sugg(['Draft the UI inventory'], 'F457')}`,
    };
    return chatPanel({ ...base, msgs: m[variant] });
  };
  const N14 = {
    pick: note('<b>Kit picks</b>: each UI ticket uses one kit slug or one GAP id. The amber card is a component the kit does not have.', 'left:384px;top:704px;max-width:330px'),
    kit: note('<b>Kit change</b> is its own Proposal. A principles change on S07 never edits the kit.', 'left:790px;top:704px;max-width:300px'),
    tok: note('<b>Tokens</b> are read here. Edit opens a Proposal; the accepted r3 values stay until you accept.', 'left:384px;top:704px;max-width:330px'),
    gapA: note('<b>Chat creates a GAP</b> when a needed component is not in the kit, with the closest item attached. It does not add anything to the kit.', 'left:384px;top:704px;max-width:340px'),
    gapB: note('<b>Ticket T-218</b> now holds GAP-01 as its component_ref, so no UI ticket is left without one.', 'left:790px;top:704px;max-width:290px'),
    reg: note('<b>GAP register</b>: filter by status. Every row has a closest existing item; a closed GAP says which kit revision closed it.', 'left:384px;top:704px;max-width:340px'),
    reuse: note('<b>Per file</b>: source, licence, obligation, verdict. A file with no licence is blocked, and whole-stack adoption is not offered.', 'left:384px;top:704px;max-width:340px'),
    first: note('<b>Existing first</b>: the kit option is shown before any custom work.', 'left:790px;top:704px;max-width:260px'),
    pol: note('<b>Refusal is a rule, not a mood</b>: no auto-refactor, no whole-app adoption, no unlicensed copy. The inventory is a Proposal you review.', 'left:384px;top:704px;max-width:350px'),
  };
  const mk = (dsChat, tabCur, crumb, body, extra = '') => app({ stage: 'design', save: ['ok', 'Saved 12:44'], chat: chatDs(dsChat), main: main(dsTabs(tabCur), dsTool(crumb), body) }) + extra;
  const vKit = mk('kit', 'kit', 'Kit', kitBody, N14.pick + N14.kit);
  const vTok = mk('tokens', 'tokens', 'DESIGN.md and tokens', tokenBody, N14.tok);
  const vGap = mk('gap', 'gap', 'GAP-01', gapDetail, N14.gapA + N14.gapB);
  const vReg = mk('reg', 'reg', 'GAP register', regBody, N14.reg);
  const vReuse = mk('reuse', 'kit', 'Reuse review', reuseBody, N14.reuse + N14.first);
  const vPol = mk('refuse', 'kit', 'Reuse policy', policyBody, N14.pol);

  const s14 = {
    file: 'S14-design-system', code: 'S14', tier: 'LIVING SPEC', name: 'Design system: kit and GAP register',
    ext: 'New. Spekin has no built screen yet. PRD GAP-10 (DESIGN.md and token viewer) plus the kit decision and the GAP register for components the kit lacks.',
    lives: 'Spekin web app · /p/meranti-yard/design/system (tab and GAP id in the query).',
    views: [
      { id: 'kit', label: 'Kit and picks', html: vKit, entry: 'Projects > Meranti Yard > Design > Design system > Kit tab.', data: 'sample/parts/gap-b.mjs → GAPB_KIT, GAPB_PICKS.' },
      { id: 'tokens', label: 'DESIGN.md and tokens', html: vTok, entry: 'Design > Design system > DESIGN.md tab.', data: 'sample/parts/gap-b.mjs → GAPB_TOKENS.' },
      { id: 'gap', label: 'GAP created', html: vGap, entry: 'Design > F-05 > ask the chat for a waterfall; the kit has none.', data: 'sample/parts/gap-b.mjs → GAPB_GAPS[0], GAPB_PICKS.' },
      { id: 'register', label: 'GAP register', html: vReg, entry: 'Design > Design system > GAP register tab.', data: 'sample/parts/gap-b.mjs → GAPB_GAPS.' },
      { id: 'reuse', label: 'Reuse review', html: vReuse, entry: 'Design > Design system > Kit > Review reuse of a reference component.', data: 'sample/parts/gap-b.mjs → GAPB_PROV.' },
      { id: 'policy', label: 'No auto-refactor', html: vPol, entry: 'Design > chat: "Refactor the whole repo to use the kit."', data: 'sample/parts/gap-b.mjs → GAPB_PROV (inventory draft, no repo edit).' },
    ],
    side: {
      must: [
        'The chosen kit, its revision and the decision that chose it are shown, with the components each screen uses.',
        'When a needed component is not in the kit, a GAP entry is created with the closest existing item. The kit is never changed by the GAP.',
        'The register lists every GAP with its closest item, where it is used and its status, and says what closed it.',
        'Each UI ticket names exactly one kit slug or one GAP id.',
        'DESIGN.md and tokens are viewable; every edit is a Proposal.',
        'Reuse is reviewed per file: source, licence, obligation. No automatic refactor of your codebase and no whole reference app is adopted.',
      ],
      motion: [
        ['Tab switch', 'Content cross-fades 160 ms, ease cubic-bezier(0.23,1,0.32,1).'],
        ['GAP card', 'A new GAP enters with a 4 px rise over 220 ms and a yellow NEW edge; no bounce.'],
        ['Register rows', 'Rows reveal 40 ms apart, 180 ms each.'],
        ['Filter', 'Rows that do not match fade out in 140 ms and the list closes up.'],
        ['Verdict pills', 'Colour swaps with a 140 ms fade; the text also states the verdict.'],
        ['Reduce Motion', 'All swaps are instant. Status changes are still announced.'],
      ],
      stories: [
        ['F451', 'new', 'Kit decision card and the component picks per screen (R-DS-4).', 'OpenDesign'],
        ['F452', 'new', 'Missing kit component creates a GAP entry from the chat or a frame; the kit is not edited (R-DS-4).', 'PRD'],
        ['F453', 'new', 'Every GAP links its closest existing item, with a use-closest-instead Proposal (R-DS-4).', 'PRD'],
        ['F454', 'new', 'GAP register table with status filter and a closed-by note (R-DS-4).', 'PRD'],
        ['F455', 'new', 'UI ticket component_ref shows a kit slug or a GAP id (R-DS-4, AC-26).', 'PRD'],
        ['F456', 'new', 'Per-file licence and provenance review of reuse candidates; unlicensed files are blocked (R-DS-8).', 'PRD'],
        ['F457', 'new', 'No automatic codebase refactor and no whole-app adoption; a UI inventory is only a Proposal (R-DS-8, AC-60).', 'PRD'],
        ['F458', 'new', 'Existing kit component shown before any custom work (R-DS-8).', 'PRD'],
        ['F459', 'new', 'DESIGN.md and token viewer; edits are Proposals (R-DS-4, R-DS-8).', 'OpenDesign'],
      ],
      where: '<span><b>Route:</b> <code>/p/:project/design/system</code>, tab and GAP id in the query.</span><span><b>UI units:</b> PRD <code>blocks/app-directory</code> and <code>components/agent-findings</code>; OpenDesign design-system pane patterns (Apache-2.0, NOTICE for code reuse).</span><span><b>Rust core owns:</b> the GAP record with closest slug, the licence and provenance check, and the guard that no tool writes to the user repo.</span><span><b>Open decisions:</b> Q-30 codebase-refresh architecture; whether the closest item is chosen by the model or by a fixed slug list (recommended: fixed list).</span>',
    },
    refs: { note: 'OpenDesign design-system pane is the main reference. Reuse rules follow the PRD (R-REU); no reference code is copied.', shots: [
      { img: 'od-design-canvas.png', cap: '<b>OpenDesign canvas.</b> Frames next to a design-system file. Spekin shows the same pair as a kit tab and a frame tab.' },
      { img: 'od-studio-document.png', cap: '<b>OpenDesign document.</b> A rendered file with sources. Spekin uses the file style for DESIGN.md.' },
    ] },
  };

  // =====================================================================================================
  // S19  ADRs and glossary
  // =====================================================================================================
  const gRight = btn('Propose change', { cls: 'ink', icon: 'diff', does: 'Starts a Proposal for a term or ADR; accepted records change only through S08, never by an inline write', f: 'F465' });
  const gTabs = (cur) => tabs([['doc', 'Glossary', cur === 'glo'], ['doc', 'ADRs', cur === 'adr'], ['diff', 'Proposal P-33', cur === 'prop'], ['doc', 'Spec', false]], gRight);
  const gSwitch = (cur) => `<div class="sp-seg isnew" role="group" aria-label="Record type" data-feature="F461">${NT}${[['Glossary', 'F461'], ['ADRs', 'F463']].map(([t, f]) => `<button type="button" aria-pressed="${t === cur ? 'true' : 'false'}" data-does="Shows the ${t === 'ADRs' ? 'architecture decision records' : 'glossary of domain terms'} of ${P.name}" data-feature="${f}">${t}</button>`).join('')}</div>`;
  const gTool = (cur, crumb) => tool(`${gSwitch(cur)}<span class="sp-crumb">Expert layer${ic('chevR', 12)}<b>${crumb}</b></span><span class="sp-fill"></span>${btn('Check contradictions', { sm: true, icon: 'search', does: 'Checks every term and ADR against each other and lists contradictions; nothing is changed', f: 'F467' })}${undoRedo('F461')}`);

  const termRows = (hi) => S.GAPB_TERMS.map((t) => `<tr${t.term === hi ? ' class="gpb-sel"' : ''}><td><span class="id">${t.term}</span><small>${t.id}</small></td><td>${t.al}</td><td>${t.ctx}</td><td>${t.def}</td><td class="mono">${t.rev}</td></tr>`).join('');
  const gloBody = `<div class="gpb-page"><div class="gpb-head"><h2>Glossary</h2>${pill(['ok', '5 terms · accepted r14'])}<span class="gpb-meta">Bahasa and English, domain meaning only</span></div>
<div class="gpb-card isnew" data-feature="F461" style="padding:0">${NT}<table class="sp-tbl gpb-tbl"><thead><tr><th>Term</th><th>Aliases</th><th>Bounded context</th><th>Meaning</th><th>Rev</th></tr></thead><tbody>${termRows('Forecast')}</tbody></table></div>
<div class="gpb-card isnew" data-feature="F462">${NT}<div class="h">${ic('doc', 14)}Forecast · Perkiraan<span>GLO-02 · meaning only, no field names or code</span><span class="sp-fill"></span>${btn('Propose alias', { sm: true, does: 'Drafts a Proposal that adds an alias to GLO-02; the glossary stays r14', f: 'F462' })}</div>
<dl class="gpb-kvs"><dt>Aliases</dt><dd>EAC, cost-to-complete</dd><dt>Context</dt><dd>Cost control only. In Alerts, "limit" is used instead.</dd></dl></div></div>`;

  const adrRow = (a, cur) => `<div class="gpb-item${cur ? ' cur' : ''}${a.st[1].startsWith('Superseded') ? ' dim' : ''}"><span class="id">${a.id}</span><span class="nm"><span class="t">${a.t}</span><small>${a.rev} · ${a.link}</small></span>${pill(a.st)}</div>`;
  const A3 = S.GAPB_ADR3;
  const adrBody = `<div class="gpb-page"><div class="gpb-head"><h2>Architecture decision records</h2><span class="gpb-meta">Only hard-to-reverse trade-offs · 5 records</span></div>
<div class="gpb-two l"><div class="gpb-card isnew" data-feature="F463">${NT}<div class="h">${ic('list', 14)}Records</div><div class="gpb-list">${S.GAPB_ADRS.map((a, i) => adrRow(a, i === 0)).join('')}</div></div>
<div class="gpb-col"><div class="gpb-card"><div class="h">ADR-003 · ${pill(['ok', 'Accepted r12'])}<span class="sp-fill"></span><span class="gpb-chip">R-DASH-014</span><span class="gpb-chip">PRN-1</span></div>
<dl class="gpb-kvs"><dt>Context</dt><dd>${A3.ctx}</dd><dt>Alternatives</dt><dd>${A3.alts.join('<br>')}</dd><dt>Decision</dt><dd>${A3.decision}</dd><dt>Consequences</dt><dd>${A3.cons}</dd></dl></div>
<div class="gpb-card isnew" data-feature="F464">${NT}<div class="h">${ic('link', 14)}Supersession</div><div class="gpb-chain"><span class="gpb-chip">ADR-002 · Superseded</span><span class="ar">${ic('chevR', 12)}</span><span class="gpb-chip">ADR-006 · Accepted r11</span><span class="gpb-note-in">The earlier record stays readable.</span></div></div></div></div></div>`;

  const propBody = `<div class="gpb-page"><div class="gpb-head"><h2>Proposal P-33</h2>${pill(['acc', 'Base r14'])}<span class="gpb-meta">2 hunks · from the chat, nothing is written yet</span></div>
<div class="gpb-card isnew" data-feature="F465">${NT}<dl class="gpb-kvs"><dt>Source</dt><dd>${S.GAPB_PROPOSAL.src}</dd><dt>Affects</dt><dd>${S.GAPB_PROPOSAL.affects.map((x) => `<span class="gpb-chip">${x}</span>`).join(' ')}</dd><dt>Base revision</dt><dd>${S.GAPB_PROPOSAL.base} · current</dd></dl></div>
<div class="gpb-hunk isnew" data-feature="F466">${NT}<div class="hh">${ic('doc', 12)}GLO-02 Forecast · aliases<span class="sp-fill"></span>${pill(['ok', 'Will accept'])}</div><div class="hb">Aliases: <del>cost-to-complete</del> <ins>EAC, cost-to-complete</ins></div>
<div class="hf">${btn('Accept hunk', { sm: true, cls: 'ink', does: 'Marks only this hunk for the new revision; the code is not renamed', f: 'F466' })}${btn('Reject', { sm: true, does: 'Leaves this hunk out of the revision', f: 'F466' })}</div></div>
<div class="gpb-hunk"><div class="hh">${ic('doc', 12)}ADR-005 · new record, Proposed<span class="sp-fill"></span>${pill(['mute', 'Left out'])}</div><div class="hb"><ins>Thresholds are per package, with a project default.</ins> Alternatives: one global value; per user. Consequence: harder to change later, because stored alerts keep their threshold.</div>
<div class="hf">${btn('Accept hunk', { sm: true, does: 'Marks this ADR hunk for the new revision', f: 'F466' })}${btn('Reject', { sm: true, does: 'Leaves this ADR out; it can be proposed again later', f: 'F466' })}</div></div>
<div class="gpb-card isnew" data-feature="F469">${NT}<div class="h">${ic('check', 14)}Routine choice, no ADR<span>column order in the variance table</span></div><p class="gpb-note-in">Easy to reverse and not surprising, so Spekin did not ask for a record.</p></div></div>`;

  const conBody = `<div class="gpb-page"><div class="gpb-head"><h2>Glossary</h2>${pill(['warn', '1 contradiction'])}<span class="gpb-meta">Checked against 5 terms and 5 ADRs</span></div>
<div class="gpb-card isnew" data-feature="F461" style="padding:0">${NT}<table class="sp-tbl gpb-tbl"><thead><tr><th>Term</th><th>Aliases</th><th>Bounded context</th><th>Meaning</th><th>Rev</th></tr></thead><tbody>${termRows('Threshold')}</tbody></table></div>
<div class="gpb-card warn isnew" data-feature="F467">${NT}<div class="h">${ic('alert', 14)}Contradiction with GLO-05 Threshold</div><p>Your new meaning is "the most rows shown". GLO-05 says a threshold is the percent over budget that flags a package.</p>
<div class="gpb-act">${btn('Keep GLO-05', { sm: true, cls: 'ink', does: 'Drops the new meaning; the glossary stays as it is', f: 'F467' })}${btn('Propose a new term', { sm: true, does: 'Drafts a Proposal for a separate term such as "Row limit" in the Display context', f: 'F467' })}${btn('Propose a change to GLO-05', { sm: true, does: 'Drafts a Proposal that edits GLO-05 and lists every requirement that uses it', f: 'F467' })}</div></div></div>`;

  const staleBody = `<div class="gpb-page"><div class="gpb-head"><h2>Proposal P-34</h2>${pill(['bad', 'Stale'])}<span class="gpb-meta">ADR-007 · base r14 · spec is now r15</span></div>
<div class="gpb-card isnew" data-feature="F468">${NT}<div class="h">${ic('lock', 14)}Accept is blocked until you rebase</div><p>Another Proposal changed R-DASH-017 in r15. This ADR cites it, so the base must be refreshed first.</p>
<div class="gpb-act"><button type="button" class="sp-btn ink sm" disabled aria-disabled="true" data-does="Accept is unavailable while the base is r14 and the spec is r15; rebase first" data-feature="F468">Accept</button>${btn('Rebase on r15', { sm: true, cls: 'ink', does: 'Re-reads the ADR against r15 and shows what changed; nothing is accepted', f: 'F468' })}${btn('Discard', { sm: true, does: 'Drops this proposal; the earlier records are untouched', f: 'F468' })}</div></div>
<div class="gpb-card isnew" data-feature="F464">${NT}<div class="h">${ic('link', 14)}The earlier record is still readable</div>${adrRow(S.GAPB_ADRS[3])}${adrRow(S.GAPB_ADRS[4])}<div class="gpb-chain"><span class="gpb-chip">ADR-002</span><span class="ar">${ic('chevR', 12)}</span><span class="gpb-chip">ADR-006</span><span class="ar">${ic('chevR', 12)}</span><span class="gpb-chip">ADR-007 proposed</span></div></div>
<p class="gpb-sub">No code is renamed by any of these records.</p></div>`;

  const chatG = (v) => {
    const base = { title: 'Spec chat', sub: 'Expert layer', ctxItems: [['doc', 'Glossary', 'r14'], ['doc', 'ADR-003', 'r12'], ['req', 'R-DASH-014', 'r14']], ctxFoot: '≈ 4.8k tokens · records by id, not full text', ph: 'Ask about a term or a decision…' };
    const m = {
      glo: `<div class="sp-ub">What does forecast mean here?</div>${ai('Sonnet 5.5 · 5 s · 2 cr', '<p><b>Forecast</b> (Perkiraan) is the latest estimate of what a package will cost when finished. GLO-02, accepted r10.</p>')}${sugg(['Is forecast the same as EAC?'], 'F465')}`,
      adr: `<div class="sp-ub">Why integer minor units?</div>${ai('Sonnet 5.5 · 6 s · 3 cr', '<p>ADR-003: summing rounded values drifted by 0.02 USD m. Linked to <b>PRN-1</b> and R-DASH-014.</p>')}`,
      prop: `<div class="sp-ub">Is forecast the same as EAC? And should thresholds be per package?</div>${ai('Sonnet 5.5 · 19 s · 11 cr', `<p>Yes for EAC: I proposed it as an alias. Per-package thresholds are a hard-to-reverse trade-off, so I drafted an ADR. Both are in <b>P-33</b>, not in the glossary.</p><div class="sp-gg isnew" data-feature="F465">${NT}<div class="gh"><span>Proposal P-33 · 2 hunks</span><button type="button" data-does="Shows the hunks as a plain table" data-feature="F465">Show as table</button></div><div class="sp-gc prop"><div class="k">${ic('diff', 12)}Glossary and ADR<span class="tag">${pill(['acc', 'Proposal'])}</span></div><div class="tt">Alias EAC · ADR-005</div><div class="bd">Source: message 4. Base r14.</div><div class="ft"><span class="s">Not in spec</span>${btn('Open P-33', { sm: true, cls: 'ink', does: 'Opens the proposal with both hunks', f: 'F465' })}</div></div></div>`)}`,
      con: `<div class="sp-ub">Let's say "threshold" means the most rows we show.</div>${ai('Sonnet 5.5 · 8 s · 4 cr', '<p>That clashes with <b>GLO-05</b>, where a threshold is a percent over budget. I changed nothing. Pick one of the options.</p>')}`,
      stale: `<div class="sp-ub">Accept the ADR for per-package thresholds.</div>${ai('Sonnet 5.5 · 4 s · 1 cr', '<p>I can not accept it yet. The spec moved to <b>r15</b> since the proposal was made. Rebase it first.</p>')}`,
    };
    return chatPanel({ ...base, msgs: m[v] });
  };
  const N19 = {
    glo: note('<b>Glossary</b> holds meaning, aliases and context. A new alias or term arrives as a Proposal, never as an inline write.', 'left:384px;top:704px;max-width:340px'),
    adr: note('<b>ADRs</b> exist only for hard-to-reverse trade-offs. Superseded records stay readable with a link forward.', 'left:800px;top:600px;max-width:340px'),
    prop: note('<b>Accept one hunk</b>: only the alias lands, in one new revision. The ADR hunk stays out, and no code is renamed.', 'left:790px;top:730px;max-width:320px'),
    prop2: note('<b>Source, affected IDs, base revision</b> are on every proposal, so the reviewer sees why it exists.', 'left:384px;top:730px;max-width:340px'),
    con: note('<b>Check contradictions</b> runs against all terms and ADRs. Spekin names the clash and offers three ways out.', 'left:384px;top:704px;max-width:340px'),
    stale: note('<b>Stale base</b>: Accept is disabled and says why. Rebase shows what changed; nothing is accepted for you.', 'left:790px;top:704px;max-width:320px'),
  };
  const mg = (v, tabCur, cur, crumb, body, extra) => app({ stage: 'spec', save: ['ok', 'Saved 12:52'], chat: chatG(v), main: main(gTabs(tabCur), gTool(cur, crumb), body) }) + extra;
  const vGlo = mg('glo', 'glo', 'Glossary', 'Glossary', gloBody, N19.glo);
  const vAdr = mg('adr', 'adr', 'ADRs', 'ADRs', adrBody, N19.adr);
  const vProp = mg('prop', 'prop', 'Glossary', 'Proposal P-33', propBody, N19.prop2 + N19.prop);
  const vCon = mg('con', 'glo', 'Glossary', 'Glossary', conBody, N19.con);
  const vStale = mg('stale', 'prop', 'ADRs', 'Proposal P-34', staleBody, N19.stale);

  const s19 = {
    file: 'S19-adrs-glossary', code: 'S19', tier: 'LIVING SPEC', name: 'ADRs and glossary',
    ext: 'New. Spekin has no built screen yet. Expert layer records; wraps S08 (proposal review) for every change.',
    lives: 'Spekin web app · /p/meranti-yard/spec/records?type=glossary (type and record id in the query).',
    views: [
      { id: 'glossary', label: 'Glossary', html: vGlo, entry: 'Projects > Meranti Yard > Specification > Expert > Glossary.', data: 'sample/parts/gap-b.mjs → GAPB_TERMS.' },
      { id: 'adrs', label: 'ADRs', html: vAdr, entry: 'Specification > Expert > ADRs.', data: 'sample/parts/gap-b.mjs → GAPB_ADRS, GAPB_ADR3.' },
      { id: 'propose', label: 'Proposed from chat', html: vProp, entry: 'Specification > chat: ask "Is forecast the same as EAC?"; open Proposal P-33.', data: 'sample/parts/gap-b.mjs → GAPB_PROPOSAL, GAPB_TERMS, GAPB_ADRS.' },
      { id: 'contradiction', label: 'Contradiction', html: vCon, entry: 'Glossary > chat: define "threshold" as a row limit.', data: 'sample/parts/gap-b.mjs → GAPB_TERMS (Threshold).' },
      { id: 'stale', label: 'Stale ADR proposal', html: vStale, entry: 'Specification > Proposal P-34 after spec r15 was accepted.', data: 'sample/parts/gap-b.mjs → GAPB_ADRS (ADR-002, ADR-006).' },
    ],
    side: {
      must: [
        'The glossary lists each term in Bahasa and English with aliases, bounded context and domain meaning only, with its revision.',
        'An ADR shows status, context, alternatives, decision, consequences, linked requirements and supersession links.',
        'A clarified term or a consequential decision becomes a Proposal with its source, affected IDs and base revision. Nothing is written inline.',
        'Accepted records change only through a reviewed Proposal; each hunk can be accepted alone, and no code is renamed.',
        'New terms and ADRs are checked against existing ones; a contradiction is named and offers ways out.',
        'A stale base blocks Accept until rebased. An earlier ADR stays readable. Routine choices need no ADR.',
      ],
      motion: [
        ['Record switch', 'Glossary and ADRs cross-fade 160 ms, ease cubic-bezier(0.23,1,0.32,1).'],
        ['Hunk accept', 'The hunk tint changes in 140 ms; the count on the review bar counts up 120 ms.'],
        ['Contradiction card', 'Enters with a 4 px rise in 220 ms; the clashing row gets a tint at the same time.'],
        ['Supersession chain', 'Chips reveal left to right, 40 ms apart.'],
        ['Disabled Accept', 'No shake. The reason text is announced as a status.'],
        ['Reduce Motion', 'All swaps are instant. Status changes are still announced.'],
      ],
      stories: [
        ['F461', 'new', 'Glossary table: term in Bahasa and English, aliases, bounded context, meaning, revision (R-STD-2).', 'PRD'],
        ['F462', 'new', 'Term detail states domain meaning and context, not implementation instructions (R-STD-2).', 'PRD'],
        ['F463', 'new', 'ADR list and detail: status, alternatives, rationale, consequences, linked requirements (R-STD-2).', 'PRD'],
        ['F464', 'new', 'Supersession chain; the earlier ADR stays readable (R-STD-2, AC-SPK-34).', 'PRD'],
        ['F465', 'new', 'A clarified term or consequential decision becomes a Proposal with source, affected IDs and base revision (R-STD-2).', 'PRD'],
        ['F466', 'new', 'Per-hunk accept: only the alias lands in one valid revision; no code rename (R-STD-2).', 'PRD'],
        ['F467', 'new', 'Contradiction check against existing terms and ADRs (R-STD-2).', 'PRD'],
        ['F468', 'new', 'A stale base blocks Accept until rebased (R-STD-2, AC-SPK-34).', 'PRD'],
        ['F469', 'new', 'Routine choices get no mandatory ADR; the screen says so (R-STD-2).', 'PRD'],
      ],
      where: '<span><b>Route:</b> <code>/p/:project/spec/records</code>, type and record id in the query.</span><span><b>UI units:</b> PRD <code>components/definitions-table</code> and <code>components/feed-list</code>; OpenDesign <code>InlineDiff</code> pattern (Apache-2.0, NOTICE for code reuse).</span><span><b>Rust core owns:</b> term and ADR records with aliases and supersession, the contradiction check, and the base-revision guard in proposals.</span><span><b>Open decisions:</b> whether the contradiction check is a model call or a rule on aliases and contexts (recommended: rules first, model for meaning).</span>',
    },
    refs: { note: 'PRD component picks and OpenDesign diff patterns. Paraframe and Momo are pattern references only.', shots: [
      { img: 'od-studio-document.png', cap: '<b>OpenDesign document.</b> Rendered record with sources. Spekin shows ADRs in the same document style.' },
      { img: 'od-todo-progress.png', cap: '<b>OpenDesign chat.</b> Cards inside the chat reply. Spekin\'s proposal card follows this.' },
    ] },
  };

  return [s07, s14, s19];
}
