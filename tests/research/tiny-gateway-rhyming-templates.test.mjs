import { describe, expect, it } from 'vitest';
import { runAllExperiments } from '../../research/synthobs-tiny-gateway-rhyming-templates/src/experiments.mjs';
import { DRAM_REDUCTION_TARGET } from '../../research/synthobs-tiny-gateway-rhyming-templates/src/constants.mjs';
import { ENGINE_SHELF } from '../../lib/infinite-octave-engine-shelf.mjs';

describe('Tiny Gateway · Rhyming Templates · Tiny Footprint', () => {
  it(
    'passes suite + Tiny Footprint GPU lab and keeps ENGINE_SHELF #52',
    () => {
      process.env.TINY_FOOTPRINT_FORCE_LLM_LAB = '0';
      const r = runAllExperiments();
      expect(r.all_pass).toBe(true);
      expect(r.R.pass).toBe(true);
      expect(r.R.brickAudit.pass).toBe(false);
      expect(r.H.aggregateRatio).toBeGreaterThanOrEqual(DRAM_REDUCTION_TARGET);
      expect(r.H.rhymeOk).toBe(true);
      expect(r.I.pass).toBe(true);
      expect(r.I.allocReduction).toBeGreaterThanOrEqual(0.8);
      expect(r.I.turnP50MsWith).toBeLessThan(r.I.turnP50MsWithout);
      expect(r.I.turnSpeedup).toBeGreaterThan(1);
      expect(r.J.pass).toBe(true);
      expect(r.J.report?.labKind).toBe('real_llm_local_gpu');
      expect(r.enginePinRecommended).toBe(true);
      const pin = ENGINE_SHELF.find((e) => e.order === 52);
      expect(pin?.registryId).toBe('synthobs-tiny-gateway-rhyming-templates-2026-11');
    },
    120_000,
  );
});
