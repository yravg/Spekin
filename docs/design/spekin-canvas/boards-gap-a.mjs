// Gaps canvas, group A: S02 Sign-in and legal pages, S04 Interview, S05 Decision log, S06 Pitch (Simple). Owner: this file only.
// Spekin has no built screen for these (req-map 2026-11-24, verdict gap), so every story is NEW. Feature IDs F401-F439.
export const tier = 'Start: sign-in, interview, decisions and pitch';
export const order = 1;

export function boards(K) {
  const { S, ic, ib, btn, pill, note, NT, app, chatPanel, tabs, insp, row } = K;
  const D = S;
  // new-region wrapper: yellow outline + NEW tag + feature id
  const nw = (f, inner, cls = '', style = '') => `<div class="isnew gpa-nw ${cls}" data-feature="${f}"${style ? ` style="${style}"` : ''}>${NT}${inner}</div>`;
  const rb = (label, does, f, cls = '', extra = '') => `<button type="button" class="${cls}"${extra} data-does="${does}" data-feature="${f}">${label}</button>`;
  const dots = (k) => `<span class="dot ${k}"></span>`;
  const idb = (id, does, f) => rb(id, does, f, 'gpa-idb');

  // =====================================================================  S02 Sign-in and legal pages
  const lang = (en) => `<div class="sp-lang isnew gpa-nw" role="group" aria-label="Language" data-feature="F406">${NT}${rb('EN', 'Shows the screen in English; the Terms and Privacy pages stay in Bahasa and say so', 'F406', '', ` aria-pressed="${en}"`)}${rb('ID', 'Shows the screen in Bahasa Indonesia, the default', 'F406', '', ` aria-pressed="${!en}"`)}</div>`;
  const pubTop = (route, en) => `<header class="gpa-ph"><span class="sp-mark" aria-hidden="true">S</span><b class="gpa-brand">Spekin</b><span class="gpa-route">${route}</span><span class="sp-fill"></span>${btn('Syarat', { cls: 'plain', sm: true, does: 'Opens /syarat, the Terms page, in Bahasa Indonesia', f: 'F409' })}${btn('Privasi', { cls: 'plain', sm: true, does: 'Opens /privasi, the Privacy page, in Bahasa Indonesia', f: 'F409' })}${lang(en)}</header>`;
  const legalLinks = `By continuing you accept the ${rb('Syarat', 'Opens the Terms page (/syarat) in Bahasa Indonesia', 'F409', 'gpa-link')} and ${rb('Privasi', 'Opens the Privacy page (/privasi) in Bahasa Indonesia', 'F409', 'gpa-link')}. Both pages are in Bahasa Indonesia.`;
  const hero = `<div class="gpa-hero"><h1>Turn an idea into a spec your team can build from</h1><p>Answer one question at a time. Spekin writes down every decision and shapes the answers into a short pitch.</p>
<ol class="gpa-steps"><li><i>1</i><span><b>Sign in</b> with an email code or Google. No password.</span></li><li><i>2</i><span><b>Describe your idea</b> in one box and pick a domain.</span></li><li><i>3</i><span><b>Answer</b> short questions. Each has a recommended answer.</span></li></ol>
<div class="gpa-peek" aria-hidden="true"><span class="t">What you get after the interview</span><div class="r"><b>D-001</b><span>Project controls lead reads it first</span></div><div class="r"><b>D-003</b><span>Flag a package over 3% of budget</span></div><div class="r"><b>Pitch</b><span>Problem, appetite, solution, rabbit holes, no-gos</span></div></div></div>`;
  const emailField = (filled) => `<div class="gpa-fl"><span class="l">Email</span><div class="gpa-in${filled ? ' focus' : ''}" role="textbox" aria-label="Email address">${filled ? `<span>${D.GAPA_USER.email}</span>` : '<span class="ph">name@company.com</span>'}</div><span class="gpa-hint">We send one code. It works for 10 minutes.</span></div>`;
  const googleBtn = (again) => btn(again ? 'Try Google again' : 'Continue with Google', { icon: 'globe', does: 'Hands off to Google sign-in; on return the same account is used as the email code for that address', f: 'F404' });
  const signCard = (again, filled, banner = '') => nw('F401', `<div><h2>Sign in</h2><p class="gpa-sub">No password. We email you a six-digit code, or you can continue with Google.</p></div>${banner}${emailField(filled)}
${btn('Send me a code', { cls: 'ink', does: 'Sends a six-digit code to the email address and opens the code step; an invalid address shows a message under the field and sends nothing', f: 'F402' })}
<div class="gpa-or">or</div>${googleBtn(again)}<p class="gpa-fine">${legalLinks}</p>`, 'gpa-card');
  const codeBoxes = (err) => `<div class="gpa-otp${err ? ' err' : ''}" role="group" aria-label="Six-digit code">${(err ? ['4', '8', '1', '9', '0', '2'] : D.GAPA_USER.code).map((c, i) => `<span class="${!err && i === 3 ? 'on' : ''}">${c}</span>`).join('')}</div>`;
  const codeCard = (err) => nw('F403', `<div><h2>Check your email</h2><p class="gpa-sub">We sent a six-digit code to <b>${D.GAPA_USER.email}</b>. Type it here or paste it.</p></div>${codeBoxes(err)}
${err ? `<span class="gpa-hint err">${ic('alert', 14)}<span>That code is not right. ${D.GAPA_USER.left} tries left, then we send a new one.</span></span>` : `<span class="gpa-hint">The code works for 10 minutes. Check spam if it does not arrive.</span>`}
${btn('Sign in', { cls: 'ink', does: 'Checks the six digits with the server; on success opens the app, on failure keeps the boxes and shows the message', f: 'F403' })}
${rb(`Send a new code${err ? '' : ' in ' + D.GAPA_USER.resend}`, 'Sends a fresh code and voids the old one; the button waits for the countdown', 'F403', 'gpa-link')}
${btn('Use another email', { cls: 'plain', sm: true, does: 'Goes back to the email step without sending anything', f: 'F402' })}
${err ? `<p class="gpa-fine">${nw('F405', 'We never say whether an email already has an account. The same message shows either way.', 'gpa-bn warn')}</p>` : ''}`, 'gpa-card');
  const googleBanner = nw('F405', `${ic('alert', 16)}<p><b>Google sign-in was cancelled.</b> Nothing changed and no account was made. Try Google again or use the email code.</p>`, 'gpa-bn warn');

  const legalToc = (cur, items) => `<nav class="gpa-toc" aria-label="On this page"><span class="t">On this page</span>${items.map((t, i) => `<button type="button" ${i === cur ? 'aria-current="true" ' : ''}data-does="Jumps to ${t} on this page" data-feature="F407">${t}</button>`).join('')}</nav>`;
  const legalSide = (which) => `<aside class="gpa-side">${nw('F409', `<h4>Dua halaman hukum</h4><p>Kedua halaman bisa dibuka tanpa masuk.</p>${btn('Syarat Penggunaan', { cls: which === 'terms' ? 'ink' : 'ghost', sm: true, does: 'Opens the Terms page (/syarat)', f: 'F409' })}${btn('Kebijakan Privasi', { cls: which === 'privacy' ? 'ink' : 'ghost', sm: true, does: 'Opens the Privacy page (/privasi)', f: 'F409' })}`, 'gpa-sc')}
<div class="gpa-sc"><h4>English</h4><p>At launch both pages are in Bahasa Indonesia only. An English text follows later.</p>${btn('Read in English', { sm: true, later: 'English text of Terms and Privacy follows the Bahasa launch' })}</div>
<div class="gpa-sc"><h4>Back to sign-in</h4>${btn('Kembali ke masuk', { sm: true, cls: 'plain', does: 'Returns to the sign-in screen', f: 'F401' })}</div></aside>`;
  const T = D.GAPA_TERMS, P = D.GAPA_PRIVACY;
  const termsPage = nw('F407', `<h1>${T.title}</h1><div class="meta">${pill(['ok', 'Bahasa Indonesia'])}<span>${T.since}</span><span>·</span><span>Teks contoh, belum ditinjau hukum</span></div>${T.items.map(([h, p], i) => `<section><span class="n">${String(i + 1).padStart(2, '0')}</span><h3>${h}</h3><p>${p}</p></section>`).join('')}`, 'gpa-art');
  const privacyPage = (en) => nw('F408', `<h1>${P.title}</h1><div class="meta">${pill(['ok', 'Bahasa Indonesia'])}<span>${P.since}</span><span>·</span><span>Teks contoh, belum ditinjau hukum</span></div>
${en ? `<div class="gpa-bn warn">${ic('alert', 16)}<p><b>English text is not available yet.</b> This page stays in Bahasa Indonesia at launch.</p></div>` : ''}
<section><span class="n">01</span><h3>Data yang kami simpan</h3><p>Kami hanya menyimpan data yang dibutuhkan untuk menjalankan Spekin.</p></section>
<table class="sp-tbl"><thead><tr><th>Data</th><th>Tujuan</th><th style="width:150px">Lama simpan</th></tr></thead><tbody>${P.rows.map(([a, b, c]) => `<tr><td><b>${a}</b></td><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody></table>
<section><span class="n">02</span><h3>Hak Anda</h3><p>Anda dapat meminta unduhan atau penghapusan data kapan saja. Kirim permintaan ke halo@spekin.example (contoh).</p></section>
<section><span class="n">03</span><h3>Pihak lain</h3><p>Kami tidak menjual data Anda. Penyedia model hanya menerima konteks yang Anda lihat di daftar konteks sebelum Anda menekan Kirim.</p></section>`, 'gpa-art');
  const NS = {
    hero: note('<b>Email first</b>: the six-digit code is the main path. Google is the second button, not a separate product, and both end in the same account.', 'left:72px;top:690px;max-width:420px'),
    card: note('<b>Send me a code</b>: a bad address shows a message under the field and sends nothing. A good one moves this card to the code step in place.', 'left:928px;top:665px;max-width:440px'),
    links: note('<b>Syarat and Privasi</b> sit in the card and in the top bar. They open real pages, never a 404, signed in or not.', 'left:928px;top:745px;max-width:440px'),
    otp: note('<b>Type or paste</b>: six boxes, paste fills all of them, focus moves on its own. After 3 wrong tries the code is voided and a new one is sent.', 'left:928px;top:665px;max-width:440px'),
    resend: note('<b>Resend countdown</b>: the link is text until 0:00, then it sends a fresh code and voids the old one. No spinner.', 'left:520px;top:690px;max-width:340px'),
    wrong: note('<b>Wrong code</b>: boxes turn red, the count of tries left shows, and the message is the same whether or not the email has an account.', 'left:928px;top:690px;max-width:440px'),
    wrong2: note('<b>Paste a new code</b>: the boxes clear and take focus again; nothing about the old attempt is kept on screen.', 'left:520px;top:690px;max-width:340px'),
    google: note('<b>Cancel in Google</b>: you land back here with this banner. No account is made and no data is sent to Spekin.', 'left:928px;top:740px;max-width:440px'),
    google2: note('<b>Try Google again</b> re-opens the same hand-off; the email code stays one tap away.', 'left:520px;top:690px;max-width:340px'),
    terms: note('<b>/syarat is public</b>: it opens without signing in and shows the date it applies from. Language switch EN still shows Bahasa.', 'left:72px;top:520px;max-width:230px'),
    terms2: note('<b>Contents list</b> jumps to a section and keeps your place; the page is plain text so it prints and reads aloud cleanly.', 'left:1150px;top:560px;max-width:230px'),
    priv: note('<b>EN selected, Bahasa shown</b>: the page does not translate by itself. It says so in one line and keeps the Bahasa text.', 'left:72px;top:520px;max-width:230px'),
    priv2: note('<b>Data table</b>: what is kept, why, and for how long, in the user’s own language.', 'left:1150px;top:560px;max-width:230px'),
  };
  const sign = (extra) => `<div class="gpa-pub">${pubTop('spekin.example/masuk', true)}<div class="gpa-pb">${hero}${extra}</div></div>`;
  const vSign = sign(signCard(false, true)) + NS.hero + NS.card + NS.links;
  const vCode = sign(codeCard(false)) + NS.hero + NS.otp + NS.resend;
  const vWrong = sign(codeCard(true)) + NS.hero + NS.wrong + NS.wrong2;
  const vGoogle = sign(signCard(true, false, googleBanner)) + NS.hero + NS.google + NS.google2;
  const vTerms = `<div class="gpa-pub">${pubTop('spekin.example/syarat', false)}<div class="gpa-legal">${legalToc(0, T.items.map((x) => x[0]))}${termsPage}${legalSide('terms')}</div></div>` + NS.terms + NS.terms2;
  const vPrivacy = `<div class="gpa-pub">${pubTop('spekin.example/privasi', true)}<div class="gpa-legal">${legalToc(0, ['Data yang kami simpan', 'Hak Anda', 'Pihak lain'])}${privacyPage(true)}${legalSide('privacy')}</div></div>` + NS.priv + NS.priv2;

  const S02 = {
    file: 'S02-sign-in', code: 'S02', tier: 'START', name: 'Sign-in and legal pages',
    ext: 'New. Spekin has no auth or public route yet (req-map: no sign-in route, no /syarat or /privasi). Follows the PRD screen S02 (email code first, Google second) and its yravg UI parts: text-input, otp-input, button.',
    lives: 'Spekin web app · public routes /masuk, /syarat and /privasi (names TO CONFIRM, AC-43). No project, no draft text and no keys are involved.',
    views: [
      { id: 'signin', label: 'Sign in', html: vSign, entry: 'Landing > Mulai.', data: 'sample/parts/gap-a.mjs → GAPA_USER.' },
      { id: 'code', label: 'Email code', html: vCode, entry: 'Sign in > type an email > Send me a code.', data: 'sample/parts/gap-a.mjs → GAPA_USER (code, resend).' },
      { id: 'wrong', label: 'Wrong code', html: vWrong, entry: 'Email code > type six digits that do not match > Sign in.', data: 'sample/parts/gap-a.mjs → GAPA_USER (tries left).' },
      { id: 'google', label: 'Google cancelled', html: vGoogle, entry: 'Sign in > Continue with Google > cancel on the Google page.', data: 'sample/parts/gap-a.mjs → GAPA_USER.' },
      { id: 'terms', label: 'Syarat (Terms)', html: vTerms, entry: 'Sign in > footer link Syarat.', data: 'sample/parts/gap-a.mjs → GAPA_TERMS.' },
      { id: 'privacy', label: 'Privasi (Privacy)', html: vPrivacy, entry: 'Sign in > footer link Privasi; then switch EN.', data: 'sample/parts/gap-a.mjs → GAPA_PRIVACY.' },
    ],
    side: {
      must: [
        'Sign-in offers the email code first and Google second. Both are on one card and both reach the same account for the same address.',
        'No password is ever set. The email step asks for one address and nothing else.',
        'Code entry: six boxes, paste fills all, a resend countdown, and a limit of 3 wrong tries before the code is voided.',
        'Errors say what happened and what to do next. They never reveal whether an email already has an account.',
        'Syarat and Privasi are linked in the top bar and in the sign-in card, and open real pages in Bahasa Indonesia, never a 404.',
        'At launch the legal pages are Bahasa only. With EN selected a one-line notice says so; the text is not machine translated.',
        'The language switch (EN, ID) is on every public screen. Bahasa Indonesia is the default.',
      ],
      motion: [
        ['Card step', 'Email step swaps to the code step in place: 160 ms cross-fade with a 4 px slide (spring-ui).'],
        ['Code boxes', 'Focus ring 120 ms. A wrong code shakes the boxes 2 px three times inside 240 ms.'],
        ['Resend', 'The countdown is text that ticks once a second. No spinner without a real progress value.'],
        ['Google hand-off', 'The button text changes to “Waiting for Google” with a 140 ms fade.'],
        ['Legal pages', 'The contents list scrolls the page 200 ms and keeps the current item underlined.'],
        ['Reduce Motion', 'All swaps are instant and the shake is replaced by the red boxes and the message.'],
      ],
      stories: [
        ['F401', 'new', 'Sign-in card: email code first, Google second, one account per address, no password (R-ONB-9, AC-8).', 'PRD'],
        ['F402', 'new', 'Email step: validates the address, sends one six-digit code, says how long it lasts (R-ONB-9).', 'PRD'],
        ['F403', 'new', 'Code step: six boxes with paste, resend countdown, 3 tries, then a new code (R-ONB-9).', 'PRD'],
        ['F404', 'new', 'Google sign-in hand-off and return, same account as the email code (R-ONB-9, AC-8).', 'PRD'],
        ['F405', 'new', 'Plain error messages: wrong or expired code, cancelled Google; never reveals whether an email has an account (R-ONB-9).', 'PRD'],
        ['F406', 'new', 'Language switch EN and ID on every public screen, Bahasa Indonesia by default (R-LANG-4).', 'PRD'],
        ['F407', 'new', 'Terms page /syarat in Bahasa Indonesia with a contents list and an effective date (R-LANG-4, AC-43).', 'PRD'],
        ['F408', 'new', 'Privacy page /privasi in Bahasa Indonesia with a what, why and how-long table, and a notice when EN is selected (R-LANG-4, AC-43).', 'PRD'],
        ['F409', 'new', 'Syarat and Privasi linked from the top bar and the sign-in card on every public screen; both always open (R-LANG-4).', 'PRD'],
      ],
      where: '<span><b>Route:</b> <code>/masuk</code>, <code>/syarat</code>, <code>/privasi</code>. The route names are TO CONFIRM (AC-43). The legal pages need no session.</span><span><b>UI (TS/React):</b> yravg UI <code>text-input</code>, <code>otp-input</code>, <code>button</code> as the PRD maps S02. No OpenDesign code is reused here.</span><span><b>Auth:</b> Better Auth with email code and Google, not Google only (PRD 6.1). The server owns code expiry (10 minutes), the tries limit and rate limits; the screen only shows state.</span><span><b>Open for Enrico:</b> legal review of the Bahasa text · the English text date · route names · whether the landing page links the same two pages.</span>',
    },
  };

  // =====================================================================  S04 Interview
  const Q = D.GAPA_Q5, A = D.GAPA_ANSWERED, SK = D.GAPA_SKIPPED;
  const seg = (marks) => `<span class="gpa-seg12" aria-hidden="true">${marks.map((m) => `<i class="${m}"></i>`).join('')}</span>`;
  const ivHead = (label, marks, idea = D.GAPA_IDEA) => `<header class="gpa-ih"><span class="sp-mark" aria-hidden="true">S</span><b class="gpa-brand">New project</b><span class="gpa-idea" title="${idea}">${idea}</span><span class="sp-fill"></span>${nw('F412', `<span class="c">${label}</span>${seg(marks)}`, 'gpa-prog')}${btn('Cukup, buat pitch', { cls: 'ink', does: 'Opens a confirmation that lists the pitch fields still empty, then proposes the pitch from what is decided', f: 'F415' })}<span class="sp-av" aria-label="${D.PROJECT.user}">${D.PROJECT.initials}</span></header>`;
  const doneRow = ([id, q, a, d]) => `<div class="gpa-done">${dots('ok')}<span class="id">${id}</span><span class="q">${q}</span><b>${a}</b>${idb(d, `Opens the decision log (S05) at ${d}`, 'F419')}</div>`;
  const skipRow = (fresh) => `<div class="gpa-done skipped">${dots('warn')}<span class="id">${SK[0]}</span><span class="q">${SK[1]}</span><b>${fresh ? 'Skipped just now' : 'Skipped'}</b>${idb('OQ-01', 'Opens the open question OQ-01 in the spec document, section 2', 'F413')}</div>`;
  const hist = (compact) => compact
    ? `<div class="gpa-done">${dots('ok')}<span class="id">Q-01</span><span class="q">3 decided and 1 skipped so far</span>${idb('D-001', 'Opens the decision log (S05) at D-001', 'F419')}${idb('D-003', 'Opens the decision log (S05) at D-003', 'F419')}${idb('OQ-01', 'Opens the open question OQ-01 in the spec document, section 2', 'F413')}</div>`
    : A.map(doneRow).join('') + skipRow(false);
  const intro = `<div class="sp-ub">${D.GAPA_IDEA}</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · interview</em></div><p>I will ask one question at a time. Each has a recommended answer you can accept, edit or skip. I stop after 12 questions or when you press Cukup, buat pitch.</p></div>`;
  const qCard = (extra = '', n = Q.n, label = `Question ${Q.n} of 12 at most`, text = Q.text, rec = Q.rec, alts = Q.alts, foot = 'Accepting writes the decision to the log.') => nw('F411', `<div class="k">${label}<span class="sp-fill"></span>${pill(['mute', 'One question at a time'])}</div><h3>${text}</h3>
<div class="gpa-rec"><div class="t">${ic('spark', 12)}Recommended answer<span class="sp-fill"></span>${rb('Why this?', 'Opens the plain-language explanation of this recommendation, read from accepted artifacts, with no model call', 'F417', 'gpa-idb')}</div><p>${rec}</p></div>
<div class="gpa-alts">Other answers: ${alts.map((a) => rb(a, `Uses “${a}” as the answer instead of the recommendation`, 'F411', 'gpa-ch')).join('')}</div>${extra}
<div class="gpa-acts">${btn('Accept', { cls: 'ink', icon: 'check', does: 'Accepts the recommended answer in one tap and writes a decision-log entry with the question id, the answer, the alternatives and the time', f: 'F411' })}${btn('Edit', { does: 'Puts the recommendation in the box so you can change it before it is written', f: 'F411' })}${btn('Skip', { cls: 'plain', does: 'Skips the question and records it as an open question in the spec document; nothing is approved', f: 'F413' })}<span class="sp-fill"></span><span class="gpa-hint">${foot}</span></div>`, 'gpa-q');
  const comp = `<div class="gpa-comp"><span class="ph">Or type your own answer, or ask a question back…</span>${ib('clip', 'Attach a file', { does: 'Attaches a file or link as evidence for the answer; nothing is read until you send', sm: true, f: 'F411' })}${ib('up', 'Send', { does: 'Sends your own answer to the current question', sm: true, f: 'F411' })}</div>`;
  const fldRows = D.GAPA_PITCH_FIELDS.map(([n, k, t]) => `<div class="gpa-fld">${dots(k)}<span><b>${n}</b><small>${t}</small></span>${pill([k === 'ok' ? 'ok' : k === 'half' ? 'warn' : 'mute', k === 'ok' ? 'Filled' : k === 'half' ? 'Part' : 'Empty'])}</div>`).join('');
  const sideAsk = `<aside class="gpa-sidecol">${nw('F412', `<h4>Pitch so far<span>2 of 5 filled</span></h4>${fldRows}`, 'gpa-pc')}
${nw('F419', `<h4>Decision log<span>3 decisions · 1 open</span></h4><div class="gpa-acts">${btn('Open log', { sm: true, icon: 'list', does: 'Opens the decision log (S05) beside the interview', f: 'F419' })}${btn('Open questions', { sm: true, cls: 'plain', does: 'Opens the open questions in the spec document, section 2', f: 'F413' })}</div>`, 'gpa-pc')}
<div class="gpa-pc"><h4>The interview stops when</h4><div class="gpa-need">${dots('ring')}<span>All five pitch fields are filled</span><span></span></div><div class="gpa-need">${dots('ring')}<span>You press Cukup, buat pitch</span><span></span></div><div class="gpa-need">${dots('ring')}<span>12 questions have been asked</span><span></span></div></div></aside>`;
  const iv = (head, thread, side, scrim = '') => `<div class="gpa-iv">${head}<div class="gpa-ivb"><section class="gpa-chatcol" aria-label="Interview"><div class="gpa-th">${thread}</div>${comp}${scrim}</section>${side}</div></div>`;
  const marksAsk = ['on', 'on', 'on', 'skip', 'cur', '', '', '', '', '', '', ''];

  const vAsk = iv(ivHead('Question 5 of 12', marksAsk), intro + hist(false) + qCard(), sideAsk);
  const vSkip = iv(ivHead('Question 5 of 12', ['on', 'on', 'on', 'skip', 'cur', '', '', '', '', '', '', '']), intro + A.map(doneRow).join('') + skipRow(true)
    + nw('F413', `${ic('check', 16)}<p><b>Saved as open question OQ-01</b> in the spec document, section 2: “${SK[1]}”. Skipping is not approval. The question stays open until you answer it.</p>${btn('Answer now', { sm: true, cls: 'ink', does: 'Brings Q-04 back as the current question', f: 'F413' })}${btn('Undo skip', { sm: true, cls: 'plain', does: 'Reverses the skip and removes OQ-01 from the spec', f: 'F413' })}`, 'gpa-bn ok')
    + `<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>next question</em></div><p>Moving on. Next is question 5.</p></div>`, sideAsk.replace('3 decisions · 1 open', '3 decisions · 1 open (new)'));
  const grounded = nw('F414', `<div class="k" style="font:600 11px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--ink-dim)">Read before asking · increment 2</div>${D.GAPA_GROUND.map(([k, n, r, kind, tone, t]) => `<div class="gpa-ev">${ic(k, 14)}<span><b>${n}</b><span class="r">${r}</span></span>${pill([tone, kind])}<p>${t}</p></div>`).join('')}`, 'gpa-pc', 'width:720px');
  const gQ = qCard('', 2, 'Question 2 of 12 at most', 'The spec says the alert drawer is read-only, but you asked to edit thresholds there. Which one is right?', 'Keep it read-only now and plan threshold editing as its own increment.', ['Make the drawer editable now', 'Drop threshold editing'], 'Accepting changes the plan only. A change to the accepted spec opens review in S08.');
  const needs = [['User problem', 'ok', 'Alerts before month end'], ['Non-goals', 'half', 'Editing thresholds unclear'], ['Alternatives', 'ring', 'Not asked yet'], ['Failure cases', 'ring', 'Not asked yet'], ['Acceptance evidence', 'ring', 'Not asked yet']];
  const sideGround = `<aside class="gpa-sidecol">${nw('F412', `<h4>What Spekin still needs<span>1 of 5</span></h4>${needs.map(([n, k, t]) => `<div class="gpa-fld">${dots(k)}<span><b>${n}</b><small>${t}</small></span>${pill([k === 'ok' ? 'ok' : k === 'half' ? 'warn' : 'mute', k === 'ok' ? 'Done' : k === 'half' ? 'Part' : 'Open'])}</div>`).join('')}`, 'gpa-pc')}
${nw('F418', `<h4>Reviews and outside actions</h4><p class="gpa-hint">Changing an accepted spec needs your review in S08. Anything outside Spekin, such as sending an email, needs a separate OK. Skipping or stopping approves neither.</p>${btn('Open S08 review', { sm: true, does: 'Opens S08 review with the pending canonical changes; none are accepted by the interview', f: 'F418' })}`, 'gpa-pc')}</aside>`;
  const vGround = iv(ivHead('Increment 2 · question 2 of 12', ['on', 'cur', '', '', '', '', '', '', '', '', '', ''], 'Add feature: alerts when a package goes over its threshold'), `<div class="sp-ub">Add alerts when a package goes over its threshold.</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · interview</em></div><p>Before I ask, I read what you already have. Here is what I found, and what kind of evidence each item is.</p></div>` + grounded + gQ, sideGround);
  const W = D.GAPA_WHY;
  const whyCard = nw('F417', `<h5>In plain words</h5><p>${W.plain}</p><h5>Evidence</h5><div class="gpa-src">${W.evidence.map((e) => rb(e, `Opens ${e.split(':')[0]} in its own tab`, 'F417')).join('')}</div><h5>Trade-offs</h5><div class="gpa-tr">${W.tradeoffs.map(([a, b]) => `<b>${a}</b><span>${b}</span>`).join('')}</div>
<div class="gpa-acts">${pill(['ok', 'Read from accepted artifacts · no model call · 0 cr'])}<span class="sp-fill"></span>${btn('Deeper view', { sm: true, does: 'Expands the evidence table with the exact lines from D-003 and F-04', f: 'F417' })}${btn('Close', { sm: true, cls: 'plain', does: 'Closes the explanation; focus returns to the recommendation', f: 'F417' })}</div>`, 'gpa-why');
  const vWhy = iv(ivHead('Question 5 of 12', marksAsk), hist(true) + qCard(whyCard), sideAsk);
  const cukupRows = [['Problem', 'ok', 'Filled from Q-01'], ['Appetite', 'ok', 'Filled from Q-02'], ['Solution', 'half', 'Part: the empty state is not decided'], ['Rabbit holes', 'ring', 'Will be proposed as an open question'], ['No-gos', 'ring', 'Will be proposed as an open question']];
  const dlg = `<div class="gpa-scrim"><div class="gpa-dlg isnew gpa-nw" role="dialog" aria-label="Cukup, buat pitch" data-feature="F415">${NT}<h3>Cukup, buat pitch?</h3><p>Spekin proposes the pitch now from 3 decisions and 1 open question. You review it before anything is accepted.</p>${cukupRows.map(([n, k, t]) => `<div class="gpa-fld">${dots(k)}<span><b>${n}</b><small>${t}</small></span>${pill([k === 'ok' ? 'ok' : k === 'half' ? 'warn' : 'mute', k === 'ok' ? 'Filled' : k === 'half' ? 'Part' : 'Empty'])}</div>`).join('')}
<div class="gpa-acts">${btn('Keep asking', { does: 'Closes the dialog and returns to question 5; nothing changes', f: 'F415' })}${btn('Cukup, buat pitch', { cls: 'ink', does: 'Proposes the pitch as a Proposal with open questions for the empty fields, then opens S06 to review it', f: 'F415' })}</div></div></div>`;
  const vCukup = iv(ivHead('Question 5 of 12', marksAsk), intro + hist(false) + qCard(), sideAsk, dlg);
  const pitchCard = nw('F416', `<div class="k">${ic('doc', 12)}Pitch proposal r1<span class="tag">${pill(['acc', 'Proposal'])}</span></div><div class="tt">Variance alerts for Meranti Yard</div>${D.GAPA_PITCH.map(([n, t]) => `<div class="gpa-fld"><span></span><span><b>${n}</b><small>${t.length > 96 ? t.slice(0, 94) + '…' : t}</small></span><span></span></div>`).join('')}<div class="ft"><span class="s">Not accepted · 2 open questions stay open</span>${btn('Review pitch proposal', { sm: true, cls: 'ink', does: 'Opens S06 with the pitch proposal and its diff; accepting is a separate step', f: 'F416' })}</div>`, 'sp-gc prop', 'width:720px');
  const sideTwelve = `<aside class="gpa-sidecol">${nw('F412', `<h4>Pitch so far<span>4 of 5 filled</span></h4>${[['Problem', 'ok', 'From Q-01'], ['Appetite', 'ok', 'From Q-02'], ['Solution', 'ok', 'From Q-03, Q-05'], ['Rabbit holes', 'ok', 'From Q-09, one part open'], ['No-gos', 'ring', 'Proposed by Spekin, no decision']].map(([n, k, t]) => `<div class="gpa-fld">${dots(k)}<span><b>${n}</b><small>${t}</small></span>${pill([k === 'ok' ? 'ok' : 'mute', k === 'ok' ? 'Filled' : 'Empty'])}</div>`).join('')}`, 'gpa-pc')}
${nw('F419', `<h4>Decision log<span>9 decisions · 2 open</span></h4><div class="gpa-acts">${btn('Open log', { sm: true, icon: 'list', does: 'Opens the decision log (S05) beside the interview', f: 'F419' })}</div>`, 'gpa-pc')}
<div class="gpa-pc"><h4>The interview stops when</h4><div class="gpa-need">${dots('ok')}<span>12 questions have been asked</span>${pill(['ok', 'Reached'])}</div><div class="gpa-need">${dots('ring')}<span>All five pitch fields are filled</span><span></span></div><div class="gpa-need">${dots('ring')}<span>You press Cukup, buat pitch</span><span></span></div></div></aside>`;
  const vTwelve = iv(ivHead('Question 12 of 12', ['on', 'on', 'on', 'skip', 'on', 'on', 'on', 'on', 'on', 'on', 'skip', 'on']), hist(true) + `<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · interview</em></div><p>That was question 12, the limit for a first pitch. I stopped asking and wrote the pitch as a proposal from your 9 decisions.</p></div>` + pitchCard
    + nw('F416', `${ic('alert', 16)}<p><b>Stopping is not approval.</b> OQ-01 and OQ-02 stay on the open list and the pitch is a Proposal until you accept it.</p>`, 'gpa-bn warn', 'width:720px'), sideTwelve);
  const NI = {
    q: note('<b>Accept</b>: one tap writes D-004 to the log with the question, the answer and the other answers offered. <b>Edit</b> changes the text first.', 'left:560px;top:700px;max-width:330px'),
    rec: note('<b>One question at a time</b>: never a form. The recommendation is always shown, the other answers are one click away.', 'left:200px;top:700px;max-width:330px'),
    skip1: note('<b>Skip</b>: Q-04 becomes open question OQ-01 in the spec, section 2. The interview moves on; nothing is marked approved.', 'left:420px;top:700px;max-width:300px'),
    skip2: note('<b>Undo skip</b> is available until the next answer. After that the open question is answered from the spec.', 'left:420px;top:560px;max-width:300px'),
    ground1: note('<b>Grounded first</b>: Spekin reads the selected artifacts and revisions before asking for facts it can look up.', 'left:1110px;top:610px;max-width:300px'),
    ground2: note('<b>Evidence labels</b>: verified fact, owner report, assumption, contradiction or decision. A contradiction is asked, never resolved silently.', 'left:1110px;top:700px;max-width:300px'),
    why1: note('<b>Why this?</b> opens in place. It is read from accepted artifacts, so no model call and no credits.', 'left:1110px;top:610px;max-width:300px'),
    why2: note('<b>Plain words first</b>, then evidence, then trade-offs. The deeper view adds the exact lines; it never says a thing is accepted.', 'left:1110px;top:700px;max-width:300px'),
    cukup1: note('<b>Cukup, buat pitch</b>: stops the interview early. Empty fields turn into open questions instead of guesses.', 'left:1110px;top:620px;max-width:300px'),
    cukup2: note('<b>Keep asking</b> returns to question 5 with every answer kept.', 'left:1110px;top:710px;max-width:300px'),
    tw1: note('<b>Question 12</b>: the interview stops by itself and proposes the pitch. The user can still change it in S06.', 'left:1090px;top:700px;max-width:300px'),
    tw2: note('<b>Open items stay visible</b> on the proposal card; ending the interview never erases a blocker.', 'left:420px;top:640px;max-width:300px'),
  };
  const S04 = {
    file: 'S04-interview', code: 'S04', tier: 'START', name: 'Interview',
    ext: 'New. Spekin has no interview screen: the GenUI question card only records an intent and shows a fixed “Question 2 of 4” (req-map). Follows PRD screen S04 (agent-chat, smart-recommendation, progress-tracker) and OpenDesign chat patterns; Paraframe behaviour only, own copy.',
    lives: 'Spekin web app · /new/interview before a project exists and /p/meranti-yard/planning for an add-feature increment. The draft answer is kept locally until sent; no keys.',
    views: [
      { id: 'ask', label: 'Ask and answer', html: vAsk, entry: 'Landing > Mulai > sign in > submit domain and idea.', data: 'sample/parts/gap-a.mjs → GAPA_ANSWERED, GAPA_Q5, GAPA_PITCH_FIELDS.' },
      { id: 'skip', label: 'Skipped', html: vSkip, entry: 'Interview question 4 > Skip.', data: 'sample/parts/gap-a.mjs → GAPA_SKIPPED, GAPA_OPEN.' },
      { id: 'ground', label: 'Grounded (add feature)', html: vGround, entry: 'Projects > Meranti Yard > Planning > Add feature > describe it.', data: 'sample/parts/gap-a.mjs → GAPA_GROUND.' },
      { id: 'why', label: 'Why this answer', html: vWhy, entry: 'Interview question 5 > Why this?', data: 'sample/parts/gap-a.mjs → GAPA_WHY.' },
      { id: 'cukup', label: 'Cukup, buat pitch', html: vCukup, entry: 'Interview question 5 > Cukup, buat pitch in the top bar.', data: 'sample/parts/gap-a.mjs → GAPA_PITCH_FIELDS.' },
      { id: 'twelve', label: 'Question 12', html: vTwelve, entry: 'Interview > answer or skip until question 12.', data: 'sample/parts/gap-a.mjs → GAPA_PITCH.' },
    ],
    side: {
      must: [
        'One question at a time, never a form. Every question shows a recommended answer the user can accept in one tap, edit or skip.',
        'A progress tracker shows the question count out of 12 and which of the five pitch fields are filled, empty or partly filled.',
        'Skip records an open question in the spec document and says so. Skipping or stopping never counts as approval.',
        'For an add-feature increment Spekin reads the selected artifacts and revisions first and labels each item: verified fact, owner report, assumption, contradiction or decision.',
        'Cukup, buat pitch asks first, lists the fields still empty and what happens to them, then proposes the pitch.',
        'At question 12 the interview stops and proposes the pitch as a Proposal; unresolved blockers stay on the open list.',
        'Why this? gives a plain-language explanation with evidence and trade-offs, read from accepted artifacts with no model call.',
      ],
      motion: [
        ['Next question', 'The answered card collapses to a one-line row (180 ms) and the new card rises 8 px and fades in (240 ms, spring-ui).'],
        ['Progress', 'A segment fills over 160 ms when a question is answered; a skipped segment turns amber the same way.'],
        ['Why this?', 'The explanation opens in place, height 180 ms; focus moves to its first line and returns on Close.'],
        ['Dialog', 'Cukup, buat pitch fades the scrim in 120 ms and scales the dialog from 98%; Esc closes it.'],
        ['Streaming', 'A question streams in with a visible Stop. Cancelling keeps the answered rows and asks nothing new.'],
        ['Reduce Motion', 'All of these swap instantly. Count and state changes are still announced to screen readers.'],
      ],
      stories: [
        ['F411', 'new', 'One question at a time with a recommended answer: accept in one tap, edit, pick another, or type (R-STD-1, R-ONB-3).', 'OpenDesign'],
        ['F412', 'new', 'Progress tracker: question count out of 12 and the five pitch fields, filled, part or empty (R-ONB-6, AC-5).', 'PRD'],
        ['F413', 'new', 'Skip writes an open question into the spec document, section 2, with undo; skipping is not approval (R-ONB-5, R-STD-1, AC-4).', 'PRD'],
        ['F414', 'new', 'Grounding: reads selected artifacts and revisions first; labels verified fact, owner report, assumption, contradiction, decision (R-STD-1).', 'PRD'],
        ['F415', 'new', 'Cukup, buat pitch with a confirmation listing empty fields; empty fields become open questions (R-ONB-6, AC-5).', 'PRD'],
        ['F416', 'new', 'At 12 questions the pitch is proposed as a Proposal; blockers stay open and nothing is approved (R-ONB-6, R-STD-1).', 'PRD'],
        ['F417', 'new', 'Why this? plain-language explanation with evidence, trade-offs and a deeper view; no model call or credits (R-STD-8).', 'OpenDesign'],
        ['F418', 'new', 'Canonical changes need S08 review; outside actions need a separate OK; the interview infers neither (R-STD-1).', 'PRD'],
        ['F419', 'new', 'Decision log strip with live counts and a link to S05 beside the interview (R-STD-1, R-ONB-4).', 'PRD'],
      ],
      where: '<span><b>Route:</b> <code>/new/interview</code> for a first idea; <code>/p/:project/planning</code> for an add-feature increment. Back and Forward keep the answers and never start a paid run.</span><span><b>UI (TS/React):</b> yravg UI <code>screens/agent-chat</code>, <code>components/smart-recommendation</code> (not <code>ask-panel</code>, M4), <code>components/progress-tracker</code>, GAP-02 compact. OpenDesign <code>ChatPane</code> patterns (Apache-2.0, needs a NOTICE if code is copied).</span><span><b>Core (Rust):</b> the question order, the 12-question stop rule, open-question and decision writes, and the evidence labels (R-ARC-1). The model proposes; the core records.</span><span><b>Open for Enrico:</b> the 12-question limit is an ASSUMPTION · where the idea box and the interview split (Q-08) · whether the language switch stays in this header.</span>',
    },
    refs: {
      note: 'OpenDesign (Apache-2.0) is the pattern source for the chat and the status cards. Paraframe is behaviour only, with no copy or assets.',
      shots: [
        { img: 'od-todo-progress.png', cap: '<b>OpenDesign chat.</b> Status and progress cards inside the chat. Spekin’s question card and progress tracker follow this.' },
        { img: 'od-studio-prototype.png', cap: '<b>OpenDesign Studio.</b> Chat with a composer and attachments. Spekin keeps the composer and adds one recommended answer.' },
      ],
    },
  };

  // =====================================================================  S05 Decision log
  const LOG = D.GAPA_LOG, OPEN = D.GAPA_OPEN, KIT = D.GAPA_KIT;
  const chatLog = (msgs) => chatPanel({ title: 'Planning chat', sub: 'decision log', ctxItems: [['doc', 'Decision log', 'D-001 to D-003'], ['doc', 'Pitch', 'r1']], ctxFoot: '≈ 1.4k tokens · decisions only', ph: 'Ask about a decision…', msgs });
  const logMsgs = `<div class="sp-ub">Why did we pick 3%?</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>read from the log · 0 cr</em></div><p>D-003 (24 Nov 12:06): you accepted 3% from four answers offered. It answers Q-03 and feeds the pitch Solution.</p><div class="sp-gc"><div class="k">${ic('list', 12)}Decision<span class="tag">${pill(['ok', 'D-003'])}</span></div><div class="tt">Forecast over budget by more than 3%</div><div class="ft"><span class="s">Interview · Q-03</span>${btn('Open entry', { sm: true, does: 'Selects D-003 in the log and opens its detail', f: 'F424' })}</div></div></div>`;
  const chips = (cur, cnt) => `${[['All', cnt.all, 'all'], ['Interview', cnt.int, 'int'], ['Plan', cnt.plan, 'plan'], ['Kit', cnt.kit, 'kit'], ['Open questions', cnt.open, 'open']].map(([l, n, k]) => rb(`${l}<b>${n}</b>`, `Filters the log to ${l.toLowerCase()} entries; the count stays on the chip`, 'F423', 'gpa-fc', ` aria-pressed="${k === cur}"`)).join('')}<div class="gpa-sbox">${ic('search', 13)}<span>Search decisions</span></div>`;
  const fbar = (cur, cnt) => nw('F423', chips(cur, cnt), 'gpa-fbar');
  const altCell = (alts, pick) => `<div class="gpa-alt">${pick ? `<span class="pick">${pick}</span>` : ''}${alts.map((a) => `<span>${a}</span>`).join('')}</div>`;
  const logTable = (rows, selId, freshId) => `<table class="sp-tbl"><thead><tr><th style="width:62px">ID</th><th style="width:150px">Question</th><th>Decision</th><th style="width:210px">Alternatives offered</th><th style="width:96px">Written</th></tr></thead><tbody>${rows.map((r) => `<tr class="${r.id === selId ? 'sel' : ''}${r.id === freshId ? ' fresh' : ''}"><td>${idb(r.id, `Selects ${r.id} and opens its detail in the inspector`, 'F424')}</td><td>${r.qt}<small>${r.q}</small></td><td><b>${r.dec}</b><small>${r.how}</small></td><td>${altCell(r.alts)}</td><td>${r.at}${r.id === freshId ? `<small>${pill(['ok', 'Just written'])}</small>` : ''}</td></tr>`).join('')}</tbody></table>`;
  const mainLog = (inner, inspHtml, banner = '') => `<section class="sp-main" aria-label="Work area">${tabs([['list', 'Decision log', true], ['doc', 'Pitch r1'], ['req', 'Spec · open questions']], '')}${banner}<div class="sp-work">${inner}${inspHtml}</div></section>`;
  const secKV = (t, n, body) => `<div class="sp-sec"><h4>${t}<span>${n}</span></h4>${body}</div>`;
  const entryInsp = (r, extra = '') => insp({ title: `${r.id} ${r.field || r.kind}`, pillv: ['ok', r.how], sub: `${r.q} · ${r.by} · ${r.at}`, tabsv: [['Entry', 1], ['Sources'], ['Used by']],
    body: `${secKV('Decision', '', `<div class="sp-row"><span class="nm">${r.dec}<small>${r.qt}</small></span></div>`)}
${secKV('Alternatives offered', r.alts.length + 1, `<div class="gpa-alt" style="padding:0 4px 4px">${altCell(r.alts, r.dec)}</div>`)}
${secKV('Source note', '', `<div class="sp-row"><span class="id">${ic('doc', 14)}</span><span class="nm">${r.kind === 'Kit' ? 'Planning chat' : 'Interview chat'} · ${r.q}<small>${r.at} · ${r.by}</small></span>${btn('Open in chat', { sm: true, does: 'Scrolls the interview chat to the message that wrote this entry', f: 'F424' })}</div>`)}${extra}
<div class="sp-ready"><div class="t">Append only<span class="pill mute">Log</span></div><p>An entry is never edited. A revision adds a new entry that supersedes this one; the old one stays visible.</p>${btn('Revise this decision', { sm: true, cls: 'ink', does: 'Starts a new entry that supersedes this one after you confirm; the old entry keeps its text and time', f: 'F427' })}</div>` });
  const summaryInsp = insp({ title: 'Decision log', pillv: ['ok', '3 decisions'], sub: 'Append only · 1 open question', tabsv: [['Summary', 1], ['Sources'], ['Open']],
    body: `${secKV('By source', '3', `${row('INT', 'Interview', '3 entries · 2 accepted, 1 edited', ['ok', '3'])}${row('PLN', 'Plan', 'No plan decisions yet', ['mute', '0'])}${row('KIT', 'Design kit', 'Recorded when Detailed is generated', ['mute', '0'])}`)}
<div class="sp-ready"><div class="t">Open questions<span class="pill warn">1</span></div><p>${OPEN[0].q} “${OPEN[0].qt}” was skipped and lives in the spec, section 2.</p>${btn('Show open questions', { sm: true, cls: 'ink', does: 'Filters the log to open questions', f: 'F425' })}</div>` });
  const cnt0 = { all: 3, int: 3, plan: 0, kit: 0, open: 1 };
  const vLog = app({ stage: 'planning', save: ['ok', 'Saved 12:06'], chat: chatLog(logMsgs), main: mainLog(`<div class="gpa-dt">${nw('F421', logTable(LOG, null, 'D-003'), 'gpa-nw')}</div>`, summaryInsp, '').replace('<div class="sp-work">', `${fbar('all', cnt0)}<div class="sp-work">`) });
  const vEntry = app({ stage: 'planning', save: ['ok', 'Saved 12:06'], chat: chatLog(logMsgs), main: mainLog(`<div class="gpa-dt">${nw('F421', logTable(LOG, 'D-002', null), 'gpa-nw')}</div>`, entryInsp(LOG[1], `${secKV('Used by', '1', row('Pitch', 'Appetite', 'Proposal r1', ['acc', 'Proposed']))}`)).replace('<div class="sp-work">', `${fbar('all', cnt0)}<div class="sp-work">`) });
  const cnt1 = { all: 4, int: 3, plan: 1, kit: 1, open: 1 };
  const kitRow = { ...KIT, field: 'Design kit' };
  const kitBan = nw('F426', `${ic('check', 16)}<p><b>Kit recorded.</b> When the Detailed layer was generated, Spekin wrote the design kit as a plan decision with its own entry, D-004.</p>`, 'gpa-bn ok');
  const vKit = app({ stage: 'planning', save: ['ok', 'Saved 14:20'], chat: chatLog(`<div class="sp-ub">Which kit did the plan pick?</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>read from the log · 0 cr</em></div><p>yravg UI, the default. It is recorded as D-004, a plan decision, when the Detailed layer is generated.</p></div>`),
    main: mainLog(`<div class="gpa-dt">${kitBan}${nw('F421', logTable([kitRow, ...LOG.slice(0, 0)], 'D-004', null).replace('Alternatives offered', 'Alternatives offered'), 'gpa-nw')}</div>`, entryInsp(kitRow, `${secKV('Plan', '1', row('PLAN-01', 'Design kit', 'Used by DESIGN.md r1 and tokens.json', ['ok', 'Active']))}<div class="sp-ready"><div class="t">Change the kit<span class="pill acc">Proposal</span></div><p>A different kit is proposed, diffed and accepted in S08. D-004 stays in the log.</p>${btn('Propose another kit', { sm: true, does: 'Opens a proposal to change the kit; accepting it writes a new entry that supersedes D-004', f: 'F426' })}</div>`)).replace('<div class="sp-work">', `${fbar('kit', cnt1)}<div class="sp-work">`) });
  const openTable = `<table class="sp-tbl"><thead><tr><th style="width:62px">ID</th><th>Question</th><th style="width:120px">Skipped</th><th style="width:170px">Lives in</th><th style="width:110px"></th></tr></thead><tbody>${OPEN.map((o) => `<tr><td>${idb(o.id, `Opens ${o.id} in the spec document, section 2`, 'F425')}</td><td><b>${o.qt}</b><small>${o.q}</small></td><td>${o.at}</td><td>${o.where}</td><td>${btn('Answer now', { sm: true, cls: 'ink', does: 'Brings the question back into the interview chat as the current question', f: 'F425' })}</td></tr>`).join('')}</tbody></table>`;
  const NB = D.GAPA_NOBASIS;
  const openInsp = insp({ title: 'Open and unbased', pillv: ['warn', '2 to look at'], sub: 'Spec statements that no decision backs', tabsv: [['Open', 1], ['No basis'], ['Sources']],
    body: `${secKV('No basis (tanpa dasar)', '1', `<div class="sp-gc"><div class="k">${ic('alert', 12)}Tanpa dasar<span class="tag">${pill(['warn', 'Confirm'])}</span></div><div class="tt">${NB.text}</div><div class="bd">${NB.where}. ${NB.note}</div><div class="ft">${btn('Confirm as decision', { sm: true, cls: 'ink', does: 'Writes a decision-log entry for this statement after you confirm it', f: 'F429' })}${btn('Remove', { sm: true, cls: 'plain', does: 'Proposes removing the statement from the spec; it goes to review in S08', f: 'F429' })}</div></div>`)}
${secKV('Open questions', '1', row('OQ-01', 'Actual costs source', 'Skipped at Q-04', ['warn', 'Open']))}` });
  const vOpen = app({ stage: 'planning', save: ['ok', 'Saved 14:20'], chat: chatLog(`<div class="sp-ub">What is still open?</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>read from the log · 0 cr</em></div><p>One skipped question, OQ-01, and one statement in the Detailed layer that has no decision behind it.</p></div>`),
    main: mainLog(`<div class="gpa-dt">${nw('F425', openTable, 'gpa-nw')}</div>`, openInsp).replace('<div class="sp-work">', `${fbar('open', cnt1)}<div class="sp-work">`) });
  const emptyBody = `<div class="gpa-empty">${nw('F428', `${ic('list', 28)}<h3>No decisions yet</h3><p>Every answer you accept in the interview is written here with the question, the other answers offered and the time.</p>${btn('Start the interview', { cls: 'ink', does: 'Opens the interview at question 1 for this project', f: 'F428' })}`, 'gpa-nw', 'display:flex;flex-direction:column;align-items:center;gap:10px;padding:26px 30px')}</div>`;
  const vEmpty = app({ stage: 'planning', save: ['ok', 'Saved 12:00'], chat: chatLog(`<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>planning</em></div><p>No interview yet, so the log is empty. Start the interview and each answer shows up here.</p></div>`),
    main: `<section class="sp-main" aria-label="Work area">${tabs([['list', 'Decision log', true]], '')}${fbar('all', { all: 0, int: 0, plan: 0, kit: 0, open: 0 })}${emptyBody}</section>` });
  const NL = {
    fresh: note('<b>Accept in the interview</b>: the new row appears here with a green tint for 4 seconds and the chip says Just written.', 'left:420px;top:600px;max-width:300px'),
    filt: note('<b>Filter chips</b> keep their counts, so you see what a filter hides. Search matches the question and the decision.', 'left:420px;top:700px;max-width:300px'),
    sel: note('<b>Click an ID</b>: the inspector shows the answer picked, the answers offered and who wrote it, with a link back to the chat message.', 'left:420px;top:620px;max-width:300px'),
    rev: note('<b>Revise</b> never edits an entry. It adds a new one that supersedes this, so the history stays true.', 'left:420px;top:720px;max-width:300px'),
    kit: note('<b>Detailed generated</b>: Spekin writes the kit as a plan decision on its own, so the choice is traceable.', 'left:420px;top:620px;max-width:300px'),
    kit2: note('<b>Propose another kit</b>: opens a proposal, not a switch. The old kit entry stays in the log.', 'left:420px;top:720px;max-width:300px'),
    open: note('<b>Answer now</b> pulls the skipped question back into the chat as the current one.', 'left:420px;top:400px;max-width:300px'),
    open2: note('<b>Tanpa dasar</b>: a spec statement with no decision or source is flagged. Confirm writes a decision; Remove goes to review.', 'left:420px;top:520px;max-width:300px'),
    empty: note('<b>New project</b>: the log is empty and says how it fills. No sample rows are shown.', 'left:420px;top:680px;max-width:300px'),
    empty2: note('<b>Start the interview</b> opens S04 at question 1.', 'left:420px;top:760px;max-width:300px'),
  };
  const S05 = {
    file: 'S05-decision-log', code: 'S05', tier: 'START', name: 'Decision log',
    ext: 'New. Spekin has no decision-log model: Answer and Skip on the GenUI question card only record an intent (req-map). Follows PRD screen S05 (data-table, filter-chips, source-note) inside the S35 shell.',
    lives: 'Spekin web app · /p/meranti-yard/planning, tab Decision log. Entries are project data; no draft text, keys or provider messages are stored in them.',
    views: [
      { id: 'log', label: 'Decision log', html: vLog, entry: 'Interview > Accept on question 3, then Projects > Meranti Yard > Planning > Decision log.', data: 'sample/parts/gap-a.mjs → GAPA_LOG, GAPA_OPEN.' },
      { id: 'entry', label: 'Entry detail', html: vEntry, entry: 'Decision log > click D-002.', data: 'sample/parts/gap-a.mjs → GAPA_LOG (D-002).' },
      { id: 'kit', label: 'Kit decision', html: vKit, entry: 'Planning > Generate Detailed > Decision log > filter Kit.', data: 'sample/parts/gap-a.mjs → GAPA_KIT.' },
      { id: 'open', label: 'Open questions', html: vOpen, entry: 'Decision log > filter Open questions.', data: 'sample/parts/gap-a.mjs → GAPA_OPEN, GAPA_NOBASIS.' },
      { id: 'empty', label: 'Empty', html: vEmpty, entry: 'Projects > New project > Planning > Decision log, before the interview.', data: 'No rows; sample/parts/gap-a.mjs → GAPA_LOG is not read.' },
    ],
    side: {
      must: [
        'Every answer or accepted recommendation writes one entry with the question id, the decision, the alternatives offered and a timestamp.',
        'The table shows ID, question, decision, alternatives offered and when it was written. The newest entry is marked Just written.',
        'Filter chips (All, Interview, Plan, Kit, Open questions) keep their counts. Search covers questions and decisions.',
        'An entry opens in the inspector with the answer picked, the answers offered, who wrote it and a link to the source message.',
        'The log is append only. A revision adds a new entry that supersedes the old one; nothing is edited or deleted.',
        'The chosen design kit (yravg UI by default) is written as a plan decision with its own entry, and changing it is a proposal.',
        'Skipped questions show as open questions; spec statements with no decision or source are flagged “tanpa dasar”.',
      ],
      motion: [
        ['New row', 'Slides in 8 px and fades in 240 ms (spring-ui); the green tint fades out after 4 s.'],
        ['Filter', 'Rows cross-fade 120 ms; chip counts do not change on filter.'],
        ['Inspector', 'Switching entries swaps the content in 140 ms; the table keeps its scroll.'],
        ['Revise', 'The old row dims to 60% over 160 ms and the new row appears above it.'],
        ['Reduce Motion', 'Rows and the inspector swap instantly; the Just written chip stays as text.'],
      ],
      stories: [
        ['F421', 'new', 'Decision table: ID, question, decision, alternatives offered and time for each entry (R-ONB-4, AC-4).', 'PRD'],
        ['F422', 'new', 'An entry is written the moment an answer or recommendation is accepted, shown as Just written (R-ONB-4).', 'PRD'],
        ['F423', 'new', 'Filter chips with counts (All, Interview, Plan, Kit, Open questions) and search (R-ONB-4).', 'PRD'],
        ['F424', 'new', 'Entry detail: answer picked, alternatives offered, who and when, and a source note linking to the chat message (R-ONB-4).', 'PRD'],
        ['F425', 'new', 'Open questions view for skipped questions, with Answer now back into the interview (R-ONB-4, R-ONB-5).', 'PRD'],
        ['F426', 'new', 'The chosen design kit is recorded as a plan decision with a log entry; changing it is a proposal (R-DS-2, AC-25).', 'PRD'],
        ['F427', 'new', 'Append only: a revision adds an entry that supersedes the old one, which stays visible (R-ONB-4).', 'PRD'],
        ['F428', 'new', 'Empty state before the interview: says how the log fills and links to the interview (R-ONB-4).', 'PRD'],
        ['F429', 'new', 'Tanpa dasar: spec statements with no decision or source are flagged to confirm or remove (R-ONB-4, PRD 6.1).', 'PRD'],
      ],
      where: '<span><b>Route:</b> <code>/p/:project/planning</code>, tab Decision log; an entry in the query (<code>?d=D-002</code>). Never carries answer text in the URL.</span><span><b>UI (TS/React):</b> yravg UI <code>components/data-table</code>, <code>filter-chips</code>, <code>source-note</code> (PRD mapping S05, GAP-05 closed).</span><span><b>Core (Rust):</b> the log model (question id, decision, alternatives, by, time, supersedes), append-only writes and the kit entry (R-ARC-1). Today there is no log model in <code>crates</code>.</span><span><b>Open for Enrico:</b> whether Plan decisions beyond the kit also land here · export of the log (see S25) · retention when a project is deleted.</span>',
    },
  };

  // =====================================================================  S06 Pitch (Simple)
  const PIT = D.GAPA_PITCH, SL = D.GAPA_SLICES;
  const srcs = (ids) => ids.length ? `<div class="gpa-src">${ids.map((i) => rb(i, `Opens ${i} in the decision log (S05)`, 'F431')).join('')}</div>` : '';
  const field = (f, add) => `<div class="gpa-pf${add ? ' add' : ''}"><h4>${f[0]}</h4><div><p>${f[1]}</p>${srcs(f[2])}${f[3] === 'nobasis' && !add ? srcs(['D-005']) : ''}${f[3] === 'nobasis' && add ? `<div class="gpa-acts">${pill(['warn', 'Tanpa dasar'])}<span class="gpa-hint">Proposed by Spekin, no decision behind it.</span>${rb('Confirm', 'Confirms this field as a decision and writes a decision-log entry', 'F439', 'gpa-ch')}${rb('Back to the interview', 'Reopens the interview to ask about this field', 'F439', 'gpa-ch')}</div>` : ''}</div></div>`;
  const depth = (cur) => nw('F434', `<span class="sp-seg" role="group" aria-label="Spec depth">${['Simple', 'Detailed', 'Expert'].map((d) => rb(d, `Shows the spec at ${d} depth; ${d} shows its layer and everything above it`, 'F434', '', ` aria-pressed="${d === cur}"${d === 'Expert' ? ' style="opacity:.5"' : ''}`)).join('')}</span>`, 'gpa-depth');
  const tickets = (n) => `<span class="gpa-lock">${n === 0 ? ic('lock', 13) : ic('check', 13)}Tickets ${n}${n === 0 ? ' · none until the breakdown is accepted' : ''}</span>`;
  const bar = (cur, n) => `<div class="gpa-fbar">${depth(cur)}<span class="sp-fill"></span>${tickets(n)}</div>`;
  const stepsCard = (done) => nw('F438', `<h4>Tickets unlock after</h4>${[['Pitch accepted', done >= 1], ['Lanjut ke Detail run', done >= 2], ['Ticket breakdown accepted', done >= 3]].map(([t, ok]) => `<div class="gpa-need">${dots(ok ? 'ok' : 'ring')}<span>${t}</span>${pill([ok ? 'ok' : 'mute', ok ? 'Done' : 'Not yet'])}</div>`).join('')}`, 'gpa-pc');
  const inbox = (items) => nw('F433', `<div class="gpa-inbox">${items.map(([t, s, on, b]) => `<div class="gpa-ir${on ? ' on' : ''}"><b>${t}</b>${b || ''}<small>${s}</small></div>`).join('')}</div>`, 'gpa-nw');
  const chatPitch = (msgs, ctx) => chatPanel({ title: 'Planning chat', sub: 'pitch', ctxItems: ctx || [['doc', 'Pitch', 'r1'], ['doc', 'Decision log', 'D-001 to D-003']], ctxFoot: '≈ 2.1k tokens · pitch and log only', ph: 'Ask about the pitch…', msgs });
  const mainPitch = (cur, n, banner, content, inspHtml) => `<section class="sp-main" aria-label="Work area">${tabs([['doc', 'Pitch r1', true], ['list', 'Decision log'], ['req', 'Spec · open questions']], '')}${banner}${bar(cur, n)}<div class="sp-work">${content}${inspHtml}</div></section>`;
  const pitchDoc = (add) => `<div class="sp-doc"><div class="meta">${add ? pill(['acc', 'Proposal r1']) : pill(['ok', 'Accepted r1'])}<span>Simple depth · decide layer · ${add ? 'every line is new in this diff' : 'accepted 24 Nov 14:12'}</span></div><h2>Pitch: variance alerts for Meranti Yard</h2>${PIT.map((f) => field(f, add)).join('')}</div>`;
  const bnProposal = `<div class="sp-banner warn" role="status">${ic('alert', 16)}<p><b>Proposal.</b> The pitch is a draft until you accept it. Review the diff, edit a field, or ask for changes.</p>${btn('Edit', { sm: true, does: 'Edits one field as a draft; the proposal changes, nothing is accepted', f: 'F432' })}${btn('Ask for changes', { sm: true, does: 'Sends a change request to the chat with the pitch as context', f: 'F432' })}${btn('Accept pitch', { sm: true, cls: 'ink', does: 'Accepts pitch r1 as shown, records the revision and opens the spec document at Simple depth', f: 'F432' })}</div>`;
  const insProp = insp({ title: 'Decision inbox', pillv: ['warn', '1 waiting'], sub: 'What needs you before the pitch is accepted', tabsv: [['Inbox', 1], ['Sources'], ['Revisions']],
    body: `${inbox([['Pitch proposal r1', 'Five fields from 3 decisions', true, btn('Review', { sm: true, cls: 'ink', does: 'Scrolls to the pitch diff and focuses its first field', f: 'F433' })], ['Open question OQ-01', 'Where actual costs come from', false, btn('Answer', { sm: true, does: 'Opens OQ-01 in the interview as the current question', f: 'F433' })], ['No-gos have no basis', 'Confirm or remove before accepting', false, btn('Confirm', { sm: true, does: 'Jumps to the No-gos field to confirm or reopen it', f: 'F433' })]])}${stepsCard(0)}` });
  const insAcc = insp({ title: 'Next step', pillv: ['ok', 'Pitch accepted'], sub: 'Simple depth is done. Detailed is optional.', tabsv: [['Next', 1], ['Sources'], ['Revisions']],
    body: `${inbox([['Nothing waiting', 'The pitch is accepted as r1', false, pill(['ok', 'Clear'])]])}<div class="sp-ready"><div class="t">Lanjut ke Detail<span class="pill mute">Optional</span></div><p>Generates the Detailed layer as a proposal: behaviour spec, plan and a ticket breakdown. It creates no tickets.</p>${btn('Lanjut ke Detail', { cls: 'ink', does: 'Generates the Detailed layer as a Proposal for review; no ticket is created', f: 'F435' })}</div>${stepsCard(1)}` });
  const insBreak = insp({ title: 'Decision inbox', pillv: ['warn', '2 waiting'], sub: 'Detailed layer r1 is a proposal', tabsv: [['Inbox', 1], ['Sources'], ['Revisions']],
    body: `${inbox([['Ticket breakdown r1', '5 slices, 1 blocked by an open question', true, btn('Review', { sm: true, cls: 'ink', does: 'Scrolls to the breakdown table', f: 'F433' })], ['Behaviour spec r1', '6 requirements in EARS', false, btn('Review', { sm: true, does: 'Opens the behaviour spec proposal in S08 review', f: 'F433' })]])}${stepsCard(2)}` });
  const insMade = insp({ title: 'Next step', pillv: ['ok', 'Breakdown accepted'], sub: 'Tickets exist because you accepted the breakdown', tabsv: [['Next', 1], ['Sources'], ['Revisions']],
    body: `${inbox([['Nothing waiting', 'Breakdown r1 accepted 24 Nov 14:40', false, pill(['ok', 'Clear'])]])}<div class="sp-ready"><div class="t">Tickets<span class="pill ok">5 created</span></div><p>One ticket per slice, with its blockers. T-04 waits for OQ-01.</p>${btn('Open ticket board', { cls: 'ink', does: 'Opens the ticket board (S15) with the 5 new tickets', f: 'F438' })}</div>${stepsCard(3)}` });
  const sliceTable = (made) => `<table class="sp-tbl"><thead><tr><th style="width:56px">ID</th><th>Slice</th><th style="width:230px">Cuts through</th><th style="width:130px">Blocked by</th>${made ? '<th style="width:80px">Status</th>' : ''}</tr></thead><tbody>${SL.map(([id, t, c, b]) => `<tr><td><b>${id}</b></td><td>${t}</td><td>${c}</td><td>${b === 'None' ? '<span class="gpa-hint">None</span>' : pill([b.startsWith('OQ') ? 'warn' : 'mute', b])}</td>${made ? `<td>${pill(['mute', 'Open'])}</td>` : ''}</tr>`).join('')}</tbody></table>`;
  const bnBreak = `<div class="sp-banner warn" role="status">${ic('lock', 16)}<p><b>0 tickets exist.</b> They are created when you accept this breakdown, and not before.</p>${btn('Edit slices', { sm: true, does: 'Edits the slices as a draft: reorder, split, merge or change blockers', f: 'F437' })}${btn('Reject', { sm: true, cls: 'plain', does: 'Rejects the breakdown; the Detailed layer stays a proposal and no ticket is made', f: 'F437' })}${btn('Accept breakdown', { sm: true, cls: 'ink', does: 'Accepts the breakdown as one proposal and creates the tickets it lists', f: 'F438' })}</div>`;
  const breakDoc = `<div class="sp-doc"><div class="meta">${pill(['acc', 'Proposal r1'])}<span>Detailed depth · plan and tickets · thin vertical slices</span></div><h2>Ticket breakdown</h2><p style="margin:0;color:var(--ink-dim)">Each slice cuts through schema, API, UI and tests and can be shown on its own. Blockers come from the open questions.</p>${nw('F437', sliceTable(false), 'gpa-nw')}</div>`;
  const bnMade = `<div class="sp-banner" role="status" style="background:var(--ok-soft)">${ic('check', 16)}<p><b>Breakdown accepted.</b> 5 tickets were created from it. None existed before.</p></div>`;
  const madeDoc = `<div class="sp-doc"><div class="meta">${pill(['ok', 'Accepted r1'])}<span>Detailed depth · tickets T-01 to T-05</span></div><h2>Ticket breakdown</h2>${nw('F438', sliceTable(true), 'gpa-nw')}</div>`;
  const msgBase = `<div class="sp-ub">Pitch looks right.</div>`;
  const vProposal = app({ stage: 'planning', save: ['warn', 'Draft · pitch r1'], chat: chatPitch(`<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 41 s · 12 cr</em></div><p>I wrote the pitch from your 3 decisions and 1 open question. No-gos had no decision, so I proposed it and marked it for you.</p></div>`), main: mainPitch('Simple', 0, bnProposal, pitchDoc(true), insProp) });
  const vAccepted = app({ stage: 'planning', save: ['ok', 'Saved 14:12'], chat: chatPitch(msgBase + `<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 6 s</em></div><p>Pitch r1 is accepted and the spec document is open at Simple depth. The next step is Lanjut ke Detail, when you want it.</p></div>`), main: mainPitch('Simple', 0, '', pitchDoc(false), insAcc) });
  const vGuard = app({ stage: 'planning', save: ['ok', 'Saved 14:12'], chat: chatPitch(`<div class="sp-ub">Make the tickets now.</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>read from the plan · 0 cr</em></div><p>I have not made any ticket. Tickets are created on purpose: first Lanjut ke Detail, then you accept the ticket breakdown.</p>${nw('F436', `<div class="k">${ic('lock', 12)}Tickets locked<span class="tag">${pill(['mute', '2 steps left'])}</span></div><div class="bd">Nothing was created by this message.</div><div class="ft"><span class="s">Next: Lanjut ke Detail</span>${btn('Lanjut ke Detail', { sm: true, cls: 'ink', does: 'Generates the Detailed layer as a Proposal for review; no ticket is created', f: 'F435' })}</div>`, 'sp-gc prop')}</div>`), main: mainPitch('Simple', 0, '', pitchDoc(false), insp({ title: 'Next step', pillv: ['ok', 'Pitch accepted'], sub: 'Tickets are still locked', tabsv: [['Next', 1], ['Sources'], ['Revisions']], body: `${stepsCard(1)}<div class="sp-ready"><div class="t">Lanjut ke Detail<span class="pill mute">Optional</span></div><p>Generates the Detailed layer as a proposal. It creates no tickets.</p>${btn('Lanjut ke Detail', { cls: 'ink', does: 'Generates the Detailed layer as a Proposal for review; no ticket is created', f: 'F435' })}</div>` })) });
  const vBreak = app({ stage: 'planning', save: ['warn', 'Draft · Detailed r1'], chat: chatPitch(`<div class="sp-ub">Lanjut ke Detail</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 58 s · 31 cr</em></div><p>The Detailed layer is ready as a proposal. It has a behaviour spec, a plan and a breakdown of 5 thin slices. No ticket exists yet.</p></div>`), main: mainPitch('Detailed', 0, bnBreak, breakDoc, insBreak) });
  const vMade = app({ stage: 'planning', save: ['ok', 'Saved 14:40'], chat: chatPitch(`<div class="sp-ub">Accept the breakdown.</div><div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 4 s</em></div><p>Breakdown r1 is accepted. I created 5 tickets, one per slice, with their blockers.</p></div>`), main: mainPitch('Detailed', 5, bnMade, madeDoc, insMade) });
  const NP = {
    prop: note('<b>Propose, diff, accept</b>: every line is green because the pitch is new. Edit changes one field; Accept records pitch r1.', 'left:420px;top:795px;max-width:320px'),
    src: note('<b>Source chips</b> open the decision behind a field. A field with none is marked Tanpa dasar until you confirm it.', 'left:770px;top:795px;max-width:320px'),
    acc: note('<b>Pitch accepted</b>: the spec document opens at Simple depth. Detailed is one switch away, but still empty.', 'left:420px;top:740px;max-width:320px'),
    acc2: note('<b>Tickets 0</b>: the counter stays at zero and says why. Nothing in the chat can make a ticket here.', 'left:770px;top:740px;max-width:320px'),
    guard: note('<b>Ask for tickets in chat</b>: Spekin explains the two steps instead of making them, and offers the next one.', 'left:420px;top:740px;max-width:320px'),
    guard2: note('<b>Checklist</b> shows the three steps. Tickets unlock only after the last one is done.', 'left:770px;top:740px;max-width:320px'),
    brk: note('<b>Lanjut ke Detail</b>: the Detailed layer arrives as a proposal. The banner says 0 tickets exist.', 'left:420px;top:740px;max-width:320px'),
    brk2: note('<b>Accept breakdown</b> is the only action that creates tickets, and it creates exactly the five listed.', 'left:770px;top:740px;max-width:320px'),
    made: note('<b>After accept</b>: five tickets exist, one per slice. T-04 stays blocked until OQ-01 is answered.', 'left:420px;top:740px;max-width:320px'),
    made2: note('<b>Open ticket board</b> goes to S15; the counter in the bar now reads Tickets 5.', 'left:770px;top:740px;max-width:320px'),
  };
  const S06 = {
    file: 'S06-pitch', code: 'S06', tier: 'START', name: 'Pitch (Simple)',
    ext: 'New. Spekin has no pitch builder and no ticket model (req-map). Follows PRD screen S06 (GAP-06, decision-inbox) and the propose, diff, accept pattern of §6.4; the diff itself is the S08 review pattern.',
    lives: 'Spekin web app · /p/meranti-yard/planning, tab Pitch; depth in the query (<code>?depth=simple</code>). The pitch text is project data; the URL carries no draft text.',
    views: [
      { id: 'proposal', label: 'Pitch proposal', html: vProposal, entry: 'Interview > Cukup, buat pitch, or answer question 12 > Review pitch proposal.', data: 'sample/parts/gap-a.mjs → GAPA_PITCH, GAPA_LOG.' },
      { id: 'accepted', label: 'Accepted, Simple', html: vAccepted, entry: 'Pitch proposal > Accept pitch.', data: 'sample/parts/gap-a.mjs → GAPA_PITCH.' },
      { id: 'guard', label: 'Tickets locked', html: vGuard, entry: 'Pitch accepted > type “make the tickets” in the chat.', data: 'sample/parts/gap-a.mjs → GAPA_PITCH (no tickets).' },
      { id: 'breakdown', label: 'Breakdown proposal', html: vBreak, entry: 'Pitch accepted > Lanjut ke Detail.', data: 'sample/parts/gap-a.mjs → GAPA_SLICES.' },
      { id: 'made', label: 'Tickets created', html: vMade, entry: 'Breakdown proposal > Accept breakdown.', data: 'sample/parts/gap-a.mjs → GAPA_SLICES.' },
    ],
    side: {
      must: [
        'The pitch has five fields (problem, appetite, solution, rabbit holes, no-gos). Each cites the decisions or open questions it came from.',
        'It arrives as a Proposal with a diff. Accept, edit a field or ask for changes; nothing is accepted by default.',
        'A field with no decision behind it is marked Tanpa dasar and must be confirmed, reopened or removed.',
        'On accept the spec document opens at Simple depth. The depth switch is Simple, Detailed, Expert; Detailed stays empty until asked for.',
        'Lanjut ke Detail generates the Detailed layer as a Proposal. It never creates a ticket.',
        'Chat cannot create tickets. Asking for them gets an explanation of the two steps left.',
        'Tickets appear only when the user accepts the ticket breakdown, and the counter says 0 until then.',
      ],
      motion: [
        ['Diff to accepted', 'The green diff tint fades out over 240 ms (spring-ui) and the Proposal pill becomes Accepted.'],
        ['Depth switch', 'The doc cross-fades 160 ms with a 4 px slide; scroll and selection come back per depth.'],
        ['Tickets counter', 'The number changes with a 140 ms fade; the lock icon fades out when tickets exist.'],
        ['Breakdown accept', 'Rows get their Open status in a 40 ms stagger, 120 ms each, top to bottom.'],
        ['Guard reply', 'The reply streams in with Stop; the locked card appears after the text, 180 ms.'],
        ['Reduce Motion', 'Everything swaps instantly; status text still announces what changed.'],
      ],
      stories: [
        ['F431', 'new', 'Pitch Proposal: problem, appetite, solution, rabbit holes, no-gos, each citing its decisions or open questions (PRD 6.1, R-ONB-6).', 'PRD'],
        ['F432', 'new', 'Propose, diff, accept: Accept, Edit a field, or Ask for changes; nothing is accepted by default (PRD 6.4, R-ONB-6).', 'PRD'],
        ['F433', 'new', 'Decision inbox card: the pitch, open questions and unbased fields that wait for the user, beside the work.', 'PRD'],
        ['F434', 'new', 'Accepted pitch opens the spec document at Simple depth; depth switch Simple, Detailed, Expert (PRD 6).', 'PRD'],
        ['F435', 'new', 'Lanjut ke Detail generates the Detailed layer as a Proposal and creates no ticket (R-ONB-7, AC-6).', 'PRD'],
        ['F436', 'new', 'Ticket guard: a chat request for tickets is answered with the steps left, not by making tickets (R-ONB-7, AC-6).', 'PRD'],
        ['F437', 'new', 'Ticket breakdown proposal: thin vertical slices with blockers, edited and accepted as one proposal (R-ONB-7, PRD 6.2).', 'PRD'],
        ['F438', 'new', 'Tickets are created only by accepting the breakdown; the counter and checklist show 0 until then (R-ONB-7, AC-6).', 'PRD'],
        ['F439', 'new', 'Tanpa dasar field: confirm it as a decision or go back to the interview (PRD 6.1).', 'PRD'],
      ],
      where: '<span><b>Route:</b> <code>/p/:project/planning</code>, tab Pitch, <code>?depth=simple|detailed|expert</code>. Back and Forward restore the depth and never generate anything.</span><span><b>UI (TS/React):</b> yravg UI <code>components/decision-inbox</code> and GAP-06 for the pitch; the diff reuses the S08 review pattern. Tickets come later in S15.</span><span><b>Core (Rust):</b> the proposal record, the accept step, and the rule that a ticket write needs an accepted breakdown (R-ARC-1). Today there is no ticket model in <code>crates</code>.</span><span><b>Open for Enrico:</b> whether Lanjut ke Detail shows its credit estimate first · appetite choices (1, 2, 6 weeks) · who may accept the breakdown on a team project.</span>',
    },
    refs: {
      note: 'The diff and accept pattern follows S08. OpenDesign shows the same “next step” suggestions under a finished reply.',
      shots: [
        { img: 'od-studio-document.png', cap: '<b>OpenDesign document.</b> Next-step suggestions sit under the reply. Spekin puts Lanjut ke Detail in the same place and in the inspector.' },
      ],
    },
  };

  // notes ride along with their views (appended to each view's html)
  const add = (b, map) => b.views.forEach((v) => { v.html += (map[v.id] || []).join(''); });
  add(S04, { ask: [NI.rec, NI.q], skip: [NI.skip1, NI.skip2], ground: [NI.ground1, NI.ground2], why: [NI.why1, NI.why2], cukup: [NI.cukup1, NI.cukup2], twelve: [NI.tw1, NI.tw2] });
  add(S05, { log: [NL.fresh, NL.filt], entry: [NL.sel, NL.rev], kit: [NL.kit, NL.kit2], open: [NL.open, NL.open2], empty: [NL.empty, NL.empty2] });
  add(S06, { proposal: [NP.prop, NP.src], accepted: [NP.acc, NP.acc2], guard: [NP.guard, NP.guard2], breakdown: [NP.brk, NP.brk2], made: [NP.made, NP.made2] });
  return [S02, S04, S05, S06];
}
