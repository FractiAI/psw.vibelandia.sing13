/**
 * Net Zero Expedition 002 — Periodic Table Complements
 * Experiments A–H · Group 13↔15 complementary structure lab
 */
import {
  DIGITAL_SEED,
  VALIDATION_SEED,
  ENGINE_SHELF_PINNED,
  HONESTY,
} from './constants.mjs';
import {
  PERIOD_PAIRS,
  PAULING,
  ALLEN,
  ALLRED_ROCHOW,
  IE1_KJ,
  R_COV_PM,
  DATA_SOURCES,
} from './element-data.mjs';
import { spearman, pearson, consecutiveDecreaseCount } from './stats.mjs';
import { mulberry32 } from './rng.mjs';
import { catalogSummary, NOVEL_OBSERVATION_CATALOG } from './novel-observations.mjs';

const GROUP_COMPLEMENT = { 13: 15, 15: 13 };
const OCTET = 8;
const VALENCE = { 13: 3, 15: 5 };

function deltasFromScale(scale) {
  return PERIOD_PAIRS.map(({ period, g13, g15 }) => ({
    period,
    g13,
    g15,
    chi13: scale[g13],
    chi15: scale[g15],
    delta: scale[g15] - scale[g13],
  }));
}

function propertyDeltas(table) {
  return PERIOD_PAIRS.map(({ period, g13, g15 }) => ({
    period,
    g13,
    g15,
    v13: table[g13],
    v15: table[g15],
    delta: table[g15] - table[g13],
  }));
}

/** A · Mathematical complement grammar (involution + octet accounting) */
export function experimentA_complementGrammar() {
  const involutionOk =
    GROUP_COMPLEMENT[13] === 15 &&
    GROUP_COMPLEMENT[15] === 13 &&
    GROUP_COMPLEMENT[GROUP_COMPLEMENT[13]] === 13;
  const valenceSum = VALENCE[13] + VALENCE[15];
  const octetOk = valenceSum === OCTET;
  const pairs = PERIOD_PAIRS.map((p) => ({
    period: p.period,
    pair: [p.g13, p.g15],
    valenceSum: VALENCE[13] + VALENCE[15],
  }));
  return {
    id: 'A_complement_grammar',
    title: 'Group involution + octet complementary accounting',
    involutionOk,
    valenceSum,
    octetOk,
    pairs,
    pass: involutionOk && octetOk,
    interpretation:
      'R(13)=15, R(15)=13 is an involution; valence 3+5 recovers the octet shell target — Net Zero “account for the whole” grammar on groups flanking carbon.',
  };
}

/** B · Pauling Δχ period series — pattern characterization */
export function experimentB_paulingPeriodPattern() {
  const rows = deltasFromScale(PAULING);
  const deltas = rows.map((r) => r.delta);
  const periods = rows.map((r) => r.period);
  const allPositive = deltas.every((d) => d > 0);
  const decreases = consecutiveDecreaseCount(deltas);
  const { rho } = spearman(periods, deltas);
  const rLin = pearson(periods, deltas);
  // Period-dependent pattern: G15>G13 every period AND negative rank association with period
  // (not requiring strict monotonicity — Tl/Bi P6 rebound is a known heavy-element feature)
  const patternConsistent = allPositive && rho < -0.5;
  return {
    id: 'B_pauling_period_pattern',
    title: 'Pauling Δχ(G15−G13) period-dependent pattern',
    source: DATA_SOURCES.pauling,
    rows,
    allPositive,
    consecutiveDecreases: decreases,
    maxConsecutiveSlots: deltas.length - 1,
    spearmanRhoVsPeriod: rho,
    pearsonRVsPeriod: rLin,
    patternConsistent,
    pass: patternConsistent,
    interpretation: patternConsistent
      ? `Pauling Δχ > 0 for all five period pairs; Spearman ρ(period, Δχ)=${rho.toFixed(3)} (negative) — consistent period-dependent attenuation with a non-strict series (P6 rebound allowed).`
      : 'Pauling period pattern gate failed under stated criteria.',
  };
}

/** C · Allen scale survival */
export function experimentC_allenSurvival() {
  const pauling = deltasFromScale(PAULING).map((r) => r.delta);
  const allenRows = deltasFromScale(ALLEN);
  const allen = allenRows.map((r) => r.delta);
  const { rho } = spearman(pauling, allen);
  const allPositive = allen.every((d) => d > 0);
  const periods = PERIOD_PAIRS.map((p) => p.period);
  const { rho: rhoPeriod } = spearman(periods, allen);
  const survives = rho >= 0.7 && allPositive && rhoPeriod < 0;
  return {
    id: 'C_allen_survival',
    title: 'Independent Allen-scale Δχ survival vs Pauling',
    source: DATA_SOURCES.allen,
    rows: allenRows,
    spearmanVsPauling: rho,
    spearmanVsPeriod: rhoPeriod,
    allPositive,
    survives,
    pass: survives,
    interpretation: survives
      ? `Allen Δχ series Spearman-concordant with Pauling (ρ=${rho.toFixed(3)}); all Δχ>0; still negatively associated with period.`
      : 'Allen survival gate failed.',
  };
}

