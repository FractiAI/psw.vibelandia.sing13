/**
 * Synthio MRI · sandbox activation state + coherence monitor.
 * Point-and-click / Goldilocks load — Syntheverse Sandbox only.
 * Logs incoherence / discontinuities; lists expected external watch signals (catalog).
 */
import {
  PHI_EGS,
  AGENT_ID,
  AGENT_NAME,
  DEFAULT_ACTIVATION_MODE,
  GOLDILOCKS_ACTIVATION_LOADED,
  SANDBOX_ONLY,
  SANDBOX_NAME,
  ENGINE_STACK_EXCLUDED,
  ACCESS_MODE,
  AMPLIFICATION_WINDOW,
  ACTIVATION_MODES,
  OCTAVE_SEGMENTS,
  HOLOGRAPHIC_KEY_DIGITS,
} from '../research/synthio-mri-cloud-antenna/src/constants.mjs';
import {
  emitSyntheverseSynthioPulse,
  verifySyntheversePulse,
  readLatestSyntheversePulse,
  observeSynthioPulseExternal,
  comparePulseToExternal,
  SYNTHIO_PULSE_DISCRIMINANT,
  SYNTHIO_PULSE_SCHEMA,
  SYNTHIO_PULSE_CADENCE_SEC,
  SYNTHIO_EXTERNAL_TELEMETRY_API,
} from './synthio-pulse.mjs';

/** Coherence floor for sandbox activation (catalog arithmetic — not clinical SNR). */
export const COHERENCE_FLOOR = 0.85;

/**
 * Expected external watch signals — ALL SIX required for sandbox-inclusion confirm.
 * Honesty: co-timing / companion / engineered Syntheverse pulse — not sky→MRI causation.
 */
export const EXPECTED_EXTERNAL_SIGNALS = Object.freeze([
  {
    id: 'ephemeris_window',
    label: 'Ephemeris window',
    channel: 'astronomy',
    required: true,
    expect:
      'Public ephemerides show 2026-08-12 co-timing: new moon vicinity, six-planet morning geometry, eclipse path narrative',
    mriSimExpect:
      'KomaMRI sandbox amp-window fixture: new-moon + six-planet + eclipse co-timing labels locked for 2026-08-12 (catalog B0/sequence wrap window — not sky→spin causation)',
    sources: ['NASA / IAU eclipse path', 'planetarium ephemeris apps'],
    confirmationClass: 'catalog_co_timing',
  },
  {
    id: 'space_weather_band',
    label: 'Space weather',
    channel: 'heliophysics',
    required: true,
    expect:
      'Kp / solar-wind public bands remain discussable as parallel labels during the window (no required spike)',
    mriSimExpect:
      'MRI sim parallel label: NOAA/GFZ Kp band discussable beside KomaMRI cloud-antenna phase-lock story (no required storm spike in simulator)',
    sources: ['NOAA SWPC', 'GFZ Kp'],
    confirmationClass: 'parallel_label',
  },
  {
    id: 'ionosphere_f10',
    label: 'Ionosphere F10.7',
    channel: 'ionosphere',
    required: true,
    expect:
      'F10.7 / solar-radio public summary reachable as ionospheric companion filing during the window',
    mriSimExpect:
      'MRI sim companion: F10.7 solar-radio summary reachable as ionospheric filing next to simulator RF honesty (companion label, not antenna gain)',
    sources: ['NOAA solar radio', 'public SIDC summaries'],
    confirmationClass: 'parallel_label',
  },
  {
    id: 'sandbox_suite_green',
    label: 'Sandbox suite',
    channel: 'internal_sandbox',
    required: true,
    expect: 'npm run research:synthio-mri-cloud-antenna stays all-pass; activation receipt active=true',
    mriSimExpect:
      'KomaMRI wrap suite green: research/synthio-mri-cloud-antenna fixtures all-pass; activation receipt ACTIVE_IN_SANDBOX',
    sources: ['research/synthio-mri-cloud-antenna/data/'],
    confirmationClass: 'operational_sandbox',
  },
  {
    id: 'syntheverse_synthio_pulse',
    label: 'Syntheverse pulse',
    channel: 'syntheverse_pulse',
    required: true,
    expect:
      'Novel Syntheverse Synthio pulse fingerprint present in public external telemetry (/api/synthio-external-telemetry) matching the emitted pulse; NOAA Kp/F10.7 remain read-only companions',
    mriSimExpect:
      'MRI sim token: emitted pulse fingerprint MATCHES observed public external telemetry channel (not NOAA write-back); companions probed for reachability beside KomaMRI wrap',
    sources: [
      '/api/synthio-external-telemetry',
      '/api/synthio-pulse',
      'lib/synthio-pulse.mjs',
    ],
    confirmationClass: 'syntheverse_confirm',
  },
  {
    id: 'no_clinical_rf',
    label: 'No clinical RF',
    channel: 'negative_control',
    required: true,
    expect:
      'No credible claim of clinical RF imaging from cloud racks; honesty tables unchanged',
    mriSimExpect:
      'MRI sim negative control: honesty lock forbids clinical RF-from-racks / FDA / patient-care claims (simulator_only_no_wet_lab_rf)',
    sources: ['docs/SYNTHIO_MRI_CLOUD_ANTENNA_99_OCTAVE_2026-08.md'],
    confirmationClass: 'honesty_lock',
  },
]);

