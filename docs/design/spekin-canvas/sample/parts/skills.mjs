// Skills library (S40) sample data. Fictional project data; the skill sources are real public repos named for attribution.
// Commit ids below are sample values for the drawing, not a claim about the upstream repo.
export const SKL_SOURCES = [
  { id: 'spekin', name: 'Spekin templates', kind: 'template', count: 4, licence: 'Apache-2.0', policy: 'Ships with Spekin' },
  { id: 'gh-mp', name: 'mattpocock/skills', kind: 'github', url: 'github.com/mattpocock/skills', count: 6, licence: 'MIT', notice: 'Copyright (c) 2026 Matt Pocock', commit: '4c9e2a1', policy: 'auto' },
  { id: 'mine', name: 'Made in this workspace', kind: 'mine', count: 1, licence: 'Yours', policy: 'You edit it' },
];
// [id, title, line, stages, source, licence, update, on, uses]
export const SKL_SKILLS = [
  ['grill', 'Grill the idea', 'Asks one sharp question at a time until the idea holds, then proposes glossary terms and ADRs.', ['Planning', 'Specification'], 'gh-mp', 'MIT', 'Auto-update', true, 41],
  ['ears', 'Write the spec in EARS', 'Turns accepted decisions into EARS requirements with a source for each line.', ['Specification'], 'spekin', 'Apache-2.0', 'Ships with Spekin', true, 63],
  ['tickets', 'Split into tickets', 'Cuts the spec into thin vertical tickets with blocking links and criteria that fail first.', ['Specification'], 'gh-mp', 'MIT', 'Update ready', true, 37],
  ['trace', 'Trace requirement to test', 'Checks that every requirement has a ticket, a test and evidence; lists the gaps.', ['Specification', 'Testing'], 'spekin', 'Apache-2.0', 'Ships with Spekin', true, 22],
  ['proto', 'Prototype two options', 'Draws two throwaway takes of a screen to answer one design question.', ['Design'], 'gh-mp', 'MIT', 'Auto-update', false, 18],
  ['tdd', 'Test first', 'Red, green, refactor: writes the failing test before the code, using the glossary words.', ['Frontend', 'Backend'], 'gh-mp', 'MIT', 'Auto-update', true, 29],
  ['review', 'Review against the spec', 'Reviews a change on two axes, the spec and our standards, and attaches findings as evidence.', ['Testing'], 'gh-mp', 'MIT', 'Auto-update', true, 26],
  ['release', 'Release readiness check', 'Lists what still blocks a release: failed or missing evidence, stale builds, open risks.', ['Deployment'], 'spekin', 'Apache-2.0', 'Ships with Spekin', false, 9],
  ['words', 'Meranti cost words', 'Our own wording for cost reports: EAC, variance, data date, in English and Bahasa.', ['Planning', 'Specification'], 'mine', 'Yours', 'Your copy', true, 6],
];
export const SKL_STAGES = [['All stages', 9], ['Planning', 2], ['Specification', 5], ['Design', 1], ['Frontend', 1], ['Backend', 1], ['Integration', 0], ['Testing', 2], ['Deployment', 1]];
export const SKL_DETAIL = {
  id: 'grill', title: 'Grill the idea', version: 'v1.3 · 4c9e2a1', path: 'skills/productivity/grilling + skills/engineering/domain-modeling',
  adapted: 'Adapted for Spekin: answers become proposals for S08 review, Bahasa terms are asked for, one question at a time, stop after 12.',
  reads: ['Pitch', 'GLOSSARY.md', 'ADRs', 'Selected context only'], proposes: ['Glossary terms', 'ADRs', 'Open questions'], tools: 'None. Text only.', invoke: 'You type /grill, or pick it from the list',
  steps: ['Read the pitch, the glossary and the ADRs in the context list.', 'Ask one question at a time. Give a recommended answer with each.', 'When an answer settles a term, propose a glossary entry (term, meaning, avoid, Bahasa).', 'When an answer is hard to reverse, surprising and a real trade-off, propose an ADR.', 'Stop after 12 questions or when you say stop. Nothing changes until you accept in review.'],
  used: [['Meranti Yard', 'this project'], ['Gudang Stock', '2 weeks ago'], ['Tender Desk', '1 month ago']],
};
export const SKL_EDIT = {
  title: 'Grill the idea · Meranti copy', from: 'Grill the idea v1.3', desc: 'Grill a cost-report idea using Meranti cost words. Ask in Bahasa first.',
  stages: ['Planning', 'Specification'], body: ['Ask in Bahasa Indonesia first, English second.', 'Use the words from Meranti cost words: EAC, variance, data date.', 'One question at a time, with a recommended answer.', 'Propose glossary terms and ADRs; never change the spec directly.', 'Stop after 8 questions.'],
  checks: [['ok', 'Name, description and stages set'], ['ok', 'Asks for no tools'], ['ok', 'Reads only the context list'], ['warn', 'Upstream v1.4 is out; your copy stays on v1.3 until you merge']],
  dry: [['Glossary', 'Data date', 'tanggal data', 'The date progress is measured to.'], ['Glossary', 'EAC', 'perkiraan biaya akhir', 'Estimate at completion.'], ['ADR', 'Variance threshold is set per package', '', 'Hard to reverse; changes every alert.']],
};
export const SKL_GH = {
  url: 'https://github.com/mattpocock/skills', found: 27, licence: 'MIT', file: 'LICENSE at 9b1f07e', notice: 'Copyright (c) 2026 Matt Pocock',
  groups: [['Planning', [['grill-me', true], ['wayfinder', false], ['research', false]]], ['Specification', [['to-spec', true], ['to-tickets', true], ['domain-modeling', true]]], ['Testing', [['tdd', true], ['code-review', true], ['diagnosing-bugs', false]]]],
  checks: [['ok', 'Licence found: MIT, notice kept with every skill'], ['ok', 'Each skill has a name and a description'], ['ok', 'No skill asks for tools'], ['warn', '2 skills include scripts: they are kept for export only and never run on Spekin'], ['ok', 'No hidden instructions found by the text scan']],
};
export const SKL_UPDATES = [
  { when: 'Today 06:00', src: 'mattpocock/skills', from: '4c9e2a1', to: '9b1f07e', applied: 2, held: 1, rows: [['ok', 'Test first', 'Wording only; checks passed', 'Applied'], ['ok', 'Review against the spec', 'New step: link each finding to a criterion', 'Applied'], ['warn', 'Split into tickets', 'Asks for a new tool: create issues on GitHub', 'Held for you']] },
  { when: '19 Nov 06:00', src: 'mattpocock/skills', from: 'e17a6c0', to: '4c9e2a1', applied: 3, held: 0, rows: [] },
  { when: '12 Nov 09:14', src: 'Spekin templates', from: 'v0.3', to: 'v0.4', applied: 1, held: 0, rows: [] },
];
export const SKL_DIFF = [
  [' ', '## Process'], [' ', '1. Read the spec and the accepted glossary.'], ['-', '2. Split into vertical slices.'], ['+', '2. Split into thin vertical slices; each one demoable on its own.'], ['+', '3. Create each ticket as a GitHub issue.'], [' ', '4. Give each ticket criteria that fail at the starting commit.'],
];
export const SKL_GLOSS = [['Data date', 'tanggal data', 'The date progress is measured to.', 'proposed'], ['EAC', 'perkiraan biaya akhir', 'Estimate at completion.', 'proposed'], ['Variance', 'selisih', 'Forecast minus budget for a package.', 'accepted'], ['Package', 'paket pekerjaan', 'A priced scope of work in the cost report.', 'accepted']];
