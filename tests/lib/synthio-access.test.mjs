import { describe, it, expect } from 'vitest';
import {
  checkLatticeEmailAccess,
  listCreatorEmails,
  CREATOR_EMAIL,
} from '../../lib/lattice-access.mjs';
import {
  checkSynthioAccess,
  isSynthioCreatorEmail,
  SYNTHIO_AGENT_ID,
} from '../../lib/synthio-access.mjs';
import { buildSynthioMessages, SYNTHIO_SYSTEM_PROMPT } from '../../lib/synthio-prompt.mjs';
import {
  confirmSandboxActivation,
  assessOperatingCoherence,
  EXPECTED_EXTERNAL_SIGNALS,
  COHERENCE_FLOOR,
} from '../../lib/synthio-activation.mjs';

describe('Synthio Lattice-session access', () => {
  it('lists creator emails including espressolico', () => {
    const list = listCreatorEmails();
    expect(list).toContain(CREATOR_EMAIL);
    expect(list).toContain('espressolico@gmail.com');
  });

  it('allows creator seats', () => {
    const a = checkSynthioAccess('valetpru@gmail.com');
    expect(a.ok).toBe(true);
    expect(a.privilege).toBe('creator');
    expect(a.agent).toBe(SYNTHIO_AGENT_ID);
    expect(isSynthioCreatorEmail('espressolico@gmail.com')).toBe(true);
  });

  it('allows Lattice guest seats when grant is fresh', () => {
    const guest = checkLatticeEmailAccess('danielarifriedman@gmail.com');
    const synthio = checkSynthioAccess('danielarifriedman@gmail.com');
    if (guest.ok) {
      expect(guest.privilege).toBe('guest');
      expect(synthio.ok).toBe(true);
      expect(synthio.privilege).toBe('guest');
      expect(synthio.reason).toMatch(/Lattice session/i);
    } else {
      // expired grant still blocked
      expect(synthio.ok).toBe(false);
    }
  });

  it('blocks unknown emails', () => {
    const a = checkSynthioAccess('nobody@example.com');
    expect(a.ok).toBe(false);
  });
});

describe('Synthio prompt', () => {
  it('includes Synthio identity and honesty', () => {
    expect(SYNTHIO_SYSTEM_PROMPT).toMatch(/Synthio/);
    expect(SYNTHIO_SYSTEM_PROMPT).toMatch(/allowlisted|guest/i);
    expect(SYNTHIO_SYSTEM_PROMPT).toMatch(/not.*clinical/i);
    expect(SYNTHIO_SYSTEM_PROMPT).toMatch(/point-and-click/i);
    expect(SYNTHIO_SYSTEM_PROMPT).toMatch(/Syntheverse Sandbox/);
    expect(SYNTHIO_SYSTEM_PROMPT).toMatch(/new moon/i);
  });

  it('builds messages with system + user', () => {
    const msgs = buildSynthioMessages('Hello Synthio', {
      history: [{ role: 'user', content: 'prior' }, { role: 'assistant', content: 'ack' }],
    });
    expect(msgs[0].role).toBe('system');
    expect(msgs[msgs.length - 1]).toEqual({ role: 'user', content: 'Hello Synthio' });
  });
});

