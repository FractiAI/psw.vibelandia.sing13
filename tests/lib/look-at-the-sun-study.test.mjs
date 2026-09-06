import { describe, it, expect } from 'vitest';
import {
  mondayUtc,
  addDays,
  parseSilsoDaily,
  parseSwpcDailyIndices,
  dailyF107FromNoonJson,
  expandMonthlyF107,
  f107ForDay,
  mean,
  pearson,
  buildWeekList,
  weekDays,
} from '../../lib/look-at-the-sun-study.mjs';

describe('date helpers', () => {
  it('mondayUtc snaps any day to its week Monday', () => {
    for (const iso of ['2026-09-01', '2026-09-03', '2026-09-05', '2026-09-06', '2026-09-07']) {
      const d = new Date(mondayUtc(new Date(`${iso}T12:00:00Z`)));
      expect(d.getUTCDay()).toBe(1);
      const src = new Date(`${iso}T12:00:00Z`);
      expect(d.getTime()).toBeLessThanOrEqual(src.getTime());
      expect(src.getTime() - d.getTime()).toBeLessThan(7 * 86400000);
    }
  });

  it('addDays crosses month boundaries', () => {
    expect(addDays('2026-01-28', 7)).toBe('2026-02-04');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('buildWeekList returns ascending weekly Mondays ending at the anchor', () => {
    const weeks = buildWeekList('2026-08-31', 3);
    expect(weeks).toEqual(['2026-08-17', '2026-08-24', '2026-08-31']);
  });

  it('weekDays expands one week of days', () => {
    expect(weekDays('2026-08-31')).toHaveLength(7);
    expect(weekDays('2026-08-31')[0]).toBe('2026-08-31');
    expect(weekDays('2026-08-31')[6]).toBe('2026-09-06');
  });
});

describe('solar parsers', () => {
  it('parseSilsoDaily keeps valid daily rows and drops malformed ones', () => {
    const csv = [
      '# Silver comment line',
      '2026; 7; 1;  54; 145;;;',
      '2026; 7; 2;  54; 150;;;',
      'not; a; real; row; x;;;',
      '2026; 7; 3;  54; -5;;;', // negative SSN dropped
    ].join('\n');
    expect(parseSilsoDaily(csv)).toEqual({ '2026-07-01': 145, '2026-07-02': 150 });
  });

  it('parseSwpcDailyIndices splits ssn and f107 columns', () => {
    const txt = [
      '2026  07  01  142  144',
      '2026  07  02  150  151',
      'garbage line',
    ].join('\n');
    expect(parseSwpcDailyIndices(txt)).toEqual({
      ssn: { '2026-07-01': 144, '2026-07-02': 151 },
      f107: { '2026-07-01': 142, '2026-07-02': 150 },
    });
  });

  it('dailyF107FromNoonJson keeps only Noon reporting rows', () => {
    const rows = [
      { time_tag: '2026-07-01T00:00:00Z', reporting_schedule: 'Daily', flux: 999 },
      { time_tag: '2026-07-01T12:00:00Z', reporting_schedule: 'Noon', flux: 142 },
      { time_tag: '2026-07-02T12:00:00Z', reporting_schedule: 'Noon', flux: 150 },
    ];
    expect(dailyF107FromNoonJson(rows)).toEqual({ '2026-07-01': 142, '2026-07-02': 150 });
  });

  it('f107ForDay falls back daily noon → SWPC daily → monthly → null', () => {
    const dailyNoon = { '2026-07-01': 142 };
    const swpcDaily = { '2026-07-02': 150 };
    const monthly = { '2026-07': 155, '2026-06': 135 };
    expect(f107ForDay('2026-07-01', dailyNoon, swpcDaily, monthly)).toBe(142);
    expect(f107ForDay('2026-07-02', dailyNoon, swpcDaily, monthly)).toBe(150);
    expect(f107ForDay('2026-07-03', dailyNoon, swpcDaily, monthly)).toBe(155);
    expect(f107ForDay('2026-05-03', dailyNoon, swpcDaily, monthly)).toBeNull();
  });

  it('expandMonthlyF107 accepts both header styles and skips non-positive flux', () => {
    expect(
      expandMonthlyF107([
        { 'time-tag': '2026-06', 'f10.7': 135 },
        { time_tag: '2026-07', f107: 150 },
        { 'time-tag': '2026-05', 'f10.7': 0 },
        { 'time-tag': 'bad', 'f10.7': 100 },
      ]),
    ).toEqual({ '2026-06': 135, '2026-07': 150 });
  });
});

describe('statistics helpers', () => {
  it('mean ignores non-finite values and returns null when empty', () => {
    expect(mean([1, 2, 3])).toBe(2);
    expect(mean([1, null, 3])).toBe(2);
    expect(mean([null, undefined])).toBeNull();
  });

  it('pearson returns 1 for perfectly correlated series and null when under-paired', () => {
    expect(pearson([1, 2, 3, 4, 5], [2, 4, 6, 8, 10])).toBeCloseTo(1, 12);
    expect(pearson([1, 2, 3], [1, 2, 3])).toBeNull();
    expect(pearson([1, 2, 3, 4], [4, 3, 2, 1])).toBeCloseTo(-1, 12);
  });
});
