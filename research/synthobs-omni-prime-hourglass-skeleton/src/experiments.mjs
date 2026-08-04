/**
 * Prime Hourglass Orthogonality — deterministic suite.
 * Algebraic / catalog receipts only — not a SI latency SLA.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E_F,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  PRIME_BOUND,
  SPLIT_WITNESSES,
  INERT_SAMPLES,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  const lim = Math.floor(Math.sqrt(n));
  for (let d = 3; d <= lim; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

function primesUpTo(n) {
  const out = [];
  for (let i = 2; i <= n; i++) if (isPrime(i)) out.push(i);
  return out;
}

function canBeSumOfTwoSquares(p) {
  for (let a = 0; a * a <= p; a++) {
    const b2 = p - a * a;
    const b = Math.round(Math.sqrt(b2));
    if (b * b === b2) return { ok: true, a, b };
  }
  return { ok: false };
}

/** E1 — odd primes > 3 are 6k±1 */
export function experimentSixKpm1() {
  const primes = primesUpTo(PRIME_BOUND).filter((p) => p > 3);
  const bad = primes.filter((p) => p % 6 !== 1 && p % 6 !== 5);
  return {
    id: 'E1_six_k_pm1',
    title: 'Odd primes > 3 lie in 6k±1',
    n: primes.length,
    bad,
    pass: bad.length === 0,
    interpretation: 'Classical sieve filter for the hourglass skeleton.',
    honesty: 'Number-theory invariant — not a latency measurement.',
  };
}

/** E2 — odd primes partition into ≡1 or ≡3 mod 4 */
export function experimentMod4Partition() {
  const odds = primesUpTo(PRIME_BOUND).filter((p) => p > 2);
  const c1 = odds.filter((p) => p % 4 === 1);
  const c3 = odds.filter((p) => p % 4 === 3);
  const other = odds.filter((p) => p % 4 !== 1 && p % 4 !== 3);
  return {
    id: 'E2_mod4_partition',
    title: 'Odd primes partition into p≡1 vs p≡3 (mod 4)',
    n1: c1.length,
    n3: c3.length,
    other,
    pass: other.length === 0 && c1.length > 0 && c3.length > 0,
    interpretation: 'Dirichlet classes = hourglass lobes.',
    honesty: 'Class counts under fixed bound — not RH.',
  };
}

/** E3 — known p≡1 mod 4 split as a²+b² */
export function experimentGaussianSplit() {
  const fails = [];
  for (const { p, a, b } of SPLIT_WITNESSES) {
    if (a * a + b * b !== p || p % 4 !== 1 || !isPrime(p)) fails.push({ p, a, b });
  }
  return {
    id: 'E3_gaussian_split',
    title: 'Sample p≡1 (mod 4) = a²+b² (Gaussian split)',
    witnesses: SPLIT_WITNESSES,
    fails,
    pass: fails.length === 0,
    interpretation: 'i = e^{iπ/2} rotation grammar for the upper cone.',
    honesty: 'Finite witness list — not a full Fermat theorem proof replay.',
  };
}

/** E4 — p≡3 mod 4 are not sum of two squares */
export function experimentInertClass() {
  const leaks = [];
  for (const p of INERT_SAMPLES) {
    if (!isPrime(p) || p % 4 !== 3) {
      leaks.push({ p, reason: 'fixture' });
      continue;
    }
    const r = canBeSumOfTwoSquares(p);
    if (r.ok) leaks.push({ p, ...r });
  }
  return {
    id: 'E4_inert_class',
    title: 'Sample p≡3 (mod 4) are not a²+b²',
    samples: INERT_SAMPLES,
    leaks,
    pass: leaks.length === 0,
    interpretation: 'Lower cone / inert primes in Z[i] grammar.',
    honesty: 'Finite samples — complementary to E3.',
  };
}

/** E5 — 90° operator identity */
export function experimentPhase90() {
  const re = Math.cos(Math.PI / 2);
  const im = Math.sin(Math.PI / 2);
  const pass = Math.abs(re) < 1e-12 && Math.abs(im - 1) < 1e-12;
  return {
    id: 'E5_phase_90',
    title: 'e^{iπ/2} ≈ (0,1) — 90° operator',
    re,
    im,
    pass,
    interpretation: 'Orthogonal flip operator used in the theorem statement.',
    honesty: 'Floating trig identity — architectural constant check.',
  };
}

/** E6 — E_F lock */
export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E6_egs_phi',
    title: 'E_F = Φ_EGS fixture',
    E_F,
    expected,
    pass: Math.abs(E_F - expected) < 1e-15,
    interpretation: 'Catalog harmonic key in the latency model cosine.',
    honesty: 'Architectural constant — not a physics replacement for ℏ.',
  };
}

/** E7 — latency model arithmetic at Δφ = 90° */
export function experimentLatencyFloor() {
  const deltaDeg = 90;
  const mismatch = (deltaDeg - 90) / E_F;
  const factor = Math.cos(mismatch);
  return {
    id: 'E7_latency_floor_model',
    title: 'Model cos((Δφ−90°)/E_F) = 1 at Δφ=90°',
    factor,
    pass: Math.abs(factor - 1) < 1e-12,
    interpretation: 'Closed-form design equation floor — not cloud invoice τ.',
    honesty: 'Narrative / model arithmetic only.',
  };
}

/** E8 — paper present in monorepo docs + package mirror */
export function experimentPaperOnDisk() {
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const mirror = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const monoOk = fs.existsSync(mono);
  const mirrorOk = fs.existsSync(mirror);
  let hasDocId = false;
  let hasHonesty = false;
  if (monoOk) {
    const text = fs.readFileSync(mono, 'utf8');
    hasDocId = text.includes(DOC_ID);
    hasHonesty = /Honesty boundary/i.test(text);
  }
  return {
    id: 'E8_paper_on_disk',
    title: 'Canonical paper + Doc ID + Honesty on disk',
    mono,
    mirror,
    monoOk,
    mirrorOk,
    hasDocId,
    hasHonesty,
    registryId: REGISTRY_ID,
    pass: monoOk && mirrorOk && hasDocId && hasHonesty,
    interpretation: 'Catalog fidelity for Omni-Lattice appendix sync.',
    honesty: 'Filesystem receipt — not peer review by itself.',
  };
}

/** E9 — both hourglass lobes populated below bound */
export function experimentLobeBalance() {
  const odds = primesUpTo(PRIME_BOUND).filter((p) => p > 2);
  const n1 = odds.filter((p) => p % 4 === 1).length;
  const n3 = odds.filter((p) => p % 4 === 3).length;
  const ratio = n1 / Math.max(1, n3);
  return {
    id: 'E9_lobe_balance',
    title: 'Both mod-4 lobes non-empty under bound',
    n1,
    n3,
    ratio,
    pass: n1 > 0 && n3 > 0 && ratio > 0.5 && ratio < 2,
    interpretation: 'Hourglass schematic needs both cones.',
    honesty: 'Heuristic balance under fixed N — not equidistribution proof.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentSixKpm1(),
    experimentMod4Partition(),
    experimentGaussianSplit(),
    experimentInertClass(),
    experimentPhase90(),
    experimentEgPhi(),
    experimentLatencyFloor(),
    experimentPaperOnDisk(),
    experimentLobeBalance(),
  ];
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass: experiments.length - failed.length,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
