/**
 * Holographic Rhyme — catalog suite.
 * Replayable algebraic / filing locks — not Mandelbrot retirement or wet-lab QED.
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
  FOUR_PILLARS,
  SOLAR_CHARACTERS,
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
    interpretation: 'Architectural golden key for holographic-rhyme recursion.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E2_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Golden-key identity closing rhyme scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentFourPillars() {
  const needed = ['repeating', 'self_similar', 'self_correcting', 'recursive'];
  const pass =
    FOUR_PILLARS.length === 4 && needed.every((p) => FOUR_PILLARS.includes(p));
  return {
    id: 'E3_four_pillars',
    title: 'Four pillars present (repeating · self-similar · self-correcting · recursive)',
    FOUR_PILLARS,
    pass,
    interpretation: 'Catalog filing of recast fractal motion grammar.',
    honesty: 'Label lock — not a new fractal-dimension theorem.',
  };
}

function experimentRepeatingEcho() {
  const pulse = [0, 1, 2, 3].map((n) => PHI_EGS ** n);
  const pass = pulse.every((v, i) => (i === 0 ? v === 1 : Math.abs(v / pulse[i - 1] - PHI_EGS) < 1e-12));
  return {
    id: 'E4_repeating_echo',
    title: 'Repeating echo ladder scales by Φ each octave',
    pulse,
    pass,
    interpretation: 'Echo pillar as Φ-recursive pulse across octave boundaries.',
    honesty: 'Algebraic ladder — not measured solar AR spectra.',
  };
}

function experimentSelfSimilarMirror() {
  // local/global ratio lock: Φ^{-1} ≈ Φ - 1
  const local = 1 / PHI_EGS;
  const global = PHI_EGS - 1;
  return {
    id: 'E5_self_similar_mirror',
    title: 'Self-similar mirror: 1/Φ = Φ − 1',
    local,
    global,
    pass: Math.abs(local - global) < 1e-12,
    interpretation: 'Mirror pillar: local part carries whole via Φ identity.',
    honesty: 'Golden-ratio identity — not organismal holography QED.',
  };
}

function experimentRecursiveSpiral() {
  const spiral = [];
  let x = 1;
  for (let i = 0; i < 8; i++) {
    spiral.push(x);
    x *= PHI_EGS;
  }
  const pass = spiral.every((v, i) => i === 0 || v > spiral[i - 1]);
  return {
    id: 'E6_recursive_spiral',
    title: 'Recursive spiral is strictly ascending (not a closed dead loop)',
    n: spiral.length,
    pass,
    interpretation: 'Spiral pillar: octave ascension without losing root coherence.',
    honesty: 'Finite fixture ascent — not infinite physical tiers.',
  };
}

function experimentSelfCorrectingZeroNode() {
  const drift = 0.15;
  const corrected = drift / PHI_EGS ** 2; // damp toward zero
  return {
    id: 'E7_self_correcting_zero_node',
    title: 'Self-correcting zero-node dampens phase drift toward zero',
    drift,
    corrected,
    pass: corrected < drift && corrected > 0,
    interpretation: 'Balance pillar: catalog dampening toward harmonic zero.',
    honesty: 'Toy dampener — not measured ECC-free silicon.',
  };
}

function experimentPaperAndBlogLocks() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper =
    (fs.existsSync(paperPath) && fs.readFileSync(paperPath, 'utf8')) ||
    (fs.existsSync(localPaper) && fs.readFileSync(localPaper, 'utf8')) ||
    '';
  const blog = fs.existsSync(MONOREPO_BLOG) ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const checks = {
    hasHonesty: /Honesty boundary/i.test(paper),
    hasDocId: paper.includes(DOC_ID) || paper.includes(REGISTRY_ID),
    hasFair: /Fair Exchange/i.test(paper),
    hasPhi: /Φ|PHI_EGS|1\.618|EGS Fractal/i.test(paper),
    hasPillars: /Repeating|Self-Similar|Self-Correcting|Recursive/i.test(paper),
    hasRhyme: /holographic rhyme|how a system moves/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    blogExists: Boolean(blog),
    blogSlug: blog.includes(SHIP_BLOG_SLUG) || blog.includes('holographic-rhyme'),
    blogHonesty: /Honesty/i.test(blog),
  };
  return {
    id: 'E8_paper_blog_locks',
    title: 'Paper + ship-blog honesty / Fair Exchange / four-pillar locks',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    blogPath: MONOREPO_BLOG,
    ...checks,
    pass: Boolean(paper) && Object.values(checks).every(Boolean),
    interpretation: 'Surfaces must carry catalog framing + four pillars, not fractal overclaim.',
    honesty: 'Structural text locks — not geometry validation.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E9_registry_id',
    title: 'Registry id + engine shelf fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-holographic-rhyme-fractal-2026-09',
    interpretation: 'Canonical registry id for Infinite Octaves engine pin #18.',
    honesty: 'Naming lock.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentFourPillars(),
    experimentRepeatingEcho(),
    experimentSelfSimilarMirror(),
    experimentRecursiveSpiral(),
    experimentSelfCorrectingZeroNode(),
    experimentPaperAndBlogLocks(),
    experimentRegistryId(),
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
