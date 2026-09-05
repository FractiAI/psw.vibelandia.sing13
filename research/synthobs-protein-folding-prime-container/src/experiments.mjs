/**
 * Protein Folding · Infinite Octave Prime-Container — catalog suite.
 * Replayable algebraic / filing locks — not wet-lab CASP gold.
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
  DEMO_SEQUENCE,
  SOLAR_CHARACTERS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

function generateOddPrimes(n) {
  const primes = [];
  let candidate = 3;
  while (primes.length < n) {
    if (isPrime(candidate)) primes.push(candidate);
    candidate += 2;
  }
  return primes;
}

function foldingEnergy(primes) {
  let energy = 0;
  for (let i = 0; i < primes.length; i++) {
    const pk = primes[i];
    energy += (1 / pk ** PHI_EGS) * Math.exp(-(i + 1) / PHI_EGS);
  }
  return energy;
}

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for prime-container octave recursion.',
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
    interpretation: 'Golden-key identity closing scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentSoleEvenPrime() {
  const sample = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  const even = sample.filter((p) => p % 2 === 0);
  const allPrime = sample.every(isPrime);
  return {
    id: 'E3_sole_even_prime',
    title: 'Among fixture primes, sole even prime is 2',
    even,
    allPrime,
    pass: allPrime && even.length === 1 && even[0] === 2,
    interpretation: 'Binary dyad parity singularity on fixture set.',
    honesty: 'Finite fixture check — not a new infinitude proof.',
  };
}

function experimentOddIrreducible() {
  const odds = generateOddPrimes(10);
  let ok = odds.every((p) => p > 2 && isPrime(p));
  return {
    id: 'E4_odd_irreducible',
    title: 'Odd fixture primes are irreducible containers',
    n: odds.length,
    first: odds[0],
    pass: ok && odds[0] === 3,
    interpretation: 'Odd primes as full-dimensional containment vaults (catalog).',
    honesty: 'Smoke check — textbook primality, not SI biophysics.',
  };
}

function experimentResiduePrimeMap() {
  const primes = generateOddPrimes(DEMO_SEQUENCE.length);
  const pass =
    primes.length === DEMO_SEQUENCE.length &&
    primes.every((p, i) => p > 2 && isPrime(p)) &&
    new Set(primes).size === primes.length;
  return {
    id: 'E5_residue_prime_map',
    title: 'Demo sequence maps 1:1 onto distinct odd-prime containers',
    length: DEMO_SEQUENCE.length,
    primes,
    pass,
    interpretation: 'Polypeptide index → odd-prime vault assignment lock.',
    honesty: 'Catalog index map — not a PDB atom placement.',
  };
}

function experimentFoldingEnergy() {
  const primes = generateOddPrimes(DEMO_SEQUENCE.length);
  const energy = foldingEnergy(primes);
  const pass = Number.isFinite(energy) && energy > 0 && energy < 1;
  return {
    id: 'E6_folding_energy',
    title: 'Deterministic folding-energy fixture is finite and positive',
    energy,
    pass,
    interpretation: 'Closed-form E_fold sketch without gradient descent.',
    honesty: 'Algebraic energy label — not calorimetry or CASP score.',
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
    title: 'AR3664 Helios-Prime · AR3590 Borealis catalog lock',
    SOLAR_CHARACTERS,
    pass,
    interpretation: 'Ephemeral heliospheric filing labels for Φ-recursive narrative.',
    honesty: 'Not astronomy proof that stars fold proteins.',
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
    hasPhi: /\\Phi|Φ_\{?\\mathrm\{EGS\}\}?|PHI_EGS|1\.618/i.test(paper),
    hasPrime: /prime-container|odd prime/i.test(paper),
    hasAlphaFold: /AlphaFold/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    blogExists: Boolean(blog),
    blogSlug: blog.includes(SHIP_BLOG_SLUG) || blog.includes('protein-folding-prime-container'),
    blogHonesty: /Honesty/i.test(blog),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E8_paper_blog_locks',
    title: 'Paper + ship-blog honesty / Fair Exchange / AlphaFold contrast locks',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    blogPath: MONOREPO_BLOG,
    ...checks,
    pass,
    interpretation: 'Surfaces must carry catalog framing + contrast, not wet-lab overclaim.',
    honesty: 'Structural text locks — not experimental validation.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E9_registry_id',
    title: 'Registry id + engine shelf fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-protein-folding-prime-container-2026-09',
    interpretation: 'Canonical registry id for Infinite Octaves engine pin #14.',
    honesty: 'Naming lock.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentSoleEvenPrime(),
    experimentOddIrreducible(),
    experimentResiduePrimeMap(),
    experimentFoldingEnergy(),
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
