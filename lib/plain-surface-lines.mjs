/** One plain sentence per catalog card — surfaces only; paper bodies stay technical. */

export const CATEGORY_PLAIN = {
  'dph-gpu': 'Holographic code · math and receipts',
  hhf: 'Hydrogen framework · deep read inside',
  coherence: 'Coherence rail · honesty and mining ops',
  agentic: 'Agent layer · mythos and operations',
  'special-projects': 'Special project · study or demo',
  'reproducible-research': 'Reproducible repo · run the pipeline yourself',
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
  'fractiai-ac-hmm-satellites-2026': 'AC-HMM on T2T centromeres — UCSC DNA, audit ledger.',
  'fractiai-hgt-psd-covariance-2026': 'Hi-C PSD maps — ENCODE/UCSC, PSD by construction.',
  'fractiai-eesm-gpu-telemetry-2026': 'GPU telemetry epigenetics — MLPerf/CUTLASS corpus.',
  'fractiai-egs-nlrf-2026': 'Hydrogen lattice hypothesis — NIST Balmer experiments.',
  'repo-ac-hmm-satellites': 'Clone and run AC-HMM on GitHub.',
  'repo-hgt-psd-covariance': 'Clone and run HGT-PSD on GitHub.',
  'repo-eesm-gpu-telemetry': 'Clone and run EESM pipeline on GitHub.',
  'repo-egs-nlrf': 'Clone and run EGS-NLRF on GitHub.',
  'recursive-attention-quantum-solar-dna-loop-2026':
    'One attention thread — imagination to solar and back. All temporal hops pass actual-vs-modelled (June 2026).',
  'egs-trans-jspace-convergence-2026-07':
    'Frontier multi-model J-Space convergence — canonical repo on GitHub only.',
  'repo-egs-trans-jspace-convergence': 'Clone and run EGS-TRANS pipeline on GitHub.',
  'ip-infringement-draft-2026-07':
    'Code-Print Audit, IP assertion draft, J-Lens Live — canonical repo on GitHub only.',
  'ip-infringement-draft-console': 'IP audit lane — run from the standalone GitHub repo.',
  'j-lens-live-dashboard': 'J-Lens φ dashboard — run from the standalone GitHub repo.',
  'omniversal-goldilocks-rideshare-2026-07': 'OGRP rideshare protocol — Reno micro-mobility gates.',
  'repo-omniversal-goldilocks-rideshare': 'Clone and run OGRP empirical pipeline on GitHub.',
  'synthobs-egs-planck-scale-harmonic-2026-07':
    'Planck 1.6 bridge + 81-digit Goldilocks grid — 9/9 empirical pass.',
  'repo-synthobs-egs-planck-scale-harmonic':
    'Clone and run the Planck–1.6 EGS empirical suite on GitHub.',
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
