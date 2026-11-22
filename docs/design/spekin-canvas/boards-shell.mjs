// S35 Project workflow shell. Owner: this file only. All stories are NEW: Spekin has no built screen yet (owner 2026-11-22:
// the existing Hub Studio is not the baseline; OpenDesign is the primary reference).
export const tier = 'Shell: project context, eight stages, artifacts, chat';
export const order = 0;

export function boards(K) {
  const { S, ic, ib, btn, pill, note, NT, app, chatPanel, tabs, views, insp, row, mini } = K;
  const F = S.FRAMES;
  const right = btn('Share', { icon: 'share', later: 'Share and comment links (deferred in the browser MVP, R-WS-3)' }) + btn('Hand off', { cls: 'ink', icon: 'download', does: 'Opens S34: downloads only accepted revisions with a fixed revision manifest', f: 'F104' });
  const toolRow = (cur, crumb, extra = '') => `<div class="sp-tool">${views(cur)}<span class="sp-crumb">${crumb}</span><span class="sp-fill"></span>${extra}${ib('undo', 'Undo', { does: 'Undoes the last draft edit on this board', sm: true, f: 'F116' })}${ib('redo', 'Redo', { does: 'Redoes the last undone draft edit', sm: true, f: 'F116' })}${ib('history', 'Revisions', { does: 'Opens the revision list of the selected artifact', sm: true, f: 'F108' })}</div>`;

  // ---- canvas with frames (Design stage)
  const frame = (f, x, y, w, h, inner, cls = '', lab = '') => `<div class="sp-fr ${cls}" style="left:${x}px;top:${y}px;width:${w}px"><div class="sp-frl"><b>${f.id}</b>${f.name}<span class="r">${f.rev || ''}</span>${lab}</div><div class="sp-frb" style="height:${h}px">${inner}</div>${cls.includes('sel') ? `<span class="hdl" style="left:-4px;top:19px"></span><span class="hdl" style="right:-4px;top:19px"></span><span class="hdl" style="left:-4px;bottom:-4px"></span><span class="hdl" style="right:-4px;bottom:-4px"></span>` : ''}</div>`;
  const canvas = `<div class="sp-cv" aria-label="Board: Variance flows">
<div class="sp-cvt">Variance flows<span>5 frames · 1 reference</span></div>
<svg class="sp-arrows" width="782" height="694" aria-hidden="true"><defs><marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="rgba(31,31,31,.35)"/></marker></defs>
<path d="M258 135 C 276 135, 278 150, 294 150" fill="none" stroke="rgba(31,31,31,.35)" stroke-width="1.5" marker-end="url(#ah)"/>
<path d="M426 258 L 426 290" fill="none" stroke="rgba(31,31,31,.35)" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#ah)"/></svg>
${frame(F.f01, 28, 60, 230, 150, mini({ title: 'Portfolio overview', chart: true, table: false, h: 150 }), '', pill(['ok', 'Accepted']))}
${frame(F.f03, 296, 60, 262, 176, mini({ title: 'Variance table', rows: 4, h: 176 }), 'sel', pill(['ok', 'Accepted']))}
${frame(F.f04, 296, 296, 262, 176, mini({ title: 'Variance table', rows: 4, drawer: true, h: 176 }), 'draft', pill(['warn', 'Draft · not accepted']))}
<div class="sp-fr" style="left:600px;top:60px;width:160px"><div class="sp-frl"><b>${F.alt.id}</b>${F.alt.name}<span class="r">${F.alt.takes} takes</span></div><div class="sp-stack" style="position:relative;height:104px"><span class="bk" style="transform:translate(10px,10px)"></span><span class="bk" style="transform:translate(5px,5px)"></span><div class="sp-frb" style="height:100px">${mini({ title: 'Take 1 of 3', rows: 3, kpi: false, h: 100 })}</div></div></div>
<div class="sp-fr" style="left:28px;top:296px;width:230px"><div class="sp-frl"><b>${F.ref.id}</b>${F.ref.name}</div><div class="sp-frb sp-ref" style="height:150px"><div>${ic('image', 22, 1.5)}<span>Reference image · ${F.ref.kind}<br>not an editable frame</span></div></div></div>
<div class="sp-ftool" role="toolbar" aria-label="Canvas tools">${ib('pointer', 'Select (V)', { does: 'Select and move frames', pressed: true, sm: true, f: 'F113' })}${ib('hand', 'Pan (H)', { does: 'Pans the board; Space-drag does the same', sm: true, f: 'F113' })}${ib('frame', 'New frame (F)', { does: 'Starts an empty frame; asks for a prompt or a reference', sm: true, f: 'F113' })}${ib('type', 'Text (T)', { does: 'Adds a text note to the board', sm: true, f: 'F113' })}${ib('comment', 'Nitpick pin (C)', { does: 'Drops a nitpick pin on a frame region (S33)', sm: true, f: 'F113' })}${ib('image', 'Import reference', { does: 'Imports a PNG, JPEG or WebP the user picks as a reference image (S28)', sm: true, f: 'F113' })}<span class="div"></span>${btn('Ask on select', { cls: 'plain', sm: true, icon: 'spark', does: 'When on, selecting a frame region opens the part-instruction popover (S32)', f: 'F113' })}</div>
<div class="sp-zoom" role="group" aria-label="Zoom">${ib('minus', 'Zoom out', { does: 'Zooms the board out; UI text keeps its size', sm: true, f: 'F113' })}<span>64%</span>${ib('plus', 'Zoom in', { does: 'Zooms the board in', sm: true, f: 'F113' })}${ib('fit', 'Fit selection', { does: 'Fits the selected frames in view', sm: true, f: 'F113' })}</div>
</div>`;

  const designInsp = insp({ title: `${F.f03.id} ${F.f03.name}`, pillv: ['ok', 'Accepted r6'], sub: 'Frame · Design stage · edited 12:41 by Rina (sample)', tabsv: [['Links', 1], ['Contract'], ['Revisions'], ['Evidence']],
    body: `<div class="sp-sec"><h4>Requirements<span>3</span></h4>${S.REQS.map((r) => row(r.id, r.t, r.sub, r.pill)).join('')}</div>
<div class="sp-sec"><h4>Design<span>1</span></h4>${row('DESIGN.md', 'Tokens and type scale', 'Accepted r3 · 18 tokens', ['ok', 'Accepted'])}</div>
<div class="sp-sec"><h4>Task and test<span>2</span></h4>${row('T-212', 'Build variance table', 'Frontend · not started', ['mute', 'Open'])}${row('AC-014.2', 'Over-threshold rows flagged', 'No evidence on a pinned build', ['mute', 'Untested'])}</div>
<div class="sp-ready"><div class="t">Design stage<span class="pill warn">3 to review</span></div><p>F-04 draft, 1 gap card and 1 proposal wait for review. Nothing is accepted until you review it.</p>${btn('Open review', { cls: 'ink', sm: true, does: 'Opens S08 review with the 3 pending items for this stage', f: 'F108' })}</div>` });

  const genuiDesign = `<div class="sp-gg isnew" data-feature="F110">${NT}<div class="gh"><span>Requirement cards · 1 gap</span><button type="button" data-does="Shows the same cards as a plain table (text fallback)" data-feature="F110">Show as table</button></div>
<div class="sp-gc"><div class="k">${ic('req', 12)}Requirement<span class="tag">${pill(['ok', 'Accepted r14'])}</span></div><div class="tt">R-DASH-014 · Variance threshold per package</div><div class="bd">Flag a package when forecast exceeds budget by more than 3%.</div><div class="ft"><span class="s">Source: brief §2 · REF-02</span>${btn('Details', { sm: true, does: 'Expands the card in place: criteria, sources and linked frames; focus stays on the card', f: 'F110' })}</div></div>
<div class="sp-gc prop"><div class="k">${ic('alert', 12)}Gap<span class="tag">${pill(['acc', 'Proposal'])}</span></div><div class="tt">No empty state when no package is over</div><div class="bd">Proposed: show “No package over 3% this period”.</div><div class="ft"><span class="s">Not in spec · needs review</span>${btn('Edit', { sm: true, does: 'Edits the proposed criterion as a draft; the spec is unchanged', f: 'F110' })}${btn('Send to review', { sm: true, cls: 'ink', does: 'Adds this proposal to S08 review with its exact diff', f: 'F110' })}</div></div></div>`;
  const chatDesign = chatPanel({ title: 'Design chat', sub: 'F-03 selected', ctxItems: S.CTX_DESIGN, ctxFoot: '≈ 9.8k tokens · the whole board is never sent', ph: 'Ask for a change to F-03, or @ another frame…',
    msgs: `<div class="sp-ub">Add an alert drawer to the variance table for packages over 3%.</div>
<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 34 s · 22 cr</em></div><p>Drew <b>F-04 Alert drawer</b> as a draft. F-03 stays accepted at r6. One gap found.</p>${genuiDesign}</div>
<div class="sp-sugg">${['Compare F-04 with F-03', 'Try 2 more takes of the drawer'].map((t) => `<button type="button" data-does="Puts this prompt in the composer; nothing runs until Send" data-feature="F114">${ic('spark', 13)}${t}</button>`).join('')}</div>` });

  const designMain = (banner = '', dirty = false) => `<section class="sp-main" aria-label="Work area">
${tabs([['grid', 'Variance flows', true], ['frame', 'F-03 Variance table'], ['frame', 'F-04 Alert drawer', false, dirty], ['doc', 'DESIGN.md'], ['req', 'Spec §3']], right)}
${banner}
${toolRow('Canvas', `Design${ic('chevR', 12)}<b>Variance flows</b>`)}
<div class="sp-work">${canvas}${designInsp}</div></section>`;

  // ---- Backend stage
  const backendDoc = `<div class="sp-doc"><div class="meta">${pill(['acc', 'Proposed r2'])}<span>Backend stage · contract, not code · no automatic database writes or migrations</span></div>
<h2>${S.BACKEND.contract.name}</h2>
<p>Read-only endpoints for the variance table and drawer, plus one acknowledge action. Thresholds come from the accepted spec revision, never from the client.</p>
<table class="sp-tbl"><thead><tr><th style="width:64px">Method</th><th>Path</th><th style="width:110px">Requirement</th><th style="width:80px">Role</th><th style="width:120px">Status</th></tr></thead><tbody>${S.BACKEND.endpoints.map(([m, p, r, a, st]) => `<tr><td><code>${m}</code></td><td><code>${p}</code></td><td><code>${r}</code></td><td>${a}</td><td>${pill(st)}</td></tr>`).join('')}</tbody></table>
<h3>Entity VarianceAlert · r1 accepted</h3>
<div class="sp-kv">${S.BACKEND.entity.map(([k, v]) => `<code>${k}</code><span>${v}</span>`).join('')}</div></div>`;
  const backendInsp = insp({ title: 'Backend readiness', pillv: ['bad', 'Not ready · 4 open'], sub: 'Derived from required artifacts, approvals and evidence', tabsv: [['Checklist', 1], ['Links'], ['Evidence']],
    body: `<div class="sp-sec"><h4>Required artifacts<span>6</span></h4>${S.BACKEND.ready.map(([k, n, t]) => `<div class="sp-row"><span class="dot ${k === 'mute' ? 'ring' : k}"></span><span class="nm">${n}</span>${pill([k, t])}</div>`).join('')}</div>
<div class="sp-ready"><div class="t">Upstream change<span class="pill warn">Needs review</span></div><p>Spec r14 changed R-DASH-014 from 5% to 3%. The contract and 1 test were marked for review; r13 and its evidence are kept.</p>${btn('Open the diff', { cls: 'ink', sm: true, does: 'Opens S08 with the r13 → r14 diff and the linked contract lines', f: 'F108' })}</div>` });
  const genuiBackend = `<div class="sp-gg isnew" data-feature="F110">${NT}<div class="gh"><span>Acceptance checklist</span><button type="button" data-does="Shows the checklist as a plain table" data-feature="F110">Show as table</button></div>
<div class="sp-gc"><div class="k">${ic('check', 12)}AC-DASH-014<span class="tag">${pill(['mute', '1 of 3 passed'])}</span></div><div class="sp-ck">${S.BACKEND.checks.map(([on, t, p]) => `<div><span class="bx ${on === 'on' ? 'on' : ''}">${on === 'on' ? ic('check', 10, 3) : ''}</span><span>${t}</span>${pill(p)}</div>`).join('')}</div><div class="ft"><span class="s">Evidence: fixture run, not a pinned build</span>${btn('Propose tests', { sm: true, cls: 'ink', does: 'Drafts 2 test definitions as a proposal for the Testing stage', f: 'F110' })}</div></div></div>`;
  const chatBackend = chatPanel({ title: 'Backend chat', sub: 'contract r2', ctxItems: S.CTX_BACKEND, ctxFoot: '≈ 4.1k tokens · secrets by name only', ph: 'Ask about the contract, entities or migrations…',
    msgs: `<div class="sp-ub">Check this contract against the new 3% threshold.</div>
<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 19 s · 9 cr</em></div><p>The GET endpoint reads the threshold from spec r14, so it follows 3%. Two criteria lack evidence.</p>${genuiBackend}</div>` });
  const backendMain = `<section class="sp-main" aria-label="Work area">
${tabs([['server', 'API contract · variance alerts', true], ['db', 'Entity VarianceAlert'], ['doc', 'Migration proposal 0007']], right)}
<div class="sp-banner warn" role="status">${ic('alert', 16)}<p><b>Needs review.</b> Spec r14 changed R-DASH-014 (threshold 5% → 3%). 2 endpoints and 1 test are linked.</p>${btn('Mark reviewed', { sm: true, does: 'Records a review of this contract against r14; it does not accept the contract', f: 'F101' })}</div>
${toolRow('Document', `Backend${ic('chevR', 12)}<b>API contract</b>`)}
<div class="sp-work">${backendDoc}${backendInsp}</div></section>`;

  const C = S.CONFLICT;
  const conflictBanner = `<div class="sp-banner bad isnew" role="alert" data-feature="F112">${NT}${ic('alert', 16)}<p><b>${C.frame} changed elsewhere</b> (${C.rev}, ${C.by}, ${C.at}). Your edit is kept as a local draft.</p>${btn('Compare', { sm: true, cls: 'ink', does: 'Opens Compare: r8 on the left, your local draft on the right', f: 'F112' })}${btn('Keep as proposal', { sm: true, does: 'Saves your draft as a proposal on top of r8, for review in S08', f: 'F112' })}${btn('Discard draft', { sm: true, cls: 'plain', does: 'Asks to confirm, then drops the local draft and shows r8', f: 'F112' })}</div>`;

  const N = {
    stage: note('<b>Click a stage</b> above: the work area swaps in place, no reload. Each stage keeps its tabs, zoom, selection and drafts. Switching never approves anything.', 'left:922px;top:388px;max-width:196px'),
    ctx: note('<b>Context list</b> (left) is exactly what the next run gets. Remove a chip to leave it out.', 'left:358px;top:676px;max-width:242px'),
    model: note('<b>Model source</b>: Hosted spends credits, BYOK bills your provider, Local agent shows as deferred. Estimate before Send.', 'left:358px;top:772px;max-width:242px'),
    save: note('<b>Save state</b> (top bar): Saving, Saved, Failed (kept on this device) or Conflict. A failed save never shows Saved.', 'left:922px;top:528px;max-width:196px'),
    draft: note('<b>Drafts</b> have a dashed edge and stay apart from accepted frames until reviewed in S08.', 'left:922px;top:656px;max-width:196px'),
    back: note('<b>Same shell, other stage.</b> The header item moved to Backend; Design keeps its board, zoom 64% and F-03 selection for when you come back.', 'left:820px;top:560px;max-width:290px'),
    up: note('<b>Upstream change</b>: an accepted spec change marks linked contracts, tasks and tests Needs review. Older accepted revisions and evidence stay.', 'left:820px;top:680px;max-width:290px'),
    conf: note('<b>Conflict</b>: two sessions edited F-04. Nothing is merged silently; you compare, keep yours as a proposal, or discard it.', 'left:922px;top:420px;max-width:196px'),
  };

  const vDesign = app({ stage: 'design', save: ['ok', 'Saved 12:41'], chat: chatDesign, main: designMain() }) + N.stage + N.ctx + N.model + N.save + N.draft;
  const vBackend = app({ stage: 'backend', save: ['ok', 'Saved 12:41'], chat: chatBackend, main: backendMain }) + N.back + N.up;
  const vConflict = app({ stage: 'design', save: ['bad', 'Conflict · F-04'], chat: chatDesign, main: designMain(conflictBanner, true) }) + N.conf + N.ctx;

  return [{
    file: 'S35-project-shell', code: 'S35', tier: 'SHELL', name: 'Project shell: eight stages, artifacts, chat and canvas',
    ext: 'New. Spekin has no built screen yet; the existing Hub Studio is not used as a baseline (owner, 22 Nov 2026). Wraps S01–S34 and S29 (shared canvas).',
    lives: 'Spekin web app · /p/meranti-yard/design (stage in the path, artifact and frame in the query; never draft text or keys).',
    views: [
      { id: 'design', label: 'Design stage', html: vDesign, entry: 'Projects > Meranti Yard > header: Design.', data: 'sample/meranti-yard.mjs → STAGES, FRAMES, REQS, CTX_DESIGN.' },
      { id: 'backend', label: 'Switched to Backend', html: vBackend, entry: 'From Design, click Backend in the stage header.', data: 'sample/meranti-yard.mjs → BACKEND, CTX_BACKEND.' },
      { id: 'conflict', label: 'Save conflict', html: vConflict, entry: 'Design > F-04 tab: edit while r8 is saved in another session.', data: 'sample/meranti-yard.mjs → CONFLICT.' },
    ],
    side: {
      must: [
        'All eight stages in order, each with a text status and a count. The current stage is shown by position, weight and underline, not by colour alone.',
        'A stage click swaps the work area in place: no reload, and that stage’s tabs, zoom, selection and drafts come back.',
        'Project, increment and the accepted spec revision stay in the top bar on every stage.',
        'Artifact tabs and the Canvas / Preview / Document / Compare views are separate from stages and from the model picker.',
        'The context list shows exactly what the next run sends; the model picker shows source, model and a cost estimate before Send.',
        'Save state is always visible: Saving, Saved, Failed (kept locally) or Conflict.',
        'The inspector shows the selection’s requirement, task, test and revision links, plus stage readiness.',
      ],
      motion: [
        ['Stage switch', 'Work area cross-fades 160 ms with a 4 px slide (spring-ui). The latest click wins; nothing remounts or reloads.'],
        ['Stage pill', 'White pill slides to the new stage, 200 ms spring-ui.'],
        ['Panels', 'Chat and inspector collapse in 320 ms spring-panel; the board keeps its viewport.'],
        ['GenUI card', 'Details expand in place, height 180 ms; focus stays on the card.'],
        ['Save state', 'Text swaps with a 140 ms fade. No spinner without a real progress value.'],
        ['Reduce Motion', 'All swaps are instant. Status changes are still announced.'],
      ],
      stories: [
        ['F101', 'new', 'Eight-stage header in order with text status and counts; readiness derived from artifacts and evidence (R-WF-1, R-WF-3, R-WF-6, R-WF-8).'],
        ['F102', 'new', 'Stage click switches the workspace in place and restores per-stage state; never approves (R-WF-2, R-WF-9, R-WF-10, R-MOT-1).'],
        ['F103', 'new', 'Project context bar: project, increment, accepted spec revision (§7.11).'],
        ['F104', 'new', 'Artifact tabs separate from stages, with dirty-draft marks and Hand off (§7.11, R-WF-12, R-WS-8).'],
        ['F105', 'new', 'Canvas, Preview, Document and Compare views (§7.11).'],
        ['F106', 'new', 'Context list for the next run; whole board never sent (R-CAN-4).'],
        ['F107', 'new', 'Model source picker with estimate before Send (R-MOD-1, R-MOD-3, R-MOD-5).'],
        ['F108', 'new', 'Inspector: links, contract, revisions, evidence, stage readiness (§7.11, R-CAN-3).'],
        ['F109', 'new', 'Agent inbox for jobs and approvals, beside the work (§7.11).'],
        ['F110', 'new', 'Contextual GenUI families: requirement and gap cards, acceptance checklist, with a table fallback (R-GUI-1, R-GUI-4).'],
        ['F111', 'new', 'Usage meter: source, used and cap (R-MOD-10).'],
        ['F112', 'new', 'Save states and conflict recovery; no silent overwrite (R-CAN-6, R-WF-10).'],
        ['F113', 'new', 'Canvas tools: select, pan, frame, text, nitpick pin, import, zoom, fit, Ask on select; zoom scales frames, not UI text (R-CAN-1, R-CAN-8, R-WS-4).'],
        ['F114', 'new', 'Chat controls: history, new chat, collapse, attach, suggestions, Send with the listed context only (R-CAN-4, R-WS-2).'],
        ['F115', 'new', 'UI language switch, English and Bahasa Indonesia (R-LANG).'],
        ['F116', 'new', 'Undo and redo for draft edits on the board (R-CAN-5).'],
      ],
      where: '<span><b>Route:</b> <code>/p/:project/:stage</code>, artifact in the query. Back and Forward restore state and never start a paid job (R-WF-11).</span><span><b>UI (TS/React):</b> OpenDesign Studio patterns, Apache-2.0 reuse candidates at commit <code>e033aad</code>: <code>ChatPane</code>, <code>FileWorkspace</code>, <code>ContextChipStrip</code>, <code>InlineModelSwitcher</code>, <code>GenUISurfaceRenderer</code>, <code>HandoffButton</code>.</span><span><b>Core (Rust):</b> stage status, readiness, revisions, saves and conflicts (R-ARC-1, R-ARC-3).</span><span><b>Open for Enrico:</b> accent colour (Q-28; yravgUI clay used here) · UI language order (PRD says Bahasa Indonesia first; drawn in English for this review).</span>',
    },
    refs: {
      note: 'OpenDesign (Apache-2.0, commit e033aad) is the main reference. Momo and Onlook are pattern references only. Spekin copies no brand, copy or assets.',
      shots: [
        { img: 'od-studio-prototype.png', cap: '<b>OpenDesign Studio.</b> Chat on the left, file tabs, Preview / Code, Export and Share. Spekin keeps the split and adds the stage header and inspector.' },
        { img: 'od-design-canvas.png', cap: '<b>OpenDesign canvas.</b> Canvas / Files / Preview tabs, bottom tool bar, “Ask on select”. Spekin uses the same bottom tool bar.' },
        { img: 'od-todo-progress.png', cap: '<b>OpenDesign chat.</b> Status and todo cards inside the chat. Spekin’s checklist and requirement cards follow this.' },
        { img: 'od-studio-document.png', cap: '<b>OpenDesign document.</b> Self-check result, files from this turn, next-step suggestions under the reply.' },
        { img: 'momo-explore.png', cap: '<b>Momo (pattern only, no licence).</b> The header swaps the whole workspace. Spekin does this with eight stages.' },
        { img: 'onlook-canvas.png', cap: '<b>Onlook (Apache-2.0).</b> Frames on a canvas with frame chips in the chat. Spekin’s context chips follow this.' },
      ],
    },
  }];
}
