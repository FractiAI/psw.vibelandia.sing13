import { describe, expect, it } from 'vitest';
import {
  DIGITAL_SEED,
  ENGINE_SHELF_SLOT,
  PRIMARY_HYPOTHESIS,
  REGISTRY_ID,
} from '../../research/synthobs-tiny-reality-generation-model/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-tiny-reality-generation-model/src/experiments.mjs';

describe('synthobs-tiny-reality-generation-model', () => {
  it('locks registry, shelf slot, and primary hypothesis', () => {
    expect(REGISTRY_ID).toBe('synthobs-tiny-reality-generation-model-2026-10');
    expect(ENGINE_SHELF_SLOT).toBe(50);
    expect(DIGITAL_SEED).toBe(20261025);
    expect(PRIMARY_HYPOTHESIS).toMatch(/three-symbol/);
    expect(PRIMARY_HYPOTHESIS).toMatch(/polygon spin/);
    expect(PRIMARY_HYPOTHESIS).toMatch(/Infinite Octave/);
    expect(PRIMARY_HYPOTHESIS).toMatch(/folded compact DNA/);
  });

  it(
    'E+M+T battery · historical Movebank · DNA theater · triadic octave primary',
    async () => {
      const r = await runAllExperiments();
      expect(r.all_pass).toBe(true);
      expect(r.n_total).toBe(16); // E1–E5 + M1–M5 + T1–T6
      expect(r.n_pass).toBe(16);
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

      expect(r.triadic_ran).toBe(true);
      expect(r.triadic_all_pass).toBe(true);
      expect(r.triadicExperiments.map((e) => e.id)).toEqual(['T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
      expect(r.triadic.conditions.full.meanCoherence).toBeGreaterThan(
        r.triadic.conditions.unstructured.meanCoherence,
      );
      expect(r.triadic.conditions.full.benefitRate).toBeGreaterThanOrEqual(0.75);
      expect(r.triadic.conditions.full.compactionRatio).toBeGreaterThan(
        r.triadic.conditions.unfolded.compactionRatio,
      );
    },
    180_000,
  );
});
