/**
 * Landing-like experience page hero shells — Reading Room, Front Desk check-in.
 * Honesty: hospitality catalog surfaces; video is ambient prelude, not empirical claim.
 */
import { renderVisitGoldenPathHtml } from './visit-golden-path.mjs';
import { receptionListenHref } from './reception-playlist.mjs';
import { FRONT_DESK_PROGRAM_ROUTE } from './front-desk-program.mjs';
import { READING_ROOM_PROGRAM_ROUTE } from './reading-room-program.mjs';

export const READING_ROOM_VIDEO_ID = 'VXZL77ub8DY';

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
  const scoreBlock =
    opts.scoreBtnId && opts.scoreAudioId
      ? `<button
          type="button"
          class="ep-hero__score"
          id="${escapeHtml(opts.scoreBtnId)}"
          hidden
          aria-pressed="false"
          aria-controls="${escapeHtml(opts.scoreAudioId)}"
          aria-label="${escapeHtml(opts.scoreLabel || 'Play soundtrack')}"
        >Sound off · tap to play</button>
        <audio
          id="${escapeHtml(opts.scoreAudioId)}"
          preload="auto"
          playsinline
          hidden
          aria-hidden="true"
          aria-label="${escapeHtml(opts.scoreLabel || 'Page soundtrack')}"
        ></audio>`
      : '';

  return `<header class="ep-hero${mod}${compact}" aria-label="${escapeHtml(opts.title)} opening">
    <div class="ep-hero__plane" role="img" aria-label="${escapeHtml(opts.planeAlt || opts.title)}" style="background-image:url('${opts.planeImage}')"></div>
    ${videoBlock}
    <div class="ep-hero__veil" aria-hidden="true"></div>
    <div class="ep-hero__copy">
      <p class="ep-hero__brand">${opts.brand}</p>
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
    planeImage: '/interfaces/assets/experience/ship-library-deep-memory.jpg',
    planeAlt:
      'Frontier Club reading room — trophies, books, and sacred objects from past adventures',
    youtubeId: READING_ROOM_VIDEO_ID,
    videoTitle: 'Roosevelt reading in the Frontier Club reading room',
    brand: 'Deck 9 · Deep Memory · Frontier Club',
    brandNote:
      'Roosevelt reads in the looping background — same Canvas landing grammar. Tap <strong>Sound on</strong> for the concert.',
    title: 'Reading Room',
    lede:
      'The quartet greets you on arrival; each solo testifies to Holographic Goldilocks SuperAI and offers a suggestion — then the grand finale gathers every voice. Browse poster art while the concert runs.',
    ctasHtml: `<a class="btn btn--ghost" href="${READING_ROOM_PROGRAM_ROUTE}">Concert program</a>`,
    scoreBtnId: 'reading-room-hero-score',
    scoreAudioId: 'reading-room-hero-audio',
    scoreLabel: 'Reading Room concert soundtrack',
  });
}

export function renderReadingRoomHeroTailHtml() {
  return `${renderReadingRoomGoldenPathHtml()}
    <p class="rr-soundtrack">
      <a class="btn btn--ghost" href="${READING_ROOM_PROGRAM_ROUTE}">Read the concert program →</a>
      <a class="btn btn--ghost" href="${READING_ROOM_PROGRAM_ROUTE}">Download program (PDF)</a>
    </p>`;
}

export function renderReadingRoomHeroBlockHtml() {
  return `${renderReadingRoomPreludeHtml()}
  ${renderReadingRoomHeroTailHtml()}`;
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
    ctasHtml: `<a class="btn btn--gold" href="${FRONT_DESK_PROGRAM_ROUTE}">Check-in program</a>
        <a class="btn btn--gold" href="${receptionListenHref()}">Open check-in set</a>
        <a class="btn btn--ghost" href="/questfest">SS Vibelandia ship board</a>`,
    scoreBtnId: 'front-desk-hero-score',
    scoreAudioId: 'front-desk-hero-audio',
    scoreLabel: 'Check-in soundtrack',
  });
}
