#!/usr/bin/env node
/**
 * Generate journeys hub + detail pages; patch vercel.json rewrites.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VOYAGE_JOURNEYS,
  renderJourneyDetailHtml,
  renderJourneyHubHtml,
  journeyHref,
} from '../lib/voyage-journeys.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'interfaces');
const JOURNEY_DIR = path.join(OUT, 'journey');
const VERCEL = path.join(ROOT, 'vercel.json');

fs.mkdirSync(JOURNEY_DIR, { recursive: true });

fs.writeFileSync(path.join(OUT, 'journeys.html'), renderJourneyHubHtml());

for (const j of VOYAGE_JOURNEYS) {
  fs.writeFileSync(path.join(JOURNEY_DIR, `${j.slug}.html`), renderJourneyDetailHtml(j));
}

const vercel = JSON.parse(fs.readFileSync(VERCEL, 'utf8'));
const rewrites = vercel.rewrites.filter((r) => {
  const src = r.source;
  if (src === '/journey' || src === '/journey/') return false;
  if (src.startsWith('/journey/') && !src.includes(':')) return false;
  return true;
});

const journeyRewrites = [
  { source: '/journey', destination: '/interfaces/journeys.html' },
  { source: '/journey/', destination: '/interfaces/journeys.html' },
];

for (const j of VOYAGE_JOURNEYS) {
  const dest = `/interfaces/journey/${j.slug}.html`;
  journeyRewrites.push(
    { source: journeyHref(j.slug), destination: dest },
    { source: `${journeyHref(j.slug)}/`, destination: dest },
  );
}

const insertAt = rewrites.findIndex((r) => r.source === '/library');
const head = insertAt >= 0 ? rewrites.slice(0, insertAt) : rewrites;
const tail = insertAt >= 0 ? rewrites.slice(insertAt) : [];
vercel.rewrites = [...head, ...journeyRewrites, ...tail];

fs.writeFileSync(VERCEL, `${JSON.stringify(vercel, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      ok: true,
      hub: 'interfaces/journeys.html',
      details: VOYAGE_JOURNEYS.map((j) => ({ slug: j.slug, file: `interfaces/journey/${j.slug}.html` })),
      rewrites: journeyRewrites.length,
    },
    null,
    2,
  ),
);
