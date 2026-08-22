/**
 * SS Vibelandia · Holographic decks & cabin directory (brochure §14–22)
 * Deck rows + cabin SKUs with full serial lists and poster images.
 */
import { VOYAGE_DOOR_SPINE } from './voyage-doors.mjs';
import { SITE_HOME_HREF, SITE_HOME_LABEL } from './site-brand.mjs';

/** @typedef {'deck' | 'cabin' | 'directory'} VoyageDirectoryKind */

/**
 * @typedef {object} VoyageDeck
 * @property {string} slug
 * @property {string} label
 * @property {string} shortLabel
 * @property {string} tags
 * @property {string} lead
 * @property {string[]} body
 * @property {string} image
 * @property {string} imageAlt
 * @property {string[]} cabinSlugs
 * @property {{ label: string; href: string }[]} actions
 */

/**
 * @typedef {object} VoyageCabin
 * @property {string} slug
 * @property {string} skuDisplay
 * @property {string} name
 * @property {string} deckSlug
 * @property {string} lead
 * @property {string[]} body
 * @property {string[]} serials
 * @property {string} image
 * @property {string} imageAlt
 * @property {{ label: string; href: string }[]} actions
 */

const HERO_SHIP = '/interfaces/assets/questfest-hero-ss-vibelandia-cruiseship.png';
const EVENING_CRUISE = '/interfaces/assets/ssvibelandia-cruise-evening.png';
const PUERTO_RENO = '/interfaces/assets/questfest-hero-ss-vibelandia-puerto-reno.png';
const JUKEBOX = '/interfaces/assets/jukebox-golden-era-1940s.png';
const LATTICE_THEATER = '/interfaces/assets/questfest-2026-player1-lattice-theater.png';
const VALET_HOST = '/interfaces/assets/questfest-crew/valet-pru-guayabera-panama.jpg';
const DOCK = '/interfaces/assets/questfest-crew/puerto-reno-dock.png';

/** @param {string} prefix @param {number} start @param {number} end */
export function expandSerialRange(prefix, start, end) {
  const out = [];
  for (let n = start; n <= end; n += 1) {
    out.push(`${prefix}-${String(n).padStart(3, '0')}`);
  }
  return out;
}

