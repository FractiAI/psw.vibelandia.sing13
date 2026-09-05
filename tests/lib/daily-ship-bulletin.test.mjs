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

  it('leads News of the day with newest ship notes (not a frozen evergreen list)', async () => {
    const payload = await buildDailyShipBulletin({ date: '2026-08-25' });
    expect(payload.highlights[0].id).toBe(
      'synthobs-triadic-nested-hemispheres-99-octave-2026-08',
    );
    expect(payload.htmlBody).toMatch(/nested domes|Triadic|amphitheater/i);
    expect(payload.htmlBody).toContain('triadic-hemispheres');
    expect(payload.newsLabel).toContain('August 25');
  });

  it('leads 2026-08-28 with Y Chromosome Manifestation paper', async () => {
    const payload = await buildDailyShipBulletin({ date: '2026-08-28' });
    expect(payload.highlights[0].id).toBe(
      'synthobs-y-chromosome-holographic-manifestation-2026-08',
    );
    expect(payload.htmlBody).toMatch(/Y Chromosome|manifestation|MSY/i);
    expect(payload.htmlBody).toContain('y-chromosome-manifestation');
    expect(payload.newsLabel).toContain('August 28');
  });

  it('leads 2026-09-05 with newest three ship notes (ISO timestamps count as same day)', async () => {
    const payload = await buildDailyShipBulletin({ date: '2026-09-05' });
    expect(payload.highlights.map((h) => h.id)).toEqual([
      'synthobs-prime-indexed-volumetric-storage-2026-09',
      'synthobs-protein-folding-prime-container-2026-09',
      'synthobs-what-it-means-to-be-frontier-2026-09',
    ]);
    expect(payload.highlights[0].href).toBe('/ship-blog/prime-indexed-volumetric-storage');
    expect(payload.htmlBody).toMatch(/prime-indexed volumetric|parity tax|Φ/i);
    expect(payload.htmlBody).toContain('prime-indexed-volumetric-storage');
    expect(payload.newsLabel).toContain('September 5');
  });

  it('leads 2026-09-04 News tip with PDVSA Gateway Ops Mockup', async () => {
    const payload = await buildDailyShipBulletin({ date: '2026-09-04' });
    expect(payload.highlights[0].id).toBe(
      'synthobs-pdvsa-gateway-ops-mockup-2026-09',
    );
    expect(payload.htmlBody).toMatch(/PDVSA|Gateway Ops|simulator|takeaway/i);
    expect(payload.htmlBody).toContain('pdvsa-gateway-ops');
    expect(payload.newsLabel).toContain('September 4');
  });

  it('leads 2026-09-03 News tip with SNA gateway Omni-Lattice case study', async () => {
    const payload = await buildDailyShipBulletin({ date: '2026-09-03' });
    expect(payload.highlights[0].id).toBe(
      'synthobs-ibm-sna-tcpip-gateway-omni-lattice-2026-09',
    );
    expect(payload.htmlBody).toMatch(/SNA|gateway|Omni-Lattice|Caracas/i);
    expect(payload.htmlBody).toContain('sna-tcpip-gateway-omni-lattice');
    expect(payload.newsLabel).toContain('September 3');
  });

  it('leads 2026-08-26 with Invisible Frontier editorial', async () => {
    const payload = await buildDailyShipBulletin({ date: '2026-08-26' });
    expect(payload.highlights[0].id).toBe(
      'synthobs-invisible-frontier-gates-ai-2026-08',
    );
    expect(payload.htmlBody).toMatch(/Invisible Frontier|Gates/i);
    expect(payload.htmlBody).toContain('invisible-frontier');
    expect(payload.newsLabel).toContain('August 26');
  });

  it('leads News of the day with why-you-care, not a paper list', async () => {
    const payload = await buildDailyShipBulletin({ date: '2026-08-22' });
    expect(payload.htmlBody).toMatch(/Today’s care|Today’s news/i);
    expect(payload.htmlBody).not.toMatch(/^On the board today:/);
    expect(payload.htmlBody).not.toMatch(/settling around a clear pair of maps/i);
    expect(payload.htmlBody).not.toMatch(/and <a [^>]+>[^<]+<\/a> close by/);
    expect(payload.htmlBody.indexOf('If you want a map')).toBeGreaterThan(20);
  });

  it('todayYmd is YYYY-MM-DD', () => {
    expect(todayYmd(new Date('2026-08-16T12:00:00Z'))).toBe('2026-08-16');
  });
});
