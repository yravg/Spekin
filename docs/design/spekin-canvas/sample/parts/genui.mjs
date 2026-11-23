// Sample data for the GenUI board group (S38 Contextual GenUI panel). Fictional; same project as meranti-yard.mjs.
// GENUI_CARDS holds the cards the panel records, each with the verdict the Rust validator reached for it
// (crates/spekin-core/src/genui.rs). crates/spekin-core/tests/genui_cards.rs reads fixtures/genui-cards.json
// and fails when a recorded verdict differs from genui::validate, so these stay true (IMP-36).
export const GENUI_CARDS = [
  {
    id: 'AC-DASH-019',
    title: 'AC-DASH-019 · Alert after 2 periods over 3%',
    family: 'checklist',
    payload: {
      schema_version: 1,
      id: 'AC-DASH-019',
      title: 'AC-DASH-019 · Alert after 2 periods over 3%',
      provenance: 'imported_observation',
      body: null,
      links: ['/p/meranti-yard/spec/r14#R-DASH-014'],
      actions: [
        { kind: 'expand_details', label: 'Details', target_id: 'AC-DASH-019', href: null },
        { kind: 'pin', label: 'Pin', target_id: 'AC-DASH-019', href: null },
      ],
      family: 'checklist',
      items: [
        { id: 'c1', label: 'Alert raised after 2 periods over 3%', checked: false, status: 'untested' },
        { id: 'c2', label: 'Threshold read from accepted spec r14', checked: true, status: 'passed_fixture' },
        { id: 'c3', label: 'No alert for P-04 at −3.4%', checked: false, status: 'no_evidence' },
      ],
      summary: '1 of 3 passed. Nothing else is shown as passed.',
    },
    verdict: { status: 'valid' },
  },
  {
    id: 'P-04-variance',
    title: 'P-04 variance comparison',
    family: 'comparison',
    payload: {
      schema_version: 1,
      id: 'P-04-variance',
      title: 'P-04 variance comparison',
      provenance: 'model_proposal',
      body: null,
      links: ['/p/meranti-yard/spec/r14#R-DASH-014'],
      // The model offered to accept the spec from inside a card. The validator refuses the whole
      // card for it (privilege escalation), so the panel shows the plain table instead.
      actions: [{ kind: 'accept', label: 'Accept', target_id: 'P-04-variance', href: null }],
      family: 'comparison',
      options: [
        { id: 'P-01', label: 'P-01 Mooring', badge: 'ok', summary: 'On track', recommended: false },
        { id: 'P-04', label: 'P-04 Marine spread', badge: 'bad', summary: null, recommended: false },
      ],
      baseline_id: 'P-01',
    },
    verdict: { status: 'rejected', reason: 'privilege-escalating action rejected: accept' },
  },
];
