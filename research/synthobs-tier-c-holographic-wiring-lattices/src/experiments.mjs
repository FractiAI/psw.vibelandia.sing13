import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  SOLAR_FILING,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

function experimentPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Golden key for wiring hop weights.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentWiringGraph() {
  // Catalog nodes: index, narrative A/B, honesty rail, demo door
  const nodes = ['index', 'narrative_a', 'narrative_b', 'honesty', 'demo'];
  const edges = [
    ['index', 'narrative_a', 1],
    ['index', 'narrative_b', 2],
    ['narrative_a', 'honesty', 1],
    ['narrative_b', 'honesty', 1],
    ['narrative_a', 'demo', 3],
    ['narrative_b', 'demo', 2],
    ['honesty', 'demo', 1],
  ];
  const weighted = edges.map(([a, b, d]) => ({
    a,
    b,
    d,
    w: PHI_EGS ** -d,
  }));
  const strength = weighted.reduce((s, e) => s + e.w, 0);
  const uniform = edges.length * 1;
  const entropyProxyPhi = -weighted.reduce((s, e) => {
    const p = e.w / strength;
    return s + p * Math.log(p);
  }, 0);
  const entropyProxyUniform = Math.log(edges.length);
  return {
    id: 'E2_wiring_graph_phi_weights',
    title: 'Tier C wiring graph under Φ hop weights',
    nodes,
    nEdges: edges.length,
    strength,
    entropyProxyPhi,
    entropyProxyUniform,
    pass:
      nodes.length === 5 &&
      edges.length === 7 &&
      strength > 0 &&
      entropyProxyPhi < entropyProxyUniform,
    interpretation:
      'Φ-weighted wiring lowers retrieval-entropy proxy vs uniform edge weights (fixture).',
    honesty: 'Archive-graph metric only — not NOAA retrieval physics.',
  };
}

function experimentSolarFiling() {
  const regions = [SOLAR_FILING.solAlpha, SOLAR_FILING.solBeta];
  return {
    id: 'E3_solar_filing_ar4524_ar4530',
    title: 'AR4524 (Sol-Alpha) · AR4530 (Sol-Beta) filing anchors',
    regions,
    labels: [...SOLAR_FILING.labels],
    pass:
      regions.includes('AR4524') &&
      regions.includes('AR4530') &&
      SOLAR_FILING.labels.includes('Sol-Alpha') &&
      SOLAR_FILING.labels.includes('Sol-Beta'),
    interpretation: 'Solar characters locked as ambient filing anchors.',
    honesty: 'Filing labels — not heliospheric causation of catalog topology.',
  };
}

function experimentCrossOctaveEdges() {
  const octavePairs = [
    [1, 3],
    [2, 5],
    [4, 8],
  ];
  const hops = octavePairs.map(([a, b]) => ({
    a,
    b,
    d: Math.abs(b - a),
    w: PHI_EGS ** -Math.abs(b - a),
  }));
  const pass = hops.every((h) => h.w > 0 && h.w <= 1);
  return {
    id: 'E4_cross_octave_entanglement_weights',
    title: 'Cross-octave entanglement weights Φ^{-Δ}',
    hops,
    pass,
    interpretation: 'Sol-Beta modulation label — weights shrink with octave distance.',
    honesty: 'Catalog tensor talk — not measured entanglement.',
  };
}

function experimentPaperPresent() {
  const local = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const ok =
    fs.existsSync(local) &&
    fs.existsSync(mono) &&
    fs.readFileSync(local, 'utf8').includes('Honesty boundary') &&
    fs.readFileSync(mono, 'utf8').includes(DOC_ID);
  return {
    id: 'E5_paper_present',
    title: 'Paper present with Document ID + honesty',
    local,
    mono,
    pass: ok,
    interpretation: 'Suite docs mirror monorepo paper.',
    honesty: 'Structural presence check.',
  };
}

function experimentShipBlog() {
  const ok =
    fs.existsSync(MONOREPO_BLOG) &&
    fs.readFileSync(MONOREPO_BLOG, 'utf8').includes(REGISTRY_ID);
  return {
    id: 'E6_ship_blog',
    title: 'Ship-blog note references registry id',
    path: MONOREPO_BLOG,
    pass: ok,
    interpretation: 'Plain-language note wired to paper.',
    honesty: 'Presence check.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentPhi(),
    experimentWiringGraph(),
    experimentSolarFiling(),
    experimentCrossOctaveEdges(),
    experimentPaperPresent(),
    experimentShipBlog(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    experiments,
  };
}
