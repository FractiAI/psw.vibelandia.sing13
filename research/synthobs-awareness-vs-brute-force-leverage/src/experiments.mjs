/**
 * Awareness vs Brute-Force Leverage — catalog suite.
 * Replayable algebraic / framing locks — not AlphaFold bake-offs or audited CapEx.
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
  INSULIN_NODES,
  META_PROTEIN,
  TRAINING_CAPEX_BAND,
  ECC_OVERHEAD_BAND,
  AWARE_TRAINING_COST,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

export function generateOddPrimes(n) {
  const primes = [];
  let candidate = 3;
  while (primes.length < n) {
    let isPrime = true;
    for (const p of primes) {
      if (p * p > candidate) break;
      if (candidate % p === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
    candidate += 2;
  }
  return primes;
}

export function solveDeterministically(complexityNodes, octaveTier = 1) {
  const primes = generateOddPrimes(complexityNodes);
  let totalEnergy = 0;
  for (let i = 0; i < primes.length; i++) {
    const pk = primes[i];
    totalEnergy +=
      (PHI_EGS ** octaveTier) / pk ** PHI_EGS * Math.exp(-(i + 1) / PHI_EGS);
  }
  return {
    nodes: complexityNodes,
    octave: octaveTier,
    energy: totalEnergy,
    primes: primes.length,
  };
}

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for aware leverage grammar.',
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
    interpretation: 'Golden-key identity closing aware scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentOddPrimeVaults() {
  const primes = generateOddPrimes(12);
  const pass =
    primes.length === 12 && primes[0] === 3 && primes.every((p) => p % 2 === 1);
  return {
    id: 'E3_odd_prime_vaults',
    title: 'Odd-prime vault generator (irreducible containers)',
    first: primes[0],
    n: primes.length,
    pass,
    interpretation: 'Odd primes as irreducible awareness containers (catalog).',
    honesty: 'Textbook primality smoke — not wet-lab topology.',
  };
}

function experimentInsulinFixture() {
  const t0 = performance.now();
  const result = solveDeterministically(INSULIN_NODES, 1);
  const ms = performance.now() - t0;
  const pass =
    result.nodes === 51 &&
    result.primes === 51 &&
    Number.isFinite(result.energy) &&
    result.energy > 0 &&
    ms < 500;
  return {
    id: 'E4_insulin_fixture',
    title: 'Human Insulin fixture (51 nodes) solves deterministically',
    result,
    latencyMs: ms,
    pass,
    interpretation: 'Molecular-tier aware solve without training loop.',
    honesty:
      'Catalog node count fixture — not CASP gold or clinical insulin structure.',
  };
}

function experimentMetaProteinFixture() {
  const t0 = performance.now();
  const result = solveDeterministically(META_PROTEIN.nodes, META_PROTEIN.octave);
  const ms = performance.now() - t0;
  const pass =
    result.nodes === META_PROTEIN.nodes &&
    result.octave === 15 &&
    Number.isFinite(result.energy) &&
    result.energy > 0 &&
    ms < 5_000;
  return {
    id: 'E5_meta_protein_fixture',
    title: 'Macro meta-protein fixture (10k nodes · octave 15) finite solve',
    result,
    latencyMs: ms,
    pass,
    interpretation:
      'Macro organism meta-protein framing resolves algebraically on fixture.',
    honesty:
      'Catalog scale demo — not a claim organisms are single proteins or AlphaFold-impossible.',
  };
}

function experimentTrainingCapexContrast() {
  const pass =
    AWARE_TRAINING_COST === 0 &&
    TRAINING_CAPEX_BAND.lo === 150_000 &&
    TRAINING_CAPEX_BAND.hi === 200_000;
  return {
    id: 'E6_training_capex_contrast',
    title: 'Aware $0 training vs $150k–$200k+ brute-force CapEx band (framing)',
    AWARE_TRAINING_COST,
    TRAINING_CAPEX_BAND,
    pass,
    interpretation:
      'Economic contrast lock — catalog framing vs industry-talk DL CapEx.',
    honesty: 'Not audited invoices or TPU receipts.',
  };
}

function experimentEccOverheadBand() {
  const pass = ECC_OVERHEAD_BAND.lo === 0.15 && ECC_OVERHEAD_BAND.hi === 0.3;
  return {
    id: 'E7_ecc_overhead_band',
    title: 'ECC/parity overhead band 15–30% framing lock',
    ECC_OVERHEAD_BAND,
    pass,
    interpretation:
      'Storage parity tax contrast for zero-parity aware grammar talk.',
    honesty: 'Framing band — not JEDEC measured 0% ECC.',
  };
}

function experimentPaperAndBlogLocks() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper =
    (fs.existsSync(paperPath) && fs.readFileSync(paperPath, 'utf8')) ||
    (fs.existsSync(localPaper) && fs.readFileSync(localPaper, 'utf8')) ||
    '';
  const blog = fs.existsSync(MONOREPO_BLOG)
    ? fs.readFileSync(MONOREPO_BLOG, 'utf8')
    : '';
  const checks = {
    hasHonesty: /Honesty boundary/i.test(paper),
    hasDocId: paper.includes(DOC_ID) || paper.includes(REGISTRY_ID),
    hasFair: /Fair Exchange/i.test(paper),
    hasPhi: /Φ|PHI_EGS|1\.618|EGS Fractal/i.test(paper),
    hasAlphaFold: /AlphaFold|brute-force|blindness|awareness/i.test(paper),
    hasInsulin: /Insulin|51/i.test(paper),
    hasMeta: /meta-protein|organism/i.test(paper),
    hasCapex: /150,000|200,000|\$0/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    notEnginePin:
      /not.*engine-shelf pin|application companion|not an engine/i.test(paper),
    blogExists: Boolean(blog),
    blogSlug:
      blog.includes(SHIP_BLOG_SLUG) || blog.includes('awareness-vs-brute-force'),
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
    interpretation:
      'Surfaces must carry catalog framing + DL contrast, not wet-lab overclaim.',
    honesty: 'Structural text locks — not bake-off validation.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E9_registry_id',
    title: 'Registry id + application-companion fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-awareness-vs-brute-force-leverage-2026-09',
    interpretation:
      'Canonical registry id for awareness-vs-brute application companion (not engine pin).',
    honesty: 'Naming lock.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentOddPrimeVaults(),
    experimentInsulinFixture(),
    experimentMetaProteinFixture(),
    experimentTrainingCapexContrast(),
    experimentEccOverheadBand(),
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
