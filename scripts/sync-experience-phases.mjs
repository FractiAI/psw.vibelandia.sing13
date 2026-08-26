#!/usr/bin/env node
/**
 * Inject three-phase experience chrome into Canvas, QUESTFEST reception, Creator Studio.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  renderCreatorPhaseHtml,
  renderMuseumEntryHtml,
  renderReceptionLobbyHtml,
} from '../lib/experience-phases.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSS_LINK = '<link rel="stylesheet" href="/interfaces/experience-phases.css" />';

const TARGETS = [
  {
    file: path.join(ROOT, 'interfaces', 'omniverse-canvas.html'),
    markers: ['<!-- EXPERIENCE_MUSEUM_ENTRY_BEGIN -->', '<!-- EXPERIENCE_MUSEUM_ENTRY_END -->'],
    render: renderMuseumEntryHtml,
    cssAfter: 'exhibit-shells.css',
  },
  {
    file: path.join(ROOT, 'interfaces', 'vibelandia-questfest.html'),
    markers: ['<!-- EXPERIENCE_RECEPTION_LOBBY_BEGIN -->', '<!-- EXPERIENCE_RECEPTION_LOBBY_END -->'],
    render: renderReceptionLobbyHtml,
    cssAfter: 'voyage-surfaces.css',
  },
  {
    file: path.join(ROOT, 'interfaces', 'creator-studio.html'),
    markers: ['<!-- EXPERIENCE_CREATOR_PHASE_BEGIN -->', '<!-- EXPERIENCE_CREATOR_PHASE_END -->'],
    render: renderCreatorPhaseHtml,
    cssAfter: 'voyage-surfaces.css',
  },
];

function patchBlock(html, [start, end], block) {
  if (!html.includes(start) || !html.includes(end)) {
    throw new Error(`Markers not found: ${start}`);
  }
  const re = new RegExp(
    `${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
  );
  return html.replace(re, `${start}\n    ${block}\n    ${end}`);
}

function ensureCss(html, cssAfter) {
  if (html.includes('experience-phases.css')) return html;
  const needle = `href="/interfaces/${cssAfter}"`;
  if (html.includes(needle)) {
    return html.replace(needle, `${needle} />\n  ${CSS_LINK}`);
  }
  return html.replace('</head>', `  ${CSS_LINK}\n</head>`);
}

const results = [];

for (const t of TARGETS) {
  let html = fs.readFileSync(t.file, 'utf8');
  html = ensureCss(html, t.cssAfter);
  html = patchBlock(html, t.markers, t.render());
  fs.writeFileSync(t.file, html);
  results.push({ file: path.relative(ROOT, t.file), ok: true });
}

console.log(JSON.stringify({ ok: true, patched: results }, null, 2));
