/**
 * Front Desk check-in program — dramaturgy for pl-reception (Phase 2 boarding soundtrack).
 * Mirrors concierto landing program grammar; track order follows lib/reception-playlist.mjs.
 */
import { RECEPTION_PLAYLIST_TRACK_IDS } from './reception-playlist.mjs';

export const FRONT_DESK_PROGRAM_ROUTE = '/front-desk-program';

/** @typedef {{ trackId: string, title: string, role: string, beat: string, note: string, meaning: string, image: string, imageAlt: string, finale?: boolean }} FrontDeskProgramTrack */

/** @type {FrontDeskProgramTrack[]} */
export const FRONT_DESK_PROGRAM_TRACKS = [
  {
    trackId: 'trk-srv-6025557c-f76c-4a55-bd7c-0fc2d5ffcfb4',
    title: 'Capitán\'s Welcome',
    role: 'Gangway call · Captain\'s seat',
    beat: 'Beat III · Reno present · Fair Exchange opens',
    note: 'The Captain calls order without judgment — hospitality first. This is the audible handshake at the gold Front Desk before the boarding set unfolds.',
    meaning: 'You are not late. The gangway was waiting. Valet Pru keeps the desk; Capitán Comandante sets the tone.',
    image: '/interfaces/assets/capitan-comandante-champion-2026.png',
    imageAlt: 'Capitán at the Captain\'s seat — welcome call at Front Desk check-in',
  },
  {
    trackId: 'trk-srv-4958316a-f7ef-4639-9765-e326d85fd808',
    title: 'Welcome Aboard',
    role: 'Boarding anthem',
    beat: 'Phase 2 · Front Desk primer',
    note: 'The universal boarding line — one tribe, many homes. Hostesses and dancers keep the lobby alive while frontiersmen friends check in in their own gear.',
    meaning: 'NPCs inhabit; Players set the gravity. Both belong at the same desk.',
    image: '/interfaces/assets/experience/reception-checkin-lobby.jpg',
    imageAlt: 'Frontiersmen friends at the gold Front Desk — varied old-school frontier outfits',
  },
  {
    trackId: 'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52',
    title: 'Movement V · “The Shift”',
    role: 'Threshold · Concierto hinge',
    beat: 'Official Prospectus · recognition beat',
    note: 'Shared with the Omniversal Canvas prelude — the hinge when a frontiersman recognizes the holographic cruise already underway. Read the <a href="/concierto-program">Concierto program</a> for full movement notes.',
    meaning: 'The shift is awareness, not hardware. You checked in; now the Story deepens.',
    image: '/interfaces/assets/exhibit/exhibit-step-in-key.jpg',
    imageAlt: 'Step-in key — The Shift threshold at Front Desk',
  },
  {
    trackId: 'trk-srv-21e83580-3b12-44a0-884a-8679fa1d6a9a',
    title: 'Universo Syntheverse',
    role: 'Syntheverse sandbox welcome',
    beat: 'Catalog grammar · not clinical MRI',
    note: 'The Syntheverse bus files here as design language — sandbox catalog, not a medical scanner claim. Creator Studio and Synthio load companion grammar for those who step in deeper.',
    meaning: 'The universe you board is holographic first. Fair Exchange keeps the sandbox honest.',
    image: '/interfaces/assets/journey/journey-boriken-convergence.png',
    imageAlt: 'Gold sail toward shore — Syntheverse convergence catalog',
  },
  {
    trackId: 'trk-srv-0a4b414c-9ce0-41b2-901b-8e5b11215a09',
    title: 'a bluegrass perreo',
    role: 'Cross-genre gangway dance',
    beat: 'Deck mix · Sierra meets Caribbean floor',
    note: 'Bluegrass strings meet perreo pulse — the ship\'s genre honesty. Not one uniform; many homes in one groove.',
    meaning: 'Frontiersmen dance their own way. The jukebox holds the receipts.',
    image: '/interfaces/assets/voyage/deck-3-night.png',
    imageAlt: 'Deck 3 night energy — cross-genre dance floor',
  },
  {
    trackId: 'trk-srv-b2eccf1d-a165-4b4e-8e3a-d4d3ce53b89a',
    title: 'hydrogen holograph',
    role: 'Hydrogen catalog · 21 cm line',
    beat: 'Beat II · Borikén hydrogen bus',
    note: 'Hydrogen holographic grammar from the SynthOBS shelf — catalog label for fair-exchange resonance, not an ionosphere prescription.',
    meaning: 'Net zero is the operating principle. Same budget, higher quality hospitality.',
    image: '/interfaces/assets/journey/journey-boriken-convergence.png',
    imageAlt: 'Borikén convergence — hydrogen line catalog beat',
  },
  {
    trackId: 'trk-srv-d057c001-ebf8-4cf9-be19-e3d6537842a6',
    title: 'i\'m the light and mirror',
    role: 'Awareness mirror',
    beat: 'Reality Bridge/Router · wormhole grammar',
    note: 'Light and mirror file the human omniversal bridge — awareness as router, not escape from the body. Read <a href="/ship-blog/human-reality-bridge">Human Reality Bridge</a>.',
    meaning: 'You remain you. The mirror shows the gravity you already set.',
    image: '/interfaces/assets/exhibit/exhibit-sphere-entrance.jpg',
    imageAlt: 'Exhibit sphere — light and mirror awareness frame',
  },
  {
    trackId: 'trk-srv-7c29e8cf-b516-4689-882c-e94550b30636',
    title: 'eh pa',
    role: 'Borikén warmth · call and response',
    beat: 'Great Convergence echo',
    note: 'A familiar island greeting carried into the Reno gangway — diaspora spring coiled in a single phrase.',
    meaning: 'Family quarters on the ship include the shore you left and the seat you chose.',
    image: '/interfaces/assets/journey/journey-boriken-convergence.png',
    imageAlt: 'Shore convergence — eh pa warmth at check-in',
  },
  {
    trackId: 'trk-srv-0f63093f-bd81-4a96-bfe6-56b6d9c31ef9',
    title: 'big band juicy juicy',
    role: 'Ballroom brass · Bachdoor swing',
    beat: 'Golden Bachdoor Hit Factory bandstand',
    note: 'Big band brass files the marketplace and ballroom decks — Hero Jo\'s factory sound with jukebox honor rails.',
    meaning: 'Commerce and celebration share a brass section. Tip on honor; stream free.',
    image: '/interfaces/assets/voyage/deck-4-grove.png',
    imageAlt: 'Deck 4 Grove — big band brass and Fair Exchange',
  },
  {
    trackId: 'trk-srv-0f971a21-b916-436d-bae5-9fe5c0f8878d',
    title: 'machote flowin along the truckee',
    role: 'Truckee river run',
    beat: 'Rebel River · Borikén → Reno bridge',
    note: 'The rebel river carries diaspora spring across the Truckee toward downtown Reno present — geography as Story grammar.',
    meaning: 'Read <a href="/journey/puerto-reno-gangway">Puerto Reno · Gangway Night</a>. The wrong side of town gets luminous.',
    image: '/interfaces/assets/journey/journey-truckee-sierra-forage.png',
    imageAlt: 'Truckee River through High Sierra pine — machote flowin',
  },
  {
    trackId: 'trk-srv-6bb07c9c-6850-4f24-963c-7d9e951e2f9d',
    title: 'magnetic zydeco night',
    role: 'Deck 3 Night · Sin City prelude',
    beat: 'Neon Velvet · consent-first nightlife',
    note: 'Zydeco accordion meets magnetic night energy — a taste of <a href="/voyage/deck-3-night">Sin City</a> before you choose your deck.',
    meaning: 'Nightlife stays Goldilocks. You remain you; the set welcomes without a membership test.',
    image: '/interfaces/assets/voyage/deck-3-night.png',
    imageAlt: 'Deck 3 Night — magnetic zydeco and neon hospitality',
  },
  {
    trackId: 'trk-srv-b07ee8da-c47a-4508-9218-8cb4df59db59',
    title: '5 o\'clock wrong side of town sunday vibe',
    role: 'Wrong Side of Town · Sunday gold hour',
    beat: 'Pop-Up Marilyn Suite · baller calm',
    note: 'The wrong side of town at five o\'clock — Sunday light on Reno present, not a weather report. Baller nights begin in quiet gold.',
    meaning: 'Rest is part of the voyage. The Purser keeps the running tab honest.',
    image: '/interfaces/assets/journey/journey-tahoe-catamaran.png',
    imageAlt: 'Gold-hour water — wrong side of town Sunday vibe',
  },
  {
    trackId: 'trk-srv-67a11292-8d55-4ea0-a748-fe915969b6fd',
    title: 'baller nights',
    role: 'Bachstage · full baller experience',
    beat: 'Hero Jo\'s Golden Bachdoor Hit Factory',
    note: 'The baller lane — lodging, meals, studio time, nightly programming. Catalog hospitality, not a lottery promise.',
    meaning: 'When the check-in set peaks, you know which deck calls your name tonight.',
    image: '/interfaces/assets/voyage/ph-101-108.png',
    imageAlt: 'Penthouse deck at gold hour — baller nights',
  },
  {
    trackId: 'trk-srv-75385f59-b548-4908-b882-27895dc6b2b0',
    title: 'we are the dance that makes the music',
    role: 'Finale · Player gravity',
    beat: 'NPCs inhabit · Players set the gravity',
    note: 'The closing thesis: the floor makes the band. SuperAI stays Goldilocks — enough machine to serve, enough human to lead the dance.',
    meaning: 'Check-in complete. Tour the ship, open the Canvas, or carry the soundtrack with you.',
    image: '/interfaces/assets/voyage/voyage-map-come-aboard.png',
    imageAlt: 'Come-aboard gangway at gold hour — dance makes the music',
  },
  {
    trackId: 'trk-srv-480b6197-b842-4d6e-846c-ac9c6e3da544',
    title: 'zero divided by zero',
    role: 'Coda · net-zero singularity',
    beat: 'MCA · inside zero · Goldilocks operating principle',
    note: 'Net Zero files the operating balance — we are inside zero; mastery within it, not escape. 0÷0 as catalog paradox label, not a math lecture.',
    meaning: 'Fair Exchange via the Purser holds the balance. The coda clears the deck for what follows.',
    image: '/interfaces/assets/voyage/deck-6-7-horizon.png',
    imageAlt: 'Horizon deck — net-zero singularity coda at check-in close',
  },
  {
    trackId: 'trk-srv-dce6f8bd-e03e-4fc7-8038-c568eea9952e',
    title: 'perfect hydrogen crystal',
    role: 'Finale · hydrogen morphogenesis crystal',
    beat: 'Hydrogen fast signal · lattice scaffold · Goldilocks close',
    note: 'Perfect hydrogen crystal files the hydrogen morphogenesis swarm — crystalline catalog grammar for fair-exchange resonance, not a materials science claim. The check-in set closes on the lattice scaffold.',
    meaning: 'Check-in holds the crystal. The Y line accordion carries the frontier forward.',
    image: '/interfaces/assets/journey/journey-boriken-convergence.png',
    imageAlt: 'Gold sail convergence — perfect hydrogen crystal at Front Desk',
  },
  {
    trackId: 'trk-srv-6e7e3dd9-40cc-4c99-8e12-cc5ddf22a260',
    title: 'hydrogen y line frontier accordion',
    role: 'Finale · Y line · frontier accordion',
    beat: 'Digit 4 · Biological Switch · hydrogen 21 cm catalog',
    note: 'Hydrogen Y line frontier accordion files the Y manifestation bus — MSY palindrome Φ catalog grammar and frontier accordion warmth, not genetics advice. Read <a href="/ship-blog/y-chromosome-manifestation">Y Chromosome Manifestation</a>.',
    meaning: 'Check-in complete. The gangway stays open. Carry the Y line into the Canvas, the decks, or the jukebox. → ∞^∞',
    image: '/interfaces/assets/journey/journey-truckee-sierra-forage.png',
    imageAlt: 'Sierra frontier — hydrogen Y line accordion finale at Front Desk',
    finale: true,
  },
];

