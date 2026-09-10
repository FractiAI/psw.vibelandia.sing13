/**
 * Corpus audit — classifies FractiAI monorepo research lanes (Tier A/B/C).
 * Architectural meta-audit — not a claim every suite is laboratory physics.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AMENDMENT_A_PATH,
  MIN_PIPELINE_COUNT,
  MIN_TIER_A_OR_B,
  PHI_EGS,
  PRA_SNAP_PATH,
  PUBLIC_FETCH_PATTERNS,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, '../../..');
const RESEARCH_ROOT = path.join(MONOREPO_ROOT, 'research');

function listResearchDirs() {
  if (!fs.existsSync(RESEARCH_ROOT)) return [];
  return fs
    .readdirSync(RESEARCH_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function fileExists(rel) {
  return fs.existsSync(path.join(MONOREPO_ROOT, rel));
}

function readTextIfExists(abs) {
  try {
    return fs.readFileSync(abs, 'utf8');
  } catch {
    return '';
  }
}

function scanDirForPatterns(dir, patterns) {
  let hit = false;
  const walk = (p) => {
    if (hit) return;
    let entries;
    try {
      entries = fs.readdirSync(p, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(p, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.git') continue;
        walk(full);
      } else if (/\.(mjs|js|py|ts)$/.test(e.name)) {
        const txt = readTextIfExists(full);
        if (patterns.some((pat) => txt.includes(pat))) hit = true;
      }
    }
  };
  walk(dir);
  return hit;
}

function classifyPackage(name) {
  const pkgRoot = path.join(RESEARCH_ROOT, name);
  const hasPipeline =
    fileExists(path.join('research', name, 'scripts/run_empirical_pipeline.mjs')) ||
    fileExists(path.join('research', name, 'scripts/run_pipeline.py'));
  const hasReceipt = fileExists(path.join('research', name, 'data/empirical_report.json'));
  const hasMethodology = fileExists(path.join('research', name, 'METHODOLOGY.md'));
  const hasPublicFetch = scanDirForPatterns(pkgRoot, PUBLIC_FETCH_PATTERNS);

  let tier = 'C';
  if (hasPublicFetch && hasPipeline) tier = 'A';
  else if (hasPipeline) tier = 'B';

  return { name, tier, hasPipeline, hasReceipt, hasMethodology, hasPublicFetch };
}

export function experimentPhiIdentity() {
  const err = Math.abs(PHI_EGS - (1 + Math.sqrt(5)) / 2);
  return {
    id: 'E0_phi_egs_identity',
    title: 'Φ_EGS = (1+√5)/2',
    phi_egs: PHI_EGS,
    abs_err: err,
    result: err < 1e-15 ? 'support' : 'refute',
    pass: err < 1e-15,
  };
}

export function experimentPipelineCount() {
  const dirs = listResearchDirs();
  const classified = dirs.map(classifyPackage);
  const withPipeline = classified.filter((c) => c.hasPipeline);
  return {
    id: 'E1_pipeline_count',
    title: 'Research packages with empirical pipeline',
    total_packages: dirs.length,
    pipeline_count: withPipeline.length,
    min_required: MIN_PIPELINE_COUNT,
    result: withPipeline.length >= MIN_PIPELINE_COUNT ? 'support' : 'weak_support',
    pass: withPipeline.length >= MIN_PIPELINE_COUNT,
  };
}

export function experimentPublicFetchCount() {
  const dirs = listResearchDirs();
  const classified = dirs.map(classifyPackage);
  const tierA = classified.filter((c) => c.tier === 'A');
  return {
    id: 'E2_tier_a_public_fetch',
    title: 'Tier A · public-data wet lab packages',
    tier_a_count: tierA.length,
    tier_a_samples: tierA.slice(0, 8).map((c) => c.name),
    result: tierA.length >= 3 ? 'support' : 'weak_support',
    pass: tierA.length >= 3,
  };
}

export function experimentReceiptCount() {
  const dirs = listResearchDirs();
  const classified = dirs.map(classifyPackage);
  const withReceipt = classified.filter((c) => c.hasReceipt);
  return {
    id: 'E3_json_receipt_count',
    title: 'Packages with committed empirical_report.json',
    receipt_count: withReceipt.length,
    result: withReceipt.length >= 20 ? 'support' : 'weak_support',
    pass: withReceipt.length >= 20,
  };
}

export function experimentAmendmentA() {
  const exists = fileExists(AMENDMENT_A_PATH);
  const txt = readTextIfExists(path.join(MONOREPO_ROOT, AMENDMENT_A_PATH));
  const hasRefute = txt.includes('Refute conditions') || txt.includes('refute');
  return {
    id: 'E4_amendment_a_protocol',
    title: 'Amendment A falsification lane on disk',
    path: AMENDMENT_A_PATH,
    exists,
    has_refute_section: hasRefute,
    result: exists && hasRefute ? 'support' : 'refute',
    pass: exists && hasRefute,
  };
}

export function experimentPraSnapLink() {
  const txt = readTextIfExists(path.join(MONOREPO_ROOT, PRA_SNAP_PATH));
  const citesAmendment = txt.includes('WHITEPAPER_EMPIRICAL_FALSIFICATION_LANE');
  return {
    id: 'E5_pra_snap_amendment_link',
    title: 'PRA Snap cites Amendment A',
    path: PRA_SNAP_PATH,
    cites_amendment_a: citesAmendment,
    result: citesAmendment ? 'support' : 'refute',
    pass: citesAmendment,
  };
}

export function experimentTierHistogram() {
  const dirs = listResearchDirs();
  const classified = dirs.map(classifyPackage);
  const hist = { A: 0, B: 0, C: 0 };
  for (const c of classified) hist[c.tier] += 1;
  const ab = hist.A + hist.B;
  return {
    id: 'E6_tier_histogram',
    title: 'Tier A/B/C classification histogram',
    histogram: hist,
    tier_ab_count: ab,
    min_ab: MIN_TIER_A_OR_B,
    packages: classified,
    honesty:
      'Tier C is expected — catalog lanes remain. Partial boundary crossing = A+B > C is NOT required.',
    result: ab >= MIN_TIER_A_OR_B ? 'support' : 'weak_support',
    pass: ab >= MIN_TIER_A_OR_B,
  };
}

export function experimentBoundaryVerdict() {
  const hist = experimentTierHistogram();
  const tierA = hist.histogram.A;
  const ab = hist.tier_ab_count;
  const crossed = tierA >= 3 && ab >= MIN_TIER_A_OR_B && experimentAmendmentA().pass;
  return {
    id: 'E7_boundary_verdict',
    title: 'Partial boundary crossing · scoped verdict',
    tier_a: tierA,
    tier_ab: ab,
    amendment_a: experimentAmendmentA().pass,
    verdict: crossed
      ? 'partial_crossing_confirmed'
      : 'insufficient_evidence_for_crossing',
    result: crossed ? 'support' : 'refute',
    pass: crossed,
    honesty:
      'Partial crossing — not uniform empirical science across all registry papers.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentPhiIdentity(),
    experimentPipelineCount(),
    experimentPublicFetchCount(),
    experimentReceiptCount(),
    experimentAmendmentA(),
    experimentPraSnapLink(),
    experimentTierHistogram(),
    experimentBoundaryVerdict(),
  ];
  const passCount = experiments.filter((e) => e.pass).length;
  return {
    suite: 'synthobs-open-empirical-science-audit',
    documentId: 'WP-SYNTHOBS-OPEN-EMPIRICAL-SCIENCE-2026-09-10',
    generatedAt: new Date().toISOString(),
    experiments,
    summary: {
      total: experiments.length,
      pass: passCount,
      fail: experiments.length - passCount,
      all_pass: passCount === experiments.length,
    },
  };
}
