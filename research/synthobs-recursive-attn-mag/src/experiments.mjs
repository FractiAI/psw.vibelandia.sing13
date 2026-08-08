/**
 * Recursive Attention Squeezing & Holographic Magnetic Projections — suite.
 * Architectural rubric + protocol completeness. NOT a completed SQUID proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  LAMBDA_EGS,
  DOC_ID,
  REGISTRY_ID,
  CLASSICAL,
  HOLOGRAPHIC,
  VALIDATION_TIERS,
  SCORECARD_DOMAINS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCORECARD_PATH = path.join(__dirname, '..', 'data', 'scorecard_fixtures.json');
const PAPER_NAME = 'SYNTHOBS_RECURSIVE_ATTENTION_HOLOGRAPHIC_MAGNETIC_PROJECTIONS_2026-07.md';

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

/** Softmax attention scale factor uses √d · E_F in the denominator (paper §1.1). */
export function attentionScale(dK) {
  return Math.sqrt(Math.max(1, dK)) * E_F;
}

/** E1 — Overall scores match (C+I)/2. */
export function experimentOverallIdentity() {
  const classical = overallFromCI(CLASSICAL.coherence, CLASSICAL.irreducibility);
  const holo = overallFromCI(HOLOGRAPHIC.coherence, HOLOGRAPHIC.irreducibility);
  return {
    id: 'E1_overall_identity',
    title: 'Overall score = (C + I) / 2',
    classical: { c: CLASSICAL.coherence, i: CLASSICAL.irreducibility, overall: classical },
    holographic: { c: HOLOGRAPHIC.coherence, i: HOLOGRAPHIC.irreducibility, overall: holo },
    interpretation: 'Scorecard overalls are the equal-weight mean of coherence and irreducibility.',
    honesty: 'Rubric arithmetic — not a completed SQUID likelihood ratio.',
    pass:
      Math.abs(classical - CLASSICAL.overall) < 1e-9 &&
      Math.abs(holo - HOLOGRAPHIC.overall) < 1e-9,
  };
}

/** E2 — Coherence formula reproduces Classical vs Holographic fixture counts. */
export function experimentCoherenceFormula() {
  const sc = loadScorecard();
  const classical = coherenceScore(
    sc.classical.n_paradox,
    sc.classical.n_singularities,
    sc.classical.n_domain_intersections,
  );
  const holo = coherenceScore(
    sc.holographic.n_paradox,
    sc.holographic.n_singularities,
    sc.holographic.n_domain_intersections,
  );
  return {
    id: 'E2_coherence_formula',
    title: 'Coherence metric C from paradox/singularity counts',
    classical_C: classical,
    holographic_C: holo,
    published: { classical: CLASSICAL.coherence, holographic: HOLOGRAPHIC.coherence },
    interpretation: 'C formula tracks published attention-squeeze coherence bands.',
    honesty: 'Counts are authored scorecard inputs — not magnetometer reductions.',
    pass:
      Math.abs(classical - CLASSICAL.coherence) <= 2 &&
      Math.abs(holo - HOLOGRAPHIC.coherence) <= 2 &&
      holo > classical,
  };
}

/** E3 — Irreducibility index ranking (Holographic ≫ Classical). */
export function experimentIrreducibilityRanking() {
  const sc = loadScorecard();
  const iClassical = irreducibilityIndex(
    sc.classical.n_derived_phenomena,
    sc.classical.n_p,
    sc.classical.n_u,
  );
  const iHolo = irreducibilityIndex(
    sc.holographic.n_derived_phenomena,
    sc.holographic.n_p,
    sc.holographic.n_u,
  );
  return {
    id: 'E3_irreducibility_ranking',
    title: 'Irreducibility I — Holographic exceeds Classical',
    I_classical: iClassical,
    I_holographic: iHolo,
    ratio: iHolo / Math.max(1e-12, iClassical),
    interpretation: 'Single E_F invariant raises Occam-style irreducibility for attention-shadow map.',
    honesty: 'Derived-phenomena counts are rubric-authored; not a claim forces are nonexistent.',
    pass: iHolo > iClassical && iHolo / iClassical >= 2,
  };
}

