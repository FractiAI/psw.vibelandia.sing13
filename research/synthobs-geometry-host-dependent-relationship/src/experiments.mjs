/**
 * Geometry Host-Dependent Relationship — catalog suite fixtures (E1–E8).
 * Homeostasis Expedition · ENGINE_SHELF #48.
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
  NOT_NATURAL_SYSTEM_DATA,
  NOT_FRACTALITY_PROOF,
  NOT_CROSS_DOMAIN_RECURRENCE_PROOF,
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
    interpretation: 'Catalog nesting grammar for multiscale mapping proposals.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentHonestyLocks() {
  const pass =
    NOT_NATURAL_SYSTEM_DATA === true &&
    NOT_FRACTALITY_PROOF === true &&
    NOT_CROSS_DOMAIN_RECURRENCE_PROOF === true &&
    NOT_UNIVERSAL_LAW === true &&
    SOFT_STORY_EGS_GRAMMAR === true;
  return {
    id: 'E2_honesty_locks',
    title: 'Not natural data · not fractality proof · not cross-domain recurrence proof',
    NOT_NATURAL_SYSTEM_DATA,
    NOT_FRACTALITY_PROOF,
    NOT_CROSS_DOMAIN_RECURRENCE_PROOF,
    NOT_UNIVERSAL_LAW,
    SOFT_STORY_EGS_GRAMMAR,
    pass,
    interpretation: 'GHDR-1 is synthetic path geometry only.',
    honesty: 'Forest/ant colony comparison remains Stage C — not executed here.',
  };
}

function experimentLabScaffold() {
  return {
    id: 'E3_lab_scaffold',
    title: 'GHDR-1 grid scaffold · seed lock',
    DIGITAL_SEED,
    pass: DIGITAL_SEED === 20261015,
    interpretation: 'Deterministic host A/B replay.',
    honesty: 'Not preregistered ecological field study.',
  };
}

function experimentHomeostasisExpedition() {
  const pass = EXPEDITION === 'Homeostasis Expedition' && ENGINE_SHELF_SLOT === 48;
  return {
    id: 'E4_homeostasis_expedition',
    title: 'Homeostasis Expedition · ENGINE_SHELF #48',
    EXPEDITION,
    ENGINE_SHELF_SLOT,
    pass,
    interpretation: 'Host-dependent relational geometry research program.',
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
    honesty: 'Standalone copy syncs via publish script.',
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
    honesty: 'Journalism CI enforces voice on HTML corpus.',
  };
}

function experimentComputationalBattery() {
  const battery = runComputationalLabBattery();
  const pass =
    battery.hostComparison.pass &&
    battery.hostDependence.pass &&
    battery.objectiveInvariance.pass &&
    battery.hostGradient.pass &&
    battery.egsTier.pass;
  return {
    id: 'E7_computational_battery',
    title: 'GHDR-1 computational lab battery',
    battery,
    pass,
    interpretation:
      '§9.2 host A/B table replay · H1 host dependence · objective invariance · Φ tier demo.',
    honesty: 'H2–H4 require Stage B–F datasets — not claimed as executed.',
  };
}

/** Stage B placeholder: criteria checklist for relational fractality (structural lock). */
function experimentRelationalFractalityCriteriaLock() {
  const criteria = [
    'defined_relationships',
    'recurrence',
    'explicit_mapping',
    'measurable_preservation',
    'nontrivial_null_models',
    'host_dependence_characterized',
  ];
  return {
    id: 'E8_relational_fractality_criteria',
    title: 'Relational fractality criteria (framework lock · not validated here)',
    criteria,
    pass: criteria.length === 6,
    interpretation: 'Paper §6 criteria exported as checklist for future confirmatory work.',
    honesty: 'Checklist presence ≠ empirical validation.',
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
    experimentRelationalFractalityCriteriaLock(),
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
