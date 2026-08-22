import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { VOYAGE_CABINS, VOYAGE_DECKS } from '../../lib/voyage-directory.mjs';
import {
  VOYAGE_MAP_POSTER,
  cabinAccent,
  cabinGlyph,
  deckAccent,
  deckGlyph,
  renderVoyagePosterSvg,
  voyagePosterPath,
} from '../../lib/voyage-posters.mjs';

describe('voyage poster catalog', () => {
  it('maps slugs to themed SVG paths', () => {
    expect(voyagePosterPath('deck-9-summit')).toBe('/interfaces/assets/voyage/deck-9-summit.svg');
    expect(voyagePosterPath('ph-001')).toBe('/interfaces/assets/voyage/ph-001.svg');
    expect(VOYAGE_MAP_POSTER).toBe('/interfaces/assets/voyage/voyage-map.svg');
  });

  it('assigns distinct glyphs and accents per deck and cabin', () => {
    const deckGlyphs = VOYAGE_DECKS.map((d) => deckGlyph(d.slug));
    expect(new Set(deckGlyphs).size).toBe(VOYAGE_DECKS.length);
    const cabinGlyphs = VOYAGE_CABINS.map((c) => cabinGlyph(c.slug));
    expect(new Set(cabinGlyphs).size).toBe(VOYAGE_CABINS.length);
    expect(deckAccent('deck-2-core')).toMatch(/^#/);
    expect(cabinAccent('st-601-680')).toMatch(/^#/);
  });

  it('renders SVG posters on disk for every deck, cabin, and map', () => {
    for (const deck of VOYAGE_DECKS) {
      const rel = deck.image.replace(/^\//, '');
      expect(existsSync(new URL(`../../${rel}`, import.meta.url))).toBe(true);
      const svg = readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
      expect(svg).toContain(deck.label.replace(/&/g, '&amp;'));
    }
    for (const cabin of VOYAGE_CABINS) {
      const rel = cabin.image.replace(/^\//, '');
      expect(existsSync(new URL(`../../${rel}`, import.meta.url))).toBe(true);
    }
    expect(existsSync(new URL('../../interfaces/assets/voyage/voyage-map.svg', import.meta.url))).toBe(
      true,
    );
  });

  it('escapes XML in poster titles', () => {
    const svg = renderVoyagePosterSvg({
      title: 'Deck & Cabins',
      subtitle: 'Brochure §14–22',
      glyph: '◈',
      accent: '#d4af37',
      kind: 'directory',
    });
    expect(svg).toContain('Deck &amp; Cabins');
    expect(svg).not.toContain('Deck & Cabins');
  });
});