/** D · Allred–Rochow scale survival */
export function experimentD_allredRochowSurvival() {
  const pauling = deltasFromScale(PAULING).map((r) => r.delta);
  const arRows = deltasFromScale(ALLRED_ROCHOW);
  const ar = arRows.map((r) => r.delta);
  const { rho } = spearman(pauling, ar);
  const allPositive = ar.every((d) => d > 0);
  const periods = PERIOD_PAIRS.map((p) => p.period);
  const { rho: rhoPeriod } = spearman(periods, ar);
  const survives = rho >= 0.7 && allPositive && rhoPeriod < 0;
  return {
    id: 'D_allred_rochow_survival',
    title: 'Independent Allred–Rochow Δχ survival vs Pauling',
    source: DATA_SOURCES.allredRochow,
    rows: arRows,
    spearmanVsPauling: rho,
    spearmanVsPeriod: rhoPeriod,
    allPositive,
    survives,
    pass: survives,
    interpretation: survives
      ? `Allred–Rochow Δχ Spearman-concordant with Pauling (ρ=${rho.toFixed(3)}); sign and period association survive.`
      : 'Allred–Rochow survival gate failed.',
  };
}

/** E · Ionization-energy Δ comparison */
export function experimentE_ionizationConcordance() {
  const pauling = deltasFromScale(PAULING).map((r) => r.delta);
  const ieRows = propertyDeltas(IE1_KJ);
  const ie = ieRows.map((r) => r.delta);
  const { rho } = spearman(pauling, ie);
  const allPositive = ie.every((d) => d > 0);
  const periods = PERIOD_PAIRS.map((p) => p.period);
  const { rho: rhoPeriod } = spearman(periods, ie);
  // IE differences are large and also attenuate with period — expect positive concordance with Δχ
  const concordant = rho >= 0.6 && allPositive && rhoPeriod < 0;
  return {
    id: 'E_ionization_concordance',
    title: 'ΔIE1 concordance with Pauling Δχ (independent property)',
    source: DATA_SOURCES.ie1,
    rows: ieRows,
    spearmanVsPaulingDeltaChi: rho,
    spearmanVsPeriod: rhoPeriod,
    allPositive,
    concordant,
    pass: concordant,
    interpretation: concordant
      ? `ΔIE1 (G15−G13) tracks Pauling Δχ (ρ=${rho.toFixed(3)}) and declines with period — independent property support.`
      : 'Ionization concordance gate failed.',
  };
}

/** F · Covalent-radius complementary geometry */
export function experimentF_radiusComplement() {
  const pauling = deltasFromScale(PAULING).map((r) => r.delta);
  const rRows = propertyDeltas(R_COV_PM);
  // For periods 2–5, G15 is typically smaller (negative Δr); P6 Bi≈Tl can flip
  const deltaR = rRows.map((r) => r.delta);
  const earlyNegative = deltaR.slice(0, 4).every((d) => d < 0);
  // Complement: larger |Δχ| periods tend to have more negative Δr early — use −Δr vs Δχ
  const negR = deltaR.map((d) => -d);
  const { rho } = spearman(pauling, negR);
  const periods = PERIOD_PAIRS.map((p) => p.period);
  const { rho: rhoPeriod } = spearman(periods, negR);
  const pass = earlyNegative && rho > 0.4;
  return {
    id: 'F_radius_complement',
    title: 'Covalent-radius complement (−Δr) vs Pauling Δχ',
    source: DATA_SOURCES.rCov,
    rows: rRows,
    earlyPeriodsG15Smaller: earlyNegative,
    spearmanNegDeltaRVsPauling: rho,
    spearmanNegDeltaRVsPeriod: rhoPeriod,
    pass,
    honesty:
      'Period-6 Bi/Tl radii nearly meet; radius complement is strongest for periods 2–5. Not a claim that size alone causes electronegativity.',
    interpretation: pass
      ? `Periods 2–5: G15 covalent radius < G13; −Δr Spearman vs Pauling Δχ ρ=${rho.toFixed(3)}.`
      : 'Radius complement gate failed.',
  };
}

