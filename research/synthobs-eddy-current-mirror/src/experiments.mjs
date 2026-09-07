/**
 * Eddy-Current Mirror — catalog suite.
 * Replayable algebraic / analogy locks — not mind→mass QED.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  C_LIGHT,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  SOLAR_FILING,
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
    interpretation: 'Golden key for octave ideation scaling.',
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
    interpretation: 'Golden-key identity for transduction scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentCLightFixture() {
  return {
    id: 'E3_c_light_fixture',
    title: 'c SI fixture (transduction line label)',
    C_LIGHT,
    pass: C_LIGHT === 299792458,
    interpretation: 'c filed as terminal damping / transduction constant in catalog.',
    honesty: 'Uses CODATA SI value — does not redefine measured c.',
  };
}

function experimentIdeationOctaveSum() {
  let sum = 0;
  for (let n = 0; n < 8; n++) sum += PHI_EGS ** -n;
  const closed = (1 - PHI_EGS ** -8) / (1 - 1 / PHI_EGS);
  return {
    id: 'E4_ideation_octave_sum',
    title: 'Σ Φ^{-n} finite octave sum',
    sum,
    closed,
    pass: Math.abs(sum - closed) < 1e-12 && sum > 1,
    interpretation: 'Truncated infinite-octave ideation field amplitude fixture.',
    honesty: 'Geometric series algebra — not measured thought potential.',
  };
}

function experimentEddyDampingSign() {
  const velocity = 15;
  const conductivity = 5.8e7;
  const damping = conductivity * (SOLAR_FILING.sunspotR / 70) * 1e-9;
  const force = -damping * velocity;
  return {
    id: 'E5_eddy_damping_opposes_velocity',
    title: 'Eddy damping force opposes velocity (Lenz rhyme)',
    velocity,
    force,
    pass: force < 0 && Math.abs(force + damping * velocity) < 1e-12,
    interpretation: 'Self-observation drag analogy: braking ∝ −v.',
    honesty: 'Analogy fixture — not lab magnet-pipe measurement in this suite.',
  };
}

function experimentMassCondensationAlgebra() {
  // Discrete stand-in: m = |Σ grad| / c²
  const grad = [1e6, -2e6, 3e6, -1e6];
  const mass = Math.abs(grad.reduce((a, b) => a + b, 0)) / C_LIGHT ** 2;
  return {
    id: 'E6_mass_condensation_algebra',
    title: 'm = |Σ ∇Ψ| / c² fixture',
    mass,
    pass: mass > 0 && Number.isFinite(mass) && mass < 1e-10,
    interpretation: 'Catalog form of transduction mass condensation.',
    honesty: 'Algebra only — not derived rest-mass of consciousness.',
  };
}

function experimentSolarFiling() {
  return {
    id: 'E7_solar_filing_anchors',
    title: 'R=70 · Sunspot 4524 · C9 filing',
    ...SOLAR_FILING,
    pass:
      SOLAR_FILING.sunspotR === 70 &&
      SOLAR_FILING.sunspotLabel === '4524' &&
      SOLAR_FILING.fluxClass === 'C9',
    interpretation: 'Ambient solar telemetry filed as characters for this ship date.',
    honesty: 'Filing labels — not NOAA causation of mass or ideation.',
  };
}

function experimentSiblingAndDocs() {
  const main = path.join(MONOREPO_DOCS, PAPER_NAME);
  const suite = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const sibling = path.join(PKG_ROOT, '..', '..', KINEMATIC_SIBLING);
  const py = path.join(PKG_ROOT, 'reference', 'egs_transduction_engine.py');
  const ok =
    fs.existsSync(main) &&
    fs.existsSync(suite) &&
    fs.existsSync(sibling) &&
    fs.existsSync(py) &&
    fs.existsSync(MONOREPO_BLOG);
  return {
    id: 'E8_doc_blog_sibling_python',
    title: 'Paper · suite · ship blog · kinematic sibling · Python present',
    pass: ok,
    interpretation: 'Protocol surfaces and Truckee sibling linked.',
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
    main.includes('Lenz');
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
    experimentCLightFixture(),
    experimentIdeationOctaveSum(),
    experimentEddyDampingSign(),
    experimentMassCondensationAlgebra(),
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
