export const QV_TRACK_DOWNLOADED = 'qv-track-downloaded';

export function dispatchTrackDownloaded(trackId: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(QV_TRACK_DOWNLOADED, { detail: { trackId } }));
}

export function subscribeTrackDownloaded(handler: (trackId: string) => void): () => void {
  const fn = (e: Event) => {
    const detail = (e as CustomEvent<{ trackId: string }>).detail;
    if (detail?.trackId) handler(detail.trackId);
  };
  window.addEventListener(QV_TRACK_DOWNLOADED, fn);
  return () => window.removeEventListener(QV_TRACK_DOWNLOADED, fn);
}
