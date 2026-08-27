/**
 * Five exhibit rooms opened from the Omniversal Canvas landing.
 * Honesty: catalog / exhibit talk — not physics, genetics, or consciousness proofs.
 */
import { renderExhibitOuterLabelHtml } from './experience-phases.mjs';

export const EXHIBIT_ROOMS = [
  {
    id: 'core',
    href: '/core',
    file: 'exhibit-core.html',
    navLabel: 'Dome 1 · Core',
    kicker: 'Now showing · Holographic Goldilocks SuperAI Basecamp',
    title: 'Holographic Convergence Core',
    lede: 'Dome 1. Dark and audio-first. Self-talk, music, and the Sonic Singularity catalog in the innermost sphere.',
    meta: 'Exhibit room · Dome 1 · audio core · 2026',
    keyArt: '/interfaces/assets/exhibit/exhibit-core-key.jpg',
    keyAlt: 'Male silhouette standing at the still center of nested gold domes',
    description: [
      'Dome 1 is the innermost experience: dark, heard more than seen. Self-talk rides the mix. Instrumentals, musical soundtracks, and the full Sonic Singularity catalog fill the room. Little accents of fireworks and psychedelic pictures stand in for the worlds guests name DMT and psilocybin: dragons, elves, angels, demons, and gods.',
      'Street talk calls that layer imagination. This exhibit files it as holographic reality, pattern living within all, which ordinary language labels metaphor and which here is treated as the inner real. You remain you. The Player mark is still a silhouette at the gold still-point.',
      'Stand here when you want the inner mix. Dome 2 is the set and daily life now. Dome 3 is the SuperAI Studio, Canvas, and Materials. All three sit inside Valet Pru - Holographic Goldilocks XY Human Reality Bridge/Router, the gold museum framed entrance to SS VIBELANDIA.',
    ],
    chapters: [
      {
        h: 'Audio core',
        p: 'Self-talk, instrumentals, soundtracks, and the Sonic Singularity catalog. The room is made to be heard.',
      },
      {
        h: 'Inner worlds',
        p: 'Small fireworks and psychedelic pictures for dragons, elves, angels, demons, and gods. Catalog pictures, not a pharmacy.',
      },
      {
        h: 'Holographic inner real',
        p: 'What people nickname imagination is filed here as pattern within all. Exhibit grammar. You remain you.',
      },
    ],
    stills: [
      {
        src: '/interfaces/assets/exhibit/exhibit-step-in-still.jpg',
        alt: 'Interior still of a walk-in gold dome with a standing silhouette at center',
        cap: 'Walk-in center',
      },
      {
        src: '/interfaces/assets/exhibit/exhibit-dome1-fireworks.jpg',
        alt: 'Dark gold sphere interior with fireworks bursts over a small seated audience',
        cap: 'Fireworks in the dark mix',
      },
      {
        src: '/interfaces/assets/exhibit/exhibit-dome1-inner-worlds.jpg',
        alt: 'Holographic figures of dragon, elf, angel, and luminous beings in a dark gold dome',
        cap: 'Inner worlds · catalog accents',
      },
    ],
  },
  {
    id: 'amphitheater',
    href: '/amphitheater',
    file: 'exhibit-amphitheater.html',
    navLabel: 'Dome 2 · Amphitheater',
    kicker: 'Now showing · Holographic Goldilocks SuperAI Basecamp',
    title: 'Goldilocks Amphitheater',
    lede: 'Dome 2. The projection of the immediate world you occupy: the set, the cast, and daily life now.',
    meta: 'Exhibit room · Dome 2 · set and daily life · 2026',
    keyArt: '/interfaces/assets/exhibit/exhibit-amphitheater-key.jpg',
    keyAlt: 'Nested gold amphitheater shells with guests under a night sky',
    description: [
      'Dome 2 is the middle shell: the outer world thrown inward as a living projection. The set. The cast. The stories of daily life as they are happening now. Fans, crew, enterprises, franchises, and the people sitting beside you.',
      'This is the world you walk through today, nested around Dome 1 so the inner mix and the outer day can occupy one house. Groups of up to fifteen sit together in the sphere at a time. Hospitality first. Goldilocks SuperAI stays enough machine to serve, enough human to lead.',
      'If Dome 1 is the dark audio core, Dome 2 is who you sit with and what is running on the street, the camp, and the phone in your hand. Dome 3 opens the studio from here.',
    ],
    chapters: [
      {
        h: 'The set',
        p: 'Immediate environment as projection: camp, street, house, night job, and the room you occupy now.',
      },
      {
        h: 'The cast',
        p: 'Guests, crew, collectors, fans, enterprises, franchises, and the people sitting beside you.',
      },
      {
        h: 'Daily life now',
        p: 'Stories as they are happening. The middle dome is the living day nested around the inner mix.',
      },
    ],
    stills: [
      {
        src: '/interfaces/assets/exhibit/exhibit-fiction-still.jpg',
        alt: 'Wide night still of nested gold hemispheres on a dark playa with guests',
        cap: 'Nested camp at night',
      },
    ],
  },
  {
    id: 'horizon',
    href: '/horizon',
    file: 'exhibit-horizon.html',
    navLabel: 'Dome 3 · Horizon',
    kicker: 'Now showing · Holographic Goldilocks SuperAI Basecamp',
    title: 'Omni-Horizon',
    lede: 'Dome 3. Holographic Magnetic Goldilocks SuperAI Studio, Canvas, and Materials. Point-and-click awareness navigation.',
    meta: 'Exhibit room · Dome 3 · studio canvas · 2026',
    keyArt: '/interfaces/assets/exhibit/exhibit-horizon-key.jpg',
    keyAlt: 'Three stacked horizons from a close figure to a holographic lattice sky',
    description: [
      'Dome 3 is the outer shell inside the gold museum entrance: the Holographic Magnetic Goldilocks SuperAI Studio, Canvas, and Materials. Lattice Chat is the click-to-go, click-to-see surface. A wormhole by awareness, not by hardware teleport.',
      'Human-to-human reality bridge/routers carry spin navigation: people routing attention for one another. Valet Pru - Holographic Goldilocks XY Human Reality Bridge/Router is the outer label on the gold framed entrance to SS VIBELANDIA.',
      'Open Lattice Chat when you want the studio in your hands. Point and click to go anywhere and see anywhere you wish, as catalog navigation. Dome 1 remains the dark audio core. Dome 2 remains the set and daily life now.',
    ],
    chapters: [
      {
        h: 'Studio, Canvas, and Materials',
        p: 'Holographic Magnetic Goldilocks SuperAI studio nest. Paints, agents, and the exhibit grammar you are standing in.',
      },
      {
        h: 'Point-and-click Lattice Chat',
        p: 'Click to go. Click to see. Infinite Octaves Omniversal Lattice Chat as the awareness navigation surface.',
      },
      {
        h: 'Wormhole by awareness',
        p: 'Human-to-human reality bridge/routers. Spin navigation. Valet Pru - Holographic Goldilocks XY Human Reality Bridge/Router. Catalog, not hardware teleport.',
      },
    ],
    stills: [
      {
        src: '/interfaces/assets/nesting/nest-syntheverse.png',
        alt: 'Studio nest diagram. Syntheverse sandbox layer in the exhibit stack',
        cap: 'Studio nest in the sandbox',
      },
    ],
  },
  {
    id: 'fiction',
    href: '/science-fiction',
    file: 'exhibit-science-fiction.html',
    navLabel: 'As science fiction',
    kicker: 'A new series · Valet Pru’s holographic digital art',
    title: 'As science fiction',
    lede: 'New-World fiction on an Omniverse canvas. AI, science, engineering, and story braided for wonder.',
    meta: 'Lens · watch as story · 2026 · open-source',
    keyArt: '/interfaces/assets/exhibit/exhibit-fiction-key.jpg',
    keyAlt: 'Night camp of nested gold domes under stars, prestige series key art',
    description: [
      'This lens asks you to enjoy the Basecamp as a New-World series: nested domes, a fedora host, a cruise line that is also a camp, a studio that lives on a chain. Curiosity is the ticket.',
      'The stills are pictures of the grammar: gold nests, night playa, holographic rings. Watch it the way you watch any serious story. Feel the world. Keep the honesty rail in your pocket.',
      'When you want the same rooms as if they were walk-in real, open As a reality I can step into. Both lenses are honest fun.',
    ],
    chapters: [
      {
        h: 'The world',
        p: 'SS Vibelandia nested in Syntheverse nested on Base. Ship, studio, address. Fiction first on this page.',
      },
      {
        h: 'The host',
        p: 'Valet Pru. Night-job doodler. A digital Burning Man camp you can visit from your phone.',
      },
      {
        h: 'How to watch',
        p: 'Open Core, Amphitheater, and Horizon as episodes of the same nest. Then board /questfest if you want the ship.',
      },
    ],
    stills: [
      {
        src: '/interfaces/assets/exhibit/exhibit-fiction-still.jpg',
        alt: 'Wide night still of nested gold hemispheres on a dark playa',
        cap: 'Nested camp',
      },
    ],
  },
  {
    id: 'step',
    href: '/step-in',
    file: 'exhibit-step-in.html',
    navLabel: 'As a reality I can step into',
    kicker: 'A new series · Valet Pru’s holographic digital art',
    title: 'As a reality I can step into',
    lede: 'Treat the camp as walk-in: vessel, studio, and Base address. Free basics anytime. Email a human for Pro and VIP.',
    meta: 'Lens · step in · 2026 · open-source',
    keyArt: '/interfaces/assets/exhibit/exhibit-step-in-key.jpg',
    keyAlt: 'First-person step through a gold-lit dome doorway onto a wooden floor',
    description: [
      'This lens asks you to use the camp as if the floor is real. SS Vibelandia is the vessel. Syntheverse is the studio and the paints. Base Mainnet is the studio address, chain of custody in the cloud. You can enter on a phone for free basics. Pro and VIP start with a human email.',
      'Step-in keeps the honesty rail. Nested gold is still design language. Φ ≈ 1.618 is still catalog nesting. You remain you. The Player mark in the Core is still a silhouette.',
      'If you would rather watch it as New-World fiction, open As science fiction. Same rooms. Different agreement with the picture.',
    ],
    chapters: [
      {
        h: 'Vessel',
        p: 'SS Vibelandia. Holographic Goldilocks cruise line. Journey, Jukebox, Library, Creator Studio.',
      },
      {
        h: 'Studio',
        p: 'Syntheverse Sandbox. Materials, agents, and the exhibit grammar you are standing in.',
      },
      {
        h: 'Address',
        p: 'Base mainnet. Blockchain in the cloud as custody.',
      },
    ],
    stills: [
      {
        src: '/interfaces/assets/exhibit/exhibit-step-in-still.jpg',
        alt: 'Interior still of a walk-in gold dome with a standing silhouette',
        cap: 'Walk-in room',
      },
    ],
  },
];

