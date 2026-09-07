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

describe('Prime-Vault Race · guest door rollout', () => {
  it('ships door HTML, client, CSS, and special-projects alias', () => {
    expect(existsSync(join(ROOT, 'interfaces/prime-vault-race.html'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/prime-vault-race-client.js'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/prime-vault-race.css'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/special-projects/prime-vault-alphafold-race.html'))).toBe(true);
    expect(existsSync(join(ROOT, 'api/prime-vault-race.js'))).toBe(true);
    const html = read('interfaces/prime-vault-race.html');
    expect(html).toContain('prime-vault-race-client.js');
    expect(html).toContain('Scoreboard (this host)');
    expect(html).toContain('No live play controls');
    expect(html).not.toContain('Come aboard · race');
    expect(html).not.toContain('Race this tier');
    const client = read('interfaces/prime-vault-race-client.js');
    expect(client).not.toContain('Race this tier');
    expect(client).not.toContain('raceTier');
  });

  it('reuses Lattice / Let\'s Chat email allowlist', () => {
    const creator = DEFAULT_CREATOR_EMAILS[0];
    const access = checkLatticeEmailAccess(creator);
    expect(access.ok).toBe(true);
    expect(access.privilege).toBe('creator');
    const api = read('api/prime-vault-race.js');
    expect(api).toContain('checkLatticeEmailAccess');
    expect(api).toContain("sameSeatAs: ['lets-chat', 'lattice-chat']");
  });

  it('wires vercel routes, quicklink, player door, journey, and blogs', () => {
    const vercel = read('vercel.json');
    expect(vercel).toContain('"source": "/prime-vault-race"');
    expect(vercel).toContain('"source": "/special-projects/prime-vault-alphafold-race"');
    expect(vercel).toContain('"source": "/ship-blog/prime-vault-race-door"');
    expect(vercel).toContain('api/prime-vault-race.js');

    const ql = read('interfaces/site-quicklinks.js');
    expect(ql).toContain('href="/demonstrations#race"');
    expect(ql).toContain('id="ql-prime-vault-race-link"');

    expect(PLAYER_MORE_DOORS.some((d) => d.href === '/demonstrations#race')).toBe(true);
    expect(findJourney('prime-vault-race')?.cta?.href).toBe('/demonstrations#race');

    expect(existsSync(join(ROOT, 'interfaces/blog-prime-vault-race-door-2026-09.html'))).toBe(true);
    expect(read('lib/questfest-blog-posts.mjs')).toContain('prime-vault-race-door');
    expect(read('data/bulletin-board-posts.json')).toContain('/prime-vault-race');
  });
});
