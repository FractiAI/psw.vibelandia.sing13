import { describe, expect, it } from 'vitest';
import { runAllExperiments } from '../../research/synthobs-human-omniversal-reality-bridge/src/experiments.mjs';
import {
  REGISTRY_ID,
  ROUTING_ROLES,
  SHIP_BLOG_SLUG,
} from '../../research/synthobs-human-omniversal-reality-bridge/src/constants.mjs';

describe('Human Omniversal Reality Bridge · catalog suite', () => {
  it('locks registry id, slug, and routing roles', () => {
    expect(REGISTRY_ID).toBe('synthobs-human-omniversal-reality-bridge-2026-08');
    expect(SHIP_BLOG_SLUG).toBe('human-reality-bridge');
    expect(ROUTING_ROLES).toContain('reality_bridge');
  });

  it('runs 10/10 deterministic fixtures', async () => {
    const r = await runAllExperiments();
    expect(r.n_total).toBe(10);
    expect(r.all_pass).toBe(true);
  });
});
