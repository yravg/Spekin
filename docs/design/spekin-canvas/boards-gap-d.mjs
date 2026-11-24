// Gaps group D: S18 Verification and review report, S20 Agent inbox, S25 Export. All stories are NEW (Spekin has no built screen).
// Owner: this file, css/gap-d.css and sample/parts/gap-d.mjs only.
export const tier = 'Delivery: review report, agent inbox, export';
export const order = 4;

export function boards(K) {
  const { S, ic, ib, btn, pill, note, NT, LT, app, chatPanel, tabs } = K;
  const R = S.GAPD_REVIEW, RUNS = S.GAPD_RUNS, STEPS = S.GAPD_STEPS, X = S.GAPD_EXPORT, CTX = S.GAPD_CTX;
  const sbtn = (label, does, f, on, n) => `<button type="button" class="gpd-sbtn" aria-pressed="${on ? 'true' : 'false'}" data-does="${does}" data-feature="${f}">${label}${n != null ? `<span class="n">${n}</span>` : ''}</button>`;
  const seg = (list) => `<div class="gpd-sub isnew" role="tablist" aria-label="Report sections">${list.join('')}</div>`;
  const chk = (on) => `<span class="gpd-chk${on ? ' on' : ''}" aria-hidden="true">${on ? ic('check', 11, 3) : ''}</span>`;
  const OUT = { met: ['ok', 'Met'], unmet: ['bad', 'Unmet'], untested: ['warn', 'Untested'], missing: ['mute', 'Evidence missing'], passed: ['ok', 'Passed'], failed: ['bad', 'Failed'], na: ['mute', 'Not assessed'] };
  const op = (k) => pill(OUT[k]);
  const sh = (stage, chat, main, busy) => app({ stage, save: ['ok', 'Saved 12:41'], busy, chat, main });
  const mainOf = (tabsHtml, banner, work) => `<section class="sp-main" aria-label="Work area">${tabsHtml}${banner}${work}</section>`;
  const chatBox = (title, sub, msgs, run, ph) => chatPanel({ title, sub, ctxItems: CTX, ctxFoot: '≈ 3.2k tokens · secrets by name only', ph: ph || 'Ask about this report, or @ a requirement…', run, msgs });
  const ai = (cost, html) => `<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>${cost}</em></div>${html}</div>`;

  // =====================================================================  S18 review report
  const rightR = btn('Export report', { icon: 'download', does: 'Downloads this report as Markdown, labelled as an unverified continuation packet; secrets are redacted', f: 'F508' });
  const tabsR = tabs([['check', 'Review report · build 0412', true], ['doc', 'Spec r14'], ['list', 'Tests']], rightR);
  const rptHead = (sub, extra = '') => `<div class="gpd-head"><div class="t"><h2>Review of build 0412 against spec ${R.rev}</h2><p>${sub}</p></div>${extra}</div>`;
  const evCard = (rows, miss, cls = '') => `<div class="gpd-two">
<div class="gpd-card isnew" data-feature="F501">${NT}<h3>Evidence examined<span>${rows.filter((r) => r[3] === 'ok').length} of ${rows.length} read</span></h3>${rows.map(([i, n, d, t, l]) => `<div class="gpd-evr">${ic(i, 15)}<span>${n}<small>${d}</small></span>${pill([t === 'ok' ? 'ok' : t === 'none' ? 'mute' : 'warn', l])}</div>`).join('')}</div>
<div class="gpd-card ${cls} isnew" data-feature="F502">${NT}<h3>Missing inputs<span>${miss.length}</span></h3>${miss.map(([n, d]) => `<div class="gpd-ms">${ic('alert', 15)}<span><b>${n}</b><small>${d}</small></span></div>`).join('')}<div class="s">Shown before findings. A missing input is never a pass.</div></div></div>`;
  const axes = (sc, tc, tag = '') => {
    const bar = (c) => `<div class="gpd-bar" aria-hidden="true"><i class="ok" style="flex:${c.met ?? c.passed ?? 0}"></i><i class="bad" style="flex:${c.unmet ?? c.failed ?? 0}"></i><i class="warn" style="flex:${c.untested ?? 0}"></i><i class="mute" style="flex:${c.missing ?? 0}"></i></div>`;
    const tile = (n, l, k) => `<div class="gpd-cnt ${k}"><b>${n}</b><span>${l}</span></div>`;
    return `<div class="gpd-eq">
<div class="gpd-card isnew" data-feature="F503">${NT}<h3>${ic('req', 15)}Spec coverage<span>against accepted spec ${R.rev}</span></h3><div class="gpd-cnts">${tile(sc.met, 'Met', 'ok')}${tile(sc.unmet, 'Unmet', 'bad')}${tile(sc.untested, 'Untested', 'warn')}${tile(sc.missing, 'Evidence missing', '')}</div>${bar(sc)}${btn('Open spec coverage', { sm: true, does: 'Lists every requirement with its outcome and the evidence behind it', f: 'F503' })}</div>
<div class="gpd-card isnew" data-feature="F504">${NT}<h3>${ic('check', 15)}Standards conformance<span>against SD-01 to SD-09</span></h3><div class="gpd-cnts">${tile(tc.passed, 'Passed', 'ok')}${tile(tc.failed, 'Failed', 'bad')}${tile(tc.untested, 'Untested', 'warn')}${tile(tc.missing, 'Evidence missing', '')}</div>${bar(tc)}${btn('Open standards', { sm: true, does: 'Lists every documented standard with its outcome; this axis never offsets the spec axis', f: 'F504' })}</div></div>${tag}`;
  };
  const fTable = (rows, sel = -1, checks = false) => `<table class="sp-tbl isnew" data-feature="F505">${NT}<thead><tr>${checks ? '<th style="width:30px"></th>' : ''}<th style="width:64px">ID</th><th style="width:96px">Against</th><th>Finding</th><th style="width:64px">Severity</th><th style="width:120px">Scope</th><th style="width:130px">State</th></tr></thead><tbody>${rows.map((r, i) => `<tr${i === sel ? ' style="background:var(--accent-soft)"' : ''}>${checks ? `<td>${chk(r[2] !== 'x')}</td>` : ''}<td><code>${r[0]}</code></td><td><code>${r[1]}</code></td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${pill([r[6], r[5]])}</td></tr>`).join('')}</tbody></table>`;
  const subR = (cur) => seg([sbtn('Overview', 'Shows evidence, missing inputs and both axes', 'F501', cur === 0), sbtn('Spec coverage', 'Lists requirements and outcomes', 'F503', cur === 1, 5), sbtn('Standards', 'Lists standards and outcomes', 'F504', cur === 2, 4), sbtn('Risk review', 'Shows the six risk dimensions and the human decisions they need', 'F506', cur === 3, 3), sbtn('Findings', 'Lists findings and the tickets proposed from them', 'F505', cur === 4, 4)]);
  const chatR = (msg, reply, run) => chatBox('Review chat', 'build 0412 vs r14', `<div class="sp-ub">${msg}</div>${ai('Sonnet 5.5 · 2 min · 31 cr', reply)}`, run);
  const workR = (content, insp = '') => `<div class="sp-work"><div class="gpd-pane">${content}</div>${insp}</div>`;

  const bannerLabel = `<div class="sp-banner warn isnew" role="status" data-feature="F508">${NT}${ic('alert', 16)}<p><b>Unverified continuation packet.</b> This report is evidence for review (S08). It does not accept anything or approve a release.</p></div>`;
  const vReport = sh('testing', chatR('Review build 0412 against spec r14.', '<p>Read 3 of 4 inputs. <b>1 requirement unmet, 1 untested, 1 without evidence.</b> I could not read an end-to-end run, so R-DASH-019 is not shown as met.</p>'),
    mainOf(tabsR, bannerLabel, subR(0) + workR(`${rptHead(`${R.reviewer} · ${R.at} · independent review: only the accepted spec, the build and the standards were given`, btn('Propose remaining tickets', { cls: 'ink', does: 'Opens S08 with proposed tickets for the unmet and untested items; nothing is added to S15 until accepted', f: 'F507' }))}
${evCard(R.evidence, R.missing, 'warn')}${axes(R.specCounts, R.stdCounts)}${fTable(R.findings)}`)), '1 reviewing') +
    note('<b>Evidence first</b>: what was read, then what is missing, then findings. Spec and standards are two axes and are never added up.', 'left:20px;top:450px;max-width:312px') +
    note('<b>Open a finding</b>: the inspector shows the requirement, the evidence, and the proposed follow-up ticket.', 'left:20px;top:560px;max-width:312px');

  const vNone = sh('testing', chatR('Review the build against r14.', '<p>No repository or build is connected. I cannot assess anything yet, so I am <b>not</b> saying “no gaps found”.</p>'),
    mainOf(tabsR, `<div class="sp-banner bad isnew" role="alert" data-feature="F502">${NT}${ic('alert', 16)}<p><b>No inputs to review.</b> Connect a repository and upload a test run. Until then every requirement is Not assessed.</p>${btn('Connect repository', { cls: 'ink', sm: true, does: 'Opens the repository connection step in project settings', f: 'F502' })}</div>`, subR(0) + workR(`${rptHead('Review not started · 0 of 4 inputs read')}
${evCard([['repo', 'Repository snapshot', 'Not connected', 'none', 'Missing'], ['server', 'Pinned build', 'Not set', 'none', 'Missing'], ['check', 'Test run', 'Not uploaded', 'none', 'Missing'], ['doc', 'Standards set', 'SD-01 to SD-09 (accepted)', 'ok', 'Read']], [['Repository snapshot', 'Needed to read the code.'], ['Pinned build', 'Needed so evidence names one build.'], ['Test run', 'Needed for Met or Unmet.']], 'bad')}
<div class="gpd-eq"><div class="gpd-card"><h3>Spec coverage<span>${op('na')}</span></h3><p>5 requirements are in scope. None can be assessed.</p></div><div class="gpd-card"><h3>Standards conformance<span>${op('na')}</span></h3><p>9 standards are in scope. None can be assessed.</p></div></div>
<div class="gpd-empty">${ic('alert', 22)}<b>No findings, and that is not a pass</b><span>The report will say “no gaps found on the evidence examined” only after evidence is read.</span></div>`)), '') +
    note('<b>No repo connected</b>: the report says Not assessed. It never shows a green “no gaps found”.', 'left:20px;top:450px;max-width:312px') +
    note('<b>Connect repository</b>: Spekin reads only the commit you pin, and secrets by name only.', 'left:20px;top:560px;max-width:312px');

  const spec3 = [['R-DASH-014', 'Variance threshold per package', 'met', 'AC-014.1 passed on build 0412'], ['R-DASH-015', 'Drill down to cost lines', 'met', 'AC-015.1, AC-015.2 passed'], ['R-DASH-016', 'Export the variance table', 'met', 'AC-016.2 passed after fix'], ['R-DASH-019', 'Alert after 2 periods over 3%', 'met', 'E2E run uploaded, AC-019.1 passed'], ['R-DASH-021', 'Empty state when none over', 'met', 'AC-021.1 passed']];
  const listCard = (title, rows, f, sel = -1) => `<div class="gpd-card isnew" data-feature="${f}">${NT}<h3>${title}<span>${rows.length} assessed</span></h3><div class="gpd-list">${rows.map((r, i) => `<div class="gpd-li${i === sel ? ' sel' : ''}"><code>${r[0]}</code><span>${r[1]}<small>${r[3]}</small></span>${op(r[2])}</div>`).join('')}</div></div>`;
  const inspF = (title, p, sub, body) => `<aside class="sp-insp isnew" aria-label="Inspector" data-feature="F505">${NT}<div class="sp-ih"><div class="a"><b>${title}</b>${pill(p)}<span class="sp-fill"></span>${ib('more', 'More', { does: 'Opens finding actions: copy link, mark reviewed, open evidence', sm: true, f: 'F505' })}</div><div class="s">${sub}</div></div><div class="sp-ib">${body}</div></aside>`;
  const vSplit = sh('testing', chatR('Spec looks done. Can we ship?', '<p><b>Not yet.</b> Every requirement is met, but one documented standard failed. Spec and standards are reported apart, so a pass on one cannot cover the other.</p>'),
    mainOf(tabsR, '', subR(0) + workR(`${rptHead('Re-review after the fixes · build 0419 · independent review RUN-0431')}
<div class="gpd-verdict isnew" data-feature="F504">${NT}<div class="ax"><small>Spec coverage</small>${pill(['ok', 'Met · 5 of 5'])}</div><span class="vs"></span><div class="ax"><small>Standards</small>${pill(['bad', 'Failed · 1 of 4'])}</div><p><b>Not accepted.</b> The spec axis passed and the standards axis failed. The axes are not averaged. An unrelated green build does not verify a requirement without a test that names it.</p></div>
<div class="gpd-eq">${listCard('Spec coverage', spec3, 'F503')}${listCard('Standards conformance', R.std, 'F504', 1)}</div>`,
      inspF('FND-02 · SD-05', ['bad', 'Failed'], 'Standards finding · Medium · Variance table', `<div class="sp-sec"><h4>Evidence<span>2</span></h4>${K.row('E-114', 'Screenshot of Forecast column', 'build 0419 · 24 Nov 13:20', ['ok', 'Read'])}${K.row('E-115', 'Rendered DOM of table', '1 decimal in 4 of 4 rows', ['ok', 'Read'])}</div><div class="sp-sec"><h4>Follow-up<span>1</span></h4>${K.row('T-232', 'Show forecast with two decimals', 'Proposed ticket · not in S15', ['acc', 'Proposal'])}</div><div class="sp-ready"><div class="t">Verification<span class="pill bad">Not verified</span></div><p>A ticket proposal never marks a requirement verified.</p>${btn('Open in review', { cls: 'ink', sm: true, does: 'Opens S08 with the proposed ticket and its evidence', f: 'F507' })}</div>`))), '') +
    note('<b>Two axes, two verdicts</b>: spec Met and standards Failed stay side by side. Neither hides the other.', 'left:20px;top:450px;max-width:312px') +
    note('<b>Green build is not proof</b>: a requirement is Met only with a test that names it, on this build.', 'left:20px;top:560px;max-width:312px');

  const riskCard = ([n, k, d, dec]) => `<div class="gpd-card${k === 'bad' ? ' bad' : k === 'warn' ? ' warn' : ''}"><h3>${n}<span>${pill([k, k === 'ok' ? 'Low' : k === 'warn' ? 'Needs decision' : 'High'])}</span></h3><p>${d}</p><div class="s">${dec}</div></div>`;
  const vRisk = sh('testing', chatR('What do I still have to decide?', '<p>Three risk dimensions need a human decision before this build can go on. I recorded none of them for you.</p>'),
    mainOf(tabsR, '', subR(3) + workR(`${rptHead('Risk review is separate from both axes. It lists what a person must decide.')}
<div class="gpd-risk isnew" data-feature="F506">${NT}${R.risk.map(riskCard).join('')}</div>
<div class="gpd-actions">${btn('Record decision', { cls: 'ink', does: 'Opens a decision form: choice, reason and your name; written to the decision log (S05) with this report revision', f: 'F506' })}${btn('Ask owner', { does: 'Sends the three open decisions to the project owner as a review request', f: 'F506' })}<span class="s" style="font-size:12px;color:var(--ink-dim)">Reviewer input is limited to the accepted spec, the build and the standards (R-VER-6).</span></div>`,
      `<aside class="sp-insp isnew" aria-label="Required decisions" data-feature="F506">${NT}<div class="sp-ih"><div class="a"><b>Required human decisions</b>${pill(['warn', '3 open'])}</div><div class="s">Recorded in the decision log, never by the agent</div></div><div class="sp-ib"><div class="sp-sec"><h4>Open<span>3</span></h4><div class="gpd-dec"><b>Who may acknowledge an alert?</b><small>Authorization · owner: Rina (sample)</small></div><div class="gpd-dec"><b>Rollback plan for migration 0007</b><small>Migration · owner: Rina (sample)</small></div><div class="gpd-dec"><b>Block release over the P-03 threshold bug?</b><small>Monetary impact · owner: Rina (sample)</small></div></div><div class="sp-sec"><h4>Decided<span>0</span></h4></div></div></aside>`)), '') +
    note('<b>Risk review</b> has six dimensions. Each says what could go wrong and which decision it needs.', 'left:20px;top:450px;max-width:312px') +
    note('<b>Record decision</b>: your name and reason go to the decision log. Spekin never decides for you.', 'left:20px;top:560px;max-width:312px');

  const vProp = sh('testing', chatR('Propose tickets for what is left.', '<p>3 tickets drafted from the unmet and untested findings. They are <b>proposals</b>: they reach the ticket board only after you accept them in review.</p>'),
    mainOf(tabsR, '', subR(4) + workR(`${rptHead('Findings with proposed tickets', btn('Propose remaining tickets', { cls: 'ink', icon: 'spark', does: 'Sends the selected proposals to S08 review; on accept they are appended to the ticket board (S15)', f: 'F507' }))}
${fTable(R.findings, 0).replace(/<td>(FND-0\d)<\/td>/g, '<td><code>$1</code></td>').replace(/<td><code><code>/g, '<td><code>')}
<div class="gpd-card isnew" data-feature="F507">${NT}<h3>Proposed tickets<span>3 selected</span></h3><div class="gpd-list">${R.proposals.map((p) => `<div class="gpd-li" style="grid-template-columns:22px 60px minmax(0,1fr) auto">${chk(true)}<code>${p[0]}</code><span>${p[1]}<small>From ${p[3]} · against ${p[2]}</small></span>${pill(['acc', 'Proposal'])}</div>`).join('')}</div><div class="s">FND-03 has no ticket: the missing item is a run, not code. Upload the E2E run instead.</div></div>`)), '') +
    note('<b>Propose remaining tickets</b> (“Usulkan tiket sisa”): opens S08. Nothing lands on the ticket board until you accept.', 'left:20px;top:450px;max-width:312px') +
    note('<b>Proposals never verify</b>: the requirement stays Unmet until a later report reads passing evidence.', 'left:20px;top:560px;max-width:312px');

  // =====================================================================  S20 agent inbox
  const tabsI = tabs([['doc', 'Spec r14 · R-DASH-019', true], ['req', 'Requirements']], btn('Hand off', { cls: 'ink', icon: 'download', does: 'Opens S34 hand-off for accepted revisions only', f: 'F104' }));
  const runCard = (r, o = {}) => {
    const need = r.st === 'wait', failed = r.st === 'fail', run = r.st === 'run';
    const state = need ? pill(['warn', o.capped ? 'Paused' : 'Needs you']) : failed ? pill(['bad', 'Failed']) : run ? pill(['acc', 'Running']) : pill(['ok', 'Done']);
    return `<div class="gpd-run${o.open ? ' open' : ''}${need ? ' need' : ''}${failed ? ' failed' : ''}" data-run="${r.id}"><div class="gpd-rt"><span class="gpd-ri">${ic(r.icon, 15)}</span><span><span class="k">${r.type} · ${r.id}</span><span class="n">${r.title}</span></span>${state}</div>
<div class="gpd-rs">${run ? '<span class="pulse" aria-hidden="true"></span>' : ''}<span>${o.capped ? 'Waiting: credit cap reached' : o.stepText || r.step}</span><span class="c">${r.cost}</span>${o.inline || ''}</div>${o.body || ''}${o.actions ? `<div class="gpd-actions">${o.actions}</div>` : ''}</div>`;
  };
  const stepsHtml = `<div class="gpd-steps">${STEPS.map(([k, t]) => `<div class="gpd-st${k === 'mute' ? ' mute' : ''}"><span class="d ${k}"></span>${t}</div>`).join('')}</div>`;
  const filt = (cur, ns) => `<div class="gpd-ibf isnew" role="group" aria-label="Filter runs" data-feature="F517">${NT}${[['All', ns[0]], ['Needs you', ns[1]], ['Running', ns[2]], ['Finished', ns[3]]].map(([l, n], i) => `<button type="button" aria-pressed="${i === cur ? 'true' : 'false'}" data-does="Shows ${l.toLowerCase()} runs only; the order inside a group is newest first" data-feature="F517">${l} ${n}</button>`).join('')}</div>`;
  const inbox = (cur, ns, list, banner = '') => `<aside class="gpd-inbox isnew" aria-label="Agent inbox" data-feature="F511">${NT}<div class="gpd-ibh"><b>Agent inbox</b>${pill(['mute', 'Project: Meranti Yard'])}<span class="sp-fill"></span>${ib('panel', 'Dock inbox', { does: 'Docks or undocks the inbox; it always sits beside the work, never over it', sm: true, f: 'F511' })}${ib('x', 'Close inbox', { does: 'Closes the inbox; runs keep going and the top-bar chip keeps counting', sm: true, f: 'F511' })}</div>${banner}${filt(cur, ns)}<div class="gpd-ibl">${list}</div></aside>`;
  const grp = (t, n) => `<div class="gpd-grp"><span>${t}</span><span>${n}</span></div>`;
  const typeOf = (id) => RUNS.find((r) => r.id === id);
  const docPrev = (live = true) => `<div class="gpd-pane"><div class="gpd-head"><div class="t"><h2>R-DASH-019 · Alert after 2 periods over 3%</h2><p>Proposal from chat · not in the accepted spec</p></div>${pill(['acc', 'Proposal'])}</div><div class="gpd-doc-prev"><p style="margin:0;font-size:13px;line-height:1.55;max-width:560px">Show an alert on a package when its forecast stays above budget by more than 3% for two periods in a row. Acknowledging the alert records who and when.</p>${live ? `<div class="gpd-card isnew" data-feature="F512">${NT}<h3>${ic('doc', 15)}Depth expansion · RUN-0420<span>live</span></h3><p>Drafting acceptance criteria. The result arrives here as a proposal; the spec is unchanged until you accept it in review.</p><div class="gpd-skel" style="width:92%"></div><div class="gpd-skel" style="width:78%"></div><div class="gpd-skel" style="width:60%"></div></div>` : `<div class="gpd-card"><h3>${ic('doc', 15)}No run is working on this requirement<span>idle</span></h3><p>Start a depth expansion from the chat. It will show here while it runs, and in the inbox.</p></div>`}</div></div>`;
  const chatI = (msg, reply) => chatBox('Specification chat', 'R-DASH-019', `<div class="sp-ub">${msg}</div>${ai('Sonnet 5.5 · 41 s · 14 cr', reply)}`, null, 'Ask about R-DASH-019, or @ a run…');
  const inboxMain = (inb, live = true) => mainOf(tabsI, '', `<div class="sp-work">${docPrev(live)}${inb}</div>`);

  const vList = sh('spec', chatI('Expand R-DASH-019 and break Inc. 2 into tickets.', '<p>Started 2 background runs. They keep going while you work; both are listed in the inbox with their steps.</p>'),
    inboxMain(inbox(0, [6, 2, 2, 2], `${grp('Needs you', 2)}${runCard(typeOf('RUN-0419'), { stepText: 'Awaiting approval', inline: btn('Approve', { sm: true, cls: 'ink', does: 'Approves RUN-0419 with its reserved maximum of 18 credits', f: 'F515' }) + btn('Decline', { sm: true, does: 'Declines the run; nothing is spent', f: 'F515' }) })}${runCard(typeOf('RUN-0417'), { stepText: 'Awaiting approval', inline: btn('Approve', { sm: true, cls: 'ink', does: 'Approves RUN-0417 with its reserved maximum of 26 credits', f: 'F515' }) + btn('Decline', { sm: true, does: 'Declines the run; nothing is spent', f: 'F515' }) })}
${grp('Running', 2)}${runCard(typeOf('RUN-0421'), { inline: ib('comment', 'Steer this run', { does: 'Opens a note box for this run; the note applies at its next step', sm: true, f: 'F514' }) + ib('stop', 'Stop this run', { does: 'Stops the run at its next step; charges settle to what was used', sm: true, f: 'F516' }) })}${runCard(typeOf('RUN-0420'), { inline: ib('comment', 'Steer this run', { does: 'Opens a note box for this run; the note applies at its next step', sm: true, f: 'F514' }) + ib('stop', 'Stop this run', { does: 'Stops the run at its next step; charges settle to what was used', sm: true, f: 'F516' }) })}
${grp('Finished', 2)}${runCard(typeOf('RUN-0418'), { inline: ib('eye', 'Open report', { does: 'Opens the report in S18', sm: true, f: 'F518' }) })}${runCard(typeOf('RUN-0416'), { inline: ib('redo', 'Retry run', { does: 'Starts the run again; a paid retry reserves its maximum first', sm: true, f: 'F516' }) })}`)), '2 running · 2 waiting') +
    note('<b>Six run types</b> all land here: interview turn, depth expansion, reference capture, ticket breakdown, verification intake, independent review.', 'left:20px;top:450px;max-width:312px') +
    note('<b>Top-bar chip</b> counts what is running and waiting. Click it to open this inbox.', 'left:20px;top:560px;max-width:312px');

  const vSteer = sh('spec', chatI('Make the alert rule stricter.', '<p>I can steer the running expansion without stopping it. Add a note in the inbox.</p>'),
    inboxMain(inbox(2, [6, 2, 2, 2], `${grp('Running', 2)}${runCard(typeOf('RUN-0420'), { open: true, body: stepsHtml + `<div class="gpd-steer isnew" data-feature="F514">${NT}<div class="ta">Use 2 consecutive periods, not 2 of the last 3. Keep the acknowledge action out of this ticket.</div><div class="q">${ic('history', 13)}Queued · applied at step 4, the run does not restart</div></div>`, actions: btn('Send note', { sm: true, cls: 'ink', does: 'Adds the note to the run; it is recorded in the run log and applied at the next step', f: 'F514' }) + btn('Stop', { sm: true, icon: 'stop', does: 'Stops the run at its next step; charges settle to what was used', f: 'F516' }) + ib('list', 'Show full log', { does: 'Opens every tool call, file and check of this run, live', sm: true, f: 'F513' }) })}${runCard(typeOf('RUN-0421'))}`)), '2 running · 2 waiting') +
    note('<b>Steering note</b>: typed while the run works. It is logged, shown to the agent at its next step, and never restarts the run.', 'left:20px;top:450px;max-width:312px') +
    note('<b>Step list</b> shows each tool call and check live, with tokens and time (F513).', 'left:20px;top:560px;max-width:312px');

  const vApprove = sh('spec', chatI('Break Inc. 2 into tickets.', '<p>This run needs your approval first because it can write 12 or more proposals. It reserves its maximum before it starts.</p>'),
    inboxMain(inbox(1, [6, 2, 2, 2], `${grp('Needs you', 2)}${runCard(typeOf('RUN-0417'), { open: true, body: `<div class="gpd-steps isnew" data-feature="F515">${NT}<dl class="gpd-kvs" style="margin:2px 0"><dt>Reads</dt><dd>Spec r14 · 24 requirements · DESIGN.md r3</dd><dt>Writes</dt><dd>Ticket proposals only, none accepted</dd><dt>Reserves</dt><dd>26 cr maximum (estimate 14 to 22)</dd><dt>Model</dt><dd>Sonnet 5.5 · Hosted</dd></dl></div>`, actions: btn('Approve and run', { sm: true, cls: 'ink', does: 'Reserves 26 credits and starts the run; unused credits are released at the end', f: 'F515' }) + btn('Change model', { sm: true, does: 'Opens the model picker for this run before it starts', f: 'F515' }) + btn('Decline', { sm: true, does: 'Declines the run; nothing is reserved or spent', f: 'F515' }) })}${runCard(typeOf('RUN-0419'), { actions: btn('Approve', { sm: true, cls: 'ink', does: 'Approves RUN-0419 with its reserved maximum of 18 credits', f: 'F515' }) + btn('Decline', { sm: true, does: 'Declines the run; nothing is spent', f: 'F515' }) })}`)), '2 running · 2 waiting') +
    note('<b>Approve and run</b>: the maximum is reserved first. A run never starts, and never spends, without this click.', 'left:20px;top:450px;max-width:312px') +
    note('<b>Read and write scope</b> is listed before you approve. Ticket proposals never reach S15 without review.', 'left:20px;top:560px;max-width:312px');

  const vDone = sh('spec', chatI('Is the review done?', '<p>The independent review finished. One run failed at intake and can be retried.</p>'),
    inboxMain(inbox(3, [6, 2, 2, 2], `${grp('Finished', 2)}${runCard(typeOf('RUN-0418'), { open: true, body: `<div class="gpd-steps isnew" data-feature="F518">${NT}<div style="font-size:12px;line-height:1.5"><b>Result:</b> spec coverage 2 met, 1 unmet, 1 untested, 1 evidence missing. Standards 2 passed, 1 failed. 3 tickets proposed.</div></div>`, actions: btn('Open report', { sm: true, cls: 'ink', does: 'Opens the full report in S18', f: 'F518' }) + btn('Open in review', { sm: true, does: 'Opens S08 with the 3 proposed tickets', f: 'F518' }) })}${runCard(typeOf('RUN-0416'), { body: `<div class="gpd-steps"><div class="gpd-st"><span class="d" style="background:var(--danger)"></span>results.xml could not be read: not valid XML</div></div>`, actions: btn('Retry', { sm: true, cls: 'ink', does: 'Starts the run again; a paid retry reserves its maximum first', f: 'F516' }) + btn('Open log', { sm: true, does: 'Opens the run log with the failing step', f: 'F513' }) })}`)), '') +
    note('<b>Finished runs</b> keep their result and log. Open report goes straight to S18; the report is evidence, not approval.', 'left:20px;top:450px;max-width:312px') +
    note('<b>A failed run</b> names the step that failed and costs only what it used.', 'left:20px;top:560px;max-width:312px');

  const vCap = sh('spec', chatI('Start the ticket breakdown.', '<p>The credit cap is reached, so no run can start. Approvals stay open until the cap is raised.</p>'),
    inboxMain(inbox(0, [3, 2, 0, 1], `${grp('Needs you', 2)}${runCard(typeOf('RUN-0419'), { capped: true, actions: btn('Approve', { sm: true, does: 'Disabled until credits are available; the run keeps its place', f: 'F519' }).replace('class="sp-btn ghost sm"', 'class="sp-btn ghost sm" disabled') + btn('Decline', { sm: true, does: 'Declines the run; nothing is spent', f: 'F515' }) })}${runCard(typeOf('RUN-0417'), { capped: true, actions: btn('Raise cap in usage', { sm: true, cls: 'ink', does: 'Opens S36 usage to raise or top up the cap', f: 'F519' }) })}${grp('Finished', 1)}${runCard(typeOf('RUN-0418'), { actions: btn('Open report', { sm: true, does: 'Opens the report in S18', f: 'F518' }) })}`,
      `<div class="sp-banner bad isnew" role="alert" data-feature="F519" style="border-bottom:1px solid var(--line)">${NT}${ic('alert', 16)}<p><b>Credit cap reached.</b> No run can start. Running jobs finished first.</p></div>`), false), '0 running · 2 waiting') +
    note('<b>Cap reached</b>: runs wait with their place kept. Nothing starts and nothing is charged in secret.', 'left:20px;top:450px;max-width:312px') +
    note('<b>Empty inbox</b> shows the six run types so you know what will appear here.', 'left:20px;top:560px;max-width:312px');

  const vEmpty = sh('spec', chatI('What is running?', '<p>Nothing is running. Runs from the interview, reference capture and review will list here.</p>'),
    inboxMain(inbox(0, [0, 0, 0, 0], `<div class="gpd-empty isnew" data-feature="F519" style="flex:none;height:300px">${NT}${ic('inbox', 24)}<b>No runs yet</b><span>These background runs will appear here, each with steps, cost and a stop button:</span><span style="font-size:12px;line-height:1.7">Interview turn · Depth expansion · Reference capture<br>Ticket breakdown · Verification intake · Independent review</span></div>`), false), '') +
    note('<b>Empty</b>: no sample rows, no spinner. The inbox says what will appear.', 'left:20px;top:450px;max-width:312px');

  // =====================================================================  S25 export
  const fmt = (id, on, name, desc, f) => `<button type="button" class="gpd-fmt" aria-pressed="${on ? 'true' : 'false'}" data-does="Selects ${name}; the preview on the right changes to match" data-feature="${f}"><span class="gpd-rad"></span><span><b>${name}</b><span>${desc}</span></span></button>`;
  const fmtList = (cur) => `<div class="isnew" style="display:flex;flex-direction:column;gap:8px;position:relative" data-feature="F521">${NT}${fmt('md', cur === 0, 'Markdown', 'One folder of .md files. Readable by people and by any agent.', 'F521')}${fmt('zip', cur === 1, 'Zip', 'The same files in one archive, with a manifest and checksum.', 'F521')}${fmt('yb', cur === 2, 'yravgbuilder', 'Spec layers, AREA-NNN tickets and design files, ready for a coding playbook.', 'F524')}</div>`;
  const scopeBox = `<div class="gpd-card isnew" data-feature="F522">${NT}<h3>Scope<span>accepted only</span></h3><div class="gpd-actions" style="gap:6px">${pill(['ok', `Spec ${X.rev}`])}${pill(['ok', 'DESIGN.md r3'])}${pill(['mute', 'No drafts'])}</div><div class="s">Only accepted revisions leave Spekin. Drafts and proposals are left out and listed before you export.</div></div>`;
  const formEx = (cur, cta, extra = '') => `<div class="gpd-form"><h3>Export project</h3><div class="s" style="font-size:12px;color:var(--ink-dim);margin-top:-6px">Meranti Yard · Inc. 2 · Variance alerts</div>${fmtList(cur)}${scopeBox}${extra}<div class="sp-fill"></div><div class="gpd-actions">${cta}</div></div>`;
  const tabsX = tabs([['doc', 'Spec r14', false], ['download', 'Export', true]], btn('Hand off', { icon: 'download', does: 'Opens S34 coding hand-off, which is different from export', f: 'F104' }));
  const chatX = (msg, reply) => chatBox('Export chat', 'spec r14', `<div class="sp-ub">${msg}</div>${ai('Sonnet 5.5 · 6 s · 2 cr', reply)}`, null, 'Ask about this export, or @ a file…');
  const treeEl = `<div class="gpd-tree isnew" data-feature="F523">${NT}${X.tree.map(([k, n, s]) => `<div class="gpd-tr${k === 'file' ? ' f' : ''}">${ic(k === 'dir' ? 'layers' : 'doc', 14)}${n}<span class="sz">${s}</span></div>`).join('')}</div>`;
  const pvHead = (t, s, extra = '') => `<div class="gpd-head"><div class="t"><h3>${t}</h3><p>${s}</p></div>${extra}</div>`;
  const exMain = (form, pv, banner = '') => mainOf(tabsX, banner, `<div class="sp-work">${form}<div class="gpd-pv">${pv}</div></div>`);
  const goMd = btn('Export Markdown', { cls: 'ink', icon: 'download', does: 'Builds the folder from accepted r14 only and downloads it as a zip of .md files', f: 'F528' });

  const vMd = sh('spec', chatX('Export the spec as Markdown.', '<p>Ready: spec r14 and the accepted design files. Drafts are left out.</p>'),
    exMain(formEx(0, goMd + btn('Cancel', { cls: 'plain', does: 'Closes the export without building anything', f: 'F521' })),
      `${pvHead('Preview · what the files will contain', `${X.name} · 11 items · 45 KB · built from spec ${X.rev}`)}${treeEl}<div class="gpd-card"><h3>MANIFEST.json<span>${pill(['ok', 'Checksum on build'])}</span></h3><div class="s">Lists every file, its source revision and its SHA-256, so a reader can tell what is accepted.</div></div>`), '') +
    note('<b>Pick a format</b>: the preview on the right changes with it. Nothing is built until you press Export.', 'left:20px;top:560px;max-width:312px') +
    note('<b>Accepted only</b>: the file list is the exact content. Drafts never slip in.', 'left:20px;top:450px;max-width:312px');

  const goYb = btn('Export for yravgbuilder', { cls: 'ink', icon: 'download', does: 'Builds the spec layers, AREA-NNN tickets and design files as one bundle for a yravgbuilder run', f: 'F528' });
  const transport = `<div class="gpd-card isnew" data-feature="F526">${NT}<h3>Hand-over<span>Q-10 open</span></h3><div class="gpd-actions" style="gap:6px">${btn('File', { sm: true, cls: 'ink', does: 'Hands over as a downloaded file, the only transport drawn for now', f: 'F526' })}${btn('MCP', { sm: true, later: 'Hand-over through an MCP server; transport is an open owner decision (Q-10)' })}${btn('CLI', { sm: true, later: 'Hand-over through a command line; transport is an open owner decision (Q-10)' })}</div></div>`;
  const vYb = sh('spec', chatX('Prepare this for yravgbuilder.', '<p>Built the bundle from r14: 4 tickets as <b>AREA-NNN</b> rows, each with an observable acceptance line and status. Two are still proposals.</p>'),
    exMain(formEx(2, goYb + btn('Cancel', { cls: 'plain', does: 'Closes the export without building anything', f: 'F521' }), transport),
      `${pvHead('yravgbuilder bundle', `Starts a yravgbuilder playbook from accepted r14 · ${X.layers.length} layers`)}
<div class="gpd-card isnew" data-feature="F524">${NT}<h3>Spec layers<span>${X.layers.length}</span></h3>${X.layers.map(([n, r, c]) => `<div class="gpd-evr" style="grid-template-columns:minmax(0,1fr) auto auto;gap:12px"><span>${n}</span><span class="gpd-ref">${r}</span><span class="s">${c}</span></div>`).join('')}</div>
<table class="sp-tbl isnew" data-feature="F524">${NT}<thead><tr><th style="width:80px">Ticket</th><th>Title and observable acceptance</th><th style="width:96px">Status</th></tr></thead><tbody>${X.tickets.map((t) => `<tr><td><code>${t[0]}</code></td><td>${t[1]}<div style="font-size:11px;color:var(--ink-dim);margin-top:3px">${t[2]}</div></td><td>${pill([t[4], t[3]])}</td></tr>`).join('')}</tbody></table>
<div class="gpd-card isnew" data-feature="F525">${NT}<h3>Design files<span>3</span></h3><div class="s">DESIGN.md r3 · tokens.json (18 tokens) · components.md (6 picks: table, drawer, pill, alert row, filter chip, tab)</div></div>`), '') +
    note('<b>AREA-NNN rows</b>: each ticket carries an observable acceptance line and its status, so a coding playbook can start without a meeting.', 'left:20px;top:560px;max-width:312px') +
    note('<b>Proposed tickets</b> are marked so; the builder is told they are not accepted.', 'left:20px;top:450px;max-width:312px');

  const vLeft = sh('spec', chatX('Export everything, including my drafts.', '<p>Drafts and proposals cannot leave Spekin as accepted work. I listed what stays behind. The export contains accepted r14 only.</p>'),
    exMain(formEx(1, btn('Export accepted only', { cls: 'ink', icon: 'download', does: 'Builds the zip from accepted r14 only; the left-out items stay in Spekin', f: 'F528' }) + btn('Review drafts first', { does: 'Opens S08 review to accept or drop the drafts before exporting', f: 'F527' })),
      `${pvHead('Left out of this export', '6 items are not accepted and stay in Spekin')}
<div class="gpd-card warn isnew" data-feature="F527">${NT}<h3>Not exported<span>3 groups</span></h3>${X.left.map(([a, b]) => `<div class="gpd-ms">${ic('alert', 15)}<span><b>${a}</b><small>${b}</small></span></div>`).join('')}</div>
<div class="gpd-card ok isnew" data-feature="F527">${NT}<h3>Redaction check<span>${pill(['ok', 'Clean'])}</span></h3><p>0 secret values found in 11 files. 2 environment variables appear by name only: <code>DATABASE_URL</code>, <code>SESSION_KEY</code>.</p></div>
<div class="gpd-card"><h3>Stale reference<span>${pill(['warn', '1'])}</span></h3><p>T-198 points at spec r12. It is exported with its source revision, marked stale.</p></div>`,
    `<div class="sp-banner warn isnew" role="status" data-feature="F527">${NT}${ic('alert', 16)}<p><b>6 items are not accepted.</b> They stay out of the export until you accept them in review.</p></div>`), '') +
    note('<b>Left out, and why</b>: drafts, open proposals and stale tickets are named, not silently dropped.', 'left:20px;top:560px;max-width:312px') +
    note('<b>Redaction</b>: secret values never enter a file; names of variables may.', 'left:20px;top:450px;max-width:312px');

  const vBuild = sh('spec', chatX('Zip it.', '<p>Building the archive. The file lists below are written in order; the checksum is made last.</p>'),
    exMain(formEx(1, btn('Cancel build', { cls: 'plain', icon: 'stop', does: 'Stops the build and deletes the partial archive', f: 'F528' })),
      `${pvHead('Building the zip', `${X.name}.zip · 8 of 11 files`)}<div class="gpd-card isnew" data-feature="F528">${NT}<div class="gpd-prog"><div class="gpd-pb" role="progressbar" aria-valuenow="8" aria-valuemin="0" aria-valuemax="11" aria-label="Files written"><i style="width:73%"></i></div>${[['ok', 'Collected accepted r14 and design files'], ['ok', 'Checked for secret values: none found'], ['run', 'Writing files: 8 of 11'], ['mute', 'Zip and checksum']].map(([k, t]) => `<div class="gpd-st${k === 'mute' ? ' mute' : ''}"><span class="d ${k}"></span>${t}</div>`).join('')}</div></div>${treeEl}`), '') +
    note('<b>Real progress</b>: files written out of files total, never a spinner without a number.', 'left:20px;top:560px;max-width:312px') +
    note('<b>Cancel</b> removes the partial archive; the project is untouched.', 'left:20px;top:450px;max-width:312px');

  const vDoneX = sh('spec', chatX('Is it ready?', '<p>Ready. The bundle is labelled r14 and its checksum is recorded. Bring ticket status back after the build.</p>'),
    exMain(formEx(2, btn('Download again', { cls: 'ink', icon: 'download', does: 'Downloads the same file again; no new build', f: 'F528' }) + btn('Copy hand-over note', { icon: 'link', does: 'Copies a short text that tells a coding agent which file to read first', f: 'F526' })),
      `${pvHead('Export ready', `${X.name}-yb.zip · built 24 Nov 13:48`, pill(['ok', 'Downloaded']))}
<div class="gpd-card isnew" data-feature="F528">${NT}<dl class="gpd-kvs" style="margin:0"><dt>File</dt><dd>${X.name}-yb.zip</dd><dt>Source</dt><dd>Spec ${X.rev} · DESIGN.md r3</dd><dt>Contents</dt><dd>11 files · 4 AREA-NNN tickets</dd><dt>SHA-256</dt><dd>9c41 e07b 5d2a 18f3 aa60 71c9</dd></dl></div>
<div class="gpd-drop isnew" data-feature="F529">${NT}${ic('download', 18)}<span><b style="color:var(--ink)">Bring ticket status back.</b> Drop the status file the builder wrote, or pick it.</span><span class="sp-fill"></span>${btn('Choose file', { sm: true, does: 'Opens a file picker for a ticket-status file; nothing is applied until you review it', f: 'F529' })}</div>`), '') +
    note('<b>Done</b>: file, revision and checksum are recorded, so a later import can be matched to this export.', 'left:20px;top:560px;max-width:312px') +
    note('<b>Status back</b>: the builder reports progress; Spekin reads it as a proposal, not as truth.', 'left:20px;top:450px;max-width:312px');

  const vBack = sh('spec', chatX('Import the status file.', '<p>Read 3 tickets. VAR-001 is built and its tests pass. I show the changes first; nothing is applied yet.</p>'),
    exMain(formEx(2, btn('Apply 2 changes', { cls: 'ink', does: 'Records the 2 changed statuses on the ticket board as updates marked from yravgbuilder', f: 'F529' }) + btn('Discard', { cls: 'plain', does: 'Drops the status file; no ticket changes', f: 'F529' })),
      `${pvHead('Ticket status from yravgbuilder', `Matched to export ${X.name}-yb.zip · 3 tickets`)}
<table class="sp-tbl isnew" data-feature="F529">${NT}<thead><tr><th style="width:30px"></th><th style="width:80px">Ticket</th><th style="width:110px">In Spekin</th><th>Reported by builder</th><th style="width:120px">Change</th></tr></thead><tbody>${X.statusBack.map((t, i) => `<tr><td>${chk(i < 2)}</td><td><code>${t[0]}</code></td><td>${t[1]}</td><td>${t[2]}</td><td>${pill([t[3], i < 2 ? 'Update' : 'No change'])}</td></tr>`).join('')}</tbody></table>
<div class="gpd-card"><h3>What this does not do<span></span></h3><p>Status is evidence from another tool. It does not accept a requirement and it does not mark anything verified; run a review (S18) for that.</p></div>`), '') +
    note('<b>Review before apply</b>: each changed status is a row you can untick. Unknown tickets are skipped and listed.', 'left:20px;top:560px;max-width:312px') +
    note('<b>Matched by export</b>: a status file from a different export is refused with the reason.', 'left:20px;top:450px;max-width:312px');

  // =====================================================================  sides
  const motion = (extra) => [...extra, ['Reduce Motion', 'All swaps are instant. Status changes are still announced.']];
  const refsNote = 'OpenDesign (Apache-2.0, commit e033aad) is the main reference for the file and export pattern; patterns only. Spekin copies no brand, copy or assets.';
  const shots = (a, b) => [{ img: 'od-studio-document.png', cap: a }, { img: 'od-todo-progress.png', cap: b }];

  return [
    {
      file: 'S18-review-report', code: 'S18', tier: 'GAP D', name: 'Verification and review report',
      ext: 'New. Spekin has no built screen yet. PRD screen S18 (R-STD-5, R-VER-11). Reads S07 spec and S15 tickets; proposals go to S08.',
      lives: 'Spekin web app · /p/meranti-yard/testing/report (report revision in the query; never evidence content).',
      views: [
        { id: 'report', label: 'Report', html: vReport, entry: 'Projects > Meranti Yard > Testing > Review report.', data: 'sample/parts/gap-d.mjs → GAPD_REVIEW (evidence, missing, spec, std, findings).' },
        { id: 'none', label: 'No repo connected', html: vNone, entry: 'Testing > Review report before any repository or test run is connected.', data: 'sample/parts/gap-d.mjs → GAPD_REVIEW (evidence rows with Missing).' },
        { id: 'split', label: 'Spec pass, standards fail', html: vSplit, entry: 'Testing > Review report > re-review after the fixes > select FND-02.', data: 'sample/parts/gap-d.mjs → GAPD_REVIEW.std; spec3 in boards-gap-d.mjs.' },
        { id: 'risk', label: 'Risk review', html: vRisk, entry: 'Testing > Review report > Risk review.', data: 'sample/parts/gap-d.mjs → GAPD_REVIEW.risk.' },
        { id: 'prop', label: 'Proposed tickets', html: vProp, entry: 'Testing > Review report > Findings > Propose remaining tickets.', data: 'sample/parts/gap-d.mjs → GAPD_REVIEW.findings, proposals.' },
      ],
      side: {
        must: [
          'Evidence examined and missing inputs appear before any finding. A missing input is never a pass.',
          'Spec coverage and standards conformance are two axes, each with its own counts: met or passed, unmet or failed, untested, evidence missing.',
          'One axis never offsets the other: spec met with standards failed reads as not accepted.',
          'Each finding shows the source revision, severity, scope and state.',
          'Risk review lists six dimensions and the human decisions they need; Spekin never records a decision for a person.',
          'Ticket proposals open in S08 and never mark a requirement verified.',
          'The report is labelled as unverified evidence, with secrets redacted when exported.',
        ],
        motion: motion([['Section switch', 'Report sections cross-fade 160 ms spring-ui; the scroll position of each is kept.'], ['Count bars', 'Segments grow 220 ms spring-ui on first open only.'], ['Inspector', 'Finding detail slides in 200 ms spring-panel; focus moves to its title.'], ['Proposal tick', 'Row check 120 ms; the Propose button count updates with a 140 ms fade.']]),
        stories: [
          ['F501', 'new', 'Report header and evidence examined: what was read, from which build and revision, before any finding (R-STD-5, R-VER-11, AC-53).', 'PRD'],
          ['F502', 'new', 'Missing inputs listed before findings; no repo connected is Not assessed, never “no gaps found” (R-STD-5, R-VER-11, AC-53).', 'PRD'],
          ['F503', 'new', 'Spec coverage axis with four outcomes: met, unmet, untested, evidence missing (R-STD-5, AC-SPK-37).', 'PRD'],
          ['F504', 'new', 'Standards conformance axis, separate from spec coverage; spec pass with standards fail stays not accepted (R-STD-5, AC-SPK-37).', 'PRD'],
          ['F505', 'new', 'Findings table: source revision, severity, scope and state, with an inspector for evidence and follow-up (R-STD-5).', 'PRD'],
          ['F506', 'new', 'Risk review: authorization and security, reversibility, data and tenant exposure, external effects, migration, monetary impact; required human decisions (R-STD-5).', 'PRD'],
          ['F507', 'new', 'Propose remaining tickets: opens S08, appended to S15 only on accept; never marks verified (R-STD-5, R-VER-11).', 'PRD'],
          ['F508', 'new', 'Export the report as an unverified continuation packet with secrets redacted (R-STD-5, AC-SPK-35).', 'PRD'],
          ['F509', 'new', 'Independent review runs with reviewer input limited to the accepted spec, build and standards; the run appears in the Agent inbox (R-STD-5, R-VER-6).', 'PRD'],
        ],
        where: '<span><b>Route:</b> <code>/p/:project/testing/report</code>, report revision in the query. Back and Forward never start a paid run.</span><span><b>UI (TS/React):</b> OpenDesign <code>FileWorkspace</code> and table patterns (Apache-2.0, commit <code>e033aad</code>); report cards are Spekin-owned.</span><span><b>Core (Rust):</b> outcome rules (no evidence is never Met), axis counts, revision binding, redaction (R-ARC-1).</span><span><b>Open for Enrico:</b> severity scale names · whether a failed standard blocks Accept in S08 or only warns.</span>',
      },
      refs: { note: refsNote, shots: shots('<b>OpenDesign document.</b> Self-check result under the reply. Spekin turns it into two separate axes with evidence first.', '<b>OpenDesign chat.</b> Status and todo cards. The count tiles and finding rows follow this card style.') },
    },
    {
      file: 'S20-agent-inbox', code: 'S20', tier: 'GAP D', name: 'Agent inbox',
      ext: 'New. Spekin has no built screen yet. The top-bar busy chip and inbox icon (F109) exist on S35; this board draws the panel they open (PRD S20, R-AGT-1, AC-35).',
      lives: 'Spekin web app · docked panel on every stage, /p/meranti-yard/:stage?inbox=1 (run id in the query).',
      views: [
        { id: 'list', label: 'All runs', html: vList, entry: 'Any stage > top bar: click the busy chip or the inbox icon.', data: 'sample/parts/gap-d.mjs → GAPD_RUNS.' },
        { id: 'steer', label: 'Steer a run', html: vSteer, entry: 'Inbox > Running > RUN-0420 > Steer.', data: 'sample/parts/gap-d.mjs → GAPD_RUNS, GAPD_STEPS.' },
        { id: 'approve', label: 'Approve a run', html: vApprove, entry: 'Inbox > Needs you > RUN-0417.', data: 'sample/parts/gap-d.mjs → GAPD_RUNS.' },
        { id: 'done', label: 'Finished and failed', html: vDone, entry: 'Inbox > Finished.', data: 'sample/parts/gap-d.mjs → GAPD_RUNS.' },
        { id: 'cap', label: 'Credit cap reached', html: vCap, entry: 'Inbox while the project credit cap is used up.', data: 'sample/meranti-yard.mjs → USAGE; sample/parts/gap-d.mjs → GAPD_RUNS.' },
        { id: 'empty', label: 'Empty inbox', html: vEmpty, entry: 'Inbox before any run has started.', data: 'none (empty state).' },
      ],
      side: {
        must: [
          'Every background run lists here: interview turn, depth expansion, reference capture, ticket breakdown, verification intake, independent review.',
          'The inbox sits beside the work and never covers it; the top-bar chip keeps counting when it is closed.',
          'A run row shows type, id, step, tokens, time and credits, with Stop and Steer.',
          'A steering note is accepted on every run, logged, and applied at the next step.',
          'Runs that spend credits wait for Approve and reserve their maximum first.',
          'Failed runs name the step that failed; Retry reserves again.',
          'Finished runs link to their result (S18 report, S08 review).',
        ],
        motion: motion([['Panel dock', 'Inbox opens 320 ms spring-panel; the work area keeps its viewport.'], ['Run row', 'Rows enter with a 40 ms stagger and 8 px rise, 220 ms spring-ui.'], ['Expand', 'Step list opens in place, 180 ms height; focus stays on the row.'], ['Live pulse', 'Running dot pulses 1.2 s; no pulse under Reduce Motion.']]),
        stories: [
          ['F511', 'new', 'Docked Agent inbox panel opened from the top-bar chip and icon; beside the work, never over it (R-AGT-1, AC-35).', 'OpenDesign'],
          ['F512', 'new', 'All six run types listed with a type label, id, title and stage (R-AGT-1).', 'PRD'],
          ['F513', 'new', 'Run detail: live steps, tokens and time, with a full log (R-AGT-1, AC-35).', 'OpenDesign'],
          ['F514', 'new', 'Steering note on any run, logged and applied at the next step without restart (R-AGT-1, R-AGT-2, AC-35).', 'PRD'],
          ['F515', 'new', 'Approval with read and write scope and a reserved maximum before a paid run starts (R-AGT-1, R-MOD-5).', 'PRD'],
          ['F516', 'new', 'Stop and Retry; charges settle to what was used (R-AGT-1).', 'OpenDesign'],
          ['F517', 'new', 'Filters and groups: Needs you, Running, Finished; newest first (R-AGT-1).', 'PRD'],
          ['F518', 'new', 'Finished runs open their result: S18 report or S08 review (R-AGT-1).', 'PRD'],
          ['F519', 'new', 'Credit cap reached and empty inbox states with plain next steps (R-AGT-1, R-MOD-10).', 'PRD'],
        ],
        where: '<span><b>Route:</b> docked panel on any stage; <code>?inbox=1&run=RUN-0420</code> reopens it. Back and Forward never start a run.</span><span><b>UI (TS/React):</b> PRD names <code>components/agent-inbox</code>; OpenDesign todo and progress cards as pattern (Apache-2.0, commit <code>e033aad</code>).</span><span><b>Core (Rust):</b> run queue, steps, reservations, steering log, cap checks (R-ARC-1).</span><span><b>Open for Enrico:</b> whether Needs you also pings by email · retention of finished runs (30 days drawn).</span>',
      },
      refs: { note: refsNote, shots: shots('<b>OpenDesign document.</b> Files from this turn listed under the reply. Spekin moves long runs into the inbox.', '<b>OpenDesign chat.</b> A live todo list with steps. Run rows and step lists follow it.') },
    },
    {
      file: 'S25-export', code: 'S25', tier: 'GAP D', name: 'Export (Markdown, zip, yravgbuilder)',
      ext: 'New. Spekin has no built screen yet. PRD screen S25 (R-KEEP-4). Different from S34 coding hand-off and S21 canvas-to-app.',
      lives: 'Spekin web app · /p/meranti-yard/spec/export (format in the query).',
      views: [
        { id: 'md', label: 'Markdown', html: vMd, entry: 'Projects > Meranti Yard > Specification > Export.', data: 'sample/parts/gap-d.mjs → GAPD_EXPORT.tree.' },
        { id: 'yb', label: 'yravgbuilder', html: vYb, entry: 'Export > yravgbuilder.', data: 'sample/parts/gap-d.mjs → GAPD_EXPORT.layers, tickets.' },
        { id: 'left', label: 'Left out', html: vLeft, entry: 'Export > Zip, with drafts present.', data: 'sample/parts/gap-d.mjs → GAPD_EXPORT.left.' },
        { id: 'build', label: 'Building', html: vBuild, entry: 'Export > Zip > Export accepted only.', data: 'sample/parts/gap-d.mjs → GAPD_EXPORT.tree.' },
        { id: 'done', label: 'Ready', html: vDoneX, entry: 'Export > yravgbuilder > Export for yravgbuilder, after the build.', data: 'sample/parts/gap-d.mjs → GAPD_EXPORT.' },
        { id: 'back', label: 'Status back', html: vBack, entry: 'Export ready > Choose file (the builder’s status file).', data: 'sample/parts/gap-d.mjs → GAPD_EXPORT.statusBack.' },
      ],
      side: {
        must: [
          'Three formats: Markdown folder, zip, and a yravgbuilder bundle; the preview shows the exact files.',
          'Only accepted revisions are exported; drafts, proposals and stale items are listed as left out.',
          'The yravgbuilder bundle holds spec layers, tickets as AREA-NNN rows with observable acceptance and status, criteria, DESIGN.md, tokens and component picks.',
          'Secret values never enter a file; variable names may.',
          'Progress shows files written out of files total.',
          'Ticket status can come back from the builder as a reviewed update, never as acceptance.',
          'Hand-over transport is a file now; MCP and CLI wait for owner decision Q-10.',
        ],
        motion: motion([['Format switch', 'Preview cross-fades 160 ms spring-ui; the selected card rings in 120 ms.'], ['Progress', 'Bar width follows real files written; steps tick with a 140 ms fade.'], ['Result card', 'Ready card rises 8 px in 220 ms spring-ui.']]),
        stories: [
          ['F521', 'new', 'Format chooser: Markdown, zip, yravgbuilder, with a live preview (R-KEEP-4).', 'OpenDesign'],
          ['F522', 'new', 'Scope is accepted revisions only, shown as pills before export (R-KEEP-4, R-WS-11).', 'PRD'],
          ['F523', 'new', 'File tree preview with sizes and a manifest (R-KEEP-4, AC-SPK-11).', 'PRD'],
          ['F524', 'new', 'yravgbuilder bundle: spec layers and tickets as AREA-NNN rows with observable acceptance and status (R-KEEP-4).', 'PRD'],
          ['F525', 'new', 'Design files in the bundle: DESIGN.md, tokens, component picks (R-KEEP-4).', 'PRD'],
          ['F526', 'new', 'Hand-over transport: file now, MCP and CLI later pending Q-10 (R-KEEP-4).', 'PRD'],
          ['F527', 'new', 'Left-out list, stale references and redaction check before export (R-KEEP-4, AC-SPK-35).', 'PRD'],
          ['F528', 'new', 'Build with real progress, then a ready card with file, revision and checksum (R-KEEP-4).', 'OpenDesign'],
          ['F529', 'new', 'Import ticket status back from the builder as a reviewed update (R-KEEP-4).', 'PRD'],
        ],
        where: '<span><b>Route:</b> <code>/p/:project/spec/export</code>, format in the query. Back and Forward never rebuild a file.</span><span><b>UI (TS/React):</b> PRD names <code>screens/files</code>; OpenDesign <code>HandoffButton</code> and file list as pattern (Apache-2.0, commit <code>e033aad</code>).</span><span><b>Core (Rust):</b> accepted-only selection, manifest and checksum, redaction, AREA-NNN numbering (R-ARC-1).</span><span><b>Open for Enrico:</b> Q-10 transport (file, MCP or CLI) · ticket status file format · whether Markdown export also offers one single file.</span>',
      },
      refs: { note: refsNote, shots: shots('<b>OpenDesign document.</b> Files from this turn and next steps. Spekin’s preview tree follows this list.', '<b>OpenDesign chat.</b> Progress card in the chat. Spekin shows the same real counts on the build state.') },
    },
  ];
}
