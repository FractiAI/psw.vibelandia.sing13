const STORAGE_KEY = 'qv-free-full-play-v1';

function readSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
  } catch {
    return new Set();
  }
}

function writeSet(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* quota */
  }
}

/** @deprecated Catalog streaming is always free — kept for localStorage cleanup compatibility. */
export function hasFreeFullPlayRemaining(trackId: string): boolean {
  if (!trackId) return false;
  return !readSet().has(trackId);
}

/** @deprecated No longer consumed — streaming is free. */
export function markFreeFullPlayConsumed(trackId: string) {
  if (!trackId) return;
  const ids = readSet();
  if (ids.has(trackId)) return;
  ids.add(trackId);
  writeSet(ids);
}

/**
 * Preview gate is retired: streaming the Sonic Singularity catalog is always free.
 * Downloads remain Fair Exchange at $1.61/track.
 */
export function shouldPreviewGate(
  _trackId: string | null | undefined,
  _fullPlayUnlocked: boolean,
  _playlistKind: 'open_deck' | 'sovereign' | undefined,
): boolean {
  return false;
}
