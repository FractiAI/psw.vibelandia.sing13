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
  it('defines four primary doors with Lattice first', () => {
    expect(PLAYER_PRIMARY_DOORS).toHaveLength(4);
    expect(PLAYER_PRIMARY_DOORS[0].id).toBe('lattice');
    expect(PLAYER_PRIMARY_DOORS[0].href).toBe('/lattice-chat/');
  });

  it('QUESTFEST home uses player spine not channel labyrinth', () => {
    const html = read('interfaces/vibelandia-questfest.html');
    expect(html).toContain('Your four doors');
    expect(html).toContain('btn-player-lead');
    expect(html).toContain('player-more-aboard');
    expect(html).toContain('Decks · cabins · crests');
    expect(html).not.toContain('id="ship-crew"');
    expect(html).not.toContain('class="o99-door"');
    expect(html).toMatch(/Three notes worth your Player time/);
    expect(renderPlayerChannelsHtml()).toContain('Lattice Chat');
  });

  it('site quicklinks lead with Lattice not Concierge', () => {
    const js = read('interfaces/site-quicklinks.js');
    const navBlock = js.slice(js.indexOf('nav.innerHTML'), js.indexOf('nav.innerHTML') + 800);
    expect(navBlock).toContain('/lattice-chat/');
    expect(navBlock.indexOf('/lattice-chat/')).toBeLessThan(navBlock.indexOf('/listen'));
    expect(navBlock).not.toContain('Concierge');
  });
});
