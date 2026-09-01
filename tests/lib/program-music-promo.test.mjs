import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const PROGRAMS = [
  {
    file: 'interfaces/concierto-el-gran-sol-program.html',
    playlist: 'pl-concierto-prelude',
    tracks: '12 tracks',
  },
  {
    file: 'interfaces/front-desk-check-in-program.html',
    playlist: 'pl-reception',
    tracks: '17 tracks',
  },
  {
    file: 'interfaces/sin-city-night-program.html',
    playlist: 'pl-sin-city',
    tracks: '7 tracks',
  },
  {
    file: 'interfaces/reading-room-concert-program.html',
    playlist: 'pl-reading-room',
    tracks: '12 tracks',
  },
];

describe('Concert program music promo', () => {
  for (const { file, playlist, tracks } of PROGRAMS) {
    it(`${file} offers jukebox playlist + PDF download promo`, () => {
      const html = read(file);
      expect(html).toContain('Liking the music?');
      expect(html).toContain(`playlist=${playlist}`);
      expect(html).toContain(tracks);
      expect(html).toContain('program-download');
      expect(html).toContain('Download program (PDF)');
    });
  }

  it('art landing drops Phase 2 reception and exhibit hero CTAs', () => {
    const html = read('interfaces/omniverse-canvas.html');
    expect(html).toContain('/concierto-program');
    expect(html).not.toContain('Phase 2 · Reception');
    expect(html).not.toContain('Explore the exhibit');
  });
});
