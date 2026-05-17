import type { CatalogTrack } from '@/lib/catalogTypes';

/** M:SS or H:MM:SS */
export function fmtDuration(sec?: number): string {
  if (sec == null || !Number.isFinite(sec)) return '—';
  const total = Math.max(0, Math.floor(Number(sec)));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function sumTrackDurationSec(
  trackIds: string[],
  getTrack: (id: string) => CatalogTrack | undefined,
): { totalSec: number; knownCount: number } {
  let totalSec = 0;
  let knownCount = 0;
  for (const id of trackIds) {
    const d = getTrack(id)?.durationSec;
    if (d != null && Number.isFinite(d)) {
      totalSec += d;
      knownCount += 1;
    }
  }
  return { totalSec, knownCount };
}

/** Total run time for a playlist; trailing + when some tracks lack duration metadata. */
export function fmtPlaylistTotalTime(
  trackIds: string[],
  getTrack: (id: string) => CatalogTrack | undefined,
): string {
  if (trackIds.length === 0) return '0:00';
  const { totalSec, knownCount } = sumTrackDurationSec(trackIds, getTrack);
  if (knownCount === 0) return '—';
  const label = fmtDuration(totalSec);
  if (knownCount < trackIds.length) return `${label}+`;
  return label;
}
