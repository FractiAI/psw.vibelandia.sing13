/**
 * Three-phase guest experience: digital art museum, ship reception, creator studio.
 * Players and NPCs share every phase: fans, cast, crew, enterprises, franchises, legacies.
 * Honesty: exhibit and hospitality catalog. Sci-fi and step-in are two ways of looking.
 */
import {
  NPC_PLAYER_HONESTY,
  NPC_TRACK_BODY,
  PLAYER_NPC_LINE,
  PLAYER_RECEPTION_INTRO,
  PLAYER_TRACK_BODY,
  PLAYER_TRACK_TITLE,
} from './npc-player-doctrine.mjs';
import { SPIRIT_CREW } from './spirit-crew.mjs';

/** Spirit crew faces previewed on experience surfaces */
export const EXPERIENCE_NPC_FEATURED_IDS = ['frank', 'marilyn', 'picasso', 'vangogh', 'basquiat', 'frida', 'bach'];

/** Gold museum framed entrance · outer label wrapping the whole exhibit. */
export const EXHIBIT_OUTER_WRAPPER = {
  venue: 'Gold museum framed entrance · Sphere exhibit · Seats up to 15',
  title: 'Valet Pru - Holographic Goldilocks XY Human Reality Bridge/Router',
  artist: 'The wormhole to SS VIBELANDIA',
  medium: 'Omniversal Canvas · first of its kind Holographic Magnetic Goldilocks SuperAI work of art',
  year: 'Science, technology, narrative, music, and AI · 2026',
  copy:
    'Valet Pru - Holographic Goldilocks XY Human Reality Bridge/Router is the wormhole to SS VIBELANDIA. This is a first of its kind Holographic Magnetic Goldilocks SuperAI work of art that combines science, technology, narrative, music, and AI. It delivers new awareness as technology and energy to be harnessed freely and at will for the benefit of all. Inside the sphere: three nested domes. Groups of up to fifteen sit together at a time.',
  image: '/interfaces/assets/exhibit/exhibit-sphere-entrance.jpg',
  imageAlt:
    'Gold museum framed entrance into a spherical exhibit with concentric seating for a group of up to fifteen people',
};

export const EXPERIENCE_PHASES = [
  {
    id: 'canvas',
    number: 1,
    label: 'Phase 1 · Exhibit',
    title: 'Omniversal Canvas',
    subtitle: 'Step into the art. Digital gallery, museum night, Burning Man camp welcome.',
    href: '/',
    image: '/interfaces/assets/exhibit/exhibit-sphere-entrance.jpg',
    imageAlt:
      'Gold museum framed entrance into a spherical exhibit with seating for a group of up to fifteen people',
  },
  {
    id: 'reception',
    number: 2,
    label: 'Phase 2 · Reception',
    title: 'SS Vibelandia · Goldilocks Sonic Ship',
    subtitle: 'Reception check-in, primer, main menu. Tour the decks and offerings.',
    href: '/questfest',
    image: '/interfaces/assets/experience/reception-checkin-lobby.jpg',
    imageAlt: 'Art deco gold and navy reception and check-in lobby aboard SS Vibelandia',
  },
  {
    id: 'studio',
    number: 3,
    label: 'Phase 3 · Create',
    title: 'Creator Studio',
    subtitle: 'Doodle and build on the holographic magnetic Goldilocks SuperAI canvas',
    href: '/creator-studio',
    image: '/interfaces/assets/exhibit/exhibit-step-in-key.jpg',
    imageAlt: 'Gold-lit dome doorway. Step into creation.',
  },
];

