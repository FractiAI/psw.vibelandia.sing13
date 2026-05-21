/** Survives tab hide, screensaver, and soft remounts — not a server session. */
const KEY = 'qv-playback-session';

export type PlaybackSessionSnapshot = {
  trackId: string | null;
  isPlaying: boolean;
  displayTime: number;
  at: number;
};

export function readPlaybackSession(): PlaybackSessionSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<PlaybackSessionSnapshot>;
    if (!o || typeof o.at !== 'number') return null;
    return {
      trackId: typeof o.trackId === 'string' ? o.trackId : null,
      isPlaying: !!o.isPlaying,
      displayTime: typeof o.displayTime === 'number' ? o.displayTime : 0,
      at: o.at,
    };
  } catch {
    return null;
  }
}

export function writePlaybackSession(snap: Omit<PlaybackSessionSnapshot, 'at'>) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ ...snap, at: Date.now() } satisfies PlaybackSessionSnapshot),
    );
  } catch {
    /* ignore */
  }
}

export function clearPlaybackSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
