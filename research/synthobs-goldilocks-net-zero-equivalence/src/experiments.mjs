/**
 * Goldilocks ≡ Net Zero — catalog suite fixtures.
 * Viable band = active equilibrium · stillness not required.
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
  GOLDILOCKS_EQUALS_NET_ZERO,
  NET_ZERO_MEANS_STILLNESS,
  GOLDILOCKS_MEANS_STATIC_COMFORT,
  VIABLE_REGION_SYMBOL,
  EQUIVALENCE_CHAIN,
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
    interpretation: 'Architectural golden key for viable-band / nesting grammar.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentEquivalence() {
  return {
    id: 'E2_equivalence',
    title: 'Goldilocks ≡ Net Zero locked',
    GOLDILOCKS_EQUALS_NET_ZERO,
    pass: GOLDILOCKS_EQUALS_NET_ZERO === true,
    interpretation: 'Viable band and active equilibrium share one filing.',
    honesty: 'Catalog identity — not climate-policy accounting identity.',
  };
}

function experimentRefuseStillness() {
  const pass =
    NET_ZERO_MEANS_STILLNESS === false && GOLDILOCKS_MEANS_STATIC_COMFORT === false;
  return {
    id: 'E3_refuse_stillness',
    title: 'Refuse stillness / static-comfort misreadings',
    NET_ZERO_MEANS_STILLNESS,
    GOLDILOCKS_MEANS_STATIC_COMFORT,
    pass,
    interpretation: 'Net Zero ≠ freeze; Goldilocks ≠ permanent couch.',
    honesty: 'Naming lock — not medical advice.',
  };
}

function experimentViableRegion() {
  return {
    id: 'E4_viable_region',
    title: 'Viable region symbol Ω',
    VIABLE_REGION_SYMBOL,
    pass: VIABLE_REGION_SYMBOL === 'Ω',
    interpretation: 'Shared operating region for both names.',
    honesty: 'Symbol talk — not a measured SI quantity here.',
  };
}

function experimentEquivalenceChain() {
  const expected = [
    'DYNAMIC_STABILITY',
    'GOLDILOCKS_BAND',
    'NET_ZERO_ACTIVE_EQUILIBRIUM',
  ];
  const pass =
    EQUIVALENCE_CHAIN.length === expected.length &&
    EQUIVALENCE_CHAIN.every((s, i) => s === expected[i]);
  return {
    id: 'E5_equivalence_chain',
    title: 'Dynamic stability → Goldilocks → Net Zero chain',
    EQUIVALENCE_CHAIN: [...EQUIVALENCE_CHAIN],
    pass,
    interpretation: 'Bridge to Holographic Homeostasis dynamic stability.',
    honesty: 'Catalog chain — not finished empirics.',
  };
}

function experimentPaperLocks() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper =
    (fs.existsSync(paperPath) && fs.readFileSync(paperPath, 'utf8')) ||
    (fs.existsSync(localPaper) && fs.readFileSync(localPaper, 'utf8')) ||
    '';
  const checks = {
    hasHonesty: /Honesty boundary/i.test(paper),
    hasDocId: paper.includes(DOC_ID) || paper.includes(REGISTRY_ID),
    hasEquivalence: /Goldilocks.*Net Zero|Net Zero.*Goldilocks|≡/i.test(paper),
    hasActive: /active equilibrium|cancel-to/i.test(paper),
    hasHomeostasis: /Holographic Homeostasis|homeostasis/i.test(paper),
    hasFair: /Fair Exchange/i.test(paper),
    hasOperator: /SynthOBS/i.test(paper),
    hasEngine: /ENGINE_SHELF|engine pin|Infinite Octaves/i.test(paper),
  };
  const pass = Boolean(paper) && Object.values(checks).every(Boolean);
  return {
    id: 'E6_paper_locks',
    title: 'Paper narrative locks (equivalence · active · engine)',
    paperPath: fs.existsSync(paperPath) ? paperPath : localPaper,
    ...checks,
    pass,
    interpretation: 'Paper must keep honesty rails and equivalence filing.',
    honesty: 'Structural text locks — not market validation.',
  };
}

function experimentShipBlogLock() {
  const exists = fs.existsSync(MONOREPO_BLOG);
  const body = exists ? fs.readFileSync(MONOREPO_BLOG, 'utf8') : '';
  const hasSlug =
    body.includes(`/ship-blog/${SHIP_BLOG_SLUG}`) || body.includes('goldilocks-net-zero');
  const hasWhitepaper =
    body.includes('/whitepaper/goldilocks-net-zero') ||
    body.includes('synthobs-goldilocks-net-zero-equivalence-2026-09');
  const hasThesis = /goldilocks|net zero|paycheck|rent|balance|middle/i.test(body);
  return {
    id: 'E7_ship_blog_lock',
    title: 'Ship-blog surfaces goldilocks-net-zero + full paper link',
    path: MONOREPO_BLOG,
    exists,
    hasSlug,
    hasWhitepaper,
    hasThesis,
    pass: exists && hasSlug && hasWhitepaper && hasThesis,
    interpretation: 'Guest note must link the full paper and keep kitchen-table copy.',
    honesty: 'Surface copy lock only.',
  };
}

function experimentNotClimateIdentity() {
  const paperPath = path.join(MONOREPO_DOCS, PAPER_NAME);
  const localPaper = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const paper =
    (fs.existsSync(paperPath) && fs.readFileSync(paperPath, 'utf8')) ||
    (fs.existsSync(localPaper) && fs.readFileSync(localPaper, 'utf8')) ||
    '';
  const refusesClimateSwap =
    /climate|IPCC|emissions/i.test(paper) && /[Nn]ot claim|Does not claim|without swapping/i.test(paper);
  return {
    id: 'E8_not_climate_identity',
    title: 'Honesty refuses climate-accounting identity swap',
    refusesClimateSwap,
    pass: refusesClimateSwap || /Does not claim/i.test(paper),
    interpretation: 'Voyage Net Zero may rhyme with climate talk without swapping definitions.',
    honesty: 'Boundary lock — not a climate paper.',
  };
}

function experimentGoldenIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E9_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Harmony grammar identity for cross-octave sync framing.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentEquivalence(),
    experimentRefuseStillness(),
    experimentViableRegion(),
    experimentEquivalenceChain(),
    experimentPaperLocks(),
    experimentShipBlogLock(),
    experimentNotClimateIdentity(),
    experimentGoldenIdentity(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    failed,
    experiments,
  };
}
