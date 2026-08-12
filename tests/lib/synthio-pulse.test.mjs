import { describe, expect, it, beforeEach } from 'vitest';
import {
  emitSyntheverseSynthioPulse,
  persistPulseStore,
  resetSynthioPulseMemoryForTests,
  verifySyntheversePulse,
  isSyntheverseSynthioPulse,
  pulseFingerprint,
  observeSynthioPulseExternal,
  comparePulseToExternal,
  readPublishedExternalTelemetry,
  emitObserveComparePulse,
  SYNTHIO_EXTERNAL_TELEMETRY_API,
} from '../../lib/synthio-pulse.mjs';
import { buildSynthioEngineeringPack } from '../../lib/synthio-engineering.mjs';

describe('synthio pulse + activation pack', () => {
  beforeEach(() => {
    resetSynthioPulseMemoryForTests();
  });

  it('emits a verifiable novel pulse', () => {
    const r = emitSyntheverseSynthioPulse({
      force: true,
      activationState: 'ACTIVE_IN_SANDBOX',
      publishBlob: false,
    });
    expect(r.emitted).toBe(true);
    expect(isSyntheverseSynthioPulse(r.latest)).toBe(true);
    expect(verifySyntheversePulse(r.latest).ok).toBe(true);
    expect(r.latest.fingerprint).toBe(pulseFingerprint(r.latest));
    expect(r.externalPublish?.ok).toBe(true);
    expect(r.externalPublish?.api).toBe(SYNTHIO_EXTERNAL_TELEMETRY_API);
    expect(['disk', 'tmp', 'memory']).toContain(r.persist);
  });

  it('respects cadence unless forced', () => {
    const a = emitSyntheverseSynthioPulse({ force: true, publishBlob: false });
    const b = emitSyntheverseSynthioPulse({ force: false, publishBlob: false });
    expect(b.emitted).toBe(false);
    expect(b.latest.pulseId).toBe(a.latest.pulseId);
    const c = emitSyntheverseSynthioPulse({ force: true, publishBlob: false });
    expect(c.emitted).toBe(true);
    expect(c.latest.pulseId).not.toBe(a.latest.pulseId);
  });

  it('keeps memory persist when store write is forced into memory path', () => {
    const pulse = emitSyntheverseSynthioPulse({ force: true, publishBlob: false }).latest;
    const persist = persistPulseStore({
      schema: 'syntheverse-synthio-pulse-store/v1',
      updatedAt: new Date().toISOString(),
      latest: pulse,
      history: [pulse],
    });
    expect(['disk', 'tmp', 'memory']).toContain(persist);
    const v = verifySyntheversePulse(pulse);
    expect(v.ok).toBe(true);
  });

  it('publishes pulse into observable external telemetry and MATCHES on observe', async () => {
    const loop = await emitObserveComparePulse({
      force: true,
      publishBlob: false,
      skipCompanionProbe: true,
    });
    expect(loop.verify.ok).toBe(true);
    expect(loop.observation.ok).toBe(true);
    expect(loop.observation.api).toBe(SYNTHIO_EXTERNAL_TELEMETRY_API);
    expect(loop.compare.matches).toBe(true);
    expect(loop.compare.verdict).toBe('MATCH');
    expect(loop.compare.emittedFingerprint).toBe(loop.compare.observedFingerprint);
    expect(readPublishedExternalTelemetry()?.pulse?.pulseId).toBe(loop.emit.latest.pulseId);
  });

  it('reports MISS when observed external telemetry fingerprint differs', async () => {
    const emitted = emitSyntheverseSynthioPulse({ force: true, publishBlob: false }).latest;
    const observation = await observeSynthioPulseExternal({ skipCompanionProbe: true });
    const forged = {
      ...observation,
      fingerprint: 'deadbeef',
      pulse: { ...observation.pulse, fingerprint: 'deadbeef', pulseId: 'forged' },
    };
    const compare = comparePulseToExternal(emitted, forged);
    expect(compare.matches).toBe(false);
    expect(compare.verdict).toBe('MISS');
  });

  it('builds engineering pack without throwing (soft + force)', async () => {
    const soft = await buildSynthioEngineeringPack({
      forcePulse: false,
      skipCompanionProbe: true,
      publishBlob: false,
    });
    expect(soft.metrics.activeInSandbox).toBe(true);
    expect(soft.pulse.verify.ok).toBe(true);
    expect(soft.pulse.persist).toBeTruthy();
    expect(soft.metrics.pulseExternalMatch).toBe(true);
    expect(soft.pulseCompare.verdict).toBe('MATCH');
    expect(soft.links.externalTelemetryApi).toBe(SYNTHIO_EXTERNAL_TELEMETRY_API);

    const hard = await buildSynthioEngineeringPack({
      forcePulse: true,
      skipCompanionProbe: true,
      publishBlob: false,
    });
    expect(hard.ok !== false).toBe(true);
    expect(hard.pulse.verify.ok).toBe(true);
    expect(hard.metrics.pulseOk).toBe(true);
    expect(hard.metrics.pulseExternalMatch).toBe(true);
  });
});
