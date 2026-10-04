#!/usr/bin/env node
/**
 * Inject Hero · Source · Octave tree chart into all Infinite Octave primer surfaces.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
  HERO_SOURCE_TREE_MARKERS,
  renderHeroSourceTreeCss,
  renderHeroSourceTreeFigureHtml,
} from '../lib/infinite-octave-hero-source-tree.mjs';

/** Every Infinite Octave primer / how-it-works surface that should carry the tree. */
const SURFACES = [
  {
    rel: 'interfaces/layers-awareness.html',
    place: 'after-primer-h2',
    h2Id: 'awareness-primer',
  },
  {
    rel: 'interfaces/layers-fractal.html',
    place: 'after-primer-h2',
    h2Id: 'fractal-primer',
  },
  {
    rel: 'interfaces/layers-holographic.html',
    place: 'after-primer-h2',
    h2Id: 'holographic-primer',
  },
  {
    rel: 'interfaces/layers-goldilocks.html',
    place: 'after-primer-h2',
    h2Id: 'goldilocks-primer',
  },
  {
    rel: 'interfaces/layers-superai.html',
    place: 'after-primer-h2',
    h2Id: 'superai-primer',
  },
  {
    rel: 'interfaces/infinite-octave-players-guide.html',
    place: 'after-part1-h2',
  },
  {
    rel: 'interfaces/lattice-learn-more.html',
    place: 'after-reading-time',
  },
  {
    rel: 'interfaces/omni-lattice-textbook.html',
    place: 'after-foundations-h2',
  },
  {
    rel: 'interfaces/infinite-octave-egs-catalog-brochure.html',
    place: 'before-innovations-or-after-lede',
  },
  {
    rel: 'interfaces/infinite-octave-egs-catalog-briefing-portals.html',
    place: 'after-portal-stack-lede',
  },
  {
    rel: 'interfaces/partials/catalog-synthesis-primer.html',
    place: 'after-primer-title',
  },
  {
    rel: 'interfaces/lattice-brochure.html',
    place: 'before-innovations-or-after-lede',
  },
  {
    rel: 'interfaces/lattice-v1618.html',
    place: 'lattice-intro',
  },
];

const css = renderHeroSourceTreeCss();
const styleTag = `<style id="infinite-octave-hero-source-tree-style">${css}</style>`;

function figureBlock() {
  return renderHeroSourceTreeFigureHtml({ includeHeading: true });
}

function upsertStyle(html) {
  if (html.includes('id="infinite-octave-hero-source-tree-style"')) {
    return html.replace(
      /<style id="infinite-octave-hero-source-tree-style">[\s\S]*?<\/style>/,
      styleTag,
    );
  }
  if (html.includes('</head>')) {
    return html.replace('</head>', `${styleTag}\n</head>`);
  }
  // Partials without <head>: prepend style once for consumers that inline the partial.
  if (!html.includes(styleTag)) {
    return `${styleTag}\n${html}`;
  }
  return html;
}

function replaceOrInsert(html, { place, h2Id, rel }) {
  const figure = figureBlock();

  if (html.includes(HERO_SOURCE_TREE_MARKERS.start)) {
    return html.replace(
      /<!-- INFINITE_OCTAVE_HERO_SOURCE_TREE_START -->[\s\S]*?<!-- INFINITE_OCTAVE_HERO_SOURCE_TREE_END -->/,
      figure,
    );
  }

  if (place === 'after-primer-h2' && h2Id) {
    const re = new RegExp(`(<h2 id="${h2Id}"[^>]*>[\\s\\S]*?<\\/h2>)`);
    if (re.test(html)) {
      return html.replace(re, `$1\n${figure}`);
    }
  }

  if (place === 'after-part1-h2') {
    if (/id="part1-h"/.test(html)) {
      return html.replace(/(<h2 id="part1-h">[\s\S]*?<\/h2>)/, `$1\n${figure}`);
    }
  }

  if (place === 'after-reading-time') {
    if (/class="reading-time"/.test(html)) {
      return html.replace(
        /(<p class="reading-time">[\s\S]*?<\/p>)/,
        `$1\n${figure}`,
      );
    }
  }

  if (place === 'after-foundations-h2') {
    if (/id="foundations-title"/.test(html)) {
      return html.replace(
        /(<h2 id="foundations-title">[\s\S]*?<\/h2>)/,
        `$1\n${figure}`,
      );
    }
  }

  if (place === 'after-primer-title') {
    if (/id="catalog-primer-title"/.test(html)) {
      return html.replace(
        /(<h2 id="catalog-primer-title">[\s\S]*?<\/h2>)/,
        `$1\n${figure}`,
      );
    }
  }

  if (place === 'after-portal-stack-lede') {
    if (/id="portal-stack-h"/.test(html)) {
      return html.replace(
        /(<h2 id="portal-stack-h">[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>)/,
        `$1\n${figure}`,
      );
    }
  }

  if (place === 'before-innovations-or-after-lede') {
    if (html.includes('CATALOG_LAYER_INNOVATIONS_START')) {
      return html.replace(
        '<!-- CATALOG_LAYER_INNOVATIONS_START -->',
        `${figure}\n<!-- CATALOG_LAYER_INNOVATIONS_START -->`,
      );
    }
    if (html.includes('CATALOG_LAYER_BELL_CURVE_START')) {
      return html.replace(
        '<!-- CATALOG_LAYER_BELL_CURVE_START -->',
        `${figure}\n<!-- CATALOG_LAYER_BELL_CURVE_START -->`,
      );
    }
    // Fall back: first main h1/h2 block
    if (/<main[\s\S]*?<h1[\s\S]*?<\/h1>/.test(html)) {
      return html.replace(/(<main[\s\S]*?<h1[\s\S]*?<\/h1>)/, `$1\n${figure}`);
    }
  }

  if (place === 'lattice-intro') {
    if (html.includes('id="ai-catalog-layer-intro"')) {
      return html.replace(
        /(<section id="ai-catalog-layer-intro"[^>]*>)/,
        `$1\n${figure}`,
      );
    }
    if (html.includes('CATALOG_LAYER_BELL_CURVE_START')) {
      return html.replace(
        '<!-- CATALOG_LAYER_BELL_CURVE_START -->',
        `${figure}\n<!-- CATALOG_LAYER_BELL_CURVE_START -->`,
      );
    }
  }

  console.error('could not place hero-source tree:', rel, place);
  process.exitCode = 1;
  return html;
}

let ok = 0;
for (const surface of SURFACES) {
  const { rel } = surface;
  let html = readFileSync(rel, 'utf8');
  html = replaceOrInsert(html, surface);
  html = upsertStyle(html);
  writeFileSync(rel, html);
  if (html.includes(HERO_SOURCE_TREE_MARKERS.start)) {
    console.log('synced', rel);
    ok += 1;
  }
}

console.log(`hero-source tree synced on ${ok}/${SURFACES.length} surfaces`);
if (ok !== SURFACES.length) process.exitCode = 1;
