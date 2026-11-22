// S36 Models and usage and T01 Tablet and phone. Owner: this file only (models group). All stories are NEW: Spekin has no built screen yet.
// Window chrome on S36 (top bar, stage header, tabs) is drawn static here: S35 owns those controls and their feature IDs.
export const tier = 'Models, usage and devices';
export const order = 6;

export function boards(K) {
  const { S, ic, btn, pill, note, NT, LT, mini } = K;
  const fmt = (n) => n.toLocaleString('en-US');
  const U = S.MODELS_USAGE, PER = S.MODELS_PERIOD, RUN = S.MODELS_RUN;

  // icons that kit.mjs does not have (Lucide style, 24 px)
  const MP = {
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    plug: '<path d="M12 22v-5"/><path d="M9 8V2M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1"/>',
    back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowU: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    arrowD: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.75 1.5-1.5 0-.4-.15-.74-.39-1.04-.23-.29-.38-.65-.38-1.04 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.48-9-10-9Z"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  };
  const mic = (n, s = 16, sw = 1.75) => (MP[n] ? '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + MP[n] + '</svg>' : ic(n, s, sw));
  let plain = false; // true while the left column cards are built: the whole column carries one NEW outline instead of one per card
  const wrapNew = (f, inner, cls = '') => (plain ? '<div class="' + cls + '">' + inner + '</div>' : '<div class="isnew mod-r ' + cls + '" data-feature="' + f + '">' + NT + inner + '</div>');

  // ---------------------------------------------------------------- S36 window chrome (static)
  const committed = (u) => u.used + u.reserved + u.pending;
  const pct = (u) => Math.round((committed(u) / u.cap) * 100);
  const sevCls = (u) => (u.sev === 'warn' ? ' mod-warn' : u.sev === 'crit' ? ' mod-crit' : '');
  const meter = (u) => '<span class="isnew mod-r" data-feature="F290">' + NT + '<button type="button" class="sp-meter mod-on' + sevCls(u) + '" aria-pressed="true" data-does="Opens the usage view of this project: used, reserved, pending and the cap. This view is open now" data-feature="F290">Hosted<i><u style="width:' + Math.min(100, pct(u)) + '%"></u></i><b>' + fmt(u.used) + '</b>of ' + fmt(u.cap) + ' cr</button></span>';
  const topBar = (u) => '<header class="sp-top"><span class="sp-mark" aria-hidden="true">S</span>' +
    '<span class="sp-proj"><b>' + S.PROJECT.name + '</b><span>/</span><span>' + S.PROJECT.product + '</span>' + ic('chev', 14) + '</span><span class="sp-sep"></span>' +
    '<span class="sp-chip"><span class="k">Increment</span>' + S.PROJECT.increment + ic('chev', 12) + '</span>' +
    '<span class="sp-chip">' + ic('lock', 12) + '<span class="k">Spec</span><span class="r">' + S.PROJECT.spec + '</span>accepted</span>' +
    '<span class="sp-fill"></span><span class="sp-save"><span class="dot ok"></span>Saved 12:41</span>' + meter(u) +
    '<span class="sp-ibtn" role="img" aria-label="Agent inbox: 2 jobs need approval">' + ic('inbox') + '<span class="badge">2</span></span>' +
    '<span class="sp-chip">EN</span><span class="sp-av" aria-label="' + S.PROJECT.user + '">' + S.PROJECT.initials + '</span></header>';
  const stageBar = '<nav class="sp-stagebar" aria-label="Workflow stages"><div class="sp-stl">' + S.STAGES.map((s) => '<div class="sp-stage"' + (s.id === 'design' ? ' aria-current="page"' : '') + '><span class="nm"><i>' + s.n + '</i>' + s.name + '</span><span class="ss"><span class="dot ' + s.st + '"></span>' + s.text + '</span></div>').join('') + '</div><span class="sp-btn ghost">' + ic('flag', 14) + 'Readiness</span></nav>';
  const tabsBar = '<div class="sp-tabs" role="tablist" aria-label="Open artifacts">' + [['grid', 'Variance flows'], ['frame', 'F-03 Variance table'], ['frame', 'F-04 Alert drawer']].map(([i, n]) => '<span class="sp-tab" role="tab" aria-selected="false">' + ic(i, 14) + n + '<span class="x">' + ic('x', 11) + '</span></span>').join('') + '<span class="sp-tab" role="tab" aria-selected="true">' + mic('sliders', 14) + 'Models and usage<span class="x">' + ic('x', 11) + '</span></span><span class="sp-fill"></span><span class="sp-btn ink">' + ic('download', 14) + 'Hand off</span></div>';

  // ---------------------------------------------------------------- chat panel with the S36 composer
  const CI = { frame: 'frame', doc: 'doc', req: 'req', image: 'image' };
  const ctxChips = S.CTX_DESIGN.map(([k, n, r]) => '<span class="sp-cchip">' + ic(CI[k] || 'doc', 12) + n + '<span class="r">' + r + '</span></span>').join('');
  const runCard = '<div class="mod-run isnew mod-r" data-feature="F288">' + NT + '<div class="rh">' + mic('clock', 14) + 'Run 0426' + pill(['ok', 'Settled']) + '</div><div class="rg"><div>Estimate<b>18–30</b></div><div>Reserved<b>36</b></div><div>Charged<b>24</b></div><div>Refunded<b>12</b></div></div><div class="ft"><span class="s">credits · Sonnet 5.5 · 34 s</span>' + btn('Ledger', { sm: true, does: 'Opens the usage ledger at run 0426: its reserve, settle and refund entries', f: 'F289' }) + '</div></div>';
  const composer = ({ text, resv = '', est = '≈ 18–30 cr', send = true, srcTag = 'HOSTED', mdl = 'Sonnet 5.5', eff = 'High' }) => '<div class="sp-comp"><div class="ta">' + text + '</div>' + resv + '<div class="row">' +
    '<span class="isnew mod-r" data-feature="F281">' + NT + '<button type="button" class="sp-model" data-does="Opens Models: source, provider, model and effort for this chat" data-feature="F281"><span class="src">' + srcTag + '</span>' + mdl + ic('chev', 12) + '</button></span>' +
    '<button type="button" class="mod-eff" data-does="Changes the effort for this run; the estimate updates before Send" data-feature="F283">' + eff + ic('chev', 11) + '</button>' +
    '<span class="sp-est">' + est + '</span>' +
    '<button type="button" class="sp-send" aria-label="Send" ' + (send ? 'data-does="Sends with exactly the listed context after reserving the maximum estimate" data-feature="F287"' : 'disabled aria-disabled="true" data-does="Send is off: the monthly cap is reached, so no new hosted run is accepted" data-feature="F294"') + '>' + ic('up', 15, 2) + '</button></div></div>';
  const chat = (comp, extra = '') => '<aside class="sp-chat" aria-label="Conversation"><div class="sp-chat-h"><b>Design chat</b><span>· F-03 selected</span></div>' +
    '<div class="sp-ctx"><div class="t">Context for the next run<span>4 items · 9.8k tokens</span></div><div class="sp-cc">' + ctxChips + '</div><div class="f">The whole board is never sent</div></div>' +
    '<div class="sp-msgs"><div class="sp-ub">Add an alert drawer to the variance table for packages over 3%.</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 34 s · 24 cr</em></div><p>Drew <b>F-04 Alert drawer</b> as a draft. F-03 stays accepted at r6.</p>' + runCard + '</div>' + extra + '</div>' + comp + '</aside>';

  // ---------------------------------------------------------------- right column: usage meter, rate windows, top-up
  const usagePanel = (u) => {
    const w = (n) => ((n / u.cap) * 100).toFixed(2), left = Math.max(0, u.cap - committed(u));
    const sev = u.sev === 'crit' ? pill(['bad', 'Critical · 90%+']) : u.sev === 'warn' ? pill(['warn', 'Warn · 70%+']) : pill(['ok', 'Calm']);
    return wrapNew('F290', '<div class="mod-h">This month<em>' + PER.label + ' · resets ' + PER.resets + '</em></div><div class="mod-big"><b>' + fmt(u.used) + '</b><span>of ' + fmt(u.cap) + ' cr used</span>' + sev + '</div>' +
      '<div class="mod-barw"><div class="mod-bar"><i class="u" style="width:' + w(u.used) + '%"></i><i class="r" style="width:' + w(u.reserved) + '%"></i><i class="p" style="width:' + w(u.pending) + '%"></i></div><span class="mod-tk" style="left:70%"></span><span class="mod-tk" style="left:90%"></span><span class="mod-tkl" style="left:70%">70%</span><span class="mod-tkl" style="left:90%">90%</span></div>' +
      '<div class="mod-leg"><div><i class="u"></i><span>Used</span><b>' + fmt(u.used) + '</b></div><div><i class="r"></i><span>Reserved, in flight</span><b>' + u.reserved + '</b></div><div><i class="p"></i><span>Pending reconciliation</span><b>' + u.pending + '</b></div><div><i class="l"></i><span>Left under the cap</span><b>' + fmt(left) + '</b></div></div>', 'mod-card mod-sev-' + u.sev);
  };
  const winRow = (l, [a, b, r]) => { const s = Math.round((a / b) * 100), k = s >= 90 ? ' crit' : s >= 70 ? ' warn' : ''; return '<div class="mod-win' + k + '"><div class="l"><b>' + l + '</b><span>' + fmt(a) + ' of ' + fmt(b) + ' cr</span></div><div class="tr"><i style="width:' + s + '%"></i></div><small>' + s + '% · resets ' + r + '</small></div>'; };
  const winPanel = (u) => wrapNew('F290', '<div class="mod-h">Rate windows<em>Hosted · sample units</em></div>' + winRow('5 hours', u.win5) + winRow('7 days', u.win7), 'mod-card');
  const topUp = (long = false) => wrapNew('F295', '<div class="mod-h">Top up credits</div><div class="mod-qr"><span class="bx">' + mic('qr', 22) + '</span><p class="mod-p">Pay by QRIS through a payment adapter. Credits are added once, after the payment is verified. Automatic top-up stays off.' + (long ? ' Pack sizes and prices are not decided yet.' : '') + '</p></div>' + btn('Top up', { later: 'Credit top-up through a payment adapter (R-PAY-1 to R-PAY-5; owner leaning Midtrans QRIS, Xendit swappable; Q-05)' }), 'mod-card');
  const byokSide = wrapNew('F285', '<div class="mod-h">BYOK this month<em>reported by the provider</em></div><div class="mod-leg"><div><i class="l"></i><span>Runs</span><b>' + S.MODELS_KEY.usage.runs + '</b></div><div><i class="l"></i><span>Tokens in / out</span><b>' + S.MODELS_KEY.usage.tokensIn + ' / ' + S.MODELS_KEY.usage.tokensOut + '</b></div><div><i class="l"></i><span>Credits debited</span><b>0</b></div></div><p class="mod-p">Billed by ' + S.MODELS_KEY.provider + ', not by Spekin. Platform fee: none set; any fee is shown before a run.</p>', 'mod-card');

  // ---------------------------------------------------------------- page frame
  const NAV = [['Models', 'sliders', 'F281', 'Shows the model source, provider, model and effort'], ['Next run', 'up', 'F287', 'Shows the estimate, checks and reservation for the run in the composer'], ['Ledger', 'layers', 'F289', 'Shows every reserve, settle and refund entry of this project'], ['Limits', 'flag', 'F291', 'Shows caps, thresholds and what happens at each']];
  const nav = (cur) => '<div class="sp-seg" role="group" aria-label="Models and usage sections">' + NAV.map(([l, i, f, d]) => '<button type="button" aria-pressed="' + (l === cur) + '" data-does="' + d + '" data-feature="' + f + '">' + mic(i, 14) + l + '</button>').join('') + '</div>';
  const page = ({ cur, lf, banner = '', left, side }) => '<section class="sp-main" aria-label="Work area">' + tabsBar + banner + '<div class="mod-page"><div class="mod-ph"><div class="mod-ttl"><h2>Models and usage</h2><span>' + S.PROJECT.name + ' · every run in this project</span></div><span class="sp-fill"></span>' + nav(cur) + '</div><div class="mod-cols"><div class="mod-left isnew mod-r" data-feature="' + lf + '">' + NT + left + '</div><aside class="mod-side" aria-label="Usage this month">' + side + '</aside></div></div></section>';
  const appWin = (u, comp, main, extra) => '<div class="sp-app">' + topBar(u) + stageBar + '<div class="sp-body">' + chat(comp, extra) + main + '</div></div>';

  // ---------------------------------------------------------------- Models page
  plain = true;
  const sourceCards = (sel, compact) => wrapNew('F281', '<div class="mod-src" role="radiogroup" aria-label="Model source">' + S.MODELS_SOURCES.map((s) => {
    const on = s.id === sel;
    const does = { hosted: 'Uses Hosted: each run reserves Spekin credits and settles the actual cost', cli: 'Uses an agent on your computer through the Spekin Connector; its own plan bills, not Spekin credits', api: 'Uses your own provider key; opens provider setup, and the provider bills you' }[s.id];
    return '<button type="button" role="radio" aria-checked="' + on + '" class="mod-sc' + (compact ? ' compact' : '') + '" data-does="' + does + '" data-feature="F281"><span class="t"><span class="mod-rad' + (on ? ' on' : '') + '"></span>' + mic(s.icon, 16) + s.name + (s.short ? '<span class="mod-stg">' + s.short + '</span>' : '') + '</span><span class="s"><b class="bill">Bills: ' + (compact ? s.billsC : s.bills) + '</b>' + (compact ? '' : s.sub) + '</span></button>';
  }).join('') + '</div>', 'mod-bare');
  const modelsCard = wrapNew('F282', '<div class="mod-h">Provider<span class="mod-pcs" role="group" aria-label="Provider">' + S.MODELS_PROVIDERS.map(([n, c], i) => '<button type="button" class="mod-pc" aria-pressed="' + (i === 0) + '" data-does="Lists the ' + n + ' models this source can use" data-feature="F282">' + n + '<small>' + c + '</small></button>').join('') + '</span><em>Rate card rc-7 · region and retention unknown</em></div>' +
    '<div class="mod-mods" role="radiogroup" aria-label="Model">' + S.MODELS_REGISTRY.map((m) => {
      const on = m.st === 'sel', off = m.st === 'off';
      const act = off ? 'disabled aria-disabled="true" data-does="Not available on this source: ' + m.note + '" data-feature="F282"' : 'data-does="Uses ' + m.name + ' for new runs in this project; the estimate updates before Send" data-feature="F282"';
      return '<button type="button" role="radio" aria-checked="' + on + '" class="mod-mr" ' + act + '><span class="mod-rad' + (on ? ' on' : '') + '"></span><span class="nm">' + m.name + '<code>' + m.id + '</code></span><span class="cp"><i>' + m.caps.map((c) => '<span class="mod-cap">' + c + '</span>').join('') + '</i>' + (off ? '<small>' + m.note + '</small>' : '') + '</span><span class="lm">' + m.lim + '<br>' + m.rc + '</span><span class="es">' + m.est + '</span></button>';
    }).join('') + '</div>', 'mod-card');
  const effortCard = wrapNew('F283', '<div class="mod-row2"><div class="mod-col"><div class="mod-h">Effort</div><div class="mod-seg" role="group" aria-label="Effort">' + S.MODELS_EFFORT.map(([n], i) => '<button type="button" aria-pressed="' + (i === 2) + '" data-does="Sets the effort to ' + n + '; the estimate and the reserve change with it" data-feature="F283">' + n + '</button>').join('') + '</div><p class="mod-p"><b>High</b>: ≈ 1.6× tokens, slower.</p></div>' +
    '<div class="mod-col"><div class="mod-h">Model choice</div><div class="mod-seg" role="group" aria-label="Routing"><button type="button" aria-pressed="true" data-does="Uses the model you picked for every run; nothing is swapped" data-feature="F283">Fixed</button><button type="button" aria-pressed="false" data-does="Lets routing pick a model per task inside your policy" data-feature="F283">Auto</button></div><p class="mod-p">Auto never changes provider or cap without asking.</p></div></div>', 'mod-card');
  const routingCard = wrapNew('F283', '<div class="mod-h">Routing by task<em>' + btn('Edit routing', { sm: true, does: 'Edits which model each task uses; a provider change or a higher cost needs prior permission', f: 'F283' }) + '</em></div><div class="mod-tbl"><div class="mod-tr mod-hd"><span>Task</span><span>Model</span><span>Source</span><span>Note</span></div>' + S.MODELS_TASKS.map(([t, m, s, p]) => '<div class="mod-tr"><b>' + t + '</b><span>' + m + '</span><span>' + s + '</span>' + pill(p) + '</div>').join('') + '</div>', 'mod-card');
  const modelsLeft = sourceCards('hosted') + modelsCard + effortCard + routingCard;

  // ---------------------------------------------------------------- Local CLI page
  const CN = S.MODELS_CONNECTOR, AG = S.MODELS_AGENTS, AR = S.MODELS_AGENT_RUN;
  const connector = wrapNew('F293', '<div class="mod-h">Spekin Connector<em>' + pill(['ok', CN.state]) + pill(['ok', 'Paired']) + '</em></div>' +
    '<div class="mod-cn"><div><span>Version</span><b class="mod-mono">' + CN.version + '</b></div><div><span>Listens on</span><b class="mod-mono">' + CN.addr + '</b></div><div><span>Pairing</span><b>' + CN.paired + ' at ' + CN.since + '</b></div><div class="bt">' + btn('Pair again', { sm: true, later: 'Pairing ships with the later Spekin Connector adapter (C-05): it will show a new 6-digit code and stop the old pairing', f: 'F293' }) + btn('Unpair', { sm: true, cls: 'ghost mod-danger', does: 'Removes the pairing after you confirm; the Connector then refuses this browser until it is paired again', f: 'F293' }) + '</div></div>' +
    '<div class="mod-sec">' + mic('shield', 15) + '<span><b>This computer only.</b> You start the Connector once and type its code here: ' + CN.code + '. The browser talks to it on 127.0.0.1 and nowhere else.</span></div>', 'mod-card');
  const agentRow = (a) => {
    const none = a.inst === 'none', blocked = none || a.sign === 'no';
    const dot = none ? 'ring' : a.sign === 'ok' ? 'ok' : a.sign === 'no' ? 'warn' : 'half';
    const radio = '<button type="button" role="radio" aria-checked="' + !!a.pick + '" class="mod-agr"' + (blocked ? ' disabled aria-disabled="true"' : '') + ' data-does="' + (blocked ? (none ? a.name + ' is not found on this computer, so it cannot be used' : a.name + ' needs a sign-in first, so it cannot be used yet') : 'Uses ' + a.name + ' for new runs through the Connector; its own plan bills') + '" data-feature="F296"><span class="mod-rad' + (a.pick ? ' on' : '') + '"></span><span class="nm"><span>' + a.name + (a.ver ? '<code>' + a.ver + '</code>' : '') + '</span><small><span class="dot ' + dot + '"></span>' + a.sub + '</small></span></button>';
    const act = a.pick ? pill(['acc', 'In use']) : a.hint ? btn(a.hint, { sm: true, does: none ? 'Opens the install guide of ' + a.name + ' in a new tab' : 'Shows the command that signs in ' + a.name + ' in your terminal; Spekin never sees the login', f: 'F296' }) : '';
    return '<div class="mod-ag">' + radio + '<span class="ac">' + act + '</span></div>';
  };
  const agentsCard = wrapNew('F296', '<div class="mod-h">Agents on this computer<em>' + AG.filter((a) => a.inst === 'ok').length + ' of ' + AG.length + ' found' + btn('Scan again', { sm: true, does: 'Asks the Connector to look again for installed agents and their sign-in state', f: 'F296' }) + '</em></div><div class="mod-ags" role="radiogroup" aria-label="Agent">' + AG.map(agentRow).join('') + '</div>', 'mod-card');
  const segOf = (name, list, on, f, what) => '<div class="mod-seg" role="group" aria-label="' + name + '">' + list.map((n, i) => '<button type="button" aria-pressed="' + (i === on) + '" data-does="' + what.replace('%', n) + '" data-feature="' + f + '">' + n + '</button>').join('') + '</div>';
  const permOpts = '<div class="mod-pm" role="radiogroup" aria-label="Permission mode">' + AR.perms.map(([n, s], i) => '<button type="button" role="radio" aria-checked="' + (i === AR.perm) + '" class="mod-pmo" data-does="Sets the permission mode to: ' + n.toLowerCase() + '" data-feature="F297"><span class="mod-rad' + (i === AR.perm ? ' on' : '') + '"></span><span class="nm">' + n + '<small>' + s + '</small></span></button>').join('') + '</div>';
  const runSet = wrapNew('F297', '<div class="mod-h">Run settings<em>' + AR.agent + '</em></div><div class="mod-inl"><span class="lb">Model</span>' + segOf('Model', AR.models, 0, 'F297', 'Uses % for new runs; the agent lists its own models') + '<span class="lb">Effort</span>' + segOf('Effort', AR.efforts, 1, 'F297', 'Sets the agent effort to %') + '</div>' +
    '<div class="mod-col"><b class="mod-h2">Permission mode</b>' + permOpts + '</div>' +
    '<div class="mod-wc">' + mic('folder', 15) + '<span><b>Runs in a separate work copy:</b> <span class="mod-mono">' + AR.copy + '</span>. Your own checkout is never touched.</span></div>', 'mod-card');
  const cliLeft = sourceCards('cli', true) + connector + agentsCard + runSet;
  const cliSide = wrapNew('F299', '<div class="mod-h">Local CLI<em>reported by the agent</em></div><div class="mod-leg"><div><i class="l"></i><span>Runs</span><b>' + AR.usage.runs + '</b></div><div><i class="l"></i><span>Tokens in / out</span><b class="mod-nr">' + AR.usage.tokens + '</b></div><div><i class="l"></i><span>Agent plan window</span><b class="mod-nr">' + AR.usage.plan + '</b></div><div><i class="l"></i><span>Spekin credits used</span><b>none</b></div></div><p class="mod-p">Billed by the plan of your agent, not by Spekin. Where the agent reports usage it shows here; where it does not, the field says <b>not reported</b>, never 0.</p>', 'mod-card');

  // ---------------------------------------------------------------- API provider page (BYOK)
  const API = S.MODELS_API, KEY = S.MODELS_KEY, PV = API.providers[API.sel];
  const provForm = wrapNew('F285', '<div class="mod-h">API provider<em>' + pill(['mute', 'BYOK · test, then save']) + '</em></div><div class="mod-pcs" role="group" aria-label="Provider">' + API.providers.map(([n], i) => '<button type="button" class="mod-pc" aria-pressed="' + (i === API.sel) + '" data-does="Sets the provider to ' + n + '; the base URL fills in for it" data-feature="F285">' + n + '</button>').join('') + '</div>' +
    '<div class="mod-row2"><div class="mod-fld"><label>Base URL</label><div class="mod-in ro">' + mic('lock', 14) + PV[1] + '<span class="end">prefilled</span></div></div><div class="mod-fld"><label>API key</label><div class="mod-in foc">' + mic('key', 14) + 'sk-ant-••••••••••••••<span class="caret"></span><span class="end">hidden</span></div></div></div>' +
    '<p class="mod-fine">Only Custom OpenAI-compatible lets you edit the base URL. Ollama on this computer needs no key and is reached through the Connector.</p>' +
    '<div class="mod-sec">' + mic('lock', 15) + '<span><b>Write-only.</b> The key is encrypted on the server when you save it and is never shown again. Members, prompts, previews, exports and logs never see it.</span></div>' +
    '<div class="mod-foot">' + btn('Test connection', { cls: 'ghost', icon: 'check', does: 'Calls the provider with the typed key and lists what passed; nothing is saved by a test', f: 'F286' }) + btn('Save key', { cls: 'ink', icon: 'lock', does: 'Encrypts the key on the server and clears the field; the key can be revoked but never read back', f: 'F285' }) + '<span class="mod-fine">Save unlocks after the test passes.</span></div>', 'mod-card');
  const testCard = wrapNew('F286', '<div class="mod-h">Connection test<em>' + pill(['ok', 'Passed · 1 note']) + ' 12:38</em></div><div class="mod-tst">' + KEY.tests.map(([k, l, d]) => '<div class="mod-ts">' + (k === 'ok' ? '<span class="okc">' + ic('check', 15, 2.2) + '</span>' : '<span class="wnc">' + ic('alert', 15) + '</span>') + '<b>' + l + '</b><span>' + d + '</span></div>').join('') + '</div>', 'mod-card');
  const modelCard = wrapNew('F286', '<div class="mod-h">Model<em>' + API.fetchedCount + ' fetched from ' + PV[0] + '</em></div><div class="mod-in">' + mic('cpu', 14) + API.fetched[0][0] + '<span class="end">' + btn('Refresh', { sm: true, does: 'Fetches the model list from the provider again', f: 'F286' }) + '</span></div><div class="mod-pcs" role="group" aria-label="Fetched models">' + API.fetched.map(([id, n, st]) => '<button type="button" class="mod-pc" aria-pressed="' + (st === 'sel') + '" data-does="Uses ' + id + ' for new runs on this key; the estimate shows tokens" data-feature="F286">' + n + '</button>').join('') + '<button type="button" class="mod-pc" aria-pressed="false" data-does="Lets you type a model id the provider does not list; it is checked on the next test" data-feature="F286">' + ic('plus', 12) + 'Custom id</button></div><p class="mod-fine">Pick from the list or type your own id.</p>', 'mod-card');
  const apiLeft = sourceCards('api', true) + provForm + '<div class="mod-row2 mod-gap">' + testCard + modelCard + '</div>';
  const savedKey = wrapNew('F285', '<div class="mod-h">Saved key</div><div class="mod-kr2"><span class="mod-pc">' + KEY.provider + '</span><b class="mod-mono">····' + KEY.tail + '</b></div><p class="mod-p">Added by ' + KEY.by + ', ' + KEY.added + '. Tested ' + KEY.tested + '. Billed by the provider.</p><div class="mod-foot">' + btn('Test again', { sm: true, does: 'Runs the connection test again with the stored key; the key stays hidden', f: 'F286' }) + btn('Revoke', { sm: true, cls: 'ghost mod-danger', does: 'Asks to confirm, then deletes the stored key; runs that use it stop until a new key is saved', f: 'F285' }) + '</div>', 'mod-card');

  // ---------------------------------------------------------------- Next run page (estimate before Send)
  const tokTotal = RUN.ctx.reduce((a, c) => a + c[2], 0);
  const ctxBar = '<div class="mod-ctxbar">' + RUN.ctx.map((c, i) => '<i class="s' + (i + 1) + '" style="width:' + ((c[2] / tokTotal) * 100).toFixed(1) + '%"></i>').join('') + '</div><div class="mod-cl">' + RUN.ctx.map((c, i) => '<div><i class="s' + (i + 1) + '"></i><b>' + c[0] + '</b><span>' + c[1] + '</span><span>' + c[2].toFixed(1) + 'k</span></div>').join('') + '</div>';
  const scale = (n) => ((n / S.MODELS_CAPS.perRun) * 100).toFixed(1);
  const rangeBar = '<div class="mod-rng"><div class="trk"></div><div class="band" style="left:' + scale(RUN.est[0]) + '%;width:' + (scale(RUN.est[1]) - scale(RUN.est[0])).toFixed(1) + '%"></div>' +
    '<span class="lb up" style="left:' + scale(RUN.est[0]) + '%">' + RUN.est[0] + '</span><span class="lb up" style="left:' + scale(RUN.est[1]) + '%">' + RUN.est[1] + '</span>' +
    '<span class="mk" style="left:' + scale(RUN.reserve) + '%"></span><span class="lb dn" style="left:' + scale(RUN.reserve) + '%"><b>Reserve ' + RUN.reserve + '</b> · maximum</span>' +
    '<span class="mk mod-capmk" style="left:99.6%"></span><span class="lb dn" style="left:94%">cap ' + S.MODELS_CAPS.perRun + '</span></div>';
  const ticket = wrapNew('F287', '<div class="mod-h">Before you send · run ' + RUN.id + '<em>' + pill(['mute', 'Hosted']) + pill(['mute', 'Fixed model']) + '</em></div>' +
    '<div class="mod-row2"><div class="mod-col"><b class="mod-h2">' + RUN.task + ' · ' + RUN.target + '</b><p class="mod-p">' + RUN.model + ' · ' + RUN.effort + ' effort · output capped at ' + RUN.outCap + ' · rate card ' + RUN.rc + '</p><div class="mod-foot">' + btn('Change model', { sm: true, does: 'Opens Models to pick another model; the estimate recalculates', f: 'F281' }) + '</div></div>' +
    '<div class="mod-col"><b class="mod-h2">Context · ' + tokTotal.toFixed(1) + 'k of ' + RUN.limitIn + ' tokens</b>' + ctxBar + '</div></div>' +
    '<div class="mod-h">Estimate in credits<em>cost range, then the amount held</em></div>' + rangeBar +
    '<div class="mod-ckl">' + RUN.checks.map(([a, b]) => '<div class="mod-ck"><span class="okc">' + ic('check', 15, 2.2) + '</span><b>' + a + '</b><span>' + b + '</span></div>').join('') + '</div>' +
    '<div class="mod-foot">' + btn('Send and reserve ' + RUN.reserve + ' cr', { cls: 'ink', icon: 'up', does: 'Reserves 36 credits atomically, then starts the run with exactly this context', f: 'F287' }) + btn('Trim context', { does: 'Goes back to the context list in the chat to remove items; the estimate updates live', f: 'F287' }) + '<span class="mod-fine">Nothing is charged until the run ends.</span></div>', 'mod-card');
  const life = wrapNew('F288', '<div class="mod-h">What happens after Send<em>ledger: reserve, settle, refund</em></div><div class="mod-life">' +
    '<div class="mod-ls go"><span class="n"><i>1</i>Reserve</span><b class="v">−' + RUN.reserve + ' cr</b><p>Held before work starts. No second run can spend it.</p></div><span class="mod-arr">' + mic('arrowR', 16) + '</span>' +
    '<div class="mod-ls"><span class="n"><i>2</i>Settle</span><b class="v">' + RUN.expect + ' cr</b><p>The actual cost replaces the hold when the run ends.</p></div><span class="mod-arr">' + mic('arrowR', 16) + '</span>' +
    '<div class="mod-ls"><span class="n"><i>3</i>Refund</span><b class="v">+' + RUN.release + ' cr</b><p>The unused part comes back, also on cancel or failure.</p></div></div>' +
    '<p class="mod-fine">Key <span class="mod-mono">' + RUN.key + '</span>: a retry never charges twice. Hosted only; CLI and API runs bill outside Spekin credits.</p>', 'mod-card');
  const runLeft = ticket + life;

  // ---------------------------------------------------------------- Ledger page
  const L = S.MODELS_LEDGER, LD = S.MODELS_LEDGER_DETAIL;
  const KIND = { reserve: 'RESERVE', settle: 'SETTLE', refund: 'REFUND', hold: 'HOLD', byok: 'BYOK', cli: 'CLI' };
  const ledger = wrapNew('F289', '<div class="mod-tools"><div class="mod-seg" role="group" aria-label="Ledger filter">' + ['All', 'Hosted', 'CLI', 'BYOK', 'Adjustments'].map((n, i) => '<button type="button" aria-pressed="' + (i === 0) + '" data-does="Shows ' + n.toLowerCase() + ' entries only" data-feature="F289">' + n + '</button>').join('') + '</div><span class="sp-fill"></span><span class="mod-tot">Committed <b>' + fmt(committed(U.calm)) + '</b> · Pending <b>1 run</b></span></div>' +
    '<div class="mod-led"><div class="mod-lr mod-hd"><span>Time</span><span>Run</span><span>Entry</span><span>Task · model</span><span class="r">Amount</span><span class="r">Left</span><span>State</span></div>' +
    L.map((r) => '<div class="mod-lr' + (r.sel ? ' sel' : '') + '"><span class="mod-tm">' + r.t + '</span><span class="mod-id">' + r.run + '</span><span class="mod-ent ' + r.kind + '">' + KIND[r.kind] + '</span><span class="mod-tt2">' + r.task + ' <span>· ' + r.model + '</span></span><span class="mod-am ' + (r.amt.startsWith('−') ? 'neg' : r.amt.startsWith('+') ? 'pos' : r.amt === 'not reported' ? 'nr' : '') + '">' + r.amt + '</span><span class="mod-lf">' + r.left + '</span>' + pill(r.st) + '</div>').join('') + '</div>', 'mod-card');
  const detail = wrapNew('F289', '<div class="mod-h">Run ' + LD.run + ' · ' + LD.title + '<em>' + LD.key + '</em></div><div class="mod-dt"><div>Consumed<b>' + LD.consumed + '</b></div><div>Released<b>' + LD.released + '</b></div><div>Pending<b>' + LD.pending + '</b></div><div>Provider cost, charge<b>5.8, 6 cr</b></div></div>', 'mod-card');
  const ledgerLeft = ledger + detail;

  // ---------------------------------------------------------------- Limits page (near cap and cap reached)
  const capRow = (lab, sub, val, ex, ctl, cls = '') => '<div class="mod-cr ' + cls + '"><div class="lb">' + lab + '<span>' + sub + '</span></div><b class="v">' + val + '</b><div class="ex">' + ex + '</div>' + ctl + '</div>';
  const stepper = (what, v) => '<div class="mod-step" role="group" aria-label="' + what + '"><button type="button" class="sp-ibtn sm" aria-label="Lower ' + what + '" data-does="Lowers ' + what + '; applies to new reservations only" data-feature="F291">' + ic('minus', 14) + '</button><span>' + v + '</span><button type="button" class="sp-ibtn sm" aria-label="Raise ' + what + '" data-does="Raises ' + what + '; a workspace owner limit still applies" data-feature="F291">' + ic('plus', 14) + '</button></div>';
  const capsCard = (u, k) => { const p = pct(u), bar = '<div class="tr"><i style="width:' + Math.min(100, p) + '%"></i></div>' + fmt(committed(u)) + ' of ' + fmt(u.cap) + ' · ' + p + '%' + (k === 'crit' ? ' · reached' : '');
    return wrapNew('F291', '<div class="mod-h">Caps<em>Checked at reservation, not after</em></div>' +
      capRow('Per run', 'Maximum reserve', S.MODELS_CAPS.perRun + ' cr', 'A run whose reserve is above this asks first.', stepper('the per-run cap', S.MODELS_CAPS.perRun)) +
      capRow('This project', 'Monthly', fmt(u.cap) + ' cr', bar, stepper('the monthly cap', fmt(u.cap)), k) +
      capRow('Workspace', 'Monthly, all projects', fmt(PER.workspaceCap) + ' cr', fmt(PER.workspaceUsed) + ' used across 3 projects', '<span class="mod-lock">' + ic('lock', 13) + 'Owner only</span>') +
      capRow('Concurrent runs', 'Hard limit', S.MODELS_CAPS.concurrency, (u.reserved ? '1 running now, ' + u.reserved + ' cr reserved' : 'none running'), stepper('concurrent runs', S.MODELS_CAPS.concurrency)), 'mod-card'); };
  const ladder = (u) => { const p = Math.min(100, pct(u)); return wrapNew('F290', '<div class="mod-h">Severity<em>Fixed in this version: 70% and 90%</em></div><div class="mod-ladw"><span class="mod-here" style="left:' + p + '%">' + p + '%</span><div class="mod-lad"><i class="a"></i><i class="b"></i><i class="c"></i></div></div>' +
    '<div class="mod-zn"><div><b>Calm, under 70%</b>No banner. The estimate shows credits only.</div><div><b>Warn from 70%</b>Amber banner, and the cap share beside every estimate.</div><div><b>Critical from 90%</b>Red banner. A run whose reserve does not fit is refused.</div></div>', 'mod-card'); };
  const bannerCap = '<div class="sp-banner bad isnew mod-r" role="alert" data-feature="F294">' + NT + ic('alert', 16) + '<p><b>Monthly cap reached: 5,000 of 5,000 cr.</b> New Hosted runs are stopped. Local CLI and API runs are not counted against it. Your frames, specs and drafts are untouched.</p>' + btn('Use Local CLI', { sm: true, cls: 'ink', does: 'Switches this chat to Local CLI and opens the agent list; runs there do not touch the cap', f: 'F294' }) + btn('Use API key', { sm: true, does: 'Switches this chat to your API provider; runs there do not touch the cap', f: 'F294' }) + '</div>';
  const optCap = wrapNew('F294', '<div class="mod-h">What you can do now</div>' +
    '<div class="mod-opt"><div><b>Runs already started finish</b><span>1 running run settles as usual; its unused credits come back.</span></div></div>' +
    '<div class="mod-opt"><div><b>Everything except Hosted runs still works</b><span>Open, compare, accept and hand off frames. Local CLI and API runs send as usual. Nothing is deleted at the cap.</span></div></div>' +
    '<div class="mod-opt"><div><b>Ask for more room, or wait for ' + PER.resets + '</b><span>From 70% the banner asks for this earlier. The cap resets in ' + PER.days + ' days.</span></div>' + btn('Ask for a higher cap', { sm: true, does: 'Sends a request to the workspace owner to raise the monthly cap; nothing changes until it is approved', f: 'F294' }) + '</div>', 'mod-card');
  const capLeft = capsCard(U.capped, 'crit') + ladder(U.capped) + optCap;

  plain = false;
  // ---------------------------------------------------------------- notes (navy) and views
  const N = {
    src: note('<b>Pick a source</b>: each card says who bills. Hosted spends Spekin credits, Local CLI uses your own agent and its plan, API provider bills your provider.', 'left:14px;top:640px;max-width:316px'),
    mod: note('<b>Select a model</b>: the estimate and reserve update at once. A disabled row says why (plan, capability or missing rate card) and keeps Send off.', 'left:14px;top:540px;max-width:316px'),
    cli: note('<b>Start the Connector</b> once and type its 6-digit code here. After pairing it shows Running and its version; the browser reaches it on 127.0.0.1 only.', 'left:14px;top:540px;max-width:316px'),
    cli2: note('<b>Click an agent</b> to use it. OpenCode shows a sign-in hint and stays off; a missing agent links to its install guide. Runs use a work copy, never your checkout.', 'left:14px;top:640px;max-width:316px'),
    api: note('<b>Pick a provider</b>: its base URL fills in, and only Custom lets you edit it. Paste a key, then Test: Save unlocks only after a pass.', 'left:14px;top:540px;max-width:316px'),
    api2: note('<b>Revoke</b> asks to confirm, deletes the stored key and stops runs that used it. After Save the field is empty for good; nobody can read a key back.', 'left:14px;top:640px;max-width:316px'),
    est: note('<b>Change the model or effort</b>: the range band and the reserve redraw in place, and a failed check turns Send off with the reason.', 'left:14px;top:540px;max-width:316px'),
    est2: note('<b>Send</b>: 36 cr is held first. When the run ends the actual replaces the hold and the rest is refunded; a retry reuses the same key.', 'left:14px;top:640px;max-width:316px'),
    led: note('<b>Click a run</b>: its reserve, settle and refund entries highlight together. Provider cost and the credits charged stay separate fields.', 'left:14px;top:540px;max-width:316px'),
    led2: note('<b>Filter to CLI</b>: a row shows tokens only when the agent reported them. Otherwise it says not reported, never 0. A cancelled run keeps what it consumed.', 'left:14px;top:640px;max-width:316px'),
    cap: note('<b>At the cap</b> Send is off and says why. From 70% the meter turns amber and from 90% red; reserved and pending credits already count.', 'left:14px;top:540px;max-width:316px'),
    cap2: note('<b>Switch the source chip</b> to CLI or API: those runs are not counted against the cap, so Send works again. Top up is drawn and off (LATER).', 'left:14px;top:640px;max-width:316px'),
  };
  const estResv = '<div class="mod-resv">' + mic('clock', 13) + '<span>Reserves <b>36 cr</b> on Send · settles on finish</span></div>';
  const sideStd = (u) => usagePanel(u) + winPanel(u) + topUp();

  const cliResv = '<div class="mod-resv">' + mic('folder', 13) + '<span>Runs in a <b>work copy</b> · no Spekin credits</span></div>';
  const apiResv = '<div class="mod-resv">' + mic('key', 13) + '<span>Your provider bills this run · <b>0 cr</b> debited</span></div>';
  const v1 = appWin(U.calm, composer({ text: 'Try 2 more takes of the F-04 drawer with a denser table.' }), page({ cur: 'Models', lf: 'F281', left: modelsLeft, side: sideStd(U.calm) })) + N.src + N.mod;
  const v2 = appWin(U.calm, composer({ text: 'Summarise the variance rules in F-03 as a short list.', srcTag: 'CLI', mdl: 'Claude Code', eff: 'Medium', est: '', resv: cliResv }), page({ cur: 'Models', lf: 'F296', left: cliLeft, side: usagePanel(U.calm) + cliSide })) + N.cli + N.cli2;
  const v3 = appWin(U.calm, composer({ text: 'Check the new key with a short style summary.', srcTag: 'API', mdl: 'Sonnet 5.5', est: '≈ 9.8k tok', resv: apiResv }), page({ cur: 'Models', lf: 'F285', left: apiLeft, side: usagePanel(U.calm) + byokSide + savedKey })) + N.api + N.api2;
  const v4 = appWin(U.calm, composer({ text: 'Try 2 more takes of the F-04 drawer with a denser table.', resv: estResv }), page({ cur: 'Next run', lf: 'F287', left: runLeft, side: sideStd(U.calm) })) + N.est + N.est2;
  const v5 = appWin(U.calm, composer({ text: 'Ask for a different take of F-03.' }), page({ cur: 'Ledger', lf: 'F289', left: ledgerLeft, side: sideStd(U.calm) })) + N.led + N.led2;
  const v6 = appWin(U.capped, composer({ text: 'Try 2 more takes of the F-04 drawer with a denser table.', est: '', send: false, resv: '<div class="mod-resv crit">' + mic('clock', 13) + '<span>Send is off: the monthly cap is reached</span></div>' }), page({ cur: 'Limits', lf: 'F291', banner: bannerCap, left: capLeft, side: usagePanel(U.capped) + winPanel(U.capped) + topUp(true) })) + N.cap + N.cap2;

  // ================================================================ T01 tablet and phone
  const TW = 820, TH = 1180, TS = 0.68, PW = 390, PH = 844, PS = 0.86;
  const device = (kind, x, y, inner, label) => {
    const W = kind === 'tab' ? TW : PW, H = kind === 'tab' ? TH : PH, s = kind === 'tab' ? TS : PS, b = kind === 'tab' ? 8 : 7;
    return '<div class="mod-dv ' + kind + '" style="left:' + x + 'px;top:' + y + 'px;width:' + Math.round(W * s + 2 * b) + 'px;height:' + Math.round(H * s + 2 * b) + 'px" role="group" aria-label="' + label + '"><div class="mod-scr" style="width:' + Math.round(W * s) + 'px;height:' + Math.round(H * s) + 'px"><div class="mod-dsc" style="width:' + W + 'px;height:' + H + 'px;transform:scale(' + s + ')">' + inner + '</div></div></div>';
  };
  const FR = S.MODELS_DEVICE_FRAMES, FD = S.MODELS_FINDING, BN = S.MODELS_BUNDLE;
  const thumb = (kind) => {
    const iw = 230, ih = 150, k = 68 / iw;
    const inner = kind === 'image' ? '<span class="mod-imgph">' + ic('image', 40, 1.5) + '</span>' : mini({ title: kind === 'chart' ? 'Portfolio overview' : 'Variance table', chart: kind === 'chart', table: kind !== 'chart', rows: 4, drawer: kind === 'drawer', h: ih });
    return '<span class="mod-th"><span class="in" style="width:' + iw + 'px;height:' + ih + 'px;transform:scale(' + k.toFixed(3) + ')">' + inner + '</span></span>';
  };
  const preview = (w, h, k, extra = '', opts = {}) => '<div class="mod-pvw" style="width:' + w + 'px;height:' + h + 'px"><span class="in" style="width:' + Math.round(w / k) + 'px;height:' + Math.round(h / k) + 'px;transform:scale(' + k + ')">' + mini(Object.assign({ title: 'Variance table', chart: true, table: true, rows: 4, h: Math.round(h / k) }, opts)) + '</span>' + extra + '</div>';
  const TAB4 = [['Frames', 'grid', 'Shows the frame list and the single-frame viewer'], ['Style', 'palette', 'Shows the learned style of accepted frames (S30)'], ['Review', 'req', 'Shows the review queue: findings, compare, apply and dismiss'], ['Hand off', 'download', 'Shows the hand-off bundle of accepted revisions only']];
  const strip = (head, cur) => '<div class="mod-stage"></div><div class="mod-st"><b>' + head[0] + '</b>' + head[1] + '<span class="sp-fill"></span>' + ['≥ 1024 · desktop canvas (S29)', '768–1023 · list and frame', 'under 768 · list, frame, sheet'].map((t, i) => '<span class="mod-bp"' + (i === cur ? ' aria-current="true"' : '') + '>' + t + '</span>').join('') + '</div>';

  // ---- tablet pieces (design px, 820 x 1180)
  const tHead = '<div class="mod-sbar"><span>12:41</span><i></i></div><div class="mod-ah"><span class="mk">S</span><div class="pj">Meranti Yard<span>Inc. 2 · Spec r14</span></div><span class="fl"></span>' +
    '<button type="button" class="mod-chb" data-does="Opens the stage list as a sheet: all eight stages with a text status; choosing one switches in place" data-feature="F356">Design' + ic('chev', 14) + '</button>' +
    '<button type="button" class="mod-mtr" data-does="Opens Models and usage (S36): used, reserved and cap" data-feature="F355">Hosted<i><u style="width:25%"></u></i><b>1,240</b></button><span class="mod-avt">RS</span></div>';
  const tab4 = (cur, badge) => '<div class="mod-t4" role="tablist" aria-label="Frame workspace">' + TAB4.map(([l, i, d]) => '<button type="button" role="tab"' + (l === cur ? ' aria-current="page"' : '') + ' data-does="' + d + '; a tab never approves anything" data-feature="F344">' + mic(i, 18) + l + (l === 'Review' && badge ? '<span class="bd">' + badge + '</span>' : '') + '</button>').join('') + '</div>';
  const frRow = (f, sel, feat) => '<div class="mod-fr' + (sel ? ' sel' : '') + '"><button type="button" class="go" data-does="Shows ' + f[0] + ' ' + f[1] + ' in the viewer; the list keeps its scroll position" data-feature="' + feat + '">' + thumb(f[4]) + '<span class="tx">' + f[0] + ' ' + f[1] + '<small>' + f[2] + pill(f[3]) + '</small></span></button></div>';
  const tRail = wrapNew('F342', '<div class="mod-rh">Frames<span>5 on this board</span></div>' + FR.map((f, i) => frRow(f, i === 1, 'F342')).join('') +
    '<button type="button" class="mod-add" data-does="Opens the file picker for a PNG, JPEG or WebP reference you are entitled to use; nothing is read without your choice" data-feature="F345">' + ic('plus', 18) + 'Import a reference</button>' +
    '<button type="button" class="mod-it" data-does="Opens the review panel in place of this list" data-feature="F343"><i>3</i><span><b>Review queue</b><span>1 change, 1 draft, 1 gap</span></span></button>', 'mod-rail');
  const revRows = [['r6', 'Accepted · 12:41 · Rina (sample)', ['ok', 'Baseline']], ['r5', 'Accepted · yesterday', ['mute', 'Earlier']], ['r4', 'Accepted · 19 Nov', ['mute', 'Earlier']]];
  const tViewer = wrapNew('F342', '<div class="mod-vh"><h3>F-03 Variance table</h3>' + pill(['ok', 'Accepted r6']) + '<span class="fl"></span><button type="button" class="mod-b ghost" data-does="Opens the context panel (links, contract, revisions, evidence) in place of the frame list" data-feature="F343">Open context</button></div>' +
    preview(526, 440, 2.4) +
    '<div class="mod-note">' + mic('monitor', 18) + '<span>Canvas editing is on desktop. Review, compare and hand off work here.</span></div>' +
    '<div class="mod-meta"><div>Status<b>Accepted r6</b></div><div>Requirement<b>R-DASH-014</b></div><div>Edited<b>12:41 · Rina</b></div></div>' +
    '<div class="mod-revs">' + revRows.map(([r, t, p]) => '<button type="button" class="mod-rv" data-does="Shows revision ' + r + ' of F-03 in the viewer" data-feature="F342"><b>' + r + '</b><span>' + t + '</span>' + pill(p) + '</button>').join('') + '</div>' +
    '<div class="mod-acts"><button type="button" class="mod-b ghost grow" data-does="Compares F-03 r6 with its latest proposal on the whole frame" data-feature="F347">Compare</button><button type="button" class="mod-b ink grow" data-does="Opens a bottom sheet to describe a change to F-03; nothing is applied until you review it" data-feature="F348">Propose change</button></div>', 'mod-vw');
  const tabletBoard = tHead + tab4('Frames', 3) + '<div class="mod-bd">' + tRail + tViewer + '</div><div class="mod-hb"></div>';

  const pnItems = [['1', 'Clearer variance flags', 'F-03 · r6 to r7 · needs review', true], ['2', 'Alert drawer is a draft', 'F-04 · r1 · not accepted', false], ['3', 'Gap: no empty state', 'Proposal · R-DASH-019', false]];
  const tPanel = wrapNew('F343', '<div class="mod-rh">Review<span>3 waiting</span><span class="fl"></span><button type="button" class="mod-chb" data-does="Closes the review panel and shows the frame list again; the viewer keeps its frame" data-feature="F343">' + mic('back', 16) + 'Frames</button></div>' +
    pnItems.map(([n, t, s, sel]) => '<button type="button" class="mod-it' + (sel ? ' sel' : '') + '" data-does="Shows finding ' + n + ' in the viewer: ' + t + '" data-feature="F343"><i>' + n + '</i><span><b>' + t + '</b><span>' + s + '</span></span></button>').join('') +
    '<div class="mod-note">' + ic('lock', 18) + '<span>Baseline stays <b>r6</b> until you apply. Dismissing is not a pass.</span></div>', 'mod-pn');
  const chgBox = '<span class="mod-chg" style="left:384px;top:118px;width:96px;height:150px"></span><span class="mod-chtag" style="left:14px;bottom:14px">' + ic('diff', 14) + 'Changed · 3 rows</span>';
  const tReview = wrapNew('F347', '<div class="mod-vh"><h3>F-03 Variance table</h3>' + pill(['acc', 'r7 proposed']) + '</div><div class="mod-tg"><button type="button" aria-pressed="false" data-does="Shows F-03 as it is in the baseline r6" data-feature="F347">Original r6</button><button type="button" aria-pressed="true" data-does="Shows F-03 with the proposed change r7 highlighted" data-feature="F347">Changed r7</button></div>' +
    preview(488, 330, 2.4, chgBox, { chart: false }) +
    '<div class="mod-fnd"><span class="k">Finding 1 of 3</span><h4>' + FD.title + '</h4><p>' + FD.body + '</p><div class="ch"><span>R-DASH-014</span><span>' + FD.changed + ' changed</span><span>spec r14</span></div></div>' +
    '<div class="mod-acts"><button type="button" class="mod-b ghost grow" data-does="Dismisses this finding; it stays on record and dismissal is not a pass" data-feature="F348">Dismiss</button><button type="button" class="mod-b ghost grow" data-does="Opens the whole-frame comparison of r6 and r7, including changes outside the highlighted part" data-feature="F347">Compare frame</button><button type="button" class="mod-b ink grow" data-does="Opens a confirm sheet; the baseline moves from r6 to r7 only after you confirm" data-feature="F348">Apply change</button></div>', 'mod-vw');
  const tabletReview = tHead + tab4('Review', 3) + '<div class="mod-bd">' + tPanel + tReview + '</div><div class="mod-hb"></div>';

  // ---- phone pieces (design px, 390 x 844)
  const pStatus = '<div class="mod-ph-bar"><span>12:41</span><i></i></div>';
  const pHead = '<div class="mod-pa"><span class="mk">S</span><b>Meranti Yard</b><span class="fl"></span>' +
    '<button type="button" class="mod-chb" data-does="Opens the stage list as a bottom sheet with all eight stages" data-feature="F356">Design' + ic('chev', 14) + '</button>' +
    '<button type="button" class="mod-mtr" data-does="Opens Models and usage (S36)" data-feature="F355"><b>1,240</b></button></div>';
  const pTabs = (cur) => '<div class="mod-tb" role="tablist" aria-label="Frame workspace">' + TAB4.map(([l, i, d]) => '<button type="button" role="tab"' + (l === cur ? ' aria-current="page"' : '') + ' data-does="' + d + '; a tab never approves anything" data-feature="F344">' + mic(i, 22) + l + (l === 'Review' ? '<span class="bd">3</span>' : '') + '</button>').join('') + '</div><div class="mod-hb ph"></div>';
  const pRow = (f, sel) => '<div class="mod-pr' + (sel ? ' dim' : '') + '"><button type="button" class="go" data-does="Opens ' + f[0] + ' ' + f[1] + ' in the single-frame viewer" data-feature="F345">' + thumb(f[4]) + '<span class="tx">' + f[0] + ' ' + f[1] + '<small>' + f[2] + pill(f[3]) + '</small></span></button><button type="button" class="mo" aria-label="Actions for ' + f[0] + ' ' + f[1] + '" data-does="Opens a bottom sheet of actions for this frame: open, move, duplicate, compare" data-feature="F346">' + ic('more', 22) + '</button></div>';
  const pList = pStatus + pHead + '<div class="mod-pb"><h3>Frames</h3><div class="sub">' + mic('monitor', 18) + '<span>Canvas editing is on desktop. Review and hand off work here.</span></div>' +
    '<div class="mod-sr"><div class="mod-sf">' + ic('search', 18) + 'Search frames</div><button type="button" class="mod-ib" aria-label="Filter by status" data-does="Opens a bottom sheet to filter frames by status" data-feature="F345">' + ic('layers', 20) + '</button></div>' +
    '<div class="mod-pl isnew mod-r" data-feature="F345">' + NT + FR.map((f, i) => pRow(f, false)).join('') + '</div></div>' + pTabs('Frames');
  const sheetActions = [['arrowR', 'Open frame', '', 'Opens F-03 in the single-frame viewer'], ['arrowU', 'Move earlier', 'now 2 of 5', 'Moves F-03 one place earlier in the list; the non-drag way to reorder'], ['arrowD', 'Move later', '', 'Moves F-03 one place later in the list; the non-drag way to reorder'], ['copy', 'Duplicate as draft', '', 'Makes F-03 d1, a draft copy; the accepted baseline is untouched'], ['cols', 'Compare r6 with r5', '', 'Opens the whole-frame comparison of two revisions']];
  const pSheet = '<div class="mod-scrim"></div><div class="mod-sh isnew mod-r" data-feature="F353">' + NT + '<div class="mod-grab"></div><div class="mod-sheadrow">' + thumb('table') + '<div><h4>F-03 Variance table</h4><span class="sm">r6 · Accepted</span></div></div>' + sheetActions.map(([i, l, h, d], k) => '<button type="button" class="mod-sa" data-does="' + d + '" data-feature="F346">' + mic(i, 22) + l + (h ? '<small>' + h + '</small>' : '') + '</button>').join('') + '<div class="btns"><button type="button" class="mod-b ghost grow" data-does="Closes the sheet; nothing changes" data-feature="F353">Cancel</button></div><div class="mod-hb ph"></div></div>';
  const phoneList = pList;
  const phoneSheet = pList + pSheet;

  const pRevHead = '<div class="mod-pa"><button type="button" class="mod-ib" aria-label="Back to frames" data-does="Goes back to the frame list; nothing is decided" data-feature="F347">' + mic('back', 20) + '</button><span class="ttl">Review · 1 of 3</span><button type="button" class="mod-ib" aria-label="Next finding" data-does="Shows the next finding in the queue" data-feature="F347">' + ic('chevR', 20) + '</button></div>';
  const phChg = '<span class="mod-chg" style="left:278px;top:90px;width:72px;height:106px"></span><span class="mod-chtag" style="left:10px;bottom:10px">' + ic('diff', 13) + 'Changed</span>';
  const pReviewBody = '<div class="mod-pb"><div class="mod-vh"><h3 class="h3s">F-03 Variance table</h3><span class="fl"></span>' + pill(['acc', 'r6 to r7']) + '</div>' +
    '<div class="mod-tg" role="group" aria-label="Version"><button type="button" aria-pressed="false" data-does="Shows F-03 as it is in the baseline r6" data-feature="F347">Original r6</button><button type="button" aria-pressed="true" data-does="Shows F-03 with the proposed change r7 highlighted" data-feature="F347">Changed r7</button></div>' +
    '<div class="isnew mod-r" data-feature="F347">' + NT + preview(358, 226, 1.9, phChg, { chart: false }) + '</div>' +
    '<div class="mod-fnd"><span class="k">Finding 1</span><h4>' + FD.title + '</h4><p>Compare the whole frame before you apply. The baseline stays r6 until you do.</p></div>' +
    '<button type="button" class="mod-b plain" data-does="Opens the whole-frame comparison of r6 and r7, including changes outside the highlighted part" data-feature="F347">' + mic('arrowR', 18) + 'Compare the whole frame</button></div>';
  const pBar = '<div class="mod-bar2 isnew mod-r" data-feature="F348">' + NT + '<button type="button" class="mod-b ghost grow" data-does="Dismisses this finding; it stays on record and dismissal is not a pass" data-feature="F348">Dismiss</button><button type="button" class="mod-b ink grow" data-does="Opens a confirm sheet; the baseline moves from r6 to r7 only after you confirm" data-feature="F348">Apply change</button></div><div class="mod-hb ph"></div>';
  const phoneReview = pStatus + pRevHead + pReviewBody + pBar;
  const confirmSheet = '<div class="mod-scrim"></div><div class="mod-sh isnew mod-r" data-feature="F348">' + NT + '<div class="mod-grab"></div><h4>Apply change to F-03?</h4><div class="mod-kvs"><span>Baseline now</span><b>r6</b><span>After you confirm</span><b>r7</b><span>Requirement</span><b>R-DASH-014 stays r14</b><span>Test</span><b>AC-014.2 needs review</b></div><div class="btns"><button type="button" class="mod-b ghost grow foc" data-does="Closes the sheet and changes nothing; this is the default choice" data-feature="F348">Cancel</button><button type="button" class="mod-b ink grow" data-does="Applies r7 as the new baseline of F-03 and records who applied it" data-feature="F348">Apply r7</button></div><div class="mod-hb ph"></div></div>';
  const phoneConfirm = phoneReview + confirmSheet;

  const ckRow = (r) => '<div class="mod-ck2' + (r[3] ? '' : ' off') + '"><button type="button" class="go" ' + (r[3] ? 'role="checkbox" aria-checked="true" data-does="Includes ' + r[0] + ' ' + r[1] + ' ' + r[2] + ' in the bundle; unchecking leaves it out" data-feature="F350"' : 'role="checkbox" aria-checked="false" aria-disabled="true" disabled data-does="Not in the bundle: ' + r[4] + '" data-feature="F350"') + '><span class="bx' + (r[3] ? ' on' : '') + '">' + (r[3] ? ic('check', 16, 3) : '') + '</span><span class="tx">' + r[0] + ' ' + r[1] + '<small>' + (r[3] ? r[2] + ' · accepted' : r[4]) + '</small></span></button></div>';
  const pHandBody = '<div class="mod-pb"><h3>Hand off</h3><div class="sub"><span>Only accepted revisions. No local agent runs.</span></div>' +
    '<div class="mod-pl isnew mod-r" data-feature="F350">' + NT + BN.pick.map(ckRow).join('') + '</div>' +
    '<div class="mod-bun"><span class="k">Bundle contents</span><div class="fl2">' + BN.files.map((f) => '<span>' + f + '</span>').join('') + '</div><span>The snapshot does not follow later edits. It is not a runnable app.</span></div></div>';
  const pPrep = '<div class="mod-bar2"><button type="button" class="mod-b ink grow" data-does="Builds the snapshot of the 2 selected accepted frames and shows a ready sheet; it does not start a coding agent" data-feature="F351">' + ic('download', 18) + 'Prepare download · 2 frames</button></div>';
  const phoneHand = pStatus + pHead + pHandBody + pPrep + pTabs('Hand off');
  const readySheet = '<div class="mod-scrim"></div><div class="mod-sh isnew mod-r" data-feature="F351">' + NT + '<div class="mod-grab"></div><div class="mod-sheadrow"><span class="mod-okb">' + ic('check', 22, 2.4) + '</span><div><h4>Bundle ready</h4><span class="sm">' + BN.id + ' · 2 frames · 4 files · ' + BN.size + '</span></div></div><div class="mod-kvs"><span>Spec</span><b>' + BN.spec + '</b><span>F-01</span><b>r4</b><span>F-03</span><b>r6</b></div><p class="sm">Pinned to these revisions. Later edits do not change this bundle.</p><div class="btns"><button type="button" class="mod-b ink grow" data-does="Downloads the prepared bundle to this device; the file is the snapshot, not an instruction to run" data-feature="F351">' + ic('download', 18) + 'Download bundle</button></div><div class="mod-hb ph"></div></div>';
  const phoneReady = phoneHand + readySheet;

  // ---- spec cards beside the devices (static drawings, not controls)
  const dg = (cls, panes) => '<div class="dg">' + panes.map((p) => '<i class="' + p + '"></i>').join('') + '</div>';
  const ladderCard = (cur, x, y, w) => '<div class="mod-spec" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px"><h4>One screen, three layouts<em>the layout follows the width, not the device</em></h4><div class="mod-lad2">' +
    '<div class="it"><b>' + 'Desktop · 1024 px and up</b>' + dg('', ['n', '', 'n']) + '<span>Chat, board canvas and inspector side by side (S29, S35).</span></div>' +
    '<div class="it' + (cur === 't' ? ' cur' : '') + '"><b>Tablet · 768 to 1023 px</b>' + dg('', cur === 't' ? ['n', 's'] : ['n', '']) + '<span>Frame list and one frame. Context opens in place of the list.</span></div>' +
    '<div class="it' + (cur === 'p' ? ' cur' : '') + '"><b>Phone · under 768 px</b>' + dg('', cur === 'p' ? ['s'] : ['']) + '<span>List, then one frame; tabs at the bottom.</span></div></div></div>';
  const rulesCard = (x, y, w) => '<div class="mod-spec" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px"><h4>Touch rules on every small screen</h4><div class="mod-rules">' +
    '<div><span class="mod-t44">44</span><span>Every target is 44 × 44 px or larger, with 8 px between neighbours.</span></div>' +
    '<div>' + ic('eye', 18) + '<span>Actions are always on screen. Nothing waits for hover.</span></div>' +
    '<div>' + ic('layers', 18) + '<span>Popovers and menus become bottom sheets with a grabber and a scrim.</span></div>' +
    '<div>' + ic('lock', 18) + '<span>Safe areas stay clear: 28 px top and 22 px bottom on the tablet, 50 and 34 on the phone.</span></div>' +
    '<div>' + ic('type', 18) + '<span>Body text is 16 px, so the browser never zooms into a field.</span></div>' +
    '<div>' + ic('spark', 18) + '<span>Reduce Motion: sheets and panels appear without sliding. Status stays as text.</span></div></div></div>';
  const mapCard = (title, rows, x, y, w) => '<div class="mod-spec" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px"><h4>' + title + '</h4><div class="mod-map">' + rows.map(([a, b]) => '<span class="a">' + a + '</span><span class="ar">' + mic('arrowR', 16) + '</span><span class="b">' + b + '</span>').join('') + '</div></div>';
  const swapCard = (x, y, w) => '<div class="mod-spec" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px"><h4>Context replaces the list<em>BW-T01</em></h4><div class="mod-swap"><div class="it"><b>List and frame</b>' + dg('', ['n', '']) + '<span>Browse frames, tap one to view it.</span></div><span class="ar">' + mic('arrowR', 22) + '</span><div class="it"><b>Review panel and frame</b>' + dg('', ['n s', '']) + '<span>The panel takes the list place. Nothing stacks beside the viewer.</span></div></div></div>';
  const staleCard = (x, y, w) => '<div class="mod-spec" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px"><h4>If the frame moved on<em>AC-57</em></h4><div class="mod-stale"><div class="hd">' + pill(['warn', 'Stale']) + '<b>Clearer variance flags</b></div><p>F-03 changed after this finding was made. Re-check it before it can be applied. Dismiss is still allowed.</p><div class="bt"><span class="mod-b ghost">Dismiss</span><span class="mod-b ink off">Re-check first</span></div></div></div>';
  const manCard = (x, y, w) => '<div class="mod-spec" style="left:' + x + 'px;top:' + y + 'px;width:' + w + 'px"><h4>manifest.json<em>fixed when you press Prepare</em></h4><div class="mod-man"><span class="k">{</span>\n  "bundle": "' + BN.id + '",\n  "spec": "' + BN.spec + '",\n  "frames": [ { "id": "F-01", "rev": "r4" }, { "id": "F-03", "rev": "r6" } ],\n  "design": "DESIGN.md r3",\n  "excluded": [ "F-04 draft", "F-03 alternatives" ]\n<span class="k">}</span></div></div>';

  // ---- T01 views
  const tabletCap = ['Tablet', '820 × 1180 px, shown at 68%'], phoneCap = ['Phone', '390 × 844 px, shown at 86%, two states side by side'];
  const t1 = strip(tabletCap, 1) + device('tab', 24, 56, tabletBoard, 'Tablet: frame list and single frame') + ladderCard('t', 626, 66, 790) + rulesCard(626, 340, 790) +
    note('<b>Rotate or resize</b>: at 1024 px and wider the same screen becomes the desktop canvas (S29). The layout follows the width, never the device name.', 'left:640px;top:610px;max-width:350px') +
    note('<b>Tap a frame</b>: the viewer changes in place. The list keeps its scroll and its selected row; nothing reloads and nothing is approved.', 'left:1020px;top:610px;max-width:350px');
  const t2 = strip(tabletCap, 1) + device('tab', 24, 56, tabletReview, 'Tablet: frame review with the review panel in place of the list') + swapCard(626, 66, 790) +
    mapCard('What replaced hover and drag', [['Popover on a selected part', 'Panel in place of the list'], ['Hold O to peek at the original', 'Original / Changed toggle'], ['Hover reveals the actions', 'Dismiss, Compare, Apply in one bar'], ['Enter accepts', 'Apply asks first, Cancel is the default']], 626, 292, 790) +
    note('<b>Tap Changed r7</b>: the dashed part is the change; the rest is r6. A hold-to-peek gesture does not exist on touch, so the toggle stays on screen.', 'left:640px;top:560px;max-width:350px') +
    note('<b>Apply change</b> opens a confirm sheet. The baseline stays r6 until you confirm, and a stale finding cannot be applied before it is re-checked.', 'left:1020px;top:560px;max-width:350px');
  const t3 = strip(phoneCap, 2) + device('ph', 24, 88, phoneList, 'Phone: frame list') + device('ph', 397, 88, phoneSheet, 'Phone: frame actions in a bottom sheet') +
    mapCard('Canvas edits without dragging', [['Drag to reorder frames', 'Move earlier, Move later'], ['Right-click menu on a frame', 'The ⋯ button on every row'], ['Alt-drag to duplicate', 'Duplicate as draft'], ['Drop a file on the board', 'Import a reference (file picker)'], ['Hover tooltip', 'A visible text label']], 780, 88, 636) +
    ladderCard('p', 780, 330, 636) +
    note('<b>Tap ⋯</b> on a row: a bottom sheet lists what a right-click menu would. It slides up in 220 ms, closes with Cancel, a scrim tap or swipe down.', 'left:790px;top:610px;max-width:300px') +
    note('<b>Tap a row</b>: the single-frame viewer opens with Back at the top left. The list is the only screen that shows the whole board, so editing stays on desktop.', 'left:1110px;top:610px;max-width:300px');
  const t4 = strip(phoneCap, 2) + device('ph', 24, 88, phoneReview, 'Phone: single-frame review') + device('ph', 397, 88, phoneConfirm, 'Phone: confirm sheet before Apply') +
    mapCard('Three decisions, always in reach', [['Apply change', 'r6 becomes r7 after a confirm'], ['Dismiss', 'Finding closed, kept on record'], ['Compare the whole frame', 'Shows changes outside the part']], 780, 88, 636) + staleCard(780, 276, 636) +
    note('<b>Original r6 or Changed r7</b>: a toggle, not a hold. The dashed box marks the changed part; the rest of the frame is the same in both.', 'left:790px;top:500px;max-width:300px') +
    note('<b>Cancel is the default</b> in the sheet. Apply is a second, deliberate tap, and the sheet says exactly what moves from r6 to r7.', 'left:1110px;top:500px;max-width:300px');
  const t5 = strip(phoneCap, 2) + device('ph', 24, 88, phoneHand, 'Phone: hand off, choose accepted revisions') + device('ph', 397, 88, phoneReady, 'Phone: bundle ready sheet') +
    manCard(780, 88, 636) + mapCard('Left out of the bundle, with the reason', [['F-04 Alert drawer · r1', 'Draft, not accepted'], ['F-03 alternatives · 3 takes', 'Pending alternatives'], ['REF-02 Site cost report', 'Reference, not a frame']], 780, 360, 636) +
    note('<b>Prepare download</b> builds the snapshot once. If it fails, Retry rebuilds the same snapshot, not a newer one; no coding agent or deploy ever starts.', 'left:790px;top:600px;max-width:300px') +
    note('<b>Download bundle</b> saves the file to the device. Later edits to F-03 do not change it: the manifest is fixed when you press Prepare.', 'left:1110px;top:600px;max-width:300px');

  // ---------------------------------------------------------------- boards
  return [
    {
      file: 'S36-models-usage', code: 'S36', tier: 'MODELS', name: 'Models and usage: source, local CLI, API key, estimate, ledger and caps',
      ext: 'New. Spekin has no built screen yet. Opens from the model chip in the chat composer and from the usage meter in the top bar of S35; extends the existing billing, settings and usage ideas with a per-run ledger (PRD S36, R-MOD-1 to R-MOD-11). Local CLI added by owner decision 22 Nov 2026; pairing and runs ship as a later adapter after a security review (ADR 0005, review REV-02).',
      lives: 'Spekin web app · /p/meranti-yard/usage (section in the query: models, run, ledger, limits). Opens as an artifact tab beside the work; keys, key text and pairing codes are never in the URL or in any export.',
      views: [
        { id: 'source', label: 'Source picker', html: v1, entry: 'Projects &gt; Meranti Yard &gt; Design &gt; click the HOSTED Sonnet 5.5 chip in the chat composer &gt; Models.', data: 'sample/parts/models.mjs → MODELS_SOURCES, MODELS_PROVIDERS, MODELS_REGISTRY, MODELS_EFFORT, MODELS_TASKS.' },
        { id: 'cli', label: 'Local CLI', html: v2, entry: 'Models &gt; click the Local CLI card &gt; pair the Spekin Connector with its 6-digit code &gt; click Claude Code in the agent list.', data: 'sample/parts/models.mjs → MODELS_CONNECTOR, MODELS_AGENTS, MODELS_AGENT_RUN.' },
        { id: 'api', label: 'API provider setup and test', html: v3, entry: 'Models &gt; click the API provider card &gt; pick Anthropic &gt; paste a key &gt; Test connection.', data: 'sample/parts/models.mjs → MODELS_API, MODELS_KEY (tests, tail, usage).' },
        { id: 'estimate', label: 'Estimate before Send', html: v4, entry: 'Type in the chat composer &gt; the meter chip shows the estimate &gt; click Next run in Models and usage.', data: 'sample/parts/models.mjs → MODELS_RUN (est, reserve, ctx, checks).' },
        { id: 'ledger', label: 'Usage ledger', html: v5, entry: 'Click the usage meter in the top bar &gt; Ledger, or click Ledger on a run card in the chat.', data: 'sample/parts/models.mjs → MODELS_LEDGER (incl. cli rows), MODELS_LEDGER_DETAIL, MODELS_USAGE.calm.' },
        { id: 'capped', label: 'Cap reached', html: v6, entry: 'Usage meter turns amber at 70% and red at 90% &gt; Send in the composer turns off at the cap &gt; click the meter &gt; Limits.', data: 'sample/parts/models.mjs → MODELS_USAGE.capped, MODELS_CAPS, MODELS_PERIOD.' },
      ],
      side: {
        must: [
          'Three sources, each saying who bills: Hosted (Spekin credits), Local CLI · bring your own agent (your agent\'s own plan; Spekin credits not used) and API provider · your key (BYOK; your provider bills you).',
          'The composer chip names the active source on every state: HOSTED, CLI or API.',
          'Hosted: provider chips and a model radio group. Each model shows capabilities, limits, rate card and retention; anything not known says unknown. A model that cannot be used is disabled with the reason.',
          'Local CLI: Spekin Connector status (running, paired, version), the detected agents with installed and signed-in state, a sign-in hint or an install link, then agent, model, effort and a permission mode. Runs happen in a separate work copy, never your checkout.',
          'Usage from a CLI run shows only where the agent reports it; otherwise the field says not reported, never 0.',
          'API provider: provider picker, base URL (prefilled, editable for Custom), a write-only key (encrypted on the server, never shown again, revocable), a model list fetched from the provider plus a custom id, and a connection test with per-check results.',
          'Before Send on Hosted: the estimate range, the exact context in tokens, the checks, and the maximum that will be reserved. After the run: settle the actual, refund the rest.',
          'A usage meter with reserved and pending pieces, calm until 70%, warn at 70%, critical at 90%; caps per run and per month; rate windows.',
          'At the cap new Hosted runs stop, the limit is named, Local CLI and API runs are not counted, and every artifact stays. Credit top-up is drawn and off (LATER).',
        ],
        motion: [
          ['Meter fill', 'Bar width eases 320 ms spring-panel. Colour changes at 70% and 90% with a 140 ms fade; nothing pulses.'],
          ['Estimate', 'The range band redraws in 180 ms when model, effort or context changes; numbers swap with a 120 ms fade.'],
          ['Source switch', 'The form below cross-fades 200 ms spring-ui. Typed key text is cleared on a switch, never carried over.'],
          ['Connector and agents', 'The status dot and pills fade 140 ms when the Connector connects or drops. After Scan, agent rows resolve one by one every 40 ms, ease cubic-bezier(0.23,1,0.32,1); a spinner shows only while that row’s own check is open.'],
          ['Ledger rows', 'New entries rise 4 px with a 40 ms stagger, ease cubic-bezier(0.23,1,0.32,1) (OpenDesign).'],
          ['Connection test', 'Rows resolve one by one every 60 ms. A spinner shows only while that row’s request is open; no fake progress bar.'],
          ['Reduce Motion', 'Fills and swaps are instant. Severity, cap and Connector messages are still announced as text.'],
        ],
        stories: [
          ['F281', 'new', 'Model source picker: Hosted, Local CLI (bring your own agent) and API provider (BYOK), each naming who bills; the active source shows as HOSTED, CLI or API on the composer chip (R-MOD-1, AC-SPK-7).', 'OpenDesign'],
          ['F282', 'new', 'Hosted provider chips and a model radio group with capabilities, limits, rate card and retention (unknown stays unknown); unusable models are disabled with the reason (R-MOD-2, R-MOD-5, AC-SPK-6).', 'OpenDesign'],
          ['F283', 'new', 'Effort levels, Fixed or Auto routing and routing by task with an independent reviewer from a different vendor; the actual model of every run is shown (R-MOD-4, R-MOD-5, R-MOD-11).', 'Onlook'],
          ['F285', 'new', 'API provider (BYOK): picker for Anthropic, OpenAI, Google Gemini, Azure OpenAI, Ollama on this computer and Custom OpenAI-compatible; base URL prefilled and editable for Custom; write-only key, encrypted on the server, never shown again, revocable (R-MOD-9, AC-SPK-12).', 'OpenDesign'],
          ['F286', 'new', 'Connection test with per-check results and a model list fetched from the provider, with a custom model id allowed; a failed test saves nothing (R-MOD-9).', 'OpenDesign'],
          ['F287', 'new', 'Estimate before Send: range, exact context, capability and rate-card checks, and the reserve; Send is off with the reason when a check fails (R-MOD-3, AC-SPK-6).', 'PRD'],
          ['F288', 'new', 'Reserve the maximum, settle the actual, refund the rest; idempotent retries and duplicate callbacks never charge twice (R-MOD-6, R-MOD-7, R-MOD-8, AC-SPK-8).', 'PRD'],
          ['F289', 'new', 'Usage ledger: reserve, settle, refund, hold, BYOK and CLI entries with a running balance; a CLI row shows tokens only when the agent reported them, else not reported, never 0; provider cost and credit charge stay separate (R-MOD-6, R-MOD-10, AC-SPK-9).', 'PRD'],
          ['F290', 'new', 'Usage meter with reserved and pending pieces, plus the 5-hour and 7-day rate windows; calm, warn at 70%, critical at 90% (R-MOD-10, Onlook UsageMeter, OpenDesign CodingPlanUsage).', 'Onlook'],
          ['F291', 'new', 'Caps per run, per project month and per workspace, plus a concurrency limit; checked at reservation (R-MOD-7, R-MOD-10).', 'PRD'],
          ['F293', 'new', 'Spekin Connector: a small local Rust program the user starts once and pairs with a 6-digit code; the browser talks to it on 127.0.0.1 only; the screen shows running, paired and version (R-MOD-1, owner decision 22 Nov 2026).', 'OpenDesign'],
          ['F294', 'new', 'Cap reached: stop the affected Hosted action, name the limit, show what is left and pending, preserve every artifact; CLI and API runs are not counted; the 70% and 90% steps lead here (R-PAY-7, R-MOD-7, R-MOD-10, AC-42).', 'PRD'],
          ['F295', 'new', 'Credit top-up by QRIS through a swappable payment adapter, drawn and off; automatic top-up stays off (R-PAY-1 to R-PAY-5, R-MOD-10).', 'PRD'],
          ['F296', 'new', 'Detected agents: Claude Code, Codex CLI, OpenCode, Antigravity (Gemini), Cursor Agent and GitHub Copilot CLI with installed and signed-in state, a sign-in hint or an install link (R-MOD-1).', 'OpenDesign'],
          ['F297', 'new', 'Local run settings: the agent, its model, effort and a permission mode (ask before writing files, or edit files in a work copy only); runs happen in a separate work copy, never the user checkout (R-MOD-1).', 'Onlook'],
          ['F299', 'new', 'Honest local usage: it comes from the agent where it reports it, else the field says not reported, never 0; CLI runs debit no Spekin credits (R-MOD-6, R-MOD-10).', 'PRD'],
        ],
        where: '<span><b>Owner decision 22 Nov 2026:</b> Local CLI is in scope as a model source; the PRD deferred local integration.</span><span><b>Route:</b> <code>/p/:project/usage?s=models|run|ledger|limits</code>. Back and Forward restore the section and never start a paid job (R-WF-11).</span><span><b>UI (TS/React):</b> OpenDesign (Apache-2.0, commit <code>e033aad</code>) <code>InlineModelSwitcher</code>, <code>components/byok/*</code>, the runtime registry and agent detection, <code>CodingPlanUsage</code> and its string-credit model; Onlook (Apache-2.0) <code>UsageMeter</code> with <code>usageSeverity</code> 70 and 90, <code>ModelEffortMenu</code>, and the worktree pattern for runs. Reuse needs a NOTICE file. Momo (no licence): the effort dock is a pattern only.</span><span><b>Connector (Rust):</b> the Spekin Connector is a small local Rust program: 127.0.0.1 listener, 6-digit pairing, agent detection, work copies, run streaming. Agent adapters for Claude Code, Codex and OpenCode come first; the others follow the same adapter shape.</span><span><b>Core (Rust):</b> model registry and rate cards, atomic reservations, the ledger, concurrency limits, the encrypted key vault, the payment adapter and webhook checks (R-MOD-6 to R-MOD-9, R-PAY-2).</span><span><b>Open for Enrico:</b> payment gateway (Midtrans QRIS is the leaning, Xendit stays swappable; Q-05) · credit pack sizes and prices · whether the cap is per project or per workspace by default · any BYOK platform fee · which agents follow the first three · Connector install and signing per operating system. Credit figures here are fixture units, not a price list.</span>',
      },
      refs: {
        note: 'OpenDesign (Apache-2.0, commit e033aad) is the source for the model switcher with its local CLI and API provider modes, the BYOK fields and agent detection; Onlook (Apache-2.0) for the meter and work-copy runs. Momo (no licence) and Paraframe are pattern references only; Spekin copies none of their wording or assets.',
        shots: [
          { img: 'od-entry-view.png', cap: '<b>OpenDesign.</b> The agent and model chip sits bottom left of the entry view and opens a switcher with a local CLI mode and an API provider mode. Spekin adds Hosted as a third source and says who bills on each.' },
          { img: 'momo-chat-home.png', cap: '<b>Momo (pattern only).</b> The model and effort dock sits on the composer. Spekin keeps the idea: source tag, model, effort and an estimate on the composer row, with no brand or wording.' },
          { img: 'od-studio-prototype.png', cap: '<b>OpenDesign Studio.</b> The chat composer sits under the conversation with its model control. The Spekin composer adds the source tag (HOSTED, CLI or API), the estimate and Send.' },
        ],
      },
    },
    {
      file: 'T01-tablet-phone', code: 'T01', tier: 'DEVICES', name: 'Tablet and phone: frame list, review and hand off',
      ext: 'New. The browser app below 1024 px (BW-T01, BW-M01 to BW-M03): the same project, the same routes, a different layout. Replaces free-position canvas editing with a frame list and a single-frame viewer (R-WS-4, R-CAN-8).',
      lives: 'Spekin web app · the same routes as desktop (/p/meranti-yard/design). The layout changes by width: 768 to 1023 px tablet, under 768 px phone. No separate mobile app.',
      views: [
        { id: 'tablet', label: 'Tablet board', html: t1, entry: 'Open a Meranti Yard link on a tablet (820 px wide) &gt; Design &gt; Frames.', data: 'sample/parts/models.mjs → MODELS_DEVICE_FRAMES; sample/meranti-yard.mjs → FRAMES.' },
        { id: 'tabreview', label: 'Tablet frame review', html: t2, entry: 'Tablet &gt; Frames &gt; click Review queue (the panel replaces the list) &gt; finding 1.', data: 'sample/parts/models.mjs → MODELS_FINDING.' },
        { id: 'phlist', label: 'Phone list', html: t3, entry: 'Open the link on a phone (390 px wide) &gt; Frames &gt; tap ⋯ on F-03.', data: 'sample/parts/models.mjs → MODELS_DEVICE_FRAMES.' },
        { id: 'phreview', label: 'Phone frame review', html: t4, entry: 'Phone &gt; Review tab, or Frames &gt; tap a frame &gt; Apply change.', data: 'sample/parts/models.mjs → MODELS_FINDING.' },
        { id: 'phhand', label: 'Phone hand off', html: t5, entry: 'Phone &gt; Hand off tab &gt; Prepare download.', data: 'sample/parts/models.mjs → MODELS_BUNDLE.' },
      ],
      side: {
        must: [
          'Below 1024 px the free canvas is replaced by a frame list and a single-frame viewer. Review and hand off stay fully available; canvas editing says it is on desktop.',
          'Tablet (768 to 1023 px): the list sits beside one frame. Context and review open in place of the list, never stacked beside the viewer.',
          'Phone (under 768 px): a frame list, then one frame, then sheets. Tabs for Frames, Style, Review and Hand off sit at the bottom, in thumb reach.',
          'Every target is 44 px or larger. Actions are always visible: no hover, no hold, no drag. A bottom sheet replaces a popover or a context menu.',
          'Safe areas stay clear at the top and bottom. Text is 16 px so the browser never zooms into a field.',
          'Review shows Original and Changed as a toggle, then Dismiss and Apply change always in view; Apply asks first and Cancel is the default.',
          'Hand off lists accepted revisions only, shows why a draft is left out, and builds one fixed snapshot with a ready sheet or a Retry.',
        ],
        motion: [
          ['Bottom sheet', 'Rises 220 ms ease cubic-bezier(0.23,1,0.32,1) with a scrim fade of 160 ms. It closes by Cancel, a scrim tap or a swipe down.'],
          ['Panel swap', 'On a tablet the review panel replaces the list in 200 ms spring-ui; the viewer keeps its frame and zoom.'],
          ['Frame to frame', 'The viewer cross-fades 160 ms; the list keeps its scroll position. No reload.'],
          ['Tab change', 'The bottom tab marker slides 200 ms; the page does not reload and never approves anything.'],
          ['Reduce Motion', 'Sheets and panels appear without sliding. Status stays as text, and every action stays available (R-MOT-4).'],
        ],
        stories: [
          ['F341', 'new', 'One screen, three layouts by width: desktop canvas, tablet list and frame, phone list, frame and sheet (R-WS-4, R-CAN-8).', 'PRD'],
          ['F342', 'new', 'Tablet board: frame list beside a single-frame viewer with status, revisions, Compare and Propose change (BW-T01, R-WS-4).', 'PRD'],
          ['F343', 'new', 'Context and review panel opens in place of the frame list, never stacked beside the viewer (BW-T01).', 'PRD'],
          ['F344', 'new', 'Workspace tabs Frames, Style, Review and Hand off with a review count; a tab never approves anything (BW-M01, R-WF-2).', 'PRD'],
          ['F345', 'new', 'Phone frame list: search, status filter, status pills, and import a reference with a file picker (BW-M01, R-WS-2).', 'PRD'],
          ['F346', 'new', 'Non-drag alternatives to canvas edits: a row actions sheet with Open, Move earlier, Move later, Duplicate and Compare (R-CAN-8, R-MOT-4).', 'PRD'],
          ['F347', 'new', 'Single-frame review: an Original and Changed toggle replaces hold-to-peek, with a whole-frame compare (BW-M02, R-WS-7).', 'Paraframe'],
          ['F348', 'new', 'Apply change and Dismiss always in view; a confirm sheet with Cancel as the default; a stale finding must be re-checked first (BW-M02, R-WS-7, AC-57).', 'PRD'],
          ['F350', 'new', 'Phone hand off: accepted revisions only; drafts and pending alternatives are disabled with the reason (BW-M03, R-WS-8, AC-58).', 'PRD'],
          ['F351', 'new', 'Prepare download with a ready sheet, or Retry of the same snapshot; the handoff is not an execution command (BW-M03, R-WS-8).', 'PRD'],
          ['F352', 'new', 'Touch rules: 44 px targets, safe areas, 16 px text, no hover-only actions, Reduce Motion honoured (R-CAN-8, R-MOT-4).', 'Momo'],
          ['F353', 'new', 'Bottom sheet with grabber and scrim in place of popovers and menus on touch (Momo drawer pattern, OpenDesign mobile layout).', 'OpenDesign'],
          ['F355', 'new', 'Compact usage chip in the app bar opens Models and usage (R-MOD-10, S36).', 'PRD'],
          ['F356', 'new', 'The eight-stage header becomes one stage chip that opens a sheet listing all stages with their status (R-WF-1, R-WF-2).', 'PRD'],
        ],
        where: '<span><b>Route:</b> the same as desktop (<code>/p/:project/:stage</code>). Width decides the layout through container queries, not the user agent. Below 768 px free-position canvas editing is not offered (R-WS-4).</span><span><b>UI (TS/React):</b> OpenDesign responsive layout (Apache-2.0, <code>e033aad</code>) for stacked panels and sheets; Momo (no licence) drawer, <code>hover:none</code> branch and safe-area insets as patterns only. Frame list, viewer, review bar and hand-off list are Spekin components over the same core calls as desktop.</span><span><b>Core (Rust):</b> the same review, revision and manifest calls as desktop. The hand-off snapshot is built once and pinned (R-WS-8).</span><span><b>Open for Enrico:</b> bottom tab bar (drawn) or top tabs as in the wireframe · whether Style is read-only on a phone · tablet landscape (drawn portrait only).</span>',
      },
      refs: {
        note: 'OpenDesign (Apache-2.0) runs at phone width by stacking its panels; Spekin goes further with a frame list and sheets. Momo (no licence) is a pattern reference only.',
        shots: [
          { img: 'od-docker-mobile.png', cap: '<b>OpenDesign at 390 px.</b> The studio stacks into one column with scrolling tabs. Spekin keeps one column but adds a bottom tab bar and sheets.' },
          { img: 'od-design-mobile.png', cap: '<b>OpenDesign.</b> A phone frame shown inside the app: the device sits in the middle with its actions above. T01 uses the same device frame with Spekin controls inside.' },
          { img: 'od-mobile-app.png', cap: '<b>OpenDesign.</b> Several phone screens side by side on one stage. T01 shows two states side by side where it helps.' },
        ],
      },
    },
  ];
}
