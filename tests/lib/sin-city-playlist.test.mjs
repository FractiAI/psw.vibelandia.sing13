import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  SIN_CITY_PLAYLIST,
  SIN_CITY_PLAYLIST_ID,
  SIN_CITY_PLAYLIST_TRACK_IDS,
  SIN_CITY_OPENING_TRACK_ID,
  sinCityListenHref,
} from '../../lib/sin-city-playlist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Sin City · jukebox playlist', () => {
  it('opens with let\'s go holographic tonight', () => {
    expect(SIN_CITY_PLAYLIST_ID).toBe('pl-sin-city');
    expect(SIN_CITY_PLAYLIST_TRACK_IDS[0]).toBe(SIN_CITY_OPENING_TRACK_ID);
    expect(SIN_CITY_PLAYLIST_TRACK_IDS).toHaveLength(10);
    expect(SIN_CITY_PLAYLIST.name).toContain('Sin City');
  });

  it('is registered in static catalog and server reserved ids', () => {
    const catalog = JSON.parse(read('media/catalog/catalog.json'));
    const pl = catalog.playlists.find((p) => p.id === SIN_CITY_PLAYLIST_ID);
    expect(pl).toBeTruthy();
    expect(pl.trackIds).toEqual([...SIN_CITY_PLAYLIST_TRACK_IDS]);
    expect(read('lib/catalog-server.mjs')).toContain("'pl-sin-city'");
  });

  it('Deck 3 Night page autoplays Sin City soundtrack', () => {
    const js = read('interfaces/sin-city-autoplay.js');
    const page = read('interfaces/voyage/deck-3-night.html');
    expect(js).toContain("playlistId: 'pl-sin-city'");
    expect(page).toContain('sin-city-autoplay.js');
    expect(page).toContain('page-soundtrack.js');
    expect(page).toContain('/sin-city-program');
    expect(sinCityListenHref()).toContain('playlist=pl-sin-city');
  });
});
