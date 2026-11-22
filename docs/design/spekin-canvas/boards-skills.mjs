// Skills library group (S40). Owner request 23 Nov 2026: a free skills library with templates from day one,
// easy to change per user, skills from GitHub repos that can update themselves. Shell chrome comes from kit (S35 owns F101-F116).
export const tier = 'Skills library';
export const order = 7;

export function boards(K) {
  const { S, ic, btn, ib, pill, note, NT, LT, app, chatPanel, tabs } = K;
  const SRC = Object.fromEntries(S.SKL_SOURCES.map((s) => [s.id, s]));
  const nw = (f, inner, cls = '', tag = 'div', extra = '') => `<${tag} class="${cls} isnew" data-feature="${f}"${extra}>${NT}${inner}</${tag}>`;
  const sw = (on, label, f = 'F364') => `<button type="button" class="skl-sw" role="switch" aria-checked="${on}" aria-label="${label}" data-does="${on ? 'Turns this skill off for this project; runs already made keep their proposals' : 'Turns this skill on for this project; it then shows in the / list of its stages'}" data-feature="${f}"><i></i></button>`;
  const srcLine = (id) => { const s = SRC[id]; return `<span class="skl-src ${s.kind}">${ic(s.kind === 'github' ? 'link' : s.kind === 'mine' ? 'pointer' : 'spark', 12)}${s.kind === 'github' ? s.name : s.name}</span>`; };
  const upd = (u) => `<span class="skl-upd${u === 'Update ready' ? ' ready' : ''}">${ic(u === 'Update ready' ? 'down' : u === 'Your copy' ? 'pointer' : 'history', 12)}${u}</span>`;
  const tabsRow = (sel = 'Skills') => tabs([['req', 'Spec §3'], ['doc', 'GLOSSARY.md', sel === 'GLOSSARY.md'], ['layers', 'Skills', sel === 'Skills']], btn('Hand off', { cls: 'ink', icon: 'download', does: 'Opens S34: downloads only accepted revisions with a fixed revision manifest; chosen skills go in the package', f: 'F377' }));

  // ---------- chat (left) ----------
  const ctxSpec = [['req', 'Spec §3', 'r14'], ['doc', 'GLOSSARY.md', 'r5'], ['doc', 'ADR 0003', 'r1']];
  const chat = (msgs, ph, extra = '') => {
    const html = chatPanel({ title: 'Specification chat', sub: 'skills', ctxItems: ctxSpec, ctxFoot: '≈ 6.2k tokens · a skill reads only this list', msgs, ph });
    return extra ? html.replace('<div class="sp-comp">', extra + '<div class="sp-comp">') : html;
  };
  const msgsLib = `<div class="sp-ub">Which skills should I use to write the spec for variance alerts?</div>
<div class="sp-ai"><div class="h"><span class="av">S</span>Spekin<em>Sonnet 5.5 · 6 s · 2 cr</em></div><p>For Specification, start with <b>Grill the idea</b>, then <b>Write the spec in EARS</b>, then <b>Split into tickets</b>. Type <b>/</b> in the composer to pick one. Each run makes proposals you review; nothing changes the spec on its own.</p></div>`;
  const chatLib = chat(msgsLib, 'Type / to use a skill, or ask anything…');

  // ---------- library ----------
  const rail = (sel = 'All stages') => `<nav class="skl-rail" aria-label="Filter skills">
<span class="skl-rl">Stage</span>${S.SKL_STAGES.map(([n, c]) => `<button type="button" class="skl-fi"${n === sel ? ' aria-pressed="true"' : ''} data-does="Shows only skills for ${n === 'All stages' ? 'every stage' : n}" data-feature="F361"><span>${n}</span><b>${c}</b></button>`).join('')}
<span class="skl-rl">Source</span>${S.SKL_SOURCES.map((s) => `<button type="button" class="skl-fi" data-does="Shows only skills from ${s.name}" data-feature="F361"><span>${s.name}</span><b>${s.count}</b></button>`).join('')}
<span class="skl-rl">Status</span><button type="button" class="skl-fi" data-does="Shows only skills switched on in this project" data-feature="F364"><span>On in this project</span><b>7</b></button><button type="button" class="skl-fi" data-does="Shows updates that wait for your review" data-feature="F372"><span>Updates waiting</span><b>1</b></button>
</nav>`;
  const card = ([id, t, line, st, src, lic, u, on, uses], hi = false) => `<article class="skl-card${hi ? ' hi' : ''}" aria-label="${t}">
<div class="skl-ch">${srcLine(src)}${sw(on, (on ? 'Turn off ' : 'Turn on ') + t + ' in this project')}</div>
<button type="button" class="skl-cn" data-does="Opens the skill: what it does, what it reads and proposes, its source, licence and updates" data-feature="F365"><b>${t}</b><span>${line}</span></button>
<div class="skl-st">${st.map((x) => `<span>${x}</span>`).join('')}</div>
<div class="skl-cf"><span class="skl-lic">${lic}</span>${upd(u)}<span class="skl-uses">${uses} runs</span></div></article>`;
  const head = (title, sub, acts) => `<div class="skl-ph"><div class="skl-tt"><h2>${title}</h2><span>${sub}</span></div><span class="sp-fill"></span>${acts}</div>`;
  const libActs = `<label class="skl-search">${ic('search', 14)}<input type="search" placeholder="Search skills" aria-label="Search skills" data-does="Filters skills by name, words in the description and stage" data-feature="F361"></label>${btn('Updates', { icon: 'history', does: 'Opens the update history: what changed, what was applied, what waits, with roll back', f: 'F373' })}${btn('Add from GitHub', { icon: 'link', does: 'Opens the GitHub import: paste a repo link, see its skills and licence, pick, set how it updates', f: 'F370' })}${btn('New skill', { cls: 'ink', icon: 'plus', does: 'Starts a new skill from a blank template or a copy of one you pick', f: 'F367' })}`;
  const templates = `<div class="skl-band isnew" data-feature="F362">${NT}<div class="skl-bt"><b>Start here: free templates</b><span>Every skill is free to use, copy and change. Copies are yours; the original keeps updating.</span></div><div class="skl-tpl">${[['Grill the idea', 'Planning'], ['Write the spec in EARS', 'Specification'], ['Split into tickets', 'Specification'], ['Test first', 'Build']].map(([n, s]) => `<button type="button" data-does="Opens ${n} with a Use and a Copy button" data-feature="F362"><b>${n}</b><span>${s}</span></button>`).join('')}</div></div>`;
  const libMain = (gridSel = null) => `<section class="sp-main" aria-label="Work area">${tabsRow()}
<div class="skl-page">${head('Skills', 'Free for everyone · 9 in this workspace · runs make proposals, never direct changes', libActs)}
<div class="skl-body">${rail()}<div class="skl-main">${templates}<div class="skl-grid isnew" data-feature="F363">${NT}${S.SKL_SKILLS.map((s) => card(s, s[0] === gridSel)).join('')}</div>
<p class="skl-fine">${ic('lock', 12)}Each card shows its source and licence. Skills from mattpocock/skills are MIT, Copyright (c) 2026 Matt Pocock; adapted copies say so. Spekin's own templates are Apache-2.0.</p></div></div></div></section>`;
  const vLibrary = app({ stage: 'spec', chat: chatLib, main: libMain() })
    + note('<b>Free, from day one.</b> Templates ship with Spekin; anyone can use, copy and change them. Each card says where it comes from and its licence.', 'left:392px;top:728px;width:250px')
    + note('<b>Switch per project.</b> The switch decides if the skill shows in this project\'s / list. It never runs anything.', 'left:1170px;top:470px;width:230px');

  // ---------- detail ----------
  const D = S.SKL_DETAIL;
  const detailMain = `<section class="sp-main" aria-label="Work area">${tabsRow()}
<div class="skl-page">${head(`<button type="button" class="skl-back" data-does="Goes back to the skills list with your filters kept" data-feature="F365">${ic('chevR', 12)}Skills</button> ${D.title}`, D.version + ' · ' + SRC['gh-mp'].name, `<span class="skl-r" data-feature="F376">${btn('Share', { icon: 'share', later: 'Share with other workspaces or publish to the community library' })}</span>` + btn('Copy and edit', { icon: 'plus', does: 'Makes your own copy (version 1) and opens it in the editor; the original keeps updating', f: 'F367' }) + btn('Use in chat', { cls: 'ink', icon: 'spark', does: 'Puts /grill in the composer with the current context list; nothing runs until Send', f: 'F374' }))}
<div class="skl-dbody"><div class="skl-doc isnew" data-feature="F365">${NT}<span class="skl-rl">What it does</span><ol>${D.steps.map((s) => `<li>${s}</li>`).join('')}</ol>
<span class="skl-rl">Adapted for Spekin</span><p>${D.adapted}</p>
<div class="skl-kv"><span>Reads</span><b>${D.reads.join(' · ')}</b><span>Proposes</span><b>${D.proposes.join(' · ')}</b><span>Tools</span><b>${D.tools}</b><span>How to use</span><b>${D.invoke}</b></div></div>
<aside class="skl-side"><div class="skl-box isnew" data-feature="F366">${NT}<span class="skl-rl">Source and licence</span><p><b>github.com/mattpocock/skills</b><br><code>${D.path}</code></p><p>MIT · <span class="skl-mono">Copyright (c) 2026 Matt Pocock</span>. The notice travels with every copy and every export.</p>${btn('Open on GitHub', { sm: true, icon: 'link', does: 'Opens the source folder on GitHub at the pinned commit, in a new tab', f: 'F366' })}</div>
<div class="skl-box isnew" data-feature="F371">${NT}<span class="skl-rl">Updates</span><div class="skl-seg" role="radiogroup" aria-label="How this source updates">${[['Auto', true], ['Notify me', false], ['Pinned', false]].map(([n, s]) => `<button type="button" role="radio" aria-checked="${s}" data-does="${n === 'Auto' ? 'Applies updates that pass the safety checks; anything else waits for you' : n === 'Notify me' ? 'Shows new versions; you apply them' : 'Stays on this commit until you change it'}" data-feature="F371">${n}</button>`).join('')}</div><p class="skl-small">Checked daily at 06:00. Last update today, 2 applied, 1 waiting.</p></div>
<div class="skl-box"><span class="skl-rl">Used in</span>${D.used.map(([p, w]) => `<div class="skl-used"><b>${p}</b><span>${w}</span></div>`).join('')}<div class="skl-ch2">${sw(true, 'Turn off Grill the idea in this project')}<span>On in Meranti Yard</span></div></div></aside></div></div></section>`;
  const vDetail = app({ stage: 'spec', chat: chatLib, main: detailMain })
    + note('<b>Always attributed.</b> Source repo, path, pinned commit and the MIT notice stay with the skill, its copies and every export.', 'left:1150px;top:150px;width:250px')
    + note('<b>Reads and proposes are limits.</b> The Rust core lets a skill see only what it declares and only propose; it never writes the spec.', 'left:760px;top:640px;width:300px');

  // ---------- edit ----------
  const E = S.SKL_EDIT;
  const editMain = `<section class="sp-main" aria-label="Work area">${tabsRow()}
<div class="skl-page">${head(E.title, 'Your copy of ' + E.from + ' · draft, not saved', btn('Discard', { does: 'Drops the unsaved changes; the saved version stays', f: 'F368' }) + btn('Save as version 2', { cls: 'ink', icon: 'check', does: 'Saves version 2; projects using version 1 keep it until you switch them', f: 'F368' }))}
<div class="skl-dbody"><div class="skl-form isnew" data-feature="F368">${NT}
<label class="skl-f"><span>Name</span><input value="${E.title}" aria-label="Skill name" data-does="Sets the skill name shown in the list and the / menu" data-feature="F368"></label>
<label class="skl-f"><span>When to use it</span><input value="${E.desc}" aria-label="Description" data-does="Sets the one line that tells people and the model when this skill fits" data-feature="F368"></label>
<div class="skl-f"><span>Stages</span><div class="skl-chips">${['Planning', 'Specification', 'Design', 'Testing'].map((s) => `<button type="button" aria-pressed="${E.stages.includes(s)}" data-does="Adds or removes ${s} from where this skill is offered" data-feature="F368">${s}</button>`).join('')}</div></div>
<div class="skl-f"><span>Instructions</span><div class="skl-ed" role="textbox" aria-multiline="true" aria-label="Instructions">${E.body.map((l, i) => `<div><i>${i + 1}</i>${l}</div>`).join('')}</div></div></div>
<aside class="skl-side"><div class="skl-box isnew" data-feature="F368">${NT}<span class="skl-rl">Checks</span>${E.checks.map(([k, t]) => `<div class="skl-ck ${k}">${ic(k === 'ok' ? 'check' : 'alert', 13)}<span>${t}</span></div>`).join('')}</div>
<div class="skl-box isnew" data-feature="F369">${NT}<span class="skl-rl">Try on the sample</span><p class="skl-small">Runs on Meranti Yard's context. Results are shown here only; nothing is saved or proposed.</p>${E.dry.map(([k, t, id, m]) => `<div class="skl-dry"><span class="pill ${k === 'ADR' ? 'acc' : 'mute'}">${k}</span><b>${t}</b>${id ? `<em>${id}</em>` : ''}<span>${m}</span></div>`).join('')}${btn('Try again', { sm: true, icon: 'spark', does: 'Runs the draft once more on the sample context; about 3 cr, shown before it runs', f: 'F369' })}</div></aside></div></div></section>`;
  const vEdit = app({ stage: 'spec', save: ['warn', 'Draft · not saved'], chat: chatLib, main: editMain })
    + note('<b>Change it easily.</b> Name, when to use, stages and plain instructions. Checks run as you type.', 'left:420px;top:700px;width:250px')
    + note('<b>Try before you save.</b> A dry run on the sample shows what it would propose. Nothing is written.', 'left:1150px;top:760px;width:250px');

  // ---------- github import ----------
  const G = S.SKL_GH;
  const ghDrawer = `<div class="skl-scrim"></div><div class="skl-dlg isnew" role="dialog" aria-label="Add skills from GitHub" data-feature="F370">${NT}
<div class="skl-dh"><b>Add skills from GitHub</b><span class="sp-fill"></span>${ib('x', 'Close', { does: 'Closes the import; nothing is added', sm: true, f: 'F370' })}</div>
<label class="skl-url">${ic('link', 14)}<input value="${G.url}" aria-label="GitHub repository link" data-does="Takes a public GitHub repository link; Spekin reads it, it never writes to it" data-feature="F370">${btn('Scan', { sm: true, does: 'Reads the repository: finds SKILL.md folders, the licence and any scripts; runs nothing', f: 'F370' })}</label>
<div class="skl-found"><b>${G.found} skills found</b><span class="pill ok">${G.licence}</span><span>${G.file} · ${G.notice}</span></div>
<div class="skl-pick2">${G.groups.map(([g, l]) => `<div class="skl-grp"><span class="skl-rl">${g}</span>${l.map(([n, on]) => `<label class="skl-cb"><input type="checkbox"${on ? ' checked' : ''} aria-label="${n}" data-does="Adds or leaves out ${n}" data-feature="F370"><span>${n}</span></label>`).join('')}</div>`).join('')}</div>
<div class="skl-pol isnew" data-feature="F371">${NT}<span class="skl-rl">When the repository changes</span>${[['Auto-update', 'Recommended. Checks daily. Applies an update when the licence is unchanged and every check passes. Anything else waits for you. Roll back any time.', true], ['Notify me', 'Shows each new version; you apply it.', false], ['Pin this version', 'Stays on 9b1f07e until you change it.', false]].map(([n, t, on]) => `<label class="skl-rad"><input type="radio" name="pol"${on ? ' checked' : ''} aria-label="${n}" data-does="${t}" data-feature="F371"><span><b>${n}</b>${t}</span></label>`).join('')}</div>
<div class="skl-checks isnew" data-feature="F372">${NT}${G.checks.map(([k, t]) => `<div class="skl-ck ${k}">${ic(k === 'ok' ? 'check' : 'alert', 13)}<span>${t}</span></div>`).join('')}</div>
<div class="skl-df">${btn('Cancel', { does: 'Closes the import; nothing is added', f: 'F370' })}${btn('Add 6 skills', { cls: 'ink', icon: 'plus', does: 'Adds the 6 chosen skills at commit 9b1f07e with their licence notice; they start switched off in this project', f: 'F370' })}</div></div>`;
  const vGithub = app({ stage: 'spec', chat: chatLib, main: libMain().replace('</section>', ghDrawer + '</section>') })
    + note('<b>Any public repo.</b> Spekin reads SKILL.md folders and the licence. A repo without a licence is refused.', 'left:395px;top:250px;width:240px')
    + note('<b>Auto-update with a safety net.</b> Only clean updates apply on their own; a new tool, a script or a licence change always waits for you.', 'left:395px;top:640px;width:240px');

  // ---------- updates ----------
  const U = S.SKL_UPDATES;
  const updMain = `<section class="sp-main" aria-label="Work area">${tabsRow()}
<div class="skl-page">${head(`<button type="button" class="skl-back" data-does="Goes back to the skills list" data-feature="F373">${ic('chevR', 12)}Skills</button> Updates`, 'Every change to a skill, newest first', btn('Check now', { icon: 'history', does: 'Checks every source for new versions now instead of at 06:00', f: 'F372' }))}
<div class="skl-dbody"><div class="skl-hist isnew" data-feature="F373">${NT}${U.map((u, i) => `<div class="skl-ev${i === 0 ? ' open' : ''}"><div class="skl-evh"><b>${u.src}</b><span class="skl-mono">${u.from} → ${u.to}</span><span class="pill ok">${u.applied} applied</span>${u.held ? `<span class="pill warn">${u.held} waiting</span>` : ''}<span class="sp-fill"></span><span class="skl-when">${u.when}</span>${btn('Roll back', { sm: true, icon: 'undo', does: 'Returns this source to ' + u.from + '; projects keep their accepted proposals', f: 'F373' })}</div>
${u.rows.map(([k, n, w, s]) => `<div class="skl-evr"><span class="skl-ck ${k}">${ic(k === 'ok' ? 'check' : 'alert', 13)}</span><b>${n}</b><span>${w}</span><span class="pill ${k === 'ok' ? 'mute' : 'warn'}">${s}</span></div>`).join('')}</div>`).join('')}</div>
<aside class="skl-side wide"><div class="skl-box isnew" data-feature="F372">${NT}<span class="skl-rl">Waiting for you: Split into tickets</span><p class="skl-small">Held because the new version asks for a tool it did not have. Read the change, then choose.</p><div class="skl-diff" aria-label="Changes to SKILL.md">${S.SKL_DIFF.map(([k, l]) => `<div class="${k === '+' ? 'add' : k === '-' ? 'del' : ''}"><i>${k}</i>${l}</div>`).join('')}</div>
<div class="skl-df">${btn('Keep current', { does: 'Stays on the current version; the update stays listed', f: 'F372' })}${btn('Apply without the tool', { does: 'Applies the wording change and leaves the new tool out', f: 'F372' })}${btn('Apply', { cls: 'ink', does: 'Applies the update including the new tool request; the tool still asks before each use', f: 'F372' })}</div></div></aside></div></div></section>`;
  const vUpdates = app({ stage: 'spec', chat: chatLib, main: updMain })
    + note('<b>Nothing changes silently.</b> Each update is listed with what changed and why it applied or waits. Roll back restores the old version.', 'left:420px;top:720px;width:280px')
    + note('<b>Held updates show the diff.</b> A new tool, a script or a licence change always waits for a person.', 'left:1150px;top:640px;width:250px');

  // ---------- use in chat ----------
  const picker = `<div class="skl-menu isnew" role="listbox" aria-label="Skills for Specification" data-feature="F374">${NT}<div class="skl-mh">Skills for Specification<span>↑↓ to move · Enter to pick</span></div>${S.SKL_SKILLS.filter((s) => s[3].includes('Specification') && s[7]).slice(0, 4).map(([id, t, line], i) => `<button type="button" role="option" aria-selected="${i === 0}" data-does="Picks ${t}: shows what it reads and an estimate before Send" data-feature="F374"><b>/${id}</b><span>${t}</span></button>`).join('')}<div class="skl-mf">${btn('Browse all skills', { sm: true, does: 'Opens the Skills tab', f: 'F374' })}</div></div>`;
  const msgsUse = `<div class="sp-ub">/grill Alert drawer for packages over 3%</div>
<div class="sp-ai"><div class="h"><span class="av">S</span>Grill the idea<em>Sonnet 5.5 · 41 s · 6 cr</em></div><p>Question 4 of 12 settled two terms and one decision. Proposed; nothing changes until you accept.</p>
<div class="skl-prop isnew" data-feature="F375">${NT}<div class="skl-pr"><span class="pill mute">Glossary</span><b>Data date</b><span>tanggal data</span></div><div class="skl-pr"><span class="pill mute">Glossary</span><b>EAC</b><span>perkiraan biaya akhir</span></div><div class="skl-pr"><span class="pill acc">ADR</span><b>Variance threshold is set per package</b></div>
<div class="skl-pa">${btn('Send to review', { sm: true, cls: 'ink', does: 'Sends the 3 proposals to S33 review; the spec changes only when you accept there', f: 'F375' })}${btn('Skip', { sm: true, does: 'Drops these proposals; the run is kept in history', f: 'F375' })}</div></div></div>`;
  const chatUse = chat(msgsUse, '/gr', picker);
  const glossMain = `<section class="sp-main" aria-label="Work area">${tabsRow('GLOSSARY.md')}
<div class="skl-page">${head('GLOSSARY.md', 'r5 accepted · 2 proposals waiting for review', btn('Open review', { icon: 'diff', does: 'Opens S33 with the waiting proposals for this document', f: 'F375' }))}
<div class="skl-gl"><div class="skl-glh"><span>Term</span><span>Bahasa</span><span>Meaning</span><span>Status</span></div>${S.SKL_GLOSS.map(([t, b, m, s]) => `<div class="skl-glr${s === 'proposed' ? ' prop' : ''}"><b>${t}</b><span>${b}</span><span>${m}</span><span class="pill ${s === 'proposed' ? 'warn' : 'ok'}">${s === 'proposed' ? 'Proposed · not applied' : 'Accepted r5'}</span></div>`).join('')}</div></div></section>`;
  const vUse = app({ stage: 'spec', busy: '1 running', chat: chatUse, main: glossMain })
    + note('<b>Type / in any chat.</b> The list shows the skills switched on for this stage, with an estimate before Send.', 'left:392px;top:600px;width:240px')
    + note('<b>Runs make proposals.</b> Terms and ADRs wait in review (S33). The glossary shows them as proposed until you accept.', 'left:1100px;top:420px;width:270px');

  return [{
    file: 'S40-skills-library', code: 'S40', tier: 'SKILLS', name: 'Skills library: free templates, your own copies, GitHub sources that update',
    ext: 'New (owner, 23 Nov 2026). Lives as a Skills tab in every stage, plus the / list in each chat composer (S35, S38) and a "skills to include" list in the coding handoff (S34).',
    lives: 'Spekin web app · /skills for the workspace, /p/meranti-yard/:stage?tab=skills in a project. Skills are free for everyone.',
    views: [
      { id: 'library', label: 'Library', html: vLibrary, entry: 'Any stage › artifact tabs: Skills.', data: 'sample/parts/skills.mjs → SKL_SKILLS, SKL_STAGES, SKL_SOURCES.' },
      { id: 'detail', label: 'Skill detail', html: vDetail, entry: 'Skills › click Grill the idea.', data: 'sample/parts/skills.mjs → SKL_DETAIL.' },
      { id: 'edit', label: 'Copy and edit', html: vEdit, entry: 'Skills › Grill the idea › Copy and edit.', data: 'sample/parts/skills.mjs → SKL_EDIT.' },
      { id: 'github', label: 'Add from GitHub', html: vGithub, entry: 'Skills › Add from GitHub › paste link › Scan.', data: 'sample/parts/skills.mjs → SKL_GH.' },
      { id: 'updates', label: 'Updates', html: vUpdates, entry: 'Skills › Updates.', data: 'sample/parts/skills.mjs → SKL_UPDATES, SKL_DIFF.' },
      { id: 'use', label: 'Use in chat', html: vUse, entry: 'Specification chat › type / › Grill the idea › Send.', data: 'sample/parts/skills.mjs → SKL_SKILLS, SKL_GLOSS.' },
    ],
    side: {
      must: [
        'Free templates from day one, useful at every stage; anyone can use, copy and change them.',
        'Every skill shows its source, licence and version. Copies and exports keep the original notice.',
        'A copy is the user\'s own, versioned, and edited with plain fields: name, when to use, stages, instructions.',
        'A dry run on the sample shows what a skill would propose before it is saved.',
        'GitHub sources: paste a public repo link, see the skills and the licence, pick, choose Auto-update, Notify or Pinned. No licence, no import.',
        'Auto-update applies only clean updates; a new tool, a script or a licence change waits for a person, with the diff. Roll back any time.',
        'A skill reads only what it declares and only proposes; the Rust core enforces both. Runs go through the ledger with an estimate before Send.',
      ],
      motion: [
        ['Switch', 'Knob slides 160 ms spring-ui; the count in the rail updates with it.'],
        ['/ list', 'Opens above the composer in 120 ms; arrow keys move, Enter picks, Escape closes and keeps the text.'],
        ['Import', 'Drawer slides in from the right, 320 ms spring-panel; Scan shows real steps (reading, licence, checks), no fake bar.'],
        ['Update row', 'Expands in place, 180 ms; focus stays on the row.'],
        ['Reduce Motion', 'All of it is instant. Results are still announced.'],
      ],
      stories: [
        ['F361', 'new', 'Skills catalogue with stage, source and status filters and search.', 'Owner'],
        ['F362', 'new', 'Free starter templates for every stage, from Spekin and adapted open skills.', 'Owner'],
        ['F363', 'new', 'Skill card: what it does, stages, source, licence, update state and runs.', 'Owner'],
        ['F364', 'new', 'Switch a skill on or off per project; only switched-on skills show in the / list.', 'Owner'],
        ['F365', 'new', 'Skill detail: steps, what it reads and proposes, tools, how to use it, where it is used.', 'mattpocock/skills'],
        ['F366', 'new', 'Source and licence always shown; the notice travels with copies and exports (ADR 0004).', 'PRD'],
        ['F367', 'new', 'New skill or copy of any skill; the copy is the user\'s own and versioned.', 'Owner'],
        ['F368', 'new', 'Editor with plain fields and live checks; save as a new version without breaking projects on the old one.', 'Owner'],
        ['F369', 'new', 'Dry run on the sample: shows what the skill would propose; writes nothing.', 'PRD'],
        ['F370', 'new', 'Add skills from a public GitHub repo: scan SKILL.md folders and the licence, pick which to add.', 'Owner'],
        ['F371', 'new', 'Update policy per source: Auto-update, Notify me or Pinned.', 'Owner'],
        ['F372', 'new', 'Auto-update with safety checks; a new tool, script or licence change is held with its diff.', 'PRD'],
        ['F373', 'new', 'Update history with what changed, what applied, what waits, and roll back.', 'Owner'],
        ['F374', 'new', '/ skill list in every chat composer, filtered by stage, with an estimate before Send.', 'OpenDesign'],
        ['F375', 'new', 'A skill run makes proposals only; they go to S33 review and show as proposed in the document (R-EDT-1).', 'PRD'],
        ['F376', 'new', 'Share a skill with other workspaces or publish it to the community library.', 'Owner'],
        ['F377', 'new', 'Chosen skills are packed into the coding handoff with their licence notices (S34).', 'Owner'],
      ],
      where: '<span><b>Route:</b> <code>/skills</code>, and <code>?tab=skills</code> inside a project stage.</span><span><b>Core (Rust):</b> <code>SkillManifest</code> (id, source repo, path, pinned commit, licence, notice, stages, reads, proposes, tools, invocation), update policy and checks; a run is a normal job through the ledger and returns proposals only.</span><span><b>Sources:</b> Spekin templates (Apache-2.0); <code>github.com/mattpocock/skills</code> (MIT, Copyright (c) 2026 Matt Pocock), adapted and renamed; user copies. Scripts in a skill are exported, never run on Spekin.</span><span><b>Later:</b> share and community publishing ' + LT + '; the MCP server that serves skills to your own agent (its own ADR).</span>',
    },
  }];
}
