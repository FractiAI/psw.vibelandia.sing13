import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  FRONT_DESK_PROGRAM_ROUTE,
  FRONT_DESK_PROGRAM_TRACKS,
  assertFrontDeskProgramTrackOrder,
  renderFrontDeskProgramPageHtml,
} from '../../lib/front-desk-program.mjs';
import { RECEPTION_PLAYLIST_TRACK_IDS } from '../../lib/reception-playlist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Front Desk · check-in program', () => {
  it('matches reception playlist track order', () => {
    expect(() => assertFrontDeskProgramTrackOrder()).not.toThrow();
    expect(FRONT_DESK_PROGRAM_TRACKS).toHaveLength(RECEPTION_PLAYLIST_TRACK_IDS.length);
    expect(FRONT_DESK_PROGRAM_TRACKS[0].title).toContain('Capitán');
    expect(FRONT_DESK_PROGRAM_TRACKS.at(-3)?.title).toBe('zero divided by zero');
    expect(FRONT_DESK_PROGRAM_TRACKS.at(-2)?.title).toBe('perfect hydrogen crystal');
    expect(FRONT_DESK_PROGRAM_TRACKS.at(-1)?.title).toBe('hydrogen y line frontier accordion');
    expect(FRONT_DESK_PROGRAM_TRACKS.at(-1)?.finale).toBe(true);
  });

  it('renders Broadway-style program page with download and track notes', () => {
    const html = renderFrontDeskProgramPageHtml();
    expect(html).toContain('Front Desk Check-In Program');
    expect(html).toContain('Download program (PDF)');
    expect(html).toContain('we are the dance that makes the music');
    expect(html).toContain('perfect hydrogen crystal');
    expect(html).toContain('hydrogen y line frontier accordion');
    expect(html).toContain('Capitán');
    expect(html).toContain('Honesty boundary');
    expect(html).toContain(FRONT_DESK_PROGRAM_ROUTE);
  });

  it('is synced to interfaces and vercel route', () => {
    const page = read('interfaces/front-desk-check-in-program.html');
    expect(page).toContain('Front Desk Check-In Program');
    expect(page).toContain('Download program (PDF)');
    expect(read('vercel.json')).toMatch(/"source":\s*"\/front-desk-program"/);
  });

  it('Front Desk lobby links to check-in program', () => {
    const phases = read('lib/experience-phases.mjs');
    expect(phases).toContain('/front-desk-program');
    expect(phases).toContain('Read the check-in program');
  });
});
