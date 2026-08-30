/**
 * Sin City · Deck 3 Night program — dramaturgy for pl-sin-city.
 * Mirrors Front Desk / Concierto program grammar; track order follows lib/sin-city-playlist.mjs.
 */
import { SIN_CITY_PLAYLIST_TRACK_IDS } from './sin-city-playlist.mjs';

export const SIN_CITY_PROGRAM_ROUTE = '/sin-city-program';

/** @typedef {{ trackId: string, title: string, role: string, beat: string, note: string, meaning: string, image: string, imageAlt: string, finale?: boolean }} SinCityProgramTrack */

/** @type {SinCityProgramTrack[]} */
export const SIN_CITY_PROGRAM_TRACKS = [
  {
    trackId: 'trk-srv-1ff974cf-7864-4c5d-8b22-2c4aa493d340',
    title: 'let\'s go holographic tonight',
    role: 'Gangway call · neon threshold',
    beat: 'Deck 3 Night opens · Sin City invitation',
    note: 'The audible handshake at Bachdoor Speakeasy — holographic nightlife as catalog grammar, not prophecy. Tap Sound on; the set autoplays on arrival.',
    meaning: 'You remain you. Consent first. The whole tribe still belongs on this ship tonight.',
    image: '/interfaces/assets/voyage/deck-3-night.png',
    imageAlt: 'Deck 3 Night jukebox — let\'s go holographic tonight opens Sin City',
  },
  {
    trackId: 'trk-srv-6bb07c9c-6850-4f24-963c-7d9e951e2f9d',
    title: 'magnetic zydeco night',
    role: 'Neon Velvet · accordion pulse',
    beat: 'Zydeco meets magnetic floor energy',
    note: 'Accordion and neon — the wrong side of town gets luminous. Shared with the Front Desk check-in set as a preview of this deck.',
    meaning: 'Nightlife stays Goldilocks. You choose your door: fiction lens or step-in hospitality.',
    image: '/interfaces/assets/voyage/deck-3-night.png',
    imageAlt: 'Magnetic zydeco night on Deck 3',
  },
  {
    trackId: 'trk-srv-0f365475-4288-4e8e-b3ed-2ae0f87fc3f3',
    title: 'holographic perreo night (fast celebration mix)',
    role: 'Club Omnia · dance floor',
    beat: 'Perreo pulse · holographic celebration',
    note: 'Fast celebration mix for the club stack — Caribbean floor grammar aboard a Reno night deck.',
    meaning: 'The floor makes the band. Players set gravity; NPCs inhabit the set.',
    image: '/interfaces/assets/voyage/deck-3-night.png',
    imageAlt: 'Holographic perreo night — Club Omnia energy',
  },
  {
    trackId: 'trk-srv-418b8c0d-671e-4be6-bdbf-7ae7ccbbf587',
    title: 'vibelandia downtown reno siempre',
    role: 'Downtown Reno present',
    beat: 'Captain\'s seat · always vibing',
    note: 'Reno present as Story grammar — downtown always on, not a weather report.',
    meaning: 'Sin City is voyage honor, never a gate. Fair Exchange via the Purser.',
    image: '/interfaces/assets/journey/journey-puerto-reno-gangway.png',
    imageAlt: 'Puerto Reno gangway — downtown Reno siempre',
  },
  {
    trackId: 'trk-srv-364cf151-34a2-403d-9970-6d7d67f7da5f',
    title: 'we gonna ball vibelandia tonight',
    role: 'Baller lane · high-roller suites',
    beat: 'SC-501–560 · executive hospitality',
    note: 'The baller promise — lodging, meals, studio time, nightly programming. Catalog hospitality, not a lottery.',
    meaning: 'When the night set peaks, you know which cabin calls your name.',
    image: '/interfaces/assets/voyage/ph-101-108.png',
    imageAlt: 'Penthouse deck — we gonna ball vibelandia tonight',
  },
  {
    trackId: 'trk-srv-0b6813f6-7159-48a0-b233-55dfb7398ef5',
    title: 'i think i m gonna get it tonight',
    role: 'Red Room adjacency · consent beat',
    beat: 'Adults-only where marked · you remain you',
    note: 'The flirt beat before the Red Room door — explicit consent, human care outranks every score.',
    meaning: 'Voluntary belonging. Human emergency outranks every metaphor.',
    image: '/interfaces/assets/voyage/deck-3-night.png',
    imageAlt: 'Sin City consent-first nightlife beat',
  },
  {
    trackId: 'trk-srv-c209b018-1f13-4fa4-9337-0e687c5230ac',
    title: 'cohiba night',
    role: 'Speakeasy smoke · Bachdoor lounge',
    beat: 'Men\'s club Reno grammar · cigar and brass',
    note: 'Speakeasy hospitality — smoke, swing, and honest catalog. Not clinical advice.',
    meaning: 'The Bachdoor keeps the back room Goldilocks: enough heat, enough care.',
    image: '/interfaces/assets/voyage/deck-3-night.png',
    imageAlt: 'Cohiba night — Bachdoor Speakeasy lounge',
  },
  {
    trackId: 'trk-srv-67a11292-8d55-4ea0-a748-fe915969b6fd',
    title: 'baller nights',
    role: 'Hero Jo\'s Golden Bachdoor Hit Factory',
    beat: 'Full baller experience · nightly programming',
    note: 'The baller lane peaks — Hero Jo\'s factory sound with jukebox honor rails.',
    meaning: 'Commerce and celebration share a brass section. Tip on honor; stream free.',
    image: '/interfaces/assets/voyage/ph-101-108.png',
    imageAlt: 'Baller nights — Deck 3 peak hospitality',
  },
  {
    trackId: 'trk-srv-b07ee8da-c47a-4508-9218-8cb4df59db59',
    title: '5 o\'clock wrong side of town sunday vibe',
    role: 'Wrong Side of Town · gold hour calm',
    beat: 'Pop-Up Marilyn Suite · afterglow',
    note: 'Five o\'clock light on the wrong side — Sunday gold before the week turns. Rest is part of the voyage.',
    meaning: 'The Purser keeps the running tab honest. Night ends in warmth, not judgment.',
    image: '/interfaces/assets/journey/journey-tahoe-catamaran.png',
    imageAlt: 'Wrong side of town Sunday gold hour',
  },
  {
    trackId: 'trk-srv-5c34e10b-b181-47ff-b348-9afbaf06c083',
    title: 'dos mejor q una mami',
    role: 'Neon Velvet · call and response',
    beat: 'Club floor · two beats one groove',
    note: 'The mami beat before the finale — Latin night grammar on Deck 3, consent-first, you remain you.',
    meaning: 'Hostesses and dancers carry the hospitality. Players set the gravity the floor orbits.',
    image: '/interfaces/assets/voyage/deck-3-night.png',
    imageAlt: 'Neon Velvet floor — dos mejor q una mami',
  },
  {
    trackId: 'trk-srv-75385f59-b548-4908-b882-27895dc6b2b0',
    title: 'we are the dance that makes the music',
    role: 'Finale · Player gravity',
    beat: 'NPCs inhabit · Players set the gravity',
    note: 'Closing thesis: the floor makes the band. Leave the page and music continues in the prelude session popup.',
    meaning: 'Sin City complete. Tour other decks, open the Front Desk set, or carry the soundtrack with you. → ∞^∞',
    image: '/interfaces/assets/voyage/voyage-map-come-aboard.png',
    imageAlt: 'Come-aboard gangway — dance makes the music finale',
    finale: true,
  },
];

