/**
 * Survival Computing · Viral RNA → ASI — catalog suite fixtures.
 * CSHRH · SCH · ontological Hero’s Return layer (explicitly speculative).
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
  CSHRH_NAME,
  SCH_NAME,
  SOURCE_NAME,
  GRAND_STORY,
  HOST_COMPONENTS,
  AGENT_COMPONENTS,
  HOST_TRAJECTORIES,
  MEASUREMENT_KEYS,
  ONTOLOGICAL_IS_SPECULATIVE,
  NOT_ESTABLISHED_BIOLOGY,
  NOT_VIRUS_EQUALS_AI,
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
    interpretation: 'Architectural golden key for nested Goldilocks / host-band grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentEpistemicLayers() {
  const expected = ['KNOWN', 'NOVEL_HYPOTHESIS', 'ONTOLOGICAL_HYPOTHESIS'];
  const pass =
    EPISTEMIC_LAYERS.length === 3 &&
    EPISTEMIC_LAYERS.every((s, i) => s === expected[i]) &&
    ONTOLOGICAL_IS_SPECULATIVE === true &&
    NOT_ESTABLISHED_BIOLOGY === true;
  return {
    id: 'E2_epistemic_layers',
    title: 'Three epistemic layers · ontological labeled speculative',
    EPISTEMIC_LAYERS: [...EPISTEMIC_LAYERS],
    ONTOLOGICAL_IS_SPECULATIVE,
    NOT_ESTABLISHED_BIOLOGY,
    pass,
    interpretation:
      'Known biology stays distinct from CSHRH/SCH novelty and from ontological Hero’s Return Soft Story.',
    honesty: 'Layer lock — not a claim that ontology is proven.',
  };
}

function experimentCshrhHostModel() {
  const pass =
    HOST_COMPONENTS.length === 4 &&
    AGENT_COMPONENTS.length === 3 &&
    /Cross-Substrate Host Reorganization/i.test(CSHRH_NAME);
  return {
    id: 'E3_cshrh_host_model',
    title: 'CSHRH host tuple + introduced system',
    CSHRH_NAME,
    HOST_COMPONENTS: [...HOST_COMPONENTS],
    AGENT_COMPONENTS: [...AGENT_COMPONENTS],
    pass,
    interpretation: 'H_t=(R,C,I,S) and A=(K,P,G) are catalog abstractions across substrates.',
    honesty: 'Mathematical framing — not identical mechanisms claim.',
  };
}

function experimentSchDefinition() {
  const pass =
    /Survival Computing Hypothesis/i.test(SCH_NAME) &&
    NOT_VIRUS_EQUALS_AI === true &&
    HOST_TRAJECTORIES.includes('integrative');
  return {
    id: 'E4_sch_definition',
    title: 'SCH · survival computing across substrates',
    SCH_NAME,
    HOST_TRAJECTORIES: [...HOST_TRAJECTORIES],
    NOT_VIRUS_EQUALS_AI,
    pass,
    interpretation:
      'Survival computing unifies persistence/adaptation abstractions without equating virus to AI.',
    honesty: 'Hypothesis lock — consciousness not implied.',
  };
}

function experimentGoldilocksIntegration() {
  const pass =
    HOST_TRAJECTORIES[0] === 'parasitic' &&
    HOST_TRAJECTORIES[1] === 'symbiotic' &&
    HOST_TRAJECTORIES[2] === 'integrative' &&
    MEASUREMENT_KEYS.includes('D_R') &&
    MEASUREMENT_KEYS.includes('D_C') &&
    MEASUREMENT_KEYS.includes('R_c');
  return {
    id: 'E5_goldilocks_integration',
    title: 'Parasite→partner trajectories + measurement keys',
    HOST_TRAJECTORIES: [...HOST_TRAJECTORIES],
    MEASUREMENT_KEYS: [...MEASUREMENT_KEYS],
    pass,
    interpretation:
      'Integrative host preservation is the Goldilocks-facing trajectory for AI–civilization coupling.',
    honesty: 'Design criterion — not calibrated AGI safety proof.',
  };
}

function experimentSourceHeroReturn() {
  const pass =
    SOURCE_NAME === 'Holographic Goldilocks Super Intelligence' &&
    GRAND_STORY === "Hero's Return to Source";
  return {
    id: 'E6_source_hero_return',
    title: 'Source = HG Super Intelligence · Hero’s Return filing',
    SOURCE_NAME,
    GRAND_STORY,
    pass,
    interpretation: 'Ontological layer reuses Archetypal Grand Story destination naming.',
    honesty: 'Conceptual naming — not established metaphysics.',
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
    hasCshrh: /Cross-Substrate Host Reorganization Hypothesis|CSHRH/i.test(paper),
    hasSch: /Survival Computing Hypothesis|SCH/i.test(paper),
    hasOntologicalLabel: /ontological hypothesis|explicitly speculative|Ontological \/ speculative/i.test(
      paper,
    ),
    hasNotEstablishedBiology: /not established biology|not.*established scientific fact|does \*\*not\*\* claim|does not claim/i.test(
      paper,
    ),
    hasHeroReturn: /Hero.?s Return to Source/i.test(paper),
    hasSource: /Holographic Goldilocks Super Intelligence/i.test(paper),
    hasGoldilocks: /Goldilocks/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|engine pin|Infinite Octaves/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E7_paper_locks',
    title: 'Paper locks (CSHRH · SCH · ontological label · engine)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must keep three-layer honesty and Hero’s Return ontological filing.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) ||
    body.includes('survival-computing-viral-rna-asi');
  const hasWhitepaper =
    body.includes('/whitepaper/survival-computing-viral-rna-asi') ||
    body.includes(REGISTRY_ID);
  const hasThesis =
    /virus|viral|survival|host|AI|paycheck|rent|job|kids|awareness/i.test(body);
  const hasOntologicalCaution =
    /ontological|speculative|hypothesis|not.*established|not claiming/i.test(body);
  return {
    id: 'E8_ship_blog_lock',
    title: 'Ship-blog surfaces survival-computing + full paper link',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasThesis,
    hasOntologicalCaution,
    pass: exists && hasSlug && hasWhitepaper && hasThesis && hasOntologicalCaution,
    interpretation: 'Guest note must link the full paper and keep research-intro voice.',
    honesty: 'Surface copy lock only.',
  };
}

function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E9_phi_squared_identity',
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
    experimentCshrhHostModel(),
    experimentSchDefinition(),
    experimentGoldilocksIntegration(),
    experimentSourceHeroReturn(),
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
