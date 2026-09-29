import { describe, it, expect } from 'vitest';
import { runAllExperiments } from '../../research/synthobs-e-phi-prime-recursive-homeostasis/src/experiments.mjs';
import {
  PROTOCOL_VERSION,
  PROTOCOL_VERSION_V1,
  PROTOCOL_VERSION_D,
  PROTOCOL_VERSION_D2,
  PROTOCOL_VERSION_IA,
  PROTOCOL_VERSION_IAR,
  SIGNIFICANCE_GATE,
  DIAGNOSTIC_GATE,
  D2_GATE,
  IA_GATE,
  IAR_GATE,
  IAD_GATE,
  REGISTRY_ID,
} from '../../research/synthobs-e-phi-prime-recursive-homeostasis/src/constants.mjs';

describe('e × φ × prime recursive homeostasis', () => {
  it('locks V1 + D + D2 + IA + IAR + IAD protocol fields', () => {
    expect(PROTOCOL_VERSION).toBe('EPH-IA-DELTA-2026-09-29');
    expect(PROTOCOL_VERSION_V1).toBe('EPH-RH-2026-09-28');
    expect(PROTOCOL_VERSION_D).toBe('EPH-RH-D-2026-09-28');
    expect(PROTOCOL_VERSION_D2).toBe('EPH-RH-D2-2026-09-28');
    expect(PROTOCOL_VERSION_IA).toBe('EPH-IA-2026-09-29');
    expect(PROTOCOL_VERSION_IAR).toBe('EPH-IA-R-2026-09-29');
    expect(REGISTRY_ID).toContain('e-phi-prime');
    expect(SIGNIFICANCE_GATE.engine_shelf_requires_gate).toBe(false);
    expect(DIAGNOSTIC_GATE.engine_shelf_requires_gate).toBe(false);
    expect(D2_GATE.engine_shelf_requires_gate).toBe(false);
    expect(IA_GATE.engine_shelf_requires_gate).toBe(false);
    expect(IAR_GATE.engine_shelf_requires_gate).toBe(false);
    expect(IAD_GATE.engine_shelf_requires_gate).toBe(true);
    expect(IAD_GATE.require_e_frozen).toBe(true);
    expect(IAD_GATE.require_E2_three_axis).toBe(true);
  });

  it('runs suite with integrity pass; prior nulls locked; IAD gate honest', async () => {
    const results = await runAllExperiments();
    expect(results.all_pass).toBe(true);
    expect(results.n_total).toBe(36); // 9 V1 + 6 D + 7 D2 + 6 IA + 4 IAR + 4 IAD
    expect(results.v1_goldilocks_gate_pass).toBe(false);
    expect(results.diagnostic_gate_pass).toBe(false);
    expect(results.d2_gate_pass).toBe(false);
    expect(results.ia_gate_pass).toBe(false);
    expect(typeof results.iar_gate_pass).toBe('boolean');
    expect(typeof results.iad_gate_pass).toBe('boolean');
    expect(results.engine_shelf_include).toBe(results.iad_gate_pass);
    expect(results.significance_gate_pass).toBe(results.iad_gate_pass);
    expect(results.primary_readout.control_a.goldilocksRate).toBeGreaterThan(
      results.primary_readout.unified.goldilocksRate,
    );
    expect(results.diagnostic_readout.checks.efficiency_above_A).toBe(true);
    expect(results.diagnostic_readout.checks.efficiency_above_matched_containment).toBe(
      false,
    );
    expect(results.d2_readout.board.coupled.mean_Q).toBeGreaterThan(2.3);
    expect(results.ia_readout.board.I.mean_slots).toBeGreaterThan(80);
    expect(results.ia_readout.checks.slots_matched).toBe(true);
    // IAR: e-forward costs RCR; dual-state / reverse paths present
    expect(results.iar_readout.checks.e_forward_costs_RCR).toBe(true);
    expect(results.iar_readout.board.E0.mean_RCR).toBeLessThan(
      results.iar_readout.board.A.mean_RCR,
    );
    expect(results.iar_readout.board.E4.mean_commit_rate).toBeGreaterThan(0);
    // IAD: e frozen; E2 three-axis lock present; reconcile board present
    expect(results.iad_readout.checks.e_frozen).toBe(true);
    expect(results.iad_readout.board.R).toBeTruthy();
    expect(results.iad_readout.board.E2).toBeTruthy();
    expect(typeof results.iad_readout.three_axis.E2.pass).toBe('boolean');
    expect(results.iad_readout.board.R.mean_useful_commit_rate).toBeGreaterThanOrEqual(0);
  }, 120_000);
});
