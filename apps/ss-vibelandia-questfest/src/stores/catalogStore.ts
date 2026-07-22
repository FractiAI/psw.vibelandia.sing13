import { create } from 'zustand';
import { usePlaybackStore } from '@/stores/playbackStore';
import {
  buildEmptyCatalog,
  CATALOG_VERSION,
  MASTER_PLAYLIST_ID,
  mergePendingServerTracks,
  mergeServerCatalogWithPrefs,
  isMasterPlaylist,
  isMyLikesPlaylist,
  isUserUploadTrack,
} from '@/lib/catalogSeed';
import {
  applyLikesToPlaylists,
  resolveLikedTrackIds,
  saveLikedTrackIds,
  toggleLikedId,
} from '@/lib/trackLikes';
import {
  loadDeviceDirHandle,
  saveDeviceDirHandle,
} from '@/lib/catalogPersistence';
import {
  addDeletedTrackTombstones,
  filterSnapshotTracks,
  getDeletedTrackTombstones,
  reconcileDeletedTrackTombstones,
} from '@/lib/deletedTrackTombstones';
import { hydrateCatalogFromDevice, instantBootSnapshot } from '@/lib/catalogBoot';
import {
  insertPlaylistMenuOrderAfter,
  normalizePlaylistMenuOrder,
} from '@/lib/playlistMenuOrder';
import {
  loadCatalogCache,
  loadCatalogPrefs,
  loadCatalogPrefsOnly,
  loadDownloadedTrackIds,
  saveCatalogCache,
  saveCatalogPrefs,
} from '@/lib/catalogPrefs';
import { coverFileToPersistableDataUrl } from '@/lib/coverImageFile';
import {
  deleteTrackOnServer,
  deleteTracksOnServer,
  fetchLiveCatalogForSync,
  isServerUploadConfigured,
  reconcileServerCatalog,
  updateTrackOnServer,
  uploadCoverBlob,
  uploadPlaylistCoverBlob,
  uploadTrackToServer,
  syncUserPlaylistsToServer,
} from '@/lib/serverCatalog';
import { localMediaKeyFor } from '@/lib/localPlayback';
import type { CatalogSnapshot, PlaylistDef, PlaylistKind, TrackDef } from '@/lib/catalogTypes';
import {
  DEFAULT_ARTIST,
  TRACK_DESCRIPTION_MAX,
  TRACK_GENRE_MAX,
} from '@/lib/catalogTypes';
import {
  fileSourceKey,
  pickMediaDirectory,
  scanDirectoryHandle,
  titleFromFileName,
} from '@/lib/deviceMediaScan';
import {
  classifyFilesAgainstCatalog,
  type ImportDuplicate,
} from '@/lib/mediaImportPreflight';
import {
  canNestPlaylist,
  flattenPlaylistTrackIds,
  getDirectChildPlaylists,
  normalizeChildPlaylistIds,
  resolvePlaylistTrackIds,
  stripPlaylistFromAllParents,
} from '@/lib/playlistNest';
import { resyncShuffleQueueForPlaylist } from '@/lib/shuffleSync';
import { isIOSDevice, retainSingleFileForIOS, retainFileForBulkUpload, BULK_RETAIN_UPFRONT_MAX } from '@/lib/devicePlayback';

type View = 'catalog' | 'dj';

let playlistSyncTimer: ReturnType<typeof setTimeout> | null = null;
const pendingPlaylistDeletes = new Set<string>();
let playlistSyncInFlight = false;
let playlistSyncQueued = false;

async function pushSharedPlaylists(playlists: PlaylistDef[]): Promise<void> {
  if (!isServerUploadConfigured()) return;
  if (playlistSyncInFlight) {
    playlistSyncQueued = true;
    return;
  }
  playlistSyncInFlight = true;
  const deleteIds = [...pendingPlaylistDeletes];
  pendingPlaylistDeletes.clear();
  try {
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await syncUserPlaylistsToServer(playlists, {
          deleteIds: deleteIds.length ? deleteIds : undefined,
        });
        useCatalogStore.setState({
          playlistSyncError: null,
          playlistSyncAt: new Date().toISOString(),
        });
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => window.setTimeout(r, 400 * (attempt + 1)));
      }
    }
    if (lastErr) {
      const message =
        lastErr instanceof Error ? lastErr.message : 'Playlist sync to shared catalog failed.';
      useCatalogStore.setState({ playlistSyncError: message });
    }
  } finally {
    playlistSyncInFlight = false;
    if (playlistSyncQueued) {
      playlistSyncQueued = false;
      void pushSharedPlaylists(useCatalogStore.getState().playlists);
    }
  }
}

function scheduleSharedPlaylistSync(playlists: PlaylistDef[], opts?: { immediate?: boolean }): void {
  if (!isServerUploadConfigured()) return;
  if (playlistSyncTimer) clearTimeout(playlistSyncTimer);
  const run = () => {
    playlistSyncTimer = null;
    void pushSharedPlaylists(playlists);
  };
  if (opts?.immediate) {
    run();
    return;
  }
  playlistSyncTimer = setTimeout(run, 900);
}

