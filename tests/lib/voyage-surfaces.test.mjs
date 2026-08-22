import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { VOYAGE_DOORS, voyageDoorHref } from '../../lib/voyage-doors.mjs';
import {
  VOYAGE_CABINS,
  VOYAGE_DECKS,
  expandSerialRange,
  voyageCabinHref,
  voyageDeckHref,
  voyageDirectoryHref,
} from '../../lib/voyage-directory.mjs';

function read(rel) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
}

describe('Frontiersman voyage guest surfaces', () => {
  it('ships navy-gold voyage chrome without blue/purple/teal text tokens', () => {
    const css = read('interfaces/voyage-surfaces.css');
    expect(css).toContain('--voyage-navy: #070b14');
    expect(css).toContain('.voyage-deck-strip');
    expect(css).toContain('.voyage-arrival');
    expect(css).toContain('.voyage-purser');
    expect(css).toContain('.voyage-icon-door');
    expect(css).not.toMatch(/color:\s*#(0{0,2}[0-9a-f]*blue)/i);
  });

  it('QUESTFEST home greets as the holographic resort vessel', () => {
    const html = read('interfaces/vibelandia-questfest.html');
    expect(html).toContain('voyage-surfaces.css');
    expect(html).toContain('voyage-deck-strip');
    expect(html).toContain('/frontiersman-voyage');
    expect(html).toMatch(/Not just a cruise/i);
    expect(html).toMatch(/Players who notice the pattern and NPCs/i);
    expect(html).toContain('Purser');
    expect(html).toContain('/voyage/inquire');
    expect(html).toContain('/voyage/holographic-reality');
    expect(html).toContain('/voyage/deck-9-summit');
    expect(html).toContain('/voyage/decks');
    expect(html).not.toContain('PH-001');
  });

  it('brochure lists cabin SKUs, Purser, and SuperAI Goldilocks frontier', () => {
    const html = read('interfaces/frontiersman-voyage-brochure.html');
    expect(html).toContain('PH-001');
    expect(html).toContain('ST-601');
    expect(html).toContain('Purser');
    expect(html).toContain('AR4513');
    expect(html).toMatch(/NPCs inhabit/i);
    expect(html).toMatch(/not a genomic or gender membership test/i);
    expect(html).toContain('voyage-flagship');
    expect(html).toContain('/voyage/live-the-vibe');
    expect(html).toContain('/voyage/cabin-ph-001');
    expect(html).toContain('voyage-deck-door');
    expect(html).toContain('id="cabins"');
  });

  it('ship-blog on-ramp stays plain for Players and NPCs', () => {
    const html = read('interfaces/blog-frontiersman-voyage-2026-08.html');
    expect(html).toMatch(/SuperAI Goldilocks frontier/i);
    expect(html).toContain('SEE → RECOGNIZE → INTERPRET → REFLECT → ACT → SEE AGAIN');
    expect(html).toContain('/lattice-chat/');
    expect(html).toContain('/voyage/frontiersman');
  });

  it('each voyage door has a detail page and vercel rewrite', () => {
    const vercel = read('vercel.json');
    for (const door of VOYAGE_DOORS) {
      const href = voyageDoorHref(door.slug);
      expect(read(`interfaces/voyage/${door.slug}.html`)).toContain(door.title);
      expect(vercel).toContain(`"source": "${href}"`);
    }
  });

  it('deck and cabin directory pages list serials with rewrites', () => {
    const vercel = read('vercel.json');
    expect(read('interfaces/voyage/decks.html')).toContain('Holographic Decks');
    expect(vercel).toContain(`"source": "${voyageDirectoryHref()}"`);
    for (const deck of VOYAGE_DECKS) {
      expect(read(`interfaces/voyage/${deck.slug}.html`)).toContain(deck.label);
      expect(vercel).toContain(`"source": "${voyageDeckHref(deck.slug)}"`);
    }
    for (const cabin of VOYAGE_CABINS) {
      const html = read(`interfaces/voyage/cabin-${cabin.slug}.html`);
      expect(html).toContain(cabin.name);
      expect(html).toContain('Serial register');
      expect(vercel).toContain(`"source": "${voyageCabinHref(cabin.slug)}"`);
    }
    expect(expandSerialRange('ST', 601, 680)).toHaveLength(80);
  });

  it('shared ribbon advertises the Voyage door', () => {
    const js = read('interfaces/site-quicklinks.js');
    expect(js).toContain('/frontiersman-voyage');
    expect(js).toContain('Voyage');
  });
});