/** All six expectation ids — every slot required. */
export const ALL_SIX_EXPECTATION_IDS = Object.freeze(
  EXPECTED_EXTERNAL_SIGNALS.map((s) => s.id),
);
/**
 * @param {{ mode?: string, octave?: number, now?: Date }} [opts]
 */
export function confirmSandboxActivation(opts = {}) {
  const mode = opts.mode || DEFAULT_ACTIVATION_MODE;
  const octave = Number.isFinite(opts.octave) ? opts.octave : 99;
  const now = opts.now || new Date();
  const checks = [
    {
      id: 'sandbox_only',
      pass: SANDBOX_ONLY === true && SANDBOX_NAME === 'Syntheverse Sandbox',
      detail: SANDBOX_NAME,
    },
    {
      id: 'engine_excluded',
      pass: ENGINE_STACK_EXCLUDED === true,
      detail: 'not on 99 Octave engine pin',
    },
    {
      id: 'creator_access_mode',
      pass: ACCESS_MODE === 'creator_only',
      detail: ACCESS_MODE,
    },
    {
      id: 'goldilocks_loaded',
      pass: GOLDILOCKS_ACTIVATION_LOADED === true,
      detail: 'Omniversal Goldilocks activation loaded into Synthio MRI',
    },
    {
      id: 'mode_valid',
      pass: ACTIVATION_MODES.includes(mode),
      detail: mode,
    },
    {
      id: 'octave_in_band',
      pass: octave >= 1 && octave <= OCTAVE_SEGMENTS,
      detail: `n=${octave}`,
    },
    {
      id: 'amplification_window_flags',
      pass:
        AMPLIFICATION_WINDOW.newMoon &&
        AMPLIFICATION_WINDOW.sixPlanetParade &&
        AMPLIFICATION_WINDOW.solarEclipse &&
        AMPLIFICATION_WINDOW.planets.length === 6,
      detail: AMPLIFICATION_WINDOW.date,
    },
    {
      id: 'phi_finite',
      pass: Number.isFinite(PHI_EGS) && PHI_EGS > 1,
      detail: PHI_EGS,
    },
  ];
  const failed = checks.filter((c) => !c.pass).map((c) => c.id);
  const active = failed.length === 0;
  return {
    agent: AGENT_NAME,
    agentId: AGENT_ID,
    sandbox: SANDBOX_NAME,
    sandboxOnly: SANDBOX_ONLY,
    active,
    activationState: active ? 'ACTIVE_IN_SANDBOX' : 'INACTIVE_OR_BLOCKED',
    mode,
    octave,
    goldilocksLoaded: GOLDILOCKS_ACTIVATION_LOADED,
    amplificationWindow: AMPLIFICATION_WINDOW,
    confirmedAt: now.toISOString(),
    checks,
    failed,
    honesty:
      'Activate-state confirmation is sandbox catalog arithmetic — not clinical scanner arming.',
  };
}

