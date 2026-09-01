#!/usr/bin/env node
/** Generate Reading Room concert program HTML from lib/reading-room-program.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { READING_ROOM_PROGRAM_TRACKS, renderReadingRoomProgramPageHtml } from '../lib/reading-room-program.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'interfaces', 'reading-room-concert-program.html');

const html = renderReadingRoomProgramPageHtml();
fs.writeFileSync(OUT, html, 'utf8');
console.log(`sync-reading-room-program: wrote ${path.relative(ROOT, OUT)} (${READING_ROOM_PROGRAM_TRACKS.length} tracks)`);
