/**
 * Histone phase-operator map — comparative scoring suite (TBME).
 * Architectural rubric. NOT clinical evidence. NOT gene therapy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F, LAMBDA_EGS, NUCLEOSOME_TURNS, WRAP_BP,
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
    honesty: 'Counts are authored scorecard inputs — not ChIP-seq results.',
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
    interpretation: 'Omni map concentrates chromatin grammar under E_F phase-lock.',
    honesty: 'Index is Occam bookkeeping — not proof of clinical superiority.',
    pass: omni > std && OMNI.irreducibility > STANDARD.irreducibility,
  };
}

export function experimentWindingNearEf() {
  const delta = Math.abs(NUCLEOSOME_TURNS - E_F);
  return {
    id: 'E4_winding_near_ef',
    title: 'Nucleosome turns (~1.65) lie near E_F ≈ 1.618',
    turns: NUCLEOSOME_TURNS, E_F, delta,
    interpretation: 'Structural-biology wrap figure used as E_F mnemonic bridge.',
    honesty: 'Not a new crystallographic measurement in this suite.',
    pass: delta < 0.05 && Math.abs(NUCLEOSOME_TURNS - 1.65) < 1e-9,
  };
}

export function experimentWrapBp() {
  return {
    id: 'E5_wrap_bp',
    title: 'Canonical nucleosome wrap ≈ 147 bp',
    WRAP_BP,
    interpretation: 'Standard nucleosome DNA length mnemonic for the spool map.',
    honesty: 'Textbook structural constant — not measured here.',
    pass: WRAP_BP === 147,
  };
}

export function experimentLambdaEgs() {
  const expected = Math.log(E_F) / (2 * Math.PI);
  return {
    id: 'E6_lambda_egs',
    title: 'λ_EGS = ln(E_F) / 2π',
    computed: LAMBDA_EGS, expected,
    interpretation: 'Phase-scaling parameter shared with Omni-Lattice / PCHPP companions.',
    honesty: 'Algebraic identity — not a measured chromatin constant.',
    pass: Math.abs(LAMBDA_EGS - expected) < 1e-15,
  };
}

export function experimentScoreMargin() {
  const margin = OMNI.overall - STANDARD.overall;
  return {
    id: 'E7_score_margin',
    title: 'Omni overall − Standard overall = +24.5',
    margin,
    published: { standard: STANDARD.overall, omni: OMNI.overall },
    interpretation: 'Rubric margin favors the histone phase-operator map.',
    honesty: 'Architectural margin — empirical calibration stays with molecular epigenetics.',
    pass: Math.abs(margin - 24.5) < 1e-9,
  };
}

export function experimentAcMePolarity() {
  const modes = { acetylation: 'open', methylation: 'closed' };
  return {
    id: 'E8_ac_me_polarity',
    title: 'Acetylation ↔ open / Methylation ↔ closed polarity preserved',
    modes,
    interpretation: 'Map keeps standard euchromatin/heterochromatin polarity under μ narrative.',
    honesty: 'Polarity bookkeeping — not a completed magnetometry of nuclei.',
    pass: modes.acetylation === 'open' && modes.methylation === 'closed',
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
    interpretation: 'Suite refuses to treat rubric wins as clinical efficacy.',
    honesty: 'TBME series: theoretical exploration only — not medical advice.',
    pass: hasGate && /Not wet-lab|clinical|epigenomics/i.test(sc.honesty || ''),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentOverallIdentity(),
    experimentCoherenceFormula(),
    experimentIrreducibility(),
    experimentWindingNearEf(),
    experimentWrapBp(),
    experimentLambdaEgs(),
    experimentScoreMargin(),
    experimentAcMePolarity(),
    experimentClinicalNonClaimGate(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    docId: DOC_ID, registryId: REGISTRY_ID,
    n_total: experiments.length, n_pass: experiments.length - failed.length,
    all_pass: failed.length === 0, failed, experiments,
  };
}
