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

  it('builds plain-speak written charts worth each tier', () => {
    const chart = buildOctave99Chart({
      name: 'Guest',
      birthDate: '1988-03-12',
      birthTime: '08:15',
      birthPlace: 'Reno',
    });
    expect(chart.grandNarrative?.character?.title).toBeTruthy();
    expect(chart.grandNarrative?.placement?.act?.label).toMatch(/Act/);
    expect(chart.grandNarrative?.dailyPractices?.morning).toBeTruthy();

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
    expect(free.letter.length).toBeGreaterThan(400);
    expect(free.letter).toMatch(/grand Story character/i);
    expect(free.characterCard.title).toBe(chart.grandNarrative.character.title);
    expect(free.dailyPractices.morning).toBeTruthy();
    expect(free.letter).not.toMatch(/Zero-Point Vacuum|Φ_EGS|catalog shelf/i);
    expect(free.highlights).toHaveLength(3);
    expect(free.weeklyMoves.length).toBeGreaterThanOrEqual(3);
    expect(free.upsell.standard.price).toBe(29);

    expect(std.letter).toMatch(/grand Story character/i);
    expect(std.highlights).toHaveLength(10);
    expect(std.dailyPractices.approachBoost).toMatch(/approach character/i);

    expect(deluxe.letter.length).toBeGreaterThan(400);
    expect(deluxe.highlights).toHaveLength(10);
    expect(deluxe.answerBlock).toMatch(/What should I protect/);
    expect(deluxe.dailyPractices.innerCare).toMatch(/inner character/i);
    expect(deluxe.materials.plain).toMatch(/Making\/craft/);

    expect(chartSvg(chart, { tier: 'free' })).toContain('free summary');
    expect(chartSvg(chart, { tier: 'chart_standard' })).toContain('overall chart');
    expect(chartSvg(chart, { deluxe: true })).toContain('deluxe');
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
