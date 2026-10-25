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
    'E+M battery + historical Movebank + DNA molecular theater',
    async () => {
      const r = await runAllExperiments();
      expect(r.all_pass).toBe(true);
      expect(r.n_total).toBe(10); // E1–E5 + M1–M5
      expect(r.n_pass).toBe(10);
      expect(r.enginePinRecommended).toBe(true);
      expect(r.lab.held.summary.viabilityRate).toBe(1);
      expect(r.lab.nullBaseline.viabilityRate).toBe(0);
      expect(r.lab.phaseSteering.hardGate).toBe(false);
      expect(r.lab.phaseSteering.role).toBe('steering_delta');

      expect(r.historical_ran).toBe(true);
      expect(r.historical.sourceMode).toMatch(/live_csv|fixture/);
      expect(r.historical_n_total).toBe(3);

      expect(r.molecular_ran).toBe(true);
      expect(r.molecular_all_pass).toBe(true);
      expect(r.molecular.theater.role).toBe('physical_theater');
      expect(r.molecular.host.chrom).toBe('chr1');
      expect(r.molecular.held.viabilityRate).toBeGreaterThanOrEqual(0.75);
      expect(r.molecularExperiments.map((e) => e.id)).toEqual(['M1', 'M2', 'M3', 'M4', 'M5']);
    },
    180_000,
  );
});
