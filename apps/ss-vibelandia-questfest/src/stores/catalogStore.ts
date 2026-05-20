import { create } from 'zustand';
import { usePlaybackStore } from '@/stores/playbackStore';
import {
  buildEmptyCatalog,
  CATALOG_VERSION,
  MASTER_PLAYLIST_ID,
  mergePendingServerTracks,
  mergeServerCatalogWithPrefs,
  isMasterPlaylist,
  isUserUploadTrack,
} from '@/lib/catalogSeed';
import {
  loadDeviceDirHandle,
  saveDeviceDirHandle,
} from '@/lib/catalogPersistence';
import { hydrateCatalogFromDevice, instantBootSnapshot } from '@/lib/catalogBoot';
import {
  loadCatalogCache,
  loadCatalogPrefs,
  loadDownloadedTrackIds,
  saveCatalogCache,
  saveCatalogPrefs,
} from '@/lib/catalogPrefs';
import { localMediaKeyFor } from '@/lib/localPlayback';
import {
  deleteTrackOnServer,
  fetchLiveCatalog,
  isServerUploadConfigured,
  updateTrackOnServer,
  uploadTrackToServer,
} from '@/lib/serverCatalog';
import type { CatalogSnapshot, PlaylistDef, TrackDef } from '@/lib/catalogTypes';
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

type View = 'catalog' | 'dj';