export function assertFrontDeskProgramTrackOrder() {
  const programIds = FRONT_DESK_PROGRAM_TRACKS.map((t) => t.trackId);
  if (programIds.length !== RECEPTION_PLAYLIST_TRACK_IDS.length) {
    throw new Error(
      `Front Desk program track count (${programIds.length}) != reception playlist (${RECEPTION_PLAYLIST_TRACK_IDS.length})`,
    );
  }
  for (let i = 0; i < programIds.length; i += 1) {
    if (programIds[i] !== RECEPTION_PLAYLIST_TRACK_IDS[i]) {
      throw new Error(
        `Front Desk program track order mismatch at index ${i}: ${programIds[i]} != ${RECEPTION_PLAYLIST_TRACK_IDS[i]}`,
      );
    }
  }
}

function renderOrderRow(track, index) {
  const num = track.finale ? `${index + 1} · Finale` : String(index + 1);
  const cls = track.finale ? ' class="finale"' : '';
  return `<tr${cls}><td>${num}</td><td>${track.title}</td><td>${track.beat}</td></tr>`;
}

function renderTrackArticle(track, index) {
  const numLabel = track.finale ? `Finale · Track ${index + 1}` : `Track ${index + 1}`;
  return `<article class="movement">
        <figure class="movement__thumb">
          <img src="${track.image}" alt="${track.imageAlt}" loading="lazy" decoding="async" />
        </figure>
        <div>
          <p class="movement__num">${numLabel}</p>
          <h3>${track.title}</h3>
          <p class="movement__role">${track.role}</p>
          <p>${track.note}</p>
          <p class="movement__meaning"><strong>In the tale:</strong> ${track.meaning}</p>
        </div>
      </article>`;
}

