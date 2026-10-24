import { describe, expect, it } from 'vitest';
import {
  DIGITAL_SEED,
  ENGINE_SHELF_SLOT,
  REGISTRY_ID,
} from '../../research/synthobs-wave-node-mathematics/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-wave-node-mathematics/src/experiments.mjs';
import { runWaveNodeLaboratory } from '../../research/synthobs-wave-node-mathematics/src/computational-lab.mjs';

describe('synthobs-wave-node-mathematics', () => {
  it('locks registry and shelf slot', () => {
    expect(REGISTRY_ID).toBe('synthobs-wave-node-mathematics-2026-10');
    expect(ENGINE_SHELF_SLOT).toBe(49);
    expect(DIGITAL_SEED).toBe(20261024);
  });

  it('runs A–E laboratory with math validation', () => {
    const lab = runWaveNodeLaboratory();
    expect(lab.A.allPass).toBe(true);
    expect(lab.B.allPass).toBe(true);
    expect(lab.C.allPass).toBe(true);
    expect(lab.D.allPass).toBe(true);
    expect(lab.E.allPass).toBe(true);
    expect(lab.summary.mathValidated).toBe(true);
    expect(lab.B.b2.meanObservedOrder).toBeGreaterThan(1.5);
    expect(lab.D.heldSummary.astar.successRate).toBe(1);
  });

  it('experiment battery all_pass', () => {
    const r = runAllExperiments();
    expect(r.all_pass).toBe(true);
    expect(r.n_pass).toBe(5);
    expect(r.enginePinRecommended).toBe(true);
  });
});
