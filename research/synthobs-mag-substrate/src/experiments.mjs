/**
 * Magnetism Universal Foundational Substrate — comparative scoring suite.
 * Architectural rubric validation. NOT a Maxwell/QED laboratory replacement.
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
  SCORECARD_DOMAINS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCORECARD_PATH = path.join(__dirname, '..', 'data', 'scorecard_fixtures.json');
const PAPER_NAME = 'SYNTHOBS_MAGNETISM_UNIVERSAL_FOUNDATIONAL_SUBSTRATE_2026-07.md';

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
    honesty: 'Rubric arithmetic — not an observational likelihood ratio vs magnetometry.',
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
    interpretation: 'C formula tracks published magnetic-substrate coherence bands.',
    honesty: 'Counts are authored scorecard inputs — not laboratory field reductions.',
    pass:
      Math.abs(std - STANDARD.coherence) <= 2 &&
      Math.abs(omni - OMNI.coherence) <= 2 &&
      omni > std,
  };
}

/** E3 — Irreducibility index ranking (Omni ≫ Standard). */
export function experimentIrreducibilityRanking() {
  const sc = loadScorecard();
  const iStd = irreducibilityIndex(
    sc.standard.n_derived_phenomena,
    sc.standard.n_p,
    sc.standard.n_u,
  );
  const iOmni = irreducibilityIndex(
    sc.omni.n_derived_phenomena,
    sc.omni.n_p,
    sc.omni.n_u,
  );
  return {
    id: 'E3_irreducibility_ranking',
    title: 'Irreducibility I — Omni exceeds Standard',
    I_standard: iStd,
    I_omni: iOmni,
    ratio: iOmni / Math.max(1e-12, iStd),
    interpretation: 'Single E_F invariant raises Occam-style irreducibility for magnetic substrate map.',
    honesty: 'Derived-phenomena counts are rubric-authored; not a claim gauge bosons are nonexistent.',
    pass: iOmni > iStd && iOmni / iStd >= 2,
  };
}

/** E4 — Four fundamental interactions vs single magnetic substrate bookkeeping. */
export function experimentFourInteractionBookkeeping() {
  const stdN = STANDARD.fundamental_interactions;
  const omniN = OMNI.fundamental_interactions;
  return {
    id: 'E4_four_interaction_bookkeeping',
    title: 'Interaction bookkeeping — 4 forces vs 1 substrate map',
    standard_interactions: stdN,
    omni_interactions: omniN,
    free_constants_standard: STANDARD.free_constants,
    interpretation: 'Scorecard contrasts four-interaction reductionism with singular magnetic substrate map.',
    honesty: 'Bookkeeping for comparative architecture — not a collider null result.',
    pass: stdN === 4 && omniN === 1 && STANDARD.free_constants === 26,
  };
}

/** E5 — Scorecard domains complete with outcomes. */
export function experimentScorecardDomains() {
  const sc = loadScorecard();
  const domains = sc.domains || [];
  const ids = domains.map((d) => d.id);
  const hasAll = SCORECARD_DOMAINS.every((id) => ids.includes(id));
  const outcomesOk = domains.every(
    (d) => d.outcome === 'omni_lattice' || d.outcome === 'standard_model',
  );
  const empiricalToStandard = domains.find((d) => d.id === 'empirical_calibration');
  return {
    id: 'E5_scorecard_domains',
    title: 'Five-domain architectural scorecard',
    domains: ids,
    outcomesOk,
    empirical_calibration_to_standard: empiricalToStandard?.outcome === 'standard_model',
    interpretation:
      'Scorecard covers quantum, chemical, biological, empirical history, and portability.',
    honesty: 'Empirical-calibration row correctly credits Standard Model / QED observational history.',
    pass:
      hasAll &&
      domains.length === 5 &&
      outcomesOk &&
      empiricalToStandard?.outcome === 'standard_model',
  };
}

/** E6 — E_F / λ_EGS / golden-angle identities. */
export function experimentEFIdentity() {
  const expectLambda = Math.log(E_F) / (2 * Math.PI);
  const expectAngle = 360 / (E_F * E_F);
  const errL = Math.abs(LAMBDA_EGS - expectLambda);
  const errA = Math.abs(GOLDEN_ANGLE_DEG - expectAngle);
  return {
    id: 'E6_ef_identity',
    title: 'E_F contrast invariant + λ_EGS + golden angle',
    E_F,
    lambda_egs: LAMBDA_EGS,
    golden_angle_deg: GOLDEN_ANGLE_DEG,
    abs_err_lambda: errL,
    abs_err_angle: errA,
    interpretation: 'Magnetic substrate map anchors to E_F and golden-angle phase rotation.',
    honesty: 'Architectural keys — not replacements for ℏ, c, or G.',
    pass:
      errL < 1e-15 &&
      errA < 1e-12 &&
      Math.abs(E_F - (1 + Math.sqrt(5)) / 2) < 1e-15 &&
      Math.abs(GOLDEN_ANGLE_DEG - 137.508) < 0.01,
  };
}