interface CatalogState {
  catalogSyncing: boolean;
  view: View;
  djMode: boolean;
  /** Playlists tab — pause/hide playback chrome (iOS blue-screen guard). */
  playlistTab: boolean;
  tracks: Record<string, TrackDef>;
  playlists: PlaylistDef[];
  activePlaylistId: string;
  /** Device-local likes (newest first); drives My Likes playlist. */
  likedTrackIds: string[];
  /** Device-local menu order for user playlists (not master / likes). */
  userPlaylistMenuOrder: string[];
  /** Last shared-playlist sync error (null when healthy). */
  playlistSyncError: string | null;
  /** ISO timestamp of last successful shared-playlist sync. */
  playlistSyncAt: string | null;
  search: string;
  isTrackLiked: (trackId: string) => boolean;
  toggleTrackLike: (trackId: string) => void;
  setView: (v: View) => void;
  setDjMode: (on: boolean) => void;
  setPlaylistTab: (on: boolean) => void;
  setSearch: (q: string) => void;
  setActivePlaylist: (id: string) => void;
  getActivePlaylist: () => PlaylistDef | undefined;
  getTrack: (id: string) => TrackDef | undefined;
  listTracksForActivePlaylist: () => TrackDef[];
  /** All playable track ids including nested playlists (for next/prev/shuffle). */
  getResolvedTrackIds: (playlistId?: string) => string[];
  getChildPlaylists: (playlistId: string) => PlaylistDef[];
  listAllTracks: () => TrackDef[];
  createPlaylist: (name: string, parentPlaylistId?: string) => string;
  renamePlaylist: (id: string, name: string) => void;
  updatePlaylist: (
    id: string,
    patch: { name?: string; description?: string; posterSrc?: string | null; kind?: PlaylistKind },
    opts?: { coverFile?: File | null; onProgress?: (message: string) => void },
  ) => Promise<void>;
  deletePlaylist: (id: string) => void;
  /** Clone a non-master playlist; returns new id or empty string if invalid. */
  duplicatePlaylist: (id: string) => string;
  reorderUserPlaylistMenu: (fromIndex: number, toIndex: number) => void;
  moveUserPlaylistMenu: (playlistId: string, dir: -1 | 1) => void;
  addTrackToPlaylist: (trackId: string, playlistId: string) => void;
  removeTrackFromPlaylist: (trackId: string, playlistId: string) => void;
  moveTrackInPlaylist: (playlistId: string, trackId: string, dir: -1 | 1) => void;
  reorderTrackInPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  moveTrackToPlaylist: (trackId: string, targetPlaylistId: string) => void;
  /** Nest an existing playlist inside another (folder). */
  addPlaylistToPlaylist: (childPlaylistId: string, parentPlaylistId: string) => void;
  removePlaylistFromPlaylist: (childPlaylistId: string, parentPlaylistId: string) => void;
  /** Set which user playlists (non-master) include this track. */
  setTrackPlaylistMembership: (trackId: string, playlistIds: string[]) => void;
  uploadTrack: (
    file: File,
    meta: { title: string; artist: string; description?: string; playlistIds: string[] },
  ) => Promise<string>;
  importMediaFiles: (
    files: File[],
    opts?: {
      artist?: string;
      description?: string;
      genre?: string;
      title?: string;
      playlistIds?: string[];
      coverFile?: File | null;
      onProgress?: (message: string) => void;
      /** Fires after each successful file in a batch — bulk progress + live catalog size. */
      onTrackAdded?: (info: {
        catalogSize: number;
        addedInBatch: number;
        fileIndex: number;
        fileTotal: number;
      }) => void;
      /** Large bulk uploader — skip per-file metadata probes. */
      skipDurationProbe?: boolean;
      /** Bulk queue — reconcile/sync once after the full run. */
      deferServerSync?: boolean;
      /** Caller already loaded files into memory (bulk uploader). */
      skipBulkRetain?: boolean;
    },
  ) => Promise<{
    added: number;
    skipped: number;
    addedTrackIds: string[];
    failed: number;
    failures: Array<{ name: string; message: string }>;
    coverError?: string;
  }>;
  scanDeviceLibrary: (opts?: { pickFolder?: boolean; onProgress?: (message: string) => void }) => Promise<{
    added: number;
    skipped: number;
    duplicates: ImportDuplicate[];
    addedTrackIds: string[];
  }>;
  updateTrack: (
    trackId: string,
    patch: {
      title?: string;
      artist?: string;
      genre?: string;
      description?: string;
    },
    opts?: { coverFile?: File | null; onProgress?: (message: string) => void },
  ) => Promise<void>;
  deleteTrack: (trackId: string, opts?: { skipConfirm?: boolean }) => Promise<void>;
  /** Bulk delete — one confirm; returns ids removed from local catalog. */
  deleteTracks: (
    trackIds: string[],
    opts?: { skipConfirm?: boolean; purgeLocalOrphans?: boolean; skipSync?: boolean },
  ) => Promise<string[]>;
  uploadTrackCover: (trackId: string, file: File) => Promise<void>;
  /** Pull library from QUESTFEST server (streaming catalog). */
  syncLibraryFromServer: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
  /** After user downloads a track for offline playback. */
  markTrackDownloaded: (trackId: string) => void;
  /** Restore device cache/prefs after instant empty boot. */
  hydrateFromDevice: () => void;
  deviceHydrated: boolean;
  persist: () => void;
}

function applyServerCatalog(
  server: CatalogSnapshot,
  prefs: ReturnType<typeof loadCatalogPrefs>,
  downloaded: Set<string>,
): {
  tracks: Record<string, TrackDef>;
  playlists: PlaylistDef[];
  activePlaylistId: string;
  likedTrackIds: string[];
} {
  const base = mergeServerCatalogWithPrefs(server, prefs, downloaded, syncMasterPlaylistWithTracks);
  const likedTrackIds = resolveLikedTrackIds(prefs, base.playlists);
  return {
    tracks: base.tracks,
    playlists: base.playlists,
    activePlaylistId: base.activePlaylistId,
    likedTrackIds,
  };
}

function serverTracksForCache(tracks: Record<string, TrackDef>): Record<string, TrackDef> {
  const out: Record<string, TrackDef> = {};
  for (const [id, tr] of Object.entries(tracks)) {
    out[id] = {
      id: tr.id,
      title: tr.title,
      artist: tr.artist,
      src: tr.src,
      ...(tr.videoSrc ? { videoSrc: tr.videoSrc } : {}),
      ...(tr.description ? { description: tr.description } : {}),
      ...(tr.genre ? { genre: tr.genre } : {}),
      ...(tr.durationSec != null ? { durationSec: tr.durationSec } : {}),
      ...(tr.uploadedAt ? { uploadedAt: tr.uploadedAt } : {}),
      serverHosted: true,
    };
  }
  return out;
}

function cloneSnapshot(s: CatalogSnapshot): CatalogSnapshot {
  return {
    ...s,
    tracks: { ...s.tracks },
    playlists: s.playlists.map((p) => ({ ...p, trackIds: [...p.trackIds] })),
  };
}

