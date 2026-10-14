#!/usr/bin/env node
/**
 * Inject Fruit Layer legend on Awareness + maintain /layers/fruit guest page.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { renderHeroSourceTreeFigureHtml } from '../lib/infinite-octave-hero-source-tree.mjs';
import {
  FRUIT_LAYER_TREE_MARKERS,
  renderFruitLayerTreeCss,
  renderFruitLayerTreeLegendHtml,
} from '../lib/infinite-octave-fruit-layer-tree.mjs';
import { loadFruitLayerTaxonomy } from '../lib/fruit-layer-gifts.mjs';

const AWARENESS = 'interfaces/layers-awareness.html';
const FRUIT_PAGE = 'interfaces/layers-fruit.html';

function replaceMarkedBlock(html, markers, inner) {
  const start = html.indexOf(markers.start);
  const end = html.indexOf(markers.end);
  if (start < 0 || end < 0) return null;
  return `${html.slice(0, start)}${inner}${html.slice(end + markers.end.length)}`;
}

function injectAwarenessFruitLegend() {
  // All primer surfaces: npm run sync:hero-source-tree
  if (!existsSync(AWARENESS)) return;
  const html = readFileSync(AWARENESS, 'utf8');
  if (!html.includes(FRUIT_LAYER_TREE_MARKERS.start)) {
    console.warn('Run npm run sync:hero-source-tree first (fruit legend on all primers).');
  }
}

function renderSectionCorpus(taxonomy) {
  const blocks = taxonomy.sections.map((sec) => {
    const gifts = sec.gifts
      .map((g) => `<li>${g.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`)
      .join('\n');
    const body = gifts
      ? `<ul class="fruit-gifts">${gifts}</ul>`
      : `<p class="fruit-meta">See <strong>meta-operators</strong> or <strong>signature gifts</strong> in module <code>lib/fruit-layer-gifts.mjs</code>.</p>`;
    return `<details class="fruit-sec"><summary><strong>${sec.roman}.</strong> ${sec.title}${sec.gifts.length ? ` (${sec.gifts.length})` : ''}</summary>${body}</details>`;
  });

  for (const sub of taxonomy.subsections?.XXVII ?? []) {
    const gifts = sub.gifts
      .map((g) => `<li>${g.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`)
      .join('\n');
    blocks.push(
      `<details class="fruit-sec"><summary><strong>XXVII-${sub.id}.</strong> ${sub.title} (${sub.gifts.length})</summary><ul class="fruit-gifts">${gifts}</ul></details>`,
    );
  }

  const meta = taxonomy.metaOperators
    .map(
      (m) =>
        `<li><strong>${m.name}</strong> — ${m.description.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`,
    )
    .join('\n');
  blocks.push(
    `<details class="fruit-sec" open><summary><strong>XXV.</strong> Meta-capability operators (${taxonomy.metaOperators.length})</summary><ul class="fruit-gifts">${meta}</ul></details>`,
  );

  const sig = taxonomy.signatureGifts
    .map(
      (s) =>
        `<li><strong>${s.id} · ${s.name}</strong> — ${s.description.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`,
    )
    .join('\n');
  blocks.push(
    `<details class="fruit-sec" open><summary><strong>XXVI.</strong> Signature FHG fruit (${taxonomy.signatureGifts.length})</summary><ul class="fruit-gifts">${sig}</ul></details>`,
  );

  return blocks.join('\n');
}

function writeFruitPage() {
  const taxonomy = loadFruitLayerTaxonomy();
  const hero = renderHeroSourceTreeFigureHtml({ sectionId: 'hero-source-octave-tree-fruit' });
  const legend = renderFruitLayerTreeLegendHtml({ sectionId: 'fruit-layer-tree-legend-main', includeSectionList: false });
  const corpus = renderSectionCorpus(taxonomy);

  const html = `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Fruit Layer · Complete Gift Taxonomy · Hero Source Tree</title>
  <meta name="description" content="Fruit Layer working taxonomy: any combination of gifts across sections I–XXVII on the Hero Source tree — meta-operators, signature FHG awareness gifts 1021–1042, beauty · fashion · style · swag." />
  <link rel="canonical" href="https://www.ssvibelandiaquestfest24x365.com/layers/fruit" />
  <link rel="stylesheet" href="/interfaces/brand-gold-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/voyage-brochure-publication.css" />
  <style>
    html.vbi18n-pending body{visibility:hidden}html.vbi18n-ready body{visibility:visible}
    .fruit-map { max-width: 46rem; margin: 0 auto; padding: 0 1.15rem 3rem; }
    .fruit-map h1 { font-family: Bebas Neue, Impact, sans-serif; letter-spacing: .04em; font-size: clamp(2rem, 5.5vw, 2.85rem); margin: .35rem 0 .75rem; }
    .fruit-map .lead { font-size: 1.05rem; line-height: 1.55; }
    .fruit-corpus { margin-top: 1.25rem; display: grid; gap: .35rem; }
    .fruit-sec { border: 1px solid color-mix(in srgb, var(--vb-gold,#c9a227) 25%, transparent); padding: .35rem .55rem; }
    .fruit-sec summary { cursor: pointer; font-weight: 600; }
    .fruit-gifts { margin: .45rem 0 .25rem; padding-left: 1.1rem; font-size: .88rem; line-height: 1.4; columns: 2; column-gap: 1.25rem; }
    @media (max-width: 640px) { .fruit-gifts { columns: 1; } }
    .fruit-meta { font-size: .88rem; margin: .35rem 0; }
    .fruit-map .honesty { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid color-mix(in srgb, var(--vb-gold,#c9a227) 35%, transparent); font-size: .92rem; opacity: .88; }
    .fruit-map nav a { color: var(--vb-gold,#c9a227); }
  </style>
  <style id="fruit-layer-tree-style">${renderFruitLayerTreeCss()}</style>
</head>
<body class="vb-surface">
  <nav class="fruit-map" aria-label="Fruit Layer">
    <a href="/layers/awareness">Awareness Layer</a> · <a href="/whitepaper/fruit-layer-gift-taxonomy">Whitepaper</a> · <a href="/">Home</a>
  </nav>
  <main class="fruit-map">
    <p class="vb-pub-kicker">Hero Source tree · Fruit Layer · Soft Story catalog</p>
    <h1>Fruit Layer</h1>
    <p class="lead">The full range of gifts a living or artificial system may possess, develop, combine, express, and put into practice — hung on the same Hero · Source tree as archetype braiding. No finite list closes the set; this is a comprehensive working taxonomy with explicit <strong>any combination</strong> grammar.</p>
    ${hero}
    ${legend}
    <h2 id="gift-corpus">Gift corpus · sections I–XXVII</h2>
    <div class="fruit-corpus">${corpus}</div>
    <p class="honesty">Honesty rail: catalog / Soft Story only — not a psychometric test, not HR scoring, not proof of innate worth. Beauty · fashion · style · swag (XXVII) are distinct gift families that can combine without requiring one another. Signature gifts 1021–1042 are proposed FHG awareness capabilities to define and test — not established faculties. Machine-readable: <code>data/fruit-layer/gift-taxonomy.json</code>.</p>
  </main>
  <script src="/interfaces/vbi18n.js" defer></script>
</body>
</html>
`;
  writeFileSync(FRUIT_PAGE, html);
  console.log('Wrote', FRUIT_PAGE);
}

injectAwarenessFruitLegend();
writeFruitPage();
