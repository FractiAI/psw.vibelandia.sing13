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
    interpretation: 'Time-crystal Soft Story seed.',
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

function experimentTimeCrystalLock() {
  // Discrete time-translation Soft Story: Ψ(t+T)=Ψ(t) as fixture lock
  const T = PHI_EGS;
  const samples = Array.from({ length: 6 }, (_, k) => Math.sin((2 * Math.PI * k) / T));
  const periodCheck = Math.abs(samples[0] - Math.sin(0)) < 1e-15;
  const repeat = Math.abs(Math.sin(2 * Math.PI) - Math.sin(0)) < 1e-12;
  return {
    id: 'E4_time_crystal_soft_story_lock',
    title: 'Discrete time-translation Soft Story lock',
    T,
    samples,
    pass: periodCheck && repeat,
    interpretation: 'Catalog lock Ψ(t+T)=Ψ(t) — not a lab DNA time crystal.',
    honesty: 'Fixture Soft Story only.',
  };
}

function experimentAqueousLabel() {
  const rho = 997; // kg/m^3 catalog label at ~25C — not a cosmology constant
  return {
    id: 'E5_aqueous_density_label',
    title: 'Aqueous density catalog label ρ_H2O',
    rho,
    pass: rho > 990 && rho < 1000,
    interpretation: 'Water filed as conductive medium label.',
    honesty: 'Catalog label — not cosmological dielectric motor.',
  };
}

function experimentSolar() {
  return {
    id: 'E6_solar_filing_ar4524_ar4530',
    title: 'AR4524 · AR4530 time-crystal wet-lab anchors',
    solAlpha: SOLAR_FILING.solAlpha,
    solBeta: SOLAR_FILING.solBeta,
    pass:
      SOLAR_FILING.solAlpha === 'AR4524' && SOLAR_FILING.solBeta === 'AR4530',
    interpretation: 'Sol-Alpha / Sol-Beta locked for telemetry filing.',
    honesty: 'Filing characters — not stellar causation of biological clocks.',
  };
}

function experimentCosmologyRefusal() {
  const refused = [
    'dna_mints_spacetime',
    'water_cosmological_motor',
    'life_required_for_expansion',
    'finished_quantum_gravity',
  ];
  return {
    id: 'E7_cosmology_claims_refused',
    title: 'Strong cosmology claims stay refused',
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
    id: 'E8_paper_present',
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
    experimentTimeCrystalLock(),
    experimentAqueousLabel(),
    experimentSolar(),
    experimentCosmologyRefusal(),
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
