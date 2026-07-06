import type { TrackDef } from '@/lib/catalogTypes';
import { playbackUrlForTrack } from '@/lib/isVideoTrack';

/** Fisher–Yates shuffle with crypto RNG when available. */
export function shuffleIdsCrypto(ids: readonly string[]): string[] {
  const out = [...ids];
  for (let i = out.length - 1; i > 0; i--) {
    let j: number;
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const u = new Uint32Array(1);
      crypto.getRandomValues(u);
      j = u[0]! % (i + 1);
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }
    const a = out[i]!;
    const b = out[j]!;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

export function filterPlayableTrackIds(
  trackIds: readonly string[],
  getTrack: (id: string) => TrackDef | undefined,
): string[] {
  const out: string[] = [];
  for (const id of trackIds) {
    const tr = getTrack(id);
    if (!tr) continue;
    if (playbackUrlForTrack(tr)) out.push(id);
  }
  return out;
}

export function playlistOrderFingerprint(playlistId: string, trackIds: readonly string[]): string {
  return `${playlistId}\t${trackIds.join('\t')}`;
}

/** Next/prev track with a URL; wraps at playlist ends (continuous loop). */
export function nextSequentialTrackId(
  trackIds: readonly string[],
  currentId: string | null,
  delta: 1 | -1,
  getTrack: (id: string) => TrackDef | undefined,
): string | null {
  const playable = filterPlayableTrackIds(trackIds, getTrack);
  const n = playable.length;
  if (!n) return null;

  const idx = currentId ? playable.indexOf(currentId) : -1;
  if (idx < 0) {
    return playable[delta > 0 ? 0 : n - 1] ?? null;
  }

  for (let s = 1; s <= n; s++) {
    const j = (idx + delta * s + n * 16) % n;
    const id = playable[j]!;
    if (id !== currentId) return id;
  }
  return null;
}

/**
 * Next/prev in shuffled ring. `shuffleQueue` should list playable ids only.
 */
export function nextShuffledTrackId(
  shuffleQueue: readonly string[],
  currentId: string | null,
  delta: 1 | -1,
  getTrack: (id: string) => TrackDef | undefined,
): string | null {
  if (!shuffleQueue.length) return null;
  const n = shuffleQueue.length;
  let idx = currentId ? shuffleQueue.indexOf(currentId) : -1;
  if (idx < 0) {
    if (!currentId) {
      return (
        shuffleQueue.find((id) => {
          const t = getTrack(id);
          return t && playbackUrlForTrack(t);
        }) ?? null
      );
    }
    /* Current track outside the shuffle ring — still walk the full queue. */
    const start = delta > 0 ? 0 : n - 1;
    for (let s = 0; s < n; s++) {
      const j = (start + delta * s + n * 16) % n;
      const id = shuffleQueue[j]!;
      if (id === currentId) continue;
      const tr = getTrack(id);
      if (tr && playbackUrlForTrack(tr)) return id;
    }
    return null;
  }
  for (let s = 1; s <= n; s++) {
    const j = (idx + delta * s + n * 16) % n;
    const id = shuffleQueue[j]!;
    const tr = getTrack(id);
    if (tr && playbackUrlForTrack(tr)) return id;
  }
  return null;
}
