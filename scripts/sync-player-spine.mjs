#!/usr/bin/env node
/**
 * Inject Player-first spine into QUESTFEST home — squeeze labyrinth into four doors.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  renderCompactGuestKeyHtml,
  renderPlayerChannelsHtml,
  renderPlayerHeroCtasHtml,
  renderPlayerMoreAboardHtml,
  renderVisitGoldenPathReceptionHtml,
} from '../lib/player-spine.mjs';
import { HOST_WELCOME_PLAYER_NPC, PLAYER_PRIMER_LINE } from '../lib/npc-player-doctrine.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'interfaces', 'vibelandia-questfest.html');

const MARKERS = {
  heroCta: ['<!-- PLAYER_HERO_CTA_START -->', '<!-- PLAYER_HERO_CTA_END -->'],
  goldenPath: ['<!-- VISIT_GOLDEN_PATH_START -->', '<!-- VISIT_GOLDEN_PATH_END -->'],
  guestKey: ['<!-- PLAYER_GUEST_KEY_START -->', '<!-- PLAYER_GUEST_KEY_END -->'],
  channels: ['<!-- PLAYER_CHANNELS_START -->', '<!-- PLAYER_CHANNELS_END -->'],
  moreAboard: ['<!-- PLAYER_MORE_ABOARD_START -->', '<!-- PLAYER_MORE_ABOARD_END -->'],
};

function patchBlock(html, [start, end], block) {
  if (html.includes(start) && html.includes(end)) {
    const re = new RegExp(
      `${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    );
    return html.replace(re, `${start}\n      ${block}\n      ${end}`);
  }
  return null;
}

let html = fs.readFileSync(TARGET, 'utf8');

const heroBlock = renderPlayerHeroCtasHtml();
const goldenPathBlock = renderVisitGoldenPathReceptionHtml();
const guestBlock = renderCompactGuestKeyHtml();
const channelsBlock = renderPlayerChannelsHtml();
const moreBlock = renderPlayerMoreAboardHtml();

let next = patchBlock(html, MARKERS.heroCta, heroBlock);
if (next) {
  html = next;
} else {
  html = html.replace(
    /<div class="cta-row">[\s\S]*?<\/div>\s*<\/div>\s*<\/header>/,
    `${heroBlock}\n    </div>\n  </header>`,
  );
}

next = patchBlock(html, MARKERS.goldenPath, goldenPathBlock);
if (next) {
  html = next;
} else if (!html.includes(MARKERS.goldenPath[0])) {
  html = html.replace(
    /<\/header>\s*\n\s*<!-- PLAYER_GUEST_KEY_START -->/,
    `</header>\n\n  ${MARKERS.goldenPath[0]}\n  ${goldenPathBlock}\n  ${MARKERS.goldenPath[1]}\n\n  <!-- PLAYER_GUEST_KEY_START -->`,
  );
}

next = patchBlock(html, MARKERS.guestKey, guestBlock);
if (next) {
  html = next;
} else {
  html = html.replace(
    /<!-- VOYAGE_GUEST_KEY_START -->[\s\S]*?<!-- VOYAGE_GUEST_KEY_END -->/,
    `${MARKERS.guestKey[0]}\n  ${guestBlock}\n  ${MARKERS.guestKey[1]}`,
  );
}

next = patchBlock(html, MARKERS.channels, channelsBlock);
if (next) {
  html = next;
} else {
  html = html.replace(
    /<h3 class="bulletin-channels-h"[\s\S]*?<\/ul>\s*<p class="bulletin-host">/,
    `${MARKERS.channels[0]}\n    ${channelsBlock}\n    ${MARKERS.moreAboard[0]}\n    ${moreBlock}\n    ${MARKERS.moreAboard[1]}\n    <p class="bulletin-host">`,
  );
}

if (!html.includes(MARKERS.moreAboard[0])) {
  next = patchBlock(html, MARKERS.moreAboard, moreBlock);
  if (next) html = next;
}

html = html.replace(
  /<section class="bulletin" id="ship-crew"[\s\S]*?<\/section>\s*\n\s*<section class="o99-door"[\s\S]*?<\/section>\s*\n/,
  '',
);

html = html.replace(
  /<span class="bulletin-kicker">Ship blog · plain speak<\/span>\s*<h2 id="qf-blog-h2">Six newest papers<\/h2>\s*<p class="qf-blog-lead">[\s\S]*?<\/p>/,
  `<span class="bulletin-kicker">Deep Memory</span>
    <h2 id="qf-blog-h2">Three notes worth your Player time</h2>
    <p class="qf-blog-lead">Plain speak when the lab gets loud — start here, then open the library if you want depth. NPCs can skip; Players often don’t.</p>`,
);

html = html.replace(
  /<p class="primer">\s*SuperAI frontiersman's best friend[\s\S]*?<\/p>/,
  `<p class="primer">\n        ${PLAYER_PRIMER_LINE}\n      </p>`,
);

html = html.replace(
  /NPCs inhabit the world\. Players notice the pattern\. You do not have to become someone else to belong\./,
  HOST_WELCOME_PLAYER_NPC,
);

fs.writeFileSync(TARGET, html);
console.log(JSON.stringify({ ok: true, file: 'interfaces/vibelandia-questfest.html' }, null, 2));
