#!/usr/bin/env node
/** Inject landing-like hero + golden path into Reading Room. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderReadingRoomHeroBlockHtml } from '../lib/experience-page-hero.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'interfaces', 'reading-room.html');
const START = '<!-- READING_ROOM_HERO_BEGIN -->';
const END = '<!-- READING_ROOM_HERO_END -->';

let html = fs.readFileSync(OUT, 'utf8');
const block = renderReadingRoomHeroBlockHtml();

if (!html.includes(START) || !html.includes(END)) {
  throw new Error('Reading Room hero markers missing');
}

const re = new RegExp(
  `${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
);
html = html.replace(re, `${START}\n  ${block}\n  ${END}`);

const heroCss = 'href="/interfaces/experience-page-hero.css"';
if (!html.includes('experience-page-hero.css')) {
  html = html.replace(
    'href="/interfaces/site-quicklinks.css"',
    `href="/interfaces/site-quicklinks.css" />\n  <link rel="stylesheet" ${heroCss}`,
  );
}
const phasesCss = 'href="/interfaces/experience-phases.css"';
if (!html.includes('experience-phases.css')) {
  html = html.replace(heroCss, `${heroCss} />\n  <link rel="stylesheet" ${phasesCss}`);
}

fs.writeFileSync(OUT, html, 'utf8');
console.log('sync-reading-room: hero + golden path patched');
