// F00 feature map and R00 references-and-engine boards. Generated from the stories on every board (K.STORIES)
// and maps.mjs, so the map cannot drift from the boards. Lead-owned.
import { BOARD_META, ENGINE, TASTE, LICENCES } from './maps.mjs';
import { REQS, REQS_NOTE } from './maps-reqs.mjs';

const REFS = ['OpenDesign', 'Paraframe', 'Onlook', 'Momo', 'PRD'];
const RCLS = { OpenDesign: 'od', Paraframe: 'pf', Onlook: 'on', Momo: 'mo', PRD: 'prd' };
const LAYER = Object.fromEntries(ENGINE.map((e) => [e.id, e.name]));
const SHORT = { ui: 'UI shell', canvas: 'Canvas', preview: 'Preview', genui: 'GenUI', agent: 'Agent loop', core: 'Rust core' };
const strip = (t) => String(t).replace(/<[^>]+>/g, '');
// Requirement IDs: those cited in the story text plus the traced ones in maps-reqs.mjs (review REV-05).
const idsOf = (s) => [...new Set([...ids(s.t), ...(REQS[s.id] || [])])];
const ids = (t) => [...new Set((strip(t).match(/\b(?:R-[A-Z]+-\d+(?:\.\.\d+)?|AC-[A-Z-]*\d+|FR-\d+)\b/g) || []))];
const bar = (label, n, max, cls, href) => `<div class="mp-bar"><span class="l">${href ? `<a href="${href}">${label}</a>` : label}</span><span class="t"><i class="${cls}" style="width:${Math.max(3, Math.round(n / max * 100))}%"></i></span><b>${n}</b></div>`;
const rchip = (r) => `<span class="mp-ref ${RCLS[r] || 'prd'}">${r}</span>`;

