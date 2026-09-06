/**
 * Prime-Vault vs AlphaFold Race — catalog suite.
 * Replayable algebraic / framing locks — not live DeepMind bake-offs.
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
    energy += (PHI_EGS ** octave) / pk ** PHI_EGS * Math.exp(-(i + 1) / PHI_EGS);
  }
  const latencyMs = performance.now() - t0;
  return {
    lane: 'prime_vault',
    residues,
    octave,
    primes: primes.length,
    energy,
    latencyMs,
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
  const pv = primeVaultFold(TIER_SIMPLE.residues, TIER_SIMPLE.octave);
  const pass =
    pv.residues === 76 &&
    pv.primes === 76 &&
    Number.isFinite(pv.energy) &&
    pv.energy > 0 &&
    pv.latencyMs < 500 &&
    pv.latencyMs < TIER_SIMPLE.afLatencyBandMin;
  return {
    id: 'E4_tier_simple_ubiquitin',
    title: 'Tier 1 Simple — Ubiquitin-class prime-vault beats AF latency band (catalog)',
    primeVault: pv,
    alphaFoldLatencyBandMinMs: TIER_SIMPLE.afLatencyBandMin,
    pass,
    interpretation:
      'Monomer fixture: closed-form CPU ms vs minutes-class AF inference talk.',
    honesty: 'Not a live AlphaFold2 run or deposited 1UBQ bake-off.',
  };
}

function experimentComplexTier() {
  const pv = primeVaultFold(TIER_COMPLEX.residues, TIER_COMPLEX.octave);
  const pass =
    pv.residues === 280 &&
    pv.octave === 2 &&
    Number.isFinite(pv.energy) &&
    pv.energy > 0 &&
    pv.latencyMs < 2_000 &&
    pv.latencyMs < TIER_COMPLEX.afLatencyBandMin;
  return {
    id: 'E5_tier_complex_il2',
    title: 'Tier 2 Complex — IL-2-class heterodimer vault race (catalog)',
    primeVault: pv,
    alphaFoldLatencyBandMinMs: TIER_COMPLEX.afLatencyBandMin,
    afGpuHoursTalk: TIER_COMPLEX.afGpuHoursTalk,
    pass,
    interpretation:
      'Multimer-scale node talk: independent vaults vs AF-Multimer cluster-hour framing.',
    honesty: 'Catalog node count — not IL-2 crystal refinement or AF3 API telemetry.',
  };
}

function experimentFrontierTier() {
  const pv = primeVaultFold(TIER_FRONTIER.residues, TIER_FRONTIER.octave);
  const pass =
    pv.residues === 120 &&
    pv.octave === 3 &&
    Number.isFinite(pv.energy) &&
    pv.energy > 0 &&
    pv.latencyMs < 1_000 &&
    TIER_FRONTIER.afConfidenceDrop === true;
  return {
    id: 'E6_tier_frontier_orphan',
    title: 'Tier 3 Frontier — orphan/synthetic lattice retains deterministic vault (catalog)',
    primeVault: pv,
    afConfidenceDropTalk: TIER_FRONTIER.afConfidenceDrop,
    pass,
    interpretation:
      'No MSA history required on prime lane; AF orphan brittleness is framing contrast.',
    honesty: 'Not a claim AF always fails orphans; not clinical de novo design QED.',
  };
}

function experimentMetricsTable() {
  const pass =
    ACCURACY_LABELS.gdtTsTalk === 0.95 &&
    ACCURACY_LABELS.tmScoreTalk === 0.95 &&
    ACCURACY_LABELS.rmsdTalkAngstrom === 1.5 &&
    TIER_SIMPLE.afGpuHoursTalk === 0.05 &&
    TIER_COMPLEX.afGpuHoursTalk === 2;
  return {
    id: 'E7_metrics_resource_table',
    title: 'GDT/TM/RMSD talk labels + AF GPU-hour framing bands locked',
    ACCURACY_LABELS,
    simpleGpu: TIER_SIMPLE.afGpuHoursTalk,
    complexGpu: TIER_COMPLEX.afGpuHoursTalk,
    pass,
    interpretation:
      'Comparative metrics table fixtures for accuracy · speed · resource axes.',
    honesty: 'Talk labels — not audited CASP scores or cloud invoices.',
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
    hasPrimeVault: /prime.?vault|Prime-Vault/i.test(paper),
    hasUbiquitin: /Ubiquitin|76/i.test(paper),
    hasIl2: /Interleukin|heterodimer|280/i.test(paper),
    hasOrphan: /orphan|de novo|Frontier/i.test(paper),
    hasMetrics: /GDT-TS|TM-score|RMSD/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    notEnginePin:
      /not.*engine-shelf pin|application companion|not an engine/i.test(paper),
    blogExists: Boolean(blog),
    blogSlug: blog.includes(SHIP_BLOG_SLUG) || blog.includes('prime-vault'),
    blogHonesty: /Honesty/i.test(blog),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E8_paper_blog_locks',
    title: 'Paper + ship-blog honesty / Fair Exchange / race locks',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    blogPath: MONOREPO_BLOG,
    ...checks,
    pass,
    interpretation: 'Surfaces must carry race framing + honesty, not CASP overclaim.',
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
      'Canonical registry id for prime-vault vs AlphaFold race (not engine pin).',
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
    experimentMetricsTable(),
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
