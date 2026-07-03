/** Literature-anchored constants for SYNTHOBS chromosomal electrodynamics empirical tier. */

export const PHI_EGS = (1 + Math.sqrt(5)) / 2; // ≈ 1.6180339887
export const LOG10_PHI = Math.log10(PHI_EGS);

/** B-DNA rise per bp (nm) — standard Watson-Crick pitch. */
export const DELTA_X_M = 0.34e-9;

/** UCSC hs1 = T2T-CHM13v2.0 assembly (NCBI GCA_009914755.4). */
export const UCSC_HS1_CHROM_SIZES_URL =
  'https://hgdownload.soe.ucsc.edu/goldenPath/hs1/bigZips/hs1.chrom.sizes';

/** RCSB PDB 6VXX — SARS-CoV-2 spike glycoprotein (Wrapp et al. 2020). */
export const PDB_SPIKE_ENTRY = '6VXX';
export const PDB_SPIKE_CIF_URL = `https://files.rcsb.org/download/${PDB_SPIKE_ENTRY}.cif`;

/**
 * Honeybee worker antenna length (m) — Stange et al. 2011 morphometric baseline.
 * @see docs/SYNTHOBS_CROSS_SCALE_BIOLOGICAL_ANTENNAE_WAVE_DAMPING_2026-07.md
 */
export const HONEYBEE_ANTENNA_LENGTH_M = 1.5e-3;

/**
 * Published THz absorption peaks for hydrated DNA (GHz).
 * Garten et al., Chem. Phys. Lett. 634 (2015) 29–32.
 */
export const GARTEN2015_DNA_THZ_PEAKS_GHZ = [220, 420, 850];

/**
 * Literature phase-velocity band for hydrated nucleoprotein / DNA EM modes (m/s).
 * Wetmore & Sen 2006; general dielectric DNA literature range.
 */
export const VP_LITERATURE_BAND_M_S = {
  low: 1.6e7,
  mid: 2.0e7,
  high: 2.4e7,
};

/**
 * Per-segment (per bp) LC parameters for discrete lattice.
 * Calibrated: v_g(0) = Δx/√(L_seg C_seg) = vp.
 */
export function lcParamsForPhaseVelocity(vp, deltaX = DELTA_X_M) {
  const sqrtLC = deltaX / vp;
  const LC = sqrtLC * sqrtLC;
  const Lseg = 1e-17; // H per bp segment (anchor)
  const Cseg = LC / Lseg;
  return { Lk: Lseg, Ck: Cseg, sqrtLC, vp, perSegment: true };
}

export const TARGET_CHROMS = ['chrY', 'chr1', 'chr21', 'chrX'];

export const CROSS_SCALE_STRUCTURES = [
  { id: 'viral_spike', label: 'SARS-CoV-2 spike (PDB 6VXX)', source: 'rcsb_pdb' },
  { id: 'honeybee_antenna', label: 'Apis mellifera antenna', source: 'literature_stange2011' },
  { id: 'chrY', label: 'Human chrY (T2T hs1)', source: 'ucsc_hs1' },
];