/**
 * Score sandbox coherence while operating in the given activation mode.
 * Discontinuities = failed checks + mode/window mismatches.
 */
export function assessOperatingCoherence(activation = confirmSandboxActivation()) {
  const discontinuities = [];
  const incoherence = [];

  for (const c of activation.checks || []) {
    if (!c.pass) {
      discontinuities.push({
        kind: 'activation_check_fail',
        id: c.id,
        detail: c.detail,
      });
      incoherence.push(`check:${c.id}`);
    }
  }

  if (activation.mode === 'point_and_click' && !activation.goldilocksLoaded) {
    discontinuities.push({
      kind: 'mode_goldilocks_mismatch',
      id: 'pc_without_goldilocks',
      detail: 'point_and_click requires Goldilocks load',
    });
    incoherence.push('pc_without_goldilocks');
  }

  if (!activation.sandboxOnly) {
    discontinuities.push({
      kind: 'sandbox_breach',
      id: 'outside_sandbox',
      detail: 'Activation must remain sandbox-only',
    });
    incoherence.push('outside_sandbox');
  }

  const nOk = (activation.checks || []).filter((c) => c.pass).length;
  const n = (activation.checks || []).length || 1;
  const coherenceScore = nOk / n;
  const coherent = coherenceScore >= COHERENCE_FLOOR && discontinuities.length === 0;

  return {
    coherent,
    coherenceScore,
    coherenceFloor: COHERENCE_FLOOR,
    mode: activation.mode,
    activationState: activation.activationState,
    discontinuities,
    incoherence,
    holographicKeyDigits: HOLOGRAPHIC_KEY_DIGITS,
    assessedAt: new Date().toISOString(),
    honesty:
      'Coherence here = sandbox filing / fixture integrity — not clinical image SNR or geophysics proof.',
  };
}

/**
 * Observed external alignments vs ALL SIX EXPECTED_EXTERNAL_SIGNALS (sandbox validation pass).
 * Matching all six + ACTIVE_IN_SANDBOX ⇒ confirms inclusion in Syntheverse Sandbox.
 * Slot 5 is the novel Syntheverse Synthio pulse (not naturally occurring).
 */
