/**
 * Computation Workhorse Science — catalog suite fixtures (E1–E8).
 * Homeostasis Expedition · ENGINE_SHELF #46.
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
  GRAND_STORY,
  SIMULATION_EXECUTED,
  SYNTHETIC_ONLY,
  REAL_WORLD_SUPERIORITY_NOT_ESTABLISHED,
  SOFT_STORY_CATALOG,
  CONDITIONS,
  COST_CATEGORIES,
  PRIMARY_ENDPOINTS,
  CALENDAR_HORIZON_DAYS,
  PRESPECIFIED_REPETITIONS,
  DIGITAL_SEED,
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
    interpretation: 'Catalog nesting grammar only.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentHonestyLocks() {
  const pass =
    SIMULATION_EXECUTED === true &&
    SYNTHETIC_ONLY === true &&
    REAL_WORLD_SUPERIORITY_NOT_ESTABLISHED === true &&
    SOFT_STORY_CATALOG === true;
  return {
    id: 'E2_honesty_locks',
    title: 'CW-2 executed · synthetic only · real-world superiority not established',
    SIMULATION_EXECUTED,
    SYNTHETIC_ONLY,
    REAL_WORLD_SUPERIORITY_NOT_ESTABLISHED,
    SOFT_STORY_CATALOG,
    pass,
    interpretation: 'Appendix B populated under declared model — not grant-calibrated field proof.',
    honesty: 'Soft Story tier for factorial contrasts; policy conclusions require sensitivity + calibration.',
  };
}

function experimentFourConditionDesign() {
  const pass =
    CONDITIONS.length === 4 &&
    CONDITIONS.every((c) => ['A', 'B', 'C', 'D'].includes(c.id)) &&
    CALENDAR_HORIZON_DAYS === 365 &&
    PRESPECIFIED_REPETITIONS >= 200;
  return {
    id: 'E3_four_condition_design',
    title: 'Factorial A–D · 365-day horizon · ≥200 matched repetitions prespecified',
    CONDITIONS: [...CONDITIONS],
    CALENDAR_HORIZON_DAYS,
    PRESPECIFIED_REPETITIONS,
    pass,
    interpretation: 'Separates computation vs wet-lab and pipeline vs no pipeline.',
    honesty: 'Design lock — CW-2 executes under same prespec.',
  };
}

function experimentHomeostasisExpedition() {
  const pass = EXPEDITION === 'Homeostasis Expedition' && ENGINE_SHELF_SLOT === 46;
  return {
    id: 'E4_homeostasis_expedition',
    title: 'Homeostasis Expedition · ENGINE_SHELF #46',
    EXPEDITION,
    GRAND_STORY,
    ENGINE_SHELF_SLOT,
    pass,
    interpretation: 'Research economics + discovery-to-implementation audit on expedition trail.',
    honesty: 'Application companion — not engine CMOS pin.',
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
    hasWorkhorseTitle: /Primary Workhorse of Science|workhorse/i.test(paper),
    hasFourConditions: /Condition A|computation-first.*pipeline|four-condition/i.test(paper),
    hasPipeline: /Discovery-to-Implementation Pipeline/i.test(paper),
    hasCw2: /CW-2|seed 20261013|200 repetitions/i.test(paper),
    hasSyntheticHonesty: /synthetic|not calibrated|real-world superiority|Soft Story/i.test(paper),
    hasResearchEconomics: /research economics|fully allocated|researcher-year/i.test(paper),
    hasScientificIntegrity: /scientific integrity|independent validation|false positive/i.test(paper),
    hasCostCategories: COST_CATEGORIES.slice(0, 5).every((c) => paper.includes(c.replace('_', ' ')) || paper.includes(c)),
    hasEndpoints: PRIMARY_ENDPOINTS.some((e) => paper.includes(e.replace(/_/g, ' ')) || /primary endpoints/i.test(paper)),
    hasAppendixBNumbers: /Appendix B/i.test(paper) && /\| [0-9]+\.[0-9]+ \|/.test(paper),
    hasExpedition: /Homeostasis Expedition/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|#46|Infinite Octaves/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E5_paper_locks',
    title: 'Paper locks (CW-2 results · synthetic honesty · Appendix B numerics)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper reports executed synthetic simulation with calibration limits stated.',
    honesty: 'Structural text locks only.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug = body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) || body.includes(SHIP_BLOG_SLUG);
  const hasWhitepaper =
    body.includes('/whitepaper/computation-workhorse-science') || body.includes(REGISTRY_ID);
  const hasThesis = /computation|wet.?lab|researcher|paycheck|discovery|pipeline/i.test(body);
  const hasCaution =
    /synthetic|not calibrated|Soft Story|real-world|model assumption/i.test(body);
  const hasCw2 = /CW-2|200 repetition|Appendix B/i.test(body);
  return {
    id: 'E6_ship_blog_lock',
    title: 'Ship-blog surfaces CW-2 synthetic results + calibration limits',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasThesis,
    hasCaution,
    hasCw2,
    pass: exists && hasSlug && hasWhitepaper && hasThesis && hasCaution && hasCw2,
    interpretation: 'Guest note must not imply real-world superiority without calibration.',
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
    interpretation: 'Harmony grammar identity.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentComputationalLab() {
  const battery = runComputationalLabBattery();
  const cw2SeedOk = battery.cw2?.seed === DIGITAL_SEED;
  return {
    id: 'E8_computational_lab',
    title: 'Computational lab · CW-1 locks · CW-2 200-rep simulation (synthetic Appendix B)',
    ...battery,
    cw2SeedOk,
    pass: battery.allPlainPass === true && cw2SeedOk === true,
    interpretation: 'Design verified; Appendix B populated from auditable CW-2 run.',
    honesty: battery.honesty,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentHonestyLocks(),
    experimentFourConditionDesign(),
    experimentHomeostasisExpedition(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentGoldenIdentity(),
    experimentComputationalLab(),
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
