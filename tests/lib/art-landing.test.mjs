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
    expect(html).toContain('An open camp you can visit from your phone');
    expect(html).not.toContain('Valet Pru · Omniversal Canvas');
    expect(html).not.toContain('Skip to exhibit');
    expect(html).not.toContain('qv-top-quicklinks__here">Canvas');
    const navStart = html.indexOf('class="qv-top-quicklinks"');
    const navEnd = html.indexOf('</nav>', navStart);
    const topNav = html.slice(navStart, navEnd);
    expect(navStart).toBeGreaterThan(-1);
    expect(topNav).not.toMatch(/Canvas/i);
    expect(topNav).toContain('SS Vibelandia');
    expect(topNav).toContain('href="/doodles">Doodles</a>');
    expect(html).toContain('Host a walk-in interactive show');
    expect(html).toContain('Install a lasting room');
    expect(html).toContain('For the new SuperAI Frontiersman');
    expect(html).toContain('Holographic Convergence Core');
    expect(html).toContain('Valet Pru - Holographic Goldilocks XY Human Reality Bridge/Router');
    expect(html).not.toContain('Valet Pru · Human Bridge/Router');
    expect(html).toContain('href="/core"');
    expect(html).toContain('core-player');
    expect(html).toContain('>Player</figcaption>');
    expect(html).toContain('For those of you who know me from my night job');
    expect(html).toContain('href="/doodles">doodling</a>');
    expect(html).toContain('technology, music, AI, my doodles, and my stories');
    expect(html).toContain('Who this art is for');
    expect(html).toContain('Y Chromosome SuperAI Frontiersmen');
    expect(html).toContain('otherwise known as');
    expect(html).toContain('Machote Modernos');
    expect(html).toContain('science, music, AI, doodles, and story');
    expect(html).not.toContain('science, AI, doodles, and story together');
    expect(html).not.toContain('Polar lineage');
    expect(html).not.toContain('Not a membership test');
    expect(html).toContain('Your visit · three phases · Players &amp; NPCs welcome');
    expect(html).toContain('href="/coexist#self-test"');
    expect(html).toContain('confidential self-test');
    expect(html).toContain('→ ∞^∞');
    expect(html).not.toContain('→ ∞¹³');
    expect(html).not.toContain('Hello and welcome. This is Valet Pru.');
    expect(html).not.toContain('url=/interfaces/vibelandia-questfest.html');
    expect(html).not.toContain("location.replace('/interfaces/vibelandia-questfest.html')");
    expect(html).toContain('href="/core"');
    expect(html).toContain('href="/amphitheater"');
    expect(html).toContain('href="/horizon"');
    expect(html).toContain('href="/science-fiction"');
    expect(html).toContain('href="/step-in"');
    expect(html).toContain('data-youtube-id="0hicJ_AZups"');
    expect(html).toContain('canvas-hero-loop.js');
    expect(html).toContain('class="hero__video"');
    expect(html).not.toContain('The nest you are standing in');
    expect(html).not.toContain('id="nest-h"');
    expect(html).not.toContain('Layer · Address');
  });

  it('hero loop script embeds the YouTube id with mute + loop playlist', () => {
    const js = read('interfaces/canvas-hero-loop.js');
    expect(js).toContain("YOUTUBE_ID = '0hicJ_AZups'");
    expect(js).toContain('autoplay=1');
    expect(js).toContain('mute=1');
    expect(js).toContain('loop=1');
    expect(js).toContain("playlist=' + YOUTUBE_ID");
    expect(js).toContain('prefers-reduced-motion');
  });

  it('landing autoplays The Shift, Goldilocks Parabola, then Return 05 Suite with the da Vinci loop', () => {
    const html = read('interfaces/omniverse-canvas.html');
    const js = read('interfaces/canvas-hero-loop.js');
    expect(html).toContain('id="canvas-hero-shift"');
    expect(html).toContain('id="canvas-hero-score"');
    expect(html).toContain(
      'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52-movement-v-of-concierto-de-el-gran-sol_-_the-shift_.mp3'
    );
    expect(html).toContain(
      'trk-srv-ffd82d55-82de-4700-bc7c-21f5aefc9bc2-goldilocks-parabola.mp3'
    );
    expect(js).toContain("id: 'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52'");
    expect(js).toContain("id: 'trk-srv-ffd82d55-82de-4700-bc7c-21f5aefc9bc2'");
    expect(js).toContain("id: 'trk-srv-6a76463f-4f6e-4014-8b06-45ebb0b23387'");
    expect(js).toContain('Goldilocks Parabola');
    expect(js).toContain("El Gran Sol's Return 05 Suite");
    expect(js).toContain('bootSoundtrack');
    expect(js).toContain('audio.play');
    expect(js).toContain('unlockOnGesture');
    expect(js).toContain("addEventListener('ended', advance)");
    expect(js).toContain('/api/catalog-plays');
  });

  it('visit counters treat Canvas aliases as / and keep /questfest on the ship', () => {
    const js = read('interfaces/site-page-views.js');
    expect(js).toContain("path === '/omniverse-canvas'");
    expect(js).toContain("path === '/art'");
    expect(js).toContain("path = '/'");
    expect(js).not.toMatch(/path === '\/questfest'[\s\S]{0,80}path = '\/'/);
  });
});
