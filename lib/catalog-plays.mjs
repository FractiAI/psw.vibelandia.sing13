/**
 * Global catalog track play counters (all listeners — not page visits, not device-local).
 * Reuses page-views storage backends (Upstash / Blob / memory) under a dedicated key.
 */
import { getPageVisits, incrementPageVisits, pageViewsBackend } from './page-views.mjs';

export function normalizeTrackId(raw) {
  const id = String(raw || '')
    .trim()
    .slice(0, 120)
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  return id || '';
}

export function trackPlayPageKey(trackId) {
  const id = normalizeTrackId(trackId);
  return id ? `/track-play/${id}` : '';
}

export async function getTrackPlays(trackId) {
  const id = normalizeTrackId(trackId);
  if (!id) return { trackId: '', plays: 0, key: '' };
  const key = trackPlayPageKey(id);
  const plays = await getPageVisits(key);
  return { trackId: id, plays: Number(plays) || 0, key };
}

export async function incrementTrackPlays(trackId) {
  const id = normalizeTrackId(trackId);
  if (!id) return { trackId: '', plays: 0, key: '', backend: pageViewsBackend() };
  const { key, visits, backend } = await incrementPageVisits(trackPlayPageKey(id));
  return {
    trackId: id,
    key,
    plays: Number(visits) || 0,
    backend: backend || pageViewsBackend(),
  };
}
