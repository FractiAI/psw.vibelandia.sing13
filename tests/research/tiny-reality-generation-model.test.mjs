import { describe, expect, it } from 'vitest';
import {
  DIGITAL_SEED,
  ENGINE_SHELF_SLOT,
  REGISTRY_ID,
} from '../../research/synthobs-tiny-reality-generation-model/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-tiny-reality-generation-model/src/experiments.mjs';

describe('synthobs-tiny-reality-generation-model', () => {
  it('locks registry and shelf slot', () => {
    expect(REGISTRY_ID).toBe('synthobs-tiny-reality-generation-model-2026-10');
    expect(ENGINE_SHELF_SLOT).toBe(50);
    expect(DIGITAL_SEED).toBe(20261025);
  });

  it(
    'experiment battery all_pass with engine pin recommendation',
    () => {
      const r = runAllExperiments();
      expect(r.all_pass).toBe(true);
      expect(r.n_pass).toBe(5);
      expect(r.enginePinRecommended).toBe(true);
      expect(r.lab.held.summary.viabilityRate).toBe(1);
      expect(r.lab.nullBaseline.viabilityRate).toBe(0);
    },
    90_000,
  );
});
