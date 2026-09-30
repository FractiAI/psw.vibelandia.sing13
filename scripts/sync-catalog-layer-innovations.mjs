#!/usr/bin/env node
/**
 * Sync CATALOG_LAYER_INNOVATIONS + bell-curve figure HTML/CSS markers into guest surfaces.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
  renderCatalogLayerInnovationsCss,
  renderCatalogLayerInnovationsHtml,
  renderCatalogLayerBellCurveCss,
  renderCatalogLayerBellCurveFigureHtml,
  CATALOG_LAYER_BELL_CURVE_MARKERS,
} from '../lib/lattice-catalog-layer.mjs';

const SURFACES = [
  {
    rel: 'interfaces/infinite-octave-egs-catalog-brochure.html',
    place: 'before-innovations',
  },
  {
    rel: 'interfaces/infinite-octave-egs-catalog-briefing-portals.html',
    place: 'after-portal-stack-lede',
  },
  {
    rel: 'interfaces/lattice-v1618.html',
    place: 'lattice-intro',
  },
  {
    rel: 'interfaces/lattice-brochure.html',
    place: 'before-innovations',
  },
  {
    rel: 'interfaces/lattice-learn-more.html',
    place: 'before-innovations',
  },
  {
    rel: 'interfaces/blog-infinite-octave-ai-catalog-layer-2026-09.html',
    place: 'before-innovations',
  },
  {
    rel: 'interfaces/blog-infinite-octave-egs-catalog-2026-09.html',
    place: 'before-innovations',
  },
  {
    rel: 'interfaces/holographic-homeostasis-architects.html',
    place: 'architects-catalog',
    includeHeading: false,
  },
];

const css = renderCatalogLayerInnovationsCss();
const block = renderCatalogLayerInnovationsHtml();
const bellCss = renderCatalogLayerBellCurveCss();

function bellBlock(includeHeading = true) {
  return renderCatalogLayerBellCurveFigureHtml({ includeHeading });
}

const styleTag = `<style id="catalog-layer-bell-curve-style">${bellCss}</style>`;

function upsertBellStyle(html) {
  if (!html.includes('id="catalog-layer-bell-curve-style"')) {
    if (html.includes('</head>')) {
      return html.replace('</head>', `${styleTag}\n</head>`);
    }
    if (html.includes('id="catalog-layer-innovations-style"')) {
      return html.replace(
        /(<style id="catalog-layer-innovations-style">[\s\S]*?<\/style>)/,
        `$1\n${styleTag}`,
      );
    }
    return html;
  }
  return html.replace(/<style id="catalog-layer-bell-curve-style">[\s\S]*?<\/style>/, styleTag);
}

function ensureBellCurve(html, { place, includeHeading = true, rel }) {
  const figure = bellBlock(includeHeading !== false);

  if (html.includes(CATALOG_LAYER_BELL_CURVE_MARKERS.start)) {
    return html.replace(
      /<!-- CATALOG_LAYER_BELL_CURVE_START -->[\s\S]*?<!-- CATALOG_LAYER_BELL_CURVE_END -->/,
      figure,
    );
  }

  if (place === 'lattice-intro' && html.includes('id="ai-catalog-layer-intro"')) {
    return html.replace(
      /<section id="ai-catalog-layer-intro"[\s\S]*?<\/section>/,
      `<section id="ai-catalog-layer-intro" aria-labelledby="catalog-layer-bell-curve-h">
${figure}
      <p style="margin-top:1rem;max-width:42rem;">
        Executives see control and cost calm. Teams get sharper briefs. Customers only see faster, cleaner answers —
        they never have to learn Φ or the catalog math.
      </p>
      <p style="font-size:0.85rem;opacity:0.8;max-width:42rem;">
        Catalog architecture for agentic coordination — not a finished physics proof, and not a promise that GPUs disappear.
      </p>
      <p style="margin-top:1rem;">
        <a class="btn btn-primary" href="/infinite-octave-egs-catalog/briefing#portal-sandbox">Open the executive sandbox</a>
        <a class="btn btn-ghost" href="/infinite-octave-egs-catalog">EGS Catalog brochure</a>
        <a class="btn btn-ghost" href="/infinite-octave-players-guide">The Players Guide · Player 1</a>
        <a class="btn btn-ghost" href="/reading-room?category=lattice-catalog">Reading Room · this category</a>
        <a class="btn btn-ghost" href="/ship-blog/infinite-octave-ai-catalog-layer">Catalog layer note</a>
      </p>
    </section>`,
    );
  }

  if (place === 'after-portal-stack-lede') {
    if (/id="portal-stack-h"/.test(html)) {
      return html.replace(
        /(<h2 id="portal-stack-h">[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>)/,
        `$1\n${figure}`,
      );
    }
  }

  if (place === 'architects-catalog') {
    if (/<section id="catalog">/.test(html)) {
      return html.replace(/(<section id="catalog">\s*<h2>[\s\S]*?<\/h2>)/, `$1\n${figure}`);
    }
  }

  if (place === 'before-innovations' && html.includes('CATALOG_LAYER_INNOVATIONS_START')) {
    return html.replace(
      '<!-- CATALOG_LAYER_INNOVATIONS_START -->',
      `${figure}\n<!-- CATALOG_LAYER_INNOVATIONS_START -->`,
    );
  }

  console.error('could not place bell-curve markers:', rel);
  process.exitCode = 1;
  return html;
}

for (const surface of SURFACES) {
  const { rel } = surface;
  let html = readFileSync(rel, 'utf8');

  if (html.includes('CATALOG_LAYER_INNOVATIONS_START')) {
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
  } else if (surface.place !== 'architects-catalog') {
    console.error('missing innovations markers:', rel);
    process.exitCode = 1;
  }

  html = ensureBellCurve(html, surface);
  html = upsertBellStyle(html);
  writeFileSync(rel, html);
  console.log('synced', rel);
}
