import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkLatticeEmailAccess, DEFAULT_CREATOR_EMAILS } from '../../lib/lattice-access.mjs';
import { PLAYER_MORE_DOORS } from '../../lib/player-spine.mjs';
import { findJourney } from '../../lib/voyage-journeys.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Goldilocks Quest · guest door rollout', () => {
  it('ships door HTML, client, CSS, API, and special-projects alias', () => {
    expect(existsSync(join(ROOT, 'interfaces/goldilocks-quest.html'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/goldilocks-quest-client.js'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/goldilocks-quest.css'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/special-projects/goldilocks-quest.html'))).toBe(true);
    expect(existsSync(join(ROOT, 'api/goldilocks-quest.js'))).toBe(true);
    const html = read('interfaces/goldilocks-quest.html');
    expect(html).toContain('goldilocks-quest-client.js');
    expect(html).toContain('gq-gate-form');
    expect(html).toContain('id="gq-canvas"');
  });

  it('reuses Lattice / Let\'s Chat email allowlist', () => {
    const creator = DEFAULT_CREATOR_EMAILS[0];
    const access = checkLatticeEmailAccess(creator);
    expect(access.ok).toBe(true);
    const api = read('api/goldilocks-quest.js');
    expect(api).toContain('checkLatticeEmailAccess');
    expect(api).toContain('sameSeatAs');
  });

  it('wires vercel routes, quicklink, player door, journey, and blogs', () => {
    const vercel = read('vercel.json');
    expect(vercel).toContain('"source": "/goldilocks-quest"');
    expect(vercel).toContain('"source": "/quest"');
    expect(vercel).toContain('"source": "/special-projects/goldilocks-quest"');
    expect(vercel).toContain('"source": "/ship-blog/goldilocks-quest"');
    expect(vercel).toContain('api/goldilocks-quest.js');

    const ql = read('interfaces/site-quicklinks.js');
    expect(ql).toContain('href="/goldilocks-quest"');
    expect(ql).toContain('id="ql-goldilocks-quest-link"');

    expect(PLAYER_MORE_DOORS.some((d) => d.href === '/goldilocks-quest')).toBe(true);
    expect(findJourney('goldilocks-quest')?.cta?.href).toBe('/goldilocks-quest');

    expect(existsSync(join(ROOT, 'interfaces/blog-goldilocks-quest-2026-09.html'))).toBe(true);
    expect(read('lib/questfest-blog-posts.mjs')).toContain('goldilocks-quest');
    expect(read('data/bulletin-board-posts.json')).toContain('/goldilocks-quest');
  });
});