/** Fast append during multi-file batches — full master reorder runs once in persist(). */
function appendTrackToPlaylistsIncremental(
  playlists: PlaylistDef[],
  trackId: string,
  playlistIds: string[],
): PlaylistDef[] {
  return playlists.map((p) => {
    if (!playlistIds.includes(p.id)) return p;
    if (p.trackIds.includes(trackId)) return p;
    return { ...p, trackIds: [...p.trackIds, trackId] };
  });
}

/** After each successful upload — sidebar / track count update immediately. */
function appendImportedTrackToState(
  set: (fn: (s: CatalogState) => Partial<CatalogState>) => void,
  get: () => CatalogState,
  track: TrackDef,
  playlistIds: string[],
  opts?: { batch?: boolean },
) {
  set((s) => {
    const tracks = { ...s.tracks, [track.id]: track };
    const playlists = opts?.batch
      ? appendTrackToPlaylistsIncremental(s.playlists, track.id, playlistIds)
      : syncMasterPlaylistWithTracks(
          tracks,
          s.playlists.map((p) => {
            if (!playlistIds.includes(p.id)) return p;
            if (p.trackIds.includes(track.id)) return p;
            return { ...p, trackIds: [...p.trackIds, track.id] };
          }),
        );
    return { tracks, playlists };
  });
  if (!opts?.batch) get().persist();
}

const BETWEEN_UPLOAD_MS = 280;
/** Skip per-file duration probe above this batch size (large imports). */
const SKIP_DURATION_PROBE_MIN_BATCH = 15;

/** Active bulk imports — defer server sync until batch finishes. */
let bulkImportDepth = 0;

export function isBulkImportActive(): boolean {
  return bulkImportDepth > 0;
}

/** Yield main thread between blob uploads (large batches). */
function yieldBetweenUploads(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, BETWEEN_UPLOAD_MS);
  });
}

/** Master playlist = all track ids: keep existing order, append any new ids, drop missing files. */
function syncMasterPlaylistWithTracks(
  tracks: Record<string, TrackDef>,
  playlists: PlaylistDef[],
): PlaylistDef[] {
  const idx = playlists.findIndex((p) => p.id === MASTER_PLAYLIST_ID);
  if (idx === -1) return playlists;
  const master = playlists[idx];
  const valid = new Set(Object.keys(tracks));
  const kept = master.trackIds.filter((id) => valid.has(id));
  const inKept = new Set(kept);
  const missing = Object.keys(tracks)
    .filter((id) => !inKept.has(id))
    .sort((a, b) => {
      const ua = tracks[a].uploadedAt ?? '';
      const ub = tracks[b].uploadedAt ?? '';
      if (ua !== ub) return ub.localeCompare(ua);
      return a.localeCompare(b);
    });
  const nextIds = [...kept, ...missing];
  const unchanged =
    nextIds.length === master.trackIds.length && nextIds.every((id, i) => id === master.trackIds[i]);
  if (unchanged) return playlists;
  const next = [...playlists];
  next[idx] = { ...master, trackIds: nextIds };
  return next;
}

function clampDescription(text?: string): string | undefined {
  const t = text?.trim();
  if (!t) return undefined;
  return t.slice(0, TRACK_DESCRIPTION_MAX);
}

function clampGenre(text?: string): string | undefined {
  const t = text?.trim();
  if (!t) return undefined;
  return t.slice(0, TRACK_GENRE_MAX);
}

async function syncServerTrackPlaylists(trackId: string, playlistIds: string[]) {
  if (!isServerUploadConfigured()) return;
  const tr = useCatalogStore.getState().tracks[trackId];
  if (!tr?.serverHosted) return;
  const userIds = playlistIds.filter((id) => !isMasterPlaylist(id));
  await updateTrackOnServer(trackId, { playlistIds: userIds });
}

async function addFileAsTrack(
  file: File,
  existing: { tracks: Record<string, TrackDef>; sourceKeys: Set<string> },
  meta: {
    title?: string;
    artist?: string;
    description?: string;
    genre?: string;
    useFileNameAsTitle?: boolean;
    onProgress?: (line: string) => void;
    skipDurationProbe?: boolean;
  },
): Promise<{ track: TrackDef; catalog?: CatalogSnapshot } | null> {
  const sourceKey = fileSourceKey(file);
  if (existing.sourceKeys.has(sourceKey)) return null;

  const trimmedTitle = meta.title?.trim();
  const displayTitle =
    trimmedTitle || (meta.useFileNameAsTitle ? titleFromFileName(file.name) : 'Untitled');
  const description = clampDescription(meta.description);
  const genre = clampGenre(meta.genre);

  if (!isServerUploadConfigured()) {
    const err = new Error('catalog_upload_unconfigured') as Error & { code?: string };
    err.code = 'catalog_upload_unconfigured';
    throw err;
  }

  const { track } = await uploadTrackToServer(
    file,
    {
      title: displayTitle,
      artist: meta.artist?.trim() || DEFAULT_ARTIST,
      description,
      genre,
    },
    { onProgress: meta.onProgress, skipDurationProbe: meta.skipDurationProbe },
  );

  return {
    track: {
      ...track,
      title: displayTitle,
      artist: meta.artist?.trim() || track.artist || DEFAULT_ARTIST,
      ...(description ? { description } : {}),
      ...(genre ? { genre } : {}),
      sourceKey,
      serverHosted: true,
    },
  };
}

function snapshotToState(snapshot: CatalogSnapshot) {
  return {
    tracks: snapshot.tracks,
    playlists: snapshot.playlists,
    activePlaylistId: snapshot.activePlaylistId,
  };
}

const bootCatalog = snapshotToState(instantBootSnapshot());

