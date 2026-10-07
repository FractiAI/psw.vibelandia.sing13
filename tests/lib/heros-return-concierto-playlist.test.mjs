import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  HEROS_RETURN_CONCIERTO_PLAYLIST,
  HEROS_RETURN_CONCIERTO_PLAYLIST_ID,
  HEROS_RETURN_CONCIERTO_PROGRAM_ROUTE,
  HEROS_RETURN_CONCIERTO_TRACK_IDS,
  HEROS_RETURN_CONCIERTO_OPENING_TRACK_ID,
  herosReturnConciertoListenHref,
} from '../../lib/heros-return-concierto-playlist.mjs';
import { PINNED_SOVEREIGN_PLAYLIST_IDS } from '../../lib/pinned-sovereign-playlists.mjs';
import { getPlaylistProgramMeta } from '../../lib/playlist-program-routes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe("Hero's Return Concierto · jukebox playlist", () => {
  it('has twelve movements 1:12→12:12 in order', () => {
    expect(HEROS_RETURN_CONCIERTO_PLAYLIST_ID).toBe('pl-heros-return-concierto');
    expect(HEROS_RETURN_CONCIERTO_TRACK_IDS).toHaveLength(12);
    expect(HEROS_RETURN_CONCIERTO_TRACK_IDS[0]).toBe(HEROS_RETURN_CONCIERTO_OPENING_TRACK_ID);
    expect(HEROS_RETURN_CONCIERTO_PLAYLIST.name).toBe("The Hero's Return Concierto");
  });

  it('is registered in static catalog, pin set, and program route', () => {
    const catalog = JSON.parse(read('media/catalog/catalog.json'));
    const pl = catalog.playlists.find((p) => p.id === HEROS_RETURN_CONCIERTO_PLAYLIST_ID);
    expect(pl).toBeTruthy();
    expect(pl.trackIds).toEqual([...HEROS_RETURN_CONCIERTO_TRACK_IDS]);
    expect(PINNED_SOVEREIGN_PLAYLIST_IDS.has(HEROS_RETURN_CONCIERTO_PLAYLIST_ID)).toBe(true);
    expect(read('lib/catalog-server.mjs')).toContain("'pl-heros-return-concierto'");
    const meta = getPlaylistProgramMeta(HEROS_RETURN_CONCIERTO_PLAYLIST_ID);
    expect(meta?.route).toBe(HEROS_RETURN_CONCIERTO_PROGRAM_ROUTE);
  });

  it('announcement page + vercel + listen href', () => {
    const page = read('interfaces/heros-return-concierto.html');
    expect(page).toContain('The Hero’s Return Concierto');
    expect(page).toContain('Sovereignty Player');
    expect(page).toContain('pl-heros-return-concierto');
    expect(page).toContain('/interfaces/assets/heros-return-concierto/hero-album-cover.jpg');
    expect(page).toContain('/interfaces/assets/heros-return-concierto/chart-compass-expedition.jpg');
    expect(read('vercel.json')).toMatch(/"source":\s*"\/heros-return-concierto"/);
    expect(herosReturnConciertoListenHref()).toContain('playlist=pl-heros-return-concierto');
    expect(herosReturnConciertoListenHref()).toContain('autoplay=1');
  });
});
