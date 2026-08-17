/**
 * Global track play totals (all listeners). Shown as the jukebox “Visits” mark.
 */

declare global {
  interface Window {
    QVPageViews?: {
      record?: (loc?: Location, extra?: string) => void;
      recordWithKey?: (key: string) => void;
      pageKey?: (loc?: Location, extra?: string) => string;
      showCount?: (count: number, label?: string) => void;
      clearCount?: () => void;
    };
  }
}

const DEDUPE_MS = 2500;
let lastRecord = { id: '', at: 0 };

function showVisits(count: number) {
  window.QVPageViews?.showCount?.(count, 'Visits');
}

export async function fetchTrackPlays(trackId: string): Promise<number | null> {
  const id = String(trackId || '').trim();
  if (!id) return null;
  try {
    const res = await fetch(`/api/catalog-plays?trackId=${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const n = Number(data?.plays ?? data?.visits);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Increment global play count once per new playback start (all users). */
export function recordCatalogPlay(trackId: string): void {
  const id = String(trackId || '').trim();
  if (!id) return;
  const now = Date.now();
  if (lastRecord.id === id && now - lastRecord.at < DEDUPE_MS) return;
  lastRecord = { id, at: now };

  void fetch('/api/catalog-plays', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackId: id }),
    keepalive: true,
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const n = Number(data?.plays ?? data?.visits);
      if (Number.isFinite(n)) showVisits(n);
    })
    .catch(() => {});
}

export async function showTrackPlayVisits(trackId: string | null | undefined): Promise<number | null> {
  if (!trackId) {
    window.QVPageViews?.clearCount?.();
    return null;
  }
  const n = await fetchTrackPlays(trackId);
  if (typeof n === 'number') showVisits(n);
  return n;
}
