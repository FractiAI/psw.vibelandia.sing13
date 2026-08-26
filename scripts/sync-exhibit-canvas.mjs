#!/usr/bin/env node
/**
 * Inject rich three-shells section + journeys teaser into omniverse-canvas.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCanvasShellsSectionHtml } from '../lib/exhibit-shells.mjs';
import { renderCanvasJourneysTeaserHtml } from '../lib/voyage-journeys.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANVAS = path.join(ROOT, 'interfaces', 'omniverse-canvas.html');

const MARKERS = {
  shells: ['<!-- CANVAS_EXHIBIT_SHELLS_BEGIN -->', '<!-- CANVAS_EXHIBIT_SHELLS_END -->'],
  journeys: ['<!-- CANVAS_JOURNEYS_TEASER_BEGIN -->', '<!-- CANVAS_JOURNEYS_TEASER_END -->'],
};

function patchBlock(html, [start, end], block) {
  if (!html.includes(start) || !html.includes(end)) {
    throw new Error(`Markers not found: ${start}`);
  }
  const re = new RegExp(
    `${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
  );
  return html.replace(re, `${start}\n    ${block}\n    ${end}`);
}

let html = fs.readFileSync(CANVAS, 'utf8');

if (!html.includes('exhibit-shells.css')) {
  html = html.replace(
    '<link rel="stylesheet" href="/interfaces/voyage-brochure-publication.css" />',
    '<link rel="stylesheet" href="/interfaces/voyage-brochure-publication.css" />\n  <link rel="stylesheet" href="/interfaces/exhibit-shells.css" />',
  );
}

html = patchBlock(html, MARKERS.shells, renderCanvasShellsSectionHtml());
html = patchBlock(html, MARKERS.journeys, renderCanvasJourneysTeaserHtml());

fs.writeFileSync(CANVAS, html);

console.log(JSON.stringify({ ok: true, canvas: 'interfaces/omniverse-canvas.html' }, null, 2));
