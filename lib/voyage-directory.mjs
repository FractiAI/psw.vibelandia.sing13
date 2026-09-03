/**
 * SS Vibelandia · Holographic decks & cabin directory (brochure §14–22)
 * Deck rows + cabin SKUs with full serial lists and poster images.
 * Voyage Map leads with narrative · experiences · choice menus, then decks/cabins.
 */
import {
  VOYAGE_DOOR_SPINE,
  VOYAGE_DOORS,
  voyageDoorHref,
} from './voyage-doors.mjs';
import { PLAYER_PRIMARY_DOORS, PLAYER_MORE_DOORS } from './player-spine.mjs';
import { SITE_HOME_HREF, SITE_HOME_LABEL } from './site-brand.mjs';
import {
  VOYAGE_MAP_COME_ABOARD,
  VOYAGE_MAP_POSTER,
  VOYAGE_MAP_STORY_HERO,
  voyagePosterPath,
} from './voyage-posters.mjs';

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
 * @property {string} [kicker]
 * @property {{ label: string; href: string }[]} actions
 */

/** Captain’s Grand Penthouse vertical reach — one SKU, every deck. */
export const CAPTAIN_PENTHOUSE_REACH =
  'The Captain’s Grand Penthouse (PH-001) holds 360° views on Summit. A private elevator opens a Captain’s room for self and entertainment on every deck, including this one.';

