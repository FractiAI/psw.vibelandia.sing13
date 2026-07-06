import type { TrackDef } from '@/lib/catalogTypes';

export function buildTrackListenUrl(trackId: string): string {
  if (typeof window === 'undefined') {
    return `https://www.ssvibelandiaquestfest24x365.com/interfaces/questfest-bridge/#/listen?track=${encodeURIComponent(trackId)}`;
  }
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/listen?track=${encodeURIComponent(trackId)}`;
}

export function buildTrackShareText(track: TrackDef): string {
  return `${track.title} · ${track.artist} — SS Vibelandia QUESTFEST`;
}

export type ShareTrackResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Native share sheet when available; otherwise copy link to clipboard. */
export async function shareTrack(track: TrackDef): Promise<ShareTrackResult> {
  const url = buildTrackListenUrl(track.id);
  const text = buildTrackShareText(track);

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: track.title,
        text,
        url,
      });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}
