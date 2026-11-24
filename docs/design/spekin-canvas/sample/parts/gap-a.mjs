// Sample data for gaps-canvas group A (boards-gap-a.mjs). Names start with GAPA_. Fictional Meranti Yard only.
export const GAPA_READY = true;

// S02 sign-in
export const GAPA_USER = { email: 'rina@meranti-yard.example', code: ['4', '8', '1', '', '', ''], resend: '0:42', left: 2 };
export const GAPA_TERMS = {
  title: 'Syarat Penggunaan', since: 'Berlaku sejak 1 Des 2026 (contoh)', route: '/syarat',
  items: [
    ['Tentang layanan', 'Spekin membantu Anda menyusun spesifikasi produk dari sebuah ide, lewat wawancara singkat, log keputusan, dan dokumen spesifikasi.'],
    ['Akun Anda', 'Anda masuk dengan email atau akun Google. Jaga kode masuk Anda dan jangan bagikan kepada orang lain.'],
    ['Konten Anda', 'Ide, jawaban, dan dokumen yang Anda buat tetap milik Anda. Kami hanya memprosesnya untuk menjalankan layanan.'],
    ['Penggunaan yang dilarang', 'Jangan memakai Spekin untuk melanggar hukum atau mengunggah data pribadi orang lain tanpa izin.'],
    ['Kredit dan biaya', 'Pekerjaan berbayar menampilkan perkiraan biaya sebelum dijalankan. Anda boleh menolaknya.'],
    ['Perubahan syarat', 'Jika syarat berubah, kami memberi tahu Anda di aplikasi sebelum syarat baru berlaku.'],
  ],
};
export const GAPA_PRIVACY = {
  title: 'Kebijakan Privasi', since: 'Berlaku sejak 1 Des 2026 (contoh)', route: '/privasi',
  rows: [
    ['Email', 'Masuk dan pemberitahuan akun', 'Selama akun aktif'],
    ['Ide dan jawaban wawancara', 'Menyusun spesifikasi', 'Selama proyek ada'],
    ['Log keputusan', 'Riwayat keputusan proyek', 'Selama proyek ada'],
    ['Catatan penggunaan', 'Kredit dan tagihan', '24 bulan'],
  ],
};

// S04 interview
export const GAPA_IDEA = 'A dashboard that shows which cost packages drift over budget, so the project controls lead sees it before month end.';
export const GAPA_ANSWERED = [
  ['Q-01', 'Who reads it first?', 'Project controls lead', 'D-001'],
  ['Q-02', 'How long should this take?', '2 weeks, one small team', 'D-002'],
  ['Q-03', 'When is a package flagged?', 'Forecast over budget by more than 3%', 'D-003'],
];
export const GAPA_SKIPPED = ['Q-04', 'Where do actual costs come from?'];
export const GAPA_Q5 = {
  id: 'Q-05', n: 5,
  text: 'What should the screen show when no package is over the threshold?',
  rec: 'Show a calm line: "No package over 3% this period".',
  why: 'You flagged packages at 3% (D-003). An empty alert area looks broken; a short line says the check ran.',
  alts: ['Hide the alert panel', 'Show last month’s alerts', 'Show the three closest packages'],
};
export const GAPA_PITCH_FIELDS = [
  ['Problem', 'ok', 'From Q-01'],
  ['Appetite', 'ok', 'From Q-02'],
  ['Solution', 'half', 'From Q-03, empty state still open'],
  ['Rabbit holes', 'ring', 'Not asked yet'],
  ['No-gos', 'ring', 'Not asked yet'],
];
export const GAPA_GROUND = [
  ['req', 'R-DASH-014', 'r14', 'Verified fact', 'ok', 'Accepted spec: flag a package when forecast exceeds budget by more than 3%.'],
  ['frame', 'F-03 Variance table', 'r6', 'Verified fact', 'ok', 'Accepted frame: the table shows four packages and a variance column.'],
  ['doc', 'Rina, message 12:04', 'owner', 'Owner report', 'warn', '"Finance may change the threshold per package next quarter."'],
  ['req', 'R-DASH-009', 'r14', 'Contradiction', 'bad', 'Spec says the alert drawer is read-only; the owner report asks to edit thresholds there.'],
];
export const GAPA_WHY = {
  plain: 'A calm line tells the controls lead the check ran and found nothing. It avoids a blank panel, which people read as a bug.',
  evidence: ['D-003 flagging rule: more than 3% over budget', 'F-04 Alert drawer (draft): has no empty state yet'],
  tradeoffs: [['Calm line', 'Clear and cheap to build. Adds one more string to translate.'], ['Hide the panel', 'Cleanest screen. People cannot tell a quiet month from a broken check.'], ['Show last month', 'Useful context. Risks acting on old alerts.']],
};

