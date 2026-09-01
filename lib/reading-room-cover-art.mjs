/**
 * Reading Room catalog cover art — abstract-driven cinematic SVG scenes.
 * PNG covers (AI-generated) take precedence when present on disk.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { extractCoverFocus } from './reading-room-cover-focus.mjs';

/** @type {Record<string, { stops: [string, string, string], accent: string }>} */
export const CATEGORY_PALETTES = {
  'dph-gpu': { stops: ['#050b14', '#0f2844', '#1a4a6e'], accent: '#d4af37' },
  hhf: { stops: ['#040810', '#0a1e32', '#123a58'], accent: '#7ec8ff' },
  tbme: { stops: ['#120810', '#2a1438', '#4a2060'], accent: '#e8a8d8' },
  'reproducible-research': { stops: ['#081008', '#143020', '#1e4828'], accent: '#8fd4a0' },
  coherence: { stops: ['#101008', '#282010', '#403018'], accent: '#f0c060' },
  agentic: { stops: ['#100818', '#281830', '#402848'], accent: '#c8a0ff' },
  'special-projects': { stops: ['#0c0c10', '#202028', '#343440'], accent: '#b8b8d0' },
  protocols: { stops: ['#0a0a08', '#222018', '#3a3428'], accent: '#e8d4a8' },
  other: { stops: ['#080808', '#181818', '#282828'], accent: '#d4af37' },
};