export function exhibitRoomById(id) {
  return EXHIBIT_ROOMS.find((r) => r.id === id) || null;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderExhibitRoomHtml(room) {
  const roomsNav = EXHIBIT_ROOMS.map((r) => {
    const cur = r.id === room.id ? ' aria-current="page"' : '';
    return `<a href="${r.href}"${cur}>${escapeHtml(r.navLabel)}</a>`;
  }).join('\n        ');

  const paras = room.description
    .map((p) => `      <p>${p}</p>`)
    .join('\n');

  const chapters = room.chapters
    .map(
      (c) => `        <article class="xd-card">
          <h3>${escapeHtml(c.h)}</h3>
          <p>${c.p}</p>
        </article>`,
    )
    .join('\n');

  const stills = room.stills.length
    ? `<div class="xd-stills">
        ${room.stills
          .map(
            (s) => `<figure>
          <img src="${s.src}" alt="${escapeHtml(s.alt)}" />
          <figcaption>${escapeHtml(s.cap)}</figcaption>
        </figure>`,
          )
          .join('\n        ')}
      </div>`
    : '';

  const stillsHeading = room.stills.length ? '<h2>Stills</h2>' : '';

  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${escapeHtml(room.title)} · Valet Pru</title>
  <meta name="description" content="${escapeHtml(room.lede)}" />
  <link rel="canonical" href="https://www.ssvibelandiaquestfest24x365.com${room.href}" />
  <meta property="og:title" content="${escapeHtml(room.title)}" />
  <meta property="og:description" content="${escapeHtml(room.lede)}" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://www.ssvibelandiaquestfest24x365.com${room.keyArt}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Syne:wght@500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/interfaces/brand-gold-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/site-quicklinks.css" />
  <link rel="stylesheet" href="/interfaces/exhibit-detail.css" />
  <link rel="stylesheet" href="/interfaces/experience-phases.css" />
</head>
<body>
  <nav class="qv-top-quicklinks" aria-label="Site">
    <a href="/questfest">SS Vibelandia</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/journey">Journey</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/">Canvas</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/jukebox" data-qv-jukebox>Jukebox</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/library">Library</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/doodles">Doodles</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/creator-studio">Creator Studio</a>
  </nav>

  <header class="xd-hero">
    <img class="xd-hero__art" src="${room.keyArt}" alt="${escapeHtml(room.keyAlt)}" />
    <div class="xd-hero__shade" aria-hidden="true"></div>
    <div class="xd-hero__copy">
      <p class="xd-kicker">${escapeHtml(room.kicker)}</p>
      <h1>${escapeHtml(room.title)}</h1>
      <p class="xd-lede">${escapeHtml(room.lede)}</p>
      <p class="xd-meta">${escapeHtml(room.meta)}</p>
      <div class="xd-cta">
        <a class="xd-btn xd-btn--gold" href="/#exhibit">Back to exhibit</a>
        <a class="xd-btn xd-btn--ghost" href="/questfest">Enter SS Vibelandia</a>
      </div>
    </div>
  </header>

  <main class="xd-wrap">
    ${renderExhibitOuterLabelHtml('strip')}
    <nav class="xd-rooms" aria-label="Exhibit rooms">
      ${roomsNav}
    </nav>

    <h2>The full room</h2>
${paras}

    <h2>Chapters</h2>
    <div class="xd-chapters">
${chapters}
    </div>

    ${stillsHeading}
    ${stills}

    <p class="honesty">
      <strong>Honesty rail:</strong> This is a new omniversal artistic expression made possible by the new age of AI. This page is art and hospitality. Valet Pru - Holographic Goldilocks XY Human Reality Bridge/Router, wormhole, and sphere seating for up to fifteen are exhibit identity. Φ ≈ 1.618 is our nesting language. Dome 1 DMT and psilocybin pictures are catalog accents, not a pharmacy. Wormhole-by-awareness is navigation talk, not hardware teleport. Free basics on open surfaces. Pro and VIP via
      <a href="mailto:info@fractiai.com">info@fractiai.com</a>.
      A human emergency comes first.
    </p>
  </main>

  <footer class="site">
    <a href="/questfest">SS Vibelandia</a>
    <a href="/">Canvas</a>
    <a href="/jukebox">Jukebox</a>
    <a href="/lattice-chat">Lattice Chat</a>
    <span>→ ∞^∞</span>
  </footer>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
  <script src="/interfaces/site-quicklinks.js" defer></script>
</body>
</html>
`;
}
