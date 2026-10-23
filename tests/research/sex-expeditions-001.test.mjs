import { describe, expect, it } from 'vitest';
import {
  DOC_ID,
  REGISTRY_ID,
  RANDOM_SEED,
  N_TOTAL,
  REAL_DATA_PENDING,
} from '../../research/synthobs-sex-expeditions-001/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-sex-expeditions-001/src/experiments.mjs';
import { runSex001Laboratory } from '../../research/synthobs-sex-expeditions-001/src/computational-lab.mjs';

describe('synthobs-sex-expeditions-001', () => {
  it('locks document identity and synthetic sample size', () => {
    expect(DOC_ID).toBe('WP-SYNTHOBS-SEX-EXPEDITIONS-001-EGS-2026-10-23');
    expect(REGISTRY_ID).toBe('synthobs-sex-expeditions-001-2026-10');
    expect(RANDOM_SEED).toBe(20261023);
    expect(N_TOTAL).toBe(28000);
    expect(REAL_DATA_PENDING).toBe(true);
  });

  it('passes the empirical battery', async () => {
    const results = await runAllExperiments();
    expect(results.failed).toEqual([]);
    expect(results.all_pass).toBe(true);
  });

  it('reproduces locked mean held-out R² under seed 20261023', () => {
    const lab = runSex001Laboratory();
    expect(lab.means.combined_additive).toBeCloseTo(0.768, 2);
    expect(lab.means.combined_interaction).toBeCloseTo(0.785, 2);
    expect(lab.findings.F1_combined_improves).toBe(true);
    expect(lab.findings.F3_interactions_can_matter).toBe(true);
  });
});
