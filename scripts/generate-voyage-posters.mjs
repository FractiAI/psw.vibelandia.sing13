#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VOYAGE_CABINS, VOYAGE_DECKS } from '../lib/voyage-directory.mjs';
import {
  cabinAccent,
  cabinGlyph,
  deckAccent,
  deckGlyph,
  renderVoyagePosterSvg,
} from '../lib/voyage-posters.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'interfaces', 'assets', 'voyage');
fs.mkdirSync(OUT, { recursive: true });

const themes = [
  ...VOYAGE_DECKS.map((d) => ({
    slug: d.slug,
    kind: 'deck',
    title: d.label,
    subtitle: d.tags.split(' · ').slice(0, 3).join(' · '),
    glyph: deckGlyph(d.slug),
    accent: deckAccent(d.slug),
  })),
  ...VOYAGE_CABINS.map((c) => ({
    slug: c.slug,
    kind: 'cabin',
    title: c.skuDisplay,
    subtitle: c.name,
    glyph: cabinGlyph(c.slug),
    accent: cabinAccent(c.slug),
  })),
  {
    slug: 'voyage-map',
    kind: 'directory',
    title: 'Holographic Decks & Cabins',
    subtitle: 'Brochure §14–22 · Frontiersman Voyage',
    glyph: '◈',
    accent: '#d4af37',
  },
];

for (const theme of themes) {
  fs.writeFileSync(path.join(OUT, `${theme.slug}.svg`), renderVoyagePosterSvg(theme));
}

console.log(JSON.stringify({ ok: true, count: themes.length, dir: 'interfaces/assets/voyage/' }, null, 2));