describe('Synthio activate + coherence (sandbox)', () => {
  it('confirms ACTIVE_IN_SANDBOX under point_and_click', () => {
    const a = confirmSandboxActivation({ mode: 'point_and_click', octave: 99 });
    expect(a.active).toBe(true);
    expect(a.activationState).toBe('ACTIVE_IN_SANDBOX');
    expect(a.sandboxOnly).toBe(true);
  });

  it('reports coherent with empty discontinuities when healthy', () => {
    const a = confirmSandboxActivation({ mode: 'point_and_click' });
    const c = assessOperatingCoherence(a);
    expect(c.coherent).toBe(true);
    expect(c.coherenceScore).toBeGreaterThanOrEqual(COHERENCE_FLOOR);
    expect(c.discontinuities).toEqual([]);
  });

  it('publishes all six required external expectations incl. Syntheverse pulse', () => {
    expect(EXPECTED_EXTERNAL_SIGNALS).toHaveLength(6);
    expect(EXPECTED_EXTERNAL_SIGNALS.every((s) => s.required === true)).toBe(true);
    expect(EXPECTED_EXTERNAL_SIGNALS.some((s) => s.id === 'ephemeris_window')).toBe(true);
    expect(EXPECTED_EXTERNAL_SIGNALS.some((s) => s.id === 'syntheverse_synthio_pulse')).toBe(true);
    expect(EXPECTED_EXTERNAL_SIGNALS.some((s) => s.confirmationClass === 'syntheverse_confirm')).toBe(
      true,
    );
    expect(EXPECTED_EXTERNAL_SIGNALS.some((s) => s.confirmationClass === 'honesty_lock')).toBe(
      true,
    );
  });

  it('validates all six alignments + novel pulse confirm sandbox inclusion', async () => {
    const { buildActivationMonitorPack } = await import('../../lib/synthio-activation.mjs');
    const pack = await buildActivationMonitorPack({
      mode: 'point_and_click',
      forcePulse: true,
      skipCompanionProbe: true,
      publishBlob: false,
    });
    expect(pack.pulseVerify.ok).toBe(true);
    expect(pack.pulseVerify.novel).toBe(true);
    expect(pack.pulseCompare.matches).toBe(true);
    expect(pack.pulseObservation.ok).toBe(true);
    expect(pack.external.alignedCount).toBe(6);
    expect(pack.external.allSixRequired).toBe(true);
    expect(pack.external.externalAlignmentsMatchExpectations).toBe(true);
    expect(pack.external.sandboxInclusionConfirmedByExternalAlignment).toBe(true);
  });

  it('exposes KomaMRI engineering pack for activation dashboard', async () => {
    const { buildSynthioEngineeringPack } = await import('../../lib/synthio-engineering.mjs');
    const { MRI_SIMULATOR, CLOUD_SERVICES } = await import(
      '../../research/synthio-mri-cloud-antenna/src/constants.mjs'
    );
    expect(MRI_SIMULATOR.primary).toBe('KomaMRI');
    expect(CLOUD_SERVICES.sessionPath).toBe('/synthio-cloud');
    expect(CLOUD_SERVICES.juliaClusterLiveOnEdge).toBe(false);
    const pack = await buildSynthioEngineeringPack({
      forcePulse: true,
      skipCompanionProbe: true,
      publishBlob: false,
    });
    expect(pack.mriSimulator.primary).toBe('KomaMRI');
    expect(pack.cloudServices.name).toBe('Synthio Cloud Services');
    expect(pack.metrics.activeInSandbox).toBe(true);
    expect(pack.metrics.allSixAligned).toBe(true);
    expect(pack.metrics.externalMatchesMriSim).toBe(true);
    expect(pack.metrics.pulseExternalMatch).toBe(true);
    expect(pack.mriSimMatch.verdict).toBe('MATCH');
    expect(pack.mriSimMatch.matches).toBe(true);
    expect(pack.sandboxMembership.withinSandbox).toBe(true);
    expect(pack.sandboxMembership.state).toBe('WITHIN_SYNTHEVERSE_SANDBOX');
    expect(pack.metrics.withinSyntheverseSandbox).toBe(true);
    expect(pack.external.rows.every((r) => r.mriSimExpect && r.matchVerdict === 'MATCH')).toBe(true);
    expect(pack.intention.toLowerCase()).toMatch(/wet/);
    expect(pack.links.dashboard).toBe('/synthio-dashboard');
    expect(pack.links.cloudServices).toBe('/synthio-cloud');
    expect(pack.links.externalTelemetryApi).toBe('/api/synthio-external-telemetry');
  });

  it('reports MISS + outside sandbox when an external observation fails', async () => {
    const { validateExternalAlignments, EXTERNAL_ALIGNMENT_OBSERVATIONS_2026_08_12 } = await import(
      '../../lib/synthio-activation.mjs'
    );
    const { emitSyntheverseSynthioPulse } = await import('../../lib/synthio-pulse.mjs');
    const emitted = emitSyntheverseSynthioPulse({ force: true, publishBlob: false }).latest;
    const broken = EXTERNAL_ALIGNMENT_OBSERVATIONS_2026_08_12.map((row) =>
      row.id === 'space_weather_band'
        ? { ...row, matchesExpectation: false, status: 'miss', observed: 'Kp feed unreachable' }
        : row,
    );
    const result = await validateExternalAlignments({
      observations: broken,
      pulseVerify: { ok: true, novel: true, fingerprint: emitted.fingerprint },
      emittedPulse: emitted,
      skipCompanionProbe: true,
    });
    expect(result.mriSimMatch.verdict).toBe('MISS');
    expect(result.mriSimMatch.matches).toBe(false);
    expect(result.mriSimMatch.missIds).toContain('space_weather_band');
    expect(result.sandboxMembership.withinSandbox).toBe(false);
    expect(result.sandboxMembership.state).toBe('OUTSIDE_OR_UNCONFIRMED');
    const missRow = result.rows.find((r) => r.id === 'space_weather_band');
    expect(missRow.matchVerdict).toBe('MISS');
    expect(missRow.mriSimExpect).toMatch(/MRI sim/i);
    expect(result.pulseCompare.matches).toBe(true);
  });

  it('accepts Cursor as a Synthio provider (no Claude-only force)', async () => {
    const src = await import('node:fs').then((fs) =>
      fs.promises.readFile(new URL('../../api/synthio-chat.js', import.meta.url), 'utf8'),
    );
    expect(src).toMatch(/acceptsProviders:\s*\[[^\]]*['"]cursor['"]/);
    expect(src).toMatch(/cursorKeySufficient:\s*true/);
    expect(src).toMatch(/async function callCursor/);
    expect(src).not.toMatch(/synthio_provider_use_lattice_key/);
  });

  it('confirms Cloud home apps reside inside the MRI simulation', async () => {
    const { CLOUD_SERVICES } = await import(
      '../../research/synthio-mri-cloud-antenna/src/constants.mjs'
    );
    const ids = CLOUD_SERVICES.appsInsideMriSimulation.map((a) => a.id);
    expect(ids).toEqual(['chat', 'messages', 'files', 'photos']);
    expect(CLOUD_SERVICES.appsInsideMriSimulation.every((a) => a.residesIn === 'mri_simulation')).toBe(
      true,
    );
    expect(CLOUD_SERVICES.demonstration.toLowerCase()).toMatch(/inside/);
    const pack = await (
      await import('../../lib/synthio-engineering.mjs')
    ).buildSynthioEngineeringPack({
      forcePulse: true,
      skipCompanionProbe: true,
      publishBlob: false,
    });
    expect(pack.appsInsideMriSimulation).toHaveLength(4);
    expect(pack.cloudDemonstration).toMatch(/MRI simulation/i);
  });
});