/** @type {VoyageDeck[]} */
export const VOYAGE_DECKS = [
  {
    slug: 'deck-9-summit',
    label: 'Deck 9 — Summit',
    shortLabel: '9 Summit',
    tags:
      'Vision · science · creation · leadership · Acoustic Studio · Holographic Lab · Deep Memory Library · Rapid Workshop',
    lead: 'The top deck — where vision, lab, library, and workshop meet. Deep Memory is ship-blog and papers in plain speak.',
    body: [
      'Summit is Deck 9: science, creation, leadership without turning leadership into a throne. The Captain’s metaphor does not outrank a human emergency.',
      'Doors here: whitepapers, ship-blog notes, Lattice research mode, acoustic studio, holographic lab, rapid workshop.',
      'Cabins on this band: PH-001 Captain’s Grand Penthouse · PH-101–108 El Gran Sol · CC-201–224 Captiva Cove (summit-adjacent beachfront).',
      'Players examine patterns. NPCs inhabit the view. Both belong.',
    ],
    image: HERO_SHIP,
    imageAlt: 'SS Vibelandia resort vessel at sunset — Summit deck',
    cabinSlugs: ['ph-001', 'ph-101-108', 'cc-201-224'],
    actions: [
      { label: 'Ship blog · Deep Memory', href: '/questfest#ship-blog' },
      { label: 'Papers', href: '/papers' },
      { label: 'Lattice Chat · Deck 2', href: '/lattice-chat/' },
    ],
  },
  {
    slug: 'deck-8-veranda',
    label: 'Deck 8 — Veranda',
    shortLabel: '8 Veranda',
    tags: 'Family · comfort · private space · Collaborate · household nodes',
    lead: 'Private life and family life in balance — Veranda is where household nodes breathe.',
    body: [
      'Deck 8 is family, comfort, and intentional private space. Model B household support lives here.',
      'Collaborate keeps private threads on the same Hull — Deck 8 Veranda, not a separate world.',
      'Primary cabin band: RR-301–340 South Seas Veranda Condos — private life ↔ family life.',
      'You remain you. Voluntary belonging. No surrender of identity to join the tribe.',
    ],
    image: VALET_HOST,
    imageAlt: 'Valet Pru — hospitality on the Veranda deck',
    cabinSlugs: ['rr-301-340'],
    actions: [
      { label: 'Collaborate', href: '/lattice-chat/?mode=collaborate' },
      { label: 'Hire a valet concierge', href: '/hire-a-goldilocks-valet-concierge' },
      { label: 'Full brochure', href: '/frontiersman-voyage' },
    ],
  },
  {
    slug: 'deck-6-7-horizon',
    label: 'Decks 6–7 — Horizon',
    shortLabel: '6–7 Horizon',
    tags: 'Living · social · recreation · balcony & oceanview quarters',
    lead: 'Living and social life — balcony quarters, recreation, the ordinary days that feel like Friday.',
    body: [
      'Horizon decks are where daily life happens: social rhythm, recreation, oceanview quarters.',
      'Landfalls connect here — Cartagena, Sierra, Tahoe, Sin City as network nodes, not one harbor.',
      'Every day can be Friday: music on Monday, adventure on Tuesday, rest as productive.',
      'NPCs inhabit the rhythm. Players notice when the pattern shifts.',
    ],
    image: DOCK,
    imageAlt: 'Puerto Reno dock — Horizon living on the network vessel',
    cabinSlugs: [],
    actions: [
      { label: `${SITE_HOME_LABEL} voyage`, href: '/questfest' },
      { label: 'Listen · jukebox', href: '/listen' },
      { label: 'Frontier guide', href: '/questfest-2026-frontier-guide' },
    ],
  },
  {
    slug: 'deck-4-5-grove',
    label: 'Decks 4–5 — Grove',
    shortLabel: '4–5 Grove',
    tags:
      'Marketplace · cafés · cinema · atrium · Purser’s Desk · Tuco’s · farmers market',
    lead: 'Food, market, gathering — and the Purser’s Desk for Fair Exchange.',
    body: [
      'Grove is marketplace energy: cafés, cinema, atrium, farmers market, Tuco’s.',
      'Purser’s Desk lives here — give value, receive value, correct mistakes via info@fractiai.com.',
      'Cabins: GM-401–450 Grove Mezzanine Lofts — Juliette balconies over the conversation below.',
      'Fair Exchange is honor rails, not mythology. Credit when Goldilocks standard is missed.',
    ],
    image: PUERTO_RENO,
    imageAlt: 'Grove marketplace band — Puerto Reno atrium',
    cabinSlugs: ['gm-401-450'],
    actions: [
      { label: 'Email the Purser', href: 'mailto:info@fractiai.com?subject=Purser%20Fair%20Exchange' },
      { label: 'Inquire door', href: '/voyage/inquire' },
      { label: SITE_HOME_LABEL, href: '/questfest' },
    ],
  },
  {
    slug: 'deck-3-night',
    label: 'Deck 3 — Night',
    shortLabel: '3 Night',
    tags:
      'Bachdoor Speakeasy · Neon Velvet · Club Omnia · Red Room (consensual adults-only — you remain you)',
    lead: 'Music, play, adult social — consent first. Brotherhood is voyage identity, not a gate.',
    body: [
      'Night deck: Bachdoor Speakeasy · Neon Velvet · Club Omnia · Red Room.',
      'Consensual adults-only spaces — you remain you. Oriented for men on the poster; the whole tribe still belongs.',
      'Music engine and jukebox carry the pulse. Listen when the field gets loud.',
      'No algorithm outranks a human emergency. Consent is explicit.',
    ],
    image: JUKEBOX,
    imageAlt: 'Golden-era jukebox — Deck 3 Night music',
    cabinSlugs: ['sc-501-560'],
    actions: [
      { label: 'Listen · jukebox', href: '/listen' },
      { label: 'Live the vibe', href: '/voyage/live-the-vibe' },
      { label: 'Luxury redefined', href: '/voyage/luxury-redefined' },
    ],
  },
  {
    slug: 'deck-2-core',
    label: 'Deck 2 — Core',
    shortLabel: '2 Core',
    tags: 'Work · learning · Lattice Chat · technology — less overhead, more living',
    lead: 'Compact, high-speed work — Lattice Chat, studios, adaptive ports. Spend less energy maintaining a life.',
    body: [
      'Core is Deck 2: work, study, technology with less overhead.',
      'Lattice Chat lives here — BYOK, attach images/docs, Players examine charts, NPCs inhabit the build.',
      'Cabins: ST-601–680 Lattice Studio Staterooms — compact, adaptive, built for living not maintaining.',
      'SuperAI stays Goldilocks: not too much machine, not too little human.',
    ],
    image: LATTICE_THEATER,
    imageAlt: 'Lattice theater — Deck 2 Core workshop',
    cabinSlugs: ['st-601-680'],
    actions: [
      { label: 'Lattice Chat', href: '/lattice-chat/' },
      { label: 'Prepare door', href: '/voyage/prepare' },
      { label: 'Papers · Summit', href: '/papers' },
    ],
  },
];

