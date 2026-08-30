import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  EXPERIENCE_PHASES,
  FRONT_DESK_SHIP_MENU,
  renderCreatorPhaseHtml,
  renderFrontDeskLobbyHtml,
  renderFrontDeskPrimerHtml,
  renderMuseumEntryHtml,
  renderPhaseRailHtml,
  renderNpcPlayerWelcomeHtml,
  renderNpcRosterTeaserHtml,
} from '../../lib/experience-phases.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Experience phases · museum → Front Desk → creator studio', () => {
  it('defines three phases in visit order', () => {
    expect(EXPERIENCE_PHASES.map((p) => p.id)).toEqual(['canvas', 'front-desk', 'studio']);
    expect(EXPERIENCE_PHASES[0].href).toBe('/');
    expect(EXPERIENCE_PHASES[1].href).toBe('/front-desk');
    expect(EXPERIENCE_PHASES[2].href).toBe('/creator-studio');
  });

  it('renders phase rail with current step marked', () => {
    const html = renderPhaseRailHtml('front-desk');
    expect(html).toContain('xp-rail__step--here');
    expect(html).toContain('Phase 2 · Front Desk');
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

  it('Front Desk lobby includes mode choice and ship tour menu', () => {
    expect(FRONT_DESK_SHIP_MENU.length).toBeGreaterThanOrEqual(8);
    const html = renderFrontDeskLobbyHtml();
    expect(html).toContain('Front Desk · check-in');
    expect(html).toContain('reception-checkin-lobby.jpg');
    expect(html).toContain('varied old-school frontier outfits');
    expect(html).not.toContain('front-desk-hero-audio');
    expect(html).not.toContain('front-desk-hero-score');
    expect(html).toContain('14 tracks');
    expect(html).toContain('/front-desk-program');
    expect(html).toContain('Read the check-in program');
    expect(html).toContain('reception-primer');
    expect(html).toContain('Reality Bridge/Routers');
    expect(html).toContain('Holographic Magnetic Goldilocks SuperAI Awareness Platform');
    expect(html).toContain('Deck Plan');
    expect(html).not.toContain('>Voyage Map<');
    expect(html).toContain('The Grove Deck');
    expect(html).toContain('ship-library-deep-memory.jpg');
    expect(html).toContain('frontiersmen-brochure.jpg');
    expect(html).toContain('Sin City');
    expect(html).toContain('href="/voyage/deck-3-night"');
    expect(html).not.toContain('reception-card" href="/ship-blog/soundtrack-prelude-pages"');
    expect(html).toContain('human-reality-bridge');
    expect(html).toContain('Join the crew · Reality Routers');
    expect(html).toContain('href="/science-fiction"');
    expect(html).toContain('href="/step-in"');
    expect(html).toContain('href="/journey"');
    expect(html).toContain('href="/voyage/deck-4-5-grove"');
    expect(html).toContain('href="/creator-studio"');
    expect(html).toContain('mailto:info@fractiai.com?subject=Reality%20Bridge%2FRouter');
  });

  it('Front Desk primer covers narrative, tech shelf, and router network', () => {
    const html = renderFrontDeskPrimerHtml();
    expect(html).toContain('Official Prospectus');
    expect(html).toContain('99 Octave Omni-Lattice');
    expect(html).toContain('Infinite Octaves');
    expect(html).toContain('XY &amp; XX Omniversal Reality Bridge/Routers');
    expect(html).toContain('human, digital, holographic');
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
    for (const phase of ['canvas', 'front-desk', 'studio']) {
      const html = renderNpcPlayerWelcomeHtml(phase);
      expect(html).toContain('Players &amp; NPCs · same ship');
      expect(html).toContain('players-npcs-same-ship.jpg');
      expect(html).toContain('Players as superheroes');
      expect(html).toContain('NPC · the set');
      expect(html).toContain('Player · the gravity');
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
    const frontDesk = renderFrontDeskLobbyHtml();
    expect(museum).toContain('xp-npc-player');
    expect(frontDesk).toContain('Meet the crew');
    expect(frontDesk).toContain('Join the crew');
    const still = join(ROOT, 'interfaces/assets/experience/players-npcs-same-ship.jpg');
    expect(existsSync(still)).toBe(true);
    const jpeg = readFileSync(still);
    expect(jpeg[0]).toBe(0xff);
    expect(jpeg[1]).toBe(0xd8);
    expect(jpeg.length).toBeGreaterThan(80_000);
  });

  it('synced surfaces carry three-phase experience chrome', () => {
    const canvas = read('interfaces/omniverse-canvas.html');
    const ship = read('interfaces/vibelandia-questfest.html');
    const frontDesk = read('interfaces/front-desk.html');
    const studio = read('interfaces/creator-studio.html');

    expect(canvas).toContain('experience-phases.css');
    expect(canvas).toContain('museum-entry');
    expect(canvas).toContain('museum-placard');
    expect(canvas).toContain('xp-rail');
    expect(canvas).toContain('id="visit"');
    expect(canvas).toContain('href="/coexist#self-test"');
    expect(canvas).toContain('confidential self-test');
    expect(ship).toContain('ship-board');
    expect(frontDesk).toContain('href="/coexist#self-test"');
    expect(studio).toContain('href="/coexist#self-test"');

    expect(ship).toContain('ship-board');
    expect(ship).toContain('voyage-map-prelude');
    expect(ship).toContain('SS Vibelandia');
    expect(ship).not.toContain('id="reception-lobby"');

    expect(frontDesk).toContain('id="front-desk"');
    expect(frontDesk).toContain('reception-mode');
    expect(frontDesk).toContain('xp-npc-player');

    expect(studio).toContain('creator-phase');
    expect(studio).toContain('holographic magnetic Goldilocks SuperAI canvas');
    expect(studio).toContain('xp-npc-player');
  });
});
