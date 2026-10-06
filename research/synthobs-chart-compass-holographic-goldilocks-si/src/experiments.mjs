/**
 * Chart & Compass · Holographic Goldilocks SI Frontier — catalog suite fixtures.
 * Homeostasis Expedition · ENGINE_SHELF #41.
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
  SOURCE_NAME,
  GRAND_STORY,
  CHART_ROLE,
  COMPASS_ROLE,
  DIGITAL_EXPERIMENTS,
  FALSIFIERS,
  NOT_ESTABLISHED_SI,
  NOT_LITERAL_HOLOGRAPHY,
  NOT_UNIVERSAL_GOLDILOCKS_LAW,
  SOFT_STORY_CATALOG,
} from './constants.mjs';
import { runDigitalLabBattery } from './digital-lab.mjs';

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

function experimentHonestyLocks() {
  const pass =
    NOT_ESTABLISHED_SI === true &&
    NOT_LITERAL_HOLOGRAPHY === true &&
    NOT_UNIVERSAL_GOLDILOCKS_LAW === true &&
    SOFT_STORY_CATALOG === true;
  return {
    id: 'E2_honesty_locks',
    title: 'Not SI · not literal holography · not universal Goldilocks law',
    NOT_ESTABLISHED_SI,
    NOT_LITERAL_HOLOGRAPHY,
    NOT_UNIVERSAL_GOLDILOCKS_LAW,
    SOFT_STORY_CATALOG,
    pass,
    interpretation:
      'Chart & Compass remains Soft Story / catalog / proof-of-concept — not finished physics or AGI proof.',
    honesty: 'Layer lock — not a claim that Super Intelligence is established.',
  };
}

function experimentChartCompassRoles() {
  const pass =
    /Map of explored/i.test(CHART_ROLE) &&
    /Reflective Portal|self-modification/i.test(COMPASS_ROLE);
  return {
    id: 'E3_chart_compass_roles',
    title: 'Chart = surveyed terrain · Compass = orientation under self-modification',
    CHART_ROLE,
    COMPASS_ROLE,
    pass,
    interpretation:
      'Separates what has been mapped from the instrument that keeps orientation when the map-maker changes.',
    honesty: 'Metaphor lock — not nautical navigation software.',
  };
}

function experimentDigitalExperimentIds() {
  const pass =
    DIGITAL_EXPERIMENTS.length === 3 &&
    DIGITAL_EXPERIMENTS.includes('I_goldilocks_regulation_sweep') &&
    DIGITAL_EXPERIMENTS.includes('II_reflective_portal') &&
    DIGITAL_EXPERIMENTS.includes('III_cross_scale_reconstructability') &&
    FALSIFIERS.length === 6;
  return {
    id: 'E4_digital_experiment_ids',
    title: 'Three digital experiments · F1–F6',
    DIGITAL_EXPERIMENTS: [...DIGITAL_EXPERIMENTS],
    FALSIFIERS: [...FALSIFIERS],
    pass,
    interpretation:
      'Regulation sweep · Reflective Portal · cross-scale reconstructability keep the frontier falsifiable.',
    honesty: 'ID lock — sandbox, not field trial.',
  };
}

function experimentHomeostasisExpedition() {
  const pass =
    EXPEDITION === 'Homeostasis Expedition' &&
    SOURCE_NAME === 'Holographic Goldilocks SuperAI' &&
    GRAND_STORY === "Hero's Return to Source" &&
    ENGINE_SHELF_SLOT === 41;
  return {
    id: 'E5_homeostasis_expedition',
    title: 'Homeostasis Expedition · Source · ENGINE_SHELF #41',
    EXPEDITION,
    SOURCE_NAME,
    GRAND_STORY,
    ENGINE_SHELF_SLOT,
    pass,
    interpretation:
      'Chart & Compass sits on the Homeostasis Expedition trail under Hero’s Return framing.',
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
    hasDigitalFindings:
      /Digital experiments and findings|Goldilocks Regulation Sweep|Reflective Portal/i.test(
        paper,
      ),
    hasChartCompass: /chart/i.test(paper) && /compass/i.test(paper),
    hasNotSi:
      /not.*established Super Intelligence|NOT.*Super Intelligence|not established Super Intelligence/i.test(
        paper,
      ),
    hasNotHolography: /not literal holography|not.*AdS\/CFT|systems sense/i.test(paper),
    hasNotUniversal: /not.*universal Goldilocks|not a universal Goldilocks/i.test(paper),
    hasFalsifiers: /F1|F2|F3|F4|F5|F6/.test(paper),
    hasExpedition: /Homeostasis Expedition/i.test(paper),
    hasHeroReturn: /Hero.?s Return to Source/i.test(paper),
    hasSource: /Holographic Goldilocks SuperAI/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|#41|Infinite Octaves/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasHistoricalRhyme: /Lewis|Clark|Humboldt|Darwin/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E6_paper_locks',
    title: 'Paper locks (Chart · Compass · digital findings · expedition)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must lead with digital findings and keep Soft Story honesty.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) ||
    body.includes('chart-compass-goldilocks-si');
  const hasWhitepaper =
    body.includes('/whitepaper/chart-compass-goldilocks-si') ||
    body.includes(REGISTRY_ID);
  const hasThesis =
    /chart|compass|expedition|paycheck|rent|job|kids|intelligence/i.test(body);
  const hasCaution =
    /not.*Super Intelligence|holograph|Soft Story|catalog|proof-of-concept/i.test(body);
  const hasDigitalFindings =
    /digital experiment|regulation sweep|Reflective Portal|reconstructab|R²|R2|sandbox/i.test(
      body,
    );
  return {
    id: 'E7_ship_blog_lock',
    title: 'Ship-blog surfaces Chart & Compass + full paper link',
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

function experimentDigitalLab() {
  const battery = runDigitalLabBattery({ seed: 20261006 });
  return {
    id: 'E9_digital_lab',
    title:
      'Digital lab · Goldilocks sweep · Reflective Portal · cross-scale reconstructability',
    ...battery,
    pass: battery.allPlainPass === true,
    interpretation:
      'Intermediate ρ beats extremes; reflective beats fixed modestly after target change; local→global R² survives shuffle control.',
    honesty: battery.honesty,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentHonestyLocks(),
    experimentChartCompassRoles(),
    experimentDigitalExperimentIds(),
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
