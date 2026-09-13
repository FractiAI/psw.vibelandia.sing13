/**
 * Infinite Octaves Omniversal Lattice Chat — AI stack catalog layer.
 *
 * Band HTML helpers remain for tests/archive but sitewide chrome is retired
 * in favor of native content weave. Architecture catalog: coordination fabric
 * between agentic IDEs and data — not a claim of infinite GPU-free scaling.
 */

export const LATTICE_CATALOG_LAYER = Object.freeze({
  id: 'ai-catalog-layer',
  kicker: 'AI stack · Catalog layer',
  title: 'Infinite Octaves Omniversal Lattice Chat',
  lead:
    'A new category layer in the AI stack — harmonic routing and resonant data coordination — woven through SS Vibelandia while the five cruise doors stay exactly where they are.',
  stackLine:
    'Models & IDEs → <strong>Infinite Octaves catalog layer</strong> → ship doors &amp; data',
  ctaPrimary: { href: '/lattice#ai-catalog-layer-intro', label: 'Meet the layer' },
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

/** Plain-language copy constants for editors weaving catalog layer into native surface copy. */
export const LATTICE_CATALOG_LAYER_CONTENT = Object.freeze({
  stackLinePlain: 'Models & agentic IDEs → Infinite Octaves catalog layer → ship doors & resonant data',
  oneLiner: 'Infinite Octaves Omniversal Lattice Chat is the new catalog layer in the AI stack — harmonic routing between agentic IDEs and ship data, layered through SS Vibelandia without becoming a sixth cruise door.',
  honestyShort: 'Catalog architecture for agentic coordination — not a finished physics proof, and not a promise that GPUs disappear.',
});

/**
 * Four key architectural innovations featured wherever the catalog layer is introduced.
 * Guest labels map to nearest Infinite Octaves corpus shelves (honesty-bound Soft Story).
 */
export const CATALOG_LAYER_INNOVATIONS = Object.freeze([
  Object.freeze({
    id: 'volumetric-interference',
    title: 'Volumetric interference processing',
    guestLabel: 'Prime-indexed volumetric vaults · zero ISI grammar',
    delivers:
      'Algebraic Φ-map filing of payloads into prime-indexed volumetric vaults — absolute orthogonality framed as zero inter-symbol interference in the prime-vault grammar.',
    withoutIt:
      'Without this shelf you stay on RS/LDPC parity taxes and LBA/B⁺-tree lookup habits; you cannot file memory as Infinite Octaves prime-vault orthogonality.',
    href: '/ship-blog/prime-indexed-volumetric-storage',
    hrefLabel: 'Volumetric storage note',
    honestyBite: 'Catalog framing — not a JEDEC drop-in or measured ECC retirement.',
  }),
  Object.freeze({
    id: 'golden-ratio-cataloging',
    title: 'Golden ratio cataloging',
    guestLabel: 'Φ_EGS ≈ 1.618 recursive nesting',
    delivers:
      'Closed-form harmonic nesting between agentic IDEs and resonant data — context as multi-dimensional standing-wave maps keyed by El Gran Sol’s fractal constant.',
    withoutIt:
      'Without Φ_EGS cataloging you remain trapped in the brute-force treadmill vs regulatory-moat binary; you cannot file a third mediation path with absolute structural nesting order.',
    href: '/infinite-octave-egs-catalog',
    hrefLabel: 'EGS Catalog brochure',
    honestyBite: 'Design / catalog key — not a CODATA replacement for ħ, c, or G.',
  }),
  Object.freeze({
    id: 'prime-container-storage',
    title: 'Prime container geometrical storage',
    guestLabel: 'Odd-prime containment vaults · geometry sketch',
    delivers:
      'Replayable non-gradient prime-vault containment that maps sequences into odd-prime geometrical vaults under Φ_EGS — Soft Story contrast to brute-force conformational search.',
    withoutIt:
      'Without prime-container geometry you only have statistical/MSA predictors; you cannot file a closed-form Infinite Octaves containment sketch as architecture grammar.',
    href: '/ship-blog/protein-folding-prime-container',
    hrefLabel: 'Prime-container note',
    honestyBite: 'Architecture Soft Story — not CASP gold, not clinical, not AlphaFold retirement.',
  }),
  Object.freeze({
    id: 'holographic-rhyme-wiring',
    title: 'Holographic rhyme wiring',
    guestLabel: 'Four-pillar rhyme · Tier C wiring lattices',
    delivers:
      'Enforceable repeating · self-similar · self-correcting · recursive motion grammar plus load-bearing narrative pointer circuits that route agent intent across catalog boundaries.',
    withoutIt:
      'Without holographic rhyme wiring, “holographic” stays a free-floating adjective and narrative shelves stay inert archives — agents re-paste fat dumps instead of routing by wired briefs.',
    href: '/ship-blog/holographic-rhyme',
    hrefLabel: 'Holographic rhyme note',
    hrefSecondary: '/ship-blog/tier-c-holographic-wiring',
    hrefSecondaryLabel: 'Tier C wiring',
    honestyBite: 'Catalog motion + wiring grammar — not a claim that prose causes physics.',
  }),
]);

export const CATALOG_LAYER_INNOVATIONS_HONESTY =
  'Four catalog-layer innovations as Infinite Octaves Soft Story architecture — not finished physics, fab, or JEDEC proofs. Human emergency still outranks algorithms.';

/** Compact navy–gold CSS for catalog-layer innovation grids (no purple glow). */
export function renderCatalogLayerInnovationsCss(classPrefix = 'cat-innov') {
  return `
    .${classPrefix} { margin: 1.5rem 0 0; }
    .${classPrefix}__lead { margin: 0 0 1rem; max-width: 42rem; line-height: 1.45; }
    .${classPrefix}__grid {
      display: grid;
      gap: 0.85rem;
      grid-template-columns: 1fr;
    }
    @media (min-width: 720px) {
      .${classPrefix}__grid { grid-template-columns: 1fr 1fr; }
    }
    .${classPrefix}__card {
      margin: 0;
      padding: 0.9rem 1rem 1rem;
      border: 1px solid rgba(201, 162, 39, 0.35);
      background: rgba(8, 18, 40, 0.55);
      border-radius: 2px;
    }
    .${classPrefix}__title {
      margin: 0 0 0.25rem;
      font-size: 1.05rem;
      color: #fff8e7;
      line-height: 1.25;
    }
    .${classPrefix}__label {
      margin: 0 0 0.55rem;
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #c9a227;
    }
    .${classPrefix}__delivers,
    .${classPrefix}__without {
      margin: 0 0 0.45rem;
      font-size: 0.9rem;
      line-height: 1.4;
      color: rgba(244, 239, 227, 0.9);
    }
    .${classPrefix}__links { margin: 0.35rem 0; font-size: 0.82rem; }
    .${classPrefix}__links a { color: #c9a227; margin-right: 0.75rem; }
    .${classPrefix}__honesty,
    .${classPrefix}__rail {
      margin: 0.35rem 0 0;
      font-size: 0.72rem;
      line-height: 1.35;
      color: rgba(244, 239, 227, 0.55);
    }
  `.replace(/\n\s+/g, '\n');
}

/** Compact HTML section for guest surfaces (navy–gold; no purple glow). */
export function renderCatalogLayerInnovationsHtml({
  headingId = 'catalog-layer-innovations-h',
  sectionId = 'catalog-layer-innovations',
  classPrefix = 'cat-innov',
} = {}) {
  const items = CATALOG_LAYER_INNOVATIONS.map((inn) => {
    const secondary = inn.hrefSecondary
      ? ` <a href="${inn.hrefSecondary}">${inn.hrefSecondaryLabel}</a>`
      : '';
    return `<article class="${classPrefix}__card" id="${inn.id}">
  <h3 class="${classPrefix}__title">${inn.title}</h3>
  <p class="${classPrefix}__label">${inn.guestLabel}</p>
  <p class="${classPrefix}__delivers"><strong>Delivers:</strong> ${inn.delivers}</p>
  <p class="${classPrefix}__without"><strong>Cannot achieve without it:</strong> ${inn.withoutIt}</p>
  <p class="${classPrefix}__links"><a href="${inn.href}">${inn.hrefLabel}</a>${secondary}</p>
  <p class="${classPrefix}__honesty">${inn.honestyBite}</p>
</article>`;
  }).join('\n');

  return `<!-- CATALOG_LAYER_INNOVATIONS_START -->
<section class="${classPrefix}" id="${sectionId}" aria-labelledby="${headingId}">
  <h2 id="${headingId}">Key architectural innovations</h2>
  <p class="${classPrefix}__lead">What the Infinite Octaves catalog layer files that linear-only stacks cannot — each with what you lose if you skip it.</p>
  <div class="${classPrefix}__grid">
${items}
  </div>
  <p class="${classPrefix}__rail">${CATALOG_LAYER_INNOVATIONS_HONESTY}</p>
</section>
<!-- CATALOG_LAYER_INNOVATIONS_END -->`;
}

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
