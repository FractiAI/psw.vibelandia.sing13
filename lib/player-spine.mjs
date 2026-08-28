/**
 * Holographic Player spine — SS Vibelandia guest navigation (2026).
 * Five cruise action doors: Journey · Canvas · Jukebox · Library · Creator Studio
 * Voice: old-school invitation. Full sentences. No em dashes.
 */
import {
  PLAYER_NPC_LINE,
  PLAYER_SPINE_LINE,
  VOYAGE_DOOR_SPINE,
} from './npc-player-doctrine.mjs';
import {
  renderVisitGoldenPathHeroCtasHtml,
  renderVisitGoldenPathHtml,
} from './visit-golden-path.mjs';

export { PLAYER_NPC_LINE, PLAYER_SPINE_LINE };

/**
 * Primary action doors on the home board (SS Vibelandia is already underfoot).
 * Order: Journey → Canvas → feel → read → create.
 */
export const PLAYER_PRIMARY_DOORS = [
  {
    id: 'journey',
    label: 'Journey',
    href: '/journey',
    note: 'Curated adventures we offer: landfalls, sails, music labs, and exhibit walks, grounded in the Official Prospectus. Open the Voyage Map when you are ready to claim a cabin.',
    cta: 'Browse adventures',
    chip: 'Story',
  },
  {
    id: 'canvas',
    label: 'Canvas',
    href: '/',
    note: 'Step into the Omniversal Canvas, Valet Pru\'s holographic art basecamp and the site front door for collectors, museums, wonder, or a deeper walk in.',
    cta: 'Open the Canvas',
    chip: 'Art',
  },
  {
    id: 'jukebox',
    label: 'Jukebox',
    href: '/jukebox',
    note: 'Listen free aboard the vessel. Let the music carry the feeling before you argue with it.',
    cta: 'Play the Jukebox',
    chip: 'Feel',
    jukebox: true,
  },
  {
    id: 'library',
    label: 'Library',
    href: '/library',
    note: 'Read Deep Memory in plain speak. Ship-blog notes for guests. Whitepapers when you want the full map.',
    cta: 'Visit the Library',
    chip: 'Read',
  },
  {
    id: 'creator',
    label: 'Creator Studio',
    href: '/creator-studio',
    note: 'Build on Deck 2 Core with your Goldilocks valet. Attach charts and notes. Your key stays with you.',
    cta: 'Enter Creator Studio',
    chip: 'Build',
  },
];

/** Secondary — behind “More aboard” for NPC paths and depth */
export const PLAYER_MORE_DOORS = [
  {
    label: 'Ark profile · SS Vibelandia',
    href: '/ss-vibelandia',
    note: 'Why this ship exists: Noah\'s Ark of the Intelligence Age, in plain language.',
  },
  {
    label: 'Frontiersman brochure',
    href: '/frontiersman-voyage',
    note: 'The full cultural constitution. One tribe, many homes, written for humans.',
  },
  {
    label: 'Players Guide',
    href: '/goldilocks-players-guide',
    note: 'A free playbook for when brute force stops working and care returns.',
  },
  {
    label: 'Concierge · Downtown Reno',
    href: '/hire-a-goldilocks-valet-concierge',
    note: 'A human hand on the ground. Reset, hospitality, tutor.',
  },
  {
    label: 'Whitepapers',
    href: '/papers',
    note: 'Quiet stacks. Catalog maps with honesty rails for those who want proof.',
  },
  {
    label: 'Ship blog',
    href: '/ship-blog/',
    note: 'Plain-language notes from the voyage, newest first.',
  },
  {
    label: 'Coexist with AI',
    href: '/coexist',
    note: 'The grand story, four awareness posts, and a voluntary self-test.',
  },
  {
    label: 'Meet the crew',
    href: '/meet-the-crew',
    note: 'Spirit crew roster. Honest lenses for the tale.',
  },
  {
    label: 'Join the crew',
    href: '/join-the-crew',
    note: 'Puerto Reno stations. A human still answers email.',
  },
  {
    label: 'Reno interpretation',
    href: '/reno',
    note: 'Mirror lattice and TBME story in guest English.',
  },
  {
    label: '99 Octave chart',
    href: '/octave99-chart#intake',
    note: 'Chart yourself in the grand Story. Optional depth for those who want it.',
  },
];

export function renderPlayerHeroCtasHtml() {
  return renderVisitGoldenPathHeroCtasHtml('reception');
}

export function renderVisitGoldenPathReceptionHtml() {
  return renderVisitGoldenPathHtml('reception', { anchorReception: '#ship-blog' });
}

export function renderPlayerChannelsHtml() {
  const items = PLAYER_PRIMARY_DOORS.map(
    (d) =>
      `<li>
        <a href="${d.href}"${d.jukebox ? ' data-qv-jukebox' : ''}>
          <span class="bulletin-num">${d.chip}</span>
          <span>
            <span class="bulletin-title">${d.label}</span>
            <span class="bulletin-note">${d.note}</span>
          </span>
          <span class="bulletin-go">${d.cta}</span>
        </a>
      </li>`,
  ).join('\n      ');
  return `<h3 class="bulletin-channels-h" id="ship-channels-h">Your cruise line · five doors</h3>
    <p class="player-spine-line">${PLAYER_SPINE_LINE}</p>
    <ul class="bulletin-board bulletin-board--player" role="list" aria-labelledby="ship-channels-h">
      ${items}
    </ul>`;
}

export function renderPlayerMoreAboardHtml() {
  const items = PLAYER_MORE_DOORS.map(
    (d) =>
      `<li><a href="${d.href}"><strong>${d.label}</strong><span>${d.note}</span></a></li>`,
  ).join('\n        ');
  return `<details class="player-more-aboard">
      <summary>More aboard, optional depth</summary>
      <ul class="player-more-list">${items}</ul>
    </details>`;
}

export function renderCompactGuestKeyHtml() {
  return `<section class="voyage-guest-key voyage-guest-key--compact" aria-label="How to come aboard">
    <p class="voyage-guest-key__lead">${VOYAGE_DOOR_SPINE}</p>
    <ol class="voyage-arrival">
      <li><a href="/voyage/inquire">Inquire</a></li>
      <li><a href="/voyage/select">Select</a></li>
      <li><a href="/voyage/prepare">Prepare</a></li>
      <li><a href="/voyage/arrive">Arrive</a></li>
      <li><a href="/voyage/live-the-vibe">Live the vibe</a></li>
    </ol>
    <p class="voyage-guest-key__more"><a href="/journey">Journey · curated adventures</a> · <a href="/voyage/decks">Voyage Map · decks &amp; cabins</a></p>
  </section>`;
}
