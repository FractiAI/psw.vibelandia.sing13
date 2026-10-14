/**
 * Fruit Layer legend for Hero · Source tree surfaces.
 * Soft Story catalog — pairs with infinite-octave-hero-source-tree.mjs
 */
import {
  FRUIT_LAYER_ANY_COMBINATION,
  FRUIT_LAYER_HREF,
  FRUIT_LAYER_TREE_ANATOMY,
  getFruitLayerStats,
  loadFruitLayerTaxonomy,
} from './fruit-layer-gifts.mjs';

export const FRUIT_LAYER_TREE_MARKERS = Object.freeze({
  start: '<!-- INFINITE_OCTAVE_FRUIT_LAYER_START -->',
  end: '<!-- INFINITE_OCTAVE_FRUIT_LAYER_END -->',
});

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderFruitLayerTreeCss(classPrefix = 'io-fruit-layer') {
  return `
    .${classPrefix} {
      margin: 1.1rem 0 1.4rem;
      padding: 0.65rem 0.85rem 0.75rem;
      border: 1px solid color-mix(in srgb, var(--vb-gold, #c9a227) 32%, transparent);
      font-size: 0.88rem;
      line-height: 1.45;
      max-width: 42rem;
    }
    .${classPrefix} h3 {
      margin: 0 0 0.45rem;
      font-size: 1.05rem;
      color: var(--vb-gold, #c9a227);
    }
    .${classPrefix}__stats {
      margin: 0 0 0.55rem;
      opacity: 0.92;
    }
    .${classPrefix}__mix {
      margin: 0.55rem 0 0;
      padding: 0.5rem 0.6rem;
      border-left: 3px solid var(--vb-gold, #c9a227);
    }
    .${classPrefix} details summary {
      cursor: pointer;
      font-weight: 700;
      color: var(--vb-gold, #c9a227);
    }
    .${classPrefix} ol {
      margin: 0.35rem 0 0;
      padding-left: 1.15rem;
    }
    .${classPrefix} li { margin: 0.18rem 0; }
  `.replace(/\n\s+/g, '\n');
}

/** Collapsible fruit-layer legend (section titles only on guest surfaces). */
export function renderFruitLayerTreeLegendHtml({
  sectionId = 'fruit-layer-tree-legend',
  classPrefix = 'io-fruit-layer',
  includeSectionList = true,
} = {}) {
  const stats = getFruitLayerStats();
  const taxonomy = loadFruitLayerTaxonomy();
  const anatomy = Object.entries(FRUIT_LAYER_TREE_ANATOMY)
    .map(([k, v]) => `<li><strong>${escapeHtml(k)}</strong> — ${escapeHtml(v)}</li>`)
    .join('\n');

  let sectionList = '';
  if (includeSectionList) {
    const items = taxonomy.sections
      .map(
        (s) =>
          `<li><strong>${escapeHtml(s.roman)}.</strong> ${escapeHtml(s.title)}${
            s.gifts.length ? ` (${s.gifts.length})` : ''
          }</li>`,
      )
      .join('\n');
    const xxvii =
      taxonomy.subsections?.XXVII?.map(
        (sub) =>
          `<li><strong>XXVII-${escapeHtml(sub.id)}.</strong> ${escapeHtml(sub.title)} (${sub.gifts.length})</li>`,
      ).join('\n') ?? '';
    sectionList = `<h4>Sections I–XXVII (working taxonomy)</h4><ol>${items}${xxvii}</ol>`;
  }

  return `${FRUIT_LAYER_TREE_MARKERS.start}
<section class="${classPrefix}" id="${sectionId}" aria-labelledby="${sectionId}-h">
  <h3 id="${sectionId}-h">Fruit Layer · gift taxonomy on the tree</h3>
  <p class="${classPrefix}__stats">${stats.giftCount} gifts · ${stats.sectionCount} sections · ${stats.metaOperatorCount} meta-operators · ${stats.signatureGiftCount} signature FHG gifts (1021–1042). <a href="${FRUIT_LAYER_HREF}">Full Fruit Layer map</a></p>
  <p class="${classPrefix}__mix"><strong>Any combination.</strong> ${escapeHtml(FRUIT_LAYER_ANY_COMBINATION)}</p>
  <details>
    <summary>Tree anatomy · where fruit hangs</summary>
    <ol>${anatomy}</ol>
    ${sectionList}
  </details>
</section>
${FRUIT_LAYER_TREE_MARKERS.end}`;
}
