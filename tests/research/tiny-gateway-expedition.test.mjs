import { describe, expect, it } from 'vitest';
import {
  ARCHITECTURE_STACK,
  ENGINE_SHELF_PINNED,
  EXPEDITION,
  RADAR_PARAMS,
  REGISTRY_ID,
} from '../../research/synthobs-tiny-gateway-expedition/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-tiny-gateway-expedition/src/experiments.mjs';

describe('Tiny Gateway Expedition 001', () => {
  it('locks expedition identity and assignment radar params', () => {
    expect(EXPEDITION).toBe('Tiny Gateway Expedition');
    expect(REGISTRY_ID).toBe('synthobs-tiny-gateway-expedition-2026-11');
    expect(ENGINE_SHELF_PINNED).toBe(false);
    expect(ARCHITECTURE_STACK).toHaveLength(7);
    expect(RADAR_PARAMS.observations).toBe(86_400);
  });

  it(
    'runs E1–E8 with assignment synthetic primary and refuses engine pin',
    async () => {
      const r = await runAllExperiments();
      expect(r.all_pass).toBe(true);
      expect(r.n_pass).toBe(8);
      expect(r.n_total).toBe(8);
      expect(r.B.sourceMode).toBe('assignment_civilian_synthetic');
      expect(r.B.fixture.nObservations).toBe(86_400);
      const e8 = r.experiments.find((e) => e.id === 'E8_engine_pin_gate');
      expect(e8?.enginePinRecommended).toBe(false);
      expect(r.A.accuracy.tinyGateway.n).toBeGreaterThan(0);
      expect(r.C.stages.select.n).toBeGreaterThanOrEqual(100);
    },
    120_000,
  );
});
