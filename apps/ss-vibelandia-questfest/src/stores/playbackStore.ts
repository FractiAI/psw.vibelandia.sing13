import { create } from 'zustand';

interface PlaybackState {
  currentTrackId: string | null;
  isPlaying: boolean;
  displayTime: number;
  /** 0–1 linear gain applied by solenoid / vessel switch */
  gain: number;
  setTrack: (id: string | null) => void;
  setPlaying: (v: boolean) => void;
  setDisplayTime: (t: number) => void;
  setGain: (g: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  currentTrackId: null,
  isPlaying: false,
  displayTime: 0,
  gain: 1,
  setTrack: (id) => set({ currentTrackId: id }),
  setPlaying: (v) => set({ isPlaying: v }),
  setDisplayTime: (t) => set({ displayTime: t }),
  setGain: (g) => set({ gain: Math.max(0, Math.min(1, g)) }),
}));
