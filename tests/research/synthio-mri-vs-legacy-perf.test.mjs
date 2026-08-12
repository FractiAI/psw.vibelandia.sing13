import { describe, it, expect } from 'vitest';
import {
  tokensFromChars,
  legacyWorkload,
  mriInterferenceWorkload,
  experimentTopologyMessageTax,
  experimentTokenPayload,
  runAllExperiments,
} from '../../research/synthio-mri-vs-legacy-perf/src/experiments.mjs';
import {
  resolveWhitepaper,
  WHITEPAPER_PUBLIC_SLUGS,
} from '../../lib/whitepaper-registry.mjs';

describe('synthio-mri-vs-legacy-perf proxies', () => {
  it('tokensFromChars uses chars÷4 ceil heuristic', () => {
    expect(tokensFromChars(48000)).toBe(12000);
    expect(tokensFromChars(2400)).toBe(600);
  });

  it('MRI nested edges beat legacy mesh at N=32', () => {
    const legacy = legacyWorkload(32);
    const mri = mriInterferenceWorkload(32);
    expect(mri.edges).toBe(31);
    expect(legacy.edges).toBe(496);
    expect(mri.totalTokens).toBeLessThan(legacy.totalTokens * 0.25);
  });

  it('E1 and E2 pass with high mean reductions', () => {
    const e1 = experimentTopologyMessageTax();
    const e2 = experimentTokenPayload();
    expect(e1.pass).toBe(true);
    expect(e2.pass).toBe(true);
    expect(e1.meanEdgeReduction).toBeCloseTo(24.8, 1);
    expect(e2.meanTokenReduction).toBeGreaterThan(0.99);
  });

  it('runAllExperiments passes E1–E6', async () => {
    const r = await runAllExperiments();
    expect(r.all_pass).toBe(true);
    expect(r.n_pass).toBe(6);
    expect(r.n_total).toBe(6);
    expect(r.summary.meanEdgeReduction).toBeCloseTo(24.8, 1);
    expect(r.summary.meanTokenReduction).toBeGreaterThan(0.99);
    expect(r.summary.meanOpsSaving).toBeGreaterThan(0.99);
  });

  it('registers whitepaper + public slug', () => {
    const p = resolveWhitepaper('synthio-mri-vs-legacy-perf-proxy-2026-08');
    const bySlug = resolveWhitepaper('synthio-mri-vs-legacy-perf');
    expect(p?.file).toBe('docs/SYNTHIO_MRI_VS_LEGACY_PERF_PROXY_2026-08.md');
    expect(bySlug?.docId).toBe('WP-SYNTHIO-MRI-VS-LEGACY-PERF-PROXY-2026-08-12');
    expect(WHITEPAPER_PUBLIC_SLUGS['synthio-mri-vs-legacy-perf-proxy-2026-08']).toBe(
      'synthio-mri-vs-legacy-perf',
    );
  });
});
