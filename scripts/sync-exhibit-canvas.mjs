#!/usr/bin/env node
/**
 * Inject journeys teaser into omniverse-canvas.html.
 * Host-layer / three-nested-spheres exhibit shells are no longer on the art landing
 * (Player 1 · SuperAI art welcome · human host first). Room doors remain under mode.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCanvasJourneysTeaserHtml } from '../lib/voyage-journeys.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANVAS = path.join(ROOT, 'interfaces', 'omniverse-canvas.html');

const MARKERS = {
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
html = patchBlock(html, MARKERS.journeys, renderCanvasJourneysTeaserHtml());
fs.writeFileSync(CANVAS, html);

console.log(JSON.stringify({ ok: true, canvas: 'interfaces/omniverse-canvas.html', shells: false }, null, 2));