interface CatalogState {
  catalogSyncing: boolean;
  view: View;
  djMode: boolean;
  tracks: Record<string, TrackDef>;
  playlists: PlaylistDef[];
  activePlaylistId: string;
  search: string;
  setView: (v: View) => void;
  setDjMode: (on: boolean) => void;
  setSearch: (q: string) => void;
  setActivePlaylist: (id: string) => void;
  getActivePlaylist: () => PlaylistDef | undefined;
  getTrack: (id: string) => TrackDef | undefined;
  listTracksForActivePlaylist: () => TrackDef[];
  listAllTracks: () => TrackDef[];
  createPlaylist: (name: string) => string;
  renamePlaylist: (id: string, name: string) => void;
  updatePlaylist: (id: string, patch: { name?: string; description?: string }) => void;
  deletePlaylist: (id: string) => void;
  /** Clone a non-master playlist; returns new id or empty string if invalid. */
  duplicatePlaylist: (id: string) => string;
  addTrackToPlaylist: (trackId: string, playlistId: string) => void;
  removeTrackFromPlaylist: (trackId: string, playlistId: string) => void;
  moveTrackInPlaylist: (playlistId: string, trackId: string, dir: -1 | 1) => void;
  reorderTrackInPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  moveTrackToPlaylist: (trackId: string, targetPlaylistId: string) => void;
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
      title?: string;
      playlistIds?: string[];
      onProgress?: (message: string) => void;
    },
  ) => Promise<{ added: number; skipped: number; addedTrackIds: string[] }>;
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
  ) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
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
): { tracks: Record<string, TrackDef>; playlists: PlaylistDef[]; activePlaylistId: string } {
  const base = mergeServerCatalogWithPrefs(server, prefs, downloaded, syncMasterPlaylistWithTracks);
  return {
    tracks: base.tracks,
    playlists: base.playlists,
    activePlaylistId: base.activePlaylistId,
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
    { onProgress: meta.onProgress },
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
  tracks: bootCatalog.tracks,
  playlists: bootCatalog.playlists,
  activePlaylistId: bootCatalog.activePlaylistId,
  deviceHydrated: false,
  search: '',

  hydrateFromDevice: () => {
    if (get().deviceHydrated) return;
    const snapshot = hydrateCatalogFromDevice(syncMasterPlaylistWithTracks);
    const applied = snapshotToState(snapshot);
    set({
      tracks: applied.tracks,
      playlists: applied.playlists,
      activePlaylistId: applied.activePlaylistId,
      deviceHydrated: true,
    });
  },

  setView: (v) => set({ view: v }),
  setDjMode: (on) => set({ djMode: on, view: on ? 'dj' : 'catalog' }),
  setSearch: (q) => set({ search: q }),
  setActivePlaylist: (id) => set({ activePlaylistId: id, view: 'catalog' }),

  getActivePlaylist: () => get().playlists.find((p) => p.id === get().activePlaylistId),

  getTrack: (id) => get().tracks[id],

  listTracksForActivePlaylist: () => {
    const pl = get().getActivePlaylist();
    if (!pl) return [];
    return pl.trackIds.map((id) => get().tracks[id]).filter(Boolean) as TrackDef[];
  },

  listAllTracks: () => Object.values(get().tracks),

  createPlaylist: (name) => {
    const id = `pl-${Date.now()}`;
    set((s) => ({
      playlists: [
        ...s.playlists,
        {
          id,
          name: name.trim() || 'New playlist',
          kind: 'sovereign',
          description: '',
          trackIds: [],
        },
      ],
      activePlaylistId: id,
    }));
    get().persist();
    return id;
  },

  renamePlaylist: (id, name) => {
    set((s) => ({
      playlists: s.playlists.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)),
    }));
    get().persist();
  },

  updatePlaylist: (id, patch) => {
    set((s) => ({
      playlists: s.playlists.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...(patch.name !== undefined ? { name: patch.name.trim() || p.name } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
        };
      }),
    }));
    get().persist();
  },

  deletePlaylist: (id) => {
    if (id === MASTER_PLAYLIST_ID) return;
    const { playlists, activePlaylistId } = get();
    if (playlists.length <= 1) return;
    const next = playlists.filter((p) => p.id !== id);
    set({
      playlists: next,
      activePlaylistId: activePlaylistId === id ? next[0].id : activePlaylistId,
    });
    get().persist();
  },

  duplicatePlaylist: (id) => {
    if (id === MASTER_PLAYLIST_ID) return '';
    const s = get();
    const src = s.playlists.find((p) => p.id === id);
    if (!src) return '';
    const newId = `pl-${Date.now()}`;
    const baseName = src.name.trim() || 'Playlist';
    set({
      playlists: [
        ...s.playlists,
        {
          id: newId,
          name: `Copy of ${baseName}`,
          kind: 'sovereign' as const,
          description: src.description,
          trackIds: [...src.trackIds],
        },
      ],
      activePlaylistId: newId,
    });
    get().persist();
    return newId;
  },

  addTrackToPlaylist: (trackId, playlistId) => {
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
    set((s) => ({
      playlists: s.playlists.map((p) => {
        if (p.id !== playlistId) return p;
        const ids = [...p.trackIds];
        if (fromIndex < 0 || fromIndex >= ids.length) return p;
        const clamped = Math.max(0, Math.min(toIndex, ids.length - 1));
        const [item] = ids.splice(fromIndex, 1);
        ids.splice(clamped, 0, item);
        return { ...p, trackIds: ids };
      }),
    }));
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
    const allowed = new Set(playlistIds);
    set((s) => ({
      playlists: s.playlists.map((p) => {
        if (isMasterPlaylist(p.id)) return p;
        const has = p.trackIds.includes(trackId);
        const shouldHave = allowed.has(p.id);
        if (has === shouldHave) return p;
        if (shouldHave) return { ...p, trackIds: [...p.trackIds, trackId] };
        return { ...p, trackIds: p.trackIds.filter((t) => t !== trackId) };
      }),
    }));
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
    const extras = opts?.playlistIds && opts.playlistIds.length > 0 ? opts.playlistIds : [];
    const playlistIds = [...new Set([MASTER_PLAYLIST_ID, ...extras])];
    const sourceKeys = new Set(
      Object.values(get().tracks)
        .map((t) => t.sourceKey)
        .filter(Boolean) as string[],
    );
    const existing = { tracks: { ...get().tracks }, sourceKeys };
    const newTracks: TrackDef[] = [];
    let skipped = 0;
    let serverCatalog: CatalogSnapshot | undefined;
    const total = files.length;
    const report = opts?.onProgress;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      report?.(`Uploading ${i + 1} of ${total}: ${file.name}…`);
      const row = await addFileAsTrack(file, existing, {
        title: opts?.title,
        artist: opts?.artist,
        description: opts?.description,
        genre: opts?.genre,
        useFileNameAsTitle: !opts?.title?.trim(),
        onProgress: opts?.onProgress,
      });
      if (!row) {
        skipped += 1;
        continue;
      }
      if (row.catalog) serverCatalog = row.catalog;
      const { track } = row;
      existing.tracks[track.id] = track;
      if (track.sourceKey) existing.sourceKeys.add(track.sourceKey);
      newTracks.push(track);
    }

    if (!newTracks.length) return { added: 0, skipped, addedTrackIds: [] };

    if (serverCatalog) {
      const prefs = loadCatalogPrefs();
      const downloaded = loadDownloadedTrackIds();
      const applied = applyServerCatalog(serverCatalog, prefs, downloaded);
      set({
        tracks: applied.tracks,
        playlists: applied.playlists,
        activePlaylistId: applied.activePlaylistId,
      });
      saveCatalogCache({
        version: CATALOG_VERSION,
        tracks: serverTracksForCache(applied.tracks),
        playlists: applied.playlists,
        activePlaylistId: applied.activePlaylistId,
      });
    } else {
      set((s) => {
        const tracks = { ...s.tracks };
        for (const tr of newTracks) tracks[tr.id] = tr;
        const playlists = s.playlists.map((p) => {
          if (!playlistIds.includes(p.id)) return p;
          const ids = [...p.trackIds];
          for (const tr of newTracks) {
            if (!ids.includes(tr.id)) ids.push(tr.id);
          }
          return { ...p, trackIds: ids };
        });
        return { tracks, playlists };
      });
    }
    get().persist();
    try {
      await get().syncLibraryFromServer();
    } catch {
      /* keep local uploads visible */
    }
    return { added: newTracks.length, skipped, addedTrackIds: newTracks.map((t) => t.id) };
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

  updateTrack: async (trackId, patch) => {
    const prev = get().tracks[trackId];
    if (!prev) return;

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

    if (shouldSyncServer) {
      const userPlaylistIds = get()
        .playlists.filter((p) => !isMasterPlaylist(p.id) && p.trackIds.includes(trackId))
        .map((p) => p.id);
      const { track: saved } = await updateTrackOnServer(trackId, {
        title: next.title,
        artist: next.artist,
        description: next.description,
        genre: next.genre,
        durationSec: next.durationSec,
        playlistIds: userPlaylistIds,
      });
      Object.assign(next, {
        ...saved,
        id: trackId,
        serverHosted: true,
        sourceKey: prev.sourceKey,
        downloadedLocally: prev.downloadedLocally,
        localMediaKey: prev.localMediaKey,
      });
    }

    set((s) => ({ tracks: { ...s.tracks, [trackId]: next } }));
    get().persist();
  },

  deleteTrack: async (trackId) => {
    const prev = get().tracks[trackId];
    if (!prev) return;
    if (!window.confirm(`Delete “${prev.title}” from your catalog?`)) return;

    if (isServerUploadConfigured() && isUserUploadTrack(trackId, prev)) {
      try {
        await deleteTrackOnServer(trackId);
      } catch {
        if (!window.confirm('Server delete failed. Remove from this device anyway?')) return;
      }
    }

    set((s) => {
      const { [trackId]: _, ...tracks } = s.tracks;
      return {
        tracks,
        playlists: s.playlists.map((p) => ({
          ...p,
          trackIds: p.trackIds.filter((t) => t !== trackId),
        })),
      };
    });
    get().persist();
  },

  refreshFromServer: async () => get().syncLibraryFromServer(),

  syncLibraryFromServer: async () => {
    if (get().catalogSyncing) return;
    set({ catalogSyncing: true });
    const prefs = loadCatalogPrefs();
    const downloaded = loadDownloadedTrackIds();
    const prevTrackId = usePlaybackStore.getState().currentTrackId;
    try {
      const localTracks = get().tracks;
      const server = mergePendingServerTracks(await fetchLiveCatalog(), localTracks);
      const applied = applyServerCatalog(server, prefs, downloaded);
      set({
        tracks: applied.tracks,
        playlists: applied.playlists,
        activePlaylistId: applied.activePlaylistId,
      });
      saveCatalogCache({
        version: CATALOG_VERSION,
        tracks: serverTracksForCache(applied.tracks),
        playlists: applied.playlists,
        activePlaylistId: applied.activePlaylistId,
      });
      get().persist();
      if (prevTrackId && !applied.tracks[prevTrackId]) {
        usePlaybackStore.getState().setPlaying(false);
        usePlaybackStore.getState().setTrack(null);
      }
    } catch {
      /* keep cached library */
    } finally {
      set({ catalogSyncing: false });
    }
  },

  markTrackDownloaded: (trackId) => {
    set((s) => {
      const tr = s.tracks[trackId];
      if (!tr) return s;
      return {
        tracks: {
          ...s.tracks,
          [trackId]: {
            ...tr,
            downloadedLocally: true,
            localMediaKey: localMediaKeyFor(trackId),
          },
        },
      };
    });
    get().persist();
  },

  persist: () => {
    const { tracks, activePlaylistId } = get();
    const playlists = syncMasterPlaylistWithTracks(tracks, get().playlists);
    set({ playlists });
    saveCatalogPrefs({
      version: CATALOG_VERSION,
      playlists,
      activePlaylistId,
    });
    saveCatalogCache({
      version: CATALOG_VERSION,
      tracks: serverTracksForCache(tracks),
      playlists,
      activePlaylistId,
    });
  },
}));

/** Back-compat alias used by older components */
export const usePlaylistStore = useCatalogStore;
