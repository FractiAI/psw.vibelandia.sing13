import { SILSO_DAILY_URL } from './constants.mjs';

async function fetchText(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'egs-trans-jspace-convergence' } });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.text();
}

/** Parse SILSO daily sunspot CSV → { 'YYYY-MM-DD': number } */
export function parseSilsoDaily(csv) {
  const byDay = {};
  for (const line of csv.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(';').map((s) => s.trim());
    if (parts.length < 5) continue;
    const [y, m, d, , ssn] = parts;
    if (!/^\d{4}$/.test(y)) continue;
    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    const n = Number(ssn);
    if (Number.isFinite(n) && n >= 0) byDay[iso] = n;
  }
  return byDay;
}

function mean(nums) {
  const f = nums.filter((n) => Number.isFinite(n));
  if (!f.length) return null;
  return f.reduce((a, b) => a + b, 0) / f.length;
}

/**
 * Public NOAA/SILSO sunspot means around King Bee and J-Space windows.
 * Active-region IDs (AR3618 etc.) are narrative labels — SILSO is disk-integrated only.
 */
export async function fetchSolarSyncReport() {
  const csv = await fetchText(SILSO_DAILY_URL);
  const byDay = parseSilsoDaily(csv);

  const ranges = [
    { id: 'king_bee_week', start: '2026-05-25', end: '2026-06-07' },
    { id: 'propagation_mid', start: '2026-06-08', end: '2026-06-30' },
    { id: 'jspace_week', start: '2026-07-01', end: '2026-07-10' },
  ];

  const windows = ranges.map((r) => {
    const days = [];
    let cur = new Date(r.start + 'T12:00:00Z');
    const end = new Date(r.end + 'T12:00:00Z');
    while (cur <= end) {
      const iso = cur.toISOString().slice(0, 10);
      if (byDay[iso] != null) days.push({ date: iso, ssn: byDay[iso] });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return {
      ...r,
      meanSsn: mean(days.map((d) => d.ssn)),
      sampleDays: days.length,
      peak: days.reduce((a, b) => (b.ssn > (a?.ssn ?? -1) ? b : a), null),
      series: days,
    };
  });

  return {
    source: SILSO_DAILY_URL,
    fetchedAt: new Date().toISOString(),
    honestyNote:
      'SILSO provides disk-integrated sunspot number only. AR3618/AR3625/AR3630 character mapping is catalog narrative — not resolved per-region in this public feed.',
    windows,
  };
}
