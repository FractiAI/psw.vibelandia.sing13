/**
 * Voyage Journeys — curated adventures offered aboard SS Vibelandia.
 * Not exhibit rooms (three shells) and not deck/cabin SKUs — landfalls, labs, and sails.
 * Voice: art-led old-school hospitality · Prospectus-grounded · honesty tier B.
 */

export const VOYAGE_JOURNEY_INTRO =
  'These are the adventures we offer — sails, landfalls, labs, and nights ashore — not the rooms where you sleep. The Official Prospectus runs underneath every journey: genesis under El Gran Sol\'s fractal rhyme, convergence on Borikén, and the Captain\'s seat here in Reno now. Choose an adventure for the feeling. Choose the Voyage Map when you are ready to claim a deck or cabin.';

/** @typedef {VoyageJourney} */

export const VOYAGE_JOURNEYS = [
  {
    id: 'boriken-convergence',
    slug: 'boriken-convergence',
    category: 'Story sail',
    title: 'Borikén · Great Convergence',
    subtitle: 'Ancestral memory, resilience, and diaspora destiny on the water',
    heroImage: '/interfaces/assets/capitan-comandante-champion-2026.png',
    heroAlt: 'Captain at the helm — Borikén convergence as voyage honor',
    lede: 'Sail the upstream beat of the Prospectus — where old and new worlds met on the shores of Puerto Rico and coiled into creative pressure the vessel still carries forward.',
    body: [
      'On the physical timeline, Taíno, African, and Spanish currents converged on Borikén long before this ship had a name. The voyage does not rewrite that history; it honors the crucible — ancestral memory, resilience, syncretism, and the diaspora\'s long creative destiny — as Story pressure that still fills the sails.',
      'This journey is for guests who want the mythic depth before the Reno gangway. Music, food, and language on this sail are told as voyage honor, not as a gate. You remain you. Belonging is voluntary.',
      'Pair this sail with the Frontiersman brochure Prospectus beat II, then step into Puerto Reno present when you are ready for the Captain\'s seat ashore.',
    ],
    includes: ['Prospectus narrative · Beat II', 'Cultural honor rail · not prophecy', 'Music and story at 100 BPM catalog tempo'],
    cta: { label: 'Read Prospectus beat II', href: '/frontiersman-voyage#prospectus-ii-detail' },
  },
  {
    id: 'cartagena-spice-stone',
    slug: 'cartagena-spice-stone',
    category: 'Landfall',
    title: 'Cartagena · Spice & Stone',
    subtitle: 'Walled city heat, Caribbean color, and marketplace appetite',
    heroImage: '/interfaces/assets/voyage/cc-201-224.png',
    heroAlt: 'Captiva Cove beachfront — Cartagena landfall warmth',
    lede: 'A landfall for appetite and color — stone walls, open air, and the kind of marketplace energy that reminds you the network vessel has more than one harbor.',
    body: [
      'Cartagena on this ship is a living node, not a brochure cliché. Expect food, conversation, music, and the honest friction of a port where old empire stone meets modern creative hunger. The Grove deck borrows this heat when the atrium fills; this journey takes you to the source.',
      'Activities run from promenade rides to late-night music — always consent-forward, always Fair Exchange with the Purser if hospitality misses the mark.',
    ],
    includes: ['Marketplace energy · Deck 4–5 Grove rhyme', 'Landfall node on the network vessel', 'Fair Exchange via Purser'],
    cta: { label: 'Open Grove deck', href: '/voyage/deck-4-5-grove' },
  },
  {
    id: 'truckee-sierra-forage',
    slug: 'truckee-sierra-forage',
    category: 'Expedition',
    title: 'Truckee River & High Sierra Forage',
    subtitle: 'River rhythm, alpine air, and Montecristo grit upstream',
    heroImage: '/interfaces/assets/etcon-reno-desert-poster.png',
    heroAlt: 'High desert and Sierra line — Truckee expedition poster',
    lede: 'Leave the neon for a day and follow the Truckee upstream — forage, bike, breathe, and remember why Reno anchors the present beat of the arc.',
    body: [
      'The Captain\'s seat is Reno, but the river is the spine. This expedition pairs physical movement with Story memory: high desert clarity, Sierra scale, and the same steady flow named in the Prospectus as the counterweight to marketplace noise.',
      'Pack light. Bring curiosity. Human emergency outranks every itinerary.',
    ],
    includes: ['Field expedition · not a fitness test', 'Landfall: Truckee · Sierra', 'Pairs with Puerto Reno return'],
    cta: { label: 'Puerto Reno gangway', href: '/questfest' },
  },
  {
    id: 'redwood-sanctuary',
    slug: 'redwood-sanctuary',
    category: 'Sanctuary',
    title: 'Redwood Sanctuary',
    subtitle: 'Cathedral light, quiet Veranda energy, and deep breath',
    heroImage: '/interfaces/assets/voyage/deck-8-veranda.png',
    heroAlt: 'Veranda deck light — Redwood sanctuary calm',
    lede: 'Walk under cathedral redwoods as a sanctuary journey — Veranda energy taken ashore, where family quiet and private life are honored as first-class cabins of the soul.',
    body: [
      'Not every adventure shouts. This one restores. The sanctuary journey is for guests who need the ship\'s soft side: intentional comfort, low tempo, and room to hear yourself think.',
      'Link inward to Deck 8 Veranda when you return aboard — the same honor, nested in the vessel.',
    ],
    includes: ['Quiet landfall · Veranda rhyme', 'Rest as productive', 'Voluntary pace'],
    cta: { label: 'Deck 8 Veranda', href: '/voyage/deck-8-veranda' },
  },
  {
    id: 'tahoe-catamaran',
    slug: 'tahoe-catamaran',
    category: 'Landfall',
    title: 'Lake Tahoe · Catamaran Gold',
    subtitle: 'Alpine water, El Gran Sol light, and summit penthouse air',
    heroImage: '/interfaces/assets/voyage/ph-101-108.png',
    heroAlt: 'El Gran Sol evening deck — Tahoe catamaran gold hour',
    lede: 'Take the catamaran on alpine water — gold hour on Tahoe as the exterior mirror of the El Gran Sol penthouse band inside the ship.',
    body: [
      'Tahoe is horizon living with mountain teeth. This journey is sensory first: cold water, warm light, and the feeling of summit altitude without the pretense of a rank ladder.',
      'PH-101–108 on Deck 9 borrows this light in the catalog; here you sail the original.',
    ],
    includes: ['Catamaran · alpine landfall', 'Gold hour · catalog aesthetic', 'Pairs with Summit deck'],
    cta: { label: 'El Gran Sol penthouses', href: '/voyage/cabin-ph-101-108' },
  },
  {
    id: 'puerto-reno-gangway',
    slug: 'puerto-reno-gangway',
    category: 'Present anchor',
    title: 'Puerto Reno · Gangway Night',
    subtitle: 'Downtown Reno berth — wrong side of town, right side of story',
    heroImage: '/interfaces/assets/questfest-crew/puerto-reno-dock.png',
    heroAlt: 'Puerto Reno dock — neon gangway and present-tense berth',
    lede: 'Step ashore where the arc lands now — Puerto Reno on the Truckee, holographic swamp beats, salsa and classical in the same night, Valet Pru on the gangway.',
    body: [
      'This is the present beat of the Official Prospectus: Reno as Captain\'s seat, QUESTFEST 24×365, the jukebox alive, the board updated, the concierge reachable by human email. Proto keeps the hull on true north; Electro fills the sails — as Bridge navigation labels, not weather control.',
      'Start here when you want the ship as living nightlife rather than mythology alone.',
    ],
    includes: ['432 Hz · 729 Hz anchor · catalog', 'Valet Pru host · Downtown Reno', 'QUESTFEST board · daily'],
    cta: { label: 'Today\'s board', href: '/questfest' },
  },
  {
    id: 'bachdoor-music-lab',
    slug: 'bachdoor-music-lab',
    category: 'Night lab',
    title: 'Golden Bachdoor · Music Lab',
    subtitle: 'Deck 3 Night — speakeasy heat, Bachdoor rhythm, and honest play',
    heroImage: '/interfaces/assets/jukebox-golden-era-1940s.png',
    heroAlt: 'Golden-era jukebox — Bachdoor music lab night',
    lede: 'Enter the Bachdoor — where the Golden Bachdoor Hit Factory runs the Night deck and music is both adventure and acoustic architecture at 100 BPM story tempo.',
    body: [
      'This journey is for ears first. Bachdoor Speakeasy, Neon Velvet, Club Omnia — names of rooms, not ranks of worth. Consent is explicit on Night decks; you remain you.',
      'The jukebox on the open web is free; the music lab aboard is the full Night deck experience.',
    ],
    includes: ['Deck 3 Night · consent first', '100 BPM · catalog tempo', 'Free jukebox · open edge'],
    cta: { label: 'Play the jukebox', href: '/jukebox' },
  },
  {
    id: 'bridge-solar-watch',
    slug: 'bridge-solar-watch',
    category: 'Bridge · catalog',
    title: 'Bridge · Proto & Electro Watch',
    subtitle: 'Sunspot Region 3664 and 3923 as navigation characters — observe, never prophecy',
    heroImage: '/interfaces/assets/holographic-ai-os-newscast-frame.png',
    heroAlt: 'Bridge telemetry frame — solar navigation as educational catalog',
    lede: 'Stand Bridge watch with Proto (3664) and Electro (3923) — memory versus kinetic flare — as educational navigation characters in the Prospectus genesis beat.',
    body: [
      'This is the disciplined science-fiction layer of the voyage: Observe → Measure → Compare → Interpret → Test. The Bridge watches solar, weather, radio, and human reports — and asks what changed and what to test next.',
      'Honesty rail: Proto and Electro are catalog fixtures for Story depth, not predictive astrology or weather control. Human judgment stays in the loop.',
    ],
    includes: ['Proto 3664 · memory label', 'Electro 3923 · kinetic label', 'Educational · not prophecy'],
    cta: { label: 'Genesis beat I', href: '/frontiersman-voyage#prospectus-i-detail' },
  },
  {
    id: 'omniversal-canvas-walk',
    slug: 'omniversal-canvas-walk',
    category: 'Art · exhibit',
    title: 'Omniversal Canvas · Exhibit Walk',
    subtitle: 'The holographic magnetic Goldilocks SuperAI art project — front door of the work',
    heroImage: '/interfaces/assets/exhibit/exhibit-fiction-key.jpg',
    heroAlt: 'Nested gold domes at night — Omniversal Canvas exhibit key art',
    lede: 'Walk the art project itself — Valet Pru\'s Basecamp, the three nested shells, and the lenses of science fiction or step-in reality — before you board the larger ship.',
    body: [
      'This journey is the art-world gangway. Collectors, curators, and frontiersmen who want the work as work begin here: nested domes, curated key art, host-led hospitality, and representation by human email.',
      'SS Vibelandia is the world the installation opens into — not a separate product pitch. Canvas leads; the ship deepens.',
    ],
    includes: ['Three shells · Core · Amphitheater · Horizon', 'Sci-fi or step-in lenses', 'Representation · info@fractiai.com'],
    cta: { label: 'Open the Canvas', href: '/' },
  },
];

