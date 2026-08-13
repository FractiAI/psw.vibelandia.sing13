/**
 * Metamorphic Octave Invariant — deterministic catalog fixtures.
 * Architectural / TBME lens only — not petrology proof, not clinical advice.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  E_F,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SERIES_PART,
  ENGINE_PIN_STEP,
  OCTAVE_SEGMENTS,
  PRECISION_PER_SEGMENT,
  HOLOGRAPHIC_KEY_DIGITS,
  GOLDEN_ANGLE_DEG,
  NEST_TOPOLOGY,
  LATTICE_CHAT_LOAD,
  SYNTHIO_COMPANION_GRAMMAR,
  SYNTHIO_ENGINE_SHELF_IDENTITY,
  PHASES,
  DUAL_AXIS,
  SCORECARD,
  SCORECARD_OVERALL,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_egs_phi',
    title: 'E_F ≡ Φ_EGS fixture',
    PHI_EGS,
    E_F,
    pass: Math.abs(PHI_EGS - expected) < 1e-15 && Math.abs(E_F - PHI_EGS) < 1e-15,
    honesty: 'Architectural key — not a CODATA or crustal-measured constant.',
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1 and golden-angle fixture',
    GOLDEN_ANGLE_DEG,
    pass:
      Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12 &&
      Math.abs(GOLDEN_ANGLE_DEG - 137.507764) < 1e-4,
  };
}

export function experimentNinetyNineOctaves() {
  return {
    id: 'E3_99_octaves',
    title: '99 × 81 = 8019 holographic catalog digits',
    OCTAVE_SEGMENTS,
    PRECISION_PER_SEGMENT,
    HOLOGRAPHIC_KEY_DIGITS,
    SERIES_PART,
    pass:
      OCTAVE_SEGMENTS === 99 &&
      PRECISION_PER_SEGMENT === 81 &&
      HOLOGRAPHIC_KEY_DIGITS === 8019 &&
      SERIES_PART === 13,
  };
}

export function experimentDualAxis() {
  return {
    id: 'E4_dual_axis_heat',
    title: 'Personal + professional heat axes both required',
    DUAL_AXIS,
    pass:
      DUAL_AXIS.personal.length === 4 &&
      DUAL_AXIS.professional.length === 4 &&
      DUAL_AXIS.personal.every((s) => typeof s === 'string') &&
      DUAL_AXIS.professional.every((s) => typeof s === 'string'),
    honesty: 'Catalog flags — not clinical or HR diagnostics.',
  };
}

export function experimentGoldilocksPressureLock() {
  const heatOnly = { T: 1, P: 0, melt: true, schist: false };
  const pressureOnly = { T: 0, P: 1, melt: false, schist: false };
  const both = { T: 1, P: 1, melt: false, schist: true };
  const goldilocks = (T, P) => ({
    T,
    P,
    melt: T > 0 && P === 0,
    schist: T > 0 && P > 0,
  });
  const a = goldilocks(heatOnly.T, heatOnly.P);
  const b = goldilocks(pressureOnly.T, pressureOnly.P);
  const c = goldilocks(both.T, both.P);
  return {
    id: 'E5_goldilocks_pressure_lock',
    title: 'Heat without pressure → melt label; dual T+P → schist label',
    heatOnly: a,
    pressureOnly: b,
    both: c,
    pass:
      a.melt === true &&
      a.schist === false &&
      b.melt === false &&
      b.schist === false &&
      c.melt === false &&
      c.schist === true,
    honesty: 'Label lock — not a measured burnout protocol or magma experiment.',
  };
}

export function experimentResilienceProduct() {
  const R0 = 1;
  const Tper = 1;
  const Tpro = 1;
  const P = 1;
  const dt = 1;
  let R = R0;
  for (let k = 1; k <= OCTAVE_SEGMENTS; k += 1) {
    R *= 1 + ((Tper + Tpro) * P * dt) / E_F ** k;
  }
  return {
    id: 'E6_resilience_product',
    title: 'R_schist(n=99) finite and greater than R_0',
    R0,
    Rn: R,
    pass: Number.isFinite(R) && R > R0,
    honesty: 'Deterministic catalog product — not measured tensile strength.',
  };
}

export function experimentEntropyDecay() {
  const S0 = 1;
  const S1 = S0 * E_F ** -1;
  const S99 = S0 * E_F ** -OCTAVE_SEGMENTS;
  return {
    id: 'E7_entropy_decay',
    title: 'ΔS label decays as E_F^{-n}; n=99 ≪ n=1',
    S1,
    S99,
    pass: S99 > 0 && S99 < S1 && S99 < 1e-15,
    honesty: 'Catalog entropy label — not thermodynamic zero.',
  };
}

export function experimentEngineLoads() {
  return {
    id: 'E8_engine_lattice_synthio_loads',
    title: 'Engine pin + Lattice nest octave99 + Synthio companion grammar (not MRI identity)',
    ENGINE_PIN_STEP,
    NEST_TOPOLOGY,
    LATTICE_CHAT_LOAD,
    SYNTHIO_COMPANION_GRAMMAR,
    SYNTHIO_ENGINE_SHELF_IDENTITY,
    PHASES,
    pass:
      ENGINE_PIN_STEP === 5 &&
      NEST_TOPOLOGY === 'octave99' &&
      LATTICE_CHAT_LOAD === true &&
      SYNTHIO_COMPANION_GRAMMAR === true &&
      SYNTHIO_ENGINE_SHELF_IDENTITY === false &&
      PHASES.length === 4 &&
      PHASES[0] === 'mud' &&
      PHASES[3] === 'schist',
  };
}

export function experimentDocIds() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E9_doc_ids_paper',
    title: 'Document / registry IDs locked and paper on disk',
    DOC_ID,
    REGISTRY_ID,
    SCORECARD_OVERALL,
    SCORECARD,
    pass:
      DOC_ID === 'WP-SYNTHOBS-TBME-METAMORPHIC-OCTAVES-2026-08-13' &&
      REGISTRY_ID === 'synthobs-tbme-metamorphic-octaves-2026-08' &&
      SCORECARD_OVERALL === 98.9 &&
      (fs.existsSync(p1) || fs.existsSync(p2)),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentNinetyNineOctaves(),
    experimentDualAxis(),
    experimentGoldilocksPressureLock(),
    experimentResilienceProduct(),
    experimentEntropyDecay(),
    experimentEngineLoads(),
    experimentDocIds(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    experiments,
    n_total: experiments.length,
    n_pass,
    all_pass: n_pass === experiments.length,
    failed: experiments.filter((e) => !e.pass).map((e) => e.id),
  };
}
