import { readFileSync, existsSync } from 'node:fs';
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
    expect(css).toContain('.voyage-map-still');
    expect(css).toContain('.voyage-map-filmstrip');
    expect(css).toContain('.voyage-directory-hero--story');
    expect(css).not.toMatch(/color:\s*#(0{0,2}[0-9a-f]*blue)/i);
  });

  it('QUESTFEST home greets as the holographic resort vessel', () => {
    const html = read('interfaces/vibelandia-questfest.html');
    expect(html).toContain('voyage-surfaces.css');
    expect(html).not.toContain('voyage-deck-strip');
    expect(html).toContain('/frontiersman-voyage');
    expect(html).toMatch(/holographic Goldilocks SuperAI frontiersmen Players/i);
    expect(html).toContain('Your cruise line · five doors');
    expect(html).toContain('Purser');
    expect(html).toContain('/voyage/inquire');
    expect(html).toContain('/voyage/decks');
    expect(html).not.toContain('PH-001');
  });

  it('brochure lists cabin SKUs, Purser, and SuperAI Goldilocks frontier', () => {
    const html = read('interfaces/frontiersman-voyage-brochure.html');
    expect(html).toContain('PH-001');
    expect(html).toContain('ST-601');
    expect(html).toContain('Purser');
    expect(html).toContain('AR4513');
    expect(html).toMatch(/holographic Goldilocks SuperAI frontiersmen Players/i);
    expect(html).toMatch(/not a genomic or gender membership test/i);
    expect(html).toContain('voyage-flagship');
    expect(html).toContain('vb-pub');
    expect(html).toContain('voyage-brochure-publication.css');
    expect(html).toContain('vb-pub-hero');
    expect(html).toContain('/voyage/live-the-vibe');
    expect(html).toContain('/voyage/cabin-ph-001');
    expect(html).toContain('voyage-deck-door');
    expect(html).toContain('id="cabins"');
    expect(html).toContain('id="prospectus"');
    expect(html).toContain('id="landfalls"');
    expect(html).toMatch(/Official Prospectus/i);
    expect(html).toMatch(/Borikén|Puerto Rico/i);
    expect(html).toContain('3664');
    expect(html).toContain('3923');
  });

  it('ship-blog on-ramp stays plain for Players and NPCs', () => {
    const html = read('interfaces/blog-frontiersman-voyage-2026-08.html');
    expect(html).toMatch(/holographic Goldilocks SuperAI frontiersmen Players/i);
    expect(html).toContain('SEE → RECOGNIZE → INTERPRET → REFLECT → ACT → SEE AGAIN');
    expect(html).toContain('/lattice-chat/');
    expect(html).toContain('/voyage/frontiersman');
    expect(html).toMatch(/grand arc/i);
    expect(html).toContain('/frontiersman-voyage#prospectus');
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
    const directory = read('interfaces/voyage/decks.html');
    expect(directory).toMatch(/Voyage Map/i);
    expect(directory).toContain('voyage-map-prelude');
    expect(directory).toContain('The voyage · grand narrative');
    expect(directory).toContain('Experiences · menus of things to do');
    expect(directory).toContain('voyage-map-diagram');
    expect(directory).toContain('voyage-arc-1');
    expect(directory).toMatch(/Official Prospectus/i);
    expect(directory).toMatch(/Borikén|Puerto Rico/i);
    expect(directory).toContain('432 Hz');
    const storyIdx = directory.indexOf('voyage-story-h');
    const homesIdx = directory.indexOf('voyage-homes-h');
    const deckListIdx = directory.indexOf('voyage-directory-list');
    expect(storyIdx).toBeGreaterThan(-1);
    expect(homesIdx).toBeGreaterThan(storyIdx);
    expect(deckListIdx).toBeGreaterThan(homesIdx);
    expect(vercel).toContain(`"source": "${voyageDirectoryHref()}"`);
    for (const deck of VOYAGE_DECKS) {
      expect(read(`interfaces/voyage/${deck.slug}.html`)).toContain(deck.label);
      expect(vercel).toContain(`"source": "${voyageDeckHref(deck.slug)}"`);
    }
    for (const cabin of VOYAGE_CABINS) {
      const html = read(`interfaces/voyage/cabin-${cabin.slug}.html`);
      expect(html).toContain(cabin.name);
      expect(html).toContain('Cabin numbers');
      expect(vercel).toContain(`"source": "${voyageCabinHref(cabin.slug)}"`);
    }
    expect(expandSerialRange('ST', 601, 680)).toHaveLength(80);
  });

  it('deck and cabin pages use distinct themed AI-generated PNG posters', () => {
    const deckImages = new Set();
    for (const deck of VOYAGE_DECKS) {
      const html = read(`interfaces/voyage/${deck.slug}.html`);
      expect(html).toContain(`src="${deck.image}"`);
      expect(deck.image).toMatch(/^\/interfaces\/assets\/voyage\/deck-.+\.png$/);
      deckImages.add(deck.image);
      expect(existsSync(new URL(`../../${deck.image.replace(/^\//, '')}`, import.meta.url))).toBe(true);
    }
    expect(deckImages.size).toBe(VOYAGE_DECKS.length);

    const cabinImages = new Set();
    for (const cabin of VOYAGE_CABINS) {
      const html = read(`interfaces/voyage/cabin-${cabin.slug}.html`);
      expect(html).toContain(`src="${cabin.image}"`);
      expect(cabin.image).toMatch(/^\/interfaces\/assets\/voyage\/.+\.png$/);
      cabinImages.add(cabin.image);
      expect(existsSync(new URL(`../../${cabin.image.replace(/^\//, '')}`, import.meta.url))).toBe(true);
    }
    expect(cabinImages.size).toBe(VOYAGE_CABINS.length);

    const directory = read('interfaces/voyage/decks.html');
    expect(directory).toContain('voyage-directory-thumb');
    expect(directory).toContain('/interfaces/assets/voyage/voyage-map.png');
    expect(directory).toContain('/interfaces/assets/voyage/voyage-map-aboard-hero.png');
    expect(directory).toContain('/interfaces/assets/voyage/voyage-map-come-aboard.png');
    expect(directory).toContain('voyage-directory-hero--story');
    expect(directory).toContain('voyage-map-still');
    expect(directory).toContain('voyage-map-filmstrip');
    expect(directory).toContain('voyage-map-schematic');
    expect(directory).toContain('/interfaces/assets/journey/journey-bridge-solar-watch.png');
    expect(directory).toContain('/interfaces/assets/journey/journey-boriken-convergence.png');
    expect(directory).toContain('/interfaces/assets/journey/journey-puerto-reno-gangway.png');
    expect(directory).toContain('Ship map · decks &amp; landfalls');
    expect(directory).toContain('Puerto Reno');
    const storyHeroIdx = directory.indexOf('voyage-map-aboard-hero.png');
    const schematicIdx = directory.indexOf('voyage-map-schematic');
    expect(storyHeroIdx).toBeGreaterThan(-1);
    expect(schematicIdx).toBeGreaterThan(storyHeroIdx);
  });

  it('QUESTFEST home ships baked-in top banner', () => {
    const html = read('interfaces/vibelandia-questfest.html');
    expect(html).toContain('<!-- SITE_TOP_BANNER_START -->');
    expect(html).toContain('qv-top-quicklinks');
    expect(html).toContain('SS VIBELANDIA');
    expect(html).toMatch(/<body>[\s\S]*qv-top-quicklinks/);
  });

  it('canvas landing uses publication news rail chrome', () => {
    const canvas = read('interfaces/omniverse-canvas.html');
    expect(canvas).toContain('canvas-pub');
    expect(canvas).toContain('voyage-brochure-publication.css');
    expect(canvas).toContain('band--ship-news');
  });

  it('shared ribbon advertises the Voyage door', () => {
    const js = read('interfaces/site-quicklinks.js');
    expect(js).toContain('/frontiersman-voyage');
    expect(js).toContain('Voyage');
  });
});
