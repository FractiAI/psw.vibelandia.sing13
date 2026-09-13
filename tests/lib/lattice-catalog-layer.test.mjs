import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  LATTICE_CATALOG_LAYER,
  LATTICE_CATALOG_LAYER_CONTENT,
  CATALOG_LAYER_INNOVATIONS,
  CATALOG_LAYER_INNOVATIONS_HONESTY,
  CATALOG_LAYER_SECURITY_FABRIC,
  renderLatticeCatalogLayerBandHtml,
  renderCatalogLayerInnovationsHtml,
} from '../../lib/lattice-catalog-layer.mjs';
import { CATALOG_CATEGORIES } from '../../lib/whitepaper-catalog.mjs';
import { SITE_QUICKLINK_SECONDARY, SITE_PRIMER_LINE } from '../../lib/site-focus.mjs';
import { PLAYER_SPINE_LINE } from '../../lib/npc-player-doctrine.mjs';

function read(rel) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
}

const FEATURED_WITH_INNOVATIONS = [
  'interfaces/lattice-v1618.html',
  'interfaces/blog-infinite-octave-ai-catalog-layer-2026-09.html',
  'interfaces/infinite-octave-egs-catalog-brochure.html',
  'interfaces/infinite-octave-egs-catalog-briefing-portals.html',
  'interfaces/blog-infinite-octave-egs-catalog-2026-09.html',
  'interfaces/lattice-brochure.html',
  'interfaces/lattice-learn-more.html',
];

