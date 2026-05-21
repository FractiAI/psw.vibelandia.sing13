const STORAGE_KEY = 'qv-playback-prefs';

export type PlaybackPrefs = {
  autoplay: boolean;
  backgroundPlay: boolean;
};

export const PLAYBACK_PREFS_DEFAULT: PlaybackPrefs = {
  autoplay: true,
  backgroundPlay: true,
};

export function readPlaybackPrefs(): PlaybackPrefs {
  if (typeof window === 'undefined') return { ...PLAYBACK_PREFS_DEFAULT };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...PLAYBACK_PREFS_DEFAULT };
    const parsed = JSON.parse(raw) as Partial<PlaybackPrefs>;
    return {
      autoplay: parsed.autoplay !== false,
      backgroundPlay: parsed.backgroundPlay !== false,
    };
  } catch {
    return { ...PLAYBACK_PREFS_DEFAULT };
  }
}

export function writePlaybackPrefs(patch: Partial<PlaybackPrefs>): PlaybackPrefs {
  const next = { ...readPlaybackPrefs(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

/** Pass / captain unlock: turn on member playback defaults. */
export function applyPassHolderPlaybackDefaults(): PlaybackPrefs {
  return writePlaybackPrefs({ autoplay: true, backgroundPlay: true });
}
