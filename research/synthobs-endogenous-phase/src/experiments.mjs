/**
 * Endogenous conscious-intent phase map — comparative scoring suite (TBME).
 * Architectural rubric. NOT clinical evidence. NOT medical treatment via thought.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F, LAMBDA_EGS, GOLDEN_ANGLE_DEG,
  DOC_ID, REGISTRY_ID, STANDARD, OMNI, PROTOCOL, SCORECARD_DOMAINS,
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
    honesty: 'Rubric arithmetic — not a clinical likelihood ratio.',
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
    honesty: 'Counts are authored scorecard inputs — not HRV trial endpoints.',
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
    interpretation: 'Omni map concentrates endogenous phase control under E_F / C_intent.',
    honesty: 'Index is Occam bookkeeping — not proof of clinical superiority.',
    pass: omni > std && OMNI.irreducibility > STANDARD.irreducibility,
  };
}

export function experimentGoldenAngle() {
  const expected = 360 / (E_F * E_F);
  return {
    id: 'E4_golden_angle',
    title: 'θ_EGS = 360 / φ² ≈ 137.508°',
    computed: GOLDEN_ANGLE_DEG, fixture: PROTOCOL.theta_egs_deg, expected,
    interpretation: 'Attention-squeeze spiral angle is the golden angle from E_F.',
    honesty: 'Geometric identity — not a measured fascial torsion angle.',
    pass: Math.abs(GOLDEN_ANGLE_DEG - expected) < 1e-12 && Math.abs(GOLDEN_ANGLE_DEG - 137.508) < 0.01,
  };
}

export function experimentBreathCadence() {
  const sc = loadScorecard();
  const period = sc.protocol.inhale_s + sc.protocol.exhale_s;
  const Hz = 1 / period;
  return {
    id: 'E5_breath_cadence',
    title: '5s / 5s breath ≈ 0.1 Hz resonant cadence mnemonic',
    inhale_s: sc.protocol.inhale_s, exhale_s: sc.protocol.exhale_s,
    breath_Hz: sc.protocol.breath_Hz, computed_Hz: Hz,
    interpretation: 'Protocol breath cadence matches 0.1 Hz HRV-coherence mnemonic.',
    honesty: 'Practice map — not a completed clinical breathing trial.',
    pass:
      Math.abs(sc.protocol.inhale_s - 5) < 1e-9 &&
      Math.abs(sc.protocol.exhale_s - 5) < 1e-9 &&
      Math.abs(Hz - 0.1) < 1e-12 &&
      Math.abs(sc.protocol.breath_Hz - 0.1) < 1e-9,
  };
}

export function experimentHoldAndCarrier() {
  const sc = loadScorecard();
  return {
    id: 'E6_hold_and_carrier',
    title: 'Hold 1.618 min and f0 ≈ 1.618 Hz encode E_F decimals',
    hold_min: sc.protocol.hold_min, f0_Hz: sc.protocol.f0_Hz, E_F,
    interpretation: 'Endogenous timing mnemonics ride the E_F decimal lattice.',
    honesty: 'Architectural mnemonics — not measured cardiac magnetometry.',
    pass:
      Math.abs(sc.protocol.hold_min - 1.618) < 1e-9 &&
      Math.abs(sc.protocol.f0_Hz - 1.618) < 1e-9 &&
      Math.abs(sc.protocol.f0_Hz - Number(E_F.toFixed(3))) < 1e-9,
  };
}

export function experimentLambdaEgs() {
  const expected = Math.log(E_F) / (2 * Math.PI);
  return {
    id: 'E7_lambda_egs',
    title: 'λ_EGS = ln(E_F) / 2π',
    computed: LAMBDA_EGS, expected,
    interpretation: 'Phase-scaling parameter shared with Omni-Lattice / PCHPP companions.',
    honesty: 'Algebraic identity — not a measured consciousness constant.',
    pass: Math.abs(LAMBDA_EGS - expected) < 1e-15,
  };
}

export function experimentScoreMargin() {
  const margin = OMNI.overall - STANDARD.overall;
  return {
    id: 'E8_score_margin',
    title: 'Omni overall − Standard overall = +25.0',
    margin,
    published: { standard: STANDARD.overall, omni: OMNI.overall },
    interpretation: 'Rubric margin favors the endogenous consciousness phase operator map.',
    honesty: 'Architectural margin — empirical calibration stays with neurocardiology.',
    pass: Math.abs(margin - 25) < 1e-9,
  };
}

export function experimentClinicalNonClaimGate() {
  const hasGate = SCORECARD_DOMAINS.includes('clinical_non_claim_gate');
  const sc = loadScorecard();
  return {
    id: 'E9_clinical_non_claim_gate',
    title: 'TBME clinical non-claim gate present',
    domains: SCORECARD_DOMAINS,
    scorecard_honesty: sc.honesty,
    interpretation: 'Suite refuses to treat rubric wins as clinical efficacy or mind-cure claims.',
    honesty: 'TBME series: theoretical exploration only — not medical advice.',
    pass: hasGate && /Not wet-lab|clinical|HRV|magnetometry/i.test(sc.honesty || ''),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentOverallIdentity(),
    experimentCoherenceFormula(),
    experimentIrreducibility(),
    experimentGoldenAngle(),
    experimentBreathCadence(),
    experimentHoldAndCarrier(),
    experimentLambdaEgs(),
    experimentScoreMargin(),
    experimentClinicalNonClaimGate(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    docId: DOC_ID, registryId: REGISTRY_ID,
    n_total: experiments.length, n_pass: experiments.length - failed.length,
    all_pass: failed.length === 0, failed, experiments,
  };
}