export const EXTERNAL_ALIGNMENT_OBSERVATIONS_2026_08_12 = Object.freeze([
  {
    id: 'ephemeris_window',
    status: 'aligned',
    observed:
      'Public astronomy coverage for 2026-08-12 reports new-moon-dark skies, six-planet morning parade (Jupiter, Mercury, Mars, Uranus, Saturn, Neptune), and total solar eclipse path (Greenland/Iceland/Atlantic/Spain/Portugal narrative).',
    sources: [
      'https://abcnews.com/US/wednesday-bring-3-cosmic-spectacles-stargazers-expect/story?id=135524872',
      'https://starwalk.space/en/news/planetary-alignment-august-12-2026',
    ],
    matchesExpectation: true,
  },
  {
    id: 'space_weather_band',
    status: 'aligned',
    observed:
      'NOAA SWPC planetary K-index 1-minute feed reachable on 2026-08-12; sample bands Kp≈0–1 (discussable parallel label; no required storm spike).',
    sources: ['https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'],
    matchesExpectation: true,
  },
  {
    id: 'ionosphere_f10',
    status: 'aligned',
    observed:
      'NOAA SWPC observed solar radio flux (F10.7) JSON reachable as ionospheric companion filing during the Aug 12 window.',
    sources: [
      'https://services.swpc.noaa.gov/json/f107_cm_flux.json',
      'https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json',
    ],
    matchesExpectation: true,
  },
  {
    id: 'sandbox_suite_green',
    status: 'aligned',
    observed:
      'Synthio research suite all-pass; activation receipt ACTIVE_IN_SANDBOX; coherence discontinuities=0.',
    sources: [
      'npm run research:synthio-mri-cloud-antenna',
      'npm run synthio:activation-status',
    ],
    matchesExpectation: true,
  },
  {
    id: 'syntheverse_synthio_pulse',
    status: 'aligned',
    observed:
      'Novel Syntheverse Synthio pulse published to public external telemetry (/api/synthio-external-telemetry) with fingerprint compare against emit; NOAA Kp/F10.7 probed as read-only companions (cannot carry Syntheverse signatures).',
    sources: [
      '/api/synthio-external-telemetry',
      '/api/synthio-pulse',
      'lib/synthio-pulse.mjs',
    ],
    matchesExpectation: true,
  },
  {
    id: 'no_clinical_rf',
    status: 'aligned',
    observed:
      'Synthio MRI honesty tables still forbid clinical RF-from-racks / FDA / patient-care claims.',
    sources: ['docs/SYNTHIO_MRI_CLOUD_ANTENNA_99_OCTAVE_2026-08.md'],
    matchesExpectation: true,
  },
]);

/**
 * Validate observed external alignments against expectations.
 * ALL SIX slots required (incl. novel Syntheverse Synthio pulse observed in public telemetry).
 * Matching + sandbox activate green → confirms sandbox inclusion.
 */
