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

/** File picker accept — extensions only on iOS (MIME wildcards break multi-select on Safari). */
export function uploadFileInputAccept(): string {
  if (isIOSDevice()) {
    return '.mp3,.m4a,.wav,.aac';
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

const IOS_PICKER_DISMISS_MS = 1100;
/** Desktop/Android: brief delay so multi-select dialogs finish before we touch the input or network. */
const DESKTOP_PICKER_DISMISS_MS = 120;

/**
 * Wait for the system file picker to fully dismiss before DOM/network work.
 * Double rAF + timeout avoids Safari hangs and Windows multi-select returning to an empty picker.
 */
export function deferAfterFilePicker(cb: () => void): void {
  const delay = isIOSDevice() ? IOS_PICKER_DISMISS_MS : DESKTOP_PICKER_DISMISS_MS;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.setTimeout(cb, delay);
    });
  });
}

const IOS_RETAIN_MAX_BYTES = 48 * 1024 * 1024;

function guessAudioMime(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith('.m4a') || n.endsWith('.aac')) return 'audio/mp4';
  if (n.endsWith('.wav')) return 'audio/wav';
  return 'audio/mpeg';
}

/**
 * iOS Safari can drop File references when the input is reset — copy into memory first.
 * Skips retain for very large singles (stream upload uses the original File when possible).
 */
export async function retainPickedFilesForIOS(files: File[]): Promise<File[]> {
  if (!isIOSDevice() || !files.length) return files;
  const total = files.reduce((s, f) => s + f.size, 0);
  if (total > IOS_RETAIN_MAX_BYTES) return files;

  const out: File[] = [];
  for (const f of files) {
    try {
      const buf = await f.arrayBuffer();
      out.push(
        new File([buf], f.name, {
          type: f.type || guessAudioMime(f.name),
          lastModified: f.lastModified,
        }),
      );
    } catch {
      out.push(f);
    }
  }
  return out;
}
