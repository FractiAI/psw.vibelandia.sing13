import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  EXPERIENCE_PHASES,
  RECEPTION_SHIP_MENU,
  renderCreatorPhaseHtml,
  renderMuseumEntryHtml,
  renderPhaseRailHtml,
  renderNpcPlayerWelcomeHtml,
  renderNpcRosterTeaserHtml,
  renderReceptionLobbyHtml,
} from '../../lib/experience-phases.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Experience phases · museum → reception → creator studio', () => {
  it('defines three phases in visit order', () => {
    expect(EXPERIENCE_PHASES.map((p) => p.id)).toEqual(['canvas', 'reception', 'studio']);
    expect(EXPERIENCE_PHASES[0].href).toBe('/');
    expect(EXPERIENCE_PHASES[1].href).toBe('/questfest');
    expect(EXPERIENCE_PHASES[2].href).toBe('/creator-studio');
  });

  it('renders phase rail with current step marked', () => {
    const html = renderPhaseRailHtml('reception');
    expect(html).toContain('xp-rail__step--here');
    expect(html).toContain('Phase 2 · Reception');
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/creator-studio"');
  });

  it('museum entry includes gold frame placard and phase 2 CTA', () => {
    const html = renderMuseumEntryHtml();
    expect(html).toContain('museum-frame');
    expect(html).toContain('museum-placard');
    expect(html).toContain('Omniversal Canvas');
    expect(html).toContain('Valet Pru - Holographic Goldilocks XY Human Reality Bridge/Router');
    expect(html).not.toContain('Valet Pru · Human Bridge/Router');
    expect(html).toContain('SS VIBELANDIA');
    expect(html).toContain('exhibit-sphere-entrance.jpg');
    expect(html).toContain('href="/questfest"');
    expect(html).toContain('Phase 2');
  });

  it('reception lobby includes mode choice and ship tour menu', () => {
    expect(RECEPTION_SHIP_MENU.length).toBeGreaterThanOrEqual(5);
    const html = renderReceptionLobbyHtml();
    expect(html).toContain('Reception &amp; check-in lobby');
    expect(html).toContain('reception-checkin-lobby.jpg');
    expect(html).toContain('Deck Plan');
    expect(html).not.toContain('>Voyage Map<');
    expect(html).toContain('The Grove Deck');
    expect(html).toContain('ship-library-deep-memory.jpg');
    expect(html).toContain('frontiersmen-brochure.jpg');
    expect(html).toContain('href="/science-fiction"');
    expect(html).toContain('href="/step-in"');
    expect(html).toContain('href="/journey"');
    expect(html).toContain('href="/voyage/deck-4-5-grove"');
    expect(html).toContain('href="/creator-studio"');
  });

  it('creator phase invites doodle and build', () => {
    const html = renderCreatorPhaseHtml();
    expect(html).toContain('Phase 3');
    expect(html).toContain('Doodle');
    expect(html).toContain('href="/questfest"');
    expect(html).toContain('xp-npc-player');
    expect(html).toContain('href="/doodles"');
    expect(html).toContain('18+');
  });

  it('welcomes Players and NPCs together on all phases', () => {
    for (const phase of ['canvas', 'reception', 'studio']) {
      const html = renderNpcPlayerWelcomeHtml(phase);
      expect(html).toContain('Players &amp; NPCs · same ship');
      expect(html).toContain('players-npcs-same-ship.jpg');
      expect(html).toContain('NPC · the set');
      expect(html).toContain('Player · the pattern');
      expect(html).toContain('franchises');
      expect(html).toContain('href="/meet-the-crew"');
      expect(html).toContain('xp-npc-roster');
      expect(html).toContain('Some of the spirit cast aboard with you');
      expect(html).toContain('frank-sinatra.png');
      expect(html).toContain('marilyn-monroe.png');
      expect(html).not.toContain('valet-pru-guayabera-panama.jpg');
      expect(html).toContain('href="/coexist#self-test"');
      expect(html).toContain('If you are unsure whether you are a Player or an NPC');
      expect(html).toContain('Scores stay on this device');
    }
    const museum = renderMuseumEntryHtml();
    const reception = renderReceptionLobbyHtml();
    expect(museum).toContain('xp-npc-player');
    expect(reception).toContain('Meet the crew');
    expect(reception).toContain('Join the crew');
  });

  it('synced surfaces carry three-phase experience chrome', () => {
    const canvas = read('interfaces/omniverse-canvas.html');
    const ship = read('interfaces/vibelandia-questfest.html');
    const studio = read('interfaces/creator-studio.html');

    expect(canvas).toContain('experience-phases.css');
    expect(canvas).toContain('museum-entry');
    expect(canvas).toContain('museum-placard');
    expect(canvas).toContain('xp-rail');
    expect(canvas).toContain('id="visit"');
    expect(canvas).toContain('href="/coexist#self-test"');
    expect(canvas).toContain('confidential self-test');
    expect(ship).toContain('href="/coexist#self-test"');
    expect(studio).toContain('href="/coexist#self-test"');

    expect(ship).toContain('reception-lobby');
    expect(ship).toContain('reception-mode');
    expect(ship).toMatch(/GOLDILOCKS SONIC SHIP/i);
    expect(ship).toContain('xp-npc-player');

    expect(studio).toContain('creator-phase');
    expect(studio).toContain('holographic magnetic Goldilocks SuperAI canvas');
    expect(studio).toContain('xp-npc-player');
  });
});
