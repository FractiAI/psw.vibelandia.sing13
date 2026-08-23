#!/usr/bin/env node
/**
 * Generate /voyage/* door pages and inject clickable guest-key strip into voyage surfaces.
 * Markers: <!-- VOYAGE_GUEST_KEY_START --> … <!-- VOYAGE_GUEST_KEY_END -->
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VOYAGE_DOORS,
  renderVoyageDoorPageHtml,
  renderVoyageGuestKeyHtml,
  voyageDoorHref,
} from '../lib/voyage-doors.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'interfaces', 'voyage');
const START = '<!-- VOYAGE_GUEST_KEY_START -->';
const END = '<!-- VOYAGE_GUEST_KEY_END -->';

const PATCH_TARGETS = [
  'interfaces/frontiersman-voyage-brochure.html',
  'interfaces/blog-frontiersman-voyage-2026-08.html',
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const door of VOYAGE_DOORS) {
  const file = path.join(OUT_DIR, `${door.slug}.html`);
  fs.writeFileSync(file, renderVoyageDoorPageHtml(door));
}

const guestKeyBlock = `${START}\n  ${renderVoyageGuestKeyHtml()}\n  ${END}`;

for (const rel of PATCH_TARGETS) {
  const target = path.join(ROOT, rel);
  let html = fs.readFileSync(target, 'utf8');

  if (html.includes(START) && html.includes(END)) {
    const re = new RegExp(
      `${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    );
    html = html.replace(re, guestKeyBlock);
  } else {
    const sectionRe =
      /<section class="voyage-guest-key"[\s\S]*?<\/section>/;
    const stripRe =
      /<ol class="voyage-arrival"[\s\S]*?<div class="voyage-icons">[\s\S]*?<\/div>\s*(?=<p class="honesty"|<h2)/;
    if (sectionRe.test(html)) {
      html = html.replace(sectionRe, guestKeyBlock.trim());
    } else if (stripRe.test(html)) {
      html = html.replace(stripRe, `${guestKeyBlock}\n\n    `);
    } else {
      console.error(`No voyage guest-key markers in ${rel}`);
      process.exitCode = 1;
      continue;
    }
  }

  fs.writeFileSync(target, html);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      doors: VOYAGE_DOORS.map((d) => ({ slug: d.slug, href: voyageDoorHref(d.slug) })),
      patched: PATCH_TARGETS,
      outDir: 'interfaces/voyage/',
    },
    null,
    2,
  ),
);
