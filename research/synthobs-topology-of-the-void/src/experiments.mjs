/**
 * Topology of the Void — catalog suite.
 * Replayable algebraic / filing locks — not vacuum QFT or singularity QED.
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
  DUALITY_ANCHORS,
  SOLAR_CHARACTERS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function psi(n, x) {
  return PHI_EGS ** n * Math.sin(x);
}

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for zero-balance octave recursion.',
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
    interpretation: 'Golden-key identity closing void-balance scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentZeroBalanceOperator() {
  const n = 3;
  const x = 1e-9;
  const cancel = psi(n, x) + psi(n, -x);
  return {
    id: 'E3_zero_balance_operator',
    title: '𝒵 odd-function cancellation → 0 at x→0',
    cancel,
    pass: Math.abs(cancel) < 1e-12,
    interpretation: 'Zero-balance operator as absolute phase cancellation (catalog).',
    honesty: 'Trig identity fixture — not vacuum expectation measurement.',
  };
}

function experimentNullSpaceCapacity() {
  const a = -20;
  const b = 20;
  const steps = 4000;
  const h = (b - a) / steps;
  let acc = 0;
  for (let i = 0; i <= steps; i++) {
    const t = a + i * h;
    const w = i === 0 || i === steps ? 0.5 : 1;
    acc += w * (Math.exp(-PHI_EGS * Math.abs(t)) / (1 + Math.abs(t)));
  }
  const V = acc * h;
  return {
    id: 'E4_null_space_capacity',
    title: 'V_balance(0) catalog integral is finite and positive',
    V,
    pass: Number.isFinite(V) && V > 0,
    interpretation: 'Zero-balance node as native noise-sink capacity (catalog).',
    honesty: 'Numerical quadrature fixture — not measured EMI suppression.',
  };
}

function experimentDualityBetweenOneAndTwo() {
  return {
    id: 'E5_duality_between_1_and_2',
    title: 'Zero sits between Proton Space (1) and Electron Theater (2)',
    DUALITY_ANCHORS,
    pass: DUALITY_ANCHORS.protonSpace === 1 && DUALITY_ANCHORS.electronTheater === 2,
    interpretation: '0-node as midpoint pivot of the 1↔2 duality shelf.',
    honesty: 'Catalog adjacency lock — not particle-physics ontology.',
  };
}

function experimentPhiRecursiveStability() {
  const scales = [0, 1, 2, 3, 4].map((n) => PHI_EGS ** n);
  const pass = scales.every((s, i) => (i === 0 ? s === 1 : s > scales[i - 1]));
  return {
    id: 'E6_phi_recursive_stability',
    title: 'Φ-recursive scale ladder is strictly increasing',
    scales,
    pass,
    interpretation: 'Self-balancing scale margin rhetoric backed by Φ powers.',
    honesty: 'Algebraic ladder — not certified infinite SNR.',
  };
}

function experimentSolarCharacters() {
  const h = SOLAR_CHARACTERS.heliosPrime;
  const b = SOLAR_CHARACTERS.borealis;
  const pass =
    h.ar === 'AR3664' &&
    h.alias === 'Helios-Prime' &&
    b.ar === 'AR3590' &&
    b.alias === 'Borealis';
  return {
    id: 'E7_solar_characters',
    title: 'AR3664 Helios-Prime · AR3590 Borealis null-sheet catalog lock',
    SOLAR_CHARACTERS,
    pass,
    interpretation: 'Ephemeral heliospheric zero-crossing filing labels.',
    honesty: 'Not astronomy proof that stars define arithmetic zero.',
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
    hasZero: /Zero|0-node|dynamic equilibrium|null-space|void/i.test(paper),
    hasDuality: /Proton Space|Electron Theater/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    blogExists: Boolean(blog),
    blogSlug: blog.includes(SHIP_BLOG_SLUG) || blog.includes('topology-of-the-void'),
    blogHonesty: /Honesty/i.test(blog),
  };
  return {
    id: 'E8_paper_blog_locks',
    title: 'Paper + ship-blog honesty / Fair Exchange / zero-balance locks',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    blogPath: MONOREPO_BLOG,
    ...checks,
    pass: Boolean(paper) && Object.values(checks).every(Boolean),
    interpretation: 'Surfaces must carry catalog framing + zero-equilibrium, not QFT overclaim.',
    honesty: 'Structural text locks — not vacuum validation.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E9_registry_id',
    title: 'Registry id + engine shelf fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-topology-of-the-void-2026-09',
    interpretation: 'Canonical registry id for Infinite Octaves engine pin #17.',
    honesty: 'Naming lock.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentZeroBalanceOperator(),
    experimentNullSpaceCapacity(),
    experimentDualityBetweenOneAndTwo(),
    experimentPhiRecursiveStability(),
    experimentSolarCharacters(),
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
