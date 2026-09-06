export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-PRIME-VAULT-ALPHAFOLD-RACE-EGS-2026-09-06';
export const REGISTRY_ID = 'synthobs-prime-vault-alphafold-race-2026-09';
export const STUDY_TITLE =
  'Prime-Vault vs AlphaFold Race — Catalog Benchmark Suite';
export const PAPER_NAME = 'SYNTHOBS_PRIME_VAULT_ALPHAFOLD_RACE_EGS_2026-09.md';
export const SHIP_BLOG_SLUG = 'prime-vault-alphafold-race';
export const SHIP_BLOG_FILE = 'blog-prime-vault-alphafold-race-2026-09.html';
export const STANDALONE_REPO =
  'https://github.com/FractiAI/synthobs-prime-vault-alphafold-race';

/** Tier 1 — Ubiquitin-class monomer residue count (catalog). */
export const TIER_SIMPLE = Object.freeze({
  id: 'simple_ubiquitin',
  name: 'Ubiquitin-class monomer',
  residues: 76,
  octave: 1,
  afLatencyBandMin: 60_000, // ms talk — minutes-class inference framing
  afGpuHoursTalk: 0.05,
});

/** Tier 2 — IL-2 complex-class heterodimer node talk. */
export const TIER_COMPLEX = Object.freeze({
  id: 'complex_il2',
  name: 'Interleukin-2 complex class (heterodimer)',
  residues: 280,
  octave: 2,
  afLatencyBandMin: 600_000,
  afGpuHoursTalk: 2,
});

/** Tier 3 — De novo orphan / synthetic lattice construct. */
export const TIER_FRONTIER = Object.freeze({
  id: 'frontier_orphan',
  name: 'De novo orphan / synthetic lattice',
  residues: 120,
  octave: 3,
  afLatencyBandMin: 300_000,
  afGpuHoursTalk: 1,
  afConfidenceDrop: true,
});

/** Catalog accuracy contrast labels (not deposited PDB bake-off scores). */
export const ACCURACY_LABELS = Object.freeze({
  gdtTsTalk: 0.95,
  tmScoreTalk: 0.95,
  rmsdTalkAngstrom: 1.5,
});

export const FAIR_EXCHANGE_CLAUSE =
  'Financial grants, institutional funding, or academic utility micro-grants are subject to partial refund or adjustment depending on overall delivery, rigorous execution, and practical empirical utility.';

export const HONESTY =
  'Catalog / algebraic race fixtures for Infinite Octave prime-vault vs AlphaFold-class framing. Does not claim live AF2/AF3 API runs, CASP medal transfer, audited GPU invoices, deposited PDB coordinates, or clinical folding QED.';
