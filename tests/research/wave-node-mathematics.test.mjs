import { describe, expect, it } from 'vitest';
import {
  DIGITAL_SEED,
  ENGINE_SHELF_SLOT,
  REGISTRY_ID,
} from '../../research/synthobs-wave-node-mathematics/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-wave-node-mathematics/src/experiments.mjs';

describe('synthobs-wave-node-mathematics', () => {
  it('locks registry and shelf slot', () => {
    expect(REGISTRY_ID).toBe('synthobs-wave-node-mathematics-2026-10');
    expect(ENGINE_SHELF_SLOT).toBe(49);
    expect(DIGITAL_SEED).toBe(20261024);
  });

  it(
    'experiment battery all_pass with math validation',
    () => {
      const r = runAllExperiments();
      expect(r.all_pass).toBe(true);
      expect(r.n_pass).toBe(5);
      expect(r.enginePinRecommended).toBe(true);
      expect(r.lab.summary.mathValidated).toBe(true);
      expect(r.lab.B.b2.meanObservedOrder).toBeGreaterThan(1.5);
      expect(r.lab.D.heldSummary.astar.successRate).toBe(1);
    },
    60_000,
  );
});
