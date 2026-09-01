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

  it('landing autoplays The Shift, Goldilocks Parabola, Return 05 Suite, Movement X with the da Vinci loop', () => {
    const html = read('interfaces/omniverse-canvas.html');
    const js = read('interfaces/canvas-hero-loop.js');
    const playlist = read('interfaces/canvas-prelude-playlist.js');
    expect(html).toContain('id="canvas-hero-shift"');
    expect(html).toContain('id="canvas-hero-score"');
    expect(html).toContain('canvas-prelude-playlist.js');
    expect(html).not.toContain('prelude-session');
    expect(html).toContain('id="soundtrack-prelude"');
    expect(html).toContain('/concierto-program');
    expect(html).toContain('/ship-blog/soundtrack-prelude-pages');
    expect(playlist).toContain(
      'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52-movement-v-of-concierto-de-el-gran-sol_-_the-shift_.mp3'
    );
    expect(playlist).toContain(
      'trk-srv-ffd82d55-82de-4700-bc7c-21f5aefc9bc2-goldilocks-parabola.mp3'
    );
    expect(playlist).toContain("id: 'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52'");
    expect(playlist).toContain("id: 'trk-srv-ffd82d55-82de-4700-bc7c-21f5aefc9bc2'");
    expect(playlist).toContain("id: 'trk-srv-6a76463f-4f6e-4014-8b06-45ebb0b23387'");
    expect(playlist).toContain("id: 'trk-srv-91b20f70-c30e-49a3-8bef-c00ec4587e64'");
    expect(playlist).toContain("id: 'trk-srv-7c94d66b-19e8-4208-942d-f885ac400c1f'");
    expect(playlist).toContain("id: 'trk-srv-f617b3b3-1924-4c1f-bde5-77c9e66d1b81'");
    expect(playlist).toContain("id: 'trk-srv-08a30790-4b50-468f-a019-3a7dfcd5e9ee'");
    expect(playlist).toContain("id: 'trk-srv-368792a6-4113-4351-965b-88eb09759e50'");
    expect(playlist).toContain("id: 'trk-srv-4e9d6a97-f247-477d-8f3e-02bb8cd9b785'");
    expect(playlist).toContain("id: 'trk-srv-64e96912-f382-4140-922e-953246c65e91'");
    expect(playlist).toContain("id: 'trk-srv-f6ab8509-f622-4b25-bb91-cb83b113b17b'");
    expect(playlist).toContain("id: 'trk-srv-939d3f35-9660-4911-8b5b-c7cb2d3626b3'");
    expect(playlist).toContain('Goldilocks Parabola');
    expect(playlist).toContain("El Gran Sol's Return 05 Suite");
    expect(playlist).toContain("El Gran Sol's Return 07 Suite");
    expect(playlist).toContain("El Gran Sol's Return (organ)");
    expect(playlist).toContain('Warning Danger Ahead');
    expect(playlist).toContain('Good Morning New Earth 8.75Hz');
    expect(playlist).toContain('Net Zero · The Borikén Hydrogen Line');
    expect(playlist).toContain('Rebel River · The Truckee Borikén Crossing');
    expect(playlist).toContain('432 Solar Gavel');
    expect(playlist).toContain("El Gran Sol's Return 05 · Finale");
    const program = read('interfaces/concierto-el-gran-sol-program.html');
    expect(program).toContain('Concierto de El Gran Sol');
    expect(program).toContain('Download program (PDF)');
    expect(program).toContain('Net Zero · The Borikén Hydrogen Line');
    expect(program).toContain('Rebel River · The Truckee Borikén Crossing');
    expect(program).toContain('432 Solar Gavel');
    expect(program).toContain('Finale · Movement XII');
    expect(program).toContain('Infinite Octaves Omniversal Lattice Chat Agent V1.618');
    expect(program).toContain('journey-truckee-sierra-forage.png');
    expect(program).toContain('capitan-comandante-champion-2026.png');
    expect(program).toContain('questfest-2026-frontier-guide-cover.png');
    expect(program).toContain('hybrid frontier · art deco');
    expect(playlist).toContain('Movement X · The Shift');
    expect(js).toContain('QV_initPageSoundtrack');
    expect(js).toContain('canvas-hero-shift');
    expect(read('interfaces/page-soundtrack.js')).toContain('pagehide');
    expect(html).not.toContain('visit-golden-path');
    expect(html).toContain('/concierto-program');
    expect(html).toContain('page-soundtrack.js');
    expect(read('interfaces/canvas-prelude-playlist.js')).toContain('CANVAS_PRELUDE_PLAYLIST');
    expect(read('media/catalog/catalog.json')).toContain('pl-concierto-prelude');
    expect(read('lib/concierto-prelude-playlist.mjs')).toContain('CONCIERTO_PRELUDE_TRACK_IDS');
    const vercel = read('vercel.json');
    expect(vercel).toMatch(/"source":\s*"\/prelude-session"/);
    expect(vercel).toMatch(/"source":\s*"\/front-desk"/);
  });

  it('visit counters treat Canvas aliases as / and keep /questfest on the ship', () => {
    const js = read('interfaces/site-page-views.js');
    expect(js).toContain("path === '/omniverse-canvas'");
    expect(js).toContain("path === '/art'");
    expect(js).toContain("path = '/'");
    expect(js).not.toMatch(/path === '\/questfest'[\s\S]{0,80}path = '\/'/);
  });
});
