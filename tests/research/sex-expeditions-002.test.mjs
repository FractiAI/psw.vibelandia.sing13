import { describe, expect, it } from 'vitest';
import {
  DOC_ID,
  REGISTRY_ID,
  RANDOM_SEED,
  N_STEPS,
  SYSTEMATIC_REVIEW_PENDING,
} from '../../research/synthobs-sex-expeditions-002/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-sex-expeditions-002/src/experiments.mjs';
import { runSex002Laboratory } from '../../research/synthobs-sex-expeditions-002/src/computational-lab.mjs';

describe('synthobs-sex-expeditions-002', () => {
  it('locks document identity and pilot horizon', () => {
    expect(DOC_ID).toBe('WP-SYNTHOBS-SEX-EXPEDITIONS-002-EGS-2026-10-23');
    expect(REGISTRY_ID).toBe('synthobs-sex-expeditions-002-2026-10');
    expect(RANDOM_SEED).toBe(20261023);
    expect(N_STEPS).toBe(500);
    expect(SYSTEMATIC_REVIEW_PENDING).toBe(true);
  });

  it('passes the empirical battery', async () => {
    const results = await runAllExperiments();
    expect(results.failed).toEqual([]);
    expect(results.all_pass).toBe(true);
  });

  it('locks qualitative pilot findings under seed 20261023', () => {
    const lab = runSex002Laboratory();
    expect(lab.findings.F1_additive_memory_lowest_tracking_rmse).toBe(true);
    expect(lab.findings.F2_recursive_smoother_than_additive_memory).toBe(true);
    expect(lab.findings.F4_ablation_shows_metric_tradeoff).toBe(true);
    const am = lab.models.find((m) => m.id === 'additive_memory');
    expect(am.tracking_rmse).toBeCloseTo(0.1435, 3);
  });
});
