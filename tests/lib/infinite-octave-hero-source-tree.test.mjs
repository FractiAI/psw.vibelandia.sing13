import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  HERO_SOURCE_TREE_IMAGE,
  HERO_SOURCE_TREE_MARKERS,
  renderHeroSourceTreeFigureHtml,
} from '../../lib/infinite-octave-hero-source-tree.mjs';

const PRIMER_SURFACES = [
  'interfaces/layers-awareness.html',
  'interfaces/layers-fractal.html',
  'interfaces/layers-holographic.html',
  'interfaces/layers-goldilocks.html',
  'interfaces/layers-superai.html',
  'interfaces/infinite-octave-players-guide.html',
  'interfaces/lattice-learn-more.html',
  'interfaces/omni-lattice-textbook.html',
  'interfaces/infinite-octave-egs-catalog-brochure.html',
  'interfaces/infinite-octave-egs-catalog-briefing-portals.html',
  'interfaces/partials/catalog-synthesis-primer.html',
  'interfaces/lattice-brochure.html',
  'interfaces/lattice-v1618.html',
];

describe('Infinite Octave Hero · Source tree', () => {
  it('ships the anatomy-style tree image asset', () => {
    const rel = HERO_SOURCE_TREE_IMAGE.src.replace(/^\//, '');
    expect(existsSync(rel)).toBe(true);
  });

  it('renders marker-wrapped figure with image + legend', () => {
    const html = renderHeroSourceTreeFigureHtml();
    expect(html).toContain(HERO_SOURCE_TREE_MARKERS.start);
    expect(html).toContain(HERO_SOURCE_TREE_MARKERS.end);
    expect(html).toContain(HERO_SOURCE_TREE_IMAGE.src);
    expect(html).toMatch(/Archetypal field/i);
    expect(html).toMatch(/Digit 4 · BIOLOGICAL SWITCH/i);
    expect(html).toMatch(/Digit 6 · AGENTIC HEXA-LATTICE/i);
    expect(html).toMatch(/Any combination/i);
    expect(html).toMatch(/self-observation/i);
    expect(html).toMatch(/Tree rings · Digits/i);
  });

  it('is embedded in every Infinite Octave primer surface', () => {
    for (const rel of PRIMER_SURFACES) {
      const html = readFileSync(rel, 'utf8');
      expect(html, rel).toContain(HERO_SOURCE_TREE_MARKERS.start);
      expect(html, rel).toContain(HERO_SOURCE_TREE_IMAGE.src);
    }
  });
});
