#!/usr/bin/env node
/** Generate Front Desk check-in program HTML from lib/front-desk-program.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FRONT_DESK_PROGRAM_TRACKS, renderFrontDeskProgramPageHtml } from '../lib/front-desk-program.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'interfaces', 'front-desk-check-in-program.html');

const html = renderFrontDeskProgramPageHtml();
fs.writeFileSync(OUT, html, 'utf8');
console.log(`sync-front-desk-program: wrote ${path.relative(ROOT, OUT)} (${FRONT_DESK_PROGRAM_TRACKS.length} tracks)`);
