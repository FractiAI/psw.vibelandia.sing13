/** Global media element refs — survive tab/view remounts and screensaver handoff. */
type MediaPair = {
  primary: HTMLVideoElement | HTMLAudioElement | null;
  background: HTMLAudioElement | null;
};

let media: MediaPair = { primary: null, background: null };

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
  const handoff =
    typeof document !== 'undefined' &&
    document.hidden &&
    st.background &&
    !st.background.paused &&
    !!st.background.src;
  if (handoff) return st.background.currentTime;
  if (st.primary && st.primary.src) return st.primary.currentTime;
  return 0;
}
