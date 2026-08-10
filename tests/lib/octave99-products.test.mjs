import { describe, it, expect } from 'vitest';
import { buildOctave99Chart, chartSvg, PHI_EGS } from '../../lib/octave99-chart.mjs';
import { OCTAVE99_TIERS } from '../../lib/octave99-tiers.mjs';

describe('octave99 chart engine', () => {
  it('builds deterministic chart from intake', () => {
    const a = buildOctave99Chart({
      name: 'Test',
      birthDate: '1990-08-08',
      birthTime: '14:30',
      birthPlace: 'Reno',
    });
    const b = buildOctave99Chart({
      name: 'Test',
      birthDate: '1990-08-08',
      birthTime: '14:30',
      birthPlace: 'Reno',
    });
    expect(a.bands).toHaveLength(10);
    expect(a.signature.seed).toBe(b.signature.seed);
    expect(a.phiEgs).toBe(PHI_EGS);
    expect(chartSvg(a)).toContain('<svg');
  });
});

describe('octave99 tiers', () => {
  it('matches product pricing', () => {
    expect(OCTAVE99_TIERS.free.priceUsd).toBe(0);
    expect(OCTAVE99_TIERS.agent.priceUsd).toBe(20);
    expect(OCTAVE99_TIERS.chart_standard.priceUsd).toBe(29);
    expect(OCTAVE99_TIERS.chart_deluxe.priceUsd).toBe(49);
  });
});