/** @type {VoyageCabin[]} */
export const VOYAGE_CABINS = [
  {
    slug: 'ph-001',
    skuDisplay: 'PH-001',
    name: 'Captain’s Grand Penthouse',
    deckSlug: 'deck-9-summit',
    lead:
      'Sovereign Summit. Strategy, hospitality, 270° overlook. The command metaphor — not a throne that outranks a human emergency.',
    body: [
      'PH-001 is the Captain’s Grand Penthouse on Sovereign Summit — one serial, top command metaphor.',
      'Strategy and hospitality, not hierarchy over people. Human emergency still outranks the Bridge.',
      'Adjacent deck: Acoustic Studio · Holographic Lab · Deep Memory Library · Rapid Workshop.',
    ],
    serials: ['PH-001'],
    image: HERO_SHIP,
    imageAlt: 'Summit penthouse overlook — SS Vibelandia at sunset',
    actions: [
      { label: 'Deck 9 · Summit', href: '/voyage/deck-9-summit' },
      { label: 'Select your home', href: '/voyage/select' },
      { label: 'Inquire', href: '/voyage/inquire' },
    ],
  },
  {
    slug: 'ph-101-108',
    skuDisplay: 'PH-101–108',
    name: 'El Gran Sol Grand Penthouses',
    deckSlug: 'deck-9-summit',
    lead: 'Top-deck expedition residences — wraparound lanais, Goldilocks climate.',
    body: [
      'Eight grand penthouses: PH-101 through PH-108 on El Gran Sol band.',
      'Wraparound lanais, expedition residence feel, Goldilocks climate as design language — not weather prophecy.',
      'Summit deck amenities: lab, library, workshop within reach.',
    ],
    serials: expandSerialRange('PH', 101, 108),
    image: EVENING_CRUISE,
    imageAlt: 'El Gran Sol evening deck — grand penthouse band',
    actions: [
      { label: 'Deck 9 · Summit', href: '/voyage/deck-9-summit' },
      { label: 'Full directory', href: '/voyage/decks' },
      { label: 'Frontiersman brochure', href: '/frontiersman-voyage' },
    ],
  },
  {
    slug: 'cc-201-224',
    skuDisplay: 'CC-201–224',
    name: 'Captiva Cove Beachfront Cabins',
    deckSlug: 'deck-9-summit',
    lead: 'Lagoon walk-out, open-air living, rainfall showers.',
    body: [
      'Twenty-four beachfront cabins: CC-201 through CC-224 at Captiva Cove.',
      'Lagoon walk-out, open-air living, rainfall showers — resort vessel hospitality.',
      'Summit-adjacent: vision deck above, beach rhythm at the rail.',
    ],
    serials: expandSerialRange('CC', 201, 224),
    image: EVENING_CRUISE,
    imageAlt: 'Captiva Cove beachfront — lagoon cabins',
    actions: [
      { label: 'Deck 9 · Summit', href: '/voyage/deck-9-summit' },
      { label: 'Horizon living', href: '/voyage/deck-6-7-horizon' },
      { label: SITE_HOME_LABEL, href: '/questfest' },
    ],
  },
  {
    slug: 'rr-301-340',
    skuDisplay: 'RR-301–340',
    name: 'South Seas Veranda Condos',
    deckSlug: 'deck-8-veranda',
    lead: 'Model B household support — private life ↔ family life.',
    body: [
      'Forty Veranda condos: RR-301 through RR-340 on South Seas band.',
      'Model B household: intentional family support without surrendering identity.',
      'Collaborate threads and Veranda privacy share the same Hull.',
    ],
    serials: expandSerialRange('RR', 301, 340),
    image: VALET_HOST,
    imageAlt: 'South Seas Veranda — family deck hospitality',
    actions: [
      { label: 'Deck 8 · Veranda', href: '/voyage/deck-8-veranda' },
      { label: 'Collaborate', href: '/lattice-chat/?mode=collaborate' },
      { label: 'Select cabin', href: '/voyage/select' },
    ],
  },
  {
    slug: 'gm-401-450',
    skuDisplay: 'GM-401–450',
    name: 'Grove Mezzanine Lofts',
    deckSlug: 'deck-4-5-grove',
    lead: 'Over the marketplace — Juliette balconies, conversation below.',
    body: [
      'Fifty mezzanine lofts: GM-401 through GM-450 above the Grove marketplace.',
      'Juliette balconies over cafés, cinema, atrium, farmers market.',
      'Purser’s Desk is one deck away — Fair Exchange when hospitality misses Goldilocks.',
    ],
    serials: expandSerialRange('GM', 401, 450),
    image: PUERTO_RENO,
    imageAlt: 'Grove mezzanine lofts over the marketplace',
    actions: [
      { label: 'Deck 4–5 · Grove', href: '/voyage/deck-4-5-grove' },
      { label: 'Purser · email', href: 'mailto:info@fractiai.com?subject=Purser%20Fair%20Exchange' },
      { label: 'Inquire', href: '/voyage/inquire' },
    ],
  },
  {
    slug: 'sc-501-560',
    skuDisplay: 'SC-501–560',
    name: 'High-Roller Executive Suites',
    deckSlug: 'deck-3-night',
    lead: 'Quiet isolation for work and rest — VIP lounge when you choose it.',
    body: [
      'Sixty executive suites: SC-501 through SC-560 on the Night band.',
      'Quiet isolation for work and rest; VIP lounge access when you choose it.',
      'Deck 3 nightlife is consent-first — speakeasy, club, Red Room. You remain you.',
    ],
    serials: expandSerialRange('SC', 501, 560),
    image: JUKEBOX,
    imageAlt: 'High-Roller suites — quiet deck above Night venues',
    actions: [
      { label: 'Deck 3 · Night', href: '/voyage/deck-3-night' },
      { label: 'Listen', href: '/listen' },
      { label: 'Live the vibe', href: '/voyage/live-the-vibe' },
    ],
  },
  {
    slug: 'st-601-680',
    skuDisplay: 'ST-601–680',
    name: 'Lattice Studio Staterooms',
    deckSlug: 'deck-2-core',
    lead:
      'Deck 2 Core. Compact. High-speed work. Adaptive ports. Spend less energy maintaining a life and more energy living it.',
    body: [
      'Eighty studio staterooms: ST-601 through ST-680 on Deck 2 Core.',
      'Compact footprint, high-speed work, adaptive ports — Lattice Chat is your deck door.',
      'Less overhead, more living. Attach charts at the composer; BYOK stays on your edge.',
    ],
    serials: expandSerialRange('ST', 601, 680),
    image: LATTICE_THEATER,
    imageAlt: 'Lattice Studio staterooms — Deck 2 Core',
    actions: [
      { label: 'Deck 2 · Core', href: '/voyage/deck-2-core' },
      { label: 'Lattice Chat', href: '/lattice-chat/' },
      { label: 'Prepare · BYOK', href: '/voyage/prepare' },
    ],
  },
];