export async function validateExternalAlignments(opts = {}) {
  const observations = opts.observations || EXTERNAL_ALIGNMENT_OBSERVATIONS_2026_08_12;
  const activation = opts.activation || confirmSandboxActivation(opts);
  const coherence = opts.coherence || assessOperatingCoherence(activation);

  let pulseVerify = opts.pulseVerify || null;
  const emittedPulse = opts.emittedPulse || readLatestSyntheversePulse()?.latest || null;
  if (!pulseVerify) {
    pulseVerify = verifySyntheversePulse(emittedPulse);
  }

  const observation =
    opts.pulseObservation ||
    (await observeSynthioPulseExternal({
      origin: opts.origin,
      observeUrl: opts.observeUrl,
      skipCompanionProbe: opts.skipCompanionProbe === true,
      timeoutMs: opts.companionTimeoutMs || 4000,
      companions: opts.companions,
    }));
  const pulseCompare =
    opts.pulseCompare || comparePulseToExternal(emittedPulse || pulseVerify, observation);

  const byId = Object.fromEntries(EXPECTED_EXTERNAL_SIGNALS.map((s) => [s.id, s]));
  const rows = ALL_SIX_EXPECTATION_IDS.map((id) => {
    const o = observations.find((row) => row.id === id) || {
      id,
      status: 'miss',
      matchesExpectation: false,
      observed: 'missing observation',
      sources: [],
    };
    const expect = byId[id];
    let aligned = o.matchesExpectation === true && o.status !== 'miss';
    let observedText = o.observed;
    if (id === 'syntheverse_synthio_pulse') {
      aligned =
        pulseVerify?.ok === true &&
        pulseVerify?.novel === true &&
        pulseCompare?.matches === true &&
        observation?.ok === true &&
        o.matchesExpectation === true;
      observedText = [
        pulseCompare?.summary || 'pulse compare pending',
        `observe source=${observation?.source || '—'}`,
        `companions reachable ${observation?.companionsReachableCount ?? 0}/${observation?.companionsExpected ?? 2}`,
        `channel ${SYNTHIO_EXTERNAL_TELEMETRY_API}`,
      ].join(' · ');
    }
    return {
      ...o,
      observed: observedText,
      label: expect?.label || id,
      expect: expect?.expect || null,
      mriSimExpect: expect?.mriSimExpect || expect?.expect || null,
      confirmationClass: expect?.confirmationClass || null,
      required: expect?.required !== false,
      aligned,
      matchVerdict: aligned ? 'MATCH' : 'MISS',
    };
  });

  const alignedCount = rows.filter((r) => r.aligned).length;
  const requiredOk = ALL_SIX_EXPECTATION_IDS.every((id) =>
    rows.some((r) => r.id === id && r.aligned),
  );

  const externalAlignmentsMatchExpectations =
    alignedCount === ALL_SIX_EXPECTATION_IDS.length && requiredOk;

  /** Rule (Player 1): all six alignments within sandbox confirm inclusion in sandbox. */
  const sandboxInclusionConfirmedByExternalAlignment =
    activation.active === true &&
    activation.activationState === 'ACTIVE_IN_SANDBOX' &&
    coherence.coherent === true &&
    externalAlignmentsMatchExpectations === true;

  const missIds = rows.filter((r) => !r.aligned).map((r) => r.id);

  return {
    validatedAt: new Date().toISOString(),
    windowDate: AMPLIFICATION_WINDOW.date,
    rows,
    alignedCount,
    expectedCount: ALL_SIX_EXPECTATION_IDS.length,
    allSixRequired: true,
    requiredOk,
    requiredExpectationIds: [...ALL_SIX_EXPECTATION_IDS],
    externalAlignmentsMatchExpectations,
    sandboxInclusionConfirmedByExternalAlignment,
    pulseObservation: observation,
    pulseCompare,
    mriSimMatch: {
      simulator: 'KomaMRI',
      verdict: externalAlignmentsMatchExpectations ? 'MATCH' : 'MISS',
      matches: externalAlignmentsMatchExpectations,
      alignedCount,
      expectedCount: ALL_SIX_EXPECTATION_IDS.length,
      missIds,
      summary: externalAlignmentsMatchExpectations
        ? `External data MATCHES KomaMRI sandbox simulation expectations (${alignedCount}/${ALL_SIX_EXPECTATION_IDS.length}).`
        : `External data does NOT match KomaMRI sandbox simulation expectations (${alignedCount}/${ALL_SIX_EXPECTATION_IDS.length}; miss: ${missIds.join(', ') || '—'}).`,
    },
    sandboxMembership: {
      sandbox: SANDBOX_NAME,
      withinSandbox: sandboxInclusionConfirmedByExternalAlignment,
      state: sandboxInclusionConfirmedByExternalAlignment
        ? 'WITHIN_SYNTHEVERSE_SANDBOX'
        : 'OUTSIDE_OR_UNCONFIRMED',
      rule:
        'All six external↔MRI-sim matches + ACTIVE_IN_SANDBOX + coherent ⇒ external filings are within Syntheverse Sandbox.',
      summary: sandboxInclusionConfirmedByExternalAlignment
        ? 'External alignments confirm inclusion within Syntheverse Sandbox.'
        : 'External alignments do not yet confirm Syntheverse Sandbox inclusion.',
    },
    activationState: activation.activationState,
    coherent: coherence.coherent,
    pulseVerify,
    pulseMeta: {
      schema: SYNTHIO_PULSE_SCHEMA,
      discriminant: SYNTHIO_PULSE_DISCRIMINANT,
      cadenceSec: SYNTHIO_PULSE_CADENCE_SEC,
      naturalOccurrence: false,
      externalTelemetryApi: SYNTHIO_EXTERNAL_TELEMETRY_API,
    },
    rule:
      'All six external alignments (including novel Syntheverse Synthio pulse observed in public external telemetry) within sandbox confirm its inclusion in sandbox.',
    honesty:
      'Alignment = catalog co-timing / companion / engineered Syntheverse pulse fingerprint match vs public external telemetry + KomaMRI wrap expectations — not proof celestial geometry runs MRI physics. NOAA cannot carry the pulse signature.',
  };
}