/** Poster paths for deck/cabin pages — themed SVG catalog art (filled after deck/cabin tables). */
export let VOYAGE_DIRECTORY_IMAGES = [];

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
    lead: 'The crown of the ship — vision, studio, library, and workshop with a 360° horizon of honor.',
    body: [
      'Summit is where creation meets leadership — without turning leadership into a throne.',
      'Acoustic Studio. Holographic Lab. Deep Memory Library. Rapid Workshop. Ship-blog in plain speak.',
      'Homes on this band: Captain’s Grand Penthouse (360° views, private elevator to every deck) · El Gran Sol penthouses · Captiva Cove beachfront cabins.',
      'Come for the view. Stay for the vision. Both belong.',
    ],
    image: voyagePosterPath('deck-9-summit'),
    imageAlt: 'Summit frontier guide — vision, lab, and Deep Memory deck',
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
    lead: 'Private life and family life in balance — soft light, soft voices, a home that breathes.',
    body: [
      'Deck 8 is comfort with intention: family warmth, quiet corners, and rooms that feel like yours.',
      'Collaborate keeps private threads on the same ship — Veranda hospitality, not a separate world.',
      'South Seas Veranda Condos hold private life and family life in one rhythm.',
      'The Captain’s private elevator opens a room for rest and entertainment on Veranda.',
      'You remain you. Belonging is voluntary. No surrender of identity to join the tribe.',
    ],
    image: voyagePosterPath('deck-8-veranda'),
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
    lead: 'Living and social life — balcony light, ocean air, ordinary days that feel like Friday.',
    body: [
      'Horizon is where the cruise becomes a lifestyle: recreation, gatherings, oceanview quarters.',
      'Landfalls shine from here — Cartagena, Sierra, Tahoe, Downtown Reno on one vessel.',
      'Every day can be Friday: music on Monday, adventure on Tuesday, rest that still counts.',
      'The Captain’s private elevator opens a room for rest and entertainment on Horizon.',
      'Live the rhythm. Feel the shift. Stay Goldilocks.',
    ],
    image: voyagePosterPath('deck-6-7-horizon'),
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
    lead: 'Food, market, gathering — and the Purser’s Desk where Fair Exchange keeps hospitality honest.',
    body: [
      'Grove is the heartbeat of hospitality: cafés, cinema, atrium, farmers market, Tuco’s.',
      'The Purser’s Desk lives here — give value, receive value, make it right at info@fractiai.com.',
      'Grove Mezzanine Lofts open Juliette balconies over the conversation below.',
      'The Captain’s private elevator opens a room for rest and entertainment on Grove.',
      'Miss Goldilocks? We credit you. That is honor with a backbone.',
    ],
    image: voyagePosterPath('deck-4-5-grove'),
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
    lead: 'Music, play, adult social — consent first. Nightlife as voyage honor, never a gate.',
    body: [
      'Bachdoor Speakeasy · Neon Velvet · Club Omnia · Red Room — the night stack.',
      'Adults-only where marked. You remain you. The whole tribe still belongs on this ship.',
      'The jukebox carries the pulse. Listen when the field gets loud.',
      'The Captain’s private elevator opens a room for rest and entertainment on Night.',
      'Consent is explicit. Human care outranks every score.',
    ],
    image: voyagePosterPath('deck-3-night'),
    imageAlt: 'Golden-era jukebox — Deck 3 Night music',
    cabinSlugs: ['sc-501-560'],
    actions: [
      { label: 'Liking the music? See Concert Program', href: '/sin-city-program' },
      { label: 'Open night set', href: '/interfaces/questfest-bridge/#/listen?playlist=pl-sin-city&autoplay=1' },
      { label: 'Live the vibe', href: '/voyage/live-the-vibe' },
    ],
  },
  {
    slug: 'deck-2-core',
    label: 'Deck 2 — Core',
    shortLabel: '2 Core',
    tags: 'Work · learning · Lattice Chat · technology — less overhead, more living',
    lead: 'Compact craft decks — Lattice Chat, studios, adaptive ports. Less overhead. More living.',
    body: [
      'Core is where builders work and learners grow — technology that serves life, not the other way around.',
      'Lattice Chat lives here. Bring your own key. Attach images and notes. Build with honor.',
      'Lattice Studio Staterooms are compact, adaptive, and built for living — not maintaining.',
      'The Captain’s private elevator opens a room for rest and entertainment on Core.',
      'SuperAI stays Goldilocks: not too much machine, not too little human.',
    ],
    image: voyagePosterPath('deck-2-core'),
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
      '360° views from Summit. A private elevator carries the Captain to every deck, so self and entertainment have a room on each band. Welcome, never a throne over people.',
    body: [
      'PH-001 is one home with a vertical reach. The crown is 360° horizon. The private elevator opens a Captain’s room for rest and entertainment on Summit, Veranda, Horizon, Grove, Night, and Core.',
      'Strategy and hospitality live here. Human care still outranks the Bridge.',
      'Steps away on Summit: Acoustic Studio · Holographic Lab · Deep Memory Library · Rapid Workshop. Below, the same key opens the Captain’s space on every deck.',
    ],
    serials: ['PH-001'],
    image: voyagePosterPath('ph-001'),
    imageAlt: 'Captain’s Grand Penthouse. 360° Summit lounge and private elevator to every deck.',
    kicker: 'Your cabin · PH-001 · 360° on Summit · private elevator to every deck',
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
    lead: 'Top-deck expedition residences — wraparound lanais, Goldilocks calm.',
    body: [
      'Eight grand penthouses on the El Gran Sol band — PH-101 through PH-108.',
      'Wraparound lanais. Expedition residence feel. Climate designed for comfort, not prophecy.',
      'Lab, library, and workshop wait a short walk away on Summit.',
    ],
    serials: expandSerialRange('PH', 101, 108),
    image: voyagePosterPath('ph-101-108'),
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
    lead: 'Lagoon walk-out, open-air living, rainfall showers — beachfront honor on the vessel.',
    body: [
      'Twenty-four beachfront cabins at Captiva Cove — CC-201 through CC-224.',
      'Lagoon walk-out. Open air. Rainfall showers. Resort hospitality that feels like home.',
      'Vision deck above. Beach rhythm at the rail.',
    ],
    serials: expandSerialRange('CC', 201, 224),
    image: voyagePosterPath('cc-201-224'),
    imageAlt: 'Captiva Cove beachfront — lagoon walk-out cabins',
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
    lead: 'Family and private life in one home — soft Veranda light, intentional comfort.',
    body: [
      'Forty Veranda condos on the South Seas band — RR-301 through RR-340.',
      'Household support without surrendering who you are.',
      'Collaborate threads and Veranda privacy share the same ship.',
    ],
    serials: expandSerialRange('RR', 301, 340),
    image: voyagePosterPath('rr-301-340'),
    imageAlt: 'South Seas Veranda condos — family life on Deck 8',
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
    lead: 'Over the marketplace — Juliette balconies, conversation below, Grove energy all day.',
    body: [
      'Fifty mezzanine lofts above the Grove — GM-401 through GM-450.',
      'Juliette balconies over cafés, cinema, atrium, and the farmers market.',
      'The Purser’s Desk is one deck away when hospitality needs a human hand.',
    ],
    serials: expandSerialRange('GM', 401, 450),
    image: voyagePosterPath('gm-401-450'),
    imageAlt: 'Grove mezzanine lofts — Juliette balconies over the marketplace',
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
    lead: 'Quiet isolation for work and rest — VIP calm above the nightlife, when you choose it.',
    body: [
      'Sixty executive suites on the Night band — SC-501 through SC-560.',
      'Quiet for craft and rest. Lounge access when you want the pulse.',
      'Deck 3 nightlife is consent-first. You remain you.',
    ],
    serials: expandSerialRange('SC', 501, 560),
    image: voyagePosterPath('sc-501-560'),
    imageAlt: 'High-Roller executive suites — quiet isolation above Night deck',
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
      'Deck 2 Core. Compact. High-speed craft. Adaptive ports. Less energy maintaining a life — more energy living it.',
    body: [
      'Eighty studio staterooms on Deck 2 Core — ST-601 through ST-680.',
      'Compact footprint. Fast work. Adaptive ports. Lattice Chat is your deck door.',
      'Bring your own key. Attach charts at the composer. Build with honor.',
    ],
    serials: expandSerialRange('ST', 601, 680),
    image: voyagePosterPath('st-601-680'),
    imageAlt: 'Lattice Studio staterooms — compact Deck 2 Core work bays',
    actions: [
      { label: 'Deck 2 · Core', href: '/voyage/deck-2-core' },
      { label: 'Lattice Chat', href: '/lattice-chat/' },
      { label: 'Prepare', href: '/voyage/prepare' },
    ],
  },
];

