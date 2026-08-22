/**
 * Themed voyage poster paths — AI-generated room/deck images (navy-gold catalog art).
 */
export const VOYAGE_MAP_POSTER = '/interfaces/assets/voyage/voyage-map.png';

/** @param {string} slug deck or cabin slug */
export function voyagePosterPath(slug) {
  return `/interfaces/assets/voyage/${slug}.png`;
}

/** Slugs that ship AI-generated PNG posters on disk. */
export const VOYAGE_POSTER_SLUGS = [
  'voyage-map',
  'deck-9-summit',
  'deck-8-veranda',
  'deck-6-7-horizon',
  'deck-4-5-grove',
  'deck-3-night',
  'deck-2-core',
  'ph-001',
  'ph-101-108',
  'cc-201-224',
  'rr-301-340',
  'gm-401-450',
  'sc-501-560',
  'st-601-680',
];
