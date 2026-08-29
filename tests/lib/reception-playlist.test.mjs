import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  RECEPTION_PLAYLIST,
  RECEPTION_PLAYLIST_ID,
  RECEPTION_PLAYLIST_TRACK_IDS,
  receptionListenHref,
} from '../../lib/reception-playlist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Reception · jukebox playlist', () => {
  it('begins with Welcome Aboard', () => {
    expect(RECEPTION_PLAYLIST_ID).toBe('pl-reception');
    expect(RECEPTION_PLAYLIST_TRACK_IDS).toHaveLength(1);
    expect(RECEPTION_PLAYLIST_TRACK_IDS[0]).toBe('trk-srv-4958316a-f7ef-4639-9765-e326d85fd808');
    expect(RECEPTION_PLAYLIST.name).toContain('Welcome Aboard');
  });

  it('is registered in static catalog and server reserved ids', () => {
    const catalog = JSON.parse(read('media/catalog/catalog.json'));
    const pl = catalog.playlists.find((p) => p.id === RECEPTION_PLAYLIST_ID);
    expect(pl).toBeTruthy();
    expect(pl.trackIds).toEqual([...RECEPTION_PLAYLIST_TRACK_IDS]);
    expect(read('lib/catalog-server.mjs')).toContain("'pl-reception'");
  });

  it('reception lobby links to jukebox listen with autoplay', () => {
    const html = read('lib/experience-phases.mjs');
    expect(html).toContain('receptionListenHref');
    expect(html).toContain('frontiersmen friends checking in');
    expect(receptionListenHref()).toContain('playlist=pl-reception');
    expect(receptionListenHref()).toContain('autoplay=1');
  });

  it('jukebox app pins reception in menu and blocks delete', () => {
    const seed = read('apps/ss-vibelandia-questfest/src/lib/catalogSeed.ts');
    const menu = read('apps/ss-vibelandia-questfest/src/lib/playlistMenuOrder.ts');
    const store = read('apps/ss-vibelandia-questfest/src/stores/catalogStore.ts');
    expect(seed).toContain('isReceptionPlaylist');
    expect(menu).toContain('RECEPTION_PLAYLIST_ID');
    expect(store).toMatch(/deletePlaylist[\s\S]{0,240}isReceptionPlaylist/);
  });
});
