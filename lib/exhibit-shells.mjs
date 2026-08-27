/**
 * Three nested exhibit shells on the Omniversal Canvas: Core, Amphitheater, Horizon.
 * Distinct from voyage Journeys (adventures). Honesty: exhibit catalog grammar.
 */

export const EXHIBIT_SHELLS = [
  {
    id: 'core',
    href: '/core',
    label: 'Dome 1 · Core',
    title: 'Holographic Convergence Core',
    image: '/interfaces/assets/exhibit/exhibit-core-key.jpg',
    imageAlt: 'Male silhouette at the still center of nested gold domes under a night sky',
    preview:
      'Dome 1. Dark and audio-first. Self-talk, instrumentals, soundtracks, and the full Sonic Singularity catalog. Small fireworks and psychedelic accents for the inner worlds people nicknamed imagination.',
    body:
      'Dome 1 is the innermost experience: dark, heard more than seen. Self-talk rides the mix. Instrumentals, musical soundtracks, and the Sonic Singularity catalog fill the room. Little accents of fireworks and psychedelic pictures stand in for the worlds guests name DMT and psilocybin: dragons, elves, angels, demons, and gods. Street talk calls that layer imagination. This exhibit files it as holographic reality, pattern living within all, which ordinary language labels metaphor and which here is treated as the inner real. Fine print on the room page: catalog pictures and music, not a pharmacy.',
    still: '/interfaces/assets/exhibit/exhibit-step-in-still.jpg',
    stillCap: 'Walk-in center',
  },
  {
    id: 'amphitheater',
    href: '/amphitheater',
    label: 'Dome 2 · Amphitheater',
    title: 'Goldilocks Amphitheater',
    image: '/interfaces/assets/exhibit/exhibit-amphitheater-key.jpg',
    imageAlt: 'Nested gold amphitheater shells with guests under stars',
    preview:
      'Dome 2. The projection of the immediate world you occupy: the set, the cast, and the daily-life stories running now.',
    body:
      'Dome 2 is the middle shell: the outer world thrown inward as a living projection. The set. The cast. The stories of daily life as they are happening now. Fans, crew, enterprises, franchises, and the people sitting beside you. This is the world you walk through today, nested around Dome 1 so the inner mix and the outer day can occupy one house.',
    still: '/interfaces/assets/exhibit/exhibit-fiction-still.jpg',
    stillCap: 'Nested camp at night',
  },
  {
    id: 'horizon',
    href: '/horizon',
    label: 'Dome 3 · Horizon',
    title: 'Omni-Horizon',
    image: '/interfaces/assets/exhibit/exhibit-horizon-key.jpg',
    imageAlt: 'Three stacked horizons from body to holographic lattice sky',
    preview:
      'Dome 3. Holographic Magnetic Goldilocks SuperAI Studio, Canvas, and Materials. Lattice Chat as point-and-click awareness navigation.',
    body:
      'Dome 3 is the outer shell: the Holographic Magnetic Goldilocks SuperAI Studio, Canvas, and Materials. Here Lattice Chat is a click-to-go, click-to-see surface. A wormhole by awareness, not by hardware teleport. Human-to-human reality bridge/routers carry spin navigation: people routing attention for one another. Valet Pru is the Human Bridge/Router on the gold museum framed entrance. Open Lattice Chat when you want the studio in your hands.',
    still: '/interfaces/assets/nesting/nest-syntheverse.png',
    stillCap: 'Studio nest in the sandbox',
  },
];

export function renderCanvasShellsSectionHtml() {
  const cards = EXHIBIT_SHELLS.map(
    (s) => `<article class="shell-card">
        <a class="shell-card__link" href="${s.href}">
          <img class="shell-card__img" src="${s.image}" alt="${s.imageAlt.replace(/"/g, '&quot;')}" loading="lazy" decoding="async" width="960" height="540" />
          <div class="shell-card__body">
            <h3>${s.label}</h3>
            <p class="shell-card__preview">${s.preview}</p>
            <p class="shell-card__more">Open the full room →</p>
          </div>
        </a>
        <figure class="shell-card__still">
          <img src="${s.still}" alt="" loading="lazy" decoding="async" />
          <figcaption>${s.stillCap}</figcaption>
        </figure>
        <p class="shell-card__body-text">${s.body}</p>
      </article>`,
  ).join('\n      ');

  return `<section class="stage-wrap stage-wrap--rich" id="exhibit" aria-labelledby="stage-h">
      <h2 id="stage-h">Three nested shells</h2>
      <p class="sub">Dome 1 is the dark audio core. Dome 2 is the set and daily life now. Dome 3 is the Holographic Magnetic Goldilocks SuperAI Studio, Canvas, and Materials: Lattice Chat as point-and-click awareness navigation. Touch a dome for the full room.</p>
      <div class="shell-cards" role="list">
      ${cards}
      </div>
      <div class="stage stage--compact" id="canvas-stage" aria-label="Interactive Convergence Core preview">
        <div class="shell shell--3" data-shell="3"></div>
        <div class="shell shell--2" data-shell="2"></div>
        <div class="shell shell--1" data-shell="1"></div>
        <figure class="core-player">
          <svg viewBox="0 0 40 108" role="img" aria-label="Human male silhouette at the Convergence Core">
            <circle cx="20" cy="11" r="8.2" fill="#070b14" stroke="#faf6ee" stroke-width="1.7"/>
            <path fill="#070b14" stroke="#faf6ee" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" d="M12 21.5c0-2.2 3.4-3.6 8-3.6s8 1.4 8 3.6v6.2H12z"/>
            <path fill="#070b14" stroke="#faf6ee" stroke-width="1.7" stroke-linejoin="round" d="M7 29.5c-1 0-1.7.8-1.7 1.9L8.2 62c.2 1.9 1.9 3.2 3.8 3.2h3.2L13.4 100c0 2.4 1.8 4.2 4.1 4.2h2.1c2.3 0 3.9-1.8 3.9-4.2V66.2h.8V100c0 2.4 1.6 4.2 3.9 4.2h2.1c2.3 0 4.1-1.8 4.1-4.2L30.8 65.2h3.2c1.9 0 3.6-1.3 3.8-3.2L34.7 31.4c0-1.1-.7-1.9-1.7-1.9H7z"/>
          </svg>
          <figcaption class="core-player__label">Player</figcaption>
        </figure>
        <div class="baseplane" aria-hidden="true"></div>
      </div>
      <p class="shell-readout" id="shell-readout">
        <strong>Touch a dome above</strong> for the full room: curated key art, chapters, and honesty rails. The interactive stage below is a preview only.
      </p>
    </section>`;
}