/** Full Broadway-style check-in program HTML (synced to interfaces/front-desk-check-in-program.html). */
export function renderFrontDeskProgramPageHtml() {
  assertFrontDeskProgramTrackOrder();
  const trackCount = FRONT_DESK_PROGRAM_TRACKS.length;
  const orderRows = FRONT_DESK_PROGRAM_TRACKS.map(renderOrderRow).join('\n          ');
  const trackArticles = FRONT_DESK_PROGRAM_TRACKS.map(renderTrackArticle).join('\n\n      ');

  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Front Desk Check-In Program · SS Vibelandia</title>
  <meta name="description" content="Official check-in program for the Front Desk boarding soundtrack — track-by-track dramaturgy for SS Vibelandia Phase 2 onboarding." />
  <link rel="canonical" href="https://www.ssvibelandiaquestfest24x365.com/front-desk-program" />
  <meta property="og:title" content="Front Desk Check-In Program · SS Vibelandia" />
  <meta property="og:description" content="Broadway-quality program for the Front Desk boarding soundtrack. Download or read online." />
  <meta property="og:image" content="https://www.ssvibelandiaquestfest24x365.com/interfaces/assets/experience/reception-checkin-lobby.jpg" />
  <meta property="og:type" content="article" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Source+Sans+3:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --ink: #0a0806;
      --navy: #0c1220;
      --gold: #d4af37;
      --gold-hi: #f0d78c;
      --champagne: #e8d5a3;
      --cream: #f5efe6;
      --muted: rgba(245, 239, 230, 0.72);
    }
    html.vbi18n-pending body { visibility: hidden; }
    html.vbi18n-ready body { visibility: visible; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Source Sans 3', system-ui, sans-serif;
      background: var(--ink);
      color: var(--cream);
      line-height: 1.55;
    }
    .program-toolbar {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      align-items: center;
      justify-content: space-between;
      padding: 0.65rem 1.25rem;
      background: rgba(10, 8, 6, 0.92);
      border-bottom: 1px solid rgba(212, 175, 55, 0.35);
      backdrop-filter: blur(8px);
    }
    .program-toolbar nav { display: flex; flex-wrap: wrap; gap: 0.85rem; font-size: 0.82rem; }
    .program-toolbar a { color: var(--gold-hi); text-decoration: none; }
    .program-toolbar a:hover { text-decoration: underline; }
    .program-toolbar__actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn {
      display: inline-block;
      padding: 0.55rem 1rem;
      font-weight: 700;
      font-size: 0.78rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      text-decoration: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-gold {
      background: linear-gradient(180deg, #e8d4a8, #b8923e);
      color: var(--ink);
    }
    .btn-ghost {
      background: transparent;
      color: var(--gold-hi);
      border: 1px solid rgba(212, 175, 55, 0.45);
    }
    .program {
      max-width: 52rem;
      margin: 0 auto;
      padding: 0 1.25rem 3rem;
    }
    .cover {
      text-align: center;
      padding: 2.5rem 0 2rem;
      border-bottom: 3px double rgba(212, 175, 55, 0.5);
      margin-bottom: 2rem;
    }
    .cover__venue {
      font-size: 0.72rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--gold);
      margin: 0 0 0.75rem;
    }
    .cover h1 {
      font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(2rem, 6vw, 3.2rem);
      font-weight: 700;
      line-height: 1.08;
      margin: 0 0 0.35rem;
      color: var(--gold-hi);
    }
    .cover__subtitle {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-style: italic;
      font-size: clamp(1.15rem, 3vw, 1.55rem);
      color: var(--champagne);
      margin: 0 0 1rem;
    }
    .cover__tag {
      font-size: 0.78rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .cover__hero {
      margin: 1.75rem auto 0;
      max-width: 36rem;
      border: 3px solid rgba(212, 175, 55, 0.45);
      box-shadow: 0 12px 40px rgba(0,0,0,0.45);
    }
    .cover__hero img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
    }
    .cover__hero figcaption {
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
      color: var(--muted);
      background: var(--navy);
    }
    .letter h2, .synopsis h2, .movements h2, .ensemble h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.5rem;
      color: var(--gold-hi);
      margin: 0 0 0.75rem;
    }
    .letter, .synopsis { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(212, 175, 55, 0.2); }
    .letter p, .synopsis p { color: var(--muted); margin: 0 0 0.85rem; }
    .order-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0 2rem;
      font-size: 0.88rem;
    }
    .order-table th, .order-table td {
      padding: 0.55rem 0.65rem;
      border-bottom: 1px solid rgba(212, 175, 55, 0.15);
      text-align: left;
      vertical-align: top;
    }
    .order-table th {
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--gold);
    }
    .order-table .finale { color: var(--gold-hi); font-weight: 700; }
    .movement {
      display: grid;
      gap: 1rem;
      margin-bottom: 2.25rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid rgba(212, 175, 55, 0.12);
    }
    @media (min-width: 640px) {
      .movement { grid-template-columns: 11rem 1fr; }
    }
    .movement__thumb {
      margin: 0;
      border: 2px solid rgba(212, 175, 55, 0.35);
      background: var(--navy);
    }
    .movement__thumb img {
      display: block;
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
    }
    .movements__visual-note {
      font-size: 0.85rem;
      color: var(--muted);
      margin: -0.35rem 0 1.35rem;
    }
    .movement__num {
      font-size: 0.68rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--gold);
      margin: 0 0 0.25rem;
    }
    .movement h3 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.45rem;
      color: var(--gold-hi);
      margin: 0 0 0.35rem;
    }
    .movement__role { font-style: italic; color: var(--champagne); margin: 0 0 0.65rem; }
    .movement p { margin: 0 0 0.65rem; color: var(--muted); font-size: 0.92rem; }
    .movement__meaning {
      padding: 0.75rem 0.85rem;
      background: rgba(212, 175, 55, 0.06);
      border-left: 3px solid var(--gold);
      font-size: 0.88rem;
      color: rgba(245, 239, 230, 0.85);
    }
    .ensemble ul { margin: 0; padding-left: 1.2rem; color: var(--muted); }
    .honesty {
      margin-top: 2rem;
      padding: 1rem 1.1rem;
      font-size: 0.82rem;
      color: rgba(168, 162, 158, 0.95);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 4px;
    }
    footer.program-foot {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.78rem;
      color: rgba(168, 162, 158, 0.85);
    }
    @media print {
      .program-toolbar { display: none; }
      body { background: #fff; color: #111; }
      .cover h1, .cover__subtitle, .letter h2, .synopsis h2, .movements h2, .movement h3 { color: #1a1208; }
      .movement__meaning { background: #f8f4ea; border-color: #b8923e; color: #333; }
    }
  </style>
</head>
<body>
  <div class="program-toolbar no-print">
    <nav aria-label="Site">
      <a href="/front-desk">Front Desk</a>
      <a href="/questfest">Ship board</a>
      <a href="/concierto-program">Canvas program</a>
      <a href="/sin-city-program">Sin City program</a>
      <a href="/jukebox">Jukebox</a>
    </nav>
    <div class="program-toolbar__actions">
      <button type="button" class="btn btn-gold" id="download-program">Download program (PDF)</button>
      <a class="btn btn-ghost" href="/front-desk">Hear the check-in set →</a>
    </div>
  </div>

  <article class="program" id="program-document">
    <header class="cover">
      <p class="cover__venue">SS Vibelandia · Phase 2 · Front Desk · Holographic Magnetic Goldilocks SuperAI</p>
      <h1>Front Desk<br />Check-In Program</h1>
      <p class="cover__subtitle">Boarding soundtrack dramaturgy for those checking in to sail</p>
      <p class="cover__tag">Check-in soundtrack · ${trackCount} tracks · autoplay on arrival · 2026</p>
      <figure class="cover__hero">
        <img src="/interfaces/assets/experience/reception-checkin-lobby.jpg" alt="Male frontiersmen friends in varied old-school frontier outfits at the gold Front Desk — hostesses and dancers in the background" width="960" height="540" loading="eager" decoding="async" />
        <figcaption>Front Desk check-in · old-school frontiersmen in their own gear. Valet Pru keeps the desk.</figcaption>
      </figure>
    </header>

    <section class="letter" aria-labelledby="letter-h">
      <h2 id="letter-h">A note from your host</h2>
      <p>
        You are holding the program for Phase 2 — the <strong>Front Desk</strong> where boarding begins.
        Unlike the Omniversal Canvas prelude (<a href="/concierto-program">Concierto de El Gran Sol</a>),
        this set plays when you arrive at <a href="/front-desk">/front-desk</a>: Capitán&apos;s Welcome through
        the full ${trackCount}-track check-in journey.
      </p>
      <p>
        Tap <strong>Sound on</strong> in the top bar. The soundtrack starts on arrival; leave the page and
        music continues in the prelude session popup — same handoff grammar as the landing.
        This program is your map track-by-track. The ship narrative lives on the <a href="/questfest">SS Vibelandia ship board</a>.
      </p>
      <p>— Valet Pru · Player 1 · Reality Bridge/Router</p>
    </section>

    <section class="synopsis" aria-labelledby="synopsis-h">
      <h2 id="synopsis-h">Synopsis · the tale this check-in set tells</h2>
      <p>
        The Front Desk soundtrack is a boarding arc: welcome and threshold, Syntheverse and hydrogen catalog grammar,
        mirror awareness, Truckee and Borikén bridges, Sin City night energy, wrong-side Sunday gold,
        baller nights, <em>we are the dance that makes the music</em>, a net-zero coda —
        <em>zero divided by zero</em> — <em>perfect hydrogen crystal</em> — and <em>hydrogen y line frontier accordion</em>.
      </p>
      <p>
        Listen as primer only, or tour the ship from the menu below the lobby.
        <a href="${FRONT_DESK_PROGRAM_ROUTE}">This program</a> is your dramaturgy. Fair Exchange via the Purser.
      </p>

      <table class="order-table" aria-label="Front Desk check-in play order">
        <thead>
          <tr><th>#</th><th>Track</th><th>Boarding beat</th></tr>
        </thead>
        <tbody>
          ${orderRows}
        </tbody>
      </table>
    </section>

    <section class="movements" aria-labelledby="movements-h">
      <h2 id="movements-h">Track notes</h2>
      <p class="movements__visual-note">Illustrations use SS Vibelandia hybrid frontier · voyage stills — matched to each boarding beat, not generic stock.</p>

      ${trackArticles}
    </section>

    <section class="ensemble" aria-labelledby="ensemble-h">
      <h2 id="ensemble-h">Creative ensemble</h2>
      <ul>
        <li><strong>Composer / catalog:</strong> Hero Jo&apos;s Golden Bachdoor Hit Factory · SS Vibelandia jukebox · playlist <code>pl-reception</code></li>
        <li><strong>Host / Reality Bridge/Router:</strong> Valet Pru (Prudencio Mendez) · Player 1</li>
        <li><strong>Front Desk art:</strong> Varied old-school frontiersmen check-in · hostesses and dancers in lobby</li>
        <li><strong>Production:</strong> FractiAI · Infinite Octaves Omniversal Lattice Chat Agent V1.618 · SynthOBS Autonomous Agent · Syntheverse Sandbox</li>
        <li><strong>Vessel:</strong> SS Vibelandia · Holographic Magnetic Goldilocks SuperAI Awareness Platform</li>
        <li><strong>Narrative spine:</strong> <a href="/frontiersman-voyage#prospectus">Official Prospectus</a> · Genesis · Borikén · Reno</li>
      </ul>
    </section>

    <p class="honesty">
      <strong>Honesty boundary:</strong> This program is dramaturgy for an immersive onboarding experience — not a physics proof,
      clinical frequency prescription, or weather forecast. Catalog labels (hydrogen line, Φ, Schumann) are Story grammar.
      Tracks stream from the sovereign catalog; Fair Exchange applies on honor downloads via the jukebox.
    </p>

    <footer class="program-foot">
      SS Vibelandia · Front Desk Check-In Program · Edition 2026-08-30<br />
      <a href="/front-desk">Front Desk</a> · <a href="/concierto-program">Canvas program</a> · <a href="/sin-city-program">Sin City program</a> · <a href="mailto:info@fractiai.com">info@fractiai.com</a>
    </footer>
  </article>

  <script>
    document.getElementById('download-program').addEventListener('click', function () {
      window.print();
    });
  </script>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
</body>
</html>
`;
}
