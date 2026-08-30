/**
 * Cold-traffic visit funnel — Canvas → Concert program → Front Desk.
 * Reduces parallel hero modules; depth doors stay below the fold.
 */

export const VISIT_GOLDEN_PATH_KICKER = 'Start here · one path through the art';

/** @typedef {'canvas' | 'front-desk' | 'ship'} VisitGoldenPathPhase */

/**
 * @param {VisitGoldenPathPhase} active
 * @param {{ anchorFrontDesk?: string }} [opts]
 */
export function renderVisitGoldenPathHtml(active, opts = {}) {
  const frontDeskHref = opts.anchorFrontDesk ?? '/front-desk';
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
      id: 'front-desk',
      num: '3',
      label: active === 'front-desk' ? 'Front Desk · check-in' : 'Front Desk',
      href: frontDeskHref,
      here: active === 'front-desk',
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
    active === 'front-desk'
      ? `<p class="visit-golden-path__doors-note">When you want the vessel story, visit the <a href="/questfest">SS Vibelandia ship board</a>.</p>`
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
  return `<a class="btn btn-primary btn-player-lead" href="/concierto-program">Concert program</a>
        <a class="btn btn-primary" href="/front-desk">Front Desk · check-in</a>
        <a class="btn btn-ghost" href="/journey">Journey · adventures</a>`;
}
