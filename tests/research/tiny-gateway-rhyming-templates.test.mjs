import { describe, expect, it } from 'vitest';
import { runAllExperiments } from '../../research/synthobs-tiny-gateway-rhyming-templates/src/experiments.mjs';
import { DRAM_REDUCTION_TARGET } from '../../research/synthobs-tiny-gateway-rhyming-templates/src/constants.mjs';
import { ENGINE_SHELF } from '../../lib/infinite-octave-engine-shelf.mjs';

describe('Tiny Gateway · Rhyming Templates', () => {
  it('passes E1–E8 and data-gates ENGINE_SHELF #52', () => {
    const r = runAllExperiments();
    expect(r.all_pass).toBe(true);
    expect(r.H.aggregateRatio).toBeGreaterThanOrEqual(DRAM_REDUCTION_TARGET);
    expect(r.enginePinRecommended).toBe(true);
    const pin = ENGINE_SHELF.find((e) => e.order === 52);
    expect(pin?.registryId).toBe('synthobs-tiny-gateway-rhyming-templates-2026-11');
  });
});
