import { describe, expect, it, beforeEach } from 'vitest';
import {
  emitSyntheverseSynthioPulse,
  persistPulseStore,
  resetSynthioPulseMemoryForTests,
  verifySyntheversePulse,
  isSyntheverseSynthioPulse,
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
    });
    expect(r.emitted).toBe(true);
    expect(isSyntheverseSynthioPulse(r.latest)).toBe(true);
    expect(verifySyntheversePulse(r.latest).ok).toBe(true);
    expect(['disk', 'tmp', 'memory']).toContain(r.persist);
  });

  it('respects cadence unless forced', () => {
    const a = emitSyntheverseSynthioPulse({ force: true });
    const b = emitSyntheverseSynthioPulse({ force: false });
    expect(b.emitted).toBe(false);
    expect(b.latest.pulseId).toBe(a.latest.pulseId);
    const c = emitSyntheverseSynthioPulse({ force: true });
    expect(c.emitted).toBe(true);
    expect(c.latest.pulseId).not.toBe(a.latest.pulseId);
  });

  it('keeps memory persist when store write is forced into memory path', () => {
    const pulse = emitSyntheverseSynthioPulse({ force: true }).latest;
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

  it('builds engineering pack without throwing (soft + force)', () => {
    const soft = buildSynthioEngineeringPack({ forcePulse: false });
    expect(soft.metrics.activeInSandbox).toBe(true);
    expect(soft.pulse.verify.ok).toBe(true);
    expect(soft.pulse.persist).toBeTruthy();

    const hard = buildSynthioEngineeringPack({ forcePulse: true });
    expect(hard.ok !== false).toBe(true);
    expect(hard.pulse.verify.ok).toBe(true);
    expect(hard.metrics.pulseOk).toBe(true);
  });
});
