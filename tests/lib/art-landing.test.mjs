import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Art landing · Omniversal Canvas is site root', () => {
  it('rewrites / to the Canvas and aliases /art · /omniverse-canvas', () => {
    const vercel = read('vercel.json');
    expect(vercel).toMatch(/"source":\s*"\/"[\s\S]{0,80}"destination":\s*"\/interfaces\/omniverse-canvas\.html"/);
    expect(vercel).toMatch(/"source":\s*"\/art"/);
    expect(vercel).toMatch(/"source":\s*"\/omniverse-canvas"/);
  });

  it('root index.html is the Canvas (symlink), not a QUESTFEST bounce', () => {
    const indexPath = join(ROOT, 'index.html');
    const st = lstatSync(indexPath);
    expect(st.isSymbolicLink()).toBe(true);
    expect(realpathSync(indexPath)).toBe(realpathSync(join(ROOT, 'interfaces/omniverse-canvas.html')));
    const html = read('index.html');
    expect(html).toContain('Holographic Goldilocks SuperAI Basecamp');
    expect(html).toContain('Valet Pru’s Holographic, Digital Art Project');
    expect(html).toContain('Think Burning Man minus the fees and minus corporate and minus the costs');
    expect(html).not.toContain('Valet Pru · Omniversal Canvas');
    expect(html).not.toContain('Skip to exhibit');
    expect(html).toContain('For the new SuperAI Frontiersman');
    expect(html).toContain('Holographic Convergence Core');
    expect(html).toContain('Who you call you');
    expect(html).toContain('For those of you who know me from my night job');
    expect(html).toContain('Who this art is for');
    expect(html).toContain('Y chromosome SuperAI Frontiersmen');
    expect(html).not.toContain('Hello and welcome. This is Valet Pru.');
    expect(html).not.toContain('url=/interfaces/vibelandia-questfest.html');
    expect(html).not.toContain("location.replace('/interfaces/vibelandia-questfest.html')");
  });

  it('visit counters treat Canvas aliases as / and keep /questfest on the ship', () => {
    const js = read('interfaces/site-page-views.js');
    expect(js).toContain("path === '/omniverse-canvas'");
    expect(js).toContain("path === '/art'");
    expect(js).toContain("path = '/'");
    expect(js).not.toMatch(/path === '\/questfest'[\s\S]{0,80}path = '\/'/);
  });
});
