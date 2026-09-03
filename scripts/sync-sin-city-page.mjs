#!/usr/bin/env node
/** Generate Sin City experience page HTML from lib/sin-city-page.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSinCityPageHtml } from '../lib/sin-city-page.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'interfaces', 'voyage', 'deck-3-night.html');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, renderSinCityPageHtml(), 'utf8');
console.log(`sync-sin-city-page: wrote ${path.relative(ROOT, OUT)}`);
