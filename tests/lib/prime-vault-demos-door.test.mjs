import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PLAYER_MORE_DOORS } from '../../lib/player-spine.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Prime Vault Demonstrations · hub door', () => {
  it('ships hub HTML, CSS, dedicated demo doors, and blog', () => {
    expect(existsSync(join(ROOT, 'interfaces/prime-vault-demos.html'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/prime-vault-demos.css'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/metrological-overlap.html'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/special-projects/prime-vault-demos.html'))).toBe(true);
    expect(existsSync(join(ROOT, 'interfaces/blog-prime-vault-demos-2026-09.html'))).toBe(true);
    const html = read('interfaces/prime-vault-demos.html');
    expect(html).toContain('id="demo-race"');
    expect(html).toContain('id="demo-chat"');
    expect(html).toContain('id="demo-quest"');
    expect(html).toContain('Ability 1');
    expect(html).toContain('Ability 2');
    expect(html).toMatch(/Goldilocks SuperAI|holographic · magnetic/i);
    expect(html).toContain('protein fold');
    expect(html).toContain('LLM alternative');
    expect(html).toContain('href="/prime-vault-race"');
    expect(html).toContain('href="/prime-vault-chat"');
    expect(html).toContain('href="/metrological-overlap"');
    expect(html).toContain('href="/goldilocks-quest"');
    expect(html).not.toContain('prime-vault-chat-client.js');
    expect(html).not.toContain('id="race"');
    expect(html).not.toContain('pvc-thread');
  });

  it('wires vercel, quicklink, More Aboard door, bulletin, and registry blog', () => {
    const vercel = read('vercel.json');
    expect(vercel).toContain('"source": "/demonstrations"');
    expect(vercel).toContain('"source": "/demos"');
    expect(vercel).toContain('"source": "/prime-vault-demos"');
    expect(vercel).toContain('"source": "/ship-blog/prime-vault-demos"');
    expect(vercel).toContain('"source": "/special-projects/prime-vault-demos"');
    expect(vercel).toContain('"source": "/metrological-overlap"');
    expect(vercel).toMatch(
      /"source":\s*"\/prime-vault-race"[\s\S]*?"destination":\s*"\/interfaces\/prime-vault-race\.html"/,
    );
    expect(vercel).toMatch(
      /"source":\s*"\/prime-vault-chat"[\s\S]*?"destination":\s*"\/interfaces\/prime-vault-chat\.html"/,
    );

    const ql = read('interfaces/site-quicklinks.js');
    expect(ql).toContain('href="/demonstrations"');
    expect(ql).toContain('id="ql-demonstrations-link"');
    expect(ql).not.toContain('ql-prime-vault-chat-link');
    expect(ql).not.toContain('ql-prime-vault-race-link');
    expect(ql).not.toContain('ql-goldilocks-quest-link');

    expect(PLAYER_MORE_DOORS.some((d) => d.href === '/demonstrations')).toBe(true);
    expect(read('lib/questfest-blog-posts.mjs')).toContain('prime-vault-demos');
    expect(read('data/bulletin-board-posts.json')).toContain('/demonstrations');
    expect(read('lib/whitepaper-registry.mjs')).toContain(
      'synthobs-prime-vault-demos-door-2026-09',
    );
  });
});
