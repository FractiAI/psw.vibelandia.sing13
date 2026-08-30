import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  SIN_CITY_PROGRAM_ROUTE,
  SIN_CITY_PROGRAM_TRACKS,
  assertSinCityProgramTrackOrder,
  renderSinCityProgramPageHtml,
} from '../../lib/sin-city-program.mjs';
import { SIN_CITY_PLAYLIST_TRACK_IDS } from '../../lib/sin-city-playlist.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Sin City · night program', () => {
  it('matches Sin City playlist track order', () => {
    expect(() => assertSinCityProgramTrackOrder()).not.toThrow();
    expect(SIN_CITY_PROGRAM_TRACKS).toHaveLength(SIN_CITY_PLAYLIST_TRACK_IDS.length);
    expect(SIN_CITY_PROGRAM_TRACKS[0].title).toContain('holographic tonight');
    expect(SIN_CITY_PROGRAM_TRACKS).toHaveLength(5);
    expect(SIN_CITY_PROGRAM_TRACKS.at(-2)?.title).toBe('buena mota, mezcal y café');
    expect(SIN_CITY_PROGRAM_TRACKS.at(-1)?.title).toBe('ando bellaco baby');
    expect(SIN_CITY_PROGRAM_TRACKS.at(-1)?.finale).toBe(true);
  });

  it('renders Broadway-style program page with download and track notes', () => {
    const html = renderSinCityProgramPageHtml();
    expect(html).toContain('Sin City Night Program');
    expect(html).toContain('Download program (PDF)');
    expect(html).toContain('let\'s go holographic tonight');
    expect(html).toContain('Honesty boundary');
    expect(html).toContain('ando bellaco baby');
    expect(html).toContain(SIN_CITY_PROGRAM_ROUTE);
    expect(html).toContain('/front-desk-program');
  });

  it('is synced to interfaces and vercel route', () => {
    const page = read('interfaces/sin-city-night-program.html');
    expect(page).toContain('Sin City Night Program');
    expect(page).toContain('Download program (PDF)');
    expect(read('vercel.json')).toMatch(/"source":\s*"\/sin-city-program"/);
  });
});
