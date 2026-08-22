/**
 * Holographic Player spine — SS Vibelandia guest navigation (2026).
 * Target: SuperAI frontiersman's best friend. NPCs inhabit; Player attention moves the Hull.
 */
import {
  PLAYER_NPC_LINE,
  PLAYER_SPINE_LINE,
} from './npc-player-doctrine.mjs';

export { PLAYER_NPC_LINE, PLAYER_SPINE_LINE };

/** Primary doors — always visible for holographic Players */
export const PLAYER_PRIMARY_DOORS = [
  {
    id: 'lattice',
    label: 'Lattice Chat',
    href: '/lattice-chat/',
    note: 'Deck 2 Core — build with your valet. Attach charts. BYOK stays on your edge.',
    cta: 'Open →',
    chip: 'Build',
  },
  {
    id: 'listen',
    label: 'Listen',
    href: '/listen',
    note: 'Free jukebox — feel the frequency before you think.',
    cta: 'Play →',
    chip: 'Feel',
    jukebox: true,
  },
  {
    id: 'voyage',
    label: 'Voyage map',
    href: '/voyage/decks',
    note: 'Decks, cabins, serial register — where you are on the ship.',
    cta: 'Map →',
    chip: 'Map',
  },
  {
    id: 'guide',
    label: 'Players Guide',
    href: '/goldilocks-players-guide',
    note: 'Free playbook — when brute force stops working.',
    cta: 'Read →',
    chip: 'Guide',
  },
];

/** Secondary — behind “More aboard” for NPC paths and depth */
export const PLAYER_MORE_DOORS = [
  {
    label: 'Concierge · Downtown Reno',
    href: '/hire-a-goldilocks-valet-concierge',
    note: 'Human hand on the ground — Reset, hospitality, tutor.',
  },
  {
    label: 'Whitepapers',
    href: '/papers',
    note: 'Engine filing cabinet — for when the map is not enough.',
  },
  {
    label: 'Frontiersman brochure',
    href: '/frontiersman-voyage',
    note: 'Full compendium §1–38 — cultural constitution.',
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
    label: 'Ark profile',
    href: '/ss-vibelandia',
    note: 'Noah\'s Ark of the Intelligence Age — full ship story.',
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
  return `<div class="cta-row cta-row--player">
        ${primary}
      </div>`;
}

export function renderPlayerChannelsHtml() {
  const items = PLAYER_PRIMARY_DOORS.map(
    (d, i) =>
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
  return `<h3 class="bulletin-channels-h" id="ship-channels-h">Your four doors</h3>
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
      <summary>More aboard · NPCs welcome · optional depth</summary>
      <ul class="player-more-list">${items}</ul>
    </details>`;
}

export function renderCompactGuestKeyHtml() {
  return `<section class="voyage-guest-key voyage-guest-key--compact" aria-label="How to come aboard">
    <p class="voyage-guest-key__lead">${PLAYER_NPC_LINE} The voyage begins wherever you are.</p>
    <ol class="voyage-arrival">
      <li><a href="/voyage/inquire">Inquire</a></li>
      <li><a href="/voyage/select">Select</a></li>
      <li><a href="/voyage/prepare">Prepare</a></li>
      <li><a href="/voyage/arrive">Arrive</a></li>
      <li><a href="/voyage/live-the-vibe">Live the vibe</a></li>
    </ol>
    <p class="voyage-guest-key__more"><a href="/voyage/decks">Decks · cabins · crests →</a></p>
  </section>`;
}
