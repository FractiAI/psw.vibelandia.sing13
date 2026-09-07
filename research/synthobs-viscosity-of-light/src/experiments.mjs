/**
 * Viscosity of Light — catalog suite.
 * Replayable algebraic / Soft Story locks — not relativity QED.
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
  EDDY_SIBLING,
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
    interpretation: 'Golden key for cognitive octave scaling.',
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
    interpretation: 'Golden-key identity for drag scale ladders.',
    honesty: 'Algebra of Φ — replayable fixture.',
  };
}

function experimentCLightFixture() {
  return {
    id: 'E3_c_light_fixture',
    title: 'c SI fixture (frictional floor label)',
    C_LIGHT,
    pass: C_LIGHT === 299792458,
    interpretation: 'c filed as frictional drag floor in catalog.',
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
    interpretation: 'Truncated non-local cognitive field amplitude fixture.',
    honesty: 'Geometric series algebra — not measured thought potential.',
  };
}

function experimentViscousDrag() {
  const v = C_LIGHT * 0.5;
  const drag = (v / C_LIGHT) * (1 / PHI_EGS);
  const atC = (C_LIGHT / C_LIGHT) * (1 / PHI_EGS);
  return {
    id: 'E5_viscous_drag_coefficient',
    title: 'D_visc(v) = (v/c) · Φ^{-1}',
    v,
    drag,
    atC,
    pass:
      Math.abs(drag - 0.5 / PHI_EGS) < 1e-12 &&
      Math.abs(atC - 1 / PHI_EGS) < 1e-12 &&
      drag < atC,
    interpretation: 'Frictional drag rises toward material clock saturation at v→c.',
    honesty: 'Catalog coefficient — not measured optical viscosity.',
  };
}

function experimentStationaryImmersion() {
  // At v→0, drag→0: deeper wave-clock immersion (Truckee stationary rhyme)
  const drag0 = (0 / C_LIGHT) * (1 / PHI_EGS);
  return {
    id: 'E6_stationary_immersion',
    title: 'v→0 → drag→0 (wave-clock immersion)',
    drag0,
    pass: drag0 === 0,
    interpretation: 'Stationary mode maximizes spatial detail / minimizes frictional slice.',
    honesty: 'Kinematic Soft Story rhyme — not psychophysics QED.',
  };
}

function experimentSolarFiling() {
  return {
    id: 'E7_solar_filing_anchors',
    title: 'R≈90.9 · AR14524 · AR14527 filing',
    ...SOLAR_FILING,
    pass:
      SOLAR_FILING.sunspotR === 90.9 &&
      SOLAR_FILING.regions[0] === 'AR14524' &&
      SOLAR_FILING.regions[1] === 'AR14527',
    interpretation: 'Ambient solar telemetry filed as characters for this ship date.',
    honesty: 'Filing labels — not NOAA causation of cognitive drag.',
  };
}

function experimentSiblingAndDocs() {
  const main = path.join(MONOREPO_DOCS, PAPER_NAME);
  const suite = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const eddy = path.join(PKG_ROOT, '..', '..', EDDY_SIBLING);
  const kin = path.join(PKG_ROOT, '..', '..', KINEMATIC_SIBLING);
  const py = path.join(PKG_ROOT, 'reference', 'egs_viscosity_of_light_engine.py');
  const ok =
    fs.existsSync(main) &&
    fs.existsSync(suite) &&
    fs.existsSync(eddy) &&
    fs.existsSync(kin) &&
    fs.existsSync(py) &&
    fs.existsSync(MONOREPO_BLOG);
  return {
    id: 'E8_doc_blog_sibling_python',
    title: 'Paper · suite · ship blog · eddy/kinematic siblings · Python present',
    pass: ok,
    interpretation: 'Protocol surfaces and transduction / Truckee siblings linked.',
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
    main.includes('viscosity') &&
    main.includes('frictional');
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
    experimentViscousDrag(),
    experimentStationaryImmersion(),
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
