/**
 * Kinematic Set-Recycling · Truckee — catalog suite.
 * Replayable algebraic / filing locks — not psychophysics QED.
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
  VELOCITY_MODES,
  SOLAR_FILING,
  CORRIDOR,
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
    interpretation: 'Golden key for velocity-octave harmonic intervals.',
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
    interpretation: 'Golden-key identity for set-recycling scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentVelocityModes() {
  const { stationary, pedestrian, cyclist } = VELOCITY_MODES;
  const ordered = stationary < pedestrian && pedestrian < cyclist;
  return {
    id: 'E3_velocity_modes',
    title: 'Stationary < pedestrian < cyclist velocity modes',
    modes: { ...VELOCITY_MODES },
    pass: ordered && stationary === 0 && pedestrian === 5 && cyclist === 20,
    interpretation: 'Three catalog octave-shift states along the corridor.',
    honesty: 'Field-grammar labels — not instrumented trials.',
  };
}

function experimentFourierScale() {
  // Catalog identity: spectrum argument scales as ω/v ; amplitude factor 1/|v|
  const v = VELOCITY_MODES.cyclist;
  const omega = 10;
  const scaleArg = omega / v;
  const amp = 1 / Math.abs(v);
  return {
    id: 'E4_fourier_velocity_scale',
    title: 'ℱ scale: arg ω/v · amplitude 1/|v|',
    v,
    omega,
    scaleArg,
    amp,
    pass: Math.abs(scaleArg - 0.5) < 1e-12 && Math.abs(amp - 0.05) < 1e-12,
    interpretation: 'Higher speed compresses spatial-frequency sampling (catalog).',
    honesty: 'Algebra fixture — not measured cortical spectra.',
  };
}

function experimentTheaterIntegralRhetoric() {
  // Discrete stand-in: sum Φ/v over velocity samples → finite; continuous rhetoric → ∞
  const vs = [5, 10, 15, 20, 25];
  const sum = vs.reduce((a, v) => a + PHI_EGS / v, 0);
  return {
    id: 'E5_theater_integral_fixture',
    title: 'Σ (Φ/v) over velocity samples is finite & positive',
    vs,
    sum,
    pass: sum > 0 && Number.isFinite(sum),
    interpretation: 'Discrete fixture for T_perceived rhetoric; continuous integral → ∞ is grammar.',
    honesty: 'Not a proof of infinite XR assets.',
  };
}

function experimentCorridorFiling() {
  return {
    id: 'E6_truckee_corridor_filing',
    title: 'Truckee River corridor · Downtown Reno filing',
    corridor: CORRIDOR,
    pass:
      CORRIDOR.name === 'Truckee River corridor' &&
      CORRIDOR.city === 'Downtown Reno',
    interpretation: 'Physical set label for kinematic recycling observations.',
    honesty: 'Place filing — not a GIS survey product.',
  };
}

function experimentSolarFiling() {
  const regions = SOLAR_FILING.activeRegions.map((r) => r.ar);
  return {
    id: 'E7_solar_filing_anchors',
    title: 'R≈90.9 · AR14524 · AR14527 filing anchors',
    sunspotR: SOLAR_FILING.sunspotR,
    regions,
    pass:
      Math.abs(SOLAR_FILING.sunspotR - 90.9) < 1e-9 &&
      regions.includes('AR14524') &&
      regions.includes('AR14527') &&
      regions.length === 2,
    interpretation: 'Ambient solar telemetry filed as characters for this ship date.',
    honesty: 'Filing labels — not NOAA causation of perception.',
  };
}

function experimentDocPresence() {
  const main = path.join(MONOREPO_DOCS, PAPER_NAME);
  const suite = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const ok = fs.existsSync(main) && fs.existsSync(suite) && fs.existsSync(MONOREPO_BLOG);
  return {
    id: 'E8_doc_and_blog_presence',
    title: 'Paper · suite mirror · ship blog present',
    main,
    suite,
    blog: MONOREPO_BLOG,
    pass: ok,
    interpretation: 'Protocol surfaces exist for kinematic set-recycling.',
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
    main.includes('Fair Exchange');
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
    experimentVelocityModes(),
    experimentFourierScale(),
    experimentTheaterIntegralRhetoric(),
    experimentCorridorFiling(),
    experimentSolarFiling(),
    experimentDocPresence(),
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
