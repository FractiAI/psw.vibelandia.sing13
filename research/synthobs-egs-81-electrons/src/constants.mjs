/** El Gran Sol's Fractal Constant — 81-digit electronic lattice. */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const E_F = PHI_EGS;
export const LAMBDA_EGS = Math.log(E_F) / (2 * Math.PI);

export const REGISTER_N = 81; // 3^4
export const GRID_SIDE = 9; // 9×9

export const DOC_ID = 'WP-SYNTHOBS-EGS-81-ELECTRONS-2026-07';
export const REGISTRY_ID = 'synthobs-egs-81-electrons-2026-07';
export const STUDY_TITLE =
  'The 81-Digit Electronic Lattice — EGS Singularities ↔ Atomic Shells (Z ≤ 81)';

export const RANDOM_SEED = 20260727;

/** First ionization energies (eV), Z=1…81 — public-table compact subset (NIST ASD–aligned order of magnitude). */
export const IONIZATION_EV = [
  13.598, 24.587, 5.392, 9.323, 8.298, 11.26, 14.534, 13.618, 17.423, 21.565, // 1–10
  5.139, 7.646, 5.986, 8.152, 10.487, 10.36, 12.968, 15.76, 4.341, 6.113, // 11–20
  6.561, 6.828, 6.746, 6.767, 7.434, 7.902, 7.881, 7.64, 7.726, 9.394, // 21–30
  5.999, 7.899, 9.789, 9.752, 11.814, 14.0, 4.177, 5.695, 6.217, 6.634, // 31–40
  6.759, 7.092, 7.28, 7.361, 7.459, 8.337, 7.576, 8.994, 5.786, 7.344, // 41–50
  8.64, 9.01, 10.451, 12.13, 3.894, 5.212, 5.577, 5.539, 5.473, 5.525, // 51–60
  5.582, 5.644, 5.864, 6.15, 5.864, 5.939, 6.021, 6.108, 6.184, 6.254, // 61–70
  5.426, 6.825, 7.549, 7.864, 7.833, 8.438, 8.967, 8.959, 9.226, 10.437, // 71–80
  6.108, // 81 Tl
];