export function featureMap(K) {
  const S = K.STORIES.map((s) => ({ ...s, src: s.src || 'PRD' }));
  const boards = K.BOARDS;
  const byRef = REFS.map((r) => [r, S.filter((s) => s.src === r).length]);
  const byBoard = boards.map((b) => [b.code, S.filter((s) => s.code === b.code).length, b.file]);
  const maxR = Math.max(...byRef.map((x) => x[1]), 1), maxB = Math.max(...byBoard.map((x) => x[1]), 1);
  const reqs = new Set(S.flatMap((s) => idsOf(s).filter((x) => x.startsWith('R-'))));
  const kpi = (l, v, sub) => `<div class="mp-kpi"><span class="lbl">${l}</span><b>${v}</b><span>${sub}</span></div>`;
  const head = `<div class="mp-kpis">${kpi('Features', S.length, 'one story ID each, F101 and up')}${kpi('Drawn on the canvas', S.length + ' of ' + S.length, 'each has its board and state')}${kpi('Boards', boards.length, '13 screens planned in the PRD')}${kpi('PRD requirements traced', reqs.size, S.filter((s) => idsOf(s).some((x) => x.startsWith('R-'))).length + ' of ' + S.length + ' features trace to an R- ID')}${kpi('Built in an app', 0, 'no Spekin app exists yet')}</div>
<div class="mp-charts"><div class="card"><span class="lbl">Feature source</span>${byRef.map(([r, n]) => bar(r, n, maxR, RCLS[r])).join('')}<p class="mp-cap">Where the behaviour comes from. PRD means the PRD asks for it and no reference shows it.</p></div>
<div class="card"><span class="lbl">Features per board</span><div class="mp-cols">${byBoard.map(([c, n, f]) => bar(c, n, maxB, 'bd', f)).join('')}</div></div>
<div class="card mp-how"><span class="lbl">How to read this map</span><p><b>Click a board code</b> to jump to that board on the canvas. Its stories carry the same feature ID.</p><p><b>Filter</b> with the buttons at the top right: one reference at a time.</p><p><b>Engine</b> names the layer that does the work (see R00 for the stack).</p><p><b>Status</b>: every feature is drawn; none is built. Build order follows the phased plan in the handoff.</p></div></div>`;
  const table = (rows) => `<div class="card mp-tw"><table class="sp-tbl mp-t"><thead><tr><th style="width:62px">Feature</th><th style="width:70px">Board</th><th style="width:128px">Stage</th><th>What it does</th><th style="width:150px">Requirements</th><th style="width:98px">Source</th><th style="width:200px">Engine</th><th style="width:104px">Status</th></tr></thead><tbody>${rows.map((s) => { const m = BOARD_META[s.code] || { stage: '', layers: [] }; const r = idsOf(s); return `<tr><td><span class="sid">${s.id}</span></td><td><a href="${s.file}">${s.code}</a></td><td>${m.stage}</td><td>${strip(s.t).replace(/\s*\((?:R-|§|AC-|FR-)[^)]*\)\s*\.?$/, '.')}</td><td class="mono mp-ids">${r.slice(0, 4).join(' ')}${r.length > 4 ? ' +' + (r.length - 4) : ''}${REQS_NOTE[s.id] ? `<span class="mp-rn" title="${REQS_NOTE[s.id].replace(/"/g, '&quot;')}">${r.length ? ' · note' : 'none yet'}</span>` : ''}</td><td>${rchip(s.src)}</td><td class="mp-eng">${m.layers.map((l) => `<span class="mp-ly">${SHORT[l]}</span>`).join('')}</td><td><span class="pill ok">Drawn</span></td></tr>`; }).join('')}</tbody></table></div>`;
  const views = [{ id: 'all', label: 'All', rows: S }, ...REFS.map((r) => ({ id: RCLS[r], label: r === 'PRD' ? 'PRD only' : r, rows: S.filter((s) => s.src === r) }))]
    .map((v) => ({ ...v, entry: v.id === 'all' ? 'Canvas: F00 Feature map.' : 'F00: click ' + v.label + ' at the top right.', data: 'Stories on every board (build.mjs → K.STORIES) and maps.mjs → BOARD_META.' }));
  const h = 560 + S.length * 44;
  const body = `<div class="board" data-screen="F00">${K.header('F00', 'MAP', 'Every Spekin feature and where it lives', 'All ' + S.length + ' features drawn on the ' + boards.length + ' boards of this canvas, with the PRD requirements they answer, the reference each one learns from, and the engine layer that runs it.', 'This canvas. Generated by build.mjs from the board files, so it always matches them.', views)}<div class="rw"><div class="mp-main">${views.map((v) => `<sc-if value="{{is_${v.id}}}" hint-placeholder-val="{{ ${v.id === 'all'} }}"><div class="mp-col">${head}${table(v.rows)}</div></sc-if>`).join('')}</div>${K.aside({ must: ['Every feature ID once, with its board, stage, requirements, source and engine layer.', 'Counts by source and by board, computed from the boards.', 'A board code opens that board.', 'Filters by reference; All shows everything.'], motion: [['Filter', 'Rows swap at once; no animation on data.'], ['Reduce Motion', 'Nothing moves on this page.']], stories: [], where: '<span><b>Stories:</b> this page has none of its own; it lists the stories of every board.</span><span><b>Source:</b> <code>build.mjs</code>, <code>maps-boards.mjs</code>, <code>maps.mjs</code>.</span><span><b>Research:</b> <code>docs/research/*.md</code>.</span><span><b>Text copy:</b> <code>stories.md</code> (generated).</span>' }, views)}</div></div>`;
  return { body, logic: K.logicOf(views, 'all'), h };
}

