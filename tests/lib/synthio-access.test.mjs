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

describe('Synthio creator-only access', () => {
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

  it('blocks guest seats', () => {
    const guest = checkLatticeEmailAccess('danielarifriedman@gmail.com');
    // guest may be expired depending on date — Synthio must still refuse non-creators
    const synthio = checkSynthioAccess('danielarifriedman@gmail.com');
    expect(synthio.ok).toBe(false);
    expect(synthio.privilege).not.toBe('creator');
    if (guest.ok) {
      expect(guest.privilege).toBe('guest');
      expect(synthio.reason).toMatch(/creator-only/i);
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
    expect(SYNTHIO_SYSTEM_PROMPT).toMatch(/creator-only/i);
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
    const pack = buildActivationMonitorPack({ mode: 'point_and_click', forcePulse: true });
    expect(pack.pulseVerify.ok).toBe(true);
    expect(pack.pulseVerify.novel).toBe(true);
    expect(pack.external.alignedCount).toBe(6);
    expect(pack.external.allSixRequired).toBe(true);
    expect(pack.external.externalAlignmentsMatchExpectations).toBe(true);
    expect(pack.external.sandboxInclusionConfirmedByExternalAlignment).toBe(true);
  });
});
