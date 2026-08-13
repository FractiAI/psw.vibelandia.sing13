import { describe, it, expect } from 'vitest';
import {
  tokensFromChars,
  legacyWorkload,
  mriInterferenceWorkload,
  experimentTopologyMessageTax,
  experimentTokenPayload,
  experimentLiveWallClock,
  runAllExperiments,
} from '../../research/synthio-mri-vs-legacy-perf/src/experiments.mjs';
import { runLegacyLive, runMriLive } from '../../research/synthio-mri-vs-legacy-perf/src/live_workloads.mjs';
import { buildPhantom, simulateGreTrain } from '../../research/synthio-mri-vs-legacy-perf/src/bloch_cpu.mjs';
import {
  resolveWhitepaper,
  WHITEPAPER_PUBLIC_SLUGS,
} from '../../lib/whitepaper-registry.mjs';

describe('synthio-mri-vs-legacy-perf live Bloch', () => {
  it('tokensFromChars uses chars÷4 ceil heuristic', () => {
    expect(tokensFromChars(48000)).toBe(12000);
    expect(tokensFromChars(2400)).toBe(600);
  });

  it('Bloch GRE train returns real signal + checksum', () => {
    const phantom = buildPhantom({ nx: 6, ny: 6, nz: 2 });
    const sim = simulateGreTrain(phantom, { nTr: 8 });
    expect(sim.voxels).toBe(72);
    expect(sim.signal.length).toBe(16);
    expect(sim.checksum).toMatch(/^[0-9a-f]{16}$/);
  });

  it('live MRI arm is faster than legacy at N=8', () => {
    const legacy = runLegacyLive(8);
    const mri = runMriLive(8);
    expect(mri.ms).toBeLessThan(legacy.ms);
    expect(mri.voxelsProcessed).toBeLessThan(legacy.voxelsProcessed);
    expect(legacy.edges).toBe(28);
    expect(mri.edges).toBe(7);
  });

  it('topology helpers keep MRI edges below legacy', () => {
    const legacy = legacyWorkload(32);
    const mri = mriInterferenceWorkload(32);
    expect(mri.edges).toBe(31);
    expect(legacy.edges).toBe(496);
    expect(mri.totalTokens).toBeLessThan(legacy.totalTokens * 0.25);
  });

  it(
    'E1/E2 pass and E3 reports live wall-clock',
    () => {
      const e1 = experimentTopologyMessageTax();
      const e2 = experimentTokenPayload();
      const e3 = experimentLiveWallClock();
      expect(e1.pass).toBe(true);
      expect(e2.pass).toBe(true);
      expect(e3.pass).toBe(true);
      expect(e3.measurement.liveWallClock).toBe(true);
      expect(e3.measurement.timedWith).toBe('process.hrtime.bigint');
      expect(e3.meanSpeedup).toBeGreaterThan(1);
    },
    30_000,
  );

  it(
    'runAllExperiments passes E1–E6 with live summary',
    async () => {
      const r = await runAllExperiments();
      expect(r.all_pass).toBe(true);
      expect(r.n_pass).toBe(6);
      expect(r.summary.liveWallClock).toBe(true);
      expect(r.summary.backend).toBe('node_bloch_cpu');
      expect(r.summary.meanSpeedup).toBeGreaterThan(1);
      expect(r.honesty.empiricalProxy).toBe(false);
      expect(r.honesty.liveWallClock).toBe(true);
    },
    30_000,
  );

  it('registers whitepaper + public slug', () => {
    const p = resolveWhitepaper('synthio-mri-vs-legacy-perf-proxy-2026-08');
    const bySlug = resolveWhitepaper('synthio-mri-vs-legacy-perf');
    expect(p?.file).toBe('docs/SYNTHIO_MRI_VS_LEGACY_PERF_PROXY_2026-08.md');
    expect(bySlug?.docId).toBe('WP-SYNTHIO-MRI-VS-LEGACY-PERF-LIVE-2026-08-13');
    expect(WHITEPAPER_PUBLIC_SLUGS['synthio-mri-vs-legacy-perf-proxy-2026-08']).toBe(
      'synthio-mri-vs-legacy-perf',
    );
    expect(p?.title).toMatch(/Live Wall-Clock/i);
  });
});
