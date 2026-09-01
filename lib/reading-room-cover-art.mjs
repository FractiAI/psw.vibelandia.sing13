/**
 * AI-style catalog cover art for Reading Room cards (deterministic SVG posters).
 * Synced to interfaces/assets/reading-room-covers/{id}.svg via scripts/sync-reading-room-covers.mjs
 */
import { createHash } from 'node:crypto';

/** @type {Record<string, { stops: [string, string, string], accent: string, label: string }>} */
export const CATEGORY_PALETTES = {
  'dph-gpu': {
    stops: ['#050b14', '#0f2844', '#1a4a6e'],
    accent: '#d4af37',
    label: 'DPH-GPU',
  },
  hhf: {
    stops: ['#040810', '#0a1e32', '#123a58'],
    accent: '#7ec8ff',
    label: 'HHF',
  },
  tbme: {
    stops: ['#120810', '#2a1438', '#4a2060'],
    accent: '#e8a8d8',
    label: 'TBME',
  },
  'reproducible-research': {
    stops: ['#081008', '#143020', '#1e4828'],
    accent: '#8fd4a0',
    label: 'REPO',
  },
  coherence: {
    stops: ['#101008', '#282010', '#403018'],
    accent: '#f0c060',
    label: 'COHERENCE',
  },
  agentic: {
    stops: ['#100818', '#281830', '#402848'],
    accent: '#c8a0ff',
    label: 'AGENT',
  },
  'special-projects': {
    stops: ['#0c0c10', '#202028', '#343440'],
    accent: '#b8b8d0',
    label: 'SPECIAL',
  },
  protocols: {
    stops: ['#0a0a08', '#222018', '#3a3428'],
    accent: '#e8d4a8',
    label: 'PROTOCOL',
  },
  other: {
    stops: ['#080808', '#181818', '#282828'],
    accent: '#d4af37',
    label: 'CATALOG',
  },
};

const MOTIF_BY_TAG = {
  solar: 'solar',
  hydrogen: 'hydrogen',
  DNA: 'helix',
  genome: 'helix',
  CMOS: 'grid',
  tensor: 'grid',
  octave: 'rings',
  geodynamo: 'core',
  seismic: 'wave',
  MRI: 'scan',
  bridge: 'bridge',
  voyage: 'compass',
};

function hashSeed(id) {
  return createHash('sha256').update(id).digest();
}

