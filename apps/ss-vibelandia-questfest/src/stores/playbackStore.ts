import { create } from 'zustand';
import { readPlaybackPrefs, writePlaybackPrefs } from '@/lib/playbackPreferences';

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
  setTrack: (id: string | null) => void;
  setPlaying: (v: boolean) => void;
  setDisplayTime: (t: number) => void;
  setGain: (g: number) => void;
  setBackgroundHandoffActive: (v: boolean) => void;
  setAutoplayEnabled: (v: boolean) => void;
  setBackgroundPlayEnabled: (v: boolean) => void;
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
  hydratePlaybackPrefs: () => {
    const p = readPlaybackPrefs();
    set({ autoplayEnabled: p.autoplay, backgroundPlayEnabled: p.backgroundPlay });
  },
  applyPassHolderPlaybackDefaults: () => {
    const p = writePlaybackPrefs({ autoplay: true, backgroundPlay: true });
    set({ autoplayEnabled: p.autoplay, backgroundPlayEnabled: p.backgroundPlay });
  },
}));