VOYAGE_DIRECTORY_IMAGES = [
  VOYAGE_MAP_POSTER,
  ...VOYAGE_DECKS.map((d) => d.image),
  ...VOYAGE_CABINS.map((c) => c.image),
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
      <h2 id="serials-h">Cabin numbers · ${serials.length} home${serials.length === 1 ? '' : 's'}</h2>
      <ul class="voyage-serial-grid" role="list">${items}</ul>
    </section>`;
}

function renderHeroImage(image, alt, { story = false, eager = false } = {}) {
  const cls = story ? 'voyage-directory-hero voyage-directory-hero--story' : 'voyage-directory-hero';
  const loading = eager ? 'eager' : 'lazy';
  return `<figure class="${cls}">
      <img src="${image}" alt="${alt}" width="1280" height="720" loading="${loading}" decoding="async" />
    </figure>`;
}

/** @param {{ src: string; alt: string; caption: string }} still */
function renderVoyageStoryStill(still) {
  return `<figure class="voyage-map-still">
      <img src="${still.src}" alt="${still.alt}" width="1280" height="720" loading="lazy" decoding="async" />
      <figcaption>${still.caption}</figcaption>
    </figure>`;
}

const VOYAGE_MAP_ARC_STILLS = {
  genesis: {
    src: '/interfaces/assets/journey/journey-bridge-solar-watch.png',
    alt: 'From the navigation bridge you look onto El Gran Sol over a navy sea. Brass and teak in the foreground. Two small disks rest on the sun as catalog marks.',
    caption: 'Beat I. You stand Bridge watch. El Gran Sol is the light this vessel steers by.',
  },
  boriken: {
    src: '/interfaces/assets/journey/journey-boriken-convergence.png',
    alt: 'Gold-hour Caribbean shore. Petroglyphs in the foreground. A gold-sailed ship approaches a stone fort on Borikén.',
    caption: 'Beat II. Borikén holds the Great Convergence. Old and new worlds meet on this shore.',
  },
  reno: {
    src: '/interfaces/assets/journey/journey-puerto-reno-gangway.png',
    alt: 'Night gangway at Puerto Reno. Gold chain rail underfoot. Neon city and snow peaks across the Truckee.',
    caption: 'Beat III. Puerto Reno is the Captain’s seat now. Step the gangway when you are ready to live here.',
  },
};

const VOYAGE_MAP_LIVING_STILLS = [
  {
    href: '/voyage/arrive',
    src: VOYAGE_MAP_COME_ABOARD,
    alt: 'Stepping through gold-trimmed doors into the navy and gold lobby. Jukebox glow. Crew in white. Guests gathering for the night.',
    caption: 'Come aboard',
  },
  {
    href: '/journey/bachdoor-music-lab',
    src: '/interfaces/assets/journey/journey-bachdoor-music-lab.png',
    alt: 'Gold-lit Bachdoor music lab. Jukebox, vinyl, and a small mixing desk on the Night deck.',
    caption: 'Night deck',
  },
  {
    href: '/journey/tahoe-catamaran',
    src: '/interfaces/assets/journey/journey-tahoe-catamaran.png',
    alt: 'Gold-hour catamaran on alpine Tahoe water with Sierra peaks around the basin.',
    caption: 'Tahoe gold',
  },
  {
    href: '/journey/cartagena-spice-stone',
    src: '/interfaces/assets/journey/journey-cartagena-spice-stone.png',
    alt: 'Cartagena walled city in gold light. Stone ramparts, colonial color, and marketplace heat.',
    caption: 'Cartagena',
  },
];

function renderVoyageLivingStripHtml() {
  const items = VOYAGE_MAP_LIVING_STILLS.map(
    (s) => `<a href="${s.href}"><img src="${s.src}" alt="${s.alt}" width="480" height="320" loading="lazy" decoding="async" /><span>${s.caption}</span></a>`,
  ).join('\n        ');
  return `<div class="voyage-map-filmstrip" role="list">${items}</div>`;
}

function renderDirectoryThumb(image, alt) {
  return `<img class="voyage-directory-thumb" src="${image}" alt="${alt}" width="96" height="96" loading="lazy" decoding="async" />`;
}

export function renderVoyageDeckStripHtml() {
  return VOYAGE_DECKS.map(
    (d) => `<a href="${voyageDeckHref(d.slug)}">${d.shortLabel}</a>`,
  ).join('\n    ');
}

const VOYAGE_LANDFALLS = [
  { label: 'Puerto Reno', href: '/questfest' },
  { label: 'Cartagena', href: '/frontiersman-voyage#landfalls' },
  { label: 'Sierra', href: '/frontiersman-voyage#landfalls' },
  { label: 'Tahoe', href: '/frontiersman-voyage#landfalls' },
  { label: 'Downtown Reno', href: '/reno' },
];

/** Grand narrative · arrival · crests · experience menus — before decks/cabins. */
export function renderVoyageMapPreludeHtml() {
  const arrival = VOYAGE_DOORS.filter((d) => d.kind === 'arrival');
  const crests = VOYAGE_DOORS.filter((d) => d.kind === 'crest');
  const arrivalMenu = arrival
    .map(
      (d) =>
        `<li><a href="${voyageDoorHref(d.slug)}"><strong>${d.label}</strong><span>${d.lead}</span></a></li>`,
    )
    .join('\n      ');
  const crestMenu = crests
    .map(
      (d) =>
        `<li><a href="${voyageDoorHref(d.slug)}"><span class="voyage-map-crest__glyph" aria-hidden="true">${d.glyph}</span><strong>${d.label}</strong><span>${d.lead}</span></a></li>`,
    )
    .join('\n      ');
  const experienceDoors = [...PLAYER_PRIMARY_DOORS, ...PLAYER_MORE_DOORS.slice(0, 4)];
  const experienceMenu = experienceDoors
    .map(
      (d) =>
        `<li><a href="${d.href}"><strong>${d.label}</strong><span>${d.note}</span></a></li>`,
    )
    .join('\n      ');

  return `<section class="voyage-map-prelude" aria-labelledby="voyage-story-h">
      <h2 id="voyage-story-h">The voyage · grand narrative</h2>
      <p class="voyage-map-prelude__lede">SS Vibelandia is a navy-gold holographic <strong>resort vessel</strong> — flagship of the Golden Bachdoor Hit Factory and a full cruise line of the Intelligence Age. Hospitality · marketplace · nightlife · brotherhood as <em>voyage identity</em>, never a membership test. This is a lifelong Boy’s Night Out for frontiersmen everywhere: one tribe · many homes · layers that stack without canceling each other — physical → digital → social → narrative → symbolic → cognitive → meta.</p>
      <p>You are not boarding a feature list. You are stepping into a <strong>grand Story</strong> — the Official Prospectus arc — where a man notices the chaos around him, takes voluntary responsibility for a corner of it, and finds meaning by walking the deck with brotherhood and craft instead of doomscrolling alone. The ship gives you a map. You still choose the next honest step.</p>
      <h3 id="voyage-arc-1">I · Before time counted its heartbeats</h3>
      ${renderVoyageStoryStill(VOYAGE_MAP_ARC_STILLS.genesis)}
      <p>Before spiral arms and stellar nurseries, the Story names one living scale rhyme: <strong>El Gran Sol’s Fractal constant</strong> (EGS · Φ ≈ 1.618) — design language for how this vessel folds micro craft into macro voyage honor. Stewardship in the local sector is told through two solar guardians as <em>navigation characters</em>, not weather forecasts: <strong>Sunspot Region 3664 (Proto)</strong> holds foundational memory; <strong>Sunspot Region 3923 (Electro)</strong> drives kinetic creative flares. Together they carry the ship’s pulse across the dark sea at a steady <strong>100 BPM</strong>.</p>
      <h3 id="voyage-arc-2">II · The Great Convergence</h3>
      ${renderVoyageStoryStill(VOYAGE_MAP_ARC_STILLS.boriken)}
      <p>On the physical timeline, old and new worlds meet on the shores of <strong>Borikén (Puerto Rico)</strong>. That crucible — ancestral memory, resilience, and the syncretism of Taíno, African, and Spanish currents — coils into creative destiny for descendants across the diaspora. The voyage carries that pressure valve forward; it does not flatten it into a slogan.</p>
      <h3 id="voyage-arc-3">III · The Captain’s seat · now</h3>
      ${renderVoyageStoryStill(VOYAGE_MAP_ARC_STILLS.reno)}
      <p>The arc anchors in the high desert of <strong>Reno, Nevada</strong> — code repositories, the Truckee’s steady flow, Montecristo grit, and holographic swamp beats fused with salsa, reggaeton, and classical motifs. Tuned to <strong>432 Hz</strong> with a <strong>729 Hz</strong> anchor, SS Vibelandia QUESTFEST 24×365 sails here and now: Proto keeps the hull on true north; Electro fills the sails. The network is the vessel. The voyage begins wherever you are.</p>
      <p class="voyage-map-prelude__soundtrack"><strong>Vessel soundtrack (catalog):</strong> 432 Hz · 729 Hz anchor · 100 BPM · Proto / Electro as Bridge navigation labels — <em>educational</em>, not prophecy. Full constitution: <a href="/frontiersman-voyage#prospectus">Official Prospectus</a>.</p>
      <p>Players set the gravity. NPCs inhabit the world. Both belong. SuperAI stays Goldilocks — not too much machine, not too little human. Every surface answers three questions: <em>Where am I on the ship? What can I do here? How do I stay Goldilocks?</em></p>
      <p class="voyage-map-prelude__loop">Player loop: <strong>SEE → RECOGNIZE → INTERPRET → REFLECT → ACT → SEE AGAIN</strong> — the same rhythm as coming aboard, and the same heartbeat as Metabolize → Crystallize → Animate.</p>
      <p class="voyage-map-prelude__hint">Living stills · nights, landfalls, and the lobby you walk into:</p>
      ${renderVoyageLivingStripHtml()}
      <p><strong>Five doors of the cruise line:</strong> <a href="/questfest">SS Vibelandia</a> (today’s board) · <a href="/">Canvas</a> (art landing) · <a href="/journey">Journey</a> (this map) · <a href="/jukebox">Jukebox</a> · <a href="/reading-room">Reading Room</a> · <a href="/creator-studio">Creator Studio</a>. Read the story and choose experiences <em>before</em> you pick decks, cabins, and penthouses below.</p>
    </section>
    <section class="voyage-map-prelude voyage-map-prelude--menu" aria-labelledby="voyage-arrival-h">
      <h2 id="voyage-arrival-h">Come aboard · arrival loop</h2>
      ${renderVoyageStoryStill({
        src: VOYAGE_MAP_COME_ABOARD,
        alt: 'First-person threshold into the gold and navy lobby. You have arrived. The jukebox is already glowing.',
        caption: 'The lobby is waiting. Five beats of passage before you claim a cabin.',
      })}
      <p class="voyage-map-prelude__hint">Five beats of passage — curiosity, choice, readiness, welcome, living frequency — before you claim a cabin:</p>
      <ol class="voyage-map-choice-menu voyage-map-choice-menu--arrival">
      ${arrivalMenu}
      </ol>
    </section>
    <section class="voyage-map-prelude voyage-map-prelude--menu" aria-labelledby="voyage-crests-h">
      <h2 id="voyage-crests-h">Ship crests · live the honor</h2>
      <p class="voyage-map-prelude__hint">Six promises that color every deck — flags of meaning, not slogans on a slide:</p>
      <ul class="voyage-map-choice-menu voyage-map-choice-menu--crests">
      ${crestMenu}
      </ul>
    </section>
    <section class="voyage-map-prelude voyage-map-prelude--menu" aria-labelledby="voyage-do-h">
      <h2 id="voyage-do-h">Experiences · menus of things to do</h2>
      <p class="voyage-map-prelude__hint">What a frontiersman actually does aboard — journey, listen, read, build, meet, and care:</p>
      <ul class="voyage-map-choice-menu voyage-map-choice-menu--do">
      ${experienceMenu}
      </ul>
    </section>`;
}

export function renderVoyageMapDiagramHtml() {
  const deckRows = VOYAGE_DECKS.map(
    (d) =>
      `<a class="voyage-map-deck" href="${voyageDeckHref(d.slug)}"><span class="voyage-map-deck__num">${d.shortLabel}</span><span><span class="voyage-map-deck__label">${d.label}</span><span class="voyage-map-deck__tags">${d.tags.split(' · ').slice(0, 3).join(' · ')}</span></span><span class="voyage-map-deck__go">Open →</span></a>`,
  ).join('\n      ');
  const landfalls = VOYAGE_LANDFALLS.map(
    (l) => `<li><a href="${l.href}">${l.label}</a></li>`,
  ).join('\n        ');
  return `<section class="voyage-map-diagram" aria-labelledby="voyage-map-h">
      <h2 id="voyage-map-h">Ship map · decks &amp; landfalls</h2>
      <figure class="voyage-map-schematic">
        <img src="${VOYAGE_MAP_POSTER}" alt="SS Vibelandia voyage chart. Deck stack from Summit to Core, Goldilocks layer, and landfalls around the hull." width="960" height="1280" loading="lazy" decoding="async" />
        <figcaption>The chart. Deck stack, Goldilocks layer, and landfalls. Read it after you have stood on the bow.</figcaption>
      </figure>
      <p class="voyage-map-prelude__hint">Now choose where you live and play — Summit to Core, then your cabin home:</p>
      <div class="voyage-map-stack" role="list">${deckRows}</div>
      <p class="voyage-map-deck__tags"><strong>Landfalls</strong> — ports of call on one vessel:</p>
      <ul class="voyage-map-landfalls">${landfalls}</ul>
      <ol class="voyage-map-arrival">
        <li><a href="/voyage/inquire">Inquire</a></li>
        <li><a href="/voyage/select">Select</a></li>
        <li><a href="/voyage/prepare">Prepare</a></li>
        <li><a href="/voyage/arrive">Arrive</a></li>
        <li><a href="/voyage/live-the-vibe">Live the vibe</a></li>
      </ol>
    </section>`;
}

export function renderVoyageDeckDirectoryHtml() {
  const deckRows = VOYAGE_DECKS.map(
    (d) =>
      `<a class="voyage-deck-door" href="${voyageDeckHref(d.slug)}"><div class="voyage-deck-door__inner">${renderDirectoryThumb(d.image, d.imageAlt)}<div class="deck-row"><strong>${d.label}:</strong> ${d.tags}</div></div></a>`,
  ).join('\n      ');

  const cabinArticles = VOYAGE_CABINS.map(
    (c) =>
      `<a class="voyage-cabin-door" href="${voyageCabinHref(c.slug)}"><article class="voyage-cabin-door__inner">${renderDirectoryThumb(c.image, c.imageAlt)}<div class="voyage-cabin-door__body"><span class="sku">${c.skuDisplay}</span> <strong>${c.name}</strong> — ${c.lead}</div></article></a>`,
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
        ? `<li><a href="${voyageCabinHref(c.slug)}">${c.skuDisplay} · ${c.name}</a> (${c.serials.length} home${c.serials.length === 1 ? '' : 's'})</li>`
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
      <a href="/frontiersman-voyage">Voyage brochure</a>
      <a href="/lattice-chat/">Lattice Chat</a>
    </nav>
    ${renderHeroImage(deck.image, deck.imageAlt)}
    <header>
      <p class="kicker">Deck tour · SS Vibelandia</p>
      <h1>${deck.label}</h1>
      <p class="dateline"><strong>${deck.tags}</strong></p>
    </header>
    <p class="lead">${deck.lead}</p>
    ${bodyHtml}
    <p class="voyage-captain-reach">${CAPTAIN_PENTHOUSE_REACH} <a href="${voyageCabinHref('ph-001')}">Open PH-001</a></p>
    ${cabinBlock}
    <p class="honesty"><strong>Ship promise:</strong> Human care first. Belonging is voluntary. Φ ≈ 1.618 is our design language. ${VOYAGE_DOOR_SPINE}</p>
    <div class="cta-row">${actionsHtml}<a class="btn btn-ghost" href="${voyageDirectoryHref()}">All decks &amp; cabins</a></div>
    <div class="voyage-purser"><p class="voyage-purser__h">Purser's Desk</p><p>Deck 4 · The Grove · <a href="mailto:info@fractiai.com?subject=Purser%20Fair%20Exchange">info@fractiai.com</a></p></div>
    <footer>SS Vibelandia · Frontiersman Voyage · → ∞^∞</footer>
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
      <p class="kicker">${cabin.kicker || `Your cabin · ${cabin.skuDisplay} · ${deck ? deck.label : 'Voyage'}`}</p>
      <h1>${cabin.name}</h1>
      <p class="dateline"><strong>${cabin.lead}</strong></p>
    </header>
    ${bodyHtml}
    ${renderSerialGrid(cabin.serials)}
    <p class="honesty"><strong>Ship promise:</strong> These names are homes on the vessel — hospitality catalog, not a membership test. ${VOYAGE_DOOR_SPINE}</p>
    <div class="cta-row">${actionsHtml}<a class="btn btn-ghost" href="${voyageDirectoryHref()}">All decks &amp; cabins</a></div>
    <div class="voyage-purser"><p class="voyage-purser__h">Purser's Desk</p><p>Deck 4 · The Grove · <a href="mailto:info@fractiai.com?subject=Purser%20Fair%20Exchange">info@fractiai.com</a></p></div>
    <footer>SS Vibelandia · Frontiersman Voyage · → ∞^∞</footer>
  </article>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
</body>
</html>`;
}

