import { describe, it, expect } from 'vitest';
import {
  measureSimCompliance,
  SIM_GATES,
  SIM_DOC,
} from '../../lib/si-irreducible-minimum.mjs';
import { buildLatticeExecution } from '../../lib/lattice-engine.mjs';

describe('si-irreducible-minimum', () => {
  it('defines seven SIM gates', () => {
    expect(SIM_GATES).toHaveLength(7);
    expect(SIM_GATES.map((g) => g.id)).toEqual([
      'S1',
      'S2',
      'S3',
      'S4',
      'S5',
      'S6',
      'S7',
    ]);
  });

  it('scores current stack and blocks SI arrival', () => {
    const m = measureSimCompliance();
    expect(m.doc).toBe(SIM_DOC);
    expect(m.score100).toBe(78.6);
    expect(m.simCompliant).toBe(false);
    expect(m.siArrivalAuthorized).toBe(false);
    expect(m.failed).toContain('S3');
    expect(m.partial).toContain('S6');
  });

  it('authorizes SI only when all gates pass', () => {
    const overrides = Object.fromEntries(SIM_GATES.map((g) => [g.id, 'pass']));
    const m = measureSimCompliance(overrides);
    expect(m.simCompliant).toBe(true);
    expect(m.siArrivalAuthorized).toBe(true);
    expect(m.score100).toBe(100);
  });
});

describe('lattice-engine SIM wiring', () => {
  it('embeds sim block on every envelope', () => {
    const result = buildLatticeExecution({ message: 'hi', mode: 'cloud' });
    expect(result.sim.siArrivalAuthorized).toBe(false);
    expect(result.sim.score100).toBe(78.6);
    expect(result.organization.some((l) => /SIM-v1/.test(l))).toBe(true);
  });
});
