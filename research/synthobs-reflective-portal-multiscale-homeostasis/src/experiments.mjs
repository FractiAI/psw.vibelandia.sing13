/**
 * Reflective Portal · Multiscale Homeostasis — catalog suite fixtures.
 * Homeostasis Expedition · ENGINE_SHELF companion #40.
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
  OCTAVE_BANDS,
  AGENT_KINDS,
  PORTAL_CYCLE,
  CENTRAL_HYPOTHESIS,
  PORTAL_DEFINITION,
  DIGITAL_EXPERIMENTS,
  FALSIFIERS,
  SOURCE_NAME,
  GRAND_STORY,
  EXPEDITION,
  REFLECTION_NE_TRANSFORMATION,
  LEARNING_NE_REFLECTION,
  PORTAL_REQUIRES_BOTH,
  NOT_CLAIMING_BIOLOGICAL_DISCRETE_LAYERS,
  NOT_CLAIMING_PHENOMENAL_CONSCIOUSNESS,
} from './constants.mjs';
import { runReflectivePortalBattery } from './reflective-portal-lab.mjs';

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

function experimentOctaveBands() {
  const pass =
    OCTAVE_BANDS.length >= 8 &&
    OCTAVE_BANDS.includes('primal_behavioral') &&
    OCTAVE_BANDS.includes('reflective') &&
    OCTAVE_BANDS.includes('self_modifying') &&
    NOT_CLAIMING_BIOLOGICAL_DISCRETE_LAYERS === true;
  return {
    id: 'E2_octave_bands',
    title: 'Nested octave bands · structural · not discrete biology claim',
    OCTAVE_BANDS: [...OCTAVE_BANDS],
    NOT_CLAIMING_BIOLOGICAL_DISCRETE_LAYERS,
    pass,
    interpretation: 'Candidate computational scales from molecular through recursive.',
    honesty: 'Structural map — not experimentally established biological layers.',
  };
}

function experimentPortalDefinition() {
  const pass =
    AGENT_KINDS.join(',') === 'P,R,M,RM' &&
    PORTAL_CYCLE.join('→') ===
      'behavior→observation→evaluation→modification→new_behavior' &&
    REFLECTION_NE_TRANSFORMATION &&
    LEARNING_NE_REFLECTION &&
    PORTAL_REQUIRES_BOTH &&
    NOT_CLAIMING_PHENOMENAL_CONSCIOUSNESS &&
    /self-observation/i.test(PORTAL_DEFINITION);
  return {
    id: 'E3_portal_definition',
    title: 'Portal = observation + evaluation + causal self-modification',
    AGENT_KINDS: [...AGENT_KINDS],
    PORTAL_CYCLE: [...PORTAL_CYCLE],
    PORTAL_DEFINITION,
    REFLECTION_NE_TRANSFORMATION,
    LEARNING_NE_REFLECTION,
    PORTAL_REQUIRES_BOTH,
    NOT_CLAIMING_PHENOMENAL_CONSCIOUSNESS,
    pass,
    interpretation: 'Reflection alone ≠ portal; learning alone ≠ portal.',
    honesty: 'Computational construct — not phenomenal consciousness.',
  };
}

function experimentCentralHypothesis() {
  const pass =
    /organizational octaves/i.test(CENTRAL_HYPOTHESIS) &&
    /modifying/i.test(CENTRAL_HYPOTHESIS) &&
    DIGITAL_EXPERIMENTS.length >= 6 &&
    FALSIFIERS.length >= 8 &&
    EXPEDITION === 'Homeostasis Expedition';
  return {
    id: 'E4_central_hypothesis',
    title: 'Expedition hypothesis · digital experiments · F1–F8',
    CENTRAL_HYPOTHESIS,
    DIGITAL_EXPERIMENTS: [...DIGITAL_EXPERIMENTS],
    FALSIFIERS: [...FALSIFIERS],
    EXPEDITION,
    SOURCE_NAME,
    GRAND_STORY,
    pass,
    interpretation: 'Integrative multiscale portal hypothesis with explicit falsifiers.',
    honesty: 'Hypothesis lock — digital sandbox only for shipped empirics.',
  };
}

function experimentPaperLocks() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper = fs.existsSync(paperPath)
    ? fs.readFileSync(paperPath, 'utf8')
    : fs.existsSync(localPaper)
      ? fs.readFileSync(localPaper, 'utf8')
      : '';
  const checks = {
    hasDocId: paper.includes(DOC_ID),
    hasRegistry: paper.includes(REGISTRY_ID),
    hasHonesty: /Honesty boundary/i.test(paper),
    hasPortal: /Reflective Modification Portal/i.test(paper),
    hasDigitalUpfront: /Digital experiments and findings/i.test(paper),
    hasAgents: /Agent P|Agent RM|Agent R|Agent M/.test(paper),
    hasFalsifiers: /F1|F2|F3|F4|F5|F6|F7|F8/.test(paper),
    hasExpedition: /Homeostasis Expedition/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|engine pin|Infinite Octaves/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasNotConsciousness: /not.*phenomenal|not.*consciousness/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E5_paper_locks',
    title: 'Paper locks (portal · digital upfront · expedition · engine)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must lead with digital findings and keep honesty rails.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) ||
    body.includes('reflective-portal-homeostasis');
  const hasWhitepaper =
    body.includes('/whitepaper/reflective-portal-homeostasis') ||
    body.includes(REGISTRY_ID);
  const hasThesis =
    /reflective|portal|homeostasis|habit|paycheck|rent|job|kids/i.test(body);
  const hasCaution =
    /not.*conscious|sandbox|hypothesis|catalog|not human trials/i.test(body);
  const hasDigitalFindings =
    /digital experiment|Agent RM|strategy reversal|Goldilocks|trap/i.test(body);
  return {
    id: 'E6_ship_blog_lock',
    title: 'Ship-blog surfaces portal + digital findings + full paper link',
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
    interpretation: 'Guest note must lead with plain digital findings.',
    honesty: 'Surface copy lock only.',
  };
}

function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E7_phi_squared_identity',
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
    id: 'E8_digital_reflective_portal',
    title:
      'Digital Reflective Portal battery · P/R/M/RM · reversal · trap · recovery · transfer · ρ · recursive',
    seed: battery.seed,
    findings: battery.findings,
    plainSummary: battery.plainSummary,
    bestRho: battery.goldilocks.bestRho,
    strategyReversal: {
      meanC_RM: battery.strategyReversal.agents.RM.meanC,
      meanC_P: battery.strategyReversal.agents.P.meanC,
      recoveryB_RM: battery.strategyReversal.agents.RM.recoveryB,
      recoveryB_P: battery.strategyReversal.agents.P.recoveryB,
      mods: battery.strategyReversal.agents.RM.snap.modCount,
    },
    recurrentTrap: {
      lateMean_RM: battery.recurrentTrap.agents.RM.lateMean,
      lateMean_P: battery.recurrentTrap.agents.P.lateMean,
      trapRate_RM: battery.recurrentTrap.agents.RM.trapRate,
      trapRate_P: battery.recurrentTrap.agents.P.trapRate,
    },
    perturbation: {
      T_RM: battery.perturbation.agents.RM.T_recovery,
      T_P: battery.perturbation.agents.P.T_recovery,
    },
    transfer: {
      RM: battery.transfer.agents.RM.transferHit,
      P: battery.transfer.agents.P.transferHit,
    },
    goldilocksInterior: battery.goldilocks.goldilocksInterior,
    pass: battery.allPlainPass === true,
    interpretation:
      'Agent RM (portal) beats sticky baselines on reversal, trap escape, and recovery; Goldilocks ρ is interior; reflection-only does not transform.',
    honesty:
      'Replayable digital sandbox — not human trials, not wet-lab, not consciousness proof.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentOctaveBands(),
    experimentPortalDefinition(),
    experimentCentralHypothesis(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentGoldenIdentity(),
    experimentDigitalPortalBattery(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    experiments,
    n_pass,
    n_total: experiments.length,
    failed,
    all_pass: failed.length === 0,
  };
}
