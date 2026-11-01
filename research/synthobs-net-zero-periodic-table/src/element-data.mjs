/**
 * Period-paired Group 13 (triel) ↔ Group 15 (pnictogen) tables.
 * Sources are literature tabulations embedded for reproducible offline runs —
 * not new experimental measurements.
 *
 * Pauling χ: common CRC / IUPAC-teaching Pauling values
 * Allen χ: spectroscopic Allen scale (Allen 1989 / literature tables)
 * Allred–Rochow χ: electrostatic AR scale
 * IE1: first ionization energy (kJ/mol) — CRC Handbook-class tabulations
 * r_cov: single-bond covalent radii (pm) — Cordero et al. Dalton Trans. 2008
 */

export const PERIODS = [2, 3, 4, 5, 6];

/** @type {Record<string, {Z:number, period:number, group:13|15, symbol:string}>} */
export const ELEMENTS = {
  B: { Z: 5, period: 2, group: 13, symbol: 'B' },
  Al: { Z: 13, period: 3, group: 13, symbol: 'Al' },
  Ga: { Z: 31, period: 4, group: 13, symbol: 'Ga' },
  In: { Z: 49, period: 5, group: 13, symbol: 'In' },
  Tl: { Z: 81, period: 6, group: 13, symbol: 'Tl' },
  N: { Z: 7, period: 2, group: 15, symbol: 'N' },
  P: { Z: 15, period: 3, group: 15, symbol: 'P' },
  As: { Z: 33, period: 4, group: 15, symbol: 'As' },
  Sb: { Z: 51, period: 5, group: 15, symbol: 'Sb' },
  Bi: { Z: 83, period: 6, group: 15, symbol: 'Bi' },
};

/** Canonical period pairs (G13, G15) */
export const PERIOD_PAIRS = [
  { period: 2, g13: 'B', g15: 'N' },
  { period: 3, g13: 'Al', g15: 'P' },
  { period: 4, g13: 'Ga', g15: 'As' },
  { period: 5, g13: 'In', g15: 'Sb' },
  { period: 6, g13: 'Tl', g15: 'Bi' },
];

export const PAULING = {
  B: 2.04,
  Al: 1.61,
  Ga: 1.81,
  In: 1.78,
  Tl: 1.62,
  N: 3.04,
  P: 2.19,
  As: 2.18,
  Sb: 2.05,
  Bi: 2.02,
};

/** Independent electronegativity scale (Allen) */
export const ALLEN = {
  B: 2.051,
  Al: 1.613,
  Ga: 1.756,
  In: 1.656,
  Tl: 1.789,
  N: 3.066,
  P: 2.253,
  As: 2.211,
  Sb: 1.984,
  Bi: 2.01,
};

/** Independent electronegativity scale (Allred–Rochow) */
export const ALLRED_ROCHOW = {
  B: 2.01,
  Al: 1.47,
  Ga: 1.82,
  In: 1.49,
  Tl: 1.44,
  N: 3.07,
  P: 2.06,
  As: 2.2,
  Sb: 1.82,
  Bi: 1.67,
};

/** First ionization energy kJ/mol */
export const IE1_KJ = {
  B: 800.6,
  Al: 577.5,
  Ga: 578.8,
  In: 558.3,
  Tl: 589.4,
  N: 1402.3,
  P: 1011.8,
  As: 947.0,
  Sb: 834.0,
  Bi: 703.0,
};

/** Covalent radius pm (Cordero) */
export const R_COV_PM = {
  B: 84,
  Al: 121,
  Ga: 122,
  In: 142,
  Tl: 145,
  N: 71,
  P: 107,
  As: 119,
  Sb: 139,
  Bi: 148,
};

export const DATA_SOURCES = {
  pauling: 'Pauling electronegativity · CRC / common teaching tabulation',
  allen: 'Allen spectroscopic electronegativity · literature tables (Allen 1989 lineage)',
  allredRochow: 'Allred–Rochow electrostatic electronegativity · literature tables',
  ie1: 'First ionization energy (kJ/mol) · CRC Handbook-class tabulation',
  rCov: 'Single-bond covalent radii (pm) · Cordero et al., Dalton Trans. 2008',
};
