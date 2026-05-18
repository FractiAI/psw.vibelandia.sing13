/** Upload limits — videos up to 10 minutes; large files use direct Blob client upload. */

export const MAX_VIDEO_DURATION_SEC = 600;

/** ~10 min at 720p–1080p web bitrates (direct Blob upload, not serverless body). */
export const MAX_MEDIA_UPLOAD_BYTES = 600 * 1024 * 1024;

const VIDEO_EXT = /\.(mp4|webm|mov|mkv|m4v|avi)$/i;

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/') || VIDEO_EXT.test(file.name);
}

export function probeVideoDurationSec(file: File): Promise<number | null> {
  if (!isVideoFile(file)) return Promise.resolve(null);
  if (typeof document === 'undefined') return Promise.resolve(null);

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement('video');
    el.preload = 'metadata';
    const done = (value: number | null) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    el.onloadedmetadata = () => {
      const d = el.duration;
      done(Number.isFinite(d) && d > 0 ? d : null);
    };
    el.onerror = () => done(null);
    el.src = url;
  });
}

export type UploadRejectReason = 'over_size' | 'over_duration';

export async function filterUploadableFiles(files: File[]): Promise<{
  uploadable: File[];
  rejected: Array<{ file: File; reason: UploadRejectReason }>;
}> {
  const uploadable: File[] = [];
  const rejected: Array<{ file: File; reason: UploadRejectReason }> = [];

  for (const file of files) {
    if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
      rejected.push({ file, reason: 'over_size' });
      continue;
    }
    const durationSec = await probeVideoDurationSec(file);
    if (durationSec !== null && durationSec > MAX_VIDEO_DURATION_SEC) {
      rejected.push({ file, reason: 'over_duration' });
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
  if (overDur.length) {
    parts.push(
      `${overDur.length} video${overDur.length === 1 ? '' : 's'} over 10 minutes`,
    );
  }
  if (overSize.length) {
    parts.push(
      `${overSize.length} file${overSize.length === 1 ? '' : 's'} over the size limit (~600 MB)`,
    );
  }
  return parts.join(' · ');
}
