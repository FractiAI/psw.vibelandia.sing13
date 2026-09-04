import { describe, expect, it } from 'vitest';
import {
  runAllExperiments,
  experimentTakeawayPaperMap,
  experimentMockHtmlLinks,
  experimentCompanionSnaBridge,
  experimentEgsGoldenKeyLock,
  experimentFairExchangeClause,
  experimentShipSurfaces,
} from '../../research/synthobs-pdvsa-gateway-ops-mockup/src/experiments.mjs';
import {
  DOC_ID,
  REGISTRY_ID,
  SHIP_BLOG_SLUG,
  LIVE_SIMULATOR_PATH,
  PHI_EGS,
  EXECUTIVE_TAKEAWAYS,
  FAIR_EXCHANGE_CLAUSE,
} from '../../research/synthobs-pdvsa-gateway-ops-mockup/src/constants.mjs';

describe('synthobs-pdvsa-gateway-ops-mockup', () => {
  it('locks registry, doc id, ship-blog, simulator path', () => {
    expect(REGISTRY_ID).toBe('synthobs-pdvsa-gateway-ops-mockup-2026-09');
    expect(DOC_ID).toBe('WP-SYNTHOBS-PDVSA-GATEWAY-OPS-MOCKUP-2026-09-04');
    expect(SHIP_BLOG_SLUG).toBe('pdvsa-gateway-ops-mockup');
    expect(LIVE_SIMULATOR_PATH).toBe('/special-projects/pdvsa-gateway-ops');
    expect(PHI_EGS).toBeCloseTo((1 + Math.sqrt(5)) / 2, 12);
    expect(EXECUTIVE_TAKEAWAYS).toHaveLength(9);
  });

  it('E1 takeaway → paper map', () => {
    const e1 = experimentTakeawayPaperMap();
    expect(e1.pass).toBe(true);
  });

  it('E2 mock HTML clickable takeaways', () => {
    const e2 = experimentMockHtmlLinks();
    expect(e2.pass).toBe(true);
  });

  it('E3 companion SNA bridge soft-ok', () => {
    const e3 = experimentCompanionSnaBridge();
    expect(e3.pass).toBe(true);
  });

  it('E4 Φ_EGS and clutch Δ lock', () => {
    expect(experimentEgsGoldenKeyLock().pass).toBe(true);
  });

  it('E5 Fair Exchange clause', () => {
    expect(FAIR_EXCHANGE_CLAUSE).toMatch(/Fair Exchange/);
    expect(experimentFairExchangeClause().pass).toBe(true);
  });

  it('E6 ship surfaces', () => {
    expect(experimentShipSurfaces().pass).toBe(true);
  });

  it('runAllExperiments all_pass', async () => {
    const r = await runAllExperiments();
    expect(r.n_total).toBe(6);
    expect(r.all_pass).toBe(true);
  });
});
