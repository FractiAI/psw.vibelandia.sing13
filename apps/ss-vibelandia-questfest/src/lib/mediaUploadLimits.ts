/** Upload limits — audio only (MP3, WAV, M4A, etc.); large files use direct Blob client upload. */

/** Legacy — video uploads disabled; kept for type compatibility. */
export const MAX_VIDEO_DURATION_SEC = 600;

/** ~80 min stereo MP3 at 128 kbps (direct Blob upload, not serverless body). */
export const MAX_MEDIA_UPLOAD_BYTES = 80 * 1024 * 1024;

const AUDIO_EXT = /\.(mp3|wav|m4a|aac|ogg|flac|opus)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|mkv|m4v|avi)$/i;

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || VIDEO_EXT.test(file.name);
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/') || AUDIO_EXT.test(file.name);
}

const PROBE_TIMEOUT_MS = 8_000;

export function probeAudioDurationSec(file: File): Promise<number | null> {
  return probeAudioDurationSecWithTimeout(file, PROBE_TIMEOUT_MS);
}

/** iOS Safari often never fires loadedmetadata — always time out. */
export function probeAudioDurationSecWithTimeout(
  file: File,
  timeoutMs = PROBE_TIMEOUT_MS,
): Promise<number | null> {
  if (!isAudioFile(file)) return Promise.resolve(null);
  if (typeof document === 'undefined') return Promise.resolve(null);

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement('audio');
    el.preload = 'metadata';
    let settled = false;
    const done = (value: number | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      el.removeAttribute('src');
      el.load();
      resolve(value);
    };
    const timer = window.setTimeout(() => done(null), timeoutMs);
    el.onloadedmetadata = () => {
      const d = el.duration;
      done(Number.isFinite(d) && d > 0 ? d : null);
    };
    el.onerror = () => done(null);
    el.src = url;
  });
}

/** @deprecated Use probeAudioDurationSec */
export const probeVideoDurationSec = probeAudioDurationSec;

export type UploadRejectReason = 'over_size' | 'over_duration' | 'not_audio';

export async function filterUploadableFiles(files: File[]): Promise<{
  uploadable: File[];
  rejected: Array<{ file: File; reason: UploadRejectReason }>;
}> {
  const uploadable: File[] = [];
  const rejected: Array<{ file: File; reason: UploadRejectReason }> = [];

  for (const file of files) {
    if (isVideoFile(file)) {
      rejected.push({ file, reason: 'not_audio' });
      continue;
    }
    if (!isAudioFile(file)) {
      rejected.push({ file, reason: 'not_audio' });
      continue;
    }
    if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
      rejected.push({ file, reason: 'over_size' });
      continue;
    }
    uploadable.push(file);
  }

  return { uploadable, rejected };
}

export function formatUploadRejectSummary(
  rejected: Array<{ file: File; reason: UploadRejectReason }>,
): string {
  if (!rejected.length) return '';
  const overDur = rejected.filter((r) => r.reason === 'over_duration');
  const overSize = rejected.filter((r) => r.reason === 'over_size');
  const parts: string[] = [];
  const notAudio = rejected.filter((r) => r.reason === 'not_audio');
  if (notAudio.length) {
    parts.push(
      `${notAudio.length} file${notAudio.length === 1 ? '' : 's'} not audio (use MP3 or WAV)`,
    );
  }
  if (overDur.length) {
    parts.push(
      `${overDur.length} file${overDur.length === 1 ? '' : 's'} over duration limit`,
    );
  }
  if (overSize.length) {
    parts.push(
      `${overSize.length} file${overSize.length === 1 ? '' : 's'} over the size limit (~80 MB)`,
    );
  }
  return parts.join(' · ');
}
