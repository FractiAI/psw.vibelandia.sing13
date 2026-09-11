#!/usr/bin/env node
/**
 * Strip legacy bolted-on Infinite Octaves catalog-layer chrome bands.
 * Content weave lives in native surface copy; this script strips legacy chrome bands.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LATTICE_CATALOG_LAYER_MARKERS as M } from '../lib/lattice-catalog-layer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Remove a marked block (markers inclusive), including surrounding blank lines when present. */
function stripMarked(html, start, end) {
  if (!html.includes(start) || !html.includes(end)) return html;
  const re = new RegExp(
    `\\n?[ \\t]*${escapeRe(start)}[\\s\\S]*?${escapeRe(end)}[ \\t]*\\n?`,
  );
  return html.replace(re, '\n');
}

/** Orphan aside when markers are missing. */
function stripOrphanAside(html) {
  if (html.includes(M.start) && html.includes(M.end)) return html;
  return html.replace(
    /\n?[ \t]*<aside\b[^>]*\bclass="[^"]*\blat-cat-layer\b[^"]*"[^>]*>[\s\S]*?<\/aside>[ \t]*\n?/gi,
    '\n',
  );
}

/** Orphan style#lat-cat-layer-style when markers are missing. */
function stripOrphanStyle(html) {
  if (html.includes(M.styleStart) && html.includes(M.styleEnd)) return html;
  return html.replace(
    /\n?[ \t]*<style\b[^>]*\bid=["']lat-cat-layer-style["'][^>]*>[\s\S]*?<\/style>[ \t]*\n?/gi,
    '\n',
  );
}

function stripCatalogLayer(html) {
  let next = html;
  next = stripMarked(next, M.start, M.end);
  next = stripMarked(next, M.styleStart, M.styleEnd);
  next = stripOrphanAside(next);
  next = stripOrphanStyle(next);
  // Collapse accidental triple blank lines left by removals
  next = next.replace(/\n{3,}/g, '\n\n');
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

const stripped = [];
let n = 0;
for (const rel of TARGETS) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    console.warn(`skip missing ${rel}`);
    continue;
  }
  const before = fs.readFileSync(file, 'utf8');
  const after = stripCatalogLayer(before);
  const changed = after !== before;
  if (changed) {
    fs.writeFileSync(file, after);
    stripped.push(rel);
  }
  n += 1;
  const residual =
    after.includes('lat-cat-layer') ||
    after.includes(M.start) ||
    after.includes(M.styleStart);
  console.log(
    `${changed ? 'stripped' : 'clean'} ${rel}${residual ? ' (WARN: residual catalog chrome)' : ''}`,
  );
}

console.log(`lattice-catalog-layer: ${n} surfaces scanned, ${stripped.length} stripped`);
if (stripped.length) {
  console.log('stripped files:');
  for (const rel of stripped) console.log(`  ${rel}`);
}
