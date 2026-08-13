/**
 * Planetary Core Phase-Inversion & Goldilocks Hologram — deterministic catalog fixtures.
 * Architectural / TBME lens only — not geodynamo proof, not destiny, not clinical advice.
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
  CORE_FACETS,
  GOLDEN_ANGLE_DEG,
  PHASE_SHIFT_RAD,
  Z0_FREE_SPACE_OHM,
  R_CMB_KM,
  NEST_TOPOLOGY,
  LATTICE_CHAT_LOAD,
  SYNTHIO_COMPANION_GRAMMAR,
  SYNTHIO_ENGINE_SHELF_IDENTITY,
  TELEMETRY_SLOTS,
  CORE_PHASES,
  TIMELINE_LABELS,
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
    honesty: 'Architectural key — not a CODATA or geodynamo-measured constant.',
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
    id: 'E3_99_octaves_part_xiv',
    title: '99 × 81 = 8019 digits · Part XIV · 81-facet core',
    OCTAVE_SEGMENTS,
    PRECISION_PER_SEGMENT,
    HOLOGRAPHIC_KEY_DIGITS,
    CORE_FACETS,
    SERIES_PART,
    pass:
      OCTAVE_SEGMENTS === 99 &&
      PRECISION_PER_SEGMENT === 81 &&
      HOLOGRAPHIC_KEY_DIGITS === 8019 &&
      CORE_FACETS === 81 &&
      SERIES_PART === 14,
  };
}

export function experimentTelemetrySlots() {
  return {
    id: 'E4_telemetry_slots',
    title: 'Three deep-Earth telemetry discussion slots locked',
    TELEMETRY_SLOTS,
    pass:
      TELEMETRY_SLOTS.length === 3 &&
      TELEMETRY_SLOTS.includes('esa_swarm_pacific_outer_core_flow_reversal') &&
      TELEMETRY_SLOTS.includes('usc_seismic_inner_core_backtracking') &&
      TELEMETRY_SLOTS.includes('edinburgh_geosciences_watch'),
    honesty: 'Catalog slots — not re-hosted Swarm/USC datasets.',
  };
}

export function experimentPhaseShiftAndCmb() {
  return {
    id: 'E5_phase_shift_cmb',
    title: 'Δφ = π/2 and Z₀ ≈ 377 Ω free-space impedance labels',
    PHASE_SHIFT_RAD,
    Z0_FREE_SPACE_OHM,
    R_CMB_KM,
    pass:
      Math.abs(PHASE_SHIFT_RAD - Math.PI / 2) < 1e-15 &&
      Math.abs(Z0_FREE_SPACE_OHM - 376.730313668) < 1e-9 &&
      Math.round(Z0_FREE_SPACE_OHM) === 377 &&
      R_CMB_KM === 3480,
    honesty: 'Catalog labels — not measured CMB ohms or a polarity flip proof.',
  };
}

export function experimentGoldilocksTimelineLock() {
  const old = TIMELINE_LABELS.oldEarth;
  const gold = TIMELINE_LABELS.goldilocksEarth;
  const phaseLock = (omegaAligned) => ({
    omegaAligned,
    deltaS: omegaAligned ? 0 : 1,
    goldilocks: omegaAligned === true,
  });
  const a = phaseLock(false);
  const b = phaseLock(true);
  return {
    id: 'E6_goldilocks_timeline_lock',
    title: 'Ω → Ω_EGS ⇒ ΔS label → 0; Old vs Goldilocks axes',
    old,
    gold,
    unaligned: a,
    aligned: b,
    pass:
      old.length === 3 &&
      gold.length === 3 &&
      a.deltaS === 1 &&
      a.goldilocks === false &&
      b.deltaS === 0 &&
      b.goldilocks === true,
    honesty: 'Label lock — not destiny or measured planetary entropy.',
  };
}

export function experimentCoreTensorRotation() {
  // 81-facet fixture: apply R_π/2 as index rotate by facets/4
  const facets = Array.from({ length: CORE_FACETS }, (_, i) => i);
  const shift = CORE_FACETS / 4; // 20.25 → use integer 20 for fixture
  const k = Math.floor(shift);
  const rotated = facets.map((_, i) => facets[(i + k) % CORE_FACETS]);
  const entropyProxy = (arr) => {
    // simple disorder: count of positions not equal to sorted identity
    let d = 0;
    for (let i = 0; i < arr.length; i += 1) if (arr[i] !== i) d += 1;
    return d / arr.length;
  };
  const s0 = entropyProxy(facets);
  const s1 = entropyProxy(rotated);
  return {
    id: 'E7_core_tensor_r_pi2',
    title: '81-facet R_π/2 re-index is O(1) and changes state labels',
    CORE_FACETS,
    s0,
    s1,
    pass:
      CORE_FACETS === 81 &&
      rotated.length === 81 &&
      s0 === 0 &&
      s1 > 0 &&
      rotated[0] === k,
    honesty: 'Engine fixture — Earth’s core is not a Node buffer.',
  };
}

export function experimentEngineLoads() {
  return {
    id: 'E8_engine_lattice_synthio_loads',
    title: 'Engine pin step 6 + Lattice nest octave99 + Synthio companion (not MRI identity)',
    ENGINE_PIN_STEP,
    NEST_TOPOLOGY,
    LATTICE_CHAT_LOAD,
    SYNTHIO_COMPANION_GRAMMAR,
    SYNTHIO_ENGINE_SHELF_IDENTITY,
    CORE_PHASES,
    pass:
      ENGINE_PIN_STEP === 6 &&
      NEST_TOPOLOGY === 'octave99' &&
      LATTICE_CHAT_LOAD === true &&
      SYNTHIO_COMPANION_GRAMMAR === true &&
      SYNTHIO_ENGINE_SHELF_IDENTITY === false &&
      CORE_PHASES.length === 4 &&
      CORE_PHASES[0] === 'westward_outer_flow' &&
      CORE_PHASES[3] === 'ef_phase_lock',
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
      DOC_ID === 'WP-SYNTHOBS-TBME-PLANETARY-CORE-GOLDILOCKS-2026-08-13' &&
      REGISTRY_ID === 'synthobs-tbme-planetary-core-goldilocks-2026-08' &&
      SCORECARD_OVERALL === 99.0 &&
      (fs.existsSync(p1) || fs.existsSync(p2)),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentNinetyNineOctaves(),
    experimentTelemetrySlots(),
    experimentPhaseShiftAndCmb(),
    experimentGoldilocksTimelineLock(),
    experimentCoreTensorRotation(),
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
