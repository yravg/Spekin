// S27 Projects home and S28 Reference intake (BW-01, BW-02). Owner: this file, css/intake.css, sample/parts/intake.mjs.
// All stories are NEW: Spekin has no built screen yet (owner 2026-11-22; OpenDesign is the primary reference).
export const tier = 'Start: projects and reference intake';
export const order = 1;

export function boards(K) {
  const { S, ic, ib, btn, pill, note, NT, LT, app, chatPanel, tabs, views, top, mini } = K;
  const P = S.INTAKE_PROJECTS, R = S.INTAKE_REFS, LIM = S.INTAKE_LIMITS, DEL = S.INTAKE_DELETED;
  const TXT = { ok: 'ready', half: 'in progress', ring: 'not started', warn: 'needs review', bad: 'blocked' };

  // ---- local icons (kit.mjs has no home, folder, upload or shield glyph) and small builders
  const G = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M3.3 17a10 10 0 1 1 17.4 0"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    shield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/>',
    plug: '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    sort: '<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    blur: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" stroke-dasharray="2 3"/>',
  };
  const gi = (n, s = 16, sw = 1.75) => !G[n] ? ic(n, s, sw) : `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${G[n] || ''}</svg>`;
  // text button and icon button with local icons; o.f is always one of this board's feature IDs
  const B = (label, o = {}) => `<button type="button" class="sp-btn ${o.cls || 'ghost'}${o.sm ? ' sm' : ''}"${o.later ? ` data-later="${o.later}" disabled title="Later: ${o.later}"` : ` data-does="${o.does}" data-feature="${o.f}"`}>${o.icon ? gi(o.icon, 14) : ''}${label}${o.later ? LT : ''}${o.kbd ? `<span class="int-k">${o.kbd}</span>` : ''}</button>`;
  const IB = (icon, label, o = {}) => `<button type="button" class="sp-ibtn sm" aria-label="${label}" data-does="${o.does}" data-feature="${o.f}">${gi(icon, o.s || 15)}</button>`;
  const kbd = (t) => `<span class="int-k">${t}</span>`;
  // The shell parts (top bar, stage header, chat, tabs) belong to S35 (F101-F116): draw them without NEW marks and map their feature IDs to one shell story here.
  const shell = (html) => html.split(NT).join('').replace(/ isnew"/g, '"').replace(/class="isnew" /g, '');
  const dotOf = (p) => p.stages.find((s) => s === 'bad') || p.stages.find((s) => s === 'warn') || p.stages.find((s) => s === 'half') || 'ok';
  const marks = (p) => `<span class="int-mk" role="img" aria-label="Stages: ${S.STAGES.map((s, i) => s.name + ' ' + TXT[p.stages[i]]).join(', ')}">${p.stages.map((t, i) => `<i class="dot ${t}" title="${S.STAGES[i].name}: ${TXT[t]}"></i>`).join('')}</span>`;

  // ================================================================ S27 Projects home (outside a project: no stage bar)
  const topBar = ({ crumb = 'Projects', resume = true, meter = '', bare = false } = {}) => {
    const mid = `<div style="display:flex;align-items:center;gap:8px"><span class="int-crumb">${crumb}</span>${resume ? `<span class="sp-sep"></span><button type="button" class="sp-chip" data-does="Opens Meranti Yard where you left it: Design stage, tab Variance flows" data-feature="F139"><span class="k">Resume</span>Meranti Yard${ic('chevR', 12)}</button>` : ''}${B('Switch project', { sm: true, kbd: '⌘K', does: 'Opens the switch-project palette; Ctrl+K on Windows and Linux', f: 'F128' })}</div>` + '\n';
    let h = top({ save: ['ok', 'Saved 12:41'] }).replace(/<div class="isnew"[^>]*data-feature="F103">[\s\S]*?<\/div>\n/, () => mid);
    if (bare) h = h.replace(/<span class="sp-save[^>]*>[\s\S]*?Saved 12:41<\/span>/, '').replace(/<span class="isnew" style="position:relative;display:inline-flex" data-feature="F109">[\s\S]*?<\/button><\/span>/, '');
    if (meter) h = h.replace(/<button type="button" class="sp-meter isnew"[\s\S]*?<\/button>/, () => meter);
    return shell(h, 'F139');
  };
  const rail = (cur, o = {}) => {
    const nav = (k, i, label, does, f, extra = '') => `<button type="button" class="int-nav"${cur === k ? ' aria-current="page"' : ''} data-does="${does}" data-feature="${f}">${gi(i, 16)}${label}${extra}</button>`;
    const recent = o.empty ? '<p class="int-rempty">No projects yet. The ones you open show up here.</p>' : P.slice(0, 5).map((p) => `<button type="button" class="int-rp" data-does="Opens ${p.name} where you left it" data-feature="F121"><i class="dot ${dotOf(p)}"></i><span>${p.name}</span></button>`).join('');
    return `<nav class="int-rail isnew" aria-label="Spekin" data-feature="F121">${NT}
<div class="int-rtop">${B('New project', { cls: 'ink', icon: 'plus', does: 'Opens the Create project dialog', f: 'F130' })}${IB('panel', 'Collapse navigation', { does: 'Collapses the rail to icons; the choice is remembered on this device', f: 'F121' })}</div>
${nav('home', 'home', 'Home', 'Opens Home: the composer and your recent projects', 'F121')}
${nav('projects', 'folder', 'Projects', 'Opens All projects', 'F121', o.empty ? '' : `<span class="n">${P.length}</span>`)}
${nav('usage', 'gauge', 'Usage', 'Opens S36 usage: credits used, reservations and the cap', 'F121', `<span class="n">${o.empty ? '0' : S.USAGE.used.toLocaleString('en-US')} cr</span>`)}
${nav('settings', 'sliders', 'Settings', 'Opens settings: language, account, model sources', 'F121')}
<div class="int-rl">Recent<span>by last opened</span></div>
${recent}
<div class="int-rfoot">${nav('deleted', 'trash', 'Recently deleted', `Opens projects deleted in the last ${DEL.days} days, each with Restore`, 'F134', o.deleted ? '<span class="bd">1</span>' : '')}<div class="int-user"><span class="sp-av" aria-hidden="true">${S.PROJECT.initials}</span><span><b>${S.PROJECT.user}</b>Personal workspace</span></div></div>
</nav>`;
  };
  // drawn thumbnails: text-free miniatures of each project's latest frame
  const tkr = (a, b, c, hi) => `<div class="tk-r"><u style="width:${a}%"></u><u style="width:${b}%"></u><u class="${hi ? 'hi' : ''}" style="width:${c}%"></u></div>`;
  const tkh = (w) => `<div class="tk-h"><i></i><u style="width:${w}%"></u></div>`;
  const thumbs = {
    dash: () => mini({ title: 'Variance', kpi: true, table: true, rows: 3, h: 142 }).replace('height:142px', 'height:100%'),
    gantt: () => `<div class="tk">${tkh(30)}${[[0, 40, 'dk'], [18, 50, ''], [32, 38, 'hi'], [8, 30, ''], [52, 36, 'dk'], [40, 44, '']].map(([l, w, c]) => `<div class="tk-g"><u></u><span class="tr"><u class="${c}" style="left:${l}%;width:${w}%"></u></span></div>`).join('')}</div>`,
    table: () => `<div class="tk">${tkh(26)}${[[40, 22, 20], [52, 30, 26], [34, 26, 16, 1], [46, 18, 24], [38, 28, 18]].map((r) => tkr(...r)).join('')}</div>`,
    form: () => `<div class="tk">${tkh(34)}<div class="tk-f"><u style="width:22%"></u><div class="fld"></div><u style="width:28%"></u><div class="fld"></div><div class="go"></div></div></div>`,
    cards: () => `<div class="tk">${tkh(28)}<div class="tk-c">${[70, 54, 62].map((w) => `<div><b></b><u style="width:${w}%"></u><u style="width:40%"></u></div>`).join('')}</div></div>`,
    empty: () => `<div class="tk-e">${ic('frame', 22, 1.5)}No frames yet</div>`,
  };
  const card = (p, o = {}) => {
    const n = p.stages.filter((s) => s === 'ok').length;
    const corner = o.gone
      ? `<div class="int-gone">${gi('trash', 14)}Deleted ${DEL.at}${B('Restore', { cls: 'ink', sm: true, does: `Restores ${p.name} with its specs, boards and history; it returns to the list in its last-opened place`, f: 'F134' })}</div>`
      : IB('more', `Actions for ${p.name}`, { does: p.role === 'Viewer' ? 'Opens the card menu: Open only, because you are a viewer on this project' : 'Opens the card menu: Open, Rename, Archive, Delete (owner only)', f: 'F135' });
    return `<article class="int-card${o.gone ? ' gone' : ''}"><div class="int-thw"><button type="button" class="int-th" data-does="Opens ${p.name} at ${p.now}; its tabs, zoom and selection come back" data-feature="F126">${thumbs[p.thumb]()}</button>${corner}</div>
<div class="int-cb"><button type="button" class="int-cn" data-does="Opens ${p.name} at ${p.now}" data-feature="F126">${p.name}${p.role === 'Viewer' ? pill(['mute', 'Viewer']) : ''}</button><span class="int-cp">${p.idea}</span><span class="int-cp">${p.inc}</span>
<div class="int-cm">${marks(p)}<em>${n} of 8 ready</em></div>
<div class="int-cf"><span>${p.at}</span><span class="o"><span class="sp-av" aria-hidden="true">${p.ini}</span>${p.owner}</span></div></div></article>`;
  };

  const composerHome = `<div class="int-comp isnew" data-feature="F122">${NT}<div class="ta">${S.INTAKE_COMPOSER.text}<i class="int-caret"></i></div>
<div class="int-cr">${IB('plus', 'Add reference screenshots', { does: 'Adds screenshots to the idea; they open in the Design stage import once the project exists', f: 'F123' })}
<div class="int-seg" role="group" aria-label="Idea language"><button type="button" aria-pressed="false" data-does="Writes the idea and the spec in Bahasa Indonesia" data-feature="F131">ID</button><button type="button" aria-pressed="true" data-does="Writes the idea and the spec in English" data-feature="F131">EN</button></div>
<button type="button" class="sp-model" data-does="Opens the model source picker: Hosted, BYOK, Local agent (deferred)" data-feature="F122"><span class="src">${S.MODEL.source}</span>${S.MODEL.name}${ic('chev', 12)}</button><span class="sp-est">${S.MODEL.est}</span>
<span class="int-cnt">${S.INTAKE_COMPOSER.len} / 4,000</span>
<button type="button" class="sp-send" aria-label="Start" data-does="Creates the project from this idea and starts the first interview question; enabled from 20 characters" data-feature="F122">${ic('up', 15, 2)}</button></div></div>`;
  const chipsHome = `<div class="int-chips isnew" data-feature="F123">${NT}<span class="lb">Start from</span><button type="button" class="int-chip" aria-pressed="true" data-does="Starts from a written idea: Spekin asks short questions, then writes a pitch" data-feature="F123">${ic('spark', 14)}An idea</button><button type="button" class="int-chip" aria-pressed="false" data-does="Starts from screenshots: creates the project and opens the Design stage import (S28)" data-feature="F123">${ic('image', 14)}Reference screenshots</button><button type="button" class="int-chip" aria-pressed="false" data-does="Starts from a spec you already have: pasted or uploaded, read as revision r1" data-feature="F123">${ic('doc', 14)}An existing spec</button></div>`;
  const homeMain = `<section class="int-main" aria-label="Home"><div class="int-hero">
<h1 class="int-h1">Describe what you want to build</h1>
<p class="int-sub">Spekin turns the idea into a spec, a design and a coding hand-off. Nothing is approved until you review it.</p>
${composerHome}${chipsHome}</div>
<div class="int-strip isnew" data-feature="F124">${NT}<div class="int-sh"><b>Recent projects</b>${B('View all ' + P.length, { sm: true, cls: 'plain', does: 'Opens All projects', f: 'F125' })}</div><div class="int-grid">${P.slice(0, 4).map((p) => card(p)).join('')}</div></div></section>`;

  const tabsRow = `<div class="int-tabs" role="tablist" aria-label="Project filter">${[['Recently opened', P.length, true], ['Mine', 5], ['Shared with me', 2], ['Archived', 1]].map(([t, n, s]) => `<button type="button" role="tab" class="int-tab" aria-selected="${s ? 'true' : 'false'}" data-does="Shows ${t.toLowerCase()} projects" data-feature="F127">${t}<span class="n">${n}</span></button>`).join('')}
<span class="int-leg">Stage marks<i class="dot ok"></i>ready<i class="dot half"></i>in progress<i class="dot warn"></i>needs review<i class="dot bad"></i>blocked<i class="dot ring"></i>not started</span></div>`;
  const allMain = (o = {}) => `<section class="int-main" aria-label="All projects">${o.banner || ''}
<div class="int-ph"><div><h1>All projects</h1><p>${P.length} projects, newest opened first</p></div><span class="sp-fill"></span>
<label class="int-input">${gi('search', 14)}<input type="text" readonly aria-label="Filter projects" placeholder="Filter by name or increment"></label>
${B('Last opened', { icon: 'sort', does: 'Changes the order: Last opened, Name or Stage', f: 'F127' })}
<div class="sp-seg" role="group" aria-label="Layout"><button type="button" aria-pressed="true" data-does="Shows projects as cards" data-feature="F125">${gi('grid', 14)}Cards</button><button type="button" aria-pressed="false" data-does="Shows projects as a compact list" data-feature="F125">${gi('list', 14)}List</button></div>
${B('New project', { cls: 'ink', icon: 'plus', does: 'Opens the Create project dialog', f: 'F130' })}</div>
${tabsRow}
<div class="int-grid isnew" data-feature="F125">${NT}${P.map((p) => card(p, { gone: o.gone === p.id })).join('')}<button type="button" class="int-new" data-does="Opens the Create project dialog" data-feature="F130">${gi('plus', 20)}<b>New project</b>Name it, describe the idea, pick a start</button></div></section>`;
  const restoreBanner = `<div class="sp-banner warn isnew" role="alert" data-feature="F134">${NT}<span class="ib">${ic('alert', 16)}</span><p><b>${pj('kenari-fleet').name} was deleted in another session</b> (${DEL.by}, ${DEL.at}). Restore it to bring back its specs, boards and history.</p>${B('Restore project', { sm: true, cls: 'ink', does: 'Restores Kenari Fleet with all revisions; it returns to the list in its last-opened place', f: 'F134' })}${B('Dismiss', { sm: true, cls: 'plain', does: 'Hides this banner; the project stays under Recently deleted', f: 'F134' })}</div>`;
  function pj(id) { return P.find((p) => p.id === id); }

  const palRow = (p, i, sel) => `<div class="int-prw"><button type="button" class="int-pr${sel ? ' sel' : ''}" data-does="Opens ${p.name}; Enter does the same on the highlighted row" data-feature="F128"><i class="dot ${dotOf(p)}"></i><span class="t">${p.name}<small>${p.idea} · ${p.inc}</small></span><span class="w">${p.ago}</span>${kbd('⌘' + (i + 1))}</button>${sel ? IB('pencil', `Rename ${p.name}`, { does: 'Renames this project in place (F2)', f: 'F129' }) : ''}</div>`;
  const palette = (() => {
    const order = S.INTAKE_SWITCH_ORDER.map(pj);
    const rows = order.map((p, i) => i === 2 ? `<div class="int-prw ren"><i class="dot ${dotOf(p)}"></i><div class="int-ren">Bakau Permits renewals<i class="int-caret"></i></div><span class="int-hint">↵ saves · esc cancels</span></div>` : palRow(p, i, i === 1)).join('');
    return `<div class="int-pal isnew" role="dialog" aria-label="Switch project" data-feature="F128">${NT}
<div class="int-pq">${gi('search', 18)}<i class="int-caret"></i><span>Type to find a project</span><span class="sp-fill"></span>${kbd('esc')}</div>
<div class="int-pg">Opened recently<span>by last opened, newest first</span></div>
${rows}
<div class="int-pf">${B('New project…', { sm: true, cls: 'plain', icon: 'plus', does: 'Opens the Create project dialog with the typed text as the name', f: 'F130' })}<div class="hs"><span>${kbd('↑↓')}move</span><span>${kbd('↵')}open</span><span>${kbd('F2')}rename</span><span>${kbd('esc')}close</span></div></div></div>`;
  })();

  const nw = S.INTAKE_NEW;
  const createModal = `<div class="int-mod isnew" role="dialog" aria-label="New project" data-feature="F130">${NT}
<div class="int-mh"><b>New project</b><span>Creating it costs no credits</span><span class="sp-fill"></span>${IB('x', 'Close', { does: 'Closes the dialog without creating anything', f: 'F130' })}</div>
<div class="int-mb">
<div class="int-fl"><div class="lb">What is it for?<span>Picks the questions and the specialist pack</span></div><div class="int-rcs d4" role="radiogroup" aria-label="What is it for"><button type="button" role="radio" aria-checked="false" class="int-rc" data-does="Sets the domain to Dashboard: the interview uses its question bank and pack" data-feature="F130"><b>${ic('grid', 14)}Dashboard</b>Reports and KPIs from your own data</button><button type="button" role="radio" aria-checked="false" class="int-rc" data-does="Sets the domain to Engineering: the interview uses its question bank and pack" data-feature="F130"><b>${ic('layers', 14)}Engineering</b>Drawings, models and IFC (CAD/BIM)</button><button type="button" role="radio" aria-checked="true" class="int-rc" data-does="Sets the domain to Project control: the interview uses its question bank and pack" data-feature="F130"><b>${ic('flag', 14)}Project control</b>Schedule, cost, progress and EAC</button><button type="button" role="radio" aria-checked="false" class="int-rc" data-does="Sets the domain to Finance and stock: the interview uses its question bank and pack" data-feature="F130"><b>${ic('db', 14)}Finance and stock</b>Budgets, invoices and stock levels</button></div></div>
<div class="int-fl"><div class="lb">What do you want to build?<span>20 to 4,000 characters</span></div><div class="int-fi ta foc">${nw.idea}<i class="int-caret"></i></div><div class="int-fh"><span>${nw.ideaLen} / 4,000</span>${pill(['ok', 'Long enough to start'])}</div></div>
</div>
<div class="int-mf"><span class="int-hint">The name comes from your pitch; change it any time. Shown in English · <button type="button" class="int-lang" data-does="Switches the UI to Bahasa Indonesia at once; the idea you typed is kept" data-feature="F131">Bahasa Indonesia</button></span><span class="sp-fill"></span>${B('Cancel', { cls: 'plain', does: 'Closes the dialog without creating anything', f: 'F130' })}${B('Create project', { cls: 'ink', kbd: '⌘↵', does: 'Creates the project and asks the first question; disabled until a domain is picked and the idea has 20 characters', f: 'F130' })}</div></div>`;

  const firstMain = `<section class="int-main" aria-label="Start"><div class="int-first isnew" data-feature="F132">${NT}
<h1 class="int-h1">Start your first project</h1>
<p class="int-sub">Pick the way in that matches what you already have. You can add the others later.</p>
<div class="int-st3">
<button type="button" class="int-sc lead" data-does="Opens the Create project dialog on An idea" data-feature="F132"><span class="tile">${ic('spark', 18)}</span><b>Describe an idea</b>Write a few sentences. Spekin asks short questions, then writes a pitch you can edit.<span class="go">Start with an idea${gi('arrow', 14)}</span></button>
<button type="button" class="int-sc" data-does="Opens the Create project dialog on Reference screenshots; the project opens on the Design stage import (S28)" data-feature="F132"><span class="tile">${ic('image', 18)}</span><b>Add reference screenshots</b>Drop or paste screenshots of an app you like. Spekin learns its look before it draws.<span class="go">Add screenshots${gi('arrow', 14)}</span></button>
<button type="button" class="int-sc" data-does="Opens the Create project dialog on An existing spec" data-feature="F132"><span class="tile">${ic('doc', 18)}</span><b>Bring an existing spec</b>Paste or upload a spec you already wrote. Spekin reads it as revision r1.<span class="go">Import a spec${gi('arrow', 14)}</span></button></div>
<div class="int-low"><div class="int-lw">${gi('plug', 18)}<span><b>Connect a local agent</b>Run models through an agent on your own computer.</span><button type="button" class="sp-btn ghost sm" data-later="Local agent as a model source is deferred (R-MOD-1)" disabled>Connect${LT}</button></div>
<div class="int-lw">${gi('folder', 18)}<span><b>Look around first</b>Open the Meranti Yard sample, read only.</span>${B('Open sample', { sm: true, does: 'Opens the Meranti Yard sample project read only, so nothing you do is saved', f: 'F133' })}</div></div>
<p class="int-priv">${gi('lock', 13)}Everything you add is private to you until you share it.</p></div></section>`;
  const meter0 = '<button type="button" class="sp-meter" data-does="Opens S36 usage: no credits used yet" data-feature="F139">Hosted<i><u style="width:0%"></u></i><b>0</b>of 5,000 cr</button>';
  const win27 = (cur, main, o = {}) => `<div class="int-app">${topBar(o.top)}<div class="int-body">${rail(cur, o.rail)}${main}</div></div>`;
  const scrim = '<div class="int-scrim"></div>';

  // ================================================================ S28 Reference intake (inside the project shell, Design stage)
  const SH = 'F159';
  const ai = (text, extra = '', meta = S.MODEL.name) => `<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>${meta}</em></div><p>${text}</p>${extra}</div>`;
  const chat = (ctxItems, foot, msgs, ph) => shell(chatPanel({ title: 'Design chat', sub: 'Alert ideas', ctxItems, ctxFoot: foot, ph: ph || 'Ask for a screen in the style of your references…', msgs: '§M§' }), SH).replace('§M§', () => msgs);
  const sugg = (items) => `<div class="sp-sugg">${items.map((t) => `<button type="button" data-does="Puts this prompt in the composer; nothing runs until Send" data-feature="F155">${ic('spark', 13)}${t}</button>`).join('')}</div>`;
  const ck = (rows) => `<div class="sp-ck">${rows.map(([on, t, s]) => `<div><span class="bx${on ? ' on' : ''}">${on ? ic('check', 10, 2.4) : ''}</span>${t}<span>${s}</span></div>`).join('')}</div>`;
  const styleCard = `<div class="sp-gc isnew" data-feature="F149">${NT}<div class="k">${ic('spark', 12)}Style job<span class="tag">${pill(['acc', 'Running'])}</span></div><div class="tt">Learning style from 3 references</div>${ck([[1, 'Colours and surfaces', 'done'], [0, 'Type scale', 'reading'], [0, 'Spacing and layout', 'queued']])}<div class="ft"><span class="s">≈ 40 s · 18 cr, estimate</span>${B('Cancel', { sm: true, does: 'Cancels the style job; the references stay on the board and nothing is charged for the unfinished part', f: 'F149' })}</div></div>`;

  // reference panel (right of the board)
  const thF = '<span class="tk"><u style="width:70%"></u><u class="hi" style="width:44%"></u><u></u></span>';
  const fileRow = ({ name, sub, rt, cls = '' }) => `<div class="int-file ${cls}"><span class="th">${thF}</span><span class="nm">${name}<small>${sub}</small></span><span class="rt">${rt}</span></div>`;
  const rtDone = pill(['ok', 'Added']);
  const rtProg = (n, pct) => `<span class="int-bar"><u style="width:${pct}%"></u></span>${IB('x', `Cancel ${n}`, { does: 'Cancels this file only: no job is sent for it and the other files continue', f: 'F144' })}`;
  const rtWait = (n) => pill(['mute', 'Waiting']) + IB('x', `Cancel ${n}`, { does: 'Removes this file from the queue; no job is sent for it', f: 'F144' });
  const rtRetry = (n) => B('Retry', { sm: true, does: `Reads ${n} again once; images already added are kept and nothing is added twice`, f: 'F148' });
  const consent = `<button type="button" role="checkbox" aria-checked="true" class="int-cons" data-does="Confirms you may use these images in this project; the choice is saved with each reference" data-feature="F146"><span class="bx on">${ic('check', 11, 2.4)}</span><span>I may use these images here. They stay private and go only to model providers whose terms forbid training on them.</span></button>`;
  const pan = ({ n, lit, files, count }) => `<aside class="int-pan isnew" aria-label="Reference intake" data-feature="F142">${NT}
<div class="ph"><div class="a"><b>References</b>${pill(['mute', n + (n === 1 ? ' image' : ' images')])}</div><span class="s">Private to this project. Used only when you add them to a run.</span></div>
<div class="int-pb">
<div class="int-dz${lit ? ' lit' : ''}"><span class="ico">${gi('upload', 18)}</span><b>${lit ? 'Release to add' : 'Drop images here'}</b><span class="or">${B('Choose files', { sm: true, does: 'Opens the system file picker for PNG, JPEG or WebP; Enter or Space on the focused button does the same', f: 'F143' })}or paste ${kbd('⌘V')}</span><span>${LIM.types} · ${LIM.sizeMb} MB each · ${LIM.perImport} max</span></div>
${consent}
<div class="int-pd">${gi('shield', 15)}<span>Spekin checks each image for emails, card numbers and passwords before any model reads it.</span></div>
<div class="int-lh">${count.h}<span>${count.s}</span></div>
<div class="int-fs">${files || ''}</div>
${files ? '' : '<div class="int-empty">Nothing added yet. Files you drop, choose or paste show up here with their status.</div>'}
<div class="int-lh">Not yet<span>planned</span></div>
<button type="button" class="int-later" data-later="Capture from a live page needs an in-app browser; deferred (FR-04 to FR-09)" disabled>${gi('globe', 15)}<span>Capture a live page</span>${LT}</button>
<button type="button" class="int-later" data-later="Connecting an editor over MCP is deferred (FR-47)" disabled>${gi('plug', 15)}<span>Connect an editor (MCP)</span>${LT}</button>
<div class="int-keep">${ic('history', 15)}<span>Originals are deleted ${LIM.keepDays} days after import, unless you keep them.</span></div>
</div></aside>`;

  // board
  const fr = (id, name, meta, x, y, w, h, inner, cls = '', lab = '') => `<div class="sp-fr ${cls}" style="left:${x}px;top:${y}px;width:${w}px"><div class="sp-frl"><b>${id}</b>${name}<span class="r">${w < 260 ? meta.split(' · ')[0] : meta}</span>${lab}</div><div class="sp-frb" style="height:${h}px">${inner}</div></div>`;
  const cv = (inner, sub) => `<div class="sp-cv int-cv" aria-label="Board: Alert ideas"><div class="sp-cvt">Alert ideas<span>${sub}</span></div>${inner}</div>`;
  const shotA = (h) => mini({ title: 'Site costs · Q2', kpi: true, chart: true, table: false, h });
  const shotB = (h) => mini({ title: 'Weekly tracker', kpi: false, chart: false, table: true, rows: 4, h });
  const shotC = (h) => mini({ title: 'Status board', kpi: true, chart: false, table: true, rows: 2, h });
  const skel = (pct) => `<div class="int-skel" aria-busy="true"><u style="width:46%"></u><u class="b"></u><u style="width:72%"></u></div><div class="int-prog"><span class="int-bar"><u style="width:${pct}%"></u></span><b class="int-pct">${pct}%</b></div>`;
  const refLab = '';
  const meta = (r) => `${r.kind} · ${r.size}`;
  const job = (txt, wait) => `<div class="int-job isnew${wait ? ' wait' : ''}" data-feature="F149">${NT}${gi('spark', 14)}${txt}${wait ? '' : '<span class="int-bar"><u style="width:38%"></u></span><span class="e">≈ 40 s</span>'}${B('Cancel', { sm: true, cls: 'plain', does: 'Cancels the style job; the references stay on the board', f: 'F149' })}</div>`;
  const main28 = (cvHtml, o = {}) => `<section class="sp-main" aria-label="Work area">${shell(tabs([['grid', 'Variance flows'], ['grid', 'Alert ideas', true], ['frame', 'F-03 Variance table'], ['doc', 'DESIGN.md']], B('Add references', { cls: 'ink', icon: 'image', does: 'Opens the file picker for PNG, JPEG or WebP images', f: 'F143' })), SH)}
${o.banner || ''}<div class="sp-tool">${shell(views('Canvas'), SH)}<span class="sp-crumb">Design${ic('chevR', 12)}<b>Alert ideas</b></span><span class="sp-fill"></span><span class="sp-crumb">${o.status || ''}</span></div>
<div class="sp-work">${cvHtml}${pan(o.pan)}</div></section>`;
  const win28 = (chatHtml, mainHtml, save) => shell(app({ stage: 'design', save: save || ['ok', 'Saved 12:41'], chat: '§CH§', main: '§MN§' }), SH).replace('§CH§', () => chatHtml).replace('§MN§', () => mainHtml);
  const ctx3 = [['image', R.r3.id + ' site-costs', 'r1'], ['image', R.r4.id + ' tracker', 'r1'], ['image', R.r5.id + ' status', 'r1']];
  const ctxFoot = '≈ 4.1k tokens · listed items only';

  // 1 empty board
  const cvEmpty = cv(`<div class="int-start isnew" data-feature="F141">${NT}<h2>Start from what you already have</h2><p>References teach Spekin the look and the structure you want. Nothing leaves this project unless you add it to a run.</p>
<div class="int-sg">
<div class="int-s2 lead"><b>${gi('image', 16)}Drop screenshots</b>PNG, JPEG or WebP from any app, even one behind a login.<span class="row">${B('Choose files', { cls: 'ink', sm: true, does: 'Opens the system file picker for PNG, JPEG or WebP; keyboard users reach it with Tab then Enter', f: 'F143' })}</span></div>
<div class="int-s2"><b>${gi('clipboard', 16)}Paste a screenshot</b>Copy one, click the board, then press<span class="row">${kbd('⌘V')}<span>or</span>${kbd('Ctrl V')}</span></div>
<button type="button" class="int-s2" data-later="Capture from a live page needs an in-app browser; deferred (FR-04 to FR-09)" disabled><b>${gi('globe', 16)}Capture a live page${LT}</b>Needs an in-app browser. Planned after the first release.</button>
<button type="button" class="int-s2" data-later="Sending frames from an editor over MCP is deferred (FR-47)" disabled><b>${gi('plug', 16)}Send frames from your editor${LT}</b>Connect over MCP. Planned after the first release.</button></div></div>`, '0 images · 0 frames');
  const vEmpty = win28(chat([], 'Nothing is sent until you add a reference', ai('No references on this board yet. Add screenshots of an app you like and I will learn its look before I draw. I read only the images you add.') + sugg(['What can I add here?', 'Draw alert ideas without references']), 'Add references, or ask for a screen…'),
    main28(cvEmpty, { pan: { n: 0, files: '', count: { h: 'This import', s: 'empty' } }, status: 'No references yet' }));

  // 2 dropping three files
  const cvDrop = cv(`<div class="int-droplit isnew" data-feature="F144">${NT}<span class="ico">${gi('upload', 22)}</span><b>Release to add 3 images</b><span>${R.r3.src}, ${R.r4.src} and ${R.r5.src}</span></div>
${fr(R.r3.id, R.r3.src, meta(R.r3), 28, 250, 226, 150, shotA(150) + `<div class="int-prog"><span>Checked</span><span class="int-bar"><u style="width:100%"></u></span><b class="int-pct">100%</b></div>`)}
${fr(R.r4.id, R.r4.src, meta(R.r4), 270, 250, 226, 150, skel(62), 'draft')}
${fr(R.r5.id, R.r5.src, meta(R.r5), 512, 250, 226, 150, skel(0), 'draft')}`, '1 image added · 2 coming');
  const vDrop = win28(chat([], 'Nothing is sent until you add a reference', ai('Receiving 3 images. I check each one for personal data before I read it.', ck([[1, R.r3.src, 'checked'], [0, R.r4.src, 'uploading'], [0, R.r5.src, 'waiting']])), 'Add references, or ask for a screen…'),
    main28(cvDrop, { pan: { n: 1, lit: true, count: { h: 'This import', s: '3 files' }, files: fileRow({ name: R.r3.src, sub: `${R.r3.size} · checked, nothing found`, rt: rtDone }) + fileRow({ name: R.r4.src, sub: `${R.r4.size} · uploading 62%`, rt: rtProg(R.r4.src, 62) }) + fileRow({ name: R.r5.src, sub: `${R.r5.size} · waiting`, rt: rtWait(R.r5.src) }) }, status: 'Receiving 3 files' }), ['ok', 'Saving…']);

  // 3 imported
  const cvImp = cv(`${job('Learning style from 3 references')}
${fr(R.r3.id, R.r3.src, meta(R.r3), 28, 64, 340, 214, shotA(214), '', refLab)}
${fr(R.r4.id, R.r4.src, meta(R.r4), 396, 64, 340, 214, shotB(214), '', refLab)}
${fr(R.r5.id, R.r5.src, meta(R.r5), 28, 322, 340, 214, shotC(214), '', refLab)}`, '3 references · 0 drawn frames');
  const vImp = win28(chat(ctx3, ctxFoot, ai('Added 3 references. I am learning their colours, type and spacing. This takes about 40 seconds.', styleCard) + sugg(['Draw an alert drawer in this style'])),
    main28(cvImp, { pan: { n: 3, count: { h: 'This import', s: '3 added' }, files: [R.r3, R.r4, R.r5].map((r) => fileRow({ name: r.src, sub: `${r.size} · ${r.dim}`, rt: rtDone })).join('') }, status: 'Style job running' }));

  // 4 rejected file
  const refusal = `<div class="sp-banner bad isnew" role="alert" data-feature="F150">${NT}<span class="ib">${ic('alert', 16)}</span><p><b>payroll-export.png was not added.</b> It is 14.2 MB and the limit is ${LIM.sizeMb} MB per image. The 2 images already added are kept.</p>${B('Retry', { sm: true, cls: 'ink', does: 'Reads payroll-export.png again, for example after you made it smaller; it is added once', f: 'F150' })}${B('Choose another file', { sm: true, does: 'Opens the file picker for a different image', f: 'F150' })}${B('Dismiss', { sm: true, cls: 'plain', does: 'Hides this message; the file stays in the list below until you remove it', f: 'F150' })}</div>`;
  const cvRej = cv(`${fr(R.r3.id, R.r3.src, meta(R.r3), 28, 64, 340, 214, shotA(214), '', refLab)}
${fr(R.r4.id, R.r4.src, meta(R.r4), 396, 64, 340, 214, shotB(214), '', refLab)}
${fr('', 'payroll-export.png', 'not added', 28, 322, 340, 150, `<div class="tk-e">${ic('alert', 20, 1.5)}Not added: over the size limit</div>`, 'draft')}`, '2 references · 1 refused');
  const vRej = win28(chat(ctx3.slice(0, 2), ctxFoot, ai('2 of 4 images were added. payroll-export.png is over the size limit and status-board.png stopped at 48 percent.') + sugg(['Retry status-board.png', 'Draw alert ideas from the 2 references'])),
    main28(cvRej, { banner: refusal, pan: { n: 2, count: { h: 'This import', s: '2 added · 2 need you' }, files: fileRow({ name: R.r3.src, sub: R.r3.size, rt: rtDone }) + fileRow({ name: R.r4.src, sub: R.r4.size, rt: rtDone }) + fileRow({ name: 'payroll-export.png', sub: '14.2 MB · over the limit', rt: rtRetry('payroll-export.png'), cls: 'bad' }) + fileRow({ name: R.r5.src, sub: '520 KB · stopped at 48%', rt: rtRetry(R.r5.src), cls: 'bad' }) }, status: '2 need your attention' }));

  // 5 personal data found
  const em = (n, t) => `<span class="int-em"><i>${n}</i>${t}</span>`;
  const PII = S.INTAKE_PII;
  const shot = `<div class="int-shot"><div class="bar"><i></i>Weekly tracker<span>Week 47</span></div>
<div class="tb h"><span>Package</span><span>Owner</span><span>Status</span></div>
${PII.map(([n, e, pk], i) => `<div class="tb"><span>${pk}</span><span>${i < 3 ? em(i + 1, e) : 'Unassigned'}</span><span>${i === 2 ? 'Over' : 'On track'}</span></div>`).join('')}
<div class="int-sbar">4 packages · updated 12:20</div></div>`;
  const piiBanner = `<div class="sp-banner warn isnew" role="alert" data-feature="F151">${NT}<span class="ib">${ic('alert', 16)}</span><p><b>3 email addresses found in ${R.r4.id}.</b> Spekin will not use this image until you blur them or remove it.</p>${B('Blur all 3', { sm: true, cls: 'ink', icon: 'blur', does: 'Blurs the 3 regions in a copy the model reads; the original stays private until it is purged', f: 'F151' })}${B('Review each', { sm: true, does: 'Steps through the 3 findings so you can blur or keep each region', f: 'F151' })}${B('Remove image', { sm: true, cls: 'plain', does: 'Removes this reference and its original from the project after you confirm', f: 'F151' })}</div>`;
  const popover = `<div class="int-pop isnew" data-feature="F151" style="left:480px;top:92px">${NT}<div class="k">${ic('alert', 14)}Personal data in ${R.r4.id}</div><p>Email addresses in the Owner column. Blurred regions cannot be read by the model or in exports.</p><ul>${[1, 2, 3].map((n) => `<li><i>${n}</i>Owner column, row P-0${n}<span>email</span></li>`).join('')}</ul></div>`;
  const cvPii = cv(`${job(`Style job waits for ${R.r4.id}`, true)}
${fr(R.r4.id, R.r4.src, meta(R.r4), 28, 64, 430, 250, shot, 'sel', pill(['warn', 'Held']))}
${popover}
${fr(R.r3.id, R.r3.src, meta(R.r3), 480, 330, 226, 150, shotA(150), '', refLab)}`, '2 references · 1 held');
  const vPii = win28(chat(ctx3.slice(0, 1), ctxFoot, ai('REF-04 shows email addresses, so I have not read it. Blur them or remove the image, and I will carry on with the style.') + sugg(['Blur all 3', 'Use only REF-03 for now'])),
    main28(cvPii, { banner: piiBanner, pan: { n: 2, count: { h: 'This import', s: '1 added · 1 held' }, files: fileRow({ name: R.r3.src, sub: `${R.r3.size} · checked, nothing found`, rt: rtDone }) + fileRow({ name: R.r4.src, sub: '860 KB · 3 emails found', rt: pill(['warn', 'Held']), cls: 'warn' }) }, status: '1 image held' }));

  // 6 pasted screenshot
  const R6 = S.INTAKE_REFS.r6;
  const pastedBar = `<div class="int-pbar isnew" data-feature="F152" style="left:176px;top:456px">${NT}<div class="int-fi">${R6.src}<i class="int-caret"></i></div><div class="r"><span class="int-hint">${R6.kind} · ${R6.size} · ${R6.dim}</span><span class="sp-fill"></span>${B('Discard', { sm: true, cls: 'plain', kbd: 'esc', does: 'Drops the pasted image; nothing was uploaded', f: 'F152' })}${B('Add to board', { sm: true, cls: 'ink', kbd: '↵', does: 'Uploads the pasted image and places it as a reference frame on the board', f: 'F152' })}</div></div>`;
  const cvPaste = cv(`<div class="int-toast">${ic('clipboard', 14)}Pasted from the clipboard. Preview only; nothing is uploaded yet.</div>
${fr(R.r3.id, R.r3.src, meta(R.r3), 28, 64, 226, 150, shotA(150), '', refLab)}
${fr(R.r4.id, R.r4.src, meta(R.r4), 270, 64, 226, 150, shotB(150), '', refLab)}
${fr(R6.id, R6.src, meta(R6), 176, 250, 380, 170, shotC(170), 'int-ghost', pill(['acc', 'Not added yet']))}
${pastedBar}`, '2 references · 1 pasted preview');
  const vPaste = win28(chat(ctx3.slice(0, 2), ctxFoot, ai('Pasted image ready. Check the preview, give it a name if you like, then add it to the board.') + sugg(['Add to board', 'Discard it'])),
    main28(cvPaste, { pan: { n: 2, count: { h: 'This import', s: '1 pasted' }, files: fileRow({ name: R6.src, sub: `${R6.size} · not uploaded`, rt: pill(['acc', 'Ready']) + IB('x', 'Discard pasted image', { does: 'Drops the pasted image; nothing was uploaded', f: 'F152' }) }) }, status: 'Preview before upload' }));

  // ================================================================ notes (navy callouts sit on empty board space and never cover a control)
  const N = {
    h1: note('<b>Type 20 or more characters</b>: Start turns on. Below 20 it stays off and says how many are missing. Nothing is created yet.', 'left:1222px;top:196px;max-width:198px'),
    h2: note('<b>Pick a chip</b>: the starting point is set before the project exists. Reference screenshots opens the Design import (S28).', 'left:1222px;top:330px;max-width:198px'),
    h3: note('<b>Click a recent card</b>: the project opens where you left it, with its stage, tab, zoom and selection.', 'left:352px;top:792px;max-width:330px'),
    h4: note('<b>Press ⌘K</b> (Ctrl+K on Windows) on any page: the switch palette opens over what you are doing.', 'left:716px;top:792px;max-width:330px'),
    a1: note('<b>Resize the window</b>: columns reflow and never drop below 220 px. Thumbnails keep the 273:140 ratio. At this width: 4 columns.', 'left:252px;top:742px;max-width:300px'),
    a2: note('<b>Hover a card</b>: the corner menu offers Open, Rename, Archive and Delete. Viewers get Open only. The 8 marks read like the stage header.', 'left:576px;top:742px;max-width:330px'),
    a3: note('<b>Click a tab</b>: the grid filters in place. Search and sort keep their values when you switch tabs.', 'left:930px;top:742px;max-width:290px'),
    p1: note('<b>Type</b>: the list filters by name or increment as you type. Order stays last opened, newest first. No match offers “New project…”.', 'left:1058px;top:150px;max-width:300px'),
    p2: note('<b>Enter</b> saves a rename, <b>Esc</b> puts the old name back. An empty name is refused and the field stays open.', 'left:1058px;top:300px;max-width:300px'),
    p3: note('<b>Hold ⌘ or Ctrl</b>: the numbers 1 to 7 show on the rows; press one to open that project. The number is not remembered.', 'left:1058px;top:430px;max-width:300px'),
    c1: note('<b>Fewer than 20 characters</b> in the idea: Create stays off and the counter says how many are missing.', 'left:1050px;top:150px;max-width:300px'),
    c2: note('<b>Pick a domain</b>: it chooses the question bank and the specialist pack. Screenshots and existing specs are added later, inside the project (S28).', 'left:1050px;top:290px;max-width:300px'),
    c3: note('<b>Bahasa Indonesia is the default.</b> This review is drawn in English. One click switches; what you typed is kept.', 'left:1050px;top:430px;max-width:300px'),
    f1: note('<b>No project yet</b>: the top bar shows no project, increment or spec revision, and the meter reads 0. Nothing is invented.', 'left:236px;top:660px;max-width:300px'),
    f2: note('<b>Connect a local agent</b> is shown, off and tagged LATER. It cannot be focused into a half-working state.', 'left:560px;top:660px;max-width:300px'),
    f3: note('<b>Click a card</b>: the Create dialog opens with that start already chosen. Open sample is read only.', 'left:884px;top:660px;max-width:300px'),
    r1: note('<b>Restore</b>: brings the project back with every revision and its stage marks; it returns to its place in the list. Nothing is merged or rewritten.', 'left:252px;top:742px;max-width:330px'),
    r2: note('<b>Dismiss</b> hides the banner only. The project stays under Recently deleted for 30 days (proposed, to be confirmed).', 'left:606px;top:742px;max-width:310px'),
    r3: note('<b>Open a link to a deleted project</b>: you land on this prompt, not on a blank error page.', 'left:940px;top:742px;max-width:290px'),
    e1: note('<b>Drag files over the board</b>: the whole board lights up as the drop target. Dropping on the chat or the panel does nothing.', 'left:600px;top:216px;max-width:290px'),
    e2: note('<b>Press ⌘V</b> (Ctrl+V) with the board focused: a preview opens first. Nothing uploads until you click Add.', 'left:360px;top:760px;max-width:320px'),
    e3: note('<b>Tab to a LATER card</b>: it is skipped, because it is disabled. Hover says what is missing.', 'left:716px;top:770px;max-width:300px'),
    d1: note('<b>Drag 3 files in</b>: the target gets an accent edge. Each file shows its real progress; Cancel on one file sends no job for it.', 'left:700px;top:212px;max-width:300px'),
    d2: note('<b>Frames land in order</b>: each seat fills as its file finishes, and the board pans to it in 250 ms.', 'left:360px;top:620px;max-width:300px'),
    d3: note('<b>Wrong type or too large</b>: refused before any upload starts, with the reason (see Rejected file).', 'left:716px;top:620px;max-width:300px'),
    i1: note('<b>Frames are titled by source</b>: ID, file name, kind and size. Click one to select it; Alt+click opens the original.', 'left:360px;top:760px;max-width:320px'),
    i2: note('<b>Style job</b>: runs in the background with a real estimate. Cancel keeps the references and charges only the finished part.', 'left:716px;top:760px;max-width:330px'),
    x1: note('<b>Retry</b> reads the file again once. Images already added are kept, and a finished upload is never added twice.', 'left:360px;top:790px;max-width:310px'),
    x2: note('<b>Refused before upload</b>: the band names the file and the reason, and stays until you act or dismiss it.', 'left:716px;top:790px;max-width:310px'),
    s1: note('<b>Held, not lost</b>: the image stays on the board but no model reads it until you decide. Blur works on a copy.', 'left:360px;top:640px;max-width:320px'),
    s2: note('<b>Blur all 3</b>: the style job resumes at once. <b>Remove image</b> asks first, then deletes the original too.', 'left:360px;top:740px;max-width:330px'),
    t1: note('<b>Esc</b> discards, <b>Enter</b> adds. Closing the tab with a pending preview asks before it drops anything.', 'left:360px;top:800px;max-width:330px'),
    t2: note('<b>Paste with nothing selected</b> places the preview at the centre of the view; with a frame selected it lands beside it.', 'left:716px;top:800px;max-width:330px'),
  };

  const vHome = win27('home', homeMain) + N.h1 + N.h2 + N.h3 + N.h4;
  const vAll = win27('projects', allMain()) + N.a1 + N.a2 + N.a3;
  const vSwitch = win27('projects', allMain()) + scrim + palette + N.p1 + N.p2 + N.p3;
  const vCreate = win27('projects', allMain()) + scrim + createModal + N.c1 + N.c2 + N.c3;
  const vFirst = win27('home', firstMain, { rail: { empty: true }, top: { crumb: 'Welcome', resume: false, meter: meter0, bare: true } }) + N.f1 + N.f2 + N.f3;
  const vRestore = win27('projects', allMain({ banner: restoreBanner, gone: 'kenari-fleet' }), { rail: { deleted: true } }) + N.r1 + N.r2 + N.r3;

  const v28empty = vEmpty + N.e1 + N.e2 + N.e3;
  const v28drop = vDrop + N.d1 + N.d2 + N.d3;
  const v28imp = vImp + N.i1 + N.i2;
  const v28rej = vRej + N.x1 + N.x2;
  const v28pii = vPii + N.s1 + N.s2;
  const v28paste = vPaste + N.t1 + N.t2;

  const od = '<code>e033aad</code>';
  return [
    {
      file: 'S27-projects', code: 'S27', tier: 'START', name: 'Projects home: home, all projects, switcher, create',
      ext: 'New (BW-01). Spekin has no built screen yet. OpenDesign Home and All projects are the base (Apache-2.0, patterns only), Onlook ProjectGrid sets the grid, Paraframe’s board switcher gives the palette behaviour (own wording). Opening a project loads S35.',
      lives: 'Spekin web app · /projects (Projects) and / (Home); a project opens at /p/meranti-yard/design. Outside a project there is no stage header.',
      views: [
        { id: 'home', label: 'Home', html: vHome, entry: 'Open Spekin > Home in the rail.', data: 'sample/parts/intake.mjs → INTAKE_COMPOSER, INTAKE_PROJECTS (first four).' },
        { id: 'all', label: 'All projects', html: vAll, entry: 'Home > Projects in the rail (or View all).', data: 'sample/parts/intake.mjs → INTAKE_PROJECTS.' },
        { id: 'switch', label: 'Switch project', html: vSwitch, entry: 'Projects > press Cmd or Ctrl+K > arrow to a row > press F2.', data: 'sample/parts/intake.mjs → INTAKE_SWITCH_ORDER, INTAKE_PROJECTS.' },
        { id: 'create', label: 'Create project', html: vCreate, entry: 'Projects > New project.', data: 'sample/parts/intake.mjs → INTAKE_NEW.' },
        { id: 'first', label: 'First run', html: vFirst, entry: 'Sign in for the first time > Home with an empty project list.', data: 'sample/parts/intake.mjs → INTAKE_PROJECTS (empty list); sample/meranti-yard.mjs → USAGE cap.' },
        { id: 'restore', label: 'Restore', html: vRestore, entry: 'Projects, after another session deletes Kenari Fleet > the restore banner.', data: 'sample/parts/intake.mjs → INTAKE_DELETED, INTAKE_PROJECTS.' },
      ],
      side: {
        must: [
          'Home is one composer and the way back in: describe what you want to build, pick a start, or reopen a recent project. Nothing is created before Start.',
          'Start stays off until the idea has 20 characters and a name can be made; the counter says how many are missing (R-ONB-2).',
          'All projects is a fluid grid: 220 px column floor, thumbnail 273:140. Each card shows thumbnail, product, increment, 8 stage marks with a count, last opened and owner.',
          'The stage marks use the same five tones as the stage header, and every mark has a text label for screen readers.',
          'Cmd or Ctrl+K switches project from anywhere: type to filter, ordered by last opened, rename in place with Enter and Esc.',
          'Create asks only for a name, the idea, the UI language and where to start. Language default is Bahasa Indonesia; the spec follows the idea’s language.',
          'First run shows three start cards and nothing invented. Connect a local agent is visible but off, tagged LATER.',
          'A project deleted in another session shows a restore banner, not a blank error or a silent disappearance.',
        ],
        motion: [
          ['Card arrival', 'Thumbnails fade in 220 ms, 40 ms apart, ease cubic-bezier(0.23,1,0.32,1). The grid never jumps when a thumbnail loads (fixed 273:140 box).'],
          ['Palette', 'Opens with a 160 ms fade and 0.98 to 1 scale, spring-ui. Typing filters at once; rows do not animate while you type.'],
          ['Rename', 'The field swaps in place in 120 ms. Esc restores the old text in the same frame.'],
          ['Start button', 'Fades on at 20 characters in 140 ms; the counter colour changes with it, not the colour alone.'],
          ['Restore', 'The banner slides down 200 ms spring-panel. The card returns to its place in the list in 220 ms.'],
          ['Reduce Motion', 'All fades and slides are instant. Counts, marks and status text are unchanged and still announced.'],
        ],
        stories: [
          ['F121', 'new', 'Navigation rail: Home, Projects, Usage, Settings, recent projects by last opened, collapse. Usage opens S36 (R-WS-1, R-MOD-10).', 'OpenDesign'],
          ['F122', 'new', 'Hero composer “Describe what you want to build”: idea text, idea language, model source with estimate, Start from 20 characters (R-ONB-1, R-ONB-2, R-MOD-3).', 'OpenDesign'],
          ['F123', 'new', 'Starting chips: an idea, reference screenshots, an existing spec. Screenshots lead to the Design import (BW-01, R-ONB-1, R-WS-2).', 'OpenDesign'],
          ['F124', 'new', 'Recent projects strip, newest first; a click restores stage, tab, zoom and selection (BW-01, R-WF-11).', 'OpenDesign'],
          ['F125', 'new', 'All projects fluid grid: 220 px floor, thumbnail ratio 273:140, cards or list (BW-01).', 'Onlook'],
          ['F126', 'new', 'Project card: thumbnail, name, product, increment, 8 stage marks with count, last opened, owner (R-WF-1, R-WF-6).', 'Onlook'],
          ['F127', 'new', 'Filters and order: Recently opened, Mine, Shared with me, Archived; filter box and sort; owner and viewer roles shown (R-SEC-1).', 'Onlook'],
          ['F128', 'new', 'Switch palette on Cmd or Ctrl+K: type to filter, ordered by last opened, numbers while Cmd or Ctrl is held, New project pinned at the bottom (BW-01).', 'Paraframe'],
          ['F129', 'new', 'Inline rename: Enter saves, Esc cancels, an empty name is refused, the link keeps working (BW-01).', 'Paraframe'],
          ['F130', 'new', 'Create project: four domain choices and one idea box (20 to 4,000 characters); no name or language step, the name comes from the pitch; creating costs nothing (R-ONB-1, R-ONB-2; review REV-03).', 'OpenDesign'],
          ['F131', 'new', 'UI language EN and ID: default Bahasa Indonesia, typed text and interview state kept on switch, spec in the idea’s language (R-ONB-8, R-LANG-1, R-LANG-2).', 'PRD'],
          ['F132', 'new', 'First run: three start cards, empty rail, top bar without a project, meter at 0 (BW-01, R-ONB-1).', 'OpenDesign'],
          ['F133', 'new', 'Look-around option: open the Meranti Yard sample read only; nothing you do is saved (BW-01).', 'PRD'],
          ['F134', 'new', 'Restore: banner when another session deletes a project, Recently deleted list, a link to a deleted project lands on the prompt (R-SEC-6, R-CAN-6).', 'Paraframe'],
          ['F135', 'new', 'Card menu: Open, Rename, Archive, Delete for owners; Open only for viewers (R-SEC-1).', 'Onlook'],
          ['F139', 'new', 'Top bar outside a project: Resume chip, switcher hint, save state, usage meter, inbox, language. Shared with S35 (F103 to F115).', 'PRD'],
        ],
        where: '<span><b>Route:</b> <code>/</code> (Home) and <code>/projects</code>; a project is <code>/p/:project/:stage</code>. Back and Forward never start a paid job (R-WF-11).</span><span><b>UI (TS/React):</b> OpenDesign (Apache-2.0, commit ' + od + '): <code>HomeHero</code>, <code>RecentProjectsStrip</code>, <code>EntryNavRail</code>, <code>NewProjectModal</code>, <code>EntryBlankState</code>. Onlook (Apache-2.0): <code>ProjectGrid</code>, <code>gridTrack</code>, <code>ArchiveDisclosure</code>. Reusing their code needs a NOTICE entry. The palette copies Paraframe’s behaviour only, with our own wording; Momo’s layout idea only.</span><span><b>Core (Rust):</b> project list, last opened, roles, delete and restore, stage status per project (R-ARC-1, R-SEC-1).</span><span><b>Open for Enrico:</b> how long a deleted project stays restorable (30 days drawn) · whether “An existing spec” is in the first release · Home or Projects as the landing page.</span>',
      },
      refs: {
        note: 'OpenDesign and Onlook (Apache-2.0) are pattern references. Paraframe is proprietary and Momo has no licence: behaviour and layout ideas only, no wording, names or assets.',
        shots: [
          { img: 'od-home.png', cap: '<b>OpenDesign Home.</b> One hero line, one composer, starting chips below. Spekin keeps the single composer and swaps the chips for ways to start.' },
          { img: 'od-home-workspace.png', cap: '<b>OpenDesign Home with the rail.</b> Home, All projects and Recent projects in a left rail. Spekin’s rail adds Usage and Recently deleted.' },
          { img: 'od-all-projects.png', cap: '<b>OpenDesign All projects.</b> Tabs, thumbnail cards with owner and age. Spekin adds the increment and the 8 stage marks.' },
          { img: 'od-entry-view.png', cap: '<b>OpenDesign entry view.</b> A new-project panel beside the project list. Spekin’s Create dialog follows the same fields-then-create flow.' },
          { img: 'momo-explore.png', cap: '<b>Momo (pattern only, no licence).</b> Several views and a session list on one home page. Spekin takes the layout idea, not the code.' },
          { img: 'onlook-canvas.png', cap: '<b>Onlook (Apache-2.0).</b> Its ProjectGrid sets the 273:140 thumbnail and the 220 px column floor; this shot shows the canvas a card opens into.' },
        ],
      },
    },
    {
      file: 'S28-reference-intake', code: 'S28', tier: 'START', name: 'Reference intake: drop, pick, paste screenshots',
      ext: 'New (BW-02). Sits inside the S35 shell at the Design stage. Import first: drop, choose or paste PNG, JPEG or WebP. Capture from a live page and MCP connect are LATER. Feeds S29 (frames) and S30 (style review).',
      lives: 'Spekin web app · /p/meranti-yard/design (board in the query; never file names or image data). Reached from Create project, First run, the + tab, or Add references.',
      views: [
        { id: 'empty', label: 'Empty board', html: v28empty, entry: 'Projects > Meranti Yard > Design > open tab + > Alert ideas (new board).', data: 'sample/parts/intake.mjs → INTAKE_LIMITS.' },
        { id: 'drop', label: 'Dropping files', html: v28drop, entry: 'Design > Alert ideas > drag 3 files from the desktop over the board.', data: 'sample/parts/intake.mjs → INTAKE_REFS (r3, r4, r5), INTAKE_LIMITS.' },
        { id: 'imported', label: 'Imported', html: v28imp, entry: 'Design > Alert ideas > drop 3 files > wait for the last one.', data: 'sample/parts/intake.mjs → INTAKE_REFS (r3, r4, r5).' },
        { id: 'rejected', label: 'Rejected file', html: v28rej, entry: 'Design > Alert ideas > drop payroll-export.png (14.2 MB) with 3 other files.', data: 'sample/parts/intake.mjs → INTAKE_LIMITS, INTAKE_REFS.' },
        { id: 'pii', label: 'Personal data found', html: v28pii, entry: 'Design > Alert ideas > drop tracker-weekly.webp > Held banner appears.', data: 'sample/parts/intake.mjs → INTAKE_PII, INTAKE_REFS (r4).' },
        { id: 'pasted', label: 'Pasted screenshot', html: v28paste, entry: 'Design > Alert ideas > click the board > press Cmd or Ctrl+V.', data: 'sample/parts/intake.mjs → INTAKE_REFS (r6).' },
      ],
      side: {
        must: [
          'Import comes first: a drop zone, a file picker that works with the keyboard, and paste with Cmd or Ctrl+V. Nothing is read without a choice the user made (R-WS-2).',
          'The accepted types and the size limit are always visible: PNG, JPEG, WebP, 10 MB each, 30 per reference (limits are assumptions until the owner sets them).',
          'A consent line and a personal-data line sit in the panel, not in a dialog: the user may use these images, they stay private, and they go only to providers whose terms forbid training; Spekin checks provider terms, it does not promise it (R-REF-16, R-SEC-4).',
          'Every file has its own status: waiting, uploading with a real percentage, added, refused or stopped. Cancel on one file sends no job for it.',
          'A refused file gets a band with the reason and Retry. Images already added are kept, and a retry never adds the same image twice.',
          'Emails, card numbers and passwords found in an image hold it: blur a copy before any model reads it, or remove the image (R-REF-7).',
          'Reference frames are titled by source (ID, file name, kind, size) and the style job shows a real estimate before and while it runs.',
          'Capture from a live page and MCP connect are shown as LATER and cannot be used.',
        ],
        motion: [
          ['Drop target', 'Lights up with an accent edge in 120 ms and clears in 160 ms when the pointer leaves. No layout shift.'],
          ['Progress', 'Bars move with real bytes sent; no spinner without a value. A finished file turns to Added with a 140 ms text swap.'],
          ['New frame', 'The board pans to the new frame in 250 ms; the frame rises 8 px and fades in 0.24 s, 40 ms after the one before it.'],
          ['Refusal band', 'Slides down 200 ms spring-panel and stays until the user acts. Retry replaces the band with a progress row in place.'],
          ['Paste preview', 'The ghost frame fades in 160 ms at the drop seat; Add moves it to a real frame without a jump.'],
          ['Reduce Motion', 'Panning and fades are instant. Progress still updates and every status change is announced.'],
        ],
        stories: [
          ['F141', 'new', 'Empty board start cards: drop screenshots, paste, and two LATER options. Wording follows the UI language; file names stay as they are (R-WS-2, R-LANG-1, FR-02, FR-03).', 'Paraframe'],
          ['F142', 'new', 'Reference panel: accepted types, size limit, per-import cap, queue, and the retention line; originals purged after purge_at (R-WS-2, R-REF-17, FR-10).', 'OpenDesign'],
          ['F143', 'new', 'File picker: Choose files, reachable by Tab and Enter, no read before the choice (R-WS-2, FR-02).', 'OpenDesign'],
          ['F144', 'new', 'Drop zone: the board lights up, per-file progress, Cancel on one file sends no job (R-WS-2, FR-02).', 'Onlook'],
          ['F145', 'new', 'Paste on the board with Cmd or Ctrl+V: the image arrives as a preview, never straight to a run (R-WS-2, FR-03).', 'Paraframe'],
          ['F146', 'new', 'Consent line: the user may use the image, it stays private, sent only to providers whose terms forbid training (R-REF-16, R-SEC-4, R-WS-2; review REV-11).', 'PRD'],
          ['F147', 'new', 'Reference frames titled by source on the board: ID, file name, kind, size (R-WS-1, FR-11).', 'Onlook'],
          ['F148', 'new', 'Per-file status and Retry: finished uploads are kept, a retry never duplicates (R-WS-2, R-SEC-6).', 'PRD'],
          ['F149', 'new', 'Learning style job chip with estimate and Cancel; it waits when an image is held (R-MOD-3, R-SEC-6).', 'Momo'],
          ['F150', 'new', 'Refusal band: names the file and the reason, offers Retry and Choose another (R-SEC-6).', 'Onlook'],
          ['F151', 'new', 'Personal data found: emails detected, blur a copy or remove; the model does not read the image until then (R-REF-7).', 'PRD'],
          ['F152', 'new', 'Pasted screenshot preview with a name field; Add or Discard, nothing uploaded before Add (R-WS-2, FR-03).', 'Paraframe'],
          ['F153', 'new', 'Capture from a live page: shown, disabled, tagged LATER (FR-04 to FR-09).', 'Paraframe'],
          ['F154', 'new', 'Send frames from an editor over MCP: shown, disabled, tagged LATER (FR-47).', 'Paraframe'],
          ['F155', 'new', 'Context list names the reference IDs and revisions of the next run; no silent send of the whole board (R-GUI-5, R-GUI-11).', 'PRD'],
        ],
        where: '<span><b>Route:</b> <code>/p/:project/design</code>, board in the query. Paste works only while the board has focus (R-WS-2).</span><span><b>UI (TS/React):</b> Onlook (Apache-2.0): <code>canvas/image/ingest.ts</code>, <code>dropSeat.ts</code>, <code>aspect.ts</code> (copyable), <code>RefusalBand.tsx</code>. OpenDesign (Apache-2.0, commit ' + od + '): <code>ProjectReferenceModal</code>, composer attachment and paste. Code reuse needs a NOTICE entry. Momo: only the idea of a skeleton while data arrives. Paraframe: behaviour only.</span><span><b>Core (Rust):</b> type sniffing, size limit, content hash for no-duplicate retry, personal-data detection and blur, consent record, purge_at (R-REF-7, R-REF-17).</span><span><b>Open for Enrico:</b> size limit (10 MB drawn) and the 30 per reference cap are assumptions · retention default 30 days (Q-06) · whether personal-data detection runs on the device or on the server.</span>',
      },
      refs: {
        note: 'Onlook and OpenDesign (Apache-2.0) are pattern references. Paraframe has no screenshots here: its capture-or-drop start screen is described in the stories. Momo has no licence.',
        shots: [
          { img: 'onlook-canvas.png', cap: '<b>Onlook (Apache-2.0).</b> Images become frames on a canvas through ingest and drop seats. Spekin titles each frame by source.' },
          { img: 'od-design-canvas.png', cap: '<b>OpenDesign canvas.</b> An import entry in the bottom tool bar and Ask on select. Spekin adds the panel with limits and status.' },
          { img: 'od-todo-progress.png', cap: '<b>OpenDesign chat.</b> Status cards with checklist steps. Spekin’s style job card follows this.' },
        ],
      },
    },
  ];
}
