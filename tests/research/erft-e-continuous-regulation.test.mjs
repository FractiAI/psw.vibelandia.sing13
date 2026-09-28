import { describe, it, expect } from 'vitest';
import {
  PROTOCOL_VERSION,
  ENGINE_INCLUSION_GATE,
  ENGINEERING_THRESHOLD_PCT,
  PRESERVES_V5,
  PRESERVES_ERFT_D,
  HOLD_KINDS,
  HOLD_SEED,
} from '../../research/synthobs-erft-e-continuous-regulation/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-erft-e-continuous-regulation/src/experiments.mjs';

describe('ERFT-E continuous regulation + confirmatory held-out', () => {
  it('uses ERFT-E protocol and preserves V5/D locks', () => {
    expect(PROTOCOL_VERSION).toMatch(/^ERFT-E-/);
    expect(PRESERVES_V5).toBe(true);
    expect(PRESERVES_ERFT_D).toBe(true);
    expect(ENGINEERING_THRESHOLD_PCT).toBe(0.15);
    expect(ENGINE_INCLUSION_GATE.on_fail).toMatch(/Do NOT add to Infinite Octaves ENGINE_SHELF/);
    expect(HOLD_KINDS.length).toBeGreaterThanOrEqual(5);
    expect(HOLD_SEED).toBe(0xe8001);
  });

  it('runs suite cleanly and reports engine gate honestly', async () => {
    const results = await runAllExperiments();
    expect(results.all_pass).toBe(true);
    expect(results.n_pass).toBe(results.n_total);
    expect(results.preserves_v5).toBe(true);
    expect(results.preserves_erft_d).toBe(true);
    // Live fixtures: gate must not auto-pin; significant improvement not established
    expect(results.engine_inclusion_recommended).toBe(false);
    expect(results.verdict.engine_shelf).toBe(false);
    expect(results.verdict.nothing_to_crown).toBe(true);
    expect(results.verdict.better_combination).toBeNull();
    const gate = results.experiments.find((e) => e.id === 'E3_engine_inclusion_gate');
    expect(gate.passes).toBe(false);
    expect(gate.criteria.holdout_beats_fixed_by_15pct).toBe(false);
  }, 60_000);
});
