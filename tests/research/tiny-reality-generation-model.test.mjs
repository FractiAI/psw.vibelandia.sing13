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
    'experiment battery all_pass with engine pin + historical Movebank/Kp predictions executed',
    async () => {
      const r = await runAllExperiments();
      expect(r.all_pass).toBe(true);
      expect(r.n_pass).toBe(5);
      expect(r.enginePinRecommended).toBe(true);
      expect(r.lab.held.summary.viabilityRate).toBe(1);
      expect(r.lab.nullBaseline.viabilityRate).toBe(0);

      // Historical prediction battery must actually run on real collar/Kp data (or fixture).
      expect(r.historical_ran).toBe(true);
      expect(r.historical.sourceMode).toMatch(/live_csv|fixture/);
      expect(r.historical_n_total).toBe(3);
      expect(r.historical.scored.nHeld).toBeGreaterThan(20);
      expect(r.historical.scored.dateRange.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Do not require historical_all_pass — mixed/null on wildlife series is an allowed honest outcome.
      expect(r.historicalExperiments.map((e) => e.id).sort()).toEqual(['H1', 'H2', 'H3']);
    },
    120_000,
  );
});
