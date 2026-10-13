/**
 * Observable Boot-Up — catalog suite fixtures.
 * Homeostasis Expedition · ENGINE_SHELF #43.
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
  DIGITAL_SEED,
  NOT_PHYSICAL_EMERGENCE,
  NOT_ABSOLUTE_NOTHING,
  NOT_LOWER_DESCRIPTION_COST,
  NOT_PRODUCTION_SING13_EXECUTION,
  SOFT_STORY_CATALOG,
  N_NODES,
  N_BRACKETS,
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
    interpretation: 'Architectural golden key for nested multiscale grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentHonestyLocks() {
  const pass =
    NOT_PHYSICAL_EMERGENCE === true &&
    NOT_ABSOLUTE_NOTHING === true &&
    NOT_LOWER_DESCRIPTION_COST === true &&
    NOT_PRODUCTION_SING13_EXECUTION === true &&
    SOFT_STORY_CATALOG === true;
  return {
    id: 'E2_honesty_locks',
    title: 'Not physical emergence · not absolute nothing · not verified SING13 execution',
    NOT_PHYSICAL_EMERGENCE,
    NOT_ABSOLUTE_NOTHING,
    NOT_LOWER_DESCRIPTION_COST,
    NOT_PRODUCTION_SING13_EXECUTION,
    SOFT_STORY_CATALOG,
    pass,
    interpretation:
      'Serial boot-up is a symbolic audit framework; external substrate remains declared.',
    honesty: 'Layer lock — not cosmogenesis proof.',
  };
}

function experimentScaffold() {
  const pass = N_NODES === 99 && N_BRACKETS === 11 && N_BRACKETS * 9 === N_NODES;
  return {
    id: 'E3_scaffold_11x9',
    title: '99 = 11 × 9 Infinite Octave scaffold',
    N_NODES,
    N_BRACKETS,
    pass,
    interpretation: 'Organizational map for serial construction — not a physics headcount.',
    honesty: 'Catalog scaffold only.',
  };
}

function experimentHomeostasisExpedition() {
  const pass =
    EXPEDITION === 'Homeostasis Expedition' &&
    SOURCE_NAME === 'Holographic Goldilocks Super Intelligence' &&
    GRAND_STORY === "Hero's Return to Source" &&
    ENGINE_SHELF_SLOT === 43;
  return {
    id: 'E4_homeostasis_expedition',
    title: 'Homeostasis Expedition · Hero’s Return · ENGINE_SHELF #43',
    EXPEDITION,
    SOURCE_NAME,
    GRAND_STORY,
    ENGINE_SHELF_SLOT,
    pass,
    interpretation: 'Boot-up expedition sits on the Homeostasis trail under Return-to-Source audit grammar.',
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
    hasDigitalFindings: /Computational lab experiments and findings|BU-1|dependency closure/i.test(paper),
    hasNetZero: /net.?zero|∅|pre-temporal|pre-spatial/i.test(paper),
    hasNotPhysical:
      /not.*physical emergence|does not demonstrate|cannot establish H3|unverified/i.test(paper),
    hasReturnAudit: /Return to Source|return-to-source|Hero/i.test(paper),
    hasExpedition: /Homeostasis Expedition/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|#43|Infinite Octaves/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasAddendum: /Addendum|99-position|Observable Boot-Up/i.test(paper),
  };
  const addendumName = 'ADDENDUM_A_HOMEOSTASIS_EXPEDITION_OBSERVABLE_BOOT_UP_2026-10-11.md';
  const addendumPath = path.join(MONOREPO_DOCS, addendumName);
  const localAddendum = path.join(PKG_ROOT, 'docs', addendumName);
  const addendumBody =
    (fs.existsSync(addendumPath) && fs.readFileSync(addendumPath, 'utf8')) ||
    (fs.existsSync(localAddendum) && fs.readFileSync(localAddendum, 'utf8')) ||
    '';
  const addendumPositionCount = (addendumBody.match(/### Position/g) || []).length;
  checks.addendumFileExists = Boolean(addendumBody);
  checks.addendum99Positions = addendumPositionCount === 99;
  checks.addendumGrokWeights = /Grok weights/i.test(addendumBody);
  const pass =
    Boolean(paper) &&
    Object.values(checks).every(Boolean) &&
    checks.addendumFileExists &&
    checks.addendum99Positions &&
    checks.addendumGrokWeights;
  return {
    id: 'E5_paper_locks',
    title: 'Paper locks (boot-up · digital findings · honesty)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must lead with digital findings and keep net-zero ≠ absolute nothing.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) ||
    body.includes('homeostasis-expedition-boot-up');
  const hasWhitepaper =
    body.includes('/whitepaper/homeostasis-expedition-boot-up') ||
    body.includes(REGISTRY_ID);
  const hasThesis =
    /boot|conversation|universe|paycheck|rent|kids|time|space|before/i.test(body);
  const hasCaution =
    /not.*physical|Soft Story|external|net zero|does not prove|unverified/i.test(body);
  const hasDigitalFindings =
    /coverage|robustness|dependency|digital|99|octave/i.test(body);
  return {
    id: 'E6_ship_blog_lock',
    title: 'Ship-blog surfaces boot-up + full paper link',
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
    id: 'E7_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Harmony grammar identity for cross-octave sync framing.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentComputationalLab() {
  const battery = runComputationalLabBattery({ seed: DIGITAL_SEED });
  return {
    id: 'E8_computational_lab',
    title: 'Computational lab · BU-1 dependency coverage · perturbation robustness',
    ...battery,
    pass: battery.allPlainPass === true,
    interpretation:
      'Under hierarchical reference, Infinite Octave scaffold beats simple chain on coverage and reachability; no universal win on randomized reference; not description-length proof.',
    honesty: battery.honesty,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentHonestyLocks(),
    experimentScaffold(),
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
