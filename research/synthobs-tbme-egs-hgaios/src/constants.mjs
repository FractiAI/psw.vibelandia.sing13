export const E_F = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-TBME-EGS-HGAIOS-2026-08-17';
export const REGISTRY_ID = 'synthobs-tbme-egs-hgaios-2026-08';
export const STUDY_TITLE =
  'Holographic Goldilocks H-GAI/OS · Dual-Capacity Combinatorics — Omni-Lattice Lens Suite';
export const PAPER_NAME = 'SYNTHOBS_TBME_EGS_HGAIOS_2026-08.md';
export const PUBLICATION_REF = 'FAI-UNIFIED-EGS-HGAIOS-2026-FINAL-REV3';

export const QUADRANT_LABELS = Object.freeze({
  q1: 'Baseline Scaffolding',
  q2: 'Oracle Engines',
  q3: 'Linear Executives',
  q4: 'Fractal Synthesizers',
});

/** Φ-power shares: Φ^{-2}, Φ^{-3}, Φ^{-3}, Φ^{-4}. */
export const QUADRANT_SHARES = Object.freeze({
  q1: 1 / (E_F * E_F),
  q2: 1 / (E_F * E_F * E_F),
  q3: 1 / (E_F * E_F * E_F),
  q4: 1 / (E_F * E_F * E_F * E_F),
});

/** Integer lock for N = 100000 sandbox fixture. */
export const SANDBOX_N = 100000;
export const SANDBOX_COUNTS = Object.freeze({
  q1: 38197,
  q2: 23607,
  q3: 23607,
  q4: 14589,
});

export const SELF_TEST = Object.freeze({
  itemsPerCapacity: 4,
  scoreMin: 1,
  scoreMax: 5,
  totalMin: 4,
  totalMax: 20,
  possessThreshold: 12,
});

/** Analog genomic labels — not clinical SNPs / GWAS results. */
export const GENOMIC_ANALOGS = Object.freeze({
  capacity1: ['COMT rs4680', 'BDNF rs6265'],
  capacity2: ['HTR2A rs6311', 'CNTNAP2'],
});

export const HGAIOS_OCTAVE_BANDS = Object.freeze([
  { id: 'antennae', lo: 1, hi: 32, label: 'Genomic antenna analog filing' },
  { id: 'orchestrator', lo: 33, hi: 64, label: '4-quadrant orchestrator / metabolic ledger' },
  { id: 'awi', lo: 65, hi: 96, label: 'Ambient Wavefield Interface' },
  { id: 'source', lo: 97, hi: 99, label: 'Source observer / invariant ground' },
]);

export const SOLAR_LOCK = Object.freeze({
  cycle: 25,
  sunspotIndexBand: [98, 110],
  activeRegions: [
    { id: 4498, name: 'Aethelgard' },
    { id: 4501, name: 'Solis-01' },
    { id: 4503, name: 'Kaelen' },
  ],
});