export const useCatalogStore = create<CatalogState>((set, get) => ({
  catalogSyncing: false,
  view: 'catalog',
  djMode: false,
  playlistTab: false,
  tracks: bootCatalog.tracks,
  playlists: bootCatalog.playlists,
  activePlaylistId: bootCatalog.activePlaylistId,
  likedTrackIds: [],
  userPlaylistMenuOrder: [],
  playlistSyncError: null,
  playlistSyncAt: null,
  deviceHydrated: false,
  search: '',

  isTrackLiked: (trackId) => get().likedTrackIds.includes(trackId),

  toggleTrackLike: (trackId) => {
    if (!get().tracks[trackId]) return;
    const likedTrackIds = toggleLikedId(get().likedTrackIds, trackId);
    const playlists = applyLikesToPlaylists(
      get().playlists,
      likedTrackIds,
      new Set(Object.keys(get().tracks)),
    );
    set({ likedTrackIds, playlists });
    get().persist();
  },

  hydrateFromDevice: () => {
    if (get().deviceHydrated) return;
    const snapshot = hydrateCatalogFromDevice(syncMasterPlaylistWithTracks);
    const applied = snapshotToState(snapshot);
    const prefs = loadCatalogPrefsOnly();
    const likedTrackIds = resolveLikedTrackIds(prefs, applied.playlists);
    const userPlaylistMenuOrder = normalizePlaylistMenuOrder(prefs?.userPlaylistMenuOrder, applied.playlists);
    set({
      tracks: applied.tracks,
      playlists: applied.playlists,
      activePlaylistId: applied.activePlaylistId,
      likedTrackIds,
      userPlaylistMenuOrder,
      deviceHydrated: true,
    });
    saveLikedTrackIds(likedTrackIds);
    get().persist();
  },

  setView: (v) => set({ view: v }),
  setDjMode: (on) => set({ djMode: on, view: on ? 'dj' : 'catalog', playlistTab: on ? false : get().playlistTab }),
  setPlaylistTab: (on) => set({ playlistTab: on }),
  setSearch: (q) => set({ search: q }),
  setActivePlaylist: (id) => {
    set({ activePlaylistId: id, view: 'catalog' });
    get().persist();
  },

  getActivePlaylist: () => get().playlists.find((p) => p.id === get().activePlaylistId),

  getTrack: (id) => get().tracks[id],

  listTracksForActivePlaylist: () => {
    const pl = get().getActivePlaylist();
    if (!pl) return [];
    return pl.trackIds.map((id) => get().tracks[id]).filter(Boolean) as TrackDef[];
  },

  getResolvedTrackIds: (playlistId) => {
    const id = playlistId ?? get().activePlaylistId;
    if (!id) return [];
    return resolvePlaylistTrackIds(id, get().tracks, get().playlists);
  },

  getChildPlaylists: (playlistId) => getDirectChildPlaylists(playlistId, get().playlists),

  listAllTracks: () => Object.values(get().tracks),

  createPlaylist: (name, parentPlaylistId) => {
    const id = `pl-${Date.now()}`;
    set((s) => {
      let playlists: PlaylistDef[] = [
        ...s.playlists,
        {
          id,
          name: name.trim() || 'New playlist',
          kind: 'sovereign',
          description: '',
          trackIds: [],
        },
      ];
      if (
        parentPlaylistId &&
        canNestPlaylist(parentPlaylistId, id, playlists) &&
        !isMasterPlaylist(parentPlaylistId) &&
        !isMyLikesPlaylist(parentPlaylistId)
      ) {
        playlists = stripPlaylistFromAllParents(id, playlists).map((p) => {
          if (p.id !== parentPlaylistId) return p;
          return {
            ...p,
            childPlaylistIds: [...normalizeChildPlaylistIds(p.childPlaylistIds), id],
          };
        });
      }
      return { playlists, activePlaylistId: id, userPlaylistMenuOrder: [...s.userPlaylistMenuOrder.filter((pid) => pid !== id), id] };
    });
    get().persist();
    scheduleSharedPlaylistSync(get().playlists, { immediate: true });
    return id;
  },

  renamePlaylist: (id, name) => {
    if (isMyLikesPlaylist(id)) return;
    set((s) => ({
      playlists: s.playlists.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)),
    }));
    get().persist();
    scheduleSharedPlaylistSync(get().playlists, { immediate: true });
  },

  updatePlaylist: async (id, patch, opts) => {
    if (isMyLikesPlaylist(id)) return;
    const prev = get().playlists.find((p) => p.id === id);
    if (!prev) return;
    const report = opts?.onProgress;

    let posterSrc = prev.posterSrc;
    if (patch.posterSrc === null) {
      posterSrc = undefined;
    } else if (patch.posterSrc !== undefined) {
      posterSrc = patch.posterSrc || undefined;
    }

    if (opts?.coverFile) {
      report?.('Saving cover…');
      try {
        if (isServerUploadConfigured()) {
          posterSrc = await uploadPlaylistCoverBlob(id, opts.coverFile, { onProgress: report });
        } else {
          posterSrc = await coverFileToPersistableDataUrl(opts.coverFile);
        }
      } catch (e) {
        const code = e instanceof Error ? e.message : 'cover_not_image';
        throw Object.assign(new Error(code), { code });
      }
    }

    report?.('Saving playlist…');
    set((s) => ({
      playlists: s.playlists.map((p) => {
        if (p.id !== id) return p;
        const next: PlaylistDef = {
          ...p,
          ...(patch.name !== undefined ? { name: patch.name.trim() || p.name } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
          ...(patch.kind !== undefined ? { kind: patch.kind } : {}),
        };
        if (posterSrc) next.posterSrc = posterSrc;
        else delete next.posterSrc;
        return next;
      }),
    }));
    get().persist();
    scheduleSharedPlaylistSync(get().playlists, { immediate: true });
  },

  deletePlaylist: (id) => {
    if (id === MASTER_PLAYLIST_ID || isMyLikesPlaylist(id)) return;
    const { playlists, activePlaylistId, userPlaylistMenuOrder } = get();
    if (playlists.length <= 1) return;
    pendingPlaylistDeletes.add(id);
    let next = stripPlaylistFromAllParents(id, playlists).filter((p) => p.id !== id);
    set({
      playlists: next,
      activePlaylistId: activePlaylistId === id ? next[0]?.id ?? MASTER_PLAYLIST_ID : activePlaylistId,
      userPlaylistMenuOrder: userPlaylistMenuOrder.filter((pid) => pid !== id),
    });
    get().persist();
    scheduleSharedPlaylistSync(get().playlists, { immediate: true });
  },

  duplicatePlaylist: (id) => {
    if (id === MASTER_PLAYLIST_ID || isMyLikesPlaylist(id)) return '';
    const s = get();
    const src = s.playlists.find((p) => p.id === id);
    if (!src) return '';
    const newId = `pl-${Date.now()}`;
    const baseName = src.name.trim() || 'Playlist';
    set((s) => ({
      playlists: [
        ...s.playlists,
        {
          id: newId,
          name: `Copy of ${baseName}`,
          kind: 'sovereign' as const,
          description: src.description,
          trackIds: [...src.trackIds],
          ...(src.posterSrc ? { posterSrc: src.posterSrc } : {}),
        },
      ],
      activePlaylistId: newId,
      userPlaylistMenuOrder: insertPlaylistMenuOrderAfter(s.userPlaylistMenuOrder, newId, id),
    }));
    get().persist();
    scheduleSharedPlaylistSync(get().playlists, { immediate: true });
    return newId;
  },

  reorderUserPlaylistMenu: (fromIndex, toIndex) => {
    const { playlists, userPlaylistMenuOrder } = get();
    const ordered = normalizePlaylistMenuOrder(userPlaylistMenuOrder, playlists);
    if (fromIndex < 0 || fromIndex >= ordered.length || toIndex < 0 || toIndex >= ordered.length) return;
    if (fromIndex === toIndex) return;
    const next = [...ordered];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    set({ userPlaylistMenuOrder: next });
    get().persist();
  },

  moveUserPlaylistMenu: (playlistId, dir) => {
    const { playlists, userPlaylistMenuOrder } = get();
    const ordered = normalizePlaylistMenuOrder(userPlaylistMenuOrder, playlists);
    const idx = ordered.indexOf(playlistId);
    if (idx < 0) return;
    const to = idx + dir;
    if (to < 0 || to >= ordered.length) return;
    get().reorderUserPlaylistMenu(idx, to);
  },

  addPlaylistToPlaylist: (childPlaylistId, parentPlaylistId) => {
    if (!canNestPlaylist(parentPlaylistId, childPlaylistId, get().playlists)) return;
    set((s) => {
      let playlists = stripPlaylistFromAllParents(childPlaylistId, s.playlists);
      playlists = playlists.map((p) => {
        if (p.id !== parentPlaylistId) return p;
        const childPlaylistIds = normalizeChildPlaylistIds(p.childPlaylistIds);
        if (childPlaylistIds.includes(childPlaylistId)) return p;
        return { ...p, childPlaylistIds: [...childPlaylistIds, childPlaylistId] };
      });
      return { playlists };
    });
    get().persist();
  },

  removePlaylistFromPlaylist: (childPlaylistId, parentPlaylistId) => {
    set((s) => ({
      playlists: s.playlists.map((p) => {
        if (p.id !== parentPlaylistId) return p;
        const childPlaylistIds = normalizeChildPlaylistIds(p.childPlaylistIds).filter(
          (cid) => cid !== childPlaylistId,
        );
        return {
          ...p,
          childPlaylistIds: childPlaylistIds.length ? childPlaylistIds : undefined,
        };
      }),
    }));
    get().persist();
  },

  addTrackToPlaylist: (trackId, playlistId) => {
    if (isMyLikesPlaylist(playlistId)) {
      if (!get().isTrackLiked(trackId)) get().toggleTrackLike(trackId);
      return;
    }
    set((s) => ({
      playlists: s.playlists.map((p) => {
        if (p.id !== playlistId) return p;
        if (p.trackIds.includes(trackId)) return p;
        return { ...p, trackIds: [...p.trackIds, trackId] };
      }),
    }));
    get().persist();
  },

  removeTrackFromPlaylist: (trackId, playlistId) => {
    if (playlistId === MASTER_PLAYLIST_ID) return;
    if (isMyLikesPlaylist(playlistId)) {
      if (get().isTrackLiked(trackId)) get().toggleTrackLike(trackId);
      return;
    }
    set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === playlistId ? { ...p, trackIds: p.trackIds.filter((t) => t !== trackId) } : p,
      ),
    }));
    get().persist();
  },

  moveTrackInPlaylist: (playlistId, trackId, dir) => {
    set((s) => ({
      playlists: s.playlists.map((p) => {
        if (p.id !== playlistId) return p;
        const idx = p.trackIds.indexOf(trackId);
        if (idx === -1) return p;
        const j = idx + dir;
        if (j < 0 || j >= p.trackIds.length) return p;
        const ids = [...p.trackIds];
        [ids[idx], ids[j]] = [ids[j], ids[idx]];
        return { ...p, trackIds: ids };
      }),
    }));
    get().persist();
  },

  reorderTrackInPlaylist: (playlistId, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    set((s) => {
      const playlists = s.playlists.map((p) => {
        if (p.id !== playlistId) return p;
        const ids = [...p.trackIds];
        if (fromIndex < 0 || fromIndex >= ids.length) return p;
        const clamped = Math.max(0, Math.min(toIndex, ids.length - 1));
        const [item] = ids.splice(fromIndex, 1);
        ids.splice(clamped, 0, item);
        return { ...p, trackIds: ids };
      });
      const likedTrackIds = isMyLikesPlaylist(playlistId)
        ? (playlists.find((p) => p.id === playlistId)?.trackIds ?? s.likedTrackIds)
        : s.likedTrackIds;
      return { playlists, likedTrackIds };
    });
    get().persist();
  },

  moveTrackToPlaylist: (trackId, targetPlaylistId) => {
    set((s) => {
      const next = s.playlists.map((pl) => ({
        ...pl,
        trackIds: pl.trackIds.filter((t) => t !== trackId),
      }));
      const i = next.findIndex((p) => p.id === targetPlaylistId);
      if (i === -1) return s;
      next[i] = {
        ...next[i],
        trackIds: [...next[i].trackIds, trackId],
      };
      return { playlists: next };
    });
    get().persist();
  },

  setTrackPlaylistMembership: (trackId, playlistIds) => {
    const allowed = new Set(playlistIds.filter((id) => !isMyLikesPlaylist(id)));
    const wantLike = playlistIds.some((id) => isMyLikesPlaylist(id));
    set((s) => {
      let likedTrackIds = s.likedTrackIds;
      const liked = likedTrackIds.includes(trackId);
      if (wantLike && !liked) {
        likedTrackIds = [trackId, ...likedTrackIds.filter((id) => id !== trackId)];
      } else if (!wantLike && liked) {
        likedTrackIds = likedTrackIds.filter((id) => id !== trackId);
      }
      const playlists = applyLikesToPlaylists(
        s.playlists.map((p) => {
          if (isMasterPlaylist(p.id) || isMyLikesPlaylist(p.id)) return p;
          const has = p.trackIds.includes(trackId);
          const shouldHave = allowed.has(p.id);
          if (has === shouldHave) return p;
          if (shouldHave) return { ...p, trackIds: [...p.trackIds, trackId] };
          return { ...p, trackIds: p.trackIds.filter((t) => t !== trackId) };
        }),
        likedTrackIds,
        new Set(Object.keys(s.tracks)),
      );
      return { playlists, likedTrackIds };
    });
    get().persist();
  },

  uploadTrack: async (file, meta) => {
    const result = await get().importMediaFiles([file], {
      artist: meta.artist,
      description: meta.description,
      playlistIds: meta.playlistIds,
      title: meta.title,
    });
    if (result.added === 0) {
      throw new Error('already_uploaded');
    }
    const latest = Object.values(get().tracks).sort(
      (a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''),
    )[0];
    return latest?.id ?? '';
  },

  importMediaFiles: async (files, opts) => {
    bulkImportDepth += 1;
    let syncAfterBatch = false;
    try {
      const extras = opts?.playlistIds && opts.playlistIds.length > 0 ? opts.playlistIds : [];
      const playlistIds = [...new Set([MASTER_PLAYLIST_ID, ...extras])];
      const sourceKeys = new Set(
        Object.values(get().tracks)
          .map((t) => t.sourceKey)
          .filter(Boolean) as string[],
      );
      const existing = { tracks: { ...get().tracks }, sourceKeys };
      const newTracks: TrackDef[] = [];
      const addedTrackIds: string[] = [];
      const failures: Array<{ name: string; message: string }> = [];
      let skipped = 0;
      const total = files.length;
      const report = opts?.onProgress;
      const singleFile = total === 1;
      const singleTitle = singleFile ? opts?.title?.trim() : undefined;
      const skipDurationProbe =
        opts?.skipDurationProbe === true || total >= SKIP_DURATION_PROBE_MIN_BATCH;
      const retainPerFileOnIos =
        isIOSDevice() && total > BULK_RETAIN_UPFRONT_MAX && !skipDurationProbe;
      let batch = files;

      if (skipDurationProbe && total > 0 && !opts?.skipBulkRetain) {
        const retained: File[] = [];
        for (let i = 0; i < total; i += 1) {
          report?.(`Loading ${i + 1} of ${total} into memory…`);
          retained.push(await retainFileForBulkUpload(files[i]!));
          if (i < total - 1) await yieldBetweenUploads();
        }
        batch = retained;
      }

      for (let i = 0; i < batch.length; i++) {
        let file = batch[i]!;
        report?.(`Uploading ${i + 1} of ${total}: ${file.name}…`);
        if (retainPerFileOnIos) {
          report?.(`Preparing ${i + 1} of ${total}…`);
          file = await retainSingleFileForIOS(file);
        }
        try {
          const row = await addFileAsTrack(file, existing, {
            title: singleTitle,
            artist: opts?.artist,
            description: opts?.description,
            genre: opts?.genre,
            useFileNameAsTitle: !singleTitle,
            onProgress: opts?.onProgress,
            skipDurationProbe,
          });
          if (!row) {
            skipped += 1;
            continue;
          }
          const { track } = row;
          existing.tracks[track.id] = track;
          if (track.sourceKey) existing.sourceKeys.add(track.sourceKey);
          newTracks.push(track);
          addedTrackIds.push(track.id);
          appendImportedTrackToState(set, get, track, playlistIds, { batch: total > 1 });
          const n = Object.keys(get().tracks).length;
          const addedInBatch = newTracks.length;
          opts?.onTrackAdded?.({
            catalogSize: n,
            addedInBatch,
            fileIndex: i + 1,
            fileTotal: total,
          });
          report?.(`Saved ${i + 1} of ${total} · ${n} tracks in catalog`);
          if (total > 1 && addedInBatch % 5 === 0) {
            get().persist();
          }

          if (i < batch.length - 1) {
            await yieldBetweenUploads();
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : 'upload_failed';
          failures.push({ name: file.name, message });
          report?.(`Failed ${file.name} (${i + 1}/${total}): ${message}`);
        }
      }

      if (newTracks.length > 0) {
        get().persist();
        syncAfterBatch = true;
      }

      let coverError: string | undefined;
      if (opts?.coverFile && newTracks.length > 0) {
        try {
          await get().updateTrack(newTracks[0].id, {}, {
            coverFile: opts.coverFile,
            onProgress: opts.onProgress,
          });
        } catch (e) {
          coverError =
            e instanceof Error
              ? e.message
              : typeof e === 'object' && e && 'code' in e
                ? String((e as { code?: string }).code)
                : 'cover_upload_failed';
        }
      }

      if (!newTracks.length && failures.length === 1) {
        throw new Error(failures[0]!.message);
      }
      if (!newTracks.length && failures.length > 1) {
        throw new Error(
          `All ${failures.length} uploads failed. First error: ${failures[0]!.message}`,
        );
      }

      return {
        added: newTracks.length,
        skipped,
        addedTrackIds,
        failed: failures.length,
        failures,
        coverError,
      };
    } finally {
      bulkImportDepth = Math.max(0, bulkImportDepth - 1);
      if (syncAfterBatch && bulkImportDepth === 0 && !opts?.deferServerSync) {
        void (async () => {
          try {
            if (isServerUploadConfigured()) {
              await reconcileServerCatalog();
            }
          } catch {
            /* index reconcile still runs on GET /api/catalog after deploy */
          }
          await get().syncLibraryFromServer();
        })().catch(() => {
          /* local batch state already has new tracks */
        });
      }
    }
  },

  scanDeviceLibrary: async (opts) => {
    let handle = await loadDeviceDirHandle();
    if (opts?.pickFolder || !handle) {
      const picked = await pickMediaDirectory();
      if (!picked) return { added: 0, skipped: 0, duplicates: [], addedTrackIds: [] };
      handle = picked;
      await saveDeviceDirHandle(handle);
    } else {
      const perm = await handle.queryPermission({ mode: 'read' });
      if (perm !== 'granted') {
        const req = await handle.requestPermission({ mode: 'read' });
        if (req !== 'granted') return { added: 0, skipped: 0, duplicates: [], addedTrackIds: [] };
      }
    }

    const files = await scanDirectoryHandle(handle);
    const { newFiles, duplicates } = classifyFilesAgainstCatalog(files, get().tracks);
    if (!newFiles.length) {
      return { added: 0, skipped: duplicates.length, duplicates, addedTrackIds: [] };
    }
    const result = await get().importMediaFiles(newFiles, {
      playlistIds: [MASTER_PLAYLIST_ID],
      onProgress: opts?.onProgress,
    });
    return { ...result, duplicates };
  },

  updateTrack: async (trackId, patch, opts) => {
    const prev = get().tracks[trackId];
    if (!prev) return;
    const report = opts?.onProgress;

    const next: TrackDef = {
      ...prev,
      ...(patch.title !== undefined ? { title: patch.title.trim() || prev.title } : {}),
      ...(patch.artist !== undefined ? { artist: patch.artist.trim() || prev.artist } : {}),
    };
    const description =
      patch.description !== undefined ? clampDescription(patch.description) : prev.description;
    const genre = patch.genre !== undefined ? clampGenre(patch.genre) : prev.genre;
    if (description) next.description = description;
    else delete next.description;
    if (genre) next.genre = genre;
    else delete next.genre;

    const shouldSyncServer = isServerUploadConfigured() && isUserUploadTrack(trackId, prev);

    report?.('Saving…');

    if (shouldSyncServer) {
      let posterSrc = prev.posterSrc;
      if (opts?.coverFile) {
        posterSrc = await uploadCoverBlob(trackId, opts.coverFile, { onProgress: report });
        next.posterSrc = posterSrc;
      }
      report?.('Syncing metadata to server…');
      const userPlaylistIds = get()
        .playlists.filter((p) => !isMasterPlaylist(p.id) && p.trackIds.includes(trackId))
        .map((p) => p.id);
      const serverPatch: Parameters<typeof updateTrackOnServer>[1] = {
        title: next.title,
        artist: next.artist,
        description: next.description,
        genre: next.genre,
        durationSec: next.durationSec,
        playlistIds: userPlaylistIds,
      };
      if (opts?.coverFile && posterSrc) serverPatch.posterSrc = posterSrc;
      const { track: saved } = await updateTrackOnServer(trackId, serverPatch);
      Object.assign(next, {
        ...saved,
        id: trackId,
        serverHosted: true,
        sourceKey: prev.sourceKey,
        downloadedLocally: prev.downloadedLocally,
        localMediaKey: prev.localMediaKey,
      });
    } else {
      report?.('Saving on this device…');
      if (opts?.coverFile) {
        next.posterSrc = await coverFileToPersistableDataUrl(opts.coverFile);
      }
    }

    report?.('Updating library…');
    set((s) => ({ tracks: { ...s.tracks, [trackId]: next } }));
    get().persist();
  },

  uploadTrackCover: async (trackId, file) => {
    await get().updateTrack(trackId, {}, { coverFile: file });
  },

  deleteTrack: async (trackId, opts) => {
    await get().deleteTracks([trackId], opts);
  },

  deleteTracks: async (trackIds, opts) => {
    const unique = [...new Set(trackIds)];
    const candidates = unique
      .map((id) => ({ id, tr: get().tracks[id] }))
      .filter((row): row is { id: string; tr: TrackDef } => !!row.tr);

    if (!candidates.length) return [];

    if (!opts?.skipConfirm) {
      const label =
        candidates.length === 1
          ? `Delete “${candidates[0]!.tr.title}” from your catalog?`
          : `Delete ${candidates.length} tracks from your catalog? They will be removed from all playlists.`;
      if (!window.confirm(label)) return [];
    }

    const serverConfigured = isServerUploadConfigured();
    const serverIds = candidates
      .filter(({ id, tr }) => serverConfigured && isUserUploadTrack(id, tr))
      .map(({ id }) => id);

    let serverRemoved = new Set<string>();
    let serverMissing = new Set<string>();

    if (serverIds.length) {
      try {
        const batch =
          serverIds.length === 1
            ? await (async () => {
                await deleteTrackOnServer(serverIds[0]!);
                return { removed: serverIds, missing: [] as string[] };
              })()
            : await deleteTracksOnServer(serverIds);
        for (const id of batch.removed) serverRemoved.add(id);
        for (const id of batch.missing) serverMissing.add(id);
        if (batch.error && !batch.removed.length && !opts?.purgeLocalOrphans) {
          const proceed = window.confirm(
            batch.message ||
              `Server delete failed (${batch.error}). Remove duplicates from this device anyway?`,
          );
          if (!proceed) return [];
        }
      } catch {
        if (!opts?.purgeLocalOrphans) {
          const proceed = window.confirm(
            'Server delete failed. Remove from this device anyway?',
          );
          if (!proceed) return [];
        }
      }
    }

    const removeIds = opts?.purgeLocalOrphans
      ? candidates.map((c) => c.id)
      : [
          ...new Set([
            ...serverRemoved,
            ...serverMissing,
            ...candidates
              .filter(({ id, tr }) => !serverConfigured || !isUserUploadTrack(id, tr))
              .map(({ id }) => id),
          ]),
        ];

    if (!removeIds.length) return [];

    addDeletedTrackTombstones(removeIds);

    const removeSet = new Set(removeIds);
    set((s) => {
      const tracks = { ...s.tracks };
      for (const id of removeSet) delete tracks[id];
      const likedTrackIds = s.likedTrackIds.filter((t) => !removeSet.has(t));
      const playlists = applyLikesToPlaylists(
        s.playlists.map((p) => ({
          ...p,
          trackIds: p.trackIds.filter((t) => !removeSet.has(t)),
        })),
        likedTrackIds,
        new Set(Object.keys(tracks)),
      );
      return { tracks, playlists, likedTrackIds };
    });
    get().persist();
    if (!opts?.skipSync) {
      void get().syncLibraryFromServer();
    }
    return removeIds;
  },

  refreshFromServer: async () => get().syncLibraryFromServer(),

  syncLibraryFromServer: async () => {
    if (get().catalogSyncing || bulkImportDepth > 0) return;
    set({ catalogSyncing: true });
    const prefs = loadCatalogPrefs();
    const downloaded = loadDownloadedTrackIds();
    const prevTrackId = usePlaybackStore.getState().currentTrackId;
    const priorLikes = get().likedTrackIds;
    const localTracks = get().tracks;
    try {
      let applied: ReturnType<typeof applyServerCatalog> | null = null;
      const localCount = Object.keys(localTracks).length;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const live = await fetchLiveCatalogForSync();
          const liveCount = Object.keys(live.tracks).length;
          // Never replace a populated library with an empty sync (API timeout / empty static).
          if (liveCount === 0) {
            if (localCount > 0) return;
            if (attempt < 2) {
              await new Promise((r) => window.setTimeout(r, 700 * (attempt + 1)));
              continue;
            }
            return;
          }
          const tombstones = getDeletedTrackTombstones();
          reconcileDeletedTrackTombstones(new Set(Object.keys(live.tracks)));
          const filteredLive = filterSnapshotTracks(live, tombstones);
          const server = mergePendingServerTracks(filteredLive, localTracks);
          const prefsWithLikes: ReturnType<typeof loadCatalogPrefs> = prefs
            ? { ...prefs, likedTrackIds: priorLikes.length ? priorLikes : prefs.likedTrackIds }
            : priorLikes.length
              ? {
                  version: CATALOG_VERSION,
                  playlists: get().playlists,
                  activePlaylistId: get().activePlaylistId,
                  likedTrackIds: priorLikes,
                }
              : null;
          applied = applyServerCatalog(server, prefsWithLikes, downloaded);
          break;
        } catch {
          if (attempt < 2) {
            await new Promise((r) => window.setTimeout(r, 700 * (attempt + 1)));
          }
        }
      }
      if (!applied) return;

      const currentActive = get().activePlaylistId;
      const activePlaylistId =
        currentActive && applied.playlists.some((p) => p.id === currentActive)
          ? currentActive
          : applied.activePlaylistId;

      set({
        tracks: applied.tracks,
        playlists: applied.playlists,
        activePlaylistId,
        likedTrackIds: applied.likedTrackIds,
      });
      resyncShuffleQueueForPlaylist(activePlaylistId, applied.tracks, applied.playlists);
      saveCatalogCache({
        version: CATALOG_VERSION,
        tracks: serverTracksForCache(applied.tracks),
        playlists: applied.playlists,
        activePlaylistId,
      });
      get().persist();
      if (prevTrackId && !applied.tracks[prevTrackId]) {
        usePlaybackStore.getState().setPlaying(false);
        usePlaybackStore.getState().setTrack(null);
      }
    } finally {
      set({ catalogSyncing: false });
    }
  },

  markTrackDownloaded: (trackId) => {
    const tr = get().tracks[trackId];
    if (!tr || tr.downloadedLocally) return;
    set((s) => ({
      tracks: {
        ...s.tracks,
        [trackId]: {
          ...tr,
          downloadedLocally: true,
          localMediaKey: localMediaKeyFor(trackId),
        },
      },
    }));
    get().persist();
  },

  persist: () => {
    const state = get();
    const { tracks, activePlaylistId, likedTrackIds, userPlaylistMenuOrder } = state;
    let playlists = syncMasterPlaylistWithTracks(tracks, state.playlists);
    playlists = applyLikesToPlaylists(playlists, likedTrackIds, new Set(Object.keys(tracks)));
    const normalizedOrder = normalizePlaylistMenuOrder(userPlaylistMenuOrder, playlists);

    const playlistsUnchanged =
      playlists.length === state.playlists.length &&
      normalizedOrder.join('\t') === state.userPlaylistMenuOrder.join('\t') &&
      playlists.every((p, i) => {
        const prev = state.playlists[i];
        if (!prev || p.id !== prev.id) return false;
        if (p.trackIds.length !== prev.trackIds.length) return false;
        for (let j = 0; j < p.trackIds.length; j++) {
          if (p.trackIds[j] !== prev.trackIds[j]) return false;
        }
        const childA = (p.childPlaylistIds ?? []).join('\t');
        const childB = (prev.childPlaylistIds ?? []).join('\t');
        return childA === childB;
      });

    if (!playlistsUnchanged) {
      set({ playlists, userPlaylistMenuOrder: normalizedOrder });
    }

    saveLikedTrackIds(likedTrackIds);
    saveCatalogPrefs({
      version: CATALOG_VERSION,
      playlists,
      activePlaylistId,
      likedTrackIds,
      userPlaylistMenuOrder: normalizedOrder,
    });
    saveCatalogCache({
      version: CATALOG_VERSION,
      tracks: serverTracksForCache(tracks),
      playlists,
      activePlaylistId,
    });
    scheduleSharedPlaylistSync(playlists);
  },
}));

/** Back-compat alias used by older components */
export const usePlaylistStore = useCatalogStore;
