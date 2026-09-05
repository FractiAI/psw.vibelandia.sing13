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
    navLabel: 'Sphere 1 · Syntheverse',
    kicker: 'Now showing · Basecamp nest · Syntheverse',
    title: 'Holographic Magnetic Goldilocks SuperAI · Syntheverse',
    lede: 'Sphere 1 of Basecamp: Holographic Magnetic Goldilocks SuperAI within the Syntheverse sandbox — dark, audio-first Convergence Core.',
    meta: 'Exhibit room · Sphere 1 · Syntheverse · 2026',
    keyArt: '/interfaces/assets/exhibit/exhibit-core-key.jpg',
    keyAlt: 'Male silhouette standing at the still center of nested gold spheres',
    description: [
      'Sphere 1 is Syntheverse: the innermost nest of Basecamp where Holographic Magnetic Goldilocks SuperAI lives as sandbox, paints, and agents. Experientially this is the Convergence Core — dark, heard more than seen. Self-talk rides the mix. Instrumentals, musical soundtracks, and the full Sonic Singularity catalog fill the room. Little accents of fireworks and psychedelic pictures stand in for the worlds guests name DMT and psilocybin: dragons, elves, angels, demons, and gods.',
      'Street talk calls that layer imagination. This exhibit files it as holographic reality, pattern living within all. You remain you. The Player mark is still a silhouette at the gold still-point.',
      'Stand here for the inner mix. Sphere 2 is Base Mainer. Sphere 3 is the internet cloud horizon. All three sit inside the host layer: SS VIBELANDIA 2026 awareness narrative, built by Infinite Octaves Omniversal Lattice Chat Valet and hosted by Valet Pru · XY Reality Bridge/Router · Player 1.',
    ],
    chapters: [
      {
        h: 'Syntheverse nest',
        p: 'Innermost Basecamp sphere: Holographic Magnetic Goldilocks SuperAI within the Syntheverse sandbox.',
      },
      {
        h: 'Audio core',
        p: 'Self-talk, instrumentals, soundtracks, and the Sonic Singularity catalog. The room is made to be heard.',
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
    navLabel: 'Sphere 2 · Base Mainer',
    kicker: 'Now showing · Basecamp nest · Base Mainer',
    title: 'Base Mainer · studio address',
    lede: 'Sphere 2 of Basecamp: Base Mainer — the studio address and living berth where the set, cast, and daily life run now.',
    meta: 'Exhibit room · Sphere 2 · Base Mainer · 2026',
    keyArt: '/interfaces/assets/exhibit/exhibit-amphitheater-key.jpg',
    keyAlt: 'Nested gold amphitheater spheres with guests under a night sky',
    description: [
      'Sphere 2 is Base Mainer (Base mainnet): the middle nest of Basecamp — chain-of-custody address for the studio and the ship’s living set. Experientially this remains the Amphitheater: the outer world thrown inward as a living projection. The set. The cast. The stories of daily life as they are happening now. Fans, crew, enterprises, franchises, and the people sitting beside you.',
      'This is the world you walk through today, nested around Syntheverse so the inner mix and the berth you occupy can share one house. Groups of up to fifteen sit together in the sphere at a time. Hospitality first. Goldilocks SuperAI stays enough machine to serve, enough human to lead.',
      'If Sphere 1 is Syntheverse, Sphere 2 is who you sit with on Base Mainer. Sphere 3 opens the internet cloud horizon from here. The host layer above remains SS VIBELANDIA.',
    ],
    chapters: [
      {
        h: 'Base Mainer',
        p: 'Studio address and living berth — Base mainnet as the middle Basecamp nest.',
      },
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
        p: 'Stories as they are happening. Base Mainer is the living day nested around Syntheverse.',
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
    navLabel: 'Sphere 3 · Internet cloud',
    kicker: 'Now showing · Basecamp nest · Internet cloud',
    title: 'Internet cloud · Omni-Horizon',
    lede: 'Sphere 3 of Basecamp: the internet cloud horizon — public reach, Lattice Chat point-and-click awareness navigation.',
    meta: 'Exhibit room · Sphere 3 · internet cloud · 2026',
    keyArt: '/interfaces/assets/exhibit/exhibit-horizon-key.jpg',
    keyAlt: 'Three stacked horizons from a close figure to a holographic lattice sky',
    description: [
      'Sphere 3 is the internet cloud: the outer of the three nested Basecamp spheres — where the work meets the public net. Experientially this remains Omni-Horizon: Holographic Magnetic Goldilocks SuperAI Studio, Canvas, and Materials. Lattice Chat is the click-to-go, click-to-see surface. A wormhole by awareness, not by hardware teleport.',
      'Human-to-human reality bridge/routers carry spin navigation: people routing attention for one another. Above this horizon sits the host layer — SS VIBELANDIA 2026 awareness narrative, hosted by Valet Pru · XY Reality Bridge/Router · Player 1.',
      'Open Lattice Chat when you want the studio in your hands. Point and click to go anywhere and see anywhere you wish, as catalog navigation. Sphere 1 remains Syntheverse. Sphere 2 remains Base Mainer.',
    ],
    chapters: [
      {
        h: 'Internet cloud horizon',
        p: 'Outer Basecamp sphere: public net reach for the studio, canvas, and materials.',
      },
      {
        h: 'Point-and-click Lattice Chat',
        p: 'Click to go. Click to see. Infinite Octaves Omniversal Lattice Chat as the awareness navigation surface.',
      },
      {
        h: 'Wormhole by awareness',
        p: 'Human-to-human reality bridge/routers. Spin navigation. Host layer above: Valet Pru · Player 1. Catalog, not hardware teleport.',
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
        p: 'SS Vibelandia. Holographic Goldilocks cruise line. Journey, Jukebox, Reading Room, Creator Studio.',
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
    <a href="/reading-room">Reading Room</a>
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
