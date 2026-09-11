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
  CATALOG_LAYER,
  HONESTY,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');
const MONOREPO_BLOG = path.resolve(PKG_ROOT, '..', '..', 'interfaces', SHIP_BLOG_FILE);

const LP_MANTISSA = 1.616255;
const CLUTCH = Math.abs(PHI_EGS - LP_MANTISSA);

function experimentPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS catalog seed',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Catalog-layer nesting seed.',
    honesty: 'Architectural key — not GPU physics.',
  };
}

function experimentIdentity() {
  const lhs = PHI_EGS * PHI_EGS;
  const rhs = PHI_EGS + 1;
  return {
    id: 'E2_phi_squared_identity',
    title: 'Φ² = Φ + 1',
    lhs,
    rhs,
    pass: Math.abs(lhs - rhs) < 1e-12,
    interpretation: 'Catalog ladder identity.',
    honesty: 'Algebra fixture.',
  };
}

function experimentClutch() {
  return {
    id: 'E3_clutch_delta',
    title: 'Clutch Δ ≈ 0.001779 (SI mantissa slip)',
    clutch: CLUTCH,
    expectedApprox: 0.001779,
    pass: Math.abs(CLUTCH - 0.001779) < 5e-6,
    interpretation: 'Filed near-miss between Φ and l_P·10^35 mantissa.',
    honesty: 'SI/base-10 dependent — not a discovery of nature.',
  };
}

function experimentCatalogIdentity() {
  return {
    id: 'E4_catalog_layer_identity',
    title: 'Catalog-layer identity constants',
    layerId: CATALOG_LAYER.id,
    engineOrder: CATALOG_LAYER.engineOrder,
    category: CATALOG_LAYER.category,
    pass:
      CATALOG_LAYER.id === 'infinite-octave-ai-catalog-layer' &&
      CATALOG_LAYER.engineOrder === 27 &&
      CATALOG_LAYER.category === 'lattice-catalog',
    interpretation: 'Layer identity locked for registry / shelf sync.',
    honesty: 'Identity labels — not market share claims.',
  };
}

function experimentStackPosition() {
  const { above, self, below } = CATALOG_LAYER.position;
  return {
    id: 'E5_stack_layer_position',
    title: 'Stack position between agentic IDE and data (catalog labels)',
    above,
    self,
    below,
    pass:
      above === 'agentic-ide' &&
      self === 'catalog-orchestration' &&
      below === 'data-warehouse-storage',
    interpretation: 'Filed shelf order for coordination talk.',
    honesty: 'Architecture labels — not displacement of IDEs or warehouses.',
  };
}

function experimentSolar() {
  return {
    id: 'E6_solar_filing_ar4524_ar4530',
    title: 'AR4524 · AR4530 catalog wet-lab anchors',
    solAlpha: SOLAR_FILING.solAlpha,
    solBeta: SOLAR_FILING.solBeta,
    pass:
      SOLAR_FILING.solAlpha === 'AR4524' && SOLAR_FILING.solBeta === 'AR4530',
    interpretation: 'Sol-Alpha / Sol-Beta locked for telemetry filing.',
    honesty: 'Filing characters — not derivation of constants from sunspots.',
  };
}

function experimentHonestyArchitectureNotGpu() {
  const refusesGpuInfinity = HONESTY.includes('GPU-free') || HONESTY.includes('GPU');
  const refusesJoin = HONESTY.includes('JOIN');
  const namesArchitecture = HONESTY.toLowerCase().includes('architecture');
  return {
    id: 'E7_honesty_architecture_not_gpu_physics',
    title: 'Honesty: architecture not GPU physics / JOIN elimination',
    honestySnippet: HONESTY,
    pass: refusesGpuInfinity && refusesJoin && namesArchitecture,
    interpretation: 'Explicit refusal of overclaim rails.',
    honesty: 'Softens draft claims to catalog coordination only.',
  };
}

function experimentPaperPresent() {
  const local = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const text = fs.existsSync(mono) ? fs.readFileSync(mono, 'utf8') : '';
  const ok =
    fs.existsSync(local) &&
    fs.existsSync(mono) &&
    text.includes('Honesty boundary') &&
    text.includes(DOC_ID) &&
    text.includes('Fair Exchange') &&
    text.includes('JOIN') &&
    !text.toLowerCase().includes('proves infinite gpu');
  return {
    id: 'E8_paper_present',
    title: 'Paper present with Document ID + honesty + Fair Exchange',
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
    id: 'E9_ship_blog',
    title: 'Ship-blog note references registry id',
    pass: ok,
    interpretation: 'Plain-language note wired to paper.',
    honesty: 'Presence check.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentPhi(),
    experimentIdentity(),
    experimentClutch(),
    experimentCatalogIdentity(),
    experimentStackPosition(),
    experimentSolar(),
    experimentHonestyArchitectureNotGpu(),
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
