import { describe, expect, it } from 'vitest';
import { runAllExperiments } from '../../research/synthobs-invisible-frontier-gates-ai/src/experiments.mjs';
import {
  REGISTRY_ID,
  SHIP_BLOG_SLUG,
  VOYAGE_COMPANION_IDS,
} from '../../research/synthobs-invisible-frontier-gates-ai/src/constants.mjs';

describe('Invisible Frontier · voyage editorial suite', () => {
  it('locks registry id and ship-blog slug', () => {
    expect(REGISTRY_ID).toBe('synthobs-invisible-frontier-gates-ai-2026-08');
    expect(SHIP_BLOG_SLUG).toBe('invisible-frontier');
  });

  it('links Infinite Octaves engine companions', () => {
    expect(VOYAGE_COMPANION_IDS[0]).toBe(
      'synthobs-infinite-octaves-omniversal-lattice-2026-08',
    );
  });

  it('runs 9/9 deterministic fixtures', async () => {
    const r = await runAllExperiments();
    expect(r.n_total).toBe(9);
    expect(r.all_pass).toBe(true);
  });
});
