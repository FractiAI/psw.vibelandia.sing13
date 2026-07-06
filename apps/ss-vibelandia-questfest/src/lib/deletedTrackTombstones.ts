const KEY = 'hjghf-deleted-track-tombstones-v1';

function readSet(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(Array.isArray(ids) ? ids.filter(Boolean) : []);
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* quota */
  }
}

export function getDeletedTrackTombstones(): Set<string> {
  return readSet();
}

export function addDeletedTrackTombstones(ids: Iterable<string>): void {
  const set = readSet();
  for (const id of ids) set.add(id);
  writeSet(set);
}

/** Drop tombstones the server no longer returns (delete confirmed). */
export function reconcileDeletedTrackTombstones(serverTrackIds: Set<string>): void {
  const set = readSet();
  if (!set.size) return;
  let changed = false;
  for (const id of [...set]) {
    if (!serverTrackIds.has(id)) {
      set.delete(id);
      changed = true;
    }
  }
  if (changed) writeSet(set);
}

export function filterSnapshotTracks<T extends { tracks: Record<string, unknown> }>(
  snapshot: T,
  tombstones: Set<string>,
): T {
  if (!tombstones.size) return snapshot;
  const tracks = { ...snapshot.tracks };
  for (const id of tombstones) delete tracks[id];
  const playlists = Array.isArray((snapshot as { playlists?: { trackIds: string[] }[] }).playlists)
    ? (snapshot as { playlists: { trackIds: string[] }[] }).playlists.map((p) => ({
        ...p,
        trackIds: p.trackIds.filter((id) => !tombstones.has(id)),
      }))
    : (snapshot as { playlists?: unknown }).playlists;
  return { ...snapshot, tracks, playlists } as T;
}
