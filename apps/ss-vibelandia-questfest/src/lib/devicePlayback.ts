/** True on iPhone / iPad / iPod (incl. iPadOS desktop UA). */
export function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

/** iOS Safari blocks programmatic play on clipped / display:none media. */
export const IOS_PLAYABLE_MEDIA_CLASS = 'sp-media-playback-el';

/** iPhone/iPad: never mount <video> — native layer causes blue-screen hang. */
export function iosAudioOnlyPlayback(): boolean {
  return isIOSDevice();
}
