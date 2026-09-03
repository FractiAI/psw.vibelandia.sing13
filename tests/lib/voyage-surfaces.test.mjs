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
    expect(css).toContain('.voyage-captain-reach');
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
    expect(html).toContain('Official Frontiersman Voyage Brochure');
    expect(html).not.toMatch(/Compendium|compendium/);
    expect(html).toContain('<ul class="toc">');
    expect(html).not.toContain('<ol class="toc">');
    expect(html).toContain('>1. What “holographic” means</a>');
    expect(html).toContain('3664');
    expect(html).toContain('3923');
  });

  it('brochure Contents uses one numbering set and is titled Brochure', () => {
    const html = read('interfaces/frontiersman-voyage-brochure.html');
    expect(html).toContain('<h1 class="vb-pub-title">Official Frontiersman Voyage Brochure</h1>');
    expect(html).not.toMatch(/Compendium|compendium/);
    expect(html).toContain('<ul class="toc">');
    expect(html).not.toContain('<ol class="toc">');
    expect(html).toContain('>1. What “holographic” means</a>');
    const css = read('interfaces/voyage-brochure-publication.css');
    expect(css).toMatch(/body\.vb-pub \.toc \{[\s\S]*list-style:\s*none/);
    expect(css).toMatch(/body\.vb-pub \.toc li::marker \{[\s\S]*content:\s*none/);
    expect(read('interfaces/voyage/frontiersman.html')).not.toMatch(/Compendium|compendium/);
    expect(read('interfaces/blog-frontiersman-voyage-2026-08.html')).not.toMatch(/Compendium|compendium/);
    expect(read('interfaces/vibelandia-questfest.html')).not.toMatch(/compendium/i);
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

  it('Captain’s Grand Penthouse is 360° with a private elevator to every deck', () => {
    const penthouse = VOYAGE_CABINS.find((c) => c.slug === 'ph-001');
    expect(penthouse).toBeTruthy();
    expect(penthouse.lead).toMatch(/360°/);
    expect(penthouse.lead).toMatch(/private elevator/i);
    expect(penthouse.lead).toMatch(/every deck/i);
    expect(penthouse.lead).not.toMatch(/270°/);
    expect(penthouse.body.join(' ')).toMatch(/Summit, Veranda, Horizon, Grove, Night, and Core/);
    expect(penthouse.imageAlt).toMatch(/private elevator to every deck/i);

    const cabinHtml = read('interfaces/voyage/cabin-ph-001.html');
    expect(cabinHtml).toContain('360° views from Summit');
    expect(cabinHtml).toContain('private elevator');
    expect(cabinHtml).toContain('every deck');
    expect(cabinHtml).toContain('private elevator to every deck');
    expect(cabinHtml).not.toContain('270°');

    const brochure = read('interfaces/frontiersman-voyage-brochure.html');
    expect(brochure).toContain('360° views from Summit');
    expect(brochure).not.toContain('270°');

    const summit = VOYAGE_DECKS.find((d) => d.slug === 'deck-9-summit');
    expect(summit.body.join(' ')).toMatch(/private elevator to every deck/);

    for (const deck of VOYAGE_DECKS) {
      const html = read(`interfaces/voyage/${deck.slug}.html`);
      expect(html).toContain('private elevator');
      expect(html).toContain('/voyage/cabin-ph-001');
      expect(html).toContain('self and entertainment');
    }

    const blog = read('interfaces/blog-frontiersman-voyage-2026-08.html');
    expect(blog).toMatch(/360° views, private elevator to every deck/);
    expect(blog).toContain('rooms for self and entertainment to every deck');
  });

  it('deck and cabin pages use distinct themed AI-generated PNG posters', () => {
    const deckImages = new Set();
    for (const deck of VOYAGE_DECKS) {
      const html = read(`interfaces/voyage/${deck.slug}.html`);
      // Experience-upgraded decks (Sin City) use full-bleed ep-hero background-image.
      expect(
        html.includes(`src="${deck.image}"`) || html.includes(`background-image:url('${deck.image}')`),
      ).toBe(true);
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
    expect(html).toMatch(/<body[^>]*>[\s\S]*qv-top-quicklinks/);
  });

  it('canvas landing uses publication news rail chrome', () => {
    const canvas = read('interfaces/omniverse-canvas.html');
    expect(canvas).toContain('canvas-pub');
    expect(canvas).toContain('voyage-brochure-publication.css');
    expect(canvas).toContain('band--ship-news');
  });

  it('shared ribbon advertises Let\'s Chat, Lattice Chat, and QR share', () => {
    const js = read('interfaces/site-quicklinks.js');
    expect(js).toMatch(/href="\/lets-chat"[\s\S]*Chat/);
    expect(js).toContain('href="/lattice-chat">Lattice Chat</a>');
    expect(js).toContain('QR Share</button>');
    expect(js).not.toContain('href="/creator-studio">Creator Studio</a>');
  });
});
