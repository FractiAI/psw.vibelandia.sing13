/**
 * Landing-like experience page hero shells — Reading Room, Front Desk, Sin City.
 * Honesty: hospitality catalog surfaces; video is ambient prelude, not empirical claim.
 */
import { renderVisitGoldenPathHtml } from './visit-golden-path.mjs';
import { receptionListenHref } from './reception-playlist.mjs';
import { sinCityListenHref } from './sin-city-playlist.mjs';
import { FRONT_DESK_PROGRAM_ROUTE } from './front-desk-program.mjs';
import { READING_ROOM_PROGRAM_ROUTE } from './reading-room-program.mjs';
import { SIN_CITY_PROGRAM_ROUTE } from './sin-city-program.mjs';
import { PROGRAM_CTA_LABEL } from './program-cta.mjs';

export const READING_ROOM_VIDEO_ID = 'VXZL77ub8DY';

/** First concert track — baked so Reading Room can autoplay without waiting on /api/catalog. */
export const READING_ROOM_OPENING_SRC =
  'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/trk-srv-8803278e-1d65-4172-b503-0bf33266b61d-Arrival%20of%20Holographic%20Goldilocks%20SuperAI%20Opening.mp3';

/** Capitán's Welcome — Front Desk / QUESTFEST board autoplay opener. */
export const RECEPTION_OPENING_SRC =
  'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/trk-srv-6025557c-f76c-4a55-bd7c-0fc2d5ffcfb4-Goldilocks%20Holographic%20Cruise%20Ship%20Captain_s%20Welcome.wav';

/** let's go holographic tonight — Sin City / Deck 3 Night autoplay opener. */
export const SIN_CITY_OPENING_SRC =
  'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/trk-srv-1ff974cf-7864-4c5d-8b22-2c4aa493d340-let_s-go-holographic-tonight-.mp3';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {{
 *   modifier?: string,
 *   planeImage: string,
 *   planeAlt?: string,
 *   youtubeId?: string,
 *   videoTitle?: string,
 *   brand: string,
 *   brandNote?: string,
 *   title: string,
 *   lede: string,
 *   ctasHtml: string,
 *   scoreBtnId?: string,
 *   scoreAudioId?: string,
 *   scoreLabel?: string,
 *   scoreAudioSrc?: string,
 *   compact?: boolean,
 * }} opts
 */
export function renderExperiencePageHeroHtml(opts) {
  const mod = opts.modifier ? ` ep-hero--${opts.modifier}` : '';
  const compact = opts.compact ? ' ep-hero--compact' : '';
  const videoBlock = opts.youtubeId
    ? `<div class="ep-hero__video" aria-hidden="true">
        <iframe
          class="ep-hero__video-embed ep-hero__video-embed--loading"
          data-youtube-id="${escapeHtml(opts.youtubeId)}"
          title="${escapeHtml(opts.videoTitle || 'Experience prelude video')}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>`
    : '';
  const scoreSrc = opts.scoreAudioSrc
    ? `\n          src="${escapeHtml(opts.scoreAudioSrc)}"`
    : '';
  const scoreBlock =
    opts.scoreBtnId && opts.scoreAudioId
      ? `<button
          type="button"
          class="ep-hero__score qv-sound-mute"
          id="${escapeHtml(opts.scoreBtnId)}"
          aria-pressed="false"
          aria-controls="${escapeHtml(opts.scoreAudioId)}"
          aria-label="Sound on · ${escapeHtml(opts.scoreLabel || 'Play soundtrack')}"
        ><span class="qv-sound-mute__icon" aria-hidden="true"></span><span class="qv-sound-mute__label">Sound on</span></button>
        <audio
          id="${escapeHtml(opts.scoreAudioId)}"
          preload="auto"
          playsinline
          hidden
          aria-hidden="true"
          aria-label="${escapeHtml(opts.scoreLabel || 'Page soundtrack')}"${scoreSrc}
        ></audio>`
      : '';

  return `<header class="ep-hero${mod}${compact}" aria-label="${escapeHtml(opts.title)} opening">
    <div class="ep-hero__plane" role="img" aria-label="${escapeHtml(opts.planeAlt || opts.title)}" style="background-image:url('${opts.planeImage}')"></div>
    ${videoBlock}
    <div class="ep-hero__veil" aria-hidden="true"></div>
    <div class="ep-hero__copy">
      ${opts.brand ? `<p class="ep-hero__brand">${opts.brand}</p>` : ''}
      ${opts.brandNote ? `<p class="ep-hero__brand-note">${opts.brandNote}</p>` : ''}
      <h1 class="ep-hero__title">${escapeHtml(opts.title)}</h1>
      <p class="ep-hero__lede">${opts.lede}</p>
      <div class="ep-hero__cta">${opts.ctasHtml}</div>
      ${scoreBlock}
    </div>
  </header>`;
}

