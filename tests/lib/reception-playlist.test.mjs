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
  it('opens with Capitán\'s Welcome, Welcome Aboard, The Shift, Universo Syntheverse, then caliente set', () => {
    expect(RECEPTION_PLAYLIST_ID).toBe('pl-reception');
    expect(RECEPTION_PLAYLIST_TRACK_IDS).toHaveLength(13);
    expect(RECEPTION_PLAYLIST_TRACK_IDS[0]).toBe('trk-srv-6025557c-f76c-4a55-bd7c-0fc2d5ffcfb4');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[1]).toBe('trk-srv-4958316a-f7ef-4639-9765-e326d85fd808');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[2]).toBe('trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[3]).toBe('trk-srv-21e83580-3b12-44a0-884a-8679fa1d6a9a');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[4]).toBe('trk-srv-0a4b414c-9ce0-41b2-901b-8e5b11215a09');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[5]).toBe('trk-srv-b2eccf1d-a165-4b4e-8e3a-d4d3ce53b89a');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[6]).toBe('trk-srv-d057c001-ebf8-4cf9-be19-e3d6537842a6');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[7]).toBe('trk-srv-7c29e8cf-b516-4689-882c-e94550b30636');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[8]).toBe('trk-srv-0f63093f-bd81-4a96-bfe6-56b6d9c31ef9');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[9]).toBe('trk-srv-0f971a21-b916-436d-bae5-9fe5c0f8878d');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[10]).toBe('trk-srv-6bb07c9c-6850-4f24-963c-7d9e951e2f9d');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[11]).toBe('trk-srv-b07ee8da-c47a-4508-9218-8cb4df59db59');
    expect(RECEPTION_PLAYLIST_TRACK_IDS[12]).toBe('trk-srv-67a11292-8d55-4ea0-a748-fe915969b6fd');
    expect(RECEPTION_PLAYLIST.name).toContain('check-in soundtrack');
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
    expect(html).not.toContain('id="reception-hero-audio"');
    expect(html).not.toContain('id="reception-hero-score"');
    expect(receptionListenHref()).toContain('playlist=pl-reception');
    expect(receptionListenHref()).toContain('autoplay=1');
  });

  it('reception page autoplays check-in soundtrack on load', () => {
    const js = read('interfaces/reception-autoplay.js');
    const questfest = read('interfaces/vibelandia-questfest.html');
    expect(js).toContain("PLAYLIST_ID = 'pl-reception'");
    expect(js).toContain('/api/catalog');
    expect(js).toContain('reception-hero-audio');
    expect(js).toContain('#reception-lobby');
    expect(js).toContain('prefers-reduced-motion');
    expect(questfest).toContain('reception-autoplay.js');
    expect(questfest).toContain('id="reception-hero-audio"');
    expect(questfest).toContain('id="reception-hero-score"');
    expect(questfest).toContain('href="/lattice-chat">Lattice Chat</a>');
    expect(questfest).toContain('QR Share</button>');
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
