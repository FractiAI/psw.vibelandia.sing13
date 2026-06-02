import type { CatalogPrefs } from '@/lib/catalogPrefs';
import type { CatalogSnapshot, PlaylistDef, TrackDef } from '@/lib/catalogTypes';
import { localMediaKeyFor } from '@/lib/localPlayback';
import { applyLikesToPlaylists, resolveLikedTrackIds } from '@/lib/trackLikes';
import {
  MASTER_LIBRARY_UI_HINT,
  SONIC_CATALOG_DISPLAY_NAME,
} from '@/lib/sonicCatalogCopy';

export const CATALOG_VERSION = 5;

/** Master list: every upload / device import is kept here automatically. */
export const MASTER_PLAYLIST_ID = 'pl-main';

/** Auto-built from listener likes (device-local). */
export const MY_LIKES_PLAYLIST_ID = 'pl-my-likes';

export const MY_LIKES_PLAYLIST_DEFAULT_NAME = 'My Likes';

export const MY_LIKES_PLAYLIST_DEFAULT_DESCRIPTION =
  'Tracks you liked on this device — updated automatically when you tap the heart.';

export function isMyLikesPlaylist(id: string): boolean {
  return id === MY_LIKES_PLAYLIST_ID;
}

export const MASTER_PLAYLIST_DEFAULT_NAME = SONIC_CATALOG_DISPLAY_NAME;

export const MASTER_PLAYLIST_DEFAULT_DESCRIPTION = MASTER_LIBRARY_UI_HINT;

export const MASTER_PLAYLIST_LEGACY_NAME = 'All uploads';

export function isMasterPlaylist(id: string): boolean {
  return id === MASTER_PLAYLIST_ID;
}

export function isUserUploadTrack(id: string, tr: TrackDef): boolean {
  return Boolean(tr.serverHosted) || Boolean(tr.localMediaKey) || id.startsWith('trk-up-') || id.startsWith('trk-srv-');
}

/** Server catalog + user playlists + offline downloads only (no full library in browser storage). */
/** Keep just-uploaded server tracks if live sync has not caught up yet. */
export function mergePendingServerTracks(
  server: CatalogSnapshot,
  localTracks: Record<string, TrackDef>,
): CatalogSnapshot {
  const tracks = { ...server.tracks };
  let changed = false;
  for (const [id, tr] of Object.entries(localTracks)) {
    if (!tr.serverHosted || tracks[id]) continue;
    tracks[id] = tr;
    changed = true;
  }
  return changed ? { ...server, tracks } : server;
}

export function mergeServerCatalogWithPrefs(
  server: CatalogSnapshot,
  localPrefs: CatalogPrefs | null,
  downloadedTrackIds: Set<string>,
  syncMaster: (tracks: Record<string, TrackDef>, playlists: PlaylistDef[]) => PlaylistDef[],
): CatalogSnapshot {
  const tracks = { ...server.tracks };
  for (const id of downloadedTrackIds) {
    if (!tracks[id]) continue;
    tracks[id] = {
      ...tracks[id],
      downloadedLocally: true,
      localMediaKey: localMediaKeyFor(id),
    };
  }
  let playlists = server.playlists.map((p) => ({ ...p, trackIds: [...p.trackIds] }));

  if (localPrefs) {
    const byId = new Map(playlists.map((p) => [p.id, p]));
    for (const p of localPrefs.playlists) {
      if (p.id === MASTER_PLAYLIST_ID || p.id === MY_LIKES_PLAYLIST_ID) continue;
      const filtered = p.trackIds.filter((id) => tracks[id]);
      if (byId.has(p.id)) {
        byId.set(p.id, { ...byId.get(p.id)!, trackIds: filtered, name: p.name, description: p.description });
      } else if (filtered.length) {
        byId.set(p.id, { ...p, trackIds: filtered });
      }
    }
    playlists = [...byId.values()];
  }

  playlists = syncMaster(tracks, playlists);

  playlists = playlists.map((p) => {
    if (p.id !== MASTER_PLAYLIST_ID) return p;
    return {
      ...p,
      name: LEGACY_MASTER_NAMES.has(p.name) ? MASTER_PLAYLIST_DEFAULT_NAME : p.name,
      description:
        LEGACY_MASTER_DESCRIPTIONS.has(p.description) || !p.description?.trim()
          ? MASTER_PLAYLIST_DEFAULT_DESCRIPTION
          : p.description,
    };
  });

  const likedTrackIds = resolveLikedTrackIds(localPrefs, playlists);
  playlists = applyLikesToPlaylists(playlists, likedTrackIds, new Set(Object.keys(tracks)));

  const activePlaylistId =
    localPrefs?.activePlaylistId && playlists.some((p) => p.id === localPrefs.activePlaylistId)
      ? localPrefs.activePlaylistId
      : server.activePlaylistId || MASTER_PLAYLIST_ID;

  return {
    version: CATALOG_VERSION,
    tracks,
    playlists,
    activePlaylistId,
  };
}

