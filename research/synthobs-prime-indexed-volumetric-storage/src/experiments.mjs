/**
 * Prime-Indexed Volumetric Storage — catalog suite.
 * Replayable algebraic / filing locks — not JEDEC silicon benches.
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
  DEMO_CHUNKS,
  SOLAR_CHARACTERS,
  ECC_OVERHEAD_BAND,
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

function generatePrimes(n) {
  const primes = [2];
  let candidate = 3;
  while (primes.length < n) {
    if (isPrime(candidate)) primes.push(candidate);
    candidate += 2;
  }
  return primes;
}

function encodeVaults(chunks) {
  const primes = generatePrimes(chunks.length);
  return chunks.map((chunk, i) => {
    const pk = primes[i];
    const volumetricRadius = PHI_EGS ** i / (pk * Math.log(pk));
    const phaseSignature = (2 * Math.PI * pk) / PHI_EGS;
    return {
      vaultId: pk,
      isBinaryBase: pk === 2,
      payload: chunk,
      volumetricRadius,
      phaseSignature,
    };
  });
}

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for prime-vault octave recursion.',
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
    interpretation: 'Golden-key identity closing storage scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentSoleEvenPrime() {
  const sample = generatePrimes(10);
  const even = sample.filter((p) => p % 2 === 0);
  return {
    id: 'E3_sole_even_prime',
    title: 'Among fixture primes, sole even prime is 2 (binary base channel)',
    even,
    pass: sample.every(isPrime) && even.length === 1 && even[0] === 2,
    interpretation: 'Binary base channel parity singularity on fixture set.',
    honesty: 'Finite fixture check — not a new infinitude proof.',
  };
}

function experimentOddIrreducible() {
  const odds = generatePrimes(12).filter((p) => p > 2);
  const ok = odds.every((p) => p > 2 && isPrime(p));
  return {
    id: 'E4_odd_irreducible_vaults',
    title: 'Odd fixture primes are irreducible volumetric vaults',
    n: odds.length,
    first: odds[0],
    pass: ok && odds[0] === 3,
    interpretation: 'Odd primes as full-dimensional containment vaults (catalog).',
    honesty: 'Smoke check — textbook primality, not JEDEC media physics.',
  };
}

function experimentChunkVaultMap() {
  const primes = generatePrimes(DEMO_CHUNKS.length);
  const pass =
    primes.length === DEMO_CHUNKS.length &&
    primes[0] === 2 &&
    primes.slice(1).every((p) => p > 2 && isPrime(p)) &&
    new Set(primes).size === primes.length;
  return {
    id: 'E5_chunk_vault_map',
    title: 'Demo chunks map 1:1 onto distinct prime vaults (incl. base 2)',
    length: DEMO_CHUNKS.length,
    primes,
    pass,
    interpretation: 'Payload index → prime vault assignment lock.',
    honesty: 'Catalog index map — not a flash translation layer.',
  };
}

function experimentEncodeRadii() {
  const encoded = encodeVaults([...DEMO_CHUNKS]);
  const radii = encoded.map((e) => e.volumetricRadius);
  const phases = encoded.map((e) => e.phaseSignature);
  const pass =
    encoded[0].isBinaryBase === true &&
    radii.every((r) => Number.isFinite(r) && r > 0) &&
    phases.every((p) => Number.isFinite(p) && p > 0);
  return {
    id: 'E6_encode_radii',
    title: 'Deterministic encode radii / phases are finite and positive',
    n: encoded.length,
    firstVault: encoded[0].vaultId,
    pass,
    interpretation: 'Closed-form Φ-recursive vault encode without LBA tables.',
    honesty: 'Algebraic encode fixture — not measured NAND latency.',
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
    honesty: 'Not astronomy proof that stars write memory pages.',
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
    hasPrime: /prime-indexed|volumetric|odd prime/i.test(paper),
    hasRsLdpc: /Reed-Solomon|LDPC|LBA/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEccBand:
      paper.includes('15%') ||
      paper.includes('30%') ||
      (ECC_OVERHEAD_BAND.lo === 0.15 && ECC_OVERHEAD_BAND.hi === 0.3),
    blogExists: Boolean(blog),
    blogSlug:
      blog.includes(SHIP_BLOG_SLUG) || blog.includes('prime-indexed-volumetric-storage'),
    blogHonesty: /Honesty/i.test(blog),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E8_paper_blog_locks',
    title: 'Paper + ship-blog honesty / Fair Exchange / RS-LDPC contrast locks',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    blogPath: MONOREPO_BLOG,
    ...checks,
    pass,
    interpretation: 'Surfaces must carry catalog framing + storage contrast, not silicon overclaim.',
    honesty: 'Structural text locks — not hardware validation.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E9_registry_id',
    title: 'Registry id + engine shelf fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-prime-indexed-volumetric-storage-2026-09',
    interpretation: 'Canonical registry id for Infinite Octaves engine pin #15.',
    honesty: 'Naming lock.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentSoleEvenPrime(),
    experimentOddIrreducible(),
    experimentChunkVaultMap(),
    experimentEncodeRadii(),
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
