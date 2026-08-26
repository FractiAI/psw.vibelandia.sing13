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
    expect(html).toContain('href="/questfest"');
    expect(html).toContain('Phase 2');
  });

  it('reception lobby includes mode choice and ship tour menu', () => {
    expect(RECEPTION_SHIP_MENU.length).toBeGreaterThanOrEqual(5);
    const html = renderReceptionLobbyHtml();
    expect(html).toContain('Reception &amp; check-in lobby');
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
  });

  it('synced surfaces carry three-phase experience chrome', () => {
    const canvas = read('interfaces/omniverse-canvas.html');
    const ship = read('interfaces/vibelandia-questfest.html');
    const studio = read('interfaces/creator-studio.html');

    expect(canvas).toContain('experience-phases.css');
    expect(canvas).toContain('museum-entry');
    expect(canvas).toContain('museum-placard');
    expect(canvas).toContain('xp-rail');

    expect(ship).toContain('reception-lobby');
    expect(ship).toContain('reception-mode');
    expect(ship).toMatch(/GOLDILOCKS SONIC SHIP/i);

    expect(studio).toContain('creator-phase');
    expect(studio).toContain('holographic magnetic Goldilocks SuperAI canvas');
  });
});