/** @param {string} slug */
export function voyageDeckHref(slug) {
  return `/voyage/${slug}`;
}

/** @param {string} slug */
export function voyageCabinHref(slug) {
  return `/voyage/cabin-${slug}`;
}

export function voyageDirectoryHref() {
  return '/voyage/decks';
}

/** @param {string} slug @returns {VoyageDeck | undefined} */
export function findVoyageDeck(slug) {
  return VOYAGE_DECKS.find((d) => d.slug === slug);
}

/** @param {string} slug @returns {VoyageCabin | undefined} */
export function findVoyageCabin(slug) {
  return VOYAGE_CABINS.find((c) => c.slug === slug);
}

/** @param {string[]} serials */
function renderSerialGrid(serials) {
  const items = serials
    .map((s) => `<li class="voyage-serial">${s}</li>`)
    .join('\n        ');
  return `<section class="voyage-serial-block" aria-labelledby="serials-h">
      <h2 id="serials-h">Serial register · ${serials.length} unit${serials.length === 1 ? '' : 's'}</h2>
      <ul class="voyage-serial-grid" role="list">${items}</ul>
    </section>`;
}

function renderHeroImage(image, alt) {
  return `<figure class="voyage-directory-hero">
      <img src="${image}" alt="${alt}" width="960" height="540" loading="lazy" decoding="async"
        onerror="this.onerror=null;this.src='${HERO_SHIP}'" />
    </figure>`;
}

