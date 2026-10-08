import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  COOL_JAZZ_PLAYLIST,
  COOL_JAZZ_PLAYLIST_ID,
  COOL_JAZZ_PLAYLIST_TRACK_IDS,
  coolJazzListenHref,
} from '../../lib/cool-jazz-playlist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Cool Jazz · Golden Y Frontier Club soundtrack', () => {
  it('locks the live catalog Cool Jazz playlist id and eight tracks', () => {
    expect(COOL_JAZZ_PLAYLIST_ID).toBe('pl-1791170281395');
    expect(COOL_JAZZ_PLAYLIST_TRACK_IDS).toHaveLength(8);
    expect(COOL_JAZZ_PLAYLIST_TRACK_IDS[0]).toBe('trk-srv-b347a19b-a84b-4797-96f6-8f0386aa8d6b');
    expect(COOL_JAZZ_PLAYLIST_TRACK_IDS[4]).toBe('trk-srv-605d475d-f834-459a-817f-593d333b2dc1');
    expect(COOL_JAZZ_PLAYLIST.name).toBe('Cool Jazz');
  });

  it('Golden Y club page autoplays Cool Jazz like Canvas / Reading Room', () => {
    const js = read('interfaces/golden-y-autoplay.js');
    const page = read('interfaces/golden-y-frontier-club.html');
    const playlists = read('interfaces/page-soundtrack-playlists.js');
    expect(js).toContain("playlistId: 'pl-1791170281395'");
    expect(js).toContain("staticPlaylist: (window.QV_PAGE_SOUNDTRACK_PLAYLISTS || {})['pl-1791170281395']");
    expect(playlists).toContain("'pl-1791170281395'");
    expect(playlists).toContain('Machote Soy Cool Jazz');
    expect(page).toContain('golden-y-autoplay.js');
    expect(page).toContain('page-soundtrack-playlists.js');
    expect(page).toContain('page-soundtrack.js');
    expect(page).toContain('id="golden-y-hero-audio"');
    expect(page).toContain('id="golden-y-hero-score"');
    expect(page).toContain('qv-sound-mute__label">Sound on');
    expect(page).toContain('playlist=pl-1791170281395');
    expect(coolJazzListenHref()).toContain('playlist=pl-1791170281395');
    expect(coolJazzListenHref()).toContain('autoplay=1');
  });
});
