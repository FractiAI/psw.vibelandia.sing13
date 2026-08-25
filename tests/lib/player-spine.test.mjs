import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  PLAYER_PRIMARY_DOORS,
  renderPlayerChannelsHtml,
} from '../../lib/player-spine.mjs';

function read(rel) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
}

describe('Player spine · holographic Player home', () => {
  it('defines five primary cruise doors with Journey first and Canvas next', () => {
    expect(PLAYER_PRIMARY_DOORS).toHaveLength(5);
    expect(PLAYER_PRIMARY_DOORS[0].id).toBe('journey');
    expect(PLAYER_PRIMARY_DOORS[0].href).toBe('/journey');
    expect(PLAYER_PRIMARY_DOORS[1].id).toBe('canvas');
    expect(PLAYER_PRIMARY_DOORS[1].href).toBe('/');
  });

  it('QUESTFEST home uses player spine not channel labyrinth', () => {
    const html = read('interfaces/vibelandia-questfest.html');
    expect(html).toContain('Your cruise line · five doors');
    expect(html).toContain('btn-player-lead');
    expect(html).toContain('player-more-aboard');
    expect(html).toContain('Journey · grand narrative');
    expect(html).toContain('href="/"');
    expect(html).not.toContain('id="ship-crew"');
    expect(html).not.toContain('class="o99-door"');
    expect(html).toMatch(/Three notes worth your Player time|Six newest papers/);
    expect(html).toContain('id="ship-blog"');
    expect(renderPlayerChannelsHtml()).toContain('Journey');
    expect(renderPlayerChannelsHtml()).toContain('Canvas');
  });

  it('site quicklinks board the ship at /questfest and keep Canvas at /', () => {
    const js = read('interfaces/site-quicklinks.js');
    expect(js).toContain('SS VIBELANDIA');
    expect(js).toContain("href=\"/questfest\">SS Vibelandia</a>");
    expect(js).toContain("href=\"/questfest\"");
    expect(js).toContain("href=\"/\"");
    expect(js.indexOf('href="/journey"')).toBeGreaterThan(-1);
    expect(js.indexOf('href="/jukebox"')).toBeGreaterThan(js.indexOf('href="/journey"'));
  });

  it('keeps the art exhibit as landing; night-job is the welcome; SS Vibelandia is a menu', () => {
    const canvas = read('interfaces/omniverse-canvas.html');
    const ship = read('interfaces/vibelandia-questfest.html');
    const titleAt = canvas.indexOf('Holographic Goldilocks SuperAI Basecamp');
    const welcomeAt = canvas.indexOf('id="welcome"');
    const whoAt = canvas.indexOf('id="who"');
    const stageAt = canvas.indexOf('id="stage-h"');
    expect(canvas).toContain('Holographic Goldilocks SuperAI Basecamp');
    expect(canvas).toContain('Valet Pru’s Holographic, Digital Art Project');
    expect(canvas).toContain('Think Burning Man minus the fees and minus corporate and minus the costs');
    expect(canvas).toContain('Holographic Convergence Core');
    expect(canvas).toContain('Who you call you');
    expect(canvas).toContain('>Player</figcaption>');
    expect(canvas).not.toContain('Hello and welcome. This is Valet Pru.');
    expect(canvas).toContain('For those of you who know me from my night job');
    expect(canvas).toContain('href="/questfest">SS Vibelandia</a>');
    expect(canvas).toContain('Who this art is for');
    expect(canvas).toContain('Y chromosome SuperAI Frontiersmen');
    expect(canvas).toContain('id="who"');
    expect(titleAt).toBeGreaterThan(-1);
    expect(welcomeAt).toBeGreaterThan(titleAt);
    expect(whoAt).toBeGreaterThan(welcomeAt);
    expect(stageAt).toBeGreaterThan(whoAt);
    expect(ship).not.toContain('For those of you who know me from my night job');
    expect(ship).toContain('Know me from the club?');
    expect(ship).toContain('href="/"');
  });
});
