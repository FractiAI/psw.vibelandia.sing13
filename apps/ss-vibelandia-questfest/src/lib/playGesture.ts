/** User tapped Play — wire src + .play() in the same turn (required on iOS Safari). */
export const PLAY_GESTURE_EVENT = 'qv-play-gesture';

export type PlayGestureDetail = { trackId: string };

export function dispatchPlayGesture(trackId: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<PlayGestureDetail>(PLAY_GESTURE_EVENT, { detail: { trackId } }),
  );
}

export function subscribePlayGesture(handler: (trackId: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onEvt = (ev: Event) => {
    const id = (ev as CustomEvent<PlayGestureDetail>).detail?.trackId;
    if (id) handler(id);
  };
  window.addEventListener(PLAY_GESTURE_EVENT, onEvt);
  return () => window.removeEventListener(PLAY_GESTURE_EVENT, onEvt);
}
