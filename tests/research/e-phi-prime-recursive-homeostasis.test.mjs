import { describe, it, expect } from 'vitest';
import { runAllExperiments } from '../../research/synthobs-e-phi-prime-recursive-homeostasis/src/experiments.mjs';
import {
  PROTOCOL_VERSION,
  PROTOCOL_VERSION_V1,
  SIGNIFICANCE_GATE,
  DIAGNOSTIC_GATE,
  REGISTRY_ID,
} from '../../research/synthobs-e-phi-prime-recursive-homeostasis/src/constants.mjs';

describe('e × φ × prime recursive homeostasis', () => {
  it('locks V1 + EPH-RH-D protocol fields', () => {
    expect(PROTOCOL_VERSION).toBe('EPH-RH-D-2026-09-28');
    expect(PROTOCOL_VERSION_V1).toBe('EPH-RH-2026-09-28');
    expect(REGISTRY_ID).toContain('e-phi-prime');
    expect(SIGNIFICANCE_GATE.engine_shelf_requires_gate).toBe(false);
    expect(DIAGNOSTIC_GATE.engine_shelf_requires_gate).toBe(true);
  });

  it('runs suite with integrity pass; V1 null locked; diagnostic gate honest', async () => {
    const results = await runAllExperiments();
    expect(results.all_pass).toBe(true);
    expect(results.n_total).toBe(15);
    expect(results.v1_goldilocks_gate_pass).toBe(false);
    expect(results.diagnostic_gate_pass).toBe(false);
    expect(results.engine_shelf_include).toBe(false);
    expect(results.primary_readout.control_a.goldilocksRate).toBeGreaterThan(
      results.primary_readout.unified.goldilocksRate,
    );
    // Matched-budget diagnostic: efficiency vs A should hold even when gate fails on primality
    expect(results.diagnostic_readout.checks.efficiency_above_A).toBe(true);
    expect(results.diagnostic_readout.checks.efficiency_above_matched_containment).toBe(
      false,
    );
  });
});
