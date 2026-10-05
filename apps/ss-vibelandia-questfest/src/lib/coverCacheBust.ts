/**
 * Force browsers / CDN edges to refetch after overwrite to a stable blob path.
 * Data URLs and blob: previews are left unchanged.
 */
export function withCoverCacheBust(url: string, version: string | number = Date.now()): string {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;
  const without = url
    .replace(/([?&])v=[^&]*/g, '$1')
    .replace(/[?&]$/, '')
    .replace(/\?&/, '?');
  const sep = without.includes('?') ? '&' : '?';
  return `${without}${sep}v=${encodeURIComponent(String(version))}`;
}
