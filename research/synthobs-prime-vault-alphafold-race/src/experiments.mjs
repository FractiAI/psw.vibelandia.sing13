/**
 * Prime-Vault vs ColabFold (AlphaFold-class) Race — suite locks.
 * Prime-vault always live; ColabFold live when COLABFOLD_LIVE=1 + binary.
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
  TIER_SIMPLE,
  TIER_COMPLEX,
  TIER_FRONTIER,
  ACCURACY_LABELS,
} from './constants.mjs';
import {
  discoverColabfold,
  raceTier,
  RACE_FASTA,
} from './colabfold-adapter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function generateOddPrimes(n) {
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

export function primeVaultFold(residues, octave = 1) {
  const t0 = performance.now();
  const primes = generateOddPrimes(residues);
  let energy = 0;
  for (let i = 0; i < primes.length; i++) {
    const pk = primes[i];
    energy +=
      (PHI_EGS ** octave) / pk ** PHI_EGS * Math.exp(-(i + 1) / PHI_EGS);
  }
  const latencyMs = performance.now() - t0;
  return {
    lane: 'prime_vault',
    residues,
    octave,
    primes: primes.length,
    energy,
    latencyMs,
    live: true,
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
    interpretation: 'Architectural golden key for prime-vault race grammar.',
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
    interpretation: 'Golden-key identity closing race scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentOddPrimeVaults() {
  const primes = generateOddPrimes(16);
  const pass =
    primes.length === 16 && primes[0] === 3 && primes.every((p) => p % 2 === 1);
  return {
    id: 'E3_odd_prime_vaults',
    title: 'Odd-prime vault generator (irreducible containers)',
    first: primes[0],
    n: primes.length,
    pass,
    interpretation: 'Odd primes as irreducible race containers (catalog).',
    honesty: 'Textbook primality smoke — not wet-lab topology.',
  };
}

function experimentSimpleTier() {
  const race = raceTier(TIER_SIMPLE, primeVaultFold);
  const pv = race.primeVault;
  const pass =
    pv.residues === 76 &&
    pv.primes === 76 &&
    Number.isFinite(pv.energy) &&
    pv.energy > 0 &&
    pv.latencyMs < 500 &&
    pv.latencyMs < TIER_SIMPLE.colabfoldLatencyBandMinMs &&
    fs.existsSync(RACE_FASTA.simple_ubiquitin);
  return {
    id: 'E4_tier_simple_ubiquitin',
    title:
      'Tier 1 Simple — Ubiquitin FastA · prime-vault live vs ColabFold lane',
    race,
    pass,
    interpretation:
      'Monomer FastA present; prime-vault live ms vs ColabFold lane (live or deferred).',
    honesty:
      'ColabFold runs only when COLABFOLD_LIVE=1 + colabfold_batch; else adapter defers honestly.',
  };
}

function experimentComplexTier() {
  const race = raceTier(TIER_COMPLEX, primeVaultFold);
  const pv = race.primeVault;
  const pass =
    pv.residues === 264 &&
    pv.octave === 2 &&
    Number.isFinite(pv.energy) &&
    pv.energy > 0 &&
    pv.latencyMs < 2_000 &&
    pv.latencyMs < TIER_COMPLEX.colabfoldLatencyBandMinMs &&
    fs.existsSync(RACE_FASTA.complex_il2);
  return {
    id: 'E5_tier_complex_il2',
    title:
      'Tier 2 Complex — IL-2 multimer FastA · prime-vault live vs ColabFold lane',
    race,
    pass,
    interpretation:
      'Two-chain FastA fixture; vault vs ColabFold-multimer-capable lane.',
    honesty:
      'Not an IL-2 crystal bake-off; ColabFold live only when binary + COLABFOLD_LIVE=1.',
  };
}

function experimentFrontierTier() {
  const race = raceTier(TIER_FRONTIER, primeVaultFold);
  const pv = race.primeVault;
  const pass =
    pv.residues === 89 &&
    pv.octave === 3 &&
    Number.isFinite(pv.energy) &&
    pv.energy > 0 &&
    pv.latencyMs < 1_000 &&
    TIER_FRONTIER.colabfoldMsaSparse === true &&
    fs.existsSync(RACE_FASTA.frontier_orphan);
  return {
    id: 'E6_tier_frontier_orphan',
    title:
      'Tier 3 Frontier — orphan synthetic FastA · prime-vault live vs ColabFold lane',
    race,
    pass,
    interpretation:
      'No MSA history required on prime lane; ColabFold MSA sparsity is expected contrast.',
    honesty:
      'Not a claim ColabFold always fails orphans; not clinical de novo design QED.',
  };
}

function experimentColabfoldAdapter() {
  const discovery = discoverColabfold();
  const pass =
    discovery.engine === 'colabfold' &&
    discovery.fixturesOk === true &&
    typeof discovery.honesty === 'string' &&
    discovery.honesty.includes('COLABFOLD_LIVE') &&
    Object.keys(RACE_FASTA).length === 3;
  return {
    id: 'E7_colabfold_adapter',
    title: 'ColabFold adapter discovery + FastA fixtures (AlphaFold-class lane)',
    discovery: {
      engine: discovery.engine,
      installed: discovery.installed,
      liveRequested: discovery.liveRequested,
      liveEligible: discovery.liveEligible,
      fixturesOk: discovery.fixturesOk,
    },
    pass,
    interpretation:
      'Adapter is the AlphaFold-class race lane — ColabFold binary optional; fixtures mandatory.',
    honesty: discovery.honesty,
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
    hasAlphaFold: /AlphaFold/i.test(paper),
    hasColabFold: /ColabFold/i.test(paper),
    hasPrimeVault: /prime.?vault|Prime-Vault/i.test(paper),
    hasUbiquitin: /Ubiquitin|76/i.test(paper),
    hasIl2: /Interleukin|IL-2|heterodimer|264/i.test(paper),
    hasOrphan: /orphan|de novo|Frontier/i.test(paper),
    hasMetrics: /GDT-TS|TM-score|RMSD/i.test(paper),
    hasLiveFlag: /COLABFOLD_LIVE/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    notEnginePin:
      /not.*engine-shelf pin|application companion|not an engine/i.test(paper),
    blogExists: Boolean(blog),
    blogSlug: blog.includes(SHIP_BLOG_SLUG) || blog.includes('prime-vault'),
    blogColabFold: /ColabFold/i.test(blog),
    blogHonesty: /Honesty/i.test(blog),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E8_paper_blog_locks',
    title: 'Paper + ship-blog honesty / Fair Exchange / ColabFold race locks',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    blogPath: MONOREPO_BLOG,
    ...checks,
    pass,
    interpretation:
      'Surfaces must name ColabFold as the AF-class lane + honesty, not CASP overclaim.',
    honesty: 'Structural text locks — not bake-off validation.',
  };
}

function experimentRegistryId() {
  return {
    id: 'E9_registry_id',
    title: 'Registry id + application-companion fixture',
    REGISTRY_ID,
    DOC_ID,
    pass: REGISTRY_ID === 'synthobs-prime-vault-alphafold-race-2026-09',
    interpretation:
      'Canonical registry id for prime-vault vs ColabFold race (not engine pin).',
    honesty: 'Naming lock.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentOddPrimeVaults(),
    experimentSimpleTier(),
    experimentComplexTier(),
    experimentFrontierTier(),
    experimentColabfoldAdapter(),
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
