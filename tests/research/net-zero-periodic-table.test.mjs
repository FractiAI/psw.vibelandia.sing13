import { describe, expect, it } from 'vitest';
import { runAllExperiments } from '../../research/synthobs-net-zero-periodic-table/src/experiments.mjs';
import { NOVEL_OBSERVATION_CATALOG } from '../../research/synthobs-net-zero-periodic-table/src/novel-observations.mjs';

describe('Net Zero Expedition 002 · periodic table complements', () => {
  it('passes E1–E8 and supports the novel observation catalog', () => {
    const r = runAllExperiments();
    expect(r.all_pass).toBe(true);
    expect(r.n_pass).toBe(8);
    expect(r.B.allPositive).toBe(true);
    expect(r.B.spearmanRhoVsPeriod).toBeLessThan(-0.5);
    expect(r.novelObservations.nSupported).toBe(NOVEL_OBSERVATION_CATALOG.length);
    expect(r.engineShelfPinned).toBe(false);
  });
});