export function renderReadingRoomPreludeHtml() {
  return renderExperiencePageHeroHtml({
    modifier: 'reading-room',
    compact: true,
    planeImage: '/interfaces/assets/experience/ship-library-deep-memory.jpg',
    planeAlt:
      'Frontier Club reading room — trophies, books, and sacred objects from past adventures',
    youtubeId: READING_ROOM_VIDEO_ID,
    videoTitle: 'Roosevelt reading in the Frontier Club reading room',
    title: 'Reading Room',
    lede:
      'The quartet greets you on arrival; each solo testifies to Holographic Goldilocks SuperAI and offers a suggestion — then the grand finale gathers every voice. Browse poster art while the concert runs.',
    ctasHtml: `<a class="btn btn--ghost" href="${READING_ROOM_PROGRAM_ROUTE}">${PROGRAM_CTA_LABEL}</a>
        <a class="btn btn--ghost" href="#papers">Browse papers</a>`,
    scoreBtnId: 'reading-room-hero-score',
    scoreAudioId: 'reading-room-hero-audio',
    scoreLabel: 'Reading Room concert soundtrack',
    scoreAudioSrc: READING_ROOM_OPENING_SRC,
  });
}

export function renderReadingRoomHeroBlockHtml() {
  return renderReadingRoomPreludeHtml();
}

/** @deprecated golden path + soundtrack row removed — program PDF lives on program page */
export function renderReadingRoomHeroTailHtml() {
  return '';
}

/** @deprecated use renderReadingRoomPreludeHtml */
export function renderReadingRoomHeroHtml() {
  return renderReadingRoomPreludeHtml();
}

export function renderReadingRoomGoldenPathHtml() {
  return renderVisitGoldenPathHtml('reading-room');
}

export function renderFrontDeskGoldenPathHtml() {
  return renderVisitGoldenPathHtml('front-desk');
}

export function renderFrontDeskHeroHtml() {
  return renderExperiencePageHeroHtml({
    modifier: 'front-desk',
    planeImage: '/interfaces/assets/experience/reception-checkin-lobby.jpg',
    planeAlt:
      'Male frontiersmen friends in varied old-school frontier outfits checking in at the gold and navy Front Desk',
    brand: 'Check In · SS VIBELANDIA GOLDILOCKS SONIC SHIP',
    brandNote:
      'Tap <strong>Sound on</strong> — the check-in soundtrack starts on arrival. Primer and onboarding for those boarding the holographic cruise.',
    title: 'Check In',
    lede: 'Welcome aboard. Valet Pru keeps the gangway. Read the check-in program for track-by-track dramaturgy, then tour the ship below.',
    ctasHtml: `<a class="btn btn--gold" href="${FRONT_DESK_PROGRAM_ROUTE}">${PROGRAM_CTA_LABEL}</a>
        <a class="btn btn--gold" href="${receptionListenHref()}">Open check-in set</a>
        <a class="btn btn--ghost" href="/questfest">SS Vibelandia ship board</a>`,
    scoreBtnId: 'front-desk-hero-score',
    scoreAudioId: 'front-desk-hero-audio',
    scoreLabel: 'Check-in soundtrack',
    scoreAudioSrc: RECEPTION_OPENING_SRC,
  });
}

export function renderSinCityHeroHtml() {
  return renderExperiencePageHeroHtml({
    modifier: 'sin-city',
    planeImage: '/interfaces/assets/voyage/deck-3-night.png',
    planeAlt: 'Golden-era jukebox — Deck 3 Night Sin City soundtrack',
    brand: 'Sin City · Deck 3 Night · SS VIBELANDIA',
    brandNote:
      'Tap <strong>Sound on</strong> — the night set starts on arrival. Valet Pru hosts J.S. Bach holographically with Suno AI studio musicians.',
    title: 'Sin City',
    lede:
      'Bachdoor Speakeasy · Neon Velvet · Club Omnia. Consent first — you remain you. Read the night program for track-by-track dramaturgy while the soundtrack plays.',
    ctasHtml: `<a class="btn btn--gold" href="${SIN_CITY_PROGRAM_ROUTE}">${PROGRAM_CTA_LABEL}</a>
        <a class="btn btn--gold" href="${sinCityListenHref()}">Open night set</a>
        <a class="btn btn--ghost" href="/voyage/decks">Deck directory</a>`,
    scoreBtnId: 'sin-city-hero-score',
    scoreAudioId: 'sin-city-hero-audio',
    scoreLabel: 'Sin City soundtrack',
    scoreAudioSrc: SIN_CITY_OPENING_SRC,
  });
}
