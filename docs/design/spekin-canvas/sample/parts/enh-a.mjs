// Sample data for the enhance-prompt canvas (boards-enh-a.mjs, board S41). Names start with ENH_. Fictional Meranti Yard only.
export const ENH_READY = true;

// The user's draft, in Bahasa Indonesia, and the enhanced version as segments: [kind, text]
// kind: k kept from the draft, c changed wording, a added from project context, s assumption (user can remove)
export const ENH_ORIGINAL = 'tambahin drawer alert di tabel varians buat paket yang lewat 3%';
export const ENH_SEGS = [
  ['c', 'Tambahkan'], ['k', ' drawer alert di '], ['c', 'F-03 Variance table (tabel varians)'], ['k', ' untuk paket yang '], ['c', 'forecast-nya melebihi budget lebih dari 3%'], ['k', '.'],
  ['a', ' Setiap alert menyebut paket dan periodenya (D-12).'],
  ['a', ' Gambar sebagai draft F-04; F-03 tetap diterima di r6.'],
  ['s', ' Drawer dibuka dari baris paket yang ditandai.', 'A1'],
  ['s', ' Isi drawer: nama paket dan persen varians.', 'A2'],
];
// what the original shows in the compare column: [kind, text]; d = removed or reworded in the enhanced text
export const ENH_ORIG_SEGS = [['d', 'tambahin'], ['k', ' drawer alert di '], ['d', 'tabel varians'], ['k', ' buat paket yang '], ['d', 'lewat 3%']];
export const ENH_ASSUMPTIONS = [['A1', 'Drawer dibuka dari baris paket yang ditandai.'], ['A2', 'Isi drawer: nama paket dan persen varians.']];
// context the enhance run reads: [icon, label, value]
export const ENH_CTX = [
  ['flag', 'Stage', 'Design, 3 of 8'],
  ['lock', 'Spec revision', 'r14 accepted'],
  ['frame', 'Selected frame', 'F-03 Variance table, accepted r6'],
  ['doc', 'Artifact', 'DESIGN.md r3'],
  ['req', 'Requirement', 'R-DASH-014, threshold 3%'],
  ['history', 'Decision log', 'D-12 alert names package and period; D-07 money never rounded'],
];
export const ENH_NOT_SENT = 'Other frames, the chat history and reference images are not read.';
export const ENH_COST = { est: '≈ 1–2 cr', actual: '1.4 cr', max: '3 cr', time: '2.1 s', send: '≈ 18–30 cr', words: ['9 words', '58 words'] };
export const ENH_SHORTCUT = 'Ctrl/Cmd+Shift+E';
export const ENH_BLOCKED = [
  ['Credit cap reached', 'bad', 'Used 5,000 of 5,000 cr this month. Enhance needs about 2 cr. Your draft is untouched.', ['Open usage', 'Use my own key']],
  ['Offline', 'warn', 'No connection. Enhance needs the server; your draft is kept on this device and can still be sent when you are back online.', ['Retry']],
  ['Server error', 'warn', 'The enhance run failed (E-503). Nothing was charged and your draft is unchanged.', ['Try again', 'Send as is']],
];
