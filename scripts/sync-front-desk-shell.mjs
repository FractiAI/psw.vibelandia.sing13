#!/usr/bin/env node
/** Inject landing-like hero + golden path into Front Desk check-in shell. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  renderFrontDeskGoldenPathHtml,
  renderFrontDeskHeroHtml,
} from '../lib/experience-page-hero.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'interfaces', 'front-desk.html');
const START = '<!-- FRONT_DESK_HERO_BEGIN -->';
const END = '<!-- FRONT_DESK_HERO_END -->';

let html = fs.readFileSync(OUT, 'utf8');
const block = `${renderFrontDeskHeroHtml()}\n  ${renderFrontDeskGoldenPathHtml()}`;

if (!html.includes(START) || !html.includes(END)) {
  throw new Error('Front Desk hero markers missing');
}

const re = new RegExp(
  `${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
);
html = html.replace(re, `${START}\n  ${block}\n  ${END}`);

const heroCss = 'href="/interfaces/experience-page-hero.css"';
if (!html.includes('experience-page-hero.css')) {
  html = html.replace(
    'href="/interfaces/experience-phases.css"',
    `href="/interfaces/experience-phases.css" />\n  <link rel="stylesheet" ${heroCss}`,
  );
}

fs.writeFileSync(OUT, html, 'utf8');
console.log('sync-front-desk-shell: hero + golden path patched');
