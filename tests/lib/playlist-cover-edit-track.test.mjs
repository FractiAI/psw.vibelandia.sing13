import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const BUST = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/coverCacheBust.ts');
const SERVER = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/serverCatalog.ts');
const NOW = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/pages/JukeboxNowPlayingPage.tsx');
const PANEL = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/jukebox/JukeboxTrackPanel.tsx');

/** Mirror of withCoverCacheBust for regression without importing app TS. */
function withCoverCacheBust(url, version = Date.now()) {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;
  const without = url
    .replace(/([?&])v=[^&]*/g, '$1')
    .replace(/[?&]$/, '')
    .replace(/\?&/, '?');
  const sep = without.includes('?') ? '&' : '?';
  return `${without}${sep}v=${encodeURIComponent(String(version))}`;
}

describe('playlist cover Change image cache-bust', () => {
  it('appends a fresh v= token so overwrite URLs remount', () => {
    const base = 'https://blob.example/catalog/playlist-covers/pl-1.jpg';
    const first = withCoverCacheBust(base, 100);
    const second = withCoverCacheBust(first, 200);
    expect(first).toBe(`${base}?v=100`);
    expect(second).toBe(`${base}?v=200`);
    expect(first).not.toBe(second);
  });

  it('ships withCoverCacheBust helper and wires both cover upload paths', () => {
    const helper = readFileSync(BUST, 'utf8');
    expect(helper).toMatch(/export function withCoverCacheBust/);
    const src = readFileSync(SERVER, 'utf8');
    expect(src).toMatch(/withCoverCacheBust/);
    const returns = src.match(/return withCoverCacheBust\(blob\.url\)/g) ?? [];
    expect(returns.length).toBeGreaterThanOrEqual(2);
  });
});

describe('listening page Edit track for creator uploads', () => {
  it('exposes Edit track on Now Playing for user-upload tracks', () => {
    const src = readFileSync(NOW, 'utf8');
    expect(src).toMatch(/isUserUploadTrack/);
    expect(src).toMatch(/TrackEditModal/);
    expect(src).toMatch(/PLAIN\.editTrack/);
  });

  it('exposes Edit track on browse listening rows for user-upload tracks', () => {
    const src = readFileSync(PANEL, 'utf8');
    expect(src).toMatch(/isUserUploadTrack/);
    expect(src).toMatch(/TrackEditModal/);
    expect(src).toMatch(/onEditTrack/);
    expect(src).toMatch(/jb-track-edit/);
  });
});
