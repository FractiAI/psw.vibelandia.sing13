/**
 * Catalog of novel / newly framed observations from applying
 * Net Zero Expedition 001 Complementary Structure Inference grammar
 * to the periodic table (Group 13↔15 focus + adjacent complements).
 *
 * Honesty: “novel” here means newly framed / jointly scored under this model
 * in this suite — not a claim of first discovery in chemistry history.
 */

/** @typedef {{ id: string, claim: string, evidenceIds: string[], tier: 'operational'|'empirical'|'narrative', survivesIndependentScales?: boolean }} NovelObservation */

/** @type {NovelObservation[]} */
export const NOVEL_OBSERVATION_CATALOG = [
  {
    id: 'NZ-PT-01',
    claim:
      'Group index involution R(13)=15 (and inverse) plus valence 3+5=8 frames period-paired triel/pnictogen couples as Net Zero complementary accounts flanking Group 14, not merely adjacent columns.',
    evidenceIds: ['A_complement_grammar'],
    tier: 'operational',
  },
  {
    id: 'NZ-PT-02',
    claim:
      'Pauling Δχ = χ(G15)−χ(G13) is strictly positive across periods 2–6 and shows a negative Spearman association with period number (period-dependent attenuation), without requiring strict monotonicity through period 6.',
    evidenceIds: ['B_pauling_period_pattern'],
    tier: 'empirical',
    survivesIndependentScales: true,
  },
  {
    id: 'NZ-PT-03',
    claim:
      'The same period-paired Δχ sign pattern and period association survive on the independent Allen spectroscopic electronegativity scale with high Spearman concordance to the Pauling Δχ series.',
    evidenceIds: ['C_allen_survival', 'G_permutation_null'],
    tier: 'empirical',
    survivesIndependentScales: true,
  },
  {
    id: 'NZ-PT-04',
    claim:
      'The Allred–Rochow electrostatic electronegativity scale independently recovers the same complementary Δχ sign pattern and period association with high concordance to Pauling.',
    evidenceIds: ['D_allred_rochow_survival'],
    tier: 'empirical',
    survivesIndependentScales: true,
  },
  {
    id: 'NZ-PT-05',
    claim:
      'An independent non-electronegativity property — first ionization energy difference ΔIE1(G15−G13) — is positively rank-concordant with Pauling Δχ and likewise attenuates with period.',
    evidenceIds: ['E_ionization_concordance'],
    tier: 'empirical',
    survivesIndependentScales: true,
  },
  {
    id: 'NZ-PT-06',
    claim:
      'Covalent-radius differences supply a geometric complement: for periods 2–5, G15 is smaller than G13, and −Δr tracks Pauling Δχ; period 6 (Tl/Bi) is the expected heavy-element soft edge, not a silent failure.',
    evidenceIds: ['F_radius_complement'],
    tier: 'empirical',
  },
  {
    id: 'NZ-PT-07',
    claim:
      'Under the Expedition 001 non-uniqueness lesson, multiple EN scales can complete the same “G15 more EN than G13” constraint; concordance + permutation rarity distinguish shared structure from a single-scale artifact.',
    evidenceIds: ['C_allen_survival', 'D_allred_rochow_survival', 'G_permutation_null'],
    tier: 'narrative',
  },
  {
    id: 'NZ-PT-08',
    claim:
      'Complementary Structure Inference applied here surfaces a cross-property ledger (EN scales + IE + radii) rather than a single missing half — a distributed Net Zero account of the triel/pnictogen period pairs.',
    evidenceIds: [
      'B_pauling_period_pattern',
      'C_allen_survival',
      'D_allred_rochow_survival',
      'E_ionization_concordance',
      'F_radius_complement',
    ],
    tier: 'narrative',
  },
];

export function catalogSummary(experimentPassMap) {
  const rows = NOVEL_OBSERVATION_CATALOG.map((o) => {
    const evidencePass = o.evidenceIds.every((id) => experimentPassMap[id] !== false);
    return {
      ...o,
      evidencePass,
      status: evidencePass ? 'supported_in_suite' : 'blocked_by_failed_evidence',
    };
  });
  return {
    n: rows.length,
    nSupported: rows.filter((r) => r.status === 'supported_in_suite').length,
    rows,
    honesty:
      'Catalog entries are suite-framed observations under Net Zero Expedition 001 grammar — not a claim of absolute historical priority in chemistry.',
  };
}
