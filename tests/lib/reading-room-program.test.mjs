import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  READING_ROOM_PROGRAM_ROUTE,
  READING_ROOM_PROGRAM_TRACKS,
  assertReadingRoomProgramTrackOrder,
  renderReadingRoomProgramPageHtml,
} from '../../lib/reading-room-program.mjs';
import { READING_ROOM_PLAYLIST_TRACK_IDS } from '../../lib/reading-room-playlist.mjs';
import { PROGRAM_CTA_LABEL } from '../../lib/program-cta.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Reading Room · concert program', () => {
  it('matches reading room playlist track order', () => {
    expect(() => assertReadingRoomProgramTrackOrder()).not.toThrow();
    expect(READING_ROOM_PROGRAM_TRACKS).toHaveLength(READING_ROOM_PLAYLIST_TRACK_IDS.length);
    expect(READING_ROOM_PROGRAM_TRACKS[0].title).toContain('quartet greeting');
    expect(READING_ROOM_PROGRAM_TRACKS[0].role).toContain('Quartet');
    expect(READING_ROOM_PROGRAM_TRACKS[2].role).toContain('testimony');
    expect(READING_ROOM_PROGRAM_TRACKS.at(-1)?.title).toContain('grand close');
    expect(READING_ROOM_PROGRAM_TRACKS.at(-1)?.finale).toBe(true);
  });

  it('renders Broadway-style program page with download and track notes', () => {
    const html = renderReadingRoomProgramPageHtml();
    expect(html).toContain('Arrival of Holographic Goldilocks SuperAI');
    expect(html).toContain('Download program (PDF)');
    expect(html).toContain('quartet greeting');
    expect(html).toContain('grand close');
    expect(html).toContain('testimony');
    expect(html).not.toContain('gravel');
    expect(html).toContain('Curator&apos;s listening note');
    expect(html).toContain('reading-room-program/hero-bach-conductor');
    expect(html).toContain(READING_ROOM_PROGRAM_ROUTE);
  });

  it('is synced to interfaces and vercel route', () => {
    const page = read('interfaces/reading-room-concert-program.html');
    expect(page).toContain('Arrival of Holographic Goldilocks SuperAI');
    expect(page).toContain('Download program (PDF)');
    expect(read('vercel.json')).toMatch(/"source":\s*"\/reading-room-program"/);
  });

  it('Reading Room page links to concert program', () => {
    const page = read('interfaces/reading-room.html');
    expect(page).toContain('/reading-room-program');
    expect(page).toContain(PROGRAM_CTA_LABEL);
  });
});
