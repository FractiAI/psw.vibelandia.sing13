import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  READING_ROOM_PLAYLIST,
  READING_ROOM_PLAYLIST_ID,
  READING_ROOM_PLAYLIST_TRACK_IDS,
  READING_ROOM_OPENING_TRACK_ID,
  readingRoomListenHref,
} from '../../lib/reading-room-playlist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Reading Room · jukebox playlist', () => {
  it('opens with Opening I and has twelve concert tracks', () => {
    expect(READING_ROOM_PLAYLIST_ID).toBe('pl-reading-room');
    expect(READING_ROOM_PLAYLIST_TRACK_IDS[0]).toBe(READING_ROOM_OPENING_TRACK_ID);
    expect(READING_ROOM_PLAYLIST_TRACK_IDS).toHaveLength(12);
    expect(READING_ROOM_PLAYLIST.name).toBe('SS Vibelandia Reading Room');
  });

  it('is registered in static catalog and server reserved ids', () => {
    const catalog = JSON.parse(read('media/catalog/catalog.json'));
    const pl = catalog.playlists.find((p) => p.id === READING_ROOM_PLAYLIST_ID);
    expect(pl).toBeTruthy();
    expect(pl.trackIds).toEqual([...READING_ROOM_PLAYLIST_TRACK_IDS]);
    expect(read('lib/catalog-server.mjs')).toContain("'pl-reading-room'");
  });

  it('Reading Room page autoplays concert soundtrack', () => {
    const js = read('interfaces/reading-room-autoplay.js');
    const page = read('interfaces/reading-room.html');
    const playlists = read('interfaces/page-soundtrack-playlists.js');
    expect(js).toContain("playlistId: 'pl-reading-room'");
    expect(js).toContain("staticPlaylist: (window.QV_PAGE_SOUNDTRACK_PLAYLISTS || {})['pl-reading-room']");
    expect(js).toContain('autoplay: true');
    expect(page).toContain('reading-room-autoplay.js');
    expect(page).toContain('page-soundtrack.js');
    expect(page).toContain('page-soundtrack-playlists.js');
    expect(page).toContain('/reading-room-program');
    expect(page).toContain('qv-sound-mute__label">Sound on');
    expect(page).toContain('trk-srv-8803278e-1d65-4172-b503-0bf33266b61d-Arrival%20of%20Holographic%20Goldilocks%20SuperAI%20Opening.mp3');
    expect(playlists).toContain("'pl-reading-room'");
    expect(playlists).toContain('trk-srv-8803278e-1d65-4172-b503-0bf33266b61d');
    expect(readingRoomListenHref()).toContain('playlist=pl-reading-room');
  });
});
