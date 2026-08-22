/**
 * Themed voyage poster SVG generation — navy-gold hospitality catalog art.
 */
export const VOYAGE_MAP_POSTER = '/interfaces/assets/voyage/voyage-map.svg';

/** @param {string} slug deck or cabin slug */
export function voyagePosterPath(slug) {
  return `/interfaces/assets/voyage/${slug}.svg`;
}

export function deckGlyph(slug) {
  const map = {
    'deck-9-summit': '☀',
    'deck-8-veranda': '⌂',
    'deck-6-7-horizon': '≋',
    'deck-4-5-grove': '▣',
    'deck-3-night': '♫',
    'deck-2-core': 'Φ',
  };
  return map[slug] || '◈';
}

export function deckAccent(slug) {
  const map = {
    'deck-9-summit': '#f0d78c',
    'deck-8-veranda': '#7ec8e3',
    'deck-6-7-horizon': '#6ee7b7',
    'deck-4-5-grove': '#fbbf24',
    'deck-3-night': '#c084fc',
    'deck-2-core': '#fcd34d',
  };
  return map[slug] || '#d4af37';
}

export function cabinGlyph(slug) {
  const map = {
    'ph-001': '⚓',
    'ph-101-108': '☀',
    'cc-201-224': '≈',
    'rr-301-340': '❧',
    'gm-401-450': '▤',
    'sc-501-560': '◆',
    'st-601-680': '▦',
  };
  return map[slug] || '▪';
}

export function cabinAccent(slug) {
  const map = {
    'ph-001': '#fef3c7',
    'ph-101-108': '#fde68a',
    'cc-201-224': '#5eead4',
    'rr-301-340': '#93c5fd',
    'gm-401-450': '#fbbf24',
    'sc-501-560': '#a78bfa',
    'st-601-680': '#facc15',
  };
  return map[slug] || '#d4af37';
}

/** @param {{ title: string; subtitle: string; glyph: string; accent: string; kind: string }} theme */
export function renderVoyagePosterSvg(theme) {
  const title = escapeXml(theme.title);
  const subtitle = escapeXml(theme.subtitle);
  const glyph = escapeXml(theme.glyph);
  const accent = theme.accent;
  const kindLabel = theme.kind === 'cabin' ? 'Cabin SKU' : theme.kind === 'deck' ? 'Holographic deck' : 'Voyage directory';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">${subtitle} · SS Vibelandia ${kindLabel} poster</desc>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#070b14"/>
      <stop offset="55%" stop-color="#101a2c"/>
      <stop offset="100%" stop-color="#0a1420"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="78%" r="65%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0d78c"/>
      <stop offset="100%" stop-color="#d4af37"/>
    </linearGradient>
  </defs>
  <rect width="960" height="540" fill="url(#sky)"/>
  <rect width="960" height="540" fill="url(#glow)"/>
  <rect x="24" y="24" width="912" height="492" rx="18" fill="none" stroke="#d4af37" stroke-opacity="0.45" stroke-width="2"/>
  <rect x="32" y="32" width="896" height="476" rx="14" fill="rgba(12,22,40,0.55)" stroke="rgba(212,175,55,0.22)" stroke-width="1"/>
  <text x="72" y="92" fill="#e8d5a3" font-family="Georgia, 'Cormorant Garamond', serif" font-size="22" letter-spacing="6">${kindLabel.toUpperCase()}</text>
  <text x="480" y="250" text-anchor="middle" fill="${accent}" font-family="Georgia, serif" font-size="120">${glyph}</text>
  <text x="72" y="360" fill="url(#gold)" font-family="Georgia, 'Cormorant Garamond', serif" font-size="52" font-weight="700">${title}</text>
  <text x="72" y="410" fill="#d6cfc4" font-family="'Source Sans 3', Arial, sans-serif" font-size="24">${subtitle}</text>
  <text x="72" y="468" fill="#a8a29e" font-family="'Source Sans 3', Arial, sans-serif" font-size="16" letter-spacing="3">SS VIBELANDIA · NAVY &amp; GOLD · FRONTIERSMAN VOYAGE</text>
  <path d="M72 430 H888" stroke="#d4af37" stroke-opacity="0.35" stroke-width="1"/>
</svg>
`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
