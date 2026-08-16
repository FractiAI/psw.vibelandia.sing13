import { describe, it, expect } from 'vitest';
import {
  buildOctave99Chart,
  chartSvg,
  PHI_EGS,
  buildChartReading,
  WHEEL_READING_GUIDE,
} from '../../lib/octave99-chart.mjs';
import { OCTAVE99_TIERS, honorPayHref, HONOR_PAY_MAILTO } from '../../lib/octave99-tiers.mjs';

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

  it('builds tiered readings with wheel guide on every tier', () => {
    const chart = buildOctave99Chart({
      name: 'Guest',
      birthDate: '1988-03-12',
      birthTime: '08:15',
      birthPlace: 'Reno',
    });
    const free = buildChartReading(chart, { tier: 'free' });
    const std = buildChartReading(chart, { tier: 'chart_standard' });
    const deluxe = buildChartReading(chart, {
      tier: 'chart_deluxe',
      focus: 'craft',
      season: 'mid-build',
      question: 'What should I protect?',
      lens: 'creative',
    });
    expect(free.guide).toEqual([...WHEEL_READING_GUIDE]);
    expect(std.guide).toHaveLength(WHEEL_READING_GUIDE.length);
    expect(deluxe.guide).toHaveLength(WHEEL_READING_GUIDE.length);
    expect(free.summary.loudest).toHaveLength(3);
    expect(free.upsell.standard.price).toBe(29);
    expect(free.upsell.deluxe.price).toBe(49);
    expect(std.overview).toHaveLength(10);
    expect(deluxe.narratives).toHaveLength(10);
    expect(deluxe.narratives[0].narrative).toMatch(/Digit/);
    expect(deluxe.deluxeBridge.focus).toBe('craft');
    expect(chartSvg(chart, { tier: 'free' })).toContain('Free summary');
    expect(chartSvg(chart, { tier: 'chart_standard' })).toContain('Overall');
    expect(chartSvg(chart, { deluxe: true })).toContain('Deluxe');
  });
});

describe('octave99 tiers', () => {
  it('matches product pricing', () => {
    expect(OCTAVE99_TIERS.free.priceUsd).toBe(0);
    expect(OCTAVE99_TIERS.agent.priceUsd).toBe(20);
    expect(OCTAVE99_TIERS.chart_standard.priceUsd).toBe(29);
    expect(OCTAVE99_TIERS.chart_deluxe.priceUsd).toBe(49);
  });

  it('routes paid unlocks to the honor payment rail', () => {
    expect(honorPayHref('chart_standard')).toContain('/hire-a-goldilocks-valet-concierge/pay');
    expect(honorPayHref('chart_standard')).toContain('unit=standard');
    expect(honorPayHref('chart_deluxe')).toContain('unit=deluxe');
    expect(HONOR_PAY_MAILTO).not.toMatch(/^mailto:/);
  });
});
