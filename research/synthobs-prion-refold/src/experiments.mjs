/**
 * Prion / amyloid refolding map — comparative scoring suite (TBME).
 * Architectural rubric validation. NOT clinical evidence. NOT wet-lab completion.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  LAMBDA_EGS,
  GOLDEN_ANGLE_DEG,
  DOC_ID,
  REGISTRY_ID,
  STANDARD,
  OMNI,
  PROTOCOL,
  SCORECARD_DOMAINS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCORECARD_PATH = path.join(__dirname, '..', 'data', 'scorecard_fixtures.json');

function loadScorecard() {
  return JSON.parse(fs.readFileSync(SCORECARD_PATH, 'utf8'));
}

export function overallFromCI(c, i) {
  return (c + i) / 2;
}

export function coherenceScore(nParadox, nSingularities, nDomainIntersections) {
  const den = Math.max(1, nDomainIntersections);
  const raw = 1 - (nParadox + nSingularities) / den;
  return Math.max(0, Math.min(1, raw)) * 100;
}

export function irreducibilityIndex(nDerived, nP, nU) {
  const den = Math.max(1, nP + nU);
  return nDerived / den;
}

/** E1 — Overall scores match (C+I)/2. */
export function experimentOverallIdentity() {
  const std = overallFromCI(STANDARD.coherence, STANDARD.irreducibility);
  const omni = overallFromCI(OMNI.coherence, OMNI.irreducibility);
  return {
    id: 'E1_overall_identity',
    title: 'Overall score = (C + I) / 2',
    standard: { c: STANDARD.coherence, i: STANDARD.irreducibility, overall: std },
    omni: { c: OMNI.coherence, i: OMNI.irreducibility, overall: omni },
    interpretation: 'Scorecard overalls are the equal-weight mean of coherence and irreducibility.',
    honesty: 'Rubric arithmetic — not a clinical likelihood ratio or wet-lab success rate.',
    pass:
      Math.abs(std - STANDARD.overall) < 1e-9 && Math.abs(omni - OMNI.overall) < 1e-9,
  };
}

/** E2 — Coherence formula reproduces Standard vs Omni fixture counts. */
export function experimentCoherenceFormula() {
  const sc = loadScorecard();
  const std = coherenceScore(
    sc.standard.n_paradox,
    sc.standard.n_singularities,
    sc.standard.n_domain_intersections,
  );
  const omni = coherenceScore(
    sc.omni.n_paradox,
    sc.omni.n_singularities,
    sc.omni.n_domain_intersections,
  );
  return {
    id: 'E2_coherence_formula',
    title: 'Coherence metric C from paradox/singularity counts',
    standard_C: std,
    omni_C: omni,
    published: { standard: STANDARD.coherence, omni: OMNI.coherence },
    interpretation: 'C formula tracks published TBME scorecard coherence bands.',
    honesty: 'Counts are authored scorecard inputs — not ThT / CD lab reductions.',
    pass:
      Math.abs(std - STANDARD.coherence) <= 2 &&
      Math.abs(omni - OMNI.coherence) <= 2,
  };
}

/** E3 — Irreducibility index favors Omni (single E_F invariant). */
export function experimentIrreducibility() {
  const sc = loadScorecard();
  const std = irreducibilityIndex(
    sc.standard.n_derived,
    sc.standard.n_primitives,
    sc.standard.n_unexplained,
  );
  const omni = irreducibilityIndex(
    sc.omni.n_derived,
    sc.omni.n_primitives,
    sc.omni.n_unexplained,
  );
  return {
    id: 'E3_irreducibility_index',
    title: 'Irreducibility index I = n_derived / (n_primitives + n_unexplained)',
    standard_I_raw: std,
    omni_I_raw: omni,
    published: { standard: STANDARD.irreducibility, omni: OMNI.irreducibility },
    interpretation: 'Omni map concentrates derived structure under fewer free primitives (E_F).',
    honesty: 'Index is Occam bookkeeping — not proof of clinical superiority.',
    pass: omni > std && OMNI.irreducibility > STANDARD.irreducibility,
  };
}