describe('AI catalog layer · Infinite Octaves Omniversal Lattice Chat', () => {
  it('defines the catalog-layer identity and honesty rail', () => {
    expect(LATTICE_CATALOG_LAYER.id).toBe('ai-catalog-layer');
    expect(LATTICE_CATALOG_LAYER.title).toMatch(/Infinite Octaves Omniversal Lattice Chat/);
    expect(LATTICE_CATALOG_LAYER.honesty).toMatch(/not a finished physics proof/i);
    expect(LATTICE_CATALOG_LAYER_CONTENT.oneLiner).toMatch(/catalog layer/i);
    const band = renderLatticeCatalogLayerBandHtml();
    expect(band).toContain('id="ai-catalog-layer"');
    expect(band).toContain('/lattice-chat');
    expect(band).toContain('/infinite-octave-egs-catalog/briefing#portal-sandbox');
  });

  it('registers Reading Room category lattice-catalog', () => {
    const cat = CATALOG_CATEGORIES.find((c) => c.id === 'lattice-catalog');
    expect(cat).toBeTruthy();
    expect(cat.label).toMatch(/AI catalog layer/i);
  });

  it('exposes Lattice in secondary quicklinks toward catalog intro', () => {
    expect(SITE_QUICKLINK_SECONDARY).toContain('ql-catalog-layer-link');
    expect(SITE_QUICKLINK_SECONDARY).toContain('/lattice#ai-catalog-layer-intro');
    expect(SITE_PRIMER_LINE).toMatch(/catalog layer/i);
    expect(PLAYER_SPINE_LINE).toMatch(/catalog layer/i);
  });

  it('weaves catalog-layer copy into native surface content (no bolted chrome band)', () => {
    for (const rel of [
      'interfaces/vibelandia-questfest.html',
      'index.html',
      'interfaces/omniverse-canvas.html',
      'interfaces/lattice-v1618.html',
      'interfaces/journeys.html',
      'interfaces/reading-room.html',
      'interfaces/creator-studio.html',
    ]) {
      const html = read(rel);
      expect(html, `${rel} should not keep lat-cat-layer chrome`).not.toContain(
        'class="lat-cat-layer"',
      );
      expect(html, `${rel} should mention Infinite Octaves / catalog`).toMatch(
        /Infinite Octaves|catalog layer|ai-catalog-layer/i,
      );
    }
  });

  it('keeps five cruise doors on QUESTFEST while naming the catalog layer in primer/spine', () => {
    const home = read('interfaces/vibelandia-questfest.html');
    expect(home).toContain('Your cruise line · five doors');
    expect(home).toMatch(/catalog layer/i);
    expect(home).toContain('/lattice#ai-catalog-layer-intro');
  });

  it('keeps lattice landing stack section as the home for #ai-catalog-layer-intro', () => {
    const lattice = read('interfaces/lattice-v1618.html');
    expect(lattice).toContain('id="ai-catalog-layer-intro"');
    expect(lattice).toMatch(/Where this layer sits/i);
  });

  it('defines five catalog-layer innovations with unique deliverables plus security fabric', () => {
    expect(CATALOG_LAYER_INNOVATIONS).toHaveLength(5);
    expect(CATALOG_LAYER_INNOVATIONS.map((i) => i.id)).toEqual([
      'volumetric-interference',
      'golden-ratio-cataloging',
      'prime-container-storage',
      'holographic-rhyme-wiring',
      'goldilocks-net-zero',
    ]);
    for (const inn of CATALOG_LAYER_INNOVATIONS) {
      expect(inn.delivers, inn.id).toBeTruthy();
      expect(inn.withoutIt, inn.id).toMatch(/without/i);
      expect(inn.href, inn.id).toMatch(/^\//);
      expect(`${inn.delivers} ${inn.withoutIt}`, inn.id).not.toMatch(
        /standing-wave|absolute orthogonality|algebraic Φ/i,
      );
    }
    expect(CATALOG_LAYER_INNOVATIONS_HONESTY).toMatch(/Five catalog-layer innovations/i);
    expect(CATALOG_LAYER_SECURITY_FABRIC.id).toBe('security-fabric-24x365');
    expect(CATALOG_LAYER_SECURITY_FABRIC.delivers).toMatch(/Keys stay local/i);
    const block = renderCatalogLayerInnovationsHtml();
    expect(block).toContain('id="catalog-layer-innovations"');
    expect(block).toContain('Cannot achieve without it');
    expect(block).toContain('goldilocks-net-zero');
    expect(block).toContain('security-fabric-24x365');
    expect(block).toContain('/ship-blog/prime-indexed-volumetric-storage');
    expect(block).toContain('/ship-blog/holographic-rhyme');
  });

  it('features the five innovations on catalog-layer guest surfaces (demos stay teaser-only)', () => {
    for (const rel of FEATURED_WITH_INNOVATIONS) {
      const html = read(rel);
      expect(html, `${rel} innovations block`).toContain('id="catalog-layer-innovations"');
      expect(html, `${rel} volumetric`).toContain('volumetric-interference');
      expect(html, `${rel} golden ratio`).toContain('golden-ratio-cataloging');
      expect(html, `${rel} prime container`).toContain('prime-container-storage');
      expect(html, `${rel} holographic rhyme`).toContain('holographic-rhyme-wiring');
      expect(html, `${rel} goldilocks`).toContain('goldilocks-net-zero');
      expect(html, `${rel} without-it claim`).toContain('Cannot achieve without it');
    }
    const demos = read('interfaces/prime-vault-demos.html');
    expect(demos).toContain('demo-egs-catalog');
    expect(demos).toContain('/infinite-octave-egs-catalog/briefing#portal-sandbox');
    expect(demos).not.toContain('id="catalog-layer-innovations"');
  });

  it('ships an interactive with/without executive sandbox on the briefing portals', () => {
    const briefing = read('interfaces/infinite-octave-egs-catalog-briefing-portals.html');
    expect(briefing).toContain('id="portal-sandbox"');
    expect(briefing).toContain('function renderCompare');
    expect(briefing).toMatch(/with catalog layer|Without catalog layer/i);
    expect(briefing).not.toMatch(/standing-wave maps|absolute orthogonality|algebraic Φ-map/i);
  });
});
