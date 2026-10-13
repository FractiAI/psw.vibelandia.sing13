import { describe, it, expect } from 'vitest';
import { runAllExperiments } from '../../research/synthobs-computation-workhorse-science/src/experiments.mjs';

describe('synthobs-computation-workhorse-science', () => {
  it('runAllExperiments all_pass (CW-2 synthetic)', async () => {
    const results = await runAllExperiments();
    expect(results.failed, results.failed.join(', ')).toEqual([]);
    expect(results.all_pass).toBe(true);
  });
});
