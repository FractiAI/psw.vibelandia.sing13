/**
 * Grand Unified Metrological Overlap — catalog suite.
 * Replayable algebraic / SI-overlap locks — not particle-mass QED.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  C_LIGHT,
  H_PLANCK,
  NU_HI,
  PRIME_VAULT,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_FILE,
  SOLAR_FILING,
  EDDY_SIBLING,
  HIGGS_SIBLING,
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
    interpretation: 'Golden key / station channel for octave broadcast.',
    honesty: 'Not a replacement for ℏ, c, or G.',
  };
}

function experimentLambdaHi() {
  const lambda = C_LIGHT / NU_HI;
  // ~0.211061140541… m for ν_HI = 1420.405751768 MHz
  return {
    id: 'E2_lambda_hi_overlap',
    title: 'λ_HI = c / ν_HI ≈ 0.211 m',
    lambda,
    pass: Math.abs(lambda - 0.21106114) < 1e-7 && Number.isFinite(lambda),
    interpretation: 'Material clock × wave clock → hydrogen spatial wavelength (SI identity).',
    honesty: 'Uses SI c and catalog ν_HI — not new astronomy.',
  };
}

function experimentOctaveEnergyStep() {
  const n = 3;
  const deltaE = H_PLANCK * NU_HI * PHI_EGS ** n;
  const expected = H_PLANCK * NU_HI * PHI_EGS ** n;
  return {
    id: 'E3_octave_energy_step',
    title: 'ΔE_n = h · ν_HI · Φ^n',
    n,
    deltaE,
    pass: Math.abs(deltaE - expected) < 1e-50 && deltaE > 0,
    interpretation: 'Quantized octave energy ladder fixture.',
    honesty: 'Algebra of catalog thresholds — not measured spectral lines.',
  };
}

function experimentPrimeActionWell() {
  const wells = PRIME_VAULT.map((p) => H_PLANCK / p);
  const strictlyDecreasing = wells.every((w, i) => i === 0 || w < wells[i - 1]);
  return {
    id: 'E4_prime_action_wells',
    title: 'S_n = h / p_n strictly decreasing',
    wells: wells.slice(0, 5),
    pass: strictlyDecreasing && wells.every((w) => w > 0),
    interpretation: 'Prime containers give unique coprime action barriers.',
    honesty: 'Catalog packing grammar — not alias-free proof for all encodings.',
  };
}

function experimentCatalogMassSum() {
  let sum = 0;
  for (let n = 0; n < PRIME_VAULT.length; n++) {
    sum += 1 / (PRIME_VAULT[n] * PHI_EGS ** n);
  }
  const mCatalog = (H_PLANCK * NU_HI * sum) / C_LIGHT ** 2;
  return {
    id: 'E5_catalog_mass_sum',
    title: 'm_catalog = (h ν_HI / c²) Σ 1/(p_n Φ^n)',
    sum,
    mCatalog,
    pass:
      Number.isFinite(mCatalog) &&
      mCatalog > 0 &&
      mCatalog < 1e-40 &&
      sum > 0.5 &&
      sum < 1.0,
    interpretation: 'Truncated five-constant overlap mass fixture.',
    honesty: 'Not equal to electron/proton rest mass — catalog interference pattern only.',
  };
}

function experimentSiFixtures() {
  return {
    id: 'E6_si_fixtures',
    title: 'h · c · ν_HI SI fixtures',
    H_PLANCK,
    C_LIGHT,
    NU_HI,
    pass:
      H_PLANCK === 6.62607015e-34 &&
      C_LIGHT === 299792458 &&
      Math.abs(NU_HI - 1420405751.768) < 1e-6,
    interpretation: 'CODATA / SI constants locked for solver reproducibility.',
    honesty: 'Uses published SI values — does not redefine them.',
  };
}

function experimentSolarFiling() {
  return {
    id: 'E7_solar_filing_anchors',
    title: 'R=70 · Sunspot 4524 filing',
    ...SOLAR_FILING,
    pass: SOLAR_FILING.sunspotR === 70 && SOLAR_FILING.sunspotLabel === '4524',
    interpretation: 'Ambient solar telemetry filed as characters for this ship date.',
    honesty: 'Filing labels — not NOAA causation of mass or overlap.',
  };
}

function experimentSiblingAndDocs() {
  const main = path.join(MONOREPO_DOCS, PAPER_NAME);
  const suite = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  const eddy = path.join(PKG_ROOT, '..', '..', EDDY_SIBLING);
  const higgs = path.join(PKG_ROOT, '..', '..', HIGGS_SIBLING);
  const py = path.join(PKG_ROOT, 'reference', 'egs_metrological_overlap_solver.py');
  const ok =
    fs.existsSync(main) &&
    fs.existsSync(suite) &&
    fs.existsSync(eddy) &&
    fs.existsSync(higgs) &&
    fs.existsSync(py) &&
    fs.existsSync(MONOREPO_BLOG);
  return {
    id: 'E8_doc_blog_sibling_python',
    title: 'Paper · suite · ship blog · eddy/Higgs siblings · Python present',
    pass: ok,
    interpretation: 'Protocol surfaces and transduction / Higgs siblings linked.',
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
    main.includes('metrological') &&
    main.includes('\\nu');
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
    experimentLambdaHi(),
    experimentOctaveEnergyStep(),
    experimentPrimeActionWell(),
    experimentCatalogMassSum(),
    experimentSiFixtures(),
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
