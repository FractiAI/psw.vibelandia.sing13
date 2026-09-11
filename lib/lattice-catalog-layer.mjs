/**
 * Infinite Octaves Omniversal Lattice Chat — AI stack catalog layer.
 *
 * Guest-facing band that stacks ABOVE SS Vibelandia cruise doors without
 * replacing Journey · Canvas · Jukebox · Reading Room · Creator Studio.
 * Architecture catalog: coordination fabric between agentic IDEs and data —
 * not a claim of infinite GPU-free scaling.
 */

export const LATTICE_CATALOG_LAYER = Object.freeze({
  id: 'ai-catalog-layer',
  kicker: 'AI stack · Catalog layer',
  title: 'Infinite Octaves Omniversal Lattice Chat',
  lead:
    'A new category layer in the AI stack — harmonic routing and resonant data coordination — layered over SS Vibelandia while the five cruise doors stay exactly where they are.',
  stackLine:
    'Models & IDEs → <strong>Infinite Octaves catalog layer</strong> → ship doors &amp; data',
  ctaPrimary: { href: '/lattice', label: 'Meet the layer' },
  ctaChat: { href: '/lattice-chat', label: 'Open Lattice Chat' },
  ctaPaper: {
    href: '/ship-blog/infinite-octave-ai-catalog-layer',
    label: 'Read the note',
  },
  ctaReading: {
    href: '/reading-room?category=lattice-catalog',
    label: 'Reading Room · this category',
  },
  honesty:
    'Catalog architecture for agentic coordination. Not a finished physics proof and not a promise that GPUs disappear.',
});

/** Compact CSS shared by injected bands (navy-gold cruise, not purple glow). */
export function renderLatticeCatalogLayerCss(prefix = 'lat-cat') {
  return `
    .${prefix}-layer {
      position: relative;
      z-index: 4;
      margin: 0;
      padding: 0.85rem 1.15rem 1rem;
      border-bottom: 1px solid rgba(201, 162, 39, 0.35);
      background:
        linear-gradient(105deg, rgba(8, 18, 40, 0.97) 0%, rgba(16, 42, 72, 0.94) 55%, rgba(12, 28, 52, 0.96) 100%);
      color: #f4efe3;
      font-family: "Source Serif 4", "Iowan Old Style", Palatino, Georgia, serif;
    }
    .${prefix}-layer__inner {
      max-width: 68rem;
      margin: 0 auto;
      display: grid;
      gap: 0.45rem 1.25rem;
    }
    @media (min-width: 720px) {
      .${prefix}-layer__inner {
        grid-template-columns: 1fr auto;
        align-items: end;
      }
    }
    .${prefix}-layer__kicker {
      display: inline-block;
      font-family: "DM Sans", "Avenir Next", "Segoe UI", sans-serif;
      font-size: 0.68rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #c9a227;
      margin: 0 0 0.2rem;
    }
    .${prefix}-layer__title {
      margin: 0;
      font-size: clamp(1.05rem, 2.4vw, 1.35rem);
      font-weight: 600;
      letter-spacing: 0.01em;
      color: #fff8e7;
      line-height: 1.25;
    }
    .${prefix}-layer__lead {
      margin: 0.15rem 0 0;
      font-size: 0.95rem;
      line-height: 1.45;
      color: rgba(244, 239, 227, 0.88);
      max-width: 46rem;
    }
    .${prefix}-layer__stack {
      margin: 0.35rem 0 0;
      font-family: "DM Sans", "Avenir Next", "Segoe UI", sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.02em;
      color: rgba(201, 162, 39, 0.95);
    }
    .${prefix}-layer__ctas {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem 0.65rem;
      align-items: center;
      justify-content: flex-start;
    }
    @media (min-width: 720px) {
      .${prefix}-layer__ctas { justify-content: flex-end; }
    }
    .${prefix}-layer__ctas a {
      font-family: "DM Sans", "Avenir Next", "Segoe UI", sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.04em;
      text-decoration: none;
      color: #081228;
      background: #c9a227;
      border: 1px solid #c9a227;
      padding: 0.42rem 0.75rem;
      border-radius: 2px;
    }
    .${prefix}-layer__ctas a:hover { background: #e0bc4a; border-color: #e0bc4a; }
    .${prefix}-layer__ctas a.${prefix}-layer__ghost {
      background: transparent;
      color: #f4efe3;
      border-color: rgba(244, 239, 227, 0.45);
    }
    .${prefix}-layer__ctas a.${prefix}-layer__ghost:hover {
      border-color: #c9a227;
      color: #c9a227;
    }
    .${prefix}-layer__honesty {
      grid-column: 1 / -1;
      margin: 0.15rem 0 0;
      font-size: 0.72rem;
      line-height: 1.35;
      color: rgba(244, 239, 227, 0.55);
    }
  `.replace(/\n\s+/g, '\n');
}

/** Full sitewide introduction band (QUESTFEST, Canvas, doors). */
export function renderLatticeCatalogLayerBandHtml({ compact = false } = {}) {
  const L = LATTICE_CATALOG_LAYER;
  const lead = compact
    ? 'New AI stack category — coordination fabric over the cruise doors, not a sixth door.'
    : L.lead;
  return `<!-- LATTICE_CATALOG_LAYER_START -->
  <aside class="lat-cat-layer" id="ai-catalog-layer" aria-label="${L.kicker}">
    <div class="lat-cat-layer__inner">
      <div class="lat-cat-layer__copy">
        <p class="lat-cat-layer__kicker">${L.kicker}</p>
        <p class="lat-cat-layer__title">${L.title}</p>
        <p class="lat-cat-layer__lead">${lead}</p>
        <p class="lat-cat-layer__stack">${L.stackLine}</p>
      </div>
      <div class="lat-cat-layer__ctas">
        <a href="${L.ctaPrimary.href}">${L.ctaPrimary.label}</a>
        <a class="lat-cat-layer__ghost" href="${L.ctaChat.href}">${L.ctaChat.label}</a>
        <a class="lat-cat-layer__ghost" href="${L.ctaPaper.href}">${L.ctaPaper.label}</a>
        <a class="lat-cat-layer__ghost" href="${L.ctaReading.href}">${L.ctaReading.label}</a>
      </div>
      <p class="lat-cat-layer__honesty">${L.honesty}</p>
    </div>
  </aside>
  <!-- LATTICE_CATALOG_LAYER_END -->`;
}

/** Marker pair used by sync scripts. */
export const LATTICE_CATALOG_LAYER_MARKERS = Object.freeze({
  start: '<!-- LATTICE_CATALOG_LAYER_START -->',
  end: '<!-- LATTICE_CATALOG_LAYER_END -->',
  styleStart: '<!-- LATTICE_CATALOG_LAYER_STYLE_START -->',
  styleEnd: '<!-- LATTICE_CATALOG_LAYER_STYLE_END -->',
});