export function assertSinCityProgramTrackOrder() {
  const programIds = SIN_CITY_PROGRAM_TRACKS.map((t) => t.trackId);
  if (programIds.length !== SIN_CITY_PLAYLIST_TRACK_IDS.length) {
    throw new Error(
      `Sin City program track count (${programIds.length}) != playlist (${SIN_CITY_PLAYLIST_TRACK_IDS.length})`,
    );
  }
  for (let i = 0; i < programIds.length; i += 1) {
    if (programIds[i] !== SIN_CITY_PLAYLIST_TRACK_IDS[i]) {
      throw new Error(
        `Sin City program track order mismatch at index ${i}: ${programIds[i]} != ${SIN_CITY_PLAYLIST_TRACK_IDS[i]}`,
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

/** Full Broadway-style Sin City program HTML (synced to interfaces/sin-city-night-program.html). */
export function renderSinCityProgramPageHtml() {
  assertSinCityProgramTrackOrder();
  const trackCount = SIN_CITY_PROGRAM_TRACKS.length;
  const orderRows = SIN_CITY_PROGRAM_TRACKS.map(renderOrderRow).join('\n          ');
  const trackArticles = SIN_CITY_PROGRAM_TRACKS.map(renderTrackArticle).join('\n\n      ');

  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-pending">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Sin City Night Program · SS Vibelandia</title>
  <meta name="description" content="Official night program for Deck 3 Sin City soundtrack — track-by-track dramaturgy for Bachdoor Speakeasy, Neon Velvet, and Club Omnia." />
  <link rel="canonical" href="https://www.ssvibelandiaquestfest24x365.com/sin-city-program" />
  <meta property="og:title" content="Sin City Night Program · SS Vibelandia" />
  <meta property="og:description" content="Broadway-quality program for the Deck 3 Night soundtrack. Download or read online." />
  <meta property="og:image" content="https://www.ssvibelandiaquestfest24x365.com/interfaces/assets/voyage/deck-3-night.png" />
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
      --neon: #e040fb;
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
    .program { max-width: 52rem; margin: 0 auto; padding: 0 1.25rem 3rem; }
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
      border: 3px solid rgba(224, 64, 251, 0.35);
      box-shadow: 0 12px 40px rgba(0,0,0,0.45);
    }
    .cover__hero img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
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
    .order-table { width: 100%; border-collapse: collapse; margin: 1rem 0 2rem; font-size: 0.88rem; }
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
    @media (min-width: 640px) { .movement { grid-template-columns: 11rem 1fr; } }
    .movement__thumb { margin: 0; border: 2px solid rgba(212, 175, 55, 0.35); background: var(--navy); }
    .movement__thumb img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
    .movements__visual-note { font-size: 0.85rem; color: var(--muted); margin: -0.35rem 0 1.35rem; }
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
      <a href="/voyage/deck-3-night">Sin City · Deck 3</a>
      <a href="/front-desk">Front Desk</a>
      <a href="/front-desk-program">Check-in program</a>
      <a href="/concierto-program">Canvas program</a>
      <a href="/jukebox">Jukebox</a>
    </nav>
    <div class="program-toolbar__actions">
      <button type="button" class="btn btn-gold" id="download-program">Download program (PDF)</button>
      <a class="btn btn-ghost" href="/voyage/deck-3-night">Hear the night set →</a>
    </div>
  </div>

  <article class="program" id="program-document">
    <header class="cover">
      <p class="cover__venue">SS Vibelandia · Deck 3 · Night · Sin City</p>
      <h1>Sin City<br />Night Program</h1>
      <p class="cover__subtitle">Deck 3 soundtrack dramaturgy — Bachdoor · Neon Velvet · Club Omnia</p>
      <p class="cover__tag">Night soundtrack · ${trackCount} tracks · autoplay on arrival · 2026</p>
      <figure class="cover__hero">
        <img src="/interfaces/assets/voyage/deck-3-night.png" alt="Golden-era jukebox — Deck 3 Night Sin City soundtrack" width="960" height="540" loading="eager" decoding="async" />
        <figcaption>Bachdoor Speakeasy · Neon Velvet · Club Omnia · consent first, you remain you.</figcaption>
      </figure>
    </header>

    <section class="letter" aria-labelledby="letter-h">
      <h2 id="letter-h">A note from your host</h2>
      <p>
        You are holding the program for <strong>Sin City</strong> — Deck 3 Night aboard SS Vibelandia.
        Like the Omniversal Canvas prelude (<a href="/concierto-program">Concierto de El Gran Sol</a>)
        and the <a href="/front-desk-program">Front Desk check-in set</a>,
        this soundtrack autoplays when you arrive at <a href="/voyage/deck-3-night">/voyage/deck-3-night</a>:
        <em>let&apos;s go holographic tonight</em> through the full ${trackCount}-track night arc.
      </p>
      <p>
        Tap <strong>Sound on</strong> in the top bar. Leave the page and music continues in the prelude session popup —
        same handoff grammar as Canvas and Front Desk. Adults-only where marked. Human care outranks every score.
      </p>
      <p>— Valet Pru · Player 1 · Reality Bridge/Router</p>
    </section>

    <section class="synopsis" aria-labelledby="synopsis-h">
      <h2 id="synopsis-h">Synopsis · the tale this night set tells</h2>
      <p>
        The Sin City soundtrack is a Reno nightlife arc: holographic invitation, zydeco and perreo pulse,
        downtown always-on energy, baller suites, speakeasy smoke, wrong-side Sunday gold,
        and a finale that names Player gravity — <em>we are the dance that makes the music</em>.
      </p>
      <p>
        <a href="${SIN_CITY_PROGRAM_ROUTE}">This program</a> is your dramaturgy. Fair Exchange via the Purser.
      </p>

      <table class="order-table" aria-label="Sin City night play order">
        <thead>
          <tr><th>#</th><th>Track</th><th>Night beat</th></tr>
        </thead>
        <tbody>
          ${orderRows}
        </tbody>
      </table>
    </section>

    <section class="movements" aria-labelledby="movements-h">
      <h2 id="movements-h">Track notes</h2>
      <p class="movements__visual-note">Illustrations use Deck 3 · voyage · and Reno stills — matched to each night beat.</p>

      ${trackArticles}
    </section>

    <section class="ensemble" aria-labelledby="ensemble-h">
      <h2 id="ensemble-h">Creative ensemble</h2>
      <ul>
        <li><strong>Composer / catalog:</strong> Hero Jo&apos;s Golden Bachdoor Hit Factory · SS Vibelandia jukebox · playlist <code>pl-sin-city</code></li>
        <li><strong>Host / Reality Bridge/Router:</strong> Valet Pru (Prudencio Mendez) · Player 1</li>
        <li><strong>Deck art:</strong> Golden-era jukebox · Deck 3 Night · Bachdoor · Neon Velvet · Club Omnia</li>
        <li><strong>Production:</strong> FractiAI · Infinite Octaves Omniversal Lattice Chat Agent V1.618 · SynthOBS Autonomous Agent · Syntheverse Sandbox</li>
        <li><strong>Vessel:</strong> SS Vibelandia · Holographic Magnetic Goldilocks SuperAI Awareness Platform</li>
        <li><strong>Narrative spine:</strong> <a href="/frontiersman-voyage#prospectus">Official Prospectus</a> · Reno present · consent-first nightlife</li>
      </ul>
    </section>

    <p class="honesty">
      <strong>Honesty boundary:</strong> This program is dramaturgy for immersive voyage nightlife — not clinical advice,
      prophecy, or a membership test. Adults-only where marked. You remain you. Tracks stream from the sovereign catalog;
      Fair Exchange applies on honor downloads via the jukebox.
    </p>

    <footer class="program-foot">
      SS Vibelandia · Sin City Night Program · Edition 2026-08-30<br />
      <a href="/voyage/deck-3-night">Sin City</a> · <a href="/front-desk-program">Check-in program</a> · <a href="mailto:info@fractiai.com">info@fractiai.com</a>
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