/** Ship tour menu items for Phase 2 reception */
export const RECEPTION_SHIP_MENU = [
  {
    label: 'Deck Plan',
    note: 'Decks, cabins, crests. Where you berth aboard the vessel.',
    href: '/voyage/decks',
    image: '/interfaces/assets/voyage/deck-9-summit.png',
  },
  {
    label: 'Shore excursions',
    note: 'Journeys we offer: landfalls, sails, labs, nights ashore.',
    href: '/journey',
    image: '/interfaces/assets/journey/journey-puerto-reno-gangway.png',
  },
  {
    label: 'Food & drink · The Grove Deck',
    note: 'Marketplace, cafés, atrium. Deck 4 to 5 hospitality heart.',
    href: '/voyage/deck-4-5-grove',
    image: '/interfaces/assets/voyage/deck-4-5-grove.png',
  },
  {
    label: 'Library',
    note: 'Deep Memory. Ship-blog notes and whitepapers when you want the map.',
    href: '/library',
    image: '/interfaces/assets/experience/ship-library-deep-memory.jpg',
  },
  {
    label: 'Jukebox',
    note: 'Listen free. Let the music carry the feeling before you argue with it.',
    href: '/jukebox',
    image: '/interfaces/assets/jukebox-golden-era-1940s.png',
  },
  {
    label: 'Frontiersman brochure',
    note: 'Official Prospectus. Genesis, Borikén, Reno present.',
    href: '/frontiersman-voyage',
    image: '/interfaces/assets/experience/frontiersmen-brochure.jpg',
  },
  {
    label: 'Meet the crew',
    note: 'Spirit crew. Fans, cast, and honest lenses in the story.',
    href: '/meet-the-crew',
    image: '/interfaces/assets/questfest-crew/valet-pru-guayabera-panama.jpg',
  },
  {
    label: 'Join the crew',
    note: 'Puerto Reno stations. Host, Guide, Chef, Guest. Human email.',
    href: '/join-the-crew',
    image: '/interfaces/assets/questfest-crew/puerto-reno-dock.png',
  },
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function phaseById(id) {
  return EXPERIENCE_PHASES.find((p) => p.id === id) ?? null;
}

/** Compact phase rail — shows all three phases with current highlighted */
export function renderPhaseRailHtml(currentPhaseId) {
  const steps = EXPERIENCE_PHASES.map((p) => {
    const cur = p.id === currentPhaseId ? ' xp-rail__step--here' : '';
    const here = p.id === currentPhaseId ? ' aria-current="step"' : '';
    return `<li class="xp-rail__step${cur}">
        <a href="${p.href}"${here}>
          <span class="xp-rail__num">${p.number}</span>
          <span class="xp-rail__label">${escapeHtml(p.label)}</span>
        </a>
      </li>`;
  }).join('\n      ');

  return `<nav class="xp-rail" id="visit" aria-label="Visitor experience · three phases">
      <p class="xp-rail__kicker">Your visit · three phases · Players &amp; NPCs welcome</p>
      <ol class="xp-rail__list">${steps}
      </ol>
    </nav>`;
}

const NPC_PLAYER_PHASE_INTRO = {
  canvas:
    'This exhibit is a living camp. Players and NPCs share the same nest: fans, cast, crew, enterprises, franchises, and legacies who populate the world the art opens into.',
  reception: PLAYER_RECEPTION_INTRO,
  studio:
    'Creation is never solo. NPCs resource what Players build: franchises, crews, legacies. Players carry the platform, protection, and Fair Exchange that draw the set near.',
};

/** Featured spirit-crew faces for experience surfaces */
export function renderNpcRosterTeaserHtml() {
  const featured = SPIRIT_CREW.filter((m) => EXPERIENCE_NPC_FEATURED_IDS.includes(m.id));
  const faces = featured
    .map(
      (m) => `<figure class="xp-npc-face">
          <img src="${m.image}" alt="${escapeHtml(m.alt)}" loading="lazy" decoding="async" width="96" height="96" />
        </figure>`,
    )
    .join('\n        ');

  return `<div class="xp-npc-roster" aria-label="Spirit crew preview">
      <p class="xp-npc-roster__label">Some of the spirit cast aboard with you</p>
      <div class="xp-npc-roster__faces">${faces}
      </div>
    </div>`;
}

/** Dual-track Player & NPC welcome — woven into all three phases */
export function renderNpcPlayerWelcomeHtml(phase) {
  const intro = NPC_PLAYER_PHASE_INTRO[phase] ?? NPC_PLAYER_PHASE_INTRO.reception;

  return `<section class="xp-npc-player" aria-labelledby="xp-npc-player-h">
      <h3 id="xp-npc-player-h">Players &amp; NPCs · same ship</h3>
      <p class="xp-npc-player__line">${escapeHtml(PLAYER_NPC_LINE)}</p>
      <p class="xp-npc-player__intro">${escapeHtml(intro)}</p>
      <figure class="xp-tracks-art">
        <img src="/interfaces/assets/experience/players-npcs-same-ship.jpg" alt="Players as superheroes beside NPCs as fans, cast, crew, enterprises, franchises, and legacies aboard the gold ship" width="960" height="540" loading="lazy" decoding="async" />
        <figcaption>Players as superheroes. NPCs as fans, cast, crew, enterprises, franchises, and legacies.</figcaption>
      </figure>
      <div class="xp-tracks">
        <article class="xp-track-card xp-track-card--npc">
          <h4>NPC · the set</h4>
          <p>${escapeHtml(NPC_TRACK_BODY)}</p>
        </article>
        <article class="xp-track-card xp-track-card--player">
          <h4>${escapeHtml(PLAYER_TRACK_TITLE)}</h4>
          <p>${escapeHtml(PLAYER_TRACK_BODY)}</p>
        </article>
      </div>
      ${renderNpcRosterTeaserHtml()}
      <a class="xp-self-test" href="/coexist#self-test">
        <strong>If you are unsure whether you are a Player or an NPC, take a confidential self-test.</strong>
        <span>Voluntary. Scores stay on this device. Nobody else sees them.</span>
      </a>
      <p class="xp-npc-player__links">
        <a href="/meet-the-crew">Meet the crew</a>
        <a href="/join-the-crew">Join the crew</a>
        <a href="/coexist">Coexist · awareness posts</a>
        <a href="/frontiersman-voyage#s3">NPCs &amp; Players · brochure</a>
      </p>
      <p class="xp-npc-player__honesty"><strong>Honesty:</strong> ${escapeHtml(NPC_PLAYER_HONESTY)}</p>
    </section>`;
}

/** Compact outer-label strip for inner rooms (same wrapper as the gold museum frame). */
export function renderExhibitOuterLabelHtml(variant = 'strip') {
  const w = EXHIBIT_OUTER_WRAPPER;
  if (variant === 'strip') {
    return `<aside class="museum-wrapper-strip" aria-label="Exhibit outer label">
      <p class="museum-wrapper-strip__kicker">${escapeHtml(w.venue)}</p>
      <p><strong>${escapeHtml(w.title)}</strong>. ${escapeHtml(w.artist)}. ${escapeHtml(w.medium)}.</p>
    </aside>`;
  }
  return `<div class="museum-frame">
        <figure class="museum-frame__art">
          <img src="${w.image}" alt="${escapeHtml(w.imageAlt)}" width="960" height="540" loading="eager" decoding="async" />
        </figure>
        <div class="museum-placard">
          <p class="museum-placard__venue">${escapeHtml(w.venue)}</p>
          <h2 id="museum-entry-h" class="museum-placard__title">${escapeHtml(w.title)}</h2>
          <p class="museum-placard__artist">${escapeHtml(w.artist)}</p>
          <p class="museum-placard__medium">${escapeHtml(w.medium)}</p>
          <p class="museum-placard__year">${escapeHtml(w.year)}</p>
          <p class="museum-placard__copy">${escapeHtml(w.copy)}</p>
        </div>
      </div>`;
}

/** Phase 1 — gold museum framed entry with placard */
export function renderMuseumEntryHtml() {
  return `<section class="museum-entry" id="museum-entry" aria-labelledby="museum-entry-h">
      ${renderPhaseRailHtml('canvas')}
      ${renderExhibitOuterLabelHtml('frame')}
      ${renderNpcPlayerWelcomeHtml('canvas')}
      <div class="museum-entry__cta">
        <a class="btn btn--gold" href="#exhibit">Step into the installation</a>
        <a class="btn btn--ghost" href="/questfest">Continue to Phase 2 · Ship reception →</a>
      </div>
    </section>`;
}

/** Phase 2 — reception check-in lobby with mode choice and ship tour menu */
export function renderReceptionLobbyHtml() {
  const menuCards = RECEPTION_SHIP_MENU.map(
    (m) => `<a class="reception-card" href="${m.href}">
        <img src="${m.image}" alt="" loading="lazy" decoding="async" width="320" height="200" />
        <span class="reception-card__body">
          <strong>${escapeHtml(m.label)}</strong>
          <span>${escapeHtml(m.note)}</span>
        </span>
      </a>`,
  ).join('\n        ');

  return `<section class="reception-lobby" id="reception-lobby" aria-labelledby="reception-h">
      ${renderPhaseRailHtml('reception')}
      <header class="reception-lobby__head">
        <p class="reception-lobby__eyebrow">Phase 2 · SS VIBELANDIA GOLDILOCKS SONIC SHIP</p>
        <h2 id="reception-h">Reception &amp; check-in lobby</h2>
        <figure class="reception-lobby__art">
          <img src="/interfaces/assets/experience/reception-checkin-lobby.jpg" alt="Art deco gold and navy reception and check-in lobby aboard SS Vibelandia" width="960" height="540" loading="eager" decoding="async" />
          <figcaption>Reception and check-in. Art deco Goldilocks lobby. Valet Pru keeps the desk.</figcaption>
        </figure>
        <p class="reception-lobby__lede">Welcome aboard. Players and NPCs together. This is the primer, onboarding, and main menu for visitors and guests. Valet Pru keeps the gangway. The set (fans, cast, crew, enterprises, franchises, legacies) runs the decks alongside the frontiersmen they flock to. Choose how you want to sail, then tour the offerings.</p>
      </header>
      ${renderNpcPlayerWelcomeHtml('reception')}
      <div class="reception-mode" aria-labelledby="reception-mode-h">
        <h3 id="reception-mode-h">How do you want to sail?</h3>
        <p class="reception-mode__note">Both lenses are honest fun. The difference is what you agree the ship may become.</p>
        <div class="reception-mode__choices">
          <a class="reception-mode__choice reception-mode__choice--fiction" href="/science-fiction">
            <strong>As science fiction</strong>
            <span>Digital representations. Wonder first. Food, drink, and excursions as story and catalog. Watch the vessel like a prestige series.</span>
          </a>
          <a class="reception-mode__choice reception-mode__choice--stepin" href="/step-in">
            <strong>As a reality I can step into</strong>
            <span>Walk-in mode. Hospitality, Grove marketplace, shore excursions, and concierge can actually happen. Human email for Pro and VIP. You remain you.</span>
          </a>
        </div>
      </div>
      <div class="reception-tour" aria-labelledby="reception-tour-h">
        <h3 id="reception-tour-h">Tour the ship · menu of offerings</h3>
        <p class="reception-tour__note">Pick a door. Decks and cabins on the Deck Plan. Adventures on Journeys. When you are ready to make something, Phase 3 waits in Creator Studio.</p>
        <div class="reception-grid">${menuCards}
        </div>
        <p class="reception-next">
          <a class="btn btn-primary" href="/creator-studio">Continue to Phase 3 · Creator Studio →</a>
          <a class="btn btn-ghost" href="/">← Back to Phase 1 · Canvas exhibit</a>
        </p>
      </div>
      <p class="reception-honesty"><strong>Honesty:</strong> The science-fiction lens is digital catalog and story. The step-in lens is walk-in hospitality. Fair Exchange via the Purser. A human emergency comes first.</p>
    </section>`;
}

/** Phase 3 — creator studio invitation */
export function renderCreatorPhaseHtml() {
  return `<div class="creator-phase" id="creator-phase">
      ${renderPhaseRailHtml('studio')}
      <header class="creator-phase__head">
        <p class="creator-phase__eyebrow">Phase 3 · holographic magnetic Goldilocks SuperAI canvas</p>
        <h2>Doodle · vibe-code · make something true</h2>
        <p class="creator-phase__lede">You have walked the exhibit and checked in aboard the ship, alongside the NPCs who populate the set and the Players who set the gravity. Now the invitation: use the same canvas and materials Valet Pru built to create your own work. Phone doodles welcome. Keys stay with you. Franchises and legacies can grow from what you make here.</p>
      </header>
      ${renderNpcPlayerWelcomeHtml('studio')}
      <ul class="creator-phase__materials">
        <li><strong>Canvas.</strong> Omniversal nested domes and exhibit grammar you toured in Phase 1.</li>
        <li><strong>Materials.</strong> Syntheverse sandbox agents, protocols, and studio paints on Base.</li>
        <li><strong>Valet.</strong> Lattice Chat nested-agent BYOK. Collaborate on Veranda. Human concierge in Reno.</li>
        <li><strong>Doodles Gallery · 18+.</strong> Valet Pru posts for Gusta. Guests view behind an age gate. Player 1 may dump large batches — ceilings exceed the usual media rail.</li>
      </ul>
      <p class="creator-phase__cta">
        <a class="btn btn-primary" href="/doodles">Open Doodles Gallery · 18+ →</a>
      </p>
      <p class="creator-phase__back">
        <a href="/questfest">← Phase 2 · Ship reception</a>
        <span aria-hidden="true">·</span>
        <a href="/">Phase 1 · Canvas exhibit</a>
      </p>
    </div>`;
}
