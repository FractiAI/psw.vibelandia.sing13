#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMeetTheCrewPageHtml } from '../lib/spirit-crew.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'interfaces', 'meet-the-crew.html');

fs.writeFileSync(TARGET, renderMeetTheCrewPageHtml());
console.log(JSON.stringify({ ok: true, file: 'interfaces/meet-the-crew.html' }, null, 2));
