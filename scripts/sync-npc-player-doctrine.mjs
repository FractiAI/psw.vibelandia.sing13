#!/usr/bin/env node
/**
 * Inject canonical NPC & Player doctrine into brochure §3 and Coexist page.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  renderNpcPlayerBrochureS3Html,
  renderNpcPlayerCoexistHtml,
} from '../lib/npc-player-doctrine.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function patchMarkedBlock(html, start, end, block) {
  if (html.includes(start) && html.includes(end)) {
    const re = new RegExp(
      `${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    );
    return html.replace(re, `${start}\n    ${block}\n    ${end}`);
  }
  return null;
}

const brochurePath = path.join(ROOT, 'interfaces', 'frontiersman-voyage-brochure.html');
let brochure = fs.readFileSync(brochurePath, 'utf8');
const s3Block = renderNpcPlayerBrochureS3Html();
const s3Start = '<!-- NPC_PLAYER_S3_START -->';
const s3End = '<!-- NPC_PLAYER_S3_END -->';

let next = patchMarkedBlock(brochure, s3Start, s3End, s3Block);
if (next) {
  brochure = next;
} else {
  brochure = brochure.replace(
    /<h2 id="s3">3\. NPCs &amp; Players<\/h2>\s*<p><strong>NPC<\/strong>[\s\S]*?<p><strong>Player<\/strong>[\s\S]*?<\/p>/,
    `<h2 id="s3">3. NPCs &amp; Players</h2>\n    ${s3Start}\n    ${s3Block}\n    ${s3End}`,
  );
}
fs.writeFileSync(brochurePath, brochure);

const coexistPath = path.join(ROOT, 'interfaces', 'coexist-ai-asi.html');
let coexist = fs.readFileSync(coexistPath, 'utf8');
const doctrineBlock = renderNpcPlayerCoexistHtml();
const docStart = '<!-- NPC_PLAYER_DOCTRINE_START -->';
const docEnd = '<!-- NPC_PLAYER_DOCTRINE_END -->';

next = patchMarkedBlock(coexist, docStart, docEnd, doctrineBlock);
if (next) {
  coexist = next;
} else if (!coexist.includes('NPCs &amp; Players on this vessel')) {
  coexist = coexist.replace(
    /(<p class="honesty"><strong>Honesty first:<\/strong> this page is hospitality[\s\S]*?<\/p>\s*\n\n)(    <h2>Where we are in the grand story<\/h2>)/,
    `$1    <h2>NPCs &amp; Players on this vessel</h2>\n    ${docStart}\n    ${doctrineBlock}\n    ${docEnd}\n\n$2`,
  );
} else {
  coexist = coexist.replace(
    /<h2>NPCs &amp; Players on this vessel<\/h2>\s*[\s\S]*?(?=\n\n    <h2>Where we are in the grand story<\/h2>)/,
    `<h2>NPCs &amp; Players on this vessel</h2>\n    ${docStart}\n    ${doctrineBlock}\n    ${docEnd}`,
  );
}
fs.writeFileSync(coexistPath, coexist);

console.log(
  JSON.stringify(
    {
      ok: true,
      patched: ['interfaces/frontiersman-voyage-brochure.html', 'interfaces/coexist-ai-asi.html'],
    },
    null,
    2,
  ),
);
