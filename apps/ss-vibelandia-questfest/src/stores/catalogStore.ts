import { create } from 'zustand';
import { buildSeedCatalog } from '@/lib/catalogSeed';
import {
  deleteBlob,
  loadBlob,
  loadCatalogJson,
  saveBlob,
  saveCatalogJson,
} from '@/lib/catalogPersistence';
import type { CatalogSnapshot, PlaylistDef, TrackDef } from '@/lib/catalogTypes';

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
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (trackId: string, playlistId: string) => void;
  removeTrackFromPlaylist: (trackId: string, playlistId: string) => void;
  moveTrackInPlaylist: (playlistId: string, trackId: string, dir: -1 | 1) => void;
  moveTrackToPlaylist: (trackId: string, targetPlaylistId: string) => void;
  uploadTrack: (file: File, meta: { title: string; artist: string; playlistIds: string[] }) => Promise<string>;
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
    const id = `trk-up-${Date.now()}`;
    const key = `media-${id}`;
    await saveBlob(key, file);
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    const track: TrackDef = {
      id,
      title: meta.title.trim() || file.name,
      artist: meta.artist.trim() || 'Hero Jo Golden Bachdoor',
      src: isVideo ? url : url,
      videoSrc: isVideo ? url : undefined,
      localMediaKey: key,
      uploadedAt: new Date().toISOString(),
    };
    set((s) => {
      const playlists = s.playlists.map((p) =>
        meta.playlistIds.includes(p.id) ? { ...p, trackIds: [...p.trackIds, id] } : p,
      );
      const main = playlists.find((p) => p.id === 'pl-main');
      if (main && !main.trackIds.includes(id)) {
        const i = playlists.findIndex((p) => p.id === 'pl-main');
        playlists[i] = { ...main, trackIds: [...main.trackIds, id] };
      }
      return { tracks: { ...s.tracks, [id]: track }, playlists };
    });
    get().persist();
    return id;
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
    const base = saved?.version === 2 ? cloneSnapshot(saved) : buildSeedCatalog();
    const tracks = await attachBlobUrls(base.tracks);
    set({
      hydrated: true,
      tracks,
      playlists: base.playlists,
      activePlaylistId: base.activePlaylistId || base.playlists[0]?.id || 'pl-main',
    });
  },

  persist: () => {
    const { tracks, playlists, activePlaylistId } = get();
    saveCatalogJson({
      version: 2,
      tracks: stripForStorage(tracks),
      playlists,
      activePlaylistId,
    });
  },
}));

/** Back-compat alias used by older components */
export const usePlaylistStore = useCatalogStore;
