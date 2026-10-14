#!/usr/bin/env node
/**
 * Inject journeys teaser into omniverse-canvas.html.
 * Host-layer / three-nested-spheres exhibit shells are no longer on the art landing
 * (Player 1 · Super Intelligence art welcome · human host first). Room doors remain under mode.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCanvasJourneysTeaserHtml } from '../lib/voyage-journeys.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANVAS_PATHS = [
  path.join(ROOT, 'interfaces', 'omniverse-canvas.html'),
  path.join(ROOT, 'index.html'),
];

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

const block = renderCanvasJourneysTeaserHtml();
const updated = [];
for (const file of CANVAS_PATHS) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  html = patchBlock(html, MARKERS.journeys, block);
  fs.writeFileSync(file, html);
  updated.push(path.relative(ROOT, file));
}

console.log(JSON.stringify({ ok: true, canvas: updated, shells: false }, null, 2));