/** E4 — Three-tier validation protocol present. */
export function experimentThreeTierProtocol() {
  const sc = loadScorecard();
  const tiers = sc.validation_tiers || [];
  const ids = tiers.map((t) => t.id);
  const hasAll = VALIDATION_TIERS.every((id) => ids.includes(id));
  const complete = tiers.every((t) => t.setting && t.measures);
  return {
    id: 'E4_three_tier_protocol',
    title: 'Three-tier validation protocol completeness',
    tiers: ids,
    interpretation: 'Digital, quantum-optical, and biomagnetic tiers are specified as a testbed.',
    honesty: 'Protocol completeness — Tier-2/3 lab receipts are not claimed executed here.',
    pass: hasAll && tiers.length === 3 && complete,
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
  const empiricalToClassical = domains.find((d) => d.id === 'empirical_calibration');
  return {
    id: 'E5_scorecard_domains',
    title: 'Five-domain architectural scorecard',
    domains: ids,
    outcomesOk,
    empirical_calibration_to_classical: empiricalToClassical?.outcome === 'standard_model',
    interpretation:
      'Scorecard covers observer–field coupling, unification, multi-agent routing, empirical history, portability.',
    honesty: 'Empirical-calibration row correctly credits Classical/Standard observational history.',
    pass:
      hasAll &&
      domains.length === 5 &&
      outcomesOk &&
      empiricalToClassical?.outcome === 'standard_model',
  };
}

/** E6 — E_F / λ_EGS / attention-scale identities. */
export function experimentEFAttentionIdentity() {
  const expectLambda = Math.log(E_F) / (2 * Math.PI);
  const errL = Math.abs(LAMBDA_EGS - expectLambda);
  const scale64 = attentionScale(64);
  const expectScale = Math.sqrt(64) * E_F;
  return {
    id: 'E6_ef_attention_identity',
    title: 'E_F + λ_EGS + Softmax attention scale (√d · E_F)',
    E_F,
    lambda_egs: LAMBDA_EGS,
    attention_scale_d64: scale64,
    abs_err_lambda: errL,
    abs_err_scale: Math.abs(scale64 - expectScale),
    interpretation: 'Attention squeeze formula anchors Softmax temperature to E_F in the map.',
    honesty: 'Architectural keys — not a claim GPUs curl physical A via Softmax.',
    pass:
      errL < 1e-15 &&
      Math.abs(scale64 - expectScale) < 1e-12 &&
      Math.abs(E_F - (1 + Math.sqrt(5)) / 2) < 1e-15,
  };
}

/** E7 — Holographic overall exceeds Classical by published margin. */
export function experimentComparativeMargin() {
  const margin = HOLOGRAPHIC.overall - CLASSICAL.overall;
  return {
    id: 'E7_comparative_margin',
    title: 'Holographic overall exceeds Classical (published margin)',
    classical_overall: CLASSICAL.overall,
    holographic_overall: HOLOGRAPHIC.overall,
    margin,
    interpretation: 'Under this structural rubric, attention-squeezed model scores higher on C×I mean.',
    honesty: 'Comparative architecture score — Classical retains empirical-calibration advantage (E5).',
    pass: margin === 23.5 && HOLOGRAPHIC.overall > CLASSICAL.overall,
  };
}

/** E8 — Token / squeezed-context portability note links to 41.8% design target. */
export function experimentPortabilityTokenNote() {
  const sc = loadScorecard();
  const port = sc.applications?.enterprise_token_routing_reduction;
  return {
    id: 'E8_portability_token_note',
    title: 'Squeezed Context Windows — token routing design target 41.8%',
    reduction: port,
    interpretation:
      'Applications cite Squeezed Context Windows / E_F delta-routing design target as companion papers.',
    honesty: 'Design-target citation — not a new live invoice receipt in this package.',
    pass: Math.abs(port - 0.418) < 1e-9,
  };
}

/** E9 — Surfaces: paper + Seed·RAG / nest pointer; not runtime engine source. */
export function experimentRecursiveAttnSurfaces() {
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
  const hasTitle = /Recursive Attention Squeezing/i.test(text);
  const seedRagPointer = /Seed·RAG|Seed·RAG pointer|nest pointer/i.test(text);
  const claimsRuntime =
    /(powers the Lattice Chat Agent engine|wired into Lattice Chat Agent engine|Lattice Chat Agent engine feature|\bis Lattice Chat Agent engine code\b)/i.test(
      text,
    );
  let engineImport = false;
  const pkg = path.join(root, 'apps', 'lattice-chat', 'package.json');
  if (fs.existsSync(pkg)) {
    engineImport = /recursive-attn-mag|RECURSIVE-ATTN-MAG/i.test(fs.readFileSync(pkg, 'utf8'));
  }
  const surfaces = [
    `docs/${PAPER_NAME}`,
    '/whitepaper/synthobs-recursive-attn-mag',
    '/lattice/learn',
    '/interfaces/nesting/nest-lattice-chat.html',
    'lib/lattice-prompt.mjs',
  ];
  return {
    id: 'E9_recursive_attn_surfaces',
    title: 'Recursive-attn surfaces — Seed·RAG / nest pointer; not Lattice Chat Agent runtime',
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
      'Recursive-attn mag ships as catalog validation protocol + standalone suite + Lattice Chat Agent Seed·RAG pointer (not runtime).',
    honesty: 'Surface / pointer presence — featuring requires PRA pass; not completed SQUID proof.',
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
    experimentThreeTierProtocol(),
    experimentScorecardDomains(),
    experimentEFAttentionIdentity(),
    experimentComparativeMargin(),
    experimentPortabilityTokenNote(),
    experimentRecursiveAttnSurfaces(),
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