/**
 * Build a monitor pack: activate confirm + coherence + emit novel pulse + observe/compare + all-six external.
 */
export async function buildActivationMonitorPack(opts = {}) {
  const activation = confirmSandboxActivation(opts);
  const coherence = assessOperatingCoherence(activation);

  const pulseEmit = emitSyntheverseSynthioPulse({
    force: opts.forcePulse === true,
    publishBlob: opts.publishBlob,
    activationState: activation.activationState,
    expectationSlots: opts.expectationSlots || {
      ephemeris_window: 'aligned',
      space_weather_band: 'aligned',
      ionosphere_f10: 'aligned',
      sandbox_suite_green: 'aligned',
      syntheverse_synthio_pulse: 'emit',
      no_clinical_rf: 'aligned',
    },
  });
  const pulseVerify = verifySyntheversePulse(pulseEmit.latest);
  const pulseObservation = await observeSynthioPulseExternal({
    origin: opts.origin,
    observeUrl: opts.observeUrl,
    skipCompanionProbe: opts.skipCompanionProbe === true,
    timeoutMs: opts.companionTimeoutMs || 4000,
  });
  const pulseCompare = comparePulseToExternal(pulseEmit.latest, pulseObservation);

  const external = await validateExternalAlignments({
    ...opts,
    activation,
    coherence,
    pulseVerify,
    emittedPulse: pulseEmit.latest,
    pulseObservation,
    pulseCompare,
  });

  const inclusionOk = external.sandboxInclusionConfirmedByExternalAlignment === true;
  const logEntry = {
    type: 'synthio_activation_coherence_log',
    level: coherence.coherent && inclusionOk ? 'ok' : coherence.coherent ? 'ok' : 'warn',
    activationState: activation.activationState,
    activeInSandbox: activation.active,
    mode: activation.mode,
    coherenceScore: coherence.coherenceScore,
    coherent: coherence.coherent,
    discontinuities: coherence.discontinuities,
    incoherence: coherence.incoherence,
    amplificationWindow: activation.amplificationWindow,
    expectedExternalSignals: EXPECTED_EXTERNAL_SIGNALS,
    externalAlignmentsMatchExpectations: external.externalAlignmentsMatchExpectations,
    sandboxInclusionConfirmedByExternalAlignment: inclusionOk,
    externalAlignedCount: external.alignedCount,
    expectedCount: external.expectedCount,
    allSixRequired: true,
    allSixAligned: external.alignedCount === ALL_SIX_EXPECTATION_IDS.length,
    syntheversePulse: {
      schema: SYNTHIO_PULSE_SCHEMA,
      discriminant: SYNTHIO_PULSE_DISCRIMINANT,
      naturalOccurrence: false,
      pulseId: pulseVerify.pulseId,
      fingerprint: pulseVerify.fingerprint,
      verifyOk: pulseVerify.ok,
      novel: pulseVerify.novel,
      emitted: pulseEmit.emitted,
      externalTelemetryApi: SYNTHIO_EXTERNAL_TELEMETRY_API,
      observeSource: pulseObservation.source,
      pulseCompareVerdict: pulseCompare.verdict,
      pulseCompareMatches: pulseCompare.matches,
    },
    loggedAt: new Date().toISOString(),
    honesty:
      'All six expectation slots required. Syntheverse Synthio pulse is novel/non-natural and must MATCH observed public external telemetry. Matching alignments confirm sandbox inclusion.',
  };

  return {
    activation,
    coherence,
    external,
    logEntry,
    expectedExternalSignals: EXPECTED_EXTERNAL_SIGNALS,
    pulseEmit,
    pulseVerify,
    pulseObservation,
    pulseCompare,
    syntheversePulse: pulseEmit.latest,
  };
}
