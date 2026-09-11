import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  LATTICE_CATALOG_LAYER,
  renderLatticeCatalogLayerBandHtml,
} from '../../lib/lattice-catalog-layer.mjs';
import { CATALOG_CATEGORIES } from '../../lib/whitepaper-catalog.mjs';
import { SITE_QUICKLINK_SECONDARY } from '../../lib/site-focus.mjs';

function read(rel) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
}

describe('AI catalog layer · Infinite Octaves Omniversal Lattice Chat', () => {
  it('defines the catalog-layer identity and honesty rail', () => {
    expect(LATTICE_CATALOG_LAYER.id).toBe('ai-catalog-layer');
    expect(LATTICE_CATALOG_LAYER.title).toMatch(/Infinite Octaves Omniversal Lattice Chat/);
    expect(LATTICE_CATALOG_LAYER.honesty).toMatch(/not a finished physics proof/i);
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

  it('exposes AI Catalog Layer in secondary quicklinks', () => {
    expect(SITE_QUICKLINK_SECONDARY).toContain('ql-catalog-layer-link');
    expect(SITE_QUICKLINK_SECONDARY).toContain('/lattice#ai-catalog-layer');
  });

  it('is layered on QUESTFEST, Canvas, and Lattice landing', () => {
    for (const rel of [
      'interfaces/vibelandia-questfest.html',
      'index.html',
      'interfaces/omniverse-canvas.html',
      'interfaces/lattice-v1618.html',
    ]) {
      const html = read(rel);
      expect(html, rel).toContain('lat-cat-layer');
      expect(html, rel).toContain('ai-catalog-layer');
      expect(html, rel).toContain('LATTICE_CATALOG_LAYER_START');
    }
  });

  it('keeps five cruise doors on QUESTFEST while introducing the layer', () => {
    const home = read('interfaces/vibelandia-questfest.html');
    expect(home).toContain('Your cruise line · five doors');
    expect(home).toContain('AI stack · Catalog layer');
    expect(home).toContain('/ship-blog/infinite-octave-ai-catalog-layer');
  });
});
