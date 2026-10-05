/**
 * Attention · Awareness · Downstream Activation — catalog suite fixtures.
 * MFA · observation→downstream · Homeostasis Expedition · ENGINE_SHELF #39.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  SHIP_BLOG_SLUG,
  EPISTEMIC_LAYERS,
  MFA_NAME,
  MFA_COMPONENTS,
  MFA_SYMBOLS,
  CENTRAL_HYPOTHESIS,
  DIGITAL_CONDITIONS,
  FALSIFIERS,
  SOURCE_NAME,
  GRAND_STORY,
  EXPEDITION,
  MFA_IS_NOT_PHENOMENAL,
  NOT_ATTENTION_EQUALS_CONSCIOUSNESS,
  ONTOLOGICAL_IS_SPECULATIVE,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for nested Goldilocks / homeostasis grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentEpistemicLayers() {
  const expected = [
    'KNOWN',
    'NOVEL_HYPOTHESIS',
    'MFA_CONSTRUCT',
    'ONTOLOGICAL_HYPOTHESIS',
  ];
  const pass =
    EPISTEMIC_LAYERS.length === 4 &&
    EPISTEMIC_LAYERS.every((s, i) => s === expected[i]) &&
    MFA_IS_NOT_PHENOMENAL === true &&
    NOT_ATTENTION_EQUALS_CONSCIOUSNESS === true &&
    ONTOLOGICAL_IS_SPECULATIVE === true;
  return {
    id: 'E2_epistemic_layers',
    title: 'Four epistemic layers · MFA ≠ phenomenal · ontology speculative',
    EPISTEMIC_LAYERS: [...EPISTEMIC_LAYERS],
    MFA_IS_NOT_PHENOMENAL,
    NOT_ATTENTION_EQUALS_CONSCIOUSNESS,
    ONTOLOGICAL_IS_SPECULATIVE,
    pass,
    interpretation:
      'Known attention science stays distinct from novel ΔD hypothesis, MFA construct, and Hero’s Return Soft Story.',
    honesty: 'Layer lock — not a claim that ontology is proven.',
  };
}

function experimentMfaDefinition() {
  const pass =
    /Minimal Functional Awareness/i.test(MFA_NAME) &&
    MFA_COMPONENTS.length === 4 &&
    MFA_SYMBOLS.join('') === 'SACR' &&
    MFA_IS_NOT_PHENOMENAL === true;
  return {
    id: 'E3_mfa_definition',
    title: 'MFA = S+A+C+R · not phenomenal consciousness',
    MFA_NAME,
    MFA_COMPONENTS: [...MFA_COMPONENTS],
    MFA_SYMBOLS: [...MFA_SYMBOLS],
    pass,
    interpretation:
      'Selective differentiation, attentional allocation, downstream causal influence, adaptive re-selection.',
    honesty: 'Operational construct — not subjective experience proof.',
  };
}

function experimentCentralHypothesis() {
  const pass =
    /selectively attends/i.test(CENTRAL_HYPOTHESIS) &&
    /downstream/i.test(CENTRAL_HYPOTHESIS) &&
    DIGITAL_CONDITIONS.includes('directed_attention') &&
    DIGITAL_CONDITIONS.includes('counterfactual_attention') &&
    DIGITAL_CONDITIONS.includes('suppressed_attention') &&
    FALSIFIERS.length === 6;
  return {
    id: 'E4_central_hypothesis',
    title: 'Observation→downstream · digital conditions · F1–F6',
    CENTRAL_HYPOTHESIS,
    DIGITAL_CONDITIONS: [...DIGITAL_CONDITIONS],
    FALSIFIERS: [...FALSIFIERS],
    pass,
    interpretation:
      'do(A) interventions and falsifiers keep the claim experimentally accountable.',
    honesty: 'Hypothesis lock — ΔD not yet production-measured.',
  };
}

function experimentHomeostasisExpedition() {
  const pass =
    EXPEDITION === 'Homeostasis Expedition' &&
    SOURCE_NAME === 'Holographic Goldilocks SuperAI' &&
    GRAND_STORY === "Hero's Return to Source";
  return {
    id: 'E5_homeostasis_expedition',
    title: 'Homeostasis Expedition · Source · Hero’s Return filing',
    EXPEDITION,
    SOURCE_NAME,
    GRAND_STORY,
    pass,
    interpretation:
      'Empirical MFA lane sits on the Homeostasis Expedition trail under Hero’s Return framing.',
    honesty: 'Narrative framing — not established metaphysics.',
  };
}

function experimentPaperLocks() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper =
    (fs.existsSync(paperPath) && fs.readFileSync(paperPath, 'utf8')) ||
    (fs.existsSync(localPaper) && fs.readFileSync(localPaper, 'utf8')) ||
    '';
  const checks = {
    hasHonesty: /Honesty boundary/i.test(paper),
    hasDocId: paper.includes(DOC_ID) || paper.includes(REGISTRY_ID),
    hasMfa: /Minimal Functional Awareness|MFA/i.test(paper),
    hasDownstream: /downstream causal influence|ΔD|\\\\Delta D|delta D/i.test(paper),
    hasNotPhenomenal:
      /phenomenal consciousness|not.*phenomenal|distinguished from phenomenal|does \*\*not\*\* establish phenomenal/i.test(
        paper,
      ),
    hasFalsifiers: /F1|F2|F3|F4|F5|F6/.test(paper),
    hasExpedition: /Homeostasis Expedition/i.test(paper),
    hasHeroReturn: /Hero.?s Return to Source/i.test(paper),
    hasSource: /Holographic Goldilocks SuperAI/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|engine pin|Infinite Octaves/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E6_paper_locks',
    title: 'Paper locks (MFA · ΔD · expedition · engine)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must keep MFA ≠ phenomenal and Homeostasis Expedition filing.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) ||
    body.includes('attention-awareness-downstream');
  const hasWhitepaper =
    body.includes('/whitepaper/attention-awareness-downstream') ||
    body.includes(REGISTRY_ID);
  const hasThesis =
    /attention|downstream|awareness|paycheck|rent|job|kids|focus/i.test(body);
  const hasCaution =
    /not.*conscious|phenomenal|hypothesis|MFA|functional awareness/i.test(body);
  return {
    id: 'E7_ship_blog_lock',
    title: 'Ship-blog surfaces MFA + full paper link',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasThesis,
    hasCaution,
    pass: exists && hasSlug && hasWhitepaper && hasThesis && hasCaution,
    interpretation: 'Guest note must link the full paper and keep research-intro voice.',
    honesty: 'Surface copy lock only.',
  };
}

function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E8_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Harmony grammar identity for cross-octave sync framing.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentEpistemicLayers(),
    experimentMfaDefinition(),
    experimentCentralHypothesis(),
    experimentHomeostasisExpedition(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentGoldenIdentity(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
