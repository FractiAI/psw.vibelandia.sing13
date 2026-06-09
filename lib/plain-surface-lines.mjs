/** One plain sentence per catalog card — surfaces only; paper bodies stay technical. */

export const CATEGORY_PLAIN = {
  'dph-gpu': 'Holographic code · math and receipts',
  hhf: 'Hydrogen framework · deep read inside',
  coherence: 'Coherence rail · honesty and mining ops',
  agentic: 'Agent layer · mythos and operations',
  'special-projects': 'Special project · study or demo',
  protocols: 'Protocol spine · how the ship runs',
};

/** Per-id overrides (whitepaper id or surface id). */
export const PLAIN_SURFACE_LINES = {
  'syn-sun-wavefield-oscillator': 'Solar wavefield — check NOAA yourself.',
  'dp-syntheverse-sandbox-comprehensive-2026': 'Sandbox win report — King Bee run, May 31.',
  'dp-omniversal-node-alignment-2026': 'Node alignment sweep — June 1 receipts.',
  'synthobs-emergent-sync-multi-agent-2026': 'Multi-agent sync — SynthOBS validation loop.',
  'nspfrnp-snap-peer-review-audit': 'How papers get peer-reviewed on this edge.',
  'dp-synthobs-mca-2026': 'Index of June Synthobs math papers.',
  'synthobs-hex-organ-engine-2026': 'Hex-Organ math engine — six chambers.',
  'goldilocks-erdos-mathematics': 'Erdős 353 — math audit story.',
  'rev-egs-hhf-mythos': 'Mythos clock-skew review — honesty rails.',
  'ops-egs-btc-mining': 'BTC Buffalo mining ops — legal frame.',
  'coherence-plain-speak': 'What is real vs metaphor on this site.',
  'geomagnetic-herbivore-2026': 'Bison and storms — study surface.',
  'goldilocks-geomagnetic-wavefield-multitaxa': 'Multi-species wavefield paper.',
  'turner-kruse-response': 'Turner herd study — plain response.',
  'sing13-edge-onboarding': 'Plain start guide for this website.',
  'mca-nspfrnp-catalog': 'NSPFRNP catalog — team coordination spine.',
  'bbhe-repository-standard': 'How this repo is organized.',
  'erdos-holographic-aios-audit': 'Live Erdős audit demo — 353 problems.',
  'hero-houdini-coherence': 'BTC coherence console — live pulses.',
  'goldilocks-os-demo': 'Goldilocks OS product demo.',
  'wavefield-solar-live': 'Live solar telemetry API.',
  'synthobs-paper-audit-api': 'Run a PRA Snap audit on a paper.',
  'geomagnetic-herbivore-study': 'Geomagnetic herbivore dashboard.',
};

export function plainLineFor(item) {
  if (!item) return '';
  return (
    PLAIN_SURFACE_LINES[item.id] ||
    (item.whitepaperId && PLAIN_SURFACE_LINES[item.whitepaperId]) ||
    CATEGORY_PLAIN[item.category] ||
    'Technical paper · full write-up inside'
  );
}