/** Your library only — no demo / remote seed streams. */
export function buildEmptyCatalog(): CatalogSnapshot {
  return {
    version: CATALOG_VERSION,
    tracks: {},
    playlists: [
      {
        id: MASTER_PLAYLIST_ID,
        name: MASTER_PLAYLIST_DEFAULT_NAME,
        kind: 'sovereign',
        description: MASTER_PLAYLIST_DEFAULT_DESCRIPTION,
        trackIds: [],
      },
    ],
    activePlaylistId: MASTER_PLAYLIST_ID,
  };
}

function normalizeCachedTrack(id: string, tr: TrackDef): TrackDef {
  const next: TrackDef = { ...tr, id: tr.id || id };
  if (!next.downloadedLocally) {
    delete next.localMediaKey;
  } else {
    next.localMediaKey = next.localMediaKey ?? localMediaKeyFor(id);
  }
  return next;
}

/** Persisted + legacy snapshots: uploads only (drops old trk-1…552 seed rows). */
export function extractLocalTracks(snapshot: CatalogSnapshot): Record<string, TrackDef> {
  const tracks: Record<string, TrackDef> = {};
  for (const [id, tr] of Object.entries(snapshot.tracks)) {
    if (!isUserUploadTrack(id, tr)) continue;
    tracks[id] = normalizeCachedTrack(id, tr);
  }
  return tracks;
}

/** Device cache on boot — offline downloads only; server catalog comes from /api/catalog sync. */
export function extractDeviceCacheTracks(snapshot: CatalogSnapshot): Record<string, TrackDef> {
  const tracks: Record<string, TrackDef> = {};
  for (const [id, tr] of Object.entries(snapshot.tracks)) {
    if (tr.serverHosted) continue;
    if (!isUserUploadTrack(id, tr)) continue;
    tracks[id] = normalizeCachedTrack(id, tr);
  }
  return tracks;
}

const LEGACY_MASTER_NAMES = new Set([
  MASTER_PLAYLIST_LEGACY_NAME,
  'Master catalog',
  'All uploads',
  'Hero Jo Golden Bachdoor Hit Factory',
]);

const LEGACY_MASTER_DESCRIPTIONS = new Set([
  'Every upload lands here automatically. Build other playlists from this list.',
  'Every file on this device (uploads and folder imports) lives here. Other playlists are views you build from this full library.',
  'The full Reno Swamp Beats Caliente catalog — over 550 tracks.',
]);

/**
 * Uploads + user playlists only. `syncMaster` is catalogStore.syncMasterPlaylistWithTracks.
 */
export function mergeUserCatalog(
  saved: CatalogSnapshot | null,
  syncMaster: (tracks: Record<string, TrackDef>, playlists: PlaylistDef[]) => PlaylistDef[],
): CatalogSnapshot {
  const empty = buildEmptyCatalog();
  const localTracks = saved ? extractLocalTracks(saved) : {};
  const tracks = { ...localTracks };

  let playlists: PlaylistDef[] = saved?.playlists?.length
    ? saved.playlists
        .filter((p) => p.id !== 'pl-caliente' && p.id !== 'pl-backdoor' && p.id !== 'pl-broadcast' && p.id !== 'pl-open')
        .map((p) => ({
          ...p,
          trackIds: p.trackIds.filter((id) => tracks[id]),
        }))
    : [...empty.playlists];

  if (!playlists.some((p) => p.id === MASTER_PLAYLIST_ID)) {
    playlists = [empty.playlists[0], ...playlists.filter((p) => p.id !== MASTER_PLAYLIST_ID)];
  }

  playlists = syncMaster(tracks, playlists);

  playlists = playlists.map((p) => {
    if (p.id !== MASTER_PLAYLIST_ID) return p;
    return {
      ...p,
      name: LEGACY_MASTER_NAMES.has(p.name) ? MASTER_PLAYLIST_DEFAULT_NAME : p.name,
      description:
        LEGACY_MASTER_DESCRIPTIONS.has(p.description) || !p.description?.trim()
          ? MASTER_PLAYLIST_DEFAULT_DESCRIPTION
          : p.description,
    };
  });

  const likedTrackIds = resolveLikedTrackIds(
    saved
      ? {
          version: CATALOG_VERSION,
          playlists: saved.playlists,
          activePlaylistId: saved.activePlaylistId,
        }
      : null,
    playlists,
  );
  playlists = applyLikesToPlaylists(playlists, likedTrackIds, new Set(Object.keys(tracks)));

  const activePlaylistId =
    saved?.activePlaylistId && playlists.some((p) => p.id === saved.activePlaylistId)
      ? saved.activePlaylistId
      : MASTER_PLAYLIST_ID;

  return {
    version: CATALOG_VERSION,
    tracks,
    playlists,
    activePlaylistId,
  };
}
