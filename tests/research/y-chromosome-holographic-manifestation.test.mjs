import { describe, expect, it } from 'vitest';
import { runAllExperiments } from '../../research/synthobs-y-chromosome-holographic-manifestation/src/experiments.mjs';
import {
  REGISTRY_ID,
  SHIP_BLOG_SLUG,
  PALINDROME_INDICES,
} from '../../research/synthobs-y-chromosome-holographic-manifestation/src/constants.mjs';

describe('synthobs-y-chromosome-holographic-manifestation suite', () => {
  it('locks registry and ship-blog slug', () => {
    expect(REGISTRY_ID).toBe('synthobs-y-chromosome-holographic-manifestation-2026-08');
    expect(SHIP_BLOG_SLUG).toBe('y-chromosome-manifestation');
  });

  it('locks palindrome octave indices', () => {
    expect(PALINDROME_INDICES).toEqual([-4, -2, 0, 2, 4]);
  });

  it('runs 10/10 empirical fixtures', async () => {
    const result = await runAllExperiments();
    expect(result.n_total).toBe(10);
    expect(result.n_pass).toBe(10);
    expect(result.all_pass).toBe(true);
    expect(result.failed).toEqual([]);
  });
});
