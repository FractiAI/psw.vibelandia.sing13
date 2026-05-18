import { loadBlob } from '@/lib/catalogPersistence';
import { saveLocalCopy } from '@/lib/localPlayback';
import type { TrackDef } from '@/lib/catalogTypes';

function extFromMime(mime: string): string {
  if (mime.includes('mpeg') || mime.includes('mp3')) return '.mp3';
  if (mime.includes('wav')) return '.wav';
  if (mime.includes('ogg')) return '.ogg';
  if (mime.includes('mp4') || mime.includes('m4a')) return '.m4a';
  if (mime.includes('webm')) return '.webm';
  if (mime.startsWith('video/')) return '.mp4';
  if (mime.startsWith('audio/')) return '.m4a';
  return '';
}

function safeFileName(title: string, artist: string, ext: string): string {
  const base = `${artist} - ${title}`.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim();
  return (base || 'track') + ext;
}

async function resolveBlob(track: TrackDef): Promise<Blob | null> {
  if (track.localMediaKey) {
    const blob = await loadBlob(track.localMediaKey);
    if (blob) return blob;
  }
  const url = track.videoSrc || track.src;
  if (!url) return null;
  if (url.startsWith('blob:') || url.startsWith('http')) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.blob();
    } catch {
      return null;
    }
  }
  return null;
}

/** Fetch from server (or local), save for in-app offline playback, and trigger browser download. */
export async function downloadTrackToDevice(track: TrackDef): Promise<void> {
  const blob = await resolveBlob(track);
  if (!blob) {
    throw new Error('no_file_on_device');
  }
  await saveLocalCopy(track.id, blob);
  const ext = extFromMime(blob.type) || (track.videoSrc ? '.mp4' : '.m4a');
  const name = safeFileName(track.title, track.artist, ext);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = name;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}
