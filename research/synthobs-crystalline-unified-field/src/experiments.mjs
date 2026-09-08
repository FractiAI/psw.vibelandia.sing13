/**
 * Crystalline Unified Field — catalog suite.
 * Replayable algebraic / Soft Story locks — not spacetime QED.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  K_BOLTZMANN,
  LN2,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  SOLAR_FILING,
  VISCOSITY_SIBLING,
  KINEMATIC_SIBLING,
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
    interpretation: 'Golden key for crystalline facet scaling.',
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
    interpretation: 'Golden-key identity for crystal octave ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentFacetIdentity() {
  const v = 20; // km/h catalog
  const t = 0.5; // h
  const d = v * t;
  const tau = d / v;
  return {
    id: 'E3_facet_identity_d_equals_vt',
    title: 'd = v·t  ↔  τ = d/v',
    v,
    t,
    d,
    tau,
    pass: Math.abs(d - 10) < 1e-12 && Math.abs(tau - t) < 1e-12,
    interpretation: 'Speed·distance·time are facets of one access crystal.',
    honesty: 'Classical identity as catalog lock — not relativity retirement.',
  };
}

function experimentCrystalOctaveSum() {
  let sum = 0;
  for (let n = 0; n < 8; n++) sum += PHI_EGS ** -n;
  const closed = (1 - PHI_EGS ** -8) / (1 - 1 / PHI_EGS);
  return {
    id: 'E4_crystal_octave_sum',
    title: 'Σ Φ^{-n} crystal amplitude',
    sum,
    closed,
    pass: Math.abs(sum - closed) < 1e-12 && sum > 1,
    interpretation: 'Truncated Φ-recursive crystal amplitude fixture.',
    honesty: 'Geometric series algebra — not measured spacetime potential.',
  };
}

function experimentLandauerGrain() {
  const T = 300;
  const eLand = K_BOLTZMANN * T * LN2;
  const expected = 1.380649e-23 * 300 * Math.LN2;
  return {
    id: 'E5_landauer_grain',
    title: 'E_Land = k_B T ln 2 (T=300 K)',
    T,
    eLand,
    expected,
    pass: Math.abs(eLand - expected) < 1e-30 && eLand > 0,
    interpretation: 'Thermodynamic grain of irreversible update — literature rail.',
    honesty: 'CODATA k_B filing — does not re-derive Landauer from this suite.',
  };
}

function experimentAccessCrystalScore() {
  const d = 10;
  const velocities = [5, 20, 40];
  const taus = velocities.map((v) => d / v);
  const score =
    (1 / PHI_EGS) * taus.reduce((acc, tau) => acc + 1 / (1 + tau), 0);
  const scoreFast =
    (1 / PHI_EGS) * (1 / (1 + d / 40) + 1 / (1 + d / 20) + 1 / (1 + d / 5));
  return {
    id: 'E6_access_crystal_score',
    title: 'CrystalScore = Φ^{-1} Σ 1/(1+τ_i)',
    d,
    velocities,
    taus,
    score,
    pass: Math.abs(score - scoreFast) < 1e-12 && score > 0 && taus[0] > taus[2],
    interpretation: 'Higher access velocity lowers τ and raises crystal score.',
    honesty: 'Catalog score — not measured cognitive throughput.',
  };
}

function experimentSolarFiling() {
  return {
    id: 'E7_solar_filing_anchor',
    title: 'R≈90.9 solar filing',
    ...SOLAR_FILING,
    pass: SOLAR_FILING.sunspotR === 90.9,
    interpretation: 'Ambient solar telemetry filed as character for this ship date.',
    honesty: 'Filing label — not NOAA causation of spacetime crystal.',
  };
}

function experimentSiblingAndDocs() {
  const main = path.join(MONOREPO_DOCS, PAPER_NAME);
  const suite = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const visc = path.join(PKG_ROOT, '..', '..', VISCOSITY_SIBLING);
  const kin = path.join(PKG_ROOT, '..', '..', KINEMATIC_SIBLING);
  const py = path.join(PKG_ROOT, 'reference', 'egs_crystalline_unified_field_engine.py');
  const ok =
    fs.existsSync(main) &&
    fs.existsSync(suite) &&
    fs.existsSync(visc) &&
    fs.existsSync(kin) &&
    fs.existsSync(py) &&
    fs.existsSync(MONOREPO_BLOG);
  return {
    id: 'E8_doc_blog_sibling_python',
    title: 'Paper · suite · ship blog · viscosity/kinematic siblings · Python present',
    pass: ok,
    interpretation: 'Protocol surfaces and velocity/viscosity siblings linked.',
    honesty: 'Presence lock only.',
  };
}

function experimentProtocolHeaders() {
  const main = fs.readFileSync(path.join(MONOREPO_DOCS, PAPER_NAME), 'utf8');
  const pass =
    main.includes(DOC_ID) &&
    main.includes(REGISTRY_ID) &&
    main.includes('Honesty boundary') &&
    main.includes('SynthOBS Autonomous Agent') &&
    main.includes('Prudencio Mendez') &&
    main.includes('Fair Exchange') &&
    main.includes('crystalline') &&
    main.includes('Landauer');
  return {
    id: 'E9_protocol_headers',
    title: 'Document ID · Registry · Honesty · Operator · Author',
    pass,
    interpretation: 'PRA Snap structural headers present.',
    honesty: 'Structural lock — full PRA via npm run audit:paper.',
  };
}

export function runAllExperiments() {
  const experiments = [
    experimentPhiEgs(),
    experimentGoldenIdentity(),
    experimentFacetIdentity(),
    experimentCrystalOctaveSum(),
    experimentLandauerGrain(),
    experimentAccessCrystalScore(),
    experimentSolarFiling(),
    experimentSiblingAndDocs(),
    experimentProtocolHeaders(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    all_pass: n_pass === experiments.length,
    n_pass,
    n_total: experiments.length,
    experiments,
  };
}
