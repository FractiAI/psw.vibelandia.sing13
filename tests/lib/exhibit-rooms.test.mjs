import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { EXHIBIT_ROOMS } from '../../lib/exhibit-rooms.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Exhibit rooms · full pages from the Canvas', () => {
  it('defines five rooms with dedicated files and routes', () => {
    expect(EXHIBIT_ROOMS.map((r) => r.id)).toEqual([
      'core',
      'amphitheater',
      'horizon',
      'fiction',
      'step',
    ]);
    expect(EXHIBIT_ROOMS.map((r) => r.href)).toEqual([
      '/core',
      '/amphitheater',
      '/horizon',
      '/science-fiction',
      '/step-in',
    ]);
  });

  it('rewrites each room and keeps distinct full-page copy', () => {
    const vercel = read('vercel.json');
    const landing = read('interfaces/omniverse-canvas.html');
    expect(landing).toContain('href="/core"');
    expect(landing).toContain('href="/amphitheater"');
    expect(landing).toContain('href="/horizon"');
    expect(landing).toContain('href="/science-fiction"');
    expect(landing).toContain('href="/step-in"');
    expect(landing).not.toContain('id="mode-fiction"');
    expect(landing).not.toContain('data-pick="1"');
    expect(landing).not.toMatch(/<figcaption>\s*Still\s*·/);

    for (const room of EXHIBIT_ROOMS) {
      expect(vercel).toContain(`"source": "${room.href}"`);
      expect(vercel).toContain(`"destination": "/interfaces/${room.file}"`);
      expect(existsSync(join(ROOT, 'interfaces', room.file))).toBe(true);
      const html = read(`interfaces/${room.file}`);
      expect(html).toContain(room.title);
      expect(html).toContain('The full room');
      expect(html).toContain('Honesty rail');
      expect(html).not.toMatch(/netflix/i);
      expect(html).toContain(room.keyArt);
      expect(html).not.toMatch(/<figcaption>\s*Still\s*·/);
      for (const still of room.stills) {
        expect(still.cap).not.toMatch(/^Still\b/i);
        expect(html).toContain(still.cap);
      }
    }

    const horizon = read('interfaces/exhibit-horizon.html');
    expect(horizon).toContain('Internet cloud horizon');
    expect(horizon).toContain('Point-and-click Lattice Chat');
    expect(horizon).toContain('Wormhole by awareness');
    expect(horizon).toContain('Valet Pru · XY Reality Bridge/Router · Player 1');
    expect(horizon).not.toContain('Valet Pru · Human Bridge/Router');
    expect(horizon).toContain('Lattice Chat');

    const fiction = read('interfaces/exhibit-science-fiction.html');
    const step = read('interfaces/exhibit-step-in.html');
    expect(fiction).toContain('New-World fiction');
    expect(step).toContain('Treat the camp as walk-in');
    expect(fiction).not.toEqual(step);
  });
});