export function engineBoard(K) {
  const S = K.STORIES.map((s) => ({ ...s, src: s.src || 'PRD' }));
  const cov = K.BOARDS.map((b) => [b, REFS.map((r) => S.filter((s) => s.code === b.code && s.src === r).length)]);
  const stat = { added: ['ok', 'Added to S35'], drawn: ['ok', 'Drawn'], board: ['acc', 'On its board'], rule: ['mute', 'House rule'] };
  const body = `<div class="board" data-screen="R00">${K.header('R00', 'MAP', 'References, taste and the engine behind Spekin', 'What Spekin takes from OpenDesign, Paraframe, Onlook and Momo: the feel (taste), the working parts (engine) and what the licences allow.', 'This canvas. Facts from docs/research/*.md (read 22 Nov 2026).', [])}
<div class="mp-two"><div class="card mp-ans"><span class="lbl">The engine during work, in one paragraph</span><p>Spekin is <b>not</b> OpenDesign plus Momo glued together. <b>OpenDesign</b> gives the product shell and the GenUI surfaces, but its engine is a Node daemon that spawns agent CLIs, so Spekin keeps its UI patterns and rebuilds the engine in Rust. <b>Momo</b> gives the GenUI feel (cards that build block by block, tolerant rendering), and Spekin gets it from the same MIT libraries Momo uses (OpenUI react-lang), with no Momo code. <b>Onlook</b> fills the gap neither has: a real board canvas (React Flow, camera, snapping, one undoable op log) and part picking inside a frame. <b>Paraframe</b> gives the frame workflow (takes, part edits, nitpicks, hand-off) as behaviour only.</p></div>
<div class="card"><span class="lbl">Licences</span><table class="sp-tbl"><thead><tr><th style="width:96px">Reference</th><th style="width:150px">Licence</th><th>What Spekin may do</th></tr></thead><tbody>${LICENCES.map(([n, r, l, d]) => `<tr><td>${rchip(n)}</td><td><b>${l}</b><br><span class="mp-dim">${r}</span></td><td>${d}</td></tr>`).join('')}</tbody></table></div></div>
<div class="card"><span class="lbl">Engine stack: who does what while you work</span><div class="mp-stack">${ENGINE.map((e) => `<div class="mp-layer"><div class="hd2"><b>${e.name}</b><span class="mono">${e.lang}</span><span class="mp-dim">${e.lic}</span></div><p>${e.take}</p><div class="fr">${e.from.map(([r, t]) => `<span>${r === 'Library' ? '<span class="mp-ref lib">Library</span>' : rchip(r)} ${t}</span>`).join('')}</div><div class="on">Boards: ${Object.entries(BOARD_META).filter(([, m]) => m.layers.includes(e.id)).map(([c]) => c).join(' · ')}</div></div>`).join('')}</div></div>
<div class="mp-two"><div class="card"><span class="lbl">Taste: what a user should feel, and where it is</span><table class="sp-tbl"><thead><tr><th style="width:96px">From</th><th>Detail</th><th style="width:110px">Board</th><th style="width:118px">Status</th></tr></thead><tbody>${TASTE.map(([r, t, w, st]) => `<tr><td>${rchip(r)}</td><td>${t}</td><td>${w}</td><td><span class="pill ${stat[st][0]}">${stat[st][1]}</span></td></tr>`).join('')}</tbody></table></div>
<div class="card"><span class="lbl">Features per board by source</span><table class="sp-tbl"><thead><tr><th>Board</th>${REFS.map((r) => `<th style="width:76px">${r}</th>`).join('')}</tr></thead><tbody>${cov.map(([b, c]) => `<tr><td><a href="${b.file}">${b.code}</a> ${b.name}</td>${c.map((n) => `<td class="mono">${n || '·'}</td>`).join('')}</tr>`).join('')}</tbody></table>
<p class="mp-cap"><b>Missing on purpose:</b> Paraframe capture of live pages, MCP and team sharing are deferred by the PRD (FR-04 to FR-09, FR-47, FR-50 to FR-52). OpenDesign deploy, plugins and the Design Jury are out of scope for the first slice.</p></div></div>
</div>`;
  return { body, logic: 'renderVals() { return {}; }', h: 2300 };
}
