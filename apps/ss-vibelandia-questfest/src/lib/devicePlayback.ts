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

/** Above this count, retain each file right before upload instead of upfront (avoids picker loops). */
export const BULK_RETAIN_UPFRONT_MAX = 25;

/** Desktop: auto-start upload after pick only when at or below this count. */
export const BULK_UPLOAD_AUTO_START_MAX = 40;

/** Per-file retain on iOS (multi-select); avoids dropping refs before batch upload finishes. */
const IOS_RETAIN_FILE_MAX_BYTES = 12 * 1024 * 1024;

function guessAudioMime(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith('.m4a') || n.endsWith('.aac')) return 'audio/mp4';
  if (n.endsWith('.wav')) return 'audio/wav';
  return 'audio/mpeg';
}

/** Copy one picked file into memory (iOS Safari drops refs when the input is reset). */
export async function retainSingleFileForIOS(file: File): Promise<File> {
  if (!isIOSDevice()) return file;
  if (file.size > IOS_RETAIN_FILE_MAX_BYTES) return file;
  return retainFileForBulkUpload(file);
}

/**
 * Read file into memory before bulk upload — avoids repeated OS "Open" prompts
 * (OneDrive/cloud folders, iOS file refs, lazy directory handles).
 */
export async function retainFileForBulkUpload(file: File): Promise<File> {
  try {
    const buf = await file.arrayBuffer();
    return new File([buf], file.name, {
      type: file.type || guessAudioMime(file.name),
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}

/**
 * iOS Safari can drop File references when the input is reset — copy into memory first.
 * For large multi-selects, skip upfront retain (caller retains per file during upload).
 */
export async function retainPickedFilesForIOS(files: File[]): Promise<File[]> {
  if (!isIOSDevice() || !files.length) return files;
  if (files.length > BULK_RETAIN_UPFRONT_MAX) return files;

  const out: File[] = [];
  for (const f of files) {
    out.push(await retainSingleFileForIOS(f));
  }
  return out;
}
