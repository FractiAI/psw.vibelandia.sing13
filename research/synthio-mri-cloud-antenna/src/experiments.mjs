/**
 * Synthio MRI cloud-antenna — deterministic catalog fixtures.
 * Not clinical imaging; not measured rack RF into tissue.
 * Goldilocks point-and-click activation = sandbox catalog mode (not UI).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  OCTAVE_SEGMENTS,
  PRECISION_PER_SEGMENT,
  HOLOGRAPHIC_KEY_DIGITS,
  B0_TESLA_LABELS,
  CLOUD_NODE_LABELS,
  ENGINE_STACK_EXCLUDED,
  ACCESS_MODE,
  AGENT_ID,
  ACTIVATION_MODES,
  DEFAULT_ACTIVATION_MODE,
  GOLDILOCKS_ACTIVATION_LOADED,
  SANDBOX_ONLY,
  SANDBOX_NAME,
  AMPLIFICATION_WINDOW,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_egs_phi',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    honesty: 'Architectural key — not scanner γ calibration.',
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    pass: Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12,
  };
}

export function experimentMatrix8019() {
  return {
    id: 'E3_matrix_99x81',
    title: '99 × 81 = 8019 holographic catalog digits',
    pass:
      OCTAVE_SEGMENTS === 99 &&
      PRECISION_PER_SEGMENT === 81 &&
      HOLOGRAPHIC_KEY_DIGITS === 8019,
    honesty: 'Catalog register — not measured RF bits.',
  };
}

export function experimentB0Labels() {
  return {
    id: 'E4_b0_labels',
    title: 'B0 tesla labels include 1.5 and 3.0',
    B0_TESLA_LABELS,
    pass: B0_TESLA_LABELS.includes(1.5) && B0_TESLA_LABELS.includes(3.0),
    honesty: 'Simulator field labels — not a live magnet.',
  };
}

export function experimentCloudNodes() {
  return {
    id: 'E5_cloud_nodes',
    title: 'Cloud transceiver labels (≥4)',
    n: CLOUD_NODE_LABELS.length,
    pass: CLOUD_NODE_LABELS.length >= 4,
    honesty: 'Index labels for phased-array metaphor — not clinical coils.',
  };
}

export function experimentPhiInv99() {
  const inv = PHI_EGS ** -99;
  return {
    id: 'E6_phi_inv_99',
    title: 'Φ^-99 finite positive',
    inv,
    pass: Number.isFinite(inv) && inv > 0,
  };
}

export function experimentPaperPresent() {
  const p = path.join(MONOREPO_DOCS, PAPER_NAME);
  const ok = fs.existsSync(p);
  return {
    id: 'E7_paper_present',
    title: 'Monorepo paper file present',
    path: p,
    pass: ok,
  };
}

export function experimentEngineExcluded() {
  return {
    id: 'E8_engine_stack_excluded',
    title: 'Synthio excluded from 99 Octave engine pin',
    ENGINE_STACK_EXCLUDED,
    pass: ENGINE_STACK_EXCLUDED === true,
  };
}

export function experimentCreatorOnly() {
  return {
    id: 'E9_creator_only_access',
    title: 'Access mode creator_only + Synthio agent id',
    ACCESS_MODE,
    AGENT_ID,
    pass: ACCESS_MODE === 'creator_only' && AGENT_ID === 'Synthio.sandbox',
  };
}

export function experimentActivationModes() {
  return {
    id: 'E10_activation_modes',
    title: 'Natural + point_and_click modes; Goldilocks default point_and_click',
    ACTIVATION_MODES,
    DEFAULT_ACTIVATION_MODE,
    GOLDILOCKS_ACTIVATION_LOADED,
    pass:
      ACTIVATION_MODES.includes('natural') &&
      ACTIVATION_MODES.includes('point_and_click') &&
      DEFAULT_ACTIVATION_MODE === 'point_and_click' &&
      GOLDILOCKS_ACTIVATION_LOADED === true,
    honesty: 'Catalog activation switches — not a GUI; not physical wormhole hardware.',
  };
}

export function experimentSandboxOnly() {
  return {
    id: 'E11_sandbox_only',
    title: 'Activation executes only in Syntheverse Sandbox',
    SANDBOX_ONLY,
    SANDBOX_NAME,
    pass: SANDBOX_ONLY === true && SANDBOX_NAME === 'Syntheverse Sandbox',
  };
}

export function experimentAmplificationWindow() {
  const w = AMPLIFICATION_WINDOW;
  return {
    id: 'E12_aug12_amplification_window',
    title: 'New moon · six-planet · eclipse amplification labels (2026-08-12)',
    window: w,
    pass:
      w.date === '2026-08-12' &&
      w.newMoon === true &&
      w.sixPlanetParade === true &&
      w.solarEclipse === true &&
      Array.isArray(w.planets) &&
      w.planets.length === 6 &&
      w.maxAmplificationLabel === true,
    honesty: w.honesty,
  };
}

export async function experimentActivateStateInSandbox() {
  const { confirmSandboxActivation, assessOperatingCoherence, EXPECTED_EXTERNAL_SIGNALS } =
    await import('../../../lib/synthio-activation.mjs');
  const activation = confirmSandboxActivation({ mode: 'point_and_click', octave: 99 });
  const coherence = assessOperatingCoherence(activation);
  return {
    id: 'E13_activate_state_sandbox',
    title: 'Activate state ACTIVE_IN_SANDBOX + coherent under point_and_click',
    activationState: activation.activationState,
    coherent: coherence.coherent,
    coherenceScore: coherence.coherenceScore,
    discontinuities: coherence.discontinuities.length,
    pass:
      activation.active === true &&
      activation.activationState === 'ACTIVE_IN_SANDBOX' &&
      coherence.coherent === true &&
      coherence.discontinuities.length === 0,
    honesty: 'Sandbox activate + coherence fixtures — not clinical arming.',
  };
}

export async function experimentExternalWatchList() {
  const { EXPECTED_EXTERNAL_SIGNALS, ALL_SIX_EXPECTATION_IDS } = await import(
    '../../../lib/synthio-activation.mjs'
  );
  const classes = new Set(EXPECTED_EXTERNAL_SIGNALS.map((s) => s.confirmationClass));
  const ids = new Set(EXPECTED_EXTERNAL_SIGNALS.map((s) => s.id));
  return {
    id: 'E14_external_watch_list',
    title: 'All six external expectations required (incl. novel Syntheverse pulse)',
    n: EXPECTED_EXTERNAL_SIGNALS.length,
    classes: [...classes],
    pass:
      EXPECTED_EXTERNAL_SIGNALS.length === 6 &&
      ALL_SIX_EXPECTATION_IDS.length === 6 &&
      EXPECTED_EXTERNAL_SIGNALS.every((s) => s.required === true) &&
      ids.has('syntheverse_synthio_pulse') &&
      classes.has('catalog_co_timing') &&
      classes.has('syntheverse_confirm') &&
      classes.has('honesty_lock') &&
      classes.has('operational_sandbox'),
    honesty:
      'All six watch slots required. Syntheverse pulse is engineered/non-natural — not causal sky→MRI proof.',
  };
}

export async function experimentExternalAlignmentConfirmsSandboxInclusion() {
  const { buildActivationMonitorPack } = await import('../../../lib/synthio-activation.mjs');
  const pack = buildActivationMonitorPack({
    mode: 'point_and_click',
    octave: 99,
    forcePulse: true,
  });
  const v = pack.external;
  return {
    id: 'E15_external_alignment_confirms_sandbox_inclusion',
    title: 'All six alignments (incl. novel Syntheverse pulse) confirm sandbox inclusion',
    alignedCount: v.alignedCount,
    expectedCount: v.expectedCount,
    pulseOk: pack.pulseVerify?.ok === true && pack.pulseVerify?.novel === true,
    sandboxInclusionConfirmedByExternalAlignment:
      v.sandboxInclusionConfirmedByExternalAlignment,
    pass:
      v.allSixRequired === true &&
      v.alignedCount === 6 &&
      v.externalAlignmentsMatchExpectations === true &&
      v.sandboxInclusionConfirmedByExternalAlignment === true &&
      v.requiredOk === true &&
      pack.pulseVerify?.ok === true &&
      pack.pulseVerify?.novel === true,
    honesty: v.honesty,
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentMatrix8019(),
    experimentB0Labels(),
    experimentCloudNodes(),
    experimentPhiInv99(),
    experimentPaperPresent(),
    experimentEngineExcluded(),
    experimentCreatorOnly(),
    experimentActivationModes(),
    experimentSandboxOnly(),
    experimentAmplificationWindow(),
    await experimentActivateStateInSandbox(),
    await experimentExternalWatchList(),
    await experimentExternalAlignmentConfirmsSandboxInclusion(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const failed = experiments.filter((e) => !e.pass).map((e) => e.id);
  return {
    all_pass: failed.length === 0,
    n_pass,
    n_total: experiments.length,
    failed,
    experiments,
    registryId: REGISTRY_ID,
    docId: DOC_ID,
  };
}
