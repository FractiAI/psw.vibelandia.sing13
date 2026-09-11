#!/usr/bin/env node
/**
 * Inject Infinite Octaves AI catalog-layer band sitewide.
 * Preserves five cruise doors; stacks the layer above heroes / after CEO asides.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LATTICE_CATALOG_LAYER_MARKERS as M,
  renderLatticeCatalogLayerBandHtml,
  renderLatticeCatalogLayerCss,
} from '../lib/lattice-catalog-layer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function patchMarked(html, start, end, block) {
  if (html.includes(start) && html.includes(end)) {
    const re = new RegExp(
      `${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    );
    return html.replace(re, block.trim());
  }
  return null;
}

function ensureStyle(html) {
  const styleBlock = `${M.styleStart}\n<style id="lat-cat-layer-style">${renderLatticeCatalogLayerCss()}</style>\n${M.styleEnd}`;
  const patched = patchMarked(html, M.styleStart, M.styleEnd, styleBlock);
  if (patched) return patched;
  if (html.includes('</head>')) {
    return html.replace('</head>', `  ${styleBlock}\n</head>`);
  }
  return html;
}

function insertAfterCeoAside(html, band, ceoClass) {
  const needle = `class="${ceoClass}"`;
  const idx = html.indexOf(needle);
  if (idx < 0) return null;
  const close = html.indexOf('</aside>', idx);
  if (close < 0) return null;
  const at = close + '</aside>'.length;
  return `${html.slice(0, at)}\n\n  ${band}\n${html.slice(at)}`;
}

function insertAfterBanner(html, band) {
  if (html.includes('<!-- SITE_TOP_BANNER_END -->')) {
    return html.replace(
      '<!-- SITE_TOP_BANNER_END -->',
      `<!-- SITE_TOP_BANNER_END -->\n\n  ${band}`,
    );
  }
  return null;
}

function insertAfterBody(html, band) {
  if (/<body[^>]*>/.test(html)) {
    return html.replace(/<body[^>]*>/, (m) => `${m}\n  ${band}`);
  }
  return null;
}

function insertAfterTopnav(html, band) {
  // lattice-v1618: after closing </nav> of topnav
  const m = html.match(/<nav class="topnav"[\s\S]*?<\/nav>/);
  if (m) {
    return html.replace(m[0], `${m[0]}\n\n  ${band}`);
  }
  return null;
}

function ensureBand(html, { ceoClass = null, prefer = 'ceo', compact = false } = {}) {
  const band = renderLatticeCatalogLayerBandHtml({ compact });
  const patched = patchMarked(html, M.start, M.end, band);
  if (patched) return patched;

  if (prefer === 'ceo' && ceoClass) {
    const next = insertAfterCeoAside(html, band, ceoClass);
    if (next) return next;
  }
  if (prefer === 'topnav') {
    const next = insertAfterTopnav(html, band);
    if (next) return next;
  }
  const afterBanner = insertAfterBanner(html, band);
  if (afterBanner) return afterBanner;
  const afterBody = insertAfterBody(html, band);
  if (afterBody) return afterBody;
  return html;
}

const TARGETS = [
  {
    rel: 'interfaces/vibelandia-questfest.html',
    ceoClass: 'ship-ceo-announcement',
    prefer: 'ceo',
    compact: false,
  },
  { rel: 'index.html', ceoClass: 'canvas-ceo-announcement', prefer: 'ceo', compact: false },
  {
    rel: 'interfaces/omniverse-canvas.html',
    ceoClass: 'canvas-ceo-announcement',
    prefer: 'ceo',
    compact: false,
  },
  { rel: 'interfaces/lattice-v1618.html', prefer: 'topnav', compact: false },
  { rel: 'interfaces/journeys.html', prefer: 'banner', compact: true },
  { rel: 'interfaces/reading-room.html', prefer: 'banner', compact: true },
  { rel: 'interfaces/creator-studio.html', prefer: 'banner', compact: true },
  { rel: 'interfaces/lattice-learn-more.html', prefer: 'topnav', compact: true },
  { rel: 'interfaces/lattice-brochure.html', prefer: 'topnav', compact: true },
];

let n = 0;
for (const t of TARGETS) {
  const file = path.join(ROOT, t.rel);
  if (!fs.existsSync(file)) {
    console.warn(`skip missing ${t.rel}`);
    continue;
  }
  let html = fs.readFileSync(file, 'utf8');
  html = ensureStyle(html);
  html = ensureBand(html, {
    ceoClass: t.ceoClass || null,
    prefer: t.prefer,
    compact: Boolean(t.compact),
  });
  fs.writeFileSync(file, html);
  n += 1;
  const has = html.includes('lat-cat-layer');
  console.log(`synced ${t.rel}${has ? '' : ' (WARN: band missing)'}`);
}

console.log(`lattice-catalog-layer: ${n} surfaces`);