function pickMotif(item) {
  const tags = (item.tags || []).map((t) => String(t).toLowerCase());
  for (const [key, motif] of Object.entries(MOTIF_BY_TAG)) {
    if (tags.some((t) => t.includes(key.toLowerCase()))) return motif;
  }
  const title = String(item.displayTitle || item.title || '').toLowerCase();
  for (const [key, motif] of Object.entries(MOTIF_BY_TAG)) {
    if (title.includes(key)) return motif;
  }
  const variants = ['rings', 'grid', 'wave', 'compass', 'helix', 'core'];
  const h = hashSeed(item.id);
  return variants[h[0] % variants.length];
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function motifSvg(motif, accent, seed) {
  const o = seed[1] % 40;
  switch (motif) {
    case 'solar':
      return `<circle cx="120" cy="95" r="42" fill="none" stroke="${accent}" stroke-width="2" opacity="0.85"/>
        ${[0, 45, 90, 135].map((a) => `<line x1="120" y1="95" x2="${120 + 58 * Math.cos((a * Math.PI) / 180)}" y2="${95 + 58 * Math.sin((a * Math.PI) / 180)}" stroke="${accent}" stroke-width="1.5" opacity="0.5"/>`).join('')}`;
    case 'hydrogen':
      return `<circle cx="95" cy="110" r="18" fill="none" stroke="${accent}" stroke-width="2" opacity="0.7"/>
        <circle cx="145" cy="110" r="18" fill="none" stroke="${accent}" stroke-width="2" opacity="0.7"/>
        <line x1="113" y1="110" x2="127" y2="110" stroke="${accent}" stroke-width="2" opacity="0.8"/>`;
    case 'helix':
      return `<path d="M85 ${80 + o} Q110 ${60 + o} 135 ${80 + o} T185 ${80 + o}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.75"/>
        <path d="M85 ${120 + o} Q110 ${140 + o} 135 ${120 + o} T185 ${120 + o}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.45"/>`;
    case 'grid':
      return [0, 1, 2, 3].map((i) =>
        `<rect x="${70 + i * 28}" y="75" width="22" height="22" fill="none" stroke="${accent}" stroke-width="1.2" opacity="${0.35 + i * 0.12}"/>`,
      ).join('');
    case 'core':
      return `<circle cx="120" cy="100" r="50" fill="none" stroke="${accent}" stroke-width="1" opacity="0.35"/>
        <circle cx="120" cy="100" r="30" fill="none" stroke="${accent}" stroke-width="2" opacity="0.65"/>
        <circle cx="120" cy="100" r="10" fill="${accent}" opacity="0.9"/>`;
    case 'wave':
      return `<path d="M60 105 Q90 85 120 105 T180 105" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.7"/>
        <path d="M60 125 Q90 145 120 125 T180 125" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>`;
    case 'scan':
      return `<rect x="70" y="70" width="100" height="70" rx="8" fill="none" stroke="${accent}" stroke-width="2" opacity="0.55"/>
        <line x1="70" y1="${95 + (seed[2] % 30)}" x2="170" y2="${95 + (seed[2] % 30)}" stroke="${accent}" stroke-width="2" opacity="0.85"/>`;
    case 'bridge':
      return `<path d="M65 120 Q120 70 175 120" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.75"/>
        <line x1="85" y1="120" x2="85" y2="145" stroke="${accent}" stroke-width="2" opacity="0.5"/>
        <line x1="155" y1="120" x2="155" y2="145" stroke="${accent}" stroke-width="2" opacity="0.5"/>`;
    case 'compass':
      return `<polygon points="120,65 135,115 120,105 105,115" fill="${accent}" opacity="0.75"/>
        <circle cx="120" cy="100" r="38" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.45"/>`;
    case 'rings':
    default:
      return [0, 1, 2].map((i) =>
        `<ellipse cx="120" cy="105" rx="${38 + i * 14}" ry="${18 + i * 8}" fill="none" stroke="${accent}" stroke-width="1.5" opacity="${0.75 - i * 0.18}"/>`,
      ).join('');
  }
}

/**
 * @param {{ id: string, title?: string, displayTitle?: string, category?: string, tags?: string[] }} item
 */
export function renderReadingRoomCoverSvg(item) {
  const palette = CATEGORY_PALETTES[item.category] || CATEGORY_PALETTES.other;
  const seed = hashSeed(item.id);
  const motif = pickMotif(item);
  const title = escapeXml(item.displayTitle || item.title || item.id);
  const shortTitle = title.length > 48 ? title.slice(0, 45) + '…' : title;
  const glowX = 60 + (seed[2] % 120);
  const glowY = 40 + (seed[3] % 80);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 360" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.stops[0]}"/>
      <stop offset="55%" stop-color="${palette.stops[1]}"/>
      <stop offset="100%" stop-color="${palette.stops[2]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${palette.stops[0]}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="200" x2="0" y2="360" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.88"/>
    </linearGradient>
  </defs>
  <rect width="240" height="360" fill="url(#bg)"/>
  <ellipse cx="${glowX}" cy="${glowY}" rx="90" ry="70" fill="url(#glow)"/>
  <g opacity="0.9">${motifSvg(motif, palette.accent, seed)}</g>
  <rect x="0" y="200" width="240" height="160" fill="url(#fade)"/>
  <text x="16" y="292" fill="${palette.accent}" font-family="Georgia, serif" font-size="11" letter-spacing="2" opacity="0.85">${palette.label}</text>
  <text x="16" y="318" fill="#f5efe6" font-family="Georgia, serif" font-size="15" font-weight="700">${shortTitle}</text>
  <text x="16" y="340" fill="#b8aa94" font-family="system-ui, sans-serif" font-size="9" letter-spacing="1.5">READING ROOM · SS VIBELANDIA</text>
</svg>`;
}

/** @param {string} id */
export function readingRoomCoverPath(id) {
  return `/interfaces/assets/reading-room-covers/${id}.svg`;
}
