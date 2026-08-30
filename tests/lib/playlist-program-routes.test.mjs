import { describe, expect, it } from 'vitest';
import {
  PLAYLIST_PROGRAM_ROUTES,
  getPlaylistProgramMeta,
} from '../../lib/playlist-program-routes.mjs';
import { RECEPTION_PLAYLIST_ID } from '../../lib/reception-playlist.mjs';
import { SIN_CITY_PLAYLIST_ID } from '../../lib/sin-city-playlist.mjs';

describe('Playlist program routes · sovereign soundtrack map', () => {
  it('maps pl-reception to Front Desk check-in program', () => {
    const meta = getPlaylistProgramMeta(RECEPTION_PLAYLIST_ID);
    expect(meta).toBeTruthy();
    expect(meta?.route).toBe('/front-desk-program');
    expect(meta?.label).toBe('Check-in program');
  });

  it('maps pl-sin-city and pl-concierto-prelude', () => {
    expect(getPlaylistProgramMeta(SIN_CITY_PLAYLIST_ID)?.route).toBe('/sin-city-program');
    expect(getPlaylistProgramMeta('pl-concierto-prelude')?.route).toBe('/concierto-program');
  });

  it('returns null for playlists without programs', () => {
    expect(getPlaylistProgramMeta('pl-main')).toBeNull();
    expect(Object.keys(PLAYLIST_PROGRAM_ROUTES)).toHaveLength(3);
  });
});
