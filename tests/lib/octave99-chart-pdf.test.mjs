import { describe, it, expect } from 'vitest';
import { buildOctave99Chart } from '../../lib/octave99-chart.mjs';
import {
  buildChartPdfPages,
  buildChartPdfBytes,
  CHART_PDF_PAGE_COUNTS,
  pdfPageCountForTier,
} from '../../lib/octave99-chart-pdf.mjs';
import { buildNatalHybridTrinity } from '../../lib/octave99-natal-hybrid.mjs';

const intake = {
  name: 'Guest',
  birthDate: '1988-03-12',
  birthTime: '08:15',
  birthPlace: 'Reno',
};

describe('octave99 chart PDF deliverables', () => {
  it('maps tier to 1 / 10 / 30 pages', () => {
    expect(pdfPageCountForTier('free')).toBe(1);
    expect(pdfPageCountForTier('chart_standard')).toBe(10);
    expect(pdfPageCountForTier('chart_deluxe')).toBe(30);
    expect(CHART_PDF_PAGE_COUNTS).toEqual({ free: 1, chart_standard: 10, chart_deluxe: 30 });
  });

  it('builds exact page counts for free, standard, deluxe', () => {
    const chart = buildOctave99Chart(intake);
    const free = buildChartPdfPages(chart, { tier: 'free' });
    const std = buildChartPdfPages(chart, { tier: 'chart_standard' });
    const deluxe = buildChartPdfPages(chart, {
      tier: 'chart_deluxe',
      focus: 'craft',
      question: 'What should I protect?',
    });

    expect(free.pageCount).toBe(1);
    expect(free.pages).toHaveLength(1);
    expect(free.pages[0].lines.join(' ')).toMatch(/Sun analog|purpose|Morning/i);

    expect(std.pageCount).toBe(10);
    expect(std.pages).toHaveLength(10);
    expect(std.pages.map((p) => p.title).join(' ')).toMatch(/Natal hybrid|Daily practices|Career/i);

    expect(deluxe.pageCount).toBe(30);
    expect(deluxe.pages).toHaveLength(30);
    expect(deluxe.pages.some((p) => /Life area 0/.test(p.title))).toBe(true);
    expect(deluxe.pages.some((p) => /Life area 9/.test(p.title))).toBe(true);
    expect(deluxe.pages.at(-1).title).toMatch(/Living the chart/i);
  });

  it('renders real PDF bytes with matching page counts', async () => {
    const chart = buildOctave99Chart(intake);
    const free = await buildChartPdfBytes(chart, { tier: 'free' });
    const deluxe = await buildChartPdfBytes(chart, { tier: 'chart_deluxe' });

    expect(free.bytes[0]).toBe(0x25); // %
    expect(Buffer.from(free.bytes.slice(0, 4)).toString('utf8')).toBe('%PDF');
    expect(free.filename).toMatch(/free-1p/);
    expect(deluxe.filename).toMatch(/deluxe-30p/);
    expect(deluxe.bytes.byteLength).toBeGreaterThan(free.bytes.byteLength);
  });

  it('builds natal hybrid trinity for purpose lock', () => {
    const chart = buildOctave99Chart(intake);
    const natal = buildNatalHybridTrinity(chart);
    expect(natal.sun.analog.signName).toBeTruthy();
    expect(natal.purposeLine).toMatch(/Purpose lock/);
    expect(natal.quickAlign).toHaveLength(3);
  });
});
