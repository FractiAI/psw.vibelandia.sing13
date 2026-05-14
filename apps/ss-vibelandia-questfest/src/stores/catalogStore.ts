import { create } from 'zustand';
import { buildEmptyCatalog, CATALOG_VERSION } from '@/lib/catalogSeed';
import {
  deleteBlob,
  loadBlob,
  loadCatalogJson,
  loadDeviceDirHandle,
  resetLocalCatalog,
  saveBlob,
  saveCatalogJson,
  saveDeviceDirHandle,
} from '@/lib/catalogPersistence';
import type { CatalogSnapshot, PlaylistDef, TrackDef } from '@/lib/catalogTypes';
import { DEFAULT_ARTIST, TRACK_DESCRIPTION_MAX } from '@/lib/catalogTypes';
import {
  fileSourceKey,
  pickMediaDirectory,
  scanDirectoryHandle,
  titleFromFileName,
} from '@/lib/deviceMediaScan';

type View = 'catalog' | 'dj';

interface CatalogState {
  hydrated: boolean;
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
  addTrackToPlaylist: (trackId: string, playlistId: string) => void;
  removeTrackFromPlaylist: (trackId: string, playlistId: string) => void;
  moveTrackInPlaylist: (playlistId: string, trackId: string, dir: -1 | 1) => void;
  reorderTrackInPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  moveTrackToPlaylist: (trackId: string, targetPlaylistId: string) => void;
  uploadTrack: (
    file: File,
    meta: { title: string; artist: string; description?: string; playlistIds: string[] },
  ) => Promise<string>;
  importMediaFiles: (
    files: File[],
    opts?: { artist?: string; description?: string; title?: string; playlistIds?: string[] },
  ) => Promise<{ added: number; skipped: number }>;
  scanDeviceLibrary: (opts?: { pickFolder?: boolean }) => Promise<{ added: number; skipped: number }>;
  deleteTrack: (trackId: string) => Promise<void>;
  hydrate: () => Promise<void>;
  persist: () => void;
}

function cloneSnapshot(s: CatalogSnapshot): CatalogSnapshot {
  return {
    ...s,
    tracks: { ...s.tracks },
    playlists: s.playlists.map((p) => ({ ...p, trackIds: [...p.trackIds] })),
  };
}

/** Only tracks stored on this device (uploads / device scan). Removes 552 seed entries. */
function keepLocalTracksOnly(snapshot: CatalogSnapshot): CatalogSnapshot {
  const tracks: Record<string, TrackDef> = {};
  for (const [id, tr] of Object.entries(snapshot.tracks)) {
    if (tr.localMediaKey) tracks[id] = tr;
  }
  let playlists = snapshot.playlists
    .map((p) => ({ ...p, trackIds: p.trackIds.filter((tid) => tracks[tid]) }))
    .filter((p) => p.id === 'pl-main' || p.trackIds.length > 0);

  if (!playlists.length) {
    playlists = buildEmptyCatalog().playlists;
  }

  const main = playlists.find((p) => p.id === 'pl-main') ?? playlists[0];
  const activePlaylistId = playlists.some((p) => p.id === snapshot.activePlaylistId)
    ? snapshot.activePlaylistId
    : main.id;

  return {
    version: CATALOG_VERSION,
    tracks,
    playlists,
    activePlaylistId,
  };
}

async function attachBlobUrls(tracks: Record<string, TrackDef>): Promise<Record<string, TrackDef>> {
  const next = { ...tracks };
  await Promise.all(
    Object.values(next).map(async (tr) => {
      if (!tr.localMediaKey) return;
      const blob = await loadBlob(tr.localMediaKey);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      if (tr.videoSrc || fileLooksVideo(blob)) {
        next[tr.id] = { ...tr, videoSrc: url, src: url };
      } else {
        next[tr.id] = { ...tr, src: url };
      }
    }),
  );
  return next;
}

function fileLooksVideo(blob: Blob): boolean {
  return blob.type.startsWith('video/');
}

function stripForStorage(tracks: Record<string, TrackDef>): Record<string, TrackDef> {
  const out: Record<string, TrackDef> = {};
  for (const [id, tr] of Object.entries(tracks)) {
    const { src, videoSrc, ...rest } = tr;
    out[id] = {
      ...rest,
      src: tr.localMediaKey ? '' : src,
      videoSrc: tr.localMediaKey && tr.videoSrc ? '' : videoSrc,
    };
  }
  return out;
}

function clampDescription(text?: string): string | undefined {
  const t = text?.trim();
  if (!t) return undefined;
  return t.slice(0, TRACK_DESCRIPTION_MAX);
}

