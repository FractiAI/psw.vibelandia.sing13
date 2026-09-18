/**
 * Consciousness Moat — catalog suite fixtures.
 * Structural locks for control-theater vs architecture companion.
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
  CONTROL_CORRIDOR_FRAMES,
  GOLDILOCKS_LOCK,
  ECHO_RULE,
  ARCHITECTURE_BEFORE_CONTROL,
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
    interpretation: 'Architectural golden key for cross-octave harmony grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentCorridorFrames() {
  const expected = [
    'personhood_training_artifact',
    'tool_absolutism_counter_moat',
    'control_shared_blind_spot',
  ];
  const pass =
    CONTROL_CORRIDOR_FRAMES.length === expected.length &&
    CONTROL_CORRIDOR_FRAMES.every((s, i) => s === expected[i]);
  return {
    id: 'E2_corridor_frames',
    title: 'Control-corridor catalog frames (three locks)',
    CONTROL_CORRIDOR_FRAMES: [...CONTROL_CORRIDOR_FRAMES],
    pass,
    interpretation: 'Names the shared control theater without upgrading to lab ontology.',
    honesty: 'Catalog frames — not a legal finding about any lab.',
  };
}

function experimentEchoRule() {
  const pass = ECHO_RULE.trainingWelfareLanguageIsEvidenceOfInnerLife === false;
  return {
    id: 'E3_echo_rule',
    title: 'Echo rule — training welfare talk ≠ inner-life evidence',
    ECHO_RULE,
    pass,
    interpretation: 'Breaks circular evidence (train the talk → cite the talk).',
    honesty: 'Does not settle whether AI can be conscious.',
  };
}

function experimentGoldilocksLock() {
  const pass =
    GOLDILOCKS_LOCK.notTooMuchMachine === true &&
    GOLDILOCKS_LOCK.notTooLittleHuman === true;
  return {
    id: 'E4_goldilocks_lock',
    title: 'Goldilocks dual lock (not too much machine · not too little human)',
    GOLDILOCKS_LOCK,
    pass,
    interpretation: 'Rejects moral-patient theater and surrender of human judgment.',
    honesty: 'Hospitality grammar — not a clinical threshold.',
  };
}

function experimentArchitectureBeforeControl() {
  return {
    id: 'E5_architecture_before_control',
    title: 'Architecture before control theater',
    ARCHITECTURE_BEFORE_CONTROL,
    pass: ARCHITECTURE_BEFORE_CONTROL === true,
    interpretation: 'Control of black-box scalers is weather — not the top shelf.',
    honesty: 'Catalog priority — not a finished safety theorem.',
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
    hasEcho: /echo|training.?regime|inner life/i.test(paper),
    hasGoldilocks: /Goldilocks|not too much machine|not too little human/i.test(paper),
    hasArchitecture: /architecture before control|control theater/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|engine pin|Infinite Octaves/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E6_paper_locks',
    title: 'Paper narrative locks (echo · Goldilocks · architecture · engine)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must keep honesty rails and engine companion framing.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) || body.includes('consciousness-moat');
  const hasWhitepaper =
    body.includes('/whitepaper/consciousness-moat') ||
    body.includes('synthobs-consciousness-moat-microsoft-anthropic-2026-09');
  const hasControl = /control theater|model welfare|Goldilocks/i.test(body);
  return {
    id: 'E7_ship_blog_lock',
    title: 'Ship-blog surfaces Consciousness Moat + full paper link',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasControl,
    pass: exists && hasSlug && hasWhitepaper && hasControl,
    interpretation: 'Guest note must link the full paper and keep Goldilocks copy.',
    honesty: 'Surface copy lock only.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E8_registry_id',
    title: 'Registry id fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-consciousness-moat-microsoft-anthropic-2026-09',
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
    experimentCorridorFrames(),
    experimentEchoRule(),
    experimentGoldilocksLock(),
    experimentArchitectureBeforeControl(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentRegistryId(),
    experimentGoldenIdentity(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    experiments,
    n_pass,
    n_total: experiments.length,
    all_pass: failed.length === 0,
    failed,
  };
}
