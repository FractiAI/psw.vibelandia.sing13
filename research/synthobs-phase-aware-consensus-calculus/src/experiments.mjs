/**
 * Phase-Aware Consensus Calculus — catalog suite fixtures (E1–E8).
 * Homeostasis Expedition · ENGINE_SHELF #47.
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
  ENGINE_SHELF_SLOT,
  EXPEDITION,
  DIGITAL_SEED,
  N_MONTE_CARLO,
  NOT_BLOCKCHAIN_CONSENSUS_PROOF,
  NOT_LIVE_GOVERNANCE_VALIDATION,
  NOT_UNIVERSAL_LAW,
  SOFT_STORY_EGS_GRAMMAR,
} from './constants.mjs';
import { runComputationalLabBattery } from './computational-lab.mjs';

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
    interpretation: 'Scale-invariant nesting grammar for multi-tier parabolic windows.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentHonestyLocks() {
  const pass =
    NOT_BLOCKCHAIN_CONSENSUS_PROOF === true &&
    NOT_LIVE_GOVERNANCE_VALIDATION === true &&
    NOT_UNIVERSAL_LAW === true &&
    SOFT_STORY_EGS_GRAMMAR === true;
  return {
    id: 'E2_honesty_locks',
    title: 'Not blockchain proof · not live governance · not universal law',
    NOT_BLOCKCHAIN_CONSENSUS_PROOF,
    NOT_LIVE_GOVERNANCE_VALIDATION,
    NOT_UNIVERSAL_LAW,
    SOFT_STORY_EGS_GRAMMAR,
    pass,
    interpretation: 'PAC-1 operates on synthetic preference trajectories only.',
    honesty: 'Layer lock — not DAO or board field validation.',
  };
}

function experimentLabScaffold() {
  const pass = N_MONTE_CARLO === 1000 && DIGITAL_SEED === 20261015;
  return {
    id: 'E3_lab_scaffold',
    title: 'PAC-1 Monte Carlo scaffold',
    N_MONTE_CARLO,
    DIGITAL_SEED,
    pass,
    interpretation: '1000 trials per noise level · deterministic seed.',
    honesty: 'Simulation parameters — not preregistered external governance data.',
  };
}

function experimentHomeostasisExpedition() {
  const pass = EXPEDITION === 'Homeostasis Expedition' && ENGINE_SHELF_SLOT === 47;
  return {
    id: 'E4_homeostasis_expedition',
    title: 'Homeostasis Expedition · ENGINE_SHELF #47',
    EXPEDITION,
    ENGINE_SHELF_SLOT,
    pass,
    interpretation: 'Phase-space homeostasis for multi-agent preference alignment.',
    honesty: 'Engine companion — not CMOS silicon pin.',
  };
}

function experimentPaperLocks() {
  const docPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  let body = '';
  try {
    body = fs.readFileSync(docPath, 'utf8');
  } catch {
    body = '';
  }
  const pass =
    body.includes(DOC_ID) &&
    body.includes(REGISTRY_ID) &&
    body.includes('Honesty boundary') &&
    body.includes('SynthOBS Autonomous Agent');
  return {
    id: 'E5_paper_locks',
    title: 'Monorepo paper · Document ID · operator line',
    docPath,
    DOC_ID,
    REGISTRY_ID,
    pass,
    interpretation: 'Whitepaper registered with PRA structural gates.',
    honesty: 'File presence in monorepo — standalone copy may lag until publish.',
  };
}

function experimentShipBlogLocks() {
  let body = '';
  try {
    body = fs.readFileSync(MONOREPO_BLOG, 'utf8');
  } catch {
    body = '';
  }
  const pass =
    body.includes(SHIP_BLOG_SLUG) &&
    body.includes('FractiAI Research') &&
    body.includes('class="honesty"');
  return {
    id: 'E6_ship_blog_locks',
    title: 'Ship blog · slug · honesty rail',
    SHIP_BLOG_FILE,
    SHIP_BLOG_SLUG,
    pass,
    interpretation: 'QUESTFEST magazine feature with end honesty rail.',
    honesty: 'HTML corpus — journalism CI enforces voice.',
  };
}

function experimentComputationalBattery() {
  const battery = runComputationalLabBattery();
  const pass =
    battery.quadrature.pass &&
    battery.lab1.pass &&
    battery.lab2.pass &&
    battery.lab3.pass &&
    battery.egsTier.pass;
  return {
    id: 'E7_computational_battery',
    title: 'PAC-1 computational lab battery',
    battery,
    pass,
    interpretation:
      '90° quadrature identity · Taylor table · Monte Carlo structural gates · asymmetric windows · Φ tier demo.',
    honesty: 'Lab 2 manuscript medians are anchors; live medians are simulation-parameter dependent.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentHonestyLocks(),
    experimentLabScaffold(),
    experimentHomeostasisExpedition(),
    experimentPaperLocks(),
    experimentShipBlogLocks(),
    experimentComputationalBattery(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass: experiments.length - failed.length,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
