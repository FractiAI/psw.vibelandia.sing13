#!/usr/bin/env node
/**
 * Sync catalog-layer innovations CSS+HTML into guest surfaces that already
 * carry CATALOG_LAYER_INNOVATIONS markers / style id.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CATALOG_LAYER_INNOVATIONS_MARKERS,
  renderCatalogLayerInnovationsCss,
  renderCatalogLayerInnovationsHtml,
} from '../lib/lattice-catalog-layer.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const TARGETS = [
  'interfaces/lattice-v1618.html',
  'interfaces/blog-infinite-octave-ai-catalog-layer-2026-09.html',
  'interfaces/infinite-octave-egs-catalog-brochure.html',
  'interfaces/infinite-octave-egs-catalog-briefing-portals.html',
  'interfaces/blog-infinite-octave-egs-catalog-2026-09.html',
  'interfaces/prime-vault-demos.html',
  'interfaces/lattice-brochure.html',
  'interfaces/lattice-learn-more.html',
];

const css = renderCatalogLayerInnovationsCss();
const html = renderCatalogLayerInnovationsHtml();
const { start, end, styleId } = CATALOG_LAYER_INNOVATIONS_MARKERS;

function replaceStyle(src) {
  const re = new RegExp(
    `<style id="${styleId}">[\\s\\S]*?<\\/style>`,
    'm',
  );
  const next = `<style id="${styleId}">\n${css}\n  </style>`;
  if (!re.test(src)) {
    throw new Error(`missing <style id="${styleId}">`);
  }
  return src.replace(re, next);
}

function replaceBlock(src) {
  const i = src.indexOf(start);
  const j = src.indexOf(end);
  if (i < 0 || j < 0 || j < i) {
    throw new Error('missing innovations markers');
  }
  return `${src.slice(0, i)}${html}${src.slice(j + end.length)}`;
}

let ok = 0;
for (const rel of TARGETS) {
  const path = join(root, rel);
  let src = readFileSync(path, 'utf8');
  src = replaceStyle(src);
  src = replaceBlock(src);
  writeFileSync(path, src);
  console.log(`synced ${rel}`);
  ok += 1;
}
console.log(`catalog-layer innovations synced: ${ok} files`);
