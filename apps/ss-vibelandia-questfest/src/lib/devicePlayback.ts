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

/** File picker accept — no video/* on iOS (native preview can blue-screen hang). */
export function uploadFileInputAccept(): string {
  if (isIOSDevice()) {
    return 'audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/*,.mp3,.m4a,.wav,.aac';
  }
  return 'audio/mpeg,audio/wav,audio/*,video/*,.mp3,.wav,.m4a,.mp4,.mov,.webm';
}

/** iOS: wait for picker to dismiss before starting network upload. */
export function deferAfterFilePicker(cb: () => void): void {
  if (!isIOSDevice()) {
    cb();
    return;
  }
  window.setTimeout(cb, 400);
}
