import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  PINNED_SOVEREIGN_PLAYLISTS,
  reconcilePinnedSovereignPlaylists,
} from '../../lib/pinned-sovereign-playlists.mjs';
import { CONCIERTO_PRELUDE_PLAYLIST_ID } from '../../lib/concierto-prelude-playlist.mjs';
import { READING_ROOM_PLAYLIST_ID } from '../../lib/reading-room-playlist.mjs';
import { RECEPTION_PLAYLIST_ID } from '../../lib/reception-playlist.mjs';
import { SIN_CITY_PLAYLIST_ID } from '../../lib/sin-city-playlist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Pinned sovereign jukebox playlists', () => {
  it('registers all four SS Vibelandia sovereign sets with canonical names', () => {
    const byId = Object.fromEntries(PINNED_SOVEREIGN_PLAYLISTS.map((p) => [p.id, p]));
    expect(byId[CONCIERTO_PRELUDE_PLAYLIST_ID]?.name).toBe(
      'Holographic Magnetic Goldilocks Art SS Canvas Landing',
    );
    expect(byId[RECEPTION_PLAYLIST_ID]?.name).toBe('SS Vibelandia Check-In');
    expect(byId[SIN_CITY_PLAYLIST_ID]?.name).toBe('SS Vibelandia Sin City');
    expect(byId[READING_ROOM_PLAYLIST_ID]?.name).toBe('SS Vibelandia Reading Room');
  });

  it('jukebox menu pins all four sovereign playlists after master and likes', () => {
    const menu = read('apps/ss-vibelandia-questfest/src/lib/playlistMenuOrder.ts');
    expect(menu).toContain('CONCIERTO_PRELUDE_PLAYLIST_ID');
    expect(menu).toContain('RECEPTION_PLAYLIST_ID');
    expect(menu).toContain('SIN_CITY_PLAYLIST_ID');
    expect(menu).toContain('READING_ROOM_PLAYLIST_ID');
  });

  it('reconcile restores track lists when overlay strips pinned ids', () => {
    const catalog = JSON.parse(read('media/catalog/catalog.json'));
    const stripped = {
      ...catalog,
      playlists: catalog.playlists.map((p) =>
        PINNED_SOVEREIGN_PLAYLISTS.some((x) => x.id === p.id) ? { ...p, trackIds: [] } : p,
      ),
    };
    const restored = reconcilePinnedSovereignPlaylists(stripped);
    for (const pinned of PINNED_SOVEREIGN_PLAYLISTS) {
      const pl = restored.playlists.find((p) => p.id === pinned.id);
      expect(pl?.trackIds).toEqual(pinned.trackIds);
      expect(pl?.name).toBe(pinned.name);
    }
  });
});
