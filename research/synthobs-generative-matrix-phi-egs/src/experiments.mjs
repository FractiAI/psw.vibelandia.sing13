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

const LP_MANTISSA = 1.616255;
const CLUTCH = Math.abs(PHI_EGS - LP_MANTISSA);

function experimentPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_phi_egs',
    title: 'Φ_EGS generative seed',
    PHI_EGS,
    expected,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    interpretation: 'Generative matrix seed.',
    honesty: 'Architectural key — not CODATA replacement.',
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
    interpretation: 'Generative ladder identity.',
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

function experimentLadder() {
  const omega0 = 1;
  const ladder = Array.from({ length: 6 }, (_, n) => omega0 * PHI_EGS ** n);
  const ratios = ladder.slice(1).map((v, i) => v / ladder[i]);
  const pass = ratios.every((r) => Math.abs(r - PHI_EGS) < 1e-12);
  return {
    id: 'E4_generative_ladder',
    title: 'Ω_n = Φ^n · Ω_0 ladder',
    ladder,
    ratios,
    pass,
    interpretation: 'Self-similar generative matrix leaves.',
    honesty: 'Catalog scaling — not measured vacuum amplitudes.',
  };
}

function experimentSolar() {
  return {
    id: 'E5_solar_filing_ar4524_ar4530',
    title: 'AR4524 · AR4530 generative wet-lab anchors',
    solAlpha: SOLAR_FILING.solAlpha,
    solBeta: SOLAR_FILING.solBeta,
    pass:
      SOLAR_FILING.solAlpha === 'AR4524' && SOLAR_FILING.solBeta === 'AR4530',
    interpretation: 'Sol-Alpha / Sol-Beta locked for telemetry filing.',
    honesty: 'Filing characters — not derivation of constants from sunspots.',
  };
}

function experimentCodataContrast() {
  // Catalog leaf names only — values cited as external rails, not derived
  const leaves = ['h', 'c', 'nu_HI', 'PHI_EGS', 'prime_vaults'];
  return {
    id: 'E6_metrology_leaves_not_derived',
    title: 'Metrology leaves filed — CODATA not retired',
    leaves,
    pass: leaves.includes('h') && leaves.includes('PHI_EGS') && leaves.length === 5,
    interpretation: 'Generative matrix organises names; measurement stays external.',
    honesty: 'Explicit refusal to bypass laboratory metrology.',
  };
}

function experimentPaperPresent() {
  const local = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const mono = path.join(MONOREPO_DOCS, PAPER_NAME);
  const ok =
    fs.existsSync(local) &&
    fs.existsSync(mono) &&
    fs.readFileSync(mono, 'utf8').includes('Honesty boundary') &&
    fs.readFileSync(mono, 'utf8').includes(DOC_ID);
  return {
    id: 'E7_paper_present',
    title: 'Paper present with Document ID + honesty',
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
    id: 'E8_ship_blog',
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
    experimentLadder(),
    experimentSolar(),
    experimentCodataContrast(),
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
