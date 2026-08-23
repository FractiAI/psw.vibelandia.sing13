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
  it('defines four primary cruise doors with Journey first', () => {
    expect(PLAYER_PRIMARY_DOORS).toHaveLength(4);
    expect(PLAYER_PRIMARY_DOORS[0].id).toBe('journey');
    expect(PLAYER_PRIMARY_DOORS[0].href).toBe('/journey');
  });

  it('QUESTFEST home uses player spine not channel labyrinth', () => {
    const html = read('interfaces/vibelandia-questfest.html');
    expect(html).toContain('Your cruise line · four doors');
    expect(html).toContain('btn-player-lead');
    expect(html).toContain('player-more-aboard');
    expect(html).toContain('Journey · grand narrative');
    expect(html).not.toContain('id="ship-crew"');
    expect(html).not.toContain('class="o99-door"');
    expect(html).toMatch(/Six newest papers/);
    expect(html).toContain('id="ship-blog"');
    expect(renderPlayerChannelsHtml()).toContain('Journey');
  });

  it('site quicklinks lead with Journey not Concierge', () => {
    const js = read('interfaces/site-quicklinks.js');
    const navBlock = js.slice(js.indexOf('nav.innerHTML'), js.indexOf('nav.innerHTML') + 800);
    expect(navBlock).toContain('SS VIBELANDIA');
    expect(navBlock.indexOf('/journey')).toBeLessThan(navBlock.indexOf('/jukebox'));
    expect(navBlock).not.toContain('Concierge');
  });
});
