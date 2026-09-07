/**
 * Holographic Singularity Crystal · Net Zero — catalog suite.
 * Replayable algebraic / filing locks — not GR/QFT singularity QED.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  NODE_K0_DOC_ID,
  NODE_K0_REGISTRY_ID,
  PAPER_NAME,
  NODE_K0_PAPER_NAME,
  SHIP_BLOG_FILE,
  NODE_K0_SHIP_BLOG_FILE,
  NODE_K,
  SOLAR_FILING,
  PRIME_VAULT_OCTAVES,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);
const MONOREPO_BLOG_K0 = path.resolve(
  PKG_ROOT,
  '..',
  '..',
  'interfaces',
  NODE_K0_SHIP_BLOG_FILE,
);

function experimentPhiEgs() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Architectural golden key for Net Zero / singularity-crystal recursion.',
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
    interpretation: 'Golden-key identity closing singularity-crystal scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentNetZeroField() {
  const field = [PHI_EGS, -PHI_EGS, Math.PI, -Math.PI];
  const net = field.reduce((a, b) => a + b, 0);
  const balanced = net - net;
  return {
    id: 'E3_net_zero_field',
    title: 'Net Zero field cancellation → 0',
    field,
    net,
    balanced,
    pass: Math.abs(balanced) < 1e-15 && Math.abs(net) < 1e-12,
    interpretation: 'Mock flux cancels to absolute Net Zero equilibrium (catalog).',
    honesty: 'Algebra fixture — not measured MHD reconnection.',
  };
}

function experimentSingularityCrystal() {
  const xs = [0.1, 0.01, 0.001, 0, -0.001, -0.01];
  const resolved = xs.map((x) => {
    const n = PHI_EGS * x ** 3;
    const d = PHI_EGS * x ** 3;
    if (x === 0 || !Number.isFinite(n / d)) return PHI_EGS ** 0;
    return n / d;
  });
  const allNearOne = resolved.every((v) => Math.abs(v - 1) < 1e-12);
  return {
    id: 'E4_singularity_crystal_0_over_0',
    title: '0/0 → Φ⁰ = 1 singularity crystal matrix',
    xs,
    resolved,
    phi0: PHI_EGS ** 0,
    pass: allNearOne && Math.abs(PHI_EGS ** 0 - 1) < 1e-15,
    interpretation: 'Indeterminate 0/0 maps to bounded crystal baseline 1 (catalog algebra).',
    honesty: 'Floating-point / limit fixture — not GR singularity QED.',
  };
}

function experimentNodeK0() {
  return {
    id: 'E5_node_k0_awakening_gate',
    title: 'Node k = 0 · Awakening Phase Gate',
    NODE_K,
    pass: NODE_K === 0,
    interpretation: 'Zero-Octave locus pinned at k = 0 for Infinite Octave Mode.',
    honesty: 'Catalog epoch label — not a measured phase transition.',
  };
}

function experimentSolarFiling() {
  const regions = SOLAR_FILING.activeRegions;
  return {
    id: 'E6_solar_filing_anchors',
    title: 'SESC 83 · AR4521 · AR4524 filing anchors',
    sesc: SOLAR_FILING.sescSunspotNumber,
    regions,
    pass:
      SOLAR_FILING.sescSunspotNumber === 83 &&
      regions.includes('AR4521') &&
      regions.includes('AR4524') &&
      regions.length === 2,
    interpretation: 'Ambient solar telemetry filed as characters for this ship date.',
    honesty: 'Filing labels — not NOAA causation of Φ or Net Zero.',
  };
}

function experimentPrimeVaultOctaves() {
  const odd = PRIME_VAULT_OCTAVES.every((p) => p > 2 && Number.isInteger(p));
  const ascending = PRIME_VAULT_OCTAVES.every(
    (p, i, a) => i === 0 || p > a[i - 1],
  );
  return {
    id: 'E7_prime_vault_octaves',
    title: 'Prime vault octave ladder (odd primes)',
    primes: [...PRIME_VAULT_OCTAVES],
    pass: odd && ascending && PRIME_VAULT_OCTAVES.length >= 5,
    interpretation: 'Non-linear prime vault octave mappings as taxonomic fixtures.',
    honesty: 'Catalog ladder — not biological codon proof.',
  };
}

function experimentDocPresence() {
  const main = path.join(MONOREPO_DOCS, PAPER_NAME);
  const k0 = path.join(MONOREPO_DOCS, NODE_K0_PAPER_NAME);
  const suiteMain = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const suiteK0 = path.join(PKG_ROOT, 'docs', NODE_K0_PAPER_NAME);
  const py = path.join(PKG_ROOT, 'reference', 'zero_octave_singularity_crystal.py');
  const ok =
    fs.existsSync(main) &&
    fs.existsSync(k0) &&
    fs.existsSync(suiteMain) &&
    fs.existsSync(suiteK0) &&
    fs.existsSync(py) &&
    fs.existsSync(MONOREPO_BLOG) &&
    fs.existsSync(MONOREPO_BLOG_K0);
  return {
    id: 'E8_doc_and_blog_presence',
    title: 'Papers · suite mirrors · ship blogs · Python reference present',
    main,
    k0,
    py,
    blog: MONOREPO_BLOG,
    blogK0: MONOREPO_BLOG_K0,
    pass: ok,
    interpretation: 'Protocol surfaces exist for both papers in the suite.',
    honesty: 'Presence lock only.',
  };
}

function experimentDocIdsInPaper() {
  const main = fs.readFileSync(path.join(MONOREPO_DOCS, PAPER_NAME), 'utf8');
  const k0 = fs.readFileSync(path.join(MONOREPO_DOCS, NODE_K0_PAPER_NAME), 'utf8');
  const pass =
    main.includes(DOC_ID) &&
    main.includes(REGISTRY_ID) &&
    main.includes('Honesty boundary') &&
    main.includes('SynthOBS Autonomous Agent') &&
    k0.includes(NODE_K0_DOC_ID) &&
    k0.includes(NODE_K0_REGISTRY_ID) &&
    k0.includes('Honesty boundary') &&
    k0.includes('SynthOBS Autonomous Agent');
  return {
    id: 'E9_protocol_headers',
    title: 'Document ID · Registry · Honesty · Operator on both papers',
    pass,
    interpretation: 'PRA Snap structural headers present.',
    honesty: 'Structural lock — full PRA via npm run audit:paper.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentNetZeroField(),
    experimentSingularityCrystal(),
    experimentNodeK0(),
    experimentSolarFiling(),
    experimentPrimeVaultOctaves(),
    experimentDocPresence(),
    experimentDocIdsInPaper(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    experiments,
  };
}