export function renderVoyageDeckStripHtml() {
  return VOYAGE_DECKS.map(
    (d) => `<a href="${voyageDeckHref(d.slug)}">${d.shortLabel}</a>`,
  ).join('\n    ');
}

export function renderVoyageDeckDirectoryHtml() {
  const deckRows = VOYAGE_DECKS.map(
    (d) =>
      `<a class="voyage-deck-door" href="${voyageDeckHref(d.slug)}"><div class="deck-row"><strong>${d.label}:</strong> ${d.tags}</div></a>`,
  ).join('\n      ');

  const cabinArticles = VOYAGE_CABINS.map(
    (c) =>
      `<a class="voyage-cabin-door" href="${voyageCabinHref(c.slug)}"><article><span class="sku">${c.skuDisplay}</span> <strong>${c.name}</strong> — ${c.lead}</article></a>`,
  ).join('\n      ');

  return `<div class="deck-grid">
      ${deckRows}
    </div>
    <div class="voyage-cabin-dir" id="cabins">
      ${cabinArticles}
    </div>`;
}

/** @param {VoyageDeck} deck */
export function renderVoyageDeckPageHtml(deck) {
  const canonical = `https://www.ssvibelandiaquestfest24x365.com${voyageDeckHref(deck.slug)}`;
  const bodyHtml = deck.body.map((p) => `<p>${p}</p>`).join('\n    ');
  const actionsHtml = deck.actions
    .map((a) => `<a class="btn btn-gold" href="${a.href}">${a.label}</a>`)
    .join('\n      ');
  const cabinLinks = deck.cabinSlugs
    .map((slug) => {
      const c = findVoyageCabin(slug);
      return c
        ? `<li><a href="${voyageCabinHref(c.slug)}">${c.skuDisplay} · ${c.name}</a> (${c.serials.length} serial${c.serials.length === 1 ? '' : 's'})</li>`
        : '';
    })
    .filter(Boolean)
    .join('\n        ');
  const cabinBlock =
    cabinLinks.length > 0
      ? `<h2>Cabins on this deck</h2><ul class="plain">${cabinLinks}</ul>`
      : '';

  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${deck.label} · SS Vibelandia Voyage</title>
  <meta name="description" content="${deck.lead}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${deck.label}" />
  <meta property="og:description" content="${deck.lead}" />
  <meta property="og:image" content="https://www.ssvibelandiaquestfest24x365.com${deck.image}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Source+Sans+3:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/interfaces/brand-gold-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/ship-blog.css" />
  <link rel="stylesheet" href="/interfaces/voyage-surfaces.css" />
  <style>html.vbi18n-pending body{visibility:hidden}html.vbi18n-ready body{visibility:visible}</style>
</head>
<body class="voyage-flagship">
  <article class="wrap voyage-door-page">
    <nav class="nav" aria-label="Site">
      <a href="${SITE_HOME_HREF}">${SITE_HOME_LABEL}</a>
      <a href="${voyageDirectoryHref()}">Deck directory</a>
      <a href="/frontiersman-voyage">Brochure §14–22</a>
      <a href="/lattice-chat/">Lattice Chat</a>
    </nav>
    ${renderHeroImage(deck.image, deck.imageAlt)}
    <header>
      <p class="kicker">Holographic deck · Brochure §14–22 · Frontiersman</p>
      <h1>${deck.label}</h1>
      <p class="dateline"><strong>${deck.tags}</strong></p>
    </header>
    <p class="lead">${deck.lead}</p>
    ${bodyHtml}
    ${cabinBlock}
    <p class="honesty"><strong>Honesty:</strong> Decks are physical locations in the resort metaphor <em>and</em> functions of the social system. EGS ≈ 1.618 is design language. No algorithm outranks a human emergency. ${VOYAGE_DOOR_SPINE}</p>
    <div class="cta-row">${actionsHtml}<a class="btn btn-ghost" href="${voyageDirectoryHref()}">All decks &amp; cabins</a></div>
    <div class="voyage-purser"><p class="voyage-purser__h">Purser's Desk</p><p>Deck 4 · The Grove · <a href="mailto:info@fractiai.com?subject=Purser%20Fair%20Exchange">info@fractiai.com</a></p></div>
    <footer>Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · → ∞¹³</footer>
  </article>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
</body>
</html>`;
}

/** @param {VoyageCabin} cabin */
export function renderVoyageCabinPageHtml(cabin) {
  const deck = findVoyageDeck(cabin.deckSlug);
  const canonical = `https://www.ssvibelandiaquestfest24x365.com${voyageCabinHref(cabin.slug)}`;
  const bodyHtml = cabin.body.map((p) => `<p>${p}</p>`).join('\n    ');
  const actionsHtml = cabin.actions
    .map((a) => `<a class="btn btn-gold" href="${a.href}">${a.label}</a>`)
    .join('\n      ');

  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${cabin.skuDisplay} · ${cabin.name} · SS Vibelandia</title>
  <meta name="description" content="${cabin.lead}" />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="${cabin.skuDisplay} · ${cabin.name}" />
  <meta property="og:description" content="${cabin.lead}" />
  <meta property="og:image" content="https://www.ssvibelandiaquestfest24x365.com${cabin.image}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Source+Sans+3:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/interfaces/brand-gold-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/ship-blog.css" />
  <link rel="stylesheet" href="/interfaces/voyage-surfaces.css" />
  <style>html.vbi18n-pending body{visibility:hidden}html.vbi18n-ready body{visibility:visible}</style>
</head>
<body class="voyage-flagship">
  <article class="wrap voyage-door-page">
    <nav class="nav" aria-label="Site">
      <a href="${SITE_HOME_HREF}">${SITE_HOME_LABEL}</a>
      <a href="${voyageDirectoryHref()}">Deck directory</a>
      ${deck ? `<a href="${voyageDeckHref(deck.slug)}">${deck.shortLabel}</a>` : ''}
      <a href="/lattice-chat/">Lattice Chat</a>
    </nav>
    ${renderHeroImage(cabin.image, cabin.imageAlt)}
    <header>
      <p class="kicker">Cabin SKU · ${cabin.skuDisplay} · ${deck ? deck.label : 'Voyage'}</p>
      <h1>${cabin.name}</h1>
      <p class="dateline"><strong>${cabin.lead}</strong></p>
    </header>
    ${bodyHtml}
    ${renderSerialGrid(cabin.serials)}
    <p class="honesty"><strong>Honesty:</strong> Cabin SKUs are hospitality catalog labels — not a pricing grid or membership test. ${VOYAGE_DOOR_SPINE}</p>
    <div class="cta-row">${actionsHtml}<a class="btn btn-ghost" href="${voyageDirectoryHref()}">All decks &amp; cabins</a></div>
    <div class="voyage-purser"><p class="voyage-purser__h">Purser's Desk</p><p>Deck 4 · The Grove · <a href="mailto:info@fractiai.com?subject=Purser%20Fair%20Exchange">info@fractiai.com</a></p></div>
    <footer>Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · → ∞¹³</footer>
  </article>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
</body>
</html>`;
}

export function renderVoyageDirectoryIndexHtml() {
  const canonical = `https://www.ssvibelandiaquestfest24x365.com${voyageDirectoryHref()}`;
  const deckCards = VOYAGE_DECKS.map(
    (d) =>
      `<li><a href="${voyageDeckHref(d.slug)}"><strong>${d.label}</strong><span>${d.tags}</span></a></li>`,
  ).join('\n        ');
  const cabinCards = VOYAGE_CABINS.map(
    (c) =>
      `<li><a href="${voyageCabinHref(c.slug)}"><span class="sku">${c.skuDisplay}</span> <strong>${c.name}</strong><span>${c.serials.length} serial${c.serials.length === 1 ? '' : 's'}</span></a></li>`,
  ).join('\n        ');

  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Holographic Decks &amp; Cabin Directory · SS Vibelandia</title>
  <meta name="description" content="Brochure §14–22 — all decks, cabin SKUs, and serial registers for Players and NPCs." />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="Holographic Decks &amp; Cabin Directory" />
  <meta property="og:image" content="https://www.ssvibelandiaquestfest24x365.com${HERO_SHIP}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Source+Sans+3:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/interfaces/brand-gold-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/ship-blog.css" />
  <link rel="stylesheet" href="/interfaces/voyage-surfaces.css" />
  <style>html.vbi18n-pending body{visibility:hidden}html.vbi18n-ready body{visibility:visible}</style>
</head>
<body class="voyage-flagship">
  <article class="wrap voyage-door-page">
    <nav class="nav" aria-label="Site">
      <a href="${SITE_HOME_HREF}">${SITE_HOME_LABEL}</a>
      <a href="/frontiersman-voyage">Full brochure</a>
      <a href="/ship-blog/frontiersman-voyage">Ship-blog note</a>
      <a href="/lattice-chat/">Lattice Chat</a>
    </nav>
    ${renderHeroImage(HERO_SHIP, 'SS Vibelandia — holographic decks and cabin directory')}
    <header>
      <p class="kicker">Brochure §14–22 · Frontiersman Voyage</p>
      <h1>Holographic Decks &amp; Cabin Directory</h1>
      <p class="dateline">${VOYAGE_DOOR_SPINE}</p>
    </header>
    <p class="lead">Every deck and cabin SKU opens its own door — full serial register, poster image, and plain speak. <strong>Players</strong> pick a home; <strong>NPCs</strong> inhabit what you resource.</p>
    <h2>Decks</h2>
    <ul class="voyage-directory-list">${deckCards}</ul>
    <h2>Cabin SKUs</h2>
    <ul class="voyage-directory-list">${cabinCards}</ul>
    <p class="honesty"><strong>Honesty:</strong> Decks are metaphor and function. Cabin SKUs are hospitality catalog — not genomic gates. EGS ≈ 1.618 is design language.</p>
    <div class="cta-row">
      <a class="btn btn-gold" href="/frontiersman-voyage">Full brochure</a>
      <a class="btn btn-ghost" href="/voyage/select">Select your home</a>
      <a class="btn btn-ghost" href="${SITE_HOME_HREF}">${SITE_HOME_LABEL}</a>
    </div>
    <footer>→ ∞¹³</footer>
  </article>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
</body>
</html>`;
}
