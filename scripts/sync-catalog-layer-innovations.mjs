#!/usr/bin/env node
/**
 * Sync CATALOG_LAYER_INNOVATIONS HTML/CSS markers into guest surfaces.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
  renderCatalogLayerInnovationsCss,
  renderCatalogLayerInnovationsHtml,
} from '../lib/lattice-catalog-layer.mjs';

const SURFACES = [
  'interfaces/infinite-octave-egs-catalog-brochure.html',
  'interfaces/infinite-octave-egs-catalog-briefing-portals.html',
  'interfaces/lattice-v1618.html',
  'interfaces/lattice-brochure.html',
  'interfaces/lattice-learn-more.html',
  'interfaces/blog-infinite-octave-ai-catalog-layer-2026-09.html',
  'interfaces/blog-infinite-octave-egs-catalog-2026-09.html',
];

const css = renderCatalogLayerInnovationsCss();
const block = renderCatalogLayerInnovationsHtml();

for (const rel of SURFACES) {
  let html = readFileSync(rel, 'utf8');
  if (!html.includes('CATALOG_LAYER_INNOVATIONS_START')) {
    console.error('missing markers:', rel);
    process.exitCode = 1;
    continue;
  }
  if (html.includes('id="catalog-layer-innovations-style"')) {
    html = html.replace(
      /<style id="catalog-layer-innovations-style">[\s\S]*?<\/style>/,
      `<style id="catalog-layer-innovations-style">${css}</style>`,
    );
  }
  html = html.replace(
    /<!-- CATALOG_LAYER_INNOVATIONS_START -->[\s\S]*?<!-- CATALOG_LAYER_INNOVATIONS_END -->/,
    block,
  );
  writeFileSync(rel, html);
  console.log('synced', rel);
}
