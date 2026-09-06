export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

export const DOC_ID = 'WP-SYNTHOBS-PRIME-VAULT-ALPHAFOLD-RACE-EGS-2026-09-06';
export const REGISTRY_ID = 'synthobs-prime-vault-alphafold-race-2026-09';
export const STUDY_TITLE =
  'Prime-Vault vs ColabFold (AlphaFold-class) Race — Live-Capable Benchmark Suite';
export const PAPER_NAME = 'SYNTHOBS_PRIME_VAULT_ALPHAFOLD_RACE_EGS_2026-09.md';
export const SHIP_BLOG_SLUG = 'prime-vault-alphafold-race';
export const SHIP_BLOG_FILE = 'blog-prime-vault-alphafold-race-2026-09.html';
export const STANDALONE_REPO =
  'https://github.com/FractiAI/synthobs-prime-vault-alphafold-race';

/**
 * Tier 1 — Human ubiquitin (P0CG48) · 76 aa FastA fixture.
 * ColabFold lane: fixtures/fasta/tier1_ubiquitin.fasta
 */
export const TIER_SIMPLE = Object.freeze({
  id: 'simple_ubiquitin',
  name: 'Ubiquitin-class monomer (P0CG48)',
  residues: 76,
  octave: 1,
  fastaKey: 'simple_ubiquitin',
  /** Soft upper bound for ColabFold monomer talk when not live (ms). */
  colabfoldLatencyBandMinMs: 60_000,
  colabfoldGpuHoursTalk: 0.05,
});

/**
 * Tier 2 — IL-2 + IL-2Rβ fragment multimer FastA · 264 aa total.
 * ColabFold lane: fixtures/fasta/tier2_il2_complex.fasta
 */
export const TIER_COMPLEX = Object.freeze({
  id: 'complex_il2',
  name: 'Interleukin-2 + IL-2Rβ fragment complex',
  residues: 264,
  octave: 2,
  fastaKey: 'complex_il2',
  colabfoldLatencyBandMinMs: 600_000,
  colabfoldGpuHoursTalk: 2,
});

/**
 * Tier 3 — De novo orphan synthetic lattice · 89 aa.
 * ColabFold lane: fixtures/fasta/tier3_orphan_synthetic.fasta
 */
export const TIER_FRONTIER = Object.freeze({
  id: 'frontier_orphan',
  name: 'De novo orphan / synthetic lattice',
  residues: 89,
  octave: 3,
  fastaKey: 'frontier_orphan',
  colabfoldLatencyBandMinMs: 300_000,
  colabfoldGpuHoursTalk: 1,
  colabfoldMsaSparse: true,
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
  'Prime-vault lane always runs live (closed-form CPU). ColabFold is the AlphaFold-class comparison lane: live when COLABFOLD_LIVE=1 and colabfold_batch is installed; otherwise the suite locks adapter discovery + FastA fixtures and does not invent pLDDT/PDB. Not CASP medal transfer, audited GPU invoices, or clinical folding QED.';
