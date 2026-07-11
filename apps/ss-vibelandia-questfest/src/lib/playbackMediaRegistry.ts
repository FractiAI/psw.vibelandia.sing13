import { usePlaybackStore } from '@/stores/playbackStore';

/** Global media element refs — survive tab/view remounts and screensaver handoff. */
type MediaPair = {
  primary: HTMLVideoElement | HTMLAudioElement | null;
  background: HTMLAudioElement | null;
};

let media: MediaPair = { primary: null, background: null };

/** Stop hidden handoff audio so foreground controls never stack two streams. */
export function pauseBackgroundPlayback(): void {
  const bg = media.background;
  if (!bg) {
    usePlaybackStore.getState().setBackgroundHandoffActive(false);
    return;
  }
  bg.pause();
  try {
    bg.removeAttribute('src');
    bg.load();
  } catch {
    /* ignore */
  }
  usePlaybackStore.getState().setBackgroundHandoffActive(false);
}

export function registerPlaybackMedia(
  primary: HTMLVideoElement | HTMLAudioElement | null,
  background: HTMLAudioElement | null,
) {
  media = { primary, background };
}

export function getPlaybackMedia(): MediaPair {
  return media;
}

export function readLivePlaybackPosition(): number {
  const st = media;
  const bg = st.background;
  const primary = st.primary;

  if (bg?.src && !bg.paused) return bg.currentTime;
  if (primary?.src) {
    if (!primary.paused) return primary.currentTime;
    if (bg?.src && bg.currentTime > 0.25) return bg.currentTime;
    return primary.currentTime;
  }
  if (bg?.src) return bg.currentTime;
  return 0;
}
