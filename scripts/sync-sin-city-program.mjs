#!/usr/bin/env node
/** Generate Sin City night program HTML from lib/sin-city-program.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SIN_CITY_PROGRAM_TRACKS, renderSinCityProgramPageHtml } from '../lib/sin-city-program.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'interfaces', 'sin-city-night-program.html');

const html = renderSinCityProgramPageHtml();
fs.writeFileSync(OUT, html, 'utf8');
console.log(`sync-sin-city-program: wrote ${path.relative(ROOT, OUT)} (${SIN_CITY_PROGRAM_TRACKS.length} tracks)`);
