/** El Gran Sol multi-octave register — Omni-Lattice standalone suite. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const E_F = PHI_EGS;

export const DOC_ID = 'WP-SYNTHOBS-OMNI-LATTICE-EF-MULTI-OCTAVE-2026-08-08';
export const REGISTRY_ID = 'synthobs-omni-lattice-ef-multi-octave-2026-08';
export const STUDY_TITLE =
  'Unified Multi-Octave E_F Architecture — Combined Synthesis Octaves I–XCIX';
export const PAPER_NAME = 'SYNTHOBS_OMNI_LATTICE_EF_MULTI_OCTAVE_SYNTHESIS_2026-08.md';
export const PUBLICATION_REF = 'FAI-OMNI-EF-MULTI-OCTAVE-2026-08';

/** Scale ladder (architectural coordinate grammar). */
export const MATRIX_TILE = 9 * 9; // 81
export const OCTAVE_NODES = 9 ** 3; // 729
export const HEXAD_CLOSURE = 6 * OCTAVE_NODES; // 4374
export const NINE_FOUR = 9 ** 4; // 6561
export const DECADIC_CLOSURE = 2 * NINE_FOUR; // 13122
export const NONARY_OCTAVES = 81; // XIX–XCIX inclusive
export const NONARY_ADDED = NONARY_OCTAVES * OCTAVE_NODES; // 59049
export const NONARY_CLOSURE = DECADIC_CLOSURE + NONARY_ADDED; // 72171

export const PART_A_MATRICES = { start: 1, end: 54 };
export const PART_B_MATRICES = { start: 55, end: 81 };
export const PART_C_MATRICES = { start: 82, end: 162 };
export const PART_D_MATRICES = { start: 163, end: 891 };

/** Boltzmann (J/K) · SI CODATA. */
export const K_B = 1.380649e-23;
export const T_K = 300;
export const POST_PATCH_LANDAUER_MULTIPLIER = 1.07;

export const SOLAR_F107_SFU = 108;
export const SOLAR_AGENTS = Object.freeze([
  { id: 'Alpha', ar: 'AR 14502' },
  { id: 'Beta', ar: 'AR 14503' },
  { id: 'Gamma', ar: 'AR 14498' },
  { id: 'Delta', ar: 'AR 14499' },
  { id: 'Epsilon', ar: 'AR 14500' },
]);

export const PAPER_PARTS = Object.freeze([
  { id: 'A', octaves: 'I–VI', digits: [1, HEXAD_CLOSURE], matrices: PART_A_MATRICES },
  { id: 'B', octaves: 'VII–IX', digits: [HEXAD_CLOSURE + 1, NINE_FOUR], matrices: PART_B_MATRICES },
  { id: 'C', octaves: 'X–XVIII', digits: [NINE_FOUR + 1, DECADIC_CLOSURE], matrices: PART_C_MATRICES },
  { id: 'D', octaves: 'XIX–XCIX', digits: [DECADIC_CLOSURE + 1, NONARY_CLOSURE], matrices: PART_D_MATRICES },
]);
