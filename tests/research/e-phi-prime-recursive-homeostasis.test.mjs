import { describe, it, expect } from 'vitest';
import { runAllExperiments } from '../../research/synthobs-e-phi-prime-recursive-homeostasis/src/experiments.mjs';
import {
  PROTOCOL_VERSION,
  PROTOCOL_VERSION_V1,
  PROTOCOL_VERSION_D,
  SIGNIFICANCE_GATE,
  DIAGNOSTIC_GATE,
  D2_GATE,
  REGISTRY_ID,
} from '../../research/synthobs-e-phi-prime-recursive-homeostasis/src/constants.mjs';

describe('e × φ × prime recursive homeostasis', () => {
  it('locks V1 + D + D2 protocol fields', () => {
    expect(PROTOCOL_VERSION).toBe('EPH-RH-D2-2026-09-28');
    expect(PROTOCOL_VERSION_V1).toBe('EPH-RH-2026-09-28');
    expect(PROTOCOL_VERSION_D).toBe('EPH-RH-D-2026-09-28');
    expect(REGISTRY_ID).toContain('e-phi-prime');
    expect(SIGNIFICANCE_GATE.engine_shelf_requires_gate).toBe(false);
    expect(DIAGNOSTIC_GATE.engine_shelf_requires_gate).toBe(false);
    expect(D2_GATE.engine_shelf_requires_gate).toBe(true);
  });

  it('runs suite with integrity pass; V1/D nulls locked; D2 gate honest', async () => {
    const results = await runAllExperiments();
    expect(results.all_pass).toBe(true);
    expect(results.n_total).toBe(22); // 9 V1 + 6 D + 7 D2
    expect(results.v1_goldilocks_gate_pass).toBe(false);
    expect(results.diagnostic_gate_pass).toBe(false);
    expect(typeof results.d2_gate_pass).toBe('boolean');
    expect(results.engine_shelf_include).toBe(results.d2_gate_pass);
    expect(results.significance_gate_pass).toBe(results.d2_gate_pass);
    expect(results.primary_readout.control_a.goldilocksRate).toBeGreaterThan(
      results.primary_readout.unified.goldilocksRate,
    );
    // Matched-budget D: efficiency vs A holds; primality still fails
    expect(results.diagnostic_readout.checks.efficiency_above_A).toBe(true);
    expect(results.diagnostic_readout.checks.efficiency_above_matched_containment).toBe(
      false,
    );
    // D2 exact-Q board present
    expect(results.d2_readout.board.coupled.mean_Q).toBeGreaterThan(2.3);
    expect(results.d2_readout.board.control_a.mean_Q).toBeGreaterThan(2.3);
    expect(results.d2_readout.checks).toBeTruthy();
  });
});
