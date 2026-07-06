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

/** Visitor has not yet used their one free full play on this track. */
export function hasFreeFullPlayRemaining(trackId: string): boolean {
  if (!trackId) return false;
  return !readSet().has(trackId);
}

export function markFreeFullPlayConsumed(trackId: string) {
  if (!trackId) return;
  const ids = readSet();
  if (ids.has(trackId)) return;
  ids.add(trackId);
  writeSet(ids);
}

/** Preview gate applies after the free full play is consumed (members always exempt). */
export function shouldPreviewGate(
  trackId: string | null | undefined,
  fullPlayUnlocked: boolean,
  playlistKind: 'open_deck' | 'sovereign' | undefined,
): boolean {
  if (fullPlayUnlocked || !trackId) return false;
  if (playlistKind !== 'sovereign') return false;
  return !hasFreeFullPlayRemaining(trackId);
}
