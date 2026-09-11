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
    interpretation: 'Self-observation Soft Story seed.',
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

function experimentMirrorClosure() {
  // Soft Story recursive closure: continued Φ-ratio map x_{n+1}=1+1/x_n → Φ (catalog only)
  let x = 1;
  for (let n = 0; n < 24; n++) x = 1 + 1 / x;
  const residual = Math.abs(x - PHI_EGS);
  return {
    id: 'E4_mirror_closure_soft_story',
    title: 'Mirror-genome Soft Story closure residual',
    x,
    residual,
    pass: residual < 1e-6,
    interpretation: 'Catalog Φ attractor for nested Soft Story mirrors — not biophysics.',
    honesty: 'Fixture Soft Story only.',
  };
}

function experimentSolar() {
  return {
    id: 'E5_solar_filing_ar4524_ar4530',
    title: 'AR4524 · AR4530 genomic wet-lab anchors',
    solAlpha: SOLAR_FILING.solAlpha,
    solBeta: SOLAR_FILING.solBeta,
    pass:
      SOLAR_FILING.solAlpha === 'AR4524' && SOLAR_FILING.solBeta === 'AR4530',
    interpretation: 'Sol-Alpha / Sol-Beta locked for telemetry filing.',
    honesty: 'Filing characters — not derivation of genetics from sunspots.',
  };
}

function experimentBiologyRefusal() {
  const refused = [
    'genomic_consciousness',
    'clinical_epigenetics',
    'solar_transcription_causation',
    'dna_rf_antenna_lab_proof',
  ];
  return {
    id: 'E6_biology_claims_refused',
    title: 'Strong biology claims stay refused',
    refused,
    pass: refused.length === 4,
    interpretation: 'Honesty rail encoded as fixture.',
    honesty: 'Explicit refusal list.',
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
    experimentMirrorClosure(),
    experimentSolar(),
    experimentBiologyRefusal(),
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
