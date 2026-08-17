import { describe, it, expect } from 'vitest';
import {
  buildDailyShipBulletin,
  formatGuestDateline,
  todayYmd,
} from '../../lib/daily-ship-bulletin.mjs';

describe('daily-ship-bulletin steward', () => {
  it('formats guest dateline', () => {
    const d = formatGuestDateline('2026-08-16');
    expect(d.weekday).toBe('Sunday');
    expect(d.newsLabel).toContain('August 16');
    expect(d.shortBoard).toContain('Puerto Reno');
  });

  it('builds hgaios-first highlights for 2026-08-17', async () => {
    const payload = await buildDailyShipBulletin({ date: '2026-08-17' });
    expect(payload.ok).toBe(true);
    expect(payload.date).toBe('2026-08-17');
    expect(payload.highlights[0].id).toBe('synthobs-tbme-egs-hgaios-2026-08');
    expect(payload.htmlBody).toContain('tbme-egs-hgaios');
    expect(payload.honesty).toMatch(/Guest hospitality/i);
  });

  it('todayYmd is YYYY-MM-DD', () => {
    expect(todayYmd(new Date('2026-08-16T12:00:00Z'))).toBe('2026-08-16');
  });
});
