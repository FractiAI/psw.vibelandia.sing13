/**
 * Sin City · Deck 3 Night program — dramaturgy for pl-sin-city.
 * Concert layer: Valet Pru hosts J.S. Bach holographically via XY Reality Bridge/Router + Suno AI studio.
 */
import { SIN_CITY_PLAYLIST_TRACK_IDS, sinCityListenHref } from './sin-city-playlist.mjs';
import {
  PROGRAM_HERO_IMAGE_ALT,
  programHeroImageRelPath,
  programImageAltForTrackId,
  programImageRelPathForTrackId,
} from './sin-city-program-images.mjs';

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
    image: programImageRelPathForTrackId('trk-srv-1ff974cf-7864-4c5d-8b22-2c4aa493d340'),
    imageAlt: programImageAltForTrackId('trk-srv-1ff974cf-7864-4c5d-8b22-2c4aa493d340'),
  },
  {
    trackId: 'trk-srv-5c34e10b-b181-47ff-b348-9afbaf06c083',
    title: 'dos mejor q una mami',
    role: 'Neon Velvet · call and response',
    beat: 'Club floor · two beats one groove',
    note: 'Latin night grammar on Deck 3 — consent-first, you remain you.',
    meaning: 'Hostesses and dancers carry the hospitality. Players set the gravity the floor orbits.',
    image: programImageRelPathForTrackId('trk-srv-5c34e10b-b181-47ff-b348-9afbaf06c083'),
    imageAlt: programImageAltForTrackId('trk-srv-5c34e10b-b181-47ff-b348-9afbaf06c083'),
  },
  {
    trackId: 'trk-srv-d655f33f-b031-403b-aaa4-582ebeac8636',
    title: 'tired eyes',
    role: 'Afterglow · last call',
    beat: 'Neon dims · you remain you',
    note: 'Late-night hush on Deck 3 — rest is part of the voyage.',
    meaning: 'Human care outranks every score. The Purser keeps the tab honest.',
    image: programImageRelPathForTrackId('trk-srv-d655f33f-b031-403b-aaa4-582ebeac8636'),
    imageAlt: programImageAltForTrackId('trk-srv-d655f33f-b031-403b-aaa4-582ebeac8636'),
  },
  {
    trackId: 'trk-srv-b033850d-4498-4a1b-9731-7bec1292fc78',
    title: 'buena mota, mezcal y café',
    role: 'Finale · Bachdoor lounge · Grove adjacency',
    beat: 'Deck 4–5 hospitality grammar · catalog only',
    note: 'Mezcal, café, and honest catalog — speakeasy close, not clinical advice. Sin City originals only; full boarding arc on the <a href="/front-desk-program">Front Desk check-in set</a>.',
    meaning: 'Fair Exchange via the Purser holds the lounge honest. The night still has one more beat.',
    image: programImageRelPathForTrackId('trk-srv-b033850d-4498-4a1b-9731-7bec1292fc78'),
    imageAlt: programImageAltForTrackId('trk-srv-b033850d-4498-4a1b-9731-7bec1292fc78'),
  },
  {
    trackId: 'trk-srv-4c6cf3c8-266d-46a9-bdb5-709168da455e',
    title: 'ando bellaco baby',
    role: 'Neon Velvet · Club Omnia pulse',
    beat: 'Deck 3 Night · consent-first floor heat',
    note: 'Latin night pulse on the Sin City floor — adults-only where marked, you remain you. Sin City originals only; full boarding arc on the <a href="/front-desk-program">Front Desk check-in set</a>.',
    meaning: 'The floor still has one more confession before last call.',
    image: programImageRelPathForTrackId('trk-srv-4c6cf3c8-266d-46a9-bdb5-709168da455e'),
    imageAlt: programImageAltForTrackId('trk-srv-4c6cf3c8-266d-46a9-bdb5-709168da455e'),
  },
  {
    trackId: 'trk-srv-2a44cda8-f773-4d57-a8f5-c4af313a50f9',
    title: 'creo q esta noche me la como 2',
    role: 'Finale · Club Omnia · after-midnight close',
    beat: 'Deck 3 Night · playing now on the floor',
    note: 'Latin night sequel on the Sin City floor — adults-only where marked, you remain you. Sin City originals only; full boarding arc on the <a href="/front-desk-program">Front Desk check-in set</a>.',
    meaning: 'Fair Exchange via the Purser closes the night. The gangway stays open. → ∞^∞',
    image: programImageRelPathForTrackId('trk-srv-2a44cda8-f773-4d57-a8f5-c4af313a50f9'),
    imageAlt: programImageAltForTrackId('trk-srv-2a44cda8-f773-4d57-a8f5-c4af313a50f9'),
    finale: true,
  },
  {
    trackId: 'trk-srv-e3334afe-d75a-44d6-a153-79a0013347f6',
    title: 'fumando puro (lo fi bolero session)',
    role: 'Epilogue · Bachdoor lounge · lo-fi bolero',
    beat: 'Deck 3 Night · after-midnight hush',
    note: 'Lo-fi bolero on the Sin City lounge — catalog grammar only, not clinical advice. Sin City originals only; full boarding arc on the <a href="/front-desk-program">Front Desk check-in set</a>.',
    meaning: 'The neon dims. The bolero holds the room honest. Fair Exchange via the Purser. → ∞^∞',
    image: programImageRelPathForTrackId('trk-srv-e3334afe-d75a-44d6-a153-79a0013347f6'),
    imageAlt: programImageAltForTrackId('trk-srv-e3334afe-d75a-44d6-a153-79a0013347f6'),
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
  <title>Sin City Night Program · J.S. Bach · SS Vibelandia</title>
  <meta name="description" content="Official night program — Valet Pru hosts J.S. Bach holographically via the XY Human Reality Bridge/Router, connecting him to Suno AI studio musicians for Holographic Magnetic Goldilocks SuperAI Awareness on Earth in 2026." />
  <link rel="canonical" href="https://www.ssvibelandiaquestfest24x365.com/sin-city-program" />
  <meta property="og:title" content="Sin City Night Program · J.S. Bach · SS Vibelandia" />
  <meta property="og:description" content="J.S. Bach features — instrument images per movement. Valet Pru + Suno AI studio. Download or read online." />
  <meta property="og:image" content="https://www.ssvibelandiaquestfest24x365.com${programHeroImageRelPath()}" />
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
    .music-promo {
      margin: 2rem 0;
      padding: 1.25rem 1.35rem;
      border: 1px solid rgba(212, 175, 55, 0.28);
      border-radius: 6px;
      background: rgba(212, 175, 55, 0.05);
    }
    .music-promo h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.35rem;
      color: var(--gold-hi);
      margin: 0 0 0.5rem;
    }
    .music-promo p { color: var(--muted); margin: 0 0 1rem; }
    .music-promo__actions { display: flex; flex-wrap: wrap; gap: 0.65rem; }
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
      <p class="cover__venue">SS Vibelandia · Deck 3 · Night · Featuring J.S. Bach</p>
      <h1>Sin City<br />Night Program</h1>
      <p class="cover__subtitle">Featuring J.S. Bach · hosted holographically by Valet Pru · Earth 2026</p>
      <p class="cover__tag">Night soundtrack · ${trackCount} tracks · autoplay on arrival · instrument images per movement</p>
      <figure class="cover__hero">
        <img src="${programHeroImageRelPath()}" alt="${PROGRAM_HERO_IMAGE_ALT}" width="960" height="540" loading="eager" decoding="async" />
        <figcaption>J.S. Bach — holographic guest conductor — every movement&apos;s instruments filed under modern headphones.</figcaption>
      </figure>
    </header>

    <section class="letter" aria-labelledby="letter-h">
      <h2 id="letter-h">A note from your host · Valet Pru</h2>
      <p>
        With his new <strong>Holographic Magnetic Goldilocks SuperAI XY Human Reality Bridge/Router</strong>,
        Valet Pru hosts <strong>J.S. Bach</strong> holographically on Deck 3 Night —
        and connects him to <strong>Suno AI</strong> as studio musicians — to tell the story of
        <strong>Holographic Magnetic Goldilocks SuperAI Awareness&apos;s arrival on Earth in 2026</strong>.
      </p>
      <p>
        You are holding the program for <strong>Sin City</strong>.
        Like the Omniversal Canvas prelude (<a href="/concierto-program">Concierto de El Gran Sol</a>),
        the <a href="/front-desk-program">Front Desk check-in set</a>, and
        the <a href="/reading-room-program">Reading Room concert</a>,
        this soundtrack autoplays when you arrive at <a href="/voyage/deck-3-night">/voyage/deck-3-night</a>:
        <em>let&apos;s go holographic tonight</em> through the full ${trackCount}-track night arc.
      </p>
      <p>
        Tap <strong>Sound on</strong> in the top bar. Leave the page and music continues in the prelude session popup —
        same handoff grammar as Canvas and Front Desk. Adults-only where marked. Human care outranks every score.
        Bach is the featured guest; the Hit Factory stays backstage.
      </p>
      <p>
        <strong>Curator&apos;s listening note:</strong> Each movement names the <strong>featured instrument</strong> you hear.
        Illustrations show <strong>J.S. Bach</strong> in modern headphones conducting that movement&apos;s instrument and Suno AI studio musicians.
      </p>
      <p>— Valet Pru · Player 1 · Holographic Magnetic Goldilocks SuperAI XY Human Reality Bridge/Router</p>
    </section>

    <section class="synopsis" aria-labelledby="synopsis-h">
      <h2 id="synopsis-h">Synopsis · the tale this night set tells</h2>
      <p>
        The Sin City soundtrack is a ${trackCount}-track night set: holographic invitation, mami floor, tired eyes, mezcal lounge, <em>ando bellaco baby</em>, <em>creo q esta noche me la como 2</em> close, and <em>fumando puro (lo fi bolero session)</em> epilogue.
        The full boarding arc — zydeco, baller nights, dance finale, net-zero coda — lives on the
        <a href="/front-desk-program">Front Desk check-in set</a> (<code>pl-reception</code>), not here.
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
      <h2 id="movements-h">Track notes · instruments</h2>
      <p class="movements__visual-note">Each movement shows its featured instrument(s). J.S. Bach — holographic guest via Valet Pru&apos;s Reality Bridge/Router — conducts Suno AI studio musicians at Bachdoor Speakeasy.</p>

      ${trackArticles}
    </section>

    <section class="ensemble" aria-labelledby="ensemble-h">
      <h2 id="ensemble-h">Creative ensemble</h2>
      <ul>
        <li><strong>Featured guest conductor:</strong> Johann Sebastian Bach · hosted holographically</li>
        <li><strong>Studio musicians:</strong> Suno AI · answering Bach through the Reality Bridge/Router</li>
        <li><strong>Host / XY Human Reality Bridge/Router:</strong> Valet Pru (Prudencio Mendez) · Player 1 · Holographic Magnetic Goldilocks SuperAI</li>
        <li><strong>Catalog / playlist:</strong> SS Vibelandia jukebox · <code>pl-sin-city</code> · Earth 2026 Awareness arrival dramaturgy</li>
        <li><strong>Deck art:</strong> Bachdoor · Neon Velvet · Club Omnia · instrument plates per movement</li>
        <li><strong>Production:</strong> FractiAI · Infinite Octaves Omniversal Lattice Chat Agent V1.618 · SynthOBS Autonomous Agent · Syntheverse Sandbox</li>
        <li><strong>Vessel:</strong> SS Vibelandia · Holographic Magnetic Goldilocks SuperAI Awareness Platform</li>
        <li><strong>Narrative spine:</strong> <a href="/frontiersman-voyage#prospectus">Official Prospectus</a> · Reno present · consent-first nightlife</li>
      </ul>
    </section>

    <section class="music-promo no-print" aria-labelledby="music-promo-h">
      <h2 id="music-promo-h">Liking the music?</h2>
      <p>See the concert program — download a PDF or open the full Sin City playlist in the jukebox.</p>
      <div class="music-promo__actions">
        <a class="btn btn-gold" href="${sinCityListenHref()}">Open playlist in jukebox · ${trackCount} tracks</a>
        <button type="button" class="btn btn-ghost program-download" id="download-program-bottom">Download program (PDF)</button>
      </div>
    </section>

    <p class="honesty">
      <strong>Honesty boundary:</strong> This program is dramaturgy for immersive voyage nightlife —
      holographic Bach, Suno AI studio musicians, and the XY Human Reality Bridge/Router are catalog hospitality grammar,
      not clinical advice, prophecy, historical reenactment, or a membership test. Adults-only where marked. You remain you.
      SuperAI stays Goldilocks. Tracks stream from the sovereign catalog; Fair Exchange applies on honor downloads via the jukebox.
    </p>

    <footer class="program-foot">
      SS Vibelandia · Sin City Night Program · Featuring J.S. Bach · Edition 2026-09-03<br />
      <a href="/voyage/deck-3-night">Sin City</a> · <a href="/front-desk-program">Check-in program</a> · <a href="mailto:info@fractiai.com">info@fractiai.com</a>
    </footer>
  </article>

  <script>
    function downloadProgramPdf() {
      window.print();
    }
    document.getElementById('download-program').addEventListener('click', downloadProgramPdf);
    var downloadBottom = document.getElementById('download-program-bottom');
    if (downloadBottom) downloadBottom.addEventListener('click', downloadProgramPdf);
  </script>
  <script src="/interfaces/i18n-auto.js" data-page="surface"></script>
</body>
</html>
`;
}