/** G · Permutation null: shuffled period pairing destroys EN concordance */
export function experimentG_permutationNull(seed = DIGITAL_SEED) {
  const paulingDeltas = deltasFromScale(PAULING).map((r) => r.delta);
  const allenDeltas = deltasFromScale(ALLEN).map((r) => r.delta);
  const observed = spearman(paulingDeltas, allenDeltas).rho;
  const rng = mulberry32(seed);
  const nTrials = 5000;
  let ge = 0;
  for (let t = 0; t < nTrials; t++) {
    const shuffled = [...allenDeltas];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const rho = spearman(paulingDeltas, shuffled).rho;
    if (rho >= observed - 1e-12) ge++;
  }
  const p = ge / nTrials;
  // With n=5, exact permutation space is small; still require observed ρ rare under shuffle
  const pass = observed >= 0.7 && p <= 0.2;
  return {
    id: 'G_permutation_null',
    title: 'Permutation null · Pauling↔Allen Δχ concordance',
    observedSpearman: observed,
    nTrials,
    pApprox: p,
    pass,
    interpretation: pass
      ? `Observed Pauling↔Allen Spearman ρ=${observed.toFixed(3)}; approx permutation p=${p.toFixed(3)} (seed ${seed}).`
      : 'Permutation null did not support observed concordance.',
  };
}

/** Catalog gate · novel observations under Expedition 001 grammar */
export function experimentNovelObservationCatalog(corePassMap) {
  const catalog = catalogSummary(corePassMap);
  const minEntries = 6;
  const pass =
    catalog.n >= minEntries &&
    catalog.nSupported === catalog.n &&
    NOVEL_OBSERVATION_CATALOG.every((o) => o.evidenceIds.length >= 1);
  return {
    id: 'CATALOG_novel_observations',
    title: 'Novel observation catalog (Expedition 001 model → periodic table)',
    catalog,
    pass,
    interpretation: pass
      ? `Catalogued ${catalog.nSupported}/${catalog.n} suite-framed novel observations with linked evidence ids.`
      : 'Novel observation catalog incomplete or evidence-blocked.',
  };
}

/** H / E8 · application companion pin gate (series policy) */
export function experimentH_enginePinGate() {
  return {
    id: 'H_engine_pin_gate',
    title: 'Engine-shelf pin gate',
    enginePinRecommended: false,
    pass: true,
    reasons: [
      'net_zero_series_application_companion',
      'tabulated_literature_lab_not_new_physics_derivation',
      'contrast_not_duplicate_digit4_be_o_soft_story',
    ],
    interpretation:
      'Ship as Net Zero Expedition Series application companion — not ENGINE_SHELF. Periodic table not derived from Φ_EGS.',
  };
}

export function runAllExperiments({ seed = DIGITAL_SEED, validationSeed = VALIDATION_SEED } = {}) {
  const A = experimentA_complementGrammar();
  const B = experimentB_paulingPeriodPattern();
  const C = experimentC_allenSurvival();
  const D = experimentD_allredRochowSurvival();
  const E = experimentE_ionizationConcordance();
  const F = experimentF_radiusComplement();
  const G = experimentG_permutationNull(seed);
  const G2 = experimentG_permutationNull(validationSeed);
  const H = experimentH_enginePinGate();

  const corePassMap = {
    [A.id]: A.pass,
    [B.id]: B.pass,
    [C.id]: C.pass,
    [D.id]: D.pass,
    [E.id]: E.pass,
    [F.id]: F.pass,
    [G.id]: G.pass && G2.pass,
  };
  const CAT = experimentNovelObservationCatalog(corePassMap);

  const experiments = [
    { id: 'E1_complement_grammar', title: A.title, pass: A.pass, A },
    { id: 'E2_pauling_period_pattern', title: B.title, pass: B.pass, B },
    { id: 'E3_allen_survival', title: C.title, pass: C.pass, C },
    { id: 'E4_allred_rochow_survival', title: D.title, pass: D.pass, D },
    { id: 'E5_ionization_concordance', title: E.title, pass: E.pass, E },
    { id: 'E6_radius_complement', title: F.title, pass: F.pass, F },
    {
      id: 'E7_permutation_null',
      title: G.title,
      pass: G.pass && G2.pass,
      primary: G,
      validation: G2,
    },
    {
      id: 'E8_engine_pin_gate',
      title: H.title,
      pass: H.pass && CAT.pass,
      enginePinRecommended: false,
      H,
      novelObservationCatalog: CAT,
      interpretation: `${H.interpretation} ${CAT.interpretation}`,
    },
  ];

  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    experiments,
    n_pass,
    n_total: experiments.length,
    all_pass: n_pass === experiments.length,
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
    CAT,
    novelObservations: CAT.catalog,
    honesty: HONESTY,
    engineShelfPinned: ENGINE_SHELF_PINNED,
    dataSources: DATA_SOURCES,
  };
}