/** E4 — Golden angle matches 360/φ². */
export function experimentGoldenAngle() {
  const expected = 360 / (E_F * E_F);
  return {
    id: 'E4_golden_angle',
    title: 'θ_EGS = 360 / φ² ≈ 137.508°',
    computed: GOLDEN_ANGLE_DEG,
    fixture: PROTOCOL.theta_egs_deg,
    expected,
    interpretation: 'Pulse phase offset is the golden angle from E_F.',
    honesty: 'Geometric identity — not a measured peptide NMR angle in this suite.',
    pass: Math.abs(GOLDEN_ANGLE_DEG - expected) < 1e-12 && Math.abs(GOLDEN_ANGLE_DEG - 137.508) < 0.01,
  };
}

/** E5 — Protocol harmonics are E_F-scaled decimals. */
export function experimentProtocolHarmonics() {
  const sc = loadScorecard();
  const f0 = sc.protocol.f0_kHz;
  const f1 = sc.protocol.f1_MHz;
  return {
    id: 'E5_protocol_harmonics',
    title: 'Protocol harmonics encode E_F decimal lattice (16.18 kHz / 1.618 MHz)',
    f0_kHz: f0,
    f1_MHz: f1,
    E_F,
    interpretation: 'Frequencies are architectural E_F mnemonics for the proposed coil protocol.',
    honesty: 'Not measured resonant modes of PrP in this suite; exploration recipe only.',
    pass:
      Math.abs(f0 - 16.18) < 1e-9 &&
      Math.abs(f1 - 1.618) < 1e-9 &&
      Math.abs(f1 - Number(E_F.toFixed(3))) < 1e-9,
  };
}

/** E6 — Field band stays ultra-low (Earth-order µT). */
export function experimentFieldBand() {
  const { B_uT_min, B_uT_max } = PROTOCOL;
  return {
    id: 'E6_ultralow_field_band',
    title: 'Proposed B-field band 50–161.8 µT (ultra-low)',
    B_uT_min,
    B_uT_max,
    interpretation: 'Exploration recipe stays near ambient geomagnetic scale.',
    honesty: 'Field band is proposed — not a completed exposure study.',
    pass: B_uT_min === 50 && Math.abs(B_uT_max - 161.8) < 1e-9 && B_uT_max < 200,
  };
}

/** E7 — λ_EGS = ln(E_F)/(2π) used in M_refold envelope. */
export function experimentLambdaEgs() {
  const expected = Math.log(E_F) / (2 * Math.PI);
  return {
    id: 'E7_lambda_egs',
    title: 'λ_EGS = ln(E_F) / 2π',
    computed: LAMBDA_EGS,
    expected,
    interpretation: 'Envelope growth rate in M_refold matches Euler–EGS bridge constant.',
    honesty: 'Algebraic identity shared with Omni-Lattice companions.',
    pass: Math.abs(LAMBDA_EGS - expected) < 1e-15,
  };
}

/** E8 — Score margin Omni − Standard = +30.0. */
export function experimentScoreMargin() {
  const margin = OMNI.overall - STANDARD.overall;
  return {
    id: 'E8_score_margin',
    title: 'Omni overall − Standard overall = +30.0',
    margin,
    published: { standard: STANDARD.overall, omni: OMNI.overall },
    interpretation: 'Rubric margin favors the phase-refolding map on coherence/irreducibility.',
    honesty: 'Architectural margin — empirical calibration stays with wet-lab biochemistry.',
    pass: Math.abs(margin - 30) < 1e-9,
  };
}

/** E9 — Clinical non-claim / TBME gate present in scorecard domains. */
export function experimentClinicalNonClaimGate() {
  const hasGate = SCORECARD_DOMAINS.includes('clinical_non_claim_gate');
  const sc = loadScorecard();
  return {
    id: 'E9_clinical_non_claim_gate',
    title: 'TBME clinical non-claim gate present',
    domains: SCORECARD_DOMAINS,
    scorecard_honesty: sc.honesty,
    interpretation: 'Suite refuses to treat rubric wins as clinical efficacy.',
    honesty: 'TBME series: theoretical exploration only — not medical advice.',
    pass: hasGate && /Not wet-lab|clinical/i.test(sc.honesty || ''),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentOverallIdentity(),
    experimentCoherenceFormula(),
    experimentIrreducibility(),
    experimentGoldenAngle(),
    experimentProtocolHarmonics(),
    experimentFieldBand(),
    experimentLambdaEgs(),
    experimentScoreMargin(),
    experimentClinicalNonClaimGate(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    n_total: experiments.length,
    n_pass: experiments.length - failed.length,
    all_pass: failed.length === 0,
    failed,
    experiments,
  };
}
