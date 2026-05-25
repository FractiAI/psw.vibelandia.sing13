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

/** File picker accept — no video/* or audio/* wildcards on iOS (native preview blue-screens). */
export function uploadFileInputAccept(): string {
  if (isIOSDevice()) {
    return '.mp3,.m4a,.wav,.aac,audio/mpeg,audio/mp4,audio/x-m4a';
  }
  return 'audio/mpeg,audio/wav,audio/*,video/*,.mp3,.wav,.m4a,.mp4,.mov,.webm';
}

/** iOS cover picker — same dismiss delay as audio (Photos UI overlap). */
export function uploadCoverInputAccept(): string {
  if (isIOSDevice()) {
    return '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
  }
  return 'image/jpeg,image/png,image/webp,image/heic,image/heif,image/*,.jpg,.jpeg,.png,.webp,.heic';
}

const IOS_PICKER_DISMISS_MS = 720;

/**
 * iOS: wait for the system file/photo picker to fully dismiss before DOM/network work.
 * Double rAF + timeout avoids the Safari blue-screen hang on Upload tab.
 */
export function deferAfterFilePicker(cb: () => void): void {
  if (!isIOSDevice()) {
    cb();
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.setTimeout(cb, IOS_PICKER_DISMISS_MS);
    });
  });
}
