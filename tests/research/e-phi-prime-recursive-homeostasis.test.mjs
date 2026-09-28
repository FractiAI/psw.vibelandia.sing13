import { describe, it, expect } from 'vitest';
import { runAllExperiments } from '../../research/synthobs-e-phi-prime-recursive-homeostasis/src/experiments.mjs';
import {
  PROTOCOL_VERSION,
  SIGNIFICANCE_GATE,
  REGISTRY_ID,
} from '../../research/synthobs-e-phi-prime-recursive-homeostasis/src/constants.mjs';

describe('e × φ × prime recursive homeostasis', () => {
  it('locks protocol + significance gate fields', () => {
    expect(PROTOCOL_VERSION).toBe('EPH-RH-2026-09-28');
    expect(REGISTRY_ID).toContain('e-phi-prime');
    expect(SIGNIFICANCE_GATE.engine_shelf_requires_gate).toBe(true);
    expect(SIGNIFICANCE_GATE.goldilocks_margin).toBeGreaterThan(0);
  });

  it('runs suite with integrity pass and honest gate decision', async () => {
    const results = await runAllExperiments();
    expect(results.all_pass).toBe(true);
    expect(results.n_total).toBe(9);
    // Live fixtures: gate fails → engine pin withheld (not a silent crown)
    expect(results.significance_gate_pass).toBe(false);
    expect(results.engine_shelf_include).toBe(false);
    expect(results.primary_readout.control_a.goldilocksRate).toBeGreaterThan(
      results.primary_readout.unified.goldilocksRate,
    );
  });
});