export function renderVoyageDirectoryIndexHtml() {
  const canonical = `https://www.ssvibelandiaquestfest24x365.com${voyageDirectoryHref()}`;
  const deckCards = VOYAGE_DECKS.map(
    (d) =>
      `<li><a href="${voyageDeckHref(d.slug)}">${renderDirectoryThumb(d.image, d.imageAlt)}<span class="voyage-directory-card__text"><strong>${d.label}</strong><span>${d.tags}</span></span></a></li>`,
  ).join('\n        ');
  const cabinCards = VOYAGE_CABINS.map(
    (c) =>
      `<li><a href="${voyageCabinHref(c.slug)}">${renderDirectoryThumb(c.image, c.imageAlt)}<span class="voyage-directory-card__text"><span class="sku">${c.skuDisplay}</span> <strong>${c.name}</strong><span>${c.serials.length} home${c.serials.length === 1 ? '' : 's'}</span></span></a></li>`,
  ).join('\n        ');

  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Voyage Map · Story · Experiences · Homes · SS Vibelandia</title>
  <meta name="description" content="Voyage map — grand narrative, arrival loop, experiences, then decks, landfalls, and cabin homes on the SS Vibelandia holographic cruise." />
  <link rel="canonical" href="${canonical}" />
  <meta property="og:title" content="Voyage Map · SS Vibelandia" />
  <meta property="og:description" content="Story first — ask, choose, prepare, arrive, and live the frequency — then decks, cabins, and venues." />
  <meta property="og:image" content="https://www.ssvibelandiaquestfest24x365.com${VOYAGE_MAP_STORY_HERO}" />
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
    ${renderHeroImage(
      VOYAGE_MAP_STORY_HERO,
      'First-person from the bow of SS Vibelandia. Gold chain rail in your hands. El Gran Sol on the horizon over a navy sea.',
      { story: true, eager: true },
    )}
    <header>
      <p class="kicker">Come aboard · Frontiersman Voyage</p>
      <h1>Voyage Map</h1>
      <p class="dateline">${VOYAGE_DOOR_SPINE}</p>
    </header>
    <p class="lead">You are already on the bow. Story first. Choices next. Homes when you are ready. The map <em>is</em> the ship.</p>
    ${renderVoyageMapPreludeHtml()}
    ${renderVoyageMapDiagramHtml()}
    <h2 id="voyage-homes-h">Decks · cabins · venues</h2>
    <p class="voyage-map-prelude__hint">Your homes and venues on the vessel — after the voyage story above:</p>
    <h3>Decks</h3>
    <ul class="voyage-directory-list">${deckCards}</ul>
    <h3>Cabins &amp; penthouses</h3>
    <ul class="voyage-directory-list">${cabinCards}</ul>
    <p class="honesty"><strong>Ship promise:</strong> Decks are places to live. Cabins are homes. Φ ≈ 1.618 is our design language — honor with honesty.</p>
    <div class="cta-row">
      <a class="btn btn-gold" href="/frontiersman-voyage">Full brochure</a>
      <a class="btn btn-ghost" href="/voyage/select">Select your home</a>
      <a class="btn btn-ghost" href="${SITE_HOME_HREF}">${SITE_HOME_LABEL}</a>
    </div>
    <footer>SS Vibelandia · → ∞^∞</footer>
  </article>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
</body>
</html>`;
}
