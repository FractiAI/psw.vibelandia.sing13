/**
 * Reflective Portal — catalog suite fixtures.
 * Multiscale octaves · P/R/M/RM · Goldilocks ρ · Homeostasis Expedition · ENGINE_SHELF #40.
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
  PORTAL_NAME,
  PORTAL_CYCLE,
  PORTAL_SYMBOLS,
  AGENT_TYPES,
  CENTRAL_HYPOTHESIS,
  DIGITAL_EXPERIMENTS,
  FALSIFIERS,
  OCTAVE_BANDS,
  SOURCE_NAME,
  GRAND_STORY,
  EXPEDITION,
  ENGINE_SHELF_ORDER,
  NOT_SUPERINTELLIGENCE_CLAIM,
  OCTAVES_ARE_CANDIDATE_LEVELS,
  NOT_HUMAN_BIOLOGY_PROOF,
  ONTOLOGICAL_IS_SPECULATIVE,
} from './constants.mjs';
import { runReflectivePortalBattery } from './digital-lab.mjs';

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
    'PORTAL_CONSTRUCT',
    'ONTOLOGICAL_HYPOTHESIS',
  ];
  const pass =
    EPISTEMIC_LAYERS.length === 4 &&
    EPISTEMIC_LAYERS.every((s, i) => s === expected[i]) &&
    NOT_SUPERINTELLIGENCE_CLAIM === true &&
    OCTAVES_ARE_CANDIDATE_LEVELS === true &&
    NOT_HUMAN_BIOLOGY_PROOF === true &&
    ONTOLOGICAL_IS_SPECULATIVE === true;
  return {
    id: 'E2_epistemic_layers',
    title: 'Four epistemic layers · not SI claim · octaves candidate · ontology speculative',
    EPISTEMIC_LAYERS: [...EPISTEMIC_LAYERS],
    NOT_SUPERINTELLIGENCE_CLAIM,
    OCTAVES_ARE_CANDIDATE_LEVELS,
    NOT_HUMAN_BIOLOGY_PROOF,
    ONTOLOGICAL_IS_SPECULATIVE,
    pass,
    interpretation:
      'Known adaptive control stays distinct from Portal hypothesis, octave map, and Hero’s Return Soft Story.',
    honesty: 'Layer lock — not a claim that ontology or Super Intelligence is proven.',
  };
}

function experimentPortalDefinition() {
  const pass =
    /Reflective Portal/i.test(PORTAL_NAME) &&
    PORTAL_CYCLE.length === 4 &&
    PORTAL_SYMBOLS.join('') === 'OEMV' &&
    AGENT_TYPES.length === 4 &&
    AGENT_TYPES[0] === 'P' &&
    AGENT_TYPES[1] === 'R' &&
    AGENT_TYPES[2] === 'M' &&
    AGENT_TYPES[3] === 'RM';
  return {
    id: 'E3_portal_definition',
    title: 'Portal = O→E→M→V · agents P/R/M/RM',
    PORTAL_NAME,
    PORTAL_CYCLE: [...PORTAL_CYCLE],
    PORTAL_SYMBOLS: [...PORTAL_SYMBOLS],
    AGENT_TYPES: [...AGENT_TYPES],
    pass,
    interpretation:
      'Observation → Evaluation → Modification → outcome evaluation; four matched agent classes.',
    honesty: 'Operational construct — not AGI proof.',
  };
}

function experimentCentralHypothesis() {
  const pass =
    /observe its own failure|self-modification|Reflective|modify its policy/i.test(
      CENTRAL_HYPOTHESIS,
    ) &&
    DIGITAL_EXPERIMENTS.includes('strategy_reversal') &&
    DIGITAL_EXPERIMENTS.includes('goldilocks_rho_sweep') &&
    FALSIFIERS.length >= 6 &&
    OCTAVE_BANDS.length >= 9 &&
    ENGINE_SHELF_ORDER === 40;
  return {
    id: 'E4_central_hypothesis',
    title: 'Portal hypothesis · digital experiments · F1–F8 · octaves · shelf #40',
    CENTRAL_HYPOTHESIS,
    DIGITAL_EXPERIMENTS: [...DIGITAL_EXPERIMENTS],
    FALSIFIERS: [...FALSIFIERS],
    OCTAVE_BANDS: [...OCTAVE_BANDS],
    ENGINE_SHELF_ORDER,
    pass,
    interpretation:
      'Matched P/R/M/RM battery + Goldilocks ρ + octave candidate map keep the claim experimentally accountable.',
    honesty: 'Hypothesis lock — sandbox not human biology.',
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
      'Empirical Reflective Portal lane sits on the Homeostasis Expedition trail under Hero’s Return framing.',
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
    hasPortal: /Reflective Portal|Observation.*Evaluation.*Modification/i.test(paper),
    hasAgents: /\bP\b.*\bR\b.*\bM\b|\bRM\b|Primal|Reflective self-modification/i.test(paper),
    hasDigitalFindings:
      /Digital experiments and findings|strategy reversal|Goldilocks ρ|plain findings/i.test(
        paper,
      ),
    hasNotSI:
      /not.*Super Intelligence|does \*\*not\*\* claim Super|candidate computational levels/i.test(
        paper,
      ),
    hasOctaves: /octave|Octave 0|multiscale/i.test(paper),
    hasFalsifiers: /F1|F2|F3|F4|F5|F6/.test(paper),
    hasExpedition: /Homeostasis Expedition/i.test(paper),
    hasHeroReturn: /Hero.?s Return to Source/i.test(paper),
    hasChartCompass: /CHART_COMPASS|Chart.?Compass|chart-compass/i.test(paper),
    hasAttention: /ATTENTION_AWARENESS|Attention.*Downstream|MFA/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|engine pin|Infinite Octaves/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E6_paper_locks',
    title: 'Paper locks (Portal · agents · expedition · Chart & Compass · Attention)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation:
      'Paper must keep octaves as candidate levels, lead with digital findings, and link peers.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) || body.includes('reflective-portal');
  const hasWhitepaper =
    body.includes('/whitepaper/reflective-portal') || body.includes(REGISTRY_ID);
  const hasThesis =
    /reflect|self-modif|watch itself|failure|pattern|paycheck|rent|job|kids|loop/i.test(body);
  const hasCaution =
    /not.*AGI|not.*Super Intelligence|sandbox|hypothesis|candidate|not human/i.test(body);
  const hasDigitalFindings =
    /digital experiment|strategy reversal|Goldilocks|ρ|rho|RM|reflective/i.test(body);
  return {
    id: 'E7_ship_blog_lock',
    title: 'Ship-blog surfaces Portal + full paper link',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasThesis,
    hasCaution,
    hasDigitalFindings,
    pass:
      exists &&
      hasSlug &&
      hasWhitepaper &&
      hasThesis &&
      hasCaution &&
      hasDigitalFindings,
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

function experimentDigitalPortalBattery() {
  const battery = runReflectivePortalBattery({ seed: 20261006 });
  return {
    id: 'E9_digital_reflective_portal',
    title: 'Digital Portal battery · P/R/M/RM · reversal · trap · perturbation · ρ sweep',
    ...battery,
    pass: battery.allPlainPass === true,
    interpretation:
      'RM wins strategy-reversal post-reversal reward with targeted mods; escapes traps faster; recovers faster from perturbation; intermediate ρ is Goldilocks.',
    honesty: battery.honesty,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentEpistemicLayers(),
    experimentPortalDefinition(),
    experimentCentralHypothesis(),
    experimentHomeostasisExpedition(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentGoldenIdentity(),
    experimentDigitalPortalBattery(),
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