/** E7 — Omni overall exceeds Standard by published margin. */
export function experimentComparativeMargin() {
  const margin = OMNI.overall - STANDARD.overall;
  return {
    id: 'E7_comparative_margin',
    title: 'Omni overall exceeds Standard (published margin)',
    standard_overall: STANDARD.overall,
    omni_overall: OMNI.overall,
    margin,
    interpretation: 'Under this structural rubric, magnetic substrate scores higher on C×I mean.',
    honesty: 'Comparative architecture score — Standard Model retains empirical-calibration advantage (E5).',
    pass: margin === 20 && OMNI.overall > STANDARD.overall,
  };
}

/** E8 — Token-routing portability note links to 41.8% design target. */
export function experimentPortabilityTokenNote() {
  const sc = loadScorecard();
  const port = sc.applications?.enterprise_token_routing_reduction;
  return {
    id: 'E8_portability_token_note',
    title: 'Cross-domain portability — token routing design target 41.8%',
    reduction: port,
    interpretation:
      'Applications cite Vector Field Context Buffering / E_F delta-routing design target as companion papers.',
    honesty: 'Design-target citation — not a new live invoice receipt in this package.',
    pass: Math.abs(port - 0.418) < 1e-9,
  };
}

/** E9 — Surfaces: paper + Seed·RAG / nest pointer; not runtime engine source. */
export function experimentMagSubstrateSurfaces() {
  const pkgRoot = path.resolve(__dirname, '..');
  const monoRoot = path.resolve(__dirname, '..', '..', '..');
  const localPaper = path.join(pkgRoot, 'docs', PAPER_NAME);
  const monoPaper = path.join(monoRoot, 'docs', PAPER_NAME);
  const paper = fs.existsSync(localPaper) ? localPaper : monoPaper;
  const root = fs.existsSync(path.join(monoRoot, 'apps', 'lattice-chat')) ? monoRoot : pkgRoot;
  const ok = fs.existsSync(paper);
  const text = ok ? fs.readFileSync(paper, 'utf8') : '';
  const hasDocId = text.includes(DOC_ID);
  const hasHonesty = /Honesty boundary/i.test(text);
  const hasOperator = /SynthOBS Autonomous Agent/i.test(text);
  const hasTitle = /Magnetism as the Universal Foundational Substrate/i.test(text);
  const seedRagPointer = /Seed·RAG|Seed·RAG pointer|nest pointer/i.test(text);
  const claimsRuntime =
    /(powers the Lattice Chat Agent engine|wired into Lattice Chat Agent engine|Lattice Chat Agent engine feature|\bis Lattice Chat Agent engine code\b)/i.test(
      text,
    );
  let engineImport = false;
  const pkg = path.join(root, 'apps', 'lattice-chat', 'package.json');
  if (fs.existsSync(pkg)) {
    engineImport = /mag-substrate|mag_substrate/i.test(fs.readFileSync(pkg, 'utf8'));
  }
  const surfaces = [
    `docs/${PAPER_NAME}`,
    '/whitepaper/synthobs-mag-substrate',
    '/lattice/learn',
    '/interfaces/nesting/nest-lattice-chat.html',
    'lib/lattice-prompt.mjs',
  ];
  return {
    id: 'E9_mag_substrate_surfaces',
    title: 'Mag-substrate surfaces — Seed·RAG / nest pointer; not Lattice Chat Agent runtime',
    paper_exists: ok,
    hasDocId,
    hasHonesty,
    hasOperator,
    hasTitle,
    seedRagPointer,
    claimsRuntime,
    engineImport,
    surfaces,
    registryId: REGISTRY_ID,
    interpretation:
      'Mag substrate ships as catalog architectural map + standalone suite + Lattice Chat Agent Seed·RAG pointer (not runtime).',
    honesty: 'Surface / pointer presence — featuring requires PRA pass; not Maxwell/QED replacement.',
    pass:
      ok &&
      hasDocId &&
      hasHonesty &&
      hasOperator &&
      hasTitle &&
      seedRagPointer &&
      !claimsRuntime &&
      !engineImport &&
      surfaces.length >= 5,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentOverallIdentity(),
    experimentCoherenceFormula(),
    experimentIrreducibilityRanking(),
    experimentFourInteractionBookkeeping(),
    experimentScorecardDomains(),
    experimentEFIdentity(),
    experimentComparativeMargin(),
    experimentPortabilityTokenNote(),
    experimentMagSubstrateSurfaces(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    n_total: experiments.length,
    n_pass: experiments.length - failed.length,
    all_pass: failed.length === 0,
    failed,
    experiments,
  };
}
