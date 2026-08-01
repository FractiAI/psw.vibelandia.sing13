/**
 * 81-orbital singularity map — comparative scoring suite (TBME).
 * Architectural rubric. NOT clinical evidence. NOT QED replacement.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F, LAMBDA_EGS, N_NODES, MATRIX_DIM, SUBSHELL_DEGENERACIES, OMEGA_81,
  DOC_ID, REGISTRY_ID, STANDARD, OMNI, SCORECARD_DOMAINS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCORECARD_PATH = path.join(__dirname, '..', 'data', 'scorecard_fixtures.json');
function loadScorecard() { return JSON.parse(fs.readFileSync(SCORECARD_PATH, 'utf8')); }

export function overallFromCI(c, i) { return (c + i) / 2; }
export function coherenceScore(nParadox, nSingularities, nDomainIntersections) {
  const den = Math.max(1, nDomainIntersections);
  return Math.max(0, Math.min(1, 1 - (nParadox + nSingularities) / den)) * 100;
}
export function irreducibilityIndex(nDerived, nP, nU) {
  return nDerived / Math.max(1, nP + nU);
}

export function experimentOverallIdentity() {
  const std = overallFromCI(STANDARD.coherence, STANDARD.irreducibility);
  const omni = overallFromCI(OMNI.coherence, OMNI.irreducibility);
  return {
    id: 'E1_overall_identity',
    title: 'Overall score = (C + I) / 2',
    standard: { c: STANDARD.coherence, i: STANDARD.irreducibility, overall: std },
    omni: { c: OMNI.coherence, i: OMNI.irreducibility, overall: omni },
    interpretation: 'Scorecard overalls are the equal-weight mean of coherence and irreducibility.',
    honesty: 'Rubric arithmetic — not a physics likelihood ratio.',
    pass: Math.abs(std - STANDARD.overall) < 1e-9 && Math.abs(omni - OMNI.overall) < 1e-9,
  };
}

export function experimentCoherenceFormula() {
  const sc = loadScorecard();
  const std = coherenceScore(sc.standard.n_paradox, sc.standard.n_singularities, sc.standard.n_domain_intersections);
  const omni = coherenceScore(sc.omni.n_paradox, sc.omni.n_singularities, sc.omni.n_domain_intersections);
  return {
    id: 'E2_coherence_formula',
    title: 'Coherence metric C from paradox/singularity counts',
    standard_C: std, omni_C: omni,
    published: { standard: STANDARD.coherence, omni: OMNI.coherence },
    interpretation: 'C formula tracks published TBME scorecard coherence bands.',
    honesty: 'Counts are authored scorecard inputs — not lab spectroscopy.',
    pass: Math.abs(std - STANDARD.coherence) <= 2 && Math.abs(omni - OMNI.coherence) <= 2,
  };
}

export function experimentIrreducibility() {
  const sc = loadScorecard();
  const std = irreducibilityIndex(sc.standard.n_derived, sc.standard.n_primitives, sc.standard.n_unexplained);
  const omni = irreducibilityIndex(sc.omni.n_derived, sc.omni.n_primitives, sc.omni.n_unexplained);
  return {
    id: 'E3_irreducibility_index',
    title: 'Irreducibility index I = n_derived / (n_primitives + n_unexplained)',
    standard_I_raw: std, omni_I_raw: omni,
    published: { standard: STANDARD.irreducibility, omni: OMNI.irreducibility },
    interpretation: 'Omni map concentrates derived structure under E_F / 81-node matrix.',
    honesty: 'Index is Occam bookkeeping — not proof of physical completeness.',
    pass: omni > std && OMNI.irreducibility > STANDARD.irreducibility,
  };
}

export function experimentNodeCount() {
  const sum = SUBSHELL_DEGENERACIES.reduce((a, b) => a + b, 0);
  return {
    id: 'E4_81_node_sum',
    title: 'Σ(2ℓ+1) for ℓ=0..8 = 81 = 9×9',
    degeneracies: SUBSHELL_DEGENERACIES,
    sum, N_NODES, MATRIX_DIM,
    interpretation: 'Authored 9×9 singularity matrix closes exactly at 81 nodes.',
    honesty: 'Bookkeeping identity on the map — not a Hilbert-space truncation theorem.',
    pass: sum === 81 && sum === N_NODES && MATRIX_DIM * MATRIX_DIM === N_NODES,
  };
}

export function experimentOmega81() {
  const expected = 81 * E_F;
  return {
    id: 'E5_omega_81',
    title: 'ω_81 = 81 × E_F (matrix refresh clock mnemonic)',
    computed: OMEGA_81, expected, E_F,
    interpretation: 'Time-arrow narrative clock is E_F-scaled across 81 nodes.',
    honesty: 'Architectural mnemonic — not a measured cosmological frequency.',
    pass: Math.abs(OMEGA_81 - expected) < 1e-12,
  };
}

export function experimentLambdaEgs() {
  const expected = Math.log(E_F) / (2 * Math.PI);
  return {
    id: 'E6_lambda_egs',
    title: 'λ_EGS = ln(E_F) / 2π',
    computed: LAMBDA_EGS, expected,
    interpretation: 'Phase-scaling parameter shared with Omni-Lattice / PCHPP companions.',
    honesty: 'Algebraic identity — not a measured atomic constant.',
    pass: Math.abs(LAMBDA_EGS - expected) < 1e-15,
  };
}

export function experimentScoreMargin() {
  const margin = OMNI.overall - STANDARD.overall;
  return {
    id: 'E7_score_margin',
    title: 'Omni overall − Standard overall = +22.5',
    margin,
    published: { standard: STANDARD.overall, omni: OMNI.overall },
    interpretation: 'Rubric margin favors the 81-singularity orbital matrix map.',
    honesty: 'Architectural margin — empirical calibration stays with QED spectroscopy.',
    pass: Math.abs(margin - 22.5) < 1e-9,
  };
}

export function experimentCumulativeTiers() {
  let cum = 0;
  const ranges = SUBSHELL_DEGENERACIES.map((d) => {
    const start = cum + 1;
    cum += d;
    return [start, cum];
  });
  return {
    id: 'E8_cumulative_tiers',
    title: 'Cumulative singularity tiers close at node 81',
    ranges,
    last: cum,
    interpretation: 's→k tier table spans nodes 1–81 without gaps.',
    honesty: 'Map arithmetic — projection roles remain narrative.',
    pass: cum === 81 && ranges[0][0] === 1 && ranges[8][1] === 81,
  };
}

export function experimentClinicalNonClaimGate() {
  const hasGate = SCORECARD_DOMAINS.includes('clinical_non_claim_gate');
  const sc = loadScorecard();
  return {
    id: 'E9_clinical_non_claim_gate',
    title: 'TBME clinical / physics non-claim gate present',
    domains: SCORECARD_DOMAINS,
    scorecard_honesty: sc.honesty,
    interpretation: 'Suite refuses to treat rubric wins as clinical or QED replacement.',
    honesty: 'TBME series: theoretical exploration only — not medical advice.',
    pass: hasGate && /Not wet-lab|clinical|spectroscopy/i.test(sc.honesty || ''),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentOverallIdentity(),
    experimentCoherenceFormula(),
    experimentIrreducibility(),
    experimentNodeCount(),
    experimentOmega81(),
    experimentLambdaEgs(),
    experimentScoreMargin(),
    experimentCumulativeTiers(),
    experimentClinicalNonClaimGate(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    docId: DOC_ID, registryId: REGISTRY_ID,
    n_total: experiments.length, n_pass: experiments.length - failed.length,
    all_pass: failed.length === 0, failed, experiments,
  };
}
