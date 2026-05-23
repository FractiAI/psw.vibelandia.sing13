import { COVER_MAX_BYTES } from '@/lib/serverCatalog';

const COVER_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;
const COVER_MAX_EDGE = 2400;

export function isCoverImageFile(file: File): boolean {
  const type = (file.type || '').toLowerCase();
  if (type.startsWith('image/')) return true;
  return COVER_EXT.test(file.name);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('cover_convert_failed'));
    img.src = url;
  });
}

async function fileToDisplayJpeg(file: File, img: HTMLImageElement): Promise<File> {
  let { width, height } = img;
  if (width > COVER_MAX_EDGE || height > COVER_MAX_EDGE) {
    const s = COVER_MAX_EDGE / Math.max(width, height);
    width = Math.round(width * s);
    height = Math.round(height * s);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('cover_convert_failed');
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, 'image/jpeg', 0.9),
  );
  if (!blob) throw new Error('cover_convert_failed');
  const base = file.name.replace(/\.[^.]+$/, '') || 'cover';
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: file.lastModified });
}

/** Normalize for upload — accepts standard phone/camera sizes; resizes only when very large. */
export async function normalizeCoverForUpload(file: File): Promise<File> {
  if (!isCoverImageFile(file)) throw new Error('cover_not_image');
  if (file.size > COVER_MAX_BYTES) throw new Error('cover_too_large');

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const type = (file.type || '').toLowerCase();
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isHeic =
      type.includes('heic') ||
      type.includes('heif') ||
      ext === 'heic' ||
      ext === 'heif';
    const isStandard =
      !isHeic &&
      (type === 'image/jpeg' ||
        type === 'image/jpg' ||
        type === 'image/png' ||
        type === 'image/webp' ||
        (!type && (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp')));
    const needsResize = img.width > COVER_MAX_EDGE || img.height > COVER_MAX_EDGE;

    if (isStandard && !needsResize) return file;
    return fileToDisplayJpeg(file, img);
  } finally {
    URL.revokeObjectURL(url);
  }
}
