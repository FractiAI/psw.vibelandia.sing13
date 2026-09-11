#!/usr/bin/env node
/**
 * Strip legacy Infinite Octaves AI catalog-layer chrome bands.
 * Content weave now lives in native surface copy (heroes, primers, host dispatch).
 * This script removes bolted asides + styles so sync does not re-inject chrome.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LATTICE_CATALOG_LAYER_MARKERS as M } from '../lib/lattice-catalog-layer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function stripMarked(html, start, end) {
  if (!html.includes(start) || !html.includes(end)) return html;
  const re = new RegExp(
    `${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`,
  );
  return html.replace(re, '');
}

function stripOrphans(html) {
  let next = html;
  next = next.replace(
    /<aside\s+class="lat-cat-layer"[^>]*>[\s\S]*?<\/aside>\s*/g,
    '',
  );
  next = next.replace(
    /<style\s+id="lat-cat-layer-style">[\s\S]*?<\/style>\s*/g,
    '',
  );
  return next;
}

const TARGETS = [
  'interfaces/vibelandia-questfest.html',
  'index.html',
  'interfaces/omniverse-canvas.html',
  'interfaces/lattice-v1618.html',
  'interfaces/journeys.html',
  'interfaces/reading-room.html',
  'interfaces/creator-studio.html',
  'interfaces/lattice-learn-more.html',
  'interfaces/lattice-brochure.html',
];

let n = 0;
for (const rel of TARGETS) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    console.warn(`skip missing ${rel}`);
    continue;
  }
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  html = stripMarked(html, M.start, M.end);
  html = stripMarked(html, M.styleStart, M.styleEnd);
  html = stripOrphans(html);
  if (html !== before) {
    fs.writeFileSync(file, html);
    n += 1;
    const leftover = html.includes('lat-cat-layer');
    console.log(`stripped ${rel}${leftover ? ' (WARN: lat-cat-layer remnant)' : ''}`);
  } else {
    console.log(`clean ${rel}`);
  }
}

console.log(`lattice-catalog-layer strip: ${n} surfaces updated`);
