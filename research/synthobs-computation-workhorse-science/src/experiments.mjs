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
  FINDINGS_NOT_ESTABLISHED,
  NOT_COMPLETED_SIMULATION,
  AWAITING_EXECUTION,
  SOFT_STORY_CATALOG,
  CONDITIONS,
  COST_CATEGORIES,
  PRIMARY_ENDPOINTS,
  CALENDAR_HORIZON_DAYS,
  PRESPECIFIED_REPETITIONS,
} from './constants.mjs';
import { runDigitalLabBattery, APPENDIX_B_PLACEHOLDER } from './digital-lab.mjs';

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
    FINDINGS_NOT_ESTABLISHED === true &&
    NOT_COMPLETED_SIMULATION === true &&
    AWAITING_EXECUTION === true &&
    SOFT_STORY_CATALOG === true;
  return {
    id: 'E2_honesty_locks',
    title: 'Findings not established · simulation not completed · awaiting execution',
    FINDINGS_NOT_ESTABLISHED,
    NOT_COMPLETED_SIMULATION,
    AWAITING_EXECUTION,
    SOFT_STORY_CATALOG,
    pass,
    interpretation: 'Manuscript is prespecified design — not completed quantitative investigation.',
    honesty: 'No invented simulation outputs as evidence.',
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
    honesty: 'Design lock — not executed comparative results.',
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
    hasNotEstablished: /not yet established|not reported as established|awaiting execution|To be calculated/i.test(
      paper,
    ),
    hasResearchEconomics: /research economics|fully allocated|researcher-year/i.test(paper),
    hasScientificIntegrity: /scientific integrity|independent validation|false positive/i.test(paper),
    hasCostCategories: COST_CATEGORIES.slice(0, 5).every((c) => paper.includes(c.replace('_', ' ')) || paper.includes(c)),
    hasEndpoints: PRIMARY_ENDPOINTS.some((e) => paper.includes(e.replace(/_/g, ' ')) || /primary endpoints/i.test(paper)),
    hasAppendixB: /Table B1|Appendix B/i.test(paper) && paper.includes(APPENDIX_B_PLACEHOLDER),
    hasExpedition: /Homeostasis Expedition/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|#46|Infinite Octaves/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E5_paper_locks',
    title: 'Paper locks (four-condition design · findings status · Appendix B placeholders)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must not claim completed comparative numerical findings.',
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
    /not yet|awaiting|To be calculated|design|not established|unmeasured/i.test(body);
  return {
    id: 'E6_ship_blog_lock',
    title: 'Ship-blog surfaces design status + full paper link',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasThesis,
    hasCaution,
    pass: exists && hasSlug && hasWhitepaper && hasThesis && hasCaution,
    interpretation: 'Guest note must not imply completed superiority results.',
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

function experimentDigitalLab() {
  const battery = runDigitalLabBattery();
  return {
    id: 'E8_digital_lab',
    title: 'CW-1 design locks · infrastructure pilot (non-decisive)',
    ...battery,
    pass: battery.allPlainPass === true,
    interpretation:
      'Design verified; Appendix B tables remain to be calculated from full execution.',
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
    experimentDigitalLab(),
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
