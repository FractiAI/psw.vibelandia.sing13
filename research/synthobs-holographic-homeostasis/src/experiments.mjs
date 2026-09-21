/**
 * Holographic Homeostasis — catalog suite fixtures.
 * PARTS↔WHOLE↔PARTS · dynamic stability · Goldilocks-oriented.
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
  CENTRAL_LOOP,
  DYNAMIC_STABILITY,
  STATIC_STILLNESS_REQUIRED,
  CHARACTERISTICS,
  NESTED_SCALES,
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
    interpretation: 'Architectural golden key for nesting / viability grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentCentralLoop() {
  return {
    id: 'E2_central_loop',
    title: 'Central loop PARTS↔WHOLE↔PARTS',
    CENTRAL_LOOP,
    pass: CENTRAL_LOOP === 'PARTS↔WHOLE↔PARTS',
    interpretation: 'Reciprocal whole–part regulation lock.',
    honesty: 'Catalog architecture — not AdS/CFT claim.',
  };
}

function experimentDynamicStability() {
  const pass = DYNAMIC_STABILITY === true && STATIC_STILLNESS_REQUIRED === false;
  return {
    id: 'E3_dynamic_stability',
    title: 'Dynamic stability (stillness not required)',
    DYNAMIC_STABILITY,
    STATIC_STILLNESS_REQUIRED,
    pass,
    interpretation: 'Stability can be produced by organized continuous activity.',
    honesty: 'Spinning-top analogy — not proof of the full hypothesis.',
  };
}

function experimentCharacteristics() {
  const expected = [
    'dynamic',
    'regulatory',
    'distributed',
    'reciprocal',
    'multiscale',
    'adaptive',
    'goldilocks_oriented',
  ];
  const pass =
    CHARACTERISTICS.length === expected.length &&
    CHARACTERISTICS.every((c, i) => c === expected[i]);
  return {
    id: 'E4_characteristics',
    title: 'Seven defining characteristics',
    CHARACTERISTICS: [...CHARACTERISTICS],
    pass,
    interpretation: 'Hypothesis traits frozen for suite replay.',
    honesty: 'Catalog checklist — not clinical protocol.',
  };
}

function experimentNestedScales() {
  const expected = [
    'molecule',
    'cell',
    'tissue',
    'organ',
    'organism',
    'population',
    'ecosystem',
  ];
  const pass =
    NESTED_SCALES.length === expected.length &&
    NESTED_SCALES.every((s, i) => s === expected[i]);
  return {
    id: 'E5_nested_scales',
    title: 'Nested scale ladder (7 levels)',
    NESTED_SCALES: [...NESTED_SCALES],
    pass,
    interpretation: 'Comparable architecture may recur — not identical mechanisms.',
    honesty: 'Hypothesis ladder — not claim every scale is identical.',
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
    hasLoop: /PARTS.*WHOLE|WHOLE.*PARTS/i.test(paper),
    hasDynamic: /[Dd]ynamic stability/i.test(paper),
    hasGoldilocks: /Goldilocks/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|engine pin|Infinite Octaves/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E6_paper_locks',
    title: 'Paper narrative locks (loop · dynamic · Goldilocks · engine)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must keep honesty rails and reciprocal loop.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) || body.includes('holographic-homeostasis');
  const hasWhitepaper =
    body.includes('/whitepaper/holographic-homeostasis') ||
    body.includes('synthobs-holographic-homeostasis-2026-09');
  const hasThesis = /homeostasis|spinning top|parts.*whole|viable|paycheck|job/i.test(body);
  return {
    id: 'E7_ship_blog_lock',
    title: 'Ship-blog surfaces holographic-homeostasis + full paper link',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasThesis,
    pass: exists && hasSlug && hasWhitepaper && hasThesis,
    interpretation: 'Guest note must link the full paper and keep kitchen-table copy.',
    honesty: 'Surface copy lock only.',
  };
}

function experimentPredictionSet() {
  const ids = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  return {
    id: 'E8_prediction_set',
    title: 'Seven testable prediction slots A–G',
    predictionIds: ids,
    pass: ids.length === 7,
    interpretation: 'Hypothesis must stay distinguishable via reciprocal cross-scale checks.',
    honesty: 'Prediction slots — not completed empirics.',
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
    experimentCentralLoop(),
    experimentDynamicStability(),
    experimentCharacteristics(),
    experimentNestedScales(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentPredictionSet(),
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
