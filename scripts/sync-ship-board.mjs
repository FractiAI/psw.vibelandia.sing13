#!/usr/bin/env node
/**
 * Inject SS Vibelandia ship board narrative into QUESTFEST home.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderShipBoardHtml } from '../lib/ship-board.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = path.join(ROOT, 'interfaces', 'vibelandia-questfest.html');
const MARKERS = ['<!-- EXPERIENCE_SHIP_BOARD_BEGIN -->', '<!-- EXPERIENCE_SHIP_BOARD_END -->'];

function patchBlock(html, block) {
  const [start, end] = MARKERS;
  if (html.includes(start) && html.includes(end)) {
    const re = new RegExp(
      `${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    );
    return html.replace(re, `${start}\n    ${block}\n    ${end}`);
  }
  return html.replace(
    /<!-- PLAYER_GUEST_KEY_END -->\s*\n/,
    `<!-- PLAYER_GUEST_KEY_END -->\n\n  ${start}\n    ${block}\n    ${end}\n\n`,
  );
}

let html = fs.readFileSync(TARGET, 'utf8');

html = html.replace(/<!-- EXPERIENCE_RECEPTION_LOBBY_BEGIN -->[\s\S]*?<!-- EXPERIENCE_RECEPTION_LOBBY_END -->\s*\n?/g, '');

html = html.replace(
  /<div class="qv-top-quicklinks__sound" id="reception-sound-bar">[\s\S]*?<\/div>\s*\n\s*<\/nav>/,
  `</nav>`,
);

html = html.replace(/\s*<script src="\/interfaces\/reception-autoplay\.js" defer><\/script>\s*/g, '\n');
html = html.replace(/\s*<script src="\/interfaces\/" defer><\/script>\s*/g, '\n');
html = html.replace(/id="reception-hero-score"[\s\S]*?id="reception-hero-audio"[\s\S]*?<\/audio>\s*/g, '');
html = html.replace(/href="\/questfest#reception-lobby"/g, 'href="/front-desk"');
html = html.replace(/Registration · check-in/g, 'Front Desk · check-in');
html = html.replace(/visit-golden-path--reception/g, 'visit-golden-path--ship');
html = html.replace(/Reception · today’s board/g, 'SS Vibelandia · ship board');

html = patchBlock(html, renderShipBoardHtml());

fs.writeFileSync(TARGET, html);
console.log(JSON.stringify({ ok: true, file: 'interfaces/vibelandia-questfest.html' }, null, 2));
