/**
 * Three nested exhibit shells on the Omniversal Canvas — Core · Amphitheater · Horizon.
 * Distinct from voyage Journeys (adventures). Honesty: exhibit / catalog grammar.
 */

export const EXHIBIT_SHELLS = [
  {
    id: 'core',
    href: '/core',
    label: 'Convergence Core',
    title: 'Holographic Convergence Core',
    image: '/interfaces/assets/exhibit/exhibit-core-key.jpg',
    imageAlt: 'Male silhouette at the still center of nested gold domes under a night sky',
    preview:
      'The innermost dome. Who you call you — the still center where story, frequency, and self are allowed to meet without being flattened into a slogan.',
    body:
      'Stand here when you want the hitch of the whole installation: the Player mark at the gold still-point. This is not a login screen or a genome test. It is exhibit grammar for the person looking — meat, memory, and the part of you that stays you when the rings breathe. Story, frequency, and self nest here the way the three shells nest on the landing. When the house fills in the Amphitheater, this center does not vanish.',
    still: '/interfaces/assets/exhibit/exhibit-step-in-still.jpg',
    stillCap: 'Still · walk-in center',
  },
  {
    id: 'amphitheater',
    href: '/amphitheater',
    label: 'Goldilocks Amphitheater',
    title: 'Goldilocks Amphitheater',
    image: '/interfaces/assets/exhibit/exhibit-amphitheater-key.jpg',
    imageAlt: 'Nested gold amphitheater shells with guests under stars',
    preview:
      'The middle dome — where guests feel just right. Hospitality without clutter, resonance without overwhelm, Bach and phone doodles in the same house.',
    body:
      'If the Core is who you call you, the Amphitheater is who you sit with. Guests, crew, collectors, friends from the night job — the mix is supposed to feel Goldilocks: not too loud, not too thin. Immersion without clutter means the nested architecture carries the weight; you should not need a protocol map to feel welcomed. Walk-in show, museum night, private salon: the seating is voluntary. Belonging is hospitality first.',
    still: '/interfaces/assets/exhibit/exhibit-fiction-still.jpg',
    stillCap: 'Still · nested camp at night',
  },
  {
    id: 'horizon',
    href: '/horizon',
    label: 'Omni-Horizon',
    title: 'Omni-Horizon',
    image: '/interfaces/assets/exhibit/exhibit-horizon-key.jpg',
    imageAlt: 'Three stacked horizons from body to holographic lattice sky',
    preview:
      'The outer dome — three surfaces at once: self and body, the room you are in, and the Syntheverse sandbox on Base Mainnet as studio custody.',
    body:
      'Horizon is the ceiling of the installation, and it refuses to collapse into one sky. Surface one is self and body — the Player you brought. Surface two is the immediate world: street, club, gallery, phone, the stories already running inside that nest. Surface three is the outer Infinite Octaves Omni-Lattice Syntheverse sandbox on Base — studio and paints in the cloud, chain of custody, not prophecy. Keep the three distinct. That discipline is the whole lesson of the room.',
    still: '/interfaces/assets/nesting/nest-syntheverse.png',
    stillCap: 'Still · studio nest in the sandbox',
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
      <p class="sub">This art project is built as a living triadic stage — Convergence Core, Goldilocks Amphitheater, and Omni-Horizon — the same nesting grammar that holds the ship's theaters and agent sandboxes. These are not cabins on the voyage map. They are the domes you stand inside when you step into the work.</p>
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
        <strong>Touch a dome above</strong> for the full room — curated key art, chapters, and honesty rails. The interactive stage below is a preview only.
      </p>
    </section>`;
}
