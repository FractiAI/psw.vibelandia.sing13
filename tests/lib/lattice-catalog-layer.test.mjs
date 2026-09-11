import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  LATTICE_CATALOG_LAYER,
  LATTICE_CATALOG_LAYER_CONTENT,
  renderLatticeCatalogLayerBandHtml,
} from '../../lib/lattice-catalog-layer.mjs';
import { CATALOG_CATEGORIES } from '../../lib/whitepaper-catalog.mjs';
import { SITE_QUICKLINK_SECONDARY, SITE_PRIMER_LINE } from '../../lib/site-focus.mjs';
import { PLAYER_SPINE_LINE } from '../../lib/npc-player-doctrine.mjs';

function read(rel) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
}

describe('AI catalog layer · Infinite Octaves Omniversal Lattice Chat', () => {
  it('defines the catalog-layer identity and honesty rail', () => {
    expect(LATTICE_CATALOG_LAYER.id).toBe('ai-catalog-layer');
    expect(LATTICE_CATALOG_LAYER.title).toMatch(/Infinite Octaves Omniversal Lattice Chat/);
    expect(LATTICE_CATALOG_LAYER.honesty).toMatch(/not a finished physics proof/i);
    expect(LATTICE_CATALOG_LAYER_CONTENT.oneLiner).toMatch(/catalog layer/i);
    const band = renderLatticeCatalogLayerBandHtml();
    expect(band).toContain('id="ai-catalog-layer"');
    expect(band).toContain('/lattice-chat');
    expect(band).toContain('/reading-room?category=lattice-catalog');
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
    expect(home).toContain('/ship-blog/infinite-octave-ai-catalog-layer');
  });

  it('keeps lattice landing stack section as the home for #ai-catalog-layer-intro', () => {
    const lattice = read('interfaces/lattice-v1618.html');
    expect(lattice).toContain('id="ai-catalog-layer-intro"');
    expect(lattice).toContain('Where this layer sits');
  });
});
