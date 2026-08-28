/**
 * Cold-traffic visit funnel — Canvas → Concert program → Reception.
 * Reduces parallel hero modules; depth doors stay below the fold.
 */

export const VISIT_GOLDEN_PATH_KICKER = 'Start here · one path through the art';

/** @typedef {'canvas' | 'reception'} VisitGoldenPathPhase */

/**
 * @param {VisitGoldenPathPhase} active
 * @param {{ anchorReception?: string }} [opts]
 */
export function renderVisitGoldenPathHtml(active, opts = {}) {
  const receptionHref = opts.anchorReception ?? '/questfest';
  const steps = [
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
      here: false,
      primary: true,
    },
    {
      id: 'reception',
      num: '3',
      label: active === 'reception' ? 'Reception · today\u2019s board' : 'Reception',
      href: receptionHref,
      here: active === 'reception',
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
    active === 'reception'
      ? `<p class="visit-golden-path__doors-note">When you want depth, scroll to <a href="#ship-channels-h">five cruise doors</a> — Journey, Jukebox, Library, Creator Studio.</p>`
      : `<p class="visit-golden-path__doors-note">Tap <strong>Sound on</strong> above, then follow the path. Adventures and domes stay on the page below.</p>`;

  return `<nav class="visit-golden-path visit-golden-path--${active}" aria-label="${VISIT_GOLDEN_PATH_KICKER}">
      <p class="visit-golden-path__kicker">${VISIT_GOLDEN_PATH_KICKER}</p>
      <ol class="visit-golden-path__list">
      ${items}
      </ol>
    </nav>
    ${doorsNote}`;
}

/** Hero CTAs aligned to golden path (replaces five parallel buttons on reception). */
export function renderVisitGoldenPathHeroCtasHtml(active) {
  if (active === 'canvas') {
    return `<a class="btn btn--gold" href="/concierto-program">Concert program</a>
        <a class="btn btn--gold" href="/questfest">Phase 2 · Reception</a>
        <a class="btn btn--ghost" href="#exhibit">Explore the exhibit</a>`;
  }
  return `<a class="btn btn-primary btn-player-lead" href="/concierto-program">Concert program</a>
        <a class="btn btn-primary" href="#ship-blog">Today\u2019s ship board</a>
        <a class="btn btn-ghost" href="mailto:info@fractiai.com?subject=SS%20Vibelandia%20visit%20%E2%80%94%20email%20Valet%20Pru">Email Valet Pru</a>`;
}
