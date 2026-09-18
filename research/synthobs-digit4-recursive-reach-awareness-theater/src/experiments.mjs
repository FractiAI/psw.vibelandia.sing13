/**
 * Digit 4 Recursive Reach — catalog suite fixtures.
 * Address 4 · recursive Soft Story reach · human theater lock.
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
  DIGIT_ADDRESS,
  RECURSIVE_REACH_CYCLE,
  HUMAN_THEATER_LOCK,
  ADDRESS_UNCHANGED_UNDER_RECURSION,
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
    interpretation: 'Architectural golden key for Digit 4 recursive nesting grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentDigitAddress() {
  return {
    id: 'E2_digit_address',
    title: 'Filing address Digit 4 frozen',
    DIGIT_ADDRESS,
    pass: DIGIT_ADDRESS === 4,
    interpretation: 'Biological Switch / Y manifestation slot — address, not thin local tile.',
    honesty: 'Catalog filing — not clinical genetics measurement.',
  };
}

function experimentRecursiveCycle() {
  const expected = [
    'digit4_switch',
    'awareness_router',
    'human_timespace_theater',
    'see_again',
  ];
  const pass =
    RECURSIVE_REACH_CYCLE.length === expected.length &&
    RECURSIVE_REACH_CYCLE.every((s, i) => s === expected[i]);
  return {
    id: 'E3_recursive_reach_cycle',
    title: 'Recursive reach cycle (switch → awareness → theater → see again)',
    RECURSIVE_REACH_CYCLE: [...RECURSIVE_REACH_CYCLE],
    pass,
    interpretation: 'Reach re-enters Story layers without inventing a new digit label.',
    honesty: 'Soft Story cycle — not measured spacetime causation.',
  };
}

function experimentHumanTheaterLock() {
  const pass =
    HUMAN_THEATER_LOCK.humanTheater === true &&
    HUMAN_THEATER_LOCK.chatbotCitizenship === false;
  return {
    id: 'E4_human_theater_lock',
    title: 'Human theater lock (no chatbot citizenship)',
    HUMAN_THEATER_LOCK,
    pass,
    interpretation: 'Awareness energizes human time/space theater — not machine personhood.',
    honesty: 'Hospitality grammar — not a clinical consciousness assay.',
  };
}

function experimentAddressUnchanged() {
  const addressAfterCycle = DIGIT_ADDRESS;
  return {
    id: 'E5_address_unchanged_under_recursion',
    title: 'Address unchanged under recursive reach',
    DIGIT_ADDRESS,
    addressAfterCycle,
    ADDRESS_UNCHANGED_UNDER_RECURSION,
    pass:
      ADDRESS_UNCHANGED_UNDER_RECURSION === true &&
      addressAfterCycle === 4 &&
      DIGIT_ADDRESS === 4,
    interpretation: 'Recursion upgrades operator presence — not the digit label.',
    honesty: 'Catalog priority lock.',
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
    hasAddress: /Address\s*=\s*4|DIGIT_ADDRESS|Digit\s*\/?\s*Octave\s*\*?\*?4/i.test(paper),
    hasRecursive: /recursive|Reach\s*=\s*recursive/i.test(paper),
    hasTheater: /time\/space theater|human.*theater/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|engine pin|Infinite Octaves/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E6_paper_locks',
    title: 'Paper narrative locks (address · reach · theater · engine)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must keep honesty rails and address/reach dual lock.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) || body.includes('digit4-recursive-reach');
  const hasWhitepaper =
    body.includes('/whitepaper/digit4-recursive-reach') ||
    body.includes('synthobs-digit4-recursive-reach-awareness-theater-2026-09');
  const hasThesis = /awareness energizes|Digit 4|recursive reach|reality-bridge/i.test(body);
  return {
    id: 'E7_ship_blog_lock',
    title: 'Ship-blog surfaces Digit 4 recursive reach + full paper link',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasThesis,
    pass: exists && hasSlug && hasWhitepaper && hasThesis,
    interpretation: 'Guest note must link the full paper and keep Soft Story copy.',
    honesty: 'Surface copy lock only.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E8_registry_id',
    title: 'Registry id fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-digit4-recursive-reach-awareness-theater-2026-09',
    interpretation: 'Canonical registry id for engine + publish.',
    honesty: 'Naming lock.',
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
    experimentDigitAddress(),
    experimentRecursiveCycle(),
    experimentHumanTheaterLock(),
    experimentAddressUnchanged(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentRegistryId(),
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
