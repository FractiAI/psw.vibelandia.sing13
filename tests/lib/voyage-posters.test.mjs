import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { VOYAGE_CABINS, VOYAGE_DECKS } from '../../lib/voyage-directory.mjs';
import {
  VOYAGE_MAP_POSTER,
  VOYAGE_POSTER_SLUGS,
  voyagePosterPath,
} from '../../lib/voyage-posters.mjs';

describe('voyage poster catalog', () => {
  it('maps slugs to AI-generated PNG paths', () => {
    expect(voyagePosterPath('deck-9-summit')).toBe('/interfaces/assets/voyage/deck-9-summit.png');
    expect(voyagePosterPath('ph-001')).toBe('/interfaces/assets/voyage/ph-001.png');
    expect(VOYAGE_MAP_POSTER).toBe('/interfaces/assets/voyage/voyage-map.png');
  });

  it('lists every deck, cabin, and map slug', () => {
    for (const deck of VOYAGE_DECKS) {
      expect(VOYAGE_POSTER_SLUGS).toContain(deck.slug);
    }
    for (const cabin of VOYAGE_CABINS) {
      expect(VOYAGE_POSTER_SLUGS).toContain(cabin.slug);
    }
    expect(VOYAGE_POSTER_SLUGS).toContain('voyage-map');
  });

  it('ships PNG posters on disk for every deck, cabin, and map', () => {
    for (const deck of VOYAGE_DECKS) {
      const rel = deck.image.replace(/^\//, '');
      expect(deck.image).toMatch(/\.png$/);
      expect(existsSync(new URL(`../../${rel}`, import.meta.url))).toBe(true);
      const buf = readFileSync(new URL(`../../${rel}`, import.meta.url));
      expect(buf.length).toBeGreaterThan(1000);
    }
    for (const cabin of VOYAGE_CABINS) {
      const rel = cabin.image.replace(/^\//, '');
      expect(cabin.image).toMatch(/\.png$/);
      expect(existsSync(new URL(`../../${rel}`, import.meta.url))).toBe(true);
    }
    expect(existsSync(new URL('../../interfaces/assets/voyage/voyage-map.png', import.meta.url))).toBe(
      true,
    );
  });
});