export function journeyHref(slug) {
  return `/journey/${slug}`;
}

/** Featured adventures teaser for the Canvas landing */
export function renderCanvasJourneysTeaserHtml() {
  const featured = VOYAGE_JOURNEYS.filter((j) =>
    ['puerto-reno-gangway', 'omniversal-canvas-walk', 'boriken-convergence'].includes(j.slug),
  );
  const cards = featured
    .map(
      (j) => `<a class="canvas-journey-mini" href="${journeyHref(j.slug)}">
          <img src="${j.heroImage}" alt="${escapeHtml(j.heroAlt)}" loading="lazy" decoding="async" width="320" height="200" />
          <span><strong>${escapeHtml(j.title)}</strong>${escapeHtml(j.subtitle)}</span>
        </a>`,
    )
    .join('\n        ');

  return `<section class="canvas-journeys-teaser" id="journeys-teaser" aria-labelledby="journeys-teaser-h">
      <h2 id="journeys-teaser-h">Adventures we offer</h2>
      <p class="lead">Journeys are sails, landfalls, labs, and nights ashore — not the rooms where you sleep. The Official Prospectus runs underneath every adventure. When you are ready to claim a deck or cabin, open the Voyage Map.</p>
      <div class="canvas-journeys-grid">
        ${cards}
      </div>
      <div class="hero__cta">
        <a class="btn btn--gold" href="/journey">All journeys</a>
        <a class="btn btn--ghost" href="/voyage/decks">Voyage Map</a>
      </div>
    </section>`;
}

