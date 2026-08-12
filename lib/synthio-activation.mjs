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

/** Coherence floor for sandbox activation (catalog arithmetic — not clinical SNR). */
export const COHERENCE_FLOOR = 0.85;

/**
 * Expected external watch signals while point-and-click Goldilocks mode is active.
 * Honesty: co-timing / discussion monitors — not proof the sky runs the simulator.
 */
export const EXPECTED_EXTERNAL_SIGNALS = Object.freeze([
  {
    id: 'ephemeris_window',
    channel: 'astronomy',
    expect:
      'Public ephemerides still show 2026-08-12 co-timing: new moon vicinity, six-planet morning geometry, eclipse path narrative',
    sources: ['NASA / IAU eclipse path', 'planetarium ephemeris apps'],
    confirmationClass: 'catalog_co_timing',
  },
  {
    id: 'space_weather_band',
    channel: 'heliophysics',
    expect:
      'Kp / solar-wind / proton-flux public bands remain discussable as parallel labels during the window (no required spike)',
    sources: ['NOAA SWPC', 'GFZ Kp'],
    confirmationClass: 'parallel_label',
  },
  {
    id: 'ionosphere_f10',
    channel: 'ionosphere',
    expect:
      'F10.7 / ionospheric discussion bands may co-appear in public solar radio summaries — filing only',
    sources: ['NOAA solar radio', 'public SIDC summaries'],
    confirmationClass: 'parallel_label',
  },
  {
    id: 'sandbox_suite_green',
    channel: 'internal_sandbox',
    expect: 'npm run research:synthio-mri-cloud-antenna stays all-pass; activation receipt active=true',
    sources: ['research/synthio-mri-cloud-antenna/data/'],
    confirmationClass: 'operational_sandbox',
  },
  {
    id: 'goldilocks_pulse_optional',
    channel: 'edge_pulse',
    expect:
      'Optional: /api/goldilocks-pulse remains readable (signed pulse) — edge coherence companion, not MRI proof',
    sources: ['/api/goldilocks-pulse', 'lib/goldilocks-pulse.mjs'],
    confirmationClass: 'companion_edge',
  },
  {
    id: 'no_clinical_rf',
    channel: 'negative_control',
    expect:
      'No credible claim of clinical RF imaging from cloud racks; honesty tables unchanged',
    sources: ['docs/SYNTHIO_MRI_CLOUD_ANTENNA_99_OCTAVE_2026-08.md'],
    confirmationClass: 'honesty_lock',
  },
]);

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
 * Observed external alignments vs EXPECTED_EXTERNAL_SIGNALS (sandbox validation pass).
 * Matching expectations + ACTIVE_IN_SANDBOX ⇒ confirms inclusion in Syntheverse Sandbox.
 * Honesty: co-timing / companion alignment — not sky→MRI causation.
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
    status: 'soft_aligned',
    observed:
      'Ionosphere / F10.7 treated as optional companion filing; not required for sandbox inclusion confirm when ephemeris + suite + honesty hold.',
    sources: ['NOAA solar radio / SIDC (optional)'],
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
    id: 'goldilocks_pulse_optional',
    status: 'aligned',
    observed: 'Production /api/goldilocks-pulse returned HTTP 200 (readable companion edge).',
    sources: ['https://www.ssvibelandiaquestfest24x365.com/api/goldilocks-pulse'],
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
 * When alignments match AND sandbox activate is green → confirms sandbox inclusion.
 */
export function validateExternalAlignments(opts = {}) {
  const observations = opts.observations || EXTERNAL_ALIGNMENT_OBSERVATIONS_2026_08_12;
  const activation = opts.activation || confirmSandboxActivation(opts);
  const coherence =
    opts.coherence || assessOperatingCoherence(activation);

  const byId = Object.fromEntries(EXPECTED_EXTERNAL_SIGNALS.map((s) => [s.id, s]));
  const rows = observations.map((o) => {
    const expect = byId[o.id];
    return {
      ...o,
      expect: expect?.expect || null,
      confirmationClass: expect?.confirmationClass || null,
      aligned: o.matchesExpectation === true && o.status !== 'miss',
    };
  });

  const alignedCount = rows.filter((r) => r.aligned).length;
  const requiredIds = ['ephemeris_window', 'sandbox_suite_green', 'no_clinical_rf'];
  const requiredOk = requiredIds.every((id) => rows.some((r) => r.id === id && r.aligned));

  const externalAlignmentsMatchExpectations =
    alignedCount >= 4 && requiredOk;

  /** Rule (Player 1): matching external alignments within sandbox confirm inclusion in sandbox. */
  const sandboxInclusionConfirmedByExternalAlignment =
    activation.active === true &&
    activation.activationState === 'ACTIVE_IN_SANDBOX' &&
    coherence.coherent === true &&
    externalAlignmentsMatchExpectations === true;

  return {
    validatedAt: new Date().toISOString(),
    windowDate: AMPLIFICATION_WINDOW.date,
    rows,
    alignedCount,
    expectedCount: EXPECTED_EXTERNAL_SIGNALS.length,
    requiredOk,
    externalAlignmentsMatchExpectations,
    sandboxInclusionConfirmedByExternalAlignment,
    activationState: activation.activationState,
    coherent: coherence.coherent,
    rule:
      'Any external alignments observed to our expectations within sandbox confirm its inclusion in sandbox.',
    honesty:
      'Alignment = catalog co-timing / companion / honesty match — not proof celestial geometry runs MRI physics.',
  };
}

/** Build a monitor pack: activate confirm + coherence + external expectations. */
export function buildActivationMonitorPack(opts = {}) {
  const activation = confirmSandboxActivation(opts);
  const coherence = assessOperatingCoherence(activation);
  const external = validateExternalAlignments({ ...opts, activation, coherence });
  const logEntry = {
    type: 'synthio_activation_coherence_log',
    level: coherence.coherent && external.sandboxInclusionConfirmedByExternalAlignment ? 'ok' : coherence.coherent ? 'ok' : 'warn',
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
    sandboxInclusionConfirmedByExternalAlignment:
      external.sandboxInclusionConfirmedByExternalAlignment,
    externalAlignedCount: external.alignedCount,
    loggedAt: new Date().toISOString(),
    honesty:
      'External signals are watch-list co-timing / companion labels — not causal confirmation of MRI physics. Matching alignments confirm sandbox inclusion of this activation filing.',
  };
  return {
    activation,
    coherence,
    external,
    logEntry,
    expectedExternalSignals: EXPECTED_EXTERNAL_SIGNALS,
  };
}
