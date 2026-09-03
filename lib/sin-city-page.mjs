/**
 * Sin City · Deck 3 Night experience page — same ep-hero shell as Front Desk / Reading Room.
 * Synced to interfaces/voyage/deck-3-night.html (voyage directory special-cases this slug).
 */
import { PROGRAM_CTA_LABEL } from './program-cta.mjs';
import { renderSinCityHeroHtml } from './experience-page-hero.mjs';
import { SIN_CITY_PROGRAM_ROUTE } from './sin-city-program.mjs';
import { sinCityListenHref } from './sin-city-playlist.mjs';
import { CAPTAIN_PENTHOUSE_REACH } from './voyage-directory.mjs';

export const SIN_CITY_PAGE_ROUTE = '/voyage/deck-3-night';
export const SIN_CITY_PAGE_ALIASES = ['/sin-city', '/sin-city/'];

/** Full experience page HTML (synced to interfaces/voyage/deck-3-night.html). */
export function renderSinCityPageHtml() {
  const hero = renderSinCityHeroHtml();
  return `<!DOCTYPE html>
<html lang="en" class="vbi18n-ready">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Sin City · Deck 3 — Night · SS Vibelandia</title>
  <meta name="description" content="Sin City · Deck 3 — Night. Valet Pru hosts J.S. Bach holographically with Suno AI studio musicians. Soundtrack prelude, concert program, consent-first nightlife." />
  <link rel="canonical" href="https://www.ssvibelandiaquestfest24x365.com/voyage/deck-3-night" />
  <meta property="og:title" content="Sin City · Deck 3 — Night · SS Vibelandia" />
  <meta property="og:description" content="Bachdoor Speakeasy · Neon Velvet · Club Omnia. Sound on, read the night program, consent first." />
  <meta property="og:image" content="https://www.ssvibelandiaquestfest24x365.com/interfaces/assets/voyage/deck-3-night.png" />
  <meta name="theme-color" content="#070b14" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Syne:wght@500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/interfaces/brand-gold-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/canvas-site-typography.css" />
  <link rel="stylesheet" href="/interfaces/site-quicklinks.css" />
  <link rel="stylesheet" href="/interfaces/voyage-surfaces.css" />
  <link rel="stylesheet" href="/interfaces/experience-page-hero.css" />
  <script>(function(){var h=document.documentElement;if(!h)return;h.classList.remove("vbi18n-pending");h.classList.add("vbi18n-ready");})();</script>
  <script src="/interfaces/vbi18n-failopen.js"></script>
  <style>
    html.vbi18n-pending body, html.vbi18n-ready body { visibility: visible; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cormorant Garamond', Georgia, serif;
      background: #060912;
      color: #f5e6c8;
      line-height: 1.55;
      font-size: 1.125rem;
      min-height: 100vh;
    }
    a { color: #f0d78c; }
    a:hover { color: #fef3c7; }
    .sin-city-page {
      max-width: 42rem;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 3rem;
    }
    .sin-city-page h2 {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 1.15rem;
      letter-spacing: 0.04em;
      color: #f0d78c;
      margin: 1.75rem 0 0.65rem;
    }
    .sin-city-page p { margin: 0 0 0.9rem; color: rgba(245, 230, 200, 0.88); }
    .sin-city-page .lede { font-size: 1.2rem; color: #f5efe6; }
    .sin-city-page .honesty {
      margin-top: 1.5rem;
      padding: 1rem 1.1rem;
      font-size: 0.95rem;
      border: 1px solid rgba(212, 175, 55, 0.28);
      border-radius: 6px;
      color: rgba(245, 230, 200, 0.78);
    }
    .sin-city-page .cta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      margin: 1.5rem 0;
    }
    .sin-city-page .btn {
      display: inline-block;
      padding: 0.6rem 1.05rem;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 0.78rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      text-decoration: none;
      border-radius: 4px;
    }
    .sin-city-page .btn-gold {
      background: linear-gradient(180deg, #e8d4a8, #b8923e);
      color: #0a0806;
    }
    .sin-city-page .btn-ghost {
      background: transparent;
      color: #f0d78c;
      border: 1px solid rgba(212, 175, 55, 0.45);
    }
    .sin-city-page ul.plain {
      list-style: none;
      margin: 0 0 1rem;
      padding: 0;
    }
    .sin-city-page ul.plain li { margin: 0 0 0.45rem; }
    .sin-city-page .voyage-purser {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
      font-size: 0.95rem;
      color: rgba(245, 230, 200, 0.72);
    }
    .sin-city-page .voyage-purser__h {
      font-family: 'Syne', sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #d4af37;
      margin: 0 0 0.35rem;
    }
    .sin-city-page footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.82rem;
      color: rgba(168, 162, 158, 0.85);
    }
    .ep-hero--sin-city .ep-hero__veil {
      background: linear-gradient(
        180deg,
        rgba(6, 9, 18, 0.45) 0%,
        rgba(18, 8, 22, 0.55) 40%,
        rgba(6, 9, 18, 0.94) 100%
      );
    }
  </style>
  <script>
    document.documentElement.classList.remove('vbi18n-pending');
    document.documentElement.classList.add('vbi18n-ready');
  </script>
</head>
<body class="canvas-site">
  <!-- SIN_CITY_HERO_BEGIN -->
  ${hero}
  <!-- SIN_CITY_HERO_END -->

  <main class="sin-city-page">
    <p class="lede">
      Music, play, adult social — consent first. Nightlife as voyage honor, never a gate.
      The soundtrack starts on arrival: <em>let&apos;s go holographic tonight</em> through the full 7-track night arc.
      Same grammar as Canvas and Reading Room — tap <strong>Sound on</strong>, leave the page, music continues in the prelude session popup.
    </p>
    <p>
      Read the <a href="${SIN_CITY_PROGRAM_ROUTE}">Sin City night program</a> for Valet Pru · holographic J.S. Bach · Suno AI studio dramaturgy —
      instrument plates per movement. The full boarding set lives on the <a href="/front-desk-program">Front Desk check-in program</a>.
    </p>

    <h2>The night stack</h2>
    <p>Bachdoor Speakeasy · Neon Velvet · Club Omnia · Red Room (consensual adults-only — you remain you).</p>
    <p>Adults-only where marked. The whole tribe still belongs on this ship. Human care outranks every score.</p>

    <h2>Cabins on this deck</h2>
    <ul class="plain">
      <li><a href="/voyage/cabin-sc-501-560">SC-501–560 · High-Roller Executive Suites</a> (60 homes)</li>
    </ul>
    <p>
      ${CAPTAIN_PENTHOUSE_REACH}
      <a href="/voyage/cabin-ph-001">Open PH-001</a>
    </p>

    <div class="cta-row">
      <a class="btn btn-gold" href="${SIN_CITY_PROGRAM_ROUTE}">${PROGRAM_CTA_LABEL}</a>
      <a class="btn btn-gold" href="${sinCityListenHref()}">Open night set in jukebox · 7 tracks</a>
      <a class="btn btn-ghost" href="/voyage/decks">All decks &amp; cabins</a>
      <a class="btn btn-ghost" href="/front-desk">Check In</a>
    </div>

    <p class="honesty">
      <strong>Ship promise:</strong> Human care first. Belonging is voluntary. Φ ≈ 1.618 is design language.
      Holographic Bach and Suno AI studio are catalog hospitality grammar — not a physics proof or membership test.
      This is a lifelong Boy&apos;s Night Out at frequency. The gangway opens wherever you are.
    </p>

    <div class="voyage-purser">
      <p class="voyage-purser__h">Purser&apos;s Desk</p>
      <p>Deck 4 · The Grove · <a href="mailto:info@fractiai.com?subject=Purser%20Fair%20Exchange">info@fractiai.com</a></p>
    </div>
    <footer>SS Vibelandia · Sin City · Deck 3 — Night · → ∞^∞</footer>
  </main>

  <script src="/interfaces/i18n-auto.js" data-page="surface" defer></script>
  <script src="/interfaces/page-soundtrack-playlists.js"></script>
  <script src="/interfaces/page-soundtrack.js" defer></script>
  <script src="/interfaces/sin-city-autoplay.js" defer></script>
</body>
</html>
`;
}