function hashSeed(id) {
  return createHash('sha256').update(id).digest();
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Rich illustrative scene layers keyed by theme — no symbols-only motifs. */
function sceneLayers(theme, accent, seed) {
  const j = seed[1] % 24;
  const k = seed[2] % 18;
  switch (theme) {
    case 'higgs':
      return `
        <radialGradient id="higgsGlow"><stop offset="0%" stop-color="#fff8e8"/><stop offset="45%" stop-color="${accent}"/><stop offset="100%" stop-color="transparent"/></radialGradient>
        <circle cx="120" cy="130" r="55" fill="url(#higgsGlow)" opacity="0.55"/>
        <ellipse cx="120" cy="130" rx="70" ry="28" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.4" transform="rotate(${j} 120 130)"/>
        <ellipse cx="120" cy="130" rx="48" ry="18" fill="none" stroke="${accent}" stroke-width="2" opacity="0.65" transform="rotate(${-j} 120 130)"/>
        <circle cx="120" cy="130" r="8" fill="#fff8e8" opacity="0.95"/>
        <path d="M55 200 Q120 ${150 + k} 185 200" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.35"/>`;
    case 'awareness':
      return `
        <circle cx="120" cy="115" r="42" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.5"/>
        <path d="M78 115 Q120 70 162 115 Q120 160 78 115" fill="${accent}" opacity="0.12"/>
        <circle cx="105" cy="108" r="6" fill="${accent}" opacity="0.8"/><circle cx="135" cy="108" r="6" fill="${accent}" opacity="0.8"/>
        <path d="M90 145 Q120 125 150 145" fill="none" stroke="${accent}" stroke-width="2" opacity="0.55"/>`;
    case 'genome':
      return `
        <path d="M95 ${70 + j} Q115 ${90 + j} 95 ${110 + j} T95 ${170 + j}" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.75"/>
        <path d="M145 ${70 + j} Q125 ${90 + j} 145 ${110 + j} T145 ${170 + j}" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.45"/>
        ${[0, 1, 2, 3, 4].map((i) => `<line x1="95" y1="${85 + i * 22}" x2="145" y2="${85 + i * 22}" stroke="${accent}" stroke-width="1" opacity="0.35"/>`).join('')}`;
    case 'solar':
      return `
        <circle cx="120" cy="105" r="38" fill="${accent}" opacity="0.22"/>
        <circle cx="120" cy="105" r="38" fill="none" stroke="${accent}" stroke-width="2"/>
        ${[0, 30, 60, 90, 120, 150].map((a) => {
          const rad = (a * Math.PI) / 180;
          return `<line x1="120" y1="105" x2="${120 + 62 * Math.cos(rad)}" y2="${105 + 62 * Math.sin(rad)}" stroke="${accent}" stroke-width="1.8" opacity="0.55"/>`;
        }).join('')}
        <path d="M50 210 Q120 175 190 210" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.3"/>`;
    case 'geodynamo':
      return `
        <circle cx="120" cy="125" r="52" fill="none" stroke="${accent}" stroke-width="1" opacity="0.35"/>
        <circle cx="120" cy="125" r="34" fill="${accent}" opacity="0.15"/>
        <path d="M120 93 L120 157 M93 125 L147 125" stroke="${accent}" stroke-width="1.5" opacity="0.5"/>
        <ellipse cx="120" cy="125" rx="52" ry="18" fill="none" stroke="${accent}" stroke-width="2" opacity="0.6" transform="rotate(${j * 3} 120 125)"/>`;
    case 'blackhole':
      return `
        <circle cx="120" cy="120" r="46" fill="#000" opacity="0.85"/>
        <ellipse cx="120" cy="120" rx="68" ry="22" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.75" transform="rotate(${j * 4} 120 120)"/>
        <ellipse cx="120" cy="120" rx="58" ry="16" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.45" transform="rotate(${-j * 3} 120 120)"/>`;
    case 'mri':
      return `
        <rect x="62" y="72" width="116" height="88" rx="14" fill="none" stroke="${accent}" stroke-width="2" opacity="0.55"/>
        <ellipse cx="120" cy="116" rx="38" ry="52" fill="none" stroke="${accent}" stroke-width="2" opacity="0.7"/>
        <line x1="62" y1="${95 + k}" x2="178" y2="${95 + k}" stroke="${accent}" stroke-width="2.5" opacity="0.85"/>`;
    case 'cmos':
      return `
        <rect x="70" y="80" width="100" height="72" rx="6" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/>
        ${[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3].map((c) =>
            `<rect x="${78 + c * 22}" y="${88 + r * 16}" width="16" height="10" fill="${accent}" opacity="${0.15 + (r + c) * 0.08}"/>`,
          ).join(''),
        ).join('')}
        <path d="M85 175 Q120 155 155 175" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>`;
    case 'voyage':
      return `
        <path d="M60 190 L120 75 L180 190 Z" fill="${accent}" opacity="0.12" stroke="${accent}" stroke-width="2"/>
        <circle cx="120" cy="130" r="22" fill="none" stroke="${accent}" stroke-width="2" opacity="0.65"/>
        <line x1="120" y1="108" x2="120" y2="88" stroke="${accent}" stroke-width="2"/>
        <polygon points="120,82 126,96 114,96" fill="${accent}" opacity="0.85"/>`;
    case 'nodal':
      return `
        ${[0, 1, 2].map((i) => `<circle cx="${80 + i * 40}" cy="${110 + (i % 2) * 20}" r="14" fill="none" stroke="${accent}" stroke-width="2" opacity="${0.85 - i * 0.15}"/>`).join('')}
        <path d="M50 175 Q120 140 190 175" fill="none" stroke="${accent}" stroke-width="2" opacity="0.45"/>
        <circle cx="120" cy="188" r="10" fill="${accent}" opacity="0.25"/>`;
    case 'metamorphic':
      return `
        <path d="M55 200 L85 90 L120 170 L155 85 L185 200 Z" fill="${accent}" opacity="0.1" stroke="${accent}" stroke-width="1.8"/>
        <path d="M70 200 L100 120 L120 155 L140 115 L170 200" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.5"/>`;
    case 'hydrogen':
      return `
        <circle cx="92" cy="120" r="22" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.75"/>
        <circle cx="148" cy="120" r="22" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.75"/>
        <line x1="114" y1="120" x2="126" y2="120" stroke="${accent}" stroke-width="3" opacity="0.9"/>
        <ellipse cx="120" cy="120" rx="80" ry="30" fill="none" stroke="${accent}" stroke-width="1" opacity="0.25"/>`;
    case 'lattice':
    default:
      return `
        ${[0, 1, 2, 3].map((i) =>
          `<ellipse cx="120" cy="120" rx="${32 + i * 16}" ry="${14 + i * 7}" fill="none" stroke="${accent}" stroke-width="1.6" opacity="${0.8 - i * 0.15}" transform="rotate(${j + i * 12} 120 120)"/>`,
        ).join('')}
        <circle cx="120" cy="120" r="6" fill="${accent}" opacity="0.9"/>`;
  }
}

/**
 * @param {{ id: string, title?: string, displayTitle?: string, category?: string, abstract?: string, plainLine?: string, tags?: string[] }} item
 */
export function renderReadingRoomCoverSvg(item) {
  const palette = CATEGORY_PALETTES[item.category] || CATEGORY_PALETTES.other;
  const seed = hashSeed(item.id);
  const { primaryTheme, themes } = extractCoverFocus(item);
  const title = escapeXml(item.displayTitle || item.title || item.id);
  const glowX = 50 + (seed[2] % 140);
  const glowY = 30 + (seed[3] % 100);
  const secondary = themes[1] || primaryTheme;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 360" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.stops[0]}"/>
      <stop offset="55%" stop-color="${palette.stops[1]}"/>
      <stop offset="100%" stop-color="${palette.stops[2]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="70%">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="${palette.stops[0]}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter>
  </defs>
  <rect width="240" height="360" fill="url(#bg)"/>
  <ellipse cx="${glowX}" cy="${glowY}" rx="100" ry="80" fill="url(#glow)"/>
  <g opacity="0.88" filter="url(#soft)">${sceneLayers(secondary, palette.accent, seed)}</g>
  <g opacity="0.95">${sceneLayers(primaryTheme, palette.accent, seed)}</g>
  <rect x="0" y="260" width="240" height="100" fill="url(#bg)" opacity="0.35"/>
</svg>`;
}

/** @param {string} id */
export function readingRoomCoverRelPath(id, ext = 'svg') {
  return `interfaces/assets/reading-room-covers/${id}.${ext}`;
}

/**
 * @param {string} id
 * @param {string} [root]
 */
export function readingRoomCoverPath(id, root = process.cwd()) {
  const png = join(root, readingRoomCoverRelPath(id, 'png'));
  if (existsSync(png)) {
    return `/interfaces/assets/reading-room-covers/${id}.png`;
  }
  return `/interfaces/assets/reading-room-covers/${id}.svg`;
}
