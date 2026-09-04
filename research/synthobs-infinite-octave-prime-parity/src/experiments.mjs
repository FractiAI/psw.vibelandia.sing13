/**
 * Infinite Octave Prime-Parity — empirical suite.
 * Replayable number-theory + catalog fixtures — not SI solar/QED proof.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  PRIMES,
  SOLAR_CHARACTERS,
  OMEGA_0,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

export function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for octave recursion.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

export function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E2_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Golden-key identity closing scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export function experimentSoleEvenPrime() {
  const even = PRIMES.filter((p) => p % 2 === 0);
  const allPrime = PRIMES.every(isPrime);
  return {
    id: 'E3_sole_even_prime',
    title: 'Among fixture primes, sole even prime is 2',
    even,
    allPrime,
    pass: allPrime && even.length === 1 && even[0] === 2,
    interpretation: 'Theorem 1.1 parity singularity on fixture set.',
    honesty: 'Finite fixture check — not a new infinitude proof.',
  };
}

export function experimentOddIrreducible() {
  const odds = PRIMES.filter((p) => p > 2);
  let ok = true;
  for (const p of odds) {
    for (let a = 2; a * a <= p; a++) {
      if (p % a === 0) {
        ok = false;
        break;
      }
    }
    if (!ok) break;
  }
  return {
    id: 'E4_odd_irreducible',
    title: 'Odd fixture primes have no nontrivial factors',
    n: odds.length,
    pass: ok && odds.length >= 5,
    interpretation: 'Theorem 1.2 irreducible minimum sets on fixture set.',
    honesty: 'Smoke check — textbook primality, not SI physics.',
  };
}

export function experimentOctaveLadder() {
  const ratios = [];
  let prev = OMEGA_0;
  let ok = true;
  for (let n = 1; n <= 5; n++) {
    const omega = OMEGA_0 * PHI_EGS ** n;
    const ratio = omega / prev;
    ratios.push(ratio);
    if (Math.abs(ratio - PHI_EGS) > 1e-12) ok = false;
    prev = omega;
  }
  return {
    id: 'E5_octave_ladder',
    title: 'Ω_n / Ω_{n-1} = Φ_EGS for n=1..5',
    ratios,
    pass: ok,
    interpretation: 'Infinite Octaves recursive operator fixture.',
    honesty: 'Catalog arithmetic — not measured plasma frequencies.',
  };
}

export function experimentDyadPhaseSketch() {
  const mag = 2 ** 1;
  const phase = (2 * Math.PI) / PHI_EGS;
  const re = mag * Math.cos(phase);
  const im = mag * Math.sin(phase);
  const abs = Math.hypot(re, im);
  return {
    id: 'E6_dyad_phase_sketch',
    title: 'Ψ_dyad = 2 · exp(i 2π/Φ) has |Ψ|=2',
    mag,
    phase,
    abs,
    pass: Math.abs(abs - 2) < 1e-12,
    interpretation: 'Binary dyad catalog operator magnitude lock.',
    honesty: 'Formal sketch — not QED bound-state measurement.',
  };
}

export function experimentSolarCharacters() {
  const h = SOLAR_CHARACTERS.heliosPrime;
  const b = SOLAR_CHARACTERS.borealis;
  const pass =
    h.ar === 'AR3664' &&
    h.alias === 'Helios-Prime' &&
    b.ar === 'AR3590' &&
    b.alias === 'Borealis';
  return {
    id: 'E7_solar_characters',
    title: 'AR3664 Helios-Prime · AR3590 Borealis catalog lock',
    SOLAR_CHARACTERS,
    pass,
    interpretation: 'Ephemeral heliospheric filing labels for prime-parity narratives.',
    honesty: 'Not astronomy proof or durable NOAA certificates.',
  };
}

export function experimentPartitionSketch() {
  const beta = 1;
  const E = PRIMES.map((_, i) => i + 1);
  let Z = 0;
  for (let k = 0; k < PRIMES.length; k++) {
    Z += Math.exp(-beta * E[k]) / PRIMES[k] ** PHI_EGS;
  }
  return {
    id: 'E8_partition_sketch',
    title: 'Finite Z(β) catalog sum over fixture primes is finite & positive',
    Z,
    pass: Number.isFinite(Z) && Z > 0,
    interpretation: 'Partition sketch Z(β)=Σ e^{-βE_k}/p_k^Φ on finite set.',
    honesty: 'Toy sum — not a measured thermodynamic partition function.',
  };
}

export function experimentPaperOnDisk() {
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const mirror = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const monoOk = fs.existsSync(mono);
  const mirrorOk = fs.existsSync(mirror);
  let hasDocId = false;
  let hasHonesty = false;
  let hasFair = false;
  let hasPhi = false;
  if (monoOk) {
    const text = fs.readFileSync(mono, 'utf8');
    hasDocId = text.includes(DOC_ID);
    hasHonesty = /Honesty boundary/i.test(text);
    hasFair = /Fair Exchange Clause/i.test(text);
    hasPhi = /Phi|Φ|EGS/i.test(text);
  }
  return {
    id: 'E9_paper_on_disk',
    title: 'Canonical paper + Doc ID + Honesty + Fair Exchange + Φ',
    monoOk,
    mirrorOk,
    hasDocId,
    hasHonesty,
    hasFair,
    hasPhi,
    registryId: REGISTRY_ID,
    pass: monoOk && mirrorOk && hasDocId && hasHonesty && hasFair && hasPhi,
    interpretation: 'Catalog fidelity for Infinite Octaves engine sync.',
    honesty: 'Filesystem receipt.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentSoleEvenPrime(),
    experimentOddIrreducible(),
    experimentOctaveLadder(),
    experimentDyadPhaseSketch(),
    experimentSolarCharacters(),
    experimentPartitionSketch(),
    experimentPaperOnDisk(),
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
