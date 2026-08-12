/**
 * Synthio engineering + activation dashboard pack.
 * Industry primary: KomaMRI (Bloch/k-space) · Syntheverse Sandbox wrap.
 */
import {
  AGENT_ID,
  AGENT_NAME,
  MRI_SIMULATOR,
  ENGINEERING_STATE,
  CLOUD_SERVICES,
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  B0_TESLA_LABELS,
  CLOUD_NODE_LABELS,
  AMPLIFICATION_WINDOW,
  DEFAULT_ACTIVATION_MODE,
  ACTIVATION_MODES,
  SANDBOX_NAME,
  SANDBOX_ONLY,
} from '../research/synthio-mri-cloud-antenna/src/constants.mjs';
import {
  buildActivationMonitorPack,
  COHERENCE_FLOOR,
  ALL_SIX_EXPECTATION_IDS,
} from './synthio-activation.mjs';
import {
  SYNTHIO_PULSE_DISCRIMINANT,
  SYNTHIO_PULSE_SCHEMA,
  SYNTHIO_PULSE_CADENCE_SEC,
  SYNTHIO_EXTERNAL_TELEMETRY_API,
} from './synthio-pulse.mjs';

export async function buildSynthioEngineeringPack(opts = {}) {
  const pack = await buildActivationMonitorPack({
    mode: opts.mode || DEFAULT_ACTIVATION_MODE,
    octave: Number.isFinite(opts.octave) ? opts.octave : 99,
    forcePulse: opts.forcePulse === true,
    origin: opts.origin,
    observeUrl: opts.observeUrl,
    skipCompanionProbe: opts.skipCompanionProbe === true,
    publishBlob: opts.publishBlob,
    companionTimeoutMs: opts.companionTimeoutMs,
  });

  const mriSimMatch = pack.external.mriSimMatch || {
    simulator: MRI_SIMULATOR.primary,
    verdict: pack.external.externalAlignmentsMatchExpectations ? 'MATCH' : 'MISS',
    matches: pack.external.externalAlignmentsMatchExpectations === true,
    alignedCount: pack.external.alignedCount,
    expectedCount: pack.external.expectedCount,
    missIds: [],
    summary: null,
  };
  const sandboxMembership = pack.external.sandboxMembership || {
    sandbox: SANDBOX_NAME,
    withinSandbox: pack.external.sandboxInclusionConfirmedByExternalAlignment === true,
    state: pack.external.sandboxInclusionConfirmedByExternalAlignment
      ? 'WITHIN_SYNTHEVERSE_SANDBOX'
      : 'OUTSIDE_OR_UNCONFIRMED',
    rule: pack.external.rule,
    summary: null,
  };

  const pulseCompare = pack.pulseCompare || pack.external.pulseCompare || null;
  const pulseObservation = pack.pulseObservation || pack.external.pulseObservation || null;

  const metrics = {
    activationState: pack.activation.activationState,
    activeInSandbox: pack.activation.active,
    mode: pack.activation.mode,
    octave: pack.activation.octave,
    coherenceScore: pack.coherence.coherenceScore,
    coherenceFloor: COHERENCE_FLOOR,
    coherent: pack.coherence.coherent,
    discontinuities: pack.coherence.discontinuities.length,
    externalAligned: pack.external.alignedCount,
    externalExpected: pack.external.expectedCount,
    allSixAligned: pack.external.alignedCount === ALL_SIX_EXPECTATION_IDS.length,
    externalMatchesMriSim: mriSimMatch.matches === true,
    mriSimMatchVerdict: mriSimMatch.verdict,
    sandboxInclusionConfirmed: pack.external.sandboxInclusionConfirmedByExternalAlignment,
    withinSyntheverseSandbox: sandboxMembership.withinSandbox === true,
    sandboxMembershipState: sandboxMembership.state,
    pulseOk: pack.pulseVerify?.ok === true,
    pulseNovel: pack.pulseVerify?.novel === true,
    pulseExternalMatch: pulseCompare?.matches === true,
    pulseExternalVerdict: pulseCompare?.verdict || null,
    pulseObserveSource: pulseObservation?.source || null,
    companionsReachable: pulseObservation?.companionsReachableCount ?? null,
    phiEgs: PHI_EGS,
    b0TeslaLabels: [...B0_TESLA_LABELS],
    cloudNodes: CLOUD_NODE_LABELS.length,
  };

  return {
    schema: 'synthio-engineering-dashboard/v1',
    asOf: new Date().toISOString(),
    agent: AGENT_NAME,
    agentId: AGENT_ID,
    sandbox: SANDBOX_NAME,
    sandboxOnly: SANDBOX_ONLY,
    intention: MRI_SIMULATOR.intention,
    mriSimulator: MRI_SIMULATOR,
    cloudServices: CLOUD_SERVICES,
    engineering: ENGINEERING_STATE,
    activationModes: [...ACTIVATION_MODES],
    defaultMode: DEFAULT_ACTIVATION_MODE,
    amplificationWindow: AMPLIFICATION_WINDOW,
    pulse: {
      schema: SYNTHIO_PULSE_SCHEMA,
      discriminant: SYNTHIO_PULSE_DISCRIMINANT,
      cadenceSec: SYNTHIO_PULSE_CADENCE_SEC,
      naturalOccurrence: false,
      externalTelemetryApi: SYNTHIO_EXTERNAL_TELEMETRY_API,
      emitted: pack.pulseEmit?.emitted === true,
      persist: pack.pulseEmit?.persist || null,
      verify: pack.pulseVerify,
      latest: pack.syntheversePulse,
      observation: pulseObservation,
      compare: pulseCompare,
    },
    metrics,
    mriSimMatch,
    sandboxMembership,
    pulseCompare,
    pulseObservation,
    activation: pack.activation,
    coherence: pack.coherence,
    external: pack.external,
    expectedExternalSignals: pack.expectedExternalSignals,
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    links: {
      dashboard: '/synthio-dashboard',
      cloudServices: '/synthio-cloud',
      onePager: '/synthio-one-pager',
      chat: '/synthio',
      pulseApi: '/api/synthio-pulse',
      externalTelemetryApi: SYNTHIO_EXTERNAL_TELEMETRY_API,
      activationApi: '/api/synthio-activation',
      distributedArch:
        '/interfaces/whitepaper-surface.html?id=synthio-komamri-distributed-cloud-2026-08',
      paper: '/interfaces/whitepaper-surface.html?id=synthio-mri-cloud-antenna-99-octave-2026-08',
      whiteboard: '/my-whiteboard',
    },
    honesty: {
      simulatorPrimary: MRI_SIMULATOR.primary,
      wetLabEquivalent: false,
      empiricalProxy: true,
      clinicalMagnet: false,
      note: MRI_SIMULATOR.honesty,
      pulseExternal:
        'Pulse is published to public external telemetry for emit↔observe fingerprint compare. NOAA companions are reachability-only and cannot carry Syntheverse signatures.',
    },
  };
}