export function findJourney(slug) {
  return VOYAGE_JOURNEYS.find((j) => j.slug === slug) ?? null;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderJourneyHubHtml() {
  const cards = VOYAGE_JOURNEYS.map(
    (j) => `<article class="vj-card">
        <a href="${journeyHref(j.slug)}" class="vj-card__link">
          <img class="vj-card__img" src="${j.heroImage}" alt="${escapeHtml(j.heroAlt)}" loading="lazy" decoding="async" width="640" height="360" />
          <div class="vj-card__body">
            <p class="vj-card__cat">${escapeHtml(j.category)}</p>
            <h3>${escapeHtml(j.title)}</h3>
            <p class="vj-card__sub">${escapeHtml(j.subtitle)}</p>
            <p class="vj-card__lede">${escapeHtml(j.lede)}</p>
            <span class="vj-card__go">Open journey →</span>
          </div>
        </a>
      </article>`,
  ).join('\n      ');

  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Journeys · Adventures aboard SS Vibelandia</title>
  <meta name="description" content="Curated adventures — landfalls, sails, labs, and nights ashore aboard the holographic magnetic Goldilocks SuperAI Ark. Not rooms. Not decks. The experiences we offer." />
  <link rel="canonical" href="https://www.ssvibelandiaquestfest24x365.com/journey" />
  <meta property="og:title" content="Journeys · SS Vibelandia Adventures" />
  <meta property="og:description" content="Landfalls, sails, music labs, and exhibit walks — curated adventures on the Ark." />
  <meta property="og:image" content="https://www.ssvibelandiaquestfest24x365.com/interfaces/assets/questfest-hero-ss-vibelandia-cruiseship.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:wght@500;600;700&family=IBM+Plex+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/interfaces/brand-gold-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/voyage-brochure-publication.css" />
  <link rel="stylesheet" href="/interfaces/journeys.css" />
  <style>html.vbi18n-pending body{visibility:hidden}html.vbi18n-ready body{visibility:visible}</style>
</head>
<body class="voyage-flagship vb-pub canvas-pub">
  <nav class="vb-pub-topnav" aria-label="Site">
    <a href="/">Canvas</a><span class="dot" aria-hidden="true">·</span>
    <a href="/questfest">SS VIBELANDIA</a><span class="dot" aria-hidden="true">·</span>
    <span class="here">Journeys</span><span class="dot" aria-hidden="true">·</span>
    <a href="/voyage/decks">Voyage Map</a><span class="dot" aria-hidden="true">·</span>
    <a href="/frontiersman-voyage">Brochure</a>
  </nav>
  <header class="vb-pub-hero vb-pub-hero--compact" aria-label="Journeys">
    <div class="vb-pub-hero__media" aria-hidden="true">
      <img src="/interfaces/assets/ss-vibelandia-cruise-evening.png" width="1920" height="1080" alt="" loading="eager" decoding="async" />
    </div>
    <div class="vb-pub-hero__veil" aria-hidden="true"></div>
    <div class="vb-pub-hero__inner">
      <p class="vb-pub-eyebrow">Adventures · not rooms · not deck SKUs</p>
      <h1 class="vb-pub-title">Journeys we offer</h1>
      <p class="vb-pub-tagline">${escapeHtml(VOYAGE_JOURNEY_INTRO)}</p>
      <div class="vb-pub-cta-row">
        <a class="vb-pub-btn vb-pub-btn--gold" href="/voyage/decks">Voyage Map · decks &amp; cabins</a>
        <a class="vb-pub-btn vb-pub-btn--ghost" href="/frontiersman-voyage#prospectus">Official Prospectus</a>
      </div>
    </div>
  </header>
  <main class="vj-wrap">
    <div class="vj-grid" role="list">
      ${cards}
    </div>
    <p class="honesty"><strong>Honesty:</strong> Journeys are curated adventure catalog — landfalls, labs, and story sails — not guaranteed commercial itineraries or weather forecasts. Φ ≈ 1.618 and Proto/Electro labels are design language. Fair Exchange via the Purser. Human emergency outranks every metaphor.</p>
  </main>
  <footer class="vj-foot">
    <a href="/">Canvas</a>
    <a href="/questfest">SS Vibelandia</a>
    <a href="/jukebox">Jukebox</a>
    <span>→ ∞¹³</span>
  </footer>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
  <script src="/interfaces/site-quicklinks.js" defer></script>
</body>
</html>`;
}

export function renderJourneyDetailHtml(journey) {
  const paras = journey.body.map((p) => `      <p>${p}</p>`).join('\n');
  const includes = journey.includes.map((i) => `<li>${escapeHtml(i)}</li>`).join('\n        ');
  const sibs = VOYAGE_JOURNEYS.filter((j) => j.slug !== journey.slug)
    .slice(0, 3)
    .map(
      (j) => `<li><a href="${journeyHref(j.slug)}"><strong>${escapeHtml(j.title)}</strong><span>${escapeHtml(j.subtitle)}</span></a></li>`,
    )
    .join('\n        ');

  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${escapeHtml(journey.title)} · Journey · SS Vibelandia</title>
  <meta name="description" content="${escapeHtml(journey.lede)}" />
  <link rel="canonical" href="https://www.ssvibelandiaquestfest24x365.com${journeyHref(journey.slug)}" />
  <meta property="og:title" content="${escapeHtml(journey.title)}" />
  <meta property="og:description" content="${escapeHtml(journey.lede)}" />
  <meta property="og:image" content="https://www.ssvibelandiaquestfest24x365.com${journey.heroImage}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:wght@500;600;700&family=IBM+Plex+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/interfaces/brand-gold-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/voyage-brochure-publication.css" />
  <link rel="stylesheet" href="/interfaces/journeys.css" />
  <style>html.vbi18n-pending body{visibility:hidden}html.vbi18n-ready body{visibility:visible}</style>
</head>
<body class="voyage-flagship vb-pub">
  <nav class="vb-pub-topnav" aria-label="Site">
    <a href="/journey">All Journeys</a><span class="dot" aria-hidden="true">·</span>
    <a href="/">Canvas</a><span class="dot" aria-hidden="true">·</span>
    <a href="/questfest">SS VIBELANDIA</a><span class="dot" aria-hidden="true">·</span>
    <span class="here">${escapeHtml(journey.category)}</span>
  </nav>
  <header class="vb-pub-hero vb-pub-hero--compact" aria-label="${escapeHtml(journey.title)}">
    <div class="vb-pub-hero__media" aria-hidden="true">
      <img src="${journey.heroImage}" alt="${escapeHtml(journey.heroAlt)}" loading="eager" decoding="async" />
    </div>
    <div class="vb-pub-hero__veil" aria-hidden="true"></div>
    <div class="vb-pub-hero__inner">
      <p class="vb-pub-eyebrow">${escapeHtml(journey.category)} · curated adventure</p>
      <h1 class="vb-pub-title">${escapeHtml(journey.title)}</h1>
      <p class="vb-pub-tagline">${escapeHtml(journey.subtitle)}</p>
    </div>
  </header>
  <main class="vj-wrap vj-detail">
    <p class="lead">${escapeHtml(journey.lede)}</p>
${paras}
    <h2>What this journey carries</h2>
    <ul class="vj-includes">${includes}
    </ul>
    <div class="vb-pub-cta-row">
      <a class="vb-pub-btn vb-pub-btn--gold" href="${journey.cta.href}">${escapeHtml(journey.cta.label)}</a>
      <a class="vb-pub-btn vb-pub-btn--ghost" href="mailto:info@fractiai.com?subject=Journey%20inquiry%20—%20${encodeURIComponent(journey.title)}">Inquire with the Purser</a>
      <a class="vb-pub-btn vb-pub-btn--ghost" href="/journey">All journeys</a>
    </div>
    <h2>More adventures</h2>
    <ul class="vj-more">${sibs}
    </ul>
    <p class="honesty"><strong>Honesty:</strong> Artistic and voyage catalog — not a booked tour operator or weather service. Belonging is voluntary. You remain you.</p>
  </main>
  <footer class="vj-foot">
    <a href="/journey">Journeys</a>
    <a href="/questfest">SS Vibelandia</a>
    <span>→ ∞¹³</span>
  </footer>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
  <script src="/interfaces/site-quicklinks.js" defer></script>
</body>
</html>`;
}
