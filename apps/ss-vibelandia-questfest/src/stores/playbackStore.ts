import { create } from 'zustand';
import { readPlaybackPrefs, writePlaybackPrefs } from '@/lib/playbackPreferences';
import { shuffleIdsCrypto } from '@/lib/playlistShuffle';

interface PlaybackState {
  currentTrackId: string | null;
  isPlaying: boolean;
  /** Shown in the player bar when start/play fails. */
  playbackError: string | null;
  displayTime: number;
  /** 0–1 linear gain applied by solenoid / vessel switch */
  gain: number;
  /** Hidden audio handoff active (paid background play). */
  backgroundHandoffActive: boolean;
  /** Auto-advance to next track in playlist when a song ends (default on). */
  autoplayEnabled: boolean;
  /** Allow background / lock-screen playback when pass or captain (default on). */
  backgroundPlayEnabled: boolean;
  /** Random play order within the active playlist (next/prev/autoplay follow shuffled ring). */
  shuffleEnabled: boolean;
  /** Built when shuffle is on — playable track ids in random order. */
  shuffleQueue: string[] | null;
  shufflePlaylistKey: string | null;
  setTrack: (id: string | null) => void;
  setPlaying: (v: boolean) => void;
  setDisplayTime: (t: number) => void;
  setGain: (g: number) => void;
  setBackgroundHandoffActive: (v: boolean) => void;
  setPlaybackError: (msg: string | null) => void;
  setAutoplayEnabled: (v: boolean) => void;
  setBackgroundPlayEnabled: (v: boolean) => void;
  setShuffleEnabled: (v: boolean) => void;
  /** Rebuild shuffle order when fingerprint (playlist + order) or playable set changes. */
  syncShuffleQueue: (fingerprint: string, playableTrackIds: string[]) => void;
  clearShuffleQueue: () => void;
  hydratePlaybackPrefs: () => void;
  applyPassHolderPlaybackDefaults: () => void;
}

const initialPrefs = readPlaybackPrefs();

export const usePlaybackStore = create<PlaybackState>((set) => ({
  currentTrackId: null,
  isPlaying: false,
  playbackError: null,
  displayTime: 0,
  gain: 1,
  backgroundHandoffActive: false,
  autoplayEnabled: initialPrefs.autoplay,
  backgroundPlayEnabled: initialPrefs.backgroundPlay,
  shuffleEnabled: initialPrefs.shuffle,
  shuffleQueue: null,
  shufflePlaylistKey: null,
  setTrack: (id) => set({ currentTrackId: id }),
  setPlaying: (v) => set({ isPlaying: v, ...(v ? {} : { backgroundHandoffActive: false }) }),
  setPlaybackError: (msg) => set({ playbackError: msg }),
  setDisplayTime: (t) => set({ displayTime: t }),
  setGain: (g) => set({ gain: Math.max(0, Math.min(1, g)) }),
  setBackgroundHandoffActive: (v) => set({ backgroundHandoffActive: v }),
  setAutoplayEnabled: (v) => {
    writePlaybackPrefs({ autoplay: v });
    set({ autoplayEnabled: v });
  },
  setBackgroundPlayEnabled: (v) => {
    writePlaybackPrefs({ backgroundPlay: v });
    set({ backgroundPlayEnabled: v });
  },
  setShuffleEnabled: (v) => {
    writePlaybackPrefs({ shuffle: v });
    set({
      shuffleEnabled: v,
      ...(v ? {} : { shuffleQueue: null, shufflePlaylistKey: null }),
    });
  },
  syncShuffleQueue: (fingerprint, playableTrackIds) =>
    set((s) => {
      if (!s.shuffleEnabled) {
        return { shuffleQueue: null, shufflePlaylistKey: null };
      }
      if (!playableTrackIds.length) {
        return { shuffleQueue: null, shufflePlaylistKey: fingerprint };
      }
      if (playableTrackIds.length === 1) {
        return { shuffleQueue: [playableTrackIds[0]!], shufflePlaylistKey: fingerprint };
      }
      if (s.shufflePlaylistKey === fingerprint && s.shuffleQueue?.length) {
        const prev = new Set(s.shuffleQueue);
        const next = new Set(playableTrackIds);
        if (
          s.shuffleQueue.length === playableTrackIds.length &&
          prev.size === next.size &&
          [...prev].every((id) => next.has(id))
        ) {
          return {};
        }
      }
      return {
        shuffleQueue: shuffleIdsCrypto(playableTrackIds),
        shufflePlaylistKey: fingerprint,
      };
    }),
  clearShuffleQueue: () => set({ shuffleQueue: null, shufflePlaylistKey: null }),
  hydratePlaybackPrefs: () => {
    const p = readPlaybackPrefs();
    set({
      autoplayEnabled: p.autoplay,
      backgroundPlayEnabled: p.backgroundPlay,
      shuffleEnabled: p.shuffle,
    });
  },
  applyPassHolderPlaybackDefaults: () => {
    const p = writePlaybackPrefs({ autoplay: true, backgroundPlay: true });
    set({
      autoplayEnabled: p.autoplay,
      backgroundPlayEnabled: p.backgroundPlay,
      shuffleEnabled: p.shuffle,
    });
  },
}));
