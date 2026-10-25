import { describe, expect, it } from 'vitest';
import {
  BIO_PIPE_BPS,
  ENGINE_SHELF_PINNED,
  REGISTRY_ID,
  TREATMENTS,
} from '../../research/synthobs-trgm-gateway-agent-performance/src/constants.mjs';
import { runAllExperiments } from '../../research/synthobs-trgm-gateway-agent-performance/src/experiments.mjs';

describe('synthobs-trgm-gateway-agent-performance', () => {
  it('locks application companion ids and treatments', () => {
    expect(REGISTRY_ID).toBe('synthobs-trgm-gateway-agent-performance-2026-10');
    expect(ENGINE_SHELF_PINNED).toBe(false);
    expect(BIO_PIPE_BPS).toBe(10);
    expect(TREATMENTS.withGateway.id).toBe('with_trgm_gateway');
    expect(TREATMENTS.withoutGateway.id).toBe('without_trgm_gateway');
  });

  it(
    'E1–E8 with-gateway agents beat without-gateway on task battery',
    () => {
      const r = runAllExperiments();
      expect(r.all_pass).toBe(true);
      expect(r.n_total).toBe(8);
      expect(r.n_pass).toBe(8);
      expect(r.engineShelfPinned).toBe(false);
      expect(r.findingsAbstract.withGatewayNav).toBeGreaterThan(
        r.findingsAbstract.withoutGatewayNav,
      );
      expect(r.findingsAbstract.withGatewayViability).toBeGreaterThan(
        r.findingsAbstract.withoutGatewayViability,
      );
      expect(r.findingsAbstract.withGatewayCoherence).toBeGreaterThan(
        r.findingsAbstract.withoutGatewayCoherence,
      );
      expect(r.findingsAbstract.withChannelBA).toBeGreaterThan(
        r.findingsAbstract.withoutChannelBA,
      );
      expect(r.findingsAbstract.bioPipeBps).toBe(10);
      expect(r.experiments.map((e) => e.id)).toEqual([
        'E1',
        'E2',
        'E3',
        'E4',
        'E5',
        'E6',
        'E7',
        'E8',
      ]);
    },
    60_000,
  );
});
