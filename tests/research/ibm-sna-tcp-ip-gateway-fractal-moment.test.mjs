import { describe, it, expect } from 'vitest';
import {
  cosineSimilarity,
  latticeRetentionAtBand,
  flatRetentionAfterHops,
  routingLoads,
  experimentPhiLock,
  experimentGatewayFractalEcho,
  experimentMultiOctaveCoherence,
  experimentResourceRouting,
  experimentMagnitudeSelfSimilarity,
  experimentCompanionLock,
  experimentCeoTipContract,
  experimentOverallVerdict,
  runAllExperiments,
} from '../../research/synthobs-ibm-sna-tcp-ip-gateway-fractal-moment/src/experiments.mjs';
import {
  PHI_EGS,
  REGISTRY_ID,
  SHIP_BLOG_SLUG,
  RESEARCH_QUESTION,
} from '../../research/synthobs-ibm-sna-tcp-ip-gateway-fractal-moment/src/constants.mjs';
import {
  resolveWhitepaper,
  WHITEPAPER_PUBLIC_SLUGS,
} from '../../lib/whitepaper-registry.mjs';

describe('synthobs-ibm-sna-tcp-ip-gateway-fractal-moment', () => {
  it('E1 locks Φ_EGS', () => {
    const e1 = experimentPhiLock();
    expect(e1.pass).toBe(true);
    expect(PHI_EGS).toBeCloseTo((1 + Math.sqrt(5)) / 2, 12);
  });

  it('E2 Lattice echoes SNA/IP gateway more than vibe flat', () => {
    const e2 = experimentGatewayFractalEcho();
    expect(e2.pass).toBe(true);
    expect(e2.echoLattice).toBeGreaterThan(e2.echoVibe);
  });

  it('E3 multi-octave coherence beats flat decay', () => {
    const e3 = experimentMultiOctaveCoherence();
    expect(e3.pass).toBe(true);
    expect(e3.latticeMean).toBeGreaterThan(e3.flatMean);
  });

  it('E4 routing savings are material', () => {
    const e4 = experimentResourceRouting();
    expect(e4.pass).toBe(true);
    expect(e4.savingsPct).toBeGreaterThanOrEqual(55);
  });

  it('E5 self-similar Φ step', () => {
    expect(experimentMagnitudeSelfSimilarity().pass).toBe(true);
  });

  it('E6–E8 companions, CEO tip, verdict', async () => {
    expect(experimentCompanionLock().pass).toBe(true);
    expect(experimentCeoTipContract().pass).toBe(true);
    const overall = experimentOverallVerdict();
    expect(overall.pass).toBe(true);
    expect(overall.verdict.answer).toBe('yes');
    const all = await runAllExperiments();
    expect(all.all_pass).toBe(true);
  });

  it('math helpers stay Goldilocks', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1, 9);
    expect(latticeRetentionAtBand(0)).toBeGreaterThan(flatRetentionAfterHops(3));
    expect(routingLoads(8).lattice).toBeLessThan(routingLoads(8).vibe);
  });

  it('registry + public slug wired', () => {
    expect(RESEARCH_QUESTION.length).toBeGreaterThan(40);
    expect(WHITEPAPER_PUBLIC_SLUGS[REGISTRY_ID]).toBe(SHIP_BLOG_SLUG);
    const entry = resolveWhitepaper(REGISTRY_ID);
    expect(entry?.file).toContain('IBM_SNA_TCP_IP_GATEWAY');
    expect(entry?.featured).toBe(true);
  });
});
