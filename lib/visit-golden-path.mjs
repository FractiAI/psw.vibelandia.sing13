/**
 * Cold-traffic visit funnel — Canvas → Concert program → Front Desk.
 * Front Desk page mirrors the pattern: Sound on → Check-in program → Creator Studio.
 * Reduces parallel hero modules; depth doors stay below the fold.
 */
import { receptionListenHref } from './reception-playlist.mjs';

export const VISIT_GOLDEN_PATH_KICKER = 'Start here · one path through the art';

/** @typedef {'canvas' | 'front-desk' | 'reading-room' | 'ship'} VisitGoldenPathPhase */

/**
 * @param {VisitGoldenPathPhase} active
 * @param {{ anchorFrontDesk?: string }} [opts]
 */
export function renderVisitGoldenPathHtml(active, opts = {}) {
  const frontDeskHref = opts.anchorFrontDesk ?? '/front-desk';
  /** @type {{ id: string, num: string, label: string, href: string, here?: boolean, primary?: boolean }[]} */
  const steps =
    active === 'reading-room'
      ? [
          {
            id: 'room',
            num: '1',
            label: 'Reading Room',
            href: '/reading-room',
            here: true,
          },
          {
            id: 'papers',
            num: '2',
            label: 'Browse papers',
            href: '/reading-room#papers',
            primary: true,
          },
          {
            id: 'front-desk',
            num: '3',
            label: 'Front Desk',
            href: '/front-desk',
          },
        ]
      : active === 'front-desk'
        ? [
            {
              id: 'check-in',
              num: '1',
              label: 'Front Desk · Sound on',
              href: '/front-desk',
              here: true,
            },
            {
              id: 'program',
              num: '2',
              label: 'Check-in program',
              href: '/front-desk-program',
              primary: true,
            },
            {
              id: 'create',
              num: '3',
              label: 'Creator Studio',
              href: '/creator-studio',
            },
          ]
        : [
          {
            id: 'exhibit',
            num: '1',
            label: 'Exhibit · Sound on',
            href: '/',
            here: active === 'canvas',
          },
          {
            id: 'program',
            num: '2',
            label: 'Concert program',
            href: '/concierto-program',
            primary: true,
          },
          {
            id: 'front-desk',
            num: '3',
            label: 'Front Desk',
            href: frontDeskHref,
          },
        ];

  const items = steps
    .map((s) => {
      const cls = [
        'visit-golden-path__step',
        s.here ? 'visit-golden-path__step--here' : '',
        s.primary ? 'visit-golden-path__step--primary' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const current = s.here ? ' aria-current="step"' : '';
      return `<li class="${cls}">
        <a href="${s.href}"${current}>
          <span class="visit-golden-path__num">${s.num}</span>
          <span class="visit-golden-path__label">${s.label}</span>
        </a>
      </li>`;
    })
    .join('\n      ');

  const doorsNote =
    active === 'reading-room'
      ? `<p class="visit-golden-path__doors-note">Scroll for the full paper menu by category — or check in at the <a href="/front-desk">Front Desk</a> when you are ready to board.</p>`
      : active === 'front-desk'
        ? `<p class="visit-golden-path__doors-note">Tap <strong>Sound on</strong> above, read the <a href="/front-desk-program">check-in program</a>, then tour the ship below — or continue to <a href="/creator-studio">Creator Studio</a>.</p>`
        : active === 'ship'
        ? `<p class="visit-golden-path__doors-note">You are on the ship board. Scroll for narrative, crew, and mission — or check in at the <a href="/front-desk">Front Desk</a>.</p>`
        : `<p class="visit-golden-path__doors-note">Tap <strong>Sound on</strong> above, then follow the path. Adventures and domes stay on the page below.</p>`;

  return `<nav class="visit-golden-path visit-golden-path--${active}" aria-label="${VISIT_GOLDEN_PATH_KICKER}">
      <p class="visit-golden-path__kicker">${VISIT_GOLDEN_PATH_KICKER}</p>
      <ol class="visit-golden-path__list">
      ${items}
      </ol>
    </nav>
    ${doorsNote}`;
}

/** Hero CTAs aligned to golden path (replaces five parallel buttons on front desk). */
export function renderVisitGoldenPathHeroCtasHtml(active) {
  if (active === 'canvas') {
    return `<a class="btn btn--gold" href="/concierto-program">Concert program</a>
        <a class="btn btn--gold" href="/front-desk">Front Desk · check-in</a>
        <a class="btn btn--ghost" href="#exhibit">Explore the exhibit</a>`;
  }
  if (active === 'front-desk') {
    return `<a class="btn btn-primary" href="/front-desk-program">Check-in program</a>
        <a class="btn btn-primary" href="${receptionListenHref()}">Open check-in set</a>
        <a class="btn btn-ghost" href="/creator-studio">Creator Studio →</a>`;
  }
  return `<a class="btn btn-primary btn-player-lead" href="/concierto-program">Concert program</a>
        <a class="btn btn-primary" href="/front-desk">Front Desk · check-in</a>
        <a class="btn btn-ghost" href="/journey">Journey · adventures</a>`;
}
