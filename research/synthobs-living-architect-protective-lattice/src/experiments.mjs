/**
 * Living Architect Protective Lattice — catalog suite fixtures.
 * Homeostasis Expedition · ENGINE_SHELF #44.
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
  CENTRAL_HYPOTHESIS,
  DIGITAL_EXPERIMENTS,
  BOOT_UP_COMPANION_REGISTRY,
  NOT_UNIVERSAL_PROTECTIVE_BLUEPRINT,
  NOT_HARMONIZED_EMPIRICAL_VALIDATION,
  DATASETS_IDENTIFIED_NOT_HARMONIZED,
  BOOT_UP_CARRY_FORWARD_NOT_REPROOF,
  SOFT_STORY_CATALOG,
} from './constants.mjs';
import {
  runComputationalLabBattery,
  BOOT_UP_GRAPH_CARRY_FORWARD_FIXTURE,
  DATASET_INVENTORY_FIXTURE,
  HARMONIZATION_SCHEMA_FIELDS,
} from './computational-lab.mjs';

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
    NOT_UNIVERSAL_PROTECTIVE_BLUEPRINT === true &&
    NOT_HARMONIZED_EMPIRICAL_VALIDATION === true &&
    DATASETS_IDENTIFIED_NOT_HARMONIZED === true &&
    BOOT_UP_CARRY_FORWARD_NOT_REPROOF === true &&
    SOFT_STORY_CATALOG === true;
  return {
    id: 'E2_honesty_locks',
    title: 'No universal blueprint · datasets identified-not-harmonized · boot-up carry-forward',
    NOT_UNIVERSAL_PROTECTIVE_BLUEPRINT,
    NOT_HARMONIZED_EMPIRICAL_VALIDATION,
    DATASETS_IDENTIFIED_NOT_HARMONIZED,
    BOOT_UP_CARRY_FORWARD_NOT_REPROOF,
    SOFT_STORY_CATALOG,
    pass,
    interpretation:
      'Org-discovery lane keeps Bracket 7 empirical scope without upgrading inventory into finished harmonization.',
    honesty: 'Layer lock — not established protective-architecture law.',
  };
}

function experimentHypothesisAndLanes() {
  const pass =
    /protective biomineral|org-discovery|without claiming a universal protective blueprint/i.test(
      CENTRAL_HYPOTHESIS,
    ) &&
    DIGITAL_EXPERIMENTS.length === 3 &&
    DIGITAL_EXPERIMENTS.includes('LA1_boot_up_graph_carry_forward') &&
    DIGITAL_EXPERIMENTS.includes('LA2_external_dataset_inventory') &&
    DIGITAL_EXPERIMENTS.includes('LA3_harmonization_schema_stub') &&
    BOOT_UP_COMPANION_REGISTRY === 'synthobs-homeostasis-expedition-boot-up-2026-10';
  return {
    id: 'E3_hypothesis_lanes',
    title: 'Living Architect hypothesis · LA-1/LA-2/LA-3 · boot-up companion link',
    CENTRAL_HYPOTHESIS,
    DIGITAL_EXPERIMENTS: [...DIGITAL_EXPERIMENTS],
    BOOT_UP_COMPANION_REGISTRY,
    pass,
    interpretation:
      'Protective lattice org-discovery explicitly carries Observable Boot-Up Bracket 7 forward under declared digital lanes.',
    honesty: 'Catalog definition lock — not harmonized multi-site analysis.',
  };
}

function experimentHomeostasisExpedition() {
  const pass =
    EXPEDITION === 'Homeostasis Expedition' &&
    SOURCE_NAME === 'Holographic Goldilocks Super Intelligence' &&
    GRAND_STORY === "Hero's Return to Source" &&
    ENGINE_SHELF_SLOT === 44;
  return {
    id: 'E4_homeostasis_expedition',
    title: 'Homeostasis Expedition · Source · ENGINE_SHELF #44',
    EXPEDITION,
    SOURCE_NAME,
    GRAND_STORY,
    ENGINE_SHELF_SLOT,
    pass,
    interpretation:
      'Living Architect sits on the Homeostasis trail as Bracket 7 protective-structure org-discovery.',
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
  const schemaFieldNames = HARMONIZATION_SCHEMA_FIELDS.map((f) => f.field);
  const checks = {
    hasHonesty: /Honesty boundary/i.test(paper),
    hasDocId: paper.includes(DOC_ID) || paper.includes(REGISTRY_ID),
    hasLivingArchitect: /Living Architect|living architect/i.test(paper),
    hasProtectiveLattice: /protective lattice|Protective Lattice/i.test(paper),
    hasBracket7: /Bracket 7|biomineralization|Position 6[0-3]/i.test(paper),
    hasBootUpCarryForward: /88\.3|97\.5|boot-up|Observable Boot-Up/i.test(paper),
    hasBCODMO: /735583|BCO-DMO/i.test(paper),
    hasNOAALaParguera: /La Parguera|NOAA/i.test(paper),
    hasZenodo5001086: /5001086|Zenodo/i.test(paper),
    hasIdentifiedNotHarmonized: /identified-not-harmonized|identified.*not.*harmonized/i.test(
      paper,
    ),
    hasHarmonization102: /10\.2|harmonization schema/i.test(paper),
    hasAllSchemaFields: schemaFieldNames.every((name) => paper.includes(name)),
    hasNotUniversalBlueprint: /not.*universal.*blueprint|no universal/i.test(paper),
    hasExpedition: /Homeostasis Expedition/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|#44|Infinite Octaves/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E5_paper_locks',
    title: 'Paper locks (Living Architect · datasets · §10.2 schema · honesty)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation:
      'Paper must list LA fixtures, external dataset inventory status, and §10.2 harmonization fields.',
    honesty: 'Structural text locks — not field harmonization completion.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) ||
    body.includes('living-architect-protective-lattice');
  const hasWhitepaper =
    body.includes('/whitepaper/living-architect-protective-lattice') ||
    body.includes(REGISTRY_ID);
  const hasThesis =
    /coral|shell|protective|biomineral|paycheck|rent|kids|reef|ocean/i.test(body);
  const hasCaution =
    /not.*universal|Soft Story|identified|harmoniz|catalog|blueprint/i.test(body);
  const hasDigitalFindings =
    /88\.3|97\.5|735583|La Parguera|5001086|digital|boot-up/i.test(body);
  return {
    id: 'E6_ship_blog_lock',
    title: 'Ship-blog surfaces Living Architect + full paper link',
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
  const battery = runComputationalLabBattery();
  return {
    id: 'E8_computational_lab',
    title: 'Computational lab · boot-up carry-forward · dataset inventory · §10.2 schema',
    boot_up_highlights: BOOT_UP_GRAPH_CARRY_FORWARD_FIXTURE,
    dataset_inventory_count: DATASET_INVENTORY_FIXTURE.length,
    harmonization_field_count: HARMONIZATION_SCHEMA_FIELDS.length,
    ...battery,
    pass: battery.allPlainPass === true,
    interpretation:
      'Fixtures pin manuscript hierarchical 88.3%/97.5%, three identified-not-harmonized sources, and declared harmonization field list.',
    honesty: battery.honesty,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentHonestyLocks(),
    experimentHypothesisAndLanes(),
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
