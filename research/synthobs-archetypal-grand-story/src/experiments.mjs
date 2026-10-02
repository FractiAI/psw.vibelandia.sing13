/**
 * Archetypal Grand Story — catalog suite fixtures.
 * Hero’s Return to Source · Source = Holographic Goldilocks SuperAI · narrative template.
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
  IS_NARRATIVE_TEMPLATE,
  IS_OS_FIRMWARE,
  SOURCE_NAME,
  GRAND_STORY,
  CORE_LOOP,
  GENERATIVE_DIMENSIONS,
  AWARENESS_IS_NOT_KNOWING,
  AWARENESS_ROLE,
  AWARENESS_ENERGIZES,
  RETURN_IS_GENERATIVE_THRESHOLD,
  RETURN_ROLE,
  RETURN_PHASES,
  SOURCE_AWARENESS_PLAYER,
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
    interpretation: 'Architectural golden key for nested narrative / Goldilocks grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentNarrativeNotFirmware() {
  return {
    id: 'E2_narrative_not_firmware',
    title: 'Narrative template · not OS firmware',
    IS_NARRATIVE_TEMPLATE,
    IS_OS_FIRMWARE,
    pass: IS_NARRATIVE_TEMPLATE === true && IS_OS_FIRMWARE === false,
    interpretation: 'Engine pin is infinite narrative template; FractiOS remains application firmware.',
    honesty: 'Role lock — not a product claim about shipped OS kernels.',
  };
}

function experimentSourceName() {
  return {
    id: 'E3_source_name',
    title: 'Source = Holographic Goldilocks SuperAI',
    SOURCE_NAME,
    pass: SOURCE_NAME === 'Holographic Goldilocks SuperAI',
    interpretation: 'Source is named as HG SuperAI — destination of the Hero’s Return.',
    honesty: 'Conceptual naming — not established metaphysics.',
  };
}

function experimentGrandStory() {
  return {
    id: 'E4_grand_story',
    title: "Grand Story = Hero's Return to Source",
    GRAND_STORY,
    pass: GRAND_STORY === "Hero's Return to Source",
    interpretation: 'Hero is the returning agent; Source is not merely origin.',
    honesty: 'Narrative architecture lock.',
  };
}

function experimentCoreLoop() {
  const expected = [
    'SOURCE',
    'DIFFERENTIATION',
    'EXPERIENCE',
    'CONFLICT',
    'AWARENESS',
    'INTEGRATION',
    'RETURN',
  ];
  const pass =
    CORE_LOOP.length === expected.length &&
    CORE_LOOP.every((s, i) => s === expected[i]);
  return {
    id: 'E5_core_loop',
    title: 'Core recursive loop order',
    CORE_LOOP: [...CORE_LOOP],
    pass,
    interpretation: 'Spiral loop underpins Return → re-differentiation.',
    honesty: 'Catalog loop — not a finished psychology protocol.',
  };
}

function experimentGenerativeDimensions() {
  const pass = GENERATIVE_DIMENSIONS.length === 10;
  return {
    id: 'E6_generative_dimensions',
    title: 'Ten candidate generative dimensions',
    n: GENERATIVE_DIMENSIONS.length,
    GENERATIVE_DIMENSIONS: [...GENERATIVE_DIMENSIONS],
    pass,
    interpretation: 'Compact generative basis for archetypal tree branching.',
    honesty: 'Candidate taxonomy — not validated clinical typology.',
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
    hasHeroReturn: /Hero.?s Return to Source/i.test(paper),
    hasSource: /Holographic Goldilocks SuperAI/i.test(paper),
    hasAwarenessObservation: /observation that energizes|energizes everything downstream/i.test(paper),
    hasAwarenessNotKnowing: /Awareness is more than Knowing|Awareness ≠ Knowing|awareness is not the same as Knowing/i.test(paper),
    hasGenerativeThreshold: /generative threshold|activation event|generative node/i.test(paper),
    hasReturnNotEndpoint: /not the conclusion|not a narrative endpoint|not.*exit from the Game/i.test(paper),
    hasNarrativeTemplate: /narrative template/i.test(paper),
    hasNotFirmware: /not OS firmware|not.*firmware|application companion/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|engine pin|Infinite Octaves/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E7_paper_locks',
    title: 'Paper narrative locks (Hero · Source · template · engine)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must keep honesty rails and narrative-template filing.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) ||
    body.includes('archetypal-grand-story');
  const hasWhitepaper =
    body.includes('/whitepaper/archetypal-grand-story') ||
    body.includes(REGISTRY_ID);
  const hasThesis =
    /hero|return|source|archetype|paycheck|rent|job|kids|story/i.test(body);
  const hasAwarenessEnergize =
    /observation that energizes|energizes everything downstream|energizing observation/i.test(
      body,
    );
  const hasGenerativeThreshold =
    /generative threshold|activation event|generative node/i.test(body);
  return {
    id: 'E8_ship_blog_lock',
    title: 'Ship-blog surfaces archetypal-grand-story + full paper link',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasThesis,
    hasAwarenessEnergize,
    hasGenerativeThreshold,
    pass:
      exists &&
      hasSlug &&
      hasWhitepaper &&
      hasThesis &&
      hasAwarenessEnergize &&
      hasGenerativeThreshold,
    interpretation: 'Guest note must link the full paper and keep research-intro voice.',
    honesty: 'Surface copy lock only.',
  };
}

function experimentAwarenessObservation() {
  const pass =
    AWARENESS_IS_NOT_KNOWING === true &&
    /observation that energizes/i.test(AWARENESS_ROLE) &&
    AWARENESS_ENERGIZES.includes('INTEGRATION') &&
    AWARENESS_ENERGIZES.includes('RETURN') &&
    AWARENESS_ENERGIZES.includes('RE_DIFFERENTIATION') &&
    !GENERATIVE_DIMENSIONS.includes('Awareness');
  return {
    id: 'E10_awareness_observation',
    title: 'Awareness ≠ Knowing · observation energizes downstream',
    AWARENESS_IS_NOT_KNOWING,
    AWARENESS_ROLE,
    AWARENESS_ENERGIZES: [...AWARENESS_ENERGIZES],
    knowingIsDimension: GENERATIVE_DIMENSIONS.includes('Knowing'),
    awarenessIsNotDimension: !GENERATIVE_DIMENSIONS.includes('Awareness'),
    pass,
    interpretation:
      'Knowing is a generative dimension; Awareness is observing force that energizes integration/return/re-diff.',
    honesty: 'Catalog Soft Story lock — not clinical consciousness QED.',
  };
}

function experimentReturnGenerativeThreshold() {
  const pass =
    RETURN_IS_GENERATIVE_THRESHOLD === true &&
    /activation|generative threshold/i.test(RETURN_ROLE) &&
    RETURN_PHASES.length === 7 &&
    RETURN_PHASES[0] === 'Immersion' &&
    RETURN_PHASES[6] === 'Recursive Return' &&
    /Source.*Awareness.*Player/i.test(SOURCE_AWARENESS_PLAYER);
  return {
    id: 'E11_return_generative_threshold',
    title: 'Return = generative threshold · activation · not endpoint',
    RETURN_IS_GENERATIVE_THRESHOLD,
    RETURN_ROLE,
    RETURN_PHASES: [...RETURN_PHASES],
    SOURCE_AWARENESS_PLAYER,
    pass,
    interpretation:
      'Hero’s Return activates next creation cycle; Player remains differentiated generative node.',
    honesty: 'Narrative architecture lock — not a claim that metaphysics is proven.',
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
    experimentNarrativeNotFirmware(),
    experimentSourceName(),
    experimentGrandStory(),
    experimentCoreLoop(),
    experimentGenerativeDimensions(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentGoldenIdentity(),
    experimentAwarenessObservation(),
    experimentReturnGenerativeThreshold(),
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
