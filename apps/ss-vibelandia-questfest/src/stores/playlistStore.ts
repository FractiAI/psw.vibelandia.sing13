import { create } from 'zustand';
import { INITIAL_PLAYLISTS, TRACKS, type PlaylistDef, type TrackDef } from '@/lib/demoTracks';

interface PlaylistState {
  playlists: PlaylistDef[];
  activePlaylistId: string;
  setActivePlaylist: (id: string) => void;
  moveTrackToPlaylist: (trackId: string, targetPlaylistId: string) => void;
  getActivePlaylist: () => PlaylistDef | undefined;
  getTrack: (id: string) => TrackDef | undefined;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: INITIAL_PLAYLISTS.map((p) => ({ ...p, trackIds: [...p.trackIds] })),
  activePlaylistId: 'pl-sovereign',
  setActivePlaylist: (id) => set({ activePlaylistId: id }),
  moveTrackToPlaylist: (trackId, targetPlaylistId) =>
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
    }),
  getActivePlaylist: () => get().playlists.find((p) => p.id === get().activePlaylistId),
  getTrack: (id) => TRACKS[id],
}));
