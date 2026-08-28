import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  CONCIERTO_PRELUDE_PLAYLIST,
  CONCIERTO_PRELUDE_PLAYLIST_ID,
  CONCIERTO_PRELUDE_TRACK_IDS,
} from '../../lib/concierto-prelude-playlist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Concierto prelude · jukebox playlist', () => {
  it('exports a twelve-track playlist ending with Return 05 finale', () => {
    expect(CONCIERTO_PRELUDE_PLAYLIST_ID).toBe('pl-concierto-prelude');
    expect(CONCIERTO_PRELUDE_TRACK_IDS).toHaveLength(12);
    expect(CONCIERTO_PRELUDE_TRACK_IDS[0]).toBe('trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52');
    expect(CONCIERTO_PRELUDE_TRACK_IDS[11]).toBe('trk-srv-939d3f35-9660-4911-8b5b-c7cb2d3626b3');
    expect(CONCIERTO_PRELUDE_PLAYLIST.name).toContain('Concierto de El Gran Sol');
  });

  it('is registered in static catalog and server reserved ids', () => {
    const catalog = JSON.parse(read('media/catalog/catalog.json'));
    const pl = catalog.playlists.find((p) => p.id === CONCIERTO_PRELUDE_PLAYLIST_ID);
    expect(pl).toBeTruthy();
    expect(pl.trackIds).toEqual([...CONCIERTO_PRELUDE_TRACK_IDS]);
    expect(read('lib/catalog-server.mjs')).toContain("'pl-concierto-prelude'");
  });

  it('matches landing canvas prelude track order', () => {
    const canvas = read('interfaces/canvas-prelude-playlist.js');
    for (const id of CONCIERTO_PRELUDE_TRACK_IDS) {
      expect(canvas).toContain(`id: '${id}'`);
    }
  });

  it('jukebox app pins prelude in menu and blocks delete', () => {
    const seed = read('apps/ss-vibelandia-questfest/src/lib/catalogSeed.ts');
    const menu = read('apps/ss-vibelandia-questfest/src/lib/playlistMenuOrder.ts');
    const store = read('apps/ss-vibelandia-questfest/src/stores/catalogStore.ts');
    expect(seed).toContain('isConciertoPreludePlaylist');
    expect(menu).toContain('CONCIERTO_PRELUDE_PLAYLIST_ID');
    expect(store).toMatch(/deletePlaylist[\s\S]{0,200}isConciertoPreludePlaylist/);
  });

  it('landing hero uses in-page audio; jukebox keeps optional prelude bridge', () => {
    const hero = read('interfaces/canvas-hero-loop.js');
    const bridge = read('apps/ss-vibelandia-questfest/src/hooks/useJukeboxPreludeBridge.ts');
    const playback = read('apps/ss-vibelandia-questfest/src/components/player/PlaybackRoot.tsx');
    expect(hero).toContain('canvas-hero-shift');
    expect(hero).not.toContain('qv-jukebox-prelude');
    expect(bridge).toContain('JUKEBOX_PRELUDE_CHANNEL');
    expect(playback).toContain('useJukeboxPreludeBridge');
  });
});
