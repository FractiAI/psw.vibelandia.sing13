import { describe, expect, it } from 'vitest';
import {
  runAllExperiments,
  experimentGatewayFractalTemplate,
  experimentOctaveRoutingVsFlat,
  experimentCrossDomainCoherence,
  experimentTokenReceiptBridge,
  experimentEgsGoldenKeyLock,
  experimentFairExchangeClause,
} from '../../research/synthobs-ibm-sna-tcpip-gateway-omni-lattice/src/experiments.mjs';
import {
  DOC_ID,
  REGISTRY_ID,
  SHIP_BLOG_SLUG,
  PHI_EGS,
  FAIR_EXCHANGE_CLAUSE,
} from '../../research/synthobs-ibm-sna-tcpip-gateway-omni-lattice/src/constants.mjs';

describe('synthobs-ibm-sna-tcpip-gateway-omni-lattice', () => {
  it('locks registry, doc id, and ship-blog slug', () => {
    expect(REGISTRY_ID).toBe('synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09');
    expect(DOC_ID).toBe('WP-SYNTHOBS-IBM-SNA-TCPIP-GATEWAY-OMNI-LATTICE-2026-09-03');
    expect(SHIP_BLOG_SLUG).toBe('sna-tcpip-gateway-omni-lattice');
    expect(PHI_EGS).toBeCloseTo((1 + Math.sqrt(5)) / 2, 12);
  });

  it('E1 three-shell gateway fractal template', () => {
    const e1 = experimentGatewayFractalTemplate();
    expect(e1.pass).toBe(true);
    expect(e1.shells).toHaveLength(3);
  });

  it('E2 lattice cost under 15% of flat for N>=6', () => {
    const e2 = experimentOctaveRoutingVsFlat();
    expect(e2.pass).toBe(true);
    expect(e2.latticeFractionOfFlat).toBeLessThan(0.15);
  });

  it('E3 lattice coherence high, flat low after switches', () => {
    const e3 = experimentCrossDomainCoherence();
    expect(e3.pass).toBe(true);
    expect(e3.latticeFinal).toBeGreaterThan(0.85);
    expect(e3.flatFinal).toBeLessThan(0.5);
  });

  it('E4 companion receipt soft-ok when missing or present', () => {
    const e4 = experimentTokenReceiptBridge();
    expect(e4.pass).toBe(true);
  });

  it('E5 Φ_EGS and clutch Δ lock', () => {
    const e5 = experimentEgsGoldenKeyLock();
    expect(e5.pass).toBe(true);
  });

  it('E6 Fair Exchange clause present', () => {
    expect(FAIR_EXCHANGE_CLAUSE).toMatch(/Fair Exchange/);
    const e6 = experimentFairExchangeClause();
    expect(e6.pass).toBe(true);
  });

  it('runAllExperiments all_pass (E4 soft allowed)', async () => {
    const r = await runAllExperiments();
    expect(r.n_total).toBe(6);
    expect(r.abstractFindings).toBeTruthy();
    expect(r.all_pass).toBe(true);
  });
});