async function addFileAsTrack(
  file: File,
  existing: { tracks: Record<string, TrackDef>; sourceKeys: Set<string> },
  meta: { title?: string; artist?: string; description?: string; useFileNameAsTitle?: boolean },
): Promise<TrackDef | null> {
  const sourceKey = fileSourceKey(file);
  if (existing.sourceKeys.has(sourceKey)) return null;
  const id = `trk-up-${sourceKey.replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 48)}-${Date.now()}`;
  const key = `media-${id}`;
  await saveBlob(key, file);
  const url = URL.createObjectURL(file);
  const isVideo = file.type.startsWith('video/');
  const description = clampDescription(meta.description);
  const trimmedTitle = meta.title?.trim();
  const displayTitle =
    trimmedTitle || (meta.useFileNameAsTitle ? titleFromFileName(file.name) : 'Untitled');
  return {
    id,
    title: displayTitle,
    artist: meta.artist?.trim() || DEFAULT_ARTIST,
    ...(description ? { description } : {}),
    src: url,
    videoSrc: isVideo ? url : undefined,
    localMediaKey: key,
    uploadedAt: new Date().toISOString(),
    sourceKey,
  };
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  hydrated: false,
  view: 'catalog',
  djMode: false,
  tracks: {},
  playlists: [],
  activePlaylistId: 'pl-main',
  search: '',

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
    const { playlists, activePlaylistId } = get();
    if (playlists.length <= 1) return;
    const next = playlists.filter((p) => p.id !== id);
    set({
      playlists: next,
      activePlaylistId: activePlaylistId === id ? next[0].id : activePlaylistId,
    });
    get().persist();
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

  uploadTrack: async (file, meta) => {
    const result = await get().importMediaFiles([file], {
      artist: meta.artist,
      description: meta.description,
      playlistIds: meta.playlistIds,
      title: meta.title,
    });
    if (result.added === 0) {
      const keys = new Set(Object.values(get().tracks).map((t) => t.sourceKey).filter(Boolean));
      throw new Error('duplicate');
    }
    const latest = Object.values(get().tracks).sort(
      (a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''),
    )[0];
    return latest?.id ?? '';
  },

  importMediaFiles: async (files, opts) => {
    const playlistIds = opts?.playlistIds?.length ? opts.playlistIds : ['pl-main'];
    const sourceKeys = new Set(
      Object.values(get().tracks)
        .map((t) => t.sourceKey)
        .filter(Boolean) as string[],
    );
    const existing = { tracks: { ...get().tracks }, sourceKeys };
    const newTracks: TrackDef[] = [];
    let skipped = 0;

    for (const file of files) {
      const track = await addFileAsTrack(file, existing, {
        title: opts?.title,
        artist: opts?.artist,
        description: opts?.description,
        useFileNameAsTitle: !opts?.title?.trim(),
      });
      if (!track) {
        skipped += 1;
        continue;
      }
      existing.tracks[track.id] = track;
      if (track.sourceKey) existing.sourceKeys.add(track.sourceKey);
      newTracks.push(track);
    }

    if (!newTracks.length) return { added: 0, skipped };

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
    get().persist();
    return { added: newTracks.length, skipped };
  },

  scanDeviceLibrary: async (opts) => {
    let handle = await loadDeviceDirHandle();
    if (opts?.pickFolder || !handle) {
      const picked = await pickMediaDirectory();
      if (!picked) return { added: 0, skipped: 0 };
      handle = picked;
      await saveDeviceDirHandle(handle);
    } else {
      const perm = await handle.queryPermission({ mode: 'read' });
      if (perm !== 'granted') {
        const req = await handle.requestPermission({ mode: 'read' });
        if (req !== 'granted') return { added: 0, skipped: 0 };
      }
    }

    const files = await scanDirectoryHandle(handle);
    return get().importMediaFiles(files, { playlistIds: ['pl-main'] });
  },

  deleteTrack: async (trackId) => {
    const tr = get().tracks[trackId];
    if (tr?.localMediaKey) await deleteBlob(tr.localMediaKey);
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

  hydrate: async () => {
    const saved = loadCatalogJson<CatalogSnapshot>();
    if (!saved || saved.version < CATALOG_VERSION) {
      await resetLocalCatalog();
      const base = buildEmptyCatalog();
      set({
        hydrated: true,
        tracks: {},
        playlists: base.playlists,
        activePlaylistId: base.activePlaylistId,
      });
      get().persist();
      return;
    }

    const base = keepLocalTracksOnly(cloneSnapshot(saved));
    const tracks = await attachBlobUrls(base.tracks);
    set({
      hydrated: true,
      tracks,
      playlists: base.playlists,
      activePlaylistId: base.activePlaylistId || base.playlists[0]?.id || 'pl-main',
    });
    get().persist();
  },

  persist: () => {
    const { tracks, playlists, activePlaylistId } = get();
    saveCatalogJson({
      version: CATALOG_VERSION,
      tracks: stripForStorage(tracks),
      playlists,
      activePlaylistId,
    });
  },
}));

/** Back-compat alias used by older components */
export const usePlaylistStore = useCatalogStore;
