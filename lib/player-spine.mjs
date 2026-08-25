/**
 * Holographic Player spine — SS Vibelandia guest navigation (2026).
 * Five cruise action doors: Journey · Canvas · Jukebox · Library · Creator Studio
 * (SS Vibelandia is the vessel underfoot).
 */
import {
  PLAYER_NPC_LINE,
  PLAYER_SPINE_LINE,
  VOYAGE_DOOR_SPINE,
} from './npc-player-doctrine.mjs';

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
    note: 'Official Prospectus arc first — Genesis · Convergence · Reno now — then arrival, crests, experiences, decks.',
    cta: 'Voyage →',
    chip: 'Story',
  },
  {
    id: 'canvas',
    label: 'Canvas',
    href: '/omniverse-canvas',
    note: 'Valet Pru’s Omniversal Canvas — holographic exhibit for collectors, museums, and anyone who wants sci-fi wonder or a deeper step-in.',
    cta: 'Exhibit →',
    chip: 'Art',
  },
  {
    id: 'jukebox',
    label: 'Jukebox',
    href: '/jukebox',
    note: 'Free music on the vessel — feel the frequency before you argue with it.',
    cta: 'Play →',
    chip: 'Feel',
    jukebox: true,
  },
  {
    id: 'library',
    label: 'Library',
    href: '/library',
    note: 'Deep Memory — ship-blog notes in plain speak, whitepapers when you want the full map.',
    cta: 'Read →',
    chip: 'Read',
  },
  {
    id: 'creator',
    label: 'Creator Studio',
    href: '/creator-studio',
    note: 'Deck 2 Core — build with your Goldilocks valet. Attach charts. Your key stays with you.',
    cta: 'Create →',
    chip: 'Build',
  },
];

/** Secondary — behind “More aboard” for NPC paths and depth */
export const PLAYER_MORE_DOORS = [
  {
    label: 'Ark profile · SS Vibelandia',
    href: '/ss-vibelandia',
    note: 'Noah’s Ark of the Intelligence Age — why this ship exists.',
  },
  {
    label: 'Frontiersman brochure',
    href: '/frontiersman-voyage',
    note: 'Full cultural constitution — one tribe · many homes.',
  },
  {
    label: 'Players Guide',
    href: '/goldilocks-players-guide',
    note: 'Free playbook — when brute force stops working.',
  },
  {
    label: 'Concierge · Downtown Reno',
    href: '/hire-a-goldilocks-valet-concierge',
    note: 'Human hand on the ground — Reset, hospitality, tutor.',
  },
  {
    label: 'Whitepapers',
    href: '/papers',
    note: 'Quiet stacks — catalog maps with honesty rails.',
  },
  {
    label: 'Ship blog',
    href: '/ship-blog/',
    note: 'Plain-language notes — newest first.',
  },
  {
    label: 'Coexist with AI',
    href: '/coexist',
    note: 'Grand story · four awareness posts · voluntary self-test.',
  },
  {
    label: 'Meet the crew',
    href: '/meet-the-crew',
    note: 'Spirit crew — honest lenses, not a payroll.',
  },
  {
    label: 'Join the crew',
    href: '/join-the-crew',
    note: 'Puerto Reno stations — a human still answers email.',
  },
  {
    label: 'Reno interpretation',
    href: '/reno',
    note: 'Mirror lattice · TBME story.',
  },
  {
    label: '99 Octave chart',
    href: '/octave99-chart#intake',
    note: 'Chart yourself in the grand Story — optional depth.',
  },
];

export function renderPlayerHeroCtasHtml() {
  const primary = PLAYER_PRIMARY_DOORS.map(
    (d, i) =>
      `<a class="btn btn-primary${i === 0 ? ' btn-player-lead' : ''}" href="${d.href}"${d.jukebox ? ' data-qv-jukebox' : ''}>${d.label}</a>`,
  ).join('\n        ');
  return primary;
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
      <summary>More aboard · optional depth</summary>
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
    <p class="voyage-guest-key__more"><a href="/journey">Journey · grand narrative →</a> · <a href="/voyage/decks">Decks · cabins · crests →</a></p>
  </section>`;
}