// S05 decision log
export const GAPA_LOG = [
  { id: 'D-001', q: 'Q-01', qt: 'Who reads it first?', dec: 'Project controls lead', alts: ['Project manager', 'Cost engineer', 'Finance'], by: 'Rina (sample)', at: '24 Nov 12:01', how: 'Accepted recommendation', kind: 'Interview', field: 'Problem' },
  { id: 'D-002', q: 'Q-02', qt: 'How long should this take?', dec: '2 weeks, one small team', alts: ['1 week', '6 weeks'], by: 'Rina (sample)', at: '24 Nov 12:03', how: 'Edited recommendation', kind: 'Interview', field: 'Appetite' },
  { id: 'D-003', q: 'Q-03', qt: 'When is a package flagged?', dec: 'Forecast over budget by more than 3%', alts: ['More than 5%', 'More than 10%', 'Set per package'], by: 'Rina (sample)', at: '24 Nov 12:06', how: 'Accepted recommendation', kind: 'Interview', field: 'Solution' },
];
export const GAPA_OPEN = [
  { id: 'OQ-01', q: 'Q-04', qt: 'Where do actual costs come from?', at: '24 Nov 12:08', where: 'Spec section 2, open questions' },
];
export const GAPA_KIT = { id: 'D-004', q: 'PLAN-01', qt: 'Which design kit does the plan use?', dec: 'yravg UI (default)', alts: ['shadcn/ui as shipped', 'A custom kit'], by: 'Rina (sample)', at: '24 Nov 14:20', how: 'Accepted default', kind: 'Kit' };
export const GAPA_NOBASIS = { text: 'Alert emails go to the controls lead', where: 'Spec section 3, Detailed layer', note: 'No decision-log entry and no pack source. Confirm or remove.' };

// S06 pitch
export const GAPA_PITCH = [
  ['Problem', 'Project controls leads at Meranti Yard see cost overruns a month late because variance sits in three spreadsheets. They need one view of which packages drift over budget.', ['D-001'], ''],
  ['Appetite', '2 weeks, one small team.', ['D-002'], ''],
  ['Solution', 'A variance table per package, a 3% flag on over-budget rows, and an alert drawer that says so when no package is over.', ['D-003'], ''],
  ['Rabbit holes', 'Actual costs may arrive late. The pitch shows a stale-data label instead of guessing. Where actual costs come from is still open.', ['OQ-01'], ''],
  ['No-gos', 'No forecasting model, no approval workflow and no per-user permissions in this increment.', [], 'nobasis'],
];
export const GAPA_SLICES = [
  ['T-01', 'Variance table for four packages', 'Schema, API, table, tests', 'None'],
  ['T-02', '3% flag on over-budget rows', 'Rule, API field, row style, tests', 'T-01'],
  ['T-03', 'Alert drawer with an empty line', 'Alert query, drawer, empty line, tests', 'T-02'],
  ['T-04', 'Actual-cost import', 'Import job, mapping, tests', 'OQ-01 open'],
  ['T-05', 'Stale-data label', 'Last-import time, label, tests', 'T-04'],
];
