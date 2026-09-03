#!/usr/bin/env node
/**
 * Generate /voyage/decks, /voyage/deck-*, /voyage/cabin-* pages
 * and inject clickable deck directory + deck strip into voyage surfaces.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VOYAGE_CABINS,
  VOYAGE_DECKS,
  renderVoyageCabinPageHtml,
  renderVoyageDeckDirectoryHtml,
  renderVoyageDeckPageHtml,
  renderVoyageDeckStripHtml,
  renderVoyageDirectoryIndexHtml,
  voyageCabinHref,
  voyageDeckHref,
  voyageDirectoryHref,
} from '../lib/voyage-directory.mjs';
import { renderSinCityPageHtml } from '../lib/sin-city-page.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'interfaces', 'voyage');

const DECK_DIR_START = '<!-- VOYAGE_DECK_DIR_START -->';
const DECK_DIR_END = '<!-- VOYAGE_DECK_DIR_END -->';
const DECK_STRIP_START = '<!-- VOYAGE_DECK_STRIP_START -->';
const DECK_STRIP_END = '<!-- VOYAGE_DECK_STRIP_END -->';

const PATCH_DECK_DIR = ['interfaces/frontiersman-voyage-brochure.html'];
const PATCH_DECK_STRIP = [
  'interfaces/blog-frontiersman-voyage-2026-08.html',
];

fs.mkdirSync(OUT_DIR, { recursive: true });

fs.writeFileSync(path.join(OUT_DIR, 'decks.html'), renderVoyageDirectoryIndexHtml());

for (const deck of VOYAGE_DECKS) {
  const html =
    deck.slug === 'deck-3-night' ? renderSinCityPageHtml() : renderVoyageDeckPageHtml(deck);
  fs.writeFileSync(path.join(OUT_DIR, `${deck.slug}.html`), html);
}

for (const cabin of VOYAGE_CABINS) {
  const file = path.join(OUT_DIR, `cabin-${cabin.slug}.html`);
  fs.writeFileSync(file, renderVoyageCabinPageHtml(cabin));
}

const deckDirBlock = `${DECK_DIR_START}\n    ${renderVoyageDeckDirectoryHtml()}\n    ${DECK_DIR_END}`;
const deckStripBlock = `${DECK_STRIP_START}\n    ${renderVoyageDeckStripHtml()}\n  ${DECK_STRIP_END}`;

for (const rel of PATCH_DECK_DIR) {
  const target = path.join(ROOT, rel);
  let html = fs.readFileSync(target, 'utf8');
  if (html.includes(DECK_DIR_START) && html.includes(DECK_DIR_END)) {
    const re = new RegExp(
      `${DECK_DIR_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${DECK_DIR_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    );
    html = html.replace(re, deckDirBlock);
  } else {
    const legacyRe =
      /<div class="deck-grid">[\s\S]*?<div class="voyage-cabin-dir" id="cabins">[\s\S]*?<\/div>/;
    if (!legacyRe.test(html)) {
      console.error(`No deck directory block in ${rel}`);
      process.exitCode = 1;
      continue;
    }
    html = html.replace(legacyRe, deckDirBlock.trim());
  }
  fs.writeFileSync(target, html);
}

for (const rel of PATCH_DECK_STRIP) {
  const target = path.join(ROOT, rel);
  let html = fs.readFileSync(target, 'utf8');
  if (html.includes(DECK_STRIP_START) && html.includes(DECK_STRIP_END)) {
    const re = new RegExp(
      `${DECK_STRIP_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${DECK_STRIP_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    );
    html = html.replace(re, deckStripBlock);
  } else {
    const navRe = /<nav class="voyage-deck-strip"[\s\S]*?<\/nav>/;
    if (!navRe.test(html)) {
      console.error(`No deck strip in ${rel}`);
      process.exitCode = 1;
      continue;
    }
    html = html.replace(
      navRe,
      `<nav class="voyage-deck-strip" aria-label="Ship decks">\n    ${renderVoyageDeckStripHtml()}\n    <a href="${voyageDirectoryHref()}">Directory</a>\n  </nav>`,
    );
  }
  fs.writeFileSync(target, html);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      directory: voyageDirectoryHref(),
      decks: VOYAGE_DECKS.map((d) => voyageDeckHref(d.slug)),
      cabins: VOYAGE_CABINS.map((c) => voyageCabinHref(c.slug)),
    },
    null,
    2,
  ),
);
